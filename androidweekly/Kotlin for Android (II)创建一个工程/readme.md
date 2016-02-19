Kotlin for Android (II)创建一个工程
---

>
* 原文链接 : [Kotlin for Android (II): Create a new project](http://antonioleiva.com/kotlin-android-create-project/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  校对中


当我从[what Kotlin is and what it can do for us](http://antonioleiva.com/kotlin-for-android-introduction/)获得一些启发之后,觉得是时候配置下 Android Studio来帮助我们使用Kotlin开发Android应用程序了. 其中有些步骤只需要在初次使用时完成一次, 但是其他一些Gradle配置需要为每一个新项目做一遍. ( 译者注 : 如果你对Kotlin还不了解，可以先看看[kotlin-for-android简介](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/androidweekly/kotlin-for-android%E7%AE%80%E4%BB%8B)这篇文章 )

对于本系列文章, 我将创建一个我早些时候创建的[Bandhook](https://play.google.com/store/apps/details?id=com.limecreativelabs.bandhook)的简化版本, 它基本上就是连接到一个基于RESTful的音乐API然后接收一些乐队的信息. 链接到 [Bandhook Kotlin on Github](https://github.com/antoniolg/Bandhook-Kotlin) 查看源代码.


###创建一个新项目然后下载Kotlin插件###

就像你平常做的那样，我们只需要用Android Studio创建一个带Activity的基本Android项目。

一旦完成,我们需要做的第一件事就是去下载Kotlin插件. 去到Android Studio的系统设置中然后查找plugins.之后，再次使用搜索找到Kotlin插件，安装并重启IDE。

![kotlin-plugin](http://7xi8kj.com1.z0.glb.clouddn.com/kotlin-plugin-e1424632570741.png)

###添加Kotlin插件的依赖到的应用程序的build.gradle中###

该项目的build.gradle需要添加一个新的依赖，这个依赖将会被Kotlin插件要求以在主Module中使用:
```gradle
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.1.3'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.0.0'
    }
}
```



###配置Module的build.grade###

首先, 应用Kotlin插件:
```gradle
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
```
接着, 添加Kotlin库到你的依赖:
```gradle
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'org.jetbrains.kotlin:kotlin-stdlib:1.0.0'
}
```
最后, 你需要添加我们在下一个步骤创建的Kotlin文件夹:
```gradle
android {
    compileSdkVersion 22
    buildToolsVersion "22.0.0"
 
    ...
 
    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }
}
```
或者,你可以跳过这一步,当做完下一个步骤时，使用这个Android Studio的操作:

![configure-kotlin-project](http://7xi8kj.com1.z0.glb.clouddn.com/configure-kotlin-project.png)

我更倾向于手动去做以保持我的Gradle文件有整洁有序, 但第二个选项可能较为容易些。



###创建Kotlin文件夹###

如果你将项目的视图从‘Android’转到‘Project’，那将会非常容易。依次选择‘app->src->main’ 然后创建一个名为 ‘kotlin'的文件夹:

![kotlin-folder](http://7xi8kj.com1.z0.glb.clouddn.com/kotlin-folder.png)



###将Java activity转换成Kotlin文件###

Kotlin插件能将Java转换为Kotlin类. 我们可以轻松的通过‘Code’菜单中的‘Convert Java File to Kotlin File'选项转换当前的Activity到Kotlin类 :

![convert-java-to-kotlin](http://7xi8kj.com1.z0.glb.clouddn.com/convert-java-to-kotlin-e1424633562637.png)

IDE将建议你移动新文件到Kotlin文件夹，点击‘Move File’(或者手动完成，假如你没看到这个选项).
```java
public class MainActivity : ActionBarActivity() {
 
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
 
 
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu)
        return true
    }
 
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        val id = item.getItemId()
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true
        }
 
        return super.onOptionsItemSelected(item)
    }
}
```



###主要区别###

看一看之前的代码, 我们可以看到一些明显的差异。 其中很大一部分我们将会在下一篇文章讲解到:

- 使用冒号，而不是'extends'。
- 显式使用‘override': 在Java中, 我们可以使用一个注释使我们的代码更清晰,但它不是必要条件. Kotlin将迫使我们使用它.
- 函数则使用‘fun’关键字: Kotlin是一个面向对象的函数式语言, 因此可能会与其他语言类似，例如Scala. Java方法被函数的形式表示。
- 函数参数命名规则不同: 类型和名称都写在相反的位置,并用冒号隔开。
- 分号可选: 我们不需要在行的结尾处加上分号。如果我们想要也可以加上, 但如果我们不这样做，它就可以节省大量的时间,并使我们的代码整洁。
- 其他小细节: 在简介一文中, 我已经说到了 ‘?’ 的意义. 这表明参数可以为空。NULL的处理方式不同于Java。 



###总结###

也许我们会认为使用一门新语言将会非常困难, Kotlin被JetBrains团队开发出来的，要成为最容易和可交互的语言用来覆盖那些Java的不足之处。由于Android Studio也是基于JetBrains的产品，这将让集成到这个IDE中并且开始工作非常简单。

下一篇文章将介绍一些让我们在使用Kotlin开发Android应用程序时，能让开发过程更简单的奇巧淫技。
