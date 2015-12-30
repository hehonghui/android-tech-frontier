`深入理解Content Transition  (part 2)`
---

>
* 原文链接 :  [Content Transitions In-Depth (part 2)][source-url]
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成



#深入理解Content Transition

这篇文章会深度分析 Content Transitions 和它在 Activity & Fragment Transitions API 中的作用。这篇文章是下面这个系列中的第二篇：

- Part 1: [在 Activity 和 Fragment 中使用 Transition ][part-1]
- Part 2: [深入理解 Content Transition][part-2]
- Part 3a: [深入理解共享元素 Transition][part3a]
- Part 3b:  [延迟共享元素的 Transition][part-3b]
- Part 3c: 共享元素回调实践 (coming soon!)
- Part 4:  Activity & Fragment 过渡动画示例(coming soon!)

我们先来总结下在 [part 1][part-1] 中提到的关于 Content Transitions 的知识点，然后
说一说在 Android Lollipop 中是怎样使用它来构建合适的过渡动画。

---

##Content Transition 是什么？

Content transition 决定了非共享元素 View (也称为 transitioning view) 在
Activity & Fragment 过渡期间是如何进入或退出场景的。出于 Google 新的设计语言
[Material Design][md-design] , content transitions 允许我们协调 Activity/Fragment 中每一个
 view 的进入和退出 transition，轻松搞定流畅的屏幕切换动作。
开始使用 Android Lollipop，调用下面这些[ Window ][window] 和
[ Fragment ][fragment] 方法可以通过程序设置 content transitions :


- **setExitTransition()** - 当 A **启动** B 时， **A** 中 views **离开**场景的退出过渡动画

- **setEnterTransition()** - 当 A **启动** B 时， **B** 中 views **进入**场景的进入过渡动画

- **setReturnTransition()** - 当 B **返回** A 时， **B** 中 views **离开**场景的返回过渡动画

- **setReenterTransition()** - 当 B **返回** A 时， **A** 中 views **进入**场景的重入过渡动画

(注:A 和 B 是Activity 见 [part 1][part-1])。

[**Video 2.1**][video2.1] - Content transitions in the Google Play Games app (as of v2.2). Click to play.

---


[**Video 2.1**][video2.1]作为示例阐明了在 Google Play Games app 中是如何使
用 content transitions 实现流畅的 activitiy 切换动画。当第二个 activity 启动，
它的**进入** content transition 轻轻地从屏幕底部边缘将头像推入场景。按下返回按钮后，
第二个 activity 的**返回** content transition 将图层分成上下两块，分别推出屏幕。


---

目前为止我们对 content transitions 的分析仅仅停留在表面，一些重要的问题仍然没有涉及。
例如 Content Transition 在底层是如何实现的？都有哪些类型的 **Transition** 对象可以使用?框架是如何确定哪些 view
是 transitioning view? 在 content transitions 中一个 **ViewGroup** 和它的子视图能不能当成一个整体
执行动画?下面我们就来一个一个解答这些问题。

---

##Content Transitions 底层深入

上篇文章我们说过 Transition 的两个主要职责分别是获取目标视图的开始结束状态和创建这两个状态间的过渡动画。同样，框架必须先改变每个 transitioning view 的可见性并将状态信息交给 content
transition ，它才能创建过渡动画。更准确的说，当 Activity **A** 启动 Activity **B** 将会出现以下事件：<a id="1" href="#b1">(1)</a>

1. Activity **A** 调用 **startActivity()**

	-  框架首先会遍历 **A** 的 view 层次结构，确定当 **A** 的退出 transition 运行后有哪些
	transitioning views 会退出场景。
	- **A** 的退出 transition 捕获 A 中 transitioning views 的起始状态。
	- 框架将 **A** 中所有 transitioning views 设置为**不可见**。
	- 在下一个画面中，**A** 的退出 transition 捕获 **A** 中所有 transitioning views 的结束状态。
	- **A** 的退出 transition 比较每一个 transitioning view 开始和结束状态的不同，
	并基于这些信息创建一个 **Animator**，最后运行 **Animator** 将所有 transitioning views
	移出场景。

2. Activity **B** 被启动
	- 框架遍历 **B** 的 view 层次结构， 确定当 B 的进入 transition 运行后有哪些
	   transitioning views 会进入场景。
	-  **B** 的进入 transition 捕获 B 中 transitioning views 的起始状态。
	-  框架将 **B** 中所有  transitioning views  设置为**可见**
	-  在下一个画面中，**B** 的进入 transition 捕获 **B** 中所有 transitioning views 的结束状态。
	-  **B** 的进入 transition 比较每一个 transitioning view 开始和结束状态的不同，
	并基于这些信息创建一个 **Animator**，最后运行 **Animator** 将所有 transitioning views
	移入场景。

---

框架通过在**可见**和**不可见**之间切换每个 transitioning view 的可见性来保证
content transition 能够获得用来构建目标动画所需要的状态信息。
显然所有的 content **Transition** 对象至少要能够获取和记录每个 transitioning view
起始和结束状态的可见性。还好 [Visibility][Visibility] 这个抽象类已经提供了这个功能 :
需要创建并返回 (让 view 进入/退出场景的) **Animator** 的 **Visibility**
子类只需要实现 [**onAppear()**][onAppear]  和 [**onDisappear()**][onDisappear] 这两个工厂方法。
从 API 21 开始，有三个已经写好的 **Visibility** 实现( [**Fade**][Fade], [**Slide**][slide] 和 [**Explode**][explode])，可以使用它们来构建  Activity 和 Fragment 的 content transitions。
有必要的话也可以自己实现 Visibility 类达到想实现的效果。后边的文章会有具体介绍。

---

