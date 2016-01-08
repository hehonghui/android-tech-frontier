如何在Android上响应各种信息通知
---

> * 原文链接 : [How to respond to any* messaging notification on Android](https://medium.com/@polidea/how-to-respond-to-any-messaging-notification-on-android-7befa483e2d7)
* 原文作者 : [Michał Tajchert](https://github.com/tajchert/NotificationResponse)
*  [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [MrLoong](https://github.com/MrLoong) 
* 校对者: [bboyfeiyu ](https://github.com/bboyfeiyu)  
* 状态 :  完成 



有没有想过使用你的代码去回应未知的发送者是多么酷的事情？作为一家痴迷于最新技术的公司，我想和大家一起分享我们的一些研究

如果你是Android用户，你可能会喜欢 [Pushbullet](https://www.pushbullet.com/)这个令人敬畏的App，它是一个越过设备同步你所有的消息的App，包括Pc和Mac，自从二月的更新，它允许回应消息给应用程序，例如Facebook Messenger，Hangouts，Telegram 等等 -难道不让人敬畏？可以确定！并没有易于实施的API接口去实现这些，基本上每一个平台都需要我们实现所有客户的连接，但这不是一个好的解决方案。

作为一个喜欢此功能的用户，我们的工程师Michał Tajchert开始专研这个主题后他的好奇心被Reddit上的一个“它是怎么运行的”问题而引发，这个功能一定已经与Android Wear API发生了连接，作者是这样说的。小提示下，Android Wear是提供给智能手表的平台。更具体的讲，我们并不是谈论关于智能手表全新的数据API或消息API，但除了一些已经存在的小通知。由于Android Wear的介绍，我们可以增添一个被叫做"WearableExtender"的小物件，增添一些针对智能手表的功能，像活动页，背景，语音输入等

```java
	RemoteInput remoteInput = new RemoteInput.Builder(EXTRA_VOICE_REPLY).build();
	 
	NotificationCompat.Action action =
	        new NotificationCompat.Action.Builder(...)
	                .addRemoteInput(remoteInput)
	                .build();
	 
	NotificationCompat.WearableExtender wearableExtender = new NotificationCompat.WearableExtender().addAction(action);
	 
	NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(MainActivity.this).extend(wearableExtender);
```

在上面的代码我们可以看到，我们已经新建RemoteInput(一个收集语音应答的对象),RemoteInput被作为一个Action添加到我们的WearableExtender对象，最终被添加带Notification他自己本身。如果你有一个显示通知并等待用户我文本响应的App(任何类似的App)，这是一个完美的解决方案对你来说。大多流行App都已经实现了。仅有非常少数的App仍然缺乏这点，像Skype 正在计划添加这个功能在接下来的几周。

![我们使用这个技巧的事例应用程序，当用户点击程序按钮，他将回应Messenger conversation](https://d262ilb51hltx0.cloudfront.net/max/800/1*IlV2iOqJ5L9fgK-6_4l-bg.gif)

我们使用这个技巧的事例应用程序，当用户点击程序按钮，他将回应Messenger conversation

##怎样捕获通知?

在Android上还是比较容易实现的，只要实现你自己的service，继承NotificationListenerService并且实现onNotificationPosted() and onNotificationRemoved()方法，这样任何通知的出现或被取消都会被感知。安全访问通知的完成是通过提示屏幕列表中能访问你的通知和能够选中或取消任何的应用程序通知。对于UX来说这并不是一个好的应用，因为它是全屏幕（所以这样的互动应该离开我们的App），一个更好的模式是有一个列表应程序替代询问我们特殊权限的应用程序窗口。

##让我们看看如何可以访问WearableExtender

第一种方式，这样做实际上是由一些用户在网上发布，从pushbulle源提取，随着一些代码的完善使它工作，这是什么样子的：

```java
	Bundle bundle = statusBarNotification.getNotification().extras;
	for (String key : bundle.keySet()) {
	    Object value = bundle.get(key);
	 
	    if("android.wearable.EXTENSIONS".equals(key)){
	        Bundle wearBundle = ((Bundle) value);
	        for (String keyInner : wearBundle.keySet()) {
	            Object valueInner = wearBundle.get(keyInner);
	 
	            if(keyInner != null && valueInner != null){
	                if("actions".equals(keyInner) && valueInner instanceof ArrayList){
	                    ArrayList<Notification.Action> actions = new ArrayList<>();
	                    actions.addAll((ArrayList) valueInner);
	                    for(Notification.Action act : actions) {
	                        if (act.getRemoteInputs() != null) {//API > 20 needed
	                            android.app.RemoteInput[] remoteInputs = act.getRemoteInputs();
	                        }
	                    }
	                }
	            }
	        }
	    }
	}
```

[WearableExtenderGetter](https://gist.github.com/tajchert/5a45deef2de9d667eb81#file-wearableextendergetter) hosted with ❤ by [GitHub](https://github.com/)

在这里刚刚发生了什么？首先，我们从WearableExtender中的参数分布提取出了Bundle通知，然后我们搜索一个能让我们访问所有Android Wear特殊的功能关键值“android.wearable.EXTENSIONS”，例如页面.....我们正在寻找RemoteInput！为了找到它，我们需要遍历所有的功能。这就是实际的工作，但还是代码看起来很丑并且“hackish”。

![](https://d262ilb51hltx0.cloudfront.net/max/1375/1*BieupTbIh3rfs9hxruOvkQ.png)

##我们能比这做的更好吗?

当然！一行代码获得WearableExtender，会是多么的酷？

```java
	WearableExtender wearableExtender = new WearableExtender(statusBarNotification.getNotification());
```
[WearableExtenderGetter](https://gist.github.com/tajchert/5a45deef2de9d667eb81#file-wearableextendergetter) hosted with ❤ by [GitHub](https://github.com/)

好的，让我们现在直接提取Actions从RemoteInput中。

```java
	List< Action> actions = wearableExtender.getActions();
	for(Action act : actions) {
		if(act != null && act.getRemoteInputs() != null) {
	                RemoteInput[] remoteInputs = act.getRemoteInputs();
	        }
	}
```
[WearableExtenderGetter](https://gist.github.com/tajchert/5a45deef2de9d667eb81#file-wearableextendergetter) hosted with ❤ by [GitHub](https://github.com/)

好的，但是我们还需要做些什么呢？我们需要PendingIntent发送我们的返回结果给应用程序，使它触发通知并且他也将很好的保持Bundle，因为他可能包含一些额外的价值，例如conversationId，让我们去实现它

```java
	notificationWear.pendingIntent = statusBarNotification.getNotification().contentIntent;
	notificationWear.bundle = statusBarNotification.getNotification().extras;
```

[WearableExtenderGetter](https://gist.github.com/tajchert/5a45deef2de9d667eb81#file-wearableextendergetter) hosted with ❤ by [GitHub](https://github.com/)

现在我们准备返回它！探究一下我们的事例应用程序，加速POC的开发过程，通过的数据以EventBus为媒介转到Activity被保存在Stack，当用户点击“Respond to last”直接就突出最后题目并且伪造响应文本给它

##填充RemoteInput

大概最有趣的部分是怎么能够填补一个对象，通常需要语音输入我们虚假的文字，它并不是很难。

```java
	RemoteInput[] remoteInputs = new RemoteInput[notificationWear.remoteInputs.size()];
	 
	Intent localIntent = new Intent();
	localIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
	Bundle localBundle = notificationWear.bundle;
	int i = 0;
	for(RemoteInput remoteIn : notificationWear.remoteInputs){
	    getDetailsOfNotification(remoteIn);
	    remoteInputs[i] = remoteIn;
	    localBundle.putCharSequence(remoteInputs[i].getResultKey(), "Our answer");//This work, apart from Hangouts as probably they need additional parameter (notification_tag?)
	    i++;
	}
	RemoteInput.addResultsToIntent(remoteInputs, localIntent, localBundle);
	try {
	    notificationWear.pendingIntent.send(MainActivity.this, 0, localIntent);
	} catch (PendingIntent.CanceledException e) {
	    Log.e(TAG, "replyToLastNotification error: " + e.getLocalizedMessage());
	}
```

我们的notificationWear对象是一个暂时存放所有需要数据来响应特殊通知的容器，然后我们把每一个RemoteInput从我们保存的通知中填充到我们所期望的文本，通过使用putCharSequence()方法在Bundle返回。这里的关键是使用getResultKey()在每一个RemoteInput，因为被调用的程序将在返回Bundle答复文本。最后一步我们需要使Intent移植于RemoteInputs对于那些虚假的回应，让我们使用addResultsToIntent(inputs, intent, bundle)这样做。现在我们准备好所有的数据去触发PendingIntent，触发叫做pendingIntent.send(context, code,intent)的方法。这是全部，我们只是回应在Messenger，Telegraph，Line 或是任何其他使用WearableExtender与RemoteInput的应用程序！这种方法仍然缺少Hangouts，可能需要一些额外的参数，我最好的猜测是在其他Tag中的StatusBarNotification如果其他的（工作）应用程序也是空的。

##帅不？

是的，是这样。仔细看一看Pushbullet是他被允许做的非常好的事情。但是在我们的办公室，值得被的关注的是，用户被提示选择应用程序读取通知和使用这个技巧，我们可以应对任何通知。还有，我们不但可以响应也可以缓存需要被触发的数据，例如，一些用在Messenger中以后使用的对话，同时，潜在的，它允许你发送短信在没有正确权限，因为你“just responded to a notification”和偶然有短信应用程序。现在在Android默认文本消息的应用程序不包括WearableExtender，但也许这只是时间问题，而且Hangouts允许你发送短信。

##时刻保持安全

什么是单向的，可以做其他工作的，这就意味着如果你正在开发一个Wear-enabled用用程序，其他的开发人员可能会回复你的通知，后来出现RemoteInput黑客，让我们想想如何保持安全。最简单的方法是生成一些ID对于每个通知并且允许他们只能使用一次，这样任何应用程序使用这个技巧不会发送过多的消息到你的应用程序。另一个方法是在Bundle中不包括一些参数，但是作为一个例子Tag中的Notification比较后接受。 这可能是我们为什么不能让黑客工作在Hangouts。从另一方面来讲，如果你是使用者你应该更加关注那些曾获取“reading notifications”应用程序，因为他现在也允许应用程序与他们互动。如果你想要一个测验或者帮助我们对于Hangouts的工作，这个样品在[Github](https://github.com/tajchert/NotificationResponse)上


