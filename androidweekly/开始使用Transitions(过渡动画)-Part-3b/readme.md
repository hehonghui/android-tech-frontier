
`延迟共享元素的过渡动画 (part 3b)`
---

>
* 原文链接 : [Postponed Shared Element Transitions (part 3b)][source-url]
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  寻找校对中

#共享元素过渡延时 (part 3b)
This post continues our in-depth analysis of shared element transitions by
discussing an important feature of the Lollipop Transition API: postponed
shared element transitions. It is the fourth of a series of posts I will
be writing on the topic:

这篇文章继续我们关于共享元素 Transition 的深度分析，通过讨论Lollipop Transition API
的一个重要的特性：延迟共享元素的过渡动画。这是我关于这个话题的第四篇文章。

---

- Part 1: Getting Started with Activity & Fragment Transitions
- Part 2: Content Transitions In-Depth
- Part 3a: Shared Element Transitions In-Depth
- Part 3b: Postponed Shared Element Transitions
- Part 3c: Implementing Shared Element Callbacks (coming soon!)
- Part 4: Activity & Fragment Transition Examples (coming soon!)


- Part 1: [在 Activity 和 Fragment 中使用 Transition ][part-1]
- Part 2: [深入理解 Transition][part-2]
- Part 3a: [深入理解共享元素的 Transition][part3a]
- Part 3b:  [延迟共享元素的 Transition][part-3b]
- Part 3c: 共享元素回调实践 (coming soon!)
- Part 4:  Activity & Fragment 过渡动画示例(coming soon!)


---

We begin by discussing the need to postpone certain shared element transitions
due to a common problem.

我们通过一个常见的问题来论述为什么需要推迟某些共享元素的过渡动画。

---



Understanding the Problem

A common source of problems when dealing with shared element transitions stems
from the fact that they are started by the framework very early in the Activity
lifecycle. Recall from part 1 that Transitions must capture both the start and
end state of its target views in order to build a properly functioning animation.
Thus, if the framework starts the shared element transition before its shared
elements are given their final size and position and size within the called
Activity, the transition will capture the incorrect end values for its shared
elements and the resulting animation will fail completely (see Video 3.3 for an
  example of what the failed enter transition might look like).

##理解问题

通常问题的根源是框架在 Activity 生命周期非常早的时候启动共享元素 Transition 。回想我们的第一篇文章，
Transitions 必须捕获目标 View 的起始和结束状态来构建合适的动画。因此，如果框架在共享元素获得它在调用它的 App 所给定的大小和位置前启动共享元素的过渡动画，这个 Transition 将不能
正确捕获到共享元素的结束状态值,生成动画也会失败(一个过渡失败的例子[Video 3.3][video]).

<video src="http://www.androiddesignpatterns.com/assets/videos/posts/2015/03/09/postpone-bug-opt.mp4" controls>
   Your browser does not implement html5 video.
</video>

---

Whether or not the shared elements' end values will be calculated before the
transition begins depends mainly on two factors:

(1) the complexity and depth of the called activity's layout and
(2) the amount of time it takes for the called activity to load its required
data.

The more complex the layout, the longer it will take to determine the shared
elements' position and size on the screen. Similarly, if the shared elements'
final appearance within the activity depends on asynchronously loaded data,
there is a chance that the framework might automatically start the shared
element transition before that data is delivered back to the main thread.
Listed below are some of the common cases in which you might encounter
these issues:


Transition 开始前，能否计算出正确的共享元素的结束值主要依靠两个因素:(1) 调用共享元素 Activity
布局的复杂度和深度 (2)调用共享元素Activity载入数据消耗的时间。布局越复杂，在屏幕上确定
共享元素的大小位置耗时越长。同样，如果调用共享元素的 Activity 依赖一个异步的数据载入，框架
仍有可能会在数据载入完成前自动开始共享元素 Transition。下面列出的是你可能遇到的常见问题:

---


- **The shared element lives in a Fragment hosted by the called activity**.
FragmentTransactions are not executed immediately after they are committed;
they are scheduled as work on the main thread to be done at a later time. Thus,
if the shared element lives inside the Fragment's view hierarchy and the
FragmentTransaction is not executed quickly enough, it is possible that the
framework will start the shared element transition before the shared element
is properly measured and laid out on the screen.1

- **共享元素存在于 Activity 托管的 Fragment 中 **( a Fragment hosted by the called
  activity)。

  [FragmentTransactions 在commit后不会被立即执行][FragmentTransactions];它们被安排到
  主线程等待执行。
  因此，如果共享元素存在的 Fragment 的视图层和FragmentTransaction没有被及时执行，框架有可能在
  共享元素被正确测量大小和布局到屏幕前启动共享元素 Transition。<a id="b1" href="#1">(1)</a>

---

