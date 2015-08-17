#Android主题动态切换开源库Prism基本原理(2)

> * 原文链接 : [Prism Fundamentals Part 2](https://blog.stylingandroid.com/prism-fundamentals-part-2/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
* 译者 : [Desmond1121](https://github.com/desmond1121)  
* 校对者: 
* 状态 :  未校对

Previously we looked at wiring up some UI components to a Prism instance so that calling setColour(int colour) on the Prism instance resulted in colour changes for all of the components that we’d wired up. So while using a combination of Setters and Filters wired together in a Prism instance simplified things and removed a lot of boilerplate code, it didn’t really do anything that we couldn’t do fairly easily. However when we add a Trigger in to the equation things become much more interesting!

在之前的一章中我介绍了用`Prism`实例将UI组件链接起来并通过调用`setColour(int colour)`切换颜色主题。那么你也可以看到，使用`Setter`和`Filter`可以让事情（切换主题）变得多么简单，省去了很多冗杂的代码。现在我们来看看加入`Trigger`以后会发生什么有趣的事情！

First we need to add prism-viewpager as a dependency to our project:

首先我们在工程中添加`prism-viewpager`的依赖库，`build.gradle`示例如下：

	apply plugin: 'com.android.application'

	android {
	    compileSdkVersion 22
	    buildToolsVersion "23.0.0 rc3"
	
	    defaultConfig {
	        applicationId "com.stylingandroid.prism.sample.viewpager"
	        minSdkVersion 7
	        targetSdkVersion 22
	        versionCode 1
	        versionName "1.0"
	    }
	    buildTypes {
	        release {
	            minifyEnabled false
	            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
	        }
	    }
	}
	
	dependencies {
	    compile 'com.android.support:appcompat-v7:22.2.0'
	    compile 'com.android.support:design:22.2.0'
	    compile 'com.stylingandroid.prism:prism:1.0.1'
	    compile 'com.stylingandroid.prism:prism-viewpager:1.0.1'
	}
	
A Trigger sits in front of the Prism instance and is essentially what triggers the colour changes. We’ll begin by looking at ViewPagerTrigger which will trigger colour changes in response to user interactions with a ViewPager. In order for this to happen the Adapter for the ViewPager will need to provide colour information for each position and so much implement the ColourProvider interface (or ColorProvider, if you prefer, and don’t mind the tiny performance hit that incurs):

Trigger是Prism触发颜色主题变换时必须的组件。我们首先来看`ViewPagerTrigger`搭配`ViewPager`时是怎么随着用户输入而触发颜色主题变换的。为了实现颜色变换，`ViewPager`的`Adapter`需要为它的每一个页面位置提供颜色属性，`ColourProvider`接口提供了这个功能(或者是`ColorProvider`，如果你不介意使用它带来的些许性能损失的话)。

	/* ColourProvider.java */
	public interface ColourProvider {
	    @ColorInt int getColour(int position);
	    int getCount();
	}
	
	/* ColorProvider.java */
	public interface ColorProvider {
	    @ColorInt int getColor(int position);
	    int getCount();
	}

For anyone who has ever used PagerTitleStrip or the new design library TabLayout will be familiar with the concept of providing a title for each pager position, and this interface does precisely the same thing only it provides an RGB colour value instead of a title String. You don’t need to worry about implementing getCount() if you’re extending an Adapter as this is already built in to the Adapter. All that’s required is to implement this in to your Adapter:

如果你使用过`PagerTitleStrip`或者新的Android设计库中的`TabLayout`的话，你不会对为`ViewPager`的每个页面提供标题这件事感到陌生。而使用`ColourProvider`接口仅仅就是将 **为每个页面提供标题**变成了 **为每个页面提供颜色值**而已。当继承`Adapter`的时候你不需要提供`getCount()`方法，因为这个方法在`Adapter`中已经定义了。你所需要做的就是像下面这些代码一样实现你的`Adapter`：

	public class RainbowPagerAdapter extends FragmentPagerAdapter implements ColourProvider {
	    
	    private static final Rainbow[] COLOURS = {
	            Rainbow.Red, Rainbow.Orange, Rainbow.Yellow, Rainbow.Green,
	            Rainbow.Blue, Rainbow.Indigo, Rainbow.Violet
	    };
	
	    private final Context context;
	
	    public RainbowPagerAdapter(Context context, FragmentManager fragmentManager) {
	        super(fragmentManager);
	        this.context = context;
	    }
	
	    @Override
	    public Fragment getItem(int position) {
	        Rainbow colour = COLOURS[position];
	        return ColourFragment.newInstance(context, getPageTitle(position), colour.getColour());
	    }
	
	    @Override
	    public void destroyItem(ViewGroup container, int position, Object object) {
	        FragmentManager manager = ((Fragment) object).getFragmentManager();
	        FragmentTransaction trans = manager.beginTransaction();
	        trans.remove((Fragment) object);
	        trans.commit();
	        super.destroyItem(container, position, object);
	    }
	
	    @Override
	    public int getCount() {
	        return COLOURS.length;
	    }
	
	    @Override
	    public CharSequence getPageTitle(int position) {
	        return COLOURS[position].name();
	    }
	    
		/* 重写ColourProvider中的方法 */
	    @Override
	    public int getColour(int position) {
	        return COLOURS[position].getColour();
	    }
		
		/* 提供颜色值的枚举 */
	    private enum Rainbow {
	        Red(Color.rgb(0xFF, 0x00, 0x00)),
	        Orange(Color.rgb(0xFF, 0x7F, 0x00)),
	        Yellow(Color.rgb(0xCF, 0xCF, 0x00)),
	        Green(Color.rgb(0x00, 0xAF, 0x00)),
	        Blue(Color.rgb(0x00, 0x00, 0xFF)),
	        Indigo(Color.rgb(0x4B, 0x00, 0x82)),
	        Violet(Color.rgb(0x7F, 0x00, 0xFF));
	
	        private final int colour;
	
	        Rainbow(int colour) {
	            this.colour = colour;
	        }
	
	        public int getColour() {
	            return colour;
	        }
	    }
	}

So now that we have an Adapter which implements ColourProvider we can hook this up to the Prism ViewPagerTrigger:

当我们拥有一个实现`ColourProvider`接口的`Adapter`后我们就可以将它和Prism的`ViewPagerTrigger`一起使用了：

	public class MainActivity extends AppCompatActivity {
	    private static final float TINT_FACTOR_50_PERCENT = 0.5f;
	    private DrawerLayout drawerLayout;
	    private View navHeader;
	    private AppBarLayout appBar;
	    private Toolbar toolbar;
	    private TabLayout tabLayout;
	    private ViewPager viewPager;
	    private FloatingActionButton fab;
	
	    private Prism prism = null;
	
	    @Override
	    protected void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        setContentView(R.layout.activity_main);
			
			/* 获取View实例 */
	        drawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
	        navHeader = findViewById(R.id.nav_header);
	        appBar = (AppBarLayout) findViewById(R.id.app_bar);
	        toolbar = (Toolbar) findViewById(R.id.toolbar);
	        tabLayout = (TabLayout) findViewById(R.id.tab_layout);
	        viewPager = (ViewPager) findViewById(R.id.viewpager);
	        fab = (FloatingActionButton) findViewById(R.id.fab);
	
	        setupToolbar();
	        setupViewPager();
	    }
	
	    @Override
	    protected void onDestroy() {
	        if (prism != null) {
	            prism.destroy();
	        }
	        super.onDestroy();
	    }
	
	    private void setupToolbar() {
	        setSupportActionBar(toolbar);
	        ActionBar actionBar = getSupportActionBar();
	        if (actionBar != null) {
	            actionBar.setHomeAsUpIndicator(R.drawable.ic_menu);
	            actionBar.setDisplayHomeAsUpEnabled(true);
	            actionBar.setTitle(R.string.app_title);
	        }
	    }
	
	    @Override
	    public boolean onOptionsItemSelected(MenuItem item) {
	        switch (item.getItemId()) {
	            case android.R.id.home:
	                drawerLayout.openDrawer(GravityCompat.START);
	                return true;
	            default:
	                return super.onOptionsItemSelected(item);
	        }
	    }
	
	    private void setupViewPager() {
	        RainbowPagerAdapter adapter = new RainbowPagerAdapter(this, getSupportFragmentManager());
	        viewPager.setAdapter(adapter);
	        Filter tint = new TintFilter(TINT_FACTOR_50_PERCENT);
	        Trigger trigger = ViewPagerTrigger.newInstance(viewPager, adapter);
	        prism = Prism.Builder.newInstance()
	                .add(trigger)
	                .background(appBar)
	                .background(getWindow())
	                .background(navHeader)
	                .background(fab, tint)
	                .colour(viewPager, tint)
	                .build();
	        tabLayout.setupWithViewPager(viewPager);
	        viewPager.setCurrentItem(0);
	    }
	}

In setupViewPager() we first create an instance of our RainbowPagerAdapter and set this on the ViewPager. Next we create the a TintFilter which we’ll use to provide a lighter background for the FAB, and then create a Trigger instance based on the ViewPager and the Adapter.

在`setupViewPager()`中我们首先创建一个`RainbowPagerAdapter`并应用到`ViewPager`中。之后新建了一个`TintFilter`，它能够让我们的`FloatingActionButton`的颜色更加亮一点。然后新建一个与`ViewPager`和`Adapter`实例相关联的Trigger。

Now we construct our Prism instance in exactly the same way as we did before. The only differences are that we’re hooking up a couple more components, and we add the Trigger that we just created. You may notice that we’re setting the colour of the ViewPager itself. This will actually change the ViewPager over-scroll glow colour. (This is actually quite tricky because it is done differently on different OS levels, but Prism takes care of all of this internally).

在做好上述准备工作之后，我们开始建立`Prism`实例。与上次唯一不同的是我们为`Prism`绑定了更多组件，以及添加了刚才新建的Trigger。你可能注意到我们为`ViewPager`实例直接设置了颜色，实际上它的作用是设置当`ViewPager`滑到两边极限时的“溢出颜色”（这个函数很巧妙，因为在不同的系统版本中处理`ViewPager`“溢出颜色”的手段不一样，但Prism会在内部就帮你处理好这些逻辑！）。

Then we wire the TabLayout up to the ViewPager (this is required by TabLayout and not Prism), and finally set the current selection of the ViewPager to the first item.

之后我们将`TabLayout`与`ViewPager`绑定到一起（这是`TabLayout`设计中要求的，而不是`Prism`的逻辑需要），之后将`ViewPager`的初始页面设置成了第一页。

That is it. The UI will now change colour in response to the user scrolling between tabs:

简简单单的几行代码就能够让我们在滑动页面的时候改变主题颜色，看一下Demo吧：

![Demo1](http://img.blog.csdn.net/20150817115052504)

The more observant will notice that the colour changes do not jump – the transitions are actually animated smoothly as the ViewPager animates between individual pages. The colour transitions will even follow the user’s dragging:

可能有细腻的程序员会发现颜色转换并不是跳跃式的，它会有一个渐变的过程，而且渐变过程是跟随着你的拖拽过程的！

![Demo2](http://img.blog.csdn.net/20150817115119108)

这里面所有的例子都会在[源码Github](https://github.com/StylingAndroid/Prism)中的[示例代码](https://github.com/StylingAndroid/Prism/tree/master/sample-veiwpager) 中看到。

