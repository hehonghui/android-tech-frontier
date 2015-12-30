Gradle小知识#2：学学语法
---

> * 原文链接 : [Gradle tip #2: understanding syntax](http://trickyandroid.com/gradle-tip-2-understanding-syntax/)
* 原文作者 : [Tricky Android](http://trickyandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

在第一部分，我们聊了下Gradle中的任务以及构建过程中的不同阶段。但是，在我发布上篇文章之后我意识到在继续深入Gradle之前，我们最好了解下Gradle的语法。以免被复杂的`build.gradle`脚本吓到。所以这篇我们来聊聊Gradle的语法。

### 语法
Gradle构建脚本是使用[Groovy](http://www.groovy-lang.org/)语言写的。所以在继续深入之前我想说几个Groovy中比较重要的概念。Groovy的语法跟Java语法很类似，所以希望你在理解上不会有大问题。 

如果你对Groovy比较熟悉，那你可以跳过这部分。

要理解Gradle脚本，你需要明白Groovy中很重要的一个概念——闭包。

#### 闭包
要理解Gradle就必须搞明白[`闭包`](http://www.groovy-lang.org/closures.html)这个重要的概念。闭包是一个独立的代码块，它可以接收参数、可以有返回值，而且还可以赋值给变量。有点像`Callable`接口、`Future`和方法指针的混合体，随便你怎么叫。

大体来说就是个代码块，当你调用它的时候它才会执行，而非创建时就执行。下面是一个简单的闭包的例子：

~~~gradle
def myClosure = { println 'Hello world!' }

//execute our closure
myClosure()

#output: Hello world!
~~~ 

亦或是接收一个参数的闭包：

~~~gradle
def myClosure = {String str -> println str }

//execute our closure
myClosure('Hello world!')

#output: Hello world!
~~~
如果闭包只有一个参数，那这个参数可以通过`it`来引用：

~~~gradle
def myClosure = {println it }

//execute our closure
myClosure('Hello world!')

#output: Hello world!
~~~ 

接收多个参数的闭包：

~~~gradle
def myClosure = {String str, int num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)

#output: my string : 21
~~~  

顺便插一句，闭包的参数类型是可选的。所以上面的例子可以简写成下面这样：  

~~~gradle
def myClosure = {str, num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)

#output: my string : 21
~~~  

闭包可以引用它所在上下文环境中的变量，这一点非常酷。这个上下文环境默认是闭包被创建时所在的类：

~~~gradle
def myVar = 'Hello World!'
def myClosure = {println myVar}
myClosure()

#output: Hello world!
~~~

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

如你所见，在我们创建闭包的时候，`myVar`变量还不存在。但这都不是事，只要我们执行闭包的时候，它存在于闭包的上下文环境中就行。

在这个例子中，在闭包执行之前，我修改了闭包的上下文环境。所以`myVar`就可以被引用到了。  

#### 把闭包当做参数来传递
闭包的真正好处是：你可以把它当做参数传递给不同的方法。这可以帮助我们解耦执行逻辑。

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

瞅瞅！知道Groovy语法的话就大概能理解上面那些代码是啥意思了！

* 在某个地方定义了一个`buildscript`方法，并且这个方法接收一个闭包：  
`def buildscript(Closure closure)`
* 在某个地方定义了一个`allprojects`方法，并且这个方法接收一个闭包：  
`def allprojects(Closure closure)`

....等等等等。

挺不错的嘛，但仅仅知道这些并没多大用。在某个地方又是啥意思？我想知道定义这个方法的确切位置。

问题的答案就是-[Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)  

### Project
Project是理解Gradle脚本的关键：  
> 构建脚本中所有的顶级语句都会被代理到`Project`实例上。
 
这就意味着我们要从[Project](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html)开始找起。  

我们先试着查找下`buildscript`方法。  

如果我们查找`buildscript`就会找到[buildscript {}](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#org.gradle.api.Project:buildscript(groovy.lang.Closure))脚本块。但是脚本块又是个什么鬼？[官方文档](https://docs.gradle.org/current/dsl/)是这么解释的：  
> 脚本块就是接收一个闭包为参数的回调方法。  

没错，就是它了。当我们调用`buildscript`方法的时候，就是调用了`buildscript { ... }`脚本块，它接收一个闭包作为参数。  

如果我们继续查阅`buildscript`文档，有这么一句话：_从buildscript代理到[ScriptHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html)。_也就是说在执行阶段，作为参数穿进去的闭包会被变成ScriptHandler。在我们的例子中，我们传递了执行`repositories(Closure)` 和 `dependencies(Closure)` 方法的闭包。既然闭包会被代理到`ScriptHandler`上，那就在`ScriptHandler`类中查下`dependencies`方法。  

我们找到了[void dependencies(Closure configureClosure)](https://docs.gradle.org/current/javadoc/org/gradle/api/initialization/dsl/ScriptHandler.html#dependencies(groovy.lang.Closure))，文档的解释是：给脚本配置依赖。这里我们又碰到个术语：在DependencyHandler上执行给定闭包。这跟**代理到某某某**是一个意思——这个闭包将会在另外一个类的作用域内执行。(在我们的例子中就是[DependencyHandler](https://docs.gradle.org/current/javadoc/org/gradle/api/artifacts/dsl/DependencyHandler.html))  

> "**代理到某某某**“和”**配置某某某**“这两句话完全是一个意思——闭包会在某个指定的类上执行。  

Gradle中大量用到这种代理策略，所以理解这个术语非常重要。  

让我们把剩下的讲完，我们来看看在`DependencyHandler`上下文中执行`{classpath 'com.android.tools.build:gradle:1.2.3'}`闭包会发生什么。文档中是这么描述的：用给定的配置来配置依赖。语法是：`<configurationName> <dependencyNotation1>`  

所以我们的闭包就是用`classpath`这个配置把`com.android.tools.build:gradle:1.2.3`配置为依赖。  

### 脚本块
`Project`中默认定义了一些脚本块，但是你可以通过Gradle插件定义新的脚本块。  

这就意味着如果你在你的构建脚本中看到类似`something { ... }`的代码，但你却在文档中找不到这个脚本块或者类似的接收闭包的方法。很可能就是你使用了某个插件，这个插件定义了这个脚本块。  

#### `android`脚本块
我们来看一眼Android项目的默认构建脚本，它位于项目的`app/build.gradle`路径中：   

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

可以看到，好像应该有一个叫`android`的方法，这个方法接收一个闭包作为参数。但是，如果我们在`Project`文档中找不到这个方法。原因很简单，Project中本来就没有这个方法。 

如果你仔细看看构建脚本，你会发现在执行`android`方法之前，我们使用了`com.android.application`插件！这就是问题的答案了！Android应用插件继承了`Project`，定义了`android`脚本块(接收闭包作为参数并且代理到`AppExtension`类[1](http://trickyandroid.com/gradle-tip-2-understanding-syntax/#fn:1))  
  
那我们去哪找Android插件的文档呢？你可以去[Android工具网](https://developer.android.com/tools/building/plugin-for-gradle.html)的官网下载这个文档，或者用这个[下载链接](https://developer.android.com/shareables/sdk-tools/android-gradle-plugin-dsl.zip)直接下载。  

如果我们打开`AppExtension`文档看看，我们我可找到所有在构建脚本中看到的方法和属性：

1. `compileSdkVersion 22`。如果搜索下`compileSdkVersion`就能找到这个属性。上面的例子中给这个属性赋值`22`  
2. `buildToolsVersion`也是类似的  
3. `defaultConfig`是个脚本块，它被代理给了`ProductFlavor`类  
4. 等等......  

现在我们就能理解Gradle构建脚本的语法并且会查阅文档了。  

###练习
学了这么多新技能，接下来我们来操练操练，试着重新配置下一些东西。

在`AppExtension`中我发现了`testOptions`脚本块，它的闭包被代理到`TestOptions`类。查看`TestOptions`类，我们发现它有两个属性：`reportDir`和`resultsDir`。根据文档的解释：`reportDir`的作用是制定测试报告的存储路径。我们更改下它的值！

~~~gradle
android {
......
    testOptions {
        reportDir "$rootDir/test_reports"
    }
}
~~~

这里使用了`Project`的`rootDir`属性，它指向工程的根目录。  

所以，如果我们现在执行`./gradlew connectedCheck`,测试报告就会被存放到`[rootProject]/test_reports`目录底下。  

为了避免破坏了你的项目结构，千万不要在你的实际项目中这么干。因为所有的构建内容默认都会存放在`build`目录中。