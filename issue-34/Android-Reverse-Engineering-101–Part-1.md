# Android Reverse Engineering 101 – Part 1
#Android逆向工程101 – Part 1

This is the first in a series of articles about reverse engineering Android applications.

这篇文章是关于android应用逆向系列的第一片文章。

In this series I will cover the anatomy of the **APK** and **AAR** package formats and few tools commonly used to reverse engineering or inspecting applications: **aapt**, **dex2jar**, **apktool** and **Androguard**.
在这个系列里，我将讲解以下内容：**APK**、**AAR**的文件格式，一些常用的逆向工程和检测工具，**dex2jar**、 **AAPT**、**androguard**和 **apktool**。

[Part 1 – APK and AAR format](http://www.fasteque.com/android-reverse-engineering-101-part-1/)

[Part 2 – aapt](http://www.fasteque.com/android-reverse-engineering-101-part-2/)

[Part 3 – dex2jar](http://www.fasteque.com/android-reverse-engineering-101-part-3/)

[Part 4 – apktool](http://www.fasteque.com/android-reverse-engineering-101-part-4/)

[Part 5 – Androguard](http://www.fasteque.com/android-reverse-engineering-101-part-5/)

##  Is this just for hackers?
## 只有黑客使用吗？

很明显，答案是否定的。
Short answer is no.

There are many reasons why you would take into consideration these tools besides trying to hack or inject malicious code into an application, specially if you are a developer.

如果你是一名开发者，在很多情况下，你需要hack应用或者向其中注入代码。

First, there may be an application with a particular layout or animation which you would like to replicate: using these tools you could access the XML resource files of interest.

首先，应用中有一些你感兴趣的布局或者动画效果，使用这些工具你可以拿到对应的XML资源文件。

Then, you may have a look at how specific business logic has been implemented by an application: it’s not a matter of stealing third-party software, but simply double check if you can improve your own code or get any useful hint for improvements.

其次，你可以看看本人的应用是如何实现具体的业务逻辑的：这并不是抄袭他人的代码，而是通过学习可以可以提高你的编码水平或者得到一些有用的改进提示。

Last but not least, it is always a good practice to test your own application for security reasons: to check if the code or the resources have been effectively obfuscated or to be sure that unwanted files have not been packaged into the final release APK. You would be surprised about how many APK files are full of information like API keys, authentication tokens or unused resources.

最后但并非最不重要的一点，它可以检查你的应用程序是否安全可靠，可以检查代码或资源被有效地混淆，或是不需要的文件没有被包装到最终apk。你会惊讶，别人可以知道居然有这么多的信息，例如API密钥信息，认证令牌或闲置资源等。


##APK format
##APK 格式

The **APK** bundle is the format used to package any application you develop or that you can get from Google Play Store or any other channel. In other words, for each application present on your device, there is a corresponding APK file (this is true also for pre-installed applications).

你开发的应用将被打包成**APK**文件，你可以从谷歌获得Play商店或其他渠道找到它。换句话说，对于手机上的任何一个应用程序，有相应的APK文件（包括预装的应用程序也不例外）。

An APK file is essentially a ZIP file, so you can get one, rename it and then extract it to have access to its content.

apk文件实际上也是一个zip文件，所以你拿到它以后，可以将其重命名，然后解压得到里面的文件。

|Entry |	Notes|
|----|---|
|AndroidManifest.xml |  manifest的 file in binary XML format.|
|classes.dex|application code compiled in the dex format.|
|resources.arsc	file|containing precompiled application resources, in binary XML.|
|res/|folder containing resources not compiled into resources.arsc|
|assets/	|optional folder containing applications assets, which can be retrieved by AssetManager.|
|lib/|optional folder containing compiled code - i.e. native code libraries.|	
|META-INF/|folder containing the MANIFEST.MF file, which stores meta data about the contents of the JAR.The signature of the APK is also stored in this folder.|
manifest的二进制文件

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
APK file content example.
APK里的文件

##WHAT’S DEX?
##什么是DEX?

In short, DEX, or Dalvik Executable is a file format that contains compiled code written for Android and can be interpreted by the Dalvik virtual machine or by the [Android Runtime](https://source.android.com/devices/tech/dalvik/index.html) (ART).

简单讲，DEX/Dalvik执行文件是一种Android平台上的文件格式，里面包含编译好的代码，可以被Dalvik虚拟机或者[Android Runtime](https://source.android.com/devices/tech/dalvik/index.html) (ART)读取识别。

When an APK file is produced by the Android build system (like when you “run” your application project from Android Studio), the Java classes are first compiled into ` .class` files and later a tool called dx will convert these files in the DEX format. dx is part of the Android toolchain, the Build Tools, and you can find it at this location:

当一个APK文件是由Android编译系统产生的（就像当你在Android Studio 上运行你的应用）。首先，Java类会被编译成`.class`文件，后来，`DX `将在这些文件转换DEX格式。 DX是Android交叉编译器`Build Tools`的一部分，你可以在以下位置找到它：

`$ANDROID_SDK/build-tools`

Specific details about the layout and the contents of a DEX file can be found [here](https://source.android.com/devices/tech/dalvik/dex-format.html).

关于DEX文件的详细信息请点击 [这里](https://source.android.com/devices/tech/dalvik/dex-format.html).


##HOW CAN YOU GET AN APK FILE?
##如何得到apk文件

There are few ways to do that:
这里有以下几种方式：

- if you need any arbitrary application, you can rely on online services like this [one](https://apkpure.com/), getting the APK file directly from your desktop browser.
- if the application is installed on your device, you could simply rely on a backup utility like this [one](https://play.google.com/store/apps/details?id=mobi.infolife.appbackup), and it will make a copy of the apk on a public folder on your device memory or on the SD card.
- inside folder `/system/app`, you can find pre-installed applications, such as: calculator, Chrome, camera, … it depends on the particular ROM installed on your device.
- inside folder  `/data/app`, you can find user installed applications.
In order to get an APK from your device, you can first list the available packages with the following command (remember to attach your device to the USB):

- 如果你想随便找一个应用，可以使用[一些网站](https://apkpure.com/)，通过浏览器直接下载到你的桌面
- 如果应用已经装在你的手机上了，你可以使用备份软件，例如[这个](https://play.google.com/store/apps/details?id=mobi.infolife.appbackup)，然后把他拷贝到你的手机内存或者SD卡的公共文件夹
- 在`/system/app`文件夹中，你可以找到预装应用 ，例如calculator, Chrome, camera, … 这取决于你手机上的具体ROM。
- 在`/data/app`中，你可以找到用户安装的应用。为了从手机中导出apk，你想要使用命令行列出可用的应用(记住使用usb连接手机):

`adb shell pm list packages -f`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-19.24.57.png)

Having the path of the APK file, you can now pull it:

有了apk文件的路径，你就可以将其导出了：

`adb pull -p PATH/base.apk OUTPUT.apk`

`-p` option simply displays the transfer progress, while the output filename is not mandatory, if omitted, `base.apk` is used instead.

`-p`选项可以展示传输文件的进度，如果导出文件的名称没有制定，默认会使用`base。apk`

![](http://www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-19.29.46.png)

`adb pull -p`
 

You may wonder how backup applications are able to give you an APK: in fact, if you try to access the `/data/app` folder from any file manager application installed on your device, you can see that is not possible, access is denied.

你可能对应用如何备份你的apk感到好奇：事实上，如果用手机上安装的文件管理系统去访问`/data/app`文件夹， 你会发现很多情况下是无法访问的。

But it’s indeed true that programmatically you can have access to the APK of the user installed applications.

但是，确实是可以通过编程方式访问用户安装应用的apk文件。

First you need to retrieve the list of the applications:

首先，您需要检索应用程序的列表：

```
final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null); 
mainIntent.addCategory(Intent.CATEGORY_LAUNCHER); 
 
List<ResolveInfo> infos = getPackageManager().queryIntentActivities(mainIntent, 0);
```
Then, through the  `ResolveInfo` , you can access the  `publicSourceDir  field` of the  `ApplicationInfo` class, which is the full path to the publicly available parts of  `sourceDir` , including resources and manifest.

然后，通过`resolveinfo `，您可以访问`applicationinfo`类中的` publicsourcedir`字段，这是`SourceDir`中公开部分的完整路径，包括资源和manifest。


```
File apkFile = new File(pkgInfo.activityInfo.applicationInfo.publicSourceDir);
if(apkFile.exists()) {
    ...
}
```

##AAR format
##AAR 格式

The **AAR** bundle is the binary distribution of an Android Library Project: for example, the Android Support Library you may use in your application is packaged using this format. Also, if your Android project is set to release a library and not an application for the store, the format would this one as well.

**aar**包是一个Android Library 项目的二进制分发：例如，Android Support Library ，你可以使用此格式将其添加到你的应用程序中。另外，如果你的Android项目的发布形式是一个Library，而不是商店的应用程序，采用这种格式再好不过了。


An AAR file is essentially a ZIP file, so you can get one, rename it and then extract it to have access to its content.

aar文件实际上也是一个zip文件，所以你拿到它以后，可以将其重命名，然后解压得到里面的文件。

These are the main entries you will find in an AAR file, even though there could be other files.

你可以在aar文件中找到以下内容：

|Entry	|	Required|Notes|
| -- | -- | -- |
|AndroidManifest.xml	|mandatory|	the manifest file in plain XML.|
|classes.jar	|mandatory|	Java classes of the library.|
|res/	|mandatory|	folder containing resources used by the library.|
|R.txt	|mandatory	|output of aapt with --output-text-symbols. It's basically a list of all resources referenced by the library (strings, colors, dimens, attrs, layouts, ...).|
|assets/|	optional|	folder containing assets used by the library.|
|libs/*.jar	|optional|	folder containing any external library.|
|jni//*.so	|optional|	folder containing native libraries.|
|proguard.txt	|optional	|Proguard configuration file.|
|lint.jar	|optional|	custom Lint rules.|


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

One difference, compared to the apk, is the format of the  `AndroidManifest.xml` file and the resources located in the  `res` folder: in the aar package they are in plain XML, so you can easily open them.

aar和apk相比，唯一的区别是的`AndroidManifest.xml`和`res`文件夹下的XML文件，他们都是普通的XML，所以你可以很容易地打开它们。


Please note, for example, that the Support Library you usually declare as a dependency in your projects, come in the aar format and you can retrieve them at:

请注意，例如，经常被我们作为项目依赖的Support Library是AAR的格式，您可以在以下路径找到他们：

`$ANDROID_SDK/extras/android/m2repository/com/android`

In the rest of this series, I will focus anyway on the APK format only, because it’s the one used to package the applications installed on any device and distributed through Google Play Store or other channels.

在本系列的其余部分，我将需要关注APK格式，因为装在手机上的应用就是这种格式的，也是这种格式分发到谷歌Play商店或其他渠道。

In the next article, I will speak about **aapt** and **dex2jar** tools and how you can use them to retrieve important information about the apk file under analysis.

在下一篇文章中，我将介绍**aapt**和**dex2jar** 两个工具，你可以使用它们通过分析从apk文件中获取很多重要的信息。