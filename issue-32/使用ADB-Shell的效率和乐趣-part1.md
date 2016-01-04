# Efficiency and fun from using ADB Shell, Part 1

In this article, I want to show how to use basic adb commands to do
things like `install`, `uninstall`, `copy`, `clean` app that used most
often during Android development and testing. This could also be helpful
if we want to automate builds on CI server and be sure everything clean
and legit.  
在这片文章中，我想展示开发和测试中常用的adb命令，比如`install`，`uninstall`，`copy`，`clean`。这对我们最动画构建也是有帮助的，

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
[Android Debug Bridge](https://developer.android.com/tools/help/adb.html)(adb)是一个可以帮你和模拟器或者真机通讯的多功能命令行工具。ADB包含在[SDK](https://developer.android.com/sdk/index.html)中，你可以在`OurSdkPath/platform-tools `中找到它。因为系统的原因，我们可能还需要做一些额外的[调整](https://developer.android.com/tools/device.html#setting-up)。  
![ADB Shell](https://github.com/DroidWorkerLYF/Translate/blob/master/Efficiency%20and%20fun%20from%20using%20ADB/adb_shell.png?raw=true)  

##Install and Uninstall
##安装和删除

First let’s install any apk, most likely we have more than one device
connected, and need to pick one:  
首先，让我们安装一个apk，我们通常需要从多个设备中选一个：

    1 adb devices
    2 //output
    3 List of devices attached
    4 106a6a4f    device
    5 //now specifying device to install simple apk
    6 adb -s 106a6a4f install /OurLocalPath/sample.apk

We can specify our device for any adb command for ex. to display and
update sorted information about processes  


    1 adb -s 106a6a4f top

For uninstall application we just add package-name to command

    1 adb uninstall our.package.name


To see list of all packages installed on device and associated file we
use remote shell and package manager command


    1 adb shell pm list packages -f

Almost for every command from adb exists additional flags most of them
you can see with command

     1 adb help
     2 …
     3 adb install [-lrtsdg] <file>
     4                                - push this package file to the device and install it
     5                                  (-l: forward lock application)
     6                                  (-r: replace existing application)
     7                                  (-t: allow test packages)
     8                                  (-s: install application on sdcard)
     9                                  (-d: allow version code downgrade)
    10                                  (-g: grant all runtime permissions)

##Copy files

After installing apk you can find files located by [Package
Manager](https://dzone.com/articles/depth-android-package-manager) at:

-   App itself in `/data/app`
-   Data directory `/data/data/<package name>` where you can find
    databases, shared preference, and other cached data.

Most of the files might be useful during the testing process; you can
add data to database or change settings of application editing XML.

For copying files from device first you need look up for them via shell
then copy

    1 adb shell 
    2 //navigate and figure out what to copy
    3 adb pull /data/data/ua.slando/databases/ /OurLocalPath

Same apply copying files into device

    1 adb push /OurLocalPath/ourFile.txt /data/data/our.package.name/databases/


Pretty often we want to copy data from internal storage for which we do
not have permissions by default and can get error
`remote object`/data/data/ua.slando/databases/`does not exist` to fix it
we need run


    1 adb kill-server
    2 adb root


Keep in mind that achieve root from adb only possible for emulators or
root devices.

##Clean

Often happens that we just need to clean data of application, keeping
the same build and saving time, you can use PackageManager command:

    1 adb shell pm clear our.package.name


That is it, with this set of command we can handle most of the basic
use-cases. In next Part, I’ll tell more useful tips and tricks about adb
and Android. Stay tuned and keep investigating this wonderful Android
World! ;)