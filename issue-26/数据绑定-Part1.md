#数据绑定(Data Binding)-Part1
---

> * 原文链接 : [Data Binding - Part 1](https://blog.stylingandroid.com/data-binding-part-1/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: 
* 状态 : 未校对

At Google I/O 2015 a number of new Android libraries and tools were announced. One of them was the all new Data Binding library and in this series we’ll take a look at the library and explore some of the powerful features it provides.

2015年的Google I/O大会发布了很多新的Android库和工具，Data Binding就是其中之一。在本系列文章中，我们会探索它的强大之处。

Before we begin it is worth pointing out that, at the time of writing, the Data Binding library is still in beta so some of the API calls may change before the full release.

**值得注意的是：我写这篇文章的时候，Data Binding库正在测试中，所以很多API可能会在发布的时候有所改动。**

The Data Binding library provides a mechanism for linking the data which will be displayed within our layouts to some kind of back-und data source. For this example code we’re going to put together a very simple Twitter client and use the Data Binding library to the data coming from the Twitter API. I’m not going to provide a tutorial on the Twitter API, or the basic app design – it retrieves the last 50 items from your home timeline using the Twitter4J library and displays them within a RecyclerView. All of the code is published – so feel free to browse it to understand this side of the app. The part that is of interest for this series of articles is the data and how it gets bound to Views.

Data Binding库提供了一个链接待显示数据与UI组件的机制，将原本非常被动的数据变成某种形式的数据源。在本篇文章中我们使用一个非常简单的Twitter客户端作为例子，将Twitter API与Data Binding一起使用。我不会在这里介绍API以及App设计，我仅仅是使用Twitter4J库抽取了个人主页上的50条按时间排序的信息，并将他们展示在`RecyclerView`中。所有的代码都是公开发布的，你可以放心地使用它理解它。这里面最有意思的就是其中的数据及它们与View绑定的过程。

Let’s start by looking at the data model:

我们来看看这篇例子：

    public class Status {
    
        private final String name;
        private final String screenName;
        private final String text;
        private final String imageUrl;
    
        public Status(@NonNull String name, @NonNull String screenName, @NonNull String text, @NonNull String imageUrl) {
            this.name = name;
            this.screenName = screenName;
            this.text = text;
            this.imageUrl = imageUrl;
        }
    
        public String getName() {
            return name;
        }
    
        public String getScreenName() {
            return screenName;
        }
    
        public String getText() {
            return text;
        }
    
        public String getImageUrl() {
            return imageUrl;
        }
    }

This simply holds the values that we want to display to the user and each item in the RecyclerView will bind to a single Status object. This gets created from a twitter4j.Status object – which is a single tweet as retrieved by Twitter4J. So we also have a class which will convert a twitter4j.Status to our Status:

这个类维持了几个需要展示给用户的基本元素，每一个在`RecyclerView`中的单位都会绑定一个`Status`对象。它里面的信息可以从`twitter4j.Status`（由Twitter4j的API获取）中得到，所以我们还要创建一个将`twitter4j.Status`转化为`Status`的类：

    public class StatusMarshaller {
    
        public List<Status> marshall(List<twitter4j.Status> statuses) {
            List<Status> newStatuses = new ArrayList<>(statuses.size());
            for (twitter4j.Status status : statuses) {
                newStatuses.add(marshall(status));
            }
            return newStatuses;
        }
    
        private Status marshall(twitter4j.Status status) {
            User user = status.getUser();
            return new Status(user.getName(), user.getScreenName(), status.getText(), user.getBiggerProfileImageURL());
        }
    }

There’s really nothing very clever going on here – it’s pure Java stuff and nothing specific to Data Binding, or even Android, for that matter!

这里没有用到任何技巧，只是一个简单的Java操作，跟Data Binding无关，甚至跟Android也无关。

It’s worth pointing out that strictly speaking this is not required and we could actually bind the UI directly to the twitter4j.Status object – and that would certainly be more efficient for the early examples. However, the Data Binding library utilises an MVVM (Model-View-ViewModel) pattern – the Model is twitter4j.Status; the View is our layout (which we’ll come to shortly); and the ModelView is our Status object. The ViewModel is a representation of the data which is specifically designed with the View in mind – to make it easy to consume. While the Model and ViewModel are almost identical (as they are currently) it is difficult to see the benefit of this, but as we dig deeper the benefits of this should become apparent.

不过需要指出的是，我们本可以直接将View与`twitter4j.Status`绑定在一起，这样无疑效率会更高。但是Data Binding库使用了MVVM(Model-View-ViewModel)设计模式 - Model是`twitter4j.Status`，View是UI组件，ViewModel是我们的`Status`对象。ViewModel代表着专门为View设计的一个数据结构，它与View的适配性比Model更好。虽然Model与ViewModel很像，在目前你可能还感觉不出他们的区别，但是随着我们一步步深入下去，我相信你会明白这样设计的深意。

The next thing to look at is the Adapter for our RecyclerView:

接下来我们看一下`RecyclerView`的Adapter是怎么设计的：

    public class StatusAdapter extends RecyclerView.Adapter<StatusViewHolder> {
        private final List<Status> statuses;
        private final StatusMarshaller marshaller;
    
        public static StatusAdapter newInstance() {
            List<Status> statuses = new ArrayList<>();
            StatusMarshaller marshaller = new StatusMarshaller();
            return new StatusAdapter(statuses, marshaller);
        }
    
        StatusAdapter(List<Status> statuses, StatusMarshaller marshaller) {
            this.statuses = statuses;
            this.marshaller = marshaller;
        }
    
        @Override
        public StatusViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            Context context = parent.getContext();
            LayoutInflater inflater = LayoutInflater.from(context);
            View statusContainer = inflater.inflate(R.layout.status_item, parent, false);
            return new StatusViewHolder(statusContainer);
        }
    
        @Override
        public void onBindViewHolder(StatusViewHolder holder, int position) {
            Status status = statuses.get(position);
            holder.bind(status);
        }
    
        @Override
        public int getItemCount() {
            return statuses.size();
        }
    
        public void setStatuses(List<twitter4j.Status> statuses) {
            this.statuses.clear();
            this.statuses.addAll(marshaller.marshall(statuses));
            notifyDataSetChanged();
        }
    
    }

