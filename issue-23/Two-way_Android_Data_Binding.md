Android 双向 Data Binding
---

> * 原文链接 : [Two-way Android Data Binding](https://medium.com/@fabioCollini/android-data-binding-f9f9d3afc761)
* 原文作者 : [@fabioCollini](https://medium.com/@fabioCollini)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :   校对中

#Two-way Android Data Binding.md
###How to use two-way Data Binding to manage a layout
One of the most interesting news for Android developers presented at Google I/O
2015 is the Data Binding framework. It has been discussed for quite a long time,
now the moment has arrived to test this framework in a real example.
In the [official website][official website] and on many blogs there are examples
of how to use data binding in Android apps, many of these examples leverage the
framework features. For these reason they highlight well the points of strength
of the framework. In this post we will start from two real examples (one trivial
  and another more complex) to see how the Data Binding could be useful for
  developing Android apps.

今年 Google I/O 大会中发布的 Data Binding 框架吸引了很大一部分 Android
开发者的注意力。关于它的讨论已经持续了很长时间，
现在终于可以用实例来测试这个框架了。
在[官网][official website]和很多开发者的 blog 里都有示例应用展示如何使用
Data Binding，其中用了这个框架的许多特性。
因此他们突出的是这个框架的优势。我们今天的文章会从两个实例开始(一个普通的
和一个复杂些的)，展示怎样在 Android 开发中使用 Data Binding。

---

###Two-way binding in a text field
Echo is the classic data binding example: two text fields bound to the same
field of a bean. It allows to verify that what we are writing in a field is been
updated in the other field in real time. In order to write this example let’s
start with a simple Java class with a text field:

###文本字段的双向绑定
Echo 是一个典型的 data binding 示例:两个 `EditText` 绑定到同一个 bean 中。
这样可以在一个 EditText 中输入的同时在另一个 EditText 即时的显示输入的内容。
下面是 bean 的示例代码:
```java
public class Echo {
  public String text;
}
```

---

To make this example easy this class doesn’t contain getters and setters (we
  could even talk for days about the fact that many Android developers don’t
  use the getters but… let’s forget about it!). Even if the bean would contains
  getters and setters, it didn’t change the whole example.

简便起见，这里没有包含 getter 和 setter，有也没关系。

---

The layout is really simple and it is made up of two EditText with the same
binding in the text attribute:

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

---

In the Activity you need to set the layout using the DataBindingUtil class
and then the object on which you make the binding (the class EchoBinding is
  automatically generated according to the layout):

在 Activity 里面需要用 **DataBindingUtil** 这个工具类来设置 layout，然后绑定对象
( **EchoBinding** 是根据布局文件自动生成的)。

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

---

Alright, in an ideal world this example should work by just putting the right
listeners on the bean and on the Views and then update everything… but in the
real world when executing this example, the listeners are not added and writing
in one of the text field doesn’t automatically update the other one. The only
working binding in this scenario is the initial one between the string in the
Echo class and the two text fields. When the setEcho method is called on the
 EchoBinding object, if the field is not empty, this one will be set on the
 two fields in the graphic interface. Binding works only from the object to
 the layout (and not vice versa) and only when the object is set using the
 setEcho method. Further changes in the value of the object field are not
 reflected in the layout.

我们的理想效果是只要给 bean 和 View 设置好正确的 listener ，数据
就应该同步起来了。不过实际运行这个例子时， 并不是这个效果，在一个输入框
输入另一个输入框也没有变化。这个场景中唯一有效的绑定是最开始时 Echo 的 string
和这两个文本字段。当 `setEcho` 方法在 EchoBinding 对象上被调用时，如果 Echo 的
text 不为空，它就会被设置到图形界面的两个 EditText 中。绑定只对 object 到
layout，并且仅当使用 `setEcho` 方法设置 object 时生效。后面无论 Echo
对象中的 text 有什么变化都不会映射到 layout 中。

---

In order to receive the next updates automatically it is necessary to define the
 field using a ObservableField<String> and not simply using a string:

如果想要自动接收后续更新，那么就要用 ObservableField<String> 定义一个字段，
而不是仅仅使用 String。
```java
public class Echo {
  public ObservableField<String> text = new ObservableField<>();
}
```

---

The class ObservableField (and the other classes for the native types such as
ObservableInt and ObservableBoolean) could be seen as an implementation of
the classical Observable pattern (to get it better, it is not similar to the
Observables managed by RxJava). Practically, when the method setEcho is
called on the EchoBinding object, a listener on the Observable is registered. This
listener is invoked on every update and it will update the Views
contained in the layout.

ObservableField 这个类 (还有其他为原生类型准备的类，比如 ObservableInt 和
ObservableBoolean) 可以当作典型的观察者模式看待(你最好知道，这和 RxJava
管理的 `Observables` 可不一样)。事实上，在 EchoBinding 对象上调用 `setEcho`
方法的同时会在 Observable 上注册一个 listener。这个 listener
会在每次更新时被调用，它还会更新 layout 中的 View。

```xml
<EditText
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:hint="Text 1"
  android:text="@{echo.text}"
  android:addTextChangedListener="@{echo.watcher}"/>
  ```

  ---

In this way it is necessary to define the TextWatcher field inside the Echo class:

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

---

The check within the event was added to avoid infinite cycles: the layout that
updates the object calls the listener to update the graphic interface.
In this way the two-way binding works properly but there are a couple of things
that worry me a bit:

- the Echo class should be disjointed from the graphic interface, the idea of
using an ObservableField is not really the cleanest way to execute it and
the need to define a TextWatcher within is not really the best either;
- for each field on which the binding must be executed, it is necessary
to write a lot of code (two fields linked to each other).

这里面的检查主要是为了防止死循环: layout 更新了 object ，然后再调用 listener
去更新 View。
虽然这么做双向绑定可以正常工作，不过有还是有些东西让我有所担心:

- Echo 类不应该和 layout 有联系，使用 `ObservableField` 不是最简洁的做法，还有
    它需要定义一个 TextWatcher 也不是很好。
- 每个必需绑定的字段都要写大量的代码(两个互相连接的字段)。

    ---

###Custom binding definition
In order to solve the mentioned problems, we can use some custom bindings, the
Data Binding framework allows us so define them very easily. First, we must
 define one of our objects similar to ObservableField but string-specific
 (let’s also change its name as to avoid confusion with the original class and
   RxJava’s Observables):

想要解决以上问题，我们可以使用自定义的 binding，Data Binding 框架允许我们
这么干，定义起来也很容易。首先，要声明一个我们自己的 `ObservableField`
不过是 string-specific 的(让我们把名字也重新搞一下，
避免把原生类和 RxJava 的 Observables 弄混) :

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

---

While changing the class let’s also add a utility method isEmpty and also we
will check if the value has changed to avoid redundant code.
In order to use this class in the attribute android:text it is necessary to
write in a class a method annotated with @BindingConversion that does the conversion:

在这里加入一个 `isEmpty` 工具方法检查 value，避免不必要的代码。
想要在 `android:text` 属性里直接使用这个类需要在一个类里使用
**@BindingConversion** 注解声明一个方法进行转换:

```java
@BindingConversion
public static String convertBindableToString(
    BindableString bindableString) {
  return bindableString.get();
}
```

---

To simplify the above code, it is possible to create a custom attribute using
the annotation @BindingAdapter. For example, we can define an attribute
app:binding in which we set the value and add the TextWatcher:

为了简化上面代码，也可以使用 **@BindingAdapter** 注解创建一个自定义属性。
比如，我们可以声明一个属性 `app:binding` 设置 value 添加 `TextWatcher`:

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

---

A couple of things to note:
- this method is invoked every time the object on which the binding is done
changes; to avoid setting more than a TextWatcher for the same text field a
 tag gets added (and then checked);
- before setting the value we check the value is actually changed; this check
allows to avoid problems in the position of the cursor in the text view.

两个需要注意的地方:
- 这个方法会在绑定的对象被改变时调用;添加了一个 tag 来避免给相同字段设置多个 TextWatcher。
- 在设置新的 value 之前要检查 value 是否真的改变;这样可以避免 text view 中
 由于光标位置改变而引起的问题。

 ---

 Now, it is very easy to re-write the layout of the example we saw earlier, we
 can just use the app:binding attribute:

现在我们可以简单的把 layout 文件重写一下，用我们新定义的 `app:binding` 属性:

```xml
<EditText
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:hint="Text 1"
  app:binding="@{echo.text}"/>
  ```

  ---

###Orientation change management
###Orientation change management

A quite delicate aspect to manage in Android applications is the device
rotation, also in this case we need to be quite careful. In fact, the Activity
 is destroyed and, in the new Activity, a new Echo object is created and the
 binding is redone. For this reason, it starts over, losing the content of the
  form already inserted by the user. :(

在这里还有一个很微妙的东西要注意，就是应用在横竖屏切换的时候，
我们需要特别处理。我们都知道屏幕方向切换时 Activity 会被销毁重建，
Echo 对象是新生成的，绑定也是重新绑定的。所以之前用户输入的内容就消失了。:(

  ---

The right way to manage this is saving the Activity’s instance state, when
creating the Echo object it is recreated only in case it is started for the first time:

处理这种情况正确的做法是重写 Activity 的 `onSaveInstanceState` 方法，
只在第一次启动时创建新的 Echo 对象:

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

---

In this example Parceler framework was used to simplify the management of Parcelable objects.
 We must also note that also the BindableString class must be mapped using Parceler; it isn’t complicated,
 as it’s just a matter of managing the string, as the list of listeners can be ignored when changing the orientation.

这里使用 [Parceler][Parceler] 框架是为了简化 Parcelable 对象的操作。
BindableString 类也要用 Parceler 映射；并不是很复杂，
因为它只是管理 String ，当方向改变时可以忽略。

---

###A login form using Data Binding
###A login form using Data Binding
Let’s check out an example that is a bit more complicated, a login form similar to Amazon’s one:

下面做一个复杂点的，类似 Amazon 的登陆界面:

![img](https://d262ilb51hltx0.cloudfront.net/max/800/1*mcgP_N5m490BGqz7g_9i1g.png)

The validation begins with the first submit and with every following modification,
the password’s text field is only enabled when the second radio button is selected.

验证从第一个提交开始，后续的改变也会触发验证，
只有当第二个 radio button 选中时 passwd 的字段才有效。

---

Let’s start from the radio buttons, the binding in this case is done on the radio group:
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

---

Also in this case we used a custom binding, this time with a BindableBoolean
object. The binding with a Boolean is kind of forced, as it only works because
there are two radio buttons, it is still possible to define in a simple way
other types of binding too (for example with an int). The implementation of this
class and of the binding methods definition is very similar to the one we have
already seen regarding strings.

我们需要自定义一个 bind，这次使用一个 `BindableBoolean` 对象。因为这个 radio group 只有两个
button，所以我们这里使用了 boolean，你也可以使用其它的类型(比如 int)。这个 bind 的
和我们之前实现的 `BindableString` 很像。

---

Regarding text fields, an EditText within a TextInputLayout (available in the
   Design Support Library) was used. In the case of a text field with password,
   there are three bindings to handle:
- text: handled with a binding like in the previous example;
- error: this is another binding toward an item such as BindableString;
- enabled: in this case the binding is implemented with the same boolean used for
the RadioGroup, so to have an automatic update every time the user selects one of the two radio buttons.

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

---

The binding is implemented using a LoginInfo class containing the fields used within the layout:
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

---

The reset method must be invoked upon clicking on the corresponding button,
in this case I would have expected the possibility to specify the binding with
a syntax android:onClick=”@{loginInfo.reset}”. Right now this is impossible, to
 work the reset method should return a OnClickListener containing the logic to
  execute. Until now I have not been able to define custom binding to obtain
  something similar, it’s still in beta version, we will see whether this feature
   will be added in one of the next versions.

We can still use the object generated by the framework to add the listener:

点击 `reset` button 要调用 `reset` 方法，想要实现这个效果
reset 方法需要返回一个 `OnClickListener` 。如果可以使用一个
`android:onClick="@{loginInfo.reset}"` 来标注就好了，
但是目前的 Data Binding 还不可以，它还只是个测试版，
希望下个版本可以加入这个特性。
我们仍然用框架生成的 object 添加 listener:

```java
binding.reset.setOnClickListener(new View.OnClickListener() {
  @Override public void onClick(View v) {
    loginInfo.reset();
  }
  });
```

---

The self-generated binding object contains a field for every view present in the
layout in which an id is defined, in this way is it possible to completely avoid
 using findViewById method! Using the Data Binding makes frameworks like
 ButterKnife and Holdr less useful (the latter one is already deprecated).

It is worth noting that internally the framework doesn’t use the findViewById
method, in fact the code generated includes a method that searches all the views
using a single visit of the layout.

layout 中每一个设置了 id 的 view present 都会在自动生成的 binding 对象里有一个对应的字段，
可以避免使用 findViewById 方法。使用 Data Binding 弱化了 [ButterKnife][butterknife]
和 [Holdr][holdr] 这类框架的优势(Holdr 已经不推荐使用)。

值得注意的是框架内部并没有使用 `findViewById` 方法，在生成的代码中有一个方法，
可以遍历 layout，搜索所有 view。

EDIT: since version 1.0-rc1 a listener can be easily defined:
EDIT: 1.0-rc1 版本之后可以方便的定义一个 listener:

```xml
    android:onClick="@{loginInfo.reset}"
```

The signature of reset method must be compatible with onClick method of OnClickListener interface:
 a parameter of type View. This parameter can be avoided using a custom binding:

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

---

The second parameter is a Runnable, it’s just a placeholder for an interface with
a single method with no parameter.

A similar way is also used to handle the listener for validation, by adding it
 in the Activity on the email and password fields:

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

---

Within the LoginInfo class a boolean field was added to store the fact that the
user has already tried to log in. Validation occurs by checking such boolean so
that it doesn’t give errors while the user is still filling in the form:

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


In the click listener on the login button the boolean is set and the validation
is executed, if passed a message is shown to the user using the Snackbar class
(available in the design support library):

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

---

###Conclusions
###Conclusions

The Android framework for Data Binding is still in beta, internal support from
Android Studio is still partial and there are still room for improvement. However
it is very well designed and developed, and will change (in a good way!) the way
Android applications are written. The possibility to define custom attributes is
 very powerful, I am very curious to see how it will be used in third part libraries.
The complete source code of the examples viewed of this post is available on the
databinding repository on [GitHub][databinding].

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
