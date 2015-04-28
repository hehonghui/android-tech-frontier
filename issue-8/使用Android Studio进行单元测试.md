使用Android Studio进行单元测试
---

> * 原文链接 : [Unit Testing With Android Studio](http://rexstjohn.com/unit-testing-with-android-studio/)
* 原文作者 : [Rex St John](http://rexstjohn.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [ZhaoKaiQiang](https://github.com/ZhaoKaiQiang) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  翻译完成 

This article covers the basics of using Android Unit Tests with Android Studio.
这篇文章介绍了在Android Studio中进行单元测试的基础部分。

#Enabling Unit Testing In Android Studio
#在Android Studio中可以进行单元测试

Many guides out there will encourage you to add some lines  in your “build.gradle” to enable “instrument tests” and also tell you to include the Android testing libraries in your dependencies…

很多的教程指导你应该在“build.gradle”文件里面添加几行代码从而允许单元测试，并且告诉你应该在项目依赖中添加Android测试库。

This is completely unnecessary and you won’t need to worry about doing that.

其实你并不需要按照这种错误的方式去做，因为这是完全没有必要的。

Android Studio supports Android Unit Tests natively and you can enable them by setting a few options in your project configuration.

Android Studio本身就支持Android单元测试，你只需要在你的项目中简单配置一下就可以了。

Note: There are several popular unit testing frameworks such as Robolectric for Android which involve more set up and configuration than what I cover here. I hope to write a guide on that topic in the future.

注意：还有好几种流行的Android单元测试框架，比如[Robolectric](http://robolectric.org/)，这些框架涉及到的配置和设置比我在这里提到的更多，我希望在未来可以以这个主题写一些指导教程。

#Creating Your Unit Testing Folder
#创建你的单元测试文件夹

I like to keep my unit tests in my main project package e.g. “com.mypath.tests.” You can put your own tests  wherever  you want. To get started, create a new directory “tests” in your desired test location like so:

我喜欢把单元测试放在我的主项目里面，比如“com.mypath.tests.” ，你可以把测试目录放到你想放的任何地方。在开始之前，像下面这样，先创建你的"test"文件夹。(译者注：这一步不是必须的，你也可以把单元测试类创建在与Android Studio默认的ApplicationTest类相同的路径下面)

![](http://i2.tietuku.com/8ea1f7ff89634a0f.png)

Next, create a new class and name it “ExampleTest.” Have it inherit from “InstrumentationTestCase:”

接下来，创建一个叫做 “ExampleTest”的类，要继承自InstrumentationTestCase

![](http://i2.tietuku.com/164d47e438f78f37.png)

Lets add a simple test which we know will fail:

然后可以添加一段简单的测试代码，我们知道这段代码肯定会运行失败

```
public class ExampleTest extends InstrumentationTestCase {
    public void test() throws Exception {
        final int expected = 1;
        final int reality = 5;
        assertEquals(expected, reality);
    }
}
```

All test methods MUST start with the “test-” prefix or Android Studio will not detect them as tests and you will get all kinds of weird errors and nothing will work.

注意：所有的测试方法必须以"test"开头，否则Android Studio不能找到要进行单元测试的方法，你将会得到各种各样的错误，并且无法正常执行。

#Configuring The Project For Unit Testing
#为你的项目配置单元测试
Now that we have a test case which is doomed for failure, we must now run it.
Start by clicking “Run -> Edit Configurations.”

现在我们已经有了一个必然会运行失败的测试案例，我们必须把它run起来。

首先点击"Run-> Edit Configurations"

![](http://i2.tietuku.com/e91b3515dff21267.png)

Now select “+ -> Android Tests” from the upper left hand corner and select “Android Tests” and name your new test configuration “test” or something equally relevant.

然后点击“+”，从左上角选择添加一个 Android Tests，然后你可以将这个测试配置重新命名为"test"或与之相关的名字

![](http://i2.tietuku.com/6f5c952065151e07.png)

This will create a new test project configuration like this:

然后就会创建一下像下面这样的测试项目配置

![](http://i2.tietuku.com/2183cac60bbed220.png)

Select your current app module from the drop down menu.

从下拉菜单中选择你当前的module

![](http://i2.tietuku.com/854bbdd0299ddb1c.png)

Next, select the “All in Package” option and navigate to your “test” folder you just created. You can also select “All in Module” and Android Studio will automatically find any test inside your whole Module! You can also get more specific and select “Class” or even “Method” option to narrow the scope of your testing down further.

接下来，选择"All in Package"选项，然后把你的刚才创建的测试文件夹选中。你也可以选择“All in Module”选项，这样Android Studio会自动的找到你整个Module中的所有测试单元，你也可以通过更具体的类或者是方法选项，进一步缩小测试范围。

The results should look like this:
做完这一切之后，看起来应该像下面这样

![](http://i2.tietuku.com/15039870f925e4e9.png)

I also like to set the run configuration to “Show Chooser” so I can decide how to run the tests when needed:

我也喜欢选中下面的“Show chooser dialog”,这样当每次运行的时候，我可以指定如何去运行

![](http://i2.tietuku.com/66d3e1d4a120df74.png)

Now click “Apply” and then “Close.” You should now see your test cases as being a runnable project configuration in the bar across the top of your Android Studio instance.

现在点击"Apply"然后关闭，你现在应该可以看到你的测试案例已经作为一个可以运行的项目配置在Android Studio上面的工具栏上了

![](http://i2.tietuku.com/6acd89afcb22309d.png)

#Running Our Unit Tests
#运行我们的单元测试
I use Genymotion for everything, so fire up your Genymotion instance and run the test.

我使用Genymotion来完成所有的事情，所以开启你的Genymotion然后运行test

Put a break point next to the assertion line in the test case we just created and click the “run debug mode.” The purpose is to prove to ourselves that Android Studio is really running our Unit Test case.

在assertion这一行添加一个断点，然后点击 “run debug mode”，目的是为了证明Android Studio确实执行了我们的单元测试。

![](http://i2.tietuku.com/e91aefd47fe27e05.png)

When you start your tests, you will now see a special testing display window “Running Tests…”

当你开始你的测试工程之后，你会看到一个叫做“Running Tests…”的显示窗口

![](http://i2.tietuku.com/2202b414f006234a.png)

When your test fails, click “Logcat” and view the results for a comprehensive output as to why your test failed:


当你的测试没有通过，点击“Logcat”然后查看综合的输出结果，看下我们测试失败的原因

![](http://i2.tietuku.com/82cf59170999b096.png)

If you go through the console, you will find the given reason should be: “junit.framework.AssertionFailedError: expected:<1> but was:<5>”

通过控制台，你会发现给出的错误理由应该是

```
“junit.framework.AssertionFailedError: expected:<1> but was:<5>”
```
Congratulations, you have failed!

恭喜你，你已经成功测试出错误啦~

The following sources were helpful in compiling this article:

下面的这些资料在完成本文时，给了很大的帮助

- http://mobilengineering.blogspot.com/2012/05/tdd-testing-asynctasks-on-android.html
- http://www.vogella.com/tutorials/AndroidTesting/article.html
- http://nikolaj.hesselholtskov.dk/2013/10/how-to-add-unit-tests-to-android-studio.html