自动化截图－应用分发时的自动截图方案
---

>
* 原文链接 : [Screenshots Through Automation](http://flavienlaurent.com/blog/2014/12/05/screenshot_automation/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  




One important thing when an app is released on the Play Store is to have up-to-date, beautiful and clean screenshots. In an app containing lots of screens, it can be painful to manually take screenshots for each release. This article describes an approach at pushing automation into the screenshot process in order to more easily achieve this.


Just arrived at Capitaine Train, I was asked to find a way to automatically take screenshots because we had a lot of them: 3 form factors, 4 languages, 6 screenshots = 72 screenshots. This article explains the solution we used to achieve this. 3 important parts are necessary to take screenshots like a robot: uiautomator, accessibility and bash scripting.


Hands on uiautomator

uiautomator is a framework used to manipulate the UI from some code encapsulated into a JUnit test case. One important thing to know is that those test cases are executed in a side process: they are not contained inside the tested app. You can see the uiautomator framework as an independent robot which is able to do some actions on a device like touch, scroll, take a screenshot etc.

## 修改 uiautomator ##


**The basics**

Before continuing, the official documentation is a good starting point. I highly encourage you to take some times to read it.

**预备知识**


The API is very simple. There are 3 classes that represents 3 types of UI element:

UiObject: a basic UI element such as TextView
UiCollection: a UI element that contains several UiObject such as LinearLayout
UiScrollable: a UI element that contains several UiObject and that can be scrolled such as ListView


- UiObject: 基本界面元素，例如：TextView

- UiCollection: 包含多个 UiObject 的界面元素，例如：LinearLayout


![](http://flavienlaurent.com/media/2014-12-05-screenshot_automation/uml.png)

There are 2 other classes you must know:

UiDevice to perform device-level actions like pressing the back button, taking a screenshot etc

UiSelector to request UI elements on a screen by id, type etc

框架里这两个类你也需要了解：

- UiDevice：用于执行设备常见的动作，例如：点击按钮，截图等等

- UiSelector：通过 id, 类型等获得屏幕上的 UI 界面元素

Finally, the most important class is UiAutomatorTestCase which is the class to extend from in order to create an uiautomator test case.

最后，UiAutomatorTestCase 是框架里你绝对不能忽略的类，因为我们必须通过继承它来获得一个 uiautomator 测试用例。

You can check out some examples to be more familiar with uiautomator on the official documentation.


Setup, build and run

The next step to use uiautomator is to build it but at this time, there is no official Gradle integration of uiautomator module so you have to deal with it on your own. The final output of uiautomator test cases is single JAR so here is a simple setup.

**安装，创建和运行**


Create a new java Gradle module in your existing project and use the same android.jar dependency as in the entire project using local.properties


.build.gradle

```java
	apply plugin: 'java'
	
	Properties props = new Properties()
	props.load(new FileInputStream(file("../local.properties")))
	
	dependencies {
	    compile fileTree(dir: props['sdk.dir'] + '/platforms/' + androidSdkTarget, include: '*.jar')
	}
```

Create a new ant build file using local.properties and gradle.properties to have the same configuration (target, sdk path) as the whole project

通过使用 local.properties 和 gradle.properties 新建一个 ant 文件，使其获得与项目相同的配置信息：

build.xml

```xml
	<?xml version="1.0" encoding="UTF-8"?>
	<project name="uiautomator" default="help">
	    <loadproperties srcFile="../local.properties" />
	    <loadproperties srcFile="gradle.properties" />
	    <property name="target" value="${androidSdkTarget}" />
	    <import file="${sdk.dir}/tools/ant/uibuild.xml" />
	</project>
```

Build the JAR using ant (don’t use Gradle), push it on the device and run your test case

创建使用了新建的 ant 文件的 JAR（别使用 Gradle ），并把它加到你的设备中，然后运行你的测试用例

```java
$ ant build
$ adb push uiautomator.jar data/local/tmp
$ adb shell uiautomator runtest uiautomator.jar -c com.your.TestCase
```

Walking through the Settings app

Now, I’m going to explain how to navigate and change items (in particular, switching from one language to another) in the Settings. First, it’s a good way to practice uiautomator. Secondly, it’s one of the keys to automate things. Keep in mind that it’s one way to do it but it’s not the only one and it works on a real device in English(US) with Lollipop 5.0.0



- Open quick settings

- 打开快捷设置

```java
	mUiDevice.openQuickSettings();
```

- Click the settings button to open Settings apps

- 点击设置按钮以打开设置界面

```java
	new UiObject(new UiSelector().resourceId("com.android.systemui:id/settings_button")).click();
```

- As there is not any usable view ids in the Settings app, we have to find and click the language item by text. Hence, we scroll to the item (a FrameLayout) and click on it.


![](http://flavienlaurent.com/media/2014-12-05-screenshot_automation/settings_app.png)

```java
	UiScrollable scrollable = new UiScrollable(new UiSelector().resourceId("com.android.settings:id/dashboard"));
	
	scrollable.getChildByText(new UiSelector().className(FrameLayout.class), "Language & input", true).click();
```

- The exact same “find and click” principle is used on the “Language” item (a LinearLayout) contained in a ListView

![](http://flavienlaurent.com/media/2014-12-05-screenshot_automation/settings_language.png)

```java
	UiScrollable scrollable = new UiScrollable(new UiSelector().className(ListView.class));
	scrollable.getChildByText(new UiSelector().className(LinearLayout.class), "Language", true).click();
```

- Finally, the target language is chosen


![](http://flavienlaurent.com/media/2014-12-05-screenshot_automation/settings_language_selection.png)

```java
	UiScrollable scrollable = new UiScrollable(new UiSelector().className(ListView.class));
	scrollable.getChildByText(new UiSelector().className(LinearLayout.class), "Français (France)", true).click();
	Locale.setDefault(new Locale("fr"));
```
You need to force the new locale to avoid the uiautomator process to keep a cache of some translations.


**A few tips**

- DEACTIVATE ALL ANIMATIONS on the device when you’re using uiautomator to ensure stability (you can do it via Settings > Developer options > Window animation|Transition animation|Animator duration scale)

**小提示**


- Use android.util.Log if you want to log stuff; they appear in logcat so use a specific tag for filtering


- Use uiautomatorviewer every time to dig into the view hierarchy. It will help you to build more accurate selector to target UI elements (the uiautomatorviewer is located in sdk/tools/uiautomatorviewer)


- Remember uiautomator test cases are not Android test cases so you have not any Context to play with

- 记住，uiautomator 测试用例不是 Android 的测试用例，所以你不需要使用任何形式的 Context。

- Note that you can’t access to your app classes, you can only reference the Android framework classes

- 你不能通过 uiautomator 进入你的 App 类，你只能引用 Android 框架中的类。

- You can pass parameter from the uiautomator command line to the test case class using -e key value in command line and UiAutomatorTestCase.html#getParams() in the test case classe.

- 你可以在命令行中使用 -e 命令把 uiautomator 命令行的参数传递到测试用例类中，又或者是使用测试用例类中的 UiAutomatorTestCase.html#getParams()

Switch from one language to another in the same test case without any manual human interaction is simple, isn’t it !? uiautomator is a great tool but it doesn’t help much if your app is not accessible enough. Sometimes, it is required to create completely custom views and problems may arise.


Making a custom view accessible

Accessibility is an important feature for an app for two main reasons. First, some people requires it (too many developers unfortunately forget it). Secondly, all of the uiautomator tooling is based on accessibility.

## 让自定义 View 可访问 ##

When developing on Android, you most of the time have nothing in particular to make your app accessible. Indeed, standard framework components like TextView, ListView, etc. already deal with accessibility. However, there are some certain cases where you have to do a little more work. This is mainly when using custom views.


In the Capitaine Train app, we built a custom view when designing the calendar. It is based on a ListView filled with several custom views each of them representing a month (MonthView). A MonthView is a pure View i.e. it directly extends from View and have no children. As a consequence, everything (days, selector, etc.) is drawn manually in the onDraw(Canvas) method. Because of it, MonthView is not accessible at all by default and so is the whole calendar.


The first thing to do is really simple. It consists of setting a content description for each month using the View#setContentDescription method. It will help us scroll the ListView to a particular month.

首先要做的事情很简单：使用 View#setContentDescription 方法为每一个 MonthView 设置内容描述，这样我们能够把 ListView 滚动到一个特殊的月份上。

Then, once the ListView is positioned on a given month, we want to be able to touch a precise day. In order to do that, we need to make the MonthView content accessible. The Android support library offers a useful helper in that matter: ExploreByTouchHelper. As a MonthView is not a tree of views, the technique involves creating a fake logical tree of views based on touch responsiveness.

然后，一旦 ListView 停留在某一个给定的月份上，我们希望我们能够选择一个确定的日期。为了实现这个需求，我们需要使 MonthView 的内容是可访问的。幸运的是，Android 的支持库在类似的处理上提供了一个很有用的 Helper类：ExploreByTouchHelper。由于 MonthView 不是以树形结构结合展示其中的 View 集合，所以创建伪树状结构的 View 集合需要基于触摸反馈实现。

Implement ExploreByTouchHelper for your custom view

**为自定义 View 实现 ExploreByTouchHelper**

There are 4 methods to implement:

我们有四个方法可以实现：

- getVirtualViewAt(float x, float y)

Return the virtual view id at this x and y or ExploreByTouchHelper.INVALID_ID if there is no virtual view

返回参数 x,y处虚拟 View 的 id。如果对应位置上没有虚拟 View，则返回 ExploreByTouchHelper.INVALID_ID

- getVisibleVirtualViews(List<Integer> virtualViewIds)

Fill the virtualViewIds with all virtual view ids in the custom view

将自定义 View 中所有虚拟 View 的 id 添加到 virtualViewIds 数组中。

- onPopulateEventForVirtualView(int virtualViewId, AccessibilityEvent event)

Fill the accessibility even with virtual view information such as text or content description

让虚拟 View 的相关信息可以被访问，例如：文字，内容描述

- onPopulateNodeForVirtualView(int virtualViewId, AccessibilityNodeInfo node)

Fill the accessibility node with the virtual view id informations such as text, content description, class name, bounds in parent. If there are possible interactions with this virtual view, you have to specify it on the accessibility node.

让给定结点能够访问虚拟 View 的相关信息，例如文字，内容描述，类名，与父类的关系。如果两者之间产生了交互，你必须在给定结点中说明。

- onPerformActionForVirtualView(int virtualViewId, int action, Bundle arguments)

Perform an action (specified in the previous method) on virtual view

在虚拟 View 中实现某种动作（在前面的方法中被指定）

How to make ExploreByTouchHelper implementation easier:

怎么让 ExploreByTouchHelper 的接口变得更简单：

- create a VirtualView class to maintain virtual view informations such as id, text, content description, bounds in parent.

- use a list of VirtualView in your custom view. Initialize it as soon as possible and update virtual views on drawing pass

创建一个 VirtualView 类去持有虚拟 View 的各种信息，例如：id，文字，内容描述，与父类的关系。

在你的自定义 View 中使用一系列的 VirtualView。尽快初始化它们，并在绘制后更新它们

YourAccessibilityTouchHelper.java

```java
	private class YourAccessibilityTouchHelper extends ExploreByTouchHelper {
	
	    public YourAccessibilityTouchHelper(View forView) {
	        super(forView);
	    }
	
	    @Override
	    protected int getVirtualViewAt(float x, float y) {
	        final VirtualView vw = findVirtualViewByPosition(x, y);
	        if (vw == null) {
	            return ExploreByTouchHelper.INVALID_ID;
	        }
	        return vw.id;
	    }
	
	    @Override
	    protected void getVisibleVirtualViews(List<Integer> virtualViewIds) {
	        for (int i = 0; i < mVirtualViews.size(); i++) {
	            mVirtualViews.add(mVirtualViews.get(i).id);
	        }
	    }
	
	    @Override
	    protected void onPopulateEventForVirtualView(int virtualViewId, AccessibilityEvent event) {
	        final VirtualDayView vw = findVirtualViewById(virtualViewId);
	        if (vw == null) {
	            return;
	        }
	        event.getText().add(vw.description);
	    }
	
	    @Override
	    protected void onPopulateNodeForVirtualView(int virtualViewId, AccessibilityNodeInfoCompat node) {
	        final VirtualDayView vw = findVirtualViewById(virtualViewId);
	        if (vw == null) {
	            return;
	        }
	
	        node.setText(Integer.toString(vw.text));
	        node.setContentDescription(vw.description);
	        node.setClassName(vw.className);
	        node.setBoundsInParent(vw.boundsInParent);
	    }
	}
```

Use the helper in your custom view

**在你的自定义 View 中使用 Helper 类**

implement dispatchHoverEvent(MotionEvent event) to activate touch exploration
we need setAccessibilityDelegate() method to re-set the delegate after each ListView.getView because of this (If your custom view is not used in a ListView just set the delegate in the constructor)

我们需要在 ListView.getView 方法被执行后通过 setAccessibilityDelegate() 方法重设代理，因为我们需要实现 dispatchHoverEvent() 方法来激活对触摸事件的探索。（如果你的自定义 View 没有在 ListView 中被使用的话，只需要在构造器中设置代理）。

YourCustomView.java

```java
	public class YourCustomView extends View {
	
	    private final YourAccessibilityTouchHelper mTouchHelper;
	
	  public YourCustomView(Context context, AttributeSet attrs, int defStyle) {
	      super(context, attrs, defStyle);
	      mTouchHelper = new YourAccessibilityTouchHelper(this);
	  }
	  
	  private void setAccessibilityDelegate() {
	      setAccessibilityDelegate(mTouchHelper);
	    }
	
	  [...]
	
	  public boolean dispatchHoverEvent(MotionEvent event) {
	      if (mTouchHelper.dispatchHoverEvent(event)) {
	          return true;
	      }
	      return super.dispatchHoverEvent(event);
	  }
```

Use uiautmatorviewer to check your implementation

**用 uiautmatorviewer 检查你的接口能否正常运行**

If everything is ok, when your take a screenshot using the uiautmatorviewer tool, you should see the fake hierarchy of views with all of the provided informations set in accessibility nodes.

如果一切都正常运行，在你用 uiautmatorviewer 截图后，你应该能在虚拟 View 图层看到在可访问结点中预设置的所有信息。

![](http://flavienlaurent.com/media/2014-12-05-screenshot_automation/accessibility_calendar_uiautomator.png)

On a side note, I just found a problem in Capitaine Train’s app while writing this blog post. The class name on each virtual view is com.capitainetrain.x because we forgot Proguard :)

另一方面，在我写这篇博文的时候我发现 Capitaine Train App里的一个问题：每一个虚拟 View 的类名都是 com.capitainetrain.x，因为我们忘了用 Proguard。

Now, all of the app is accessible and, as a direct consequence, uiautomator usable, let’s automatically take some beautiful screenshots like a boss.


Taking beautiful screenshots


The final part of this article explains how to push uiautomator to the next level to take polished screenshots of your app in multiple languages. It consists in 2 steps: first, use bash scripting to run your uiautomator screenshot test case as many times as you want and polish those screenshots using imagemagick.

这篇博文要讲解的最后一个问题就是怎么改进 uiautomator ，使得它能在多种语言中优雅地自动截图。实现这个功能需要两个步骤：第一，使用 bash 脚本运行 uiautomator 测试用例，并按照你需要的图片数量进行自动化截图，之后用 imagemagick 处理你获得的照片。

First thing to do is to build and push the uiautomator JAR, and then run the test case. As you know how to switch from one language to another inside a test case, you can pass 2 arguments to the test case: the current language to go through the Settings app and the new target language to switch on.

首先要做的就是创建 uiautomator JAR包，然后运行测试用例。因为你已经在前面的讲解中学习了怎么在测试用例中转换语言，所以你只需要传递两个参数到测试用例中：当前设置中使用的语言和你将要切换的语言。

screenshot.sh

```gradle
	# Build and push the uiautomator JAR
	ant build
	adb push bin/uiautomator.jar data/local/tmp
	
	adb shell uiautomator runtest uiautomator.jar
	  -e current_language ${currentLanguage}
	  -e new_language ${newLanguage}
	  -c com.your.TestCase
```

Let’s say we have a simple test case which switches language, opens an app and takes a screenshot.

接下来我们只要再创建一个能够切换语言，打开 App并截图的简单测试用例就可以啦：

TestCase.java

```java
	public class TestCase extends UiAutomatorTestCase {
	  [...]
	  @Override
	    protected void setUp() throws Exception {
	        super.setUp();
	        final Bundle params = getParams();
	        mCurrentLanguage = params.getString("current_language");
	        mNewLanguage = params.getString("new_language");
	    }
	
	    public void test() throws Exception {
	        switchLanguage(mCurrentLanguage, mNewLanguage);
	        openApp();
	        takeScreenshot("data/local/tmp/screenshots");
	    }
	}
```

- switchLanguage(String,String) can be easily implemented using the method I explained in the “Hands on uiautomator” part.

- switchLanguage(String,String)只需要使用我在"修改 uiautomator"中讲解的方法就能轻松地实现 

- openApp() is explained here

- openApp() 在 [这里](https://developer.android.com/tools/testing/testing_ui.html#sample)有详细的解释

- takeScreenshot() uses UiDevice#takeScreenshot. Just a small tip: if an app contains scrollable parts, we have to wait for a short period time (with UiAutomatorTestCase.sleep or SystemClock.sleep) until scrollbars disappear else they will be visible on your final screenshots.

Now screenshots are stored on the device, we only need to pull them.

- takeScreenshot() 使用了 UiDevice#takeScreenshot 方法。在这里只有一个小提示：如果一个 App 使用了可滚动的 View，在滚动条消失之前我们必须安静地等一会儿，不然的话我们会在最后的截图里看到它。


screenshot.sh

```
	mkdir screenshots
	adb pull data/local/tmp/screenshots screenshots
```

Run the test case on multiple languages. It starts from a given current language of the device because there is not a proper way to get it programmatically and then it runs the test case for each language.

在多语言环境中运行测试用例。它会从设备当前使用的语言开始运行，因为我找不到一个合适的方式去表示它，然后会在不同的语言环境下（我们需要截图的那些语言）运行测试用例。

screenshot.sh

```
	screenshot() {
	    currentLanguage=$1
	  newLanguage=$2
	  adb shell uiautomator runtest uiautomator.jar
	      -e current_language ${currentLanguage}
	      -e new_language ${newLanguage}
	      -c com.your.TestCase
	}

	screenshot $deviceLanguage fr
	screenshot fr en
	screenshot en de
```
The app can be uninstalled/installed for each uiautomator test case run to start the test in the same conditions (i.e. from scratch) every time.

App 每次卸载/安装后在相同的环境下运行测试用例都能正常地实现自动化截图的功能：

screenshot.sh

```
	screenshot() {
	    currentLanguage=$1
	  newLanguage=$2
	
	  # Uninstall/Install the app
	  adb uninstall com.your.app
	  adb install ../app/build/outputs/apk/yourapp-release.apk
	  
	  adb shell uiautomator runtest uiautomator.jar
	      -e current_language ${currentLanguage}
	      -e new_language ${newLanguage}
	      -c com.your.TestCase
	}
```

Finally, all things together.

最后把所有模块糅合在一起：

screenshot.sh

```
	screenshot() {
	  currentLanguage=$1
	  newLanguage=$2
	
	  # Uninstall/Install the app
	  adb uninstall com.your.app
	  adb install ../app/build/outputs/apk/yourapp-release.apk
	
	  # Run the test case
	  adb shell uiautomator runtest uiautomator.jar
	      -e current_language ${currentLanguage}
	      -e new_language ${newLanguage}
	      -c com.your.TestCase
	      
	  mkdir screenshots
	  adb pull data/local/tmp/screenshots screenshots
	}

	# Build and push the uiautomator JAR
	ant build
	adb push bin/uiautomator.jar data/local/tmp
	
	# Build the APK
	cd .. && ./gradlew assembleRelease && cd uiautomator
	
	# Screenshot everything
	screenshot $currentLanguage fr
	screenshot fr en
	screenshot en de
```

Screenshot polishing

**美化截图**

Good read: Creating professional looking screenshots

分享一篇好文：[Creating professional looking screenshots](http://cyrilmottier.com/2012/07/11/creating-professional-looking-screenshots/)

Your app screenshots must be as polished as possible because it’s the first thing the user look at on the Play Store. Most of the time, the user doesn’t read an app description but goes straight to your app’s screenshots. There is no need to say the best the screenshot experience is, the better. A great way to ensure this is to follow some simple rules:


- Always have a clean status bar

- Remove navigation bar

- Bundle several screen sizes: 5, 7, 9|10


- 移除导航栏

- 适配多种屏幕的尺寸

The 2 first points can be easily achieved with an amazing tool called: imagemagick. The official documentation is very large so we are going to focus on 2 features: composite and convert.


Clean the status bar with composite


composite is used to overlap one image over another. It’s perfect to put a clean status bar on top of a screenshot.

组合图是用来把一个图片覆盖到另一个上面的，这是获得简洁状态栏的完美办法。

```java
composite -quality 100 -compose atop clean_status_bar.png screenshot.png clean_screenshot.png
```


**通过转换裁剪导航栏**

convert is used to convert between image formats as well as crop an image. It’s perfect to remove the navigation bar on bottom of a screenshot.


```java
convert -quality 100 screenshot.png -gravity South -chop 0x144 clean_screenshot.png
```

144 is the size in px of the navigation bar on a Nexus 5.

## Conclusion ##

Since the introduction of this new automatic screenshot tooling at Capitaine Train, 20~30min were spend on taking screenshots while it was sometimes taking us half a day or almost a day before (i.e. nobody wanted to do that and screenshots were almost never updated). The save in time is clearly huge and significant and clearly worth the time spent at developing the tool. In addition to that, it is less error-prone and less painful.

**结论**


Some of the possible next steps are:

Use the Google Play Publishing API to easily upload the generated screenshots
Integrate this tool into Jenkins to take screenshots on each release build

接下来可能做的：

使用 Google Play 发布的 API 简化上传这些自动生成的截图的流程，并把这个工具整合到 Jenkins 里，让 App 每一次版本更新都能自动地获取最新的截图，并将其显示在应用商店中。




