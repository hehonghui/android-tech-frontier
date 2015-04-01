`安卓的模糊视图`
---

>
* 原文链接 : [A Blurring View for Android](原文url)
* 译者 : [lvtea0105](https://github.com/lvtea0105) 
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)  
* 状态 :   校对中


Blur effect can be used to vividly convey a sense of layering of content. It allows the user to maintain the context, while focused on the currently featured content, even if what’s under the blurring surface shifts in a parallax fashion or changes dynamically.

模糊效果可以生动地表达出内容的层次感，当使用者关注重点内容时，能够保持当前背景，即便在模糊表面之下发生视差效果或者动态改变。    
On iOS, we could get this sort of blurring by first constructing a UIVisualEffectView,and then adding visualEffectView to a view hierarchy, in which it will dynamically blur what’s under it.

在IOS设备中，我们首先构造一个UIVisualEffectView,之后添加 visualEffectView 到view层，在view中可以进行动态的模糊。

## 入门指南
大家都知道要写一款精品软件是有难度且很复杂的：不仅要满足特定要求，而且软件还必须具有稳健性，可维护、可测试性强，并且能够灵活适应各种发展与变化。这时候，“清晰架构”就应运而生了，这一架构在开发任何软件应用的时候用起来非常顺手。

这个思路很简单：简洁架构 意味着产品系统中遵循一系列的习惯原则：



