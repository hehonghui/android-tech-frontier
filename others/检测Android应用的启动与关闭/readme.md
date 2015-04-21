`检测Android应用的启动与关闭`
---

> * 原文链接 : [Determine when App is Opened or Closed](http://engineering.meetme.com/2015/04/android-determine-when-app-is-opened-or-closed/)
* 原文作者 : [Bill Donahue](http://engineering.meetme.com/author/bdonahue/)
* [译文出自 :  开发技术前线 www.devtf.cn](www.devtf.cn)
* 译者 : [xianjiajun](https://github.com/xianjiajun) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中

The Problem

Inevitably when developing an Android application there will come a time when you need to detect when it comes into the foreground, and when the user leaves.  Surprisingly, there is no easy way to do this! It isn’t hard to detect when the application is first opened, but its not so simple to determine when it is re-opened or closed.

This post will lay out a technique that can be used to detect when an application has been opened, re-opened, or closed.

##问题
当开发安卓程序的时候，我们不免需要去检测应用什么时候在前台运行，用户什么时候离开。不幸的是，没有一个简单的方法可以做到这点。当用户第一次启动的时候去检测还是不难，但如果是重新打开或关闭就不简单了。

这篇文章将会展示一个用来解决上述问题的技巧。


Lets Get Started

At the core of determining if an application is opened or closed is if any of its activities are currently being displayed. So lets take a very simple example; an application that has exactly one Activity, and does not support landscape mode. All it would take to determine when the application opened or closed would be the Activity’s onStart and onStop methods.

## 入门指南
应用的activitie是否显示在界面是决定应用是打开还是关闭的核心因素。我们先来看一个简单的例子，一个应用只有一个activity并且不支持横屏，这个activity的onstart和onstop方法就决定了这个应用是打开的还是关闭的。
```java
@Override
protected void onStart() {
    super.onStart();
    // The Application has been opened!
}

@Override
protected void onStop() {
    super.onStop();
    // The Application has been closed!
}
```

The problem is this approach quickly breaks down as soon as you add landscape support.  If we rotate the device then this Activity will be re-created and onStart will run a second time resulting in incorrectly detecting the app was opened a second time.

但有个问题，一旦我们支持横屏，上面这个方法就失效了。如果我们旋转设备，这个activity会重新创建，onstart方法会第二次执行，导致程序错误的认为应用第二次被打开。


In order to handle device rotation we need to add a validation step. This validation needs to launch a timer whenever the Activity stops in order to detect if we quickly see another Activity in the app start. If we do not, then the user has really exited the app, if we do then we know that the user is still within the app.

为了处理设备旋转，我们需要添加一个验证步骤。这个验证需要启动一个计时器，用来检测当activity停止后，我们是否能很快看到该程序另一个activity启动。如果不能，则说明用户推出了程序，否则说明用户还在使用程序。

This validation also allows supporting an application with multiple Activities. Since transitioning from one Activity to another is handled by this validation as well.

这样的验证同样支持有多个activity的应用。因为从一个activity跳转到另外一个也可以用这个验证方式处理。

So using this technique I created a manager class that all Activities report to when they become visible and are no longer visible. This manager class handles the validation step for each Activity to avoid accidental detection. It also utilizes a publisher-subscriber (Observer) pattern to allow any interested parties to be notified when the application opens or closes.

所以利用这个技巧，我创建了一个管理activity的类，当activity的可见性发生变化的时候都要报告给这个管理类。这个类为每个activity处理验证步骤，避免意外的验证。我们同样利用了“发布-订阅”（观察者）模式，使得其他相关的类能够收到程序打开或关闭的通知。

##使用三步走

1) Add it to your codebase
###1) 加入代码库
```java
import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.support.annotation.NonNull;
import android.text.format.DateUtils;

import java.lang.ref.Reference;
import java.lang.ref.WeakReference;
import java.util.HashSet;
import java.util.Set;

/**
 * This class is responsible for tracking all currently open activities.
 * By doing so this class can detect when the application is in the foreground
 * and when it is running in the background.
 */
public class AppForegroundStateManager {
    private static final String TAG = AppForegroundStateManager.class.getSimpleName();
    private static final int MESSAGE_NOTIFY_LISTENERS = 1;
    public static final long APP_CLOSED_VALIDATION_TIME_IN_MS = 30 * DateUtils.SECOND_IN_MILLIS; // 30 Seconds
    private Reference<Activity> mForegroundActivity;
    private Set<OnAppForegroundStateChangeListener> mListeners = new HashSet<>();
    private AppForegroundState mAppForegroundState = AppForegroundState.NOT_IN_FOREGROUND;
    private NotifyListenersHandler mHandler;

    // Make this class a thread safe singleton
    private static class SingletonHolder {
        public static final AppForegroundStateManager INSTANCE = new AppForegroundStateManager();
    }

    public static AppForegroundStateManager getInstance() {
        return SingletonHolder.INSTANCE;
    }

    private AppForegroundStateManager() {
        // Create the handler on the main thread
        mHandler = new NotifyListenersHandler(Looper.getMainLooper());
    }

    public enum AppForegroundState {
        IN_FOREGROUND,
        NOT_IN_FOREGROUND
    }

    public interface OnAppForegroundStateChangeListener {
        /** Called when the foreground state of the app changes */
        public void onAppForegroundStateChange(AppForegroundState newState);
    }

    /** An activity should call this when it becomes visible */
    public void onActivityVisible(Activity activity) {
        if (mForegroundActivity != null) mForegroundActivity.clear();
        mForegroundActivity = new WeakReference<>(activity);
        determineAppForegroundState();
    }

    /** An activity should call this when it is no longer visible */
    public void onActivityNotVisible(Activity activity) {
        /*
         * The foreground activity may have been replaced with a new foreground activity in our app.
         * So only clear the foregroundActivity if the new activity matches the foreground activity.
         */
        if (mForegroundActivity != null) {
            Activity ref = mForegroundActivity.get();

            if (activity == ref) {
                // This is the activity that is going away, clear the reference
                mForegroundActivity.clear();
                mForegroundActivity = null;
            }
        }

        determineAppForegroundState();
    }

    /** Use to determine if this app is in the foreground */
    public Boolean isAppInForeground() {
        return mAppForegroundState == AppForegroundState.IN_FOREGROUND;
    }

    /**
     * Call to determine the current state, update the tracking global, and notify subscribers if the state has changed.
     */
    private void determineAppForegroundState() {
        /* Get the current state */
        AppForegroundState oldState = mAppForegroundState;

        /* Determine what the new state should be */
        final boolean isInForeground = mForegroundActivity != null && mForegroundActivity.get() != null;
        mAppForegroundState = isInForeground ? AppForegroundState.IN_FOREGROUND : AppForegroundState.NOT_IN_FOREGROUND;

        /* If the new state is different then the old state the notify subscribers of the state change */
        if (mAppForegroundState != oldState) {
            validateThenNotifyListeners();
        }
    }

    /**
     * Add a listener to be notified of app foreground state change events.
     *
     * @param listener
     */
    public void addListener(@NonNull OnAppForegroundStateChangeListener listener) {
        mListeners.add(listener);
    }

    /**
     * Remove a listener from being notified of app foreground state change events.
     *
     * @param listener
     */
    public void removeListener(OnAppForegroundStateChangeListener listener) {
        mListeners.remove(listener);
    }

    /** Notify all listeners the app foreground state has changed */
    private void notifyListeners(AppForegroundState newState) {
        android.util.Log.i(TAG, "Notifying subscribers that app just entered state: " + newState);

        for (OnAppForegroundStateChangeListener listener : mListeners) {
            listener.onAppForegroundStateChange(newState);
        }
    }

    /**
     * This method will notify subscribes that the foreground state has changed when and if appropriate.
     * <br><br>
     * We do not want to just notify listeners right away when the app enters of leaves the foreground. When changing orientations or opening and
     * closing the app quickly we briefly pass through a NOT_IN_FOREGROUND state that must be ignored. To accomplish this a delayed message will be
     * Sent when we detect a change. We will not notify that a foreground change happened until the delay time has been reached. If a second
     * foreground change is detected during the delay period then the notification will be canceled.
     */
    private void validateThenNotifyListeners() {
        // If the app has any pending notifications then throw out the event as the state change has failed validation
        if (mHandler.hasMessages(MESSAGE_NOTIFY_LISTENERS)) {
            android.util.Log.v(TAG, "Validation Failed: Throwing out app foreground state change notification");
            mHandler.removeMessages(MESSAGE_NOTIFY_LISTENERS);
        } else {
            if (mAppForegroundState == AppForegroundState.IN_FOREGROUND) {
                // If the app entered the foreground then notify listeners right away; there is no validation time for this
                mHandler.sendEmptyMessage(MESSAGE_NOTIFY_LISTENERS);
            } else {
                // We need to validate that the app entered the background. A delay is used to allow for time when the application went into the
                // background but we do not want to consider the app being backgrounded such as for in app purchasing flow and full screen ads.
                mHandler.sendEmptyMessageDelayed(MESSAGE_NOTIFY_LISTENERS, APP_CLOSED_VALIDATION_TIME_IN_MS);
            }
        }
    }

    private class NotifyListenersHandler extends Handler {
        private NotifyListenersHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message inputMessage) {
            switch (inputMessage.what) {
                // The decoding is done
                case MESSAGE_NOTIFY_LISTENERS:
                    /* Notify subscribers of the state change */
                    android.util.Log.v(TAG, "App just changed foreground state to: " + mAppForegroundState);
                    notifyListeners(mAppForegroundState);
                    break;
                default:
                    super.handleMessage(inputMessage);
            }
        }
    }
}
```

2) Activities Must Notify of Visibility Changes
Have all of your Activities implement the following code to notify the manager when they become visible and when they are no longer visible. This is best achieved by adding this code to your base Activity class.
###2) activity必须通知可见性的改变
所有的activity都要实现下面的方法来通知管理者其可见性的改变，最好添加到你的base activity中。

```java
@Override
protected void onStart() {
    super.onStart();
    AppForegroundStateManager.getInstance().onActivityVisible(this);
}

@Override
protected void onStop() {
    AppForegroundStateManager.getInstance().onActivityNotVisible(this);
    super.onStop();
}
```

3) Subscribe to Be Notified of Foreground Changes

