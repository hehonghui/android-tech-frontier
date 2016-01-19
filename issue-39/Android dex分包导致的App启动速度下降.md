#Android Multidex导致的App启动缓慢
---

> * 原文链接 : [Android’s multidex slows down app startup](https://medium.com/groupon-eng/android-s-multidex-slows-down-app-startup-d9f10b46770f#.wzy9fijs5)
* 原文作者 : [mmadev](https://medium.com/@mmadev)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成

Android社区中多次说到了dex包的65536方法数限制，现在针对这个问题的解决方法是dex分包(Multidexing)。虽然这是google提出的一个很好的解决办法，但是我注意到了它对App的启动速度影响很严重（这个问题现在还没有被Android社区所重视）。所以我写下了这篇文章，写给那些想实现dex分包但是不知道它的这个缺点或者已经实现了dex分包但是想看看它性能的开发者。

##背景

简单来说，构建Android应用时这样一个流程：Java代码=>.class文件（与依赖库）=>独立的.dex文件。这个.dex文件最后与资源文件一起打包成.apk文件，这就是你最后从应用商店下载下来的安装文件。具体可以参考[这里](https://github.com/dogriffiths/HeadFirstAndroid/wiki/How-Android-Apps-are-Built-and-Run)。

对编译过程的一个限制就是在dex文件中系统允许的方法总数最多为65536。早期的Android开发者通过混淆来减少不必要的代码，从而避免方法数超过限制的问题。然而混淆在这方面能做到的事情比较有限，而且它只是延缓了方法数量过限的时间，并没有根治。所以后来Google在support library里面出了一个解决方案：dex分包（Multidex），这个方案可以很方便地处理方法数超过限制的问题，但是就如同我之前所说，它会极大地延缓App的启动速度。

##使用Multidex

Multidex现在是一个成熟的、文档丰富的工具。我强烈推荐通过[官网流程](http://developer.android.com/tools/building/multidex.html#mdex-gradle)来在工程中实现Multidex，你也可以在[我的github](https://github.com/mmadev/multidex-sample)。

###NoClassDefFoundError?!

当你在项目中使用了multidex的时候，你的app可能会产生`java.lang.NoClassDefFoundError`异常。这意味着你的app在启动的时候没有找到含有指定类的class文件。Android的Gradle插件首先需要SDK build tools 21.1及以上才支持multidex，它会在混淆工程之后列出一个主dex文件中包含的类的清单（`[buildDir]/intermediates/multi-dex/[buildType]/maindexlist.txt`）。但这里面可能没有包含所有在App启动时需要加载的类，这时启动App就会抛出这个异常。

###如何解决？

要解决这个问题，你要列出一份启动App时需要加载的类的清单，并告诉编译器这些类要保留在主dex文件中。你可以这么做：

- 在工程文件夹下创建一个`multidex.keep`文件
- 将`java.lang.NoClassDefFoundError`异常中报出的类列到`multidex.keep`中。（不要修改`maindexlist.txt`，这个文件每次都会重新生成，改动无效）
- 在使用混淆的模块的gradle脚本中天下如下代码，它会每次在编译的时候将`multidex.keep`文件中的内容添加到`maindexlist.txt"中。
    
    android.applicationVariants.all { variant ->
        task "fix${variant.name.capitalize()}MainDexClassList" << {
            logger.info "Fixing main dex keep file for $variant.name"
            File keepFile = new File("$buildDir/intermediates/multi-dex/$variant.buildType.name/maindexlist.txt")

            keepFile.withWriterAppend { w ->
                // Get a reader for the input file
                w.append('\n')
                new File("${projectDir}/multidex.keep").withReader { r ->
                    // And write data from the input into the output
                    w << r << '\n'
                }
                logger.info "Updated main dex keep file for ${keepFile.getAbsolutePath()}\n$keepFile.text"
            }
        }
    }

    tasks.whenTaskAdded { task ->
        android.applicationVariants.all { variant ->
            if (task.name == "create${variant.name.capitalize()}MainDexClassList") {
                task.finalizedBy "fix${variant.name.capitalize()}MainDexClassList"
            }
        }
    }

##Multidex对应用启动速度造成的影响。

如果你使用了multidex，那么你需要注意它可能会加长App的启动速度。我们通过追踪App的启动时间（从点击icon到所有的图标被下载、显示的时间）。当使用multidex后，4.4及以下的系统启动时间会加长大约15%，你可以在Carlos Sessa的[这篇文章](https://medium.com/@Macarse/lazy-loading-dex-files-d41f6f37df0e#.6sa62ufed)中了解到更多信息。

由于5.0以上的Android系统采用了ART运行时，它本身就支持multidex的加载，所以5.0以上系统影响较小。但是5.0以下的系统将会在加载主dex之外的类时会有比较明显的延迟。

##解决multidex带来的启动时间影响

在App启动到所有图片加载到屏幕上之间的这段时间内，有很多类既没有被混淆，也不在主dex文件中。我们要怎么知道哪些类已经被App加载了呢？

幸运的是，在`ClassLoader`中有一个`findLoadedClass()`方法，我们的解决办法就是在启动结束的时候查看有没有不在主dex文件中却依然在启动阶段被加载的类，将它们添加到之前的`multidex.keep`文件中，手动将其加入主dex文件：

- 运行`getLoadedExternalDexClasses`查看是否有一些副dex中的类在启动结束后被加载了；
- 将上一步检测到的类添加到我们的`multidex.keep`文件中，重新编译。

##实验结果

这里是我们得出的实验结果。蓝色柱是不使用multidex时的启动时间，红色柱是使用multidex时的启动时间，你可以看到两者之间的巨大差距，仅仅是因为我们使用了multidex而已。之后我们进行了上述优化改进，得出的启动时间是绿色柱，你可以看到它回到了原先的启动速度，甚至比原先更快。你可以尝试一下，它会为你的app性能带来提升。

![multidex](https://cdn-images-1.medium.com/max/1000/1*n8CB6MRbJDEvXVq0VBwanQ.png)

##最后的话

>你可以这么做不代表你必须这么做。

你应该将multidex认为是一种走投无路的解决办法，因为它会严重影响App的启动速度，并且还要维护额外的代码来解决奇怪的异常（`java.lang.NoClassDefFoundError`）。当达到了65536的方法数限制时，我们不应该先想到multidex因为它会带来性能影响。我们检查工程并发现了很多没有用处的代码，进行删除、重构。仅仅当没有别的办法时，才引入multidex，并且从此我们都会十分注意代码质量、标准。与其直接使用multidex，不如花时间让你的代码变得简洁、高效，重构你的代码使其不要超过65536的方法数限制。