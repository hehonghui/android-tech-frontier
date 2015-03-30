###符合Material Design的抽屉导航效果：

![](https://d262ilb51hltx0.cloudfront.net/max/720/1*hLe32r_m-fWUQrnJCalKkQ.png)

####前言：
现在看来，导航抽屉已是流行开来。尽管广受批评，但我还是很喜欢该样式，因此我决定在我经营的几个app上实现它。你在这儿能读到的是我的一些想法，有关它何处有趣，并希望能向他人学习，得到帮助。

这是三篇文章中的第二篇。欢迎查看第一篇和第三篇：

    * [Material Design下的抽屉导航的大小](https://medium.com/@sotti/navigation-drawer-styling-under-material-design-f0767882e692)
	* Material Design下的抽提效果的行为（敬请期待）

你可以从下面查看Material Design指南上关于抽屉导航的部分：

	* Navigation Drawer pattern
	* Material Design metrics and keylines
	* Toolbar metrics

### 开始：
抽提效果总是很流行。当Material Design的观念开始出现的时候，就有一些混乱，但是在指南发布之后，就已经变的完全清楚了。

现在，虽然这儿已有一些漂亮的库，甚至有一些Google的源码能拿来看看... 但是，你之所以还来到这里，可能是因为你热衷于编程。

在这篇文章里，我将会谈论如何确定抽屉的样式。但是并不是对于所有的，像指南上的东西，都一概而论，这只是我认为需要强调的东西。

准备好了吗？

### 位置
在过去，导航抽屉和ActionBar在同一图层。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*Vh9mKyCUMDCFMFjM8ZEG9Q.png)

随着该样式的发展，它开始出现了些不一致的地方。材料设计中，很明显，两张纸片处在不同的view层。这儿曾有很多的争论，就连Google也无能为力，但是现在，抽屉导航定义如下：

> 左侧的导航抽屉横跨屏幕的高度并覆盖下方的状态栏。抽屉下的东西将会变暗。但仍是可见的。

![](https://d262ilb51hltx0.cloudfront.net/max/1267/1*Gg34WwPMo1ylOX7KLPaY0w.png)

注意图中右边的抽屉略有不同。

注：我假设你使用的是AppCompat toolbar

既然toolbar是图层的另一个view，不妨就就将toolbar置于抽屉的layout之下，跟其他的view一样。

如果你在Google应用上看到如下的东西也不用担心：

![](https://d262ilb51hltx0.cloudfront.net/max/700/1*ncHm2VDOAU4GRN5Act_P5A.png)

Google+ Photos可能是最后一个使用抽屉，却没有覆盖ActionBar/Toolbar的Google应用，但是我想他应该很快就会被改过来。

### 旋转杆

你还记得当抽屉打开时那个ActionBar/Toolbar中的漂亮的图标动画吗？这个动画在Holo下并不是很好看，但是在Matarial Design下却是。

![](https://d262ilb51hltx0.cloudfront.net/max/768/1*QfXDV7tpaGwEqil_l6Pe8Q.gif)

我觉得当它第一次出现在Google Play Store时，很多的开发者和设计师都会很喜欢它。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*XI72aAgZON-g0F_Teo6kiA.jpeg)

我记得很多人在第一次转到Matarial Design上时，都是首先研究的汉堡/箭头。Google第一次实现抽屉的时候，并不是把它放在ToolBar的上面的，因此你可以看到这个精美的动画。但是指南出现后，有一个很奇怪的现象，很多的Google应用都是在做完全反材料设计的事情。当我写下这行字的时候，大部分的应用还是在遵循着材料设计的指导，我希望它们都带有覆盖ToolBar的抽屉。

在我看来，这个设计决定的已经有点晚了的时候。图标动画却已出现在发布了的SDK中了。

因为某些原因，即使把抽屉布局到其他的之上，大多数的google应用还是有这样的动画(注：在写下这篇文章的时候，Gmail和Inbox已经停用了)，即使你很少去看到它（如果你集中注意力，缓慢的移动抽屉，你可以看到）。让我很苦恼的是：一旦你见过了，你就不会再去看了。因此，我也决定停用了。

第一眼看来，DrawerArrowStyle的参数很容易懂：

< item name="spineBars"> true < /item>

Android Developers中定义如下：

> 在移动的时候，bars旋转与否。必须设定一个值：要么是true，要么是false。

但问题是，这并不能起到作用。如果你设置为false，bars就会以一种奇怪的方式旋转。

我发现的解决的方式是：覆写onDrawerSlide方法。见下面链接的Gist。

> 既然这个图标动画很少出现，那就没那必要在保留它了。如果你不注意，你就看不到它，如果你注意的话，看到它，又不知道是怎么回事。

### 账户图片

这个账户图片是圆的。有很多的方法得到一个圆形的图片，但是我总是记住这个[Romain Guy](https://plus.google.com/+RomainGuy/about)的[作品](http://www.curious-creature.com/2012/12/11/android-recipe-1-image-with-rounded-corners/comment-page-1/)。因此我决定使用CircleImageView，它是基于Romain Guy的技术，不会出错的。我没有看用在Google IO app上的那个，但是很可能值得一看。

在Google Paly Movies与Google Paly Books上，这个图片有一个白色的边框。而其他的Google app上却没有。Google+和Hangouts的账户图片在toolbar上，不过却有白边框。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*58WoVNOl-JIRyp1o3_f9JQ.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*v5KQiG7MNlpFdCjSk0WHqQ.jpeg)

注意：[查看账户图片大小](https://medium.com/@sotti/navigation-drawer-styling-under-material-design-f0767882e692)

> 账户图片是圆形的，通常没有边框。建议你通过Romain Guy推荐的库来获得的圆形。

### 封面图片

封面图片（不同于账户图片），是账号/头像部分的背景（这是上部，通常你可以切换你的账号，查看你的名称，email和你的账户图片）。

这块的文字是白色的，并且确保能看的见，你可以应用一个前景或者半透明的黑色覆盖封面图片。我试着40-50% 的黑色最好。你不要弄的这个图片既不可见，文字也不可读了。

我做的是在FrameLayout中加一个前景。我不知道这是不是最好的方法，希望能收到大家的意见。我没有提供在账号之间的切换，这整个layout/部分都是可点击，有touch反馈，或者是Lollipop中的ripple，或者两者。确保只用了[centerCrop ](https://developer.android.com/reference/android/widget/ImageView.ScaleType.html)scaleType ，让它更好看。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*JnT0ei6pp-M7Fn0ZZxl-yg.jpeg)

你看一下，抽屉上的图片在状态栏下也是可见的。当我写下这行字的时候，Google apps仍然在迁移到这部分。Gmail，Inbox，Keep，Playe Story和Hangouts已经做到了，而其他的人也正在这样做。当然这只有运行在Lollipop既以上的时候才会有。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*0K95PBc-Ym1quF4S4-svlw.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*eYUlXFl-nKp54CbhSqHy5Q.png)

即使是现在，在Play Store 上的Google IO app的抽屉导航也是完全错的，他们有好的代码，并且在准备下一个版本（好像有段时间了... 可能在今年接个月后的Google IO 大会上会更新）

有点神奇的是Google ScrimInsets layout。拷贝，粘贴就可以了。你可以自己尝试下。我觉得Google的人应该比我做的好。看一下下面的代码，也要看一下gist上的，因为还要一些themes/style的配置。

我有一些疑惑就是ScrimInsets layout能不能应用到Lollipop以下的版本中。我知道在Kit Kat中是可行的，但是Google并没这样做。可以肯定的是“挤入”状态栏和/或导航栏在Lollipop下的版本中并不存在，这可能是背后的一个原因。

注意：查看封面照片的大小

> 只有在Lollipop中，抽屉导航会出现在状态栏之下。在Lollipop之下的版本中，挤入状态或导航栏并不是什么事情，这可能是其中的原因。

### 可选中行的背景，图标和文字

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*l38m8vKyELP23Fgo0VIYLg.png)

当要更改抽屉中的主要行的样式的时候，我们要处理三个元素（背景，图标，文本）和3个不同的状态（默认，选中，点击）对每行的每个元素。并不是每个东西都要卸写在specs中，但是我们要阅读spec，看看Google apps和其他的一些好看的apps，并且尝试弄明白如何一Matarial Design的方式完美呈现。

Okay，现在来看一些Google apps来搜集一些提示。在下面的图片中，第一行是默认的状态，第二行是选中的状态，第三行是点击的状态。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*cbbbhJcPwsrL6XuF_7B-BA.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*S7YeU9ekl1_nC03isgeVBw.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*guYsqqXCcQikqMNMVTL1_g.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*fTlbwdydeGKNznbliR2J-g.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*rzdSKrX4NgQqwPOeNReuTw.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*ubYKjE5BgQUnuf8vXBjucA.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*W0l0rAj_f08DcYiBKhnpYQ.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*WMsmw3UZ6kzBGaMCHPWgHA.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*ZsjyMCtqBLG4iq7_ypaLUA.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*Mn1OyDGujUgv3hXi-bBggw.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*BV3ByPvh4Elbq2MKPrE-Bg.jpeg)

上面的图片看起来很相似，但是它们是不同的。总结：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*BXfi8inb3rWh0gRCve5uCg.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*0_cj6ynaM0rDvBmQG0WJFw.png)

> Google apps看起来十分的连贯，但是当你注意下细节时会发现，此时抽屉导航的选中行有超过10多种的样式。

* 拇指规则：

在一些尝试和参考指南与Google apps后，这是我提出的一些：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*zU5_BF4hNM3ESUqqOyn7Dw.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*X2iLimaiz8NgrdDtbcinFg.jpeg)

