近乎通用的VectorDrawable
---

> * 原文链接 : [Vectors For All (almost)](https://blog.stylingandroid.com/vectors-for-all-almost/?utm_source=Android+Weekly&utm_campaign=0903213dbd-Android_Weekly_175&utm_medium=email&utm_term=0_4eb677ad19-0903213dbd-337955857)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF)
* 校对者: [desmond1121](https://github.com/desmond1121)
* 状态 :  完成

[Styling Android](https://blog.stylingandroid.com/)的读者们将会了解到我对`VectorDrawable`和`AnimatedVectorDrawable`的喜爱。在我写这篇文章的时候，我们仍然在等待`VectorDrawableCompat`来支持老版本的系统，所以目前只能在API 21(Lollipop)及之后的系统上使用它们。不过Android Studio 1.4版本已经为编译工具加入了一些向下兼容的能力，使得我们可以开始在Lollipop之前的系统上使用`VectorDrawable`。在这篇文章中，让我们看看这是如何实现的。
 
在我们开始之前，让我们先来简单了解一下什么是`VectorDrawable`。本质上来说就是对SVG的path元素在Android上的封装。path元素是通过声明来描述复杂图形元素的方式。path元素适合于线条的绘制和矢量图形，不适合照片。之前在Android上我们可以使用`ShapeDrawable`做一些[基础的东西](https://blog.stylingandroid.com/more-vector-drawables-part-2/)，但是我们经常需要将矢量图和线条转换成位图以适应多样的分辨率。
 
Android Studio 1.4新加了导入SVG的功能并且可以自动将它们转为`VectorDrawable`。我们可以导入[material icons
pack](https://www.google.com/design/icons/)中的图标或者是单独的SVG文件。导入material icons pack的图标很容易，并且有丰富的资源。相比之下，导入单独的SVG文件就会有很多问题。原因就是`VectorDrawable`只支持SVG的一个子集,缺少了对常用的gradient,pattern fills,local IRI references(赋予元素唯一的引用并且在SVG中通过这个引用来复用此元素)和transformations的支持。
 
举个例子，导入官方的[SVG logo](http://www.w3.org/2009/08/svg-logos.html)这种相对简单的图片(如下图)都会失败，因为缺少了对local IRI references的支持。

![svg\_logo](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/1.png?raw=true)
  
现在还不清楚这些遗漏的功能是由于对性能问题的考虑(比如gradients的渲染就很复杂)还是在开发中。
  
通过对SVG格式的了解(超出了这篇文章的讨论范围)，我们可以手动调整上面的图片，移除local IRI references。调整过的下图和上面SVG logo效果是相同的。

![svg\_logo2](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/2.png?raw=true)
  
但这仍然不能导入到Android Studio中,提示的错误信息是“premature end of file”。感谢[Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski)的建议，我将宽高从百分比修改为绝对数值之后就可以导入了。然而因为translations也是不支持的，所以所有的元素都不能正确的布局(如下图):

![svg\_logo2](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/3.png?raw=true)
 
通过手动调整源文件中所有的translation和rotation transformations(使用支持transformations的`<group>`元素嵌套`<path>`),我终于可以把官方的SVG logo导入了并且在Marshmallow(Android 6.0)上能被`VectorDrawable`正确的渲染:

![SVGLogo](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/4.png?raw=true)
  
Juraj Novák制作了一个[方便的工具](http://inloop.github.io/svg2android/)可以将SVG直接转换成`VectorDrawable`。但它也有着很多和导入一样的限制，不能处理gradients和local IRI references，但是在转换我手动调整过的SVG上表现的更好，不但没有因为使用百分比的宽高值而处理失败，而且还提供了一个实验模式来很好的处理transformations。但是仍然需要手动调整原始SVG文件的local IRI references。

把处理后的图片放到`res/drawable`文件夹下，我们就可以把它当做drawable引用了。

    res/layout/activity_main.xml

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

假设我们正在使用gradle plugin 1.4.0 或者更新的版本(写文章时1.4.0还没有发布，不过`1.4.0-beta6`同样可以)，就可以让`VectorDrawable`兼容到API 1!
  
所以究竟发生了什么呢?我们看一下build文件夹下生成的代码就很清楚了:

![Screen Shot 2015-10-03 at 15.20.33](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/5.png?raw=true)
  
在API 21及之后的版本会使用我们导入的XML vector drawable,而之前的版本会使用PNG格式图片代替。

但如果我们不需要对应全部的分辨率，而是更加关注由此导致APK增加的大小呢?我们可以通过build flavor的`generatedDensities`属性来控制需要生成的分辨率。

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
    	compile fileTree(dir: 'libs', include: ['*.jar'])
		testCompile 'junit:junit:4.12' compile
		'com.android.support:appcompat-v7:23.0.1'
    }
  
如果我们现在build一下（记得先clean来清除之前生成的资源），就会发现只生成了我们指定分辨率的资源：

![Screen Shot 2015-10-03 at 15.27.08](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/6.png?raw=true)
 
那么，现在让我们来看看实际生成的png:

![svg\_logo2](https://github.com/DroidWorkerLYF/Translate/blob/master/vectors%20for%20all/7.png?raw=true)

这和我手动添加缺少的transformations之前导入的SVG渲染出的一样。我之前本该提到lint有一个警告指出`<group>`元素是不支持光栅化的，`VectorDrawable`是一个Android特定的格式，却没有被完整的支持，似乎令人费解。

现在我们开始理解为什么transformations不被导入工具支持了，因为为了向下兼容而将`VectorDrawable`转换成光栅化图片时`<group>`中的transformations是不支持转换的。这应该是一个关键遗漏：在Lollipop以及之后的系统上可以完美渲染的有效的`VectorDrawable`资源转换成PNG图片就不正确了。
  
总结下：如果你使用这些新工具从material icons library中导入资源，那么一切都很完美。然而，声称导入工具可以导入SVG文件则是一种误导，因为它支持非常有限的SVG的子集，并且无法正确导入大部分实际真正使用的SVG文件。此外，缺少对`VectorDrawable`转换为光栅化视图的完整支持让人感觉这项功能没有真正完成，没有准备好投入使用。

使用导入工具配合手动调整将官方的SVG logo转成`VectorDrawable`并没有比我纯手动调整需要更多工作。尽管我仍然需要自己调整SVG pathData中的所有transformations的坐标，来实现必要的transformations。

希望这些问题中的一些会被尽快解决，这样这些新的潜在的实用工具就可以开始实现他们的用处了。

此文的源码
[here](https://github.com/StylingAndroid/Vectors4All/tree/master).