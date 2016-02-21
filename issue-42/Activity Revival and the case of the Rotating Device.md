Activity Revival and the case of the Rotating Device
---

> * 原文链接 : [Activity Revival and the case of the Rotating Device](https://medium.com/google-developers/activity-revival-and-the-case-of-the-rotating-device-167e34f9a30d#.mmqbihfo6)
* 原文作者 : [Joanna Smith](https://medium.com/@dontmesswithjo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



You never know what might kill your Activity, which is why you need to be prepared. But I’m sure many developers have heard that rotating the device means your Activity will be restarted. The bigger question, though, is not whether you are aware of that fact, but whether your app is prepared for the truth of it.

##Understanding Configuration Changes
First, “rotating the screen” is not the actual scenario we are talking about today. Because any configuration change will cause Android to restart your Activity. A configuration change might be the device rotating (because now we have a different screen layout to draw upon), or it could be a language switch (because we need to re-write all those strings, which may need more room now OR it could be the scary RTL switch!), or even keyboard availability. What’s happening here is that the system is trying to be helpful and reload your app with the correct resources.

##What’s actually happening to my app?
By reloading your app, what the system is actually doing is calling onDestroy() and then immediately calling onCreate(). This way, your Activity is as fresh as possible, with all of the right creation data (even though the user has been with you the entire time).

> Note: This is one of those times where it’s important to understand the Activity lifecycle. So feel free to take a moment to go over that, if you’d like a refresher.

##Okay, so what do I do?
Well, you have options. I’ll walk you through them, and you can decide what will be best for you app (and your own development sanity).

###Let the system save your state for you
This is the quick — and obvious — fix. (And it’s probably something you should do anyway.) But in the Activity lifecycle, there is this beautiful step onSaveInstanceState() that will be called before onDestroy().

And, when your Activity is created, there’s a matching step onRestoreInstanceState(), which will also be called automatically. All of these automatic steps mean that you can let the system worry about saving and loading your data, because you planned ahead and mapped out what was important. (Or, you can skip onRestoreInstanceState() and load your saved state from the Bundle that comes with onCreate(). This is a personal preference moment. onRestoreInstanceState() is useful if you’d like your onCreate() to be completely finished before trying to load the user state. Otherwise, it shouldn’t matter.)

In this way, you can manage all of the relevant data, and be confident that it will be available, even if your user is a child who hasn’t quite figured out gravity yet.

> Note: onSaveInstanceState() isn’t a guarantee, but it will be called for these situations. Because the system wants to preserve your state across interruptions (which a screen orientation change is), but doesn’t really care when the user hits the back button because they are done using your app (which sounds like a fair optimization to me).

###But I need more control!
Okay, that’s fair. Maybe you’ve got a lot of data to save, or maybe you’re not just trying to preserve the state, but your app actually changes between portrait and landscape. The layouts will handle redrawing the buttons and creating the leftnav, but maybe you want to take manual control over those changes. Or maybe you want to distinguish between the screen rotating, the language changing, and your app simple losing focus. That’s fair. These are different. And for you, I have another awesome callback: onConfigurationChanged(). This will come with its own Configuration object, so that you can see exactly what’s up, and your app can respond to precisely the changes you care about.

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

```xml
<activity android:name=".MyActivity"
  android:configChanges="orientation|keyboardHidden"
  android:label="@string/app_name">
```

You’ve got plenty of options, and some are subtly different from the others (like screenLayout vs orientation vs layoutDirection), so be sure to take the time to make thoughtful decisions here. Handle what you care about, and trust the rest to the system.

> Note: Which brings me to the first instance of Developers Who Make Me Sad. Some developers out there believe that they can avoid dealing with screen rotations at all by claiming responsibility for orientation changes and then simply not reacting. This is wrong for two reasons: 1.) Users like to use their devices. Don’t dictate to them what they can and can’t do. 2.) If your app only works in one orientation by design, then you should lock your app in that orientation. This makes you a special case, so scroll down and read about yourself.

