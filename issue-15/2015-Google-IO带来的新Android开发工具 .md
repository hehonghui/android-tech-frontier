2015 Google IO带来的新 Android 开发工具
---

> * 原文链接 : [Google I/O Summary: What’s new in Android Development Tools](http://robovm.com/google-io-summary-whats-new-in-android-development-tools/)
* 原文作者 : [Mario Zechner](http://robovm.com/author/mario/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [ReonDz](http://reondz.github.io/) 

每年我们都非常期待 Youtube 中Google IO上那些关于 Android 的精彩讲解。然而，观看这些视频太耗费时间了。因此我们做了撰写了总结性的文字，来介绍这次的 Google IO 带来了哪些新的 Android 开发工具。（[对应的讲演视频](https://www.youtube.com/watch?v=f7ihSQ44WO0)）

##  便于设计

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 10.18.10-OI2RFWPbn6.png)  

Android Design Support Library 帮助我们遵循最新的最杰出的 material design 特性。这个库还附带了好几个 material design 组件诸如 navigation drawer, [floating labels for editing text](http://arjunu.com/2015/05/floating-labels-for-edittext/)(这个简单来说就是edittext 在获得焦点后，hint 会有个上升动画变成一个放置在 edittext上方的 textview 作为 label)，floating action buttons(Android L时代推出的产物，总算有了官方的低版本兼容支持)以及 支持Android 2.1及其以上版本的snackbar。   

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 10.24.57-nwuvL0kS8W.png) 

Android L 介绍了对 vector drawables 的支持。而通过 Android Studio 1.3+给 Android Gradle plugin 带来的新功能，我们可以让编译打包系统通过 开发者提供的SVG图 或者 vector drawables 生成不同 dpi 的光栅图。   
最后，整个开发团队开始重写了所有的可视化设计编辑器。从而支持开发者所见即所得的编辑与设计而不是被 XML 文件搞的无比心烦。下面会有更详细的内容。   

##  提升 Gradle 插件以及编译打包系统   

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 10.30.01-Grz81dvubp.png)

Android Gradle plugin  有的时候给人一种靠不住的感觉，特别是它的依赖管理。处理测试依赖时一些极端情况带来的问题现在已经被修复。同样，可选依赖 Gradle 还没有做到真正的支持。然而在 Android Gradle plugin 上已经解决了这一问题。      

开发者对 Android Gradle plugin 抱怨最多的就是它居高不下的打包消耗时间了。开发团队从多个层级入手追踪这个问题。       

[Jack](http://tools.android.com/tech-docs/jackandjill) , Java Android Compiler Kit 的缩写，可以将 Java 源码直接编译并转换为 Dex 文件。Jack 基于 Eclipse Java 编译器。缩减了打 Dex 之前把 Java 源码编译成 JVM 字节码的步骤。 额外的，Jack 还支持增量编译打包。     

缩减 PNG 图片是另外一个考虑来缩减打包时间的步骤。开发团队提高了它的性能，将500张 PNG 图片和.9 图的缩减时间从 4秒 降低到了 400ms。     

aapt, 打包应用的dex 和 资源文件的工具同样得到了提升。     

另外一个影响打包时间的因素是 Gradle 本身的巨大开销。当 Gradle 开始它的打包任务时，它必须先创建描述模型比如 variant (flavor + build type)，解决所有 variants 的依赖关系（即使你只有一个）以及执行开发者自定义的逻辑。开发团队和 Gradle Ware 紧密合作工作从而提高这些步骤的性能。以下是最后的结果：   

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 10.42.57-cl8MWwzzYC.png)

这还没完。目前开发者团队正在为了一个新的  Android Gradle plugin 而工作, 它基于 Gradle Ware 正在研发的新API  。而这些新的 API 允许这些模型被 Gradle 直接管理，从而可以做诸如缓存，并发以及增量构建这些事。下面是尚未完成的新 Android Gradle plugin 的结果数据：

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 10.46.01-KoHuJyeq0F.png)

以上的数据并没有算上用上缓存的带来的提升，目前缓存的特性还没有提供出来。新插件有一个小瑕疵，因为它使用了全新的 DSL 所以无法做到完全的向后兼容。新插件的预览版会在几周内开放，最后的正式版会在今年晚一点的时候开放。   

