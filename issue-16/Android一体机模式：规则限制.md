# Android 一体机模式：规则限制
-----

> * 原文链接 : [Android Kiosk Mode: Rules for Restrictions](http://cases.azoft.com/android-kiosk-mode-rules-restrictions/)
* 原文作者 : [Anna Voronova](http://cases.azoft.com/android-kiosk-mode-rules-restrictions/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Rocko](https://github.com/zhengxiaopeng) 
*  校对者: [](https://github.com/) 
* 状态 :  校对中
   
   
   
![Android Kiosk Mode: Rules for Restrictions](http://cases.azoft.com/images/2015/06/Android-Kiosk-Mode-Rules-for-Restrictions.png)

Kiosks are everywhere. Of course, we’re not talking about ice cream or lemonade stands here, our post is about interactive information kiosks.

生活中我们随处都可见到一体机，当然了我们在这谈论的并不是卖冰激凌和柠檬水的售货一体机，我们这篇文章是关于交互式信息一体机的。

A typical information kiosk is a computer terminal, which the user can use to perform a limited set of actions. Common examples are ATMs, photo booths, automated ticket and check-in kiosks, and others.

电脑的终端就是一个典型的信息一体机，用户可以使用它来执行一组有限的动作。其它常见的例子还有如 ATM 机、照相亭、自动售票机、自助登机服务终端系统、等等。

Interactive kiosks use various technologies: touch screen, bill acceptor, photo and video cameras, printers and scanners, Wi-Fi, NFC, etc. But their common feature is a strong protection system against unauthorized activity. The software used in such terminals doesn’t allow the user to change the system’s settings, reset, or install additional applications.

交互式信息一体机使用了各种技术：触摸屏、纸币识别器、相机、打印机、扫描仪、Wi-Fi、NFC 等等。它们的共同特点是对未经授权的活动有强有力的保障体系。这样的终端下使用的软件不允许用户去改变系统的设置，重置或安装其它应用程序。 


## Mobile kiosks

## 移动一体机

Rapid development of mobile technologies has revolutionized kiosks. Smartphones and tablets are now commonly used as information kiosks. Mobile kiosks have a number of significant advantages over standard terminals: they are cheaper due to the compact size and mass production, but also have a broader functionality. Mobile kiosks are used as electronic menus in restaurants, manuals for sales assistants in stores and showrooms, etc. Whatever the purpose is, it’s important that when a mobile device serves the purpose of a kiosk, it should not be used for any other purposes.

[移动技术](http://www.azoft.com/mobile-application-development.htm) 的快速发展也使一体机有了革命性的发展。智能手机和平板电脑是现在常用的一体机。移动一体机跟标准的终端相比有很多明显的优势：由于紧凑的尺寸和大量生产而更加便宜，但是也有更多的功能。移动一体机在餐馆中被用作电子菜单，在商店和展厅中的销售助手等等。无论目的是什么，重要的是当一个移动设备提供一体机的功能为目的时它就不应该被用于任何其它目的。

[Share to Twitter: Mobile kiosks have a number of significant advantages over standard terminals](https://twitter.com/share?text=Mobile+kiosks+have+a+number+of+significant+advantages+over+standard+terminals&via=azoft&related=azoft&url=http://bit.ly/1Gwux0z)

To make the device work in kiosk mode, it needs to run a program that blocks the typical functions of the operating system and does not allow the user to exit application. Kiosk apps may have a secret administrative panel or be remotely configured from the server. You can also configure system reports: the app will send statistics about user behavior to the server and inform the administrator about its status.

为了使设备在一体机模式（kiosk mode，或说展台模式）下工作，需要运行一个程序，此程序会冻结掉操作系统的常见功能且它不允许用户退出程序。一体机的应用程序可能有一个秘密隐藏的管理面板或者从服务器控制的远程配置。你也可以配置系统报告：程序会将有关用户行为的数据发送给服务器，并将相关状态通知给管理员。

Below, we will share some of our experience working with kiosk mode applications for Android devices. We’ll discuss some of the pitfalls of their development and ways to solve common problems.

下面，我们将分享一些我们在 [Android 一体机应用程序](http://www.azoft.com/google-android-development.htm) 方面的经验。我们也会讨论下开发中的一些陷阱和解决方案。


## Android Kiosk Mode

## Android一体机模式

To turn an Android device into a kiosk, it’s a good idea to lock all of its buttons and connectors. In this case, the most banal and at the same time the most effective solution would be to place your device in a vandal-proof box or a specialized stand. This, however, isn’t always possible. Besides, the status bar, system dialogs, and virtual keypad can still be accessed by any user and settings can be changed. How do you avoid all these problems?

把一台 Android 设备变为一体机，这是锁定其所有按键和连接器的好方法。在这种情况下，最普通也最有效的解决办法是把你的设备放置在一个防爆盒或者一个专门的地方中，然而这可能都是不可选的方法。此外，状态栏，系统对话框和虚拟小键盘仍然可以由任何用户访问，并且设置也可以更改。
你如何避免这些问题？


## Android 5.0: the long-awaited API

##  Android 5.0: 期待已久的 API

Let's start with the good news: in Android 5.0 a new Screen pinning API was introduced. This API "pins" the screen and prevents users to leave the selected application. This functionality can be used to create kiosks for staff and to develop educational apps for assessment and examination.

让我们先说个好消息开始吧：Android 5.0 中已有锁住屏幕 API 的介绍了。这个 API “pins”（别针）别住屏幕并阻止用户离开所选的应用程序。该功能可用于为职员创建的一体机，开发用于评估和审查的教育应用。

When you activate the Screen pinning mode, user is not interrupted by system dialogs and notifications, has no access to other applications, cannot go to the main screen, and does not see the status bar anymore.

当你激活了屏幕固定模式，用户不会被系统对话框和通知所打断，同时不能打开其它应用程序，也不能回到主屏幕，状态栏也不再可见。

You can activate this mode via settings or software:

你可以通过设置或者软件来激活这一模式

- Switch on Screen pinning mode in Settings, select the desired application and attach it to confirm your choice.

- 在设置中（安全 -> 屏幕固定）开启屏幕固定模式，选择所需的应用并确认你的选择。

- For a software activation call the startLockTask() and confirm the inclusion of the lock mode.

- 软件中激活则调用  `startLockTask()` 方法并确认列入锁定模式。

## Android before 5.0: how to get around the system?

## Android 5.0 之前如何做到兼容？

In earlier versions of Android SDK, kiosk mode, unfortunately, is not provided. There is also no holistic and comprehensive API to block the system. Therefore, all components are locked separately and differently in different versions.

在早些的 Android SDK 中并没有提供一体机模式，也没有综合全面的 API 来冻结系统。因此，所有的不同组件应分别锁住而且在不同的版本中也是不同的方法。

Customization of OS can greatly simplify the implementation of kiosk mode, but we’d like to introduce some techniques that block unwanted items in Android versions below 5.0 without special firmware or root access.

定制操作系统可以大大的简化一体机模式的实现，但是我们想介绍在 Android 5.0 版本下不使用特殊固件或者 root 权限的情况下如何冻结掉不需要的东西。


### Reboot

### 重启

The first thing that may come to a user’s mind when the device freezes is to reboot it. Our task is to make sure that after the tablet or smartphone is restarted, the kiosk app starts automatically.

当设备被冻结时用户首先想到的就是重启设备了。我们的任务是确保平板电脑或者智能手机重启后，一体机应用应该自动启动。

This isn’t hard: describe Receiver in Manifest, give permission to receive messages after rebooting, and then extend class Broadcastreceiver that will run our app.

这并不算难：在 Manifest 中声明广播接收器，重启后接受信息的权限，然后还有写个继承 Broadcastreceiver 的子类使你的程序跑起来。

`AndroidManifest.xml:`
``` XML
<receiver android:name=".BootReceiver">  
    <intent-filter >  
        <action android:name=  
             "android.intent.action.BOOT_COMPLETED"/>  
   </intent-filter>  
</receiver>  
  
<uses-permission  
 android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

`BootReceiver.java :`
``` Java
public class BootReceiver extends BroadcastReceiver {  
  
  @Override  
  public void onReceive(Context context, Intent intent) {  
    Intent myIntent = new Intent(context, MyKioskModeActivity.class);  
    myIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);  
    context.startActivity(myIntent);  
  }  
}  
```

## BACK button

### 返回键

For the Back button just override method.

返回键则重写如下方法。

``` Java
@Override
public void onBackPressed() {  
    // here we do nothing  
}  
```


### HOME button

### HOME 键

HOME button cannot be intercepted, therefore, to prevent transfer to the main screen when it is pressed, we specify an application kiosk as the Launcher. Add the three lines in Manifest:

HOME 键并不能截获，因此为阻止它被按下时返回主屏幕，我们指定一体机程序作为 Launcher。在 Manifest 中添加 3 行：

``` XML
<intent-filter>  
    <action android:name="android.intent.action.MAIN" />  
  
    <category android:name="android.intent.category.HOME" />  
    <category android:name="android.intent.category.LAUNCHER" />  
    <category android:name="android.intent.category.DEFAULT" />  
</intent-filter>  
```

As a result, when you press the HOME button, the system offers you a choice between two launchers: stock and our kiosk application. Choose our application as the default launcher - and you're done!

完成以上工作后，当你按下 HOME 键时，系统会弹个窗口让你选择一个 launcher 作为默认的，然后选择我们的程序就好了，HOME 键这一部分也完成了！


### POWER button

### 电源键

POWER button causes the most problems. One way to handle them is to set the kiosk application window as a lock screen. However, this method is guaranteed to work only on Android versions below 4.0.

电源键的问题是最多的，解决掉这些问题的一个办法是把一体机程序窗口设置为锁屏屏幕。然而这个方法只能保证在 Android 4.0 版本下的系统中使用。

``` Java
@Override  
public void onAttachedToWindow() {  
    getWindow().addFlags(  
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);  
    getWindow().addFlags(  
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED);  
}     
```


### System dialogues

###  系统对话框

Long press of HOME or POWER button calls a system dialogues that allows you to exit the application. In addition there are OS updates and low battery windows, which are also dangerous to the kiosk because they can have access to system settings.

长按 HOME 或电源键将会弹出系统对话框，这可以让你退出程序。此外还有系统升级和低电量提示窗口，这对一体机也是危险的因为可以访问到系统设置。

To completely get rid of the system of dialogues we recommend the following: when Activity focus is lost, it sends Broadcast: Close all system dialogs.

为了彻底摆脱系统弹框的困扰，推荐如下方法：当 Activity 失去焦点时，发送一个关闭所有系统对话框的广播。

``` Java
@Override  
public void onWindowFocusChanged(boolean hasFocus) {  
  super.onWindowFocusChanged(hasFocus);  
  if(!hasFocus) {  
    Intent closeDialog =   
          new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);  
    sendBroadcast(closeDialog);  
  }  
}  
```

### Virtual Keyboard

### 虚拟键盘

There could be a ‘settings’ button on the virtual keyboard. If the keyboard is required, the best solution is to create a custom version or integrate the existing one with limited functionality.

在虚拟键盘中可能有一个设置按键。如果键盘是需要的，最好的解决方案是实现自己的版本或者整合现有的但须限制功能。


### Status bar

### 状态栏

Status bar provides a wide range of opportunities to exit the application, so you must get rid of it. The first thing you should do is to make the application full screen.

状态栏中存在许多可以让你退出程序的机会，所以你必须避免它。首先要做的就是让你的程序在全屏模式下工作。

在 Android 4.0 下的系统中你也可以指定窗口的类型为 `TYPE_SYSTEM_ALERT ` - 这种情况下一体机程序将会显示在所有系统元素的顶部。

Another way is to hide the status bar, as soon as it is ready to appear. To do this, you must specify the resolution of the Manifest.

另一个方法是当状态栏一出现时就隐藏掉，做这个工作需要到 Manifest 中申请相应权限。

``` Java
<uses-permission  
        android:name="android.permission.EXPAND_STATUS_BAR"/>  
  
@Override  
public void onWindowFocusChanged(boolean hasFocus)<br>  
{  
   if(!hasFocus)  
   {  
           Object service  = getSystemService("statusbar");  
           Class<?> statusbarManager =   
              Class.forName("android.app.StatusBarManager");  
           Method collapse = <br>  
              statusbarManager.getMethod("collapse");  
           collapse .setAccessible(true);  
           collapse .invoke(service);  
   }  
}  
```

Starting with Android 4.1 you can use the SDK for hiding the status bar.

Android 4.1 开始你可以使用 SDK 中隐藏状态栏的方法。

``` Java
View decorView = getWindow().getDecorView();  
int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;  
decorView.setSystemUiVisibility(uiOptions);  
ActionBar actionBar = getActionBar();  
actionBar.hide(); 
```

Another popular method is to create a transparent View object, which intercepts all clicks on the site of the status bar. To implement it the flag SYSTEM_ALERT_WINDOW is required.

另一个比较流行的方法是创建一个透明的视图对象，拦截掉状态栏上的点击操作。实现它要求视图有 `SYSTEM_ALERT_WINDOW` 标识（flag）。

The described techniques are only a few possible options for locking system elements in Android. Developers are constantly finding or inventing new approaches and sharing their experiences with other developers in order to create kiosk applications with restrictions that cannot be overcome by users.

以上这些在 Android 中锁定系统元素的技术内容仅仅是几个可选的方案。为了开发出不被用户破解的一体机应用，开发者门经常发现或发明新的方法并分享它们的经验给其它开发者

Share with us your own tips on kiosk app development for Android. Do you use the methods we described or do you know any other useful hacks?

与我们一起分享你在开发 Android 一体机程序的 tips 吧。你有用到我们上面说到的方法吗或者你知道其它有用的黑科技方法吗？