安卓Binder架构概述
---

> * 原文链接 : [An Overview of Android Binder Framework](http://codetheory.in/an-overview-of-android-binder-framework/)
* 原文作者 : [Rishabh](http://codetheory.in/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [seasonwong70](https://github.com/seasonwong70) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 



在Linux操作系统上，进程间通信（IPC）技术包含
 - 文件 （Files）
 - 信号 （Signals）
 - 套接字（Socket）   
 - 管道（Pipes）
 - 信号量（Semaphores）
 - 内存共享（Shared Memory）
 - 消息传递（Message passing, 包括队列、消息总线）

虽然可以用的技术很多，但安卓还是选择定制Linux的内核，发明Binder架构（翻译注：实际上是先有Binder架构，随后被迁移到Linux内核上）。Binder架构实现了客户端和服务端之间进程的远程过程调用（RPC）机制，对于服务端的方法，客户端进程能像调用本地方法一样调用它们。因此可以传递数据到远程的方法调用，返还结果给客户端的调用线程。就像是客户端的线程“跳到”另一个进程当中去执行（线程迁移）。

尽管底层的RPC机制非常地复杂，但是Binder架构把一切都封装起来，仅暴露简单的APIs，让整个进程间通信机制看起来简单。让我们看看底下都发生了些什么：


- 将数据分解成操作系统能懂的原始形式，此过程亦被称为Marshalling（与序列化相似）


- 将分解后的数据信息跨过进程边界传输给远程进程


- 在远程进程将信息重构，此过程亦被称为Un/Demarshalling（与反序列化相似）

- 将返回值传回给客户端调用进程

Intents、ContentProviders、Messenger，所有的系统服务，包括电话、震动器、Wifi、电池、通知等，都利用了Binder提供的IPC底层框架。甚至Activity里的生命周期回调函数（例如onStart(), onResume(), onDestroy）也是由ActivityManagerServer经由Binder调用的。


这里将覆盖Binder的一些术语，一旦你看过怎么使用AIDLs及完成IPC，借此或许能加深印象。客户端跟服务端不想知道关于Binder协议的任何事情，因此它们使用代理（proxy，在客户端）和存根（stub，在服务端）。代理接收你的高级Java/C++方法调用（请求）并把它们分解成Parcels（Marshalling，类序列化），随后提交事务（transaction）到Binder内核驱动并阻塞。在另一边（服务端进程）存根监听Binder内核驱动，并把从回调中接收到的Parcels重组成服务端能理解的对象和数据类型。


当客户端向服务端发起一个调用时，它在分解后的数据中（Parcels）携带表示调用方法的代码。该调用称为事务（transaction）。客户端的Binder对象调用*transact()*，反之服务端Binder对象调用*onTransact()*来处理该调用。一个向*transact()*发起的调用在默认情况下会阻塞客户端线程，直到*onTransact()*在远程线程中执行完毕。


*onTransact()*方法在Binder线程池里取出的一个单独线程中执行。线程池中的最大线程数是16，意味着可以并发处理16个远程方法调用（确保处理多线程问题及线程安全）。


对于双向通信，服务端亦可发起事务，此时服务端变成了“客户端”，事务在客户端的Binder线程中被处理。只要服务端在执行*onTransact()*调用时发起一个事务，客户端将会在等待第一个事务完成的线程里接收该事务，而不是一个Binder线程。


如果你不想*transact()*阻塞，可以传递IBinder.FlAG_ONEWAY标志来立即返回，不用等待任何返回值。

注意：整个IPC通过在Linux内核中的Binder驱动完成。跨进程通信无法直接完成，只有通过内核。Binder驱动是让这成为可能的内核模块。


在下一篇文章里，我们将会涉及AIDL的IPC，在那里会对上述的内容有更好的理解。
