Flux and Android
---

> * 原文链接 : [Flux and Android](http://armueller.github.io/android/2015/03/29/flux-and-android.html)
* 原文作者 : [Austin Mueller](http://armueller.github.io/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 

##Motivation

I recently embarked on a journey to make a new android application for a start-up that I am a part of. Being a software contractor, it is rare that I have the opportunity to build something from scratch. When this opportunity presented itself, I was excited to be able to implement my arsenal of best practices and architecture patterns on the ground floor of a project.

互联网的浪潮让许多IT从业者走上创业的路，我就是其中一员。我最近加入了一个创业公司，并从零开始制作一个产品。过去我一直在做外包，所以很难有机会真正为一个应用实施某种架构或技术。但现在全权负责一个应用开发事务的机会就在我的手中，我对此很激动，也迫不及待要把我这些年通过不断的技术积累所完成的库以及架构模式应用到这个初生的应用之中。


For a large part of the last year I was working on a web project and didn’t have much opportunity to keep up with Android. The team I was on was using [AngularJS](https://angularjs.org/) for the project and we had a heavy focus on making sure that all of our code was like Lego blocks (loose coupling, lots of DI, and side effects only when absolutely necessary). Programming in this way was extremely liberating and I wanted to be able to keep it up after I switched back to Android. This of course, I knew would be no easy task… as if the absence of functions as first class citizens wasn’t depressing enough…

去年的大部分时间我都在开发一个网页项目，而且没有太多的机会让自己保持学习Android方面的新技术。当时和我一起进行开发的团队用 [AngularJS](https://angularjs.org/) 进行开发，在项目的开发过程中，我们最看重的就是确保所有的代码模块能像乐高积木部件一样（低耦合，大量的依赖注入，只有在某种情况下才产生代码副作用）组装成最终的项目。这样写代码能极大程度让开发者在项目的迭代和需求更迭所带来的代码修改、重构中被解放，因此我想要保持这个习惯，并把这种编程思想应用到Android开发中。当然了，这肯定不容易，毕竟罗马不是一天就能建成的。

I decided to start with dependency injection. I knew there were libraries out there to do this in Java and thus android, but I had always struggled with them in the past. After watching a some really great talks…

一番考量后，我决定从依赖注入入手，因为我知道不论是Java抑或是Android，依赖注入都有许多开源的库。但遗憾的是，依赖注入一直是我没有掌握得很好的知识点，所以我阅读了许多优秀的讨论：

- [DAGGER 2 - A New Type of dependency injection by Gregory Kick](https://www.youtube.com/watch?v=oK_XtfXPkqw)
- [The Future of Dependency Injection with Dagger 2 by Jake Wharton](https://www.parleys.com/tutorial/5471cdd1e4b065ebcfa1d557/)
- [Dagger: A Fast Dependency Injector for Android and Java by Jesse Wilson](http://www.infoq.com/presentations/Dagger)
- [Android App Anatomy by Eric Burke](http://www.infoq.com/presentations/Android-Design/)

and reading a few articles…

而且读了一些优秀的博文：

- [Android Dependency Injection](http://blog.andresteingress.com/2014/08/31/android-dependency-injection/)
- [Blog List: Adding a Blog View Activity, Butterknife, and Dagger](http://www.pinnsg.com/blog-list-view-activity-butterknife-dagger/)
- [Dagger 2 has Components](https://publicobject.com/2014/11/15/dagger-2-has-components/)
- [Dependency injection on Android: Dagger (Part 1)](http://antonioleiva.com/dependency-injection-android-dagger-part-1/)
- [Dagger: dependency injection on Android (Part 2)](http://antonioleiva.com/dagger-android-part-2/)
- [Android Unit Test Idioms](http://tech.pristine.io/android-unit-test-idioms/)
- [Android Testing With Robolectric](http://www.peterfriese.de/android-testing-with-robolectric/)

I decided [Dagger 2](http://google.github.io/dagger/) seemed like the right way to go. After a bit more digging I found [Butterknife](http://jakewharton.github.io/butterknife/) for view injection. The biggest problem I ran into was the distinct lack of examples on how to use Dagger 2 effectively (probably because it is still in beta). I did find a few, but they were mostly targeted on how to set it up and not so much on how to use it in an actual android application.

最终我觉得 [Dagger 2](http://google.github.io/dagger/) 会是最切合我的开发思路的依赖注入库，后来我又看了一些相关信息，还用 [Butterknife](http://jakewharton.github.io/butterknife/) 来对 View 进行注入。但现在最大的问题是，我找不到 Dagger 2 各方面相关的最佳用例（可能是 Dagger 2 还处于 Beta 版本的原因）。不过我还是找到了一丢丢的，虽说他们大部分都关注于如何将 Dagger 2 应用到项目中，而不是怎么在实际的 Android 应用被运用。

这些是我找到的一些用例：

- [Dagger 2 - Simple](https://github.com/google/dagger/tree/master/examples/simple)
- [Dagger 2 - Android Simple](https://github.com/google/dagger/tree/master/examples/android-simple)
- [Dagger 2 - Android Activity Graphs](https://github.com/google/dagger/tree/master/examples/android-activity-graphs)
- [U2020](https://github.com/cgruber/u2020)
- [U2021](https://github.com/cgruber/u2020)
- [Android Studio Robolectric Test Example](https://github.com/mutexkid/android-studio-robolectric-example)
- [Tutorial: Set up android + gradle project with dagger](https://github.com/frankdu/android-gradle-dagger-tutorial)
- [Instrumentation Testing with Dagger, Mockito, and Espresso](https://github.com/bryanstern/dagger-instrumentation-example)
- [Dagger2 Example](https://github.com/mgrzechocinski/dagger2-example)
- [SOLID: Noun Project Browser](https://github.com/blad/solid-android)

After I figured out what I wanted to do for dependency injection, I wanted to figure out a good application architecture that would allow for very loose coupling and make it easy to separate view logic from business logic (something I got pretty good at in Angular). Another benefit of having an architecture like this is that it makes TDD much easier… Mocking activities and views just to be able to test that your models behave as they should is absurd.

在我想清楚我想用依赖注入干什么之后，我就开始想应该用一个怎样的软件架构去达到松耦合，并且能让 View 和业务逻辑相互独立（就像我在用 Angular 时做的那样）。实现这样的软件架构还有一个好处就是：简化测试驱动开发……因为如果模拟 Activity 对象和 View 对象只能够进行测试，并且给出相应的测试结果，这样的测试其实是没有什么意义的。

The architecture I decided on was [Flux](https://facebook.github.io/flux/). Obviously, Facebook made the Flux architecture for the web, and thus JavaScript, so I had to do a little bit of adapting in order to get it to work on Android. With a little bit of tweaking (mainly with the dispatcher and they way the views accessed data) and the assistance of [the Otto library](http://square.github.io/otto/) by Square, I came up with a version of Flux that was Android compatible.

最终我决定使用的架构是 [Flux](https://facebook.github.io/flux/)。很显然，Facebook 开发Flux是为了将它应用到网页和javaScript 上，所以如果我想把它应用到Android项目中，就必须这个项目作一定程度的修改。经过一些调整（主要是 dispatcher 和 view 访问数据的方式），结合 Square 开发的 [Otto](http://square.github.io/otto/) 库，Android版的Flux架构库就诞生了。

I finally had come up with something that I thought would work pretty well. However, rather than jump right in and start building an application with an untested architecture pattern and minimal familiarity with Dagger 2, Butterknife, and Otto, I decided to take this idea on a test drive first… I followed Facebook’s (… and everybody else’s) example and built a simple, but fully functional, todo application (Hence the name FluxyTodo). On top of wanting to see how this architecture would pan out, I wanted to provide everybody with another example of how to use Dagger 2, Butterknife, and Otto. Since the examples for these libraries in use are pretty sparse, especially in fully functional applications, I figured it would be a good addition to the community.

后来我又想到了一些有用的东西，但我不敢把这些想法在这个阶段投入到应用的开发中。毕竟我现在使用的架构模式是没有经过测试的，而且我很不熟悉 Dagger 2，Butterknife 和 Otto 这些库，所以我决定以测试驱动的方式决定这些想法的实施。于是我遵循Facebook的用例（还有一些其他人的）创建了一个简单，但功能完备的应用，并把它命名为FluxyTodo。作为最想要看到这种架构模式成功的人，我想要用另一个有关如何组合使用Dagger 2，Butterknife和Otto的例子向所有关注的人证明这个架构的可行性。因为这些库的用例非常少，在功能完备的应用中更甚，我觉得我最终提供的用例肯定会成为Android开发社区的一笔财富。

…Plus if more people adopt this architecture, android development might become a little less painful for everybody!

Now on to the good stuff…

因此，如果越多的人采用这种架构，Android开发就会变得没那么痛苦了。下面来看干货吧！

##Architecture

I came up with this architecture after looking at Flux and trying to apply those concepts to Android, so if you have worked with Flux before, this section will be pretty familiar to you.

Here is the basic architecture template Architecture Template 

在看了 Flux 和尝试把相关概念应用到Android中后，我想到了这个架构，所以如果你以前有用过Flux的话，这部分的内容对你来说会非常熟悉。下面是基本的架构图：

![](http://armueller.github.io/images/Architecture-General.png)

As you can see, it is pretty similar to how Flux works with only a few modifications to make it Android Friendly. The main difference is in how the dispatcher works. Rather than build a dispatcher to mimic the behavior of the one Facebook built, I used an event bus instead (Otto). Another minor difference is that I use models and stores, as opposed to just stores. Stores are dedicated for view state, while models hold other application data and business logic.

如你所见，这和Flux非常相似，毕竟我只是基于Android进行了一点点的修改，主要的区别在于dispatcher的运作方式。没用创建一个dispatcher去模仿Facebook应用创建的行为，我用事件总线代替了这个机制（Otto）。还有一个细微的差别是：我使用了 models 和 stores，而不是只使用 stores。stores 只用于存储 View 的状态，而 models 存储其他应用数据和业务逻辑。

##A detailed explanation of each part of the system
##本系统每个部分的详解

###View

This is what controls what is being displayed to the user. In Android, this means that activities and fragments, along with their xml components, are classified as views. A view should ONLY be responsible for building and displaying what should be presented to the user and listening for actions taken by the user on that view. There should be absolutely no data manipulation or business logic in the view layer. View logic pertaining to view state should also, preferably, be kept to a minimum.

View层一般用于给用户显示界面，在Android系统中，View层的表示就是Activity和Fragment，及它们对应的xml组件。纯理论来看，View的职责只包含创建和显示呈现给用户的界面，并且监听用户在View上的操作并返回用户产生的交互行为。也就是说，在View层绝不应该存在任何数据操作或业务逻辑。View层的逻辑应该尽可能少地与View的状态产生交集。

When the user preforms an action on a part of the view, the view should delegate handling that action to the action creator. If this is done correctly, the view should only ever have to talk to one other thing, the action creator. For example, if a user clicks on an upload button, the view should tell the action creator to create an upload action.

当用户与View的某个区域产生交互，View应该将用户产生的动作交由操作事件产生部件进行处理。假如我们要正确地完成View中产生的动作的事件处理链，View则应该只与一个部件产生内部通信，即操作事件产生部件。举例来说把，假如一个用户点击了上传按钮，那么View应该让行为产生部件创建一个上传行为，以完成用户所需要完成的操作。

As for inflating view elements with data, the view should only have to listen to one source, the data bus. Once the view is created, the view should subscribe to events on the data bus. Once data comes in, the view can then take the data and bind it to whichever view component needs it.

至于在View中填充控件及相关的数据，View则只应该监听一个数据源的状态，数据总线。一旦View被创建，View就应该订阅来自数据总线的事件，当数据总线流入View将用到的数据，View就应该取得该数据，并将它绑定到对应的控件中。

###Action Creator

The action creator has 2 responsibilities. It’s first responsibility is to provide an API for the view to call upon. These API endpoints should correspond to possible actions the user can preform on the view. If you had a calculator app for example, your action creator should have methods such as createAddAction, createSubtractAction, and so on. Depending on how you implemented your calculator, those methods may also take a parameter, for example,
public void createAddAction(float numberToAdd).

The action creator’s second responsibility is to create action objects and post them to the action bus.

操作事件产生部件有两个职责：1、为View提供API，用以响应用户在View上可能产生的操作事件。例如你开发了一个计算器App，相应的操作事件产生部件就应该有 createAddAction, createSubtractAction 等方法，具体有哪些方法依赖于计算器的功能需求，当然了，这些方法可能会需要一个参数，例如 public void createAddAction(float numberToAdd)。

2、创建行为对象，并将它们投递到事件总线上。

###Action Bus

The action bus is the event bus that all actions are posted to. The stores and models listen for specific actions posted to this bus in order carry out view logic or business logic, respectively.

事件总线是所有事件被投递、流动的部件，stores 和 models 监听投递到事件总线上的特定事件。当特定事件产生，就会触发它们处理View的逻辑或业务逻辑。

###Stores & Models

Models are where data is stored and transformed. Models in this case are similar to models in an MVC type framework. Models will subscribe to events posted onto the action bus. To continue with the calculator example, if an AddAction object is posted to the action bus, the model will receive that event, then add a number to whatever the current number is then post the updated data to the data bus.

Stores are different than models in that the data stored in the store is strictly related to the current view state. To continue with the calculator example again, you could have a undo buffer stored in the store, as this data doesn’t relate to the actual application state. As another example, if you had some sort of list app and wanted to be able to live filter that list, your filtered list could be put in the store, while the raw list would be part of a model.

###Data Bus

The data bus is the event bus that all model or store updates are posted to. The view subscribes to data posted on this bus in order to keep the view in sync with the data.

##TDD!

This architecture decouples all the parts of an Android app which makes development much easier. Additionally, DI becomes easier, and practicing TDD becomes much less of a headache!

Following is a diagram illustrating a few recommended approaches to TDD you could take using this architecture. Architecture Template with TDD

![](http://armueller.github.io/images/Architecture-General-TDD.png)

###Views

There are a couple things you want to test in each view component.

- First, you want to make sure that your view component is properly connected to the data bus and that it looks correct once inflated. This can be easily tested by posting test data to the data bus and then testing to make sure that data was used to properly inflate the view.

- Second, you want to make sure that your view component is properly connected to the action creator. Using Mockito, you can spy on the action creator and make sure that when user actions are triggered, the correct action creator method is triggered with the correct data.

Note: I did not implement these tests in my code due to the fact that Robolectric does not yet support API level 21.

###Actions

For each action creator you have, if you have multiple, you should test that each creator method correctly builds the appropriate action and posts it to the action bus. To test this, you can simply call the creator method and listen on the action bus to make sure that the correct action object was posted to the bus and that it contains the correct data.

###Models & Stores

Models and stores are the heart of you application and thus, will require most testing. Each model and store object should be fully unit tested. For simple objects that do not listen to actions or post data to the data bus, standard unit tests will do just fine. For Models and stores that listen for actions and post data to the data bus, along with testing business logic, you need to test that they are properly connected to each bus.

##Implementation
To put this new architecture to the test, I decided to use it for a simple todo app (Really original of me, I know…).

Here is a diagram along with a detailed explanation of how each part works. 

![](http://armueller.github.io/images/Architecture-Impl.png)

Architecture Implementation with a ToDo App If you want even more detail, you can look at the actual code provided in this [repository](https://github.com/armueller/FluxyAndroidTodo).

##Future work

Despite the fact that this app is completely self contained (similar to how the todo app works from Facebook’s Flux), I am pretty satisfied with out it turned out. I came up with a couple different ideas on how server communication might be incorporated into this architecture, but I wasn’t really happy with any of them. Obviously, to be complete, server communication must fit into the equation somewhere, so that’s what I’ll be working on next. Once I come up with a solution that I’m satisfied with, I will update this blog to reflect what I came up with.

##Todo:

- Figure out how to incorporate server communication into architecture
- Set up db at firebase for todos
- Make app sync data to firebase
- Revise blog to incorporate server communication into architecture.
Code

The ToDo app that I wrote to accompany this post can be found [here](https://github.com/armueller/FluxyAndroidTodo)