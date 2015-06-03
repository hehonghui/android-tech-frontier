# Ted Mosby - 软件架构

* 作者：Hannes Dorfmann
* 原文链接 : [http://hannesdorfmann.com/android/mosby/]
(http://hannesdorfmann.com/android/mosby/)
* 文章出自 : [Android开发技术前线](https://github.com/bboyfeiyu/android-tech-frontier)
* 译者 : [Mr.Simple](https://github.com/bboyfeiyu)

我给这篇关于Android库的博客起的名字灵感来源于《老爸老妈浪漫史》中的建筑设计师Ted Mosby。这个Mosby库可以帮助大家在Android上通过Model-View-Presenter模式做出一个完善稳健、可重复使用的软件，还可以借助ViewState轻松实现屏幕翻转。

## Model-View-Presenter (MVP)

**MVP**模式是一个把view从低层模型分离出来的一种现代模式。**MVP**由model–view–controller (MVC)软件模式衍生而来，常用于构建UI

* **MVP**中的**M**（model）代表的是将会显示在view（UI）中的数据。
* **MVP**中的**V**（view）是显示数据（model）并且将用户指令（events）传送到presenter以便作用于那些数据的一个接口。View通常含有Presenter的引用。
* **MVP**中的**P**（presenter）扮演的是“中间人”的作用（就如MVC中的controller），且presenter同时引用view和model。值得注意的是，“Model”这个词并不正确。严格意义上来说，它指的应该是检索或控制一个Model的业务逻辑层。举个例子，比如你的数据库里面包含了User，而你的View想要显示一个User列表，那么Presenter会引用数据库中的业务逻辑层（比如DAO）从而查询到一个User列表。如图1-1.
 ![](http://hannesdorfmann.com/images/mosby/mvp-overview.png)

从数据库中查询或显示User列表的具体流程如图1-2：
![](http://hannesdorfmann.com/images/mosby/mvp-workflow.png)

以上工作流程图应该能够说明问题了。但是，还有以下几点值得注意的地方：

* **Presenter**不是一个**OnClickListener**。**View**主要是负责处理用户输入并调用presenter相应的方法。那么问题来了，为什么不把**Presenter** 直接做成一个**OnClickListener**，从而把“转发流程”给省略掉呢？大家想想，如果这样做的话，首先，**presenter**需要知道view的内部构件。举个例子，如果一个View有两个按钮，且这个view在这两个按钮上都把**Presenter** 注册成**OnClickListener**的话，那么发生点击事件时Presenter （在不知道view中按钮引用等内部构件的情况下）怎么能够区分出是哪一个按钮被点击了呢？Model，View和Presenter三者应解耦。其次，如果让Presenter 执行OnClickListener，Presenter就被绑定到了Android平台上。理论上来说**presenter**和业务逻辑层都是纯旧式的能够与桌面应用或其他任何java应用共享的java代码。

* 大家在第1步和第2步中可以看到，**View** 只执行**Presenter** 指示的操作：用户点击“load user button”（第1步）后，view并没有直接显示加载动画，而是在第2步presenter明确告诉其显示加载动画后才显示的。这一Model-View-Presenter的变体称之为MVP 被动视图。这个view可以说是要多笨有多笨。这时我们需要让presenter以一种更抽象的方式来控制view。比如，presenter在调用 **view.showLoading()** 时并不控制view的诸如动画等具体事项。所以presenter不应调用**view.startAnimation()** 等方法。

* 通过执行**MVP**被动视图，并发性以及多线程更容易处理。大家可以看到，第3步中数据库查询异步运行，并且**presenter作为Listener/Observer**，在数据准备显示时presenter收到通知。

##**Android**上的**MVP**

目前为止一切顺利。但是大家怎么样把MVP运用到自己的Android 应用上呢？第一个问题在于，我们要把MVP模式运用到什么地方？Activity上、Fragment上、还是像RelativeLayout这类的ViewGroup上？我们来看看Android平板上的Gmail应用，如图1-3：

![](http://hannesdorfmann.com/images/mosby/mvp-gmail.png)

在我看来，上图屏幕中有四个可以使用MVP的地方。我所说的“可以使用MVP的地方”是指屏幕上显示的、在逻辑上属于一个整体的UI元素。因此这些地方也可以称为是可以运用MVP的一个单独的UI单元。如图 1-4.

![](http://hannesdorfmann.com/images/mosby/mvp-gmail-candidates.png)

看起来MVP似乎很适合运用到Activity，特别是Fragment上。通常Fragment只负责显示单一的如ListView之类的内容，就像依靠**MailProvider** 来获取一系列**Mails**的**InboxPresenter** 控制下的 **InboxView**一样。但是，**MVP**不仅仅限于Fragment或Activity，它还可以运用到SearchView中显示的ViewGroup中。在我的大多数app里面我都在Fragment运用MVP模式。但是大家可以自行决定把MVP运用到什么地方，前提是view是独立的，这样这样presenter才能在不与其他Presenter冲突的情况下控制View。

##我们为什么要实现**MVP**？

我们如何在不使用MVP模式时显示Email列表到Fragment? 通常，我们需要获取并且合并本地SQL数据库和从IMAP邮件服务器获取的邮件列表，然后将邮件列表绑定到收件箱view中。那么，此时fragment的代码又会是怎么样的呢？我们需要运行两个**AsyncTasks** 并实现一个“等待机制”（等到两个任务将两者的加载数据合并到一个单独的mail列表）。我们还需要注意的是在加载时要显示加载动画（ProgressBar），之后用ListView替代。我们需要把所有的代码放到Fragment中吗？要是加载过程中出现错误怎么办？屏幕翻转怎么办？谁来负责撤销**AsyncTasks** ？这一系列的问题都可以通过MVP得到解决。让我们跟那些带有上千行大杂烩代码的activity和fragment说拜拜吧

但是，在我们深入研究如何将MVP运用到Android中之前，我们需要弄清楚的一个问题是：Activity或Fragment究竟是一个View还是一个Presenter。Activity或Fragment似乎既是**View**也是**Presenter**，因为它们都有 **onCreate()** 或**onDestroy()**之类的生命周期回调功能，并且它们负责从一个UI控件到另一个UI 控件的转换（比如在加载时显示ProgressBar，然后显示带有数据的ListView）等View操作。大家可能会觉得这里的Activity或Fragment就是一个Controller，我猜可能也是这么一个初衷。但是在经历了几年的Android应用开发之后，我得出这么一个结论：我们应该把Activity或Fragment看作是一个不太智能的View，而不是把它们看作一个Presenter。后文我会给出原因。

综上，我想给大家介绍一个在Android平台上开发基于MVP的应用的一个 **Mosby**库。
**Mosby**

大家可以在[Github](https://github.com/sockeqwe/mosby)和Maven Central上找到Mosby库。Mosby分为几个子模块，大家可以根据自己的需要选取组件。我们来回顾一下最重要的一个模块。

##核心模块 ( Core Module)

《老爸老妈浪漫史》中的建筑设计师Ted Mosby想建造一栋摩天大楼。而建造这样一栋宏伟的建筑必须打好坚实的地基。这对Android应用的开发来说是也是一样的道理。基本上，**Core Module** 分为两种类型：**MosbyActivity** 和**MosbyFragment**。这两者是所有其他activity或fragment子类的基类（相当于建筑的地基）。两者都使用我们大家所熟知的APT **（Annotation Processing Tool）**来减少一些样板式代码。**MosbyActivity** 和**MosbyFragment** 使用Butterknife进行view的注入，使用Icepick 将实例状态保存和存储到Bundle中，使用FragmentArgs注入Fragment参数。我们不需要再调用Butterknife.inject(this)等插入方法。这类代码已经包含在了MosbyActivity 和 MosbyFragment中。它是即时可用的。我们需要做的就是使用子类中相应的注解。核心模块与MVP没有关联，它只是写一个大型软件的基础。

##MVP模块( MVP Module )

Mosby库中的MVP模块使用泛型来确保类型安全。所有view的基类是**MvpView**。从根本上说这只是一个空的interface 。Presenter的基类是**MvpPresenter**：

```
public interface MvpView{}

public interface MvpPresenter<V extends MvpView>{
	public void attachView(V view);
	public void detachView(boolean retainInstance);
}
```
上文提到，我们把**Activity**和**Fragment**看做View。因此Mosby库的MVP模块提供了 属于**MvpViews** 的**MvpActivity**和**MvpFragment**作为**Activity**和**Fragment**的基类。

```
public abstract class MvpActivity<P extends MvpPresenter> extends MosbyActivity implements MvpView{

	protected P presenter;
	@Override  protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		presenter = createPresenter();
		presenter.attachView(this);
		super.onDestroy();
		presenter.detachView(false);
	}

	protected abstract PcreatePresenter();
}

public abstract class MvpFragment<P extends MvpPresenter> MosbyFragment implements MvpView{
	protected Ppresenter;

	@Override public void onViewCreated(View view,@Nullable Bundle savedInstanceState){
		super.onViewCreated(view,savedInstanceState);
		// Create the presenter if needed
		if(presenter == null){
			presenter = createPresenter();
		}
		presenter.attachView(this);
	}

	@Override public void onDestroyView(){
		super.onDestroyView();
		presenter.detachView(getRetainInstance());
	}
	
	protected abstract PcreatePresenter();
	}
}

@Override protected void onDestroy(){

```

这一理念主要是一个**MvpView** (也就是Fragment or Activity)会关联一个MvpPresenter，并且管理**MbpPresenter**的声明周期。大家从上面的代码片段可以看到，Mosby使用Activity和Fragement生命周期来实现这一目的。通常presenter是绑定在该生命周期上的。所以初始化或者清理一些东西等操作（例如撤销异步运行任务）应该在 **presenter.onAttach()**和 presenter.onDetach()上进行。我们稍后会谈到presenter如何使用setRetainInstanceState(true) “避开”Fragment中的生命周期。我相信大家也注意到了， MvpPresenter是一个interface 。MVP模块提供一个 **MvpBasePresenter**，这个**MvpBasePresenter**只持有View（是一个Fragment或Activity）的弱引用，从而避免内存泄露。因此，当**presenter**想要调用view方法时，我们需要查看**isViewAttached()** 并使用**getView()**来获取引用，以检查view是否连接到了presenter。

##Loading-Content-Error (LCE)

通常Fragment会一直重复做某一件事。它在后台加载数据，同时显示加载view（即ProgressBar），并在屏幕上显示加载的数据，或者当加载失败时显示view错误。如今，下拉刷新支持很容易实现，因为SwipeRefreshLayout是Android支持库的组成部分。为了避免重复执行这一工作流，Mosby库的**MVP**模块提供了**MvpLceView**。

```
public interface MvpLceView<M> extends MvpView{
	/**
	   * 显示一个加载中的视图
	   * loading view 必须有个id 为 R.id.loadingView的View
	   * @param pullToRefresh 如果是true,那么表示下拉刷新被触发了
	   */
	public void showLoading(boolean pullToRefresh);
	/**
	   * 显示 content view.
	   * <content view 的id必须是R.id.contentView
	   */
	public void showContent();

	/**
	   * 显示错误信息
	   * @param e The Throwable that has caused this error
	   * @param pullToRefresh true, if the exception was thrown during pull-to-refresh, otherwise
	   * false.
	   */
	public void showError(Throwable e,boolean pullToRefresh);

	/**
	   * The data that should be displayed with {@link #showContent()}
	   */
	public void setData(M data);
}
```

针对那种类型的view我们可以采用 **MvpLceActivity  implements  MvpLceView 和 MvpLceFragment  implements  MvpLceView。**两者均假设解析的xml布局包括了含有**R.id.loadingView,R.id.contentView和R.id.errorView的view**。

示例
接下来要举的例子[Github](https://github.com/sockeqwe/mosby/tree/master/sample)上也有中，我们使用CountriesAsyncLoader加载一系列的Country，并将其显示在Fragment的RecyclerView中。大家可以从这个链接 [https://db.tt/ycrCwt1L](https://db.tt/ycrCwt1L )下载。

首先我们要定义**CountriesView**这一view interface 。

```
public interface CountriesView extends MvpLceView<List<Country>>{
}
```

为什么要为View定义接口呢？
1.因为定义了这个接口之后我们可以更改view的实现。我们可以简单地把代码从一个继承自 Activity的实现转移到继承自 Fragment的实现。

2.模块性：我们可以移动独立的库项目中的整个业务逻辑层、Presenter以及View 接口，然后把这个包含了Presenter的库应用到各类app当中。下图中左侧是使用了嵌入在ViewPager中的Activity的**kicker app**，以及使用嵌入在ViewPager中的Fragment的**meinVerein app**，如图1-5。 两者采用的是同一个定义了View接口和Presenter且测试了单元的库。

![](http://hannesdorfmann.com/images/mosby/mvp-reuse.png)

由于我们可以通过执行view接口来模拟view，所以我们可以很容易地编写单元测试。还有一个更简单的方法就是在presenter中引入java接口并使用模拟presenter对象来编写单元测试。
还有一个良性副作用就是，定义了view接口之后，我们不用直接从presenter再回调activity/fragment方法。我们这样区分开来是因为在执行presenter时我们在IDE自动完成上看到的方法只是关于view接口的方法。就我个人体会来说，我觉得这个方法非常有用，特别是团队一起工作的时候。需要注意的是，除了定义一个CountriesView接口之外，我们还可以采用**MvpLceView<List<Country>>** 。但是，定义一个专门的接口可以提高代码可读性，并且将来可以灵活地定义更多其他的与View相关的方法。

Next we define our views xml layout file with the required ids:

下一步我们需要按照指定的id来定义view xml 布局文件.

```xml
<FrameLayoutxmlns:android="http://schemas.android.com/apk/res/android"
android:layout_width="match_parent"
android:layout_height="match_parent"
>

	<!-- Loading View -->
	<ProgressBar
	android:id="@+id/loadingView"
	android:layout_width="wrap_content"
	android:layout_height="wrap_content"
	android:layout_gravity="center"
	android:indeterminate="true"
	/>

	<!-- Content View -->
	<android.support.v4.widget.SwipeRefreshLayout
	android:id="@+id/contentView"
	android:layout_width="match_parent"
	android:layout_height="match_parent"
	>

	<android.support.v7.widget.RecyclerView
		android:id="@+id/recyclerView"
		android:layout_width="match_parent"
		android:layout_height="match_parent"
	/>

	</android.support.v4.widget.SwipeRefreshLayout>


	<!-- Error view -->
	<TextView
		android:id="@+id/errorView"
		android:layout_width="wrap_content"
		android:layout_height="wrap_content"
	/>

</FrameLayout>
```

CountriesPresenter控制CountriesView并运行CountriesAsyncLoader。

```java
public class CountriesPresenter extends MvpBasePresenter<CountriesView>{

	@Override 
	public void loadCountries(final boolean pullToRefresh){
		getView().showLoading(pullToRefresh);
		
		CountriesAsyncLoader countriesLoader = new CountriesAsyncLoader(
		new CountriesAsyncLoader.CountriesLoaderListener(){

		@Override public void onSuccess(List<Country> countries){

			if(isViewAttached()){
				getView().setData(countries);
				getView().showContent();
			}
		}

		@Override public void onError(Exception e){

			if(isViewAttached()){
				getView().showError(e,pullToRefresh);
			}
		}
	});

		countriesLoader.execute();
	}
}
```

实现**CountriesView**接口 的**CountriesFragment** 如下所示：

```java
public class CountriesFragment
 extends MvpLceFragment<SwipeRefreshLayout,List<Country>,CountriesView,CountriesPresenter>
 implements CountriesView,SwipeRefreshLayout.OnRefreshListener{

	@InjectView(R.id.recyclerView)RecyclerViewrecyclerView;
	CountriesAdapteradapter;

	@Override public void onViewCreated(View view,@Nullable Bundle savedInstance){
	super.onViewCreated(view,savedInstance);

		// Setup contentView == SwipeRefreshView
		contentView.setOnRefreshListener(this);

	// Setup recycler view
		adapter = new CountriesAdapter(getActivity());
		recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
		recyclerView.setAdapter(adapter);
		loadData(false);
	}

	public void loadData(boolean pullToRefresh){
		presenter.loadCountries(pullToRefresh);
	}

	@Override protected CountriesPresenter createPresenter(){
		return new SimpleCountriesPresenter();
	}

	// Just a shorthand that will be called in onCreateView()
	@Override protected int getLayoutRes(){
		return R.layout.countries_list;
	}

	@Override public void setData(List<Country> data){
		adapter.setCountries(data);
		adapter.notifyDataSetChanged();
	}

	@Override public void onRefresh(){
		loadData(true);
	}
}
```

代码数量也并不是很多嘛，对吧？这是因为基类已经执行了从加载view到content view或error view的转换。我们可能第一眼看到那一列**MvpLceFragment**类属参数会觉得灰心。但是我要解释一下：第一种类属参数代表的是content view的类型；第二种是指以fragment显示的Model；第三种是View接口;最后一种是Presenter的类型。总结起来就是：**MvpLceFragment<AndroidView, Model, View接口, Presenter>**。

大家可能还注意到的一个点就是 **getLayoutRes()**，它是**MosbyFragment**引入的用于解析xml view布局的速记法。

```java
@Override public View onCreateView(LayoutInflater inflater,ViewGroup container,Bundle savedInstanceState){
	Return  inflater.inflate(getLayoutRes(),container,false);
}
```

因此，我们不用重写**onCreateView()**，只需重写**getLayoutRes()**。一般来说，onCreateView()只能创建view而**onViewCreated()**需要被重写，以便为RecyclerView初始化Adapter等项。因此，千万不要忘记调用super.OnViewCreated()；

##ViewState模块

看到这里大家应该大概了解了如何运用Mosby库。Mosby中的ViewState模块能帮助我们在Android开发中解决一些棘手的难题：处理屏幕旋转。

问：如果把正在运行country这个例子的app并显示了一列country的设备从横屏旋转到竖屏，会出现什么情况？


答：大家到这个视频链接[https://youtu.be/9iSBGEIZmUw](https://youtu.be/9iSBGEIZmUw)中看看，结果是一个新的 CountriesFragment会被实例化，app开始显示ProgressBar（并重新加载country列表）而不再在RecyclerView中显示country列表（屏幕旋转前的状态）

Mosby引入了**ViewState**来解决这个问题。原理就是，我们跟踪presenter从关联的View中调用的方法。比如，**presenter**调用的是view.showContent()，一旦showContent()被调用，view就会意识到其状态变更为**“showing content”**，从而view把这一信息存储到一个ViewState。如果view在方向改变过程中遭到破坏，那么ViewState 就会被存储到**Activity.onSaveInstanceState(Bundle) 或 Fragment.onSaveInstanceState(Bundle)中，并在Activity.onCreate(Bundle) 或Fragment.onActivityCreated(Bundle)**中修复。

由于不是每种数据都能存储在Bundle中，所以不同的数据类型采用不同的ViewState 实现：数据类型**ArrayList<Parcelable >**采用**ArrayListLceViewState**；数据类型Parcelable 采用**Parcelable DataLceViewState**；数据类型**Serializeable**采用**SerializeableLceViewState**。如果使用的是一个可保持( Retaining )的Fragment，那么 ViewState在屏幕旋转时不会被破坏，所以也就不需要存储到Bundle中。因此，它可以存储任何类型的数据。在这种情况下，我们需要使用**RetainingFragmentLceViewState**。存储一个ViewState比较容易。由于我们的架构比较整洁，我们的View又有接口，ViewState 可以向presenter一样通过调用同样的接口方法来修复相关联的view。举个例子，MvpLceView一般有3种状态，即：显示**showContent()，showLoading()和showError()**，所以ViewState本身会调用相应的方法来修复view的状态。


那只是一些内部构件。如果大家想编写自定义的ViewState，了解以上内容就够了。ViewStates的使用非常简单。事实上，要把MvpLceFragment 迁移到MvpLceViewStateFragment ，我们只需要另外执行**createViewState()** 和 **getData()**。下面我们就在CountriesFragment中实践一下吧：

```java
public class CountriesFragment
 extends MvpLceViewStateFragment<SwipeRefreshLayout,List<Country>,CountriesView,CountriesPresenter>
 implements CountriesView,SwipeRefreshLayout.OnRefreshListener{

	@InjectView(R.id.recyclerView)RecyclerView recyclerView;
	CountriesAdapter adapter;

	@Override public LceViewState<List<Country>,CountriesView> createViewState(){
		return new RetainingFragmentLceViewState<List<Country>,CountriesView>(this);
	}

	@Override public List<Country> getData(){
		return adapter == null? null : adapter.getCountries();
	}

	// The code below is the same as before

	@Override public void onViewCreated(Viewview,@Nullable Bundle savedInstance){
	super.onViewCreated(view,savedInstance);

	// Setup contentView == SwipeRefreshView
	contentView.setOnRefreshListener(this);

	// Setup recycler view
		adapter = new CountriesAdapter(getActivity());
		recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
		recyclerView.setAdapter(adapter);
		loadData(false);
	}


	public void loadData(boolean pullToRefresh){
		presenter.loadCountries(pullToRefresh);
	}

	@Override protected CountriesPresenter createPresenter(){
		return new SimpleCountriesPresenter();
	}

	// Just a shorthand that will be called in onCreateView()
	@Override protected int getLayoutRes(){
		return R.layout.countries_list;
	}

	@Override public void setData(List<Country> data){
		adapter.setCountries(data);
		adapter.notifyDataSetChanged();
	}

	@Override public void onRefresh(){
		loadData(true);
	}
}
```

以上就是全部过程啦。我们不必更改presenter或其他代码。[这里](https://youtu.be/9iSBGEIZmUw ) 是一个关于我们的获得ViewState支持的CountriesFragment的视频。在这个视频中我们可以看到，view在方位转变之后仍然处于同样的“状态”，即，view横屏显示country列表，随后横屏显示country列表。View能横屏显示下拉刷新指示，变更为竖屏时也能显示。

##自定义ViewState

ViewState确实是一个强大且灵活的概念。看到这里我相信大家都了解了LCE (Loading-Content-Error) ViewState的易用性。下面我们就一起来编写自己的View和ViewState吧。我们的View只显示两类不同的数据对象：A和B。结果应该像这个视频 [https://youtu.be/9iSBGEIZmUw](https://youtu.be/9iSBGEIZmUw ) 中演示的这样：

大家心里肯定觉得，这也不怎么样啊！别介啊，我只是想演示一下创建自己的ViewState是一件多么容易的事。

View 接口和数据对象（model）如下所示：

```java
public class A implements Parcelable {
	String  name;

	public A(String  name){
		this.name=name;
	}

	public String  getName(){
		return name;
	}
}

public class B implements Parcelable {
	String  foo;

	public B(String  foo){
		this.foo=foo;
	}

	public String  getFoo(){
		return foo;
	}
}

public interface MyCustomView extends MvpView{

	public void showA(A a);

	public void showB(B b);
}
```

在这个简单的例子中我们没有加入业务逻辑层。因为我们假设在实际的app中如果有业务逻辑层的话会使整个生成A或B的操作变得复杂。**Presenter**如下所示：

```java
public class MyCustomPresenter extends MvpBasePresenter<MyCustomView>{
	Random random = new Random();

	public void doA(){

		A a = new A("My name is A "+random.nextInt(10));

		if(isViewAttached()){
			getView().showA(a);
		}
	}

	public void doB(){
		B b = new B("I am B "+random.nextInt(10));

		if(isViewAttached()){
			getView().showB(b);
		}
	}
}

```


我们定义了实现了MyCustomView接口的**MyCustomActivity**。

```java
public class MyCustomActivity extends MvpViewStateActivity<MyCustomPresenter>
 implements MyCustomView{

	@InjectView(R.id.textViewA) TextViewaView;
	@InjectView(R.id.textViewB) TextViewbView;

	@Override protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		setContentView(R.layout.my_custom_view);
	}

	@Override public RestoreableViewState createViewState(){
		return new MyCustomViewState();// Our ViewState implementation
	}

	// Will be called when no view state exist yet,
	// which is the case the first time MyCustomActivity starts
	@Override public void onNew ViewStateInstance(){
		presenter.doA();
	}

	@Override protected MyCustomPresenter createPresenter(){
		return new MyCustomPresenter();
	}

	@Override public void showA(A a){
		MyCustomViewState vs = ((MyCustomViewState)viewState);
		vs.setShowingA(true);
		vs.setData(a);
		aView.setText(a.getName());
		aView.setVisibility(View.VISIBLE);
		bView.setVisibility(View.GONE);
	}

	@Override public void showB(B b){
		MyCustomViewState vs=((MyCustomViewState)viewState);
		vs.setShowingA(false);
		vs.setData(b);
		bView.setText(b.getFoo());
		aView.setVisibility(View.GONE);
		bView.setVisibility(View.VISIBLE);
	}

	@OnClick(R.id.loadA)public void onLoadAClicked(){
		presenter.doA();
	}

	@OnClick(R.id.loadB)public void onLoadBClicked(){
		presenter.doB();
	}
}
```

由于我们没有LCE(Loading-Content-Error)，所以不把 **MvpLceActivity**作为基类。我们采用的是最普遍的支持 ViewState的**MvpViewStateActivity**作为基类。基本上我们的View只显示aView 或 bView。

在**onNew ViewStateInstance()**中，我们需要明确在第一个Activity运行时需要做什么，因为先前并不存在ViewState 例子用于修复。在showA(A a) 和 showB(B b)中，我们需要将显示A 或 B的信息存储到ViewState。到这一步，我们就差不多完成了，现在只差MyCustomViewState执行这一步啦：

```java
ublic class MyCustomViewState implements RestoreableViewState<MyCustomView>{

	private  final String  KEY_STATE="MyCustomViewState-flag";
	private  final String  KEY_DATA="MyCustomViewState-data";

	public boolean showingA=true;// if false, then show B
	public Parcelable  data;// Can be A or B

	@Override public void saveInstanceState(Bundle out){
		out.putBoolean (KEY_STATE,showingA);
		out.putParcelable (KEY_DATA,data);
	}

	@Override public boolean restoreInstanceState(Bundle in){
		if(in==null){
		 return false;
		}

		showingA = in.getBoolean (KEY_STATE,true);
		data = in.getParcelable (KEY_DATA);
		return true;
	}

	@Override public void apply(MyCustomView view,boolean retained){

		if(showingA){
			view.showA((A)data);
		}else{
			view.showB((B)data);
		}
	}

	/**
	   * @param a true if showing a, false if showing b
	   */
	public void setShowingA(boolean a){
		this.showingA=a;
	}

	public void setData(Parcelable data){
		this.data=data;
	}
}
```

大家可以看到，我们需要把**ViewState**保存到从**Activity.onSaveInstanceState()**调用的 **saveInstanceState()**中，并且在从Activity.onCreate()调用的**restoreInstanceState()**中修复viewstate的数据。apply()方法将会从Activity中调用以修复view state。我们像presenter一样通过调用同样的View interface  方法showA() 或 showB()来实现这一操作。

大家可以看到，我们需要把ViewState保存到从**Activity.onSaveInstanceState()**调用的 **saveInstanceState()**中，并且在从Activity.onCreate()调用的**restoreInstanceState()**中修复viewstate的数据。apply()方法将会从Activity中调用以修复view state。我们像presenter一样通过调用同样的View interface  方法showA() 或 showB()来实现这一操作。

这个外部的**ViewState**把view state修复的复杂性和职责从Activity代码中剥离，并入到这个单独的类中。而编写**ViewState**类的单元测试要比Activity类的单元测试容易得多。

##怎样处理后台线程？
通常，**Presenter**会管理后台线程。Presenter如何处理后台线程取决于它所关联的Activity或者Fragment ，具体分为两种情况：

* 可保持的Fragment : 如果你调用了Fragment的setRetainInstanceState(true)那么这个Fragment在屏幕旋转时就不会被销毁。只有该Fragment的GUI会被销毁，并且在屏幕旋转时重新调用onCreateView创建视图。这就是说当屏幕旋转时Fragment所有的成员成员变量和Presenter不会发生变化。在这个示例中，我们将新的视图关联到Presenter中。因此，Presenter不需要去掉任何正在运行中的后台任务，因为Presenter已经关联了新的视图。例如:

1.竖屏情况下启动应用
2.实例化Fragment时会调用onCreate()、onCreateView()、createPresenter(), 然后通过调用presenter的attachView()函数将View关联到Presenter中。
3. 下一步我们旋转手机屏幕，从竖屏切换到横屏；
4. 此时onDestroyView() 会调用，而onDestroyView() 又会调用presenter的detachView(true)函数。我们注意到detachView有个参数为true,这是告诉presenter这个Fragment是可持有的Fragment（否则这个参数应该为false）。通过这个参数，presenter就知道它不需要取消正在运行的后台任务；
5. 应用现在是横屏状态了，在旋转时onCreateView方法会被调用，但是createPresenter()函数不会被调用，因为我们会对presenter 进行不为空的判断，当presenter为空时才调用createPresenter()函数。而Fragment的setRetainInstanceState(true)会保持这个presenter对象，因此presenter此时不会被重新创建；
6. 在调用了presenter的attachView()之后新创建的View会被重新关联到presenter中。
7. ViewState会被恢复，但是没有后台任务会被取消，因此也没有后台任务需要重新启动。


* Activity和不保持的Fragment :在这个示例中工作流非常的简单。所有的东西都会被销毁，包括presenter。因此presenter对象应该取消所有正在运行的任务。例如 :
我们采用非保持fragment在竖屏情况下启动app。

8.我们采用非保持fragment在竖屏情况下启动app。
9.Fragment被实例化之后，调用onCreate()， onCreateView()，和createPresenter()，然后通过调用**presenter.attachView()**将**view（fragment）**附着到presenter。
10.下一步我们旋转设备屏幕，从竖屏切换到横屏。
11.此时onDestroyView() 会调用，而**onDestroyView()** 又会调用**presenter**的**detachView(true)**函数。**Presenter**取消后台任务。
12. **onSaveInstanceState(Bundle)**被调用， **ViewState**被保存到Bundle中。
13. **App**现在出于横屏状态。新的Fragment被实例化并调用onCreate()，onCreateView()和 **createPresenter()**来创建一个新的presenter例子，通过调用**presenter.attachView()**将新的view附着到新的presenter
14. **ViewState**会从**Bundle**中恢复，且view的状态也会被恢复。如果ViewState是showLoading，那么**presenter**会重新启动后台线程来加载数据。
15. 以下是获得ViewState支持的Activity的生命周期图解，如图1-6：
![](http://hannesdorfmann.com/images/mosby/mvp-activity-lifecycle.png)

以下是获得ViewState支持的Fragment的生命周期图解， 如图 1-7：
![](http://hannesdorfmann.com/images/mosby/mvp-fragment-lifecycle.png)

##Retrofit模块

Mosby提供了 **LceRetrofitPresenter** 和 **LceCallback**。为获得LCE方法showLoading(), showContent() 和 showError()支持的Retrofit编写presenter ，几行代码就能搞定。

```java
public class MembersPresenter extends LceRetrofitPresenter<MembersView,List<User>>{

	private  GithubApigithubApi;

	public MembersPresenter(GithubApi githubApi){
		this.githubApi=githubApi;
	}

	public void loadSquareMembers(boolean pullToRefresh){
		githubApi.getMembers("square",new LceCallback(pullToRefresh));
	}
}
```

##Dagger模块
   想在不依靠注入式的情况下写应用？Ted Mosby告诉你，这是行不通滴！Dagger是java依赖注入式框架最常用的方法，也是Android开发者们的心头好。Mosby支持Dagger1。Mosby通过一个叫做getObjectGraph()的方法提供Injector界面。通常，我们的应用模块非常广泛。要想轻松分享这一模块，我们需要把android.app.Application归入子类，使其执行Injector。之后所有的Activity和Fragment都可以通过调用getObjectGraph()来存取ObjectGraph，因为**DaggerActivity and DaggerFragment**也都是Injector。我们也可以通过重写Activity 或 Fragment中的 getObjcetGraph() ，从而调用plus(Module)以增加模块。我个人已经用到Dagger2了，它与Mosby也兼容。大家可以在Github上找到关于Dagger1 和 Dagger2的示例。点此这个链接[https://db.tt/3fVqVdAz](https://db.tt/3fVqVdAz )Dagger1示例 apk；点此这个链接[https://db.tt/z85y4fSY]( https://db.tt/z85y4fSY )Dagger2 示例 apk。

##Rx模块
   **Observables**赞爆了！现在稍微潮一点的小伙儿们都用RxJava了好吗！你猜结果怎么着？RxJava确实是太酷了！所以，Mosby给大家提供一个本质上是Subscriber的MvpLceRxPresenter，它能帮我们自动处理**onNext()， onCompleted() 和 onError()并回调相应的LCE方法，比如showLoading(), shwoContent() **和 showError()。它还将 RxAndroid 附带到observerOn() Android主要 UI 线程。你可能觉得，要是用了RxJava的话就不再需要Model View Presenter了。呃，那只是你的一家之言。在我看来，把View和Model清晰地区分开来非常重要。而且我也认为其中的某些好用的功能在没有MVP的情况下不容易执行。最后，大家要是还想回到过去那个Activity和Fragment包含了上千条又臭又长的代码行时代，那么我祝你在面条式代码的地狱里过得愉快。好了，废话不多说，我介绍的方法不属于面条式代码是因为Observerables引入了一个结构齐整的工作流，把Activity或Fragment做成一个BLOB的想法已经近在咫尺了。
   
##测试模块
大家可能注意到这里存在着一个测试模块。这个模块用于Mosby库的内部测试。但是，它也可以为我们自己的app所用。它使用Robolectric为我们的LCE Presenter， Activities 和 Fragments提供单元测试模板。它的基本功能是查看测试中的Presenter是否正确工作：通过观察presenter时候调用showLoading()，
**showContent()** 和 **showError()**。我们还可以验证setData()中的数据。所以我们可以为Presenter和底层编写类似黑匣子的测试。Mosby的测试模块也提供了测试MvpLceFragment 或 **MvpLceActivity**的可能性。它相当于一种“精简版”的UI 测试。这些测试通过查看xml布局是否包含R.id.loadingView， R.id.contentView 和R.id.errorView之类的指定id、loadingView是否可视，在加载view时，是否是错误的view可视、content view能否处理由setData()提交的已加载数据等方面来检验Fragment或Activity是否正常工作，是否遇到crashing。它和Espresso类的UI测试并不相同。我觉得没有必要为LCE View单独写一个UI 测试。

以下是Ted Mosby库的一些测试小建议：
1. 编写传统的单元测试来测试业务逻辑层和model。
2. 使用**MvpLcePresenterTest**来测试presenter。
3.使用**MvpLceFragmentTest** 和 **MvpLceActivityTest**来测试MvpLceFragment 和 Activity。
4.如果有必要，可以使用Espresso来编写UI测试。

测试模块尚未完成。大家可以看到这个模块是测试版，因为Robolectric 3.0还没完成，而且Android gradle plugin也没用完全支持传统的单元测试。android gradle plugin 

1.2应该会好得多。Robolectric 和 androids gradle plugin可以用了之后我会再写一篇关于Mosby，Dagger，Retrofit和RxJava单元测试的博客。



















