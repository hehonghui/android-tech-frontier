深入剖析Android网络开发库-part1: OkHttp, Volley and Gson
---

> * 原文链接 : [Android Networking I: OkHttp, Volley and Gson](https://medium.com/@sotti/android-networking-i-okhttp-volley-and-gson-72004efff196)
* 原文作者 :[Pablo Costa](https://medium.com/@sotti)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 


##动机

There’s something that probably you can't avoid in an Android project: Networking. Whether you are loading images, requesting data from an API server or getting a single byte from internet, you are doing networking.

在开发 Android App 时网络模块是必不可少的，无论你的 App 是需要读取图片、向服务器请求数据，或者从网络中获取单字节数据，你都需要网络。

Given how important and basic networking is on Android, one of the questions Android developers are facing nowadays is which solutions should I use? There are a lot of good libraries out there and you can stack one upon another in different ways.

既然网络模块对 Android App 这么重要，Android 开发者需要考虑的一个问题就是：我该用什么方式去开发网络模块呢？事实上在这一方面有许多不错的库可供开发者使用，而且你甚至能把多个库混合在一起用。

The reason behind so many people working on great networking libraries is the [offered options in the Android framework](http://goo.gl/BdyQWx) are not great and were a mess to deal with in the old days (Eclair, Froyo and Gingerbread), you had to write a lot of boilerplate code over and over again each time you were doing networking. Given the momentum Android was gaining, this looked like the appropriate situation to try to solve once for all the problem, and libraries started to appear and evolve.

对 Android 开发者来说，使用这些优秀的网络开发库是因为 Android 框架层提供的 API 不太好用，而且有许多麻烦需要解决，每当开发者需要使用网络模块，就需要不断地编写模板代码。在这样的前提下，开发者们确实可以考虑尝试找到一种处理所有这些麻烦的解决方案，于是各种各样的网络开发库诞生了。

> *In the old days networking on Android was a nightmare, nowadays the problem is to find out which solution best fits the project necessities.*
> *在网络开发库出现之前，在 Android 中完成网络模块简直是噩梦，而现在只需要找到最符合项目需求的解决方案就够了。*

The aim of this article is just share my discoveries and experiences, learn from others and maybe help some people.

这篇博文的目的在于分享我个人对网络开发的积累和思考，这些东西有些是我自己想到，有些是别人告诉我的，我希望能给你带来一些帮助。

In this article we'll talk about a particular solution: OkHttp, Volley and Gson. In further articles we'll talk about other options.

在这篇博文中，我们将研究一个特别的解决方案：OkHttp, Volley 和 Gson，在后面的博文中我会研究其他的组合。

##Assumptions

- JSON is the way of communicating with API server

- You are using Android Studio and Gradle

##假设

- JSON 是与服务器 API 通信的方式

- 你在使用 Android Studio 和 Gradle

##OkHttp

[OkHttp](https://goo.gl/ZPX7X4) is an modern, fast and efficient Http client which supports HTTP/2 and SPDY and does a lot of stuff for you. A good way to discover how hard is networking is taking a look at all things OkHttp does for you like connection pooling, gziping, caching… and so on. OkHttp acts like the transport layer.

[OkHttp](https://goo.gl/ZPX7X4)是一个全新的、快速、有效的 Http 客户端，它支持 HTTP/2 和 SPDY，而且能帮你完成许多事情。如果想要知道联网有多麻烦的话，看一看 OkHttp 的源码你就知道了，OkHttp 帮我们完成了诸如连接池、解压缩、缓存……等等操作。OkHttp 表现得就像传输层。

OkHttp uses [Okio](https://goo.gl/F7rG1V), a library that complements java.io and java.nio to make it much easier to access, store, and process your data.

OkHttp 使用了 [Okio](https://goo.gl/F7rG1V)，Okio 是对 java.io 和 java.nio 进行补充的库，主要用于简化对数据的访问、存储和处理。

Both OkHttp and Okio are developed by the [Square](https://square.github.io/) guys.

OkHttp 和 Okio 都是由 [Square](https://square.github.io/) 的工程师开发的。

##Volley

Volley is a library that makes easy common networking tasks. Takes care of requesting, loading, caching, threading, synchronization and some more stuff. It’s ready to deal with JSON, images, caching, raw text and allow some customization.

Volley 是一个简化网络任务的库，负责处理请求、加载、缓存、线程、异步等等操作，它能处理 JSON 格式的数据，图片，缓存，纯文字以及允许开发者实现一些自定制服务。

Volley was design for RPC style network operations that populate the UI. Is good for short operations.

Volley 被设计用于 RPC 模式的网络操作，在耗时短的操作中表现的很好。

Volley by default uses as transport layer the Apache Http stack on Froyo and HttpURLConnection stack on Gingerbread and above. The reason is there are problems with those http stacks have on different Android versions.

Volley 默认用于处理 Android Froyo 传输层中 Apache Http 栈和 Android Gingerbread 传输层中的 HttpURLConnection 栈，以及更高版本传输层中的事务。问题在于这些 Http 栈在不同 Android 版本中存在许多问题。

Volley allow us to easily set up OkHttp as its transport layer.

Volley 允许开发者轻松地配置 OkHttp 为它的传输层。

Volley was developed by Google.

Volley 由 Google 开发。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*dWGwx6UUjc0tocYzFNBLEw.jpeg)

This is what Android networking looks like in Ficus Kirkpatrick (a Googler behind Volley) words. A lot of parallel async calls.

在 Ficus Kirkpatrick 眼里，Android 的网络模块就像上面这张图，一大堆并行和串行的调用。

##Gson

[Gson](https://goo.gl/gqAAi) is JSON serialization and deserialization library that uses reflection to populate your Java model objects from JSON objects. You can add your own serializers and deserializers as well to better control and customization.

Gson was developed by Google.

###Setup

Gradle dependencies in Android Studio
You need to add the next lines to your app’s build.gradle file.

> compile 'com.squareup.okio:okio:1.5.0'
> compile 'com.squareup.okhttp:okhttp:2.4.0'
> compile 'com.mcxiaoke.volley:library:1.0.16'
> compile 'com.google.code.gson:gson:2.3.1'

The versions may be different as they are updated. Try to avoid + sintaxis on version numbers as is recommended.

All the dependencies above are official but Volley, that is not official but is trustworthy. There’s not official gradle dependency for Volley as far as I know as I'm writing this.

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*QUO-bbhxtocaU0XC_dap_Q.png)

##Volley

The way Volley works is creating requests and adding them to a queue. One queue is enough for the whole application, so each time you want to make a request you'll get the (only) Volley queue to add the request to that queue.

I’m using a global application singleton instance of the queue with the next method:

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

The method we are using to create a new request queue has an HttpStack as a parameter. If you use the method that don’t provide an HttpStack Volley will create an stack depending on your API level. (based on the AndroidHttpClient for API level 9 and and HttpURLConnection stack for API level 10 and above)

As I mention before, we’d like to use OkHttp as our transport layer, that’s the reason we are using as a parameter an OkHttpStack. The OkHttpClient implementation I'm using is [this one](https://gist.github.com/bryanstern/4e8f1cb5a8e14c202750).

The next are methods to add the requests to the Volley requests queue:

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

And this is the method to cancel requests that should normally used in the onStop lifecycle method.

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

So far we already have Volley and OkHttp ready. So we can start making either String, JsonObject or JsonArray request.

A JsonObject request would be like this:

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

We still need to parse the JSON object to our Java model. The response we are receiving on every Volley request (either String, JsonObject or JsonArray) is not really useful as it is.

![](https://d262ilb51hltx0.cloudfront.net/max/1280/1*ve4BJ_IfQ3BIKHLL-3HGqg.png)

You are not alone in the Android networking world.

##Gson

We can customize the request to get as responses Java objects that match our data model and we are more comfortable with. All it’s needed is a GsonRequest class extending the Volley Request [like in this example](https://goo.gl/Bo2ahN).

In the next example we can how would be a GET call to retrieve and parse a Json object:

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

In the next example we can how would be a GET call to retrieve and parse a Json array:

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

The Gson parsing with a GsonRequest happens on the background worker thread instead of the main thread.

I’m providing a deserializer in the examples above but note that is not mandatory to provide serializers/deserializers and Gson can handle this very well as far as the field names in the class match (including the case) with the names in the JSON file. I like to provide my serializer/deserializer for customization.

On both examples above we are making GET calls. In case the call is a POST one I've included an for a [GsonPostRequest](https://goo.gl/6t4nJM) and [how to use it](https://goo.gl/Rp8TMx).

> *OkHttp works as the transport layer for Volley, which on top of OkHttp is a handy way of making network requests that are parsed to Java objects by Gson just before delivering the response to the main thread*

##Loading images
###ImageLoader and NetworkImageView

Volley has a custom view called NetworkImageView (subclassing ImageView) that is very handy to load images. You can set an URL, a default view holder and an error image.

Example:

```java
mNetworkImageView = (NetworkImageView) itemView.findViewById(R.id.networkImageView);
mNetworkImageView.setDefaultImageResId(R.drawable.ic_sun_smile);
mNetworkImageView.setErrorImageResId(R.drawable.ic_cloud_sad);
mNetworkImageView.setImageUrl(imageUrl, App.getInstance().getVolleyImageLoader());
```

The important bit in the code above is the setImageUrl method, which receives two parameters: the image address and an ImageLoader (Volley helper that handles loading and caching images from remote URLs)

Let’s take a look at the getVolleyImageLoader method and how we can get an ImageLoader.

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

The only piece missing in this puzzle is LruBitmapCache. Volley does not provide us with an implementation but [we can get one from here](https://developer.android.com/training/volley/request.html) that looks appropriate and handles the cache size per device specs, which is cool.

###ImageRequest

In some cases we might want not to use NetworkImageView. Image for example we want circular images and we are using [CircleImageView](https://github.com/hdodenhof/CircleImageView). In that case we'll have to use ImageRequest, which works like this:

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

- All of the components we've talk about in this article (Okio, OkHttp, Volley and Gson) can be used as a standalone. They don’t need each other.

- One of the first articles I linked in the introduction (this one) was written by Jesse Wilson. Jesse Wilson is one of the guys behind Android’s HTTP, Gson, OkHttp and Okio. I thought that deserves a mention and my acknowledgement.

- OkHttp engine is backing HttpURLConnection as of Android 4.4. Twitter, Facebook and Snapchat bundles it as well.

##How relevant is this solution in 2015?

The Volley/Gson solution is mature and was quite popular around 2013 and 2014 mainly for been a Google solution and appear in the Android Developers website. Is still a good option to use because is simple and works well. Something to consider is Volley and Gson are not being actively developed anymore (and for a while).

Analyzing different solutions and compare each other on fields like speed, simplicity and how customizable they are is something will help to decide which one should be used.

You may want to check out some alternatives:

- Android Networking II: OkHttp, Retrofit, Moshi and Picasso. (coming article)

- Android Networking III: ION (coming article)

##Github project sample

- [Code sample in Github](https://github.com/Sottti/OkHttpVolleyGsonSample)

##Sources

- [Okio in Github](https://github.com/square/okio)

- [OkHttp webpage](https://square.github.io/okhttp/)

- [Volley introduction at Google IO 2013](https://goo.gl/MvNPQn)

- [Android Developers Volley training](https://goo.gl/9HXqJw)

- [OkHttp as the transport layer for Volley](https://goo.gl/ZjtY6Q)

- [A Few Ok Libraries (Jake Wharton at Droidcon Montreal)](https://www.youtube.com/watch?v=WvyScM_S88c)

- [HttpStack implementation which uses OkHttp’s native request/response API instead of relying on the HttpURLConnection wrapper.](https://plus.google.com/+JakeWharton/posts/31jhDwaCvtg)