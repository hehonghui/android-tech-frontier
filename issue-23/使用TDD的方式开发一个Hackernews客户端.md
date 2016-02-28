使用TDD的方式开发一个Hackernews客户端
---


> * 原文链接 : [MAKING A TDD-BASED HACKERNEWS CLIENT FOR ANDROID](http://www.philosophicalhacker.com/2015/07/17/making-a-tdd-based-hackernews-client-for-android/)
* 原文作者 : [K. Matthew Dupree](http://www.philosophicalhacker.com)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Anthonyeef](https://github.com/Anthonyeef) 
* 校对者: [Mr.simple](https://github.com/bboyfeiyu)  
* 状态 :  完成 

我正在运用TDD的方法去写一个 HackerNews 的 Android 客户端。这篇文章（以及后续会有的一系列文章）分享了一些我基于TDD工作流开发这个应用程序时的所用到的相关技术。本文同时也讨论了具有可测试性的 Android 程序架构从一开始构思到最后成型的过程。

##测试“可行骨架”
根据 Steve Freeman 和 Nat Pryce 在 Growing Object Oriented Software Guided by Tests 一书中的表述，开始 TDD 工作流的第一步，是“测试可行骨架”。根据他们的定义，一个“可行骨架”的意思是：
>“可行骨架”是我们能够完成自动化构建、部署，以及端到端之间测试等实际功能的最小可能实现。

>来自第69-70页

在我看来，对一个 HackerNews 客户端而言，“可行骨架”应该具有能够显示出一个 HackerNews 的故事 id 列表的功能。为了实现这个测试，我写了一个像这样的“超浓缩”测试代码：
```Java
@RunWith(AndroidJUnit4.class)
@LargeTest
public class MainActivityTests {

    @Rule
    public ActivityTestRule<MainActivity> mActivityTestRule = new ActivityTestRule<>(MainActivity.class);

    @Test
    public void loadHackerNewsPostsOnStartup() {
        onView(withId(R.id.recyclerView)).check(matches(isDisplayed()));
        onView(withText("9897306")).check(matches(isDisplayed()));
    }
}
```

##我怎么得到一致的测试数据

在我写这个测试代码的时候，有一个问题立刻就出现了：我们怎么能够确定 `MainActivity` 为每一个测试单元取回的数据都是一样，以确保代码中 9897306 这个检验数值一直都是合适的呢？你能想到的在你的 Android 对象里头被注入的那些依赖，在这个[Jake Wharton 关于 Dagger 模块的讨论](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=jake%20wharton%20dagger%20parley)里都可以找到。所以我决定使用下面的这个方法，来确保测试过程中所用到的数据能够保持一致性。

让我简要地描述一下我是怎么在我的项目里使用这个方法的。

`PhiHackerNews` 里的对象通过 `PhilHackerNewsApplication` 这个子类访问 Dagger 对象图谱。该类负责生成 ObjectGraph：
```Java
public class PhilHackerNewsApplication extends Application {

    private ObjectGraph mObjectGraph;

    public final ObjectGraph getObjectGraph() {
        if (mObjectGraph == null) {
            mObjectGraph = makeObjectGraph();
        }
        return mObjectGraph;
    }

    protected ObjectGraph makeObjectGraph() {
        return mObjectGraph = ObjectGraph.create(new PhilHackerNewsAppModule(getApplicationContext()));
    }
}
```
 
所以，当我正在运行一个测试的时候，我使用了一个自定义的测试器生成了一个 `PhilHackerNewsApplication` 的子类，通过重新定义的模块生成了 `ObjectGraph` ：
```Java
public class DaggerModuleOverridingAndroidJUnitRunner extends AndroidJUnitRunner {

    @Override
    public Application newApplication(ClassLoader cl, String className, Context context) throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        String testApplicationClassName = TestApplication.class.getCanonicalName();
        return super.newApplication(cl, testApplicationClassName, context);
    }
}
```

这个`TestApplication`的类生成的 `ObjectGraph` 对象，其中包含着的模块能够重新定义那些负责取回 HackerNews 数据的依赖：
```Java
public class TestApplication extends PhilHackerNewsApplication {
    @Override
    protected ObjectGraph makeObjectGraph() {
        return ObjectGraph.create(new PhilHackerNewsAppModule(getApplicationContext()), new TestLoaderModule());
    }
}
```

`TestLoaderModule` 模块则提供了那些被重新定义的依赖。它提供了一个 `HackerNewsRestAdapter` 可以直接从内存里载入 HackerNews 的数据，而不用重复访问服务器：
```Java
@Module(overrides = true, library = true, complete = false)
public class TestLoaderModule {
    @Provides
    HackerNewsRestAdapter provideHackerNewsRestAdapter() {
        final Gson gson = new Gson();
        return new HackerNewsRestAdapter() {
            @Override
            public List<Integer> getTopStories() {
                Type listType = new TypeToken<List<Integer>>() {
                }.getType();
                return gson.fromJson("[9897329,9899313,9899549,9897306,9899369,9899348,9898075,9897513,9898504,9897751,9897159,9896815,9896760,9896402,9898796,9898310,9897860,9896590,9896369,9896853,9897838,9897658,9898745,9896436,9898201,9896689,9898981,9898275,9895694,9896558,9896938,9897054,9895609,9898249,9895108,9898839,9895094,9899726,9899636,9899237,9896910,9899317,9895713,9895790,9897220,9895767,9894237,9899386,9897929,9897585,9895834,9899548,9895931,9899815,9898924,9893412,9895681,9897796,9895888,9894570,9895558,9898430,9899626,9894508,9894226,9896538,9898560,9899707,9894336,9899766,9896956,9899503,9899676,9898363,9896141,9896758,9893561,9895438,9899603,9895903,9891705,9897681,9893730,9897565,9899141,9899366,9899359,9898935,9898926,9899309,9898954,9894993,9899203,9895887,9894841,9898575,9898999,9899016,9897849,9896873,9892887,9892810,9890824,9896903,9898064,9897635,9897937,9896434,9897732,9897930,9898548,9896139,9891998,9897156,9883246,9896709,9898502,9889057,9898426,9898412,9894152,9882587,9895917,9896943,9897024,9897966,9898186,9891366,9894014,9898176,9897555,9892325,9894588,9897044,9896491,9895278,9896326,9897891,9893989,9894342,9897875,9896748,9896936,9892049,9896138,9894748,9896972,9879632,9889777,9897817,9893867,9893359,9896440,9894198,9893972,9897062,9892200,9895181,9895698,9896808,9892970,9895513,9892013,9897030,9892633,9891311,9894213,9896050,9892515,9896822,9889598,9892333,9880694,9884074,9884616,9896796,9890980,9893903,9895759,9895861,9890850,9890188,9896514,9896762,9896921,9895507,9892340,9878160,9895311,9896495,9896839,9891695,9891927,9890476,9894647,9896858,9896854,9895590,9895116,9895730,9891509,9896119,9895778,9894457,9895602,9891856,9887548,9894301,9891115,9891133,9896131,9895894,9895053,9893385,9892157,9889152,9892449,9891531,9894051,9896393,9894177,9891709,9891537,9895591,9889019,9892463,9894994,9895578,9895046,9889365,9895854,9892159,9889979,9892099,9891068,9895204,9896067,9889609,9895922,9891487,9890952,9870408,9890574,9891921,9894255,9889039,9891492,9894320,9892251,9892552,9892724,9889548,9895071,9891220,9884915,9891874,9887802,9887040,9895791,9895075,9888442,9891868,9892438,9895473,9889213,9886555,9894991,9886817,9891837,9890180,9891431,9894288,9893499,9890974,9893131,9889588,9893098,9893401,9894513,9886103,9890364,9895298,9895623,9891759,9888012,9885353,9894423,9892488,9893349,9888231,9865835,9885503,9895253,9870349,9895838,9895572,9891901,9890566,9891406,9891681,9894171,9894430,9891624,9885896,9886101,9879153,9883882,9892221,9888743,9879336,9881453,9892574,9893490,9895119,9891015,9891352,9895319,9883313,9895420,9894787,9895376,9888387,9895374,9893432,9891989,9895235,9894242,9879685,9869871,9893437,9893884,9894532,9889399,9888528,9894922,9881213,9893741,9892989,9878061,9879580,9887358,9893602,9893778,9891373,9886640,9891560,9892135,9894942,9893389,9893773,9893640,9878302,9875549,9894948,9884005,9894235,9892436,9874521,9894524,9894341,9892701,9891258,9884417,9894552,9888035,9890808,9876561,9889352,9891064,9891262,9840647,9892891,9889582,9893965,9893203,9893732,9890673,9893894,9888153,9879715,9869755,9888945,9893354,9894111,9893927,9889328,9894024,9894015,9893507,9889909,9892079,9891992,9893722,9891280,9892491,9885625,9883747,9891175,9889149,9887664,9893206,9886067,9848124,9840682,9876940,9830773,9881929,9894287,9889964,9891625,9892051,9885413,9884057,9891088,9884244,9891600,9892288,9891217,9891680,9885992,9884715,9883893,9882277,9888553,9880585,9886682,9876554,9891670,9887469,9887285,9876016,9890147,9888162,9881696,9887164,9890603,9889370,9812245,9890176,9872504,9857662,9854076,9890123,9888899,9851685,9848645,9882617,9794548,9720813,9803790,9797918,9826386,9835195,9851757,9805220,9854123,9889854,9876999,9808480,9770362,9856637,9826131,9835375,9836942,9843500,9893496,9791272,9857332,9800809,9884165,9894153,9893498,9831680,9422033,9851953,9817160,9810641,9481211,9805150,9420135,7539390,9895010,9840468,9456094,5624727,1627246,9892364,9891323,9891869,9891558,9889647,9893525,9889785,9892652,9891495,9892629,9890953,9882135,9884970,9891832]", listType);
            }

        };
    }
}
```

##应用的当前架构情况
让我指出几个使这个程序的构建能够顺利通过测试环节的关键之处。首先，我想说目前的程序架构可能会进一步改变，基于 Pryce 和 Freeman 所说的同样原因：
>当在测试“可行骨架”的时候，我们并不是尝试在实际写代码之前将全部的算法和所需要用到的类都考虑进去。我们现在所冒出来的想法都有可能是错误的，所以我们更偏向于在进一步发展整个体系的过程中去发现那些细节。
>
>第73页


有一些关于当前架构情况的趣事：它使用了 RxJava 和 Loaders 的组合，用来确保：
- 即使因为设置改变的原因导致 MainActivity 和 Fragment 被销毁，网络请求仍然可以被正确地建立并恰当部署；
- 该程序应用层的类不用再担心应用组件在异步数据加载方面的一些 Android 具体问题，从而能够随时销毁及重建。


这个决定的灵感来自于 Freeman 和 Pryce 的建议：
>我们不希望技术性的概念会泄露到应用模型当中，所以我们写了一些接口去描述它们与外界世界的联系（Cockburn的端口）。然后我们写了一些连接应用核心和各个技术域的桥梁（Cockburn的适配器）。
>
>来自第90页

在我看来，`Loader` 尝试去解决的是一个不属于应用层的技术问题。为了能够将应用层对象与这里的技术细节隔绝开，根据订阅情况，我使用 `LoaderManager` 从 `Loader` 里生成并传递了一个 `Observable（观察者）`，初始化了一次加载：
```Java
public class LoaderInitializingOnSubscribe<T> implements Observable.OnSubscribe<T> {
    private int mLoadId;
    private final LoaderManager mLoaderManager;
    private Loader<T> mLoader;

    public LoaderInitializingOnSubscribe(int loadId, LoaderManager loaderManager, Loader<T> loader) {
        mLoadId = loadId;
        mLoaderManager = loaderManager;
        mLoader = loader;
    }

    @Override
    public void call(final Subscriber<? super T> subscriber) {
        mLoaderManager.initLoader(mLoadId, null, new LoaderManager.LoaderCallbacks<T>() {
            @Override
            public Loader<T> onCreateLoader(int id, Bundle args) {
                return mLoader;
            }

            @Override
            public void onLoadFinished(Loader<T> loader, T data) {
                subscriber.onNext(data);
            }

            @Override
            public void onLoaderReset(Loader<T> loader) {
            }
        });
    }
}
```
相比于直接处理loader的方式，客户端更希望能够处理那些已经加载过的数据。这部分的数据由`Observable（观察者）` 订阅并由 `LoaderInitializingOnSubscribe` 类生成。但在我的项目中，Activity, Fragment, Presenter都不会与 `Observable` 进行直接交互。相反，它们会利用一个 `StoryRepository` 的类来进行互动。这个类会最终决定到底是从缓存中读取数据，还是从网络中得到数据。在目前，这个类的代码是这样的：
```Java
public class ConnectivityAwareStoryRepository implements StoryRepository {

    private ConnectableObservable<List<Integer>> mStoriesObservable;

    public ConnectivityAwareStoryRepository(ConnectableObservable<List<Integer>> apiStoriesObservable) {
        mStoriesObservable = apiStoriesObservable;
    }

    @Override
    public Subscription addStoriesSubscriber(Subscriber<List<Integer>> observer) {
        return mStoriesObservable.subscribe(observer);
    }

    @Override
    public void loadTopStories() {
        mStoriesObservable.connect();
    }
}
```
这里是另一个与之相关的代码块。这个 Fragment 也使用了 `StoryRepository` 这个类来加载 HackerNews 的数据：
```Java
public class MainActivityFragment extends Fragment {
    //...
    @SuppressWarnings("WeakerAccess")
    @Inject
    StoryRepository mStoryRepository;
    private Subscription mSubscription;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_main, container, false);
        injectDependencies(view, getLoaderManager());
        mRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        mSubscription = mStoryRepository.addStoriesSubscriber(mStoriesSubscriber);
        mStoryRepository.loadTopStories();
        return view;
    }

    @Override
    public void onPause() {
        super.onPause();
        mSubscription.unsubscribe();
    }
    //...
}
```
如果你想进一步地了解我到目前为止完成的工作，可以到这个 [Github 地址](https://github.com/kmdupr33/PhilHackerNews)查看。








