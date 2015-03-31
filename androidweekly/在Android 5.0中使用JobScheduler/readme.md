在Android 5.0中使用JobScheduler
---

> * 原文链接 : [using-the-jobscheduler-api-on-android-lollipop](http://code.tutsplus.com/tutorials/using-the-jobscheduler-api-on-android-lollipop--cms-23562)
> * 译者 : [Mr.Simple](https://github.com/bboyfeiyu)
> * 校对者 : 

In this tutorial, you will learn how to use the JobScheduler API available in Android Lollipop. The JobScheduler API allows developers to create jobs that execute in the background when certain conditions are met.

在这篇文章中，你会学习到在Android 5.0中如何使用JobScheduler API。JobScheduler API允许开发者在符合某些条件时创建执行在后台的任务。


## Introduction
## 介绍

When working with Android, there will be occasions where you will want to run a task at a later point in time or under certain conditions, such as when a device is plugged into a power source or connected to a Wi-Fi network. Thankfully with API 21, known by most people as Android Lollipop, Google has provided a new component known as the JobScheduler API to handle this very scenario.

在Android开发中，会存在这么些场景 : 你需要在稍后的某个时间点或者当满足某个特定的条件时执行一个任务，例如当设备接通电源适配器或者连接到WIFI。幸运的是在API 21 ( Android 5.0，即Lollipop )中，google提供了一个新叫做JobScheduler API的组件来处理这样的场景。

The JobScheduler API performs an operation for your application when a set of predefined conditions are met. Unlike the AlarmManager class, the timing isn't exact. In addition, the JobScheduler API is able to batch various jobs to run together. This allows your app to perform the given task while being considerate of the device's battery at the cost of timing control.

当一系列预置的条件被满足时，JobScheduler API为你的应用执行一个操作。与AlarmManager不同的是这个执行时间是不确定的。除此之外，JobScheduler API允许同时执行多个任务。这允许你的应用执行某些指定的任务时不需要考虑时机控制引起的电池消耗。

In this article, you will learn more about the JobScheduler API and the JobService class by using them to run a simple background task in an Android application. The code for this tutorial is available on GitHub.

这篇文章中，你会学到关于JobScheduler API更多的东西以及在你的应用中用于运行一个简单的后台任务的JobService，这篇文章中所展示的代码你都可以在[github](https://github.com/tutsplus/Android-JobSchedulerAPI)中找到。

## 1. Creating the Job Service

To start, you're going to want to create a new Android project with a minimum required API of 21, because the JobScheduler API was added in the most recent version of Android and, at the time of writing, is not backwards compatible through a support library.

首先，你需要创建一个API最低为21的Android项目，因此JobScheduler是最近的版本才加入Android的，在写这篇文章的时候，它还没有兼容库支持。

Assuming you're using Android Studio, after you've hit the finished button for the new project, you should have a bare-bones "Hello World" application. The first step you're going to take with this project is to create a new Java class. To keep things simple, let's name it JobSchedulerService and extend the JobService class, which requires that two methods be created onStartJob(JobParameters params) and onStopJob(JobParameters params).

假定你使用的是Android Studio,当你点击了创建项目的完成按钮之后，你会得到一个"hello world"的应用骨架。你要做的第一步就是创建一个新的java类。为了简单起见，让我们创建一个继承自JobService且名字为JobSchedulerService的类，这个类必须实现两个方法，分别是`onStartJob(JobParameters params) `和 `onStopJob(JobParameters params)`；

```java
public class JobSchedulerService extends JobService {
 
    @Override
    public boolean onStartJob(JobParameters params) {
 
        return false;
    }
 
    @Override
    public boolean onStopJob(JobParameters params) {
         
        return false;
    }
}
```

onStartJob(JobParameters params) is the method that you must use when you begin your task, because it is what the system uses to trigger jobs that have already been scheduled. As you can see, the method returns a boolean value. If the return value is false, the system assumes that whatever task has run did not take long and is done by the time the method returns. If the return value is true, then the system assumes that the task is going to take some time and the burden falls on you, the developer, to tell the system when the given task is complete by calling jobFinished(JobParameters params, boolean needsRescheduled).

当任务开始时会执行`onStartJob(JobParameters params)`方法，因为这是系统用来触发已经被执行的任务。正如你所看到的，这个方法返回一个boolean值。如果返回值是false,系统假设这个方法返回时任务已经执行完毕。如果返回值是true,那么系统假定这个任务正要被执行，执行任务的重担就落在了你的肩上。当任务执行完毕时你需要调用`jobFinished(JobParameters params, boolean needsRescheduled)`来通知系统。

onStopJob(JobParameters params) is used by the system to cancel pending tasks when a cancel request is received. It's important to note that if onStartJob(JobParameters params) returns false, the system assumes there are no jobs currently running when a cancel request is received. In other words, it simply won't call onStopJob(JobParameters params).

当系统接收到一个取消请求时，系统会调用`onStopJob(JobParameters params)`方法取消正在等待执行的任务。很重要的一点是如果`onStartJob(JobParameters params)`返回false,那么系统假定在接收到一个取消请求时已经没有正在运行的任务。换句话说，`onStopJob(JobParameters params)`在这种情况下不会被调用。

One thing to note is that the job service runs on your application's main thread. This means that you have to use another thread, a handler, or an asynchronous task to run longer tasks to not block the main thread. Because multithreading techniques are beyond the scope of this tutorial, let's keep it simple and implement a handler to run our task in the JobSchedulerService class.

需要注意的是这个job service运行在你的主线程，这意味着你需要使用子线程，handler, 或者一个异步任务来运行耗时的操作以防止阻塞主线程。因为多线程技术已经超出了我们这篇文章的范围，让我们简单实现一个Handlder来执行我们在JobSchedulerService定义的任务吧。

```java
private Handler mJobHandler = new Handler( new Handler.Callback() {
     
    @Override
    public boolean handleMessage( Message msg ) {
        Toast.makeText( getApplicationContext(), 
            "JobService task running", Toast.LENGTH_SHORT )
            .show();
        jobFinished( (JobParameters) msg.obj, false );
        return true;
    }
     
} );
```

In the handler, you implement the handleMessage(Message msg) method that is a part of Handler instance and have it run your task's logic. In this case, we're keeping things very simple and post a Toast message from the application, though this is where you would put your logic for things like syncing data.

在Handler中，你需要实现`handleMessage(Message msg)`方法来处理你的任务逻辑。在这个例子中，我们尽量保证例子简单，因此我们只在`handleMessage(Message msg)`中显示了一个Toast，这里就是你要写你的任务逻辑( 耗时操作 )的地方，比如同步数据等。

When the task is done, you need to call jobFinished(JobParameters params, boolean needsRescheduled) to let the system know that you're done with that task and that it can begin queuing up the next operation. If you don't do this, your jobs will only run once and your application will not be allowed to perform additional jobs.

当任务执行完毕之后，你需要调用`jobFinished(JobParameters params, boolean needsRescheduled)`来让系统知道这个任务已经结束，系统可以将下一个任务添加到队列中。如果你没有调用`jobFinished(JobParameters params, boolean needsRescheduled)`，你的任务只会执行一次，而应用中的其他任务就不会被执行。

The two parameters that jobFinished(JobParameters params, boolean needsRescheduled) takes are the JobParameters that were passed to the JobService class in the onStartJob(JobParameters params) method and a boolean value that lets the system know if it should reschedule the job based on the original requirements of the job. This boolean value is useful to understand, because it is how you handle the situations where your task is unable to complete because of other issues, such as a failed network call.

`jobFinished(JobParameters params, boolean needsRescheduled) `的两个参数中的params参数是从JobService的`onStartJob(JobParameters params)`的params传递过来的，needsRescheduled参数是让系统知道这个任务是否应该在最处的条件下被重复执行。这个boolean值很有用，因为它指明了你如何处理由于其他原因导致任务执行失败的情况，例如一个失败的网络请求调用。

With the Handler instance created, you can go ahead and start implementing the onStartJob(JobParameters params) and onStopJob(JobParameters params) methods to control your tasks. You'll notice that in the following code snippet, the onStartJob(JobParameters params) method returns true. This is because you're going to use a Handler instance to control your operation, which means that it could take longer to finish than the onStartJob(JobParameters params) method. By returning true, you're letting the application know that you will manually call the jobFinished(JobParameters params, boolean needsRescheduled) method. You'll also notice that the number 1 is being passed to the Handler instance. This is the identifier that you're going to use for referencing the job.

创建了Handler实例之后，你就可以实现`onStartJob(JobParameters params)` 和`onStopJob(JobParameters params)`方法来控制你的任务了。你可能已经注意到在下面的代码片段中`onStartJob(JobParameters params)`返回了true。这是因为你要通过Handler实例来控制你的操作，

`这意味着Handler的handleMessage方法中可以执行比`onStartJob(JobParameters params)`更耗时的操作。`返回true,你会让系统知道你会手动地调用`jobFinished(JobParameters params, boolean needsRescheduled)`方法。

```java
@Override
public boolean onStartJob(JobParameters params) {
    mJobHandler.sendMessage( Message.obtain( mJobHandler, 1, params ) );
    return true;
}
 
@Override
public boolean onStopJob(JobParameters params) {
    mJobHandler.removeMessages( 1 );
    return false;
}
```

Once you're done with the Java portion of the JobSchedulerService class, you need to go into AndroidManifest.xml and add a node for the service so that your application has permission to bind and use this class as a JobService.

一旦你在Java部分做了上述工作之后，你需要到AndroidManifest.xml中添加一个service节点让你的应用拥有绑定和使用这个JobService的权限。

```
<service android:name=".JobSchedulerService"
    android:permission="android.permission.BIND_JOB_SERVICE" />
```
    
## 2. Creating the Job Scheduler

With JobSchedulerService class finished, we can start looking at how your application will interact with the JobScheduler API. The first thing you will need to do is create a JobScheduler object, called mJobScheduler in the sample code, and initialize it by getting an instance of the system service JOB_SCHEDULER_SERVICE. In the sample application, this is done in the MainActivity class.

随着JobSchedulerService构建完毕，我们可以开始研究你的应用如何与JobScheduler API进行交互了。第一件要做的事就是你需要创建一个JobScheduler对象，在实例代码的MainActivity中我们通过`getSystemService( Context.JOB_SCHEDULER_SERVICE )`初始化了一个叫做mJobScheduler的JobScheduler对象。

```java
mJobScheduler = (JobScheduler) 
    getSystemService( Context.JOB_SCHEDULER_SERVICE );
```    
When you want to create your scheduled task, you can use the JobInfo.Builder to construct a JobInfo object that gets passed to your service. To create a JobInfo object, JobInfo.Builder accepts two parameters. The first is the identifier of the job that you will run and the second is the component name of the service that you will use with the JobScheduler API.

当你想创建定时任务时，你可以使用`JobInfo.Builder`来构建一个JobInfo对象，然后传递给你的Service。JobInfo.Builder接收两个参数，第一个参数是你要运行的任务的标识符，第二个是这个Service组件的类名。

```java
JobInfo.Builder builder = new JobInfo.Builder( 1,
        new ComponentName( getPackageName(), 
            JobSchedulerService.class.getName() ) );
```
            
This builder allows you to set many different options for controlling when your job will execute. The following code snippet shows how you could set your task to run periodically every three seconds.

这个builder允许你设置很多不同的选项来控制任务的执行。下面的代码片段就是展示了如何设置以使得你的任务可以每隔三秒运行一次。

```java
builder.setPeriodic( 3000 );
```

Other methods include:      
其他设置方法 : 

* setMinimumLatency(long minLatencyMillis): This makes your job not launch until the stated number of milliseconds have passed. This is incompatible with setPeriodic(long time) and will cause an exception to be thrown if they are both used.      
这个函数能让你设置任务的延迟执行时间(单位是毫秒),这个函数与`setPeriodic(long time)`方法不兼容，如果这两个方法同时调用了就会引起异常；
* setOverrideDeadline(long maxExecutionDelayMillis): This will set a deadline for your job. Even if other requirements are not met, your task will start approximately when the stated time has passed. Like setMinimumLatency(long time), this function is mutually exclusive with setPeriodic(long time) and will cause an exception to be thrown if they are both used.            
这个方法让你可以设置任务最晚的延迟时间。如果到了规定的时间时其他条件还未满足，你的任务也会被启动。与`setMinimumLatency(long time)`一样，这个方法也会与`setPeriodic(long time)`，同时调用这两个方法会引发异常。
* setPersisted(boolean isPersisted): This function tells the system whether your task should continue to exist after the device has been rebooted.         
这个方法告诉系统当你的设备重启之后你的任务是否还要继续执行。
* setRequiredNetworkType(int networkType): This function will tell your job that it can only start if the device is on a specific kind of network. The default is JobInfo.NETWORK_TYPE_NONE, meaning that the task can run whether there is network connectivity or not. The other two available types are JobInfo.NETWORK_TYPE_ANY, which requires some type of network connection available for the job to run, and JobInfo.NETWORK_TYPE_UNMETERED, which requires that the device be on a non-cellular network.      
这个方法让你这个任务只有在满足指定的网络条件时才会被执行。默认条件是JobInfo.NETWORK_TYPE_NONE，这意味着不管是否有网络这个任务都会被执行。另外两个可选类型，一种是JobInfo.NETWORK_TYPE_ANY，它表明需要任意一种网络才使得任务可以执行。另一种是JobInfo.NETWORK_TYPE_UNMETERED，它表示设备不是蜂窝网络( 比如在WIFI连接时 )时任务才会被执行。
* setRequiresCharging(boolean requiresCharging): Using this function will tell your application that the job should not start until the device has started charging.     
这个方法告诉你的应用，只有当设备在充电时这个任务才会被执行。
* setRequiresDeviceIdle(boolean requiresDeviceIdle): This tells your job to not start unless the user is not using their device and they have not used it for some time.       
这个方法告诉你的任务只有当用户没有在使用该设备且有一段时间没有使用时才会启动该任务。

It's important to note that setRequiredNetworkType(int networkType), setRequiresCharging(boolean requireCharging) and setRequiresDeviceIdle(boolean requireIdle) may cause your job to never start unless setOverrideDeadline(long time) is also set, allowing your job to run even if conditions are not met. Once the preferred conditions are stated, you can build the JobInfo object and send it to your JobScheduler object as shown below.

需要注意的是`setRequiredNetworkType(int networkType)`, `setRequiresCharging(boolean requireCharging)` and `setRequiresDeviceIdle(boolean requireIdle)`者几个方法可能会使得你的任务无法执行，除非调用`setOverrideDeadline(long time)`设置了最大延迟时间，使得你的任务在为满足条件的情况下也会被执行。一旦你预置的条件被设置，你就可以构建一个JobInfo对象，然后通过如下所示的代码将它发送到你的JobScheduler中。

```java
if( mJobScheduler.schedule( builder.build() ) <= 0 ) {
    //If something goes wrong
}
```
You'll notice that the schedule operation returns an integer. If schedule fails, it will return a value of zero or less, corresponding to an error code. Otherwise it will return the job identifier that we defined in the JobInfo.Builder.

你可能注意到了，这个schedule方法会返回一个整型。如果schedule方法失败了，它会返回一个小于0的错误码。否则它会我们在JobInfo.Builder中定义的标识id。

If your application requires that you stop a specific or all jobs, you can do so by calling cancel(int jobId) or cancelAll() on the JobScheduler object.

如果你的应用想停止某个任务，你可以调用JobScheduler对象的`cancel(int jobId)`来实现；如果你想取消所有的任务，你可以调用JobScheduler对象的`cancelAll()`来实现。

```java
mJobScheduler.cancelAll();
```

You should now be able to use the JobScheduler API with your own applications to batch jobs and run background operations.
到了这里，你现在应该已经知道如何在你的应用中使用JobScheduler API来执行批量任务和后台操作了。


## Conclusion

In this article, you've learned how to implement a JobService subclass that uses a Handler object to run background tasks for your application. You've also learned how to use the JobInfo.Builder to set requirements for when your service should run. Using these, you should be able to improve how your own applications operate while being mindful of power consumption.

## 结论
这篇文章中，你学会了怎么实现一个使用Handler对象来运行后台任务的JobService子类，你也学会了如何使用JobInfo.Builder来设置JobService。通过这些，你可以减少应用中的耗时操作的资源消耗。