###What about my background work??
Should be fine, since we’re only dealing with Activities. Except, you know, AsyncTasks. Since an AsyncTask is generally tethered to an Activity, you don’t want to risk the AsyncTask being restarted every time the Activity is. That could ruin any chance of your network download finishing, or completely break whatever task the AsyncTask was asked to do. So, the system will not destroy AsyncTasks when the Activity is restarted.

This is kind of scary, because #perfmatters and your AsyncTask might be holding a reference to that destroyed Activity. (Any AsyncTask created as a non-static inner class of that Activity will obviously hold a reference to it.) You see the memory leak problem is that situation, don’t you?

Let me guess what you’re going to say: you solve this problem by using your AsyncTask in a retained fragment. This may seem clever, but it isn’t the best choice. The clever choice would be to move away from AsyncTask entirely and embrace a Loader. (And, lucky for you, we even have a whole protip just about Loaders.)

###Let’s pause to talk about retained fragments
It’s very easy to misuse a retained fragment. And while it isn’t inherently bad, there is probably a better option. Like using a retained fragment to keep your AsyncTask alive — that’s a problem better solved by a Loader in the first place. Or using your retained fragment to retain a View or Adapter and make your development life easier — but this is wrong because those objects are tied to Activities, which means you’re causing crazy memory leaks.

But if you’re maintaining a persistent connection to your chat client, that’s actually a really good reason to use a retained fragment. Because you want that connection to survive as long as your Activity is active (and a transitional destroy/create for a config change is still active). But, you also want that connection to die a true death when the Activity does, so telling you to use a foreground service instead would be bad advice here. So, basically, just be thoughtful about your use of a retained fragment, and consider the alternatives. And, of course, feel free to argue with me.

###So what does this mean for AsyncTask?
Well, try to replace your AsyncTasks with Loaders, for one. And if you aren’t loading data, but making a network connection, then you should be using JobScheduler for smarter network access and background work. (There’s a protip about that, as well!)

##But my app is special
Yes, yes, some apps are different. And I’ve got answers for those developers, as well.

###My app must not change orientation!
Whether by design for your super cool game or video player, or out of protection against toddlers who don’t understand to not rotate the device, you can choose to lock your app into one layout. Then, no matter how many times the user tilts the device, it’ll never change.

With one simple manifest parameter, your display is locked. The cool thing about this, though, is that you specify orientation at the Activity level, so that you can apply it to the parts of your app where you care, or to the entire thing, if needed. It’s all about ~design~.

```xml
<activity android:name=".MyActivity"
  android:screenOrientation="landscape"
  android:label="@string/app_name">
```

Now, if your app is failing on tablets, it could be because you locked it in landscape on a smaller screen. Little tablets are a thing, you know. So maybe you’d rather control the orientation with setRequestedOrientation() instead of a never-changing manifest parameter. (This is one of those fun moments where you get to use onResume().)
Essentially, though, I challenge you to be thoughtful. (Again.) Because orientation is not as simple as deciding your game only works in landscape and then taking a nap.

###Wait, go back. Screen orientation is NBD, right?
Wrong. Screen orientation can be surprisingly complex. There are so many options, and that means you can create a truly magical user experience, based on precisely what your app wants to accomplish. For example, you can rely on sensors, or reversed views, or get as fancy as having your Activity oriented based on whichever orientation the Activity behind this one was using. #woah

###Uh, I use Fragments, not Activities.
That’s okay! The goal here is to manage state, right? And a Fragment offers some pretty convenient equivalents to everything an Activity offers. In fact, it’s the same method to save your state from a Fragment: onSaveInstanceState(). To restore your state, you can access that bundle from onCreate(), onCreateView(), or onActivityCreated(). Just choose the best timing for your app, and load your state when it feels right.

> Note: Again, it really helps to have a solid understanding of how the Fragment lifecycle works, so take a look at the docs if you’d like a refresher.

So take a look at what your app is doing when config changes hit, and see if there’s a way any of these tips can help you to #BuildBetterApps.

Follow the Android Development Patterns Collection for more!