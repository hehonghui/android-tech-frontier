#Activity测试
---

> * 原文链接 : [Activity Testing](http://developer.android.com/intl/zh-cn/tools/testing/activity_testing.html)
* 原文作者 : [Android Developers](http://developer.android.com/index.html)
* 译者 : [desmond1121](https://github.com/desmond1121)
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)


Activity测试依赖于Android Instrumentation测试框架。有其他组件不同的是Activity有更复杂的生命周期，这些生命周期函数不能直接地被调用，而只能通过Instrumentation发送事件来触发它们。

这篇文档描述了怎么样使用Instrumentation和其他测试工具来进行自动化测试。在阅读它之前，你应该先阅读[Android测试基础](http://developer.android.com/tools/testing/testing_android.html)，它介绍了何为Android自动化测试与Instrumentation框架。


## Activity测试API介绍


Activity测试的基类是[InstrumentationTestCase](http://developer.android.com/reference/android/test/InstrumentationTestCase.html), 它为Activity测试所用的几个类提供Instrumentation支持。


在Activity测试中，这个基类能够提供以下三个功能：

- 生命周期控制：你可以使用Instrumentation来调用Activity的onResume、onPause、onDestroy等方法, 从而控制它的生命周期。

- 依赖注入：你可以使用Instrumentation制造出伪Context或伪Application，这样能够帮助你更好地控制测试环境，通过自定义Intent启动Activity。

- 用户界面交互：你可以使用Instrumentation直接发送按键信息和触屏事件。

Activity测试类通过继承[TestCase](http://developer.android.com/reference/junit/framework/TestCase.html)和[Assert](http://developer.android.com/reference/junit/framework/Assert.html)实现了JUnit测试框架，你可以在测试的过程中使用。

两个主要用的测试子类是[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)和[ActivityUnitTestCase](http://developer.android.com/reference/android/test/ActivityUnitTestCase.html)，不过当Activity的`launchMode`设置为非`standard`属性时，你需要用[SingleLaunchActivityTestCase](http://developer.android.com/reference/android/test/SingleLaunchActivityTestCase.html);

### ActivityInstrumentationTestCase2

这个类可以用来测试同一个应用的多个Activity，它拥有正常的应用实例环境和Context，可以接触到正常的系统结构（文件、数据库等）。你可以发送伪装的Intent给Activity，测试你的程序是否对接收到的各种Intent进行了正确处理。 **注意:这个类中不能伪Context和伪Application，所以你无法将测试从系统环境中独立出来。**

### ActivityUnitTestCase

这个类是用来测试单个Activity的。它可以运行在独立的测试环境中，你可以通过在启动Activity前设置Context或Application（当然都设置也可以）来实现模拟环境。你可以在自己的虚拟环境中测试程序而不会对系统、文件等造成实际的影响。在这个测试类下你无法向正在测试的Activity发送Intent，不过你可以在启动Activity的时候调用`Activity.startActivity(Intent)`来查看接收到的参数。

### SingleLaunchActivityTestCase

这个类可以很方便地用来测试单个Activity。由于它只会调用一次`setUp()`和`tearDown()`（而不是每次方法都中都会调用），所以在这个实例中的所有测试方法共享一个测试环境。在这个类中不允许你加入任何的伪Object。

这个类在测试Activity的`launchMode`属性不是`standard`的时候非常有用，它保证了测试环境的不变，所以你可以用它来测试Activity是否对多次重复调用做出了正确应对。

### Activity中的伪Object使用

这一段内容是要告诉你怎么在Android测试中使用`android.test.mock`包中所定义的一系列伪Object。

[MockApplication](http://developer.android.com/reference/android/test/mock/MockApplication.html)只可以在`ActivityUnitTestCase`中使用，你可以通过`setApplication()`来指定它（必须在startActivity之前调用）。若不指定的话，ActivityUnitTestCase会自己生成一个伪Application。(MockContext可以通过`setActivityContext()`指定)

### Activity测试中的判断语句

[ViewAsserts](http://developer.android.com/reference/android/test/ViewAsserts.html)定义了供View使用的一些判断语句，它可以检查View内容的位置、对其情况和状态。

## 我们要测试什么？

- 输入合法性：你可以测试Activity是否对EditText的各类输入做出了正常反应。通过模拟输入一串信息发送给Activity，使用`findViewById(int)`来检查View的状态。你可以通过设置一个`Button`当输入异常时disable，输入正常时enable来，然后通过`assertEquals(button.isEnabled(), true)`检测。你还可以通过设置错误输入检查Activity是否进行了合适的处理。

- 生命周期控制：你可以测试程序中的Activity是否正常处理了生命周期的各个轮转情况。一个合格的Activity应该在pause或destroy时保存一些下次运行时需要的状态。 **记住若屏幕布局方向改变（如竖屏变为横屏）会引起Activity的destroy过程**，你应该保证设备外部移动不会引起应用数据丢失。

- Intent测试：你可以测试每个Activity是否正常处理了它在manifest文件下<intent-filter>属性中的Intent.你可以在`ActivityInstrumentationTestCase2`测试中发送伪Intent给Activity。

- 运行时设置改动： 你可以模拟设备的设置改变（如屏幕方向改变、语言改变等）来测试正在运行中的Activity的应对是否正确。在[Handling Runtime Changes](http://developer.android.com/guide/topics/resources/runtime-changes.html)一文中讲述了Activity如何应对运行时设备设置改变。

- 设备尺寸以及分辨率的适配: 在你的应用要发布之前，你应该保证它在各式各样的屏幕上运行正常，可以通过`ViewAsserts`来自动化检测布局情况。你可以在各式各样的安卓虚拟机上运行测试，或在直接目标机型上运行。你可以在[Support Multiple Screens](http://developer.android.com/guide/practices/screens_support.html)上查看应用如何支持多样化屏幕。

## 接下来该做的事

在[Testing from Eclipse with ADT](http://developer.android.com/tools/testing/testing_eclipse.html)一文中讲述了怎么使用Eclipse来进行Android自动化测试，[Testring from Other IDEs](http://developer.android.com/tools/testing/testing_otheride.html)一文中讲述了其他开发工具的Android测试使用。

你可以通过[Activity Testing Tutorial](http://developer.android.com/training/testing.htm)来循序渐进地学习如何做Activity自动化测试，这篇文章为你提供了测试以Activity为主的应用的方案。

## 附录：关于UI测试中需要注意的地方

以下这部分内容是对于一些UI测试的tips，特别是当你要测试主线程中的动作（触屏、输入和锁屏等事件）时，你应该仔细看一下这部分内容。

### 在主线程上做测试

应用的Activities是运行在主线程上的。一旦UI界面实例化（举个简单的例子：当Activity的onCreate方法经调用后UI即会实例化），那么所有和UI界面交互的事件都必须在主线程里面发生。当你正常启动应用时，必须按照这个规则程序才能够正常运行。但是在以Instrumentation为基础的测试中（其他类测试不可以），你可以在测试程序中对UI进行操作。

如果要让整个测试函数都在主线程中运行，你可以给函数加上注解`@UiThreadTest`，但是这种情况下会让整个函数中的所有语句都运行在主线程中，这种情况下不和UI组件交互的语句是不允许的（如`Instrumentation.waitForIdleSync()`）。

让一个测试函数中的一部分在主线程中运行，你可以调用的`appActivity.runOnUiThread()`办法（`appActivity`是你在测试中拥有的Activity实例），将你想要运行在主线程中的东西放入一个匿名内部类`Runnable`中然后传给它。

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

###屏蔽掉物理按键和触屏

为了让模拟器或者设备接收到测试程序的按键，你需要屏蔽掉设备的物理的按键和触屏事件。如果不这么做的话，测试程序发来的此类事件是不会起作用的。

你可以通过调用`ActivityInstrumentationTestCase2.setActivityTouchMode(false)`来做到这点（在`getActivity()`之间调用这条语句才会起到作用）。 **注意，你不能在运行在主线程的语句中调用它**，所以它不可以出现在含有`@UiThreadTest`注解的函数中，实际上最好的办法就是在`setUp()`方法中做这件事。

###先将设备解锁再进行测试

你可能发现UI测试在屏幕锁屏（或其他加密手段）时是无法使用的，因为在这种情况下应用无法接收到`sendKeys()`发送的事件。最好的解决办法就是先解锁设备再进行测试。

当然你也可以通过在onCreate中加上以下这段代码来显式地禁用锁屏，不过你需要为应用加上权限`<uses-permission android:name="android.permission.DISABLE_KEYGUARD"/>`。

      mKeyGuardManager = (KeyguardManager) getSystemService(KEYGUARD_SERVICE);
      mLock = mKeyGuardManager.newKeyguardLock("activity_classname");
      mLock.disableKeyguard();

###疑难解答

这部分列出了一些在UI测试中比较多发生的错误。

**`WrongThreadException`:**

**问题:**

遇到错误消息：`android.view.ViewRoot$CalledFromWrongThreadException: Only the original thread that created a view hierarchy can touch its views.`而导致测试崩溃。

**可能的原因：**

如果从非UI线程中和UI进行交互就会发生这个问题。当在测试中UI控件交互而你不加`@UiThreadTest`注解或者不在`runOnUiThread()`方法中进行的话，它会在非主进程中执行这些命令，这个错误就会发生。

**建议：**

在主进程中和UI交互，并且使用支持Instrumentation的测试类。你可以在[Testing on UI Thread](http://developer.android.com/tools/testing/activity_testing.html#RunOnUIThread)找到更多消息。

**`java.lang.RuntimeException`:**

**问题：**

由错误消息`java.lang.RuntimeException: This method can not be called from the main application thread`所导致的测试崩溃。

**可能的原因：**

这个错误经常发生在你在`@UiThreadTest`注解的函数中调用了`runOnUiThread()`或其他不在UI进程中运行的语句。

**建议：**

你可以通过尝试去掉`@UiThreadTest`注解，或去掉`runOnUiThread()`，或重写测试程序来尝试解决。

