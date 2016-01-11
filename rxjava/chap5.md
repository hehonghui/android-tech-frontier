

# RxJava开发精要5 - Observables变换

> 
> * 原文出自《RxJava Essentials》
* 原文作者 : [Ivan Morgillo](https://www.packtpub.com/books/info/authors/ivan-morgillo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuxingxin](https://github.com/yuxingxin) 
* 项目地址 : [RxJava-Essentials-CN](https://github.com/yuxingxin/RxJava-Essentials-CN)

在上一章中，我们探索了RxJava通用过滤方法。我们学习了如何使用`filter()`方法过滤我们不需要的值，如何使用`take()`得到发射元素的子集，如何使用`distinct()`函数来去除重复的。我们学习了如何使用`timeout()`，`sample()`，以及`debounce()`来利用时间。

这一章中，我们将学习如何变换可观测序列来创建一个更好满足我们需求的序列。

## *map家族

RxJava提供了几个mapping函数：`map()`,`flatMap()`,`concatMap()`,`flatMapIterable()`以及`switchMap()`.所有这些函数都作用于一个可观测序列，然后变换它发射的值，最后用一种新的形式返回它们。让我们用“真实世界”合适的例子一个个的学习下。

## Map

RxJava的`map`函数接收一个指定的`Func`对象然后将它应用到每一个由Observable发射的值上。下图展示了如何将一个乘法函数应用到每个发出的值上以此创建一个新的Observable来发射转换的数据。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_1.png)

考虑我们已安装的应用列表。我们怎么才能够显示同样的列表，但是所有的名字都是小写。

我们的`loadList()`函数可以改成这样：
```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    Observable.from(apps)
        .map(new Func1<AppInfo,AppInfo>(){
            @Override
            public Appinfo call(AppInfo appInfo){
                String currentName = appInfo.getName();
                String lowerCaseName = currentName.toLowerCase();
                appInfo.setName(lowerCaseName);
                return appInfo;
            }
        })
        .subscribe(new Observable<AppInfo>() {

            @Override
            public void onCompleted() {
                mSwipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onError(Throwable e) {
                Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
                mSwipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onNext(AppInfo appInfo) {
                mAddedApps.add(appInfo); 
                mAdapter.addApplication(mAddedApps.size() - 1,appInfo);
            }
        });
}
```

正如你看到的，像往常一样创建我们发射的Observable，我们加一个`map`调用，我们可以创建一个简单的函数来更新`AppInfo`对象并提供一个名字小写的新版本给观察者。

## FlatMap

在复杂的场景中，我们有一个这样的Observable：它发射一个数据序列，这些数据本身也可以发射Observable。RxJava的`flatMap()`函数提供一种铺平序列的方式，然后合并这些Observables发射的数据，最后将合并后的结果作为最终的Observable。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_2.png)

当我们在处理可能有大量的Observables时，重要是记住任何一个Observables发生错误的情况，`flatMap()`函数将会触发它自己的`onError()`函数并放弃整个链。

重要的一点是关于合并部分：它允许交叉。正如上图所示，这意味着`flatMap()`函数在最后的Observable中不能够保证源Observables确切的发射顺序。

## ConcatMap

RxJava的`concatMap()`函数解决了`flatMap()`的交叉问题，提供了一种能够把发射的值连续在一起的铺平函数，而不是合并它们，如下图所示：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_3.png)

## FlatMapIterable

作为*map家族的一员，`flatMapInterable()`和`flatMap()`很像。仅有的本质不同是它将源数据两两结成对，然后生成Iterable而不是原始数据和生成的Observables。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_4.png)

## SwitchMap

如下图所示，`switchMap()`和`flatMap()`很像，除了一点：当原始Observable发射一个新的数据（Observable）时，它将取消订阅并停止监视之前那个数据的Observable产生的Observable，并开始监视当前这一个。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_5.png)

## Scan

RxJava的`scan()`函数可以看做是一个累加器函数。`scan()`函数对原始Observable发射的每一项数据都应用一个函数，它将函数的结果填充回可观测序列，等待和下一次发射的数据一起使用。

作为一个通用的例子，给出一个累加器：
```java
Observable.just(1,2,3,4,5)
        .scan((sum,item) -> sum + item)
        .subscribe(new Subscriber<Integer>() {
            @Override
            public void onCompleted() {
                Log.d("RXJAVA", "Sequence completed.");
            }

            @Override
            public void onError(Throwable e) {
                Log.e("RXJAVA", "Something went south!");
            }

            @Override
            public void onNext(Integer item) {
                Log.d("RXJAVA", "item is: " + item);
            }
        });
```
我们得到的结果是：
```java
RXJAVA: item is: 1
RXJAVA: item is: 3
RXJAVA: item is: 6
RXJAVA: item is: 10
RXJAVA: item is: 15
RXJAVA: Sequence completed.
```
我们也可以创建一个新版本的`loadList()`函数用来比较每个安装应用的名字从而创建一个名字长度递增的列表。

