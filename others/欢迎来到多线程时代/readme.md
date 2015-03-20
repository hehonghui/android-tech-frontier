欢迎来到多线程时代
---

>
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  未完成

> That moment when one Dalvik alone is no longer enough.

Living with memory constraints
---

Android processes: explained!
---

What’s cool about having multiple processes
---

使用多进程时那些糟透的事情
---

我需要使用多进程吗?
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

还是那句话，如果你对此感兴趣并愿意继续深入其中，那么就留言让我知道！同时，不要忘记文档是你最好的朋友[[1]](http://developer.android.com/guide/components/processes-and-threads.html#Processes) [[2]](https://developer.android.com/training/articles/memory.html) [[3]](https://developer.android.com/tools/debugging/debugging-memory.html)

## 原文链接
[Going multiprocess on Android](https://medium.com/@rotxed/going-multiprocess-on-android-52975ed8863c)