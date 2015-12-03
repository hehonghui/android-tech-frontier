Android 6.0中Intent的解析
---

> * 原文链接 : [Intent Resolving in Android M](https://medium.com/google-developer-experts/intent-resolving-in-android-m-c17d39d27048#.n23z2g14e)
* 原文作者 : [Said Tahsin Dane](https://medium.com/@tasomaniac)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [liuling07](https://github.com/liuling07) 
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成 

注意了！在Android 6.0中，“隐式Intent”的解析不能像之前版本那样正常工作了。这很有可能导致你的app不能正常使用。

现在让我解释一下这个意料之中的问题以及为什么它不能正常使用：
最近，我正在开发一个小的开源项目，叫做“Open Link With”。希望不久后它能够在应用市场上架。

我的这个app能够让你在其他app之间随意切换。当你给我分享一个链接的时候，我基本上可以根据这个链接查询出所有可以处理这个链接的Activity。然后我会模拟一个系统对话框让你切换app。

![从已经打开的youtube的web页面切换到youtube应用](https://cdn-images-1.medium.com/max/1600/1*rW8I8aCpJ2q8fnfKH_51_g.gif)

我一直都是使用下面的方法：

```
List<ResolveInfo> infos = packageManager
        .queryIntentActivities(intent, MATCH_DEFAULT_ONLY);
```

这段代码几乎所有Android开发者都比较熟悉，并且我也相信大部分app都有用到这段代码。

我的手机里有两个浏览器。“一个URL是Google+ 的Intent”期望得到一个具有3个ResolveInfo对象的列表（Google+应用以及两个浏览器）。

好吧，并不是这样！

欢迎来到Android 6.0！

Android 6.0引进了应用关联。系统主要通过你的web页面来认证，并且自动使用你的app来打开这些URL，而不会向你做任何请求。或者你可以到系统设置，选择“应用程序”，然后点击一个应用，再点击“默认打开方式”，然后设置“用这个应用打开”，就可以每次都使用这个应用打开。

![Android 6.0的应用默认设置页面](https://cdn-images-1.medium.com/max/800/1*MVZbYKhwu-7qnyGAFWuNsw.png)

在这种情况下，queryIntentActivities方法只会给开发者返回一个只有一个Activity的列表（此例子返回的是Google+）。

虽然这是在意料之中的，但是应该在文档中注明，因为它与公共API相矛盾了。

我研究了一下，发现了一个MATCH_ALL标志，文档表示，它将禁用所有的系统级过滤器。

```
/**
 * Querying flag: if set and if the platform is doing any filtering of the results, then
 * the filtering will not happen. This is a synonym for saying that all results should
 * be returned.
 */
public static final int MATCH_ALL = 0x00020000;
```

这对我来说没什么用。我打开源码（至少我有源码）并开始研究这个方法。

它似乎优先考虑验证应用程序的域，不仅在它的内部系统，在公共API中也是如此。

如果有一个验证应用程序的域，它不会返回任何其他东西。MATCH_ALL标志会移除一些系统过滤器，但是仅仅是在没有验证程序的情况下。

对于这个问题，我找不到任何可变通的措施。它只是排除浏览器应用，即使他们的IntentFilters匹配。

之所以没有可变通的措施，是因为他是一个内部组件（我们无法访问），Android SDK通过IPC使用AIDL与它进行通信。

大部分开发者使用这个方法来判断是否至少有一个Activity来处理隐式的Intent。在大多数情况下，列表中第一项就是你想要的。

在花了几个小时搞明白到底发生了什么之后，我尝试寻找一个我认为每个人都应该知道的解决方案。

在Android 6.0中，改动的地方很多。实际上谷歌提供了一些改变清单，在清单中你能看到到底有哪些改变。我认为还有很多类似上面的一些没有在清单中列出的改变，而这些改动很有可能导致你的应用无法正常运行。

所以如果你使用PackageManager的方法，你一定得小心，并且认真检查。

感谢此文的校对者：[Yağmur Dalman](https://twitter.com/yagmurdalman)、[ Sebastiano Poggi](https://medium.com/u/9706138c9bfb)、[Salim KAYABAŞI](https://medium.com/u/73761c65c602)、[Hasan Keklik](https://medium.com/u/24a0490cd588)


