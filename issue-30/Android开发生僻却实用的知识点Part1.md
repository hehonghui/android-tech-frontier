Android 开发生僻却实用的知识点 Part 1
---

> * 原文链接 : [Android Development Tidbits // No. 1](http://willowtreeapps.com/blog/android-development-tidbits-no-1/)
* 原文作者 : [Charlie](http://willowtreeapps.com/category/development-blog/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 




我所在的 WillowTree 的 Android 开发团队素来会在 Slack channel 上每周开设一个小课程分享自己新学到的生僻技巧，秉着分享，开源的思想，从今天开始我会在本博客连载一个“Android 开发生僻却实用的知识点”专栏博文，用以分享我们所了解到的知识点。

不仅如此，我们还鼓励任何人来参与这个课程，分享他们的所知所得（尽管他们要分享的东西是显而易见的，抑或是早就被分享过了），因为不管怎样，他们都会让关注这个课程的人学习到一些知识。在这个课程中，有一些技巧你可能早就知道了，但总有一些你是不知道的。但无论如何，我们希望在这个课程中分享的开发技巧能够帮助观看的人提升写代码的能力，也希望你能从中获益。随意在下边的留言板留言提问哈，我们会回答你的问题的。

##Tidbit One

你知道 Android Studio 有一个 asset 生成器可以生成常用的 Action Bar 图标么？要用这个功能能简单，只需要点击：

[File] >[New] >[Image Asset]

![](http://willowtreeapps.com/wp-content/uploads/2015/10/blog-post-image_android-tidbits_CF.png)

##Tidbit 2

你需要单独运行一个 Gradle 测试？运行下面的代码吧：

```
./gradlew testDebug --tests='*.<testname>'
```

##Tidbit 3

在开发应用的过程中使用 Strict 模式以确保我们没有在主线程做某些不该做的事情（如耗时任务，网络访问等……），但要注意的是，应用的非 Debug 版本，即 Release 版本所用的代码必须把 Strict 模式关掉，要不然会影响应用性能甚至导致崩溃。

[http://developer.android.com/reference/android/os/StrictMode.html](http://developer.android.com/reference/android/os/StrictMode.html)

```java
if (BuildConfig.DEBUG) {
 StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()
       .detectAll()
       .penaltyLog()
       .build());
 StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()
       .detectAll()
       .penaltyLog()
       .penaltyDeathOnNetwork()
       .build());
}
```

##Tidbit 4:

在使用 Picasso 的时候可以设置 RequestTransformer 以修改请求的 Url。例如，我们可以添加图片的宽高到 Url 参数中。

##Tidbit 5:

如果你有在 manifest 中为某一个 Activity 设置 android:windowSoftInputMode="adjustResize"，那么 ScrollView（或其他可以滚动的 ViewGroup）会收缩以显示软键盘。但如果你在 Activity 的 Theme 中设置了 android:windowFullscreen="true"，ScrollView 就不会这样了，因为此时 ScrollView 已经被甚至为填充满整个屏幕。此外，在 Theme 中设置 android:fitsSystemWindows="false" 也会使 adjustResize 失效。
