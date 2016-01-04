用 Transition 完成 Fragment 共享元素的切换
---

> * 原文链接 : [Fragment transitions with shared elements](https://medium.com/@bherbst/fragment-transitions-with-shared-elements-7c7d71d31cbb#.fp2fgmvoi)
* 原文作者 : [Austin Mueller](http://armueller.github.io/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者:  [chaossss](https://github.com/chaossss) 
* 状态 :  完成 

Material Design 的基础之一是：让不同页面的切换具有意义，即让用户知道与界面发生交互后为何会从当前页面跳转到另一个页面。为此，Android Lolipop 为开发者提供了一个名为 Transition 的过渡动画框架，开发者能够通过这个框架为 Activity 和 Fragment 的跳转提供动画效果。我在了解 Transition 框架的过程中发现现在网上并没有太多将 Transition 应用到 Fragment 上的相关资料，所以我决定写一篇博客来分享一些我学到的知识～

我在开发的一个产品非常简单，用格子的形状来展示图片瀑布流，当用户点击图片时，就会显示该图片的详细信息。多亏了 Transition 框架，我们才能按照我们的想法完成整个图片的交互和显示，效果图如下：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*eh4DsUQSyeoAuKvLQ5NgWw.gif)

如果你不想看下面的文字，而是想直接下载源码的话，[戳我去 Github 下载吧～](https://github.com/bherbst/FragmentTransitionSample)

##在老版本的 Android 系统中会怎样呢？

事实上，这篇博文既为大家带来了好消息，也为大家带来了坏消息。坏消息是：Lolipop 之前的版本并没有可调用的 Transition API；但好消息是：Android support library 提供了可以在 API 21 以上的手机版本中使用 Transition API 的方法，而且不需要为代码添加 API 版本的判断。

##Setup

不像为 Activity 添加 Transition，在为 Fragment 添加 Transition 的时候不需要用到 Window.FEATURE_ACTIVITY_TRANSITIONS，也不需要 Window.FEATURE_CONTENT_TRANSITIONS。事实上，你甚至不需要做任何额外的操作就可以完成这项操作了。

##Transition Names

Transition 框架需要一个能将当前页面的 View 关联到将要跳转到的页面的办法，而 Lolipop 为我们提供的办法就是：通过名为 “Transition Name” 的 View 属性将两者关联在一起。

下面是为 View 添加 Transition Name 的两种方法：

- 可以在代码中直接调用 ViewCompat.setTransitionName()，也可以在 Android Lolipop 系统版本以上的设备中直接调用 setTransitionName()。

- 在布局的 XML 文件中，直接设置 android:transitionName 属性。

在这里有一点是需要注意的：在一个给定的布局中，Transition Name 必须是唯一的，这一点你一定要牢记在心，特别是在使用 ListView 或 RecyclerView 的时候，要不然每一个 Item 都会有相同的 Transition Name。

##Set up the FragmentTransaction

为 Fragment 添加 Transition 就像下面的代码看起来那样简单：

```java
getSupportFragmentManager()
        .beginTransaction()
        .addSharedElement(sharedElement, transitionName)
        .replace(R.id.container, newFragment)
        .addToBackStack(null)
        .commit();
```

只需要调用 addSharedElement() 来关联要与 Fragment 共享的 View。

作为参数传递给 addSharedElement() 的 View 就是第一个 Fragment 中你所想要与即将跳转的 Fragment 共享的 View。而这个方法的第二个参数要求填入的 Transition Name，就是在跳转的 Fragment 中的该共享 View 的 Transition Name。例如，当前 Fragment 中共享 View 的 Transition Name 为 "foo"，即将跳转的 Fragment 中的共享 View 的 Transition Name 为 "bar"，那么在 addSharedElement() 中传递的第二个参数就应该是 "bar"。

##指定 Transition 动画

最后我们需要指定 Fragment 切换时我们需要的 Transition 过渡动画。

为共享元素添加的办法：

- 调用 setSharedElementEnterTransition() 指定 View 如何从第一个 Fragment 转换为跳转 Fragment 中的 View。

- 调用 setSharedElementReturnTransition() 指定 View 在用户点击返回按钮后如何从跳转 Fragment 中回到第一个 Fragment 中。

记住，返回 Transition 需要在跳转 Fragment 中调用相应的方法，要不然你得不到你想要的效果的。

当然了，你也可以为任何非共享的 View 设置 Transition 过渡动画，只不过调用的 API 变了：在对应的 Fragment 中调用 setEnterTransition(), setExitTransition(), setReturnTransition(), 和 setReenterTransition() 这些方法就可以了。

这四个方法都只接收一个参数，也就是你所希望使用的 Transition 过渡动画。而我们希望整个切换过程动画不要太复杂，简简单单的就好，所以我们会使用一个自定义 Transition 来完成淡入淡出的弹出效果。

##Transition animation classes

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

这里用到的 Transition 就是三个不同的 Transition 过渡动画同时播放的效果：

- ChangeBounds 显示 View 大小和位置变化的动画

- ChangeTransform 显示 View 及其父布局的缩放动画

- ChangeImageTransform 能修改图片的大小或者缩放

如果你想知道这三个 Transition 是怎么交互到一起的，运行我的示例 App，然后把其中的某一个移除就会懂了。

你当然也可以使用 XML 定义更多复杂的 Transition 过渡动画效果，如果你更喜欢用 XML 来定义过渡动画效果的话，不妨看看[文件](https://developer.android.com/reference/android/transition/Transition.html)

##把所有上面提到的合并到一起

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

我们用自定义的 DetailsTransition 过渡动画来显示共享元素的跳转和返回动画，其他的 View 都会以淡入/淡出的形式随着动画一起切换。
