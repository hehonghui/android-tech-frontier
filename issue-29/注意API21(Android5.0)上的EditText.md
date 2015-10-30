注意API 21 (Android 5.0) 上的EditText
---

> * 原文链接 : [Beware EditText on API 21](http://blog.danlew.net/2015/10/12/beware-edittext-on-api-21/?utm_source=Android+Weekly&utm_campaign=0903213dbd-Android_Weekly_175&utm_medium=email&utm_term=0_4eb677ad19-0903213dbd-337955857)
* 原文作者 : [Dan Lew](http://blog.danlew.net/about/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [嗣音君](https://github.com/xiaolangpapa) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :   完成


请仔细看看这两个EditText，一个是在API 21（Android 5.0）的设备上，另一个是在API 22 （Android 5.1）的设备上。

![](http://blog.danlew.net/content/images/2015/10/edittexts.png)

发现它们之间的差别了吗？打开“显示布局边界”可以看得更清楚：

![](http://blog.danlew.net/content/images/2015/10/edittexts-layout.png)

这两个EditText的高度和垂直对齐都不一样！这是由v21和v22之间EditText的背景变更而引起的差异。

如果你的EditText使用了垂直对齐的方式来和其他控件对齐，那么这个背景变更将会引起一些令人不快的后果，就像Trello的这个例子一样：
![](http://blog.danlew.net/content/images/2015/10/checkitem.png)

正常来说，文本应该和图标对齐，但很显然它并没有。这个是在Android 5.0上面的截图，而在其他版本的Android上看起来还是很完美的。

即使你使用的是AppCompat，这个问题也会突然出现。在v21+上，AppCompat遵循的是系统的material风格，这恰恰是产生这个问题的原因。

#解决办法
我想出来的处理API 21这个问题的两种方法都是通过特定方式来使用resource qualifiers。

一种是在API 21上引入你自己的EditText背景资源。除非你的App遍布了垂直对齐的EditText，不值得花费这么多的时间，因为单独为一个API版本去精确适配EditText的背景是非常棘手的。

另一种取巧但更容易的方法是为该API版本上定义不同的margin和padding。 例如，我发现它们相隔距离为6dp，那么只需在其资源文件的尾部分别加上以下内容：  

	<!-- values/dimens.xml -->  
	<dimen name="edit_text_spacing">6dp</dimen>
	<!-- values-v21/dimens.xml --> 
	<dimen name="edit_text_spacing">0dp</dimen>
	<!-- values-v22/dimens.xml -->  
	<dimen name="edit_text_spacing">6dp</dimen>  
	
首先我得承认这样做很不优雅，但是只需一点点更改就能解决这个问题，还不算太差吧。












