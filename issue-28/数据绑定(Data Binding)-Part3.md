#数据绑定(Data Binding)-Part3
---

> * 原文链接 : [Data Binding - Part 3](https://blog.stylingandroid.com/data-binding-part-3/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

**勘误：原文中使用ModelView一词，但实际上MVVM是Model-View-ViewModel，故应为ViewModel。**

在之前的文章中，我们使用Data Binding与布局中的`TextView`配合搭建了简单的App，并说到接下来将会加入图片的加载。这会比绑定文字更加麻烦，因为我们从Twitter服务器上拿下来的是URL而不是直接的图片。现在是时候介绍在MVVM模式中Model和ViewModel的区别了。在这个例子中，Model获取的是URL，但是View需要的是一个Bitmap，那么Model就需要转换成ViewModel来适应View的需求。要将他们进行如此细致的区分，是因为从url到Bitmap是一个比较并不简单的过程，需要根据url网络上去获取这个图片的具体内容。这部分的逻辑已经被我们将要使用的第三方图像加载库Glide封装了，不过我们还需要添加一些转换逻辑。

在这了使用Data Binding + RecyclerView还有一个原因。加载一幅网络图片的代价是很大的，如果你将一个List里面所有的图片都进行加载，而不论它是否要显示到屏幕上，这是非常浪费性能的。所以应该只加载要显示到屏幕上的图片，数据绑定也应该只在这种情况下进行。

我在上一篇中说了，我将使用Glide来进行图像加载。通过Glide，你可以使用以下这行简单的代码来实现图像的下载、转码、加载过程：

    Glide.with(context).load(url).into(imageView);

它会自动异步下载图片，并将它显示到`ImageView`上。Glide还能够帮你进行图片缓存等操作，不过我们在此处仅使用它最简单的图片加载功能。

现在看起来我们可以将Data Binding和ImageView结合起来了，这是一个很自然的想法，你可能会这么做：

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:app="http://schemas.android.com/apk/res-auto">
    
      <data>
    
        <variable
          name="status"
          type="com.stylingandroid.databinding.data.Status" />
    
        <variable
          name="glide"
          type="com.bumptech.glide.Glide" />
    
      </data>
    
      <RelativeLayout
        android:id="@+id/status_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
    
        <!--
          注意：这个里的Data Binding将不起作用
        -->
    
        <ImageView
          android:id="@+id/status_avatar"
          android:layout_width="64dp"
          android:layout_height="64dp"
          android:layout_alignParentLeft="true"
          android:layout_alignParentStart="true"
          android:layout_alignParentTop="true"
          android:layout_margin="8dip"
          android:contentDescription="@null"
          app:imageUrl="@{glide.load(status.imageUrl).into(this)}" />
        .
        .
        .
      </RelativeLayout>
    </layout>
    

这里实际上有一个问题，我们可以查看一下Data Binding的表达式文档：

    A few operations are missing from the expression syntax that you can use in Java.
    
    this
    super
    new
    Explicit generic invocation
    

你会发现：

>在Data Binding语句中，**`this`符号是不起作用的！**

虽然`this`没法使用了，但是我们可以用**自定义Setter**来替代它。当你希望为一个View定义特殊的Setter时可以这么干。你可以在自定义Setter里面利用Glide将获取的url转化成Bitmap显示到ImageVIew中。

这是一个自定义Setter的例子：

    public final class DataBinder {
    
        private DataBinder() {
            //NO-OP
        }
    
        @BindingAdapter("imageUrl")
        public static void setImageUrl(ImageView imageView, String url) {
            Context context = imageView.getContext();
            Glide.with(context).load(url).into(imageView);
        }
    }
    

以上是一个很简单的工具类，它里面有个函数名为`setImageView()`，以`ImageView`和`String`作为输入参数。不过你应该也注意到了，在这个函数上有一个注解：`@BindingAdapter("imageUrl")`，这个注解的作用是向Data Binding库声明了一个名为imageUrl的自定义Setter。我们不需要再做其他任何配置，这个注解会在编译时就帮我们打理好了一切。在加入这条注解之后，我们就可以在xml中使用它：

    <?xml version="1.0" encoding="utf-8"?>
    <layout xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:app="http://schemas.android.com/apk/res-auto">
    
      <data>
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
          app:imageUrl="@{status.imageUrl}"/>
        .
        .
        .
      </RelativeLayout>
    </layout>

这个Data Binding的自定义属性`imageUrl是`在app命名空间下的（也就是res-auto）。它仅仅需要一个参数——URL字符串，它所处的`ImageView`会自动加到自定义Setter中。在<data>中也不需要再做其他改动，甚至也不需要加入Glide实例变量。

这样就完成了我们的图像绑定和加载过程，如下图所示：

![Data Binding 3](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/data%20binding%203.png)

虽然解释了很多，实际上写的代码却很少——几行自定义Setter，再在layout文件中添加两行代码，就足够了！在下一篇文章中我们再看看怎么将Data Binding用在更加有意思的地方。

从我写这篇文章开始到现在已经有很多人利用自定义Setter做了很多有意思的事情。在Droidcon NYC会议上，Roman Nurik向我展示了与本文类似的代码。我的代码灵感来源于官方的Data Binding手册，特别是使用Picasso结合自定义Setter进行图像加载的那部分。看起来使用Glide比Picasso更容易去理解和使用自定义Setter，我相信除了我和Roman还有很多人会这么想，并且都会创作出类似的代码。

Lisa Wray利用自定义Setter做了一件很有意思的事情：她利用Data Binding为TextView绑定了字体属性！她的例子完美地展示了自定义Setter可以实现多么灵活的功能！

本文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part3)可以看到。