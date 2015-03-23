Square 开源库Flow和Mortar的介绍
---

>
* 原文链接 : [An Investigation into Flow and Mortar](http://www.bignerdranch.com/blog/an-investigation-into-flow-and-mortar/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成




Fragments have started to garner a negative reputation in the Android community, despite being officially supported by the Android team at Google, and there are a host of reasons why:

- We have to rely solely on [default constructors](http://developer.android.com/reference/android/app/Fragment.html), rather than custom constructors.

- Nested Fragments are prone to [bugs](http://blog.shamanland.com/2014/01/nested-fragments-for-result.html) and [limitations](http://developer.android.com/about/versions/android-4.2.html#NestedFragments).

- The Fragment lifecycle is [complex](http://staticfree.info/~steve/complete_android_fragment_lifecycle.png).

“在 App 开发过程中尽可能使用 Fragment 替代 Activity”，Google 官方的这个建议无疑让万千 Android 开发者开始关注 Fragment，使用 Fragment 。但随着使用 Fragment 的人数增多，Fragment 存在的各种问题也开始暴露，在各种 Android 社区中，已经开始有人质疑用 Fragment 替代 Activity 在应用开发中是否真的像 Google 说的那样有益。质疑 Fragment 的理由大体如下：

- 在使用 Fragment 时，我们只能选择使用默认的构造方法，而不能自由地构造我们想要的构造方法。

- 嵌套使用 Fragment 很容易出现各种奇奇怪怪的 Bug，抑或是受到种种让人郁闷的限制。

- Fragment 自身的生命周期非常复杂。

But perhaps most importantly, Android developers simply don’t seem to enjoy using Fragments, viewing them more as a hindrance than as a help.

更让人哭笑不得的是，让这部分开发者坚定地站在“反 Fragment”队伍中的原因竟然是：在开发过程中使用 Fragment 完全不能让这部分 Android 开发者感受到使用 Fragment 能给他们带来的便利，和愉悦；相反，使用 Fragment 给他们带来的是无尽的困然和烦恼。真不知道 Google 看到这些批评 Fragment 的帖子会想什么…………

Here on the Ranch, we teach in our [Android bootcamp](https://training.bignerdranch.com/classes/android-bootcamp) that using Fragments is the right way to go (especially for beginners), and we also use Fragments extensively on all of our [consulting projects](http://www.bignerdranch.com/we-develop).

但在我们的 Android 学习社区中，我们制作的 [Android bootcamp](https://training.bignerdranch.com/classes/android-bootcamp) 课程一直坚持使用 Fragment ，并且为大家介绍 Fragment 给我们带来的种种便利和好处（特别是 Android 开发的新手），此外，我们还在我们做的 [资讯 App](http://www.bignerdranch.com/we-develop) 中广泛地使用了 Fragment。

However, we encourage a mindset of constant exploration and continual learning, so I began investigating the most popular alternatives to Fragments.

然而，虽然我们是 Fragment 的忠实粉丝，但我们还是对现有的 Android 库进行了相当多的研究和探索，以求能够找到 Fragment 的最佳替代物，帮助这些备受煎熬的 Android 开发者早日脱离苦海，走向 Android 开发的美丽新世界。




