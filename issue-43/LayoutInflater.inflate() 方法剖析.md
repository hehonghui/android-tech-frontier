LayoutInflater.inflate() 方法剖析
---

> * 原文链接 : [Understanding Android's LayoutInflater.inflate()](https://www.bignerdranch.com/blog/understanding-androids-layoutinflater-inflate/)
* 原文作者 : [Sean Farrell](https://www.bignerdranch.com/about-us/nerds/sean-farrell/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



It’s easy to get comfortable with boilerplate setup code, so much so that we gloss over the finer details. I’ve experienced this with LayoutInflater (which coverts an XML layout file into corresponding ViewGroups and Widgets) and the way it inflates Views inside Fragment’s onCreateView() method. Upon looking for clarification in Google documentation and discussion on the rest of the web, I noticed that many others were not only unsure of the specifics of LayoutInflater’s inflate() method, but were completely misusing it.

程序员很容易满足于写模板代码，因为这样最省事，但不愿走出舒适区，沉溺于这样的生活的话，往往会忽略许多细节，而我就是其中一员。LayoutInflater 相信没有 Android 开发者会陌生，它能将 xml 布局转化为相应的视图（如：ViewGroup 和 Widget），它还可以在 Fragment 的 onCreateView() 方法里面初始化 Fragment 的布局。在阅读了 Google 给出的有关 LayoutInflater 的文档说明以及网上对它的讨论，我发现有许多开发者都不了解 LayoutInflater 的 inflate() 的细节，而且一直以错误的方式使用它。

Much of the confusion may come from Google’s vague documentation in regards to attachToRoot, the optional third parameter of the inflate() method.

> Whether the inflated hierarchy should be attached to the root parameter? If false, root is only used to create the correct subclass of LayoutParams for the root view of the XML.

Maybe the confusion comes from a statement that ends in a question mark?

使用 inflate() 方法的困惑大多来自 Google 文档对该方法的第三个参数 - attachToRoot 模糊的解释。

> 被初始化的视图布局是否应该添加到方法的第二个参数 ViewGroup root 上？如果不应该，root 只能被用于创建根布局所使用的 LayoutParams。

The general gist is this: If attachToRoot is set to true, then the layout file specified in the first parameter is inflated and attached to the ViewGroup specified in the second parameter.

如果 attachToRoot 为 true，那么作为参数传入的 xml 布局就会被初始化，并添加到方法的第二个参数 - ViewGroup 上。

Then the method returns this combined View, with the ViewGroup as the root. When attachToRoot is false, the layout file from the first parameter is inflated and returned as a View. The root of the returned View would simply be the root specified in the layout file. In either case, the ViewGroup’s LayoutParams are needed to correctly size and position the View created from the layout file.

而 inflate() 方法将返回该组合后的 View，该 View 的根布局就是该 ViewGroup。而当 attachToRoot 为 false，xml 布局将被初始化且作为 inflate() 方法的返回值返回。但此时该 View 的根布局是 xml 文件中的根布局，而不是 inflate() 方法的第二个参数 ViewGroup 所对应的布局。不管怎样，ViewGroup 的 LayoutParams 都需要准确地按照该 xml 布局显示视图。

Passing in true for attachToRoot results in a layout file’s inflated View being added to the ViewGroup right on the spot. Passing in false for attachToRoot means that the View created from the layout file will get added to the ViewGroup in some other way.

Let’s break down both scenarios with plenty of examples so we can better understand.

将 attachToRoot 设为 true 使得 xml 布局被添加到参数的 ViewGroup 中；将它设为 false，会使该布局以其他方式被添加到 ViewGroup 中。

##attachToRoot Set to True
##将 attachToRoot 设为 true
Imagine we specified a button in an XML layout file with its layout width and layout height set to match_parent.

假设我们在 xml 布局中显示一个 Button，其 width 和 height 都是 match_parent

```xml
<Button xmlns:android="http://schemas.android.com/apk/res/android"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:id="@+id/custom_button">
</Button>
```

We now want to programmatically add this Button to a LinearLayout inside of a Fragment or Activity. If our LinearLayout is already a member variable, mLinearLayout, we can simply add the button with the following:

现在我们要把该 Button 添加到 Activity/Fragment 中的 LinearLayout，假设此时 LinearLayout 已经是 Activity/Fragment 的成员，那么我们可以这样实现：

```java
inflater.inflate(R.layout.custom_button, mLinearLayout, true);
```

We specified that we want to inflate the Button from its layout resource file; we then tell the LayoutInflater that we want to attach it to mLinearLayout. Our layout parameters are honored because we know the Button gets added to a LinearLayout. The Button’s layout params type should be LinearLayout.LayoutParams.

The following would also be equivalent. LayoutInflater’s two parameter inflate() method automatically sets attachToRoot to true for us.

我们让 inflate() 方法通过 xml 文件得到 Button 布局，且通过设置 attachToRoot 让 LayoutInflater 将 Button 添加到 mLinearLayout 中，Button 的 LayoutParams 应该是 LinearLayout.LayoutParams。

同样的，下面的方法和上面的效果一样，因为该方法默认将 attachToRoot 设为 true。

```java
inflater.inflate(R.layout.custom_button, mLinearLayout);
```

Another appropriate use of passing true for attachToRoot is a custom View. Let’s look at an example where a layout file uses a <merge> tag for its root. Using a <merge> tag signifies that the layout file allows for flexibility in terms of the type of root ViewGroup it may have.

其他将 attachToRoot 设为 true 的正确用法是传入自定义 View，在下面的例子里，xml 布局中使用了 <merge> 标签允许布局将它里面嵌套的 View 直接 include 到它的父布局中，而没有多加一层 ViewGroup，减小了 ViewTree 的深度。

```java
public class MyCustomView extends LinearLayout {
    ...
    private void init() {
        LayoutInflater inflater = LayoutInflater.from(getContext());
        inflater.inflate(R.layout.view_with_merge_tag, this);
    }
}
```

This is a perfect use for a true attachToRoot parameter. The layout file does not have a root ViewGroup in this example, so we specify our custom LinearLayout to be its root. If our layout file had a FrameLayout as its root instead of <merge>, the FrameLayout and its children would inflate as normal. Then the FrameLayout and children would get added to the LinearLayout, leaving the LinearLayout as the root ViewGroup containing the FrameLayout and children.

这样就是将 attachToRoot 设为 true 的完美用法了，布局文件没有设置 ViewGroup 去容纳控件，使得我们能将自定义的 LinearLayout 设为该布局的容器。如果我们没有使用 <merge> 标签，而是将 FrameLayout 设置为它的根布局，那么初始化完成的工作和政策情况是一样的。该 FrameLayout 和 子元素都会被添加到 LinearLayout 中，LinearLayout 将作为根 ViewGroup 容纳 FrameLayout。

##attachToRoot Set to False
##将 attachToRoot 设为 false
Let’s take a look at when you would want to set attachToRoot to false. In this scenario, the View specified in the first parameter of inflate() is not attached to the ViewGroup in the second parameter at this point in time.

Recall our Button example from earlier, where we want to attach a custom Button from a layout file to mLinearLayout. We can still attach our Button to mLinearLayout by passing in false for attachToRoot—we just manually add it ourselves afterward.

现在不妨学习应该在何时将 attachToRoot 设为 false 吧。此时，View 将不会被添加到第二个参数传递的 ViewGroup 中。

回忆前面的例子吧，我们可以通过下面的办法将该 Button 布局添加到 LinearLayout 中。

```java
Button button = (Button) inflater.inflate(R.layout.custom_button, mLinearLayout, false);
mLinearLayout.addView(button);
```

These two lines of code are equivalent to what we wrote earlier in one line of code when we passed in true for attachToRoot. By passing in false, we say that we do not want to attach our View to the root ViewGroup just yet. We are saying that it will happen at some other point in time. In this example, the other point in time is simply the addView() method used immediately below inflation.

这两行代码和我们之前将 attachToRoot 设为 true 时一行代码完成的工作相同，将 attachToRoot 设为 false，意味着我们表示：不想将 View 添加到根 ViewGroup 中。但如果想添加到根 ViewGroup 中的话，通过 addView() 方法就可以实现。

The false attachToRoot example requires a bit more work when we manually add the View to a ViewGroup. Adding our Button to our LinearLayout was more convenient with one line of code when attachToRoot was true. Let’s look at some scenarios that absolutely require attachToRoot to be false.

虽说将 attachToRoot 设为 false 时，想要将 Button 添加到 ViewGroup 写的代码要比将 attachToRoot 设为 true 要多一些，但有些情况是必须将 attachToRoot 设为 false 的。

A RecyclerView’s children should be inflated with attachToRoot passed in as false. The child views are inflated in onCreateViewHolder().

例如 RecyclerView 在 onCreateViewHolder() 方法中初始化子布局时就必须将 attachToRoot 设为 false

```java
public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    LayoutInflater inflater = LayoutInflater.from(getActivity());
    View view = inflater.inflate(android.R.layout.list_item_recyclerView, parent, false);
    return new ViewHolder(view);
}
```

RecyclerViews, not us, are responsible for determining when to inflate and present its child Views. The attachToRoot parameter should be false anytime we are not responsible for adding a View to a ViewGroup.

何时初始化子布局，何时显示子布局，由 RecyclerView 决定，因此，将 View 添加到 ViewGroup 中的职责就不该由我们完成，所以 attachToRoot 就应该设为 false。

When inflating and returning a Fragment’s View in onCreateView(), be sure to pass in false for attachToRoot. If you pass in true, you will get an IllegalStateException because the specified child already has a parent. You should have specified where your Fragment’s view will be placed back in your Activity. It is the FragmentManager’s job to add, remove and replace Fragments.

当在 Fragment 的 onCreateView() 中初始化并返回布局时，必须将 attachToRoot 设为 false，不然会抛出 IllegalStateException，因为该 View 已经属于某个父布局了。

```java
FragmentManager fragmentManager = getSupportFragmentManager();
Fragment fragment = fragmentManager.findFragmentById(R.id.root_viewGroup);

if (fragment == null) {
    fragment = new MainFragment();
    fragmentManager.beginTransaction()
        .add(R.id.root_viewGroup, fragment)
        .commit();
}
```

The root_viewGroup container that will hold your Fragment in your Activity is the ViewGroup parameter given to you in onCreateView() in your Fragment. It’s also the ViewGroup you pass into LayoutInflater.inflate(). The FragmentManager will handle attaching your Fragment’s View to this ViewGroup, however. You do not want to attach it twice. Set attachToRoot to false.

root_viewGroup 将在 Activity 中显示 Fragment，同时是 onCreateView() 中的 ViewGroup 参数，同时也是 inflate() 方法中的 ViewGroup 参数。将 Fragment 的 View 添加到 ViewGroup 的任务由 FragmentManager 完成，如果你不想两次进行该添加操作，就把 attachToRoot 设为 false 吧。

```java
public View onCreateView(LayoutInflater inflater, ViewGroup parentViewGroup, Bundle savedInstanceState) {
    View view = inflater.inflate(R.layout.fragment_layout, parentViewGroup, false);
    …
    return view;
}
```

Why are we given our Fragment’s parent ViewGroup in the first place if we don’t want to attach it in onCreateView()? Why does the inflate() method request a root ViewGroup?
It turns out that even when we are not immediately adding our newly inflated View to its parent ViewGroup, we should still use the parent’s LayoutParams in order for the new View to determine its size and position whenever it is eventually attached.

如果我们不想在 onCreateView() 中将它添加到 ViewGroup 中，为什么要在参数中提供 ViewGroup 参数呢？为什么 inflate() 方法需要根 ViewGroup？即使我们没有在初始化 View 后立刻将它添加到它的父 ViewGroup 中，我们也需要使用父 ViewGroup 的 LayoutParams 来初始化 View 的布局，即使它不会被添加到该 ViewGroup 中。

You are bound to run into some poor advice about LayoutInflater on the web. Some people will advise you to pass in null for the root ViewGroup if you are going to pass in false for attachToRoot. However, if the parent is available, you should pass it in.

网上有很多有关 LayoutInflater 的用法，如果你想将 attachToRoot 设为 false，就将 ViewGroup 参数那填入 null。但如果父 ViewGroup 是可用的，还是应该将它填入该方法。

![](https://www.bignerdranch.com/img/blog/2016/02/null-root.png)

Lint will now warn you not to pass in null for root. Your app won’t crash in this scenario, but it can misbehave. When your child View doesn’t know the correct LayoutParams for its root ViewGroup, it will try to determine them on its own using generateDefaultLayoutParams.
These default LayoutParams might not be what you desired. The LayoutParams that you specified in XML will get ignored. We might have specified that our child View should match the width of our parent View, but ended up with our parent View wrapping its own content and ending up much smaller than we expected.

Lint 会警告你别填入 null，虽说 App 不会因此崩溃，但可能会出现些问题。当 View 不知道 ViewGroup 的 LayoutParams 到底该是什么时，它会尝试通过自身的 generateDefaultLayoutParams 判断。而这些默认的 LayoutParams 可能不是你想要的。你在 xml 文件中设置的 LayoutParams 都会被无视，导致布局不是你想要的。

There are a few scenarios in which you will not have a root ViewGroup to pass into inflate(). When creating a custom View for an AlertDialog, you do not yet have access to its parent.

下面是你没有 ViewGroup 可传递的具体的场景。

```java
AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(mContext);
View customView = inflater.inflate(R.layout.custom_alert_dialog, null);
...
dialogBuilder.setView(customView);
dialogBuilder.show();
```

In this case, it is okay to pass in null for the root ViewGroup. It turns out that the AlertDialog would override any LayoutParams to match_parent anyway. However, the general rule of thumb is to pass in the parent if you’re able to do so.

这种情况下，传递 null 是没有问题的，因为 AlertDialog 将 LayoutParams 重载，使得无论如何都是 match_parent。但通常情况下，你都是要传入父 ViewGroup 的。

##Avoiding Crashes, Misbehaviors and Misunderstandings
##避免崩溃，错误布局以及对 LayoutInflater 的误解
Hopefully this post helps you avoid crashes, misbehaviors and misunderstandings when using LayoutInflater. Here are some key takeaways for different uses in certain circumstances:

希望这篇博文能帮你避免崩溃、错误布局以及对 LayoutInflater 的误解，下面是一些建议：

- If you have a parent to pass into the root ViewGroup parameter, do so.
- 如果你有可传递的根 ViewGroup，那就传递
- Try to avoid passing in null for the root ViewGroup.
- 避免在 ViewGroup 参数那填入 null
- Pass in false for the attachToRoot parameter when we are not the ones responsible for attaching our layout file’s View to its root ViewGroup.
- 当添加 View 到 ViewGroup 的职责不由我们负责时，attachToRoot 就设为 false
- Do not pass in true for a View that has already been attached to a ViewGroup.
- 若 View 已经被添加到 ViewGroup 中，别将 attachToRoot 设为 true
- Custom Views are a good use case to pass in true for attachToRoot.
- 自定义 View 很适合将 attachToRoot 设为 true