提高NYTimes的启动速度
---

> * 原文链接 : [Improving Startup Time in the NYTimes Android App](http://open.blogs.nytimes.com/2016/02/11/improving-startup-time-in-the-nytimes-android-app/?_r=1)
* 原文作者 : [Mike Nakhimovich](http://open.blogs.nytimes.com/author/mike-nakhimovich/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



Improving application startup and load time has been a priority for The New York Times Android development team, and we’re not alone. As device manufacturers continue to offer faster and more fluid experiences, users expect their native apps to be faster still.

和大部分应用一样，“提高应用启动和加载时间”成为 NYTimes 优先考虑的需求，因为设备制造商继续为市场提供更快更流畅的设备使用体验，因此用户也期望应用有更好的性能表现。

Our team recently rewrote our news app to take advantage of modern patterns such as dependency injection and reactive programming. The rewrite offered improvements in maintenance, code modernization and modularization benefits, but required some adjustments to optimize.

我们组最近重写了我们的新闻 App 以发挥当今应用开发趋势的优点，我们使用了诸如依赖注入和响应式编程的技术。这次重写提高了代码的可维护性，降低代码耦合度以模块化，但也需要对代码进行一些调整以优化其表现。

When we initially released our new app, which we nicknamed Phoenix, startup time was a modest 5.6 seconds on a Nexus 5. This was longer than our goal: 2 seconds or less. This motivated us to put some effort into improving our performance.

我们刚发布小名为 Phoenix 的新版本的 App 时，在 Nexus 5 上的启动时间为 5.6 秒，这个结果显然不能使我们满意，毕竟我们期望的是达到 2 秒或更少，但这也激励我们花费更多的时间和精力去提升该应用的性能。

We found that most of the slowdown was caused by issues with reflection. After addressing these and fixing other smaller things, we’ve reduced our current startup time to 1.6 seconds.

然后我们发现拖慢启动时间的原因是使用了反射的那部分代码。处理了这些使用反射的代码以及修复了一些其他的小问题后，启动时间被缩短到 1.6 秒。

##How We Did It
##我们是怎么做到的
First, we captured our app’s startup time with Android’s method tracing feature. We measured from the Application Class constructor to the end of the progress indicator appearing on screen (see the [documentation](http://developer.android.com/tools/debugging/debugging-tracing.html#creatingtracefiles)).

首先，我们跟踪 Android 应用的生命周期方法并进行特征提取得到 App 的启动时间，我们在 Application 类的构造方法中开始计时，进度条显示结束后停止计时，详见[文档](http://developer.android.com/tools/debugging/debugging-tracing.html#creatingtracefiles)。

We then collected the resulting trace files for analysis by loading the trace into DDMS and finding the largest performance offender. We eventually switched to using [NimbleDroid](https://www.nimbledroid.com/), which also offered a simple way to identify bottleneck issues, making it easier to compare performance across traces.

然后通过追踪 DDMS 收集追踪文件以分析启动时间，找到对启动时间影响最大的模块。但这样分析费时费力，所以我们换了个办法，使用了 [NimbleDroid](https://www.nimbledroid.com/) 来帮助我们完成分析。NimbleDroid 提供了更简单的办法以找出造成性能瓶颈的因素，简化了性能比较的操作。

##The Low Hanging Fruit
The first major slowdown we found was related to the large number of classes, memory-intensive runtime and expensive calls to loading Jar resources required by Groovy, something previously identified as a problem in other libraries such as [Joda Time](http://blog.danlew.net/2013/08/20/joda_time_s_memory_issue_in_android/). We primarily used Groovy for closures; improvements in code folding within Android Studio have resolved that need. Since we didn’t use any other constructs of the language, we decided to move away from it. We reverted back to plain old Java 7 syntax and stripped our codebase of Groovy. We’re currently exploring other options but enhancements in IDE support for viewing anonymous classes in Java have made it less of a priority.

我们找到的降低启动时间的第一个原因就和大量的类关联在一起，内存密集型运行库，Groovy 加载 Jar 资源时造成昂贵的开销，以及之前 [Joda Time 发现的其他库存在的性能问题](http://blog.danlew.net/2013/08/20/joda_time_s_memory_issue_in_android/)。我们使用 Groovy 是为了闭包；但 Android Studio 提供的代码折叠功能已经解决了这个问题。因此我们不再需要使用 Groovy，所以我们用 Java 7 提供的 API 把原来的代码替换为纯 Java 语法实现的代码，把 Groovy 从项目中移除了。虽说我们现在还在想办法增强 IDE 的功能，使得我们能直接查看匿名类，但这个需求的优先级要小一点。

Next, we found some slowdowns within [RxJava](https://github.com/ReactiveX/RxJava/issues/3119) which were costing us about a second. Thankfully, a fix was issued in the [next release](https://github.com/ReactiveX/RxJava/issues/3119).

然后我发现 RxJava 也带来了一些性能开销，在应用启动时大约增加了 1 秒。幸运的是，有人提了个 issue 指出这个问题，在 RxJava 的下一个版本会修复它。

Some third-party analytics clients we have incorporated into our app had some blocking calls during app startup. We made some changes to how they were being instantiated and worked with vendors to help improve large upfront instantiation.

一些和我们合作的第三方数据分析客户端在 App 启动时也造成了阻塞，于是我们修改了他们初始化的方式，并与供应商合作提升预加载的性能。

We also uncovered a number of small technical debt issues in our codebase: blocking object instantiation on an md5 calculation, blocking in constructors and generally doing too much work up front.

我们还在代码中发现了许多“技术债”带来的性能开销：由于 md5 计算使得对象初始化被阻塞；构造方法中的阻塞，一般是因为前台当前需要完成的操作太多。

After these tweaks were implemented, we cut our startup time to about [3.2 seconds](https://nimbledroid.com/play/com.nytimes.android?p=2ms858ga8INTPO#Summary) — half of what it had been and faster than before the rewrite. Our next focus was optimizing data flows. This is especially critical for our app, which is highly data-intensive.

完成了这些调整后，应用启动时间降低到 3.2 秒了 - 大约是优化前的一半，应用也比之前流畅了。接下来我们的目标就是优化数据流，因为我们的 App 是数据密集型的，因此这是一个严峻的考验

##Introducing Data Stores
##介绍数据存储
Since all of our data observations are asynchronous, we initially started with a single content manager to act as an abstraction between presentation and data layer. While this helped with encapsulation, it caused slowdowns by instantiating what gradually became a god object any time data was needed from persistent storage.

因为我们所有数据都是异步观测处理的，在演示和数据层我们用单例的“内容管理者”来作为抽象。虽说这样有助于封装，但在初始化时增加了时间，因为无论何时，需要加载持久性存储的数据时它就会成为“上帝对象”，完成加载。

This became a pain point when, for example, an analytics configuration value was needed from the disk during app launch but had to wait for blocking SSL-enabled network clients to instantiate. As the app grew and more dependencies were added, our content manager instantiation time increased, causing subsequent app starts to be as slow as initial installs.

某些情况下，这就会带来性能问题，例如：在 App 启动时磁盘需要数据分析配置的属性值，但要获得该值需要等到 SSL 允许的网络客户端初始化完成。当应用渐渐变得庞大，添加的依赖越来越多，“内容管理者”初始化需要的时间就会越多，应用的启动时间也会因此变得更长。

Rather than using a content manager as a single gatekeeper, we have moved toward individualized data stores, which let us load cached data as quickly as possible. Similar to recent work done by the Facebook Android team, we made sure to optimize the code path from disk to UI as much as possible.

为了解决这个问题，我们决定不再使用一个“内容管理者”管理数据，而是移到几个不同的地方存储数据，使我们能尽可能快地加载缓存数据。与最近 Facebook 完成的工作类似，我们尽可能将代码路径从磁盘移动到 UI。

We began by breaking our content manager into individual singleton data stores backed by disk and network DAOs. For example, we broke out a ConfigStore backed by ConfigNetworkDAO and ConfigDiskDAO from our content manager.

我们首先将“内容管理者”分解成几个由磁盘和网络 DAO支持的独立的单例数据存储对象。例如，我们将 ConfigStore 分解成由 ConfigNetworkDAO 和 ConfigDiskDAO 支持完成其功能。

```java
@Singleton
public class ConfigStore extends Store {
   @Inject
   public ConfigStore(AppConfigParser parser,
                      final ConfigDiskDAO loader,
                      final Lazy<ConfigNetworkDAO> fetcher) {
       super(loader,fetcher,parser);}
```

We leaned on Dagger’s Lazy instantiation, which allowed us to inject a lazy network client and not instantiate it until we actually do a network operation — important when offline or after the first load. Our architecture relies heavily on downloading data using background services. As a result, data is mostly loaded from disk storage to UI rather than having to make a network call. After we were able to create an optimal path from disk to screen we came to our next major speed hog: reflection.

Dagger 的延迟加载允许我们注入延迟的网络客户端，在我们真正需要进行网络操作时才初始化该类，在离线或第一次数据加载完成后这个特性很重要。我们的架构非常依赖后台服务所进行的数据下载。事实上，数据大部分是从磁盘存储区域中加载到 UI 上的，而不是通过网络调用获得。在我们能够创建从磁盘到屏幕的最优路径后，需要解决的问题就剩下反射了。

##Removing Reflection
##移除反射
While trying to improve performance in data loading, we found that it was taking 700 milliseconds or more to parse the data for our Top Stories section, regardless of whether we were fetching from persistent storage or over the network. It surprised us to see how poorly Gson performed by default on Android for a largely data-driven app like ours. By analyzing startup traces, we zoomed in on calls to Reflective Type Adapters as the [culprit](https://nimbledroid.com/play/com.nytimes.android?p=2rjCRXQykF102a#ReflectiveTypeAdapterFactory.getBoundFields).

在尝试优化数据加载的性能时，我们发现为 Top Stories 解析数据需要花费大于等于 700 毫秒的时间，无论是从磁盘上获得数据，还是从网络中获得数据。我们现在才意识到 Gson 在 Android 上的性能表现是这么差，对我们这种数据驱动的应用来说，这简直是噩梦……在分析了启动时间轨迹后，我们发现反射型 Adapter 的调用非常耗时。

We tried to minimize and remove reflective calls from Gson, but the only viable approach was to painstakingly write type adapters by hand. This led to a long and fruitless journey to find serialization techniques that do not use reflection and do not have an expensive startup time. We were left with only a few options, all of which required adding additional code to our models. So we went back to the simplest working solution: Gson with custom type adapters.

我们尝试最小化对 Gson 的使用，并移除 Gson 中有关反射的调用，但唯一可行的方法是一个个重写那些 Adapter。于是我们花了很多时间精力去找不需要使用反射且不会给应用启动带来昂贵开销的序列化的办法。最后我们有几个可选项，但都需要给 Model 添加代码。因此我们回到最简单的解决办法：自定义 Gson 的 Adapter。

We saw a tenfold improvement in parsing performance after writing our own type adapters. To keep developer overhead to a minimum, we have leaned heavily on the [Immutables library](http://immutables.github.io/json.html). This generates custom type adapters for our data models at compile time and also gives us the added benefit of immutability in a manner similar to AutoValue.

完成这部分工作后，性能表现大概提高了十倍。为了保持开销为最小，我们使用了 [Immutables library](http://immutables.github.io/json.html)，它会在编译时为我们的数据 Model 创建 Adapter，并给我们带来像 AutoValue 那样的不变性。

```java
@Value.Immutable
@Gson.TypeAdapters
public abstract class AppConfig {
   public abstract Optional<DeviceGroups> deviceGroups();
   public abstract Marketing marketing();
   public abstract List<OverrideCondition> overrides();
   public abstract LinkedHashMap<String, List<Integer>> imageCropMappings();
}

public AppConfigParser() {
     gson = new GsonBuilder()
           .registerTypeAdapterFactory(new GsonAdaptersAppConfig()) //auto generated adapter
                   .create();
}
public void parse() {
reader = new InputStreamReader(source.inputStream(), UTF_8);
AppConfig appConfig = gson.fromJson(reader, AppConfig.class);
}
```

Our current data flow looks something like this:

现在数据流如下：

A background Service subscribes to an RxStore which lazily instantiates a network client and downloads fresh data in JSON. This is done on a schedule or from a push alert. We then stream the JSON data to disk. We use the streaming API rather than saving the JSON as a single object because it prevents us from needing to instantiate value objects over one megabyte into memory.

后台服务订阅延迟初始化网络客户端的 RxStore，并以 JSon 数据格式下载新的数据，然后把数据转化为数据流存到磁盘，而不是将它作为一个 JSon 对象保存，这样避免加载超过 1m 的对象到内存中。

Now when the UI needs data, it subscribes to immutable data from a data store that is backed by caches in memory (Guava) and on disk. We only instantiate a network client if disk values are not present or if the format has changed since the last save. Data flows unidirectionally from persistent storage to UI and never directly from the network to our UI. This unidirectional data flow means that 99 percent of subscriptions to data store observables will never have to hit anything but disk values.

当 UI 需要数据，就会订阅由内存缓存和磁盘支持的数据存储对象提供的不变数据，我们只需要初始化网络客户端，如果磁盘中存储的值不是不变的，或者数据格式发生了变化，而且永远不会直接从网络加载到 UI 上。该非定向数据流意味着 99% 的对数据存储对象的订阅不会产生任何影响，除了磁盘中存储的数据。

We will continue to explore other methods such as FlatBuffers for serializing data for disk storage; however, we are generally pleased with our current results. A relaunch of our app offers users a full view of the home page in under two seconds.

之后我们还会继续探索诸如 FlatBuffer 的方法以序列化数据存储到磁盘中；然而，我们对现状挺满意的。重新发布的应用给用户显示首页的所有内容只需要2秒。

##The Bottom Line
##最后
Reflection can cause significant performance issues on Android, especially for large, data-driven apps. For this reason, it should be avoided whenever possible, especially during app startup.

反射会在 Android 中带来显著的性能开销，特别是那些庞大，数据驱动的 App。因此，开发者应该尽可能避免使用反射开发这类应用，特别是在应用启动时。

Finally, we’d like to challenge our fellow Android developers working on performance issues: Tweet your startup times with the hashtag #StartupTrace. Our current time on a Nexus 5 is 1.6 seconds and always improving.

最后感谢我的同事们齐心协力解决了我们面对的性能问题：现在我们在 Nexus 5 上的启动时间只有 1.6 秒。

For our typical users on newer devices (Nexus 6P, for example), relaunches take under 1.5 seconds to go from the home screen to all the news that’s fit to scroll (at 60 frames per second, of course).

Interested in working on ambitious Android problems at The New York Times? Come join us.

对我们完成的工作感兴趣吗？来成为我们的一员把！