# 使用ADB Shell的效率和乐趣-Part1
> * 原文链接 : [Efficiency and fun from using ADB Shell, Part 1](https://ar-g.github.io/ADB-Shell-Part-1/?utm_source=Android+Weekly&utm_campaign=9ed0cecaff-Android_Weekly_186&utm_medium=email&utm_term=0_4eb677ad19-9ed0cecaff-337955857)
* 原文作者 : [Andrii Rakhimov](https://ar-g.github.io)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 

In this article, I want to show how to use basic adb commands to do
things like `install`, `uninstall`, `copy`, `clean` app that used most
often during Android development and testing. This could also be helpful
if we want to automate builds on CI server and be sure everything clean
and legit.  
在这篇文章中，我想展示在开发和测试中如何使用常用的adb命令，比如`install`，`uninstall`，`copy`，`clean`。这对我们在持续集成服务器上进行自动化构建也是有帮助的，并且能确保一切干净合法。

[Android Debug
Bridge](https://developer.android.com/tools/help/adb.html)(adb) is a
versatile command line tool that lets you communicate with an emulator
instance or connected Android-powered device. It is a client-server
program which also provides a Unix
[shell](https://developer.android.com/tools/help/shell.html) that you
can use to run a variety of commands on an emulator/device. ADB included
into [SDK](https://developer.android.com/sdk/index.html) and you can
find it at `OurSdkPath/platform-tools`. Depending of our operation
system we may also need to do additional
[tuning](https://developer.android.com/tools/device.html#setting-up).  
[Android Debug Bridge](https://developer.android.com/tools/help/adb.html)(adb)是一个可以帮你和模拟器或者真机通讯的多功能命令行工具。它是一个client-server程序并且提供了Unix [shell](https://developer.android.com/tools/help/shell.html)，使得你可以在模拟器或真机上运行多种命令。ADB包含在[SDK](https://developer.android.com/sdk/index.html)中，你可以在`OurSdkPath/platform-tools `中找到它。因为系统的原因，我们可能还需要做一些额外的[调整](https://developer.android.com/tools/device.html#setting-up)。  
![ADB Shell](https://github.com/DroidWorkerLYF/Translate/blob/master/Efficiency%20and%20fun%20from%20using%20ADB/adb_shell.png?raw=true)  

##Install and Uninstall
##安装和删除

First let’s install any apk, most likely we have more than one device
connected, and need to pick one:  
首先，让我们安装一个apk，我们通常需要从多个连接的设备中选一个：

    adb devices
    //output
    List of devices attached
    106a6a4f    device
    //now specifying device to install simple apk
    adb -s 106a6a4f install /OurLocalPath/sample.apk

We can specify our device for any adb command for ex. to display and
update sorted information about processes  
我们可以为任何adb命令指定设备，比如显示并更新进程的分类信息

    adb -s 106a6a4f shell top

For uninstall application we just add package-name to command  
删除应用我们只需要在uninstall命令后加上包名

    adb uninstall our.package.name

To see list of all packages installed on device and associated file we
use remote shell and package manager command  
想要查看设备上安装的包以及相关联的文件，我们使用远程shell和package manager的命令


    adb shell pm list packages -f

Almost for every command from adb exists additional flags most of them
you can see with command  
几乎每个命令都有额外的参数，你可以通过adb help查看

     adb help
     …
     adb install [-lrtsdg] <file>
                                    - push this package file to the device and install it
                                       (-l: forward lock application)
                                       (-r: replace existing application)
                                       (-t: allow test packages)
                                       (-s: install application on sdcard)
                                       (-d: allow version code downgrade)
                                       (-g: grant all runtime permissions)

##Copy files
## 复制文件

After installing apk you can find files located by [Package
Manager](https://dzone.com/articles/depth-android-package-manager) at:  
安装完应用后，你会在[Package Manager](https://dzone.com/articles/depth-android-package-manager)的对应路径下找到文件：

-   App itself in `/data/app`
-   Data directory `/data/data/<package name>` where you can find
    databases, shared preference, and other cached data.
-   应用在`/data/app`目录下
-   数据库，shared preference和其他缓存数据在`/data/data/<package name>`目录下

Most of the files might be useful during the testing process; you can
add data to database or change settings of application editing XML.  
大部分的文件在测试时都是有用的，你可以向数据库中添加数据，或者通过编辑XML改变应用的设置。

For copying files from device first you need look up for them via shell
then copy  
想要从设备上复制文件你首先需要通过shell在设备上找到他们

    1 adb shell 
    2 //navigate and figure out what to copy
    3 adb pull /data/data/ua.slando/databases/ /OurLocalPath

Same apply copying files into device  
同样的原理把文件复制到设备

    1 adb push /OurLocalPath/ourFile.txt /data/data/our.package.name/databases/


Pretty often we want to copy data from internal storage for which we do
not have permissions by default and can get error
remote object /data/data/ua.slando/databases/ does not exist to fix it
we need run  
通常我们没有权限从内部存储器上复制数据，会得到错误提示例如remote object /data/data/ua.slando/databases/ does not exist，我们可以这样做：

    1 adb kill-server
    2 adb root

Keep in mind that achieve root from adb only possible for emulators or
root devices.  
记住只有模拟器和root过的设备才能取得root权限。

##Clean
##清理

Often happens that we just need to clean data of application, keeping
the same build and saving time, you can use PackageManager command:  
我们经常需要清理应用的数据，方便使用同一个build并且节省时间，你可以使用PackageManager的命令：

    adb shell pm clear our.package.name

That is it, with this set of command we can handle most of the basic
use-cases. In next Part, I’ll tell more useful tips and tricks about adb
and Android. Stay tuned and keep investigating this wonderful Android
World! ;)  
以上就是part1全部内容了，你已经可以应对基本的使用了。在下一部分，我会讲一些关于adb和Android更有用的建议和tricks。敬请期待，继续研究这美妙的Android世界吧