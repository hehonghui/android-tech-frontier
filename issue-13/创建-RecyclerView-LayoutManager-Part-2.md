创建 RecyclerView LayoutManager – Part 2
---

> * 原文链接 : [Building a RecyclerView LayoutManager – Part 2][part2]
> * 原文作者 : [Dave Smith][author]
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者:[chaossss](https://github.com/chaossss) 
* 状态 :   完成 


# 创建 a RecyclerView LayoutManager – Part 2

>本文是这个系列中的 Part 2，这里是 [Part 1][part1] 和 [Part 3][part3] 的链接。

上次我们讲了创建一个 RecyclerView LayoutManager 的核心步骤。接下来，
我们会介绍如何给普通基于适配器的 View 加入一些附加特性。

>友情提醒：示例中的代码在这里 [Github][sample-github]

---

#Item Decorations 支持

RecyclerView 有一个很好的特性 `RecyclerView.ItemDecoration`，它可以给
子视图添加自定义样式，还可以在不修改子视图布局参数的情况下插入
布局属性(margins)。后者就是 LayoutManager 必须提供的约束子视图布局方式。

---


>[RecyclerPlayground ][sample-github] 里有几个 decorator 用来介绍它们的实现方式。

LayoutManager 中提供了一些辅助方法操作 decorations ，不需要我们自己实现：

- 用`getDecoratedLeft()`代替`child.getLeft()`获取子视图的 left 边缘。
- 用`getDecoratedTop()`代替`getTop()`获取子视图的 top 边缘。
- 用`getDecoratedRight()`代替`getRight()`获取子视图的 right 边缘。
- 用`getDecoratedBottom()`代替`getBottom()`获取子视图的 bottom 边缘。
- 使用 `measureChild() ` 或 `measureChildWithMargins()` 代替`child.measure()` 
	测量来自 Recycler 的新视图。
- 使用`layoutDecorated() `代替 `child.layout()` 布局来自 Recycler 的新视图。
- 使用  `getDecoratedMeasuredWidth() `或 `getDecoratedMeasuredHeight()`
	代替 `child.getMeasuredWidth()`或` child.getMeasuredHeight()`获取
	子视图的测量数据。

只要你使用了正确的方法去获取视图的属性和测量数据，RecyclerView 会自己搞定细节部分的处理。

---

#数据集改变

当使用 `notifyDataSetChanged()`触发 `RecyclerView.Adapter` 的更新操作时，
LayoutManager 负责更新布局中的视图。这时，`onLayoutChildren()`会被再次调用。
实现这个功能需要我们调整代码，判断出当前状态是生成一个新的视图 还是 adapter 
更新期间的视图改变。下面是`FixedGridLayoutManager`中的填充方法的完整实现：

```java
@Override
public void onLayoutChildren(RecyclerView.Recycler recycler, RecyclerView.State state) {
    //We have nothing to show for an empty data set but clear any existing views
    if (getItemCount() == 0) {
        detachAndScrapAttachedViews(recycler);
        return;
    }

    //...on empty layout, update child size measurements
    if (getChildCount() == 0) {
        //Scrap measure one child
        View scrap = recycler.getViewForPosition(0);
        addView(scrap);
        measureChildWithMargins(scrap, 0, 0);

        /*
         * We make some assumptions in this code based on every child
         * view being the same size (i.e. a uniform grid). This allows
         * us to compute the following values up front because they
         * won't change.
         */
        mDecoratedChildWidth = getDecoratedMeasuredWidth(scrap);
        mDecoratedChildHeight = getDecoratedMeasuredHeight(scrap);

        detachAndScrapView(scrap, recycler);
    }

    updateWindowSizing();

    int childLeft;
    int childTop;
    if (getChildCount() == 0) { //First or empty layout
        /*
         * Reset the visible and scroll positions
         */
        mFirstVisiblePosition = 0;
        childLeft = childTop = 0;
    } else if (getVisibleChildCount() > getItemCount()) {
        //Data set is too small to scroll fully, just reset position
        mFirstVisiblePosition = 0;
        childLeft = childTop = 0;
    } else { //Adapter data set changes
        /*
         * Keep the existing initial position, and save off
         * the current scrolled offset.
         */
        final View topChild = getChildAt(0);
        if (mForceClearOffsets) {
            childLeft = childTop = 0;
            mForceClearOffsets = false;
        } else {
            childLeft = getDecoratedLeft(topChild);
            childTop = getDecoratedTop(topChild);
        }

        /*
         * Adjust the visible position if out of bounds in the
         * new layout. This occurs when the new item count in an adapter
         * is much smaller than it was before, and you are scrolled to
         * a location where no items would exist.
         */
        int lastVisiblePosition = positionOfIndex(getVisibleChildCount() - 1);
        if (lastVisiblePosition >= getItemCount()) {
            lastVisiblePosition = (getItemCount() - 1);
            int lastColumn = mVisibleColumnCount - 1;
            int lastRow = mVisibleRowCount - 1;

            //Adjust to align the last position in the bottom-right
            mFirstVisiblePosition = Math.max(
                    lastVisiblePosition - lastColumn - (lastRow * getTotalColumnCount()), 0);

            childLeft = getHorizontalSpace() - (mDecoratedChildWidth * mVisibleColumnCount);
            childTop = getVerticalSpace() - (mDecoratedChildHeight * mVisibleRowCount);

            //Correct cases where shifting to the bottom-right overscrolls the top-left
            // This happens on data sets too small to scroll in a direction.
            if (getFirstVisibleRow() == 0) {
                childTop = Math.min(childTop, 0);
            }
            if (getFirstVisibleColumn() == 0) {
                childLeft = Math.min(childLeft, 0);
            }
        }
    }

    //Clear all attached views into the recycle bin
    detachAndScrapAttachedViews(recycler);

    //Fill the grid for the initial layout of views
    fillGrid(DIRECTION_NONE, childLeft, childTop, recycler);
}
```

---

我们根据有没有已经被 attach 的子视图来判断当前是一个新的布局还是一个更新操作。
如果是更新，我们根据第一个可见视图的 position（通过监测视图左上角是哪个子视图）
和当前 x/y 滑动的位移这些信息去执行新的 `fillGrid()`，同时保证左上角的 item 位置不变。

---

下面是一些需要特殊处理得情况：

- 当新的数据集很小，不足以滑动时，布局会将左上角重置为 position 是 0 的item。
- 如果新的数据集很小，保持当前位置会使滚动超出边界。
	我们就应该调整第一个 item 的位置，以便和右下角对齐。
	
---

###onAdapterChanged()

这个方法提供了另一个重置布局的场所，设置新的 adapter 会触发这个事件
(在这，`setAdapter`会被再次调用)。
这个阶段你可以安全的返回一个与之前 adapter 完全不同的视图。所以，
示例中我们移除了所有当前视图(并没有回收它们)。

```java
@Override
public void onAdapterChanged(RecyclerView.Adapter oldAdapter, RecyclerView.Adapter newAdapter) {
    //Completely scrap the existing layout
    removeAllViews();
}
```

移除视图会触发一个新的布局过程，当  `onLayoutChildren()` 被再次调用时，
我们的代码会执行创建新视图的布局过程，因为现在没有 attched 的子视图。

---

#Scroll to Position
另一个重要的特性就是给 LayoutManager 添加滚动到特定位置的功能。
可以带有有动画效果，也可以没有，下面是对应的两个回调方法。

###scrollToPosition()

当 layout 应该立即将所给位置设为第一个可见 item 时，调用 RecyclerView 的 `scrollToPosition()`。
在一个 vertical list 里，item 应该放在顶部；horizontal list 中，通常放在左边。在我们的
网格布局中，被选中的 item 应该放在视图的左上角。

```java
@Override
public void scrollToPosition(int position) {
    if (position >= getItemCount()) {
        Log.e(TAG, "Cannot scroll to "+position+", item count is "+getItemCount());
        return;
    }

    //Ignore current scroll offset, snap to top-left
    mForceClearOffsets = true;
    //Set requested position as first visible
    mFirstVisiblePosition = position;
    //Trigger a new view layout
    requestLayout();
}
```

因为有一个良好的 `onLayoutChildren()` 实现，这里就可以简单的更新目标位置并触发一个
新的 fill 操作。

---

###smoothScrollToPosition()

在带有动画的情况下，我们需要使用一些稍微不同的方法。
在这方法里我们需要创建一个 `RecyclerView.SmoothScroller`实例，
然后在方法返回前请求`startSmoothScroll()`启动动画。

`RecyclerView.SmoothScroller` 是提供 API 的抽象类，含有四个方法：

---

- `onStart()`：当滑动动画开始时被触发。
- `onStop()`：当滑动动画停止时被触发。
- `onSeekTargetStep()`：当 scroller 搜索目标 view 时被重复调用，这个方法负责读取提供的 
	dx/dy ，然后更新应该在这两个方向移动的距离。
	- 这个方法有一个`RecyclerView.SmoothScroller.Action`实例做参数。
		通过向 action 的 `update()`方法传递新的 dx, dy, duration 和 `Interpolator` ，
		告诉 view 在下一个阶段应该执行怎样的动画。
	- **NOTE：** 如果动画耗时过长，框架会对你发出警告，
			应该调整动画的步骤，尽量和框架标准的动画耗时相同。
- `onTargetFound()`：只在目标视图被 attach 后调用一次。	这是将目标视图要通过动画移动到准确位置最后的场所。
	- 在内部，当 view 被 attach 时使用  LayoutManager  的 `findViewByPosition()` 方法
		查找对象。如果你的 LayoutManager 可以有效匹配 view 和 position ，
		可以覆写这个方法来优化性能。默认提供的实现是通过每次遍历所有子视图查找。

---

你可以自己实现一个 scroller 达到你想要的效果。不过这里我们只使用系统提供的
`LinearSmoothScroller` 就好了。只需实现一个方法`computeScrollVectorForPosition()`，
然后告诉 scroller 初始方向还有从当前位置滚动到目标位置的大概距离。

---
```java
@Override
public void smoothScrollToPosition(RecyclerView recyclerView, RecyclerView.State state, final int position) {
    if (position >= getItemCount()) {
        Log.e(TAG, "Cannot scroll to "+position+", item count is "+getItemCount());
        return;
    }

    /*
     * LinearSmoothScroller's default behavior is to scroll the contents until
     * the child is fully visible. It will snap to the top-left or bottom-right
     * of the parent depending on whether the direction of travel was positive
     * or negative.
     */
    LinearSmoothScroller scroller = new LinearSmoothScroller(recyclerView.getContext()) {
        /*
         * LinearSmoothScroller, at a minimum, just need to know the vector
         * (x/y distance) to travel in order to get from the current positioning
         * to the target.
         */
        @Override
        public PointF computeScrollVectorForPosition(int targetPosition) {
            final int rowOffset = getGlobalRowOfPosition(targetPosition)
                    - getGlobalRowOfPosition(mFirstVisiblePosition);
            final int columnOffset = getGlobalColumnOfPosition(targetPosition)
                    - getGlobalColumnOfPosition(mFirstVisiblePosition);

            return new PointF(columnOffset * mDecoratedChildWidth, rowOffset * mDecoratedChildHeight);
        }
    };
    scroller.setTargetPosition(position);
    startSmoothScroll(scroller);
}
```

---

在这个实现中，和现有 ListView 的行为相似，无论是 RecyclerView 的哪个方向滚动，
当视图完全可见时滚动就会停止。



---

#接下来？

我们现在已经有些起色了！事实上还有很多可以实现的功能。在[下篇文章][part3]中，我们会介绍
如何给你的 LayoutManager 提供数据集改变时的动画效果。


---

[part1]:../issue-9/创建-RecyclerView-LayoutManager-Part-1.md
[author]:http://wiresareobsolete.com/
[part2]:http://wiresareobsolete.com/2014/09/recyclerview-layoutmanager-2/
[part3]:./创建-RecyclerView-LayoutManager-Part-3.md
[sample-github]:https://github.com/devunwired/recyclerview-playground
