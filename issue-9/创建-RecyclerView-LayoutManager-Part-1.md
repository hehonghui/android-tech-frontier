创建一个 RecyclerView LayoutManager – Part 1
---

> * 原文链接 : [Building a RecyclerView LayoutManager – Part 1][source]
> * 原文作者 : [Dave Smith][author]
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :   完成 


# Building a RecyclerView LayoutManager – Part 1

>本文是这个系列中的 Part 1，这里是 [Part 2][part2] 和 [Part 3][part3] 的链接。

现如今，如果你是 Android 开发者，你肯定听说过 RecyclerView 这个控件；
它是一个即将加入 support library 之中的新组件，
通过方便的视图复用轻松实现自定义高效的视图集。
已经有很多优秀的文章介绍了 RecyclerView 基础，讲解如何使用
RecyclerView 提供的内建部分，包括 item animations。所以，
我们就不再重复前人的工作了，下面是一些帮你入门的资料：

- [A First Glance at Android’s RecyclerView][res-1]
- [The new TwoWayView][res-2]
- [RecyclerViewItemAnimators][res-3]

我们的这个系列文章会关注 RecyclerView 底层细节，涉及到创建你自己的 
LayoutManager，做些比单一的 垂直/水平 滚动列表稍稍复杂的东西。

>在我们开始前，你需要知道  LayoutManager API  之所以能够让我们实现
>强大复杂的布局是因为它只替你做了很少的工作；这就意味着
>你不得不自己完成数量可观的代码。如果要在一个项目中使用自定义视图，
>不要陷入过度优化或过度泛化代码之中。你只需要关心
>在你的用例中需要实现的特性就可以了。

# RecyclerView Playground

这个系列中所有的代码段都取自 [RecyclerView Playground sample][demo] 这个项目，
示例应用里包含了各个方面使用 RecyclerView 的实例，从创建简单的 list
到自定义 LayoutManagers。

本文的代码来自 `FixedGridLayoutManager` ，一个可以垂直和水平
滚动的二维的网格布局。

>support library 里也有一个自定义的 LayoutManager；本质上
>是一个自定义 vertical linear list  的实现：
>[SDK_PATH]/extras/android/compatibility/samples/Support7Demos/src/com/example/android/supportv7/widget/RecyclerViewActivity.java
>
>同时，Android L 和 新的 support libraries 可能还没加入 AOSP
>之中，不过 RecyclerView 提供了 **JAR** 资源，可以在这里找到：
>[SDK_PATH]/extras/android/m2repository/com/android/support/recyclerview-v7/21.0.0-rc1/recyclerview-v7-21.0.0-rc1-sources.jar

# The Recycler

首先，了解下 API 的结构。当你需要从一个可能再生的前子视图中
回收旧的 view 或者 获取新的 view 时，
你的 LayoutManager 可以访问一个 `Recycler` 实例。

Recycler 也免掉了直接访问 view 当前适配器方法的麻烦。当你的
LayoutManager 需要一个新的子视图时，只要调用 `getViewForPosition() `
这个方法，Recycler 会决定到底是从头创建一个新的视图
还是重用一个已存在的废弃视图。
你的 LayoutManager 需要及时将不再显示的视图传递给 Recycler，
避免 Recycler 创建不必要的 view 对象。

## Detach vs. Remove

布局更新时有两个方法处理已存在的子视图：detach 和
remove (分离和移除)。Detach 是一个轻量的记录 view 操作。
被 detach 的视图在你的代码返回前能够重新连接。可以通过 Recycler
在不 重新绑定/重新构建 子视图的情况下修改已连接子视图的索引。

Remove 意味着这个 view 已经不需要了。任何被永久移除的 view 都应该
放到 Recycler 中，方便以后重用，不过 API 并没有强制要求。
被 remove 的视图是否被回收取决于你。

## Scrap vs. Recycle

Recycler 有两级视图缓存系统： scrap heap 和 recycle pool (垃圾堆和回收池)，
Scrap heap 是一个轻量的集合，视图可以不经过适配器直接返回给
LayoutManager 。通常被 detach 
但会在同一布局重新使用的视图会临时储存在这里。Recycle pool 存放的
是那些假定并没有得到正确数据(相应位置的数据)的视图，
因此它们都要经过适配器重新绑定后才能返回给 LayoutManager。

