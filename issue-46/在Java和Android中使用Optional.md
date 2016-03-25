# 在Java和Android中使用Optional

标签（空格分隔）： Java Optional

---

原文地址：http://fernandocejas.com/2016/02/20/how-to-use-optional-on-android-and-java/


首先，这不是个新鲜的话题，已经有很多相关的讨论了。然而，在这篇文章里，我想解释`Optional<T>`是什么，展示一些用例，并且将它与其他语言中的不同替代品进行对比，最后，我特别想通过Arrow(轻量级的Java&Android工具箱库)让你们看到我们可以在Android里多么高效地使用`Optional<T> API`（虽然Arrow也可以用在任何`Java`项目中，特别是基于`Java7`的那些）。


在开始之前，我要引用[Java8官方文档][2]里的一段话：
“**一位智者曾说过：如果你没有处理过空指针异常，那你就不是真正的Java程序员，`null`因为常用来表示一个值的缺失因而也是许多问题的源头**”。


虽然这段话所言不虚，Java8文档也确实把`Optional<T>`的使用当作解决**NullPointerException的救星**，但在我看来，它不仅能用来减少`NullPointerException`，而且能创造更多有意义、可读性高的API。

众所周知，使用null时一旦大意就会导致种种bug，此外，**null的意义还是含糊不清的**，我们并不总是清楚它的意义：是表示值不存在吗？例如，当Map.get()方法返回null时，是表示值不存在，还是值存在且为null？

我们接下来就试着来回答这些问题，开始动手吧！

## Optional是什么？


第一个定义来自[Java8文档][3]：
**“`Optional`对象用来表示值缺失引起的`null`。它提供了各种各样的工具方法来帮助代码以“可用”或“不可用”的方式处理值，而不是判断`null`。”**


这是来自[Guava官方文档][5]的类似的定义：
**“一个不可改变的对象，它可能包含对另一个对象的非空引用。这个类型的每个实例，要么包含一个非空的引用，要么什么都不包含（在这种情况下我们可以说引用是“缺失的”）；它绝不是说“包含`null`”。一个非空的`Optional<T>`引用可以用来代替一个可空的T类型的引用。它允许你在程序中表达以下两种不同的概念以使得代码更清晰：“一个必须存在的T”和“一个可能缺失的T””**。


一言以蔽之，**`Optional`类的API提供了一个用来包含非空对象的容器类对象**。我们来看个小例子，这样你会更加明白我在说什么。

```java
Optional<Integer> possible = Optional.of(5);
possible.isPresent(); // returns true
possible.get(); // returns 5
```

如你所见，我们把一个T类型的对象包装进一个Optional<T>中，所以我们可以在之后检查它的存在性。换句话说，**`Optional<T>`强迫你去关心值，因为为了获得它，你得调用`get()`方法**（作为一个好习惯，先检查它的存在性或者返回一个默认值）。很明显，我们这里用的是[Guava][6]'s中`Optional<T>`的概念。
如果你还没明白，别担心，我们继续探索。

## Java 8, Scala, Groovy和 Kotlin中的Optional/Option API

我在上文提到过，本文中我们会专注于[Guava][7]的`Optional<T>`，但是快速浏览其他编程语言的实现方式也大有益处。


让我们看看`Groovy`和`Kotlin`提出的概念。这两者在对待`null`安全时采取了相似的策略：“Elvis运算符”。它们添加了些语法糖，语法看起来差不多。看看`Kotlin`的做法：“**当我们有一个可为空的引用r，我们就说：'如果r不为null，就用r，否则就用某个非空值x'**”：

Elvis运算符
```Groovy
val l: Int = if (b != null) b.length else -1
```

除了完整的if表达式，这句代码也可以用Elvis运算符`?:`表示：

Elvis运算符
```Groovy
val l = b?.length ?: -1
```


**如果`？：`表达式的左边不为null，那么返回左边，否则返回值为右边。**注意，只有左边为`null`时才会计算右边。为准确起见，Kotlin在编译期进行`null`检查。

你还可以阅读官方文档深入发掘，不过我不是搞Groovy或Kotlin的，所以我把这工作留给专业人士了：）。

在[Java8][8]和[Scala][9]上我们发现针对`Optional<T>`的[`Monad`][10]方法，使得我们可以使用[`flatMap()`][11],[`map()`][12]等方法**。这意味着我们可以以函数式编程的风格传递数据流。`Kotlin`出于同样的目的也提供了`OptionIF<T>`的`Monad`。**

看看[Sean Parsons][13]的Scala例子吧。

