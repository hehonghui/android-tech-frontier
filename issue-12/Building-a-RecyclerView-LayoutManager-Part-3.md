创建一个 RecyclerView LayoutManager – Part 3
---

> * 原文链接 : [Building a RecyclerView LayoutManager – Part 3][part3]
> * 原文作者 : [Dave Smith][author]
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者: 
* 状态 :   未完成 


# Building a RecyclerView LayoutManager – Part 3

>This article is Part 3 in our series. Here are links to Part 1 and Part 2 as well.

In the previous post, we discussed adding proper support for data set changes and targeted scrolling. In this installment of the series, we will focus on properly supporting animations in your fancy new LayoutManager.

>In case you’ve forgotten, the code samples are on GitHub.

---

>本文是这个系列中的 Part 3，这里是 [Part 1][part1] 和 [Part 2][part2] 的链接。

在[之前的文章][part2]里，我们讨论了怎样对数据集改变和定量滚动
提供正确的支持。接下来我们会介绍怎样给 LayoutManager 添加
合适的动画效果。

>友情提醒：示例中的代码在这里 [Github][sample-github]

---

#The Problem With Free
We talked about notifyDataSetChanged() the last time, but you may have noticed that changing the data in this way doesn’t animate the change**. RecyclerView includes a new API for making animated changes, which requires you to notify the adapter which positions in the adapter have changed, and what the action was:


- notifyItemInserted() and notifyItemRangeInserted(): Insertion of new item(s) at the given position(s).
- notifyItemChanged() and notifyItemRangeChanged(): Invalidate he item(s) at the given position(s), nothing structural has changed in the data set.
- notifyItemRemoved() and notifyItemRangeRemoved(): Removal of the item(s) at the given position(s).
- notifyItemMoved(): An item has relocated to a new position in the data set.

---

#The Problem With Free

上次我们说到了 `notifyDataSetChanged()` ，但是使用这个方法
不会有数据改变的动画效果<a id="1" href="#b1">(1)</a>。
RecyclerView 提供了新的 API 让我们可以通知 adapter 
做出带有动画效果的改变。它们是：

- `notifyItemInserted()`  和 `notifyItemRangeInserted()`：
	在给定位置/范围插入新item(s)。
- `notifyItemChanged()` 和 `notifyItemRangeChanged()`：
	使给定 位置/范围 的 item(s) 无效，数据集并没有结构上的改变。
- `notifyItemRemoved()` 和 `notifyItemRangeRemoved()`：
	移除给定 位置/范围 的 item(s)。
- `notifyItemMoved()`：
	将数据集中的一个 item 重定位到一个新的位置。

---

By default, your LayoutManager will get “simple item animations” for free when these methods are used. These animations are simply based on whether each current view position is still present in the layout after a change. New views are faded in, removed views are faded out, and other views are moved to their new location. Here’s what our grid layout looks like with the free animations:

使用这些方法你的 LayoutManager 会得到一个很简单的默认 item 动画。
这些动画是根据当前每一个 view 在改变后是否还存在于 layout 之中生成的。
新的 view 渐入，被移除的 view 淡出，其他 view 移动到新的位置。
下面是我们 grid layout 示例的动画效果：

![img][animate-01]
 
 ---
 
 The problem here is that several items fade out that weren’t removed. This is because they are no longer visible inside the parent RecyclerView bounds. We would like the views to slide out of view towards where the user would expect them to go, but at this stage the framework only knows that our code didn’t lay them out again after the data set change took place. In addition, new views are fading in as if they were added. It would be better if these views slid into place from their expected locations as well.

The framework needs our help–we have to add a bit more to the LayoutManager…

不过这里有个问题，一些没有被移除的 item 也淡出了。
这是因为它们在父控件 RecyclerView 的边界中不再可见。
我们想要这些 view 朝着用户期望的方向滑去，但是框架只知道
我们的代码在数据改变后没有显示出这些 item。此外，
新加入的 view 是淡入进来的，让他们从预定位置滑入界面会更好。

我们要给 LayoutManager 加点东西才能实现这些。

---

#Predictive Item Animations
The following animation represents what conceptually ought to happen when an item is removed:

#Predictive Item Animations

下面的图片展示了我们期望的移除 item 动画效果：
![img][animate-02]

---

Notice particularly how the items on the left have to slide up and to the right to fill the gap on the previous row. You can imagine the reverse happening for an item added in this location.

