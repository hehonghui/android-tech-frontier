RxJava以及响应式编程
---

>
* 原文链接 : [Grokking RxJava, Part 3: Reactive with Benefits](http://blog.danlew.net/2014/09/30/grokking-rxjava-part-3/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成




In part 1, I went over the basic structure of RxJava. In part 2, I showed you how powerful operators could be. But maybe you're still not sold; there isn't quite enough there yet to convince you. Here's some of the other benefits that come along with the RxJava framework which should seal the deal.

在第一篇博文中，我给大家介绍了 RxJava 的基本架构；在第二篇博文中，我给你展现了 RxJava 中的操作符可以有多大的威力。但即使你读完这两篇博文，也不会觉得“RxJava大法”好，毕竟我没有提供足够的有说服力的论据去让你觉得“RxJava”大法真的很好。今天我打算通过这篇博文给大家介绍使用 RxJava 框架进行开发能获得的更多好处，我坚信看了这篇博文的人都会跟我一起大喊“RxJava大法好”！

## Error Handling ##

Up until this point, we've largely been ignoring onComplete() and onError(). They mark when an Observable is going to stop emitting items and the reason for why (either a successful completion, or an unrecoverable error).

## 错误控制 ##



Our original Subscriber had the capability to listen to onComplete() and onError(). Let's actually do something with them:

Observable.just("Hello, world!")
    .map(s -> potentialException(s))
    .map(s -> anotherPotentialException(s))
    .subscribe(new Subscriber<String>() {
        @Override
        public void onNext(String s) { System.out.println(s); }

        @Override
        public void onCompleted() { System.out.println("Completed!"); }

        @Override
        public void onError(Throwable e) { System.out.println("Ouch!"); }
    });
Let's say potentialException() and anotherPotentialException() both have the possibility of throwing Exceptions. Every Observable ends with either a single call to onCompleted() or onError(). As such, the output of the program will either be a String followed by "Completed!" or it will just be "Ouch!" (because an Exception is thrown).

There's a few takeaways from this pattern:

onError() is called if an Exception is thrown at any time.

This makes error handling much simpler. I can just handle every error at the end in a single function.

The operators don't have to handle the Exception.

You can leave it up to the Subscriber to determine how to handle issues with any part of the Observable chain because Exceptions skip ahead to onError().

You know when the Subscriber has finished receiving items.

Knowing when a task is done helps the flow of your code. (Though it is possible that an Observable may never complete.)

I find this pattern a lot easier than traditional error handling. With callbacks, you have to handle errors in each callback. Not only does that lead to repetitious code, but it also means that each callback must know how to handle errors, meaning your callback code is tightly coupled to the caller.

With RxJava's pattern, your Observable doesn't even have to know what to do with errors! Nor do any of your operators have to handle error states - they'll be skipped in cases of critical failure. You can leave all your error handling to the Subscriber.

Schedulers
You've got an Android app that makes a network request. That could take a long time, so you load it in another thread. Suddenly, you've got problems!

Multi-threaded Android applications are difficult because you have to make sure to run the right code on the right thread; mess up and your app can crash. The classic exception occurs when you try to modify a View off of the main thread.

In RxJava, you can tell your Observer code which thread to run on using subscribeOn(), and which thread your Subscriber should run on using observeOn():

myObservableServices.retrieveImage(url)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(bitmap -> myImageView.setImageBitmap(bitmap));
How simple is that? Everything that runs before my Subscriber runs on an I/O thread. Then in the end, my View manipulation happens on the main thread1.

The great part about this is that I can attach subscribeOn() and observeOn() to any Observable! They're just operators! I don't have to worry about what the Observable or its previous operators are doing; I can just stick this at the end for easy threading2.

With an AsyncTask or the like, I have to design my code around which parts of the code I want to run concurrently. With RxJava, my code stays the same - it's just got a touch of concurrency added on.

Subscriptions
There's something I've been hiding from you. When you call Observable.subscribe(), it returns a Subscription. This represents the link between your Observable and your Subscriber:

Subscription subscription = Observable.just("Hello, World!")
    .subscribe(s -> System.out.println(s));
You can use this Subscription to sever the link later on:

subscription.unsubscribe();
System.out.println("Unsubscribed=" + subscription.isUnsubscribed());
// Outputs "Unsubscribed=true"
What's nice about how RxJava handles unsubscribing is that it stops the chain. If you've got a complex chain of operators, using unsubscribe will terminate wherever it is currently executing code3. No unnecessary work needs to be done!

Conclusion
Keep in mind that these articles are an introduction to RxJava. There's a lot more to learn than what I presented and it's not all sunshine and daisies (for example, read up on backpressure). Nor would I use reactive code for everything - I reserve it for the more complex parts of the code that I want to break into simpler logic.

Originally, I had planned for this post to be the conclusion of the series, but a common request has been for some practical RxJava examples in Android, so you can now continue onwards to part 4. I hope that this introduction is enough to get you started on a fun framework. If you want to learn more, I suggest reading the official RxJava wiki. And remember: the infinite is possible.

Many thanks to all the people who took the time to proofread these articles: Matthias Käppler, Matthew Wear, Ulysses Popple, Hamid Palo and Joel Drotos (worth the click for the beard alone).

1 This is one reason why I try to keep my Subscriber as lightweight as possible; I want to minimize how much I block the main thread.

2 Deferring calls to observeOn() and subscribeOn() is good practice because it gives the Subscriber more flexibility to handle processing as it wants. For instance, an Observable might take a while, but if the Subscriber is already in an I/O thread you wouldn't need to observe it on a new thread.

3 In part 1 I noted that Observable.just() is a little more complex than just calling onNext() and onComplete(). The reason is subscriptions; it actually checks if the Subscriber is still subscribed before calling onNext().



