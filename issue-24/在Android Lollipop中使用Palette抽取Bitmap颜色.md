#在Android Lollipop中使用Palette抽取Bitmap颜色

> * 原文链接 : [Extracting Colors to a Palette with Android Lollipop](https://www.bignerdranch.com/blog/extracting-colors-to-a-palette-with-android-lollipop/)
* 原文作者 : [Brian Gardner](https://www.bignerdranch.com/about-us/nerds/brian-gardner/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Desmond1121](https://github.com/desmond1121)
* 校对者:

With the release of Android Lollipop, several new support libraries have been created. One of the new libraries is for the Palette class. This new class makes it easy to extract prominent colors from bitmap images, which is useful if you want to style other view components to match colors from your image, such as a background for the image or a text color with suitable contrast.

一些Support库随着Android Lollipop的发布而诞生了，其中就有Palette。这个库可以让你很轻松地从一幅图中抽取特征颜色，这在你希望界面的颜色风格适应指定图片时非常有用，它还会提供与指定颜色相搭配的字体颜色。

One particular way I like to use this is to color the ripple drawable behind the image. It is a subtle effect, but I think it is a nice improvement over the standard gray. Before you can use it in your projects, you need to add the following compile line to the Gradle dependencies block in your build.gradle file.

Palette有一个用法我特别喜欢：它可以定制图像波纹的颜色。这是其实一个微不足道的效果，但是 我认为相比于纯灰色波纹来说是一个很大的提升。你需要在工程下的`build.gradle`里添加依赖才可以使用Palette，像如下代码所示：

    dependencies {
      compile 'com.android.support:palette-v7:21.0.0'
    }

There are two different ways to generate the Palette for an image. The first is to use the generate methods, which either take just a bitmap object or a bitmap with an integer specifying the number of colors the palette should generate. Requesting more colors will increase the time it takes to generate the Palette. By default, this method will try to generate 16 colors from the supplied bitmap.

生成一幅图像的Palette有两种方法：

- `generate(Bitmap)` 生成含有16种颜色种类的Palette；
- `generate(Bitmap, int)` 生成含有指定数量颜色种类的Palette，数量越多需要的时间越久。

These methods are synchronous and should not be called on your main thread. Instead, they would typically be used right after you loaded an image on a background thread.

这两个方法是同步方法，由于他们很可能会比较耗时（在分析大图片或者所需颜色较多时），所以他们不应该在主线程中执行。你应该在别的线程中执行，在加载完颜色之后再使用它。

However, sometimes it may not be possible to do this work on the same thread that you load your images on, so the Palette class has another set of generate methods that are configured to do the work asynchronously. These methods have the same parameters as the synchronous generate methods, but they also take in a listener object that will be called when the Palette is ready.

不过有时候你不会在加载图片的线程（非主线程）中使用解析出的颜色，所以Palette提供了一步方法，他们与之前的函数的区别就是需要传入`PaletteAsyncListener`，提供在图片解析完成后的回调函数：

- `generateAsync(Bitmap, PaletteAsyncListener)`
- `generateAsync(Bitmap, int, PaletteAsyncListener)`

The implementation for the PaletteAsyncListener is fairly simple. Just override the onGenerated method, and then you can use the created Palette object however you need.

`PaletteAsyncListener`的实现是非常简单的（参考下面这几行代码），它只要重写`onGenerated`就好了。如此一来你就可以在任何需要的时候使用这两个函数创建Palette。


    Palette.PaletteAsyncListener listener = new Palette.PaletteAsyncListener() {
      public void onGenerated(Palette palette) {
        // access palette colors here
      }
    }


The Palette object will try to find 16 colors from the image by default, but there are six color profiles you will use most often:

Palette默认会解析出图像的16种特征颜色种类，但是这六种颜色是你最经常用到的：

- vibrant(鲜艳色)
- dark vibrant(鲜艳色中的暗色)
- light vibrant(鲜艳色中的亮色)
- muted(柔和色)
- dark muted(柔和色中的暗色)
- light muted(柔和色中的亮色)

Here is an example of the main color profiles the Palette generates:

这是一个Palette解析六个主颜色种类的例子：

![Six Color](http://img.blog.csdn.net/20150827183303088)

Once you have the Palette object, there are built-in getter methods for the six default color profiles. There is a chance that the Palette was not able to find a color for a particular profile, so you do need to pass in a default color. The value returned by these methods is an RGB packed integer.

你获取Palette对象之后，可以通过以下这些内置getter函数直接获取这六个颜色。你需要传入默认颜色防止Palette无法解析到指定颜色种类，返回的类型是24位RGB颜色数值。

    Palette palette = Palette.generate(myBitmap);
    int vibrant = palette.getVibrantColor(0x000000);
    int vibrantLight = palette.getLightVibrantColor(0x000000);
    int vibrantDark = palette.getDarkVibrantColor(0x000000);
    int muted = palette.getMutedColor(0x000000);
    int mutedLight = palette.getLightMutedColor(0x000000);
    int mutedDark = palette.getDarkMutedColor(0x000000);

###Swatch

These generated colors come from an object called a Swatch, which contains some useful data about a color found in the image. You can get the color in either a RGB packed int or the HSL values. It also includes the number of pixels of that color in the image (the population). Finally, the Swatch provides title and body text colors. These colors are guaranteed to have sufficient contrast with the Swatch color, so you won’t have issues with legibility.

这些颜色都来自于对应的`Swatch`，在`Swatch`里面含有很多关于对应颜色的有用信息。你可以从这里面获取RGB颜色值、HSV颜色值、对应颜色在图像中所占的比例、与对应颜色搭配的标题字体颜色和正文字体颜色（这两个颜色和对应颜色的对比值是处理好的，你不必再去操心）。如下面这段代码所示：


    Palette palette  = Palette.generate(myBitmap);
    Palette.Swatch swatch = palette.getVibrantSwatch();
    // Gets the RGB packed int -> same as palette.getVibrantColor(defaultColor);
    int rgbColor = swatch.getRgb();
    // Gets the HSL values
    // Hue between 0 and 360
    // Saturation between 0 and 1
    // Lightness between 0 and 1
    float[] hslValues = swatch.getHsl();
    // Gets the number of pixels represented by this swatch
    int pixelCount = swatch.getPopulation();
    // Gets an appropriate title text color
    int titleTextColor = swatch.getTitleTextColor();
    // Gets an appropriate body text color
    int bodyTextColor = swatch.getBodyTextColor();

For each of the six color profiles, there is another method for getting its Swatch object. Unlike the get color methods, there is no default parameter for the Swatch methods. If the Palette object was not able to find a color that matches a particular color profile, the get Swatch method will just return null.

获取六个主颜色的`Swatch`要使用与之前直接获取颜色不同的getter函数，如下面这部分代码所示。它们不需要提供默认值，如果Palette没有解析到对应颜色种类，它会直接返回空的`Swatch`。

    Palette palette = Palette.generate(myBitmap);
    Palette.Swatch vibrantSwatch = palette.getVibrantSwatch();
    Palette.Swatch vibrantLightSwatch = palette.getLightVibrantSwatch();
    Palette.Swatch vibrantDarkSwatch = palette.getDarkVibrantSwatch();
    Palette.Swatch mutedSwatch = palette.getMutedSwatch();
    Palette.Swatch mutedLightSwatch = palette.getLightMutedSwatch();
    Palette.Swatch mutedDarkSwatch = palette.getDarkMutedSwatch();

While the system has convenience methods to get the swatches for the six default color profiles, the other generated swatches need to be retrieved manually. There is a getSwatches() method defined on the Palette that will return a List of all the swatches created. If you just want to use the Swatch represented by the most pixels, you could just grab it from that list.

Palette只为六种主颜色种类`Swatch`提供了getter，如果你要使用其他种类（一共有16种颜色种类），你需要手动获取它。使用`getSwatchs()`会返回一个列表，里面有所有获取到的`Swatch`，你可以从列表中获取你需要的颜色种类。

Here is an example of the swatches the Palette generates with their respective populations:

这里是一个Palette获取所有`Swatch`的例子，里面展示了它们分别在图像中所占的比例：

![all color](http://img.blog.csdn.net/20150827183359416)

The fact that the Palette object comes with built-in generator methods that run asynchronously make it very quick to use, and I can see the Palette being used in a lot of places. It was neat to see how it collects the different colors in the image, then how it narrows those colors down to the max color number. I recommend digging through the source files to learn more.

Palette的异步方法使得它非常容易去使用，而且我也看到了它用在很多地方。它真是一个非常棒的工具，能够收集一幅图中所有的颜色，并将他们总结到几个不同种类的颜色中。我建议你阅读[源码](https://android.googlesource.com/platform/frameworks/support/+/master/v7/palette/src/android/support/v7/graphics)来更多地学习它！



