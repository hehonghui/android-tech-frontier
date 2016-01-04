
# Flux Architecture on Android 
# 适用于Android的Flux架构
============================

> * 原文链接 : [Flux Architecture on Android](http://lgvalle.github.io/2015/08/04/flux-architecture/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Mr.Simple](https://github.com/bboyfeiyu)  

Finding a good architecture for Android applications is not easy. Google
seems to not care much about it, so there is no official recommendation
on patterns beyond Activities lifecycle management.

找到一个好的应用架构对于Android来说并非易事，Goodle似乎并不那么关心这方面，因为他们并没有推荐一个合适的应用架构。

But defining an architecture for your application is important. Like it
or not, **every application is going to have an architecture**. So you'd
better be the one defining it than let it just emerge.

但是对于应用来说一个良好的架构是非常重要的。不管你是否同意，每个应用都应该有一个架构。因此，你最好为你的应用设计一个架构，而不是任由它发展。


## Today: Clean Architecture
## 清晰的软件架构
=========================

Current trend is to adapt **[Clean
Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)**,
a 2012 Uncle Bob proposal for web applications.

现在比较流行的架构是Bob大叔在2012年发表的、针对于Web应用的[清晰的软件架构](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)。

I find Clean Architecture a little bit **over-engineered** for most of
the Android apps out there.

但是我发现这个清晰的软件架构对于Android应用来说太过重量级了。

Typically **mobile apps live shorter than web apps**. Mobile technology
is evolving so fast that any app released today is going to be
completely deprecated in twelve months.

通常来说，移动应用都比web应用要简单。移动技术变化得很快，以至于今天发布的应用可能在一年之后就过时了。

Mobile apps usually **do very little**. A very high percent of use cases
are just for data consuming. Get data from API, show data to user. Lot
of reads, very little writes.

移动应用通常比较简单，比较多的使用场景只是对数据的处理。从API获取数据、向用户展示数据。更多的是阅读，很少有写内容的需求。

As a result its **business logic is not complex**. At least not as
complex as backend apps. Well you have to deal with platform issues:
memory, storage, pause, resume, network, location, etc. But that is not
your app business logic. You have all of that in every app.

这也使得移动应用的`业务逻辑不会太过于复杂`，至少不会比后端的应用复杂。当然，你也需要处理一些移动平台的问题:内存，存储，暂停，重新运行，网络，地理位置等等。但是这些并不是你的业务逻辑。 

So it seems that most of the apps out there will not benefit from things
like complex layer divisions or job priority execution queues.

因此，对于大多数应用来说并不会从复杂的分层架构或者具有优先级的任务队列中获得太多益处。

They may just need a **simple way to organise code, work together
efficiently and find bugs easily**.

它们可能只是需要简单的方式来组织代码，使得各部分组件之间高效的一起工作，并且容易查找bug。

## Introducing Flux Architecture
## Flux 应用架构简介
=============================

**[Flux
Architecture](https://facebook.github.io/flux/docs/overview.html)** is
used by Facebook to build their client- side web applications. Like
*Clean Architecture* it is not intended for mobile apps, but its
features and simplicity will allow us to adapt it very well to Android
projects.

**[Flux应用架构](https://facebook.github.io/flux/docs/overview.html)**被facebook用于架构客户端Web应用，与*Clean Architecture*类似它也不是针对于移动应用的，它更简洁性能够让我们很方面的适用于Android应用。

![flux-graph-simple](http://img.blog.csdn.net/20150810172158465)

There are two **key features** to understand Flux:

有两个关键特性能够帮助我们理解Flux : 

-   The data flow is always **unidirectional**.

    An [unidirectional data
    flow](https://www.youtube.com/watch?v=i__969noyAM) is the **core**
    of the Flux architecture and is what makes it so easy to learn. It
    also provides great advantages when testing the application as
    discussed below.
- 数据流总是单向的
	一个 [单向数据流](https://www.youtube.com/watch?v=i__969noyAM)是Flux 应用架构的核心，这也使得它很容易学习。当你需要测试应用时它也提供了很便利的条件。

-   The application is divided into **three main parts**:

    -   **View**: Application interface. It create actions in response
        to user interactions.
    -   **Dispatcher**: Central hub through which pass all actions and
        whose responsibility is to make them arrive to every Store.
    -   **Store**: Maintain the state for a particular application
        domain. They respond to actions according to current state,
        execute business logic and emit a *change* event when they are
        done. This event is used by the view to update its interface.
- 应用分为三部分 : 
	* **View** : 应用接口,它用于将用户的交互转换为Action。
	* **Dispatcher** : 中央分发器,将所有action分发到处理它们每个Store;
	* **Store** : 维护特定应用领域的状态。它们根据当前的状态对action做出处理,执行业务逻辑,并且在处理完成时发出*change*事件。这个事件用于通知View更新UI。

This three parts communicate through **Actions**: Simple plain objects,
identified by a type, containing the data related to that action.

这三部分通过**Action**交互,Action是通过type标识的简单对象,它包含了一些与action相关的数据。

## Flux Android Architecture
## 适用于Android的Flux架构
=========================

The main target of using Flux principles on Android development is to
build an architecture with a good balance between simplicity and ease of
scale and test.
在Android开发中使用Flux原则的主要目标就是创建一个简单、可伸缩、易于测试的应用架构。

First step is to **map Flux elements with Android app components**.

第一步需要做的就是**在Android组件之间建立Flux元素的关系映射**。

Two of this elements are very easy to figure out and implement.

这两类元素非常容易实现 : 

-   **View**: Activity or Fragment
-   **Dispatcher**: An event bus. I will use Otto in my examples but any
    other implementation should be fine.

- **View**: Activity 或 Fragment;
- **Dispatcher**: 一个事件总线,我在示例中使用了Otto，但是其他实现也是可以考虑的，例如[AndroidEventBus](https://github.com/bboyfeiyu/AndroidEventBus)。

### Actions
-------

Actions are not complex either. They will be implemented as simple POJOs
with two main attributes:

Action也不复杂,它们通常是一些含有如下两个主要属性的简单的对象: 

-   Type: a `String` identifying the type of event.
-   Data: a `Map` with the payload for this action.

- Type : 标识事件类型的一个String字段;
- Data : 一个含有该Action信息的map字段。

For example, a typical action to show some User details will look like
this:

例如,一个显示一些用户详细的action大致如下所示 : 

```java
    Bundle data = new Bundle();
    data.put("USER_ID", id);
    Action action = new ViewAction("SHOW_USER", data);
```

### Stores
------

This is perhaps the **most difficult** to get Flux concept.

Stores应该是Flux概念里最难理解的了。

Also if you have worked with Clean Architecture before it also will be
uncomfortable to accept, because Stores will assume responsibilities
that were previously separated into different layers.

如果你以前使用过Clean Architecture,你会感觉它也不是那么容易理解，因为Stores会假设职责已经被分割到不同的层。

Stores contain the **status of the application and its business logic**.
They are similar to *rich data models* but they can manage the status of
**various objects**, not just one.

Stores包含了**应用的状态以及业务逻辑**，它们很像**功能完备的数据模型**,但它们能够管理各种对象的状态,而不仅仅是其中一个。

Stores **react to Actions emitted by the Dispatcher**, execute business
logic and emit a change event as result.

Stores对Dispatcher发出的Action做出响应,执行业务逻辑,处理完成之后发出一个change事件。

Stores only output is this single event: *change*. Any other component
interested in a Store internal status must listen to this event and use
it to get the data it needs.

Stores只会输出一个**change**事件,任何对一个Store的内部状态感兴趣的组件都需要监听该事件,并且使用它来获取数据。

No other component of the system should need to know anything about the
status of the application.

系统中的其他部分并不需要了解应用的状态。

Finally, stores must **expose an interface** to obtain application
Status. This way, view elements can query the Stores and update
application UI in response.

最终,Store必须暴露一个接口来获取应用状态.这样一来，View元素就能够查询Store的状态以及更新UI。

![flux-graph-store](http://img.blog.csdn.net/20150810172207045)

For example, in a Pub Discovery App a SearchStore will be used to keep
track of searched item, search results and the history of past searches.
In the same application a ReviewedStore will contain a list of reviewed
pubs and the necessary logic to, for example, sort by review.

例如，在一个酒吧查找App中，SearchStore被用于追踪搜索到的酒吧、搜索结果和经过的酒吧历史数据。另一个ReviewedStore包含查看过的酒吧列表以及必须的逻辑，例如排序。

However there is one important concept to keep in mind: **Stores are not
Repositories**. Their responsibility is *not* to get data from an
external source (API or DB) but only keep track of data provided by
actions.

然后，有有一个重要的概念你必须要记住 : **Store不是Repositories**。它们的职责不是从外部资源（API或者数据库）中获取数据，只是追中action提供的数据。

So how Flux application obtain data?

那么Flux如何获取数据呢 ？

## Network requests and asynchronous calls
## 网络请求与异步调用
---------------------------------------

In the initial Flux graph I intentionally skipped one part: **network
calls**. Next graph completes first one adding more details:

在前面的Flux图表中我特意省略了一部分: **网络调用**。下一个图表将会完善这部分细节。

![flux-graph-complete](http://img.blog.csdn.net/20150810172211077)

Asynchronous network calls are triggered from an **Actions Creator**. A
Network Adapter makes the asynchronous call to the corresponding API and
returns the result to the Actions Creator.

异步网络调用会从**Actions Creator**触发，一个网络适配器会触发一个异步的网络调用并且将结果返回到**Actions Creator**中。

Finally the Actions Creator dispatch the corresponding typed Action with
returned data.

最终**Actions Creator**将含有相应type与数据的Action分发出去。

Having all the network and asynchronous work out of the Stores has has
**two main advantages**:

所有的网络请求和异步操作从Store中隔离出来有两个优点 : 

-   **Your Stores are completely synchronous**: This makes the logic
    inside a Store very easy to follow. Bugs will be much easier to
    trace. And since **all state changes will be synchronous** testing a
    Store becomes an easy job: launch actions and assert expected final
    state.

- **Store中的操作都是是完全同步的** : 这使得Store中的业务逻辑非常简单，bug也易于发现。并且，自从"所有的状态变化都必须是同步的"的运用到实际中，测试Store变得非常容易，只需要加载action，然后对最终的状态做一个断言判断;

-   **All actions are triggered from an Action Creator**: Having a
    single point at which you create and launch all user actions greatly
    simplifies finding errors. Forget about digging into classes to find
    out where an action is originated. **Everything starts here**. And
    because asynchronous calls occur *before*, everything that comes out
    of ActionCreator is synchronous. This is a huge win that
    significantly improves traceability and testability of the code.

- **所有Action都是从Action Creator被触发** : 从一个统一的点创建和启动所有用户的action使得查找错误变得很简单。省去了在各种Class之间查找该action的发出点,**所有的action都出自Action Creator**。因为异步调用在action发出之前已经调用，因此其他ActionCreator的函数都是同步的，这很大程度上提升了代码的可追踪性和可测试性。

## Show me the code: To-Do App
===========================

[In this example](https://github.com/lgvalle/android-flux-todo-app) you
will find a classical **To-Do App** implemented on Android using a Flux
Architecture.

[这个例子](https://github.com/lgvalle/android-flux-todo-app)是按照Flux架构实现的To-Do Android应用。

I tried to keep the project as simple as possible just to show how this
architecture can produce **very well organised apps**.

我尝试着尽量简单的演示如何使用Flux架构来构建一个组织良好的应用。

Some comments about implementation:

关于这个实现的一些解释 : 

-   The `Dispatcher` is implemented using Otto Bus. Any bus
    implementation will mostly work. There is a **Flux restriction** on
    events I’m not applying here. On original Flux definition
    dispatching an event before previous one has finish is forbidden and
    will throw an exception. To keep the project simple I’m not
    implementing that here.

- Dispatcher是使用了Otto事件总线实现。任何的事件总线也都可以的啦。在原来的Flux定义中,在上一个事件结束前就分发一个新的事件是不允许的,此时会抛出异常。为了代码比较简单，我在这个项目中并没有实现这个功能;

-   There is an `ActionsCreator` class to help creating `Actions` and
    posting them into the `Dispatcher`. It is a pretty common pattern in
    Flux which keeps things organised.
- ActionsCreator类用于创建Action和将它们投递到`Dispatcher`。在Flux中这是一种比较常见的模式。

-   `Actions` types are just `String` constants. It is probably not the
    best implementation but is quick and helps keeping things simple.
- Action类型只有字符串常量。这也许不是最好的实现,但是是最快、最能保持简洁性的。

Same thing with `Actions` data: they are just a `HashMap` with a
`String` key and `Object` as a value. This forces ugly castings on
Stores to extract actual data. Of course, this is not type safe but
again, keeps the example easy to understand.

Action中的数据也只是使用key为String、value为Object类型的`HashMap`来存储。因此这需要你在Store中进行强制类型转换，一般得到具体的Action数据。当然，这并不是类型安全的,还是那句话 : 为了保持简单性。

## 结论
==========

There is **no such thing as the Best Architecture for an Android app**.
There *is* the Best Architecture for your current app. And it is the one
that let you collaborate with your teammates easily, finish the project
on time, with quality and as less bugs as possible.

没有什么最好的Android应用架构，只有最适合你应用的架构。这个架构能够使你你和你的队友很方便地一起协作,在规定的时间内高质量的完成你的应用。

I believe Flux is very good for all of that.

我相信Flux架构在这些方面还是比较靠谱的，不信就自己动手试试吧！

## 示例代码

[代码在这里](https://github.com/lgvalle/android-flux-todo-app)

## 深度阅读

-   [Facebook Flux
    Overview](https://facebook.github.io/flux/docs/overview.html)
-   [Testing Flux
    Applications](https://facebook.github.io/flux/docs/testing-flux-applications.html#content)
-   [Flux architecture Step by
    Step](http://blogs.atlassian.com/2014/08/flux-architecture-step-by-step/)
-   [Async Requests and
    Flux](http://www.code-experience.com/async-requests-with-react-js-and-flux-revisited/)
-   [Flux and
    Android](http://armueller.github.io/android/2015/03/29/flux-and-android.html)



