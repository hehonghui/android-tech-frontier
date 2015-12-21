Android Support库 22.1 
---

> * 原文链接 : [Android Support Library 22.1](http://android-developers.blogspot.com/2015/04/android-support-library-221.html)
* 原文作者 : [Ian Lake](https://plus.google.com/+IanLake)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Rocko](https://github.com/zhengxiaopeng) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  校对完成


你可能听过这么一句话 “最好的代码就是没有代码。” 然而我想对你说的是：你写下的每一行代码应该能为应用增加独特的价值，而不是为应用添加一行又一行繁复、无趣的模板代码。Android提供支持库的初衷正是如此：让 Android 开发工程师把精力更多地放在逻辑实现上，而不是写业务代码。

最新发布的Android支持库一如既往地添加了许多实用的组件，并对Support V4、AppCompat、Leanback、RecyclerView、Palette和Renderscript库的内部实现逻辑作出改变。从新的 [AppCompatActivity](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)和[AppCompatDialog](http://developer.android.com/reference/android/support/v7/app/AppCompatDialog.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog) 到Android TV全新的引导流程我们可以发现，新的库确实带来许多让我们耳目一新的惊喜。


## Support V4
Support V4 库作为众多 Android 支持库的基础，包含许多向下兼容的类，大大简化了向下兼容的具体实现。

[DrawableCompat](http://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)现在使drawable着色绘制向下兼容到了API 4：现在只需要通过[DrawableCompat.wrap(Drawable)](http://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#wrap(android.graphics.drawable.Drawable))简单封装你的Drawable，然后[setTint()](http://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#setTint(android.graphics.drawable.Drawable,%20int))、[setTintList()](http://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#setTintList(android.graphics.drawable.Drawable,%20android.content.res.ColorStateList))、[setTintMode()](http://developer.android.com/reference/android/support/v4/graphics/drawable/DrawableCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#setTintMode(android.graphics.drawable.Drawable,%20android.graphics.PorterDuff.Mode))就能完成着色绘制：完全不需要为了支持多种颜色而去创建和维护几个不同的 Drawable 文件！

此外，我们正在通过 [ColorUtils](http://developer.android.com/reference/android/support/v4/graphics/ColorUtils.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog) 类做一些适用于所有使用场景的 [Palette](https://developer.android.com/reference/android/support/v7/graphics/Palette.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog) 内部构件，ColorUtils 可以很容易地计算出颜色之间的对比度，确定维持最小对比度的最小透明度值（完美地保证文字的阅读体验），或者将颜色转换为对应的 HSL 值（译者注：Hue[hju]色调，Saturation['sætʃə'reʃən]饱和度，Luminance['lumɪnəns]亮度）。

插值器是所有动画系统的重要组成部分，它负责控制一个动画中某项数值改变的比率（例如加速、减速等）。Lollipop 中的[android.R.interpolator](http://developer.android.com/reference/android/R.interpolator.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)已经内置了许多插值器，例如用于[建立真实感的动效](http://www.google.com/design/spec/animation/authentic-motion.html)的fast_out_linear_in、fast_out_slow_in、and linear_out_slow_in。但现在我们可以用代码调用 [FastOutLinearInInterpolator](http://developer.android.com/reference/android/support/v4/view/animation/FastOutLinearInInterpolator.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)、[FastOutSlowInInterpolator](http://developer.android.com/reference/android/support/v4/view/animation/FastOutSlowInInterpolator.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)、[LinearOutSlowInInterpolator](http://developer.android.com/reference/android/support/v4/view/animation/LinearOutSlowInInterpolator.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog) 类为动画添加这些插值器。除了那些预建的插值器，我们还创建了允许你创建二次方或三次方贝塞尔曲线的 [PathInterpolatorCompat](http://developer.android.com/reference/android/support/v4/view/animation/PathInterpolatorCompat.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog) 类。

这个版本的支持库还把[Space](http://developer.android.com/reference/android/support/v4/widget/Space.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)控件从GridLayout库移动到了Support V4，使其不需要在项目中添加单独的依赖。Space控件是一种轻量的、无形的控件，可用于创建控件间的间隙效果。


## AppCompat
AppCompat支持库开始地很低调，却是一个很重要的开端：为API 7及以上的设备提供了一个一致的Action Bar。
在[版本21的修订中](http://android-developers.blogspot.com/2014/10/appcompat-v21-material-design-for-pre.html)，它承担了新的职责：带来了[material color palette](http://developer.android.com/training/material/theme.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#ColorPalette)、控件着色、Toolbar支持，还有更多支持所有API 7+的设备。单从ActionBarActivity名字上看是体现不出它全部功能的。

在此版本中，ActionBarActivity已经过时了，新的替代者是[AppCompatActivity](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)。然而，这不只是一个重命名。事实上，AppCompat的内在逻辑现在可以通过[AppCompatDelegate](http://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)实现-这是一个可以在所有Activity中包含的类，与合适的生命周期方法挂钩，并得到一致的主题、着色等，而不需要使用AppCompatActivity （尽管这仍然是最简单的开始方式）。

在全新AppCompatDelegate类的帮助下，我们继续增加了一致性体验的支持，通过[AppCompatDialog](http://developer.android.com/reference/android/support/v7/app/AppCompatDialog.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)类增加了材料设计规范对话框的支持。如果你之前使用过[AlertDialog ](http://developer.android.com/guide/topics/ui/dialogs.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#AlertDialog)，你会很高心，因为现在支持库中也有其对应的版本：[support.v7.app.AlertDialog](http://developer.android.com/reference/android/support/v7/app/AlertDialog.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)，让你用相同的API享受 AppCompatDialog 带来的便利。

在使用AppCompat时，自动为控件着色的能力是在你的应用程序中保持品牌烙印和一致性体验中的重要保证。因为在填充布局时AppCompat会自动地为你将诸如Button、TextView 这些传统控件替换为AppCompatButton、AppCompatTextView 等新控件，以确保布局内的每一个控件都能支持着色。而在新的支持库中，色彩感知控件现在已经被公开，让控件类对自动着色的支持能延续到子类中。

这个列表囊括了目前所有的色彩感知控件：
> - AppCompatAutoCompleteTextView
> - AppCompatButton
> - AppCompatCheckBox
> - AppCompatCheckedTextView
> - AppCompatEditText
> - AppCompatMultiAutoCompleteTextView
> - AppCompatRadioButton
> - AppCompatRatingBar
> - AppCompatSpinner
> - AppCompatTextView

Lollipop增加了在一个view中通过view级别上的XML属性android:theme实现重写主题的能力-非常有用的特性，如在亮色activities上的黑色action bars。现在，AppCompat允许你为Toolbars使用android:theme（不赞成使用之前的app:theme）,更好地带来为API 11+的所有views的android:theme支持。

如果你刚开始接触AppCompat，那么看看下面的视频，可以察觉出是多么容易上手，这就能为你所有的用户带来了一致性的设计：

[![Android Support Library: Consistent Design with AppCompat](http://img.youtube.com/vi/5Be2mJzP-Uw/0.jpg)](https://youtu.be/5Be2mJzP-Uw)


## Leanback
Leanback库作为Android电视应用程序的最佳实践的集合，我们曾忽略去不使一个更美好的10的经验作为发行版的一部分。你会注意到加载后立即更新Leanback例子新功能的引导步骤。
![](http://4.bp.blogspot.com/-I4Bjzlx8AzI/VS1fgphZnYI/AAAAAAAABhs/L5SfjRk_k40/s640/image00.png)

这组类和主题可以用来构建一个多步骤的过程，这在Android TV上看起来很棒。它是由一个左边上的指导视图和右边的列表操作建立了起来。每一个都是可定制的，通过一些主题与Theme.Leanback.GuidedStep 的父类或其它，如果需要更多的定制，通过自定义一个[GuidanceStylist](http://developer.android.com/reference/android/support/v17/leanback/widget/GuidanceStylist.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)和[GuidedActionsStylist。](http://developer.android.com/reference/android/support/v17/leanback/widget/GuidedActionsStylist.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)。

你还会发现大量的bug修复，性能改进，以及使它更完美贯穿在库中-所有与制作Leanback的经验，更多就是为用户和开发人员所喜欢。


## RecyclerView
除了一系列正确的bug修复，此版本增加了一个新的[SortedList](http://developer.android.com/reference/android/support/v7/util/SortedList.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)数据结构。此集合可以很容易地保持自定义对象的排序列表，通过[RecyclerView.Adapter](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.Adapter.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)正确地分发数据改变的事件：维护item的 添加/删除/移动/改变 时RecyclerView提供的动画。

此外，SortedList还支持成批地一起改变，调度只是适配器上一个单一的集操作，确保大量items改变时的最佳的用户体验。


## Palette
如果你已经使用Palette从图像中提取出颜色，你会很高兴地知道，现在在不会丢失品质下速度是之前的6~8倍！

Palette现在使用建造者模式来实例化。不是直接调用Palette.generate(Bitmap)或者其它相似的操作，你会使用[Palette.from(Bitmap)](http://developer.android.com/reference/android/support/v7/graphics/Palette.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog#from(android.graphics.Bitmap))来取回一个[Palette.Builder](http://developer.android.com/reference/android/support/v7/graphics/Palette.Builder.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)实例。然后，在调用generate()或者generateAsync()检索颜色的色板之前，您可以随意更改的最大颜色数来生成并设置图像的最大尺寸来重新运行Palette。


## Renderscript
Renderscript给你巨大的计算潜力，此外这个支持库版本使得一些预先定义的脚本和调用脚本内部函数在API 8+的设备上变得可用。这个版本改善了所有设备的可靠性和性能，这些提升取决于本地Renderscript可用时通过一种改进的图像边缘检测算法实现-确保最快和最可靠的实现总是我们的选择。两个额外的内部函数也被添加在此版本中：[ScriptIntrinsicHistogram](http://developer.android.com/reference/android/support/v8/renderscript/ScriptIntrinsicHistogram.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)和[ScriptIntrinsicResize](http://developer.android.com/reference/android/support/v8/renderscript/ScriptIntrinsicResize.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)，完成采集到10。


## SDK 现在可用了！
没有比这更好的时间来开始使用Android支持库。今天你就可以使用这个库开始开发了，从Android SDK Manager下载Android支持库和Android支持资源吧。

要了解更多关于Android的支持库和它提供给你的API，请访问Android开发者官网上的[支持库章节](http://developer.android.com/tools/support-library/index.html?utm_campaign=ASL221-415&utm_source=dac&utm_medium=blog)的网页。
