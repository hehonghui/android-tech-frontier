`深入理解 Shared Element Transition (part 3a)`
---

>
* 原文链接 :  [Shared Element Transitions In-Depth (part 3a)][source-url]
* 作者 : [Alex Lockwood](https://plus.google.com/+AlexLockwood)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成



##深入理解共享元素 Transition

这篇文章会深度分析共享元素 transitions 和它在 Activity & Fragment Transitions API 中的作用。这篇文章是下面这个系列中的第三篇：

- Part 1: [在 Activity 和 Fragment 中使用 Transition ][part-1]
- Part 2: [深入理解 Content Transition][part-2]
- Part 3a: [深入理解共享元素 Transition][part3a]
- Part 3b:  [延迟共享元素的 Transition][part-3b]
- Part 3c: 共享元素回调实践 (coming soon!)
- Part 4:  Activity & Fragment 过渡动画示例(coming soon!)

Part 3 会分成三个部分: part3a 介绍 共享元素 transitions 的底层操作，part3b 和 part3c 
主要关注 API 的具体实现细节，例如推迟某些 共享元素 transition 的重要性和如何实现
**SharedElementCallbacks**。

我们首先会总结下在 [part 1][part-1] 中提到的关于 共享元素 transition 的知识点，然后说一说在 Android Lollipop 中是怎样使用它来构建合适的过渡动画。

##什么是 共享元素 Transition ?

共享元素 transition 决定了 共享元素 视图(也叫做主角视图)在
Activity/Fragment 场景过渡时的动画效果。共享元素 的动画
在被调用 Activity/Fragment  的 **进入/返回**  共享元素 transition
<a id="1" href="#b1">(1)</a> 中执行，
可以通过下面的[Window][window]/[Fragment][fragment] 方法设置：

- **setSharedElementEnterTransition()** -  **B** 的 **进入** 共享元素 transition ，执行将 
	共享元素视图 从 **A** 中的起始位置移动到它在 **B** 中的最终位置的动画。
- **setSharedElementReturnTransition()**  - **B** 的 **返回** 共享元素 transition ，执行将 
	共享元素视图 从 **B** 中起始位置移动到它在 **A** 中的最终位置的动画。

[**Video 3.1**][video-3.1] 展示了在 Google Play Music 中是怎样使用共享元素 transition 
的。这个 transition 包含两个元素：一个 **ImageView**和它的父视图 **CardView**。
Transition 期间，**CardView** 会扩展到全屏或收缩回原状， 
**ImageView** 能在这两个 Activity 里无缝的衔接。

在 [part1 ][part-1] 里只是简单的介绍了下这个话题，这篇文章将会对 共享元素 transition
做更深度的分析。例如 共享元素 Transition 在底层是如何实现的？都有哪些类型的 Transition 对象可以使用? Transition 期间 共享元素视图 是在哪里怎样绘制的？接下来的几章里
我们会逐个解答这些问题。

##深入共享元素 Transitions 底层

之前的文章已经介绍过 Transition 的两个主要任务分别是获取目标视图的 开始&结束 状态和创建这两个状态间视图的过渡动画(Animator)。共享元素 Transition 也一样：
在创建动画前需要捕获每一个
共享元素视图的起始和结束状态(就是共享元素在 **调用/被调用** Activity/Fragment
里的位置，大小和外观)。有了这些信息 共享元素 Transition 就可以确定每一个 共享元素
视图应该执行的动画。

和 [Content Transitions 的底层][content-transition]相似，框架通过在运行时明确的
更改每个 共享元素视图 的属性将这个状态信息提供给 共享元素 Transition 。
更准确地说 Activity **A** 启动 Activity **B** 时将会出现以下事件：<a id="2" href="#b2">(2)</a>

---

1. Activity **A** 调用 **startActivity()** 构造，测量，布局了一个
	最初背景色为透明的半透明窗口 Activity **B** 。
2. 框架将 **B** 中每一个共享元素视图复位到对应的原来在 **A** 中时的位置，接着 **B** 的进入 transition 捕获 **B** 中所有共享元素视图的起始状态。
3. 框架将 **B** 中每一个共享元素视图复位到对应的在 **B** 的最终位置，接着 **B** 的进入 transition 捕获 B 中所有共享元素视图的结束状态。
4. **B** 的进入 transition 比较所有共享元素视图的起始和结束状态，根据它们的不同
	创建一个 **Animator**。
5. 框架命令 **A** 隐藏共享元素视图，并运行返回的 **Animator**。**B** 中的
	共享元素视图到位之后，**B** 的窗口背景在 **A **上逐渐显示，直到 **B** 
	完全的显示出来，transition 运行完毕。
---

Content transitions 是根据每个过渡视图的可见性变化来调节的，**共享元素 transition 
是根据每个共享元素视图的位置，大小和外观的变化来调节的**。从 API 21 开始，框架提供了
几个自定义共享元素场景切换动画的 **Transition** 实现。

- [ChangeBounds][ChangeBounds] - 捕获共享元素布局边界根据不同构造动画。
	**ChangeBounds** 在共享元素 Transition 中经常使用，大多数共享元素在两个
	Activity/Fragment 间会有大小 或/和 位置不同。 
- [ChangeTransform][ChangeTransform ]  - 捕获共享元素缩放和角度，
	根据不同构建动画<a id="3" href="#b3">(3)</a>。
- [ChangeClipBounds][ChangeClipBounds] - 捕获共享元素的 [clip bounds][clip-bounds] 
	(剪辑边界) ，根据不同构建动画。
- [ChangeImageTransform][ChangeImageTransform] - 捕获共享元素 ImageView 的
	变换矩阵( transform matrices) ，根据不同构建动画。结合 **ChangeBounds**，
	可以让 ImageView
	 无缝的改变大小，形状和 [ ImageView.ScaleType ][ImageView.ScaleType]。 
- [@android:transition/move][move] - 一个 **TransitionSet** ，同时执行上面四种
	transition 。在 [part 1][part-1] 里提到过，如果没有明确的声明 进入/返回 共享元素 
	transition ，框架会默认运行这个 transition。
	
---

在上面的例子中，我们还可以发现 **共享元素视图实例并没有在 Activities/Fragments 间
“共享”**。事实上，进入/返回 共享元素 transitions期间，用户看到的绝大多数东西都是在
**B** 的 content view 中绘制的。框架并没有从 **A** 向 **B** 
传递 共享元素视图实例，
而是采用了不同的方法实现相同的视觉效果。当 **A** 启动 **B** ，框架收集 **A**
中共享元素的所有相关信息，并传递给 **B**。接下来 **B** 使用这些信息初始化
共享元素视图的起始状态(它们在 **A** 中时对应的大小，位置和外观)。Transition 
开始时，B 中除了共享元素视图外的所有东西都被初始化为对用户不可见。Tansition
的执行过程中，框架将 B 的 Activity 窗口逐渐显示，直到 B 
中共享元素结束动画窗口变为不透明。

---

##使用共享元素 Overlay <a id="4" href="#b4">(4)</a>
最后，如果想要完全理解共享元素 transition 的运作，我们必须先说说共享元素 overlay。
可能不是很明显，**共享元素默认是在整个窗口视图层的顶层  [ViewOverlay][ViewOverlay] 
上绘制**。简单介绍下 ，
**ViewOverlay** 这个类是在 API 18 中为了方便在视图层顶层
绘制引入的。添加到视图 **ViewOverlay** 之中的Drawable 
和 view (甚至是一个 **ViewGroup** 的子类) ，
将会被绘制在视图的最上层。这就解释了框架为什么
默认选择在窗口视图层的  **ViewOverlay** 中绘制共享元素。
共享元素视图应该是贯穿整个 transition 的焦点；
如果 transitioning views 意外的绘制在共享元素之上就会
破坏这个效果<a id="5" href="#b5">(5)</a>。

---

虽然共享元素默认绘制在共享元素的 ViewOverlay 之中，但是
框架也提供了关闭 overlay 的方法，只要调用
[Window#setSharedElementsUseOverlay(false) ][setsharedelementuseoverlay] 
就可以了。如果你关闭了 overlay
，要留意这样做可能会引起的副作用。例如，[Video 3.2][video-3.2]
 执行了一个简单的共享元素 transition 两次，
一次开启和一次关闭 共享元素 overlay 。第一次达到了预期想要的结果，
第二次关闭 overlay 后运行的效果不理想。Transition view 从底部向上移入
调用 Activity 的 content view 时挡住了部分 共享元素 **ImageView** 。虽然
可以改变在 View 上绘制视图的顺序或者通过在共享元素 parent 里调用
 **setClipChildren(false)** 这些旁门左道来修复问题，但是与可能带来的维护问题
 相比真是得不偿失。总之，除非你感觉必须要关掉共享元素 overlay 才能达到你想要的效果，
 其他情况尽量不要关闭它，这样会保持代码简洁，并且共享元素 transition 效果更引人注目。
 
##结语

综上所诉，这篇文章讲了三个重点:

1. 共享元素 transition 确定 共享元素视图(主角视图) 从一个 Activity/Fragment 移动到
	另一个其间场景过渡的动画。
2. 共享元素 transition 是根据每一个 共享元素视图 的位置，大小，和外观的变化调节的。
3. 共享元素默认是绘制在窗口视图的顶层 **ViewOverlay** 上面的。

希望这篇文章对你有所帮助 ～

---

1 Note that the Activity Transition API gives you the ability to also specify exit and reenter shared element transitions using the setSharedElementExitTransition() and setSharedElementReenterTransition() methods, although doing so is usually not necessary. For an example illustrating one possible use case, check out this blog post. For an explanation why exit and reenter shared element transitions are not available for Fragment Transitions, see George Mount's answer and comments in this StackOverflow post. ↩

2 A similar sequence of events occurs during the exit/return/reenter transitions for both Activities and Fragments. ↩

3 One other subtle feature of ChangeTransform is that it can detect and handle changes made to a shared element view's parent during a transition. This comes in handy when, for example, the shared element's parent has an opaque background and is by default selected to be a transitioning view during the scene change. In this case, the ChangeTransform will detect that the shared element's ｀parent is being actively modified by the content transition, pull out the shared element from its parent, and animate the shared element separately. See George Mount's StackOverflow answer for more information. ↩

4 Note that this section only pertains to Activity Transitions. Unlike Activity Transitions, shared elements are not drawn in a ViewOverlay by default during Fragment Transitions. That said, you can achieve a similar effect by applying a ChangeTransform transition, which will have the shared element drawn on top of the hierarchy in a ViewOverlay if it detects that its parent has changed. See this StackOverflow post for more information. ↩

5 Note that one negative side-effect of having shared elements drawn on top of the entire view hierarchy is that this means it will become possible for shared elements to draw on top of the System UI (such as the status bar, navigation bar, and action bar). For more information on how you can prevent this from happening, see this Google+ post. ↩


1.  Activity Transition API 也提供了
	**setSharedElementExitTransition()** 和 **setSharedElementReenterTransition()**
	这两个方法来设置 退出/重入 共享元素过渡，虽然通常来说是不必要的。
	[这篇文章][thispost]介绍了一个可能会遇到的用例。在这个 [stackoverflow][stackoverflow1]
	提问中 George Mount 的回答解释了为什么 退出/重入 共享元素 transition 在
	Fragment Transitions 中不可用。 <a id="b1" href="#1">↩</a>

2. Activities 和 Fragments 的 退出/返回/重入 transition 过程中出现事件序列相似  <a id="b2" href="#2">↩</a>
3. **ChangeTransform** 还有一个超赞的特性，它可以检测并处理共享元素父视图过渡期间
	的改变。当共享元素父视图有一个不透明背景，在场景变换过程中默认被选为
	transitioning view 时，**ChangeTransform** 就有了用武之地。如果它检测出
	共享元素父视图已被 content transition 更改，就会将共享元素提取出来，单独执行
	共享元素的动画。[StackOverflow answer][stackoverflow2] 这里有 George Mount 
	的详细说明。
	<a id="b3" href="#3">↩</a>
4. 注意，这部分只与 Activity Transition 有关。和Activity Transition 不同，Fragment Transition
	期间共享元素默认不在 **ViewOverlay** 中绘制。尽管如此，你仍可以使用 ChangeTransform 
	transition 来达到相似的效果，如果它检测到父视图改变了，就会把共享元素绘制在 
	**ViewOverlay** 的顶层。[StackOverflow][stackoverflow3] 这里有更多信息。
	 <a id="b4" href="#4">↩</a>
5. 注意，将共享元素绘制在整个图层最顶层也有一些负面效果。有可能
	会将共享元素绘制在 System UI 之上(比如 status bar, navigation bar还有 action bar)。
	解决方法看这里 [Google+ post][gplus]。
	<a id="b5" href="#5">↩</a>

---

[source-url]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html

[part-1]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
[part-2]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[part3a]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
[part-3b]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html
[window]:http://developer.android.com/reference/android/view/Window.html
[fragment]:http://developer.android.com/reference/android/app/Fragment.html
[content-transition]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[video-3.1]:http://www.androiddesignpatterns.com/assets/videos/posts/2015/01/12/music-opt.mp4
[Video-3.2]:http://www.androiddesignpatterns.com/assets/videos/posts/2015/01/12/overlay-opt.mp4
[ChangeBounds]:https://developer.android.com/reference/android/transition/ChangeBounds.html
[ChangeTransform ]:https://developer.android.com/reference/android/transition/ChangeTransform.html
[ChangeClipBounds]:https://developer.android.com/reference/android/transition/ChangeClipBounds.html
[ChangeImageTransform]:https://developer.android.com/reference/android/transition/ChangeImageTransform.html
[move]:https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/res/res/transition/move.xml
[clip-bounds]:https://developer.android.com/reference/android/view/View.html#getClipBounds()
[ImageView.ScaleType]:https://developer.android.com/reference/android/widget/ImageView.ScaleType.html
[ViewOverlay]:https://developer.android.com/reference/android/view/ViewOverlay.html
[setsharedelementuseoverlay]:https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
[thispost]:https://halfthought.wordpress.com/2014/12/08/what-are-all-these-dang-transitions/
[stackoverflow1]:http://stackoverflow.com/questions/27346020/understanding-exit-reenter-shared-element-transitions
[stackoverflow2]:http://stackoverflow.com/questions/26899779/enter-transition-on-a-fragment-with-a-shared-element-targets-the-shared-element
[stackoverflow3]:http://stackoverflow.com/questions/27892033/is-there-a-setsharedelementsuseoverlay-method-for-fragment-transitions
[gplus]:https://plus.google.com/+AlexLockwood/posts/RPtwZ5nNebb
