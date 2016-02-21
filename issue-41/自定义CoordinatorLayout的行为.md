自定义 CoordinatorLayout 的行为
---

> * 原文链接 : [Customizing CoordinatorLayout's Behavior](https://www.bignerdranch.com/blog/customizing-coordinatorlayouts-behavior/)
* 原文作者 : [Chris Stewart](https://www.bignerdranch.com/about-us/nerds/chris-stewart/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121) 
* 状态 :  完成 



当 Android design support library 在前几个月被发布时，Android 开发者们获得了各种各样有趣的东西，而且其中大多数东西看名字就知道是啥：FloatingActionButton(FAB)，Snackbar，Tab，这些东西都不知道的话和咸鱼有什么区别。

但 Android design support library 中有一个控件 - CoordinatorLayout 有一些绝大部分开发者都没发现的秘密，接下来就让我们来研究 CoordinatorLayout 吧。

##CoordinatorLayout

但你可能很少听说 CoordinatorLayout，大概是因为当你使用它时，往往不需要知道许多与它相关的细节，就能得到你想要的效果。然而 CoordinatorLayout 比它看起来 6 得多。不妨拿 SnackBar 和 FAB 作为例子，用 CoordinatorLayout 确保 FAB 会在 SnackBar 出现的时候会向上移动：

xml 如下：

```xml
<android.support.design.widget.CoordinatorLayout
  android:id="@+id/container"
  xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:app="http://schemas.android.com/apk/res-auto"
  android:layout_width="match_parent"
  android:layout_height="match_parent">

  ...

  <android.support.design.widget.FloatingActionButton
    android:id="@+id/fab"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom|right|end"
    android:layout_margin="8dp"
    android:src="@drawable/abc_ic_search_api_mtrl_alpha"/>

</android.support.design.widget.CoordinatorLayout>
```

然后显示你的 SnackBar：

```java
Snackbar.make(findViewById(R.id.container), "Hey there!", Snackbar.LENGTH_LONG).show();
```

然后你就会发现 FAB 会在 SnackBar 出现时移动了。

![](https://www.bignerdranch.com/img/blog/2016/02/fab_normal_size.gif)

除此以外，CoordinatorLayout 还能基于你的滚动位置增加 ToolBar 的大小或在用户滚动列表时隐藏 Toolbar。你可以用你自己的行为自定义。

那么 CoordinatorLayout 是怎么知道他需要与 FAB 交互完成的操作呢？它是怎么知道当 SnackBar 出现时 FAB 要向上移动呢？CoordinatorLayout 是通过实现 FloatingActionButton 声明的 CoordinatorLayout.Behavior 完成的。

##CoordinatorLayout.Behavior

CoordinatorLayout 中的 View 可以指定该 View 如何与其他 View 交互的行为。

```java
@CoordinatorLayout.DefaultBehavior(FloatingActionButton.Behavior.class)
public class FloatingActionButton extends ImageView {
  ...
}
```

如果你去看 FAB 的源码，你会发现它的行为是通过注解在类声明中定义的。

FAB 将 FloatingActionButton.Behavior 作为其默认行为，除非你将它设置为其他的 behavior，而默认的 Behavior 了解在 SnackBar 出现时如何移动到它的上面。

##自定义 Behavior

那么你要怎么自定义 Behavior 呢？你可以创建一个 Behavior 的子类，现在我就创建一个 Behavior 在 SnackBar 出现时闪烁 FAB 而不是让它移动到 SnackBar 上面。

![](https://www.bignerdranch.com/img/blog/2016/02/fab_shrink.gif)

首先在 xml 中使用 app:layout_behavior 属性设置你的自定义 Behavior：

```xml
...

<android.support.design.widget.FloatingActionButton
  android:id="@+id/fab"
  android:layout_width="wrap_content"
  android:layout_height="wrap_content"
  android:layout_gravity="bottom|right|end"
  android:layout_margin="8dp"
  android:src="@drawable/abc_ic_search_api_mtrl_alpha"
  app:layout_behavior="com.bignerdranch.android.custombehavior.ShrinkBehavior"/>

...
```

然后创建你的 Behavior 类：

```java
public class ShrinkBehavior extends CoordinatorLayout.Behavior<FloatingActionButton> {

  public ShrinkBehavior(Context context, AttributeSet attrs) {
      super(context, attrs);
  }

}
```

当你定义你的 Behavior，你可以重载许多方法，在这里我们只需要重载两个方法：

```java
@Override
public boolean layoutDependsOn(CoordinatorLayout parent, FloatingActionButton child, View dependency) {
    return dependency instanceof Snackbar.SnackbarLayout;
}
```

layoutDependsOn() 方法帮助 CoordinatorLayout 知道 FAB 依赖于哪个 View。在这里例子中，就是指 SnackBar，通过返回 true 设置依赖。

Android API 文档上说，设置依赖后，当一个独立的 View 改变了它的大小或位置，你会调用到onDependentViewChanged()，你可以在 CoordinatorLayout 中看到更多的细节。

```java
@Override
public boolean onDependentViewChanged(CoordinatorLayout parent, FloatingActionButton child, View dependency) {
  float translationY = getFabTranslationYForSnackbar(parent, child);
  float percentComplete = -translationY / dependency.getHeight();
  float scaleFactor = 1 - percentComplete;

  child.setScaleX(scaleFactor);
  child.setScaleY(scaleFactor);
  return false;
}
```

当 SnackBar 出现，该方法不断被调用，然后通过简单的数学运算你就可以判断 SnackBar 离屏幕边缘有多远，并改变你的 FAB 的大小。[ShrinkBehavior](https://github.com/cstew/CustomBehavior/blob/master/app/src/main/java/com/bignerdranch/android/custombehavior/ShrinkBehavior.java) 可以在 Github 上看到完整的实现，你也可以直接下载旋转 FAB 的[例子的源码](https://github.com/cstew/CustomBehavior)。