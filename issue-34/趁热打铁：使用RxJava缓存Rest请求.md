使用RxJava缓存Rest请求
---

> * 原文链接 : [Subscribe It While It's Hot: Cached Rest Requests With RxJava](http://fedepaol.github.io/blog/2016/01/01/cached-rest-requests-with-rxjava/)
* 原文作者 : [fedepaol](fedepaol.github.io)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [rednels](https://github.com/rednels) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  翻译中

### Disclaimer:

In this post I am trying to cover a proper approach to a common problem. I am still in the process of wrapping my head around RxJava so what I write here might not be the best way to solve the problem.

### 免责声明：

在这篇文章中，我尝试去用正确的方法来解决一个常见的问题。我仍然正在整理我脑袋中关于RxJava的资料，所以我在这里写下的也许不是最好的解决问题的方式。

# Cached requests with RxJava

# 使用Rxjava缓存请求

Lately I’ve been trying to develop a rest backed app using RxJava. I must admit that once you get in the proper mental mood, RxJava almost feels like cheating. Everything looks cleaner, multiple requests can be composed and manipulated easily, the StrictMode gets satisfied by observing on the ui thread and subscribing on a different thread, and all the nice things that can be read about how cool is RxJava with Android. What I could not find easily, was how to store the result of a request and be sure that even in case of no network, a cached content was available for the user, while still handling everything in a reactive fashion.

最近，我尝试使用RxJava开发了一款闲时备份app。我必须承认，一旦你get到了正确的方式，RxJava几乎感觉就像作弊。一切看起来更简洁，多个请求能够被组合，且非常容易控制，通过在UI线程观察和在其他线程订阅的方式，能够通过严格模式的检测，而且，你能了解到所有最酷的好东西就是在Android上使用RxJava。我不能够很容易发现的是，如何储存我的请求的结果，确保即使没有网络连接时，能够为用户呈现缓存的内容，同时还是使用Reactive的方式处理一切事情。

## Caching vs non caching

## 缓存vs未缓存

Going straight from rest result to the UI is appropriate in many cases, for example when displaying the result of a search whose arguments are not predictable (think about Ebay, or Amazon where the user is looking for something different every time).

直接从Rest获取结果显示在UI上在很多情况下是合适的，比如当要显示一个参数不可预测的搜索结果的时候（想想Ebay，或者亚马逊，用户每次查找的东西都是不一样的）。

However, there are cases when the results fetched earlier are still significant and displaying them can improve the user experience significantly, compared to a spinning wheel or a white page. Those cases include your twitter feed, a local weather forecast that was fetched just 5 minutes before, or the list of the github repos of a given user.

可是，有一些情况，当之前获取到的结果仍然有意义，并且，和显示一个旋转的进度条或者一个空白页相比，显示出来能够显著提高用户体验的时候。这种情况包括你的Twitter订阅，一个刚刚在5分钟之前获取过数据的本地天气预报，或者一个指定用户的github仓库列表。

Here you can see the difference between a non cached version and a cached version of the same activity:

这里你可以看到，一个相同的activity使用缓存的版本和不使用缓存的版本之间的区别：

![unchache](http://fedepaol.github.io/images/uncached.gif) ![chached](http://fedepaol.github.io/images/cached.gif)


For this reason I tried to figure out what could have been a clean way to cache the results of a request while keeping the flow in a reactive fashion.

出于这个原因，是试图找出什么可能是一个简洁的方式来缓存请求的结果，同时保持使用Reactive方式的流程。

## The storage as the unique source of the truth

## 存储是真理的唯一来源

### All reactive

### 全部都是reactive

If we want to cache the data while keeping everything inside the same subscription, things get a bit messy. The result of the request is thrown at the UI and the response is also stored in the storage. The UI subscribes from the storage too but checks which result came first and if the data is too old.

如果我们想要缓存数据同时保持在相同的subscription中一切不变，事情边的有点凌乱。请求的结果抛给UI线程，并且响应结果也被储存在存储（storage）中。UI也订阅了从存储（storage）获取数据，它会检查哪个结果先返回，返回的数据是否过时。

![messy](http://fedepaol.github.io/images/messy.jpg)

### Cached

### 缓存

In this hybrid variant, the UI subscribes only to the storage, and a facade class wraps the storage and the subscription to the retrofit client that feeds the storage. Once the storage is filled with new data, the UI thread is automatically notified of every change. 

在这个混合使用的情况中，UI仅订阅存储（storage）的数据，并且使用一个外观类类封装了存储和香存储中填充数据的retrofit客户端的subscription。一旦存储中被填充了新数据，UI线程将会自动地收到所有改动的通知。

![clean](http://fedepaol.github.io/images/clean.jpg)

In this scenario the observable acts as a hot observable, the first time it gets subscribed it emits the content of the storage, and any other change it might happen to it.

在这种情况下，observable作为一个hot observable，在它呗订阅的第一时间，它发出存储中的内容，和其他任何它可能会发生的改变。

## Talk is cheap, show me the code

## 口说无凭，让我们来看下代码

A working example of the following code can be found in my github repo here To write this sample, I started from the abused Github apis which seems to power the 99% of the rest related examples. Sorry about that.

下面这些代码的一个可以运行的示例可以在[我的github仓库](https://github.com/fedepaol/RxRestSample)找到。为了写这个例子，我从看起来驱动了99% rest相关示例程序的被滥用的Github api开始。先对Github说声抱歉。

First there is the storage. I wrapped a SQLite helper (which I happily generated with my handy script) with a class that contains a PublishSubject which can be subscribed to and which we will notify when the insertion methods are called:

首先得有一个存储。 我封装了一个 SQLite帮助类(这是我用[手头的脚本](https://github.com/fedepaol/Android-sql-lite-helper)生成的)，它包含了一个[PublishSubject](http://reactivex.io/RxJava/javadoc/rx/subjects/PublishSubject.html)。当插入（insert）方法被调用时，PublicSubject能够收到订阅，并且我们会收到通知。

```java
public class ObservableRepoDb {
    private PublishSubject<List<Repo>> mSubject = PublishSubject.create();
    private RepoDbHelper mDbHelper;

    private List<Repo> getAllReposFromDb() {
        List<Repo> repos = new ArrayList<>();
        // .. performs the query and fills the result
        return repos;
    }

    public Observable<List<Repo>> getObservable() {
        Observable<List<Repo>> firstTimeObservable =
                Observable.fromCallable(this::getAllReposFromDb);

        return firstTimeObservable.concatWith(mSubject);
    }

    public void insertRepo(Repo r) {
        // ...
        // performs the insertion on the SQLite helper
        // ...
        List<Repo> result = getAllReposFromDb();
        mSubject.onNext(result);
    }
}

```

What we have here is the first piece of the puzzle: a storage that can be subscribed to. The concatenation is needed because we want it to emit the content of the storage as soon as it gets subscribed.

我们现在已经得到拼图的第一块：一个能够被订阅的存储(storage)。使用concat操作是因为我们想在它一被订阅就将存储的内容发出去。

Then there is the facade class, where we get the observable from and to which we start a new update

接下来是外观类，在这里我们能够得到我们订阅的数据，且我们能够开始一个新的更新操作。

```java
public class ObservableGithubRepos {
    ObservableRepoDb mDatabase;
    private BehaviorSubject<String> mRestSubject;

    // ...
    public Observable<List<Repo>> getDbObservable() {
        return mDatabase.getObservable();
    }

    public void updateRepo(String userName) {
        Observable<List<Repo>> observable = mClient.getRepos(userName);
        observable.subscribeOn(Schedulers.io())
                  .observeOn(Schedulers.io())
                  .subscribe(l -> mDatabase.insertRepoList(l));
    }
}
```

Note that everything happens far from the UI thread. This is because we are going to subscribe to the database observable as the unique source of truth.

