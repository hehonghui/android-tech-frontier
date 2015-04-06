如何在本地搭建一个Android应用crashing跟踪系统－ACRA
---
>
* 原文链接 : [How to setup ACRA, an Android Application Crash Tracking system, on your own host](http://inthecheesefactory.com/blog/how-to-install-and-use-acra-android/en)
* 译者 : [sundroid](https://github.com/sundroid) 
* 校对者: [译者](你的链接)  
* 状态 :  待校对


One truth about developing a mobile application is there are so many constraints for example, a hardware limitation (CPU, RAM, Battery, etc). If your code design is not good enough, prepare to say hi to the most critical problem on earth: "Crash". According to a study, it shows that:

在开发一款移动app时的一个事实是会有很多约束，比如硬件（CPU、RAM、Battery 等等）。如果你的代码设计不是很好，你会遇到一个非常让人头疼的问题：“Crash”,研究表明：

>
*Application Crashing is the most complained problem from mobile app user.
>
*应用崩溃时绝大多数应用使用者抱怨的问题。

and moreover
此外

>
* If application crashes 3 times in a row, about half of users will remove it from their phone.
>
* 如果应用程序联系崩溃三次，大约一半的用户将会卸载这款应用。

Crash Tracking System, which lets developer to collect every single details of crash directly from user's device, has been invented to take care of this issue especially. The most two popular Crash Tracking System to date are Crashlytics and Parse Crash Reporting, which are both totally-free service. Developer could integreate any of them in their app without charge. Whenever application crashes, the whole stacktrace will be sent to the backend which allow developer to fix every critical problems at the easiest manner. With this method, you would be able to deliver a Crash-Free Application in very short time.

崩溃跟踪系统，帮助开发者能够直接的葱用户的设备收集每一个崩溃原因，是不是发现这个功能很特殊。目前最受欢迎的崩溃跟踪系统是 [Crashlytics](http://fabric.io/)和[Parse Crash Reporting](http://blog.parse.com/2014/12/09/introducing-parse-crash-reporting-2/)，这两个系统都是完全免费的。开发者可以免费的集成他们在自己的应用中。不论什么时候app崩溃了，整个bug信息将会发送到后台，允许开发人员用最简单的方式去解决这些bug。通过这个方法，你可以在短时间内迭代一款不会影响正常使用的应用。

However, those data are collected in the service provider's server which may raise some concern for a big company about user data's privacy.

然而，提供崩溃信息收集的厂商收集这些崩溃信息同时也收集了用户信息，这可能让引起大公司担心用户隐私。

So ... is there any crash tracking system that allow us to set up our own server? Of course, there is! And it is actually quite easy to set up one. Here we go Application Crash Reporting on Android (ACRA), a library enabling Android Application to automatically post their crash reports to our own server.

所以，这儿有没有崩溃信息跟踪系统可以让我们搭建在自己的服务器上？那么就不存在泄漏用户隐私的担忧了。当然有了，并且这个系统提供了非常简单的搭建方法。在这里我们来介绍下[Application Crash Reporting on Android (ACRA)](https://www.acra.gov.sg/home/),一个库允许Android应用自动地发送崩溃信息到自己的服务器。

Let's start.

下面将会介绍如何去搭建。

## Setting up a server ##
## 搭建一个服务器 ##

Server side is a prerequisite for client side. So let's start with server side first.

服务器端是一个先决条件，让我们先从搭建服务器端开始。

Since ACRA is well designed and is quite popular. It allows developer to develop their own server system which we could see many of them out there. Anyway the best one I recommend is Acralyzer which is also developed by ACRA team. Acralyzer works on top of Apache CouchDB, so there is no need to install any additional software but only CouchDB.

由于ACRA设计的很好并且很受欢迎。它允许开发者开发自己的服务器系统，并且现在我们可以看到很多这样的系统。即便如此我觉得最好的是Acralyzer，这个也是由ACRA团队研发。Acralyzer工作在Apache CouchDB，所以
这里没有必要安装除了CouchDB以外的软件。


Acralyzer is quite be a full-featured backend for crash tracking system. The same stacktrace from different will be grouped as a single issue. If you are done fixing any issue, you can close it easily in just a single click. Moreover it also works in real-time. Only weakness I found in this system is its UI is a little too geeky. But who's care? It is made for developer。

Acralyzer是一个功能相当齐全的后端崩溃跟踪系统。来自不同原因的相同堆栈轨迹将会被分组成一个单一的问题。如果你解决了所有问题，你可以非常便捷的关闭Acralyzer服务，并且这种关闭服务的操作时实时的，我发现系统唯一的缺点是它的ui让人感到不舒服，但是谁会在乎这个？它是为开发者开发的。

It is quite easy to install one. Here is the full instruction on how to install Acralyzer on Ubuntu.

安装起来也很简单，下面将介绍如何在Ubuntu安装Acralyzer。

Start with installing couchdb. Open Terminal and type a command:

打开命令窗口，开始安装couchdb
>
*apt-get install couchdb

Test the installation with this command:

测试是否安装成功。
>
*curl http://127.0.0.1:5984

If you did it right, it would return as:
如果正确安装，会显示如下：
>
*{"couchdb":"Welcome","version":"1.2.0"}

Edit /etc/couchdb/local.ini file to allow us to access CouchDB through External IP (by default, it could be accessed through 127.0.0.1 only). Just simply uncomment these two lines:

编辑etc/couchdb/local.ini允许我们通过外部IP(默认的访问会通过127.0.0.1)去访问CouchDB。仅仅改变两行实现这个功能：
>
*;port = 5984
*;bind_address = 127.0.0.1


and change it to

改变为
>
*port = 5984
*bind_address = 0.0.0.0

In the same file, you have to do adding a username/password as an administrator account. Find this line (it supposes to be almost at the end of file):

在同一个文件夹下，你需要添加username/password作为管理员账户。找到这一行（应该会在文件末尾）
>
*[admins]

Add a username/password in the next line in username = password form, for example:

下一行添加username/password 形式为username = password，比如：
>
*[nuuneoi = 12345]


Please feel free to place a raw password there. Once CouchDB is restarted, your password will be hashed automatically and will be unreadable.

请不要对在这里书写明文密码感到担心，一旦CouchDB重启后，你的密码将会自动地散列，并且将会是不可读的，

Save your edited file and restart hashed through command line:

保存你刚刚编辑的文件同时通过命令行重启hashed：
>
*curl -X POST http://localhost:5984/_restart -H"Content-Type: application/json"

From now you, you will be able to access CouchDB through web browser. This web service is called Futon, a CouchDB's UI Backend. Just simply open this url on your web browser.

从现在起，你将可以通过浏览器访问CouchDB。这个web服务我们称之为Futon，一个CouchDB UI管理后台。在你的浏览器中打开这个地址。

>
*http://<YOUR_SERVER_IP>:5984/_utils

Here we go, Futon.

让我们开始吧，Futon。
![](http://inthecheesefactory.com/uploads/source/acra/futon.png)

First of all, login into the system with your administrator account set previously.

首先，通过你之前设置的管理员账号登陆这个系统。

Now we are going to install an acro-storage (Acralyzer's Storage Endpoing). From the right menu, press Replicator and fill in the form from Remote Database and to Local Database like this:

现在我们开始安装一个acro-storage (Acralyzer's Storage Endpoing).在左边的菜单，点击Replicator，然后填写远程存储改为本地存储的表单。
>
*from Remote Database: http://get.acralyzer.com/distrib-acra-storage to Local Database: acra-myapp

Press Replicate and wait until it is done.

点击Replicate然后等待，知道这个过程结束。

Next install Acralyzer with the same method but different parameters.

下一步安装Acralyzer通过同样的方法，但是参数是不同的。
>
*from Remote Database: http://get.acralyzer.com/distrib-acralyzer to Local Database: acralyzer

Press Replicate to install.

点击Replicate安装。

If you did it right, there will be 2 databases added in the system, acra-myapp and acralyzer.

如果你操作正确，系统将会有两个数据库，acra-myapp 和 acralyzer。

![](http://inthecheesefactory.com/uploads/source/acra/acra3.png)

We are almost there. Next step, we have to create a user for the client. Open Web Browser and go to this url:

我门就快大功告成了，下一步，我们需要为这个客户端创建一个用户，打开浏览器，然后打开这个网址：
>
*http://<YOUR_SERVER_IP>:5984/acralyzer/_design/acralyzer/index.html
![](http://inthecheesefactory.com/uploads/source/acra/admincreateuser.png)

Fill in any Username/Password you desire (no need to be the same as administrator account) and press Create User. These information will appear.

填写你想要的Username/Password，然后点击Create User，这些信息将会出现。
![](http://inthecheesefactory.com/uploads/source/acra/users2.png)

Copy them all and paste it to your favorite text editor. We would use it in client setting up part.

复制这些信息，然后粘贴到你的文本编辑器，我们可能会用这个在客户端设置。

The last thing we have to do it to protect the data inside acra-myapp by limit access just to the administrator or anyone would be able to access it. To do that, go into acra-myapp and press Securities, fill in Roles in Members section like this:

最后一件事是限制访问权限来保护在acra-myapp里面的数据，进入acra-myapp然后点击Securities，填写用户角色分配；
>
*["reader"]
![](http://inthecheesefactory.com/uploads/source/acra/reader.png)

Done !
After this, you could access the Dashboard from the same link as above:
Go to Admin tab and press Users

完工！
在这些结束后，你可以通过同一个网址访问这个控制台，去Admin选项卡，并选择Users。

>
*[http://<YOUR_SERVER_IP>:5984/acralyzer/_design/acralyzer/index.html

Please note that acro-myapp is created just for one app. In case you want to create a backend system for another app, please replicate another acro-storage with the same exact procedure but change the Local Database name to acra-<your_app_name>. Please note that it is necessary to start the name with acra- or it would not be listed as a choice on Dashboard.

请注意acro-myapp只能够为一款应用服务。以防你想为另外一款应用创建一个后台，请通过同样的过程复制另外一个acro-storage，但是改变本地数据库名为acra-<your_app_name>。请注意，有必要去通过acra- 去开启服务，或者它不能够在仪表盘中罗列为选择项供我们去选择。

If there is more than one app in the system, there will be a drop-down listbox in Acralyzer Dashboard page to let you choose which one you want to see the issues. Please feel free to give a try.

如果在系统中有不止一款应用，在Acralyzer的仪表盘中将会有一个下拉列表，让我们去选择看哪一个的问题。你可以试一试。

Setting up ACRA on Client Side

在客户端设置ACRA。

It is pretty easy to setup ACRA on client side. First of all, add a dependency on your build.gradle

在客户端中设置ACRA很简单，首先，在你的 build.gradle里添加ACRA的依赖配置信息。
>
*compile 'ch.acra:acra:4.6.1'

Sync your gradle files and then create a custom Application class and don't forget to define it in AndroidManifest.xml. (I assume that every Android Developer could do this)

同步你的gradle文件，然后创建一个自定义Application类，但是不要忘记在AndroidManifest.xml中定义这个Application类。（我假设每一个Android开发者不会忘记这么做）。

Add a Annotation @ReportCrashes above your custom Application created.

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
Now let's copy message generated from server side above and paste it inside @ReportsCrashes like this:

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
And the final step, just don't forget to add INTERNET permission inside AndroidManifest.xml or ACRA may not be able to send those stacktraces to your server.

最后一步，不要忘记添加在AndroidManifest.xml网络访问权限，否则ACRA可能无法发送这些日志信息到你的服务器上。
>
*<uses-permission android:name="android.permission.INTERNET"/>

Congratulations. It is now all done !

恭喜，现在所有的配置都已经完成，ACRA可以正常的工作，帮助你收集崩溃日志信息，从而你可以快速解决应用出现的问题。

##Testing##
##测试##
Now let's do some testing by force some crashing in your Activity. For example,

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
Run your application and then change a reason of crash and then run it again. And check your dashboard, you will see that those bugs report are sent to the backend system already.

运行你的应用，然后改变崩溃的原因，再运行一次。查看你的仪表盘，你将会看到这些发送到后台的bug。

![](http://inthecheesefactory.com/uploads/source/acra/acra.png)

Each bug item is a group of same reports from different user sent at the different time.

每一个bug来自不同用户不同时间，并且这些报告被分组了。
![](http://inthecheesefactory.com/uploads/source/acra/reportslist.png)

Take a deeper look into report, you will see that it comes with a full stacktrace.

仔细看看这些报告信息，你将会发现他们都是完整的崩溃信息。
![](http://inthecheesefactory.com/uploads/source/acra/stacktrace.png)

And also bunch of information which is enough to let you scroll for 7 pages...

并且非常多的信息，足足有7页。

If you finish fixing any bug, you could close the issue by simply press at the "bug" icon as highlighted in picture below.

如果你修复这些bug后，你可以关闭这个问题，通过简单的点击在页面中高亮显示的"bug"图标，
![](http://inthecheesefactory.com/uploads/source/acra/closeissue.png)

Hope that you guys find this article useful especially for a big company who need a Application Crash Tracking System but has a privacy concern on using those ready-to-use services.

希望这篇文章对你们有用，特别是对于一些需要应用崩溃信息收集但是却担心隐私信息的大公司可以来使用这个系统。

Actually ACRA comes with a lot of features for example, show a Toast or popup a Report Dialog when crashes. You could find those options in ACRA website.

事实上ACRA还有许多其他特性，比如：当一个月崩溃时显示Toast 或者 popup 来报告这些信息。你可以在ACRA网站上发现这些选项。

Acralytics is also the same, there are a lot of features to play with for example, you could set the server to send us email once there is a bug report sent into our system. More info are at Acralyzer.
Acralytics也一样，这里有许多其他特性可以使用，比如，你可以设置一个服务器来发送邮件给我们。

See ya again next blog ! =)

下一篇博客再见。


	






