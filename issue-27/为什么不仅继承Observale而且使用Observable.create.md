#为什么不仅继承Observale而且使用Observale.create()？
---

> * 原文链接 : [Why use Observable.create() and not just inherit from Observable?](http://www.grokkingandroid.com/why-use-observable-create-and-not-just-inherit-from-observable/?utm_source=Android+Weekly&utm_campaign=553bcbfc02-Android_Weekly_174&utm_medium=email&utm_term=0_4eb677ad19-553bcbfc02-337955857)
* 原文作者 :[Wolfram Rittmeyer](http://www.grokkingandroid.com/author/writtmeyer/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [dengshiwei](https://github.com/dengshiwei) 
* 校对者: [desmond1121](https://github.com/desmond1121)
* 状态 :  已完成

在你开始使用[RxJava](https://github.com/ReactiveX/RxJava/wiki)的时候，你需要创建Observables。它们是RxJava的核心，但是应该怎么做呢？

看下[Observable](http://reactivex.io/RxJava/javadoc/rx/Observable.html)类可能会让你头晕，看到Observable类的源码更是如此。这个类不仅包含了近10000行代码（虽然其中7600行是注释）而且包含了大量的final methods。实际上仅final methods就有330个。但是你可以继承Observable，奇怪，很奇怪。

接下来你可能会想：没关系，让我继承Observable来看看我能继承多少。

但是你应该不介意看看这个类的构造函数说明文档，你可以看到：

```
	注意: 除了你明确的需要继承的情况下，使用create(OnSubscribe)方法替代这个构造函数来创建一个 Observable对象。
```

好吧！既然你这么想知道这到底是怎么回事，你需要看一看onCreate()方法的说明文档：

```
	返回一个Observable对象，当一个Subscriber订阅它时执行特定的功能。
	...
	编写你传递给create()方法的函数以便它的行为作为一个Observable：它应该适当地唤醒Subscriber的onNext、onError、和onCompleted方法。
	...
	一个标准的Observable必须恰好唤醒一次Subscriber的onCompleted方法或它的onError方法。
```

额，看下这个方法的代码可能有些帮助？

	public final static  Observable create(OnSubscribe f) {
		   return new Observable(hook.onCreate(f));
	}

什么？它将参数传递给构造函数？这警告又是什么呢？

好吧，第一：为什么你把继承Observable放在第一位？它的所有方法都是final类型的，因此你通过继承基本不可能给Observable增加更多的功能函数。坚持RxJava的方式做事情是不错的：通过chaining API调用它的fluent API。

另一方面：它是不明确的，使用create()方法你可以直观看到创造的Observable对象。

此外：如果你仔细看看源代码，你回注意到一个小小的引用hook.onCreate()。这是非常重要的，因为RxJava允许你提供包含特定方法的hook对象和允许你替换具体的RxJava的工作。

有次我在调试模式下使用hook来记录哪个线程创建observables对象以及在什么线程上进行工作。在服务器环境下，你可能希望为你的hooks对象添加监视逻辑，通过使用构造方法，你可以解决这一问题同时提高自己做的可能性以及简单化、

说了这么多关于：继承Observable是不被禁止的，在所有规则条件下，总有一些情况下它是不适用的和一些情况下它是有意义的。例如，[Subject](http://reactivex.io/RxJava/javadoc/rx/subjects/Subject.html)类是继承于Observable。只要仔细点同时使用时多想想。