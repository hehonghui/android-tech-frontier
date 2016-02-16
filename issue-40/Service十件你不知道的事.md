Service十件你不知道的事
---

> * 原文链接 : [10 things you didn’t know about Android’s Service component](https://medium.com/@workingkills/10-things-didn-t-know-about-android-s-service-component-a2880b74b2b3#.217tirtun)
* 原文作者 : [Eugenio Marletti](https://medium.com/@workingkills)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 


很抱歉我标题党了一回，但我就是忍不住要做标题党……

多年以来，我常常会和一些 Android 开发同行讨论一些问题，其中最常讨论的就是菜鸡和大神对 Service 组件的种种误解。下面是讨论结果的汇总：这些内容我一直记在心里，而今天我决定写在博客上分享给大家。

但这不意味着我要解释 Service 机制的所有细节，官方文档已经给出了很好的解释；我要指出的是被忽视/被误解/被遗忘的 Service 的相关概念，而这些概念又是掌握 Service 组件必须掌握的。

##1. Service 不是更好用的 AsyncTask

Service 并不是用于完成通用的异步/后台操作：设计 Service 组件的目的在于，即使当前没有 Activity 是可见的，仍可以执行一些逻辑；不妨将它理解为不可见的 Activity。

需要记住，每一个 Service 组件带来的开销并不仅仅会增加 App 的负担，还会增加整个 Android 系统的负担。

##2. Service 默认运行在主线程中，即 App 进程中

你可以让 Service 运行在不同的进程中，但你应该避免这样做，除非你非这样做不可且了解这样做将会带来的一切开销。

##3. IntentService 并没有什么黑科技

IntentService 通过创建 HandlerThread 置于队列中等待对应任务被完成，是在 Service 之外处理逻辑的一种技巧。

IntentService 是一个简单的类，只有164行代码，其中有90行还是注释，你可以去看看它的源码！

##4. 一次只能有一个 Service 实例

不论你创建多少 Service，一次只能处理一个 Service 事务，即使有其他应用/进程与其交互。

##5. 杀死 Service 很容易

不要觉得内存压力是"例外"的条件：让你的 Service 组件能优雅地处理系统引起的重启，这是其生命周期很正常的一部分。

你可以将 Service 标记为前台组件使其更难被系统杀死，但只在不得不这样做的情况下设置该标记。

需要注意的是，当代码运行在 onCreate()，onStartCommand()，或 onDestroy() 方法中，无论 Service 此时是不是前台组件，它都会被视作前台组件。

[这里](https://developer.android.com/guide/components/processes-and-threads.html#Lifecycle) 有助于理解进程有多容易被杀死。

##6. Service 能被启动，束缚，或同时启动和绑定

只要存在绑定关系，显式地停止 Service 就不会使其被终止，并且 unbind 所有组件也不会终止它，知道它被显式地停止（如果它曾被启动过）。此外，不论你调用 startService() 多少次，调用一次 stopService() 或 stopSelf() 都会将其停止。不妨看看下面这张 Service 生命周期图：

![](https://cdn-images-1.medium.com/max/800/1*XBMj4XOw8SRecuvLcixZUQ.png)

##7. START_FLAG_REDELIVERY 避免丢失输入数据

如果你在启动 Service 时传入数据，在 onStartCommand() 方法中返回 START_FLAG_REDELIVERY 有助于避免输入数据的丢失，如果 Service 在处理它的时候被杀死。

##8. 前台 Service 通知可能有一部分被隐藏

前台 Service 必须显示持久的通知，但你可以给它一个 PRIORITY_MIN 优先级以在状态栏隐藏它（但它在通知的阴影处是可见的）。

##9. Service 能启动 Activity

就像所有非 Activity 的 Context 子类，在 Service 中使用 Intent 时为其添加 FLAG_ACTIVITY_NEW_TASK 标记后就能在 Service 组件内启动 Activity。

##10. 你允许使用单一职责原则

你不应该将业务逻辑放在 Service 类内处理，而是在一个独立的类中处理。这样的话，只要需要，你可以在任意类内处理业务逻辑，好处多多。

记住这些内容，并把它们分享给你的小伙伴，减少 Service 的误解！