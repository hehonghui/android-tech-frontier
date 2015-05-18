Kotlin for Android (IV)：自定义视图和Android的扩展
---

> * 原文链接 : [Kotlin for Android (IV): Custom Views and Android Extensions](http://antonioleiva.com/kotlin-android-custom-views/)
* 原文作者 : [Antonio Leiva](http://antonioleiva.com)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [sundroid](https://github.com/sundroid) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  已校对


在了解[extension functions and default values](http://antonioleiva.com/kotlin-android-extension-functions/)
可以为我们做什么后，你可能想知道接下来将会发生什么。
在[first article about Kotlin](http://antonioleiva.com/kotlin-for-android-introduction/)
我们讨论过，Kotlin使得我们的开发变的更加简单，并且接下来我将更加深入的阐述这一观点。

自定义View
---

Kotlin的以往版本（一直到M10）是不支持去创建自定义view的。原因是我们在使用Kotlin时，每一个类只有一个构造函数。这通常是足够的，因为我们使用可选参数来使构造函数足以满足我们的需求。下面就是这样的一个例子：

``` Java
class MyClass(param: Int, optParam1: String = "", optParam2: Int = 1) 
{ 
     init {
         // Initialization code
     } 
}
```

有一个独特的构造函数，我们现在有四种方法来创建这个类：


``` Java
val myClass1 = MyClass(1)
val myClass2 = MyClass(1, "hello")
val myClass3 = MyClass(param = 1, optParam2 = 4)
val myClass4 = MyClass(1, "hello", 4)
```


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

非常简单，它可能不太详细，但是至少我们现在有一个方法。

Kotlin Android 扩展组件
---

通过Kotlin M11，我们还提供了一个新的插件，这个插件将会帮助我们这个android开发者们用一种更加简单的方法去访问xml下定义的view，当你们使用这个方法时你们将会记得Butterknife，但是这个将会更加简单的去使用它。

Kotlin Android 扩展组件是一个基本的控件绑定，它将会让你在代码中通过id来使用你在xml中定义的view，它将会在不使用任何注解或者findViewById的方法自动创建这些属性。

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


如果你想在你的activity中使用这个view，你唯一需要做得就是导入这个Kotlin Android Extensions提供的属性：

``` Java
import kotlinx.android.synthetic.<xml_name>.*
```

在我们的例子中，它将是主要的：


``` Java
import kotlinx.android.synthetic.main.*
```

现在你可以通过id使用你的view了：

``` Java
override fun onCreate(savedInstanceState: Bundle?) { 
    super<BaseActivity>.onCreate(savedInstanceState)
    setContentView(R.id.main) 
    frameLayout.setVisibility(View.VISIBLE)
     welcomeText.setText("I´m a welcome text!!") 
}
```


总结
---

通过这两个新功能，我们Kotlin 团队真正感兴趣的是让android开发者们可以生活的更加轻松。他们也发布了一个叫做Anko的库，让我们通过Kotlin创建布局。我们有使用其主要功能，但是你在处理View时可以使用它去简化你的代码，我有一些Kotlin项目的例子已经提交到github，你可以看看这些例子或者其他相关资料。

下一个文章将会介绍使用lambda表达式和他们怎样才能帮助我们简化代码。非常有趣，对我来说，Kotlin和java 1.7比较起来将会变的非常有力。
