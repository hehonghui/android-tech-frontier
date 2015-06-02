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

## 守护进程,并行编译
The next step is to enable the Gradle daemon and parallel build for your project. Using the daemon will make your builds startup faster as it won't have to start up the entire Gradle application every time. Parallel builds will cause your projects with multiple modules (multi-project builds in Gradle) to be built in parallel, which should make large or modular projects build faster.

通过以上步骤,我们设置好了android studio使用最新的gradle版本,下一步就是正式开启优化之路了. 我们需要将gradle作为守护进程一直在后台运行,这样当我们需要编译的时候,gradle就会立即跑过来然后
吭哧吭哧的开始干活.除了设置gradle一直开启之外,当你的工作空间存在多个project的时候,还需要设置gradle对这些projects并行编译,而不是单线的依次进行编译操作.

These settings are enable by adding a file named gradle.properties under .gradle in your home directory (i.e., ~/.gradle/gradle.properties).
说了那么多, 那么怎么设置守护进程和并行编译呢?其实非常简单,gradle本身已经有了相关的配置选项,在你电脑的GRADLE_HOME这个环境变量所指的那个文件夹内,有一个.gradle/gradle.properties文件.
在这个文件里,放入下面两句话就OK了:
org.gradle.daemon=true
org.gradle.parallel=true

Note that the daemon is already be enabled from within Android Studio, but this setting will make sure that it is also enabled when building from the terminal.
有一个地方需要注意的是,android studio 本身在编译的时候,已经是使用守护进程中的gradle了,那么这里加上了org.gradle.daemon=true就是保证了你在使用命令行编译apk的时候也是使用的
守护进程.

You can also add this file to the root of your project, in which case it will be enabled automatically for everybody that builds the app, 
including you Continuous Integration environment (like Jenkins CI). For information on when you shouldn’t run Gradle with the daemon, see http://gradle.org/docs/current/userguide/gradle_daemon.html#when_should_i_not_use_the_gradle_daemon.
你也可以将上述的配置文件放到你project中的根目录下,以绝对确保在任何情况下,这个project都会使用守护进程进行编译.不过有些特殊的情况下也许你应该注意守护进程的使用,具体的细节参考http://gradle.org/docs/current/userguide/gradle_daemon.html#when_should_i_not_use_the_gradle_daemon

Important note about parallel builds: The parallel builds setting could prove unsafe for some projects. 
The requirement is that all your modules must be decoupled (see http://gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects) or your build could fail. Test all your build variants carefully so that you know that everything works as it should.
在使用并行编译的时候必须要注意的就是,你的各个project之间不要有依赖关系,否则的话,很可能因为你的Project A 依赖Project B, 而Project B还没有编译出来的时候,gradle就开始编译Project A 了.最终
导致编译失败.具体可以参考http://gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects

You can add additional Gradle parameters here, like increasing the max heap size in case you have a large project or specifying which JVM to use:
For other configuration options you can do in gradle.properties, see http://gradle.org/docs/current/userguide/userguide_single.html#sec:gradle_configuration_properties. 
还有一些额外的gradle设置也许会引起你的兴趣,例如你想增加堆内存的空间,或者指定使用哪个jvm虚拟机等等(代码如下)
org.gradle.jvmargs=-Xmx768m
org.gradle.java.home=/path/to/jvm

如果你想详细的了解gradle的配置,请猛戳http://gradle.org/docs/current/userguide/userguide_single.html#sec:gradle_configuration_properties

## 一个实验性的功能
The final change is incremental dexing, which is an experimental feature that is currently disabled by default.
Enabling this could cause your builds to fail (especially on consecutive runs), but I do recommend you to try it out and see if it works for you.

最后一个要介绍的是incremental dexing, 这个功能目前还在试验阶段,android studio默认是关闭的, 作者个人是非常推荐的,程序员就是爱折腾啊.
Add the following to the android section of your main app modules build.gradle to enable this:
开启incremental dexing也是非常简单的,就是在app级别的buid.gradle文件中加入下面的代码:
dexOptions {
        incremental true
}
Hope this help. Leave a comment if you have any question or some other tips for improving the build performance.
感性您的阅读,希望这边文章可以对您有所帮助. 如果您有好的建议或者意见请联系我

