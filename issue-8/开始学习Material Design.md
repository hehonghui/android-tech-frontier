开始学习Material Design
---

> * 原文链接 : [Android Getting Started with Material Design](http://www.androidhive.info/2015/04/android-getting-started-with-material-design/)
* 原文作者 : [Ravi Tamada](http://www.androidhive.info/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [xu6148152](https://github.com/xu6148152) 
* 校对者: [chaossss](https://github.com/chaossss)   
* 状态 :  完成




你可能已经听说过Android Lollipop中引入的Material Design.Material Design引入了很多新的东西，如Material 主题, 新的控件, 自定义阴影, 矢量绘制 and 自定义动画.如果你还没用过Material Design，那么本文很适合你。

我们将在本文中学习Material Design开发的基本步骤:编写自定义主题和用RecyclerView实现navigation drawer.

在下面的链接中，你能够学到更多有关Material Design的知识  

[Material Design Specifications](http://www.google.com/design/spec/material-design/introduction.html#)  

[Creating Apps with Material Design](http://developer.android.com/training/material/index.html)  
 
[Code](http://download.androidhive.info/download?code=WPSkdrdZprHT0KLCZS3ClafgXBikGqM4r7FnNYdsdUTmlAkK6%2F2mkT0heOlNOq4U82rzqbod%2F14yU2uk5TWY4Zp%2FAYx6oiD7SKI%2FEgtUapzQUqkqcWEXX1bmw%3D%3DvqARiMEKqkqsXGbVf3vVUoffTqQcD2qfqZo)

[Video](http://www.youtube.com/embed/jDXX_wDvarM)

###1.下载AndroidStudio

再往下走之前，先下载Android Studio，并配置好本文之前提到的东西，如果你是首次使用Android Studio，先去看看文档.

###2.Material Design 颜色自定义

Material Deisgin提供以下系列自定义Material Deisign 颜色主题的属性，但本文只使用5种基本属性来自定义整体的主题

colorPrimaryDark - 这是app中最黑的基本色，主要用来做notification bar的背景.

colorPrimary - 这是app的基本颜色,将用作toolbar的背景色

textColorPrimary - 文本颜色,用于toolbar的标题

windowBackground - app默认的背景颜色

navigationBarColor - 这个颜色定义了navigation bar页脚的背景色.  

![](http://cdn2.androidhive.info/wp-content/uploads/2015/04/android-material-design-color-schema.png)

你能选择适合你APP风格的颜色

###3.创建Material Design 主题

1.在as中，创建新项目,选择BlankActivity.

2.打开res->values->strings.xml 添加以下字符值

  
```xml  
strings.xml
<resources>  

    <string name="app_name">Material Design</string>
    <string name="action_settings">Settings</string>
    <string name="action_search">Search</string>
    <string name="drawer_open">Open</string>
    <string name="drawer_close">Close</string>
 
    <string name="nav_item_home">Home</string>
    <string name="nav_item_friends">Friends</string>
    <string name="nav_item_notifications">Messages</string>
 
    <!-- navigation drawer item labels  -->
    <string-array name="nav_drawer_labels">
        <item>@string/nav_item_home</item>
        <item>@string/nav_item_friends</item>
        <item>@string/nav_item_notifications</item>
    </string-array>
 
    <string name="title_messages">Messages</string>
    <string name="title_friends">Friends</string>
    <string name="title_home">Home</string>
</resources>  
```  

3.打开res->values->colors 添加以下颜色,如果你没有找到colors.xml文件，那么新建一个.
   
```xml 
colors.xml  
<?xml version="1.0" encoding="utf-8"?>
<resources>  

    <color name="colorPrimary">#F50057</color>
    <color name="colorPrimaryDark">#C51162</color>
    <color name="textColorPrimary">#FFFFFF</color>
    <color name="windowBackground">#FFFFFF</color>
    <color name="navigationBarColor">#000000</color>
    <color name="colorAccent">#FF80AB</color>
    
</resources>  
```  
4. 打开 dimens.xml文件，加入以下代码
 
  
```xml  
dimens.xml
<resources>  

    <!-- Default screen margins, per the Android Design guidelines. -->
    <dimen name="activity_horizontal_margin">16dp</dimen>
    <dimen name="activity_vertical_margin">16dp</dimen>
    <dimen name="nav_drawer_width">260dp</dimen> 
    
</resources>  
```

5.打开styles.xml文件加入以下代码，在这里定义的style对于所有的androidbanben都是通用的。  
  
```xml  
styles.xml
<resources>
 
    <style name="MyMaterialTheme" parent="MyMaterialTheme.Base">
 
    </style>
 
    <style name="MyMaterialTheme.Base" 				parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="android:windowNoTitle">true</item>
        <item name="windowActionBar">false</item>
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>
     
</resources>  
```

6.在res目录下，创建一个values-v21目录,并styles.xml
文件夹,这些style仅仅用于Android Lollipop

styles.xml  
```xml
<resources>
 
    <style name="MyMaterialTheme" parent="MyMaterialTheme.Base">
        <item name="android:windowContentTransitions">true</item>
        <item name="android:windowAllowEnterTransitionOverlap">true</item>
        <item   name="android:windowAllowReturnTransitionOverlap">true</item>
        <item name="android:windowSharedElementEnterTransition">@android:transition/move</item>
        <item name="android:windowSharedElementExitTransition">@android:transition/move</item>
    </style>
 
</resources>  
```

7.现在我们已经准备好Material Design style了， 为了使用这主题, 在AndroidManifest.xml文件中修改application theme属性如下：
  
```xml  
AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="androidhive.info.materialdesign" >
 
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/MyMaterialTheme" >
        <activity
            android:name=".activity.MainActivity"
            android:label="@string/app_name" >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
 
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
 
</manifest>  
```

现在如果你运行app，你能看到notification的颜色已经变成我们在style中设置的颜色.

![](http://cdn4.androidhive.info/wp-content/uploads/2015/04/android-material-design-notification-bar.png)

###3.1 添加工具栏 (Action Bar)

添加toolbar很简单,你要做的只是为toolbar另外创建一个layout,然后你想在哪里显示它，就在那个页面布局中include它

8.在layout目录下创建toolbar.xml, 在里面添加android.support.v7.widget.Toolbar，并设置宽高.代码如下：  

```xml	
toolbar.xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.v7.widget.Toolbar xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:local="http://schemas.android.com/apk/res-auto"
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:minHeight="?attr/actionBarSize"
    android:background="?attr/colorPrimary"
    local:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar"
    local:popupTheme="@style/ThemeOverlay.AppCompat.Light" />
```

9.打开你的main activiy的布局,添加如下代码: 

  
```xml	
activity_main.xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">
 
    <LinearLayout
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:orientation="vertical">
 
        <include
            android:id="@+id/toolbar"
            layout="@layout/toolbar" />
    </LinearLayout>
 
 
</RelativeLayout>  
```
![](http://cdn4.androidhive.info/wp-content/uploads/2015/04/android-material-design-toolbar1.png) 

现在让我尝试添加toolbard额标题，并启用它的行为。  

10.下载相关图片资源，然后导入到AS当中作为Image Asset.

11.导入Image asset步骤,右键res目录->new->Image Asset 之后显示弹窗，然后找到你已经下载好的图片,选择Action Bar 和 Tab Icons， 给资源命名为ic_search_action. 如下图 

![](http://cdn3.androidhive.info/wp-content/uploads/2015/04/android-studio-importing-image-asset.png) 

12.一旦图片导入了，打开menu_main.xml 添加seach menu item,代码如下：   


```xml	
menu_main.xml  
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    tools:context=".MainActivity">
 
    <item
        android:id="@+id/action_search"
        android:title="@string/action_search"
        android:orderInCategory="100"
        android:icon="@drawable/ic_action_search"
        app:showAsAction="ifRoom" />
 
    <item
        android:id="@+id/action_settings"
        android:title="@string/action_settings"
        android:orderInCategory="100"
        app:showAsAction="never" />
</menu>   
```

13.打开MainActivity.java做以下修改.

MainActivity从ACtionBarAcitiv继承

调用setSupportActionBar()来启用toolbar

复写onCreateOptionsMenu() 和 onOptionsItemSelected()来启动toolbar菜单子目录的行为。  
  
```java  
MainActivity.java
 
    private Toolbar mToolbar;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
 
        mToolbar = (Toolbar) findViewById(R.id.toolbar);
 
        setSupportActionBar(mToolbar);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
    }
 
 
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
 
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
 
        return super.onOptionsItemSelected(item);
    }
  
```
  
添加以上代码后，运行APP，你应该能够看到如下图所示的效果  

![](http://cdn1.androidhive.info/wp-content/uploads/2015/04/android-material-design-toolbar-action-items.png?)

###3.2添加Navigation Drawer  

添加Natigation Drawer的方式跟lollipop以前一样,但我们使用RecyclerView来实现Menu Items.  

14.在java文件下创建三个包，分别命名为activity,adapter,model,把MainActivity移到activity包种，这样整个项目看起来就更有组织性。 

15.在build.gradle中添加以下依赖库  

  
```gradle  
build.gradle
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.android.support:appcompat-v7:22.0.0'
    compile 'com.android.support:recyclerview-v7:21.0.+'
}  
```  

16.在model包下添加NavDrawerItem.java文件作为menuItem,代码如下：   
  
```java  
NavDrawerItem.java
public class NavDrawerItem {
    private boolean showNotify;
    private String title;
 
 
    public NavDrawerItem() {
 
    }
 
    public NavDrawerItem(boolean showNotify, String title) {
        this.showNotify = showNotify;
        this.title = title;
    }
 
    public boolean isShowNotify() {
        return showNotify;
    }
 
    public void setShowNotify(boolean showNotify) {
        this.showNotify = showNotify;
    }
 
    public String getTitle() {
        return title;
    }
 
    public void setTitle(String title) {
        this.title = title;
    }
}  
```

17.添加nav_drawer_row.xml布局文件,代码如下：  

```xml  
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:clickable="true">
 
    <TextView
        android:id="@+id/title"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:paddingLeft="30dp"
        android:paddingTop="10dp"
        android:paddingBottom="10dp"
        android:textSize="15dp"
        android:textStyle="bold" />
 
</RelativeLayout>  
```

18.下载这个图片,这图片用在导航栏的头部  

![](http://api.androidhive.info/images/ic_profile.pn)
  
19.创建另一个布局文件fragment_navigation_drawer.xml,如下代码:  
  
```xml  
fragment_navigation_drawer.xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@android:color/white">
 
 
    <RelativeLayout
        android:id="@+id/nav_header_container"
        android:layout_width="match_parent"
        android:layout_height="140dp"
        android:layout_alignParentTop="true"
        android:background="@color/colorPrimary">
 
        <ImageView
            android:layout_width="70dp"
            android:layout_height="70dp"
            android:src="@drawable/ic_profile"
            android:scaleType="fitCenter"
            android:layout_centerInParent="true" />
 
    </RelativeLayout>
 
 
    <android.support.v7.widget.RecyclerView
        android:id="@+id/drawerList"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@id/nav_header_container"
        android:layout_marginTop="15dp" />
 
 
</RelativeLayout>
```

20.由于RecyclerView是自定义的，我们需要创建一个Adapter来渲染自定的布局, 因此创建NavigationDrawerAdapter.java文件  

```java 
public class NavigationDrawerAdapter extends RecyclerView.Adapter<NavigationDrawerAdapter.MyViewHolder> {
    List<NavDrawerItem> data = Collections.emptyList();
    private LayoutInflater inflater;
    private Context context;
 
    public NavigationDrawerAdapter(Context context, List<NavDrawerItem> data) {
        this.context = context;
        inflater = LayoutInflater.from(context);
        this.data = data;
    }
 
    public void delete(int position) {
        data.remove(position);
        notifyItemRemoved(position);
    }
 
    @Override
    public MyViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = inflater.inflate(R.layout.nav_drawer_row, parent, false);
        MyViewHolder holder = new MyViewHolder(view);
        return holder;
    }
 
    @Override
    public void onBindViewHolder(MyViewHolder holder, int position) {
        NavDrawerItem current = data.get(position);
        holder.title.setText(current.getTitle());
    }
 
    @Override
    public int getItemCount() {
        return data.size();
    }
 
    class MyViewHolder extends RecyclerView.ViewHolder {
        TextView title;
 
        public MyViewHolder(View itemView) {
            super(itemView);
            title = (TextView) itemView.findViewById(R.id.title);
        }
    }

```

21.在adapter包下创建FragmentDrawer.java，代码如下： 

```java  
FragmentDrawer.java  
public class FragmentDrawer extends Fragment {
 
    private static String TAG = FragmentDrawer.class.getSimpleName();
 
    private RecyclerView recyclerView;
    private ActionBarDrawerToggle mDrawerToggle;
    private DrawerLayout mDrawerLayout;
    private NavigationDrawerAdapter adapter;
    private View containerView;
    private static String[] titles = null;
    private FragmentDrawerListener drawerListener;
 
    public FragmentDrawer() {
 
    }
 
    public void setDrawerListener(FragmentDrawerListener listener) {
        this.drawerListener = listener;
    }
 
    public static List<NavDrawerItem> getData() {
        List<NavDrawerItem> data = new ArrayList<>();
 
 
        // preparing navigation drawer items
        for (int i = 0; i < titles.length; i++) {
            NavDrawerItem navItem = new NavDrawerItem();
            navItem.setTitle(titles[i]);
            data.add(navItem);
        }
        return data;
    }
 
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
 
        // drawer labels
        titles = getActivity().getResources().getStringArray(R.array.nav_drawer_labels);
    }
 
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflating view layout
        View layout = inflater.inflate(R.layout.fragment_navigation_drawer, container, false);
        recyclerView = (RecyclerView) layout.findViewById(R.id.drawerList);
 
        adapter = new NavigationDrawerAdapter(getActivity(), getData());
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        recyclerView.addOnItemTouchListener(new RecyclerTouchListener(getActivity(), recyclerView, new ClickListener() {
            @Override
            public void onClick(View view, int position) {
                drawerListener.onDrawerItemSelected(view, position);
                mDrawerLayout.closeDrawer(containerView);
            }
 
            @Override
            public void onLongClick(View view, int position) {
 
            }
        }));
 
        return layout;
    }
 
 
    public void setUp(int fragmentId, DrawerLayout drawerLayout, final Toolbar toolbar) {
        containerView = getActivity().findViewById(fragmentId);
        mDrawerLayout = drawerLayout;
        mDrawerToggle = new ActionBarDrawerToggle(getActivity(), drawerLayout, toolbar, R.string.drawer_open, R.string.drawer_close) {
            @Override
            public void onDrawerOpened(View drawerView) {
                super.onDrawerOpened(drawerView);
                getActivity().invalidateOptionsMenu();
            }
 
            @Override
            public void onDrawerClosed(View drawerView) {
                super.onDrawerClosed(drawerView);
                getActivity().invalidateOptionsMenu();
            }
 
            @Override
            public void onDrawerSlide(View drawerView, float slideOffset) {
                super.onDrawerSlide(drawerView, slideOffset);
                toolbar.setAlpha(1 - slideOffset / 2);
            }
        };
 
        mDrawerLayout.setDrawerListener(mDrawerToggle);
        mDrawerLayout.post(new Runnable() {
            @Override
            public void run() {
                mDrawerToggle.syncState();
            }
        });
 
    }
 
    public static interface ClickListener {
        public void onClick(View view, int position);
 
        public void onLongClick(View view, int position);
    }
 
    static class RecyclerTouchListener implements RecyclerView.OnItemTouchListener {
 
        private GestureDetector gestureDetector;
        private ClickListener clickListener;
 
        public RecyclerTouchListener(Context context, final RecyclerView recyclerView, final ClickListener clickListener) {
            this.clickListener = clickListener;
            gestureDetector = new GestureDetector(context, new GestureDetector.SimpleOnGestureListener() {
                @Override
                public boolean onSingleTapUp(MotionEvent e) {
                    return true;
                }
 
                @Override
                public void onLongPress(MotionEvent e) {
                    View child = recyclerView.findChildViewUnder(e.getX(), e.getY());
                    if (child != null && clickListener != null) {
                        clickListener.onLongClick(child, recyclerView.getChildPosition(child));
                    }
                }
            });
        }
 
        @Override
        public boolean onInterceptTouchEvent(RecyclerView rv, MotionEvent e) {
 
            View child = rv.findChildViewUnder(e.getX(), e.getY());
            if (child != null && clickListener != null && gestureDetector.onTouchEvent(e)) {
                clickListener.onClick(child, rv.getChildPosition(child));
            }
            return false;
        }
 
        @Override
        public void onTouchEvent(RecyclerView rv, MotionEvent e) {
        }
    }
 
    public interface FragmentDrawerListener {
        public void onDrawerItemSelected(View view, int position);
    }
}
```

22.最后在activity_main.xml中添加DrawerLayout，如下代码:  

```xml  
 <android.support.v4.widget.DrawerLayout
 android:id="@+id/drawer_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
 
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">
 
        <LinearLayout
            android:id="@+id/container_toolbar"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical">
 
            <include
                android:id="@+id/toolbar"
                layout="@layout/toolbar" />
        </LinearLayout>
 
        <FrameLayout
            android:id="@+id/container_body"
            android:layout_width="fill_parent"
            android:layout_height="0dp"
            android:layout_weight="1" />
 
 
    </LinearLayout>
 
 
    <fragment
        android:id="@+id/fragment_navigation_drawer"
        android:name="androidhive.info.materialdesign.activity.FragmentDrawer"
        android:layout_width="@dimen/nav_drawer_width"
        android:layout_height="match_parent"
        android:layout_gravity="start"
        app:layout="@layout/fragment_navigation_drawer"
        tools:layout="@layout/fragment_navigation_drawer" />
        
    <android.support.v4.widget.DrawerLayout>  
```
 
现在我们已经完成了所有的的布局和jav文件,接下来我们要实现navigation draw而得功能.  
   
23.打开MainActivity,作如下修改:

MainActivity实现FragmentDrawer.FragmentDrawerListener接口，复写onDrawerItemSelected()
  
创建FragmentDrawer实例，并设置其选择监听事件,如下代码:  

```java  
public class MainActivity extends ActionBarActivity implements FragmentDrawer.FragmentDrawerListener {
 
    private Toolbar mToolbar;
    private FragmentDrawer drawerFragment;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
 
        mToolbar = (Toolbar) findViewById(R.id.toolbar);
 
        setSupportActionBar(mToolbar);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
 
        drawerFragment = (FragmentDrawer)
                getSupportFragmentManager().findFragmentById(R.id.fragment_navigation_drawer);
        drawerFragment.setUp(R.id.fragment_navigation_drawer, (DrawerLayout) findViewById(R.id.drawer_layout), mToolbar);
        drawerFragment.setDrawerListener(this);
    }
 
 
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
 
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
 
        return super.onOptionsItemSelected(item);
    }
 
    @Override
    public void onDrawerItemSelected(View view, int position) {
 
    }
}

```
    
    
现在运行APP能看到以下效果.  

![](http://cdn1.androidhive.info/wp-content/uploads/2015/04/androd-material-design-navigation-drawer.png)

###3.3实现Navigation Drawer的选择  

虽然navigation drawer已经能够工作了，但是MENU的子选项无法工作，这是因为我们还没有处理RecyclerView item是的点击监听。   
  
由于我们有三子菜单(Home,Friends&Mesages), 因此我们需要创建三个独立的Fragment  

24.创建fragment_home布局文件,代码如下：  

```xml  
fragment_home.xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context="androidhive.info.materialdesign.activity.HomeFragment">
 
 
    <TextView
        android:id="@+id/label"
        android:layout_alignParentTop="true"
        android:layout_marginTop="100dp"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:gravity="center_horizontal"
        android:textSize="45dp"
        android:text="HOME"
        android:textStyle="bold"/>
 
    <TextView
        android:layout_below="@id/label"
        android:layout_centerInParent="true"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:textSize="12dp"
        android:layout_marginTop="10dp"
        android:gravity="center_horizontal"
        android:text="Edit fragment_home.xml to change the appearance" />
 
</RelativeLayout>
```  

25.在activity包下，创建HomeFragment.java文件，代码如下: 
  
```java  
public class HomeFragment extends Fragment {
 
    public HomeFragment() {
        // Required empty public constructor
    }
 
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
 
    }
 
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_home, container, false);
 
 
        // Inflate the layout for this fragment
        return rootView;
    }
 
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
    }
 
    @Override
    public void onDetach() {
        super.onDetach();
    }
}
```    
26.创建另外两个FRAGMENT，跟上面一样  

27.做如下修改.代码如下：

displayView方法用来显示menu item选中的页面.这个方法被onDrawerItemSelected()调用.  

```java  
public class MainActivity extends ActionBarActivity implements FragmentDrawer.FragmentDrawerListener {
 
    private static String TAG = MainActivity.class.getSimpleName();
 
    private Toolbar mToolbar;
    private FragmentDrawer drawerFragment;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
 
        mToolbar = (Toolbar) findViewById(R.id.toolbar);
 
        setSupportActionBar(mToolbar);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
 
        drawerFragment = (FragmentDrawer)
                getSupportFragmentManager().findFragmentById(R.id.fragment_navigation_drawer);
        drawerFragment.setUp(R.id.fragment_navigation_drawer, (DrawerLayout) findViewById(R.id.drawer_layout), mToolbar);
        drawerFragment.setDrawerListener(this);
 
        // display the first navigation drawer view on app launch
        displayView(0);
    }
 
 
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
 
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
 
        if(id == R.id.action_search){
            Toast.makeText(getApplicationContext(), "Search action is selected!", Toast.LENGTH_SHORT).show();
            return true;
        }
 
        return super.onOptionsItemSelected(item);
    }
 
    @Override
    public void onDrawerItemSelected(View view, int position) {
            displayView(position);
    }
 
    private void displayView(int position) {
        Fragment fragment = null;
        String title = getString(R.string.app_name);
        switch (position) {
            case 0:
                fragment = new HomeFragment();
                title = getString(R.string.title_home);
                break;
            case 1:
                fragment = new FriendsFragment();
                title = getString(R.string.title_friends);
                break;
            case 2:
                fragment = new MessagesFragment();
                title = getString(R.string.title_messages);
                break;
            default:
                break;
        }
 
        if (fragment != null) {
            FragmentManager fragmentManager = getSupportFragmentManager();
            FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
            fragmentTransaction.replace(R.id.container_body, fragment);
            fragmentTransaction.commit();
 
            // set the toolbar title
            getSupportActionBar().setTitle(title);
        }
    }
}
```    

现在运行app,你能够选择menu的子菜单了。如下效果。

![](http://cdn1.androidhive.info/wp-content/uploads/2015/04/android-material-design-navigation-drawer-1.png)

![](http://cdn1.androidhive.info/wp-content/uploads/2015/04/android-material-design-navigation-drawer-2.png)

![](http://cdn1.androidhive.info/wp-content/uploads/2015/04/android-material-design-navigation-drawer-3.png)
