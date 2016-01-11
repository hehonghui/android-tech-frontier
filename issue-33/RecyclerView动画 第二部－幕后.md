#RecyclerView Animations Part 2 – Behind The Scenes
#RecyclerView动画 第二篇－幕后
> * 原文链接 : [RecyclerView Animations Part 2 – Behind The Scenes](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)
> * 原文作者 : [Yiğit Boyar](http://www.birbit.com/)
> * 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
> * 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
> * 译者 : [shenyansycn](https://github.com/shenyansycn) 
> * 校对者: [这里校对者的github用户名](github链接)  
> * 状态 :  未完

--
    
>这是系列文章的第二篇，请先阅读[第一篇](http://www.birbit.com/recyclerview-animations-part-1-how-animations-work/)

在第一篇文章中，我主要介绍了在RecyleyView中如何预测动画的运行。实际上有很多简单实现（对于LayoutManager）。这里有一些你需要知道的关键点。

**当LayoutManager的children被移除的时候RecyclerView仍然保留他们的引用。这是如何工作的？LayoutManager和RecyclerView的约定是无效的么**

是的，有点违反了和LayoutManager的约定，但是：

RecyclerView**保持**了View做为一个ViewGroup的child，但是对于LayoutManager又**隐藏**起来了。每次
LayoutManager调用了访问children的方法时，RecyclerView都把**隐藏**的View考虑在内。让我们看下第一篇中的一个例子，‘C’正在被移出Adapter。

![Predictive Animation](http://img.blog.csdn.net/20160104165622148)

当‘C’淡出时，如果LayoutManager调用了`getChildCount()`，RecyclerView会返回6虽说LayoutManager有7个children。如果LayoutManager调用了`getChildAt(int)`，RecyclerView会跳过‘C’（或其他隐藏的children）。如果LayoutManager调用了`addView(View, position)`，RecyclerView会在调用`ViewGroup#addView`前也会跳过。

当动画结束时，RecyclerView会移除并回收View。

更多信息你可以查看[ChildHelper](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/ChildHelper.java) 这个内部类。

**在preLayout过程中RecyclerView如何处理item的位置，是因为他们与Adapter不匹配么？**

一个特殊的通知事件被添加到Adapter是可行的。当Adapter分派了`notify**`事件时，RecyclerView纪录它们并发送布局请求。任何下一个布局显示前获得的事件都会被一起应用。

当系统调用了onLayout时，RecyclerView做了如下动作：

1. 纪录更新事件，例如`move`事件被增加到更新事件列表的末尾。移动`move`事件到列表末尾是一个简单步骤，所以我就不在这里展开了。如果你感兴趣你可以看[OpReorderer](https://android.googlesource.com/platform/frameworks/support/+/master/v7/recyclerview/src/android/support/v7/widget/OpReorderer.java)类。

2. 依次处理事件和更新当前的ViewHolders’的位置。如果一个ViewHolder被移除，他会被标记为`removed`。执行时，RecyclerView判断这个adapter的改变是否会被发送到LayoutManager的preLayout之前或之后的步骤。流程如下：

 - 如果是`add`操作，会被推迟，因为preLayout中应该没有item。

 - 如果是 `update`或`remove` 操作并影响了已经存在的ViewHolders，它会被延期。如果没有影响当前的ViewHolders，它会被发送到LayoutManager，因为RecyclerView不能恢复item之前的状态（因为没有一个ViewHolder能表示item之前状态的）。	

 - 如果是`move`操作，它会被推迟，因为在pre-layout处理过程中RecyclerView会伪造一个位置。例如，如果item从位置3移动到位置5，在pre-layout处理过程中当位置3的View被请求时RecyclerView会返回位置为5的View。

 - 如果有必要RecyclerView会重写更新操作。例如，如果一个更新或者删除操作影响到了一些ViewHolder，RecyclerView会把操作分离开。如果一个操作应该发送到LayoutManager但是一个推迟的操作有可能影响它，RecyclerView会重新排序这些操作以便前后一致。
 	
 		例如，如果已被推迟的`Add 1 at 3`动作后紧跟着一个不能推迟的`Remove 1 at 5`动作。RecyclerView会发送给LayoutManager一个`Remove 1 at 4`动作。原因是`Add 1 at 3`执行后`Remove 1 at 5`也被通知执行了，它们针对的都是同一个item。RecyclerView没有通知LayoutManager`Add 1 at 3`的动作，它会重写以便前后一致。
		
		这个方法使得LayoutManager跟踪item的消亡很简单。在Adapter和LayoutManager之间的抽象化使这一切成为可能，这就是为什么RecyclerView从来不发送Adapter到LayoutManager，替代的是，提供方法访问Adapter的状态和循环利用。
		
		ViewHolder也有它自己的`old position`，`pre layout position`和最终Adapter中的位置。当`ViewHolder#getPosition`被调用时，根据当前布局状态（pre或post）要么返回preLayout的位置要么返回最终Adapter的位置。LayoutManager不关心这个因为发送给它的都是前后一致的。

3. 当Adapter更新被处理后，RecyclerView保存了当前View的位置和大小用于之后的动画使用。

4. 在`preLayout`RecyclerView调用`LayoutManager#onLayoutChildren`。就像我在第一篇文章中提到的，LayoutManager运行自己的布局规则。它所做的这些都是了布局那些被`deleted`或`changed`(`LayoutParams#isItemRemoved`，`LayoutParams#isItemChanged`)的item。在这里需要提醒的是，被删除或被改变的item仍然会被Adapter API提供给LayoutManager。这样，LayoutManager就会简单的认为是其他View（添加、测量、位置等）.

5. preLayout结束后，RecyclerView再次纪录这些View的位置并告诉LayoutManager继续更新Adapter

6. RecyclerView再次调用LayoutManager的`onLayout`(`postLayout`).这时，所有item的位置匹配Adapter现在的内容。LayoutManager再次用自己的规则显示布局。

7. post layout结束后，RecyclerView再次检测这些View的位置，判断哪些item是被添加的，被删除的，被改变的和被移动的。它‘隐藏’了被删除的View，item没有被LayoutManager加入，加入到了RecyclerView里（因为它们应该开始动画了）

8. 需要动画的Items被ItemAnimator开始运行它的动画效果。当动画执行完毕，ItemAnimator会调用RecyclerView里的回调方法，如果不再用了，View会被RecyclerView移除和回收。

**如果item位置使用了LayoutManager保留的一些内部数据结构会发生什么？**

一切工作...。感谢RecyclerView重写了Adapter的更新，当其中某一个adapter数据更新回调方法被调用时，所有的LayoutManager都可以自己处理更新。只要RecyclerView确保恰当的调用时机和顺序。

在布局时的任何时候，如果LayoutManager需要访问adapter额外的数据（一些自定义的API）。可以调用[Recycler#convertPreLayoutPositionToPostLayout](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int))获得item在adapter中的位置。例如，GridLayoutManager用这个API去获得item的范围大小。

**如果调用 [notifyDataSetChanged](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#convertPreLayoutPositionToPostLayout(int)) 会发生什么？如何预测动画的运行？**

什么也不会发生，这就是为什么`notifyDataSetChanged`应该最后调用。当adapter里的`notifyDataSetChanged`被调用时，RecyclerView不知道哪个的item被移动了所以他不能正确的假装`getViewForPosition`调用的样子。只是简单像LayoutTransition一样运行动画。

--
我希望这两篇文章可以帮助你理解RecyclerView里的动画是如何工作的和为什么这样工作。