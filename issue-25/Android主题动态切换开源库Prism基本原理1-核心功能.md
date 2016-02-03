#Android主题动态切换开源库Prism基本原理1-核心功能

> * 原文链接 : [Prism Fundamentals Part 1](https://blog.stylingandroid.com/prism-fundamentals-part-1/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
* 译者 : [Desmond1121](https://github.com/desmond1121)  
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)

**重要提示：Prism源码目前停止更新了（你可以在[Prism-Github](https://github.com/StylingAndroid/Prism) 描述文件中看到）。不过我还是决定写出这一系列的文章来介绍Prism现在的版本，因为它很可能还有用。**

我很高兴地宣布Prism问世了，这是一个全新的Android主题切换框架。虽然现在只是初步的发布，只具有一些基础功能，但已经足够强大了！在本系列文章中我会全方位地介绍Prism的使用方法，并告诉你怎样将它拓展到自己的工程中。

在开始之前，先说说Prism诞生的背景吧。其实一开始我并没有打算做一个框架，我当时正在处理Styling Android中一些关于ViewPager的动态颜色的代码。我将它重构成一些方便使用的部件，在重构之后我感觉这是一个很简洁可用的API，Prism框架的想法由此诞生。我将这部分代码向一些我比较认同能力的人分享了之后，他们也觉得这是一个很实用清晰框架，在这之后我开始写Prism。直到现在，它具备了很多强大的功能，而仍然保持着简单清晰的API，我觉得是时候发布它了。

有一个单词拼写的提示：你可能从通篇的`colour`来表示颜色(而不是`color`）中猜到我是英国人。不过我也知道同时有很多人在使用美式英语，为了让人们有选择自己熟悉语言的权利，英式、美式英语拼写都会Prism接受。所以你可以使用`setColor(int color)`或`setColour(int colour)`，它们的效果是一样的。不过使用`setColor(int color)`的效率稍微低一点点因为它其实是通过调用`setColour(int colour)`实现的，如果你使用英式拼写，会提高些许性能。

Prism下含有三个库：

- prsim 库含有一些核心功能；
- prism-viewpager 库实现了核心库与ViewPager的对接；
- prism-palette 库实现了核心库与Palette的对接。

分成三个库是为了区分依赖条件：核心库不依赖外部条件，它能够很容易地添加到你的工程之中；但是prism-viewpager和prism-palette需要依赖相应的support库。所以当你的程序不使用这些依赖库时，你可以只使用prism库来省去不必要的依赖条件。不过当你的程序中使用了`ViewPager`时，即已经对相关的support库有了依赖，那么添加prism-viewpager库就不需要额外的依赖条件。

Prism在jCenter和Maven中央仓库都有发布，假设你已经在工程中设置了它们其中一个为依赖仓库，那么你可以在`build.gradle`的`dependencies`项下添加Prism库，具体参考下面这个代码：

	apply plugin: 'com.android.application'
	 
	android {
	    compileSdkVersion 22
	    buildToolsVersion "23.0.0 rc3"
	 
	    defaultConfig {
	        applicationId "com.stylingandroid.prism.sample.palette"
	        minSdkVersion 7
	        targetSdkVersion 22
	        versionCode 1
	        versionName "1.0"
	    }
	    buildTypes {
	        release {
	            minifyEnabled false
	            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
	        }
	    }
	}
	 
	dependencies {
	    compile 'com.android.support:appcompat-v7:22.2.0'
	    compile 'com.android.support:design:22.2.0'
	    compile 'com.android.support:support-v4:22.2.0'
	    compile 'com.stylingandroid.prism:prism:1.0.1'
	    compile 'com.stylingandroid.prism:prism-viewpager:1.0.1'
	}

以上代码添加了prism和prism-viewpager库，现在最新的版本是1.0.1（[下载链接](https://bintray.com/stylingandroid/maven/prism/1.0.1/view)）。

当你添加了依赖库后你就可以使用Prism了。

Prism的基本思想是围绕这三个概念：Setter, Filter 和 Triggers。

Setter可以设置UI组件的颜色（通常是`View`，不过也可以设置其他东西，我下面会讲到）。它的功能就是将`setColor(int color)`（或`setColour(int colour)`）封装到具有不同功能的函数中。举个例子，内置的`ViewBackgroundSetter`中就有一个函数：`setBackgroundColor(int color)`。有时候Setter会在不同的Android版本中有不同的效果，比如内置的`StatusBarSetter`会在Android Lollipop(5.0.1)以下的版本中都不起作用，因为在5.0.1以下的版本不支持StatusBar的颜色改变。不过你不要担心，Prism会判断运行时版本从而避开程序死机的情况，你可以放心地使用它。

Prism中内置了几个基础的Setter：

- `FabSetter（FloatingActionButton fab)` - 为[Android Design Support Library](http://android-developers.blogspot.hk/2015/05/android-design-support-library.html)中的`FloatingActionButton`设置颜色。
- `StatusBarSetter(Window window)` - 在支持状态栏颜色改变的窗口中设置状态栏的颜色，注意它的操作对象并不是`View`。
- `TextSetter(TextView textView)` - 设置`TextView`中文字的颜色。
- `ViewBackgroundSetter(View view)` - 设置`View`的背景颜色。

当然你也可以实现自己的Setter来为自定义的`View`设置颜色，甚至你可以为同一个`View`设置多个Setter来为`View`不同的部件设置不同的颜色。你只需要实现这些Setter，然后将它们添加到Prism中即可。

Filter可以多样化颜色调整。Prism框架通常只使用单个颜色为所有组件进行转换，为组件设定Filter可以帮助你改变Prism输入的颜色。它会在内部处理好颜色变换的逻辑，再输出转换好的颜色。Prism内置的一些基础Filter有：

- `IdentifyFilter()` - 返回与输入相同的颜色；
- `ShadeFilter(float amount)` - 将输入颜色与黑色混合。`amount`是在0到1之间的浮点数，它决定了黑色的比例。当`amount`为0时，输出颜色就是输入颜色；当为1时，输出颜色为纯黑色。
- `TintFilter(float amount)` - 将输入颜色与白色混合。`amount`是在0到1之间的浮点数，它决定了白色的比例。当`amount`为0时，输出颜色就是输入颜色；当为1时，输出颜色为纯白色。

Trigger触发了Prism的颜色变换。特别的，它是通过调用`setColour(int colour)`，让所有注册过的Setter的来让UI组件产生相应的颜色变换。

在Prism核心库内没有提供内置的Trigger，因为那需要额外的依赖库。不过在ViewPager和Palette相应的扩展库中是有提供的。

现在我们需要将这三个组件整合起来，幸运的是`Prism`实例会帮我们做这件事情。每个`Prism`实例可能没有Trigger也可能有多个Trigger，有一个或多个Setter。每个Setter可以有一个Filter来在不同情况下产生不同的颜色。

Prism提供了智能的工厂方法，它会根据你传入的数据来智能选择Setter。比如你传一个`FloatingActionButton`给`Prism.Builder.background()`，它会为你自动生成一个`FabSetter`。

`Prism`使用了建造者模式来构建组件，并将他们与Trigger绑定在一起，会响应相应的触发事件。

让我们看一下怎么创造一个`Prism`实例：

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView textView = (TextView) findViewById(R.id.text_view);
        AppBarLayout appBar = (AppBarLayout) findViewById(R.id.app_bar);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);

        setSupportActionBar(toolbar);

        Filter tint = new TintFilter(TINT_FACTOR_50_PERCENT);
        prism = Prism.Builder.newInstance()
                .background(appBar)
                .background(getWindow())
                .text(textView)
                .background(fab, tint)
                .build();

        fab.setOnClickListener(this);
        setColour(currentColour);
    }

    @Override
    protected void onDestroy() {
        if (prism != null) {
            prism.destroy();
        }
        super.onDestroy();
    }

上面代码中的大部分都不需要解释（这是一些Android开发的基本内容）。其中在新建`Prism`实例的时候，我们首先做了一个50%的`TintFilter`（与白颜色混合的Filter）。

然后我们新建了一个`Prism.Builder`实例，为它添加了一个AppBar实例（会相应地产生一个Setter专门用于设置AppBar的背景），然后添加了一个Window实例（相应地产生一个Setter专门用于设置状态栏背景颜色），再添加了一个TextView以及FloatingActionButton（它们都产生了相应的Setter），并为FloatingActionButton设置了之前定义的`TintFilter`。

最终我们使用`Prism.Builder.build()`办法来产生一个`Prism`实例。

现在我们把几个组件都结合起来了，然后调用`Prism.setColour(int colour)`来为组件转换颜色。

注意要在`onDestroy()`中销毁`Prism`实例。不过实际上不注销也没关系，因为当Activity被销毁之后`Prism`不会持有任何引用防止GC收集，它不会在我们不需要的它时候妨碍到内存清理活动。

这样我们就了解了Prism的基础工作原理：在`onCreate()`中添加6行代码就可以让`FloatingActionButton`和你的`Toolbar`、`TextView`转换颜色：

![Demo](http://img.blog.csdn.net/20150816235240096)

怎么样，Prism厉害吧？下一篇文章的内容是怎样Trigger集合到代码中，尽请期待！

这里面所有的例子都会在[源码Github](https://github.com/StylingAndroid/Prism)中的[示例代码](https://github.com/StylingAndroid/Prism/tree/master/sample) 中看到。

