#Automating User Interface Testing on Android
#Android UI 自动化测试

* 原文链接 : [Automating User Interface Testing on Android](http://code.tutsplus.com/tutorials/automating-user-interface-testing-on-android--cms-23969)
* 原文作者 : [Ashraff Hathibelagal](http://tutsplus.com/authors/ashraff-hathibelagal)
* 译文出自 : [tuts+](http://code.tutsplus.com/)
* 译者 : [Doris](https://github.com/DorisMinmin)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成

##Introduction
##介绍
Android's Testing Support library includes the **UI Automator framework**, which can be used to perform automated black-box testing on Android apps. Introduced in API Level 18, the framework allows developers to simulate user actions on the widgets that constitute an app's user interface.

Android测试支持库包含**UI自动化模块**，它可以对Android应用进行自动黑盒测试。在API Level 18中引入了自动化模块，它允许开发者在组成应用UI的控件上模仿用户行为。

In this tutorial, I am going to show you how to use the framework to create and run a basic user interface test for the default Calculator app.

在这个教程中，我将展示如何使用此模块来创建和执行一个基本的UI测试，选择默认的计算器模块进行测试。

##Prerequisites
##先决条件
To follow along, you need:
  the latest build of [Android Studio](https://developer.android.com/sdk/index.html)
  a device or emulator that runs Android 4.3 or higher
  a basic understanding of [JUnit](http://junit.org/)

在使用前，需要具备以下条件：
  1.最新版本的[Android Studio](https://developer.android.com/sdk/index.html)
  2.运行Android 4.3或者更高版本的设备或者虚拟器
  3.理解[JUnit](http://junit.org/)

##1. Installing Dependencies
##1. 安装信赖
To use the UI Automator framework in your project, edit the *build.gradle* file in your project's *app* directory, adding the following dependencies:

工程中使用UI自动化模块，需要编辑你的工程下*app*目录下的文件*build.gradle*，添加如下信任：
```xml
1  androidTestCompile 'com.android.support.test:runner:0.2'                       
2  androidTestCompile 'com.android.support.test:rules:0.2'                        
3  androidTestCompile 'com.android.support.test.uiautomator:uiautomator-v18:2.1.0'
```
The *Sync Now* button should be on the screen now. When you click it, you should see an error that looks like this:

现在屏幕上应该有*Sync Now*按钮了，但点击它时，会看到如下错误信息：

![p1](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest1.png)

Click the **Install Repository and sync project** link to install the **Android Support Repository**.
点击 **Install Repository and sync project** 链接来安装 **Android Support Repository**。

If you are using the **appcompat-v7** library and its version is **22.1.1**, you need to add the following dependency to ensure that both the app and the test app are using the same version of ```com.android.support:support-annotations```:

如果使用的是库**appcompat-v7** 且其版本号是**22.1.1**，你需要添加如下依赖以确保应用本身和测试应用都使用相同版本的```com.android.support:support-annotations```:

```xml
1   androidTestCompile 'com.android.support:support-annotations:22.1.1'
```
Next, due to a bug in Android Studio, you need to exclude a file named **LICENSE.txt** using ```packagingOptions```. Failing to do so will lead to the following error when you try to run a test:

接下来，由于Android Studio自身的一个bug，你需要通过 ```packagingOptions``` 执行一个名为 **LICENSE.txt** 的文件。这个执行失败的话，在运行测试时将引起如下错误：

```
1   Execution failed for task ':app:packageDebugAndroidTest'.                                                                                   
2   Duplicate files copied in APK LICENSE.txt                                                                                                   
3                                                                                                                                               
4   File 1: ~/.gradle/caches/modules-2/files-2.1/org.hamcrest/hamcrest-core/1.1/860340562250678d1a344907ac75754e259cdb14/hamcrest-core-1.1.jar  
5   File 2: ~/.gradle/caches/modules-2/files-2.1/junit/junit-dep/4.10/64417b3bafdecd366afa514bd5beeae6c1f85ece/junit-dep-4.10.jar               
```
Add the following snippet at the bottom of your **build.gradle** file:
在你的**build.gradle**文件底部增加如下代码段：
```Java
1   android {                                       
2       packagingOptions {                          
3           exclude 'LICENSE.txt'                   
4       }                                           
5   }                                               
```
##2. Create a Test Class
##2、创建测试类
Create a new test class, ```CalculatorTester```, by creating a file named **CalculatorTester.java** inside the **androidTest** directory. To create a UI Automator test case, your class must extend ```InstrumentationTestCase```.

创建一个新的测试类，```CalculatorTester```，通过在 **androidTest** 目录下创建名为 **CalculatorTester.java** 的文件实现。创建的UI自动化测试用例，必须继承自```InstrumentationTestCase```。

![P2](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest2.png)

Press **Alt+Insert** and then click **SetUp Method** to override the ```setUp``` method.

按 **Alt+Insert**后选择 **SetUp Method** 来重写```setUp```方法。

![P3](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest3.png)

Press **Alt+Insert** again and click **Test Method** to generate a new test method. Name this method ```testAdd```. The ```CalculatorTester``` class should now look like this:

再次按 **Alt+Insert** 后选择 **Test Method** 来生成新的测试方法，命名为```testAdd```。到此```CalculatorTester```类定义如下：
```Java
01  public class CalculatorTester extends InstrumentationTestCase{
02                                                                
03      @Override                                                 
04      public void setUp() throws Exception {                    
05                                                                
06      }                                                         
07                                                                
08      public void testAdd() throws Exception {                  
09                                                                
10      }                                                         
11  }                                                                    
```
##3. Inspect the Launcher's User Interface
##3、查看Launcher UI

Connect your Android device to your computer and press the home button on your device to navigate to the home screen.

连接你的Android设备到电脑商，点击home按键，进入主界面。

Go back to your computer and use your a file explorer or terminal to browse to the directory where you installed the Android SDK. Next, enter the **tools** directory inside it and launch **uiautomatorviewer**. This will launch **UI Automater Viewer**. You should be presented with a screen that looks like this:

返回到你的电脑，使用文件管理或者终端浏览你安装Android SDK的目录，进入到 **tools** 目录下，点击 **uiautomatorviewer** 。这个会启动 **UI Automater Viewer** ，你将看到如下界面：

![P4](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest4.png)

Click the button that looks like a phone to capture a screenshot of your Android device. Note that the screenshot you just captured is interactive. Click the Apps icon at the bottom. In the **Node Detail** section on the right, you're now able to see various details of your selection as shown below.

点击上方手机图标来获取Android设备截屏。注意到此时获取到的截屏是可交互的。点击下面的Apps图标。在右方的 **Node Detail** 区域，你就可以看到根据选择图标的不同显示不同的详细信息，如下图所示：

![P5](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest5.jpg)

To interact with items on the screen, the UI Automator testing framework needs to be able to uniquely identify them. In this tutorial, you will be using either the ```text```, the ```content-desc```, or the ```class``` of the item to uniquely identify it.

与屏幕上的应用交互，UI自动化测试需要能唯一识别它们。在这个教程中，可以使用应用的```text```、```content-desc```或者```class```字段来唯一的区分。

As you can see, the Apps icon doesn't have any ```text```, but it does have a ```content-desc```. Make a note of its value, because you will be using it in the next step.

从上图可以看到Apps图标没有```text```字段，但有```content-desc```。记下它的值，后面将用到这个值。

Pick your Android device up and touch the Apps icon to navigate to the screen that shows the apps installed on the device. Head back to **UI Automater Viewe** and capture another screenshot. Since you will be writing a test for the Calculator app, click its icon to look at its details.

拿起Android设备，触摸Apps图标，进入设备安装的所有应用界面。使用 **UI Automater Viewe** 获取另外一张屏幕截图。因为要写一个计算器应用的测试，点击计算器图标查看详细界面。

![P6](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest6.jpg)

This time the ```content-desc``` is empty, but the ```text``` contains the value **Calculator**. Make a note of this as well.

这次```content-desc```是空的，但是```text```的值为**Calculator**，同样记住这个值。

If your Android device is running a different launcher or a different version of Android, the screens and the node details will be different. This also means that you will have to make some changes in your code to match the operating system.

如果你的Android设备运行不同的主界面或者不同的Android版本，界面和显示的细节会有所不同。这意味着后续代码中需要做一些修改，以匹配你的操作系统。

##4. Prepare the Test Environment
##4、准备测试环境

Return to Android Studio to add code to the ```setUp``` method. As its name suggests, the ```setUp``` method should be used to prepare your test environment. In other words, this is where you specify what needs to be done before running the actual test.

返回到Android Studio，给```setUp```方法中添加代码。如同其名字，```setUp```方法是用来准备测试环境的。换句话说，这个方法是在真正测试之前指定具体需要执行什么动作的。

You will now be writing code to simulate what you did on your Android device in the previous step:
现在需要写代码来模拟刚才在Android设备上执行的几个动作：

1.Press the home button to go to the home screen.
2.Press the Apps icon to view all apps.
3.Launch the Calculator app by tapping its icon.

1、按home键进入主界面
2、按Apps图标进入应用界面
3、点击计算器图标启动它

In your class, declare a field of type ```UiDevice``` and name it ```device```. This field represents your Android device and you will be using it to simulate user interaction.

在你的类中声明类型为```UiDevice```的变量```device```。它代表你的Android设备，后续使用它来模拟用户行为。
```Java
1  private UiDevice device;
```
In the ```setUp``` method, initialize ```device``` by invoking the ```UiDevice.getInstance method```, passing in a ```Instrumentation``` instance as shown below.

在```setUp```方法中，通过调用```UiDevice.getInstance method```来初始化```device```，传递```Instrumentation```实例，如下所示：
```Java
1  device = UiDevice.getInstance(getInstrumentation());
```
To simulate pressing the home button of the device, invoke the ```pressHome``` method.
模拟点击设备home键，需要调用```pressHome```方法。
```Java
1  device.pressHome();
```
Next, you need to simulate a click event on the Apps icon. You can't do this immediately though, because the Android device will need a moment to navigate to the home screen. Trying to click the Apps icon before it is visible on the screen will cause a runtime exception.

接下来，需要模拟点击Apps图标的动作。不能立即做这个动作，因为Android设备需要一个反应时间来加载界面。如果在屏幕显示出来之前执行这个动作就会引起运行时异常。

To wait for something to happen, you need to call the ```wait``` method on the ```UiDevice``` instance. To wait for the Apps icon to show up on the screen, use the ```Until.hasObject``` method.

等待一些事情发生时，需要调用```UiDevice```实例的```wait```方法。等待Apps图标显示到屏幕，使用```Until.hasObject```方法。

To identify the Apps icon, use the ```By.desc``` method and pass the value **Apps** to it. You also need to specify the maximum duration of the wait in milliseconds. Set it to **3000**. This results in the following code block:

识别Apps图标需要使用```By.desc```方法并传递值为**Apps**的参数。你还需要指定最长等待时间，单位为毫秒。此处设置为3000。
至此形成如下代码段：
```Java
1  // Wait for the Apps icon to show up on the screen
2  device.wait(Until.hasObject(By.desc("Apps")), 3000);
```
To get a reference to the Apps icon, use the ```findObject``` method. Once you have a reference to the Apps icon, invoke the ```click``` method to simulate a click.

要获取Apps图标的引用，需要使用```findObject```方法。一旦有了Apps图标的引用，就可以调用```click```方法来模拟点击动作了。
```Java
1  UiObject2 appsButton = device.findObject(By.desc("Apps"));
2  appsButton.click();
```
Like before, we need to wait a moment for the Calculator icon to show up on the screen. In the previous step, you saw that the Calculator icon can be uniquely identified by its ```text``` field. We invoke the ```By.text``` method to find the icon, passing in ```Calculator```.

和前面一样，我们需要等待一些时间，保证计算器图标显示到屏幕上。在之前的步骤中，我们看到可以通过```text```字段唯一的识别计算器图标。我们调用```By.text```方法来找到图标，传递参数为```Calculator```。
```Java
1  // Wait for the Calculator icon to show up on the screen
2  device.wait(Until.hasObject(By.text("Calculator")), 3000);
```
##5. Inspect the Calculator's User Interface
##5、检查计算器UI

Launch the Calculator app on your Android device and use **UI Automater Viewer** to inspect it. After capturing a screenshot, click the buttons to see how you can uniquely identify them.

在你的Android设备上启动计算器应用，使用 **UI Automater Viewer** 来查看显示。获取到一个截屏后，点击不同的按钮来观察使用何值可以唯一的区分它们。

For this test case, you will be making the calculator calculate the value of **9+9=** and check if it shows 18 as the result. This means that you need to know how to identify the buttons with the labels 9, +, and =.

在本次测试用例中，使用计算器计算 **9+9=** 的值并确认结果是否为 **18**。这意味着你需要知道怎么区分按键 **9**、**+** 和 **=**。

![P7](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest7.jpg)

On my device, here's what I gathered from the inspection:

The buttons containing the digits have matching ```text``` values.
The buttons containing the + and = symbols have the ```content-desc``` values set to plus and equals respectively.
The result is shown in an ```EditText``` widget.

在我的设备上，如下是我收集到的信息：
1. 数字按键匹配```text```值
2. **+** 和 **=** 使用```content-desc```值，分别对应 **plus** 和 **equals**
3. 返回值显示在```EditText```控件中

Note that these values might be different on your device if you are using a different version of the Calculator app.

如果你使用不同版本的计算器应用，请注意这些值有可能不一样。

##6. Create the Test
##6、创建测试类

In the previous steps, you already learned that you can use the ```findObject``` method along with either ```By.text``` or ```By.desc``` to get a reference to any object on the screen. You also know that you have to use the ```click```method to simulate a click on the object. The following code uses these methods to perform the calculation 9+9=. Add it to the ```testAdd``` method of the ```CalculatorTester``` class.

在前面几步操作中，你已经学会了使用```findObject```方法通过```By.text```或者```By.desc```来获取屏幕上不同对象的引用。还学会了通过```click```方法来模拟点击对象的动作。下面的代码使用这些方法来模拟 **9+9=**。添加这些到类```CalculatorTester```的方法```testAdd```中。
```Java
01  // Wait till the Calculator's buttons are on the screen        
02  device.wait(Until.hasObject(By.text("9")), 3000);              
03                                                                 
04  // Select the button for 9                                     
05  UiObject2 buttonNine = device.findObject(By.text("9"));        
06  buttonNine.click();                                            
07                                                                 
08  // Select the button for +                                     
09  UiObject2 buttonPlus = device.findObject(By.desc("plus"));     
10  buttonPlus.click();                                            
11                                                                 
12  // Press 9 again as we are calculating 9+9                     
13  buttonNine.click();                                            
14                                                                 
15  // Select the button for =                                     
16  UiObject2 buttonEquals = device.findObject(By.desc("equals")); 
17  buttonEquals.click();                                          
```
At this point, you have to wait for the result. However, you can't use ```Until.hasObject``` here because the ```EditText``` containing the result is already on the screen. Instead, you have to use the ```waitForIdle``` method to wait for the calculation to complete. Again, the maximum duration of the wait can be 3000 ms.

现在就等待运行结果。此处不能使用```Until.hasObject```，因为包含计算结果的```EditText```已经显示在屏幕上了。取而代之，我们使用```waitForIdle```方法来等待计算完成。同样，最长等待时间是3000毫秒。
```Java
1 device.waitForIdle(3000);
```
Get a reference to the ```EditText``` object using the ```findObject``` and ```By.clazz methods```. Once you have the reference, call the ```getText``` method to determine the result of the calculation.

使用```findObject```和```By.clazz methods```方法获取```EditText```对象的引用。一旦有了此引用，就可以调用```getText``` 方法来确定计算结果是否正确。
```Java
1  UiObject2 resultText = device.findObject(By.clazz("android.widget.EditText"));
2  String result = resultText.getText();
```
Finally, use ```assertTrue``` to verify that the result is equal to 18.
最后，使用```assertTrue```来检验范围值是否为**18**。
```Java
1  assertTrue(result.equals("18"));
```
Your test is now complete.
测试到此结束。

##6. Run the Test
##6、执行测试

To run the test, in the toolbar of Android Studio, select the class ```CalculatorTester``` from the drop-down and click the play button on its right.

执行测试，需要在Android Studio的工具栏中选择```CalculatorTester```，点击它右方的**play**按钮。

![P9](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest9.png)

Once the build finishes, the test should run and complete successfully. While the test runs, you should be able to see the UI automation running on your Android device.

一旦编译结束，测试就成功运行完整。当测试运行时，在你的Android设备上就会看到UI自动化运行界面。

![P10](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest10.png)

##Conclusion
##总结

In this tutorial, you have learned how to use the UI Automator testing framework and the UI Automater Viewer to create user interface tests. You also saw how easy it is to run the test using Android Studio. Even though we tested a rather simple app, you can apply the concepts you learned here to test almost any Android app.

在这篇教程中，我们学会了如何使用UI自动化测试模块和 **UI Automater Viewer** 来创建用户界面测试。你也看到了使用Android Studio执行测试是如此简单。虽然我们测试了一个相对简单的应用，但可以将从中学到的概念用到几乎所有Android应用的测试中。

You can learn more about the testing support library on the Android Developers website.

你可以在[Android 开发者网站中](http://developer.android.com/tools/testing-support-library/index.html) 学习更多关于测试支持库的知识。