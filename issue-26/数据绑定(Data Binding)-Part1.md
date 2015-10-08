#数据绑定(Data Binding)-Part1
---

> * 原文链接 : [Data Binding - Part 1](https://blog.stylingandroid.com/data-binding-part-1/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

2015年的Google I/O大会发布了很多新的Android库和工具，Data Binding就是其中之一。在本系列文章中，我们会探索它的强大之处。

**值得注意的是：我写这篇文章的时候，Data Binding库正在测试中，所以很多API可能会在发布的时候有所改动。**

Data Binding库提供了一个链接待显示数据与UI组件的机制，将原本非常被动的数据变成某种形式的数据源。在本篇文章中我们使用一个非常简单的Twitter客户端作为例子，将Twitter API与Data Binding一起使用。我不会在这里介绍API以及App设计，我仅仅是使用Twitter4J库抽取了你的Twitter主页上50条按时间排序的信息，并将他们展示在`RecyclerView`中。所有的代码都是公开发布的，你可以放心地使用它理解它。这里面最有意思的就是其中的数据及它们与View绑定的过程。

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

这里没有用到任何技巧，只是一个简单的Java操作，跟Data Binding无关，甚至跟Android也无关。

不过需要指出的是，我们本可以直接将View与`twitter4j.Status`绑定在一起，这样无疑效率会更高。但是Data Binding库使用了MVVM(Model-View-ViewModel)设计模式 - Model是`twitter4j.Status`，View是UI组件，ViewModel是我们的`Status`对象。ViewModel代表着专门为View设计的一个数据结构，它与View的适配性比Model更好。虽然Model与ViewModel很像，在目前你可能还感觉不出他们的区别，但是随着我们一步步深入下去，我相信你会明白这样设计的深意。

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

终于看到了跟Android有关的地方了吧，实际上没什么特殊的地方——这只是一个基本的`RecyclerView.Adapter`而已，跟Data Binding其实关系不大。这里面唯一跟MVVM有关系的就是在`setStatuses()`中将`twitter4j.Status`转换成`Status`。我们马上将会在StatusViewHolder中看到怎么进行数据绑定，首先我们来看看layout是怎么定义的。

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

这部分代码是Data Binding运作的核心。其中id为`status_container`的`RelativeLayout`是一个普通的layout控件，但是它的父控件`<layout>`就不是那么熟悉了。`<layout>`是Data Binding库的一个组件，它含有一个`<data>`子组件说明了需要绑定的数据对象（在此处为`Status`），然后我们就可以在此layout中引用该数据对象。

在此布局中TextView的`android:text`属性值可能跟你正常见到样子的不大一样-它们其实都使用了`Status`中的getter。使用`@{}`包装说明这是一个Data Binding表达式，`status.name`等同于Java中的`status.getName()`。这是Data Binding工作的核心，但是这只是冰山一角，它还有更多有趣的功能值得我们探索。

你看id为`status_screen_name`的TextView，它的text设置为`@{&quot;@&quot; + status.screenName}`。你可能看到觉得很困惑，实际上`&quot;@&quot;`就代表着@，用`&quot;`将它包装起来是为了防止@被xml转义。这个语句告诉我们Data Binding语句是很强大的，我们会进一步挖掘它的强大之处。

在定义完layout之后，需要将它和实际数据对象结合，这也是`StatusViewHolder`做的事：

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

它比正常使用的`ViewHolder`（通常用于维持子View对象）更简单一点，在`bind()`方法中将对象赋予它绑定的layout。首先要注意到我们使用了`StatusItemBinding`，可以通过`DataBindingUtil.bind()`函数获取到它，这个函数及`StatusItenBinding`类都是Data Binding库生成的。

在下一章中我们会讨论更多的细节，不过此处我们已经有一个基本的应用能够让你对data binding的作用有一定认识：

![part-1](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/Part11.png)

本文章中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part1)可以看到。