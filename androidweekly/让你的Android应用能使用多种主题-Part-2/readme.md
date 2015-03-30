让你的Android应用能使用多种主题 ( Part 2 )
---

>
* 原文链接 : [Supporting multiple themes in your Android app (Part 2)](http://www.hidroh.com/2015/02/25/support-multiple-themes-android-app-part-2/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 :  完成

在 [上一篇博文](http://www.hidroh.com/2015/02/16/support-multiple-themes-android-app/) 中，我们创建了一个明亮风格的主题，并且为实现使用多种主题作了一些前期的准备，而今天呢，我打算在这篇博文中接着上一篇博文继续为大家讲解，而我今天要讲的内容大概是以下三个部分：使 Android 应用能够使用多种主题，创建一个灰暗风格的主题，以及允许 Android 应用在运行时自由地切换不同的主题。

在理想的情况下，如果我们把主题的设置看作是一项配置，那么我们应该能够在类似 "theme-qualifier" 的目录下指定我们想要的特定主题，例如：values-dark 就是我们想要的灰暗风格主题；而values-light 则是明亮风格的主题。但很遗憾，在这篇博文所要讲述的实现方法里，这种方法并没有成为实现方式之一。

那么我们要怎么为不同的主题指定相应的资源文件呢？如果我们有了解过 appcompat 是怎么使用资源文件的话，对 Android 系统是如何管理和使用资源文件会有一个粗略的认识。毫无疑问，[Materialistic](https://play.google.com/store/apps/details?id=io.github.hidroh.materialistic) 中使用的方法就是类似于 Android 系统使用的方法。


## 主题设置 ##

**values/styles.xml**

```xml
    <style name="AppTheme" parent="Theme.AppCompat.Light">
    <!-- original theme attributes -->
    ...
    </style>
    
    <style name="AppTheme.Dark" parent="Theme.AppCompat">
   		 <item name="colorPrimary">@color/colorPrimaryInverse</item>
   		 <item name="colorPrimaryDark">@color/colorPrimaryDarkInverse</item>
   		 <item name="colorAccent">@color/colorAccentInverse</item>
   		 <item name="android:textColorPrimary">@color/textColorPrimaryInverse</item>
   		 <item name="android:textColorSecondary">@color/textColorSecondaryInverse</item>
   		 <item name="android:textColorPrimaryInverse">@color/textColorPrimary</item>
   		 <item name="android:textColorSecondaryInverse">@color/textColorSecondary</item>
    ...
    </style>
```    

**values/color.xml**

```xml
    <!-- original color palette -->
    ...
    <!-- alternative color palette -->
    <color name="colorPrimaryInverse">...</color>
    <color name="colorPrimaryDarkInverse">...</color>
    <color name="colorAccentInverse">...</color>

```


在上面的操作中我们创建了一个名叫 AppTheme.Dark 的灰暗风格主题，此外，为了保持 style 和 color 的一致性，我们的 AppTheme.Dark 主题衍生于 appcompat 的 Theme.AppCompat 主题（一个 Android 自带的灰暗风格主题）。然而，由于我们的两个主题（明亮风格和灰暗风格）衍生于不同的基础主题，因此这两个主题之间并不能够进行属性的共享（在JAVA中，类只能进行单继承）。

这两个主题理应有一些恰当的属性值，能同时用于设置基本的 Android 和 appcompat的主题属性，例如：在灰暗风格中，android:textColorPrimary 应该被设置为明亮的，而在明亮风格中，android:textColorPrimary则应该是灰暗的。按照常用的命名习惯，我们在这里将用相反的后缀来区分可替代的主题颜色。

## 温馨小提示 

> 在某些情况下，一种颜色能同时在明亮风格和灰暗风格的主题中被使用，这当然是喜闻乐见的情况，但是在大部分主题中这并不能够实现。所以我希望你在设计主题的过程中，通过在 AndroidManifest.xml 中短暂地切换你应用里正在使用的可替代主题，以此确定你的主题是否需要添加其他的 colors/style 文件来满足你的主题设计需求。


## 特定的主题资源文件 

到了现在，我相信我们都能很轻松地为我们的 App 设计出美如画的灰暗风格主题，但这里还存在一些小麻烦，例如：用于美化 action bar 菜单选项的 drawables 资源文件。灰暗风格的 action bar 需要用明亮的颜色修饰它的菜单选项，反之亦然。为了让 Android 能够在不同的App主题下区分不同的 drawables 资源文件，我们创建了能够指定正确资源文件的 [自定义属性](http://developer.android.com/training/custom-views/create-view.html#customattr) 引用，并且在不同的主题下提供了不同的 drawable 引用，将其值赋给特定的自定义属性。（温婉如妻，appcompat 库贴心地为我们准备了类似 colorPrimary 的自定义属性值）

**values/attrs.xml** 

```xml

    <attr name="themedMenuStoryDrawable" format="reference" />
    <attr name="themedMenuCommentDrawable" format="reference" />
    ...
```

**values/styles.xml** 

```xml

    <style name="AppTheme" parent="Theme.AppCompat.Light">
    <!-- original theme attributes -->
    ...
  	  <item name="themedMenuStoryDrawable">@drawable/ic_subject_white_24dp</item>
   	  <item name="themedMenuCommentDrawable">@drawable/ic_mode_comment_white_24dp</item>
    </style>
    
    <style name="AppTheme.Dark" parent="Theme.AppCompat">
    <!-- alternative theme attributes -->
    ...
   		 <item name="themedMenuStoryDrawable">@drawable/ic_subject_black_24dp</item>
   		 <item name="themedMenuCommentDrawable">@drawable/ic_mode_comment_black_24dp</item>
    </style>
```

**menu/my_menu.xml** 

```xml
    <menu xmlns:android="http://schemas.android.com/apk/res/android">
    	<item android:id="@id/menu_comment"
    android:icon="?attr/themedMenuCommentDrawable" />
   		<item android:id="@id/menu_story"
    android:icon="?attr/themedMenuStoryDrawable" />
   		<item android:id="@id/menu_share"
    app:actionProviderClass="android.support.v7.widget.ShareActionProvider" />
    </menu>
```

根据你实际的主题设计需要，类似的实现也能被用于为大多数自定义属性指定相应的资源值。但这个方法存在一个问题：根据实际的需要从 drawable 资源文件中解析相应的属性值，并应用于主题的方法在API 21之前的版本似乎都不可行。举例来说明这个问题吧：如果你有一个 layer-list 中包含了各种你所需要的 color 的 drawable 资源文件，在API 21之前的版本中，这些 color 的值都应该是固定的，而不是能够在App运行过程中不断变化的。这个问题在 Google I/O 2014 大会上有被提出，并要求给出相应的解决办法。（详情参见 [Click Me!](https://github.com/google/iosched/commit/dd7ed72a7eb2d223203db079bd99d31c6ef3061e)）。

此外，为了避免在不同的主题中重复使用相同的资源文件，我们可以利用 drawable 的 tint 属性解决这个需求。虽然这个属性可以在API 21之后的版本中使用。但 [Dan Lew](http://blog.danlew.net/2014/08/18/fast-android-asset-theming-with-colorfilter/) 在他的博客中为我们介绍了怎么在所有的 API 版本中使用 tint 属性。但就个人偏好来说，如果可以的话，我会更倾向于选择不受 View 逻辑影响的 Java 实现，所以我选择为每一个主题提供不同的 drawable 资源文件。

## 动态主题切换 

现在我们已经有两个可以使用的主题了，接下来我们需要做的就是让用户能够在使用 App 时能够自如地根据他们的个人偏好切换不同的主题。要实现这个功能，我们可以通过使用 SharedPreferences 来实现，通过改变 pref_dark_theme 的值去存储当前被选择的主题并决定我们的 App 将要被切换成什么主题。但从实际情况来考虑，主题切换后，App 所有 Activity 的 View 在被创建之前都应该被改变，所以我们只需要在 onCreate()方法中实现我们的逻辑。

**BaseActivity.java** 

```java
    public abstract class BaseActivity extends ActionBarActivity {
   		 @Override
    	 protected void onCreate(Bundle savedInstanceState) {
   			 if (PreferenceManager.getDefaultSharedPreferences(this)
   				 .getBoolean("pref_dark_theme"), false)) {
    		   setTheme(R.style.AppTheme_Dark);
    		}
    	super.onCreate(savedInstanceState);
    	}
    }
```

在这里，因为我们的 App 已经使用了默认的明亮风格主题，所以我们只需要检查默认的引用是否被重载，是否被用于重载灰暗风格的主题。为了默认的引用能够被所有 Activity共享，其中的逻辑已经在 "base" Activity中被写好了。

值得注意的是，这个方法只能被用于改变没有处在 [back stack](http://developer.android.com/guide/components/tasks-and-back-stack.html) 中的 Acitivity 的主题。而那些已经在 back stack 中的 Activity，仍然会显示为之前的主题，因为当我们结束当前 Activity，返回到上一个 Activity，只会触发 onResume() 方法，而不是我们期望的 onCreate()方法。因此，考虑到实际的产品功能设计需求，我们当然要解决这些“过时”的 Activity 了，我在这里为大家提供了两种解决办法，都挺简单的：一方面，我们可以清空我们的 back stack；另一方面，一旦 preference 被改变，我们就在 back stack 中按照顺序让所有 Acitivty 出栈后重新加载，将所有 Activity 的主题改变后再重新入栈。在这里为了简便，我们选择的实现方法是：当主题被改变，我们就简单地清空 back stack，然后重启当前的 Activity。

## SettingsFragment.java ##

```java
    public class SettingsFragment extends PreferenceFragment {
   		...
    
    	@Override
   		public void onActivityCreated(Bundle savedInstanceState) {
    		super.onActivityCreated(savedInstanceState);

    		mListener = new SharedPreferences.OnSharedPreferenceChangeListener() {
    		@Override
    		public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
    			if (!key.equals("pref_dark_theme")) {
    				return;
    			}
    
    		getActivity().finish();

    		final Intent intent = getActivity().getIntent();
    		intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | IntentCompat.FLAG_ACTIVITY_CLEAR_TASK);
    		getActivity().startActivity(intent);
    		}
    	};
    }
    
    ...
```

虽然结束得有些突然，但我们今天的讲解就到此结束啦。现在我们的 App 拥有了两个这么优雅的主题，就算是挑剔的文艺小清新也不会嫌弃我们的 App 很 low 了吧！如果你想要了解整个 Materialistic 的具体实现，或者是这个功能的源码，可以来我的 [GitHub](https://github.com/hidroh/materialistic) 上获取哦～