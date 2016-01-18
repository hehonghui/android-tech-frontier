Flux and Android
---

> * 原文链接 : [Flux and Android](http://armueller.github.io/android/2015/03/29/flux-and-android.html)
* 原文作者 : [Austin Mueller](http://armueller.github.io/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成 

##Motivation

互联网的浪潮让许多IT从业者走上创业的路，我就是其中一员。我最近加入了一个创业公司，并从零开始制作一个产品。过去我一直在做外包，所以很难有机会真正为一个应用实施某种架构或技术。但现在全权负责一个应用开发事务的机会就在我的手中，我对此很激动，也迫不及待要把我这些年通过不断的技术积累所完成的库以及架构模式应用到这个初生的应用之中。

去年的大部分时间我都在开发一个网页项目，而且没有太多的机会让自己保持学习Android方面的新技术。当时和我一起进行开发的团队用 [AngularJS](https://angularjs.org/) 进行开发，在项目的开发过程中，我们最看重的就是确保所有的代码模块能像乐高积木部件一样（低耦合，大量的依赖注入，只有在某种情况下才产生代码副作用）组装成最终的项目。这样写代码能极大程度让开发者在项目的迭代和需求更迭所带来的代码修改、重构中被解放，因此我想要保持这个习惯，并把这种编程思想应用到Android开发中。当然了，这肯定不容易，毕竟罗马不是一天就能建成的。

一番考量后，我决定从依赖注入入手，因为我知道不论是Java抑或是Android，依赖注入都有许多开源的库。但遗憾的是，依赖注入一直是我没有掌握得很好的知识点，所以我阅读了许多优秀的讨论：

- [DAGGER 2 - A New Type of dependency injection by Gregory Kick](https://www.youtube.com/watch?v=oK_XtfXPkqw)
- [The Future of Dependency Injection with Dagger 2 by Jake Wharton](https://www.parleys.com/tutorial/5471cdd1e4b065ebcfa1d557/)
- [Dagger: A Fast Dependency Injector for Android and Java by Jesse Wilson](http://www.infoq.com/presentations/Dagger)
- [Android App Anatomy by Eric Burke](http://www.infoq.com/presentations/Android-Design/)

而且读了一些优秀的博文：

- [Android Dependency Injection](http://blog.andresteingress.com/2014/08/31/android-dependency-injection/)
- [Blog List: Adding a Blog View Activity, Butterknife, and Dagger](http://www.pinnsg.com/blog-list-view-activity-butterknife-dagger/)
- [Dagger 2 has Components](https://publicobject.com/2014/11/15/dagger-2-has-components/)
- [Dependency injection on Android: Dagger (Part 1)](http://antonioleiva.com/dependency-injection-android-dagger-part-1/)
- [Dagger: dependency injection on Android (Part 2)](http://antonioleiva.com/dagger-android-part-2/)
- [Android Unit Test Idioms](http://tech.pristine.io/android-unit-test-idioms/)
- [Android Testing With Robolectric](http://www.peterfriese.de/android-testing-with-robolectric/)

最终我觉得 [Dagger 2](http://google.github.io/dagger/) 会是最切合我的开发思路的依赖注入库，后来我又看了一些相关信息，还用 [Butterknife](http://jakewharton.github.io/butterknife/) 来对 View 进行注入。但现在最大的问题是，我找不到 Dagger 2 各方面相关的最佳用例（可能是 Dagger 2 还处于 Beta 版本的原因）。不过我还是找到了一丢丢的，虽说他们大部分都关注于如何将 Dagger 2 应用到项目中，而不是怎么在实际的 Android 应用被运用。

这些是我找到的一些用例：

- [Dagger 2 - Simple](https://github.com/google/dagger/tree/master/examples/simple)
- [Dagger 2 - Android Simple](https://github.com/google/dagger/tree/master/examples/android-simple)
- [Dagger 2 - Android Activity Graphs](https://github.com/google/dagger/tree/master/examples/android-activity-graphs)
- [U2020](https://github.com/cgruber/u2020)
- [U2021](https://github.com/cgruber/u2020)
- [Android Studio Robolectric Test Example](https://github.com/mutexkid/android-studio-robolectric-example)
- [Tutorial: Set up android + gradle project with dagger](https://github.com/frankdu/android-gradle-dagger-tutorial)
- [Instrumentation Testing with Dagger, Mockito, and Espresso](https://github.com/bryanstern/dagger-instrumentation-example)
- [Dagger2 Example](https://github.com/mgrzechocinski/dagger2-example)
- [SOLID: Noun Project Browser](https://github.com/blad/solid-android)

在我想清楚我想用依赖注入干什么之后，我就开始想应该用一个怎样的软件架构去达到松耦合，并且能让 View 和业务逻辑相互独立（就像我在用 Angular 时做的那样）。实现这样的软件架构还有一个好处就是：简化测试驱动开发……因为如果模拟 Activity 对象和 View 对象只能够进行测试，并且给出相应的测试结果，这样的测试其实是没有什么意义的。

最终我决定使用的架构是 [Flux](https://facebook.github.io/flux/)。很显然，Facebook 开发Flux是为了将它应用到网页和javaScript 上，所以如果我想把它应用到Android项目中，就必须这个项目作一定程度的修改。经过一些调整（主要是 dispatcher 和 view 访问数据的方式），结合 Square 开发的 [Otto](http://square.github.io/otto/) 库，Android版的Flux架构库就诞生了。

后来我又想到了一些有用的东西，但我不敢把这些想法在这个阶段投入到应用的开发中。毕竟我现在使用的架构模式是没有经过测试的，而且我很不熟悉 Dagger 2，Butterknife 和 Otto 这些库，所以我决定以测试驱动的方式决定这些想法的实施。于是我遵循Facebook的用例（还有一些其他人的）创建了一个简单，但功能完备的应用，并把它命名为FluxyTodo。作为最想要看到这种架构模式成功的人，我想要用另一个有关如何组合使用Dagger 2，Butterknife和Otto的例子向所有关注的人证明这个架构的可行性。因为这些库的用例非常少，在功能完备的应用中更甚，我觉得我最终提供的用例肯定会成为Android开发社区的一笔财富。

因此，如果越多的人采用这种架构，Android开发就会变得没那么痛苦了。下面来看干货吧！

##Architecture

在看了 Flux 和尝试把相关概念应用到Android中后，我想到了这个架构，所以如果你以前有用过Flux的话，这部分的内容对你来说会非常熟悉。下面是基本的架构图：

![](http://armueller.github.io/images/Architecture-General.png)

如你所见，这和Flux非常相似，毕竟我只是基于Android进行了一点点的修改，主要的区别在于dispatcher的运作方式。没用创建一个dispatcher去模仿Facebook应用创建的行为，我用事件总线代替了这个机制（Otto）。还有一个细微的差别是：我使用了 models 和 stores，而不是只使用 stores。stores 只用于存储 View 的状态，而 models 存储其他应用数据和业务逻辑。

##本系统每个部分的详解

###View

View层一般用于给用户显示界面，在Android系统中，View层的表示就是Activity和Fragment，及它们对应的xml组件。纯理论来看，View的职责只包含创建和显示呈现给用户的界面，并且监听用户在View上的操作并返回用户产生的交互行为。也就是说，在View层绝不应该存在任何数据操作或业务逻辑。View层的逻辑应该尽可能少地与View的状态产生交集。

当用户与View的某个区域产生交互，View应该将用户产生的动作交由操作事件产生部件进行处理。假如我们要正确地完成View中产生的动作的事件处理链，View则应该只与一个部件产生内部通信，即操作事件产生部件。举例来说把，假如一个用户点击了上传按钮，那么View应该让行为产生部件创建一个上传行为，以完成用户所需要完成的操作。

至于在View中填充控件及相关的数据，View则只应该监听一个数据源的状态，数据总线。一旦View被创建，View就应该订阅来自数据总线的事件，当数据总线流入View将用到的数据，View就应该取得该数据，并将它绑定到对应的控件中。

###Action Creator

操作事件产生部件有两个职责：1、为View提供API，用以响应用户在View上可能产生的操作事件。例如你开发了一个计算器App，相应的操作事件产生部件就应该有 createAddAction, createSubtractAction 等方法，具体有哪些方法依赖于计算器的功能需求，当然了，这些方法可能会需要一个参数，例如 public void createAddAction(float numberToAdd)。

2、创建行为对象，并将它们投递到事件总线上。

###Action Bus

事件总线是所有事件被投递、流动的部件，stores 和 models 监听投递到事件总线上的特定事件。当特定事件产生，就会触发它们处理View的逻辑或业务逻辑。

###Stores & Models

models用于数据的存储和转换，在我的架构中期时和传统的MVC模式中的models相似。models会订阅投递到事件总线的事件，还是以计算器为例子吧，如果一个加法运算的操作事件对象被投递到事件总线上，Model就会接收该事件，无论当前数字是多少，就会将作为参数传入的数字与当前数字进行加法运算，然后将运算结果投递到数据总线上。

而stores与models的不同之处在于：存储在store的数据与当前的View状态呈强相关关系，继续以计算器为例，此时你可以在store中存储一个操作事件的撤销缓冲区，因为此时数据不与应用的实际状态关联。再举个例子，如果你有一堆App，而且想要过滤掉某些App，那么此时你可以将过滤后的App列表放到store，而原来的App列表仍然在model中。

###Data Bus

数据总线是所有model和store投递数据更新事件的地方，View订阅某些数据，并将数据投递到数据总线上，从而达到异步更新View数据的目的。

##TDD!

这个架构解耦了Android应用的所有组成部件，使Android开发变得更轻松。此外，以测试驱动开发和依赖注入也变得简单。

下面这张图列举了一些你可以在我的架构模式中使用的常被推荐来进行测试驱动开发的办法。该测试驱动开发的架构模板如下：

![](http://armueller.github.io/images/Architecture-General-TDD.png)

###Views

下面是一些使用本架构的人想在View中测试的东西：

- 首先，你想要确保你的View组件被正确绑定到数据总线中，而且一旦View被初始化或被填充完成就总会呈现正确的结果。要测试这个非常简单，我们只需要将测试数据投递到数据总线中哦你，然后测试只需要确保数据被正确地用于初始化View和填充View。

###Actions

对创建的每一个操作事件产生部件，你应该为每一个部件创建对应的操作事件，投递到事件总线中让部件的方法进行测试。而要完成这个工作，你只需要简单地调用部件的方法，监听事件总线以确保正确的操作事件对象被投递到事件总线中，并让它装载正确的数据。

###Models & Stores

models 和 stores 是应用的核心，因此，需要的测试是最多的。每一个model和store对象都应该进行充分的单元测试。对于没有监听操作事件或投递数据到数据总线上的简单对象，标准的单元测试就足够了。而监听操作事件、投递数据到数据总线上和具有某些业务逻辑的那些model和store，则需要在测试的时候关联对应的总线以完成测试。

##Implementation

为了将这个新的架构投入测试，我决定将它应用到一个简单的待办事项App中（绝对是我原创的）

下面这张架构图详细地说明了每一个部件是如何和其他部件交互的：

![](http://armueller.github.io/images/Architecture-Impl.png)

如果你想详细了解这个架构是怎么被应用的，可以到[这里](https://github.com/armueller/FluxyAndroidTodo)下载我开发的待办事项App源码进行学习。

##Future work

尽管通过这个架构方式开发的App已经可以正常使用了（和用Facebook的Flux架构开发的待办事项App相似），我也挺满意实际的效果的。我想到了几个与服务器通信的新办法，感觉能应用到这个架构中，但这些办法我都不太满意。显然，我理想中的与服务器通信的办法，必须能在某些情况下能用某个方程表示，这也是我接下来要研究的东西。一旦我想到了一个满意的解决方案，我就会更新博客和大家分享！

##Todo:

- 找到我认为的和服务器通信的最优方案
- 用数据库存储大量的待办事项
- 让应用能异步处理大量数据
- 更新博客

##Code

[待办事项App源码](https://github.com/armueller/FluxyAndroidTodo)