### 如何实现

我很想知道其他人是如何做这件事的，但是我是这么做的。

首先，使用两个drawable作为背景。一个放在res/drawable-v21里，为了Lollipop及以上的版本；另一个在res/drawable中，目标是更低的版本。因为ripple在5.0以下的版本中并不存在。

> 仅在Lollipop及以上的版本中使用ripple。Ripples并不支持5.0以下的版本。

每当你点击一行的时候，ripple就会出现，不管它选中与否。因此，你在res/drawable-v21中的是有一组包含ripple的items的selector。这是因为我们希望对于选中和未选中的行，在被点击时都能显示相同的ripple，但是未选中的背景是白色，而选中的item的背景是grey_200。

在res/drawable中，你需要的是一个不包含ripple的selector。

### 图标

在最后的一个月，我尝试使用不同颜色的同一图标。 因此，我就把所有的图标都弄成白色，然后在用想要的颜色进行着色。这样做的优点是，你不必每次创建一个新的图标。你可以从Google上得到不同大小和颜色的这些图标，你可以用不同的颜色二次加工，看看那种最好。另外你要是使用同一图标的不同颜色的话，要记得保存成相同的大小。如果你需要根据状态（点击，选中...）来改变他的颜色的话，可以设置一个color state list resource。

我实现的方式是在一个自定义的view中编写的，因为color state list在Kit Kat及其一下的版本中并不可用（android:tint可以使用color，但是不能用color state）。

