### Automating Android development
### 自动化 Android 开发

I have been recently talking at the [DroidCon Spain](http://es.droidcon.com/2015/) and [DroidCon Italy](http://it.droidcon.com/2015/) about how to automate a traditional Android workflow. To my surprise, there are still many organisations that do lack a Continuous Integration (CI) strategy. This is a big mistake! I decided to put down in words my thoughts about how to efficiently implement CI.
我最近已经在 [DroidCon Spain](http://es.droidcon.com/2015/) 和 [DroidCon Italy](http://it.droidcon.com/2015/) 讨论过关于如何自动化传统的Android工作流。
令我惊讶的是，仍然还有很多组织缺少执行持续集成（CI）的策略。这是一个巨大的灾难？
我决定用文字表达我的思想，就是如何高效的实现持续集成（CI）。

As a software engineer, your aim is to automate as many processes as possible. Machines are more efficient than people: they do not need food neither sleep, they perform tasks errorless and they make your life easier. *Work hard in order to work less*.
作为一个软件攻城狮，你的目标应该是尽可能多的自动化许多工作流程。
计算机比人更高效，它们不需要吃饭睡觉，它们的任务表现没有错误，并且它们使你的生活更轻松。
请记住：*做的越多是为了了做的更少*

Continuous Integration is nonetheless a complex field that involves many different dots that are separated, and that you need to put together.
You need to talk about Jira, you need to mention tests and branching, you need to script and construct.
持续集成（CI）尽管是一个包含许多不同要点的综合领域，并且你需要把它们整合在一起。
比如，你需要讨论Jira，你需要关心测试和分歧，你需要脚本和构建。

There are big blocks I want to bring into this post. Each of them deserves an individual post to explain how they work, but this is not the aim of this post. The aim is to show you the basics of each, and how they can be combined.
这里有一大块我想在这个帖子中介绍的。他们的每一点都值得展开介绍，但这不是这篇文章的目的。其目的是展示给你每个基础知识，以及如何组合他们。

1.  - Defining a branching strategy.
2.  - Using an agile methodology
3.  - Gradle and build scripting
4.  - Testing
5.  - Using a CI server.
1. 定义一个分支策略。
2. 使用敏捷方法
3. Gradle和构建脚本
4. 测试
5. 使用CI服务器。

### The branching strategy
### 分支策略

Branching is important. When you are constructing a new product with a set of people, you want to establish a protocol on how to work. How should people commit their features? How do we release? How do we ensure that we are not breaking things? To answer those questions, you need to adopt a branching strategy.
分支是重要的。当你正在构建一个新的产品，你想建立一个协议如何工作。
人们怎么应该提交自己的特性？我们如何发布？我们如何保证不正在破坏什么东西？
要回答这些问题，你需要采用分支策略。

I am using a fork of a branching strategy proposed by [Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/), slightly modified.
Let’s consider three states for our application: **alpha**, **beta** and **release**.
我正在使用一个经过轻微修改的由 [Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/) 提出的分支策略。
让我们考虑我们应用程序的三种状态：**alpha**, **beta** 和 **release**.

**Alpha** is the status of your system when it is being developed.
**Beta** happens when your features have been approved and merged.
**Release** is the status of a system when it has been delivered.
**Alpha** 的状态是你的系统正在开发
**Beta** 当你测试的功能已被批准和合并。
**Release** 是当系统可交付的状态。

(some people like to call alpha “develop” and beta “stage”. I think
letters of the greek alphabet are always cooler).
(一些人喜欢叫 alpha 为 “develop” ，并且 beta 为 “stage”. 我认为希腊字母表的字母总是更cool的).

The following picture represents the very first status of a project. You have your initial commit into the master branch.
下面的图片是一个项目的第一个状态。你有一个初始的提交到了master分支。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*CWNjrbmm5jQ0uvp-L53EYg.png)

Our system is just starting. There is a first commit in master, and the other branches still empty
Time to work. You need to branch from this initial state into develop.
This will be your version 1.0.1.
我们的系统是刚刚开始。只有第一个提交在master分支，其他分支还是空的
追着工作时间的进行。你需要从初始状态进入到develop过程。这将是你的1.0.1版本。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*JLekFIGh6ciEvj52w3hddA.png)

At this point, alpha is exactly the same as master.
> 在这个点上，alpha的确与master相同

