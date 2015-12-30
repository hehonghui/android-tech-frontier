# Android中调试RxJava

> * 原文链接 : [Debugging RxJava on Android](http://fernandocejas.com/2015/11/05/debugging-rxjava-on-android/?utm_source=Android+Weekly&utm_campaign=038d344835-Android_Weekly_178&utm_medium=email&utm_term=0_4eb677ad19-038d344835-337955857)
* 原文作者 : [Fernando Cejas](http://fernandocejas.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [shenyansycn](https://github.com/shenyansycn) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完

**调试**是查找和分析bug的过程或者预防软件的正确操作出现问题[Wikipedia](https://en.wikipedia.org/wiki/Debugging)。

当前调试不是一件容易的事情，我们在处理**Android的异步操作**时，这一切将变得更为困难。

正如你可能知道的，在[@SoundCloud](https://soundcloud.com/),**Android开发**的核心代码中我们大量的使用[RxJava](https://github.com/ReactiveX/RxJava)，因此在这篇文章我会轻松的带你走进如何调试Rx [Observables](http://reactivex.io/documentation/observable.html)和[Subscribers](http://reactivex.io/RxJava/javadoc/rx/Subscriber.html)。

##热烈欢迎Frodo

让我们先介绍下**Frodo**，如果你已经看过[Matthias Käppler talk at GOTO Conference](https://www.youtube.com/watch?v=R16OHcZJTno)(如果你还没有看过，我强烈推荐)，你应该已经注意到了的[Gandalf](https://github.com/android10/gandalf)[(第41:15分钟)](https://youtu.be/R16OHcZJTno?t=2475)。开始时我要说的是[Gandalf是我在**Android中面向方面编程**的失败尝试](https://github.com/android10/gandalf)，幸运的是在艰苦的工作和收到有益的反馈后，它成为了我在[@SoundCloud](https://soundcloud.com/)中使用的**Android开发工具箱**，然而我想要一个**较小的只解决一个问题**的工具，所以我决定提取[RxJava](https://github.com/ReactiveX/RxJava)的日志细节，我一只在努力，献身于**Frodo**。

**Frodo**仅是一个**调试RxJava Observables 和 Subscribers的Android库**(目前来看)，比如说成是**Gandalf**的小儿子或者兄弟。它的灵感产生于[Jake Wharton’s Hugo库](https://github.com/JakeWharton/hugo)库。

![frodo_one](http://fernandocejas.com/wp-content/uploads/2015/11/frodo_one.jpg)

##调试RxJava

首先，我假设你有**RxJava**和它的核心组件：**Observables** 和 **Subscribers**的基础知识。

**调试是一个切入点**，我们知道它是如何令人沮丧和痛苦的。此外，很多时候你为了写**调试相关**的代码（不属于业务逻辑的部分）而使得事情更复杂。特别是当涉及到**异步代码执行**。

**Frodo就是为了避免编写用于调试RxJava对象的代码而出现的。它依赖Java注解和Gradle Plugin**，程序Debug编译时会检测，它会将**RxJava对象的相关信息**输出到logcat。例如，即使是在生成release版的app时，**在你的代码库中保留Frodo注解也是安全的**。现在，让我们具体看看。

##使用Frodo

使用**Frodo**第一步是在我们Android项目中将**Gradle Plugin**修改为如下这样：

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

正如你看到的，我们在classpath中添加了**“com.fernandocejas.frodo:frodo-plugin:0.8.1”**然后我们声明了**‘com.fernandocejas.frodo’** plugin。这足够使用**这个库提供的Java注解**。

##检验@RxLogObservable

**Frodo第一个核心功能是通过Java注解@RxLogObservable 记录RxJava Observables日志**。比方说我们有一个会产出`DummyClass`列表的`Observable`。

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

然后我们订阅到我们的observable例子中：

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

编译并运行应用后，这是我们在logcat中看到的信息：

LogcatShell

```
      ObservableSample  D  Frodo => [@Observable :: @InClass -> ObservableSample :: @Method -> list()]
                        D  Frodo => [@Observable#list -> onSubscribe() :: @SubscribeOn -> RxNewThreadScheduler-3]
                        D  Frodo => [@Observable#list -> onNext() -> [Name: Batman, Name: Superman]]
                        D  Frodo => [@Observable#list -> onCompleted()]
                        D  Frodo => [@Observable#list -> onTerminate() :: @Emitted -> 1 element :: @Time -> 0 ms]
                        D  Frodo => [@Observable#list -> onUnsubscribe() :: @ObserveOn -> main]
```

**主要意思是在ObservableSample类中我们订阅了一个返回Observable的list()方法**。然后通过带注释的Observable我们获得了关于被发送的元素、执行方法和事件被触发的信息。

##检验@RxLogSubscriber

**现在让我们看下@RxLogSubscriber能做什么。**

下面例子，让我们创建一个用**@RxLogSubscriber**做注释的**RxJava**虚拟Subscriber。

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

现在我们不提这个Subscriber的名字[backpressure](https://github.com/ReactiveX/RxJava/wiki/Backpressure)，因为这个话题得说一整篇文章。只要知道这个Subscriber仅请求16个元素和**onNext()**方法被调用时什么都不会做。可是，**我仍然想看到当被调用时会发生什么。**

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

这里得信息包括每一个被接收的item，元素的数量、调用函数，执行事件和触发事件。

正如你所看到了在[backpressure](https://github.com/ReactiveX/RxJava/wiki/Backpressure)中有用的信息，或看到哪个线程发出的item又或者当我们想是否Subscriber被成功订阅，从而避免了内存泄漏。

##Frodo高级选项

在这篇文章中，我没有说明这个库内部工作的细节，如果你感兴趣的话，可以看下我一年前写的[一篇文章](http://fernandocejas.com/2014/08/03/aspect-oriented-programming-in-android/)，它里面包括我同样使用Frodo的一个例子。

[你也可以浏览我已经准备好的一个描述](https://speakerdeck.com/android10/android-aspect-oriented-programming)关于[AOP和这个库](https://speakerdeck.com/android10/android-aspect-oriented-programming)的介绍，更深入的可以看源码。

##免责说明：初期

**Frodo刚刚诞生，未来还有很长的路。它仍然处在一个非常早期的阶段，所以你可能会发现问题或者可以提升的地方。**

实际上，开源的一个主要原因是**在社区中收到反馈或建议**完善自己，让它更好用。我不得不非常激动的说，我已经在3个不同的项目中使用并没有发现很多问题（更多信息可以查看下边的已知问题）。

##已知问题

**目前为止知道的一个已知问题**：因为**Frodo**依赖**Gradle Plugin**（正如之前说的）检测**Android Debug编译版本和植入代码，如果你做为Android Library项目使用**，当你编译应用（即使是debug编译类型），官方的Android Gradle Plugin总是会编译Android Library项目的release版本，这样，**这就阻止了Frodo在注释的方法／类上植入代码**。当然这不会引起你的应用崩溃但在logcat中你看不到任何输出。既然你不希望在商用的release版本中到处都是暴露重要信息的log日志，这里有一个应对方案，你使用的时候要注意。
在你项目的Android Library module的**build.gradle**文件中添加下边标记：
**(编者注：新版本的Androdi Studio的library module也可以设置为不混淆了。)**

build.gradle

```java
android {
  defaultPublishConfig "debug"
}
```

##Frodo应用例子

这个[repository](https://github.com/android10/frodo)包括一个**应用例子**，你可以看到不同情况下的使用实例，比如**Observable的错误和其他log信息**。我也在我的[Android Clean Architecture repo](https://github.com/android10/Android-CleanArchitecture)使用了**Frodo**，你可以去看看。

##总结

**这是我在这边文章中尽力提供的，希望你能找到Frodo的好处**。

最新的版本你可以在这里找到：
https://github.com/android10/frodo

一如既往，欢迎任何反馈，也欢迎贡献，再会。

##相关链接
> * [Frodo Project website](https://github.com/android10/frodo)
> * [Aspect Oriented Programming in Android](http://fernandocejas.com/2014/08/03/aspect-oriented-programming-in-android/)
> * [AO Programming and Frodo Presentation](https://speakerdeck.com/android10/android-aspect-oriented-programming)
> * [Matthias Käppler Talk at GOTO Conference: Going Reactive](https://www.youtube.com/watch?v=R16OHcZJTno)




