欢迎来到多线程时代
---

>
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  未完成


###That moment when one Dalvik alone is no longer enough.


生活在内存限制中
---

有很多方面使得Android作为一个独特的移动操作系统,但有时是非常难以接触,特别是从开发人员角度来看。

例如,把内存限制。iOS应用程序提供几乎没有限制的内存预算(200 MB不是什么大不了的事),Android有严重的局限性,从最近设备的24/32/48 MB以及旧设备极小的16 MB便可以看出。

RAM预算就是一切你的应用工作时所能获得的全部了，这意味着，它必须满足加载类、线程、服务、资源和你的应用程序想要显示的内容。想象一个通过网格视图展示优美图片的照片浏览应用,或一个需要在后台播放的音乐播放器:这太恐怖了

> 那时候你的体会应该是这样的

![Life’s a bitch, sometimes.](https://raw.githubusercontent.com/Lollypo/android-tech-frontier/master/others/%E6%AC%A2%E8%BF%8E%E6%9D%A5%E5%88%B0%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%97%B6%E4%BB%A3/images/img01.gif)

要理解为什么Android提出了这些限制以及提供了什么解决方案来应对他们,我们需要知道一点点在这背后之后发生了些什么。

理解Android进程
---

使用多进程有啥好处
---

使用多进程时的那些坑  
---

我需要使用多进程吗
---

当然,这取决于你需要查看到的迹象。如果你的用户正在经历越来越频繁OutOfMemory错误或者他们抱怨你的应用程序是极其消耗RAM,你可能需要考虑使用一个或多个独立的进程。

音乐播放器的例子是第二个进程能使你的App做的更好的其中最常见的一个场景，当然，还有更多。
例如,你的应用程序是一个客户端云存储服务：委托同步服务组件专用的进程似乎是完全合理的，所以即使UI会被系统杀死，服务仍然可以运行并且保持文件更新。

> 类似的情况会发生在你第一次真正意识到进程隔离的意思时

![This happens when you first realize what “isolation between processes” really means.](https://raw.githubusercontent.com/Lollypo/android-tech-frontier/master/others/%E6%AC%A2%E8%BF%8E%E6%9D%A5%E5%88%B0%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%97%B6%E4%BB%A3/images/img04.gif)

如果你认为你需要它,那么我建议你先玩一个小试验台应用:只有通过实际体验使用多个进程的优势和内在的复杂性，你才能够决定你是否真的需要它,如果是这样,什么是最好的处理它的方式而不至于把我们逼疯。

结语
---

我知道我仅仅触及到这个问题的表面，我只是想给你一些实用的建议，而不是告诉你在操作系统层调控进程的全部理论与工作机制。

还是那句话，如果你对此感兴趣并愿意深入其中，那就留言让我知道！同时，不要忘记文档是你最好的朋友[[1]](http://developer.android.com/guide/components/processes-and-threads.html#Processes) [[2]](https://developer.android.com/training/articles/memory.html) [[3]](https://developer.android.com/tools/debugging/debugging-memory.html)

## 原文链接
[Going multiprocess on Android](https://medium.com/@rotxed/going-multiprocess-on-android-52975ed8863c)