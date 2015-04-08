###符合Material Design的抽屉导航效果：
---
>
* 原文链接 : [Navigation Drawer styling according to Material Design](https://medium.com/@sotti/navigation-drawer-styling-according-material-design-5306190da08f)
* 译者 : [wly2014](https://github.com/wly2014)
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  校对完成

![](https://d262ilb51hltx0.cloudfront.net/max/720/1*hLe32r_m-fWUQrnJCalKkQ.png)

####前言：
现在看来，抽屉式导航[已经成为主流导航模式之一](http://goo.gl/w4FVWS)。尽管广受[批评](https://medium.com/@villainschorus/your-problem-goes-beyond-hamburgers-e0aae6a1576)，但我还是很喜欢该样式，因此我决定在我写的几个app上添加这个控件。这篇文章想通过介绍我觉得抽屉式导航有趣的地方，帮助阅读本文的 Android 开发者们学习到一些知识，同时从其他人的评论中学习到更多的东西。

这是三篇文章中的第二篇。欢迎查看第一篇和第三篇：

    * [Material Design下的抽屉导航的大小](https://medium.com/@sotti/navigation-drawer-styling-under-material-design-f0767882e692)
	* Material Design下的抽屉效果的行为（敬请期待）

你可以从下面查看Material Design指南上关于抽屉导航的部分：

	* [Navigation Drawer pattern](http://www.google.com/design/spec/patterns/navigation-drawer.html)
	* [Material Design metrics and keylines](http://www.google.com/design/spec/layout/metrics-keylines.html#)
	* [Toolbar metrics](http://www.google.com/design/spec/layout/structure.html#structure-toolbars)

### 开始：

抽屉式导航一直以来都是被争论的热点话题。当 Material Design 规范刚发布的时候，抽屉式导航就在规范中处在一个尴尬的位置，使得开发者们很[困惑](http://goo.gl/q3dnCI)到底要不要使用抽屉式导航，甚至在 Material Design 规范下的[开发指南出来以后](https://plus.google.com/+SebastianoPoggi/posts/6MFgMeRLrrg)，有关如何在 Android 开发中对待抽屉式导航都没有一个清晰的答案。

现在，虽然这儿已有一些漂亮的[库](https://plus.google.com/+MikePenz/posts/Erwn9mDZszr)，甚至有一些Google的[源码](https://github.com/google/iosched)能拿来看看... 但是，你之所以还来到这里，可能是因为你[热衷于编程](http://i3.kym-cdn.com/photos/images/facebook/000/234/765/b7e.jpg)。

在这篇文章里，我将会谈论如何使用抽屉的样式，但是并不会完全涉及 Material Design 指南上的所有样式，只是捡一些我认为需要强调的东西。

准备好了吗？

### 位置
在过去，抽屉式导航栏 和 ActionBar 处于同一个 View 层级

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*Vh9mKyCUMDCFMFjM8ZEG9Q.png)

随着这种设计模式的发展，其中相互矛盾的地方也开始浮出水面……在 Material Design 中很清晰地指出：处于不同 View 层级的两个页面，是不能共存于同一个父布局中的同一个 View 层级的。有关这个问题引发了[许多讨论](https://plus.google.com/+RomanNurik/posts/3G8zYvN5oRC)，但[更重要的是](http://goo.gl/SHrQmd)， [Google 并没有给出好的解释](http://goo.gl/FghQhb)，不过最后抽屉式导航还是得到了一个被认可的定义：

左抽屉式导航打开后，导航栏的高度应该和屏幕一致，但要低于状态栏。此外，其他任何在抽屉层以下的内容都应该被阴影覆盖，但这些内容又是可见的。

> 左侧的导航抽屉横跨屏幕的高度并覆盖下方的状态栏。抽屉下的东西将会变暗。但仍是可见的。

![](https://d262ilb51hltx0.cloudfront.net/max/1267/1*Gg34WwPMo1ylOX7KLPaY0w.png)

注意图中右边的抽屉略有不同。

注：我假设你使用的是[AppCompat ](https://chris.banes.me/2014/10/17/appcompat-v21/) [toolbar](https://developer.android.com/reference/android/widget/Toolbar.html)

既然toolbar是View 层级的另一个view，不妨就就将toolbar置于抽屉的layout之下，跟其他的view一样。

如果你在Google应用上看到如下的东西也不用担心：

![](https://d262ilb51hltx0.cloudfront.net/max/700/1*ncHm2VDOAU4GRN5Act_P5A.png)

Google+ Photos可能是最后一个使用抽屉，却没有覆盖ActionBar/Toolbar的Google应用，但是我想他应该很快就会被改过来。

### 旋转标题图标

你还记得当抽屉打开时那个ActionBar/Toolbar中的漂亮的图标动画吗？这个动画在Holo主题下并不是很好看，在 Matarial Design 下却很漂亮。

![](https://d262ilb51hltx0.cloudfront.net/max/768/1*QfXDV7tpaGwEqil_l6Pe8Q.gif)

我觉得当它第一次出现在Google Play Store时，很多的开发者和设计师都会很喜欢它。

仅在那数周之后，抽屉式导航上就[开始出现该动画](https://lh6.googleusercontent.com/-9oPeSA7FUkI/VOs530mLbLI/AAAAAAABapc/ekQNTZPXyoE/w499-h281-no/tumblr_inline_nk2y80nOF91rllljr.gif)。那时它显得很特别，因为在Google Material Design videos 和 promo features上都出现了它的身影。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*XI72aAgZON-g0F_Teo6kiA.jpeg)

我记得很多人在第一次遵循 Matarial Design 规范开发时，就是使用这个汉堡/箭头图标动画。Google第一次实现这个抽屉式导航栏的时候，并不是把它放在 ToolBar 的上面，因此你可以看到这个精美的动画。但是 Material Design 指南发布后，出现了一个很奇怪的现象，很多的Google应用都在做与 Material Design 指南背道而驰的事情。即使是现在我写这篇博文的时候，大部分的应用还是在遵循着 Material Desgin 指南，但我还是希望抽屉式导航栏都能在 Toolbar 上面。

在我看来，Material Design发布的已经有点晚了。因为图标动画已出现在发布了的SDK中并且在默认情况下被使用了。

由于某些原因，即使要求把抽屉导航栏布局到其他的view之上，但大多数的google应用还是会有这样的动画(注：在写下这篇文章的时候，Gmail和Inbox已经停用了)，即使你很难发现它（但如果你仔细看的话，在缓慢的移动抽屉式导航时，还是可以看到动画的）。让我很不爽的是：一旦你看到了，又会每次都忍不住去看，得不偿失。因此，我也决定关掉这种动画效果。

第一眼看来，DrawerArrowStyle的参数很容易懂：

[< item name="spineBars"> true < /item>](https://developer.android.com/reference/android/support/v7/mediarouter/R.attr.html#spinBars)

[Android Developers中定义如下：](https://developer.android.com/reference/android/support/v7/appcompat/R.attr.html#spinBars)

> 在移动抽屉导航栏的过程中，无论图标是否应该旋转，都要设定一个布尔值：要么是 true，要么是false.

但问题是，这并不能起到作用。如果你设置为false，bars就会以一种奇怪的方式旋转。

我发现的解决的方式是：覆写onDrawerSlide方法。见下面链接的Gist。

> 既然这个图标动画的可视性较差，那就没有必要再保留它了。如果你不注意看，你就看不到它，但当你注意看并看到的时候，又不知道是怎么回事。

### 资料图片

这张个人头像是圆形的，我们有很多方法能让图片变成圆形，但我每次需要实现这个需求想起的都是 [Romain Guy](https://plus.google.com/+RomainGuy/about) 的[方法](http://www.curious-creature.com/2012/12/11/android-recipe-1-image-with-rounded-corners/comment-page-1/)。所以这次我还是使用了 Romain Guy 的 CircleImageView，毕竟“信RM，无BUG”。有人可能会提到 Google IO 大会上被使用的那个[ App](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/samples/apps/iosched/ui/widget/BezelImageView.java)，我还没去了解过它的具体实现，可能值得我们看一看吧。

在Google Paly Movies与Google Paly Books上，这个图片有一个白色的边框。而其他的Google app上却没有。Google+和Hangouts的资料图片在toolbar上，不过却有白边框。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*58WoVNOl-JIRyp1o3_f9JQ.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*v5KQiG7MNlpFdCjSk0WHqQ.jpeg)

注意：[查看资料图片大小](https://medium.com/@sotti/navigation-drawer-styling-under-material-design-f0767882e692)

> 资料图片是圆形的，通常没有边框。建议你通过Romain Guy推出的库来获得圆形。

### 封面图片

封面图片（不同于资料图片），是账号/头像部分的背景（就是抽屉式导航的上部，通常你可以在此切换账号，查看昵称，email和你的资料图片）。

这块的文字是白色的，并且要确保能看的见，你可以应用一个前景或者半透明的黑色来覆盖封面图片。我试了一下，发现40-50% 的黑色是最好的。要注意的是，不要既弄得图片不可见，又弄得文字没法读。

我是在FrameLayout中加一个前景。但我不知道这是不是最好的方法，欢迎大家交流。我并没有实现在账号切换的功能，而且这整个layout/section都是可点击的，有touch反馈，或者是Lollipop中的ripple，或者两者。当然你也可以使用[centerCrop ](https://developer.android.com/reference/android/widget/ImageView.ScaleType.html)scaleType 让它更漂亮。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*JnT0ei6pp-M7Fn0ZZxl-yg.jpeg)

仔细看一下这个图片，你会发现其实它在状态栏下也是可见的。当我写下这行字的时候，Google apps正在应用这种效果。Gmail，Inbox，Keep，Playe Story和Hangouts已经实现了，而其他的也准备实现它。当然，这只是Lollipop及以上的版本中才会有的效果。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*0K95PBc-Ym1quF4S4-svlw.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*eYUlXFl-nKp54CbhSqHy5Q.png)

即使是现在，在Play Store 上的Google IO 的有些应用的抽屉式导航也是完全错的，但他们在改良代码，并且准备下一个版本了（不过好像有段时间了... 可能会在今年几个月后的Google IO 大会之前更新）

比较神奇的是[Google ScrimInsets layout](http://goo.gl/07TJnm)。拷贝，粘贴，然后自己试着修修改改就OK了。我觉得Google的人员应该比我做的更好。深入的阅读一下gist上的代码，了解一下关于 themes/styles 的更多的详细内容，能让你有更好地表现。

让我有点疑惑就是ScrimInsets layout能不能应用到Lollipop以下的版本中。我知道在Kit Kat中是可行的，但是Google并没这样做。可以肯定的是“挤满”状态栏和/或导航栏在Lollipop下的版本中并不存在，这可能是背后的一个原因。

注意：[查看封面照片的大小](https://medium.com/@sotti/navigation-drawer-styling-under-material-design-f0767882e692)

> 只有在Lollipop中，抽屉导航会出现在状态栏之下。在Lollipop之下的版本中，挤满状态或导航栏并不是什么事情，这可能是其中的原因。

### 可选中行的背景，图标和文字

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*l38m8vKyELP23Fgo0VIYLg.png)

当要更改抽屉中的主要行的样式的时候，对每行的每个元素，我们都要处理其中的三个子元素（背景，图标，文本）和3个不同的状态（默认，选中，点击）。但每一个开发者都需要明白：开发 App 不需要完全遵循[规范](http://www.google.com/design/spec/patterns/navigation-drawer.html) ，但是了解规范又是必不可少的，大家可以看看 Google 的 App 和其他的一些好看的apps是怎样体现 Material Desgin 所包含的思想的，把你从这些 App 里总结出来的东西应用到你的 App 中。

Okay，现在来看一下Google apps 都有哪些特征。在下面的图片中，第一行是默认的状态，第二行是选中的状态，第三行是点击的状态。

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

虽然上面的图片看起来很相似，但其实它们是不一样的。总结一下就是：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*BXfi8inb3rWh0gRCve5uCg.jpeg)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*0_cj6ynaM0rDvBmQG0WJFw.png)

> Google apps看起来十分的连贯，但是当你注意下细节时就会发现，此时抽屉式导航的选中行有超过10多种的样式。

* 拇指规则：

在自己不断地尝试并参考了设计指南与Google apps后，这是我提出的一些想法：

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*zU5_BF4hNM3ESUqqOyn7Dw.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*X2iLimaiz8NgrdDtbcinFg.jpeg)

### 如何实现

尽管我想知道，但是没人告诉我他是怎么来实现的，所以我自己就这么做了。

首先，使用两个drawable作为背景。一个放在res/drawable-v21里，为Lollipop及以上的版本使用；另一个在res/drawable中，目标是更低的版本。因为ripple在5.0以下的版本中并不存在。

> 仅在Lollipop及以上的版本中使用ripple。Ripples并不支持5.0以下的版本。

每当你点击一行的时候，ripple就会出现，不管它选中与否。因此，你在res/drawable-v21中的是有一组包含ripple的items的selector。这是因为我们希望对于选中和未选中的行，在被点击时都能显示相同的ripple，但是未选中的背景是白色，而选中的item的背景是grey_200。

另外在res/drawable中，你需要的是一个不包含ripple的selector。

### 图标

在最近的几个月里，我尝试让同一图标呈现出不同的颜色来。 因此，我就把所有的图标都先弄成白色，然后在用想要的颜色进行[着色](https://developer.android.com/reference/android/widget/ImageView.html#attr_android:tint)。这样做的优点是，你不必每次创建一个新的图标。[你可以先从Google上得到不同大小和颜色的这些图标](https://github.com/google/material-design-icons)，再用不同的颜色进行二次加工，看看那种效果最好。另外你要是使用不同颜色的同一图标的话，要记得保存成相同的大小。如果你需要根据状态（点击，选中...）来改变它的颜色的话，可以设置一个[color state list resource](https://developer.android.com/guide/topics/resources/color-list-resource.html)。

我实现的方式是在一个[自定义的ImageView](https://github.com/Sottti/MaterialDesignNavDrawer/blob/master/app/src/main/java/com/demo/materialdesignnavdrawer/customViews/TintOnStateImageView.java)中编写的，因为color state list在Kit Kat及其一下的版本中并不可用（android:tint中可以使用color，但是不能用color state）。

看一下下面链接中的gist中我是如何做的。如果你发现了更好的方式，或错误，请反馈给我。

### Header和footer的表现

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*COQpEPm-a2DLqdifPANmzw.png)

头部（aka account section）中有些是不可滑动的，而有些是可滑动的。以我看来，如果可以的话，最好设计成不可滑动的。这样的话，抽屉式导航看起来更美观，连贯，易用。

底部（aka setting and support）可以是可滑动的，也可以不是。如果你看一下Google Apps，就会发现有些是不可滑动的，而有些是在可滑动的scroll的底部。如果你有需求是不能放在抽屉的底部的话，那就放在能滑动的列表的后面。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*8HEdHs9YQq35OKtsCmAwLQ.png)

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*JW5RFt4JfEahP9tqH3-bPg.png)

再次强调一下，在我看来，不可滑动是最好的方式，但是也可以有例外。比如，当头部不可滑动时，有些条目就被固定了，因此在抽屉里就有了可滚动的区域了。但是如果可滚动的空间太小，那么看起来就很糟糕了（只有一行或两行），要想得到更多的空间，那么一个好的办法就是将footer 解除固定。

> 头部和底部理应被固定住，除非抽屉需要更多的空间以表现更出色。

由于抽屉选项，路径，结构...的不同，因此这里其实并没有什么拇指法则。

### 资源
-[Google Official Material Design icons](https://github.com/google/material-design-icons)
-[Material Design Color Definitions](http://www.google.com/design/spec/style/color.html)

### 代码

-[Github项目地址](https://github.com/Sottti/MaterialDesignNavDrawer)

### 总结
这是关于如何更改抽屉式导航的样式，你仍需要花费很多时间来想清楚你想做成什么样，而这要比做到花费的时间要长的多。

如果你想要了解更改抽屉式导航的样式，请看看另两篇文章。

欢迎评论，反馈... 

Hava fun！
