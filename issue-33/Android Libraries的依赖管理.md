Android Libraries的依赖管理
---

> * 原文链接 : [Dependency Management for Android Libraries](http://johnpetitto.com/android-lib-dependency-management/?utm_source=Android+Weekly&utm_campaign=9ed0cecaff-Android_Weekly_186&utm_medium=email&utm_term=0_4eb677ad19-9ed0cecaff-337955857)
* 原文作者 : [ John Petitto](http://johnpetitto.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [嗣音君](https://github.com/xiaolangpapa) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 :  完成


当Android开发者为他们的项目选择一个 Library 时, 他们不仅仅是在追寻诸如功能、可用性、性能、文档和支持等，同时也关心这个 Library 的体积和多少个方法即将被添加到项目中去。因为随着项目的发展，它的依赖也在增长。开发者越来越难将他们app的方法总数控制在65K以下。然而对于尚未发布的 build版本来说，Proguard 实在是慢得令人难以等待。开发者就像躲避瘟疫一样在努力避免多个 dex。这就是 library 的作者应该重视他们项目大小的原因。

让你的 library 方法数降下来的最简单做法就是不要包含任何没有必要的依赖。任何你包含进来的依赖都将被加到你的用户的项目里。举个例子，如果你只是需要一些简单的通用方法，例如安静地关闭一个资源，不要直接把 [Guava](https://github.com/google/guava) 加进来。而是应该引入你自己实现的方法或者是从现有的 library 中（确保得到了授权）提取所需的，你的用户一定会非常感激你排除了其他14K+的方法。

然而那并不表明你应该一直避免使用以下外部的libraries, 你只需要聪明一点对待它即可。不要偏离了原本的路线去写一个HTTP client这种已经实现好的libraries，与其浪费时间在这上面还不如去提高你的library。

避免简单地决定哪些 liraries 该引入，你可以采用一些策略去让你的 library 保持小体积。其中一个策略是在声明依赖的时候去使用一些提供的范围。这是 gradle 里 Android 构建系统的一部分。和编译相比，提供的范围仅仅是在编译时引入了依赖。这意味着当用户构建他们的项目时，依赖将不会被打包进 APK 文件。用户需要在 app 的 build.gradle 文件中显式地声明依赖，如此运行时依赖方可用。

注意：另外有一个 package scope 和默认提供的做了相反的事情，它能将把依赖打包进 APK 文件，但在编译时却不可用。

你在library中引入一个可选依赖可能有好几个原因，其中一个便是某些特定的功能只有部分用户才用得到。一个显而易见的例子就是 [Retrofit 1.x](https://github.com/square/retrofit/tree/version-one)，它通过消费反应式的REST调用来替代回调。那些想要使用 RxJava 的用户可以自行添加上，而那些不需要的用户则不用被额外的依赖所负累。虽然这个配置自从 Retrofit 用了 [maven 构建系统](https://github.com/square/retrofit/blob/version-one/retrofit/pom.xml#L35)后发生一些轻微的变化，但内在的思想是类似的。

我需要提醒的是，如果你发现自己引入了一些不是所有用户都能使用到的特性，你应该认真地考虑把那些特性变为你的 library 的一部分。稍后会有更多关于这个的说法。

另外一个你可能想引入可选依赖的原因是:虽然 Android Framework 已经提供某个功能的实现，但是在外部 library 中有一个更高效的实现。已经依赖了这个 library 的用户，或者是那些想引入额外增加的方法来获得更高性能的用户可以引入该 library。

最近我就在 [PlacesAutocompleteTextView library](https://github.com/seatgeek/android-PlacesAutocompleteTextView) 遇到了这个问题——内置的 HTTP client 可以是 OkHttpClient 或者是 HttpURLConnection。前者拥有更高的性能，但需要引入 [OkHttp ](http://square.github.io/okhttp/) 作为依赖。如果用户不愿意引入 OKHttp 的话，它将会自动用回标准库的 HttpURLConnection。

为了实现这个特性，在运行时，一个叫做 "resolver"的类被用来确定使用哪个依赖。举个例子，这就是决定使用哪个 HTTP client 的类：

```
public final class PlacesHttpClientResolver {
  public static final PlacesHttpClient PLACES_HTTP_CLIENT;

  static {
    boolean hasOkHttp;
    
    try {
      Class.forName("com.squareup.okhttp.OkHttpClient");
      hasOkHttp = true;
    } catch (ClassNotFoundException e) {
      hasOkHttp = false;
    }

    PlacesApiJsonParser parser = JsonParserResolver.JSON_PARSER;

    PLACES_HTTP_CLIENT = hasOkHttp ? new OkHttpPlacesHttpClient(parser) : new HttpUrlConnectionMapsHttpClient(parser);
  }

  private PlacesHttpClientResolver() {
    throw new RuntimeException("No Instances!");
  }
}
```

当该类加载的时候，会通过完整的类名去检测 OkHttpClient 是否是可用的。如果抛出了 ClassNotFoundException 的异常，我们就知道 OKHttp 并没有被用户加入到项目中去，此时将会用回 HttpURLConnection。PlacesHttpClient 以普通接口的方式，封装了两种实现，如此一来，在整个代码库里，它们都可以交换地使用。同样的方法也用在了 JSON 解析上，使得 [Gson](https://github.com/google/gson) 成为了可选的依赖。

当性能和包大小之间的权衡是有意义的时候，这种方法是非常好的。在备选实现方式使用起来更麻烦的情况下（例如 JSON 解析），我建议优先使用外部 library 来节省时间，然后考虑在后续的 release 中加入备选的实现。

在此前我提到了你应该睿智地决定哪个特性需引入你的library。 如果一个功能特性并没有被几乎所有的用户都使用到，那么最好就不要把引入它。这使得第一种方法——使用可选依赖的变得不太可靠。再以Retrofit 作为一个例子，在2.x的 release 版本的核心 library 里将不再提供反应式调用 REST 的功能。这个功能被转移到了一个分离的模块，并以它的 maven artifact 的形式来发布。

同样的，不同的响应转换器也被分离到了各自的依赖里。例如，那些需要转换 JSON 响应而且已经依赖了Gson 的 Retrofit 用户可以把以下依赖加入到他们的 build.gradle 文件:

```
dependencies {
  compile 'com.squareup.retrofit:converter-gson:2.0.0-beta2'
}
```
那些用了不同 JSON库（如 Jackson）的用户或者需要解析不同格式数据（如 XML, 协议缓存区等）的用户，也可以通过类似的方式去解决，而无需被额外的依赖所负累。同等重要地，核心库将不会被那些额外的功能影响，可以保持专注在它打算解决的主要问题上。

如果你发现自己在写一个Android开发者用得上的library, 请在设计它的时候把这几条策略牢记于心。不要把你的library的体积大小单纯看待成一个属性，而是作为一个特性。你的用户将会因此而感激你的！





