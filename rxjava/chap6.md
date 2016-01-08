
# RxJava开发精要6 - 组合Observables

> 
> * 原文出自《RxJava Essentials》
* 原文作者 : [Ivan Morgillo](https://www.packtpub.com/books/info/authors/ivan-morgillo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuxingxin](https://github.com/yuxingxin) 
* 项目地址 : [RxJava-Essentials-CN](https://github.com/yuxingxin/RxJava-Essentials-CN)

上一章中，我们学到如何转换可观测序列。我们也看到了`map()`,`scan()`,`groupBY()`,以及更多有用的函数的实际例子，它们帮助我们操作Observable来创建我们想要的Observable。

本章中，我们将研究组合函数并学习如何同时处理多个Observables来创建我们想要的Observable。


## Merge

在异步的世界经常会创建这样的场景，我们有多个来源但是只想有一个结果：多输入，单输出。RxJava的`merge()`方法将帮助你把两个甚至更多的Observables合并到他们发射的数据里。下图给出了把两个序列合并在一个最终发射的Observable。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_1.png)

正如你看到的那样，发射的数据被交叉合并到一个Observable里面。注意如果你同步的合并Observable，它们将连接在一起并且不会交叉。

像通常一样，我们用我们的App和已安装的App列表来创建了一个“真实世界”的例子。我们还需要第二个Observable。我们可以创建一个单独的应用列表然后逆序。当然没有实际的意义，只是为了这个例子。第二个列表，我们的`loadList()`函数像下面这样：
```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    List reversedApps = Lists.reverse(apps);
    Observable<AppInfo> observableApps =Observable.from(apps);
    Observable<AppInfo> observableReversedApps =Observable.from(reversedApps);
    Observable<AppInfo> mergedObserbable = Observable.merge(observableApps,observableReversedApps);
    
    mergedObserbable.subscribe(new Observer<AppInfo>(){
        @Override
        public void onCompleted() {
            mSwipeRefreshLayout.setRefreshing(false);
            Toast.makeText(getActivity(), "Here is the list!", Toast.LENGTH_LONG).show();
        }
        
        @Override
        public void onError(Throwable e) {
            Toast.makeText(getActivity(), "One of the two Observable threw an error!", Toast.LENGTH_SHORT).show();
            mSwipeRefreshLayout.setRefreshing(false);
        }
        
        @Override
        public void onNext(AppInfoappInfo) {
            mAddedApps.add(appInfo);
            mAdapter.addApplication(mAddedApps.size() - 1, appInfo);
        } 
    });
}
```

我们创建了Observable和observableApps数据以及新的observableReversedApps逆序列表。使用`Observable.merge()`，我们可以创建新的`ObservableMergedObservable`在单个可观测序列中发射源Observables发出的所有数据。

正如你能看到的,每个方法签名都是一样的，因此我们的观察者无需在意任何不同就可以复用代码。结果如下：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_2.png" width="240"/>

注意错误时的toast消息，你可以认为每个Observable抛出的错误将会打断合并。如果你需要避免这种情况，RxJava提供了`mergeDelayError()`，它能从一个Observable中继续发射数据即便是其中有一个抛出了错误。当所有的Observables都完成时，`mergeDelayError()`将会发射`onError()`，如下图所示：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_3.png)


## ZIP

我们在处理多源时可能会带来这样一种场景：多从个Observables接收数据，处理它们，然后将它们合并成一个新的可观测序列来使用。RxJava有一个特殊的方法可以完成：`zip()`合并两个或者多个Observables发射出的数据项，根据指定的函数`Func*`变换它们，并发射一个新值。下图展示了`zip()`方法如何处理发射的“numbers”和“letters”然后将它们合并一个新的数据项：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_4.png)

对于“真实世界”的例子来说，我们将使用已安装的应用列表和一个新的动态的Observable来让例子变得有点有趣味。

```java
Observable<Long> tictoc = Observable.interval(1, TimeUnit.SECONDS);
```
`tictoc`Observable变量使用`interval()`函数每秒生成一个Long类型的数据：简单且高效，正如之前所说的，我们需要一个`Func`对象。因为它需要传两个参数，所以是`Func2`:

```java
private AppInfo updateTitle(AppInfoappInfo, Long time) {
    appInfo.setName(time + " " + appInfo.getName());
    return appInfo;
}
```
现在我们的`loadList()`函数变成这样：
```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    Observable<AppInfo> observableApp = Observable.from(apps);
    
    Observable<Long> tictoc = Observable.interval(1, TimeUnit.SECONDS);
    
    Observable.zip(observableApp, tictoc,
    (AppInfo appInfo, Long time) -> updateTitle(appInfo, time))
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(new Observer<AppInfo>() {
        @Override
        public void onCompleted() {
            Toast.makeText(getActivity(), "Here is the list!", Toast.LENGTH_LONG).show();
        }
        
        @Override
        public void onError(Throwable e) {
            mSwipeRefreshLayout.setRefreshing(false);
            Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
        }
        
        @Override
        public void onNext(AppInfoappInfo) {
            if (mSwipeRefreshLayout.isRefreshing()) {
                mSwipeRefreshLayout.setRefreshing(false);
            } 
            mAddedApps.add(appInfo);
            int position = mAddedApps.size() - 1;
            mAdapter.addApplication(position, appInfo);
            mRecyclerView.smoothScrollToPosition(position);
        }
    });
}
```
正如你看到的那样，`zip()`函数有三个参数：两个Observables和一个`Func2`。

