Flow和Mortar的调查
---
>
* 原文链接 : [Architecting An Investigation into Flow and Mortar](http://www.bignerdranch.com/blog/an-investigation-into-flow-and-mortar/)
* 译者 : [sundroid](https://github.com/sundroid)( [chaossss](https://github.com/chaossss) 协同翻译)
* 校对者: [chaossss](https://github.com/chaossss)、[Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成

“在 App 开发过程中尽可能使用 Fragment 替代 Activity”，Google 官方的这个建议无疑让万千 Android 开发者开始关注、使用 Fragment。但随着使用 Fragment 的人数增多，Fragment 存在的各种问题也开始暴露，在各种 Android 社区中，已经开始有人质疑用 Fragment 替代 Activity 在应用开发中是否真的像 Google 说的那样有益。质疑 Fragment 的理由大体如下：

- 在使用 Fragment 时，我们只能选择使用默认的构造方法，而不能自由地构造我们想要的构造方法。

- 嵌套使用 Fragment 很容易出现各种奇奇怪怪的 Bug，抑或是受到种种让人郁闷的限制。

- Fragment 自身的生命周期非常复杂。

更让人哭笑不得的是，让这部分开发者坚定地站在“反 Fragment”队伍中的原因竟然是：在开发过程中使用 Fragment 完全不能让这部分 Android 开发者感受到使用 Fragment 能给他们带来的便利和愉悦；相反，使用 Fragment 给他们带来的是无尽的困然和烦恼。真不知道 Google 看到这些批评 Fragment 的帖子会想什么…………

但在我们的 Android 学习社区 [Big Nerd Ranch](http://www.bignerdranch.com/) 中，我们制作的 [Android bootcamp](https://training.bignerdranch.com/classes/android-bootcamp) 课程一直坚持使用 Fragment ，并且为大家介绍 Fragment 给我们带来的种种便利和好处（特别是 Android 开发的新手），此外，我们还在我们做的 [资讯项目](http://www.bignerdranch.com/we-develop) 中广泛地使用了 Fragment。

然而，虽然我们是 Fragment 的忠实粉丝，但本着不断学习和探索新知识的心态，我们还是对现有的 Android 库进行了相当多的研究和探索，以求能够找到 Fragment 的最佳替代物，帮助这些备受煎熬的 Android 开发者早日脱离苦海，走向 Android 开发的美丽新世界。

## 进入Flow和Mortar 
奉行着想毁灭世界上所有 Fragment 的信条，Square 大概在一年前介绍了两个全新的库： Flow 和 Mortar。作为反 Fragment 教主，Square 还创造了许多很好的库：

*	[Dagger](http://square.github.io/dagger/)
*	[Retrofit](http://square.github.io/retrofit/)
*	[Picasso](http://square.github.io/picasso/)
*	[Otto](http://square.github.io/otto/)
*	And so many [more](https://github.com/square)

我只想说，我相信他们，我认为任何来自Square的资源可能是有用的或者至少是有趣的，所以他们的项目都值得一看。

在我们深入了解这些库之前我想提醒大家的是，Square只在他们内部的一小部分项目中使用这些库，并且我在写本文章时这些库还在预发布阶段。也就是说，这两个库在最近几个月取得了积极的进展，这预示着一个值得尊敬的未来，虽然库就像流沙，随时可能改变，崩溃甚至停止发布，但库所依赖的核心架构原则是一成不变的。

##体系架构
 首先，我们先来看下 Android 应用的体系架构，在 Android  Honeycomb 被使用之前，甚至在Fragment 出现之前，开发 Android 应用的标准模式是创建许多 Activity。在那个时候最常见的现象是：大多数开发者都没有规范地遵循 MVC模式进行开发，不过这也很正常。因为模型(Model)依赖于数据，传统的一些数据库或者是以 JSON 的形式存储的 Web 请求，抑或是各种各样的java对象枚举。开发者们很高兴地通过 XML 布局去为 Activity 设置 View ，而且 View 的控制器就是每一个屏幕显示的 Actvitiy 自身。

虽然这只是一个简要的概述，但是你能从中了解到 Android 与 MVC 模式是如何自然契合的。
![mvc-pre](http://www.bignerdranch.com/img/blog/2015/02/mvc-pre.png)

随着 Fragment 在 Honeycomb 中的出现，Android 团队也让处理不同形式的事件变得更简单。到了今天，标准的 Android 应用架构已经转变为由一小部分的 Activity 和 许多 Fragment 构成，使得我们的 App 能够在 手机、平板、智能手表甚至是太空船上跨平台使用。
![mvc-post](http://www.bignerdranch.com/img/blog/2015/02/mvc-post.png)

在这样的愿景下，有关 Fragment 的一切都是美好的，Fragment 变得流行起来，将一个 Activity 分解为几个 Fragment 是被提倡的。除此以外，即使 Activity 常常被简化为 Fragment 的持有者，或者是 Fragment 和 系统之间的接口，Android 应用的架构仍然遵循着 MVC 模式。

但到底是 Activity 不能实现我们 App 跨平台使用的愿望，还是我们没有用正确的方式使用 Activity呢？也许，如果将 Activity 与 自定义 View结合在一起使用，说不定不需要 Fragment 就能让 Activity 实现跨平台使用的目标呢。使用 Flow 和 Mortar库背后的关键目的就是探索这个问题，并得到确切的答案。Flow 和 Mortar 的工作通过用自定义 View 代替 Fragment，并使用注入自定义 View 中的特定 Controller 对象，控制视图，以此允许我们通过 View 来代替 Fragment 完成工作。
![mvc-no-fragments](http://www.bignerdranch.com/img/blog/2015/02/mvc-no-fragments.png)

我们将在我们的讨论中构建这个图的中间部分，弄清楚如何在不使用 Fragment 的情况下把不同的视图碎片拼凑到一个 Activity 里。我们会看着标准MVC架构演变成完全不同的东西，这将大量涉及到咱们的Flow和Mortar。

那么，Flow和Mortar到底是什么？它们又是如何起作用的呢？

##Flow
Flow 将一个应用分成一个逻辑上的 Screen组合，Screen不是任何形式的特殊的库对象，而是一个被创造来代表我们应用视图的普通java对象（POJO）。每一个Screen是这个app里面自包含的段，他们有自己的功能和意图。一个Screen的用处和传统Activity的用处没有什么不同，应用程序中的每一个Screen都对应于一个特定的位置，有点像一个Android中的URL网页或者是特定的隐式Intent。所以，Screen类可以被看作是应用中某个部分自带的可读定义。

我们应用中的每一个Activity将会成为一个 Flow 对象，Flow对象在返回栈中保存了 Screen 的记录，和 Activity 或者 FragmentManager 的返回栈有些类似，通过这样的设计允许我们在 Screen 之间通过简单地实例化就可以轻松的切换，而不需要在应用中包含很多Activity。这里有一小部分 Activity（最好是一个）来持有这些 Screen。他们之间的关系下图类似：
![screen](http://www.bignerdranch.com/img/blog/2015/02/screen.png)

如果我们想切换到一个新的 Screen，我们只需简单地实例化这个 Screen，并且告诉我们 Flow 对象帮助我们切换为这个 Screen。除此以外，正如我们所期待的，Flow 被实例化后也会实现 goBack() 和 goUp() 方法。然而，许多开发者都把 Java 中的 goto 语句看作洪水猛兽，但事实上 Java 中的 goto 语句并没有它听起来那么恐怖。
![flow](http://www.bignerdranch.com/img/blog/2015/02/flow.png)

从本质上看，Flow 的作用仅仅是在 App 中告诉我们将要切换到哪一个 Screen。而这样设计的好处在于，Flow 通过这样的设计让我们能够方便地在我们定义的各种不同的自定义 View 中切换，并使我们免受在 Activity 或 Fragment 需要考虑的种种麻烦，让我们把注意力都集中在处理 View上。Flow 为我们创造了一个简单，方便，以 View 为中心的应用架构。

##Mortar
Mortar是一个专注拖拽和依赖注入的库，Mortar 用以下几个不同的部分将一个应用分为可组合的模块：Blueprints, Presenters and a boatload of custom Views。

Mortar App里的每一个部分（在这里指的是每一个 Screen，因为我们在使用 Flow）都由 Blueprint 定义，并赋予他们一个私有的 Dagger 模块。它看起来有点像是下面这样的

![blueprint](http://www.bignerdranch.com/img/blog/2015/02/blueprint.png)

Flow 和 Mortar 结合在一起使用的效果很好，我们只需要调节我们的 Screen 类实现去 Mortar 提供的 Blueprint 接口，然后它就会给我们一个可以自由使用的 Dagger 作用域。

![presenters](http://www.bignerdranch.com/img/blog/2015/02/presenters.png)

Presenter 是一个拥有简单生命周期和伴随其生命周期的 Bundle 的 View 私有对象，主要被用作该 View 的控制器。每一个 View 都有存在于对应的 Screen （还有 Blueprint）中，与 View 自身相关联的 Presenter。因为 Presenter 只能作用于他所在的 Screen，所以当我们使用 Flow 进入一个新的 Screen，Presenter（在我们这个架构中非常重要的一环） 很可能会被 Java 的垃圾回收机制自动回收掉。此外，在 Mortar 作用域中的 Dagger 将与自动垃圾回收机制结合在一起，使得我们 App 能更好的管理、使用其内存——其中原因当然是：当前没有被使用的控制器对象都被我们回收掉了。而在传统的 Activity 开发中，Fragment 和 Activity 的切换过程中，不经意的垃圾回收并不能很好的被注意和提防。

由于自定义 View 在我们的架构中被频繁地使用，以至于我们只需要通过 Dagger 简单地注入所有重要的模型数据，然后使用与 View 关联的 Presenter 去控制 View 本身。即使配置被改变，Presenters 也不会消失，而且我们还非常了解与 Activity 生命周期相关的知识，使得 Presenters 在进程被杀死之后还能被恢复。事实上，Presenter 与 Activity onSavedInstanceState() 方法的 bundle 钩连在一起，使得它能够用与 Activity 相同的机制储存和读取配置改变后产生的数据。而 Presenter 的生命周期非常简单，只有四个回调方法：

- onEnterScope(MortarScope scope)
- onLoad(Bundle savedInstanceState)
- onSave(Bundle outState)
- onExitScope()

完全没有 Fragment 那样复杂的生命周期，这可不是我吹的！

文章写到这里，你会发现在 Flow 和 Mortar 中有许多发生改变的部分，新的术语和类，还有新的使用规范，这难免会让人一头雾水。所以为了方便大家的理解，总的来说，我们需要重视的是下面几个部分：

- Screen: 在应用导航层次结构中的一个特殊存在，用来代表我们视图的对象
- Blueprint: 应用中具有私有的 Dagger 模块的部分
- Presenter: 一个 View 控制器对象
- Custom Views: 通过 Java 代码定义的 View，当然，用 XML 定义也是很常见的

Here’s what our final Mortar and Flow architecture looks like:

我们 Mortar 和 Flow 整个体系架构将会如下所示：

![](https://www.bignerdranch.com/img/blog/2015/02/mortar-and-flow.png)

抛弃了对 MVC 模式的执念，这个架构在完成之后变得更像 MVP 模式。这样巨大的转变使得新的架构需要关注如何处理应用在运行时配置信息改变的问题，例如：旋转。在 MVC 模式中，我们的控制器（Activity 和 Fragment）会随着我们的 View 一起被杀死。然而，在 MVP 模式中，我们只有 View 
被杀死，又在需要它的时候重现它。挺有趣的对吧？

![](https://www.bignerdranch.com/img/blog/2015/02/mvp.png)

## 积极的反馈 

为了摆脱 Fragment，Square 付出了无数的汗水去进行重新架构和设计，并完成了 Mortar 和 Flow库，他们当然会获得相应的回报，接下来我就给大家介绍这两个库给我们带来的好处吧。

使用 Mortar 和 Flow 库强迫我们创建了一个符合 MVP 模式设计的模块化 App 结构，通过这样做能有效地帮助我们保持代码的整洁。

通过对我们自定义 View 和 Presenters 的依赖注入，测试变得更简单了

动画能够在 View 层被处理，而不用像从前在 Activity 和 Fragment 中使用时那样担心动画会出现Bug

Mortar 在 View 和 Presenter 层中自动进行垃圾回收以处理其作用域，意味着应用能更有效地利用内存

## 可优化的空间 
尽管 Flow 和 Mortar 给我们带来了许多好处，但是它们也还存在一些问题：

**想要熟练使用 Flow 和 Mortar，需要面对一条陡峭的学习曲线。**在你真正理解这两个库的设计思想和原理之前，它们的使用模式看起来非常复杂，如果你想要将他们用的得心应手，无疑需要大量的探索和实验，此外，这些库并不是为初学者提供的，我们更建议初学者先学习如何正确和有效地使用 Activity 和 Fragment，我可不是吓唬你们，这样跟你们说吧，就算是 Android 开发大神，在面对这些库时仍需要花费大量的精力和时间去学习有关设计模式的知识，才能真正理解这个库。

**如果你正准备使用 Mortar 和 Flow 库，你真的要全面了解它们的用法。**因为让它和标准的“少使用 Fragment”开发模式相互作用是很困难的。如果你想修改一个已经写好的项目，让它使用 Mortar 和 Flow，虽然不是不可能的，但是完成这个目标的过程会是非常漫长和艰难的。

**这里还存在无数的模板和配置信息需要被处理。**而这正是我最大的担忧，在使用这些新的类和接口时，我常常觉得被淹没在无趣的代码海洋里，因为这些代码都被设计成和其中的各个类、接口钩连在一起，而这也的设计让我觉得这两个库并没有像我期待的那样有趣。

## 接下来呢 
不过现在 Mortar 和 Flow 库都处于预发布阶段，现在也没有官方发布的版本。这意味着 Square 还在处理这两个库存在的问题，改动和更新，但这同样也意味着它们还需要许多时间作改进，才能真正投入到使用中。

使用 Mortar 和 Flow 库是个有趣的体验，我非常享受使用各种新的库和寻找官方以 Fragment 为导向的应用结构的替代品，但我并不认为 Mortar 和 Flow 是 Android 寻找的替代 Fragment 的办法，毕竟 Fragment 可能在接下来的几个月或者几年中被修改。但我仍然希望这些项目能够引起更多人关注，并且继续优化，我肯定会继续关注他们的最新进展的，希望大家继续关注我的博客哦。
