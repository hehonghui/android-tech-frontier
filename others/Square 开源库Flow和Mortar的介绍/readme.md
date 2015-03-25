Flow和Mortar的调查
---
>
* 原文链接 : [Architecting An Investigation into Flow and Mortar](http://www.bignerdranch.com/blog/an-investigation-into-flow-and-mortar/)
* 译者 : [sundroid](https://www.github.com/sundroid)

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

我们应用中每一个Activity将会成为一个“Flow”对象，Flow对象在返回栈中包含了Screen的记录，和Activity的堆栈或者FragmentManager的有点类似，允许我们在Screen之间通过简单地实例化就可以轻松的切换。而不是应用中包含很多Activity，这里很小数量（理想上是一个）Activity来包含许多屏幕。看起来就像：
![screen](http://www.bignerdranch.com/img/blog/2015/02/screen.png)

我们我们想去一个新的屏幕，我们仅需简单实例化这个屏幕就可以了，并且告诉我们Flow对象怎么到这里。Flow里面的goBack()和goUp()方法，将会如你所期待的的那样表现，同时java中的goto语句的方式可能会被借鉴使用，它并没有特别糟糕。
![flow](http://www.bignerdranch.com/img/blog/2015/02/flow.png)

在本质上，在我们的应用程序里使用Flow，好处是让我们通过一个简单地方式就可以在不同自定义View下面导航，让我们不用担心Activity或者Fragment，我们仅仅处理View，它创造一个简单，干净，以View为中心的世界。

##Mortar
Mortar是一个专注拖拽和依赖注入的库，Mortar将一个应用通过不同的部分分为可组合的部分。Blueprints,Presenters和许多自定义View。每一个Moortar应用通过Blueprint定义，这是一个考虑其个人的Dragger模块。有点像这样结束：
![blueprint](http://www.bignerdranch.com/img/blog/2015/02/blueprint.png)

Flow和Mortar结合在一起效果很好，我们只需要调节我们的Screen类实现Mortar提供的Blueprint接口，它给我们一个免费的Dagger范围。

![presenters](http://www.bignerdranch.com/img/blog/2015/02/presenters.png)