当要给 LayoutManager 提供一个新 view 时，Recycler 首先会
检查 scrap heap 有没有对应的 position/id；如果有对应的内容，
就直接返回数据不需要通过适配器重新绑定。如果没有的话，
Recycler 就会从 recycle pool 里弄一个合适的视图出来，
然后用 adapter 给它绑定必要的数据
(就是调用 `RecyclerView.Adapter.bindViewHolder()`) 再返回。
如果 recycle pool 中也不存在有效 view ，就会在绑定数据前
创建新的 view (就是 `RecyclerView.Adapter.createViewHolder()`)，
最后返回数据。

## 经验法则

只要你原意，LayoutManager 的 API 允许你独立完成所有这些任务，
所以可能的组合有点多。通常来说，
如果你想要临时整理并且希望稍后在同一布局中重新使用某个 view 的话，
 可以对它调用 `detachAndScrapView()` 。如果基于当前布局
 你不再需要某个 view 的话，对其调用 `removeAndRecycleView()`。

# Building The Core

LayoutManager 需要实时添加，测量和布局所有它需要的子视图。
当用户滚动屏幕时，布局管理器将来决定什么时候添加新的子视图，
什么时候可以 detach/scrap (分离/废弃)视图。

你需要实现下面这些方法创建一个可行的 LayoutManager 最小系统。

#### generateDefaultLayoutParams()

事实上你只要重写这个方法你的 LayoutManager 就能编译通过了。
实现也很简单，返回一个你想要默认应用给所有从 
Recycler 中获得的子视图做参数的 `RecyclerView.LayoutParams` 实例。
这些参数会在对应的 `getViewForPosition()` 返回前赋值给相应的子视图。

```java
@Override
public RecyclerView.LayoutParams generateDefaultLayoutParams() {
    return new RecyclerView.LayoutParams(
        RecyclerView.LayoutParams.WRAP_CONTENT,
        RecyclerView.LayoutParams.WRAP_CONTENT);
}
```

#### onLayoutChildren()

`onLayoutChildren()` 是 LayoutManager 的主入口。
它会在 view 需要初始化布局时调用，
当适配器的数据改变时(或者整个适配器被换掉时)会再次调用。
**注意！这个方法不是在每次你对布局作出改变时调用的。**
它是 初始化布局 或者 在数据改变时重置子视图布局的好位置。

在接下来的部分，我们会分析在适配器更新时
是怎样使用它基于当前可见元素刷新布局的。
现在，我们将简单地解决这个问题当做子视图布局第一关。
下面是 `FixedGridLayoutManager` 示例的精简版：

```java
@Override
public void onLayoutChildren(RecyclerView.Recycler recycler, RecyclerView.State state) {
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
    
    updateWindowSizing();
    int childLeft;
    int childTop;

    /*
     * Reset the visible and scroll positions
     */
    mFirstVisiblePosition = 0;
    childLeft = childTop = 0;
    
    //Clear all attached views into the recycle bin
    detachAndScrapAttachedViews(recycler);
    //Fill the grid for the initial layout of views
    fillGrid(DIRECTION_NONE, childLeft, childTop, recycler);
}
```

我们会对子视图做一些记录和安排
(为了简便，假设来自适配器的所有子视图都是一样大的)，
确保所有已存在的视图在 scrap heap 之中。我将
大部分工作抽象到 `fillGrid()` 这个辅助方法中以便重用。
我们很快就会看到这个方法在更新可见视图和滚动屏幕中被大量调用。




>就像是自定义实现一个 ViewGroup，你负责触发测量和布局每一个
>从 Recycler 获取到的子视图。API 没有直接完成这项工作 。

通常来说，在这类方法之中你需要完成的主要步骤如下：

1. 在滚动事件结束后检查所有附加视图当前的偏移位置。
2. 判断是否需要添加新视图填充由滚动屏幕产生的空白部分。并从 
	Recycler 中获取视图。
3. 判断当前视图是否不再显示。移除它们并放置到 Recycler 中。
4. 判断剩余视图是否需要整理。发生上述变化后可能
	需要你修改视图的子索引来更好地和它们的适配器位置校准。



注意我们放进 `FixedGridLayoutManager.fillGrid()` 里填充 RecyclerView 的主要步骤。
当到达最大行数时，这个 manager 将位置从右到左排序，封装。

