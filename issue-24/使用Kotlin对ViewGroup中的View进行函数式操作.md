使用 Kotlin 对 ViewGroup 中的 View 进行函数式操作
---

> * 原文链接 : [Functional operations over Views in ViewGroup using Kotlin](http://antonioleiva.com/functional-operations-viewgroup-kotlin/)
* 原文作者 : [Antonio](https://plus.google.com/+AntonioLeivaGordillo)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)
* 状态 :  完成


Collections, iterators, arrays, sequences...都对 **转换，排序或者其他对 item
的操作** 提供了完整的支持。不过由于这些类在 Android 中被构造的方式不同，
某些部分在 Android SDK 中使不能使用的。

比如，我们只能获取一个 ViewGroup 而不能直接获得一个 View 的 list，像这样的操作
是不可以的。但是我们还可以使用其他的特性。使用 Kotlin，我们可以 **使用这些操作
准备任何类型的数据**。这个窍门很容易:我们只需创建一个 **Sequence**。
在我们的例子中，sequence 是一组按顺序排列的 View 集合。我们只需要去
**实现一个返回 Iterator 的函数**。

假设我们有一个 **Sequence**，函数世界的大门就已经为我们打开。那么让我们开始吧。

>**Note: 请看文章结尾部分**
>
> `lakedaemon666` 在评论里提到了一种更简单的方式获取相同的结果，而且不必使用
>  Sequence 。原文这里不会修改，不过我建议你去看一看他的解决办法。

---

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

##检索 View 的递归 list

获取一个 view 的list 对其进行函数操作的 。我们首先创建一个所有一级 view 的 list，
然后使用它们去遍历搜索 ViewGroups 里的其它 view。需要给 ViewGroup 新建一个
 **extension property** (扩展属性)。extension property 和
[extension function][extension-functions] 很像，可以被添加到任意一个 class 里:

```kotlin
public val ViewGroup.views: List<View>
    get() = asSequence().toList()
```

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


使用 **flatap** 操作将所有结果中的多个 list 转换成单个的 list。
它会遍历所有 view，返回仅有一个 item 的 list，
如果遍历的对象是一个 **ViewGroup**，就会请求获取 ViewGroup 内的 view。

##用例


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


##结语

这个例子看起来可能有点傻，不过你可以从中学到些东西让你的代码更加函数化，
而不是循环或者其他更典型的迭代编程中的流程控制。

你可以通过我正在写的这本书: [Kotlin for Android Developers][kotlin-for-android-developers]
来了解更多关于 Kotlin 的内容，这本书会教你从零开始使用 Kotlin 来完成一个 Android App。


[kotlin-for-android-developers]:https://leanpub.com/kotlin-for-android-developers/
[extension-functions]:http://antonioleiva.com/kotlin-android-extension-functions/
