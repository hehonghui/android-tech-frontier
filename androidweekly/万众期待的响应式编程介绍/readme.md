## 万众期待的响应式编程介绍
(by [@andrestaltz](https://twitter.com/andrestaltz))
---

>
* 原文链接 : [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* 译者 : [yaoqinwei](https://github.com/yaoqinwei) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成


> 注：为了突出"响应式编程"这个专有名词，也为了编写方便，更为了让大家便于记忆，这里用联合单词首字母大写"RP"来代替"响应式编程"这几个字，下文将全部替换，请注意啦。

So you're curious in learning this new thing called Reactive Programming, particularly its variant comprising of Rx, Bacon.js, RAC, and others.

相信你们在学习RP这个新技术的时候都会充满了好奇，特别是它的一些变种，包括Rx系列、Bacon.js、RAC和其他的一些变种。

Learning it is hard, even harder by the lack of good material. When I started, I tried looking for tutorials. I found only a handful of practical guides, but they just scratched the surface and never tackled the challenge of building the whole architecture around it. Library documentations often don't help when you're trying to understand some function. I mean, honestly, look at this:

> **Rx.Observable.prototype.flatMapLatest(selector, [thisArg])**

> Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.

Holy cow.

学习RP是个非常困难的过程，尤其是在当前缺乏优秀资料的前提下。起初，我试图寻找一些教程，却只找到了少量的实践指南而已，并且它们讲的都非常浅显，却从来没人愿意尝试围绕RP来建立一个完整知识体系的挑战。而官方文档通常也并不能完全地帮助你理解某些函数，它们通常看起来很绕，不信看看这里：

> **Rx.Observable.prototype.flatMapLatest(selector, [thisArg])**

> 根据元素下标，将可观察序列中每个元素一一映射到一个新的可观察序列当中，然后...%…………%&￥#@@……&**(晕了)

天呐，这简直太绕了！

I've read two books, one just painted the big picture, while the other dived into how to use the Reactive library. I ended up learning Reactive Programming the hard way: figuring it out while building with it. At my work in Futurice I got to use it in a real project, and had the support of some colleagues when I ran into troubles.

The hardest part of the learning journey is thinking in Reactive. It's a lot about letting go of old imperative and stateful habits of typical programming, and forcing your brain to work in a different paradigm. I haven't found any guide on the internet in this aspect, and I think the world deserves a practical tutorial on how to think in Reactive, so that you can get started. Library documentation can light your way after that. I hope this helps you.

我读过两本相关的书，一本只是在给你描绘RP的伟大景象，而另一本却只是深入到如何使用响应式库而已。最后，我终于在不断的构建中，艰难的学完了RP。我将会在当前工作公司的一个真实项目中用到它，当我遇到问题时，还可以与同事一起讨论。

学习RP最难的部分是 **如何以RP的方式来思考**，那么更多的意味着你要放弃那些老旧的、命令式和状态式的典型编程习惯，并且强迫自己的大脑以不同的方式来运作。目前我还没有在网络上找到任何一个教程是从这个层面来剖析的，我想这个世界非常值得拥有这样一个优秀的实践教程来教你 **如何以RP的方式来思考**，以便能够让你快速进入 **RP思维** 的世界，然后再去看各种库文档才可以给你更多的指引。希望这篇文章就能够帮助你进入 **RP思维** 的世界。

## "What is Reactive Programming?"

There are plenty of bad explanations and definitions out there on the internet. [Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming) is too generic and theoretical as usual. [Stackoverflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming)'s canonical answer is obviously not suitable for newcomers. [Reactive Manifesto](http://www.reactivemanifesto.org/) sounds like the kind of thing you show to your project manager or the businessmen at your company. Microsoft's [Rx terminology](https://rx.codeplex.com/) "Rx = Observables + LINQ + Schedulers" is so heavy and Microsoftish that most of us are left confused. Terms like "reactive" and "propagation of change" don't convey anything specifically different to what your typical MV* and favorite language already does. Of course my framework views react to the models. Of course change is propagated. If it wouldn't, nothing would be rendered.

So let's cut the bullshit. 

## "什是RP?"

网络上有一大堆糟糕的解释和定义，[Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)上通常都是些非常笼统和理论性的解释，[Stackoverflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming)上的一些标准答案显然也不适合一些新手来参考，[Reactive Manifesto](http://www.reactivemanifesto.org/)看起来也只像是拿来给你的PM或者老板看的东西，微软的[Rx术语](https://rx.codeplex.com/)"Rx = Observables + LINQ + Schedulers" 也显得太过沉重，而且也充满了太多微软式的东西，反而给我们留下了更多的疑惑。相对于你使用的MV*框架以及你钟爱的编程语言，"Reactive"和"Propagation of change"这样的术语并没有传达任何有意义的概念。当然，我的view框架是可以能够从model做出反应，我的改变也当然会传播，如果没有这些，我的界面根本就没有东西可以渲染。

所以，不要再扯这些废话了。

#### Reactive programming is programming with asynchronous data streams. 

In a way, this isn't anything new. Event buses or your typical click events are really an asynchronous event stream, on which you can observe and do some side effects. Reactive is that idea on steroids. You are able to create data streams of anything, not just from click and hover events. Streams are cheap and ubiquitous, anything can be a stream: variables, user inputs, properties, caches, data structures, etc. For example, imagine your Twitter feed would be a data stream in the same fashion that click events are. You can listen to that stream and react accordingly.

####  响应式编程就是与异步数据流交互的编程方式

一方面，这已经不是什么新事物了。事件总线(Event Buses)或一些典型的点击事件本质上就是一个异步事件流，这样你就可以观察它的变化并使其产生一些效果。实际上响应式是这样的一个思路：除了点击(click)和悬停(hover)的事件外，你可以给任何事物创建一个异步事件流。实际上，事件流无处不在，任何东西都可以成为一个事件流，例如变量、用户输入、属性、缓存、数据结构等等。举个栗子，你可以把你的微博订阅功能想象成像点击事件一样的事件流，这样，你也可以监听这样的异步事件流，并相应的做出反应。

**On top of that, you are given an amazing toolbox of functions to combine, create and filter any of those streams.** That's where the "functional" magic kicks in. A stream can be used as an input to another one. Even multiple streams can be used as inputs to another stream. You can _merge_ two streams. You can _filter_ a stream to get another one that has only those events you are interested in. You can _map_ data values from one stream to another new one.

If streams are so central to Reactive, let's take a careful look at them, starting with our familiar "clicks on a button" event stream.

![Click event stream](http://i.imgur.com/cL4MOsS.png)

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

**最重要的是，你会有一些令人惊艳的函数去结合、创建和过滤任何一组事件流。** 这就是“函数式编程”的魔力所在。一个**事件流**可以作为另一个**事件流**的输入，甚至多个**事件流**可以作为另一个**事件流**的输入。你可以_合并(merge)_两个**事件流**，也可以_过滤(filter)_一个你感兴趣的**事件流**，还可以_映射(map)_一个**事件流**的值到一个新的**事件流**里。

如果**事件流**对于RP如此重要，那不妨就让我们来仔细的看看，先从我们熟悉的"点击一个按钮"的**事件流**开始

![Click event stream](http://i.imgur.com/cL4MOsS.png)

一个**事件流**是一个 **按时间排序的即将发生的事件(Ongoing events ordered in time)序列**。如上图，一个**事件流**可以发出3种不同的事件：某种类型的**值事件**，**错误事件**和**完成事件**。当一个**完成事件**发生时，在某些情况下，我们可能会做这样的操作：关闭包含那个按钮的窗口或者视图组件。

我们可以**异步的**的去捕捉这些将要发出的事件，这样我们就可以在发出一个**值事件**时执行一个函数，发出**错误事件**时执行一个函数，发出**完成事件**执行另一个函数。有的时候你只需聚焦于如何定义和设计**值事件**要执行的函数，而忽略后两个事件。我们可以把监听这个**事件流**的过程叫做**订阅**，而我们定义的函数可以叫做**观察者**，而事件流就可以叫做被观察的**主题**(或者叫可观测的对象)。你应该察觉到了，对的，它就是[**观察者模式**](https://en.wikipedia.org/wiki/Observer_pattern)。

上面的示意图我们也可以用ASCII码的形式重新画一遍，请注意，下面的部分教程中我们会继续使用这幅图：
```
--a---b-c---d---X---|->

a, b, c, d 是值事件
X 是错误事件
| 是完成事件
---> 是时间线(轴)
```

现在你对RP事件流应该非常熟悉了，为了不让你感到无聊，让我们来做一些新的尝试吧：我们将创建一个由原始点击事件流演变而来的一种新的点击事件流。

First, let's make a counter stream that indicates how many times a button was clicked. In common Reactive libraries, each stream has many functions attached to it, such as `map`, `filter`, `scan`, etc. When you call one of these functions, such as `clickStream.map(f)`, it returns a **new stream** based on the click stream. It does not modify the original click stream in any way. This is a property called **immutability**, and it goes together with Reactive streams just like pancakes are good with syrup. That allows us to chain functions like `clickStream.map(f).scan(g)`:

```
  clickStream: ---c----c--c----c------c-->
               vvvvv map(c becomes 1) vvvv
               ---1----1--1----1------1-->
               vvvvvvvvv scan(+) vvvvvvvvv
counterStream: ---1----2--3----4------5-->
```

The `map(f)` function replaces (into the new stream) each emitted value according to a function `f` you provide. In our case, we mapped to the number 1 on each click. The `scan(g)` function aggregates all previous values on the stream, producing value `x = g(accumulated, current)`, where `g` was simply the add function in this example. Then, `counterStream` emits the total number of clicks whenever a click happens.

首先，让我们来创建一个记录按钮点击次数的事件流。在常用的响应式库中，每个事件流都会附有一些函数，例如 `map`, `filter`, `scan`等，当你调用这其中的一个方法时，比如`clickStream.map(f)`，它会返一个基于点击事件流的新的**事件流**。它不会对原来的点击事件流做任何的修改。这种特性叫做**不可变性(immutability)**，而且它会可以和响应式事件流搭配在一起使用，就像煎饼和糖浆一样完美的搭配。这样我们可以用链式函数的方式来调用，例如：`clickStream.map(f).scan(g)`:

```
  clickStream: ---c----c--c----c------c-->
               vvvvv map(c becomes 1) vvvv
               ---1----1--1----1------1-->
               vvvvvvvvv scan(+) vvvvvvvvv
counterStream: ---1----2--3----4------5-->
```

`map(f)`函数会根据你提供的`f`函数把原事件流中发出的值事件分别映射到新的事件流中。在上图的例子中，我们把每一次点击事件都映射成1，`scan(g)`函数则把之前映射的值聚集起来，然后根据`x = g(accumulated, current)`算法来作相应的处理，而本例的`g`函数其实就是简单的加法函数而已。

To show the real power of Reactive, let's just say that you want to have a stream of "double click" events. To make it even more interesting, let's say we want the new stream to consider triple clicks as double clicks, or in general, multiple clicks (two or more). Take a deep breath and imagine how you would do that in a traditional imperative and stateful fashion. I bet it sounds fairly nasty and involves some variables to keep state and some fiddling with time intervals.

Well, in Reactive it's pretty simple. In fact, the logic is just [4 lines of code](http://jsfiddle.net/staltz/4gGgs/27/).
But let's ignore code for now. Thinking in diagrams is the best way to understand and build streams, whether you're a beginner or an expert.

![Multiple clicks stream](http://i.imgur.com/HMGWNO5.png)

Grey boxes are functions transforming one stream into another. First we accumulate clicks in lists, whenever 250 milliseconds of "event silence" has happened (that's what `buffer(stream.throttle(250ms))` does, in a nutshell. Don't worry about understanding the details at this point, we are just demoing Reactive for now). The result is a stream of lists, from which we apply `map()` to map each list to an integer matching the length of that list. Finally, we ignore `1` integers using the `filter(x >= 2)` function. That's it: 3 operations to produce our intended stream. We can then subscribe ("listen") to it to react accordingly how we wish.

I hope you enjoy the beauty of this approach. This example is just the tip of the iceberg: you can apply the same operations on different kinds of streams, for instance, on a stream of API responses; on the other hand, there are many other functions available.

为了展示RP真正的魅力，我们假设你有一个"双击"事件流，为了让它更有趣，我们假设这个事件流同时处理"三次点击"或者"多次点击"事件，然后深吸一口气想想如何用传统的命令式和状态式的方式来处理，我敢打赌，这么做其实会相当的令人厌烦，其中会涉及到一些变量来保存状态，并且还得做一些时间间隔的调整

而我们用RP的方式处理起来确是那么的简洁，实际上，逻辑代码只需要[四行代码](http://jsfiddle.net/staltz/4gGgs/27/)而已。但是，当前阶段让我们现忽略代码的部分，无论你是新手还是专家，看着图表来理解和建立事件流将是一个非常棒的途径。

![多次点击事件流](http://i.imgur.com/HMGWNO5.png)

图中，灰色盒子表示将上面的事件流转换下面的事件流的**函数**过程，首先根据250毫秒的间隔时间或者叫无事件发生的时间段(event silence, 译者:上一个事件发生到下一个事件发生的间隔事件)把点击事件流一段一隔开，再将每一段的一个或多个点击事件添加到列表中(`buffer(stream.throttle(250ms))`)。别担心这些细节，我们现在就是在演示RP的过程。那么，到现在得到的是多个含有事件流的列表， 接下来我们使用了`map()`中的函数来算出每一个列表的长度整数数值映射到下一个事件流当中。最后我们使用了过滤`filter(x >= 2)` 函数忽略掉了小于`1` 的整数。就这样，我们用了3步操作生成了我们想要的事件流，接下来，我们就可以订阅("监听")这个事件并作出我们想要的反应了。

我希望你能感受到这个示例的优雅之处。当然了，这个示例也只是RP能产生的效果的冰山一角而已，你同样可以使用这3步操作应用到不同种类的事件流中去，例如，一串API响应的事件流。另一方面，你还有非常多的函数可以使用。

## "Why should I consider adopting RP?"

Reactive Programming raises the level of abstraction of your code so you can focus on the interdependence of events that define the business logic, rather than having to constantly fiddle with a large amount of implementation details. Code in RP will likely be more concise.

The benefit is more evident in modern webapps and mobile apps that are highly interactive with a multitude of UI events related to data events. 10 years ago, interaction with web pages was basically about submitting a long form to the backend and performing simple rendering to the frontend. Apps have evolved to be more real-time: modifying a single form field can automatically trigger a save to the backend, "likes" to some content can be reflected in real time to other connected users, and so forth.

Apps nowadays have an abundancy of real-time events of every kind that enable a highly interactive experience to the user. We need tools for properly dealing with that, and Reactive Programming is an answer.

## "我为什么要采用RP？"

RP可以提高你的代码抽象级别，好让你可以专注于定义与事件相互依存的业务逻辑，而不是把大量精力放在实现细节，使用RP会让你的代码变得更加简洁。

特别对于现在流行的webapps和mobile apps这些频繁的与数据事件相关的众多UI事件交互的程序，好处就更加的明显了。十年前，web页面的交互是提交一个很长的表单数据到后端，然后再做一些简单的前端界面渲染操作。而现在的Apps则演变的更具有实时性：仅仅修改一个单独的表单域就能自动的触发保存到后端的代码，就像某一个用户对一些内容点了赞，就能够实时反映到其他已连接的用户一样，等等。

当今的Apps含有丰富的实时事件来保证一个高效的用户体验，我们需要采用一个合适的工具来处理，那么RP就正好是我们想的答案。
