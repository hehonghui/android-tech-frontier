Gradle小知识#2：学学语法
---

> * 原文链接 : [Gradle tip #2: understanding syntax](http://trickyandroid.com/gradle-tip-2-understanding-syntax/)
* 原文作者 : [Tricky Android](http://trickyandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

In the Part 1 we talked about tasks and different stages of the build lifecycle. But after I published it I realized that before we jump into Gradle specifics it is very important to understand what we are dealing with - understand its syntax and stop being scared when we see complex `build.gradle` scripts. With this article I will try to fill this missing gap.  

在第一部分，我们聊了下Gradle中的任务以及构建过程中的不同阶段。但是，在我发布上篇文章之后我意识到在继续深入Gradle之前，我们最好了解下Gradle的语法。以免被复杂的`build.gradle`脚本吓到。所以这篇我们来聊聊Gradle的语法。

### Syntax
Gradle build scripts are written in [Groovy](http://www.groovy-lang.org/), so before we start analyzing them, I want to touch (briefly) some key Groovy concepts. Groovy syntax is somewhat similar to Java, so hopefully you won't have much problems understanding it.

If you feel comfortable with Groovy - feel free to skip this section.

There is one important Groovy aspect you need to understand in order to understand Gradle scripts - Closure.

### 语法
Gradle构建脚本是使用[Groovy](http://www.groovy-lang.org/)语言写的。所以在继续深入之前我想说几个Groovy中比较重要的概念。Groovy的语法跟Java语法很类似，所以希望你在理解上不会有大问题。 

如果你对Groovy比较熟悉，那你可以跳过这部分。

要理解Gradle脚本，你需要明白Groovy中很重要的一个概念——闭包。

#### Closures
[Closure](http://www.groovy-lang.org/closures.html) is a key concept which we need to grasp to better understand Gradle. Closure is a standalone block of code which can take arguments, return values and be assigned to a variable. It is some sort of a mix between `Callable` interface, `Future`, function pointer, you name it..

要理解Gradle就必须搞明白[`闭包`](http://www.groovy-lang.org/closures.html)这个重要的概念。闭包是一个独立的代码块，它可以接收参数、可以有返回值，而且还可以赋值给变量。有点像`Callable`接口、`Future`和方法指针的混合体，随便你怎么叫。


Essentially this is a block of code which is executed when you call it, not when you create it. Let's see a simple Closure example:

大体来说就是个代码块，当你调用它的时候它才会执行，而非创建时就执行。下面是一个简单的闭包的例子：

~~~gradle
def myClosure = { println 'Hello world!' }

//execute our closure
myClosure()

#output: Hello world!
~~~

Or here is a closure which accepts a parameter:  

亦或是接收一个参数的闭包：

~~~gradle
def myClosure = {String str -> println str }

//execute our closure
myClosure('Hello world!')

#output: Hello world!
~~~

Or if closure accepts only 1 parameter, it can be referenced as `it`:  

如果闭包只有一个参数，那这个参数可以通过`it`来引用：

~~~gradle
def myClosure = {println it }

//execute our closure
myClosure('Hello world!')

#output: Hello world!
~~~

Or if closure accepts multiple input parameters:  

接收多个参数的闭包：

~~~gradle
def myClosure = {String str, int num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)

#output: my string : 21
~~~  

By the way, argument types are optional, so example above can be simplified to:

顺便插一句，闭包的参数类型是可选的。所以上面的例子可以简写成下面这样：  

~~~gradle
def myClosure = {str, num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)

#output: my string : 21
~~~  

One cool feature is that closure can reference variables from the current context (read class). By default, current context - is the class within this closure was created:  

闭包可以引用它所在上下文环境中的变量，这一点非常酷。这个上下文环境默认是闭包被创建时所在的类：

~~~gradle
def myVar = 'Hello World!'
def myClosure = {println myVar}
myClosure()

#output: Hello world!
~~~

Another cool feature is that current context for the closure can be changed by calling `Closure#setDelegate()`. This feature will become very important later:

另一个比较酷的特性是：闭包的上下文环境可以通过`Closure#setDelegate()`进行改变。这个特性在以后会非常重要：

~~~gradle
def myClosure = {println myVar} //I'm referencing myVar from MyClass class
MyClass m = new MyClass()
myClosure.setDelegate(m)
myClosure()

class MyClass {
    def myVar = 'Hello from MyClass!'
}

#output: Hello from MyClass!
~~~

As you can see, at the moment when we created closure, `myVar`variable doesn't exist. And this is perfectly fine - it should be present in the closure context at the point when we execute this closure.

如你所见，在我们创建闭包的时候，`myVar`变量还不存在。但这都不是事，只要我们执行闭包的时候，它存在于闭包的上下文环境中就行。

In this case I modified current context for the closure right before I executed it, so `myVar` is available.  

在这个例子中，在闭包执行之前，我修改了闭包的上下文环境。所以`myVar`就可以被引用到了。  

#### Pass closure as an argument
The real benefit of having closures - is an ability to pass closure to different methods which helps us to decouple execution logic.  

#### 把闭包当做参数来传递
闭包的真正好处是：你可以把它当做参数传递给不同的方法。这可以帮助我们解耦执行逻辑。

In previous section we already used this feature when passed closure to another class instance. Now we will go through different ways to call method which accepts closure:

 1. method accepts 1 parameter - closure  
`myMethod(myClosure)`
 2. if method accepts only 1 parameter - parentheses can be omitted  
`myMethod myClosure`
 3. I can create in-line closure   
`myMethod {println 'Hello World'}`
 4. method accepts 2 parameters   
`myMethod(arg1, myClosure)`
 5. or the same as '4', but closure is in-line   
`myMethod(arg1, { println 'Hello World' })`
 6. if last parameter is closure - it can be moved out of parentheses   
`myMethod(arg1) { println 'Hello World' }`

At this point I really have to point your attention to example #3 and #6. Doesn't it remind you something from gradle scripts? ;)  

其实前面我们已经使用过这个特性了。接下来我们详细说下方法接收闭包作为参数时的调用方式：

1. 如果方法接收一个闭包参数   
`myMethod(myClosure)`
2. 如果方法只接收一个参数而且这个参数是闭包，那么圆括弧可以省略：  
`myMethod myClosure`
3. 也可以以内联的方式调用闭包  
`myMethod {println 'Hello World'}`
4. 接收两个参数的方法  
`myMethod(arg1, myClosure)`
5. 或者跟‘4’一样，但是闭包是内联的
`myMethod(arg1, { println 'Hello World' })`
6. 如果最后一个参数是闭包，那就可以把它移到圆括弧外面  
`myMethod(arg1) { println 'Hello World' }`  

尤其要注意下‘3’和‘6’，是否看起来有点眼熟？  

### Gradle
Now we know mechanics, but how it is related to actual Gradle scripts? Let's take simple Gradle script as an example and try to understand it:

### Gradle
了解到这里也差不多了，下面我们结合真实的Gradle脚本来演示下，这也能让我们更好的理解上面讲到的东西：

~~~gradle
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.2.3'
    }
}

allprojects {
    repositories {
        jcenter()
    }
}
~~~

Look at that! Knowing Groovy syntax we can somewhat understand what is happening here!

* there is (somewhere) a `buildscript` method which accepts closure:  
`def buildscript(Closure closure)`

* there is (somewhere) a `allprojects` method which accepts closure:

`def allprojects(Closure closure)`

...and so on.

This is cool, but this information alone is not particularly helpful... What does "somewhere" mean? We need to know exactly where this method is declared.

And the answer is - [Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)  

瞅瞅！知道Groovy语法的话就大概能理解上面那些代码是啥意思了！

* 在某个地方定义了一个`buildscript`方法，并且这个方法接收一个闭包：  
`def buildscript(Closure closure)`
* 在某个地方定义了一个`allprojects`方法，并且这个方法接收一个闭包：  
`def allprojects(Closure closure)`

....等等等等。

挺不错的嘛，但仅仅知道这些并没多大用。在某个地方又是啥意思？我想知道定义这个方法的确切位置。

问题的答案就是-[Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)  

### Project
This is a **key** for understanding Gradle scripts:

> All top level statements within build script are delegated to `Project` instance

This means that [Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) - is the starting point for all my searches.

This being said - let's try to find `buildscript` method.  

### Project
Project是理解Gradle脚本的关键：  
> 构建脚本中所有的顶级语句都会被代理到`Project`实例上。
 
这就意味着我们要从[Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)开始找起。  

我们先试着查找下`buildscript`方法。  

If we search for `buildscript` - we will find [buildscript {}](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:buildscript(groovy.lang.Closure)) script block. But wait.. What the hell is script block??? According to [documentation](https://docs.gradle.org/current/dsl/):

> A script block is a method call which takes a closure as a parameter

Ok! We found it! That's exactly what happens when we call `buildscript { ... }` - we execute method `buildscript` which accepts Closure.  

如果我们查找`buildscript`就会找到[buildscript {}](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:buildscript(groovy.lang.Closure))脚本块。但是脚本块又是个什么鬼？[官方文档](https://docs.gradle.org/current/dsl/)是这么解释的：  
> 脚本块就是接收一个闭包为参数的回调方法。  

没错，就是它了。当我们调用`buildscript`方法的时候，就是调用了了`buildscript { ... }`脚本块，它接收一个闭包作为参数。  

If we keep reading `buildscript` documentation - it says: Delegates to: 
[ScriptHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html) from buildscript. It means that execution scope for the closure we pass as an input parameter will be changed to ScriptHandler. In our case we passed closure which executes `repositories(Closure)` and `dependencies(Closure)` methods. Since closure is delegated to `ScriptHandler`, let's try to search for `dependencies` method within `ScriptHandler` class.  

如果我们继续查阅`buildscript`文档，有这么一句话：_从buildscript代理到[ScriptHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html)。_也就是说在执行阶段，作为参数穿进去的闭包会被变成ScriptHandler。在我们的例子中，我们传递了执行`repositories(Closure)` 和 `dependencies(Closure)` 方法的闭包。既然闭包会被代理到`ScriptHandler`上，那就在`ScriptHandler`类中查下`dependencies`方法。  

And here it is - [void dependencies(Closure configureClosure)](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html#dependencies(groovy.lang.Closure)), which according to documentation, configures dependencies for the script. Here we are seeing another terminology: Executes the given closure against the DependencyHandler. Which means exactly the same as "**delegates to [something]**" - this closure will be executed in scope of another class (in our case - [DependencyHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/artifacts/dsl/DependencyHandler.html))

> "**delegates to [something]**" and "**configures [something]**" - 2 statements which mean exactly the same - closure will be execute against specified class.

Gradle extensively uses this delegation strategy, so it is really important to understand terminology here.  

我们找到了[void dependencies(Closure configureClosure)](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html#dependencies(groovy.lang.Closure))，文档的解释是：给脚本配置依赖。这里我们又碰到个术语：在DependencyHandler上执行给定闭包。这跟**代理到某某某**是一个意思——这个闭包将会在另外一个类的作用域内执行。(在我们的例子中就是[DependencyHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/artifacts/dsl/DependencyHandler.html))  

> "**代理到某某某**“和”**配置某某某**“这两句话完全是一个意思——闭包会在某个指定的类上执行。  

Gradle中大量用到这种代理策略，所以理解这个术语非常重要。  

For the sake of completeness, let's see what is happening when we execute closure `{classpath 'com.android.tools.build:gradle:1.2.3'}` within `DependencyHandler` context. According to documentation this class configures dependencies for given configuration and the syntax should be: 
`<configurationName> <dependencyNotation1>`

So with our closure we are configuring configuration with name `classpath` to use `com.android.tools.build:gradle:1.2.3` as a dependency。  

让我们把剩下的讲完，我们来看看在`DependencyHandler`上下文中执行`{classpath 'com.android.tools.build:gradle:1.2.3'}`闭包会发生什么。文档中是这么描述的：用给定的配置来配置依赖。语法是：`<configurationName> <dependencyNotation1>`  

所以我们的闭包就是用`classpath`这个配置把`com.android.tools.build:gradle:1.2.3`配置为依赖。  

### Script blocks
By default, there is a set of pre-defined script blocks within `Project`, but Gradle plugins are allowed to add new script blocks!

It means that if you are seeing something like `something { ... }` at the top level of your build script and you couldn't find neither script block or method which accepts closure in the documentation - most likely some plugin which you applied added this script block.  

### 脚本块
`Project`中默认定义了一些脚本块，但是你可以通过Gradle插件定义新的脚本块。  

这就意味着如果你在你的构建脚本中看到类似`something { ... }`的代码，但你却在文档中找不到这个脚本块或者类似的接收闭包的方法。很可能就是你使用了某个插件，这个插件定义了这个脚本块。  

#### `android` Script block
Let's take a look at the default Android `app/build.gradle` build script:

~~~grale
apply plugin: 'com.android.application'
android {
    compileSdkVersion 22
    buildToolsVersion "22.0.1"

    defaultConfig {
        applicationId "com.trickyandroid.testapp"
        minSdkVersion 16
        targetSdkVersion 22
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
~~~

#### `android`脚本块
我们来看一眼Android项目的默认构建脚本，它位于项目的`app/build.gradle`路径中：   

As we can see, it seems like there should be `android `method which accepts Closure as a parameter. But if we try to search for such method in `Project` documentation - we won't find any. And the reason for that is simple - there is no such method :)  

可以看到，好像应该有一个叫`android`的方法，这个方法接收一个闭包作为参数。但是，如果我们在`Project`文档中找不到这个方法。原因很简单，Project中本来就没有这个方法。 

If you look closely to the build script - you can see that before we execute `android` method - we apply `com.android.application` plugin! And that's the answer! Android application plugin extends `Project` object with `android` script block (which is simply a method which accepts Closure and delegates it to `AppExtension` class[1](http://trickyandroid.com/gradle-tip-2-understanding-syntax/#fn:1)).  

如果你仔细看看构建脚本，你会发现在执行`android`方法之前，我们使用了`com.android.application`插件！这就是问题的答案了！Android应用插件继承了`Project`，定义了`android`脚本块(接收闭包作为参数并且代理到`AppExtension`类[1](http://trickyandroid.com/gradle-tip-2-understanding-syntax/#fn:1))  

But where can I find Android plugin documentation? And the answer is - you can download documentation from the official [Android Tools website](https://developer.android.com/tools/building/plugin-for-gradle.html) (or here is a [direct link to documentation](https://developer.android.com/shareables/sdk-tools/android-gradle-plugin-dsl.zip)).

  
那我们去哪找Android插件的文档呢？你可以去[Android工具网](https://developer.android.com/tools/building/plugin-for-gradle.html)的官网下载这个文档，或者用这个[下载链接](https://developer.android.com/shareables/sdk-tools/android-gradle-plugin-dsl.zip)直接下载。  

If we open `AppExtension` documentation - we will find all the methods and attributes from our build script:

1. `compileSdkVersion 22`. if we search for `compileSdkVersion` we will find property. In this case we assign `"22"` to property `compileSdkVersion`
2. the same story with `buildToolsVersion`
3. `defaultConfig` - is a script block which delegates execution to ProductFlavor class
4. .....and so on  

So now we have really powerful ability to understand the syntax of Gradle build scripts and search for documentation.

如果我们打开`AppExtension`文档看看，我们我可找到所有在构建脚本中看到的方法和属性：

1. `compileSdkVersion 22`。如果搜索下`compileSdkVersion`就能找到这个属性。上面的例子中给这个属性赋值`22`  
2. `buildToolsVersion`也是类似的  
3. `defaultConfig`是个脚本块，它被代理给了`ProductFlavor`类  
4. 等等......  

现在我们就能理解Gradle构建脚本的语法并且会查阅文档了。  

### Exercise
With this powerful ability (oh, that's sounds awesome), let's go ahead and try reconfigure something :)

In `AppExtension` I found script block `testOptions` which delegates Closure to `TestOptions` class. Going to `TestOptions` class we can see that there are 2 properties: `reportDir` and `resultsDir`. According to documentation, `reportDir` is responsible for test report location. Let's change it!

~~~gradle
android {
......
    testOptions {
        reportDir "$rootDir/test_reports"
    }
}
~~~

###练习
学了这么多新技能，接下来我们来操练操练，试着重新配置下一些东西。

在`AppExtension`中我发现了`testOptions`脚本块，它的闭包被代理到`TestOptions`类。查看`TestOptions`类，我们发现它有两个属性：`reportDir`和`resultsDir`。根据文档的解释：`reportDir`的作用是制定测试报告的存储路径。我们更改下它的值！

Here I used `rootDir` property from `Project` class which points to the root project directory.

So now if I execute `./gradlew connectedCheck`, my test report will go into `[rootProject]/test_reports `directory.

Please don't do this in your real project - all build artifacts should go into `build` dir, so you don't pollute your project structure.  

这里使用了`Project`的`rootDir`属性，它指向工程的根目录。  

所以，如果我们现在执行`./gradlew connectedCheck`,测试报告就会被存放到`[rootProject]/test_reports`目录底下。  

为了避免破坏了你的项目结构，千万不要在你的实际项目中这么干。因为所有的构建内容默认都会存放在`build`目录中。