Android 双向 Data Binding
---

> * 原文链接 : [Two-way Android Data Binding](https://medium.com/@fabioCollini/android-data-binding-f9f9d3afc761)
* 原文作者 : [@fabioCollini](https://medium.com/@fabioCollini)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [Mr.simple](https://github.com/bboyfeiyu)  
* 状态 :   完成

###如何使用双向数据绑定管理布局

今年 Google I/O 大会中发布的 Data Binding 框架吸引了很大一部分 Android 开发者的注意力。关于它的讨论已经持续了很长时间，现在终于可以用实例来测试这个框架了。在[官网][official website]和很多开发者的 blog 里都有示例应用展示如何使用 Data Binding，其中用了这个框架的许多特性。因此他们突出的是这个框架的优势。我们今天的文章会从两个实例开始(一个普通的
和一个复杂些的)，展示怎样在 Android 开发中使用 Data Binding。

---

###文本字段的双向绑定
Echo 是一个典型的 data binding 示例:两个 `EditText` 绑定到同一个 bean 中。
这样可以在一个 EditText 中输入的同时在另一个 EditText 即时的显示输入的内容。
下面是 bean 的示例代码:

```java
public class Echo {
  public String text;
}
```

简便起见，这里没有包含 getter 和 setter，有也没关系。

layout 也很简单，主要由绑定了同一个 data 的两个 EditText 组成。

```xml
<layout
  xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools">
  <data>
    <variable
      name="echo"
      type="it.cosenonjaviste.databinding.echo.Echo"/>
  </data>
  <LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">
    <EditText
      android:layout_width="match_parent"
      android:layout_height="wrap_content"
    android:hint="Text 1"
      android:text="@{echo.text}"/>
    <EditText
      android:layout_width="match_parent"
      android:layout_height="wrap_content"
      android:hint="Text 2"
      android:text="@{echo.text}"/>
  </LinearLayout>
  </layout>
```

在 Activity 里面需要用 **DataBindingUtil** 这个工具类来设置 layout，然后绑定对象( **EchoBinding** 是根据布局文件自动生成的)。

```java
public class EchoActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    EchoBinding binding = DataBindingUtil.setContentView(
      this, R.layout.echo);
    binding.setEcho(new Echo());
  }
}
```

我们的理想效果是只要给 bean 和 View 设置好正确的 listener ，数据就应该同步起来了。不过实际运行这个例子时， 并不是这个效果，在一个输入框输入另一个输入框也没有变化。这个场景中唯一有效的绑定是最开始时 Echo 的 string 和这两个文本字段。当 `setEcho` 方法在 EchoBinding 对象上被调用时，如果 Echo 的 text 不为空，它就会被设置到图形界面的两个 EditText 中。绑定只对 object 到 layout，并且仅当使用 `setEcho` 方法设置 object 时生效。后面无论 Echo 对象中的 text 有什么变化都不会映射到 layout 中。

如果想要自动接收后续更新，那么就要用 ObservableField<String> 定义一个字段，
而不是仅仅使用 String。
```java
public class Echo {
  public ObservableField<String> text = new ObservableField<>();
}
```

ObservableField 这个类 (还有其他为原生类型准备的类，比如 ObservableInt 和 ObservableBoolean) 可以当作典型的观察者模式看待(你最好知道，这和 RxJava 管理的 `Observables` 可不一样)。事实上，在 EchoBinding 对象上调用 `setEcho` 方法的同时会在 Observable 上注册一个 listener。这个 listener 会在每次更新时被调用，它还会更新 layout 中的 View。

```xml
<EditText
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:hint="Text 1"
  android:text="@{echo.text}"
  android:addTextChangedListener="@{echo.watcher}"/>
  ```

  ---

使用这种方法就需要在类中定义一个 TextWatcher:

```java
public class Echo {
  public ObservableField<String> text = new ObservableField<>();
  public TextWatcher watcher = new TextWatcherAdapter() {
    @Override public void afterTextChanged(Editable s) {
      if (!Objects.equals(text.get(), s.toString())) {
        text.set(s.toString());
      }
    }
  };
}
```

这里面的检查主要是为了防止死循环: layout 更新了 object ，然后再调用 listener
去更新 View。
虽然这么做双向绑定可以正常工作，不过有还是有些东西让我有所担心:

- Echo 类不应该和 layout 有联系，使用 `ObservableField` 不是最简洁的做法，还有
    它需要定义一个 TextWatcher 也不是很好。
- 每个必需绑定的字段都要写大量的代码(两个互相连接的字段)。

    ---

###自定义绑定规范

想要解决以上问题，我们可以使用自定义的 binding，Data Binding 框架允许我们这么干，定义起来也很容易。

首先，要声明一个我们自己的 `ObservableField` 不过是 string-specific 的(让我们把名字也重新搞一下，避免把原生类和 RxJava 的 Observables 弄混) :

```java
public class BindableString extends BaseObservable {
  private String value;
  public String get() {
    return value != null ? value : "";
  }
  public void set(String value) {
    if (!Objects.equals(this.value, value)) {
      this.value = value;
      notifyChange();
    }
  }
  public boolean isEmpty() {
    return value == null || value.isEmpty();
  }
}
```

在这里加入一个 `isEmpty` 工具方法检查 value，避免不必要的代码。
想要在 `android:text` 属性里直接使用这个类需要在一个类里使用 **@BindingConversion** 注解声明一个方法进行转换:

```java
@BindingConversion
public static String convertBindableToString(
    BindableString bindableString) {
  return bindableString.get();
}
```

为了简化上面代码，也可以使用 **@BindingAdapter** 注解创建一个自定义属性。比如，我们可以声明一个属性 `app:binding` 设置 value 添加 `TextWatcher`:

```java
@BindingAdapter({"app:binding"})
public static void bindEditText(EditText view,
    final BindableString bindableString) {
  if (view.getTag(R.id.binded) == null) {
    view.setTag(R.id.binded, true);
    view.addTextChangedListener(new TextWatcherAdapter() {
      @Override
      public void onTextChanged(CharSequence s, int start,
          int before, int count) {
        bindableString.set(s.toString());
      }
    });
  }
  String newValue = bindableString.get();
  if (!view.getText().toString().equals(newValue)) {
    view.setText(newValue);
  }
}
```

两个需要注意的地方:
- 这个方法会在绑定的对象被改变时调用;添加了一个 tag 来避免给相同字段设置多个 TextWatcher。
- 在设置新的 value 之前要检查 value 是否真的改变;这样可以避免 text view 中
 由于光标位置改变而引起的问题。

现在我们可以简单的把 layout 文件重写一下，用我们新定义的 `app:binding` 属性:

```xml
<EditText
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:hint="Text 1"
  app:binding="@{echo.text}"/>
  ```

###管理屏幕方向切换

在这里还有一个很微妙的东西要注意，就是应用在横竖屏切换的时候，我们需要特别处理。我们都知道屏幕方向切换时 Activity 会被销毁重建，Echo 对象是新生成的，绑定也是重新绑定的。所以之前用户输入的内容就消失了。:(

处理这种情况正确的做法是重写 Activity 的 `onSaveInstanceState` 方法，只在第一次启动时创建新的 Echo 对象:

```java
public class EchoActivity extends AppCompatActivity {
  public static final String ECHO = “ECHO”;
  private Echo echo;
  @Override protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    EchoBinding binding = DataBindingUtil.setContentView(
      this, R.layout.echo);
    if (savedInstanceState == null) {
      echo = new Echo();
    } else {
      echo = Parcels.unwrap(
        savedInstanceState.getParcelable(ECHO));
    }
    binding.setEcho(echo);
  }
  @Override protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putParcelable(ECHO, Parcels.wrap(echo));
  }
}
```

这里使用 [Parceler][Parceler] 框架是为了简化 Parcelable 对象的操作。BindableString 类也要用 Parceler 映射；并不是很复杂，因为它只是管理 String ，当方向改变时可以忽略。

###使用数据绑定的登录功能

下面做一个复杂点的，类似 Amazon 的登陆界面:

![img](https://d262ilb51hltx0.cloudfront.net/max/800/1*mcgP_N5m490BGqz7g_9i1g.png)

验证从第一个提交开始，后续的改变也会触发验证，只有当第二个 radio button 选中时 passwd 的字段才有效。

我们从 radio button 开始，这种情况下需要对 radio group 进行绑定:

```xml
<RadioGroup
  android:layout_width=”match_parent”
  android:layout_height=”wrap_content”
  android:orientation=”vertical”
  app:binding=”@{loginInfo.existingUser}”>
  <RadioButton
    android:layout_width=”wrap_content”
    android:layout_height=”wrap_content”
    android:text=”@string/new_customer”/>
  <RadioButton
    android:layout_width=”wrap_content”
    android:layout_height=”wrap_content”
    android:text=”@string/i_have_a_password”/>
    </RadioGroup>
```

我们需要自定义一个 bind，这次使用一个 `BindableBoolean` 对象。因为这个 radio group 只有两个 button，所以我们这里使用了 boolean，你也可以使用其它的类型(比如 int)。这个 bind 的
和我们之前实现的 `BindableString` 很像。

关于文本字段，使用了一个包含 EditText 的 TextInputLayout (由[Design Support Library][dsl]提供)。
在使用密码字段时需要处理三个绑定:
- text:和前面例子中的绑定一样
- error:指向一个字段(比如 `BindableString`)的另一个绑定
- enabled:这里和 RadioGroup 使用了同一个 boolean，可以在用户选中 radio button 时自动更新。

对应代码如下:

```xml
<android.support.design.widget.TextInputLayout
  android:layout_width=”match_parent”
  android:layout_height=”wrap_content”
  app:error=”@{loginInfo.passwordError}”>
    <EditText
      android:id=”@+id/password”
      android:layout_width=”match_parent”
      android:layout_height=”wrap_content”
      android:enabled=”@{loginInfo.existingUser}”
      android:hint=”@string/password”
      android:inputType=”textPassword”
      app:binding=”@{loginInfo.password}”/>
      </android.support.design.widget.TextInputLayout>
```

绑定是通过一个包含 layout 所有字段需要信息的 LoginInfo 类实现的:
```java
public class LoginInfo {
    public BindableString email = new BindableString();
    public BindableString password = new BindableString();
    public BindableString emailError = new BindableString();
    public BindableString passwordError = new BindableString();
    public BindableBoolean existingUser = new BindableBoolean();
    public void reset() {
        email.set(null);
        password.set(null);
        emailError.set(null);
        passwordError.set(null);
    }
  }
```

点击 `reset` button 要调用 `reset` 方法，想要实现这个效果 reset 方法需要返回一个 `OnClickListener` 。如果可以使用一个 `android:onClick="@{loginInfo.reset}"` 来标注就好了，但是目前的 Data Binding 还不可以，它还只是个测试版，希望下个版本可以加入这个特性。
我们仍然用框架生成的 object 添加 listener:

```java
binding.reset.setOnClickListener(new View.OnClickListener() {
  @Override public void onClick(View v) {
    loginInfo.reset();
  }
  });
```

layout 中每一个设置了 id 的 view present 都会在自动生成的 binding 对象里有一个对应的字段，可以避免使用 findViewById 方法。使用 Data Binding 弱化了 [ButterKnife][butterknife] 和 [Holdr][holdr] 这类框架的优势(Holdr 已经不推荐使用)。

值得注意的是框架内部并没有使用 `findViewById` 方法，在生成的代码中有一个方法，可以遍历 layout，搜索所有 view。

EDIT: 1.0-rc1 版本之后可以方便的定义一个 listener:

```xml
    android:onClick="@{loginInfo.reset}"
```

reset 方法的签名必须和 OnClickListener 接口的 onClick 方法相兼容:
需要一个类型为 View 的参数。使用自定义 binding 可以免去这个参数。

```java
@BindingAdapter({"app:onClick"})
public static void bindOnClick(View view, final Runnable runnable) {
    view.setOnClickListener(new View.OnClickListener() {
        @Override public void onClick(View v) {
            runnable.run();
        }
    });
}
```

第二个参数是一个 Runnable，只是一个带有唯一无参方法接口的占位符。
类似的方法也被用来处理验证过程的 listener，通过给 Activity 内的 email 和 passwd  
字段添加listener:

```java
TextWatcherAdapter watcher = new TextWatcherAdapter() {
  @Override public void afterTextChanged(Editable s) {
    loginInfo.validate(getResources());
  }
};
binding.email.addTextChangedListener(watcher);
binding.password.addTextChangedListener(watcher);
```

LoginInfo 内部有一个 boolean 字段用来储存用户是否已经尝试登录。验证过程
通过检查这个值来判断是否显示错误提示:

```java
public boolean loginExecuted;
public boolean validate(Resources res) {
  if (!loginExecuted) {
    return true;
  }
  int emailErrorRes = 0;
  int passwordErrorRes = 0;
  if (email.get().isEmpty()) {
    emailErrorRes = R.string.mandatory_field;
  } else {
    if (!Patterns.EMAIL_ADDRESS.matcher(email.get()).matches()) {
      emailErrorRes = R.string.invalid_email;
    }
  }
  if (existingUser.get() && password.get().isEmpty()) {
    passwordErrorRes = R.string.mandatory_field;
  }
  emailError.set(emailErrorRes != 0 ?
    res.getString(emailErrorRes) : null);
  passwordError.set(passwordErrorRes != 0 ?
    res.getString(passwordErrorRes) : null);
  return emailErrorRes == 0 && passwordErrorRes == 0;
}
```

login 按钮上的 click listener 会对这个 boolean 进行设置，验证被执行，
传递一个 message ，通过 Snackbar([Design Support Library ][dsl]提供) 展示给用户:

```java
binding.login.setOnClickListener(new View.OnClickListener() {
  @Override public void onClick(View v) {
    loginInfo.loginExecuted = true;
    if (loginInfo.validate(getResources())) {
      Snackbar.make(
        binding.getRoot(),
        loginInfo.email.get() + “ — “ + loginInfo.password.get(),
        Snackbar.LENGTH_LONG
      ).show();
    }
  }
});
```

###结论

Android 的 Data Binding 框架还在 beta 阶段，Android Studio 对其内部支持也不是很完整，
进步的空间还很大。不过它被设计和开发的很好，将会改变 Android 应用开发方式(如果顺利的话)。
允许自定义 attributes 这个功能十分强大，我非常好奇第三方库开发者将会怎样使用这个特性。

这篇文章完整的代码在这里[Github][databinding]

An Italian version of this post is available on cosenonjaviste.it.
[一个 Italian 版本翻译][Italian]


---

[official website]:https://developer.android.com/tools/data-binding/guide.html
[dsl]:http://android-developers.blogspot.it/2015/05/android-design-support-library.html
[butterknife]:https://github.com/JakeWharton/butterknife
[holdr]:https://github.com/evant/holdr
[databinding]:https://github.com/commit-non-javisti/databinding
[Italian]:http://www.cosenonjaviste.it/gestione-di-una-form-con-il-data-binding-android/
[Parceler]:http://parceler.org/