```java
private void loadList(List<AppInfo> apps) {
    mRecyclerView.setVisibility(View.VISIBLE);
    Observable.from(apps)
            .scan((appInfo,appInfo2) -> {
                if(appInfo.getName().length > appInfo2.getName().length()){
                    return appInfo;
                } else {
                    return appInfo2;
                }
            })
            .distinct()
            .subscribe(new Observable<AppInfo>() {

                @Override
                public void onCompleted() {
                    mSwipeRefreshLayout.setRefreshing(false);
                }

                @Override
                public void onError(Throwable e) {
                    Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
                    mSwipeRefreshLayout.setRefreshing(false);
                }

                @Override
                public void onNext(AppInfo appInfo) {
                    mAddedApps.add(appInfo); 
                    mAdapter.addApplication(mAddedApps.size() - 1,appInfo);
                }
            });
}
```

结果如下：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_6.png" width="240"/>


有一个`scan()`函数的变体，它用初始值作为第一个发射的值，方法特征就像：`scan(R,Func2)`，就像下图中的例子这样：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_7.png" />


## GroupBy

拿第一个例子开始，我们安装的应用程序列表按照字母表的顺序排序。然而，如果现在我们想按照最近更新日期来排序我们的App时该怎么办？RxJava提供了一个有用的函数从列表中按照指定的规则：`groupBy()`来分组元素。下图中的例子展示了`groupBy()`如何将发射的值根据他们的形状来进行分组。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_8.png)

这个函数将源Observable变换成一个发射Observables的新的Observable。它们中的每一个新的Observable都发射一组指定的数据。

为了创建一个分组了的已安装应用列表，我们在`loadList()`函数中引入了一个新的元素：
```java
Observable<GroupedObservable<String,AppInfo>> groupedItems = Observable.from(apps)
    .groupBy(new Func1<AppInfo,String>(){
        @Override
        public String call(AppInfo appInfo){
            SimpleDateFormat formatter = new SimpleDateFormat("MM/yyyy");
            return formatter.format(new Date(appInfo.getLastUpdateTime()));
        }
    });
```
现在我们创建了一个新的Observable，`groupedItems`，将会发射一个带有`GroupedObservable`的序列。`GroupedObservable`是一个特殊的Observable，它源自一个分组的key。在这个例子中，key就是`String`，代表的意思是`Month/Year`格式化的最近更新日期。

这一点，我们已经创建了几个发射`AppInfo`数据的Observable，用来填充我们的列表。我们想保留字母排序和分组排序。我们将创建一个新的Observable将所有的联系起来，像通常一样然后订阅它：

```java
Observable.concat(groupedItems)
    .subscribe(new Observable<AppInfo>() {

        @Override
        public void onCompleted() {
            mSwipeRefreshLayout.setRefreshing(false);
        }

        @Override
        public void onError(Throwable e) {
            Toast.makeText(getActivity(), "Something went wrong!", Toast.LENGTH_SHORT).show();
            mSwipeRefreshLayout.setRefreshing(false);
        }

        @Override
        public void onNext(AppInfo appInfo) {
            mAddedApps.add(appInfo); 
            mAdapter.addApplication(mAddedApps.size() - 1,appInfo);
        }
    });
```

我们的`loadList()`函数完成了，结果是：


<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_9.png" width="240"/>


## Buffer

RxJava中的`buffer()`函数将源Observable变换一个新的Observable，这个新的Observable每次发射一组列表值而不是一个一个发射。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_10.png)

上图中展示了`buffer()`如何将`count`作为一个参数来指定有多少数据项被包在发射的列表中。实际上，`buffer()`函数有几种变体。其中有一个时允许你指定一个`skip`值：此后每当收到skip项数据，用count项数据就填充缓存。如下图所示：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_11.png)

`buffer()`带一个`timespan`的参数，会创建一个每隔timespan时间段就会发射一个列表的Observable。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_12.png)


## Window

RxJava的`window()`函数和`buffer()`很像，但是它发射的时Observable而不是列表。下图展示了`window()`如何缓存3个数据项并把它们作为一个新的Observable发射出去。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_13.png)

这些Observables中的每一个都发射原始Observable数据的一个子集，数量由`count`指定,最后发射一个`onCompleted()`结束。正如`buffer()`一样,`window()`也有一个`skip`变体,如下图所示：

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_14.png)

## Cast

RxJava的`cast()`函数是本章中最后一个操作符。它是`map()`操作符的特殊版本。它将源Observable中的每一项数据都转换为新的类型，把它变成了不同的`Class`。

![](https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter5_15.png)


## 总结

这一章中，我们学习了RxJava时如何控制和转换可观测序列。用我们现在所学的知识，我们可以创建、过滤、转换我们所想要的任何种类的可观测序列。

下一章，我们将学习如何组合Observable，合并它们，连接它们，再或者打包它们。
