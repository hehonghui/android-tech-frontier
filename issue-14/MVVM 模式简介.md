MVVM 模式简介
---

> * 原文链接 : [MVVM on Android: What You Need to Know](http://www.willowtreeapps.com/blog/mvvm-on-android-what-you-need-to-know/)
* 原文作者 : [Frank](http://www.willowtreeapps.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中

This year’s Google IO introduces an awesome new framework for Android developers that allows for “binding” of views to fields on an arbitrary object. When a field is updated, the framework is notified and the view is updated automatically.

Google 在今年的 IO 大会推出了一个超赞的框架，开发者可以通过这个框架为 View 中的任何一个对象的数据域进行绑定，框架会注意到数据是否被更新，如果数据被更新，将自动更新 View 中对应的内容。

This system is extremely powerful, and will enable us to use a development pattern that’s been used in the Windows world for some time called Model-View-ViewModel (MVVM). Before we jump into any code, it’s important to understand the basic concepts of this architecture, and how it can benefit you and your app.

The MVVM pattern consists of three parts:

说实话，这个框架真的很实用，还能让我们使用 Windows 程序开发时使用的 MVVM 模式。在结合这个新的框架和 MVVM 模式进行开发之前，花时间了解 MVVM 架构的基本概念和它能为应用带来的好处是个性价比极高的选择，MVVM 模式由下面三个部分组成：

- Model – Represents your business logic
- View – Displayed content
- ViewModel – The object that ties those two together

- Model – 代表你的业务逻辑 
- View – 显示界面内容
- ViewModel – 关联上面两者的对象

A ViewModel interface provides two things: actions and data. Actions change the underlying model (click listeners, text changed listeners, etc.), and data is the content of that model.

ViewModel 接口提供 Action 和 Data，Action 改变基础的 Model（例如：点击监听器，文字修改状态监听器，等等……），而 Data 则是 Model 的内容。

For example, a ViewModel for an auction page might expose as data an image of the item, a title, description, and price. It might expose as actions the ability to bid, buy, or contact the seller.

举个例子，一个用于拍卖页面的 ViewModel 可能对外公布的数据域有：拍卖品的图片、标题、描述和价钱；此外，还可能会对外提供进行拍卖、购买、与卖方沟通的方法。

In traditional Android architecture, the controller pushes data to the view. You find the view in your Activity, then set content on it. With MVVM, your ViewModel alters some content and notifies the binding framework that content has changed. The framework will then automatically update any views bound to that content. The two components are only loosely coupled through that interface of data and commands.

在传统的 Android 架构中，Controller 为 View 提供数据，你要做的就是在 Activity 中找到相应的 View，并更新其中的数据。但在 MVVM 中，如果 ViewModel 修改了某些内容，而且数据绑定框架注意到内容发生了改变，框架就会自动更新与该数据相关的所有 View，通过这个提供数据和命令的接口使得这两个组件间呈松耦合状态。

What makes this pattern so awesome, aside from the obvious conveniences of a “smarter” view, is that it lends itself to testing so well.

这个框架除了让 View 变得更加智能，使用起来更加便利以外，还大大简化了测试的过程。

Because a ViewModel does not depend on the View anymore, you can test a ViewModel without a View even existing. With proper dependency injection for other dependencies, it is very straightforward to test.

由于 ViewModel 再也不需要依赖于 View 了，这使你甚至能对一个不存在的 View 进行测试，通过对其他依赖进行恰当的依赖注入，大大简化了测试的复杂度。

For example, instead of binding a VM to a real view, one might create a VM in a test case, give it some data, then call actions on it, to make sure the data is transformed properly. In the auction example, you might create a VM with a mock API service, have it load an arbitrary item and bid on it, and ensure that the resulting exposed data is correct. All of this can be done without having to interact with an actual View.

还是举例子来说吧，如果我们不能将 ViewModel 与某个已存在的 View 绑定，开发者可能会在测试用例中新建一个 ViewModel，然后为它提供一些数据，再执行某些操作以确保数据正确地被改变。回到刚刚的拍卖例子中，你可能会创建一个提供 mock API 服务的 ViewModel，用它读取任意一个拍卖品并投标，然后确保显示出来的数据是正确的。不需要与实体 View 产生交互就能完成上面所有操作。

When testing a view, one could create a number of mock view models that expose pre-set data (as opposed to relying on network calls or database contents), and see how that view reacts to any number of data sets.

当对某个 View 进行测试时，开发者可以创建许多对外暴露预测试状态（与通过请求网络或访问数据库获得数据相反）的 mock ViewModel，并分析 View 在任何数量发生改变时的反应。

Hopefully this has given you a better understanding of what the MVVM pattern is, and why it’s useful. Later on, we’ll have some posts that go into the details of implementing this pattern, as well as some other helpful tips and tricks when working with the binding framework.

希望这篇博文能帮助你理解 MVVM 模式的概念以及它的好处，接下来我们将发布一些博文为大家讲解具体的实现细节，以及使用数据绑定框架开发时的一些小提示和小技巧。