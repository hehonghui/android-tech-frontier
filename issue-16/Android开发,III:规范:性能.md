Android开发, III: 规范: 性能
---

> * 原文链接 : [Developing for Android, III: The Rules: Performance](https://medium.com/google-developers/developing-for-android-iii-2efc140167fd)
* 原文作者 : [Google](https://medium.com/google-developers)
* 译文出自 :  [Medium.com](https://medium.com)
* 译者 : [dustookk](https://github.com/dustookk)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成

On Android, performance and memory are closely intertwined, since the memory footprint of the overall system can affect the performance of all of the processes, and since the garbage collector can have a significant impact on runtime performance. But the items in this section are targeted more specifically at runtime performance that is not necessarily memory-related.

在Android设备上, 性能和内存是密不可分的, 系统的总内存占用会影响到系统的每个进程的性能表现, 垃圾回收机制也会对runtime的性能表现产生重要影响. 但是本章节要讨论的重点是一些和内存无关的的runtime性能表现.

Avoid Expensive Operations During Animations and User Interaction
## 在动画和用户交互时避免复杂操作

As mentioned in the UI Thread section in the Context chapter, expensive operations which happen on the UI thread can cause hiccups in the rendering process. This, in turn, causes problems for animations, which are dependent on this rendering process for every frame. This means that it is even more important than usual to avoid expensive operations on the UI thread while there are active animations. Here are some common situations to be avoided:


之前在[Context](https://medium.com/google-developers/developing-for-android-i-understanding-the-mobile-context-fd2351b131f8)章节的 "UI Thread" 部分已经提到过,UI线程中的复杂操作会引起渲染工作的卡顿. 连锁反应会影响到动画效果, 因为动画的每一帧都是一次渲染. 这就意味着当有动画出现时UI线程里更应该避免复杂的操作. 下面是一些应该避免的常见情况:

Layout: Measurement and layout is an expensive operation, and the more complicated the view hierarchy, the more expensive it can be. Measurement and layout happens on the UI thread (as does any operation that needs to manipulate the views of an activity). This means that an application that is currently trying to run a smooth animation and is then told to layout will do both things on the same thread, and the animation will suffer.

### Layout:
Measurement和Layout都是非常复杂的操作, view的层级关系越复杂, 处理起来就越耗时. Measurement和layout发生在UI线程 (所有需要改动activity里view的操作都在UI线程中进行). 这就意味着如果一个程序正在执行一个流畅的动画的时候被告知需要在UI线程中同时执行layout操作, 结果动画肯定要受罪了.

Suppose your application is able to achieve an overall rendering duration of 13 milliseconds during a particular animation, which is within the 16ms requirement for 60 frames per second (fps). Then an event occurs that causes layout to occur, which takes 5 ms. This layout will occur before the next frame is drawn, which will push the overall frame drawing time to 18ms, and your animation will noticeably skip a frame.

假设你的程序可以在13毫秒内绘制完成一个指定的动画, 这是在16毫秒的规定范围内的(Google官方推荐每秒60帧的刷新频率). 如果这时一个事件触发了需要耗时5毫秒的一个layout动作, 那么这个layout操作会在动画的下一帧绘制之前执行, 这就会将总绘制耗时增加到18毫秒, 结果就是动画效果有一个明显的跳帧.

To avoid this situation when layout needs to occur, either run the layout operations before animations start or delay them until the animations are complete. Also, try to animate only properties that do not trigger layout. For example, View’s translationX and translationY properties affect post-layout properties. LayoutParams properties, on the other hand, require a layout to take effect, so animating those properties will cause jank in reasonably complex UIs.


为了避免这种情况的发生, layout操作要在动画开始前或动画完成后进行.  还有就是, 尽量使用不会触发layout操作的动画效果. 比如, view的translationX和translationY属性会影响post-layout属性. 而LayoutParams的属性又会触发一个layout操作去产生作用, 所以类似这种属性的动画效果会影响已经比较合理的ui显示.

Inflation: View inflation can only happen on the UI thread, and it can be a expensive operation (the larger the view hierarchy, the more expensive the operation). Inflation can happen by manually inflating a view or view hierarchy, or by implicitly inflating it by launching a separate activity. This will happen on the same UI thread as your main activity, and will cause animations to halt while that new activity is inflated.

### Inflation:
view 的inflation过程只能在UI线程完成, 如果操作不当会变成一个非常耗时的过程 (view的层级关系越深, inflation过程就越耗时) Inflation 过程可以通过主动inflate一个view或view树触发, 也可以通过启动一个不同的的activity时隐性触发, 隐性触发会发生在和main activity一样的UI线程中, 进而会造成activity在inflation过程中的动画卡顿.

To avoid this situation, wait to inflate the views or launch the activities until the current animation is finished. Or for avoiding inflation-related jank while scrolling a list with different view types, consider pre-inflating views of those types. For example, RecyclerView supports priming the RecycledViewPool with item views of specific types.

为了避免这种情况, 应该等待当前的动画结束后再触发view的inflation操作或者activity的启动操作. 还有一种情况就是, 为了避免多type的list在滚动时的inflation相关问题, 可以考虑预先inflate不同type的view. 比如, RecyclerView支持预设一个可以产生不同type的ItemView的RecycledViewPool.

Launch Fast
## 快速启动

View inflation is not cheap. It’s not just the parsing of the resource data, but also the instantiation of potentially many views and their potentially expensive content along the way, including decoding bitmaps, running layout, and drawing for the first time. The more complicated your UI and the more views that are in your view hierarchy, the more expensive this inflation operation will be.

view的inflation过程有些耗时. 并不只是解析一些资源文件那么简单, 更包含了实例化潜在的许许多多的view和各个view初始化时自身耗时的操作. 包括bitmap的解码过程, 绘制layout过程, 还有第一次初始化时的draw的过程. ui写的越复杂, view树状结构层级关系越深,整体的inflation过程就会越耗时.

All of this contributes to slow startup time for applications. When the user launches an application, they expect near-instant feedback that the application is running. Android achieves this by displaying a “Starting Window,” which is a blank window constructed with the application’s theme, including any specified background drawable. This is all done in the system process while the application is being loaded and inflated in the background. When the activity is ready to display, the starting window transitions to that real content and the user can begin to use the application.

以上的这些都会拖慢程序的启动过程. 当用户启动一个程序时, 他们期望看到的是几乎瞬时的反馈可以告知他们程序已经跑起来了. Android系统用了一个"启动界面" 来实现这一效果, 包括一个程序设定主题的空白窗口和一些特定的背景图画. "启动界面"是在程序在后台加载以及inflation的过程中在系统进程展示的. 当activity准备好可以被展示了, 启动界面就切换到了真正的内容, 用户就可以开始使用程序了.

While this use of the starting window can give much-needed fast feedback to the user that something is happening, it is not enough to cover for applications that take two, three, or even more seconds to launch; the user will be forced to sit there and stare at the empty starting window until the app is completely ready to go.

启动界面的加入确实可以给用户一个快速反馈告诉用户程序正在启动, 但是这并不足以应付需要两三秒甚至更长时间启动的程序; 结果就是用户被迫坐在那里盯着空空的启动界面直到程序真正启动起来.

Avoid this problem by launching as fast as possible. If you have parts of your UI that do not need to be visible on first launch, don’t inflate them. Use ViewStub as a placeholder for sub-hierarchies that can be optionally inflated later. Avoid expensive operations like decoding large bitmaps whenever possible. Avoid memory churn due to allocations and garbage collections when possible. Use the tools to monitor your startup time and eliminate bottlenecks when you find them.

解决这个问题的办法就是用最快的速度启动程序. 如果有一些UI界面并不需要在第一次启动的时候展示, 那么就不要初始化它们. 用ViewStub 作为sub-hierarchies的临时占位对象, 这样随时可以填充为真正的UI元素. 只要有可能就尽量避免类似解码很大的bitmap这样的耗时操作. 尽量避免因为内存分配或垃圾回收引起的内存抖动. 用工具去监控程序的启动时间, 发现并消除遇到的瓶颈.


Also, avoid initialization code in your Application object. This object is created each time your process is started, potentially causing much more work to be done than is actually needed to get the initial UI shown to the user. For example, if the user is looking at a picture, decides to share it, and selects your app, all your app needs to do is show its share UI, nothing more. Application subclasses tend to become repositories for the full set of potential things an app may need to have initialized, doing a lot of wasted work in common cases. Instead, it is recommended that you use singletons to hold common global state, which are initialized only the first time they are accessed. On a related note, never make a network request in your Application object. That object may be created when one of the app’s Services or BroadcastReceivers is started; hitting the network will turn code that does a local update at a specific frequency into a regular DDoS.

同时, 避免在Application对象中的初始化操作. 只要有新的进程启动, Application类就会创建新的对象. 会潜在的引起许多超出实际需要(只展示初始化UI)的操作. 比如, 当某个用户在查看一张图片时想分享它, 于是选中了你的程序, 这时你的程序需要做的只是展示一个分享界面就可以了.  现在Application的子类越来越变成了一个初始化一切操作的仓库, 做着很多多余的工作. 相反, 正确的做法是用单例去控制初始化操作, 这样的话初始化操作只会在该单例第一次被调用时执行. 还有就是, 永远不要在Application对象中触发网络请求. 因为Application对象也许会在Service或者BroadcastReceiver启动时被创建; 此时触发网络操作会使一段特定频率下请求数据更新的代码变成对服务器的DDoS攻击代码.

Also, note that there is a big difference in startup time depending on what state the application is in prior to starting. If an application has not yet been started at all, this is the worst-case scenario: the process needs to be started, all state needs to be initialized, and the application needs to perform all inflation, layout, and drawing. On the other extreme, an application can already be started and active in the background, in which case starting it can be as simple as bringing that window to the foreground — even much of the layout and rendering steps of the application may be avoided in this situation. Between these extremes are two other situations. In one, which an app may be in after the user has backed out of it, the process may be running, but the task needs to be created from scratch (via a call to Activity.onCreate()). In the other situation, which occurs after the system has evicted a task from memory, the process and the task need to be started, but the task can benefit somewhat from the saved instance state bundle passed into Activity.onCreate(). When you test your application’s startup time, make sure to optimize the worst case, where the process and the task need to be started from scratch. You can do this by swiping-out the task in the Recents list, which will kill the task and the process and ensure that everything starts from scratch the next time that it is launched.

还有就是, 程序启动前所处在的状态不同, 启动时间也大不相同. 最坏一种情况是程序完全没有被启动: 此时进程需要被启动, 所有的状态也需要被重新初始化, 程序需要完成所有的inflation, layout和drawing过程. 另外一个极端情况是, 程序已经启动并在后台运行着, 这时要开启它, 系统只需要把它从后台切换到前台就可以了 - 甚至省去了大量的layout和rendering过程. 除了两种极端情况外, 还有另外两种场景. 一个是当用户退出程序时, 进程可能还在跑, 但是要再次开启程序, 所有任务需要从头来过(从调用Activity.onCreate()方法开始). 还有一种场景是当系统将程序任务从内存中删掉时, 进程和任务都需要重新启动, 但是任务结束时保存的状态会通过Activity.onCreate()传给程序并使之受益. 当你测试你的程序的启动时间时, 要确保优化的是最坏场景下的启动过程, 此时进程和任务都需要重新启动. 制造此场景的方法就是, 你可以在最近的任务列表中划掉你的程序杀掉任务和进程, 这就保证了程序下次启动时是完全重新启动的.

Avoid Complex View Hierarchies
## 避免View复杂的层级关系

The more views that are in your hierarchy, the longer it will take to do common operations, including inflation, layout, and rendering (in addition to the potentially expensive memory implications of unused content; Views are expensive by themselves, in addition to any additional data brought in by custom views). Find cheaper ways to represent nested content. One approach to avoiding complex nested hierarchies is to use custom views or custom layouts in some situations; it may be cheaper for a single view to draw several pieces of text and icons rather than have a series of nested ViewGroups to accomplish this. One rule of thumb for deciding how to combine multiple elements lies in the interaction model: if the user can interact with an element (e.g., via touch, focus, etc.), then that element should be its own view rather than being combined with other, separate elements.

界面层级关系中的view越多, 系统进行一般的操作需要消耗的时间就越长, 比如inflation, layout和rendering过程(许多无用的内容占据了很多内存; view本身也很能占据内存, 尤其是自定义控件带来的更多数据). 要找到最节约资源的方式去组织view中的控件. 在某些场景下用自定义view或者自定义layout可以避免复杂的view层级关系. 用一个单一的view去画一些文字和icon也许比用一系列组合viewgroup来实现一样的效果更节省资源.  在交互界面中如何组合控件有一个准则: 如果用户可以和某一UI元素产生交互(比如touch事件, 获取focus等), 那么这个UI元素应该是一个独立的view 而不应该和其他元素组合.

Avoid RelativeLayout Near the Top of the View Hierarchy
## 避免在靠近view层级关系顶层的地方使用RelativeLayout

RelativeLayout is a very convenient layout to use, because it allows developers to specify how content should be placed relative to other content. In many situations, this is necessary and may be the best solution for the job. However, it is important to understand that RelativeLayout is an expensive solution, because it requires two measurement passes to ensure that it has handled all of the layout relationships correctly. Moreover, this problem compounds with every additional RelativeLayout throughout the hierarchy. Imagine a RelativeLayout at the top of your view hierarchy; this essentially doubles the measurement work on your entire view hierarchy. Now imagine another RelativeLayout as one of the children of that first one — this doubles again the measurement passes that happen under it, requiring four measurement passes for all of the views in its sub-hierarchy.

RelativeLayout是一个用起来很方便的控件, 因为它允许工程师们用相对布局摆放子控件. 在许多情况下, 这是个解决问题非常有必要的方案. 但是, 一定要明白使用RelativeLayout非常消耗资源. 因为RelativeLayout会触发两次measurement过程来保证正确的处理了所有子元素的关系. 更糟的是, 它会和view层级关系中其他的RelativeLayout一起产生更坏的后果. 想象一下一个view层级关系的顶部是一个RelativeLayout; 这本来就将所有子view的measurement次数变成了原来的两倍. 此时如果另外一个RelativeLayout是顶部那个RelativeLayout的子view,那么这时它下面所有子view的measurement次数又变成了原来的两倍, 也就是所它下面的所有子view都经历了四次measurement过程.

Use a different type of layout for situations that do not require the capabilities of RelativeLayout, such as LinearLayout or even a custom layout. Or for situations in which relative alignment of child views is necessary, consider the more optimized GridLayout, which pre-processes the child view relationships and avoids the double-measurement problem.

所以要尽量使用不需要两次measure过程的控件, 比如LinearLayout或者自定义layout. 如果一定要用相对布局的方案, 可以考虑用一个自定义的GridLayout, 可以预处理view的相对关系, 从而避免了两次measure的问题.

Avoid Expensive Operations on the UI Thread
## 避免在UI线程中的复杂操作

Stalling the UI Thread leads to delays in animations and drawing, which causes visible jank for the user. Avoid doing known-expensive operations while on the UI thread (such as during onDraw(), or onLayout(), or any of the other View-related methods that are called on that thread). Good examples of what not to do include calling a web service, executing other network operations (which will throw a NetworkOnMainThreadException), and doing database transactions. Instead, consider using Loaders or other facilities for performing the operations on other threads with the information feeding into the UI later as it comes in. One tool to help indicate this source of jank is StrictMode.

拖延UI线程会导致动画和界面绘制过程的滞后, 造成用户可以感知到的卡顿. 在UI线程(比如 onDraw()方法 onLayout()方法, 或者一些UI线程中被调用的和view展示有关的方法)避免一些众所周知的耗时操作. 比如调用web service 或执行其它网络请求(会抛出NetworkOnMainThreadException), 或者是访问数据库. 相反, 应该考虑用Loader或者其它模块异步操作完成后再通知UI线程修改界面. 可以用StrictMode模块监控这种问题.

Another reason to avoid accessing the file system or database on the UI Thread is that Android device storage is often not good at handling multiple, concurrent reads/writes. Even if your app is idle, there might be another application doing expensive disk I/O (e.g., Play Store updating apps) and this may cause an ANR, or at least significant delays, in your application.

不可以在UI线程访问数据库和文件的另外一个重要原因是Android设备通常并不善于处理IO的并发. 及时你的程序闲置的时候, 其它的程序也许在高负荷的访问磁盘I/O (比如谷歌商店在更新软件). 结果就是有可能会导致ANR发生, 或者至少会导致你的程序出现的严重卡顿.


In general, anything that can be done asynchronously should be; the UI Thread should be used just for core UI Thread operations, like manipulating View properties and drawing.

总的来说, 只要可以放在异步处理的任务就尽量放在异步处理; UI线程需要做的应该只是和UI相关的核心操作, 比如控制界面上元素的属性或者是绘制过程.

Minimize Wakeups
## 把程序的唤醒次数降到最低

BroadcastReceivers are used to receive information and events from other applications that your application may want to respond to. But responding to more of these items than your application actually needs will cause your application to wake up too often, causing overall system performance problems and resource drain. Consider disabling BroadcastReceivers when your application does not care about the results, and carefully choose the Intents that your application really needs to respond to.

广播接收者被用来接受其它程序发来的消息或者事件. 但是如果超出实际需要, 响应过多的广播会导致程序被频繁的唤醒, 从而影响整个系统的性能表现和资源消耗. 应该在程序不需要接受某个广播的时候反注册掉该广播接收者. 注册广播接收者时也要只选择程序需要监听的Intent.

Develop for the Low End
## 为低端设备开发

This relates to the earlier discussion in the Context chapter on Low-End Devices. Most of your users will have lower-end devices than you probably carry for your everyday phone, by virtue of their being either older or cheaper than yours. It is important to develop for this market, and not miss important performance nuances due to higher performance metrics of your development device glossing over elements of your application that would be hard to miss on lower-end devices. Your primary device should not be the fastest/latest one available, and you should always have a variety of devices to be able to try out different speeds and form factors to ensure that your application runs adequately across all of them.

这与前面在[Context](https://medium.com/google-developers/developing-for-android-i-understanding-the-mobile-context-fd2351b131f8)章节关于低端设备的讨论有关.  也许大多数的用户的设备都不如你每天用的设备性能好, 也许比你的设备用的更久或者更便宜. 为这部分低端手机开发非常的总要, 一些在高端设备上很难察觉的性能差异在低端设备上会非常明显. 你的首选开发设备不应该是市面上最快最新的设备, 而且你也应该持有各种不同的测试设备, 这样就可以保证你的程序在不同速度不同厂商的设备上都有足够的性能表现.

Other factors of low-end devices that are important to test against include small RAM sizes and small screen sizes. For example, 512MB is a common low-end configuration, and many Android devices have screen resolutions of 768x480 or less.
这些需要测试的其它低性能设备包括内存较小的设备或者屏幕分辨率较小的设备. 比如512MB内存的设备, 或者拥有768x480或者更低的屏幕分辨率的设备.

Measure Performance
## 测试性能表现

There is a plethora of tools available on Android. Use them to track important performance-related information about your application, including rendering performance (are you able to hit 60 fps?), memory allocations (are constant allocations triggering garbage collections leading to jank during animations?), and startup performance (are you doing too much at startup leading to long wait times for the user when your app first comes up?). Find the problems. Fix them.

市面上有许多工具可以用来测试你的程序的性能表现, 比如rendering的性能(程序可以达到60fps的刷新频率吗?), 内存回收性能(动画的过程中会因为持续的内存非配所引发的垃圾回收而发生卡顿吗?), 或者程序启动性能(用户会因为你的程序第一次启动做了大量的工作而耽误很长时间吗?). 找到问题. 修复他们.
