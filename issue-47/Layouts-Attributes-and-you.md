# Layouts, Attributes, and you
# 你应该知道的布局和属性
---

> * 原文链接 : [Layouts, Attributes, and you](https://medium.com/google-developers/layouts-attributes-and-you-9e5a4b4fe32c#.egixi9sq1)
* 原文作者 : [ianhlake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [mijack](https://github.com/mijack)
* 校对者: [mijack](https://github.com/mijack)  
* 状态 :  未完成

That age old question:

这是一个老生常谈的问题了：

    [What layout should I be using?](http://stackoverflow.com/search?q=what+layout+should+I+use+%5Bandroid%5D&utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)

Knowing how that picture in your mind (or that wireframe a designer gave you) translates into actual layouts and Views is one of those key skills that every Android developer can benefit from.

对于一个Android开发者，知道如何将你印象中的界面（设计师给你的草图）转化成实际中的布局界面是十分重要的技能。

## What is a layout?
## 什么是布局？

Just looking through developer.android.com for layouts, you’ll find plently of classes ending in ‘Layout’. What do they all have in common? They’re all subclasses of [ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) — a [View](http://developer.android.com/reference/android/view/View.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) that supports adding child Views (commonly referred to as children).

仅仅是浏览developer.android.com查找Layout，你会发现很多以`Layout`结尾的类。他们都有什么共同点呢？他们都是ViewGroup的子类 - 一个支持添加子视图（通常被称为子视图）的[View](http://developer.android.com/reference/android/view/View.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)。

As you might expect, one of the main responsibilities of a ViewGroup is laying out those children: picking how large each View is (the ‘measure’ phase) and placing the Views within the ViewGroup (the ‘layout’ phase).

正如你所想象的，一个ViewGroup的主要职责之一是对子视图进行布局：每个View有多大（以下简称`measure`）和将View放置ViewGroup内（以下简称`layout`阶段）。

 >**Note**: that isn’t to say that’s all a ViewGroup is responsible for. It can certainly have its own custom behavior, draw things itself, add its own children. Toolbar, for example, has quite a bit of built-in functionality, in addition to supporting child Views.

>**注意**：那并不是ViewGroup所有的事。当然，这可以有自己的定制行为，绘制自己以及子View。例如Toolbar除了支持子视图，他还有很多内置的功能。

So it should come as no surprise that if you’re looking for a certain way that child Views are laid out, picking the right layout is going to play a big part. The wrong layout may make a certain pattern impossible or perform horribly, while another layout may simplify things.

毫无疑问，你会选择较为合适的布局，布置子视图的位置，这是十分关键的。错误的布局可能会完成不了当前的布局或者性能不一定很好，而较好的布局可以知道简化事件的效果。

## Layout_ Attributes

Now just like any View, a ViewGroup can use XML attributes, like LinearLayout’s android:orientation, to change how they lay out their children, but these are global changes that affect every child. To change things on a child-by-child basis, layouts use a different mechanism in the form of layout_ attributes, which are added to **child** Views. These attributes are different because **layout_ attributes are instructions for the parent ViewGroup**, not for the View itself. Let’s take an example from [a previous pro-tip](https://plus.google.com/+IanLake/posts/Hepj6KynZD5?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) I wrote:

和View一样，ViewGroup可以使用XML属性，如LinearLayout的android:orientation，改变他们的子View的布局，但是，这些属性将会引发每一个子View的变化。为了防止子视图间的递归传递，布局使用了不同的机制向子视图中添加使用形如`layout_`的属性。**这些属性是关于父布局的属性说明**，和View本身无关，我们可以从之前写的[建议](https://plus.google.com/+IanLake/posts/Hepj6KynZD5?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)中找到一个例子。

```
  <android.support.design.widget.AppBarLayout>
    <android.support.v7.widget.Toolbar
      app:layout_scrollFlags="scroll|enterAlways" />
  </android.support.design.widget.AppBarLayout >
```
If you look at Toolbar, you won’t find anything about layout_scrollFlags. Nor will you find anything if you look at [AppBarLayout](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog). Those layout_ attributes are actually stored in [LayoutParams](http://developer.android.com/reference/android/view/ViewGroup.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) (specifically, in this case, the [AppBarLayout.LayoutParams](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) subclass). Each View, when attached to a parent, has its own LayoutParams that serves as a storage place for basically anything the parent ViewGroup wants to keep track of. By default, that’s just a width and height (that layout_width and layout_height you’ve seen on practically every View), but each ViewGroup has the opportunity to declare new attributes in their own subclass of LayoutParams (as helpfully described in the [documentation](http://developer.android.com/guide/topics/ui/declaring-layout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#layout-params)).

如果你查看Toolbar，你不会找到任何和layout_scrollFlags有关的信息。但是你可以在[AppBarLayout](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)找到。这些布局属性实际存储在[LayoutParams](http://developer.android.com/reference/android/view/ViewGroup.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)（在这个案例中，是子类[AppBarLayout.LayoutParams](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)）。当视图附属在parent View时，就有和parent相关的LayoutParams，它存储着和布局位置相关的信息。默认情况下，这只是一个宽度和高度（即你可以在每一个视图中找到layout_width和layout_height），但每个ViewGroup中都可以在自己的LayoutParams的子类，声明新的属性（具体描述请见[文档](http://developer.android.com/guide/topics/ui/declaring-layout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#layout-params)）。

>**Note**: This is also the #1 reason why inflating a view from XML without including a parent (i.e., passing null as the root in [LayoutInflater.inflate()](http://developer.android.com/reference/android/view/LayoutInflater.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#inflate%28int,%20android.view.ViewGroup,%20boolean%29)) is a horrible idea — without any parent, there’s no one to parse and create a proper LayoutParams object, effectively meaning all of those attributes are thrown away — probably not what you want.


>**注**：从XML文件中加载视图却传递参数parent（也就是调用LayoutInflater.inflate()中的parent=null），这是一个不好的习惯，因为没有这个参数，有没有人来解析和创建适当的LayoutParams对象，这就意味着所有的属性都扔掉 - 这可能不是你想要的。

## Common Android Layouts
## 常用的AndroidLayouts

Just knowing about LayoutParams and the layout_ attributes explained in the documentation might be enough to help you choose the right layout for you, but a quick summary can’t hurt.

大概知道文档中的LayoutParams和layout_ 属性足以帮助您选择合适的布局，但要是一个快速的总结再好不过了。
### LinearLayout
[LinearLayout](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) has one goal in life: lay out children in a single row or column (depending on if its [android:orientation](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:orientation) is [horizontal](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#HORIZONTAL) or [vertical](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#VERTICAL)).

LinearLayout的功能比较单一：按照单一的行或列布局（具体取决于[android:orientation](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:orientation)是 [horizontal](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#HORIZONTAL) 还是 [vertical](http://developer.android.com/reference/android/widget/LinearLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#VERTICAL)）。

However, even with that single focus, it still has a trick up its sleeve with the [layout_weight](http://developer.android.com/guide/topics/ui/layout/linear.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#Weight) attribute, which allows a child to expand its size to fill the remaining space — useful if you have a few wrap_content elements and a few others that need as much space as possible.

即便如此，LinearLayout只有一个方向，但是它还有一个绝招：[layout_weight](http://developer.android.com/guide/topics/ui/layout/linear.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#Weight) ，允许子View的大小拓展以填满整个布局——当你有一部分view是自适应时，而而其他需要尽可能多的空间时，它是非常有用的。
### FrameLayout
[FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) acts quite differently compared to LinearLayout: here all children are drawn as a stack — overlapping or not. The only control on positioning is the [layout_gravity](http://developer.android.com/reference/android/widget/FrameLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:layout_gravity) attribute — pushing the child towards a side or centering it within the FrameLayout.

相比LinearLayout,[FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)的行为就大相径庭了：这里所有的View都压在一起绘制。位置的唯一控制要素就是[layout_gravity](http://developer.android.com/reference/android/widget/FrameLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:layout_gravity) - 可以将View放置在FrameLayout的一侧或中心。

### RelativeLayout

[RelativeLayout](http://developer.android.com/reference/android/widget/RelativeLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) is not nearly as simple as the previous two: a look at [RelativeLayout.LayoutParams](http://developer.android.com/reference/android/widget/RelativeLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) shows a large number of attributes all focused around [positioning children](http://developer.android.com/guide/topics/ui/layout/relative.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#Position) relative to the edges or center of RelativeLayout (similar to FrameLayout in fact), but also relative to one another — say, one child [layout_below](http://developer.android.com/reference/android/widget/RelativeLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:layout_below) another child.


[RelativeLayout](http://developer.android.com/reference/android/widget/RelativeLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)几乎没有前面两个那么简单：看看[RelativeLayout.LayoutParams](http://developer.android.com/reference/android/widget/RelativeLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)，关于子view和RelativeLayout或者其他View的[位置关系](http://developer.android.com/guide/topics/ui/layout/relative.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#Position（例如[一个view放置在另一个view下面](http://developer.android.com/reference/android/widget/RelativeLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#attr_android:layout_below)），就有一大堆的属性（实际上和FrameLayout类似的）。

This has an advantage of being very, very powerful (laying out arbitrary children in relation to one another), but [watch your performance](https://www.youtube.com/watch?v=dB3_vgS-Uqo?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)!

这具有非常强大的的优势（子View之间可以相互依赖），但是[注意布局的性能](https://www.youtube.com/watch?v=dB3_vgS-Uqo?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)！

### PercentFrameLayout and PercentRelativeLayout
### PercentFrameLayout 和 PercentRelativeLayout
As members of the [Percent Support Library](https://plus.google.com/+AndroidDevelopers/posts/C8oaLunpEEj?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog), [PercentFrameLayout](http://developer.android.com/reference/android/support/percent/PercentFrameLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) and [PercentRelativeLayout](http://developer.android.com/reference/android/support/percent/PercentRelativeLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) add onto their namesakes with the addition of percentage-based dimensions and margins, allowing you to use layout_widthPercent=”50%” in place of guessing at the appropriate layout_width would have to be.

作为[Percent Support Library](https://plus.google.com/+AndroidDevelopers/posts/C8oaLunpEEj?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)的成员，[PercentFrameLayout](http://developer.android.com/reference/android/support/percent/PercentFrameLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) 和 [PercentRelativeLayout](http://developer.android.com/reference/android/support/percent/PercentRelativeLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) 允许你使用基于百分比的尺寸来设置尺寸或者margin，你可以使用layout_widthPercent=”50%”表示布局的一半，而无须其思考具体的值。

They also contain one of most exciting features: [aspect ratio support](https://plus.google.com/+AndroidDevelopers/posts/ZQS29a5yroK?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog), making it possible to declare only a single dimension (either height or width) and basing the other on a fixed aspect ratio. This even works if one dimension is wrap_content or match_parent!

它们还有一个最令人振奋的功能：[支持纵横比ratio](https://plus.google.com/+AndroidDevelopers/posts/ZQS29a5yroK?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)，使得它可以指定单个尺寸（高度或宽度）和与之对应的固定纵横比来指定尺寸。甚至对于一个维度上的wrap_content或match_parent它也是起作用的！

### GridLayout

[GridLayout](http://developer.android.com/reference/android/support/v7/widget/GridLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) was introduced in Ice Cream Sandwich back in [2011](http://android-developers.blogspot.com/2011/11/new-layout-widgets-space-and-gridlayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog), but is also available as part of its own [Support Library](http://developer.android.com/tools/support-library/features.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#v7-gridlayout) (to support back to API 7). Designed to place items in arbitrary rows and columns and supporting the same weights as LinearLayout, it allows you to flatten your view hierarchy considerably while avoiding some of the complex arrangements of elements that affects the performance of RelativeLayout.

在[2011](http://android-developers.blogspot.com/2011/11/new-layout-widgets-space-and-gridlayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)年的Ice Cream Sandwich，我们引入了[GridLayout](http://developer.android.com/reference/android/support/v7/widget/GridLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)，但现在它是[Support库](http://developer.android.com/tools/support-library/features.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#v7-gridlayout)的一部分（支持API 7）。支持将View防止在任意行和列，并和LinearLayout一样支持权重（weight），可以让你的层级变浅，同时避免由于使用RelativeLayout带来的复杂布局和性能下降。

Unlike most layouts, **GridLayout does not require layout_height and layout_width** for each View — columns and rows (and hence their contained children) grow and shrink as needed based on the [Alignment](http://developer.android.com/reference/android/support/v7/widget/GridLayout.Alignment.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) of each. I’d strongly recommend reading over the [GridLayout.LayoutParams](http://developer.android.com/reference/android/support/v7/widget/GridLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) documentation and the [blog post](http://android-developers.blogspot.com/2011/11/new-layout-widgets-space-and-gridlayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) (noting that it was written before GridLayout gained the layout_weight attribute) if you’d like to delve into this component.

不像大多数的布局，GridLayout不要求子View有layout_height和layout_width每个视图 - 列和行会根据[基线](http://developer.android.com/reference/android/support/v7/widget/GridLayout.Alignment.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) 调整布局。
如果你想研究这个组件，我强烈建议你阅读[GridLayout.LayoutParams](http://developer.android.com/reference/android/support/v7/widget/GridLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)的文档和[博客](http://android-developers.blogspot.com/2011/11/new-layout-widgets-space-and-gridlayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) （注意，文章是在GridLayout有了layout_weight属性之前写的）。

### CoordinatorLayout

[CoordinatorLayout](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog), part of the [Android Design Support Library](http://android-developers.blogspot.com/2015/05/android-design-support-library.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog), is a subclass of FrameLayout and therefore inherits its use of layout_gravity to position children, but also includes the concept of a [Behavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog).


[CoordinatorLayout](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog),是[Android Design Support Library](http://android-developers.blogspot.com/2015/05/android-design-support-library.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)中FrameLayout的子类，除了可以使用layout_gravity控制子View的位置外，还提供了[Behavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)的概念。


Attaching a Behavior to a view either by using the [@DefaultBehavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.DefaultBehavior.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) annotation on the class, using the layout_behavior attribute, or using [setBehavior()](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#setBehavior%28android.support.design.widget.CoordinatorLayout.Behavior%29) allows that Behavior to intercept just about everything before the underlying View: measurement, layout, nested scrolling, touch events, changes to specified dependent Views, and window insets.

通过给View添加 [@DefaultBehavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.DefaultBehavior.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) 注解、使用布局属性layout_behavior或者调用方法[setBehavior()](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.LayoutParams.html?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog#setBehavior%28android.support.design.widget.CoordinatorLayout.Behavior%29)可以给View添加behavior可以在子view之前拦截事件（包括measurement, layout, nested scrolling, touch events, 根据依赖的view做出对应的更改以及window insets）。


For a deep dive into Behaviors, check out the [Intercepting everything with CoordinatorLayout Behaviors](https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) post.

深入理解Behaviors，请看博客[Intercepting everything with CoordinatorLayout Behaviors](https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)。

# Layouts, layouts, layouts

Even with just the few layouts described above, you can build a rich UI that is both performant and easy to maintain. Next time you are struggling with a particular layout, consider taking a step back and seeing if there’s an easier way to do thing by using a different layout or if building your own custom layout (and taking on the responsibilities that entails — not insignificant) is the best approach.

即使你只使用上述的一部分布局，你也可以搭建出很多高性能且易于维护的界面。剩下的时间，你可以针对特定的布局思考一下是否存在更简单的布局方式或者使用自定义视图（或者考虑一下扩展性）。


Either way, use the right layout and the right layout_ attributes to #BuildBetterApps

不论怎么样，使用正确的布局和布局属性可以帮助我们更好的构建应用。

Follow the [Android Development Patterns Collection](https://plus.google.com/collection/sLR0p?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog) for more!

更多信息，请关注[Android Development Patterns Collection](https://plus.google.com/collection/sLR0p?utm_campaign=android_series_layoutattributes_012116&utm_source=medium&utm_medium=blog)
