
Design Support Library (I): Navigation View

---

> * 原文链接 : [Design Support Library (I): Navigation View][source]
* 原文作者 : [Antonio](http://robovm.com/author/mario/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者:  [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 :  完成 


---

[Google I/O 2015][io2015] 给 Android 开发者提供了一整套新工具，让 Android 开发更容易。
我会完成一个系列文章来介绍超级实用的 [Design Support Library][design-support-library].

[Github][example] 上已经有一个很好的使用示例，不过我会通过完成一个[App][MaterializeYourApp]，
深入讲解每一个新特性。

##Navigation View

在这次的文章中，我们先介绍 **Navigation View**。Material Design 发布以来，
我们只是知道 [Navigation Drawer ][navigation-drawer] 应该长什么样。

![img-01]

想要完成自己实现一个又不是很容易。不过现在我们有了 navigation view，
这个工作就很轻松了。

##Navigation View如何工作
你应该用它替换你之前 Drawer Layout 中自定义 View 的位置。
Navigation View 可以接受一些参数，一个可选的 header layout，
还有一个用来构建导航选项的 menu。然后你只需添加事件监听器就可以了。

##Implementation

首先，创建 menu。很简单，创建一个 group，设置同时只有一个 item 能被选中。

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android">
 
    <group
        android:checkableBehavior="single">
 
        <item
            android:id="@+id/drawer_home"
            android:checked="true"
            android:icon="@drawable/ic_home_black_24dp"
            android:title="@string/home"/>
 
        <item
            android:id="@+id/drawer_favourite"
            android:icon="@drawable/ic_favorite_black_24dp"
            android:title="@string/favourite"/>
        ...
 
        <item
            android:id="@+id/drawer_settings"
            android:icon="@drawable/ic_settings_black_24dp"
            android:title="@string/settings"/>
 
    </group>
</menu>
```

理论上，你也可以像下面这样，在每个 item 中添加子 menu 实现带有分类的选项块：

```xml
<item
    android:id="@+id/section"
    android:title="@string/section_title">
    <menu>
        <item
            android:id="@+id/drawer_favourite"
            android:icon="@drawable/ic_favorite_black_24dp"
            android:title="@string/favourite"/>
 
        <item
            android:id="@+id/drawer_downloaded"
            android:icon="@drawable/ic_file_download_black_24dp"
            android:title="@string/downloaded"/>
    </menu>
</item>
```

这样会创建一个 divider 和 header，然后把 items 加到它的正下方。然而这样我们就没办法
判断哪个 item 被选中了。如果日后我知道怎样做我会更新这部分的。不过，我还是鼓励你去尝试
看看它的效果。

现在，我们可以把 navigation view 加到我们的 activity layout 里了，设置好 menu 和  header layout。
Header 可以是任意 view ，所以这里不做过多介绍，你可以到 [Github][header-axample] 查看 header 部分代码。

```xml
<android.support.v4.widget.DrawerLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/drawer_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    tools:context=".MainActivity">
 
    <FrameLayout
        android:id="@+id/content"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">
 
    ...
 
    </FrameLayout>
 
    <android.support.design.widget.NavigationView
        android:id="@+id/navigation_view"
        android:layout_width="wrap_content"
        android:layout_height="match_parent"
        android:layout_gravity="start"
        app:headerLayout="@layout/drawer_header"
        app:menu="@menu/drawer"/>
 
</android.support.v4.widget.DrawerLayout>
```

接下来看看 Java 代码部分。首先你要启用  `home as up`：

```java
final Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
setSupportActionBar(toolbar);
final ActionBar actionBar = getSupportActionBar();
 
if (actionBar != null) {
    actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_black_24dp);
    actionBar.setDisplayHomeAsUpEnabled(true);
}
```
然后初始化 navigation drawer。当一个 item 被选中时，显示一个 `Snackbar` (我会在下篇文章中介绍它)，
选中被点击的 item，关闭 drawer：

```java
drawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
 
NavigationView view = (NavigationView) findViewById(R.id.navigation_view);
view.setNavigationItemSelectedListener(new NavigationView.OnNavigationItemSelectedListener() {
    @Override public boolean onNavigationItemSelected(MenuItem menuItem) {
        Snackbar.make(content, menuItem.getTitle() + " pressed", Snackbar.LENGTH_LONG).show();
        menuItem.setChecked(true);
        drawerLayout.closeDrawers();
        return true;
    }
});
```

最后，在 menu action 按下时打开 drawer ：

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    switch (item.getItemId()) {
        case android.R.id.home:
            drawerLayout.openDrawer(GravityCompat.START);
            return true;
    }
 
    return super.onOptionsItemSelected(item);
}
```

##Conclusion

创建一个满足 Material 设计准则的 navigation drawer 是如此简单！感谢 design support library 。
下篇文章会继续介绍其他好用的新控件。你可以到这([Github][MaterializeYourApp])查看我们所有的代码
。


---

[source]:http://antonioleiva.com/navigation-view/
[author]:http://antonioleiva.com/category/blog/
[io2015]:https://events.google.com/io2015/
[design-support-library]:http://android-developers.blogspot.com.es/2015/05/android-design-support-library.html
[example]:https://github.com/chrisbanes/cheesesquare/
[MaterializeYourApp]:https://github.com/antoniolg/MaterializeYourApp
[navigation-drawer]:http://www.google.com/design/spec/patterns/navigation-drawer.html
[img-01]:http://antonioleiva.com/wp-content/uploads/2015/05/navigation_drawer1-e1433071058464.png
[header-axample]:https://github.com/antoniolg/MaterializeYourApp/blob/master/app/src/main/res/layout/drawer_header.xml