仔细一看会发现`observeOn()`函数。它将在下一章中讲解：现在我们可以小试一下。

结果如下：


<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_5.png" width="320"/>

## Join

前面两个方法，`zip()`和`merge()`方法作用在发射数据的范畴内，在决定如何操作值之前有些场景我们需要考虑时间的。RxJava的`join()`函数基于时间窗口将两个Observables发射的数据结合在一起。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_6.png)

为了正确的理解上一张图，我们解释下`join()`需要的参数：

* 第二个Observable和源Observable结合。
* `Func1`参数：在指定的由时间窗口定义时间间隔内，源Observable发射的数据和从第二个Observable发射的数据相互配合返回的Observable。
* `Func1`参数：在指定的由时间窗口定义时间间隔内，第二个Observable发射的数据和从源Observable发射的数据相互配合返回的Observable。
* `Func2`参数：定义已发射的数据如何与新发射的数据项相结合。
* 
如下练习的例子，我们可以修改`loadList()`函数像下面这样：
```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    
    Observable<AppInfo> appsSequence =
    Observable.interval(1000, TimeUnit.MILLISECONDS)
                .map(position -> {
                    return apps.get(position.intValue());
                });
                
    Observable<Long> tictoc = Observable.interval(1000,TimeUnit.MILLISECONDS);
    
    appsSequence.join(
        tictoc, 
        appInfo -> Observable.timer(2,TimeUnit.SECONDS),
        time -> Observable.timer(0, TimeUnit.SECONDS),
        this::updateTitle)
        .observeOn(AndroidSchedulers.mainThread())
        .take(10)
        .subscribe(new Observer<AppInfo>() {
            @Override
            public void onCompleted() {
                Toast.makeText(getActivity(), "Here is the list!", Toast.LENGTH_LONG).show();
            }
            
            @Override
            public void onError(Throwable e) {
                mSwipeRefreshLayout.setRefreshing(false); 
                Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onNext(AppInfoappInfo) {
                if (mSwipeRefreshLayout.isRefreshing()) {
                    mSwipeRefreshLayout.setRefreshing(false);
                } 
                mAddedApps.add(appInfo);
                int position = mAddedApps.size() - 1;
                mAdapter.addApplication(position, appInfo);
                mRecyclerView.smoothScrollToPosition(position);
            } 
        });
}
```

我们有一个新的对象`appsSequence`，它是一个每秒从我们已安装的app列表发射app数据的可观测序列。`tictoc`这个Observable数据每秒只发射一个新的`Long`型整数。为了合并它们，我们需要指定两个`Func1`变量：

```java
appInfo -> Observable.timer(2, TimeUnit.SECONDS)

time -> Observable.timer(0, TimeUnit.SECONDS)
```
上面描述了两个时间窗口。下面一行描述我们如何使用`Func2`将两个发射的数据结合在一起。
```java
this::updateTitle
```

结果如下：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_7.png" width="240"/>

它看起来有点乱，但是注意app的名字和我们指定的时间窗口，我们可以看到：一旦第二个数据发射了我们就会将它与源数据结合，但我们用同一个源数据有2秒钟。这就是为什么标题重复数字累加的原因。

值得一提的是，为了简单起见，也有一个`join()`操作符作用于字符串然后简单的和发射的字符串连接成最终的字符串。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_8.png)

## combineLatest

RxJava的`combineLatest()`函数有点像`zip()`函数的特殊形式。正如我们已经学习的，`zip()`作用于最近未打包的两个Observables。相反，`combineLatest()`作用于最近发射的数据项：如果`Observable1`发射了A并且`Observable2`发射了B和C，`combineLatest()`将会分组处理AB和AC，如下图所示：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_9.png)

`combineLatest()`函数接受二到九个Observable作为参数，如果有需要的话或者单个Observables列表作为参数。

