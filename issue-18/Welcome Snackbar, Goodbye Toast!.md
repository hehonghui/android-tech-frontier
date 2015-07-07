#Welcome Snackbar, Goodbye Toast!

---

> * 原文链接 : [Welcome Snackbar, Goodbye Toast!](http://www.technotalkative.com/part-2-welcome-snackbar-goodbye-toast/)
* 原文作者 : [Paresh Mayani](http://en.gravatar.com/pareshnmayani)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: 
* 状态 : 待校对

Welcome to the second part of the Android design support library tutorial series. In the first part, we talked about [Floating action button](http://www.technotalkative.com/part-1-floating-action-button/), its attributes and some of the FAB issues.

欢迎来到Android design support library系列教程第二部分，第一部分我们讨论了[Floating action button](http://www.technotalkative.com/part-1-floating-action-button/)的一些attributes 和 常见issues。



Today we will talk about another component “Snackbar”.

今天我们讨论一下另一个组件"Snackbar".

Welcome Snackbar, Goodbye Toast!

> “Providing lightweight, quick feedback about an operation is a perfect opportunity to use a snackbar.”


Snackbar is another component available in design support library. Using Snackbar, we can show a quick message at the bottom (mostly) of the screen. It’s almost similar to Toast message, but a bit more flexible:

Snackbar是design support library中另一个组件，使用Snackbar我们可以在屏幕底部(大多时候)快速弹出消息，它和Toast非常相似，但是它更灵活一些。


* It automatically disappears after a time out or after user interaction on the screen.
* It can contain an action, which is optional.
* We can dismiss FAB by swiping it off the screen.
* It is a context sensitive message and so those messages are part of the UI screen and appears above all other elements on the screen, not like Toast message overlying on a screen.
* Only one snackbar can be displayed at a time.

Snackbar mostly inherits the same methods and attributes as the Toast, example LENGTH_LONG and LENGTH_SHORT attributes for setting the duration.


* 当它显示一段时间后或用户与屏幕交互时它会自动消失。
* 可以自定义action-可选操作。
* swiping it off the screen可以让FAB消失
* 它是context sensitive message(自己理解吧),所以这些消息是UI screen的一部分并且它是显示在所有屏幕其它元素之上(屏幕最顶层)，并不是像Toast一样覆盖在屏幕上。
* 同一时间只能显示一个snackbar。

Snackbar基本上继承了和Toast一样的方法和属性，例如LENGTH_LONG 和 LENGTH_SHORT用于设置显示时长。


##Understanding Syntax:

##如何使用

Let’s have a look into the syntax:

我们看一下如何使用:

```java

Snackbar.make(view, message, duration)
       .setAction(action message, click listener)
       .show();

```

###Methods:

* *<font color="red">make()</font>*  – To make a Snackbar to display a message
* *<font color="red">setAction()</font>*  – To set an action
* *<font color="red">show()</font>*  – To show a Snackbar


###方法:

* *<font color="red">make()</font>*  – 生成Snackbar消息
* *<font color="red">setAction()</font>*  – 设置action
* *<font color="red">make()</font>*  – 显示Snackbar消息

###Attributes:

* The first parameter of the make() method is a view, snackbar will try to find a parent view to hold snackbar’s view from the value given to the ‘view’ argument. Snackbar will walk up the view tree trying to find a suitable parent, which is either a coordinatorLayout or the window decor’s content view, whichever comes first.


* As mentioned above, duration is a similar argument as the Toast duration, but either LENGTH_SHORT or LENGTH_LONG, yes it doesn’t allow to mention any random integer for the duration argument.


###属性:

* make()方法的第一个参数是一个view, snackbar会试着寻找一个父view来hold这个view. Snackbar将遍历整个view tree 来寻找一个合适的父view，它可能是一个coordinatorLayout也可能是window decor’s content view,随便哪一个都行。
* 正如上面所提到，duration参数和Toast中的duration参数类似，只能是LENGTH_SHORT 或 LENGTH_LONG，不能是其它任何随机数。


###Example:

###示例:

```java

Snackbar.make(rootlayout, "Hello SnackBar!", Snackbar.LENGTH_SHORT)
       .setAction("Undo", new View.OnClickListener() {
           @Override
           public void onClick(View v) {
               // Perform anything for the action selected
           }
       })
       .show();

```

Here, rootlayout is a framelayout inside which we have placed FAB. Take a look into the FAB example layout.

Click the FAB and check the result:

部局文件中rootlayout是framelayout并且添加了FAB(Floating action button)，看一下FAB示例：

点击FAB查看结果：


![](http://www.technotalkative.com/wp-content/uploads/2015/06/Snackbar-framelayout1.gif)

Yes, it worked but not exactly as per the standard UX. It should actually move the FAB a bit towards top, as visualized in below video. Also as per the documentation:

程序没问题，但是对于用户体验来说并不太好，它应该向上移一些，如下图所示：

> Having a CoordinatorLayout in your view hierarchy allows Snackbar to enable certain features, such as swipe-to-dismiss and automatically moving of widgets like FloatingActionButton.


We shall talk about the CoordinatorLayout into the next part of the series.

我们在该系列文章的下一部分讨论CoordinatorLayout。

![](http://www.technotalkative.com/wp-content/uploads/2015/06/Snackbar-with-CoordinatorLayout1.gif)

###Configuring Snackbar with options

###配置Snackbar可选操作

We can use some additional options to configure the snackbar such as *<font color="red">setActionTextColor</font>* and *<font color="red">setDuration</font>*:

我们可以使用额外的可选操作来配置snackbar，比如*<font color="red">setActionTextColor</font>* 和 *<font color="red">setDuration</font>*:

```java

Snackbar.make(rootlayout, "Hello SnackBar!", Snackbar.LENGTH_SHORT)
       .setAction("Undo", new View.OnClickListener() {
           @Override
           public void onClick(View v) {
               // Perform anything for the action selected
           }
       })
       .setActionTextColor(R.color.material_blue)
       .setDuration(4000).show();
       
```

You can download example from: [https://github.com/PareshMayani/DesignSupportLibraryExamples](https://github.com/PareshMayani/DesignSupportLibraryExamples)

下载示例代码：[https://github.com/PareshMayani/DesignSupportLibraryExamples](https://github.com/PareshMayani/DesignSupportLibraryExamples)

Reference:
[https://developer.android.com/reference/android/support/design/widget/Snackbar.html](https://developer.android.com/reference/android/support/design/widget/Snackbar.html)

参考文档：
[https://developer.android.com/reference/android/support/design/widget/Snackbar.html](https://developer.android.com/reference/android/support/design/widget/Snackbar.html)

###In summary

In this part, we have talked about Snackbar, which is same as the TOAST message but a bit more flexible, in terms of it can also contain a single option and we can dismiss it by swiping it off to the screen or automatically after a time interval or even after an user interaction anywhere on the screen.

We will definitely see more effects and behaviours which we can see by including CoordinatorLayout, but that would be later into this series, until than play will Snackbar!


###总结

在这部分文章中，我们讨论了Snackbar，它和TOAST很相似，但是它更灵活一些。Snackbar中可以定义action，当用户与屏幕交互时或者显示一段时间后会自动消失。

通过 CoordinatorLayout我们可以看到更多的effects 和 behaviours，在该系列文章中后续会讨论它。


