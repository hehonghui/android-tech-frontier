创建 RecyclerView LayoutManager – Part 3
---

> * 原文链接 : [Building a RecyclerView LayoutManager – Part 3][part3]
> * 原文作者 : [Dave Smith][author]
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者:[chaossss](https://github.com/chaossss) 
* 状态 :   完成 


# Building a RecyclerView LayoutManager – Part 3


>本文是这个系列中的 Part 3，这里是 [Part 1][part1] 和 [Part 2][part2] 的链接。

在[之前的文章][part2]里，我们讨论了怎样对数据集改变和定量滚动
提供正确的支持。接下来我们会介绍怎样给 LayoutManager 添加
合适的动画效果。

>友情提醒：示例中的代码在这里 [Github][sample-github]

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


使用这些方法你的 LayoutManager 会得到一个很简单的默认 item 动画。
这些动画是根据当前每一个 view 在改变后是否还存在于 layout 之中生成的。
新的 view 渐入，被移除的 view 淡出，其他 view 移动到新的位置。
下面是我们 grid layout 示例的动画效果：

![img][animate-01]
 
不过这里有个问题，一些没有被移除的 item 也淡出了。
这是因为它们在父控件 RecyclerView 的边界中不再可见。
我们想要这些 view 朝着用户期望的方向滑去，但是框架只知道
我们的代码在数据改变后没有显示出这些 item。此外，
新加入的 view 是淡入进来的，让他们从预定位置滑入界面会更好。

我们要给 LayoutManager 加点东西才能实现这些。

---

#Predictive Item Animations

下面的图片展示了我们期望的移除 item 动画效果：
![img][animate-02]
左侧一列 items 滑到右侧填补空白部分的动画很引人注意。
和这个差不多，你可以脑补出在这个位置添加一个 item 时的动画效果。

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

#在  pre-layout 阶段该做些什么

在`onLayoutChildren()`的  pre-layout 阶段，
你应该运行你的布局逻辑设置动画的**初始状态**。
这需要你在动画执行前布局所有 当前可见的 view **和** 在动画后会可见的 view
(被称为 **APPEARING** view)。Appearing views 应该被布局在
屏幕之外，用户期望它进入的位置。框架会捕获他们的位置，
籍此创建更合适的动画效果。

>我们可以使用 `RecyclerView.State.isPreLayout()` 来检测当前处于哪一阶段

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

>Tip：在 pre-layout 期间，RecyclerView 会尝试用 view
>在 adapter 中的位置匹配它们的"原位置"(数据改变前的位置)。
>如果你想通过 position 请求一个 view，并且希望这个位置
>是这个视图初始化时的位置。就不要在 pre-layout 和
>real-layout 期间改变它们。

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

在 `layoutAppearingViews()`这个方法里，每一个 appearing view
被布局到它的"全局"位置(就是它在这个网格中占据的行/列)。
虽然位置在屏幕之外，但是为框架创建滑入 view 动画的起始点提供了
必要的数据。


---

#Changes for the “Real” Layout

[part1][part1]中我们已经讨论过布局期间的基本工作，
然而要想为我们的动画提供支持还要做一些修改。
其中之一就是判断有没有 disappearing views。在我们的示例中
是通过运行一个普通的布局过程，然后检查 Recycler
的 scrap heap 之中有没有剩下的 view。


>注意：我们之所以能以这种方式使用 scrap heap 是因为
>在每一次布局过程开始前，布局逻辑总是调用了
>`detachAndScrapAttachedViews()`这个方法。
>前面说过，这是布局中你需要遵循的最佳实践。

---
Views still in scrap that aren’t considered removed are 
disappearing views. We need to lay these views out in 
their off-screen positions so the animation system 
can slide them out of view (instead of just fading them out).

仍在 scrap 中没有被移除的视图就是 disappearing views。
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

>小心：布局视图(然后将它们加入container)把它们从 scrap 列表中移除。
>在开始变化前，小心处理你需要从 scrap 中获取的视图，否则你可能会
>在这个集合上出现并发修改的问题结束运行。


和之前处理 appearing views  的代码差不多，`layoutDisappearingView()`
将所有剩余 view 放在与之对应的"全局"位置作为最终布局位置。
给框架提供必要信息创建出适当方向的滑出动画。

下面的图片可以帮你理解`FixedGridLayoutManager`之中的过程：

- 黑框是 `RecyclerView` 的可视边界。
- Red View：数据集中被移除的 item。
- Green View (Appearing View)：开始时没有，在 pre-layout 过程中被布局到屏幕外的item。
- Purple Views (Disappearing views)：pre-layout 时期放置在他们的原始位置 ，
	real-layout 时期被布局到屏幕之外的位置。

![img][animate-03]

---


#响应屏幕外的变动
你或许注意到在上一节中我们可以判断可视 views 的移除操作。
如果变化出现在可视边界之外会怎样？这取决于你的布局结构，
像这样的变化可能需要你调整布局来达到更好的动画效果。

Adapter 会将这个变化 post 给你的 LayoutManager。你可以覆写
`onItemsRemoved()`, `onItemsMoved()`, `onItemsAdded()` 或者
`onItemsChanged()` 响应 item 的这些事件，无论 item 
在当前布局中是否可见。

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

>TIP：如果被移除的 item 是可见的，这个方法在 pre-layout 
>之后还会被调用。这也就是为什么
>当被移除的可见 views 出现时我们仍要从它们获取数据。

所有步骤就位，现在我们可以启动这个应用啦。可以看到左边消失的items
移到对应行的后面。右边新出现的 items 滑动进入现有的界面。
现在，新的动画中只有被移除的 item 是淡出的了。

![img][animate-04]

---

#未完待续...

我说过...这应该是这系列中的最后一篇。不过，在编写 `FixedGridLayoutManager`
动画效果的过程中又出现了些有趣的问题，并不是所有自定义的实现。
所以在下一篇文章里(这次真的是最后一篇了)，我会解决这些问题。

特别感谢 [Yiğit Boyar][thanks]提供技术支持，帮助完成这篇文章。

---

1. 如果你的 adapter 使用了固定的 IDs ，可以提供足够的数据推测哪些 view 被 移除/添加/等等
	框架就会尝试 给它添加动画	<a id="b1" href="#1">↩</a>

---


[part1]:../issue-9/创建-RecyclerView-LayoutManager-Part-1.md
[author]:http://wiresareobsolete.com/
[part2]:./创建-RecyclerView-LayoutManager-Part-2.md
[part3]:http://wiresareobsolete.com/2015/02/recyclerview-layoutmanager-3/
[sample-github]:https://github.com/devunwired/recyclerview-playground
[animate-01]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwp-content%2Fuploads%2F2015%2F02%2FDefaultRecyclerAnimationsSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07
[animate-02]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwp-content%2Fuploads%2F2015%2F02%2FRecycleConceptSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07&height=400
[animate-03]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwp-content%2Fuploads%2F2015%2F02%2FRecycleRemove.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07&height=400
[animate-04]:http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwp-content%2Fuploads%2F2015%2F02%2FPredictiveRecyclerAnimationsSmall.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07
[thanks]:https://plus.google.com/111851968937104436377/posts
