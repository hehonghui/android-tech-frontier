英文原文：  [Android M "App Links" implementation in depth](https://chris.orr.me.uk/android-app-linking-how-it-works/)
安卓周报156期

At Google I/O 2015, a [new feature](http://www.androidpolice.com/2015/05/28/io-2015-android-m-will-support-app-deep-linking-without-that-annoying-selector-prompt/) was announced that allows "app developers to associate an app with a web domain they own."  This is intended to minimise the number of times a user sees the "Open with" dialog to choose which app, among those that can handle a certain URL, should be used to open a link.

谷歌2015年的I/O大会上宣布了一个[新特性](http://www.androidpolice.com/2015/05/28/io-2015-android-m-will-support-app-deep-linking-without-that-annoying-selector-prompt/)：允许开发者将app和他们的web域名关联。这一举措是为了最小化用户遇到“打开方式”对话框的概率。

For example, with two Twitter apps installed — the official client, and [Falcon Pro](https://play.google.com/store/apps/details?id=com.jv.materialfalcon) — when you click on a Twitter URL from somewhere, you will currently see a dialog like this:

比如，我们安装了两个Twitter应用 - 官方的和[Falcon Pro](https://play.google.com/store/apps/details?id=com.jv.materialfalcon)。当你在某个地方点击了Twitter URL的时候，你会看到如下的对话框：

![Clicking a Twitter link in the Android messaging app](https://chris.orr.me.uk/img/posts/app-links-sms.png) ![app-links-intent-chooser-dialog.png](https://chris.orr.me.uk/img/posts/app-links-intent-chooser-dialog.png "1433755732968129.png")

With Android M — and with an app that has explicitly opted-in to App Linking — this dialog will no longer be shown.  Clicking on a link will open the _official app_ immediately, without prompting the user; there will be no chance to use a third-party app, or even a browser.

但是在安卓M中，如果一个app明确的指定了App链接-这个对话框将不复存在。点击一个链接将立即打开官方的app，没有第三方app的机会，更不会打开一个浏览器。

In this example, when you click on that link, the Android system checks whether any of the apps that can handle twitter.com URLs have auto-linking enabled.  The system then verifies with twitter.com which app(s) may handle links for that domain, so that we can avoid prompting the user.

在上图的例子中，当你点击了那个链接，安卓系统会检查是否有一个app可以处理twitter.com URL，然后跟twitter.com核对哪个app（s）可以处理该域名的链接，这样我们就能避免影响用户。

Note that Android does not actively verify these links on demand, so there is no blocking on the network before Android decides which app to use.  More about that later.

注意安卓并不会在点击链接的时候才核对这些链接，因此在安卓决定使用哪个app之前并不会有网络阻塞。关于这点后面有更多讨论。

While this will make Android more convenient — in the majority of cases, you do want clicking a link to open the most appropriate app — it seems bad for people who prefer to use third-party apps.  But note that this behaviour can be turned off from the system settings in Android M, on a per-app basis.

虽然这会使安卓更方便- 多数情况下，你确实希望点击一个链接打开的是最合适的那个app- 但是对于那些喜欢使用第三方app的人来说，似乎是一件坏事。不过这种行为可以在Android M的系统设置中关掉。

##  app开发者如何实现App Links

The basic implementation details can be found on the [Android Developers' Preview Site](https://developer.android.com/preview/features/app-linking.html).

实现的细节可以在[Android Developers&#39; Preview 网站](https://developer.android.com/preview/features/app-linking.html)上找到。

If you have an app that handles links for, say, `example.com`, you must:

如果你有一个需要处理链接（比如example.com）的app，你应该：

*   Have the ability to upload files to the root of `example.com`  Without this, you can't have your app automatically be the default for opening these links

*   Update your `build.gradle` with `compileSdkVersion 'android-MNC'`
*   Add the attribute `android:autoVerify="true"` to each `&lt;intent-filter&gt;` tag that contains `&lt;data&gt;` tags for HTTP or HTTPS URLs

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

Verification is done per hostname and not per intent filter, so you don't _technically_ need to add this attribute to each tag if you have multiple, but it doesn't hurt.

认证是以主机名为单位的而不是以intent filter为单位的，因此从技术上讲，并不需要为每个标签都添加该属性，但是添加了也不会出什么问题。

### 创建JSON文件
To allow Android to verify that your app should be allowed to use the app linking behaviour, you need to supply a JSON file with the application ID and the public certificate fingerprint of the APK(s) in question.

为了能让安卓可以认证，你的app需要被允许使用app链接行为，为此，需要提供一个JSON文件，JSON文件中需要包含app的ID以及APK的公钥证书。

The file must contain a JSON array with one or more objects, one per app ID you wish to verify:

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

For example, if you have a `com.example.myapp` release version, and a `com.example.myapp.beta` beta version, you can allow both to be verified by specifying two objects in the array, each with the respective application ID and certificate values.

比如，你现在有一个com.example.myapp的发行版app，同时还有一个叫com.example.myapp.beta的beta版app，你可以通过在数组中设置两个对象来允许两者都可以接受认证，每个对象带有各自的app ID和公钥值。

Note that the validation of this file is **very strict**: every object in the array must look exactly like the one here.  Adding any other objects to the array, or additional properties to an object will cause validation to fail entirely — even if the object for the app in question is valid.

注意，这个文件的验证是非常严格的：数组中的每个对象都必须和上面的那个一模一样。在数组中添加了任意其他的对象，或者对象中有额外的属性都会导致整个验证失败。- 即便这个app对象是有效的。

It seems that you can specify multiple SHA256 certificate fingerprints per app, in case you sign the same build with different keys for some reason.  In any case, this fingerprint can be obtained via:	

为了防止为同一个构建注册了不同的key，貌似一个app可以指定多个SHA256指纹证书，不管怎样，指纹证书可以通过如下方式获得：

<pre class="brush:js;toolbar:false">echo | keytool -list -v -keystore app.keystore 2&gt; /dev/null | grep SHA256:</pre>

### 上传JSON文件

Having created this file, you must upload it and ensure it's available at the verification URL: `http://example.com/.well-known/statements.json`.

创建完文件之后，你需要上传它同时保证它可以使用这个URL访问http://example.com/.well-known/statements.json。

Currently this URL **must** be accessible via HTTP; the final M release will **only** attempt to access the URL via HTTPS.
Redirects to HTTPS, or any other redirect (whether via HTTP status codes 301, 302 or 307) seem to be ignored and treated as a failure in the first M preview release.

目前这个URL是http的，最终的M版本将只允许通过HTTPS访问该URL。
在第一个M预览版中，重定向到HTTPS，或者任何其他重定向（301，302或者307）貌似都会被忽略并被视为失败。

The scheme of the verification URL is also independent from the `android:scheme` values in your `&lt;intent-filter&gt;` tags. Even if you have a filter that only accepts HTTPS URLs, the verification URL still needs to be available via HTTP.	

URL的scheme和&lt;intent-filter&gt;标签中的android:scheme值是互不相干的，即使你有一个只接受HTTPS URLs的filter，认证URL仍然需要通过HTTP访问。

After we've taken a look at how Android uses this information, we'll see how this process can be debugged.

在了解了安卓如何使用这些信息之后，我们来看看如果debug这个过程。

## Android M是如何实现App Links的

App link verification involves two components in the Android system: the Package Manager and an Intent Filter Verifier.

App链接认证涉及到安卓系统的两个组建：Package Manager和Intent Filter Verifier。

**PackageManager** is the standard component that has always been around — it takes care of verifying that APKs for installation are valid, granting permissions to apps, and otherwise being the source of truth about what's installed on the system.

**PackageManager**是一个无处不在的标准组建 - 它负责验证所安装的apk是否有效，授予app权限，另外还可以通过它知道系统上安装了些什么app。

New in Android M is the **Intent Filter Verifier**.  This is a component responsible for fetching the app link verification JSON, parsing it, validating it, and reporting back to PackageManger.

而**Intent Filter Verifier**则是Android M上才有的新玩意儿。这个组建负责获取链接指向的JSON认证，解析它，验证它，然后将报告返回给PackageManger。
	
It appears that there can only be one Intent Filter Verifier active on the system, though this component isn't something that users can easily replace — in order to register as a verifier, the `android.permission.INTENT_FILTER_VERIFICATION_AGENT` permission is required, which is only available to apps signed with the system key.

虽然这个组建不是用户轻易就能替换的，但似乎系统中只能有一个活动状态的Intent Filter Verifier - 想要注册成为一个verifier，必须要有android.permission.INTENT_FILTER_VERIFICATION_AGENT权限，而这个权限只有签名了系统密钥的app才能得到。

You can see the current active intent filter verifier via the command:

你可以通过如下的命令查看当前激活的intent filter verifier：

<pre class="brush:js;toolbar:false">adb shell dumpsys package ifv</pre>

In the first M preview release, `com.android.statementservice` fulfils this role.

在第一个M预览版中，com.android.statementservice完全扮演了这个角色。

###  How App Links are verified
	

App link verification is done once — at install time.  This is done so that, as mentioned above, the system does not need to block on the network every time you click on a link.

App链接认证在安装的时候就一次性完成。这就是为什么刚刚我们说不必在每次点击链接的时候都阻塞网络。

![](https://chris.orr.me.uk/img/posts/app-links-system-diagram.png)
 
When a package is installed, or an existing package is updated:

当一个package安装的时候，或者现有的package升级的时候：
* 1.  PackageManager does its usual validation of the incoming APK
* 2.  If successful, the package will be installed, and a broadcast intent with the action `android.intent.action.INTENT_FILTER_NEEDS_VERIFICATION` is sent, along with the installed package info
* 3.  The Intent Filter Verifier has a broadcast receiver which picks this up
* 4.  A list of _unique hostnames_ is compiled from the `&lt;intent-filter&gt;` tags in the package
* 5.  The verifier attempts to fetch `statements.json` from each unique hostname
* 6.  Every JSON file fetched is checked for the application ID and certificate of the installed package
* 7.  If (and only if) **all** files match, then _success_ is signalled to PackageManager; otherwise _failure_
* 8.  PackageManager stores the result

* 1.PackageManager对即将安装的apk做常规的验证。
* 2.如果成功，这个package将被安装，同时发出一个带有android.intent.action.INTENT_FILTER_NEEDS_VERIFICATION的广播intent，intent中还携带有该package的信息。
* 3.Intent Filter Verifier的广播接收器将获取这个广播。
* 4.从package的&lt;intent-filter&gt;标签中编译出一个特有主机名的列表。
* 5.verifier尝试从每个特有的主机名中获取statements.json。
* 6.每一个被获取的JSON文件都会检查它的application ID和安装包的证书。
* 7.只有当所有文件同时满足时，才会发送成功信息到PackageManager，否则失败。
* 8.PackageManager存储结果。

If verification fails, app link behaviour will not be available to your app until verification succeeds — your app will appear in the "Open with" dialog as usual (unless another app has passed verification for the same hostname).	

如果认证失败，app链接将无法指向你的app - 你的app会像往常一样出现在“打开方式”对话框中（除非另一个app通过了同一域名的验证）。

As far as I can tell, verification is only attempted once per install or upgrade, so the next chance to pass verification for most users will be when they next upgrade your app.

就我所了解的而言，认证只会在安装和升级的时候会发生，因此对大多数用户来说，再次通过验证的机会是在app下一次升级的时候。

###  Intent Filter Verifier的行为

**主机名**

Note that `example.com` and `www.example.com` are treated as separate hostnames.  This means your `statements.json` must be reachable directly at both hostnames.	

example.com和www.example.com会被认为是两个独立的主机名。因此要求statements.json在两个主机名下都是可直达的。

For example, if you automatically redirect all requests to `http://www.example.com/*` to `https://example.com/*`, then this will cause verification to fail for this one hostname, and therefore app link verification as a whole will fail.

比如，如果你将所有的请求都重定向到http://www.example.com/* to https://example.com/*，则会让这个主机名的认证失败，从而导致整个app链接认证失败。

In this case, you would have to add special cases to your web server configuration to ensure that every request for `statements.json` directly returns an HTTP 200.  Possibly this rule will be relaxed in future releases.

这种情况下，你可能需要为你的web服务器做特殊的配置，确保每个对于statements.json的请求都有能直接返回HTTP 200。这个约束在后面的版本中可能会有所放松。

**响应时间**

If the verifier cannot create a connection to your web server and receive an HTTP response within five seconds, verification will fail.

如果verifier不能在5秒之内和你的web服务器建立链接并接收到HTTP响应，认证会失败。

**Lack of connectivity缺少链接环境**

Likewise, if the device is offline when verification starts, or has a bad connection, verification will fail.

同样的，如果在认证开始的时候设备是离线的，或者网络环境很差，认证也会失败。

**HTTP 缓存**

目前Intent Filter Verifier的实现基本遵循HTTP缓存规则。

If your `statements.json` response contains a `Cache-Control: max-age=[seconds]` header, the response will be cached on disk by the verifier.  Though `max-age` values under 60 seconds are ignored; in fact 60 seconds seem to be _added_ to all `max-age` values (for some reason).  Similarly, an `Expires` header is also respected when caching responses.


如果你的statements.json响应包含了Cache-Control: max-age=[seconds]头部，那么这个响应将被verifier缓存到磁盘。虽然 60秒以下的'max-age'会被忽略，但是60秒似乎也足够了。同样的一个`Expires` header 也会被缓存。



If you have ETag or Last-Modified headers, 
then the verifier will attempt to make a conditional request using these
 values the next time it attempts to verify the corresponding hostname.
Though from what I&#39;ve seen, if these headers exist but without explicit 
cache control headers, the response will be cached for a possibly 
indefinite length of time.

如果你有ETag或者最近更新的headers，那么verifier将在下一次视情况使用这些值来验证相应的主机。据我所知，如果这些header子退出之后没有明确指定缓存控制头，那么响应的缓存时间将是不确定的。


Cache headers are only respected for HTTP 200 responses. &nbsp;If you have
 a 404 response with any sort of cache expiry headers, these will be 
ignored the next time the verifier needs to contact your hostname.

缓存头部只理会http 200的响应，如果是一个404响应，那么下次将忽略，verifier需要直接连接主机。

### Debugging App Links

When the Android system attempts to verify your app link setup, there is little feedback aside from a true/false value reported by `PackageManager` to logcat, e.g.:

当安卓系统试图认证你的app链接时，PackageManager除了向logcat中报告true/false值之外，还有一些其他反馈，比如：

<pre class="brush:js;toolbar:false">IntentFilter ActivityIntentInfo{1a61a0a com.example.myapp/.MainActivity}
 verified with result:true and hosts:example.com www.example.com</pre>

However, you can ask the system at any time for the app linking verification status of your package:

但是，你可在任意时刻向系统查询package的app链接认证状态：

<pre class="brush:js;toolbar:false">adb shell dumpsys package d</pre>

This will return a list of verification entries like this:

这会返回如下的认证条目信息：

<pre class="brush:js;toolbar:false">Package Name: com.example.myapp
Domains: example.com www.example.com
Status: always</pre>

There may be multiple entries for your package: one for the system, and zero or more for users on the system, whose preferences override the system value.

可能会有多个关于你package的条目：一个是系统的，零个或者多个用户的- 有些用户的偏好覆盖了系统参数。

The possible status values seem to be:

可能会产生的状态值大致如下：
	
*   **undefined** — apps which do not have link auto-verification enabled in their manifest
*   **ask** — apps which have failed verification (i.e. _ask_ the user via the "Open with" dialog)
*   **always** — apps which have passed verification (i.e. _always_ open this app for these domains)
*   **never** — apps which have passed verification, but have been disabled in the system settings


*   **undefined** —&nbsp; app没有在manifest中启用链接自动验证功能。

*   **ask** — app验证失败（会通过打开方式对话框询问用户）

*   **always** — app通过了验证（点击这个域名总是打开这个app）

*   **never** — app通过了验证，但是系统设置关闭了此功能。


If you didn't manage to pass verification, you can retry by simpling reinstalling the same version, e.g.:

如果你没能通过认证，你可以再次尝试重新安装同一版本：

<pre class="brush:js;toolbar:false">adb install -r app/build/outputs/apk/app-debug.apk</pre>


If you can't see the `statements.json` URL being requested on your web server at install time, you can clear out the Intent Verifier Service HTTP cache, so that next time it will have to hit the server:

如果你在安装的时候没有在服务器上看见statements.json URL的请求，你可以清空Intent Verifier服务的HTTP缓存，这样下次就会直接请求服务器：

<pre class="brush:js;toolbar:false">adb shell pm clear com.android.statementservice</pre>

If you have doubts about whether the `statements.json` contents are returned correctly, you can use the `-tcpdump` option of the Android emulator to check exactly what's being sent over the network — though note this won't work so simply once the final M release is out and encryption is required.

如果你不知道statements.json的内容是否正确返回，可以使用安卓模拟器的-tcpdump选项来检查网络上发送的是什么 - 注意安卓M最终版出来之后就没那么容易了，因为数据是加密的。


Alternatively you can use the `-http-proxy` option of the emulator and pass all network requests through a proxy like [Charles](http://charlesproxy.com/).


还有一种选择，那就是使用模拟器的-http-proxy选项，让所有的网络请求都通过代理，比如[Charles](http://charlesproxy.com/)代理。

##  总结

Although I was initially sceptical about App Links due to a perceived takeover of the existing, amazing intent system of Android, I'm glad to see that it should help in most cases, and there is a very simple way to turn this off in the cases where users don't like it.

虽然在开始我担心App Links会取代目前安卓上非常酷的intent机制，但是也乐于看到这对于大多数情况都是有用的，况且如果用户不喜欢，使用简单的方法就可以把它关掉。


Given that the JSON parsing and HTTP request behaviour are remarkably strict in the verifier service, hopefully some of the detailed information here will help you with your implementation of app linking.

Good luck!	


考虑到verifier服务对JSON解析和HTTP请求异常严格，希望这里所提到的一些细节对你实现app linking有所帮助。祝你好运！

    
