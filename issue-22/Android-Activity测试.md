#Activity测试
---

> * 原文链接 : [Activity Testing](http://developer.android.com/intl/zh-cn/tools/testing/activity_testing.html)
* 原文作者 : [Android Developers](http://developer.android.com/index.html)
* 译者 : [desmond1121](https://github.com/desmond1121)
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成


Activity testing is particularly dependent on the Android instrumentation framework. Unlike other components, activities have a complex lifecycle based on callback methods; these can't be invoked directly except by instrumentation. Also, the only way to send events to the user interface from a program is through instrumentation.

Activity的测试在Android Instrumentation测试框架中是一个相对独立的模块。由于Activity拥有很多复杂的回调方法(onCreate, onResume, onXXX...)，并且无法在程序中直接调用他们，只能通过Instrumentation来控制它的生命周期。Instrumentation也是测试时发送UI事件的唯一方式。

This document describes how to test activities using instrumentation and other test facilities。 The document assumes you have already read Testing Fundamentals, the introduction to the Android testing and instrumentation framework.

这篇文档描述了怎么样使用Instrumentation和其他测试工具来进行自动化测试。在阅读它之前，你应该先阅读[Android测试基础](http://developer.android.com/tools/testing/testing_android.html)，它介绍了何为Android自动化测试与Instrumentation框架。


## Activity测试API介绍

The activity testing API base class is InstrumentationTestCase, which provides instrumentation to the test case subclasses you use for Activities.

Activity测试的基类是[InstrumentationTestCase](http://developer.android.com/reference/android/test/InstrumentationTestCase.html), 它为Activity测试所用的几个类提供Instrumentation支持。

For activity testing, this base class provides these functions:

在Activity测试中，这个基类能够提供以下三个功能：

- Lifecycle control: With instrumentation, you can start the activity under test, pause it, and destroy it, using methods provided by the test case classes.

- 生命周期控制：你可以使用Instrumentation来调用Activity的onResume、onPause、onDestroy等方法, 从而控制它的生命周期。

- Dependency injection: Instrumentation allows you to create mock system objects such as Contexts or Applications and use them to run the activity under test. This helps you control the test environment and isolate it from production systems. You can also set up customized Intents and start an activity with them.

- 依赖注入：你可以使用Instrumentation制造出伪Context或伪Application，这样能够帮助你更好地控制测试环境，通过自定义Intent启动Activity。

- User interface interaction: You use instrumentation to send keystrokes or touch events directly to the UI of the activity under test.

- 用户界面交互：你可以使用Instrumentation直接发送按键信息和触屏事件。

The activity testing classes also provide the JUnit framework by extending TestCase and Assert.

Activity测试类通过继承[TestCase](http://developer.android.com/reference/junit/framework/TestCase.html)和[Assert](http://developer.android.com/reference/junit/framework/Assert.html)实现了JUnit测试框架，你可以在测试的过程中使用。

The two main testing subclasses are ActivityInstrumentationTestCase2 and ActivityUnitTestCase. To test an Activity that is launched in a mode other than standard, you use SingleLaunchActivityTestCase.

两个主要用的测试子类是[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)和[ActivityUnitTestCase](http://developer.android.com/reference/android/test/ActivityUnitTestCase.html)，不过当Activity的`launchMode`设置为非`standard`属性时，你需要用[SingleLaunchActivityTestCase](http://developer.android.com/reference/android/test/SingleLaunchActivityTestCase.html);

### ActivityInstrumentationTestCase2

The ActivityInstrumentationTestCase2 test case class is designed to do functional testing of one or more Activities in an application, using a normal system infrastructure. It runs the Activities in a normal instance of the application under test, using a standard system Context. It allows you to send mock Intents to the activity under test, so you can use it to test an activity that responds to multiple types of intents, or an activity that expects a certain type of data in the intent, or both. Notice, though, that it does not allow mock Contexts or Applications, so you can not isolate the test from the rest of a production system.

这个类可以用来测试同一个应用的多个Activity，它拥有正常的应用实例环境和Context，可以接触到正常的系统结构（文件、数据库等）。你可以发送伪装的Intent给Activity，测试你的程序是否对接收到的各种Intent进行了正确处理。 **注意:这个类中不能伪Context和伪Application，所以你无法将测试从系统环境中独立出来。**

### ActivityUnitTestCase

The ActivityUnitTestCase test case class tests a single activity in isolation. Before you start the activity, you can inject a mock Context or Application, or both. You use it to run activity tests in isolation, and to do unit testing of methods that do not interact with Android. You can not send mock Intents to the activity under test, although you can call Activity.startActivity(Intent) and then look at arguments that were received.

这个类是用来测试单个Activity的。它可以运行在独立的测试环境中，你可以通过在启动Activity前设置Context或Application（当然都设置也可以）来实现模拟环境。你可以在自己的虚拟环境中测试程序而不会对系统、文件等造成实际的影响。在这个测试类下你无法向正在测试的Activity发送Intent，不过你可以在启动Activity的时候调用`Activity.startActivity(Intent)`来查看接收到的参数。

### SingleLaunchActivityTestCase

The SingleLaunchActivityTestCase class is a convenience class for testing a single activity in an environment that doesn't change from test to test. It invokes setUp() and tearDown() only once, instead of once per method call. It does not allow you to inject any mock objects.

这个类可以很方便地用来测试单个Activity。由于它只会调用一次`setUp()`和`tearDown()`（而不是每次方法都中都会调用），所以在这个实例中的所有测试方法共享一个测试环境。在这个类中不允许你加入任何的伪Object。

This test case is useful for testing an activity that runs in a mode other than standard. It ensures that the test fixture is not reset between tests. You can then test that the activity handles multiple calls correctly.

这个类在测试Activity的`launchMode`属性不是`standard`的时候非常有用，它保证了测试环境的不变，所以你可以用它来测试Activity是否对多次重复调用做出了正确应对。

### Mock objects and activity testing
### Activity中的伪Object使用

This section contains notes about the use of the mock objects defined in android.test.mock with activity tests.

这一段内容是要告诉你怎么在Android测试中使用`android.test.mock`包中所定义的一系列伪Object。

The mock object MockApplication is only available for activity testing if you use the ActivityUnitTestCase test case class. By default, ActivityUnitTestCase, creates a hidden MockApplication object that is used as the application under test. You can inject your own object using setApplication().

[MockApplication](http://developer.android.com/reference/android/test/mock/MockApplication.html)只可以在`ActivityUnitTestCase`中使用，你可以通过`setApplication()`来指定它（必须在startActivity之前调用）。若不指定的话，ActivityUnitTestCase会自己生成一个伪Application。(MockContext可以通过`setActivityContext()`指定)

### Assertions for activity testing
### Activity测试中的判断语句

ViewAsserts defines assertions for Views. You use it to verify the alignment and position of View objects, and to look at the state of ViewGroup objects.

[ViewAsserts](http://developer.android.com/reference/android/test/ViewAsserts.html)定义了供View使用的一些判断语句，它可以检查View内容的位置、对其情况和状态。

## What To Test
## 我们要测试什么？

- Input validation: Test that an activity responds correctly to input values in an EditText View. Set up a keystroke sequence, send it to the activity, and then use findViewById(int) to examine the state of the View. You can verify that a valid keystroke sequence enables an OK button, while an invalid one leaves the button disabled. You can also verify that the Activity responds to invalid input by setting error messages in the View.

- 输入合法性：你可以测试Activity是否对EditText的各类输入做出了正常反应。通过模拟输入一串信息发送给Activity，使用`findViewById(int)`来检查View的状态。你可以通过设置一个`Button`当输入异常时disable，输入正常时enable来，然后通过`assertEquals(button.isEnabled(), true)`检测。你还可以通过设置错误输入检查Activity是否进行了合适的处理。

- Lifecycle events: Test that each of your application's activities handles lifecycle events correctly. In general, lifecycle events are actions, either from the system or from the user, that trigger a callback method such as onCreate() or onClick(). For example, an activity should respond to pause or destroy events by saving its state. Remember that even a change in screen orientation causes the current activity to be destroyed, so you should test that accidental device movements don't accidentally lose the application state.

- 生命周期控制：你可以测试程序中的Activity是否正常处理了生命周期的各个轮转情况。一个合格的Activity应该在pause或destroy时保存一些下次运行时需要的状态。 **记住若屏幕布局方向改变（如竖屏变为横屏）会引起Activity的destroy过程**，你应该保证设备外部移动不会引起应用数据丢失。

- Intents: Test that each activity correctly handles the intents listed in the intent filter specified in its manifest. You can use ActivityInstrumentationTestCase2 to send mock Intents to the activity under test.

- Intent测试：你可以测试每个Activity是否正常处理了它在manifest文件下<intent-filter>属性中的Intent.你可以在`ActivityInstrumentationTestCase2`测试中发送伪Intent给Activity。

- Runtime configuration changes: Test that each activity responds correctly to the possible changes in the device's configuration while your application is running. These include a change to the device's orientation, a change to the current language, and so forth. Handling these changes is described in detail in the topic Handling Runtime Changes.

- 运行时设置改动： 你可以模拟设备的设置改变（如屏幕方向改变、语言改变等）来测试正在运行中的Activity的应对是否正确。在[Handling Runtime Changes](http://developer.android.com/guide/topics/resources/runtime-changes.html)一文中讲述了Activity如何应对运行时设备设置改变。

- Screen sizes and resolutions: Before you publish your application, make sure to test it on all of the screen sizes and densities on which you want it to run. You can test the application on multiple sizes and densities using AVDs, or you can test your application directly on the devices that you are targeting. For more information, see the topic Supporting Multiple Screens.

- 设备尺寸以及分辨率的适配: 在你的应用要发布之前，你应该保证它在各式各样的屏幕上运行正常，可以通过`ViewAsserts`来自动化检测布局情况。你可以在各式各样的安卓虚拟机上运行测试，或在直接目标机型上运行。你可以在[Support Multiple Screens](http://developer.android.com/guide/practices/screens_support.html)上查看应用如何支持多样化屏幕。

## Next Steps
## 接下来该做的事

To learn how to set up and run tests in Eclipse, please refer to Testing from Eclipse with ADT. If you're not working in Eclipse, refer to Testing from Other IDEs.

在[Testing from Eclipse with ADT](http://developer.android.com/tools/testing/testing_eclipse.html)一文中讲述了怎么使用Eclipse来进行Android自动化测试，[Testring from Other IDEs](http://developer.android.com/tools/testing/testing_otheride.html)一文中讲述了其他开发工具的Android测试使用。

If you want a step-by-step introduction to testing activities, try the Activity Testing Tutorial, which guides you through a testing scenario that you develop against an activity-oriented application.

你可以通过[Activity Testing Tutorial](http://developer.android.com/training/testing.htm)来循序渐进地学习如何做Activity自动化测试，这篇文章为你提供了测试以Activity为主的应用的方案。

## Appendix: UI Testing Notes
## 附录：关于UI测试中需要注意的地方

The following sections have tips for testing the UI of your Android application, specifically to help you handle actions that run in the UI thread, touch screen and keyboard events, and home screen unlock during testing.

以下这部分内容是对于一些UI测试的tips，特别是当你要测试主线程中的动作（触屏、输入和锁屏等事件）时，你应该仔细看一下这部分内容。

### Testing on the UI Thread
### 在主线程上做测试

An application's activities run on the application's UI thread. Once the UI is instantiated, for example in the activity's onCreate() method, then all interactions with the UI must run in the UI thread. When you run the application normally, it has access to the thread and does not have to do anything special.This changes when you run tests against the application. With instrumentation-based classes, you can invoke methods against the UI of the application under test. The other test classes don't allow this. To run an entire test method on the UI thread, you can annotate the thread with @UiThreadTest. Notice that this will run all of the method statements on the UI thread. Methods that do not interact with the UI are not allowed; for example, you can't invoke Instrumentation.waitForIdleSync().

应用的Activities是运行在主线程上的。一旦UI界面实例化（举个简单的例子：当Activity的onCreate方法经调用后UI即会实例化），那么所有和UI界面交互的事件都必须在主线程里面发生。当你正常启动应用时，必须按照这个规则程序才能够正常运行。但是在以Instrumentation为基础的测试中（其他类测试不可以），你可以在测试程序中对UI进行操作。

如果要让整个测试函数都在主线程中运行，你可以给函数加上注解`@UiThreadTest`，但是这种情况下会让整个函数中的所有语句都运行在主线程中，这种情况下不和UI组件交互的语句是不允许的（如`Instrumentation.waitForIdleSync()`）。

To run a subset of a test method on the UI thread, create an anonymous class of type Runnable, put the statements you want in the run() method, and instantiate a new instance of the class as a parameter to the method appActivity.runOnUiThread(), where appActivity is the instance of the application you are testing.

让一个测试函数中的一部分在主线程中运行，你可以调用的`appActivity.runOnUiThread()`办法（`appActivity`是你在测试中拥有的Activity实例），将你想要运行在主线程中的东西放入一个匿名内部类`Runnable`中然后传给它。

For example, this code instantiates an activity to test, requests focus (a UI action) for the Spinner displayed by the activity, and then sends a key to it. Notice that the calls to waitForIdleSync and sendKeys aren't allowed to run on the UI thread:

举个例子，这段代码测试了一个Activity实力，控制Spinner获取焦点，并发送给它一个触屏事件。注意`waitForIdleSync`和`sendKeys`是不允许运行在主线程中的。

      private MyActivity mActivity; // MyActivity is the class name of the app under test
      private Spinner mSpinner;

      ...

      protected void setUp() throws Exception {
          super.setUp();
          mInstrumentation = getInstrumentation();

      mActivity = getActivity(); // get a references to the app under test

      /*
       * Get a reference to the main widget of the app under test, a Spinner
       */
      mSpinner = (Spinner) mActivity.findViewById(com.android.demo.myactivity.R.id.Spinner01);

      ...

      public void aTest() {
          /*
           * request focus for the Spinner, so that the test can send key events to it
           * This request must be run on the UI thread. To do this, use the runOnUiThread method
           * and pass it a Runnable that contains a call to requestFocus on the Spinner.
           */
          mActivity.runOnUiThread(new Runnable() {
              public void run() {
                  mSpinner.requestFocus();
              }
          });

      mInstrumentation.waitForIdleSync();

      this.sendKeys(KeyEvent.KEYCODE_DPAD_CENTER);

###Turning off touch mode
###屏蔽掉物理按键和触屏

To control the emulator or a device with key events you send from your tests, you must turn off touch mode. If you do not do this, the key events are ignored.

为了让模拟器或者设备接收到测试程序的按键，你需要屏蔽掉设备的物理的按键和触屏事件。如果不这么做的话，测试程序发来的此类事件是不会起作用的。

To turn off touch mode, you invoke ActivityInstrumentationTestCase2.setActivityTouchMode(false) before you call getActivity() to start the activity. You must invoke the method in a test method that is not running on the UI thread. For this reason, you can't invoke the touch mode method from a test method that is annotated with @UiThreadTest. Instead, invoke the touch mode method from setUp().

你可以通过调用`ActivityInstrumentationTestCase2.setActivityTouchMode(false)`来做到这点（在`getActivity()`之间调用这条语句才会起到作用）。 **注意，你不能在运行在主线程的语句中调用它**，所以它不可以出现在含有`@UiThreadTest`注解的函数中，实际上最好的办法就是在`setUp()`方法中做这件事。

###Unlocking the emulator or device
###先将设备解锁再进行测试

You may find that UI tests don't work if the emulator's or device's home screen is disabled with the keyguard pattern. This is because the application under test can't receive key events sent by sendKeys(). The best way to avoid this is to start your emulator or device first and then disable the keyguard for the home screen.

你可能发现UI测试在屏幕锁屏（或其他加密手段）时是无法使用的，因为在这种情况下应用无法接收到`sendKeys()`发送的事件。最好的解决办法就是先解锁设备再进行测试。

You can also explicitly disable the keyguard. To do this, you need to add a permission in the manifest file (AndroidManifest.xml) and then disable the keyguard in your application under test. Note, though, that you either have to remove this before you publish your application, or you have to disable it with code in the published application.

当然你也可以通过在onCreate中加上以下这段代码来显式地禁用锁屏，不过你需要为应用加上权限`<uses-permission android:name="android.permission.DISABLE_KEYGUARD"/>`。

      mKeyGuardManager = (KeyguardManager) getSystemService(KEYGUARD_SERVICE);
      mLock = mKeyGuardManager.newKeyguardLock("activity_classname");
      mLock.disableKeyguard();

###Troubleshooting UI tests
###疑难解答

This section lists some of the common test failures you may encounter in UI testing, and their causes:

这部分列出了一些在UI测试中比较多发生的错误。

**`WrongThreadException`:**

Problem:

For a failed test, the Failure Trace contains the following error message: android.view.ViewRoot$CalledFromWrongThreadException: Only the original thread that created a view hierarchy can touch its views.

**问题:**

遇到错误消息：`android.view.ViewRoot$CalledFromWrongThreadException: Only the original thread that created a view hierarchy can touch its views.`而导致测试崩溃。

Probable cause:

This error is common if you tried to send UI events to the UI thread from outside the UI thread. This commonly happens if you send UI events from the test application, but you don't use the @UiThreadTest annotation or the runOnUiThread() method. The test method tried to interact with the UI outside the UI thread.

**可能的原因：**

如果从非UI线程中和UI进行交互就会发生这个问题。当在测试中UI控件交互而你不加`@UiThreadTest`注解或者不在`runOnUiThread()`方法中进行的话，它会在非主进程中执行这些命令，这个错误就会发生。

Suggested Resolution:

Run the interaction on the UI thread. Use a test class that provides instrumentation. See the previous section Testing on the UI Thread for more details.

**建议：**

在主进程中和UI交互，并且使用支持Instrumentation的测试类。你可以在[Testing on UI Thread](http://developer.android.com/tools/testing/activity_testing.html#RunOnUIThread)找到更多消息。

**`java.lang.RuntimeException`:**

Problem:

For a failed test, the Failure Trace contains the following error message: java.lang.RuntimeException: This method can not be called from the main application thread

**问题：**

由错误消息`java.lang.RuntimeException: This method can not be called from the main application thread`所导致的测试崩溃。

Probable Cause:

This error is common if your test method is annotated with @UiThreadTest but then tries to do something outside the UI thread or tries to invoke runOnUiThread().

**可能的原因：**

这个错误经常发生在你在`@UiThreadTest`注解的函数中调用了`runOnUiThread()`或其他不在UI进程中运行的语句。

Suggested Resolution:

Remove the @UiThreadTest annotation, remove the runOnUiThread() call, or re-factor your tests.

**建议：**

你可以通过尝试去掉`@UiThreadTest`注解，或去掉`runOnUiThread()`，或重写测试程序来尝试解决。

