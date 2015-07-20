gradle技巧之语法浅谈
---

> * 原文链接 : [Gradle tip #2: understanding syntax](http://trickyandroid.com/gradle-tip-2-understanding-syntax/)
* 原文作者 : [Pavlo Dudka](http://trickyandroid.com/#blog)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [FTExplore](https://github.com/FTExplore) 
* 校对者 : [chaossss](https://github.com/chaossss)
* 状态 :  完成 


# 回顾

在上一篇的博文(Gradle tip #2 : Tasks)中,我们讨论了gradle构建的基本单位Task. 并且介绍了构建过程的各个阶段及其生命周期.而本文会重点介绍gradle的语法.只有具备了gradle
的相关语法知识,才会大幅度的提高对于阅读、学习或者编写gradle脚本的效率,正所谓"磨刀不误砍柴工"是也.

# 引言

gradle 是groovy语言实现的构建工具. groovy是运行在jvm平台的一门敏捷开发语言.其语法和java有诸多类似之处,然而其具备一些java没有的概念需要读者细细体会.下面会详细的介绍
groovy的基本语法,当然如果您已经对groovy的语法有了一定的了解.可以直接跳过这一小节.

## 1、闭包的基本语法

闭包是groovy中最重要的概念之一. 简单地说闭包(Closures)是一段代码块. 这个代码块可以接受参数并具有返回值. 有一点要非常注意的是, 闭包往往不是在需要使用的时候才写出来
这么一段代码(就像Java的匿名类那样), 通过def 关键字可以声明一个变量代表一个闭包,然后在需要的时候直接使用该变量即可,多说无益,请看如下的例子:

#### 一个简单的hello world闭包:

```
def myClosure = { println 'Hello world!' }

//execute our closure
myClosure()
```

output: Hello world!

#### 如下是一个接受参数的闭包的例子:

```
def myClosure = {String str -> println str }

//execute our closure
myClosure('Hello world!')
```

output: Hello world!

#### 如果闭包只接受一个参数,这个参数在代码块中可以用it代替:

```
def myClosure = {println it }

//execute our closure
myClosure('Hello world!')
```

output: Hello world!

#### 如下是接受多个参数的闭包的例子:

```
def myClosure = {String str, int num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)
```

output: my string : 21

#### 闭包里面的参数类型可以省略不写,例子如下:

```
def myClosure = {str, num -> println "$str : $num" }

//execute our closure
myClosure('my string', 21)
```

output: my string : 21

#### 闭包还有一个比较酷的写法就是,可以直接调用context里面的变量,默认的context就是创建这个闭包的类(class) 例子如下:

```
def myVar = 'Hello World!'
def myClosure = {println myVar}
myClosure()
```

output: Hello world!

#### 上面提到了闭包可以直接调用context的变量,这个context可以通过setDelegate()方法来改变,极大的增加了闭包的灵活性！

```
def myClosure = {println myVar} //I'm referencing myVar from MyClass class
MyClass m = new MyClass()
myClosure.setDelegate(m)
myClosure()

class MyClass {
    def myVar = 'Hello from MyClass!'
}

```

output: Hello from MyClass!

## 2、闭包可以作为参数进行传递

在groovy中,将闭包作为参数传递进函数,是将逻辑进行分离解耦的重要手段.在上述的例子中,我们已经尝试了如何将闭包作为参数进行传递.下面我们总结一下传递闭包的方法:

#### 1 接受一个参数的函数
myMethod(myClosure)
#### 2 如果函数只接受一个参数,括号可以忽略
myMethod myClosure
#### 3 可以将闭包以插入语的形式创建
myMethod {println 'Hello World'}
#### 4 函数接受两个参数
myMethod(arg1, myClosure)
#### 5 接受两个参数,同样可以用插入语创建闭包
myMethod(arg1, { println 'Hello World' })
#### 6 如果存在多个参数,且最后一个参数是闭包,闭包可以不写在括号内
myMethod(arg1) { println 'Hello World' }


细心的朋友们是不是觉得上述的六种用法中,第三条和第六条很眼熟？很像gradle中的scripts了？

# Gradle

在知道了groovy的基本语法(尤其是闭包)之后,下面我们就以一个简单的gradle 脚本作为例子具体感受一下:

```
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
```

结合前文的例子,我们可以很容易的理解到,buildscript是一个接受闭包作为参数的函数,这个函数会在编译的时候被gradle调用.这个函数的定义就类似于:def buildscript(Closure closure).  而allprojects 同理也是一个接受闭包作为参数的函数.

那么问题来了,这些函数具体会在什么时候被gradle调用呢?要回答这个问题就需要介绍另一个知识点：Project

# Project

在这里,我觉得逐句翻译作者查阅文档的步骤没有太大的意义，我自己总结了一下作者的概念如下：

理解gradle配置文件中的script如何调用的关键就是理解project的相关概念.在gradle执行某个"任务"的时候,会按照各个task的依赖关系来依次执行. 而执行这些task的对象就是Project.说的在通俗一些,project就是你希望gradle为你做的事情,而要完成这些事情,需要将事情分成步骤一步一步的做,这些步骤就是task.

# Script blocks

通过前文的学习,我们已经很清楚的了解到scipt block就是一段接受闭包的函数,这些函数会被Project调用,默认的情况下,gradle 已经准备
好了很多script用于我们对项目进行配置,例如buildScript{} ... ... 当然你也可以自己写出符合规范的task来在编译的过程中被调用.

下面我们先看一下Android Studio中默认的script:

```
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
```

按照我们已经有的知识,上面的脚本说明有一个名称为android的函数,该函数接收闭包作为参数,然而其实在Gradle的文档中是不存在这个函数
的. 那么android脚本怎么会出现在这里呢? 答案就是最上面的apply plugin:
'com.android.application'.这个插件提供了android构建所需要的各种script.

既然gradle官方的文档中没有android相关的script信息,那我们该怎么查阅呢? 您可以去官方的android网站上查阅,如果懒得找的话请点击这个链接:https://developer.android.com/shareables/sdk-tools/android-gradle-plugin-dsl.zip

您下载了前文连接的文档后，可以发现有一个html格式的文档的名字是AppExtension, 这个文档主要就是介绍了Android configuration blocks. 即在gradle官方文档中没有的关于Android 配置的各种gradle script都可以在这里进行查阅(几个例子):
1、 compileSdkVersion 在文档中的描述是Required. Compile SDK version. 即这个脚本是gradle进行Android构建之必需,并且这个脚本是
是用来描述编译的时候使用的sdk版本.
2、buildToolsVersion在文档中的描述是Required. Version of the build tools to use. 即该脚本是构建之必需,其用于告诉gradle使用
哪个版本的build tools
3 ... ... (详细情况请参阅文档吧:))


# Exercise

有了前文的学习作为基础,我们已经了解了gradle语法以及android 插件的脚本查阅方法. 那么接下来我们实际运用这些知识,自定义的对我们
的Android项目进行一些配置. 在上述的AppExtension文档中,我查阅到了一个脚本的名字是testOptions. 这段脚本代表的是TestOption class
调用,TestOption class里有三个属性:reportDir、resultsDir 和unitTests. 而reportDir就是测试报告最后保存的位置,我们现在就来改一下
这个地方.

```
android {
......
    testOptions {
        reportDir "$rootDir/test_reports"
    }
}
```

在这里,我使用了"$rootDir/test_reports"作为测试结果的储存位置, $root 指向的就是项目的根目录.现在如果我通过命令行执行
./gradlew connectedCheck. gradle就会进行一系列的测试程序并且将测试报告保存在项目根目录下的test_reports文件中.

注意一点的是,这个关于测试的小例子,别用在你真是的生产环境中,尽量保持你项目结构的"清洁"

