kotlin-for-android简介(1)
---

>
* 原文链接 : [Kotlin for Android (I): Introduction
](http://antonioleiva.com/kotlin-for-android-introduction/)
* 译者 : [canglangwenyue](https://github.com/canglangwenyue) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成

>>Kotlin is one of the many JVM based languages that are starting to emerge as a 
possible Java successor in Android development. Java is one of the most used 
languages in the world, and while many other languages evolve to make programmers lives easier, Java has not been able to keep their track as fast as expected.

Kotlin是众多基于JVM的语言之一，它一开始是作为android 开发中java的可能的代替者出现的。java	是世
	界上使用最多的语言之一，而伴随着其他语言的发展使得程序员的编程越来越容易，但是java并没有尽	快德向预期
目标发展。

###What´s Kotlin?
>Kotlin is a JVM based language created by JetBrains, the team behind IntelliJ,
 which is the base for Android Studio. It´s an object oriented language that 
 includes many ideas from functional programming.

Kotlin是被JetBrains创造的基于JVM的语言，它背后JetBrains团队是android studio诞生的基础。	
Kotlin是一个拥有很多函数编程特点的面向对象的编程语言。

###Why Kotlin?
>My first disclaimer is that I haven´t used Kotlin for a long time, I´m almost learning as I write these articles. I haven´t tried any other alternatives such as Go or Scala, so I recommend searching what other people thinks about those languages if you are really thinking on switching to another language. An awesome example of Android using Scala can be found in [47deg Github site](http://47deg.github.io/translate-bubble-android/).

我首先声明我并没有使用Kotlin很长时间，我几乎是在学习的同时写些文章的。我并没有尝试任何其它的替	代语言，例如Go和Scala，所以如果你是真的考虑换一种开发语言的话，我建议你去搜索一下其他人对这些	语言的评价。一个使用Scala开发android的例子可以在	[47deg Github site](http:/	
47deg.github.io/translate-bubble-android/)找到。

>######These are the reasons why I chose Kotlin as a study case:

以下是我选择学习Kotlin的原因：

>Relatively fast learning curve: compared to Scala for instance, we are moving in a much simpler scope. Kotlin is much more limited, but it´s easier to start if you´ve never used a modern language before.

学习曲线相对较快：以Scala作为例子进行比较，我们是向着更简单的方向移动。Kotlin有更多的限制，但是入左你没有学习过一门现代编程语言的话，Kotlin更容易学习。

>#####Lightweight: 
Kotlin library is small compared to others. This is important because Android method limit is always a problem, and though there are some options to solve it such as proguard or multidexing, all of these solutions will add complexity and will be time consuming when debugging. Kotlin adds less than 7000 methods, more or less the same as suppot-v4.

轻量：与其他语言相比Kotlin的Library更小。这很重要，因为android method数限是一个问题，虽
然有一些选择来解决这个问题，例如proguard or multidexing，但是这些解决方案会加复杂度，并导
致debugging的时间花销增多。Kotlin可以添加不少于7000 methods，大致和support－v4
一样。


>#####Highly interoperable: 
It works extremely well with any other Java libraries, and the interoperability is very simple. That´s one of the main ideas the Kotlin team kept in mind while developing this new language. They want to use it to continue developing their current projects written in Java without having to rewrite the whole code. So Kotlin needs to be extremely interoperable wih Java code.

高交互性：Kotlin和其它java Librarys协调使用的特别好，并且交互操作很简。这是Kotlin team
在开发新语言是的主要观点之一。他们想在使用Kotlin开发时并不用重写前所有的java写的代码，所以，	Kotlin必须具有非常高的和java的交互能力。

>#####Perfectly integrated with Android Studio and Gradle: 
we have one plugin for the IDE and another one for Gradle, so it won´t be difficult to start an Android project using Kotlin (this is what I´ll talk about in th next article).

与AS和Gradle完美结合：我们有一个IDE的插件和另一个属于Grade的插件，因此，用Kotlin进行
	android编程并不困难。

>An interesting document I recommend reading before taking any decision is the one Jake Wharton wrote about the use of Kotlin for Android development.

在开始任何争论之前我建议你看一下Jake Wharton写的一个有趣的文档[the use of Kotlin for Android development](https://docs.google.com/document/d/1ReS3ep-hjxWA8kZi0YqDbEhCqTt29hG8P44aA9W0DM8/edit?hl=es&forcehl=1&pli=1)。

###What do we get with Kotlin?

####1. Expressiveness

>
With Kotlin, it´s much easier to avoid boilerplate because most typical situations are covered by default in the language.

使用Kotlin，可以更容易的避免创建模版，因为大多数经典的情景都默认包含在Kotlin中。

>For instance, in Java, if we want to create a typical data class, we´ll need to 
write (or at least generate) this code:
例如，在java中，我们想要创建一个典型的data class时需要这样做：

```java	
	public class Artist {
    private long id;
    private String name;
    private String url;
    private String mbid;
 
    public long getId() {
        return id;
    }
 
    public void setId(long id) {
        this.id = id;
    }
 
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getUrl() {
        return url;
    }
 
    public void setUrl(String url) {
        this.url = url;
    }
 
    public String getMbid() {
        return mbid;
    }
 
    public void setMbid(String mbid) {
        this.mbid = mbid;
    }
 
    @Override public String toString() {
        return "Artist{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", url='" + url + '\'' +
                ", mbid='" + mbid + '\'' +
                '}';
    }
}
```

那么在Kotlin需要多少代码呢？仅仅是下面这个简单的数据类：

```java

	data class Artist(
    var id: Long, 
    var name: String, 
    var url: String, 
    var mbid: String)
```

####2. Null safety
>When we develop using Java, most of our code is defensive. We need to check continuously if something is null before using it if we don´t want to find unexpected NullPointerException. Kotlin, as many other languages, is null safe because we need to explicitly specify if an object can be null by using the safe call operator.

当我们用java开发时，我们的大多数代码是要进行类型检查的，如果我们不想出现**unexpected
NullPointerException**的话,我们就要在运行代码之前持续的检查是否有对象为null。Kotlin，和其它语
言一样，是空指针安全的，因为我们可以通过安全的调用操作来准确的声明一个object可以为null。

我们可以这样做：

```java
	
	//This won´t compile. Artist can´t be null
	var notNullArtist: Artist = null
 
	//Artist can be null
	var artist: Artist? = null
 
	// Won´t compile, artist could be null and we need to deal with that
	artist.print()
 
	// Will print only if artist != null
	artist?.print()
 
	// Smart cast. We don´t need to use safe call operator if we previously checked 	nullity
	if (artist != null) {
	    artist.print()
	}
	 
	// Only use it when we are sure it´s not null. Will throw an exception otherwise.
	artist!!.print()
 
	// Use Elvis operator to give an alternative in case the object is null
	val name = artist?.name ?: "empty"
```

####3. Extension functions
>We can add new functions to any class. It´s a much more readable substitute to the 
typical utility classes we all have in our projects. We could, for instance, add a 
new method to fragments to show a toast:

我们可以给任何类添加新方法。这比我们在project中使用的工具类可读性更高。例如：我们可以给Fragment添加一个新方法来显示Toast。

'

	fun Fragment.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(getActivity(), message, duration).show()
	}

```
我们可以这样使用：

```java
	fragment.toast("Hello world!")
```

####4. Functional support (Lambdas)

>What if instead of having to write the creation of a new listener every time we need to declare what a click should do, we could just define what we want to do? We can indeed. This (and many more interesting things) is what we get thanks to lambda usage:

如果我们可以不用在我们需要的时候每一次都创建一个listener，就像创建一个click listener那样的操作，
而是仅仅定义我们想要做什么？这种想法的确可以实现，它的实现得益于**lambda**d的使用：  

```java
	view.setOnClickListener({ toast("Hello world!") })
```	
	
###Current limitations

>Kotlin is still in development, and though it´s quite stable and final realease is soon (this summer), it has some limitations related to Android development:

Kotlin 依旧在发展，虽然它相对稳定，并且final release版本就很快发布，但是Kotlin在进行android相关开发的时候还是有些限制的。

>**Interoperability with autogenerated code**: Some well known Android libraries, such as Dagger or Butterknife, which rely on autogenerated code, will not work because of some incompatible namings. Kotlin team is working on it, so it will be solved some day (KT-6444). Anyway, as I´ll be showing in next articles, language expressiveness could make us think we won´t need those libraries anymore.

交互性与自动代码生成：一些有名的android Libraries，例如Dagger or Butterknife，他们依赖于自动
代码生成，这种情况下如果有名字冲突的话将无法进行代码生成。Kotlin正在解决这个问题，所以这个问题也许
会很快解决。无论如何，我将在接下来的文章里阐明，Kotlin语言的表达能力会让我们觉得不再需要那么多的
Libraries。

>**No easy way to declare custom views:** Kotlin classes can only declare one constructor, while custom views usually need three. This won´t be a problem if we use classes programmatically, but won´t be enough for XML usage. The easiest workaround is to declare those classes in Java and use them in Kotlin. Kotlin team has promised to have it ready for M11 release. Update: Kotlin M11 is out and now includes secondary constructors

声明自定义View比较困难：Kotlin类只能声明一个constructor，然后custom View通常需要三个。如果我
们使用类变成的话，这不是一个问题，但对于使用XML文件来说并不足够。最容易的变通方式是用java来声明这些
custom View的实现类，然后通过Kotlin来使用它们。Kotlin团队许诺将在M11 release解决这个问题。
**Update: Kotlin M11 is out and now includes [secondary constructors](http://kotlinlang.org/docs/reference/classes.html#constructors)**

>**jUnit testing in Android projects:** the new feature introduced in Android Studio 1.1 is not yet possible in Kotlin. Instrumentation tests and jUnit testing in pure Kotlin projects are fully functional by the way.

android 下Junit测试：AS 1.1中介绍的新特性并不适用与Kotlin。顺便说说，系统测试和Junit 测试对于纯Kotlin项目是完全可用。

###Conclusion

>Kotlin is a very interesting alternative to Java for developing Android apps. Next 
articles will describe how to start a new project using Kotlin, and how to take the
 most out of the language to make Android development easier. Stay tuned!
 
对于android apps 开发，Kotlin是一个非常有趣的java替代者。下一篇文章将会描述如何用Kotlin新建一
个project，和如何更好的适用Kotlin来使得android开发更加简单。敬请关注！

