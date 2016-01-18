#RecyclerView动画 第一篇－动画是如何工作的

> * 原文链接 : [RecyclerView Animations Part 1 – How Animations Work](http://www.birbit.com/recyclerview-animations-part-1-how-animations-work/)
> * 原文作者 : [Yiğit Boyar](http://www.birbit.com/)
> * 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
> * 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
> * 译者 : [shenyansycn](https://github.com/shenyansycn) 
> * 校对者: [这里校对者的github用户名](github链接)  
> * 状态 :  未完

LisetView是Android框架中最流程的控件之一。它有很多功能，然而它是很复杂的，修改难度很大。随着用户体验的发展和手机变的越来越快，它的局限性使它的特色黯然失色。

在Lollipop中，Android团队决定发布一个新的控件，使得该控件的不同的行为更容易实现。以下的改变会很容易控制：

> * items如何被展现
> * 动画效果
> * item修饰
> * 回收策略
> * ...


极大的灵活性也伴随着一个巨大架构的复杂性。同样也有更多需要学习。

在这篇文章中，我要深入RecyclerView的内部，特别在**动画如何实现**上。

在Honeycomb上，Android框架引进了[LayoutTransition](http://developer.android.com/reference/android/animation/LayoutTransition.html)，ViewGroup内部动画的一个很简单的方法。它工作原理是布局改变前和改变后分别生成两个ViewGroup快照，然后在这两个状态间创建一个动画效果。这个过程和Adapter中RecyclerView的动画非常相似。

*LayoutTransition例子：*

![LayoutTransirion example](http://img.blog.csdn.net/20151229105047003)

不幸的，List有一个主要的区别使得LayoutTransitions不适合它们的动画，list中的item和ViewGroup中的不一样。处理“items”动画机制和动态显示“views”的内容是很重要的差别。

在一个标准的ViewGroup中，如果一个View是新被添加到视图层的，它可以被认为是一个新加入的View，因此可以设置相应的动态效果（例如，淡入）。对于集合，这是不同的。例如，在Adapter中一个item的View变为可见仅是因为之前有一个item被移除。在这个情况下，已经在列表中的运行淡入的动画效果的item会被误认为是一个新的view，因为它刚被看见。RecyclerView知道item是否是新的，但是不知道如果item**不是**新的它在哪。同样对于消失中的View也是一样，如果没有被Adapter移除，RecyclerView不知道View去哪里了。

*对于列表LayoutTransition是无效的：*

![LayoutTransirion bad example](http://img.blog.csdn.net/20151229105018461)

为了修复这个问题，RecuclerView会问LayoutManager新View的之前的位置。虽然这会工作，它将会需要LayoutManager结尾的一些统计，对于更复杂的LauoutManager可能不需要繁琐的计算。

RecyclerView控制item显示和消失动画的方式（就是说，view的显示和消失的动画是指它仍然在list中）是依赖LayoutManager处理layout逻辑的预测性。一方面，RecyclerView需要知道变化之前view被展示在哪一层。另一方面，RecyclerView想要知道变化之后view被展示在哪一层，如果LayoutManager展示items出现了问题，则item不可见。

为了LayoutManager更容易的提供这个信息，RecyclerView使用两个层来配合动画效果。具体如下描述：
    
> * 在第一个层中的变化(**preLayout**)，RecyclerView询问LayoutManager当前层之前状态的更多信息。比如上面的例子，就好像请求“‘C’被移除了”。LayoutManager正常执行‘C’被移除的操作，用新的View填补‘C’的空档。
> 
 出色的是RecyclerView仍然知道‘C’还在Adapter中。比如，当LayoutManager想要知道位置为‘**2**’的View是什么时，RecyclerView会返回‘C’(`getViewForPosition(2) == View('C')`)。如果问位置为‘**4**’的View是什么时，会返回来‘E’（虽然‘D’是Adapter第四个元素）。返回View的有一个**isItemRemoved**方法，LayoutManager可以通过检查这个方法来判断是否是消失的View。
    
> * 在第二个层中的变化（**postLayout**），RecycleView请求LayoutManager布置它自己的item。这时，‘C’已经不在Adapter中了。`getViewForPosition(2)`会返回‘D’，`getViewForPosition(4)`会返回‘F’。
> 
    记住，‘C’已经被Adapter移除了。但是因为RecyclerView保留了它的引用，它表现的好像‘C’仍然存在。换句话说，RecyclerView做了LayoutManager统计的工作。

每次调用LayoutManager中的`onLayoutChildren`的时候，它会**临时拆开**所有的View并从头开始布局。没有改变的View会被从废弃的缓存中返回，因此它们还是有效的。这使得重新布局相当高效。

*LinearLayoutManager之前的布局结果：（红色框范围内对用户是可见的）*


![LinearLayoutManager pre layout](http://img.blog.csdn.net/20160104165238477)

*LinearLayoutManager之后的布局结果*

![LinearLayoutManager post layout](http://img.blog.csdn.net/20160104165428678)

这两个布局变化后，RecyclerView知道View来自哪里所以能运行正确的动画效果。

![Predictive Animation](http://img.blog.csdn.net/20160104165622148)

*你可能会问*：‘C’没有被LayoutManager展示，那为什么还会可见？

要清楚，在pre-layout中被LayoutManager展示的‘C’是因为它看起来是在Adapter中。事实是在post-layout中不被LayoutManager展示的‘C’已经不再Adapter中存在了。也**就说**是‘C’不再是LayoutManager的孩子，但对于RecyclerView**不**是这样的。当LayoutManager移除了View，如果要实现动画效果，RecyclerView会使他做为孩子一直存在（所以动画会正确的显示）。更多的细节会在[Part 2](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)。

**消失的Items**

通过了两个布局过程的变化，RecyclerView可以正确的执行新View的动画效果。但是，消失的View存在另一个问题。考虑一下新添加的元素在list什么位置，会把一些元素移出可见区域。它看起来像LayoutTransitions：

![Add Animation Failure](http://img.blog.csdn.net/20160104165758583)

当‘X’被添加在‘A’后，它把‘F’移出了可见区域。因为LayoutManager没有展示‘F’，LayoutTransition认为它已经被一个淡出的动画效果移出UI。实际上，‘F’仍然在Adapter中只是被移出了可见区域。

为了解决这个问题，RecyclerView给LayoutManager提供了一个额外的API。在**postLayout**变化的末尾，LayoutManager会调用[getScrapList](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.Recycler.html#getScrapList%28%29)获得列表中的View（没有被LayoutManager展示，但仍然在Adapter中）。然后，它展示了这些view，好像RecyclerView的规模大到足以展示它们。

*LinearLayoutManager之后的布局结果：（红色框范围内对用户是可见的）*

![LinearLayoutManager post layout](http://img.blog.csdn.net/20160104165955801)

一个重要的细节是，因为这些View在动画效果结束后就不是必需的了，LayoutManager会调用**addDisappearingView**来代替`addView`。这就告诉了RecyclerView这个View的动画效果完成后就被移除。RecyclerView会把这个View加入到隐藏View的列表中，所以`postLayout`方法返回时在LayoutManager子View的列表中是不可见的。这样，LayoutManager就会忽视它。

![Predictive Add Animation](http://img.blog.csdn.net/20160104170057136)

首先，至少对于LinearLayoutManager来说，你可能认为它会计算View来自哪里和要去哪里（如果消失），这样就不需要两次布局计算。令人遗憾的是，许多类型的Adapter在同一个布局中发生变化时会有很多意外情况。除此之外，对于更复杂的LayoutManager，它不总是简单的计算一个item放在什么地方（例如StaggeredGridLayout）。这个方法会删除来自LayoutManager所有的负担，它可以很容易的支持一些适当的动画效果。

到目前为止，我的主要想法是RecyclerView如何预测动画的运行。实际上有很多简单的实现（对于LayoutManager来说）。你可以在[Part 2 - 幕后](http://www.birbit.com/recyclerview-animations-part-2-behind-the-scenes/)中了解更多。

