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




