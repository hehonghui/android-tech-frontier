Android逆向工程101 – Part 5
---

> * 原文链接 : [Android Reverse Engineering 101 – Part 5](http://www.fasteque.com/android-reverse-engineering-101-part-5/)
* 原文作者 : [Daniele Altomare](http://www.fasteque.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/MiJack)
* 校对者:
* 状态 :  已翻译

到目前为止,在之前关于Android逆向工程的介绍中，我们已经知道了[APK文件的格式](http://www.fasteque.com/android-reverse-engineering-101-part-1/),如何使用使用[AAPT](http://www.fasteque.com/android-reverse-engineering-101-part-2/)提取应用程序中和Android SDK相关的有用信息，如何[将DEX字节码转化成更具可读性、易于编辑的格式](http://www.fasteque.com/android-reverse-engineering-101-part-3/)以及如何[反编译和修改Android应用程序的源代码和资源](http://www.fasteque.com/android-reverse-engineering-101-part-4/)。

本文是这个系列的最后一篇文章，我们将介绍[**Androguard**](https://github.com/androguard/androguard)，一个可以处理Android文件的python工具

根据官网的介绍，**Androguard** 可以做以下几件事：

>* DEX, ODEX
>* APK
>* Android二进制格式的xml文件
>* Android 资源
>* 反汇编 DEX/ODEX 字节码
>* DEX/ODEX文件的反编译

Androguard的功能是相当出色的，Github上的介绍并不完整，可以在[这里](https://code.google.com/p/androguard/#Features)找到更为全面的介绍。

**Androguard** 可用于Linux，OS X,Windows等平台

## 安装

在[项目以前的主页](https://code.google.com/p/androguard/wiki/Installation)，详细介绍了安装过程，而GitHub上的文档不提供任何更新的信息。

需要注意的是我们的机器上要安装了Python（`2.6`或更高版本），这用于反编译/反汇编APK文件。对于更高级的功能，它是需要安装其它模块：在安装页面上，我们可以找到关于各模块的需要的简要说明。

注意在**Androguard**文件夹中运行如下命令：

`sudo python setup.py install`

在安装好以后，我们可以直接在 **Androguard** 的主文件夹下运行这些工具。

如果机器的操作系统是Windows，建议在 **ARE**-Android Reverse Engineering virtual machine(还包含有其他的逆向工程工具) 上运行 **Androguard**:关于程序的下载和安装相关介绍可以在官方[wiki](https://redmine.honeynet.org/projects/are/wiki)页面找到。我们只需要使用[VirtualBox](https://www.virtualbox.org/)运行这个镜像就行了。

文章中所有的例子使用的 **Androguard** 的版本都是 `2.0` 。它可以在[这里](https://github.com/androguard/androguard/releases/tag/v2.0)直接下载，也可以在[stable releases页面](https://github.com/androguard/androguard/releases)中选择另一个版本。

要做的第一件事，就是检查我们的安装是否正常，所以让我们需要加入 **Androguard** 的主文件夹，然后输入以下命令：

`androlyze.py -s`

我们将看到下面这个输出：

  ![](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-04-at-18.14.40.png)

这是一个交互式的命令行，正在等待输入.

在分析时，我们需要设置apk文件以及反编译的类型。事实上，有3个不同的反编译类型：**DAD** ，**DED** 和 **dex2jar** + **JED**。具体介绍请看[这里](https://code.google.com/p/androguard/wiki/Decompiler)。在下面的例子中，我们使用的是DAD，因为它是默认的反编译类型，所以无需额外的配置。

`a,d,dx = AnalyzeAPK("FILENAME.apk", decompiler="dad")``

![](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-04-at-18.30.51.png?resize=1024%2C118)

反编译一个程序的时间取决于具体的apk文件：当程序完成后，我们就可以根据提示运行其他命令。

现在，我们可以输入`a.`，然后按下TAB键，我们可以得到APK相关的自动补全提示。

我们先用一些简单的命令来获得APK文件中的一些有用信息吧。

## APK 文件

它可以列出APK文件(其本质上是一个ZIP文件)中包含的所有文件：

`a.get_files()`

![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-14.52.30.png?resize=1024%2C587)

## Application Activities

使用如下命令，我们可以得到应用中包含的所有Activity：

`a.get_activities()`

## Application 的权限

使用如下的命令，我们可以得到应用在manifest文件中声明的所有权限：

`a.get_permissions()`

![](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-14.47.29.png)

它也可以得到关于每一项权限的详细描述：

`a.get_requested_aosp_permissions_details()`
![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-15.09.31.png)


**Androguard** 的一个重要的特征就是可以找到应用程序的哪些代码请求了在manifest文件中声明的权限。

它可以帮助我们做一下几件事：

* 知道我们是否忘记了需要在manifest文件声明的权限
* 知道我们是否在manifest文件中声明了多余的权限
* 帮助我们review使用到权限的代码片段，再次确认我们可能遗漏的注解。

`show_Permissions(dx)`
![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-17.09.55.png)

## Application Content providers

使用如下的命令，我们可以得到应用在manifest文件中声明的所有Content Provider：

`a.get_providers()`
![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-14.42.07.png)

## Application signature

同时，我们也可以知道apk文件的签名以及其存放的位置：

`a.get_signature_name()`

`a.get_signature()`

[这里](http://doc.androguard.re/html/index.html)是目前最为完整的命令列表的文档：它的版本是`1.9`，不管怎么说，它都是一个很好的参考文档。


## Code dumping

使用工具 **androdd**，我们可以得到APK文件中所有类的源代码（整理包括应用的代码和依赖）：在这种情况下，我们得到的是Java类，而不是我们使用[dex2jar](HTTP：//www.fasteque.com/android-reverse-engineering-101-part-3/)得到的`.class`文件。

`androdd.py -i FILENAME.apk -o OUTPUT_DIR`
![](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-15.44.22.png?resize=1024%2C430)

在输入文件中，我们可以根据包名找到对应的Java类。

当然，我们得到的代码可能和之前开发者写的代码不完全一样，但无论如何，它的可读性提高了，更容易理解。请记住，如果原来的应用程序代码已经被混淆，方法和类的名称可能已被重命名，工具不能得到原来的名称。

例如，下面是我们的一个Fragment：源代码可以在[这里](https://github.com/fasteque/rgb-tool/blob/master/android-rgb-tool/src/main/java/com/fastebro/androidrgbtool/fragments/SelectPictureDialogFragment.java)找到.

![](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-15.52.47.png?resize=1024%2C390)

正如在本系列中之前的介绍中，我们知道，我们无法找到资源名称，如字符串，布局，数组，颜色，但是，我们可以得到的是一个整形值，在build的时候他和特定的资源相对应，并存储在`R.java`文件中。在这里，它表示为一个十进制值，而在原来的类文件是十六进制。

## XML manifest

使用下面的工具，我们可以得到manifest文件，在apk文件中，它是以二进制格式存在的。我们得到的是纯文本格式的xml文件，更容易阅读。

`androaxml.py -i FILENAME.apk -o OUTPUT.xml`

如果我们打开生成的XML文件，我们可以看到完整的APK manifest 文件，几乎和[原来文件](https://github.com/fasteque/rgb-tool/blob/master/android-rgb-tool/src/main/AndroidManifest.xml)一样。

![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-16.10.44.png)

## 比较两个apk文件

**Androguard** 还提供了一个重要的工具 **androsim** ，可以用于比较两个应用里的文件。这是一个重要的功能，因为我们可以将一个源程序和另一个程序比较，检测其是否有所改变，可以用于检测恶意软件。同时也可以查看同一应用程序的两个不同版本之间的差异。

`danielealtomare$ androsim.py -i FILENAME_1.apk FILENAME_2.apk -c ZLIB -n`


这是两个APK文件比较的输出结果:

![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-16.26.17.png)

以下是同一应用程序的两个不同版本的比较结果：

![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/12/Screen-Shot-2015-12-05-at-16.56.22.png)

`--help`可以得到可用于该工具的所有选项，因此这可以让分析更加精确，集中于应用程序的具体方面。

当然，**Androguard** 还可以做很多事情，但是，本文的目的只是简单介绍一下工具以及相关的实验和分析。

## MENTIONS

结束系列之前，还要介绍一些比较好的工具。

第一个是[Bytecode Viewer](https://bytecodeviewer.com/)，它实际上是一套完整的逆向工程工具：它使我们通过smali/baksmali轻松地编辑apk文件以及浏览APK和DEX文件。同时也集成了 **dex2jar** 和**Apktool**。更多信息可以查看[这里](https://the.bytecode.club/wiki/index.php?title=Bytecode_Viewer)。

第二个是[ClassyShark](https://github.com/google/android-classyshark)，这是为Android可执行文件设计的一个浏览器。它的客户端可以打开Android（APK）和桌面（JAR）文件。我们可以用ClassyShark打开APK/ ZIP/Class/Jar文件，并分析其内容。

这个系列就结束了：正如之前强调的，这只是简单介绍了Android的逆向工程以及一些工具的简单使用。当然，这只是逆向工程的冰山一角。对Android逆向工程的了解程度取决于我们的实际需要,所以,我们可能会发现一些更适合的工具。