左侧一列 items 滑到右侧填补空白部分的动画很引人注意。
和这个差不多，你可以脑补出在这个位置添加一个 item 时的动画效果。

---

As we discussed in the first post of the series, onLayoutChildren() is typically only called once by the parent RecyclerView during the initial layout or when the data set size (i.e. item count) changes. The predictive item animations feature allows us to provide a more meaningful description of how the views should transition based on changes in the data. We need to start by indicating to the framework that our LayoutManager is able to provide this additional data:

```java
//
```
With this one change, onLayoutChildren() will now be called twice for each batch of data set changes–first as a “pre-layout” phase, and again for the real layout.


在第一篇文章里曾提到的，`onLayoutChildren()` 通常只会
在父控件 `RecyclerView` 初始化布局 或者 数据集的大小(比如 item 的数量)改变时调用一次。
Predictive Item Animations 
这个特性允许我们给 view (基于数据改变产生)的过渡动画
提供更多有用的信息。想要使用这个特性，就要告诉
框架我们的 `LayoutManager` 提供了这个附加数据：

```java
@Override
public boolean supportsPredictiveItemAnimations() {
    return true;
}
```
有了这个改动，`onLayoutChildren() `会在每次数据集改变后被调用两次，
一次是"预布局"(pre-layout)阶段，一次是真实布局(real layout)。

---

# What Should I Do During Pre-Layout?

During the pre-layout phase of onLayoutChildren(), you should run your layout logic to set up the initial conditions for the change animation. This means that you need to lay out all the views that were currently visible before the change AND any additional views that you know will be visible after the animation runs (these are termed APPEARING views). These extra appearing views should be laid out in the off-screen positions where the user would expect them to be coming from. The framework will capture these positions and use them to animate the new views into place instead of doing a simple fade-in.
>We can check which layout phase we are in via RecyclerView.State.isPreLayout()

#在  pre-layout 阶段该做些什么

在`onLayoutChildren()`的  pre-layout 阶段，
你应该运行你的布局逻辑设置动画的**初始状态**。
这需要你在动画执行前布局所有 当前可见的 view **和** 在动画后会可见的 view
(被称为 **APPEARING** view)。Appearing views 应该被布局在
屏幕之外，用户期望它进入的位置。框架会捕获他们的位置，
籍此创建更合适的动画效果。



>我们可以使用 `RecyclerView.State.isPreLayout()` 来检测当前处于哪一阶段

---
In the FixedGridLayoutManager example, we use pre-layout to determine how many visible views are being removed as a result of the data set change. Removed views are still returned from the Recycler in pre-layout, so you can lay them out in their original location and not have to worry about accounting for an empty space. To indicate future removal to you, LayoutParams.isViewRemoved() will return true for the given view. Our example counts the number of removed views so we have a rough idea of how much space will get filled by appearing views.

在 `FixedGridLayoutManager` 示例中，我们根据数据集的改变
使用  pre-layout 决定哪些 view 被移除。被移除的 view 
在 pre-layout 的 Recycler 中仍然会被返回，所以你不用担心
会出现空白位置。如果你想要判断视图是否会被移除，
可以使用`LayoutParams.isViewRemoved()` 这个方法 。
我们的示例统计了被移除 view 的数量，让我们
对有多少空间会被 appearing views  填充有一个大概的印象。

---

```java
@Override
public void onLayoutChildren(RecyclerView.Recycler recycler, RecyclerView.State state) {
    …

    SparseIntArray removedCache = null;
    /*
     * During pre-layout, we need to take note of any views that are
     * being removed in order to handle predictive animations
     */
    if (state.isPreLayout()) {
        removedCache = new SparseIntArray(getChildCount());
        for (int i=0; i < getChildCount(); i++) {
            final View view = getChildAt(i);
            LayoutParams lp = (LayoutParams) view.getLayoutParams();

            if (lp.isItemRemoved()) {
                //Track these view removals as visible
                removedCache.put(lp.getViewPosition(), REMOVE_VISIBLE);
            }
        }
        …
    }

    …

    //Fill the grid for the initial layout of views
    fillGrid(DIRECTION_NONE, childLeft, childTop, recycler, state.isPreLayout(), removedCache);

    …
}
```

---

>TIP: During pre-layout, RecyclerView attempts to map the adapter positions of your views to their “old” locations (meaning before the data set change). When you ask for a view by position, expect that position to be the initial position of that item view. Beware of trying to transform them yourself between pre-layout and “real” layout.

