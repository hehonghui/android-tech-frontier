## Retrofit指南
---

>* 原文链接 : [Retrofit Android Tutorial](http://themakeinfo.com/2015/04/retrofit-android-tutorial/)
> * [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [yaoqinwei](https://github.com/yaoqinwei) 
* 校对者: [chaosssss](https://github.com/chaossss)
* 状态 :  完成

这是一篇关于如何使用Retrofit写一个Android的REST客户端的小教程。

![Retrofit+Android](http://img.my.csdn.net/uploads/201504/13/1428932650_8819.jpg)

## 我为什么选择Retrofit？

在使用square的[Retrofit](http://square.github.io/retrofit/)之前，我尝试过Volley和AsyncTask。但在使用过Retrofit之后，我的工作变得更加简单了。在开始阅读教程之前，建议先阅读一下下面的几个话题。这是一个入门项目，可以让你了解如何使用Retrofit从API获取数据。

这个项目也加到了[我的Github](https://github.com/basil2style/Retrofit-Android-Basic)中。

[AsyncHttp ,Volley和Retrofit的对比](https://instructure.github.io/blog/2013/12/09/volley-vs-retrofit/)

![volley-vs-retrofit](http://img.my.csdn.net/uploads/201504/13/1428929622_5444.png)

与Retrofit相比，Volley是一个小型的、缺乏正式文档说明库。Retrofit是[Square](https://github.com/square)开发的，后者还开发过okhttp，picasso...等一些著名的库(你可以在[这里](https://square.github.io/#android)找到其他的库)。如果你需要Volley的指引，你可以在[Google Training](https://developer.android.com/training/volley/index.html)或者[Volley Plus from DWork](https://github.com/DWorkS/VolleyPlus)找到相关文档。

## 简介

[Retrofit](http://square.github.io/retrofit/)是[Square](http://square.github.io/)开发的一个Android和Java的REST客户端库。这个库非常简单并且具有很多特性，相比其他的网络库，更容易让初学者快速掌握。它可以处理GET、POST、PUT、DELETE...等请求，还可以使用picasso加载图片。在使用Picasso或Volley之前，可以先来读读[这个](https://www.bignerdranch.com/blog/solving-the-android-image-loading-problem-volley-vs-picasso/)。

别纠结简介了，开始编码吧!!!

Demo里使用是Github的API : https://api.github.com/users/basil2style

你可以使用这个Demo App来搜索github的用户详细信息

[GITHUB](https://github.com/basil2style/Retrofit-Android-Basic)

![Download-Code](http://img.my.csdn.net/uploads/201504/13/1428929608_5673.png)

[Download APK ](https://github.com/basil2style/Retrofit-Android-Basic/blob/master/APK/Retrofit%20Example.apk)

<a href="https://github.com/basil2style/Retrofit-Android-Basic/blob/master/APK/Retrofit%20Example.apk"><img class="" src="http://img.my.csdn.net/uploads/201504/13/1428929607_5991.png" alt="qr code" width="196" height="196"></a>

## 1) 概述

![Retrofit-3-classes](http://img.my.csdn.net/uploads/201504/13/1428929609_1240.png)

1) **POJO或模型实体类** : 从服务器获取的JSON数据将被填充到这种类的实例中。

2) **接口** : 我们需要创建一个接口来管理像GET,POST...等请求的URL，这是一个服务类。

3) **RestAdapter类** : 这是一个REST客户端(RestClient)类，retrofit中默认用的是Gson来解析JSON数据，你也可以设置自己的JSON解析器，比如jackson，我们将在下面的教程中详细解说明。

## 2) 添加Retrofit库到项目中

_**Gradle**_ :

```groovy
compile 'com.squareup.retrofit:retrofit:1.9.0'
```
目前，1.9.0是最新的版本. 你可以在[这里](https://github.com/square/retrofit)获取更新的版本。

_**JAR**_ :

 [下载Jar包](https://search.maven.org/remote_content?g=com.squareup.retrofit&a=retrofit&v=LATEST)

## 3) 创建项目

1) 在Android Studio中创建新项目: **File  =>  New Project** ，填写描述信息并点击**Next**.

2) 填写**minimum SDK**，我用的是**4.0+**(Retrofit支持Android **2.3+**或Java **6**以上)

3) 选择**Blank Activity**然后填写**Activity Name**和**Layout Name**，最后点击 **Finish**.

4) **Gradle** : 你可以在**app =>build.gradle**中添加Retrofit的库文件。

![gradle-dependencies](http://img.my.csdn.net/uploads/201504/13/1428929609_9928.png)

Jar包的添加方式 :  将jar包添加到libs文件夹下，右键点击Add as Library.

5) 创建两个包：**API**和**model**。

6) 在**API**包下右键点击**New** => **Java Class** , 填写**Name**为<font style="color: #ff0000;">gitapi</font>并设置为<font style="color: #ff0000;">Interface</font>。

6) 在**API**包下创建名<font style="color: #ff0000;">gitapi</font>的<font style="color: #ff0000;">接口</font>。

7) 在**model**包下右键点击**New** => **Java Class**, 填写**Name**为<font style="color: #ff0000;">gitmodel</font>并设置为<font style="color: #ff0000;">Class</font>。

![proj-structure](http://img.my.csdn.net/uploads/201504/13/1428929622_5732.png)

## 4) Android Manifest

1) 添加<font style="color: #ff0000;">INTERNET PERMISSION</font>权限

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

你的`Manifest`文件看起来应该是这样的 :

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"  
          package="com.makeinfo.flowerpi" >
   <uses-permission android:name="android.permission.INTERNET"/>
   <application android:allowBackup="true"
   	   android:icon="@mipmap/ic_launcher"
       android:label="@string/app_name"
       android:theme="@style/AppTheme" >
       <activity
           android:name=".MainActivity"
           android:label="@string/app_name" >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                 <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
 </manifest>
```

## 5) 模型类

首先，我们需要创建一个POJO或模型类。服务器返回的JSON数据不能在Java里直接使用，所以我们需要用模型类来做转换。

URL的结构是这样的：https://api.github.com/users/ + “search term”

举个栗子：https://api.github.com/users/basil2style

我们的JSON返回数据是这样的：

![json object response](http://img.my.csdn.net/uploads/201504/13/1428929583_4905.jpg)

这是一个**JSON Object**，如果你不了解**JSON Array**和**JSON Object**的区别，请看[这里](http://stackoverflow.com/questions/12289844/difference-between-jsonobject-and-jsonarray)。

使用[jsonschema2pojo](http://www.jsonschema2pojo.org/)来创建POJO更加简单，不要每一个JSON数据的POJO转换都用它，有时候会报错。选择源代码类型为**Json**，注解类型是**Gson**,然后点击**preview**。

点击[这里](http://pastebin.com/4xckerN1)(需翻墙)查看`gitmodel.java`源代码。

## 6) gitapi.java

1) 现在我们需要使用接口调用URL.

**`@GET("/users/{user}")`**, 添加这个注解会调用服务器，参数url基于BASE URL，服务调用的参数以'/'开头，其中<font style="color: #ff0000;">{user}</font>是从EditText获取的字符串。

**`@Path("user") String user`** 就是我们从EditText获取的字符串。

服务器端响应的数据则会被存储到POJO实例中去。

```java
public interface gitapi {
   
    @GET("/users/{user}")      // here is the other url part.best way is to start using /
    public void getFeed(@Path("user") String user, Callback<gitmodel> response);
     // string user is for passing values from edittext for eg: user=basil2style,google
   	 // response is the response from the server which is now in the POJO
}
```

## 7) RestAdapter

现在该主要部分了，你需要设置`Rest Adapter`和`service`类.

1) <font style="color: #ff0000;">API</font>就是`Base URL`.

2) 我们需要设置**`Endpoint(API)`**并调用**`buid()`**方法来创建一个**`RestAdapter`**对象。

3) 使用我们的**`gitapi`**来创建一个服务适配器(service for adapter)。

4) 调用函数并获得响应数据，回调接口是用来异步的获取模型实例的，我们的回调接口需要实现成功回调方法(success request)和错误处理方法(error handling)。

5) 我们解析好的json数据的现在就存在于POJO实例中了，你可以每次调用一条。

```java
String API = "https://api.github.com";

RestAdapter restAdapter = new RestAdapter.Builder().setLogLevel(RestAdapter.LogLevel.FULL).setEndpoint(API).build(); 

gitapi git = restAdapter.create(gitapi.class);

git.getFeed(user, new Callback<gitmodel>() {
	@Override
	public void success(gitmodel gitmodel, Response response) {
		tv.setText("Github Name :" + gitmodel.getName() + 
		           "\nWebsite :" + gitmodel.getBlog() + 
		           "\nCompany Name :" + gitmodel.getCompany());

		pbar.setVisibility(View.INVISIBLE); // disable progressbar
 	}

 	@Override
	public void failure(RetrofitError error) {
 		tv.setText(error.getMessage());
 		pbar.setVisibility(View.INVISIBLE); //disable progressbar
 	}
 });
```

完整的`MainActivty.java`代码：

```java
package com.makeinfo.flowerpi;
 
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
 
import com.makeinfo.flowerpi.API.gitapi;
import com.makeinfo.flowerpi.model.gitmodel;
 
import retrofit.Callback;
import retrofit.RestAdapter;
import retrofit.RetrofitError;
import retrofit.client.Response;
 
 
public class MainActivity extends ActionBarActivity {
 
    Button click;
    TextView tv;
    EditText edit_user;
    ProgressBar pbar;
    String API = "https://api.github.com";	// BASE URL
   
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
 
        click = (Button) findViewById(R.id.button);
        tv = (TextView) findViewById(R.id.tv);
        edit_user = (EditText) findViewById(R.id.edit);
        pbar = (ProgressBar) findViewById(R.id.pb);
        pbar.setVisibility(View.INVISIBLE);
       
        click.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String user = edit_user.getText().toString();
                pbar.setVisibility(View.VISIBLE);
               
                // Retrofit section start from here...
                // create an adapter for retrofit with base url
                RestAdapter restAdapter = new RestAdapter.Builder().setEndpoint(API).build(); 
                       
                // creating a service for adapter with our GET class       
                gitapi git = restAdapter.create(gitapi.class);	
 
                // Now ,we need to call for response
                // Retrofit using gson for JSON-POJO conversion
               
                git.getFeed(user,new Callback<gitmodel>() {
                    @Override
                    public void success(gitmodel gitmodel, Response response) {
                        // we get json object from github server to our POJO or model class
                       
                        tv.setText("Github Name :" + gitmodel.getName() + 
                                    "\nWebsite :"+gitmodel.getBlog() + 
                                    "\nCompany Name :"+gitmodel.getCompany());
                       
                        pbar.setVisibility(View.INVISIBLE);	// disable progressbar
                    }
 
                    @Override
                    public void failure(RetrofitError error) {
                     	tv.setText(error.getMessage());
                        pbar.setVisibility(View.INVISIBLE);	// disable progressbar
                    }
                });
            }
        });
    }
 
 
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
 
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
 
        return super.onOptionsItemSelected(item);
    }
}
```
