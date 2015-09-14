一种更清晰的Android架构
---

>
* 原文链接 : [Architecting Android…The clean way?](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)
* 译者 : [Mr.Simple & Sophie.Ping](https://www.github.com/bboyfeiyu)
过去几个月以来，通过在Tuenti网站上与@pedro_g_s和@flipper83（安卓开发两位大牛）进行友好讨论之后，我决定写这篇关于架构安卓应用的文章。     
我写这篇文章的目的是想把我在过去几个月体悟到的小方法以及在调查和应用中学到的有用的东西分享给大家。## 入门指南大家都知道要写一款精品软件是有难度且很复杂的：不仅要满足特定要求，而且软件还必须具有稳健性，可维护、可测试性强，并且能够灵活适应各种发展与变化。这时候，“清晰架构”就应运而生了，这一架构在开发任何软件应用的时候用起来非常顺手。这个思路很简单：简洁架构 意味着产品系统中遵循一系列的习惯原则：

* 框架独立性
* 可测试
* UI独立性
* 数据库独立性
* 任何外部代理模块的独立性  
![arch](https://camo.githubusercontent.com/dd69e725f30c30031dea279adc5a9d09ea3432f2/687474703a2f2f6665726e616e646f63656a61732e636f6d2f77702d636f6e74656e742f75706c6f6164732f323031342f30392f636c65616e5f617263686974656374757265312e706e67)我们并不要求一定要用四环结构（如图所示），这只是一个示例图解，但是要考虑的是依赖项规则：源码依赖项只能向内指向，内环里的所有项不能了解外环所发生的东西。  
以下是更好地理解和熟悉本方法的一些相关词汇：     * Entities：是指一款应用的业务对象* Use cases：是指结合数据流和实体中的用例，也称为Interactor* Interface Adapters： 这一组适配器，是负责以最合理的格式转换用例（use cases）和实体（entities）之间的数据，表现层（Presenters ）和控制层（Controllers ），就属于这一块的。
* Frameworks and Drivers: 这里是所有具体的实现了：比如：UI，工具类，基础框架，等等。想要更具体，更生动丰富的解释，可以参考[这篇文章](http://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)或者[这个视频](https://vimeo.com/43612849)。
## 场景我会设置一个简单的场景来开始：创建一个简单的小app，app中显示从云端获取的一个朋友或用户列表。当点击其中任何一个时，会打开一个新的窗口，显示该用户的详细信息。这里我放了一段视频，大家看看[这个视频 (需翻墙)](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)大概就可以对我所描述的东西了解个大概了。 
## Android应用架构这一对象遵循关注分离原则，也就是通过业务规则让内环操作对外环事物一无所知，这样一来，在测试时它们就不会依赖任何的外部元素了。    要达到这个目的，我的建议就是把一个项目分成三个层次，每个层次拥有自己的目的并且各自独立于堆放运作。值得一提的是，每一层次使用其自有的数据模型以达到独立性的目的（大家可以看到，在代码中需要一个数据映射器来完成数据转换。如果你不想把你的模型和整个应用交叉使用，这是你要付出的代价）。    
以下是图解，大家感受下：   
![schema](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture_android.png)
> 注：我并没有使用任何的外部库（除了用于json数据句法分析的gson和用于测试的junit, mockito, robolectric和espresso以外）。原因是它可以使这个示例更清晰。总之，在存储磁盘数据时，记得加上ORM、依赖注入框架或者你熟悉的任何工具或库，这些都会带来很大帮助。（记住：重复制造轮子可不是明智的选择）
## 表现层 (Presentation Layer)
表现层在此，表现的是与视图和动画相关的逻辑。这里仅用了一个Model View Presenter（下文简称MVP），但是大家也可以用MVC或MVVM等模式。这里我不再赘述细节，但是需要强调的是，这里的fragment和activity都是View,其内部除了UI逻辑以外没有其他逻辑，这也是所有渲染的东西发生的地方。本层次的Presenter由多个interactor（用例）组成，Presenter在 android UI 线程以外的新线程里工作，并通过回调将要渲染到View上的数据传递回来。![mvp](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture_mvp.png) 
 如果你需要一个使用MVP和MVVM的[Effective Android UI](https://github.com/pedrovgs/EffectiveAndroidUI/)典型案例，可以参考我朋友Pedro Gómez的文章。## 领域层 (Domain Layer)
这里的业务规则是指所有在本层发生的逻辑。对于Android项目来说，大家还可以看到所有的interactor（用例）实施。这一层是纯粹的java模块，没有任何的Android依赖性。当涉及到业务对象时，所有的外部组件都使用接口。    
![domain](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture_domain.png) 
 ## 数据层 (Data Layer)应用所需的所有数据都来自这一层中的UserRepository实现（接口在领域层）。这一实现采用了[Repository Pattern](http://martinfowler.com/eaaCatalog/repository.html)，主要策略是通过一个工厂根据一定的条件选取不同的数据来源。比如，通过ID获取一个用户时，如果这个用户在缓存中已经存在，则硬盘缓存数据源会被选中，否则会通过向云端发起请求获取数据，然后存储到硬盘缓存。这一切背后的原理是由于原始数据对于客户端是透明的，客户端并不关心数据是来源于内存、硬盘还是云端，它需要关心的是数据可以正确地获取到。![data](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture_data.png)   
>注：在代码方面，出于学习目的，我通过文件系统和Android preference实现了一个简单、原始的硬盘缓存。请记住，如果已经存在了能够完成这些工作的库，就不要重复制造轮子。## 错误处理这是一个长期待解决的讨论话题，如果大家能够分享各自的解决方案，那真真是极好的。我的策略是使用回调，这样的话，如果数据仓库发生了变化，回调有两个方法：onResponse()和onError(). onError方法将异常信息封装到一个ErrorBundle对象中: 这种方法的难点在于这其中会存在一环扣一环的回调链，错误会沿着这条回调链到达展示层。因此会牺牲一点代码的可读性。另外，如果出现错误，我本来可以通过事件总线系统抛出事件，但是这种实现方式类似于使用C语言的goto语法。在我看来，当你订阅多个事件时，如果不能很好的控制，你可能会被弄得晕头转向。## 测试关于测试方面，我根据不同的层来选择不同的方法:    
*	展示层 ( Presentation Layer) : 使用android instrumentation和 espresso进行集成和功能测试*	领域层 ( Domain Layer) : 使用JUnit和Mockito进行单元测试；*	数据层 ( Data Layer) : 使用Robolectric （ 因为依赖于Android SDK中的类 ）进行集成测试和单元测试。## 代码展示我猜你现在在想，扯了那么久的淡，代码究竟在哪里呢？ 好吧，这就是你可以找到上述解决方案的[github链接](https://github.com/android10/Android-CleanArchitecture)。还要提一点，在文件夹结构方面，不同的层是通过以下不同的模块反应的:     
*	presentation: 展示层的Android模块*	domain: 一个没有android依赖的java模块*	data: 一个数据获取来源的android模块。*	data-test: 数据层测试，由于使用Robolectric 存在一些限制，所以我得再独立的java模块中使用。## 结论正如 Bob大叔 所说：“Architecture is About Intent, not Frameworks” ，我非常同意这个说法，当然了，有很多不同的方法做不同的事情（不同的实现方法），我很确定，你每天（像我一样）会面临很多挑战，但是遵循这些方法，可以确保你的应用会：   
*	易维护 Easy to maintain*	易测试 Easy to tes.*   高内聚 Very cohesive.*	低耦合 Decoupled. 	最后，我强烈推荐你去实践一下，并且分享你的经验。也许你会找到更好的解决方案：我们都知道，不断提升自己是一件件非常好的事。我希望这篇文章对你有所帮助，欢迎拍砖。## 参考资料<ol>
<li>Source code: <a href="https://github.com/android10/Android-CleanArchitecture">https://github.com/android10/Android-CleanArchitecture</a></li>
<li><a href="http://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html">The clean architecture by Uncle Bob</a></li>
<li><a href="http://www.infoq.com/news/2013/07/architecture_intent_frameworks">Architecture is about Intent, not Frameworks</a></li>
<li><a href="http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter">Model View Presenter</a></li>
<li><a href="http://martinfowler.com/eaaCatalog/repository.html">Repository Pattern by Martin Fowler</a></li>
<li><a href="http://www.slideshare.net/PedroVicenteGmezSnch/">Android Design Patterns Presentation</a></li>
</ol>