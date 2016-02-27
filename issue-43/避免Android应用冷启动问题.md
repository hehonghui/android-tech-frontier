避免Android应用冷启动问题
---

> * 原文链接 : [Avoiding cold starts on Android](http://saulmm.github.io/avoding-android-cold-starts)
* 原文作者 : [Saúl Molinero](http://saulmm.github.io/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



During the last weeks, has been seen in the Android developer community some movement regarding the cold starts, splash screens or launch screens on Android. In this post, I'd like to make clear my opinion of whether they are necessary or not, how to use them and how to go beyond in order to offer the best user experience of onboarding to our users.

The code and the examples shown in this article are available at this [Github repository](https://github.com/saulmm/onboarding-examples-android)

在过去的几周里，Android 开发者社区有人在讨论 Android 应用的冷启动问题（即启动应用时有一段时间屏幕不显示内容，背景全为白/黑），在本篇博文中，我将解释解决这个问题是否必要，以及如何解决它以使用户得到最好的使用体验。

本篇博文涉及的代码可以在 [Github](https://github.com/saulmm/onboarding-examples-android)
 看到。

##Splash screens, launch screens & cold starts.
##应用的冷启动问题
With this post, Colt McAnlis, (developer advocate at Google) again opened the discussion regarding the usage of Splash/Launch screens on Android sharing a keynote by Cyril Mottier which, among other things, talks about why we should avoid using Splash Screens on Android, arguing that they hurt the user experience, increase the size of the application, etc.

Colt McAnlis（Google 的一名工程师）再次开启了一个讨论帖来讨论有关 Splash/Launch 启动页面的正确用法，讨论的主题和 Cyril Mottier 之前开启的讨论相同，大体是说为什么我们在开发的时候应该避免使用 Splash 启动页。讨论的冲突点在于一部分人认为 Splash 启动页破坏了用户体验，增加了应用的体积等等……

In my opinion, users should have the content available as soon as possible, but inevitably, when a user launches an application, Android creates a new process that, during it charge, shows a black/white screen which is built with the application theme, or the theme of the activity that is the entry point.

This load can be increased if our application is complex and overwrites the application object, which is normally used to initialize the analytics, error reporters, etc.

在我看来，用户在使用应用时，应用的内容应该尽可能快呈现给用户，但当用户启动某个应用，Android 内核总会创建一个进程，使得屏幕不可避免地显示黑/白（取决于应用的 theme 或入口 Activity 的 theme）。

应用本身越复杂，或应用使用的 Application 类被重写过以需要完成更多的任务（如初始化数据分析，错误报告，等等……）时，这段时间会变得更长。

![](https://github.com/saulmm/OnboardingSample/blob/master/art/airbnb.gif?raw=true)

Airbnb shows a white screen in its initialization 
Airbnb 在初始化时就会像上图那样留白

Therefore, a black screen is not the best choice for our user. If our application load time is slow, we could use a placeholder to simply fill it by real content, or on the other hand, if our workload is complex, we could show the logo of our application to reinforce the branding.

对用户来说，这样的界面显然不是他们想要看到的。假如应用的加载时间很长，我们可以通过 placeholder 用一些内容去填充它，或者显示 Logo 以加强品牌印象。

![](https://github.com/saulmm/OnboardingSample/blob/master/art/aliexpress.gif?raw=true)

AliExpress shows its logo in its initialization 
AliExpress 在初始化时会显示其 Logo

##Your new friend, windowBackground
##你的新帮手，windowBackground
As we talked about before, the window displayed by the window manager when the process is in the loading state is set up with the application theme. Specifically with the value inside android:windowBackground. As concerns [this post by Ian Lake](https://plus.google.com/+AndroidDevelopers/posts/Z1Wwainpjhd), if we play with this attribute setting a <layer-list> with the color of the background of the main activity over a small bitmap in the center we can achieve the following effect:

就像我们之前讨论的，在进程处于加载状态时，由 WindowManager 显示的 Window 创建时由应用的 theme 决定其显示内容，明确地说是由 android:windowBackground 的值决定的。就像 [Ian Lake](https://plus.google.com/+AndroidDevelopers/posts/Z1Wwainpjhd) 的这篇博文所提到的，如果我们为该属性设置 <layer-list> 元素，该元素使用 MainActivity 的背景颜色，并在屏幕中间显示一个 Pizza 图像，可以实现下面的效果：

![](https://github.com/saulmm/OnboardingSample/blob/master/art/simple.gif?raw=true)

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:opacity="opaque">

    <item android:drawable="@color/grey"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/img_pizza"/>
    </item>
</layer-list>
```

We must keep in mind that to avoid problems, the <layer-list> has to be opaque, android:opacity="opaque". And the background of the parent of your activity should be filled with a color in your layout, if not, the <layer-list> shown at the start will remain in your activity.

这里要为 <layer-list> 的 android:opacity="opaque" 属性进行这样的设置，使 <layer-list> 为不透明的，要不然会出现一些问题，请读者记住这一点。此外，Activity 的布局背景应该填充了某个颜色，不然的话 <layer-list> 会留在你的 Activity 中。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@color/grey"
    >

    <android.support.v7.widget.Toolbar
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        android:background="?colorPrimary"
        android:elevation="4dp"
        />
</LinearLayout>
```

##Styling the onboarding of your app
##自定义启动页
Taking advantage of the windowBackground we can enrich the experience of our users. If our application is complex, and will show a unique activity like a login or a choice selector, we could take the same anchor point of the bitmap and animate it to achieve a nice effect.

For example: 

利用 windowBackground 属性可以给用户更好的体验。如果应用很复杂，那么可以显示一个独特的 Activity 来完成登录操作或进行选择操作，利用图片和动画可以实现下面这个酷炫的效果：

![](https://github.com/saulmm/OnboardingSample/blob/master/art/center.gif?raw=true)

This animation, translates an ImageView that contains the same resource of the <layer-list>.
该动画在竖直方向上移动 ImageView，该 ImageView 包含了 <layer-list> 元素。

```java
ViewCompat.animate(logoImageView)
    .translationY(-250)
    .setStartDelay(STARTUP_DELAY)
    .setDuration(ANIM_ITEM_DURATION).setInterpolator(
         new DecelerateInterpolator(1.2f)).start();
```

This ImageView is slightly above of the center of the screen, this could be influenced by system bars, I've put a margin top of 12dp which just coincides with the half of the height of the status bar.

从效果图可以看到，ImageView 要稍微高于屏幕的中心点，实际位置会受 SystemBar 的大小影响，在这里我为它设置了 12dp 的顶部间距，差不多是状态栏高度的一半。

```java
<ImageView
    android:id="@+id/img_logo"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_gravity="center"
    android:layout_marginTop="12dp"
    android:src="@drawable/img_face"
    tools:visibility="gone"
    />
```

##Styling with a placeholder
##自定义 placeholder
With the <layer-list> we can also create a placeholder of theu ui which will take the real content of the main activity, for example, we could emulate a Toolbar by playing with the <layer-list>.

使用 <layer-list> 可以创建 placeholder 以显示 MainActivity 的内容，例如，可以通过 <layer-list> 模仿 Toolbar。

![](https://github.com/saulmm/OnboardingSample/blob/master/art/toolbar_placeholder.png?raw=true)

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:opacity="opaque"
    >
    <item>
        <shape>
            <solid android:color="@color/grey"/>
        </shape>
    </item>

    <item
        android:height="180dp"
        android:gravity="top">
        <shape android:shape="rectangle">
            <solid android:color="?colorPrimary"/>
        </shape>
    </item>
</layer-list>
```

In this case, the second <item> emulates the Toolbar that is displayed in the actual content, even, we could put the same height (less the width of the status bar) and apply some nice animation on the toolbar to provide a better experience to the user.
其中，第二个 <item> 模仿真正要被显示到屏幕上的 Toolbar，甚至我们可以将它的高度设置为 Toolbar 的高度（宽度小于状态栏一点点），应用一些酷炫的动画到 Toolbar，给用户更好的体验，效果图：

![](https://github.com/saulmm/OnboardingSample/blob/master/art/placeholder.gif?raw=true)

```java
private void collapseToolbar() {
    int toolBarHeight;
    TypedValue tv = new TypedValue();
    getTheme().resolveAttribute(android.R.attr.actionBarSize, tv, true);
    toolBarHeight = TypedValue.complexToDimensionPixelSize(
        tv.data, getResources().getDisplayMetrics());

    ValueAnimator valueHeightAnimator = ValueAnimator
        .ofInt(mContentViewHeight, toolBarHeight);

    valueHeightAnimator.addUpdateListener(
        new ValueAnimator.AnimatorUpdateListener() {

        @Override
        public void onAnimationUpdate(ValueAnimator animation) {
            ViewGroup.LayoutParams lp = mToolbar.getLayoutParams();
            lp.height = (Integer) animation.getAnimatedValue();
            mToolbar.setLayoutParams(lp);
        }
    });

    valueHeightAnimator.start();
    valueHeightAnimator.addListener(
        new AnimatorListenerAdapter() {

        @Override
        public void onAnimationEnd(Animator animation) {
            super.onAnimationEnd(animation);

            // Fire recycler animator
            mAdapter.addAll(ModelItem.getFakeItems());

            // Animate fab
            ViewCompat.animate(mFab).setStartDelay(600)
                .setDuration(400).scaleY(1).scaleX(1).start();

        }
    });
}
```