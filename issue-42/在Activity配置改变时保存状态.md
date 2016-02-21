在Activity配置改变时保存状态
---

> * 原文链接 : [Activity Revival and the case of the Rotating Device](https://medium.com/google-developers/activity-revival-and-the-case-of-the-rotating-device-167e34f9a30d#.mmqbihfo6)
* 原文作者 : [Joanna Smith](https://medium.com/@dontmesswithjo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



You never know what might kill your Activity, which is why you need to be prepared. But I’m sure many developers have heard that rotating the device means your Activity will be restarted. The bigger question, though, is not whether you are aware of that fact, but whether your app is prepared for the truth of it.

可能很多开发者知道旋转设备会让 Activity 重启，但知道这一点并不重要，因为这不能帮你解决什么问题，你需要知道的是，为什么旋转设备会让 Activity 重启，以及这种情况发生时你要怎么应对。

##Understanding Configuration Changes
##理解配置改变
First, “rotating the screen” is not the actual scenario we are talking about today. Because any configuration change will cause Android to restart your Activity. A configuration change might be the device rotating (because now we have a different screen layout to draw upon), or it could be a language switch (because we need to re-write all those strings, which may need more room now OR it could be the scary RTL switch!), or even keyboard availability. What’s happening here is that the system is trying to be helpful and reload your app with the correct resources.

首先，“旋转屏幕”不是我们今天讨论的场景，因为任何配置的改变都会导致 Android 内核重启你的 Activity，配置改变可能是设备旋转（因为需要绘制不同的布局），也可能是系统语言切换（因为我们需要重新显示字符串，而这可能会需要更多/更少的空间以显示对应的字符），也可能是当前键盘的可用性。而以上所提到的种种，实质都是系统正尝试帮助你的 App 以正确的资源完成加载。

##What’s actually happening to my app?
##到底发生了什么？
By reloading your app, what the system is actually doing is calling onDestroy() and then immediately calling onCreate(). This way, your Activity is as fresh as possible, with all of the right creation data (even though the user has been with you the entire time).

> Note: This is one of those times where it’s important to understand the Activity lifecycle. So feel free to take a moment to go over that, if you’d like a refresher.

通过重新加载 App，系统真正做的是调用 onDestroy()，然后立刻调用 onCreate()，这样你的 Activity 上加载的都会是正确的数据。

> Note: 此时理解 Activity 生命周期就变得重要了，如果你是初学者，不妨花点时间理解它。

##Okay, so what do I do?
##那我该怎么办呢？
Well, you have options. I’ll walk you through them, and you can decide what will be best for you app (and your own development sanity).

现在你有几个可选项，我会一一交给你，你可以为你的 App 选择最优解。

###Let the system save your state for you
##让系统为你保存状态
This is the quick — and obvious — fix. (And it’s probably something you should do anyway.) But in the Activity lifecycle, there is this beautiful step onSaveInstanceState() that will be called before onDestroy().

这是最快，也是最明显的解决办法（甚至可能是你现在应该做的）在 Activity 的生命周期中，onSaveInstanceState() 会在 onDestroy() 之前被调用。

And, when your Activity is created, there’s a matching step onRestoreInstanceState(), which will also be called automatically. All of these automatic steps mean that you can let the system worry about saving and loading your data, because you planned ahead and mapped out what was important. (Or, you can skip onRestoreInstanceState() and load your saved state from the Bundle that comes with onCreate(). This is a personal preference moment. onRestoreInstanceState() is useful if you’d like your onCreate() to be completely finished before trying to load the user state. Otherwise, it shouldn’t matter.)

当 Activity 被创建，会自动调用 onRestoreInstanceState() 方法并在其中完成一次匹配，这会使系统为保存和加载你的数据担忧，因为你已经提前计划并映射重要的内容了。（你也可以跳过 onRestoreInstanceState() 并用 onCreate() 中的 Bundle 参数加载你保存的状态，选择哪种方式取决于你的偏好。如果你希望在尝试加载用户状态前 onCreate() 已经完全结束的话，onRestoreInstanceState() 会更有用些，要不然的话区别不大。）

In this way, you can manage all of the relevant data, and be confident that it will be available, even if your user is a child who hasn’t quite figured out gravity yet.

> Note: onSaveInstanceState() isn’t a guarantee, but it will be called for these situations. Because the system wants to preserve your state across interruptions (which a screen orientation change is), but doesn’t really care when the user hits the back button because they are done using your app (which sounds like a fair optimization to me).

这样你可以管理所有相关的数据，即便你的用户是个连重力方向都搞不清楚的小孩。

> Note: 但 onSaveInstanceState() 不能保证你的状态被保存，它只会在这些情况被调用。因为系统想在中断时保存你的状态（屏幕方向改变），但系统不太在意用户何时点击后退按钮，因为这是通过 App 完成的（怎么我听起来反倒像系统为我做了优化呢）。

###But I need more control!
###但我需要更多的控制！
Okay, that’s fair. Maybe you’ve got a lot of data to save, or maybe you’re not just trying to preserve the state, but your app actually changes between portrait and landscape. The layouts will handle redrawing the buttons and creating the leftnav, but maybe you want to take manual control over those changes. Or maybe you want to distinguish between the screen rotating, the language changing, and your app simple losing focus. That’s fair. These are different. And for you, I have another awesome callback: onConfigurationChanged(). This will come with its own Configuration object, so that you can see exactly what’s up, and your app can respond to precisely the changes you care about.

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

The catch here is that you must now manage these configuration changes. Everything you don’t react to will simply not affect your app. So in being particular, you must also be careful. So, in your manifest, you need to tell the system which config changes you agree to take responsibility for.

但这也意味这你必须自己管理配置改变，任何你没有管理的改变都不会在你的应用上体现出来，所以你要重视这一点。在 Manifest 上你需要指出哪些配置改变是你需要观察的：

```xml
<activity android:name=".MyActivity"
  android:configChanges="orientation|keyboardHidden"
  android:label="@string/app_name">
```

You’ve got plenty of options, and some are subtly different from the others (like screenLayout vs orientation vs layoutDirection), so be sure to take the time to make thoughtful decisions here. Handle what you care about, and trust the rest to the system.

现在你已经知道解决的手段了，其中一些办法和其他的办法由微妙的区别（例如 screenLayout vs orientation vs layoutDirection),所以你必须深思熟虑并作出你的决定，处理你真正在意的情况，其他的交给系统。

> Note: Which brings me to the first instance of Developers Who Make Me Sad. Some developers out there believe that they can avoid dealing with screen rotations at all by claiming responsibility for orientation changes and then simply not reacting. This is wrong for two reasons: 1.) Users like to use their devices. Don’t dictate to them what they can and can’t do. 2.) If your app only works in one orientation by design, then you should lock your app in that orientation. This makes you a special case, so scroll down and read about yourself.

