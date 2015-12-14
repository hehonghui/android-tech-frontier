中文标题
---

> * 原文链接 : [Vectors For All (almost)](https://blog.stylingandroid.com/vectors-for-all-almost/?utm_source=Android+Weekly&utm_campaign=0903213dbd-Android_Weekly_175&utm_medium=email&utm_term=0_4eb677ad19-0903213dbd-337955857)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF)
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成

[Leave a
reply](http://blog.stylingandroid.com/vectors-for-all-almost/#respond)

Regular readers of Styling Android will know of my love of
*VectorDrawable* and *AnimatedVectorDrawable*. While (at the time of
writing) we’re still waiting for *VectorDrawableCompat* so we can only
use them on API 21 (Lollipop) and later. However, the release of Android
Studio 1.4 has just added some backwards compatibility to the build
tools so we can actually begin to use *VectorDrawable* for pre-Lollipop.
In this article we’ll take a look at how this works.\

Before we begin let’s have a quick recap of what *VectorDrawable* is.
Essentially it is an Android wrapper around SVG path data. SVG paths are
a way of specifying complex graphical elements in a declarative way.
They are particularly suited to line drawings and vector graphics, and
unsuitable for photographic images. Traditionally in Android we have
*ShapeDrawable* where we can do [some basic
stuff](/more-vector-drawables-part-2/) but often we have to convert
vector and line graphics in to bitmaps at various pixel densities in
order to use them.

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

For example, even a relatively simple image such as the official [SVG
logo](http://www.w3.org/2009/08/svg-logos.html) (below) fails to import
because it uses local IRI references:

[![svg\_logo](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo.svg)](http://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo.svg)

It’s currently unclear whether these omissions are for performance
reasons (for example, gradients can be complex to render) or are future
developments.

With an understanding the SVG format (which is beyond the scope of this
article) it is possible to manually tweak the logo to remove the local
IRI references and this is identical to the one above:

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.svg)](http://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.svg)

This still does not import and the error message of “premature end of
file” gives little clue where the problem lies. Thanks to a suggestion
from [Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski) I
changed the width and height from percentage values to absolute values
and the import now worked. However because translations are not
supported all of the elements were positioned badly:

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2-300x300.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.png)

By manually applying the all of the translation and rotation
transformations from the original file (by wrapping `` elements in ``
elements which support transformations) I was able to actually get the
official SVG logo to import and render correctly as a *VectorDrawable*
on Marshmallow:

[![SVGLogo](https://blog.stylingandroid.com/wp-content/uploads/2015/10/SVGLogo-300x225.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/SVGLogo.png)

There is a [conversion tool](http://inloop.github.io/svg2android/) by
Juraj Novák which will convert SVG directly to *VectorDrawable*. It has
many of the same restrictions of not handling gradients and local IRI
references, but does a much better job of converting my hand-tweaked
SVG. It was not thrown by having percentage width and height values, and
it has an experimental mode to apply transformations which worked well
in this case. But the need to manually convert the local IRI references
still required hand-tweaking of the raw SVG files.

By dropping this in our `res/drawable` folder we can now reference it as
any drawable:

res/layout/activity\_main.xml

<?xml version="1.0" encoding="utf-8"?\> <RelativeLayout
xmlns:android="http://schemas.android.com/apk/res/android"
xmlns:tools="http://schemas.android.com/tools"
android:layout\_width="match\_parent"
android:layout\_height="match\_parent"
android:paddingBottom="@dimen/activity\_vertical\_margin"
android:paddingLeft="@dimen/activity\_horizontal\_margin"
android:paddingRight="@dimen/activity\_horizontal\_margin"
android:paddingTop="@dimen/activity\_vertical\_margin"
tools:context=".MainActivity"\> <ImageView
android:layout\_width="wrap\_content"
android:layout\_height="wrap\_content"
android:contentDescription="@null" android:src="@drawable/svg\_logo2"
/\> </RelativeLayout\>

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

<?xml version="1.0" encoding="utf-8"?\>

<RelativeLayout
xmlns:android="http://schemas.android.com/apk/res/android"

xmlns:tools="http://schemas.android.com/tools"

android:layout\_width="match\_parent"

android:layout\_height="match\_parent"

android:paddingBottom="@dimen/activity\_vertical\_margin"

android:paddingLeft="@dimen/activity\_horizontal\_margin"

android:paddingRight="@dimen/activity\_horizontal\_margin"

android:paddingTop="@dimen/activity\_vertical\_margin"

tools:context=".MainActivity"\>

<ImageView

android:layout\_width="wrap\_content"

android:layout\_height="wrap\_content"

android:contentDescription="@null"

android:src="@drawable/svg\_logo2" /\>

</RelativeLayout\>

Provided that we are using gradle plugin 1.4.0 or later (at the time of
writing this isn’t released but `1.4.0-beta6` does the trick) this will
now work back to API 1!

So what’s happening? If we take a look in the generated code in the
build folder it becomes obvious:

[![Screen Shot 2015-10-03 at
15.20.33](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.20.33.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.20.33.png)

For API 21 and later the XML vector drawable that we imported is used,
but for earlier devices a PNG of the vector drawable is used instead.

But what if we decide that we don’t need all of these densities and are
concerned about the increased size of our APK as a result of this? We
can actually control which densities will be generated using the
`generatedDensities` property of the build flavor:

app/build.gradle

apply plugin: 'com.android.application' android { compileSdkVersion 23
buildToolsVersion "23.0.1" defaultConfig { applicationId
"com.stylingandroid.vectors4all" minSdkVersion 7 targetSdkVersion 23
versionCode 1 versionName "1.0" generatedDensities = ['mdpi', 'hdpi'] }
buildTypes { release { minifyEnabled false proguardFiles
getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro' } }
} dependencies { compile fileTree(dir: 'libs', include: ['\*.jar'])
testCompile 'junit:junit:4.12' compile
'com.android.support:appcompat-v7:23.0.1' }

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

apply plugin: 'com.android.application'

android {

compileSdkVersion 23

buildToolsVersion "23.0.1"

defaultConfig {

applicationId "com.stylingandroid.vectors4all"

minSdkVersion 7

targetSdkVersion 23

versionCode 1

versionName "1.0"

generatedDensities = ['mdpi', 'hdpi']

}

buildTypes {

release {

minifyEnabled false

proguardFiles getDefaultProguardFile('proguard-android.txt'),
'proguard-rules.pro'

}

}

}

dependencies {

compile fileTree(dir: 'libs', include: ['\*.jar'])

testCompile 'junit:junit:4.12'

compile 'com.android.support:appcompat-v7:23.0.1'

}

If we now build (remember to clean first to remove the resources that
were generated by previous builds) we can see this only creates the
densities we’ve specified:

[![Screen Shot 2015-10-03 at
15.27.08](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.27.08.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/Screen-Shot-2015-10-03-at-15.27.08.png)

So, let’s now actually take a look at what is produced in the png
representation:

[![svg\_logo2](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2-300x300.png)](https://blog.stylingandroid.com/wp-content/uploads/2015/10/svg_logo2.png)

This is essentially the same as how the imported SVG was rendered before
I manually added the missing transformations. I should mention that
there **is** a lint warning which indicates that `` elements are not
supported for raster image generation, but that does not detract from
the fact that *VectorDrawable* is an Android-specific format so not
fully supporting it seems baffling.

We now beginning to understand why transformations are not supported by
the import tool – because transformations on *VectorDrawable* ``
elements is not supported when converting *VectorDrawable* to a raster
image for backwards compatibility. This would appear to be a major
omission: Totally valid *VectorDrawable* assets which render perfectly
under Lollipop and later do not actually render correctly when converted
to PNG.

To, to summarise: If you use these new tools to import assets from the
material icons library they work flawlessly. However, it seems
misleading to even claim that the import tool is actually capable of
importing SVG when it only supports a very limited subset, and will not
correctly import most real-world SVG files. Moreover the lack of support
even for the full *VectorDrawable* specification in the VectorDrawable
-\> raster image conversion makes the implementation feel unfinished and
not really ready for general use.

For the level of manual tweaking that I was required to do to even get
the official SVG logo to even be converted to a *VectorDrawable* by the
import tool it would not have required much more work to manually
convert it to a *VectorDrawable* and completely bypass the import tool
altogether. Although I would still be required to manually apply my
transformations to all of the coordinates within the SVG pathData
elements in order to manually apply the necessary transformations.

Let’s hope that some of these issues are addressed soon so that these
new potentially very useful new tools begin to fulfil some of their
promise.

The source code for this article is available
[here](https://github.com/StylingAndroid/Vectors4All/tree/master).

© 2015, [Mark Allison](https://blog.stylingandroid.com). All rights
reserved. This article originally appeared on [Styling
Android](http://blog.stylingandroid.com).

Portions of this page are modifications based on work created and shared
by Google and used according to terms described in the Creative Commons
3.0 Attribution License