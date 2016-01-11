# Yelp是如何通过Glide优化图片加载的
-------
> * 原文链接 : [Glide – How Yelp’s Android App Loads Images](http://engineeringblog.yelp.com/2015/07/glide-how-yelps-android-app-loads-images.html)
> * 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
> * 译者 : [tiiime](https://github.com/tiiime) 

动态加载图片是是很多应用的基础。在yelp，图片是连接消费者和企业的关键。
随着网络和硬件设备的发展，用户对图片质量要求越来越高，数量越来越大。图片很容就
消耗了大量的硬件资源和网络流量，下载和管理这些数据变成了一个很麻烦的问题。
我们尝试了一些现有的解决方案，最终选择了 [Glide][glide] 这个项目。

在最简单的使用场景中，Glide 会将来自服务器或本地文件的图片加载到磁盘和内存的缓存中，
然后再把它们载入到 view 里。虽然 Glide 适用场景很多， 但它主要致力于优化
带有图片的 scrolling list ，使其尽可能流畅。

## 对象池
Glide 的核心部分就是维护一个 bitmap 的对象池。对象池通过减少大块对象分配
来提升性能，而不是重用对象。(关于对象池的介绍:[this Android performance pattern video][object-pool] )。

目前为止，Dalvik 和 ART 都没有使用压缩垃圾回收机制
([compacting garbage collector][compact-gc])，压缩垃圾回收算法会检查 heap，
然后将内存中所有存活对象移到相邻的位置，把大块的可用空间空出来以备后用。
因为 Android 没有采用这套机制，所以内存有可能被各种对象占满，对象间的可用
空间很小。如果应用在这时申请一个比内存里现在最大的空闲块还大的对象，
就会 OutOfMemoryError ，即使剩余内存总和远大于分配这个对象所需的空间。

使用对象池也提升了 list 滚动时的性能，因为重用 bitmaps 就意味着减少了创建和回收对象。
当系统执行垃圾回收时会让整个系统"时间静止"，回收器运行时所有的线程(包括 UI 线程)
都会被暂停。这段时间里，动画帧不能绘制，UI 会卡顿，这在滚动动画的过程中会更加明显明显。

![img](http://engineeringblog.yelp.com/wp-content/uploads/2015/07/scrolling-slight.gif)

---

## 使用Glide
Glide 上手很容易，不需要任何配置，默认就会使用 bitmap 对象池。

```java
DrawableRequestBuilder requestBuilder = Glide.with(context).load(imageUrl);
requestBuilder.into(imageView);
```

很简单的两步图片就载入完成了。在 Android 中， with() 方法里传递的 context
可能是 Application 的 context ，也可能是 Activity 的 context。区别这一点很重要，
如果传递的是 Activity 的 context，Glide 会监测 activity 的生命周期，
当 Glide 检测到 Activity 被销毁时， 会自动取消等待中的请求。如果你传递的是一个
Application context，Glide 就不能对其进行优化。

## 优化特性
和上面一样，当图片从 ListView 中移出屏幕时， Glide 也会取消其对应的请求。
由于大多数开发者在 adapter 中重用 View，Glide 会给在请求数据时给对应的
ImageView 附加一个 tag，然后再载入其他图片时检查这个 tag，
如果存在的话取消第一个请求。

Glide 提供一些特性，可以提升图片加载速度。首先是在图片展示前预读取数据，
它提供了一个 ListPreloader，通过预加载 item 的数量初始化。接着通过
`setOnScrollListener(OnScrollListener)` 把 [ListPreloader][ListPreloader] 设置给 ListView。如果你想在 ListView 之外预载图片，只要调用上面 `DrawableRequestBuilder`
对象的 downloadOnly() 方法就好，像这样 `builder.downloadOnly();`。

总之，我们发现了一个强大的工具 Glide。后面都是各种夸 Glide 的话啦~

[glide]:https://github.com/bumptech/glide
[object-pool]:https://www.youtube.com/watch?v=bSOREVMEFnM
[compact-gc]:https://en.wikipedia.org/wiki/Mark-compact_algorithm
[ListPreloader]:https://github.com/bumptech/glide/blob/30c92551ee75c2109955ee653e8795c7c1d60bf8/library/src/main/java/com/bumptech/glide/ListPreloader.java
