剖析OkHttp缓存机制
---

> * 原文链接 : [WHAT’S UNDER THE HOOD OF THE OKHTTP’S CACHE?](http://www.schibsted.pl/2016/02/hood-okhttps-cache/)
* 原文作者 : [Damian Petla](http://www.schibsted.pl/author/petla/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



I guess many of you implement apps using network operations. In most cases we use [OkHttp](http://square.github.io/okhttp/) library, usually through [Retrofit](http://square.github.io/retrofit/). One of the nicest features of OkHttp is its caching mechanism. In this post I will go through all relevant steps in caching and explain how it works

现在应用市场上的 App 无一不需要网络操作，这些应用的开发者大多数都选择结合使用 [OkHttp](http://square.github.io/okhttp/) 和 [Retrofit](http://square.github.io/retrofit/) 来完成网络操作。okHttp 最为人称道的一个特性就是它的缓存机制，而我将在本篇博文对其进行剖析。

Every time I use OkHttp I need some time to think how it works, which HTTP headers do I have to use, what am I responsible for as a client app, what should I expect from the server side, and so on. So for me this post will be a reference document for the future. I am not planning this, but for sure I will forget all of that next time I need to use caching :)

每次我用 OkHttp 时我都需要一些时间想想我将怎么使用它，我该用哪一个 HTTP 报头，作为一个客户端 App 我有哪些职责，我期望从服务器上获得什么，等等……所以对我来说，这篇博文将是 OkHttp 缓存特性的引用文档，我写这篇文档不是因为我在之后的开发中可能会接触 OkHttp 的缓存机制，而是因为我很有可能在下次需要使用它的时候却把这些知识忘了。

This article is aimed at more advanced developers already familiar with OkHttp. I expect you to know at least how to setup this library and how to enable caching. If you don’t, go to OkHttp’s wiki page first. Of course it’s possible that I get something wrong, I simply describe how I see it. So if someone finds a mistake, please let me know.

这篇博文用于帮助熟悉 OkHttp 的高级工程师，我希望这篇博文的读者最起码应该知道怎么使用 OkHttp 以及怎么开启缓存。如果你不知道的话，就去 OkHttp 的维基页面学习吧。当然了，这里面的解释可能有一部分是错的，我只是尝试去解释一些我所理解的内容，所以如果你发现我某些部分的解释是有问题的，请通过邮件或其他方式告诉我。

##THE SOURCE
##分析的起点
The classes I was investigating are the following: CacheStrategy, HttpEngine. I will focus on first class where all the logic is. I mentioned HttpEngine because that is where CacheStrategy is used, so you have some context.

我将会从以下类开始我的分析工作：CacheStrategy 和 HttpEngine，其中 CacheStrategy 包含缓存机制的所有逻辑，HttpEngine 是 CacheStrategy 被调用的地方。

- **CacheStrategy.Factory** constructor – read cache response candidate’s headers and transform into class members
- **CacheStrategy.getCandidate()** – check cache response candidate and modify original request headers if needed

- **CacheStrategy.Factory** 理解缓存候选响应的报头并将其转换为类成员的构造器
- **CacheStrategy.getCandidate()** - 检查缓存候选响应，如果需要的话讲修改原始请求的报头

The above bits are crucial and basically contain all significant information we are interested in. Other methods are important too but you can navigate to them from these two.

这两部分内容是 OkHttp 整个缓存机制最关键的部分，而且几乎包含了所有我们想要了解的信息。虽说其他方法也很重要，但如果你去分析的话会发现最终还是会回到这里。

##WHAT IS A CACHE CANDIDATE?
##什么是缓存候选？
I don’t need to explain that the first time we do our HTTP request there is nothing cached and we have to call our API to actually have something to play with.

第一次进行 HTTP 请求时不会存在任何已缓存内容，相关 API 只在有缓存内容的时候才会被调用，这点相信不需要我再多解释了。

Once the response is stored we can try to use it for the subsequent calls. Of course not every response will be stored on the basis of the response code. Acceptable ones are: 200, 203, 204, 300, 301, 404, 405, 410, 414, 501, 308. There are also 302 and 307 but for them one of the following conditions must be met:

一旦响应被存储我们就能尝试将它用到后续的调用中，当然了，我们不可能将所有响应码对应的响应都存储下来。我们只存储以下响应码对应的响应：200, 203, 204, 300, 301, 404, 405, 410, 414, 501, 308。除此以外还有 302, 307，但存储它们对应的响应时必须满足以下条件之一：

- contains **Expires** header OR
- **CacheControl** contains **max-age** OR
- **CacheControl** contains **public** OR
- **CacheControl** contains **private**

- 包含 **Expires** 报头
- **CacheControl** 包含 **max-age**
- **CacheControl** 包含 **public**
- **CacheControl** 包含 **private**

Please note that caching of the partial content is not supported.

需要注意：OkHttp 的缓存机制不支持缓存部分报文内容。

When we repeat a request, OkHttp will check if there is a cached response. I will refer to that object later as cache candidate.

当我们重复某个请求，OkHttp 会判断是否已经有已缓存的响应，后文中我将称其为缓存候选。

##WHAT ABOUT CACHESTRATEGY?
##CacheStrategy 是什么？
CacheStrategy takes a new request, a cache candidate and then evaluates these two checking HTTP headers and comparing to each other.

Initially, some members are stored from cache candidate’s headers:

CacheStrategy 需要一个新的报文和一个缓存候选，评估这两个 HTTP 报头是否有效并比较它们。

首先，存放在缓存候选报头中的部分成员是：

- Date
- Expires
- Last-Modified
- ETag
- Age

Next some conditions are checked. Here is the list:
下面是需要检查的条件的汇总列表：

1. Check if cache candidate was  found.
2. In case HTTPS request check if required then the handshake is not missing in cache candidate.
3. Check if cache candidate is cacheable; it’s exactly the same check as done by OkHttp when storing the response.
4. Check in request Cache-Control header if no-cache was set, if it’s true the cache candidate is not used and further checks are skipped.
5. Look for If-Modified-Since or If-None-Match in request headers, if one of those is found the cached candidate is not used and further checks are skipped.
6. Perform several time calculations like cache response age, cache freshness lifetime, maximum stale. I don’t want to write all details about it as this would complicate the post too much. You just need to know that headers listed above (Date, Expires…) and max-age, min-fresh, max-stale from request’s Cache-Control were used to calculate them in milliseconds.
The easiest way to show the next check is writing some pseudo code:if ("cache candidate's no-cache" && "cache candidate's age" + "request's min-fresh" < "cache candidate's fresh lifetime" + "request's max-stale")

If the condition above is met then our cached response is used and further checks are skipped.
7. If we get to that point the network operation will be performed. The next checks decide if it is a conditional request or not. Conditional means that we ask our server for response and it may or not return new content or say “use your cached response, it’s all fine :)”.

1. 判断缓存候选是否存在。
2. 如果接收的是 HTTPS 请求，如果需要的话，判断缓存候选是否进行握手。
3. 判断缓存候选是否已缓存；这和 OkHttp 存储响应时完成的工作是相同的。
4. 如果没有缓存，在请求报头的 Cache-Control 中检查对应内容，如果该标记为 true，缓存候选将不会被使用，后面的检查也会跳过。
5. 在请求报头中查找 If-Modified-Since 或 If-None-Match，如果找到其中之一，缓存候选将不会被使用，后面的检查也会跳过。
6. 进行一些计算以得到诸如缓存响应缓存响应存活时间，缓存存活时间，缓存最大失活时间。我不希望在此解释所有对应实现的细节，因为这会让博文变得冗长，你只需要知道以上提到的报文内容（例如：Date, Expires 等等…）还有请求 Cache-Control 中的 max-age, min-fresh, max-stale 这部分相关的计算耗时是毫秒级的。完成检查最简单的办法是写这样的伪代码：if ("cache candidate's no-cache" && "cache candidate's age" + "request's min-fresh" < "cache candidate's fresh lifetime" + "request's max-stale")

如果上述条件被满足，那么已缓存的响应报文将会被使用，后面的检查将跳过。
7. 在需要进行网络操作时，下一次检查会判断它是否为“条件请求”。条件请求指的是：发送报文请求服务器响应，而服务器可能会也可能不会返回新的内容，或让我们使用已缓存的报文。

#WE LOOK FOR ANDROID DEVELOPERS!
##CONDITIONAL REQUEST
##条件请求

This is a new section but in the code we continue with the same method in exactly the same spot as we finished in the previous section.

1. If cache response contains ETag header, the same ETag value is used in a new request under If-None-Match header.
2. If point 1 is false and cache candidate contains Last-Modified, then that value is set in request header under If-Modified-Since.
3. If point 1 and 2 are false and cache candidate contains Date, then that value is set in the request header under If-Modified-Since

If one of these points succeed we have a conditional request, otherwise we end up with an original request and no cache involved.

下一节看起来是新的内容，但在代码结构中和上一节所解释内容是在相同的方法里的。

1. 如果缓存候选包含 ETag 报头，那么新的 If-None-Match 请求报文会使用相同的 ETag 值。
2. 如果上一点没有被满足，且缓存候选包含 Last-Modified，那么新的 If-Modified-Since 请求报文会使用该值。
3. 如果以上两点都没有被满足，且缓存候选包含 Date，那么新的 If-Modified-Since 请求报文会使用该值。

##UPS! THERE IS MORE!
##还有更多！
At the end of the process described above, when we leave **CacheStrategy.getCandidate()**, there is one more thing checked.  The library checks whether the header **Cache-Strategy** contains the parameter “**only-if-cached**“. In that case the network will not be asked for new data. OkHttp will be forced to use cache candidate if available or will throw HTTP **504 Unsatisfiable Request**.

上述描述过程的最后，也就是 **CacheStrategy.getCandidate()** 方法返回后，还会有一个检查。OkHttp 会在此时判断报头的 **Cache-Strategy** 是否包含 “**only-if-cached**“ 参数。如果有的话，不会请求新的数据。OkHttp 会强制使用缓存候选（如果有且可用），不然的话会抛出 HTTP **504 Unsatisfiable Request** 错误。

##HOW TO MAKE IT WORK?
##怎么运作？

As you might have already figured it out yourself it’s all about setting up proper headers when making HTTP calls. Making the default calls without extra headers will work somehow too but I will write about it later.

你可能自己已经知道，进行 HTTP 操作时就是设置正确的报头。但不添加额外的报头内容，使用默认的 HTTP 调用也能完成网络操作，我会在后面提及这部分内容。

##NO INTERNET
##无网络环境

This is one of the first problems I was facing. I thought that just enabling caching will do the trick but it didn’t. There are 2 solutions I know:

刚开始我遇到的问题就包含这个，那时我天真地以为只要允许进行缓存就会解决这个问题，然而并不行，我知道的两种解决方法是：

- First one is about using **Cache-Control : only-if-cached header**. It will never reach server. Only check if there is available response cached and return it. Otherwise, 504 will be thrown, so don’t forget to handle that exception.
- Second solution is about using **Cache-Control : max-stale=[seconds]** header. That one is more flexible. It indicates that client is willing to accept cached response if it’s not exceeding specified lifetime. It is verified by OkHttp, so there is no need to connect with the server. Although, if the time is exceeded, then the network operation is performed and we are getting new content from the server.

- 使用 **Cache-Control : only-if-cached header**，报文将永远也不会到达服务器。只有存在可用缓存响应时才会检查并返回它。不然的话，会抛出 504 错误，所以开发的时候别忘了处理这个异常。
- 使用 **Cache-Control : max-stale=[seconds]** 报头，这种办法更灵活一些，它向客户端表明可以接收缓存响应，只要该缓存响应没有超出其生命周期。而该缓存响应是否可用由 OkHttp 检查，所以不需要与服务器建立连接来判断。但即使如此，当缓存响应超出其生命周期，网络操作还是会进行，然后得到服务器返回的新内容。

##CARE FOR USER COSTS AND SPEED
##关心用户的开销和运行效率

The above solutions work out the offline mode and it’s all about OkHttp verification. Usually our apps are online and we would like to get new data and getting the same thing from the server over and over again generates redundant costs for users and slow down our app.

上面提到的解决方法依赖 OkHttp 的验证机制能在离线时完成一些操作。通常 App 都是在线状态，而我们更希望得到新的数据，这样会一次又一次地从服务器上获取相同的内容，给用户产生冗余的开销并降低 App 的运行效率。

In a perfect situation we would send a request and get really new data. When data is not changed on the server we get empty data with 304 HTTP response code and OkHttp return cached response. That can be achieved only if your server is supporting caching. So basically what you need to do is checking with your back-end colleagues if **ETag** or **Last-Modified-Since** is supported. That’s it! OkHttp will do the rest for you.

理想状态下，我们发送一个请求，得到真正的新数据。当服务器的数据没有发生改变，将得到 304 响应码，而 OkHttp 返回缓存响应。如果服务器支持缓存的话，这种情况是可以实现的。所以你需要做的大体就是和你的同事研究 **ETag** 或 **Last-Modified-Since** 是否被支持，如果支持的话，OkHttp 会帮你解决剩下的麻烦！

**NOTE**: Don’t try to set **If-Modified-Since** or **If-None-Match** yourself. If you look at the point 5 in the section CACHE STRATEGY you will notice that setting these will skip further checking and perform network operation.

**NOTE**: 请不要自己设置 **If-Modified-Since** 或 **If-None-Match**。前文已经提到，设置这两个报头会跳过后续的许多检查，进行网络操作。

##FORCE NETWORK
##强制网络操作
You can also force a network operation. Personally I have never had a chance to use this option but I see some possible scenarios. Let’s say you use max-stale that reaches the server after some longer time span. You may have a case when you want to allow the users to force refresh in some special situation. Nothing simpler. Use Cache-Control : no-cache in your request and you will get the new data from the server.

你也可以强制进行网络操作，但就我个人而言，我还没有这样用过 OkHttp，不过我发现了一些可能的应用场景。例如你在报头中使用了 max-stale，过了很久服务器接收到了该报文。当你想允许用户在某些特殊情况下强行进行刷新时，很简单，在请求中使用 Cache-Control : no-cache，你就能从服务器得到新的数据了。

##CONCLUSION
##结论
In my opinion OkHttp is fairly simple to use and does the most work for us. However, it’s good to understand the flow, to know which headers can be set and what they do. I hope that this article will help you.

Good luck!

在我看来，OkHttp 非常易用，极大简化了网络操作。而且有助于理解数据流，哪些报头能被设置以及它们的用处。我希望这篇博文能给你提供一些帮助。

祝你好运！