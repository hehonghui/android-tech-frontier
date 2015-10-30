Chrome自定义Tabs，让App和Web之间的转场更平顺
---

> * 原文链接 : [Chrome custom tabs smooth the transition between apps and the web](http://android-developers.blogspot.sg/2015/09/chrome-custom-tabs-smooth-transition.html)
* 原文作者 : [Yusuf Ozuysal, Chief Tab Customizer](htTabstp://blog.chromium.org/2015/09/chrome-custom-tabs-smooth-transition_2.html)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [嗣音君](https://github.com/xiaolangpapa) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中

--

>Android app developers face a difficult tradeoff when it comes to showing web content in their Android app. Opening links in the browser is familiar for users and easy to implement, but results in a heavy-weight transition between the app and the web. You can get more granular control by building a custom browsing experience on top of Android’s WebView, but at the cost of more technical complexity and an unfamiliar browsing experience for users. A new feature in the most recent version of Chrome called custom tabs addresses this tradeoff by allowing an app to customize how Chrome looks and feels, making the transition from app to web content fast and seamless.

当要在App中显示网页内容时，Android应用开发者将面临一个困难选择：在浏览器中打开链接是无疑是一个用户熟悉且非常容易实现的方式，但是却会引发app和web之间一个重量级的转场；而在Android WebView基础上建立起一套新的浏览机制可以获得更细颗粒度的控制，但是这将增加技术复杂度，同时给用户带来一种不甚熟悉的浏览体验。最新版本的Chrome的一个新特性可以解决了这个两难的选择，它就是自定义tabs，可以让app自定义Chrome的外观和感觉，从而实现app到web内容之间快速无缝的转场。

![](http://7xjy6x.com1.z0.glb.clouddn.com/CCT_Large%202.gif)
>Chrome custom tabs with pre-loading vs. Chrome and WebView

预加载的Chrome自定义Tabs VS Chrome 和 WebView

>Chrome custom tabs allow an app to provide a fast, integrated, and familiar web experience for users. Custom tabs are optimized to load faster than WebViews and traditional methods of launching Chrome. As shown above, apps can pre-load pages in the background so they appear to load nearly instantly when the user navigates to them. Apps can also customize the look and feel of Chrome to match their app by changing the toolbar color, adjusting the transition animations, and even adding custom actions to the toolbar so users can perform app-specific actions directly from the custom tab.

Chrome自定义tabs使得app可以给用户提供一种快速，完整和熟悉的web体验。自定义tabs是经过优化的，加载速度比WebView和传统方式启动的Chrome都要快。如上图所示，由于app可以在后台预加载网页，当用户访问的时候会感觉几乎是瞬间就加载完毕了。此外，app还可以通过自定义Chrome Tabs的外观和感觉来和自身风格保持一致，如改变toolbar的颜色，调整转场特效，甚至是给toolbar加上自定义的操作，让用户直接通过自定义的tabs来触发app自身特有的功能。

>Custom tabs benefit from Chrome’s advanced security features, including its multi-process architecture and robust permissions model. They use the same cookie jar as Chrome, allowing a familiar browsing experience while keeping users’ information safe. For example, if a user has signed in to a website in Chrome, they will also be signed in if they visit the same site in a custom tab. Other features that help users browse the web, like saved passwords, autofill, Tap to Search, and Sync, are also available in custom tabs.

自定义tabs受益于Chrome先进的安全特性，包括多线程架构和健壮的权限模型。另外它们使用了和Chrome一样的cookie jar，这将营造出熟悉的浏览体验，同时又保证了用户的信息安全。举个例子，如果用户已经使用Chrome登录了某个网站，那么用户在app自定义tab中访问同样的网站时也将保持登录状态。其他能帮助用户更好地浏览网页的特性，如保存密码，自动填充，轻点进行搜素和同步等，在自定义tabs中都是可用的。

[视频：Chrome自定义tabs：在你的Android应用中显示第三方内容](https://youtu.be/QOxIdbNwpx0)

>Custom tabs are easy for developers to integrate into their app by tweaking a few parameters of their existing VIEW intents. Basic integrations require only a few extra lines of code, and a support library makes more complex integrations easy to accomplish, too. Since custom tabs is a feature of Chrome, it’s available on any version of Android where recent versions of Chrome are available.

开发者只要调整现有的一些VIEW intents参数就可以轻易地把自定义tabs页集成到他们的app当中去。基本的集成只需几行额外的代码,而加入支持库（support library）则可以让更复杂的集成同样简单地被实现。由于自定义tabs是Chrome的特性，所以在任何拥有最新版本Chrome的Android上都是可用的。


>Users will begin to experience custom tabs in the coming weeks in Feedly, The Guardian, Medium, Player.fm, Skyscanner, Stack Overflow, Tumblr, and Twitter, with more coming soon. To get started integrating custom tabs into your own application, check out the developer guide.


在未来几周内，用户可以在[Feedly](https://play.google.com/store/apps/details?id=com.devhd.feedly)，[The Guardian](https://play.google.com/store/apps/details?id=com.guardian)，[Medium](https://play.google.com/store/apps/details?id=com.medium.reader)，[Player.fm](https://play.google.com/store/apps/details?id=fm.player)，[Skyscanner](https://play.google.com/store/apps/details?id=net.skyscanner.android.main)，[Stack Overflow](https://play.google.com/store/apps/details?id=com.stackexchange.marvin)，[
Tumblr](https://play.google.com/store/apps/details?id=com.tumblr)和[Twitter](https://play.google.com/store/apps/details?id=com.twitter.android)体验到自定义tabs，当然，即将到来的还有更多App。想要开始往你的App中集成自定义tabs，请查看[开发者指引](https://developer.chrome.com/multidevice/android/customtabs)。

>Posted by Reto Meier at 10:01 AM  
Labels: chrome, Develop, Featured, Web, WebView

[Reto Meier](https://plus.google.com/113601876824575481275) 在 [10:01 AM](http://android-developers.blogspot.sg/2015/09/chrome-custom-tabs-smooth-transition.html) 发布  
标签：[chrome](http://android-developers.blogspot.sg/search/label/chrome), [Develop](http://android-developers.blogspot.sg/search/label/Develop), [Featured](http://android-developers.blogspot.sg/search/label/Featured), [Web](http://android-developers.blogspot.sg/search/label/Web), [WebView](http://android-developers.blogspot.sg/search/label/WebView)


