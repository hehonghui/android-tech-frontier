# Service测试
---

> * 原文链接 : [Service Testing](http://developer.android.com/tools/testing/service_testing.html)
* 原文作者 : [google develper](http://developer.android.com/)
* 译文出自 :  [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sjyin](https://github.com/yinshijian-kkb) 
* 校对者 : [Mr.Simple](https://github.com/bboyfeiyu) 

Android为Service对象提供了一套测试框架，框架可以独立的运行，并且提供了模拟对象。这个测试用例类的名字叫做[ServiceTestCase](http://developer.android.com/tools/testing/service_testing.html)。因为这个Service类是独立于客户端的，所以，你不用使用`instrumentation`就可以测试Service对象。


这篇文档描述了测试Service对象的技术。如果你对Service不熟悉，请阅读[Service](http://developer.android.com/guide/components/services.html)文档。如果你不熟悉Android测试，请阅读介绍Android测试和instrumentation框架的[测试文档](http://developer.android.com/tools/testing/testing_android.html)。

## ***Service设计和测试***

当你设计一个Service的时候，你应该考虑你的测试用例怎么样才能测试Service的整个生命周期。如果启动了Service，比如调用了`onCreate()`或者`onStartCommand()`，但并没有设置一个检测是否成功的全局变量，你可能想要提供一个以测试为目的的变量。

大多数其他的测试可以通过[ServiceTestCase](http://developer.android.com/tools/testing/service_testing.html)的测试用例类来方便地进行测试。例如，`getService()`方法在测试中返回一个处理Service的句柄，通过这个句柄你可以确定Service是否正在运行。

##***ServiceTestCase***

ServiceTestCase扩展了JUnit[测试用例](http://developer.android.com/reference/junit/framework/TestCase.html)，添加测试应用权限、控制应用和Service的方法。它还提供了独立于系统的mock application和Context对象。

ServiceTestCase)会在你调用`ServiceTestCase.startService()`或`ServiceTestCase.bindService()`的时候初始化测试环境。这是为了允许你在启动Service之前初始化测试环境，尤其是你的mock对象。

注意：`Service.bindService()`的参数不同于`ServiceTestCase.bindService()`。因为`ServiceTestCase`的版本，你只能提供一个`Intent`。`ServiceTestCase.bindService()`会返回一个IBinder子对象，代替一个`boolean`值。

ServiceTestCase中的`setUp()`方法会在每次测试的时候调用。任何方法调用它，它都会创建一个当前系统的上下文的拷贝。你可以通过调用`getSystemContext()`查看这个上下文对象。如果，你重写该方法，你必须在重写的方法中首先调用`super.setUp()`。

`setApplication()`和`setContext(Context) setContext()`允许你在开启Service之前为Service设置一个模拟的`Context`和`Application`（或者两者）。这些模拟的对象在[模拟对象集合](#mock)中。

默认情况下，ServiceTestCase运行`testAndroidTestCaseSetupProperly()`方法，去声明在测试启动之前已经成功的创建`Context`。

<b id="mock"></b>
## ***模拟对象集合***

ServiceTestCase假定你在测试环境中将会使用模拟的`Context`和`Application`（或者两者）。这些对象是跟系统分离的。如果你在启动Service之前不创建这些对象的实例，那么，ServiceTestCase会创建它内部的实例并将它们注入到Service中。你可以在开启Service之前通过创建和注入你自己的实例对象来实现这一功能。

在测试的时候，将一个模拟对象注入到Service中。
首先，创建一个[MockApplication](http://developer.android.com/reference/android/test/mock/MockApplication.html)的子类。`MockApplication`是Applicatoin的子类。然后，使用`setApplication()`将它注入到Service中。这个模拟对象允许你操作Service中的值，并且不受真实的系统影响。另外，当你运行测试的时候，你的Service中任何隐藏的应用依赖将会被当做异常处理。

在测试中，你使用`setContext()`方法注入一个模拟`Context`到Service中。在[基础测试](http://developer.android.com/tools/testing/testing_android.html#MockObjectClasses)中，模拟的`Context`可以描述更多细节。

## ***测试什么***

测试什么这一主题下列出了测试android组件一般需要考虑的问题。这些是测试Service的具体指导：

确保调用`Context.startService()`或`Context.bindService()`时`onCreate()`做出了响应。同理，调用`Context.stopService()`,`Context.unbindService()`,`stopSelf()`, 或者`stopSelfResult()`时`onDestroy()`做出了响应。

多次调用`Context.startService()`只有第一次才会触发`Service.onCreate()`方法，但是所有的调用都会触发`Service.onStartCommand()`。

另外，记着`startService()`不能够嵌套调用。所以，`Context.stopService()`或者`Service.stopSelf()`（不是`stopSelf(int)`）任意一个方法都可以停止Service。你应该测试你的Service是不是在正确的时间点关闭。
测试Service中的每个业务逻辑。业务逻辑包括无效值的检查，算法的计算等等。


