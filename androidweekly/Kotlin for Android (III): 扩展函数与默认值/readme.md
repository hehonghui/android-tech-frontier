>
* 原文标题 : Kotlin for Android (III): Extension functions and default values
* 原文链接 : [http://antonioleiva.com/kotlin-android-extension-functions/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: 
* 状态 :  未完成

Now that you know the [basics about Kotlin](http://antonioleiva.com/kotlin-for-android-introduction/) and [how to configure your project](http://antonioleiva.com/kotlin-android-create-project/), it´s time to talk about some interesting things that Kotlin can do for us and Java can´t. Remember that if you have some doubts about Kotlin language, you can always refer to the [official reference](http://kotlinlang.org/docs/reference/). It´s very well organized and easy to understand, and I won´t be covering basic language stuff on this articles.

现在你已经知道[Kotlin基础](http://antonioleiva.com/kotlin-for-android-introduction/)与[如何配置你的项目](http://antonioleiva.com/kotlin-android-create-project/),是时候谈论Kotlin能为我们做哪些Java做不到的有趣的事情了.请记住,如果你对Kotlin语言有任何疑问时,可以参考[官方文档](http://kotlinlang.org/docs/reference/).这份文档条理分明、简单易懂, 而且我这篇文章不会涉及到语言的基础部分.



### Extension functions

### 扩展函数

Kotlin extension functions will let us add new functions to existing classes that wouldn´t be able to be modified otherwise. We can, for instance, add a new method to an activity that let us show a toast in a much more simple nomenclature:

Kotlin的扩展函数功能可以让我们添加新的函数到现有的类上而不必去修改它本身.例如,我们可以通过一个简单的语法添加一个新方法到Activity上来显示一个Toast:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

We can declare this function anywhere (an utils file for instance), and use it in our activities as a regular method:

我们可以在任意的地方声明这个函数(例如一个工具类文件), 并在我们的Activities中作为一个普通方法使用:

```java
override fun onCreate(savedInstanceState: Bundle?) { 
    super<BaseActivity>.onCreate(savedInstanceState)     
    toast("This is onCreate!!") 
}
```

Declaring an extension function is as easy as adding the class name to the name of the function. The function will be added as an import to the class where it´s used.

声明一个扩展函数跟添加类名到函数名上一样简单.这个函数将被作为导入的类使用. 

It can help us simplify our code and push closed classes beyond their limits. But we must be careful and not overuse them. In the end, these functions will usually substitute util classes. Utility methods are static and can´t be mocked, so the overuse is usually an indicative that we feel too lazy to create a delegate class.

这可以帮助我们简化代码而且让封闭的类打破局限.但是我们必须小心和适度的使用.最后,这些函数通常会替代工具类.工具方法通常是静态的且不能被修改. 因此,过度使用通常是表示我们懒得创建一个委托类.

Here it is another interesting example that will let me explain another interesting concept: reified types.

这里是另一个有趣的例子,让我解释另一个有趣的概念:具体化泛型.

```java
inline public fun <reified T : Activity> Activity.navigate(id: String) { 
    val intent = Intent(this, javaClass<T>())
     intent.putExtra("id", id)
     startActivity(intent) 
}
```

Inline functions can use `reified types`, what means that we can recover the class from a type inside the function instead of having to pass the class type as an argument.

内联函数可以使用具体化泛型,这意味着我们可以从内部函数取得类而不用通过将类类型作为参数.

> `Inline functions` are a bit different from regular functions. Inline functions will be substituted with its code during compilation, instead of really calling to a function. It will simplify some situations. For instance, if we have a function as an argument, a regular function will internally create an object that contains that function. On the other hand, inline functions will substitute the code of the function in the place where its called, so it won´t require an internal object for that.

> 内联函数的有点不同于一般的函数.内联函数将会在编译过程中替换代码而不是真的调用一个函数. 这会简化某些场景.例如,如果我们将一个函数作为参数,常规函数将在内部创建一个包含该函数de对象,.另一方面,内联函数会在函数被调用的地方替换掉,因此它真的不需要一个内部对象.

  > ```java
 navigate<DetailActivity>("2")
 ```

Using a reified type, we can create the intent inside of a function, and using an extension function, we can call startActivity() directly.

使用具体化泛型,我们可以在函数内部创建一个意图, 并使用扩展函数,我们可以直接调用startActivity().

### Optional parameters and default values

### 可选参数与默认值

Thanks to default values on arguments and constructors, you´ll never need to overload a function anymore. One declaration can meet all your requirements. Back to the toast example:

由于有参数默认值和构造函数,你永远不需要重载函数了.一个声明可以满足你所有的需求.回到Toast示例:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

The second argument refers to the toast duration. It´s an optional parameter that, in case of not being specified, will use Toast.LENGTH_SHORT. Now you have two ways to call this function:

第二个参数指的是Toast的持续时长.它是可选参数,在没有指定的情况下,将使用Toast.LENGTH_SHORT作为默认值.现在你有两种方法调用这个函数:

```java
    toast("Short Toast!!")
    toast("Long Toast!!", Toast.LENGTH_LONG)
```

Regarding the second example, we could want to add some arguments for lollipop transitions:

对于第二个示例,我们也许想添加一些转换棒棒糖的参数:

```java
inline public fun <reified T : Activity> Activity.navigate(
         id: String, 
        sharedView: View? = null,
         transitionName: String? = null) {          
    ...
 }
```

We now have two different ways to call the same function:

我们现在有两种不同的方式调用相同的函数:

```java
navigate<DetailActivity>("2")
navigate<DetailActivity>("2", sharedView, TRANSITION_NAME)
```

And even a third, that wouldn´t make much sense in this situation, but helps us understand another concept: we can use parameter names to decide which parameters we want to call:

甚至是第三种,虽然在大多数情况没什么意义,但是可以帮助我们理解另一种概念:我们可以使用参数名来决定我们想调用哪些参数:

```java
navigate<DetailActivity>(id = "2", transitionName = TRANSITION_NAME)
```

Optional parameters can also be used in the default constructor, so you could get many overloads in a single declaration. Custom views are a special case, because they need more than one constructor to work properly in Java, but I´ll be covering this in next article.

可选参数可以被用于默认构造函数,因此你可以通过一个声明实现许多的重载方法.自定义视图是一个特例, 因为在Java中它们需要多个构造函数才能够正常工作.我将会在下一篇文章讲解到.



### Conclusion

### 总结

With these two ideas, we can save a lot of code and even do things that are impossible in Java. Kotlin is really expressive and concise. Next article will cover Kotlin Android Extensions, which let us inject views automatically in our activities, and how to create custom views in Kotlin.

通过这两个优势,我们可以简化大量的代码甚至可以做那些Java中不可能的事情.Kotlin真的是简洁明了.下一篇文章将会讲解Kotlin的Android拓展,这可以让我们在Activities中自动注入视图,与如何在Kotlin中自定义View.

Remember taking a look to the [example repository](https://github.com/antoniolg/Bandhook-Kotlin) to see it in action.

记得浏览一下[示例库](https://github.com/antoniolg/Bandhook-Kotlin)来看一下它的实际应用.