用RxJava替代EventBus
---

> * 原文链接 : [use Rxjava instead of Event Bus libraries](https://medium.com/mobiwise-blog/use-rxjava-instead-of-event-bus-libraries-aa78b5023097#.k0ecseaz7)
* 原文作者 : [Muratcanbur](https://medium.com/@muratcanbur)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [XWZack](https://github.com/XWZack) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)     
* 状态 :   校对中  `

在Android社区，每个人都在讨论RxJava，以及为什么我们应该在Android项目中使用RxJava。当我们开始在Android项目中实现RxJava后，我们注意到，我们的项目不需要引入Otto（或任何其他事件总线库）。通过这篇博客，我将展示我们是如何在项目中用RxJava替代Otto的。


# 我们项目中的MVP模式是怎么实现的

开始开发我们的无线流媒体应用Radyoland的时候，我们决定使用MVP模式来设计我们的代码底层，项目架构等。我们已经分成了几层（domain，model，app等）

![](https://cdn-images-1.medium.com/max/800/1*TuU0ZvYeLsaypR8PIeNeyw.png)

在model层，我们有基于RESTful的类和接口。在domain层，我们试图实现应用程序的业务逻辑，所以我们写了一些用例类。

# 为什么我们当初使用event bus？

如果你的Android应用超过一层，这就意味着你需要在这些层之间传输数据。就我们而言，我们认为，如果我们为数据总线和UI总线定义一个BusUtil类，我们就可以轻松地在这些层（model，domain，presentation）之间传输数据。

你可以“订阅” ，并从总线发布的特定事件“取消订阅” 。这种方法背后的逻辑是这样运作的。

在我们的UsecaseController，PresenterImp类中，我们发出一个事件，请求REST实现类中描述的数据并且订阅此事件。

```
@Override
public void getRadioList() {
    Call<RadioWrapper> radioWrapperCall = restInterface.getRadioList();
    radioWrapperCall.enqueue(new Callback<RadioWrapper>() {
        @Override
        public void onResponse(Response<RadioWrapper> response, Retrofit retrofit) {
            dataBus.post(response.body());
        }

        @Override
        public void onFailure(Throwable t) {
            Timber.e(t.getMessage());
        }
    });
}
```
当我们调用了带有回调参数的异步数据请求方法，我们用总线发布结果数据，并订阅该事件。

```
@Subscribe
@Override
public void onRadioListLoaded(RadioWrapper radioWrapper) {
    new SaveDatabase(radioWrapper, databaseSource).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    uiBus.post(radioWrapper);
}
```
然后发布数据以更新UI 。activity或fragment应该在onResume()中订阅事件并在onPause()中解除订阅 。

```
@Subscribe
@Override
public void onRadioListLoaded(RadioWrapper radioWrapper) {
    radioListView.onListLoaded(radioWrapper);
    radioListView.dismissLoading();
}
```
这种实现方法效果还不错。但由于我们是优秀的Android程序猿，总是追求更好的解决方案。我们找到了一个方案，可以摆脱所有的回调和订阅方法。我们决定在代码中使用RxJava和RxAndroid。

# let me tell you how we implemented Rxjava
我们是怎么实现Rxjava的

首先，我们需要改变所有RestInterface的返回类型 。

在没有RxJava的情况下 ;

```
@GET("")
Call<RadioWrapper> getRadioList();
```

有了Rxjava

```
@GET("")
Observable<RadioWrapper> getRadioList();
```

在REST实现类中，我们有API调用方法。我分享了其中的一个。使用RxJava启动后，我们需要改变这种方法的实现。我们把方法的返回类型改成Observable。经过了必要的改变后，方法看起来像这样。

```
@RxLogObservable
@Override
public Observable<RadioWrapper> getRadioList() {
    return restInterface.getRadioList();
}
```
我们完成了REST实现类。在此之后，我们需要改变用例的实现类和方法。

```
@Override
public Observable<RadioWrapper> getRadioList() {

    /**
     * Get radiolist observable from Cache
     */
    Observable<RadioWrapper> radioListDB =  databaseSource.getRadioList()
            .filter(radioWrapper -> radioWrapper.radioList.size() > 0)
            .subscribeOn(Schedulers.computation());

    /**
     * Load radiolist from api layer and save it to DB.
     */
    Observable<RadioWrapper> radioListApi = apiSource.getRadioList()
            .doOnNext(radioWrapper -> {
                Observable.create(subscriber -> {
                    databaseSource.save(radioWrapper);
                    subscriber.onCompleted();
                }).subscribeOn(Schedulers.computation()).subscribe();
            })
            .subscribeOn(Schedulers.io());

    /**
     * concat db and api observables
     */
    return Observable
            .concat(radioListDB, radioListApi)
            .observeOn(AndroidSchedulers.mainThread());

}
```
现在，我们的方法getRadioList返回一个Observable stream到我们的UI。正如你所看到的，我们根本不
需要通过事件总线发送数据。你还可以过滤，合并，缓存，或根据你的需要操作这个数据流。

# 我们学到了什么

虽然RxJava也不是那么好用，但是通过使用RxJava替换Otto，我们已经从代码中删除了许多冗余的回调代码块。在我看来，对于任何REST API的异步数据请求，RxJava都是最佳选择。
如果你有更好的解决方法，请随意在这里评论或分享例子。

