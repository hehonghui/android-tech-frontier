利用Retrofit和RxJava实现服务器轮询和出错重试
---

> * 原文链接 : [Server polling and retrying failed operations. With Retrofit and RxJava.](https://medium.com/@v.danylo/server-polling-and-retrying-failed-operations-with-retrofit-and-rxjava-8bcc7e641a5a#.ebhq12x34)
* 原文作者 : [Danylo Volokh](https://github.com/danylovolokh)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [lowwor](https://github.com/lowwor) 
* 校对者:  
* 状态 :  完成 

A very common case in developing rest application is server polling and retry. When server is doing some job and we need to ask (with some delay) if it’s finished, also when we got an error, sometimes we want to retry. I’ve decided to write about that after I stuck with implementing server polling correctly with RxJava. Eventually I got a good answer about it in [this stackoverflow question][1].

在开发一个rest应用的时候，一种很常见的情形是，要对服务器进行轮询和重试。当服务器正在进行某些任务的时候，我们需要（以一定的延时）查询服务器这个任务是否完成了，同时，当我们出错的时候，有时我们要进行重试。当我在想着如何利用RxJava来正确地实现服务器轮询的时候，我就想写一篇关于这个话题的文章了。最终，我在[这个StackOverflow问题中][1]找到了一个很好的解决方案。


In this article I will explain how easily we can do it with RxJava and Retrofit 1. I assume that you already know how to work with RxJava, Retrofit and how to set up application architecture with these great tools.

在这篇文章中，我会解释用RxJava和Retrofit来实现这个功能是多么的容易。我假定你已经了解了RxJava，Retrofit的使用并且已经能够利用这些库来实现相应的应用架构。

A few definitions that I will use in this article:

在文章中我将用到的一些定义

- “Predicate” — a class that is passed to some Observable methods, for Example: Observable.filter(/*here we pass the predicate*/), Observable.takeUntil(/*here we pass the predicate*/).

“Predicate” 一个被传到Observable的一些方法中的类，举例来说：Observable.filter(/*在这里传进来predicate*/), Observable.takeUntil(/*在这里传进来predicate*/)

- “Child of Observable” — an Observer that is chained after parents Observable. For example:

“Child of Observable” 一个被链接（chained）在父Observable后的Observer。例如：
```
Observable
.filter(/*predicate here*/)
.takeUntil(/*predicate here*/)
.subscribe(/*subscriber here/)
```

Observable returned from **takeUntil()** is a child of Observable returned by **filter()**, the Subscriber that is passed as a parameter to the **subscribe()** is a child of Observable returned from **takeUntil()**.

**takeUntil()**返回的Observable是**filter()**返回的Observable的子元素（child）。作为参数传递给**subscribe()**的Subscriber是**takeUntil()**返回的Observable的子元素（child）。

Server Polling. 服务器轮询
---------------

This is the case when you are waiting for some job to be done by the server and you have to periodically make an API call to know if it’s already done.

所谓服务器轮询，也就是，当你需要等待服务器去完成某项任务时，你就要周期性地调用API接口来查询该项任务是否已经完成。

Here is sample code:

示例代码如下
```
/**
* This is a class that should be
* mapped on your json response from the server
*/
/**
* 这个类用来映射（map）从服务器返回的json数据
* 
*/
class ServerPollingResponse {
boolean isJobDone;

@Override
public String toString() {
return "isJobDone=" + isJobDone;
}
}

Subscription checkJobSubscription = mDataManager.pollServer(inputData)
.repeatWhen(new Func1<Observable<? extends Void>, Observable<?>>() {
@Override
public Observable<?> call(Observable<? extends Void> observable) {
Log.v(TAG, "repeatWhen, call");
/**
* This is called only once.
* 5 means each repeated call will be delayed by 5 seconds
*/   
/**
* 这个方法只会被调用一次。
* 5 表示每次重复的调用（repeated call）会被延迟5s。
*/
return observable.delay(5, TimeUnit.SECONDS);
}
})
.takeUntil(new Func1<ServerPollingResponse, Boolean>() {
@Override
public Boolean call(ServerPollingResponse response) {
/** Here we can check if the responce is correct and if we should
*  finish polling
*  We finish polling when job is done.
*  In other words : "We stop taking when job is done"
*/
/** 在这里，我们可以检查服务器返回的数据是否正确，和决定我们是否应该
*  停止轮询。
*  当服务器的任务完成时，我们停止轮询。
*  换句话说，“当任务（job）完成时，我们不拿（take）了”
*/
Log.v(TAG, "takeUntil, call response " + response);
return response.isJobDone;
}
})
.filter(new Func1<ServerPollingResponse, Boolean>() {
@Override
public Boolean call(ServerPollingResponse response) {
/**
* We are filtering results if we return "false".
* Filtering means that onNext() will not be called.
* But onComplete() will be delivered.
*/
/**
* 如果我们在这里返回“false”的话，那这个结果会被过滤掉（filter）
* 过滤（Filtering） 表示 onNext() 不会被调用.
* 但是 onComplete() 仍然会被传递.
*/
Log.v(TAG, "filter, call response " + response);
return response.isJobDone;
}
})
.subscribe(
new Subscriber<ServerPollingResponse>() {
@Override
public void onCompleted() {
Log.v(TAG, "onCompleted ");
}

@Override
public void onError(Throwable e) {
Log.v(TAG, "onError ");
}

@Override
public void onNext(ServerPollingResponse response) {
Log.v(TAG, "onNext response " + response);
// Do whatever you need. Server polling has been finished
//服务器轮询停止了，你可以做些其他事情。
}
}
);
```
It looks big, but it’s very easy to understand and it’s written with elegant chain of operators.

代码看起来很多，但是很容易理解，并且利用了优雅的链式操作符。

Assume that server returned “**isJobDone=true**” after third attempt, here is the log:

假如服务器在三次请求后才返回 “**isJobDone=true**” , log打印如下:
```
repeatWhen, call
// at this stage the API call is performed
//在这里发起了api请求
filter, call response isJobDone=false
takeUntil, call response isJobDone=false
```
```
// at this stage the API call is performed again
//在这里再次发起了api请求
filter, call response isJobDone=false
takeUntil, call response isJobDone=false
```
```
// at this stage the API call is performed for the third time
//在这里，第三次发起api请求
filter, call response isJobDone=true
onNext response isJobDone=true
takeUntil, call response isJobDone=true
onCompleted
```
In the next section I’ll explain why methods are called in that way.

在下一个部分中，我将解释为什么方法会那样被调用

RxJava internals explained for server polling implementation.服务器轮询实现方法的RxJava内部原理解释
-------------------------------------------------------------

After the http request first of all the **call()** method of **filter()** predicate is called.

发起http请求后，在所有**call()**方法中， **filter()**的predicate中的**call()**方法会第一个被调用。

If we return “false” from **filter()** it means that result is not satisfying and we should not deliver it to the **Subscriber<ServerPollingResponse>**. Here we get the following chain of events:

如果我们在**filter()** 中返回“false”，表明我们对结果（result）不满意，不要把这个结果传给 **Subscriber<ServerPollingResponse>**。在这里，发生的链式事件如下：

1. We returned “false”, it means that result was not delivered to the child of **filter()** aka **Subscriber<ServerPollingResponse>**.

我们返回“false”，表明这个结果（result）不会被传递到 **filter()**的子元素（child）**Subscriber<ServerPollingResponse>**中。

2. The call to **onNext()** was passed to **takeUntil()** Observable and **call()** method of its predicate was called.

对**onNext()**的调用会被传递到 **takeUntil()**的Observable中，然后它的predicate的**call()** 方法会被调用

3. We see that “job is not done yet” and we return “false” from **call()** method of **takeUntil()**.

我们看到“job 还没有被完成”，所以我们在**takeUntil()**的**call()**方法中返回“false”

4. It means that **onNext()** and **onComplete()** of **repeatWhen()** Observable will be called.

这表示**repeatWhen()**的**onNext()**和**onComplete()**会被调用

5. When **onComplete()** is called it causes a resubscribe to the original Observable with 5 seconds of delay. Basically this is causing http request to be called again. Which was our goal.

当**onComplete()** 被调用时，他会触发一个延时5s的对原始Observable的重新订阅（resubscriber）。也就是会再次发起http请求，也是我们要实现的目的。

If we return “true” from **filter()** it means that this result is satisfying and we get following chain of events:

如果我们在**filter()**中返回“true”，表明我们对这个结果（result）是满意的，链式事件如下：

1. Result is delivered to **onNext(ServerPollingResponse response)** of filter’s child — the **Subscriber<ServerPollingResponse>**.

结果（result）被传递到了filter的子元素（child）**Subscriber<ServerPollingResponse>**的**onNext(ServerPollingResponse response)** 中

2. Then this result is delivered to **call()** method of **takeUntil()** predicate.

然后这个结果（result）被传递到了**takeUntil()**的predicate的**call()**方法中

3. We also return “true” from **takeUntil()** because we got the “job done”.

在 **takeUntil()** 中，我们也返回 “true”，因为“任务完成了（job done）”

4. Because we returned “true”, the **takeUntil()** operator calls **onComplete()** on its child. The child of **takeUntil()** is **filter()**.

因为我们返回了“true”，**takeUntil()**操作符会调用它的子元素(child)**filter()**的**onComplete()** .

5. **filter()** calls the **onComplete()** of its child — which is the **Subscriber<ServerPollingResponse>**.

**filter()** 调用它的子元素**Subscriber<ServerPollingResponse>**的 **onComplete()**方法

6. **takeUntil()** unsubscribes immediately, that’s why Observable of **repeatWhen()** will not get a call to **onNext()** or **onComplete()** and the http request won’t be called again.

**takeUntil()**会马上取消订阅（unsubscribe），这也是为什么**repeatWhen()**的Observable的**onNext()**或者**onComplete()**不会被调用的原因，http请求也就不会被再次发起。


The chain is terminated by internal unsubscribe() that is called from takeUntil() operator.

整个链是由takeUntil()操作符调用内部的unsubscribe()来终止的。

Server polling with increasing the time of waiting on each repeat.服务器轮询的等待时间随着重试次数的增加而增加
------------------------------------------------------------------

The basic principle is the same. We just need to add a few chaining methods to the **repeatWhen()** predicate:

基本原理是一样的。我们只要向**repeatWhen()**的predicate中增加一些链式方法（chaning method）就行了。
```
private static final int COUNTER_START = 1;
private static final int ATTEMPTS = 5;
private static final int ORIGINAL_DELAY_IN_SECONDS = 10;

// this is new methods chain in repeatWhen predicate call function
repeatWhen(new Func1<Observable<? extends Void>, Observable<?>>() {
@Override
public Observable<?> call (Observable < ?extends Void > observable){
Log.v(TAG, "repeatWhen, call");

return observable.zipWith(Observable.range(COUNTER_START, ATTEMPTS), new Func2<Void, Integer, Integer>() {
@Override
public Integer call(Void aVoid, Integer attempt) {
Log.v(TAG, "zipWith, call, attempt " + attempt);
return attempt;
}
}).flatMap(new Func1<Integer, Observable<?>>() {
@Override
public Observable<?> call(Integer repeatAttempt) {
Log.v(TAG, "flatMap, call, repeatAttempt " + repeatAttempt);
// increase the waiting time
// 增加等待时间
return Observable.timer(repeatAttempt * ORIGINAL_DELAY_IN_SECONDS, TimeUnit.SECONDS);
}
});
}
})
```
Here before each API call the original delay time is multiplied by the value of the attempt. Very simple and effective.

在这里，每发起一次api请求前的延时时间是随着尝试次数的增长而乘法式地增加的。非常简单高效。

Here is the log:
打印信息如下
```
repeatWhen, call
// here is our first API call
//这里是我们的第一次API请求
filter, call response isJobDone=false
takeUntil, response isJobDone=false
zipWith, call, attempt 1
flatMap, call, repeatAttempt 1
```
```
// wait 10 seconds and run API call for the second time
//等待10s后发起第二次请求
filter, call response isJobDone=false
takeUntil, response isJobDone=false
zipWith, call, attempt 2
flatMap, call, repeatAttempt 2
```
```
// wait 20 seconds and run API call for the third time
//等待20s后发起第三次请求
filter, call response isJobDone=true
onNext response isJobDone=true
takeUntil, response isJobDone=true
onCompleted
```
Please find the explanation below.
解释如下

RxJava zipWith() and flatMap() explained. RxJava中 zipWith()和flatMap()的解释
-----------------------------------------

I will omit those parts that were explained previously and jump right to the most relevant — **zipWith()** and **flatMap()**.

我会略过前面讲过的东西，直接解释一下与**zipWith()** 和 **flatMap()**相关的东西。

1. After **takeUntil()** did it’s job the Observable returned from **repeatWhen()** starts its work. This Observable is a combined result of two functions: **zipWith()** and **flatMap()**.

当**takeUntil()** 完成它的工作以后，从**repeatWhen()** 返回的Observable会开始工作。这个Observable是**zipWith()** 和 **flatMap()**一起作用的结果（combined result）。

2. **zipWith(parameter1, parameter2)** take values emitted from Observable that came into **repeatWhen()** which is **Void aVoid** and value emitted by parameter1 aka **Observable.range(COUNTER_START, ATTEMPTS)** and passes it into function **call(Void, Integer)** method. In **call()** method we can do some stuff with these two parameters and return a value (In our case it’s Integer, but it can be anything, if we want something else we just need to change the third generic type in **new Func2< Void, Integer, /* change this */ Integer>**) but we just return the value we got from our Observable, this value is the repeat attempt.

**zipWith(parameter1, parameter2)**会拿到**repeatWhen()**里的Observable所发射的值，也就是**Void aVoid**，还会拿到由它的第一个参数，也就是**Observable.range(COUNTER_START, ATTEMPTS)** 所发射的值，然后将这两个值传递给函数（function） **call(Void, Integer)**。在**call()** 方法中，我们可以利用这两个参数做一些操作，然后返回一个值（虽然在我们的例子中，是一个Integer，但是它也可以是其它任何类型，如果我们想返回其它类型的话，只需要改一下**new Func2 < Void, Integer, /* 改这个 */ Integer>**) ）中的第三个泛型类型就行了），但是在这里，我们只要返回我们从Observable中获取的值就行了，这个值就是重复尝试的次数。

3. The value from **zipWith()** is wrapped into Observable that emits this value. And we handle it in ** flatMap()**.

**zipWith()**中返回的值会被封装到一个发射（emit）这些值的Observable中。然后我们在** flatMap()**中处理这些值。

4. **flatMap()** takes the value and uses it to produce a timer Observable. Timer Observable waits for specified amount of time and passes control down the chain, to the original Observable that does the API call.

**flatMap()**拿到这个值，并利用它们来生成一个计时器Observable（timer Observable）。计时器Observable（timer Observable） 会先等待指定的时间，然后交给链的后续部分来继续处理（passes control down the chain），也就是原来发起api请求的Observable。

We could omit using **zipWith()** and just use **flatMap()** inside the **repeatWhen()**.
我们可以忽略掉**zipWith()**而直接在**repeatWhen()**中使用 **flatMap()** 
```
repeatWhen(new Func1<Observable<? extends Void>, Observable<?>>() {
@Override
public Observable<?> call(Observable<? extends Void> observable) {
Log.v(TAG, "repeatWhen, call");

return observable.flatMap(new Func1<Void, Observable<?>>() {
@Override
public Observable<?> call(Void aVoid) {
if(mCounter > ATTEMPTS){
// terminate by ourselves
throw new RuntimeException();
}
return Observable.timer(mCounter++ * ORIGINAL_DELAY_IN_SECONDS, TimeUnit.SECONDS);
}
});
}
})
```
In this case we would need to have a counter, control the attempt by ourselves and terminate the sequence when we have to stop. But we use **zipWith()** and RxJava does it for us!

一般这种情况，我们需要用一个计数器，自己去控制请求（attempt），并且在需要时终止这一系列操作（ terminate the sequence ）。而在这里，我们利用了**zipWith()**操作符，让RxJava帮我们做了这一切。

Retry when we got an error 出现错误时重试
--------------------------

As you know in Retrofit 1 every network error is handled via **onError()** method.

众所周知，在Retrofit1 中每个网络错误都是交由**onError()**方法处理的

To implement retry when we lost internet connection or get any http status besides 200 OK we have to use **retryWhen()** instead of **repeatWhen()**. And the parameters of **zipWith()** will be a bit different.

为了在失去网络连接或者当返回的http状态是除了200 OK以外的不正常状态时实现重试，我们需要使用 **retryWhen()** 而不是**repeatWhen()**。同时，**zipWith()** 的参数也要做一点变化。

```
retryWhen(new Func1<Observable<? extends Throwable>, Observable<?>>() {
@Override
public Observable<?> call(Observable<? extends Throwable> observable) {
Log.v(TAG, "retryWhen, call");

return observable.zipWith(Observable.range(COUNTER_START, ATTEMPTS), new Func2<Throwable, Integer, Integer>() {
@Override
public Integer call(Throwable throwable, Integer attempt) {
Log.v(TAG, "zipWith, call, attempt " + attempt);
return attempt;
}
})
```
The difference between **repeatWhen()** and **retryWhen()** is that **repeatWhen()** resubscribes when it gets **onNext()** and **retryWhen()** does that when is gets **onError()**.

**repeatWhen()** 和 **retryWhen()**的主要区别就是**repeatWhen()**会在接收到 **onNext()**时重新subscribe，**retryWhen()**则在接收到 **onError()**时重新subscribe。

Lets combine repeatWhen() and retryWhen() to poll the server and retry if we failed.让我们将repeatWhen()和retryWhen()结合起来来实现服务器的轮询和错误重试
------------------------------------------------------------------------

Here is the relevant code:
下面是相关的代码

```
retryWhen(new Func1<Observable<? extends Throwable>, Observable<?>>() {
@Override
public Observable<?> call(Observable<? extends Throwable> observable) {
Log.v(TAG, "retryWhen, call");
return observable.compose(zipWithFlatMap());
}
}).repeatWhen(new Func1<Observable<? extends Void>, Observable<?>>() {
@Override
public Observable<?> call(Observable<? extends Void> observable) {
Log.v(TAG, "repeatWhen, call");
return observable.compose(zipWithFlatMap());
}
})

<T> Observable.Transformer<T, Long> zipWithFlatMap() {
return new Observable.Transformer<T, Long>() {

@Override
public Observable<Long> call(Observable<T> observable) {
return observable.zipWith(Observable.range(COUNTER_START, ATTEMPTS), new Func2<T, Integer, Integer>() {
@Override
public Integer call(T t, Integer repeatAttempt) {
Log.v(TAG, "zipWith, call, repeatAttempt " + repeatAttempt);
return repeatAttempt;
}
}).flatMap(new Func1<Integer, Observable<Long>>() {
@Override
public Observable<Long> call(Integer repeatAttempt) {
Log.v(TAG, "flatMap, call, repeatAttempt " + repeatAttempt);
// increase the waiting time
//增加等待时间
return Observable.timer(repeatAttempt * 5, TimeUnit.SECONDS);
}
});
}
};
}
```
You may notice that I’ve wrapped the **zipWith()** and **flatMap()** into separate method and used compose to reuse it in **repeatWhen()** and **retryWhen()**. Now if we failed we retry, if we got success but “job is not ready yet” we will repeat.

你可能注意到了，我将**zipWith()**和**flatMap()** 封装到了单独的方法中，并且利用compose让它可以在**repeatWhen()**和**retryWhen()**里能够重复使用。现在，如果我们请求失败了，我们会去重试（retry），如果成功了，但是“任务（job）还没完成”，我们会重复一遍（repeat）。

RxJava rocks!
RxJavas实在是太好用了!

Cheers :)
为它喝彩吧 :)


[1]: http://stackoverflow.com/questions/34943734/using-of-skipwhile-combined-with-repeatwhen-in-rxjava-to-implement-server-po/34948978