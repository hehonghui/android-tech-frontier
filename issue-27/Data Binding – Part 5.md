#数据绑定(Data Binding)-Part5
---

> * 原文链接 : [Data Binding - Part 5](https://blog.stylingandroid.com/data-binding-part-4/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

We’ve covered some pretty useful aspects of Data Binding so far but there is a feature that makes it even more powerful still: Observables.

Observables are really useful when it comes to data which may change over time. To demonstrate this let’s pretend that the Twitter API does not actually return the quoted status within the twitter4j.Status object and we need to perform a separate network call to retrieve it (Twitter doesn’t work like this, but indluge me!). It would not make sense to fetch these up-front, we should only retrieve those that the user wants to retrieve by tapping on the quoted status. We wired the click handler previously – so we would then need to retrieve the quoted status and then update the UI once it was retrieved.

Observables remove the need for us to have to refresh the UI manually when the underlying data changes. As the name suggests an Observable can be observed by another component and that component will receive a callback whenever the Observable changes.

While we can make the entire ModelView class an Observable we can also make individual fileds Observable for use-cases where only a part of the data is likely to change.

Let’s extend our ModelView class to add an additional field plus some methods whihc will allow us to change it:

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
    
We already created the field representing the quoted status and we used this previously to enable us to only display the quoted text box when the item has a quoted status, but we didn’t actually expose the quoted status data itself.

Next we’l change our click handler to toggle the contents of the Observable between set and null. If we did actually have to perform a network call here we would initiate it, update the UI to indicate a loading state, and then wait. When the network call completed we’d simply update the contents of the Observable.

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
    
Finally we’ll add the additional Views required to display the quoted status. These are pretty much identical to the ones we already have to display the main status – they are just bound to the values within the Observable instead. We also have some visibility bindings to toggle the visibility based on whether the Observable contains data or a null .data.Status object:

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
    
That’s it – we don’t need to do anything more. The UI will automatically update whenever the Observable changes:

[视频链接](https://youtu.be/LXXyFqJ8owo)

That completes our basic overview of the new Data Binding library. I must confess that I was initially skeptical when the Data Binding was announced as it immediately reminded me of JSP (and I still have the emotional scars from developing those). It is for this reason that I advocate keeping the actual logic outside of the layout files as much as possible. However having had a play with it for this series I am pleasantly surprised and it seems to do an awful lot right. Once it exits beta, I would certainly consider using it on commercial projects.


本文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part5)可以看到。