Subscribe to be notified of app foreground state changes from somewhere of interest. The application class onCreate method is a prime placement to ensure that you get notified every time the app enters or leaves the foreground.

###3) 订阅前台的变化

订阅你感兴趣的前台的状态变化。application类的onCreate方法是首先需要订阅的，这样才能保证每次应用进入或退出前台的时候能收到通知。

```java
public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AppForegroundStateManager.getInstance().addListener(this);
    }

    @Override
    public void onAppForegroundStateChange(AppForegroundStateManager.AppForegroundState newState) {
        if (AppForegroundStateManager.AppForegroundState.IN_FOREGROUND == newState) {
            // App just entered the foreground. Do something here!
        } else {
            // App just entered the background. Do something here!
        }
    }
}
```

Further thought

There are a few details that need further discussion.  These changes may need to be made in order to calibrate this for your particular application.
##深层思考
有一些细节还需要再讨论。你需要做一些改变来适配你的应用。

Validation Time

How long should this validation timer be that is used to detect that your app has really entered the background? In the code above it set to 30 seconds for a few reasons.
##验证时间
计时器应该隔多久检测一次应用是否真正进入后台。在上面的代码中设置为30秒。

There are third party Activities that can appear full screen when the application is running. A few common examples of these are in Google In App Purchasing or Facebook signup. Both of these essentially send the application into the background since none of you applications Activities are in the foreground when those are displaying. It is not desirable for those to count as the user “leaving the app” since they really haven’t. The 30 second timeout helps to catch this case. For example if a user completes an in app purchase in under 30 seconds, which the vast majority of users will, then they will not be counted accidentally as “leaving the app”.

