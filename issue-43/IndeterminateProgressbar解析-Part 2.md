IndeterminateProgressbar解析-Part 2
---

> * 原文链接 : [Indeterminate – Part 2](https://blog.stylingandroid.com/indeterminate-part-2/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



Indeterminate ProgressBars are a useful tool for communicating to our users that an operation is in progress when we cannot predict how long it is likely to take. Previously on Styling Android we’ve covered how to create a backwardly compatible approximation of the material styled horizontal indeterminate ProgressBar but we haven’t looked at the circular form – in this series we’ll create an approximation of the material circular indeterminate ProgressBar which will be backwardly compatible to API 11 (Honeycomb).

IndeterminateProgressBar 能在用户进行某项不定时长的耗时操作时提供绝佳的用户体验，之前我有教过大家怎么创建[水平的 IndeterminateProgressBar](http://blog.csdn.net/u012403246/article/details/49582789)，今天我就来教大家实现圆形的 IndeterminateProgressBar，这个控件将支持 API 11（Honeycomb）以上的设备。

Previously we looked at the AOSP implementation of the material circular indeterminate ProgressBar drawable and saw how an AnimatedVectorDrawable is used to animate the trimPath* of a VectorDrawable path in order to get the “sweep” animation. In this article we’ll turn our attention to the Interpolators which will control the positions of the start and end points of the sweep arc over time.

在上一篇博文中我们学习了圆形 IndeterminateProgressBar 的 AOSP 实现方式，以及 AnimatedVectorDrawable 如何被用于显示 VectorDrawable 路径动画以得到圆形 IndeterminateProgressBar 的长度变化动画。在本篇博文中我们将把注意力转移到插值器上，即研究圆形 IndeterminateProgressBar 在显示长度变化动画时，是如何控制圆弧起点和终点的位置的。

Let’s begin by diving straight in to the AOSP code and look at these. First we’ll look at the [Interpolator which controls the trimPathStart value](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/interpolator/trim_start_interpolator.xml):

不妨直接看 AOSP 的源码吧，[首先看 控制 trimPathStart 的值的插值器](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/interpolator/trim_start_interpolator.xml):

```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
 Copyright (C) 2014 The Android Open Source Project
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
    android:pathData="L0.5,0 C 0.7,0 0.6,1 1, 1" />
```

There’s nothing much there, but what the %$@& is a PathInterpolator? A PathInterpolator is actually an extremely powerful way of describing an interpolation function which was introduced in API 21 Lollipop. Don’t despair though, there is also PathInterpolatorCompat which we’ll look at later in the series.

乍一看这代码怎么这么少，那个 PathInterpolator 到底是什么鬼？

PathInterpolator 其实就是 Lollipop 中介绍的描述插值器功能最具代表性的插值器子类，看到这里不要绝望，在以后的博文中我们还会遇到 PathInterpolatorCompat 这个类。

A PathInterpolator takes an SVG pathData parameter which describes a mapping function of the form y = f(x). That sounds rather complex, but it is actually much simpler than it sounds. Effectively it is a square canvas which is one unit in each direction from 0,0 to 1,1. The PathInterpolator works by returning the y value for any given x value. The input values range from 0.0-1.0, so there only stipulation is that each possible value for x can only map to a single value of y – the path cannot double back on itself in the horizontal plane in other words.

PathInterpolator 需要 SVG pathData 参数以描述 y = f(x) 的映射关系，可能听起来有点复杂，但其实它非常简单。实际上，就是一个每个方向上都有一个从 0,0 到 1,1 的单元的方形画布，PathInterpolator 可以根据任意给定的 x 的值返回给定函数映射对应的 y 值，其接收的输入的取值范围是 0.0 - 1.0，所以其输入的唯一约定就是：每一个可能的 x 和 y 必须是1对1映射。

If we were to draw a straight line from 0,0 to 1,1 we would effectively create a LinearInterpolator because each value of x would map to an identical value for y. So what does the pathData in the above code actually do? A interesting trick that we can use here is to actually create a VectorDrawable using this path and use the preview within Android Studio to actually view it:

如果我们画了一条从 0,0 到 1,1 的直线，实际上就相当于创建了线性插值器（LinearInterpolator），因为每一个 x 的值对应的 y 值都相同。那么上述代码中 pathData 到底做了什么？运用一个有趣的技巧，我们可以创建 VectorDrawable 并添加该 path 元素，然后用 Android Studio 的预览功能就会看到下图：

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools"
  android:width="72dp"
  android:height="72dp"
  android:viewportWidth="1"
  android:viewportHeight="1"
  tools:ignore="UnusedResources">

  <path
    android:strokeColor="#0000FF"
    android:strokeWidth="0.005"
    android:pathData="L0.5,0 C 0.7,0 0.6,1 1, 1" />

<vector>
```

![](https://i2.wp.com/blog.stylingandroid.com/wp-content/uploads/2016/01/trim_start_interpolator.png?w=608)

So 0,0 is the top left of the path and 1,1 is the bottom right. So for values of x up to 0.5 a y value of 0 will be returned. So the value of zero will be returned. From 0.5-1.0 there will be a gradual acceleration then quickly through the mid-values, and decelerating as we get towards 1.0. This will be pretty similar to a standard AccelerateDecelerateInterpolator. But these two distinct phases create something rather more complex than is easily achievable using more traditional Interpolators. If we next look at the Interpolator which is applied to the trimPathEnd value:

由图可知，0,0 就是路径的左上角，1,1 就是路径的右下角。当 x = [0.0 - 0.5], y = 0；当 x = (0.5, 1.0]，y 值的增长逐渐增加，然后超过中值，增长速率又渐渐变慢，最终为 1.0。其实际作用与 AccelerateDecelerateInterpolator 相同。如果我们研究 trimPathEnd 使用的插值器，会发现这两个阶段完成的工作比使用传统插值器要复杂：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
 Copyright (C) 2014 The Android Open Source Project
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
    android:pathData="C0.2,0 0.1,1 0.5, 1 L 1,1" />
```

This is similar but the pathData is different. Let’s plot this on top of the other Interpolator in our VectorDrawable visualisation:

看起来这段 xml 代码和上面的很类似，但 pathData 对应的值是不同的，不妨再次利用 VectorDrawable 将这个插值器对应的函数图像显示出来：

![](https://i0.wp.com/blog.stylingandroid.com/wp-content/uploads/2016/01/trim_start_and_end_interpolators.png?resize=223%2C300)

This is displayed in red and shows that we do the accelerate, fast through the middle, then decelerate phase first and then remain static at 1.0 until the end. Essentially we have reversed the phases.

图中红色显示作加速的部分，y 值快速增加直到大于中值，然后减缓增大的速率直到值为 1.0，相当于把上面的过程反过来。

The trimPathEnd will (perhaps a little confusingly) control the leading edge of the sweep while the trimPathStart will control the trailing edge. So with these Interpolators applied to the Animators the leading edge accelerates away from the trailing edge, and the trailing edge makes the same transition only a little later in the animation. The trimPathOffset is used to avoid the leading edge from actually touching the trailing edge as it reaches 1.0. Then with the entire thing then being rotated we get the circular indeterminate animation that we’ve become familiar with:

trimPathEnd 会控制长度变化动画中圆弧的终点，trimPathStart 则控制该圆弧的起点。利用这些插值器我们可以让圆弧的长度自动变化，以显示长度变化的动画。最终结合旋转动画就可以实现该圆形 IndeterminateProgressbar 的效果，即下面视频展示的效果：

[视频](https://youtu.be/g6Zo6WDS2Gg)

Now that we have an understanding of how this is implemented it’s pretty clear that we can’t simply back-port this because of AnimatedVectorDrawable support pre-Lollipop (and VectorDrawableCompat isn’t really an option at the time of writing). However we can apply the knowledge that we’ve learned from understanding this to actually create a pretty good implementation that works back to API 11 (Honeycomb) without a VectorDrawable in sight! In the next article we’ll begin looking at how we can do this.

As this series is initially an exploration of AOSP code there is no accompanying source code. Yet. It will come later in the series, I promise!

现在我们明白该控件是怎么实现的了，而且 AnimatedVectorDrawable 支持 Android 5.0 以前的版本，因此我们不用担心它的兼容性问题（在写下本文时 VectorDrawableCompat 由于兼容性的问题不是个好选择）。因此我们不需要 VectorDrawable 就可以利用到目前为止学习的知识在 API 11 上实现酷炫的动画效果，在下一篇博文中我将会介绍应该怎么去实现。

因为这篇博文都是基于[ Google 源码](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/anim/progress_indeterminate_rotation_material.xml)进行的，所以我就不提供源码了，但后面的文章我保证都会有源码！