深入研究AutoValue
---

> * 原文链接 : [A Deeper Look at AutoValue](http://ryanharter.com/blog/2016/04/08/autovalue-deep-dive/)
* 原文作者 : [Ryan Harter](http://ryanharter.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



在上一篇博文中，我简单介绍了 AutoValue - 通过注解处理器简化 Java 不可变数据类型的代码生成库。现在我要来研究它的实现机制了。

##编译时注解处理

首先，AutoValue 是编译时注解处理器，意味着它只在你编译代码时运行，恰好与 App 运行时相对。这对应用来说有一些意义，因为 AutoValue 不会影响应用的性能/大小。

我认为 AutoValue 不影响应用的原因是：AutoValue 将已生成的代码添加到你最终的二进制流文件中，而这往往都是你不需要担心的部分，因为如果你在创建数据类型，那么这部分代码无论如何都会存在。除此以外，AutoValue 自己会测试它的生成器及代码，所以你可以相信生成的代码没有错误而且具有高性能表现。

如果你不够谨慎的话，还是很容易将 AutoValue ，以及 [shaded](https://maven.apache.org/plugins/maven-shade-plugin/) 依赖意外地包含到二进制流文件中。如果你是 Android 开发者，这可能会对应用/用户产生[恶劣的影响](http://stackoverflow.com/questions/15471772/how-to-shrink-code-65k-method-limit-in-dex)。


包含 AutoValue 的正确方法是：正确配置它，使得它只在项目构建过程中的注解处理阶段被包含。

对于 Android 项目，你需要安装 [android-apt](https://bitbucket.org/hvisser/android-apt) Gradle 插件，然后将 AutoValue 添加到 apt 配置中。你还需要将它添加到 provided 配置中以得到正确的代码实现。

```java
dependencies {
  provided 'com.google.auto.value:auto-value:1.2'
  apt 'com.google.auto.value:auto-value:1.2'
}```

> 注意：这一步对 Android 应用来说真的很关键，不然的话你很容易就会遇到 dex 方法数限制了。

为了在 Java 项目中通过 Gradle 使用 AutoValue，你可以安装 apt 插件，并将依赖添加到 compileOnly 和 apt 配置中。

```java
dependencies {
  compileOnly 'com.google.auto.value:auto-value:1.2'
  apt         'com.google.auto.value:auto-value:1.2'
}
```

Maven 用户可以这样添加依赖：

```java
<dependency>
  <groupId>com.google.auto.value</groupId>
  <artifactId>auto-value</artifactId>
  <version>1.2</version>
  <scope>provided</scope>
</dependency>
```

列出多种依赖配置方式的原因是：不想大多数注解处理器，AutoValue 在相同的部件中包含了注解和注解处理器。这也是这个 [issue](https://github.com/google/auto/issues/268) 被提出的原因，这个 issue 解决以后就不需要这么多配置了。

##扫描类

当 AutoValue 作为依赖被添加，就会在编译应用时被运行以处理所有带有 @AutoValue 注解的类。如果你想了解 Java 注解是如何工作的，不妨看 Hannes Dorfmann 的[这篇博文](http://hannesdorfmann.com/annotation-processing/annotationprocessing101)，讲解的非常好。

每一个带有 @AutoValue 注解的类，AutoValue 首先搜索所有的抽象方法去判断它应该生成什么。AutoValue 通过进入所有抽象方法完成，这些方法包含通过接口继承的方法。这些方法被看作属性，而且 AutoValue 会生成适当的域，将它们包含到 equals()、hashCode() 和 toString() 方法中。

```java
@AutoValue public abstract class Foo {

  // This method takes no arguments and returns
  // String, so it's a property
  public abstract String foo();

  // This method is not abstract, so it's not
  // a property.
  public boolean hasValues() {
    return foo() != null && !foo().isEmpty();
  }

  // This method takes a parameter and returns void,
  // so it's not a property.  Hopefully an extension
  // generates the implementation.
  public abstract void writeValues(OutputStream out);
}```

因为 AutoValue 知道属性和自定义方法间的区别，这就意味着你可以添加返回代码生成的数据类型，或在对象上执行其他操作。

此外，属性方法不需要是 public。因为他们必须由 AutoValue 子类生成，它们也不是 private，但它们可以设为包 private 或 protected 以保证不会被公有 API 访问。

```java
@AutoValue public abstract class User {

  // Package private property won't be
  // visible outside of the package, but
  // will still be generated.
  abstract String internalFirstName();

  // Publicly available method that uses the
  // internally generated one.
  public String firstName() {
    String name = internalFirstName().trim();
    return Character.toUpperCase(name.charAt(0)) + name.substring(1);
  }
}```

其他需要考虑的就是 equals()、hashCode() 和 toString() 方法了。如果你想要实现你自己版本的这些方法（或其中之一），你可以在注解类中自己实现，AutoValue 会识别出来并不产生代码，你的实现也会被继承并在 final 类中被使用。

```java
@AutoValue public abstract class User {
  public abstract String firstName();
  public abstract String lastName();
  public abstract int age();

  // I'm the same person as me from 10 years ago...or am I?
  @Override public boolean equals(Object other) {
    if (!(other instanceof User)) return false;
    User o = (User) other;
    return firstName().equals(o.firstName())
        && lastName().equals(o.lastName());
  }
}```

理解 AutoValue 定义属性的方式给你的类增加了不少可伸缩性。

##生成的代码

正如我在上一篇文章中提到，AutoValue 通过创建构造器，成员变量和对应的 getter 方法（获得属性）生成不可变的数据类型，此外还根据上面提到的规则实现了 equals()、hashCode() 和 toString() 方法。不妨看看这些代码是怎么生成的吧

###The Class

```java
package com.example.autovalue;

final class AutoValue_User extends User {

  ...

}
```

首先注意到的是该生成类继承了添加注解的抽象类，这意味着你可以传递用户对象，而不需要特定为 AutoValue 指明。这显然是 Google 工程师有意为之，当 AutoValue 不能满足你的需求时，简化依赖实现的修改。

其他的就是生成的类是 final 的，而且带有 AutoValue_ 前缀。如果你想要在添加注解的类中访问生成的代码的话，这一点很重要。因为这样就像通过静态工厂方法访问构造器。

最后，注意该类是包间私有的。因此在其他包里无法看到生成的类，当然，它也不应该在其他类中被使用。

###The Constructor

```java
final class AutoValue_User extends User {

  AutoValue_User(
      String firstName,
      String lastName,
      int age) {
    if (firstName == null) {
      throw new NullPointerException("Null firstName");
    }
    this.firstName = firstName;
    if (lastName == null) {
      throw new NullPointerException("Null lastName");
    }
    this.lastName = lastName;
    this.age = age;
  }

}
```

该构造器也是包间私有的，将所有参数作为属性。

在构造器中对传入的参数作了判断，所有属性都不会是空。如果你想让某个属性为空，不妨添加一个 @Nullable 注解。

```java
@AutoValue public abstract class User {
  @Nullable public abstract String middleName();
}
```

###The Member variables

```java
final class AutoValue_User extends User {

  private final String firstName;
  private final String lastName;
  private final int age;

  @Override
  public String firstName() {
    return firstName;
  }

  @Override
  public String lastName() {
    return lastName;
  }

  @Override
  public int age() {
    return age;
  }

}```

###equals(), hashCode() and toString()

对于成员变量真的没什么特别的，唯一要说的就是数据域都是 final，以保证类型不变性。

```java
final class AutoValue_User extends User {

  @Override
  public String toString() {
    return "User{"
        + "firstName=" + firstName + ", "
        + "lastName=" + lastName + ", "
        + "age=" + age
        + "}";
  }

  @Override
  public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (o instanceof User) {
      User that = (User) o;
      return (this.firstName.equals(that.firstName()))
           && (this.lastName.equals(that.lastName()))
           && (this.age == that.age());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int h = 1;
    h *= 1000003;
    h ^= this.firstName.hashCode();
    h *= 1000003;
    h ^= this.lastName.hashCode();
    h *= 1000003;
    h ^= this.age;
    return h;
  }

}```

这样就得到了默认的 equals(), hashCode() 和 toString() 方法的实现了。

##结论

如你所见，AutoValue 为我们完成了许多的工作，它很聪明，能够了解我们希望他完成什么工作，并作出正确的决定。AutoValue 允许我们的类有大量的可伸缩性。

而且这一切都不会给你的应用增加负担。