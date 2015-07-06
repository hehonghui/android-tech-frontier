#Drag and Swipe with RecyclerView

---

> * 原文链接 : [Drag and Swipe with RecyclerView](https://medium.com/@ipaulpro/drag-and-swipe-with-recyclerview-b9456d2b1aaf)
* 原文作者 : [Paul Burke](https://medium.com/@ipaulpro)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: 
* 状态 : 待校对

#Drag and Swipe with RecyclerView
###Part One: Basic ItemTouchHelper Example


<video loop video autoplay class="graf-image" data-image-id="1*4Cqfs-75ibhvC_3BMEIvVA.gif" data-width="1440" data-height="600"><source src="https://d262ilb51hltx0.cloudfront.net/max/2000/1*4Cqfs-75ibhvC_3BMEIvVA.mp4" type="video/mp4"></video>

There are many tutorials, libraries, and examples for implementing “**drag & drop**” and “**swipe-to-dismiss**” in Android, using RecyclerView. Most are still using the old *[View.OnDragListener](http://developer.android.com/guide/topics/ui/drag-drop.html)*, and Roman Nurik’s *[SwipeToDismiss](https://github.com/romannurik/Android-SwipeToDismiss)* approach, even though there are newer, and better, methods available. A few use the newer APIs, but often rely on GestureDetectors and onInterceptTouchEvent, or the implementation is complex. There’s actually a really simple way to add these features to RecyclerView. It only requires one class, and it’s already part of the Android Support Library:


现在有很多使用RecyclerView实现“**拖拽(drag & drop)**”和“**滑动消失(swipe-to-dismiss)**”效果的教程、库、和示例代码。虽然现在有更新的、更好的方式可以实现但是大部分的代码仍旧使用了旧的API*[View.OnDragListener](http://developer.android.com/guide/topics/ui/drag-drop.html)*或者使用Roman Nurik’s *[SwipeToDismiss](https://github.com/romannurik/Android-SwipeToDismiss)*这个库中的处理方式。有一部分使用了新的API，但主要是依赖GestureDetectors 和 onInterceptTouchEvent或者实现的方式很复杂。实际上有非常简单的方式就可以把新特性添加到RecyclerView中。只需要一个类，并且它已经包含在Android Support Library之中。



###[ItemTouchHelper](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.html)

ItemTouchHelper is a powerful utility that takes care of everything you need to add both drag & drop and swipe-to-dismiss to your RecyclerView. It’s a subclass of [RecyclerView.ItemDecoration](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.ItemDecoration.html), which means it’s easily added to almost-any existing LayoutManager and Adapter(!). It also works with existing item animations, and gives you type-restricted dragging, drop settling animations, and much more. In this article, I’ll demonstrate a simple implementation of ItemTouchHelper. Later, in this series, we’ll expand the scope and explore more features.

ItemTouchHelper是一个非常强大的工具类用于处理当你添加drag&drop 和 swipe-to-dismiss特性到RecyclerView时所关心的那些问题。它是[RecyclerView.ItemDecoration](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.ItemDecoration.html)的子类,意味着可以向已经存在的LayoutManager 和 Adapter(!)中添加任何东西，并且也可以处理已经存在的item animations、type-restricted、drop settling animations甚至更多。
在这篇文章我将示范一下ItemTouchHelper的简单实现，稍后，在这一系列的文章中我们将延伸扩展更多特性。

##Skip ahead

##忽略开头

Just interested in seeing the completed source? Jump to Github: *[Android-ItemTouchHelper-Demo](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo)*. The *[first commit](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo/tree/d8d85c32d579f19718b9bbb97f7a1bda0e616f1f)* lines up with this article. Download the demo apk *[from here](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo/releases)*.

只是对源代码感兴趣？ Github源码: *[Android-ItemTouchHelper-Demo](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo)*,
Apk下载:*[from here](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo/releases)*.

##Setting up

##配置

First thing we need is a basic RecyclerView setup. If you haven’t already, update your build.gradle to include the RecyclerView dependency.

首先我们需要对RecyclerView进行配置，如果没有准备好，请先更新你的build.gradle，添加RecyclerView依赖。

```java
compile 'com.android.support:recyclerview-v7:22.2.0'

```
ItemTouchHelper will work with almost any RecyclerView.Adapter and LayoutManager, but the article will build off the basic files found in this Gist:

在任意RecyclerView.Adapter 和 LayoutManager都可以使用ItemTouchHelper，这篇文章代码的基本文件在这：

[https://gist.github.com/iPaulPro/2216ea5e14818056cfcc](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc)


##Using ItemTouchHelper and ItemTouchHelper.Callback

##使用ItemTouchHelper 和 ItemTouchHelper.Callback

In order to use ItemTouchHelper, you’ll create an *[ItemTouchHelper.Callback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.Callback.html)*. This is the interface that allows you to listen for “move” and “swipe” events. It’s also where you are able to control the state of the view selected, and override the default animations. There’s a helper class that you can use if you want a basic implementation, *[SimpleCallback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.SimpleCallback.html)*, but for the purposes of learning how it works, we’ll make our own.

为了使用ItemTouchHelper，你必须得先创建*[ItemTouchHelper.Callback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.Callback.html)*。这是一个接口用于监听“move” 和 “swipe”的状态。也可用于你要控制所选的view的状态和重写默认动画。如果你只是想使用基本实现你可以使用系统提供的一个帮助类*[SimpleCallback](https://developer.android.com/reference/android/support/v7/widget/helper/ItemTouchHelper.SimpleCallback.html)*，但是本着学习的目的，我们还是自己来实现。


The main callbacks that we must override to enable basic drag & drop and swipe-to-dismiss are:

实现基本的drag & drop 和 swipe-to-dismiss必须实现以下主要的回调函数:

```java

getMovementFlags(RecyclerView, ViewHolder)
onMove(RecyclerView, ViewHolder, ViewHolder)
onSwiped(ViewHolder, int)

```

We’ll also use a couple of helpers:

使用两个帮助函数:

```java
isLongPressDragEnabled()
isItemViewSwipeEnabled()

```

We’ll go through them one by one.

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

ItemTouchHelper allows you to easily determine the direction of an event. You must override **getMovementFlags()** to specify which directions of drags and swipes are supported. Use the helper **ItemTouchHelper.makeMovementFlags(int, int)** to build the returned flags. We’re enabling dragging and swiping in both directions here.

ItemTouchHelper允许非常简单的判断屏幕事件的走向。必须重写**getMovementFlags()**来说明支持哪个方向的拖拽和滑动。使用帮助类**ItemTouchHelper.makeMovementFlags(int, int)**来管理returned标志。这样就可以在同一个方向进行拖拽和滑动了。

```java

@Override
public boolean isLongPressDragEnabled() {
    return true;
}

```

ItemTouchHelper can be used for drag without swipe (or vice versa), so you must designate exactly what you wish to support. Implementations should return true from **isLongPressDragEnabled()** in order to support starting drag events from a long press on a RecyclerView item. Alternatively, **ItemTouchHelper.startDrag(RecyclerView.ViewHolder)** can be called to start a drag from a “handle.” This will be explored further later.

ItemTouchHelper可以只支持drag而不支持swipe(or vice versa)，所以你必须明确指出你希望支持的类型。为了支持长按 RecyclerView item 对其进行拖动，**isLongPressDragEnabled()**函数实现应该返回true. 此外在开始拖拽时**ItemTouchHelper.startDrag(RecyclerView.ViewHolder)**将会被调用。这个我们稍后再讨论。

```java

@Override
public boolean isItemViewSwipeEnabled() {
    return true;
}

```

To enable swiping from touch events that start anywhere within the view, simply return true from **isItemViewSwipeEnabled()**. Alternatively, **ItemTouchHelper.startSwipe(RecyclerView.ViewHolder)** can be called to start a drag manually.

如果在viwe中可以随意滑动，**isItemViewSwipeEnabled()**函数返回true. 此外手动拖动时**ItemTouchHelper.startSwipe(RecyclerView.ViewHolder)**会被调用。

The next two, **onMove()** and **onSwiped()** are needed to notify anything in charge of updating the underlying data. So first we’ll create an interface that allows us to pass these event callbacks back up the chain.

**onMove()** 和 **onSwiped()**负责主要数据的更新。故首先我们需要创建一个允许传递事件回调的接口。



```java

public interface ItemTouchHelperAdapter {

    void onItemMove(int fromPosition, int toPosition);

    void onItemDismiss(int position);
}

```

*[ItemTouchHelperAdapter.java Gist](https://gist.github.com/iPaulPro/5d43325ac7ae579760a9)*

The simplest way to do this, for the sake of this example, is to have our [RecyclerListAdapter](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc#file-recyclerlistadapter-java) implement the listener.

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

It’s very important to call **notifyItemRemoved()** and **notifyItemMoved()** so the Adapter is aware of the changes. It’s also important to note that we’re changing the position of the item every time the view is shifted to a new index, and **not at the end of a “drop” event**.

**notifyItemRemoved()** 和 **notifyItemMoved()**的调用是非常重要，因此Adapter是可以感受到这些变化的,同样重要的是要注意当我们改变item的Position的时候view的index也时刻在改变，**并不是在“drop”事件结束后再改变**。


Now we can go back to building our **SimpleItemTouchHelperCallback** as we still must override onMove() and onSwiped(). First add a constructor and a field for the Adapter:

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

The resulting Callback class should look something like this:

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



With our Callback ready, we can create our ItemTouchHelper and call **attachToRecyclerView(RecyclerView)** (e.g. in [MainFragment.java](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc#file-mainfragment-java)):

随着我们Callback的完成，再创建ItemTouchHelper并且调用**attachToRecyclerView(RecyclerView)** (e.g. in [MainFragment.java](https://gist.github.com/iPaulPro/2216ea5e14818056cfcc#file-mainfragment-java)):


```java

ItemTouchHelper.Callback callback = 
    new SimpleItemTouchHelperCallback(adapter);
ItemTouchHelper touchHelper = new ItemTouchHelper(callback);
touchHelper.attachToRecyclerView(recyclerView);

```

When you run, it should look something like this:

程序运行结果：

<video loop video autoplay class="graf-image" data-image-id="1*FdJbZnF5I-iOw0wgiuVJGQ.gif" data-width="360" data-height="508">
<source src="https://d262ilb51hltx0.cloudfront.net/max/1600/1*FdJbZnF5I-iOw0wgiuVJGQ.mp4" type="video/mp4">Your browser does not support the video tag.</video>



##Conclusion

##结束语

This is a bare-bones implementation of ItemTouchHelper. However, it should be clear that a third-party library is not needed for basic drag & drop and swipe-to-dismiss with RecyclerView. In the next part, we’ll take more control over the appearance of the items while being dragged or swiped.

这是一种极其简单的对ItemTouchHelper的实现写法。但是应该清楚的知道，使用RecyclerView实现基本的拖拽和滑动消失效果是不需要引入三方library的。在下一篇中我们将对拖拽进行更加丰富的控制实现。


##Source code

##源代码

[Android-ItemTouchHelper-Demo](https://github.com/iPaulPro/Android-ItemTouchHelper-Demo).


关注我: [Google+](http://google.com/+PaulBurke) and [Twitter](https://twitter.com/ipaulpro)


© 2015 Paul Burke



