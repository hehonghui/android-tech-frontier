如何在本地搭建一个Android应用crashing跟踪系统－ACRA
---
>
* 原文链接 : [How to setup ACRA, an Android Application Crash Tracking system, on your own host](http://inthecheesefactory.com/blog/how-to-install-and-use-acra-android/en)
* 作者 : [nuunei](http://inthecheesefactory.com/blog)
* 译者 : [sundroid](https://github.com/sundroid) 
* 校对者: [sundroid](https://github.com/sundroid) 
* 状态 :  校对完成


在开发一款移动app时的一个事实是会有很多约束，比如硬件（CPU、RAM、Battery 等等）。如果你的代码设计不是很好，你会遇到一个非常让人头疼的问题：“Crash”,研究表明：

>
*应用崩溃时绝大多数应用使用者抱怨的问题。

此外

>
* 如果应用程序联系崩溃三次，大约一半的用户将会卸载这款应用。


崩溃跟踪系统，帮助开发者能够直接的葱用户的设备收集每一个崩溃原因，是不是发现这个功能很特殊。目前最受欢迎的崩溃跟踪系统是 [Crashlytics](http://fabric.io/)和[Parse Crash Reporting](http://blog.parse.com/2014/12/09/introducing-parse-crash-reporting-2/)，这两个系统都是完全免费的。开发者可以免费的集成他们在自己的应用中。不论什么时候app崩溃了，整个bug信息将会发送到后台，允许开发人员用最简单的方式去解决这些bug。通过这个方法，你可以在短时间内迭代一款不会影响正常使用的应用。


然而，提供崩溃信息收集的厂商收集这些崩溃信息同时也收集了用户信息，这可能让引起大公司担心用户隐私。


所以，这儿有没有崩溃信息跟踪系统可以让我们搭建在自己的服务器上？那么就不存在泄漏用户隐私的担忧了。当然有了，并且这个系统提供了非常简单的搭建方法。在这里我们来介绍下[Application Crash Reporting on Android (ACRA)](https://www.acra.gov.sg/home/),一个库允许Android应用自动地发送崩溃信息到自己的服务器。

下面将会介绍如何去搭建。

## 搭建一个服务器 ##

服务器端是一个先决条件，让我们先从搭建服务器端开始。

由于ACRA设计的很好并且很受欢迎。它允许开发者开发自己的服务器系统，并且现在我们可以看到很多这样的系统。即便如此我觉得最好的是Acralyzer，这个也是由ACRA团队研发。Acralyzer工作在Apache CouchDB，所以
这里没有必要安装除了CouchDB以外的软件。

Acralyzer是一个功能相当齐全的后端崩溃跟踪系统。来自不同原因的相同堆栈轨迹将会被分组成一个单一的问题。如果你解决了所有问题，你可以非常便捷的关闭Acralyzer服务，并且这种关闭服务的操作时实时的，我发现系统唯一的缺点是它的ui让人感到不舒服，但是谁会在乎这个？它是为开发者开发的。

安装起来也很简单，下面将介绍如何在Ubuntu安装Acralyzer。

打开命令窗口，开始安装couchdb
>
*apt-get install couchdb

Test the installation with this command:

测试是否安装成功。
>
*curl http://127.0.0.1:5984

如果正确安装，会显示如下：
>
*{"couchdb":"Welcome","version":"1.2.0"}

编辑etc/couchdb/local.ini允许我们通过外部IP(默认的访问会通过127.0.0.1)去访问CouchDB。仅仅改变两行实现这个功能：
>
*;port = 5984
*;bind_address = 127.0.0.1


改变为
>
*port = 5984
*bind_address = 0.0.0.0

在同一个文件夹下，你需要添加username/password作为管理员账户。找到这一行（应该会在文件末尾）
>
*[admins]

下一行添加username/password 形式为username = password，比如：
>
*[nuuneoi = 12345]


请不要对在这里书写明文密码感到担心，一旦CouchDB重启后，你的密码将会自动地散列，并且将会是不可读的，

保存你刚刚编辑的文件同时通过命令行重启hashed：
>
*curl -X POST http://localhost:5984/_restart -H"Content-Type: application/json"

从现在起，你将可以通过浏览器访问CouchDB。这个web服务我们称之为Futon，一个CouchDB UI管理后台。在你的浏览器中打开这个地址。

>
*http://<YOUR_SERVER_IP>:5984/_utils

让我们开始吧，Futon。
![](http://inthecheesefactory.com/uploads/source/acra/futon.png)


首先，通过你之前设置的管理员账号登陆这个系统。

现在我们开始安装一个acro-storage (Acralyzer's Storage Endpoing).在左边的菜单，点击Replicator，然后填写远程存储改为本地存储的表单。
>
*from Remote Database: http://get.acralyzer.com/distrib-acra-storage to Local Database: acra-myapp

点击Replicate然后等待，知道这个过程结束。

下一步安装Acralyzer通过同样的方法，但是参数是不同的。
>
*from Remote Database: http://get.acralyzer.com/distrib-acralyzer to Local Database: acralyzer

点击Replicate安装。

如果你操作正确，系统将会有两个数据库，acra-myapp 和 acralyzer。

![](http://inthecheesefactory.com/uploads/source/acra/acra3.png)

我门就快大功告成了，下一步，我们需要为这个客户端创建一个用户，打开浏览器，然后打开这个网址：
>
*http://<YOUR_SERVER_IP>:5984/acralyzer/_design/acralyzer/index.html
![](http://inthecheesefactory.com/uploads/source/acra/admincreateuser.png)

填写你想要的Username/Password，然后点击Create User，这些信息将会出现。
![](http://inthecheesefactory.com/uploads/source/acra/users2.png)

复制这些信息，然后粘贴到你的文本编辑器，我们可能会用这个在客户端设置。

最后一件事是限制访问权限来保护在acra-myapp里面的数据，进入acra-myapp然后点击Securities，填写用户角色分配；
>
*["reader"]
![](http://inthecheesefactory.com/uploads/source/acra/reader.png)

完工！
在这些结束后，你可以通过同一个网址访问这个控制台，去Admin选项卡，并选择Users。

>
*[http://<YOUR_SERVER_IP>:5984/acralyzer/_design/acralyzer/index.html

请注意acro-myapp只能够为一款应用服务。以防你想为另外一款应用创建一个后台，请通过同样的过程复制另外一个acro-storage，但是改变本地数据库名为acra-<your_app_name>。请注意，有必要去通过acra- 去开启服务，或者它不能够在仪表盘中罗列为选择项供我们去选择。

如果在系统中有不止一款应用，在Acralyzer的仪表盘中将会有一个下拉列表，让我们去选择看哪一个的问题。你可以试一试。

在客户端设置ACRA。

在客户端中设置ACRA很简单，首先，在你的 build.gradle里添加ACRA的依赖配置信息。
>
*compile 'ch.acra:acra:4.6.1'

同步你的gradle文件，然后创建一个自定义Application类，但是不要忘记在AndroidManifest.xml中定义这个Application类。（我假设每一个Android开发者不会忘记这么做）。

在你创建的自定义的Application类中添加 @ReportCrashes注解。

```java
import android.app.Application;
import org.acra.ACRA;
import org.acra.annotation.ReportsCrashes;
import org.acra.sender.HttpSender;
 
/**
 * Created by nuuneoi on 2/19/2015.
 */
 
@ReportsCrashes(
)
public class MainApplication extends Application {
 
    @Override
    public void onCreate() {
        super.onCreate();
 
        ACRA.init(this);
    }
 
}
```

现在我们复制服务器端生成的信息，并且像下面那样粘贴到@ReportsCrashes中。

```java
	@ReportsCrashes(
    httpMethod = HttpSender.Method.PUT,
    reportType = HttpSender.Type.JSON,
    formUri = "http://YOUR_SERVER_IP:5984/acra-myapp/_design/acra-storage/_update/report",
    formUriBasicAuthLogin = "tester",
    formUriBasicAuthPassword = "12345"
)
```

最后一步，不要忘记添加在AndroidManifest.xml网络访问权限，否则ACRA可能无法发送这些日志信息到你的服务器上。
>
*<uses-permission android:name="android.permission.INTERNET"/>


恭喜，现在所有的配置都已经完成，ACRA可以正常的工作，帮助你收集崩溃日志信息，从而你可以快速解决应用出现的问题。

##测试##

现在我们通过在Activity中强制一些崩溃来做一些测试，例子如下： 

```java
extView tvHello;
 
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
 
    tvHello.setText("Test Crash");
}
```

运行你的应用，然后改变崩溃的原因，再运行一次。查看你的仪表盘，你将会看到这些发送到后台的bug。

![](http://inthecheesefactory.com/uploads/source/acra/acra.png)

每一个bug来自不同用户不同时间，并且这些报告被分组了。
![](http://inthecheesefactory.com/uploads/source/acra/reportslist.png)

仔细看看这些报告信息，你将会发现他们都是完整的崩溃信息。
![](http://inthecheesefactory.com/uploads/source/acra/stacktrace.png)

并且非常多的信息，足足有7页。

如果你修复这些bug后，你可以关闭这个问题，通过简单的点击在页面中高亮显示的"bug"图标，
![](http://inthecheesefactory.com/uploads/source/acra/closeissue.png)

希望这篇文章对你们有用，特别是对于一些需要应用崩溃信息收集但是却担心隐私信息的大公司可以来使用这个系统。

事实上ACRA还有许多其他特性，比如：当一个月崩溃时显示Toast 或者 popup 来报告这些信息。你可以在ACRA网站上发现这些选项。

Acralytics也一样，这里有许多其他特性可以使用，比如，你可以设置一个服务器来发送邮件给我们。

下一篇博客再见。


	






