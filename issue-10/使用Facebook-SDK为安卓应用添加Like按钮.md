使用Facebook SDK为安卓应用添加Like按钮

> * 原文链接 : [How to add a Native Facebook Like Button to your Android app using Facebook SDK for Android v4](http://inthecheesefactory.com/blog/how-to-add-facebook-like-button-in-android-app/en)
* 原文作者 : [nuuneoi](http://inthecheesefactory.com/blog)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: [tiiime](https://github.com/tiiime)
* 状态 :  完成 


Like按钮是为你的网站增加流量最重要策略之一。不要惊讶为什么Facebook会引入这个Like按钮，`LikeView`,开发者可以随意将Like按钮添加到他们的Android/iOS中。

![](http://inthecheesefactory.com/uploads/source/facebooklike/likes.png)

虽然它听起非常简单，尤如我们在做网站的其它内容一样，但是答案是否定的。如果我们只是在应用的layout中添LikeView,它也会起作用但是在功能上会有限制，比如Like的数目和Like的状态不会显示。如果不安装Facebook app那是不行的。

在深挖Facebook SDK's的源代码之后，我发现**LikeView被设计成只有安装Facebook app之后才能完全展现所有功能**。。。据我所知(AFAIK)也没有其它的文档提到这一问题。

在试验了几次之后，最后我终于找到可以展现LikeView所有功能的方法，并且实践起来很容易。让我一步一步的介绍。

##创建一个Facebook应用

正如我上面所提到的，如果想让LikeView展现所有的功能是需要连接Facebook app的。所以我们第一步是创建一个Facebook app。

我们打开[https://developers.facebook.com/apps](https://developers.facebook.com/apps)页面之后添加新应用。

![](http://inthecheesefactory.com/uploads/source/facebooklike/addnewapp.png)

输入你的应用的名字点击Create New Facebook App ID

![](http://inthecheesefactory.com/uploads/source/facebooklike/newapp2.jpg)

选择一个类别点击Create App ID

![](http://inthecheesefactory.com/uploads/source/facebooklike/categoryselection.jpg)

接下来你会跳转到Facebook App的设置页面，滚动到页面底部并且输入你应用的相关信息，**Package Name**和**Default Activity Class Name**点击**Next**

![](http://inthecheesefactory.com/uploads/source/facebooklike/classes.jpg)

接下来有一点小复杂，为了让你的应用无论是在开发环境还是生产环境下都能完美使用Facebook App，需要分别填写Debug Key Hash and Release Key Hash。

![](http://inthecheesefactory.com/uploads/source/facebooklike/keyhashesbefore.jpg)

有两种方式可以生成key hashes：命令或者代码。

###方法1 - 命令行

假设你使用**Mac**或者**Linux**并且已经安装了`keytool`(jdk自带)和`openssl`.你可以使用下面命令

```
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Windows下:

```
keytool -exportcert -alias androiddebugkey -keystore %HOMEPATH%\.android\debug.keystore | openssl sha1 -binary | openssl base64
```

下面的命令是是用生成发布签名的Key Hash，这样上线的应用也可以使用Facebook app。

```
keytool --exportcert -alias ENTER_ALIAS_HERE -keystore PATH_TO_KEYSTORE.keystore | openssl sha1 -binary | openssl base64
```

###方法2 - 通过JAVA代码

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

为了生成开发环境下的Key Hash，你可以在IDE中简单运行一下应用从打印的Logcat中复制出生成的key hash，把生成key hash分别填进**Development Key Hashes** 和 **Release Key Hash**。

为了生成正式环境下的Key Hash，你需要为你的应用打包签名，将打包签名的应用安装到设备或者模拟器上打开，将生成的Key Hash填到Release Key Hash处。

> 注意，用于正式打包的Key Hash值可以稍后补上，最重要的是你现在先把开发环境下的Key Hash值填写到Development Key Hashes and Release Key Hash中

![](http://inthecheesefactory.com/uploads/source/facebooklike/keyhashes2.jpg)

点击**Next**并滚到页面到底端，点击**Skip to Developer Dashboard**进入到你刚刚创建的应用面板中。

![](http://inthecheesefactory.com/uploads/source/facebooklike/skiptodashboard.jpg)

将**App ID**复制下来一会要用，到此为止一个Facebook App已经创建完成。

##项目中设置Facebook SDK

在客户端导入该库

```
dependencies {
    compile 'com.facebook.android:facebook-android-sdk:4.0.1'
}
```

将Application ID添加到value/strings中：

```
<string name="app_id">你的Application ID</string>
```

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

## 使用LikeView

在部局文件中使用

```
<com.facebook.share.widget.LikeView
        android:id="@+id/likeView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>
```

代码初使化

```
LikeView likeView = (LikeView) findViewById(R.id.likeView);
likeView.setLikeViewStyle(LikeView.Style.STANDARD);      
likeView.setAuxiliaryViewPosition(LikeView.AuxiliaryViewPosition.INLINE);
```

通过**setObjectIdAndType**方法设置LikeView的url。

```
likeView.setObjectIdAndType(
        "http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en",
        LikeView.ObjectType.OPEN_GRAPH)
```

添加成功后如图所示
![](http://inthecheesefactory.com/uploads/source/facebooklike/exp0.jpg)

虽然效果出来了，但是效果还不完美，目前有两个比较大的问题：

**问题1：如果不点击Like按钮，就不会看到Like的数目和状态。**

**问题2：没有安装Facebook应用的设备是不能使用的。**

![](http://inthecheesefactory.com/uploads/source/facebooklike/exp1.jpg)

在上面已经描述过其中的原由了，只有和Facebook连接成功才能完美的使用LikeView。与在网站中使用不同的一点就是不需要登录。(作者:我很好奇Facebook为什么会这样设计)

![](http://inthecheesefactory.com/uploads/source/facebooklike/onweb.png)

看来得变通一下才行，要显示LikeView需要登录Facebook，可以用和LikeView相同外观的登录按钮代替。

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

OK。让我们看一下结果。

###结果

如果程序无法连接到Facebook app,我们的登录按钮将会代替LikeView显示。

![](http://inthecheesefactory.com/uploads/source/facebooklike/btnLogin2.png)

一旦点击登录按钮，跳转到用户登录

![](http://inthecheesefactory.com/uploads/source/facebooklike/loginprocess.png)

用户登录之后，登录按钮将会被隐藏同时显示LikeView，届时你将会看到Like的数目和状态也会像网站中的一样完美的显示出来。如果url改变了，那些数目和状态也会相应的刷新。

![](http://inthecheesefactory.com/uploads/source/facebooklike/loggedin.png)

如果用户点击Like,也会影响到网站中使用的Like.

![](http://inthecheesefactory.com/uploads/source/facebooklike/liked.png)

这种方法可以让没有安装Facebook应用的设备使用Facebook SDK.意味着在Chrome和ARC Welder 也可以使用

![](http://inthecheesefactory.com/uploads/source/facebooklike/arcwelder.jpg)

##已知bug

虽然它接近完美但是仍然有一些bug。如果在网站中点击了Like，应用中的Like状态不会改变。除了等Facebook修复这个bug我们无能为力。

##FBLikeAndroid Library

为了让它更加容易使用，我特意制作了一个library。**FBLikeAndroid 就是当成功连接到Facebook应用时，登录按钮自动改变原生Like按钮的library**

![](http://inthecheesefactory.com/uploads/source/facebooklike/fblikeandroid.png)

使用它的时候你只需按照上面的步骤创建一个Facebook应用，然后添加依赖到你项目`build.gradle`中。**注意：此依赖已经包括了Facebook SDK，你不需要再添加额外依赖**

```
dependencies {
    compile 'com.inthecheesefactory.thecheeselibrary:fb-like:0.9.3'
}
```

像如下方式使用该组件

```
<com.inthecheesefactory.lib.fblike.widget.FBLikeView
        android:id="@+id/fbLikeView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"/>
```

FBLikeView中LikeView使用了标准外观，你不需要再重新设置，除非你想改变它的style.如果想访问LikeView你可以使用`getLikeView()`方法。下面的代码是为LikeView设置url

```
FBLikeView fbLikeView = (FBLikeView) rootView.findViewById(R.id.fbLikeView);
fbLikeView.getLikeView().setObjectIdAndType(
        "http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en",
        LikeView.ObjectType.OPEN_GRAPH);
```

最后一步，你需要在每一个Activity的`onActivityResult`中调用`FBLikeView.onActivityResult`方法进行Facebook登录

```
@Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        FBLikeView.onActivityResult(requestCode, resultCode, data);
    }
```

就这样。是不是很简单。

如果你想与Facebook取消连接。使用下面代码就可以了。按钮会自动改变其状态。

```
FBLikeView.logout();
```

FBLikeAndroid Library的源码[https://github.com/nuuneoi/FBLikeAndroid](https://github.com/nuuneoi/FBLikeAndroid)有空的时候可以看一下。


##Submit for public use

现在LikeView只在当前Facebook的账号下可以使用。为了让每一个人可以使用LikeView，你需要向Facebook提交申请。下面是申请步骤：

1）进入你的Facebook应用的详情页。输入描述、隐私政策URL并上传你希望使用的应用图标。

![](http://inthecheesefactory.com/uploads/source/facebooklike/appdetails.jpg)

2)进入Status & Review页面点击Start a Submission

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission1.png)

3)选择Native Like Button项并点击Add 1 Item

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission2.png)

4)点击Add Notes在弹窗中输入一些介绍信息，根据我的经验，提供一些应用截图的链接比输入文字的效果更好。

![](http://inthecheesefactory.com/uploads/source/facebooklike/AddNotes.jpg)

上传APK文件，并上传你应用的截图(最少4张)勾选**I have tested that my application loads on all of the above platforms**,并点击**Submit for Review**。

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission3.jpg)

6)在**Settings**页面输入联系Email

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission4.jpg)

7)最后一步是为了让每个人都可以使用创建的Facebook应用，在**Status & Review**页面将按钮状态切换为**On**

![](http://inthecheesefactory.com/uploads/source/facebooklike/submission5.jpg)

出去旅个游，钓个鱼什么的等个一两天就会有结果了。平均来说，大概需要提交2-3次才能通过，所以在发布你应用的前一个星期就需要开始申请。

当申请通过之后**Status & Review**页面是这样的

![](http://inthecheesefactory.com/uploads/source/facebooklike/submissionpassed.png)

一旦状态变成如图中那样，那么每个人都可以使用你的LikeView了

希望这篇文章对你有用，不要忘了给文章点赞哦。=)


