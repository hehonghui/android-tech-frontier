#Android MVVM模式

---
> * 原文链接 : [MVVM on Android using the Data Binding Library](http://stablekernel.com/blog/mvvm-on-android-using-the-data-binding-library/)
> * 译者 : [shenyansycn](https://github.com/shenyansycn)
> * 校对 : 


Google I/O 2015 has come and gone now, only leaving in its tracks one developer tool that really gets me excited.  We saw an array of nice incremental improvements announced.  Like Android M and its various user-centric features, NDK (C/C++) support in Android Studio (if you’re into that kinda thing), image generation from vector files, heap analysis, improved theme and layout editors, Gradle performance improvements, etc.  I am pleased we finally have a [Design Support Library][1] so we can implement the [Material Design UI patterns][2] we’ve been guided toward for about a year now.  But most of these things were already being done in one form or another by leveraging community tools and libraries.

Google 2015开发者大会终于来了，其中只有一个开发工具真的让我兴奋。有了一些改善。像Android M和它的用户中心特征，Android Studio支持NDK（C/C++），矢量图，heap分析，改进的主题和layout编辑器，Gradle性能改善，等等。我高兴的是我们终于有了一个[Design Support Library][3] 可以实现[Material Design UI patterns][4]。但大多数这些都已经被其他社区工具和库实现。

One thing however that the community’s been craving, but hasn’t come to a good set of patterns or tools on, is how to improve the code that coordinates between the model and the views inside our projects.  Until now, Activities and Fragments have typically contained a ton of fragile, untestable and uninteresting code to work with views.  But that all changes with the [Data Binding Library][5].

然而，一件事是社区渴望的，但是还没有一个好的模式或工具，是如何在我们的项目中改进model和views相互协调的代码。直到现在，Activities和Fragment 通常包含许多脆弱的，不可检测的和乏味的与views关联的代码。但[Data Binding Library][6]改变了这一切。

Since this new library was announced, I’ve worked with it in depth to find out what it can and can’t do and how you should and shouldn’t use it.  I’ll share what I’ve learned so far, and I’d love to hear what you’ve discovered as well.

自从这个新的库被公布，我就在工作中用到了，并深入的去发现它能做什么和不能做什么和你能做什么和不能做什么。我将分享我所学到的，并且同样的我喜欢听到你的发现。

Goals and Benefits

目标和效率

We should all be interested in this library because it will allow us to be more declarative in the way we work with our views.  Going declarative should help remove a lot of the code that’s not very fun to write, and along with it, a lot of pesky UI orchestration bugs that result.  Less code means less bugs, right?  Right.

我们应该对这个库感兴趣因为它允许我们用更多的方法处理views。去声明有助于消除大量的写的不是很好的代码，和他一样结果是许多错误的UI编配。更少的代码意味着更少的错误，对吧？对的。

Another big goal of mine and something the community needs, is lower friction unit testing for our view and application logic.  It’s always been possible to have tests here, but it’s been so hard and required so much additional work that a lot of us (not me of course) just skip right over them. This is our opportunity to do better.

我的另一个更大的目标和某些社区需要的是降低view和应用逻辑的单元测试消耗。总是在这里可以测试,但它是如此艰难,需要这么多额外的工作,很多人(当然不是我)就跳过吧。这是我们做的更好的机会。

MVVM

In the official docs for this library, they give you an example of directly binding a domain entity properties from  User  to attributes in the layout.  And they give you the idea that you can do fancy things like this:

在这个library官方文档中，提供了一个例子直接绑定一个实体类User到layout的一个属性上。他们给你一个想法，你可以想象下边这样：


```java
android:visibility="<strong>@{age &lt; 13 ? View.GONE : View.VISIBLE}</strong>"
```
But let’s be really clear here: I don’t recommend binding directly to domain entities or putting logic into those bindings in the layout file.  If you do either of those things, it will make it harder to test your view logic and harder to debug.  What we’re after is the opposite: easier to test and debug.

但是我们这里要弄清楚：我没有推荐实体类直接绑定或者将逻辑放入这些绑定的layout文件中。如果你做了这些事情会更难测试view逻辑和调试。我们是相反的，更容易的测试和调试。

That’s where the MVVM pattern comes into the picture.  To over-simplify things, this will decouple our Views from the Model by introducing a ViewModel layer in between that binds to the View and reacts to events.  This ViewModel will be a POJO and contain all the logic for our view, making it easy to test and debug.  With this pattern, the binding will only be a one-to-one mapping from the result of a ViewModel method into the setter of that View property.  Again, this makes testing and debugging our view logic easy and possible inside of a JUnit test.

这是MVVM模式到来的情景。简化事情，通过在引进一个在绑定View和响应事件之间的ViewModel层解耦。ViewModel将是一个POJO（简单的面向对象）并且包含了和view相关的所有逻辑，使得[更容易的测试][7]和调试。在这个模式中，绑定将仅仅是一个ViewModel方法结果和View属性设置的一对一的映射。此外，这使测试和调试view在单元测试中是逻辑简单和可以实现的。

Project Setup

项目设置

Let’s get to it then.  NOTE: I’ll probably skip over some useful information here in the interest of brevity, so I recommend referencing the [official docs][8].

让我们开始吧。注意：我喜欢简洁或许会遗漏一些有用信息，所以我建议以[官方文档][9]作为参考。


Start off by adding these dependencies to your project’s build.gradle:

增加这些依赖到你项目的**build.gradle**中：

```android
classpath 'com.android.databinding:dataBinder:1.0-rc1'
classpath 'com.neenbedankt.gradle.plugins:android-apt:1.4'
```
And then add this to your app module’s build.gradle:

然后再你的app module的**build.gradle**文件中增加这些；

```android
apply plugin: 'com.android.databinding'
apply plugin: 'com.neenbedankt.android-apt'
 
dependencies {
  apt 'com.android.databinding:compiler:1.0-rc1'
}
```
NOTE: if you have any  **provided** dependencies like dagger-compiler, you will now need to change the **provided**  keyword to **apt** to prevent them from being added to your classpath.

注意：如果你有任何像dagger-compiler **provided** 依赖项，你为了阻止他们被添加到你的classpath中需要改变**provided** 为**apt**

The official docs don’t mention android-apt anywhere, but you will want it.  The android-apt plugin will make Android Studio aware of classes generated during the build process.  This becomes crucial when trying to debug issues and learn more about how the binding mechanism works.

官方文档中没有提到[android-apt][10]，但你会需要的。android-apt插件会使Android Studio在编译时知道生成的类。当试图调试问题时，这是至关重要的，了解更多绑定机制是如何工作的。

Binding Setup

绑定设置

The mechanism by which your View will receive it’s initial values and updates, and by which your ViewModel will handle events from the View, is through bindings.  The Data Binding Library will automatically generate a binding class that will do all most of the hard work for you.  Let’s look at the pieces required for this binding to occur.

用来接受初始化值和更新的view和接受来自View处理事件的ViewMdel是通过绑定实现的。Data Binding Library自动生成一个绑定类替你处理大部分的繁重工作。让我们看看绑定发生的细节。

Variable Declarations

变量声明

In your layout files, you will need to add a new top level  layout wrapper element around your existing layout structure.  The first element inside of this will be a  data element which will contain the types you will be working with in your layout bindings.

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
Here, we declared a  viewModel variable that we will later set to a specific instance inside our Fragment.

这里我们声明了一个**viewModel**变量，我们将稍后设置为我们Fragment的一个特定实例。

Binding Declarations
绑定声明

We can now use this viewModel  variable to do lots of interesting things by binding its properties to our layout widget attributes.

我们可以使用这个**viewModel**做许多有趣的事情，它的内容绑定到layout的widget属性

```android
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
Here, we’re binding the text value, enabled state, error message, a text changed listener and a focus change listener.

这里我们绑定了text值，enable状态，错误信息，text改变监听事件和焦点改变的监听事件。

NOTE: the **android** namespace can be used for any standard xml attribute on a view, but the **app** namespace must be used to map to setters that do not have a corresponding xml attribute.  Also, using the **app** namespace instead of **android**  for standard attributes seems to remove error highlighting in the IDE.

注意：**android**命名空间可以在view的任何标准xml中使用。但是**app**命名空间必须在没有相对应的xml属性时被使用。同样，使用**app**命名空间代替**android**标准属性看起来像在IDE中去掉错误高亮提示。

WARNING: due to the order in which the binding code is generated, you will want to use the android namespace for the text attribute to prevent ordering issues inside the generated binding code.  Otherwise, the setText() will happen after the setError() and clear the error.

**警告**：由于绑定代码产生的顺序，在生成的绑定代码中你应使用**text**属性的**android**命名空间预防排序问题。否则，在setError()后发生setText()的明显错误。

ViewModel Implementation

ViewModel实现

Now, let’s look at the corresponding methods on the ViewModel that will be bound to the view properties.  The ViewModel extends BaseObservable  (it doesn’t have to, but it saves you a lot of work), exposes public methods whose name matches the name in the layout binding and the return type matches the type expected by the view setter method being bound to.

现在让我们看下ViewModel中相对应的方法。ViewModel继承了**BaseObservable**(这不是必须的，但它帮你节省了很多工作)，公共方法的名字是layout要绑定的并且返回类型要与view的setter方法的类型一致。


```android
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
The first method is just doing a simple delegation to a domain entity to get the return value. The second and third are performing some logic to determine the return value. The rest are returning watchers or listeners to react to changes in the view.  The great thing here is that this EditText will automatically get populated with the value from the ViewModel, show an error if it doesn’t pass validation rules and send updates back to the ViewModel as things change.

第一个方法仅仅返回了一个值。第二个和第三个做了运算确定返回值。其余的观察者或监听者对view的改变做出反应。最伟大的是EditText被ViewModel的值自动填充，如果没有通过条件的验证显示一个错误并给ViewModel发送一个事件改变的更新通知。

Notifications

通知

Notice in the validate()  method above, the listener calls notifyPropertyChanged(...) . This will trigger the view to rebind the property and potentially show an error if one is then returned.  The  BR  class is generated for you, much like the R  file, to allow you to reference bindable properties in code. This granular notification isn’t possible unless you annotate the property with @Bindable.  Since we only specified the viewModel variable in the layout, it’s the only “bindable” value it creates by default.

注意上边的**validate()**方法。这个监听调用**notifyPropertyChanged(...)**。这将触发view重新绑定这个属性和可能显示一个然后返回错误。**BR**类是为你生成的，好像R文件。允许你在代码中引用可绑定的属性。更详细的通知不是可能的除非用 **@Bindable**注释属性。因为我在layout中仅指定了viewModel变量，它默认创建了唯一“bindable”值。

You can also trigger the view to rebind all of its properties by using the more generic  notifyChange() method.

你也可以通过使用通用的**notifyChange()**方法触发view重新绑定所有的属性。

Be careful here.  You can get into situations where you have a TextWatcher that calls  notifyChange()  which causes the text to be rebound, which triggers the TextWatcher, which causes a notifyChange() , which… you see where this is going?

小心的是，当TextWatcher调用了**notifyChange()**会进入引起text重复调用的情况，哪个调用TextWatcher，哪个引起**notifyChange()**,你看看会发生什么。

It seems like best practices here will be one of the following:

这看起来像一个有下列情形的最好练习：

- Short circuit the notification cycle by checking to see if the value actually changed before notifying.

- 短路的通知周期将被查看，是否值在通知前发生了变更。

- Avoid notifying the views that changed inside their own change listeners.  If other views need to be notified in this situation, you will need to bind and notify at a more granular level.
Bringing it all together

- 避免在view的自己通知自己发生了变更。如果其他view需要在这个情况下被通知，你需要绑定和通知再更细的级别，统一处理。

So far we’ve set up the declarative pieces that will all react to each other and do the right thing.  The only thing left is to bootstrap the bind mechanism.  This will happen inside your Activity or Fragment.  Since I use Fragments for all my views, I’ll show what that looks like.

到目前为止，我们建立的说明都相互做出了反应，做了对的事情。剩下的事情就是引导绑定途径。这个将在你的Activity或Fragment中。自从我用Fragment加载所有view，我将像这个样子。

```android
FragmentCustomerBinding binding = DataBindingUtil.bind(view);
viewModel.init(this, customerId);
binding.setViewModel(viewModel);
```
Assumptions here are that I’ve had a viewModel instance injected with its required dependencies and that the viewModel  knows how to load the Customer based on a given ID.  I also pass this in as an implementation of a listener interface so the fragment can be notified when Activity related things need to happen, like using the FragmentManager, sending an Intent, finishing the current Activity, and so on.

设想这里有一个添加了依赖的**viewModel**实例，并且知道如何通过ID进行加载Cusromer。我也通过这实现了一个监听接口，当Activity相关联的事情发生时fragment会被通知，像使用了FragmentManager，发送了一个Intent，结束当前Activity，等等。

Taking it further

更进一步的说

We looked at the basic building blocks of creating a UI that reacts to changes in the ViewModel as they are changing.  Since you aren’t on the hook for writing the code that updates the UI, you can spend your time creating:

我们看到了创建UI的基本构成反应ViewModel同时在变。因为你没有在更新UI浪费时间，你能花费时间做：

Buttons that enable/disable based on the validity of the ViewModel



Loading indicators that show/hide based on work being done in the ViewModel



Unit tests that exercise every aspect of your view’s logic
Limitations

 - 利用ViewModel有效性开启或关闭按键状态。
 - 在Viewmodel中基于工作的完成显示或隐藏加载进度条。
 - 在你的逻辑的局限性的各个方面运用单元测试。

There are still some things that don’t seem to be handled well in this new binding world.  For example, you can’t easily bind an ActionBar to a ViewModel.  (Maybe forgoing the old ActionBar interface and just using a Toolbar directly could help?)

这里仍有一些不完善的地方，比如，你不能很容易的绑定ActionBar给ViewModel
（有可能放弃了旧的ActionBar接口而直接使用了Toolbar？）



You will also need to delegate back to the Activity for framework-specific things that require the Activity Context.  (Which is a lot!)  You could inject interface implementations into your ViewModels or set the Activity/Fragment as a listener on your ViewModel, or just use the ViewModel inside the fragment and call methods on it.  Either way, you can still use a ViewModel to house all your view logic and delegate out as needed.

我们在回到需要Activity Context的特定环境下。你能在ViewModel实现接口或设置Activity/Fragment作为一个监听。或者就是在Fragment中使用ViewModel和调用它的方法。每一种方法都能用ViewModel实现你的UI逻辑。



Just think of the Fragment now as the place where you have to write your manual binding code -   which is what it always was before, except now with all the time you save not writing most of that code, you can spend on the writing automated tests for your ViewModel!

试想下现在Fragment你写的绑定代码，之前是什么样的，节省下来的时间，你可以用在ViewModel的[自动化测试][11]上面

What’s Missing

缺少了什么

This library works very well but is still in beta, and you can tell when you use it.  I look forward to seeing it mature and provide a better developer experience.  Some of the things I look forward to seeing:

这个库工作的很好但现在仍然是测试版。我期待它成熟并且提供更好的开发体验。这些是我想看到的：

CMD+B navigation from method in Layout to the method in the ViewModel
Clearer error messages when something goes wrong
Auto complete and type checking inside the layout file
Reduced boilerplate by combining standard two-way binding functionality
Binding support for going from collections to AdapterViews
 

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