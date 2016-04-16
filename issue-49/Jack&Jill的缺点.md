The dark side of Jack and Jill
---

> * 原文链接 : [The dark side of Jack and Jill](http://trickyandroid.com/the-dark-world-of-jack-and-jill/)
* 原文作者 : [Tricky Android](http://tutsplus.com/authors/paul-trebilcox-ruiz)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



去年 Google 发布了新的开发工具链 - Jack (Java Android Compiler Kit) 和 Jill (Jack Intermediate Library Linker)，希望能用它们代替已有的 javac + dx 管道。

本文将整理我对新工具链的想法和关注点。

但在研究 Jack&Jill 机制之前，我想先给大家介绍现有的编译工具链是如何帮助你编译 Android 项目的。

##Android code compilation 101

老实说，我不会详述整个构建过程 - 而是把注意力放在与本文相关度较高的部分 - 将 Java 代码转化为 dex 文件。

自计算机科学产生以来，程序的编译过程始终如下：

![](http://trickyandroid.com/content/images/2016/03/javac-4.png)

所以我们需要关注的是：如何将纯 Java 代码转换为设备 JVM 可理解的可执行指令。

对纯 Java 应用（不是 Android）来说，这一点只通过 Java 编译器（javac）就可以完成，它会帮我们将 Java 代码编译为 Java 字节码（以 *.clcass 文件的形式存在），而常规的 JVM 都能理解和执行这些 Java 字节码，使得你的 Java 应用能在你的设备上运行。

但问题是，Android 系统上使用的 JVM 不是标准的 JVM，而是为了适应移动设备的硬件环境，对其修改后的高度优化版本。Android 上的 JVM 也被称为 Dalvik/ART。

由于 JVM 被修改了，Java 字节码也需要进行修改，要不然 Dalvik 无法理解和执行相应的指令。这也是 dx 工具的作用 - 得到 Java 字节码（*.class 文件）并将它转换为 Android 环境友好的字节码（*.dx 文件）。

有趣的是：当你在项目中使用第三方库 - 该库会以 jar 或 arr 的形式被调用 - 但其实这些文件解压以后都是一堆 *.class 文件，使得这些第三方库可以直接交给 dx 工具处理，而不需要我们通过编译流程将它们转换为字节码。

##Bytecode manipulation

随时间推移，Android 开发者对 Android 开发的理解越来越深，也因此开发了许多酷炫的工具和插件以在 Java 字节码层增强代码的性能（例如字节码操作）。

你听说过最有名的工具可能有：

- Proguard
- Jacoco coverage
- Retrolambda
- ...

这些工具使我们能延后处理代码而且没有对原始代码作任何的更改。例如：Proguard 能分析 Java 字节码，并将没有使用的部分移除（最小化字节码）；Retrolambda 用匿名内部类替代 Java8 的 lambdas，使不支持 Java8 特性的 Android VM 能使用 lambdas。

![](http://trickyandroid.com/content/images/2016/03/transform1-1.png)

每个类（它的字节码）都被字节码操作插件处理，并将处理后的字节码交给 dx 工具产生最终的字节码。

##Transform API
由于类似的工具越来越多，Android Gradle 构建系统不能良好支持字节码操作的缺点就变得格外显眼 - 解决方案也只有通过 Android Gradle 插件将 Java 字节码转换完毕和交给 dx 工具处理之间给已存在的 Gradle 任务添加 Gradle 任务依赖。该任务的名称是一个实现的细节，它基于项目的配置动态产生，而 Google 在 Android Gradle 插件更新的过程中不断修改它。这也使得该问题在不同版本的 Android 插件上出现。

因此，Google 需要采取行动了，而他们给出的解决方案是 - Transition API - 允许开发者添加 Transformer 的简单 API - 在构建过程中会在合适的时间被调用的类。该 API 的输入是 Java 字节码，它允许插件开发者使用更可靠的方式操作字节码，并停止使用没有文档的私有 API。

##Jack & Jill
与此同时，另一群 Googler 开发者正忙着开发新的，振奋人心的工具 - Jack&Jill！

Jack - 是与 javac 类似的编译器，但它完成的工作和 javac 稍微有些不同：

![](http://trickyandroid.com/content/images/2016/03/jack1.png)

如你所见，Jack 直接将 Java 代码编译为 Dex 文件！如果我们没有中间的 *.class 文件需要编译，就不需要使用 dx 工具了！

但如果我的项目使用了第三方库呢（里面包含了许多 .class 文件）？

别慌，还有 Jill 呢：

![](http://trickyandroid.com/content/images/2016/03/jyll2.png)

Jill 能处理类文件，并将它们转换为 Jack 编译器能接受的特定的输入格式 Jayce。

那引入 Jack&Jill 后，我们喜欢使用的插件会怎样呢？它们都需要 .class 文件，但 Jack 编译器又没有这些文件……

幸运的是，Jack 提供了其他的特性一定程度上解决了这些问题：

但下面的问题还是需要注意的：

- Jack 不支持 Transform API - 由于没有中间 Java 字节码可以修改，所以我没有提到的插件都不能使用。
- Jack 现在不支持注解的处理，所以如果你的项目重度依赖类似 Dagger，AutoValue，等等第三方库的话，使用 Jack 是你值得再三深思的问题。EDIT：正如 Jake Wharton 指出，Jack 在 Android N Preview 版本支持注解的处理，但该特性还不能在 Gradle 上使用。
- 能在 Java 字节码层次操作的 Lint 检测器不被支持。Jack 现在效率比 javac + dx 要慢。但我发现 Jacoco 也有些问题（因为它的工作没有和你的期望一致），所以没有它也没有问题。
- Dexguard - 企业级 Proguard 现在还不支持

我认识到我刚刚提到的问题都是暂时的，Google 也在努力标记、解决这些问题，但不幸的是，当 Android 开发者开始认识到将项目使用的工具链切换为新的工具链需要的开销有多大时，Android 支持 Java8 所有特性的兴奋会很快消失。

Jack 确实是 Android 开发新的一页，它给 Google 的构建管道提供了更多的控制和可伸缩性，但同时它要想在 Android 开发者中获得名气，还有很长的一段路要走。

1. AAR 准确来说不仅仅是 JAR - 它还包含了 Android 相关的数据，例如 assets, 资源, 和其他 JAR 不支持的数据

2. 运行在最新的 Android N 设备上的 Android VM 支持部分 Java8 的指令

3. Jack&Jill 的[图片来源在这](http://betterthanvoodoo.com/2011/11/14/reviewing-the-reviews-armond-white-loves-jack-jill/)