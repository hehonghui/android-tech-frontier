使用RxJava缓存Rest请求
---

> * 原文链接 : [Subscribe It While It's Hot: Cached Rest Requests With RxJava](http://fedepaol.github.io/blog/2016/01/01/cached-rest-requests-with-rxjava/)
* 原文作者 : [fedepaol](fedepaol.github.io)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [rednels](https://github.com/rednels) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  已完成

### 免责声明：

在这篇文章中，我尝试去用正确的方法来解决一个常见的问题。我仍然正在整理我脑袋中关于RxJava的资料，所以我在这里写下的也许不是最好的解决问题的方式。

# 使用Rxjava缓存请求

最近，我尝试使用RxJava开发了一款闲时备份app。我必须承认，一旦你get到了正确的方式，RxJava几乎感觉就像作弊。一切看起来更简洁，多个请求能够被组合，且非常容易控制。通过在UI线程观察和在其他线程订阅的方式，能够通过严格模式的检测，而且，你能了解到所有最酷的好东西就是在Android上使用RxJava。我不能够很容易发现的是，如何储存我的请求的结果，确保即使没有网络连接时，能够为用户呈现缓存的内容，同时还是使用Reactive的方式处理一切事情。

## 缓存vs未缓存

直接从Rest获取结果显示在UI上在很多情况下是合适的，比如当要显示一个参数不可预测的搜索结果的时候（想想Ebay，或者亚马逊，用户每次查找的东西都是不一样的）。

可是有一些情况，显示之前获取到的结果可以显著地提高用户体验（相比于显示加载进度条或者空白页面）。这种情况包括你的Twitter订阅，一个刚刚在5分钟之前获取过数据的本地天气预报，或者一个指定用户的github仓库列表。

这里你可以看到，一个相同的activity使用缓存的版本和不使用缓存的版本之间的区别：

![unchache](http://fedepaol.github.io/images/uncached.gif) ![chached](http://fedepaol.github.io/images/cached.gif)

出于这个原因，我试图找出一个简洁地方式来缓存请求的结果，同时保持使用Reactive方式的流程。

## 存储器是真理的唯一来源

### 全部都是reactive

如果我们想要缓存数据同时保持在相同的subscription中一切不变，事情变得有点凌乱。请求的结果抛给UI线程，并且响应结果也被储存在存储器（storage）中。UI也订阅了从存储器（storage）获取数据，它会检查哪个结果先返回，返回的数据是否过时。

![messy](http://fedepaol.github.io/images/messy.jpg)

### 缓存

在这个混合使用的情况中，UI仅订阅存储器（storage）的数据，并且使用一个外观类类封装了存储器和向存储器中填充数据的retrofit客户端的subscription。一旦存储器中被填充了新数据，UI线程将会自动地收到所有改动的通知。

![clean](http://fedepaol.github.io/images/clean.jpg)

在这种情况下，observable作为一个hot observable，在它被订阅的第一时间，它发出存储器中的内容，和其他任何它可能会发生的改变。

## 口说无凭，让我们来看下代码

下面这些代码的一个可以运行的示例可以在[我的github仓库](https://github.com/fedepaol/RxRestSample)找到。为了写这个例子，我从看起来驱动了99% rest相关示例程序的被滥用的Github api开始。先对Github说声抱歉。

首先得有一个存储器。 我封装了一个 SQLite帮助类(这是我用[手头的脚本](https://github.com/fedepaol/Android-sql-lite-helper)生成的)，它包含了一个[PublishSubject](http://reactivex.io/RxJava/javadoc/rx/subjects/PublishSubject.html)。当插入（insert）方法被调用时，PublicSubject能够收到订阅，并且我们会收到通知。

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

我们现在已经得到拼图的第一块：一个能够被订阅的存储器(storage)。使用concat操作是因为我们想在它一被订阅就将存储的内容发出去。

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

需要注意的是一切都是从UI线程发生的。这是因为我们打算将订阅到数据库的observable作为唯一的数据源。

现在，假设observable现在是hot，我们不能为了停止我们可能放在那里的任意进度指示器而监听听其的onComplete方法。我们需要的是另一个subject，让我们必定能够更新请求，所以下面是新的外观类：

```java
public class ObservableGithubRepos {
    // ...

    public Observable<List<Repo>> getDbObservable() {
        return mDatabase.getObservable();
    }

    public Observable<String> updateRepo(String userName) {
        BehaviorSubject<String> requestSubject = BehaviorSubject.create();

        Observable<List<Repo>> observable = mClient.getRepos(userName);
        observable.subscribeOn(Schedulers.io())
                  .observeOn(Schedulers.io())
                  .subscribe(l -> {
                                    mDatabase.insertRepoList(l);
                                    requestSubject.onNext(userName);},
                             e -> requestSubject.onError(e),
                             () -> requestSubject.onCompleted());
        return requestSubject;
    }
}
```

在UI端（activity或者fragment）我们必须订阅存储器来获取数据，同时也得订阅请求的observable以停止进度指示器。每次一个更新被请求的时候，发出挂起请求的状态的一个observable就会被返回。

```java
mObservable = mRepo.getDbObservable();
mProgressObservable = mRepo.getProgressObservable()

mObservable.subscribeOn(Schedulers.io())
               .observeOn(AndroidSchedulers.mainThread()).subscribe(l -> {
                mAdapter.updateData(l);
            });

Observable<List<Repo>> progressObservable = mRepo.updateRepo("fedepaol");
progressObservable.subscribeOn(Schedulers.io())
                       .observeOn(AndroidSchedulers.mainThread())
                       .subscribe(s -> {},
                                  e -> { Log.d("RX", "There has been an error");
                                        mSwipeLayout.setRefreshing(false);
                                  },
                                  () -> mSwipeLayout.setRefreshing(false));
```

请记住`DbObservable`是一个hot的，所以每次调用`updateRepo`的时候，数据库将会被查询结果填充，并且UI接下来将收到通知。

## SqlBrite

如果你觉得所有这些封装看起来是非常费力的，来自Square的多产的伙计写了一个SqlBrite，它是一个为了和这个相同的目的而编写的超级通用的数据库封装。我保证它更好用，并且比我们自己写的个人版本更经得起考验。

## 结论

我不知道加入这是否是一个使用RxJava的良好的方式。也许我结束这个场景只是因为我对于RxJava没有100%的信心，而且我在中间加入了一些非Rx的东西以便更好地控制它。由于我们能够修改从http客户端填充存储器的流程，或者从存储器本身发出的流程。

在任何情况下，拥有一个真理之源将会看起来更加清晰，并且我觉得使用这种方式来处理像预下载、计划更新以便给用户呈现最新的数据将更加容易。

感谢Fabio Collini在这篇文章发表的第一时间指出了许多错误，并感谢Riccardo Ciovati帮我校对文章。
