
#重构Plaid-响应式的MVP模式(一)
---

> * 原文链接 :  [REFACTORING PLAID APP - A REACTIVE MVP APPROACH (PART 1)](http://hannesdorfmann.com/android/plaid-refactored-1/)
* 原文作者 : [HANNES DORFMANN](http://hannesdorfmann.com/)
* 译文出自 : [hanks.xyz](http://hanks.xyz/2015/12/08/refactoring-plaid-1/)
* 译者 : [hanks-zyh](https://github.com/hanks-zyh)
* 校对者: [desmond1121](https://github.com/desmond1121)
* 状态 :  完成

Nick Butcher 在 [github](https://github.com/nickbutcher/plaid) 上开源了Plaid。这个app不仅很酷,还拥有极致的 UI / UX。如此炫酷的app的代码对开发者来说copy下来阅读一下可谓是最佳实践。于是我也copy下来,决定深入Plaid的代码。和往常一样，你会发现里面的一些代码可以用其他的方式实现。因此不只是谈论代码,我决定花一些时间来重构Plaid的部分源代码。我将写3篇文章来分享我关于如何重构Plaid的,这篇文章是第一部分。

前言: 开始我以为自己能重构整个app. 然而,事实是我太天真了,我低估了这个应用的复杂度和新特性的数量。在我花了几个小时阅读 Nick Butcher 的代码之后, 我发现有些功能仅仅通过使用应用程序很难发现。一句话: 我意识到我没有时间把所有的想法付诸行动。因此我的“重构”集中于应用程序的“主页”和“搜索屏幕”。本来想看看有没有更多模块可以重构，但是我没有太多空闲时间来做了。重构代码可以在[github上](https://github.com/sockeqwe/plaid)找到

## 初见
整体的用户体验和用户交互都非常赞.看下面这条tweet:
 ![图片](https://dn-coding-net-production-pp.qbox.me/754a0ecf-5545-4c24-9d4a-3f16bf89ed8e.png)

使用这个app真是在享受. 它的 UI / UX 对每个开发者或者设计师很激励, 然而,在使用过程中我遇到了一些bug:
- 同时显示了加载提示和错误提示:
<iframe width="880" height="660" src="https://www.youtube.com/embed/zCwESjEpNdk" frameborder="0" allowfullscreen></iframe>

- 在筛选面板中你可以从 Dribbble, Designer News 和 Product Hunt 选择你想要显示的来源.但是当取消选择正在加载数据的"源"的时候,你会遇到item还在显示的问题:
<iframe width="880" height="660" src="https://www.youtube.com/embed/nJ3VUjpW0N0" frameborder="0" allowfullscreen></iframe>

- 而且app没有考虑屏幕旋转.当屏幕旋转界面会被重新创建,重新执行http请求,你可以看到加载提示
<iframe width="880" height="660" src="https://www.youtube.com/embed/tuIDrtvL0lg" frameborder="0" allowfullscreen></iframe>

通常这样的“问题”是由于**面条式代码** 和架构不够好。所以我们来看看显示项目列表的源代码: 在 `HomeActivity` (大约750行代码)处理UI元素的可见性,如 `RecylcerView` 或 `ProgressBar`. `HomeActivity` 包含了何时显示Source-Filters-Drawer(右边侧滑栏)的逻辑。此外,它的 `onactivityresult()`方法里面  做了很多事情,包括发布新的post到designers news。而且它使用 `DataManager`为选定的 filter 加载数据。你看, `HomeActivity` 有很多责任,可能太多了。`DataManager` 基本上使用 `retrofit` 和 `asynctask` 来执行http请求加载数据。这里的最头疼的问题是分页,尤其是RecyclerView滑动到底部时需要加载更多数据。`DataManager` 内部使用`HashMap`来记录每个源显示的页面数据(后端的endpoint 如 “Dribbble Popular” , “Dribbble Recent” 或者 “Designer News Popular”)。项目中使用`FeedAdapter`来显示到 RecyclerView上。 并且`SearchActivity`跟`HomeActivity`非常相似:它也使用`DataManager`和`FeedAdapter`。

## 架构

我觉得当前的项目架构不够清晰。`HomeActivity`管理了太多事情,简直就是神一样的存在。另一个“问题”是,`HomeActivity`从不同的方法和不同的事件中调用相同的(内部)方法去改变UI状态,如 `checkEmptyState()` 在`HomeActivity`的4个不同的地方被调用.

我们将使用 `Model-View-Presenter` 来重构一下.  passive view 仅仅用来展示, `presenter` 告诉 `passive view` 什么时候展示. 我比较热衷于MVP架构. 经常有人问我为什么我建议使用 passive view,而不是控制器或MVP派生的其他模式。好吧,如果你使用没有 passive view的MVP,你基本上是把**面条式代码**写成了一半的 presenter 一半的 passive view。

## HomeActivity in MVP

我们使用 `MVP +  passive view` 分出两个类: `HomeActivity` 和 `HomeView`,  `HomeActivity`作为View (passive view ) 实现了`HomeView`接口:

```kotlin
interface HomeView : MvpView {
    fun showLoading()
    fun showContent()
    fun showError()
    fun showLoadingMore(showing: Boolean)
    fun showLoadingMoreError(t: Throwable)
    fun addOlderItems(items: List<PlaidItem>)
}
```

现在 `HomeActivity` 负责管理UI(是否可见,位置,动画),但是由 `presenter` 决定什么时候去执行, 所以View的状态由`HomePresenter` 管理, `HomePresenter` 的代码如下:

```kotlin
class HomePresenter(private val itemsLoader: ItemsLoader<List<PlaidItem>>) : RxPresenter<HomeView, List<PlaidItem>>() {

    fun loadItems() {

        view?.showLoading()
        subscribe(
                itemsLoader.firstPage(),
                { // onError
                    view?.showError()
                },
                { // onNext
                    view?.addOlderItems(it)
                    view?.showContent()
                }
        )

    }

    fun loadMore() {

        view?.showLoadingMore(true)
        subscribe(
                itemsLoader.olderPages(),
                { // onError
                    view?.showLoadingMoreError(it)
                },
                { // onNext
                    view.addOlderItems(it)
                    view.showLoadingMore(false)
                }
        )
    }
}
```

可能你注意到了,我使用的是kotlin语言,主要是因为我喜欢这个语言并且有幸看到kotlin的发展,由于kotlin的互操作性(与java相互调用)使得我很容易的重用 Nick Butcher的 java 代码(主要是UI 或者View 方面的东西).

为了实现 MVP, 我们使用了 **Mosby** 库,这是一个MVP 库,当旋转屏幕的时候允许我们保持 presenters, 这样就不会在旋转屏幕时重新启动界面,加载提示,进行请求了, **Mosby** 也可以在旋转屏幕的时候保持view的状态.

此外我决定在Model层使用  `RxJava` (这样在 presenters中可以使用 `subscribe()` 方法). `ItemsLoader`类 是我重构的 reactive版本的 DataManager. 我来花一分钟解释一下.

## SearchActivity in MVP

就像前面所说的, `SearchActivity` 和 `HomeActivity` 很像, 它展示了一个列表(grid),并且会在  `RecyclerView`滑动到底部的时候加载更多items, 所以 `SearchActivity` 应用MVP跟前面一样:

```kotlin
public interface SearchView extends MvpView {
  void showLoading();
  void showContent();
  void showError(Throwable t);
  void showLoadingMore(boolean showing);
  void showLoadingMoreError(Throwable t);
  void addOlderItems(List<PlaidItem> items);
  void showSearchNotStarted();
}
class SearchPresenter(private val itemsLoaderFactory: SearchItemsLoaderFactory) : RxPresenter<SearchView, List<PlaidItem>>() {

    private var itemsLoader: ItemsLoader<List<PlaidItem>>? = null

    fun search(query: String) {

        // Create items loader for the given query string
        itemsLoader = itemsLoaderFactory.create(query)

        view?.showLoading()

        subscribe(itemsLoader!!.firstPage(), { // Error handling
            view?.showError(it)
        }, { // onNext
            view?.addOlderItems(it)
        }, {
            view?.showContent()
        })
    }

    fun searchMore(query: String) {

        view?.showLoadingMore(true)
        subscribe(itemsLoader!!.olderPages(), { // Error handling
            view?.showLoadingMore(false)
            view?.showLoadingMoreError(it)
        }, { // onNext
            view?.addOlderItems(it)
        }, { // onComplete
            view?.showLoadingMore(false)
        })

    }

    fun clearSearch() {
        // Unsubscribe any previous search subscriptions
        unsubscribe()

        view.showSearchNotStarted()
    }
}
```

跟 `HomePresenter` 唯一不同的是,  `SearchPresenter` 通过传入一个`SearchItemsLoaderFactory` 作为构造方法的参数,为每次搜索查询创建了一个 `ItemsLoader`. 我们来简单看一下它是怎么工作的.

## ItemsLoader 和 Pagination

目前我们完成了 `View` 和 `Presenter`, 现在讨论一下如何重构 "Model"

在我们开始之前: 了解一下 `PlaidItem`类 ( 包含title和 image url). 这个类是单个item的基类
`Shot` extends `PlaidItem` :代表从Dribbble加载的item
`Story` extends `PlaidItem`: 代表从Designer News加载的item
`Post` extends `PlaidItem`: 代表从 Product Hunt 加载的item
现在我们讨论一下使用`RxJava` 来高效的重写一下 `DataManager`, 我使用RxJava是因为它简直酷毙了, 你将会体会到它的强大(特别是这个系列的第二篇)并且从中受益.

加载项的困难的部分是,我们从不同的后端支持分页和加载items。我们“自下而上”构建 `ItemsLoader` 。“底部”有一个执行 http 的 Retrofit 接口。现在你可以搜索Dribbble和DesignerNews。分页的问题: Dribbble 调用 loadItems(0,100) 来加载100个items, 调用loadItems(100、200)加载下一个页面的100个, 而DesignerNews是每次page加1,通过调用 loadItems(0,1)来加载第一个页面, 调用loadItems(1,2)加载下一个页面。我们需要一个通用的API。我们可以使用kotlin的高级函数(传递函数参数或者匿名函数)。所以我们需要的是一个组件,这个组件包含一个可以执行http请求并返回一个Observable的方法。所以我们需要这样的:  `backendMethodToCall:(Int,Int)-> Observable<T>`, 第一个参数代表page,第二个代表limit(每页加载多少条), T 泛型代表返回结果的类型(事实上类型总是< PlaidItem>)。
 我们把这个组件叫做 `RouteCaller`:

```kotlin
class RouteCaller<T>(private val startPage: Int = 0,
                     private val itemsPerPage: Int,
                     private val backendMethodToCall: (Int, Int) -> Observable<T>) {

    /**
     * Offset for loading more
     */
    private val olderPageOffset = AtomicInteger(startPage)

    /**
     * A queue that is used to retry "older"
     * pages if they have failed before continue with even more older
     */
    private val olderFailedButRetryLater: Queue<Int> = LinkedBlockingQueue<Int>()

    /**
     * Get an observable to load older data from backend.
     */
    fun getOlderWithRetry(): Observable<T> {

        val pageOffset = if (
        olderFailedButRetryLater.isEmpty()) {
            olderPageOffset.addAndGet(itemsPerPage)
        } else {
            olderFailedButRetryLater.poll()
        }

        return backendMethodToCall(pageOffset, itemsPerPage)
                .doOnError {
                    olderFailedButRetryLater.add(pageOffset)
                }
    }

    /**
     * Get an observable to load the newest data from backend.
     * This method should be invoked on pull to refresh
     */
    fun getFirst(): Observable<T> {
        return backendMethodToCall(startPage, itemsPerPage)
    }
}
```

`RouteCaller` 接受一个`method(Int, Int) -> Observable<T>` 作为构造函数的参数, 根据传入不同的参数执行不同的动作:
- getFirst() 加载第一页
- getOlderWithRetry(): 加载老的数据.
我们使用 `olderFailedButRetryLater ` 字段来记录当前页码, 当执行加载更多的时候加1, 此外当加载下一页数据失败后,我们在 `.doOnError()` 方法中进行重试
所以 `RouteCaller`的职责就是传输参数,执行实际的后端请求,于是有下面的结构:

![RouteCaller](http://hannesdorfmann.com/images/plaid/routing1.png)

我们有两个接口 `DesignerNewsService` 和 `DribbleService` 去执行搜索, 这意味着我们需要两个 `RouteCaller`:

![RouteCaller](http://hannesdorfmann.com/images/plaid/routing1.png)

下一个问题是:如何实例化一个 `RouteCalls`? 我们为每一个后端服务各定义一个 `RouteCallerFactory`,
它提供一个方法 `getAllBackendCallers() ` 来得到一个 Observable的 `List<RouteCaller>`.

```kotlin
interface RouteCallerFactory<T> {

    /**
     * Get all available backend route callers
     */
    fun getAllBackendCallers(): Observable<List<RouteCaller<T>>>
}

class DesignerNewsSearchCallerFactory(private val searchQuery: String, private val backend: DesignerNewsService) : RouteCallerFactory<List<PlaidItem>> {

    val extractPlaidItemsFromStory = fun(story: StoriesResponse): List<PlaidItem> {
        return story.stories
    }

    // The method to execute from RouteCaller
    val searchCall = fun(pageOffset: Int, itemsPerPage: Int): Observable<List<PlaidItem>> {
        return backend.search(searchQuery, pageOffset).map(extractPlaidItemsFromStory)
    }

    // Create a list with one single RouteCaller() with "searchCall" as method reference
    private val callers = arrayListOf(RouteCaller(0, 100, searchCall))

    override fun getAllBackendCallers(): Observable<List<RouteCaller<List<PlaidItem>>>> {
        return Observable.just(callers)
    }
}
```

如果你是初学kotlin,乍一看 `DesignerNewsSearchCallerFactory` 有点奇怪,我们没有使用Lambda而是创建一个searchCall属性,它实际上是一个函数 `(Int, Int) -> Observable<List<PlaidItem>>`。

这样做是有原因的: 最近我看到Android团队在`Android2015开发者峰会`被问到何时添加Java 8支持。**Reto Meier** 回答说,许多开发人员主要是对Lambda 感兴趣, 当他问观众:想要Android加入Lambda 的请举手,然后几乎所有人举手了。我认为,对于Lambda 有一种普遍的误解: Lambda如此强大是因为它的高阶函数和函数传递。Lambda 只不过是一个是匿名函数。实际上,Lambda并不能测试,它们是硬编码的。例如,我还会实现这样的:

```
RouteCaller(0, 100, { pageOffset, limit -> backend.search(searchQuery, pageOffset) })
```

Next we introduce a Router which is responsible to combine all RouteCaller from different RouteCallerFactories to one single Observable list:

我们应该怎么写单元测试呢? 不可能给匿名函数写单元测试,因为它们是"硬编码的",  然而,如果我们传递一个函数作为参数,那么很容易为这个函数写一个单元测试. 在Java8中,传递一个函数参数这样写 `::searchCall`. 不幸的是, kotlin还不支持,目前仅仅支持静态方法,因此这里定义一个函数作为属性. 在这个系列文章的最后我会介绍一下我使用kotlin的体会.

好了,看一下"搜索"的结构

![RouteCallerFactory](http://hannesdorfmann.com/images/plaid/routing3.png)

注意,`getAllBackendCallers()` 返回一个列表,其中包含一个RouteCaller,但这个想法是 RouteCallerFactory创建所有RouteCallers。稍后我们将看到,在Dribbble上RouteCallers HomeDribbbleCallerFactory返回一个RouteCaller的列表,代表每个端点加载item,如受欢迎的项目,最近的,动画等.

![RouteCallerFactory](http://hannesdorfmann.com/images/plaid/routing4.png)

下面我们介绍`Router`, 它负责组合所有的 RouteCaller, 将不同的 RouteCallerFactories 返回一个单个的 Observable的list:

```kotlin
class Router<T>(private val routeFactories: List<RouteCallerFactory<T>>) {

    fun getAllRoutes(): Observable<List<RouteCaller<T>>> {
        val callers = ArrayList<Observable<List<RouteCaller<T>>>>()

        routeFactories.forEach {
            callers.add(it.getAllBackendCallers())
        }

        return Observable.combineLatest(callers, { calls ->
            val items = ArrayList<RouteCaller<T>>(calls.size)
            calls.forEach {
                items.addAll(it as List<RouteCaller<T>>)
            }

            items // return items
        })
    }
}
```

如你所见 `Route` 接收一个`RouteCallerFactory`列表,换句话说:通过构造函数可以配置Route。下面来完成“路由图”:

![](http://hannesdorfmann.com/images/plaid/routing5.png)

好了,到目前为止,我们重构了“routing 部分”。最后`Router`提供了一个 `Observable<List<RouteCaller<T>>>` 。那么什么时候在RecyclerView中显示item呢?这就是`ItemsLoader`的职责了。正如它的名字,该组件用来加载item:

```kotlin
class ItemsLoader<T>(protected val router: Router<T>) {

    fun firstPage(): Observable<T> {
        return FirstPage<T>(router.getAllRoutes()).asObservable()
    }

    fun olderPages(): Observable<T> {
        return OlderPage<T>(router.getAllRoutes()).asObservable()
    }
}
```

`ItemsLoader` 接受一个 `Router` 作为构造函数的参数, 此外接受两个方法, firstPage()返回一个代表first page的 `Observable`, olderPages()返回一个代表older pager的 `Observable`.一个page代表RecyclerView显示的一页items,当我们滑动到底部的时候加载下一页数据.
看一下 `Page`, `FirstPage` 和 `OlderPage` 的代码:

```
abstract class Page<T>(val routeCalls: Observable<List<RouteCaller<T>>>) {

    private var failed = AtomicInteger()
    private var backendCallsCount: Int = 0

    /**
     * Return an observable for this page
     */
    fun asObservable(): Observable<T?> {

        return routeCalls.flatMap { routeCalls ->

            backendCallsCount = routeCalls.size
            val observables = arrayListOf<Observable<T>>()
            routeCalls.forEach { call ->
                    val observable = getRouteCall(call).onErrorResumeNext { error ->
                      // Suppress errors as long as not all fail
                        error.printStackTrace()
                        val fails = failed.incrementAndGet()

                        if (fails == backendCallsCount) {
                            Observable.error(error) // All failed so emmit error
                        } else {
                            Observable.empty() // Not all failed, so ignore this error and emit nothing
                        }
                    }
                    observables.add(observable);
                }

                // return the created Observable
                Observable.merge(observables)
        }
    }

    protected abstract fun getRouteCall(caller: RouteCaller<T>): Observable<T>
}
class FirstPage<T>(routeCalls: Observable<List<RouteCaller<T>>>) : Page<T>(routeCalls) {

    override fun getRouteCall(caller: RouteCaller<T>): Observable<T> {
        return caller.getFirst();
    }
}

class OlderPage<T>(routeCalls: Observable<List<RouteCaller<T>>>) : Page<T>(routeCalls) {

    override fun getRouteCall(caller: RouteCaller<T>): Observable<T> {
        return caller.getOlderWithRetry();
    }
}
```

`Page`类负责调用`RouteCaller`的方法来执行http请求,我们不希望因为某个后端的调用失败导致整个页面数据获取失败,因此我们使用 `onErrorResumeNext()` 来拦截错误,然后返回一个http请求调用失败的 error.然后 `Presenter`通过`ItemsLoader` 订阅页面的 `observable`.

## 依赖注入

你可能注意到了,到目前为止几乎所有的组件都拥有一个接受其他组件作为参数的构造方法. 这是设计好的,现在我们使用 `Dagger`(我使用的 `Dagger1`) 来组合我们需要的元素:
```
@Module(
    injects = {
        HomePresenter.class
    },
    addsTo = ApplicationModule.class // contains Retrofit interfaces
)
public class HomeModule {

  @Provides @Singleton HomePresenter provideSearchPresenter(SourceDao sourceDao,
      DribbbleService dribbbleBackend,
      DesignerNewsService designerNewsBackend,
      ProductHuntService productHuntBackend ) {

    // Create the router
    List<RouteCallerFactory<List<? extends PlaidItem>>> routeCallerFactories = new ArrayList<>(3);
    routeCallerFactories.add(new HomeDribbbleCallerFactory(dribbbleBackend, sourceDao));
    routeCallerFactories.add(new HomeDesingerNewsCallerFactory(designerNewsBackend, sourceDao));
    routeCallerFactories.add(new HomeProductHuntCallerFactory(productHuntBackend, sourceDao));

    Router<List<? extends PlaidItem>> router = new Router<>(routeCallerFactories);

    ItemsLoader<List<? extends PlaidItem>> itemsLoader = new ItemsLoader<>(router);

    return new HomePresenterImpl(itemsLoader);
  }
}
```

正如你所见, 我们可以使用 `Dagger`来配置 `Router` 和 `ItemsLoader`. 我们给 `SearchModule`的`SearchPresenter`  配置一个 `ItemsLoader`和`Router`. 优势就是,如果有一天我们想要添加另一个“源”,如reddit,我们唯一要做的就是定义一个`RedditService`(Retrofit), `RedditCallerFactoy`并在`Router`中添加这个`CallerFactory`。我们可以在一个具体的 dagger module中,而不用修改其他类(开闭原则)。换句话说:我们已经通过依赖注入建立了一个可配置“插件系统”。
您可能已经注意到 `SourceDao` 类的代码。我们将在第二篇博客中讨论如何将响应式编程进行得更彻底。


## 第一部分总结
这是这个系列博客的第一篇.这篇文章中我们使用了MVP模式,并且重构了一下从后端加载数据的方法. 主要任务就是将大的复杂的任务拆分成小的可重用的组件,如 `ItemsLoader`, `Page`, `Router` 和 `RouteCaller` ,更加遵循 SOLID (Single responsibility, Open-closed, Liskov substitution, Interface segregation and Dependency inversion) ,如 DataManager 的实现.

总之,有更好的方法去实现这样一个app. 特别是 `ItemsLoader` 可以以完全不同的方式实现,我首先想到的是使用`RxJava`的 `SwitchOnNext()`或者 `merge`操作符去创建一个Observable去加载下一页数据. 但是,关于UI和错误处理,如果我可以单一观测分割成两个可见(first Page,older Page )会更容易实现

总之,欢迎提建议或反馈!
在第二部分, 我将使用`RxJava` 去重构Plaid 来实现一个 "真正意义上的响应式"的app.
