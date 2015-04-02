#Stetho for Android debug builds only
# 在Android调试模式中使用Stetho
------

 - 原文链接:http://littlerobots.nl/blog/stetho-for-android-debug-builds-only/
 - 译者:BillionWang
 - 校对者
 - 状态:完成
 
Recently, Facebook released a tool called [Stetho][1], which let’s you inspect your Android app from the Chrome Developer tools. I find that particularly nifty because it also provides access to any SQLite databases used in the app. Obviously, this type of tools should only be included in debug builds of your app. Here’s a nice way to accomplish that.

最近FaceBook发布了一个叫做[Stetho][2]的工具.这个工具是一个谷歌浏览器的开发者工具扩展 ，它可以用来检测你的应用。我发现这东西挺好用的，因为它还提供了访问应用中SQLite数据库的接口。很明显，这种类型的工具只应该在应用的调试模式中使用。接下来我们来看看怎么用这个工具。

#Add the dependency
#添加依赖
To make sure Stetho is only used for debug builds, add a debugCompile dependency, in stead of the usual compile type you’d normally use:

为了保证只在调试模式中使用Stetho，你可以添加一个调试编译依赖，而不是平时常用的普通依赖类型。

    depencencies {
    // your other dependencies here...
    debugCompile 'com.facebook.stetho:stetho:1.0.0'
    }

#Initialize Stetho in your debug build
#在调试模式中初始化Stetho
Now we actually need to use Stetho in our debug build. How do you do that? By using the awesome powers of the Android Gradle build system! To add some source that will be only compiled for debug builds, create a new source folder named <font color="red">src/debug/java</font>. This is just like <font color="red">src/main/java</font> but, for the debug variant of your app. In contrast the main folder holds all the source common to all variants. Then add an [Application][3] class as described on the [Stetho][4] homepage:

现在我们在调试中使用Stetho。你会怎么做?当然使用牛逼闪闪的Android Gradle构建系统啦。创建一个源文件夹，目录结构为 <font color="red">src/debug/java</font>。这个目录中的代码仅仅是用于调试模式。这个目录结构和<font color="red">src/main/java</font>很像，因为构建模式就是用于应用程序的调试的。(这句话再想想)。然后添加一个[Stetho][5]主页上描述的 [Application][6]。

    import com.facebook.stetho.Stetho;
    
    public class MyDebugApplication extends MyApplication {
        @Override
        public void onCreate() {
            super.onCreate();
            Stetho.initialize(
                    Stetho.newInitializerBuilder(this)
                            .enableDumpapp(Stetho.defaultDumperPluginsProvider(this))
                            .enableWebKitInspector(Stetho.defaultInspectorModulesProvider(this))
                            .build());
        }
    }
Notice how this class is extended from the main application class already present, <font color="red">MyApplication.</font> This is really convenient because chances are that you are already using an application class in your app for other kinds of initialisation. If you don’t have an application, just extend from <font color="red">android.app.Application.</font>

看清楚这个类是怎样继承一个已经有的<font color="red">MyApplication.</font>类的。这样写的确很方便，因为你的应用里可能已经有一个application来进行其他的初始化了。如果你还没有一个application。你从<font color="red">android.app.Application.</font>继承一个就行了。

#Activate MyDebugApplication
#激活我的调试应用
The last step is to make sure the debug version of our app actually uses the <font color="red">MyDebugApplication</font> class. Again, we use the Gradle build to make that happen. Add an <font color="red">AndroidManifest.xml</font> to the <font color="red">src/debug</font> folder:

最后一步，我们要做的工具是确保当前的应用的调试版本使用的是MyDebugApplication类。在这里我们用Gradle来验证。在<font color="red">src/debug</font>文件夹中添加一个<font color="red">AndroidManifest.xml</font>


    <manifest
        package="com.mycompany"
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools">
    
        <application
            tools:replace="android:name"
            android:name=".MyDebugApplication"/>
    
    </manifest>

This <font color="red">AndroidManifest.xml</font> will be merged into the main <font color="red">AndroidManifest.xml</font> file in <font color="red">src/main</font> and will replace the <font color="red">android:name</font> attribute in the <font color="red"><application></font> tag. It will replace the attribute, because we specified that using the tools:replace attribute. Pretty neat!

这个<font color="red">AndroidManifest.xml</font>会合并到<font color="red">src/main</font>中的主AndroidManifest.xml文件里，并且会替换标签中的<font color="red">android:name</font>属性。这是因为我们特别添加上了tools:replace="android:name"属性。真屌。

Now when you run the debug build variant of the app, [Stetho][7] will be activated. When you switch to the release variant, there will be no trace of it and it won’t be activated. No accidental shipping in release builds, no developer embarrassment.

现在当你启动程序的调试模式，[Stetho][8]就会被激活。如果你切换到发布版本，Stetho绝对不会被激活，也看不到它的任何痕迹。在发布版本中不能有任何的意外(这句可以用更好的no...no...语句)

#Conclusion
#总结
Using the Android Gradle build system, it's easy to add some extra debug capabilities to your app. This technique doesn’t just work for [Stetho][9], but for any library or tool that you'd like to add for debug only.

用Android Gradle构建系统，可以很容易的给你的应用添加更多的调试功能。这门手艺不仅可以用在[Stetho][10]上，还可以用于那些你希望仅仅在调试模式中添加的类库或者工具。


  [1]: https://github.com/facebook/stetho
  [2]: https://github.com/facebook/stetho
  [3]: http://developer.android.com/reference/android/app/Application.html
  [4]: https://github.com/facebook/stetho
  [5]: https://github.com/facebook/stetho
  [6]: http://developer.android.com/reference/android/app/Application.html
  [7]: https://github.com/facebook/stetho
  [8]: https://github.com/facebook/stetho
  [9]: https://github.com/facebook/stetho
  [10]: https://github.com/facebook/stetho
