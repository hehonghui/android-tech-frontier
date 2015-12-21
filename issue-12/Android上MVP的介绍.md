MVP在Android平台上的应用
---

> * 原文链接 : [Introduction to Model-View-Presenter on Android](http://konmik.github.io/introduction-to-model-view-presenter-on-android.html)
* 原文作者 : [konmik](http://konmik.github.io/)
* 译文出自 : [  其他  http://konmik.github.io/introduction-to-model-view-presenter-on-android.html](http://konmik.github.io/introduction-to-model-view-presenter-on-android.html)
* 译者 : [MiJack](https://github.com/MiJack)  
* 校对者: [MiJack](https://github.com/MiJack)  
* 状态 : 校对完成

=======



#Android平台上MVP的介绍



这篇文章向你介绍Android平台上的MVP模式，从一个简浅的例子开始实践之路。文章也会介绍一个一个库让你在Android平台上轻松的实现MVP



##简单吗？我怎么才能从中受益？


###什么是MVP？




- **View**层主要是用于展示数据并对用户行为做出反馈。在Android平台上，他可以对应为Activity, Fragment,View或者对话框。
- **Model**是数据访问层，往往是数据库接口或者服务器的API。
- **Presenter**层可以想View层提供来自数据访问层的数据，除此以外，他也会处理一些后台事务。


在Android平台上，MVP可以将后台事务从Activity/View/Fragment中分离出来，让它们独立于大部分生命周期事件。这样，一个应用将会变得简单， 整个应用可靠性可以提高10倍，应用的代码将会变短, 代码的可维护性提高，开发者也为此感到高兴。


###Android为什么需要MVP


####理由1：尽量简单

如果你还有读过这篇文章，请阅读它：[Kiss原则](https://people.apache.org/~fhanik/kiss.html)（Keep It Stupid Simple）


- 大部分的安卓应用只使用View-Model结构
- 程序员现在更多的是和复杂的View打交道而不是解决业务逻辑。


当你在应用中只使用Model-View时，到最后，你会发现“所有的事物都被连接到一起”。
![](http://konmik.github.io/images/mvp_everything_is_connected_with_everything.png)


如果这张图看上去还不是很复杂，那么请你想象一下以下情况：每一个View在任意一个时刻都有可能出现或者消失。不要忘记View的保存和恢复，在临时的view上挂载一个后台任务。

“所有的事物都被连接到一起”的替代品是一个万能对象(god object)。

![](http://konmik.github.io/images/mvp_a_god_object.png)


god object是十分复杂的，他的每一个部分都不能重复利用，无法轻易的测试、或者调试和重构。

###With MVP

###使用MVP

![](http://konmik.github.io/images/mvp_mvp.png)



复杂的任务被分成细小的任务，并且很容易解决。越小的东西，bug越少，越容易debug，更好测试。在MVP模式下的View层将会变得简单，所以即便是他请求数据的时候也不需要回调函数。View逻辑变成十分直接。


理由2：后台任务


当你编写一个Actviity、Fragment、自定义View的时候，你会把所有的和后台任务相关的方法写在一个静态类或者外部类中。这样，你的Task不再和Activity联系在一起，这既不会导致内存泄露，也不依赖于Activity的重建。


这里有若干种方法处理后台任务，但是它们的可靠性都不及MVP。


###为什么它是可行的？


这里有一张表格，用于展示在configuration改变、Activity 重启、Out-Of-Memory时，不同的应用部分会发生什么？

 
|    |    情景 1     |     情景 2     |    情景 3|
|:-------------:|:-------------:|:-------------:|:-------------:|
||配置改变| Activity 重启|  进程重启|
 |对话框                   |     重置     |    重置     |    重置|
|Activity, View, Fragment  | 保存/恢复  | 保存/恢复 | 保存/恢复|
| Fragment with setRetainInstance(true)  |无变化 | 保存/恢复 | 保存/恢复|
| Static variables and threads  |  无变化 |  无变化  |    重置|



情景 1: 当用户切换屏幕、更改语言设置或者链接外部的模拟器时，往往意味着设置改变。 相关更多请阅读[这里](http://developer.android.com/reference/android/R.attr.html#configChanges)。

情景 2:Activity的重启发生在当用户在开发者选项中选中了“Don't keep activities”（“中文下为 不保留活动”）的复选框，然后另一个Activity在最顶上的时候。

情景 3: 进程的重启发生在应用运行在后台，但是这个时候内存不够的情况下。



###总结


现在你可以发现，一个setRetainInstance(true)的Fragment也不奏效，我们还是希望这样的Fragment在所有的情景下为保存/恢复的状态模式，所以为简化问题，我们暂不考虑上述情况的Fragment。[Occam's razor](http://en.wikipedia.org/wiki/Occam's_razor)



|       |配置改变,   Activity重启  |  进程重启|
|:-------------:|:-------------:|:-------------:|
 |Activity, View, Fragment, DialogFragment | 保存/恢复  |保存/恢复  |
|Static variables and threads             |   无变化   |   重置|



现在，看上去更舒服了，我们只需要写两段代码为了恢复应用：

* 保存/恢复 for Activity, View, Fragment, DialogFragment;

* 重启后台请求由于进程重启


第一个部分,用Android的API可以实现。第二个部分，就是Presenter的作用了。Presenter只会记住有哪些请求需要执行，当进程在执行过程中重启时，Presenter将会再次执行它们。


#####一个简单的例子(no MVP)

这个例子用于从远程服务器加载数据并呈现，当发生异常时，会通过Toast提示。

我推荐使用[RxJava](https://github.com/ReactiveX/RxJava)构建Presenter，因为这个库更容易控制数据流。

我想对创造如此简单的API的伙计说声谢谢，我把它用于[The Internet Chuck Norris Database](http://www.icndb.com/)

无MVP的[例子00](https://github.com/konmik/MVPExamples/tree/master/example00)：

```java

public class MainActivity extends Activity {
    public static final String DEFAULT_NAME = "Chuck Norris";

    private ArrayAdapter<ServerAPI.Item> adapter;
    private Subscription subscription;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ListView listView = (ListView)findViewById(R.id.listView);
        listView.setAdapter(adapter = new ArrayAdapter<>(this, R.layout.item));
        requestItems(DEFAULT_NAME);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unsubscribe();
    }

    public void requestItems(String name) {
        unsubscribe();
        subscription = App.getServerAPI()
            .getItems(name.split("\\s+")[0], name.split("\\s+")[1])
            .delay(1, TimeUnit.SECONDS)
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Action1<ServerAPI.Response>() {
                @Override
                public void call(ServerAPI.Response response) {
                    onItemsNext(response.items);
                }
            }, new Action1<Throwable>() {
                @Override
                public void call(Throwable error) {
                    onItemsError(error);
                }
            });
    }

    public void onItemsNext(ServerAPI.Item[] items) {
        adapter.clear();
        adapter.addAll(items);
    }

    public void onItemsError(Throwable throwable) {
        Toast.makeText(this, throwable.getMessage(), Toast.LENGTH_LONG).show();
    }

    private void unsubscribe() {
        if (subscription != null) {
            subscription.unsubscribe();
            subscription = null;
        }
    }
}

```

有经验的开发者会注意到这个例子有以下不妥：


当用户翻转屏幕时候会开始请求，应用发起了过多的请求，将会是屏幕在切换的时候呈现空白的界面。

当用户频繁的切换屏幕，这将会造成内存泄露，请求运行时，每一个回调将会持有MainActivity的引用，让其保存在内存中。因此引起的OOM和应用反应迟缓，会引发应用的Crash。


MVP模式下的[例子 01](https://github.com/konmik/MVPExamples/tree/master/example01)

```java
public class MainPresenter {

    public static final String DEFAULT_NAME = "Chuck Norris";

    private ServerAPI.Item[] items;
    private Throwable error;

    private MainActivity view;

    public MainPresenter() {
        App.getServerAPI()
            .getItems(DEFAULT_NAME.split("\\s+")[0], DEFAULT_NAME.split("\\s+")[1])
            .delay(1, TimeUnit.SECONDS)
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(new Action1<ServerAPI.Response>() {
                @Override
                public void call(ServerAPI.Response response) {
                    items = response.items;
                    publish();
                }
            }, new Action1<Throwable>() {
                @Override
                public void call(Throwable throwable) {
                    error = throwable;
                    publish();
                }
            });
    }

    public void onTakeView(MainActivity view) {
        this.view = view;
        publish();
    }

    private void publish() {
        if (view != null) {
            if (items != null)
                view.onItemsNext(items);
            else if (error != null)
                view.onItemsError(error);
        }
    }
}

```

从严格意义上来说，MainPresenter有三个事件处理线程： *onNext*, *onError*, *onTakeView*。他们在`publish()`方法中被回调，*onNext* 或 *onError*的值将会在由onTakeView方法传入的View实例,也就是MainActivity中来发布。 	 


```java
public class MainActivity extends Activity {

    private ArrayAdapter<ServerAPI.Item> adapter;

    private static MainPresenter presenter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ListView listView = (ListView)findViewById(R.id.listView);
        listView.setAdapter(adapter = new ArrayAdapter<>(this, R.layout.item));

        if (presenter == null)
            presenter = new MainPresenter();
        presenter.onTakeView(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        presenter.onTakeView(null);
        if (isFinishing())
            presenter = null;
    }

    public void onItemsNext(ServerAPI.Item[] items) {
        adapter.clear();
        adapter.addAll(items);
    }

    public void onItemsError(Throwable throwable) {
        Toast.makeText(this, throwable.getMessage(), Toast.LENGTH_LONG).show();
    }
}
```

MainActivty构建了MainPresenter，将其维持在onCreate/onDestroy周期外，MainActivity持有MainPresenter的静态引用，所以每一个进程由于OOM重启时，MainActivity可以确认Presenter是否仍然存在，必要时创建。

当然，确认和使用静态变量可能是代码变得臃肿，稍后我们会告诉你如何好看些：。:)

####重要思路：

* 示例程序不会在每次切换屏幕的时候都开始一个新的请求
* 当进程重启时，示例程序将会重新加载数据。
* 当MainActivity销毁时，MainPresenter不会持有MainActivity的引用，因此不会在切换屏幕的时候发生内存泄漏，而且没必要去unsubscribe请求。

###[Nucleus](https://github.com/konmik/nucleus)

Nucleus是我从[Mortar](https://github.com/square/mortar)和 Keep It Stupid Simple 这篇文章得到的灵感而建立的库。

它有以下特征：

* 它支持在View/Fragment/Activity的Bundle中保存/恢复Presenter的状态，一个Presenter可以保存它的请求参数到bundles中，以便之后重启它们
 
* 只需要一行代码，它就可以直接将请求结果和错误反馈给View，所以你不需要写`!= null`之类的非空判断语句。
 
* 它允许一个view实例可以持有多个Presenter。不过你不能在用[Dagger](http://square.github.io/dagger/)实例化的presenter中这样使用(传统方法).

* 它可以用一行代码快速的将View和Presenter绑定。

* 它提供一些现成的基类，例如: `NucleusView`, `NucleusFragment`, `NucleusSupportFragment`, `NucleusActivity`. 你可以将他们的代码拷贝出来改造出一个自己的类以利用Nucleus的presenter。

* 支持在进程重启后，自动重新发起请求，在`onDestroy`方法中，自动的退订RxJava的订阅。

* 最后，它简洁明了，每一个开发者都会理解，以上这些只用了180行代码来驱动Presenter这个类,加上230行RxJava的依赖。


使用了[Nucleus](https://github.com/konmik/nucleus) 的[例 02](https://github.com/konmik/MVPExamples/tree/master/example02)

```java
public class MainPresenter extends RxPresenter<MainActivity> {

    public static final String DEFAULT_NAME = "Chuck Norris";

    @Override
    protected void onCreate(Bundle savedState) {
        super.onCreate(savedState);

        App.getServerAPI()
            .getItems(DEFAULT_NAME.split("\\s+")[0], DEFAULT_NAME.split("\\s+")[1])
            .delay(1, TimeUnit.SECONDS)
            .observeOn(AndroidSchedulers.mainThread())
            .compose(this.<ServerAPI.Response>deliverLatestCache())
            .subscribe(new Action1<ServerAPI.Response>() {
                @Override
                public void call(ServerAPI.Response response) {
                    getView().onItemsNext(response.items);
                }
            }, new Action1<Throwable>() {
                @Override
                public void call(Throwable throwable) {
                    getView().onItemsError(throwable);
                }
            });
    }
}

@RequiresPresenter(MainPresenter.class)
public class MainActivity extends NucleusActivity<MainPresenter> {

    private ArrayAdapter<ServerAPI.Item> adapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ListView listView = (ListView)findViewById(R.id.listView);
        listView.setAdapter(adapter = new ArrayAdapter<>(this, R.layout.item));
    }

    public void onItemsNext(ServerAPI.Item[] items) {
        adapter.clear();
        adapter.addAll(items);
    }

    public void onItemsError(Throwable throwable) {
        Toast.makeText(this, throwable.getMessage(), Toast.LENGTH_LONG).show();
    }
}
```

正如你看到的，跟上一个代码相比，这个例子十分简洁。Nucleus 可以构造/销毁/保存 Presenter, 绑定/解绑 View ，并且自动向已经绑定的view发送请求的结果。

`MainPresenter`的代码比较短，因为它使用`deliverLatestCache（）`的操作，延迟了由一个数据源发出所有的数据和错误，直到View可用。它还把数据缓存在内存中，以便它可以在Configuration change时可以被重用。

`MainActivity`的代码比较短，因为主Presenter的创作由`NucleusActivity`管理。当你需要绑定一个Presenter的时候，只需要添加注解`@RequiresPresenter（MainPresenter.class）`。

警告！注释！在Android中，如果你使用注解，这是最好检查以下这么做会不会降低性能。以我使用的'Galaxy S`（2010年设备）为例，处理此批注耗时不超过0.3毫秒。只在实例化view的时候才会发生，因此注解在这里对性能的影响可以忽略。


####更多例子


一个扩展的例子,带有请求参数的Presenter：[Nucleus Example](https://github.com/konmik/nucleus/tree/master/nucleus-example)。


带有单元测试的例子： [Nucleus Example With Tests](https://github.com/konmik/nucleus/tree/master/nucleus-example-with-tests)

####`deliverLatestCache()` 方法

这个RxPresenter的工具方法有三个变种：

* `deliver()` will just delay all onNext, onError and onComplete emissions until a View becomes available. Use it for cases when you're doing a one-time request, like logging in to a web service. [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onCreate(android.os.Bundle))

* `deliver()`只是推迟onNext、onError、onComplete的调用，直到视图有效。使用它，你只需要一次请求，就像发起登陆web服务一样。[Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onCreate(android.os.Bundle))

* `deliverLatest（）`当有新的的onNext值，将会舍弃原有的值，如果你有可更新的数据源，这将让你去除那些不需要的数据。[Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/RxPresenter.html#deliverLatest)

* `deliverLatestCache（）`，和`deliverLatest（）`一样，但除了它会在内存中保存最新的结果外，当View的另一个实例可用（例如：在配置更改的时候）时，还是会触发一次。如果你不想组织请求在你的View中的保存/恢复事务（比方说，结果太大或者不能很容易地保存在Bundle中），这个方法可以让用户体验更好。[Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/RxPresenter.html#deliverLatestCache)

####Presenter的生命周期

相比Android组件，Presenter的生命周期更加简短。

* `void onCreate(Bundle savedState)` - 每一个Presenter构造时 .  [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onCreate(android.os.Bundle))

* `void onDestroy()` - 用户离开View时调用 . [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onDestroy())

* `void onSave(Bundle state)` - 在View的`onSaveInstanceState`方法中调用，用于持有Presenter的状态.  [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onSave(android.os.Bundle))

* `void onTakeView(ViewType view)` - 在Activity或者Fragment的`onResume()`方法中或者`android.view.View#onAttachedToWindow()`调用.  [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onTakeView(ViewType))

* `void onTakeView(ViewType view)` - 在Activity或者Fragment的`onResume()`方法中或者`android.view.View#onAttachedToWindow()`调用.  [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onTakeView(ViewType))

* `void onDropView()` -  在Activity或者Fragment的`onPause()`方法中或者`android.view.View#onDetachedFromWindow()`调用. [Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onDropView)

####View的回收与View栈

通常来说,你的view（比如fragment或者自定义的view）在用户的交互过程中挂载与解挂（attached and detached）都是随机发生的。 这倒是不让presenter在view每次解挂（detached）的时候都销毁的一个启发。你可以在任何时候挂载与解挂view，但是presenter可以在这些行为中幸存下来，继续后台的工作。



这里还存在着一个关于View回收的问题：一个Fragment在Configuration change或者从stack中弹出的情况下，不知道自身有没有解挂（detached）。

默认只在Activity处于finish时，才在调用View的`onDetachedFromWindow()`/`onDestroy()` 销毁Presenter。

所以，当你在常规的Activity生命周期内，销毁View，你需要给给View一个销毁Presenter的信号。在这里，公有方法`NucleusLayout.destroyPresenter()` and `NucleusFragment.destroyPresenter()`就派上用场了。

例如，在我的项目中，下面的是我如何进行FragmentManager的`pop()`操作:

```java
    fragment = fragmentManager.findFragmentById(R.id.fragmentStackContainer);
    fragmentManager.popBackStackImmediate();
    if (fragment instanceof NucleusFragment)
        ((NucleusFragment)fragment).destroyPresenter();
```

在进行*replace*Fragment栈和对处于底部的Fragment进行*push*操作时，你可能需要进行相同的操作。

在View从Activity解挂（detached）时，您可能会选择摧毁Presenter来避免问题的发生，但是，这将意味着当View解挂（detached）时，后台任务无法继续进行。

所以这一节的 "view recycling"完全留你你自己考虑，也许有一天我会找到更好的解决办法，如果你有一个办法，请告诉我。

####最佳实践


在Presenter中保存你的请求参数。

规则很简单：Presenter的主要作用是管理请求。所以，View不应该自己处理或者重启请求。从View中，我们可以看见，后台事务不会消失，总是会返回结果或者错误，*而不是通过回调的方式*。



```java

public class MainPresenter extends RxPresenter<MainActivity> {

    private String name = DEFAULT_NAME;

    @Override
    protected void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        if (savedState != null)
            name = savedState.getString(NAME_KEY);
        ...

    @Override
    protected void onSave(@NonNull Bundle state) {
        super.onSave(state);
        state.putString(NAME_KEY, name);
    }
}
```

我推荐使用一个很棒的库[Icepick](https://github.com/frankiesardo/icepick)。在不使用运行时注解的前提下，它可以减少代码量，并简化应用程序逻辑 - 所有的事都在编译过程中已经处理好了。这个库和[ButterKnife](http://jakewharton.github.io/butterknife)搭配是个不错的选择。

 
```java
public class MainPresenter extends RxPresenter<MainActivity> {

    @Icicle String name = DEFAULT_NAME;

    @Override
    protected void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        Icepick.restoreInstanceState(this, savedState);
        ...
    }
    @Override
    protected void onSave(@NonNull Bundle state) {
        super.onSave(state);
        Icepick.saveInstanceState(this, state);
    }
}
 
```

如果你有不止一对请求参数，这个库在不使用运行时注解的前提下。您可以创建`BasePresenter`并把*Icepick*到该类中，所有的子类将会自动保存标有`@Icicle`这一注解的变量，而你将不再需要去实现`OnSave`。这也适用于保存Activity，Fragment，View的状态。


####在主线程中调用`onTakeView`进行即时查询[Javadoc](http://konmik.github.io/nucleus/nucleus/presenter/Presenter.html#onTakeView(ViewType))


有时候，你要进行少量的数据查询，如从数据库中读取少量的数据。虽然你可以很容易地用Nucleus创建一个可重启的请求，你不必到处使用这个强大的工具。如果你在fragment创建的时候初始化一个后台请求，即使只有几毫秒，用户也会看到一会儿的空白屏。因此，为了使代码更短，用户体验更好，可以使用主线程。


#### 不要让Presenter控制你的View

这不是很好的工作方式 - 由于这种不自然的方式，应用程序逻辑变得太复杂。

自然的方式是操作流由用户发起，通过View，Presenter和Model，最后流向数据。毕竟，用户将使用应用,用户是控制应用程序的源头。因此，控制应该从用户开始而不是一些应用的内部结构。


从view，到presenter到model是很直接的形式，很容易书写这样的代码。你将得到以下序列： __user -> view -> presenter -> model -> data__ 。但是，当控制流变成这样时: __user -> view -> presenter -> view -> presenter -> model -> data__，它只是违反KISS原则.



Fragments？不好意思它是违背了这种自然操作流程的。它们太复杂。这里是一个非常好讲诉Fragment的文章：[抨击Android的Fragment](http://corner.squareup.com/2014/10/advocating-against-android-fragments.html)。fragment的替代者[Flow](https://github.com/square/flow) 并没有简化多少东西。

####MVC

如果你对MVC（模型-View-控制器）-不要去使用。模型-View-控制器和MVP完全不同，不能解决接口开发者面对的问题。

####What is MVC?

####什么是MVC?





* **Model**代表着应用程序的内部状态。它可以负责存储，当然也可以不考虑。

* **View**是唯一的与MVP相同的部分 - 它用于将模型呈现在屏幕上，应用程序的一部分。

* **Controller**表示输入装置，如键盘，鼠标或操纵杆。


MVC在过去以键盘为驱动的应用中（比如游戏），是比较好的模式。没有窗口和图形用户界面的交互——应用接受输入(Controller),维持状态（Model），产生输出（View）。同样，数据和控制的关系是这样的。**controller -> model -> view**。这种模式是在Android绝对无用。



这里有一些关于MVC的困惑。人们（Web开发人员）觉得他们使用MVC，而实际上，他们使用的MVP。许多Android开发者认为Controller是用于控制View的，所以他们试图在创建View时，从视图（View）中提取视图逻辑，交由专门的控制器控制。我个人是没有看出这种架构的好处。


#### 在数据复杂的项目中使用固定的数据结构



在这方面，[AutoValue](https://github.com/google/auto/tree/master/value)是十分好的库，在它的描述中，你会发现一大堆好处，我建议你阅读它。Android平台上还有一个接口：[AutoParcel](https://github.com/frankiesardo/auto-parcel)。其主要原因是，你可以四处传递，而不用关心是否在程序的某个地方被修改了。而且他们也是线程安全的。




###总结


试试MVP吧，然后告诉你的朋友。:)
