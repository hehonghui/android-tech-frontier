#RecyclerView Animations Part 2 – Behind The Scenes
#RecyclerView动画 第二篇－幕后
> * 原文链接 : [RecyclerView Animations Part 2 – Behind The Scenes](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)
> * 原文作者 : [Yiğit Boyar](http://www.birbit.com/)
> * 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
> * 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
> * 译者 : [shenyansycn](https://github.com/shenyansycn) 
> * 校对者: [这里校对者的github用户名](github链接)  
> * 状态 :  未完

 
 1
 
>This is the second part of a 2 articles series. Please read Part 1 first if you’ve not read it yet.
    
>这是系列文章的第二篇，请先阅读[第一篇](http://www.birbit.com/recyclerview-animations-part-1-how-animations-work/)

In the first article, I’ve covered the main idea on how predictive animations run in RecyclerView. There is actually a lot more going on to achieve this simplicity (for the LayoutManager). Here are some important points that you should know about.

在第一篇文章中，我主要介绍了在RecyleyView中如何预测动画的运行。实际上有很多简单实现（对于LayoutManager）。这里有一些你需要知道的关键点。

**RecyclerView keeps some children attached although they have been removed by the LayoutManager. How does it work? Does it invalidate the contract between the LayoutManager and RecyclerView?**

**当LayoutManager的children被移除的时候RecyclerView仍然保留他们的引用。这是如何工作的？LayoutManager和RecyclerView的约定是无效的么**

Yes it does ‘kind of’ violate the contract with LayoutManager, but:

是的，有点违反了和LayoutManager的约定，但是：


RecyclerView **does** keep the View as a child of the ViewGroup but **hides** it from the LayoutManager. Each time LayoutManager calls a method to access its children, RecyclerView takes into account the `hidden` Views. Lets look at the example at Part 1 where ‘C’ was being removed from the adapter.

RecyclerView**保持**了View做为一个ViewGroup的child，但是对于LayoutManager又**隐藏**起来了。每次
LayoutManager调用了访问children的方法时，RecyclerView都把**隐藏**的View考虑在内。让我们看下第一篇中的一个例子，‘C’正在被移出Adapter。

![Predictive Animation](http://img.blog.csdn.net/20160104165622148)

While ‘C’ is fading out, if LayoutManager calls `getChildCount()`, RecyclerView returns 6 although it has 7 children. If LayoutManager calls `getChildAt(int)`, RecyclerView offsets that call properly to skip child ‘C’ (or any hidden children). If LayoutManager calls `addView(View, position)`, RecyclerView offsets the index properly before calling `ViewGroup#addView`.

当‘C’淡出时，如果LayoutManager调用了`getChildCount()`，RecyclerView会返回6虽说LayoutManager有7个children。如果LayoutManager调用了`getChildAt(int)`，RecyclerView会跳过‘C’（或其他隐藏的children）。如果LayoutManager调用了`addView(View, position)`，RecyclerView会在调用`ViewGroup#addView`前也会跳过。

When the animation ends, RecyclerView will remove the View and recycle it.

当动画结束时，RecyclerView会移除并回收View。

For more details, you can check [ChildHelper](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/ChildHelper.java) internal class.

更多信息你可以查看[ChildHelper](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/ChildHelper.java) 这个内部类。

**How does RecyclerView handle item positions in the preLayout pass since they don’t match Adapter contents?**

**在preLayout过程中RecyclerView如何处理item的位置，是因为他们与Adapter不匹配么？**


This is doable thanks to the specific notify events added to the Adapter. When Adapter dispatches `notify**` events, RecyclerView records them and requests a layout to apply them. Any events that arrives before the next layout pass will be applied together.

一个特殊的通知事件被添加到Adapter是可行的。当Adapter分派了`notify**`事件时，RecyclerView纪录它们并发送布局请求。任何下一个布局显示前获得的事件都会被一起应用。

When onLayout is called by the system, RecyclerView does the following:

当系统调用了onLayout时，RecyclerView做了如下动作：

1. Reorder update events such that `move` events are pushed to the end of the list of update ops. Moving `move` events to the end of the list is a simplification step so I’ll not go into details here. You can check [OpReorderer](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/OpReorderer.java) class for details if you are interested.

	纪录更新事件，例如`move`事件被增加到更新事件列表的末尾。移动`move`事件到列表末尾是一个简单步骤，所以我就不在这里展开了。如果你感兴趣你可以看[OpReorderer](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/OpReorderer.java)类。

2. Process events one by one and update existing ViewHolders’ positions with respect to the update. If a ViewHolder is removed, it is also marked as `removed`. While doing this, RecyclerView also decides whether the adapter change should be dispatched to the LayoutManager before or after the preLayout step. This decision process is as follows:

	依次处理事件和更新当前的ViewHolders’的位置。如果一个ViewHolder被移除，他会被标记为`removed`。执行时，RecyclerView判断这个adapter的改变是否会被发送到LayoutManager的preLayout之前或之后的步骤。流程如下：

 - If it is an `add` operation, it is deferred because item should not exist in preLayout.

 - 如果是`add`操作，会被推迟，因为preLayout中应该没有item。

 - If it is an `update` or `remove` operation and if it affects existing ViewHolders, it is postponed. If it does not effect existing ViewHolders, it is dispatched to the LayoutManager because RecyclerView cannot resurrect the previous state of the item (because it does not have a ViewHolder that represents the previous state of that Item).

 - 如果是 `update`或`remove` 操作并影响了已经存在的ViewHolders，它会被延期。如果没有影响当前的ViewHolders，它会被发送到LayoutManager，因为RecyclerView不能恢复item之前的状态（因为没有一个ViewHolder能表示item之前状态的）。	

 - If it is a `move` operation, it is deferred because RecyclerView can fake its location in the pre-layout pass. For example, if item at position 3 moved to position 5, RecyclerView can return the View for position 5 in pre-layout when View for position 3 is asked.

 - 如果是`move`操作，它会被推迟，因为在pre-layout处理过程中RecyclerView会伪造一个位置。例如，如果item从位置3移动到位置5，在pre-layout处理过程中当位置3的View被请求时RecyclerView会返回位置为5的View。

 - RecyclerView rewrites update operations as necessary. For example, if an update or delete operation affects some of the ViewHolders, RecyclerView divides that operation. If an operation should be dispatched to LayoutManager but a deferred operation may affect it, RecyclerView re-orders these operations so that they are still consistent.

 - 如果有必要RecyclerView会重写更新操作。例如，如果一个更新或者删除操作影响到了一些ViewHolder，RecyclerView会把操作分离开。如果一个操作应该发送到LayoutManager但是一个推迟的操作有可能影响它，RecyclerView会重新排序这些操作以便前后一致。

 		For example, if there is an `Add 1 at 3` operation which is deferred followed by a `Remove 1 at 5` operation which cannot be deferred, RecyclerView dispatches it to the LayoutManager as `Remove 1 at 4`. This is done because the original `Remove 1 at 5` was notified by the Adapter after `Add 1 at 3` so it includes that item. Since RecyclerView did not tell LayoutManager about the `Add 1 at 3`, it rewrites the remove operation to be consistent.
 	
 		例如，如果已被推迟的`Add 1 at 3`动作后紧跟着一个不能推迟的`Remove 1 at 5`动作。RecyclerView会发送给LayoutManager一个`Remove 1 at 4`动作。原因是`Add 1 at 3`执行后`Remove 1 at 5`也被通知执行了，它们针对的都是同一个item。RecyclerView没有通知LayoutManager`Add 1 at 3`的动作，它会重写以便前后一致。

		This approach makes tracking items dead simple for a LayoutManager. The abstraction between the Adapter and the LayoutManager makes all of this possible, which is why RecyclerView never passes the Adapter to the LayoutManager, instead, provides methods to access Adapter via State and Recycler.
		
		这个方法使得LayoutManager跟踪item的消亡很简单。在Adapter和LayoutManager之间的抽象化使这一切成为可能，这就是为什么RecyclerView从来不发送Adapter到LayoutManager，替代的是，提供方法访问Adapter的状态和循环利用。
		
		ViewHolders also have their `old position`, `pre layout position` and final adapter positions. When `ViewHolder#getPosition` is called, they return either preLayout position or final adapter position depending on the current layout state (pre or post). LayoutManager doesn’t need to know about this because it will always be consistent with the previous events that were dispatched to the LayoutManager.
		
		ViewHolder也有它自己的`old position`，`pre layout position`和最终Adapter中的位置。当`ViewHolder#getPosition`被调用时，根据当前布局状态（pre或post）要么返回preLayout的位置要么返回最终Adapter的位置。LayoutManager不关心这个因为发送给它的都是前后一致的。
    
3. After Adapter updates are processed, RecyclerView saves positions and dimensions of existing Views which will later be used for animations.

	当Adapter更新被处理后，RecyclerView保存了当前View的位置和大小用于之后的动画使用。

4. RecyclerView calls LayoutManager#onLayoutChildren for the `preLayout` step. As I’ve mentioned in the first article, LayoutManager runs its regular layout logic. All it has to do is to layout more items for those which are being `deleted` or `changed` (`LayoutParams#isItemRemoved` , `LayoutParams#isItemChanged`). As a reminder, the deleted or changed item still ‘appears’ in the Adapter API given to the LayoutManager. This way, LayoutManager simply treats it as any other View (adds, measures, positions etc).

	在`preLayout`RecyclerView调用`LayoutManager#onLayoutChildren`。就像我在第一篇文章中提到的，LayoutManager运行自己的布局规则。它所做的这些都是了布局那些被`deleted`或`changed`(`LayoutParams#isItemRemoved`，`LayoutParams#isItemChanged`)的item。在这里需要提醒的是，被删除或被改变的item仍然会被Adapter API提供给LayoutManager。这样，LayoutManager就会简单的认为是其他View（添加、测量、位置等）.

5. After preLayout is complete, RecyclerView records the positions of the Views again and dispatches the remaining Adapter updates to the LayoutManager.

	preLayout结束后，RecyclerView再次纪录这些View的位置并告诉LayoutManager继续更新Adapter

6. RecyclerView calls LayoutManager’s onLayout again (`postLayout`). This time, all item positions match the current contents of the Adapter. LayoutManager runs its regular layout logic again.

	RecyclerView再次调用LayoutManager的`onLayout`(`postLayout`).这时，所有item的位置匹配Adapter现在的内容。LayoutManager再次用自己的规则显示布局。

7. After post layout is complete, RecyclerView checks positions of Views again and decides which items are added, removed, changed and moved. It ‘hides’ removed Views and for views not added by the LayoutManager, adds them to the RecyclerView (because they should be animated).

	post layout结束后，RecyclerView再次检测这些View的位置，判断哪些item是被添加的，被删除的，被改变的和被移动的。它‘隐藏’了被删除的View，item没有被LayoutManager加入，加入到了RecyclerView里（因为它们应该开始动画了）

8. Items which require an animation are passed to the ItemAnimator to start their animations. After the animation is complete, Item Animator calls a callback in RecyclerView which removes and recycles the View if it is no longer necessary.

	需要动画的Items被ItemAnimator开始运行它的动画效果。当动画执行完毕，ItemAnimator会调用RecyclerView里的回调方法，如果不再用了，View会被RecyclerView移除和回收。

**What happens if LayoutManager keeps some internal data structure using item positions?**

**如果item位置使用了LayoutManager保留的一些内部数据结构会发生什么？**

Everything works… kind of :). Thanks to the re-writing of Adapter updates by the RecyclerView, all LayoutManager has to do is to update its own bookkeeping when one of its adapter data changed callbacks is called due to Adapter changes. RecyclerView ensures that these updates are called at the appropriate time and order.

一切工作...。感谢RecyclerView重写了Adapter的更新，当其中某一个adapter数据更新回调方法被调用时，所有的LayoutManager都可以自己处理更新。只要RecyclerView确保恰当的调用时机和顺序。

At any time during a layout, if LayoutManager needs to access the adapter for additional data (some custom API), it can call [Recycler#convertPreLayoutPositionToPostLayout](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int)) to get the item’s Adapter position. For example, GridLayoutManager uses this API to get the span size of items.

在布局时的任何时候，如果LayoutManager需要访问adapter额外的数据（一些自定义的API）。可以调用[Recycler#convertPreLayoutPositionToPostLayout](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int))获得item在adapter中的位置。例如，GridLayoutManager用这个API去获得item的范围大小。

**What happens if [notifyDataSetChanged](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int)) is called? How do predictive animations run?**

**如果调用 [notifyDataSetChanged](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int)) 会发生什么？如何预测动画的运行？**

They don’t, which is why `notifyDataSetChanged` should be your last resort. When `notifyDataSetChanged` is called on the adapter, RecyclerView does not know where items moved so it cannot properly fake `getViewForPosition` calls. It simply runs animations as a LayoutTransition would do.

什么也不会发生，这就是为什么`notifyDataSetChanged`应该最后调用。当adapter里的`notifyDataSetChanged`被调用时，RecyclerView不知道哪个的item被移动了所以他不能正确的假装`getViewForPosition`调用的样子。只是简单像LayoutTransition一样运行动画。

--
I hope this two part series helped you understand how animations work in RecyclerView and why they work this way. 
我希望这两篇文章可以帮助你理解RecyclerView里的动画是如何工作的和为什么这样工作。