>Tip：在 pre-layout 期间，RecyclerView 会尝试用 view
>的 adapter 位置匹配它们的"原位置"(数据改变前的位置)。
>如果你想通过 position 请求一个 view，并且希望这个位置
>是这个视图初始化时的位置。就不要在 pre-layout 和
>real-layout 期间改变它们。

---

The final change in the example comes as a modification to fillGrid() in which we will attempt to lay out “N” additional views (per row) as appearing views, where N is the number of visible views being removed. These views will always be filled in from the right on a removal, so they are computed as the positions following the last visible column:

示例代码中最后的变动是对`fillGrid()`进行修改，在这里给 N 
个 appearing views  布局，N 是被移除的可见视图个数。
这些 view 永远是从右侧进入的，所以他们被安排在最后一列
可见 view 的后面。

```java
private void fillGrid(int direction, int emptyLeft, int emptyTop, RecyclerView.Recycler recycler,
        boolean preLayout, SparseIntArray removedPositions) {
    …

    for (int i = 0; i < getVisibleChildCount(); i++) {
        int nextPosition = positionOfIndex(i);

        …

        if (i % mVisibleColumnCount == (mVisibleColumnCount - 1)) {
            leftOffset = startLeftOffset;
            topOffset += mDecoratedChildHeight;

            //During pre-layout, on each column end, apply any additional appearing views
            if (preLayout) {
                layoutAppearingViews(recycler, view, nextPosition, removedPositions.size(), …);
            }
        } else {
            leftOffset += mDecoratedChildWidth;
        }
    }

    …
}

private void layoutAppearingViews(RecyclerView.Recycler recycler, View referenceView,
        int referencePosition, int extraCount, int offset) {
    //Nothing to do...
    if (extraCount < 1) return;

    for (int extra = 1; extra <= extraCount; extra++) {
        //Grab the next position after the reference
        final int extraPosition = referencePosition + extra;
        if (extraPosition < 0 || extraPosition >= getItemCount()) {
            //Can't do anything with this
            continue;
        }

        /*
         * Obtain additional position views that we expect to appear
         * as part of the animation.
         */
        View appearing = recycler.getViewForPosition(extraPosition);
        addView(appearing);

        //Find layout delta from reference position
        final int newRow = getGlobalRowOfPosition(extraPosition + offset);
        final int rowDelta = newRow - getGlobalRowOfPosition(referencePosition + offset);
        final int newCol = getGlobalColumnOfPosition(extraPosition + offset);
        final int colDelta = newCol - getGlobalColumnOfPosition(referencePosition + offset);

        layoutTempChildView(appearing, rowDelta, colDelta, referenceView);
    }
}
```

---

Inside the layoutAppearingViews() helper, each additional appearing view is laid out at it’s “global” position (i.e. the row/column position it would occupy in the grid). This location is off-screen, but gives the framework the data it needs to produce a starting point for the animation to slide these views in.


在 `layoutAppearingViews()`这个方法里，每一个 appearing view
被布局到它的"全局"位置(就是它在这个网格中占据的行/列)。
虽然位置在屏幕之外，但是为框架创建滑入 view 动画的起始点提供了
必要的数据。


---

#Changes for the “Real” Layout
We’ve already discussed the basics of what to do during your layout in Part 1, but we’ll have to tweak the formula a bit with our animation support added. The one additional step will be to determine if we have any disappearing views. In our example, this is done by running a normal layout pass, and then determining if there are any views left in the Recycler’s scrap heap.

#Changes for the “Real” Layout

[part1][part1]中我们已经讨论过布局期间的基本工作，
然而要想为我们的动画提供支持还要做一些修改。
其中之一就是判断有没有 disappearing views。在我们的示例中
是通过运行一个普通的布局过程，然后检查 Recycler
的 scrap heap 之中有没有剩下的 view。

---

>NOTE: We can use the scrap heap in this way because 
>our layout logic always calls detachAndScrapAttachedViews() 
>before starting each layout pass. As discussed previously, 
>this is the best practice to adhere to in your layouts.

>注意：我们能以这种方式使用 scrap heap 是因为
>在每一次布局过程开始前，布局逻辑
>总是调用了`detachAndScrapAttachedViews()`这个方法。
>前面说过，这是布局中你需要遵循的最佳实践。

---
Views still in scrap that aren’t considered removed are 
disappearing views. We need to lay these views out in 
their off-screen positions so the animation system 
can slide them out of view (instead of just fading them out).