> Note: 有些开发者认为他们完全可以通过声明哪些东西应该为屏幕旋转负责以避免处理屏幕旋转，这种想法是错的，因为：1、用户不希望被告知哪些能做，哪些不能做；2、如果应用只能在一个方向被使用，你就应该把应用锁定在那个方向上。

###What about my background work??
###那后台任务怎么办？
Should be fine, since we’re only dealing with Activities. Except, you know, AsyncTasks. Since an AsyncTask is generally tethered to an Activity, you don’t want to risk the AsyncTask being restarted every time the Activity is. That could ruin any chance of your network download finishing, or completely break whatever task the AsyncTask was asked to do. So, the system will not destroy AsyncTasks when the Activity is restarted.

因为我们只需要处理 Activity 中存在的情况，所以这不是问题，除非你用的是 AsyncTask。因为 AsyncTask 一般与 Activity 关联，而你又不希望 AsyncTask 跟着 Activity 一次又一次重启，因为这可能会让你的下载任务无法完成，或者终止 AsyncTask 需要完成的任务。所以系统不会在 Activity 重启时销毁 AsyncTask。

This is kind of scary, because #perfmatters and your AsyncTask might be holding a reference to that destroyed Activity. (Any AsyncTask created as a non-static inner class of that Activity will obviously hold a reference to it.) You see the memory leak problem is that situation, don’t you?

听起来有点恐怖，因为 AsyncTask 可能持有 被销毁 Activity 的引用（该 Activity 中任何被创建的 AsyncTask 非静态内部子类都会显示持有该引用），而这会带来内存泄漏的问题。

Let me guess what you’re going to say: you solve this problem by using your AsyncTask in a retained fragment. This may seem clever, but it isn’t the best choice. The clever choice would be to move away from AsyncTask entirely and embrace a Loader. (And, lucky for you, we even have a whole protip just about Loaders.)

可能你会说：那我在 Fragment 里用 AsyncTask 不就好了。这个想法看起来很 6，但不是最佳选项，更好的选择应该是：完全移除 AsyncTask，用 Loader 完成你的任务。

###Let’s pause to talk about retained fragments
###忘了 Fragment
It’s very easy to misuse a retained fragment. And while it isn’t inherently bad, there is probably a better option. Like using a retained fragment to keep your AsyncTask alive — that’s a problem better solved by a Loader in the first place. Or using your retained fragment to retain a View or Adapter and make your development life easier — but this is wrong because those objects are tied to Activities, which means you’re causing crazy memory leaks.

