Gradle小知识#4：把单元测试的日志打印到控制台
---

> * 原文链接 : [Gradle tip #4: Log unit test execution events into console](http://trickyandroid.com/gradle-tip-4-log-unit-test-execution-events-into-console/)
* 原文作者 : [Tricky Android](http://trickyandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

Today's tip will be really short (but hopefully useful).

I personally run Android unit tests manually from command line really often (`./gradlew test`) - just a habit I believe. However, by default, gradle just silently runs unit test suite w/o communicating progress. Essentially it just fails if some of the unit tests fails:  

今天的只是比较少，但希望会有用。  

我个人经常使用命令行手动的进行Android的单元测试(`./gradlew test`),个人习惯而已。但是，默认情况下Gradle只是安静的运行着单元测试的各个步骤。当某个单元测试失败了测试任务也就失败了：  

~~~gradle
:app:processDebugJavaRes UP-TO-DATE
:app:processDebugUnitTestJavaRes UP-TO-DATE
:app:compileDebugUnitTestSources
:app:mockableAndroidJar UP-TO-DATE
:app:assembleDebugUnitTest
:app:testDebugUnitTest

BUILD SUCCESSFUL
Total time: 4.725 secs
~~~

What I found useful for myself - is to make gradle indicate what test is being executed. Something like this:

我觉得如果让Gradle告诉我们什么测试正在运行，那一定很有用。向下面这样：  

~~~gradle
:app:testDebugUnitTest
com.trickyandroid.testproj.ExampleUnitTest > exampleTest1 PASSED
com.trickyandroid.testproj.ExampleUnitTest > exampleTest2 PASSED
com.trickyandroid.testproj.ExampleUnitTest > exampleTest3 PASSED

BUILD SUCCESSFUL
Total time: 4.107 secs
~~~

What you need to do - is just add the following to your `build.gradle` script (top level, not under `android` closure):  

你只需要把下面的这段脚本添加到你的`build.gradle`的顶级位置，而不是`android`闭包里：

~~~gradle
tasks.matching {it instanceof Test}.all {
    testLogging.events = ["failed", "passed", "skipped"]
}
~~~ 

What it does - is configures all JUnit (or TestNG) test tasks to write message to console whenever "test failed" / "test passed" / "test skipped" events occur.  

它的作用是：配置所有的单元测试的任务打印信息到控制台，不管是测试失败/测试通过/跳过测试都会打印响应的信息。  

More about test tasks configuration you can read in [official Gradle documentation](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html)。  

更多关于测试任务的配置请参见[官网](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html) 

