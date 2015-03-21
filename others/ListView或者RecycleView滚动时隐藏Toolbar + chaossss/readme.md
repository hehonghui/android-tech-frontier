ListView或者RecycleView滚动时隐藏Toolbar
---

>
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成




在这片博文里我们将会了解如何实现Google+应用里滚动时隐藏Toolbar的效果（向下滚动时隐藏，向上滚动时显示）。这个效果在 [Material Design Checklist](http://android-developers.blogspot.com/2014/10/material-design-on-android-checklist.html) 里面也有被提及。

> 如果可以的话，当向下滑动时，App的标题栏将离开屏幕，从而让垂直方向上有更多的空间显示我们的内容。同时，当我们向上滑动时，App的标题栏又会再次出现

我们做出来的效果应该如下所示：

![](http://mzgreen.github.io/images/1/demo_gif.gif)

我们的list将会使用RecyclerView，但用其他可滚动的容器也是可以实现的（只是其他的容器要多花一些功夫，如：ListView）。对于这个效果的实现我想到了两种方法：

- 对list容器加一个padding
- 对list容器加一个header

我决定用第二种方法去实现，因为我发现为RecyclerView添加header会有许多问题，所以这是一个很好的机会去解决这些问题，但我还是会简要的介绍如何用第一种方法实现

## 那就让我们开始今天的讲解吧！ ##

首先我们需要创建我们的工程和添加必要的工具库：

现在我们需要定义 styles.xml 以保证我们的App是符合Material Design但没有添加actionbar（因为我们将会使用Toolbar）

接着我们就要创建我们activity中显示的布局：

这只是一个简单的布局，里面有RecycleView，Toolbar和ImageButton。我们需要把它们放在一个FrameLayout里，因为Toolbar需要被覆盖在RecycleView上。如果我们不这样做的话，当我们隐藏Toolbar时list上方会出现一个空白区域，这显然不会是我们想要的效果。

现在来看看我们MainActivity代码吧：

正如你看到的，这是一个非常简单的Activity类，仅仅实现了类的Oncreate方法，并且做了下面三件事情：

1. 初始化Toolbar

1. 获取mFabButton的引用

1. 初始化RecycleView

现在我们要为我们的Recycleview创建一个adapter，但首先我们应该为我们list中的每一项添加一个子布局以及相应的ViewHolder：

我们list的每一个子布局都只有一个text，非常简单！

那么现在就让我们来看RecycleAdapter的代码吧：

这是一个基础的RecycleView.Adapter实现。这里并没有任何特别的地方，如果你想要了解更多有关RecycleView内容，我建议你阅读Mark Allison's写的这些优秀文章 [series of posts](https://blog.stylingandroid.com/material-part-4/)

现在我们已经把车子的零件都拼凑好了，是时候让小车子上路跑一跑啦！

![](http://mzgreen.github.io/images/1/clipped.png)

等会……这是什么？就像你应该注意到的那样，Toolbar把我们的子item挡住了，或许你已经发现这是因为我们在activity_main.xml里使用了FrameLayout。这就是我开头提到的问题之一了。第一个解决办法是为我们的RecycleView增加一个PaddingTop，并将PaddingTop的值设置为Toolbar的值。但我们必须很谨慎，因为RecyclerView会默认裁剪到子View的padding区域，所以我们必须把这个特性关掉。那么我们的布局就会如下所示：

然后这样就能实现我们想要的效果了，也就是我们所说的第一种方法。但正如我告诉你的那样，我想教给你其他更复杂的方法去实现同样的效果，也就是为list添加一个header，让你在实现这个效果的同时能学到更多的知识。

## 为RecycleView添加一个Header： ##


首先我们需要稍微修改一下我们的Adapter：

下面是其实现原理：

我们需要定义Recycler展现出来的子布局类型。RecyclerView是一个非常灵活的组件。当你想要让你的list子布局有多种不一样的layout时，item的类型就会被利用到。而这就是我们想要的——让Header成为RecyclerView的第一个子布局，显然这会与其余的子布局不一样。（第3-4行）

我们需要让Recycler知道它需要展示的子布局是这几个（第49-54行）

我们需要修改onCreateViewHolder和onBindViewHolder()方法，如果子布局的类型是TYPE_ITEM的话，使它们返回和绑定一个普通的子布局；如果子布局的类型是TYPE_HEADER的话，则返回header子布局。（第14-34行）

我们需要修改getItemCount()，让我们返回的item总数量+1，因为我们还有一个header布局（第43-45行）

现在让我们来为Header布局创建一个layout和一个ViewHolder

这个layout非常简单。唯一需要重视的就是它的高度必须和Toolbar一致。同样的，它的ViewHolder也非常简单，一看就能懂。

好了，我们这样就能完成布局并且开始测试了。

![](http://mzgreen.github.io/images/1/clipping_fixed.png)

这样就好多了，对吧？所以总的来说，我们为RecyclerView添加了一个和Toolbar有相同高度的header，而且现在我们的Toolbar把header隐藏起来了（因为header现在是一个空的view)，此外，我们所有的子布局都是可见的。最后，我们就能开始实现滚动时改变view的出现和隐藏了。

## 滚动时控制Views的出现和隐藏 ##


为了实现这个效果，我们只需要为RecyclerView再创建一个类——OnScrollListener

就像你看到的，我们只需要一个实现一个方法就能让这个美妙的效果成为应用中的黑魔法，它就是——onScrolled()方法。它的参数——dx,dy分别是水平和垂直方向上的滚动距离。但事实上它们并不是代表屏幕上的物理距离，而是两个事件间的距离。

而它的算法大致上是这么实现我们要的效果的：

我们只有在视图被隐藏的同时在让视图向上滚动，或者在视图可见的同时向下滚动才会计算总的滚动距离。因为这两种情况才是我们实现这个效果关心的。

总的滚动距离超过我们展现/隐藏视图所在的方向的极限值（你把它调整的越大，你需要通过滚动展示/隐藏视图需要的距离就越大）（dy>0意味着我们在向下滚动，dy<0意味着我们在向上滑动）

实际上我们并不是在我们的滚动监听类里面展现/隐藏视图，取而代之的是我们通过调用show()/hide()方法来实现，所以调用者可以通过接口实现他们。

现在我们需要为我们的RecyclerView添加它的监听：

下面是我们通过动画改变我们的视图的方法：

当我们隐藏视图的时候，我们必须把页边距里也考虑进去，不然的话视图并不会完全被隐藏。

该测试我们的App了！

![](http://mzgreen.github.io/images/1/broken_gif.gif)

这看起来已经很棒了，但还是有一个bug——如果你在list的顶部，此时临界值非常小，因而你能隐藏Toolbar，但在list的顶部会看到有一个空白的区域。不过这里有一个很简单的方法解决这个bug，我们可以通过检测当前list的第一个视图是否为可见的，如果不是可见的，才使用我们设计的展示/隐藏逻辑。

在这样的修改后，如果第一个item是可见的并且有子item被它挡住了，我们也在展示它们，除此以外的情况我们都像之前说的那样实现我们的效果。我们来看看实际的效果吧～

![](http://mzgreen.github.io/images/1/demo_gif.gif)

太棒了思密达！感觉之前的失败都如雨后甘霖温润我脆弱的心灵呐～

这是我人生中的第一篇博文，如果你觉得很无聊或者我有哪里讲解错误的话千万不要喷我哦。我会在未来变得更棒哒！

如果你看到了这里还是很恶心通过添加header来实现这个效果的话，你可以通过为RecyclerView添加padding的方法，再结合HidingScrolllistener 也可以实现我们的效果的～

如果你有什么疑问的话，可以在评论区问我哦，我都会尽我所能为你解答的！

## 源码 ##

整个项目的源码在GitHub上面都有，大家可以在这看 [repo](https://github.com/mzgreen/HideOnScrollExample)

感谢Mirek Stanek帮我校对文章，么么哒！爱你的好基友Michal Z～

如果你喜欢这篇博文的话，你可以[在Twitter上分享给你的小伙伴](https://twitter.com/intent/tweet?url=http://mzgreen.github.io/2015/02/15/How-to-hideshow-Toolbar-when-list-is-scroling(part1)/&text=How%20to%20hide/show%20Toolbar%20when%20list%20is%20scroling%20(part%201)&via=mzmzgreen)或者[在Twitter上关注我哦](https://twitter.com/mzmzgreen)!




## 原文链接
[How to hide/show Toolbar when list is scroling (part 1)](http://mzgreen.github.io/2015/02/15/How-to-hideshow-Toolbar-when-list-is-scroling%28part1%29/)