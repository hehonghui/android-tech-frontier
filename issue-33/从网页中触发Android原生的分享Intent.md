# Triggering a native Share intent on Android from the web
# 从网页中触发Android原生的分享Intent

> * 原文链接 : [Triggering a native Share intent on Android from the web](https://paul.kinlan.me/sharing-natively-on-android-from-the-web/?utm_source=Android+Weekly&utm_campaign=faec756f5a-Android_Weekly_179&utm_medium=email&utm_term=0_4eb677ad19-faec756f5a-337955857)
* 原文作者 : [Paul Kinlan](https://paul.kinlan.me/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明 : 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [MrSimple](https://github.com/bboyfeiyu) 
* 校对者 : [校对者的名字](https://github.com/这里写校对者的名字) 
* 状态 :  完成 

This story starts a long time, was tickled into existing after I visited FlipKart in Bangalore and was finalized after an internal conversation about the fact that it is impossible to trigger the share dialog in Android from the web. Lots of people want it, it turns out everyone thought it wasn’t possible. Any how…..

这是很久之前的事了，在我访问了班加罗尔（印度南部城市）的FlipKart以及进行了一场关于是否存在一种从web触发Android分享Intent方式的内部交流。很多小伙伴都想要这样的功能，但是它给很多人的感觉是无法实现。那么它究竟怎样才能实现呢......

I have fond memories of Web Intents and what it could have been…. Ok, I won’t lie, I cry in to my cup most nights about its failure.

对于web的Intent我还是有很多美好的记忆以及它们能够做些什么...好吧，其实我曾经也为这方面的失败而在很多个夜晚泪流满面~

Web Intents modeled the successful Android Intents ecosystem pretty closely and the primary use-case for Web Intents, like Android, was to provide a good sharing experience on the web. Rather than have a sea of social widgets on your page — one for each service a user might use — you have a single button that the user clicks to share some content and their OS or browser will decide how to show a list of services that can fulfill the users request. It was a glorious idea, [even if I do say so myself](https://en.wikipedia.org/wiki/Paul_Kinlan).

Android Intent系统成功地模仿了Web Intent，与Android一样，Web Intent的主要使用场景就是提供一种良好的分享体验。虽然有很多的社交组件在你的页面上，但是只有其中一个会平台会被用户选择。在页面中你定义了一个按钮，当用户点击这个按钮时就会触发分享操作，此时系统或者浏览器就会检测提供分享功能的服务，并且做出对用户的回应。不得不说这简直就是一个屌炸天的想法,即使想出这个方法的人是[我](https://en.wikipedia.org/wiki/Paul_Kinlan)。

Skip forward, the Web Intents project is dead, Android is incredibly popular and already has an ecosystem built around sharing between apps. The most powerful attribute of Android Intents in my opinion is that for most parts an Intent can be encoded as a simple URL using the intent: scheme. Chrome and every other browser on the platform support. However the only time it used on the web is to open up a user’s installed native app. For example: [intent:paul.kinlan.me#Intent;scheme=https;package=com.chrome.beta;end](intent:paul.kinlan.me#Intent;scheme=https;package=com.chrome.beta;end) will open my site in the Chrome Beta browser on Android.

不幸的是， Web Intents项目没有能够存活下来，而Android的Intent却坚持了下来，并且成为内置的应用间分享的形式。Android Intent最强悍它能够被解析成为类似URL的scheme，这个scheme能够被Chrome和其他浏览器支持。然而，在web上使用它的场景只是通过打开一个网页来让用户下载一个native的App。例如 [intent:paul.kinlan.me#Intent;scheme=https;package=com.chrome.beta;end](intent:paul.kinlan.me#Intent;scheme=https;package=com.chrome.beta;end) 会在Android版的Chrome打开一个站点。

The interesting thing is that you can’t just open any app on the users device. The app has to say to the system that it can be opened from the web by including <category android:name="android.intent.category.BROWSABLE" /> in the intent-filter.

有意思的是你不能直接启动系统中的其他app。这个app必须告诉系统它能够从web中被打开，这需要在intent-filter中声明 `<category android:name="android.intent.category.BROWSABLE" />` 。

A fuller example of what might be included in the Android Manifest follows.

完整的例子是你需要在Android Manifest中添加如下声明 : 

```
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
</intent-filter>
```

This is interesting, if you know Android you know that ACTION_SEND is by far the most popular Action and it is used mostly commonly for sharing data between apps.

如果你了解Android，那么你应该知道ACTION_SEND是一个非常流行的Action，它被用于在应用间分享数据。

In fact, Chrome itself fires an ACTION_SEND when the user chooses to share from inside the Chrome App and if you have the following declaration in your Android Manifest your app will appear in the Chrome Intent picker.

事实上，当用户在Chrome应用中进行分享时Chrome自己会触发一个ACTION_SEND，如果你在你的Android Manifest中定义了如下的声明，那么你的应用就会出现在备选应用列表中。

```
<!-- Used to handle Chrome then menu then share.-->
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/plain" />
    <data android:mimeType="image/*" />
</intent-filter>  
```

So. Big question. Does this just work from the web if I craft the correct looking intent url?

那么问题来了。如果我们制造一个类似的Intent url，那么能直接从web中直接触发类似的分享操作吗？

No. Well. Yes. But…. the apps that handle link sharing need to declare <category android:name="android.intent.category.BROWSABLE" /> and right now none do (that I can find) and they will need to define the following in their manifest:

可以说能，也可以说不能。要实现这样的功能，这个app必须申明另外一个特性，`<category android:name="android.intent.category.BROWSABLE" />`，现在我们的Android manifest看起来是如下这样的 : 

```
<!-- Used to handle Chrome then menu then share.-->
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:mimeType="text/plain" />
    <data android:mimeType="image/*" />
</intent-filter>  
```

Now, when apps have this it is pretty easy to open up Native Sharing from Chrome on Android.

现在，我们的app就可以从web直接从Android的Chrome打开native的分享Dialog了。

So let’s build up a share button.

让我们来构建一个分享按钮吧。

## 1. Create a basic share experience

## 1. 创建一个最基本的分享

Trigger the intent picker with using ACTION_SEND. Note: no data will be sent yet, it will just list apps that have said they can receive text (a URL for example).

通过ACTION_SEND来触发分享操作。注意 : 这里我们没有数据会被发送，它只是列出了可以接受数据的app。此时Intent url为 : 

```
intent:#Intent;action=android.intent.action.SEND;type=text/plain;end
```

<img src="https://paul.kinlan.me/images/intent-share-1.png" width="240">

## 2. Add a link to the share
## 2. 为这个分享添加一个链接

Add some data by encoding a String EXTRA_TEXT in to the Intent, for example: S.android.intent.extra.TEXT=https%3A%2F%2Fpaul.kinlan.me%2F

通过EXTRA_TEXT字段为Intent添加一些数据，例如 : S.android.intent.extra.TEXT=https%3A%2F%2Fpaul.kinlan.me%2F，此时Intent url为 : 

```
intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=https%3A%2F%2Fpaul.kinlan.me%2F;end
```

<img src="https://paul.kinlan.me/images/intent-share-2.png" width="240">

## Add a Subject
## 添加主题

We can also flesh out some extra information that you can send across to the app. For example Android lets you specify a “Subject” in the Intent, for example: S.android.intent.extra.SUBJECT=Amazing

我们可以再添加一些额外的信息，例如可以指定一个主题，对应的示例为 : S.android.intent.extra.SUBJECT=Amazing ，此时Intent url为 : 

```
intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=https%3A%2F%2Fpaul.kinlan.me%2F;S.android.intent.extra.SUBJECT=Amazing;end
```

<img src="https://paul.kinlan.me/images/intent-share-3.png" width="240">

## 4. Fallback to a webpage if there are no apps installed.
## 4. 当没有可以响应的App时反馈给网页

Quite frequently the user might not have any apps installed that can handle the request. In this case you will want to fallback to a web url that still allows the user to complete the task. This can be achieved by add in an S.browser_fallback_url Extra. In the following link the fallback is Twitter’s sharing widget.

经常出现没有能够响应用户的行为的app。在这种情况下我们想通过一个回调告诉发起该请求的网页，使得用户仍然能够完成这个操作。这项功能可以通过一个名为S.browser_fallback_url的属性设置。示例Intent url为 : 

```
intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=https%3A%2F%2Fpaul.kinlan.me%2F;S.android.intent.extra.SUBJECT=Amazing;S.browser_fallback_url=https:%3A%2F%2Ftwitter.com%2Fintent%2Ftweet;end
```

## That’s a wrap or what comes first? The chicken or the egg.
## 先有鸡还是先有蛋

Technically we have all the pieces. Our biggest challenge is not the URL string but the fact that Android apps for our favorite social sites and communications apps need to be updated. Once they are then this is a great way to invoke a sharing experience from the web.

从技术上来说，我们掌握了所有的技术点。我们最大的挑战不是URL本身，而是那些社交平台的app以及其他我们需要交互的app可以被更新（译者注 : 指的是通过Intent发布消息）。一旦他们这样做了，我们就可以通过这种方式通过web实现良好的分享体验。

My ideal solution is that one or two apps update their manifest and a couple of big players on the web commit to making creating an intent share URL for Android. But in the mean time, there are two apps that I know support it:

我的理想解决方案是如果一两个app更新了他们的manifest，那么如下两个大玩家就会更新对应的share url。我们知道的两个app是如下两个 : 

* [Plaid](http://plaidapp.io/)
* [Intent Intercept](https://play.google.com/store/apps/details?id=uk.co.ashtonbrsc.android.intentintercept&hl=en)

If you want your app in this list, just add Category Browsable and let me know, otherwise just sit and wathc this demo.

如果你想让你的app出现在上面的列表中，你只需要添加对应的Category，并且让我知道。否则你就好好待着，然后观看这个[Demo视频](https://youtu.be/weaNw_S7E4w)。

## 拓展阅读

* [知乎Android客户端拒绝服务漏洞（可远程攻击利用）](http://www.wooyun.org/bugs/wooyun-2015-0121081)
* [Intent scheme URL 攻击](http://drops.wooyun.org/papers/2893)
