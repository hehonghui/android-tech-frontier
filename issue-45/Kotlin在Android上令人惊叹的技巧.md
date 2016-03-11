# Kotlin awesome tricks for Android
# Kotlin在Android上令人惊叹的技巧

> * 原文链接 : [Kotlin awesome tricks for Android](http://antonioleiva.com/kotlin-awesome-tricks-for-android/)
* 原文作者 : [Antonio Leiva](http://antonioleiva.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [shenyansycn](https://github.com/shenyansycn) 
* 校对者: 
* 状态 :  翻译中

![](http://i1.wp.com/antonioleiva.com/wp-content/uploads/2016/02/kotlin_featured.jpg?zoom=2&resize=795%2C185)

I’ve been talking a lot about [Kotlin in this blog](http://antonioleiva.com/kotlin), but now that [Google is also talking about Kotlin](https://medium.com/google-developers/kotlin-android-a-brass-tacks-experiment-part-1-3e5028491bcc#.kohpnch41), and that [Kotlin 1.0 RC has been released](http://blog.jetbrains.com/kotlin/2016/02/kotlin-1-0-release-candidate-is-out/), there’s no doubt that Kotlin is much more than just an alternative for Android. Kotlin is here to stay, and I recommend you to start learning about it.

我已经在这个[Blog](http://antonioleiva.com/kotlin)里讨论了很多Kotlin了，现在[Google](https://medium.com/google-developers/kotlin-android-a-brass-tacks-experiment-part-1-3e5028491bcc#.kohpnch41)也正在讨论Kotlin，[Kotlin 1.0 RC](http://blog.jetbrains.com/kotlin/2016/02/kotlin-1-0-release-candidate-is-out/) 已经发布了，毫无疑问，Kotlin不仅仅是Android的一个替代选择。Kotlin就在这里，我推荐你开始学习它。

## Where do I start learning Kotlin for Android?
## 在Android上我从哪里开始学习Kotlin？

There is already a lot of information, but if you want to really focus and learn fast, I recommend you these sources:

这里已经有一些信息了，但是如果你想要真正的关注和快速学习，我推荐你这些资源：

- [Kotlin reference](http://kotlinlang.org/docs/reference/): It’s the best place you can go if you want to dive into all the details regarding the language. One of the nicest references about a language I know.
- [Kotlin reference](http://kotlinlang.org/docs/reference/)：如果你想深入了解这个语言的细节，这里是你能找到的最好的地方。我所知道关于这个语言的最好参考文献之一。

- [This blog](http://antonioleiva.com/kotlin): previous link send you to a place where I compile all the articles that talk about Kotlin. You shouldn’t miss it, there are articles for beginners and medium levels.
- [This blog](http://antonioleiva.com/kotlin)：这个链接是我整理的所有关于Kotlin的文章的地方。你不应该错过它，文章属于初级和中级。

- [**Kotlin for Android Developers, The book**](http://antonioleiva.com/kotlin-android-developers-book/): The best way if you want to learn fast and learn it forever. If you already know about Android, this will be a fast track to use Kotlin in your projects. I’ve been working on it for a long time and updating it after new releases. It’s up to date with Kotlin 1.0 RC. Besides if you [subscribe to the list](http://antonioleiva.com/kotlin-android-developers-book/), you’ll receive **5 first chapters for free and a discount at the end of the free ebook**.
- [**Kotlin for Android Developers, The book**](http://antonioleiva.com/kotlin-android-developers-book/)：如果你想快速和持续的学习，这本书是最好的方法。如果你已经了解了Andriod，这将是一个在你的项目中使用kotlin的快速途径。我已经编写很长一段时间了，当新版本发布的时候我就会更新它。已经更新到了Kotlin 1.0 RC。除此之外如果你[订阅了这个列表](http://antonioleiva.com/kotlin-android-developers-book/)，你将收到**免费的头5个章节和这本书末尾显示的一个购买折扣**。


## Show me the tricks!
## 展示这个技巧

I’ve been talking a lot about Kotlin before in this blog, but this is a compilation of things that Kotlin can do for you to simplify Android code. This will be a set of independent examples in no particular order.

在我要讲解之前，有一个要说明的是Kotlin能给你带来简化的Android代码。这里有一组没有特定顺序的独立的例子。

### Click listeners are clean and fun to write
### 简洁和趣味的编写点击监听事件

The lack of lambdas in Java 7 is the reason why listeners and callbacks are so awful to write. Kotlin has beautiful lambdas and a **nice compatibility with Java libraries**. So it’s able to map interfaces with one method into a lambda. You can just do:

Java 7上编写监听和回调事件非常繁琐的原因是缺少了lambdas。Kotlin有非常好的lambdas和**与Java库有非常好的兼容性**。用lambda一个方法即可映射接口。你可以这么做：

```java
myButton.setOnClickListener { navigateToDetail() }
```

And that’s all.
这就是所有。

### Why are layouts so difficult to inflate? Not anymore!
### 为什么layout要如此麻烦的inflate？再也不是了！


When you are in a adapter for instance, and you need to inflate a layout, this is the code you will have to write:
当你在Adapter中实例化时，你需要inflate一个layout，你会这样写：

```java
LayoutInflater.from(parent.getContext()).inflate(R.id.my_layout, parent, false);
```
Why parent can’t just inflate its own layouts? Well, with Kotlin you can. You can create an extension function that will do it for you:
为什么父类不能inflate它自己的layout？好了，用Kotlin你可以。可以创建一个扩展的方法为你所用：

```
fun ViewGroup.inflate(@LayoutRes layoutRes: Int, attachToRoot: Boolean = false): View {
    return LayoutInflater.from(context).inflate(layoutRes, this, attachToRoot)
}
```
`ViewGroup` now has a new `inflate` function that will receive a layout resource and an optional `attachToRoot`. With default values you can create several versions of the same function without the need of overloading the function. You can now do:
`ViewGroup`现在有了一个新的`inflate`方法，接受参数是一个layout资源和可选的`attachToRoot`。通过传入不同的值，你可以创建同一个函数的很多不同版本，但不需要重载函数。现在可以这么做：

```
parent.inflate(R.layout.my_layout)
parent.inflate(R.layout.my_layout, true)
```
### ImageView, load your image!
### ImageView, 加载图片!

`ImageView` can’t directly load images from network. We have some libraries that create custom views, such as `NetworkImageView`, but this forces you to use inheritance, which can lead you to problems at some point. Now that we know we can add functions to any class, why not doing it that way?

`ImageView`不能直接从网络上加载图片。我们有一些创建自定义view的库，比如：`NetworkImageView`，但这要求你使用继承，有时这会导致问题。现在我们知道我们可以在任何类上添加函数了，为什么不这样做呢？

```
fun ImageView.loadUrl(url: String) {
    Picasso.with(context).load(url).into(this)
}
```
You can use the library you want inside this function. But magic is in the function itself. You now have a super-powered `ImageView`:

现在你可以使用这个函数了，但神奇的是这个函数的本身。你现在有超级类`ImageView`：


```
imageView.loadUrl("http://....")
```
Nice.
很好。

### Menu switches are so ugly… Not anymore!
### 令人厌恶的菜单switches...再也不了！

When overriding `onOptionsItemSelected`, we’ll usually create a `switch` with a good set of branches that always have to return true, but the last one that calls super. If there are drawer options among these actions, its even worse, because you also have to close the drawer. An alternative (just to show you what you can do, not saying it’s the best solution) could be to create extension functions that do those things for you.

当重写`onOptionsItemSelected`时，我们通常创建一个设置好分支的`switch`，一般都返回true，最后都调用super。如果在这些action中有drawer设置，这是很糟糕的，因为你还要关闭这个drawer。一个可替代的方案（仅说明你能做什么，不是说这是最好的解决方案）是可以创建一个扩展的方法来做这些事情。

First, we can create a `consume` function, which means that it’s consuming the event (returning true), and receives a lambda that will do the work we want to do for that branch. The same can be done for the drawer. If it consumes the event, it means that we are closing the drawer after the action is clicked:

首先，我们创建一个`consume`方法，意思是处理了这个event（返回true），接收一个lambda做我们分支要做的工作。对于drawer也一样可以这么做。

```
override fun onOptionsItemSelected(item: MenuItem) = when (item.itemId) {
    R.id.action_settings -> consume { navigateToSettings() }
    R.id.nav_camera -> drawer.consume { navigateToCamera() }
    R.id.nav_gallery -> drawer.consume { loadGallery() }
    R.id.nav_slideshow -> drawer.consume { loadSlideshow() }
    else -> super.onOptionsItemSelected(item)
}
```
How these functions look?

这些方法看起来是如何的？

```
inline fun consume(f: () -> Unit): Boolean {
    f()
    return true
}
```
And very similar for the drawer:

对于drawer也类似：

```
inline fun DrawerLayout.consume(f: () -> Unit): Boolean {
    f()
    closeDrawers()
    return true
}
```
The good thing is that these functions are `inline`, which means that the function is substituted by the code of the function in compilation time, so it’s as efficient as writing the code directly into the place of the call.

好消息是这些函数是`内联的`，意思是编译时这个方法会被方法的代码替代，所以在调用的地方编写代码是高效的。

### Snacks are like toasts… but uglier
### Snacks和toasts很像… 但更不好用

The code to show a snack from the design support library is even uglier than toasts. But we can do it better in Kotlin. We can achieve something like this:

这个代码显示了来自design support library的snack比toasts更不好用。但在Kotlin中我们可以做的更好。可以像下边这样写：

```
view.snack("This is my snack")
view.snack("This snack is short", Snackbar.LENGTH_SHORT) 
```
And what if we have an action? No worries, Kotlin to the rescue:
如果我们有一个action怎么办？别急，Kotlin这样解决：


```
view.snack("Snack message") {
    action("Action") { toast("Action clicked") }
}
```
We can create small DSLs for anything that bothers us. What we need?

我们可以为了被困扰任何事情创建小的DSLs。我们需要什么？

```
inline fun View.snack(message: String, length: Int = Snackbar.LENGTH_LONG, f: Snackbar.() -> Unit) {
    val snack = Snackbar.make(this, message, length)
    snack.f()
    snack.show()
}
```
This first function creates the snackbar, makes the snackbar execute the extension function we are providing, and then shows itself.

第一个方法是创建snackbar，让这个snackbar之行我们提供的扩展方法，并显示自己。

That function will create the Snackbar action. This is how the action function looks:

这个方法会创建Snackbar action。这个action方法看起来是这样的：

```
fun Snackbar.action(action: String, color: Int? = null, listener: (View) -> Unit) {
    setAction(action, listener)
    color?.let { setActionTextColor(color) }
}
```
You can even specify a color for the text of the action. If you don’t, the default value is null, and the last line decides what to do. Don’t you love this last line?

你甚至可以指定这个action的文字的颜色。如果你没有设置，默认值是null，最后一行代码决定如何做。你不喜欢最后一行代码？

```
color?.let { setActionTextColor(color) }
```
The code inside `let` will only be executed if `color` is not null.
 `let`内的代码只有`color`不为空的时候才会被执行。

### I don’t have the context right now… but who cares?
### 现在我没有context...但谁关心呢？

In Java, when we are for instance finding a view, we have to wait until the layout of the activity is inflated until you can assign a value to a field.

在Java中，例如当我们查找一个view时，我们必须等到activity的布局文件加载完毕才能赋值给一个变量。

And the same happens to the context. If an object is depending on the context, you need to declare the field at the beginning of the class, and then assign a value during `onCreate`.

同样的也发生在context身上。如果一个object依赖context，你需要在class开始的地方声明它，然后在`onCreate`时候赋值。

With Kotlin delegation, you can just delegate the value to the `lazy` delegate, and the code won’t be executed until the property is first used:

用Kotlin委托，你仅需要委托一个值给`lazy`委托，当第一次被使用的时候才会执行：

```
override val toolbar by lazy { find<Toolbar>(R.id.toolbar) }
override val dataBase by lazy { DataBase(this) }
 
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_detail)
    setSupportActionBar(toolbar)
    dataBase.loadWhatever()
}
```
The `find` function belongs to [Anko](https://github.com/Kotlin/anko) library. But you can do something similar quite easy:

`find`方法属于[Anko](https://github.com/Kotlin/anko)库。但你可以更容易的做类似的事情：

```
inline fun <reified T : View> Activity.find(id: Int): T = findViewById(id) as T
```
### More lambdas, more beautiness
### 更多的lambdas，更美丽
In Java we need to create objets for everything. A good example is `postDelayed`, where you need to create a complete `Runnable`. Kotlin interoperability just requires a lambda, and it’s much nicer and readable:

在Java中所有的事情都要创建对象。一个例子就是在创建一个完整的`Runnable`时的`postDelayed`。Kotlin的interoperability仅需要创建一个lambda，它的可读性好很多：

```
view.postDelayed({ doWhatever() }, 200)
```
And what if you want to create a thread that runs something?

如果你想创建一个线程并运行一些东西该怎么做呢？

```
Thread().run { 
    // Running in a thread    
}
```
### “I hate AsyncTasks!!”. Well, then don’t use them
### “我恨AsyncTasks！！”。好了，那么就不用它们

Thanks to [Anko](https://github.com/Kotlin/anko) library, we also have a small DSL to deal with background tasks.

感谢[Anko](https://github.com/Kotlin/anko)库，我们有一个小的DSL来处理后台线程任务。


```
async() {
    // Do something in a secondary thread
    uiThread {
        // Back to the main thread
    }
}
```
It is also context aware, so if it’s called inside an activity, the `uiThread` part won’t be called if the activity is finishing.

它也是上下文感知的，所以如果它在antivity中被调用，如果activity关闭了，`uiThread` 也就不会被调用了。

### Why is dealing with collections so difficult? Not anymore
### 为什么处理集合是如此的困难？不再是了

The short answer is the lack of lambdas and functional operations. But Kotlin can work with them, so sorting, transforming, mapping or filtering are just a function call away.

简单的回答就是缺少lambdas和功能操作。但Kotlin可以利用它们来工作，所以排序、转换、映射和过滤只是一个函数的调用。

```
return parsedContacts.filter { it.name != null && it.image != null }
        .sortedBy { it.name }
        .map { Contact(it.id, it.name!!, it.image!!) }
```
You can check a [complete list of operations](http://antonioleiva.com/collection-operations-kotlin/) for collections
对于集合，你可以查看[complete list of operations](http://antonioleiva.com/collection-operations-kotlin/)。

### Operator overloading: let your imagination fly
### 操作重载：让你的想象力飞翔


Who said you can’t access to the views in a `ViewGroup` as if it was an array? Wouldn’t it be nice? But it must be difficult… of course not. You just need to create an extension function that acts [as an operator](http://antonioleiva.com/operator-overloading-kotlin/).
谁说你不能像访问一个数组一样的访问`ViewGroup`中的view？这是不是很好？但一定很困难...当然不。你只需要用acts [as an operator](http://antonioleiva.com/operator-overloading-kotlin/).创建一个扩展方法。


```
operator fun ViewGroup.get(pos: Int): View = getChildAt(pos)
```
You can now do:
现在你可以这样做：

```
val view = viewGroup[2]
```
You could even create an extension property that returns a list of the views:

你甚至可以创建一个返回view列表的扩展属性：

```
val ViewGroup.views: List<View>
    get() = (0 until childCount).map { getChildAt(it) }
```
Now you have a direct access to the views:
现在你可以直接访问view：

```
val views = viewGroup.views
```
### Fed up with so many getters, setters, toString(), equals()…?
### 厌倦了这么多的getters, setters, toString(), equals()…?
Data classes in Kotlin give all this for you.
Kotlin中的数据类给你提供了这些所有。

```
data class Person(val name: String, val surname: String, val age: Int) 
```
We’re done here.
我们在这里做。

### Starting activities the easy way
### 简单的方法启动activity

Anko also provides some nice functions to navigate to other activity without the need of creating an intent, adding the extras, calling the function… Everything can be done in a single line:

Anko也提供了一些好的方法可以不用创建intent、添加extras、调用方法...来启动另一个activity，所有的事情都可以用单独的一行代码做到：

```
startActivity<DetailActivity>("id" to 2, "name" to "Kotlin")
```
This will create a set of extras for the intent with the values specified by the list of pairs the function is receiving as a parameter.

这回创建一个带有extras的intent，extras的值是该方法接收的一对列表参数值定义的。

### Android Extensions, or how to forget about findViewById
### Android扩展，或者如何忘记findViewById

With Kotlin Android Extension, just by adding a specific import, the plugin will be able to create a set of properties for an activity, a fragment, or even a view, so that you don’t have to worry about declaring or finding those views. The name of the properties will be the ones defined in the XML you are importing. So for instance, in a `RecyclerView` adapter, you could do this in the `ViewHolder`:

使用Kotlin的Android扩展，仅需要添加一个专门的import，插件将会给activity、fragment甚至一个view创建一组参数设置，因此你不必担心去申明或找到这些view。参数的名称将在导入的XML文件中定义。例如，在`RecyclerView` adapter里，`ViewHolder`里你可以这么做：

```
import kotlinx.android.synthetic.main.item_contact.view.*
 
...
 
fun bindContact(contact: Contact) {
    itemView.name.text = contact.name
    itemView.avatar.loadUrl(contact.image)
    itemView.setOnClickListener { listener(contact) }
}
```
But this can be cleaner. If you’re using the same variable several times, you can use some functions from the standard library, such as `apply`:

也可以更简洁。如果你多次使用同一个变量，你可以用标准库中的一些方法，例如`apply`：

```
fun bindContact(contact: Contact) = itemView.apply {
    name.text = contact.name
    avatar.loadUrl(contact.image)
    setOnClickListener { listener(contact) }
}
```
### Shut up and take my money!
### 这个东西太好了，太值了！
This is a sneak peek of what Kotlin can do for you. Many of these things are just a syntactic sugar that improves readiness, helps write cleaner code, avoids boilerplate and, the most important thing, makes you feel like a ninja.

偷偷的看下Kotlin能为你做什么。很多事情仅是一个提高速度、帮助编写更清晰的代码，避免模版的语法糖果，最重要的是，让你感觉好像一个忍者。

Kotlin has many other awesome features you’d love to learn. The language is really fun and creative, it’s pragmatic (just a small set of incredible features) and it’s totally integrated with Android development.

Kotlin有许多你想学习的更惊叹的特性。这个语言真的是很有乐趣并富有创造力的，它注重实效（仅是一组不可思议的功能）并且完全集成了Android开发。

So I recommend you to [take a look at the book](http://antonioleiva.com/kotlin-android-developers-book/) and get it now.

我推荐你去看一本[书](http://antonioleiva.com/kotlin-android-developers-book/)，现在就获得他吧。