Now we’re into Android territory, but again there’s really nothing unusual going on – it is a standard RecyclerView.Adapter implementation with nothing specific to Data Binding – that gets done in the StatusViewHolder as we’ll see shortly – but as far as the Adapter is concerned this is just a standard RecyclerView.ViewHolder. The only thing that is really happening here that’s specific to the MVVM pattern is the marshalling from twitter4j.Status to .data.Status in setStatuses(). So let’s now turn our attention to the item layout:

终于看到了跟Android有关的地方了吧，实际上也没什么特殊的地方——这只是一个基本的`RecyclerView.Adapter`而已，跟Data Binding其实关系不大。这里面唯一跟MVVM有关系的就是在`setStatuses()`中将`twitter4j.Status`转换成`Status`。我们马上将会在StatusViewHolder中看到怎么进行数据绑定，首先我们来看看layout是怎么定义的。

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android">
    
      <data>
    
        <import type="android.view.View" />
    
        <variable
          name="status"
          type="com.stylingandroid.databinding.data.Status" />
    
      </data>
    
      <RelativeLayout
        android:id="@+id/status_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
    
        <ImageView
          android:id="@+id/status_avatar"
          android:layout_width="64dp"
          android:layout_height="64dp"
          android:layout_alignParentLeft="true"
          android:layout_alignParentStart="true"
          android:layout_alignParentTop="true"
          android:layout_margin="8dip"
          android:contentDescription="@null" />
    
        <TextView
          android:id="@+id/status_name"
          style="@style/Status.Name"
          android:layout_width="wrap_content"
          android:layout_height="wrap_content"
          android:layout_alignParentTop="true"
          android:layout_marginTop="8dip"
          android:layout_toEndOf="@id/status_avatar"
          android:layout_toRightOf="@id/status_avatar"
          android:text="@{status.name}" />
    
        <TextView
          android:id="@+id/status_screen_name"
          style="@style/Status.ScreenName"
          android:layout_width="wrap_content"
          android:layout_height="wrap_content"
          android:layout_alignBaseline="@id/status_name"
          android:layout_marginLeft="4dip"
          android:layout_marginStart="4dip"
          android:layout_toEndOf="@id/status_name"
          android:layout_toRightOf="@id/status_name"
          android:text="@{&quot;@&quot; + status.screenName}" />
    
        <TextView
          android:id="@+id/status_text"
          style="@style/Status.Text"
          android:layout_width="match_parent"
          android:layout_height="wrap_content"
          android:layout_alignLeft="@id/status_name"
          android:layout_alignParentEnd="true"
          android:layout_alignParentRight="true"
          android:layout_alignStart="@id/status_name"
          android:layout_below="@id/status_name"
          android:maxLines="2"
          android:singleLine="false"
          android:text="@{status.text}" />
    
      </RelativeLayout>
    </layout>

