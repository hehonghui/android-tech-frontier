Flow和Mortar的调查
---
>
* 原文链接 : [Architecting An Investigation into Flow and Mortar](http://www.bignerdranch.com/blog/an-investigation-into-flow-and-mortar/)
* 译者 : [sundroid](https://www.github.com/sundroid)

Fragment在android社区已经开始有负面名声，即便是官方支持的Google的android团队也对此颇有微词，这里有如下几个主要原因：
* 我们必须完全依赖默认构造函数，而不是自定义的。
* 嵌套的Fragment很容易产生bug和局限性。
* Fragment的生命周期很复杂。

但是可能最重要的是，android开发者不是很乐意使用Fragment，更多的是把它看做一种阻碍而不是帮助。

在牧场，我们在android训练营教学时，使用Fragment是一个正确的方式，尤其对于初学者，与此同时我们使用Fragment广泛的在我们的咨询项目中。
然而，我们鼓励不断探索和不断学习的心态，所以我开始调查最受欢迎的Fragment。

##进入流和砂浆
大概一年前，Square介绍两个新的库，一个叫Flow，另一个叫Mortar。为了永远消灭android世界的Fragment，Square在开源社区久负盛名，已经建立一些令人赞不绝口的库：
*	[Dagger](http://square.github.io/dagger/)
*	[Retrofit](http://square.github.io/retrofit/)
*	[Picasso](http://square.github.io/picasso/)
*	[Otto](http://square.github.io/otto/)
*	And so many [more](https://github.com/square)

我只想说，我相信他们，我认为任何来自Square的资源可能是有用的或者至少是有趣的，所以值得一看他们的项目。

我应该注意之前在Square使用的这些库只在一些内部项目，并且他们在写本文章时还在预发布阶段，也就是说，这两个库在最近几个月已经取得积极的发展，这预示着一个值得尊敬的未来，虽然库是流沙，随时可能改变，破裂甚至死亡，这个所依赖核心的架构原则应该是一成不变的。

##体系架构
 首先，我们先来看下android应用的体系架构，在android  Honeycomb之前的这些日子里，甚至在Fragment出现之前，开发android应用的标准模式是创建许多Activity，传统的，大多数开发者不是很规范的遵循着MVC模式，这也很说得通。模型依赖数据，传统上一些数据库或者一个存储数据格式是Json的web请求，或者任何java对象的各种枚举，开发者们很高兴的通过XML布局去在Activity中实现View，并且这个控制器是和Activity在应用的每个屏幕下是相关的。
这是一个简要的概述，但是你能够看到android如何通过默认的方式去适用于MVC。
![mvc-pre](http://www.bignerdranch.com/img/blog/2015/02/mvc-pre.png)

随着在Honeycomb中出现Fragment，android团队让处理不同因素变得简单。现在，标准的体系架构变成几个Activity和很多的Fragment，所以我们的app可能变得在手机，平板电脑，手表和宇宙飞船中变的跨平台。
![mvc-post](http://www.bignerdranch.com/img/blog/2015/02/mvc-post.png)

与此同时，这似乎是一个福音，Fragment变得流行起来，并且分解一个Activity为几个Fragment是很好的，再者，架构仍然遵循MVC，虽然Fragment经常被减少到Fragment持有者，Fragment和操作系统之间的接口。
但是如果Activity不适当给予一个机会，也许，如果在自定义View中被结合使用，Activity确实不需要通过Fragment来构建一个跨平台的模块化的应用。这个使用Flow和Mortar的背后核心想法就是去探索这个问题。Flow和Mortar的工作是通过自定义View来替换Fragment，配上专用和注射控制器对象，所以我们可以通过View来替换Fragment去完成我们的工作。
![mvc-no-fragments](http://www.bignerdranch.com/img/blog/2015/02/mvc-no-fragments.png)

我们将在我们的讨论中构建这个图的中间部分，弄清楚如何在没有Fragment下去解决这个世界上的难题，我们会看着从标准MVC架构演变成完全不同的东西，这将大量涉及到咱们的Flow和Mortar。

Flow和Mortar，到底是什么？以及它们是如何起作用的？

##Flow
Flow将一个应用分成一个逻辑Screen的组合，Screen没有任何特殊的库对象，而是一个普通java对象（POJO），我们用来创造代表我们应用的部分。每一个Screen是这个app里面自包含的段，他们有自己的功能和意图。一个Screen的用处和传统Activity的用处没有什么不同。应用程序中的每一个Screen对应于一个特定位置，有点像一个android中URL网页或特定的隐式Intent。所以，Screen类作为一个应用中某个部分的自包含可读定义。

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






