>
* 原文标题 : Kotlin for Android (III): Extension functions and default values
* 原文链接 : [http://antonioleiva.com/kotlin-android-extension-functions/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: 
* 状态 :  未完成

Now that you know the [basics about Kotlin](http://antonioleiva.com/kotlin-for-android-introduction/) and [how to configure your project](http://antonioleiva.com/kotlin-android-create-project/), it´s time to talk about some interesting things that Kotlin can do for us and Java can´t. Remember that if you have some doubts about Kotlin language, you can always refer to the [official reference](http://kotlinlang.org/docs/reference/). It´s very well organized and easy to understand, and I won´t be covering basic language stuff on this articles.



### Extension functions

Kotlin extension functions will let us add new functions to existing classes that wouldn´t be able to be modified otherwise. We can, for instance, add a new method to an activity that let us show a toast in a much more simple nomenclature:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

We can declare this function anywhere (an utils file for instance), and use it in our activities as a regular method:

```java
override fun onCreate(savedInstanceState: Bundle?) { 
    super<BaseActivity>.onCreate(savedInstanceState)     
    toast("This is onCreate!!") 
}
```

Declaring an extension function is as easy as adding the class name to the name of the function. The function will be added as an import to the class where it´s used.

It can help us simplify our code and push closed classes beyond their limits. But we must be careful and not overuse them. In the end, these functions will usually substitute util classes. Utility methods are static and can´t be mocked, so the overuse is usually an indicative that we feel too lazy to create a delegate class.

Here it is another interesting example that will let me explain another interesting concept: reified types.

```java
inline public fun <reified T : Activity> Activity.navigate(id: String) { 
    val intent = Intent(this, javaClass<T>())
     intent.putExtra("id", id)
     startActivity(intent) 
}
```

Inline functions can use `reified types`, what means that we can recover the class from a type inside the function instead of having to pass the class type as an argument.

> `Inline functions` are a bit different from regular functions. Inline functions will be substituted with its code during compilation, instead of really calling to a function. It will simplify some situations. For instance, if we have a function as an argument, a regular function will internally create an object that contains that function. On the other hand, inline functions will substitute the code of the function in the place where its called, so it won´t require an internal object for that.


  > ```java
 navigate<DetailActivity>("2")
 ```

Using a reified type, we can create the intent inside of a function, and using an extension function, we can call startActivity() directly.



### Optional parameters and default values

Thanks to default values on arguments and constructors, you´ll never need to overload a function anymore. One declaration can meet all your requirements. Back to the toast example:

```java
fun Activity.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT){ 
    Toast.makeText(this, message, duration) 
}
```

The second argument refers to the toast duration. It´s an optional parameter that, in case of not being specified, will use Toast.LENGTH_SHORT. Now you have two ways to call this function:

```java
    toast("Short Toast!!")
    toast("Long Toast!!", Toast.LENGTH_LONG)
```

Regarding the second example, we could want to add some arguments for lollipop transitions:

```java
inline public fun <reified T : Activity> Activity.navigate(
         id: String, 
        sharedView: View? = null,
         transitionName: String? = null) {          
    ...
 }
```

We now have two different ways to call the same function:

```java
navigate<DetailActivity>("2")
navigate<DetailActivity>("2", sharedView, TRANSITION_NAME)
```

And even a third, that wouldn´t make much sense in this situation, but helps us understand another concept: we can use parameter names to decide which parameters we want to call:

```java
navigate<DetailActivity>(id = "2", transitionName = TRANSITION_NAME)
```

Optional parameters can also be used in the default constructor, so you could get many overloads in a single declaration. Custom views are a special case, because they need more than one constructor to work properly in Java, but I´ll be covering this in next article.



### Conclusion

With these two ideas, we can save a lot of code and even do things that are impossible in Java. Kotlin is really expressive and concise. Next article will cover Kotlin Android Extensions, which let us inject views automatically in our activities, and how to create custom views in Kotlin.

Remember taking a look to the [example repository](https://github.com/antoniolg/Bandhook-Kotlin) to see it in action.