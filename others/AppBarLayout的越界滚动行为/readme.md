AppBarLayout的越界滚动行为
---

> * 原文链接 : [Overscroll AppBarLayout Behavior](https://medium.com/@nullthemall/overscroll-appbarlayout-behavior-e58f1ee2807#.gtmxsk7sw)
* 原文作者 : [Nikola Despotoski](https://medium.com/@nullthemall)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [liuling07](https://github.com/liuling07) 
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成 

Unfortunately, Youtube Music app is not available in my country and I tried to get apk from various piracy sites, but still I wasn’t able to look what’s going on in this app. Thanks to this redditor, who have opened a thread in /r/materialdesign and posted videos captures of Youtube Music app on my request I was able to see the behavior.

很不幸，Youtube音乐应用在我们国家不可使用，我尝试着通过各种盗版网站来获取该应用，但我仍然无法看到在这个应用上发生了什么。感谢这位[redditor](https://www.reddit.com/user/IanSan5653)，在我的请求下，他在[/r/materialdesign](https://www.reddit.com/r/materialdesign)打开了一个[thread](https://www.reddit.com/r/MaterialDesign/comments/3slct5/youtube_music_has_tons_of_animations_and/)并且发表一段录制的视频，我才有机会看到这个行为。

![Youtube视频app的真实截图，可能的行为](https://cdn-images-1.medium.com/max/1200/1*lEMS5RiBLGk3Q72FhXBwxA.gif)

From what I could see, my first guess that the album art is inside a AppBarLayout and scaled when the content below overscrolls. Let’s assume this assumption is correct and attempt to express it in terms of Behavior. IMHO, if my assumptions are true, Google should include overscroll guidelines and specs in their Scrolling Techniques section of MD guidelines.

根据我所看到的，我首先想到的就是专辑封面是放到一个AppBarLayout里面，并且在滚动区域拖到边界的时候尺寸会发生变化。让我们假定这个猜想是正确的并且用“Behavior”这个术语表示它。依鄙人之见，如果我的猜想是正确的，谷歌应该会在Material Design文档的[滚动](https://www.google.com/design/spec/patterns/scrolling-techniques.html)部分提供一个越界滚动的使用说明。

Our goal is to keep the AppBarLayout.Behavior intact and create our extended behavior on top of it. Therefore:

我们的目标就是保证AppBarLayout.Behavior的完整性，在此基础上再创建一个扩展的行为。因此：

```
public class OverscrollScalingViewAppBarLayoutBehavior extends AppBarLayout.ScrollingViewBehavior
```

As it is default AppBarLayout.Behavior and suggests, we need to react only when our dependency view is AppBarLayout. No biggie:

因为这是默认的AppBarLayout.Behavior，所以建议只有在依赖视图是AppBarLayout的时候起作用。

```
@Override
public boolean layoutDependsOn(CoordinatorLayout parent, View child, View dependency) {
 return dependency instanceof AppBarLayout;
}
```

Next we need to obtain instance of the View that we are going to scale on overscroll. Best way is to do this is in onLayoutChild() method:

接下来，我们需要获取想要在拖到边界时要改变尺寸的视图的一个实例。最好的方法就是在onLayoutChild()方法中获取：


```
@Override
public boolean onLayoutChild(CoordinatorLayout parent ....) {
    boolean superLayout = super.onLayoutChild(parent, abl, layoutDirection);
    if (mTargetScalingView == null) {
        mTargetScalingView = parent.findViewByTag(TAG);
        if(mTargetScalingView != null){
             mScaleImpl.obtainInitialValues();
         }
     }
    return superLayout;
}
```

But also we need to react on vertical scrolling:  

而且我们需要保证只有在垂直滚动的时候起作用：

```
@Override
public boolean onStartNestedScroll(CoordinatorLayout coordinatorLayout,... int nestedScrollAxes) {
    return nestedScrollAxes == View.SCROLL_AXIS_VERTICAL;
}
```

Let’s set ViewScaler as our default Scaler, if we haven’t set it programatically, previously.

如果我们先前没有在程序中显示设置，会设置ViewScaler为默认的Scaler。

Really important question is knowing the moment when content is overscrolling. Genuine CoordinatorLayout.Behavior offers a method named onNestedScroll(). This method is called when scrolling is ongoing, but also when we have overscroll. Last two parameters dyUnconsumed and dxUnconsumed, give us the amount of pixels that weren’t consumed by the target view of the behavior.

在内容滚动的瞬间，真正重要的问题就有头绪了。CoordinatorLayout.Behavior提供了一个onNestedScroll()方法，当滚动进行的时候这个方法会被调用，并且当内容滚动到边界的时候也会调用。最后两个参数dyUnconsumed和dxUnconsumed提供了未被该行为的目标视图填满的像素值。

This method is really important for us to perform the scaling. So let’s list the cases when we should scale and when we should not:  

这个方法对我们实现尺寸改变来说太重要了。所以我列出了哪些情况需要改变尺寸，哪些情况不需要：

#### Scale when:
1. There is unconsumed pixels, i.e dyUnconsumed < 0
2. AppBarLayout is expanded, getTopAndBottomOffset() >= mScaleImpl.getInitialParentBottom()

#### 需要改变尺寸
1. 存在未填满的像素，如dyUnconsumed小于0  

2. AppBarLayout是展开的，getTopAndBottomOffset() >= mScaleImpl.getInitialParentBottom()

#### Don’t scale when:
1. We don’t have view to scale, which is child of AppBarLayout
2. There are consumed pixels, i.e dyConsumed != 0

#### 不需要改变尺寸
1. AppBarLayout中没有子视图可以改变尺寸
2. 有填充的像素，如dyConsumed不等于0

```
@Override
public void onNestedScroll(CoordinatorLayout ... int dxUnconsumed, int dyUnconsumed) {
    if (mTargetScalingView == null || dyConsumed != 0) {
        mScaleImpl.cancelAnimations();
        super.onNestedScroll(coordinatorLayout, child, target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed);
        return;
    }

    if (dyUnconsumed < 0 && getTopAndBottomOffset() >= mScaleImpl.getInitialParentBottom()) {
        int absDyUnconsumed = Math.abs(dyUnconsumed);
        mTotalDyUnconsumed += absDyUnconsumed;
        mTotalDyUnconsumed = Math.min(mTotalDyUnconsumed, mTotalTargetDyUnconsumed);
        mScaleImpl.updateViewScale();
    } else {
        mTotalDyUnconsumed = 0;
        mScaleImpl.setShouldRestore(false);
        if (dyConsumed != 0) {
            mScaleImpl.cancelAnimations();
        }
        super.onNestedScroll(coordinatorLayout, .... dxUnconsumed, dyUnconsumed);
    }
}
```

When the nested overscroll has ended, we need to reset views to their original bounds and scales:  

当嵌套的overscroll停止的时候，我们需要将视图的边界和大小重置到它们的原始值。

```
@Override
public void onStopNestedScroll(CoordinatorLayout coordinatorLayout, View child, View target) {
    mScaleImpl.retractScale();
    super.onStopNestedScroll(coordinatorLayout, child, target);

}
```

# ViewScaler
This class implements the logic how AppBarLayout should change its bottom and how view should scale. Mostly this behavior relies on cumulative unconsumed pixels. We can set bound value for maximum cumulative value and easily find how we are going to change AppBarLayout bottom and scale the target view. ParentScaler class which is superclass of ViewScaler is doing the (almost) smooth AppBarLayout expansion and retraction. I’ll spare you by not clog the post with code. If you are interested, you can grab entire code here.

这个类实现了AppBarLayout应该如何改变它的底部以及视图应该如何改变尺寸的逻辑。大多数行为都依赖累积的未填充的像素。我们可以为最大累积值设置一个约束值，这样可以很容的找到要如何改变AppBarLayout底部和改变视图的尺寸。ParentScaler是ViewScaler的父类，它能让AppBarLayout近乎平滑的改变尺寸。我就不在这里贴大量代码了，如果你有兴趣，[可以从这里获取代码](https://gist.github.com/NikolaDespotoski/7d6a019e5aafe60ebade)。



#### Bonus
For the geeks, there is MatrixScaler private class, which I haven’t time to finish it. This class is supposed scale the image Matrix, if the view that suppose to scale is ImageView with ScaleType.MATRIX.  

极客们，这里有个MatrixScaler类，我没有时间去完成它。如果想要改变尺寸的视图是ImageView，并且设置了极客们，这里有个MatrixScaler类，我没有时间去完成它。如果想要改变尺寸的视图是ImageView，并且设置了ScaleType为MATRIX，这个类将可以用使用矩阵的方式来改变图像的尺寸。  

# Demo
[Demo演示地址](https://youtu.be/2udXoC8AXSM)

