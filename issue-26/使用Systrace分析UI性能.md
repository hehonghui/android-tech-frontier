#使用Systrace分析UI性能
---

> * 原文链接 : [Analyzing UI Performance with Systrace](http://developer.android.com/intl/zh-cn/tools/debugging/systrace.html)
* 原文作者 : [Android Developers](http://developer.android.com//)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: 

While developing your application, you should check that user interactions are buttery smooth, running at a consistent 60 frames per second. If something goes wrong, and a frame gets dropped, the first step in fixing the problem is understanding what the system is doing.

开发应用的时候，应该检查它是否有流畅的用户体验，即60fps的帧率。如果由于某种原因丢帧，我们首先要做的就是知道系统在做什么（造成丢帧的原因）。

The Systrace tool allows you to collect and inspect timing information across an entire Android device, which is called a trace. It shows where time and CPU cycles are being spent, displaying what each thread and process is doing at any given time. It also inpects the captured tracing information to highlight problems that it observes, from list item recycling to rendering content, and provide recommendations about how to fix them. This document explains how to navigate the trace files produced by the tool, and use them to analyze the performance of an application's user interface (UI).

Systrace允许你监视、收集Android系统的时间消耗与行为(trace)。它告诉你系统都在哪些工作上花费时间、CPU周期都花费在哪里，甚至你可以看到每个线程、进程在指定时间内都在干嘛。它会在得到trace后高亮观测到的问题，从垃圾回收到渲染内容都可能有，并提供给你建议的解决方案。本文章将介绍如何浏览Systrace导出的trace以及使用它来优化UI的办法。

##Overview
##总览

Systrace helps you analyze how the execution of your application fits into the many running systems on an Android device. It puts together system and application thread execution on a common timeline. In order to analyze your app with Systrace, you first collect a trace log of your app, and the system activity. The generated trace allows you to view highly detailed, interactive reports showing everything happening the system for the traced duration.

Systrace可以帮助你分析应用在不同Android系统上的运行情况。它将系统和应用的线程运行情况放置在同一条时间线上分析。你首先需要收集应用和系统应用的trace log（后面会告诉你怎么做），之后你可以使用Systrace生成一份细致、直观的报告，它展示了设备在你监测的这段时间内所发生的事情。

![overview](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/systrace-overview.png)
**图1.** 连续滑动应用5秒的Trace，显然它并没有表现得很好。

Figure 1. shows a trace captured while scrolling an app that is not rendering smoothly. By default, a zoomed out view of the traced duration is shown. The horizontal axis is time, and trace events are grouped by process, and then by thread on the vertical axis.

图一展示了应用在滑动不流畅的时候生成的trace。默认缩放成全局显示，你可以放大到自己所关注的地方。横轴代表着时间线，事件记录按进程分组，同一个进程内按线程纵向拆分记录各自的事件。

The groupings are in the order Kernel, SurfaceFlinger (the android compositor process), followed by apps, each labeled by package name. Each app process contains all of the tracing signals from each thread it contains, including a hierarchy of high level tracing events based on the enabled tracing categories.

在本例中，一共有三个组：Kernel, SurfaceFlinger, App，他们分别以包名为标识。每个App进程都会包含其中所有线程的记录信号，你可以看到从InputEvent到RenderThread都有。

##Generating a Trace
##生成Trace

In order to create a trace of your application, you must perform a few setup steps. First, you must have a device running Android 4.1 (API 16) or higher. Set up the device for debugging, connect it to your development system, and install your application. Some types of trace information, specifically disk activity and kernel work queues, require that you have root access to the device. However, most Systrace log data only requires that the device be enabled for developer debugging.

在获取trace之前，你需要一些启动步骤。首先，设备要求API>=16(Android 4.1)，之后开启debug、连接工作环境、安装App（正常的Debug流程）。由于需要记录磁盘活动和内核工作，你可能需要root权限。不过大部分时候你只要能够正常Debug即可。

Systrace traces can be run either from a command line or from a graphical user interface. This guide focuses on using the command line options.

Systrace 可以通过[命令行](http://developer.android.com/intl/zh-cn/tools/help/systrace.html#options)或者[图形界面](http://developer.android.com/intl/zh-cn/tools/help/systrace.html#gui)启动，本篇文章重点介绍通过命令行使用Systrace。

###Tracing on Android 4.3 and higher
###在Android 4.3及以上的系统中获取trace

To run a trace on Android 4.3 and higher devices:

在4.3以上的系统获取Trace步骤：

1. Make sure the device is connected through a USB cable and is enabled for debugging.
2. Run the trace with the options you want, for example:
```
    $ cd android-sdk/platform-tools/systrace
    $ python systrace.py --time=10 -o mynewtrace.html sched gfx view wm
```
3. On the device, execute any user actions you want be included in the trace.

1. 保证设备USB连接正常，并可以debug；
2. 在命令行中设置选项，开启trace，比如：
```
    $ cd android-sdk/platform-tools/systrace
    $ python systrace.py --time=10 -o mynewtrace.html sched gfx view wm
```
3. 在设备上做任何你想让trace记录的操作。

For more information on the available options for running Systrace, see the Systrace help page.

你可以通过[Systrace选项](http://developer.android.com/intl/zh-cn/tools/debugging/systrace.html#options-4.3)来了解更多命令行选项。

###Tracing on Android 4.2 and lower
###在Android 4.2及以下的系统中获取trace

To use Systrace effectively with devices running Android 4.2 and lower, you must configure the types of processes you want to trace before running a trace. The tool can gather the following types of process information:

在4.2及以下的系统中高效地使用Systrace的话，你需要在配置的时候显式指定要trace的进程种类。一共有这两类种类：

- General system processes such as graphics, audio and input processes (selected using trace category tags).
- Low level system information such as CPU, kernel and disk activity (selected using options).

- 普通系统进程，比如图形、声音、输入等。（通过tags设置，具体在[Systrace命令行](http://developer.android.com/intl/zh-cn/tools/help/systrace.html#options)中有介绍）
- 底层系统进程，比如CPU、内核、文件系统活动。（通过options设置，具体在[Systrace命令行](http://developer.android.com/intl/zh-cn/tools/help/systrace.html#options)中有介绍）

To set trace tags for Systrace using the command-line:

1. Use the `--set-tags` option:
```
    $ cd android-sdk/platform-tools/systrace
    $ python systrace.py --set-tags=gfx,view,wm
```
2. Stop and restart the adb shell to enable tracing of these processes.
```
    $ adb shell stop
    $ adb shell start
```

你可以通过以下命令行操作来设置tags：

1. 使用 `--set-tags`选项:
```
    $ cd android-sdk/platform-tools/systrace
    $ python systrace.py --set-tags=gfx,view,wm
```
2. 重启adb shell来trace这些进程：
```
    $ adb shell stop
    $ adb shell start
```

To set trace tags for Systrace using the device user interface:

1. On the device connected for tracing, navigate to: Settings > Developer options > Monitoring > Enable traces.
2. Select the categories of processes to be traced and click OK.

你也可以通过手机上的图形界面设置tags：

1. 在设备上进入设置> 开发者选项 > 监控 > 启用跟踪（部分手机上没有这个选项）；
2. 选择追踪进程类型，点击确认。

>Note: The adb shell does not have to be stopped and restarted when selecting trace tags using this method.

>注意: 在图形界面中设置tag时adb shell不用重新启动。

After you have configured the category tags for your trace, you can start collecting information for analysis.

在配置完tags后，你可以开始收集操作信息了。

To run a trace using the current trace tag settings:

1. Make sure the device is connected through a USB cable and is enabled for debugging.
2. Run the trace with the low-level system trace options and limits you want, for example:
    ```$ python systrace.py --cpu-freq --cpu-load --time=10 -o mytracefile.html```
3. On the device, execute any user actions you want be included in the trace.

如何在目前的trace设置下启动trace：

1. 保证设备的usb连接正常，并且可以正常debug；
2. 使用低系统等级的命令行选项开启trace，比如：
    ```$ python systrace.py --cpu-freq --cpu-load --time=10 -o mytracefile.html```
3. 在设备上做任何你想让trace记录的操作。

For more information on the available options for running Systrace, see the Systrace help page.

你可以通过[Systrace选项](http://developer.android.com/intl/zh-cn/tools/debugging/systrace.html#options-4.3)来了解更多命令行选项。

##Analyzing a Trace

After you have generated a trace, open the output html file using a web browser. This section explains how to analyze and interpret the information that the tool produces to find and fix UI performance problems.

在你获取trace之后你可以在网页浏览器中打开它。这部分内容告诉你怎么通过trace去分析和解决UI性能。

###Inspecting Frames
###监视帧数

Each app that is rendering frames shows a row of frame circles, which are typically colored green. Circles that are colored yellow or red, exceeding the 16.6 millisecond run time limit required to maintain a stable 60 frames per second. Zoom in using the 'w' key to see the frames of your application, and look for long-running frames getting in the way of smoothness.

每个应用都有一行专门显示frame，每一帧就显示为一个绿色的圆圈。不过也有例外，当显示为黄色或者红色的时候，它的渲染时间超过了16.6ms（即达不到60fps的水准）。'w'键可以放大，看看这一帧的渲染过程中系统到底做了什么。

>Note: Hit the '?' key, or the button in the top right for help navigating the trace.
>提示：你可以按右上角的'?'按钮来查看界面使用帮助。

![frame-unselected](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/systrace-frame-unselected.png)
Figure 2. Systrace display after zooming in on a long-running frame.
**图2.** Systrace显示长渲染时间的帧

Clicking on one such frame highlights it, focusing only on the work done by the system for that frame. On devices running Android 5.0 (API level 21) or higher, this work is split between the UI Thread and RenderThread. On prior versions, all work in creating a frame is done on the UI Thread.

单击该帧可以高亮它，这时候跟该帧有关的内容会被突出显示。在5.0及以上的系统中，显示工作被拆分成UI线程和Render线程两部分；在5.0以下的系统中，所有的显示工作在UI线程中执行。

Click on individual components of the frame to see how long they took to run. Some events, such as performTraversals, describe what the system is doing in that method when you select it. Selecting a frame displays any alerts present in that frame.

点击单个Frame下面的组件可以看他们所花费的时间。每个事件（比如`performTraversals`）都会在你选中的时候显示出它们调用了哪些方法及所用的时间。

###Investigating Alerts
###调查警告

Systrace does automatic analysis of the events in the trace, and highlights many performance problems as alerts, suggesting what to do next.

Systrace会自动分析事件，它会将任何它认为性能有问题的东西都高亮警告，并提示你要怎么去优化。

![frame-selected](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/systrace-frame-selected.png)
**图3.** 选择一个被高亮帧，它会显示出检测到的问题（回收ListView消耗时间太长）。

After you select a slow frame such as the one shown in Figure 3, an alert may be displayed. In the case above, it calls out that the primary problem with the frame is too much work being done inside ListView recycling and rebinding. There are links to the relevant events in the trace, which can be followed to explain more about what the system is doing during this time.

在你选择类似图三中的问题帧之后，它就会提示你检测出的问题。在这个例子中，它被警告的主要原因是ListView的回收和重新绑定花费太多时间。在Systrace中也会提供一些对应链接，它们会提供更多解释。

If you see too much work being done on the UI thread, as in this case with this ListView work, you can use Traceview, the app code profiling tool, to investigate exactly what is taking so much time.

如果你想知道UI线程怎么会花费这么多时间的话，你可以使用[TraceView](http://developer.android.com/intl/zh-cn/tools/debugging/debugging-tracing.html)，它会告诉你都是哪些函数在消耗时间。

Note that you can also find about every alert in the trace by clicking the Alerts tab to the far right of the window. Doing so expands the Alerts panel, where you can see every alert that the tool discovered in your trace, along with an occurrence count.

你可以通过右侧的'Alert'选项卡来查看整个trace过程中发生的问题，并进行快速定位。

![frame-selected-alert](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/systrace-frame-selected-alert-tab.png)
Figure 4. Clicking the Alert button to the right reveals the alert tab.
**图4.** 点击Alert选项卡。

The Alerts panel helps you see which problems occur in the trace, and how often they contribute to jank. Think of the alerts panel as a list of bugs to be fixed, often a tiny change or improvement in one area can eliminate an entire class of alerts from your application!

你可以将Alert面板中的问题视为需要处理的bug，很有可能每一次微小的优化能够去除整个应用中的警告！

##Tracing Application Code
##追踪应用代码

The tracing signals defined by the framework do not have visibility into everything your application is doing, so you may want to add your own. In Android 4.3 (API level 18) and higher, you can use the methods of the Trace class to add signals to your code. This technique can help you see what work your application's threads are doing at any given time. Tracing begin and end events do add overhead while a trace is being captured, a few microseconds each, but sprinkling in a few per frame, or per worker thread task can go a long way to adding context to a trace of your app.

Systrace并不会追踪应用的所有工作，所以你可以在有需求的情况下自己添加要追踪的代码部分。在Android 4.3及以上的代码中，你可以通过[`Trace`](http://developer.android.com/reference/android/os/Trace.html)类来实现这个功能。它能够让你在任何时候跟踪应用的一举一动。在你获取trace的过程中，`Trace.beginSection()`与`Trace.endSection()`之间代码工作会一直被追踪。

The following code example shows how to use the Trace class to track execution of an application method, including two nested code blocks within that method.

下面这部分代码展示了使用`Trace`的例子，在整个方法中含有两个Trace块。

    public void ProcessPeople() {
        Trace.beginSection("ProcessPeople");
        try {
            Trace.beginSection("Processing Jane");
            try {
                // code for Jane task...
            } finally {
                Trace.endSection(); // ends "Processing Jane"
            }
    
            Trace.beginSection("Processing John");
            try {
                // code for John task...
            } finally {
                Trace.endSection(); // ends "Processing John"
            }
        } finally {
            Trace.endSection(); // ends "ProcessPeople"
        }
    }

>Note: When you nest trace calls within each other, the endSection() method ends the most recently called beginSection(String) method. This means that a trace started within another trace cannot extend beyond the end of the enclosing trace, so make sure your beginning and ending method calls are properly matched to measure your applications processing.

>注意：在Trace是被嵌套在另一个Trace中的时候，`endSection()`方法只会结束理它最近的一个`beginSection(String)`。即在一个Trace的过程中是无法中断其他Trace的。所以你要保证`endSection()`与`beginSection(String)`调用次数匹配。

>Note: Traces must begin and end on the same thread. Do not call beginSection(String) on one thread of execution and then attempt to end the trace with a call to endSection() on another thread.

>注意：Trace的begin与end必须在同一线程之中执行！

When using application-level tracing with Systrace, you must specify the package name of your application in the user interface or specify the -a or --app= options on the command line. For more information, see the Systrace usage guide.

当你使用应用级别追踪的时候，你必须通过`-a`或者`-app=`来显式地指定应用包名。可以通过[Systrace指南](http://developer.android.com/intl/zh-cn/tools/help/systrace.html)查看更多关于它的信息。

You should enable app level tracing when profiling your app, even if you have not added signals yourself. Library code can include very useful tracing signals when you enable application-level tracing. The RecyclerView class is a great example of this, providing information about several important stages of work it executes.

你在评估应用的时候应该开启应用级别跟踪，即使当你没有手动添加`Trace`信号。因为很多库函数里面是有添加Trace信号的（比如`RecyclerView`），它们往往能够提供很多信息。

