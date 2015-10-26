30分钟搭建一个android的私有Maven仓库
---

> * 原文链接 : [A PRIVATE MAVEN REPOSITORY FOR ANDROID IN 30 MIN](原文url)
* 原文作者 : [JEROEN MOLS](http://jeroenmols.github.io/blog/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/mijack)
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  已完成

![](http://jeroenmols.github.io/img/blog/artifactory.png)


建立你自己的Maven库和上传artifacts，这是一个相当艰巨的任务。最近,我在这方面获得了一定的经验，希望和大家分享：通过[Artifactory](http://www.jfrog.com/open-source/)建立Maven库并使用Gradle自动上传artifact。


在不到30分钟，你将有一个可以运作的私有Maven库,通过配置gradle的buildscripts自动上传artifact。

请注意，这里提出的有关内容包括但不仅局限于安卓，他实际的使用范围更广。

**设置一个库管理器**

首先，我们需要确保我们有一个Maven库可以用于上传我们的artifact。根据[Maven](https://maven.apache.org/repository-management.html),你应该使用一个库管理工具：


> 最佳实践-使用库管理器
> 库管理器是一个专门的服务器应用程序，用于管理二进制组件的库。The usage of a repository manager is considered an essential best practice for any significant usage of Maven.


**为什么是ARTIFACTORY?**

虽然有一些其他的选项可供选择，我个人选择[artifactory](http://www.jfrog.com/open-source/)因为：

* 清晰且有吸引力的用户界面
* 超快速配置
* Gradle插件
* 用户访问控制
* 自由和开放来源

更多信息请查看[alternatives](https://maven.apache.org/repository-management.html), checkout[feature comparison matrix](http://www.jfrog.com/blog/artifactory-vs-nexus-integration-matrix/)或者回顾 [Artifactory的特性](https://www.jfrog.com/confluence/display/RTF/Artifactory+Comparison+Matrix).

**确定你安装了JAVA SDK 8**


在你开始之前，请确定你现在已经安装了Java 8，否则Artifactory将无法运行。你可以通过`java -version`这个命令获取Java的版本:

```
$ java -version
java version "1.8.0_51"
Java(TM) SE Runtime Environment (build 1.8.0_51-b16)
Java HotSpot(TM) 64-Bit Server VM (build 25.51-b03, mixed mode)
```

如果输出版本小于1.8.X，你应该[下载](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)和安装一个新的Java SDK。
请注意，如果你没有Java 8的错误，看起来有点诡异：

```
Aug 05, 2015 9:29:31 AM org.apache.catalina.core.StandardContext startInternal
SEVERE: One or more listeners failed to start. Full details will be found in the appropriate container log file
```

**安装 artifactory**


这一步，简单的难以置信。只需下载最新版本的[artifactory](http://www.jfrog.com/open-source/)，解压文件，然后运行与你的平台对应的`artifactory`可执行文件即可。

[youtube](http://img.youtube.com/vi/aa4YBDUDWy0/0.jpg)


通过访问`http://localhost:8081/artifactory/`，你就可以知道是否安装正确。在该页面，你可以体验到artifactory的一些特性。现在，不要担心所有的设置，我们稍后将配置我们所需要的设置。

**配置Gradle自动上传Android artifact**

通过配置一个新的Gradle任务，我们可以上传一个简单的文件。


在最上层的`build.gradle`文件（这里指文件路径）添加一个关于Artifactory Gradle 插件的引用：

```
buildscript {
    dependencies {
        classpath "org.jfrog.buildinfo:build-info-extractor-gradle:3.1.1"
    }
}
```

接下来，在你的库中，我们将需要两个新的插件：一个准备Maven artifact ` maven-publish`，另一个上传archives到artifactory `com.jfrog.artifactory`：

```
apply plugin: 'com.jfrog.artifactory'
apply plugin: 'maven-publish'
```

每一个Maven artifact都由以下三个参数确定：
* artifactId：库的名称
* groupId：通常库的包名
* version：区别同一artifact的不同版本

一般的，我们将在build.gradle文件定义最后两个变量。
```
def packageName = 'com.jeroenmols.awesomelibrary'
def libraryVersion = '1.0.0'
```

`artifactId`需要和` assemblerelease `任务输出的文件名相匹配。因此我们要[重命名库模块](https://stackoverflow.com/questions/26936812/renaming-modules-in-android-studio)或[指定输出文件名](https://stackoverflow.com/questions/24728591/how-to-set-name-of-aar-output-from-gradle)。我个人比较喜欢第一种方法，可以通过下面这种方式得到` artifactId `：

```
project.getName() // the ArtifactId
```

现在我们需要配置`maven-publish`，这样就知道哪一个artifactory将发布到Artifactory。我们的目的，我们是引用``***-release.aar`文件，他是由`assemblerelease`任务生成。请注意，我们可以通过更改库项目名称来预测这个名称：

```
publishing {
    publications {
        aar(MavenPublication) {
            groupId packageName
            version = libraryVersion
            artifactId project.getName()

            // Tell maven to prepare the generated "* .aar" file for publishing
            artifact("$buildDir/outputs/aar/${project.getName()}-release.aar")
      }
    }
}

```

最后，我们需要配置`com.jfrog.artifactory` 插件,来指定artifact发布到的库。为简单起见，我们将上传一个artifact到本地运行的Artifactory实例(`http://localhost:8081/artifactory`),默认放在`libs-release-local`库中。请注意，在本例中，用户名`admin`，密码`password`是硬编码的形式。我们希望以后有一个更好的解决方案。

```
artifactory {
    contextUrl = 'http://localhost:8081/artifactory'
    publish {
        repository {
            // The Artifactory repository key to publish to
            repoKey = 'libs-release-local'

            username = "admin"
            password = "password"
        }
        defaults {
            // Tell the Artifactory Plugin which artifacts should be published to Artifactory.
            publications('aar')
            publishArtifacts = true

            // Properties to be attached to the published artifacts.
            properties = ['qa.level': 'basic', 'dev.team': 'core']
            // Publish generated POM files to Artifactory (true by default)
            publishPom = true
        }
    }
}
```

**部署 ARTIFACTS**

现在，我们通过配置Gradle的buildscripts，运行以下命令轻松部署artifactory：
```
gradle assembleRelease artifactoryPublish
```

注意，我们在调用调用的实际` artifactoryPublish `任务前，会先调用` assembleRelease `，这取决于我们在上一节定义的方式。

你可以通过管理员凭据登陆`localhost:8081 `，知道有没有上传成功。

![](http://jeroenmols.github.io/img/blog/artifactory_screenshot.png)

**使用ARTIFACTS**


为了保证另一个项目也可以引用这个artifact，我们需要在根目录下的`build.gradle`文件中，把我们的仓库信息添加到仓库列表中。
```
allprojects {
    repositories {
        maven { url "http://localhost:8081/artifactory/libs-release-local" }
    }
}
```

然后，我们只需要在主工程的`build.gradle`文件中添加artifact作为依赖就可以了：

```
dependencies {
    compile 'com.jeroenmols.awesomelibrary:1.0.0'
}
```
**WRAP-UP**
**总结**


恭喜你！你完成了利用gradle生成和上传你的artifact 带Maven仓库。


在 [下一篇博客](http://jeroenmols.github.io/blog/2015/08/13/artifactory2/) ，我将继续学习一下几点:

* 库项目的依赖
* 配置你自己的仓库
* 使用权限管理


记得更改`build.gradle` 里的账号、密码


我已经上传了一份 [例子](https://github.com/JeroenMols/ArtifactoryExample) 到github供你参考。