- **The shared element is a high-resolution image**. Setting a high resolution
image that exceeds the ImageView's initial bounds might end up triggering an
additional layout pass on the view hierarchy, therefore increasing the chances
that the transition will begin before the shared element is ready. The
asynchronous nature of popular bitmap loading/scaling libraries, such as Volley
and Picasso, will not reliably fix this problem: the framework has no prior
knowledge that images are being downloaded, scaled, and/or fetched from disk on
a background thread and will start the shared element transition whether or not
images are still being processed.


- **共享元素是一个高分辨率的图片**。给 **ImageView** 设置一个超过其初始化边界的高分辨率图片，
最终可能会导致在这个视图层里[额外的布局传递][add-layout-pass]，由此增加在共享元素准备好前就
启动 Transition 的几率。流行的异步图片处理库比如 [`Volley`][volley] 和 [`Picasso`][picasso] ，
也不能可靠的解决这个问题:框架不能预先了解图片是要被下载，缩放还是在后台线程中从磁盘读取，只是不管
图片是否处理完毕就启动共享元素 Transition。

---

- **The shared element depends on asynchronously loaded data**. If the shared
elements require data loaded by an AsyncTask, an AsyncQueryHandler, a Loader,
or something similar before their final appearance within the called activity
can be determined, the framework might start the transition before that data is
delivered back to the main thread.

- **共享元素依赖于异步的数据加载**如果共享元素所需的数据是通过**AsyncTask**，
**AsyncQueryHandler**,**Loader**或者其他类似的东西加载，在它们最终返回数据前 Activity
就能被确定，框架仍有可能在数据返回主线程前启动 Transition

---

##postponeEnterTransition() and startPostponedEnterTransition()

At this point you might be thinking, "If only there was a way to temporarily
delay the transition until we know for sure that the shared elements have been
properly measured and laid out." Well, you're in luck, because the Activity
Transitions API2 gives us a way to do just that!

To temporarily prevent the shared element transition from starting, call
postponeEnterTransition() in your called activity's onCreate() method. Later,
when you know for certain that all of your shared elements have been properly
positioned and sized, call startPostponedEnterTransition() to resume the
transition. A common pattern you'll find useful is to start the postponed
transition in an OnPreDrawListener, which will be called after the shared
element has been measured and laid out:3

现在你可能会想：如果有办法能让暂时延迟 Transition 的使用，直到我们确定了共享元素的确切大小和
位置才使用它就好了。幸好
Activity Transitions API<a id="b2" href="#2">(2)</a>为我们提供了解决方案。

在 Activity 的`onCreate()`中调用[`postponeEnterTransition()`][postponeEnterTransition]
方法来暂时阻止启动共享元素 Transition。之后，你需要在共享元素准备好后调用
[`startPostponedEnterTransition`][startPostponedEnterTransition]来恢复过渡效果。
常见的模式是在一个[`OnPreDrawListener`][onPreDrawListener]中启动延时 Transition，
它会在共享元素测量和布局完毕后被调用<a id="b3" href="#3">(3)</a>。



```java


@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    // Postpone the shared element enter transition.
    postponeEnterTransition();

    // TODO: Call the "scheduleStartPostponedTransition()" method
    // below when you know for certain that the shared element is
    // ready for the transition to begin.
}

/**
 * Schedules the shared element transition to be started immediately
 * after the shared element has been measured and laid out within the
 * activity's view hierarchy. Some common places where it might make
 * sense to call this method are:
 *
 * (1) Inside a Fragment's onCreateView() method (if the shared element
 *     lives inside a Fragment hosted by the called Activity).
 *
 * (2) Inside a Picasso Callback object (if you need to wait for Picasso to
 *     asynchronously load/scale a bitmap before the transition can begin).
 *
 * (3) Inside a LoaderCallback's onLoadFinished() method (if the shared
 *     element depends on data queried by a Loader).
 */
private void scheduleStartPostponedTransition(final View sharedElement) {
    sharedElement.getViewTreeObserver().addOnPreDrawListener(
        new ViewTreeObserver.OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                sharedElement.getViewTreeObserver().removeOnPreDrawListener(this);
                startPostponedEnterTransition();
                return true;
            }
        });
}
```

Despite their names, these two methods can also be used to postpone shared element return transitions as well. Simply postpone the return transition within the calling Activity's onActivityReenter() method instead:


忽略方法名，这里还有第二种方法可以延迟共享元素返回 Transition，在调用Activity的[`onActivityReenter()`][onActivityReenter] 方法中延缓返回 Transition<a id="b4" href="#4">(4)</a>

