Loading data from multiple sources with RxJava
使用RxJava从多个数据源中加载数据
---

>
* 原文链接 : [Loading data from multiple sources with RxJava](http://blog.danlew.net/2015/06/22/loading-data-from-multiple-sources-with-rxjava/)    
* 作者 : [Dan Lew](http://blog.danlew.net/author/dan-lew/)    
* 译者 : [sjyin](https://github.com/yinshijian-kkb)     
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)  
* 状态 :   校对未完成


Suppose I have some Data that I query from the network. I could simply hit the network each time I need the data, but caching the data on disk and in memory would be much more efficient.

假设我需要从网络上获取一些数据。每次需要数据的时候，我都可以简单的访问网络，但是，将数据缓存到磁盘或内存则可以更有效率。

More specifically, I want a setup that:

更明确的说，我希望是这样的：

1、Occasionally performs queries from the network for fresh data.
2、Retrieves data as quickly as possible otherwise (by caching network results).

1、偶尔的从网络上获取新数据。
2、然而可以尽快的恢复数据（通过缓存网络数据的结果）。

I'd like to present an implementation of this setup using RxJava.

我想要使用[RxJava](https://github.com/ReactiveX/RxJava)实现。

Basic Pattern
Given an Observable<Data> for each source (network, disk and memory), we can construct a simple solution using two operators, concat() and first().

**基本模式**
给每一数据源（网络、磁盘和内存）一个```Observable<Data>```接口，我们可以通过两个操作：```concat()```和```first()```，来实现一个简单的解决方案。

concat() takes multiple Observables and concatenates their sequences. first() emits only the first item from a sequence. Therefore, if you use concat().first(), it retrieves the first item emitted by multiple sources.

```concat()```持有多个```Observables```，并且把它们连接在队列里。```first()```仅从队列里中获取到第一个条目。因此，如果你使用```concat().first()```可以从多个数据源中获取到第一个。

Let's see it in action:

让我们看看它是如何实现的：

```java
// Our sources (left as an exercise for the reader)
Observable<Data> memory = ...;  
Observable<Data> disk = ...;  
Observable<Data> network = ...;

// Retrieve the first source with data
Observable<Data> source = Observable  
  .concat(memory, disk, network)
  .first();
```

The key to this pattern is that concat() only subscribes to each child Observable when it needs to. There's no unnecessary querying of slower sources if data is cached, since first() will stop the sequence early. In other words, if memory returns a result, then we won't bother going to disk or network. Conversely, if neither memory nor disk have data, it'll make a new network request.

这种模式的关键是```concat()```只在需要资源的时候才会订阅每个子```Observable```。如果数据被缓存，就不需要通过速度慢的数据源来获取数据。

Note that the order of the source Observables in concat() matters, since it's checking them one-by-one.

注意```concat()```中```Observables```数据源的顺序问题，因为它们是被一个接一个检索出来的。

Saving Data

**保存数据**

The obvious next step is to save sources as they come in. If you don't save the results of the network request to disk, or cache disk requests in memory, you'll never see any savings! All the above code would do is constantly make network requests.

很显然，下一步就是保存数据源。如果，你没有将网络请求的结果保存到磁盘，将磁盘的地址保存在内存中，那就再也没法挽救啦！上面所有的代码就是让网咯请求持久化。

My solution is to have each source save/cache data as it emits it:

我的解决方式是在每次发出请求的时候保存或缓存数据源：

```java
Observable<Data> networkWithSave = network.doOnNext(data -> {  
  saveToDisk(data);
  cacheInMemory(data);
});

Observable<Data> diskWithCache = disk.doOnNext(data -> {  
  cacheInMemory(data);
});
```

Now, if you use networkWithSave and diskWithCache, the data will automatically be stored as you load it.

现在，如果你使用```networkWithSave ```和```diskWithCache```，数据都将会在你下载的时候自动保存。

(Another advantage of this tactic is that networkWithSave/diskWithCache can be used anywhere, not just in our multiple sources pattern.)

（这种策略的另外一个好处就是```networkWithSave/diskWithCache ```可以在任何地方使用，不仅仅在我们的多个数据源模式下。）

Stale Data

**旧数据**

Unfortunately, now our data-saving code is working a little too well! It's always returning the same data, no matter how out-of-date it is. Remember, we'd like to go back to the server occasionally for fresh data.

很不幸，现在我们保存数据的代码运行的太好啦！它总是会返回相同的数据，不管数据有没有过期。记着，我想要返回到偶尔从服务器获取新的数据。

The solution is in first(), which can also perform filtering. Just set it up to reject data that isn't worthy:

这个解决方案在```first()```中，我们可以执行筛选，只需要过滤掉那些过期的数据：

```java
Observable<Data> source = Observable  
  .concat(memory, diskWithCache, networkWithSave)
  .first(data -> data.isUpToDate());
```
Now we'll only emit the first item that qualifies as up-to-date. Thus, if one of our sources has stale Data, we'll continue on to the next one until we find fresh Data.

现在，我们只会获取被证明是最新的条目。因此，如果我们的资源有一条旧数据，我们就会略过，直接到下一条数据，直到我们找到新数据。

**first()vs.takeFirst()**

As an alternative to using first() for this pattern, you could also use takeFirst().

你可以选择使用```first()```，你也可以选择使用```takeFirst()```。

The difference between the two calls is that first() will throw a NoSuchElementException if none of the sources emits valid data, whereas takeFirst() will simply complete without exception.

这两种调用的区别是当没有可用资源的时候，```first()```会抛出一个```NoSuchElementException```的异常，然而，```takeFirst()```只会简单的结束。

Which you use depends on whether you need to explicitly handle a lack of data or not.

你使用哪种就看你是否需要明确的处理数据是否用完。

Code Samples

**代码案例**

Here's an implementation of the above code which you can check out here: https://github.com/dlew/rxjava-multiple-sources-sample

这里是以上代码的运用，你可以在这儿checkout出代码：[https://github.com/dlew/rxjava-multiple-sources-sample](https://github.com/dlew/rxjava-multiple-sources-sample)

If you'd like a real-world example, check out the Gfycat app, which uses this pattern when retrieving Gfycat metadata. The code doesn't use all the capabilities shown above (since it doesn't need it), but it demonstrates the basic concat().first() setup.

如果你需要一个实际案例，checkout出[Gfycat](https://github.com/dlew/android-gfycat)的应用，它是使用这种模式[查看Gfycat中的动态数据](https://github.com/dlew/android-gfycat/blob/6154ab4bf056a080a0d4fbc69c63594d2b3a4387/Gfycat/src/main/java/net/danlew/gfycat/service/GfycatService.java#L61-L76)。Gfycat中的代码并没有使用以上的所有功能（因为它不需要），但是它演示了```concat().first()```的基本用法。
