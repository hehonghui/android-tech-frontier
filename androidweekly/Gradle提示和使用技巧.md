Gradle提示和使用技巧
---

> * 原文链接 : [Gradle tips & tricks to survive the zombie apocalypse](https://medium.com/@cesarmcferreira/gradle-tips-tricks-to-survive-the-zombie-apocalypse-3dd996604341#.k8a9o93ww)
* 原文作者 : [César Ferreira](https://medium.com/@cesarmcferreira)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

#Gradle tips & tricks to survive the zombie apocalypse
Rick Grimes can’t help you out, so let’s get it together!

#Gradle提示和使用技巧
Rick Grimes不能帮助你，所以让我们一起获得它！

[Gradle](http://www.gradle.org/) is here to stay. Although existing before [Android Studio](https://developer.android.com/sdk/installing/studio.html), it became the official IDE for android development and was the turning point on making it popular. But, are we taking full advantage of this great build automation system?

[Gradle](http://www.gradle.org/) 虽然之前一直存在于[Android Studio](https://developer.android.com/sdk/installing/studio.html)中，但是它变成热门的转折点是Android Studio成为官方开发IDE。但是，我们充分利用这个伟大的构建自动化系统了吗？



## Project and build specific global variables
With gradle, a **BuildConfig** class is automatically generated and we have the ability to generate additional fields into it. This can be useful for such things as configuring server URLs and easily toggling features on and off.

## 工程和构建专门的全局变量

使用gradle，会自动生成一个**BuildConfig**类文件并且我们有能力在它里面生成额外的字段。这对于像配置服务器URL和切换开关这类功能都是非常有用的。




```Gradle
defaultConfig {
    buildConfigField "String", "TWITTER_TOKEN", '"SDASJHDKAJSK"'
}
buildTypes {
    debug {
      buildConfigField "String", "API_URL", '"http://api.dev.com/"'
      buildConfigField "boolean", "REPORT_CRASHES", "true"
    }
    release {
      buildConfigField "String", "API_URL", '"http://api.prod.com/"'
      buildConfigField "boolean", "REPORT_CRASHES", "false"
    }
}
```

Accessible from the **BuildConfig** final class, **BuildConfig.TWITTER_TOKEN**, **BuildConfig.REPORT_CRASHES** and **BuildConfig.API_URL** (the last two will be different according to the type of build they’re in).

**BuildConfig.TWITTER_TOKEN**, **BuildConfig.REPORT_CRASHES** 和 **BuildConfig.API_URL** 都是能够通过**BuildConfig**这个final class访问的。（后面两个变量的值根据构建类型而不同）




## Different name, version name and app id per buildtype


## 每个构建类型不同的名称，版本名和APP ID

This allows you to have both release and debug versions of the app installed at the same time (remember that android doesn’t let you install different apps with the same package name)!

这个可以让你有release和debug两个版本的应用在同一时间被安装（记住android不让你安装相同的包名的不同的应用）！

You can filter issues/crashes by the different version names in your crash reporting tool.

你可以在你的崩溃报告工具中通过不同的版本名来过滤问题/崩溃。

Easily spot which one you are currently running by looking at the app name!

通过查看应用名称很容易发现你当前运行的是哪一个！

```
android {
    buildTypes {
        debug {
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
            resValue "string", "app_name", "CoolApp (debug)"
            signingConfig signingConfigs.debug
        }
        release {
            resValue "string", "app_name", "CoolApp"
            signingConfig signingConfigs.release
        }
    }
```
## Private Information

## 私有信息

Android requires that all apps be digitally signed with a certificate before they can be installed. Android uses this certificate to identify the author of an app, although there are some sensible information that should not be available to others.

Android要求所有的应用被安装之前用一个证书进行数字签名。Android使用这个证书识别应用的作者，尽管这是一些不应该让其它人看见的敏感信息。

You should **NEVER** check-in this kind of information into your source control.

你永远不应该提交这种信息到版本控制工具上。


Some people argue that you should have a local config file or even a global ~/.gradle/build.gradle with this values, but if you’re doing Continuous Integration/Deployment and specially if you don’t own your CI server, you should’t have any kind of file with the credentials in plain-text laying around in your CVS.

一些人认为你应该有一个本地配置文件或者甚至是一个全局~/.gradle/build.gradle使用这些值，但如果你正在做连续的集成/部署并且你没有自己专门的CI服务器，在你的版本控制器上不应该有任何带着证书用纯文本的方式展示的这种文件。

```
signingConfigs {
    release {
        storeFile     "${System.env.COOL_APP_PRIVATE_KEY}"
        keyAlias      "${System.env.COOL_APP_ALIAS}"
        storePassword "${System.env.COOL_APP_STORE_PW}"
        keyPassword   "${System.env.COOL_APP_PW}"
    }
}
```

This way I can provide sensible information through Environment Variables to my CI and not worry about checking-in anything “dangerous” to my company.

通过这种方式我可以将敏感信息提交到我自己的CI服务器而不用担心提交到公司的CVS上。


## Auto generated versionName and versionCode

## 自动生成 versionName 和 versionCode

Break up your version into its logical components and manage them separately. Stop wondering if you’ve bumped the version code correctly or updated the version name properly.

把你的版本信息从逻辑组件分离出来并且分别管理它们。不用再烦恼如何放置正确的版本号与版本名称。


```
def versionMajor = 1
def versionMinor = 0
def versionPatch = 0
android {
    defaultConfig {
        versionCode versionMajor * 10000 + versionMinor * 100 + versionPatch
        versionName "${versionMajor}.${versionMinor}.${versionPatch}"
    }
}
```

## Add git hash and build time to your BuildConfig

## 添加git hash和构建时间到你的BuildConfig



```
def gitSha = 'git rev-parse --short HEAD'.execute([], project.rootDir).text.trim()
def buildTime = new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone("UTC"))
android {
    defaultConfig {
        buildConfigField "String", "GIT_SHA", "\"${gitSha}\""
        buildConfigField "String", "BUILD_TIME", "\"${buildTime}\""
    }
}
```

Now you have two available variables, BuildConfig.GIT_SHA and BuildConfig.BUILD_TIME, which are awesome for binding the commits/build time to your logs among other things!

现在有两个变量可以用，BuildConfig.GIT_SHA 和BuildConfig.BUILD_TIME ，这在绑定提交/构建时间到log里面是非常方便的！

## Fastening your seatbelts

## 扣紧安全带

For faster deploys just create a flavour called dev and set the minSdkVersion to 21. Note that you sacrifice getting proper linting against your real minSdk by doing this, and this should obviously just be used for day to day work and not releases. This allows the Android gradle plugin to pre-dex each module and produce an APK that can be tested on Android Lollipop and above without time consuming dex merging processes.

对于快速部署只需要创建一个叫做**dev**的flavour 并且设置minSdkVersion 为21.通过这么做需要注意的是你不会得到你真正的minSdk的linting检查提示，显而易见的是这仅仅会被用于日常工作而不是发布。这会允许Android gradle插件预编译（pre-dex） 每个module并且编译的APK可以在Android Lollipop（ 5.0）及以上进行测试而不需要花费dex 合并处理时间。

```
android {
    productFlavors 
        dev {
            minSdkVersion 21
        }
        prod {
            // The actual minSdkVersion for the application.
            minSdkVersion 14
        }
    }
```

## Unit tests output directly to the console

## 单元测试直接输出到控制台

A small neat trick so we can see android unit tests logging results as they happen.

一个小窍门因此我们可以看到android单元测试它们发生的日志结果。

```
android {
  ...

  testOptions.unitTests.all {
    testLogging {
      events 'passed', 'skipped', 'failed', 'standardOut', 'standardError'
      outputs.upToDateWhen { false }
      showStandardStreams = true
    }
  }
}
```

Now when you run your tests they will output something like this:

现在运行你的测试它们将输出类似于这样的东西：


![image](https://cdn-images-1.medium.com/max/1600/1*njDARwtg9P9NdL5GfhIjqA.png)
unit testing logging output

单元测试日志输出

## Gradle, tell me I’m pretty

An organised way to use it all:

## Gradle,告诉我我很漂亮
一个有组织地方式使用它：

```
android {
    ...
    buildTypes {
        def BOOLEAN = "boolean"
        def TRUE = "true"
        def FALSE = "false"
        def LOG_HTTP_REQUESTS = "LOG_HTTP_REQUESTS"
        def REPORT_CRASHES = "REPORT_CRASHES"
        def DEBUG_IMAGES = "DEBUG_IMAGES"
 
        debug {
            ...
            buildConfigField BOOLEAN, LOG_HTTP_REQUESTS, TRUE
            buildConfigField BOOLEAN, REPORT_CRASHES, FALSE
            buildConfigField BOOLEAN, DEBUG_IMAGES, TRUE
        }
 
        release {
            ...
            buildConfigField BOOLEAN, LOG_HTTP_REQUESTS, FALSE
            buildConfigField BOOLEAN, REPORT_CRASHES, TRUE
            buildConfigField BOOLEAN, DEBUG_IMAGES, FALSE
        }
    }
}
```

If you have any questions hit me up on [@cesarmcferreira](https://twitter.com/cesarmcferreira)

Thanks to [José Coelho](https://medium.com/@jacoelho).

如果你有任何问题在 [@cesarmcferreira](https://twitter.com/cesarmcferreira)和我联系

感谢[José Coelho](https://medium.com/@jacoelho).