This is where we get to the heart of how the Data Binding library works. The RelativeLayout with the ID status_container is a pretty standard layout (but some of the Views have some weird stuff in some of their attributes, which we’ll come to in a moment). But this parent layout is wrapped in its own <layout> parent which is specific to the Data Binding library. As well as the RelativeLayout, the <layout> also contains a data section which defines the data objects that we’re going to bind to – in this case we’re declaring a .data.Status named status. We can now reference this throughout the layout.

这部分代码是Data Binding运作的核心。其中id为`status_container`的`RelativeLayout`是一个普通的layout控件，但是它的父控件`<layout>`就不是那么熟悉了。`<layout>`是Data Binding库的一个组件，它含有一个`<data>`子组件说明了需要绑定的数据对象（在此处为`Status`），然后我们就可以在此layout中引用该数据对象。

So within the layout we have the weird android:text attributes – these are essentially getters from our .data.Status object. The @{} wrapper indicates that this is a data binding expression, and the status.name is the equivalent of calling status.getName() in Java. That’s the heart of how Data Binding works but there’s an awful lot more to it that that as we shall see.

在此不居中我们的`android:text`属性可能跟你正常情况下使用的不大一样-他们其实都使用了`Status`中的getter。使用`@{}`包装说明这是一个Data Binding表达式，`status.name`等同于Java中的`status.getName()`。这是Data Binding工作的核心，但是这只是冰山一角，它还有更多有趣的功能值得我们探索。

But there is something a bit more complex going on in the TextView with ID status_screen_name: @{&quot;@&quot; + status.screenName}. Although this looks quote scary, all it is is some simple string concatenation to prepend a ‘@’ symbol to the Twitter screen name. We need to put the @ inside quotes which need to be escaped within an XML layout, but essentially all it is doing is: "@" + status.getScreenName(); in Java. However this does further hint that there is rather more that we can do with this expression language, as we’ll find out as we progress.

你看id为`status_screen_name`的TextView，它的text设置为`@{&quot;@&quot; + status.screenName}`。你可能看到觉得很困惑，实际上`&quot;@&quot;`就代表着@，用`&quot;`将它包装起来是为了防止@被xml转义。这个语句告诉我们Data Binding语句是很强大的，我们会进一步挖掘它的强大之处。

Now that we have this defined we need to hook it up, and this is done through the StatusViewHolder:

在定义完layout之后，我们需要将它和实际对象结合，这也是`StatusViewHolder`做的事：

    public class StatusViewHolder extends RecyclerView.ViewHolder {
        private StatusItemBinding binding;
    
        public StatusViewHolder(View itemView) {
            super(itemView);
            binding = DataBindingUtil.bind(itemView);
        }
    
        public void bind(Status status) {
            binding.setStatus(status);
        }
    
    }

That’s a lot simpler than a normal ViewHolder where we need to find the child Views within the parent layout in the constructor and then set their attributes in the bind() method. The first thing to notice is that we’re using StatusItemBinding which we’re obtaining from DataBindingUtil.bind(), but we haven’t covered that. The reason is that we don’t need to write it because it is generated for us by the Data Binding library.

它比正常使用的`ViewHolder`（我们通常用它维持子View对象）更简单一点，在`bind()`方法中将对象赋予它绑定的layout。我们要注意到我们使用了`StatusItemBinding`并在`DataBindingUtil.bind()`函数中获取到它，不过这是Data Binding库生成的，我们不仅需要去自己写它。

We’ll cover what this in a bit more depth in the next article, but we actually have a basic, working app at this point:

在下一章中我们会讨论更多的细节，不过此处我们已经有一个基本的应用能够让你对data binding的作用有一定认识：

![part-1](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/Part11.png)

The source code for this article is available [here](https://github.com/StylingAndroid/DataBinding/tree/Part1).

本文章中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part1)可以看到。