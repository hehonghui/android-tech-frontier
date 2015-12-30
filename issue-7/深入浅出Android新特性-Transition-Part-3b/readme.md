延迟共享元素的过渡动画 (part 3b)
---

>
* 原文链接 : [Postponed Shared Element Transitions (part 3b)][source-url]
* 作者 : [Alex Lockwood](https://plus.google.com/+AlexLockwood)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成

通过讨论 Lollipop Transition API 的一个重要的特性：延迟共享元素的过渡动画，这篇博文将继续我们关于共享元素 Transition 的深度解析。这也是我关于 Transition 这个专栏的第四篇文章。

- Part 1: [在 Activity 和 Fragment 中使用 Transition ][part-1]
- Part 2: [深入理解 Transition][part-2]
- Part 3a: [深入理解共享元素的 Transition][part3a]
- Part 3b:  [延迟共享元素的 Transition][part-3b]
- Part 3c: 共享元素回调实践 (coming soon!)
- Part 4:  Activity & Fragment 过渡动画示例(coming soon!)

我们通过一个常见的问题来解释为什么需要推迟某些共享元素的过渡动画。

##理解问题

通常问题的根源是框架在 Activity 生命周期非常早的时候启动共享元素 Transition 。回想我们的第一篇文章，Transitions 必须捕获目标 View 的起始和结束状态来构建合适的动画。因此，如果框架在共享元素获得它在调用它的 Activity 中所给定的大小和位置前启动共享元素的过渡动画，这个 Transition 将不能正确捕获到共享元素的结束状态值,生成动画也会失败(一个过渡失败的例子[Video 3.3](http://www.androiddesignpatterns.com/assets/videos/posts/2015/03/09/postpone-bug-opt.mp4)).

Transition 开始前，能否计算出正确的共享元素的结束值主要依靠两个因素:

(1) 调用共享元素的 Activity 的布局复杂度以及布局层次结构的深度 
(2)调用共享元素Activity载入数据消耗的时间

布局越复杂，在屏幕上确定共享元素的大小位置耗时越长。同样，如果调用共享元素的 Activity 依赖一个异步的数据载入，框架仍有可能会在数据载入完成前自动开始共享元素 Transition。下面列出的是你可能遇到的常见问题:

- **存在于 Activity 托管的 Fragment 中的共享元素**。[FragmentTransactions 在 commit 后并不会被立即执行][FragmentTransactions]，它们会被安排到主线程中等待执行。因此，如果共享元素存在的 Fragment 的视图层和FragmentTransaction没有被及时执行，框架有可能在共享元素被正确测量大小和布局到屏幕前启动共享元素 Transition。<a id="b1" href="#1">(1)</a>

- **共享元素是一个高分辨率的图片**。给 **ImageView** 设置一个超过其初始化边界的高分辨率图片，最终可能会导致在这个视图层里出现[额外的布局传递][add-layout-pass]，由此增加在共享元素准备好前就启动 Transition 的几率。流行的异步图片处理库比如 [`Volley`][volley] 和 [`Picasso`][picasso] ，也不能可靠的解决这个问题：框架不能预先了解图片是要被下载，缩放还是在后台线程中从磁盘读取，也不管图片是否处理完毕就启动共享元素 Transition。

- **共享元素依赖于异步的数据加载**如果共享元素所需的数据是通过**AsyncTask**，**AsyncQueryHandler**,**Loader**或者其他类似的东西加载，在它们获得在调用它们的 Activity 的最终数据（大小、位置）前，框架就有可能在主线程中启动 Transition。

现在你可能会想：如果有办法能让暂时延迟 Transition 的使用，直到我们确定了共享元素的确切大小和位置才使用它就好了。幸好 Activity Transitions API<a id="b2" href="#2">(2)</a> 为我们提供了解决方案。

在 Activity 的`onCreate()`中调用[`postponeEnterTransition()`][postponeEnterTransition] 方法来暂时阻止启动共享元素 Transition。之后，你需要在共享元素准备好后调用 [`startPostponedEnterTransition`][startPostponedEnterTransition] 来恢复过渡效果。常见的模式是在一个[`OnPreDrawListener`][onPreDrawListener]中启动延时 Transition，它会在共享元素测量和布局完毕后被调用<a id="b3" href="#3">(3)</a>。

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

忽略方法名，这里还有第二种方法可以延迟共享元素的返回 Transition，在调用Activity的[`onActivityReenter()`][onActivityReenter] 方法中延缓返回 Transition<a id="b4" href="#4">(4)</a>

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

尽管添加延时可以让共享元素 Transition 更加流畅准确，但是你也要知道在应用中引入共享元素 Transition 的延迟可能会产生一些负面影响：

- **调用`postponeEnterTransition`后不要忘记调用`startPostponedEnterTransition`**。
忘记调用`startPostponedEnterTransition`会让你的应用处于死锁状态，用户无法进入下个Activity。


- **不要将共享元素 Transition 延迟设置到1s以上**。延迟时间过长会在应用中产生不必要的卡顿，影响用户体验。


感谢阅读！希望这篇文章对你有所帮助。

<a id="1" href="#b1">**1**</a>: 当然，许多应用通过调用 [`FragmentManager#executePendingTransactions()`](https://developer.android.com/reference/android/app/FragmentManager.html#executePendingTransactions()) 来避开这个问题，这样会强制立即执行FragmentTransactions而不是异步。

<a id="2" href="#b2">**2**</a>: 注意!`postponeEnterTransition()`和`startPostponedEnterTransition()`只对 Activity Transition起作用，对Fragment无效。详细信息可以在这里找到 [StackOverflow](http://stackoverflow.com/questions/26977303/how-to-postpone-a-fragments-enter-transition-in-android-lollipop) & [Google+](https://plus.google.com/+AlexLockwood/posts/3DxHT42rmmY)

<a id="3" href="#b3">**3**</a>: 小贴士:你可以先调用 [`View#isLayoutRequested()`](http://developer.android.com/reference/android/view/View.html#isLayoutRequested()) 来确认是否需要调用 [`OnPreDrawListener`][OnPreDrawListener]，有必要的话 [`View#isLaidOut()`](http://developer.android.com/reference/android/view/View.html#isLaidOut()) 在一些情况下也能派上用场


<a id="4" href="#b4">**4**</a>: 在开发者选项中启用不保留 Activity 选项可以方便调试共享元素返回/重新进入时对应过渡动画的行为，这也可以帮助测试在返回的过渡效果开始之前可能发生最糟糕的情况( Activity 需要重新构造布局加载数据...)


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

[part-1]:https://github.com/bboyfeiyu/android-tech-frontier/tree/master/others/%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BAAndroid%20%E6%96%B0%E7%89%B9%E6%80%A7-Transition-Part-1
[part-2]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[part3a]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
[part-3b]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html
