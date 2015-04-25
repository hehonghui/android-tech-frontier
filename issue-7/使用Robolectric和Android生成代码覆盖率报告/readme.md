使用 Robolectric 和 Android 生成代码覆盖率（测试）报告
---

> * 原文链接 : [Code coverage reports using Robolectric and Android](http://raptordigital.blogspot.com/2014/08/code-coverage-reports-using-robolectric.html)
* 原文作者 : [Kris Vandermast](http://raptordigital.blogspot.com/)
* 译文出自 :  [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [normalme](https://github.com/normalme) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 : 校对中 

#介绍

我写过许多测试驱动开发与陷阱方面的文章。我认为，其中对测试驱动开发中遇到的陷阱的描述让整个介绍更加完整。测试驱动开发或者通常的测试中，最重要的是你清楚代码中哪些部分经过了测试，而哪些部分需要继续测试。

你可以使用[JaCoCo](http://www.eclemma.org/jacoco/)搞定上述的问题，它对Grandle和Robolectric有较好的集成。

# 配置build.gradle

第一步，配置build.gradle。主要代码如下所示。完整代码见[GitHub](https://github.com/kvandermast/my-robolectric-app)。

*build.gradle*

```
...

android {
    ...
    buildTypes {
        debug {
            runProguard false
            proguardFile 'proguard-rules.txt'
            debuggable true
            testCoverageEnabled = true

        }
    }

    ...
}

...

apply plugin: 'jacoco'

jacoco {
    toolVersion = "0.7.1.201405082137"
}

def coverageSourceDirs = [
        '../app/src/main/java'
]

task jacocoTestReport(type:JacocoReport, dependsOn: "testDebug") {
    group = "Reporting"

    description = "Generate Jacoco coverage reports"

    classDirectories = fileTree(
            dir: '../app/build/intermediates/classes/debug',
            excludes: ['**/R.class',
                       '**/R$*.class',
                       '**/*$ViewInjector*.*',
                       '**/BuildConfig.*',
                       '**/Manifest*.*']
    )

    additionalSourceDirs = files(coverageSourceDirs)
    sourceDirectories = files(coverageSourceDirs)
    executionData = files('../app/build/jacoco/testDebug.exec')

    reports {
        xml.enabled = true
        html.enabled = true
    }

}
```

（现在）我们来看看其中最重要的配置。

* buildType 声明，开启代码覆盖测试。

```

android {
    ...
    buildTypes {
        debug {
            runProguard false
            proguardFile 'proguard-rules.txt'
            debuggable true
            testCoverageEnabled = true

        }
    }

    ...
}
```

* 加入一个 JaCoCo 插件，同时，指定使用最新版 : 

```

apply plugin: 'jacoco'

jacoco {
    toolVersion = "0.7.1.201405082137"
}

def coverageSourceDirs = [
        '../app/src/main/java'
]
```

* 配置 converageSourceDirs，指定一个文件夹，JaCoCo 将对文件夹中的目标进行反射。

* 配置 JaCoCo 插件，指定你需要测试的类（它们已经经过编译）和不需要测试的类（比如 ButterKnife 注入的 *ViewInjector*）。

```
task jacocoTestReport(type:JacocoReport, dependsOn: "testDebug") {
    group = "Reporting"

    description = "Generate Jacoco coverage reports"

    classDirectories = fileTree(
            dir: '../app/build/intermediates/classes/debug',
            excludes: ['**/R.class',
                       '**/R$*.class',
                       '**/*$ViewInjector*.*',
                       '**/BuildConfig.*',
                       '**/Manifest*.*']
    )

    additionalSourceDirs = files(coverageSourceDirs)
    sourceDirectories = files(coverageSourceDirs)
    executionData = files('../app/build/jacoco/testDebug.exec')

    reports {
        xml.enabled = true
        html.enabled = true
    }

}
```

#执行 gradle 任务

修改 gradle.build 文件后，你必须执行与开发环境同步，以检查加入新插件后 gradle 也工作正常。

在使用 JaCoCo 生成测试报告前，还需要提供 testDebug.exec 文件。（提供文件）最简单的方法是打开命令行，对你的项目上执行如下命令 ： 
`$ ./gradlew clean assemble`

这条命令会清空之前编译生成的class文件，并重新构建。

现在，你就可以使用 JaCoCo 生成测试报告啦，只要执行这条命令：
`$ ./gradlew jacocoTestReport`

（你会看到）终端将开始执行 grable 构建脚本，其中，最后一项任务是使用 JaCoCo 生成测试报告：

>
`$ ./gradlew jacocoTestReport
:app:preBuild                
:app:preDebugBuild                
:app:checkDebugManifest                
:app:preReleaseBuild                 
:app:prepareComAndroidSupportSupportV42000Library UP-TO-DATE      
:app:prepareDeKeyboardsurferAndroidWidgetCrouton184Library UP-TO-DATE      
:app:prepareDebugDependencies                 
:app:compileDebugAidl UP-TO-DATE      
:app:compileDebugRenderscript UP-TO-DATE      
:app:generateDebugBuildConfig UP-TO-DATE      
:app:generateDebugAssets UP-TO-DATE      
:app:mergeDebugAssets UP-TO-DATE      
:app:generateDebugResValues UP-TO-DATE      
:app:generateDebugResources UP-TO-DATE      
:app:mergeDebugResources UP-TO-DATE      
:app:processDebugManifest UP-TO-DATE      
:app:processDebugResources UP-TO-DATE      
:app:generateDebugSources UP-TO-DATE      
:app:compileDebugJava UP-TO-DATE      
:app:compileTestDebugJava                                                                    
:app:processTestDebugResources UP-TO-DATE      
:app:testDebugClasses                 
:app:testDebug                                                             
:app:jacocoTestReport                                                           
               
BUILD SUCCESSFUL
               
Total time: 29.482 secs

生成的代码覆盖率测试报告保存在 ./build/reports/jacoco/jacocoTestReport 中，结果类似下图：
![p](http://img.blog.csdn.net/20150421201014450)    

#注意事项

* 你的**应用名**

在我的例子中，Android module名是"app"。因此包含 `'../app/src/main/java'` 中的代码。如果你的Android module 名和例子中的不同，就请修改gradle文件中路径（所有涉及到 Android module 相关的路径）。比如，如果你的Android module名是FooBar，配置文件中就应修改为 `"..app/src/main/java"`。

* **产品类別**

例子中没用指明产品类别，所以构建任务使用`"testDebug"`和`"../app/build/intermediates/classes/debug"`中的class文件。但是，如果你在应用中指定产品类别（比如. Local），Gradle就找不到"testDebug"任务。所以，需要正确的命名，比如，这里你可以用 testLocalDebug 并包含正确的class文件：`'../app/build/intermediated/classes/debug'`。

如果你有任何问题，别犹豫，直接来问我。代码在 [Github](https://github.com/kvandermast/my-robolectric-app) 上已经更新，请 Check Out。

术语：    

1. code coverage 代码覆盖率：软件测试中用来表示被测软件中被测试代码占整个软件的比例或程度。