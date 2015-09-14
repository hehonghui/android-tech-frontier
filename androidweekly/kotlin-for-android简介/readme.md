kotlin-for-android简介(1)
---

>
* 原文链接 : [Kotlin for Android (I): Introduction
](http://antonioleiva.com/kotlin-for-android-introduction/)
* 译者 : [canglangwenyue](https://github.com/canglangwenyue) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成

Kotlin是众多基于JVM的语言之一，它一开始是作为android 开发中java语言的可能的代替者出现的。java是世界上使用最多的语言之一，而伴随着其他语言的发展使得程序员编程越来越容易，但是java并没有尽快地向预期目标发展。

###Kotlin简介
Kotlin是JetBrains创造的基于JVM的语言，JetBrains是IntelliJ的缔造团队。	
Kotlin是一个拥有很多函数编程特点的面向对象的编程语言。

###为什么要用Kotlin
我首先声明我并没有使用Kotlin很长时间，我几乎是在学习的同时写了这些文章的。我并没有尝试任何其它的替	代语言，例如Go和Scala，所以如果你是真的考虑换一种开发语言的话，我建议你去搜索一下其他人对这些	语言的评价。一个使用Scala开发android的例子可以在[47deg Github site](http:/	
47deg.github.io/translate-bubble-android/)找到。


以下是我选择学习Kotlin的原因：   
* **学习曲线相对较快**：以Scala作为例子进行比较，我们是向着更简单的方向前进。Kotlin有更多的限制，但是如果你没有学习过一门现代编程语言的话，Kotlin更容易学习。
* **轻量级**：与其他语言相比Kotlin的核心库更小。这很重要，因为android函数数量限制(函数数量不能大于64k)是一个问题，虽
然有一些选择来解决这个问题，例如proguard 或 multidexing，但是这些解决方案会加复杂度，并导
致调试时花费更多的时间。引入Kotlin核心库添加了不到7000个方法，大致和support－v4一样。
* **高交互性**：Kotlin和其它java库协调使用的特别好，并且交互操作很简单。这是Kotlin团队
在开发新语言是的主要理念之一。他们想在使用Kotlin开发时并不用重写之前所有用java写的代码，所以，Kotlin和java交互的能力必须非常高。
* **与AS和Gradle完美结合**：我们有一个IDE的插件和另一个属于Grade的插件，因此，用Kotlin进行
	android编程并不困难。

在开始任何争论之前我建议你看一下Jake Wharton写的一个有趣的文档[the use of Kotlin for Android development](https://docs.google.com/document/d/1ReS3ep-hjxWA8kZi0YqDbEhCqTt29hG8P44aA9W0DM8/edit?hl=es&forcehl=1&pli=1)。

###Kotlin的优点

####1. 可读性更高，更简洁
使用Kotlin，可以更容易的避免创建模版型代码，因为大多数经典的情景都默认包含在Kotlin中。       
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

####2. 空指针安全
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

####3. 扩展方法
我们可以给任何类添加新方法。这比我们在project中使用的工具类可读性更高。例如：我们可以给Fragment添加一个新方法来显示Toast。

```java
fun Fragment.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(getActivity(), message, duration).show()
}
```
我们可以这样使用：

```java
	fragment.toast("Hello world!")
```

####4. 支持函数式编程
如果我们可以不用在我们需要的时候每一次都创建一个listener，就像创建一个click listener那样的操作，
而是仅仅定义我们想要做什么？这种想法的确可以实现，它的实现得益于**lambda**d的使用：  

```java
	view.setOnClickListener({ toast("Hello world!") })
```	
	
###Kotlin目前存在的限制
Kotlin 依旧在发展，虽然它相对稳定，并且final release版本就很快发布，但是Kotlin在进行android相关开发的时候还是有些限制的。   

* **交互性与自动代码生成**：一些有名的android Libraries，例如Dagger 或 Butterknife，他们依赖于自动
代码生成，这种情况下如果有名字冲突的话将无法进行代码生成。Kotlin正在解决这个问题，所以这个问题也许
会很快解决。无论如何，我将在接下来的文章里阐明，Kotlin语言的表达能力会让我们觉得不再需要那么多的
Libraries。

* **声明自定义View比较困难**：Kotlin类只能声明一个构造函数，然而自定义View通常需要三个。如果我
们使用代码来创建View的话可以避免这个问题，但对于使用XML文件来声明View的话就不能满足需求了。最容易的变通方式是用java来声明这些
自定义View的实现类，然后通过Kotlin来使用它们。Kotlin团队许诺将在M11 release解决这个问题。
**Update: Kotlin M11 is out and now includes [secondary constructors](http://kotlinlang.org/docs/reference/classes.html#constructors)**

* **android 下Junit测试**：AS 1.1中介绍的新特性并不适用与Kotlin。顺便说说，系统测试和Junit 测试对于纯Kotlin项目是完全可用。

###结论
对于android apps 开发，Kotlin是一个非常有趣的java替代者。下一篇文章将会描述如何用Kotlin新建一
个project，和如何更好的适用Kotlin来使得android开发更加简单。敬请关注！

