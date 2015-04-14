Kotlin for Android (III)/ 扩展函数与默认值
---

>
* 原文链接 : [Kotlin for Android (III): Extension functions and default values](http://antonioleiva.com/kotlin-android-extension-functions/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)
* 状态 :  校对完成

现在你已经了解[Kotlin基础](http://antonioleiva.com/kotlin-for-android-introduction/)与[如何配置你的项目](http://antonioleiva.com/kotlin-android-create-project/),是时候谈论Kotlin能为我们做哪些Java做不到的有趣的事情了.请记住,如果你对Kotlin语言有任何疑问,可以参考[官方文档](http://kotlinlang.org/docs/reference/).这份文档条理分明、简单易懂, 而且我这篇文章不会涉及到语言的基础部分.



### 扩展函数

Kotlin的扩展函数功能可以让我们添加新的函数到现有的类上而不必去修改它本身.例如,我们可以轻松的的通过扩展函数语法将一个显示Toast的函数添加到Activity类中:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

我们可以在任意的地方声明这个函数(例如一个工具类文件), 并在我们的Activities中当作一个普通方法使用:

```java
override fun onCreate(savedInstanceState: Bundle?) { 
    super<BaseActivity>.onCreate(savedInstanceState)     
    toast("This is onCreate!!") 
}
```

声明一个扩展函数跟添加类名到函数名上一样简单.这个函数将被作为导入的类使用. 

这可以帮助我们简化代码而且让封闭的类打破局限.但是我们必须小心和适度的使用.最后,这些函数通常会替代工具类.工具方法通常是静态的且不能被修改. 因此,过度使用通常是表示我们懒得创建一个委托类.

这里是另一个有趣的例子,让我解释另一个有趣的概念:具体类型(reified types).

```java
inline public fun <reified T : Activity> Activity.navigate(id: String) { 
    val intent = Intent(this, javaClass<T>())
     intent.putExtra("id", id)
     startActivity(intent) 
}
```

内联函数可以使用具体类型,这意味着我们可以从内部函数取得类而不用通过将类类型作为参数.

> 内联函数的有点不同于一般的函数.内联函数将会在编译过程中替换代码而不是真的调用一个函数. 这会简化某些场景.例如,如果我们将一个函数作为参数,常规函数将在内部创建一个包含该函数de对象,.另一方面,内联函数会在函数被调用的地方替换掉,因此它真的不需要一个内部对象.

  > ```java
 navigate<DetailActivity>("2")
 ```

使用具体类型,我们可以在函数内部创建一个意图, 并使用扩展函数,我们可以直接调用startActivity().



### 可选参数与默认值


由于有参数默认值和构造函数,你永远不需要重载函数了.一个声明可以满足你所有的需求.回到Toast示例:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

第二个参数指的是Toast的持续时长.它是可选参数,在没有指定的情况下,将使用Toast.LENGTH_SHORT作为默认值.现在你有两种方法调用这个函数:

```java
    toast("Short Toast!!")
    toast("Long Toast!!", Toast.LENGTH_LONG)
```

对于第二个示例,我们也许想添加一些转换棒棒糖的参数:

```java
inline public fun <reified T : Activity> Activity.navigate(
         id: String, 
        sharedView: View? = null,
         transitionName: String? = null) {          
    ...
 }
```

我们现在有两种不同的方式调用相同的函数:

```java
navigate<DetailActivity>("2")
navigate<DetailActivity>("2", sharedView, TRANSITION_NAME)
```

甚至是第三种,虽然在大多数情况没什么意义,但是可以帮助我们理解另一种概念:我们可以使用参数名来决定我们想调用哪些参数:

```java
navigate<DetailActivity>(id = "2", transitionName = TRANSITION_NAME)
```

可选参数可以被用于默认构造函数,因此你可以通过一个声明实现许多的重载方法.自定义视图是一个特例, 因为在Java中它们需要多个构造函数才能够正常工作.我将会在下一篇文章讲解到.



## 总结

通过这两个优势,我们可以简化大量的代码甚至可以做那些Java中不可能的事情.Kotlin真的是简洁明了.下一篇文章将会讲解Kotlin的Android拓展,这可以让我们在Activities中自动注入视图,与如何在Kotlin中自定义View.

记得浏览一下[示例库](https://github.com/antoniolg/Bandhook-Kotlin)来看一下它的实际应用.