尝试结合 Mosby 和 Flow 代替 Fragment
---

> * 原文链接 : [LET MOSBY FLOW - AN ALTERNATIVE TO FRAGMENTS](http://hannesdorfmann.com/android/let-mosby-flow)
* 原文作者 : [Hannes Dorfmann](http://hannesdorfmann.com)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 



在 Android App 开发中，对 Fragment 的使用一直很有争议，有些人觉得它很好用，有的人则不然。这篇博文我会介绍怎么使用 Mosby 3.0 创建 MVP 模式的基本视图，以及怎么使用 Square 的 Flow 库替代 Fragment。

前言：我在开发 App 时也经常用到 Fragment，99% 的情况下它都不会出现什么问题。当然，我也理解那些尽可能不使用 Fragment 的开发者。毕竟生活不易，每一个程序猿都希望自己能尽可能开发出自己能开发出最完美的应用，即便 Fragment 只有 1% 的可能会出现问题，但 Fragment 一旦出现问题，就会让人头疼无比。

这篇博文我会教大家在不使用 Fragment 而是使用 Mosby 和 Flow 组合开发一个应用，应用只有两个部分：一个国家列表以及对应国家的详细信息。Demo 如下：

[video](https://youtu.be/lNG1odHSNXg)

##Flow for navigation

App 只有一个 Activity，但 Activity 里有两个视图：

- CountriesListLayout: 显示国家列表，用户点击列表某一项后会进入显示国家详细信息的视图。
-  CountryDetailsLayout: 显示国家对应的详细信息，例如：人口，货币比，以及一些照片。

##Dispatcher and Keys

将 Flow 整合到 Activity 中的办法：

```java
class MainActivity : AppCompatActivity() {

  override fun attachBaseContext(baseContext: Context) {
    val flowContextWrapper = Flow.configure(baseContext, this)
        .dispatcher(AtlasAppDispatcher(this))
        .defaultKey(CountriesScreen())
        .keyParceler(AtlasAppKeyParceler())
        .install()
    super.attachBaseContext(flowContextWrapper)
  }

  override fun onBackPressed() {
    if (!Flow.get(this).goBack()) {
      super.onBackPressed();
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      setContentView(R.layout.activity_main)
  }
}
```

重载 onBackPressed() 方法可以让 Android 虚拟键盘的后退键触发后退操作。

为了完整性，R.layout.activity_main 就是一个 FrameLayout 的容器。

```java
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    />
```

接下来我们会关注如何配置 Flow，为了在 Activity 中安装 Flow，我们必须重载 attachBaseContext() 方法。为什么呢？因为 Flow 会创建 ContextWrapper，而我们必须使用由 Flow 通过调用 super.attachBaseContext(flowContextWrapper) 返回的特定的 ContextWrapper。

Flow 是高度可定制的库，但也意味着你必须写很多模板代码。为了让 Flow 完成视图导航的功能，我们需要定义一个 Dispatcher 类，它将负责调度 Flow 导航栈中的导航任务。

```java
class AtlasAppDispatcher(private val activity: Activity) : Dispatcher {

  override fun dispatch(traversal: Traversal, callback: TraversalCallback) {
    val destination = traversal.destination.top<Any>() // destination key

    val layoutRes = when (destination) {
      is CountriesScreen -> R.layout.screen_countries
      is CountryDetailsScreen -> R.layout.screen_countrydetails
      else -> throw IllegalStateException("Unknown screen $destination")
    }

    val newView = LayoutInflater.from(traversal.createContext(destination, activity))
        .inflate(layoutRes, container, false)

    // Update container: remove oldView, insert newView
    val container = activity.findViewById(R.id.container) as ViewGroup

    // Remove current screen from container
    if (traversal.origin != null && container.childCount > 0) {
      val currentScreen = container.getChildAt(0);
      // Save the state manually
      traversal.getState((traversal.origin as History).top()).save(currentScreen)
      container.removeAllViews() // remove oldView
    }

    // Restore state before adding view (i.e. caused by onBackPressed)
    traversal.getState(traversal.destination.top()).restore(newView)

    // add new screen
    container.addView(newView)

    callback.onTraversalCompleted() // Tell Flow that we are done
  }
}
```

现在来聊一聊上面的代码的关键点吧：首先你得实现 Flow 中 Dispatcher 接口中定义的方法 dispatch()，我们通过 Flow 切换视图时就会调用该方法，因此我们必须准确地指定视图切换时 View 将发生的改变。在本例中，Atlas 应用有一个 FrameLayout 容器，只要我们从一个视图切换到另一个视图时（或返回上一个视图），我们只是将容器中显示的当前视图移除，并添加新视图。Flow 提供 Traversal 对象，该对象包含所有应用到视图导航栈中的信息，Flow 提供 traversal.destination.top() 方法通过键得到对应的视图，所以你需要为此作一个键值匹配：

```java
val layoutRes = when (destination) {
  is CountriesScreen -> R.layout.screen_countries
  is CountryDetailsScreen -> R.layout.screen_countrydetails
  else -> throw IllegalStateException("Unknown screen $destination")
}
```

你可能会问，什么是键？基本上，任何 Java 对象都可以用作 Flow 中视图对应的键，而且用 Screen 来命名键似乎效果不错。在 Atlas App 中我们有两个视图，因此我们需要两个键：CountriesScreen 和 CountryDetailsScreen。键对象有两个职责：

1. 与目标视图作键值对匹配
2. 键包含所有视图需要的数据，可以把它理解为 Fragment 对象。例如，CountryDetailsScreen 包含用于加载数据的国家 id

```java
class CountryDetailsScreen(val countryId: Int) : Parcelable {

  private constructor(p: Parcel) : this(p.readInt())

  override fun writeToParcel(parcel: Parcel, p1: Int) {
    parcel.writeInt(countryId)
  }

  override fun describeContents(): Int = 0

  companion object {
    val CREATOR = object : Parcelable.Creator<CountryDetailsScreen> {
      override fun createFromParcel(p: Parcel): CountryDetailsScreen = CountryDetailsScreen(p)

      override fun newArray(size: Int): Array<out CountryDetailsScreen>? = Array(size,
          { CountryDetailsScreen(-1) })
    }
  }
}
```

我猜你接下来会问：为什么我们要实现序列化接口？因为很多东西都能作为键去匹配视图，然而（在进程被杀时，例如：Activity 在后台被销毁） Flow 必须在 Bundle 中持久地存储键（以序列化的形式），才能在 Activity 被恢复时显示之前的数据。因此，我们必须为 Flow 提供 KeyParceler，用于将键序列化。最简单的办法就是把键变成序列化：

```java
class AtlasAppKeyParceler : KeyParceler {
  override fun toParcelable(key: Any?): Parcelable = key as Parcelable
  override fun toKey(parcelable: Parcelable) : Any = parcelable
}
```

值得一提的是：Kotlin 中 Any 类型和 java.lang.Object 是一样的。

```java
class MainActivity : AppCompatActivity() {

  override fun attachBaseContext(baseContext: Context) {
    val newBase = Flow.configure(baseContext, this)
        .dispatcher(AtlasAppDispatcher(this))
        .defaultKey(CountriesScreen())
        .keyParceler(AtlasAppKeyParceler())
        .install()
    super.attachBaseContext(newBase)
  }
  ...
}
```

通过 .defaultKey(CountriesScreen()) 能够指定启动键/视图。

```java
class CountriesScreen : Parcelable // Doesn't have any data, it's just an empty object
```

##MVP with Mosby

所以现在我们讲解了如何用 Flow 实现视图导航栈，接下来就需要讲解如何不通过 Fragment 显示我们的 UI 了。下面我们会用一个简单的自定义 View，它继承于 ViewGroup（例如：FrameLayout），以及一些解耦的概念，这部分也是 Mosby 发挥作用的地方。

Mosby 是 Android 的一个 MVP 架构库，在 Atlas App 中我们将使用 Mosby 3.0，虽说在写这篇博文时 3.0 版本还没有发布，但 3.0.0 的快照已经能看到了，而 API 一般都是稳定的，所以是可以使用的。

###视图方向改变
Mosby 的一大特性是：Presenter 能够在设备重力方向发生改变后不被销毁，此外，Mosby 还提供连接 Presenter 和 View 的对象 - ViewState。一般来说，在 MVP 架构中，与 View 交互的都是 Presenter，因此在加载数据时，需要显示进度条的行为由 Presenter 告知 View，当数据加载完成，又通知 View 调用 RecyclerView view.showContent() 显示数据。Mosby 的 ViewState 有点像 View 和 Presenter 间某种形式的钩子，追踪 Presenter 被 View 调用的所有方法。视图发生重力方向改变后，我们能利用 ViewState 作出相应的改变，并调用 View 的方法返回到改变前的状态。

如果你之前用过 Mosby 2.0，那下面没啥新鲜的东西。Mosby 的特性 Activity 和 Fragment 一直都可以用，但 ViewGroup 的子类只在 Mosby 3.0 以上的版本能够使用这些特性。

不妨看看具体的代码：

```java
class CountriesListLayout(c: Context, atts: AttributeSet) : CountriesView, MvpViewStateFrameLayout<CountriesView, CountriesPresenter>(
    c, atts) {

  private val recyclerView: RecyclerView by bindView(R.id.recyclerView)
  private val swipeRefreshLayout: SwipeRefreshLayout by bindView(R.id.swipeRefreshLayout)
  private val errorView: View by bindView(R.id.errorView)
  private val loadingView: View by bindView(R.id.loadingView)

  private val adapter = CountriesAdapter(
      { // OnClickListener, navigates to details screen
        country ->
        Flow.get(this).set(CountryDetailsScreen(country.id))
      })

  init {
    // inflates the layout containing a SwipeRefreshLayout, RecyclerView, ProgressBar etc.
    LayoutInflater.from(context).inflate(R.layout.recycler_swiperefresh_view, this, true)

    recyclerView.adapter = adapter
    recyclerView.layoutManager = LinearLayoutManager(context)

    errorView.setOnClickListener {
      loadData(false)
    }

    swipeRefreshLayout.setOnRefreshListener {
      loadData(true)
    }
  }

  fun loadData(pullToRefresh: Boolean) = presenter.loadCountries(pullToRefresh)

  override fun createPresenter(): CountriesPresenter =
    AtlasApplication.getComponent(context).countriesPresenter() // We use dagger 2

  override fun createViewState(): ViewState<CountriesView> = RetainingLceViewState<List<Country>, CountriesView>()

  override fun showLoading(pullToRefresh: Boolean) {
      loadingView.visibility = VISIBLE
      errorView.visibility = GONE
      swipeRefreshLayout.visibility = GONE
  }

  override fun showContent() {
    loadingView.visibility = GONE
    errorView.visibility = GONE
    swipeRefreshLayout.visibility = VISIBILE
    swipeRefreshLayout.isRefreshing = false
  }

  override fun showError(e: Throwable?, pullToRefresh: Boolean) {
    swipeRefreshLayout.visibility = GONE
    loadingView.visibility = GONE
    errorView.visibility = VISIBLE
    swipeRefreshLayout.isRefreshing = false
  }

  override fun setData(data: List<Country>) {
    adapter.items = data
    adapter.notifyDataSetChanged()
  }
}
```

更多细节可以在 Mosby 的文档中了解，就像你注意到的，我们创建了 MvpViewStateFrameLayout 的子类，在自定义 ViewGroup 中实现 ViewGroupViewStateDelegateCallback 的接口方法。听起来有点麻烦，其实很简单的，你可以看看 MvpViewStateFrameLayouts 的源码：

```java
public abstract class MvpViewStateFrameLayout<V, P>
    extends FrameLayout implements ViewGroupViewStateDelegateCallback<V, P> {

  private ViewGroupMvpDelegate mvpDelegate = new ViewGroupMvpViewStateDelegateImpl<V, P>(this);

  @Override protected void onAttachedToWindow() {
      super.onAttachedToWindow();
      mvpDelegate.onAttachedToWindow();
  }

  @Override protected void onDetachedFromWindow() {
      super.onDetachedFromWindow();
      mvpDelegate.onDetachedFromWindow();
  }

  // Implement in subclass
  abstract ViewState<V> createViewState();
  abstract P createPresenter();

}
```
CountriesPresenter 将从 Atlas 中加载数据列表：

```java
class CountriesPresenter @Inject constructor(val atlas: Atlas) : MvpBasePresenter<CountriesView>() {

  var subscription: Subscription? = null

  fun loadCountries(pullToRefresh: Boolean) {
    view?.showLoading(pullToRefresh)
    subscription = atlas.getCountries()
        .subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(
            { view?.setData(it) },
            { view?.showError(it, pullToRefresh) },
            { view?.showContent() }
        )
  }

  override fun detachView(retainInstance: Boolean) {
    super.detachView(retainInstance)
    if (!retainInstance) {
      subscription?.unsubscribe()
    }
  }
}
```

当重力方向改变，View 就会与 Presenter 绑定/解绑。Mosby 能够准确判断用户是否切换到别的视图，使得 Presenter 会永久被销毁。

##Summary

这篇博文的目的是证明我们能够组合使用 Mosby 和 Flow，不使用 Fragment 开发一个 App，此外，它们还能处理进程被杀死（Activity 在后台被销毁），然而，Mosby 需要让 ViewState 序列化（意味着已加载的数据，例如国家列表，必须实现 Parcelable 接口）。而大部分程序员可能懒的去弄这个，所以……

使用 Flow 可能要多写很多代码（特别是 Dispatcher），但 Flow 真的很好用，Flow 还有很多很赞的特性我没有在这里展开。你需要知道的是，Flow 不适合给 Android 开发初学者使用，但 Flow 真的很棒！

Pancakes 是功能和 Flow 类似，但更轻量的库，如果你要使用它的话，代码会变成这样：

```java
class CountriesListLayoutFactory implements ViewFactory {
    @Override
    public View createView(Context context, ViewGroup container) {
        return LayoutInflater.from(context).inflate(R.layout.screen_countries, container, false);
    }
}
```
