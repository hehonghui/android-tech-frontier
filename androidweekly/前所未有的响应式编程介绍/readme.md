## 前所未有的响应式编程介绍
(by [@andrestaltz](https://twitter.com/andrestaltz))
---

>
* 原文链接 : [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* 译者 : [yaoqinwei](https://github.com/yaoqinwei) 
* 校对者: [yaoqinwei](https://github.com/yaoqinwei)、
* 状态 :  未完成

>译者注：校对请注意几个核心词翻译是否准确,stream、event stream、date stream，文中交替的出现，可能会把人搞糊涂，不造怎么翻译才好

So you're curious in learning this new thing called Reactive Programming, particularly its variant comprising of Rx, Bacon.js, RAC, and others.

相信你们在学习响应式编程这个新技术的时候都会充满了好奇，特别是它的一些变体，包括Rx系列、Bacon.js、RAC和其他的一些变体。

Learning it is hard, even harder by the lack of good material. When I started, I tried looking for tutorials. I found only a handful of practical guides, but they just scratched the surface and never tackled the challenge of building the whole architecture around it. Library documentations often don't help when you're trying to understand some function. I mean, honestly, look at this:

> **Rx.Observable.prototype.flatMapLatest(selector, [thisArg])**

> Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.

Holy cow.

学习响应式编程是个困难的过程，尤其是在当前缺乏优秀资料的前提下。起初，我试图寻找一些教程，却只找到了少量的实践指南，而且它们讲的都非常浅显(scratched the surface)，从来没人接受围绕着响应式编程建立一个完整知识体系的挑战。而官方文档通常也并不能完全地帮助你理解某些函数，它们通常看起来很绕，不信请看这里：

> **Rx.Observable.prototype.flatMapLatest(selector, [thisArg])**

> 根据元素下标，将可观察序列中每个元素一一映射到一个新的可观察序列当中，然后...%…………%&￥#@@……&**(晕了)

天呐，这简直太绕了！

I've read two books, one just painted the big picture, while the other dived into how to use the Reactive library. I ended up learning Reactive Programming the hard way: figuring it out while building with it. At my work in Futurice I got to use it in a real project, and had the support of some colleagues when I ran into troubles.

The hardest part of the learning journey is thinking in Reactive. It's a lot about letting go of old imperative and stateful habits of typical programming, and forcing your brain to work in a different paradigm. I haven't found any guide on the internet in this aspect, and I think the world deserves a practical tutorial on how to think in Reactive, so that you can get started. Library documentation can light your way after that. I hope this helps you.

我读过两本相关的书，一本只是在给你描绘响应式编程的伟大景象，而另一本却只是深入到如何使用响应式库而已。我在不断的构建(building)中把响应式编程了解的透彻了一些，最后以这种艰难的方式学完了响应式编程。在我工作公司的一个真实项目中我会用到它，当我遇到问题时，还可以得到同事的支持。

学习过程中最难的部分是**如何以响应式的方式来思考**，更多的意味着要摒弃那些老旧的命令式和状态式的典型编程习惯，并且强迫自己的大脑以不同的范式来运作。我还没有在网络上找到任何一个教程是从这个层面来剖析的，我觉得这个世界非常值得拥有一个优秀的实践教程来教你**如何以响应式编程的方式来思考**，方便引导你开始学习响应式编程。然后看各种库文档才可以给你更多的指引。希望这篇文章能够帮助你快速地进入**响应式编程**的世界。

## "What is Reactive Programming?"

There are plenty of bad explanations and definitions out there on the internet. [Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming) is too generic and theoretical as usual. [Stackoverflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming)'s canonical answer is obviously not suitable for newcomers. [Reactive Manifesto](http://www.reactivemanifesto.org/) sounds like the kind of thing you show to your project manager or the businessmen at your company. Microsoft's [Rx terminology](https://rx.codeplex.com/) "Rx = Observables + LINQ + Schedulers" is so heavy and Microsoftish that most of us are left confused. Terms like "reactive" and "propagation of change" don't convey anything specifically different to what your typical MV* and favorite language already does. Of course my framework views react to the models. Of course change is propagated. If it wouldn't, nothing would be rendered.

So let's cut the bullshit. 

## "什是响应式编程?"

网络上有一大堆糟糕的解释和定义，[Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)上通常都是些非常笼统和理论性的解释，[Stackoverflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming)上的一些规范的回答显然也不适合新手来参考，[Reactive Manifesto](http://www.reactivemanifesto.org/)看起来也只像是拿给你的PM或者老板看的东西，微软的[Rx术语](https://rx.codeplex.com/)"Rx = Observables + LINQ + Schedulers" 也显得太过沉重，而且充满了太多微软式的东西，反而给我们留下了更多的疑惑。相对于你使用的MV*框架以及你钟爱的编程语言，"Reactive"和"Propagation of change"这样的术语并没有传达任何有意义的概念。当然，我的view框架能够从model做出反应，我的改变当然也会传播，如果没有这些，我的界面根本就没有东西可渲染(译者：最后一句旨在说明微软的术语化的东西都非常老套、非常教科书化)。

所以，不要再扯这些废话了。

#### Reactive programming is programming with asynchronous data streams. 

In a way, this isn't anything new. Event buses or your typical click events are really an asynchronous event stream, on which you can observe and do some side effects. Reactive is that idea on steroids. You are able to create data streams of anything, not just from click and hover events. Streams are cheap and ubiquitous, anything can be a stream: variables, user inputs, properties, caches, data structures, etc. For example, imagine your Twitter feed would be a data stream in the same fashion that click events are. You can listen to that stream and react accordingly.

####  响应式编程就是与异步数据流交互的编程范式

一方面，这已经不是什么新事物了。事件总线(Event Buses)或一些典型的点击事件本质上就是一个异步事件流(asynchronous event stream)，这样你就可以观察它的变化并使其做出一些反应(产生一些效果(do some side effects))。响应式是这样的一个思路：除了点击(click)和悬停(hover)的事件外，你可以给任何事物创建数据流。数据流无处不在(Streams are cheap and ubiquitous)，任何东西都可以成为一个数据流，例如变量、用户输入、属性、缓存、数据结构等等。举个栗子，你可以把你的微博订阅功能想象成跟点击事件一样的数据流，你可以监听这样的数据流，并做出相应的反应。

**On top of that, you are given an amazing toolbox of functions to combine, create and filter any of those streams.** That's where the "functional" magic kicks in. A stream can be used as an input to another one. Even multiple streams can be used as inputs to another stream. You can _merge_ two streams. You can _filter_ a stream to get another one that has only those events you are interested in. You can _map_ data values from one stream to another new one.

If streams are so central to Reactive, let's take a careful look at them, starting with our familiar "clicks on a button" event stream.

![Click event stream](images/zclickstream.png)

A stream is a sequence of **ongoing events ordered in time**. It can emit three different things: a value (of some type), an error, or a "completed" signal. Consider that the "completed" takes place, for instance, when the current window or view containing that button is closed.

We capture these emitted events only **asynchronously**, by defining a function that will execute when a value is emitted, another function when an error is emitted, and another function when 'completed' is emitted. Sometimes these last two can be omitted and you can just focus on defining the function for values. The "listening" to the stream is called **subscribing**. The functions we are defining are observers. The stream is the subject (or "observable") being observed. This is precisely the [Observer Design Pattern](https://en.wikipedia.org/wiki/Observer_pattern).

An alternative way of drawing that diagram is with ASCII, which we will use in some parts of this tutorial:
```
--a---b-c---d---X---|->

a, b, c, d are emitted values
X is an error
| is the 'completed' signal
---> is the timeline
```
Since this feels so familiar already, and I don't want you to get bored, let's do something new: we are going to create new click event streams transformed out of the original click event stream.

**最重要的是，你会拥有一些令人惊艳的函数去结合(combine)、创建(create)和过滤(filter)任何一组数据流。** 这就是"函数式编程"的魔力所在。一个**数据流**可以作为另一个**数据流**的输入，甚至多个**数据流**也可以作为另一个**数据流**的输入。你可以_合并(merge)_两个**数据流**，也可以_过滤(filter)_一个数据流得到另一个只包含你感兴趣的事件的**数据流**，还可以_映射(map)_一个**数据流**的值到一个新的**数据流**里。

如果**数据流**对于响应式是如此的核心(so central to Reactive)，那就让我们来仔细的看看它们，先从我们熟悉的"点击一个按钮"的**事件流**开始

![Click event stream](images/zclickstream.png)

一个**数据流**是一个**按时间排序的即将发生的事件(Ongoing events ordered in time)**的序列。如上图，它可以发出3种不同的事件(上一句已经把它们叫做事件)：一个某种类型的**值事件**，一个**错误事件**和一个**完成事件**。当一个**完成事件**发生时，在某些情况下，我们可能会做这样的操作：关闭包含那个按钮的窗口或者视图组件。

我们只能**异步的**的去捕捉这些被发出的事件，这样我们就可以在发出一个**值事件**时执行一个函数，发出**错误事件**时执行一个函数，发出**完成事件**时执行另一个函数。有时候你可以忽略后两个事件，只需聚焦于如何定义和设计在发出**值事件**时要执行的函数，监听这个**事件流**的过程叫做**订阅**，我们定义的函数叫做**观察者**，而事件流就可以叫做被观察的**主题**(或者叫被观察者)。你应该察觉到了，对的，它就是[**观察者模式**](https://en.wikipedia.org/wiki/Observer_pattern)。

上面的示意图我们也可以用ASCII码的形式重新画一遍，请注意，下面的部分教程中我们会继续使用这幅图：
```
--a---b-c---d---X---|->

a, b, c, d 是值事件
X 是错误事件
| 是完成事件
---> 是时间线(轴)
```

现在你对响应式编程事件流应该非常熟悉了，为了不让你感到无聊，让我们来做一些新的尝试吧：我们将创建一个由原始点击事件流演变而来的一种新的点击事件流。

First, let's make a counter stream that indicates how many times a button was clicked. In common Reactive libraries, each stream has many functions attached to it, such as `map`, `filter`, `scan`, etc. When you call one of these functions, such as `clickStream.map(f)`, it returns a **new stream** based on the click stream. It does not modify the original click stream in any way. This is a property called **immutability**, and it goes together with Reactive streams just like pancakes are good with syrup. That allows us to chain functions like `clickStream.map(f).scan(g)`:

```
  clickStream: ---c----c--c----c------c-->
               vvvvv map(c becomes 1) vvvv
               ---1----1--1----1------1-->
               vvvvvvvvv scan(+) vvvvvvvvv
counterStream: ---1----2--3----4------5-->
```

The `map(f)` function replaces (into the new stream) each emitted value according to a function `f` you provide. In our case, we mapped to the number 1 on each click. The `scan(g)` function aggregates all previous values on the stream, producing value `x = g(accumulated, current)`, where `g` was simply the add function in this example. Then, `counterStream` emits the total number of clicks whenever a click happens.

首先，让我们来创建一个记录按钮点击次数的事件流。在常用的响应式库中，每个事件流都会附有一些函数，例如 `map`, `filter`, `scan`等，当你调用这其中的一个方法时，比如`clickStream.map(f)`，它会返回基于点击事件流的一个**新事件流**。它不会对原来的点击事件流做任何的修改。这种特性叫做**不可变性(immutability)**，而且它可以和响应式事件流搭配在一起使用，就像煎饼和糖浆一样完美的搭配。这样我们可以用链式函数的方式来调用，例如：`clickStream.map(f).scan(g)`:

```
  clickStream: ---c----c--c----c------c-->
               vvvvv map(c becomes 1) vvvv
               ---1----1--1----1------1-->
               vvvvvvvvv scan(+) vvvvvvvvv
counterStream: ---1----2--3----4------5-->
```

`map(f)`函数会根据你提供的`f`函数把原事件流中每一个返回值分别映射到新的事件流中。在上图的例子中，我们把每一次点击事件都映射成数字1，`scan(g)`函数则把之前映射的值聚集起来，然后根据`x = g(accumulated, current)`算法来作相应的处理，而本例的`g`函数其实就是简单的加法函数。然后，当一个点击事件发生时，`counterStream`函数则上报当前点击事件总数。

To show the real power of Reactive, let's just say that you want to have a stream of "double click" events. To make it even more interesting, let's say we want the new stream to consider triple clicks as double clicks, or in general, multiple clicks (two or more). Take a deep breath and imagine how you would do that in a traditional imperative and stateful fashion. I bet it sounds fairly nasty and involves some variables to keep state and some fiddling with time intervals.

Well, in Reactive it's pretty simple. In fact, the logic is just [4 lines of code](http://jsfiddle.net/staltz/4gGgs/27/).
But let's ignore code for now. Thinking in diagrams is the best way to understand and build streams, whether you're a beginner or an expert.

![Multiple clicks stream](images/zmulticlickstream.png)

Grey boxes are functions transforming one stream into another. First we accumulate clicks in lists, whenever 250 milliseconds of "event silence" has happened (that's what `buffer(stream.throttle(250ms))` does, in a nutshell. Don't worry about understanding the details at this point, we are just demoing Reactive for now). The result is a stream of lists, from which we apply `map()` to map each list to an integer matching the length of that list. Finally, we ignore `1` integers using the `filter(x >= 2)` function. That's it: 3 operations to produce our intended stream. We can then subscribe ("listen") to it to react accordingly how we wish.

I hope you enjoy the beauty of this approach. This example is just the tip of the iceberg: you can apply the same operations on different kinds of streams, for instance, on a stream of API responses; on the other hand, there are many other functions available.

为了展示响应式编程真正的魅力，我们假设你有一个"双击"事件流，为了让它更有趣，我们假设这个事件流同时处理"三次点击"或者"多次点击"事件，然后深吸一口气想想如何用传统的命令式和状态式的方式来处理，我敢打赌，这么做会相当的讨厌，其中还要涉及到一些变量来保存状态，并且还得做一些时间间隔的调整。

而用响应式编程的方式处理会非常的简洁，实际上，逻辑处理部分只需要[四行代码](http://jsfiddle.net/staltz/4gGgs/27/)。但是，当前阶段让我们现忽略代码的部分，无论你是新手还是专家，看着图表思考来理解和建立事件流将是一个非常棒的方法。

![多次点击事件流](images/zmulticlickstream.png)

图中，灰色盒子表示将上面的事件流转换下面的事件流的**函数**过程，首先根据250毫秒的间隔时间(event silence, 译者：无事件发生的时间段，上一个事件发生到下一个事件发生的间隔时间)把点击事件流一段一隔开，再将每一段的一个或多个点击事件添加到列表中(这就是这个函数：`buffer(stream.throttle(250ms))`所做的事情，当前我们先不要急着去理解细节，我们只需专注响应式的部分先)。现在我们得到的是多个含有事件流的列表，然后我们使用了`map()`中的函数来算出每一个列表长度的整数数值映射到下一个事件流当中。最后我们使用了过滤`filter(x >= 2)` 函数忽略掉了小于`1` 的整数。就这样，我们用了3步操作生成了我们想要的事件流，接下来，我们就可以订阅("监听")这个事件并作出我们想要的操作了。

我希望你能感受到这个示例的优雅之处。当然了，这个示例也只是响应式编程魔力的冰山一角而已，你同样可以将这3步操作应用到不同种类的事件流中去，例如，一串API响应的事件流。另一方面，你还有非常多的函数可以使用。

## "Why should I consider adopting RP?"

Reactive Programming raises the level of abstraction of your code so you can focus on the interdependence of events that define the business logic, rather than having to constantly fiddle with a large amount of implementation details. Code in RP will likely be more concise.

The benefit is more evident in modern webapps and mobile apps that are highly interactive with a multitude of UI events related to data events. 10 years ago, interaction with web pages was basically about submitting a long form to the backend and performing simple rendering to the frontend. Apps have evolved to be more real-time: modifying a single form field can automatically trigger a save to the backend, "likes" to some content can be reflected in real time to other connected users, and so forth.

Apps nowadays have an abundancy of real-time events of every kind that enable a highly interactive experience to the user. We need tools for properly dealing with that, and Reactive Programming is an answer.

## "我为什么要采用响应式编程？"

响应式编程可以提高你的代码抽象级别，好让你可以专注于定义与事件相互依存的业务逻辑，而不是把大量精力放在实现细节上，使用响应式编程会让你的代码变得更加简洁。

特别对于现在流行的webapps和mobile apps，这些频繁与数据事件相关的大量UI事件交互的程序，好处就更加的明显了。十年前，web页面的交互是通过提交一个很长的表单数据到后端，然后再做一些简单的前端渲染操作。而现在的Apps则演变的更具有实时性：仅仅修改一个单独的表单域就能自动的触发保存到后端的代码，就像某个用户对一些内容点了赞，就能够实时反映到其他已连接的用户一样，等等。

当今的Apps都含有丰富的实时事件来保证一个高效的用户体验，我们就需要采用一个合适的工具来处理，那么响应式编程就正好是我们想要的答案。

## Thinking in RP, with examples

Let's dive into the real stuff. A real-world example with a step-by-step guide on how to think in RP. No synthetic examples, no half-explained concepts. By the end of this tutorial we will have produced real functioning code, while knowing why we did each thing.

I picked **JavaScript** and **[RxJS](https://github.com/Reactive-Extensions/RxJS)** as the tools for this, for a reason: JavaScript is the most familiar language out there at the moment, and the [Rx* library family](http://www.reactivex.io) is widely available for many languages and platforms ([.NET](https://rx.codeplex.com/), [Java](https://github.com/Netflix/RxJava), [Scala](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-scala), [Clojure](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-clojure),  [JavaScript](https://github.com/Reactive-Extensions/RxJS), [Ruby](https://github.com/Reactive-Extensions/Rx.rb), [Python](https://github.com/Reactive-Extensions/RxPy), [C++](https://github.com/Reactive-Extensions/RxCpp), [Objective-C/Cocoa](https://github.com/ReactiveCocoa/ReactiveCocoa), [Groovy](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-groovy), etc). So whatever your tools are, you can concretely benefit by following this tutorial.

## 以响应式编程方式思考的例子

让我们深入到一些真实的例子，一个能够一步一步教你如何以响应式编程的方式思考的例子，没有虚构的示例，没有一知半解的概念。在这个教程的末尾我们将产生一些真实的函数代码，并能够知晓每一步为什么那样做的原因(知其然，知其所以然)。

我选了**JavaScript**和**[RxJS](https://github.com/Reactive-Extensions/RxJS)**来作为本教程的编程语言，原因是：JavaScript是目前最多人熟悉的语言，而[Rx系列的库](http://www.reactivex.io)对于很多语言和平台的运用是非常广泛的，例如([.NET](https://rx.codeplex.com/), [Java](https://github.com/Netflix/RxJava), [Scala](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-scala), [Clojure](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-clojure),  [JavaScript](https://github.com/Reactive-Extensions/RxJS), [Ruby](https://github.com/Reactive-Extensions/Rx.rb), [Python](https://github.com/Reactive-Extensions/RxPy), [C++](https://github.com/Reactive-Extensions/RxCpp), [Objective-C/Cocoa](https://github.com/ReactiveCocoa/ReactiveCocoa), [Groovy](https://github.com/Netflix/RxJava/tree/master/language-adaptors/rxjava-groovy)等等。所以，无论你用的是什么语言、库、工具，你都能从下面这个教程中学到东西(从中受益)。

## Implementing a "Who to follow" suggestions box

In Twitter there is this UI element that suggests other accounts you could follow:

![Twitter Who to follow suggestions box](images/ztwitterbox.png)

We are going to focus on imitating its core features, which are:

* On startup, load accounts data from the API and display 3 suggestions
* On clicking "Refresh", load 3 other account suggestions into the 3 rows
* On click 'x' button on an account row, clear only that current account and display another
* Each row displays the account's avatar and links to their page

We can leave out the other features and buttons because they are minor. And, instead of Twitter, which recently closed its API to the unauthorized public, let's build that UI for following people on Github. There's a [Github API for getting users](https://developer.github.com/v3/users/#get-all-users).

The complete code for this is ready at http://jsfiddle.net/staltz/8jFJH/48/ in case you want to take a peak already.

## 实现一个推荐关注(Who to follow)的功能

在Twitter里有一个UI元素向你推荐你可以关注的用户，如下图：

![Twitter Who to follow suggestions box](images/ztwitterbox.png)

我们将聚焦于模仿它的主要功能，它们是：

* 开始阶段，从API加载推荐关注的用户账户数据，然后显示三个推荐用户
* 点击刷新，加载另外三个推荐用户到当前的三行中显示
* 点击每一行的推荐用户上的'x'按钮，清楚当前被点击的用户，并显示新的一个用户到当前行
* 每一行显示一个用户的头像并且在点击之后可以链接到他们的主页。

我们可以先不管其他的功能和按钮，因为它们是次要的。因为Twitter最近关闭了未经授权的公共API调用，我们将用[Github获取用户的API](https://developer.github.com/v3/users/#get-all-users)代替，并且以此来构建我们的UI。

如果你想先看一下最终效果，这里有完成后的[代码](http://jsfiddle.net/staltz/8jFJH/48/)。

## Request and response

**How do you approach this problem with Rx?** Well, to start with, (almost) _everything can be a stream_. That's the Rx mantra. Let's start with the easiest feature: "on startup, load 3 accounts data from the API". There is nothing special here, this is simply about (1) doing a request, (2) getting a response, (3) rendering the response. So let's go ahead and represent our requests as a stream. At first this will feel like overkill, but we need to start from the basics, right?

On startup we need to do only one request, so if we model it as a data stream, it will be a stream with only one emitted value. Later, we know we will have many requests happening, but for now, it is just one.

```
--a------|->

Where a is the string 'https://api.github.com/users'
```

This is a stream of URLs that we want to request. Whenever a request event happens, it tells us two things: when and what. "When" the request should be executed is when the event is emitted. And "what" should be requested is the value emitted: a string containing the URL.

To create such stream with a single value is very simple in Rx*. The official terminology for a stream is "Observable", for the fact that it can be observed, but I find it to be a silly name, so I call it _stream_.

```javascript
var requestStream = Rx.Observable.just('https://api.github.com/users');
```

But now, that is just a stream of strings, doing no other operation, so we need to somehow make something happen when that value is emitted. That's done by [subscribing](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypesubscribeobserver--onnext-onerror-oncompleted) to the stream.

```javascript
requestStream.subscribe(function(requestUrl) {
  // execute the request
  jQuery.getJSON(requestUrl, function(responseData) {
    // ...
  });
}
```

## Request和Response

**在Rx中是怎么处理这个问题呢？**，在开始之前，我们要明白，(几乎)_一切都可以成为一个事件流_，这就是Rx的准则(mantra)。让我们从最简单的功能开始："开始阶段，从API加载推荐关注的用户账户数据，然后显示三个推荐用户"。其实这个功能没什么特殊的，简单的步骤分为： (1)发出一个请求，(2)获取响应数据，(3)渲染响应数据。ok，让我们把请求作为一个事件流，一开始你可能会觉得这样做有些夸张，但别急，我们也得从最基本的开始，不是吗？

开始时我们只需做一次请求，如果我们把它作为一个数据流的话，它只能成为一个仅仅返回一个值的事件流而已。一会儿我们还会有很多请求要做，但当前，只有一个。

```
--a------|->

a就是字符串：'https://api.github.com/users'
```

这是一个我们要请求的URL事件流。每当发生一个请求时，它将告诉我们两件事：**什么时候**和**做了什么事**(when and what)。**什么时候**请求被执行，什么时候事件就被发出。而**做了什么**就是请求了什么，也就是请求的URL字符串。

在Rx中，创建返回一个值的事件流是非常简单的。其实事件流在Rx里的术语是叫"被观察者"，也就是说它是可以被观察的，但是我发现这名字比较傻，所以我更喜欢把它叫做_事件流_。

```javascript
var requestStream = Rx.Observable.just('https://api.github.com/users');
```

但现在，这只是一个字符串的事件流而已，并没有做其他操作，所以我们需要在发出这个值的时候做一些我们要做的操作，可以通过[订阅(subscribing)](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypesubscribeobserver--onnext-onerror-oncompleted)这个事件来实现。

```javascript
requestStream.subscribe(function(requestUrl) {
  // execute the request
  jQuery.getJSON(requestUrl, function(responseData) {
    // ...
  });
}
```

Notice we are using a jQuery Ajax callback (which we assume you [should know already](http://devdocs.io/jquery/jquery.getjson)) to handle the asynchronicity of the request operation. But wait a moment, Rx is for dealing with **asynchronous** data streams. Couldn't the response for that request be a stream containing the data arriving at some time in the future? Well, at a conceptual level, it sure looks like it, so let's try that.

```javascript
requestStream.subscribe(function(requestUrl) {
  // execute the request
  var responseStream = Rx.Observable.create(function (observer) {
    jQuery.getJSON(requestUrl)
    .done(function(response) { observer.onNext(response); })
    .fail(function(jqXHR, status, error) { observer.onError(error); })
    .always(function() { observer.onCompleted(); });
  });
  
  responseStream.subscribe(function(response) {
    // do something with the response
  });
}
```

What [`Rx.Observable.create()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservablecreatesubscribe) does is create your own custom stream by explicitly informing each observer (or in other words, a "subscriber") about data events (`onNext()`) or errors (`onError()`). What we did was just wrap that jQuery Ajax Promise. **Excuse me, does this mean that a Promise is an Observable?**

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;

![Amazed](images/3324-amazed-face.gif)

注意到我们这里使用的是JQuery的AJAX回调方法(我们假设你[已经很了解JQuery和AJAX了](http://devdocs.io/jquery/jquery.getjson))来的处理这个异步的请求操作。但是，请稍等一下，Rx就是用来处理**异步数据流**的，难道它就不能处理来自请求(request)在未来某个时间响应(response)的数据流吗？好吧，理论上是可以的，让我们尝试一下。

```javascript
requestStream.subscribe(function(requestUrl) {
  // execute the request
  var responseStream = Rx.Observable.create(function (observer) {
    jQuery.getJSON(requestUrl)
    .done(function(response) { observer.onNext(response); })
    .fail(function(jqXHR, status, error) { observer.onError(error); })
    .always(function() { observer.onCompleted(); });
  });
  
  responseStream.subscribe(function(response) {
    // do something with the response
  });
}
```

[`Rx.Observable.create()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservablecreatesubscribe)操作就是在创建自己定制的事件流，且对于数据事件(`onNext()`)和错误事件(`onError()`)都会显示的通知该事件每一个观察者(或订阅者)。我们做的只是小小的封装一下jQuery Ajax Promise而已。**等等，这是否意味者jQuery Ajax Promise本质上就是一个被观察者呢(Observable)？**

&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;

![Amazed](images/3324-amazed-face.gif)

Yes.

Observable is Promise++. In Rx you can easily convert a Promise to an Observable by doing `var stream = Rx.Observable.fromPromise(promise)`, so let's use that. The only difference is that Observables are not [Promises/A+](http://promises-aplus.github.io/promises-spec/) compliant, but conceptually there is no clash. A Promise is simply an Observable with one single emitted value. Rx streams go beyond promises by allowing many returned values.

This is pretty nice, and shows how Observables are at least as powerful as Promises. So if you believe the Promises hype, keep an eye on what Rx Observables are capable of.

Now back to our example, if you were quick to notice, we have one `subscribe()` call inside another, which is somewhat akin to callback hell. Also, the creation of `responseStream` is dependent on `requestStream`. As you heard before, in Rx there are simple mechanisms for transforming and creating new streams out of others, so we should be doing that. 

The one basic function that you should know by now is [`map(f)`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypemapselector-thisarg), which takes each value of stream A, applies `f()` on it, and produces a value on stream B. If we do that to our request and response streams, we can map request URLs to response Promises (disguised as streams). 

```javascript
var responseMetastream = requestStream
  .map(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });
```

Then we will have created a beast called "_metastream_": a stream of streams. Don't panic yet. A metastream is a stream where each emitted value is yet another stream. You can think of it as [pointers](https://en.wikipedia.org/wiki/Pointer_(computer_programming)): each emitted value is a _pointer_ to another stream. In our example, each request URL is mapped to a pointer to the promise stream containing the corresponding response.

![Response metastream](images/zresponsemetastream.png)

是的。

Promise++就是被观察者(Observable)，在Rx里你可以使用这样的操作：`var stream = Rx.Observable.fromPromise(promise)`，就可以很轻松的将Promise转换成一个被观察者(Observable)，如此方便，让我们现在就开始使用它吧。不同的是，这些被观察者都不能兼容[Promises/A+](http://promises-aplus.github.io/promises-spec/)，但理论上并不冲突。一个Promise就是一个只有一个返回值的简单的被观察者，而Rx就远超于Promise，它允许多个值返回。

这样更好，这样更突出被观察者至少比Promise强大，所以如果你相信Promise宣传的东西，那么也请留意一下响应式编程能胜任些什么。

现在回到示例当中，你应该能快速发现，我们在`subscribe()`方法的内部再次调用了`subscribe()`方法，这有点类似于回调地狱(callback hell)，而且`responseStream`的创建也是依赖于`requestStream`的。在之前我们说过，在Rx里，有很多很简单的机制来从其他事件流的转化并创建出一些新的事件流，那么，我们也应该这样做试试。

现在你需要了解的一个最基本的函数是[`map(f)`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypemapselector-thisarg)，它可以从事件流A中取出每一个值，并对每一个值执行`f()`函数，然后将产生的新值填充到事件流B。如果将它应用到我们的请求和响应事件流当中，那我们就可以将请求的URL映射到一个响应Promises上了(伪装成数据流)。

```javascript
var responseMetastream = requestStream
  .map(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });
```

然后，我们创造了一个叫做"_metastream_"的怪兽：一个装载了事件流的事件流。先别惊慌，metastream就是每一个发出的值都是另一个事件流的事件流，你看把它想象成一个[指针(pointers)]((https://en.wikipedia.org/wiki/Pointer_(computer_programming))数组：每一个单独发出的值就是一个_指针_，它指向另一个事件流。在我们的示例里，每一个请求URL都映射到一个指向包含响应数据的promise数据流。

![Response metastream](images/zresponsemetastream.png)

A metastream for responses looks confusing, and doesn't seem to help us at all. We just want a simple stream of responses, where each emitted value is a JSON object, not a 'Promise' of a JSON object. Say hi to [Mr. Flatmap](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypeflatmapselector-resultselector): a version of `map()` than "flattens" a metastream, by emitting on the "trunk" stream everything that will be emitted on "branch" streams. Flatmap is not a "fix" and metastreams are not a bug, these are really the tools for dealing with asynchronous responses in Rx.

```javascript
var responseStream = requestStream
  .flatMap(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });
```

![Response stream](images/zresponsestream.png)

Nice. And because the response stream is defined according to request stream, **if** we have later on more events happening on request stream, we will have the corresponding response events happening on response stream, as expected:

```
requestStream:  --a-----b--c------------|->
responseStream: -----A--------B-----C---|->

(lowercase is a request, uppercase is its response)
```

Now that we finally have a response stream, we can render the data we receive:

```javascript
responseStream.subscribe(function(response) {
  // render `response` to the DOM however you wish
});
```

Joining all the code until now, we have:

```javascript
var requestStream = Rx.Observable.just('https://api.github.com/users');

var responseStream = requestStream
  .flatMap(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });

responseStream.subscribe(function(response) {
  // render `response` to the DOM however you wish
});
```

一个响应的metastream，看起来确实让人容易困惑，看样子对我们一点帮助也没有。我们只想要一个简单的响应数据流，每一个发出的值是一个简单的JSON对象就行，而不是一个'Promise' 的JSON对象。ok，让我们来见识一下另一个函数：[Flatmap](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypeflatmapselector-resultselector)，它是`map()`函数的另一个版本，它比metastream更扁平。一切在"主躯干"事件流发出的事件都将在"分支"事件流中发出。Flatmap并不是metastreams的修复版，metastreams也不是一个bug。它俩在Rx中都是处理异步响应事件的好工具、好帮手。

```javascript
var responseStream = requestStream
  .flatMap(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });
```

![Response stream](images/zresponsestream.png)

很赞，因为我们的响应事件流是根据请求事件流定义的，**如果**我们以后有更多事件发生在请求事件流的话，我们也将会在相应的响应事件流收到响应事件，就如所期待的那样：

```
requestStream:  --a-----b--c------------|->
responseStream: -----A--------B-----C---|->

(小写的是请求事件流, 大写的是响应事件流)
```

现在，我们终于有响应的事件流了，并且可以用我们收到的数据来渲染了：

```javascript
responseStream.subscribe(function(response) {
  // render `response` to the DOM however you wish
});
```

让我们把所有代码合起来，看一下：

```javascript
var requestStream = Rx.Observable.just('https://api.github.com/users');

var responseStream = requestStream
  .flatMap(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });

responseStream.subscribe(function(response) {
  // render `response` to the DOM however you wish
});
```

## The refresh button

I did not yet mention that the JSON in the response is a list with 100 users. The API only allows us to specify the page offset, and not the page size, so we're using just 3 data objects and wasting 97 others. We can ignore that problem for now, since later on we will see how to cache the responses.

Everytime the refresh button is clicked, the request stream should emit a new URL, so that we can get a new response. We need two things: a stream of click events on the refresh button (mantra: anything can be a stream), and we need to change the request stream to depend on the refresh click stream. Gladly, RxJS comes with tools to make Observables from event listeners.

```javascript
var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
```

Since the refresh click event doesn't itself carry any API URL, we need to map each click to an actual URL. Now we change the request stream to be the refresh click stream mapped to the API endpoint with a random offset parameter each time.

```javascript
var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

Because I'm dumb and I don't have automated tests, I just broke one of our previously built features. A request doesn't happen anymore on startup, it happens only when the refresh is clicked. Urgh. I need both behaviors: a request when _either_ a refresh is clicked _or_ the webpage was just opened.

## 刷新按钮

我还没提到本次响应的JSON数据是含有100个用户数据的list，这个API只允许指定页面偏移量(page offset)，而不能指定每页大小(page size)，我们只用到了3个用户数据而浪费了其他97个，现在可以先忽略这个问题，稍后我们将学习如何缓存响应的数据。

每当刷新按钮被点击，请求事件流就会发出一个新的URL值，这样我们就可以获取新的响应数据。这里我们需要两个东西：点击刷新按钮的事件流(准则：一切都能作为事件流)，我们需要将点击刷新按钮的事件流作为请求事件流的依赖(即点击刷新事件流会引起请求事件流)。幸运的是，RxJS已经有了可以从事件监听者转换成被观察者的方法了。

```javascript
var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
```

因为刷新按钮点击事件不会携带将要请求的API的URL，我们需要将每次的点击映射到一个实际的URL上，现在我们将请求事件流转换成了一个点击事件流，并将每次的点击映射成一个随机的页面偏移量(offset)参数来组成API的URL。

```javascript
var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

因为我比较笨而且也没有使用自动化测试，所以我刚把之前做好的一个功能搞烂了。这样，请求在一开始的时候就不会执行，而只有在点击事件发生时才会执行。我们需要的是两种情况都要执行：刚开始打开网页和点击刷新按钮都会执行的请求。

We know how to make a separate stream for each one of those cases:

```javascript
var requestOnRefreshStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
  
var startupRequestStream = Rx.Observable.just('https://api.github.com/users');
```

But how can we "merge" these two into one? Well, there's [`merge()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypemergemaxconcurrent--other). Explained in the diagram dialect, this is what it does:

```
stream A: ---a--------e-----o----->
stream B: -----B---C-----D-------->
          vvvvvvvvv merge vvvvvvvvv
          ---a-B---C--e--D--o----->
```

我们知道如何为每一种情况做一个单独的事件流：

```javascript
var requestOnRefreshStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
  
var startupRequestStream = Rx.Observable.just('https://api.github.com/users');
```

但是我们是否可以将这两个合并成一个呢？没错，是可以的，我们可以使用[`merge()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypemergemaxconcurrent--other)方法来实现。下图可以解释`merge()`函数的用处：

```
stream A: ---a--------e-----o----->
stream B: -----B---C-----D-------->
          vvvvvvvvv merge vvvvvvvvv
          ---a-B---C--e--D--o----->
```

It should be easy now:

```javascript
var requestOnRefreshStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
  
var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

var requestStream = Rx.Observable.merge(
  requestOnRefreshStream, startupRequestStream
);
```

There is an alternative and cleaner way of writing that, without the intermediate streams.

```javascript
var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
  .merge(Rx.Observable.just('https://api.github.com/users'));
```

现在做起来应该很简单：

```javascript
var requestOnRefreshStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
  
var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

var requestStream = Rx.Observable.merge(
  requestOnRefreshStream, startupRequestStream
);
```

还有一个更干净的写法，省去了中间事件流变量：

```javascript
var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
  .merge(Rx.Observable.just('https://api.github.com/users'));
```

甚至可以更简短，更具有可读性：
```javascript
var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
  .startWith('https://api.github.com/users');
```

The [`startWith()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypestartwithscheduler-args) function does exactly what you think it does. No matter how your input stream looks like, the output stream resulting of `startWith(x)` will have `x` at the beginning. But I'm not [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself) enough, I'm repeating the API endpoint string. One way to fix this is by moving the `startWith()` close to the `refreshClickStream`, to essentially "emulate" a refresh click on startup.  

```javascript
var requestStream = refreshClickStream.startWith('startup click')
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

Nice. If you go back to the point where I "broke the automated tests", you should see that the only difference with this last approach is that I added the `startWith()`.

[`startWith()`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypestartwithscheduler-args)函数做的事和你预期的完全一样。无论你的输入事件流是怎样的，使用`startWith(x)`函数处理过后输出的事件流一定是一个`x` 开头的结果。但是我没有总是[重复代码( DRY)](https://en.wikipedia.org/wiki/Don't_repeat_yourself)，我只是在重复API的URL字符串，改进的方法是将 `startWith()`函数挪到`refreshClickStream`那里，这样就可以在启动时，模拟一个刷新按钮的点击事件了。

```javascript
var requestStream = refreshClickStream.startWith('startup click')
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

不错，如果你倒回到"搞烂了的自动测试"的地方，然后再对比这两个地方，你会发现我仅仅是加了一个`startWith()`函数而已。

## Modelling the 3 suggestions with streams

Until now, we have only touched a _suggestion_ UI element on the rendering step that happens in the responseStream's `subscribe()`. Now with the refresh button, we have a problem: as soon as you click 'refresh', the current 3 suggestions are not cleared. New suggestions come in only after a response has arrived, but to make the UI look nice, we need to clean out the current suggestions when clicks happen on the refresh.

```javascript
refreshClickStream.subscribe(function() {
  // clear the 3 suggestion DOM elements 
});
```

No, not so fast, pal. This is bad, because we now have **two** subscribers that affect the suggestion DOM elements (the other one being `responseStream.subscribe()`), and that doesn't really sound like [Separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). Remember the Reactive mantra? 

&nbsp;
&nbsp;
&nbsp;
&nbsp;

![Mantra](http://i.imgur.com/AIimQ8C.jpg)

## 用事件流将那3个推荐的用户数据模型化

直到现在，我们在响应事件流(responseStream)的订阅(`subscribe()`)的步骤里只是稍微提了一下渲染_推荐关注_的UI而已。现在有了刷新按钮，我们就会出现一个问题：当你点击了刷新按时，当前的三个推荐关注的用户数据却没有清楚，而新的推荐关注的用户数据在点击后响应的数据中就拿到了，为了让UI看起来更漂亮，我们需要在点击刷新按钮的事件发生的时候清楚当前的三个推荐关注的用户数据。

```javascript
refreshClickStream.subscribe(function() {
  // clear the 3 suggestion DOM elements 
});
```

不，老兄，还没那么快。我们又出现了新的问题，因为我们现在有两个订阅者在影响着推荐关注的UI DOM元素(另一个是 `responseStream.subscribe()`)，这样听起来并不像是[关注分离(Separation of concerns)](https://en.wikipedia.org/wiki/Separation_of_concerns)，还记得响应式编程的原则么？

&nbsp;
&nbsp;
&nbsp;
&nbsp;

![Mantra](http://i.imgur.com/AIimQ8C.jpg)

So let's model a suggestion as a stream, where each emitted value is the JSON object containing the suggestion data. We will do this separately for each of the 3 suggestions. This is how the stream for suggestion #1 could look like:

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  });
```

The others, `suggestion2Stream` and `suggestion3Stream` can be simply copy pasted from `suggestion1Stream`. This is not DRY, but it will keep our example simple for this tutorial, plus I think it's a good exercise to think how to avoid repetition in this case.

现在，让我们把推荐关注的用户数据模型化，它们每个发出的值就是一个包含了推荐关注用户数据的JSON对象。我们将把这三个用户数据分开处理，下面是推荐关注的1号用户数据的事件流：

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  });
```

其他的，如推荐关注的2号用户数据的事件流`suggestion2Stream`和推荐关注的3号用户数据的事件流`suggestion3Stream` 都可以方便的从`suggestion3Stream` 拷贝粘贴就好。这样并不是**重复代码**，这是为让我们的示例更加简单，而且我认为这是一个思考如何避免**重复代码**的一次好的经历。

Instead of having the rendering happen in responseStream's subscribe(), we do that here:

```javascript
suggestion1Stream.subscribe(function(suggestion) {
  // render the 1st suggestion to the DOM
});
```

Back to the "on refresh, clear the suggestions", we can simply map refresh clicks to `null` suggestion data, and include that in the `suggestion1Stream`, as such:

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  })
  .merge(
    refreshClickStream.map(function(){ return null; })
  );
```

And when rendering, we interpret `null` as "no data", hence hiding its UI element.

```javascript
suggestion1Stream.subscribe(function(suggestion) {
  if (suggestion === null) {
    // hide the first suggestion DOM element
  }
  else {
    // show the first suggestion DOM element
    // and render the data
  }
});
```

我们不在responseStream的subscribe()中处理渲染了，我们这样处理：

```javascript
suggestion1Stream.subscribe(function(suggestion) {
  // render the 1st suggestion to the DOM
});
```

回到"当刷新时，清理掉当前的推荐关注的用户数据"，我们可以很简单的把刷新点击映射为null(即没有推荐数据)，并且在`suggestion1Stream`中包含进来，如下：

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  })
  .merge(
    refreshClickStream.map(function(){ return null; })
  );
```

当渲染时，我们将 `null`解释为"没有数据"，然后把UI元素隐藏起来。

```javascript
suggestion1Stream.subscribe(function(suggestion) {
  if (suggestion === null) {
    // hide the first suggestion DOM element
  }
  else {
    // show the first suggestion DOM element
    // and render the data
  }
});
```

The big picture is now:

```
refreshClickStream: ----------o--------o---->
     requestStream: -r--------r--------r---->
    responseStream: ----R---------R------R-->   
 suggestion1Stream: ----s-----N---s----N-s-->
 suggestion2Stream: ----q-----N---q----N-q-->
 suggestion3Stream: ----t-----N---t----N-t-->
```

Where `N` stands for `null`.

As a bonus, we can also render "empty" suggestions on startup. That is done by adding `startWith(null)` to the suggestion streams:

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  })
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

Which results in:

```
refreshClickStream: ----------o---------o---->
     requestStream: -r--------r---------r---->
    responseStream: ----R----------R------R-->   
 suggestion1Stream: -N--s-----N----s----N-s-->
 suggestion2Stream: -N--q-----N----q----N-q-->
 suggestion3Stream: -N--t-----N----t----N-t-->
```

现在我们的一个大的示意图是这样的：

```
refreshClickStream: ----------o--------o---->
     requestStream: -r--------r--------r---->
    responseStream: ----R---------R------R-->   
 suggestion1Stream: ----s-----N---s----N-s-->
 suggestion2Stream: ----q-----N---q----N-q-->
 suggestion3Stream: ----t-----N---t----N-t-->
```

里面`N`代表`null`

作为一种补充，我们也可以在一开始的时候就渲染空的推荐内容。这通过把startWith(null)添加到推荐关注事件就完成了：

```javascript
var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  })
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

最后的结果，数据量是这样的：

```
refreshClickStream: ----------o---------o---->
     requestStream: -r--------r---------r---->
    responseStream: ----R----------R------R-->   
 suggestion1Stream: -N--s-----N----s----N-s-->
 suggestion2Stream: -N--q-----N----q----N-q-->
 suggestion3Stream: -N--t-----N----t----N-t-->
```

## Closing a suggestion and using cached responses

There is one feature remaining to implement. Each suggestion should have its own 'x' button for closing it, and loading another in its place. At first thought, you could say it's enough to make a new request when any close button is clicked:

```javascript
var close1Button = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(close1Button, 'click');
// and the same for close2Button and close3Button

var requestStream = refreshClickStream.startWith('startup click')
  .merge(close1ClickStream) // we added this
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

That does not work. It will close and reload _all_ suggestions, rather than just only the one we clicked on. There are a couple of different ways of solving this, and to keep it interesting, we will solve it by reusing previous responses. The API's response page size is 100 users while we were using just 3 of those, so there is plenty of fresh data available. No need to request more.

## 推荐关注的关闭和使用已缓存的响应数据(responses)

只剩这一个功能没有实现了，每个推荐关注的用户数据UI会有一个自己的'x'按钮来关闭自己，然后在当前的用户数据UI中加载另一个推荐关注的用户数据。最初的想法是：点击任何关闭按钮时都需要发起一个新的请求：

```javascript
var close1Button = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(close1Button, 'click');
// and the same for close2Button and close3Button

var requestStream = refreshClickStream.startWith('startup click')
  .merge(close1ClickStream) // we added this
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });
```

这样没什么效果，这样会关闭并且重新加载_全部_的推荐关注的用户数据，而不是仅仅处理我们点击的那一个。这里有几种方式来解决这个问题，并且让它变得有趣，我们将重用之前的请求数据来解决这个问题。这个API响应的每页的数据大小是100个用户数据，而我们只使用了其中三个，所以还剩一大堆未使用的数据，不用去请求更多数据了。

Again, let's think in streams. When a 'close1' click event happens, we want to use the _most recently emitted_ response on `responseStream` to get one random user from the list in the response. As such:

```
    requestStream: --r--------------->
   responseStream: ------R----------->
close1ClickStream: ------------c----->
suggestion1Stream: ------s-----s----->
```

In Rx* there is a combinator function called [`combineLatest`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypecombinelatestargs-resultselector) that seems to do what we need. It takes two streams A and B as inputs, and whenever either stream emits a value, `combineLatest` joins the two most recently emitted values `a` and `b` from both streams and outputs a value `c = f(x,y)`, where `f` is a function you define. It is better explained with a diagram:

```
stream A: --a-----------e--------i-------->
stream B: -----b----c--------d-------q---->
          vvvvvvvv combineLatest(f) vvvvvvv
          ----AB---AC--EC---ED--ID--IQ---->

where f is the uppercase function
```

ok，再来，我们继续用事件流的方式来思考。当'close1'点击事件发生时，我们想要使用_最近发出的_响应数据，并执行`responseStream`函数来从响应列表里随机的抽出一个用户数据来，就像下面这样：

```
    requestStream: --r--------------->
   responseStream: ------R----------->
close1ClickStream: ------------c----->
suggestion1Stream: ------s-----s----->
```

在Rx家族中一个组合函叫做[`combineLatest`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypecombinelatestargs-resultselector)应该是我们需要的。这个函数会把两个事件流A和B作为输入，并且无论哪一个事件流发出一个值了，`combineLatest` 函数就会将两个从两个事件流最近发出的值`a`和`b`联合起来，并执行你定义的`f`函数的算法`c = f(x,y)`将两个值组成一个输入值，下面用图表来解释会更加清晰：

```
stream A: --a-----------e--------i-------->
stream B: -----b----c--------d-------q---->
          vvvvvvvv combineLatest(f) vvvvvvv
          ----AB---AC--EC---ED--ID--IQ---->

f是转换成大写的函数
```

We can apply combineLatest() on `close1ClickStream` and `responseStream`, so that whenever the close 1 button is clicked, we get the latest response emitted and produce a new value on `suggestion1Stream`. On the other hand, combineLatest() is symmetric: whenever a new response is emitted on `responseStream`, it will combine with the latest 'close 1' click to produce a new suggestion. That is interesting, because it allows us to simplify our previous code for `suggestion1Stream`, like this:

```javascript
var suggestion1Stream = close1ClickStream
  .combineLatest(responseStream,             
    function(click, listUsers) {
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

One piece is still missing in the puzzle. The combineLatest() uses the most recent of the two sources, but if one of those sources hasn't emitted anything yet, combineLatest() cannot produce a data event on the output stream. If you look at the ASCII diagram above, you will see that the output has nothing when the first stream emitted value `a`. Only when the second stream emitted value `b` could it produce an output value.

There are different ways of solving this, and we will stay with the simplest one, which is simulating a click to the 'close 1' button on startup:

```javascript
var suggestion1Stream = close1ClickStream.startWith('startup click') // we added this
  .combineLatest(responseStream,             
    function(click, listUsers) {l
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

这样，我们就可以把`combineLatest()`函数用在`close1ClickStream` and `responseStream`上了，所以只要关闭按钮被点击，我们就可以获得最近的响应数据，并在`suggestion1Stream`函数中产生出一个新值。另一方面，`combineLatest()`函数也是相对的：每当在`responseStream`上一个新的响应被发出，它将会结合一次新的点击关闭按钮事件来产生一个新的推荐关注的用户数据，这非常有趣，因为它允许我们为`suggestion1Stream`来简化我们的代码：

```javascript
var suggestion1Stream = close1ClickStream
  .combineLatest(responseStream,             
    function(click, listUsers) {
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

One piece is still missing in the puzzle. The combineLatest() uses the most recent of the two sources, but if one of those sources hasn't emitted anything yet, combineLatest() cannot produce a data event on the output stream. If you look at the ASCII diagram above, you will see that the output has nothing when the first stream emitted value `a`. Only when the second stream emitted value `b` could it produce an output value.

There are different ways of solving this, and we will stay with the simplest one, which is simulating a click to the 'close 1' button on startup:

```javascript
var suggestion1Stream = close1ClickStream.startWith('startup click') // we added this
  .combineLatest(responseStream,             
    function(click, listUsers) {l
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

现在，我们还缺一小块地方，`combineLatest()`函数使用了最近的两个数据源，但是如果某一个数据源并没有发出任何东西，`combineLatest()`函数又不能产生出一个输出的数据事件。如果你看了上面的ASCII图标，你会明白当第一个数据量发出一个`a`值时并没有任何的输出，只有当第二个数据量发出一个`b`值的时候才会产生处一个输出值。

哲理有很多种方法来解决这个问题，我们来使用最简单的一种，也就是在启动的时候来模拟'close 1'的点击事件：

```javascript
var suggestion1Stream = close1ClickStream.startWith('startup click') // we added this
  .combineLatest(responseStream,             
    function(click, listUsers) {l
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
```

## Wrapping up

And we're done. The complete code for all this was:

```javascript
var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var closeButton1 = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click');
// and the same logic for close2 and close3

var requestStream = refreshClickStream.startWith('startup click')
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var responseStream = requestStream
  .flatMap(function (requestUrl) {
    return Rx.Observable.fromPromise($.ajax({url: requestUrl}));
  });

var suggestion1Stream = close1ClickStream.startWith('startup click')
  .combineLatest(responseStream,             
    function(click, listUsers) {
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
// and the same logic for suggestion2Stream and suggestion3Stream

suggestion1Stream.subscribe(function(suggestion) {
  if (suggestion === null) {
    // hide the first suggestion DOM element
  }
  else {
    // show the first suggestion DOM element
    // and render the data
  }
});
```

## 封装起来

最后我们完成了，下面是完整的示例代码：

```javascript
var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var closeButton1 = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click');
// and the same logic for close2 and close3

var requestStream = refreshClickStream.startWith('startup click')
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var responseStream = requestStream
  .flatMap(function (requestUrl) {
    return Rx.Observable.fromPromise($.ajax({url: requestUrl}));
  });

var suggestion1Stream = close1ClickStream.startWith('startup click')
  .combineLatest(responseStream,             
    function(click, listUsers) {
      return listUsers[Math.floor(Math.random()*listUsers.length)];
    }
  )
  .merge(
    refreshClickStream.map(function(){ return null; })
  )
  .startWith(null);
// and the same logic for suggestion2Stream and suggestion3Stream

suggestion1Stream.subscribe(function(suggestion) {
  if (suggestion === null) {
    // hide the first suggestion DOM element
  }
  else {
    // show the first suggestion DOM element
    // and render the data
  }
});
```

**You can see this working example at http://jsfiddle.net/staltz/8jFJH/48/**

That piece of code is small but dense: it features management of multiple events with proper separation of concerns, and even caching of responses. The functional style made the code look more declarative than imperative: we are not giving a sequence of instructions to execute, we are just **telling what something is** by defining relationships between streams. For instance, with Rx we told the computer that _`suggestion1Stream` **is** the 'close 1' stream combined with one user from the latest response, besides being `null` when a refresh happens or program startup happened_.

Notice also the impressive absence of control flow elements such as `if`, `for`, `while`, and the typical callback-based control flow that you expect from a JavaScript application. You can even get rid of the `if` and `else` in the `subscribe()` above by using `filter()` if you want (I'll leave the implementation details to you as an exercise). In Rx, we have stream functions such as `map`, `filter`, `scan`, `merge`, `combineLatest`, `startWith`, and many more to control the flow of an event-driven program. This toolset of functions gives you more power in less code.

**你在[这里](http://jsfiddle.net/staltz/8jFJH/48/)可以看到可演示的示例工程**

以上的代码片段虽小但却做了很多功能：它适当的使用关注分离(separation of concerns)的实现了对多个事件流的管理，甚至做到了响应数据的缓存。这种函数式的风格使得代码看起来更像是声明式编程而非命令式编程：我们并不是在给一组指令去执行，我们只是定义了事件流之间关系来**告诉它这是什么**。例如，我们用Rx来告诉计算机_`suggestion1Stream`**是**'close 1'事件结合从最新的响应数据中拿到的一个用户数据的事件流，除此之外，当刷新事件发生时和程序启动时，它就是`null`_。

留意一下代码中并未出现例如`if`, `for`, `while`流程控制语句，或者像JavaScript那样典型的基于回调(callback-based)的流程控制。如果可以的话(稍候会给你留一些实现细节来作为一次练习)，你甚至可以在`subscribe()`上使用 `filter()`函数来摆脱`if`和`else`。在Rx里，我们有例如： `map`, `filter`, `scan`, `merge`, `combineLatest`, `startWith`等事件流的函数，还有很多函数可以用来控制**事件驱动编程(event-driven program)**的流程。这些函数的集合可以让你使用更少的代码实现更强大的功能。

## What comes next

If you think Rx* will be your preferred library for Reactive Programming, take a while to get acquainted with the [big list of functions](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md) for transforming, combining, and creating Observables. If you want to understand those functions in diagrams of streams, take a look at [RxJava's very useful documentation with marble diagrams](https://github.com/Netflix/RxJava/wiki/Creating-Observables). Whenever you get stuck trying to do something, draw those diagrams, think on them, look at the long list of functions, and think more. This workflow has been effective in my experience.

Once you start getting the hang of programming with Rx*, it is absolutely required to understand the concept of [Cold vs Hot Observables](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables). If you ignore this, it will come back and bite you brutally. You have been warned. Sharpen your skills further by learning real functional programming, and getting acquainted with issues such as side effects that affect Rx*.

But Reactive Programming is not just Rx*. There is [Bacon.js](http://baconjs.github.io/) which is intuitive to work with, without the quirks you sometimes encounter in Rx*. The [Elm Language](http://elm-lang.org/) lives in its own category: it's a Functional Reactive Programming **language** that compiles to JavaScript + HTML + CSS, and features a [time travelling debugger](http://debug.elm-lang.org/). Pretty awesome.

Rx works great for event-heavy frontends and apps. But it is not just a client-side thing, it works great also in the backend and close to databases. In fact, [RxJava is a key component for enabling server-side concurrency in Netflix's API](http://techblog.netflix.com/2013/02/rxjava-netflix-api.html). Rx is not a framework restricted to one specific type of application or language. It really is a paradigm that you can use when programming any event-driven software.

If this tutorial helped you, [tweet it forward](https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fgist.github.com%2Fstaltz%2F868e7e9bc2a7b8c1f754%2F&amp;text=The%20introduction%20to%20Reactive%20Programming%20you%27ve%20been%20missing&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fgist.github.com%2Fstaltz%2F868e7e9bc2a7b8c1f754&amp;via=andrestaltz).

## 接下来

如果你认为Rx家族将会成为你首选的响应式编程库，接下来则需要花一些时间来熟悉[一大批的函数](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md)用来变形、联合、创建可观察者。如果你想在事件流的图表当中熟悉这些函数，那就来看一下这个：[RxJava's very useful documentation with marble diagrams](https://github.com/Netflix/RxJava/wiki/Creating-Observables)。请记住，无论何时你遇到问题，画一下这些图，思考一下，看一下这一大串函数，然后继续思考。以我个人经验，这样效果很明显。

一旦你开始使用掌握Rx编程的编程，请记住，理解[Cold vs Hot Observables](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables)的概念是非常必要的，如果你忽视了这一点，它就会反弹回来并残忍的反咬你一口。我这里已经警告你了，学习函数式编程可以提高你的技能，熟悉一些常见问题，例如Rx带来的副作用

但是响应式编程并不仅仅是Rx家族，还有相对容易理解的，没有Rx那些怪癖的[Bacon.js](http://baconjs.github.io/)。[Elm Language](http://elm-lang.org/)则以它自己的方式支持响应式编程：它是一门会编译成Javascript + HTML + CSS的响应式编程语言，并有一个[time travelling debugger](http://debug.elm-lang.org/)功能，很棒吧。

而Rx对于像前端和App这样需要处理大量的编程效果是非常棒的。但是它不只是可以用在客户端，它还可以用在后端或者接近数据库的地方。事实上，[RxJava就是Netflix服务端API用来处理并行的组件](http://techblog.netflix.com/2013/02/rxjava-netflix-api.html)。Rx并不是局限于某种应用程序或者编程语言的框架，它真的是，当你编写任何的事件驱动程序，可以遵循的一个非常棒的编程范式。

如果这篇教程对你有帮助, [那么就请来转发一下吧(tweet it forward)](https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fgist.github.com%2Fstaltz%2F868e7e9bc2a7b8c1f754%2F&amp;text=The%20introduction%20to%20Reactive%20Programming%20you%27ve%20been%20missing&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fgist.github.com%2Fstaltz%2F868e7e9bc2a7b8c1f754&amp;via=andrestaltz).
