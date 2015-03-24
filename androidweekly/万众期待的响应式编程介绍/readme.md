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

**最重要的是，你会有一些令人惊艳的函数去结合、创建和过滤任何一组事件流。** 这就是“函数式编程”的魔力所在。一个事件流可以作为另一个事件流的输入，甚至多个事件流可以作为另一个事件流的输入。你可以_合并(merge)_两个事件流，可以_过滤(filter)_一个你感兴趣的事件流，可以_映射(map)_一个事件流的值到一个新的事件流里。

如果事件流对于响应式编程如此重要，那不妨就让我们来仔细的看看，先从我们熟悉的"点击一个按钮"的事件流开始

![Click event stream](http://i.imgur.com/cL4MOsS.png)

一个事件流是一个 **按时间排序的即将发生的事件(Ongoing events ordered in time)序列**。它可以发出3种不同的事件：一个某种类型的**值事件**、一个**错误事件**或者一个**完成事件**。当一个**完成事件**发生时，在某些情况下，我们可能会做这样的操作：关闭包含那个按钮的窗口或者视图组件。

我们可以**异步的**的去捕捉这些将要发出的事件，这样我们就可以在发出一个**值事件**时执行一个函数，发出**错误事件**时执行一个函数、发出**完成事件**执行另一个函数。有的时候你只需聚焦于定义和设计**值事件**要执行的函数，而忽略后两个事件。我们可以把监听这个事件流过程叫做**订阅**，而我们定义的函数可以叫做**观察者**，而事件流就可以叫做被观察的**主题**(或者叫可观测的对象)。你应该察觉到了，对的，你猜对了，其实它就是[**观察者模式**](https://en.wikipedia.org/wiki/Observer_pattern)。

