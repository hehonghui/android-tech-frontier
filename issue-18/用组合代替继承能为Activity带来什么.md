#用组合代替继承能为 Activity 带来什么

---

> * 原文链接 : [Composition over Inheritance，What it means for your Activities](https://plus.google.com/+JoshBrown42/posts/FzNghPbKk2s)
* 原文作者 : [Josh Brown](https://plus.google.com/100411279961902366927)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成

事实上我们在很多 Java 进阶书籍上看到过“开发时应该更倾向于选择组合而不是继承”的建议，为什么建议我们**更倾向于**而不是**完全代替**呢，因为当类 A 能完全代替另一个类 B（我们想让 B 成为 A 的父类）时，我们就应该使用继承，如果 A 仅仅是和 B 有着某些共同的**行为**，是不应该使用继承的（更多的讨论[戳我](http://stackoverflow.com/questions/49002/prefer-composition-over-inheritance)）。然而，在我阅读别人的源码时，滥用继承的情况实在是太多了，多少人创建了一个 BaseActivity 后，就让所有 Activity 继承它，在子 Activity 中实现业务逻辑。

而且这样做问题大大的有，最鲜活的例子就是：Joe Newguy 加入到我们组，并实现了 ShinyFeatureActivity，那会组里没有任何规定强迫他必须让 ShinyFeatureActivity 继承于 BaseActivity，但他还是这么干了……万幸我们在 Code Review 时发现了这个问题。此外，如果每一个 Activity 都继承于 BaseActivity，在某些情况下，你可能要继承的是其他 Activity（例如：PreferenceActivity、ListActivity）。尽管大部分 Activity 的子类都有相应的 Fragment 代替，但还是有一部分是没有对应 Fragment 的，某些库仍然需要相应的 Activity 子类。

有些更潜在的问题是：有时候某些 Activity 需要这些行为，其他的 Activity 需要其他行为，而 Java 并不支持多继承，这就意味着我们得将行为有交集的 Activity 的所有行为放到一个独立的类里面。但这样做会降低可维护性，甚至带来性能影响。

事实上，我们会这么干的动机很简单：代码复用。确实，代码复用很重要。而我们大部分公共逻辑需要在 Activity 生命周期的某一环实现。但 Application.ActivityLifecycleCallbacks 是一个让人很蛋疼的玩意，而且可能需要在 Application.onCreate() 方法里注册它，最讽刺的是：我们想尽办法避免在 Application.onCreate() 方法里注册它……

这也是无绑定 View 的 Fragment 的由来了，当无数 Android 开发者把 Fragment 看作 UI 组件时，事实上 Fragment 更像生命周期的组件。为什么要说这些 Fragment 是无绑定 View 的呢？因为在这些开发者的手里，Fragment 的 onCreateView() 方法既没有被重写，也没有返回 null。本质上，Fragment 就是一个能够处理或操控事件的组件，而它自身没有对应的 View。

为了区分无绑定 View 的 Fragment 和面向 View 的 Fragemnt，我在命名时会将无绑定 View 的 Fragemnt 命名为 ** XXHelper**，其他的就命名为**XXFragment**。例如，AnalyticsHelper 代表的就是关联分析逻辑的 Fragment，而 HeaderFragment 则显示了一个标题栏。当然了，大家可以尝试这么干，也可以无视我的建议，我自己是感觉满有用的哈～

因为这些无绑定 View 的 Fragment 里面没有 UI 组件，也就意味着在这些 Fragment 里我们不需要考虑初始化布局所需的 Layout-ID，或者是 View 需要的动画，那么我们完全可以用工厂模式开发这些 Fragment，提高工厂方法的易用性和可操控性。就这一点来说，他们还能完成添加 Fragment 自身的操作，我创建了一个 [Gist](https://gist.github.com/keyboardr/ddf35148ca2c1a2bfbde) 来为大家介绍要怎么做到，有兴趣的话可以点进去看看哈。如果使用 Android-Studio 进行开发的话，你可以将它添加到设置的 `File and Code Templates` 选项中，然后当你创建一个新的类时，在 **Kind** 下拉选项中选择它。

将 FooHelper 添加到它的父类中非常简单，只要调用 FooHelper.attach(this) 就可以了。但如果相应的父类没有实现 FooHelper 的回调接口的话会出现编译错误，此外，如果 attach() 方法已经被调用了，该方法的返回值会是之前的 Fragment。这个 Gist 包含对 Fragment 和 Activity 的重载，而且将它们转换为使用支持的 Fragement 和 FragmentActivity，其中的意义非常中大。而且它还包含了 FragmentUtils.getParent() 的简化版 —— getParent() 方法（详情[戳我](https://gist.github.com/keyboardr/5455206)）。

显然，无绑定 View 的 Fragment 比 BaseActivity 好用得多，它们很好地封装了需要生命周期回调（或者是 onActivityResult()，FragmentManager）的处理方法。最棒的是，我们可以将 Activity 共用的某些逻辑分解到职责单一的模块组件中，Activity 需要什么逻辑，就选择什么模块使用。如果你的 Activity 大部分都需要许多相同的模块，那么你没有理由不实现 CommonComponentsHelper 用于处理这些共用逻辑，而且你也不需要把 Activity 的所有共用依赖放在一个基类中。
