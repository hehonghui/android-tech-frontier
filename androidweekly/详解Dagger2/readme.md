详解Dagger2
---

> * 原文链接 : [Tasting Dagger 2 on Android](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)
* 原文作者 : [Fernando Cejas](http://fernandocejas.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [xianjiajun](https://github.com/xianjiajun) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中

Why dependency injection?
The first (and indeed most important) thing we should know about it is that has been there for a long time and uses Inversion of Control principle, which basically states that the flow of your application depends on the object graph that is built up during program execution, and such a dynamic flow is made possible by object interactions being defined through abstractions. This run-time binding is achieved by mechanisms such as dependency injection or a service locator.
##为什么使用依赖注入
首先我们需要知道，人们在很长的一段时间里都是利用控制反转原则规定：应用程序的流程取决于在程序运行时对象图的建立。通过抽象定义的对象交互可以实现这样的动态流程。而使用依赖注入技术或者服务定位器便可以完成运行时绑定。

Said that we can get to the conclusion that dependency injection brings us important benefits:

Since dependencies can be injected and configured externally we can reuse those components.
When injecting abstractions as collaborators, we can just change the implementation of any object without having to make a lot of changes in our codebase, since that object instantiation resides in one place isolated and decoupled.
Dependencies can be injected into a component: it is possible to inject mock implementations of these dependencies which makes testing easier.

使用依赖注入可以带来以下好处：

* 依赖的注入和配置独立于组件之外。
* 因为对象是在一个独立、不耦合的地方初始化，所以当注入抽象方法的时候，我们只需要修改对象的实现方法，而不用大改代码库。
* 依赖可以注入到一个组件中：我们可以注入这些依赖的模拟实现，这样使得测试更加简单。

One thing that we will see is that we can manage the scope of our instances created, which is something really cool and from my point of view, any object or collaborator in your app should not know anything about instances creation and lifecycle and this should be managed by our dependency injection framework.
可以看到，能够管理创建实例的范围是一件非常棒的事情。按我的观点，你app中的所有对象或者协作者都不应该知道有关实例创建和生命周期的任何事情，这些都应该由我们的依赖注入框架管理的。

![p1](http://fernandocejas.com/wp-content/uploads/2015/04/dependency_inversion1.png)

What is JSR-330?
Basically dependency injection for Java defines a standard set of annotations (and one interface) for use on injectable classes in order to to maximize reusability, testability and maintainability of java code.
Both Dagger 1 and 2 (also Guice) are based on this standard which brings consistency and an standard way to do dependency injection.
#什么是JSR-330？
为了最大程度的提高代码的复用性、测试性和维护性，java的依赖注入为注入类中的使用定义了一整套注解（和接口）标准。Dagger1和Dagger2（还有Guice）都是基于这套标准，给程序带来了稳定性和标准的依赖注入方法。

Dagger 1
I will be very quick here because this version is out of the purpose of this article. Anyway, Dagger 1 has a lot to offer and I would say that nowadays is the most popular dependency injector used on Android. It has been created by Square inspired by Guice.

Its fundamentals are:

Multiple injection points: dependencies, being injected.
Multiple bindings: dependencies, being provided.
Multiple modules: a collection of bindings that implement a feature.
Multiple object graphs: a collection of modules that implement a scope.
Dagger 1 uses compile time to figure out bindings but also uses reflection, and although it is not used to instantiate objects, it is used for graph composition. All this process happens at runtime, where Dagger tries to figure out how everything fits together, so there is a price to pay: inefficiency sometimes and difficulties when debugging.
#Dagger1
这个版本不是这篇文章的重点，所以我只是简略地说一下。不管怎样，Dagger1还是做了很多的贡献，可以说是如今Android上最流行的依赖注入框架。它是由Square公司受到Guice启发创建的。

基本特点：

* 多个注入点：依赖，通过injected
* 多种绑定方法：依赖，通过provided
* 多个modules：实现某种功能的绑定集合
* 多个对象图： 实现一个范围的modules集合

Dagger1是在编译的时候实行绑定，不过也用到了反射机制。但这个反射不是用来实例化对象的，而是用于图的构成。Dagger会在运行的时候去检测是否一切都正常工作，所以使用的时候会付出一些代价：偶尔会无效和调试困难。

Dagger 2
Dagger 2 is a fork from Dagger 1 under heavy development by Google, currently version 2.0. It was inspired by AutoValue project (https://github.com/google/auto, useful if you are tired of writing equals and hashcode methods everywhere).
From the beginning, the basic idea behind Dagger 2, was to make problems solvable by using code generation, hand written code, as if we were writing all the code that creates and provides our dependencies ourselves.
#Dagger2
Dagger2是Dagger1的分支，由谷歌公司接手开发，目前的版本是2.0。Dagger2是受到[AutoValue项目](https://github.com/google/auto)的启发。
刚开始，Dagger2解决问题的基本思想是：利用生成和写的代码混合达到看似所有的产生和提供依赖的代码都是手写的样子。

If we compare this version with its predecessor, both are quite similar in many aspects but there are also important differences that worth mentioning:
No reflection at all: graph validation, configurations and preconditions at compile time.
Easy debugging and fully traceable: entirely concrete call stack for provision and creation.
More performance: according to google they gained 13% of processor performance.
Code obfuscation: it uses method dispatch, like hand written code.
Of course all this cool features come with a price, which makes it less flexible: for instance, there is no dynamism due to the lack of reflection.

如果我们将Dagger2和1比较，他们两个在很多方面都非常相似，但也有很重要的区别，如下：

* 再也没有使用反射：图的验证、配置和预先设置都在编译的时候执行。
* 容易调试和可跟踪：完全具体地调用提供和创建的堆栈
* 更好的性能：谷歌声称他们提高了13%的处理性能
* 代码混淆：使用派遣方法，就如同自己写的代码一样

当然所有这些很棒的特点都需要付出一个代价，那就是缺乏灵活性，例如：Dagger2没用反射所以没有动态机制。

Diving deeper
To understand Dagger 2 it is important (and probably a bit hard in the beginning) to know about the fundamentals of dependency injection and the concepts of each one of these guys (do not worry if you do not understand them yet, we will see examples):
@Inject: Basically with this annotation we request dependencies. In other words, you use it to tell Dagger that the annotated class or field wants to participate in dependency injection. Thus, Dagger will construct instances of this annotated classes and satisfy their dependencies.
@Module: Modules are classes whose methods provide dependencies, so we define a class and annotate it with @Module, thus, Dagger will know where to find the dependencies in order to satisfy them when constructing class instances. One important feature of modules is that they have been designed to be partitioned and composed together (for instance we will see that in our apps we can have multiple composed modules). 
@Provide: Inside modules we define methods containing this annotation which tells Dagger how we want to construct and provide those mentioned dependencies.
#深入研究
想要了解Dagger2，就必须要知道依赖注入的基础和这其中的每一个概念：

* @Inject: 通常在需要依赖的地方使用这个注解。换句话说，你用它告诉Dagger这个类或者字段需要依赖注入。这样，Dagger就会构造一个这个类的实例并满足他们的依赖。
* @Module: Modules类里面的方法专门提供依赖，所以我们定义一个类，用@Module注解，这样Dagger在构造类的实例的时候，就知道从哪里去找到需要的依赖。modules的一个重要特征是它们设计为分区并组合在一起（比如说，在我们的app中可以有多个组成在一起的modules）。
* @Provide: 在modules中，我们定义的方法是用这个注解，以此来告诉Dagger我们想要构造对象并提供这些依赖。

@Component: Components basically are injectors, let’s say a bridge between @Inject and @Module, which its main responsibility is to put both together. They just give you instances of all the types you defined, for example, we must annotate an interface with @Component and list all the @Modules that will compose that component, and if any of them is missing, we get errors at compile time. All the components are aware of the scope of dependencies it provides through its modules. 
@Scope: Scopes are very useful and Dagger 2 has has a more concrete way to do scoping through custom annotations. We will see an example later, but this is a very powerful feature, because as pointed out earlier, there is no need that every object knows about how to manage its own instances. An scope example would be a class with a custom @PerActivity annotation, so this object will live as long as our Activity is alive. In other words, we can define the granularity of your scopes (@PerFragment, @PerUser, etc). 
@Qualifier: We use this annotation when the type of class is insufficient to identify a dependency. For example in the case of Android, many times we need different types of context, so we might define a qualifier annotation “@ForApplication” and “@ForActivity”, thus when injecting a context we can use those qualifiers to tell Dagger which type of context we want to be provided.

* @Component: Components从根本上来说就是一个注入器，也可以说是@Inject和@Module的桥梁，它的主要作用就是连接这两个部分。Components可以提供所有定义了的类型的实例，比如：我们必须用@Component注解一个接口然后列出所有的@Modules组成该组件，如果缺失了任何一块都会在编译的时候报错。所有的组件都可以通过它的modules知道依赖的范围。
* @Scope: Scopes可是非常的有用，Dagger2可以通过自定义注解限定注解作用域。后面会演示一个例子，这是一个非常强大的特点，因为就如前面说的一样，没必要让每个对象都去了解如何管理他们的实例。在scope的例子中，我们用自定义的@PerActivity注解一个类，所以这个对象存活时间就和activity的一样。简单来说就是我们可以定义所有范围的粒度(@PerFragment, @PerUser, 等等)。
* Qualifier: 当类的类型不足以鉴别一个依赖的时候，我们就可以使用这个注解标示。例如：在Android中，我们会需要不同类型的context，所以我们就可以定义qualifier注解“@ForApplication”和“@ForActivity”，这样当注入一个context的时候，我们就可以告诉Dagger我们想要哪种类型的context。

Shut up and show me the code!
I guess it is too much theory for now, so let’s see Dagger 2 in action, although it is a good idea 
to first set it up by adding the dependencies in our build.gradle file:
#不废话上代码
前面已经讲了很多理论了，所以接下来让我们看看如何使用Dagger2。首先还是要在我们的build.gradle文件中如下配置：
```java
apply plugin: 'com.neenbedankt.android-apt'
 
buildscript {
  repositories {
    jcenter()
  }
  dependencies {
    classpath 'com.neenbedankt.gradle.plugins:android-apt:1.4'
  }
}
 
android {
  ...
}
 
dependencies {
  apt 'com.google.dagger:dagger-compiler:2.0'
  compile 'com.google.dagger:dagger:2.0'
  
  ...
}
```

As you can see we are adding the compiler, the runtime library and the apt plugin, which is necessary, otherwise the dagger annotation processor might not work properly, especially I encountered problems on Android Studio.

如上所示，我们添加了编译和运行库，还有必不可少的apt插件，没有这插件，dagger可能不会正常工作，特别是在Android studio中。

Our example
A few months ago I wrote an article about how to implement uncle bob’s clean architecture on Android, which I strongly recommend to read so you get a better understanding of what we are gonna do here. Back then, I faced a problem when constructing and providing dependencies of most of the objects involved in my solution, which looked something like this (check out the comments):
#例子
几个月前，我写了一篇关于如何在Android上实现bob叔叔的清晰架构的文章，强烈建议大家去看一下，看完之后，你将会对我们现在做的事情有更好的理解。言归正传，在我以前的方案中，构造和提供大多数对象的依赖的时候，会遇到问题，具体如下（见评注）：
```java
  @Override void initializePresenter() {
    // All this dependency initialization could have been avoided by using a
    // dependency injection framework. But in this case this is used this way for
    // LEARNING EXAMPLE PURPOSE.
    ThreadExecutor threadExecutor = JobExecutor.getInstance();
    PostExecutionThread postExecutionThread = UIThread.getInstance();

    JsonSerializer userCacheSerializer = new JsonSerializer();
    UserCache userCache = UserCacheImpl.getInstance(getActivity(), userCacheSerializer,
        FileManager.getInstance(), threadExecutor);
    UserDataStoreFactory userDataStoreFactory =
        new UserDataStoreFactory(this.getContext(), userCache);
    UserEntityDataMapper userEntityDataMapper = new UserEntityDataMapper();
    UserRepository userRepository = UserDataRepository.getInstance(userDataStoreFactory,
        userEntityDataMapper);

    GetUserDetailsUseCase getUserDetailsUseCase = new GetUserDetailsUseCaseImpl(userRepository,
        threadExecutor, postExecutionThread);
    UserModelDataMapper userModelDataMapper = new UserModelDataMapper();

    this.userDetailsPresenter =
        new UserDetailsPresenter(this, getUserDetailsUseCase, userModelDataMapper);
  }
```

As you can see, the way to address this problem is to use a dependency injection framework. We basically get rid of that boilerplate code (which is unreadable and understandable): this class must not know anything about object creation and dependency provision.

So how do we do it? Of course we use Dagger 2 features… Let me picture the structure of my dependency injection graph:

可以看出，解决这个问题的办法是使用依赖注入框架。我们要避免像上面这样引用代码：这个类不能涉及对象的创建和依赖的提供。
那我们该怎么做呢，当然是使用Dagger2，我们先看看结构图：
![pic2](http://fernandocejas.com/wp-content/uploads/2015/04/composed_dagger_graph1.png)

Let’s break down this graphic and explain its parts plus some code.

Application Component: A component whose lifetime is the life of the application. It injects both AndroidApplication and BaseActivity classes.

接下来我们会分解这张图，并解释各个部分还有代码。
Application Component: 生命周期跟Application一样的组件。可注入到AndroidApplication和BaseActivity中类中。

```java
@Singleton // Constraints this component to one-per-application or unscoped bindings.
@Component(modules = ApplicationModule.class)
public interface ApplicationComponent {
  void inject(BaseActivity baseActivity);

  //Exposed to sub-graphs.
  Context context();
  ThreadExecutor threadExecutor();
  PostExecutionThread postExecutionThread();
  UserRepository userRepository();
}
```
As you can see, I use the @Singleton annotation for this component which constraints it to one-per-application. You might be wondering why I’m exposing the Context and the rest of the classes. This is actually an important property of how components work in Dagger: they do not expose types from their modules unless you explicitly make them available. In this case in particular I just exposed those elements to subgraphs and if you try to remove any of them, a compilation error will be triggered.

我为这个组件使用了@Singleton注解，使其保证唯一性。也许你会问为什么我要将context和其他成员暴露出去。这正是Dagger中components工作的重要性质：如果你不想把modules的类型暴露出来，那么你就只能显示地使用它们。在这个例子中，我把这些元素暴露给子图，如果你把他们删掉，编译的时候就会报错。

Application Module: This module provides objects which will live during the application lifecycle, that is the reason why all of @Provide methods use a @Singleton scope.

Application Module: module的作用是提供在应用的生命周期中存活的对象。这也是为什么@Provide注解的方法要用@Singleton限定。

```java
@Module
public class ApplicationModule {
  private final AndroidApplication application;

  public ApplicationModule(AndroidApplication application) {
    this.application = application;
  }

  @Provides @Singleton Context provideApplicationContext() {
    return this.application;
  }

  @Provides @Singleton Navigator provideNavigator() {
    return new Navigator();
  }

  @Provides @Singleton ThreadExecutor provideThreadExecutor(JobExecutor jobExecutor) {
    return jobExecutor;
  }

  @Provides @Singleton PostExecutionThread providePostExecutionThread(UIThread uiThread) {
    return uiThread;
  }

  @Provides @Singleton UserCache provideUserCache(UserCacheImpl userCache) {
    return userCache;
  }

  @Provides @Singleton UserRepository provideUserRepository(UserDataRepository userDataRepository) {
    return userDataRepository;
  }
}
```

Activity Component: A component which will live during the lifetime of an activity.

Activity Component: 生命周期跟Activity一样的组件。

```java
@PerActivity
@Component(dependencies = ApplicationComponent.class, modules = ActivityModule.class)
public interface ActivityComponent {
  //Exposed to sub-graphs.
  Activity activity();
}
```

The @PerActivity is a custom scoping annotation to permit objects whose lifetime should conform to the life of the activity to be memorized in the correct component. I really encourage to do this as a good practice, since we get these advantages:

The ability to inject objects where and activity is required to be constructed.
The use of singletons on a per-activity basis.
The global object graph is kept clear of things that can be used only in activities.

@PerActivity是一个自定义的范围注解，作用是允许对象被记录在正确的组件中，当然这些对象的生命周期应该遵循activity的生命周期。这是一个很好的练习，我建议你们都做一下，有以下好处：

* 注入对象到构造方法需要的activity。
* 在一个per-activity基础上的单例使用。
* 只能在activity中使用使得全局的对象图保持清晰。

看下代码：
```java
@Scope
@Retention(RUNTIME)
public @interface PerActivity {}
```

Activity Module: This module exposes the activity to dependents in the graph. The reason behind this is basically to use the activity context in a fragment for example.

Activity Module: 在对象图中，这个module把activity暴露给相关联的类。比如在fragment中使用activity的context。

```java
@Module
public class ActivityModule {
  private final Activity activity;

  public ActivityModule(Activity activity) {
    this.activity = activity;
  }

  @Provides @PerActivity Activity activity() {
    return this.activity;
  }
}
```
User Component: A scoped @PerActivity component that extends ActiviyComponent. Basically I use it in order to injects user specific fragments. Since ActivityModule exposes the activity to the graph (as mentioned earlier), whenever an activity context is needed to satisfy a dependency, Dagger will get it from there and inject it: there is no need to re define it in sub modules.

User Component: 继承于ActivityComponent的组件，并用@PerActivity注解。我通常会在注入用户相关的fragment中使用。因为ActivityModule把activity暴露给图了，所以在任何需要一个activity的context的时候，Dagger都可以提供注入，没必要再在子modules中定义了。

```java
@PerActivity
@Component(dependencies = ApplicationComponent.class, modules = {ActivityModule.class, UserModule.class})
public interface UserComponent extends ActivityComponent {
  void inject(UserListFragment userListFragment);
  void inject(UserDetailsFragment userDetailsFragment);
}
```

User Module: A module that provides user related collaborators. Based on the example, it will provide user use cases basically.

User Module: 提供跟用户相关的实例。基于我们的例子，它可以提供用户用例。

```java
@Module
public class UserModule {
  @Provides @PerActivity GetUserListUseCase provideGetUserListUseCase(GetUserListUseCaseImpl getUserListUseCase) {
    return getUserListUseCase;
  }

  @Provides @PerActivity GetUserDetailsUseCase provideGetUserDetailsUseCase(GetUserDetailsUseCaseImpl getUserDetailsUseCase) {
    return getUserDetailsUseCase;
  }
}
```

Putting everything together
Now we have our dependency injection graph implementation, how do we inject dependencies? Something we need to know is that Dagger give us a bunch of options to inject dependencies:

Constructor injection: by annotating the constructor of our class with @Inject.
Field injection: by annotating a (non private) field of our class with @Inject.
Method injection: by annotating a method with @Inject.
#整合到一起
现在我们已经实现了依赖注入图，但是我该如何注入？我们需要知道，Dagger给了我们一堆选择用来注入依赖：

 1. 构造方法注入：在类的构造方法前面注释@Inject
 2. 成员变量注入：在类的成员变量（非私有）前面注释@Inject
 3. 函数方法注入：在函数前面注释@Inject

This is also the order used by Dagger when binding dependencies and it is important because it might happen that you have some strange behavior or even NullPointerExceptions, which means that your dependencies might not have been initialized at the moment of the object creation. This is common on Android when using field injection in Activities or Fragments, since we do not have access to their constructors.

这个顺序是Dagger建议使用的，因为在运行的过程中，总会有一些奇怪的问题甚至是空指针，这也意味着你的依赖在对象创建的时候可能还没有初始化完成。这在Android的activity或者fragment中使用成员变量注入会经常遇到，因为我们没有在它们的构造方法中使用。

Getting back to our example, let’s see how we can inject a member to our BaseActivity. In this case we do it with a class called Navigator which is responsible for managing the navigation flow in our app:

回到我们的例子中，看一下我们是如何在BaseActivity中注入一个成员变量。在这个例子中，我们注入了一个叫Navigator的类，它是我们应用中负责管理导航的类。

```java
public abstract class BaseActivity extends Activity {

  @Inject Navigator navigator;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.getApplicationComponent().inject(this);
  }

  protected ApplicationComponent getApplicationComponent() {
    return ((AndroidApplication)getApplication()).getApplicationComponent();
  }

  protected ActivityModule getActivityModule() {
    return new ActivityModule(this);
  }
}
```

Since Navigator is bound by field injection it is mandatory to be provided explicitly in our ApplicationModule using @Provide annotation. Finally we initialize our component and call the inject() method in order to inject our members. We do this in the onCreate() method of our Activity by calling getApplicationComponent(). This method has been added here for reusability and its main purpose is to retrieve the ApplicationComponent which was initialized in the Application object.

Navigator类是成员变量注入的，由ApplicationModule里面@Provide注解显示提供的。最终我们初始化component然后调用inject()方法注入成员变量。我们通过在Activity的onCreate()方法中调用getApplicationComponent()，完成这些操作。getApplicationComponent()方法放在这儿是为了复用性，它的主要作用是为了获取实例化的ApplicationComponent对象。

Let’s do the same with a presenter in a Fragment. In this case the approach is a bit different since we are using a per-activity scoped component. So our UserComponent which will inject UserDetailsFragment will reside in our UserDetailsActivity:

在Fragment的presenter中我们也做了同样的事情，这儿的获取方法有一点不一样，因为问我们使用的是per-activity范围限定的component。所以我们注入到UserDetailsFragment中的UserComponent其实是驻留在UserDetailsActivity中的。

```java
private UserComponent userComponent;
```
We have to initialize it this way in the onCreate() method of the activity:
我们必须在activity的onCreate()方法中用下面的方式初始化。
```java
private void initializeInjector() {
  this.userComponent = DaggerUserComponent.builder()
      .applicationComponent(getApplicationComponent())
      .activityModule(getActivityModule())
      .build();
}
```
As you can see when Dagger processes our annotations, creates implementations of our components and rename them adding a “Dagger” prefix. Since this is a composed component, when constructing it, we must pass in all its dependencies (both components and modules). Now that our component is ready, we just make it accesible in order to satisfy the fragment dependencies:

Dagger会处理我们的注解，为components生成实现并重命名加上“Dagger”前缀。因为这个是一个组合的component，所以在构建的时候，我们必须把所有的依赖的传进去（components和modules）。现在我们的component已经准备好了，接着为了可以满足fragment的依赖需求，我们写一个获取方法：

```java
@Override public UserComponent getComponent() {
  return userComponent;
}
```
We bind UserDetailsFragment dependencies by getting the created component and calling the inject() method passing the Fragment as a parameter:

我们现在可以利用get方法获取创建的component，然后调用inject()方法将Fragment作为参数传进去，这样就完成了绑定UserDetailsFragment依赖。

```java
@Override public void onActivityCreated(Bundle savedInstanceState) {
  super.onActivityCreated(savedInstanceState);
  this.getComponent.inject(this);
}
```

For the complete example, check the repository on github. There is also some refactor happening and I can tell you that one of the main ideas (taken from the official examples) is to have an interface as a contract which will be implemented by every class that has a component. Something like this:

[想要查看完整的例子，可以去我的github](https://github.com/android10/Android-CleanArchitecture).这里面有一些地方重构了的，我可以告诉你一个重要的思想（来自官方的例子）是：

```java
public interface HasComponent<C> {
  C getComponent();
}
```

Thus, the client (for example a Fragment) can get the component (from the Activity) and use it:
因此，客户端（例如fragment）可以获取并且使用component（来自activity）：
```java
@SuppressWarnings("unchecked")
protected <C> C getComponent(Class<C> componentType) {
  return componentType.cast(((HasComponent<C>)getActivity()).getComponent());
}
```
The use of generics here makes mandatory to do the casting but at least is gonna fail fast whether the client cannot get a component to use. Just ping me if you have any thoughts/ideas on how to solve this in a better way.
这儿使用了强制转换，不论这个客户端不能获取到能用的component，但是至少很快就会失败。如果你有任何想法能够更好地解决这个问题，请告诉我。

Dagger 2 code generation
After having a taste of Dagger’s main features, let’s see how does its job under the hood. To illustrate this, we are gonna take again the Navigator class and see how it is created and injected.
First let’s have a look at our DaggerApplicationComponent which is an implementation of our ApplicationComponent:
#Dagger2生成的代码
在了解Dagger的主要特征之后，我们再来看看内部构造。为了举例说明，我们还是用Navigator类，看看它是如何创建和注入的。首先我们看一下我们的DaggerApplicationComponent。
```java
@Generated("dagger.internal.codegen.ComponentProcessor")
public final class DaggerApplicationComponent implements ApplicationComponent {
  private Provider<Navigator> provideNavigatorProvider;
  private MembersInjector<BaseActivity> baseActivityMembersInjector;

  private DaggerApplicationComponent(Builder builder) {  
    assert builder != null;
    initialize(builder);
  }

  public static Builder builder() {  
    return new Builder();
  }

  private void initialize(final Builder builder) {  
    this.provideNavigatorProvider = ScopedProvider.create(ApplicationModule_ProvideNavigatorFactory.create(builder.applicationModule));
    this.baseActivityMembersInjector = BaseActivity_MembersInjector.create((MembersInjector) MembersInjectors.noOp(), provideNavigatorProvider);
  }

  @Override
  public void inject(BaseActivity baseActivity) {  
    baseActivityMembersInjector.injectMembers(baseActivity);
  }

  public static final class Builder {
    private ApplicationModule applicationModule;
  
    private Builder() {  
    }
  
    public ApplicationComponent build() {  
      if (applicationModule == null) {
        throw new IllegalStateException("applicationModule must be set");
      }
      return new DaggerApplicationComponent(this);
    }
  
    public Builder applicationModule(ApplicationModule applicationModule) {  
      if (applicationModule == null) {
        throw new NullPointerException("applicationModule");
      }
      this.applicationModule = applicationModule;
      return this;
    }
  }
}
```
Two important things: the first one is that since we are gonna inject our activity, we have a members injector (which Dagger translates to BaseActivity_MembersInjector):
有两个重点需要注意。第一个：由于我们要将依赖注入到activity中，所以会得到一个注入这个比成员的注入器（由Dagger生成的BaseActivity_MembersInjector）：
```java
@Generated("dagger.internal.codegen.ComponentProcessor")
public final class BaseActivity_MembersInjector implements MembersInjector<BaseActivity> {
  private final MembersInjector<Activity> supertypeInjector;
  private final Provider<Navigator> navigatorProvider;

  public BaseActivity_MembersInjector(MembersInjector<Activity> supertypeInjector, Provider<Navigator> navigatorProvider) {  
    assert supertypeInjector != null;
    this.supertypeInjector = supertypeInjector;
    assert navigatorProvider != null;
    this.navigatorProvider = navigatorProvider;
  }

  @Override
  public void injectMembers(BaseActivity instance) {  
    if (instance == null) {
      throw new NullPointerException("Cannot inject members into a null reference");
    }
    supertypeInjector.injectMembers(instance);
    instance.navigator = navigatorProvider.get();
  }

  public static MembersInjector<BaseActivity> create(MembersInjector<Activity> supertypeInjector, Provider<Navigator> navigatorProvider) {  
      return new BaseActivity_MembersInjector(supertypeInjector, navigatorProvider);
  }
}
```
Basically, this guy contains providers for all the injectable members of our Activity so when we call inject() will take the accessible fields and bind the dependencies.
这个注入器一般都会为所有activity的注入成员提供依赖，只要我们一调用inject()方法，就可以获取需要的字段和依赖。

The second thing, regarding our DaggerApplicationComponent, is that we have a Provider<Navigator> which is no more than interface which provides instances of our class and it is constructed by a ScopedProvider (in the initialize() method) which will memorize the scope of the created class.

第二个重点：关于我们的DaggerApplicationComponent类，我们有一个Provider，它不仅仅是一个提供实例的接口，它还是被ScopedProvider构造出来的，可以记录创建实例的范围。

Dagger also generated a Factory called ApplicationModule_ProvideNavigatorFactory for our Navigator which is passed as a parameter to the mentioned ScopedProvider in order to get scoped instances of our class.
Dagger还会为我们的Navigator类生成一个名叫ApplicationModule_ProvideNavigatorFactory的工厂，这个工厂可以传递上面提到的范围参数然后得到这个范围内的类的实例。

```java
@Generated("dagger.internal.codegen.ComponentProcessor")
public final class ApplicationModule_ProvideNavigatorFactory implements Factory<Navigator> {
  private final ApplicationModule module;

  public ApplicationModule_ProvideNavigatorFactory(ApplicationModule module) {  
    assert module != null;
    this.module = module;
  }

  @Override
  public Navigator get() {  
    Navigator provided = module.provideNavigator();
    if (provided == null) {
      throw new NullPointerException("Cannot return null from a non-@Nullable @Provides method");
    }
    return provided;
  }

  public static Factory<Navigator> create(ApplicationModule module) {  
    return new ApplicationModule_ProvideNavigatorFactory(module);
  }
}
```
This class is actually very simple, it delegates to our ApplicationModule (which contains our @Provide method()) the creation of our Navigator class.

In conclusion, this really looks like hand-written code and it is very easy to understand which makes it easy to debug. There is still much to explore here and a good idea is start debugging and see how Dagger deal with dependency binding.

这个类非常简单，它代表我们的ApplicationModule（包含@Provide方法）创建了Navigator类。
总之，上面的代码看起来就像是手敲出来的，而且非常好理解，便于调试。其余还有很多可以去探索，你们可以通过调试去看看Dagger如何完成依赖绑定的。
![pic3](http://fernandocejas.com/wp-content/uploads/2015/04/debugging_dagger.png)

#源码:
例子: https://github.com/android10/Android-CleanArchitecture
#相关文章:
[Architecting Android…The clean way?](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)
[Dagger 2, A New Type of Dependency Injection.](https://www.youtube.com/watch?v=oK_XtfXPkqw)
[Dependency Injection with Dagger 2.](https://speakerdeck.com/jakewharton/dependency-injection-with-dagger-2-devoxx-2014)
[Dagger 2 has Components.](https://publicobject.com/2014/11/15/dagger-2-has-components/)
[Dagger 2 Official Documentation.](http://google.github.io/dagger/)