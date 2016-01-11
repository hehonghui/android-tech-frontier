安卓的模糊视图
---

>
* 原文链接 : [A Blurring View for Android](http://developers.500px.com/2015/03/17/a-blurring-view-for-android.html)
* 作者 : [Jun Luo](https://500px.com/junluo)
* 译者 : [lvtea0105](https://github.com/lvtea0105) 
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)  
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :   校对完成




模糊效果可以生动地表现出内容的层次感，当使用者关注重点内容，即便在模糊表面之下发生视差效果或者动态改变，也能够保持当前背景。   

在IOS设备中，我们首先构造一个UIVisualEffectView,之后添加 visualEffectView 到view层，在view中可以进行动态的模糊。

```java
UIVisualEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];

UIVisualEffectView *visualEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
```

## 安卓中的表现形式

我们在雅虎天气APP中确实看到了很好的模糊效果实例，但是根据 [Nicholas Pomepuy 的博客帖子](http://nicolaspomepuy.fr/blur-effect-for-android-design/)，然而，这个 App 是通过缓存一张预渲染的背景图片来实现图片虚化的。

虽然这种方法非常有效，但是确实不符合我们的需求，在 [500px](https://500px.com/) 的APP中，图像通常是获得焦点的内容，而不仅仅是提供背景，这说明图像的变化很大且迅速，即便他们是在模糊层之下。在我们的[安卓APP](https://play.google.com/store/apps/details?id=com.fivehundredpx.viewer) 中即是一个恰当的例子：当用户滑动至下一页时，整排图片会以相反方向淡出，为了组成所需的模糊效果，适当地管理多个预渲染图是困难的。

![](http://developers.500px.com/images/2015-03-17-500px-android-tour-blurring.png)

## 一种绘制模糊视图的方法 ##

我们需要的效果是，实时地模糊其下的视图，最终需要给界面的是模糊视图的一个 blurred view 引用。

```java
blurringView.setBlurredView(blurredView);
```

之后当blurred view 改变时，不管是因为内容改变（比如呈现新的图片）、view的变换还是处在动画过程，我们都要刷新 blurring view。

```java
blurringView.invalidate();
```

为了实现 blurring view, 我们需要继承 view类并重写 onDraw()方法来渲染模糊效果。

```java
protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);

    // Use the blurred view’s draw() method to draw on a private canvas.
    mBlurredView.draw(mBlurringCanvas);

    // Blur the bitmap backing the private canvas into mBlurredBitmap
    blur();

    // Draw mBlurredBitmap with transformations on the blurring view’s main canvas.
    canvas.save();
    canvas.translate(mBlurredView.getX() - getX(), mBlurredView.getY() - getY());
    canvas.scale(DOWNSAMPLE_FACTOR, DOWNSAMPLE_FACTOR);
    canvas.drawBitmap(mBlurredBitmap, 0, 0, null);
    canvas.restore();
}
```

这里的关键点在于，当模糊视图重绘时，它使用blurred view 的draw()方法，模糊视图保持blurred view的引用，它绘制一个私有的，以bitmap作为背景的画布。

```java
mBlurredView.draw(mBlurringCanvas);
```

这种使用另一个视图的 draw（）方法，也适用于建立放大或者个性的UI界面，在其中，放大区域的内容是扩大的，而不是模糊的。

根据 [Nicholas Pomepuy 讨论](http://nicolaspomepuy.fr/blur-effect-for-android-design/) 的想法，我们使用子采样和 [渲染脚本](http://developer.android.com/guide/topics/renderscript/compute.html) 进行快速绘制，当初始化blurring view的私有画布mBlurringCanvas 后，子采样就已经完成了。

```java
int scaledWidth = mBlurredView.getWidth() / DOWNSAMPLE_FACTOR;
int scaledHeight = mBlurredView.getHeight() / DOWNSAMPLE_FACTOR;

mBitmapToBlur = Bitmap.createBitmap(scaledWidth, scaledHeight, Bitmap.Config.ARGB_8888);
mBlurringCanvas = new Canvas(mBitmapToBlur);
```

通过mBlurringCanvas的 建立与恰当的渲染脚本初始化，重绘时的blur()方法如下：

```java
mBlurInput.copyFrom(mBitmapToBlur);
mBlurScript.setInput(mBlurInput);
mBlurScript.forEach(mBlurOutput);
mBlurOutput.copyTo(mBlurredBitmap);
```

此时 mBlurredBitmap 已准备好，剩下的就是使用适当的变换和缩放，在blurring view自己的画布上重绘视图。

## 实现细节

完整实现blurring view 时，我们需要注意几个技术点：

一：我们发现缩放因子8，模糊半径15 很好地满足我们的目标，但满足你需求的参数可能是不同的。

二：在模糊的bitmap边缘会遇到一些渲染脚本效果，我们将缩放的宽度和高度进行了圆角化，直到最近的4的倍数。

```java
// The rounding-off here is for suppressing RenderScript artifacts at the edge.
scaledWidth = scaledWidth - (scaledWidth % 4) + 4;
scaledHeight = scaledHeight - (scaledHeight % 4) + 4;
```

三：为了保证更好的表现效果，我们新建两个bitmap对象——mBitmapToBlur 和 mBlurredBitmap ，
mBitmapToBlur 位于私有画布mBlurringCanvas 之下， mBlurredBitmap 仅当blurred view的大小变化时才重新建立他们；
同样地当blurred view的大小改变时，我们才创建渲染脚本对象mBlurInput 和 mBlurOutput。

四：我们以with PorterDuff.Mode.OVERLAY 模式绘制一个白色半透明的层，它处在被模糊的的图片上层。用来处理设计需求中的淡化。

最后，因为RenderScript（渲染脚本）至少在API 17 上才可用，我们需要降低旧版本的安卓，糟糕的是，[Nicholas Pomepuy帖子](http://nicolaspomepuy.fr/blur-effect-for-android-design/) 中提到的Java bitmap的模糊方法，当恰当地预渲染缓存副本时，对于实时渲染不够迅速，我们所做的是使用一个半透明的view作为回调。(更新于2015年3月23日：通过使用 [RenderScript 库](http://android-developers.blogspot.ca/2013/09/renderscript-in-android-support-library.html)，我的解决方法能在更低版本的 API 中运行。下面提及的库和 Demo 都更新了，非常感谢 GitHub 上的小伙伴 [panzerdev](https://github.com/panzerdev) 告诉我这一点）

## 优点和缺点

我们喜欢这个view的绘制方法，因为它可以实时模糊并且容易使用，使得blurred view 的内容，也在blurring view 和blurred view中间保证了灵活性，最重要的是，它满足了我们的需求

这个方法确实使得blurring view 与适当协同变换的 blurred view 保持了私有联系，相关地，模糊视图必须不能是blurred view的子类，否则会因为互相调用造成堆栈溢出。简单有效处理此限制的方法是要保证模糊视图与blurred view 在同级，并且Z轴次序上 blurred view 在blurring view 之前。

另一点需要注意的限制是，由于与 矢量图形和文本 有关，我们默认的bitmap削减采样表现效果不是很好。

## 库文件和示例

你可以在我们的安卓 [APP](https://play.google.com/store/apps/details?id=com.fivehundredpx.viewer) 上看到解决方法，我们也把开源的库文件连同一个示例分享到了 [github](https://github.com/500px/500px-android-blur)，它能够展示内容变换、动画和视图变换。

![](https://github.com/500px/500px-android-blur/raw/master/blurdemo.gif)

有关这个效果在 [HackNews](https://news.ycombinator.com/item?id=9219097) 中的讨论