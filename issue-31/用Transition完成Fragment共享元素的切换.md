用 Transition 完成 Fragment 共享元素的切换
---

> * 原文链接 : [Fragment transitions with shared elements](https://medium.com/@bherbst/fragment-transitions-with-shared-elements-7c7d71d31cbb#.fp2fgmvoi)
* 原文作者 : [Austin Mueller](http://armueller.github.io/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 

One of the cornerstones of Material design is meaningful motion between screens. Lollipop introduced support for these animations in the form of the transitions framework, which allows us to animate transitions between Activities and Fragments. I haven’t seen many articles on how to use transitions with Fragments, so I set out to write one!

Material Design 的基础之一是：让不同页面的切换具有意义，即让用户知道与界面发生交互后为何会从当前页面跳转到另一个页面。为此，Android Lolipop 为开发者提供了一个名为 Transition 的过渡动画框架，开发者能够通过这个框架为 Activity 和 Fragment 的跳转提供动画效果。我在了解 Transition 框架的过程中发现现在网上并没有太多将 Transition 应用到 Fragment 上的相关资料，所以我决定写一篇博客来分享一些我学到的知识～

Our end product is fairly simple. We will be making an app that has a grid of images, and when you click on an image the app will show a details screen. Thanks to the transitions framework, the image from the grid will animate into place on the details screen.

我在开发的一个产品非常简单，用格子的形状来展示图片瀑布流，当用户点击图片时，就会显示该图片的详细信息。多亏了 Transition 框架，我们才能按照我们的想法完成整个图片的交互和显示，效果图如下：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*eh4DsUQSyeoAuKvLQ5NgWw.gif)

If you want to head straight to the sample app, [you can find it here on GitHub.](https://github.com/bherbst/FragmentTransitionSample)

如果你不想看下面的文字，而是想直接下载源码的话，[戳我去 Github 下载吧～](https://github.com/bherbst/FragmentTransitionSample)

##What about older versions of Android?
##在老版本的 Android 系统中会怎样呢？

I have good news and bad news. The bad news is that content transitions don’t exist prior to Lollipop. However, the support library provides methods that you can use to gracefully support transitions on API 21+ without littering your code with API version checks.

This article will use these support library functions to provide content transitions.

事实上，这篇博文既为大家带来了好消息，也为大家带来了坏消息。坏消息是：Lolipop 之前的版本并没有可调用的 Transition API；但好消息是：Android support library 提供了可以在 API 21 以上的手机版本中使用 Transition API 的方法，而且不需要为代码添加 API 版本的判断。

##Setup

Unlike Activity transitions, you do not need Window.FEATURE_ACTIVITY_TRANSITIONS to use Fragment transitions. You also don’t need Window.FEATURE_CONTENT_TRANSITIONS. As a matter of fact, you don’t need to do anything special- you should already be ready to go!

不像为 Activity 添加 Transition，在为 Fragment 添加 Transition 的时候不需要用到 Window.FEATURE_ACTIVITY_TRANSITIONS，也不需要 Window.FEATURE_CONTENT_TRANSITIONS。事实上，你甚至不需要做任何额外的操作就可以完成这项操作了。

##Transition Names

The framework needs a way to associate Views on the first screen to their counterparts on the second screen. Lollipop also introduced a new “transition name” property on Views that is the key to making this association.

There are two ways to add a transition name to your Views:

Transition 框架需要一个能将当前页面的 View 关联到将要跳转到的页面的办法，而 Lolipop 为我们提供的办法就是：通过名为 “Transition Name” 的 View 属性将两者关联在一起。

下面是为 View 添加 Transition Name 的两种方法：

- In code you can use ViewCompat.setTransitionName(). Of course, you can also just call setTransitionName() on devices running Lollipop and up.
- 可以在代码中直接调用 ViewCompat.setTransitionName()，也可以在 Android Lolipop 系统版本以上的设备中直接调用 setTransitionName()。

- In your layout XML, you can use the android:transitionName attribute.
- 在布局的 XML 文件中，直接设置 android:transitionName 属性。

One important item to note is that within a given layout (e.g. all views in screen one), transition names must be unique. Keep this in mind when you are transitioning from a ListView or RecyclerView; defining a transition name in your row XML will lead to each row having the same transition name.

在这里有一点是需要注意的：在一个给定的布局中，Transition Name 必须是唯一的，这一点你一定要牢记在心，特别是在使用 ListView 或 RecyclerView 的时候，要不然每一个 Item 都会有相同的 Transition Name。

##Set up the FragmentTransaction

Setting up your FragmentTransactions should look very familiar:

为 Fragment 添加 Transition 就像下面的代码看起来那样简单：

```java
getSupportFragmentManager()
        .beginTransaction()
        .addSharedElement(sharedElement, transitionName)
        .replace(R.id.container, newFragment)
        .addToBackStack(null)
        .commit();
```

The new step is calling addSharedElement() to specify what Views to share between the Fragments.

The View passed to addSharedElement() is the View in the first Fragment you want to “share” with the second Fragment. The transition name here is the transition name of the “shared” View in the second Fragment. If the View in the first screen has the transition name “foo” and the View in the second screen has the transition name “bar,” then your want to pass in “bar”.

只需要调用 addSharedElement() 来关联要与 Fragment 共享的 View。

作为参数传递给 addSharedElement() 的 View 就是第一个 Fragment 中你所想要与即将跳转的 Fragment 共享的 View。而这个方法的第二个参数要求填入的 Transition Name，就是在跳转的 Fragment 中的该共享 View 的 Transition Name。例如，当前 Fragment 中共享 View 的 Transition Name 为 "foo"，即将跳转的 Fragment 中的共享 View 的 Transition Name 为 "bar"，那么在 addSharedElement() 中传递的第二个参数就应该是 "bar"。

##Specifying the transition animations
##指定 Transition 动画

Finally we need to specify how we want to animate the transition between Fragments.

For the shared element:

最后我们需要指定 Fragment 切换时我们需要的 Transition 过渡动画。

为共享元素添加的办法：

- Call setSharedElementEnterTransition() to specify how the View moves from the first Fragment to the second Fragment.
- 调用 setSharedElementEnterTransition() 指定 View 如何从第一个 Fragment 转换为跳转 Fragment 中的 View。

- Call setSharedElementReturnTransition() to specify how the View moves from the second Fragment back to the first Fragment when the user hits the back button.
- 调用 setSharedElementReturnTransition() 指定 View 在用户点击返回按钮后如何从跳转 Fragment 中回到第一个 Fragment 中。

Note that you need to call these methods on the second Fragment. If you set these on the originating Fragment, nothing will happen.

记住，返回 Transition 需要在跳转 Fragment 中调用相应的方法，要不然你得不到你想要的效果的。

You can animate the transition for all non-shared Views as well. For these Views, use setEnterTransition(), setExitTransition(), setReturnTransition(), and setReenterTransition() on the appropriate Fragment.

当然了，你也可以为任何非共享的 View 设置 Transition 过渡动画，只不过调用的 API 变了：在对应的 Fragment 中调用 setEnterTransition(), setExitTransition(), setReturnTransition(), 和 setReenterTransition() 这些方法就可以了。

Each of these methods takes in a single parameter, which is the Transition animation to use for the transition.
We are going to keep our animations fairly simple. We will use a custom transition for the movement of the image (more on that in a second), and a Fade exit transition.

这四个方法都只接收一个参数，也就是你所希望使用的 Transition 过渡动画。而我们希望整个切换过程动画不要太复杂，简简单单的就好，所以我们会使用一个自定义 Transition 来完成淡入淡出的弹出效果。

##Transition animation classes

Android provides some pre-made transition animations that are suitable for many use cases. Fade will perform a simple fade. Slide will slide views in from the sides of the screen. Explode can be fun- views will all move away from a particular focal point. Finally, AutoTransition will fade, move, and resize. These are just a few examples- explore the transition package for yourself to find more!

I mentioned that we need a custom transition to move our image. Here it is:

Android 已经提供了一些适用于大多数场景的 Transition 动画了，淡入/淡出就是普通的淡入/淡出效果。滑动会让 View 从一端滑动到另一端。爆炸效果看起来蛮有趣的 - View 会从一个点散开。AutoTransition 则会淡入/淡出，移动，大小变化。这些都是简单的 Transition 用例，有兴趣的话可以到 Transition 包中发现更大的世界哦～

```java
public class DetailsTransition extends TransitionSet {
    public DetailsTransition() {
        setOrdering(ORDERING_TOGETHER);
        addTransition(new ChangeBounds()).
                addTransition(new ChangeTransform()).
                addTransition(new ChangeImageTransform()));
    }
}
```

This transition is just a set of three transitions that will play together:

这里用到的 Transition 就是三个不同的 Transition 过渡动画同时播放的效果：

- ChangeBounds animates the bounds (location and size) of the view.
- ChangeBounds 显示 View 大小和位置变化的动画

- ChangeTransform animates the scale of the view, including the parent.
- ChangeTransform 显示 View 及其父布局的缩放动画

- ChangeImageTransform allows us to change the size (and/or scale type) of the image
- ChangeImageTransform 能修改图片的大小或者缩放

If you are curious about how these three interact together, try out the sample app and try removing one at a time to see how the animation breaks.

You can also define more complex transitions like this using XML. If you prefer XML, check out the [Transition documentation.](https://developer.android.com/reference/android/transition/Transition.html)

如果你想知道这三个 Transition 是怎么交互到一起的，运行我的示例 App，然后把其中的某一个移除就会懂了。

你当然也可以使用 XML 定义更多复杂的 Transition 过渡动画效果，如果你更喜欢用 XML 来定义过渡动画效果的话，不妨看看[文件](https://developer.android.com/reference/android/transition/Transition.html)

##Putting it all together
##把所有上面提到的合并到一起

Our final code for performing this transition is fairly simple:

显示示例图的过渡动画的最终代码很简单：

```java
DetailsFragment details = DetailsFragment.newInstance();

// Note that we need the API version check here because the actual transition classes (e.g. Fade)
// are not in the support library and are only available in API 21+. The methods we are calling on the Fragment
// ARE available in the support library (though they don't do anything on API < 21)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    details.setSharedElementEnterTransition(new DetailsTransition());
    details.setEnterTransition(new Fade());
    setExitTransition(new Fade());
    details.setSharedElementReturnTransition(new DetailsTransition());
}

getActivity().getSupportFragmentManager()
        .beginTransaction()
        .addSharedElement(holder.image, "sharedImage")
        .replace(R.id.container, details)
        .addToBackStack(null)
        .commit();
```

We are using our custom DetailsTransition for our shared element enter and return animation. All the other views in our first screen will exit with a Fade transition, and the non-shared views in the second fragment will enter with a Fade as well.

There you have it! An easy to implement transition between two Fragments!

我们用自定义的 DetailsTransition 过渡动画来显示共享元素的跳转和返回动画，其他的 View 都会以淡入/淡出的形式随着动画一起切换。