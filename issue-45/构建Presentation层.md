构建Presentation层
---

> * 原文链接 : [Modeling my presentation layer](http://panavtec.me/modeling-presentation-layer/)
* 原文作者 : [panavtec](http://panavtec.me/author/christianpanadero/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成

After [modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/) here it
comes, modeling my presentation layer. The reason for this post is that
I saw in many projects that are moving from a legacy codebase to an MVP
approach that there are some issues trying to differentiate what belongs
to the presentation layer and what belongs to the UI layer. In my
previous project, I saw also a comment that was telling: “I cannot grave
in a stone what is a business rule”. This is very bad if you are not
able to recognize what belongs to your domain you are going to make
mistakes while you separate the responsibilities. Why are you trying to
make a Clean approach without knowing the very basics?  
在构建domain层的文章之后，我们接下来说说构建presentation层。我之所以写这篇文章是因为看到有大量的工程从已有代码迁移到MVP结构时，对于什么该属于presentation层，什么该属于UI层的划分有不清晰。我在之前的项目中看到一个评论：“” 。如果你不能区分什么是属于domain层的，那么在分离责任时，你就会犯错，这是很糟糕的事情。你为什么要在不清楚最基本逻辑的情况下试图创建一个清晰的结构。

I’m going to give you some examples and how I solved it. This article is
more about to get the concepts clear, the implementation is not really
important, you can achieve it in many ways.  
下面我会给出一些案列以及我是如何解决的。这篇文章主要是理清概念，你可以用多种方式来实现。

Android view vs View vs Screen
------------------------------
Android view vs View vs Screen
------------------------------

-   **Android view**: Just an Android component, something that extends
    from android.view.View
-   **View**: The view interface to communicate from your presenter to
    your view implementation, it can be implemented in your preferred
    Android component, sometimes is better to use an Activity others a
    Fragment or maybe a Custom View.
-   **Screen**: A screen is more a user concept, the user gets the
    feeling that the phone is navigating between windows, but we can
    represent this in Android with Activities or replacing
    fragments/views in the same Activity. So it depends on the
    perception that the user gets and usually represents all the content
    that you can see in the view.  
- **Android view**：Android的组件，继承自android.view.view。
- **View**：presenter和视图实现间的通讯接口，你可以在你喜欢的Android组件中实现它，有时使用Activity是个好的选择，有时则是Fragment或是一个自定义视图。
- **Screen**：界面更多是一个用户层面的概念，用户通过界面感知到正在不同窗口中切换，但是在Android中我们可以使用Activity来表示它，或者是在同一Activity下替换fragments/views。所以界面完全依赖于用户的感知，通常就是你能在视图中看到的所有内容。

Navigation to a different screen
--------------------------------
导航到不同的界面
-------------

A navigation between two screens can be between two fragments, two
activities, open a dialog, open an activity, etc… How this is achieved
is an implementation detail, and is the responsibility of our delivery
mechanism. But what about the action to navigate from a screen to
another? That action is the responsibility of our presentation layer.
*Our presenter should know about **what** to do and our implementation
**how** to do it*. In this case: What to do? To navigate to another
screen and how to do it? Open a new Activity. Then, we have a problem,
as I said before my presentation is pure java, so I can’t use any
android related stuff in my presenter, how to achieve this? Using an
abstraction. You can create an interface called NavigationCommand with a
simple method navigate() and call that method when is needed from our
presenter and implement this interface in our Android module. Assuming
that we have Activity A that wants to navigate to Activity B when a
button is clicked, here is the sequence of how it will work:  
两个界面间的切换可以是两个fragment之间，两个activity之间，打开一个dialog，打开一个activity等等。这是如何做到的属于实现的细节，是传递机制的责任。但是导致界面切换的行为呢？这个行为就是我们presentation层的责任。我们的presenter应该知道要**做什么**和我们的实现**如何**去做。这个列子中，要如何做呢？如何导航到另一个界面呢？打开一个新的activity，然后，问题来了，我之前说过我的presentation层是纯java的，所以我不能使用任何Android相关的东西，这如何实现呢？使用抽象。你可以创建一个只有navigate方法的NacigationCommand接口，在需要时调用它，在视图层实现它。假设我们有一个Activity A要在按钮点击后跳转Activity B，下面是序列图。

![navigation\_command\_sequence](http://panavtec.me/wp-content/uploads/2016/02/navigation_command_sequence.png)

The code will look like:
代码是这样的：

**Android module (View layer)**

	public class ActivityA extends Activity {
		@OnClick(R.id.someButton)
 		public void onSomeButtonClicked() {
    		presenter.onSomeButtonClicked();
 		}
 	}

	public class ToActivityB implements NavigationCommand {
  		private final Activity currentActivity;

  		public ToActivityB(Activity activity) {
     		currentActivity = activity;
  		}

  		@Override
  		public void navigate() {
     		currentActivity.startActivity();
  		}
	}

**Java module (Presentation layer)**

	public interface NavigationCommand {
 		public void navigate();
	}

	public class PresenterA {
 		private final NavigationCommand toBNavigation;

 		public PresenterA(NavigationCommand toBNavigation) {
    		this.toBNavigation = toBNavigation;
 		}

 		public void onSomeButtonClicked() {
    		toBNavigation.navigate();
 		}
	}

With this approach, we are decoupling responsibilities between different
layers. We extracted the navigation to a class that we can reuse
everywhere in our project to navigate to our Activity B. We can test our
presenter to invoke the navigation command and if we change the way of
displaying that screens (from Activities to Fragments for ex) our
presentation layer will not change. Long live to the [Open
close](https://en.wikipedia.org/wiki/Open/closed_principle) principle!  
通过这种处理，我们解耦了不同层之间的责任。我们把导航操作提取成一个可以在项目中复用的类。我们可以测试我们的presenter来调用导航命令，如果，我们更改了界面的展现形式（例如从Activities转换为Fragments）。开闭原则万岁！

Another problem that I faced is when you have two or more Navigation
Commands in the same presenter, the parameters to construct that
presenter can become weird:
另一个问题是如果你在一个presenter中有多个导航命令，那么构造函数的参数会变得很奇怪

	public class PresenterA {
 		private final NavigationCommand toBNavigation;
 		private final NavigationCommand toCNavigation;

 		public PresenterA(NavigationCommand toBNavigation, NavigationCommand toCNavigation) {
    		this.toBNavigation = toBNavigation;
    		this.toCNavigation = toCNavigation;
 		}
	}

For the client that instantiates this presenter is hard to know the
order of the navigation commands, you only can rely on the name. But we
can have another interface to inherit from NavigationCommand to
represent that subtype of Navigation. Another solution if you are using
dependency injection can it be to implement a
[Qualifier](https://docs.oracle.com/javaee/6/tutorial/doc/gjbck.html) to
specify which type of parameter you need to pass.   
实例化这个presenter时很难知道导航命令参数的顺序，你只能依靠命名来区分。但是我们可以定义一个继承自NavigationCommand接口的接口来表示导航的子类型。另一个解决方法是，如果你在使用依赖注入，那能不能实现一个[Qualifier](https://docs.oracle.com/javaee/6/tutorial/doc/gjbck.html)来指定你需要传递那种类型的参数。

There are some cases where you will need to navigate with a parameter to
the screen A to the screen B, then we can modify our NavigationCommand
to represent the dependencies that we need to navigate:  
某些场景下你可能需要导航到界面A或者界面B，那么我们可以修改NavigationCommand接口。

	public interface ToScreenBNavigationCommand extends NavigationCommand {
 		void setMyParameterToNavigate(String parameter);
	}

If we do that, we can use that method from our presenter before call
navigate() to set up our navigation.
如果我们这么做，那么我们就可以在调用navigate方法前先设定好我们的目的地。

Credits of this idea goes to [Pedro](https://twitter.com/pedro_g_s) who
has implemented this in his project
[EffetiveAndroidUI](https://github.com/pedrovgs/EffectiveAndroidUI/blob/1dadd276b094dffed2ae2e88602925c173ab59d7/app/src/main/java/com/github/pedrovgs/effectiveandroidui/ui/viewmodel/action/ActionCommand.java)  
这个想法来自于[Pedro](https://twitter.com/pedro_g_s)，他在自己的项目[EffetiveAndroidUI](https://github.com/pedrovgs/EffectiveAndroidUI/blob/1dadd276b094dffed2ae2e88602925c173ab59d7/app/src/main/java/com/github/pedrovgs/effectiveandroidui/ui/viewmodel/action/ActionCommand.java)中已经实现了.

More than one View in the same screen
-------------------------------------
一个界面中有多个View
-----------------

There are many Android components that can be view elements, it does not
matter for our Presenters. Remember that a View is like a contract that
our presenters work with. Can we have more than 1 view on the same
screen? For sure yes! How I can have more than 1 view/presenter in one
Activity? Well, let’s consider the Browse Spotify’s screen for this
example:  
有很多Android组件可是作为视图元素，这都不是presenter要关心的。记住View就像是presenter使用的契约。我们的一个界面中可以有多个view吗？当然可以！我如何在一个Activity中拥有多个view/presenter呢？让我们来看看Spotify的浏览界面。

![Spotify
app](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-18-48-45.png)

In my way to see this screen we have a horizontal slider with different
playlists, then we have a menu with some options available in this
browse music concept and at the bottom, we have the current playing
song. In this screen, we clearly have different concepts and in my way
to see how this screen works, the concepts are not related to each
other, so let’s consider to have a view/presenter for every concept that
we talked about:  
在我看来，这个界面有一个水平滚动的播放列表，然后是有些操作的菜单，底部是当前播放的歌曲。在这个界面中，我们可以清晰的看到多个概念，用我的方式来看这个界面，各个概念是没有关联的。所以让我们来考虑一些为每个概念实现一个view/presenter。

![browse\_colored](http://panavtec.me/wp-content/uploads/2016/02/browse_colored.png)

So why to create that structure, it is not the same to create one
Presenter to have all the actions and some custom views? Think who is
the responsible for fulfilling that views and if you want to reuse that
component how you will achieve that. Probably RecommendedPlayLists is
hitting the network to get the recommended playlist for the current
user, it does not make sense if we create a custom view group with a
presenter in order to achieve that? It can be reused everywhere. What
about the browse menu? this is another concept of the view, it is just a
menu that when you hit an item it will navigate to another screen (using
a navigation command!). And finally, the current playing song that for
sure it will be reused in other places.  
那么为什么创建那样的结构，这和创建一个Presenter包含所有的行为和自定义视图有什么区别？那么考虑一下谁负责填充视图，如果你打算重用这个组件你如何才能做到。

As you can see a screen can have more than one View / Presenter because
a screen can be a summary of other things and can have more than one
responsibility, this thing really depends on the design. (Remember that
a
[responsibility](https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)
is a “reason to change”, and each of these views could change for
several reasons)  
如你所见，一个界面可以包含多个View/Presenter，因为界面是其他的汇总，而且会有多个责任，这完全依赖于设计。(记住一个[责任](https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)就是一个变化的原因，这里的视图可能因为多种原因而变化。)

Can we have 2 implementations for the same view?
------------------------------------------------
一个view可以有两种实现吗？
---------------------

Yes! we can have multiple implementations for the same presenter view,
for example in the Spotify app, the screen that I have shown you has a
view that controls the current song and displays the song information,
but if we click in that view we get:  
当然！一个view接口可以有多种实现。比如在Spotify中，我展示给你的那个界面可以控制当前的播放和展示歌曲信息，但是我们点击这个区域的话，就会跳转：

![current playing
song](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-21-24-51.png)

It is not the same but with a different way to show it? So maybe we can
reuse the same presenter and re-implement the view interface in a
different Android component. But, this screen seems to have some extra
functions, would you put those new functions in the same presenter? It
depends on the case you have multiple alternatives: you can compose a
presenter with different actions, use two different presenters one for
the actions and other for the presentation, or simply have one presenter
with all the actions because it represents the same concept. Remember
that there is no perfect solution, software is about trade-offs.  
这两者不就是一样的但是使用了不同的展示方式吗。所以也许我们可以复用presenter，使用不同的Android组件来实现view接口。但是，这个界面

But, it’s fair to say that this is not a common case, usually, a
Presenter has only 1 view implementation.  
但是，这确实不是常见情况，通常一个Presenter只有一个view接口实现。

MVP composition
---------------
MVP组成
------

To summarize what we have seen so far:  
总结下目前我们都经历了什么

-   A view uses 1 presenter
-   A screen can have 1-n views/presenters
-   A view can be re-implemented 1-n times to use with the same
    presenter
-   An Android component can implement 1 view. If you are implementing 2
    view interfaces, maybe is because those two views are better to be
    together as a whole concept or you need to separate the view
    implementations in two separate android views
- view接口实现和presenter一对一
- 一个界面拥有多个views/presenters
- 一个view接口可以有多重实现方式来对应同一个presenter
- 一个Android组件可以实现一个视图接口。

Let’s move forward to other key concepts:  
让我们再来看看其他的关键点

Presenter lifecycle
-------------------
Presenter生命周期
----------------

The following screenshot is from Citymapper, when you hit the “Get me
somewhere” button opens a screen where you can choose the start and end
positions of your trip:  
下面是一张来自Citymapper的截图，当你点击“Get me somewhere”按钮后，会展示一个可以选择起点和终点的界面：

![citymapper\_getmesomewhere](http://panavtec.me/wp-content/uploads/2016/02/citymapper_getmesomewhere.png)

How will you decompose this screen? The first thing that comes into my
mind is: Does the concept of start location make sense without an end
location? I don’t think so, I would create one presenter “PickLocation”
that knows about when the start and end locations are filled. An
activity with 2 fragments in a view pager should do the job in the view
layer, both fragments can access the same presenter and call
“presenter.startLocationChanged()” and “presenter.endLocationChanged()”.  
你如何分解这个界面？我首先想到的是，开始位置在没有结束位置时是否还有意义？我认为没有。我会创建一个“PickLocation” presenter，它可以获知何时开始和结束位置被填写了。一个Activity内部包含一个有两个fragment的view pager可以满足视图层的实现。两个fragment都可以接触到同一个presenter并且调用“presenter.startLocationChanged()”和“presenter.endLocationChanged()”。

What if the design changes and now instead of having 2 tabs, we decide
that is better to navigate like 2-steps form?Then we have to replace the
start location fragment with the end location fragment. Our view layer
should change, but our presenter will be the same. In addition, we can
think about having 2 maps on the same screen one at the top with the
start location and another at the bottom, is the same example as before,
our view implementation changes but not our presenter.  
如果设计改变了怎么办？我们把两个tab换成了更适合的两步表单。然后我们就需要在开始位置fragment和结束位置fragment间切换。我们的视图层变了，但是presenter仍然是同一个，另外，我们也可以考虑在一个界面上展示两个地图，顶部展示开始位置，底部则是结束位置，这仍然是和之前相同的，变化的是视图层的实现，而不是我们的presenter。

So what is the lifecycle of my presenters? It depends on the
component(s) that we need to represent with that presenter.
那么我的presenter的生命周期是什么样的？这依赖于我们实现视图层使用的组件。

To explain that, let’s take a look at the [Selltag
app](https://translate.google.com/translate?sl=es&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fwww.fesja.me%2Fgracias-selltag%2F),
a second-hand application. This is how we used to create products in
that application:  
让我们来看一下[Selltag
app](https://translate.google.com/translate?sl=es&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fwww.fesja.me%2Fgracias-selltag%2F)，一个二手交易应用。如图是我们如何创建一个商品：

![New product - step
1](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-1.png)
![New
product - step
2](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-2-con-varias-fotos.png)
![New product - Step
3](http://panavtec.me/wp-content/uploads/2016/02/2016-02-11.png)

As you can see is a 3 steps form. Despite the Spanish words, I think is
clear enough, “Siguiente” is “Next” and “Publicar” is “Publish”.  
如你所见是一个3步的表单。忽视西班牙语。我想还是挺清晰的，“Siguiente”表示下一步，“Publicar”表示发布。

In the first step, you create some pictures of the product, the second
step is to fill the title, description, and price, lastly, you hit the
publish button and the product will be published.  
第一步，你为商品拍照，第二部，你填写名称，描述和价格，最后你发布它。

My way to model that form is with one presenter again, a
“PublishProductPresenter”. This presenter represents a whole concept
“Publish a product”. How will it look on a tablet? Maybe the 3 steps are
together because you have an ample screen. And what about a web
application? Will it be another approach just because at the first
moment you see different designs? We are only changing the view layer,
but our presentation layer should be the same because it reacts to the
user events and makes queries to our domain.  
我的实现思路依然是使用一个presenter-“PublishProductPresenter”。这个presenter代表着完整的发布商品流程。在平板上又会是什么样的？也许这三步会整合到一起因为你的屏幕足够大。那如果是一个web应用呢？会不会因为你看到了不同的设计就认为是不同的实现方式呢？我们只需要改变视图层，presentation层则是同一个，因为它只对用户时间响应然后调用dmain层查询。

But, hey! I can split it into 3 presenters and use it, in the same way,
you are using your whole presenter. Ok, maybe you are right, but how are
you going to send the information from the first steps to the last one
who is the responsible for creating the product? Are you going to have a
reference of a presenter inside another presenter? Maybe are you going
to create a shared object for all those three presenters and change the
properties in every step? It sounds dangerous and hard to debug if you
have any bugs.  
但是！我可以把他拆成3个presenter来使用，和你使用一个presenter是同样的方式。好吧，也许你是对的，但是你如何从把信息从第一步传递到发布商品的最后一步？你要在一个presenter中持有另一个presenter的引用？也许你会创建一个共享的对象来记录每一步更改的属性？这听起来很危险并且难以debug。

You can create this 3 screens as an Activity with 3 fragments that will
be replaced or 3 different activities.
你可以创建一个拥有3个fragment的activity或者3个activity。

Presenter state
---------------
Presenter状态
------------

What about orientation changes? Your activity will be destroyed and your
presenter too. Most of the problems that I saw regarding if a presenter
has to be stateful or not belongs to the domain layer. I’ll explain it
with the next example:  
如果屏幕方向发生变化了怎么办？你的activity会被销毁，presenter同样。

![fdroid](http://panavtec.me/wp-content/uploads/2016/02/fdroid.png)

This is F-Droid for Android, an alternative and open source market that
only contains open source applications. That Available apps are
refreshed making a network request. Imagine that if we rotate the screen
and our presenter is stateless then the list will be reloaded. How can
you solve it? Well, the question is actually pretty simple you can
create a temporal in-memory or disk cache to save the previous response
and invalidate it with a TTL (time to live). But never store the items
that you received from the network in your presenter, because if you
need to recreate your presenter, then you will have the problem that you
need to keep the reference to those items in order to don’t make that
request again. So in summary, I always try to make my presenters
stateless.  
这是F-Droid Android版，一个只包含开源应用的开源应用市场。可用的应用数据通过网络请求来刷新。想象一下，如果我们旋转屏幕，我们的presenter是无状态的那么列表会重新加载。你如何解决？其实很简单，创建一个内存缓存或者磁盘缓存来存储之前的响应结果，并且设定好失效时间。但是永远不要把获取的结果存在presenter中，因为当你需要重新创建presenter的时候，你需要保持对那些数据的引用来避免再次请求。使用，我总是让presenter无状态。

Callback hell
-------------
回调地狱
-------

Callback hell is one of the most discussed topics when people talk about
the presentation layer. Many of the problems that I saw related to that
callback hell are again because we are letting the presenters do too
much. Remember that is not the responsibility of the presentation layer
to coordinate actions of our domain. Our presentation layer should call
the actions of our domain and those actions are the ones that handle
that synchronization, leaving our presentation layer simple. You can see
this action modeling in my previous post [modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/). Before
integrating libraries such as
[RxJava](https://github.com/ReactiveX/RxJava) or
[Jdeferred](https://github.com/jdeferred/jdeferred) think if you need
that tools or you are making some design mistakes and that tools are the
only option to glue that parts of your system.  
回调地狱是人们谈论presentation层时经常讨论的话题。我看到大部分关于回调地狱的讨论都是因为我们让presenter做了太多的事情。记住协调domain的行为不是presentation的责任，我们的presentation层应该只是调用domain的行为，这些行为应该是异步处理的，让我们的presentation层尽可能简单。你可以查看我之前的文章[modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/).在你添加例如[RxJava](https://github.com/ReactiveX/RxJava)和[Jdeferred](https://github.com/jdeferred/jdeferred)这样的库之前，想想是你需要那些工具还是只有使用那些工具才能修补你设计上的错误。

To illustrate it I’ve created an example. Imagine a system where you
only have to show a list of products if some flag retrieved from a
server is true. This frist approach should be wrong mainly for 2 causes,
the first one is that your presenter doesn’t need to know about this
flag thing because is something related to our domain. The second cause
is that this bad coordination is making us write more lines of code in
our presentation and deal with the synchronization things:  
为了说明这点我做了一个列子。想象一下如果从服务器获取的某个表示为true时，你需要展示一个列表。第一种处理主要有两个错误，第一是你的presenter不需要知道这个和domain层有关的标识。第二是，糟糕的组织协调到时我们需要些更多的代码来处理异步：

![callback
hell](http://panavtec.me/wp-content/uploads/2016/02/diagram_2_.png)

Instead of coordinating those things in the presenter, we can do the
following:  
与其在presenter中处理，不如这样做：

![proper
domain](http://panavtec.me/wp-content/uploads/2016/02/diagram.png)

As you can see, now we don’t have any problems and the action that we
are calling is clear enough. In addition, if this flag is not needed in
a feature the only point that I need to change is my action.  
如你所见，现在我们没有任何问题了，行为调用也很清晰。另外，如果这个标识不需要了，我只需要更改我的行为。

Conclusion
----------
结论
----

Model our presentation layer is very easy, but you have to be sure what
belongs to that layer and what is the responsibility of the domain. When
you have a huge presenter, ask yourself if it is really a huge screen
with a lot of user events to handle or you have another problems like
that your presenter is doing some domain actions, etc…  
构建presentation层是很简单的，但是你需要确定什么属于这一层，哪些责任是domain层的。当你有一个庞大的presenter时，问问自己这个界面是不是有如此多的用户操作需要处理或者你在presenter中做了domain层的行为，等等......