
#重构Plaid-响应式的MVP模式(一)
---

> * 原文链接 :  [REFACTORING PLAID APP - A REACTIVE MVP APPROACH (PART 1)](http://hannesdorfmann.com/android/plaid-refactored-1/)
* 原文作者 : [HANNES DORFMANN](http://hannesdorfmann.com/)
* 译文出自 : [hanks.xyz](http://hanks.xyz/2015/12/08/refactoring-plaid-1/)
* 译者 : [hanks-zyh](https://github.com/hanks-zyh)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中

Nick Butcher has open sourced on github an awesome app called Plaid. The app is pretty cool and has an outstanding UI / UX. Whenever source code of such awesome apps are available developers start to copy code and best practice tips from it. So I did the same and decided to dive into the code of Plaid. As always, you will find some parts of the code that you think could be implemented or be written in another way. So instead of just talking about code I have decided to spend some of my spare time to refactor some parts of Plaid’s source code. This blog post is the first part of a series of 3 posts of how I would refactor the Plaid app and to share my thoughts.

Nick Butcher 在 [github](https://github.com/nickbutcher/plaid) 上开源了Plaid。这个app不仅很酷,还拥有极致的 UI / UX。如此炫酷的app的代码对开发者来说copy下来阅读一下可谓是最佳实践。于是我也copy下来,决定深入Plaid的代码。像往常一样,你会发现代码的某些部分可以实现或者用另一种方式。因此不只是谈论代码,我决定花一些时间来重构Plaid的部分源代码。我将写3篇文章来分享我关于如何重构Plaid的,这篇文章是第一部分。


Preface: I started the refactoring with the strong belief that I can refactor the whole app. Surprisingly (ironic), it turns out that I was a very naive man. I simply have underestimated the complexity of the app and the number of features. I discovered some features only after having spent some hours with Nick Buchter’s code, which were not “visible” to me just by using the app. In short: I realized that I don’t have the time to put all my thoughts into action. Hence my “refactoring” is focused on the apps “homepage” and the “search screen”, which I have refactored mostly. Nevertheless, I want discuss (in theory) some more things that could be refactored, but I didn’t because of time constraints. My refactored code can be found on github as well.

前言: 开始我满满的自信以为自己能重构整个app. 然而,事实是我太天真了,我低估了这个应用的复杂度和新特性的数量。在我花了几个小时阅读 Nick Butcher的代码之后, 我发现了一些有些功能仅仅通过使用应用程序很难发现。一句话:我意识到我没有时间把所有的想法付诸行动。因此我的“重构”集中于应用程序的“主页”和“搜索屏幕”。本来想要讨论(理论上)一些事情可以重构,但是由于时间原因没有完成。重构代码可以在[github上](https://github.com/sockeqwe/plaid)找到


First look
The overall user experience and user interface is pretty awesome. I can’t describe it even better than this tweet:

## 初见
整体的用户体验和用户交互都非常赞.看下面这条tweet:


It’s a joy to use the app. The UI / UX is truly an inspiration for every developer and designer. However, after playing around a little bit more with the app I faced some visual bugs:

Displaying a loading indicator and error message at the same time:

In the app you can apply some “filters” or in other words: You can specify which “sources” of Dribbble, Designer News and Product Hunt you want to display. If you deselect such sources while loading an http request is currently running you can run into the state where the app displays items, but shouldn’t since no sources are selected:

Also the app doesn’t handle screen orientation changes properly. It simply rebuilds the entire screen so that after each orientation change you see the loading indicator again, and re-execute the http calls:

使用这个app真是在享受. 它的 UI / UX 对每个开发者或者设计师很激励, 然而,在使用过程中我遇到了一些bug:

- 同时显示了加载提示和错误提示:
<iframe width="880" height="660" src="https://www.youtube.com/embed/zCwESjEpNdk" frameborder="0" allowfullscreen></iframe>

- 在筛选面板中你可以从 Dribbble, Designer News 和 Product Hunt 选择你想要显示的来源.但是当取消选择正在加载数据的"源"的时候,你会遇到item还在显示的问题:
<iframe width="880" height="660" src="https://www.youtube.com/embed/nJ3VUjpW0N0" frameborder="0" allowfullscreen></iframe>

- 而且app没有考虑屏幕旋转.当屏幕旋转界面会被重新创建,重新执行http请求,你可以看到加载提示ute the http calls:
<iframe width="880" height="660" src="https://www.youtube.com/embed/tuIDrtvL0lg" frameborder="0" allowfullscreen></iframe>




Typically such “issues” are a first indicator for spaghetti code and a moderate software architecture. So let’s take a look under the hood and check out the source code and the components for displaying a list of items: The HomeActivity (about 750 lines of code) handles the visibility of UI elements like displaying the RecylcerView or the ProgressBar. This activity also decides when to display the Source-Filters-Drawer (on the right side). Furthermore, in it’s onActivityResults() it does a lot of things inclusive posting new post to designers news. Last but not least it also loads the data for the selected filters by using a DataManager. You see, the HomeActivity has many responsibilities, probably too many. The DataManager basically uses a combination of Retrofit and AsyncTasks to execute http calls to load the data. The tricky thing here is pagination. Whenever the end of the RecyclerView has been reached, more (older) items are loaded. DataManager uses internally a HashMap to track the current page each source (backend endpoint like “Dribbble Popular” or “Dribbble Recent” or “Designer News Popular”) is currently displaying. The items are displayed in a RecyclerView by using FeedAdapter. The SearchActivity is working quite similar as HomeActivity: It uses a DataManager and a FeedAdapter as well.

通常这样的“问题”是由于**面条式代码** 和不够好的架构。所以让我们来看看显示项目列表的源代码:在 `HomeActivity` (大约750行代码)处理UI元素的可见性,如`RecylcerView`或`ProgressBar`。这个activity也决定何时显示Source-Filters-Drawer(右边侧滑栏)。此外,在它的 `onactivityresult()`  做了很多事情,包括发布新的post到designers news。而且它使用 `DataManager`为选定的 filter 加载数据。你看,HomeActivity有很多责任,可能太多了。`DataManager` 基本上使用 `retrofit` 和 `asynctask` 执行http请求来加载数据。这里的最头疼的问题是分页。每当RecyclerView滑动到底部,需要加载更多。`DataManager` 内部使用`HashMap`来记录每个源显示的页面数据(后端的endpoint 如 “Dribbble Popular” , “Dribbble Recent” 或者 “Designer News Popular”)。项目中使用`FeedAdapter`来通过 RecyclerView显示。 和 `SearchActivity`跟`HomeActivity`非常相似:它也使用`DataManager`和`FeedAdapter`。



The architecture
From my point of view there is no clear architecture in the current implementation. HomeActivity is some kind of god object that manages many things. Another “issue” is that HomeActivity changes the UI state by calling the same (internal) methods from different other methods and different events, i.e. the method checkEmptyState() get’s called from 4 different point’s in HomeActivity source code.

We will refactor that by applying a Model-View-Presenter with a passive view. The passive view will only be display that things that the presenter tells to do. I’m a fan of MVP with a passive view. People ask me from time to time why I recommend to use passive view and not supervising controller or other MVP derivations. Well, if you use MVP without passive view, you basically are splitting the spaghetti code formerly sitting in the view to half presenter and half view.
## 架构

在我看来在当前实现中架构不清晰。`HomeActivity`被用来管理许多事情。另一个“问题”是`HomeActivity`从不同的方法和不同的事件来调用相同的(内部)方法去改变UI状态,如 `checkEmptyState()` 在`HomeActivity`的4个不同的地方被调用.

我们将使用 `Model-View-Presenter` 来重构一下.  passive view 仅仅用来展示, presenter告诉passive view什么时候展示.我热衷于MVP架构. 不时有人问我为什么我建议使用 passive view,而不是控制器或其他MVP派生。好吧,如果你使用MVP没有 passive view,你基本上是把**面条式代码**写成了一半的 presenter 一半的 passive view。


HomeActivity in MVP

So with MVP + passive view we split the responsibilities into two classes: HomeActivity implements HomeView is now considered as View (passive view) and implements this interface:

## HomeActivity in MVP

我们使用 MVP +  passive view 把职责分成两个类: `HomeActivity` 和 `HomeView`,  `HomeActivity`作为View (passive view ) 实现了`HomeView`接口:

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


From now on the job of HomeActivity is to manage the UI elements (visibility, coordinate animations, etc.) but only after the presenter told to do so. So the state of the View is managed by the HomePresenter. The HomePresenter looks like this:

现在 `HomeActivity` 负责管理UI(是否可见,位置,动画),但是由 presenter告诉什么时候去执行,所以View的状态由`HomePresenter` 管理, `HomePresenter` 的代码:

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

If you haven’t noticed yet: We use kotlin as programming language, mainly because I like the language and to have the chance to see how development with kotlin works in a “real world” application. Thanks to the kotlin’s interoperability I can easily reuse Nick Butcher’s java source code, mainly for UI / View things.

For implementing MVP we use Mosby, a MVP library, which also allows us to keep the presenters during screen orientation changes. So we don’t have to restart with loading data and we don’t see the ProgressBar after screen orientation changes. Mosby allows us to keep the views state as before the orientation change.

Last but not least I have decided to use RxJava for my “Model” (hence the subscribe() method in the presenter). So the ItemsLoader is my refactored and reactive version Nick Butcher’s DataManager. I will explain the ItemsLoader in a minute.

可能你注意到了,我使用的是kotlin语言,主要是因为我喜欢这个语言并且有幸看到kotlin的发展,由于kotlin的互操作行(与java相互调用)使得我很容易的重用 Nick Butcher的 java 代码(主要是UI 或者View 方面的东西).

为了实现 MVP, 我们使用了Mosby 库,这是一个MVP 库,当旋转屏幕的时候允许我们保持 presenters, 这样就不会在旋转屏幕时重新启动界面,加载提示,进行请求了, Mosby 也可以在旋转屏幕的时候保持view的状态.

此外我决定在Model层使用 `RxJava`(在 presenters中可以使用 `subscribe()` 方法). `ItemsLoader` 是我重构的 reactive版本的 DataManager. 我来花一分钟解释一下.


## SearchActivity in MVP

As already said, running a search is very similar to HomeActivity. It displays a list (grid) of items and adds pagination to load more items when the end of the RecyclerView has been reached. So applying MVP to SearchActivity is pretty the same as shown before:


## SearchActivity in MVP

就像前面所说的, `SearchActivity` 和 `HomeActivity` 很像, 他展示了一个列表(grid),并且会在  `RecyclerView`滑动到底部的时候加载更多items, 所以 `SearchActivity` 应用MVP跟前面一样:

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

The only different compared to HomePresenter is that SearchPresenter takes a SearchItemsLoaderFactory as constructor parameter and creates a ItemsLoader dynamically for each search query. We will see how this works in a minute.

跟 `HomePresenter` 唯一不同的是,  `SearchPresenter` 通过传入一个`SearchItemsLoaderFactory` 作为构造方法的参数,为每次搜索查询创建了一个 `ItemsLoader`. 我们来简单看一下它是怎么工作的.


ItemsLoader and Pagination
So far we have covered View and Presenter. Now lets discuss how we could refactor the “Model” or use case / interactor if you want to compare it with uncle Bob’s clean architecture.

## ItemsLoader 和 Pagination

目前我们完成了 `View` 和 `Presenter`, 现在讨论一下如何重构 "Model"


Before we start: There is a class called PlaidItem (holds properties like title and image url). This class is the base class to represent a single item:
Shot extends PlaidItem for an item loaded from Dribbble
Story extends PlaidItem for an item loaded from Designer News
Post extends PlaidItem for an item loaded from Product Hunt
So now let’s discuss how we rewrite DataManager more efficiently by using RxJava. I don’t use RxJava because I think it’s cool and all the cool kids have to use RxJava nowadays. You will (hopefully) see the benefits of using RxJava afterwards (especially in the second part of this blog post series).


在我们开始之前: 了解一下 `PlaidItem`类 ( 包含title和 image url). 这个类是单个item的基类
`Shot` extends `PlaidItem` :代表从Dribbble加载的item
`Story` extends `PlaidItem`: 代表从Designer News加载的item
`Post` extends `PlaidItem`: 代表从 Product Hunt 加载的item
现在我们讨论一下使用`RxJava` 来高效的重写一下 `DataManager`, 我使用RxJava是因为它简直酷毙了, 你将会体会到它的强大(特别是这个系列的第二篇)并且从中受益.


The hard part of loading items is that we support pagination and loading items from different backends. So let’s build the ItemsLoader from “bottom-up”. At the “bottom” we will find a Retrofit interface for executing the http call. Right now in Plaid you can search DesignerNews and Dribbble. The pagination problem: Dribbble loads 100 items and requires such a call loadItems(0, 100) and the next page will be loadItems(100, 200) while DesignerNews increments his page by 1 loadItems(0, 1) and next page will be loadItems(1, 2). We need a common API for both. Since we use kotlin we can pass “method references” (function poitners) or lambdas. So what we need is a component that takes such a function, executes this function and returns an Observable where we get the result of the actual http call. So basically we need something like this: backendMethodToCall: (Int, Int) -> Observable<T>, where the first int parameter is the page offset, the second int parameter the limit (how many items should be loaded per page) and T is the generic type of the result (in fact we are always loading List<PlaidItem>).

We call that component RouteCaller:


加载项的困难的部分是,我们从不同的后端支持分页和加载items。让我们从“自下而上”构建ItemsLoader。在“底部”我们将找到一执行 http 的 Retrofit 接口。现在你可以搜索Dribbble和DesignerNews。分页的问题: Dribbble 通过调用 loadItems(0,100)来加载100个items, 调用loadItems(100、200)加载下一个页面的100个, 而DesignerNews是每次page加1,通过调用 loadItems(0,1)来加载第一个页面, 调用loadItems(1,2)加载下一个页面。我们需要一个通用的API。我们可以使用kotlin的高级函数(传递函数参数或者匿名函数)。所以我们需要的是一个组件,这个组件包含这样的一个函数,这个函数执行http请求并返回一个Observable。所以我们需要这样的:  `backendMethodToCall:(Int,Int)-> Observable<T>`, 第一个参数代表page,第二个代表limit(每页加载多少条), T 泛型代表返回结果的类型(事实上我们总是让返回< PlaidItem>)。
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

RouteCaller takes such a method (Int, Int) -> Observable<T> as constructor parameter and will call this method internally with the correct parameters: - getFirst() loads the first page - getOlderWithRetry(): This method is responsible to load older items. We keep track of the current page in the field olderPageOffset and we will increment this one when we start loading more items (or in other words: load an older page). Additionally, we use .doOnError() to retry to load the failed page when loading the next page.

So the responsibility of RouteCaller is to fill out the parameters (page offset and page limit) needed for the real http backend endpoint call. So what we have is something like this:

RouteCaller

For executing a search we have two backends to query DesignerNewsService and DribbleService. That means that we have two RouteCallers (one for each backend search method to invoke):

RouteCaller

The next question is: How do we instantiate a RouteCaller? We define a RouteCallerFactory for each backend, which basically offers a method getAllBackendCallers() where we get an Observable List<RouteCaller> we should execute to load items.


`RouteCaller` 接受一个`method(Int, Int) -> Observable<T>` 作为构造函数的参数, 根据传入不同的参数执行不同的动作:
- getFirst() 加载第一页
- getOlderWithRetry(): 加载老的数据.
我们使用 olderFailedButRetryLater 字段来记录当前页码, 当执行加载更多的时候加1, 此外当加载下一页数据失败后,我们在 `.doOnError()` 方法中进行重试
所以 `RouteCaller`的职责就是传输参数,执行实际的后端请求,于是有下面的结构:

![RouteCaller](http://hannesdorfmann.com/images/plaid/routing1.png)

我们有两个接口 `DesignerNewsService` 和 `DribbleService` 去执行搜索, 这意味着我们需要两个 `RouteCaller`:

![RouteCaller](http://hannesdorfmann.com/images/plaid/routing1.png)

下一个问题是:如何实例化一个 `RouteCalls`? 我们为每一个后端服务各定义一个 `RouteCallerFactory`
它提供一个方法 `getAllBackendCallers() ` 来得到一个 Observable的 List<RouteCaller> .

```kotlin
interface RouteCallerFactory<T> {

    /**
     * Get all available backend route callers
     */
    fun getAllBackendCallers(): Observable<List<RouteCaller<T>>>
}
For executing a search we have DesignerNewsSearchCallerFactory and DribbbleSearchCallerFactory: The DesignerNewsSearchCallerFactory looks like this:

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

At first glance DesignerNewsSearchCallerFactory looks a little bit strange if you are new to kotlin because we don’t use lambdas but instead we create a property searchCall which actually is a function (Int, Int) -> Observable<List<PlaidItem>>.

The reason why we do this is testability: Recently I have watched the fireside chat of Android Dev Summit 2015 where the guys from the Android Team has been asked when they will add Java 8 support. Then Reto Meier, from the Android Team, answered that many developers are mainly interessted in lambdas and asked the audience if they could raise the hand if they want lambdas for android development: Almost the whole audience has raised the hand. I think that there is a general misunderstanding with lambdas: the real power of programming language that offer lambdas are not lambdas itself, is higher order functions and the ability to passing method references. Lambdas are just kind of anonymous functions. Actually, lambdas are not testable, because they are hardcoded. For example if I would have implemented something like this:


如果你初学kotlin,乍一看 `DesignerNewsSearchCallerFactory` 有点奇怪,我们没有使用lambdas而是创建一个searchCall属性,实际上是一个函数 `(Int, Int) -> Observable<List<PlaidItem>>`。

这样做是有原因的: 最近我看到Android团队在`Android2015开发者峰会`的谈话,被问到何时添加Java 8支持。**Reto Meier** 回答说,许多开发人员主要是对Lambdas 感兴趣, 当他问观众:想要Android加入Lambdas的请举手,然后几乎所有人举手了。我认为,对于Lambdas有一种普遍的误解: 提供Lambdasd的那些编程语言的真正强大不是 Lambdas,而是高阶函数和函数传递。lambdas 只不过是一个是匿名函数。实际上,Lambdas没有资格的,因为它们是硬编码的。例如,我还会实现这样的:

```
RouteCaller(0, 100, { pageOffset, limit -> backend.search(searchQuery, pageOffset) })
```
How do we write a unit test for that lambda? It’s not possible to write a unit test for that lambda since the lambda is “hardcoded”, whereas if we pass a function reference we can easily unit test a function. In java 8 we can pass a method reference by writing this::searchCall. Unfortunately, this syntax is not supported yet in kotlin (right now :: only supports static methods). Therefore this “workaround” by defining a function as property. More about my experience with kotlin in the last part of this series of blog post.

All right, so for executing a Search we have something like this:

RouteCallerFactory

Please note that for the search getAllBackendCallers() returns a list containing just one RouteCaller, but the idea is that a RouteCallerFactory creates all RouteCallers to all available endpoints of a certain backend. As we will see later, the HomeDribbbleCallerFactory returns a list of RouteCallers for each Dribbble endpoint to load items like popular items, recent, animated etc. So we have something like that:

RouteCallerFactory

Next we introduce a Router which is responsible to combine all RouteCaller from different RouteCallerFactories to one single Observable list:

我们应该怎么写单元测试呢? 不可能给匿名函数写单元测试,因为它们是"硬编码的",  然而,如果我们传递一个函数作为参数,那么很容易的为这个函数写一个单元测试. 在Java8中,传递一个函数参数这样写 `::searchCall`. 不幸的是, kotlin还不支持,目前仅仅支持静态方法,因此这里定义一个函数作为属性. 在这个系列文章的最后我会介绍一下我使用kotlin的体会.

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

As you see the Router takes a list of RouteCallerFactory, in other words: a Router can be configured via constructor. So to complete the “routing picture”:

Router

Ok, so far we have covered the “routing part”. So at the end the Router offers an Observable<List<RouteCaller<T>>>. But when do we finally load items to display them in the RecyclerView. This is the responsibility of ItemsLoader. As the name already suggests this component loads items:


如你所见Route 接收一个RouteCallerFactory列表,换句话说:通过构造函数可以配置Route。来完成“路由图”:

![](http://hannesdorfmann.com/images/plaid/routing5.png)

好了,到目前为止,我们已经介绍了“Route 部分”。最后Router提供了一个 `Observable<List<RouteCaller<T>>>` 。但当我们最终在RecyclerView显示item的时候,这就是ItemsLoader的责任了。正如它的名字,该组件用来加载item:

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

The ItemsLoader takes a Router as constructor parameter and offers two methods: - firstPage(): Returns an Observable representing the first page. - olderPages(): Returns an Observable to load older pages.

A Page represents a page of items displayed in the RecyclerView. If we scroll to the end of the RecyclerView we load the next page containing older items. Let’s have a look at the FirstPage extends Page and OlderPage extends Page classes:

`ItemsLoader` 接受一个 Router 作为构造函数的参数, 此外接受两个方法, firstPage()返回一个代表first page的Observable, olderPages()返回一个代表older pager的Observable.一个page代表RecyclerView显示的一页items,当我们滑动到底部加载下一页数据,看一下 page, FirstPage 和 OlderPage的代码:

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

Page is responsible for finally executing the http call by invoking RouteCaller's method. We also don’t want that one entire page fails just because one backend call has fails. Therefore we use onErrorResumeNext() to “intercept” errors and only return an error if all http calls have failed.

Then the Presenter subscribes to the “page” observable via ItemsLoader.

Page 负责调用RouteCaller的方法来执行http请求,我们不希望因为某个后端的调用失败导致整个页面数据获取失败,因此我们使用 `onErrorResumeNext()` 来中断错误,然后返回一个http请求调用失败的 error.然后 `Presenter`通过`ItemsLoader` subscribe页面的 observable.

Dependency Injection
You might have already noticed that almost all components described so far takes other components as constructor parameter. This is by design. Now, we use Dagger (I used Dagger1) to compose such element as needed:

## 依赖注入

你可能注意到了,到目前为止几乎所有的组件都接受其他组件作为构造方法. 这是设计好的,现在我们使用 `Dagger`(我使用的 `Dagger1`) 来组合我们需要的元素:
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

As you see, we can use Dagger to configure our Router and ItemsLoader. For the SearchPresenter we configure an ItemsLoader and Router in SearchModule. The advantage is that if we one day would like to add another “source”, like reddit, to display items from reddit, the only thing we have to do is to define a RedditService (Retrofit), a RedditCallerFactoy and add this CallerFactory to the Router. We can do that in the concrete dagger module without having to touch another already existing component’s source code (Open-Closed principle). In other words: we have built a “plugin system” configureable through dependency injection.

You might have noticed the SourceDao class in the code shown above. We will talk about that in the second part of this blog series when we are going “truly reactive”.

正如你所见, 我们可以使用 `Dagger`来配置 `Router` 和 `ItemsLoader`. 我们给 `SearchModule`的`SearchPresenter`  配置一个 `ItemsLoader`和`Router`. 优势就是,如果有一天我们想要添加另一个“源”,如reddit,我们唯一要做的就是定义一个`RedditService`(Retrofit), `RedditCallerFactoy`并在`Router`中添加这个`CallerFactory`。我们可以在一个具体的 dagger module中,而不用修改其他类(开闭原则)。换句话说:我们已经通过依赖注入建立了一个可配置“插件系统”。
您可能已经注意到SourceDao类在上面所示的代码。我们将讨论在这个博客系列的第二部分中,当我们“真正的响应式”。

Conclusion of Part 1
This is the first part of a series of blog post. In this first part we have built the fundament by applying Model-View-Presenter and have refactored the way how the app loads data from the backend endpoints. The main idea is to cut this huge and complex task down into several smaller and reusable components like ItemsLoader, Page, Router and RouteCaller which follows more the SOLID principle as Nick Butcher’s DataManager implementation.

As always, there are better ways to implement such an app. Especially, the ItemsLoader can be done entirely different. My first intention was to create an unlimited Observable for load older pages by using RxJava’s switchOnNext() or merge operators as described by Matthias Käppler, but I came to the conclusion that some things regarding UI and error handling are slightly easier to implement if I can split the single observable into two observables (one for first page, one for older page).

As always, feedback and suggestions are very welcome!

In the next (second) part of this series of blog posts about refactoring the Plaid app we will go “truly reactive” by using the real power of RxJava. Stay tuned.


## 第一部分总结
这是这个系列博客的第一篇.这篇文章中我们使用的MVP模式,并且重构了一下从后端加载数据的方法.主要任务就是将大的复杂的任务拆分成小的可重用的组件,如ItemsLoader, Page, Router and RouteCaller ,更加遵循 SOLID (Single responsibility, Open-closed, Liskov substitution, Interface segregation and Dependency inversion) 原则就如 DataManager 的实现.

总之,有更好的方法去实现这样一个app. 特别是 `ItemsLoader` 可以以完全不同的方式实现,我首先想到的是使用`RxJava`的 `SwitchOnNext()`或者 `merge`操作符去创建一个Observable去加载下一页数据. 但是,关于UI和错误处理,如果我可以单一观测分割成两个可见(first Page,older Page )会更容易实现

总之,欢迎提建议或反馈!
在第二部分, 我将使用`RxJava` 去重构Plaid 来实现一个 "真正reactive"的app.
