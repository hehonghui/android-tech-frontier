为什么需要用 GIT SHA 管理Crash
---

> * 原文链接 : [Why You Should Use a GIT SHA in Your Crash Reporting](http://www.donnfelker.com/why-you-should-use-a-git-sha-in-your-crash-reporting/)
* 原文作者 : [DONN FELKER](http://www.donnfelker.com/author/donn/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sjyin](https://github.com/yinshijian-kkb) 
* 校对者:
* 状态 :  校对中



A common problem developers encounter when developing applications that use a crash reporting tool like Crashlytics is determinig if a particular crash/bug has been fixed/addressed or not.

开发人员在开发中常常会遇到一个问题：使用一个像Crashlytics的crash管理工具来判断一个特定的crash/bug是否被修复或解决。

For example assume that you get a crash report for a recent release. But you released three times this week already … which release does it apply to?

例如：     
假设你从当前发布的版本上发现一个crash，但是本周你已经发布了三次...那么当前的crash来自于哪一个版本呢？

This is usually solved by reviewing the version code and verison name in Crashlytics. But even then you have to be properly tagging your releases. If you’re doing that you can trace back the release to a particular commit and then investigate.

通常通过查看Crashlytics中版本号和版本名称来解决。但是，你必须正确的匹配发布的标签。如果你可以做到，跟踪到发布时具体的提交，然后再研究。

However … Lets be 100% honest here – not everyone does this. Unfortunately , very few companies do this in my experience and it declines even more when the size of the team deminishes to even a single developer. There’s a lot going on, its easy to miss. Furthremore, chasing down a tag, then finding a commit, well … its kind of a pain. If someone forgot then its all for nothing.

然而 。。。说实话，并不是每个人都能做到这一点。不幸的是，在我的经验中只有极少数公司会做这些，因为公司会不断的减少开发人员，甚至会减少到一个人。这种情况还在持续，所以很难做到正确的匹配发布的标签。从长远来看，找到一个标签，然后找到提交的版本，好吧。。。我不得不说这是一种痛苦。如果某个人忘记了提交的版本，就会什么也做不了。

That said, here’s a quick tip that can save you a ton of time when you’re performing crash and bug triage with tools like Crashlytics.

也就是说，这里需要一个快速的小窍门可以在你使用像Crashlytics等工具处理crash和bug分类的时候帮你节省大量的时间。

Adding The GIT SHA 
In your Android application, open the build.gradle file and add the following above the android block.

**添加GIT SHA**
在你的Android工程中，打开build.gradle，然后添加如下的anroid代码块：


```java 
1 // Hat tip to Jake Wharton for this - found it in the u2020 app
2 def gitSha = 'git rev-parse --short HEAD'.execute([], project.rootDir).text.trim()
```

Back in the Android block add a git sha build config constant.

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

Now go back to where you’ve set up your Crashlytics instance in your application code (example shown below). Just below the initialization script add the following code:

现在返回到你创建Crashlytics实例的代码中（例子如下）。只需要在初始化脚本的下面添加如下的代码：


```java
1 Crashlytics.setString("git_sha", BuildConfig.GIT_SHA);
```

What this will do is set a string with the key value being “git_sha” and the value being the short git-sha from your source control.

这行脚本的作用是：从你的源码管理中获取到git-sha的字符串值，然后将字符串设置成“git-sha”的值。

Now, when your application crashes you’ll get a bug report in Crashlytics and you’ll be able to see what the latest commit was on that code.

现在，当你的应用崩溃，你将会在Crashlytics中得到bug汇报，并且可以查看最近提交的代码。

Reviewing in Crashlytics

**查看Crashlytics**

Open Crashlytics and go to one of your crashes. Then click on “more details”. Here you will see (screenshot below) the git_sha that the application was built off of.

打开Crashlytics，进到崩溃汇报。然后，点击“more details”。在这里，你会看到（屏幕下方）应用构建的git_sha。

![p1](http://www.donnfelker.com/why-you-should-use-a-git-sha-in-your-crash-reporting/)

Then you’ll see this ..

然后，你将会看到这个。。。

![p2](http://www.donnfelker.com/wp-content/uploads/2015/06/1435168870_full.png)

Remediation
**补习**

Once you have identified the crash and the git-sha you can checkout that exact version of the code by issuing

一旦你识别到crash和git-sha，你就可以通过争论点checkout准确的版本。


```java
1 git checkout git_sha_goes_here
```

At this point you’re in a detached head state. You’ll want to see what caused the crash in this state. Then you’ll want to return to your current develop branch or tagged branch to fix/hotfix the issue and release the fix.

这时，你将可以在分离头的状态中查看造成崩溃的原因。然后，你将可以返回当前开发或标记的分支到修复过的问题和发布过的修复。

The git_sha saves a ton of time and its super easy to set up. You no longer have to dig through git logs, tags, patches, etc to find “what commit is this crash happening on? Did we fix it already? How can I find out?” Simply check the git sha, look for the bug, see if it’s fixed yet. If it is, cool. If 
not, fix it and be on your way.

git_sha节省了你的大量时间，并且很容易创建。从此，你再也不用通过git logs,tag,patches 等等来寻找“提交了什么引起了崩溃？我们修复这个崩溃了吗？我们是怎么发现这个崩溃的？“，只需要简单的查看git sha来查找bug，查看当前的bug是否修复。如果修复了，很好。如果，还没有，用你的方式修复它。

I hope that helps!

希望这个能帮助到你！