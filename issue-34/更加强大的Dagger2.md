更加强大的Dagger2
---

> * 原文链接 : [Dagger 2: Even sharper, less square](https://blog.gouline.net/2015/05/04/dagger-2-even-sharper-less-square/)
* 原文作者 : [Mike Gouline](https://github.com/mgouline)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [lowwor](https://github.com/lowwor) 
* 校对者: [maoruibin](https://github.com/maoruibin)  
* 状态 :  完成 

著名的依赖注入库Dagger的2.0版本变为生产版本只是一个时间问题，这似乎给了我一个写一篇关于它的文章的好理由。

## Dagger 1

在这里，先做一个小小的历史回顾，Dagger是由[Square][1]公司的几个十分优秀的开发人员在2012年创建的，他们觉得将依赖注入应用到Java中是一个非常棒的点子，但是却觉得当时使用的[Guice][2]库（当时的标准）的速度稍微有点慢。所以，他们开发了一个依赖于基于注解的代码生成（JSR-330），拥有着和Guice相似的API，但是性能更强、更加灵活的库。

Dagger的工作原理就是通过声明一些module，这些module里包括了所有你想要注入的依赖的提供者方法（provider method），
把这些module加载到一个对象图谱（object graph）里，最终将图谱中的内容根据需要注入到对象（target）中。
足够简单的结构（当然实现起来还是不那么简单的）有利于开发者解耦他们的代码,并且通过把初始化代码移动到由库自动生成的injector中,从而删掉每个类开始的地方那些丑陋的工厂类初始化代码。

然而，伴随着明显的优点（这些优点足以让大部分的Android开发者选择Dagger作为他们开发新项目中选择使用的第一个库），也存在着一些明显的问题，都是一些不可以简单地被一个或者两个的pull request就解决掉的问题，因为这些问题都是与整个底层架构相关的。

- 图谱（Graph）是在运行时构建的    -影响性能，尤其是在频繁请求的用例中（后台服务器场景），

- 使用了反射（比如说  用```Class.forName()```来获取已经生成的类型） - 使得生成的代码难以跟踪，同时ProGuard配置文件的编写成了噩梦

- 生成的代码不美观 -特别是与那些人手写的工厂类初始化方法相比较时，这一点尤其明显。

因而，在Github的问题跟踪系统中，由于上述问题导致的一些issues，都被标记为“它就是这样的，这个问题会在Dagger2中解决”

## Dagger 2

时间快进到现在，Google的core libraries团队（[Guava][4]的创造者）与原来的Square的创建者一起推出了新一代的Dagger，并在一个月内就发布了生产版本

新的release版本，像之前所承诺的一样，解决了老版本的许多问题：

- 不再使用反射 所有东西都是通过明确的方法调用来完成的（不需要配置ProGuard文件就可以正常混淆）

- 不再在运行时构建图表（graph） - 提高了性能，包括在单请求（per-request）用例中（据[Gregory Kick][5]说，在谷歌的搜索产品中，它的表现比以前快了13%）

- 可追溯的 - 生成的代码更优雅，同时没有使用到反射，使得代码可读性提高，并且容易跟踪



## Usage 用法
虽然Dagger也可以用在任何的Java工程中，但是在示例代码中，我们将专注于它在Android平台上的应用。不过，这些代码都可以很容易的就被改写，以用于其它地方，比如说，改写为服务器后端相关的代码。


## Module
Dagger2中基本保持不变的部分是module。你仍然需要在这里定义可被注入的依赖的提供者方法（provider methods）。比如说，我们需要注入的是```SharedPreferences```对象。

```
@Module
public class ApplicationModule {  
private Application mApp;

public ApplicationModule(Application app) {
mApp = app;
}

@Provides 
@Singleton
SharedPreferences provideSharedPrefs() {
return PreferenceManager.getDefaultSharedPreferences(mApp);
}
}
```
类似的，你可以提供（provide）其他的东西（并不是所有的，只是提供一些想法）

- Context
- System services (e.g. LocationManager)
- REST service (e.g. Retrofit)
- Database manager (e.g. Realm)
- Message passing (e.g. EventBus)
- Analytics tracker (e.g. Google Analytics)

## Component
眼尖的读者可能发现了在```@Module```注解中，```injects = {}```参数不见了，那是因为Dagger2不再需要用到这个参数了。取而代之的是，"component"的概念，component是用来连接module和要注入依赖的对象（target）之间的桥梁。
```
@Singleton
@Component(modules = {ApplicationModule.class})
public interface ApplicationComponent {  
void inject(DemoApplication app);
void inject(MainActivity activity);
}
```

所以，你仍然需要注明（define）你要注入依赖的对象（target），但是，与之前不同的是，如果你现在不注明的话，在编译时就会提示"cannot find method"错误，而这个错误在以前，则是一个隐秘的运行时错误，只有在运行时才会报错。


## Application 应用
下一步，我们要了解的是你的component的容器。具体的方式由你的应用来决定，你可以选择用更复杂的方式保存你的components，但是对于这个例子来说，一个简单的保存在application中的component就足以说明情况了。
```
public class DemoApplication extends Application {  
private ApplicationComponent mComponent;

@Override 
public void onCreate() {
super.onCreate();
mComponent = DaggerApplicationComponent.builder()
.applicationModule(new ApplicationModule(this))
.build();
}

public ApplicationComponent getComponent() { 
return mComponent;
}
}
```

这里没有什么新的东西：只是之前我们创建并初始化的的是对象图谱（```ObjectGraph```），而现在，我们则会创建并初始化对应的component。

注意：你很有可能会在某个时候想到这个问题，我在这先提前解释一下。上面例子中的```DaggerApplicationComponent```是一个编译时生成的类（命名方式是 ```Dagger%COMPONENT_NAME%```），只要你对你的component做了改动，就需要重新编译工程，通过了，这个类才会被生成。所以，如果你找不到这个类，点击你的IDE的"Rebuild Project"，如果编译不出错的话，它就会出现了。类似的，```applicationModule()```方法对应于你的module的名字。


## Injection 注入
终于，经过前面几个部分为注入进行的准备后，我们来到了用到它们的地方了，我们要在activity中注入一个SharedPreferences对象。
```
public class MainActivity extends Activity {  
@Inject SharedPreferences mSharedPrefs;

@Override 
public void onCreate(Bundle savedInstanceState) {
super.onCreate(savedInstanceState);
((DemoApplication) getApplication()).getComponent().inject(this);

mSharedPrefs.edit().putString(“status”, “success!”).apply();
}
}
```
和期待的一样，```@Inject```注解的使用没有任何改变，只是注入本身发生了一点变化。

这里有一点小小的不便，是由于```inject()```方法是强类型关联的，这个我们在后面会讨论到。


**Named injections 命名注入**
如果你有几个对象是同一类型的，比如说两个不同的```SharedPreferences```实例（可能是指向了不同的文件），这时候，我们可以怎么做？
这时候，我们就需要用到命名注入了。只要在module的提供者（provider）里像下面一样使用```@Named```注解

```
@Provides 
@Named(“default”) 
SharedPreferences provideDefaultSharedPrefs() { … }

@Provides 
@Named(“secret”)
SharedPreferences provideSecretSharedPrefs() { … }  
```
在要注入的对象中，注入的方法是一样的
```
@Inject @Named(“default”) SharedPreferences mDefaultSharedPrefs;
@Inject @Named(“secret”) SharedPreferences mSecretSharedPrefs;
```
很简单，没有什么好解释的，但是这是一个非常有用的用法，值得一提。

## Lazy injections 延迟注入
说到性能，如果在一个要注入依赖的对象中，有很多不同的依赖需要被注入，有些依赖只会在某些特定的场景才会被用到（比如说 用户输入的时候）。在这种情况下，如果我们没有用到这个依赖，也要去注入的话，会导致资源的浪费，所以，我们可以选择用延迟注入（lazy injection）替代。
```
@Inject Lazy<SharedPreferences> mLazySharedPrefs;

void onSaveBtnClicked() {  
mLazySharedPrefs.get()
.edit().putString(“status”, “lazy…”)
.apply();
}
```
这里的意思是说，```mLazySharedPrefs```只有在第一次调用```get()```方法的时候才会被注入。之后所有的```get()```调用都会是同一个mLazySharedPrefs实例。

## Provider injections 注入提供者
最后一个诀窍，如果你是在一个全新的你可以完全掌控住的工程中，你想要实现这样的注入的话，你可能会考虑用其它方法来替代，比如说[工厂方法][6]。
但是，对于历史遗留代码来说，这个诀窍将会很有用。

想象这样一个场景，你需要创建一个对象的多个实例，而不是仅仅注入单个实例。在这时候，你需要注入一个提供者（```Provider<T>```）
```
@Inject Provider<Entry> mEntryProvider;

Entry entry1 = mEntryProvider.get();  
Entry entry2 = mEntryProvider.get();  
```
在这个例子中，你的提供者（provider）会创建两个```Entry```对象的实例。有一点要注意的是，module中的实例如何创建完全是由你决定的

## Annoyances 烦人的地方
还好，我真的不能把这个部分叫做问题，因为都是一些不足以称为问题的东西。

**烦人的地方#1：** 像是之前提到的，```inject()```方法与要注入的target，是强类型关联的。这对于debug来说很好，但是这对于我们希望在基类中实现注入的普遍做法变得复杂（如在 base activity，fragment等中）。

直觉上，你觉得应该在基类中创建一个```inject()```方法，但是，这样做的话，它就仅仅会注入那些在基类中声明的依赖，在他的子类中声明的依赖并不会被注入。

解决方法1：这也是我所使用的解决方案，就是在基类中声明一个抽象的注入方法来进行实际上的注入
```
@Override
public void onCreate(Bundle savedInstanceState) {  
super.onCreate(savedInstanceState);
injectComponent(((DemoApplication) getApplication()).getComponent());
}

protected void injectComponent(ApplicationComponent component);  
```
然后在你的子类中实现这个方法
```

@Override
protected void injectComponent(ApplicationComponent component) {  
component.inject(this);
}
```
与Dagger1相比，需要多写一个额外的方法，来实现同样的事情。但是为了可以在编译时查错，这个代价是完全值得的。

解决方法2：另一个选择就是利用反射。如果你看到反射就不想看下去的话，并不怪你：因为这也是Dagger2所提到的点，不利用反射。但是，如果你坚持要在基类中实现注入，而不想在子类中增加额外方法的话，请继续往下看。

这个解决方法简而言之就是要找到你要注入的类型所对应的```inject()```方法。

首先，你要将在component类中声明的所有方法对应上方法的参数类型来保存在缓存中（因为```inject()```方法只能有一个参数，所以只需保存第一个有一个参数的方法就行）
```
// Keep the returned cache in some helper.
Map<Class, Method> buildCache() {  
Map<Class, Method> cache = new HashMap<>();
for (Method m : ApplicationComponent.class.getDeclaredMethods()) {
Class[] types = m.getParameterTypes();
if (types.length == 1) {
cache.put(types[0], m);
}
}
return cache;
}
```
最后，你只要在需要注入依赖的对象（target）中调用```getClass()```，找到缓存中对应的方法，然后使用```invoke()```来调用这个方法就行了。
```
// Use for injecting targets of any type.
void inject(ApplicationComponent component, Object target) {  
Method m = cache.get(target.getClass());
if (m != null) {
m.invoke(component, target);
}
}
```
在这里，我想重申一下,这个解决方法只是为了省几行代码，却对整个流程进行了过度的设计，我个人来说是不会这样做的，但是对于那些想把注入的过程隐藏在基类中，或者是在旧的代码中已经是这样做的人来说，或许会觉得这个方法是有用的。


### Annoyance #2:烦人的地方2：
Component的实现类（比如说：```DaggerApplicationComponent```）只有在重新编译工程之后才能出现，同时如果在编译时出现任何与注入相关的错误的话，都会提示找不到这个类（换句话说，这个类没有被生成）。

我承认这虽然不是什么大问题，但是你会觉得这有点烦，至少在你刚开始使用Dagger2的那几个小时里会这样觉得，尤其是这几个小时还是你对component改动比较频繁的时候。因而，这个问题还是值得提一下的。

解决方法：据我所知，没有。

## Conclusion 结论
我不想在这里长篇大论的总结，所以我会尽可能说的简洁精练

Dagger2是否比原来的版本有明显的进步？是的，提升非常大。

是否还存在问题呢？是的，但是这些问题并没有严重到让你连试都不想试，甚至不会影响到你在生产环境的工程中使用它

## Updates 更新
2015-05-11: 根据Jake Wharton的评论，更正了对Dagger 1中反射使用的陈述。


## Source 源码
[Dagger 2 Demo][7] (GitHub)
## Resources 资源
[Documentation][8]
[Video introduction][9] - by Gregory Kick (Google)


[1]: https://corner.squareup.com/
[2]: https://github.com/google/guice
[3]: https://github.com/google/guava
[4]: https://github.com/google/guava
[5]: https://plus.google.com/+GregoryKick
[6]: http://en.wikipedia.org/wiki/Factory_%28object-oriented_programming%29
[7]: https://github.com/mgouline/android-samples/tree/master/dagger2-demo
[8]: http://google.github.io/dagger/
[9]: https://www.youtube.com/watch?v=oK_XtfXPkqw
