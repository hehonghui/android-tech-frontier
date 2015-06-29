Android开发, III: 规范: 性能
---

> * 原文链接 : [Developing for Android, III: The Rules: Performance](https://medium.com/google-developers/developing-for-android-iii-2efc140167fd)
* 原文作者 : [Google](https://medium.com/google-developers)
* [译文出自 :  Medium.com](https://medium.com)
* 译者 : [dustookk](https://github.com/dustookk)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成

On Android, performance and memory are closely intertwined, since the memory footprint of the overall system can affect the performance of all of the processes, and since the garbage collector can have a significant impact on runtime performance. But the items in this section are targeted more specifically at runtime performance that is not necessarily memory-related.

在Android设备上, 性能和内存是密不可分的, 系统的总内存占用会影响到系统的每个进程的性能, 垃圾回收机制也会对runtime的性能表现产生重要影响. 但是本章节要讨论的重点是一些和内存无关的的runtime性能表现.

Avoid Expensive Operations During Animations and User Interaction
## 在动画和用户交互时避免复杂操作

As mentioned in the UI Thread section in the Context chapter, expensive operations which happen on the UI thread can cause hiccups in the rendering process. This, in turn, causes problems for animations, which are dependent on this rendering process for every frame. This means that it is even more important than usual to avoid expensive operations on the UI thread while there are active animations. Here are some common situations to be avoided:


之前在[Context](https://medium.com/google-developers/developing-for-android-i-understanding-the-mobile-context-fd2351b131f8)章节的 "UI Thread" 部分已经提到过,UI线程中的复杂操作会引起渲染工作的卡顿. 连锁反应会影响到动画效果, 因为动画的每一帧都是一次渲染. 这就意味着当有动画出现时UI线程里更应该避免复杂的操作. 下面是一些应该避免的常见情况:

Layout: Measurement and layout is an expensive operation, and the more complicated the view hierarchy, the more expensive it can be. Measurement and layout happens on the UI thread (as does any operation that needs to manipulate the views of an activity). This means that an application that is currently trying to run a smooth animation and is then told to layout will do both things on the same thread, and the animation will suffer.

* Layout: Measurement后Layout是一个非常复杂的操作, view的层级关系越复杂, 处理起来就越耗时. Measurement和layout发生在UI线程 (所有需要改动activity里view的操作都在UI线程中进行). 这就意味着如果一个程序正在执行一个流畅的动画的时候被告知需要在UI线程中同时执行layout操作, 结果动画肯定要受罪了.

Suppose your application is able to achieve an overall rendering duration of 13 milliseconds during a particular animation, which is within the 16ms requirement for 60 frames per second (fps). Then an event occurs that causes layout to occur, which takes 5 ms. This layout will occur before the next frame is drawn, which will push the overall frame drawing time to 18ms, and your animation will noticeably skip a frame.

假设你的程序可以在13毫秒内绘制完成一个指定的动画, 这是在16毫秒的规定范围内的(Google官方推荐每秒60帧的刷新频率). 如果这时一个事件触发了需要耗时5毫秒的一个layout操作, 那么这个layout操作会在动画的下一帧绘制之前执行, 这就会将总绘制耗时增加到18毫秒, 结果就是动画效果有一个明显的跳帧.

To avoid this situation when layout needs to occur, either run the layout operations before animations start or delay them until the animations are complete. Also, try to animate only properties that do not trigger layout. For example, View’s translationX and translationY properties affect post-layout properties. LayoutParams properties, on the other hand, require a layout to take effect, so animating those properties will cause jank in reasonably complex UIs.


为了避免这种情况的发生, layout操作要在动画开始前或动画完成后进行.  还有就是, 尽量使用不会触发layout操作的动画效果. 比如, view的translationX和translationY属性会影响post-layout属性. 而LayoutParams的属性又会触发一个layout操作去产生作用, 所以类似这种属性的动画效果会在影响已经比较合理的ui显示.

Inflation: View inflation can only happen on the UI thread, and it can be a expensive operation (the larger the view hierarchy, the more expensive the operation). Inflation can happen by manually inflating a view or view hierarchy, or by implicitly inflating it by launching a separate activity. This will happen on the same UI thread as your main activity, and will cause animations to halt while that new activity is inflated.
To avoid this situation, wait to inflate the views or launch the activities until the current animation is finished. Or for avoiding inflation-related jank while scrolling a list with different view types, consider pre-inflating views of those types. For example, RecyclerView supports priming the RecycledViewPool with item views of specific types.
Launch Fast
View inflation is not cheap. It’s not just the parsing of the resource data, but also the instantiation of potentially many views and their potentially expensive content along the way, including decoding bitmaps, running layout, and drawing for the first time. The more complicated your UI and the more views that are in your view hierarchy, the more expensive this inflation operation will be.

All of this contributes to slow startup time for applications. When the user launches an application, they expect near-instant feedback that the application is running. Android achieves this by displaying a “Starting Window,” which is a blank window constructed with the application’s theme, including any specified background drawable. This is all done in the system process while the application is being loaded and inflated in the background. When the activity is ready to display, the starting window transitions to that real content and the user can begin to use the application.

While this use of the starting window can give much-needed fast feedback to the user that something is happening, it is not enough to cover for applications that take two, three, or even more seconds to launch; the user will be forced to sit there and stare at the empty starting window until the app is completely ready to go.

Avoid this problem by launching as fast as possible. If you have parts of your UI that do not need to be visible on first launch, don’t inflate them. Use ViewStub as a placeholder for sub-hierarchies that can be optionally inflated later. Avoid expensive operations like decoding large bitmaps whenever possible. Avoid memory churn due to allocations and garbage collections when possible. Use the tools to monitor your startup time and eliminate bottlenecks when you find them.

Also, avoid initialization code in your Application object. This object is created each time your process is started, potentially causing much more work to be done than is actually needed to get the initial UI shown to the user. For example, if the user is looking at a picture, decides to share it, and selects your app, all your app needs to do is show its share UI, nothing more. Application subclasses tend to become repositories for the full set of potential things an app may need to have initialized, doing a lot of wasted work in common cases. Instead, it is recommended that you use singletons to hold common global state, which are initialized only the first time they are accessed. On a related note, never make a network request in your Application object. That object may be created when one of the app’s Services or BroadcastReceivers is started; hitting the network will turn code that does a local update at a specific frequency into a regular DDoS.

Also, note that there is a big difference in startup time depending on what state the application is in prior to starting. If an application has not yet been started at all, this is the worst-case scenario: the process needs to be started, all state needs to be initialized, and the application needs to perform all inflation, layout, and drawing. On the other extreme, an application can already be started and active in the background, in which case starting it can be as simple as bringing that window to the foreground — even much of the layout and rendering steps of the application may be avoided in this situation. Between these extremes are two other situations. In one, which an app may be in after the user has backed out of it, the process may be running, but the task needs to be created from scratch (via a call to Activity.onCreate()). In the other situation, which occurs after the system has evicted a task from memory, the process and the task need to be started, but the task can benefit somewhat from the saved instance state bundle passed into Activity.onCreate(). When you test your application’s startup time, make sure to optimize the worst case, where the process and the task need to be started from scratch. You can do this by swiping-out the task in the Recents list, which will kill the task and the process and ensure that everything starts from scratch the next time that it is launched.

Avoid Complex View Hierarchies
The more views that are in your hierarchy, the longer it will take to do common operations, including inflation, layout, and rendering (in addition to the potentially expensive memory implications of unused content; Views are expensive by themselves, in addition to any additional data brought in by custom views). Find cheaper ways to represent nested content. One approach to avoiding complex nested hierarchies is to use custom views or custom layouts in some situations; it may be cheaper for a single view to draw several pieces of text and icons rather than have a series of nested ViewGroups to accomplish this. One rule of thumb for deciding how to combine multiple elements lies in the interaction model: if the user can interact with an element (e.g., via touch, focus, etc.), then that element should be its own view rather than being combined with other, separate elements.

Avoid RelativeLayout Near the Top of the View Hierarchy
RelativeLayout is a very convenient layout to use, because it allows developers to specify how content should be placed relative to other content. In many situations, this is necessary and may be the best solution for the job. However, it is important to understand that RelativeLayout is an expensive solution, because it requires two measurement passes to ensure that it has handled all of the layout relationships correctly. Moreover, this problem compounds with every additional RelativeLayout throughout the hierarchy. Imagine a RelativeLayout at the top of your view hierarchy; this essentially doubles the measurement work on your entire view hierarchy. Now imagine another RelativeLayout as one of the children of that first one — this doubles again the measurement passes that happen under it, requiring four measurement passes for all of the views in its sub-hierarchy.

Use a different type of layout for situations that do not require the capabilities of RelativeLayout, such as LinearLayout or even a custom layout. Or for situations in which relative alignment of child views is necessary, consider the more optimized GridLayout, which pre-processes the child view relationships and avoids the double-measurement problem.

Avoid Expensive Operations on the UI Thread
Stalling the UI Thread leads to delays in animations and drawing, which causes visible jank for the user. Avoid doing known-expensive operations while on the UI thread (such as during onDraw(), or onLayout(), or any of the other View-related methods that are called on that thread). Good examples of what not to do include calling a web service, executing other network operations (which will throw a NetworkOnMainThreadException), and doing database transactions. Instead, consider using Loaders or other facilities for performing the operations on other threads with the information feeding into the UI later as it comes in. One tool to help indicate this source of jank is StrictMode.

Another reason to avoid accessing the file system or database on the UI Thread is that Android device storage is often not good at handling multiple, concurrent reads/writes. Even if your app is idle, there might be another application doing expensive disk I/O (e.g., Play Store updating apps) and this may cause an ANR, or at least significant delays, in your application.

In general, anything that can be done asynchronously should be; the UI Thread should be used just for core UI Thread operations, like manipulating View properties and drawing.

Minimize Wakeups
BroadcastReceivers are used to receive information and events from other applications that your application may want to respond to. But responding to more of these items than your application actually needs will cause your application to wake up too often, causing overall system performance problems and resource drain. Consider disabling BroadcastReceivers when your application does not care about the results, and carefully choose the Intents that your application really needs to respond to.

Develop for the Low End
This relates to the earlier discussion in the Context chapter on Low-End Devices. Most of your users will have lower-end devices than you probably carry for your everyday phone, by virtue of their being either older or cheaper than yours. It is important to develop for this market, and not miss important performance nuances due to higher performance metrics of your development device glossing over elements of your application that would be hard to miss on lower-end devices. Your primary device should not be the fastest/latest one available, and you should always have a variety of devices to be able to try out different speeds and form factors to ensure that your application runs adequately across all of them.

Other factors of low-end devices that are important to test against include small RAM sizes and small screen sizes. For example, 512MB is a common low-end configuration, and many Android devices have screen resolutions of 768x480 or less.

Measure Performance
There is a plethora of tools available on Android. Use them to track important performance-related information about your application, including rendering performance (are you able to hit 60 fps?), memory allocations (are constant allocations triggering garbage collections leading to jank during animations?), and startup performance (are you doing too much at startup leading to long wait times for the user when your app first comes up?). Find the problems. Fix them.
