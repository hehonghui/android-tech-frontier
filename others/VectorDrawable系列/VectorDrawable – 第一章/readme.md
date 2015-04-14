VectorDrawable-第一章
---

>
* 原文链接:[VectorDrawables – Part 1](https://blog.stylingandroid.com/vectordrawables-part-1/)
* 译者 :  [jianghejie](https://github.com/jianghejie) 
* 译者博文链接 :  [jcodecraeer.com](http://jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0201/2396.html)
 

Lollipop中有一个非常好的新特性是VectorDrawable以及相关的一些类，他们为我们提供了添加复杂矢量图形的强大功能，同时也提供了动画显示这些图形的方法。矢量图形的好处是放大不会失真，可以适应不同分辨率的屏幕。这个文章系列我们将了解这些类以及它们的优点，以及如何用相对较少的代码实现吸引人的效果。

 

 简单的来说，矢量图形就是使用几何形状的方式来描述一个图像元素。矢量图形非常适合于与设备无关的简单或者合成的制图或者不需要实现真实感的场合。Adobe Illustrator和Inkscape 常用来制作矢量图形。而位图（Bitmap ），则完全相反，位图是定义每一个像素点的颜色来显示一张图片，它适合显示一张真实的照片。矢量图形的一大好处是它的渲染是在运行时开始的，因此它可以自适应不同的屏幕。由于矢量图其实保存的只是描述几何图形的文本，因此它只占用非常少的空间。当然因为需要在运行时将这些字符串转换成图像，花费多一点点的cpu是肯定的。

 

矢量图形在安卓的Lollipop中已经实现了，相关的类就是VectorDrawable 。（虽然第三方的MrVector 已经实现了VectorDrawable 兼容Lollipop 之前的设备，但是它并没有实现后面会讲到的AnimatedVectorDrawable ）。VectorDrawable 的出现意味着以前我们放在mdpi, hdpi, xhdpi, xxhdpi中的部分图片资源（适合用矢量图描述的，比如图标）只用一个VectorDrawable 替代就可以了。

为了说明，我找了下面这张svg文件（这个文件可以从library for displaying SVG graphics in Android 中获取到），图片是一个机器人 ：

![](https://blog.stylingandroid.com/wp-content/uploads/2014/12/android.svg)
这个文件的svg格式只有2265字节，但是如果我们将它转换成500 x 500的bitmap文件，保存成png格式，则有13272 字节。并且它可以自动伸缩为任意大小的图片，而位图就需要使用多张才能达到不同分辨率的效果。不过，这里以svg作为例子还是有点问题，因为svg并非VectorDrawable，所以我们不能直接使用svg图片。但是VectorDrawable 支持svg的一部分规则，我们可以将svg中的某些数据用在VectorDrawable中。主要其实就是svg中定义path的那部分数据。Svg的path类似于android.graphics.Path api，只不过是用字符串定义的，我们看看svg的源码就知道了：
```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 13.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 14948)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="500px" height="500px" viewBox="0 0 500 500" enable-background="new 0 0 500 500" xml:space="preserve">
<g id="max_width__x2F__height" display="none">
    <path display="inline" d="M499.001,1v498H1V1H499.001 M500.001,0H0v500h500.001V0L500.001,0z"/>
</g>
<g id="androd">
    <path fill="#9FBF3B" d="M301.314,83.298l20.159-29.272c1.197-1.74,0.899-4.024-0.666-5.104c-1.563-1.074-3.805-0.543-4.993,1.199
        L294.863,80.53c-13.807-5.439-29.139-8.47-45.299-8.47c-16.16,0-31.496,3.028-45.302,8.47l-20.948-30.41
        c-1.201-1.74-3.439-2.273-5.003-1.199c-1.564,1.077-1.861,3.362-0.664,5.104l20.166,29.272
        c-32.063,14.916-54.548,43.26-57.413,76.34h218.316C355.861,126.557,333.375,98.214,301.314,83.298"/>
    <path fill="#FFFFFF" d="M203.956,129.438c-6.673,0-12.08-5.407-12.08-12.079c0-6.671,5.404-12.08,12.08-12.08
        c6.668,0,12.073,5.407,12.073,12.08C216.03,124.03,210.624,129.438,203.956,129.438"/>
    <path fill="#FFFFFF" d="M295.161,129.438c-6.668,0-12.074-5.407-12.074-12.079c0-6.673,5.406-12.08,12.074-12.08
        c6.675,0,12.079,5.409,12.079,12.08C307.24,124.03,301.834,129.438,295.161,129.438"/>
    <path fill="#9FBF3B" d="M126.383,297.598c0,13.45-10.904,24.354-24.355,24.354l0,0c-13.45,0-24.354-10.904-24.354-24.354V199.09
        c0-13.45,10.904-24.354,24.354-24.354l0,0c13.451,0,24.355,10.904,24.355,24.354V297.598z"/>
    <path fill="#9FBF3B" d="M140.396,175.489v177.915c0,10.566,8.566,19.133,19.135,19.133h22.633v54.744
        c0,13.451,10.903,24.354,24.354,24.354c13.451,0,24.355-10.903,24.355-24.354v-54.744h37.371v54.744
        c0,13.451,10.902,24.354,24.354,24.354s24.354-10.903,24.354-24.354v-54.744h22.633c10.569,0,19.137-8.562,19.137-19.133V175.489
        H140.396z"/>
    <path fill="#9FBF3B" d="M372.734,297.598c0,13.45,10.903,24.354,24.354,24.354l0,0c13.45,0,24.354-10.904,24.354-24.354V199.09
        c0-13.45-10.904-24.354-24.354-24.354l0,0c-13.451,0-24.354,10.904-24.354,24.354V297.598z"/>
</g>
</svg>
```
看起来很乱，我们不需要知道其内部的细节，只把我们用得着的东西筛选出来就行了。<svg> 标签中定义了一些属性：画布以及视图区域大小为500 x 500 px，然后有一个<g>标签，里面定义了一个描边，忽略掉就是了。再后又是一个<g>标签，这个标签的id为“android”，这部分里面的东西才是机器人logo自身的数据，也是我们需要的数据。它包含了6个<path> 元素，分别定义head、左眼、右眼、左手、身体和脚、右手。每一个path中的fill 属性定义填充色（可以看到，除了眼睛为白色之外，所有的填充色都是绿色），fill属性之后是包含path数据的属性d。想了解d属性中数据定义的可以参考SVG Path Specification ，但是这个不重要，因为我们只需简单的把这里面的数据直接用在VectorDrawable中就可以了。

好了，我们来创建一个VectorDrawable：
```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:viewportWidth="500"
    android:viewportHeight="500"
    android:width="500px"
    android:height="500px">
    <group android:name="android">
        <path
            android:name="head"
            android:fillColor="#9FBF3B"
            android:pathData="M301.314,83.298l20.159-29.272c1.197-1.74,0.899-4.024-0.666-5.104c-1.563-1.074-3.805-0.543-4.993,1.199L294.863,80.53c-13.807-5.439-29.139-8.47-45.299-8.47c-16.16,0-31.496,3.028-45.302,8.47l-20.948-30.41c-1.201-1.74-3.439-2.273-5.003-1.199c-1.564,1.077-1.861,3.362-0.664,5.104l20.166,29.272c-32.063,14.916-54.548,43.26-57.413,76.34h218.316C355.861,126.557,333.375,98.214,301.314,83.298" />
        <path
            android:name="left_eye"
            android:fillColor="#FFFFFF"
            android:pathData="M203.956,129.438c-6.673,0-12.08-5.407-12.08-12.079c0-6.671,5.404-12.08,12.08-12.08c6.668,0,12.073,5.407,12.073,12.08C216.03,124.03,210.624,129.438,203.956,129.438" />
        <path
            android:name="right_eye"
            android:fillColor="#FFFFFF"
            android:pathData="M295.161,129.438c-6.668,0-12.074-5.407-12.074-12.079c0-6.673,5.406-12.08,12.074-12.08c6.675,0,12.079,5.409,12.079,12.08C307.24,124.03,301.834,129.438,295.161,129.438" />
        <path
            android:name="left_arm"
            android:fillColor="#9FBF3B"
            android:pathData="M126.383,297.598c0,13.45-10.904,24.354-24.355,24.354l0,0c-13.45,0-24.354-10.904-24.354-24.354V199.09c0-13.45,10.904-24.354,24.354-24.354l0,0c13.451,0,24.355,10.904,24.355,24.354V297.598z" />
        <path
            android:name="body"
            android:fillColor="#9FBF3B"
            android:pathData="M140.396,175.489v177.915c0,10.566,8.566,19.133,19.135,19.133h22.633v54.744c0,13.451,10.903,24.354,24.354,24.354c13.451,0,24.355-10.903,24.355-24.354v-54.744h37.371v54.744c0,13.451,10.902,24.354,24.354,24.354s24.354-10.903,24.354-24.354v-54.744h22.633c10.569,0,19.137-8.562,19.137-19.133V175.489H140.396z" />
        <path
            android:name="right_arm"
            android:fillColor="#9FBF3B"
            android:pathData="M372.734,297.598c0,13.45,10.903,24.354,24.354,24.354l0,0c13.45,0,24.354-10.904,24.354-24.354V199.09c0-13.45-10.904-24.354-24.354-24.354l0,0c-13.451,0-24.354,10.904-24.354,24.354V297.598z" />
    </group>
</vector>
```
我们创建一个<vector> 元素，指定了宽和高，然后创建包含了6个<path>元素的<group>元素。这6个<path>元素的定义非常类似svg中的定义，只有非常小的差别，大部分内容都是直接从svg中copy的。我们还定义了name 属性来描述每个path的作用。这个文件保存下来仍然只有2412字节。

下面我们可以就像一般drawable一样去使用上面定义的VectorDrawable了。
```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingLeft="@dimen/activity_horizontal_margin"
    android:paddingRight="@dimen/activity_horizontal_margin"
    android:paddingTop="@dimen/activity_vertical_margin"
    android:paddingBottom="@dimen/activity_vertical_margin"
    tools:context=".VectorDrawablesActivity">
 
    <ImageView
        android:id="@+id/android"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/android"
        android:contentDescription="@null" />
 
</RelativeLayout>
```
运行结果如下：

 ![](http://jcodecraeer.com/uploads/20150201/1422796393485613.png)

有一个小问题：这个VectorDrawable渲染的非常好，但是我遇到过从其他的svg文件中复制的VectorDrawable 在Android Studio中无法预览的情况（在真实设备中运行却是正常的），因此不管Android Studio是否能正常预览，还是以真实设备为准吧，Android Studio是有bug的。我用的是V1.0.2 版本，关于这个bug在这里有描述：[点击这里](https://code.google.com/p/android/issues/detail?id=91383)  。

现在我们可以使用VectorDrawable大幅度的减小我们的apk了，而且这还让我们在维护app的时候容易的多，至少在使用VectorDrawable的资源上我们不需要因为要兼容新的设备而修改。这还只是VectorDrawable的一个用处，在后面的文章中我们将看到VectorDrawable是如何动画的。

这篇文章的代码可以在这里得到：[这里](https://bitbucket.org/StylingAndroid/vectordrawables/src/b4767fe0e0a7b41323adbfd77845ed1ec24822c3/?at=Part1)。

 

英文原文：https://blog.stylingandroid.com/vectordrawables-part-1/  