### Scala中的Option
```
case class Player(name: String)
def lookupPlayer(id: Int): Option[Player] = {
  if (id == 1) Some(new Player("Sean"))
  else if(id == 2) Some(new Player("Greg"))
  else None
def lookupScore(player: Player): Option[Int] = {
  if (player.name == "Sean") Some(1000000) else None
println(lookupPlayer(1).map(lookupScore))  // Some(Some(1000000))
println(lookupPlayer(2).map(lookupScore))  // Some(None)
println(lookupPlayer(3).map(lookupScore))  // None
println(lookupPlayer(1).flatMap(lookupScore))  // Some(1000000)
println(lookupPlayer(2).flatMap(lookupScore))  // None
println(lookupPlayer(3).flatMap(lookupScore))  // None
```

最后强调一点，我们是从[Guava][14]中借鉴的Optional<T>。Guava简化过的API完美契合Java7模型：缺乏first-class函数时才需要用到Optional<T>，这也是唯一的且最重要的要使用它的理由。


我猜到现在为止一切都很顺利，但没有Android Java7的示范代码。。。耐心地看下去吧，接下来还有很多。如果你在疑心为了要在Android上用`Optional`是不是得编译Guava和它的20k方法，答案是否定的，我们还有一个[替代方案][15]。


## 如何在Android里使用Optional<T>?

第一个要强调的观点是：**我们已深陷于Java7中**，Java7没有内置的`Optional<T>`，所以我们不幸地要向[第三方库][16]求助。。。
我们第一个想到的是[Guava][17]，但**在Android上不合适**，尤其是要把上文中提到的20k方法塞进你的.apk文件（我确定你已经知道了[65k方法限制的问题][18]了）。

**第二个选择是Arrow**，它是我创建的一个轻量级的开源库，包含了我日常Android开发中的小技巧、自己写的小工具，如用于精简代码的注解等。你可以在Github上查看[本项目][19]。当然了，一切首先要感谢创作这些优秀API的人。

## 如何创建Optional<T>?

`Optional<T>`相当直白：

![Optional Creation][20]

这是`Optional<T>`的查询方法：

![optional_query][21]

不要走，开始放代码了。

## 情景 #1

这是一个广为人知的段子：[Tony Hoare][22]谈到当年自己创造null引用的事情时说：
“1965年发明null引用是我犯过的价值10亿美元的错误。仅仅是因为实现起来太容易了，我脑子一发热就引入了null引用”。

### Car的例子
```java
public class Car {
  private final String brand;
  private final String model;
  private final String registrationNumber;
  public Car(String brand, String model, String registrationNumber) {
    this.brand = brand;
    this.model = model;
    this.registrationNumber = registrationNumber;
  public String information() {
    final StringBuilder builder = new StringBuilder();
    builder.append("Model: ").append(model);
    builder.append("Brand: ").append(brand);
    if (registrationNumber != null) {
      builder.append("Registration Number: ").append(registrationNumber);
    return builder.toString();
```

这段代码的问题是依赖一个`null`的引用来表示registration number的缺失（一种坏习惯），所以我们**可以用Optional<T>来完善它，并且根据值是否存在来打印**。

### Car的例子
```java
public class Car {
  private final Optional<String> registrationNumber;
  public Car(String brand, String model, String registrationNumber) {
    this.registrationNumber = Optional.fromNullable(registrationNumber);
  public String information() {
    if (registrationNumber.isPresent()) {
      builder.append("Registration Number: ").append(registrationNumber.get());
    return builder.toString();
```

**最明显的用法是用来避免无意义的null**。[到GitHub上查看完整的实现][23]。
进入下一个场景。


## 情景 #2

在移动开发中，我们经常需要解析来自API响应的JSON文件。在这个例子里，为了强迫客户端在使用值前关心它的存在性，我们可以在实体中使用`Optional<T>`。
看看例子中的`nickname`域变量和`getter`方法。

###JSON解析的例子
```java
public class User {
  @SerializedName("id")
  private int userId;
  @SerializedName("full_name")
  private String fullname;
  @SerializedName("nickname")
  private String nickname;
  public int id() {
    return userId;
  public String fullname() {
    return fullname;
  public Optional<String> nickname() {
    return Optional.fromNullable(nickname);
```
[完整的sample在GitHub上][24] .

## 情景 #3

另一个例子是我们常常在应用里遇到的[@SoundCloud][26]。
当我们要构建我们的feed或列表并把它们展示到UI层时，我们的item来自不同的数据源，有些可能是`Optional<T>`,比如Facebook的邀请、一个赞同。

本例使用`RxJava`来简化这种场景：

### RxJava的例子

```java
public class Sample {
  public static final Func1<Optional<List<String>>, Observable<List<String>>> TO_AD_ITEM =
      ads -> ads.isPresent()
          ? Observable.just(ads.get())
          : Observable.just(Collections.<String>emptyList());
  public static final Func1<List<String>, Boolean> EMPTY_ELEMENTS = ads -> !ads.isEmpty();
  public Observable<List<String>> feed() {
    return ads()
        .flatMap(TO_AD_ITEM)
        .filter(EMPTY_ELEMENTS)
        .concatWith(tracks())
        .observeOn(Schedulers.immediate());
  private Observable<Optional<List<String>>> ads() {
    return Observable.just(Optional.fromNullable(Collections.singletonList("This is and Ad")));
  private Observable<List<String>> tracks() {
    return Observable.just(Arrays.asList("IronMan Song", "Wolverine Song", "Batman Sound"));
```
 
