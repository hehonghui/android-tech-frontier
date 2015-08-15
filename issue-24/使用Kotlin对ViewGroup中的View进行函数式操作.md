使用 Kotlin 对 ViewGroup 中的 View 进行函数式操作
---

> * 原文链接 : [Functional operations over Views in ViewGroup using Kotlin](http://antonioleiva.com/functional-operations-viewgroup-kotlin/)
* 原文作者 : [Antonio](https://plus.google.com/+AntonioLeivaGordillo)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :   校对中



Collections, iterators, arrays, sequences… all share a good set of useful functions that help do transformations, sortings and other kind of operations over their items. But there are parts in Android SDK where this is not available due to the way the classes are constructed.

For instance, we can’t directly get a list of the views inside a ViewGroup, so these kind of operations are not possible. But not everything is lost. In Kotlin, we have a way to prepare any kind of data to work with these operations. The trick is easy: we just need to create a Sequence. In our case, the sequence will be a set of Views in sequential order. We just need to implement its single function, which returns an Iterator.

If we have a Sequence, the world of functional operations is open for us to use them. So let’s start with that.

>Note: Read till the end of the article
>As lakedaemon666 suggests in comments,
>there’s an easier way to get the same result without using a sequence.
>I’ll leave the original text for the record, but I suggest you to take a look to the alternative solution.



Collections, iterators, arrays, sequences...都对 **转换，排序或者其他对 item
的操作** 提供了完整的支持。不过由于这些类在 Android 中被构造的方式不同，
某些部分在 Android SDK 中使不能使用的。

比如，我们只能获取一个 ViewGroup 而不能直接获得一个 View 的 list，像这样的操作
是不可以的。但是我们还可以使用其他的特性。使用 Kotlin，我们可以 **使用这些操作
准备任何类型的数据**。这个窍门很容易:我们只需创建一个 **Sequence**。
在我们的例子中，sequence 是一组按顺序排列的 View 集合。我们只需要去
**实现一个返回 Iterator 的函数**。

假设我们有一个 **Sequence**，函数世界的大门已经为我们打开。那么让我们开始吧。

>**Note: 请看文章结尾部分**
>
> `lakedaemon666` 在评论里提到了一种更简单的方式获取相同的结果，而且不必使用
>  Sequence 。原文这里不会修改，不过我建议你去看一看他的解决办法。

---

##Creating a Sequence from a ViewGroup
As mentioned before, we’ll create an iterator, which must know if there is a next item, and which one it is. We can create an extension function, which will be available for any ViewGroup and descendant classes A simple way to do that:

##从 ViewGroup 中创建一个 Sequence

前面提到了，我们想创建一个 iterator，而且需要知道它是否有下一个 item，
下一个 item 是什么。可以通过创建一个 **extension function**(扩展函数)，
为所有 ViewGroup 和它的子类提供一个简单的方式完成这项工作:

```kotlin
fun ViewGroup.asSequence(): Sequence<View> = object : Sequence<View> {

    override fun iterator(): Iterator<View> = object : Iterator<View> {
        private var nextValue: View? = null
        private var done = false
        private var position: Int = 0

        override public fun hasNext(): Boolean {
            if (nextValue == null && !done) {
                nextValue = getChildAt(position)
                position++
                if (nextValue == null) done = true
            }
            return nextValue != null
        }

        override fun next(): View {
            if (!hasNext()) {
                throw NoSuchElementException()
            }
            val answer = nextValue
            nextValue = null
            return answer!!
        }
    }
}
```

---

##Retrieving a recursive list of views
It’d be very useful to have a list of views we can apply functions to. So we
could first create a list of the Views in the first level, and then use it to
retrieve the views inside the rest of ViewGroups inside the parent in a recursive way.
Let’s create a new extension property for ViewGroup. An extension property
is very similar to an extension function,and can be applied to any class:

##检索 View 的递归 list

获取一个 view 的list 对其进行函数操作的 。我们首先创建一个所有一级 view 的 list，
然后使用它们去遍历搜索 ViewGroups 里的其它 view。需要给 ViewGroup 新建一个
 **extension property** (扩展属性)。extension property 和
[extension function][extension-functions] 很像，可以被添加到任意一个 class 里:

```kotlin
public val ViewGroup.views: List<View>
    get() = asSequence().toList()
```

With this, we could create a recursive function that returns all the Views inside any ViewGroup in the layout:
接下来，创建一个递归函数返回 layout 中每个 ViewGroup 里的所有 view。

```kotlin
public val ViewGroup.viewsRecursive: List<View>
    get() = views flatMap {
        when (it) {
            is ViewGroup -> it.viewsRecursive
            else -> listOf(it)
        }
    }
```

With flatMap, we convert all the multiple lists from every result into one single list.
It will iterate over any view, and if it’s a ViewGroup, it will ask for its own views.
Otherwise, it’ll return a list with a single item.

使用 **flatap** 操作将所有结果中的多个 list 转换成单个的 list。
它会遍历所有 view，返回仅有一个 item 的 list，
如果遍历的对象是一个 **ViewGroup**，就会请求获取 ViewGroup 内的 view。

##Usage examples
##用例

Now we can get the viewsRecursive property to perform any operation we can think of.
Here you can see a couple of examples. I created a simple layout that looks like this:

现在我们可以对 viewsRecursive 属性执行我们想要的操作了。这里有两个例子,
我创建了下面这样的一个 layout:

![img](http://antonioleiva.com/wp-content/uploads/2015/07/views-from-viewgroup-e1437489098403.png)

```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
                xmlns:tools="http://schemas.android.com/tools"
                android:id="@+id/container"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:paddingBottom="@dimen/activity_vertical_margin"
                android:paddingLeft="@dimen/activity_horizontal_margin"
                android:paddingRight="@dimen/activity_horizontal_margin"
                android:paddingTop="@dimen/activity_vertical_margin"
                tools:context=".MainActivity">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/hello_world"/>

    <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hello Java"/>

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center_horizontal"
            android:text="Hello Kotlin"/>

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="end"
            android:text="Hello Scala"/>

    </FrameLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:orientation="horizontal">

        <CheckBox
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Check 1"/>

        <CheckBox
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Check 2"/>

        <CheckBox
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Check 3"/>

        <CheckBox
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Check 4"/>

    </LinearLayout>

</RelativeLayout>
```

---

This is the code that, for instance, can be applied in MainActivity.onCreate(). It will convert the Hello Kotlin! string to uppercase, and the even checkboxes to checked:

下面是代码部分，可以在  MainActivity.onCreate() 执行。它把 `Hello Kotlin`
字符串转换成大写，然后还设置了 Checkox 的点击事件:



```kotlin
val container: ViewGroup = find(R.id.container)
val views = container.viewsRecursive

// Set Kotlin TextView to Upper
val kotlinText = views.first {
    it is TextView && it.text.toString().contains("Kotlin")
} as TextView
kotlinText.text = kotlinText.text.toString().toUpperCase()

// Set even checkboxes as checked, and odd as unchecked
views filter {
    it is CheckBox
} forEach {
    with(it as CheckBox) {
        val number = text.toString().removePrefix("Check ").toInt()
        setChecked(number % 2 == 0)
    }
}
```

![img](http://antonioleiva.com/wp-content/uploads/2015/07/views-modified-e1437489038699.png)

##Alternative solution
As lakedaemon666 mentions in comments (thanks for the explanation), there’s no much sense in creating a sequence if we are iterating over the whole sequence right after that. Sequences are meant for lazy iteration, for instance, when reading the lines of a file. Only the necessary items will be requested. However, in this situation we are using all of them, so a plain list will be enough.

Besides, there’s a much easier way to create a list of views. We can rely on ranges to generate a list of the indexes of the views and map them to the list of views we need. Everything in just one line:

##另一种思路
lakedaemon666 在评论中提到(感谢回复)，创建并遍历一个 sequence 没有什么意义。
Sequences 意味着 lazy iteration，比如，当读取 file 里的某一行时，只有需要的
item 被请求。而在我们设定的场景中，所有 item 都被使用了，所以一个普通的 list
就可以满足我们的需求。

此外，还有更简单的方法创建一个 view 的 list。

```kotlin
public val ViewGroup.views: List<View>
    get() = (0..getChildCount() - 1) map { getChildAt(it) }
```

---

##Conclusion
##结语

This is a silly example, but with this idea you’ll probably be able to make all
your code more functional, and stop depending on loops and other flow controls
 which are more typical from iterative programming.

And remember you can learn this and many other things about Kotlin in the book
 I’m writing: [Kotlin for Android Developers][kotlin-for-android-developers],
 where you will learn Kotlin by creating an Android App from the ground up.

这个例子看起来可能有点傻，不过你可以从中学到些东西让你的代码更加函数化，
而不是循环或者其他更典型的迭代编程中的流程控制。

你可以通过我正在写的这本书: [Kotlin for Android Developers][kotlin-for-android-developers]
来了解更多关于 Kotlin 的内容，这本书会教你从零开始使用 Kotlin 来完成一个 Android App。


[kotlin-for-android-developers]:https://leanpub.com/kotlin-for-android-developers/
[extension-functions]:http://antonioleiva.com/kotlin-android-extension-functions/
