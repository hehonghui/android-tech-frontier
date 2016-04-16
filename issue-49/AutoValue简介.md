AutoValue简介
---

> * 原文链接 : [An Introduction to AutoValue](http://ryanharter.com/blog/2016/03/22/autovalue/)
* 原文作者 : [Ryan Harter](http://ryanharter.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



不得不说，Java 的数据类型一致很单一，除了提供的九种基本数据类型，任何你想设计的数据类型都要通过创建类来完成。但 Google 新发布的 [AutoValue](https://github.com/google/auto/) 库似乎能改变这个困境，在最近的更新中，AutoValue 给该库增加了可拓展性。

##Java 中的值类型

在介绍 AutoValue 的优点之前，不妨先看看我们真正遇到的问题：数据类型。

简单来说，数据类型就是一种不可变对象，且该对象能表达的内容基于对象的属性值描述，与身份相对。下面我创建一个 Money 对象来解释吧：

```java
public class Money {
  public Currency currency;
  public long amount;
}
```

Money 是一个简单的数据类型，它含有两个属性，amount 和 currency。如果我们创建了两个 money 对象，它们的 amount 和 currency 值是相等的，那么在不考虑对象引用地址不同的情况下，我们可以把这两个对象看作相等的。

虽说这很直观，但要在 Java 中实现却不容易。数据类型应该是不可变的，但我们当前的 Money 对象却没有实现这一点，因此下面把代码更新为：

```java
public final class Money {
  private Currency currency;
  private long amount;
  public Money(Currency currency, long amount) {
    this.currency = currency;
    this.amount = amount;
  }
  public Currency currency() {
    return currency;
  }
  public long amount() {
    return amount;
  }
}```

此时，Money 类为 final 类，那么我们将不能创建它的子类（保证相等性），将数据域设置为 private，并通过 getter 获得值，添加构造器使用户能创建相应的 Money 对象。你可以看到，此时 Money 类的代码从 4 行变为 14 行。

你以为这就完了吗？此时判断对象是否相等还是比较它们的引用（而不是比较属性）。这就意味着 $2 != $2 情况的发生。因此我们需要实现 equals() 和 hashCode() 方法，不然我们没法在 Set 或 Map（作为键） 里正常使用这个对象。

```java
public final class Money {
  private Currency currency;
  private long amount;
  public Money(Currency currency, long amount) {
    this.currency = currency;
    this.amount = amount;
  }
  public Currency currency() {
    return currency;
  }
  public long amount() {
    return amount;
  }
  @Override public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Money money = (Money) o;
    if (Double.compare(money.amount, amount) != 0) return false;
    return currency.equals(money.currency);
  }
  @Override public int hashCode() {
    int result;
    long temp;
    result = currency.hashCode();
    result = 31 * result + (int) (amount ^ (amount >>> 32));
    return result;
  }
}```

添加了 equals() 和 hashCode() 方法后，代码变为 29 行。

那如果我们想在 Log 里面了解这个对象的相关信息呢？我相信每一个程序员都希望看到 Money@12CE469 以外的一些相关性更高的 Log，因此，我们还需要添加 toString() 方法。

```java
public final class Money {
  private Currency currency;
  private long amount;
  public Money(Currency currency, long amount) {
    this.currency = currency;
    this.amount = amount;
  }
  public Currency currency() {
    return currency;
  }
  public long amount() {
    return amount;
  }
  @Override public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Money money = (Money) o;
    if (money.amount != amount) return false;
    return currency.equals(money.currency);
  }
  @Override public int hashCode() {
    int result;
    long temp;
    result = currency.hashCode();
    result = 31 * result + (int) (amount ^ (amount >>> 32));
    return result;
  }
  @Override public String toString() {
    return "Money{" +
        "currency=" + currency +
        ", amount=" + amount +
        '}';
  }
}```

此时，代码变为 34 行。如果你有看过一些有关软件工程书，你可能会听过这样一个结论“随代码行数的增加，Bug 出现的可能性也会增加”，于是你会不会想要简化你的代码呢？或者通过其他办法去优化？

##AutoValue 来拯救你

上面提到的问题就是 AutoValue 被开发的原因，AutoValue 是用于为你生成所有寻常的数据类型代码的注解处理器，使你能更多地关注其他更重要的事情。

使用 AutoValue 需要在工程的注解处理器的 classpath 中添加依赖。在注解处理器的 classpath 中添加依赖的好处是，AutoValue 不会被添加到你的项目中（编译完成后），但由它生成的代码被添加到项目中了。

```java
dependencies {
  apt 'com.google.auto.value:auto-value:1.2-rc1'
}
```

同样是创建 Money 数据类型，使用 AutoValue 你只需要添加注解到抽象的 Money 类中：

```java
@AutoValue public abstract class Money {
  public abstract Currency currency();
  public abstract long amount();
}```

之后，AutoValue 就会为你生成所有私有数据域，构造器，hashCode()、equals() 和 toString() 方法，由 AutoValue 生成的类的类名将由 AutoValue_ 与你原来的类名组成，但 package 是 private，所以使用应用的用户并没有和使用注解的 Money 类交互。

```java
@AutoValue public abstract class Money {
  public abstract Currency currency();
  public abstract long amount();
  public static Money create(Currency currency, long amount) {
    return new AutoValue_Money(currency, amount);
  }
}```

上面的代码就完成了前面的例子的功能，但只需要 7 行代码。

AutoValue 的一个特性是：你能在类中添加任何你想要的额外的代码。因此，如果你有什么派生域，它们也能被添加到 Money 类中，而不需要额外的 helper 类。

```java
@AutoValue public abstract class Money {
  public abstract Currency currency();
  public abstract long amount();
  public static Money create(Currency currency, long amount) {
    return new AutoValue_Money(currency, amount);
  }
  public String displayString() {
    return currency().symbol() + amount();
  }
}```

##测试：隐藏的优点

自动生成代码的一个好处是：不需要测试。然而在纯 Java 实现版的例子中我们需要添加测试以保证功能的正确性，但 AutoValue 却不需要这样，因为生成器本身就会被测试，并用于生成正确的代码，我们不需要测试那些模板代码。

###拓展

现在我们能轻易地创建数据类型了，那如果你想将生成的数据类型用到其他系统呢，例如 JSON 串行器或 Android Parcel 类？这就是拓展的作用了。

在 AutoValue 1.2-rc1 版本中，AutoValue 支持拓展，意味着你能得到额外的功能，大多数情况下只能给注解处理器的 classpath 添加依赖。

举个例子，例如你想让 Money 对象变为可序列化，那么你可以给 AutoValue 添加 Parcel 拓展到注解处理器的 classpath 中，并让类实现 Parcelable 接口，那么生成的代码也将是可序列化的：

```java
dependencies {
  provided 'com.google.auto.value:auto-value:1.2-rc1' // needed for Android Studio
  apt 'com.google.auto.value:auto-value:1.2-rc1'
  apt 'com.ryanharter.auto.value:auto-value-parcel:0.2.0'
}```

```java
@AutoValue public abstract class Money implements Parcelable {
  public abstract Currency currency();
  public abstract long amount();
  public static Money create(Currency currency, long amount) {
    return new AutoValue_Money(currency, amount);
  }
  public String displayString() {
    return currency().symbol() + amount();
  }
}```

相信这个新特性能减轻你的部分工作压力，不需要写过多的序列化模板代码，测试代码，优化代码。

##结论

现在已经有好几个 AutoValue 拓展可用了，都能提高你的工作效率，我列出其中一部分吧：

AutoValue: [Gson Extension](https://github.com/rharter/auto-value-gson)
AutoValue: [Moshi Extension](https://github.com/rharter/auto-value-moshi)
AutoValue: [Cursor Extension](https://github.com/gabrielittner/auto-value-cursor)
AutoValue: [With Extension](https://github.com/gabrielittner/auto-value-with)
AutoValue: [Redacted Extension](https://github.com/square/auto-value-redacted)

如果它们不能满足你需求的话，你可以参考它们创建你自己的版本。

接下来我将研究拓展特性的 API，研究我们怎样才可以创建自己的 AutoValue 拓展，同时研究上面提到的拓展的实现细节。