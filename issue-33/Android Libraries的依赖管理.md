Android Libraries的依赖管理
---

> * 原文链接 : [Dependency Management for Android Libraries](http://johnpetitto.com/android-lib-dependency-management/?utm_source=Android+Weekly&utm_campaign=9ed0cecaff-Android_Weekly_186&utm_medium=email&utm_term=0_4eb677ad19-9ed0cecaff-337955857)
* 原文作者 : [ John Petitto](http://johnpetitto.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [嗣音君](https://github.com/xiaolangpapa) 
* 校对者: [请校对](github链接) 
* 状态 :  校对中


When Android developers choose a library for their project, they aren’t merely looking for things such as features, usability, performance, documentation and support. They also care how large the library is and the number of methods it’s going to add. As a project grows and so does its dependencies, developers feel the pressure to keep their app below the 65k method limit. Proguard is too slow to wait for with non-release builds and developers try to avoid multidex like the plague. It’s therefore crucial that library authors be conscious about the size of their projects.

当Android开发者为他们的项目选择一个 Library 时, 他们不仅仅是在追寻诸如功能、可用性、性能、文档和支持等，同时也关心这个 Library 的体积和多少个方法即将被添加到项目中去。因为随着项目的发展，它的依赖也在增长。开发者越来越难将他们app的方法总数控制在65K以下。然而对于尚未发布的 build版本来说，Proguard 实在是慢得令人难以等待。开发者就像躲避瘟疫一样在努力避免多个 dex。这就是 library 的作者应该重视他们项目大小的原因。

The simplest approach to keeping your library’s method count down is to not include any unnecessary dependencies. Any dependencies you do include will transitively be added to your users’ projects. For example, if you need a few simple utility methods, such as closing a resource quietly, don’t go adding Guava just to do this. Instead, roll your own or extract it from an existing library (make sure to give credit!). Your users will most definitely appreciate the exclusion of over 14k methods when you only needed a few.

让你的 library 方法数降下来的最简单做法就是不要包含任何没有必要的依赖。任何你包含进来的依赖都将被加到你的用户的项目里。举个例子，如果你只是需要一些简单的通用方法，例如安静地关闭一个资源，不要直接把 [Guava](https://github.com/google/guava) 加进来。而是应该引入你自己实现的方法或者是从现有的 library 中（确保得到了授权）提取所需的，你的用户一定会非常感激你排除了其他14K+的方法。

That’s not to say you should always avoid using external libraries; you just need to be smart about it. Don’t go out of your way to write an HTTP client when such libraries already exist. You’ll just end up wasting time that could be better spent improving your own library.

然而那并不表明你应该一直避免使用以下外部的libraries, 你只需要聪明一点对待它即可。不要偏离了原本的路线去写一个HTTP client这种已经实现好的libraries，与其浪费时间在这上面还不如去提高你的library。

Beyond simply deciding which libraries to include, there are a few strategies you can employ to help keep your library lean. One such strategy is to use the provided scope when declaring dependencies. This is part of the Android build system in gradle. As opposed to compile, the provided scope only includes a dependency at compile time. This means that the dependency will not be packaged with the APK when users build their projects. Users will need to explicitly declare the dependency themselves in their app’s build.gradle for it to be available at runtime.

避免简单地决定哪些 liraries 该引入，你可以采用一些策略去让你的 library 保持小体积。其中一个策略是在声明依赖的时候去使用一些提供的范围。这是 gradle 里 Android 构建系统的一部分。和编译相比，提供的范围仅仅是在编译时引入了依赖。这意味着当用户构建他们的项目时，依赖将不会被打包进 APK 文件。用户需要在 app 的 build.gradle 文件中显式地声明依赖，如此运行时依赖方可用。

Note: there is a also a package scope which does the opposite of provided. It gets packaged with the APK but is not available at compile time.

注意：另外有一个 package scope 和默认提供的做了相反的事情，它能将把依赖打包进 APK 文件，但在编译时却不可用。

There are a few reasons why you would want to use an optional dependency in your library. One reason is that certain features may only get used by a subset of your users. An example of this can be seen with Retrofit 1.x, where it’s possible to consume REST calls reactively instead of using callbacks. Those that want to use RxJava can add it and those that don’t aren’t burdened by the extra dependency. The configuration for this is slightly different with Retrofit since it uses the maven build system, but the ideas are similar.

你在library中引入一个可选依赖可能有好几个原因，其中一个便是某些特定的功能只有部分用户才用得到。一个显而易见的例子就是 [Retrofit 1.x](https://github.com/square/retrofit/tree/version-one)，它通过消费反应式的REST调用来替代回调。那些想要使用 RxJava 的用户可以自行添加上，而那些不需要的用户则不用被额外的依赖所负累。虽然这个配置自从 Retrofit 用了 [maven 构建系统](https://github.com/square/retrofit/blob/version-one/retrofit/pom.xml#L35)后发生一些轻微的变化，但内在的思想是类似的。

I should warn that if you find yourself including features that not all users may find useful, you should really consider if those features should even be part of your library. More on this a bit later.

我需要提醒的是，如果你发现自己引入了一些不是所有用户都能使用到的特性，你应该认真地考虑把那些特性变为你的 library 的一部分。稍后会有更多关于这个的说法。

Another reason you might want to include an optional dependency is when a solution already exists in the Android framework, but a more performant solution is available from an external library. Users that already rely on this library or are willing to take on the increased method count for better performance can add it.

另外一个你可能想引入可选依赖的原因是:虽然 Android Framework 已经提供某个功能的实现，但是在外部 library 中有一个更高效的实现。已经依赖了这个 library 的用户，或者是那些想引入额外增加的方法来获得更高性能的用户可以引入该 library。

I recently came across this in the PlacesAutocompleteTextView library, where the internal HTTP client used can either be an OkHttpClient or an HttpURLConnection. The former is generally more performant, but requires adding OkHttp as a dependency. If users do not wish to include it, then it automatically falls back to HttpURLConnection from the standard library.

最近我就在 [PlacesAutocompleteTextView library](https://github.com/seatgeek/android-PlacesAutocompleteTextView) 遇到了这个问题——内置的 HTTP client 可以是 OkHttpClient 或者是 HttpURLConnection。前者拥有更高的性能，但需要引入 [OkHttp ](http://square.github.io/okhttp/) 作为依赖。如果用户不愿意引入 OKHttp 的话，它将会自动用回标准库的 HttpURLConnection。

To achieve this, a “resolver” class is used to determine which dependency to use at runtime. For example, this is the class for determining which HTTP client to use:

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

When the class gets loaded, the fully qualified class name for OkHttpClient is checked for availability. If a ClassNotFoundException is thrown, then we know OkHttp wasn’t added by the user and we fall back to HttpURLConnection. PlacesHttpClient acts as common interface that wraps both implementations so either can be used interchangeably through out the codebase. This same approach is used for JSON parsing, where Gson can optionally be included as a dependency.

当该类加载的时候，会通过完整的类名去检测 OkHttpClient 是否是可用的。如果抛出了 ClassNotFoundException 的异常，我们就知道 OKHttp 并没有被用户加入到项目中去，此时将会用回 HttpURLConnection。PlacesHttpClient 以普通接口的方式，封装了两种实现，如此一来，在整个代码库里，它们都可以交换地使用。同样的方法也用在了 JSON 解析上，使得 [Gson](https://github.com/google/gson) 成为了可选的依赖。

This approach is good if the tradeoff between performance and size is significant. In the case where the fallback implementation requires greater effort to use (such as with JSON parsing), I’d recommend going with the external library first to help save time and then consider adding the fallback implementation in a later release.

当性能和包大小之间的权衡是有意义的时候，这种方法是非常好的。在备选实现方式使用起来更麻烦的情况下（例如 JSON 解析），我建议优先使用外部 library 来节省时间，然后考虑在后续的 release 中加入备选的实现。

I mentioned earlier that you should be wise about which features to include in your library. If a feature isn’t going to be needed by nearly all of your users, then it’s probably best not to include it. This makes the first approach of using an optional dependency much less warranted. Revisiting Retrofit as an example, it no longer provides the ability to consume REST calls reactively as part of its core library in the 2.x release. Instead, this functionality has been moved to a separate module and published as its own maven artifact.

在此前我提到了你应该睿智地决定哪个特性需引入你的library。 如果一个功能特性并没有被几乎所有的用户都使用到，那么最好就不要把引入它。这使得第一种方法——使用可选依赖的变得不太可靠。再以Retrofit 作为一个例子，在2.x的release版本的核心library里将不再提供反应式调用REST的功能。这个功能被转移到了一个分离的模块，并以它的maven artifact的形式来发布。

Likewise, different response converters have been split into their own dependencies as well. For example, Retrofit users that need to convert a JSON response and already rely on Gson can add the following dependency to their build.gradle file:

同样的，不同的响应转换器也被分离到了各自的依赖里。例如，那些需要转换 JSON 响应而且已经依赖了Gson 的 Retrofit 用户可以把以下依赖加入到他们的 build.gradle 文件:

```
dependencies {
  compile 'com.squareup.retrofit:converter-gson:2.0.0-beta2'
}
```

Those that use a different JSON library like Jackson or need to parse a different data format such as XML or protocol buffers, can do so and not be burdened by the extra dependencies that would be needed to serve all of Retrofit’s users. Just as important, the core library isn’t muddied up by these additional features and can remain focused on the primary issues it’s meant to solve.

那些用了不同 JSON库（如 Jackson）的用户或者需要解析不同格式数据（如 XML, 协议缓存区等）的用户，也可以通过类似的方式去解决，而无需被额外的依赖所负累。同等重要地，核心库将不会被那些额外的功能影响，可以保持专注在它打算解决的主要问题上。

If you find yourself writing a library that Android developers will use, keep some of these strategies in mind when designing it. Consider the size of your library not merely as an attribute, but as a feature. Your users will certainly appreciate you for it!

如果你发现自己在写一个Android开发者用得上的library, 请在设计它的时候把这几条策略牢记于心。不要把你的library的体积大小单纯看待成一个属性，而是作为一个特性。你的用户将会因此而感激你的！





