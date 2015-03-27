Flow和Mortar的调查
---
>
* 原文链接 : [Architecting An Investigation into Flow and Mortar](http://www.bignerdranch.com/blog/an-investigation-into-flow-and-mortar/)
* 译者 : [sundroid](https://github.com/sundroid)( [chaossss](https://github.com/chaossss) 协同翻译)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成

Fragments have started to garner a negative reputation in the Android community, despite being officially supported by the Android team at Google, and there are a host of reasons why:

- We have to rely solely on [default constructors](http://developer.android.com/reference/android/app/Fragment.html), rather than custom constructors.

- Nested Fragments are prone to [bugs](http://blog.shamanland.com/2014/01/nested-fragments-for-result.html) and [limitations](http://developer.android.com/about/versions/android-4.2.html#NestedFragments).

- The Fragment lifecycle is [complex](http://staticfree.info/~steve/complete_android_fragment_lifecycle.png).

“在 App 开发过程中尽可能使用 Fragment 替代 Activity”，Google 官方的这个建议无疑让万千 Android 开发者开始关注 Fragment，使用 Fragment 。但随着使用 Fragment 的人数增多，Fragment 存在的各种问题也开始暴露，在各种 Android 社区中，已经开始有人质疑用 Fragment 替代 Activity 在应用开发中是否真的像 Google 说的那样有益。质疑 Fragment 的理由大体如下：

- 在使用 Fragment 时，我们只能选择使用默认的构造方法，而不能自由地构造我们想要的构造方法。

- 嵌套使用 Fragment 很容易出现各种奇奇怪怪的 Bug，抑或是受到种种让人郁闷的限制。

- Fragment 自身的生命周期非常复杂。

But perhaps most importantly, Android developers simply don’t seem to enjoy using Fragments, viewing them more as a hindrance than as a help.

更让人哭笑不得的是，让这部分开发者坚定地站在“反 Fragment”队伍中的原因竟然是：在开发过程中使用 Fragment 完全不能让这部分 Android 开发者感受到使用 Fragment 能给他们带来的便利，和愉悦；相反，使用 Fragment 给他们带来的是无尽的困然和烦恼。真不知道 Google 看到这些批评 Fragment 的帖子会想什么…………

Here on the Ranch, we teach in our [Android bootcamp](https://training.bignerdranch.com/classes/android-bootcamp) that using Fragments is the right way to go (especially for beginners), and we also use Fragments extensively on all of our [consulting projects](http://www.bignerdranch.com/we-develop).

但在我们的 Android 学习社区 [Big Nerd Ranch](http://www.bignerdranch.com/) 中，我们制作的 [Android bootcamp](https://training.bignerdranch.com/classes/android-bootcamp) 课程一直坚持使用 Fragment ，并且为大家介绍 Fragment 给我们带来的种种便利和好处（特别是 Android 开发的新手），此外，我们还在我们做的 [资讯项目](http://www.bignerdranch.com/we-develop) 中广泛地使用了 Fragment。

However, we encourage a mindset of constant exploration and continual learning, so I began investigating the most popular alternatives to Fragments.

然而，虽然我们是 Fragment 的忠实粉丝，但本着不断学习和探索新知识的心态，我们还是对现有的 Android 库进行了相当多的研究和探索，以求能够找到 Fragment 的最佳替代物，帮助这些备受煎熬的 Android 开发者早日脱离苦海，走向 Android 开发的美丽新世界。

## Enter Flow and Mortar ##

About a year ago, Square introduced two new libraries called Flow and Mortar, with the noble goal of ridding the Android world of Fragments forever. Square has a stellar reputation in the open-source community, having built such amazing libraries as:

- [Dagger](http://square.github.io/dagger/)
- [Retrofit](http://square.github.io/retrofit/)
- [Picasso](http://square.github.io/picasso/)
- [Otto](http://square.github.io/otto/)
- And so many [more](https://github.com/square)


## 进入Flow和Mortar ##
奉行着想灭世界上所有 Fragment 的信条，Square 大概在一年前介绍了两个全新的库： Flow 和 Mortar。作为反 Fragment 教主，Square 还创造了许多很好的库：

*	[Dagger](http://square.github.io/dagger/)
*	[Retrofit](http://square.github.io/retrofit/)
*	[Picasso](http://square.github.io/picasso/)
*	[Otto](http://square.github.io/otto/)
*	And so many [more](https://github.com/square)

Suffice it to say, I trust them. I figure that any resource from Square is probably useful (or, at the very least, interesting), so it’s worth giving it a look.

我只想说，我相信他们，我认为任何来自Square的资源可能是有用的或者至少是有趣的，所以他们的项目都值得一看。

I should note before diving in that Square uses these libraries only on a few internal projects, and they’re still in pre-release stages as of this writing. That said, both libraries have seen active development in recent months, which bodes well for their respective futures. While the libraries might be shifting sands that could change, break or die at any moment, the core architectural principles underlying them should remain constant.

在我们深入了解这些库之前我想提醒大家的是，Square 只在他们内部的一小部分项目中使用这些库，并且我在写本文章时这些库还在预发布阶段。也就是说，这两个库在最近几个月取得了积极的进展，这预示着一个值得尊敬的未来，虽然库就像流沙，随时可能改变，崩溃甚至停止发布，但库所依赖的核心架构原则是一成不变的。

## Architecture ##

First, let’s go over architecture in Android applications. In the days before Android Honeycomb, before Fragments even existed, the standard pattern for creating Android apps was to create a bunch of Activities. Typically, most developers loosely followed a Model-View-Controller paradigm, which made a lot of sense. The model was the underlying data, typically some database or maybe a web request stored as JSON, or any various enumerations of Java objects. The View would happily be the XML layouts that the developer would craft for each Activity, and the Controller was the Activity associated with each screen of the application.

This is a simplistic overview, but you can see how Android fits into MVC by default.

##体系架构

 首先，我们先来看下 Android 应用的体系架构，在 Android  Honeycomb 被使用之前，甚至在Fragment 出现之前，开发 Android 应用的标准模式是创建许多 Activity。在那个时候最常见的现象是：大多数开发者都没有规范地遵循 MVC 模式进行开发，不过这也很正常。因为模型依赖于数据，传统的一些数据库或者是以 JSON 的形式存储的 Web 请求，抑或是各种各样的java对象枚举。开发者们很高兴地通过 XML 布局去为 Activity 设置 View ，而且 View 的控制器就是每一个屏幕显示的 Actvitiy 自身。

虽然这只是一个简要的概述，但是你能从中了解到 Android 与 MVC 模式是如何自然契合的。
![mvc-pre](http://www.bignerdranch.com/img/blog/2015/02/mvc-pre.png)

With the advent of Fragments in Honeycomb, the Android team made it easier to deal with different form factors. Now, the standard architecture became a few Activities and a bunch of composed Fragments, so that all of our apps would be cross-platform between phones, tablets, watches or spaceships.

随着 Fragment 在 Honeycomb 中的出现，Android 团队也让处理不同形式的事件变得更简单。到了今天，标准的 Android 应用架构已经转变为由一小部分的 Activity 和 许多 Fragment 构成，使得我们的 App 能够在 手机、平板、智能手表甚至是太空船上跨平台使用。
![mvc-post](http://www.bignerdranch.com/img/blog/2015/02/mvc-post.png)

At the time, this seemed like a boon. Fragments were all the rage, and decomposing an Activity into multiple fragments was great. Plus, the architecture still adheres to MVC, though Activities were often reduced to merely being Fragment holders and the interface between Fragments and the OS.

在这样的愿景下，有关 Fragment 的一切都是美好的，Fragment 变得流行起来，将一个 Activity 分解为几个 Fragment 是被提倡的。除此以外，即使 Activity 常常被简化为 Fragment 的持有者，或者是 Fragment 和 系统之间的接口，Android 应用的架构仍然遵循着 MVC 模式。

But what if Activities weren’t properly given a chance? Maybe, if used in conjunction with custom Views, Activities don’t actually need the support of Fragments to create cross-platform modular apps. The core idea behind using Flow and Mortar is to explore this question. Flow and Mortar work by replacing our Fragments with custom Views paired with dedicated and injected controller objects, so we can work solely with Views instead of Fragments.

但到底是 Activity 不能实现我们 App 跨平台使用的愿望，还是我们没有用正确的方式使用 Activity呢？也许，如果将 Activity 与 自定义 View结合在一起使用，说不定不需要 Fragment 就能让 Activity 实现跨平台使用的目标呢。使用 Flow 和 Mortar库背后的关键目的就是探索这个问题，并得到确切的答案。Flow 和 Mortar 的工作通过用自定义 View 代替 Fragment，并使用注入自定义 View 中的特定 Controller 对象，控制视图，以此允许我们通过 View 来代替 Fragment 完成工作。
![mvc-no-fragments](http://www.bignerdranch.com/img/blog/2015/02/mvc-no-fragments.png)

We’ll be constructing the middle portion of this diagram over the course of our discussion, figuring out where to put different pieces of the puzzle in a world without Fragments. We’ll watch as the architecture evolves from standard MVC into something altogether different, which (spoiler alert) will heavily involve Flow and Mortar.

So, what, exactly are Flow and Mortar, and how can they help?

我们将在我们的讨论中构建这个图的中间部分，弄清楚如何在不使用 Fragment 的情况下把不同的视图碎片拼凑到一个 Activity 里。我们会看着标准MVC架构演变成完全不同的东西，这将大量涉及到咱们的Flow和Mortar。

那么，Flow和Mortar到底是什么？它们又是如何起作用的呢？

## Flow ##

Flow divides an application into a logical collection of “Screens.” Screens are not any sort of special library object, but rather a plain old Java object (POJO) that we create to represent sections of our application. Each Screen is a self-contained segment of the app, with its own function and purpose. A Screen’s usage isn’t so different from the typical Activity’s usage. Each Screen corresponds to a particular location in the app, sort of like a URL to a webpage or a really specific Implicit Intent in Android. Thus, the Screen class serves as a self-contained readable definition of a section of the application.

##Flow

Flow 将一个应用分成一个逻辑上的 Screen 组合，Screen 不是任何形式的特殊的库对象，而是一个被创造来代表我们应用视图的普通java对象（POJO）。每一个Screen是这个app里面自包含的段，他们有自己的功能和意图。一个Screen的用处和传统Activity的用处没有什么不同，应用程序中的每一个Screen都对应于一个特定的位置，有点像一个 Android 中的 URL 网页或者是特定的隐式 Intent。所以，Screen类可以被看作是应用中某个部分自带的可读定义。

Each Activity in our application will own a “Flow” object. The Flow object holds the history of Screens in a backstack, similar to the Activity backstack or the FragmentManager’s backstack of Fragments, allowing us to navigate between Screens by simply instantiating where we want to go. Instead of an application having a bunch of Activities, there exists a small number (ideally one) Activity that hosts multiple Screens. It looks something like this:

我们应用中的每一个Activity将会成为一个 Flow 对象，Flow对象在返回栈中保存了 Screen 的记录，和 Activity 或者 FragmentManager 的返回栈有些类似，通过这样的设计允许我们在 Screen 之间通过简单地实例化就可以轻松的切换，而不需要在应用中包含很多Activity。这里有一小部分 Activity（最好是一个）来持有这些 Screen。他们之间的关系下图类似：
![screen](http://www.bignerdranch.com/img/blog/2015/02/screen.png)

If we want to go to a new Screen, we simply instantiate it and tell our Flow object to take us there. In addition, Flow comes with goBack() and goUp() methods, which behave as expected. While the introduction of goto statements in Java might scare some folk, it’s not so terribly evil.

我们我们想切换到一个新的 Screen，我们只需简单地实例化这个 Screen，并且告诉我们 Flow 对象帮助我们切换为这个 Screen。除此以外，正如我们所期待的，Flow 被实例化后也会实现 goBack() 和 goUp() 方法。然而，许多开发者都把 Java 中的 goto 语句看作洪水猛兽，但事实上 Java 中的 goto 语句并没有它听起来那么恐怖。
![flow](http://www.bignerdranch.com/img/blog/2015/02/flow.png)

In essence, Flow tells us where to go in our app. The advantage of using Flow is that it gives us a simple way to navigate around various custom Views that we’ve defined (i.e., Screens), freeing us to not worry about Activities or Fragments—we deal solely with Views. It creates a simpler, cleaner, View-centric world.

从本质上看，Flow 的作用仅仅是在 App 中告诉我们将要切换到哪一个 Screen。而这样设计的好处在于，Flow 通过这样的设计让我们能够方便地在我们定义的各种不同的自定义 View 中切换，并使我们免受在 Activity 或 Fragment 需要考虑的种种麻烦，让我们把注意力都集中在处理 View上。Flow 为我们创造了一个简单，方便，以 View 为中心的应用架构。

## Mortar ##

Mortar is a library focused around Dagger and its associated dependency injection. Mortar divides an application into composable modules using a few distinct parts: Blueprints, Presenters and a boatload of custom Views.

##Mortar
Mortar是一个专注拖拽和依赖注入的库，Mortar 用以下几个不同的部分将一个应用分为可组合的模块：Blueprints, Presenters and a boatload of custom Views。

Each section of a Mortar app (that is, each Screen, since we’re also using Flow) is defined by a Blueprint, which is given its own personal Dagger module. It ends up looking a bit like this:

Mortar App里的每一个部分（在这里指的是每一个 Screen，因为我们在使用 Flow）都由 Blueprint 定义，并赋予他们一个私有的 Dagger 模块。它看起来有点像是下面这样的

![blueprint](http://www.bignerdranch.com/img/blog/2015/02/blueprint.png)

Flow and Mortar play well together. All we have to do is adjust our Screen class to also implement the Blueprint interface (provided by Mortar), and it gives us the Dagger scoping for free.

Flow 和 Mortar 结合在一起使用的效果很好，我们只需要调节我们的 Screen 类实现去 Mortar 提供的 Blueprint 接口，然后它就会给我们一个可以自由使用的 Dagger 作用域。

![presenters](http://www.bignerdranch.com/img/blog/2015/02/presenters.png)

The Presenter is a singleton object that functions as a view-controller with a simple lifecycle and persistence bundle. Each View has an associated Presenter, which lives inside the associated Screen (with a Blueprint). Since the Presenter is scoped to just the Screen that it lives in, the Presenter (our heavy-duty controller object) will be garbage collected if we go to a new Screen using Flow. The Dagger scoping of Mortar combined with automatic garbage collection allow our app to be more memory efficient, since any of our controller objects that aren’t currently being used are GC-ed away. In Activity-land, there are fewer guarantees of garbage collection when switching between Fragments and Activities.

Presenter 是一个拥有简单生命周期和伴随其生命周期的 Bundle 的 View 私有对象，主要被用作该 View 的控制器。每一个 View 都有存在于对应的 Screen （还有 Blueprint）中，与 View 自身相关联的 Presenter。因为 Presenter 只能作用于他所在的 Screen，所以当我们使用 Flow 进入一个新的 Screen，Presenter（在我们这个架构中非常重要的一环） 很可能会被 Java 的垃圾回收机制自动回收掉。此外，在 Mortar 作用域中的 Dagger 将与自动垃圾回收机制结合在一起，使得我们 App 能更好的管理、使用其内存——其中原因当然是：当前没有被使用的控制器对象都被我们回收掉了。而在传统的 Activity 开发中，Fragment 和 Activity 的切换过程中，不经意的垃圾回收并不能很好的被注意和提防。

Custom Views are used liberally so that we can simply inject all of the important model data through Dagger, and then use the associated Presenter to control the View itself. Presenters survive configuration changes, but have enough Activity lifecycle knowledge to be restored after process death. The Presenter actually hooks into the Activity’s onSavedInstanceState() bundle, using the same mechanism for saving and loading data on configuration change as an Activity would. The Presenter life cycle is a simple one with only four callbacks:

- onEnterScope(MortarScope scope)
- onLoad(Bundle savedInstanceState)
- onSave(Bundle outState)
- onExitScope()

由于自定义 View 在我们的架构中被频繁地使用，以至于我们只需要通过 Dagger 简单地注入所有重要的模型数据，然后使用与 View 关联的 Presenter 去控制 View 本身。即使配置被改变，Presenters 也不会消失，而且我们还非常了解与 Activity 生命周期相关的知识，使得 Presenters 在进程被杀死之后还能被恢复。事实上，Presenter 与 Activity onSavedInstanceState() 方法的 bundle 钩连在一起，使得它能够用与 Activity 相同的机制储存和读取配置改变后产生的数据。而 Presenter 的生命周期非常简单，只有四个回调方法：

- onEnterScope(MortarScope scope)
- onLoad(Bundle savedInstanceState)
- onSave(Bundle outState)
- onExitScope()

Not nearly as confusing a lifecycle as Fragments, if I do say so myself!

完全没有 Fragment 那样复杂的生命周期，这可不是我吹的！

There are a lot of moving parts and new terms and classes and all sorts of room for confusion. So in sum, we have the following pieces of the puzzle:

- Screen: A particular location in the application’s navigation hierarchy
- Blueprint: A section of an application with its own Dagger module
- Presenter: A View-controller object
- Custom Views: Views defined by Java and usually some XML

文章写到这里，你会发现我们提出了许多

Here’s what our final Mortar and Flow architecture looks like:

我们 Mortar 和 Flow 整个体系架构将会如下所示：

![](https://www.bignerdranch.com/img/blog/2015/02/mortar-and-flow.png)

Instead of sticking with Model View Controller, the architecture has morphed into more of a Model View Presenter style. The big difference concerns the handling of runtime configuration changes like rotation. In MVC, our Controller (Activities and Fragments) will be destroyed alongside our Views, whereas in MVP, only our View will be destroyed and recreated. Nifty.



![](https://www.bignerdranch.com/img/blog/2015/02/mvp.png)

## Positives ##

- With all of this work and redesign, there needs to be some payoff, so let’s talk about the good things.

- Using Mortar and Flow forces us to create a modular architecture with a Model View Presenter design, which is useful for maintaining a clean codebase.

- Testing becomes easier through the dependency injection of our custom views and Presenters.

- Animation can be dealt with on a View level, as opposed to worrying about Fragment and Activities as much.

- Mortar scoping means the application will be more memory efficient, with garbage collection occurring on the View and Presenter level automatically.

And, of course, we no longer have to worry about Fragments and their various quirks.

## 积极的反馈 ##

为了摆脱 Fragment，Square 付出了无数的汗水去进行重新架构和设计，并完成了 Mortar 和 Flow库，他们当然会获得相应的回报，接下来我就给大家介绍这两个库给我们带来的好处吧。

使用 Mortar 和 Flow 库强迫我们创建了一个符合 MVP 模式设计的模块化 App 结构，通过这样做能有效地帮助我们保持代码的整洁。

通过对我们自定义 View 和 Presenters 的依赖注入，测试变得更简单了

动画能够在 View 层被处理，而不用像从前在 Activity 和 Fragment 中使用时那样担心动画会出现Bug

Mortar 在 View 和 Presenter 层中自动进行垃圾回收以处理其作用域，意味着应用能更有效地利用内存

## Room for Improvement ##

Flow and Mortar do have some issues:

**There is a steep learning curve**. The patterns are complex and require a lot of exploration and experimentation before you can really understand them, and these libraries are certainly not for beginners. Even for an expert, there is a steep design pattern investment.

**If you’re going to use Mortar and Flow, you really have to go all the way with it**. It would be difficult to interplay “standard” Android with the Fragment-less Android style. If you want to convert an existing project to Mortar and Flow, the process, while certainly possible, will be long and arduous.

**There’s a mountain of boilerplate and configuration to deal with**. This is my biggest complaint. With all of these new classes and interfaces, I often felt like I was drowning in uninteresting code that was required solely to hook everything together, which just isn’t as much fun.

## 可优化的空间 ##

尽管 Flow 和 Mortar 给我们带来了许多好处，但是它们也还存在一些问题：

**想要熟练使用 Flow 和 Mortar，需要面对一条陡峭的学习曲线。**在你真正理解这两个库的设计思想和原理之前，它们的使用模式看起来非常复杂，如果你想要将他们用的得心应手，无疑需要大量的探索和实验，此外，这些库并不是为初学者提供的，我们更建议初学者先学习如何正确和有效地使用 Activity 和 Fragment，我可不是吓唬你们，这样跟你们说吧，就算是 Android 开发大神，在面对这些库时仍需要花费大量的精力和时间去学习有关设计模式的知识，才能真正理解这个库。

**如果你正准备使用 Mortar 和 Flow 库，你真的要全面了解它们的用法。**因为让它和标准的“少使用 Fragment”开发模式相互作用是很困难的。如果你想修改一个已经写好的项目，让它使用 Mortar 和 Flow，虽然不是不可能的，但是完成这个目标的过程会是非常漫长和艰难的。

**这里还存在无数的模板和配置信息需要被处理。**而这正是我最大的担忧，在使用这些新的类和接口时，我常常觉得被淹没在无趣的代码海洋里，因为这些代码都被设计成和其中的各个类、接口钩连在一起，而这也的设计让我觉得这两个库并没有像我期待的那样有趣。

## What’s next ##

Both Mortar and Flow are in the pre-release stages of their development, with no official release in sight. This means dealing with issues and changes and updates, with the libraries shifting from beneath us, but this also means there is plenty of time for improvement.

## 接下来呢 ##

不过现在 Mortar 和 Flow 库都处于预发布阶段，现在也没有官方发布的版本。这意味着 Square 还在处理这两个库存在的问题，改动和更新，但这同样也意味着它们还需要许多时间作改进，才能真正投入到使用中。

Working with Mortar and Flow was a fun experiment. I enjoyed trying out some new libraries and seeking alternatives to the standard Fragment-oriented architecture, but I don’t think Mortar and Flow are the solutions the Android world are seeking. That could change in a few months or years. I hope that these projects will garner more attention and love and continue to improve, and I’ll definitely be keeping an eye on them.

使用 Mortar 和 Flow 库是个有趣的体验，我非常享受使用各种新的库和寻找官方以 Fragment 为导向的应用结构的替代品，但我并不认为 Mortar 和 Flow 是 Android 寻找的替代 Fragment 的办法，毕竟 Fragment 可能在接下来的几个月或者几年中被修改。但我仍然希望这些项目能够引起更多人关注，并且继续优化，我肯定会继续关注他们的最新进展的，希望大家继续关注我的博客哦。