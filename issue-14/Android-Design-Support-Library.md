Android Design Support Library
---

> * 原文链接 : [Android Design Support Library](http://android-developers.blogspot.jp/2015/05/android-design-support-library.html)
* 原文作者 : [Android Developers Blog](http://developer.android.com/index.html)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/MiJack) 
* 状态 :  校对完成

Android 5.0是有史以来最重要的Android 版本之一，这其中有很大部分要归功于Material design的引入，这种新的设计语言让整个Android的用户体验焕然一新。我们的详细专题是帮助你开始采用Material Design。但是我们也知道，这种设计对于开发者，尤其是那些在意向后兼容的开发者来说是一种挑战。在Android Design Support Library的帮助下，我们为所有的开发者，所有2.1以上的设备，带来了一些重要的Material design控件。你可以在这里面找到Navigation Drawer View，输入控件的悬浮标签，Floating Action Button，Snackbar，Tab以及将这些控件结合在一起的手势滚动框架。

[YouTube的介绍](https://youtu.be/32i7ot0y78U)

###Navigation View

[Navigation drawer](http://www.google.com/design/spec/patterns/navigation-drawer.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)是app识别度与内部导航的关键，保持这里设计上的一致性对app的可用性至关重要，尤其是对于第一次使用的用户。 NavigationView 通过提供抽屉导航所需的框架让实现更简单，同时它还能够直接通过菜单资源文件直接生成导航元素。

![](http://3.bp.blogspot.com/-WmBBQQEJIKM/VWikAyy08sI/AAAAAAAABvc/1R36Txk83UI/s400/drawer.png)

把NavigationView作为DrawerLayout的内容视图来使用，布局如下：

```
<android.support.v4.widget.DrawerLayout
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:app="http://schemas.android.com/apk/res-auto"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:fitsSystemWindows="true">

    <!-- your content layout -->

    <android.support.design.widget.NavigationView
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:layout_gravity="start"
            app:headerLayout="@layout/drawer_header"
            app:menu="@menu/drawer"/>
</android.support.v4.widget.DrawerLayout>
```

你会注意到 NavigationView 的两个属性：app:headerLayout  - 控制头部的布局， app:menu - 导航菜单的资源文件（也可以在运行时配置）。NavigationView处理好了和状态栏的关系，可以确保NavigationView在API21+设备上正确的和状态栏交互。

最简单的抽屉菜单往往是几个可点击的菜单的集合：

```
<group android:checkableBehavior="single">
    <item
        android:id="@+id/navigation_item_1"
        android:checked="true"
        android:icon="@drawable/ic_android"
        android:title="@string/navigation_item_1"/>
    <item
        android:id="@+id/navigation_item_2"
        android:icon="@drawable/ic_android"
        android:title="@string/navigation_item_2"/>
</group>
```

被点击过的item会高亮显示在抽屉菜单中，让用户知道当前是哪个菜单被选中。
你也可以在menu中使用subheader来为菜单分组：

```
<item
    android:id="@+id/navigation_subheader"
    android:title="@string/navigation_subheader">
    <menu>
        <item
            android:id="@+id/navigation_sub_item_1"
            android:icon="@drawable/ic_android"
            android:title="@string/navigation_sub_item_1"/>
        <item
            android:id="@+id/navigation_sub_item_2"
            android:icon="@drawable/ic_android"
            android:title="@string/navigation_sub_item_2"/>
    </menu>
</item>
```

你可以通过设置一个OnNavigationItemSelectedListener，使用其setNavigationItemSelectedListener()来获得元素被选中的回调事件。它为你提供可以点击的[MenuItem](http://developer.android.com/reference/android/view/MenuItem.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)，让你可以处理选择事件，改变复选框状态，加载新内容，关闭导航菜单，以及其他任何你想做的操作。


###Floating labels for editing text

即便是十分简单的EditText，在Material Design 中也有提升的空间。在EditText中，当你填入第一个字符后，hint就消失了。现在将它换成[TextInputLayout](http://developer.android.com/reference/android/support/design/widget/TextInputLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)，提示信息会变成一个显示在EditText之上的floating label，这样用户就始终知道他们现在输入的是什么。

![](http://4.bp.blogspot.com/-BUKc5AwzS4A/VWihVlHr9cI/AAAAAAAABvI/rslBAoaHwzA/s1600/textinputlayout.png)

除此以外，还可以通过setError()设置当用户输入不合法时的Error提示；

###Floating Action Button


[Floating action button](http://www.google.com/design/spec/components/buttons-floating-action-button.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)是一个负责显示界面基本操作的圆形按钮。Design library中的[FloatingActionButton](http://developer.android.com/reference/android/support/design/widget/FloatingActionButton.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) 实现了一个默认颜色为主题中colorAccent的悬浮操作按钮。

![](http://2.bp.blogspot.com/-tdrgNYnQZyw/VWiOcfSRoYI/AAAAAAAABuU/6LsOxJFE4hE/s1600/image03.png)


除了一般大小的悬浮操作按钮，它还支持mini size（fabSize=”mini”）。FloatingActionButton继承自ImageView，你可以使用android:src或者ImageView的任意方法，比如[setImageDrawable()](http://developer.android.com/reference/android/widget/ImageView.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#setImageDrawable(android.graphics.drawable.Drawable)来设置FloatingActionButton里面的图标。

###Snackbar


如果你需要一个轻量级、可以快速作出反馈的控件，可以试试[SnackBar](http://www.google.com/design/spec/components/snackbars-toasts.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)。[Snackbar](http://www.google.com/design/spec/components/snackbars-toasts.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)显示在屏幕的底部,包含了文字信息与一个可选的操作按钮。在指定时间结束之后自动消失。另外，用户还可以滑动删除它们。


[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B6Okdz75tqQsLVVnZlF4UEtKRU0/components_snackbar_specs_fabtablet_002.webm)


Snackbar，可以通过滑动或者点击进行交互，可以看作是比Toast更强大的快速反馈机制，你会发现他们的API非常相似。

```
Snackbar
  .make(parentLayout, R.string.snackbar_text, Snackbar.LENGTH_LONG)
  .setAction(R.string.snackbar_action, myOnClickListener)
  .show(); // Don’t forget to show!
```

你应该注意到了make()方法中把一个View作为第一个参数，Snackbar试图找到一个合适的父亲以确保自己是被放置于底部。

###Tabs

通过选项卡的方式切换[View](http://www.google.com/design/spec/components/tabs.html)并不是Material design中才有的新概念，它们和[顶层导航模式](http://www.google.com/design/spec/patterns/app-structure.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#app-structure-top-level-navigation-strategies)或者组织app中不同分组内容（比如，不同风格的音乐）是同一个概念。

![](http://1.bp.blogspot.com/-liraQhLEn60/VWihbiaXaJI/AAAAAAAABvQ/nKi1_xcx6yk/s320/tabs.png)

Design library的[TabLayout](http://developer.android.com/reference/android/support/design/widget/TabLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) 既实现了固定的选项卡（View的宽度平均分配），也实现了可滚动的选项卡（View宽度不固定同时可以横向滚动）,也可以通过编写代码添加Tab。
```

TabLayout tabLayout = ...;
tabLayout.addTab(tabLayout.newTab().setText("Tab 1"));
```

如果，你使用[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)在tab之间横向切换，你可以直接从[PagerAdapter](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)的[getPageTitle()](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#getPageTitle(int))中创建选项卡，然后使用setupWithViewPager()将两者联系在一起。它可以使tab的选中事件能更新ViewPager,同时ViewPager的页面改变能更新tab的选中状态。



###CoordinatorLayout, 动作和滚动


独特的视觉效果只是Material design小小的一部分：运动也是设计好一款Material designed应用的重要组成部分。而在Material design中，包括[触摸Ripple](http://www.google.com/design/spec/animation/responsive-interaction.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#responsive-interaction-surface-reaction)和[有意义的转场](http://www.google.com/design/spec/animation/meaningful-transitions.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)，Design library引入[CoordinatorLayout](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog0)，一个从另一层面去控制子view之间触摸事件的布局，Design library中的很多控件都利用了它。


###CoordinatorLayout和Floating Action Buttons


一个很好的例子就是当你将FloatingActionButton作为一个子View添加进CoordinatorLayout并且将CoordinatorLayout传递给 Snackbar.make()，在3.0及其以上的设备上，Snackbar不会显示在悬浮按钮的上面，而是FloatingActionButton利用CoordinatorLayout提供的回调方法，在Snackbar以动画效果进入的时候自动向上移动让出位置，并且在Snackbar动画地消失的时候回到原来的位置，不需要额外的代码。


[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B6Okdz75tqQsLWFucDNlYWEyeW8/components_snackbar_usage_fabdo_002.webm)


CoordinatorLayout还提供了layout_anchor和layout_anchorGravity属性一起配合使用，可以用于放置floating view，比如FloatingActionButton与其他View的相对位置


###CoordinatorLayout 和app bar


另一个比较重要的场合是CoordinatorLayout结合app bar (或者action bar)和 [滚动处理](http://www.google.com/design/spec/patterns/scrolling-techniques.html?utm_campaign=io15&utm_source=dac&utm_medium=blog). 你可能在你的布局里已经使用了[Toolbar](https://developer.android.com/reference/android/support/v7/widget/Toolbar.html?utm_campaign=io15&utm_source=dac&utm_medium=blog), 能让你自定义外观，将应用中最显眼的部分和其他部分整合到一起. Design library采用了进一步的解决方案:使用[AppBarLayout](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)可以让Toolbar和其他View（例如展示Tab的TabLayout）对滚动事件作出反应，前提是他们在一个标有ScrollingViewBehavior的View中.因此，你可以创建如下的布局：
```
 <android.support.design.widget.CoordinatorLayout
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:app="http://schemas.android.com/apk/res-auto"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
     
     <! -- Your Scrollable View -->
    <android.support.v7.widget.RecyclerView
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            app:layout_behavior="@string/appbar_scrolling_view_behavior" />

    <android.support.design.widget.AppBarLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content">
   <android.support.v7.widget.Toolbar
                  ...
                  app:layout_scrollFlags="scroll|enterAlways">

        <android.support.design.widget.TabLayout
                  ...
                  app:layout_scrollFlags="scroll|enterAlways"/>
     </android.support.design.widget.AppBarLayout>
</android.support.design.widget.CoordinatorLayout>
```


现在，随着用户滚动RecyclerView，AppBarLayout通过子视图上的scroll flag，处理事件作出反应，控制他们如何进入，如何退出。Flag包括：



> - scroll: 所有想滚动出屏幕的view都需要设置这个flag- 没有设置这个flag的view将被固定在屏幕顶部。
- enterAlways: 这个flag让任意向下的滚动都会导致该view变为可见，启用"快速返回"模式。
- enterAlwaysCollapsed: 当你的视图已经设置minHeight属性又使用此标志时，你的视图只会在最小高度处进入，只有当滚动视图到达顶部时才扩大到完整高度。
- exitUntilCollapsed: 在滚动过程中，只有当视图折叠到最小高度的时候，它才退出屏幕。


注意：那些使用Scroll flag的视图必须在其他视图之前声明。这样才能确保所有的视图从顶部撤离，剩下的元素固定在前面（译者注：剩下的元素压在其他元素的上面）。

###折叠 Toolbars

直接向AppBarLayout添加ToolBar，你需要添加enteralwayscollapsed和exituntilcollapsed两个滚动Flag，但是不能在细节上不同的元素对此的反应。为此，您可以使用 [CollapsingToolbarLayout](http://developer.android.com/reference/android/support/design/widget/CollapsingToolbarLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog):

```
<android.support.design.widget.AppBarLayout
        android:layout_height="192dp"
        android:layout_width="match_parent">
    <android.support.design.widget.CollapsingToolbarLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            app:layout_scrollFlags="scroll|exitUntilCollapsed">
        <android.support.v7.widget.Toolbar
                android:layout_height="?attr/actionBarSize"
                android:layout_width="match_parent"
                app:layout_collapseMode="pin"/>
        </android.support.design.widget.CollapsingToolbarLayout>
</android.support.design.widget.AppBarLayout>
```


这个设置使用collapsingtoolbarlayout的layout_collapsemode ="pin" 确保在View折叠时，Toolbar本身仍然在屏幕顶部。更好的是，当你同时使用collapsingtoolbarlayout和Toolbar，当布局完全可见时，标题看上去明显变大了；当布局折叠完成后，它恢复到其默认大小。请注意，在这些情况下，你应该调用CollapsingToolbarLayout#settitle() ，而不是调用Toolbar。


[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B0NGgBg38lWWcFhaV1hiSlB4aFU/patterns-scrollingtech-scrolling-070801_Flexible_Space_xhdpi_003.webm)



如果你希望添加压住特定的视图效果，您可以使用app：layout_collapsemode ="parallax"（和app：layout_collapseparallaxmultiplier =“0.7”（可选,用于设置视差乘数）实现视差滚动（也就是说ImageView，作为Toolbar的兄弟节点，在collapsingtoolbarlayout中）。在这种情况下，建议在CollapsingToolbarLayout中设置
app:contentScrim="?attr/colorPrimary"这一属性，这样，当视图折叠的时候，就会有蒙上纱布的渐变效果。

[example video](http://material-design.storage.googleapis.com/publish/material_v_4/material_ext_publish/0B6Okdz75tqQscXNQY3dNdVlYeTQ/patterns-scrolling-techniques_flex_space_image_xhdpi_003.webm)


###CoordinatorLayout与自定义控件



还有一件需要注意的事情，CoordinatorLayout跟FloatingActionButton或AppBarLayout需要一定的配置-它在[Coordinator.Behavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)提供了一些API,子视图既可以更好地控制触摸事件也可以通过[onDependentViewChanged()](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#onDependentViewChanged(android.support.design.widget.CoordinatorLayout,%20V,%20android.view.View))给别人提供一个回调方法。


Views可以用CoordinatorLayout.DefaultBehavior(YourView.Behavior.class)注解（annotation）声明默认的Behavior,或者在你的布局文件中声明app:layout_behavior="com.example.app.YourView$Behavior" 属性. 这样做，就可以将任何一个View和CoordinatorLayout整合在一起.

###马上使用吧！

Design library现在就可以使用，请确保已经用SDk Manager更新了Android Support Repository. 然后添加一条dependency，你就可以使用Design library了:

```
 compile 'com.android.support:design:22.2.0'
```

需要注意的是，Design library 依赖于Support v4和AppCompat Support Libraries,在你添加  Design library时，这些库也会自动的添加到依赖中。同时，这些控件在Android Studio的Layout Editor (可以在CustomView中找到)中是可用的，你可以便捷的预览一些新的控件。

Design library, AppCompat和所有的Android Support Library 都是开发Android的强有力工具，当你打造一个符合当代风格、好看的应用时，可以使用提供现成的模块，无需从0开始。
