# Android M的App Links实现详解
-----

> * 原文链接 : [THINGS YOU MAY NOT KNOW: ONRESUMEFRAGMENTS](http://www.randomlytyping.com/blog/2015/6/5/things-you-may-not-know-about-onresumefragments)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [jianghejie](https://github.com/jianghejie) 


谷歌2015年的I/O大会上宣布了一个[新特性](http://www.androidpolice.com/2015/05/28/io-2015-android-m-will-support-app-deep-linking-without-that-annoying-selector-prompt/)：允许开发者将app和他们的web域名关联。这一举措是为了最小化用户遇到“打开方式”对话框的概率。

比如，我们安装了两个Twitter应用 - 官方的和[Falcon Pro](https://play.google.com/store/apps/details?id=com.jv.materialfalcon)。当你在某个地方点击了Twitter URL的时候，你会看到如下的对话框：

![Clicking a Twitter link in the Android messaging app](https://chris.orr.me.uk/img/posts/app-links-sms.png) ![app-links-intent-chooser-dialog.png](https://chris.orr.me.uk/img/posts/app-links-intent-chooser-dialog.png "1433755732968129.png")

但是在安卓M中，如果一个app明确的指定了App链接-这个对话框将不复存在。点击一个链接将立即打开官方的app，没有第三方app的机会，更不会打开一个浏览器。

在上图的例子中，当你点击了那个链接，安卓系统会检查是否有一个app可以处理twitter.com URL，然后跟twitter.com核对哪个app（s）可以处理该域名的链接，这样我们就能避免影响用户。

注意安卓并不会在点击链接的时候才核对这些链接，因此在安卓决定使用哪个app之前并不会有网络阻塞。关于这点后面有更多讨论。

虽然这会使安卓更方便- 多数情况下，你确实希望点击一个链接打开的是最合适的那个app- 但是对于那些喜欢使用第三方app的人来说，似乎是一件坏事。不过这种行为可以在Android M的系统设置中关掉。

##  app开发者如何实现App Links

实现的细节可以在[Android Developers&#39; Preview 网站](https://developer.android.com/preview/features/app-linking.html)上找到。

如果你有一个需要处理链接（比如example.com）的app，你应该：

*  有上传文件到example.com根路径的权限，如果没有，你无法让你的app成为这些链接的默认打开方式。
*  在build.gradle文件中设置compileSdkVersion &#39;android-MNC&#39;。
*  为每个这样的&lt;intent-filter&gt;标签

<pre class="brush:js;toolbar:false">&lt;intent-filter&gt;
    &lt;data android:scheme=&quot;http&quot; /&gt;
    ...
&lt;/intent-filter&gt;</pre>

添加属性android:autoVerify=&quot;true&quot;。http也可以是https。

注：这里对filter的写法略去了很多，其实官网（上面的那个链接）有完整的示例：

<pre class="brush:js;toolbar:false">&lt;activity ...&gt;
    &lt;intent-filter android:autoVerify=&quot;true&quot;&gt;
        &lt;action android:name=&quot;android.intent.action.VIEW&quot; /&gt;
        &lt;category android:name=&quot;android.intent.category.DEFAULT&quot; /&gt;
        &lt;category android:name=&quot;android.intent.category.BROWSABLE&quot; /&gt;
        &lt;data android:scheme=&quot;http&quot; android:host=&quot;www.android.com&quot; /&gt;
        &lt;data android:scheme=&quot;https&quot; android:host=&quot;www.android.com&quot; /&gt;
    &lt;/intent-filter&gt;
&lt;/activity&gt;</pre>

认证是以主机名为单位的而不是以intent filter为单位的，因此从技术上讲，并不需要为每个标签都添加该属性，但是添加了也不会出什么问题。

### 创建JSON文件

为了能让安卓可以认证，你的app需要被允许使用app链接行为，为此，需要提供一个JSON文件，JSON文件中需要包含app的ID以及APK的公钥证书。

这个文件必须包含一个JSON数组，数组中可以有一个或者多个对象，每个对象对应一个你想认证的app ID:

<pre class="brush:js;toolbar:false">[
  {
    &quot;relation&quot;: [&quot;delegate_permission/common.handle_all_urls&quot;],
    &quot;target&quot;: {
      &quot;namespace&quot;: &quot;android_app&quot;,
      &quot;package_name&quot;: &quot;com.example.myapp&quot;,
      &quot;sha256_cert_fingerprints&quot;: [&quot;6C:EC:C5:0E:34:AE....EB:0C:9B&quot;]
    }
  }
]</pre>

比如，你现在有一个com.example.myapp的发行版app，同时还有一个叫com.example.myapp.beta的beta版app，你可以通过在数组中设置两个对象来允许两者都可以接受认证，每个对象带有各自的app ID和公钥值。

注意，这个文件的验证是非常严格的：数组中的每个对象都必须和上面的那个一模一样。在数组中添加了任意其他的对象，或者对象中有额外的属性都会导致整个验证失败。- 即便这个app对象是有效的。

为了防止为同一个构建注册了不同的key，貌似一个app可以指定多个SHA256指纹证书，不管怎样，指纹证书可以通过如下方式获得：

<pre class="brush:js;toolbar:false">echo | keytool -list -v -keystore app.keystore 2&gt; /dev/null | grep SHA256:</pre>

### 上传JSON文件

创建完文件之后，你需要上传它同时保证它可以使用这个URL访问http://example.com/.well-known/statements.json。

目前这个URL是http的，最终的M版本将只允许通过HTTPS访问该URL。
在第一个M预览版中，重定向到HTTPS，或者任何其他重定向（301，302或者307）貌似都会被忽略并被视为失败。

URL的scheme和&lt;intent-filter&gt;标签中的android:scheme值是互不相干的，即使你有一个只接受HTTPS URLs的filter，认证URL仍然需要通过HTTP访问。

在了解了安卓如何使用这些信息之后，我们来看看如果debug这个过程。

## Android M是如何实现App Links的

App链接认证涉及到安卓系统的两个组建：Package Manager和Intent Filter Verifier。

**PackageManager**是一个无处不在的标准组建 - 它负责验证所安装的apk是否有效，授予app权限，另外还可以通过它知道系统上安装了些什么app。

而**Intent Filter Verifier**则是Android M上才有的新玩意儿。这个组建负责获取链接指向的JSON认证，解析它，验证它，然后将报告返回给PackageManger。

虽然这个组建不是用户轻易就能替换的，但似乎系统中只能有一个活动状态的Intent Filter Verifier - 想要注册成为一个verifier，必须要有android.permission.INTENT_FILTER_VERIFICATION_AGENT权限，而这个权限只有签名了系统密钥的app才能得到。

你可以通过如下的命令查看当前激活的intent filter verifier：

<pre class="brush:js;toolbar:false">adb shell dumpsys package ifv</pre>

在第一个M预览版中，com.android.statementservice完全扮演了这个角色。

###  How App Links are verified

App链接认证在安装的时候就一次性完成。这就是为什么刚刚我们说不必在每次点击链接的时候都阻塞网络。

![](https://chris.orr.me.uk/img/posts/app-links-system-diagram.png)
 
当一个package安装的时候，或者现有的package升级的时候：

* 1.PackageManager对即将安装的apk做常规的验证。
* 2.如果成功，这个package将被安装，同时发出一个带有android.intent.action.INTENT_FILTER_NEEDS_VERIFICATION的广播intent，intent中还携带有该package的信息。
* 3.Intent Filter Verifier的广播接收器将获取这个广播。
* 4.从package的&lt;intent-filter&gt;标签中编译出一个特有主机名的列表。
* 5.verifier尝试从每个特有的主机名中获取statements.json。
* 6.每一个被获取的JSON文件都会检查它的application ID和安装包的证书。
* 7.只有当所有文件同时满足时，才会发送成功信息到PackageManager，否则失败。
* 8.PackageManager存储结果。

如果认证失败，app链接将无法指向你的app - 你的app会像往常一样出现在“打开方式”对话框中（除非另一个app通过了同一域名的验证）。

就我所了解的而言，认证只会在安装和升级的时候会发生，因此对大多数用户来说，再次通过验证的机会是在app下一次升级的时候。

###  Intent Filter Verifier的行为

**主机名**

example.com和www.example.com会被认为是两个独立的主机名。因此要求statements.json在两个主机名下都是可直达的。

比如，如果你将所有的请求都重定向到http://www.example.com/* to https://example.com/*，则会让这个主机名的认证失败，从而导致整个app链接认证失败。

这种情况下，你可能需要为你的web服务器做特殊的配置，确保每个对于statements.json的请求都有能直接返回HTTP 200。这个约束在后面的版本中可能会有所放松。

**响应时间**

如果verifier不能在5秒之内和你的web服务器建立链接并接收到HTTP响应，认证会失败。

**缺少链接环境**

同样的，如果在认证开始的时候设备是离线的，或者网络环境很差，认证也会失败。

**HTTP 缓存**

目前Intent Filter Verifier的实现基本遵循HTTP缓存规则。

如果你的statements.json响应包含了Cache-Control: max-age=[seconds]头部，那么这个响应将被verifier缓存到磁盘。虽然 60秒以下的'max-age'会被忽略，但是60秒似乎也足够了。同样的一个`Expires` header 也会被缓存。

如果你有ETag或者最近更新的headers，那么verifier将在下一次视情况使用这些值来验证相应的主机。据我所知，如果这些header子退出之后没有明确指定缓存控制头，那么响应的缓存时间将是不确定的。

缓存头部只理会http 200的响应，如果是一个404响应，那么下次将忽略，verifier需要直接连接主机。

### Debugging App Links

当安卓系统试图认证你的app链接时，PackageManager除了向logcat中报告true/false值之外，还有一些其他反馈，比如：

<pre class="brush:js;toolbar:false">IntentFilter ActivityIntentInfo{1a61a0a com.example.myapp/.MainActivity}
 verified with result:true and hosts:example.com www.example.com</pre>

但是，你可在任意时刻向系统查询package的app链接认证状态：

<pre class="brush:js;toolbar:false">adb shell dumpsys package d</pre>

这会返回如下的认证条目信息：

<pre class="brush:js;toolbar:false">Package Name: com.example.myapp
Domains: example.com www.example.com
Status: always</pre>

可能会有多个关于你package的条目：一个是系统的，零个或者多个用户的- 有些用户的偏好覆盖了系统参数。

可能会产生的状态值大致如下：

*   **undefined** —&nbsp; app没有在manifest中启用链接自动验证功能。

*   **ask** — app验证失败（会通过打开方式对话框询问用户）

*   **always** — app通过了验证（点击这个域名总是打开这个app）

*   **never** — app通过了验证，但是系统设置关闭了此功能。

如果你没能通过认证，你可以再次尝试重新安装同一版本：

<pre class="brush:js;toolbar:false">adb install -r app/build/outputs/apk/app-debug.apk</pre>

如果你在安装的时候没有在服务器上看见statements.json URL的请求，你可以清空Intent Verifier服务的HTTP缓存，这样下次就会直接请求服务器：

<pre class="brush:js;toolbar:false">adb shell pm clear com.android.statementservice</pre>

如果你不知道statements.json的内容是否正确返回，可以使用安卓模拟器的-tcpdump选项来检查网络上发送的是什么 - 注意安卓M最终版出来之后就没那么容易了，因为数据是加密的。

还有一种选择，那就是使用模拟器的-http-proxy选项，让所有的网络请求都通过代理，比如[Charles](http://charlesproxy.com/)代理。

##  总结

虽然在开始我担心App Links会取代目前安卓上非常酷的intent机制，但是也乐于看到这对于大多数情况都是有用的，况且如果用户不喜欢，使用简单的方法就可以把它关掉。

考虑到verifier服务对JSON解析和HTTP请求异常严格，希望这里所提到的一些细节对你实现app linking有所帮助。祝你好运！

    