看一下下面链接中的gist中我是如何做的。如果你发现了更好的方式，或错误，请反馈给我。

### Header和footer的行为

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*COQpEPm-a2DLqdifPANmzw.png)

头部（aka account section）中有些是定住的，而有些是可滑动的。以我看来，

底部（aka setting and support）可以定住，也可以不。如果你看一下Google Apps，有些是定住的，有些是在scroll的底部。如果你有需求是不在抽屉的底部的话，那就放在主行的后面。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*8HEdHs9YQq35OKtsCmAwLQ.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*JW5RFt4JfEahP9tqH3-bPg.png)

在我看来，定住是最好的方法，但是你可以做些例外。比如一种例外就是，当头部定住时，入口就解决了，然后在抽屉里有了可滚动的部分。如果可滚动的空间太小，就会看起来很丑（一行或两行），然后你可能想要更多的空间，那么一个好的办法就是将底部接触固定。

> 头部和底部理应被固定住，除非抽屉需要更多的空间以看起来和表现的更好。

由于抽屉选项，路径，结构...的不同，因此这里并没有什么拇指法则。

### 资源
-[Google Official Material Design icons](https://github.com/google/material-design-icons)
-[Material Design Color Definitions](http://www.google.com/design/spec/style/color.html)

### 代码

-[Github](http://www.google.com/design/spec/style/color.html)

### 总结
这是关于更改抽屉的样式，想清楚你要做什么往往比你做到要花费更多的时间。

如果你想要了解更改抽屉样式，看看另两篇文章。

我希望能得到一些评论，反馈或其他的东西。我写下这篇文章来帮助他人，也向他人学习。

Hava fun！
