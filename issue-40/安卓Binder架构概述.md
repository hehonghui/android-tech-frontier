安卓Binder架构概述
---

> * 原文链接 : [An Overview of Android Binder Framework](http://codetheory.in/an-overview-of-android-binder-framework/)
* 原文作者 : [Rishabh](http://codetheory.in/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [seasonwong70](https://github.com/seasonwong70) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

**注意 : 翻译完之后请认真的审核一遍有没有错字、语句通不通顺，谢谢~**


`这里是翻译原文，注意翻译时英文和译文都要留在该文档中，并且是一段英文原文下面直接跟着写译文，便于校对。如下示例 : `

In the Linux OS, there are several techniques to achieve IPC (Inter-process communication) like files, sockets, signals, pipes, message queues, semaphores, shared memory, etc. However, Android’s modified Linux kernel comes with a binder framework which enables an RPC (remote procedure call) mechanism between the client and server processes, where the client process can execute remote methods in the server process as if they were executed locally. So data can be passed to the remote method calls and results can be returned to the client calling thread. It appears as if the thread from the client process jumps into another (remote) process and starts executing in there (known as Thread Migration).
在Linux操作系统上，进程间通信（IPC）技术包含
 - 文件 （Files）
 - 信号 （Signals）
 - 嵌套字（Socket）   
 - 管道（Pipes）
 - 信号量（Semaphores）
 - 内存共享（Shared Memory）
 - 消息传递（Message passing, 包括队列、消息巴士）

虽然可以用的技术很多，但安卓还是选择定制Linux的内核，发明Binder架构（翻译注：实际上是先有Binder架构，随后被迁移到Linux内核上）。Binder架构实现了客户端和服务端之间进程的远程过程调用（RPC）机制，对于服务端的方法，客户端进程能像调用本地方法一样调用它们。因此可以传递数据到远程的方法调用，返还结果给客户端的调用线程。就像是客户端的线程“跳到”另一个进程当中去执行（线程迁移）。

Although the underlying RPC mechanism is very complicated, the binder framework wraps everything and exposes simple to use APIs to make the entire interprocess communication mechanism seem simple. Let’s see what all happens behind the scenes:
尽管底层的RPC机制非常地复杂，但是Binder架构把一切都封装起来，仅暴露简单的APIs，让整个进程间通信机制看起来简单。让我们看看底下都发生了些什么：

Decompose data into primitives that can be understood by the operating system, also known as marshalling (similar to serialization).
将数据分解成操作系统能懂的原始形式，此过程亦被称为Marshalling（与序列化相似）

Transfer the marshalled information across process boundaries to the remote process.
将分解后的数据信息跨过进程边界传输给远程进程

Recompose the information in the remote process, also known as unmarshalling/demarshalling (similar to deserialization).
在远程进程将信息重构，此过程亦被称为Un/Demarshalling（与反序列化相似）

Transfering return values back to the client calling process.
将返回值传回给客户端调用进程

Intents, Content Providers, Messenger, all system services like Telephone, Vibrator, Wifi, Battery, Notification, etc. utilize IPC infrastructure provider by Binder. Even the lifecycle callbacks in your Activity like onStart(), onResume(), onDestroy() are invoked by ActivityManagerServer via binders.
意图（Intents）、内容提供器（ContentProviders）、信使（Messenger），所有的系统服务，包括电话、震动棒、Wifi、电池、通知（Notification）等，都利用了Binder提供的IPC底层框架。甚至活动（Activity）里的生命周期回调函数（例如onStart(), onResume(), onDestroy）也是由活动管理服务（ActivityManagerServer）经由Binder调用的。

A lot of the Binder terminology is covered here that might make more sense once you’ve seen how to work with AIDLs and achieve IPC. Clients and Services don’t want to know anything about the Binder protocol, hence they make use of proxies (by client) and stubs (by service). Proxies take your high-level Java/C++ method calls (requests) and convert them to Parcels (Marshalling) and submit the transaction to the Binder Kernel Driver and block. Stubs on the other hand (in the Service process) listens to the Binder Kernel Driver and unmarshalls Parcels upon receiving a callback, into rich data types/objects that the Service can understand.
这里将覆盖Binder的一些术语，一旦你看过怎么使用AIDLs及完成IPC，借此或许能加深印象。客户端跟服务端不想知道关于Binder协议的任何事情，因此它们使用代理（proxy，在客户端）和存根（stub，在服务端）。代理接收你的高级Java/C++方法调用（请求）并把它们分解成Parcels（Marshalling，类序列化），随后提交事务（transaction）到Binder内核驱动并阻塞。在另一边（服务端进程）存根监听Binder内核驱动，并把从回调中接收到的Parcels重组成服务端能理解的对象和数据类型。

When a client process makes a call to the server process, it transfers a code representing the method to call along with marshalled data (Parcels). This call is called a transaction. The client Binder object calls transact() whereas the server Binder object receives this call in onTransact() method. A call to transact() blocks the client thread by default until onTransact() is done with its execution in the remote thread.
当客户端向服务端发起一个调用时，它在分解后的数据中（Parcels）携带表示调用方法的代码。该调用称为事务（transaction）。客户端的Binder对象调用*transact()*，反之服务端Binder对象调用*onTransact()*来处理该调用。一个向*transact()*发起的调用在默认情况下会阻塞客户端线程，直到*onTransact()*在远程线程中执行完毕。

The onTransact() method is executed on a single thread from a pool of binder threads. The pool can have a maximum of 16 threads which means 16 remote calls can be handled concurrently (make sure to handle multi threading issues and ensure thread safety).
*onTransact()*方法在Binder线程池里取出的一个单独线程中执行。线程池中的最大线程数是16，意味着可以并发处理16个远程方法调用（确保处理多线程问题及线程安全）。

The server (service) can also issue a transaction to the client process (two-way communication) in which case it becomes the client and the transaction is handled in a binder thread in the client process. However if the server started a transaction while executing the onTransact() method, the client will receive the transaction in the thread waiting for the first transaction to be finished rather than a binder thread.
对于双向通信，服务端亦可发起事务，此时服务端变成了“客户端”，事务在客户端的Binder线程中被处理。只要服务端在执行*onTransact()*调用时发起一个事务，客户端将会在等待第一个事务完成的线程里接收该事务，而不是一个Binder线程。

If you don’t want the transact() call to block then you can pass the IBinder.FLAG_ONEWAY flag to return immediately without waiting for any return values.
如果你不想*transact()*阻塞，可以传递IBinder.FlAG_ONEWAY标志来立即返回，不用等待任何返回值。

Note: The entire IPC occurs through the Binder driver in the Linux Kernel. Communication across process boundaries are not possible directly, only through the kernel. The binder driver is a kernel module that makes this possible.
注意：整个IPC通过在Linux内核中的Binder驱动完成。跨进程通信无法直接完成，只有通过内核。Binder驱动是让这成为可能的内核模块。

We’ll cover IPC with AIDL in the next article where all of these will start to make a lot more sense.
在下一篇文章里，我们将会涉及AIDL的IPC，在那里会对上述的内容有更好的理解。



