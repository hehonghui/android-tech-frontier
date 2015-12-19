Gradle小知识#1：tasks
---

> * 原文链接 : [Gradle tip #1: tasks](http://trickyandroid.com/gradle-tip-1-tasks/)
* 原文作者 : [Tricky Android](http://trickyandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

With this post I would like to start series of Gradle-related topics I wish I knew when I first started writing Gradle build scripts.  

从这篇博文开始我打算开启关于Gradle相关知识的一些列博文。现在想想，如果我刚开始接触Gradle的时候知道这些知识的话那该多好啊。 

Today we will talk about Gradle **tasks** and specifically **configuration** and **execution** parts of the task. Since these terms might appear unknown to vast majority of readers, it will be easier to have real examples. Essentially (sorry for looking ahead), we will try to figure out what is the difference between these 3 examples:

~~~gradle
task myTask {
    println "Hello, World!"
}

task myTask {
    doLast {
        println "Hello, World!"
    }
}

task myTask << {
    println "Hello, World!"
}
~~~  

今天我们来聊聊Gradle的**任务**，尤其是任务的配置和执行部分。因为这块知识对很多读者来说还不是很清楚，所以通过一个真实的例子来说明下就再好不过了。大体上(抱歉有点超前)我们是想要弄清楚下面这三个例子到底有啥区别：

~~~gradle
task myTask {
    println "Hello, World!"
}

task myTask {
    doLast {
        println "Hello, World!"
    }
}

task myTask << {
    println "Hello, World!"
}
~~~  
My goal - is to create a task which prints "Hello, World!" when I execute it. 
When I first started, my first guess was to implement it like this:  

~~~gradle
task myTask {
    println "Hello, World!"
}
~~~
我的目的是创建一个任务，当这个任务被执行的时候它能打印"Hello， World!"。一开始，我是这样实现的：

~~~gradle
task myTask {
    println "Hello, World!"
}
~~~
Now, let's try to execute my new task!

~~~gradle
user$ gradle myTask
Hello, World!
:myTask UP-TO-DATE
~~~
现在我们执行下这个任务！

~~~gradle
user$ gradle myTask
Hello, World!
:myTask UP-TO-DATE
~~~  

It seems to be working! It prints "Hello, World!". 
**But!*** It doesn't work as we might expect it to work. And here is why. Let's try to call `gradle tasks` to see what other tasks are available:

~~~gradle
user$ gradle tasks
Hello, World!
:tasks

------------------------------------------------------------
All tasks runnable from root project
------------------------------------------------------------

Build Setup tasks
-----------------
init - Initializes a new Gradle build. [incubating]
..........
~~~

这好像没啥问题。正确的打印出了“Hello, World!”
**但是，**这并没有按照我们预想的那样工作。下面让我告诉你为什么。我们试着调用下`gradle tasks`看看还有其他什么能执行的任务没：

~~~gradle
user$ gradle tasks
Hello, World!
:tasks

------------------------------------------------------------
All tasks runnable from root project
------------------------------------------------------------

Build Setup tasks
-----------------
init - Initializes a new Gradle build. [incubating]
..........
~~~
Wait a second! Why my "Hello, World!" string is printed? I just called `tasks`, I didn't call my custom task!

The reason why this is happening - is that Gradle **task** has 2 major stages in its lifecycle:

* Configuration stage
* Execution stage

I might not be super precise with terminology here, but this analogy helped me to understand tasks.  

等等！为什么打印了"Hello, World!"？我只是调用了`tasks`，我并没有调用我定义的任务呀！

原因就是在Gradle`任务`的生命周期中，有两个重要的阶段：

* 配置阶段
* 执行阶段

我对这些专业术语可能不太熟悉，但类比一下可以帮助我更好的理解Gradle的任务。

The thing is that Gradle **has to configure all** tasks specified in build script **before** actual build is started. It doesn't matter if certain task will be executed - it still needs to be configured.

Knowing that, how do I know which part of my task is evaluated during configuration and which one during execution? 
And the answer is - the part specified within the top-level of the task - is **task configuration section**. I.e:

~~~gradle
task myTask {
    def name = "Pavel" //<-- this is evaluated during configuration
    println "Hello, World!"////<-- this is also evaluated during configuration
}
~~~

事情是这样的，Gradle在真正进行构建**之前**，**必须把构建脚本中定义的所有任务配置一下**。不管这个任务是不要要被执行，它都要先配置一下。

既然了解了这一点，但我又该怎么知道任务中哪部分是在配置阶段执行，哪部分又是在执行阶段执行呢？答案就是：任务中的顶层部分是**配置阶段**会执行的代码。比如：

~~~gradle
task myTask {
    def name = "Pavel" //<-- this is evaluated during configuration
    println "Hello, World!"////<-- this is also evaluated during configuration
}
~~~

That's why when I call `gradle tasks` I can see "Hello, World!" - this is our configuration section is executed. But that's not really what I want - I want "Hello, World!" to be printed only when I explicitly call my task.

So how do I tell Gradle to do something when my tasks is executed?

这就是为什么我只是调用了`gradle tasks`，但却打印了"Hello, World!"。因为这部分代码在配置阶段执行了。但这并不是我想要的。我想要的是这段代码只有在我调用我的任务的时候才去执行。

那么，我该怎么告诉Gradle当我执行我的任务的时候才去做一些事情呢？

In order to do that I need to specify task Action. The easiest way to specify task action is via [Task#doLast()](https://www.gradle.org/docs/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:doLast(groovy.lang.Closure)) method:

~~~gradle
task myTask {
    def text = 'Hello, World!' //configure my task
    doLast {
        println text //this is executed when my task is called
    }
}
~~~
Now my "Hello, World!" string will be printed only when I explicitly call `gradle myTask`

这时我就需要给任务指定一个动作。最简单的做法就是通过[Task#doLast()](https://www.gradle.org/docs/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:doLast(groovy.lang.Closure))方法：

~~~gradle
task myTask {
    def text = 'Hello, World!' //configure my task
    doLast {
        println text //this is executed when my task is called
    }
}
~~~

现在，"Hello, World!"只有在我显式的调用`gradle myTask`的时候才会打印出来。

Cool, now I know how to configure **and** make my task do real work only when I invoke it. What about that third option with `<<` symbol?:

~~~
task myTask2 << {
    println "Hello, World!" 
}
~~~
This version is just a shortcut of `doLast` version, i.e. it is exactly the same as I would write:

~~~gradle
task myTask {
    doLast {
        println 'Hello, World!' //this is executed when my task is called
    }
}
~~~
However, since now everything goes into execution part, I cannot configure my task the same way I did it with `doLast` option (it is still possible to do, but in a slightly different way). So this option is good for really small tasks which do not require configuration, but if you have some task other than printing a "Hello, World!" - you might consider going with `doLast`.

Cool！现在我知道怎么配置任务并且让任务只有在我明确调用的时候才会做真正的工作。那么第三个例子中的`<<`又是啥？：

~~~
task myTask2 << {
    println "Hello, World!" 
}
~~~

这只是`doLast`的简写版本而已。这跟下面的写法完全一样：

~~~gradle
task myTask {
    doLast {
        println 'Hello, World!' //this is executed when my task is called
    }
}
~~~
但是，既然所有的代码都在执行部分了，那我就不能像`doLast`写法那样配置我的任务了(放心吧，还是可以的，只是稍微有点不同而已)。这种简写方式对那些不需要进行配置的小任务来说很方便。但是，如果你的任务不仅仅像打印"Hello, World!"这么简单的话，那还是建议考虑使用`doLast`这种写法。