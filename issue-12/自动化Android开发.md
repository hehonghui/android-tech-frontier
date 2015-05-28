自动化 Android 开发
---

> * 原文链接：[Automating Android development](https://medium.com/google-developer-experts/automating-android-development-6daca3a98396)
> * 原文作者：[Enrique López Mañas](https://medium.com/google-developer-experts/automating-android-development-6daca3a98396)
> * 译者：[tmc9031](https://github.com/tmc9031)
> * 校对者：[Mr.Simple](https://github.com/bboyfeiyu)
> * 状态：完成



我最近已经在 [DroidCon Spain](http://es.droidcon.com/2015/) 和 [DroidCon Italy](http://it.droidcon.com/2015/) 讨论过关于如何自动化传统的Android工作流。
令我惊讶的是，仍然还有很多组织缺少执行持续集成（CI）的策略。这是一个巨大的灾难！
我决定用文字表达我的思想，就是如何高效的实现持续集成（CI）。

作为一个软件攻城狮，你的目标应该是尽可能多的自动化许多工作流程。
计算机比人更高效，它们不需要吃饭睡觉，它们的任务表现没有错误，并且它们使你的生活更轻松。
请记住：*做的越多是为了了做的更少*

持续集成（CI）尽管是一个包含许多不同要点的综合领域，并且你需要把它们整合在一起。
比如，你需要讨论 Jira，你需要关心测试和分支，你需要脚本和构建。

这里有一大块我想在这个帖子中介绍的。他们的每一点都值得展开介绍，但这不是这篇文章的目的。其目的是展示给你每个基础知识，以及如何组合他们。

1. 定义一个分支策略。
2. 使用敏捷方法
3. Gradle和构建脚本
4. 测试
5. 使用CI服务器。


### 分支策略


分支是重要的。当你正在构建一个新的产品，你想建立一个协议如何工作。
人们怎么应该提交自己的特性？我们如何发布？我们如何保证不正在破坏什么东西？
要回答这些问题，你需要采用分支策略。

我正在使用一个经过轻微修改的由 [Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/) 提出的分支策略。
让我们考虑我们应用程序的三种状态：**alpha**, **beta** 和 **release**.

* **Alpha** 的状态是你的系统正在开发。
* **Beta** 当你测试的功能已被批准和合并。
* **Release** 是当系统可交付的状态。

> (一些人喜欢叫 alpha 为 “develop” ，并且 beta 为 “stage”. 我认为希腊字母表的字母总是更cool的).

下面的图片是一个项目的第一个状态。你有一个初始的提交到了master分支。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*CWNjrbmm5jQ0uvp-L53EYg.png)

我们的系统才刚刚开始。只有第一个提交在master分支，其他分支还是空的。
追着工作时间的进行。你需要从初始状态进入到develop过程。这将是你的1.0.1版本。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*JLekFIGh6ciEvj52w3hddA.png)

> 在这个点上，alpha的确与master相同

现在，你会在功能特性上开始工作。对于每一个特性，你会创建一个分支。
使用正确的命名是很重要的，有几种方法可以做到这一点。如果您使用的是一个问题跟踪系统像 [Jira](https://www.atlassian.com/software/jira)，你可能会用一个与功能相关联的标签名（比如 FEATURE-123）。
当我提交特性时，我会包括分支名在提交信息里，并添加一个完整的描述。

    *[FEATURE-123] Created a new screen that performs an action.*

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wKF9mdhTLC8MFdy02WJ1EQ.png)

注意，在每个分支的项目里都有自己的版本号。您可以使用 [git tags](http://git-scm.com/book/en/v2/Git-Basics-Tagging) 来执行版本号的控制

当一个功能已经完成，一个 pull request 就开放了，所以你的组织的其他成员就可以批准它。这是为了确保你提供高质量软件的一个关键部分。在 [Sixt](http://www.sixt.de/mobileapps/)，另一成员被分配到你的代码审查，这个人会通读你全部的代码。
我们保证我们的代码是符合我们的[coding conventions](https://speakerdeck.com/kikoso/android-coding-guidelines)和我们对过程中严格的要求，典型的如在XML文件中有一个额外的空格。我们评论的命名（“函数名我不清楚”），检查我们的设计是完美的（“你的文本视图的颜色 \#DCDCDC 但设计是 \#DEDEDE”）有一个功能测试去检查该特性是覆盖了在问题跟踪里编写的验收标准的。
我们甚至进行一些哲学讨论，比如关于null和void或empty变量的意义。这听起来令人讨厌，但它是有趣的。如果是充满热情的做了这一切，到时候你就知道你的代码达到了产品需要的提交质量。


### 敏捷和迭代


你可能会在执行[SCRUM](http://en.wikipedia.org/wiki/Scrum_%28software_development%29), [Kanban](http://en.wikipedia.org/wiki/Kanban_%28development%29)或另外的敏捷方法。通常你会进行在几个星期的冲刺工作。我们认为是一个好主意，把冲刺分到两周：第一周是用来开发特性，而第二周将稳定在第一阶段创造的特性。在第二个冲刺中，我们将修复发现的漏洞，实现完美的布局或提高重构我们的代码。这项工作是在 **beta/stage** 分支完成的。
如下图所示

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*7lynNxY8iQpFHCee_Rkjjg.png)

> 这些黄点属于bug修复和稳定性阶段

如果你遵循我们的约定，敏捷结束时你将会有一个可交付的成果。这将是一个准备发表在谷歌商店的可交付文件。此时此刻，我们的应用程序的最后版本已经合并到了master。
另一个非常重要的课题是如何创建一个热修复补丁。我们的模型试图通过使用代码检查和修复bug和产品稳定的第二周来阻止他们发生，但错误确实已经发生。这是发生在生产时，这种模式要求错误直接被修正在 **master** 分支。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*sdL8HDfMgoNuhnLKu7Soew.png)

你有没有意识到这个模型的标志？是的，就是那！该热修复补丁是不存在在我们的 **alpha/beta** 的分支。经过修复和稳定期后（第二周），我们的 **alpha** 分支是旧状态，错误仍然是存在的。我们需要立即合并到各分支来保证正确，从而确保每一个修复是存在所有的分支的。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Rijzdkk4SA4T9T3koBAXCg.png)

很难理解？可能是读起来比实施来的难。
如果你没有一个分支策略，只是试图使用这个模型来开发一个特性。你会发现很容易工作，而且你甚至会开始定制！


### Gradle 和脚本化


现在您已经阅读分支模型，我们准备继续讨论接下来的步骤。Gradle是一个工具,将帮助我们自动完成很多事情。你可能熟悉Gradle(或其它家族成员,Maven和Ant)。Gradle是一个项目的自动化工具，当我们正在建设我们的应用程序时，可以使用执行功能和定义属性。它介绍了一种基于Groovy的领域语言，它能做到的基本上只受限于我们的想象力。

我以前写的一个 [post](http://codetalk.de/?p=112) 和一些技巧来使用工具。他们中的一些将非常有用，包括对于你的应用，但之后也有一些我已经应用的，我想在这里介绍。

#### 构建配置（BuildConfig）的力量

当我们编译Android应用程序时，*BuildConfig* 是一个自动生成的文件。这个文件，默认情况下，看起来如下：

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wkoXjbSYaYymUhZrO8-jRw.png)

BuildConfig 包含一个字段，叫 **DEBUG**，指示应用程序是否已经编译在调试模式。这个文件是高度可定制的，当我们工作在不同的构造类型时，这是非常便利的。

应用程序通常使用服务工具追踪其行为 [Google Analytics](http://www.google.com/analytics/ce/mws/), [Crashlytics](https://try.crashlytics.com/) 或其他平台。当我们正在开发应用时，我们可能不想影响这些指标（想象一个用户界面的测试，自动发布的每一天，跟踪您的登录屏幕？）。我们也会根据我们的构建有不同的域名（例如development.domain.com, staging.domain.com…），我们要使用自动的。但我们怎么可以做的干净利落？容易！在Gradle的buildTypes域，我们可以添加任何我们希望的新域。这些域将通过*BuildConfig* 在以后可用（这意味着，我们可以使用 BuildType.FIELD 来读取它们）。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Z_YYrTPF7FTShHAt5tqW3g.png)

在 [this post](http://codetalk.de/?p=112) 我展示了如何使用不同的图标和如何改变包的名称。利用这个我们可以安装我们应用程序的不同版本。这能够非常方便的同时看到我们的 beta, alpha 和 release 版本。


### 保持测试


测试本身，和整个过程都有它自己的中间环节。当我们谈论测试就是我们在谈论模拟的组件，关于UI测试和集成测试，关于仪器，和所有对于Android可用的不同框架。

测试是非常重要的，因为它可以防止开发者破坏现有的东西。没有测试，当我们开发一个新的功能B时，我们可以很容易地干扰一个旧的特性A。当一个新的特征被提交，是很难手动测试整个系统的，但自动的做这些就更容易控制一个系统的稳定性。

这里有了许多不同的测试可以在移动设备上实施：只是列举几个，我们可以考虑，集成测试，功能测试，性能测试和用户界面测试。每一种都有不同的功能，它们一般是定期触发以确保新功能没有破坏或干扰系统。

为了展示一个基本的例子，如何将测试在 Jenkins 集成（以及他们如何实现生成出错时停止的功能）
我们将看到一个做UI测试的小例子 [Espresso](https://code.google.com/p/android-test-kit/wiki/Espresso) 每次都是在 Jenkins 构建测试我们的Android应用程序。


### 一个应用程序的示例


我创建了一个小示例应用程序并上传到 [GitHub](https://github.com/kikoso/Android-Testing-Espresso)，所以你可以来这里看看。也有一些分支使用命名约定和 pull requests，直到现在你可以看到审查的一切解释。该应用程序是相当基本的：它有一个TextView屏幕。还有三个已在文件执行的UI测试单元
[MainActivityInstrumentationTest](https://github.com/kikoso/Android-Testing-Espresso/blob/master/src/androidTest/java/com/dropsport/espressoreadyproject/tests/MainActivityInstrumentationTest.java):

1. 检查在屏幕上存在一个TextView。
2. 检查TextView包含文本“Hello World!”
3. 检查TextView包含文本“What a label!”

最后的两个试验是互斥的（这意味着，无论是一个或另一个是成功的，但不能两者同时成立）。我们通过以下命令对应用进行测试：

    ./gradlew clean connectedCheck.

如果你检出了代码，你可以自己试试注释功能 *testFalseLabel*。这将使测试失败。


### 把一切都集成在 Jenkins


现在，我们已经检查了一些事情，让我们看看他们如何适配 Jenkins。如果你没有安装它，你可以从网站下载 [last version](https://jenkins-ci.org/)。

我们没有提到一些东西，但这里也有分支策略。
有许多不同的方法，它们都具有各自的优点和缺点：

1. 你可以在分支构建前触发测试。
2. 你可以晚上或每日构建，不要阻止构建，但如果失败仍然要发出通知。

在本教程中我选择了第一种方法，也是为了显示 Jenkins 的一大特征：jobs 之间的依赖关系。让我们创造三个 jobs：**Job Beta**, **Job Alpha** and **Job Tests**。

1. **Job Alpha** 将构建 alpha 分支 (通过 ./gradlew clean assembleAlpha)
2. **Job Beta** 将做同样的工作在 beta 分支上（通过 ./gradlew clean assemblebeta）。这是每一次有分支合并到 beta 分支上就会执行的
3. **Job Tests** 每次有分支合并到 alpha 分支时都将触发。如果它成功了，它会引发 **Job Alpha**。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*OPzV-aZLBGxdPYWPIip8Bg.png)

Jenkins 是一个基于大量的插件的平台。许多公司正在为他们的产品不断地发布插件，他们将集成在 Jenkins，我们可以很容易地与其他平台连接。
让我们看看在 Jenkins 的一些选项

#### 依赖

使用依赖 Jenkins 可以互连项目。也许我们要连接测试 jobs 和基于试验结果来控制启动。或许我们在实际构建应用之前，部分逻辑首先存在需要编译的lib库里。

#### 通知

Jenkins 可以通知一个人或一个工作组或构建错误。通知一般是电子邮件，但也有插件可以通过IM系统发送消息，如 [Skype](https://wiki.jenkins-ci.org/display/JENKINS/Skype+Plugin) 或者 [SMS](https://wiki.jenkins-ci.org/display/JENKINS/SMS+Notification)（最新版当你有重要的测试失败时可以很方便的通知）。

#### 交付

你可能知道，在这一点上 [HockeyApp](http://hockeyapp.net/) 或另一个 [delivery platforms](http://alternativeto.net/software/hockeyapp/)。他们基本上可以存储二进制文件，创建组，并当应用程序被上传时通知他们。想象看测试者自动在他/她的设备上接收每次他们被创造的文件，和产品所有者被通知有新的beta版的情景。这里有一个Jenkins 插件 [HockeyApp plugin](https://wiki.jenkins-ci.org/display/JENKINS/HockeyApp+Plugin) 能够上传二进制文件到 Hockey（甚至通知成员，或作为你最近提交的 release notes 使用）。

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*P6-P4hBkKfAG7Ls0bzXeEQ.png)

我还是喜欢保持手动发布产品的步骤，这可能是由于在出版过程中不经过人工控制的一种担心。但是，确实有一个 [plugin](https://wiki.jenkins-ci.org/display/JENKINS/Google+Play+Android+Publisher+Plugin) 用来直接发步到 Google Play。


### 结论


在 *building*, *testing*, *delivering* 和 *publishing* 实现自动化，主要是在一个团队工作中选择正确的决策。当这个决定是明确的，我们才可以继续去技术上实现。

有一件事情是肯定的：错误会由于以往人们的行动而大幅度减少，并结合强大的测试覆盖率，我们的软件质量将大大提高。这里我借用同事的座右铭 [Cyril Mottier](https://developers.google.com/experts/people/cyril-mottier)：

> 致精而大

这是你职业生涯中的一个重要时刻！当你想在工作中保证 **质量** 而努力，而不是 **数量** 的多少。我了解这件事，第一步是尽你所能的实现自动化。事实上，我可以用以前的口号改述为另一句话，我将在我的日常生活里：

> 自动化的更多，所以你被动化的更少

祝：快乐编程！

![image](https://d262ilb51hltx0.cloudfront.net/fit/c/63/63/1*AV6Ju95BJPkkIXg1x8Ni1w.jpeg "Enrique López Mañas")
