Android逆向工程-第三部分
---

> * 原文链接 : [Android Reverse Engineering 101 – Part 3](http://www.fasteque.com/android-reverse-engineering-101-part-3/)
* 原文作者 : [Daniele Altomare](http://www.fasteque.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [mr_dsw](https://github.com/dengshiwei) 
* 校对者: [Desmond Yao](https://github.com/desmond1121)  
* 状态 : 完成 

这个系列的头两篇文章中，我写了两篇关于[APK format](http://www.fasteque.com/android-reverse-engineering-101-part-1/)和[aapt tool](http://www.fasteque.com/android-reverse-engineering-101-part-2/)的文章.

在这篇文章中我将重点讲述dex2jar，它是一个作用于Android .dex文件和Java .class文件的工具。已经有一些参照文章，但是你可以点击[这里](https://github.com/pxb1988/dex2jar)进入官方网站。

正如你所期望的那样，这个工具的核心功能就是转换APK的classes.dex文件为classes.jar文件（或任何你选择的工程），反之亦然。所以使用任何Java反编译工具来查看Android应用的源代码是可能的。

你从.class文件中得到的是什么，不要期望得到应用程序开发者所写的Java源代码，然后，正如稍后你所看到的，这些源代码是完全可以获得来阅读查看的。

**安装**

为了得到最新的可用版本，请到官方的[repositories](https://bitbucket.org/pxb1988/dex2jar/downloads)下载。

安装进程非常简单：你只需要将这个安装包解压到你指定的文件夹同时添加这个路径到你的path环境变量下。这样，你就可以开始使用dex2jar！

注：您需要文件夹包含脚本文件的执行权限。

在写这篇文章时，dex2jar最新稳定的版本是2.0，因此，文本中使用的是最新的版本。

	version: reader-2.0, translator-2.0, ir-2.0

在挖掘dex2jar工具的核心功能之前，你如果仔细看了下dex2jar文件夹的内容，你能注意到一些可运行脚本（Unix/Mac和Windows系统版本)。这是因为dex2jar工具的每个核心功能通过分开的脚本提供，我认为这是一个很好的解决方案，所以你不需要为了一次执行传递太多的参数。

![dex2jar folder](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-17-at-13.52.43.png)

现在让我们转移到dex2jar工具的核心功能上：转换DEX classes文件为JAR文件。

如果你阅读了[这个系列的第一篇文章](http://www.fasteque.com/android-reverse-engineering-101-part-1/)，你知道一个APK文件中可执行代码以dex格式存在，它被定义为Android字节码格式文件。当然，为了分析一个应用程序最好是能有一个容易阅读的代码格式，这就是dex2jar能帮助你的。

在使用第一个命令之前，我们需要选择从Google Play Store上选择一个应用同时安装一个反编译工具来查看源码（另一方面我们获得是.class文件不是.java文件）。

* [RGB Tool](https://play.google.com/store/apps/details?id=com.fastebro.androidrgbtool): 这是一个开源项目, 所以逆向工程反编译它没问题. 你可以在[这里](https://apkpure.com/rgb-tool/com.fastebro.androidrgbtool)获取APK安装文件。
* [JD-GUI](http://jd.benow.ca/): 一个带UI界面的Java反编译工具。

我们即将测试的第一个命令，让你提取应用程序的可执行代码转换为JAR格式：

	d2j-dex2jar.sh -f -o classes.jar FILENAME.apk

使用-o选项，可以让你指定这个命令的输出文件名称，同时-f选项告诉dex2jar如果文件存在就进行覆写。

![dex2jar](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-17-at-22.16.35.png)

如果你通过JD-GUI打开输出的文件，你可以看到应用程序的源代码，这次，你看到的并不是完全的Java类文件，但是它足够清楚地阅读。带下划线的项是可点击的，所以向导指引代码很容易。

![JD-GUI](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-17-at-22.34.47.png)

**源代码在哪里？**

如果你仔细的看截图，你会注意到用数字替换资源名称，如R.id.SOMETHING, R.layout.SOMETHING, … 。正如[官方文档说明](http://developer.android.com/guide/topics/resources/accessing-resources.html)这些是资源文件在R.java文件中对应的所有的id、layout、drawable等索引。这些文件在编译的时候自动生成(不允许修改，自动生成！)，同时可以在你项目的.../build/generated/source/r/...文件夹下找到。本质上它是一个final class类，同时它为每个资源类型文件定义static final class内部类，例如strings, layouts, arrays, colors, dimens, …，同时为每个资源类型定义static final类型的int field（字段），即你的资源文件的IDS。这样，在实现应用程序的时候，你不必直接处理数字。

![screen-shot](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-21-at-11.37.18.png)

IDS被存储为16进制数，因此通过dex2jar文件的getStringArray方法（你可以在上面的截图中看到）提取出0x7f080000 ( 原始应用程序源代码中R.array.pick_color_array的资源文件)是2131230720 (decimal)

**混淆代码**

我选择这个应用程序是因为我知道它的代码已经通过[ProGuard](http://proguard.sourceforge.net/)进行混淆了。你能清楚地看到几个包和类的名称为a,b,c...

在下面的截图中，它是ProGuard所做工作的的见证，ProGuard改变了方法和变量的名称来混乱代码的连贯性。然而，代码仍然是可读的同时它不是特别难找到和理解特定的算法或业务逻辑。

当让，并不是所有的类都被混淆了，这是依靠声明在ProGuard配置文件中的特定的规则，例如这个例子的应用程序，你可以在GitHub的[这里](https://github.com/fasteque/rgb-tool/blob/master/android-rgb-tool/proguard-rules.txt)找到它。

![obfuse](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-17-at-22.46.30.png)

**内存溢出错误**

当前的文档没有更新关于这个话题的，反正它是可能的，当转换DEX文件为JAR或viceversa，会得到OutOfMemoryError问题：就像你正在试图转换一个很大的dex文件。

为了防止这个问题，你需要增加JVM的内存大小，你必须打开d2j_invoke脚本同时找到下面的一段话：

	java -Xms512m -Xmx1024m -classpath "${_classpath}" "$@"

根据你的系统和需求改变这个值，就我个人而言，我只需要改变内存池的大小，如：-Xmx2048m。

**回到DEX**

dex2jar也支持从.class文件到.dex文件的转换，这是非常有趣的，因为它让可执行代码从新打包到apk文件中成为可能。

具体的指令是：

	d2j-jar2dex.sh -f -o classes.dex classes.jar

使用-o选项，你可以通过指令指定输出的名称，同时-f告知dex2jar如果文件存在则重写文件。

![upload](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-19-at-22.03.18.png)

apk文件本质上是一个ZIP文件，所以新的DEX文件可以插入后很容易：

	zip -r FILENAME.apk classes.dex	

记得这个操作会改变原始的APK文件，所以你不能简单地将它安装在您的设备，你得使用Jarsigner重新为APK签名为了再生manifest.mf文件。这是一种不改变应用程序的安全保障：如果你这样做，你要放弃这个包，因为没有原来应用程序的密钥库和私钥，你更改后的APK不能作为原来APK的一个更新发布。

当系统安装更新到一个应用程序时，它将与现有版本中的新版本的证书进行比较。如果证书匹配，该系统允许更新。

**SMALI**

来自[官方文档](https://github.com/JesusFreke/smali):

> smali/baksmali是dex文件的assembler/disassembler程序，通过dalvik，Android’s Java VM实现。语法是基于松散的Jasmin’s/dedexer的语法，并支持对dex格式的全部功能（annotations, debug info, line info, etc.）。

详细的细节讲解超出了本文的范围，但是我想让你至少知道smali和baksmali，只是想让你知道直接从classes.dex文件中获取.smali是可能的。

这意味着可以直接更改应用程序的源代码并使其生效。

指令非常简单：

	d2j-dex2smali.sh FILENAME.apk

![download](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-20-at-16.40.39.png)

这个工具创建了一个新的文件夹，通过为APK名称新增后缀-out来命名，文件内部通过包名组织。

有一个想法，就是smali看起来像这样：它不是那么难读，一旦你习惯了它的语法是完全可以理解的。

请注意这是一个a.class类文件，我已经发布了截图上面，当谈到混淆代码。

![afused](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-20-at-22.35.28.png)

apktool 同样可以操纵smali文件:我将在这个系列的下篇文章中介绍。

这是所有在更新和dex2jar介绍：正如你所看到的，一个相对简单易用的工具，你已经可以从APK文件中提取（可能回退）大量信息。但该工具缺乏对XML资源的支持，它们是任何安卓应用程序的重要组成部分。

在[下篇文章中](http://www.fasteque.com/android-reverse-engineering-101-part-4/)，我将向你介绍apktool同时也有些事情变得真的很有趣。