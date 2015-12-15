中文标题
---

> * 原文链接 : [Vectors For All (almost)](https://blog.stylingandroid.com/vectors-for-all-almost/?utm_source=Android+Weekly&utm_campaign=0903213dbd-Android_Weekly_175&utm_medium=email&utm_term=0_4eb677ad19-0903213dbd-337955857)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF)
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成

Regular readers of Styling Android will know of my love of
*VectorDrawable* and *AnimatedVectorDrawable*. While (at the time of
writing) we’re still waiting for *VectorDrawableCompat* so we can only
use them on API 21 (Lollipop) and later. However, the release of Android
Studio 1.4 has just added some backwards compatibility to the build
tools so we can actually begin to use *VectorDrawable* for pre-Lollipop.
In this article we’ll take a look at how this works.  

[Styling Android](https://blog.stylingandroid.com/)的读者们将会了解到我对*VectorDrawable*和*AnimatedVectorDrawable*的喜爱。然而在我写这篇文章的时候,我们仍然在等待*VectorDrawableCompat*来支持老版本的系统,所以目前只能在API 21(Lollipop)及之后的系统上使用.不过Android Studio 1.4版本已经为编译工具加入了一些向后兼容的能力,使得我们可以开始在Lollipop之前的系统上使用*VectorDrawable*。

Before we begin let’s have a quick recap of what *VectorDrawable* is.
Essentially it is an Android wrapper around SVG path data. SVG paths are
a way of specifying complex graphical elements in a declarative way.
They are particularly suited to line drawings and vector graphics, and
unsuitable for photographic images. Traditionally in Android we have
*ShapeDrawable* where we can do [some basic
stuff](/more-vector-drawables-part-2/) but often we have to convert
vector and line graphics in to bitmaps at various pixel densities in
order to use them.  

在我们开始之前,让我们先来简单了解一下什么是*VectorDrawable*。本质上来说就是对SVG path数据在Android上的封装。SVG path是通过声明来描述复杂图形元素的方式。SVG path适合于线条的绘制和矢量图形,不适合摄影图像。之前在Android上我们可以使用*ShapeDrawable*做一些[基本的东西](https://blog.stylingandroid.com/more-vector-drawables-part-2/),但是我们经常需要将矢量图和线条转换成位图来在各种各样的像素密度上使用他们。

Android Studio 1.4 introduces the ability to import SVG graphics into
Android Studio and converts them automatically to *VectorDrawable*.
These can be icons from the [material icons
pack](https://www.google.com/design/icons/) or standalone SVG files.
Importing material icons works flawlessly and provides a large and rich
set of icons. However, importing standalone SVG files can be rather more
problematic. The reason for this is that the *VectorDrawable* format
only supports a subset of SVG and is missing features such as gradient
and pattern fills, local IRI references (the ability to give an element
a unique reference and re-use it within the SVG via that reference), and
transformations – which are all commonly used.  

Android Studio 1.4带来了导入SVG图形的能力并且可以自动将它们转为*VectorDrawable*。我们可以导入[material icons
pack](https://www.google.com/design/icons/)中的图标或者是单独的SVG文件。导入material icons pack的图标执行的非常好,并且有大量丰富的资源可以选择。然而导入单独的SVG文件相比之下就会有很多问题。原因就是*VectorDrawable*只支持SVG的一个子集,缺少了常用的gradient,pattern fills,local IRI references(赋予元素唯一的引用并且在SVG中通过这个引用来复用此元素)和transformations功能。

For example, even a relatively simple image such as the official [SVG
logo](http://www.w3.org/2009/08/svg-logos.html) (below) fails to import
because it uses local IRI references:  
举个例子,导入官方的[SVG logo](http://www.w3.org/2009/08/svg-logos.html)这种相对简单的图片(如下图)都会失败,因为缺少了对local IRI references的支持。

[![svg\_logo](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo.svg)

It’s currently unclear whether these omissions are for performance
reasons (for example, gradients can be complex to render) or are future
developments.  
现在还不清楚这些遗漏的功能是因为出于对性能问题的考虑(比如gradients的渲染就很复杂)还是在开发中。

With an understanding the SVG format (which is beyond the scope of this
article) it is possible to manually tweak the logo to remove the local
IRI references and this is identical to the one above:  
通过对SVG格式的了解(超出了这篇文章的范围),我们可以手动调整上面的图片,移除local IRI references.调整过的下图是和上面SVG logo效果是相同的。

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.svg)

This still does not import and the error message of “premature end of
file” gives little clue where the problem lies. Thanks to a suggestion
from [Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski) I
changed the width and height from percentage values to absolute values
and the import now worked. However because translations are not
supported all of the elements were positioned badly:  
但这仍然不能导入到Android Studio中,提示的错误信息是“premature end of file”.感谢[Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski)的建议,我将宽高从百分比修改为了绝对数值之后可以导入了。然而因为translations也是不支持的,所以所有的元素都不能正确的布局(如下图):

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2-300x300.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.png)

By manually applying the all of the translation and rotation
transformations from the original file (by wrapping `` elements in ``
elements which support transformations) I was able to actually get the
official SVG logo to import and render correctly as a *VectorDrawable*
on Marshmallow:  
通过手动调整源文件中所有的translation和rotation transformations(使用支持transformations的`` elements in ``元素包装),我终于可以把官方的SVG logo导入了并且在Marshmallow(Android 6.0)上能被*VectorDrawable*正确的渲染:

[![SVGLogo](https://blog.stylingandroid.com/wp-content/uploads/2015/10/SVGLogo-300x225.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/SVGLogo.png)

There is a [conversion tool](http://inloop.github.io/svg2android/) by
Juraj Novák which will convert SVG directly to *VectorDrawable*. It has
many of the same restrictions of not handling gradients and local IRI
references, but does a much better job of converting my hand-tweaked
SVG. It was not thrown by having percentage width and height values, and
it has an experimental mode to apply transformations which worked well
in this case. But the need to manually convert the local IRI references
still required hand-tweaking of the raw SVG files.  
有一个Juraj Novák制作的[方便的工具](http://inloop.github.io/svg2android/)可以将SVG直接转换成*VectorDrawable*.但它也有着很多和导入一样的限制,不能处理gradients和local IRI references,但是在转换我手动调整过的SVG上表现的还是更好.工具没有因为使用百分比的宽高值而处理失败,而且还有一个实验模式来应用transformations并且工作正常.但是仍然需要手动调整原始SVG文件的local IRI references.

By dropping this in our `res/drawable` folder we can now reference it as
any drawable:
把处理后的图片放到`res/drawable`文件夹下,我们就可以把它当做drawable引用了.

    res/layout/activity\_main.xml

    <?xml version="1.0" encoding="utf-8"?> 
    <RelativeLayout
		xmlns:android="http://schemas.android.com/apk/res/android"
		xmlns:tools="http://schemas.android.com/tools"
		android:layout_width="match_parent"
		android:layout_height="match_parent"
		android:paddingBottom="@dimen/activity_vertical_margin"
		android:paddingLeft="@dimen/activity_horizontal_margin"
		android:paddingRight="@dimen/activity_horizontal_margin"
		android:paddingTop="@dimen/activity_vertical_margin"
		tools:context=".MainActivity"> 

    	<ImageView
			android:layout_width="wrap_content"
			android:layout_height="wrap_content"
			android:contentDescription="@null" 
			android:src="@drawable/svg_logo2"
		/> 
    </RelativeLayout>

Provided that we are using gradle plugin 1.4.0 or later (at the time of
writing this isn’t released but `1.4.0-beta6` does the trick) this will
now work back to API 1!  
假设我们正在使用gradle plugin 1.4.0 或者更新的版本(写文章时1.4.0还没有发布,不过`1.4.0-beta6`同样可以),使得*VectorDrawable*兼容到了API 1!

So what’s happening? If we take a look in the generated code in the
build folder it becomes obvious:  
所以究竟发生了什么呢?我们看一下build文件夹下生成的代码就很清楚了:

[![Screen Shot 2015-10-03 at 15.20.33](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.20.33.png)

For API 21 and later the XML vector drawable that we imported is used,
but for earlier devices a PNG of the vector drawable is used instead.  
在API 21及之后的版本会使用我们导入的XML vector drawable,而之前的版本会使用PNG格式图片代替.

But what if we decide that we don’t need all of these densities and are
concerned about the increased size of our APK as a result of this? We
can actually control which densities will be generated using the
`generatedDensities` property of the build flavor:  
但如果我们不需要生成全部的分辨率而更关注这导致的APK增加的大小呢?我们可以通过build flavor的`generatedDensities`属性来控制需要生成的分辨率。

	app/build.gradle

	apply plugin: 'com.android.application'
    android {
		compileSdkVersion 23
		buildToolsVersion "23.0.1"
        defaultConfig {
        	applicationId "com.stylingandroid.vectors4all"
       		minSdkVersion 7 targetSdkVersion 23
      		versionCode 1
     		versionName "1.0"
    		generatedDensities = ['mdpi', 'hdpi']
   		}
		buildTypes {
        	release {
       			minifyEnabled false
      			proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
     		}
    	}
	}
	dependencies {
    	compile fileTree(dir: 'libs', include: ['\*.jar'])
		testCompile 'junit:junit:4.12' compile
		'com.android.support:appcompat-v7:23.0.1'
    }

If we now build (remember to clean first to remove the resources that
were generated by previous builds) we can see this only creates the
densities we’ve specified:  
如果我们现在build一下（记得先clean来清除之前生成的资源），就会发现只生成了我们指定分辨率的资源：

[![Screen Shot 2015-10-03 at 15.27.08](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.27.08.png)

So, let’s now actually take a look at what is produced in the png
representation:  
那么，现在让我们来看看实际生成的png:

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2-300x300.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.png)

This is essentially the same as how the imported SVG was rendered before
I manually added the missing transformations. I should mention that
there **is** a lint warning which indicates that `` elements are not
supported for raster image generation, but that does not detract from
the fact that *VectorDrawable* is an Android-specific format so not
fully supporting it seems baffling.  
这和我手动添加缺少的transformations之前导入的SVG渲染出的一样。我之前应该提到lint有一个警告指出 元素是不支持光栅化的，但是这没有背离*VectorDrawable*是一个Android的特定格式，所以没有完整的支持是让人不爽的。

We now beginning to understand why transformations are not supported by
the import tool – because transformations on *VectorDrawable* ``
elements is not supported when converting *VectorDrawable* to a raster
image for backwards compatibility. This would appear to be a major
omission: Totally valid *VectorDrawable* assets which render perfectly
under Lollipop and later do not actually render correctly when converted
to PNG.  
现在我们开始理解为什么transformations不被导入工具支持了，因为transformations在*VectorDrawable*被转换成光栅化图片以向后兼容时是不支持的。这应该是一个主要的遗漏：在Lollipop以及之后的系统上是可以完美渲染的有效的*VectorDrawable*资源转换成PNG图片就不正确了。

To, to summarise: If you use these new tools to import assets from the
material icons library they work flawlessly. However, it seems
misleading to even claim that the import tool is actually capable of
importing SVG when it only supports a very limited subset, and will not
correctly import most real-world SVG files. Moreover the lack of support
even for the full *VectorDrawable* specification in the VectorDrawable
-\> raster image conversion makes the implementation feel unfinished and
not really ready for general use.  
总结下：如果你使用这些新工具从material icons library中导入资源，那么一切都很完美。然而，声称导入工具可以导入SVG文件则是一种误导，因为它支持非常有限的SVG的子集，并且无法正确导入大部分实际真正使用的SVG文件。此外，缺少对*VectorDrawable*转换为光栅化视图的完整支持让人感觉这项功能没有真正完成，没有准备好投入使用。

For the level of manual tweaking that I was required to do to even get
the official SVG logo to even be converted to a *VectorDrawable* by the
import tool it would not have required much more work to manually
convert it to a *VectorDrawable* and completely bypass the import tool
altogether. Although I would still be required to manually apply my
transformations to all of the coordinates within the SVG pathData
elements in order to manually apply the necessary transformations.  
使用导入工具配合手动调整将官方的SVG logo转成*VectorDrawable*并没有比我纯手动调整需要更多工作。尽管我仍然需要自己调整SVG pathData中的所有transformations的坐标，来实现必要的transformations。

Let’s hope that some of these issues are addressed soon so that these
new potentially very useful new tools begin to fulfil some of their
promise.  
希望这些问题中的一些会被尽快解决，这样这些新的潜在的实用工具就可以开始实现他们的用处了。

The source code for this article is available  
此文的源码
[here](https://github.com/StylingAndroid/Vectors4All/tree/master).