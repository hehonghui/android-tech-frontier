# 使用ADB Shell的效率和乐趣-Part1
> * 原文链接 : [Efficiency and fun from using ADB Shell, Part 1](https://ar-g.github.io/ADB-Shell-Part-1/?utm_source=Android+Weekly&utm_campaign=9ed0cecaff-Android_Weekly_186&utm_medium=email&utm_term=0_4eb677ad19-9ed0cecaff-337955857)
* 原文作者 : [Andrii Rakhimov](https://ar-g.github.io)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

在这篇文章中，我想展示在开发和测试中如何使用常用的adb命令实现`install`，`uninstall`，`copy`，`clean`。这对我们在持续集成服务器上进行自动化构建也是有帮助的，并且能确保一切干净合法。

[Android Debug Bridge](https://developer.android.com/tools/help/adb.html)(adb)是一个可以帮你和模拟器或者真机通讯的多功能命令行工具。它是一个client-server程序并且提供了Unix [shell](https://developer.android.com/tools/help/shell.html)，使得你可以在模拟器或真机上运行多种命令。ADB包含在[SDK](https://developer.android.com/sdk/index.html)中，你可以在`OurSdkPath/platform-tools `中找到它。根据系统的不同，我们可能还需要做一些额外的[调整](https://developer.android.com/tools/device.html#setting-up)。  
![ADB Shell](https://github.com/DroidWorkerLYF/Translate/blob/master/Efficiency%20and%20fun%20from%20using%20ADB/adb_shell.png?raw=true)  

##安装和删除

首先，让我们安装一个apk，我们通常需要从多个连接的设备中选一个：

    adb devices
    //output
    List of devices attached
    106a6a4f    device
    //now specifying device to install simple apk
    adb -s 106a6a4f install /OurLocalPath/sample.apk

我们可以为任何adb命令指定设备，比如显示并更新进程的分类信息

    adb -s 106a6a4f shell top

删除应用我们只需要在uninstall命令后加上包名

    adb uninstall our.package.name

想要查看设备上安装的包以及相关联的文件，我们使用远程shell和package manager命令

    adb shell pm list packages -f

几乎每个adb命令都有额外的参数，你可以通过adb help查看

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

## 复制文件

安装完应用后，你会在[Package Manager](https://dzone.com/articles/depth-android-package-manager)的对应路径下找到文件：

-   应用在`/data/app`目录下
-   数据库，shared preference和其他缓存数据在`/data/data/<package name>`目录下

大部分的文件在测试时都是有用的，你可以向数据库中添加数据，或者通过编辑XML改变应用的设置。

想要从设备上复制文件你首先需要通过shell在设备上找到他们

    1 adb shell 
    2 //navigate and figure out what to copy
    3 adb pull /data/data/ua.slando/databases/ /OurLocalPath

同样的原理把文件复制到设备

    1 adb push /OurLocalPath/ourFile.txt /data/data/our.package.name/databases/

通常我们没有权限从内部存储器上复制数据，会得到错误提示例如remote object /data/data/ua.slando/databases/ does not exist，我们可以这样做：

    1 adb kill-server
    2 adb root

记住只有模拟器和root过的设备才能取得root权限。

##清理

我们经常需要清理应用的数据，方便使用同一个build并且节省时间，你可以使用PackageManager命令：

    adb shell pm clear our.package.name

以上就是part1全部内容了，你已经可以应对基本的使用了。在下一部分，我会讲一些关于adb和Android更有用的建议和tricks。敬请期待，继续研究这美妙的Android世界吧 ;)