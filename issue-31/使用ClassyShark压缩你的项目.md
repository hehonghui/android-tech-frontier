使用ClassyShark压缩你的项目
---

> * 原文链接 : [Shrinking Your Build With No Rules
and do it with Class(yShark)](https://medium.com/@_tiwiz/shrinking-your-build-with-no-rules-8d9fb88281ac#.z596cgoll)
* 原文作者 : [Roberto Orgiu](https://medium.com/@_tiwiz)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [XWZack](https://github.com/XWZack) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)     
* 状态 :   校对中  `


最近，我们的项目中用到了一个重要的框架，它为我们的产品提供了一个非常关键的功能。

你可以想象一下，这个框架的SDK是相当巨大的，它包含**45K的方法**：这足以使我们的项目（已经用到了Support Library和Play Services）产生使用MultiDex分包的冲动。

## 深入引用库
去掉引用库中不需要的部分是相当简单的，但是理解如何修剪上面提到的框架又是另外一回事了：该框架需要作为我们项目的子模块被引入，从而使**4个.so文件和3个.jar包**被正确关联。在特定平台上构建的本地库带有一个.so拓展文件，这个文件通常放置在与系统架构，诸如x86或armeabi有关的文件夹中。

现在唯一的选择就是让这个框架脱离ProGuard的混淆范围，但是这样一来，即便不用MultiDex分包，至少最终APK的大小也会达到将近50MB。也就是说，这样做的效果肯定不理想：每当我们发布更新，所有用户必须下载整个APK，之后APK被解压，并在每个设备上占用更多的空间，而这些空间我们本不需要占用。

## 以前的处理方法
如果放在几个星期前，我们可能会这样处理：用[ApkTool](http://ibotpeaches.github.io/Apktool/)**反编译每个引用库**，手动查找所有的引用，然后用Atom或者Sublime Text浏览每个文件。如果真的这么做了，可能会浪费大量的时间：因为在反编译APK的时候，ApkTool是一个非常棒的工具，但对于这种特殊情况，我们需要一个更灵活，可能也更有帮助的工具。

## ClassyShark介绍
幸运的是，有这样一个工具：[ClassyShark](https://github.com/google/android-classyshark)。
这个软件是正是我们所需要的：通过简单地打开菜单根目录的.jar，我们可以很容易地跟踪每个被我们调用的方法的依赖关系，**几乎就像是用IDE浏览源代码**。    

![我们可以看到一个本地库正在被ClassyShark反编译](https://cdn-images-1.medium.com/max/1000/1*o3JmaZMrKyUjAXJrC7WcKg.png)

例如，通过双击反编译库中声明的类型，就可以轻松地打开了这个类，并跟踪相关的依赖列表。

此外，如果你由于某种原因无法找到想要的文件，通过窗口顶部的大小写敏感的输入框你总能搜到你想要的类。

在ClassyShark的帮助下，我们可以“轻松地”获取我们需要保存的所有依赖，并在很短的时间内为ProGuard添加正确的规则，使我们从令人头疼的手动跟踪依赖链接，甚至编译一遍只是想看看少了哪些引用中解救出来。

## 结语
不幸的是，我们无法摆脱MultiDex库，但我们的确缩小了我们的项目，并且我们**发行版本的APK大小，现在大概13 MB**，相比于初始大小减少了约75％。就算没有完美解决，也算得上是功德圆满了。

感谢我的同事 Giuseppe和我的朋友 Boris, Mario 和 Sebastiano校对这篇文章。





