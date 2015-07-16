#Android UI 自动化测试

* 原文链接 : [Automating User Interface Testing on Android](http://code.tutsplus.com/tutorials/automating-user-interface-testing-on-android--cms-23969)
* 原文作者 : [Ashraff Hathibelagal](http://tutsplus.com/authors/ashraff-hathibelagal)
* 译文出自 : [tuts+](http://code.tutsplus.com/)
* 译者 : [Doris](https://github.com/DorisMinmin)
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成

##介绍
Android测试支持库包含**UI自动化模块**，它可以对Android应用进行自动黑盒测试。在API Level 18中引入了自动化模块，它允许开发者在组成应用UI的控件上模仿用户行为。

在这个教程中，我将展示如何使用此模块来创建和执行一个基本的UI测试，选择默认的计算器模块进行测试。

##先决条件
在使用前，需要具备以下条件：

  1. 最新版本的[Android Studio](https://developer.android.com/sdk/index.html)
  2. 运行Android 4.3或者更高版本的设备或者虚拟器
  3. 理解[JUnit](http://junit.org/)

##1. 安装依赖库

工程中使用UI自动化模块，需要编辑你的工程下*app*目录下的文件*build.gradle*，添加如下信任：

```xml
  androidTestCompile 'com.android.support.test:runner:0.2'                       
  androidTestCompile 'com.android.support.test:rules:0.2'                        
  androidTestCompile 'com.android.support.test.uiautomator:uiautomator-v18:2.1.0'
```
现在屏幕上应该有*Sync Now*按钮了，但点击它时，会看到如下错误信息：

![p1](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest1.png)

点击 **Install Repository and sync project** 链接来安装 **Android Support Repository**。

如果使用的是库**appcompat-v7** 且其版本号是**22.1.1**，你需要添加如下依赖以确保应用本身和测试应用都使用相同版本的```com.android.support:support-annotations```:

```xml
   androidTestCompile 'com.android.support:support-annotations:22.1.1'
```
接下来，由于Android Studio自身的一个bug，你需要通过 ```packagingOptions``` 执行一个名为 **LICENSE.txt** 的文件。这个执行失败的话，在运行测试时将引起如下错误：

```
   Execution failed for task ':app:packageDebugAndroidTest'.                                                                                   
   Duplicate files copied in APK LICENSE.txt                                                                                                   
                                                                                                                                               
   File 1: ~/.gradle/caches/modules-2/files-2.1/org.hamcrest/hamcrest-core/1.1/860340562250678d1a344907ac75754e259cdb14/hamcrest-core-1.1.jar  
   File 2: ~/.gradle/caches/modules-2/files-2.1/junit/junit-dep/4.10/64417b3bafdecd366afa514bd5beeae6c1f85ece/junit-dep-4.10.jar               
```
在你的**build.gradle**文件底部增加如下代码段：

```Java
   android {                                       
       packagingOptions {                          
           exclude 'LICENSE.txt'                   
       }                                           
   }                                               
```

##2、创建测试类

创建一个新的测试类，```CalculatorTester```，通过在 **androidTest** 目录下创建名为 **CalculatorTester.java** 的文件实现。创建的UI自动化测试用例，必须继承自```InstrumentationTestCase```。

![P2](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest2.png)

按 **Alt+Insert**后选择 **SetUp Method** 来重写```setUp```方法。

![P3](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest3.png)

再次按 **Alt+Insert** 后选择 **Test Method** 来生成新的测试方法，命名为```testAdd```。到此```CalculatorTester```类定义如下：

```Java
  public class CalculatorTester extends InstrumentationTestCase{
                                                                
      @Override                                                 
      public void setUp() throws Exception {                    
                                                                
      }                                                         
                                                                
      public void testAdd() throws Exception {                  
                                                                
      }                                                         
  }                                                                    
```

##3、查看Launcher UI

连接你的Android设备到电脑商，点击home按键，进入主界面。

返回到你的电脑，使用文件管理或者终端浏览你安装Android SDK的目录，进入到 **tools** 目录下，点击 **uiautomatorviewer** 。这个会启动 **UI Automater Viewer** ，你将看到如下界面：

![P4](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest4.png)

点击上方手机图标来获取Android设备截屏。注意到此时获取到的截屏是可交互的。点击下面的Apps图标。在右方的 **Node Detail** 区域，你就可以看到根据选择图标的不同显示不同的详细信息，如下图所示：

![P5](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest5.jpg)

与屏幕上的应用交互，UI自动化测试需要能唯一识别它们。在这个教程中，可以使用应用的```text```、```content-desc```或者```class```字段来唯一的区分。

从上图可以看到Apps图标没有```text```字段，但有```content-desc```。记下它的值，后面将用到这个值。

拿起Android设备，触摸Apps图标，进入设备安装的所有应用界面。使用 **UI Automater Viewe** 获取另外一张屏幕截图。因为要写一个计算器应用的测试，点击计算器图标查看详细界面。

![P6](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest6.jpg)

这次```content-desc```是空的，但是```text```的值为**Calculator**，同样记住这个值。

如果你的Android设备运行不同的主界面或者不同的Android版本，界面和显示的细节会有所不同。这意味着后续代码中需要做一些修改，以匹配你的操作系统。

##4、准备测试环境

返回到Android Studio，给```setUp```方法中添加代码。如同其名字，```setUp```方法是用来准备测试环境的。换句话说，这个方法是在真正测试之前指定具体需要执行什么动作的。

现在需要写代码来模拟刚才在Android设备上执行的几个动作：
1、按home键进入主界面
2、按Apps图标进入应用界面
3、点击计算器图标启动它

在你的类中声明类型为```UiDevice```的变量```device```。它代表你的Android设备，后续使用它来模拟用户行为。

```Java
  private UiDevice device;
```

在```setUp```方法中，通过调用```UiDevice.getInstance method```来初始化```device```，传递```Instrumentation```实例，如下所示：

```Java
  device = UiDevice.getInstance(getInstrumentation());
```

模拟点击设备home键，需要调用```pressHome```方法。

```Java
  device.pressHome();
```

接下来，需要模拟点击Apps图标的动作。不能立即做这个动作，因为Android设备需要一个反应时间来加载界面。如果在屏幕显示出来之前执行这个动作就会引起运行时异常。

等待一些事情发生时，需要调用```UiDevice```实例的```wait```方法。等待Apps图标显示到屏幕，使用```Until.hasObject```方法。

识别Apps图标需要使用```By.desc```方法并传递值为**Apps**的参数。你还需要指定最长等待时间，单位为毫秒。此处设置为3000。
至此形成如下代码段：

```Java
  // Wait for the Apps icon to show up on the screen
  device.wait(Until.hasObject(By.desc("Apps")), 3000);
```

要获取Apps图标的引用，需要使用```findObject```方法。一旦有了Apps图标的引用，就可以调用```click```方法来模拟点击动作了。

```Java
  UiObject2 appsButton = device.findObject(By.desc("Apps"));
  appsButton.click();
```

和前面一样，我们需要等待一些时间，保证计算器图标显示到屏幕上。在之前的步骤中，我们看到可以通过```text```字段唯一的识别计算器图标。我们调用```By.text```方法来找到图标，传递参数为```Calculator```。

```Java
  // Wait for the Calculator icon to show up on the screen
  device.wait(Until.hasObject(By.text("Calculator")), 3000);
```

##5、检查计算器UI

在你的Android设备上启动计算器应用，使用 **UI Automater Viewer** 来查看显示。获取到一个截屏后，点击不同的按钮来观察使用何值可以唯一的区分它们。

在本次测试用例中，使用计算器计算 **9+9=** 的值并确认结果是否为 **18**。这意味着你需要知道怎么区分按键 **9**、**+** 和 **=**。

![P7](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest7.jpg)

在我的设备上，如下是我收集到的信息：

1. 数字按键匹配```text```值
2. **+** 和 **=** 使用```content-desc```值，分别对应 **plus** 和 **equals**
3. 返回值显示在```EditText```控件中

如果你使用不同版本的计算器应用，请注意这些值有可能不一样。

##6、创建测试类

在前面几步操作中，你已经学会了使用```findObject```方法通过```By.text```或者```By.desc```来获取屏幕上不同对象的引用。还学会了通过```click```方法来模拟点击对象的动作。下面的代码使用这些方法来模拟 **9+9=**。添加这些到类```CalculatorTester```的方法```testAdd```中。

```Java
  // Wait till the Calculator's buttons are on the screen        
  device.wait(Until.hasObject(By.text("9")), 3000);              
                                                                 
  // Select the button for 9                                     
  UiObject2 buttonNine = device.findObject(By.text("9"));        
  buttonNine.click();                                            
                                                                 
  // Select the button for +                                     
  UiObject2 buttonPlus = device.findObject(By.desc("plus"));     
  buttonPlus.click();                                            
                                                                 
  // Press 9 again as we are calculating 9+9                     
  buttonNine.click();                                            
                                                                 
  // Select the button for =                                     
  UiObject2 buttonEquals = device.findObject(By.desc("equals")); 
  buttonEquals.click();                                          
```

现在就等待运行结果。此处不能使用```Until.hasObject```，因为包含计算结果的```EditText```已经显示在屏幕上了。取而代之，我们使用```waitForIdle```方法来等待计算完成。同样，最长等待时间是3000毫秒。
```Java
device.waitForIdle(3000);
```
使用```findObject```和```By.clazz methods```方法获取```EditText```对象的引用。一旦有了此引用，就可以调用```getText``` 方法来确定计算结果是否正确。

```Java
  UiObject2 resultText = device.findObject(By.clazz("android.widget.EditText"));
  String result = resultText.getText();
```
最后，使用```assertTrue```来检验范围值是否为**18**。

```Java
  assertTrue(result.equals("18"));
```
测试到此结束。

##6、执行测试

执行测试，需要在Android Studio的工具栏中选择```CalculatorTester```，点击它右方的**play**按钮。

![P9](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest9.png)

一旦编译结束，测试就成功运行完整。当测试运行时，在你的Android设备上就会看到UI自动化运行界面。

![P10](http://7xk12r.com1.z0.glb.clouddn.com/Android_UI_autotest10.png)

##总结

在这篇教程中，我们学会了如何使用UI自动化测试模块和 **UI Automater Viewer** 来创建用户界面测试。你也看到了使用Android Studio执行测试是如此简单。虽然我们测试了一个相对简单的应用，但可以将从中学到的概念用到几乎所有Android应用的测试中。

你可以在[Android 开发者网站中](http://developer.android.com/tools/testing-support-library/index.html) 学习更多关于测试支持库的知识。