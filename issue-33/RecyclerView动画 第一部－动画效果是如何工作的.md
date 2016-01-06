#RecyclerView Animations Part 1 – How Animations Work
#RecyclerView动画 第一部－动画是如何工作的

> * 原文链接 : [RecyclerView Animations Part 1 – How Animations Work](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)
> * 原文作者 : [Yiğit Boyar](http://www.birbit.com/)
> * 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
> * 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
> * 译者 : [shenyansycn](https://github.com/shenyansycn) 
> * 校对者: [这里校对者的github用户名](github链接)  
> * 状态 :  未完


ListView is one of the most popular widgets of the Android Framework. It has many features, yet it is fairly complex and hard to modify. As the UX paradigms evolved and phones got faster, its limitations started to overshadow its feature set.

LisetView是Android框架中最流程的控件之一。它有很多功能，然而它是很复杂的，修改难度很大。随着用户体验的发展和手机变的越来越快，它的局限性使它的特色黯然失色。

With Lollipop, the Android team decided to release a new widget that will make writing different collection views much easier with a pluggable architecture. Many different behaviors can be controlled easily by implementing simple contracts to change:

在Lollipop中，Android团队决定发布一个新的控件，用一个新架构使得View的添加和删除在编码上的变得更容易。以下的改变会很容易控制：


    how items are laid out
    animations!
    item decorations
    recycling strategy
    …
    
    
> * items如何被展现
> * 动画效果
> * item修饰
> * 回收策略
> * ...



This great flexibility comes with the additional complexity of a bigger architecture. Also, there are more things to learn.

极大的灵活性也伴随着一个巨大架构的复杂性。同样也有更多需要学习。

In this post, I want to deep dive into RecyclerView internals, particularly on how animations work.

在这篇文章中，我要深入RecyclerView的内部，特别在**动画如何实现**上。

On Honeycomb, the Android Framework introduced LayoutTransition, which was a very easy way to animate changes inside a ViewGroup. It works by taking a snapshot of the ViewGroup before and after the layout changes, then creating Animators to move between these two states. This process is fairly similar to what RecyclerView needs to do to animate changes in the adapter.

在Honeycomb上，Android框架引进了[LayoutTransition](http://developer.android.com/reference/android/animation/LayoutTransition.html)，ViewGroup内部动画的一个很简单的方法。它工作原理是布局改变前和改变后分别生成两个ViewGroup快照，然后在这两个状态间创建一个动画效果。这个过程和Adapter中RecyclerView的动画非常相似。


*LayoutTransition example:*

*LayoutTransition例子：*

![LayoutTransirion example](http://img.blog.csdn.net/20151229105047003)

Unfortunately, lists have one major difference which makes LayoutTransitions a bad fit for their animations. Specifically, items in lists are not the same as views in a ViewGroup. This is an important distinction that needs to be understood to handle animations on “items” while using mechanisms that animate the “views” that show the item contents.

不幸的，List有一个主要的区别使得LayoutTransitions不适合它们的动画，list中的item和ViewGroup中的不一样。处理“items”动画机制和动态显示“views”的内容是很重要的差别。

In a normal ViewGroup, if a View is newly added to the View hierarchy, it can be treated like a newly added View and thus it can be animated accordingly (e.g. fade in). For collections, it is a bit different. For example, a View for an item may become visible just because an item before it has been removed from the Adapter. In this case, running a fade in animation for the new item would be misleading because it was already in the list though the view is new because the item just entered the viewport. RecyclerView knows if the item is new or not but it does not know where it was if the item is not new. The same case is valid for disappearing Views, RecyclerView does not know where the view went if it is not removed from the Adapter.

在一个标准的ViewGroup中，如果一个View是新被添加到视图层的，它可以被认为是一个新加入的View，因此可以设置相应的动态效果（例如，淡入）。对于集合，这是不同的。例如，在Adapter中一个item的View变为可见仅是因为之前有一个item被移除。在这个情况下，已经在列表中的运行淡入的动画效果的item会被误认为是一个新的view，因为它刚被看见。RecyclerView知道item是否是新的，但是不知道如果item**不是**新的它在哪。同样对于消失中的View也是一样，如果没有被Adapter移除，RecyclerView不知道View去哪里了。

*LayoutTransition failure for a list:*

*对于列表LayoutTransition是无效的：*

![LayoutTransirion bad example](http://img.blog.csdn.net/20151229105018461)

To overcome this problem, RecyclerView could ask LayoutManager for the previous location of the new View. Although this would work, it would require some bookkeeping on the LayoutManager end and may not be trivial to calculate for more complex LayoutManagers.

为了修复这个问题，RecuclerView会问LayoutManager新View的之前的位置。虽然这会工作，它将会需要LayoutManager结尾的一些统计，对于更复杂的LauoutManager可能不需要繁琐的计算。

The way that RecyclerView handles animating appearing and disappearing items (that is, animating the appearance and disappearance of views that refer to items that were and are still in the list) is by relying on the LayoutManager to handle predictive layout logic. One one hand, the RecyclerView wants to know where views would have been had they been laid out prior to this change. On the other hand, the RecyclerView wants to know where views would be laid out after this change if the LayoutManager went to the trouble of laying out items that are not currently visible.

RecyclerView控制item显示和消失动画的方式（就是说，view的显示和消失的动画是指它仍然在list中）是依赖LayoutManager处理layout逻辑的预测性。一方面，RecyclerView需要知道变化之前view被展示在哪一层。另一方面，RecyclerView想要知道变化之后view被展示在哪一层，如果LayoutManager展示items出现了问题，则item不可见。

To make it easy for the LayoutManager to provide this information, RecyclerView uses a two step layout process when there are adapter changes which should be animated. The mechanisms for handling these predictive layout passes are described below.

为了LayoutManager更容易的提供这个信息，RecyclerView使用两个层来配合动画效果。具体如下描述：

> * In the first layout pass (preLayout), RecyclerView asks LayoutManager to layout the previous state with the knowledge of the additional information. For the example above, it would be like requesting “Layout items again, btw, ‘C’ has been removed”. The LayoutManager runs its usual layout step but knowing that ‘C’ will be removed, it lays out View(s) to fill the space left by ‘C’.
> 
    The cool part of this contract is that RecyclerView still behaves as if ‘C’ is still in the backing Adapter. For example, when LayoutManager asks for the View for position 2, RecyclerView returns ‘C’ (getViewForPosition(2) == View('C')) and if LayoutManager asks for position 4, RecyclerView returns the View for ‘E’ (although ‘D’ is the 4th item in the Adapter). LayoutParams of the returned View has an isItemRemoved method which LayoutManager can use to check if this is a disappearing item.
    
> * 在第一个层中的变化(**preLayout**)，RecyclerView询问LayoutManager当前层之前状态的更多信息。比如上面的例子，就好像请求“‘C’被移除了”。LayoutManager正常执行‘C’被移除的操作，用新的View填补‘C’的空档。
> 
 出色的是RecyclerView仍然知道‘C’还在Adapter中。比如，当LayoutManager想要知道位置为‘**2**’的View是什么时，RecyclerView会返回‘C’(`getViewForPosition(2) == View('C')`)。如果问位置为‘**4**’的View是什么时，会返回来‘E’（虽然‘D’是Adapter第四个元素）。返回View的有一个**isItemRemoved**方法，LayoutManager可以通过检查这个方法来判断是否是消失的View。

> * In the second layout pass (postLayout), RecyclerView asks LayoutManager to re-layout its items. This time, ‘C’ is not in the Adapter anymore. getViewForPosition(2) will return ‘D’ and getViewForPosition(4) will return ‘F’.
> 
    Keep in mind that the backing item for ‘C’ was already removed from the Adapter, but since RecyclerView has the View representation of it, it can behave as if ‘C’ is still there. In other words, RecyclerView does the bookkeeping for the LayoutManager.
    
> * 在第二个层中的变化（**postLayout**），RecycleView请求LayoutManager布置它自己的item。这时，‘C’已经不在Adapter中了。`getViewForPosition(2)`会返回‘D’，`getViewForPosition(4)`会返回‘F’。
> 
    记住，‘C’已经被Adapter移除了。但是因为RecyclerView保留了它的引用，它表现的好像‘C’仍然存在。换句话说，RecyclerView做了LayoutManager统计的工作。

Every time onLayoutChildren is called on the LayoutManager, it temporarily detaches all views and lays them out from scratch again. Unchanged Views are returned from the scrap cache so their measurements stay valid, making this relayout fairly cheap and simple.

每次调用LayoutManager中的`onLayoutChildren`的时候，它会**临时拆开**所有的View并从头开始布局。没有改变的View会被从废弃的缓存中返回，因此它们还是有效的。这使得重新布局相当高效。

*LinearLayoutManager pre layout result: (pink rectangle marks the area visible to the user)*

*LinearLayoutManager之前的布局结果：（红色框范围内对用户是可见的）*


![LinearLayoutManager pre layout](http://img.blog.csdn.net/20160104165238477)

*LinearLayoutManager post layout result:*

*LinearLayoutManager之后的布局结果*

![LinearLayoutManager post layout](http://img.blog.csdn.net/20160104165428678)

After these two layout passes, RecyclerView knows where the Views came from so it can run the correct animation.

这两个布局变化后，RecyclerView知道View来自哪里所以能运行正确的动画效果。

![Predictive Animation](http://img.blog.csdn.net/20160104165622148)

*You might ask*: The View ‘C’ was not laid out by the LayoutManager, how come it is still visible?

*你可能会问*：‘C’没有被LayoutManager展示，那为什么还会可见？

To be clear, ‘C’ was laid out by the LayoutManager in the pre-layout pass because it looked like it was in the Adapter. It is true that ‘C’ was not laid out by the LayoutManager in the post-layout pass because it does not exist in the Adapter anymore. It is also true for the LayoutManager that ‘C’ is not its child anymore but not true for the RecyclerView. When a View is removed by the LayoutManager, if ItemAnimator wants to animate it, RecyclerView keeps it as a child (so that animations can run properly). More details on this in Part2.

要清楚，在pre-layout中被LayoutManager展示的‘C’是因为它看起来是在Adapter中。事实是在post-layout中不被LayoutManager展示的‘C’已经不再Adapter中存在了。也**就说**是‘C’不再是LayoutManager的孩子，但对于RecyclerView**不**是这样的。当LayoutManager移除了View，如果要实现动画效果，RecyclerView会使他做为孩子一直存在（所以动画会正确的显示）。更多的细节会在[Part 2](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)。

**Disappearing Items**
**消失的Items**

With these two layout passes, RecyclerView is able to animate new Views properly. But now, there is another problem with Views that are disappearing. Consider the following case where a new item is added to the list, pushing some other items outside the visible area. This is how it would look with LayoutTransitions:

通过了两个布局过程的变化，RecyclerView可以正确的执行新View的动画效果。但是，消失的View存在另一个问题。考虑一下新添加的元素在list什么位置，会把一些元素移出可见区域。它看起来像LayoutTransitions：

![Add Animation Failure](http://img.blog.csdn.net/20160104165758583)

When ‘X’ was added after ‘A’, it pushed ‘F’ outside the screen. Since LayoutManager will not layout ‘F’, LayoutTransition thinks it has been removed from the UI and runs a fade out animation for it. In reality, ‘F’ is still in the adapter but has been pushed out of bounds.

当‘X’被添加在‘A’后，它把‘F’移出了可见区域。因为LayoutManager没有展示‘F’，LayoutTransition认为它已经被一个淡出的动画效果移出UI。实际上，‘F’仍然在Adapter中只是被移出了可见区域。

To solve this issue, RecyclerView provides an additional API to LayoutManager to get this information. At the end of a postLayout pass, LayoutManager can call getScrapList to get list of Views which are in this situation (not laid out by the LayoutManager but still present in the Adapter). Then, it lays out these views as well, as if the size of RecyclerView was big enough to show them.

为了解决这个问题，RecyclerView给LayoutManager提供了一个额外的API。在**postLayout**变化的末尾，LayoutManager会调用[getScrapList](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#getScrapList%28%29)获得列表中的View（没有被LayoutManager展示，但仍然在Adapter中）。然后，它展示了这些view，好像RecyclerView的规模大到足以展示它们。

LinearLayoutManager post layout result: (pink rectangle marks the area visible to the user)

*LinearLayoutManager之后的布局结果：（红色框范围内对用户是可见的）*

![LinearLayoutManager post layout](http://img.blog.csdn.net/20160104165955801)

One important detail is that, since these Views are not necessary after their animations are complete, LayoutManager calls addDisappearingView instead of addView. This gives the clue to the RecyclerView that this View should be removed after its animations is complete. RecyclerView also adds the View to the list of hidden views so that it will disappear from LayoutManager’s children list as soon as postLayout method returns. This way, LayoutManager can forget about it.

一个重要的细节是，因为这些View在动画效果结束后就不是必需的了，LayoutManager会调用**addDisappearingView**来代替`addView`。这就告诉了RecyclerView这个View的动画效果完成后就被移除。RecyclerView会把这个View加入到隐藏View的列表中，所以`postLayout`方法返回时在LayoutManager子View的列表中是不可见的。这样，LayoutManager就会忽视它。

![Predictive Add Animation](http://img.blog.csdn.net/20160104170057136)

Initially, at least for a LinearLayoutManager, you might think that it can calculate where the Views came from or where they went (if disappeared) and thus won’t need a two pass layout calculation. Unfortunately, there are many edge cases when multiple types of adapter changes happen in the same layout pass. In addition to that, for a more complex LayoutManager, it is not always trivial to calculate where an item would be placed (e.g. StaggeredGridLayout). This approach removes all burden from the LayoutManager and it can support proper animations with little effort.

首先，至少对于LinearLayoutManager来说，你可能认为它会计算View来自哪里和要去哪里（如果消失），这样就不需要两次布局计算。令人遗憾的是，许多类型的Adapter在同一个布局中发生变化时会有很多意外情况。除此之外，对于更复杂的LayoutManager，它不总是简单的计算一个item放在什么地方（例如StaggeredGridLayout）。这个方法会删除来自LayoutManager所有的负担，它可以很容易的支持一些适当的动画效果。

So far, I’ve covered the main idea on how predictive animations run in RecyclerView. There is actually a lot more going on to achieve this simplicity (for the LayoutManager). You can read about how all this works in Part 2 – Behind The Scenes.

到目前为止，我的主要想法是RecyclerView如何预测动画的运行。实际上有很多简单的实现（对于LayoutManager来说）。你可以在[Part 2 - 幕后](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)中了解更多。

