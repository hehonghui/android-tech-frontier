#How to add a Native Facebook Like Button to your Android app using Facebook SDK for Android

#使用Facebook SDK为安卓应用添加Like按钮

> * 原文链接 : [How to add a Native Facebook Like Button to your Android app using Facebook SDK for Android v4](http://inthecheesefactory.com/blog/how-to-add-facebook-like-button-in-android-app/en)
* 原文作者 : [nuuneoi](http://inthecheesefactory.com/blog)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 


Like button is one of the most important strategy to increase traffic to your website. No surprise why Facebook introduced a Native Like Button, `LikeView`, allowed developer to add Like button natively to their Android/iOS apps.

Like按钮是为你的网站增加流量最重要策略之一。不要惊讶为什么Facebook会引入这个Like按钮，`LikeView`,开发者可以随意将Like按钮添加到他们的Android/iOS中。

![](http://inthecheesefactory.com/uploads/source/facebooklike/likes.png)

Anyway although it sounds easy as we do on website but it is not like that. If we just place LikeView on application's layout, it works but with limited functionality for example like count and like status aren't showed, doesn't work on device without Facebook app installed, etc.

虽然它听起非常简单，尤如我们在做网站的其它内容一样，但是答案是否定的。如果我们只是在应用的layout中添LikeView,它也会起作用但是在功能上会有限制，比如Like的数目和Like的状态不会显示。如果不安装Facebook app那是不行的。


After digging through Facebook SDK's source code. I found that **LikeView is designed to work full functionally when application is connected to Facebook app only**. And well ... AFAIK there is no any document mentioned about this.

在深挖Facebook SDK's的源代码之后，我发现**LikeView被设计成只有安装Facebook app之后才能完全展现所有功能**。。。据我所知(AFAIK)也没有其它的文档提到这一问题。

After a couple of experiments, finally I found the sustainable way to make LikeView works full functionally and still be a good user experience practice. Let's go through it step-by-step.

在试验了几次之后，最后我终于找到可以展现LikeView所有功能的方法，并且实践起来很容易。让我一步一步的介绍。

##Create a Facebook App
##创建一个Facebook应用


As mentioned above, application is needed to be connected with Facebook app to make LikeView works full functionally. So the first step is to create a Facebook app.

正如我上面所提到的，如果想让LikeView展现所有的功能是需要连接Facebook app的。所以我们第一步是创建一个Facebook app。

To do so, just browse to [https://developers.facebook.com/apps](https://developers.facebook.com/apps) and then press Add a New App to start creating a new Facebook app.

我们打开[https://developers.facebook.com/apps](https://developers.facebook.com/apps)页面之后添加新应用。

![](http://inthecheesefactory.com/uploads/source/facebooklike/addnewapp.png)

Enter your preferred Facebook App and then press Create New Facebook App ID

输入你的应用的名字点击Create New Facebook App ID
![](http://inthecheesefactory.com/uploads/source/facebooklike/newapp2.jpg)

Choose a Category and press Create App ID

选择一个类别点击Create App ID

![](http://inthecheesefactory.com/uploads/source/facebooklike/categoryselection.jpg)

You will now be redirected into Facebook App settings page. Please scroll to bottom and fill in those fields about your Android project: **Package Name** and **Default Activity Class Name**. Press **Next**.

接下来你会跳转到Facebook App的设置页面，滚动到页面底部并且输入你应用的相关信息，**Package Name**和**Default Activity Class Name**点击**Next**

![](http://inthecheesefactory.com/uploads/source/facebooklike/classes.jpg)

Here comes a little bit complicated part. To make your android app works flawlessly with Facebook App in debug and production mode, you have to fill in Debug Key Hash and Release Key Hash respectively.
接下来有一点小复杂，为了让你的应用无论是在开发环境还是生产环境下都能完美使用Facebook App，需要分别填写Debug Key Hash and Release Key Hash。
![](http://inthecheesefactory.com/uploads/source/facebooklike/keyhashesbefore.jpg)

There are two ways to generate those key hashes: through command line and through Java code.
有两种方式可以生成key hashes：命令或者代码。

###Method 1 - Through Command Line
###方法1 - 命令行

In case you use **Mac** or **Linux** and you already install `keytool` (comes along with JDK) and `openssl`. You could simple do the following through Command Line:

假设你使用**Mac**或者**Linux**并且已经安装了`keytool`(jdk自带)和`openssl`.你可以使用下面命令

```
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Windows下:

```
keytool -exportcert -alias androiddebugkey -keystore %HOMEPATH%\.android\debug.keystore | openssl sha1 -binary | openssl base64
```
And the following command is used to generate a Key Hash for Deployment Keystore to let your app works with Facebook app in production mode.

下面的命令是是用生成发布签名的Key Hash，这样上线的应用也可以使用Facebook app。

```
keytool --exportcert -alias ENTER_ALIAS_HERE -keystore PATH_TO_KEYSTORE.keystore | openssl sha1 -binary | openssl base64
```

把生成的key填进Release Key Hash处。

###Method 2 - Through Java Code
###方法2 - 通过JAVA代码

In case you didn't install keytool and openssl yet and you don't want to. You could generate those key hashes through Java code with the code snippet below. **Please don't forget to change the package name to your app's**.

假设你还没有并且你也不想安装keytool和openssl，你也可以通过下面JAVA代码来生成。**不要忘记修改成你的包名**.

```
try {
            PackageInfo info = getPackageManager().getPackageInfo(
                    "com.inthecheesefactory.lab.facebooklike",
                    PackageManager.GET_SIGNATURES);
            for (Signature signature : info.signatures) {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                Log.d("KeyHash:", Base64.encodeToString(md.digest(), Base64.DEFAULT));
            }
        } catch (PackageManager.NameNotFoundException e) {

        } catch (NoSuchAlgorithmException e) {

        }              
```

To generate Development Key Hash, you could simply run your app directly from your IDE and copy the generated key hash sent back in logcat, put it in both **Development Key Hashes** and **Release Key Hash** fields.

为了生成开发环境下的Key Hash，你可以在IDE中简单运行一下应用从打印的Logcat中复制出生成的key hash
，把生成key hash分别填进**Development Key Hashes** 和 **Release Key Hash**。


To generate Release Key Hash, you need to sign your application with keystore you plan to use in production apk. Run the signed apk in your device or emulator and put generated Key Hash to Release Key Hash field.

为了生成正式环境下的Key Hash，你需要为你的应用打包签名，将打包签名的应用安装到设备或者模拟器上打开，将生成的Key Hash填到Release Key Hash处。

> Please note that Key Hash for production release could be filled in later. The important one for now is Development Key Hash which you need to put in both Development Key Hashes and Release Key Hash fields.

注意，用于正式打包的Key Hash值可以稍后补上，最重要的是你现在先把开发环境下的Key Hash值填写到Development Key Hashes and Release Key Hash中

 ![](http://inthecheesefactory.com/uploads/source/facebooklike/keyhashes2.jpg)
 
Press **Next**	 and scroll to the bottom of the page and then press **Skip to Developer Dashboard** to enter your just-created app's Dashboard.

点击**Next**并滚到页面到底端，点击**Skip to Developer Dashboard**进入到你刚刚创建的应用面板中。

![](http://inthecheesefactory.com/uploads/source/facebooklike/skiptodashboard.jpg)

Copy **App ID** for future use.

You are now done creating a Facebook App !

将**App ID**复制下来一会要用，到此为止一个Facebook App已经创建完成。

##Setup Facebook SDK in your project
##项目中设置Facebook SDK

Now let's switch to client part. First of all, simply add a dependency for Facebook SDK v4 which is now (finally) available over mavenCentral and jcenter.

在客户端导入该库

```
dependencies {
    compile 'com.facebook.android:facebook-android-sdk:4.0.1'
}
```
Add a string resource for Facebook Application ID like code below. (Change the number to your Facebook app's ID)

将Application ID添加到value/strings中：

```
<string name="app_id">你的Application ID</string>
```

Place the code below into `AndroidManifest.xml` right before `</application>` and **it's important to change the number after FacebookContentProvider to your Facebook app's ID**.

将下面的代码粘到`AndroidManifest.xml`的`</application>`之前，**一定要修改下面FacebookContentProvider后面的值为你的Application ID**。

```
        <activity android:name="com.facebook.FacebookActivity"
            android:theme="@android:style/Theme.Translucent.NoTitleBar"
            android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
            android:label="@string/app_name" />
        <meta-data android:name="com.facebook.sdk.ApplicationName"
            android:value="@string/app_name" />
        <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/app_id"/>

        <provider android:authorities="com.facebook.app.FacebookContentProvider1459806660978042"
            android:name="com.facebook.FacebookContentProvider"
            android:exported="true"/>
```        


INTERNET permission is needed for LikeView. Don't forget to add this line inside `AndroidManifest.xml` before `<application>`.

添加访问网络权限

```
<uses-permission android:name="android.permission.INTERNET"/>
```

If you haven't done making a **Custom Application** class yet, do it and add line of codes below to initialize Facebook SDK in v4 way.

在自定义的Application中作Facebook SDK的初使化工作

```
public class MainApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        FacebookSdk.sdkInitialize(getApplicationContext());
   }
}
```

Give a check that Custom Application is already defined in AndroidManifest.xml.

检查一下自定义Application是否在`AndroidManifest.xml`注册。

```
<application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:name=".MainApplication" >
```

至此，已经完成了Facebook SDK的设置。

##Play with LikeView
## 使用LikeView

Your app is now ready. Let's play a little bit with LikeView by simply placing it on layout.

在部局文件中使用

```
<com.facebook.share.widget.LikeView
        android:id="@+id/likeView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>
```

And do the following in Java code to set up its appearance.

代码初使化

```
LikeView likeView = (LikeView) findViewById(R.id.likeView);
likeView.setLikeViewStyle(LikeView.Style.STANDARD);      
likeView.setAuxiliaryViewPosition(LikeView.AuxiliaryViewPosition.INLINE);
```

Set LikeView's url through **setObjectIdAndType** method.

通过**setObjectIdAndType**方法设置LikeView的url。

```
likeView.setObjectIdAndType(
        "http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en",
        LikeView.ObjectType.OPEN_GRAPH)
```

添加成功后如图所示
![](http://inthecheesefactory.com/uploads/source/facebooklike/exp0.jpg)

Anyway it appears that it doesn't work perfectly just yet. Here are the two big concerns.

虽然效果出来了，但是效果还不完美，目前有两个比较大的问题：

**Problem 1: Like count and status aren't showed until you press Like button.**

**Problem 2: Doesn't work in device that Facebook App is not installed.**

**问题1：如果不点击Like按钮，就不会看到Like的数目和状态。**

**问题2：没有安装Facebook应用的设备是不能使用的。**

![](http://inthecheesefactory.com/uploads/source/facebooklike/exp1.jpg)


The reason is already described above. LikeView works full functionally only in app that has already connected with Facebook App. Totally different with one in website which works perfectly without login required. (And yes, it is by designed. And also yes, I am curious why Facebook has designed it this way ...)

在上面已经描述过其中的原由了，只有和Facebook连接成功才能完美的使用LikeView。与在网站中使用不同的一点就是不需要登录。(作者:我很好奇Facebook为什么会这样设计)

![](http://inthecheesefactory.com/uploads/source/facebooklike/onweb.png)

Some workaround is needed. Facebook Login is required to make LikeView showed otherwise Login button with the same appearance as LikeView will come up instead.

看来得变通一下才行，要显示LikeView需要登录Facebook，可以用和LikeView相同外观的登录按钮代替。

There is nothing complicated. I just simply create a Login button using LinearLayout and let it be together with LikeView in RelativeLayout.

这并不复杂。在LikeView的父部局RelativeLayout中使用LinearLayout创建一个登录按钮

```
<RelativeLayout
    android:layout_width="wrap_content"
    android:layout_height="wrap_content">

    <!-- Login Button in the same style as LikeView -->
    <LinearLayout
        android:id="@+id/btnLoginToLike"
        android:background="@drawable/com_facebook_button_like_background"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:clickable="true" >

        <ImageView
            android:src="@drawable/com_facebook_button_icon"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginLeft="8dp"
            android:layout_marginRight="8dp"
            android:layout_marginTop="7.5dp"
            android:layout_marginBottom="7.5dp"/>

        <TextView
            android:id="@+id/tvLogin"
            android:text="Login"
            android:layout_marginLeft="2dp"
            android:layout_marginRight="8dp"
            android:textColor="@android:color/white"
            android:textStyle="bold"
            android:layout_gravity="center_vertical"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"/>

    </LinearLayout>

    <com.facebook.share.widget.LikeView
        android:id="@+id/likeView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>

</RelativeLayout>
```

And then do the logic in Java code with some help of **LoginManager, CallbackManager** and **AccessToken** provided in Facebook SDK for Android v4 to manage a Login flow and status checking.

然后在代码中使用Facebook SDK提供的**LoginManager, CallbackManager** 和 **AccessToken** 类来完成登录的逻辑。

```
public class MainActivity extends Activity {
    
    LinearLayout btnLoginToLike;
    LikeView likeView;
    CallbackManager callbackManager;

    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initInstances();
        initCallbackManager();
        refreshButtonsState();
    }

    private void initInstances() {
        btnLoginToLike = (LinearLayout) findViewById(R.id.btnLoginToLike);
        likeView = (LikeView) findViewById(R.id.likeView);
        likeView.setLikeViewStyle(LikeView.Style.STANDARD);
        likeView.setAuxiliaryViewPosition(LikeView.AuxiliaryViewPosition.INLINE);

        btnLoginToLike.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                LoginManager.getInstance().logInWithReadPermissions(MainActivity.this, Arrays.asList("public_profile"));
            }
        });
    }

    private void initCallbackManager() {
        callbackManager = CallbackManager.Factory.create();
        LoginManager.getInstance().registerCallback(callbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                refreshButtonsState();
            }

            @Override
            public void onCancel() {

            }

            @Override
            public void onError(FacebookException e) {

            }
        });
    }

    private void refreshButtonsState() {
        if (!isLoggedIn()) {
            btnLoginToLike.setVisibility(View.VISIBLE);
            likeView.setVisibility(View.GONE);
        } else {
            btnLoginToLike.setVisibility(View.GONE);
            likeView.setVisibility(View.VISIBLE);
        }
    }

    public boolean isLoggedIn() {
        return AccessToken.getCurrentAccessToken() != null;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Handle Facebook Login Result
        callbackManager.onActivityResult(requestCode, resultCode, data);
    }
}
```

It's done. Let's see the result =)

OK。让我们看一下结果。

###Result
###结果

If the application isn't connected to Facebook app yet. Our custom Login Button would be showed instead of LikeView as designed.

如果程序无法连接到Facebook app,我们的登录按钮将会代替LikeView显示。

![](http://inthecheesefactory.com/uploads/source/facebooklike/btnLogin2.png)

Once Login Button is clicked, it will redirect user to Login process.

一旦点击登录按钮，跳转到用户登录

![](http://inthecheesefactory.com/uploads/source/facebooklike/loginprocess.png)

After user is logged in, Login Button will be hidden and replaced with LikeView. You will see that Like count and Like status are also showed up perfectly just like one on website. Yah ! If a url is changed, those number and status are also automatically changed to match the information associated to an entered url.

用户登录之后，登录按钮将会被隐藏同时显示LikeView，届时你将会看到Like的数目和状态也会像网站中的一样完美的显示出来。如果url改变了，那些数目和状态也会相应的刷新。

![](http://inthecheesefactory.com/uploads/source/facebooklike/loggedin.png)

If user press Like, it will affect the button embedded on website as well.

如果用户点击Like,也会影响到网站中使用的Like.

![](http://inthecheesefactory.com/uploads/source/facebooklike/liked.png)

**A by-product of this method is LikeView button also works on the device without Facebook application installed. It means that it works even on Chrome or on ARC Welder !**

这种方法可以让没有安装Facebook应用的设备使用Facebook SDK.意味着在Chrome和ARC Welder 也可以使用

![](http://inthecheesefactory.com/uploads/source/facebooklike/arcwelder.jpg)


##Known bug
Although it is close enough to perfect but there is still some known bug. If like is done on website, like status on application will not be updated. And we couldn't do anything but wait for Facebook engineer to fix this issue.

##已知bug
虽然它接近完美但是仍然有一些bug。如果在网站中点击了Like，应用中的Like状态不会改变。除了等Facebook修复这个bug我们无能为力。

##FBLikeAndroid Library

To make it as easy as possible to use. I made a library to do a job for you. **FBLikeAndroid is a library comes up with Login Button that will change to Native Like Button automatically when application is connected to Facebook app.**

为了让它更加容易使用，我特意制作了一个library。**FBLikeAndroid 就是当成功连接到Facebook应用时，登录按钮自动改变原生Like按钮的library**

![](http://inthecheesefactory.com/uploads/source/facebooklike/fblikeandroid.png)


To use it, you have to create a Facebook app and setup your project as written above. And then simply add the following dependency to your app's `build.gradle`. **Please note that Facebook SDK v4 is already included in this dependency so you have no need to add any additional dependency.**

使用它的时候你只需按照上面的步骤创建一个Facebook应用，然后添加依赖到你项目`build.gradle`中。**注意：此依赖已经包括了Facebook SDK，你不需要再添加额外依赖**

```
dependencies {
    compile 'com.inthecheesefactory.thecheeselibrary:fb-like:0.9.3'
}
```

Place **com.inthecheesefactory.lib.fblike.widget.FBLikeView** anywhere to start using the component.

像如下方式使用该组件

```
<com.inthecheesefactory.lib.fblike.widget.FBLikeView
        android:id="@+id/fbLikeView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>
```

LikeView inside FBLikeView is already set the appearance to STANDARD so you have no need to set it again unless you need to change its style. To access LikeView attached inside, you could do it through a getter function, `getLikeView()`. The following code is used to set a url for LikeView.

FBLikeView中LikeView使用了标准外观，你不需要再重新设置，除非你想改变它的style.如果想访问LikeView你可以使用`getLikeView()`方法。下面的代码是为LikeView设置url

```
FBLikeView fbLikeView = (FBLikeView) rootView.findViewById(R.id.fbLikeView);
fbLikeView.getLikeView().setObjectIdAndType(
        "http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en",
        LikeView.ObjectType.OPEN_GRAPH);
```

The final step, you have to call `FBLikeView.onActivityResult` in every single Activity's `onActivityResult` to connect FBLikeView buttons to Facebook Login flow.

最后一步，你需要在每一个Activity的`onActivityResult`中调用`FBLikeView.onActivityResult`方法进行Facebook登录

```
@Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        FBLikeView.onActivityResult(requestCode, resultCode, data);
    }
```

That's all ! Easy, huh? =D

就这样。是不是很简单。

If you want to disconnect your android app to Facebook app, simply call the following command. The button will be automatically changed to Login state.

如果你想与Facebook取消连接。使用下面代码就可以了。按钮会自动改变其状态。

```
FBLikeView.logout();
```

Source Code of FBLikeAndroid Library is available at [https://github.com/nuuneoi/FBLikeAndroid](https://github.com/nuuneoi/FBLikeAndroid). Please feel free to take a look or contribute anytime =)

FBLikeAndroid Library的源码[https://github.com/nuuneoi/FBLikeAndroid](https://github.com/nuuneoi/FBLikeAndroid)有空的时候可以看一下。


##Submit for public use

Right now LikeView works only with Facebook app's administrator, you. To make LikeView works for everyone, you need to send a submission to Facebook team. Here is the steps to do so:

现在LikeView只在当前Facebook的账号下可以使用。为了让每一个人可以使用LikeView，你需要向Facebook提交申请。下面是申请步骤：

1) Enter your Facebook App's App Details page. Enter Long Description, Privacy Policy URL and also upload App Icon you desired.

1）进入你的Facebook应用的详情页。输入描述、隐私政策URL并上传你希望使用的应用图标。

![](http://inthecheesefactory.com/uploads/source/facebooklike/appdetails.jpg)

2) Enter Status & Review page and press Start a Submission

2)进入Status & Review页面点击Start a Submission

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission1.png)

3) Check a Native Like Button box and press Add 1 Item

选择Native Like Button项并点击Add 1 Item

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission2.png)

4) Press Add Notes placed next to Native Like Button item and provide step-by-step instructions how Native Like Button works in your app. From my experience, provide a link of visual image works far better than just typing some texts.

4)点击Add Notes在弹窗中输入一些介绍信息，根据我的经验，提供一些应用截图的链接比输入文字的效果更好。

![](http://inthecheesefactory.com/uploads/source/facebooklike/AddNotes.jpg)

5) Upload apk file, upload your app's Screenshots (4 minimum), check at I have tested that my application loads on all of the above platforms box and then press Submit for Review

上传APK文件，并上传你应用的截图(最少4张)勾选**I have tested that my application loads on all of the above platforms**,并点击**Submit for Review**。

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission3.jpg)

6) Enter Contact Email in Settings page

6)在**Settings**页面输入联系Email

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission4.jpg)

7) The final step is to make created Facebook app be available to public by set the following button to On in Status & Review page

7)最后一步是为了让每个人都可以使用创建的Facebook应用，在**Status & Review**页面将按钮状态切换为**On**

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission5.jpg)

Do some hiking, fishing, snoggle diving and wait for a day or two to get a result from Facebook team. By average, it takes 2-3 times to let the it approved so please do it at least a week before your application is publicly launched.

出去旅个游，钓个鱼什么的等个一两天就会有结果了。平均来说，大概需要提交2-3次才能通过，所以在发布你应用的前一个星期就需要开始申请。



This is what it looks like in Status & Review page when the submission is approved.

当申请通过之后**Status & Review**页面是这样的

![](http://inthecheesefactory.com/uploads/source/facebooklike/submissionpassed.png)

Once you got something like above, your LikeView will work for anyone !

一旦状态变成如图中那样，那么每个人都可以使用你的LikeView了

Hope you find this article useful and ... don't forget to give a like or some +1 to this article ! =)

希望这篇文章对你有用，不要忘了给文章点赞哦。=)


