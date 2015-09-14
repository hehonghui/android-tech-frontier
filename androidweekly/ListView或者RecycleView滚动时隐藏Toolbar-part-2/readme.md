ListView或者RecycleView滚动时隐藏Toolbar( Part 2 )
---

>
* 原文链接 : [How to hide/show Toolbar when list is scrolling (part 2)](http://mzgreen.github.io/2015/02/28/How-to-hideshow-Toolbar-when-list-is-scrolling(part2)/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中





Hello，各位小伙伴，俺胡汉三又来了！！！今天我打算接着上一篇博文继续给大家讲解展现/隐藏Toolbar的效果。我建议没有读过 [ListView或者RecycleView滚动时隐藏Toolbar](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/androidweekly/ListView%E6%88%96%E8%80%85RecycleView%E6%BB%9A%E5%8A%A8%E6%97%B6%E9%9A%90%E8%97%8FToolbar/readme.md) 这篇文章的小伙伴先去看看那篇博文再来看这篇博文，不然会跟不上我的讲解节奏的哦。在上一篇博文里，我们学习了如何去实现Google+那个酷炫的展现/隐藏Toolbar的效果，今天，我将会给大家讲解怎么让上一篇博文的效果进化成Google Play Store Toolbar那样，废话不多说，我们现在进入正题吧：

在我们开始之前，我想先告诉大家的是我已经对这个项目进行了一些重构——我继承项目的 MainActivity 实现了两个新的子类：PartOneActivity 和 PartTwoActivity。源码在包 partone 和 parttwo里，你可以在这两个包里挑选你喜欢的那一个使用

下面是我们的最终效果图，我把它和 Google Play Store Toolbar 放在一起比较，大家可以感受一下：

![](http://img.my.csdn.net/uploads/201503/27/1427447727_3335.gif)
![](images/playstore.gif)

## 准备工作 ##

在这里我不会再给大家展示 build.gradle 文件，因为这和第一部分的 build.gradle 文件是一样的，所以我们将会从这个步骤开始——为我们的Activity创建一个layout：

同样的，layout里面只有一个 RecyclerView 和一个 Toolbar （稍后再加上 Tabs）。值得注意的是，我这里的实现是使用之前说的第二种方法（为RecyclerView添加Padding）

同样的道理，由于我们的布局文件、list、RecyclerAdapter 都和之前是一样的，我在这里都不会再给大家讲解了。

那现在我们来看看 PartTwoAcitivty 的代码吧：

在 PartTwoActivty 里面仍然是简单地对 RecyclerView 和 Toolbar 进行初始化，但大家一定要记得设置 OnScrollListener 哦（第27行）

感觉大家看到这里也感觉昏昏欲睡了，因为前面提到的内容大体上都和上一篇相似。但是莫慌！俺接下来就要讲这篇博文中最有趣的部分 —— HidingScrollListener 了，请大家紧紧抱住我，跟上节奏！

如果你看过第一篇博文可能会觉得此情此景很熟悉（可能还会感觉简单一些）。我们在 HidingScrollListener 里耍了什么 tricks 呢？那就是存了与 Toolbar 的高度相关联的屏幕滚动偏移量 —— mToolbarOffset。为了简化其中的逻辑，只有当 mToolbarOffset 的取值在[0 , Toolbar的高度]之间时，我们才会实现我们的逻辑：当我们向上滚动时，mToolbarOffset的值会增加（但不会超过Toolbar的高度）；当我们向下滚动时，mToolbarOffset 的值会减少（但不会低于0）。大家现在可能会有许多疑问：为什么要引用 mToolbarOffset 呀？为什么要让 mToolbarOffset 的取值范围介于那两者之间呐？别怕！你马上就会理解为什么我们要这样限制mToolbarOffset的取值了。我们必须知道的是，尽管我们极力去避免意外的发生，但现实总会出人意料，在这里也不例外，有时候 mToolbarOffset 的值就是会不可避免地在我们的取值范围之外，但由于我们的逻辑设计的限制，最终的显示效果会是闪烁一下。（例如：在屏幕上快速的挥动、滑动）这样的结果显然不是我们这些有格调的 Android 工程师想要的，因而我们需要对 mToolbarOffset 进行一定程度的裁剪，以规避这样的风险。基于这样的考虑，我们重载了 onMoved()方法 —— onMoved() 方法是一个当我们滚动视图时被调用的抽象方法。可能会吓到你，但是莫慌，继续抱住我！

接下来，我们就要回到我们 PartTwoActivity 设计之中，并且在我们的滚动监听器中实现 onMoved()方法。

是的，这就是所有内容啦。我们运行 App 后可以看到我们的最终效果：

![](http://img.my.csdn.net/uploads/201503/27/1427447725_3945.gif)

是不是感觉自己棒棒哒～就像我们想象的那样，Toolbar 完美的随着list的滚动实现了展现/隐藏的效果。其中的功劳都得归功于我们对 mToolbarOffset 取值范围的限制。如果我们省略掉检查 mToolbarOffset 是否在[0 , Toolbar的高度]范围中取值的过程，带着完成控件的喜悦向上滚动我们的list，Toolbar 确实会如你所期望的那样离开屏幕，但与此同时，Toolbar 还会远远地，远远地，离开视图，再也不回来。然后当你满是期许地向下滚动时，你就会发现刚刚那一声再见，竟是永远。如果你想再次遇见它，你就必须想下滚动，直到 mToolbarOffset = 0。

再脑补第二种情况吧，现在你正好把 Toolbar 滚动到 mToolbarHeight = mToolbarOffset 的位置，不偏不倚。那么现在Toolbar就刚好“坐”在了list顶部，如果你向上滚动的话，无论你怎么滚，它都不会动，只会静静地坐在那儿笑看人世沧桑。而如果你向下滚动，它又成为许多年前那个明亮、可爱的小女孩了。

虽然最终的实现效果看起来非常赞，但这并不是我想要的。因为我们能在滚动过程中停止整个效果，使得 Toolbar 有一部分是可见的，另一部分又是不可见的。但悲伤的是，Google Play Games 就是这么干的，而我一直认为这是一个Bug……

## 在某一点停下 Toolbar ##

就我的认知来说，我认为滚动的Views是能够如丝般顺滑地对齐相应的位置的，就像 Chrome 应用里的 Logo/SearchBar 又或者是 Google Play Store应用里那样。我很确定我在 Material Design 的guidelines/checklist 或者是 以前听过的Google I/O 大会上听过类似的规范。

那我们现在再来看看 HidingScrollListener 的代码吧：

虽然为了实现上面提到的效果我们会让 HidingScrollListener 的代码变得更复杂一些，但是我再说一次，莫慌，抱紧我！我们现在只需要重载 RecyclerView.onScrollListener 类的 onScrollStateChanged()方法，然后按照下面那样干就行了：

首先，我们需要检查list是否处于 RecyclerView.SCROLL_STATE_IDLE 状态，以确保list没有在滚动或者挥动（因为如果list如果正在滚动或者挥动的时候，我们就需要像第一篇博文那样去考虑 Toolbar 的Y方向位置哦）

如果我们抬起了手指，而且list已经停止移动了（）我们就要去检查Toolbar是不是可见的，如果是可见的，我们就需要考虑 mToolbarOffset 的值了。如果此时 mToolbarOffset 的值大于 HIDE_THRESHOLD 我们就必须把 Toolbar 隐藏起来；mToolbarOffset 的值小于 HIDE_THRESHOLD，我们则需要让 Toolbar 显示出来。

如果 Toolbar 不是可见的，我们就需要做相反的事情 —— 如果 此时mToolbarOffset（此时计算 mToolbarOffset要从顶部位置来考虑了，也就是 mToolbarHeight - mToolbarOffset） 大于 SHOW_THRESHOLD 我们就让 Toolbar显示；相反，如果 mToolbarOfffset 小于 SHOW_THRESHOLD ，我们就要再次将 Toolbar隐藏起来。

onScrolled()方法和第一篇博文的一样，我们并不需要作什么改变。我们现在最后需要做的就是在 PartTwoActivity 类里实现我们的两个抽象方法：

那么，你准备好看魔术了吗？

![](http://img.my.csdn.net/uploads/201503/27/1427448161_2643.gif)

hey，派大星你看，是不是很酷！

现在你可能在脑补添加 Tabs 会有多麻烦了，可是兄弟啊，生活很多时候都是出人意料的呐，不信你继续往下看呀

## 添加 Tabs ##

为了添加 Tabs，首先要做的当然是为我们的 Activity 布局添加一个 tabs.xml啦

你可以从源码那发现，我并没有添加真正的 Tabs，只是在布局里面模拟了 Tabs。而以上的一切不会改变任何之前的实现，你能在里面放任何你想要放的View。下面是一些 GitHub 上符合 Material Design规范的 Tabs 实现，当然你也可以自己实现啦。

添加 Tabs 意味这他们会稍微覆盖我们的list，所以我们需要增加Padding。为了减少代码的操作复杂度，我们不会在 xml 里进行这个操作（注意把 RecyclerView 在 part_tuo_activity里的padding删掉哦），因为 Toolbar 可能会在不同的设备中切换方向时拥有不同的高度（例如在平板中），这样的话我们需要创建一大堆的 xml 去解决这些乱七八糟的烦人问题。所以我决定在代码中解决这个问题：这是非常简单的，我们只需要和 Tabs高度的总和。如果我们把 Padding设置为 Toolbar 的高度现在运行起来的话，就会发现这样的东西：

![](http://img.my.csdn.net/uploads/201503/27/1427448162_3352.png)

看起来很正常的样子……我们第一个item刚刚好是可见的，我们也能移动跟随着它。实际上我们在 HidingScrollListener 类里什么也没干，唯一需要的改变都是在 PartTwoActivity 里做的：

你能发现什么发生了改变吗？我们现在不妨创建一个 mToolbarContainer 的引用，但是大家要注意哦， mToolbarContainer 是 LinearLayout 对象而不是 Toolbar对象，而且在 onMove()，onHide()，和 onShow()方法中，我们都把 Toolbar 改成了 mToolbarContainer。这会使得包含了 Toolbar 和 Tabs 的Container被移动，这恰恰就是我们想要做的。

如果我们把修改后的代码运行起来会发现，实际的运行效果正好就是我们所期望的，但如果你看的认真一些你会发现，里面其实有一个小Bug。在 Tabs 和 Toolbar 之间有时候会有一条白线，虽然时间非常短，但还是很惹人讨厌呐。我个人觉得这大概是因为当Toolbar 和 Tabs被显示的时候，他们并没有像我们期望的那样同步在一起。不过万幸这不是什么无法解决的Bug～
 
解决办法非常简单，就是让 Toolbar 和 Tabs 的背景和父布局保持一致：

现在即使 mToolbarContainer 在显示过程中没有很好的同步在一起，白线也不会出现了。正当我打算吃根辣条庆祝我们伟大战役的胜利的时候，又出现了一个Bug………………这个Bug和我们在第一篇博文里遇到的Bug是一样的，如果我们在list的顶部，我们可以向上滚动一丢丢，如果此时 HIDE_THRESHOLD 足够小，Toolbar 就会藏起来，导致那里有一块空白区域（其实就是我们设置的Padding）在list的顶部，但是我相信你到了现在应该不会慌了，因为你已经知道所有Bug在我眼里都是非常容易解决的：

我们只需要再增加一个变量用于存储list的总滚动偏移量，当我们准备去检查我们是否应该展现/隐藏 Toolbar的时候，我们首先应该检查我们的滚动距离是否比 Toolbar 的高度要大（如果不是的话，我们再让 Toolbar 出现）

这就是今天博文要讲的一切了，让我们来看一看实际效果！

![](http://img.my.csdn.net/uploads/201503/27/1427447727_3335.gif)

现在运行的效果简直完美啊大兄弟～即使用其他的 LayoutManagers 也不需要改变任何东西的哦：

![](http://img.my.csdn.net/uploads/201503/27/1427448162_7185.png)

评论区有好学的同学问了个有关存储滚动状态的问题，这确实是个小麻烦。如果我们list的item中的文字在垂直方向达到2行，在水平方向达到1行的话，我们的item高度就会变得很奇怪了……举个例子吧，如果我们滚动到垂直方向100的位置，然后旋转我们的设备，同时存储 mTotalScrolledDistance的值，在旋转之后，我们会滚动到list的顶部，然后我们会发现 mTotalscrolleddistance 的值不等于0。这个时候即使全能如我也想不到简单的办法来解决这个问题了，但是在我们的使用场景中，这样的小问题并不会有什么影响。如果你真的想要解决这个问题的话，我个人的做法是：在旋转之后把 mTotalScrolledDistance 的值重设为0 并且显示 Toolbar。

感觉今天写了好多内容啊，大家看到这里应该感觉很累了吧？不过今天这篇博文就是这个系列的最后一篇文章啦，大家能在第一篇博文中学习到知识我真的很高兴呢。大家鼓励和夸奖的话也让我很感动，我会继续写我的博客，为大家传授更多的知识，不过我也不知道下一篇博文会在什么时候写 2333。

除此以外我还想说的是，在这两篇博文中我提到的方法可能看起来运行的很好，但其实我并没有进行非常严谨的测试，所以我也不确定它们能不能被用于企业级应用中（你看我们不就遇到了好几个Bug了嘛）。这个系列的博文的初衷只是想告诉你，即使只使用标准API里面的一两个简单方法，也能够实现酷炫的效果。同时，我在写博文的过程中也发现了这些方法还有其他有趣的用法（例如：利用视差背景制作有粘性的 Tabs，就像在 Google+ 个人页面那样）。不管怎样，祝大家在写代码的过程中找到更多的快乐！

## 源码 ##

整个项目的源码都已经被上传到 [GitHub](https://github.com/mzgreen/HideOnScrollExample) ，大家可以去下载和使用哦，爱你们的 Michal Z。

如果你喜欢这篇博文的话，你可以 [在Twitter上分享给你的小伙伴](https://twitter.com/intent/tweet?url=http://mzgreen.github.io/2015/02/28/How-to-hideshow-Toolbar-when-list-is-scrolling(part2)/&text=How%20to%20hide/show%20Toolbar%20when%20list%20is%20scrolling%20(part%202)&via=mzmzgreen) 或者 [在Twitter上关注我哦](https://twitter.com/mzmzgreen) 。