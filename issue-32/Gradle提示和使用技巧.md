Gradle提示和使用技巧
---

> * 原文链接 : [Gradle tips & tricks to survive the zombie apocalypse](https://medium.com/@cesarmcferreira/gradle-tips-tricks-to-survive-the-zombie-apocalypse-3dd996604341#.k8a9o93ww)
* 原文作者 : [César Ferreira](https://medium.com/@cesarmcferreira)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn) 
* 校对者: [desmond1121](https://github.com/desmond1121)
* 状态 :  完成 


#Gradle提示和使用技巧
Rick Grimes不能帮助你，所以让我们一起获得它！

[Gradle](http://www.gradle.org/) 虽然之前一直存在于[Android Studio](https://developer.android.com/sdk/installing/studio.html)中，但是它变成热门的转折点是Android Studio成为官方开发IDE。但是，我们充分利用这个伟大的构建自动化系统了吗？

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

**BuildConfig.TWITTER_TOKEN**, **BuildConfig.REPORT_CRASHES** 和 **BuildConfig.API_URL** 都是能够通过**BuildConfig**这个final class访问的。（后面两个变量的值根据构建类型而不同）


## 每个构建类型不同的名称，版本名和APP ID

这个可以让你有release和debug两个版本的应用在同一时间被安装（记住android不让你安装相同的包名的不同的应用）！

你可以在你的崩溃报告工具中通过不同的版本名来过滤问题/崩溃。

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

## 私有信息

Android要求所有的应用被安装之前用一个证书进行数字签名。Android使用这个证书识别应用的作者，尽管这是一些不应该让其它人看见的敏感信息。

你永远不应该提交这种信息到版本控制工具上。

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

通过这种方式我可以将敏感信息提交到我自己的CI服务器而不用担心提交到公司的CVS上。


## 自动生成 versionName 和 versionCode

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

现在有两个变量可以用，BuildConfig.GIT_SHA 和BuildConfig.BUILD_TIME ，这在绑定提交/构建时间到log里面是非常方便的！

## 扣紧安全带

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

## 单元测试直接输出到控制台

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

现在运行你的测试它们将输出类似于这样的东西：


![image](https://cdn-images-1.medium.com/max/1600/1*njDARwtg9P9NdL5GfhIjqA.png)

单元测试日志输出


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

如果你有任何问题在 [@cesarmcferreira](https://twitter.com/cesarmcferreira)和我联系

感谢[José Coelho](https://medium.com/@jacoelho).

