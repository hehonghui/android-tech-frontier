#拖拽RecyclerView

---

> * 原文链接 : [Drag and Swipe with RecyclerView](https://medium.com/@ipaulpro/drag-and-swipe-with-recyclerview-b9456d2b1aaf)
* 原文作者 : [Paul Burke](https://medium.com/@ipaulpro)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 : 完成

<video loop video autoplay class="graf-image" data-image-id="1*4Cqfs-75ibhvC_3BMEIvVA.gif" data-width="1440" data-height="600"><source src="https://d262ilb51hltx0.cloudfront.net/max/2000/1*4Cqfs-75ibhvC_3BMEIvVA.mp4" type="video/mp4"></video>



现在有很多使用RecyclerView实现“**拖拽(drag & drop)**”和“**滑动消失(swipe-to-dismiss)**”效果的教程、库、和示例代码。虽然现在有更新的、更好的方式可以实现但是大部分的代码仍旧使用了旧的API*[View.OnDragListener](http://developer.android.com/guide/topics/ui/drag-drop.html)*或者使用Roman Nurik’s *[SwipeToDismiss](https://github.com/romannurik/Android-SwipeToDismiss)*这个库中的处理方式。有一部分使用了新的API，但主要是依赖GestureDetectors 和 onInterceptTouchEvent或者实现的方式很复杂。实际上有非常简单的方式就可以把新特性添加到RecyclerView中。只需要一个类，并且它已经包含在Android Support Library之中。



###[ItemTouchHelper](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.html)



ItemTouchHelper是一个非常强大的工具类用于处理当你添加drag&drop 和 swipe-to-dismiss特性到RecyclerView时所关心的那些问题。它是[RecyclerView.ItemDecoration](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.ItemDecoration.html)的子类,意味着可以向已经存在的LayoutManager 和 Adapter(!)中添加任何东西，并且也可以处理已经存在的item animations、type-restricted、drop settling animations甚至更多。
在这篇文章我将示范一下ItemTouchHelper的简单实现，稍后，在这一系列的文章中我们将延伸扩展更多特性。



##忽略开头


只对代码感兴趣？ Github源码: *[Android-ItemTouchHelper-Demo](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo)*,
Apk下载:*[from here](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo/releases)*.


##配置


首先我们需要对RecyclerView进行配置，如果没有准备好，请先更新你的build.gradle，添加RecyclerView依赖。

```java
compile 'com.android.support:recyclerview-v7:22.2.0'

```


在任意RecyclerView.Adapter 和 LayoutManager都可以使用ItemTouchHelper，这篇文章代码的基本文件在这：

[https://gist.github.com/iPaulPro/2216ea5e14818056cfcc](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc)




##使用ItemTouchHelper 和 ItemTouchHelper.Callback


为了使用ItemTouchHelper，你必须得先创建*[ItemTouchHelper.Callback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.Callback.html)*。这是一个接口用于监听“move” 和 “swipe”的状态。也可用于你要控制所选的view的状态和重写默认动画。如果你只是想使用基本实现你可以使用系统提供的一个帮助类*[SimpleCallback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.SimpleCallback.html)*，但是本着学习的目的，我们还是自己来实现。



实现基本的drag & drop 和 swipe-to-dismiss必须实现以下主要的回调函数:

```java

getMovementFlags(RecyclerView, ViewHolder)
onMove(RecyclerView, ViewHolder, ViewHolder)
onSwiped(ViewHolder, int)

```


使用两个帮助函数:

```java
isLongPressDragEnabled()
isItemViewSwipeEnabled()

```


我们将逐个进行介绍.

```java

@Override
public int getMovementFlags(RecyclerView recyclerView, 
        RecyclerView.ViewHolder viewHolder) {
    int dragFlags = ItemTouchHelper.UP | ItemTouchHelper.DOWN;
    int swipeFlags = ItemTouchHelper.START | ItemTouchHelper.END;
    return makeMovementFlags(dragFlags, swipeFlags);
}

```


ItemTouchHelper允许非常简单的判断屏幕事件的走向。必须重写**getMovementFlags()**来说明支持哪个方向的拖拽和滑动。使用帮助类**ItemTouchHelper.makeMovementFlags(int, int)**来管理returned标志。这样就可以在同一个方向进行拖拽和滑动了。

```java

@Override
public boolean isLongPressDragEnabled() {
    return true;
}

```



ItemTouchHelper可以只支持drag而不支持swipe(or vice versa)，所以你必须明确指出你希望支持的类型。为了支持长按 RecyclerView item 对其进行拖动，**isLongPressDragEnabled()**函数实现应该返回true. 此外在开始拖拽时**ItemTouchHelper.startDrag(RecyclerView.ViewHolder)**将会被调用。这个我们稍后再讨论。

```java

@Override
public boolean isItemViewSwipeEnabled() {
    return true;
}

```


如果在viwe中可以随意滑动，**isItemViewSwipeEnabled()**函数返回true. 此外手动拖动时**ItemTouchHelper.startSwipe(RecyclerView.ViewHolder)**会被调用。


**onMove()** 和 **onSwiped()**负责主要数据的更新。故首先我们需要创建一个允许传递事件回调的接口。



```java

public interface ItemTouchHelperAdapter {

    void onItemMove(int fromPosition, int toPosition);

    void onItemDismiss(int position);
}

```

*[ItemTouchHelperAdapter.java Gist](https://gist.github.com/iPaulPro/5d43325ac7ae579760a9)*


最简单的方式就是下面这样，让我们的RecyclerListAdapter实现ItemTouchHelperAdapter。

```java

public class RecyclerListAdapter extends 
        RecyclerView.Adapter<ItemViewHolder> 
        implements ItemTouchHelperAdapter {
// ... code from [gist]()


```

```java

@Override
public void onItemDismiss(int position) {
    mItems.remove(position);
    notifyItemRemoved(position);
}

@Override
public void onItemMove(int from, int to) {
    Collections.swap(mItems, from, to);
    notifyItemMoved(from, to);
}

```


**notifyItemRemoved()** 和 **notifyItemMoved()**的调用是非常重要，因此Adapter是可以感受到这些变化的,同样重要的是要注意当我们改变item的Position的时候view的index也时刻在改变，**并不是在“drop”事件结束后再改变**。



现在我们回过头来创建我们自己的**SimpleItemTouchHelperCallback**并且必须override onMove() 和 onSwiped()。首先添加一个构造函数和Adapter变量。

```java

private final ItemTouchHelperAdapter mAdapter;

public SimpleItemTouchHelperCallback(
        ItemTouchHelperAdapter adapter) {
    mAdapter = adapter;
}

```

之后 override the remaining events and notify the adapter:

```java

@Override
public boolean onMove(RecyclerView recyclerView, 
        RecyclerView.ViewHolder viewHolder, 
        RecyclerView.ViewHolder target) {

```

```java

mAdapter.onItemMove(viewHolder.getAdapterPosition(), 
            target.getAdapterPosition());
    return true;
}

```

```java

@Override
public void onSwiped(RecyclerView.ViewHolder viewHolder, 
        int direction) {
    mAdapter.onItemDismiss(viewHolder.getAdapterPosition());
}

```


写完之后回调类应该像下面这样：

```java

public class SimpleItemTouchHelperCallback extends ItemTouchHelper.Callback {
 
    private final ItemTouchHelperAdapter mAdapter;
 
    public SimpleItemTouchHelperCallback(ItemTouchHelperAdapter adapter) {
        mAdapter = adapter;
    }
    
    @Override
    public boolean isLongPressDragEnabled() {
        return true;
    }
 
    @Override
    public boolean isItemViewSwipeEnabled() {
        return true;
    }
 
    @Override
    public int getMovementFlags(RecyclerView recyclerView, ViewHolder viewHolder) {
        int dragFlags = ItemTouchHelper.UP | ItemTouchHelper.DOWN;
        int swipeFlags = ItemTouchHelper.START | ItemTouchHelper.END;
        return makeMovementFlags(dragFlags, swipeFlags);
    }
 
    @Override
    public boolean onMove(RecyclerView recyclerView, ViewHolder viewHolder, 
            ViewHolder target) {
        mAdapter.onItemMove(viewHolder.getAdapterPosition(), target.getAdapterPosition());
        return true;
    }
 
    @Override
    public void onSwiped(ViewHolder viewHolder, int direction) {
        mAdapter.onItemDismiss(viewHolder.getAdapterPosition());
    }
 
}

```


随着我们Callback的完成，再创建ItemTouchHelper并且调用**attachToRecyclerView(RecyclerView)** (e.g. in [MainFragment.java](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc#file-mainfragment-java)):


```java

ItemTouchHelper.Callback callback = 
    new SimpleItemTouchHelperCallback(adapter);
ItemTouchHelper touchHelper = new ItemTouchHelper(callback);
touchHelper.attachToRecyclerView(recyclerView);

```


程序运行结果：

<video loop video autoplay class="graf-image" data-image-id="1*FdJbZnF5I-iOw0wgiuVJGQ.gif" data-width="360" data-height="508">
<source src="https://d262ilb51hltx0.cloudfront.net/max/1600/1*FdJbZnF5I-iOw0wgiuVJGQ.mp4" type="video/mp4">Your browser does not support the video tag.</video>


##结束语


这是一种极其简单的对ItemTouchHelper的实现写法。但是应该清楚的知道，使用RecyclerView实现基本的拖拽和滑动消失效果是不需要引入三方library的。在下一篇中我们将对拖拽进行更加丰富的控制实现。



##源代码

[Android-ItemTouchHelper-Demo](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo).


关注我: [Google+](http://google.com/+PaulBurke) and [Twitter](https://twitter.com/ipaulpro)


© 2015 Paul Burke



