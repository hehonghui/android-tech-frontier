自定义 CoordinatorLayout 的行为
---

> * 原文链接 : [WHAT’S UNDER THE HOOD OF THE OKHTTP’S CACHE?](http://www.schibsted.pl/2016/02/hood-okhttps-cache/)
* 原文作者 : [Damian Petla](http://www.schibsted.pl/author/petla/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



I guess many of you implement apps using network operations. In most cases we use [OkHttp](http://square.github.io/okhttp/) library, usually through [Retrofit](http://square.github.io/retrofit/). One of the nicest features of OkHttp is its caching mechanism. In this post I will go through all relevant steps in caching and explain how it works

Every time I use OkHttp I need some time to think how it works, which HTTP headers do I have to use, what am I responsible for as a client app, what should I expect from the server side, and so on. So for me this post will be a reference document for the future. I am not planning this, but for sure I will forget all of that next time I need to use caching :)

This article is aimed at more advanced developers already familiar with OkHttp. I expect you to know at least how to setup this library and how to enable caching. If you don’t, go to OkHttp’s wiki page first. Of course it’s possible that I get something wrong, I simply describe how I see it. So if someone finds a mistake, please let me know.

##THE SOURCE
The classes I was investigating are the following: CacheStrategy, HttpEngine. I will focus on first class where all the logic is. I mentioned HttpEngine because that is where CacheStrategy is used, so you have some context.

- **CacheStrategy.Factory** constructor – read cache response candidate’s headers and transform into class members
- **CacheStrategy.getCandidate()** – check cache response candidate and modify original request headers if needed
The above bits are crucial and basically contain all significant information we are interested in. Other methods are important too but you can navigate to them from these two.

##WHAT IS A CACHE CANDIDATE?
I don’t need to explain that the first time we do our HTTP request there is nothing cached and we have to call our API to actually have something to play with.

Once the response is stored we can try to use it for the subsequent calls. Of course not every response will be stored on the basis of the response code. Acceptable ones are: 200, 203, 204, 300, 301, 404, 405, 410, 414, 501, 308. There are also 302 and 307 but for them one of the following conditions must be met:

- contains **Expires** header OR
- **CacheControl** contains **max-age** OR
- **CacheControl** contains **public** OR
- **CacheControl** contains **private**

Please note that caching of the partial content is not supported.

When we repeat a request, OkHttp will check if there is a cached response. I will refer to that object later as cache candidate.

##WHAT ABOUT CACHESTRATEGY?

CacheStrategy takes a new request, a cache candidate and then evaluates these two checking HTTP headers and comparing to each other.

Initially, some members are stored from cache candidate’s headers:

- Date
- Expires
- Last-Modified
- ETag
- Age

Next some conditions are checked. Here is the list:

1. Check if cache candidate was  found.
2. In case HTTPS request check if required then the handshake is not missing in cache candidate.
3. Check if cache candidate is cacheable; it’s exactly the same check as done by OkHttp when storing the response.
4. Check in request Cache-Control header if no-cache was set, if it’s true the cache candidate is not used and further checks are skipped.
5. Look for If-Modified-Since or If-None-Match in request headers, if one of those is found the cached candidate is not used and further checks are skipped.
6. Perform several time calculations like cache response age, cache freshness lifetime, maximum stale. I don’t want to write all details about it as this would complicate the post too much. You just need to know that headers listed above (Date, Expires…) and max-age, min-fresh, max-stale from request’s Cache-Control were used to calculate them in milliseconds.
The easiest way to show the next check is writing some pseudo code:if ("cache candidate's no-cache" && "cache candidate's age" + "request's min-fresh" < "cache candidate's fresh lifetime" + "request's max-stale")

If the condition above is met then our cached response is used and further checks are skipped.
7. If we get to that point the network operation will be performed. The next checks decide if it is a conditional request or not. Conditional means that we ask our server for response and it may or not return new content or say “use your cached response, it’s all fine :)”.

#WE LOOK FOR ANDROID DEVELOPERS!
##CONDITIONAL REQUEST

This is a new section but in the code we continue with the same method in exactly the same spot as we finished in the previous section.

1. If cache response contains ETag header, the same ETag value is used in a new request under If-None-Match header.
2. If point 1 is false and cache candidate contains Last-Modified, then that value is set in request header under If-Modified-Since.
3. If point 1 and 2 are false and cache candidate contains Date, then that value is set in the request header under If-Modified-Since

If one of these points succeed we have a conditional request, otherwise we end up with an original request and no cache involved.

##UPS! THERE IS MORE!

At the end of the process described above, when we leave **CacheStrategy.getCandidate()**, there is one more thing checked.  The library checks whether the header **Cache-Strategy** contains the parameter “**only-if-cached**“. In that case the network will not be asked for new data. OkHttp will be forced to use cache candidate if available or will throw HTTP **504 Unsatisfiable Request**.

##HOW TO MAKE IT WORK?

As you might have already figured it out yourself it’s all about setting up proper headers when making HTTP calls. Making the default calls without extra headers will work somehow too but I will write about it later.

##NO INTERNET

This is one of the first problems I was facing. I thought that just enabling caching will do the trick but it didn’t. There are 2 solutions I know:

- First one is about using **Cache-Control : only-if-cached header**. It will never reach server. Only check if there is available response cached and return it. Otherwise, 504 will be thrown, so don’t forget to handle that exception.
- Second solution is about using **Cache-Control : max-stale=[seconds]** header. That one is more flexible. It indicates that client is willing to accept cached response if it’s not exceeding specified lifetime. It is verified by OkHttp, so there is no need to connect with the server. Although, if the time is exceeded, then the network operation is performed and we are getting new content from the server.

##CARE FOR USER COSTS AND SPEED

The above solutions work out the offline mode and it’s all about OkHttp verification. Usually our apps are online and we would like to get new data and getting the same thing from the server over and over again generates redundant costs for users and slow down our app.

In a perfect situation we would send a request and get really new data. When data is not changed on the server we get empty data with 304 HTTP response code and OkHttp return cached response. That can be achieved only if your server is supporting caching. So basically what you need to do is checking with your back-end colleagues if **ETag** or **Last-Modified-Since** is supported. That’s it! OkHttp will do the rest for you.

**NOTE**: Don’t try to set **If-Modified-Since** or **If-None-Match** yourself. If you look at the point 5 in the section CACHE STRATEGY you will notice that setting these will skip further checking and perform network operation.

##FORCE NETWORK

You can also force a network operation. Personally I have never had a chance to use this option but I see some possible scenarios. Let’s say you use max-stale that reaches the server after some longer time span. You may have a case when you want to allow the users to force refresh in some special situation. Nothing simpler. Use Cache-Control : no-cache in your request and you will get the new data from the server.

##CONCLUSION

In my opinion OkHttp is fairly simple to use and does the most work for us. However, it’s good to understand the flow, to know which headers can be set and what they do. I hope that this article will help you.

Good luck!