#数据绑定(Data Binding)-Part2
---

> * 原文链接 : [Data Binding - Part 2](https://blog.stylingandroid.com/data-binding-part-2/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [desmond1121](https://github.com/desmond1121) 
* 校对者: [desmond1121](https://github.com/desmond1121) 

在之前我们做了一个简单的Twitter客户端，但是简单地介绍ViewHolder实现，可能没有充分地让你明白Data Binding的使用方法。那么我们现在就来看看怎么样将Data Binding引入到项目中。

首先我们要在工程目录下的gradle脚本添加依赖：
     
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

在要在使用Data Binding的module下的gradle脚本中添加依赖：

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
    
你会发现在后面这个gradle脚本中没有添加data binding依赖——它实际上只是在构建项目的时候附加的工具。

你应该在这个操作方法中领悟到一些东西：实际上Data Binding只是一个代码生成工具，它会在build项目的时候生成一些绑定View和数据对象的模板代码。

在我们的例子中，它解析目标是layout/status_item.xml中的<layout>节点。**根据布局文件的文件名**，它会自动生成一个数据绑定类`StatusItemBinding`，我们在`StatusViewHolder`使用的就是这个神秘的类。

之后Data Binding将<layout>包装去掉，由于在`StatusItemBinding`类中已经解析出了<data>属性，它同时也会移除<data>节点，只剩下`RelativeLayout`。换句话说，它将这个文件变回了普通的XML layout文件，并添加了一个数据绑定类实时更新其中的内容。

我们再重温一下`StatusViewHolder`的代码，现在应该明白一点它的运作机制了吧：

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
    
`DataBindingUtil.bind(itemView)`方法会在build的时候自动生成。这时候我们需要做的是在`bind(Status status)`中调用`StatusItemBinding`的setter方法，将我们在<data>中声明的数据对象（`.data.Status`）赋值给它。之后我们要显式地调用`bind(Status status)`方法将数据实体与它绑定。

你可以从我们的例子中初步看出数据绑定的效果：

![part-1](http://desmondtu.oss-cn-shanghai.aliyuncs.com/translation/Part11.png)

这一切都运作的非常好，就是一个含有三个子view的布局被绑定了，data binding看起来也没为我们省去很多工作，也只是省去了findView与`setText()`两个操作而已。但是它所能做的并不仅仅是这样！可能有人注意到了我们同时从twitter的API中获取了头像的url，layout中我们没有对`ImageView`进行绑定。在下一章中我们将会引入Glide来加载图像，并将它与Data Binding结合起来。

本文章主要用于解释原理，没有添加额外代码。前文中的例子在[这里](https://github.com/StylingAndroid/DataBinding/tree/Part1)可以看到。