仍在 scrap 中没有被移除的视图就是 disappearing views。
我们需要把它们放置到屏幕之外的位置，以便动画系统
将它们滑出视图(用来取代淡出动画)。

---

```java
@Override
public void onLayoutChildren(RecyclerView.Recycler recycler, RecyclerView.State state) {
    …

    if (!state.isPreLayout() && !recycler.getScrapList().isEmpty()) {
        final List<RecyclerView.ViewHolder> scrapList = recycler.getScrapList();
        final HashSet<View> disappearingViews = new HashSet<View>(scrapList.size());

        for (RecyclerView.ViewHolder holder : scrapList) {
            final View child = holder.itemView;
            final LayoutParams lp = (LayoutParams) child.getLayoutParams();
            if (!lp.isItemRemoved()) {
                disappearingViews.add(child);
            }
        }

        for (View child : disappearingViews) {
            layoutDisappearingView(child);
        }
    }
}

private void layoutDisappearingView(View disappearingChild) {
    /*
     * LayoutManager has a special method for attaching views that
     * will only be around long enough to animate.
     */
    addDisappearingView(disappearingChild);

    //Adjust each disappearing view to its proper place
    final LayoutParams lp = (LayoutParams) disappearingChild.getLayoutParams();

    final int newRow = getGlobalRowOfPosition(lp.getViewPosition());
    final int rowDelta = newRow - lp.row;
    final int newCol = getGlobalColumnOfPosition(lp.getViewPosition());
    final int colDelta = newCol - lp.column;

    layoutTempChildView(disappearingChild, rowDelta, colDelta, disappearingChild);
}
```

---

>CAUTION: Laying out views (and, thus, adding them to the container) 
>removes them from the scrap list. Be careful to note the views you 
>need from scrap before you start making changes, or you will end up 
>with concurrent modification issues on the collection.

>小心：布局视图(然后将它们加入container)把它们从 scrap 列表中移除。
>在开始变化前，小心处理你需要从 scrap 中获取的视图，否则你可能会
>在这个集合上出现并发修改的问题结束运行。

---
Similar to our code for the appearing views, layoutDisappearingView() places each remaining view at it’s “global” position as the final layout location. This gives the framework the information that it needs to slide these views out in the proper direction during the animation.

The following image should help to visualize the FixedGridLayoutManager example:
- The black box represents the RecyclerView visible bounds.
- Red View: Item removed from the data set.
- Green Views (Appearing views): Not initially present, but laid out off-screen during pre-layout.
- Purple Views (Disappearing views): Initially placed in their original locations during pre-layout, then laid out off-screen during the “real” layout phase.

---

和之前显示 appearing views  的代码差不多，`layoutDisappearingView()`
将所有剩余 view 放在与之对应的"全局"位置作为最终布局位置。
给框架提供必要信息创建出适当方向的滑出动画。

下面的图片可以帮你理解`FixedGridLayoutManager`之中的过程：

- 黑框是 `RecyclerView` 的可视边界。
- Red View：数据集中被移除的 item。
- Green View (Appearing View)：最开始没有，在 pre-layout 过程中被布局到屏幕外的item。
- Purple Views (Disappearing views)：最初 ，pre-layout 时期放置在他们的原始位置 。之后
	real-layout 时期被布局到屏幕之外的位置。

![img][animate-03]

---

#Reacting to Off-Screen Changes
You may have noticed that our ability to determine a removal change in the last section hinged on the visible views. What if the change occurs outside the visible bounds? Depending on your layout structure, a change like this may still require you to adjust the layout for a better animation experience.

#响应屏幕外的变动
你或许注意到在上一节中我们可以判断可视 views 的移除操作。
如果变化出现在可视边界之外会怎样？这取决于你的布局结构，
像这样的变化可能需要你调整布局来达到更好的动画效果。

---

Luckily, the adapter posts these changes to your LayoutManager as well. You can override onItemsRemoved(), onItemsMoved(), onItemsAdded(), or onItemsChanged() to react to these events even if they occur in a view range that isn’t reflected in the current layout. These methods will give you the position and range of the change.

Adapter 会将这个变化 post 给你的 LayoutManager。你可以覆写
`onItemsRemoved()`, `onItemsMoved()`, `onItemsAdded()` 或者
`onItemsChanged()` 响应 item 的这些事件，无论 item 
在当前布局中是否可见。

---
When the removed range occurs outside the visible area, onItemRemoved() is called before pre-layout. This allows us to collect data about the change that we may need in order to best support any appearing view changes that might be caused by this event.

