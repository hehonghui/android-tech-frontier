剖析OkHttp缓存机制
---

> * 原文链接 : [WHAT’S UNDER THE HOOD OF THE OKHTTP’S CACHE?](http://www.schibsted.pl/2016/02/hood-okhttps-cache/)
* 原文作者 : [Damian Petla](http://www.schibsted.pl/author/petla/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121) 
* 状态 :  完成 



现在应用市场上的 App 无一不需要网络操作，这些应用的开发者大多数都选择结合使用 [OkHttp](http://square.github.io/okhttp/) 和 [Retrofit](http://square.github.io/retrofit/) 来完成网络操作。okHttp 最为人称道的一个特性就是它的缓存机制，而我将在本篇博文对其进行剖析。

每次我用 OkHttp 时我都需要一些时间想想我将怎么使用它，我该用哪一个 HTTP 报头，作为一个客户端 App 我有哪些职责，我期望从服务器上获得什么，等等……所以对我来说，这篇博文将是 OkHttp 缓存特性的引用文档，我写这篇文档不是因为我在之后的开发中可能会接触 OkHttp 的缓存机制，而是因为我很有可能在下次需要使用它的时候却把这些知识忘了。

这篇博文用于帮助熟悉 OkHttp 的高级工程师，我希望这篇博文的读者最起码应该知道怎么使用 OkHttp 以及怎么开启缓存。如果你不知道的话，就去 OkHttp 的维基页面学习吧。当然了，这里面的解释可能有一部分是错的，我只是尝试去解释一些我所理解的内容，所以如果你发现我某些部分的解释是有问题的，请通过邮件或其他方式告诉我。

##分析的起点

我将会从以下类开始我的分析工作：CacheStrategy 和 HttpEngine，其中 CacheStrategy 包含缓存机制的所有逻辑，HttpEngine 是 CacheStrategy 被调用的地方。

- **CacheStrategy.Factory** 理解缓存候选响应的报头并将其转换为类成员的构造器
- **CacheStrategy.getCandidate()** - 检查缓存候选响应，如果需要的话讲修改原始请求的报头

这两部分内容是 OkHttp 整个缓存机制最关键的部分，而且几乎包含了所有我们想要了解的信息。虽说其他方法也很重要，但如果你去分析的话会发现最终还是会回到这里。

##什么是缓存候选响应？

第一次进行 HTTP 请求时不会存在任何已缓存内容，相关 API 只在有缓存内容的时候才会被调用，这点相信不需要我再多解释了。

一旦响应被存储我们就能尝试将它用到后续的调用中，当然了，我们不可能将所有响应码对应的响应都存储下来。我们只存储以下响应码对应的响应：200, 203, 204, 300, 301, 404, 405, 410, 414, 501, 308。除此以外还有 302, 307，但存储它们对应的响应时必须满足以下条件之一：

- contains **Expires** header OR
- **CacheControl** contains **max-age** OR
- **CacheControl** contains **public** OR
- **CacheControl** contains **private**

- 包含 **Expires** 报头
- **CacheControl** 包含 **max-age**
- **CacheControl** 包含 **public**
- **CacheControl** 包含 **private**

需要注意：OkHttp 的缓存机制不支持缓存部分报文内容。

当我们重复某个请求，OkHttp 会判断是否已经有已缓存的响应，后文中我将称其为缓存候选响应。

##CacheStrategy 是什么？

CacheStrategy 需要一个新的报文和一个缓存候选响应，评估这两个 HTTP 报头是否有效并比较它们。

首先，存放在缓存候选响应报头中的部分成员是：

- Date
- Expires
- Last-Modified
- ETag
- Age

下面是需要检查的条件的汇总列表：

1. 判断缓存候选响应是否存在。
2. 如果接收的是 HTTPS 请求，如果需要的话，判断缓存候选响应是否已进行握手。
3. 判断缓存候选响应是否已缓存；这和 OkHttp 存储响应时完成的工作是相同的。
4. 如果没有缓存，在请求报头的 Cache-Control 中检查对应内容，如果该标记为 true，缓存候选响应将不会被使用，后面的检查也会跳过。
5. 在请求报头中查找 If-Modified-Since 或 If-None-Match，如果找到其中之一，缓存候选响应将不会被使用，后面的检查也会跳过。
6. 进行一些计算以得到诸如缓存响应缓存响应存活时间，缓存存活时间，缓存最大失活时间。我不希望在此解释所有对应实现的细节，因为这会让博文变得冗长，你只需要知道以上提到的报文内容（例如：Date, Expires 等等…）还有请求 Cache-Control 中的 max-age, min-fresh, max-stale 这部分相关的计算耗时是毫秒级的。完成检查最简单的办法是写这样的伪代码：if ("cache candidate's no-cache" && "cache candidate's age" + "request's min-fresh" < "cache candidate's fresh lifetime" + "request's max-stale")

如果上述条件被满足，那么已缓存的响应报文将会被使用，后面的检查将跳过。
7. 在需要进行网络操作时，下一次检查会判断它是否为“条件请求”。条件请求指的是：发送报文请求服务器响应，而服务器可能会也可能不会返回新的内容，或让我们使用已缓存的报文。

#WE LOOK FOR ANDROID DEVELOPERS!
##条件请求

下一节看起来是新的内容，但在代码结构中和上一节所解释内容是在相同的方法里的。

1. 如果缓存候选响应包含 ETag 报头，那么新的 If-None-Match 请求报文会使用相同的 ETag 值。
2. 如果上一点没有被满足，且缓存候选响应包含 Last-Modified，那么新的 If-Modified-Since 请求报文会使用该值。
3. 如果以上两点都没有被满足，且缓存候选响应包含 Date，那么新的 If-Modified-Since 请求报文会使用该值。

##还有更多！

上述描述过程的最后，也就是 **CacheStrategy.getCandidate()** 方法返回后，还会有一个检查。OkHttp 会在此时判断报头的 **Cache-Strategy** 是否包含 “**only-if-cached**“ 参数。如果有的话，不会请求新的数据。OkHttp 会强制使用缓存候选响应（如果有且可用），不然的话会抛出 HTTP **504 Unsatisfiable Request** 错误。

##怎么运作？

你可能自己已经知道，进行 HTTP 操作时就是设置正确的报头。但不添加额外的报头内容，使用默认的 HTTP 调用也能完成网络操作，我会在后面提及这部分内容。

##无网络环境

刚开始我遇到的问题就包含这个，那时我天真地以为只要允许进行缓存就会解决这个问题，然而并不行，我知道的两种解决方法是：

- 使用 **Cache-Control : only-if-cached header**，报文将永远也不会到达服务器。只有存在可用缓存响应时才会检查并返回它。不然的话，会抛出 504 错误，所以开发的时候别忘了处理这个异常。
- 使用 **Cache-Control : max-stale=[seconds]** 报头，这种办法更灵活一些，它向客户端表明可以接收缓存响应，只要该缓存响应没有超出其生命周期。而该缓存响应是否可用由 OkHttp 检查，所以不需要与服务器建立连接来判断。但即使如此，当缓存响应超出其生命周期，网络操作还是会进行，然后得到服务器返回的新内容。

##关心用户的开销和运行效率

上面提到的解决方法依赖 OkHttp 的验证机制能在离线时完成一些操作。通常 App 都是在线状态，而我们更希望得到新的数据，这样会一次又一次地从服务器上获取相同的内容，给用户产生冗余的开销并降低 App 的运行效率。

理想状态下，我们发送一个请求，得到真正的新数据。当服务器的数据没有发生改变，将得到 304 响应码，而 OkHttp 返回缓存响应。如果服务器支持缓存的话，这种情况是可以实现的。所以你需要做的大体就是和你的同事研究 **ETag** 或 **Last-Modified-Since** 是否被支持，如果支持的话，OkHttp 会帮你解决剩下的麻烦！

**NOTE**: 请不要自己设置 **If-Modified-Since** 或 **If-None-Match**。前文已经提到，设置这两个报头会跳过后续的许多检查，进行网络操作。

##强制网络操作

你也可以强制进行网络操作，但就我个人而言，我还没有这样用过 OkHttp，不过我发现了一些可能的应用场景。例如你在报头中使用了 max-stale，过了很久服务器接收到了该报文。当你想允许用户在某些特殊情况下强行进行刷新时，很简单，在请求中使用 Cache-Control : no-cache，你就能从服务器得到新的数据了。

##结论

在我看来，OkHttp 非常易用，极大简化了网络操作。而且有助于理解数据流，哪些报头能被设置以及它们的用处。我希望这篇博文能给你提供一些帮助。

祝你好运！