开发者团队还介绍了一个新的东西，叫做 [Data Binding Library](https://developer.android.com/tools/data-binding/guide.html)。这个库需要编译构建系统的支持，因为它会通过XML中特殊声明的一些代码去生成对应的 Java 代码。老版本和新版本的 Android Gradle plugin 都能支持它。下面会有更详细的内容。   

最后，我们实现了对 NDK C以及C++完整的支持。这是基于Gradle native 代码的支持，所以只会在新版本中提供，它重写了Android Gradle plugin。NDK支持也带入到了Android Studio中，同时还打包了[CLion](https://www.jetbrains.com/clion/)（JetBrain旗下的C,C++ IDE）, 并免费提供。下面会有更详细的内容。   

## 测试有关   

![image](http://7xiegl.com1.z0.glb.clouddn.com/testing_device.jpeg)  

今年Android 测试最大的亮点便是最近公布的 [Cloud Test Lab](https://developers.google.com/cloud-test-lab/) 。它可以帮助开发者使用 Google 测试云平台上的虚拟设备以及真机设备测试他们开发的应用。无论是虚拟设备还是真机设备，测试实验室(test lab)都支持机器爬虫遍历应用而不需要手动的去写测试用例。就当作是有一只猴子在各种设备上玩你的应用吧=w=。当然，你还是可以自己写测试用例的。     

到目前为止，单元测试主要还是用于跑在 JVM 上老的Junit 测试。虽然那样可以提高测试的迭代速度，但是它并不能测试到 Android 中一些特定的代码，若没有类似的Android 库的支持的话（Roboelectric就是为此而生的）。      

为了支持在虚拟机或者设备上的集成测试，开发团队增加了对外部测试工程的支持。他们就在你的应用程序工程边上，引用它以及它的依赖然后进行集成测试。   

## 模拟器

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.03.20-c1DKPt2w8Y.png)

并没有大的进展。开发团队主要工作集中在稳定性，正确性以及配置上。 Android Studio 会下载安装 [HAXM](https://01.org/zh/android-ia/q-and-a/what-haxm)（Intel 为 Android x86平台提供的硬件加速执行管理器） 并且为你配置好它。同时，还有大量的用于OpenGL ES 模拟器的提升，相信它会给开发者带来更好的更接近于真机的模拟器表现。[指纹识别支持](http://www.droid-life.com/2015/05/28/google-announces-native-fingerprint-support-in-android-m/)以及一个特殊的 [Android Auto](http://www.android.com/auto/) 模拟器也已有提供。  

##Android Studio对C以及C++的支持

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.13.41-NPAwYYVN8B.png)

除了在打包系统中集成了 NDK 的支持，开发团队还与 [JetBrains](http://robovm.com/google-io-summary-whats-new-in-android-development-tools/jetbrains.comhttp://robovm.com/google-io-summary-whats-new-in-android-development-tools/jetbrains.com) 合作，将他们新的C/C++ IDE [CLion](https://www.jetbrains.com/clion/) 直接集成在了Android Studio 。并且这一切都是免费的。     

这次结合满足了你对一个 JetBrains的产品抱有的所有期待: 强大的重构能力，代码分析工具，代码导航，语义查询代码用例遗迹更多的特性。除此以外，还有两个能改变游戏规则的重量级功能来给native 层的开发带来便捷。     

Android Studio 现在支持使用 [GDB](http://www.gnu.org/software/gdb/) 或者 [LLDB](http://lldb.llvm.org/) 来debug代码。Debug native 的代码在以前是一件非常麻烦的事情，而现在，耳目一新的感觉吧？      

更为称道的消息是 C/C++代码 和 Java/JNI 代码的紧密融合。为了让 C/C++ 代码可以与 Java 代码相互调用。你需要为它们创建连接的桥梁。这便要通过 Java Native Interface（即JNI来实现），本质上就是一个可以让我们从Java 代码调用 C/C++代码的 C/C++ API，反之亦然。你可以在声明 Java 方法时，带上 native 的 修饰词，这样就意味着该方法是在C/C++ 层面去实现的。而对应的方法则需要按照严格的规范命名，并规定管理好传参的规则。    

而现在， Android Studio 帮助你用简单的方式完成以上所有工作。你可以在 Java 层声明好方法，然后 Android Studio 就会自动的帮你生成 JNI 代码。还包括了一些预定义类型的处理，比如 string，arrays。更令人印象深刻的是， 重构以及查找用例都如你所想要的可以使用。在某个文件上做重构，另外一侧的文件也会被修改到。    

JNI 层的开发依然十分烦杂，但这些改变可以让它变得好受一点。   

## 新支持的Annotations

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.15.21-WL33x5ckez.png) 

Java annotations（注解，即使@后面的那个）可以让开发者在编译期以及运行时做一些神奇的事情。开发者团队新增了13个 annotations 来帮助开发者避免一些特定类型的 bug 。    

举个例子，@WorkerThread 这个 annotation, 带有该 annotation 的方法会自动检查该方法中是否有代码职能在UI线程上执行的。Android Studio 会高亮出类似错误，比如设置一个按钮的文字，在一个worker 线程执行了。 开发团队已经将很多 Android 运行库中的方法标记了该 annotation 所以开发者并不需要自己去动手添加。   
  

另外一个例子就是@RequiresPermission。和@WorkerThread 一样，大多数的Android 运行库方法已经被注解过了。这是防止开发者使用了一个需要特定权限的API，但是却没有在 manifest 文件中声明权限，Android Studio 会弹框告诉你问题并为你提供插入对应权限的选项。在 Android M 中，权限管理有一定的修改，用户可以在应用运行时决定给予或禁止一些权限。这就意味着，你的应用需要处理无权限的情况。对于这种情况，Android Studio 也会自动的插入处理代码的框架。        

还有一些 annotations 是用于 debug 中将标志值对应标志名的问题，或者识别 编码过的颜色，资源或者view id的问题。   

这个讲解新 annotations 的文档目前还没有完全完工，你应该可以很快在[这里](https://developer.android.com/reference/android/support/annotation/package-summary.html)看到它们。

## 数据绑定

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.25.52-zEtMZXmuok.png)

当开发UI界面时，通常会将布局和视图从代码中分离到 xml 文件中然后写一些简单Java 对象(POJOs) 以及 一些 Java 代码。例如使用 findViewById() 在布局被加载后去获取对应的UI 视图的对象。   

Data Binding 库可以帮助开发者更简单的完成工作。不需要手动的去处理数据和视图的合作，而是声明一些简单的对象，通过一系列简单对象引用一些值并且在 布局 XML 文件中去监听这些值。这个很像 .NET里[XAML](https://msdn.microsoft.com/en-us/library/ms752059%28v=vs.110%29.aspx)的做法。    

为了调解 Java 类和布局 xml 文件，编译打包系统会编译期生成一个捆绑 Java 类。这个可以帮助开发者debug 调试问题。   
   

你还可以将这变成一个双向的过程，通过让你的简单 Java 对象实现 android.databings.Observable 接口，改变简单对象的值会 影响 UI展现，反之亦然。（setText 后，bind的值也会变化的意思）   

data binding 库目前还处于 beta 阶段，需要 Android Studio 1.3.0-beta1 以及最新的Android Gradle plugin.
点击[这里](https://developer.android.com/tools/data-binding/guide.html)查看更多信息。   

## 分析工具

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.34.27-cSn9mmzu7x.png)   

内存和性能分析工具得到了全面的改变。现在你可以在Android Studio中通过简单的图形界面操作直接获取并保存堆栈以及方法调用情况(method traces)的快照并且找出问题原因了。新的分析工具还具备了可视化视图查询的功能。你再也不需要手动的去转换 [HPROF](http://docs.oracle.com/javase/7/docs/technotes/samples/hprof.html) 文件了。   

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.37.27-Mz8F5wmRnK.png)

新的内存快照具备简洁明了的向下钻能力（drill down我理解是一层一层的点下去。。）。它提供了对象调试视图，从而让你可以查看到还在堆内存中的对象们。它还允许你顺着引用链一直找到最近的GC 节点从而轻松的找到是什么被持有住了。   

## 开发者服务

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.39.04-fWLlwnIlHC.png)

Google 提供了广告，数据分析等服务。而如今 Android Studio 1.3 可以帮助你通过一系列定制 UI 更容易的使用这些服务，比如API Keys等。这个新功能同样会帮助添加所需要的依赖，权限以及模版类从而可以花最少的时间使用这些服务。   

## 即将发布的新功能

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.41.57-iWXIUx6z6S.png) 

新的可视化设计视图暂时还没有被集入到Android Studio 1.3中。尽管如此，它们还是非常令人兴奋的，因为可以为开发者减轻创建UI界面的负担。   
上面的截图展示了新的主题编辑器。它让你可以可视化的检查以及修改主题文件。它还可以展示使用该主题的控件的预览。   


![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.46.16-xrH2DGgL94.png)

而布局编辑器则被完全的重写，多了很多新功能。上述截图展示了蓝图模式，这可以让你专注于你的布局，字体风格等。它还与设计库集成，从而可以通过拖拉直接添加设计元素到布局中。   

![image](http://7xiegl.com1.z0.glb.clouddn.com/Screen Shot 2015-05-30 at 11.48.28-98HlY6FuwA.png)

而 XML 文件预览模式现在有能力展示系统Preference了(以前是无法预览Preference的)。更重要的一个功能是完全的对布局文件预览窗口直接操作的所见即所得编辑，包括一些控件的拖动。   


## Q&A 

很不幸，Q&A环节十分的短暂。而在其中最有意思的问题是 Android 什么时候支持 Java 8。而回答则是，“这是一个平台性问题”("that's a platform issue")。   





