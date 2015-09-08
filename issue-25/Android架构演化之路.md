Android架构演化之路
---

* 原文链接 : [Architecting Android…The evolution](http://fernandocejas.com/2015/07/18/architecting-android-the-evolution/)
* 原文作者 : [Tuenti](https://twitter.com/tuenti)
* 译文出自 :  [Fernandocejas.com](http://fernandocejas.com/)
* 译者 : [dustookk](https://github.com/dustookk)
* 状态 : 完成

Hey there! After a while (and a lot of feedback received) I decided it was a good time to get back to this topic and ***give you another taste of what I consider a good approach when it comes to architecting modern mobile applications (android in this case)***.

大家好!  过了一好阵子了(在此期间我收到了大量的读者反馈) 我决定是时候回到手机程序架构这个话题上了(这里用android代码举例),  ***给大家另一个我认为好的解决方案.***

Before getting started, I assume that you already read my previous post about Architecting Android…The clean way? If not, this is a good opportunity to get in touch with it in order to have a better understanding of the story I’m going to tell you right here:

在开始之前, 我这里假设大家都读过了我之前[用简洁的办法架构Android程序](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)一文. 如果你还没有读过, 现在应该去读一下那篇文章, 读过之后可以更好的理解我下面要讲的内容.


![上一篇文章截图](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture1.png)

## Architecture evolution

## 架构的演化

Evolution stands for a gradual process in which something changes into a different and usually more complex or better form.

***演化是指一个事物变化成为另一个不同的事物的一个平缓过程, 通常情况下会变得更加复杂或者变成更好.***


Said that, software evolves and changes over the time and indeed an architecture.***Actually a good software design must help us grow and extend our solution by keeping it healthy*** without having to rewrite everything (although there are cases where this approach is better, but that is a topic for another article, so let’s focus in what I pointed out earlier, trust me).


软件开发一直在进化和改变.  ***实际上, 一个好的代码结构必须帮助我们成长, 这意味着不用重新写所有代码就可以扩展功能.*** (尽管有些情况下应该大量的重写代码, 但那又是另一回事了, 这里先不做探讨).

In this article, I am going to walk you through key points I consider necessary and important, ***to keep the sanity of our android codebase.***  Keep in mind this picture and let’s get started.

这篇文章的重点是***如何保持android代码的清晰直观***, 为了阐述这一问题, 我将会带着大家看几个我认为重要的关键点. 记住下面这个图我们就可以开始了.

![Presentation,Domain,Data三层架构示意图](http://fernandocejas.com/wp-content/uploads/2014/09/clean_architecture_android.png)

### Reactive approach: RxJava

### 反应式方法: RxJava


I’m not going to talk about the benefits of RxJava here (I assume you already had a taste of it), since there are a lot articles and badasses of this technology that are doing an excellent job out there. However, I will point out what makes it interesting in regards of android applications development, and how it has helped me evolve my first approach of clean architecture.

在这里我就不讲RxJava的好处了([我猜大家都已经自己体会过了](https://github.com/ReactiveX/RxJava/wiki)) , 因为已经有很多[文章](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/)和[坏蛋们](https://speakerdeck.com/benjchristensen)都讲过了, 而且讲的还都不错. ***这里我要讲的是它是怎么使得android开发变得非常有趣的, 还有它是如何帮助我完成搭建第一个干净简洁的架构的.***


First, I opted for a reactive pattern by converting use cases (called interactors in the clean architecture naming convention) to return Observables<T> which means all the lower layers will follow the chain and return Observables<T> too.


首先, 我选择一个反应式模式让用例(在简洁的架构命名规范中叫做interactor) 都返回Observables<T>, 这样的话所有子类都必须遵守这个规则也返回Observables<T>

        public abstract class UseCase {

        private final ThreadExecutor threadExecutor;
        private final PostExecutionThread postExecutionThread;

        private Subscription subscription = Subscriptions.empty();

        protected UseCase(ThreadExecutor threadExecutor,
            PostExecutionThread postExecutionThread) {
            this.threadExecutor = threadExecutor;
            this.postExecutionThread = postExecutionThread;
        }

        protected abstract Observable buildUseCaseObservable();

        public void execute(Subscriber UseCaseSubscriber) {
            this.subscription = this.buildUseCaseObservable()
            .subscribeOn(Schedulers.from(threadExecutor))
            .observeOn(postExecutionThread.getScheduler())
            .subscribe(UseCaseSubscriber);
        }

        public void unsubscribe() {
            if (!subscription.isUnsubscribed()) {
                subscription.unsubscribe();
                }
            }
        }

As you can see here, all use cases inherit from this abstract class and implement the abstract method ***buildUseCaseObservable()*** which will setup an ***Observable<T>*** that is going to do the hard job and return the needed data.

可以看出,所有的子用例都继承自这个抽象类,并在***buildUseCaseObservable()***这个抽象方法中构造一个可以完成耗时操作并返回需要数据的***Observable<T>***

***Something to highlight is the fact that on execute() method, we make sure our Observable<T> executes itself in a separate thread***, thus, minimizing how much we block the android main thread. The result is push back on the Android main thread through the android main thread scheduler.

***需要注意的是execute()这个方法, 我们保证了Observable<T>让自己执行在一个单独的线程中***, 这样的话就可以最小限度的减少在主线程耗时.  然后通过主线程的scheduler机制把Observable<T>的执行结果返回给主线程.


***So far, we have our Observable<T> up and running, but, as you know, someone has to observe the data sequence emitted by it***. To achieve this, I evolved presenters (part of ***MVP*** in the presentation layer) into ***Subscribers*** which would ***“react”*** to these emitted items by use cases, in order to update the user interface.

Here is how the subscriber looks like:

***到现在为止, 我们已经有了Observable<T> , 但是它产生的数据得有人来处理*** . 所以我这里将presenter(***MVP*** 三层架构中的presentation层的一部分)改为了 ***Subscribers*** ,当用例产生数据后可以及时更新UI.

也就是下面这样的subscriber:

        private final class UserListSubscriber extends
            DefaultSubscriber<List<User>> {

          @Override public void onCompleted() {
              UserListPresenter.this.hideViewLoading();
          }

          @Override public void onError(Throwable e) {
                UserListPresenter.this.hideViewLoading();
                UserListPresenter.this.showErrorMessage(new DefaultErrorBundle((Exception) e));
                UserListPresenter.this.showViewRetry();
          }

          @Override public void onNext(List<User> users) {
                UserListPresenter.this.showUsersCollectionInView(users);
            }
        }



Every subscriber is an inner class inside each presenter and implements a ***DefaultSubscriber<T>*** created basically for default error handling.

After putting all pieces in place, you can get the whole idea by having a look at the following picture:


DefaultSubscriber<T>只是简单实现了对错误的处理, 每一个subscriber都是presenter中的一个继承自 ***DefaultSubscriber<T>*** 的内部类.

从下面这张图中, 你可以得到一个比较完整的思路.

![使用RxJava的完整思路](http://fernandocejas.com/wp-content/uploads/2015/07/clean_architecture_evolution.png)

Let’s enumerate a bunch of benefits we get out of this RxJava based approach:

我们来总结一下RxJava带给我们的好处:

* ***Decoupling between Observables and Subscribers***: makes maintainability and testing easier.
* ***实现了Observables 和 Subscribers的解耦***: 保持了结构稳定并简化了测试.

* ***Simplified asynchronous tasks***: java threads and futures are complex to manipulate and synchronize if more than one single level of asynchronous execution is required, so by using schedulers we can jump between background and main thread in an easy way (with no extra effort), especially when we need to update the UI. We also avoid what we call a “callback hell”, which makes our code unreadable and hard to follow up.

* ***使得异步任务变得简单***: 多层异步任务被执行时, java的thread和future的操作和同步会变得非常复杂, 使用 scheduler 可以让我们在异步线程和主线程之间跳转变得非常简单(省去了多余的步骤), 特别是我们需要更新UI界面的时候. 同时也避免了使代码变成非常难以理解的"回调地狱".

* ***Data transformation/composition***: we can combine multiple Observables<T>  without affecting the client, which makes our solution more scalable.

* ***数据的传递/组合***: 我们可以使多个Observables<T>组合起来而不影响到client端, 这样提高了整套解决方案的可扩展性.

* ***Error handling***: a signal is emitted to the consumer when an error has occurred within any Observable<T>.

* ***异常处理***: 任何一个Observable<T>.出现异常都会通知到consumer.

From my point of view there is one drawback, and indeed a price to pay, which has to do with *** the learning curve for developers who are not familiar with the concept***. However, you get very valuable stuff out of it. ***Reactive for the win!***

从我的角度看这里有一个小问题, 也是必须要付出的代价, 就是***对这一概念不太熟悉的开发者的学习过程***. 但是你会从中学到非常有价值的内容.  ***为了成功学习Reactive吧!***


### Dependency Injection: Dagger 2

### 依赖注入: Dagger 2

I’m not going to talk much of dependency injection cause *** I have already written a whole article***, which I strongly recommend you to read, so we can stay on the same page here.

我这里不会讲太多关于依赖注入的例子, 因为我之前写过[一篇专门说依赖注入的文章](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/), 为了跟上我这里的脚步, 强烈推荐大家读一读这篇文章.

Said that, it is worth mentioning, that by implementing a dependency injection framework like Dagger 2 we gain:

值得强调的是, 像Dagger 2一样的依赖注入框架可以带给我们:

* ***Components reuse***, since dependencies can be injected and configured externally.

* ***组件的重用***, 因为依赖可以被从外部配置和注入.

* When injecting abstractions as collaborators, we can just change the implementation of any object without having to make a lot of changes in our codebase, since that ***object instantiation resides in one place isolated and decoupled***.

* 最为合作者对抽象进行依赖注入时, 我们可以单单修改任何对象的实现, 而不用大量修改底层代码, 因为***类的实现对象独立而解耦的存在于另一个地方***.

* Dependencies can be injected into a component: ***it is possible to inject mock implementations of these dependencies which makes testing easier***.

* 依赖可以被注入到组件中去: ***注入依赖的测试实现是有可能的, 这就使得测试变得更加容易.***

### Lambda expressions: Retrolambda

### Lambda 表达式: Retrolambda

***No one will complain about making use of Java 8
 lambdas in our code*** ,  and even more when they simplify it and get rid of a lot of boilerplate, as you can see in this piece of code:

***没有人会反对在我们的代码中使用Java 8 的 Lambdas***, 使用Lambdas可以省去大量的样板代码, 就像下面的代码块:

        private final Action1<UserEntity> saveToCacheAction =
            userEntity -> {
                 if (userEntity != null) {
                     CloudUserDataStore.this.userCache.put(userEntity);
                 }
           };

***However, I have mixed feelings here and will explain why*** . It turns out that at [@SoundCloud](https://developers.soundcloud.com/blog/) we had a discussion around [Retrolambda](https://github.com/orfjackal/retrolambda), ***mainly whether or not to use it*** and the outcome was:

但是这个问题我非常纠结. 在我们[@SoundCloud](https://developers.soundcloud.com/blog/), 曾经有过一次关于
 [Retrolambda](https://github.com/orfjackal/retrolambda)的讨论, ***主要的分歧是要不要用它*** 讨论的结果是:

 1. Pros:
 1. 利:
     * Lambdas and method references.
     * Lambda 和方法的引用
     * Try with resources.
     * 尝试着用资源的方式.
     * Dev karma

 2. Cons:
 2. 弊:
     * Accidental use of Java 8 APIs.
     * java 8新特性的意外使用.
     * 3rd part lib, quite intrusive.
     * 第三方jar包很扰人.
     * 3rd part gradle plugin to make it work with Android.
     * 要在Android工程中使用它,必须引入第三方gradle插件.

Finally we decided it was not something that would solve any problems for us: ***your code looks better and more readable but it was something we could live without, since nowadays all the most powerful IDEs contain code folding options which cover this need, at least in an acceptable manner.***

最终我们决定Retrolambda并不是一个能解决我们任何问题的库: ***使用了Retrolambda后代码的确好看易理解, 但这对我们来说并不是必须的, 因为现在大部分的IDE已经可以是实现这一功能, 至少是以可以接受的方式***

Honestly, the main reason why I used it here, was more to play around it and have a taste of lambdas on Android, although ***I would probably use it again for a spare time project***. I will leave the decision up to you. I am just exposing my field of vision here. ***Of course the [author](https://github.com/orfjackal) of this library deserves my kudos for such an amazing job***.

老实说, 我在这里提到Retrolambda的主要原因是想用一用它, 体验一把在Android代码里使用lambda是什么感觉. 也许***在我的业余项目中可能会用到这个库***. 我只是把我的想法放在这里, 用不用它的最终决定权在大家手里. ***当然了, 该[作者](https://github.com/orfjackal)创造了这么伟大的一个库也非常值得赞扬***



### Testing approach
### 测试途径

In terms of testing, not big changes in relation with the first version of the example:

说到测试, 和之前的例子并没有什么太大的不同.

* ***Presentation layer***: UI tests with Espresso 2 and Android Instrumentation.

* ***Presentation层*** : 用Espresso 2 和 Android Instrumentation 测试UI界面.

* ***Domain layer:*** JUnit + Mockito since it is a regular Java module.

* ***Domain 层:*** 因为只是正常的java模块,所以用JUnit + Mockito测试就好了.

* ***Data layer***: Migrated test battery to use Robolectric 3 + JUnit + Mockito. Tests for this layer used to live in a separate Android Module, since back then (at the moment of the first version of the example), ***there was no built-in unit test support and setting up a framework like robolectric was complicated and required a serie of hacks to make it work properly.***

* ***Data层***: 用 Robolectric 3 + JUnit + Mockito做迁移测试. 因为以前(案例第一个版本的时候)***没有内置单元测试支持,手动构造一个类似robolectric的框架非常复杂而且为了使它正常工作,还要一系列hack操作.***

Fortunately that ***is part of the past*** and now everything works out of the box so I could relocated them inside the data module, specifically into its default test location: ***src/test/java*** folder.


庆幸的是那都过去了, 现在所有的东西都可以直接用, 所以我重新把它们放在了数据模块中, 特别是可以放在默认的测试文件夹 ***src/test/java*** 下.


### Package organization

### 包结构组织

I consider code/package organization one of the key factors of a good architecture: ***package structure is the very first thing encountered by a programmer when browsing source code***.  Everything flows from it. Everything depends on it.

我认为代码/包的组织是一个良好架构的关键要素之一: ***包结构是一个程序员看项目代码时最先注意到的*** 其他的一切要素都由它而来,也都取决于它.


We can distinguish between ***2 paths*** you can take to divide up your application into packages:

下面是组织包结构常见的两种方式:

* ***Package by layer***: Each package contains items that usually aren’t closely related to each other. This results in packages with low cohesion and low modularity, with high coupling between packages. As a result, editing a feature involves editing files across different packages. In addition, deleting a feature can almost never be performed in a single operation.


* ***根据层级关系的不同***: 单独看每个包下面的代码通常情况下并没有什么联系, 这就降低了单个包里的内聚性和模块性,而提高了包与包之间的耦合程度. 修改一个功能需要同时修改多个包下的多个文件.而且, 要删除一个功能也变得不是那么简单.

* ***Package by feature***: It uses packages to reflect the feature set. It tries to place all items related to a single feature (and only that feature) into a single package. This results in packages with high cohesion and high modularity, and with minimal coupling between packages. Items that work closely together are placed next to each other. They aren’t spread out all over the application.

* ***根据功能的不同***: 根据不同的包名可以找到对应的功能, 将功能(而且是只有此功能)下的所有组件全都放在了一起. 这就提高了包里的内举性和模块性,而降低了包与包之间的耦合程度. 将协同工作的代码放在了一起,而不是将它们分布在程序的各个地方.


***My recommendation is to go with packages by features*** , which bring these main benefits:

***我的建议是根据功能的不同来组织包结构***, 可以带来下面这些好处:

* ***Higher Modularity***

* ***更完善的模块化***

* ***Easier Code Navigation***

* ***代码更加容易查阅***

* ***Minimizes Scope***

* ***最小化代码的作用域***



It is also interesting to add that if you are working with ***feature teams*** (as we do at [@SoundCloud](https://twitter.com/soundcloud)), ***code ownership will be easier to organize and more modularized***, which is a win in a growing organization where many developers work on the same codebase


有趣的是, 如果你在一个所谓的 ***功能性团队*** 工作,(比如[@SoundCloud](https://twitter.com/soundcloud)), ***代码结构的分配会变得更加容易更加模块化***, 如果许多工程师在同样的基础代码上开发时这个优点就变得格外明显.


![包结构组织样图](http://fernandocejas.com/wp-content/uploads/2015/07/package_organization-795x1024.png)

As you can see, my approach looks like packages organized by layer: ***I might have gotten wrong here (and group everything under ‘users’ for example)*** but I will ***forgive myself in this case*** , because this sample is for learning purpose and what I wanted to expose, were the main concepts of the clean architecture approach. ***DO AS I SAY, NOT AS I DO*** :).


大家可以看出, 我的包结构看起来像是根据层级关系组织的: ***这里可能有举例不太恰当的地方(比如将一切都放在'user'下面)*** 但是我会***原谅自己这一次***, 因为举这个例子是为了供大家学习,为了表达我的观点,主要目的是包含简洁的架构思路. ***照我说的做, 而不是照我做的做*** :)


### Extra ball: organizing your build logic

### 附加彩蛋: 组织你的打包逻辑

***We all know that you build a house from the foundations up*** . The same happens with software development, and here I want to remark that, from my perspective, ***the build system (and its organization) is an important piece of a software architecture***.


***我们都知道房子都是从地基开始修筑的***. 软件开发也是一个道理, 我这里要强调的是,  ***代码架构中, 打包系统(及其组织架构)是非常重要的一部分***


On Android, we use gradle, which is a platform agnostic build system and indeed, very powerful. The idea here is to go through ***a bunch of tips and tricks*** that can simplify your life when it comes to how organize the way you build your application:


在Android开发中, 我们使用一个叫做gradle的非常强大的打包系统.  这里有 ***一系列窍门*** 帮助大家在组织打包脚本时变得格外轻松:



* Group stuff by functionality in separate gradle build files.

* 根据功能的不同, 将打包系统分成多个脚本文件.

![脚本结构截图](http://fernandocejas.com/wp-content/uploads/2015/07/gradle_organization-283x300.png)

ci.gradle:

        def ciServer = 'TRAVIS'
        def executingOnCI = "true".equals(System.getenv(ciServer))

        // Since for CI we always do full clean builds, we don't want to pre-dex
        // See http://tools.android.com/tech-docs/new-build-system/tips
        subprojects {
          project.plugins.whenPluginAdded { plugin ->
            if ('com.android.build.gradle.AppPlugin'.equals(plugin.class.name) ||
                'com.android.build.gradle.LibraryPlugin'.equals(plugin.class.name)) {
              project.android.dexOptions.preDexLibraries = !executingOnCI
            }
          }
        }

build.gradle:

        apply from: 'buildsystem/ci.gradle'
        apply from: 'buildsystem/dependencies.gradle'

        buildscript {
          repositories {
            jcenter()
          }
          dependencies {
            classpath 'com.android.tools.build:gradle:1.2.3'
            classpath 'com.neenbedankt.gradle.plugins:android-apt:1.4'
          }
        }

        allprojects {
          ext {
        	...
          }
        }
        ...


Thus, you can use “***apply from: ‘buildsystem/ci.gradle’***” to plug that configuration to any gradle build file. ***Do not put everything on only one build.gradle file otherwise you will start creating a monster. Lesson learned.***

如上图, 你可以利用 "***apply from: 'buildsystem/ci.gradle'***" 将配置文件导入任意build脚本中. ***不要将所有打包脚本写在一个build.gradle文件中, 否则你会慢慢制造出一个怪物. 我已经受过教训了***.

* Create maps of dependencies
* 将依赖整合到map中

dependencies.gradle:

        ...

        ext {
          //Libraries
          daggerVersion = '2.0'
          butterKnifeVersion = '7.0.1'
          recyclerViewVersion = '21.0.3'
          rxJavaVersion = '1.0.12'

          //Testing
          robolectricVersion = '3.0'
          jUnitVersion = '4.12'
          assertJVersion = '1.7.1'
          mockitoVersion = '1.9.5'
          dexmakerVersion = '1.0'
          espressoVersion = '2.0'
          testingSupportLibVersion = '0.1'

          ...

          domainDependencies = [
              daggerCompiler:     "com.google.dagger:dagger-compiler:${daggerVersion}",
              dagger:             "com.google.dagger:dagger:${daggerVersion}",
              javaxAnnotation:    "org.glassfish:javax.annotation:${javaxAnnotationVersion}",
              rxJava:             "io.reactivex:rxjava:${rxJavaVersion}",
          ]

          domainTestDependencies = [
              junit:              "junit:junit:${jUnitVersion}",
              mockito:            "org.mockito:mockito-core:${mockitoVersion}",
          ]

          ...

          dataTestDependencies = [
              junit:              "junit:junit:${jUnitVersion}",
              assertj:            "org.assertj:assertj-core:${assertJVersion}",
              mockito:            "org.mockito:mockito-core:${mockitoVersion}",
              robolectric:        "org.robolectric:robolectric:${robolectricVersion}",
          ]
        }

build.gradle:

        apply plugin: 'java'

        sourceCompatibility = 1.7
        targetCompatibility = 1.7

        ...

        dependencies {
          def domainDependencies = rootProject.ext.domainDependencies
          def domainTestDependencies = rootProject.ext.domainTestDependencies

          provided domainDependencies.daggerCompiler
          provided domainDependencies.javaxAnnotation

          compile domainDependencies.dagger
          compile domainDependencies.rxJava

          testCompile domainTestDependencies.junit
          testCompile domainTestDependencies.mockito
        }


***This is very useful if you wanna reuse the same artifact version across different modules in your project*** , or maybe the other way around, where you have to apply different dependency versions to different modules. Another plus one, is that ***you also control the dependencies in one place*** and, for instance, bumping an artifact version is pretty straightforward.



***如果你希望在不同的模块中重复利用相同的依赖的版本,上面的建议就会变得非常有用***  或者你想将不同的依赖版本放到不同的模块中去也是一样的. 另一个好处是 ***可以在一个地方控制所有的依赖***


### Wrapping up

### 总结

That is pretty much I have for now, and as a conclusion, keep in mind ***there are no silver bullets. However, a good software architecture will help us keep our code clean and healthy, as well as scalable and easy to maintain.***

这差不多就是我要说的了, 大家要记住 ***并没有包治百病的药, 但是一个好的程序架构可以帮助我们保持代码的整洁和健康, 同时也保证整了灵活性和可维护性***


There is a few more things I would like to point out and they have to do with attitudes you should take when facing a software problem:

下面是一些我想指出的当你遇到程序问题时应有的态度:

* ***Respect SOLID principles.***

* ***遵守 SOLID 原则***

* ***Do not over think (do not do over engineering).***

* ***不要想的太多(不要过度开发)***

* ***Be pragmatic.***

* ***要实际***


* ***Minimize framework (android) dependencies in your project as much as you can.***

* ***最大限度的在工程中减少对 android 框架的依赖***


### Source code

### 源代码

1. [Clean architecture github repository – master branch](https://github.com/android10/Android-CleanArchitecture)

2. [Clean architecture github repository – releases](https://github.com/android10/Android-CleanArchitecture/releases)


### Further reading:
### 更多阅读:

1. [Architecting Android..the clean way](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)
2. [Tasting Dagger 2 on Android](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)
3. [The Mayans Lost Guide to RxJava on Android](https://speakerdeck.com/android10/the-mayans-lost-guide-to-rxjava-on-android)
4. [It is about philosophy: Culture of a good programmer](https://speakerdeck.com/android10/it-is-about-philosophy-culture-of-a-good-programmer)

### References

### 引用

1. [RxJava wiki by Netflix](https://github.com/ReactiveX/RxJava/wiki)
2. [Framework bound by Uncle Bob](https://blog.8thlight.com/uncle-bob/2014/05/11/FrameworkBound.html)
3. [Gradle user guide](https://docs.gradle.org/current/userguide/userguide.html)
4. [Package by feature, not layer](http://www.javapractices.com/topic/TopicAction.do?Id=205)
