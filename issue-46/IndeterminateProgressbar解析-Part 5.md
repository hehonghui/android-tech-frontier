IndeterminateProgressbar解析-Part 5
---

> * 原文链接 : [Indeterminate – Part 5](https://blog.stylingandroid.com/indeterminate-part-5/)
* 原文作者 : [Mark Allison](blog.stylingandroid.com)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 



IndeterminateProgressBar 能在用户进行某项不定时长的耗时操作时提供绝佳的用户体验，之前我有教过大家怎么创建[水平的 IndeterminateProgressBar](http://blog.csdn.net/u012403246/article/details/49582789)，今天我就来教大家实现圆形的 IndeterminateProgressBar，这个控件将支持 API 11（Honeycomb）以上的设备。

We’re edging closer to get our material-like circular indeterminate drawable working, we just need to fine tune our Interpolators to get closer to what the Lollipop+ implementation is doing. The trick for doing that it to use something that I mentioned earlier in the series PathInterpolatorCompat.

圆形 IndeterminateProgressbar 控件我们已经完成得差不多了，现在只需要将上一篇博文的代码中使用的插值器修改为 Android Lollipop+ 实现中的插值器就可以在低版本设备中复现该控件，而完成这一部分工作要用到的就是之前提到过的 PathInterpolatorCompat 类。

PathInterpolatorCompat is part of the part of the v4 support library and we already have this included in our project because the design support library depends on it. It works in much the same way as the PathInterpolator which we looked at back in – it maps an input value of x to its corresponding y value based upon a a path drawn from 0,0, to 1,1. However rather than using SVG path data like PathInterpolator does, it actually uses android.graphics.Path instead!

PathInterpolatorCompat 是 Android Support v4 库中的一部分，因为我们已经在本项目中添加了相关的依赖，所以直接调用它就可以。它的实际作用和 PathInterpolator 相似 - 将输入的 x 值按照给定的函数关系给出对应的映射值 y，该函数的 x 和 y 取值范围在 [0.0, 1.0]之间。它和 PathInterpolator 的区别在于：前者使用 android.graphics.Path，后者使用 SVG 路径数据。

So let’s have a look at how we can do this. The SVG path data that we looked at in the Lollipop+ implementation is actually divided in to to parts: a straight line, and a cubic bezier. Path supports both of these so we just need to map thing appropriately:

那不妨来看看具体的实现吧，在 Android Lollipop+ 的实现中，SVG 路径数据可以分为两部分：一条直线和一条三次贝塞尔曲线。而 Path 支持绘制这两种路径，所以我们只需要这样：

```java
final class IndeterminateAnimatorFactory {
    .
    .
    .
    private static Interpolator createStartInterpolator() {
        Path path = new Path();
        path.cubicTo(0.2f, 0f, 0.1f, 1f, 0.5f, 1f);
        path.lineTo(1f, 1f);
        return PathInterpolatorCompat.create(path);
    }
    .
    .
    .
    private static Interpolator createEndInterpolator() {
        Path path = new Path();
        path.lineTo(0.5f, 0f);
        path.cubicTo(0.7f, 0f, 0.6f, 1f, 1f, 1f);
        return PathInterpolatorCompat.create(path);
    }
    .
    .
    .
}
```

If we actually run that we’ll see that it’s close but not quite what we’re after. Even though we’ve copied the paths used to create the start and end point interpolation what we haven’t taken in to account is the trimPathOffset animation which was used to prevent from the leading edge catching up with the trailing edge. While we could try and factor that in to our Drawable we actually don’t need to if we factor it in to our Paths used for the interpolators instead. The trick is that rather than remaining static during the line phase of the Paths, we actually move slowly instead:

将这段代码放入模拟环境就可以得到实际的函数图形，我们会发现图形实际上已经非常相似了，但还有一点点的瑕疵。虽说我们复制路径以设置插值器的起点和终点，但我们没有考虑用于避免尾缘追上前缘的 trimPathOffset 动画。如果我们在用于插值器的 Path 中考虑这个动画，其实我们不需要将它考虑到我们的 Drawable 中。因为我们只需要将速率不变部分去掉，然后将整体速率改变，而起点终点不变就行了，代码如下：

```java
final class IndeterminateAnimatorFactory {
    .
    .
    .
    private static Interpolator createStartInterpolator() {
        Path path = new Path();
        path.cubicTo(0.3f, 0f, 0.1f, 0.75f, 0.5f, 0.85f);
        path.lineTo(1f, 1f);
        return PathInterpolatorCompat.create(path);
    }
    .
    .
    .
    private static Interpolator createEndInterpolator() {
        Path path = new Path();
        path.lineTo(0.5f, 0.1f);
        path.cubicTo(0.7f, 0.15f, 0.6f, 0.75f, 1f, 1f);
        return PathInterpolatorCompat.create(path);
    }
    .
    .
    .
}
```

代码修改前插值器的函数图形如下：

![](https://i0.wp.com/blog.stylingandroid.com/wp-content/uploads/2016/01/trim_start_and_end_interpolators.png?resize=223%2C300&ssl=1)

代码修改后插值器的函数图形如下：

![](https://i1.wp.com/blog.stylingandroid.com/wp-content/uploads/2016/01/trim_start_and_end_with_offset.png?resize=230%2C300&ssl=1)

If we try it with those tweaks to the Paths then we get pretty close to the Lollipop+ implementation:

对 Path 微调后，将它应用到之前的代码中，运行一下程序就会看到实际效果，和 Lollipop+ 已经非常非常接近了：

[视频](https://youtu.be/kYlwJF0Qgwo)

It’s pretty difficult to tell the difference although there is a very occasional glitch when the rotation animator finishes and restarts (you can see it towards the end of the video) but it is only occasional so I can live with it.

两种实现的不同接近于 0，但我们的版本有时候还是会发生小问题的，就是在旋转动画结束并重新启动动画的时候（在视频结束的时候你可以看到），但这种小问题我觉得可以忍受吧……

Just to prove that it truly is backwardly compatible here’s the same thing running on a Genymotion 4.1.1 emulator. Note how the native ProgressBar is rendered as a Holo-styled one:

为了证明我们的版本能支持低版本设备，我在一台 4.1.1 的虚拟机上运行了这个 Demo，原生版本的实现此时以 Holo-styled 绘制：

[视频](https://youtu.be/pgexYY10agY)

That concludes our look at creating our own indeterminate progress bar and we’ve met a new friend along the way: PathInterpolator!

这样就可以证明了吧！

The source code for this article is available [here](https://github.com/StylingAndroid/Indeterminate/tree/Part5).

[源码可以在这里下载。](https://github.com/StylingAndroid/Indeterminate/tree/Part5)