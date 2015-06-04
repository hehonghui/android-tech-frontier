Android Design Support Library
---

> * 原文链接 : [Android Design Support Library](http://android-developers.blogspot.jp/2015/05/android-design-support-library.html)
* 原文作者 : [Android Developers Blog](http://developer.android.com/index.html)
* 译文出自 :  [Android Design Support Library | Android Developers Blog](http://android-developers.blogspot.jp/2015/05/android-design-support-library.html)
* 译者 : [MiJack](https://github.com/MiJack) 
* 状态 :  未完成


Posted by Ian Lake, Developer Advocate

Android 5.0 Lollipop was one of the most significant Android releases ever, in no small part due to the introduction of material design, a new design language that refreshed the entire Android experience. Our detailed spec is a great place to start to adopt material design, but we understand that it can be a challenge for developers, particularly ones concerned with backward compatibility. With a little help from the new Android Design Support Library, we’re bringing a number of important material design components to all developers and to all Android 2.1 or higher devices. You’ll find a navigation drawer view, floating labels for editing text, a floating action button, snackbar, tabs, and a motion and scroll framework to tie them together.

[toutube的介绍](https://youtu.be/32i7ot0y78U)

###Navigation View
The [navigation drawer](http://www.google.com/design/spec/patterns/navigation-drawer.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) can be an important focal point for identity and navigation within your app and consistency in the design here can make a considerable difference in how easy your app is to navigate, particularly for first time users. NavigationView makes this easier by providing the framework you need for the navigation drawer as well as the ability to inflate your navigation items through a menu resource.

![](http://3.bp.blogspot.com/-WmBBQQEJIKM/VWikAyy08sI/AAAAAAAABvc/1R36Txk83UI/s400/drawer.png)

You use NavigationView as DrawerLayout’s drawer content view with a layout such as:

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
You’ll note two attributes for NavigationView: app:headerLayout controls the (optional) layout used for the header. app:menu is the menu resource inflated for the navigation items (which can also be updated at runtime). NavigationView takes care of the scrim protection of the status bar for you, ensuring that your NavigationView interacts with the status bar appropriately on API21+ devices.

The simplest drawer menus will be a collection of checkable menu items:

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
The checked item will appear highlighted in the navigation drawer, ensuring the user knows which navigation item is currently selected.

You can also use subheaders in your menu to separate groups of items:

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
You’ll get callbacks on selected items by setting a OnNavigationItemSelectedListener using setNavigationItemSelectedListener(). This provides you with the [MenuItem](http://developer.android.com/reference/android/view/MenuItem.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) that was clicked, allowing you to handle selection events, changed the checked status, load new content, programmatically close the drawer, or any other actions you may want.



###Floating labels for editing text
Even the humble [EditText](http://developer.android.com/reference/android/widget/EditText.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) has room to improve in material design. While an EditText alone will hide the hint text after the first character is typed, you can now wrap it in a [TextInputLayout](http://developer.android.com/reference/android/support/design/widget/TextInputLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog), causing the hint text to become a [floating label](http://www.google.com/design/spec/components/text-fields.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#text-fields-floating-labels) above the EditText, ensuring that users never lose context in what they are entering.


![](http://4.bp.blogspot.com/-BUKc5AwzS4A/VWihVlHr9cI/AAAAAAAABvI/rslBAoaHwzA/s1600/textinputlayout.png)


In addition to showing hints, you can also display an error message below the EditText by calling setError().

###Floating Action Button
A [floating action button](http://www.google.com/design/spec/components/buttons-floating-action-button.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) is a round button denoting a primary action on your interface. The Design library’s [FloatingActionButton](http://developer.android.com/reference/android/support/design/widget/FloatingActionButton.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) gives you a single consistent implementation, by default colored using the colorAccent from your theme.
![](http://2.bp.blogspot.com/-tdrgNYnQZyw/VWiOcfSRoYI/AAAAAAAABuU/6LsOxJFE4hE/s1600/image03.png)

In addition to the normal size floating action button, it also supports the mini size (fabSize="mini") when visual continuity with other elements is critical. As FloatingActionButton extends ImageView, you’ll use android:src or any of the methods such as [setImageDrawable()](http://developer.android.com/reference/android/widget/ImageView.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#setImageDrawable(android.graphics.drawable.Drawable)) to control the icon shown within the FloatingActionButton.

###Snackbar
Providing lightweight, quick feedback about an operation is a perfect opportunity to use a [snackbar](http://www.google.com/design/spec/components/snackbars-toasts.html?utm_campaign=io15&utm_source=dac&utm_medium=blog). Snackbars are shown on the bottom of the screen and contain text with an optional single action. They automatically time out after the given time length by animating off the screen. In addition, users can swipe them away before the timeout.

[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B6Okdz75tqQsLVVnZlF4UEtKRU0/components_snackbar_specs_fabtablet_002.webm)

By including the ability to interact with the [Snackbar](http://developer.android.com/reference/android/support/design/widget/Snackbar.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) through swiping it away or actions, these are considerably more powerful than toasts, another lightweight feedback mechanism. However, you’ll find the API very familiar:

```
Snackbar
  .make(parentLayout, R.string.snackbar_text, Snackbar.LENGTH_LONG)
  .setAction(R.string.snackbar_action, myOnClickListener)
  .show(); // Don’t forget to show!
```
You’ll note the use of a View as the first parameter to make() - Snackbar will attempt to find an appropriate parent of the Snackbar’s view to ensure that it is anchored to the bottom.

###Tabs
Switching between different [views](http://www.google.com/design/spec/components/tabs.html) in your app via tabs is not a new concept to material design and they are equally at home as a [top level navigation pattern](http://www.google.com/design/spec/patterns/app-structure.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#app-structure-top-level-navigation-strategies) or for organizing different groupings of content within your app (say, different genres of music).

![](http://1.bp.blogspot.com/-liraQhLEn60/VWihbiaXaJI/AAAAAAAABvQ/nKi1_xcx6yk/s320/tabs.png)

The Design library’s [TabLayout](http://developer.android.com/reference/android/support/design/widget/TabLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) implements both fixed tabs, where the view’s width is divided equally between all of the tabs, as well as scrollable tabs, where the tabs are not a uniform size and can scroll horizontally. Tabs can be added programmatically:

```

TabLayout tabLayout = ...;
tabLayout.addTab(tabLayout.newTab().setText("Tab 1"));
```
However, if you are using a [ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) for horizontal paging between tabs, you can create tabs directly from your [PagerAdapter](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)’s [getPageTitle()](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#getPageTitle(int)) and then connect the two together using setupWithViewPager(). This ensures that tab selection events update the ViewPager and page changes update the selected tab.

###CoordinatorLayout, motion, and scrolling
Distinctive visuals are only one part of material design: motion is also an important part of making a great material designed app. While there are a lot of parts of motion in material design including [touch ripples](http://www.google.com/design/spec/animation/responsive-interaction.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#responsive-interaction-surface-reaction) and [meaningful transitions](http://www.google.com/design/spec/animation/meaningful-transitions.html?utm_campaign=io15&utm_source=dac&utm_medium=blog), the Design library introduces [CoordinatorLayout](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog), a layout which provides an additional level of control over touch events between child views, something which many of the components in the Design library take advantage of.

###CoordinatorLayout and floating action buttons
A great example of this is when you add a FloatingActionButton as a child of your CoordinatorLayout and then pass that CoordinatorLayout to your Snackbar.make() call - instead of the snackbar displaying over the floating action button, the FloatingActionButton takes advantage of additional callbacks provided by CoordinatorLayout to automatically move upward as the snackbar animates in and returns to its position when the snackbar animates out on Android 3.0 and higher devices - no extra code required.

[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B6Okdz75tqQsLWFucDNlYWEyeW8/components_snackbar_usage_fabdo_002.webm)

CoordinatorLayout also provides an layout_anchor attribute which, along with layout_anchorGravity, can be used to place floating views, such as the FloatingActionButton, relative to other views.

###CoordinatorLayout and the app bar
The other main use case for the CoordinatorLayout concerns the app bar (formerly action bar) and [scrolling techniques](http://www.google.com/design/spec/patterns/scrolling-techniques.html?utm_campaign=io15&utm_source=dac&utm_medium=blog). You may already be using a [Toolbar](https://developer.android.com/reference/android/support/v7/widget/Toolbar.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) in your layout, allowing you to more easily customize the look and integration of that iconic part of an app with the rest of your layout. The Design library takes this to the next level: using an [AppBarLayout](http://developer.android.com/reference/android/support/design/widget/AppBarLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog) allows your Toolbar and other views (such as tabs provided by TabLayout) to react to scroll events in a sibling view marked with a ScrollingViewBehavior. Therefore you can create a layout such as:

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
                  app:layout_scrollFlags="scroll|enterAlways">
     </android.support.design.widget.AppBarLayout>
</android.support.design.widget.CoordinatorLayout>
```

Now, as the user scrolls the RecyclerView, the AppBarLayout can respond to those events by using the children’s scroll flags to control how they enter (scroll on screen) and exit (scroll off screen). Flags include:

> - scroll: this flag should be set for all views that want to scroll off the screen - for views that do not use this flag, they’ll remain pinned to the top of the screen
- enterAlways: this flag ensures that any downward scroll will cause this view to become visible, enabling the ‘quick return’ pattern
- enterAlwaysCollapsed: When your view has declared a minHeight and you use this flag, your View will only enter at its minimum height (i.e., ‘collapsed’), only re-expanding to its full height when the scrolling view has reached it’s top.
- exitUntilCollapsed: this flag causes the view to scroll off until it is ‘collapsed’ (its minHeight) before exiting

One note: all views using the scroll flag must be declared before views that do not use the flag. This ensures that all views exit from the top, leaving the fixed elements behind.

###Collapsing Toolbars
###折叠 Toolbars
Adding a Toolbar directly to an AppBarLayout gives you access to the enterAlwaysCollapsed and exitUntilCollapsed scroll flags, but not the detailed control on how different elements react to collapsing. For that, you can use [CollapsingToolbarLayout](http://developer.android.com/reference/android/support/design/widget/CollapsingToolbarLayout.html?utm_campaign=io15&utm_source=dac&utm_medium=blog):

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
This setup uses CollapsingToolbarLayout’s app:layout_collapseMode="pin" to ensure that the Toolbar itself remains pinned to the top of the screen while the view collapses. Even better, when you use CollapsingToolbarLayout and Toolbar together, the title will automatically appear larger when the layout is fully visible, then transition to its default size as it is collapsed. Note that in those cases, you should call setTitle() on the CollapsingToolbarLayout, rather than on the Toolbar itself.

这个设置使用collapsingtoolbarlayout的layout_collapsemode ="pin" 确保在View折叠时，Toolbar本身仍然在屏幕顶部。更好的是，当你同时使用collapsingtoolbarlayout和Toolbar，当布局完全可见时，标题看上去明显变大了；当布局折叠完成后，它恢复到其默认大小。请注意，在这些情况下，你应该调用CollapsingToolbarLayout#settitle() ，而不是调用Toolbar。


[example video](http://material-design.storage.googleapis.com/publish/material_v_3/material_ext_publish/0B0NGgBg38lWWcFhaV1hiSlB4aFU/patterns-scrollingtech-scrolling-070801_Flexible_Space_xhdpi_003.webm)

In addition to pinning a view, you can use app:layout_collapseMode="parallax" (and optionally app:layout_collapseParallaxMultiplier="0.7" to set the parallax multiplier) to implement parallax scrolling (say of a sibling ImageView within the CollapsingToolbarLayout). This use case pairs nicely with the app:contentScrim="?attr/colorPrimary" attribute for CollapsingToolbarLayout, adding a full bleed scrim when the view is collapsed.



如果你希望添加压住特定的视图效果，您可以使用app：layout_collapsemode ="parallax"（和app：layout_collapseparallaxmultiplier =“0.7”（可选,用于设置视差乘数）实现视差滚动（也就是说ImageView，作为Toolbar的兄弟节点，在collapsingtoolbarlayout中）。在这种情况下，建议在CollapsingToolbarLayout中设置
app:contentScrim="?attr/colorPrimary"这一属性，这样，当视图折叠的时候，就会有蒙上纱布的渐变效果。

[example video](http://material-design.storage.googleapis.com/publish/material_v_4/material_ext_publish/0B6Okdz75tqQscXNQY3dNdVlYeTQ/patterns-scrolling-techniques_flex_space_image_xhdpi_003.webm)


###CoordinatorLayout and custom views
###CoordinatorLayout与自定义控件


One thing that is important to note is that CoordinatorLayout doesn’t have any innate understanding of a FloatingActionButton or AppBarLayout work - it just provides an additional API in the form of a [Coordinator.Behavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog), which allows child views to better control touch events and gestures as well as declare dependencies between each other and receive callbacks via [onDependentViewChanged()](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#onDependentViewChanged(android.support.design.widget.CoordinatorLayout,%20V,%20android.view.View)).

还有一件需要注意的事情，CoordinatorLayout跟FloatingActionButton或AppBarLayout需要一定的配置-它在[Coordinator.Behavior](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog)提供了一些API,子视图既可以更好地控制触摸事件也可以通过[onDependentViewChanged()](http://developer.android.com/reference/android/support/design/widget/CoordinatorLayout.Behavior.html?utm_campaign=io15&utm_source=dac&utm_medium=blog#onDependentViewChanged(android.support.design.widget.CoordinatorLayout,%20V,%20android.view.View))给别人提供一个回调方法。

Views can declare a default Behavior by using the CoordinatorLayout.DefaultBehavior(YourView.Behavior.class) annotation,or set it in your layout files by with the app:layout_behavior="com.example.app.YourView$Behavior" attribute. This framework makes it possible for any view to integrate with CoordinatorLayout.

Views可以用CoordinatorLayout.DefaultBehavior(YourView.Behavior.class)注解（annotation）声明默认的Behavior,或者在你的布局文件中声明app:layout_behavior="com.example.app.YourView$Behavior" 属性. 这样做，就可以将任何一个View和CoordinatorLayout整合在一起.

###Available now!
###马上使用吧！
The Design library is available now, so make sure to update the Android Support Repository in the SDK Manager. You can then start using the Design library with a single new dependency:

Design library现在就可以使用，请确保已经用SDk Manager更新了Android Support Repository. 然后添加一条dependency，你就可以使用Design library了:

```
 compile 'com.android.support:design:22.2.0'
```z
Note that as the Design library depends on the Support v4 and AppCompat Support Libraries, those will be included automatically when you add the Design library dependency. We also took care that these new widgets are usable in the Android Studio Layout Editor’s Design view (find them under CustomView), giving you an easier way to preview some of these new components.

需要注意的是，Design library 依赖于Support v4和AppCompat Support Libraries,在你添加  Design library时，这些库也会自动的添加到依赖中。同时，这些控件在Android Studio的Layout Editor (可以在CustomView中找到)中是可用的，你可以便捷的预览一些新的控件。

The Design library, AppCompat, and all of the Android Support Library are important tools in providing the building blocks needed to build a modern, great looking Android app without building everything from scratch.

Design library, AppCompat和所有的Android Support Library 都是开发Android的强有力工具，当你打造一个符合当代风格、好看的应用时，可以使用提供现成的模块，无需从0开始。