这里最重要的部分是：当我们要把两个`Observables<T>`结合时（分别来自`tracks()`和`ads()`）时，我们使用了[`flatMap()`][27]和[`filter()`][28]运算符来决定是否显示广告、把它们更新到UI层（我使用Java8的lambda表达式以提高代码可读性）。

### RxJava的例子
```java
public static final Func1<Optional<List<String>>, Observable<List<String>>> TO_AD_ITEM =
      ads -> ads.isPresent()
          ? Observable.just(ads.get())
          : Observable.just(Collections.<String>emptyList());
public static final Func1<List<String>, Boolean> EMPTY_ELEMENTS = ads -> !ads.isEmpty();
```

[到Github上查看完整实现。][29]


## 结论

总结一下，软件开发里没有捷径可走，因为我们总是容易过度思考和滥用某样东西，所以**不要到处使用`Optional`,最后污染了代码，请谨慎地用在有意义的地方**。

让我引用Joshua Bloch在他的演讲“[如何设计一个好的API，为何它很重要][30]”中的一段话：
“**API应该易于使用、难于用错：它应该易于实现简单的事情，能胜任复杂的事情，不可能或者至少很难做错事情**”。

我完全同意他的观点，并且从API设计的角度来讲，`Optional<T>`设计得很棒：**它帮助你表辞达意、防范NullPointerException（尽管不能完全避免），让你写出精确的可读性高的代码。**

## 示例代码


所有的sample代码都在这里: https://github.com/android10/java-code-examples，
想看在Android里怎么用Optional<T>请看Arrow项目： https://github.com/android10/arrow

## 参考文献

http://www.oracle.com/technetwork/articles/java/java8-optional-2175753.html 
https://github.com/google/guava/wiki/UsingAndAvoidingNullExplained 
https://dzone.com/articles/guavas-new-optional-class 
https://kerflyn.wordpress.com/2011/12/05/from-optional-to-monad-with-guava/ 
http://techblog.bozho.net/the-optional-type/ 
http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Optional.html 
http://seanparsons.github.io/scalawat/Using+flatMap+With+Option.html 
http://www.nurkiewicz.com/2013/05/null-safety-in-kotlin.html 
https://kotlinlang.org/docs/reference/null-safety.html




  [1]: https://dzone.com/articles/guavas-new-optional-class
  [2]: http://www.oracle.com/technetwork/articles/java/java8-optional-2175753.html
  [3]: https://github.com/google/guava
  [4]: http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Optional.html
  [5]: http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Optional.html
  [6]: http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Optional.html
  [7]: https://github.com/google/guava
  [8]: http://www.oracle.com/technetwork/articles/java/java8-optional-2175753.html
  [9]: http://alvinalexander.com/scala/using-scala-option-some-none-idiom-function-java-null
  [10]: https://mttkay.github.io/blog/2014/01/25/your-app-as-a-function/
  [11]: http://fernandocejas.com/2015/01/11/rxjava-observable-tranformation-concatmap-vs-flatmap/
  [12]: http://fernandocejas.com/2015/01/11/rxjava-observable-tranformation-concatmap-vs-flatmap/
  [13]: http://seanparsons.github.io/scalawat/
  [14]: https://github.com/google/guava/
  [15]: https://github.com/android10/arrow
  [16]: https://github.com/android10/arrow
  [17]: https://github.com/google/guava/
  [18]: https://developers.soundcloud.com/blog/congratulations-you-have-a-lot-of-code-remedying-androids-method-limit-part-1
  [19]: https://github.com/android10/arrow
  [20]: http://fernandocejas.com/wp-content/uploads/2016/02/optional_creation-2.png
  [21]: http://fernandocejas.com/wp-content/uploads/2016/02/optional_query.png
  [22]: https://en.wikipedia.org/wiki/Tony_Hoare
  [23]: https://github.com/android10/java-code-examples/blob/master/src/main/java/com/fernandocejas/java/samples/optional/UseCaseScenario02.java
  [24]: https://github.com/android10/java-code-examples/blob/master/src/main/java/com/fernandocejas/java/samples/optional/UseCaseScenario02.java
  [25]: https://developers.soundcloud.com/blog
  [26]: https://developers.soundcloud.com/blog
  [27]: http://fernandocejas.com/2015/01/11/rxjava-observable-tranformation-concatmap-vs-flatmap/
  [28]: http://reactivex.io/documentation/operators/filter.html
  [29]: https://github.com/android10/java-code-examples/blob/master/src/main/java/com/fernandocejas/java/samples/optional/UseCaseScenario03.java
  [30]: http://www.infoq.com/articles/API-Design-Joshua-Bloch
