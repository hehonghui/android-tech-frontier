Google+ 团队的 Android UI 测试
---

>
* 原文链接：[How the Google+ Team Tests Mobile Apps](http://googletesting.blogspot.sg/2013/08/how-google-team-tests-mobile-apps.html)
* 译者：[allenlsy](http://allelsy.com)
* 译者博文地址：[http://allenlsy.com/android-ui-tests-in-google-plus-team/]()
* 校对者:

Android 测试主要分为3个类型：

#### 单元测试（Unit Test)

区分UI代码和功能代码在Android开发中尤其困难。因为有时Activity既有Controller的功能，又有View的功能。[Robolectric](http://pivotal.github.io/robolectric/)是一个很优秀的Android测试框架，它提供了一个Android框架的stub，这样测试运行时实际上是在JVM上运行，而不是在Android平台（比如Robotium和Instrumentation都是在Android平台运行测试），从而提高了速度。另外请参考[Gradle 对 Unit tests的支持](http://tools.android.com/tech-docs/unit-testing-support)。

#### 封闭UI测试 （Hermetic UI Test)

这个测试方法使得测试不需要外部依赖和网络请求。这样做的主要目的是提高测试速度，减少测试时的外部影响，毕竟网络调用是相对很慢的。[Espresso](http://www.youtube.com/watch?v=T7ugmCuNxDU)可以用来模拟用户的UI操作。

#### Monkey Test

Monkey Test 就好像一只猴子在测试app一样，没有任何规律的在你的app上胡按。计算机运行monkey test的时候，每秒钟能做出几千个UI动作（可以配置这个频率），比如点击和拖拽。所以这个测试可以算是一个压力测试，用来检测[ANR](http://developer.android.com/training/articles/perf-anr.html)。

---

Google+ 团队总结了一些 UI 测试时的经验和策略。

#### 策略1： 不要使用 End-to-end 测试作为UI测试

先看一些定义：__UI 测试__ 是为了确保对于用户的UI动作，app能返回正确的UI输出。__End-to-end测试（E2E test)__ 是通过客户端和后台服务器的交互测试整个系统。下面这个图在展示了测试步骤：

![](http://img.my.csdn.net/uploads/201503/28/1427507159_1836.png)

通常做UI测试，你需要后台服务器，所以可能产生网络调用。所以UI测试和E2E测试很像。但是在E2E测试中会遇到很多困难：

* 测试速度缓慢
* 网络请求会失败
* 难以Debug

下面看看如何解决这些问题。

#### 策略2：使用伪服务器做封闭UI测试

这个策略中，你可以通过假的后台服务器来避免网络请求，以及其他外部依赖。技术上，你就需要在app本地提供返回数据了。有很多办法可以做到，比如手动做一次网络请求，把response保存下来，在测试的时候重复这个response。这样你就做了一个封闭在本地的伪服务器

当你有了这个伪服务器，你还需要给这个伪服务器写测试。于是这是，你的E2E测试就分为了服务器测试，客户端测试和集成测试。

![](http://img.my.csdn.net/uploads/201503/28/1427507159_8354.png)

现在这样的解决方案，你需要自己维护伪服务器，本地数据库和tests了。

下面这是E2E 测试的示例图：

![](http://img.my.csdn.net/uploads/201503/28/1427507160_4776.jpg)

这是使用了伪服务器的封闭UI测试

![](http://img.my.csdn.net/uploads/201503/28/1427507167_8779.jpg)

其区别在于：Frontend Server的几个数据源变了。由原来的真实后端，变成了封闭服务器，或者是mock服务器。这个在测试调用网络API的时候非常有用。

#### 策略3：使用Dependency Injection

Dependency Injection（依赖注入）可以帮助生成测试数据。我推荐选择使用[dagger](http://square.github.io/dagger/)作为依赖注入框架。

依赖注入在UI test和unit test都中都可以用于生成假数据。在instrumentation test框架中，测试用的apk文件和测试时运行的app，是在同一个进程下面，所以测试代码可以调用app代码。你还可以覆盖app的classpath，通过这种方式注入假数据。比如你可以用依赖注入来伪造一个网络连接的实现，调用这个网络连接的时候就可以提供假数据。

![](http://img.my.csdn.net/uploads/201503/28/1427507159_6700.png)


### 策略4：把app分为小的libraries

这个方法可以更好地模块化你的app。你的app被分为更小的类库之后，你可以为这些类库添加他们自己的UI依赖或gradle库依赖。

当你有了自己的库，并提供依赖注入的支持，那么你可以为各个库写测试app。最后，可以写__集成测试__来确保类库直接的合作正确。

比如我们有一个登陆功能的库，那么我可以写一个测试app只为这个登陆功能库：

![](http://img.my.csdn.net/uploads/201503/28/1427507160_4803.png)

#### 总结：

1. 不要用E2E测试来代替UI测试。更好的做法是用单元测试 + 集成测试 + UI测试。
2. 使用封闭测试策略
3. 使用依赖注入
4. 把app分为不同的小组件小类库，并分别写测试，然后再写集成测试来确保各组件之间的交互正确。
5. 模块化 UI 测试已经被证明了比E2E测试快，并且十分稳定。这样的测试又能极大的提高开发效率。
