当钢铁侠反应更灵敏-RxJava
---

> * 原文链接 : [When Iron Man becomes reactive, RxJava](http://saulmm.github.io/when-Iron-Man-becomes-Reactive-Avengers2/)
* 原文作者 : [Saúl Molinero](https://twitter.com/_saulmm)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [BownX](https://github.com/BownX)   
* 状态 :  完成 


本系列的这个部分主要是讲一些函数式技巧能给我们的项目带来的好处。

[ReactiveX](http://reactivex.io/) 中的 ``RxJava``  是一个可以帮助我们轻松处理不同运行环境下的后台线程或UI线程任务的框架。这在 Android 上一直是我们所有人的噩梦。

这篇文章主要会谈谈其中（RxJava）的一些 operators 如何能在常见开发任务中为我们节省时间，[Reactive Extensions](http://reactivex.io/) 提供了很多种类的 operators 来让我们用的更方便。

像以前一样，大部分代码和片段都已经上传到了 Github, 请随意评论、提 issue 或吐槽！

[Avengers app on Github](https://github.com/saulmm/Avengers)

在本系列[第一部分](http://saulmm.github.io/when-Thor-and-Hulk-meet-dagger2-rxjava-1/)中我们介绍了 [Dagger 2](http://google.github.io/dagger/)，现在我们更进一步会看到如何降低各层代码逻辑之间的耦合、增加可扩展性。

#### RetroLambda

有时，在 Java 开发的大型应用程序中，或 Android 这样的大型框架中，使用 Java 8 中的 Lambda 表达式这类特性是非常困难或是几乎不可能的(Android中)。

Retrolambda 就是来解决这个问题的，它会把 Java 8 的字节码翻译成低版本 Java 像v7甚至v5、v6的字节码，这样可以让我们在这些低版本中使用到 Lambda 表达式的特性。

![](http://androcode.es/wp-content/uploads/2015/06/retrolambda.png)

[Retrolambda](https://github.com/orfjackal/retrolambda) 可以通过 Gradle 或 Maven 的方式来使用，我选择 Gradle 是因为 Android Studio 对其支持的很好。要使用它你只需要将 ``[Retrolambda](https://github.com/orfjackal/retrolambda)`` 插件加到项目根目录的 ``build.gradle``， 同时在 module 的 build 脚本中应用它，再设置 Android Studio 的语言级别到 ``1.8``，这就完成了。

*build.gradle (root)*
```groovy
dependencies {
    classpath 'me.tatarka:gradle-retrolambda:3.1.0'
}
```

*{your module}/build.gradle*
```groovy
apply plugin: 'me.tatarka.retrolambda'
android { 
    ...
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}
```

[Retrolambda](https://github.com/orfjackal/retrolambda)可以让你少写很多重复的代码，同时理顺我们的代码让它有更好的可读性。在 [Dan Lew](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/)给出的这个例子中，你可以感受到它所带来的不同。

*没有 Retrolambda*
```java
Observable.just("Hello, world!")
    .subscribe(new Action1<String>() {
        @Override
        public void call(String s) {
              System.out.println(s);
        }
    });
```

*有 Retrolambda*
```java
Observable.just("Hello, world!") .subscribe(
    s -> System.out.println(s)
);
```

*在我们的 Avengers 示例中*
```java
mCharacterSubscription = mGetCharacterInformationUsecase
    .execute().subscribe(
        character -> onAvengerReceived(character),
        error     -> manageError(error)
    );

mComicsSubscription = mGetCharacterComicsUsecase
    .execute().subscribe(
        comics -> Observable.from(comics).subscribe(
            comic -> onComicReceived(comic)),
        error  -> manageError(throwable)
    );
```

#### ReactiveX

[ReactiveX](http://reactivex.io/) 是一个开源项目的集合，它们所遵循的主要原则都是 [Observer](http://en.wikipedia.org/wiki/Observer_pattern) 模式、[Iterator](http://en.wikipedia.org/wiki/Iterator_pattern#Java) 模式以及函数式编程。
[ReactiveX](http://reactivex.io/) 同时也提供了可用于异步编程的API，事实上使用这些框架来实现异步任务非常简单。

#### ReactiveX 的异步客户端用法

在使用 [ReactiveX](http://reactivex.io/) 时最棒的是你可以创建一个完全异步的API或客户端，在实现具体逻辑的时候再决定是把代码写成异步的、放到线程池中的一个独立线程执行、还是同步来执行。
因此我们可以得到一个观察者模式的API而不是一个阻塞调用的API。

```java
public interface Usecase<T> {

    Observable<T> execute();

}
public interface Repository {

    Observable<Character> getCharacter (final int characterId);

    Observable<List<Comic>> getCharacterComics (final int characterId);

}
```

#### RxJava是什么

[RxJava](https://github.com/ReactiveX/RxJava) 是一个由 **Netflix** 开发的 [Reactive Extensions](https://github.com/ReactiveX)的(Java版)实现。其他还有大量主流编程语言的实现，包括 Javascript, Python, Ruby, Go 等等。

#### Observables 和 Observers

一个 ``Observable`` 可以输出一个或一系列的 objects，这些 objects 会被订阅到这个 ``Observable`` 的 ``Observer`` 所处理或接收。

![](http://androcode.es/wp-content/uploads/2015/06/observable-observer2.png)

把一个 ``Observer`` 注册到一个 ``Observable`` 上是很必要的，如果不这么做的话 ``Observable`` 什么都不会输出。当 ``Observer`` 注册之后，一个 ``Subscription`` 类型的实例会创建，它可以用来取消对 ``Observable`` 的订阅，这通常在 ``Activities`` 和 ``Fragments`` 的 ``onStop`` 或 ``onPause`` 方法中非常有用，例如：

```java
mCharacterSubscription = mGetCharacterInformationUsecase
    .execute().subscribe( ... );

@Override
public void onStop() {

    if (!mCharacterSubscription.isUnsubscribed())
        mCharacterSubscription.unsubscribe();

    if (!mComicsSubscription.isUnsubscribed())
        mComicsSubscription.unsubscribe();

}
```

无论何时 ``Observer`` 订阅 ``Observable`` 的消息，它都需要考虑处理3个方法：
- ``onNext (T) `` 方法用来接收 ``Observable`` 发出的 objects.
- ``onError (Exception)``，这个方法会在内部抛出异常的时候调用。
- ``onCompleted()``，这个方法会在 ``Observable`` 停止释放 objects 的时候调用。

我喜欢这张图 :)
![](http://androcode.es/wp-content/uploads/2015/06/observable_observer.png)

#### 组件间通信

让我们来看看如何使用 ``GetCharacterInformationUsecase`` 这个用例，所有的用例都实现了 ``Usecase <T>`` 接口。

```java
public interface Usecase<T> {

    Observable<T> execute();

}
```

这个例子被调用的时候会返回一个 ``Observable`` 类型的实例，它可以轻松的和其他的 observables 和 operators 组合成链式结构，我们很快将会看到这些 operators 的强大威力。

当我们调用 ``GetCharacterInformationUsecase`` 的时候请求我们的仓库产生一个对应类型的数据源：

```java
@Override
public Observable<Character> execute() {

    return mRepository.getCharacter(mCharacterId);
        // .awesomeRxStuff();

}
```

``AvengerDetailPresenter`` 这个 presenter 将会成为我们这个用例的 ``Observer``，它将会订阅这个 ``Observable`` 发出的所有事件，这个操作可以通过调用 ``subscribe`` 方法来完成，这样就把 ``Observer`` 和 ``Observable`` 关联在一起了。

实现 ``onNext`` 和 ``onError`` 方法可以来处理操作结果。``onCompleted`` 方法并没有实现，因为在这个例子中不需要。

```java
mCharacterSubscription = mGetCharacterInformationUsecase
        .execute().subscribe(
            character   -> onAvengerReceived(character),
            error       -> manageError(error));
```

#### Retrofit 和 RxJava

[Square](http://square.github.io/) 出品了 [Retrofit](https://github.com/square/retrofit)，[RxJava](https://github.com/ReactiveX/RxJava) 支持其中的 ``rx.Observable`` 方法，这样网络请求的结果就可以通过 ``Observer`` 的方式来订阅、修改或通过 operators 加工。

你一定得十分清楚在什么地方来调用它，[Retrofit](https://github.com/square/retrofit) 的请求会在 ``Observable`` 所在线程上来执行，因此当你在 UI 线程(Activity 或 Fragment 中)来调用的话就会报错。接下来我们讲讲 ``Schedulers``!

#### Schedulers

[Schedulers](http://reactivex.io/documentation/scheduler.html) 可以让你在多线程中使用 ``operators`` 和 ``Observables``。它可以被用在不同的线程、一个 线程 Executor 或是预设的 ``[Schedulers](http://reactivex.io/documentation/scheduler.html)`` 中。例如，对于输入或输出这类操作会在 ``Schedulers.io ()`` 来执行。

[RxAndroid](https://github.com/ReactiveX/RxAndroid) 是由 [Jake Wharton](http://jakewharton.com/) 和 [Matthias Käppler](https://plus.google.com/u/0/+MatthiasK%C3%A4ppler/posts) 开发的一些 Android 下专用的 [RxJava](https://github.com/ReactiveX/RxJava) 的工具，其中包括一些用来处理 Android 平台下多进程调用的 ``Schedulers``。

它也提供了使用 Android 的 ``Handler`` 来处理并发的方式。

```java
@Override
public Observable<Character> execute() {

    return mRepository.getCharacter(mCharacterId)
        .subscribeOn(Schedulers.newThread())
        .observeOn(AndroidSchedulers.mainThread());

}
```

这个例子演示了 Rx 提供的处理 Android 中多进程调用的方式，这真是非常的炫酷 :D

#### Operators

[ReactiveX](http://reactivex.io/) 最厉害的要数它的 ``operators`` 了，它们可以用来操作、变换、合并 ``Observables`` 输出的 objecs。

我们来看看一个漫画列表的例子，漫画都有一个特定的出版年份，我们想要展示特定年份出版的漫画，这时 [ReactiveX](http://reactivex.io/) 就能大显身手了！

这个过滤过程是通过 ``filter`` 这个 operator 来完成的，它可以作为漫画的一个约束条件来加以判断。在这个过程中，询问用户要过滤出哪一年，然后使用这个年份来判定一个漫画是否允许被展示。

```java
public Observable<Comic> filterByYear(String year) {

    if (mComics != null) {
        return Observable.from(mComics).filter(
            comic -> {
                for (ComicDate comicDate : comic.getDates())
                    if (comicDate.getDate().startsWith(year))
                        return true;

                return false;
        });

    }

    return null;
}
```

#### 异常处理

另一个很好的 Rx 的 operators 能帮我们节省时间提升效率的例子是异常处理的 operators。

设想一个用户要请求网络，但是在网络通道上发生了一些偶然因素，网络连接在这种情况下受到了影响。

当我们接收到了 [Retrofit](http://square.github.io/retrofit/) 抛出的 ``SocketTimeoutException`` 异常时，我们可以利用 [retry](http://reactivex.io/documentation/operators/retry.html#collapseRxJava) 这个 operator 来处理。

[retry](http://reactivex.io/documentation/operators/retry.html#collapseRxJava) 可以接收一个判定条件，就像之前我们在 [filter](http://reactivex.io/documentation/operators/filter.html) 中所做的一样，如果返回 true，那么 Rx 就会神奇的再次调用 ``Observable`` 重新执行 Retrofit 的网络请求。

如果最多抛出了3次 ``SocketTimeoutExceptions`` 异常，程序会继续执行后续的 ``onError`` 来处理异常。

```java
@Override
public Observable<List<Comic>> getCharacterComics(int characterId) {

    final String comicsFormat   = "comic";
    final String comicsType     = "comic";

    return mMarvelApi.getCharacterComics(
        characterId, comicsFormat, comicsType)
            .retry((attemps, error) -> 
                error instanceof SocketTimeoutException && 
                attemps < MAX_ATTEMPS);
}
```

#### 一些参考资料

- [ReactiveX](http://reactivex.io/)
- [Reactive Programming in the Netflix API with RxJava](http://techblog.netflix.com/2013/02/rxjava-netflix-api.html)
- [Use Lambdas on Java 7 and older](https://www.youtube.com/watch?v=DUdhfPh9V_s) - Esko Luontola
- [Grokking RxJava](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/), Part1: The basics - Dan Lew