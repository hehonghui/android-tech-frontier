一个支持多设备的Android参考应用
---
>
* 原文链接 : [a-new-reference-app-for-multi-device](http://android-developers.blogspot.com/2015/03/a-new-reference-app-for-multi-device.html)
* 译者 : [Mr.Simple & Sophie.Ping](https://www.github.com/bboyfeiyu)

现在你可以把你的app的好用之处分享给你的用户，不管他们身处何地，手上拿着何种设备。今儿我们会发布一个参考示例，展示一下如何把这种服务运用到一个在多个Android form-Factor运作的app上。这个示例叫做Universal Music Player，它是一个准系统但是参考功能齐全，在单个代码库里支持多种设备和形式因素。它能与Android Auto、Android Wear和Google Cast设备兼容。你可以试试把你的app适配到你的用户，无论他在哪里，无论他手上拿的是手机，手表，电视，汽车还是其他的设备。
![android](http://img.blog.csdn.net/20150322112056022)  

锁屏时的播放控制和专辑封面
应用toolbar上的Google Cast 图标

![auto](http://img.blog.csdn.net/20150322111453169)     
使用Android Auto控制播放

![watch](http://img.blog.csdn.net/20150322111518047)      
通过Android Wear Watch控制播放


本示例运用了Android 5.0 Lollipop的几个新功能，比如MediaStyle通知，MediaSession和MediaBrowserService.这几个新功能使得在多个设备上使用单一app版本操作媒体浏览和回放变得更容易。
一起来看看源代码吧，让你的用户以他们的方式爱上你的app。
作者：Renato Mangini，高级开发工程师，Google开发者平台团队成员