In our example, we collect these removals in the same way as before, but mark them with a different type.

如果被移除的范围在可视边界之外， 调用 pre-layout 之前会调用
`onItemRemoved()`。我们可以利用它收集和这个变化有关的数据，为
这个事件可能触发的  appearing view 改变提供更好的支持。

示例中，我们像之前一样收集被移除的 view，但是将它们标记成不同的类型。

---

```java
@Override
public void onItemsRemoved(RecyclerView recyclerView, int positionStart, int itemCount) {
    mFirstChangedPosition = positionStart;
    mChangedPositionCount = itemCount;
}

@Override
public void onLayoutChildren(RecyclerView.Recycler recycler, RecyclerView.State state) {
    …

    SparseIntArray removedCache = null;
    /*
     * During pre-layout, we need to take note of any views that are
     * being removed in order to handle predictive animations
     */
    if (state.isPreLayout()) {
        …

        //Track view removals that happened out of bounds (i.e. off-screen)
        if (removedCache.size() == 0 && mChangedPositionCount > 0) {
            for (int i = mFirstChangedPosition; i < (mFirstChangedPosition + mChangedPositionCount); i++) {
                removedCache.put(i, REMOVE_INVISIBLE);
            }
        }
    }

    …

    //Fill the grid for the initial layout of views
    fillGrid(DIRECTION_NONE, childLeft, childTop, recycler, state.isPreLayout(), removedCache);

    …
}
```

---

>TIP: This method is sill called when the removed items are visible. In that case, however, it is called after pre-layout. This is why our example still gathers data from the visible removed views when they are present.

>TIP：如果被移除的 item 是可见的，这个方法在 pre-layout 
>之后还会被调用。这也就是为什么
>当被移除的可见 views 出现时我们仍要从它们获取数据。


---

With all this in place, we can run the sample application again. We can see the disappearing items on the left sliding off to rejoin the end of their previous rows. The new appearing items on the right slide properly into place alongside the existing grid. Now, the only view fading out in our new animation is the view that was actually removed!


所有步骤就位，现在我们可以启动这个应用啦。可以看到左边消失的items
移到对应行的后面。右边新出现的 items 滑动进入现有的界面。
现在，新的动画中只有被移除的 item 是淡出的了。

![img][animate-04]

---

#More To Come…
This was supposed to be the end of this series, I swear! However, there were some interesting issues that came up in building the animations that are specific to the FixedGridLayoutManager use case, and not necessarily all custom implementations. So in the next (and final…I promise this time) post, I’ll address what those challenges were.

A special thanks to Yiğit Boyar for providing much of the technical input that made this post possible!

#未完待续...

我说过...这应该是这系列中的最后一篇。不过，在编写 `FixedGridLayoutManager`
动画效果的过程中又出现了些有趣的问题，并不是所有自定义的实现。
所以在下一篇文章里(这次真的是最后一篇了)，我会解决这些问题。

特别感谢 [Yiğit Boyar][thanks]提供技术支持，帮助完成这篇文章。

---


**The framework will attempt to animate views if your adapter uses stable IDs, which provides enough data to guess which views are removed/added/etc.


1. 如果你的 adapter 使用了固定的 IDs ，可以提供足够的数据推测哪些 view 被 移除/添加/等等
	框架就会尝试 给它添加动画	<a id="b1" href="#1">↩</a>

---


[part1]:http://wiresareobsolete.com/2014/09/building-a-recyclerview-layoutmanager-part-1/
[author]:http://wiresareobsolete.com/
[part2]:http://wiresareobsolete.com/2014/09/recyclerview-layoutmanager-2/
[part3]:http://wiresareobsolete.com/2015/02/recyclerview-layoutmanager-3/
[sample-github]:https://github.com/devunwired/recyclerview-playground
[animate-01]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwordpress%2Fwp-content%2Fuploads%2F2015%2F02%2FDefaultRecyclerAnimationsSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07
[animate-02]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwordpress%2Fwp-content%2Fuploads%2F2015%2F02%2FRecycleConceptSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07&height=400
[animate-03]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwordpress%2Fwp-content%2Fuploads%2F2015%2F02%2FRecycleRemove.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07&height=400
[animate-04]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwordpress%2Fwp-content%2Fuploads%2F2015%2F02%2FPredictiveRecyclerAnimationsSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07
[thanks]:https://plus.google.com/111851968937104436377/posts