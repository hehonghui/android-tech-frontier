Android 进行单元测试难在哪-序
---

> * 原文链接 : [Against Android Unit Tests](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaosssss) 
* 校对者: [Rocko](https://github.com/zhaoxiaopeng)  
* 状态 :  完成 

其实不仅仅只有普通 Android 开发工程师觉得测试 Android 应用很恼火，大牛们也受此困扰已久。例如 Jake Wharton 曾经明确地表示：Android 平台自诞生之初就与应用测试势如水火。Don Felker 和 Kaushik Gopal 也在他们的[博文](http://fragmentedpodcast.com/episodes/1/)里也提出了相同的观点。当然了，他们还提到 Google 的 [IOSched 应用](https://github.com/google/iosched)，根本就没有进行过测试，据说 IOSched 还是 Android 开发环境中应用开发的最优集合体呢。IOSched 没有进行测试让我们这些开发者很困扰：1、Google 所谓的“测试是高效地进行 Android 开发中的关键一环”真的不是来唬小孩的吗；2、还是 Google 官方的工程师觉得测试 Android 应用简直就是浪费时间？不管怎样，如果这个世界上最优秀的 Android 开发工程师都觉得在 Android 中进行测试很麻烦，那我们这些小菜鸡玩不好测试也是理所当然的了。

多年以来，Android 开发者们为克服在 Android 中难于进行测试的问题绞尽脑汁。Roboletric 就是这些工程师的智慧结晶，它能让开发者们在 JVM 虚拟机上进行 Android 测试。而最近又有博文开始声讨 Fragment，[个中翘楚 Square 就表示](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html)：老子再也不用 Fragment 这种垃圾玩意了，我们要把业务逻辑都转换到新开发的 Mortar & Flow （MVP 开发框架）框架里，用纯 Java 对象进行编程，完全不依赖 Android 平台的 API。毫无疑问，这些 Java 对象在标准的 Java 测试工具中进行测试是非常简单的。

我坚信那些和 Square 站在统一战线上的开发团队肯定也在想办法将 UI 从实际的业务逻辑中剥离为纯 Java对象，为提高应用的可测试性不懈努力。换句话说，我觉得我们可以不在 Android 中进行单元测试，也不用实现依赖于 Android SDK 的测试单元。我们应该做的是重构应用，让我们能够为应用中的代码实现纯 Java 的测试单元，无论最终能不能真正地提高 Android 的可测试性和健壮性，我觉得这都值得一试。

我感觉到这个思路会是治本良方，所以我们要做的，就是将下图这样的 Android 的应用架构

![](http://img.my.csdn.net/uploads/201504/26/1430014189_2164.png)

变成下图这样：

![](http://img.my.csdn.net/uploads/201504/26/1430014189_8490.png)

虽然这个方法可能能从根本上解决问题，但它也有很大的风险，尽管如此，我还是坚持认为这个方法值得一试，因为它能拯救万千挣扎在实现 Android 测试单元的开发者们于水火之中，而且不用强迫他们使用第三方的库，毕竟第三库总会让他们滞后于最新的 Android 系统特性。此外，Kent Beck 认为：可测试性好的代码就是架构优秀的代码，如果他的观点是对的，或许我们还能找到架构应用更好的办法。

在接下来的博文里，我将探索“重构 Android 应用以使它们能轻易地通过标准的 Java 工具进行测试”这个方案的可操作性。

在第一、第二篇博文中，我会侧重阐述在 Android 里进行单元测试为什么会带来如此痛苦的体验。我觉得阻碍 Android 测试方法发展的根本原因就在于：Android 系统本身就难于进行测试。缺乏对 Activity 和 Fragment 的合理注入就是让应用难以测试的根本原因，而且认识到这一点是设计可测试强的应用架构的关键。

在第三篇博文中，我会在细节上探讨一个常见的解耦应用代码和 Android SDK的策略。简单来说，这个策略就是：将所有应用的具体行为交给一个 POJO 对象（Plain Ordinary Java Object）完成，这些 POJO 对象都是 Android 无关的接口的 Android 特定实现。

在第四篇博文中，我会指出实现第二篇博文中提出的策略存在的技术难点，并尝试去挖掘可以解决这些难点的方法。在这些难点中，最大的问题在于内存泄漏和繁复的重用代码。

在最后一篇博文中，我会通过展示我提出的架构为 Android 测试性带来的提高让大家觉得进行这样的技术探索是值得花费时间、精力，并且能获得相应回报的。
