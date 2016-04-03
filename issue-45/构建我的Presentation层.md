构建我的Presentation层
---

> * 原文链接 : [Modeling my presentation layer](http://panavtec.me/modeling-presentation-layer/)
* 原文作者 : [panavtec](http://panavtec.me/author/christianpanadero/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成
 
在构建domain层的文章之后，我们接下来说说构建presentation层。我之所以写这篇文章是因为看到有大量的工程从已有代码迁移到MVP结构时，对于什么该属于presentation层，什么该属于UI层的划分不清晰。我在之前的项目中看到一个评论：“我不能修改业务逻辑” 。如果你不能区分什么是属于domain层的，那么在分离责任时，你就会犯错，这是很糟糕的事情。你为什么要在不清楚最基本逻辑的情况下去试图创建一个清晰的结构。
 
下面我会给出一些案列以及我是如何解决的。这篇文章主要是理清概念，你可以用多种方式去实现。

Android view vs View vs Screen
------------------------------
 
- **Android view**：Android的组件，继承自android.view.view。
- **View**：presenter和视图实现间的通讯接口，你可以在你喜欢的Android组件中实现它，有时使用Activity是个好的选择，有时则是Fragment或是一个自定义视图更合适。
- **Screen**：界面更多是一个用户层面的概念，用户通过界面感知到正在不同窗口中切换，但是在Android中我们可以使用Activity来表示它，或者是在同一Activity下替换fragments/views。所以界面完全依赖于用户的感知，通常就是你能在视图中看到的所有内容。

导航到不同的界面
-------------
 
两个界面间的切换可以是两个fragment之间，两个activity之间，打开一个dialog，打开一个activity等等。这是如何做到的属于实现的细节，是传递机制的责任。但是导致界面切换的行为呢？这个行为就是我们presentation层的责任。我们的presenter应该知道要**做什么**和我们的实现**如何**去做。这个情境中，要如何做呢？如何导航到另一个界面呢？打开一个新的activity，然后，问题来了，我之前说过我的presentation层是纯java的，所以我不能使用任何Android相关的东西，这如何实现呢？使用抽象。你可以创建一个只有navigate方法的NacigationCommand接口，在presenter需要时调用它，在视图层中实现它。假设我们有一个Activity A要在按钮点击后跳转Activity B，下面是序列图。

![1](http://panavtec.me/wp-content/uploads/2016/02/navigation_command_sequence.png)

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
 
通过这种处理，我们解耦了不同层之间的责任。我们把导航到Activity B的操作提取成了一个可以在项目中复用的类。我们可以测试我们的presenter来调用导航命令，并且如果我们更改了界面的展现形式（例如从Activities转换为Fragments），我们的presentation层不需要改变。开闭原则万岁！

另一个问题是如果你在一个presenter中有多个导航命令，那么构造函数的参数会变得很奇怪

	public class PresenterA {
 		private final NavigationCommand toBNavigation;
 		private final NavigationCommand toCNavigation;

 		public PresenterA(NavigationCommand toBNavigation, NavigationCommand toCNavigation) {
    		this.toBNavigation = toBNavigation;
    		this.toCNavigation = toCNavigation;
 		}
	}
   
实例化这个presenter时很难知道导航命令参数的顺序，你只能依靠命名来区分。但是我们可以定义一个继承自NavigationCommand接口的接口来表示导航的子类型。另一个解决方法是，如果你在使用依赖注入，那能不能实现一个[Qualifier](https://docs.oracle.com/javaee/6/tutorial/doc/gjbck.html)来指定你需要传递那种类型的参数。
  
某些场景下你可能需要导航到界面A或者界面B，那么我们可以修改NavigationCommand接口。

	public interface ToScreenBNavigationCommand extends NavigationCommand {
 		void setMyParameterToNavigate(String parameter);
	}

如果我们这么做，那么我们就可以在调用navigate方法前先设定好我们的目的地。
 
这个想法来自于[Pedro](https://twitter.com/pedro_g_s)，他在自己的项目[EffetiveAndroidUI](https://github.com/pedrovgs/EffectiveAndroidUI/blob/1dadd276b094dffed2ae2e88602925c173ab59d7/app/src/main/java/com/github/pedrovgs/effectiveandroidui/ui/viewmodel/action/ActionCommand.java)中已经实现了.

一个界面中有多个View接口
-----------------

有很多Android组件可作为视图元素，这都不是presenter要关心的。记住View接口就像是presenter使用的契约。我们的一个界面中可以有多个View接口吗？当然可以！我如何在一个Activity中拥有多个View接口/presenter呢？让我们来看看Spotify的浏览界面：

![2](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-18-48-45.png)
 
在我看来，这个界面有一个水平滚动的播放列表，然后是可选操作的菜单，底部是当前播放的歌曲。在这个界面中，我们可以清晰的有多个抽象，用我的方式来看这个界面，各个抽象之间是没有关联的。所以让我们来考虑一下为每个概念实现一个View接口/presenter。

![3](http://panavtec.me/wp-content/uploads/2016/02/browse_colored.png)

那么为什么创建那样的结构，这和创建一个Presenter包含所有的行为和自定义视图有什么区别？那么考虑一下谁负责填充视图，如果你打算重用这个组件你如何才能做到。RecommendedPlayLists可能需要访问网络来为当前用户获取推荐播放列表，那显然有必要为presenter创建一个自定义视图来实现它。这样就可以复用了。那么浏览菜单呢？这是另一个抽象了，他只是负责当你点击时导航到另一个界面（使用前面提到的navigation command！）最后，当前播放的歌曲也是一定会在其他地方复用的。

如你所见，一个界面可以包含多个View接口/Presenter，因为界面是一个汇总，而且会有多个责任，这完全依赖于设计。(记住一个[责任](https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)就是一个变化的原因，这里的视图可能因为多种原因而变化。)

一个视图可以有两种实现吗？
---------------------

当然！一个view接口可以有多种实现。比如在Spotify中，我展示给你的那个界面可以控制当前的播放和展示歌曲信息，但是我们点击这个区域的话，就会跳转：

![4](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-21-24-51.png)
 
这两者不就是使用了不同的展示方式吗。所以也许我们可以复用presenter，使用不同的Android组件来实现view接口。但是，这个界面似乎有些额外的新功能，那应不应该也添加到这个presenter中呢？根据你的实际使用情况有不同的做法：你可以用不同的行为组合成一个presenter；使用两个不同的presenter，一个用来对应行为，一个对应presentation；或者直接使用一个presenter处理所有。记住，没有完美的解决方案，软件就是要取舍。
 
但是，这确实不是常见情况，通常一个Presenter只有一个view接口实现。

MVP组成
------

总结下目前我们都经历了什么

- view接口实现和presenter一对一
- 一个界面拥有多个views/presenters
- 一个view接口可以有多重实现方式来对应同一个presenter
- 一个Android组件可以有一个视图接口实现。如果你实现了两个，那么也许是两个视图接口应该合并或者你应该分离开实现。

让我们再来看看其他的关键点

Presenter生命周期
----------------

下面是一张来自软件Citymapper的截图，当你点击“Get me somewhere”按钮后，会展示一个可以选择起点和终点的界面：

![5](http://panavtec.me/wp-content/uploads/2016/02/citymapper_getmesomewhere.png)

你如何分解这个界面？我首先想到的是，开始位置在没有结束位置时是否还有意义？我认为没有。我会创建一个“PickLocation” presenter，它可以获知何时开始和结束位置被填写了。一个Activity内部包含一个有两个fragment的view pager可以满足视图层的实现。两个fragment都可以接触到同一个presenter并且调用“presenter.startLocationChanged()”和“presenter.endLocationChanged()”。

如果设计改变了怎么办？我们把两个tab换成了更适合的两步表单。然后我们就需要在开始位置fragment和结束位置fragment间切换。我们的视图层变了，但是presenter仍然是同一个，另外，我们也可以考虑在一个界面上展示两个地图，顶部展示开始位置，底部则是结束位置，这仍然是和之前相同的，变化的是视图层的实现，而不是我们的presenter。

那么我的presenter的生命周期是什么样的？这依赖于我们实现视图层使用的组件。

要解释生命周期，让我们来看一下[Selltag
app](https://translate.google.com/translate?sl=es&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fwww.fesja.me%2Fgracias-selltag%2F)，一个二手交易应用。如图是我们如何创建一个商品：

![6](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-1.png)
![7](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-2-con-varias-fotos.png)
![8](http://panavtec.me/wp-content/uploads/2016/02/2016-02-11.png)

如你所见是一个3步表单。忽视西班牙语。我想还是挺清晰的，“Siguiente”表示下一步，“Publicar”表示发布。

第一步，你为商品拍照，第二部，你填写名称，描述和价格，最后你发布它。

我的实现思路依然是使用一个presenter-“PublishProductPresenter”。这个presenter代表着完整的发布商品流程。在平板上又会是什么样的？也许这三步会整合到一起因为你的屏幕足够大。那如果是一个web应用呢？会不会因为你看到了不同的设计就认为是不同的实现方式呢？其实我们只需要改变视图层，presentation层则是同一个，因为它只对用户事件进行响应然后调用dmain层查询。

但是！我可以把他拆成3个presenter来使用，和你使用一个presenter是同样的方式。好吧，也许你是对的，但是你如何从把信息从第一步传递到发布商品的最后一步？你要在一个presenter中持有另一个presenter的引用？也许你会创建一个共享的对象来记录每一步更改的属性？这些听起来很危险并且难以debug在你出错的时候。

你可以创建一个拥有3个fragment的activity或者3个activity来实现视图层。

Presenter状态
------------

如果屏幕方向发生变化了怎么办？你的activity会被销毁，presenter同样。问题大部分是关于presenter是否该有状态或者是因为它不应该属于domain层，下面的例子我会介绍：

![9](http://panavtec.me/wp-content/uploads/2016/02/fdroid.png)

这是F-Droid Android版，一个只包含开源应用的开源应用市场。展示的数据通过网络请求来刷新。想象一下，如果我们旋转屏幕，我们的presenter是无状态的那么列表会重新加载。你如何解决？其实很简单，创建一个内存缓存或者磁盘缓存来存储之前获得的数据，并且设定好失效时间。但是永远不要把获取的结果存在presenter中，因为当你需要重新创建presenter的时候，你需要保持对那些数据的引用来避免再次请求数据。总之，我总是让presenter无状态。

回调地狱
-------

回调地狱是人们谈论presentation层时经常讨论的话题。我看到大部分关于回调地狱的讨论都是因为我们让presenter做了太多的事情。记住协调domain的行为不是presentation的责任，我们的presentation层应该只是调用domain的行为，这些行为应该是异步处理的，让我们的presentation层尽可能简单。你可以查看我之前的文章[modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/).在你添加例如[RxJava](https://github.com/ReactiveX/RxJava)和[Jdeferred](https://github.com/jdeferred/jdeferred)这样的库之前，想想是你需要那些工具还是只有使用那些工具才能修补你设计上的错误。

为了说明这点我做了一个列子。想象一下如果从服务器获取的某个表示为true时，你需要展示一个列表。第一种处理主要有两个错误，第一是你的presenter不需要知道这个和domain层有关的标识。第二是，糟糕的组织协调导致我们需要些更多的代码来处理异步：

![10](http://panavtec.me/wp-content/uploads/2016/02/diagram_2_.png)
 
与其在presenter中处理，不如这样做：

![11](http://panavtec.me/wp-content/uploads/2016/02/diagram.png)

如你所见，现在我们没有任何问题了，行为调用也很清晰。另外，如果这个标识不需要了，我只需要更改我的行为。

结论
----

构建presentation层是很简单的，但是你需要确定什么属于这一层，哪些责任是domain层的。当你有一个庞大的presenter时，问问自己这个界面是不是有如此多的用户操作需要处理或者你在presenter中做了domain层的行为，等等......