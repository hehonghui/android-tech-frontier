#Android主题动态切换开源库Prism基本原理(1)

> * 原文链接 : [Flux Architecture on Android](http://lgvalle.github.io/2015/08/04/flux-architecture/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译者 : [Desmond1121](https://github.com/desmond1121)  
* 校对者: 
* 状态 :  未校对

**IMPORTANT: Updates to Prism are on indefinite hold – more details can be found in the README in the within the Prism source. I have decided to continue publishing this short series because it documents how to use Prism in its current form and so still may be useful.**

**重要提示：Prism源码目前停止更新了（你可以在[Prism-Github](https://github.com/StylingAndroid/Prism) 描述文件中看到）。不过我还是决定写出这一系列的文章来介绍Prism现在的版本，因为它很可能还有用。**

I am extremely excited to announce the release of Prism – an all-new dynamic theming library for Android. This is an initial release to get the basic functionality out there, but it is already pretty powerful. However there are some exciting additions in the pipeline which will make it more powerful still. In this series of articles we’ll cover the various aspects of prism to enable you to make use of it and even extend it yourself to meet the requirements of your project.

我很高兴地宣布Prism问世了，这是一个全新的Android主题切换框架。虽然现在只是初步的发布，只具有一些基础功能，但已经足够强大了！在本系列文章中我会全方位地介绍Prism的使用方法，并告诉你怎样将它拓展到自己的工程中。

Before we begin – a little background. I didn’t set out to create a library. I was working on some code for a series of Styling Android posts around dynamic UI colouring based upon a ViewPager. While writing this code, I refactored it in to easy to explain components which would easy to write about. Following this refactoring I saw quite a clean API emerging and it was from this that the concept of Prism began to emerge. I showed it to a couple of people whose opinion I value and they agreed that it looked a nice, clean, simple API. I then started the process of turing it in to a library and kept referring back the API and felt that I was adding lots of power without making the API any more complex. So now the time to release it!

在开始之前，先说说Prism诞生的背景吧。其实一开始我并没有打算做一个框架，我当时正在处理Styling Android中一些关于ViewPager的动态颜色的代码。我将它重构成一些方便使用的部件，在重构之后我感觉这是一个很简洁可用的API，Prism框架的想法由此诞生。我将这部分代码向一些我比较认同能力的人分享了之后，他们也觉得这是一个很实用清晰框架，在这之后我开始写Prism。直到现在，它具备了很多强大的功能，而仍然保持着简单清晰的API，我觉得是时候发布它了。

One small note about spelling: As you may have guessed from the spelling of the word ‘colour’ throughout this series of posts I am English and prefer to use the English spelling of ‘colour’. I am fully aware that there are many people who spell it ‘color’. In order to give people the freedom to use whichever spelling they prefer, Prism will accept both spellings. So you can call setColor(int color) in place of setColour(int colour) if you prefer. However, using the English spelling of ‘colour’ will result in slightly better performance because there will be one less method call as internally setColor(int color) simply calls setColour(int colour). So if you choose to spell ‘colour’ incorrectly you will suffer a very minor performance hit!

有一个单词拼写的提示：你可能从通篇的`colour`来表示颜色(而不是`color`）中猜到我是英国人。不过我也知道同时有很多人在使用美式英语，为了让人们有选择自己熟悉语言的权利，英式、美式英语拼写都会Prism接受。所以你可以使用`setColor(int color)`或`setColour(int colour)`，它们的效果是一样的。不过使用`setColor(int color)`的效率稍微低一点点因为它其实是通过调用`setColour(int colour)`实现的，如果你使用英式拼写，会提高些许性能。

For now Prism is divided in to three separate libraries:

- prism – the core Prism library
- prism-viewpager – an extension which hooks up ViewPager with the core - Prism library
- prism-palette – an extension which hooks up Palette with the core Prism library

Prism下含有三个库：

- prsim 库含有一些核心功能；
- prism-viewpager 库实现了核心库与ViewPager的对接；
- prism-palette 库实现了核心库与Palette的对接。

The reasoning behind splitting them up was that the core Prism library has no external dependencies and is small and cheap to add to your project. However both the ViewPager and Palette extensions have external dependencies on the relevant support libraries. So if, for example, your project needs neither of these extensions you do not incur any unnecessary dependencies. However, if you do need ViewPager then you’re project will already have a dependency on the ViewPager support library so the overhead of adding the Prism ViewPager extension lib will be negligible.

分成三个库是为了区分依赖条件：核心库不依赖外部条件，它能够很容易地添加到你的工程之中；但是prism-viewpager和prism-palette需要依赖相应的support库。所以当你的程序不使用这些依赖库时，你可以只使用prism库来省去不必要的依赖条件。不过当你的程序中使用了`ViewPager`时，即已经对相关的support库有了依赖，那么添加prism-viewpager库就不需要额外的依赖条件。

Prism is published to both jCenter and Maven Central so, assuming that you already have one or both of these configured as repos for your project it is simply a case of adding the dependencies to your build.grade:

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

At the time of writing version 1.0.1 is the released version, but for future compatibility the current released version is 1.0.1.

以上代码添加了prism和prism-viewpager库，现在最新的版本是1.0.1（[下载链接](https://bintray.com/stylingandroid/maven/prism/1.0.1/view)）。

Once you have added the necessary dependencies you can start using Prism.

当你添加了依赖库后你就可以使用Prism了。

The basic concept of Prism is based around three distinct object types: Setters, Filters, & Triggers.

Prism的基本思想是围绕这三个概念：Setter, Filter 和 Triggers。

A Setter allows us to set the colour of a UI object – typically a View but not always, as we shall see. The basic function of a Setter is to map a generic setColour(int colour) (or setColor(int color)) call to a specific method call on the View that it wraps. For example, the built in ViewBackgroundSetter will map to setBackgroundCOLOR(int color). In some cases the Setter can provide different behaviour on different versions of Android – for example StatusBarSetter will have no effect on pre-Lollipop devices because status bar colouring is not supported prior to Lollipop. However it will degrade gracefully (no crashing!) so you can safely use it and allow the Setter implementation to worry about how to apply the colour at runtime.

Setter可以设置UI组件的颜色（通常是`View`，不过也可以设置其他东西，我下面会讲到）。它的功能就是将`setColor(int color)`（或`setColour(int colour)`）封装到具有不同功能的函数中。举个例子，内置的`ViewBackgroundSetter`中就有一个函数：`setBackgroundColor(int color)`。有时候Setter会在不同的Android版本中有不同的效果，比如内置的`StatusBarSetter`会在Android Lollipop(5.0.1)以下的版本中都不起作用，因为在5.0.1以下的版本不支持StatusBar的颜色改变。不过你不要担心，Prism会判断运行时版本从而避开程序死机的情况，你可以放心地使用它。

The standard Setters built in to Prism are:

- FabSetter(FloatingActionButton fab) – sets the background tint colour on the design support library implementation of FloatingActionButton
- StatusBarSetter(Window window) – sets the status bar colour on the supplied Window. Note that this does not take a View.
- TextSetter(TextView textView) – sets the text colour on the supplied TextView.
- ViewBackgroundSetter(View view) – sets the background colour of the supplied View.

Prism中内置了几个基础的Setter：

-`FabSetter（FloatingActionButton fab)` - 为[Android Design Support Library](http://android-developers.blogspot.hk/2015/05/android-design-support-library.html)中的`FloatingActionButton`设置颜色。
- `StatusBarSetter(Window window)` - 在支持状态栏颜色改变的窗口中设置状态栏的颜色，注意它的操作对象并不是`View`。
- `TextSetter(TextView textView)` - 设置`TextView`中文字的颜色。
- `ViewBackgroundSetter(View view)` - 设置`View`的背景颜色。

Of course you can create your own Setters for custom Views which may require have additional components which can be coloured, and you can create multiple Setters for a single View to sett different attributes and add them all to the Prism to colour multiple components simultaneously.

当然你也可以实现自己的Setter来为自定义的`View`设置颜色，甚至你可以为同一个`View`设置多个Setter来为`View`不同的部件设置不同的颜色。你只需要实现这些Setter，然后将它们添加到Prism中即可。

A Filter allows us to modify a colour. Prism is generally called with a single colour value and sometimes we may want to apply different variants of that colour to different UI components – Filters enable us to do just that. In its most basic form a Filter takes a colour value as in input, performs some colour transformation upon that colour, and returns the transformed colour value. The basic built-in colour filters are:

Filter可以多样化颜色调整。Prism框架通常只使用单个颜色为所有组件进行转换，为组件设定Filter可以帮助你改变Prism输入的颜色。它会在内部处理好颜色变换的逻辑，再输出转换好的颜色。Prism内置的一些基础Filter有：

- IdentityFilter() – returns the colour which was input.
- ShadeFilter(float amount) – darkens the colour by effectively mixing in black. The value is a float from 0.0-1.0 which determines how much black to add. A value of 0 makes no change, and a value of 1.0 will produce pure black
- TintFilter(float amount) – lightens the colour by effectively mixing in white. The value is a float from 0.0-1.0 which determines how much white to add. A value of 0 makes no change, and a value of 1.0 will produce pure white.

- `IdentifyFilter()` - 返回与输入相同的颜色；
- `ShadeFilter(float amount)` - 将输入颜色与黑色混合。`amount`是在0到1之间的浮点数，它决定了黑色的比例。当`amount`为0时，输出颜色就是输入颜色；当为1时，输出颜色为纯黑色。
- `TintFilter(float amount)` - 将输入颜色与白色混合。`amount`是在0到1之间的浮点数，它决定了白色的比例。当`amount`为0时，输出颜色就是输入颜色；当为1时，输出颜色为纯白色。

A Trigger is what triggers colour change events. Typically it will call setColour(in colour) on a Prism instance to propagate a colour change to all of the Setters which have been registered with that instance.

Trigger触发了Prism的颜色变换。特别的，它是通过调用`setColour(int colour)`，让所有注册过的Setter的来让UI组件产生相应的颜色变换。

There are no Triggers currently built in to the core Prism library because that would require some library dependencies. However these are provided in the optional ViewPager and Palette extensions.

在Prism核心库内没有提供内置的Trigger，因为那需要额外的依赖库。不过在VierPager和Palette相应的扩展库中是有提供的。

Now that we have our three types of components, we need to wire them up and that is what the Prism instance does. Each Prism instance has zero or more Triggers (which will cause a colour change), and one or more Setters (which will be called in response to a colour change). Each Setter can have a Filter attached which will transform the trigger colour before applying it to the Setter.

现在我们需要将这三个组件整合起来，幸运的是`Prism`实例会帮我们做这件事情。每个`Prism`实例可能没有Trigger也可能有多个Trigger，有一个或多个Setter。每个Setter可以有一个Filter来在不同情况下产生不同的颜色。

As well as this basic wiring, Prism also contains some intelligent factories which will construct appropriate Setter implementations automatically for you. For example, if you pass in a design library FloatingActionButton to Prism#background() it will automatically create a FabColourSetter for you.

Prism提供了智能的工厂方法，它会根据你传入的数据来智能选择Setter。比如你传一个`FloatingActionButton`给`Prism.Builder.background()`，它会为你自动生成一个`FabSetter`。

A Prism instance is constructed using a builder pattern which constructs the components, wires them up, and then attaches to the Trigger and then responds to trigger events.

`Prism`使用了建造者模式来构建组件，并将他们与Trigger绑定在一起，会响应相应的触发事件。

Lets look at how we can create a simple Prism instance:

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
    
Most of this code doesn’t require any explanation – it’s standard Android stuff. The highlighted section shows the creation of the Prism instance. We first create a 50% tit filter (which will lighten the colour wherever it is applied. 

上面代码中的大部分都不需要解释（这是一些Android开发的基本内容）。其中在新建`Prism`实例的时候，我们首先做了一个50%的`TintFilter`（与白颜色混合的Filter）。

Next we create a Prism.Builder instance, and add the AppBar instance (which will create a Setter for the AppBar background colour), the Window (which will create a Setter for our StatusBarColour), a TextView (which will set the text colour because of using the text(TextView) method on the Builder), and a FloatingActionButton which will set the background colour of our FAB with the tint applied.

然后我们新建了一个`Prism.Builder`实例，为它添加了一个AppBar实例（会相应地产生一个Setter专门用于设置AppBar的背景），然后添加了一个Window实例（相应地产生一个Setter专门用于设置状态栏背景颜色），再添加了一个TextView以及FloatingActionButton（它们都产生了相应的Setter），并为FloatingActionButton设置了之前定义的`TintFilter`。

Finally we call build() to construct the Prism instance;

最终我们使用`Prism.Builder.build()`办法来产生一个`Prism`实例。

Now that we have everything wired up, we can change the colour of all of these components simultaneously by simply calling setColour(int colour) on the Prism instance:

现在我们把几个组件都结合起来了，然后调用`Prism.setColour(int colour)`来为组件转换颜色。

We also explicitly destroy the Prism instance in onDestroy(). While this isn’t strictly necessary because nothing will hold a reference to Prism instance after the Activity is destroyed leaving it free to be garbage collected, it never hurst the clean up when we no longer need it.

注意要在`onDestroy()`中销毁`Prism`实例。不过实际上不注销也没关系，因为当Activity被销毁之后`Prism`不会持有任何引用防止GC收集，它不会在我们不需要的它时候妨碍到内存清理活动。

So there we have the fundamentals of Prism: By adding an additional 6 lines of code to our onCreate() we can do this if we hook up our FAB to toggle colours:

这样我们就了解了Prism的基础工作原理：在`onCreate()`中添加6行代码就可以让`FloatingActionButton`转换颜色。

So that’s pretty powerful stuff but we haven’t even looked at incorporating Triggers in to the equation yet. In the next article we’ll do just that.

怎么样，Prism厉害吧？下一篇文章的内容是怎样Trigger集合到代码中，尽请期待！

The full source for this sample is available as one of the sample apps within the Prism source.

这里面所有的例子都会在[源码Github](https://github.com/StylingAndroid/Prism)中的[示例代码](https://github.com/StylingAndroid/Prism/tree/master/sample) 中看到。

