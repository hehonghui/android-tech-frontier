Android 中的依赖注入框架

---

> * 原文链接 : [Dependency Injection on Android](http://tech.just-eat.com/2015/10/26/dependency-injection-on-android/)
* 原文作者 : [Just Eat](http://tech.just-eat.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 




09年我刚开发 App 那会，情况和现在不太一样。App 作为新生的 IT 领域，一切事物都处于从低级向高级演化的阶段。那会儿哪有人会把开发 App 当成吃饭的家伙呀，大家都只是想打发打发时间，找点乐子。

而今天，移动 App 已经发生了翻天覆地的变化。App 不但在当今互联网时代和 PC 分庭抗礼，甚至在许多公司中成为战略发展的核心，而 JUST EAT 公司就是其中之一。我们知道用户都很喜欢我们的 App，所以我们一直很重视我们的 App，这也促使我们的 App 在保证性能表现的同时提供了绝佳的用户体验。

某种程度上你也可以说我们使用专业的软件开发工具和技术严肃地对待着开发我们 App 的每一项事业。而我们用于开发的其中一项技术就是依赖注入。

##依赖注入是一种设计模式

虽然依赖注入早已作为一种设计模式为人所知，但到了近段时间它才被广泛应用到 Android 应用的开发中，主要是因为最近才有了各种各样依赖注入框架的优秀实现。依赖注入让开发者的代码低耦合，且能够容易地进行测试。开发者开发的 Android 应用存活的时间越长，应用易于被高效地进行测试就显得越重要。在开发 JUST EAT 的时候，我们认为：让代码能够被配置因而能被测试的关键就是依赖注入，这样才能在应用变得越来越庞大的时候代码依然可靠。正因为我们通过依赖注入使我们的测试变得有效，鲁棒性高，才能定期更新应用。JUST EAT 的成功让我们确信依赖注入是一个有用的工具，但在继续吹B之前，我还是介绍一下以来注入把。

##依赖注入的基础

我们写代码的时候，我们的类总会不可避免地拥有其他类的依赖。这样类 A 就可能需要一个类 B 的引用或依赖。为了简化介绍的难度，我下面就举个车的例子来解释吧：

```java
public class Car {  
 
    private Engine engine;
 
    public Car() {
        engine = new PetrolEngine();
    }
}
```

这段代码毫无疑问能正常地运作，但我们会发现 Car 类和 Engine 类高度耦合。Car 类一旦被实例化，就会伴随着 Engine 类的实例化，也就使得 Car 类在实例化时必须知道 Engine 类的实例化需要哪些条件，在我们的例子中就是 PetrolEngine 类实例化需要的条件。为了降低耦合，我们可以把代码改成下面这样：

```java
public class Car {   
 
    private Engine engine;
 
    public Car(Engine engine) {
        this.engine = engine;
    }
}
```

现在我们只需要在实例化 Car 对象的时候传入一个 Engine 对象的引用，这就意味着 Car 类和 Engine 类的耦合度降低了。Car 类不再需要知道 Engine 类的实例化条件是什么，Car 类能调用的任何类型的 Engine 类。在这个例子中，因为我们通过 Car 类的构造方法把 Engine 类传递（或者称为注入）给 Car 实例，使得我们完成了构造器注入的实现，我们当然还可以通过使用依赖注入框架的方法直接注入到类的域里。上面就是依赖注入的概念了。它的思想就是将依赖直接传递给类，而不是由类来初始化依赖。

##如果依赖注入这么简单，为什么需要专门开发一个框架？

现在我们知道依赖注入是什么了，也就知道要怎么在代码中应用依赖注入了，所以我们就看看在我们的构造方法或者调用的方法中需要传递哪些依赖把。对于一些简单的依赖，这部分工作确实很好完成，但依赖越复杂，我们需要完成的工作就越繁复。

还是回到刚刚的例子吧，假设 Engine 类也有它所需要的依赖集，例如：曲柄轴，活塞，块和头。如果我们遵循依赖注入的原则，就会将这些类的实例传递给 Engine 类，这样的情况倒还好，我们只需要先创建这些对象，然后在创建 Engine 类实例的时候把它们传递给 Engine 对象就好了，最后我们还是可以将 Engine 类的实例传递给 Car 类。

现在我们让这个例子变得更复杂些，如果我们想为 Engine 类的每一个部件创建类，那么我们很容易就会因此创建几百个类，这些类甚至呈现为一颗复杂的树状图（准确来说是一张图）结构的依赖关系。

![](http://je-ict-live-techblog-assets-eu-west-1.s3.amazonaws.com/wp-content/uploads/2015/10/di_graph.png)

上面是这种情况的简化图，有图可知，为了得到根对象，我们必须创建叶接对象，并把它们传递给各自的父对象，而且要以正确的顺序去创建，要不然肯定会出现问题。

换句话说，为了创建依赖，我们如履薄冰，一旦顺序搞错了就会代码爆炸。

所以现在你就会发现情况已经变得糟糕起来了，如果我们使用了诸如工厂模式或者建造者模式这样的设计模式去创建我们的类，我们很块就会发现代码变得很复杂、臃肿，充斥着依赖的传递，而且大量的代码都是无意义的、反复的模板代码，这样的代码无疑是开发者不应该写出来的。

从我们的例子里就可以了解到以简单的方式实现依赖注入的坏处在哪里了：复杂的依赖关系、大量的模板代码。也正是如此，依赖注入之前没有流行起来。但不可否认，依赖注入确实是值得使用的，也正因如此，有几个大牛开发了依赖注入框架来解决传统依赖注入用法存在的问题。这些框架大大简化了配置依赖以及生成工厂和建造者对象的过程，是之变得直观和简单。

##在 Android 中应该使用什么依赖注入框架呢？

因为依赖注入这个概念是有一段历史的，所以有一些依赖注入框架可以用很正常，在 Java 中，有着 Spring，Guice 和 Dagger 这些依赖注入框架，那么我们该如何选择呢？

Spring 已经有一段时日了，为了解决声明依赖和初始化对象，Spring 运用了 XML。但这样做有一个问题，就是我们必须写下冗长的 XML 代码来完成这部分工作，而且要在运行时确保它完成了这些工作。所以 Spring 在尝试解决因此衍生的种种问题时也提出了使用依赖注入存在的问题。

在 Java 依赖注入框架的发展历程中，Guice 确实能算作对 Spring 的革新。Guice 不需要通过　XML 来配置类的成员域，而是直接通过注解完成了配置的工作，例如 @Inject 和 @Provides。这样看起来依赖注入框架确实要变得更好用了，但 Guice 还是存在一些问题：Debug 和追踪错误有些困难。另外，Guice 使用了大量的反射，虽说对服务器来说这些都不是太大的问题，但在追求用户体验的客户端就会造成很大的开销，影响应用的性能表现从而降低用户体验。

虽说 Guice 在依赖注入框架的发展史上踏出了一大步，但它没有解决任何实际的问题，而且它的设计也不是特别适合在移动端开发中使用。因此，Square 开发了 Dagger，造福万千 Android 开发者。

Dagger 这个名字的灵感来源于我们依赖的树状关系，依赖关系呈现的图实际上是有向非循环图，英语简称为：DAG，而在我们的场景中，图呈现上尖下宽的形状，有点像蒙古的圆顶帐篷，所以就叫作 DAGger—— Dagger了。Dagger 的目的是解决将 Guice 应用到移动端存在的问题。

Dagger 将大部分工作负担投到编译时完成而不是运行时，而且尝试尽可能不使用反射，这两部分工作能完成的话就能极大提高依赖注入框架的性能表现。最后 Dagger 完成了这样的工作，但为此也牺牲了一些 Guice 中的特性，但总体来说还是值得的。但 Google 认为这部分工作还能完成地更好，所以他们在尝试开发 Dagger 2。

Dagger 2 在编译时完成更多的工作，而且将移除反射这部分工作完成地更好，最终完成的 Dagger 2 在 Debug 中的表现也比 Dagger 要好。我真心觉得 Dagger 2 是 Android 中优秀的依赖注入方案了，所以如果你有使用依赖注入框架的话，或者正想要选一个依赖注入框架使用，我认为 Dagger 2 是你的最佳选择。

##在 Android 开发中使用

那么要怎么用它们呢？Dagger 和 Dagger 2 都有丰富的教程能帮助你快速入门。

Dagger 2 的首页有丰富的 Dagger 2 的相关概览和特性，这都得感谢 Jake Wharton。上面告诉你要怎么用 Dagger 2 完成依赖注入中的各种工作。下面是一些简单的教程：

[Dagger 2 概览](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android)

什么是 Dagger 2 以及如何使用：

[http://konmik.github.io/snorkeling-with-dagger-2.html](http://konmik.github.io/snorkeling-with-dagger-2.html)

Dagger 2 中的域：

[http://frogermcs.github.io/dependency-injection-with-dagger-2-custom-scopes/](http://frogermcs.github.io/dependency-injection-with-dagger-2-custom-scopes/)

结合使用Dagger、Espresso 和 Mockito 来完成测试：

[http://blog.sqisland.com/2015/04/dagger-2-espresso-2-mockito.html](http://blog.sqisland.com/2015/04/dagger-2-espresso-2-mockito.html)
