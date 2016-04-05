#为什么在Android开发中我仍然不想使用Kotlin？
---

> * 原文链接 : [Why I don't want to use Kotlin for Android Development yet](http://artemzin.com/blog/why-i-dont-want-to-use-kotlin-for-android-development-yet/)
* 原文作者 : [Artem Zinnatullin](http://artemzin.com/blog/author/artem/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [mr_dsw](https://github.com/dengshiwei) 
* 校对者:[chaossss](https://github.com/chaossss)  
* 状态 :  完成

尽管Kotlin在很多方面比Java更好，但是在我看来它仍然有显著的缺点。

>如果你有下面罗列问题的解决方案，就请你把它们看做为我个人意见和评论吧！

**1）编译速度缓慢**    
一个比较小的工程（共有100类左右，大部分采用Kotlin）花费1分钟进行编译，这是无法让人接受的。    
[https://youtrack.jetbrains.com/issue/KT-6246](https://youtrack.jetbrains.com/issue/KT-6246)

**2)Kotlin插件在IDEA编译器中的表现**  
在编码过程中，语法分析和Kotlin在IDEA(Android Sutdio)中的高亮显示让开发机器经常卡顿，令人无法接受。

**3)annotation（注解）处理有问题**
有时它给出的错误提示太粗略，但你又不得不解决。几乎每天我都能在不同的Android开发社区上看到对此的抱怨。（这里resources应该是指不同的（信息）来源）

**4)  通过Mockito模拟通过Kotlin创建的类是痛苦的**   
在Kotlin中默认情况下，几乎所有的成员都是final类型,例如：classes, methods, 等等。而我确实喜欢因为它强制保持了不变性 ->减少bug。但是与此同时，它使）通过Mockito模拟通过Kotlin创建的类是痛苦的（一种JVM世界的黄金标准)同时它与语言设计相反。  

是的，PowerMock是一个解决方案，但是它通过Robolectric这类工具进行交互，同时一般来说，它是一个不错的规则针对你模拟final classes和final method。

我知道在Java开发中我们面对non-final的设计都会遇到那个问题，但是与此同时我不想仅仅为了测试去改变代码。

**5) No static analyzers for Kotlin yet**  
是的，Cotlinc比javac让代码更安全，如果你想在编译器上实现更好的体验，你又不想把它变成static analyzer(静态分析器)。

静态代码非常适合CI，但是你可能不希望本地开发中每次点击run按钮都运行它。

Java有：FindBugs, PMD, Checkstyle, Sonarqube, Error Prone, FB infer。

Kotlin有：kotlinc。

>我认为以上观点都是客观的。下面的观点更倾向于主观的和个人看法。

**6)==实现了Java的equals()方法提供的对象比较功能，而不是比较对象的引用是否相同**     
如果Kotlin是更好的Java或"Java on steroids"，它应该变得更好，而不是去打破。

想象一下你重写Java工程到Kotlin的过程，你会同时遇到Java和Kotlin代码。

因开发语言不同你可能会阅读和编写相同的代码但是代码的功能效果不同。这也是我不喜欢Groovy的一个原因。
 
**7)不正确的操作符重载可能会导致错误**   
观点1：未来你需要处理使用Kotlin开发的久代码库。     
观点2：你可以添加操作符来重载已存在的java类来扩展功能。

想象一下，你需要处理类似val person3 = person1 + person2这类已经写好的代码。    

每个你即将工作的项目，在一个相同的类中的操作符都有它独特的含义。

操作符重载是有争议的，这些链接可以帮你决定（它们没有统一结论）：

[Operator Overloading Considered Harmful](http://cafe.elharo.com/programming/operator-overloading-considered-harmful/)   
[Operator Overloading Ad Absurdum](http://james-iry.blogspot.ru/2009/03/operator-overloading-ad-absurdum.html)     
[Why Everyone Hates Operator Overloading](http://blog.jooq.org/2014/02/10/why-everyone-hates-operator-overloading/)   