1. 清点目前我们所有的视图。将他们 Detach 以便稍后重新连接。
	
	```java
	SparseArray<View> viewCache = new SparseArray<View>(getChildCount());
	//...
	if (getChildCount() != 0) {
		//...
		//Cache all views by their existing position, before updating counts
		for (int i=0; i < getChildCount(); i++) {
			int position = positionOfIndex(i);
			final View child = getChildAt(i);
			viewCache.put(position, child);
		}
		//Temporarily detach all views.
		// Views we still need will be added back at the proper index.
		for (int i=0; i < viewCache.size(); i++) {
			detachView(viewCache.valueAt(i));
		}
	}
	```
	
2. 测量/布局每一个当前可见的子视图。重新连接已有的视图很简单；
	新的视图是从 Recycler 之中获取的。
	
	```java
	for (int i = 0; i < getVisibleChildCount(); i++) {
	    //...

	    //Layout this position
	    View view = viewCache.get(nextPosition);
	    if (view == null) {
	        /*
	         * The Recycler will give us either a newly constructed view,
	         * or a recycled view it has on-hand. In either case, the
	         * view will already be fully bound to the data by the
	         * adapter for us.
	         */
	        view = recycler.getViewForPosition(nextPosition);
	        addView(view);

	        /*
	         * It is prudent to measure/layout each new view we
	         * receive from the Recycler. We don't have to do
	         * this for views we are just re-arranging.
	         */
	        measureChildWithMargins(view, 0, 0);
	        layoutDecorated(view, leftOffset, topOffset,
	                leftOffset + mDecoratedChildWidth,
	                topOffset + mDecoratedChildHeight);
	    } else {
	        //Re-attach the cached view at its new index
	        attachView(view);
	        viewCache.remove(nextPosition);
	    }

	    //...
	}

	```
	
3. 最终，所有在第一步中 detach 并且没有被重新连接的视图都不可见。
	将它们移入 Recycler 中，以备后用。
	
	```java
	for (int i=0; i < viewCache.size(); i++) {
	    recycler.recycleView(viewCache.valueAt(i));
	}
	```

说明一下，先将所有视图 detach 之后再将需要的视图重新连接是为了
保持每一个视图子索引的顺序 (就是  `getChildAt()` 的索引)。我们希望
可见视图从左上到右下的索引从 `0` 开始，到 `getChildCount()-1` 结束。
当我们上下滑动视图，新的子视图被添加，它的索引顺序会变得不可靠。
我们需要保留正确的索引来在任意点上定位每一个视图。在一个简单地
LayoutManager (比如 LinearLayoutManager)中，子视图可以轻松地插入
list 的两端， 记录层就没有存在的必要了。


# 添加用户交互

目前，我们已经有一个非常好的初始布局，但是它并不能动起来。
RecyclerView 的关键就在于当用户浏览一组数据时动态提供视图。
覆盖一些方法就能实现我们的目的。

#### canScrollHorizontally() & canScrollVertically()

这些方法很简单，在你想要滚动方向对应的方法里返回 true ，
不想要滚动方向对应的方法里返回 false。

```java
@Override
public boolean canScrollVertically() {
    //We do allow scrolling
    return true;
}
```

#### scrollHorizontallyBy() & scrollVerticallyBy()

在这里你应该实现 content 移动的逻辑。RecyclerView 已经处理了 scrolling
和 [flinging][flinging] (注：Fling: Gross gesture, no on-screen target)
触摸操作，不需要处理 MotionEvents 或者 GestureDetectors 这些麻烦事。
你只需要完成下面这三个任务：

1. 将所有的子视图移动适当的位置 (对的，你得自己做这个)。
2. 决定移动视图后 添加/移除 视图。
3. 返回滚动的实际距离。框架会根据它判断你是否触碰到边界。

在 FixedGridLayoutManager 里，这两个方法很像。这里是精简后的垂直滚动实现：

