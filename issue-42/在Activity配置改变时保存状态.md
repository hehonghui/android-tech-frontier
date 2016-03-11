在Activity配置改变时保存状态
---

> * 原文链接 : [Activity Revival and the case of the Rotating Device](https://medium.com/google-developers/activity-revival-and-the-case-of-the-rotating-device-167e34f9a30d#.mmqbihfo6)
* 原文作者 : [Joanna Smith](https://medium.com/@dontmesswithjo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121) 
* 状态 :  完成 




可能很多开发者知道旋转设备会让 Activity 重启，但知道这一点并不重要，因为这不能帮你解决什么问题，你需要知道的是，为什么旋转设备会让 Activity 重启，以及这种情况发生时你要怎么应对。

##理解配置改变

首先，“旋转屏幕”不是我们今天讨论的场景，因为任何配置的改变都会导致 Android 内核重启你的 Activity，配置改变可能是设备旋转（因为需要绘制不同的布局），也可能是系统语言切换（因为我们需要重新显示字符串，而这可能会需要更多/更少的空间以显示对应的字符），也可能是当前键盘的可用性。而以上所提到的种种，实质都是系统正尝试帮助你的 App 以正确的资源完成加载。

##到底发生了什么？

通过重新加载 App，系统真正做的是调用 onDestroy()，然后立刻调用 onCreate()，这样你的 Activity 上加载的都会是正确的数据。

> Note: 此时理解 Activity 生命周期就变得重要了，如果你是初学者，不妨花点时间理解它。

##那我该怎么办呢？

现在你有几个可选项，我会一一交给你，你可以为你的 App 选择最优解。

##让系统为你保存状态

这是最快，也是最明显的解决办法（甚至可能是你现在应该做的）在 Activity 的生命周期中，onSaveInstanceState() 会在 onDestroy() 之前被调用。

当 Activity 被创建，会自动调用 onRestoreInstanceState() 方法并在其中完成一次匹配，这会使系统为保存和加载你的数据担忧，因为你已经提前计划并映射重要的内容了。（你也可以跳过 onRestoreInstanceState() 并用 onCreate() 中的 Bundle 参数加载你保存的状态，选择哪种方式取决于你的偏好。如果你希望在尝试加载用户状态前 onCreate() 已经完全结束的话，onRestoreInstanceState() 会更有用些，要不然的话区别不大。）

这样你可以管理所有相关的数据，即便你的用户是个连重力方向都搞不清楚的小孩。

> Note: 但 onSaveInstanceState() 不能保证你的状态被保存，它只会在这些情况被调用。因为系统想在中断时保存你的状态（屏幕方向改变），但系统不太在意用户何时点击后退按钮，因为这是通过 App 完成的（怎么我听起来反倒像系统为我做了优化呢）。

###但我需要更多的控制！

或许你有大量数据需要存储，或者你并不仅仅尝试保存状态，但 App 确实在 portrait 和 landscape 之间发生了切换，此时布局会重绘按钮和创建左导航图标，但你可能想操控这些改变，或者区分屏幕旋转，语言改变，App 失去焦点。此时你可以用 onConfigurationChanged()，它能提供对应的 Configuration 对象，使得你能知道当前到底发生了什么，这样 App 就能响应你真正在意的那些配置改变。

```java
@Override
public void onConfigurationChanged(Configuration newConfig) {
  super.onConfigurationChanged(newConfig);
  if (newConfig.orientation ==
      Configuration.ORIENTATION_LANDSCAPE) {
    // Change things
  } else if (newConfig.orientation ==
      Configuration.ORIENTATION_PORTRAIT){
    // Change other things
  }
}
```

但这也意味这你必须自己管理配置改变，任何你没有管理的改变都不会在你的应用上体现出来，所以你要重视这一点。在 Manifest 上你需要指出哪些配置改变是你需要观察的：

```xml
<activity android:name=".MyActivity"
  android:configChanges="orientation|keyboardHidden"
  android:label="@string/app_name">
```

现在你已经知道解决的手段了，其中一些办法和其他的办法由微妙的区别（例如 screenLayout vs orientation vs layoutDirection),所以你必须深思熟虑并作出你的决定，处理你真正在意的情况，其他的交给系统。

> Note: 有些开发者认为他们完全可以通过声明哪些东西应该为屏幕旋转负责以避免处理屏幕旋转，这种想法是错的，因为：1、用户不希望被告知哪些能做，哪些不能做；2、如果应用只能在一个方向被使用，你就应该把应用锁定在那个方向上。

###那后台任务怎么办？

因为我们只需要处理 Activity 中存在的情况，所以这不是问题，除非你用的是 AsyncTask。因为 AsyncTask 一般与 Activity 关联，而你又不希望 AsyncTask 跟着 Activity 一次又一次重启，因为这可能会让你的下载任务无法完成，或者终止 AsyncTask 需要完成的任务。所以系统不会在 Activity 重启时销毁 AsyncTask。

听起来有点恐怖，因为 AsyncTask 可能持有 被销毁 Activity 的引用（该 Activity 中任何被创建的 AsyncTask 非静态内部子类都会显示持有该引用），而这会带来内存泄漏的问题。

可能你会说：那我在 Fragment 里用 AsyncTask 不就好了。这个想法看起来很 6，但不是最佳选项，更好的选择应该是：完全移除 AsyncTask，用 Loader 完成你的任务。

###忘了 Fragment

很容易误用被保存的 Fragment，为了避免这样的情况，我们还有更好的选择 - 用 Loader。或用被保存的 Fragment 保存 View 或 Adapter，但这样做是错的，因为这些对象都与 Activity 绑在一起，这就意味着你正在造成严重的内存泄漏。

如果你正维持与聊天客户端的长连接，使用被保留的 Fragment 会是个好主意。因为你希望该连接存活地尽可能久，只要 Activity 没有被销毁。但你也希望该连接在 Activity 被销毁时终止，所以让你用前台服务不是个好建议。

###这对 AsyncTask 意味着什么？

把 AsyncTask 换成 Loader。如果你没有加载数据，而是进行网络连接，那你应该使用 JobScheduler 以完成更好的网络访问和后台任务。

##但我的 App 是特别的

是的，有些 App B格比较高，下面是更高级的建议。

###我的 App 必须不改变方向！

无论是设计得很酷的游戏还是媒体播放器，还是希望保护连旋转设备是啥不都不知道的小孩，你可以选择让 App 锁定一个布局，这样无论用户怎么玩弄他的设备，都不会发生改变。

```xml
<activity android:name=".MyActivity"
  android:screenOrientation="landscape"
  android:label="@string/app_name">
```

这样，你的应用可能在平板设备上出现问题，因为你把它锁定为 landscape，而此时显示区域大于你的布局。所以你就需要使用 setRequestedOrientation() 方法而不是在 Manifest 文件中完成该设置了。

###等会，回来。屏幕旋转不是个坏设计，对吧？

错。屏幕旋转可能会非常复杂。这里有多种选项，而这意味着你可以创建很酷的用户体验，基于 App 想要实现的效果。例如，依赖传感器或颠倒 View，或让 Activity 在旋转后停留在新 Activity 的背后。

###然而我用的是 Fragment，而不是 Activity

没关系，这里的目标是控制状态，对吧？Activity 有的一切 Fragment 都可以用，事实上，你也可以在 Fragment 中保存状态：onSaveInstanceState()。为了 恢复状态，你可以访问 onCreate()，onCreateView(), 或 onActivityCreated() 中的 Bundle。

> Note: Fragment 的生命周期非常值得认真学习，如果你是初学者的话可以去看看文档。