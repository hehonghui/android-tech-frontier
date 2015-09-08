
#Tinting drawables

---

> * 原文链接 : [Tinting drawables](http://andraskindler.com/blog/2015/tinting_drawables/)
* 原文作者 : [Andras Kindler](http://andraskindler.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 : 完成



这篇文章主要介绍如何根据当前主题来给drawables和bitmaps配色。
当设计[Ready](https://play.google.com/store/apps/details?id=com.ready.android)这款应用主题模块的时候,我们想通过一种方式不仅仅是改变基础色还要改变图标和其它drawables。常规的方法就是对每种颜色提供一套图片，在切换主题的时候切换图标-需要写大量的代码并且会增加apk的体积。我们也想在以后添加颜色的时候简单方便，不至于总创建新的资源文件。



##DrawableCompat


在谷歌发布的v4库中介绍了[DrawableCompat](https://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html)类，展示了针对Lollipop版本以前的绘图能力。这是一套非常成熟的API.甚至还支持绘制图像list,和绘制RTL布局镜像,但是对于我们的场景来说它太重了，并且你还得使用`wrap()`方法wrap当前Drawable。


##TintedBitmapDrawable介绍


所以我们通过我们自己的实现，实现了一个轻量级的**TintedBitmapDrawable**,它是[BitmapDrawable](http://developer.android.com/reference/android/graphics/drawable/BitmapDrawable.html)的子类，我们重写了`draw()`方法部分，在我们所关心的绘制部使用了[LightingColorFilter](http://developer.android.com/reference/android/graphics/LightingColorFilter.html)，它只有三个方法，所以在方法的数量不会让人太过注意。
要绘制的颜色可以通过两个构造函数指明或者使用`setTint()`方法。


```java

public final class TintedBitmapDrawable extends BitmapDrawable {
  private int tint;
  private int alpha;

  public TintedBitmapDrawable(final Resources res, final Bitmap bitmap, final int tint) {
    super(res, bitmap);
    this.tint = tint;
    this.alpha = Color.alpha(tint);
  }

  public TintedBitmapDrawable(final Resources res, final int resId, final int tint) {
    super(res, BitmapFactory.decodeResource(res, resId));
    this.tint = tint;
    this.alpha = Color.alpha(tint);
  }

  public void setTint(final int tint) {
    this.tint = tint;
    this.alpha = Color.alpha(tint);
  }

  @Override public void draw(final Canvas canvas) {
    final Paint paint = getPaint();
    if (paint.getColorFilter() == null) {
      paint.setColorFilter(new LightingColorFilter(tint, 0));
      paint.setAlpha(alpha);
    }
    super.draw(canvas);
  }
}

```

像这样来使用:

```java

tintedDrawable = new TintedBitmapDrawable(resources, R.drawable.ic_arrow_back_white_24dp, Color.GREEN);

```

##Benefits and tips


* 对于白色的图片和透明的颜色都有效。
* 不需要根据主题提供相应图片，减小了APK的占用空间。
* 完美适配Google’s[material icon pack](https://www.google.com/design/icons/)只需下载white .png版本就可以对其相应的处理。
* 对于[Palette](https://developer.android.com/reference/android/support/v7/graphics/Palette.html)库也进了完美的适配
* 如果使用item列表会对drawables进行缓存
* 如果使用代码的形式代替menu.xml那么也适用于TooBar
* 使用StateListDrawable对同一张图片进行不同颜色的状态改变，缩小了APK的体积。