##Transitioning Views 和 Transition Groups
直到现在，我们已经假设 content transitions 操作一组叫做 transitioning views 的非共享 view 。
在这节中，我们将探讨 Transition 框架如何确定哪些 View 是非共享 View，以及如何使用 transition group 深度定制框架

Transition 开始前，框架会在 Activity 窗口(或 Fragment) 的视图层上执行一个递归的搜索，用来
构建 transitioning views 的集合。这个搜索通过对图层的根视图递归调用重写的**ViewGroup#captureTransitioningViews** 方法启动，部分[源码][source-code]如下:

```java
/** @hide */
@Override
public void captureTransitioningViews(List<View> transitioningViews) {
    if (getVisibility() != View.VISIBLE) {
        return;
    }
    if (isTransitionGroup()) {
        transitioningViews.add(this);
    } else {
        int count = getChildCount();
        for (int i = 0; i < count; i++) {
            View child = getChildAt(i);
            child.captureTransitioningViews(transitioningViews);
        }
    }
}
```

---


[**Video 2.2**][video2.2] - A simple Radiohead app that illustrates a potential bug involving transition groups and WebViews. Click to play.

---

这个递归调用很简单: 框架遍历树的每一层，直到找到一个**可见的**[ leaf view ][leafview] (子视图)或者一个 transition group。Transition groups 本质上允许我们在 Activity/Fragment 的 transition
期间将全部 **ViewGroups** 当作一个整体执行过渡动画。如果一个 **ViewGroup** 的
[`isTransitionGroup ()`][isTransitionGroup] <a id="2" href="#b2">(2)</a>方法返回值为 **true**，它和它的子视图会被当作一
个整体来执行过渡动画。否则，这个递归搜索会继续执行下去， 这个 ViewGroup 的子视图在动画期间
会执行自己的独立的过渡动画。搜索最终会返回一个全部由 content transition
 执行动画的 transitioning views 集合 。<a id="3" href="#b3">(3)</a>

---

上面的 [**Video 2.1**][video2.1] 展示了 transition groups  的效果。在 enter transition ，
用户头像是作为一个单独的 View 进入屏幕，return transition 时却是和包含它的 parent
**ViewGroup** 一起消失。在  Google Play Games 里可能用了一个 transition group
来实现在返回前一个 activity 时，让当前场景拦腰斩断的效果。

---

有时 transition groups 还被用来修复 Activity/Fragment transitions 中诡异的 bugs。
例如，Video 2.2中: **调用 Activity** 显示了一个电台司令专辑图的网格布局，
**被调用 Activity** 展示了一个背景标题图，一个共享元素专辑封面图还有一个 **WebView**。
这个 App 使用了一个和 Google Play Games app 类似的 return transition，将背景图和底部的
**WebView** 分别推出屏幕。然而这里有个小故障导致 **WebView** 不能流畅的退出屏幕。

好吧，错误在哪呢？原来 **WebView** 是一个 **ViewGroup**，因此在默认情况下 WebView 不会被当作 transitioning view
的。当 return transition 被执行时，**WebView** 会被完全忽略，直到过渡动画结束才会被移除屏幕。
找到问题就好解决了，只要在 return transition 开始前调用 `webView.setTransitionGroup(true)`
就能修复这个bug。

---

##结语

总之，这篇文章讲了三个重点:

-  Content transition 决定了 Activity/Fragment 中非共享元素视图(被称为 transitioning views)
	在 Activity/Fragment transition 期间如何进入或退出场景。
- Content transitions 被触发是因为它的 transitioning views 可见性改变  ，并且应该总是继承
	**Visibility** 这个抽象类。
- Transition groups 可以让我们在 content transition 期间将 **ViewGroups**
	当作一个整体执行过渡动画。

希望这篇文章能够帮到你，欢迎留下评论～

---

1. Activities 和 Fragments 在  return/reenter transitions 期间出现的一系列事件相似。
	<a id="b1" href="#1">↩</a>
2. 如果 ViewGroup 有一个非空的  background drawable 或者非空的默认 transition name 那么
	`isTransitionGroup()` 将返回 **true** (所述方法[文档][isTransitionGroup])
	<a id="b2" href="#2">↩</a>
3. 当 transition 运行时，任何在 content **Transition** 对象中被明确地 [ added ][addTarget]或
	[ excluded ][excludeTarget] 的 view 也会被考虑。<a id="b3" href="#3">↩</a>


[source-url]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html

[part-1]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
[part-2]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[part3a]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
[part-3b]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html
[md-design]:http://www.google.com/design/spec/animation/meaningful-transitions.html
[window]:http://developer.android.com/reference/android/view/Window.html
[fragment]:http://developer.android.com/reference/android/app/Fragment.html
[video2.1]:http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/15/games-opt.mp4
[jump1]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html#footnote1
[Visibility]:https://developer.android.com/reference/android/transition/Visibility.html
[onAppear]:https://developer.android.com/reference/android/transition/Visibility.html#onAppear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
[onDisappear]:https://developer.android.com/reference/android/transition/Visibility.html#onDisappear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
[Fade]:https://developer.android.com/reference/android/transition/Fade.html
[slide]:https://developer.android.com/reference/android/transition/Slide.html
[explode]:https://developer.android.com/reference/android/transition/Explode.html
[source-code]:https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L6243-L6258
[leafview]:https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/View.java#L19351-L19362
[isTransitionGroup]:https://developer.android.com/reference/android/view/ViewGroup.html#isTransitionGroup()
[video2.2]:http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/15/webview-opt.mp4
[addTarget]:https://developer.android.com/reference/android/transition/Transition.html#addTarget(android.view.View)
[excludeTarget]:https://developer.android.com/reference/android/transition/Transition.html#excludeTarget(android.view.View,%20boolean)
