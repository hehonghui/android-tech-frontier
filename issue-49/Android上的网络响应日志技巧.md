# Android上的网络响应日志技巧
----

> * 原文链接 : [Effortless network response logging on Android](https://medium.com/@simonpercic/effortless-network-response-logging-on-android-cedf0ebbdae1#.b2in23bvt)
* 原文作者 : [Simon Percic](https://medium.com/@simonpercic)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Mijack](http://mijack.github.io)
* 校对者: [Mijack](http://mijack.github.io)
* 状态 :  完成 

在开发Android应用程序的过程中，你或许需要从远处服务器中加载数据。而在开发过程中，你可能要经常查看应用从网络中获取到的数据的内容。

如果你最近几年在开发Android应用，或许你使用过（或者听说过）[Retrofit](https://github.com/square/retrofit)来处理网络请求。如果没有，我建议你了解一下，因为他实在太棒了。

所以，使用Retrofit时，在监听网络请求方面，你有哪些选择呢？

## Retrofit / OkHttp的logging

Retrofit 和 OkHttp 有一些内置的记录HTTP响应的方法。使用这些功能的方法取决于你使用的Retrofit的具体版本。

## `Retrofit 1.x`

如果你使用的是比较老的Retrofit 1.x版本。在创建RestAdapter时，你可以通过在RestAdapter.Buidler中设置LogLevel的属性直接开启响应日志这一功能。

```java
LogLevel logLevel = LogLevel.FULL;
new RestAdapter.Builder()
        .setClient(client)
        .setEndpoint(endpoint)
        .setConverter(converter)
        .setErrorHandler(errorHandler)
        .setLogLevel(logLevel)
        .build();
```

LegLevel是一个表示日志细节的枚举类型，值有NONE, BASIC, HEADERS, HEADERS_AND_ARGS 和 FULL。你可以根据需要打印的每一个网络请求的内容设置对应的值。

## `Retrofit 2.x`
[Retrofit 2.0的稳定版](https://twitter.com/JakeWharton/status/708401516063891456)在16年三月上旬已经发布，变化很大。如果你还没有升级它,我建议你​​升级吧：

> [Retrofit 2.0与RxJava混合使用的快速入门](https://medium.com/p/ab7a11bc17df)
您可能已经注意到Retrofit 2.0最终版本已经出来了，所以，还等什么，现在去升级吧！

你升级以后，会发现Retrofit发生了很多变化。比如，你无法直接通过类Retrofit.Builder设置Log Level.

Retrofit 2.x直接依赖于Square的另一个库（OkHttp3）进行HTTP的实际网络调用。与此不同的是，Retrofit 以前的版本(1.x)并没有直接依赖于OkHttp，因而你可以使用不同的HTTP客户端，只要它们实施了Retrofit的客户端接口。

因此，**日志功能已经从Retrofit更改到OkHttp中去了**。

现在，您可以调用OkHttp的拦截器 [HttpLoggingInterceptor]（https://github.com/square/okhttp/tree/master/okhttp-logging-interceptor）实现和Retrofit 1.x一样的日志功能。

如果要使用它，您必须先在Gradle中声明，因为它以独立的形式进行分发：

```
compile 'com.squareup.okhttp3:logging-interceptor:<latest>'
```
然后将日志记录拦截器添加到OkHttp中：
```
Level logLevel = Level.BODY;
HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
interceptor.setLevel(logLevel);
new OkHttpClient.Builder()
        .addInterceptor(interceptor)
        .build();
```
##'日志的输出效果是什么样子？`

网络响应的body以纯文本的形式出现在Logcat中。日志通常被分隔成了若干行，往往难以阅读：
![](https://cdn-images-1.medium.com/max/800/1*OXQRErwU5UW-2IiiK56U8Q.png)
`Retrofit 1.x / HttpLoggingInterceptor logcat output`

通常,你需要拷贝整行的响应，然后再取出开头的时间戳，包名称以及标记。如果你遇到的JSON响应，您可以使用像[JsonFormatter]（https://jsonformatter.curiousconcept.com/）或[在线JSON查看器（http://jsonviewer.stack.hu/），提高复制的文本可读性。

>对于我来说，每次检查网络请求的过程都十分繁琐、耗时。这就是我决定创建自己的拦截器的原因——这可以简化流程。

## OkLog - 检查响应的快捷之道

[OkLog]（https://github.com/simonpercic/OkLog）是针对OkHttp 网络响应的日志记录拦截器，可以在开发过程中简化了网络响应的调试。

OKLog有两个独立的库，取决于OkHttp的版本：OkLog对应于OkHttp，OkLog3对应于OkHttp3。

OkLog写了一个可访问的URL，可将网络响应作为URL路径的一部分进行日志记录。

这样一来，您就可以点击Android Studio中的日志显示一个链接，你在浏览器中查看这个响应对应文本：

![](https://cdn-images-1.medium.com/max/800/1*o7CdnntHqZ0zqHYXOBKNfQ.gif)
OkLog 使用示例

另一个好处是能够与其他开发者（通常是REST API的开发人员）分享这些URL。
## 它是如何运作的？

OkLog通过实现自己的[“应用程序”interceptor]（https://github.com/square/okhttp/wiki/Interceptors）截获OkHttp的纯网络响应。

在得到响应的纯文本之后，将它转换对url友好的字符串，生成包含响应的URL。

然后，该URL作为日志打印出来。OkLog可以选择依赖于Timber，只有你的项目依赖于它时，它才发挥作用。否则，它将调用Android内置的Log方法进行日志记录（当然，你也可以强制它使用内置Log方法）。如果你愿意的话，甚至可以定制[LogInterceptor](https://github.com/simonpercic/OkLog/blob/master/core/src/main/java/com/github/simonpercic/oklog/core/LogInterceptor.java)自定义日志记录。

**那么，究竟响应需要如何转化呢？**

纯文本响应首先要经过[gzip压缩]（https://en.wikipedia.org/wiki/Gzip），以使该字符串尽可能短。然后，将所得的字符串进行[Base64]（https://en.wikipedia.org/wiki/Base64）编码，从而可以 以使其网址友好。

#点击URL时会发生什么？

默认情况下，生成的URL指向一个Spring Web应用程序的托管实例，称为[ResponseEcho]（https://github.com/simonpercic/ResponseEcho）。该应用程序的工作，刚好和OKLog相反，对URL路径字符串参数进行Base64解码和对参数进行gzip解压，并将其作为一个普通的响应返回。

如果普通的响应恰好是一个JSON，Web应用程序应该返回格式规整的JSON，这样更容易阅读。

如果你愿意，你也可以自己搭建web应用程序，并设置OkLog匹配主机名网站的前缀。

## 如何使用它？

关于使用的具体流程请查看Github上的[Readme](https://github.com/simonpercic/OkLog#usage)，基本步骤如下：

* 首先添加当前的OKLog的版本.
```
// pre-OkHttp3
compile 'com.github.simonpercic:oklog:<latest>'
// OkHttp3
compile 'com.github.simonpercic:oklog3:<latest>'
```
* 使用 OkLogInterceptor的builder()方法构造一个实例
```
OkLogInterceptor interceptor = OkLogInterceptor.builder()
        // set desired custom options
        .build();
```
* 在OKHttp的 interceptors中添加一个 okLogInterceptor实例
```
// for pre-OkHttp3
List<Interceptor> clientInterceptors = okHttpClient.interceptors();
Collections.addAll(clientInterceptors, okLogInterceptor);
// for OkHttp3
new OkHttpClient.Builder().addInterceptor(okLogInterceptor).build();
```
* 通常，你可以通过 okHttpClient 实例来构造 Retrofit/2 实例。

## 已知的限制
OKLog是通过Android的Logging系统实现日志功能的，但Logging有[约4000字符的长度限制](http://stackoverflow.com/a/8899735)。

即使生成的url通过gzip压缩和Base64编码，最后在一些网络响应中，他们仍可能 **超出日志的行限制**。

不幸的是，目前还没有针对性的解决方案。不过，大多数情况下，一切都是正常的。

在升级的实际记录过程中，OkLog可以选择[Timber]（https://github.com/JakeWharton/timber），Timber可以对一些过长的日志进行切片分割，所以你还可以看到那些超过长度限制的响应。如果，它被分割成若干行，你可以把它们链接起来从而得到完整的url。

这样会将太长线，所以你可以看到，如果一个反应是超过长度限制。如果它被分成多行，可以手动串接所有行，以获得有效的URL。

## 另一种实现方式 - Facebook的Stetho

和上述方案不同的是，[Facebook’s Stetho](http://facebook.github.io/stetho/) 使用的是另一种方案来记录网络请求。

不同于直接在logcat中直接打印请求，Stetho 的运行依赖于OkHttp/3的网络连接器 interceptor。

在这种方式下，Stetho通过Chrome Developer Tools调试网络请求。

![Chrome Developer Tools through Stetho](https://cdn-images-1.medium.com/max/800/1*vs-fNOCQ7DzQMpoyekxWZA.png)

Chrome Developer Tools是一个十分棒的工具，他可以让你看见和网络活动相关的诸多信息。

但是，如果你只是希望可以快速的查看网络请求，他可能不适合你。除此以外,你无法快捷地和别人共享这些信息，除非你复制这些信息，

## 你应该选择哪一个呢？

我觉得并没有一个放之四海而皆准的标准，相反，我相信，不同的场景有着不同的解决方案，上述的每一种方案都有对应的最佳应用场景。

在我的项目中，我使用OKHttp的 HttpLoggingInterceptor，它可以在logcat中直接输出和请求相关的基本信息。同时，我也使用OKLog，他可以让我在浏览器中快速查看对应的网络请求，也可以和我的同事共享这些信息。


注意,你只能在你的debug版本中，[不要在release版本中](http://developer.android.com/tools/publishing/preparing.html#publishing-configure)，打印网络响应。[在release版本中，你不应该输出任何日志](https://github.com/JakeWharton/timber/blame/a6b2e220a33da939da181de37a5cd68be843f63a/README.md#L16-L17)。

这篇文章有趣不？记得在[Medium](https://medium.com/@simonpercic), [Twitter](https://twitter.com/simonpercic) 或 [GitHub](https://github.com/simonpercic)关注我哦。
