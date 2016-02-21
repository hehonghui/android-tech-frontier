RxJava中repeatWhen 和 retryWhen 操作符的解释
---

> * 原文链接 : [RxJava's repeatWhen and retryWhen, explained](http://blog.danlew.net/2016/01/25/rxjavas-repeatwhen-and-retrywhen-explained/)
* 原文作者 : [Dan Lew](https://github.com/dlew)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [lowwor](https://github.com/lowwor) 
* 校对者:  
* 状态 :  完成 


[```repeatWhen```][1] and [```retryWhen```][2] are fairly baffling at first glance. For starters, they are serious contenders for "most confusing marble diagrams":

[```repeatWhen```][1] 和 [```retryWhen```][2] 操作符在第一眼看上去的时候，就会让人觉得相当困惑。 对于初学者来说，这两个操作符的marble图算是最难看懂的几个之一了。 

![retryWhen][3]

They're useful operators: they allow you to conditionally resubscribe to ```Observables``` that have terminated. I recently studied how they worked and I want to try to explain them (since it took me a while to grasp).

这两个都是非常有用的操作符：它们让你可以有条件地重新订阅（resubscribe）已经终止了的```Observables```。我最近一直在研究它们的工作原理，我将试着去尽可能地把它们解释清楚（因为我也花了不少时间才算掌握它们）。

Repeat vs. Retry
----------------

First of all, what is the difference between their simpler counterparts: [```repeat()```][4] and [```retry```][5]? This part is simple: the difference is which terminal event causes a resubscription.

首先，我们先来看看它们所对应的简单版本的操作符：[```repeat()```][4] 和 [```retry```][5]的区别?这部分很简单，主要的区别在于触发重新订阅（resubscription）的终止事件（terminal event）的类型不同。

**```repeat()``` resubscribes when it receives ```onCompleted()```.**

**```repeat()``` 在接收到```onCompleted()```时重新订阅.**

**```retry()``` resubscribes when it receives ```onError()```.**

**```retry()``` 在接收到 ```onError()```时重新订阅。**


However, these simple versions can leave something to be desired. What if you want to delay resubscription by a couple seconds? Or examine the error to determine if you should resubscribe? That's where ```repeatWhen``` and ```retryWhen``` step in; they let you provide custom logic for the retries.

但是，如果我们的需求比这更加复杂的话，比如说，如果你想将重新订阅的时间往后延迟个几秒怎么办？
或者想通过判断错误（error）的类型来决定是否需要重新订阅。这时候我们就需要用到```repeatWhen``` 和 ```retryWhen```了，它们可以允许我们为重试（retry）添加自定义的逻辑。

Notification Handler
--------------------

You provide the retry logic through a function known as the ```notificationHandler```. Here's the method signature for ```retryWhen```:

你需要通过一个function也就是```notificationHandler```来提供重试的逻辑，下面是```retryWhen```的方法签名（method signature）

```retryWhen(Func1<? super Observable<? extends java.lang.Throwable>,? extends Observable<?>> notificationHandler)  ```

That's a mouthful! I found this signature hard to parse since it's a mess of generics.

有点拗口，我也觉得这个签名（signature）很难去解析，因为它充满了各种泛型。

Simplified, it consists of three parts:

简单来说，它由三个部分组成

1. The ```Func1``` is a factory for providing your retry logic.
2. The input is an ```Observable<Throwable>```.
3. The output is an ```Observable<?>```.

<!--你看不到我-->

1. ```Func1``` 是一个工厂（factory），用来提供你的重试逻辑。
2. 输入是一个 ```Observable<Throwable>```。
3. 输出是一个 ```Observable<?>```。


Let's look at the last part first. The emissions of the ```Observable<?>``` returned determines whether or not resubscription happens. If it emits ```onCompleted``` or ```onError``` then it doesn't resubscribe. But if it emits ```onNext``` then it does (regardless of what's actually in the ```onNext```). That's why it's using the wildcard for its generic type: it's just the notification (next, error or completed) that matters.

我们先来看一下最后一部分。返回的```Observable<?>```所发出的事件（emissions）决定了要不要重新进行订阅（resubscription）。如果它发出（emit）的是```onCompleted``` 或者 ```onError``` ，那么将不会重新订阅。如果它发出的是```onNext```，那么将重新订阅（无论所发出的```onNext```里的东西是什么）。这也是为什么它使用了通配符作为它的泛型类型：起作用的是这个事件（notification）本身。

The input is an ```Observable<Throwable>``` that emits anytime the source calls ```onError(Throwable)```. In other words, it triggers each time you need to decide whether to retry or not.

输入是一个```Observable<Throwable>```，每当源（source）调用（call）```onError(Throwable)```的时候，这个Observable就会发出事件。换句话说，就是每当需要你决定是否重新订阅的时候，它就有事件发出。


The factory ```Func1``` is called on subscription to setup the retry logic. That way, when ```onError``` is called, you've already defined how to handle it.

工厂 ```Func1```在订阅时（subscription）被调用，用以初始化重试逻辑。这样一来，每当 ```onError``` 被调用的时候，你就已经定义好了如何去处理这个事件了。

Here's an example wherein we resubscribe to the source if the ```Throwable``` is an ```IOException```, but otherwise do not:

下面是一个例子，在这个例子中，当```Throwable``` 是一个```IOException```的时候，我们将会去重新订阅源（source），其他情况下则不。
```
source.retryWhen(errors -> errors.flatMap(error -> {  
// For IOExceptions, we  retry
if (error instanceof IOException) {
return Observable.just(null);
}

// For anything else, don't retry
return Observable.error(error);
})
)
```
Each error is flatmapped so that we can either return ```onNext(null)``` (to trigger a resubscription) or ```onError(error)``` (to avoid resubscription).

每一个错误（error）都被flatmap了，所以我们可以选择在其中返回 ```onNext(null)```（来触发重新订阅）或者```onError(error)``` （不再重新订阅）。

Observations
------------

Here's some key points about ```repeatWhen``` and ```retryWhen``` which you should keep in mind.

下面是一些关于```repeatWhen``` 和 ```retryWhen``` 的关键点，我们要牢牢记住它们

- **```repeatWhen``` is identical to ```retryWhen```, only it responds to ```onCompleted``` instead of ```onError```.** The input is ```Observable<Void>```, since ```onCompleted``` has no type.

-  **```repeatWhen``` 跟```retryWhen```几乎是一样的,唯一的区别在于，```repeatWhen```响应的是 ```onCompleted``` ，而不是 ```onError```。** 而因为 ```onCompleted``` 是没有类型的，所以它的输入是一个 ```Observable<Void>```。

- **The ```notificationHandler``` (i.e. ```Func1```) is only called once per subscription.** This makes sense as you are given an ```Observable<Throwable>```, which can emit any number of errors.

- **```notificationHandler``` (也就是 ```Func1```)在每一个subscription中只会被调用一次** 这也说的通，因为你拿到的是一个 ```Observable<Throwable>```, 它可以发出任意数目的错误（error）。

- **The output ```Observable``` has to use the input ```Observable``` as its source.** You must react to the Observable<Throwable> and emit based on it; you can't just return a generic stream. 

- **输出的 ```Observable``` 必须要利用到输入的```Observable``` 。** 你必须响应（react）输入的Observable<Throwable> ，并在它的基础上发出（emit）东西，你不能仅仅返回一个泛型的流（generic stream）

In other words, you can't do something like ```retryWhen(errors -> Observable.just(null))```. Not only will it not work, it completely breaks your sequence. You need to, at the very least, return the input, like ```retryWhen(errors -> errors)``` (which, by the way, duplicates the logic of the simpler ```retry()```).

换句话说，你不能像```retryWhen(errors -> Observable.just(null))```这样做。不只是因为它不会按照你想象的那样去运行，而且它也完全打破了你的序列（sequence）。你至少也得像这样```retryWhen(errors -> errors)```，直接把输入返回去（顺便提一下，这跟```retry()```的逻辑是一样的）

- The ```Observable``` input only triggers on terminal events (```onCompleted``` for ```repeatWhen``` / ```onError``` for ```retryWhen```). It doesn't receive any of the onNext notifications from the source, so you can't examine the emitted data to determine if you should resubscribe. If you want to do that, you have to add an operator like ```takeUntil()``` to cut off the stream.

- 输入的 ```Observable``` 只有在遇到终止事件（terminal event）时才会被触发 ( 对于 ```repeatWhen```是```onCompleted``` /  对于 ```retryWhen```是```onError```)。 它不会接收任何来自源的onNext通知（notification）, 所以你不能通过校验发出的数据去决定是否重新订阅。如果你想这样做的话，你要加入像```takeUntil()```之类的操作符来截断这个流（stream）。

Uses
----

Now that you (vaguely) understand ```retryWhen``` and ```repeatWhen```, what sort of logic can you stick in the ```notificationHandler```?

现在，你已经（大概）理解了```retryWhen``` 和 ```repeatWhen```，那么我们可以在```notificationHandler```里加入哪些逻辑呢？

**Poll for data periodically using ```repeatWhen``` + ```delay```:**

**利用```repeatWhen``` + ```delay```实现服务器轮询:**

```source.repeatWhen(completed -> completed.delay(5, TimeUnit.SECONDS))  ```

The source isn't resubscribed until the ```notificationHandler``` emits ```onNext()```. Since delay waits some time before emitting ```onNext()```, this has the effect of delaying resubscription so you can avoid constantly polling data.

只有在```notificationHandler``` 发出 ```onNext()```事件之后，源（source）才会被重新订阅。因为 delay 会让 ```onNext()```先等待一段时间再发出, 这也就实现了对重新订阅的延时， 从而避免了一直不停地去查询服务器的数据。

**Alternatively, delay resubscription with ```flatMap``` + ```timer```:**

**另一个方案，利用 ```flatMap``` + ```timer```来实现延迟重新订阅（resubscription）:**

```source.retryWhen(errors -> errors.flatMap(error -> Observable.timer(5, TimeUnit.SECONDS)))  ```

This alternative is useful when combined with other logic, such as...

这个方案在需要和别的逻辑结合起来使用时很有用。比如说...


**Resubscribe a limited number of times with ```zip``` + ```range```:**

**利用 ```zip``` + ```range```来限制重试的次数：**

```source.retryWhen(errors -> errors.zipWith(Observable.range(1, 3), (n, i) -> i))```  

The end result is that each error is paired with one of the outputs of ```range```, like so:

这样做最后的结果就是每一个错误（error）都会与 ```range```的一个输出成对结合起来, 像这样:
```
zip(error1, 1) -> onNext(1)  <-- Resubscribe  
zip(error2, 2) -> onNext(2)  <-- Resubscribe  
zip(error3, 3) -> onNext(3)  <-- Resubscribe  
onCompleted()                <-- No resubscription  
```
Since ```range(1, 3)``` runs out of numbers on the fourth error, it calls ```onCompleted()```, which causes the entire zip to complete. This prevents further retries.

在第四个错误的时候，因为```range(1, 3)```里所有数字都用掉了，所以它会调用```onCompleted()```，让整个zip结束掉（complete）。从而避免了再去重试。

**Combine the above for limited retries with variable delays:**

将上面的重试次数限制、重试延迟时间结合起来

```
source.retryWhen(errors ->  
errors
.zipWith(Observable.range(1, 3), (n, i) -> i)
.flatMap(retryCount -> Observable.timer((long) Math.pow(5, retryCount), TimeUnit.SECONDS))
);
```
```flatMap``` + ```timer``` is preferable over ```delay``` in this case because it lets us modify the delay by the number of retries. The above retries three times and delays each retry by ```5 ^ retryCount```, giving you exponential backoff with just a handful of operators!

在这种情况下， 相较于```delay```，我更加推荐使用```flatMap``` + ```timer```，因为后者可以让我们根据重试的次数调整延时时间。上面的代码会进行三次重试，并且每一次重试都会有```5 ^ retryCount```的延时，寥寥几个操作符就实现了指数退避（exponential backoff）的功能。


[1]: http://reactivex.io/RxJava/javadoc/rx/Observable.html#repeatWhen%28rx.functions.Func1%29
[2]: http://reactivex.io/RxJava/javadoc/rx/Observable.html#retryWhen%28rx.functions.Func1%29
[3]: https://danlew.ghost.io/content/images/2016/01/retryWhen-small.png
[4]: http://reactivex.io/RxJava/javadoc/rx/Observable.html#repeat%28%29
[5]: http://reactivex.io/RxJava/javadoc/rx/Observable.html#retry%28%29