从之前的例子中把`loadList()`函数借用过来，我们可以修改一下来用于`combineLatest()`实现“真实世界”这个例子：
```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    Observable<AppInfo> appsSequence = Observable.interval(1000, TimeUnit.MILLISECONDS)
              .map(position ->apps.get(position.intValue()));
    Observable<Long> tictoc = Observable.interval(1500, TimeUnit.MILLISECONDS);
    Observable.combineLatest(appsSequence, tictoc,
               this::updateTitle)
       .observeOn(AndroidSchedulers.mainThread())
        .subscribe(new Observer<AppInfo>() {
        
        @Override
        public void onCompleted() {
            Toast.makeText(getActivity(), "Here is the list!", Toast.LENGTH_LONG).show();
        }
        
        @Override
        public void onError(Throwable e) {
            mSwipeRefreshLayout.setRefreshing(false);
            Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
        }
        
        @Override
        public void onNext(AppInfoappInfo) {
            if (mSwipeRefreshLayout.isRefreshing()) {
                mSwipeRefreshLayout.setRefreshing(false);
            } 
            mAddedApps.add(appInfo);
            int position = mAddedApps.size() - 1;
            mAdapter.addApplication(position, appInfo);
            mRecyclerView.smoothScrollToPosition(position);
        } 
    });
}
```
这我们使用了两个Observables：一个是每秒钟从我们已安装的应用列表发射一个App数据，第二个是每隔1.5秒发射一个`Long`型整数。我们将他们结合起来并执行`updateTitle()`函数，结果如下：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_10.png" width="240"/>

正如你看到的，由于不同的时间间隔，`AppInfo`对象如我们所预料的那样有时候会重复。

## And,Then和When

在将来还有一些`zip()`满足不了的场景。如复杂的架构，或者是仅仅为了个人爱好，你可以使用And/Then/When解决方案。它们在RxJava的joins包下，使用Pattern和Plan作为中介，将发射的数据集合并到一起。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_11.png)

我们的`loadList()`函数将会被修改从这样：
```java
private void loadList(List<AppInfo> apps) {

    mRecyclerView.setVisibility(View.VISIBLE);

    Observable<AppInfo> observableApp = Observable.from(apps);
    
    Observable<Long> tictoc = Observable.interval(1, TimeUnit.SECONDS);
    
    Pattern2<AppInfo, Long> pattern = JoinObservable.from(observableApp).and(tictoc); 
    
    Plan0<AppInfo> plan = pattern.then(this::updateTitle);
    
    JoinObservable
        .when(plan)
        .toObservable()
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(new Observer<AppInfo>() {
        
            @Override
            public void onCompleted() {
                Toast.makeText(getActivity(), "Here is the list!", Toast.LENGTH_LONG).show();
            }
            
            @Override
            public void onError(Throwable e) {
                mSwipeRefreshLayout.setRefreshing(false); 
                Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onNext(AppInfoappInfo) {
                if (mSwipeRefreshLayout.isRefreshing()) { 
                mSwipeRefreshLayout.setRefreshing(false);
                } 
                mAddedApps.add(appInfo);
                int position = mAddedApps.size() - 1;
                mAdapter.addApplication(position, appInfo); mRecyclerView.smoothScrollToPosition(position);
            } 
        });
}
```
和通常一样，我们有两个发射的序列，`observableApp`，发射我们安装的应用列表数据，`tictoc`每秒发射一个`Long`型整数。现在我们用`and()`连接源Observable和第二个Observable。

```java
JoinObservable.from(observableApp).and(tictoc);
```
这里创建一个`pattern`对象，使用这个对象我们可以创建一个`Plan`对象:"我们有两个发射数据的Observables,`then()`是做什么的？"
```java
pattern.then(this::updateTitle);
```
现在我们有了一个`Plan`对象并且当plan发生时我们可以决定接下来发生的事情。
```java
.when(plan).toObservable()
```
这时候，我们可以订阅新的Observable，正如我们总是做的那样。



## Switch

有这样一个复杂的场景就是在一个`subscribe-unsubscribe`的序列里我们能够从一个Observable自动取消订阅来订阅一个新的Observable。

RxJava的`switch()`，正如定义的，将一个发射多个Observables的Observable转换成另一个单独的Observable，后者发射那些Observables最近发射的数据项。

给出一个发射多个Observables序列的源Observable，`switch()`订阅到源Observable然后开始发射由第一个发射的Observable发射的一样的数据。当源Observable发射一个新的Observable时，`switch()`立即取消订阅前一个发射数据的Observable（因此打断了从它那里发射的数据流）然后订阅一个新的Observable，并开始发射它的数据。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_12.png)


## StartWith

我们已经学到如何连接多个Observables并追加指定的值到一个发射序列里。RxJava的`startWith()`是`concat()`的对应部分。正如`concat()`向发射数据的Observable追加数据那样，在Observable开始发射他们的数据之前， `startWith()`通过传递一个参数来先发射一个数据序列。  

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter6_13.png)



## 总结

这章中，我们学习了如何将两个或者更多个Observable结合来创建一个新的可观测序列。我们将能够`merge` Observable，`join` Observables ，`zip` Observables 并在几种情况下把他们结合在一起。

下一章，我们将介绍调度器，它将很容易的帮助我们创建主线程以及提高我们应用程序的性能。我们也将学习如何正确的执行长任务或者I/O任务来获得更好的性能。
