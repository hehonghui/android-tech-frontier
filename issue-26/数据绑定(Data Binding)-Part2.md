#数据绑定(Data Binding)-Part2
---

> * 原文链接 : [Data Binding - Part 2](https://blog.stylingandroid.com/data-binding-part-2/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: 

Previously we got a basic Twitter client working, but the simplicity of the ViewHolder implementation made it a little difficult to quite understand why. So we’ll take a look at what the Data Binding library is doing for us and how it actually works.

在之前我们做了一个简单的Twitter客户端，但是简单地介绍ViewHolder实现可能没有很好地让你明白Data Binding的使用方法。那么我们现在就来看看怎么样将Data Binding引入到项目中。

The first thing to mention is that we need to add a dependency to the buildscript of the build.gradle in our top level project:

首先我们要在**工程目录**下的gradle脚本添加依赖：
     
    buildscript {
        repositories {
            jcenter()
        }
        dependencies {
            classpath 'com.android.tools.build:gradle:1.3.0'
            classpath "com.android.databinding:dataBinder:1.0-rc1"
        }
    }
     
    allprojects {
        repositories {
            jcenter()
        }
    }

In the build.gradle for the Android application sub-project we apply a build plugin:

在要使用到Data Binding的module下的gradle脚本中添加依赖：

    apply plugin: 'com.android.application'
    apply plugin: 'com.android.databinding'
     
    android {
        compileSdkVersion 23
        buildToolsVersion "23.0.0"
     
        defaultConfig {
            applicationId "com.stylingandroid.databinding"
            minSdkVersion 7
            targetSdkVersion 23
            versionCode 1
            versionName "1.0"
     
            buildConfigField 'String', 'TWITTER_CONSUMER_KEY', "\"${twitterConsumerKey}\""
            buildConfigField 'String', 'TWITTER_CONSUMER_SECRET', "\"${twitterConsumerSecret}\""
            buildConfigField 'String', 'TWITTER_ACCESS_KEY', "\"${twitterAccessKey}\""
            buildConfigField 'String', 'TWITTER_ACCESS_SECRET', "\"${twitterAccessSecret}\""
        }
        buildTypes {
            release {
                minifyEnabled false
                proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            }
        }
        packagingOptions {
            exclude 'META-INF/LICENSE.txt'
        }
        lintOptions {
            disable 'InvalidPackage'
        }
    }
     
    dependencies {
        compile 'com.android.support:support-annotations:23.0.0'
        compile 'com.android.support:design:23.0.0'
        compile 'com.android.support:appcompat-v7:23.0.0'
        compile 'com.android.support:recyclerview-v7:23.0.0'
        compile 'org.twitter4j:twitter4j-core:4.0.4'
        compile 'org.twitter4j:twitter4j-async:4.0.4'
        compile 'com.github.bumptech.glide:glide:3.6.1'
    }
    
An important thing to note here is that there is no compile dependency on the Data Binding library – it is simply a build level addition.

你会发现在后面这个gradle脚本中没有添加data binding依赖——它实际上是在构建项目的时候附加的工具。

This should give something of a clue as to what may be happening. Essentially the Data Binding library is a code generation pass which is performed during the build and generates much of the boiler-plate code usually associated with binding data to Views.

你应该在这个操作方法中领悟到一些东西：实际上Data Binding只是一个代码生成工具，它会在build项目的时候生成一些绑定View和数据对象的模板代码。

In our case, it parses the layout files and detects the <layout> wrapper in layout/status_item.xml (which we discussed in the first article). Based upon the name of this file, it automatically generated a data binding class named StatusItemBinding and this is the mysterious class which we referenced in the StatusViewHolder implementation.

在我们的例子中，它解析目标是layout/status_item.xml中的<layout>节点。根据布局文件的文件名，它会自动生成一个数据绑定类`StatusItemBinding`，我们在`StatusViewHolder`使用的就是这个神秘的类。

The Data Binding pass then strips out the <layout> wrapper leaving the RelativeLayout, and removes the Data Binding expressions as these are incorporated within the StatusItemBinding class – in other words it turns it back in to a standard Android XML layout file and adds a new Java class which implements the binding for us at runtime.

之后Data Binding将<layout>包装去掉，由于在`StatusItemBinding`类中已经解析出了<data>属性，它也会移除<data>节点，只剩下`RelativeLayout`。换句话说，它将这个文件变回了普通的XML layout文件，并添加了一个数据绑定类实时更新其中的内容。

So let’s look again at StatusViewHolder and it may be a little clearer what is going on:

我们再重新看一下`StatusViewHolder`的代码，现在应该明白一点它的运作机制了：

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
    
In the constructor we call DataBindingUtil.bind(itemView) which returns the StatusItemBinding which was generated at build time. Then in the bind(Status status) method we call a setter on the StatusItemBinding instance. This setter is generated from the <data> section in our original layout where we declared a variable of type .data.Status named status. When we call this setter it performs the necessary bindings which were extracted from the Data Binding expressions within the original layout.

`DataBindingUtil.bind(itemView)`方法会在build的时候自动生成。这时候我们需要做的是在`bind(Status status)`中调用`StatusItemBinding`的setter方法，将我们在<data>中声明的数据对象（`.data.Status`）赋值给它。之后我们要显式地调用`bind(Status status)`方法将数据实体与它绑定。

Now that we understand a little better what is actually going on it should be clear how the basic app now works and why we see a list of tweets when we run the app:

你可以从我们的例子中初步看出数据绑定的效果：

![part-1](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/Part11.png)

While this is all very nice, for a simple layout with three items being bound, it hasn’t save us that much work – just some finding of views and some setText() calls on those TextViews. However we haven’t finished there – there is actually an awful lot more that Data Binding can do for us. Those who have been paying attention will have spotted that we extract an image URL from the Twitter feed, have an ImageView within the layout which is currently not being bound, and we’ve included a compile dependency for the Glide image loading library. In the next article we’ll look at how we can build automated image loading in to our Data Binding.

这一切都运作的非常好，就是一个含有三个子view的布局被绑定了，data binding看起来也没为我们省去很多工作，也只是省去了findView与`setText()`两个操作而已。但是它所能做的并不仅仅是这样！可能有人注意到了我们同时从twitter的API中获取了头像的url，layout中我们没有对`ImageView`进行绑定。在下一张中我们将会引入Glide来加载图像，并将它与Data Binding结合起来。

As this article has been mainly explanation, we haven’t actually added any additional code, but the code from the previous article is available here.

本文章主要用于解释原理，没有添加额外的用力。前文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part1)可以看到。