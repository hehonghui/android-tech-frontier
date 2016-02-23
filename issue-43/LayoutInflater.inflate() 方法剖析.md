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

Much of the confusion may come from Google’s vague documentation in regards to attachToRoot, the optional third parameter of the inflate() method.

> Whether the inflated hierarchy should be attached to the root parameter? If false, root is only used to create the correct subclass of LayoutParams for the root view of the XML.

Maybe the confusion comes from a statement that ends in a question mark?

The general gist is this: If attachToRoot is set to true, then the layout file specified in the first parameter is inflated and attached to the ViewGroup specified in the second parameter.

Then the method returns this combined View, with the ViewGroup as the root. When attachToRoot is false, the layout file from the first parameter is inflated and returned as a View. The root of the returned View would simply be the root specified in the layout file. In either case, the ViewGroup’s LayoutParams are needed to correctly size and position the View created from the layout file.

Passing in true for attachToRoot results in a layout file’s inflated View being added to the ViewGroup right on the spot. Passing in false for attachToRoot means that the View created from the layout file will get added to the ViewGroup in some other way.

Let’s break down both scenarios with plenty of examples so we can better understand.

##attachToRoot Set to True
Imagine we specified a button in an XML layout file with its layout width and layout height set to match_parent.

```xml
<Button xmlns:android="http://schemas.android.com/apk/res/android"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:id="@+id/custom_button">
</Button>
```

We now want to programmatically add this Button to a LinearLayout inside of a Fragment or Activity. If our LinearLayout is already a member variable, mLinearLayout, we can simply add the button with the following:

```java
inflater.inflate(R.layout.custom_button, mLinearLayout, true);
```

We specified that we want to inflate the Button from its layout resource file; we then tell the LayoutInflater that we want to attach it to mLinearLayout. Our layout parameters are honored because we know the Button gets added to a LinearLayout. The Button’s layout params type should be LinearLayout.LayoutParams.

The following would also be equivalent. LayoutInflater’s two parameter inflate() method automatically sets attachToRoot to true for us.

```java
inflater.inflate(R.layout.custom_button, mLinearLayout);
```

Another appropriate use of passing true for attachToRoot is a custom View. Let’s look at an example where a layout file uses a <merge> tag for its root. Using a <merge> tag signifies that the layout file allows for flexibility in terms of the type of root ViewGroup it may have.

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

##attachToRoot Set to False
Let’s take a look at when you would want to set attachToRoot to false. In this scenario, the View specified in the first parameter of inflate() is not attached to the ViewGroup in the second parameter at this point in time.

Recall our Button example from earlier, where we want to attach a custom Button from a layout file to mLinearLayout. We can still attach our Button to mLinearLayout by passing in false for attachToRoot—we just manually add it ourselves afterward.

```java
Button button = (Button) inflater.inflate(R.layout.custom_button, mLinearLayout, false);
mLinearLayout.addView(button);
```

These two lines of code are equivalent to what we wrote earlier in one line of code when we passed in true for attachToRoot. By passing in false, we say that we do not want to attach our View to the root ViewGroup just yet. We are saying that it will happen at some other point in time. In this example, the other point in time is simply the addView() method used immediately below inflation.

The false attachToRoot example requires a bit more work when we manually add the View to a ViewGroup. Adding our Button to our LinearLayout was more convenient with one line of code when attachToRoot was true. Let’s look at some scenarios that absolutely require attachToRoot to be false.

A RecyclerView’s children should be inflated with attachToRoot passed in as false. The child views are inflated in onCreateViewHolder().

```java
public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    LayoutInflater inflater = LayoutInflater.from(getActivity());
    View view = inflater.inflate(android.R.layout.list_item_recyclerView, parent, false);
    return new ViewHolder(view);
}
```

RecyclerViews, not us, are responsible for determining when to inflate and present its child Views. The attachToRoot parameter should be false anytime we are not responsible for adding a View to a ViewGroup.

When inflating and returning a Fragment’s View in onCreateView(), be sure to pass in false for attachToRoot. If you pass in true, you will get an IllegalStateException because the specified child already has a parent. You should have specified where your Fragment’s view will be placed back in your Activity. It is the FragmentManager’s job to add, remove and replace Fragments.

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

```java
public View onCreateView(LayoutInflater inflater, ViewGroup parentViewGroup, Bundle savedInstanceState) {
    View view = inflater.inflate(R.layout.fragment_layout, parentViewGroup, false);
    …
    return view;
}
```

Why are we given our Fragment’s parent ViewGroup in the first place if we don’t want to attach it in onCreateView()? Why does the inflate() method request a root ViewGroup?
It turns out that even when we are not immediately adding our newly inflated View to its parent ViewGroup, we should still use the parent’s LayoutParams in order for the new View to determine its size and position whenever it is eventually attached.

You are bound to run into some poor advice about LayoutInflater on the web. Some people will advise you to pass in null for the root ViewGroup if you are going to pass in false for attachToRoot. However, if the parent is available, you should pass it in.

![](https://www.bignerdranch.com/img/blog/2016/02/null-root.png)

Lint will now warn you not to pass in null for root. Your app won’t crash in this scenario, but it can misbehave. When your child View doesn’t know the correct LayoutParams for its root ViewGroup, it will try to determine them on its own using generateDefaultLayoutParams.
These default LayoutParams might not be what you desired. The LayoutParams that you specified in XML will get ignored. We might have specified that our child View should match the width of our parent View, but ended up with our parent View wrapping its own content and ending up much smaller than we expected.

There are a few scenarios in which you will not have a root ViewGroup to pass into inflate(). When creating a custom View for an AlertDialog, you do not yet have access to its parent.

```java
AlertDialog.Builder dialogBuilder = new AlertDialog.Builder(mContext);
View customView = inflater.inflate(R.layout.custom_alert_dialog, null);
...
dialogBuilder.setView(customView);
dialogBuilder.show();
```

In this case, it is okay to pass in null for the root ViewGroup. It turns out that the AlertDialog would override any LayoutParams to match_parent anyway. However, the general rule of thumb is to pass in the parent if you’re able to do so.

##Avoiding Crashes, Misbehaviors and Misunderstandings
Hopefully this post helps you avoid crashes, misbehaviors and misunderstandings when using LayoutInflater. Here are some key takeaways for different uses in certain circumstances:

- If you have a parent to pass into the root ViewGroup parameter, do so.
- Try to avoid passing in null for the root ViewGroup.
- Pass in false for the attachToRoot parameter when we are not the ones responsible for attaching our layout file’s View to its root ViewGroup.
- Do not pass in true for a View that has already been attached to a ViewGroup.
- Custom Views are a good use case to pass in true for attachToRoot.