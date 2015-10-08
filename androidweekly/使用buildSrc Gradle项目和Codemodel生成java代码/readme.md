#How to generate Java sources using buildSrc Gradle project and Codemodel
#使用buildSrc Gradle项目和Codemodel生成java代码

[Android](http://www.thedroidsonroids.com/category/blog/android/) • 1 September 2015

> * 原文链接 : [How to generate Java sources using buildSrc Gradle project and Codemodel](http://www.thedroidsonroids.com/blog/android/how-to-generate-java-sources-using-buildsrc-gradle-project/)
> * 原文作者 : [Karol](http://www.thedroidsonroids.com/blog/)
> * 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn/)> * 译者 : [shenyansycn](https://github.com/shenyansycn)> * 校对者 : 
> * 状态 : 校对中

##Introduction

假设现在你现在需要在Android应用中嵌入和解析外部数据，你会怎么做？在本文中我们将在应用中获取[互联网顶级域名(TLD)的列表](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains)。你可以在[ICANN TLD报告](http://stats.research.icann.org/dns/tld_report/)报告中看到一共有一千多种顶级域名，时不时有新域名的加入，也有旧的域名被废弃。

由于Android中管理TLDs的[API](https://developer.android.com/reference/android/util/Patterns.html#TOP_LEVEL_DOMAIN_STR)很快就过时了，不赞成使用。哪里能获得最新的TLD的列表呢？幸好这里有一个INAN维护的机器识别源:[IANA - Root Zone DataBase](https://data.iana.org/TLD/tlds-alpha-by-domain.txt).好了，我们已经获得了一个源，那如何在应用中嵌入呢？这里有一些方法，例如，我们可以下载文本文件到**assets**或者**res/raw**目录，运行时再解析。但这里有一个更有效的方法－应用编译前解析数据和运行时使用已经处理好的数据。我们可以使用所提供的方法叫**getTldList()**,它返回最新的TLDS。就像Android的编译工具在每次编译时自动刷新**R**类一样。

##生成的代码长什么样？

例子中的数据是一个字符串的列表，所以它可以被表示为**List****<****String****>**。域是独一无二的，它永远不能被编辑并且[List](http://developer.android.com/reference/java/util/List.html)接口提供稍微多一点的内容，比如索引。我们用一个方法创建了一个实用性的类，就像下边这样：

```
public final class TldList {
   	private static final List TLD_LIST = Collections.unmodifiableList(Arrays.asList(<TLDs here>));
    /**
     * javadoc here
     */
    public static List<String> getTldList() { 
        return TLD_LIST; 
    }
    private TldList() {}
}
```
 
##How to generate Java code automatically?
##如何自动生成Java代码

生成Java代码需要下载源文件并重写到Java源文件中。后者可以打印java语法元素到文件中。但更好的方法是使用专用库。在此情况下你不必担心大括号，换行符和其他语法元素只需要关注逻辑。在这个例子中使用的生成java代码的库是[Codemodel](https://codemodel.java.net/)。使用Codemodel生成代码是简单的。我们用Groovy编写Gradle本身和大部分的插件。

这里有生成好的代码：

```
public class TldListGenerator {

    private static final URL IANA_TLDS_URL = 
            new URL('https://data.iana.org/TLD/tlds-alpha-by-domain.txt')

    /**
     * Generates <code>pl.droidsonroids.domainnameutils.TldList</code> 
     * and places it into <code>outputDir</code>.
     * @param outputDir directory where generated sources will be written to
     * @param useSavedVersion if true then saved TLD data will be used instead of downloading it 
     * from IANA's website
     */
    public static void generateTldListClass(final File outputDir, final boolean useSavedVersion) {
        def javadocConfig = new ConfigSlurper()
                .parse(TldListGenerator.class.getResource('javadoc.properties'))
        def sourceUrl = useSavedVersion ?
                TldListGenerator.class.getResource('tlds-alpha-by-domain.txt')
                : IANA_TLDS_URL

        def codeModel = new JCodeModel()

        def fqcn = TldListGenerator.class.getPackage().getName() + '.TldList'
        def tldListClass = codeModel._class(PUBLIC | FINAL, fqcn, ClassType.CLASS)
        def classJavadoc = tldListClass.javadoc()
        classJavadoc.append(javadocConfig.getProperty('classJavadoc'))

        def listStringType = codeModel.ref(List.class).narrow(codeModel.ref(String.class))
        def asListInvocation = codeModel.directClass(Arrays.class.getName()).staticInvoke('asList')

        sourceUrl.eachLine {
            if (!it.startsWith('#')) {
                asListInvocation.arg(it.toLowerCase(Locale.ENGLISH))
            } else {
                classJavadoc.append('\n<br/>').append(it.replaceFirst('#\\s+', ''))
            }
            return
        }

        def constant = codeModel
                .directClass(Collections.class.getName())
                .staticInvoke('unmodifiableList')
                .arg(asListInvocation)
        def field = tldListClass.field(PRIVATE | STATIC | FINAL, listStringType, 'TLD_LIST', constant)
        def method = tldListClass.method(PUBLIC | STATIC, listStringType, 'getTldList')

        method.javadoc()
                .append(javadocConfig.getProperty('methodJavadoc'))
                .addReturn()
                .append(javadocConfig.getProperty('methodReturnJavadoc'))
        method.body()._return(field)
        tldListClass.constructor(PRIVATE)

        if (!outputDir.isDirectory() && !outputDir.mkdirs()) {
            throw new IOException('Could not create directory: ' + outputDir)
        }
        codeModel.build(outputDir)
    }
}
```

让我们解释下关键代码部分。在开始的部分我们使用[ConfigSlurper](http://docs.groovy-lang.org/latest/html/gapi/groovy/util/ConfigSlurper.html)从属性中加载java文档。属性是一对key-value，和代码位于不同文件中，并没有被混淆在一起，所有的java文档都在一个地方就像好Android的String资源。Codemodel API就像我们平时写代码一样调用方法即可。

读取输入使用[ResourceGroovyMethods#eachLine()](http://docs.groovy-lang.org/latest/html/api/org/codehaus/groovy/runtime/ResourceGroovyMethods.html#eachLine)方法，从URL中读取每一行内容就好像闭包（代码片段用大括号包围）。特别的变量**it**是一个String内容，是每一行的内容。刚开始的行是注释，所以我们可以写入到java文档中。其他的行包含TLDs，所以我们转换为小写字母写入代码中。所有的行被处理过后，源会被自动关闭。像java中的try-catch-finally或try-with-resources声明。

小写TLDs的操作设置为英语环境也是很重要的。如果没有则使用host提供的默认设置。例如：如果设置为土耳其或者阿塞拜疆，非ASII字符小写i会被当作一个小写的ASCII字符I，我们生成的一些TLDs就会无效。更多信息可以查看[Internationalizing Turkish](http://www.i18nguy.com/unicode/turkish-i18n.html).最终，我们创建了输出的目录结构并保存了生成的代码。

怎么处理错误，如果没有网络连接或者数据没有被下载会发生什么？如，你看到的没有**cactch**声明也无**throws**处理。在Groovy里我们是不需要的，所有的异常都是未被检查的被处理过。如果我们的代码抛出了异常，它仅仅引起Gradle编译失败，会在Android Studio的消息窗口和控制台中显示。

##哪里存放生成的代码

Gradle给我们提供了几个方式保存生成的代码，例如：

1.直接嵌入到我们App项目的**build.gradle**文件中

2.分开的文件。例如：**generator.gradle**和在**build.gradle**文件中使用**apply from: 'generator.gradle'**

3.[buildSrc project](https://docs.gradle.org/current/userguide/organizing_build_logic.html#sec:build_sources)

4.[standalone project](https://docs.gradle.org/current/userguide/custom_plugins.html#N16FA7)

头两个选项没有一点灵活性。例如：我们生成的代码不能很简单的测试，（特别是第一个）生成的代码与编译配置选项容易混淆让人难以读懂。剩余两项的关键不同是在应用中如何配置。独立的项目在当很多项目被配置使用、需要一个仓库或至少拷贝一个JAR文件时是有用处的。在这个例子中我们将在一个单独的项目中使用我们生成好的代码并且我们将它放在**buildSrc**项目中

##**buildSrc** project是什么？

Gradle特别处理过的名字为**buildSrc**的目录在项目的根目录时。子项目**buildSrc**（和Android Studio或IntelliJ的子module）被自动创建（不需要在**settings.gradle**中声明）。甚至项目的**build.gradle**都不是必须的因为默认的已经被隐式实现。在Gradle文档中查看[Organizing Build Logic](https://docs.gradle.org/current/userguide/organizing_build_logic.html#sec:build_sources)更多信息。这个项目被加入到了编译脚本的classpath中，所以它的内容可以在build.gradle中用同样的方式使用作为classpath的依赖。例如：**classpath com.android.tools.build:gradle:1.2.3'**。**buildSrc**项目一样也有单元测试和资源。可以被任一项目的Gradle执行。

##如何使用生成的代码？

我们需要调用我们的**generateTldListClass()**方法。我们能创建一个完整的Gradle插件，但对于这个简单的目的，我们在App项目中的**build.gradle**文件中添加一个自定义的任务。例子实现如下：

```
import pl.droidsonroids.domainnameutils.TldListGenerator

apply plugin: 'com.android.application'

def generatedSrcDir = new File(buildDir, "generated/tld/src/main/java/")

task generateTldList << {
    TldListGenerator.generateTldListClass(generatedSrcDir, true)
}

preBuild.dependsOn generateTldList

android {
    sourceSets {
        main {
            java {
                srcDirs += generatedSrcDir
            }
        }
    }
<rest of the android closure>
}
```

让我们分析这个编译脚本。Gradle编译时产生的文件默认会被放在项目根目录下的**build**目录。在**build.gradle**中会被作为**buildDir**被检索到。如此，我们构建了输出目录。

我们也可以创建自定义任务叫**generateTldList**.注意**<<**是一个定义为行为的快捷方式。关于任务的更多信息看[Gradle tasks documentation](https://docs.gradle.org/current/userguide/more_about_tasks.html)。在Android Gradle插件里我们继续添加我们的任务作为**preBuild**任务的一个依赖，当每一个项目编译刚开始时被执行。最终我们把输出目录加入到了main source中，在app源码中可以被引入。

##如何使用生成的代码

我们可以像使用其他类一样使用我们生成的类。下边的例子展示如何创建一个包含TLDS的简单Spinner：

```
final Spinner spinner = (Spinner) findViewById(R.id.spinner_tld);
spinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, TldList.getTldList()));
```
 
##Sample project
##例子

生成代码的例子和简单的Android项目可以在Github上看到：[koral–/buildsrc-sample](https://github.com/koral--/buildsrc-sample)。Android Studio 1.3中会提示**Class 'TldListGenerator' already exists in 'pl.droidsonroids.domainnameutils'**是但是它并不会影响项目的构建。运行App看起来像下边这样

![Screenshot](https://cloud.githubusercontent.com/assets/3340954/9006569/24f8743a-3789-11e5-9ccf-b36bce782894.png)

##References
##引用

* [IANA — Root Zone Database](https://data.iana.org/TLD/tlds-alpha-by-domain.txt)
* [Codemodel](https://codemodel.java.net/)
* [Internationalizing Turkish](http://www.i18nguy.com/unicode/turkish-i18n.html)
* [Organizing Gradle Build Logic](https://docs.gradle.org/current/userguide/organizing_build_logic.html#sec:build_sources)
* [Writing Custom Gradle Task Classes](https://docs.gradle.org/current/userguide/custom_tasks.html)
* [More about Gradle tasks](https://docs.gradle.org/current/userguide/more_about_tasks.html)
* [Sample project](https://github.com/koral--/buildsrc-sample)