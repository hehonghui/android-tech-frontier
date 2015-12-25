Android 进行单元测试难在哪-终
---

> * 原文链接 : [WHAT I’VE LEARNED FROM TRYING TO MAKE AN ANDROID APP UNIT TESTABLE](http://www.philosophicalhacker.com/2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 :  完成




在前面的博文中，我给大家介绍并展示了要怎么使用 Square 大法架构 Android 应用，事实上，Square 开发新的 Android 应用架构本意只是增强应用的可测试性。正如我在[Android 进行单元测试难在哪-序](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-8/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-%E5%BA%8F.md)中所说，要在 Android 中进行单元测试在大多数情况下都很费时，尝试一些奇技淫巧或者第三方库情况可能会好一些。为了实现高效且不依赖第三方库的测试单元，Square 大法应运而生。

此外，我们在[ Android 进行单元测试难在哪-part1](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-9/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part1.md)和[ Android 进行单元测试难在哪-part3](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-11/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part3.md)两篇博文就这个问题进行了研究，最后成功地通过 Square 大法为 Android 应用实现了测试单元，这篇文章则是对 Square 大法进行评估，我将从下面三个方面进行：

1. 为 Android 应用实现高效的测试单元并不需要移除所有对 Android SDK 的编译时依赖。（事实上这样做有些不切实际。）

2. 加入我们重新设计 Square 大法，使 Square 大法的使用不需要移除所有对 Android SDK 的编译时依赖，尝试将 Square 大法运营到项目中唯一会发生的问题是：实现一大堆模板代码。幸运的是，许多诸如此类的模板代码都可以通过 Android Studio 自动生成。

3. 依赖注入确实是让 Square 大法成为应用可测试性治病良方的好办法。

##移除所有对 Android SDK 的编译时依赖既不必要也不切合实际

完成这个系列博文的最初愿望就是通过让 Android 应用栈变成下图那样，增强应用的可测试性：

![](http://i2.wp.com/www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-02.png?resize=279%2C172)

接下来我将告诉大家，这个想法一直误导着我们。要使应用的可测试性增强，我们还需要利用依赖注入的其它特性，而不仅仅是用它将业务逻辑代码和 Android SDK 解耦。最初的原因是对象的 Android 依赖可以通过类似 Mockito 的东西模拟出来，而且如果我们无法单独通过 Mocktio 完全控制测试单元的预测试状态的话，我们还可以用具有 mock 实现的接口代替这些 Android 依赖。而这也正是我们在[ Android 进行单元测试难在哪-part4](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-12/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part4.md)中重构 SessionRepositoryManager 的办法。

移除依赖不仅是不必要的，将它完全与 Android SDK 解耦也是不切实际的，问题在于：当你尝试完成这个目标时，不妨回顾你已经完成的工作，你会很明显地感觉这是不必要的，所以我只打算在此简要地陈述个中因由。

要移除移除应用中所有对 Android SDK 的编译时依赖可能会导致下面的问题：

1. 应用必须为此定义许多方法和类。

2. 添加的接口和已有的 Android 接口几乎一样。

3. 由于有些情况下，对象需要被注入；有些情况下，对象不需要被注入，带有依赖的类构造器会因此变得很臃肿。

虽然 Square 大法存在一些问题，但这并不影响我在之前的博文中有关 Square 的讲解，Square 的这些特性依旧是实用，值得尝试的。由于 Android SDK 供予我们使用的应用组件类都没有被依赖注入，我们要在 Android 应用中进行单元测试确实很困难，但有了 Square 大法后，只要我们将业务逻辑交给被依赖注入的纯 Java 对象，就能轻易地对 Android 应用进行单元测试。尽管 Square 大法减小了移除 Android SDK 依赖的需求，但 Square 大法仍然是增强应用可测试性的屠龙宝刀。但我个人还是希望对 Square 大法进行优化，使得 Square 大法能无视这个需求，换句话说，我希望能够找到一种不需要我们移除所有对 Android SDK 依赖的架构方法，

##乏味的模板代码是阻碍应用变得可测试的绊脚石

如果我们对 Square 大法进行优化，使其不再要求我们移除对 Android SDK的依赖，Square 大法看起来真的是天下第一的神功了。委以业务逻辑的纯 Java 对象将被应用组件类引用，使它们能够访问所有组件类内的属性和回调。因此，将业务逻辑转移到进行了依赖注入的纯 Java 对象，不应该将那些拥有履行自身职责的数据的对象排除在外。

如果这是正确的，那么唯一阻止我们使用 Square 大法的就是实现乏味的模板代码。幸运的是，Android Studio 为我们提供了过渡到 Square 大法的重构选项——the Extract Delegate option。利用这个选项，可以自动地将类的方法和实例变量转移到一个委托类中，并让原始类通过调用委托类处理逻辑，而不用依赖类自身的方法。

这个[视频](www.youtube.com/embed/N0F7w4wEnQ8)向我们展示了如何利用 `the Extract Delegate option` 完成重构 SessionDetailActivity 的 onStop() 并使之能够进行单元测试必要的操作。我曾在之前的博文中给大家解释过进行这样的重构为什么是必要的，很显然，手动操作无法涵盖所有情况，而且你需要为此不断重复实现代码语句块中分离 Activity View 和数据的方法，这样重复而又没有意义的工作无异于浪费生命，因此这个选项真的非常实用。

##依赖注入是 Square 大法的精髓

[Android 进行单元测试难在哪-part3](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-11/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part3.md)的秘密在于：**依赖注入**。

— Chris Arriola (@arriolachris) [May 15, 2015](https://twitter.com/arriolachris/status/599232312492982273)

Square 大法之所以能解决 Android 的单元测试问题，是因为它允许我们对持有业务逻辑的类进行真正的依赖注入，我之所以强调 Square 允许我们进行的是**真正的**依赖注入，是因为依赖注入这个概念在 Dagger 库中也被提到过，然而，Dagger 并不能真正简化 Android 应用进行单元测试的代码。

这是因为 Dagger 就像它介绍的那样，确实是一个 Service 定位库，正是如此，Dagger 强迫我们实现一个模块，使之为我们想要进行单元测试的对象提供 mock 依赖。为了能利用这些模块，我们还要确保由这些 mock 提供者模块构建的对象图与我们尝试进行单元测试的对象使用的对象图相同。

而正是这样的操作使得 Dagger 的依赖注入不如 Square 大法中真正的依赖注入那样简便，解释为什么 Dagger 不能简化对 Android 应用进行单元测试的过程完全可以写一篇博文，所以现在，我唯一能做的就是先指出这个问题，如果我们理解[ Martin Fowler 对依赖注入的定义](http://martinfowler.com/articles/injection.html#InversionOfControl)（这篇博文确实值得一读，因为他创建了一个新的术语），就会发现 Dagger 确实只是一个 Service 定位库，而且 Google 官方有关测试的博客也有[一篇博文](http://martinfowler.com/articles/injection.html#InversionOfControl)对此作出解释。

##结论

如果想让 Android 应用可以进行单元测试，那就用 Square 大法吧，当然了，如果有其他解决办法的话我也会支持的。在这里友情提示一下哈：我只是列出我了解的几种办法，我可没有说 Square 大法天下第一无人可敌，事实上增强应用可测试性应该还会有其他办法的。

这篇博文的发布也预示着这系列博文走向终结啦，我非常感谢每一个关注本系列博文的 Android 开发者的支持，感谢每一个人对我的鼓励、转发以及大家在社交媒体上对我的褒奖，我感恩这一切。这些积极的反馈使我认识到讨论和思考对 Android 应用进行测试的重要性，正是完成这个系列博文给我带来的启示使我决定：我要在未来花费更多的时间在博客中研究 Android 测试方面的知识。我会在每个周五更新博客，希望能学习更多有关测试的知识，和大家一起进步。