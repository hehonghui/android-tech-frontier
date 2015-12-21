Support Libraries v22.1.0
---

> * 原文链接 : [Support Libraries v22.1.0](https://chris.banes.me/2015/04/22/support-libraries-v22-1-0/)
* 原文作者 : [Chris Banes](https://chris.banes.me/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成



#Support Libraries v22.1.0
22 Apr 2015

好久不见了啊大家～ 你可能听说了我们已经发布 22.1.0 support libraries 的这个消息，
这可能是目前为止我们对 support library 改动最大的一次更新。 

在我们开讲前，建议先读一下  Ian Lake 的这篇官方 [blog][official-blog]，里面列出了
这次更新中所有的新特性。

这篇文章我将重点讲解内部运行的方式和原因，尤其是我完成的部分
(因为我非常清楚了解这些)。

---

## AppCompat

先从 AppCompat 说起吧，我们在这个版本中对它做了很大的更新。首先，它的重构...

---


###Refactoring

在之前的版本中进入 AppCompat 唯一的入口 ActionBarActivity 已经被我们抛弃了。
也就是说你以后只能使用一组 Activity 视图层，再也不能像 PreferenceActivity 那样使用它了。

我们现在提取出了所有内部内容，并将它们暴露给一个单一委托 API ，
[AppCompatDelegate][AppCompatDelegate] 。AppCompatDelegate 可以从
任何提供了 [Window.Callback][Window.Callback] 接口的 Android 对象中构造，
例如 Activity 或 Dialog 的子类。你可以使用它的静态方法
 [create](https://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html#create(android.app.Activity, android.support.v7.app.AppCompatCallback)) 创建它。

如果你创建了一个委托，你需要在每次调用它提供的接口时回调到它。
(例如 `onCreate()`)，不过这很简单，可以提取到一个基类中。

最终，你可以给所有 Activity 的子类附加任何你想要的 AppCompat 的功能。

如果你打算使用 AppCompatDelegate ，我强烈建议你有空看一眼 AppCompatActivity 
的源码。这是一个(极端的)例子介绍了怎样整合 AppCompatDelegate。

大部分人不需要这层自定义，可以像原来那样使用 ActionBarActivity 
那样使用 [AppCompatActivity][AppCompatActivity] 这个类就好。

---

###Dialogs

上面刚刚提到了 Dialog ，你应该也想到了我们还加入了什么。在完成重构工作后，
Dialog 很自然就是我们下一步工作对象。实际上从 decor-setup 角度来看，
 Activity 和 Dialog 这里有一些小的不同。
 
 这意味着我们终于解决了自 v21 以来 AppCompat 最大的需求：
 material styled dialogs  (balalalala~)。

我们现在有了新的 [AppCompatDialog][AppCompatDialog] 类，
你应该在在引用(or 关联) `Theme.AppCompat.Dialog` 时使用它。

最后，AppCompat 现在也有了它自己的 AlertDialog 实现，来方便构建
material 样式的 AlertDialog。只要使用
 [android.support.v7.app.AlertDialog][AlertDialog] 就好了，它会自己处理细节部分。
 
有一点要注意，AppCompat 的 AlertDialog 没有实现框架版本所做的一切。
它只暴露了在这个 ‘material 世界’ 中有价值的部分。( (╯°□°）╯︵ ┻━┻ )

---

###android:theme

在进入这部分前，请先阅读这篇文章 [Theme vs Style][theme-vs-style]，
了解下将要讲解内容的基础。

在 AppCompat v21 里，我们提供了一个快速方便的方法设置设置 [Toolbar][toolbar]
的主题，使用 `app:theme`。

在 v22.1.0 里，我们扩充了它的功能，现在你可以给你的 layout 里的任意视图
设置主题了。只要使用 `android:theme` 这个属性就好了，可以在 
compat 和 framework 之间无缝地切换功能。

最好的一点要数它会自动继承父视图的 theme ，并且兼容所有 API v11 以上的设备。
一个例子:

```xml
<Toolbar
    android:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar">

    <!-- This TextView inherits its theme from the parent Toolbar -->
    <TextView android:text="I'm light!" />

</Toolbar>
```
对于运行 API v10 甚至更老的设备来说，你也可以使用 `android:theme` 属性，
不过它不会继承父视图 theme 。这就意味着你要么重新考虑你的布局，要么
为每一个子视图都设置上 `android:theme` 属性。(这样做效率真的很低)

如果你感兴趣的话，开启继承父类 theme 的方法在这里
 [LayoutInflater.Factory2][LayoutInflater.Factory2] 。
 
 ---
 
###Widgets

如果读过了 Ian 的文章，你可能看到了和 控件着色 (tinting widgets)相关的内容
(这里还有一些新的内容)。

很好，不过关于这点还有一个变化：我们不会再修改 该平台主题的默认
widget 样式了。也就是说如果你使用这个 widget 的  AppCompat 
实现(无论显式还是隐式的)，那么你在 v21 版本之前的设备上只能获取到
 material 样式。在实践中你应该不会看到有什么不同，
 因为我们会自动插入适当的 AppCompat 的实现。

这样我们就解决了已经使用 material 样式但是没有着色的问题。它出现在 
widget 的平台实现使用了我们的样式，并且出现在不同的位置之中时，比如
 Preferences 。

反之，你将会看到当前平台默认的样式 (Holo，etc)。
虽然这样看起来可能有点奇怪，不过这可比看一个空白未着色的 drawable 好多了。

---

###Theme window features
现在 AppCompat 预测 窗口主题 flag 时会更严格 ，配合框架更密切。

背后的原因是为我们早些时候提到的 dialogs 提供支持。它们大量使用了
AppCompat 之前并没有重视的 `windowNoTitle ` 标志。

升级到 v22.1.0 以后，你可能已经遇到过下面的异常：

	IllegalArgumentException: AppCompat does not support the current theme features
我在这里回答了解决办法：
[http://stackoverflow.com/q/29790070/474997][stackoverflow]

---


## v4
support libraries 的老祖宗 support-v4 还在继续增长，添加了一些新内容。

### ColorUtils
[ColorUtils][ColorUtils] 已经从 Palette 中移入到 support-v4里。
它包含了一些非常好的操作颜色的方法。比如，你可以计算在某个背景中，
最小的文本颜色 alpha 值：

```java
int backgroundColor = ...;
int textColor = Color.WHITE;
float minContrastRatio = 4.5f; // We want a minimum contrast ration of 1:4.5

int minAlpha = ColorUtils.calculateMinimumAlpha(
        textColor, backgroundColor, minContrastRatio);

if (minAlpha != -1) {
    // There is an alpha value which has enough contrast, use it!
    return ColorUtils.setAlphaComponent(textColor, minAlpha);
}
```
还有很多方便的方法，比如颜色合成，计算亮度工具等等。更多信息可以
去看文档。

---


### Drawable 着色
Lollipop 中加入的 Drawable 着色的方法非常好用，可以让你动态的处理着色资源。
在 v21 support library 中 AppCompat 有它自己的实现，现在我们将它移入到
support-v4 的 [DrawableCompat][DrawableCompat] 之中让大家都可以使用它。
知道它的工作方式很重要。

```java
Drawable drawable = ...;

// Wrap the drawable so that future tinting calls work
// on pre-v21 devices. Always use the returned drawable.
drawable = DrawableCompat.wrap(drawable);

// We can now set a tint
DrawableCompat.setTint(drawable, Color.RED);
// ...or a tint list
DrawableCompat.setTintList(drawable, myColorStateList);
// ...and a different tint mode
DrawableCompat.setTintMode(drawable, PorterDuff.Mode.SRC_OVER);
```
需要注意下在调用完 [DrawableCompat.wrap()][DrawableCompat.wrap] 之后，
它的返回值和你赋值给它的那个并不是同一个东西。你应该使用
[DrawableCompat.unwrap( )][DrawableCompat.unwrap] 取出原始 Drawable。

在内部，我们将你的 Drawable 包裹在一个特殊的  ‘tint drawable’ (着色 drawable)
之中，它会根据指定的色彩自动更新 Drawable 的滤色器。 允许我们处理
[ColorStateList][ColorStateList] 实例。

---

##Palette
Palette 在这次发布中也获得了一些更新。首先，我们给它加入了新的 
[Builder][Palette.Builder] 类来帮助获取 Palette 实例。我们发现
Palette 与日俱增的  ‘把手’ 和 设置 正在将它的 API 变得复杂难懂。
使用 Builders 可以显著缓解这个问题。

更加重要的是第二个改变，我们在很大程度上提升了 Palettes 的生成速度。
在生成 Palette 过程中最耗时的要数 色彩量化这一步，它会读取一张图片中的
所有像素点，并降低颜色深度到一个很小的色彩数 (通常是 16)。

在这次更新中，我们使用了传统的方式优化色彩量化的性能，比如更少的对象分配，
更合适的数据结构还有降低算法复杂度。成果很显著～

下面是一些测试数据，在一个使用 ART 的设备上性能大概提升 5 到 6 倍，
如果是使用 Dalvik 的设备，效果还会更加明显。

 Device          | 22.0		 | 22.1.0  	| Speedup
 ----------|--------| ------|------
Nexus 6		| 55ms 	| 8ms    	 |~6x
Nexus 5 		| 55ms 	| 11ms	 |~5x
Nexus One	| 1200ms	| 120ms 	 |~10x

> 测试结果并不是很科学，只是给出一个近似的值，不过你懂这个意思的啦。

Cover photo:[Scaffolding][cover] by Brett Weinstein

---

[official-blog]:http://android-developers.blogspot.com/2015/04/android-support-library-221.html
[AppCompatDelegate]:https://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html
[Window.Callback]:https://developer.android.com/reference/android/view/Window.Callback.html
[AppCompatDialog]:https://developer.android.com/reference/android/support/v7/app/AppCompatDialog.html
[AlertDialog]:https://developer.android.com/reference/android/support/v7/app/AlertDialog.html
[theme-vs-style]:https://chris.banes.me/2014/11/12/theme-vs-style/
[toolbar]:https://developer.android.com/reference/android/support/v7/widget/Toolbar.html
[LayoutInflater.Factory2]:https://developer.android.com/reference/android/view/LayoutInflater.Factory2.html
[stackoverflow]:http://stackoverflow.com/q/29790070/474997
[ColorUtils]:https://developer.android.com/reference/android/support/v4/graphics/ColorUtils.html
[DrawableCompat]:https://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html
[DrawableCompat.wrap]:https://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html#wrap(android.graphics.drawable.Drawable)
[DrawableCompat.unwrap]:https://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html#unwrap(android.graphics.drawable.Drawable)
[ColorStateList]:https://developer.android.com/reference/android/content/res/ColorStateList.html
[cover]:https://flic.kr/p/GbAqX
[Palette.Builder]:http://developer.android.com/reference/android/support/v7/graphics/Palette.Builder.html
[AppCompatActivity]:https://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html