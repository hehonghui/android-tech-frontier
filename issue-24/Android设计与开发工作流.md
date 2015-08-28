Android设计与开发工作流
---
> * 原文链接 : [Wutson: Exploring Design And Development Workflows](http://novoda.com/blog/londroid-wutson/)
* 原文作者 : [Ataul Munim](http://novoda.com/blog/author/ataulm/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [dengshiwei](https://github.com/dengshiwei) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 : 完成

在这个月的Londroid，Qi和我一起发布了Wutson，这是一款我们从年初就为此工作的app。我们分享我们的工作流程，包含我们如何一起工作、我们发现的哪些工具最有用以及改进开发设计过程的技巧。

Wutson是你的私人TV指南，它帮助你找到什么在上映。我们决定开发它是因为我们没有发现现有的app选项是合适的：一些原本体贴的功能和用户体验(UX)但是看起来显得过时并且夹杂着广告，还有一些看起来App看起来非常棒，但是用户体验设计(UX)不明确并且有着糟糕的用户使用流程。

![Home](http://novoda.com/blog/content/images/2015/07/wutson_photo.png)

开始开发的时间在Android TV启动的时间前后 - Wutson将是家居生活中的完美app应用：非常直观、很简单，当然它是非常适合TV指南。

今年里，我们也非常专注于探索Android在我们的一些新项目中的可行性。大量的关于App如何适用于TV的考虑也会使做出的App容易使用，所以这是一个实验和学习的理想情况。

我们开始寻找现有的app应用 - [SeriesAddict](https://play.google.com/store/apps/details?id=com.zenstyle.seriesaddict) 和 [SeriesGuide](https://play.google.com/store/apps/details?id=com.battlelancer.seriesguide)是最有名的两款。

SeriesGuide对于UI华丽的app应用是一个很棒的范例。它是我现在使用的一个应用。不幸的是一些简单的工作并不直观（寻找一个节目）或不可能的（寻找一个你没跟踪的节目的情节描述）。

在法国，SeriesAddict是一款基于[BetaSeries](https://www.betaseries.com/introduction) API的很受欢迎的app。它不跟随最先进的UI模式，但是有一些非常精心设计元素，如watchlist，它会展示出你正在追的节目中没看过的前五集。

![Flow](http://novoda.com/blog/content/images/2015/07/userflow.png)

Qi和我列举了其他app的所有要素，然后确认我们感觉很重要的要素包含在Wutson的初始版本中，把他们映射到一起作为用户指南形成一个粗略的信息框架。

在最初项目的引导任务完成后，是时候开始在要素上工作了。我们遵循一个过程，与我们在Novoda中使用的一样：<br>
1、计划(Plan)<br>
2、草图/原型(Scribbles/prototype)<br>
3、视觉设计和规格(Visual design and specs)<br>
4、实现视觉(Implement visual refinements)<br>
5、回顾(Review)(返回步骤1) (then back to 1)

![trello](http://novoda.com/blog/content/images/2015/07/trello.png)

虽然我们倾向于使用Atlassian JIRA去管理项目，但是在私人项目上我们一般使用[Trello](https://trello.com/)。

我们的Trello模版由四列组成：

* 一个to-do列表
* Qi的当前任务
* 我的当前任务
* 完成的任务

我们的计划会议将以审查上周的工作为开始，浏览那些完成的任务或者那些存档的、或放置在to-do列表中的，如果它不是[done-done](http://chrislema.com/what-is-done-done/)。

然后，我们会通过剩余的任务，删除那些在不久的将来不工作的任务，并且选择那些接下来开始工作的任务到我们的列表中。

通过计划和审查一起进行（而不是分开），我们能够：

* 组织任务，所以我们不会阻碍对方
* 反馈产品的发展方向
* 展示那些我们花费时间和努力完成的工作，收到赞美和反馈

我们提出了我们工作流程中的搜索功能：
![scribbles](http://novoda.com/blog/content/images/2015/07/scribbles.png)

基于用户工作流程，Qi能够快速的描述出基本结构页面。Search Overlay和Search Results在屏幕上显示。

对于这个阶段，细节是不重要的 - 显示的内容文字、app bar的颜色、用到哪个图片、甚至到是否绘制直线都不重要，只要用笔和纸画出来就好。

当Qi正在做这些，我让自己忙于建立数据面。在规划阶段，我们已经讨论了什么功能应该包括，所以我知道哪些APIs我将会使用。在Wutson中，我使用[Retrofit](http://square.github.io/retrofit/)和[RxJava](https://github.com/ReactiveX/RxJava)来更快的工作。

这个时候，我也应该开始写测试 - 它是我们每天在Novoda必须要做的事情，但我不后悔做它(测试)，它永远不会太晚。

当Qi做好一些UI设计的手稿，我们将再次会面讨论他们。
![single](http://novoda.com/blog/content/images/2015/07/single.png)

现在是时候确定我将需要实现的设计，包含focueds和pressed状态下的overlays，各种尺寸的图标(icons)，图像占位符(image placeholders)和字体文件(font-files)，这些都是我列举清单上的事物需要从Qi得到的。

在可访问性方面，我们确定哪些组件可以在归入单一文档内容描述类别下。为了确保我们有keyboard/trackball/switch方式(非触摸模式)，我们决定哪些是核心元素在屏幕上显示。例如，如果用户在非触摸模式下我们可能会隐藏星图标(star icon)，因为它会让整个列表导航需要点击两次每个项目而不是一次。我们必须小心不要删除功能 - 它有一个功能追踪不同屏幕的展现(展示细节)。

现在做这些，应用已经为TV准备好了 - 在Nexus Player上调试了8个月之后，应用已经能够在TV上使用了。但是我非常肯定的说，我更倾向要一个功能与UI都一样的手机版App，否则不如不要。
![implementedscribbles](http://novoda.com/blog/content/images/2015/07/implementedscribbles.png)

Qi将界面进行分割，我将它们实现到APP中，就像下面说的这样:

* Qi做界面设计，我实现功能。
* 当一切都是光秃秃的框架，我可以考虑加入一些验收测试(acceptance tests)。
* 我可以确定我已经为所有的交互元素添加了focus和press状态，尽管它们只是暂时的，以后我能够进行替换
![geny](http://novoda.com/blog/content/images/2015/07/geny.png)

为了测试focus状态，你需要一个拥有方向键或轨迹球的设备，以及一个连接键盘的USB-OTG的适配器或者模拟机(你不使用[触屏模式](http://android-developers.blogspot.co.uk/2008/12/touch-mode.html))。前者在最近的Android版本中不存在，后者操作起来很麻烦。我推荐使用Genymotion虚拟机，它有以下几个优点。

* 我可以用键盘来实现non-touch(非接触)模式，这样我就可以检查所有focus/press状态
* 它有一个可调整大小的窗口
* 拥有一个可变的窗体
* 截屏与录屏(screenshots/screen)
* 运行速度非常快

我创建了一个160像素密度(mdpi)的大小为360x640 px的设备(device)来匹配Qi的输出。除了Android的字体渲染(font rendering)，这使得它很容易被发现设计和实现之间的差异。

我将在我的minSdkVersion下创建一个设备(device)，如果你使用的是向上兼容版本的Theme或Style等涉及到AppCompat类型的话，最好使用targetSdkVersion创建设备。

那么我的工作就是实现UI设计稿，Qi的工作就是做出漂亮的UI设计稿。：
![sketchoutput](http://novoda.com/blog/content/images/2015/07/sketchoutput.png)

Qi说现在Sketch是她最喜欢的视觉设计工具(visual design)，尤其喜爱极大的改善了loading/running速度(超过了Photoshop/Illustrator)。Hover Guide可以让你看到你选择的要素与其他要素之间的距离：

Sketch也使用符号。你创建一个符号(例如：图标)，并在多个地方使用它。但是当你改变这个符号的时候，它会改变所有的实例。类似的现象存在于styles、对于多文本框使用相同的属性(attributes)集(例如文本颜色(text color)、字体(font)等等)。

Sketch本身提供30天的免费使用(仅限Mac)，并有大量的在线设计套件供你使用。

让设计采用开发团队格式对他们来说是有用的，但过去是一个麻烦。我们需要为每一个屏幕(screen)、PDF展示margins和paddings、颜色(colors)、文本样式(text style)以及尺寸(dimentions)。这里是一个例子，当我们为 Sun Mobile app工作的时候Dave创造的：
![redlines](http://novoda.com/blog/content/images/2015/07/redlines.png)

这不是很好。对设计师来说，这是浪费时间，而且很容易错过事情。作为一名开发人员，规格表是很杂乱的 - 翻转在不同项目之间意味着必须习惯不同设计师的规格表。

Zeplin是一个有希望解决红线/规格表的程序，。它可以为使用Sketch的设计者作为一个Web应用程序，生产Zeplin项目很简单就如同使用“CMD+ E”导出他们的画板。

Zeplin提供了一个互动门户网站变成了我们用来获取静态规格表 - 我们现在可以查询我们需要的信息，当我们需要的时候：

它虽然需要照顾设计者 - Zeplin是不够聪明对于知道我们需要什么样的信息 - 作为开发者，我们知道有哪些东西用户可以在屏幕上什么看到以及什么样的views/view出现在屏幕上。这些看起来是一样的：
![bounding_before](http://novoda.com/blog/content/images/2015/07/bounding_before.png)

但是在Sketch中，Qi已经在数字周围添加了不可见的边框，所以Zeplin可以捕捉到它：
![bounding-after](http://novoda.com/blog/content/images/2015/07/bounding-after.png)

一但我们让设计(designs)导入到Zeplin，是时候更新将应用从scribbles更新到匹配design。

我从[Amazon上买了这个whiteboard](http://www.amazon.co.uk/Brainstorm-Toys-Magnetic-Wipe-Board/dp/B00368CGL4)) ，你需要得到一个细笔(thin pens)，粗笔(fat pens)是没用的。
![whiteboard](http://novoda.com/blog/content/images/2015/07/whiteboard.png)

我画我需要实现一个lo-fi sketch的一部分;即使Zeplin隐藏了许多默认的信息，我仍然认为这是繁杂，并通过一个名单，我发现它更容易从A到B.

Ta-da!

![visualdesign](http://novoda.com/blog/content/images/2015/07/wutson-visualdesign.gif)

接下来的步骤将包括发布到Google+的测试版本和发布轻量级App应用。













