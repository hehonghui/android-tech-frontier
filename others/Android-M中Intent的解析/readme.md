Android M中Intent的解析
---

> * 原文链接 : [Intent Resolving in Android M](https://medium.com/google-developer-experts/intent-resolving-in-android-m-c17d39d27048#.n23z2g14e)
* 原文作者 : [Said Tahsin Dane](https://medium.com/@tasomaniac)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [liuling07](https://github.com/liuling07) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 

Warning! Resolving of “Implicit Intent”s in Android Marshmallow is not working as the same as before. This may break your app’s behavior.

注意了！在Android Marshmallow中，“隐式Intent”的解析不能像之前版本那样正常工作了。这很有可能导致你的app不能正常使用。

Let me explain the expected behavior and why is not working:
I have recently been working on a small open source project called “Open Link With”. It will hopefully be in the Play Store soon.

现在让我解释一下这个意料之中的问题以及为什么它不能正常使用：
最近，我正在开发一个叫做“Open Link With”的小的开源项目。希望不久后它能够在应用市场上架。

My app gives you the ability to switch between other apps. When you share a link with me, I basically grab the link and query all the Activity’s that can handle that link. And finally I mimic the system dialog and let you switch apps.

我的这个app能够让你在其他app之间随意切换。当你给我分享一个链接的时候，我基本上可以根据这个链接查询出所有可以处理这个链接的Activity。然后我会模拟一个系统对话框让你切换app。


![从已经打开的youtube的web页面切换到youtube app](https://cdn-images-1.medium.com/max/1600/1*rW8I8aCpJ2q8fnfKH_51_g.gif)

I was using the below method as always:
我一直都是使用下面的方法：

｀｀｀
List<ResolveInfo> infos = packageManager
        .queryIntentActivities(intent, MATCH_DEFAULT_ONLY);
｀｀｀

It is a familiar method to almost all Android developers and I am sure that it is currently being used in lots of apps.
I have 2 browsers in my phone. “An Intent with Google+ URL” is expected to give a list of 3 ResolveInfo objects (Google+ app and 2 browsers).

这段代码几乎所有Android开发者都比较熟悉，并且我也相信大部分app都有用到这段代码。
我的手机里有两个浏览器，“一个Google+ URL的Intent”期望得到一个3个ResolveInfo对象的列表（Google+应用以及两个浏览器）。



