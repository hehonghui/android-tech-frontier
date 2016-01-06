Android逆向工程101 – Part 2
---

> * 原文链接 : [Android Reverse Engineering 101 – Part 2](http://www.fasteque.com/android-reverse-engineering-101-part-2/)
* 原文作者 : [Daniele Altomare](http://www.fasteque.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/MiJack) 
* 校对者: 
* 状态 :  已翻译


在这个系列的[第一篇文章](http://www.fasteque.com/android-reverse-engineering-101-part-1/) 中，我们已经探讨过了**APK**和**AAR** 组件的组成格式.

正如之前所提到的，Google Play商店中可用的应用（或者几乎装在你手机上的所有的应用）都是一个apk文件。在第二部分，我们告诉你如何使用 **aapt** 读取apk中与value部分有关的信息。

###AAPT

如果你安装了Android SDK，那么你就有**aapt**了。事实上，“**Android Asset Packaging Tool**”是android 构建工具中的一部分，你可以在以下路径中找到它，例如：

`ANDROID_SDK_HOME/build-tools/23.0.2`

请注意，你会发现编译工具的每个版本都会有一个单独的文件夹：当你使用 Android SDK Manager去安装新版本的Build tools的时候，现有的版本并没有被覆盖，而是为其单独创建文件夹。这让你可以在不同版本的工具之间切换。

在使用Android Studio的时候，你一定记得在model对应的`build.gradle`脚本文件中设置Build Tools的版本。

这个工具是Android构建系统中的一部分，它允许您查看、创建和更改ZIP兼容文件（例如zip，jar，APK）。它还可以将资源编译成二进制资源。

Details about how the Android Build System works are beyond this article, but **aapt** is mainly used in the process to:

关于Android构建过程的具体细节不在本文的讨论范围之内，但是，你需要知道**aapt**主要有以下几个作用：

- 生成**R.java**文件，这样是对资源文件的初步处理
- 将Android manifest、资源、assets等装入**APK**文件
- Add to the **APK** file the compiled classes, which have been already converted to the dex format by the **dx** tool.
- 编译class，使用**dx**工具将其转化成dex，添加到**APK**文件中。
更为详细的构建过程请看[官方文档](http://developer.android.com/sdk/installing/studio-build.html ).

同时，**aapt**还可以用来从一个apk文件提取一些信息。


If you would like to try the same commands, you just need to get one APK file as I have already explained in the [first article](http://www.fasteque.com/android-reverse-engineering-101-part-1/).

如果你还想尝试那些命令，你可以使用我在[第一篇](http://www.fasteque.com/android-reverse-engineering-101-part-1/)中提供的apk文件。


###PACKAGE CONTENT

获取**apk**文件中的文件清单，只需要如下简单的指令：

`aapt list FILENAME.apk`

在其后面添加 `-v`，你将知道更多关于上述文件的信息，例如文件的大小，创建的日期时间，CRC-32循环冗余校验码等。

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-14.11.53-1024x410.png)
aapt list -v
###PACKAGE DETAILS

使用`dump`指令，你可以找到更为详细的信息。

添加`badging`选项，会打印更多信息，如包名称、版本名称、版本号、权限、支持屏幕、启动时的`Activity`、应用程序名称和图标文件，…

`aapt dump badging FILENAME.apk`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-14.26.44.png)
![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-14.28.04-1024x234.png)
`aapt dump badging`
 
`permissions` 选项可以打印（和Android manifest文件中的包名称对应）应用所需的权限。请注意，只有在清单中显式声明的权限才会被列出来。例如，
`android.permission.WRITE_EXTERNAL_STORAGE`隐式要求权限`android.permission.READ_EXTERNAL_STORAGE`，但是该权限却不会出现在列表中。
`aapt dump permissions FILENAME.apk`
![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-14.38.35-1024x87.png)
`aapt dump permissions`
 
`configurations` 选项会打印出apk的configurations:

`aapt dump configurations FILENAME.apk`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-16.50.59-1024x300.png)
`aapt dump configurations`
 

`resources`指令会打印出APK文件的resource table 。
因此，你所得到的将是应用引用的所有资源列表，包括attributes, strings, dimens, layouts, styles, menus, drawables, …

您还可以从应用的依赖库得到对应的资源：例如，如果` appcompat-v7 `是项目中的一个依赖，那么他的资源也会被列出来。

`aapt dump resources FILENAME.apk`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-16.54.30-1024x425.png)
`aapt dump resources`

最后一个命令` xmltree `，他十分有用：它可以打印出asset中编译好的xml文件。正如我在第一篇文章所提到的，xml文件是以二进制文件的形式被打包到apk文件中。所以你不能使用编辑器或者阅读器把它打开。但是，使用这个命令，你至少读起来更容易一些。

`aapt dump xmltree FILENAME.apk RESOURCE.xml`
![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-14-at-17.07.31-1024x398.png)
`aapt dump xmltree`


这就是**aapt**中比较重要的命令，但是，我觉得你还是有必要去看看所有的参数。

正如你所看到的，使用这些简单的命令，就可以获取应用程序的一些细节信息，但它只是只读的，而你不能改变任何东西的apk文件。
在这篇文章中，我原本打算提过一下** dex2jar **以及如何使用它来反编译Android应用程序，但现在看有很多信息需要整理消化，所以这是顺延到下一个[博客](http://www.fasteque.com/android-reverse-engineering-101-part-3/).