深入剖析Android网络开发库-part1: OkHttp, Volley and Gson
---

> * 原文链接 : [Android Networking I: OkHttp, Volley and Gson](https://medium.com/@sotti/android-networking-i-okhttp-volley-and-gson-72004efff196)
* 原文作者 :[Pablo Costa](https://medium.com/@sotti)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成 


##动机

在开发 Android App 时网络模块是必不可少的，无论你的 App 是需要读取图片、向服务器请求数据，或者从网络中获取单字节数据，你都需要网络。

既然网络模块对 Android App 这么重要，Android 开发者需要考虑的一个问题就是：我该用什么方式去开发网络模块呢？事实上在这一方面有许多不错的库可供开发者使用，而且你甚至能把多个库混合在一起用。

对 Android 开发者来说，使用这些优秀的网络开发库是因为 Android 框架层提供的 API 不太好用，而且有许多麻烦需要解决，每当开发者需要使用网络模块，就需要不断地编写模板代码。在这样的前提下，开发者们确实可以考虑尝试找到一种处理所有这些麻烦的解决方案，于是各种各样的网络开发库诞生了。

> *在网络开发库出现之前，在 Android 中完成网络模块简直是噩梦，而现在只需要找到最符合项目需求的解决方案就够了。*

这篇博文的目的在于分享我个人对网络开发的积累和思考，这些东西有些是我自己想到，有些是别人告诉我的，我希望能给你带来一些帮助。

在这篇博文中，我们将研究一个特别的解决方案：OkHttp, Volley 和 Gson，在后面的博文中我会研究其他的组合。

##假设

- JSON 是与服务器 API 通信的方式

- 你在使用 Android Studio 和 Gradle

##OkHttp


[OkHttp](https://goo.gl/ZPX7X4)是一个全新的、快速、有效的 Http 客户端，它支持 HTTP/2 和 SPDY，而且能帮你完成许多事情。如果想要知道联网有多麻烦的话，看一看 OkHttp 的源码你就知道了，OkHttp 帮我们完成了诸如连接池、解压缩、缓存……等等操作。OkHttp 表现得就像传输层。


OkHttp 使用了 [Okio](https://goo.gl/F7rG1V)，Okio 是对 java.io 和 java.nio 进行补充的库，主要用于简化对数据的访问、存储和处理。


OkHttp 和 Okio 都是由 [Square](https://square.github.io/) 的工程师开发的。

##Volley

Volley 是一个简化网络任务的库，负责处理请求、加载、缓存、线程、异步等等操作，它能处理 JSON 格式的数据，图片，缓存，纯文字以及允许开发者实现一些自定制服务。

Volley 被设计用于 RPC 模式的网络操作，在耗时短的操作中表现的很好。

Volley在Android 2.2以及之前版本的系统上运行时传输层是Apache HttpClient，大于Android 2.2的系统版本则是 HttpURLConnection。问题在于这些 Http 栈在不同 Android 版本中存在许多问题。

Volley 允许开发者轻松地配置 OkHttp 为它的传输层。

Volley 由 Google 开发。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*dWGwx6UUjc0tocYzFNBLEw.jpeg)

在 Ficus Kirkpatrick 眼里，Android 的网络模块就像上面这张图，一大堆并行和串行的调用。

##Gson

Gson was developed by Google.

[Gson](https://goo.gl/gqAAi) 是通过 Java 的反射机制使你用 Java 实现的数据 Model 对象与 JSON 数据对象能够相互转换的 JSON 序列化与反序列化的库。而且你还能根据自己的需求实现自定义的序列化转换器和反序列化转换器。

Gson 由 Google 开发。

###安装

因为 Gradle 与 Android Studio 之间的依赖关系，你需要在需要开发的 App 的 build.gradle 文件中添加以下的 Gradle 命令：

> compile 'com.squareup.okio:okio:1.5.0'
> compile 'com.squareup.okhttp:okhttp:2.4.0'
> compile 'com.mcxiaoke.volley:library:1.0.16'
> compile 'com.google.code.gson:gson:2.3.1'

当这些库更新，命令中对应的版本号也会发生改变。所以最好在输入这类命令的时候避免输入版本号。

除了 Volley，上面的所有依赖都由官方提供，但通过上面的命令获得的 Volley 绝对是可靠的，至于为什么 Volley 没有官方提供的依赖，在我写这篇博文的时候也还搞不清楚，反正就是没有……

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*QUO-bbhxtocaU0XC_dap_Q.png)

##Volley

Volley 执行网络操作的方式是：创建请求，然后把请求添加到一个队列中。对于一个应用来说，一个队列就够了。所以每当你想要创建一个请求，你只能得到唯一的 Volley 队列，并把该请求添加到这个队列里面。

我在下面的方法中使用了一个该队列的全局单例：

```java
/**
 * Returns a Volley request queue for creating network requests
 *
 * @return {@link com.android.volley.RequestQueue}
 */
public RequestQueue getVolleyRequestQueue()
{
   if (mRequestQueue == null)
   {
      mRequestQueue = Volley.newRequestQueue(this, new OkHttpStack(new OkHttpClient()));
   }
   return mRequestQueue;
}
```

在我们用于创建新请求队列的方法的参数中，有一个是 HttpStack。如果你使用了不提供 HttpStack 的方法，Volley 则会创建一个受当前 Android API 版本影响的栈。（如果当前 Android API 版本低于9，使用的是 AndroidHttpClient；如果大于9，则是 HttpURLConnection）

正如我之前所说，我们希望让 OkHttp 成为我们的传输层，而这也是我们让 OkHttpStack 成为其中一个参数的原因。我使用的 OkHttpClient 实现是[这样的](https://gist.github.com/bryanstern/4e8f1cb5a8e14c202750)。

下面是将请求添加到 Volley 的请求队列的方法：

```java
/**
 * Adds a request to the Volley request queue with a given tag
 * 
 * @param request is the request to be added
 * @param tag is the tag identifying the request
 */
public static void addRequest(Request<?> request, String tag)
{
    request.setTag(tag);
    addRequest(request);
}
/**
 * Adds a request to the Volley request queue
 * 
 * @param request is the request to add to the Volley queue
 */
public static void addRequest(Request<?> request)
{
    getInstance().getVolleyRequestQueue().add(request);    
}
```

同时这个方法也是用于取消应该在 onStop 生命周期方法中正常使用的请求。

```java
/**
 * Cancels all the request in the Volley queue for a given tag
 *
 * @param tag associated with the Volley requests to be cancelled
 */
public static void cancelAllRequests(String tag)
{
    if (getInstance().getVolleyRequestQueue() != null)
    {
        getInstance().getVolleyRequestQueue().cancelAll(tag);
    }
}
```

到这里我们已经用上了 Volley 和 OkHttp，所以我们可以开始让 String，JsonObject，JsonArray 这类对象成为我们请求的对象，那么 JsonOject 对象的实现如下：

```java
JsonObjectRequest jsonObjectRequest =
        new JsonObjectRequest(Request.Method.GET, mUrl, new Response.Listener<JSONObject>()
        {
            @Override
            public void onResponse(JSONObject response)
            {
                // Deal with the JSONObject here
            }
        },
        new Response.ErrorListener()
        {
            @Override
            public void onErrorResponse(VolleyError error)
            {
                // Deal with the error here
            }
        });

App.addRequest(jsonObjectRequest, mTAG);
```

现在我们需要解析 JSON 对象，转换为我们的 Java 数据 Model。我们从每一个 Volley 请求中获得的响应（String，JsonObject，JsonArray）并没有那么好用。

![](https://d262ilb51hltx0.cloudfront.net/max/1280/1*ve4BJ_IfQ3BIKHLL-3HGqg.png)

但你在 Android 网络开发的领域并不孤独，还有许多开发者陪你翻山越岭：

##Gson

有了 Gson，我们能固自定义请求去获得符合我们 Java 数据 Model 的 Java 对象响应，这无疑会让我们很爽。我们需要的只是一个 Volley Request 类的子类：GsonRequest 类，[就像这样](https://goo.gl/Bo2ahN)。

在下面的例子中，我们将展示怎么通过 GET 调用转换并解析 Json 对象：

```java
/**
 * Returns a dummy object parsed from a Json Object to the success  listener and a Volley error to the error listener
 *
 * @param listener is the listener for the success response
 * @param errorListener is the listener for the error response
 *
 * @return @return {@link com.sottocorp.sotti.okhttpvolleygsonsample.api.GsonGetRequest}
 */
public static GsonRequest<DummyObject> getDummyObject
(
        Response.Listener<DummyObject> listener,
        Response.ErrorListener errorListener
)
{
    final String url = "http://www.mocky.io/v2/55973508b0e9e4a71a02f05f";

    final Gson gson = new GsonBuilder()
            .registerTypeAdapter(DummyObject.class, new DummyObjectDeserializer())
            .create();

    return new GsonRequest<>
            (
                    url,
                    new TypeToken<DummyObject>() {}.getType(),
                    gson,
                    listener,
                    errorListener
            );
}```

在下面的代码中，我们将展示怎么通过 GET 调用转换并解析 JsonArray：

```java
/**
 * Returns a dummy object's array in the success listener and a Volley error in the error listener
 *
 * @param listener is the listener for the success response
 * @param errorListener is the listener for the error response
 *
 * @return @return {@link com.sottocorp.sotti.okhttpvolleygsonsample.api.GsonGetRequest}
 */
public static GsonRequest<ArrayList<DummyObject>> getDummyObjectArray
(
        Response.Listener<ArrayList<DummyObject>> listener,
        Response.ErrorListener errorListener
)
{
    final String url = "http://www.mocky.io/v2/5597d86a6344715505576725";

    final Gson gson = new GsonBuilder()
            .registerTypeAdapter(DummyObject.class, new DummyObjectDeserializer())
            .create();

    return new GsonRequest<>
            (
                    url,
                    new TypeToken<ArrayList<DummyObject>>() {}.getType(),
                    gson,
                    listener,
                    errorListener
            );
}
```

Gson 解析 GsonRequest 类对象在后台的工作线程中完成，而不是在主线程中。

我在上面的示例中提供了反序列化转换器，但要注意的是：并不是强制需要提供序列化，反序列化转换器的，而且 Gson 能够通过 JSON 文件很好的处理与类对应的数据域名（包括 case）。我只是更喜欢用我自己定义的序列化，反序列化转换器而已。

在上面的例子中我们都是使用 GET 调用，POST 调用相应的代码则在这：[GsonPostRequest](https://goo.gl/6t4nJM) and [使用方法](https://goo.gl/Rp8TMx).

> *OkHttp 作为 Volley 的传输层，便利地创建用于通过 Gson 在将请求提交到主线程之前解析 Java 对象的网络请求*

##读取图片

###ImageLoader and NetworkImageView

Volley 有一个便于读取图片的叫做 NetworkImageView 的自定义 View（ImageView 的子类）。你可以设置一个 URL，默认的 View Holder 和读取错误显示的图片。例如：

```java
mNetworkImageView = (NetworkImageView) itemView.findViewById(R.id.networkImageView);
mNetworkImageView.setDefaultImageResId(R.drawable.ic_sun_smile);
mNetworkImageView.setErrorImageResId(R.drawable.ic_cloud_sad);
mNetworkImageView.setImageUrl(imageUrl, App.getInstance().getVolleyImageLoader());
```

上面的代码的重点在 setImageUrl 方法中，该方法接收两个参数：图片的网络地址和 ImageLoader（Volley 用于加载和缓存从 URL 中获取的图片的辅助类）。

```java
/**
 * Returns an image loader instance to be used with Volley.
 *
 * @return {@link com.android.volley.toolbox.ImageLoader}
 */
public ImageLoader getVolleyImageLoader()
{
    if (mImageLoader == null)
    {
        mImageLoader = new ImageLoader
                (
                        getVolleyRequestQueue(),
                        App.getInstance().getVolleyImageCache()
                );
    }

    return mImageLoader;
}

/**
 * Returns a bitmap cache to use with volley.
 *
 * @return {@link LruBitmapCache}
 */
private LruBitmapCache getVolleyImageCache()
{
    if (mLruBitmapCache == null)
    {
        mLruBitmapCache = new LruBitmapCache(mInstance);
    }
    return mLruBitmapCache;
}
```

还有一个重要的类则是 LruBitmapCache。Volley 没有为我们提供具体实现，但[我们可以在这里得到](https://developer.android.com/training/volley/request.html)，这可以根据设备的内存空间设置缓存大小，非常方便。

###ImageRequest

某些时候我们可能不想使用 NetworkImageView。例如我们想要显示圆形的图片，此时使用的库是 [CircleImageView](https://github.com/hdodenhof/CircleImageView)。那么在这种情况下我们就得使用 ImageRequest 来满足需求：

```java
final CircleImageView circleImageView =
            (CircleImageView) findViewById(R.id.circularImageView);

    // Retrieves an image specified by the URL, displays it in the UI.
    final com.android.volley.toolbox.ImageRequest imageRequest =
            new ImageRequest
            (
                    mImageUrl,
                    new Response.Listener<Bitmap>()
                    {
                        @Override
                        public void onResponse(Bitmap bitmap)
                        {
                            circleImageView.setImageBitmap(bitmap);
                        }
                    },
                    0,
                    0,
                    ImageView.ScaleType.CENTER_INSIDE,
                    null,
                    new Response.ErrorListener()
                    {
                        public void onErrorResponse(VolleyError error)
                        {          circleImageView.setImageResource(R.drawable.ic_cloud_sad);
                        }
                    }
            );
    // Access the RequestQueue through your singleton class.
    App.getInstance().getVolleyRequestQueue().add(imageRequest);
}
```

##Curiosities

- 在这片博文中提到的所有组件（Okio, OkHttp, Volley 和 Gson）都可以独立被使用，并不一定非要绑定在一起用。

- 我在篇博文引用的文章中的第一篇是由 Jesse Wilson 写的。Jesse Wilson 是唯一站在 Android HTTP, Gson, OkHttp 和 Okio 前面的男人，我认为他值得被我特别提出来并予以夸耀。

- OkHttp 的实现在 Android 4.4 版本会退化为使用 HttpURLConnection。Twitter, Facebook 和 Snapchat 的 Bundle 也会这样。

##在2015年这个解决方法有用吗？

Volley/Gson 解决办法是成熟的而且在2013年和2014年都广泛被使用，原因在于：它们是 Google 官方推荐的方法，而且在各类 Android 开发者网站中被提及。到了今天，它们仍是网络开发的不错选择，因为它们很简便，运行效果也不错。但需要考虑的是，Volley 和 Gson 的更新频率已经越来越低了（而且好久没更新了）。

- Android Networking II: OkHttp, Retrofit, Moshi and Picasso. (coming article)

- Android Networking III: ION (coming article)

分析不同的解决方案，并比较各种解决方案的优劣，如：效率、简便性、能否深度定制都是判断某个解决方案能否被采用的标准

你可能会对下面的博文感兴趣：

- Android Networking II: OkHttp, Retrofit, Moshi and Picasso. (coming article)

- Android Networking III: ION (coming article)

##Github project sample

- [源代码](https://github.com/Sottti/OkHttpVolleyGsonSample)

##Sources

- [Okio](https://github.com/square/okio)

- [OkHttp 网页](https://square.github.io/okhttp/)

- [Volley 在 Google IO 2013 中的介绍](https://goo.gl/MvNPQn)

- [Android Developers Volley training](https://goo.gl/9HXqJw)

- [OkHttp 作为 Volley 传输层被使用](https://goo.gl/ZjtY6Q)

- [A Few Ok Libraries (Jake Wharton at Droidcon Montreal)](https://www.youtube.com/watch?v=WvyScM_S88c)

- [HttpStack 用 OkHttp 自带的请求/响应 API 的实现，而不是依赖于 HttpURLConnection](https://plus.google.com/+JakeWharton/posts/31jhDwaCvtg)