#Android MVVM模式

---
> * 原文链接 : [MVVM on Android using the Data Binding Library](http://stablekernel.com/blog/mvvm-on-android-using-the-data-binding-library/)
* 原文作者 : [Ross Hambrick](http://stablekernel.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [shenyansycn](https://github.com/shenyansycn)
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :   完成

Google 2015开发者大会终于来了，其中只有一个开发工具真的让我兴奋。我们看到了一系列的改善，例如Android M和以用户为中心的特性，Android Studio支持NDK（C/C++），矢量图，heap分析，改进的主题和layout编辑器，Gradle性能改善，等等。我高兴的是我们终于有了一个[Design Support Library][3] 可以实现[Material Design UI patterns][4]。但大多数这些都已经被其他社区工具和库实现。

有一件事是社区渴望的，但是还没有一个好的模式或工具，那就是如何在我们的项目中改进model和views相互协调的代码。直到现在，Activities和Fragment 通常包含许多脆弱的，不可检测的和乏味的与views关联的代码。但[Data Binding Library][6]改变了这一切。

自从这个新的库被公布，我就在工作中用到了，并深入的去发现它能做什么和不能做什么和你能做什么和不能做什么。我将目前学到的东西分享出来了，我也希望听到你的分享。

#目标和效率

我们应该对这个库感兴趣因为它允许我们用更多的方法处理views。这有助于去除那些索然无味的代码，而伴随着这些代码的很可能是与UI相关的bug。更少的代码意味着更少的错误，对吧？对的。

我的另一个更大的目标和某些社区需要的是一致的，那就是降低view和应用逻辑的单元测试消耗。测试总归是可以测试点，但它是如此艰难,需要这么多额外的工作,很多人(当然不是我)就跳过吧。这是我们做的更好的机会。

#MVVM

在这个library官方文档中，提供了一个例子直接绑定一个实体类User到layout的一个属性上。他们给你一个想法，你可以想象下边这样：


```xml
android:visibility="<strong>@{age &lt; 13 ? View.GONE : View.VISIBLE}</strong>"
```

但是我们这里要弄清楚：我没有推荐实体类直接绑定或者将逻辑放入这些绑定的layout文件中。如果你做了这些事情会更难测试view逻辑和调试。我们是相反的，更容易的测试和调试。

这是MVVM模式到来的情景。简化事情，通过在引进一个在绑定View和响应事件之间的ViewModel层解耦。ViewModel将是一个POJO（简单的面向对象）并且包含了和view相关的所有逻辑，使得[更容易的测试][7]和调试。在这个模式中，绑定将仅仅是一个ViewModel方法结果和View属性设置的一对一的映射。此外，这使测试和调试view在单元测试中是逻辑简单和可以实现的。

#项目设置

让我们开始吧。注意：我喜欢简洁或许会遗漏一些有用信息，所以我建议以[官方文档][9]作为参考。

增加这些依赖到你项目的**build.gradle**中：

```gradle
classpath 'com.android.databinding:dataBinder:1.0-rc1'
classpath 'com.neenbedankt.gradle.plugins:android-apt:1.4'
```

然后再你的app module的**build.gradle**文件中增加这些；

```gradle
apply plugin: 'com.android.databinding'
apply plugin: 'com.neenbedankt.android-apt'

dependencies {
  apt 'com.android.databinding:compiler:1.0-rc1'
}
```

*注意*：如果你有任何像dagger-compiler **provided** 依赖项，你为了阻止他们被添加到你的classpath中需要改变**provided** 为**apt**

官方文档中没有提到[android-apt][10]，但你会需要的。android-apt插件会使Android Studio在编译时知道生成的类。当试图调试问题时，这是至关重要的，了解更多绑定机制是如何工作的。

#绑定设置

用来接受初始化值和更新的view和接受来自View处理事件的ViewMdel是通过绑定实现的。Data Binding Library自动生成一个绑定类替你处理大部分的繁重工作。让我们看看绑定发生的细节。

#变量声明

在你的layout文件中，你需要添加一个新的顶层**layout**封装你已经存在的布局结构。其中第一个元素是一个**data**元素，包含了在你的布局绑定中用到的所有类型。

```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    <data>
        <variable name="viewModel" type="com.example.viewmodels.CustomerViewModel" />
    </data>
    ...
    <!-- the rest of your original layout here -->
</layout>
```

这里我们声明了一个**viewModel**变量，我们将稍后设置为我们Fragment的一个特定实例。

#绑定声明

我们可以使用这个**viewModel**做许多有趣的事情，它的内容绑定到layout的widget属性

```xml
<EditText
  android:layout_width="match_parent"
  android:layout_height="wrap_content"
  android:hint="@string/customer_name"
  android:inputType="textCapWords"
  android:text="@{viewModel.customerName}"
  app:enabled="@{viewModel.primaryInfoEnabled}"
  app:error="@{viewModel.nameError}"
  app:addTextChangedListener="@{viewModel.nameWatcher}"
  app:onFocusChangeListener="@{viewModel.nameFocusListener}" />
```

这里我们绑定了text值，enable状态，错误信息，text改变监听事件和焦点改变的监听事件。

*注意*：**android**命名空间可以在view的任何标准xml中使用。但是**app**命名空间必须在没有相对应的xml属性时被使用。同样，使用**app**命名空间代替**android**标准属性看起来像在IDE中去掉错误高亮提示。

**警告**：由于绑定代码产生的顺序，在生成的绑定代码中你应使用**text**属性的**android**命名空间预防排序问题。否则，在setError()后发生setText()的明显错误。

#ViewModel实现

现在让我们看下ViewModel中相对应的方法。ViewModel继承了**BaseObservable**(这不是必须的，但它帮你节省了很多工作)，公共方法的名字是layout要绑定的并且返回类型要与view的setter方法的类型一致。


```java
public class CustomerViewModel extends BaseObservable {

  public String getCustomerName() {
    return customer.getName();
  }

  public boolean isPrimaryInfoEnabled() {
    return editMode && !customer.isVerified();
  }

  @Bindable
  public String getNameError() {
    if (customer.getName().isEmpty()) {
      return "Must enter a customer name";
    }
    return null;
  }

  public TextWatcher getNameWatcher() {
    return new SimpleTextWatcher() {
      @Override
      public void onTextChanged(String text) {
        customer.setName(text);
      }
    };
  }

  public EditText.OnFocusChangeListener getNameFocusListener() {
    return (v, hasFocus) -> {
      if (!hasFocus) notifyPropertyChanged(BR.nameError);
    };
  }
}
```

第一个方法仅仅返回了一个值。第二个和第三个做了运算确定返回值。其余的观察者或监听者对view的改变做出反应。最伟大的是EditText被ViewModel的值自动填充，如果没有通过条件的验证显示一个错误并给ViewModel发送一个事件改变的更新通知。

#通知

注意上边的**validate()**方法。这个监听调用**notifyPropertyChanged(...)**。这将触发view重新绑定这个属性和可能显示一个然后返回错误。**BR**类是为你生成的，好像R文件。允许你在代码中引用可绑定的属性。更详细的通知不是可能的除非用 **@Bindable**注释属性。因为我在layout中仅指定了viewModel变量，它默认创建了唯一“bindable”值。

你也可以通过使用通用的**notifyChange()**方法触发view重新绑定所有的属性。

**小心的是，**当TextWatcher调用了**notifyChange()**会进入引起text重复调用的情况，哪个调用TextWatcher，哪个引起**notifyChange()**,你看看会发生什么。

这看起来像一个有下列情形的最好练习：

- 短路的通知周期将被查看，是否值在通知前发生了变更。

- 避免在view的自己通知自己发生了变更。如果其他view需要在这个情况下被通知，你需要绑定和通知再更细的级别

#统一处理。

到目前为止，我们建立的说明都相互做出了反应，做了对的事情。剩下的事情就是引导绑定途径。这个将在你的Activity或Fragment中。自从我用Fragment加载所有view，我将像这个样子。

```android
FragmentCustomerBinding binding = DataBindingUtil.bind(view);
viewModel.init(this, customerId);
binding.setViewModel(viewModel);
```

设想这里有一个添加了依赖的**viewModel**实例，并且知道如何通过ID进行加载Cusromer。我也通过这实现了一个监听接口，当Activity相关联的事情发生时fragment会被通知，像使用了FragmentManager，发送了一个Intent，结束当前Activity，等等。


#更进一步的说

我们看到了创建UI的基本构成反应ViewModel同时在变。因为你没有在更新UI浪费时间，你能花费时间做：

 - 利用ViewModel有效性开启或关闭按键状态。
 - 在Viewmodel中基于工作的完成显示或隐藏加载进度条。
 - 在你的逻辑的局限性的各个方面运用单元测试。

这里仍有一些不完善的地方，比如，你不能很容易的绑定ActionBar给ViewModel
（有可能放弃了旧的ActionBar接口而直接使用了Toolbar？）

我们在回到需要Activity Context的特定环境下。你能在ViewModel实现接口或设置Activity/Fragment作为一个监听。或者就是在Fragment中使用ViewModel和调用它的方法。每一种方法都能用ViewModel实现你的UI逻辑。

试想下现在Fragment你写的绑定代码，之前是什么样的，节省下来的时间，你可以用在ViewModel的[自动化测试][11]上面

#缺少了什么

这个库工作的很好但现在仍然是测试版。我期待它成熟并且提供更好的开发体验。这些是我想看到的：

 - CMD+B layout页面中的方法导航快捷键可以在ViewMode中使用
 - 出错的时候有更清晰的错误信息
 - layout中的自动完成和类型检查
 - 通过双向绑定来简化引用
 - 绑定支持AdapterViews


  [1]: http://android-developers.blogspot.com/2015/05/android-design-support-library.html
  [2]: http://www.google.com/design/spec/material-design/introduction.html
  [3]: http://android-developers.blogspot.com/2015/05/android-design-support-library.html
  [4]: http://www.google.com/design/spec/material-design/introduction.html
  [5]: https://developer.android.com/tools/data-binding/guide.html
  [6]: https://developer.android.com/tools/data-binding/guide.html
  [7]: http://stablekernel.com/blog/unit-testing-continuous-delivery-for-android-part-3/
  [8]: https://developer.android.com/tools/data-binding/guide.html
  [9]: https://developer.android.com/tools/data-binding/guide.html
  [10]: https://bitbucket.org/hvisser/android-apt
  [11]: http://stablekernel.com/blog/unit-testing-continuous-delivery-for-android-part-3/