在应用运行的时候，第三方程序的activity可能会出现占满屏幕，比如说google的支付应用或者facebook的登录。这些程序必然会导致你的程序进入后台，因为你应用的activity都没有在前台显示。这种情况并不能当作用户离开了程序，因为他们并没有真正地离开。30秒的超时刚好可以解决这个问题。比如说绝大部分的用户都会在30秒之内完成支付操作，这样他们就不会被当作离开应用。

If this situation doesn’t apply to you, then I recommend setting your validation time to around four seconds. That is enough of a safety margin for slow devices to create the next Activity when rotating.

如果这种情况不适合你，那么我建议你将验证时间设置为4秒。对于那些缓慢的设备来说，这段时间已经足够用来在旋转的时候创建一个activity。

CPU Sleep

A potential issue is there is no guarantee that the CPU will still be running long enough for the background detection to occur if the user locks their phone quickly after exiting the app (or locks the phone with the app still open).  In order to guarantee this always works as expected you would need to take a wake lock until the app closed event can be validated to prevent the CPU from sleeping. In practice however this did not seem to be a big enough issue to warrant use of a wake lock.

##CPU休眠
还有一个潜在问题，如果用户在退出应用之后马上就锁屏（或者在应用还在运行的时候锁屏），不能保证CPU有足够长的运行时间来完成后台检测任务。为了确保像预期的一样工作，你需要持有唤醒锁防止CPU休眠，直到应用退出事件得到验证。实际上使用唤醒锁使这个看起来并不是什么大问题。

Determining How The App Was Launched

Great so now we know how to detect when the application was opened or closed, but we don’t know how the application was opened. Did the user click on a notification? Did they click on a link? Or did they just launch the app from the icon or recents tray?

##论应用如何启动
到目前为止，我们知道了如何检测应用是什么时候被打开或者关闭的，但是我们还不知道应用是如何被打开的。是用户点击了通知，还是他们点击一个链接，又或者是他们只是从应用图标或最近任务点进来的？

Tracking Launch Mechanism

First we need somewhere to track how the application was opened. In this code I have added an enum to the application class to track how the application was opened. This builds upon the last example so we can print a log when the application is opened, along with how the application was opened.

