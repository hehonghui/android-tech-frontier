# Android DataBinding：再见Presenter，你好ViewModel！

> @author ASCE1885的 [Github](https://github.com/ASCE1885)  [简书](http://www.jianshu.com/users/4ef984470da8/latest_articles) [微博](http://weibo.com/asce885/profile?rightmod=1&wvr=6&mod=personinfo) [CSDN](http://blog.csdn.net/asce1885)
[原文链接](http://tech.vg.no/2015/07/17/android-databinding-goodbye-presenter-hello-viewmodel/)

最近一段时间[MVP模式](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)已经成为Android应用开发UI层架构设计的主流趋势。类似[TED MOSBY](http://hannesdorfmann.com/android/mosby/)，[nucleus](https://github.com/konmik/nucleus)和[mortar](https://github.com/square/mortar)之类的框架都引入了Presenters来帮助我们搭建简洁的app架构。它们也（在不同的程度上）帮助我们处理Android平台上臭名昭著的设备旋转和状态持久化等问题。MVP模式也有助于隔离样板代码，虽然这并不是MVP模式的设计初衷。

在Google I/O 2015上，伴随着Android M预览版发布的[Data Binding](https://developer.android.com/tools/data-binding/guide.html)兼容函数库改变了这一切。

根据维基百科上关于MVP的词条描述，Presenter作用如下：

*Presenter作用于model和view，它从仓库（Model）中获取数据，并格式化后让view进行显示。*

Data Binding框架将会接管Presenter的主要职责（作用于model和view上），Presenter的其他剩余职责（从仓库中获取数据并进行格式化处理）则由ViewModel（一个增强版的Model）接管。ViewModel是一个独立的Java类，它的唯一职责是表示一个View后面的数据。它可以合并来自多个数据源（Models）的数据，并将这些数据加工后用于展示。我之前写过一篇[关于ViewModel的短文](http://tech.vg.no/2015/04/06/dont-forget-the-view-model/)，讲述了它与Data Model或者Transport Model之间的区别。

我们今天要讲述的架构是MVVM（[Model－View－ViewModel](https://en.wikipedia.org/wiki/Model_View_ViewModel)），它最初是在2005年（不要吓到哦）由微软提出的一个被证明可用的概念。下面我将举例说明从MVP到MVVM的改变，容我盗用下Hanne Dorfmann在他介绍[TED MOSBY框架](http://hannesdorfmann.com/android/mosby/)的文章中的插图。

![](http://tech.vg.no/files/2015/07/mvp.png)

![](http://tech.vg.no/files/2015/07/mvvm.png)

可以看到对view中数据的所有绑定和更新操作都是通过Data Binding框架实现的。通过[ObservableField类](https://developer.android.com/tools/data-binding/guide.html#observablefields)，View在model发生变化时会作出反应，在XML文件中对属性的引用使得框架在用户操作View时可以将变化推送给对应的ViewModel。我们也可以通过代码订阅属性的变化，这样可以实现例如当CheckBox被点击后，TextView被禁用这样的功能。像这样使用标准Java类来表示View的视觉状态的一个很大优势是明显的：你可以很容易对这种视觉行为进行单元测试。

上面关于MVP的插图中有一个名为Presenter.loadUsers()的方法，这是一个命令。在MVVM中这些方法定义在ViewModel中。从维基百科文章中可以看到：

*view model是一个抽象的view，它对外暴露公有的属性和命令。*

因此这可能跟你以前熟悉的东西有些不同。在MVP模式中models很可能只是纯粹用于保存数据的“哑”类。对于把业务逻辑放到Models或者View Models中的行为不要感到害怕。这是[面向对象编程](https://en.wikipedia.org/wiki/Object-oriented_programming)的核心准则。回到Presenter.loadUsers()函数，现在它是一个放在ViewModel中的函数，它可能被View的后置代码（code－behind）调用，或者被位于View的XML文件中的数据绑定命令调用。如果android-developer-preview问题跟踪里面[这个issue](https://code.google.com/p/android-developer-preview/issues/detail?id=2097)描述的问题得到支持的话。如果我们没能得到数据绑定到命令功能的支持，那就只能使用以前的android:onClick语法，或者手动在view中添加监听器了。 

> 代码后置（code－behind），微软的一个概念，经常与早期的ASP.NET或者WinForms联系在一起。我想它也可以作为Android上的一个描述术语，View由两个元素组成：View的布局文件（XML）和后置代码（Java），这通常是指Fragments，Activities或者继承自View.java的其他类。

###处理系统调用

View的后置代码还需要完成一系列用例－初始化系统，打开对话框的函数，或者任何需要引用Android Context对象的调用。但不要把这样的代码调用放到ViewModel中。如果ViewModel包含

```
import android.content.Context;
```
这段代码，说明你用错了，千万不要这么做，好奇害死猫。
 
我还没有完全决定解决这个问题的最好办法，不过这是因为有几个好的选择。一个方法是通过在ViewModel中持有View的一个引用来保存Mosby中的presenter元素。这个方案不会降低可测试性。但跟在Mosby中持有一个单独的Presenter类不同，我坚持认为将View作为接口的具体实现可以起到简化代码的作用。另一个方法可能是使用[Square的Otto](http://square.github.io/otto/)之类的事件总线机制来初始化类似

```
new ShowToastMessage("hello world")
```

的命令。这将会很好的分离view和viewmodel，不过这是一件好事吗？

###我们不需要框架了吗？

那么Data Binding框架已经接管了类似Mosby或者Mortar等框架的工作了吗？只是一部分。我希望看到的是这些框架进化或者新增分支变成MVVM类型的框架，这样我们在充分利用Data Binding的同时，可以最低限度依赖第三方框架，并保持框架的小而美。虽然Presenter的时代可能已经结束了，但这些框架在管理声明周期和view（或者ViewModel）的状态持久化方面还在发挥作用，这一点并没有改变。（如果Google引入一个LifeCycleAffected接口让Fragment, Activity 和 View进行实现，那将是多么酷的一件事！这个接口由一个名为addOnPauseListener()和addOnResumeListener()的函数，在我们例子中如何使用这个接口将留给你来实现。）

> 更新：最近了解到[AndroidViewModel框架](https://github.com/inloop/AndroidViewModel)，它实际上可能很适合MVVM和Android的Data Binding。不过我还没有时间试用它。

###总结

当我首次听说Android M致力于改进SDK并重点关注开发者时，我真的很激动。当我听说他们引入了Data Binding，我被震惊了。在其他平台如WinForms, WPF, Silverlight 和 Windows Phone上面我已经用了好几年Data Binding技术。我知道这可以帮助我们写出简洁的架构和更少的样板代码。这个框架是站在开发者这边的，而不是阻碍我们的，很久以前我就感受到这一点了。

但Data Binding不是银弹，它也有缺点。在XML文件中定义绑定本身就是一个问题。XML不会被编译，它也不能进行单元测试。因此你将会经常在运行时才发现错误，而不是在编译期间。忘记将属性绑定到View了？很不幸。但工具可以发挥很大的帮助－这是为什么我希望Google能够尽量让Android Studio最大程度支持Data Binding。XML绑定的语法和引用检查，自动完成和导航支持。XML字段的重命名支持。从我测试Android Studio 1.3 beta来看，我至少可以肯定他们有在考虑这件事情。某些功能已经支持了，但还有很多没有支持，不过1.3版本仍然处于beta阶段，我们可以有更多的期待。

###代码示例

接下来我将给出一个示例，演示从MVP架构迁移到MVVM架构的结果。在MVP版本工程中，我使用Mosby框架并使用Butterknife实现视图注入。在MVVM例子中我使用Android M Data Binding并移除工程中对Mosby和Butterknife的依赖。结果是Presenter可以丢掉了，Fragment中代码减少了，不过ViewModel接管了很多代码。

在这个例子中我直接引用View来生成toast消息。这也许不是我以后提倡的一种方法， 但理论上这么做没什么问题。使用Robolectric和Mockito来对Fragment进行mock，这样是可测试的，而且不会泄露内存，除非你错误的引用了ViewModels。

下面这个app只是起一个演示的作用，它具有一个简单的登陆页面，后台会加载一些异步数据，views之间会有一些依赖。

![](http://tech.vg.no/files/2015/07/illustration.png)

如果你希望在Android Studio中阅读代码，可以到[Github上](https://github.com/Nilzor/mvp-to-mvvm-transition)分别检出MVP和MVVM的标签。

下面准备好接受代码轰炸吧😏

MVP – VIEW – XML

```
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
                xmlns:tools="http://schemas.android.com/tools"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:paddingLeft="@dimen/activity_horizontal_margin"
                android:paddingRight="@dimen/activity_horizontal_margin"
                android:paddingTop="@dimen/activity_vertical_margin"
                android:paddingBottom="@dimen/activity_vertical_margin"
                tools:context=".MainActivityFragment">
 
    <TextView
        android:text="..."
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentEnd="true"
        android:id="@+id/loggedInUserCount"/>
 
    <TextView
        android:text="# logged in users:"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentEnd="false"
        android:layout_toLeftOf="@+id/loggedInUserCount"/>
 
    <RadioGroup
        android:layout_marginTop="40dp"
        android:id="@+id/existingOrNewUser"
        android:gravity="center"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerHorizontal="true"
        android:orientation="horizontal">
 
        <RadioButton
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Returning user"
            android:id="@+id/returningUserRb"/>
 
        <RadioButton
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="New user"
            android:id="@+id/newUserRb"
            />
 
    </RadioGroup>
 
    <LinearLayout
        android:orientation="horizontal"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:id="@+id/username_block"
        android:layout_below="@+id/existingOrNewUser">
 
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textAppearance="?android:attr/textAppearanceMedium"
            android:text="Username:"
            android:id="@+id/textView"
            android:minWidth="100dp"/>
 
        <EditText
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:id="@+id/username"
            android:minWidth="200dp"/>
    </LinearLayout>
 
    <LinearLayout
        android:orientation="horizontal"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentStart="false"
        android:id="@+id/password_block"
        android:layout_below="@+id/username_block">
 
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textAppearance="?android:attr/textAppearanceMedium"
            android:text="Password:"
            android:minWidth="100dp"/>
 
        <EditText
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:inputType="textPassword"
            android:ems="10"
            android:id="@+id/password"/>
 
    </LinearLayout>
 
    <LinearLayout
        android:orientation="horizontal"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@+id/password_block"
        android:id="@+id/email_block">
 
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textAppearance="?android:attr/textAppearanceMedium"
            android:text="Email:"
            android:minWidth="100dp"/>
 
        <EditText
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:inputType="textEmailAddress"
            android:ems="10"
            android:id="@+id/email"/>
    </LinearLayout>
 
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Log in"
        android:id="@+id/loginOrCreateButton"
        android:layout_below="@+id/email_block"
        android:layout_centerHorizontal="true"/>
</RelativeLayout>
```

MVP – VIEW – JAVA

```
package com.nilzor.presenterexample;
 
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.RadioButton;
import android.widget.TextView;
import android.widget.Toast;
import com.hannesdorfmann.mosby.mvp.MvpFragment;
import com.hannesdorfmann.mosby.mvp.MvpView;
import butterknife.InjectView;
import butterknife.OnClick;
 
public class MainActivityFragment extends MvpFragment implements MvpView {
    @InjectView(R.id.username)
    TextView mUsername;
 
    @InjectView(R.id.password)
    TextView mPassword;
 
    @InjectView(R.id.newUserRb)
    RadioButton mNewUserRb;
 
    @InjectView(R.id.returningUserRb)
    RadioButton mReturningUserRb;
 
    @InjectView(R.id.loginOrCreateButton)
    Button mLoginOrCreateButton;
 
    @InjectView(R.id.email_block)
    ViewGroup mEmailBlock;
 
    @InjectView(R.id.loggedInUserCount)
    TextView mLoggedInUserCount;
 
    public MainActivityFragment() {
    }
 
    @Override
    public MainPresenter createPresenter() {
        return new MainPresenter();
    }
 
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_main, container, false);
    }
 
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        attachEventListeners();
    }
 
    private void attachEventListeners() {
        mNewUserRb.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                updateDependentViews();
            }
        });
        mReturningUserRb.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                updateDependentViews();
            }
        });
    }
 
    /** Prepares the initial state of the view upon startup */
    public void setInitialState() {
        mReturningUserRb.setChecked(true);
        updateDependentViews();
    }
 
    /** Shows/hides email field and sets correct text of login button depending on state of radio buttons */
    public void updateDependentViews() {
        if (mReturningUserRb.isChecked()) {
            mEmailBlock.setVisibility(View.GONE);
            mLoginOrCreateButton.setText(R.string.log_in);
        }
        else {
            mEmailBlock.setVisibility(View.VISIBLE);
            mLoginOrCreateButton.setText(R.string.create_user);
        }
    }
 
    public void setNumberOfLoggedIn(int numberOfLoggedIn) {
        mLoggedInUserCount.setText(""  + numberOfLoggedIn);
    }
 
    @OnClick(R.id.loginOrCreateButton)
    public void loginOrCreate() {
        if (mNewUserRb.isChecked()) {
            Toast.makeText(getActivity(), "Please enter a valid email address", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(getActivity(), "Invalid username or password", Toast.LENGTH_SHORT).show();
        }
    }
}
```

MVP – PRESENTER

```
package com.nilzor.presenterexample;
 
import android.os.Handler;
import android.os.Message;
import com.hannesdorfmann.mosby.mvp.MvpPresenter;
 
public class MainPresenter implements MvpPresenter {
    MainModel mModel;
    private MainActivityFragment mView;
 
    public MainPresenter() {
        mModel = new MainModel();
    }
 
    @Override
    public void attachView(MainActivityFragment view) {
        mView = view;
        view.setInitialState();
        updateViewFromModel();
        ensureModelDataIsLoaded();
    }
 
    @Override
    public void detachView(boolean retainInstance) {
        mView = null;
    }
 
    private void ensureModelDataIsLoaded() {
        if (!mModel.isLoaded()) {
            mModel.loadAsync(new Handler.Callback() {
                @Override
                public boolean handleMessage(Message msg) {
                    updateViewFromModel();
                    return true;
                }
            });
        }
    }
 
    /** Notifies the views of the current value of "numberOfUsersLoggedIn", if any */
    private void updateViewFromModel() {
        if (mView != null && mModel.isLoaded()) {
            mView.setNumberOfLoggedIn(mModel.numberOfUsersLoggedIn);
        }
    }
}
```

MVP – MODEL

```
package com.nilzor.presenterexample;
 
import android.os.AsyncTask;
import android.os.Handler;
import java.util.Random;
 
public class MainModel {
    public Integer numberOfUsersLoggedIn;
    private boolean mIsLoaded;
    public boolean isLoaded() {
        return mIsLoaded;
    }
 
    public void loadAsync(final Handler.Callback onDoneCallback) {
        new AsyncTask() {
            @Override
            protected Void doInBackground(Void... params) {
                // Simulating some asynchronous task fetching data from a remote server
                try {Thread.sleep(2000);} catch (Exception ex) {};
                numberOfUsersLoggedIn = new Random().nextInt(1000);
                mIsLoaded = true;
                return null;
            }
 
            @Override
            protected void onPostExecute(Void aVoid) {
                onDoneCallback.handleMessage(null);
            }
        }.execute((Void) null);
    }
}
```

MVVM – VIEW – XML

```
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <data>
        <variable name="data" type="com.nilzor.presenterexample.MainModel"/>
    </data>
    <RelativeLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:paddingLeft="@dimen/activity_horizontal_margin"
        android:paddingRight="@dimen/activity_horizontal_margin"
        android:paddingTop="@dimen/activity_vertical_margin"
        android:paddingBottom="@dimen/activity_vertical_margin"
        tools:context=".MainActivityFragment">
 
        <TextView
            android:text="@{data.numberOfUsersLoggedIn}"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentEnd="true"
            android:id="@+id/loggedInUserCount"/>
 
        <TextView
            android:text="# logged in users:"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentEnd="false"
            android:layout_toLeftOf="@+id/loggedInUserCount"/>
 
        <RadioGroup
            android:layout_marginTop="40dp"
            android:id="@+id/existingOrNewUser"
            android:gravity="center"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_centerHorizontal="true"
            android:orientation="horizontal">
 
            <RadioButton
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Returning user"
                android:checked="@{data.isExistingUserChecked}"
                android:id="@+id/returningUserRb"/>
 
            <RadioButton
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="New user"
                android:id="@+id/newUserRb"
                />
 
        </RadioGroup>
 
        <LinearLayout
            android:orientation="horizontal"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:id="@+id/username_block"
            android:layout_below="@+id/existingOrNewUser">
 
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textAppearance="?android:attr/textAppearanceMedium"
                android:text="Username:"
                android:id="@+id/textView"
                android:minWidth="100dp"/>
 
            <EditText
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:id="@+id/username"
                android:minWidth="200dp"/>
        </LinearLayout>
 
        <LinearLayout
            android:orientation="horizontal"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_alignParentStart="false"
            android:id="@+id/password_block"
            android:layout_below="@+id/username_block">
 
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textAppearance="?android:attr/textAppearanceMedium"
                android:text="Password:"
                android:minWidth="100dp"/>
 
            <EditText
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:inputType="textPassword"
                android:ems="10"
                android:id="@+id/password"/>
 
        </LinearLayout>
 
        <LinearLayout
            android:orientation="horizontal"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_below="@+id/password_block"
            android:id="@+id/email_block"
            android:visibility="@{data.emailBlockVisibility}">
 
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textAppearance="?android:attr/textAppearanceMedium"
                android:text="Email:"
                android:minWidth="100dp"/>
 
            <EditText
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:inputType="textEmailAddress"
                android:ems="10"
                android:id="@+id/email"/>
        </LinearLayout>
 
        <Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{data.loginOrCreateButtonText}"
            android:id="@+id/loginOrCreateButton"
            android:layout_below="@+id/email_block"
            android:layout_centerHorizontal="true"/>
    </RelativeLayout>
</layout>
```

MVVM – VIEW – JAVA

```
package com.nilzor.presenterexample;
 
import android.app.Fragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CompoundButton;
import android.widget.Toast;
 
import com.nilzor.presenterexample.databinding.FragmentMainBinding;
 
public class MainActivityFragment extends Fragment {
    private FragmentMainBinding mBinding;
    private MainModel mViewModel;
 
    public MainActivityFragment() {
    }
 
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_main, container, false);
        mBinding = FragmentMainBinding.bind(view);
        mViewModel = new MainModel(this, getResources());
        mBinding.setData(mViewModel);
        attachButtonListener();
        return view;
    }
 
    private void attachButtonListener() {
        mBinding.loginOrCreateButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mViewModel.logInClicked();
            }
        });
    }
 
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        ensureModelDataIsLodaded();
    }
 
    private void ensureModelDataIsLodaded() {
        if (!mViewModel.isLoaded()) {
            mViewModel.loadAsync();
        }
    }
 
    public void showShortToast(String text) {
        Toast.makeText(getActivity(), text, Toast.LENGTH_SHORT).show();
    }
}
```

MVVM – VIEWMODEL

```
package com.nilzor.presenterexample;
 
import android.content.res.Resources;
import android.databinding.ObservableField;
import android.os.AsyncTask;
import android.view.View;
 
import java.util.Random;
 
public class MainModel {
    public ObservableField numberOfUsersLoggedIn = new ObservableField();
    public ObservableField isExistingUserChecked = new ObservableField();
    public ObservableField emailBlockVisibility = new ObservableField();
    public ObservableField loginOrCreateButtonText = new ObservableField();
    private boolean mIsLoaded;
    private MainActivityFragment mView;
    private Resources mResources;
 
    public MainModel(MainActivityFragment view, Resources resources) {
        mView = view;
        mResources = resources; // You might want to abstract this for testability
        setInitialState();
        updateDependentViews();
        hookUpDependencies();
    }
    public boolean isLoaded() {
        return mIsLoaded;
    }
 
    private void setInitialState() {
        numberOfUsersLoggedIn.set("...");
        isExistingUserChecked.set(true);
    }
 
    private void hookUpDependencies() {
        isExistingUserChecked.addOnPropertyChangedCallback(new android.databinding.Observable.OnPropertyChangedCallback() {
            @Override
            public void onPropertyChanged(android.databinding.Observable sender, int propertyId) {
                updateDependentViews();
            }
        });
    }
 
    public void updateDependentViews() {
        if (isExistingUserChecked.get()) {
            emailBlockVisibility.set(View.GONE);
            loginOrCreateButtonText.set(mResources.getString(R.string.log_in));
        }
        else {
            emailBlockVisibility.set(View.VISIBLE);
            loginOrCreateButtonText.set(mResources.getString(R.string.create_user));
        }
    }
 
    public void loadAsync() {
        new AsyncTask() {
            @Override
            protected Void doInBackground(Void... params) {
                // Simulating some asynchronous task fetching data from a remote server
                try {Thread.sleep(2000);} catch (Exception ex) {};
                numberOfUsersLoggedIn.set("" + new Random().nextInt(1000));
                mIsLoaded = true;
                return null;
            }
        }.execute((Void) null);
    }
 
    public void logInClicked() {
        // Illustrating the need for calling back to the view though testable interfaces.
        if (isExistingUserChecked.get()) {
            mView.showShortToast("Invalid username or password");
        }
        else {
            mView.showShortToast("Please enter a valid email address");
        }
    }
}
```

