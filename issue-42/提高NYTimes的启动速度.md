提高NYTimes的启动速度
---

> * 原文链接 : [Improving Startup Time in the NYTimes Android App](http://open.blogs.nytimes.com/2016/02/11/improving-startup-time-in-the-nytimes-android-app/?_r=1)
* 原文作者 : [Mike Nakhimovich](http://open.blogs.nytimes.com/author/mike-nakhimovich/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121) 
* 状态 :  完成 



和大部分应用一样，“提高应用启动和加载时间”成为 NYTimes 优先考虑的需求，因为设备制造商继续为市场提供更快更流畅的设备使用体验，因此用户也期望应用有更好的性能表现。

我们组最近重写了我们的新闻 App 以发挥当今应用开发趋势的优点，我们使用了诸如依赖注入和响应式编程的技术。这次重写提高了代码的可维护性，降低代码耦合度以模块化，但也需要对代码进行一些调整以优化其表现。

我们刚发布小名为 Phoenix 的新版本的 App 时，在 Nexus 5 上的启动时间为 5.6 秒，这个结果显然不能使我们满意，毕竟我们期望的是达到 2 秒或更少，但这也激励我们花费更多的时间和精力去提升该应用的性能。

然后我们发现拖慢启动时间的原因是使用了反射的那部分代码。处理了这些使用反射的代码以及修复了一些其他的小问题后，启动时间被缩短到 1.6 秒。

##我们是怎么做到的

首先，我们跟踪 Android 应用的生命周期方法并进行特征提取得到 App 的启动时间，我们在 Application 类的构造方法中开始计时，进度条显示结束后停止计时，详见[文档](http://developer.android.com/tools/debugging/debugging-tracing.html#creatingtracefiles)。

然后通过追踪 DDMS 收集追踪文件以分析启动时间，找到对启动时间影响最大的模块。但这样分析费时费力，所以我们换了个办法，使用了 [NimbleDroid](https://www.nimbledroid.com/) 来帮助我们完成分析。NimbleDroid 提供了更简单的办法以找出造成性能瓶颈的因素，简化了性能比较的操作。

##The Low Hanging Fruit

我们找到的降低启动时间的第一个原因就和大量的类关联在一起，内存密集型运行库，Groovy 加载 Jar 资源时造成昂贵的开销，以及之前 [Joda Time 发现的其他库存在的性能问题](http://blog.danlew.net/2013/08/20/joda_time_s_memory_issue_in_android/)。我们使用 Groovy 是为了闭包；但 Android Studio 提供的代码折叠功能已经解决了这个问题。因此我们不再需要使用 Groovy，所以我们用 Java 7 提供的 API 把原来的代码替换为纯 Java 语法实现的代码，把 Groovy 从项目中移除了。虽说我们现在还在想办法增强 IDE 的功能，使得我们能直接查看匿名类，但这个需求的优先级要小一点。

然后我发现 RxJava 也带来了一些性能开销，在应用启动时大约增加了 1 秒。幸运的是，有人提了个 issue 指出这个问题，在 RxJava 的下一个版本会修复它。

一些和我们合作的第三方数据分析客户端在 App 启动时也造成了阻塞，于是我们修改了他们初始化的方式，并与供应商合作提升预加载的性能。

我们还在代码中发现了许多“技术债”带来的性能开销：由于 md5 计算使得对象初始化被阻塞；构造方法中的阻塞，一般是因为前台当前需要完成的操作太多。

完成了这些调整后，应用启动时间降低到 3.2 秒了 - 大约是优化前的一半，应用也比之前流畅了。接下来我们的目标就是优化数据流，因为我们的 App 是数据密集型的，因此这是一个严峻的考验

##介绍数据存储

因为我们所有数据都是异步观测处理的，在演示和数据层我们用单例的“内容管理者”来作为抽象。虽说这样有助于封装，但在初始化时增加了时间，因为无论何时，需要加载持久性存储的数据时它就会成为“上帝对象”，完成加载。

某些情况下，这就会带来性能问题，例如：在 App 启动时磁盘需要数据分析配置的属性值，但要获得该值需要等到 SSL 允许的网络客户端初始化完成。当应用渐渐变得庞大，添加的依赖越来越多，“内容管理者”初始化需要的时间就会越多，应用的启动时间也会因此变得更长。

为了解决这个问题，我们决定不再使用一个“内容管理者”管理数据，而是移到几个不同的地方存储数据，使我们能尽可能快地加载缓存数据。与最近 Facebook 完成的工作类似，我们尽可能将代码路径从磁盘移动到 UI。

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

Dagger 的延迟加载允许我们注入延迟的网络客户端，在我们真正需要进行网络操作时才初始化该类，在离线或第一次数据加载完成后这个特性很重要。我们的架构非常依赖后台服务所进行的数据下载。事实上，数据大部分是从磁盘存储区域中加载到 UI 上的，而不是通过网络调用获得。在我们能够创建从磁盘到屏幕的最优路径后，需要解决的问题就剩下反射了。

##移除反射

在尝试优化数据加载的性能时，我们发现为 Top Stories 解析数据需要花费大于等于 700 毫秒的时间，无论是从磁盘上获得数据，还是从网络中获得数据。我们现在才意识到 Gson 在 Android 上的性能表现是这么差，对我们这种数据驱动的应用来说，这简直是噩梦……在分析了启动时间轨迹后，我们发现反射型 Adapter 的调用非常耗时。

我们尝试最小化对 Gson 的使用，并移除 Gson 中有关反射的调用，但唯一可行的方法是一个个重写那些 Adapter。于是我们花了很多时间精力去找不需要使用反射且不会给应用启动带来昂贵开销的序列化的办法。最后我们有几个可选项，但都需要给 Model 添加代码。因此我们回到最简单的解决办法：自定义 Gson 的 Adapter。

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

现在数据流如下：

后台服务订阅延迟初始化网络客户端的 RxStore，并以 JSon 数据格式下载新的数据，然后把数据转化为数据流存到磁盘，而不是将它作为一个 JSon 对象保存，这样避免加载超过 1m 的对象到内存中。

当 UI 需要数据，就会订阅由内存缓存和磁盘支持的数据存储对象提供的不变数据，我们只需要初始化网络客户端，如果磁盘中存储的值不是不变的，或者数据格式发生了变化，而且永远不会直接从网络加载到 UI 上。该非定向数据流意味着 99% 的对数据存储对象的订阅不会产生任何影响，除了磁盘中存储的数据。

之后我们还会继续探索诸如 FlatBuffer 的方法以序列化数据存储到磁盘中；然而，我们对现状挺满意的。重新发布的应用给用户显示首页的所有内容只需要2秒。

##最后

反射会在 Android 中带来显著的性能开销，特别是那些庞大，数据驱动的 App。因此，开发者应该尽可能避免使用反射开发这类应用，特别是在应用启动时。

最后感谢我的同事们齐心协力解决了我们面对的性能问题：现在我们在 Nexus 5 上的启动时间只有 1.6 秒。

对我们完成的工作感兴趣吗？来成为我们的一员把！