> * 原文链接 : [Android Application Architecture](https://medium.com/ribot-labs/android-application-architecture-8b6e34acda65#.wrjbl27mq)
* 原文作者 : [Iván Carballo](https://medium.com/@ivanc)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [MrSimple](https://github.com/bboyfeiyu) 
* 校对者: 
* 状态 : 翻译中

> Our journey from standard Activities and AsyncTasks to a modern MVP-based architecture powered by RxJava.
> 从标准的Activities、AsyncTasks到基于MVP与RxJava的现代化架构进化之旅。


The Android dev ecosystem moves very quickly. Every week new tools are created, libraries are updated, blog posts are written and talks are given. If you go on holiday for a month, by the time you come back there will be a new version of the support library and/or Play Services.

Android开发生态变化得非常快。每周都会有新的工具出现，发布新的开源库、文章以及演讲。如果度过了一个月的假期，等你回来时可能就会有一个新的support library或者Play Services出现。

I’ve been making Android apps with the [ribot team](http://ribot.co.uk/us/) for over three years. During this time, the architecture and technologies we’ve used to build Android apps have been continuously evolving. This article will take you through this journey by explaining our learnings, mistakes and the reasoning behind these architectural changes.

在过去的三年里我与[ribo团队](http://ribot.co.uk/us/)开发过Android应用。在这期间，我们使用的应用架构和技术不断地演化。这篇文章将会带你展示我们所学到的经验、犯过的错误以及这些架构变化背后的原因。

## The old times
## 过去的旧时光
Back in 2012 our codebases used to follow a basic structure. We didn’t use any networking library and AsyncTasks were still our friends. The diagram below shows approximately how the architecture was.

2012年时我们的Codebase是如下图这样的。我们不实用任何的网络库，AsyncTasks在那时是我们最亲密的朋友。下面这张图片展示了我们那时的应用架构。

![](https://cdn-images-1.medium.com/max/1600/1*TTtpcT4H80THBofnCtQ_Lw.png)

The code was structured in two layers: the data layer that was in charge of retrieving/saving data from REST APIs and persistent data stores; and the view layer, whose responsibility was handling and displaying the data on the UI.

这些代码被分为2层: 数据层用来通过REST API获取、保存数据以及将数据持久化;View层则用来处理UI事件和显示数据到UI上。

The APIProvider provides methods to enable Activities and Fragments to easily interact with the REST API. These methods use URLConnection and AsyncTasks to perform network calls in a separate thread and return the result to the Activities via callbacks.

`APIProvider`提供了方法使得Activities和Fragments能够很方便的与REST API交互。这些方法使用URLConnection和AsyncTask来在子线程中执行网络请求，最后将结果通过回调返回到Activities中。

In a similar way, the CacheProvider contains methods that retrieve and store data from SharedPreferences or a SQLite database. It also uses callbacks to pass the result back to the Activities.

通过类似的方式，`CacheProvider`包含从SharedPreferences或者数据库获取、存储数据的方法。它也是通过回调将结果传递给Activities。

## The problems
The main issue with this approach was that the View layer had too many responsibilities. Imagine a simple common scenario where the application has to load a list of blog posts, cache them in a SQLite database and finally display them on a ListView. The Activity would have to do the following:

上述架构方式的主要问题是View层的职责太多了。想象一个简单的场景: 当应用需要加载多篇博客文章，并将它们缓存到SQLite数据，最终要将他们显示到一个ListView上。那么这个Activity需要做如下几步: 

1. Call a method loadPosts(callback) in the APIProvider
2. Wait for the APIProvider success callback and then call savePosts(callback) in the CacheProvider.
3. Wait for the CacheProvider success callback and then display the posts on the ListView.
4. Separately handle the two potential errors callback from the APIProvider and CacheProvider.

1. 调用APIProvider中的`loadPosts(callback)`函数
2. 等待APIProvider成功回调然后调用CacheProvider 中的`savePosts(callback)`函数
3. 等待CacheProvider 中的`savePosts(callback)`函数执行回调，然后将数据显示到ListView上
4. 分别处理APIProvider和CacheProvider的错误回调

This is a very simple example. In a real case scenario the REST API will probably not return the data like the view needs it. Therefore, the Activity will have to somehow transform or filter the data before showing it. Another common case is when the loadPosts() method takes a parameter that needs to be fetched from somewhere else, for example an email address provided by the Play Services SDK. It’s likely that the SDK will return the email asynchronously using a callback, meaning that we now have three levels of nested callbacks. If we keep adding complexity, this approach will result into what is known as callback hell.

这是一个非常简单的例子。在真实的场景中，REST API可能不会返回视图所需要的数据。因此，Activity需要将这些数据进行转换或者在展示数据之前进行过滤。另一个通用的场景是当`loadPosts()`函数含有一个参数，这个参数标识了数据从哪里获取。例如，一个由Play Services SDK提供的email地址.这样一来，Play Services SDK就会通过回调返回email，这意味着我们此时含有三层嵌套的回调。如果我们继续添加复杂性，这种方式就会跌入回调的深渊。

In summary:

上述问题概括如下 : 

* Activities and Fragments become very large and difficult to maintain
* Too many nested callbacks means the code is ugly and difficult to understand so painful to make changes or add new features.
* Unit testing becomes challenging, if not impossible, because a lot of the logic lives within the Activities or Fragments that are arduous to unit test.

* Activities和 Fragments会变得非常大，难以维护
* 太多嵌套的回调意味着代码非常丑陋导致难以理解、扩展
* 难以进行单元测试，因为很多业务逻辑耦合在Activities和Fragments中

## A new architecture driven by RxJava
## RxJava驱动的新架构

We followed the previous approach for about two years. During that time, we made several improvements that slightly mitigated the problems described above. For example, we added several helper classes to reduce the code in Activities and Fragments and we started using [Volley](http://developer.android.com/training/volley/index.html) in the APIProvider. Despite these changes, our application code wasn’t yet test-friendly and the callback hell issue was still happening too often.

这两年我们都使用上面提到的应用架构。在这期间，我们也做出了一些改进从而减少了它所引发的问题。例如，我们添加了几个工具类来复用Activities和Fragments，并且我们开始在APIProvider中使用[Volley](http://developer.android.com/training/volley/index.html)。尽管有了这些改进，但是我们的应用代码还是不能很方便地进行测试，多重嵌套回调问题还是频繁出现。

It wasn’t until 2014 when we started reading about [RxJava](http://reactivex.io/). After trying it on a few sample projects, we realised that this could finally be the solution to the nested callback problem. If you are not familiar with reactive programming you can read [this introduction](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754). In short, RxJava allows you to manage data via asynchronous streams and gives you many [operators](http://reactivex.io/documentation/operators.html) that you can apply to the stream in order to transform, filter or combine the data.

直到2014年我到了[RxJava](http://reactivex.io/)这个网站阅读了相关文章。当我们尝试了几个简单的示例程序之后，我们发现这个库可能是嵌套回调问题的解决方案。如果你对于响应式编程还不是很熟悉，那么你可以阅读[这篇文章](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)。简而言之，RxJava允许你通过异步的流来管理数据，其中的operators则允许你转换、过滤或者绑定数据。

Taking into account the pains we experienced in previous years, we started to think about how the architecture of a new app would look. So we came up with this.

在经历了前几年的痛苦之后，我们开始思考一个好的应用架构应该是怎样的。最后我们得出如下这个架构图: 

![](https://cdn-images-1.medium.com/max/1600/1*kCynNIa5PscRl41V2scosA.png)
RxJava-驱动的架构

Similar to the first approach, this architecture can be separated into a data and view layer. The data layer contains the DataManager and a set of helpers. The view layer is formed by Android framework components like Fragments, Activities, ViewGroups, etc.
Helper classes (third column on diagram) have very specific responsibilities and implement them in a concise manner. For example, most projects have helpers for accessing REST APIs, reading data from databases or interacting with third party SDKs. Different applications will have a different number of helpers but the most common ones are:

* PreferencesHelper: reads and saves data in SharedPreferences.
* DatabaseHelper: handles accessing SQLite databases.
* Retrofit services: perform calls to REST APIs. We started using Retrofit instead of Volley because it provides support for RxJava. It’s also nicer to use.

Most of the public methods inside helper classes will return RxJava Observables.

The DataManager is the brain of the architecture. It extensively uses RxJava operators to combine, filter and transform data retrieved from helper classes. The aim of the DataManager is to reduce the amount of work that Activities and Fragments have to do by providing data that is ready to display and won’t usually need any transformation.
The code below shows what a DataManager method would look like. This sample method works as follows:

1. Call the Retrofit service to load a list of blog posts from a REST API
2. Save the posts in a local database for caching purposes using the DatabaseHelper.
3. Filter the blog posts written today because those are the only ones the view layer wants to display.

```java
public Observable<Post> loadTodayPosts() {
        return mRetrofitService.loadPosts()
                .concatMap(new Func1<List<Post>, Observable<Post>>() {
                    @Override
                    public Observable<Post> call(List<Post> apiPosts) {
                        return mDatabaseHelper.savePosts(apiPosts);
                    }
                })
                .filter(new Func1<Post, Boolean>() {
                    @Override
                    public Boolean call(Post post) {
                        return isToday(post.date);
                    }
                });
}
```

Components in the view layer such as Activities or Fragments would simply call this method and subscribe to the returned Observable. Once the subscription finishes, the different Posts emitted by the Observable can be directly added to an Adapter in order to be displayed on a RecyclerView or similar.

The last element of this architecture is the event bus. The event bus allows us to broadcast events that happen in the data layer, so that multiple components in the view layer can subscribe to these events. For example, a signOut() method in the DataManager can post an event when the Observable completes so that multiple Activities that are subscribed to this event can change their UI to show a signed out state.


