# Android中 调试 RxJava

> * 原文链接 : [Debugging RxJava on Android](http://fernandocejas.com/2015/11/05/debugging-rxjava-on-android/?utm_source=Android+Weekly&utm_campaign=038d344835-Android_Weekly_178&utm_medium=email&utm_term=0_4eb677ad19-038d344835-337955857)
* 原文作者 : [Fernando Cejas](http://fernandocejas.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [shenyansycn](https://github.com/shenyansycn) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完

Debugging is the process of finding and resolving bugs or defects that prevent correct operation of computer software[Wikipedia](https://en.wikipedia.org/wiki/Debugging).

**调试**是查找和分析bug的过程或者预防软件的正确操作出现问题[Wikipedia](https://en.wikipedia.org/wiki/Debugging)。

Nowadays debugging is not an easy task, specially with all the complexity around current systems: Android is not an exception to this rule and since we are dealing with asynchronous executions, that becomes way harder.

当前调试不是一件容易的事情，特别是与当前系统的复杂性相关：因为异步操作**Android并不是一个列外**

As you might know, at @SoundCloud, we are heavily using RxJava as one of our core components for Android Development, so in this article I am gonna walk you through the way we debug Rx Observables and Subscribers.

正如你可能知道的，在[@SoundCloud](https://soundcloud.com/),我们大量的使用[RxJava](https://github.com/ReactiveX/RxJava)为**Android开发**的核心代码，因此在这篇文章我会轻松的带你走进调试Rx [Observables](http://reactivex.io/documentation/observable.html)和[Subscribers](http://reactivex.io/RxJava/javadoc/rx/Subscriber.html)中。

##Give a warm welcome to Frodo
##热烈欢迎Frodo

Let me get started by introducing Frodo, but first, if you already watched Matthias Käppler talk at GOTO Conference (if you haven’t yet, I strongly recommend it), you may have noticed that he talks about someone called Gandalf (minute 41:15). All right, I have to say that in the beginning, Gandalf was my failed attempt to create an Aspect Oriented Library for Android, fortunately after working hard and receiving useful feedback, it became an Android Development Kit we use at @SoundCloud. However, I wanted to have something smaller that solves only one problem, so I decided to extract RxJava Logging specifics that I have been working on, and give life to Frodo.

让我们先介绍下**Frodo**，如果你已经看过[Matthias Käppler talk at GOTO Conference](https://www.youtube.com/watch?v=R16OHcZJTno)(如果你还没有看过，我强烈推荐)，你应该已经注意到了关于他谈论到的[Gandalf](https://github.com/android10/gandalf)[(第41:15分钟)](https://youtu.be/R16OHcZJTno?t=2475)。开始时我要说的是[Gandalf是我在**Android中面向方面编程**的失败尝试](https://github.com/android10/gandalf)，幸运的是在艰苦的工作和有益的反馈后，它成为了我在[@SoundCloud](https://soundcloud.com/)中使用的**Android开发工具箱**，然而我想要一个**较小的只解决一个问题**的工具，所以我决定提取[RxJava](https://github.com/ReactiveX/RxJava)的日志细节，我一只在努力，献身于**Frodo**。

Frodo is no more than an Android Library for Logging RxJava Observables and Subscribers (for now), let’s say Gandalf’s little son or brother. It was actually inspired by Jake Wharton’s Hugo Library.

**Frodo**仅是一个**调试RxJava Observables 和 Subscribers的Android库**(目前来看)，比如说成是**Gandalf**的小儿子或者兄弟。它实际上是被[Jake Wharton’s Hugo库](https://github.com/JakeWharton/hugo)授权的。

![frodo_one](http://fernandocejas.com/wp-content/uploads/2015/11/frodo_one.jpg)

##Debugging RxJava
##调试RxJava
First of all, I assume that you have basic knowledge about RxJava and its core components: Observables and Subscribers.

首先，我假设了解**RxJava**和它的核心组件：**Observables** 和 **Subscribers**的基础知识。

Debugging is a cross cutting concern and we know how frustrating and painful could be. Additionally, many times you have to write code (that is not part of your business logic) in order to debug stuff, which make things even more complicated, specially when it comes to asynchronous code execution.

调试是一个切入点，我们知道是如何令人沮丧和痛苦的。此外，很多时候你写为了**调试**的代码（不属于业务逻辑的部分）这使得事情更复杂。特别是当涉及到**异步代码执行**。

Frodo was born to achieve this and avoid writing code for debugging RxJava objects. It is based on Java Annotations and relies on a Gradle Plugin that detects when the Debug build type of your application is compiled, and weaves code, which is gonna print RxJava Objects logging information on the android logcat output. For instance, it is safe to keep Frodo annotations in your codebase even when you are generating Release versions of your Android App. So now, let’s get our hands dirty and have a taste of it.

Frodo就是为了这个出现的避免为了调试RxJava对象而写代码。它基于Java注释和Gradle Plugin的依赖，当你的程序Debug编译时会检测，编写代码在Andorid的logcat！！！！！。例如，**在你的代码库中保留Frodo注释时安全的**，甚至当你编译Release版本的时候。现在，让我们具体看看。

##Using Frodo
##使用Frodo

To use Frodo the first thing we need to do is to simply apply a Gradle Plugin to our Android Project like this:

第一件事时在我们Android项目的Gradle Plugin中做如下这样：

build.gradle

```java
buildscript {
  repositories {
    jcenter()
  }
  dependencies {
    classpath 'com.android.tools.build:gradle:1.3.1'
    classpath "com.fernandocejas.frodo:frodo-plugin:0.8.1"
  }
}

apply plugin: 'com.android.application'
apply plugin: 'com.fernandocejas.frodo'
```

As you can see, we add “com.fernandocejas.frodo:frodo-plugin:0.8.1” to the classpath and afterwards we apply the plugin ‘com.fernandocejas.frodo’.
That should be enough to have access to the Java annotations provided by the Library.

正如你看到的，我们在classpath中添加了**“com.fernandocejas.frodo:frodo-plugin:0.8.1”**然后我们声明了**‘com.fernandocejas.frodo’**插件。这足以使用**库提供的Java注释**。

##Inspecting @RxLogObservable
##审视@RxLogObservable

The first core functionality of Frodo is to log RxJava Observables through @RxLogObservable Java annotation. Let’s say we have a method that returns an Observable which will emit a list of some sort of DummyClass:

**Frodo第一个核心功能是通过@RxLogObservable Java注释记录RxJava Observables**。比方说我们也有一个返回一个Observable的方法将返回DummyClass List。

ObservableSample.java

```Java
public class ObservableSample {

  @RxLogObservable
  public Observable<List<MyDummyClass>> list() {
    return Observable.just(buildDummyList());
  }
  
  public List<MyDummyClass> buildDummyList() {
    return Arrays.asList(new MyDummyClass("Batman"), new MyDummyClass("Superman"));
  }

  public static final class MyDummyClass {
    private final String name;

    MyDummyClass(String name) {
      this.name = name;
    }

    @Override
    public String toString() {
      return "Name: " + name;
    }
  }
}
```

Then we subscribe to our sample observable:
然后我们subscribe到我们的observable例子中：

MyClass.java

```java
final ObservableSample observableSample = new ObservableSample();
observableSample.list()
  .subscribeOn(Schedulers.newThread())
  .observeOn(AndroidSchedulers.mainThread())
  .subscribe(new Action1<List<ObservableSample.MyDummyClass>>() {
    @Override
    public void call(List<ObservableSample.MyDummyClass> myDummyClasses) {
      toastMessage("onNext() List--> " + myDummyClasses.toString());
    }
  });
```  

When compiling and running our application, this is the information we are gonna see on the logcat:

编译和运行应用时，这是我们在logcat中看到的信息：

LogcatShell

```
      ObservableSample  D  Frodo => [@Observable :: @InClass -> ObservableSample :: @Method -> list()]
                        D  Frodo => [@Observable#list -> onSubscribe() :: @SubscribeOn -> RxNewThreadScheduler-3]
                        D  Frodo => [@Observable#list -> onNext() -> [Name: Batman, Name: Superman]]
                        D  Frodo => [@Observable#list -> onCompleted()]
                        D  Frodo => [@Observable#list -> onTerminate() :: @Emitted -> 1 element :: @Time -> 0 ms]
                        D  Frodo => [@Observable#list -> onUnsubscribe() :: @ObserveOn -> main]
```

Basically this means that we subscribed to an Observable returned by the list() method in ObservableSample class. Then we get information about the emitted items, schedulers and events triggered by the annotated Observable.

主要是我们订阅了一个在ObservableSample类中被list()方法返回的Observable。然后通过带注释的Observable我们获得了关于被发出的元素、调度和事件被触发的信息。

##Inspecting @RxLogSubscriber
##审视@RxLogSubscriber
Let’s now explore what @RxLogSubscriber is capable of.
现在让我们看下@RxLogSubscriber能做什么。
To put an example, let’s create a RxJava dummy Subscriber and annotate it with @RxLogSubscriber.
下面例子，让我们创建一个RxJava虚拟Subscriber用@RxLogSubscriber做注释。

MySubscriberBackpressure.java

```java
@RxLogSubscriber
public class MySubscriberBackpressure extends Subscriber<Integer> {

  @Override
  public void onStart() {
    request(16);
  }

  @Override
  public void onNext(Integer value) {
    //empty
  }

  @Override
  public void onError(Throwable throwable) {
    //empty
  }

  @Override
  public void onCompleted() {
    if (!isUnsubscribed()) {
      unsubscribe();
    }
  }
}
```

Forget about the backpressure name of this Subscriber for now, since this topic deserves a whole article. Just know that this Subscriber will only request 16 elements and it is gonna do nothing with the items it receives on the onNext() method. Even though that, we still wanna see what is going on when it subscribes to any Observable which emits Integer values:

现在我们不提这个Subscriber的名字backpressure，因为这个话题得用一整篇文章。只要知道这个Subscriber仅要求16个元素和onNext()方法被调用时什么都不会做。可是，我仍然想看到当被调用时会发生什么。

ObservableSample.java

```java
public class ObservableSample {

  public Observable<Integer> numbersBackpressure() {
    return Observable.create(new Observable.OnSubscribe<Integer>() {
      @Override
      public void call(Subscriber<? super Integer> subscriber) {
        try {
          if (!subscriber.isUnsubscribed()) {
            for (int i = 1; i < 10000; i++) {
              subscriber.onNext(i);
            }
            subscriber.onCompleted();
          }
        } catch (Exception e) {
          subscriber.onError(e);
        }
      }
    });
  }
}
```

Here is when we subscribe to our SampleObservable:
这里订阅到SampleObservable：

MyClass.java

```java
final ObservableSample observableSample = new ObservableSample();
observableSample.numbersBackpressure()
  .onBackpressureDrop()
  .subscribeOn(Schedulers.newThread())
  .observeOn(AndroidSchedulers.mainThread())
  .subscribe(new MySubscriberBackpressure());
```  

Again when we compile and run our application, this is what we get from the logcat output:
当我们再次编译并运行程序后，这是在logcat得输出信息：

LogcatShell

```
SubscriberBackpressure  D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onStart()]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> @Requested -> 40 elements]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 1 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 2 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 3 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 4 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 5 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 6 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 7 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 8 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 9 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 10 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 11 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 12 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 13 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 14 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 15 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onNext() -> 16 :: @ObserveOn -> main]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> onCompleted() :: @Received -> 16 elements :: @Time -> 3 ms]
                        D  Frodo => [@Subscriber :: MySubscriberBackpressure -> unSubscribe()]
```

Information here includes each of the items received, number of elements, schedulers, execution time and events triggered.
这里得信息包括每一个被接收得item，元素得数量、调用函数，执行事件和触发事件。

As you can see this information is useful in cases of backpressure, or to see in which thread the items are being emitted or when we wanna se if our Subscriber has subscribed successfully, thus avoiding memory leaks for example.

正如你所看到的这个信息在[backpressure](https://github.com/ReactiveX/RxJava/wiki/Backpressure)情况下是有用的，或看到哪个县城发出的item又或者当我们想是否Subscriber被成功订阅，从而避免内存泄漏。


##Frodo under the hood
##Frodo高级选项
In this article, I’m not gonna explain in details how the library internally works, however, if you are curious about it, you can check an article I wrote last year which includes an example with the same approach I am using for Frodo.

在这篇文章中，我没有说明这个库内部工作的细节，然而，你好奇，我可以看下我一年前写的一篇文章，包括一个我使用Frodo同样的一个例子。


You can also look into a presentation I prepared as an introduction for both AOP and the Library or even better, dive into the source code.

你也可以浏览一个准备好的一个描述关于AOP和库的介绍或更好的深入到源码中。

##Disclaimer: Early stage
##免责说明：初期
Frodo was just born and there is a long way ahead of it. It is still in a very early stage, so you might find issues or things to improve.
Frodo刚刚诞生，未来还有很长的路。它仍然处在一个非常早期的阶段，所以你可能发现一个问题或者可以提到的地方。

Actually, one of the main reasons why it was open source, was to receive feedback/input from the community in order to improve it, make it better and more useful. I have to say that I’m very excited and I have already used it in 3 different projects without many problems (check the known issues section below for more information). Of course pull requests are very welcome too.

实际上，它开源的一个主要原因是为了改善它想在社区中收到反馈或建议，让它更好用。我不得不说我非常激动，我已经在3个不同的项目中使用没有发现很多问题（更多信息可以查看下边的已知问题）。

##Known issues
##已知问题
So far, there is a well known issue: since Frodo relies on a Gradle Plugin (as explained earlier) to detect Android Debug build variant and weave code, if you make use of Android Library Projects, when you build your Application (even the debug build type), the official Android Gradle Plugin will always generate release versions of all the Android Library projects included in your solution, thus, this stops Frodo from injecting generated code in annotated methods/classes. Of course this is not gonna make your app to crash but you won’t see any output on the logcat. There is a workaround for this but be careful if you use it, since you do not wanna ship a release version of your app with business objects being logged all over the place and exposing critical information.
Just add this flag to the android section in the build.gradle file of you Android Library Project:

目前为止知道的一个已知问题：因为Frodo依赖Gradle Plugin（正如之前说的）检测Android编译变种版本和组织代码，如果你做为使用Android Library项目使用，当你编译时（即使时debug编译类型），官方的Android Gradle Plugin通常会编译Android Library项目的release版本，这样，这就阻止了Frodo在注释的方法／类上生成代码。当然这不会引起你的应用奔溃但在logcat中你看不到任何输出。这是一个措施，你使用的时候要注意，因为你不希望在商用的release版本中到处都是暴露重要信息的log日志。

build.gradle

```java
android {
  defaultPublishConfig "debug"
}
```

##Frodo Example Application
##Frodo例子
The repository includes a sample app where you can see different use cases, such as Observable errors and other logging information. I have also enabled Frodo in my Android Clean Architecture repo if you wanna have a look into it.

这个repository包括一个例子应用，你可以看到不同情况下的使用实例，比如Observable的错误和其他log信息。我在我的[Android Clean Architecture repo](https://github.com/android10/Android-CleanArchitecture)使用了**Frodo**，你可以去看看。

##Wrapping up
##总结
This is pretty much I have to offer in this article, and I hope you have found Frodo useful.
The first version is out and you can find the repository of the project here:
https://github.com/android10/frodo
As always, any feedback is welcome. PRs as well if you wanna contribute. See you soon.

##Useful links
> * [Frodo Project website](https://github.com/android10/frodo)
> * [Aspect Oriented Programming in Android](http://fernandocejas.com/2014/08/03/aspect-oriented-programming-in-android/)
> * [AO Programming and Frodo Presentation](https://speakerdeck.com/android10/android-aspect-oriented-programming)
> * [Matthias Käppler Talk at GOTO Conference: Going Reactive](https://www.youtube.com/watch?v=R16OHcZJTno)




