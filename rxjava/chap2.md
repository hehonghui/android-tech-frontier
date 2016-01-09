# RxJava开发精要2-为什么是Observables?

> 
> * 原文出自《RxJava Essentials》
* 原文作者 : [Ivan Morgillo](https://www.packtpub.com/books/info/authors/ivan-morgillo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuxingxin](https://github.com/yuxingxin) 
* 项目地址 : [RxJava-Essentials-CN](https://github.com/yuxingxin/RxJava-Essentials-CN)

## 为什么是Observables?

在面向对象的架构中，开发者致力于创建一组解耦的实体。这样的话，实体就可以在不用妨碍整个系统的情况下可以被测试、复用和维护。设计这种系统就带来一个棘手的负面影响：维护相关对象之间的统一。

在Smalltalk MVC架构中，创建模式的第一个例子就是用来解决这个问题的。用户界面框架提供一种途径使UI元素与包含数据的实体对象相分离，并且同时，它提供一种灵活的方法来保持它们之间的同步。

在这本畅销的四人组编写的《设计模式——可复用面向对象软件的基础》一书中，观察者模式是最有名的设计模式之一。它是一种行为模式并提供一种以一对多的依赖来绑定对象的方法：即当一个对象发生变化时，依赖它的所有对象都会被通知并且会自动更新。

在本章中，我们将会对观察者模式有一个概述，它是如何实现的以及如何用RxJava来扩展，Observable是什么，以及Observables如何与Iterables相关联。


## 观察者模式

在今天，观察者模式是出现的最常用的软件设计模式之一。它基于subject这个概念。subject是一种特殊对象，当它改变时，那些由它保存的一系列对象将会得到通知。而这一系列对象被称作Observers,它们会对外暴漏了一个通知方法,当subject状态发生变化时会调用的这个方法。

在上一章中，我们看到了电子表单的例子。现在我们可以展开这个例子讲，展示一个更复杂的场景。让我们考虑这样一个填着账户数据的电子表单。我们可以把这些数据比作一张表，或者是3D柱状图，或者是饼状图。它们中每一个代表的意义都取决于同一组要展示的数据。每一个都是一个观察者，都依赖于那一个subject，维护着全部信息。

3D柱状图这个类、饼状图类、表这个类以及维护这些数据的类是完全解耦的：它们彼此相互独立复用，但也能协同工作。这些表示类彼此不清楚对方，但是正如它们所做的：它们知道在哪能找到它们需要展示的信息，它们也知道一旦数据发生变化就通知需要更新数据表示的那个类。

这有一张图描述了Subject/Observer的关系是怎样的一对多的关系：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter2_1.png)

上面这张图展示了一个Subject为3个Observers提供服务。很明显，没有理由去限制Observers的数量：如果有需要，一个Subject可以有无限多个Observers,当subject状态发生变化时，这些Observers中的每一个都会收到通知。

## 你什么时候使用观察者模式？

观察者模式很适合下面这些场景中的任何一个：

* 当你的架构有两个实体类，一个依赖另一个，你想让它们互不影响或者是独立复用它们时。
* 当一个变化的对象通知那些与它自身变化相关联的未知数量的对象时。
* 当一个变化的对象通知那些无需推断具体类型的对象时。


## RxJava观察者模式工具包

在RxJava的世界里，我们有四种角色：
* Observable
* Observer
* Subscriber
* Subjects

Observables和Subjects是两个“生产”实体，Observers和Subscribers是两个“消费”实体。

## Observable

当我们异步执行一些复杂的事情，Java提供了传统的类，例如Thread、Future、FutureTask、CompletableFuture来处理这些问题。当复杂度提升，这些方案就会变得麻烦和难以维护。最糟糕的是，它们都不支持链式调用。

RxJava Observables被设计用来解决这些问题。它们灵活，且易于使用，也可以链式调用，并且可以作用于单个结果程序上，更有甚者，也可以作用于序列上。无论何时你想发射单个标量值，或者一连串值，甚至是无穷个数值流，你都可以使用Observable。

Observable的生命周期包含了三种可能的易于与Iterable生命周期事件相比较的事件，下表展示了如何将Observable async/push 与 Iterable sync/pull相关联起来。

| Event| Iterable(pull)|Observable(push)|
| ------------- |:-------------:| -----:|
| 检索数据|`T next()`| `onNext(T)` |
| 发现错误| `throws Exception`|`onError(Throwable)`|
| 完成    |`!hasNext()`|`onCompleted()`|

使用Iterable时，消费者从生产者那里以同步的方式得到值，在这些值得到之前线程处于阻塞状态。相反，使用Observable时，生产者以异步的方式把值推给观察者，无论何时，这些值都是可用的。这种方法之所以更灵活是因为即便值是同步或异步方式到达，消费者在这两种场景都可以根据自己的需要来处理。

为了更好地复用Iterable接口，RxJava Observable类扩展了GOF观察者模式的语义。引入了两个新的接口：
* onCompleted() 即通知观察者Observable没有更多的数据。
* onError() 即观察者有错误出现了。


### 热Observables和冷Observables

从发射物的角度来看，有两种不同的Observables:热的和冷的。一个"热"的Observable典型的只要一创建完就开始发射数据，因此所有后续订阅它的观察者可能从序列中间的某个位置开始接受数据（有一些数据错过了）。一个"冷"的Observable会一直等待，直到有观察者订阅它才开始发射数据，因此这个观察者可以确保会收到整个数据序列。

### 创建一个Observable

在接下来的小节中将讨论Observables提供的两种创建Observable的方法。

#### Observable.create()

create()方法使开发者有能力从头开始创建一个Observable。它需要一个OnSubscribe对象,这个对象继承Action1,当观察者订阅我们的Observable时，它作为一个参数传入并执行call()函数。
```java
Observable.create(new Observable.OnSubscribe<Object>(){
        @Override
        public void call(Subscriber<? super Object> subscriber) {
            
        }
});
```
Observable通过使用subscriber变量并根据条件调用它的方法来和观察者通信。让我们看一个“现实世界”的例子：
```java
Observable<Integer> observableString = Observable.create(new Observable.OnSubscribe<Integer>() {
        @Override
        public void call(Subscriber<? super Integer> observer) {
            for (int i = 0; i < 5; i++) {
                observer.onNext(i);
            }
            observer.onCompleted();
        }
});

Subscription subscriptionPrint = observableString.subscribe(new Observer<Integer>() {
    @Override
    public void onCompleted() {
        System.out.println("Observable completed");
    }

    @Override
    public void onError(Throwable e) {
        System.out.println("Oh,no! Something wrong happened！");
    }

    @Override
    public void onNext(Integer item) {
        System.out.println("Item is " + item);
    }
});
```
例子故意写的简单，是因为即便是你第一次见到RxJava的操作，我想让你明白接下来要发生什么。

我们创建一个新的`Observable<Integer>`,它执行了5个元素的for循环，一个接一个的发射他们，最后完成。

另一方面，我们订阅了Observable，返回一个Subscription
。一旦我们订阅了，我们就开始接受整数，并一个接一个的打印出它们。我们并不知道要接受多少整数。事实上，我们也无需知道是因为我们为每种场景都提供对应的处理操作：
* 如果我们接收到了整数，那么就打印它。
* 如果序列结束，我们就打印一个关闭的序列信息。
* 如果错误发生了，我们就打印一个错误信息。

#### Observable.from()

在上一个例子中，我们创建了一个整数序列并一个一个的发射它们。假如我们已经有一个列表呢？我们是不是可以不用for循环而也可以一个接一个的发射它们呢？

在下面的例子代码中，我们从一个已有的列表中创建一个Observable序列：
```java
List<Integer> items = new ArrayList<Integer>();
items.add(1);
items.add(10);
items.add(100);
items.add(200);

Observable<Integer> observableString = Observable.from(items);
Subscription subscriptionPrint = observableString.subscribe(new Observer<Integer>() {
    @Override
    public void onCompleted() {
        System.out.println("Observable completed");
    }

    @Override
    public void onError(Throwable e) {
        System.out.println("Oh,no! Something wrong happened！");
    }

    @Override
    public void onNext(Integer item) {
        System.out.println("Item is " + item);
    }
});
```

输出的结果和上面的例子绝对是一样的。

`from()`创建符可以从一个列表/数组来创建Observable,并一个接一个的从列表/数组中发射出来每一个对象，或者也可以从Java `Future`类来创建Observable，并发射Future对象的`.get()`方法返回的结果值。传入`Future`作为参数时，我们可以指定一个超时的值。Observable将等待来自`Future`的结果；如果在超时之前仍然没有结果返回，Observable将会触发`onError()`方法通知观察者有错误发生了。

#### Observable.just()

如果我们已经有了一个传统的Java函数，我们想把它转变为一个Observable又改怎么办呢？我们可以用`create()`方法，正如我们先前看到的，或者我们也可以像下面那样使用以此来省去许多模板代码：
```java
Observable<String> observableString = Observable.just(helloWorld());

Subscription subscriptionPrint = observableString.subscribe(new Observer<String>() {
    @Override
    public void onCompleted() {
        System.out.println("Observable completed");
    }

    @Override
    public void onError(Throwable e) {
        System.out.println("Oh,no! Something wrong happened!");
    }

    @Override
    public void onNext(String message) {
        System.out.println(message);
    }
});
```

`helloWorld()`方法比较简单，像这样：
```java
private String helloWorld(){
    return "Hello World";
}
```

不管怎样，它可以是我们想要的任何函数。在刚才的例子中，我们一旦创建了Observable，`just()`执行函数，当我们订阅Observable时，它就会发射出返回的值。

`just()`方法可以传入一到九个参数，它们会按照传入的参数的顺序来发射它们。`just()`方法也可以接受列表或数组，就像`from()`方法，但是它不会迭代列表发射每个值,它将会发射整个列表。通常，当我们想发射一组已经定义好的值时会用到它。但是如果我们的函数不是时变性的，我们可以用just来创建一个更有组织性和可测性的代码库。

最后注意`just()`创建符，它发射出值后，Observable正常结束，在上面那个例子中，我们会在控制台打印出两条信息：“Hello World”和“Observable completed”。

#### Observable.empty(),Observable.never(),和Observable.throw()

当我们需要一个Observable毫无理由的不再发射数据正常结束时，我们可以使用`empty()`。我们可以使用`never()`创建一个不发射数据并且也永远不会结束的Observable。我们也可以使用`throw()`创建一个不发射数据并且以错误结束的Observable。


## Subject = Observable + Observer

`subject`是一个神奇的对象，它可以是一个Observable同时也可以是一个Observer：它作为连接这两个世界的一座桥梁。一个Subject可以订阅一个Observable，就像一个观察者，并且它可以发射新的数据，或者传递它接受到的数据，就像一个Observable。很明显，作为一个Observable，观察者们或者其它Subject都可以订阅它。

一旦Subject订阅了Observable，它将会触发Observable开始发射。如果原始的Observable是“冷”的，这将会对订阅一个“热”的Observable变量产生影响。

RxJava提供四种不同的Subject：
* PublishSubject
* BehaviorSubject
* ReplaySubject.
* AsyncSubject

### PublishSubject

Publish是Subject的一个基础子类。让我们看看用PublishSubject实现传统的Observable `Hello World`:
```java
PublishSubject<String> stringPublishSubject = PublishSubject.create();
Subscription subscriptionPrint = stringPublishSubject.subscribe(new Observer<String>() {
    @Override
    public void onCompleted() {
        System.out.println("Observable completed");
    }

    @Override
    public void onError(Throwable e) {
        System.out.println("Oh,no!Something wrong happened!");                
    }

    @Override
    public void onNext(String message) {
        System.out.println(message);
    }
});
stringPublishSubject.onNext("Hello World");
```

在刚才的例子中，我们创建了一个`PublishSubject`，用`create()`方法发射一个`String`值，然后我们订阅了PublishSubject。此时，没有数据要发送，因此我们的观察者只能等待，没有阻塞线程，也没有消耗资源。就在这随时准备从subject接收值，如果subject没有发射值那么我们的观察者就会一直在等待。再次声明的是，无需担心：观察者知道在每个场景中该做什么，我们不用担心什么时候是因为它是响应式的：系统会响应。我们并不关心它什么时候响应。我们只关心它响应时该做什么。

最后一行代码展示了手动发射字符串“Hello World”,它触发了观察者的`onNext()`方法，让我们在控制台打印出“Hello World”信息。

让我们看一个更复杂的例子。话说我们有一个`private`声明的Observable，外部不能访问。Observable在它生命周期内发射值，我们不用关心这些值，我们只关心他们的结束。

首先，我们创建一个新的PublishSubject来响应它的`onNext()`方法，并且外部也可以访问它。

```java
final PublishSubject<Boolean> subject = PublishSubject.create();
        
subject.subscribe(new Observer<Boolean>() {
    @Override
    public void onCompleted() {
        
    }

    @Override
    public void onError(Throwable e) {

    }

    @Override
    public void onNext(Boolean aBoolean) {
        System.out.println("Observable Completed");
    }
});
```
然后，我们创建“私有”的Observable，只有subject才可以访问的到。
```java
Observable.create(new Observable.OnSubscribe<Integer>() {
    @Override
    public void call(Subscriber<? super Integer> subscriber) {
        for (int i = 0; i < 5; i++) {
            subscriber.onNext(i);
        }
        subscriber.onCompleted();
    }
}).doOnCompleted(new Action0() {
    @Override
    public void call() {
        subject.onNext(true);
    }
}).subscribe();
```
`Observable.create()`方法包含了我们熟悉的for循环，发射数字。`doOnCompleted()`方法指定当Observable结束时要做什么事情：在subject上发射true。最后，我们订阅了Observable。很明显，空的`subscribe()`调用仅仅是为了开启Observable，而不用管已发出的任何值，也不用管完成事件或者错误事件。为了这个例子我们需要它像这样。

在这个例子中，我们创建了一个可以连接Observables并且同时可被观测的实体。当我们想为公共资源创建独立、抽象或更易观测的点时，这是极其有用的。

### BehaviorSubject

简单的说，BehaviorSubject会首先向他的订阅者发送截至订阅前最新的一个数据对象（或初始值）,然后正常发送订阅后的数据流。

```java
BehaviorSubject<Integer> behaviorSubject = BehaviorSubject.create(1);
```
在这个短例子中，我们创建了一个能发射整形(Integer)的BehaviorSubject。由于每当Observes订阅它时就会发射最新的数据，所以它需要一个初始值。
### ReplaySubject

ReplaySubject会缓存它所订阅的所有数据,向任意一个订阅它的观察者重发:
```java
ReplaySubject<Integer> replaySubject = ReplaySubject.create();
```

### AsyncSubject

当Observable完成时AsyncSubject只会发布最后一个数据给已经订阅的每一个观察者。

```java
AsyncSubject<Integer> asyncSubject = AsyncSubject.create();
```

## 总结

本章中，我们了解到了什么是观察者模式，为什么Observables在今天的编程场景中如此重要，以及如何创建Observables和subjects。

下一章中，我们将创建第一个基于RxJava的Android应用程序，学习如何检索数据来填充listview，以及探索如何创建一个基于RxJava的响应式UI。