Now you will start working on features. For each feature, you will create a feature branch. Using the right naming here is important, and there are several ways to do it. If you are using an issue tracking system like [Jira](https://www.atlassian.com/software/jira), you will likely have a ticket name associated with a feature (maybe FEATURE-123).
When I am committing features, I include the branch name in the commit message and add a full description.
现在，你会在功能特性上开始工作。对于每一个特性，你会创建一个分支。
使用正确的命名是很重要的，有几种方法可以做到这一点。如果您使用的是一个问题跟踪系统像 [Jira](https://www.atlassian.com/software/jira)，你可能会用一个与功能相关联的标签名（比如 FEATURE-123）。
当我提交特性时，我会包括分支名在提交信息里，并添加一个完整的描述。

    *[FEATURE-123] Created a new screen that performs an action.*

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wKF9mdhTLC8MFdy02WJ1EQ.png)

Note that each individual item in the branch will have its own version number. You can use [git tags](http://git-scm.com/book/en/v2/Git-Basics-Tagging) also to keep a control of the version.
注意，在每个分支的项目里都有自己的版本号。您可以使用 [git tags](http://git-scm.com/book/en/v2/Git-Basics-Tagging) 来执行版本号的控制

When a feature has been finished, a pull request is open, so that other members of your organisation can approve it. This is a critical part to ensure that you are delivering quality software. At [Sixt](http://www.sixt.de/mobileapps/) another member is assigned to your code review, and this person will go through your entire code.
We ensure that our code is meeting our [coding conventions](https://speakerdeck.com/kikoso/android-coding-guidelines) and we are strict about the process - typical comments in a pull request highlight that there is an extra space in an XML file. We comment about naming (“the name of the function is not clear to me”), check that our design is pixel perfect (“your text view has the color \#DCDCDC but the design is \#DEDEDE”) and there is a functional test to check that the feature is covering the acceptance criteria written in the issue tracker.
We even go through some philosophical discussions about the meaning of null, void or empty variables. This can sound annoying, but it is fun. And if it is passionately done, by the time your code reaches production you know you are commiting code with quality.
当一个功能已经完成，一个 pull request 就开放了，所以你的组织的其他成员就可以批准它。这是为了确保你提供高质量的软件的一个关键部分。在[Sixt](http://www.sixt.de/mobileapps/)另一成员被分配到你的代码审查，这个人会通读你全部的代码。
我们保证我们的代码是符合我们的[coding conventions](https://speakerdeck.com/kikoso/android-coding-guidelines)和我们对过程中严格的要求，典型的如在XML文件中有一个额外的空格。我们评论的命名（“函数名我不清楚”），检查我们的设计是完美的（“你的文本视图的颜色 \#DCDCDC 但设计是 \#DEDEDE”）有一个功能测试去检查该特性是覆盖了在问题跟踪里编写的验收标准的。
我们甚至进行一些哲学讨论，比如关于null和void或empty变量的意义。这听起来令人讨厌，但它是有趣的。如果是充满热情的做了这一切，到时候你就知道你的代码达到了产品需要的提交质量。

### Sprints and iteration
### 敏捷和迭代

You will likely be working with [SCRUM](http://en.wikipedia.org/wiki/Scrum_%28software_development%29), [Kanban](http://en.wikipedia.org/wiki/Kanban_%28development%29) or another agile methodology. Typically you will work in sprints of several weeks. We think is a good idea to divide the sprint into two weeks: the first week is used to develop the features, whereas the second week will stabilise the features created in the first sprint. In this second sprint we will fix bugs we found, achieve pixel-perfect layouts or improve-refactor our code. This work is done in the beta/stage branch.
The following image shows it graphically
你可能会在执行[SCRUM](http://en.wikipedia.org/wiki/Scrum_%28software_development%29), [Kanban](http://en.wikipedia.org/wiki/Kanban_%28development%29)或另外的敏捷方法。通常你会进行在几个星期的冲刺工作。我们认为是一个好主意，把冲刺分到两周：第一周是用来开发特性，而第二周将稳定在第一阶段创造的特性。在第二个冲刺中，我们将修复发现的漏洞，实现完美的布局或提高重构我们的代码。这项工作是在 **beta/stage** 分支完成的。
如下图所示

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*7lynNxY8iQpFHCee_Rkjjg.png)

The yellow dots belong to the bug fixing and stabilisation sprint
> 这些黄点属于bug修复和稳定的冲刺

If you are following our conventions, at the end of the sprint you will have a deliverable. This deliverable will be a file ready to be published in Google Play Store. At this moment, the last version of our application has been merged into master.
Another important topic is how to create a hotfix. Our model tries to prevent them using the code reviews and a second week of bug fixing and product stabilization, but bugs happen. When this is happening in production, this model requires the bug to be fixed directly in the master branch.
如果你遵循我们的约定，敏捷结束时你将会有一个可交付的成果。这将是一个准备发表在谷歌商店的可交付文件。此时此刻，我们的应用程序的最后版本已经合并到了master。
另一个非常重要的课题是如何创建一个热修复补丁。我们的模型试图通过使用代码检查和修复bug和产品稳定的第二周来阻止他们发生，但错误确实已经发生。这是发生在生产时，这种模式要求错误直接被修正在 **master** 分支。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*sdL8HDfMgoNuhnLKu7Soew.png)

Did you realise that there is a flag in this model? Yes, that is! The hotfixes are not present in our alpha and beta branches. After a hotfix and after the stabilisation period (the second week), our alpha branch is in an old state, with the bugs still being present there. We need to merge each branch into the branch inmediately to the right, thus ensuring that every fix is now present throughout all the branches.
你有没有意识到这个模型的标志？是的，就是那！该热修复补丁是不存在在我们的 **alpha/beta** 的分支。经过修复和稳定期后（第二周），我们的 **alpha** 分支是旧状态，错误仍然是存在的。我们需要立即合并各分支到分支来保证正确，从而确保每一个修复是存在所有的分支的。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Rijzdkk4SA4T9T3koBAXCg.png)

Hard to understand? Is probably harder to read than to put in practice.
If you do not have a branching strategy yet, just try to develop a feature using this model. You will see that is easy to work with this, and how you even will start to customize it!
很难理解？可能是很读起来比实施来的难。
如果你没有一个分支策略，只是试图使用这个模型来开发一个特性。你会发现很容易工作，而且你甚至会开始定制！

### Gradle and scripting
### Gradle 和脚本化

Now that you have read the branching model, we are ready to keep talking about the next steps. Gradle is a tool that will help us to achieve many things automatically. You are probably familiar with Gradle (or with the members of the family, Maven and Ant). Gradle is a project automation tool that we will use to perform functions and define properties while we are building our app. Gradle introduces a Groovy based domain language, and the limit to play with it is basically our imagination.
现在您已经阅读分支模型，我们准备继续讨论接下来的步骤。Gradle是一个工具,将帮助我们自动完成很多事情。你可能熟悉Gradle(或其它家族成员,Maven和Ant)。Gradle是一个项目的自动化工具，当我们正在建设我们的应用程序时，可以使用执行功能和定义属性。它介绍了一种基于Groovy的领域语言,这能做到的基本上只限制于我们的想象力。

I wrote previously a [post](http://codetalk.de/?p=112) with some tricks to use Gradle. Some of them will be useful to include in your
application, but there are a few more I have been applying since then, and I would like to introduce here.
我以前写的一个 [post](http://codetalk.de/?p=112) 和一些技巧来使用工具。他们中的一些将非常有用，包括对于你的应用，但也有一些我已经应用之后，我想在这里介绍。

#### The power of BuildConfig
#### 构建配置（BuildConfig）的力量

*BuildConfig* is a file generated automatically when we compile an
Android application. This file, by default, looks like follows:
当我们编译Android应用程序时，*BuildConfig* 是一个自动生成的文件。这个文件，默认情况下，看起来如下：

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wkoXjbSYaYymUhZrO8-jRw.png)

BuildConfig contains a field called **DEBUG**, that indicates whether the application has been compiled in debug mode or not. This file is highly customizable, which is very handy when we work on different build types.
BuildConfig 包含一个字段，叫 **DEBUG**，指示应用程序是否已经编译在调试模式。这个文件是高度可定制的，当我们工作在不同的构造类型时，这是非常便利的。

An application typically tracks its behaviour using [Google Analytics](http://www.google.com/analytics/ce/mws/),
[Crashlytics](https://try.crashlytics.com/) or other platforms. We might not want to influence those metrics when we are working on the
application (imagine a User Interface test, automatically released every day, tracking your login screen?). We also might have different domains depending on our Build (for instance development.domain.com, staging.domain.com…) that we want to use automatically. How can we do this cleanly? Easy! In the field buildTypes of Gradle we can just add any new field we want. Those fields will be later available through BuildConfig (this means, using BuildType.FIELD we can read them).
应用程序通常使用服务工具追踪其行为 [Google Analytics](http://www.google.com/analytics/ce/mws/), [Crashlytics](https://try.crashlytics.com/) 或其他平台。当我们正在开发应用时，我们可能不想影响这些指标（想象一个用户界面的测试，自动发布的每一天，跟踪您的登录屏幕？）。我们也会根据我们的构建有不同的域名（例如development.domain.com, staging.domain.com…），我们要使用自动的。但我们怎么可以做的干净利落？容易！在Gradle的buildTypes域，我们可以添加任何我们希望的新域。这些域将通过*BuildConfig* 在以后可用（这意味着，我们可以使用 BuildType.FIELD 来读取它们）。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Z_YYrTPF7FTShHAt5tqW3g.png)

In [this post](http://codetalk.de/?p=112) I showed how to use different icons and how to change the package name. Using this we can install different versions of our application. This is very handy to be able to see our beta, alpha and release versions at the same time.
在 [this post](http://codetalk.de/?p=112) 我展示了如何使用不同的图标和如何改变包的名称。利用这个我们可以安装我们应用程序的不同版本。这能够非常方便的同时看到我们的 beta, alpha 和 release 版本。

### Testing
### 保持测试

Testing is, by itself, and entire discipline that could have its own Medium post. When we talk about testing we talk about mocking components, about UI and integration tests, about Instrumentation and all the different frameworks available for Android.
测试本身，和整个过程都有它自己的介质。当我们谈论测试就是我们在谈论模拟的组件，关于UI测试和集成测试，关于仪器，和所有对于Android可用的不同框架。

Testing is very important, because it prevents developers of breaking existing things. Without testing, we could easily break an old feature A when we are developing a new feature B. Is hard to manually test an entire system when a new feature is commited, but doing it automatically it is much easier to control the stability of a system.
测试是非常重要的，因为它可以防止开发者破坏现有的东西。没有测试，当我们开发一个新的功能B时，我们可以很容易地干扰一个旧的特性A。当一个新的特征被提交，是很难手动测试整个系统的，但自动的做这些就更容易控制一个系统的稳定性。

There are many different of tests that can be performed in a mobile device: just to enumerate a few, we can think of integration tests, functional tests, performance or UI tests. Each has a different function, and they are generally triggered regularly to ensure that new functionality is not breaking or degrading the system.
这里有了许多不同的测试可以在移动设备上实施：只是列举几个，我们可以认为，集成测试，功能测试，性能测试和用户界面测试。每一种都有不同的功能，它们一般是定期触发以确保新功能没有破坏或干扰系统。

To show a basic example on how tests are integrated in Jenkins (and how they achieve a function of stopping a build when something goes wrong)
we will show a small example of a UI Test done with [Espresso](https://code.google.com/p/android-test-kit/wiki/Espresso) that tests our Android application each time is built in Jenkins.
为了展示一个基本的例子，如何将测试在 Jenkins 集成（以及他们如何实现生成出错时停止的功能）
我们将看到一个做UI测试的小例子 [Espresso](https://code.google.com/p/android-test-kit/wiki/Espresso) 每次都是在 Jenkins 构建测试我们的Android应用程序。

### An example application
### 一个应用程序的示例

I have created a small example application and uploaded it to
[GitHub](https://github.com/kikoso/Android-Testing-Espresso), so you can check it out there. There are are also some branches with a naming convention and pull requests you can see there to review everything explained until now. The application is fairly basic: it has a screen with a TextView. There are also three UI Tests been performed in the file
[MainActivityInstrumentationTest](https://github.com/kikoso/Android-Testing-Espresso/blob/master/src/androidTest/java/com/dropsport/espressoreadyproject/tests/MainActivityInstrumentationTest.java):
我创建了一个小示例应用程序并上传到 [GitHub](https://github.com/kikoso/Android-Testing-Espresso)，所以你可以来这里看看。有也与命名约定和pull requests，直到现在你可以看到审查的一切解释。该应用程序是相当基本的：它有一个TextView屏幕。还有三个已在文件执行的UI测试单元

1.  - Check that there is a TextView in the screen.
2.  - Check that the TextView contains the text “Hello World!”
3.  - Check that the TextView contains the text “What a label!”
1. 检查在屏幕上存在一个TextView。
2. 检查TextView包含文本“Hello World!”
3. 检查TextView包含文本“What a label!”

The two last tests are mutually exclusive (that means, either one or the other are sucesfull, but not both of them at the same time). We make the application release the tests with the following command:
最后的两个试验是互斥的（这意味着，无论是一个或另一个是成功的，但不能两者同时成立）。我们通过以下命令对应用进行测试：

    ./gradlew clean connectedCheck.

If you check out the code, you can try it by yourself uncommenting the function *testFalseLabel*. That will make the tests fail.
如果你检出了代码，你可以自己试试注释功能 *testFalseLabel*。这将使测试失败。

### Putting everything together into Jenkins

Now that we have checked a few things, let’s see how they fit into Jenkins. If you haven’t installed it yet, you can download the [last version](https://jenkins-ci.org/) from the website.

We haven’t mentioned it yet, but as there are branching strategies.
There are many different approaches, all of them with advantages and disadvantages:

1.  - You can make the tests being triggered before the branches are built.
2.  - You can have night or daily builds that do not block the build, but still sent a notification if it fails.

For this tutorial I have chosen the first approach, in order to show also a feature of Jenkins: dependencies between jobs. Let’s create three jobs: **Job Beta**, **Job Alpha** and **Job Tests**.

1.  **Job Alpha** will build the branch alpha (with ./gradlew clean assembleAlpha)
2.  **Job Beta** will do the same with the beta branch (with ./gradlew clean assembleBeta). This is done every time a branch is merged into beta.
3.  **Job Tests** will be triggered every time there is a merge into the branch alpha. If it is successful, it will trigger the **Job Alpha**.

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*OPzV-aZLBGxdPYWPIip8Bg.png)

Jenkins is a platform heavily based on plugins. Companies are continuously releasing plugins for their products, they integrate in Jenkins and we can easily interconnect with other platforms. Let’s see some of the options we have in Jenkins

#### Dependencies

Using dependencies in Jenkins we can interconnect projects. Maybe we want to connect tests with jobs and start them based on the tests’ result. Or maybe we have part of our logic in a library that needs to be compiled before the actual application is first built.

#### Notifications

Jenkins can notify a person or a set of people of a working or failing built. Notifications are typically emails, but there are plugins that enable to send messages in IM systems such as [Skype](https://wiki.jenkins-ci.org/display/JENKINS/Skype+Plugin) or even [SMS](https://wiki.jenkins-ci.org/display/JENKINS/SMS+Notification)
(the latest can be very handy when you have critical tests failing).

#### Delivering

You probably know at this point of [HockeyApp](http://hockeyapp.net/) or another [delivery platforms](http://alternativeto.net/software/hockeyapp/). They can basically store binary files, create groups and notifying them when an application is being uploaded. Imagine the tester receiving automatically in his/her device the last files each time they are being created, and the product owner being notified when a new beta version is ready. There is a [HockeyApp plugin](https://wiki.jenkins-ci.org/display/JENKINS/HockeyApp+Plugin) for Jenkins that enables to upload a binary file to Hockey (and even notifying members, or using as the release notes the last commits you have used).

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*P6-P4hBkKfAG7Ls0bzXeEQ.png)

I still like to keep the step of publishing into production manually, which is probably an irrational fear to loose all the human control in the publishing process. But there is, however, a [plugin](https://wiki.jenkins-ci.org/display/JENKINS/Google+Play+Android+Publisher+Plugin) to publish directly into Google Play.

### Conclusion

Achieving automation in *building*, *testing*, *delivering* and *publishing* is mainly a matter of choosing a right set of policies to work with a team. When this policies are well defined, we can proceed to the technical implementation.

There is one thing sure: errors that were done before by human actions are drastically reduced, and combined with a strong test coverage the quality of our software will dramatically improve. I am stealing here the motto of my colleague [Cyril Mottier](https://developers.google.com/experts/people/cyril-mottier):

> **Do less**, but **do** it **insanely great**

There is a moment in your career when you want to strive for the highest quality in your job, much rather than producing quantity. As I understand this business, one of the first steps to achieve it is to automate as much as you can. In fact, I can rephrase the previous motto into another sentence that I am trying to apply into my daily professional life:

> Automate more, so you do less.

Happy coding!

RecommendRecommended

BookmarkBookmarkedShareMore

* * * * *

FollowFollowing

[![Google Developer
Experts](https://d262ilb51hltx0.cloudfront.net/fit/c/63/63/1*6vxV6m-dOhmtSgPsoMOn_Q.png)](https://medium.com/google-developer-experts?source=footer_card "Go to Google Developer Experts")

### [Google Developer Experts](https://medium.com/google-developer-experts?source=footer_card "Go to Google Developer Experts")

Experts on various Google products talking tech.

BlockedUnblockFollowFollowing

[![image](https://d262ilb51hltx0.cloudfront.net/fit/c/63/63/1*AV6Ju95BJPkkIXg1x8Ni1w.jpeg "Enrique López Mañas")](https://medium.com/@enriquelopezmanas?source=footer_card "Go to the profile of Enrique López Mañas")

### [Enrique López Mañas](https://medium.com/@enriquelopezmanas "Go to the profile of Enrique López Mañas")

I do things with computers

Published on May 4. [All rights
reserved](//medium.com/policy/9db0094a1e0f) by the author.

Thanks to [Berna
Melek](https://medium.com/@bernamelek "Go to the profile of Berna Melek").
