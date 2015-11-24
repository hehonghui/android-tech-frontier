Android 开发生僻却实用的知识点 Part 2
---

> * 原文链接 : [Android Development Tidbits // No. 2](http://willowtreeapps.com/blog/android-development-tidbits-no-2/)
* 原文作者 : [Charlie](http://willowtreeapps.com/category/development-blog/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成 



欢迎大家来看“Android 开发生僻却实用的知识点”系列博文的第二部分！就像在我上周发布的[第一部分]()中所说，与其说这是一个博文专栏，倒不如说这是我们团队所开办的一次 Android 开发分享会，为 Android 开发者提供机会以分享自己在开发过程中收获的小技巧或者是生僻的知识点。再次重申，我们鼓励任何人以任何形式来分享他的所知所得，不管你所想要分享的知识点是高深还是浅显。毕竟你所熟悉的故土总会是某些人即将遇见的新大陆，所以请不要吝啬，我们希望有干货的你能来给我们提供博文的素材！


##Tidbit 1

在应用的运行过程中如果 Android 系统决定要更新系统的 WebView，那你的应用可能会发生崩溃，详细的问题[**请戳我**](http://stackoverflow.com/questions/29575313/namenotfoundexception-webview)。

##Tidbit 2

Material Design 中有对 padding 和 margin 的要求，除非你是专业的交互设计师，懂得 padding 在什么情况下取什么值才是正确，什么时候是错误的，而且有注意到在这个知识点中，单词间的间距是两个空格，那你可以下载这个 App，并研究其中的细节，了解清楚之后再看看你的 App，看看哪些部分是不符合规范的。

##Tidbit 3

即使你已经在 Adapter 里将 List 中的某一项 Item 移除，getChildLayoutPosition 还是会返回 position 值，这是因为被移除的 View 可能还处于显示移除动画的状态，因此还存在于 RecyclerView 之中。

##Tidbit 4

GET_ACCOUNTS 这个运行时权限不能通过权限页面将它在 API-23 之前的设备中设置为关闭（事实上，如果这是联系人组里唯一的权限，你甚至不能在联系人组里看到这个权限成为一个可选选项）。由于这个细节，假设 account 存在而导致的崩溃的例子实在太多了。

##Tidbit 5

Chrome 改变了它处理深层链接的方式。现在我们不会因为在地址栏中输入一个 Url 而偶然地打开某个深层链接。举例来说，从前你能够在 Chrome 的地址栏中输入 pandora.com，然后会触发 Pandora 应用的打开，而不是直接打开该网页。在新的版本中，用户只会看到 Pandora 的网页。
intent:

```
intent:
   HOST/URI-path // Optional host 
   #Intent; 
      package=[string]; 
      action=[string]; 
      category=[string]; 
      component=[string]; 
      scheme=[string]; 
   end; 
```

例如:


```
<a href="intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end"> Take a QR code </a>
```

专家建议：你可以在链接中添加回退 Url 和/或包名，在用户没有安装 App 时就能获得回退 Url。首先 Chrome 会检查是否有回退 Url，然后导航用户到该 Url。如果没有回退 Url，Chrome 就会寻找包名，使得用户会打开 Play Store，并进入对应包名的页面。如果用户没有安装该 App，而且没有回退 Url，就会出现404错误。

##Tidbit 6

使用 23.0.0 开发库时使用 Loader 的话要注意：由于 Fragment 和 Activity 交互的方式被改变了，当手机方向改变，发生横竖屏切换时会发生一个 Bug，使 loader 被丢失。在 support 23.1.0 中这个 Bug 被修复了，然而，当 Loader 在子 Fragment 中被使用是，方向改变还是会出现这个 Bug。所以现在唯一的解决办法就是使用 23.0.0 之前的库。

##Tidbit 7

在方法返回一个空集合的时候尽可能使用 Collections.emptyList() 和 Collections.emptySet()。Collection 类会返回一个单例空 list 或 set，这样我们就不需要总是创建新的空集合，浪费内存了。
