当复仇者联盟遇上Dragger2、RxJava和Retrofit的巧妙结合
---

> * 原文链接 : [When the Avengers meet Dagger2, RxJava and Retrofit in a clean way](http://saulmm.github.io/when-Thor-and-Hulk-meet-dagger2-rxjava-1/)
* 原文作者 : [Saúl M](http://saulmm.github.io/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [zhengxiaopeng](https://github.com/zhengxiaopeng) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  待校对



Recently, a lot articles, frameworks, and talks at the android community, are appearing talking about testing and software architecture, as said in the last Droidcon Spain, we are focusing on how to do robust applications instead on how to develop specific features. That denotes that the Android framework and the current Android commnunity is reaching some level of maturity.

最近，许多文章、框架和 android 社区中的讨论都出现关于测试和软件架构方面的内容，就像上次 [Droidcon Spain](http://es.droidcon.com/2015/speakers/) 上所说的，我们专注于做出健壮的程序而不是去开发特性功能。这些现象也意味着 Android 框架和当前 Android 社区的日渐成熟。

Today, if you are an Android developer and don't recognize the words Dagger 2, RxJava or Retrofit, you are missing something, this series will put some focus on giving the basic ideas of how to use these frameworks together with a Clean Architecture perspective.

如果你是一名 Android 开发者，而到现在你还没听过 [Dagger 2](http://google.github.io/dagger/)、[RxJava](https://github.com/ReactiveX/RxJava)、[Retrofit](http://square.github.io/retrofit/) 这些名词的话你就错过了一些东西了，这个（文章）系列将会把一些关注点放在怎么用一种 [清晰架构](http://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html) 去综合使用这些框架。

My first idea was to write a single article, but seeing the large amount of contents that these frameworks provide I've decided to create a series with at least 3 articles.

我刚开始的想法是仅仅写一篇文章的，但是看到这些框架中有大量的内容所以我最终决定写一个最少 3 篇的系列文章。

As always, all the code is published in GitHub, please, all the recomendations, errors and comments are welcome, sorry if I don't have much time to answer all :)

一如既往，所有的代码都放在了 [Github](https://github.com/saulmm/Avengers)，所有的建议、错误提交和评论都欢迎，我可能没那么多时间去回答所有问题，先说声抱歉 ：）

![Avengers](http://androcode.es/wp-content/uploads/2015/05/avengers_list-e1431571424213.png)


## Dependency Injectors & Dagger 2

## 依赖注入与 Dagger 2

It took some time to find out how this framework works, so I would like to make clear the way in which I have learned to use it.

弄懂这个框架的工作机制花费了一些时间，所以我将会根据我所学习到的内容用更加清晰的方式写出来。

Dagger 2 It's based on the dependency injection pattern.

[Dagger 2](http://google.github.io/dagger/)是基于 [依赖注入](http://en.wikipedia.org/wiki/Dependency_injection) 模式的。

Look at the following snippet:

看下下面的代码片段：

``` Java
    // Thor is awesome. He has a hammer!
    public class Thor extends Avenger {
        private final AvengerWeapon myAmazingHammer;

        public Thor (AvengerWeapon anAmazingHammer) {
            myAmazingHammer = anAmazingHammer;
        }

        public void doAmazingThorWork () {
            myAmazingHammer.hitSomeone();
        }
    }
```

Thor needs an AvengerWeapon to work correctly, the basic idea of the dependency injection pattern is that Thor would get fewer benefits if he creates its own AvengerWeapon than passing them throught his constructor. If Thor creates his own hammer he would be increasing the coupling.

雷神（Thor）需要一个 `复仇者武器（AvengerWeapon）` 才能正确工作，依赖注入的基本思想是，如果雷神不是通过构造器创建他自己的 `复仇者武器` 而是在内部自己创建了出来那么他就不能得到很多的优势。如果雷神自己创建出雷锤将会增加耦合度。

AvengerWeapon could be an interface that would be implemented and injected in different ways depending our logic.

`复仇者武器（AvengerWeapon）` 可以是一个接口，根据我们的逻辑可以有不同的实现和注入方式。

In Android, because how the framework is designed, it's not always easy access to the constructors, Activity and Fragment are examples.

在 Android 中，因为框架已经设计好了，我们并不总是能访问构造器，`Activity` 和 `Fragment`  就是这样的例子。

That's where the dependency injectors like (http://google.github.io/dagger/), Dagger or Guice can bring benefits.

这些依赖注入器框架像 （http://google.github.io/dagger/）、[Dagger](http://square.github.io/dagger/) 、[Guice](https://github.com/google/guice) 可以给我们带来便利。

With Dagger 2 we would transform the previous code in something like this:

使用 [Dagger 2](http://google.github.io/dagger/) 我们可以把之前的代码该写成这样：

``` Java
// Thor is awesome. He has a hammer!
    public class Thor extends Avenger {
        @Inject AvengerWeapon myAmazingHammer;

        public void doAmazingThorWork () {
            myAmazingHammer.hitSomeone();
        }
    }
```

We are not accessing to the Thor's constructor directly, the injector, with a few directives is in charge to build the Thor's hammer

我们没有直接访问雷神的构造器，注入器使用了几个指令去创建了雷神的雷锤

``` Java
    public class ThorHammer extends AvengerWeapon () {

        @Inject public AvengerWeapon() {

            initGodHammer();
        }
    }
```

The @Inject annotation indicates to Dagger 2 which constructor has to use to build the Thor's hammer.

`@Inject ` 注解用于告诉 Dagger 2 构造器有用于创建雷神的雷锤。


## Dagger 2

## Dagger 2

Dagger 2 is promoted and implemented by Google, forked from Dagger, which it was created by Square.

[Dagger 2](http://google.github.io/dagger/) 由 Google 开发和维护，是 [Square](https://corner.squareup.com/) 的 [Dagger](http://square.github.io/dagger/) 项目的分支。

First of all it's necessary to configure the annotations processor, the android-apt plugin plays that role, allowing to use the annotations processor without inserting it into the final .apk. The processor also configures the source code generated by this processor.

首先必须配置注解处理器，`android-apt`  插件就是负责这个角色，允许使用注解处理器而不将其插入到最后的 .apk 中。处理器还配置由该处理器所产生的源代码。

build.gradle (In the root of the project)

`build.gradle` （项目的根目录中）

``` Gradle
dependencies {
        ...
        classpath 'com.neenbedankt.gradle.plugins:android-apt:1.4'
    }
```

build.gradle (In your android module)

`build.gradle` （你的 android module 中）

``` Gradle
apply plugin: 'com.neenbedankt.android-apt'

    dependencies {
        ...
        apt 'com.google.dagger:dagger-compiler:2.0'
    }

```


## Components, modules & Avengers

## 组件（Components）、模块（modules）和复仇者

The modules are those who provide dependencies, and components who inject them

模块负责提供依赖，组件负责注入它们（依赖）。

Here is an example:

这是一个例子：

``` Java
@Module
public class AppModule {
    private final AvengersApplication mAvengersApplication;

    public AppModule(AvengersApplication avengersApplication) {
        this.mAvengersApplication = avengersApplication;
    }

    @Provides @Singleton 
    AvengersApplication provideAvengersAppContext () { 
        return mAvengersApplication; 
    }

    @Provides @Singleton 
    Repository provideDataRepository (RestRepository restRepository) { 
        return restRepository; 
    }
}
```

This is the main module, we are interested in its dependencies to survive during the lifetime of the application, a general context and a repository for retrieve the information.

这个就是主模块，我们感兴趣的是它的依赖存在于程序的生命周期中，一个通用的上下文和一个取回信息的仓库。

Simple, right?

很简单，对吧？

With the @Provides annotation we are saying to Dagger 2 how a dependency has to be build if required. Otherwhise if we wouldn't indicate a provider for a particular dependency, Dagger 2 will go to find it to the constructor annotated with: @Inject.

我们在 Dagger 2 中所说的 `@Provides`  注解，如果有需要则必须会创建其依赖。因此如果我们没有给一个特别的依赖指定一个提供者（provider），Dagger 2 将会去寻找有 `@Inject` 注解的构造方法。

The modules are used by components to inject dependencies, see the component of this module:

组件使用模块去完成依赖注入，看看这个模块的组件：

``` Java
@Singleton @Component(modules = AppModule.class)
public interface AppComponent {

    AvengersApplication app();
    Repository dataRepository();
}
```

This module isn't invoked by any activity or fragment, instead, is obtained by a more complex module to provide these dependencies where are required

这个模块并不由任何的 activity 或者 fragment 去调用，而是通过更复杂的模块，以提供这些需要得到的依赖

``` Java
AvengersApplication app();
Repository dataRepository();
```

The components must to expose their dependencies to the graph (the dependencies that the module provides), i.e, the dependencies provided by this module must to be visible to other components that have this component as a dependency of the other components, if these dependencies are not visible Dagger 2 could not inject them where are required.

组件必须暴露它们的依赖给图（该模块提供的依赖关系），也即是这个模块提供的依赖关系必须对其它组件是可见的，其它的组件有把当前这个组件作为依赖，如果这些依赖关系是不可见的，Dagger 2 将不会注入这些要求的依赖。

Here's our tree of dependencies:

下面是我们的依赖关系树：

![tree of dependencies](http://androcode.es/wp-content/uploads/2015/05/Dagger-graph.png)

``` Java
@Module
public class AvengersModule {

    @Provides @Activity
    List<Character> provideAvengers() {

        List<Character> avengers = new ArrayList<>(6);

        avengers.add(new Character(
            "Iron Man", R.drawable.thumb_iron_man, 1009368));

        avengers.add(new Character(
            "Thor", R.drawable.thumb_thor, 1009664));

        avengers.add(new Character(
            "Captain America", R.drawable.thumb_cap,1009220));

        avengers.add(new Character(
            "Black Widow", R.drawable.thumb_nat, 1009189));

        avengers.add(new Character(
            "Hawkeye", R.drawable.thumb_hawkeye, 1009338));

        avengers.add(new Character(
            "Hulk", R.drawable.thumb_hulk, 1009351));

        return avengers;
    }
}
```

This module will be used to inject their dependencies into a particular activity, in fact will be who is responsible for painting the Avengers list:

这个模块将会用于一个特别的 activity 的依赖注入，实际上就是负责绘画的复仇者名单：

``` Java
@Activity 
@Component(
    dependencies = AppComponent.class, 
    modules = {
        AvengersModule.class, 
        ActivityModule.class
    }
)
public interface AvengersComponent extends ActivityComponent {

    void inject (AvengersListActivity activity);
    List<Character> avengers();
}
```

Again we expose our dependency List<Character> to other components, and in this case there is a new method: void inject (AvengersListActivity activity). At the time this method is called, the dependencies will be available to be consumed. These are injected into AvengerListActivity.

再次，我们暴露出我们的依赖：`List<Character>` 给其它的组件，在这种情况下出现了一个新方法：`void inject (AvengersListActivity activity)` 。**在此方法被调用时**，这些依赖关系将可被消耗，将会被注入给 `AvengerListActivity` 。


## All mixed

## 结合所有

Our class AvengersApplication, will be responsible to provide the component of the application to other components, note that this doesn't order to inject any dependency, only provides the component.

我们的类 `AvengersApplication`，将负责提供应用到其他组件的组件，注意，仅仅提供组件而不会用于注入依赖。

Another reminder is that Dagger 2 generates the necessary elements at compile time, if you don't build your project, you aren't going to find the DaggerAppComponent class.

再次提醒的是 [Dagger 2](http://google.github.io/dagger/) 是在编译时生成必要的元素，如果你没有构建项目你是找不到 `DaggerAppComponent` 类的。

Dagger 2 is who generates this class from your component with the following format: Dagger$${YourComponent}.

Dagger 2 从你的组件中生成的类的格式：`Dagger$${YourComponent}.` 。

`AvengersApplication.java`
``` Java
public class AvengersApplication extends Application {

    private AppComponent mAppComponent;

    @Override
    public void onCreate() {

        super.onCreate();
        initializeInjector();
    }

    private void initializeInjector() {

        mAppComponent = DaggerAppComponent.builder()
            .appModule(new AppModule(this))
            .build();
    }

    public AppComponent getAppComponent() {

        return mAppComponent;
    }
}
```

`AvengersListActivity.java`
``` Java
public class AvengersListActivity extends Activity 
    implements AvengersView {

    @InjectView(R.id.activity_avengers_recycler) 
    RecyclerView mAvengersRecycler;

    @InjectView(R.id.activity_avengers_toolbar) 
    Toolbar mAvengersToolbar;

    @Inject 
    AvengersListPresenter mAvengersListPresenter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_avengers_list);
        ButterKnife.inject(this);

        initializeToolbar();
        initializeRecyclerView();
        initializeDependencyInjector();
        initializePresenter();
    }

    private void initializeDependencyInjector() {

        AvengersApplication avengersApplication = 
            (AvengersApplication) getApplication();

        DaggerAvengersComponent.builder()
            .avengersModule(new AvengersModule())
            .activityModule(new ActivityModule(this))
        .appComponent(avengersApplication.getAppComponent())
            .build().inject(this);
    }
```

When the initializeDependencyInjector() is in .inject(this) Dagger 2 starts to work and provides the necessary dependencies, remember that Dagger 2 is strict when it comes to make the injection, I mean, the component must be exactly the same class who call the inject() method of the component.

当 `initializeDependencyInjector()` 中执行到 `.inject(this)` 中时 [Dagger 2](http://google.github.io/dagger/) 就会开始工作并提供必要的依赖关系，请记住 [Dagger 2](http://google.github.io/dagger/) 在注入时是严格执行的，我要说的意思是组件必须是 **完全相同** 的组件类，此组件类负责调用 `inject()` 方法。

`AvengersComponent.java`
``` Java
...
public interface AvengersComponent extends ActivityComponent {

    void inject (AvengersListActivity activity);
    List<Character> avengers();
}
```

Otherwise dependencies will be unresolved. In this case, the presenter is initialized with the Avengers that are provided by Dagger 2:

否则，依赖关系将不会被解决。在如下情况，presenter 与由 Dagger 2 提供的复仇者一起初始化：

``` Java
public class AvengersListPresenter implements Presenter, RecyclerClickListener {

    private final List<Character> mAvengersList;
    private final Context mContext;
    private AvengersView mAvengersView;
    private Intent mIntent;

    @Inject public AvengersListPresenter (List<Character> avengers, Context context) {

        mAvengersList = avengers;
        mContext = context;
    }
```

Dagger 2 will resolve the presenter because has a @Inject annotation. The argument that the constructor receives is solved by Dagger 2, because it knows how to build it thanks to the @Provides method in the module.

[Dagger 2](http://google.github.io/dagger/) 将会解决这个 presenter，因为其有 `@Inject` 注解。该构造方法的参数由 Dagger 2 解决，因为它知道怎么去构建它，这得益于这个模块中的 `@Provides` 方法。


## Conclusion

## 总结

The power of a good use of an injector like Dagger 2 is indisputable, imagine that you have different strategies depending the Api Level of the framework, the possibilities are endless.

像 [Dagger 2](http://google.github.io/dagger/) 这样，使用好了依赖注入器，其力量是无可争辩的，想象下根据该框架提供的 API 级别你可以有不同的策略，其可能性是无止境的。

## Resources:

## 资源

-  **Chiu-Ki Chan** - [Dagger 2 + Espresso + Mockito](http://blog.sqisland.com/2015/04/dagger-2-espresso-2-mockito.html)

- **Fernando Cejas** - [Tasting Dagger 2 on Android](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)

- **Google Developers** - [Dagger 2, A new type of dependency injection](https://www.youtube.com/watch?v=oK_XtfXPkqw)

- **Mike Gouline** - [Dagger 2, Even sharper, less square](http://blog.gouline.net/2015/05/04/dagger-2-even-sharper-less-square/)
