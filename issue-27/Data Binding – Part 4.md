#数据绑定(Data Binding)-Part4
---

> * 原文链接 : [Data Binding - Part 4](https://blog.stylingandroid.com/data-binding-part-4/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

The next thing that we’ll turn our attention to is actually changing other aspects of the Views within out layout. To facilitate this we’ll introduce something new in our data model. The Twitter API includes the concept of quoted tweets – where one user quotes someone else’s tweet and these are included in the twitter4j.Status object as an child twitter4j.Status object which represents the tweet being quoted. So we’ll add this to our .data.Status class:

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

We’ve also added a hasQuotedStatus() method so we can check whether a given status has a quoted status.

We also need to add this to the marshaller:

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

The important thing is that the quoted tweet is optional – some tweets will contain a quoted tweet, but most will not. Therefore we need a way to show and hide the View components which will be used to display the quoted status. We can do this by changing the visibility of those views depending on whether the .data.Status object being bound to contains a quoted status:

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

This is pretty simple – we evaluate the hasQuotedStatus() method which we just defined, and use a ternary expression to set the visibility accordingly. The Data Binding library does not implicitly know about the constants defined in the View class, so we need to import it to provide that visibility. This is roughly equivalent to a Java import.

I would point out that I’m not a huge fan of using ternary expressions in this way because they will be much trickier to debug. Personally I would be included to use a custom setter to actually implement the conditional logic (upon which you can set a breakpoint). However, in the interests of showing more details of the expression language I have used ternary expression in the example code.

The next thing we can do is add some event handling – the text we added to the placeholder box for the quoted status says “Tap to load tweet” so we’re obviously going to beed some click handling logic. Once again we can do this through Data Binding .Let’s first define a click handler:

    public class ClickHandler {
        private final Status status;
        public ClickHandler(Status status) {
            this.status = status;
        }
        public void onClick(View view) {
            Snackbar.make(view, "Item clicked", Snackbar.LENGTH_LONG).show();
        }
    }

This will be initialised with the .data.Status representing the tweet containing the quoted status – we’ll need this later on. For now we’ll just display a simple Snackbar message.

We need to hook up this click handler in our layout:

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

We first have to introduce a new variable which is an instance of the ClickHandler we just created, and then we can set this to be invoked when the quoted status container layout is tapped.

As we’ve introduced a new variable, we need to initialise this in the StatusViewHolder:

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

If we run this we can see that only some tweets display the quoted tweet container, and if we tap on one we get the Snackbar message appear – so our both conditional display logic and our click handling are working:

[视频链接](https://youtu.be/Tawl0E6qtfg)

The important thing that this click handling gives us is that we have a reference to the Data being bound to when we’re processing the click event and this is an important aspect of the MVVM pattern because it gives us to alter the ModelView at this point. We’ll cover why that is useful in the next article.

The source code for this article is available here.

本文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part4)可以看到。