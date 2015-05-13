Kotlin for Android (IV)：自定义视图和Android的扩展
---

> * 原文链接 : [Kotlin for Android (IV): Custom Views and Android Extensions](http://antonioleiva.com/kotlin-android-custom-views/)
* 原文作者 : [Antonio Leiva](http://antonioleiva.com)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sundroid](https://github.com/sundroid) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  已校对


After reading what extension functions and default values can do for you, you might be wondering what´s next. As we talked in first article about Kotlin, this language makes Android development much simpler and there are still some more things I´d like to talk about.

在了解[extension functions and default values](http://antonioleiva.com/kotlin-android-extension-functions/)
可以为我们做什么后，你可能想知道接下来将会发生什么。
在[first article about Kotlin](http://antonioleiva.com/kotlin-for-android-introduction/)
我们讨论过，Kotlin使得我们的开发变的更加简单，并且接下来我将更加深入的阐述这一观点。

Custom Views
---
自定义View
---
If you remember, when I talked about Kotlin limitations I mentioned that in previous Kotlin versions (up to M10) it was not possible to create custom views. The reason is because we only had the option of creating one constructor for each class. This is usually enough, because using optional parameters we can create as many variations of the constructor as we may need. Here it is an example:

Kotlin的以往版本（一直到M10）是不支持去创建自定义view的。原因是我们在使用Kotlin时，每一个类只有一个构造函数。这通常是足够的，因为我们使用可选参数来使构造函数足以满足我们的需求。下面就是这样的一个例子：

``` Java
class MyClass(param: Int, optParam1: String = "", optParam2: Int = 1) 
{ 
     init {
         // Initialization code
     } 
}
```

With a unique constructor, we now have four ways to create this class:


通过这个构造函数，有一个独特的构造函数，我们现在有四种方法来创建这个类：



``` Java
val myClass1 = MyClass(1)
val myClass2 = MyClass(1, "hello")
val myClass3 = MyClass(param = 1, optParam2 = 4)
val myClass4 = MyClass(1, "hello", 4)
```

As you see, we get a whole bunch of combinations just by using optional parameters. But this leads to a problem if we are trying to create an Android custom view by extending one of the regular views. Custom views need to override more than one constructor to work properly, and we didn´t have a way to do it. Luckily, since M11 we have a way to declare more constructors in way similar to what we do in Java. This is an example of an ImageView which preservers a squared ratio:


正如你所见，我们通过可选参数达到了我们想要的多构造函数的目的。但是这导致了一个问题就是如果我们尝试通过继承系统的View来创建一个Android自定义View。自定义View需要重写不止一个父类的构造函数才能够正常运行，并且Kotlin没有提供这样的方法。幸运的是，从Kotlin M11版本发布后就支持声明多个构造函数，就像我们在Java下一样。这是一个ImageView保存平方率的例子：

``` Java
class SquareImageView : ImageView {
 
    public constructor(context: Context) : super(context) {
    }
 
    public constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
    }
 
    public constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
    }
 
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        val width = getMeasuredWidth()
        setMeasuredDimension(width, width)
    }
}
```

Quite simple. It could probably be less verbose, but at least we now have a way to do it.

非常简单，它可能不太详细，但是至少我们现在有一个方法。

Kotlin Android Extensions
---
Kotlin Android 扩展组件
---
With Kotlin M11 we also received a new plugin that will help us Android developers to access to the views declared in an XML in a much easier way. Some of you will remember Butterknife when you see it, but it´s even simpler to use.

通过Kotlin M11，我们还提供了一个新的插件，这个插件将会帮助我们这个android开发者们用一种更加简单的方法去访问xml下定义的view，当你们使用这个方法时你们将会记得Butterknife，但是这个将会更加简单的去使用它。

Kotlin Android Extensions is basically a view binder that will let you use your XML views in your code by just using their id. It will automatically create properties for them without using any external annotation or findViewById methods.

Kotlin Android 扩展组件是一个基本的控件绑定，它将会让你在代码中通过id来使用你在xml中定义的view，它将会在不使用任何注解或者findViewById的方法自动创建这些属性。

To start using it, you´ll need to install a new plugin, called Kotlin Android Extensions and add this new classpath to your buildscript dependencies (in your main build.gradle):

使用这个扩展组件，你需要安装一个新的插件，这个插件叫做Kotlin Android Extensions 并且添加通过buildscript来添加这个地址（在项目的build.gradle=中）



``` Java
buildscript { 
    …
     dependencies {
        … 
        classpath "org.jetbrains.kotlin:kotlin-android-extensions:$kotlin_version"
    }
 }
```

Imagine you have declared the next layout, called main.xml:

设想你有一个一个布局，叫main.xml：

``` Java
<FrameLayout 
    xmlns:android="..."
     android:id="@+id/frameLayout"
     android:orientation="vertical"
     android:layout_width="match_parent"
     android:layout_height="match_parent">
 
      <TextView
         android:id="@+id/welcomeText" 
        android:layout_width="wrap_content"
         android:layout_height="wrap_content"/>  
 
</FrameLayout>
```

If you want to use these views in your activity, the only thing you need to do is importing the synthetic properties for that xml:

如果你想在你的activity中使用这个view，你唯一需要做得就是导入这个Kotlin Android Extensions提供的属性：

``` Java
import kotlinx.android.synthetic.<xml_name>.*
```

In our case, it will be just main:

在我们的例子中，它将是主要的：


``` Java
import kotlinx.android.synthetic.main.*
```

Now you can access your views by using its id:

现在你可以通过id使用你的view了：

``` Java
override fun onCreate(savedInstanceState: Bundle?) { 
    super<BaseActivity>.onCreate(savedInstanceState)
    setContentView(R.id.main) 
    frameLayout.setVisibility(View.VISIBLE)
     welcomeText.setText("I´m a welcome text!!") 
}
```

Conclusion
---

总结
---

What it´s really promising about these two new features is that it´s clear that the Kotlin team is very interested in making Android developers lives easier. They also released a library called Anko, a DSL to create Android layouts from Kotlin files. I´m not using its main functionality yet, but you can use it to simplify your code when dealing with Android views, and I have some examples of this in the Kotlin project I pushed to Github. You can take a look to see this and many other things.

通过这两个新功能，我们Kotlin 团队真正感兴趣的是让android开发者们可以生活的更加轻松。他们也发布了一个叫做Anko的库，让我们通过Kotlin创建布局。我们有使用其主要功能，但是你在处理View时可以使用它去简化你的代码，我有一些Kotlin项目的例子已经提交到github，你可以看看这些例子或者其他相关资料。


Next article will cover the use of lambda expressions and how they can help us simplify our code and extend the language. Really interesting one! To me, the most powerful aspect of Kotlin when compared with Java 1.7.

下一个文章将会介绍使用lambda表达式和他们怎样才能帮助我们简化代码。非常有趣，对我来说，Kotlin和java 1.7比较起来将会变的非常有力。
