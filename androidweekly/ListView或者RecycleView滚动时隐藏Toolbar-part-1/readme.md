ListView或者RecycleView滚动时隐藏Toolbar (1)
---

>
* 原文链接 : [How to hide/show Toolbar when list is scroling (part 1)](http://mzgreen.github.io/2015/02/15/How-to-hideshow-Toolbar-when-list-is-scroling%28part1%29/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中


今天我打算写一篇博文给大家介绍Google+ App的一个酷炫效果——向上/向下滚动ListView/RecyclerView时，Toolbar和FAB（屏幕右下方的小按钮）会隐藏/出现。这个效果也被Google视为符合 Material Design 规范的效果哦，详情参见： [Material Design Checklist](http://android-developers.blogspot.com/2014/10/material-design-on-android-checklist.html) 。


> 如果可以的话，我们希望当屏幕向下滚动时，App的Toolbar和FAB将离开屏幕，从而在垂直方向上为可显示区域腾出更大的空间来显示我们的内容。而当我们的屏幕向上滚动时，App的Toolbar和FAB会再次出现。

我们做出来的最终效果应该是下面这样的：

![](http://img.my.csdn.net/uploads/201503/27/1427447324_1070.gif)

在这篇博文的讲解中，我们将会用RecyclerView作为我们的list，但这不代表其他可滚动的容器就不能实现这样的效果了，只是其他的可滚动容器（如：ListView）需要要多花一些功夫才能实现这个效果。那么我们要怎么去实现呢？我想到了两个办法：

- 对list容器加一个Padding
- 对list容器加一个Header

就我个人而言，我更想用第二种方法去实现，因为在设计代码的过程中我发现：为RecyclerView添加Header会产生几个问题，这给了我很好的机会去思考如何解决它，与此同时，在这个思考和解决问题的过程中我还能学习到更多的知识，何乐而不为呢？不过我还是会给大家简要地介绍如何使用第一种方法实现的啦！

## 那就让我们开始今天的讲解吧！ 

首先，我们需要创建一个工程和添加必要的工具库：

接着我们需要定义 styles.xml ，以确保我们的App没有添加Actionbar（因为我们将会使用Toolbar），同时我们App的设计风格要符合Google的 Material Design 规范。

最后我们就要创建我们activity中显示的布局：

事实上，我们只需要一个简单的布局，其中包含了：RecyclerView，Toolbar和ImageButton。但需要注意的是：我们需要把它们放在一个FrameLayout里，否则当我们隐藏Toolbar时list的上方将会出现一个空白区域，这显然不会是我们想要的效果。我们理想的效果应该是：当Toolbar被隐藏，list能在屏幕的可见区域中显示出一整个列表，而这就需要通过使Toolbar覆盖在RecycleView上面来实现。

接着来看看我们MainActivity代码吧：

就像你看到的那样，这是一个只重写了OnCreate()方法，非常非常非常简单的Activity。而且OnCreate()方法也只做了下面三件事情：

1. 初始化Toolbar

1. 获取mFabButton的引用（mFabButton是FAB的对象哦，也就是屏幕右下方的小按钮）

1. 初始化RecyclerView

为了在list中显示出内容，我们现在就要为RecyclerView创建一个Adapter啦。但在此之前，我们应该为我们list中的item添加相应的子布局以及对应的ViewHolder：

list的每一个item只需要一个text用来显示文字，非常简单！

那RecyclerAdapter该怎么实现呢：

就像你看到的这样，这是一个非常普通的RecycleView.Adapter，没有任何特别的地方，是不是感觉被骗了呐  23333～（如果你想要了解更多有关RecyclerView知识，我强烈建议你去看大牛 Mark Allison's 巨巨写的这些优秀文章 [series of posts](https://blog.stylingandroid.com/material-part-4/)）

经过上面的努力，我们已经把车子的小零件组装的七七八八啦，是时候让小车子上路跑一跑，展现真正的技术了！

![](http://img.my.csdn.net/uploads/201503/27/1427447324_5421.png)

WTF，谁能告诉我这是什么鬼……？

我相信只要不是瞎子都会发现，App的Toolbar竟然把我们的item挡住了！！！或许部分机智的小伙伴已经发现了问题所在：出现这样的问题是因为我们在activity_main.xml里使用了FrameLayout，正是FrameLayout导致了这样的问题，而这就是我开头所提到的问题之一了。

第一个解决办法是为我们的RecyclerView添加一个PaddingTop，并将PaddingTop的值设置为Toolbar的高度。但有一个细节我们不能忽略，那就是RecyclerView会默认裁剪到子View的Padding区域，所以为了我们伟大的事业，我们必须把这个特性关掉。

经过这些修改之后，我们就能实现我们想要的效果，这就是我所说的第一种方法。但如我所说，我写这篇博文的目的，不仅仅只是教你实现这个效果，然后就完了。我想教给你实现同一个效果各种各样的方法，并且为你介绍其中的思想，让你接触到平常很难接触到的问题并教你如何解决它。有些方法固然会更加复杂（在本文中是为list添加一个Header），但你在实现过程中也能学到更多的知识，毕竟授人以鱼不如授人以渔嘛。

## 为RecycleView添加一个Header


要用第二种方法去实现这个效果，首先我们要做的就是稍微修改一下我们的Adapter：

下面是其实现原理：

我们需要定义一个常量来区分Recycler展现的item的类型。这里我需要为你介绍的是:RecyclerView是一个非常灵活的组件,RecyclerView 完全能实现你想要让list的item具有各种各样不同的布局的愿望，而此时，我们定义来区分item类型的常量就会被利用到。而这样的特性正是我们想要的——让Header成为RecyclerView的第一个item，显然这会与其余的item不一样。（第3-4行）

因而我们需要让Recycler知道它需要展示的子布局是什么类型的，在本文中我们用作类型区分的常量则是TYPE_ITEM和TYPE_HEADER。（第49-54行）

接着，我们需要修改onCreateViewHolder()和onBindViewHolder()方法，如果item的类型是TYPE_ITEM的话，使它们返回和绑定一个普通的item；如果item的类型是TYPE_HEADER的话，则返回Header。（第14-34行）

此外，由于我们的list并不仅仅只有普通的item，我们还在list中添加了Header，因此我们需要修改getItemCount()方法的返回值，让我们的返回值是普通item的总数量 + 1（第43-45行）

最后让我们来为Header布局创建一个layout和一个ViewHolder，但出乎意料的是，我们需要为Header创建的layout和ViewHolder都非常简单，唯一需要注意的是：Header的高度必须和Toolbar的高度一致。

那么这样我们就把布局弄好啦～不信你看图！

![](http://img.my.csdn.net/uploads/201503/27/1427447325_8379.png)

所以总的来说，我们为RecyclerView添加了一个和Toolbar有相同高度的Header，而现在我们的Toolbar把header隐藏起来了（因为header现在是一个空的view)，同时，我们所有的普通item都是可见的。那么现在就让我们来实现滚动时改变Toolbar和FAB的出现和隐藏吧！

## 滚动时控制Toolbar和FAB的出现和隐藏 


为了实现这个效果，我们为RecyclerView再创建一个——OnScrollListener类就够了你敢信？

我现在还要告诉你，在OnScrollListener类里，我们只需要重载onScrolled()方法就能让这个酷炫的效果成为App中秒杀用户的黑魔法！其中，onScrolled()方法的参数——dx,dy分别是水平和垂直方向上的滚动距离。但大家需要注意的是：这里dx，dy并不是代表屏幕上的物理距离，而是两个事件的相对距离。

具体的实现算法大体如下：

只有当list向上滚动且Toolbar和FAB被隐藏，抑或是当list向下滚动且Toolbar和FAB出现，我们才会计算总的滚动距离，因为这两种情况下的滚动距离才是我们实现这个效果所需要关心的。

总的滚动距离需要超过我们展现/隐藏Toolbar和FAB所在的方向的极限值才能将其展现/隐藏（你把极限值调整的越大，通过滚动展示/隐藏Toolbar和FAB需要的距离就越大）（dy>0意味着我们在向下滚动，dy<0意味着我们在向上滑动）

实际上我们并没有在我们的滚动监听类里面展现/隐藏Toolbar和FAB，我们是通过调用show()/hide()方法来展现/隐藏Toolbar和FAB的，所以调用者可以通过接口实现它。

现在我们需要为RecyclerView添加它的监听：

下面是我们通过动画改变我们的视图的方法：

当我们隐藏Toolbar和FAB的时候，我们必须把Padding也考虑进去，不然的话视图并不能够完全被隐藏。

是骡子是马，让我们拉出来溜一溜！

![](http://img.my.csdn.net/uploads/201503/27/1427447325_8449.gif)

虽然现在看起来已经很nice了，但其实这里有一个小小的bug——如果你在list的顶部，此时临界值非常小，因而你能隐藏Toolbar，但你在list的顶部会看到有一个空白的区域。不过幸好这里有一个很简单的方法可以解决这个bug：我们可以通过检测当前list的第一个item是否为可见的，只有当它不可见，才使用我们设计的展示/隐藏逻辑。

在这样的修改后，即使第一个item是可见的并且有item被它挡住了，我们也在展示它们，除此以外的情况我们都像之前说的那样实现我们的效果。

各位观众，接下来，就是见证奇迹的时刻：

![](http://img.my.csdn.net/uploads/201503/27/1427447326_5458.gif)

太棒了思密达！感觉之前的失败都如雨后甘霖温润我脆弱的心灵呐～

其实羞羞地说一句……这篇文章是我人生中的第一篇博文呐，如果你觉得很无聊或者我有哪里讲解错误的话千万不要喷我哦。我会在未来变得更棒哒，然后尽我所能为大家贡献更多的文章！

如果你看到这里还是通过添加Header来实现这个效果很恼火的话，用第一种方法结合HidingScrolllistener 也是可以实现这个效果的～

如果你有什么疑问的话，可以在评论区问我哦，我都会尽我所能为你解答的！

## 源码 

整个项目的源码在GitHub上面都有，大家可以在这看 [repo](https://github.com/mzgreen/HideOnScrollExample)

感谢Mirek Stanek帮我校对文章，么么哒！爱你的好基友Michal Z～

如果你喜欢这篇博文的话，你可以[在Twitter上分享给你的小伙伴](https://twitter.com/intent/tweet?url=http://mzgreen.github.io/2015/02/15/How-to-hideshow-Toolbar-when-list-is-scroling(part1)/&text=How%20to%20hide/show%20Toolbar%20when%20list%20is%20scroling%20(part%201)&via=mzmzgreen)或者[在Twitter上关注我哦](https://twitter.com/mzmzgreen)!
