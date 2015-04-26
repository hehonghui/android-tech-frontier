Support Libraries v22.1.0
---

> * 原文链接 : [Support Libraries v22.1.0](https://chris.banes.me/2015/04/22/support-libraries-v22-1-0/)
* 原文作者 : [Chris Banes](https://chris.banes.me/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成 / 校对中 / 完成



#Support Libraries v22.1.0
22 Apr 2015

It’s been a while since my last post so here we are. You may have seen that the 22.1.0 support libraries were released yesterday, which is probably the biggest non-platform release we’ve done with the support library.

Before we go any further, have a read of Ian’s official release blog post. It outlines all of the new features in this release, for all of the libraries.

In this post I will concentrate more on the how and why certain things were done, particularly on the things I worked on (since I actually know the how and why on those).


#Support Libraries v22.1.0
22 Apr 2015

好久不见了啊大家～ 你可能听说了我们已经发布 22.1.0 support libraries 的这个消息，
这可能是目前为止我们对 support library 改动最大的一次更新。 

在我们开讲前，建议先读一下  Ian Lake 的这篇官方 [blog][official-blog]，里面列出了
这次更新中所有的新特性。

这篇文章我将重点讲解内部运行的方式和原因，尤其是我完成的部分
(因为我非常清楚了解这些)。

---

##AppCompat

Lets start with AppCompat which has had a large update in this release. First, its refactoring…

## AppCompat

先从 AppCompat 说起吧，我们在这个版本中对它做了很大的更新。首先，它的重构...

---

###Refactoring
Previously the only entry point into AppCompat was through the now deprecated ActionBarActivity class. Unfortunately this forced you into using a set Activity hierarchy which made things like using PreferenceActivity impossible.

We’ve now extracted all of the internal stuff and exposed it as a single delegate API, AppCompatDelegate. AppCompatDelegate can be created by any Android object which exposes a Window.Callback, such as any Activity or Dialog subclass. You create one via its static create() methods.

There is a contract to maintain when you create a delegate. You must callback to it at every call it exposes (for instance onCreate()), but it’s really simple and can be extracted into a base class.

The end result is that you can attach all of AppCompat’s functionality to any Activity sub-class, as long as you call it as it wants.

If you plan on playing with AppCompatDelegate, I urge you to have a look at the AppCompatActivity source when you get a chance. It’s an (extreme) example of how to integrate AppCompatDelegate.

Most people though won’t need this level of customization though and can just use AppCompatActivity (as you used to use ActionBarActivity).


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
I just mentioned Dialogs in the refactoring step which should give you an idea of what else we’ve added. After completing the refactoring work, Dialogs were a natural next step. There is actually very little difference between an Activity and Dialog from a decor-setup point of view.

This means that we can finally close one of the biggest requests for AppCompat since v21: material styled dialogs.

We now have the new AppCompatDialog class which you should now use any time you use reference Theme.AppCompat.Dialog (or related).

To cap this section off, AppCompat now also has its own AlertDialog implementation for material styled AlertDialog everywhere. To use it, just change your usage to android.support.v7.app.AlertDialog. It handles the rest.

One thing to note is that AppCompat’s AlertDialog does not implement everything that the framework version does. It only exposes things which are valuable in this ‘material world’ (groan).

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
Before we go into this section, make sure you have read my Theme vs Style post. It explains the basis of what we’re about to talk about.

In AppCompat v21, we exposed a quick-hack-get-it-out way for you to be able to set a theme on a Toolbar using app:theme.

In 22.1.0 we now have expanded that functionality so that you can set a theme on any view in your layouts. We have also moved to using android:theme which allows seamless handover between the compat and framework functionality.

The best bit though, is that the automatic theme inheritance from a view’s parent also works on all devices running API v11 and above. Here’s a quick example:

<Toolbar
    android:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar">

    <!-- This TextView inherits its theme from the parent Toolbar -->
    <TextView android:text="I'm light!" />

</Toolbar>
For devices running API v10 and older, you can still use android:theme but the parent theme inheritance will not work. This means that you should either rethink your layouts, or set android:theme on all of the children (this is really inefficient though).

For those that are interested, the thing that enables the parent theme inheritance is LayoutInflater.Factory2.

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

If you read Ian’s post then you’ll have seen that the tinting widgets have now been exposed publicly (there’s even a few new ones).

That’s great, but there’s another change that happened related to this: we no longer change the platform theme’s default widget styles. What this means is that you will only get the material styling on a pre-v21 device, if you’re using the AppCompat implementation of that widget (either implicitly or explicitly). In practice you should not see a difference since we insert AppCompat’s implementation in-place automatically.

This allows us to fix an issue where our material styles were being used, but not tinted. This happened when the platform implementation of the widget was used with our style, and showed up in various places such as Preferences.

Instead, you will now see the default platform style (Holo, etc). This may look a little bit weird but it’s better than a black un-tinted drawable you can’t actually see.

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
AppCompat is now more strict on what it expects in theme window flags, more closely matching what you would get from the framework.

The main reason behind this is to support dialogs which we mentioned earlier. They make heavy use of the windowNoTitle flag, which AppCompat previously did not pay much attention to.

You might be seeing the following exception once you have updated to v22.1.0:

	IllegalArgumentException: AppCompat does not support the current theme features
	
Have a look at my StackOverflow answer on how to fix your theme: 
http://stackoverflow.com/q/29790070/474997


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
The grandfather of the support libraries, support-v4 continues to grow and have new stuff added.

### ColorUtils
ColorUtils has been moved out of Palette and into support-v4 as a public class. It contains some really nice stuff in there for working with colors. For instance, you can calculate the minimum color alpha for text over a background color:

int backgroundColor = ...;
int textColor = Color.WHITE;
float minContrastRatio = 4.5f; // We want a minimum contrast ration of 1:4.5

int minAlpha = ColorUtils.calculateMinimumAlpha(
        textColor, backgroundColor, minContrastRatio);

if (minAlpha != -1) {
    // There is an alpha value which has enough contrast, use it!
    return ColorUtils.setAlphaComponent(textColor, minAlpha);
}
There’s other goodies in the class to, like colour composition and luminance calculation utilities. Have a look in the javadoc for more info.


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

### Drawable tinting
The Drawable tinting methods added in Lollipop are super useful for letting you dynamically tint assets. AppCompat had its own baked in implementation in the v21 support library and we’ve now extracted that into DrawableCompat in support-v4 for everyone to use. It’s important to know how it works though.

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

The thing to remember is that after you call DrawableCompat.wrap(), you can not rely on the result being the same type as what you give it. Instead you should use DrawableCompat.unwrap() to retrieve the original Drawable.

Internally, we now wrap your Drawable in a special ‘tint drawable’ will automatically update your Drawable’s color filter from the specified tint. This allows us to handle ColorStateList instances.


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

## Palette
Palette has also recieved a bit of love in this release. The first thing is that we’ve added a new Builder class to help with instantiation. We found that we were adding more and more ‘knobs’ and settings to Palette which was making the API convoluted. Builders are a nice way to make this less painful as an API.

The second (and more important) change is the large performance increase in generating Palettes. The most costly piece of work in Palette is the colour quantization step. This take all of the pixels in a image and reduces the colour depth down to a small number of colours (usually 16).

In this release, we went back to some old-style optimizations for the colour quantization. Things like less object allocations, more appropriate data structures and a reduction in algorithmic complexity. These have resulted in a massive increase in speed.

Here are some quick tests I did. As you can see the speed-up is roughly 5-6x on a device using ART, but on a Dalvik device the increase is greater.


 Device          | 22.0		 | 22.1.0  	| Speedup
 ----------|--------| ------|------
Nexus 6		| 55ms 	| 8ms    	 |~6x
Nexus 5 		| 55ms 	| 11ms	 |~5x
Nexus One	| 1200ms	| 120ms 	 |~10x

The results are not scientific and only give a rough indication, but you get the idea.

Cover photo:[Scaffolding][cover] by Brett Weinstein

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