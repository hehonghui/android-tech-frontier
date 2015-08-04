Android 中的 AOP 编程
---

> * 原文链接 : [Aspect Oriented Programming in Android](http://fernandocejas.com/2014/08/03/aspect-oriented-programming-in-android)
* 原文作者 : [Fernando Cejas](http://fernandocejas.com)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [byronwind](https://github.com/byronwind) 
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu) 
* 状态 :  校对完成 


**面向切面编程（AOP，Aspect-oriented programming）**需要把程序逻辑分解成『**关注点**』（concerns，功能的内聚区域）。这意味着，在 AOP 中，我们不需要显式的修改就可以向代码中添加可执行的代码块。这种编程范式假定『横切关注点』（cross-cutting concerns，多处代码中需要的逻辑，但没有一个单独的类来实现）应该只被实现一次，且能够多次注入到需要该逻辑的地方。

**代码注入是 AOP 中的重要部分：**它在处理上述提及的横切整个应用的**『关注点』**时很有用，例如日志或者性能监控。这种方式，并不如你所想的应用甚少，相反的，每个程序员都可以有使用这种注入代码能力的场景，这样可以避免很多痛苦和无奈。

**AOP** 是一种已经存在了很多年的编程范式。我发现把它应用到 Android 开发中也很有用。经过一番调研后，我认为我们用它可以获得很多好处和有用的东西。

## 术语（迷你术语表）
在开始之前，我们先看看需要了解的词汇：

* **Cross-cutting concerns（横切关注点）:** 尽管面向对象模型中大多数类会实现单一特定的功能，但通常也会开放一些通用的附属功能给其他类。例如，我们希望在数据访问层中的类中添加日志，同时也希望当UI层中一个线程进入或者退出调用一个方法时添加日志。尽管每个类都有一个区别于其他类的主要功能，但在代码里，仍然经常需要添加一些相同的附属功能。

* **Advice（通知）:** 注入到class文件中的代码。典型的 Advice 类型有 before、after 和 around，分别表示在目标方法执行之前、执行后和完全替代目标方法执行的代码。 除了在方法中注入代码，也可能会对代码做其他修改，比如在一个class中增加字段或者接口。

* **Joint point（连接点）:** 程序中可能作为代码注入目标的特定的点，例如一个方法调用或者方法入口。

* **Pointcut（切入点）:** 告诉代码注入工具，在何处注入一段特定代码的表达式。例如，在哪些 joint points 应用一个特定的 Advice。切入点可以选择唯一一个，比如执行某一个方法，也可以有多个选择，比如，标记了一个定义成@DebguTrace 的自定义注解的所有方法。

* **Aspect（切面）:** Pointcut 和 Advice 的组合看做切面。例如，我们在应用中通过定义一个 pointcut 和给定恰当的advice，添加一个日志切面。

* **Weaving（织入）:** 注入代码（advices）到目标位置（joint points）的过程。


下面这张图简要总结了一下上述这些概念。

![](http://upload-images.jianshu.io/upload_images/30689-55846998f4f5b4ce.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

## 那么...我们何时何地应用AOP呢？
一些示例的 cross-cutting concerns 如下：

* **日志**
* **持久化**
* **性能监控**
* **数据校验**
* **缓存**
* [其他更多](http://en.wikipedia.org/wiki/Cross-cutting_concern)

取决于你所选的其中一种或其他方案 :)。

## 工具和库
有一些工具和库帮助我们使用 AOP:

* [AspectJ:](https://eclipse.org/aspectj/) 一个 JavaTM 语言的面向切面编程的无缝扩展（适用Android）。

* [Javassist for Android:](https://github.com/crimsonwoods/javassist-android) 用于字节码操作的知名 java 类库 Javassist 的 Android 平台移植版。

* [DexMaker:](https://code.google.com/p/dexmaker/) Dalvik 虚拟机上，在编译期或者运行时生成代码的 Java API。

* [ASMDEX:](http://asm.ow2.org/asmdex-index.html) 一个类似 ASM 的字节码操作库，运行在Android平台，操作Dex字节码。

## 为什么用 AspectJ？

我们下面的例子选用 AspectJ，有以下原因：

* **功能强大**
* **支持编译期和加载时代码注入**
* **易于使用**

## 示例

比方说，我们要测量一个方法的性能（执行这个方法需要多长时间）。为此我们用一个 **@DebugTrace** 的注解标记我们的这个方法，并且无需在每个注解过的方法中编写代码，就可以通过 logcat 输出结果。我们的方法是使用 AspectJ 达到这个目的。

我们看下在底层到底发生了什么：

* **我们在编译过程中增加一个新的步骤处理注解。**
* **注解的方法内会生成和注入必要的样板代码。**

在此，我必须要提到当我研究这些时，发现了[Jake Wharton’s Hugo Library](https://github.com/JakeWharton/hugo) 这个项目，支持做同样的事情。因此，我重构了我的代码，看上去和它类似。尽管，我的代码是一个更加原始和简化的版本（顺便提一下，通过看这个项目的代码，我学到了很多）。

![](http://upload-images.jianshu.io/upload_images/30689-77fa4ba34c4afe60.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

### 工程结构
我们会把一个简单的示例应用拆分成两个 modules，第一个包含我们的 Android App 代码，第二个是一个 Android Library 工程，使用 AspectJ 织入代码（代码注入）。

你可能会想知道为什么我们用一个 Android Library 工程，而不是用一个纯的 Java Library：原因是为了使 AspectJ 能在 Android 上运行，我们必须在编译时做一些 hook。这只能使用 andorid-library gradle 插件完成。（先不要为此担心，后面我会给出更多细节。）

### 创建注解
首先我们创建我们的Java注解。这个注解周期声明在 class 文件上（RetentionPolicy.CLASS），可以注解构造函数和方法（ElementType.CONSTRUCTOR 和 ElementType.METHOD）。因此，我们的 DebugTrace.java 文件看上是这样的：

```java
@Retention(RetentionPolicy.CLASS)
@Target({ ElementType.CONSTRUCTOR, ElementType.METHOD })
public @interface DebugTrace {}
```

### 我们的性能监控计时类
我已经创建了一个简单的计时类，包含 `start/stop` 方法。下面是 StopWatch.java 文件:

```java
/**
 * Class representing a StopWatch for measuring time.
 */
public class StopWatch {
  private long startTime;
  private long endTime;
  private long elapsedTime;

  public StopWatch() {
    //empty
  }

  private void reset() {
    startTime = 0;
    endTime = 0;
    elapsedTime = 0;
  }

  public void start() {
    reset();
    startTime = System.nanoTime();
  }

  public void stop() {
    if (startTime != 0) {
      endTime = System.nanoTime();
      elapsedTime = endTime - startTime;
    } else {
      reset();
    }
  }

  public long getTotalTimeMillis() {
    return (elapsedTime != 0) ? TimeUnit.NANOSECONDS.toMillis(endTime - startTime) : 0;
  }
}
```

### DebugLog 类
我只是包装了一下 “android.util.Log”，因为我首先想到的是向 android log 中增加更多的实用功能。下面是代码：

```java
/**
 * Wrapper around {@link android.util.Log}
 */
public class DebugLog {

  private DebugLog() {}

  /**
   * Send a debug log message
   *
   * @param tag Source of a log message.
   * @param message The message you would like logged.
   */
  public static void log(String tag, String message) {
    Log.d(tag, message);
  }
}
```

### Aspect 类
现在是时候创建我们的 Aspect 类（TraceAspect.java）了。Aspect 类负责管理注解的处理和代码织入。

```java
/**
 * Aspect representing the cross cutting-concern: Method and Constructor Tracing.
 */
@Aspect
public class TraceAspect {

  private static final String POINTCUT_METHOD =
      "execution(@org.android10.gintonic.annotation.DebugTrace * *(..))";

  private static final String POINTCUT_CONSTRUCTOR =
      "execution(@org.android10.gintonic.annotation.DebugTrace *.new(..))";

  @Pointcut(POINTCUT_METHOD)
  public void methodAnnotatedWithDebugTrace() {}

  @Pointcut(POINTCUT_CONSTRUCTOR)
  public void constructorAnnotatedDebugTrace() {}

  @Around("methodAnnotatedWithDebugTrace() || constructorAnnotatedDebugTrace()")
  public Object weaveJoinPoint(ProceedingJoinPoint joinPoint) throws Throwable {
    MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
    String className = methodSignature.getDeclaringType().getSimpleName();
    String methodName = methodSignature.getName();

    final StopWatch stopWatch = new StopWatch();
    stopWatch.start();
    Object result = joinPoint.proceed();
    stopWatch.stop();

    DebugLog.log(className, buildLogMessage(methodName, stopWatch.getTotalTimeMillis()));

    return result;
  }

  /**
   * Create a log message.
   *
   * @param methodName A string with the method name.
   * @param methodDuration Duration of the method in milliseconds.
   * @return A string representing message.
   */
  private static String buildLogMessage(String methodName, long methodDuration) {
    StringBuilder message = new StringBuilder();
    message.append("Gintonic --> ");
    message.append(methodName);
    message.append(" --> ");
    message.append("[");
    message.append(methodDuration);
    message.append("ms");
    message.append("]");

    return message.toString();
  }
}
```

几个在此提到的重点：

* 我们声明了两个作为 pointcuts 的 public 方法，筛选出所有通过 ```“org.android10.gintonic.annotation.DebugTrace”``` 注解的方法和构造函数。
* 我们使用 `“@Around”` 注解定义了`“weaveJointPoint(ProceedingJoinPoint joinPoint)” `方法,使我们的代码注入在使用`"@DebugTrace"`注解的地方生效。
* `“Object result = joinPoint.proceed();” `这行代码是被注解的方法执行的地方。因此，在此之前，我们启动我们的计时类计时，在这之后，停止计时。
* 最后，我们构造日志信息，用 Android Log 输出。

###使 AspectJ 运行在 Anroid 上
现在，所有代码都可以正常工作了，但是，如果我们编译我们的例子，我们并没有看到任何事情发生。原因是我们必须使用 AspectJ 的编译器（ajc，一个java编译器的扩展）对所有受 aspect 影响的类进行织入。这就是为什么，我之前提到的，我们需要在 gradle 的编译 task 中增加一些额外配置，使之能正确编译运行。

我们的 build.gradle 文件如下：

```java
import com.android.build.gradle.LibraryPlugin
import org.aspectj.bridge.IMessage
import org.aspectj.bridge.MessageHandler
import org.aspectj.tools.ajc.Main

buildscript {
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath 'com.android.tools.build:gradle:0.12.+'
    classpath 'org.aspectj:aspectjtools:1.8.1'
  }
}

apply plugin: 'android-library'

repositories {
  mavenCentral()
}

dependencies {
  compile 'org.aspectj:aspectjrt:1.8.1'
}

android {
  compileSdkVersion 19
  buildToolsVersion '19.1.0'

  lintOptions {
    abortOnError false
  }
}

android.libraryVariants.all { variant ->
  LibraryPlugin plugin = project.plugins.getPlugin(LibraryPlugin)
  JavaCompile javaCompile = variant.javaCompile
  javaCompile.doLast {
    String[] args = ["-showWeaveInfo",
                     "-1.5",
                     "-inpath", javaCompile.destinationDir.toString(),
                     "-aspectpath", javaCompile.classpath.asPath,
                     "-d", javaCompile.destinationDir.toString(),
                     "-classpath", javaCompile.classpath.asPath,
                     "-bootclasspath", plugin.project.android.bootClasspath.join(
        File.pathSeparator)]

    MessageHandler handler = new MessageHandler(true);
    new Main().run(args, handler)

    def log = project.logger
    for (IMessage message : handler.getMessages(null, true)) {
      switch (message.getKind()) {
        case IMessage.ABORT:
        case IMessage.ERROR:
        case IMessage.FAIL:
          log.error message.message, message.thrown
          break;
        case IMessage.WARNING:
        case IMessage.INFO:
          log.info message.message, message.thrown
          break;
        case IMessage.DEBUG:
          log.debug message.message, message.thrown
          break;
      }
    }
  }
}
```

### 我们的测试方法
我们添加一个测试方法，来使用我们炫酷的 aspect 注解。我已经在主 Activity 类中增加了一个方法用来测试。看下代码：

```java
  @DebugTrace
  private void testAnnotatedMethod() {
    try {
      Thread.sleep(10);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
```

### 运行我们的应用
我们用 gradle 命令编译部署我们的 app 到 android 设备或者模拟器上：

```
gradlew clean build installDebug
```

If we open the logcat and execute our sample, we will see a debug log with:
如果我们打开 logcat，执行我们的例子，会看到一条 debug 日志：

```
Gintonic --> testAnnotatedMethod --> [10ms]
```

**我们的第一个使用 AOP 的 Androd 应用可以工作了！**
你可以用 Dex Dump 或者任何其他的逆向工具反编译 apk 文件，看一下生成和注入的代码。

## 回顾
回顾总结如下：

* 我们已经对面向切面编程（AOP）这一范式有了初步体验。
* 代码注入是 AOP 中的重要部分。
* AspectJ 是在 Android 应用中进行代码织入的强大且易用的工具。
* 我们已经使用 AOP 能力创建了一个可以工作的示例。


## 结论
面向切面编程很强大。通过正确使用，你可以在开发你的 Android 应用时，避免在『cross-cutting concerns』处复制大量代码，比如我们在示例中看到的性能监控部分。我非常鼓励你尝试一下，你会发现它非常有用。

我希望你能喜欢这篇文章，文章的目的是分享我学到的东西，所以，欢迎评论和反馈，如果能 fork 代码玩一下就更好了。

我确信我们能在示例 app 的 AOP 模块里增加些有趣的东西，欢迎提出你的想法;)。

## 源码
你可以在 https://github.com/android10/Android-AOPExample 下载示例 app 代码。另外我还有一个使用动态代理的 Java AOP 示例（也可以用在Android上）：https://github.com/android10/Android-AOPExample

## 资源
* [Aspect-oriented programming.](http://en.wikipedia.org/wiki/Aspect-oriented_programming)
* [Aspect-oriented software development.](http://en.wikipedia.org/wiki/Aspect-oriented_software_development)
* [Practical Introduction into Code Injection with AspectJ, Javassist, and Java Proxy.](http://www.javacodegeeks.com/2011/09/practical-introduction-into-code.html)
* [Implementing Build-time Bytecode Instrumentation With Javassist.](http://java.dzone.com/articles/implementing-build-time)
* [Frequently Asked Questions about AspectJ.](http://www.eclipse.org/aspectj/doc/released/faq.php)
* [AspectJ Cheat Sheet.](http://blog.espenberntsen.net/2010/03/20/aspectj-cheat-sheet/)


-----
译注
> * AOP 中的术语并没有统一的中文翻译，翻译过程中，术语一节我选取了用的比较多的中文名称注释在括号中帮助理解，正文中其他部分出现的术语，使用原始英文命名。
* 这篇文章是2014年发布的，2015年7月，阿里巴巴刚刚开源了一个强大的 Android 平台 AOP 框架 [Dexposed](https://github.com/alibaba/dexposed)，该项目基于著名的[ Xposed 项目](https://github.com/rovo89/Xposed)。