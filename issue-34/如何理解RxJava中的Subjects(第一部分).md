如何理解RxJava中的Subjects(第一部分)
----

> * 原文链接 : [How to think about Subjects in RxJava (Part 1)](https://tech.instacart.com/how-to-think-about-subjects-part-1/)
* 原文作者 : [Kaushik Gopal](https://tech.instacart.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [rednels](https://github.com/rednels) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

When I first started using RxJava and heard of Subjects I envisioned them as mystical trinkets. When used correctly they seemed to magically do the impossible. When used incorrectly they turned my code to a steaming pile of U+1F4A9. A friend warming up to RxJava echoed a similar sentiment: “Subjects are like a (colorful adjective) black box to me. I’m not really sure when I should ever be using them. I run into a corner with RxJava, snoop around the web, copy-paste some code which uses Subjects from StackOverflow, get my code working and hope to never look back at that code again”.

当我首次开始使用`RxJava`，并且听说`Subjects`的时候，我把它们当作神秘的饰品。在正确使用时，它们似乎有魔法一样，能做到不可能的事情。在使用不正确时，他们会把我的代码变成一堆热腾腾的狗屎。一个准备尝试Rxjava的朋友回应了相似的情绪：“Subjects对我来说就像一个（丰富多彩的形容词）黑盒子。我不确定我该什么时候使用它们。我冲进了RxJava的一个角落，在网页上搜寻，从StackOverflow上复制粘贴一些使用Subjects的代码，使我的代码能够工作，并且希望不要再一次回过头来看这些代码。”

We know Observables and Subscribers to be the workhorse constructs. Coupled with an operator (or two) you should be on your merry Rx way. But adding Subjects to the mix opens a whole new channel of communication between these constructs. You just have to start thinking about them differently.

我们知道`Observables`和`Subscribers`是主要的组件。再加上一个（或两个）操作符你就可以开始你愉快的Rx之旅了。但是加入`Subjects`的组合在他们之间打开了一个全新的交流渠道。你只需要开始思考他们的不同。

The goal of this post is to help you warm up to that line of thinking.

这篇文章的目的就是帮助你打开思路。    

Let’s start off by looking at the textbook definition:

让我们通过看课本的定义开始：    

> A Subject is a sort of bridge or proxy that acts both as a Subscriber and as an Observable. Because it is a Subscriber, it can subscribe to one or more Observables, and because it is an Observable, it can pass through the items it observes by reemitting them, and it can also emit new items.

> 一个Subject是一个有序的桥或者代理，它同时可以作为一个Subscriber和Observable。因为他是一个Subscriber，它能够订阅一个或多个Observable，并且因为它也是一个Observable，它可以通过它观察的对象由重新发射，并且它也可以发射新的对象。

A Subscriber and an Observable?

一个`Subscriber`和一个`Observable`？

What demigoddery is this?! You have a producer (Observable) on the one end sending down a stream of events. On the other end, you have a consumer (Subscriber) swallowing up those events. When would you possibly need something that does both?

这是什么鬼！？你一端有一个生产者（Observable）向下发送事件流。在另一端，你有一个消费者（Subscriber）消费了这些事件。什么情况下你可能会需要某些东西同时做两种操作？

> Think pipe connectors

> 想一下管道连接器

Let’s take a specific example. The world of Android development has this common requirement: “Resuming or continuing the work done by a long-running operation like a network call after a screen rotation or configuration change”. I took a stab at the solution using retained fragments from the Android APIs, coupled with some RxJava.

举个特殊的例子吧。Android世界的开发有一个共同的需求：“恢复或者继续完成一个长时间操作的工作，比如在屏幕角度或配置变更后的网络调用”。我建议使用android 的api,再加上一些RxJava来保留fragment的解决方案。

You have a UI based fragment (A) which acts as the master. When you want to start your network call you spawn a worker fragment (B) which makes the call. Meanwhile, if (A) is rotated, recreated, destroyed etc. it wouldn’t matter. After (A) finally connects or syncs back with (B), it would only receive subsequent events from (B) without restarting the whole process. 

你有一个基于UI的fragment（A）作为主fragment。当你想要启动你的网络调用是，你新建一个工作者fragment（B）来进行网络调用。与此同时，如果A发生了旋转、重建、销毁等，它不会有问题。当A最后与B建立连接或同步后，它只会受到来自B的后续事件，无需重新启动整个过程。

Let’s model this example with some code. Say I have a long running Observable:

让我们用下面的代码来模拟一下这个例子。假设我有一个长时间运行的Observable：

```java
Observable.interval(1, TimeUnit.SECONDS)
    .map(new Func1<Long, Integer>() {
        @Override
        public Integer call(Long aLong) {
            return aLong.intValue();
        }
    })
    .take(20);
```

In the real world, this Observable would be your network call or long-running operation. This is executed immediately in the onCreate method of the worker fragment (B) as shown below:

在真实的环境中，这个Observable将会是你自己的忘了调用或其他耗时操作。它在工作者fragment（B）的`onCreate`方法中会被立即执行，如下所示：

```java
/**
* This method will only be called once when the retained Fragment is first created.
*/
@Override
public void onCreate(Bundle savedInstanceState) {

  Observable.interval(1, TimeUnit.SECONDS)
     .map(new Func1<Long, Integer>() {
        @Override
        public Integer call(Long aLong) {
            return aLong.intValue();
        }
     })
    .take(20)
    .subscribe();    // Observable kicked off
}
```

By virtue of the way Android works, only at a later point in (B) (like the onResume call) can you actually talk back to any connecting fragment such as the UI based fragment (A) :

```java
@Override
public void onResume() {
    super.onResume();

    // channel open for communication with master fragment
    // send results (A)
}
```

So we started the call in onCreate… how do we pipe the results down to onResume? What if we had this magical trinket that acted as a Subscriber in onCreate consuming all those events, but as an Observable in onResume sending down the events to anyone listening?

那么我们`onCreate`中启动调用，我们怎么把结果下发给`onResume`？假入我们有这个魔法饰品，它充当一个Subscriber在`onCreate`中消费所有的这些事件，但是又作为一个Observable，在`onResume`中下发事件到任意一个正在监听的对象？

With Subjects we can do the following:

使用Subjects，我们可以像下面这样做：

```java
// consume events
(...).subscribe(mSubject);

// produce events
mSubject.subscribe(...);
```

slightly more flushed out:

稍微完整一些：

```java
private Subject<Integer, Integer> mSubject = PublishSubject.create();

@Override
public void onCreate(Bundle savedInstanceState) {

    Observable.interval(1, TimeUnit.SECONDS)
        .map(new Func1<Long, Integer>() {
            @Override
            public Integer call(Long aLong) {
                return aLong.intValue();
            }
        })
        .take(20) 
        .subscribe(mSubject);
}

@Override
public void onResume() {           
    super.onResume();

    // channel open for communication with master fragment
    // send results to master fragment
    mfragA.sendResultsBack(mSubject.asObservable);
}
```

There you have it! A pipe connector for all your Rx streams. A complete working example can be found here.

至此你有了它，一个针对你的所有Rx流的管道连接器。一个完整的可以运行的示例可以在这里找到。

Some considerations:
==================

一些建议：
==============

Dispose your subscriptions responsibly!

响应式处理你的subscription！

In the snippets above, I’ve omitted the parts where we responsibly dispose the subscriptions, for brevity and clarity. Have a look at the solution to see how this should be done.

在上面的片段里，为了简介和清晰，我省略了处理订阅的部分。可以在演示代码中看到这部分应该如何做。

Uhh….why not just create the observable in onResume?

呃...，为什么不只是在`onResume`中创建一个Observable？

Firstly, we want to execute the call as soon as possible. onCreate is the earliest point we can do this. onResume on the other hand is the point where (A) and (B) can actually talk to each other.

首先，我们希望尽可能地执行该调用。`onCreate`是我们能这么做的最早的地方。在另一方面，`onResume`是A和B真正彼此通信的地方。

Secondly and more importantly if you created the observable in onResume, every time (A) connects back to (B) you would simply be restarting the sequence… which defeats the purpose.

其次，更重要的是，如果我们在onResume中创建observable，每次A连接回B时，你将会简单地重启队列…这样达不到目的。

This works because Subjects are by default “hot”:

因为Subjects默认是“hot”所以它才会生效：

Most observables are “cold”. For a fantastic explanation of Hot/Cold observables check out this egghead video. Essentially “cold” observables are like playing your videos from the start every time while “hot” observables are like live-streaming videos. mObservable here (despite the use of an interval operator) is “cold”, so every time you subscribe to the stream it will restart the sequence. Unlike cold observables, Subjects are “hot” by default.

大多数observables是“冷”。对于冷/热observables的一个有趣的解释，可以参考这个理论视频。

Which Subject to use?

使用哪一个Subject？

There are many kinds of subjects. For this specific requirement, a PublishSubject works well because we wish to continue the sequence from where it left off. So assuming events 1,2,3 were emitted in (B), after (A) connects back we only want to see 4, 5, 6. If we used a ReplaySubject we would see [1, 2, 3], 4, 5, 6; or if we used a BehaviorSubject we would see 3, 4, 5, 6 etc.

有许多种Subjects。对于这个特殊的需求，`PublicSubject`会比较好用，因为我们希望从它离开的地方继续执行序列。所以，假设我们在B中发出了事件1，2，3，在A重新连接回来时我们只希望看到4，5，6.如果我们使用了一个`ReplaySubject`，我们将会看到[1,2,3],4,5,6;又或者我们使用了一个`BehaviorSubject`我们将会看到3，4，5，6等等。

What about operators like .replay, .share or Connected observables?

A previous solution used a very similar technique. However, this is where we enter the lands of “multicasting”. Multicasting is not simple: you have to consider thread-safety or come to grips with concepts like .refCount etc. Subjects are far more simpler. As the amazing Karnok point out in this excellent series, when using Subjects you can handle complex conditions like backpressure very easily with simple operators like .onBackPressurexxx.

Another wise Jedi Rxer also mentioned once that using multicasting techniques are dangerous and indications of code smells. Almost always, there’s a ready-made construct or operator that does the job for you far more easily.

另一些聪明的绝地武士Rx使用者

Stay tuned for more in this series.

