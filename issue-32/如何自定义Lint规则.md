#如何自定义Lint规则
> * 原文链接 : [Help developers with custom Lint rules](http://jeremie-martinez.com/2015/12/15/custom-lint-rules/)
* 原文作者 : [Jeremie Martinez](http://jeremie-martinez.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121)  
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

上个月，我有幸旁听了[Mattew Compton](https://twitter.com/ambergleam)在Droidcon的演讲，是关于自定义Lint规则的。我被这个话题深深的吸引住了，并希望能够更加深入地探索它。于是我写了这篇文章来分享我的一些想法，并结合几个具体例子讲解如何将自定义Lint引入工程中。

##定义

我相信作为一个Android开发者都应该知道[Lint](http://developer.android.com/tools/help/lint.html)。这是Lint的简介：

>Lint是一个静态代码分析工具，它能够帮你查出可能发生的bug以及可以优化的地方。

举几个简单的例子吧，Lint能够提醒你`Toast`忘记加`show()`，告诉你`ImageView`需要添加`contentDescription`才能保证它可以被文字描述...举不完的例子。你会发现，Lint可以帮你做的事情太多了，它在逻辑的正确性、应用的安全性、性能、交互、国际化等等方面都有所涉及。

你只需要在命令行中输入`./gradlew lint`就可以很容易地使用Lint。它会生成一份报告，按种类、优先级、严重程度来区分。你需要经常查看这份报告来保证你的代码质量与降低bug产生概率。

在简单的介绍之后，我希望我们能达成共识：Lint是一个非常好的帮助我们理解与使用Android API的工具。

##为什么需要自定义Lint规则？

大部分Android开发者并不清楚Lint的规则是可以自定义的。这里是几个自定义规则能够派上用场的情景：

- 当你发布一个库并且希望别人正确使用它的时候，自定义的Lint规则可以很好地提醒他们什么事情忘记做了或者做错了。
- 当你的团队有新的开发者加入时，自定义的Lint规则会是帮助新成员更好地理解你的代码规范、命名规范。

##示例

我最近加入了[CaptainTrain](https://play.google.com/store/apps/details?id=com.capitainetrain.android)的Android开发团队。接下来的例子是基于我为我们的app实现的两个Lint自定义规则。我认为这已经足够展示Lint在规范代码风格上的强大作用。

让我们开始吧！

###Gradle中配置

自定义的Lint规则必须在新模块里面实现。一个简单的gradle脚本如下面这段代码所示：

    apply plugin: 'java'

    targetCompatibility = JavaVersion.VERSION_1_7
    sourceCompatibility = JavaVersion.VERSION_1_7

    configurations {
        lintChecks
    }

    dependencies {
        compile 'com.android.tools.lint:lint-api:24.3.1'
        compile 'com.android.tools.lint:lint-checks:24.3.1'

        lintChecks files(jar)
    }

    jar {
        manifest {
            attributes('Lint-Registry': 'com.captaintrain.android.lint.CaptainRegistry')
        }
    }

    defaultTasks 'assemble'

    task install(type: Copy, dependsOn: build) {
        from configurations.lintChecks
        into System.getProperty('user.home') + '/.android/lint/'
    }

正如你所看到的一样，我们需要引入两个依赖库来实现Lint自定义规则。同时我们需要指定一个Lint-Registry，我会在之后解释它，现在你需要记住有这么个东西。最后我们新建了一个任务来安装规则。

你可以通过`../gradlew clean install`(在module目录下)这条简单的命令来编译、应用这个模块的配置。

现在我们已经配置好了模块，来看看第一条自定义规则是啥。

###第一条规则：属性必须加前缀

在CaptainTrain工程中，我们总是在属性前加上ct前缀来避免和其他库冲突。这很容易被像我一样的新员工遗漏，所以我加了下面这条规则：

    public class AttrPrefixDetector extends ResourceXmlDetector {

     public static final Issue ISSUE = Issue.create("AttrNotPrefixed",
            "You must prefix your custom attr by `ct`",
            "We prefix all our attrs to avoid clashes.",
            Category.TYPOGRAPHY,
            5,
            Severity.WARNING,
            new Implementation(AttrPrefixDetector.class,
                                   Scope.RESOURCE_FILE_SCOPE));

     // Only XML files
     @Override
     public boolean appliesTo(@NonNull Context context,
                              @NonNull File file) {
       return LintUtils.isXmlFile(file);
     }

    // Only values folder
     @Override
     public boolean appliesTo(ResourceFolderType folderType) {
        return ResourceFolderType.VALUES == folderType;
    }

    // Only attr tag
     @Override
     public Collection<String> getApplicableElements() {
        return Collections.singletonList(TAG_ATTR);
     }

    // Only name attribute
     @Override
     public Collection<String> getApplicableAttributes() {
        return Collections.singletonList(ATTR_NAME);
     }

     @Override
     public void visitElement(XmlContext context, Element element) {
        final Attr attributeNode = element.getAttributeNode(ATTR_NAME);
        if (attributeNode != null) {
            final String val = attributeNode.getValue();
            if (!val.startsWith("android:") && !val.startsWith("ct")) {
                context.report(ISSUE,
                        attributeNode,
                        context.getLocation(attributeNode),
                        "You must prefix your custom attr by `ct`");
            }
        }
     }
    }

你会发现它集成了`ResourceXmlDetector`。`Detector`是帮助我们发现问题并作出反应的类。首先需要指定我们想要探测的是什么位置：

- 第一个`appliesTo`方法指明了只看XML文件；
- 第二个`appliesTo`方法指明了只看资源文件夹下的文件；
- `getApplicableElements`指明了只看XML中的属性；
- `getApplicableAttributes`指明了只看XML属性中的名字；

在实现完这些筛选之后，我们需要实现`visitElement`方法来处理筛选后的元素。在本例中的实现很简单，我们对非`android:`开头或者`ct`开头的XML的属性名都抛出一个`Issue`。这个Issue在类顶部已经进行了声明：

    public static final Issue ISSUE = Issue.create("AttrNotPrefixed",
                "You must prefix your custom attr by `ct`",
                "To avoid clashes, we prefixed all our attrs.",
                Category.TYPOGRAPHY,
                5,
                Severity.WARNING,
                new Implementation(AttrPrefixDetector.class,
                                    Scope.RESOURCE_FILE_SCOPE));

这里面每个参数都很重要，都是必须的：

- `AttrNotPrefixed` Lint规则名，必须是唯一的；
- `You must prefix your custom attr by ct` 是规则的简单描述；
- `To avoid clashes, we prefixed all our attrs` 是规则的进一步描述；
- `TYPOGRAPHY` 是Issue种类；
- `5` 是优先级，它必须是1-10之的数；
- `WARNING` 是严重性。在这个严重性下，代码会被警告，但是依然可以运行。
- `Implementation` 是连接`Detector`（生成Issue）和`Scope`（分析Issue的上下文）的桥梁。在这个例子中，我们将在资源文件中区分析前缀问题。

正如你所想，这段代码很简单。你唯一需要注意的就是分析Issue的上下文(`Scope`)与`Issue`中输入的提示。

最后你的Lint提示将像下图一样：

![attr-rules](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/attr_rules_result.png)

###Second rule: Log in production is forbidden
###第二条规则

由于实际使用中`Log`可能会泄露用户隐私与影响性能，在CaptainTrain中，我们包装了`Log`逻辑。在`BuildConfig.DEBUG`为`false`时不输出`Log`。同时还可以统一处理我们自己`Log`的一些格式。这条规则大概是这样的：

    public class LoggerUsageDetector extends Detector
                                     implements Detector.ClassScanner {

        public static final Issue ISSUE = Issue.create("LogUtilsNotUsed",
                "You must use our `LogUtils`",
                "Logging should be avoided in production for security and performance reasons. Therefore, we created a LogUtils that wraps all our calls to Logger and disable them for release flavor.",
                Category.MESSAGES,
                9,
                Severity.ERROR,
                new Implementation(LoggerUsageDetector.class,
                                    Scope.CLASS_FILE_SCOPE));

        @Override
        public List<String> getApplicableCallNames() {
            return Arrays.asList("v", "d", "i", "w", "e", "wtf");
        }

        @Override
        public List<String> getApplicableMethodNames() {
            return Arrays.asList("v", "d", "i", "w", "e", "wtf");
        }

        @Override
        public void checkCall(@NonNull ClassContext context,
                              @NonNull ClassNode classNode,
                              @NonNull MethodNode method,
                              @NonNull MethodInsnNode call) {
            String owner = call.owner;
            if (owner.startsWith("android/util/Log")) {
                context.report(ISSUE,
                               method,
                               call,
                               context.getLocation(call),
                               "You must use our `LogUtils`");
            }
        }
    }

就像你在上一条规则中看到的一样。首先我们用两个方法`getApplicableCallNames`和` getApplicableMethodNames`来约束我们的查找目标。之后在有问题的情况下创建Issue。与之前唯一的不同就是我们这回只是简单的继承了`Detector`并实现`ClassScanner`来处理Java类。（实际上并没与太多的不同，如果你追朔`XmlResourceDetector`的实现，你会发现它也是继承了`Detector`并实现`XmlScanner`）。所以总的来说，自定义Lint规则就是继承`Detector`并实现正确地`Scanner`。

最终，我们将`Scope`变成了`CLASS_FILE_SCOPE`，因为我们只需要逐个文件扫描就可以找出这个`Issue`。有时候你需要同时扫描所有文件，那么你要将`Scope`变成`ALL_CLASS_FILES`。看，`Scope`很重要吧，你可以在[这里](https://android.googlesource.com/platform/tools/base/+/master/lint/libs/lint-api/src/main/java/com/android/tools/lint/detector/api/Scope.java)找到所有`Scope`的定义。

如果在一次扫描中存在多个问题，那么他们都会被抛出。虽然这么做可能会让问题变得不精确，不过这也能够帮助我们一次性解决掉文件中的所有问题！

最终报出的Issue长这样：

![log-lint](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/log_rules_result.png)

###注册规则

最后还有一件事：注册规则！我们需要将新建的自定义规则加到Lint规则列表中：

    public final class CaptainRegistry extends IssueRegistry {
        @Override
        public List<Issue> getIssues() {
            return Arrays.asList(LoggerUsageDetector.ISSUE, AttrPrefixDetector.ISSUE);
        }
    }

你可以看到这非常简单，我们只需要继承`IssueRegistry`并且实现`getIssues()`方法就好了。这个类名必须与我们之前在`build.gradle`中声明的那个类名一致。

###总结

当然，我只是展示了两个非常简单的例子。不过我希望它已经能够展示出Lint的强大之处。它对你有多适合，只取决于你怎么写规则。

我们现在只看到了两种`Detector/Scanner`，不过还有`GraldeScanner`, `OtherFileScanner`等等，探索它们，并使用正确的类来辅助开发。

在开始写你自己的Lint规则之前，我推荐先阅读系统Lint规则的写法，这能帮助你理解怎么去实现规则。代码在[这里](https://android.googlesource.com/platform/tools/base/+/master/lint/libs/lint-checks/src/main/java/com/android/tools/lint/checks)

最后，Lint是一个非常棒的帮助你减少错误的工具，使用它吧！

以下几条链接对我理解Lint很有帮助，供你参考：

- https://github.com/bignerdranch/linette
- https://speakerdeck.com/ambergleam/linty-fresh
- [Source code](https://android.googlesource.com/platform/tools/base/+/master/lint/)
- http://tools.android.com/tips/lint-custom-rules
- https://github.com/googlesamples/android-custom-lint-rules