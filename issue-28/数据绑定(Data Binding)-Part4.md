#数据绑定(Data Binding)-Part4
---

> * 原文链接 : [Data Binding - Part 4](https://blog.stylingandroid.com/data-binding-part-4/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

为了探索Data Binding的能力，我们现在要利用它来改变View的其他属性。在阅读后面的内容之前你需要了解我们新引入的一个数据概念：转发状态。每一条Twitter都可能是原创或者转发，Twitter API会返回一个twitter4j.Status对象来表示被转发的状态(若发表的状态不是转发则为空)，我们将它加入到自己的数据结构Status中：

    public class Status {
        private final String name;
        private final String screenName;
        private final String text;
        private final String imageUrl;
        private final Status quotedStatus;
     
        public Status(@NonNull String name, @NonNull String screenName, @NonNull String text, @NonNull String imageUrl, @Nullable Status quotedStatus) {
            this.name = name;
            this.screenName = screenName;
            this.text = text;
            this.imageUrl = imageUrl;
            this.quotedStatus = quotedStatus;
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
     
        public boolean hasQuotedStatus() {
            return quotedStatus != null;
        }
    }

我们还加入了`hasQuotedStatus()`这个函数来查看是否此条状态是转发别人状态的。

同时也要将新加入的字段转化逻辑加入`Marshaller`中：

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
            Status quotedStatus = null;
            if (status.getQuotedStatus() != null) {
                quotedStatus = marshall(status.getQuotedStatus());
            }
            return new Status(user.getName(), user.getScreenName(), status.getText(), user.getBiggerProfileImageURL(), quotedStatus);
        }
    }

值得注意的是：并不是每条Tweet状态都是转发的。=所以我们需要在存在转发的时候显示转发布局，在原创状态时隐藏转发布局。我们可以根据`Status.hasQuotedStatus()`改变`android:visibility`来实现这个功能：

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:app="http://schemas.android.com/apk/res-auto">
     
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
          android:contentDescription="@null"
          app:imageUrl="@{status.imageUrl}" />
     
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
     
        <RelativeLayout
          android:id="@+id/status_quoted"
          android:layout_width="match_parent"
          android:layout_height="wrap_content"
          android:layout_alignLeft="@id/status_text"
          android:layout_alignStart="@id/status_text"
          android:layout_below="@id/status_text"
          android:layout_marginTop="8dp"
          android:background="@color/light_grey"
          android:padding="8dp"
          android:visibility="@{status.hasQuotedStatus ? View.VISIBLE : View.GONE}">
     
          <TextView
            android:id="@+id/quoted_tap"
            style="@style/Status.Name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentLeft="true"
            android:layout_alignParentStart="true"
            android:layout_alignParentTop="true"
            android:text="@string/tap_to_load" />
        </RelativeLayout>
     
      </RelativeLayout>
    </layout>

很简单吧！我们只要在Data Binding语句中通过`hasQuotedStatus()`来判断是否有转发，再设置`android:visibility`即可。由于Data Binding库事先并不知道View类中的常量定义值，所以需要在`<data>`中显式import View类。你可以将它看做类似Java的import语句。

实际上我不喜欢用**三元运算符**，我认为这种表达不利于debug。我个人倾向于使用自定义Setter去实现情景判断的逻辑，至少这样下可以设置断点进行调试。但为了表达Data Binding语言的能力，在这里使用了三元运算符。

**Data Binding语法还可以为View添加事件响应！**为实现这个功能，首先需要定义一个类来处理响应逻辑：

    public class ClickHandler {
        private final Status status;
        public ClickHandler(Status status) {
            this.status = status;
        }
        public void onClick(View view) {
            Snackbar.make(view, "Item clicked", Snackbar.LENGTH_LONG).show();
        }
    }

它初始化需要传入`Status`。在这里就先使用一个最简单的按键响应作为例子：点击View弹出SnackBar。

我们来看看在layout文件中是怎么将`ClickHandler`与Data Binding配合使用的吧：

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:app="http://schemas.android.com/apk/res-auto">

      <data>
        <import type="android.view.View" />
        <variable
          name="status"
          type="com.stylingandroid.databinding.data.Status" />
        <variable
          name="handler"
          type="com.stylingandroid.databinding.ClickHandler" />
      </data>

      <RelativeLayout
        android:id="@+id/status_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        .
        .
        .
        <RelativeLayout
          android:id="@+id/status_quoted"
          android:layout_width="match_parent"
          android:layout_height="wrap_content"
          android:layout_alignLeft="@id/status_text"
          android:layout_alignStart="@id/status_text"
          android:layout_below="@id/status_text"
          android:layout_marginTop="8dp"
          android:background="@color/light_grey"
          android:onClick="@{handler.onClick}"
          android:padding="8dp"
          android:visibility="@{status.hasQuotedStatus ? View.VISIBLE : View.GONE}">

          <TextView
            android:id="@+id/quoted_tap"
            style="@style/Status.Name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentLeft="true"
            android:layout_alignParentStart="true"
            android:layout_alignParentTop="true"
            android:text="@string/tap_to_load" />
        </RelativeLayout>
      </RelativeLayout>
    </layout>

你会注意到在`<data>`中引入了一个新的变量`handler`，它代表着一个`ClickHandler`实例。设置`android:onClick`属性为`@{handler.onClick}`后，当该布局被点击时就会调用`ClickHandler.onClick()`。

由于新引入了变量`handler`，所以需要在`StatusViewHolder`中对它进行初始化：

    public class StatusViewHolder extends RecyclerView.ViewHolder {
        private StatusItemBinding binding;
        public StatusViewHolder(View itemView) {
            super(itemView);
            binding = DataBindingUtil.bind(itemView);
        }
        public void bind(Status status) {
            binding.setStatus(status);
            binding.setHandler(new ClickHandler(status));
        }
    }

现在你会发现，仅仅只有一些发布的状态会显示转发那部分的布局，并且点击转发布局后会弹出Snackbar！你可以从这段视频中看到我们的demo app运行方式：

[视频原始地址(Youtube，需翻墙)](https://www.youtube.com/watch?v=Tawl0E6qtfg&feature=youtu.be)

译者下载了该youtube视频，发布到[优酷](http://v.youku.com/v_show/id_XMTM2MTI1Mzk0NA==.html)上方便读者观看：

<embed src="http://player.youku.com/player.php/sid/XMTM2MTI1Mzk0NA==/v.swf" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>

这篇文章展示了Data Binding的重要用法：我们可以在View的点击事件中绑定Model，这也是MVVM重要特性之一。为什么这个功能这么有用，我们将在下节分解。

本文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part4)。