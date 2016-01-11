#Android逆向工程101 – Part 1
---

> * 原文链接 : [Android Reverse Engineering 101 – Part 1](http://www.fasteque.com/android-reverse-engineering-101-part-1/)
* 原文作者 : [Daniele Altomare](http://www.fasteque.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/MiJack) 
* 校对者: 
* 状态 :  已翻译


这篇文章是关于android应用逆向系列的第一片文章。

在这个系列里，我将讲解以下内容：**APK**、**AAR**的文件格式，一些常用的逆向工程和检测工具，**dex2jar**、 **AAPT**、**androguard**和 **apktool**。

[Part 1 – APK and AAR format](http://www.fasteque.com/android-reverse-engineering-101-part-1/)

[Part 2 – aapt](http://www.fasteque.com/android-reverse-engineering-101-part-2/)

[Part 3 – dex2jar](http://www.fasteque.com/android-reverse-engineering-101-part-3/)

[Part 4 – apktool](http://www.fasteque.com/android-reverse-engineering-101-part-4/)

[Part 5 – Androguard](http://www.fasteque.com/android-reverse-engineering-101-part-5/)

## 只有黑客使用吗？

很明显，答案是否定的。

如果你是一名开发者，在很多情况下，你需要hack应用或者向其中注入代码。

首先，应用中有一些你感兴趣的布局或者动画效果，使用这些工具你可以拿到对应的XML资源文件。

其次，你可以看看本人的应用是如何实现具体的业务逻辑的：这并不是抄袭他人的代码，而是通过学习可以可以提高你的编码水平或者得到一些有用的改进提示。

最后但并非最不重要的一点，它可以检查你的应用程序是否安全可靠，可以检查代码或资源被有效地混淆，或是不需要的文件没有被包装到最终apk。你会惊讶，别人可以知道居然有这么多的信息，例如API密钥信息，认证令牌或闲置资源等。

##APK 格式

你开发的应用将被打包成**APK**文件，你可以从谷歌获得Play商店或其他渠道找到它。换句话说，对于手机上的任何一个应用程序，有相应的APK文件（包括预装的应用程序也不例外）。

apk文件实际上也是一个zip文件，所以你拿到它以后，可以将其重命名，然后解压得到里面的文件。


|条目 |	说明|
|----|---|
|AndroidManifest.xml |  manifest的二进制文件|
|classes.dex|程序的代码将被编译成dex文件|
|resources.arsc	file|包含预编译的程序资源，二进制的xml格式|
|res/|文件夹中包括未被编译打包进入resources.arsc的资源|
|assets/	|可选的文件夹，包含应用的assets文件，由AssetManager进行检索|
|lib/|可选的文件夹,包含已编译的代码，例如jni的libraray|	
|META-INF/|文件夹中包含MANIFEST.MF 文件，APK的签名文件也在这个文件夹中|
![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-10-at-22.00.18.png)
APK里的文件

##什么是DEX?

简单讲，DEX/Dalvik执行文件是一种Android平台上的文件格式，里面包含编译好的代码，可以被Dalvik虚拟机或者[Android Runtime](https://source.android.com/devices/tech/dalvik/index.html) (ART)读取识别。

当一个APK文件是由Android编译系统产生的（就像当你在Android Studio 上运行你的应用）。首先，Java类会被编译成`.class`文件，后来，`DX `将在这些文件转换DEX格式。 DX是Android交叉编译器`Build Tools`的一部分，你可以在以下位置找到它：

`$ANDROID_SDK/build-tools`

关于DEX文件的详细信息请点击 [这里](https://source.android.com/devices/tech/dalvik/dex-format.html).

##如何得到apk文件

这里有以下几种方式：

- 如果你想随便找一个应用，可以使用[一些网站](https://apkpure.com/)，通过浏览器直接下载到你的桌面
- 如果应用已经装在你的手机上了，你可以使用备份软件，例如[这个](https://play.google.com/store/apps/details?id=mobi.infolife.appbackup)，然后把他拷贝到你的手机内存或者SD卡的公共文件夹
- 在`/system/app`文件夹中，你可以找到预装应用 ，例如calculator, Chrome, camera, … 这取决于你手机上的具体ROM。
- 在`/data/app`中，你可以找到用户安装的应用。为了从手机中导出apk，你想要使用命令行列出可用的应用(记住使用usb连接手机):

`adb shell pm list packages -f`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-19.24.57.png)

Having the path of the APK file, you can now pull it:

有了apk文件的路径，你就可以将其导出了：

`adb pull -p PATH/base.apk OUTPUT.apk`

`-p`选项可以展示传输文件的进度，如果导出文件的名称没有指定，默认会使用`base。apk`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-19.29.46.png)

`adb pull -p`

你可能对应用如何备份你的apk感到好奇：事实上，如果用手机上安装的文件管理系统去访问`/data/app`文件夹， 你会发现很多情况下是无法访问的。

但是，确实是可以通过编程方式访问用户安装应用的apk文件。

首先，您需要检索应用程序的列表：

```
final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null); 
mainIntent.addCategory(Intent.CATEGORY_LAUNCHER); 
 
List<ResolveInfo> infos = getPackageManager().queryIntentActivities(mainIntent, 0);
```

然后，通过`resolveinfo`，您可以访问`applicationinfo`类中的`publicsourcedir`字段，这是`SourceDir`中公开部分的完整路径，包括资源和manifest。


```
File apkFile = new File(pkgInfo.activityInfo.applicationInfo.publicSourceDir);
if(apkFile.exists()) {
    ...
}
```
##AAR 格式

**aar**包是一个Android Library 项目的二进制分发：例如，Android Support Library ，你可以使用此格式将其添加到你的应用程序中。另外，如果你的Android项目的发布形式是一个Library，而不是商店的应用程序，采用这种格式再好不过了。

aar文件实际上也是一个zip文件，所以你拿到它以后，可以将其重命名，然后解压得到里面的文件。

你可以在aar文件中找到以下内容：

|条目	|	必选|说明|
| -- | -- | -- |
|AndroidManifest.xml	|必须的|	manifest的XML源文件|
|classes.jar	|必须的|	Java classes打出的jar文件|
|res/	|必须的|	该文件夹用于存放使用到的资源|
|R.txt	|必须的|使用 aapt ``--output-text-symbols``的输出内容.它是library使用到的资源的清单 ( 包括strings, colors, dimens, attrs, layouts, ...). |
|assets/|	可选的|	存放assert资源文件的文件夹|
|libs/*.jar	|可选的|该文件夹用于存放library使用到的jar文件	|
|jni//*.so	|可选的|	该文件夹用于存放library使用到的jni文件|
|proguard.txt	|可选的|Proguard配置文件|
|lint.jar	|可选的|	自定义Lint规则.|
 

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-09-at-22.23.31.png)
AppCompat-v7 23.1.0 aar 的文件内容

aar和apk相比，唯一的区别是的`AndroidManifest.xml`和`res`文件夹下的XML文件，他们都是普通的XML，所以你可以很容易地打开它们。

请注意，例如，经常被我们作为项目依赖的Support Library是AAR的格式，您可以在以下路径找到他们：

`$ANDROID_SDK/extras/android/m2repository/com/android`

在本系列的其余部分，我将需要关注APK格式，因为装在手机上的应用就是这种格式的，也是这种格式分发到谷歌Play商店或其他渠道。

在下一篇文章中，我将介绍**aapt**和**dex2jar** 两个工具，你可以使用它们通过分析从apk文件中获取很多重要的信息。
