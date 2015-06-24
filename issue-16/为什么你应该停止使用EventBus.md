为什么你应该停止使用EventBus
---

> * 原文链接 : [Why you should avoid using an event bus](http://endlesswhileloop.com/blog/2015/06/11/stop-using-event-buses/)
* 原文作者 : [Tony Cosentini](http://endlesswhileloop.com/)
* 译文出自 :  [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Zhaoyy](https://github.com/Zhaoyy) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中 


``文中的EventBus多指事件总线这种设计模式，而非EventBus这个具体的类库。``

One common pattern I see very often in Android development is the use of event buses. Libraries like Otto and EventBus are often used to remove boilerplate listeners that require tunneling code through many layers of hierarchy. Although an event bus might seem convenient at first, they quickly devolve into a mess of tangled events that are incredibly hard to follow and even more difficult to debug.

我经常看到EventBus被作为一种通用模式应用在Android开发中。Otto和EventBus这样的类库经常被用来省去编写不同层之间来封装代码的模板类。尽管EventBus刚开始看起来的确带来了方便，但是很快这些纠缠的事件会被弄成一堆乱麻，很难跟踪更别说调试。

Event busses are often sold as allowing you to loosely couple together components, but in reality they give you the confusion of loose coupling and the downsides that come with tight coupling.

EventBus通常被宣扬可以降低模块之间的耦合度，但是，事实上带给你的是降低耦合度带来的混乱和困惑。

## Nested Events

## 嵌套的事件
One common pitfall is nesting events. This might seem easy to avoid, just don’t send events in event subscribers, but often times it’s not that clear. A subscriber might call a method, which calls another method, which indirectly fired off another event. These tangled balls of events are incredibly complex and hard to debug.

一个常见的弊端是处理嵌套的事件。不要在事件订阅者里面发布事件，这看起来很容易避免，但是经常会不容易理解。一个订阅者很可能会通过调用其他的方法来间接地抛出其他的事件。这样事件会纠缠成一个复杂地难以置信的球，很难进行调试。

Facebook’s Flux architecture is somewhat event driven, but they explicitly disallow sending nested events. I wish Otto and EventBus could detect this.

Facebook的Flux框架是另外一个事件驱动的设计框架，但是它[明令禁止发送嵌套事件](https://github.com/facebook/flux/blob/ac1e4970c2a85d5030b65696461c271ba981a2a6/src/Dispatcher.js#L184)。希望Otto和EventBus未来能够检测嵌套事件。

## Treating Producers Like Synchronous Getters

## 以同步的方式处理生产者
(I don’t think this is relevant for GreenRobot’s EventBus.)

（我不认为这跟GreenRobot's EventBus有关系。）

This is a another common pattern that’s incredibly hard to undo in a larger codebase. Often times many activities or fragments will assume events are produced as soon as that component subscribes to the event bus. They’ll set a field based on the event, and then proceed to use that field in other lifecycle methods with the assumption that it is not null.

这是另外一个在大代码集中很难处理的常见模式。经常在许多Activity和Fragment里面，我们假定事件可以立即被EventBus里面的订阅者进行处理。它们会设置一个基于事件的属性，以假定这个属性不会为空的方式在其他的生命周期函数中使用。

When you do this, you’re making some very big assumptions about how these events are being sent – and none of these assumptions are really guaranteed or even clear based on the API, they are all implicit.

当你这样做的时候，你对于事件的发送传递作了一些大胆的假设，这些所有的假设并不能都被证明一定是这样或者是明确地被API备注，这些假设都是不可靠的。

What happens when you refactor your code that produces the event to act a little differently? There’s a strong possibility that the person refactoring the event producing code does not know you made an assumption about their implementation.

当你重构改变这些处理事件的代码的时候会发生什么呢？很可能重构处理事件代码的那个人进行实现的时候并不知道你的这个假设。

The root of this problem is that whatever is depending on the producer needs to either:

问题的根本在于生产者是否处理好一下两个方面：

Requires the data as a dependency.
要求把数据作为依赖。
Handle the state where the data is not available.
处理好数据未获取到时情况。
In the event the component requires the event data as a dependency, it should make it just that – a dependency. A required constructor dependency (or something injected via dependency injection) is guaranteed to be there 100% of the time (yes, you can argue this).

在事件处理中组件可以把事件数据作为依赖，仅仅是作为是否可用的依赖。这需要一个随时可用的依赖构造函数或者是通过依赖注入注入数据（这个可以继续深入讨论）。

If it’s something that is not required, the component needs to handle the case when it’s not available (for a UI component, this usually means handling a loading state).

如果还没有请求到任何数据，组件需要处理好这种还未得到信息的情况（对于UI组件通常是处理等待加载的情况）。

## Alternatives

## 其他选择
No library or tool will fix these problems for free, but some tools and patterns will encourage you to do things the right way.

没有类库或者工具会毫无代价的处理好这些问题，但是一些工具或者设计模式会鼓励你使用正确的处理方式来处理这些问题。

An event bus, when used correctly, can probably avoid these issues. However, it also encourages these practices more than most tools. Using simple listeners, although they will require more code, will make things much easier to understand.

正确地使用EventBus可能会避免这些问题。然而，相比大多数其他工具更鼓励实用的做法。尽管使用简单的监听类会增加一些额外的代码，可能会让业务的处理更明确。

For more complex scenarios, RxJava provides a great solution. Dan Lew has a great series of blog posts about it.

对于更加复杂的情况，[RxJava](http://reactivex.io/)提供了更好的解决办法。[Dan Lew有一些非常好的博客来介绍这个框架](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/)。

Update 6/14/15: I have changed the title (originally “Event bus is an anti-pattern”) to something a little less polarizing. It’s also worth reiterating that all of these pitfalls are not directly caused by the event bus. The synchronous getter issue in particular can happen with any kind of approach, but I think something like RxJava combined with optionals or @Nullable can make it much more clear.

**2015-06-14更新**：为了减少偏激我更改了标题（原来的标题是“EventBus 一个反面的设计模式”）。需要重申的是并不是所有的易错问题都是由EventBus导致的。特别是同步获取的问题在任何方式中都有可能发生，但是我认为通过RxJava结合一些配置和可空的注解（``@Nullable``）能够更清晰地处理好这个问题。


