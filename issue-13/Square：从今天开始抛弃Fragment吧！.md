Square：从今天开始抛弃Fragment吧！
---

> * 原文链接 : [Advocating Against Android Fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html)
* 原文作者 : [Pierre-Yves Ricau](http://twitter.com/Piwai)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Belial](www.belial.me)
* 状态 :  完成

最近我在 Droidcon Paris 上进行了[一个技术相关的演讲](http://fr.droidcon.com/2014/agenda/detail?title=D%C3%A9fragmentez+vos+apps+avec+Mortar+%21)，我在这次演讲中给大家展示了 Square 使用 Fragment 进行开发时遇到的种种问题，以及其他 Android 开发者是怎么避免在项目中使用 Fragment 的。

在 2011 年那会，由于下面的原因我们决定使用 Fragment：

- 在那会，虽然我们很想让应用能在平板设备上被使用，但我们确实没能为平板提供平台支持。而 Fragment 能帮助我们完成这项愿望，建立响应式 UI 界面。

- Fragment 是视图控制器，它们能够将一大块耦合严重的业务逻辑模块解耦，并使得解耦后的业务逻辑能够被测试。

- Fragment 的 API 能够进行回退栈管理（例如，它能反射某个 Activity 内 Activity 栈的具体操作）

- 因为 Fragment 处于视图层的顶层，而为 View 设置动画并不麻烦，使得 Fragment 为设置页面切换的过渡效果提供了更好的支持。

- Google 建议我们使用 Fragment，而我们作为开发者都想让自己的代码符合标准。

在 2011年之后，我们在为 Square 进行开发的过程中发现了比使用 Fragment 更好的方法。

#关于 Fragment 你不知道的事

##The lolcycle

在 Android 中，Context 就像一个[上帝对象](http://en.wikipedia.org/wiki/God_object)，因为在 Context 类中涵盖了太多 Android 系统的信息和相关的操作，使得 Context 在 Android 系统中相当于一个全知全能的上帝，而 Activity 就是为 Context 添加了生命周期的子类。不过让上帝具有生命周期还是有些讽刺的。虽然 Fragment 不是上帝对象，但 Fragment 为了能够完成 Activity 中能完成的各种操作，使 Fragment 自身的生命周期变得异常复杂。

Steve Pomeroy 做了一张[ Fragment 的完整生命周期图](https://github.com/xxv/android-lifecycle)，我相信任谁看到这张图都不会好受：

![](https://corner.squareup.com/images/no-fragments/lifecycle.png)

这张图由 Steve Pomeroy 完成，图中移除了 Activity 的生命周期，分享这张图需要获得 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可。

整个 Fragment 的生命周期让你很头疼要怎样使用这些回调方法，它们是同步调用的呢，还是只是一次性全部调用呢，还是其它情况……？

##难于调试

当你的应用出现 Bug，你得用调试工具一步一步地执行代码才能知道到底发生了什么，虽说一般情况下这样做 Bug 都能解决，但如果你在调试的时候发现 Bug 和 FragmentManagerImpl 类存在某种联系，那么我可要好好恭喜你即将中大奖了！

因为要跟踪 FragmentManagerImpl 类内代码的执行顺序，并进行调试是很困难的，这也使得修复应用中相关的 Bug 也变得异常困难：

```java
switch (f.mState) {
    case Fragment.INITIALIZING:
        if (f.mSavedFragmentState != null) {
            f.mSavedViewState = f.mSavedFragmentState.getSparseParcelableArray(
                    FragmentManagerImpl.VIEW_STATE_TAG);
            f.mTarget = getFragment(f.mSavedFragmentState,
                    FragmentManagerImpl.TARGET_STATE_TAG);
            if (f.mTarget != null) {
                f.mTargetRequestCode = f.mSavedFragmentState.getInt(
                        FragmentManagerImpl.TARGET_REQUEST_CODE_STATE_TAG, 0);
            }
            f.mUserVisibleHint = f.mSavedFragmentState.getBoolean(
                    FragmentManagerImpl.USER_VISIBLE_HINT_TAG, true);
            if (!f.mUserVisibleHint) {
                f.mDeferStart = true;
                if (newState > Fragment.STOPPED) {
                    newState = Fragment.STOPPED;
                }
            }
        }
// ...
}
```

如果你曾经需要解决应用旋转后产生一个与旋转前 UI 相同（方向发生变化）的独立的 Fragment 的需求，我想你应该懂我在说什么。（别给我提嵌套使用的 Fragment！）

我想下面这张图很好地诠释了这类代码给程序员带来的伤害（由于版权问题我得放出这张图的出处哈：[this cartoon](http://www.osnews.com/story/19266/WTFs_m)）：

![](https://corner.squareup.com/images/no-fragments/code-quality.png)

在多年的深度分析中我得出结论：操蛋程度/调试耗费的时间 = 2^m，m 为 Fragment 的个数。

##Fragment 是视图控制器？想太多

因为 Fragment 需要创建、绑定和配置 View，它们包含了许多与 View 关联的结点，这就意味着 View 类代码中的业务逻辑并没有真正地被解耦，正是这个原因使得我们要为 Fragment 实现测试单元将会变得很困难。

##Fragment transactions

Fragment 的 transaction 允许你执行一系列的 Fragment 操作，但不幸的是，提交 transaction 是异步操作，并且在 UI 线程的 Handler 队列的队尾被提交。这会在接收多个点击事件或配置发生改变时让你的 App 处在未知的状态。

```java
class BackStackRecord extends FragmentTransaction {
    int commitInternal(boolean allowStateLoss) {
        if (mCommitted)
            throw new IllegalStateException("commit already called");
        mCommitted = true;
        if (mAddToBackStack) {
            mIndex = mManager.allocBackStackIndex(this);
        } else {
            mIndex = -1;
        }
        mManager.enqueueAction(this, allowStateLoss);
        return mIndex;
    }
}
```

##创建 Fragment 可能带来的问题

Fragment 的实例能够通过 Fragment Manager 创建，例如下面的代码看起来没有什么问题：

```java
DialogFragment dialogFragment = new DialogFragment() {
  @Override public Dialog onCreateDialog(Bundle savedInstanceState) { ... }
};
dialogFragment.show(fragmentManager, tag);
```

然而，当我们需要存储 Activity 实例的状态时，Fragment Manager 可能会通过反射机制重新创建该 Fragment 的实例，又因为这是一个匿名内部类，该类有一个隐藏的构造器的参数正是外部类的引用，如果大家有看过[这篇博文](http://blog.csdn.net/u012403246/article/details/45666369)的话就会知道，拥有外部引用可能会带来内存泄漏的问题。

```java
android.support.v4.app.Fragment$InstantiationException:
    Unable to instantiate fragment com.squareup.MyActivity$1:
    make sure class name exists, is public, and has an empty
    constructor that is public
```

##Fragment 教给我们的思想

尽管 Fragment 有着上面提到的缺点，但也是 Fragment 教给我们许多代码架构的思想：

- 独立的 Activity 接口：实际上我们并不需要为每一个页面创建一个 Activity，我们大可以将应用切分成许多解耦的视图组件，按照我们的实际需求把它们组装成我们想要的界面。这样做也能简化生命周期和动画设置，因为我们还能将视图组件切分为 view 组件和控制器组件。

- 回退栈不是 Activity 的特有概念，也就意味着你能在 Activity 内部实现回退栈。

- 不需要添加新的 API，我们需要的只是 Activity，View 和 LayoutInflater。

#响应式 UI：Fragment VS Custom View

##Fragment

我们不妨先来看看一个 Fragment 的[范例](http://developer.android.com/shareables/training/FragmentBasics.zip)，界面中显示了一个 list。

HeadlinesFragment 就是显示 List 的简单 Fragment：

```java
public class HeadlinesFragment extends ListFragment {
  OnHeadlineSelectedListener mCallback;

  public interface OnHeadlineSelectedListener {
    void onArticleSelected(int position);
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setListAdapter(
        new ArrayAdapter<String>(getActivity(),
            R.layout.fragment_list,
            Ipsum.Headlines));
  }

  @Override
  public void onAttach(Activity activity) {
    super.onAttach(activity);
    mCallback = (OnHeadlineSelectedListener) activity;
  }

  @Override
  public void onListItemClick(ListView l, View v, int position, long id) {
    mCallback.onArticleSelected(position);
    getListView().setItemChecked(position, true);
  }
}
```

现在有趣的事情来了：ListFragmentActivity 必须控制 list 是否处于同一个页面中。

```java
public class ListFragmentActivity extends Activity
    implements HeadlinesFragment.OnHeadlineSelectedListener {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.news_articles);
    if (findViewById(R.id.fragment_container) != null) {
      if (savedInstanceState != null) {
        return;
      }
      HeadlinesFragment firstFragment = new HeadlinesFragment();
      firstFragment.setArguments(getIntent().getExtras());
      getFragmentManager()
          .beginTransaction()
          .add(R.id.fragment_container, firstFragment)
          .commit();
    }
  }
  public void onArticleSelected(int position) {
    ArticleFragment articleFrag =
        (ArticleFragment) getFragmentManager()
            .findFragmentById(R.id.article_fragment);
    if (articleFrag != null) {
      articleFrag.updateArticleView(position);
    } else {
      ArticleFragment newFragment = new ArticleFragment();
      Bundle args = new Bundle();
      args.putInt(ArticleFragment.ARG_POSITION, position);
      newFragment.setArguments(args);
      getFragmentManager()
          .beginTransaction()
          .replace(R.id.fragment_container, newFragment)
          .addToBackStack(null)
          .commit();
    }
  }
}
```

##自定义 View

我们不妨重新实现一个简化版的只使用了 View 的代码

首先，我们会引入一个叫作“容器”的概念，“容器”的作用是帮助我们展示一项内容并处理后退操作

```java
public interface Container {
  void showItem(String item);

  boolean onBackPressed();
}
```

Acitivity 将假设始终存在容器，并且几乎不会将业务交给容器处理。

```java
public class MainActivity extends Activity {
  private Container container;

  @Override protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main_activity);
    container = (Container) findViewById(R.id.container);
  }

  public Container getContainer() {
    return container;
  }

  @Override public void onBackPressed() {
    boolean handled = container.onBackPressed();
    if (!handled) {
      finish();
    }
  }
}
```

要显示的 List 也只是个平凡的 List。

```java
public class ItemListView extends ListView {
  public ItemListView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override protected void onFinishInflate() {
    super.onFinishInflate();
    final MyListAdapter adapter = new MyListAdapter();
    setAdapter(adapter);
    setOnItemClickListener(new OnItemClickListener() {
      @Override public void onItemClick(AdapterView<?> parent, View view,
            int position, long id) {
        String item = adapter.getItem(position);
        MainActivity activity = (MainActivity) getContext();
        Container container = activity.getContainer();
        container.showItem(item);
      }
    });
  }
}
```

这样做的好处是：能够基于资源文件夹在不同的 XML 布局文件

`res/layout/main_activity.xml`

```xml
<com.squareup.view.SinglePaneContainer
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:id="@+id/container"
    >
  <com.squareup.view.ItemListView
      android:layout_width="match_parent"
      android:layout_height="match_parent"
      />
</com.squareup.view.SinglePaneContainer>
```

`res/layout-land/main_activity.xml`

```xml
<com.squareup.view.DualPaneContainer
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal"
    android:id="@+id/container"
    >
  <com.squareup.view.ItemListView
      android:layout_width="0dp"
      android:layout_height="match_parent"
      android:layout_weight="0.2"
      />
  <include layout="@layout/detail"
      android:layout_width="0dp"
      android:layout_height="match_parent"
      android:layout_weight="0.8"
      />
</com.squareup.view.DualPaneContainer>
```

下面是这些容器类的简单实现：

```java
public class DualPaneContainer extends LinearLayout implements Container {
  private MyDetailView detailView;

  public DualPaneContainer(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override protected void onFinishInflate() {
    super.onFinishInflate();
    detailView = (MyDetailView) getChildAt(1);
  }

  public boolean onBackPressed() {
    return false;
  }

  @Override public void showItem(String item) {
    detailView.setItem(item);
  }
}
```

```java
public class SinglePaneContainer extends FrameLayout implements Container {
  private ItemListView listView;

  public SinglePaneContainer(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override protected void onFinishInflate() {
    super.onFinishInflate();
    listView = (ItemListView) getChildAt(0);
  }

  public boolean onBackPressed() {
    if (!listViewAttached()) {
      removeViewAt(0);
      addView(listView);
      return true;
    }
    return false;
  }

  @Override public void showItem(String item) {
    if (listViewAttached()) {
      removeViewAt(0);
      View.inflate(getContext(), R.layout.detail, this);
    }
    MyDetailView detailView = (MyDetailView) getChildAt(0);
    detailView.setItem(item);
  }

  private boolean listViewAttached() {
    return listView.getParent() != null;
  }
}
```

不难想象：将容器类抽象，并用这种的方式开发 App，不但不需要 Fragment，还能架构出容易理解的代码。

##View 和 Presenter

自定义 View 在应用中非常有用，但我们希望将业务逻辑从 View 中剥离，转交给特定的控制器处理，也就是接下来我们所说的 Presenter，引入 Presenter 能提高代码的可读性和可测试性。如果你不信的话，不妨看看重构后的 MyDetailView：

```java
public class MyDetailView extends LinearLayout {
  TextView textView;
  DetailPresenter presenter;

  public MyDetailView(Context context, AttributeSet attrs) {
    super(context, attrs);
    presenter = new DetailPresenter();
  }

  @Override protected void onFinishInflate() {
    super.onFinishInflate();
    presenter.setView(this);
    textView = (TextView) findViewById(R.id.text);
    findViewById(R.id.button).setOnClickListener(new OnClickListener() {
      @Override public void onClick(View v) {
        presenter.buttonClicked();
      }
    });
  }

  public void setItem(String item) {
    textView.setText(item);
  }
}
```

我们来看看 Square 注册界面中编辑账户的页面吧！

![](https://corner.squareup.com/images/no-fragments/edit-discounts.png)

Presenter 将在更高层级中操控 View：

```java
class EditDiscountPresenter {
  // ...
  public void saveDiscount() {
    EditDiscountView view = getView();
    String name = view.getName();
    if (isBlank(name)) {
      view.showNameRequiredWarning();
      return;
    }
    if (isNewDiscount()) {
      createNewDiscountAsync(name, view.getAmount(), view.isPercentage());
    } else {
      updateNewDiscountAsync(discountId, name, view.getAmount(),
        view.isPercentage());
    }
    close();
  }
}
```

大家可以看到，为这个 Presenter 实现测试单元犹如一缕春风拂面来，甚是舒心爽快呐～

```java
@Test public void cannot_save_discount_with_empty_name() {
  startEditingLoadedPercentageDiscount();
  when(view.getName()).thenReturn("");
  presenter.saveDiscount();
  verify(view).showNameRequiredWarning();
  assertThat(isSavingInBackground()).isFalse();
}
```

##回退栈管理

通过异步处理来管理回退栈实在是牛刀杀鸡，大材小用了……我们只需要用一个超轻量级库——Flow，就可以达到目的。有关 Flow 的介绍 Ray Ryan 已经写过博客了，我就不在此赘述啦。

##我把 UI 相关的代码全都写在 Fragment 里了咋办呀，在线等，急！！！

别理你的 Fragment，你就一点一点地把 View 相关的代码移到自定义 View 里，然后把涉及到的业务逻辑交给能够与 View 进行交互的 Presenter，然后你就会发现 Fragment 沦为空壳，只有一些初始化自定义 View 和连接 View 和 Presenter 的操作：

```java
public class DetailFragment extends Fragment {
  @Override public View onCreateView(LayoutInflater inflater,
    ViewGroup container, Bundle savedInstanceState) {
    return inflater.inflate(R.layout.my_detail_view, container, false);
  }
}
```

事实上到了这一步你已经可以抛弃 Fragment 了。

抛弃 Fragment 确实得花很大的功夫，但我们已经做到了，感谢[ Dimitris Koutsogiorgas ](https://twitter.com/dnkoutso)和[ Ray Ryan ](https://twitter.com/rjrjr)的伟大贡献！

##Dagger 和 Mortar 是什么？

Dagger & Mortar 与 Fragment 成正交关系，换句话说，两者间各自的变化不会影响对方，使用 Dagger & Mortar 既可以用 Fragment，也可以不用 Fragment。

[Dagger](http://square.github.io/dagger/) 能帮你将应用模块化为一张由解耦组件构成的图，它考虑了所有类间的连接关系并简化了抽取依赖的操作，并实现一个与此相关的单例对象。

[Mortar](https://github.com/square/mortar) 在 Dagger 的顶层进行操作，主要优势有如下两点：

- Mortar 为被注入组件提供简单的生命周期回调，使你能实现不会因旋转被销毁的单例 Presenter，不过需要注意的是，Mortar 将当前界面元素的状态储存在 Bundle 中，使数据不会随进程的结束而被清除。

- Mortar 为你管理 Dagger 的子图，并帮你将它们与 Activity 的生命周期关联在一起，这种功能让你能有效地实现“域”：当一个 View 被添加进来，它的 Presenter 和依赖都会作为子图被创建；当 View 被移除，你能轻易地销毁“域”，并让垃圾回收机制去完成它的工作。

##结论

我们曾为 Fragment 的诞生满心欢喜，幻想着 Fragment 能为我们带来种种便利，然而这一切不过是场虚空大梦，我们最后发现骑着白马的 Fragment 既不是王子也不是唐僧，只不过是人品爆发捡了只白马的乞丐罢了：

- 我们遇到的大多数难以解决的 Bug 都与 Fragment 的生命周期有关。

- 我们只需要 View 创建响应式 UI，实现回退栈以及屏幕事件的处理，不用 Fragment 也能满足实际开发的需求。