功能测试框架 espresso
---

>
* 原文链接 : [the-hitchhikers-guide-to-android-testing-part-2-espresso](http://wiebe-elsinga.com/blog/the-hitchhikers-guide-to-android-testing-part-2-espresso/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [kang](https://github.com/tiiime)
* 状态 :  校对完成

![VtFd68Pr19fYk.](http://7xi8kj.com1.z0.glb.clouddn.com/VtFd68Pr19fYk.gif)

正如[Ali Derbane](https://plus.google.com/+AliDerbane)和我写的第一篇关于Android的功能测试的文章中提到的，有许多的框架供你使用.
在这个旅程的第二部分,我将讲解[Espresso](https://code.google.com/p/android-test-kit/)这个功能测试框架.


### 简介

Espresso 是在2013年的 GTAC 上首次提出，目的是让开发人员能够快速地写出简洁，美观，可靠的 Android UI 测试。

Espresso有以下几个通用组件:

- “Espresso”类提供的“onView”和“onData”方法,仅可用于特定接口上测试最优数.
- `ViewMatchers` 包含一个实现了`Matcher <? super View>`接口的对象集合. 使用该类你可以收集或是检查View元素.例如,通过文本 “7” 获取一个View元素(Button).
- `ViewActions` 包含了一组`viewAction`对象，储存了将要在View上执行的动作. 这些动作被传递给`ViewInteraction.perform`方法,也许包含更多的动作. For 例如, 点击一下View元素(Button).
- `ViewAssertions` 包含`ViewAssertion`集合，用于对Views进行检查.

举个例子说明一下，这些测试组件看起来就像下面这样:

```java
Espresso.onView(ViewMatchers.withText("7")).perform(ViewActions.click());
Espresso.onView(withId(R.id.result)).check(ViewAssertions.matches(ViewMatchers.withText("42")));
 ```

好消息，去年谷歌推出了集成Espresso的[Testing Support Library](https://developer.android.com/tools/support-library/index.html).因此，让我们通过实现Espresso开始吧.

>  为了方便解释, 我们要编写一些测试用例来测试[Android calculator application](https://github.com/welsinga/sample_espresso/app)这个App. 先来实现一个测试“6”x“7”等于“42”是否正确的普通测试场景。



### 定义test runner

 使用Espresso我们首先需要定义这些测试用例。Espresso使用新的名为AndroidJUnitRunner的测试用例。该测试用例基于“InstrumentationTestRunner”和“GoogleInstrumentationTestRunner”,运行JUnit3和JUnit4来测试你的Android应用程序。

首先将依赖项添加到你的`build.gradle`文件中, 这里假设你已经安装好了[Testing Support Library](https://developer.android.com/tools/support-library/index.html).

 ```gradle
 dependencies {
  androidTestCompile 'com.android.support.test:testing-support-lib:0.1'
}
```

然后添加测试用例到你的`build.gradleandroid.defaultConfig`配置中 

```gradle
defaultConfig {
  ...
  testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
}
```



### 编写测试

你可能已经想到了，测试类必须在`src\androidTest\com.example.package.tests`中.包com.example.package是在AndroidManifest文件中指定的属性.

每一个测试类还必须继承抽象类`ActivityInstrumentationTestCase2`并且使用默认测试的 Activity 作为泛型.

它还需要通过`super()`方法传递给父类.要使被测试的Activity被测试框架调用，只需要在setup方法中同步调用`getActivity()`方法.

```java
public class FunctionalInstrumentationTest extends ActivityInstrumentationTestCase2<ActivityToTest> {

    public FunctionalInstrumentationTest() {
        super(ActivityToTest.class);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        getActivity();
    }
}
```

正如前面提到的,我们想要检查“6”x“7”是否等于“42”.

```java
public void testAnswer_to_the_Ultimate_Question_of_Life_the_Universe_and_Everything() {
        onView(withText("7")).perform(click());
        onView(withText("×")).perform(click());
        onView(withText("6")).perform(click());
        onView(withText("=")).perform(click());

        onView(withId(R.id.resText)).check(matches(withText("42")));
    }
```

你可能已经注意到,这个示例是使用静态导入.这样做完全是为了使代码更易于阅读.

其他你可能会用到的操作:

- `pressBack()`; to simulate the use of the “back” button,
- `isDisplayed()`; to check if an element is being shown and
- `scrollTo()`; to scroll to an element.
- `pressBack()`; 模拟后退按钮
- `isDisplayed()`; jian检查某个元素是否显示
- `scrollTo()`; 滚动到另外一个元素


### 运行测试

现在我们做做有趣的,运行测试.这可以通过`gradle clean assembleDebug connectedAndroidTest`从命令行运行,或者使用Android Studio:

1. 打开Run菜单 | Edit Configurations
2. 添加一个新的Android Tests configuration
3. 选择你需要测试的Module
4. 定义我们的测试用例: `android.support.test.runner.AndroidJUnitRunner`

![10OjZwNlstPj9e](http://7xi8kj.com1.z0.glb.clouddn.com/10OjZwNlstPj9e.gif)

现在你对于Espresso有一些了解了。如果需要深入，可以浏览以下链接:

- [Espresso website](https://code.google.com/p/android-test-kit/)
- [Github repo corresponding to this article](https://github.com/welsinga/sample_espresso)
- [General Espresso Github samples by Google](https://github.com/googlesamples/android-testing)