```java
@Override
public int scrollVerticallyBy(int dy, RecyclerView.Recycler recycler,
        RecyclerView.State state) {

    if (getChildCount() == 0) {
        return 0;
    }

    //Take top measurements from the top-left child
    final View topView = getChildAt(0);
    //Take bottom measurements from the bottom-right child.
    final View bottomView = getChildAt(getChildCount()-1);

    //Optimize the case where the entire data set is too small to scroll
    int viewSpan = getDecoratedBottom(bottomView) - getDecoratedTop(topView);
    if (viewSpan <= getVerticalSpace()) {
        //We cannot scroll in either direction
        return 0;
    }

    int delta;
    int maxRowCount = getTotalRowCount();
    boolean topBoundReached = getFirstVisibleRow() == 0;
    boolean bottomBoundReached = getLastVisibleRow() >= maxRowCount;

    if (dy > 0) { // Contents are scrolling up
        //Check against bottom bound
        if (bottomBoundReached) {
            //If we've reached the last row, enforce limits
            int bottomOffset;
            if (rowOfIndex(getChildCount() - 1) >= (maxRowCount - 1)) {
                //We are truly at the bottom, determine how far
                bottomOffset = getVerticalSpace() - getDecoratedBottom(bottomView)
                        + getPaddingBottom();
            } else {
                /*
                 * Extra space added to account for allowing bottom space in the grid.
                 * This occurs when the overlap in the last row is not large enough to
                 * ensure that at least one element in that row isn't fully recycled.
                 */
                bottomOffset = getVerticalSpace() - (getDecoratedBottom(bottomView)
                        + mDecoratedChildHeight) + getPaddingBottom();
            }
            delta = Math.max(-dy, bottomOffset);
        } else {
            //No limits while the last row isn't visible
            delta = -dy;
        }
    } else { // Contents are scrolling down
        //Check against top bound
        if (topBoundReached) {
            int topOffset = -getDecoratedTop(topView) + getPaddingTop();
            delta = Math.min(-dy, topOffset);
        } else {
            delta = -dy;
        }
    }

    offsetChildrenVertical(delta);

    if (dy > 0) {
        if (getDecoratedBottom(topView) < 0 && !bottomBoundReached) {
            fillGrid(DIRECTION_DOWN, recycler);
         } else if (!bottomBoundReached) {
            fillGrid(DIRECTION_NONE, recycler);
         }
    } else {
        if (getDecoratedTop(topView) > 0 && !topBoundReached) {
            fillGrid(DIRECTION_UP, recycler);
        } else if (!topBoundReached) {
            fillGrid(DIRECTION_NONE, recycler);
        }
    }

    /*
     * Return value determines if a boundary has been reached
     * (for edge effects and flings). If returned value does not
     * match original delta (passed in), RecyclerView will draw
     * an edge effect.
     */
    return -delta;
}
```

我们获得了滚动距离(dx/dy)的增量来验证。方法的第一部分判断
按照所给的距离(标志给了滚动方向)滚动会不会超过边界。如果会，
我们需要计算出视图实际滚动的距离。

在这个方法里，我们需要自己手工移动这些视图。
`offsetChildrenVertical() ` 和 `offsetChildrenHorizontal() ` 
这两个方法 可以帮助我们处理匀速移动。
**如果你不实现它，你的视图就不会滚动**。
移动视图操作完成后，我们触发另一个填充操作，
根据滚动的距离替换视图。

最后，将实际位移距离应用给子视图。RecyclerView 根据这个值判断是否
绘制到达边界的效果。一般意义上，如果返回值不等于传入的值就意味着
需要绘制边缘的发光效果了。
**如果你返回了一个带有错误方向的值，框架的函数会把这个当做一个大的变化
你将不能获得正确的边缘发光特效。**

除了用来判断绘制边界特效外，返回值还被用来决定什么时候取消 flings。
返回错误的值会让你失去对 content  fling 的控制。框架会认为你已经提前
触碰到边缘并取消了 fling。

#热身结束~

目前，我们已经实现了基本的功能。它少了很多的细节部分，
不过滚动和适当的视图回收已经完成了。
关于自定义 LayoutManager 还有很多要说的东西。
[接下来][part2]，我们会细致的介绍 decorations, data set changes
还有实现滚动到特定位置。

---


[source]:http://wiresareobsolete.com/2014/09/building-a-recyclerview-layoutmanager-part-1/
[author]:http://wiresareobsolete.com/
[part2]:../issue-13/创建-RecyclerView-LayoutManager-Part-2.md
[part3]:../issue-13/创建-RecyclerView-LayoutManager-Part-3.md
[res-1]:http://www.grokkingandroid.com/first-glance-androids-recyclerview/
[res-2]:http://lucasr.org/2014/07/31/the-new-twowayview/
[res-3]:https://github.com/gabrielemariotti/RecyclerViewItemAnimators
[demo]:https://github.com/devunwired/recyclerview-playground
[flinging]:http://www.google.com/design/spec/patterns/gestures.html#gestures-touch-mechanics
