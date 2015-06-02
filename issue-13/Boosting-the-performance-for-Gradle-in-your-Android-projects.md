优化android studio编译效率的方法
---

> * 原文链接 : [Boosting the performance for Gradle in your Android projects](https://medium.com/@erikhellman/boosting-the-performance-for-gradle-in-your-android-projects-6d5f9e4580b6)
* 原文作者 : [Erik Hellman](https://medium.com/@erikhellman)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [FTExplore](https://github.com/FTExplore) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

## 引言

Ever feel like all you do is waiting for the builds to complete in Android Studio all day? Me too.
Fortunately, there are a number of improvements you can do to speed things up. Some of these are still experimental and could be unsafe, but it is probably worth a try in case you’re suffering from long build times. I’ve seen project go down to 2.5 seconds when building after small code changes using the stuff I describe below. Hope it works for you as well.

如果你之前用eclipse开发过Android app的化,转到android studio的第一反应也许就是:"编译速度有点慢". 表现的最明显的一点就是,当我使用eclipse开发的时候,选中了auto building.这个时候
我更改了几个字符,eclipse会速度非常快的编译出一个新的apk. 而android studio使用gradle编译,每次编译,即便是更改的代码量很少,也会按照预先设置的task的顺序,依次走完编译的各项流程.所以
这点就让人很痛苦. 然而问题总还是要被解决的,作者曾经亲眼看到过使用android studio仅仅用了2.5秒就编译完毕(在代码更改很少的情况下). 现在把如何优化gradle编译速度的方法记录在此,希望可以
帮助到广大的同行们.

## 准备工作
Android uses Gradle for building. The default version of Gradle at the time of writing is 2.2. The latest version is 2.4 and has a huge performance boost over previous versions.
There are two ways to do this, either by manually editing your build script or by changing the configuration from within Android Studio.

gradle现在最新的版本是2.4, 相比较之前的版本, 在编译效率上面有了一个非常大的提高,为了确保你的android项目使用的是最新版的gradle版本,有两种方法可以使用,下面依次进行介绍

### 1、在build.gradle中进行设置
For manually editing the build script, add the following at the end of your root build.grade script.
在你的项目gradle文件内(不是app里面的gradle文件), 添加一个task, 代码如下:
task wrapper(type: Wrapper) {
    gradleVersion = '2.4'
}

Now open a terminal and run ./gradlew wrapper and it will download and setup Gradle version 2.4 for your local Gradle wrapper. 
This is the official way as described in the Gradle documentation (see http://gradle.org/docs/current/userguide/gradle_wrapper.html).

然后打开terminal, 输入./gradlew wrapper, 然后gradle就会自动去下载2.4版本,这也是官方推荐的手动设置gradle的方法(http://gradle.org/docs/current/userguide/gradle_wrapper.html)

### 2、使用android studio对gradle版本进行设置
For doing the change from within Android Studio, open the Project Structure Dialog (Shortcut i OS X: ⌘+;), select Project in the list to the left and change the Gradle version to 2.4. When you click Ok, Android Studio will automatically sync your Gradle settings and setup the new version for the wrapper.

这种方法需要你去手动去gradle官网下载一个zip包,解压缩后,打开android studio 设置界面的Project Structure. 然后手动添加你解压缩后的gradle的磁盘路径即可,可以参考如下的图片

Note that this works only when using the Gradle wrapper for your project (which is the default when generating projects with Android Studio). 
If this is not the case, refer to the Gradle documentation at http://gradle.org.
有一点需要注意的是,这种设置方法仅适用于在你的项目中使用gradle wrapper进行编译打包的操作(就是android studio默认需要的东东).如果你想使用gradle做其他的事情,请出门左转,去gradle官网(http://gradle.org)

## 开启gradle作为守护进程
The next step is to enable the Gradle daemon and parallel build for your project. Using the daemon will make your builds startup faster as it won't have to start up the entire Gradle application every time. Parallel builds will cause your projects with multiple modules (multi-project builds in Gradle) to be built in parallel, which should make large or modular projects build faster.