##记录启动方式
首先我们要在某个地方记录应用打开的方式。在这段代码中，我在application类中添加了一个枚举型变量用来记录应用是如何被打开的。这个建立在上一个例子的基础之上，所以我们打印一下日志，来看看应用是什么时候被打开的和如何被打开的。
```java
public class MyApplication extends Application {
    public final String TAG = MyApplication.class.getSimpleName();

    public enum LaunchMechanism {
        DIRECT,
        NOTIFICATION,
        URL;
    }

    private LaunchMechanism mLaunchMechanism = LaunchMechanism.DIRECT;

    public void setLaunchMechanism(LaunchMechanism launchMechanism) {
        mLaunchMechanism = launchMechanism;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        AppForegroundStateManager.getInstance().addListener(this);
    }

    @Override
    public void onAppForegroundStateChange(AppForegroundStateManager.AppForegroundState newState) {
        if (AppForegroundStateManager.AppForegroundState.IN_FOREGROUND.equals(newState)) {
            // App just entered the foreground.
            Log.i(TAG, "App Just Entered the Foreground with launch mechanism of: " + mLaunchMechanism);
        } else {
            // App just entered the background. Set our launch mode back to the default of direct.
            mLaunchMechanism = LaunchMechanism.DIRECT;
        }
    }
}
```
Setting the Launch Mechanism

Great so now we can print off the launch mechanism when the app is opened, but we never actually set it! So the next step is to set it when the user opens the app via a link or a notification. If its not set to one of those two, then the user must have opened the app directly.
##设置启动方式
现在当用户打开应用时，我们就可以打印出启动的方式，但实际上我们还没有设置它的值。所以下一步就是要在用户通过链接或通知打开应用的时候设置启动方式。如果不是上述两个方式，则说明用户是直接打开应用。

Tracking Link Clicks

To track the user clicking a link that caused the app to open find the place in your code where you intercept your links and place the following code to track the launch mechanism. Make sure this is called before your Activity’s onStart(). This could be needed in many places or just one common link intercepter depending on your architecture.
##记录链接点击
为了记录用户通过点击链接打开应用，需要在某个地方拦截这个链接，加入下面这行代码。确保这行代码在activity的onStart()之前调用的。根据你的代码结构，可能需要把代码添加到很多地方或者一个公用的链接拦截器。

```java
getApplication().setLaunchMechanism(LaunchMechanism.URL);
```
Tracking Notifications

Unfortunately tracking notifications is a bit trickier. Notifications are shown and when clicked a PendingIntent that you previously bound to them is opened. The trick here is to add a flag to all PendingIntents that you make for a notification that indicates that this Intent is an Intent from a Notification. In other words, when the intent eventually opens some Activity, we need to be able to detect that this intent was created from a Notification.
##记录通知事件
记录从通知进入是有诀窍的。手机显示通知，用户点击它，打开一个被绑定了的PendingIntent。这个诀窍就是在给所有的PendingIntent加一个标志，用来说明这个Intent是来自通知的。换句话说，当intent最终打开activity的时候，我们需要能够检测到这个intent来自于通知的。

So for example when creating any PendingIntent for a notification add the following to each intent:
下面就是一个创建来自通知的PendingIntent，把下面的代码添加到每一个intent。
```java
public static final String EXTRA_HANDLING_NOTIFICATION = "Notification.EXTRA_HANDLING_NOTIFICATION";

// Put an extra so we know when an activity launches if it is a from a notification
intent.putExtra(EXTRA_HANDLING_NOTIFICATION, true);
```

Now all we need to do is check for that flag in every single Activity (add to your base Activity class). If we detect the flag then we know this Activity was launched via a notification and we can set the launch mechanism to notification. This must be done in onCreate so that it is set prior to the application coming into the foreground (which will trigger the printing of the launch mechanism).

最后我们还需要做的就是检查每个activity的标志（添加到你的base activity）。如果我们检测到这个标志量，那么就知道这个activity是通过通知产生的，我们可以设置启动方式为通知启动。这个步骤必须在onCreat里面完成，这样它才可以在应用显示到前台(打印启动方式)之前设置值。
```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    Intent intent = getIntent();
    if (intent != null && intent.getExtras() != null) {
        // Detect if the activity was launched by the user clicking on a notification
        if (intent.getExtras().getBoolean(EXTRA_HANDLING_NOTIFICATION, false)) {
            // Notify that the activity was opened by the user clicking on a notification.
            getApplication().setLaunchMechanism(LaunchMechanism.NOTIFICATION);
        }
    }
}
```

And there you have it! You can now detect not only when the app is opened or closed, but how it was opened as well.
终于完成了。现在你不仅可以检测应用什么时候启动或关闭的，还可以检测出它是如何启动的。



