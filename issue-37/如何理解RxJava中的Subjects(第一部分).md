如何理解RxJava中的Subjects(第一部分)
----

> * 原文链接 : [How to think about Subjects in RxJava (Part 1)](https://tech.instacart.com/how-to-think-about-subjects-part-1/)
* 原文作者 : [Kaushik Gopal](https://tech.instacart.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [rednels](https://github.com/rednels) 
* 校对者: [desmond1121](https://github.com/desmond1121)   
* 状态 :  完成 

当我首次开始使用`RxJava`，并且听说`Subjects`的时候，我把它们当作神秘的饰品。在正确使用时，它们似乎有魔法一样，能做到不可能的事情。在使用不正确时，他们会把我的代码变成一堆热腾腾的狗屎。一个准备尝试Rxjava的朋友回应了相似的情绪：“Subjects对我来说就像一个（丰富多彩的形容词）黑盒子。我不确定我该什么时候使用它们。我冲进了RxJava的一个角落，在网页上搜寻，从StackOverflow上复制粘贴一些使用Subjects的代码，使我的代码能够工作，并且希望不要再一次回过头来看这些代码。”

我们知道`Observables`和`Subscribers`是主要的组件。再加上一个（[或两个](https://github.com/ReactiveX/RxJava/wiki/Alphabetical-List-of-Observable-Operators)）操作符你就可以开始你愉快的Rx之旅了。但是加入`Subjects`的组合在他们之间打开了一个全新的交流渠道。你只需要开始思考他们的不同。

这篇文章的目的就是帮助你打开思路。    
让我们[官方的wiki定义](https://github.com/ReactiveX/RxJava/wiki/Subject)开始：    

> 一个Subject是一个有序的桥或者代理，它同时可以作为一个Subscriber和Observable。因为他是一个Subscriber，它能够订阅一个或多个Observable，同时它也是一个Observable，它能够将之前作为Subscriber时接受到的对象重新发出，也可以发出新的对象。

一个`Subscriber`和一个`Observable`？

这是什么鬼！？你一端有一个生产者（Observable）向下发送事件流。在另一端，你有一个消费者（Subscriber）消费了这些事件。什么情况下你可能会需要某些东西同时做两种操作？

> 想一下管道连接器

举个特殊的例子吧。Android世界的开发有一个共同的需求：“恢复或者继续完成一个长时间操作的工作，比如在屏幕角度或配置变更后的网络调用”。我建议使用android 的api,[再加上一些RxJava](https://github.com/kaushikgopal/RxJava-Android-Samples#rotation-persist)来[保存fragment](http://www.androiddesignpatterns.com/2013/04/retaining-objects-across-config-changes.html)的解决方案。

你有一个基于UI的fragment（A）作为主fragment。当你想要启动你的网络调用是，你新建一个工作者fragment（B）来进行网络调用。与此同时，如果A发生了旋转、重建、销毁等，它不会有问题。当A最后与B建立连接或同步后，它只会受到来自B的后续事件，无需重新启动整个过程。

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

根据android的工作方式，只有在B中后面一点（比如onResume调用时）你能够真正地同任何关联的fragment，比如基于UI的fragment（A），进行通信。

```java
@Override
public void onResume() {
    super.onResume();

    // channel open for communication with master fragment
    // send results (A)
}
```

那么我们`onCreate`中启动调用，我们怎么把结果下发给`onResume`？假入我们有这个魔法饰品，它充当一个Subscriber在`onCreate`中消费所有的这些事件，但是又作为一个Observable，在`onResume`中下发事件到任意一个正在监听的对象？

使用Subjects，我们可以像下面这样做：

```java
// consume events
(...).subscribe(mSubject);

// produce events
mSubject.subscribe(...);
```

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

至此你有了它，一个针对你的所有Rx流的管道连接器。一个完整的可以运行的示例可以在[这里](https://github.com/kaushikgopal/RxJava-Android-Samples/tree/master/app/src/main/java/com/morihacky/android/rxjava/fragments)找到。

## 一些建议：

* 响应式处理你的subscription！

在上面的片段里，为了简介和清晰，我省略了处理订阅的部分。可以在[演示代码](https://github.com/kaushikgopal/RxJava-Android-Samples/tree/master/app/src/main/java/com/morihacky/android/rxjava/fragments)中看到这部分应该如何做。

* 呃...，为什么不只是在`onResume`中创建一个Observable？

首先，我们希望尽可能地执行该调用。`onCreate`是我们能这么做的最早的地方。在另一方面，`onResume`是A和B真正彼此通信的地方。

其次，更重要的是，如果我们在onResume中创建observable，每次A连接回B时，你将会简单地重启队列…这样达不到目的。

* 因为Subjects默认是“hot”所以它才会生效：

大多数observables是“cold”的。对于hot/cold observables的一个有意思的解释，可以参考[这个理论家的视频](https://egghead.io/lessons/rxjs-demystifying-cold-and-hot-observables-in-rxjs)。`mObservable`这里（尽管使用了一个interval操作符）是“cold”，所以每次你订阅流的时候，它就会重启序列。不像code observables，Subjects默认是“hot”的。

* 使用哪一个Subject？

有许[多种Subjects](http://reactivex.io/documentation/subject.html)。对于这个特殊的需求，`PublicSubject`会比较好用，因为我们希望从它离开的地方继续执行序列。所以，假设我们在B中发出了事件1，2，3，在A重新连接回来时我们只希望看到4，5，6.如果我们使用了一个`ReplaySubject`，我们将会看到[1,2,3],4,5,6;又或者我们使用了一个`BehaviorSubject`我们将会看到3，4，5，6等等。

* 使用像.replay,.share这种操作符或者ConnectableObservable怎么样？

一个[以前的解决方案](https://github.com/kaushikgopal/RxJava-Android-Samples/blob/master/app/src/main/java/com/morihacky/android/rxjava/fragments/RotationPersist1WorkerFragment.java)使用了一个非常相似的技术。然而，这也是我们进入“多播”领域的地方。多播并不简单:你不得不考虑线程安全或者去掌握像`.refCount`等的概念。Subjects相比之下要简单地多。在[这个优秀的系列文章](http://akarnokd.blogspot.com/2015/06/subjects-part-1.html)中，由于Karnok惊人地指出，当使用Subjects的时候，你 能够处理复杂的条件，比如，使用像`.onBackPressurexxx`这种简单的操作符就可以很方便地处理后退键按下事件。

另一些聪明的绝地武士一样的Rxer也提到过使用多播技术是危险的，并且会使代码变质。几乎总是有一个现成的结构或操作符对你来说更容易完成任务。

请继续关注本系列的更多内容。
