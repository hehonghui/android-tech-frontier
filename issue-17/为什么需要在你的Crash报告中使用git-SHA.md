为什么需要用 GIT SHA 管理Crash
---

> * 原文链接 : [Why You Should Use a GIT SHA in Your Crash Reporting](http://www.donnfelker.com/why-you-should-use-a-git-sha-in-your-crash-reporting/)
* 原文作者 : [DONN FELKER](http://www.donnfelker.com/author/donn/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sjyin](https://github.com/yinshijian-kkb) 
* 状态 :  完成

开发人员在开发中常常会遇到一个问题：使用一个像Crashlytics的crash管理工具来判断一个特定的crash/bug是否被修复或解决。

例如：     
假设你从当前发布的版本上发现一个crash，但是本周你已经发布了三次...那么当前的crash来自于哪一个版本呢？

通常通过查看Crashlytics中版本号和版本名称来解决。但是，你必须正确的匹配发布的标签。如果你可以做到，跟踪到发布时具体的提交，然后再研究。

然而 。。。说实话，并不是每个人都能做到这一点。不幸的是，在我的经验中只有极少数公司会做这些，因为公司会不断的减少开发人员，甚至会减少到一个人。这种情况还在持续，所以很难做到正确的匹配发布的标签。从长远来看，找到一个标签，然后找到提交的版本，好吧。。。我不得不说这是一种痛苦。如果某个人忘记了提交的版本，就会什么也做不了。

也就是说，这里需要一个快速的小窍门可以在你使用像Crashlytics等工具处理crash和bug分类的时候帮你节省大量的时间。

**添加GIT SHA**
在你的Android工程中，打开build.gradle，然后添加如下的anroid代码块：


```java 
1 // Hat tip to Jake Wharton for this - found it in the u2020 app
2 def gitSha = 'git rev-parse --short HEAD'.execute([], project.rootDir).text.trim()
```

退回到android代码块中，然后添加一个git sha构建配置常量。


```java
1 android {
2 compileSdkVersion 19
3 buildToolsVersion "21.1.0"
4 
5 defaultConfig {
6 applicationId "co.your.appname"
7 minSdkVersion 19
8 targetSdkVersion 19
9 
10 buildConfigField "String", "GIT_SHA", "\"${gitSha}\""
11	 }
12 
13 }
```

现在返回到你创建Crashlytics实例的代码中（例子如下）。只需要在初始化脚本的下面添加如下的代码：


```java
1 Crashlytics.setString("git_sha", BuildConfig.GIT_SHA);
```

这行脚本的作用是：从你的源码管理中获取到git-sha的字符串值，然后将字符串设置成“git-sha”的值。

现在，当你的应用崩溃，你将会在Crashlytics中得到bug汇报，并且可以查看最近提交的代码。

**查看Crashlytics**

打开Crashlytics，进到崩溃汇报。然后，点击“more details”。在这里，你会看到（屏幕下方）应用构建的git_sha。

![p1](http://www.donnfelker.com/why-you-should-use-a-git-sha-in-your-crash-reporting/)

然后，你将会看到这个。。。

![p2](http://www.donnfelker.com/wp-content/uploads/2015/06/1435168870_full.png)

**补习**

一旦你识别到crash和git-sha，你就可以通过争论点checkout准确的版本。


```java
1 git checkout git_sha_goes_here
```

这时，你将可以在分离头的状态中查看造成崩溃的原因。然后，你将可以返回当前开发或标记的分支到修复过的问题和发布过的修复。

git_sha节省了你的大量时间，并且很容易创建。从此，你再也不用通过git logs,tag,patches 等等来寻找“提交了什么引起了崩溃？我们修复这个崩溃了吗？我们是怎么发现这个崩溃的？“，只需要简单的查看git sha来查找bug，查看当前的bug是否修复。如果修复了，很好。如果，还没有，用你的方式修复它。

希望这个能帮助到你！