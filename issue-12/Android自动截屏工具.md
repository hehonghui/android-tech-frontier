Android 自动截屏工具
---

> * 原文链接 : [Automating Android Screenshots](https://medium.com/@swanhtet1992/automating-android-screenshots-5b7574c0621d)
* 原文作者 : [Swan Htet Aung](https://medium.com/@swanhtet1992)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sundroid](https://github.com/sundroid) 
* 校对者: [yinna317](https://github.com/yinna317 )  
* 状态 :  完成

随着mac版本AndroidTool的发布，获取android应用截屏变得非常简单。与此同时，感谢开发商！这对于我们开发者来说真是太好了！

对于简单应用来说，AndroidTool是足够满足截屏的功能需求了，然而，我需要在在我正在开发的一款app上完成一个完全自动化的截图过程，并且将截图发布到应用市场。我认为这将不简单，所以，我尽量避免复杂的实现过程，而是想办法如何更好的结合AndroidTool来完成这个功能。

然而当我昨天阅读了[Enrique López Mañas yesterday](https://medium.com/@enriquelopezmanas)的[Automating Android development](https://medium.com/google-developer-experts/automating-android-development-6daca3a98396)文章，我意识到，他在博客中讨论的话题我已经完成了4/5。唯一我还没有做的就是测试。我不喜欢测试，然而，那篇文章激励着我去尝试写测试代码。。 所以，我今天早上尝试了一下。经过几个小时编写测试代码，我意外的找到了自动化截图的解决方案。

在这片文章中，我将会谈论关于如何通过ui 测试来完成自动截图和提交这些截图到应用商店。

##UI Automator查看器

‘uiautomatorviewer’是一个非常强大的工具来查看views，当发现极好的布局时，我通常会使用‘uiautomatorviewer’来查看，如果你运行这个工具将会获得下图所示。

![](https://d262ilb51hltx0.cloudfront.net/max/2000/1*2GVDSxydFfqY4WvXBBVQ1Q.png)

通过这个工具你可以看到UI对象，在这里，我可以检测TextView的id，这个技巧在稍后会变得非常有用。。

![](https://d262ilb51hltx0.cloudfront.net/max/2000/1*9yNBO3PwetoOv7EWEChsag.png)

##UI Automator

Google在[Android Testing Support Library](https://developer.android.com/tools/testing-support-library/index.html)里面同时也提供了一个叫做‘UI Automator’ 的库，它允许开发者自动化获取用户交互过程。

使用UI Automator时，你需要在你的项目中添加依赖，具体配置信息需要填写在`build.gradle`里面。

正如[文档](https://developer.android.com/training/testing/ui-testing/uiautomator-testing.html#run)中所说。你需要指定[AndroidJUnitRunner](https://developer.android.com/reference/android/support/test/runner/AndroidJUnitRunner.html)作为你默认的测试工具。

UI Automator 里面频繁使用的类有：UiDevice, UiSelector, UiObject, and UiScrollable.

我们将会在androidTestScreenshot文件夹下创建一个简单的测试类，并且这个类继承InstrumentationTestCase。

这个过程很直接：

首先，监听设备点击“Home”键时，执行UiDevice 的方法pressHome()。在每一个测试里面，我们做这样重复性的工作：

从最开始的地方打开app。我个人发现一个简答的方法去获取截屏。你可以使用UiDevice的pressBack()方法为其他测试。

获取想要的UI交互可以使用UiSelector, UiScrollable, and UiObject。

使用SystemClock.sleep方法，为异步任务的执行腾出一些时间（异步任务的执行可能在截屏之后），以此来避免发生截屏获取的为空异常和UiObject not found异常。

最后我们截屏并且将获取的截屏保存在指定的位置。

到目前为止，你可能已经了解了如何使用uiautomatorviewer来帮助我们获取许多我们想要的UI元素，然而，我使用UiSelector().resourceId，因为我们可以通过我们在layout里面使用的id来完成截屏，这样不是更加简单了吗？你也可以有其他选择，比如使用 className, text, etc… 来完成这一过程。

##Product Flavor

我不知道为什么UiAutomator下的minSdkVersion是18，因为我需要minSdk至少是14，我需要使用这个额外的方法。如果这里有任何其他方法可以避免我自己去实现截屏的，请让我知道。

Android使用androidTest来实现主要的测试工作，也为了实现不同产品的写测试需要，我们需要写我们的测试在androidTestFlavorName文件夹。这就是为什么我们在androidTestScreenshot路径下创建SimpleUiTest 类的原因。

万事具备，现在，运行`gradle connectedAndroidTestScreenshotDebug`。在这个测试完成后你将会获得屏幕截图。

