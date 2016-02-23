Android逆向工程101 – Part 4
---

> * 原文链接 : [Android Reverse Engineering 101 – Part 4](http://www.fasteque.com/android-reverse-engineering-101-part-4/)
* 原文作者 : [Daniele Altomare](http://www.fasteque.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/MiJack) 
* 校对者: 
* 状态 :  已翻译

在Android应用逆向工程的系列博客中，我们已经讨论过了[APK的文件格式](http://www.fasteque.com/android-reverse-engineering-101-part-1/), [aapt](http://www.fasteque.com/android-reverse-engineering-101-part-2/) 和 [dex2jar](http://www.fasteque.com/android-reverse-engineering-101-part-3/)，接下来我们介绍**Apktool**。

我们都知道，APK的资源文件是经过压缩以二进制的格式存储在文件中，我们无法通过**aapt**和**dex2jar**对其进行查看和编辑，前者实质是一个读取工具，用于从apk中提取有用的信息；而后者只能帮助我们获取到Apk中的执行代码并不能获取资源文件。

下面是摘抄自Apktool的[官方网站](https://ibotpeaches.github.io/Apktool/):

>一种用于逆向第三方闭源Android工程的工具，它可以反编译出和源文件形式相似的资源文件，并对其进行修改、重打包。可以对Smail代码进行单步调试。因为项目结构和开发时的较为相近以及自身所带的Apk构建等自动化操作，这让开发应用更加方便。

所以，这个工具是逆向工程的必备工具，因为它能对资源进行解码。

这里需要注意的是，记住，它**不能**用于涉及隐私或者其他非法的用途。

## 安装

[这个网站](http://ibotpeaches.github.io/apktool/install/)是关于如何安装的详细介绍。只需要检查一下Java版本，去环境说明章节看一下对应的平台（Window，Linux，Mac OS X）上的说明。

本文使用的 **Apktool** 的版本是 `v2.0.2`.

按照说明正确安装设置后，我们在命令行中输入`apktool`,得到如下输出：

![](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-22.11.54.png)

在输入第一个命令之前，我们需要选择一个应用。在之前介绍[**dex2jar article**](http://www.fasteque.com/android-reverse-engineering-101-part-3/)，我选择了[RGB Tool](https://play.google.com/store/apps/details?id=com.fastebro.androidrgbtool) ，因为它是我的一个开源项目，对其进行逆向工程并不会有任何争议。我们可以在[这里](https://play.google.com/store/apps/details?id=com.fastebro.androidrgbtool)下载这个该应用。

对于所有的实例，均运行在我的**Nexus 6**上，安装有**RGB Tool v1.4.3** ，系统版本**Android 6.0**。

## FRAMEWORKS

在反编译APK或者系统应用的过程中，Frameworks是非常重要的。事实上，在一台设备或者模拟器上，有一APK文件包括了ROM里的所有资源，包括图片、动画、声音、闪屏等，它是系统镜像的一部分.

这个文件位于`/system/framework/framework-res.apk`

简单的讲，这个文件包括关于设备界面风格所需的必要资源，被系统获取其他应用使用。对于任何一个制造商，包括三星，HTC，摩托罗拉，LG等，它都会提供自己的frameworkd的APK文件。

Apktool默认情况下使用的是AOSP的framework，并在如下路径（Mac OS X）有对应文件的拷贝:`$HOME/Library/apktool/framework/1.apk`

如果我们需要反编译基于一个另外的Framework系统的应用，我们可能安需要装它，否则我们会得到下面的错误：

	W: Could not decode attr value, using undecoded value instead: ns=android, name=drawable
	W: Could not decode attr value, using undecoded value instead: ns=android, name=iconCan't find framework resources for package of id: 2. You must install proper framework files, see project website for more info.

第一件事情就是使用`adb pull`从设备中导出framework的APK文件，一般情况下，我们可以在`/system/framework`找到它, 如果还是找不到它，可以在 [该网站](http://ibotpeaches.github.io/Apktool/documentation/#framework-files)查看所有可能的路径。

然后，我们可以安装它： `apktool if FRAMEWORK.apk`

在执行完这步操作后，我们可以反编译系统应用了。

**Note**: 本文的后续章节使用的是默认的AOSP framework，所以无需重新安装。

## 反编译
运行如下命令，就可以反编译APK文件：

	apktool d FILENAME.apk

![apktool decode](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-23-at-22.45.01.png)

工具创建了一个文件夹，并在反编译好APK后对其进行重命名。

![apktool decode output](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-25-at-21.29.38.png?resize=1024%2C218)

apktool 反编译的输出

请注意,输出文件夹的内容取决于APK文件以及其包含的文件。

首先要注意的是`apktool.yml`文件：它包含重要的信息,如应用**版本名称**、**代码**、**最小和支持SDK版本**...当我们重新构建APK文件的时候，此文件是必需的,特别如果我们想改变其中的某个值。

我们有了XML格式的`AndroidManifest.xml`文件, **并不是二进制格式**, 所以我们可以对其进行浏览和编辑。

`original`文件夹通常包含`AndroidManifest. xml`二进制格式文件和含有JAR文件清单和apk签名的`META-INF`文件夹。基本上，这两项是直接从apk里复制得到的，没有做过修改。

`Smali`文件夹包含了应用程序中Smali格式的源代码：[在我以前的文章](HTTP：/ / www.fasteque。COM / android-reverse-engineering-101-part-3 /)，已经讨论过这一点了，所以我只提到几件事。首先，代码的目录结构是依据包名。从中我们可以得到所有的可执行代码，其中包括来自第三方依赖的代码也在这个文件夹中。其次，我们可以对其进行修改，并对其进行重打包操作，形成新的APK文件。

最后一个文件夹是`res`，很明显，这是资源文件夹：**apktool** 能反编译以【二进制形式](http://www.fasteque.com/android-reverse-engineering-101-part-1/)存储在`resources.arsc`中的资源，所以我们可以看到，当然也可以修改他们。这里有一个重要的事情：因为我们解码是运行在设备里的apk文件，所以，程序所有依赖的资源文件均在这个文件夹中，所以不必惊讶得到的资源文件比我们在Android Studio中看到的还要多。说明一点，在开发时我们使用了**AppCompat V7**这个库作为其中的一个依赖，所以我们理所应当得到他的资源文件(它们的文件名以`abc_`开头)。

最后要注意的是，资源文件的子文件夹的名称不一定和项目或原有的应用的对应文件夹完全匹配，这样设计主要是为了apktool能够将这些资源重新打包，构建一个可以运行的APK。

## 构建

使用如下命令就可以进行构建操作：

	apktool b APKTOOL_DECODE_OUTPUT_DIR

Apktool会根据反编译的输出文件夹进行重打包，将对应的APK文件放置在`APKTOOL_DECODE_OUTPUT_DIR/dist`路径下。

或者指定对应的APK路径：
![apktool build](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-25-at-22.47.35.png)
apktool build


![apktool build output](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-25-at-22.48.26.png)
apktool build output

请注意，如果Apktool构建的APK没有对应的签名，它将无法安装设备上。

事实上，如果我们直接安装`dist`目录下的APK文件，我们会得到如下错误：

![APK not signed error](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screen-Shot-2015-11-26-at-20.29.06.png)

所以，在安装以前，我们需要使用如下命令对其进行签名（他会向我们提示输入密码和keystore）:


	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore my_application.apk alias_name

如果这不是一个发布版本中，我们可以使用用于调试的keystore，使用方法和使用Android Studio一样，keystore文件位于一个隐藏文件夹中（用户文件夹取决于对应的平台环境）：

`USER_HOME/.android/debug.keystore`

Keystore的password是 `android`, key alias 是 `androiddebugkey` .


除此以外，我们还可以创建属于自己的keystore，请参考[官方文档](http://developer.android.com/tools/publishing/app-signing.html#signing-manually) (同时，他建议我们**在签名以后对APK进行zipalign**).


## 牛刀小试

现在，我们已经知道了如何对一个应用进行反编译和重打包，我们对应用做一些小的尝试，感受一下**ApkTool**的特性。

首先，我们来看一下应用原来的主界面，方便通过对比得出我们所做的修改。

![RGB Tool original main view](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151126-204826.png)

## 应用的名称和主题

首先，我们来修改一下应用的名称和主题色。

查看manifest文件, 我们发现应用的名称使用的是名为`app_name`的string 资源. 所以打开`values/string.xml`文件，将对应的值从 **RGB Tool** 改为 **MyRGB Tool**.

关于主题的颜色，让我们再看看manifest文件，确认主题设置在应用层：它是` Theme.Rgbtool`。我们可以在`values/styles.xml`中找到它的声明，我们对如下部分比较感兴趣：


	<item name="colorPrimary">@color/primary</item>
	<item name="colorPrimaryDark">@color/primary_dark</item>
	<item name="colorAccent">@color/accent</item>

所以，我们将视线转移到`values/colors.xml`，更改其中的颜色。关于在主题色的选择，我建议使用[Material Palette](http://www.materialpalette.com/)。

我定义了如下新的颜色：

	<color name="primary">#4CAF50</color>
	<color name="primary_dark">#388E3C</color>
	<color name="accent">#FFC107</color>

让我们来构建、签名apk。记住我们必须卸载已经安装好的应用，即便是覆盖安装也是这样。

[]Modified RGB Tool](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151126-212522.png)

## 应用的图标
我们可以通过和之前同样的方法更改应用程序的图标，因为我们知道那只是一个drawable PNG文件，它的名字是设置在manifest文件中了。所以，我们要做的变化很小，事实上它只需要更新成新的PNG文件（在这里不考虑屏幕密度）并重新生成apk文件。

在这里，图标设置成`@mipmap/ic_launcher`

我们将使用[Android Asset Studio](http://jgilfelt.github.io/AndroidAssetStudio/index.html), 来生成新的启动图标，打开网页，选择**Launcher icons**。

更新了新的PNG文件后，我们通过打包签名得到APK文件，新的应用图标展现在启动器上：

![New application icon](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/myrgb_tool_icon.png)

### 新的资源

到目前为止，我们只是替换同名的资源。如果，我们需要向应用添加新的资源，应该如何处理？我们来做一下这方面的尝试。

我们打开应用，减小opacity（O）的值，我们可以看见背景里的Android机器人。

![RGB Tool android](http://i1.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151127-205409.png)

它对应的资源是`@drawable/robot`，有很多界面使用了它。我们把它提取出来，改改颜色后，命名为`robot_apktool`。然后，我们必须在所有的XML布局中的`robot`替换成`robot_apktool`。然后我们重新打包、签名、安装在我们的设备。

![New robot](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151127-211610.png)

我们的新Android替换好了！说实话，这很容易，因为资源只被XML文件引用，但从未在任何java类出现过。后者和前者属于两种不同的情况，这也是我们不在这里讨论的原因。

### 我们可以修改源代码吗？

当然，在文章的开头我们已经介绍过了，**Apktool** 可以反编译出应用的可执行代码，产生`.smali`文件,所以我们可以直接更改它们，并生成新的APK文件。当然，
[Smail](https://github.com/jesusfreke/smali)并不及java那样容易入门，它的语法比较冗长。我们可以用任何文本编辑器打开这些文件，但是我们无法享受语法高亮和自动完成的编辑器特征。另一方面，我们可以很容易地用grep搜索字符串。


在这里推荐一些工具：一个是开源的[syntax highlighter](https://github.com/ShaneWilton/sublime-smali)，而另一个是[全功能的解决方案]（http://virtuous-ten-studio.com/），不仅仅可以用来编辑`smali`。

让我们通过smali尝试一个很简单的改变：如果我们点击 **Print color** 选项（需要点击溢出菜单图标调出它），下面的对话框出现在屏幕上。

![](http://i2.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151127-214535.png?resize=169%2C300)

我们要做的是改变按钮文本从**Skip**改为 **Apktool**：在这个例子中，字符串资源用于java类,没有被XML资源文件引用。

资源文件的名称是`action_common_skip`，所以我们在`res/values/strings.xml`中创建了`action_common_skip_apktool`的字符串. 整理还有意大利语和法语的资源。但是在这里，只要修改默认值即可。

现在，我们搜索一下`action_common_skip`, 我们将在`public.xml`中找到3个String资源(默认，意大利语，法语)。比较有意思的是，我们在Smali文件中找不到搜索结果。查看[Java 类](https://github.com/fasteque/rgb-tool/blob/master/android-rgb-tool/src/main/java/com/fastebro/androidrgbtool/fragments/PrintJobDialogFragment.java),我都知道源代码中确实有用到这个String资源，所以，我打开xml文件和对话框对应的smali文件, `PrintJobDialogFragment.smali`.

`public.xml`是应用程序的所有资源的列表，如字符串、布局、图片、色彩等。每个资源对应十六进制的ID。这些ID实际上是R.java文件中的值。而R文件是我们在创建项目时由Android构建系统帮助我们生成的：没错，apktool在提取APK资源和反编译代码时创建的。正如在这个系列中[前面的文章](http://www.fasteque.com/android-reverse-engineering-101-part-3/)所提到的，如果我们在Java类引用资源，比如Activity，它实际上是一个存储在R.java类中的整形ID。

所以，我们在smali文件中查找如下的资源id：

	<public type="string" name="action_common_skip" id="0x7f070017" />

有趣的事又来了！他其实引用了（请注意，使用不同的应用或者通过克隆仓库构建新的APK，可能得到和例子中不一样的ID值）：

	const v2, 0x7f070017

	invoke-virtual {p0, v2}, Lcom/fastebro/androidrgbtool/fragments/PrintJobDialogFragment;->a(I)Ljava/lang/String;

	move-result-object v2

ID的值存储在常量 **V2** 中，然后作为一个虚拟方法调用的参数（这将是`setTitle `）。操作码汇总列表请看[这里](http://pallergabor.uw.hu/androidblog/dalvik_opcodes.html)。

现在，我们理清了这些：我们知道我们必须更新`public.xml`文件，加入我们新定义的字符串，并在smali文件设置对应的ID值。

对于第一步，我们注意很多细节：我们可以注意到，资源类型和 **id** 是连续的，一个所以我们不能随意设置ID值。我们需要寻找最后一个字符串资源，然后添加新的字符串资源，**ID** 值在其基础上加1（记得那些hexacedimal值）。在这个例子中，最后一个字符串是`0x7f070051` ,需要添加的**id**如下：

	<public type="string" name="action_common_skip_apktool" id="0x7f070052" />

第二步比起第一步简单很多。只需要将`PrintJobDialogFragment.smali`中的值改成新的就可以了.

现在，我们重新打包，签名，安装新的APK：界面里展示就是新的字符串了。

![New string resource](http://i0.wp.com/www.fasteque.com/wp-content/uploads/2015/11/Screenshot_20151129-115055.png)

这次更新主要介绍了 **apktool** 的主要特点：我鼓励你用它试验使用你开发的APK。它很容易帮助你理解资源如何解码以及阅读smali代码。根据你的需求和应用的版本，对APK进行修改和重建。


在[下一个章节](http://www.fasteque.com/android-reverse-engineering-101-part-5/)，我将介绍Androguard.
