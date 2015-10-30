开发安全的Android应用
---

> * 原文链接 : [Develop a secured Android application](http://blog.octo.com/en/develop-secured-android-application/?utm_source=Android+Weekly&utm_campaign=0903213dbd-Android_Weekly_175&utm_medium=email&utm_term=0_4eb677ad19-0903213dbd-337955857)
* 原文作者 : [Rémi Pradal](http://blog.udinic.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [kevinhong](https://github.com/kevinhong) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

安卓应用已经广泛用于处理非常敏感的信息。保证用户的信息不被居心叵测的人轻易截获是每个Android开发者的责任。“开放网络应用安全项目“ (The Open Web Application Security Project )(OWASP) (引用[9], 引用[10]) 试图列举移动应用的安全风险。有些是系统架构的责任（比如由于服务器缺陷产生的问题），有些与后端开发者有关（比如认证检查等），还有些则与移动开发者有关。这篇文章，我们将会关注与Android开发者相关的那些问题。

因此，我们将会再次讨论三个潜在的风险源头：

>- 与WebService通信的风险
>- 存储在设备上的信息被泄漏的风险
>- 我们的应用呗第三方修改的风险

## 1. 安全的WebService请求

在使用WS请求的敏感应用中，最重要的事情是确保与后端通信的数据的安全性。事实上，就算应用本身是安全的，但其通过Internet发送的请求能被轻易截获，那也是没有用的。

###威胁 : 中间人攻击 (MITM)

当一个应用被中间人攻击时，将会产生两个主要的风险。


1. **信息泄露**

    如果一个攻击者可以控制用户使用应用的本地网络，他就可以偷偷的轻易截获这个应用和WebService之间通信的所有内容。

2. **Webservice (WS) 模仿**

    对于了解WS格式的攻击者，则可以阻止应用程序的正常请求并为应用程序提供假的返回值。在这种情况下，用户以为请求已经正常执行了，然而请求却从未到达后端。

    测试你的应用是否能被中间人轻易攻击非常容易。你只需要用一个代理服务器软件， (如：CharlesProxy （引用[12]）)，然后将测试设备的代理服务器设置为安装了这个软件的电脑上。如果你的应用没有做针对MITM的保护，你将会很容易看到你的App发起的每一个请求（的内容）。现在，假设有一个你的App的用户通过一个不安全的网络去连接WebServices，攻击者可以轻易在路由上安装一个这样的代理软件，它将会清楚的嗅探到所有的请求。

###攻击的起源：TLS/SSL证书链

确保通信安全，最起码要使用HTTPS协议，例如使用TLS的加密通信或者其前身SSL加密。同时，如果条件允许，这并不是我们的系统需要遵守的唯一约束。想弄明白原因，我们需要先来看看SSL协议的工作原理。

一组SSL证书至少包括下面三个证书

>- **根证书（Root certificate）.** 是由证书授权机构(Certification Authority ，CA)签发的证书。证书授权机构是一个能够确保整个传输过程安全的一个可信机构。
>- **中间证书（Intermediate certificate(s)）. ** 中间证书可以有多个。它是最终用户证书和跟证书的链路。该证书专门用于服务器发布WS服务，该证书由**根证书**签发。
>- **最终用户证书（End-user certificate）. ** 最终用户证书可以用于与WebService服务器通信。

**Android 原生的SSL保护:**
Android网络层有嵌入了一些CA证书的列表（有一百多个，你可以在设备的设置菜单查看）。每一个HTTPS请求的证书链的根证书，都必须是其中之一。

然而，与服务器通信过程的请求链中的其他证书的安全性，仍然无法确认。恶意用户还是可以通过向CA买一个中间证书来实现中间人攻击。系统会认为网络传输的过程是有效的。这种方式的恶意攻击非常常见，有研究显示（引用[1]），使用HTTPS请求的应用程序，有73％没有使用适当的方式来检查证书。

###如何确认我们对后端服务的请求过程是安全的

解决上述问题的方法，在于手动检查中间证书（该证书对服务器来说应该是特定的）是一个已知的证书。这意味着，我们不得不在应用程序中存储那个特定的服务器证书。它可以作为资源文件，或者直接在代码中作为常量，

也许你会奇怪，为什么我们必须检查中间证书而不是检查最终用户证书。这有两个原因：第一个，稍后我们会看到，最终用户证书的生命周期非常短暂。第二个原因也是处于安全考虑：假设黑客控制了你的系统，他们将会获取你的私钥（private key）。应用会认为这些请求是由正确的终端用户签名的，就会允许链接。如果确认过程由中间服务器完成，中间服务器就可以远程的通过中间CA回收证书。


在JAVA中，可以使用``SSLSocketFactory``类，来确认SSL链接是否安全。创建来执行中间证书检查，需要经过以下几步：

－

1. 继承``X509TrustManger``，这个位于 java.net.ssl 包中的抽象类用于检查SSL链接在服务端的有效性。


```JAVA
public class MyX509TrustManager implements X509TrustManager {
    private X509Certificate certificate;
    
    public MyX509TrustManager (InputStream knownIntermediateCertificate) throws CertificateException {
        CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
        certificate = certFactory.generateCertificate(knownIntermediateCertificate);
    }
    
    @Override
    public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        // Do nothing. We only want to check server side certificate.
    }
    
    @Override
    public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        // Verify that the certificate domain name matches the expected one
        if (!chain[0].getIssuerDN().equals(certificate.getSubjectDN())) {
            throw new CertificateException("Parent certificate of server was different than expected signing certificate");
        }
        
        try {
            // Verifiy that the certificate key matches the expected one
            chain[0].verify(certificate.getPublicKey());
            
            // Verify that the certificate has not expired
            chain[0].checkValidity();
        } catch (Exception e) {
            throw new CertificateException("Parent certificate of server was different than expected signing certificate");
        }
    }
    
    @Override
    public X509Certificate[] getAcceptedIssuers() {
        // Do nothing
        return new X509Certificate[0];
    }
}
```

2. 设置一个``SSLSocketFactory``，这段代码需要在网络请求前运行。

``` Java
TrustManager[] trustManagerArray = new TrustManager[1];
MyTrustManager trustManager = new MyTrustManager(TRUSTED_CERTIFICATE);
trustManagerArray[0] = trustManager;

final SSLContext sslc;

// TLS is the last SSL protocol and is used by all the CA
sslc = SSLContext.getInstance("TLS");

// We only need to give a TrustManager list as we don't need to perform client authentification
sslc.init(null, trustManagers, null);
HttpsURLConnection.setDefaultSSLSocketFactory(sslc.getSocketFactory());
``` 

###证书检查的潜在缺点

1. 中间证书可能过期（他们的生命周期是大约十年）。解决方案是在旧证书过期前，将新证书加入白名单。

2. 中间证书可能存在风险。如果中间CA被黑，整个安全机制将会毫无用处。事实上，如果中间CA的私钥被黑客获取，它就可以伪造一个证书链，该证书链将会与你的证书链由相同的中间证书。这样，攻击者就可以实现中间人攻击。甚至CA是理论安全的，也不排除会发生诸如2011年DigiNotar被黑的事件（引用[13]）。那样的话，就必须更换服务器的SSL证书链，并上线包含新的中间证书的版本。

3. ``SSLSocketFactory``的信任策略会应用到应用程序的所有请求。如果有SDK嵌入，也需要为SDK的远程服务器嵌入中间证书。让其他的服务器使用你的证书，可能没那么容易，这就会产生问题。

    这个问题，可以通过动态证书注入来解决。应用程序只允许一个证书（主服务器的那个），并且在应用启动时动态获得一个授权中间证书的列表。然后，将这些证书加入``SSLContext``的``TrustManager``中。

总之，在大多数情况下，中间检查机制能够确保对中间人（MITM）攻击的保护。当黑客截获了通信的信息，如果他使用了TrustManager无法识别的证书，将会拒绝HTTPS连接。

## 2. 设备端安全存储

安卓平台提供了一种方便的存储偏好设置深知大文件的方式——``SharedPreferences`` 接口。虽然这些设置已经被隐藏到一个隐蔽的路径了，但如果设备root了，这些数据还是有可能被获取到。

因此，如果应用要保存敏感信息，在``SharedPreference``中就必须加密存储。一般有两种方式：

1. 使用一个密码库，来加密和解密``SharedPreferences``中存储的健和值。有很多JAVA的密码库可以使用，如： javax.crypto, Bouncycastle（引用[2]） 和 Concealed（引用[3]）

2. 使用``SharedPreferences``的包装类库（wrapper）。这些库对开发者非常方便，不用考虑算法选择之类的事情。但是，使用这些库可能会导致缺乏灵活性并且有些库也没有使用安全的算法，这将会导致敏感信息并没有被安全存储。其中一个这方面最常用的类库是``SecurePrefences``（引用[4]）。在这个解决方案中，你可以采用下面的方式使用``SecurePreferences``，它继承于SharedPreferences。

```JAVA
SecurePreferences securePreferences = new SecurePreferences(context, "MyPassword", null);

```

这两种对称加密算法，像AES（需要一个合适的key size）会引发另一个需要思考的问题：应该用什么密钥。确实如果我们使用一个静态密钥，这些设置可以通过反编译程序来破解。所以，最好的方法是在应用启动时让用户来输入。另一个选择是让用户使用指纹API （引用[15]） (API 23以后可以使用) ，它将会提供一个安全流畅的方式来鉴权。

不幸的是，这些方法并不能适合每一个应用的用户体验。比如，如果我们打算在用户输入密码前显示一些被存储的加密信息，我们就不能使用这种加密系统。

幸运的是，安卓提供了一个安全生成密钥的方式，它保证了每个应用／设备对生成的密钥的唯一性，那就是Keystore。Android Keystore的目的是为了允许应用程序将私钥放到一个其他应用程序不能获得的地方。这种机制很简单，第一次启动，你的应用检查该私钥是否存在，如果没有，就生成一个并存储在keystore中。如果私钥已经存在，你可以使用它来做为之前提到的加密算法的安全码来加密SharedPreferences存取的数据。Obaro Ogbo 写了一篇文章 （引用[11]） ，详细描述了如何使用KeyStore来生成私钥／公钥（Private/Public Key ）对。KeyStore的主要缺陷在于，其api只支持Api 18以上版本。不过，还是有一个针对API 14 （引用[14]）兼容的移植版（这不是官方的移植，所以请谨慎使用）。


因此，我们可以根据下面的决策图来决定是否对设置项进行加密：

![process](https://ooo.0o0.ooo/2015/10/28/5630856759b9c.png)

##3. 保护应用程序不被代码分析和修改

安卓开发者想确保它的应用程序没有被分析、读取甚至被修改，一般出于以下原因：

>- 我们希望黑客没有办法解开那些需要用户付费才能使用的功能。
>- 有时候我们开发了具有敏感信息的程序，黑客可以将所有用户输入的信息发送给他。即使（这些被修改的应用）不能轻易放到Play市场，用户也能从许多其他的地方下载到这个被修改的应用，这将以很隐秘的方式偷窥用户信息。

在开发具有敏感数据应用时，安卓开发者需要关注的是Android应用是非常容易被一些有经验的人反编译的。大多数安卓应用程序（采用java字节码），即通过“原生“安卓建立的应用确实如此。反编译及阅读这些字节码非常容易，以至于修改、重新构建一个修改过的应用（引用[5]）。

在这个部分，我们着重研究一些技巧和方法，以及架构规则，来避免可能产生的风险。同时，我们需要明白的是，并不是每一个客户端设备都会100％面对这些风险。

1. **将有价值的算法放到服务端**
这是一条架构规则。你的应用的价值都是基于核心算法体现，你肯定不想让其他人可以轻易读取、拷贝、并将其放倒自己的应用程序中。在这种情况下，最好的方案是在服务端实现这些算法。应用仅通过给WS提供数据，在服务端处理后，得到算法的返回值。这样做的显著缺陷是以这样的架构为核心功能的程序，不能离线使用。

2. **不要暴露你的WS（WebService）**
如果你的应用的价值依赖于从WS获取的数据，你就不得不为WS设置安全访问，如，通过为每个请求附带使用密码短语或用户名密码获取的会话令牌的方式。如果你只是在app的preference设置中放了一个认证标志，那这个标志就很容易通过修改应用代码的方式，被设置成“永久连接“。这样做的风险，是用户不得不经常输入用户名和密码来延长会话时间。

3. **使用Proguard来混淆代码**
Proguard是一个常用的JAVA工具。Proguard之行三个过程：
>- 瘦身：未用到的代码被移除
>- 优化：内联一些方法，未使用的方法参数被移除等
>- 混淆：最后这步，Proguard将会重命名所有java源文件中的类、属性、方法名，来确保即使字节码被反编译了，这些代码也几乎不可读。当然Proguard也会确保JVM能够识别这些不同的编译元素。

    这个工具非常有趣，因为它让读取反编译后的字节码非常困难。然而，尽管一些代码元素被重命名了，但反编译后，被混淆的方法和属性的作用还是有可能被猜到。另外，Proguard也生成了一个映射文件，用来将混淆后的代码转换为可读的代码（引用[6]）。

    网络上有很多教程，来介绍关于配置Proguard的相关细节。如Android官方文档（引用[7]）。

4. **使用编译后的库**
借助于Java本地接口技术（JNI），使用C或C＋＋编写的编译后的本地代码可以作为JAVA代码的接口实现。而借助Android NDK，你可以更方便的使用此功能。总的来说，这机制很简单：先编译好C/C++代码（必须包括标准的JNI入口），得到一个.so文件。然后将这个库文件包含到你的应用程序工程中，以及它的java接口。这里我们谈到编译好的类库，最主要的目的就是，对于反编译后的代码的可读性，so的机器码将比Java的字节码更难读。一个好的实践是（如果实现起来方便的话）是，将应用中具有高安全级别的部分（原文为：更敏感的部分）用C或C＋＋来开发（例如需要保密的算法或者安全层）并以接口形式暴露，而应用中的其他部分再使用JAVA开发。

诚然，使用NDK也还是有缺点的：我们必须为不同的目标硬件架构分别编译本地库。如果漏掉了其中某种，程序就会崩溃。另外这也会使代码架构变的更复杂些。


##结论


在这篇文章中，我们为OWASP提出的《10大移动安全问题中》（引用[9]）中的3个提出了解决方案。像在导语中提到的那样，只有应用程序链接到的后端系统架构安全，应用的安全才能保证。我们可以从技术上开发一个安全的应用，但如果服务端的糟糕设计导致认证系统的安全性孱弱，所有的努力也将费日。同时，应用开发者有责任确保应用的安全边界没有瑕疵，这篇文章为其提供了合适的解决方案。



[1]:  https://www.fireeye.com/blog/threat-research/2014/08/ssl-vulnerabilities-who-listens-when-android-applications-talk.html

[2]: http://www.bouncycastle.org/

[3]: https://code.facebook.com/posts/1419122541659395/introducing-conceal-efficient-storage-encryption-for-android/

[4]: https://github.com/scottyab/secure-preferences

[5]: http://geeknizer.com/decompile-reverse-engineer-android-apk/

[6]: http://proguard.sourceforge.net/manual/retrace/examples.html

[7]: http://developer.android.com/tools/help/proguard.html

[8]: http://www.javaworld.com/article/2076513/java-concurrency/enhance-your-java-application-with-java-native-interface–jni-.html

[9]: https://www.owasp.org/index.php/OWASP_Mobile_Security_Project#tab=Top_10_Mobile_Risks

[10]: https://www.owasp.org/index.php/About_OWASP

[11]: http://www.androidauthority.com/use-android-keystore-store-passwords-sensitive-information-623779/

[12]: http://www.charlesproxy.com/

[13]: https://threatpost.com/final-report-diginotar-hack-shows-total-compromise-ca-servers-103112/77170/

[14]: https://github.com/pprados/android-keychain-backport

[15]: https://developer.android.com/about/versions/marshmallow/android-6.0.html#fingerprint-authentication
