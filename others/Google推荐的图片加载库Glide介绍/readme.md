Google推荐的图片加载库Glide介绍
---

>
* 原文链接:[Google推荐的图片加载库Glide介绍](http://inthecheesefactory.com/blog/get-to-know-glide-recommended-by-google/en)
* 作者 : [nuuneoi](http://inthecheesefactory.com/)
* 译者 :  [jianghejie](https://github.com/jianghejie) 
* 校对者 : [chaossss](https://github.com/chaossss)
* 状态 : 完成
 

在泰国举行的谷歌开发者论坛上，谷歌为我们介绍了一个名叫 [Glide](https://github.com/bumptech/glide) 的图片加载库，作者是bumptech。这个库被广泛的运用在google的开源项目中，包括2014年google I/O大会上发布的官方app。

毫无疑问，这个库引起了我的兴趣。于是我花了一个晚上研究和把玩它，将它的实现原理分析清楚以后，我决定写一篇博文分享一些自己的经验。在开始之前我想说，Glide和Picasso有90%的相似度，准确的说，我觉得它就像 Picasso 的克隆体。

不管怎样，Glide 和 Picasso在细节上还是有不少区别的，接下来我会让你们了解到其中的差异。

##导入库

Picasso和Glide都在jcenter上。在项目中添加依赖非常简单：
Picasso
```gradle
dependencies {
    compile 'com.squareup.picasso:picasso:2.5.1'
}
```
Glide
```gradle
dependencies {
    compile 'com.github.bumptech.glide:glide:3.5.2'
    compile 'com.android.support:support-v4:22.0.0'
}
```
不管怎样，Glide 需要 Android Support Library v4 包，千万不要忘了像上面的代码做的那样添加 Android Support Library v4 包的依赖。不过这都不是什么大问题，因为现在 Android Support Library v4 基本是每一个新 Android 项目的标配了。

##基础

就如我所说的Glide和Picasso非常相似，Glide加载图片的方法和Picasso如出一辙。

Picasso
```java
Picasso.with(context)
    .load("http://inthecheesefactory.com/uploads/source/glidepicasso/cover.jpg")
    .into(ivImg);
```
Glide

```java
Glide.with(context)
    .load("http://inthecheesefactory.com/uploads/source/glidepicasso/cover.jpg")
    .into(ivImg);
```
虽然两者看起来非常相似，但是 Glide 的代码无疑设计得更好，因为 Glide 的 with() 方法不光接受 Context，还接受 Activity 和 Fragment。此外，with() 方法还能自动地从你放入的各种东西里面提取出 Context，供它自己使用。

![](http://jcodecraeer.com/uploads/20150327/1427445293711143.png)

同 时将Activity/Fragment作为with()参数的好处是：图片加载会和Activity/Fragment的生命周期保持一致，比如 Paused状态在暂停加载，在Resumed的时候又自动重新加载。所以我建议传参的时候传递Activity 和 Fragment给Glide，而不是Context。

##默认Bitmap格式是RGB_565

下面是加载图片时和Picasso的比较（1920x1080 像素的图片加载到768x432的ImageView中）

![](http://jcodecraeer.com/uploads/20150327/1427445293137409.jpg)

可以看到Glide加载的图片质量要差于Picasso（ps：我看不出来哈），为什么？这是因为Glide默认的Bitmap格式是RGB_565 ，比ARGB_8888格式的内存开销要小一半。下面是Picasso在ARGB8888下与Glide在RGB565下的内存开销图（应用自身占用了8m，因此以8为基准线比较）：

![](http://jcodecraeer.com/uploads/20150327/1427445293965030.png)

如果你觉得 Glide 在默认的 RGB_565 格式下加载的图片质量可以接受的话，可以什么都不做。但如果你觉得难以接受，或者是你的实际需求对图片的质量有更高的要求的话，你可以像下面的代码那样创建一个 GlideModule 子类，把 Bitmap 的格式转换到 ARGB_8888：

```java
 public class GlideConfiguration implements GlideModule {
  
    @Override
    public void applyOptions(Context context, GlideBuilder builder) {
        // Apply options to the builder here.
        builder.setDecodeFormat(DecodeFormat.PREFER_ARGB_8888);
    }
  
    @Override
    public void registerComponents(Context context, Glide glide) {
        // register ModelLoaders here.
    }
}
```
然后在AndroidManifest.xml中将GlideModule定义为meta-data

```java
<meta-data android:name="com.inthecheesefactory.lab.glidepicasso.GlideConfiguration"
            android:value="GlideModule"/>
```
![](http://jcodecraeer.com/uploads/20150327/1427445294447874.jpg)

这样看起来就会好很多。

我们再来看看内存开销图，虽然看起来这次 Glide 的内存开销接近于上次的两倍，但是Picasso的内存开销仍然远大于Glide。

![](http://jcodecraeer.com/uploads/20150327/1427445294918728.png)

但是上面那样做的问题在于你需要手动计算 ImageView 的尺寸，又或者是你对 ImageView 设置了具体的尺寸大小，为了解决这样的麻烦，你可以在 Picasso 中通过这样做简化你的代码：

```java
Picasso.with(this)
    .load("http://nuuneoi.com/uploads/source/playstore/cover.jpg")
    .resize(768, 432)
    .into(ivImgPicasso);
```
但是问题在于你需要主动计算ImageView的大小，或者说你的ImageView大小是具体的值（而不是wrap_content），你也可以这样：

```java
Picasso.with(this)
    .load("http://nuuneoi.com/uploads/source/playstore/cover.jpg")
    .fit()
    .centerCrop()
    .into(ivImgPicasso);
```
现在Picasso的内存开销就和Glide差不多了。

![](http://jcodecraeer.com/uploads/20150327/1427445294433243.png)

虽然内存开销差距不大，但是在这个问题上Glide完胜Picasso。因为Glide可以自动计算出任意情况下的ImageView大小。
##Image质量的细节

这是将ImageView还原到真实大小时的比较。
![](http://jcodecraeer.com/uploads/20150327/1427445294704430.png)

很显然，Glide 加载的图片有些像素点变得很模糊，看起来也没有 Picasso 那么平滑。而且直到现在，我也没有找到一个可以直观改变图片大小调整算法的方法。

但是这并不算什么坏事，因为很难察觉。


##磁盘缓存

Picasso和Glide在磁盘缓存策略上有很大的不同。我们刚刚做了一个使用 Glide 和 Picasso 加载同一张高清图片的实验，我在实验后检查缓存目录时发现： Glide 缓存的图片和 ImageView 的尺寸相同，而 Picasso 缓存的图片和原始图片的尺寸相同。

![](http://jcodecraeer.com/uploads/20150327/1427445294110987.jpg)

上面提到的平滑度的问题依然存在，而且如果加载的是RGB565图片，那么缓存中的图片也是RGB565。

我 尝试将ImageView调整成不同大小，但不管大小如何Picasso只缓存一个全尺寸的。Glide则不同，它会为每种大小的ImageView缓存 一次。尽管一张图片已经缓存了一次，但是假如你要在另外一个地方再次以不同尺寸显示，需要重新下载，调整成新尺寸的大小，然后将这个尺寸的也缓存起来。

具体说来就是：假如在第一个页面有一个200x200的ImageView，在第二个页面有一个100x100的ImageView，这两个ImageView本来是要显示同一张图片，却需要下载两次。

不过，你可以改变这种行为，让Glide既缓存全尺寸又缓存其他尺寸：

```java
Glide.with(this)
     .load("http://nuuneoi.com/uploads/source/playstore/cover.jpg")
     .diskCacheStrategy(DiskCacheStrategy.ALL)
     .into(ivImgGlide);
```
下次在任何ImageView中加载图片的时候，全尺寸的图片将从缓存中取出，重新调整大小，然后缓存。

Glide的这种方式优点是加载显示非常快。而Picasso的方式则因为需要在显示之前重新调整大小而导致一些延迟，即便你添加了这段代码来让其立即显示：
```java
//Picasso
.noFade();
```
![](http://jcodecraeer.com/uploads/allimg/150327/163Aa632-0.gif)

Picasso 和 Glide 在磁盘缓存策略上各有所长，你应该根据自己的需求选择最合适的。

对我而言，我更喜欢Glide，因为它远比Picasso快，虽然需要更大的空间来缓存。
##特性

你可以做到几乎和Picasso一样多的事情，代码也几乎一样。

Image Resizing
```java
// Picasso
.resize(300, 200);
  
// Glide
.override(300, 200);
```

Center Cropping
```java
// Picasso
.centerCrop();
  
// Glide
.centerCrop();
```

Transforming
```java
// Picasso
.transform(new CircleTransform())
  
// Glide
.transform(new CircleTransform(context))
```
设置占位图或者加载错误图：
```java
// Picasso
.placeholder(R.drawable.placeholder)
.error(R.drawable.imagenotfound)
  
// Glide
.placeholder(R.drawable.placeholder)
.error(R.drawable.imagenotfound)
```

正如我在博文开头所说，如果你已经熟悉如何使用 Picasso，那从Picasso转换到Glide对你来说就是小菜一碟。

 
##有什么Glide可以做而Picasso 做不到

Glide可以加载GIF动态图，而Picasso不能。

![](http://jcodecraeer.com/uploads/20150327/1427445366503084.gif)


同时因为Glide和Activity/Fragment的生命周期是一致的，因此gif的动画也会自动的随着Activity/Fragment的状态暂停、重放。Glide 的缓存在gif这里也是一样，调整大小然后缓存。

但是从我的一次测试结果来看，用 Glide 显示动画会消耗很多内存，因此谨慎使用。

除了gif动画之外，Glide还可以将任意本地视频解码成一张静态图片。

还有一个特性是你可以配置图片显示的动画，而Picasso只有一种动画：fading in。

最后一个是可以使用thumbnail()产生一个你所加载图片的thumbnail。

其实还有一些特性，不过不是非常重要，比如将图像转换成字节数组等。
配置

有许多可以配置的选项，比如大小，缓存的磁盘位置，最大缓存空间，位图格式等等。可以在这个页面查看这些配置 Configuration 。

##库的大小

Picasso (v2.5.1)的大小约118kb，而Glide (v3.5.2)的大小约430kb。

![](http://jcodecraeer.com/uploads/20150327/1427453389115686.png)

不过312kb的差距并不是很重要。

Picasso和Glide的方法个数分别是840和2678个。

![](http://jcodecraeer.com/uploads/20150327/1427453390188737.png)

必须指出，对于DEX文件65535个方法的限制来说，2678是一个相当大的数字了。建议在使用Glide的时候开启ProGuard。


##总结

Glide和Picasso都是非常完美的库。Glide加载图像以及磁盘缓存的方式都要优于Picasso，速度更快，并且Glide更有利于减少OutOfMemoryError的发生，GIF动画是Glide的杀手锏。不过Picasso的图片质量更高。你更喜欢哪个呢？

虽然我使用了很长时间的Picasso，但是我得承认现在我更喜欢Glide。我的建议是使用Glide，但是将Bitmap格式换成 ARGB_8888、让Glide缓存同时缓存全尺寸和改变尺寸两种。

 
##相关资源

- [Glide 3.0: a media management library for Android](http://google-opensource.blogspot.com/2014/09/glide-30-media-management-library-for.html) 
- [Glide Wiki](https://github.com/bumptech/glide/wiki) 
- [Android Picasso vs Glide](http://pluu.github.io/android%20study/2015/01/15/android-glide-picasso/) 
- [Android: Image loading libraries Picasso vs Glide](http://vardhan-justlikethat.blogspot.com/2014/09/android-image-loading-libraries-picasso.html) 