很容易误用被保存的 Fragment，为了避免这样的情况，我们还有更好的选择 - 用 Loader。或用被保存的 Fragment 保存 View 或 Adapter，但这样做是错的，因为这些对象都与 Activity 绑在一起，这就意味着你正在造成严重的内存泄漏。

But if you’re maintaining a persistent connection to your chat client, that’s actually a really good reason to use a retained fragment. Because you want that connection to survive as long as your Activity is active (and a transitional destroy/create for a config change is still active). But, you also want that connection to die a true death when the Activity does, so telling you to use a foreground service instead would be bad advice here. So, basically, just be thoughtful about your use of a retained fragment, and consider the alternatives. And, of course, feel free to argue with me.

如果你正维持与聊天客户端的长连接，使用被保留的 Fragment 会是个好主意。因为你希望该连接存活地尽可能久，只要 Activity 没有被销毁。但你也希望该连接在 Activity 被销毁时终止，所以让你用前台服务不是个好建议。

###So what does this mean for AsyncTask?
###这对 AsyncTask 意味着什么？
Well, try to replace your AsyncTasks with Loaders, for one. And if you aren’t loading data, but making a network connection, then you should be using JobScheduler for smarter network access and background work. (There’s a protip about that, as well!)

把 AsyncTask 换成 Loader。如果你没有加载数据，而是进行网络连接，那你应该使用 JobScheduler 以完成更好的网络访问和后台任务。

##But my app is special
##但我的 App 是特别的
Yes, yes, some apps are different. And I’ve got answers for those developers, as well.

是的，有些 App B格比较高，下面是更高级的建议。

###My app must not change orientation!
###我的 App 必须不改变方向！
Whether by design for your super cool game or video player, or out of protection against toddlers who don’t understand to not rotate the device, you can choose to lock your app into one layout. Then, no matter how many times the user tilts the device, it’ll never change.

With one simple manifest parameter, your display is locked. The cool thing about this, though, is that you specify orientation at the Activity level, so that you can apply it to the parts of your app where you care, or to the entire thing, if needed. It’s all about ~design~.

无论是设计得很酷的游戏还是媒体播放器，还是希望保护连旋转设备是啥不都不知道的小孩，你可以选择让 App 锁定一个布局，这样无论用户怎么玩弄他的设备，都不会发生改变。

```xml
<activity android:name=".MyActivity"
  android:screenOrientation="landscape"
  android:label="@string/app_name">
```

Now, if your app is failing on tablets, it could be because you locked it in landscape on a smaller screen. Little tablets are a thing, you know. So maybe you’d rather control the orientation with setRequestedOrientation() instead of a never-changing manifest parameter. (This is one of those fun moments where you get to use onResume().)
Essentially, though, I challenge you to be thoughtful. (Again.) Because orientation is not as simple as deciding your game only works in landscape and then taking a nap.

这样，你的应用可能在平板设备上出现问题，因为你把它锁定为 landscape，而此时显示区域大于你的布局。所以你就需要使用 setRequestedOrientation() 方法而不是在 Manifest 文件中完成该设置了。

###Wait, go back. Screen orientation is NBD, right?
###等会，回来。屏幕旋转不是个坏设计，对吧？
Wrong. Screen orientation can be surprisingly complex. There are so many options, and that means you can create a truly magical user experience, based on precisely what your app wants to accomplish. For example, you can rely on sensors, or reversed views, or get as fancy as having your Activity oriented based on whichever orientation the Activity behind this one was using. #woah

错。屏幕旋转可能会非常复杂。这里有多种选项，而这意味着你可以创建很酷的用户体验，基于 App 想要实现的效果。例如，依赖传感器或颠倒 View，或让 Activity 在旋转后停留在新 Activity 的背后。

###Uh, I use Fragments, not Activities.
###然而我用的是 Fragment，而不是 Activity
That’s okay! The goal here is to manage state, right? And a Fragment offers some pretty convenient equivalents to everything an Activity offers. In fact, it’s the same method to save your state from a Fragment: onSaveInstanceState(). To restore your state, you can access that bundle from onCreate(), onCreateView(), or onActivityCreated(). Just choose the best timing for your app, and load your state when it feels right.

> Note: Again, it really helps to have a solid understanding of how the Fragment lifecycle works, so take a look at the docs if you’d like a refresher.

So take a look at what your app is doing when config changes hit, and see if there’s a way any of these tips can help you to #BuildBetterApps.

Follow the Android Development Patterns Collection for more!

没关系，这里的目标是控制状态，对吧？Activity 有的一切 Fragment 都可以用，事实上，你也可以在 Fragment 中保存状态：onSaveInstanceState()。为了 恢复状态，你可以访问 onCreate()，onCreateView(), 或 onActivityCreated() 中的 Bundle。

> Note: Fragment 的生命周期非常值得认真学习，如果你是初学者的话可以去看看文档。