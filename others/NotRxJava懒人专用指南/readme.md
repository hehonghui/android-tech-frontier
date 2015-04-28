NotRxJava懒人专用指南
---

> * 原文链接 : [NotRxJava guide for lazy folks](http://yarikx.github.io/NotRxJava/)
* 原文作者 : [Yaroslav Heriatovych](http://yarikx.github.io/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Rocko](https://github.com/zhengxiaopeng) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成



These days if you are an android developer, you might hear some hype about RxJava. RxJava is library which can help you get rid of all you complex write-only code that deals with asynchronous events. Once you start using it in your project – you will use it everywhere.

这些天，如果你是一位 Android 开发者，那么你可能已经听到或看到一些关于 RxJava 满天飞的宣传了。RxJava 是一个能让你摆脱编写一些复杂繁多的代码去处理异步事件的库。一旦开始在你的项目中使用，你会对它爱不释手的。

The main pitfall here is steep learning curve. If you have never used RxJava before, it will be hard or confusing to take full advantage of it for the first time. The whole way you think about writing code is a little different. Such learning curve creates problems for massive RxJava adoption in most projects.

然而，RxJava 有个缺陷，它需要一个陡峭的学习曲线过程。对于一个从未接触使用过 RxJava 的人来说，是很难一次就领会到它的精髓所在的，对于它的一些使用方法你也可能会很迷惑。在项目中使用它意味着你需要稍微地改变一下你的代码编写思路，另外，这样的学习曲线也会在项目中大规模地使用 RxJava 造成一些问题。

Of course there are a lot of tutorials and code examples around that explain how to use RxJava. Developer interested in learning and using RxJava can first visit the official Wiki that contains great explanation of what Observable is, how it’s related to Iterable and Future. Another useful resource is How To Use RxJava page which shows code examples of how to emit items and println them.

当然，关于如何去使用 RxJava 已经有许多的教程和代码范例了。感兴趣的开发者可以访问 RxJava 的官方 [Wiki](https://github.com/ReactiveX/RxJava/wiki)，里面有如什么是 Observable 以及它和 Iterable、Future 之间关系的很好的解释。Wiki 里另外一个很有用的资源是这篇文章：[How To Use RxJava](https://github.com/ReactiveX/RxJava/wiki/How-To-Use-RxJava)，这篇文章包含怎么去发送事件流并且打印出它们的介绍以及它的样例代码。

But what one really wants to know, is what problem RxJava will solve and how it will help organize async code without actually learning what Observable is.

但是需要明确我们想要了解的信息，就是 RxJava 用来解决的问题以及它是怎么帮助我们组织起异步代码的（在我们还没学习什么是 Observable 的前提下）。

My goal here is to show some “prequel” to read before the official documentation in order to better understand the problems that RxJava tries to solve. This article is positioned as a small walk-through on how to reorganize messy Async code by ourselfs to see how we can implement basic principles of RxJava without actually using RxJava.

我这篇文章的定位就是 RxJava 官方文档的“前篇”，读完这篇文章能更好地去理解 RxJava 所解决的问题。文章中也有一个小演练，就是自己怎么去整理那些凌乱的代码，然后看看我们在没有使用 RxJava 的情况下是怎么去遵循 RxJava 基本原则的。

So If you are still curious let’s get started!

所以，如果你仍有足够的好奇的话就让我们开始吧！


Cat App   

So let’s create a real world example. So we know that cats are the engine of technology progress, so let’s build a typical app for downloading cat pictures.

## Cat 应用程序

让我们来创建一个真实世界的例子。我们都知道猫是我们技术发展的引擎，所以就让我们也来创建这么一个用来下载猫图片的典型应用吧。

So here is the task:

We have a webservice that provides api to search the whole internet for images of cats by given query. Every image will contain cuteness parameter - integer value that describes how cute is that picture. Our task will be download a list of cats, choose the most cutest, and save it to local storage.

**任务描述**

> 我们有个 Web API，能根据给定的查询请求搜索到整个互联网上猫的图片。每个图片包含可爱指数的参数（描述图片可爱度的整型值）。我们的任务将会下载到一个猫列表的集合，选择最可爱的那个，然后把它保存到本地。

We will focus only on downloading, processing and saving cats data.

我们只关心下载、处理和保存猫的数据。

So let’s start:

我们开始吧~


Model and API   

Here is a simple data structure that will describe our ‘Cat’

## 模型和 API

下面是描述“猫”的简单数据结构：

``` Java
public class Cat implements Comparable<Cat>{
    Bitmap image;
    int cuteness;

    @Override
    public int compareTo(Cat another) {
        return Integer.compare(cuteness, another.cuteness);
    }
}
```

And our api calls that we will use from cat-sdk.jar will be in good-old blocking style.

还有我们传统阻塞式风格的 API，它被打包进 cat-sdk.jar 中了：

``` Java
public interface Api {
    List<Cat> queryCats(String query);
    Uri store(Cat cat);
}
```

Heh, seems clear yet? Sure! Let’s write client business logic.

这足够清楚了吗？当然！那就让我们开始编写业务逻辑吧：

``` Java
public class CatsHelper {

    Api api;

    public Uri saveTheCutestCat(String query){
        List<Cat> cats = api.queryCats(query);
        Cat cutest = findCutest(cats);
        Uri savedUri = api.store(cutest);
        return savedUri;
    }

    private Cat findCutest(List<Cat> cats) {
        return Collections.max(cats);
    }
}
```

Damn, so clear and so simple. Let’s think a bit about how cool this code is. The main method saveTheCutestCat contains only 3 functions. Take a few minutes to look at code and think about functions. This fundamental feature of our language is so amazing. You take functions, feed the input, and receive the output of it. And we wait while function is doing its work.

唉，这样清晰简单的代码帅到让我窒息啊。来理清一下代码的炫酷之处吧。主方法 saveTheCutestCat 只包含了 3 个其它方法，然后花个几分钟来看看代码和思考这些方法。你给方法提供了输入参数然后就能得到结果返回了，在这个方法工作的时候我们需要等待它的完成。

So simple and yet so powerful. Let’s think about another advantages of simple functions:

简洁而有用，让我们再看看组合方法的其它优势：

Composition   

As you can see we created one function (saveTheCutestCat) from 3 others, thus we composed them. Any of those functions is like LEGO blocks: we use them to connect one to another to get composed LEGO block (which actually can be composed later). Composing functions is so simple – just feed result of one function as argument to another in right order, what could be simpler?

**组合**

正如我们看到的，根据其它 3 个方法而新创建了一个方法（` saveTheCutestCat `），因此我们组合了它们。像乐高积木那样，我们把方法之间连接起来组成了乐高积木（实际上可以在之后组合起来）。组合方法是很简单的，从一个方法得到返回结果然后再把它传递给另外的方法做为输入参数，这不简单吗？

Error propagation   

Another good thing about functions is the way we deal with errors. Any function can terminate its execution with error, in java we call it throwing an Exception. And this error can be handled on any level. In java we do this with try/catch block. The key point here is that we don’t need to handle errors for every function, but we can handle all possible errors for the whole block of code. Like:

**错误的传递**

另外一个好处就是我们处理错误的方式了。任何一个方法都可能因执行时发生错误而被终止，这个错误能在任何层次上被处理掉，Java 中我们叫它抛出了异常，然后这个错误在 try/catch 代码块中做处理。这里的关键点是我们不需要为组合方法里的每个方法都做异常处理，仅需要对这些组合起来的方法做统一处理，像下面这样：

``` Java
try{
    List<Cat> cats = api.queryCats(query);
    Cat cutest = findCutest(cats);
    Uri savedUri = api.store(cutest);
    return savedUri;
} catch (Exception e) {
    e.printStackTrace()
    return someDefaultValue;
}
```

In this case we will handle any errors that happen during the execution. Or we can propagate it to the next level, if we just leave our code without try/catch block.

这个情况下，我们处理了所有执行时的错误，或者说如果我们没有使用 try/catch 代码块我们能够把错误传递到下一个层次上。


Go Async    

But we live in a world where we cannot wait. Sometimes it’s not possible to have only blocking calls. And actually in android you always need to deal with asynchronous code.

## 走向异步

要知道我们身在一个对等待很敏感的世界里，我们也知道不可能只有阻塞式的调用。在 Android 中我们也总需要处理异步代码。

Take for example Android’s default OnClickListener. When you want to handle a view click, you must provide a listener (callback) which will be invoked when user clicks. And there is no reasonable way to receive clicks in a blocking manner. So clicks are always asynchronous. So let’s try to deal with async code now.

拿 Android 的 ` OnClickListener ` 举个例子，当你需要处理一个控件的点击事件时，你必须提供一个监听器（回调）以供在用户点击控件时被调用。这没有理由使用阻塞的方式去接受点击事件的回调，所以对点击来说总是异步的。现在，让我们也使用异步编程吧。

Async network call

Let’s now imagine that to make a query we use some non-blocking HTTP client (like Ion). So imagine our cats-sdk.jar has updated and replaced it’s API with async calls.

**异步的网络调用**

开始想象下使用没有阻塞的 HTTP client（例如[Ion](https://github.com/koush/ion)），还有就是我们的` cats-sdk.jar `已经更新。它的 API 也换成了异步的方式调用。

So new Api interface:

新 API 的接口：

``` Java
public interface Api {
    interface CatsQueryCallback {
        void onCatListReceived(List<Cat> cats);
        void onError(Exception e);
    }


    void queryCats(String query, CatsQueryCallback catsQueryCallback);

    Uri store(Cat cat);
}
```

So now we have async cats list fetching, and to receive the result there is additional callback CatsQueryCallback which can return a list of cats or an error.

所以现在我们能异步的获取猫的信息集合列表了，返回正确或错误的结果时都会通过 ` CatsQueryCallback `回调接口。

So as api have changed we now have to change our CatsHelper:

因为 API 改变了所以我们也不得不改变我们的` CatsHelper `:

``` Java
public class CatsHelper {

    public interface CutestCatCallback {
        void onCutestCatSaved(Uri uri);
        void onQueryFailed(Exception e);
    }

    Api api;

    public void saveTheCutestCat(String query, CutestCatCallback cutestCatCallback){
        api.queryCats(query, new Api.CatsQueryCallback() {
            @Override
            public void onCatListReceived(List<Cat> cats) {
                Cat cutest = findCutest(cats);
                Uri savedUri = api.store(cutest);
                cutestCatCallback.onCutestCatSaved(savedUri);
            }

            @Override
            public void onQueryFailed(Exception e) {
                cutestCatCallback.onError(e);
            }
        });
    }

    private Cat findCutest(List<Cat> cats) {
        return Collections.max(cats);
    }
}
```

As now we can’t use the blocking api, we can not write our client as a blocking call (actually we can, but with explicit thread blocking with synchronized, CountdownLatch, etc, but we need to deal with async underlying operations anyway). So we can’t write our saveTheCutestCat function to return a value, we need to introduce callback to handle the result in async way.

现在我们已经不能使用阻塞的 API 了，我们也不能把我们的客户端上写成阻塞式的调用（实际上是可以的，但需要明确的在线程中使用` synchronized  `、` CountdownLatch `、等等，也需要在下层中使用异步处理）。所以我们不能在 ` saveTheCutestCat `方法中直接返回一个值，我们需要对它进行异步回调处理。

Let’s go even further, what if two of our API calls are async, for example we are using non-blocking IO to write into a file.

让我们再深入一点，如果我们 API 的两个方法调用都是异步的，举个例子，我们正在使用非阻塞IO去写进一个文件。

``` Java
public interface Api {
    interface CatsQueryCallback {
        void onCatListReceived(List<Cat> cats);
        void onQueryFailed(Exception e);
    }

    interface StoreCallback{
        void onCatStored(Uri uri);
        void onStoreFailed(Exception e);
    }


    void queryCats(String query, CatsQueryCallback catsQueryCallback);

    void store(Cat cat, StoreCallback storeCallback);
}
```

And our helper:

还有我们的 helper：

``` Java
public class CatsHelper {

    public interface CutestCatCallback {
        void onCutestCatSaved(Uri uri);
        void onError(Exception e);
    }

    Api api;

    public void saveTheCutestCat(String query, CutestCatCallback cutestCatCallback){
        api.queryCats(query, new Api.CatsQueryCallback() {
            @Override
            public void onCatListReceived(List<Cat> cats) {
                Cat cutest = findCutest(cats);
                api.store(cutest, new Api.StoreCallback() {
                    @Override
                    public void onCatStored(Uri uri) {
                        cutestCatCallback.onCutestCatSaved(uri);
                    }

                    @Override
                    public void onStoreFailed(Exception e) {
                        cutestCatCallback.onError(e);
                    }
                });
            }

            @Override
            public void onQueryFailed(Exception e) {
                cutestCatCallback.onError(e);
            }
        });
    }

    private Cat findCutest(List<Cat> cats) {
        return Collections.max(cats);
    }
}
```

And just look at the code once again. Is it as pretty as before? No! It’s awful. Now it has much more code noise, more curly braces, but the logic is the same.

现在再来看看代码，跟之前一样优雅吗？明显不是了，这很糟糕！现在它有了更多无关代码和花括号，但是逻辑是一样的。

What about composition? It’s gone! Now you can’t just compose operations as before. On any async operation you must create callback for it and insert continuation code inside it. Manually. Every time.

那么组合在哪呢？他已经不见了！现在你不能像之前那样组合操作了。对于每一个异步操作你都必须创建出回调接口并在代码中插入它们，每一次都需要手动地加入！

How about error propagation? How about No! In this code errors are not propagated automatically, we need to re-pass it further by ourselves (see onStoreFailed and onQueryFailed methods).

错误传递又在哪？又是一个否定！在这样的代码中错误不会自动地传递，我们需要在更深一层上通过自己手动地再让它传递下去（请看` onStoreFailed  `和`onQueryFailed `方法）。

Is it harder to read this code and to find possible bugs? Definitely!

我们很难对这样的代码进行阅读和找出潜在的 bugs。

The end?

So what? what can we do with it? Are we trapped in this world of non-composable callback hell? Fasten your seat belts, we will try to fix!

**结束了？**

结束了又怎样？我们能拿它来干嘛？我们被困在这个没有组合回调的地狱里了吗？前方高能，请抓紧你的安全带哦，我们将努力的去把这些干掉！


To the better world!   

Generic callback   

## 更美好的世界！

### 泛型回调

If we look closer to our Callback interfaces we can spot the common pattern:

All of them have a method that delivers the result (onCutestCatSaved, onCatListReceived, onCatStored)
Most of them (all in our case) have a method to handle errors that happen during operation (onError, onQueryFailed, onStoreFailed)

可以从我们的回调接口中找到共同的模式：

- 都有一个分发结果的方法（` onCutestCatSaved `,` onCatListReceived `,` onCatStored `）

- 它们中大多数（在我们的例子中是全部）有一个用于错误处理的方法（` onError `,` onQueryFailed `,` onStoreFailed `）

So we can create a generic callback to replace them all. But as we can not change api call signatures we would have to create wrapped calls.

所以我们可以创建一个泛型回调接口去替代原来所有的接口。但是我们不能去改变 API 的调用方法的签名，我们必须创建包装类来间接调用。

So our generic callback will looks like:

所以我们的泛型回调接口看起来是这样的：

``` Java
public interface Callback<T> {
    void onResult(T result);
    void onError(Exception e);
}
```

And let’s just create ApiWrapper to change signature of our calls:

然后我们来创建` ApiWrapper  `来改变一下调用方法的签名：

``` Java
public class ApiWrapper {
    Api api;

    private void queryCats(String query, Callback<List<Cat>> catsCallback){
        api.queryCats(query, new Api.CatsQueryCallback() {
            @Override
            public void onCatListReceived(List<Cat> cats) {
                catsCallback.onResult(cats);
            }

            @Override
            public void onQueryFailed(Exception e) {
                catsCallback.onError(e);
            }
        });
    }

    private void store(Cat cat, Callback<Uri> uriCallback){
        api.store(cat, new Api.StoreCallback() {
            @Override
            public void onCatStored(Uri uri) {
                uriCallback.onResult(uri);
            }

            @Override
            public void onStoreFailed(Exception e) {
                uriCallback.onError(e);
            }
        });
    }
}
```

So it’s just dummy logic to propagate resuts/errors to our new Callback

所以这仅仅是对于` Callback `的一些传递 resuts/errors 的调用转发逻辑。

And finally our CatsHelper:

最后我们的` CatsHelper `：

``` Java
public class CatsHelper{

    ApiWrapper apiWrapper;

    public void saveTheCutestCat(String query, Callback<Uri> cutestCatCallback){
        apiWrapper.queryCats(query, new Callback<List<Cat>>() {
            @Override
            public void onResult(List<Cat> cats) {
                Cat cutest = findCutest(cats);
                apiWrapper.store(cutest, cutestCatCallback);
            }

            @Override
            public void onError(Exception e) {
                cutestCatCallback.onError(e);
            }
        });
    }

    private Cat findCutest(List<Cat> cats) {
        return Collections.max(cats);
    }
}
```

Ok, little bit smaller than previous one. We could decrease the level of callbacks by one here by feeding our top cutestCatCallback directly to the apiWrapper.store call, as signatures of the callbacks are the same.

可以看到比之前的简明了一些。我们可以通过直接传递一个顶级的` cutestCatCallback `回调接口给` apiWrapper.store `来减少回调间的层级调用，此外作为回调方法的签名是一样的。

But can we do even better? Sure!

但是我们可以做的更好！

### You gotta keep it separated

### 你必须把它分开

Let’s look now on our async operations(queryCats, queryCats and resulting saveTheCutestCat). All of them follow the same pattern. The method that invokes them has some valuable arguments (query, cat) and a callback object as one of the arguments. Once more: Any async operation takes all the regular arguments and additionally a callback. What if we try to separate these stages, so that every async operation will take only valuable arguments, and then return some temporary object that will take callback.

让我们来看看我们的异步操作（` queryCats `，` queryCats `，还有`saveTheCutestCat`），它们都遵循了相同的模式。调用它们的方法有一些参数（` query `、` cat `）也包括一个回调对象。再次说明：任何异步操作需要携带所需的常规参数和一个回调实例对象。如果我们试图去分开这几个阶段，每个异步操作仅仅将会携带一个参数对象，然后返回一些携带着回调（信息）的临时对象。

Let’s try to apply this pattern and look if it’s helpful.

我们来应用下这样的模式，看看是否对我们有所帮助。

So If we will return temporary objects for async operation, we need to declare one. As this object is almost follows the common behavior (taking callback as single argument) we will define this class for all our async operations. Let’s call it AsyncJob.

如果在异步操作中返回一些临时对象，我们需要定义一个出来。这样的一个对象需要包括常见的行为（以回调为单一参数），我们将定义这样的类给所有的异步操作使用，这个类就叫它` AsyncJob `。

P.S. I would rather call it AsyncTask, but I don’t want to confuse you with another existing abstraction (which also happens to be bad) over async operations.

> P.S. 称之为` AsyncTask `更合适一点，但是我不希望你混淆了异步操作跟另外一个存在的抽象概念之间的关系（这是不好的一点）。

So:

所以：
``` Java
public abstract class AsyncJob<T> {
    public abstract void start(Callback<T> callback);
}
```

Pretty simple here. Method start will take Callback and start it’s task.

非常的简单，` Callback `传进方法后就会开始它的工作任务。

And changed wrapped API calls:

然后更改包装 API 的调用：

``` Java
public class ApiWrapper {
    Api api;

    public AsyncJob<List<Cat>> queryCats(String query) {
        return new AsyncJob<List<Cat>>() {
            @Override
            public void start(Callback<List<Cat>> catsCallback) {
                api.queryCats(query, new Api.CatsQueryCallback() {
                    @Override
                    public void onCatListReceived(List<Cat> cats) {
                        catsCallback.onResult(cats);
                    }

                    @Override
                    public void onQueryFailed(Exception e) {
                        catsCallback.onError(e);
                    }
                });
            }
        };
    }

    public AsyncJob<Uri> store(Cat cat) {
        return new AsyncJob<Uri>() {
            @Override
            public void start(Callback<Uri> uriCallback) {
                api.store(cat, new Api.StoreCallback() {
                    @Override
                    public void onCatStored(Uri uri) {
                        uriCallback.onResult(uri);
                    }

                    @Override
                    public void onStoreFailed(Exception e) {
                        uriCallback.onError(e);
                    }
                });
            }
        };
    }
}
```

So far so good. We just applied partial application to our wrapped API calls. Now we can operate with AsyncJob to start it whenever we want. So it is time to change CatsHelper.

目前一切顺利，我们只是部分运用我们的包装过的 API 调用在程序之中。现在我们可以开始使用` AsyncJob `去做我们想要的了，当然也到更改` CatsHelper `的时间了。

``` Java
public class CatsHelper {

    ApiWrapper apiWrapper;

    public AsyncJob<Uri> saveTheCutestCat(String query) {
        return new AsyncJob<Uri>() {
            @Override
            public void start(Callback<Uri> cutestCatCallback) {
                apiWrapper.queryCats(query)
                        .start(new Callback<List<Cat>>() {
                            @Override
                            public void onResult(List<Cat> cats) {
                                Cat cutest = findCutest(cats);
                                apiWrapper.store(cutest)
                                        .start(new Callback<Uri>() {
                                            @Override
                                            public void onResult(Uri result) {
                                                cutestCatCallback.onResult(result);
                                            }

                                            @Override
                                            public void onError(Exception e) {
                                                cutestCatCallback.onError(e);
                                            }
                                        });
                            }

                            @Override
                            public void onError(Exception e) {
                                cutestCatCallback.onError(e);
                            }
                        });
            }
        };
    }

    private Cat findCutest(List<Cat> cats) {
        return Collections.max(cats);
    }
}
```

Wow, the previous version was simpler. What benefits do we have now? – Now we actually return AsyncJob<Uri> of ‘composed’ operations to the client side. So a client (in activity or fragment) can operate with the composed job.

哇，之前的版本更简单些，我们现在这么多的优势是什么？答案就是现在我们可以给客户端返回“组合”操作的` AsyncJob<Uri> `。所以一个客户端（在 activity 或者 fragment 处）可以用组合起来的工作来操作。

Breaking things

### Breaking things

Here is our happy-path dataflow here:

这是我们的逻辑数据流：
``` bash
         (async)                 (sync)           (async)
query ===========> List<Cat> -------------> Cat ==========> Uri
       queryCats              findCutest           store
```

To make code readable again let’s break this flow into these operations. But one more thing, let’s think about it little bit: if some operation is async, then any operation with it is async too, Example: if querying cats is an async operation, then finding the cutest cat (even with single blocking call) is an async operation too (for the client that want to receive the result).

