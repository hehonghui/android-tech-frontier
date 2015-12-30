Gradle小知识#3：任务的顺序
---

> * 原文链接 : [Gradle tip #3: Tasks ordering](http://trickyandroid.com/gradle-tip-3-tasks-ordering/)
* 原文作者 : [Tricky Android](http://trickyandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

我发现在使用Gradle的过程中遇到的很多问题都跟任务的顺序有关系，不管是已经存在的任务还是我自定义的任务。很显然，如果任务能在正确的时间执行的话，构建任务就能更好的工作了。

所以让我们深入了解下怎么更改任务的执行上顺序这个问题。

### dependsOn
我觉得让某个任务在另一个任务之后执行的最简单的方法就是使用[`dependsOn`](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:dependsOn(java.lang.Object[]))方法。  

假设有一个任务`A`，现在我们要添加一个任务`B`并且任务`B`只有在任务`A`执行后它才会执行：  

![](http://trickyandroid.com/content/images/2015/07/1-3.png)  

先来定义两个任务，任务`A`和`B`：

~~~gradle
task A << {println 'Hello from A'}
task B << {println 'Hello from B'}
~~~

然后你要做的就是告诉Gradle任务`B`依赖于任务`A`

~~~gradle
B.dependsOn A
~~~

这样不管什么时候我执行任务`B`，Gradle也会执行任务`A`

~~~gradle
paveldudka$ gradle B
:A
Hello from A
:B
Hello from B
~~~  

另外，你也可以在任务的配置部分声明类似的依赖关系：

~~~gradle
task A << {println 'Hello from A'}
task B {
    dependsOn A
    doLast {
        println 'Hello from B'  
    }
}
~~~

效果是一样的。  

但是如果想把我们的任务插入到已经存在的任务流中该怎么做？  

![](http://trickyandroid.com/content/images/2015/07/2.png)   

步骤基本是一样的。  

原本的任务流程是这样的：  

~~~gradle
task A << {println 'Hello from A'}
task B << {println 'Hello from B'}
task C << {println 'Hello from C'}

B.dependsOn A
C.dependsOn B
~~~

我们的新任务是这样的：

~~~gradle
task B1 << {println 'Hello from B1'}
B1.dependsOn B
C.dependsOn B1
~~~
输出：

~~~gradle
paveldudka$ gradle C
:A
Hello from A
:B
Hello from B
:B1
Hello from B1
:C
Hello from C
~~~

可以看到**dependsOn**方法把新任务添加到一个依赖序列当中去了。因此一个任务依赖多个任务也是完全可以的：  

![](http://trickyandroid.com/content/images/2015/07/3.png)  

~~~gradle
task B1 << {println 'Hello from B1'}
B1.dependsOn B
B1.dependsOn Q
~~~  
输出：

~~~gradle
paveldudka$ gradle B1
:A
Hello from A
:B
Hello from B
:Q
Hello from Q
:B1
Hello from B1
~~~  

### mustRunAfter
想象一下我们的任务依赖其他两个任务。下面我会使用一个更真实点的例子。假如我有一个任务执行单元测试，另一个任务做UI测试，还有一个任务单元测试和UI测试都做：  

![](http://trickyandroid.com/content/images/2015/07/4.png)  

~~~gradle
task unit << {println 'Hello from unit tests'}
task ui << {println 'Hello from UI tests'}
task tests << {println 'Hello from all tests!'}

tests.dependsOn unit
tests.dependsOn ui
~~~
输出： 

~~~gradle
paveldudka$ gradle tests
:ui
Hello from UI tests
:unit
Hello from unit tests
:tests
Hello from all tests!
~~~ 

尽管`unit`任务和`UI`测试任务会在`tests`任务之前执行，但是`unit`和`UI`这两个任务的执行顺序并不确定。现在我猜测他们是按照字母表的顺序执行的，但这种行为只是通过实践而猜测出来的，你不应该依赖于这种猜测。  

我们知道UI测试的执行时间要比单元测试的执行时间长的多，所以我想让单元测试的任务先执行，只有单元测试执行正确然后才执行UI测试的任务。那么我应该怎么做才能达到这样的效果，即单元测试任务在UI测试任务之前执行？  

![](http://trickyandroid.com/content/images/2015/07/5.png)  

~~~gradle
task unit << {println 'Hello from unit tests'}
task ui << {println 'Hello from UI tests'}
task tests << {println 'Hello from all tests!'}

tests.dependsOn unit
tests.dependsOn ui
ui.dependsOn unit // <-- I added this dependency
~~~
输出

~~~gradle
paveldudka$ gradle tests
:unit
Hello from unit tests
:ui
Hello from UI tests
:tests
Hello from all tests!
~~~

这样写单元测试就会在UI测试之前执行了！还不错！  

**但是！** 这样写有一个比较恶心的问题！UI测试其实并不会依赖于单元测试。我想要UI测试可以单独的执行，但是现在的情况是每次我想执行UI测试的任务，单元测试的任务也会被执行！    

[`mustRunAfter`](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:mustRunAfter(java.lang.Object[]))就可以解决这样的问题。它通过方法参数告诉Gradle该任务在哪个任务`之后`执行。因此，我们不需要为单元测试和UI测试指定依赖关系，而是当他们两个任务同时执行的时候，会给单元测试更高的执行优先级。这样单元测试就先于UI测试执行了：

~~~gradle
task unit << {println 'Hello from unit tests'}
task ui << {println 'Hello from UI tests'}
task tests << {println 'Hello from all tests!'}

tests.dependsOn unit
tests.dependsOn ui
ui.mustRunAfter unit
~~~
输出

~~~gradle
paveldudka$ gradle tests
:unit
Hello from unit tests
:ui
Hello from UI tests
:tests
Hello from all tests!
~~~

现在依赖关系就是这样的了：  

![](http://trickyandroid.com/content/images/2015/07/6.png)  

可以看到UI测试和单元测试没有显式的依赖关系！现在如果我单独执行UI测试，单元测试就不会被执行。

> 需要注意的是： 在Gradle2.4中`mustRunAfter`被标记为_"测试的"_。这就意味着这个特性是个试验性质的，它的行为在将来的版本中可能被修改。

### finalizedBy
现在我有个可以运行UI测试和单元测试的任务。假如每个测试都会生成一份测试报告，所以我想创建一个任务把这两份测试报告合并成一份：  

![](http://trickyandroid.com/content/images/2015/07/7.png)  

~~~gradle
task unit << {println 'Hello from unit tests'}
task ui << {println 'Hello from UI tests'}
task tests << {println 'Hello from all tests!'}
task mergeReports << {println 'Merging test reports'}

tests.dependsOn unit
tests.dependsOn ui
ui.mustRunAfter unit
mergeReports.dependsOn tests
~~~ 

现在如果我想要两个测试的报告，我就会执行`mergeReports`这个任务：  

~~~gradle
paveldudka$ gradle mergeReports
:unit
Hello from unit tests
:ui
Hello from UI tests
:tests
Hello from all tests!
:mergeReports
Merging test reports
~~~  

虽然正常运行了，但却有点问题。站在用户(指开发人员)的角度来看，`mergeReports`好像没啥实际意义。我想执行`tests`任务就能获得相应的报告。显然，我可以把合并报告的逻辑放在`tests`任务中，但是我更愿意把`mergeReports`的逻辑分离出来。  

[finalizedBy](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:finalizedBy(java.lang.Object[]))方法可以帮你解决这个问题。从它的名字就可以看出，它是某个任务的终结者任务。  

现在我们可以像下面这样修改我们的脚本：  

~~~gradle
task unit << {println 'Hello from unit tests'}
task ui << {println 'Hello from UI tests'}
task tests << {println 'Hello from all tests!'}
task mergeReports << {println 'Merging test reports'}

tests.dependsOn unit
tests.dependsOn ui
ui.mustRunAfter unit
mergeReports.dependsOn tests

tests.finalizedBy mergeReports
~~~

现在我可以执行`tests`任务，而且还能得到测试报告：

~~~gradle
paveldudka$ gradle tests
:unit
Hello from unit tests
:ui
Hello from UI tests
:tests
Hello from all tests!
:mergeReports
Merging test reports
~~~  

> 需要注意的是：在Gradle2.4中`finalizedBy`被标记为_"测试的"_，也就是说这是个实验性质的特性，它的行为在将来的版本中可能会被修改。

差不多也就这么多内容了。使用这三个方法你就可以很好的控制你的构建过程了。

