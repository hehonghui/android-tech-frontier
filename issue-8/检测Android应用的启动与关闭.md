检测Android应用的启动与关闭
---

> * 原文链接 : [Determine when App is Opened or Closed](http://engineering.meetme.com/2015/04/android-determine-when-app-is-opened-or-closed/)
* 原文作者 : [Bill Donahue](http://engineering.meetme.com/author/bdonahue/)
* [译文出自 :  开发技术前线 www.devtf.cn](www.devtf.cn)
* 译者 : [xianjiajun](https://github.com/xianjiajun) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成


##问题
当开发安卓程序的时候，我们不免需要去检测应用什么时候在前台运行，用户什么时候离开。不幸的是，没有一个简单的方法可以做到这点。当用户第一次启动的时候去检测还是不难，但如果是重新打开或关闭就不简单了。

这篇文章将会展示一个用来解决上述问题的技巧。

## 入门指南
应用的activity是否显示在界面是决定应用是打开还是关闭的核心因素。我们先来看一个简单的例子，一个应用只有一个activity并且不支持横屏，这个activity的onstart和onstop方法就决定了这个应用是打开的还是关闭的。

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


但有个问题，一旦我们支持横屏，上面这个方法就失效了。如果我们旋转设备，这个activity会重新创建，onstart方法会第二次执行，导致程序错误的认为应用第二次被打开。

为了处理设备旋转，我们需要添加一个验证步骤。这个验证需要启动一个计时器，用来检测当activity停止后，我们是否能很快看到该程序另一个activity启动。如果不能，则说明用户推出了程序，否则说明用户还在使用程序。

这样的验证同样支持有多个activity的应用。因为从一个activity跳转到另外一个也可以用这个验证方式处理。

所以利用这个技巧，我创建了一个管理activity的类，当activity的可见性发生变化的时候都要报告给这个管理类。这个类为每个activity处理验证步骤，避免意外的验证。我们同样利用了“发布-订阅”（观察者）模式，使得其他相关的类能够收到程序打开或关闭的通知。

##使用这个管理类的三个步骤

###1) 将下面的代码添加到你的代码库

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
 * 这个类用于追踪当前所有启动的Activity，使得我们能判断应用是否在后台运行。
 */
public class AppForegroundStateManager {
    private static final String TAG = AppForegroundStateManager.class.getSimpleName();
    private static final int MESSAGE_NOTIFY_LISTENERS = 1;
    public static final long APP_CLOSED_VALIDATION_TIME_IN_MS = 30 * DateUtils.SECOND_IN_MILLIS; // 30 Seconds
    private Reference<Activity> mForegroundActivity;
    private Set<OnAppForegroundStateChangeListener> mListeners = new HashSet<>();
    private AppForegroundState mAppForegroundState = AppForegroundState.NOT_IN_FOREGROUND;
    private NotifyListenersHandler mHandler;

    // 获得一个线程安全的类实例
    private static class SingletonHolder {
        public static final AppForegroundStateManager INSTANCE = new AppForegroundStateManager();
    }

    public static AppForegroundStateManager getInstance() {
        return SingletonHolder.INSTANCE;
    }

    private AppForegroundStateManager() {
        // 在主线程创建一个 handler
        mHandler = new NotifyListenersHandler(Looper.getMainLooper());
    }

    public enum AppForegroundState {
        IN_FOREGROUND,
        NOT_IN_FOREGROUND
    }

    public interface OnAppForegroundStateChangeListener {
        /** 当应用状态发生改变时这个方法被调用（隐藏到后台或显示到前台） */
        public void onAppForegroundStateChange(AppForegroundState newState);
    }

    /** 当 Activity 可见时应该调用这个方法 */
    public void onActivityVisible(Activity activity) {
        if (mForegroundActivity != null) mForegroundActivity.clear();
        mForegroundActivity = new WeakReference<>(activity);
        determineAppForegroundState();
    }

    /** 当 Activity 不再可见时应该调用这个方法 */
    public void onActivityNotVisible(Activity activity) {
        /*
         * 前台 Activity 可能会被一个新的 Activity 替换。
         * 如果新 Activity 与前台 Activity 匹配，仅仅清除前台 Activity
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

    /** 用于判断应用是否处于前台 */
    public Boolean isAppInForeground() {
        return mAppForegroundState == AppForegroundState.IN_FOREGROUND;
    }

    /**
     * 用于判断当前状态，更新追踪的目标，并通知所有观察者状态是否发生了改变
     */
    private void determineAppForegroundState() {
        /* 获取当前状态 */
        AppForegroundState oldState = mAppForegroundState;

        /* 决定当前状态 */
        final boolean isInForeground = mForegroundActivity != null && mForegroundActivity.get() != null;
        mAppForegroundState = isInForeground ? AppForegroundState.IN_FOREGROUND : AppForegroundState.NOT_IN_FOREGROUND;

        /* 如果新的状态与之前的状态不一样，则之前的状态需要通知所有观察者状态发生了改变 */
        if (mAppForegroundState != oldState) {
            validateThenNotifyListeners();
        }
    }

    /**
     * 添加一个用于监听前台应用状态的监听器
     *
     * @param listener
     */
    public void addListener(@NonNull OnAppForegroundStateChangeListener listener) {
        mListeners.add(listener);
    }

    /**
     * 移除用于监听前台应用状态的监听器
     *
     * @param listener
     */
    public void removeListener(OnAppForegroundStateChangeListener listener) {
        mListeners.remove(listener);
    }

    /** 通知所有监听器前台应用状态发生了改变 */
    private void notifyListeners(AppForegroundState newState) {
        android.util.Log.i(TAG, "Notifying subscribers that app just entered state: " + newState);

        for (OnAppForegroundStateChangeListener listener : mListeners) {
            listener.onAppForegroundStateChange(newState);
        }
    }

    /**
     * 这个方法会通知所有观察者：前台应用的状态发生了改变
     * <br><br>
     * 我们只在应用进入/离开前台时立刻监听器。当打开/关闭/方向切换这些操作频繁发生时，我们
     * 简要的传递一个一定会被无视的 NOT_IN_FOREGROUND 值。为了实现它，当我们注意到状态发
     * 生改变，一个延迟的消息会被发出。在这个消息被接收之前，我们不会注意前台应用的状态是否
     * 发生了改变。如果在消息被延迟的那段时间内应用的状态发生了改变，那么该通知将会被取消。
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
                // 解码完成
                case MESSAGE_NOTIFY_LISTENERS:
                    /* 通知所有观察者状态发生了改变 */
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

##深入思考
有一些细节还需要再讨论。你需要做一些改变来适配你的应用。

##验证时间
计时器应该隔多久检测一次应用是否真正进入后台。在上面的代码中设置为30秒。

在应用运行的时候，第三方程序的activity可能会出现占满屏幕，比如说google的支付应用或者facebook的登录。这些程序必然会导致你的程序进入后台，因为你应用的activity都没有在前台显示。这种情况并不能当作用户离开了程序，因为他们并没有真正地离开。30秒的超时刚好可以解决这个问题。比如说绝大部分的用户都会在30秒之内完成支付操作，这样他们就不会被当作离开应用。

如果这种情况不适合你，那么我建议你将验证时间设置为4秒。对于那些缓慢的设备来说，这段时间已经足够用来在旋转的时候创建一个activity。

##CPU休眠
还有一个潜在问题，如果用户在退出应用之后马上就锁屏（或者在应用还在运行的时候锁屏），不能保证CPU有足够长的运行时间来完成后台检测任务。为了确保像预期的一样工作，你需要持有唤醒锁防止CPU休眠，直到应用退出事件得到验证。实际上使用唤醒锁使这个看起来并不是什么大问题。

##论应用如何启动
到目前为止，我们知道了如何检测应用是什么时候被打开或者关闭的，但是我们还不知道应用是如何被打开的。是用户点击了通知，还是他们点击一个链接，又或者是他们只是从应用图标或最近任务点进来的？

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
            // 应用刚进入前台
            Log.i(TAG, "App Just Entered the Foreground with launch mechanism of: " + mLaunchMechanism);
        } else {
            // 应用刚进入前台，并设置我们的登录模式为当前的默认状态
            mLaunchMechanism = LaunchMechanism.DIRECT;
        }
    }
}
```

##设置启动方式
现在当用户打开应用时，我们就可以打印出启动的方式，但实际上我们还没有设置它的值。所以下一步就是要在用户通过链接或通知打开应用的时候设置启动方式。如果不是上述两个方式，则说明用户是直接打开应用。

##记录链接点击
为了记录用户通过点击链接打开应用，需要在某个地方拦截这个链接，加入下面这行代码。确保这行代码在activity的onStart()之前调用的。根据你的代码结构，可能需要把代码添加到很多地方或者一个公用的链接拦截器。

```java
getApplication().setLaunchMechanism(LaunchMechanism.URL);
```

##记录通知事件
记录从通知进入是有诀窍的。手机显示通知，用户点击它，打开一个被绑定了的PendingIntent。这个诀窍就是在给所有的PendingIntent加一个标志，用来说明这个Intent是来自通知的。换句话说，当intent最终打开activity的时候，我们需要能够检测到这个intent来自于通知的。

下面就是一个创建来自通知的PendingIntent，把下面的代码添加到每一个intent。

```java
	public static final String EXTRA_HANDLING_NOTIFICATION = "Notification.EXTRA_HANDLING_NOTIFICATION";
	
	// 通过 Extra 可以知道 Activity 是否通过推送启动
	intent.putExtra(EXTRA_HANDLING_NOTIFICATION, true);
```

最后我们还需要做的就是检查每个activity的标志（添加到你的base activity）。如果我们检测到这个标志量，那么就知道这个activity是通过通知产生的，我们可以设置启动方式为通知启动。这个步骤必须在onCreat里面完成，这样它才可以在应用显示到前台(打印启动方式)之前设置值。

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    Intent intent = getIntent();
    if (intent != null && intent.getExtras() != null) {
        // 判断 Activity 是否由用户点击推送启动
        if (intent.getExtras().getBoolean(EXTRA_HANDLING_NOTIFICATION, false)) {
            // 发出“应用通过用户点击推送启动”的通知
            getApplication().setLaunchMechanism(LaunchMechanism.NOTIFICATION);
        }
    }
}
```

终于完成了。现在你不仅可以检测应用什么时候启动或关闭的，还可以检测出它是如何启动的。