```java
/**
 * Don't forget to call setResult(Activity.RESULT_OK) in the returning
 * activity or else this method won't be called!
 */
@Override
public void onActivityReenter(int resultCode, Intent data) {
    super.onActivityReenter(resultCode, data);

    // Postpone the shared element return transition.
    postponeEnterTransition();

    // TODO: Call the "scheduleStartPostponedTransition()" method
    // above when you know for certain that the shared element is
    // ready for the transition to begin.
}

```


---

Despite making your shared element transitions smoother and more reliable, it's
important to also be aware that introducing postponed shared element transitions
into your application could also have some potentially harmful side-effects:

- **Never forget to call startPostponedEnterTransition() after calling
postponeEnterTransition**. Forgetting to do so will leave your application in a
state of deadlock, preventing the user from ever being able to reach the next
Activity screen.

- **Never postpone a transition for longer than a fraction of a second**.
Postponing a transition for even a fraction of a second could introduce unwanted
lag into your application, annoying the user and slowing down the user experience.

As always, thanks for reading! Feel free to leave a comment if you have any
questions, and don't forget to +1 and/or share this blog post if you found it helpful!


尽管添加延时可以让共享元素 Transition 更加流畅准确，但是你也要知道在应用中引入共享元素 Transition 的延迟还有一些副作用：

- **调用`postponeEnterTransition`后不要忘记调用`startPostponedEnterTransition`**。
忘记调用`startPostponedEnterTransition`会让你的应用处于死锁状态，用户无法进入下个Activity。


- **不要将共享元素 Transition 延迟设置到1s以上**。延迟时间过长会在应用中产生不必要的卡顿，影响用户体验。


感谢阅读！希望这篇文章对你有所帮助。

---

1 Of course, most applications can usually workaround this issue by calling
FragmentManager#executePendingTransactions(), which will force any pending
FragmentTransactions to execute immediately instead of asynchronously.

2 Note that the postponeEnterTransition() and startPostponedEnterTransition()
methods only work for Activity Transitions and not for Fragment Transitions.
For an explanation and possible workaround, see this StackOverflow answer and
this Google+ post.

3 Pro tip: you can verify whether or not allocating the OnPreDrawListener is
needed by calling View#isLayoutRequested() beforehand, if necessary.
View#isLaidOut() may come in handy in some cases as well.

4 A good way to test the behavior of your shared element return/reenter
transitions is by going into the Developer Options and enabling the "Don't keep
activities" setting. This will help test the worst case scenario in which the
calling activity will need to recreate its layout, requery any necessary data,
etc. before the return transition begins.

<a id="1" href="#b1">**1**</a>: 当然，许多应用通过调用[`FragmentManager#executePendingTransactions()`](https://developer.android.com/reference/android/app/FragmentManager.html#executePendingTransactions())来避开这个问题，这样会强制立即执行FragmentTransactions而不是异步。

<a id="2" href="#b2">**2**</a>: 注意!`postponeEnterTransition()`和`startPostponedEnterTransition()`只对 Activity Transition起作用，对Fragment无效。详细信息可以在这里找到[StackOverflow](http://stackoverflow.com/questions/26977303/how-to-postpone-a-fragments-enter-transition-in-android-lollipop)&[Google+](https://plus.google.com/+AlexLockwood/posts/3DxHT42rmmY)

<a id="3" href="#b3">**3**</a>: 小贴士:你可以先调用[`View#isLayoutRequested()`](http://developer.android.com/reference/android/view/View.html#isLayoutRequested())来确认是否需要调用[`OnPreDrawListener`][OnPreDrawListener]，有必要的话[`View#isLaidOut()`](http://developer.android.com/reference/android/view/View.html#isLaidOut())在一些情况下也能派上用场


<a id="4" href="#b4">**4**</a>: 在开发者选项中启用不保留 Activity 选项可以方便调试共享元素的返回/重新进入过渡动画行为，这可以帮助测试返回的过渡效果开始之前最糟糕的情况( Activity 需要重新构造布局加载数据...)


[source-url]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html
[FragmentTransactions]:https://developer.android.com/reference/android/app/FragmentTransaction.html#commit()
[postponeEnterTransition]:https://developer.android.com/reference/android/app/Activity.html#postponeEnterTransition()
[startPostponedEnterTransition]:https://developer.android.com/reference/android/app/Activity.html#startPostponedEnterTransition()
[add-layout-pass]:https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/widget/ImageView.java#L453-L455
[video]:http://www.androiddesignpatterns.com/assets/videos/posts/2015/03/09/postpone-bug-opt.mp4
[volley]:https://android.googlesource.com/platform/frameworks/volley
[picasso]:http://square.github.io/picasso/
[onPreDrawListener]:http://developer.android.com/reference/android/view/ViewTreeObserver.OnPreDrawListener.html
[onActivityReenter]:https://developer.android.com/reference/android/app/Activity.html#onActivityReenter(int,%20android.content.Intent)

[part-1]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
[part-2]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[part3a]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
[part-3b]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html
