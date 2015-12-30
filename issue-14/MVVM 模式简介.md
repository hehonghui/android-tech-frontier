MVVM 模式简介
---

> * 原文链接 : [MVVM on Android: What You Need to Know](http://www.willowtreeapps.com/blog/mvvm-on-android-what-you-need-to-know/)
* 原文作者 : [Frank](http://www.willowtreeapps.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成


Google 在今年的 IO 大会推出了一个超赞的框架，开发者可以通过这个框架为 View 中的任何一个对象的数据域进行绑定，框架会注意到数据是否被更新，如果数据被更新，将自动更新 View 中对应的内容。

说实话，这个框架真的很实用，还能让我们使用 Windows 程序开发时使用的 MVVM 模式。在结合这个新的框架和 MVVM 模式进行开发之前，花时间了解 MVVM 架构的基本概念和它能为应用带来的好处是个性价比极高的选择，MVVM 模式由下面三个部分组成：

- Model – 代表你的业务逻辑 
- View – 显示界面内容
- ViewModel – 关联上面两者的对象

ViewModel 接口提供 Action 和 Data，Action 改变基础的 Model（例如：点击监听器，文字修改状态监听器，等等……），而 Data 则是 Model 的内容。

举个例子，一个用于拍卖页面的 ViewModel 可能对外公布的数据域有：拍卖品的图片、标题、描述和价钱；此外，还可能会对外提供进行拍卖、购买、与卖方沟通的方法。

在传统的 Android 架构中，Controller 为 View 提供数据，你要做的就是在 Activity 中找到相应的 View，并更新其中的数据。但在 MVVM 中，如果 ViewModel 修改了某些内容，而且数据绑定框架注意到内容发生了改变，框架就会自动更新与该数据相关的所有 View，通过这个提供数据和命令的接口使得这两个组件间呈松耦合状态。

这个框架除了让 View 变得更加智能，使用起来更加便利以外，还大大简化了测试的过程。

由于 ViewModel 再也不需要依赖于 View 了，这使你甚至能对一个不存在的 View 进行测试，通过对其他依赖进行恰当的依赖注入，大大简化了测试的复杂度。

还是举例子来说吧，如果我们不能将 ViewModel 与某个已存在的 View 绑定，开发者可能会在测试用例中新建一个 ViewModel，然后为它提供一些数据，再执行某些操作以确保数据正确地被改变。回到刚刚的拍卖例子中，你可能会创建一个提供 mock API 服务的 ViewModel，用它读取任意一个拍卖品并投标，然后确保显示出来的数据是正确的。不需要与实体 View 产生交互就能完成上面所有操作。

当对某个 View 进行测试时，开发者可以创建许多对外暴露预测试状态（与通过请求网络或访问数据库获得数据相反）的 mock ViewModel，并分析 View 在任何数量发生改变时的反应。

希望这篇博文能帮助你理解 MVVM 模式的概念以及它的好处，接下来我们将发布一些博文为大家讲解具体的实现细节，以及使用数据绑定框架开发时的一些小提示和小技巧。