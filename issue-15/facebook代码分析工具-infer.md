
# Open-sourcing Facebook Infer: Identify bugs before you ship
# facebook开源项目Facebook Infer: 静态代码检查工具
-----

> * 原文链接 : [Google I/O Summary: What’s new in Android Development Tools](http://robovm.com/google-io-summary-whats-new-in-android-development-tools/)
* 原文作者 : [Mario Zechner](http://robovm.com/author/mario/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Mr.Simple](http://github.com/bboyfeiyu) 



Today, we're open-sourcing [Facebook Infer](http://fbinfer.com/), a static program analyzer that Facebook uses to identify bugs before mobile code is shipped. Static analyzers are automated tools that spot bugs in source code by scanning programs without running them. They complement traditional dynamic testing: Where testing allows individual runs through a piece of software to be checked for correctness, static analysis allows multiple and sometimes even all flows to be checked at once. Facebook Infer uses mathematical logic to do symbolic reasoning about program execution, approximating some of the reasoning a human might do when looking at a program. We use Facebook Infer internally to analyze the main Facebook apps for Android and iOS (used by more than a billion people), Facebook Messenger, and Instagram, among others. At present, the analyzer reports problems caused by null pointer access and resource and memory leaks, which cause a large percentage of app crashes.

今天，我们开源了一个名叫[Facebook Infer](http://fbinfer.com/)的静态程序分析库，该库用于在程序分发之前定位代码bug。静态分析器是一个不需要运行代码就可以准确地找出代码bug的自动化工具。它是传统的动态测试的补充，传统的动态测试允许每次只运行一个独立的代码单元来检测程序的正确性，静态分析则允许一次性检测多个、甚至所有代码。Facebook Infer使用数学逻辑来推理程序的运行，当在查找程序时来推测程序员在代码中所要做的操作。我们内部使用Facebook Infer来分析facebook的Android和iOS应用，例如facebook messagers, Instagram等等。现在，这个分析器能够发现空指针、内存泄漏等能够使应用奔溃的大量代码bug.

Each month, hundreds of potential bugs identified by Facebook Infer are fixed by our developers before they are committed to our codebases and deployed to people's phones. This saves our developers many hours finding and fixing bugs, and results in better products for people.

每个月我们都会修复使用Facebook Infer发现的数百个潜在的bug，从而避免这些bug提交到我们的代码仓库。这些成果大大减少了我们研发人员查找bug的时间，也使得我们的用户能够使用更高质量的应用。

![](https://fbcdn-dragon-a.akamaihd.net/hphotos-ak-xta1/t39.2365-6/11405195_1607248792888456_614155255_n.gif)


## Motivation
## 动机
Facebook likes to move fast by shipping software as soon as it’s ready, rather than after a lengthy manual testing process. This approach is riskier on mobile platforms than on the web. When a bug is discovered on the web, a fix can immediately be shipped to servers, but in order for a bug fix to take effect on mobile, people have to update their apps. There is thus added value in catching bugs early, before they are shipped to people's phones. Combining static analysis with automated tests helps Facebook find crashes and memory leaks before they are shipped, which helps us keep moving fast on mobile.

facebook喜欢在产品完成之后尽可能快的分发出去，而不是在一连串冗长的手动测试之后。这种方式在移动应用端的风险比web端更大。当一个web的bug被发现时，我们可以马上修复并且提交到服务器上。但是为了修复移动应用的bug,我们需要像应用市场更新应用安装文件。因此，这也使得在将应用分发给用户之前发现bug变得更有价值。结合静态分析和自动测试能够帮助Facebook在将产品分发出去之前找到crashed和内存泄漏，这使得我们的应用端应用的研发更为有效、迅速。


To fit in with our developers' workflow, Facebook Infer runs incrementally, analyzing code modifications to the source code of our app when they are submitted by developers for review. The analyzer automatically writes comments on source code when it finds potential problems. It is important that these reports be high quality so that we help developers without slowing them down. In recent months, the fix rate for issues reported to our developers has been hovering around 80 percent, a high rate for such an automated tool.

为了符合开发者的工作流程，当开发者提交了代码后Facebook Infer增量地执行以分析代码的修改。当发现潜在bug时分析器会自动地在代码中添加评论。`这些bug报告都是高质量的，因此我们可以帮助开发者快速的找到问题所在`。在最近的几个月中，bug的修复率已经高达80%,对于一个自动化工具来说那是相当高了。


In the current deployment model, we run the analyzer on the Android and Objective-C code for our apps, but more is possible. Facebook Infer can analyze C projects and Java code that is not Android, and we plan to further extend its capabilities. With your help, we hope to expand the places where Facebook Infer is deployed.

在现在的开发模式中，我们运行分析器来分析我们的Android和iOS代码，但是我们还可以做更多的事。Facebook Infer还可以分析c语言项目和java代码，我们计划在未来扩展它的兼容性。有你的帮助，我们希望Facebook Infer 能够有更广阔的用途。


## Novel techniques: Separation logic and bi-abduction
Facebook Infer uses logic to do reasoning about a program's execution, but reasoning at this scale — for large applications built from millions of lines of source code — is hard. Theoretically, the number of possibilities that need to be checked is more than the number of estimated atoms in the observable universe. Furthermore, at Facebook our code is not a fixed artifact but an evolving system, updated frequently and concurrently by many developers. It is not unusual to see more than a thousand modifications to our mobile code submitted for review in a given day. The requirements on the program analyzer then become even more challenging because we expect a tool to report quickly on these code modifications — in the region of 10 minutes — to fit in with developers' workflow. Coping with this scale and velocity requires advanced mathematical techniques. Facebook Infer uses two such techniques: separation logic and bi-abduction.

facebook infer使用逻辑来推理程序的执行,但是通过这种方式来推理上百万行代码量的应用时会变得非常困难。`从理论上讲，需要检查的代码数量会多过预计的数量`。此外，在Facebook我们的代码并不是手工修复代码，而是一个不断进化的系统，这个系统被很多开发者频繁的更新。一天之内大量代码的修改在我们的移动开发中并不常见。因此这个代码分析器的需求变得更有挑战，因为我们期望一个能够快速检查代码修改的工具，这个时间应该在10分钟之内。这样的规模和速度需要更高级的数学模型，Facebook Infer使用了两种技术: 逻辑分离和bi-abduction。

Separation logic is a theory that allows Facebook Infer's analysis to reason about small, independent parts of the application storage, rather than having to consider the entirety of the memory potentially at every step. That would be a daunting task on modern processors with their large addressable virtual memories.

逻辑分离是使Facebook Infer分析能够推断出应用存储的独立小部分的一种理论，从而不用考虑每一步存储的完整性。因为考虑每一步的存储完整性对当今的大型可寻址虚拟内存处理器来说是一个很蛋疼的事。


Bi-abduction is a logical inference technique that allows Facebook Infer to discover properties about the behavior of independent parts of the application code. By storing these properties between runs, Facebook Infer needs to analyze only the parts of the software that have changed, reusing the results of its previous analysis where it can.

Bi-abduction是一种逻辑推理技巧，可以使Facebook Infer挖掘到应用代码独立部分的行为特性。在其运行时把这些特性存储下来之后，Facebook只需要分析软件中发生改变的部分，其他的部分可以直接套用先前的分析结果。

By combining these approaches, our analyzer is able to find complex problems in modifications to an application built from millions of lines of code, in minutes.

结合这几种方法，我们的分析器能够在数分钟之内在上百万行代码中找到被修改的代码中存在的复杂问题。


## History: From theoretical computer science to verification for a billion-plus people

## 历史 : 从代码检查理论到为十多亿人服务的蜕变

Automatic verification of software has been a long-held goal in the computer science community. Facebook Infer builds on fundamental work in the area, including theories of Hoare logic and abstract interpretation. Before joining Facebook, we participated in the development of another fundamental work, "separation logic," as a response to problems in scaling verification techniques to real-world code.

软件的自动检查在计算机科学社区是一个长期依赖的目标。Facebook Infer在这个领域构建了一个基本实现， 包含霍尔逻辑和抽象解释。在加入facebook之前，我们参与到了其他基础设施的开发工作，“逻辑分离”作为能够实现软件自动检查的结果出现在人们的视野中。


Separation logic was a breakthrough for highly theoretical computer science — a new kind of mathematical logic used to describe mutations of computer memory (analogous to how Boolean logic describes circuits). We worked on applying and automating the theory, creating a series of research prototype tools (Smallfoot, Space Invader, Abductor) and underpinning inference techniques, culminating in the discovery of bi-abduction as a way to analyze programs modularly. (We retain university affiliations: Calcagno with Imperial College London, Distefano with Queen Mary University of London, and O'Hearn with University College London.)

逻辑分离是在计算机科学领域的一个重大突破-一种新的数学逻辑被用于描述计算机内存的变化（类似于布尔逻辑用来描述电路）。我们专注于将这个理论运用和自动化,创建一系列原型工具(例如Smallfoot, Space Invader, Abductor)来支撑这些推理逻辑，最终发现了bi-abduction是模块化分析程序的一种有效形式。

Based on the success of these research advances, we formed a startup company, Monoidics, in 2009. Monoidics joined Facebook in 2013, and since then we have adopted the continuous development and deployment style practiced at Facebook and improved our analyzer based on an iterative feedback loop between our analyzer's development team and Facebook's mobile software engineers. We have demonstrated that verification technology can indeed thrive when applied to codebases at Facebook's scale and pace of change.

基于上述研究成果,我们2009年创建了一个名为Monoidics的公司。Monoidics在2013年加入Facebook，从那以后我们采用持续开发和部署的风格来开发我们的产品，在我们的分析器团队和facebook移动软件开发工程师的不断努力的迭代开发下我们的分析器得到了很大的提升。我们也展示了当运用到facebook代码库时代码检查技术能够得到快速的发展。


## The future
## 展望未来
Program verification is an area with an active research community and promising technology. At Facebook, we have a saying that this journey is 1 percent finished. In program verification, certainly, a tremendous amount remains to be done. But, with continued progress, we believe there is also much more value that can be unlocked for programmers. We look forward to a future in which, with your help, program verification technology can prove more and more useful in helping programmers develop reliable code, fast.

程序检查是一个有着活跃研究社区和前景光明的领域。在facebook,我们说过这趟旅行我们只完成了1%。在程序检查领域还有很多的工作需要我们去完成。但是，随着我们的不断努力，我们相信这个领域的成果会让软件工程师解放出更多的价值。我们可以展望未来，有你的帮助，程序检查技术能够提供更多、更有用的技术来使得我们的代码更可靠、更高效。

To find out more about Facebook Infer, download it and try it out, or check out fbinfer.com for more details.

你可以下载和试用Facebook Infer或者移步到[fbinfer.com](fbinfer.com)
以了解更多的详细情况。

**Acknowledgements**: The Infer engineering team @FB includes Sam Blackshear, Jeremy Dubreil, Andrzej Kotulski, Martino Luca, Irene Papakonstantinou, Dulma Rodriguez, and Jules Villard, in addition to Calcagno, Distefano, and O'Hearn. We thank our FB colleagues Mathieu Baudet, Dominik Gabi, and Pieter Hooimeijer for their help, and Bryan O'Sullivan, David Mortenson, and Jim Purbrick for their support. Outside of Facebook, we particularly acknowledge the scientific contributions of David Pym, John Reynolds, Hongseok Yang, and Josh Berdine.

**致谢**： Infer工程@FB团队包括Sam Blackshear, Jeremy Dubreil, Andrzej Kotulski, Martino Luca, Irene Papakonstantinou, Dulma Rodriguez, and Jules Villard, in addition to Calcagno, Distefano, and O'Hearn. We thank our FB colleagues Mathieu Baudet, Dominik Gabi, and Pieter Hooimeijer for their help, and Bryan O'Sullivan, David Mortenson, and Jim Purbrick for their support. Outside of Facebook, we particularly acknowledge the scientific contributions of David Pym, John Reynolds, Hongseok Yang和Josh Berdine.