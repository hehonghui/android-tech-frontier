欢迎来到Android多进程时代
---

>
* 原文标题 : Going multiprocess on Android
* 原文链接 : [Going multiprocess on Android](https://medium.com/@rotxed/going-multiprocess-on-android-52975ed8863c)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)   
* 状态 :  完成

###That moment when one Dalvik alone is no longer enough.


生活在内存限制中
---

有很多方面使得Android成为一个独特的移动平台操作系统，但有时候却让人觉得难以融入，特别是从开发人员的角度看。

例如,把内存限制。iOS应用程序提供几乎没有限制的内存预算(200 MB不是什么大不了的事),Android有严重的局限性,从最近设备的24/32/48 MB以及旧设备极小的16 MB便可以看出。

RAM预算就是一切你的应用运行时所能获得的全部了，这意味着，它必须满足加载类、线程、服务、资源和你的应用程序想要显示的内容。想象一个通过网格视图展示优美图片的照片浏览应用,或一个需要在后台播放的音乐播放器:这太恐怖了

> 那时候你的体会应该是这样的

![Life’s a bitch, sometimes.](http://7xi8kj.com1.z0.glb.clouddn.com/img01.gif)

要理解为什么Android提出了这些限制以及提供了什么解决方案来应对他们,我们需要知道一点点在这背后之后发生了些什么。

理解Android进程
---

你应该已经知道了,安卓系统是基于Linux的。因此,每个应用程序都运行在其本身的进程(拥有一个独一无二的PID)中:这允许应用运行在一个相互隔离的环境中,不能被其他应用程序/进程干扰。通常来说,当你想启动一个应用程序,Android创建一个进程(从Zygote中fork出来的),并创建一个主线程，然后开始运行Main Activity。

你可能不知道的是,你可以指定应用程序的一些组件运行在不同的进程中，而不是那个被用于启动应用程序的。先来看一下这个Nice的属性:
<center>
```xml
android:process
```
</center>

该进程属性可用于activities、services、content providers和broadcast receivers 和指定的进程中应该执行的特定组件。

在这个例子中,我指定MusicService必须执行在一个单独的“music”的进程:
```xml
<manifest ...>
  <application
    android:icon="@drawable/ic_launcher"
    android:label="@string/app_name"
    android:theme="@style/Theme.Main" >
    
    <activity
      android:name=".MusicActivity"
      />
    <service
      android:name=".MusicService"
      android:process=":music"
    />
  </application>
</manifest>
```

它有什么意义呢?

在这个简短的介绍中，我提到了每一个Android应用程序在运行的时候都有一个不能超出的内存预算值。更精确的说，这限制了它只能在单个基础的进程上运行。换句话说，应用程序的每一个进程都将会有一个专门的内存预算(更不用说其中止时也有更酷的不同的规则)

让我们看看这种方法将是一件好事还是坏事。(剧透:两者都是)

使用多进程有啥好处
---

正如我刚才提到的,一个独立的进程可以充分利用自己的RAM预算,使其主进程拥有更多的空间处理资源。

此外，操作系统对待运行在不同组件中的进程是不一样的。这意味着，当系统运行在低可用内存的条件时，并不是所有的进程都会被杀死。想象一下：你的音乐播放器正在后台运行，音乐突然播放，系统需要释放一些内存(因为facebook,这就是原因)。由于播放音乐的服务跑在另一个进程中，一种极为可能的情况就是操作系统将会先杀死你的主进程(那个运行着你的UI的)，而留下那个在另一个进程播放音乐的。

最后一点对于用户来说看起来似乎很不错！因为你的程序的每一个进程都有自身的在应用程序管理器上的屏幕显示RAM用度。其中有一个或多个将出现在“缓存”部分(这意味着它们是不活跃的)。

> 正如你所看到的,Spotify在后台播放一些音乐。有一个活跃的带有服务的进程 [上图]，而另一个进程(持有UI的)是缓存状态的，因为不再可见/不活动的[下图]。

![](http://7xi8kj.com1.z0.glb.clouddn.com/img02.png)
![](http://7xi8kj.com1.z0.glb.clouddn.com/img03.png)


使用多进程时的那些坑  
---

不幸的是,坑有很多。事实上,你要学习拥有多个进程不是一下子就能完成的事

首先,进程是被设计成独立的(如安全特性),这意味着每一个进程将有自己的Dalvik VM实例。反过来,这意味着你不能通过这些实例共享数据,至少不是传统意义上的。例如,静态字段在每个进程都有自己的值,而不是你倾向于相信的只有一个值。并且这延伸到应用程序每一个的状态。

这是否意味着两个独立的进程之间互相交流是不可能的吗?不,实际上是可能的,有几种方法可以做到。最值得注意的是,Intent可以跨进程“旅行”,Handlers和Messengers也可以。。你也可以依靠AIDL(Android接口定义语言)和Binder,和你通常声明一个bound service茶不错(但你可以做更多的事!)。

我需要使用多进程吗
---

当然,这取决于你需要查看到的迹象。如果你的用户正在经历越来越频繁OutOfMemory错误或者他们抱怨你的应用程序是极其消耗RAM,你可能需要考虑使用一个或多个独立的进程。

音乐播放器的例子是第二个进程能使你的App做的更好的其中最常见的一个场景，当然，还有更多。
例如,你的应用程序是一个客户端云存储服务：委托同步服务组件专用的进程似乎是完全合理的，所以即使UI会被系统杀死，服务仍然可以运行并且保持文件更新。

> 类似的情况会发生在你第一次真正意识到进程隔离的意思时

![This happens when you first realize what “isolation between processes” really means.](http://7xi8kj.com1.z0.glb.clouddn.com/img04.gif)

如果你认为你需要它,那么我建议你先玩一个小试验台应用:只有通过实际体验过使用多个进程的优势和其内在的复杂性，你才能够决定你是否真的需要它,如果是这样,什么是最好的处理它的方式而不至于把我们逼疯。

结语
---

我知道我仅仅触及到这个问题的表面，我只是想给你一些实用的建议，而不是告诉你在操作系统层调控进程的全部理论与工作机制。

还是那句话，如果你对此感兴趣并愿意深入其中，那就留言让我知道！同时，不要忘记文档是你最好的朋友[[1]](http://developer.android.com/guide/components/processes-and-threads.html#Processes) [[2]](https://developer.android.com/training/articles/memory.html) [[3]](https://developer.android.com/tools/debugging/debugging-memory.html)