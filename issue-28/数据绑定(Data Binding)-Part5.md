#数据绑定(Data Binding)-Part5
---

> * 原文链接 : [Data Binding - Part 5](https://blog.stylingandroid.com/data-binding-part-5/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

直到现在，我们已经见识到Data Binding的很多功能了。但是还有一个很强大的特点没有介绍，那就是观察者模式的应用。

观察者模式在数据会变化的时候非常有用。为了演示这个功能，我们假设Twiter API返回的`twitter4j.Status`中不会返回被转发的状态，并需要通过额外的网络请求来获取被转发的状态。并且在获取`twitter4j.Status`的同时去获取这条引用状态的话与之前的工作就没有区别了，我们要让用户在点击该条转发状态时，显示被转发的状态。之前已经展示过了怎么在Data Binding中使用点击响应，那么这次的工作就是在点击的时候获取被转发的状态，并更新UI。

应用观察者模式能够在数据更新的时候自动更新UI内容。每一个`Observable`是可以被许多个观察者(`Observer`)“观察”的，只要`Observable`的内容改变，它就会调用每一个观察者的回调函数，从而做出相应的应对。

我们可以让`Model`中的相关类变成`Observable`，或者也可以仅仅让类里面有可能发生改变的域变成`Observable`。

现在扩展一下`Status`类：

    public class Status {
    
        private final String name;
        private final String screenName;
        private final String text;
        private final String imageUrl;
        private final Status quotedStatus;
        private ObservableField<Status> observableQuotedStatus;
    
        public Status(@NonNull String name, @NonNull String screenName, @NonNull String text, @NonNull String imageUrl, @Nullable Status quotedStatus) {
            this.name = name;
            this.screenName = screenName;
            this.text = text;
            this.imageUrl = imageUrl;
            this.quotedStatus = quotedStatus;
            observableQuotedStatus = new ObservableField<>();
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
    
        public void updateQuotedStatus() {
            observableQuotedStatus.set(quotedStatus);
        }
    
        public void clearQuotedStatus() {
            observableQuotedStatus.set(null);
        }
    
        public ObservableField<Status> getObservableQuotedStatus() {
            return observableQuotedStatus;
        }
    }
    

之前我们已经在Status里面加入了被转发的状态对象，它会在存在的时候显示到界面上。而这一次，我们没有把它直接暴露给外部，而是将其包装在了`ObservableFiled`中，通过`updateQuotedStatus()`来获得。

我们将在点击事件中将`Observable`在set与null状态之间转换。如果这部分需要进行网络请求，你可以在开始网络请求的时候更新UI至一个等待状态，在网络请求返回的时候再更新UI。

    public class ClickHandler {
        private final Status status;
     
        public ClickHandler(Status status) {
            this.status = status;
        }
     
        public void onClick(View view) {
            if (status.getObservableQuotedStatus().get() == null) {
                status.updateQuotedStatus();
            } else {
                status.clearQuotedStatus();
            }
        }
    }
    

最后我们需要为转发布局绑定变量。它和之前的布局代码十分相似，区别只不过绑定的对象是`Observable`而已。并且它会根据`Observable`变量是否为null值来判断是否要显示在屏幕上。

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
            android:text="@string/tap_to_load"
            android:visibility="@{status.observableQuotedStatus == null ? View.VISIBLE : View.GONE}" />
    
          <ImageView
            android:id="@+id/quoted_status_avatar"
            android:layout_width="64dp"
            android:layout_height="64dp"
            android:layout_alignParentLeft="true"
            android:layout_alignParentStart="true"
            android:layout_alignParentTop="true"
            android:contentDescription="@null"
            android:visibility="@{status.observableQuotedStatus == null ? View.GONE : View.VISIBLE}"
            app:imageUrl="@{status.observableQuotedStatus.imageUrl}" />
    
          <TextView
            android:id="@+id/quoted_status_name"
            style="@style/Status.Name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignParentTop="true"
            android:layout_marginLeft="8dp"
            android:layout_marginStart="8dp"
            android:layout_toEndOf="@id/quoted_status_avatar"
            android:layout_toRightOf="@id/quoted_status_avatar"
            android:text="@{status.observableQuotedStatus.name}"
            android:visibility="@{status.observableQuotedStatus == null ? View.GONE : View.VISIBLE}" />
    
          <TextView
            android:id="@+id/quoted_status_screen_name"
            style="@style/Status.ScreenName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignBaseline="@id/quoted_status_name"
            android:layout_marginLeft="4dip"
            android:layout_marginStart="4dip"
            android:layout_toEndOf="@id/quoted_status_name"
            android:layout_toRightOf="@id/quoted_status_name"
            android:text="@{&quot;@&quot; + status.observableQuotedStatus.screenName}"
            android:visibility="@{status.observableQuotedStatus == null ? View.GONE : View.VISIBLE}" />
    
          <TextView
            android:id="@+id/quoted_status_text"
            style="@style/Status.Text"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_alignLeft="@id/quoted_status_name"
            android:layout_alignStart="@id/quoted_status_name"
            android:layout_below="@id/quoted_status_name"
            android:singleLine="false"
            android:text="@{status.observableQuotedStatus.text}"
            android:visibility="@{status.observableQuotedStatus == null ? View.GONE : View.VISIBLE}" />
        </RelativeLayout>
    
      </RelativeLayout>
    </layout>
    

这样就做好了全部工作，UI界面会在网络请求返回的时候自动更新！以下是Demo视频链接：

[Demo视频链接 From Youtube](https://youtu.be/LXXyFqJ8owo)

[Demo视频链接 From Youku](http://v.youku.com/v_show/id_XMTM2MzMwNzU0OA==.html)

至此我们就将Data Binding库的基本功能都介绍完毕了。我要承认，一开始我对Data Binding的使用是持怀疑态度的，因为它让我联想到了JSP。所以我并不支持大家在layout布局文件中加入太多代码逻辑。但是在使用了这个库之后，我发现它太强大了，在布局文件中嵌入代码逻辑的好处也是显而易见的。当它结束测试正式发布之后，我一定会考虑将其应用到商业工程中！

本文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part5)可以看到。