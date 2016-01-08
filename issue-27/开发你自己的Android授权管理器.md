开发你自己的Android 授权管理器
---

> * 原文链接 : [Write your own Android Authenticator](http://blog.udinic.com/2013/04/24/write-your-own-android-authenticator)
* 原文作者 : [UDI COHEN](http://blog.udinic.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [kevinhong](https://github.com/kevinhong) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 




18个月之前，我在开发Any.DD同步系统时，打算使用安卓提供的``AccountManager`` API实现认证的相关功能并存储用户秘钥。当我用它来访问Google账号时，一切都非常简单，所以我想Any.DD就用这个API来做吧。确实，使用SyncAdapter进行同步操作进展很顺利，看起来的确是一个完美的方案。但它的问题也随之出现——没有好的文档，开发者社区也没能提供太多可供参考的经验，而我们也没有太多时间来研究这个“无人之地“引发的各种问题。所以当时决定使用其他方案。

但是，今非昔比...


因为一个最近着手的项目，我最近又开始研究相关功能，我突然发现这方面知识的丰富程度有了巨大的提升。包括Android.com上的更好的文档，外面的教程（  [教程1][1]  [教程2][2]）也逐渐丰富了起来。让我们了解到声名狼藉的``AccountManager``的神秘之处。坊间传闻的用来创建个人账户的方式，我几乎全都读了。
[1]: http://www.finalconcept.com.au/article/view/android-account-manager-step-by-step-2        "教程1" 
[2]: http://www.c99.org/2010/01/23/writing-an-android-sync-provider-part-1/        "教程2" 

但是，好像还是缺点什么。

我感觉整个流程并非尽知，有些部分并没有足够清楚。所以我决定用我的方法调查它——就像我平时想要了解一件事情所用的方法一样——用“杰克鲍尔“的方式。我发表了这篇深入调查后的结论性文章，包含了所有这个服务所能提供的功能和一些我觉得重要的需要发掘的细节。后面，我还会贴出一篇关于“SyncAdapter“的文章，所以如果读者感兴趣，我建议读者通过RSS或Twitter来订阅（我的博客）。我还是比较了解这方面的诸多细节，不仅仅是教程提供的简单功能。但如果我遗漏了什么，请在评论中指出。

## 为什么选择 Account Manager?

为什么？

为什么不是写一个简单的登录表单，实现一个提交按钮，发送（post）所有信息到服务器，然后服务器返回一个鉴权令牌（auth token）？原因在于有很多（与用户鉴权相关的）附加功能和小细节你未必能考虑周全。这些容易被开发者忽略的小细节可能导致用户重新登录，或者被“100000个用户才会出现一次，无所谓“的声音 忽略掉。用户如果在另外一个客户端修改密码该如何处理？auth-token的过期判断呢？是要运行一个没有用户交互UI的后台服务吗？
想要用户登录一次，相关APP就可以自动登录的便利吗？（就像Google的APP那样）

读这篇文章之前或许让你感觉有些东西太复杂，但其实不是。对于绝大多数应用场景来说， Account Manager都简化了登录过程。而且我也给你提供了代码样例，还有什么理由不用呢？

好吧，让我们来看看（使用 ``AccountManager``）都有哪些好处：
好处：标准的用户鉴权方式；为开发者简化了登录的流程；处理访问拒绝的场景；可以为一个账户处理不同类型的访问令牌（如：只读、全权限）；轻松的在不同程序间共享令牌；有如Sync Adapter这样的后台处理的良好支持；并且，在手机的Setting界面中有一个很酷的入口：

![alt text](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/accounts2.png "Title")

看，妈妈，设置屏幕上有我的"名纸"！

缺陷：需要学习它！但是，嗨，这不就是你读此文的目的吗？

要实现这些功能，需要下面几步：
1. 创建``Authenticator``，这是所有操作的核心
2. 创建若干``Activity``，用户可以在其中输入验证需要的信息
3. 创建``Service``，通过``Service``我们可以与``Authenticator``进行交互

首先，（来看）一些概念。

## Authenti..啥?

**授权令牌 (Authentication Token，[auth-token](http://en.wikipedia.org/wiki/Security_token))** -  是由服务器提供的一个临时的访问令牌。所有需要识别用户的请求，在发送到服务器时都要带着这个令牌。在这篇文章中，我们使用[OAuth2](http://en.wikipedia.org/wiki/OAuth)，它也是现在最为流行的方法。

**授权服务器** - 用来管理所有用户的服务器。它将会为登录到服务器的用户生成授权令牌（auth-token），并且校验所有的用户请求（是否合法）。授权令牌有时间限制，过期后将时效。

**AccountManager** - 管理设备上的所有账户，也是这项功能的核心。App从``AccountManager``获得auth-token，它也将决定是否该打开登录、创建用户的``Activity``，或者从之前的请求中返回一个已经存储好的auth-token。``AccountManager``了解不同场景下该调用何种操作。

**AccountAuthenticator** - 是一个为具体账户类型提供鉴权处理过程的组件。``AccountManager``查找合适的``AccountAuthenticator``，与其通信，并根据账户类型执行所有动作。``AccountAuthenticator``知道哪个``Activity``用来让用户输入登录信息，也知道服务器上次返回的auth-token在哪里存储。在一个账户类型下，多个不同的服务也会共用同一个``AccountAuthenticator``。比如Google的``AccountAuthenticator``为GMail提供认证服务，也为其他的Google程序，如：Google Calendar和Google Drive提供授权服务。

**AccountAuthenticatorActivity** - “登录／创建用户“``Activity``的基类，当用户需要认证的时候，``authenticato``r调用会这个``Activity``。这个``Activity``负责用户登录或用户创建过程，并将auth-token返回给
``authenticator``。

当你的App需要auth-token时，只需调用 ``AccountManager#getAuthToken()``。``AccountManager``将负责一切必须的步骤直到给你拿到auth-token。Google提供了一个流程图展现了整个过程：


![Google-``AccountManager``-Process-Daigram](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/oauth_dance1.png "Title")

这图看起来有点繁琐，但其实它很简单。我将通过用户首次在设备上登陆的场景来进行解释。

用户首次登陆时
>- App向``AccountManager``请求auth-token。
>- ``AccountManager`` 询问与其关联的 ``AccountAuthenticator`` 是否保存了有效的token
>- 由于目前还没有（用户还没有登陆嘛），他将调用 ``AccountAuthenticatorActivity ``来让用户登录。
>- 用户正常登陆，服务器返回了auth-token。
>- ``AccountManager``存储了auth-token以备将来使用。
>- App获得了它想要的auth-token

皆大欢喜！

在用户已经登陆的情况下，上述的第二步将直接返回auth-token。你可以在[这里](http://developer.android.com/training/id-auth/authenticate.html)获得更多如何使用OAuth2进行认证的文章。

现在，我们已经了解了基础知识。现在来看看如何建立一个自有账户类型的authenticator。

##建立我们自己的Authenticator


如前文所述， Account Authenticator 由``AccountManager``管理并满足账户相关的所有任务：存储auth-token；展现账户登录屏幕；处理服务器的用户登录。

建立我们自己的``Authenticator``需要继承Abstract``AccountAuthenticator``并实现一些方法。我们现在来关注其中两个主要方法：

###addAccount

当用户打算登录并在一个设备上新建账户时，会调用这个方法。

我们需要返回一个Bundle，其中包含一个会启动我们自己的_``AccountAuthenticatorActivity``（稍后解释）的Intent，这个方法在app通过调用``AccountManager#addAccount()`` (需要特殊权限)时被调用。或者在手机设置   中，用户点击“添加新用户“时被调用，即： 


![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/account_add_from_setting.png "Title")

例如:
``` Java
@Override
public Bundle addAccount(AccountAuthenticatorResponse response, String accountType, String authTokenType, String[] requiredFeatures, Bundle options) throws NetworkErrorException {
    final Intent intent = new Intent(mContext, AuthenticatorActivity.class);
    intent.putExtra(AuthenticatorActivity.ARG_ACCOUNT_TYPE, accountType);
    intent.putExtra(AuthenticatorActivity.ARG_AUTH_TYPE, authTokenType);
    intent.putExtra(AuthenticatorActivity.ARG_IS_ADDING_NEW_ACCOUNT, true);
    intent.putExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE, response);
    final Bundle bundle = new Bundle();
    bundle.putParcelable(AccountManager.KEY_INTENT, intent);
    return bundle;
}
``` 




###getAuthToken

如上面的流程图所示，根据`account type`获取之前成功登录后存储在这台设备上的`auth-token`。如果auth-token不存在，将会提示用户登录。在成功登陆之后，请求auth-token的app会获取到它等待已久的auth-token。为了完成这个过程，我们应该通过 ``AccountManager#peekAuthToken()``来检查``AccountManager``是否已经存在一个有效的auth-token。如果没有，我们应该返回与``addAccount()``相同的结果。


``` Java

@Override
public Bundle getAuthToken(AccountAuthenticatorResponse response, Account account, String authTokenType, Bundle options) throws NetworkErrorException {

    // Extract the username and password from the Account Manager, and ask
    // the server for an appropriate AuthToken.
    final AccountManager am = AccountManager.get(mContext);

    String authToken = am.peekAuthToken(account, authTokenType);

    // Lets give another try to authenticate the user
    if (TextUtils.isEmpty(authToken)) {
        final String password = am.getPassword(account);
        if (password != null) {
            authToken = sServerAuthenticate.userSignIn(account.name, password, authTokenType);
        }
    }

    // If we get an authToken - we return it
    if (!TextUtils.isEmpty(authToken)) {
        final Bundle result = new Bundle();
        result.putString(AccountManager.KEY_ACCOUNT_NAME, account.name);
        result.putString(AccountManager.KEY_ACCOUNT_TYPE, account.type);
        result.putString(AccountManager.KEY_AUTHTOKEN, authToken);
        return result;
    }

    // If we get here, then we couldn't access the user's password - so we
    // need to re-prompt them for their credentials. We do that by creating
    // an intent to display our AuthenticatorActivity.
    final Intent intent = new Intent(mContext, AuthenticatorActivity.class);
    intent.putExtra(AccountManager.KEY_ACCOUNT_AUTHENTICATOR_RESPONSE, response);
    intent.putExtra(AuthenticatorActivity.ARG_ACCOUNT_TYPE, account.type);
    intent.putExtra(AuthenticatorActivity.ARG_AUTH_TYPE, authTokenType);
    final Bundle bundle = new Bundle();
    bundle.putParcelable(AccountManager.KEY_INTENT, intent);
    return bundle;
}

```

如果我们通过此方法获得的auth-token已经无效了，比如过期了或者用户从其他客户端修改了密码。我们应该调用``AccountManager#invalidateAuthToken()``使当前存储在``AccountManager``的auth-token失效，并调用``getAuthToken() ``再次请求auth-token。再次调用 ``getAuthToken() ``时会尝试使用之前存储的密码进行登陆，如果失败，用户将必须再次输入登陆信息。

所以，用户要在哪输入验证信息？这就是````AccountAuthenticatorActivity``了。

##创建Activity

[AccountAuthenticatorActivity](http://developer.android.com/reference/android/accounts/AccountAuthenticatorActivity.html)是整个过程中唯一直接与用户交互的``Activity``。

``Authenticator``首先调用这个``Activity``，此``Activity``将展现一个用户登录表单，发送到服务器鉴权用户，并将结果传给``authenticator``。我们继承``AccountAuthenticatorActivity``，不仅要实现常规Activity的功能，还要实现``setAccountAuthenticatorResult()``方法。此方法负责将鉴权过程的结果发送给``Authenticator``。此方法也为我们省掉了与``Authenticator``直接交互。

我在我的``Activity``中构建了一个简单的用户名／密码表单。你可以使用Android官方网站上建议使用的登录``Activity``模版，提交时，我进行了以下操作：

```Java
public void submit() {
    final String userName = ((TextView) findViewById(R.id.accountName)).getText().toString();
    final String userPass = ((TextView) findViewById(R.id.accountPassword)).getText().toString();
    new AsyncTask<Void, Void, Intent>() {
        @Override
        protected Intent doInBackground(Void... params) {
            String authtoken = sServerAuthenticate.userSignIn(userName, userPass, mAuthTokenType);
            final Intent res = new Intent();
            res.putExtra(AccountManager.KEY_ACCOUNT_NAME, userName);
            res.putExtra(AccountManager.KEY_ACCOUNT_TYPE, ACCOUNT_TYPE);
            res.putExtra(AccountManager.KEY_AUTHTOKEN, authtoken);
            res.putExtra(PARAM_USER_PASS, userPass);
            return res;
        }
        @Override
        protected void onPostExecute(Intent intent) {
            finishLogin(intent);
        }
    }.execute();
}
```

``sServerAuthenticate``是与服务器进行认证的接口，我实现了了其中例如``userSignIn``（用户登录）和``userSignUp``（用户注册）的方法，这些方法会在登录成功时获得服务器返回的auth-token。

``mAuthTokenType``是我从服务器请求的令牌的类型。我可以让服务器给我不同的令牌例如只读或全访问，或者在相同的账户下的不同服务。一个好的列子是Google‘账号，它的令牌类型包括：“_Manage your calendars”（管理日历）, “Manage your _tasks”（管理任务）, “View your calendars”（查看日历）等等。在这个列子中，我不会为不同类型的令牌区分不同的操作。


完成后，调用 finishLogin():

```Java
private void finishLogin(Intent intent) {
    String accountName = intent.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
    String accountPassword = intent.getStringExtra(PARAM_USER_PASS);
    final Account account = new Account(accountName, intent.getStringExtra(AccountManager.KEY_ACCOUNT_TYPE));
    if (getIntent().getBooleanExtra(ARG_IS_ADDING_NEW_ACCOUNT, false)) {
        String authtoken = intent.getStringExtra(AccountManager.KEY_AUTHTOKEN);
        String authtokenType = mAuthTokenType;
        // Creating the account on the device and setting the auth token we got
        // (Not setting the auth token will cause another call to the server to authenticate the user)
        mAccountManager.addAccountExplicitly(account, accountPassword, null);
        mAccountManager.setAuthToken(account, authtokenType, authtoken);
    } else {
        mAccountManager.setPassword(account, accountPassword);
    }
    setAccountAuthenticatorResult(intent.getExtras());
    setResult(RESULT_OK, intent);
    finish();
}

```

通过上面的方法我们获得了一个全新的auth-token，具体细节如下：

1. 在这个案例中，``AccountManager``已经存在了一条记录，它是一个已经失效了的auth-token。新的auth-token会替代原有的，此时你不需要做任何操作。但如果用户的密码已经修改，你需要向``AccountManager``更新用户密码，就像上面代码中实现的那样。

2. 添加了一个新的账户到设备 —— 这是有技巧的部分。当新账户创建时，auth-token并没有立刻保存到``AccountManager``，你需要显示的设置auth-token。这也是我在添加完账户之后，又明确的设置auth-token的原因。如果设置失败了，``AccountManager``将会再到服务器执行获取auth-token的过程，这时getAuthToken会被调用，并再次进行用户鉴权。

注意：addAccountExplicitly() 的第三个参数，是用户数据Bundle，它可以用在``AccountManager``保存其他认证信息的同时存储一些自定义信息，比如你的服务的API Key。当然这些信息也可以通过``setUserData()``设置。

在Activity完成登陆之后，我们已经为``AccountManager``建立了我们的账户。最后调用 ``setAccountAuthenticatorResult() ``将信息传回给``Authenticator``。

现在一切流程准备就绪，那谁来启动这个过程呢？（其他应用）如何来访问它？我们需要让我们的``Authenticator``对其他想使用它的应用可用，因此我们需要让``Authenticator``在后台运行（还可以调用登录屏幕），使用``Service``是一个明显的选择。

##创建Service

Service非常简单。

我们要做的，是让其他的进程与我们的服务绑定，并于``Authenticator``交互。幸运的是，``Authenticator``的父类``AbstractAccountAuthenticator``提供了``getIBinder()`` 方法，该方法返回了一个``IBInder``实现。我们的服务需要在``onBind()``方法中调用它。这个基本的实现保证了其他进程请求``Authenticator``时进行适当的操作（原文为：“调用合适的方法“。译者注）。如果读者想了解其中的细节，可以看看``Transport``，一个``AbstractAccountAuthenticator``的内部类，并了解关于AIDL——进程间通信的一些知识。

现在我们的服务是这样的：


``` JAVA
public class UdinicAuthenticatorService extends Service {
    @Override
    public IBinder onBind(Intent intent) {
        UdinicAuthenticator authenticator = new UdinicAuthenticator(this);
        return authenticator.getIBinder();
    }
}
```

..and on the manifest we need to add our service with the

在manifest文件中，需要对Service声明

``` XML
<service android:name=".authentication.UdinicAuthenticatorService">
    <intent-filter>
        <action android:name="android.accounts.AccountAuthenticator" />
    </intent-filter>
    <meta-data android:name="android.accounts.AccountAuthenticator"
               android:resource="@xml/authenticator" />
</service>
```


很简单，是吧？
作为资源引用的``authenticator.xml``用来定义``Authenticator``用到的一些属性。

``` XML
<account-authenticator xmlns:android="http://schemas.android.com/apk/res/android"
                       android:accountType="com.udinic.auth_example"
                       android:icon="@drawable/ic_udinic"
                       android:smallIcon="@drawable/ic_udinic"
                       android:label="@string/label"
                       android:accountPreferences="@xml/prefs"/>
``` 



让我们来解释一下：
>- **accountType（账户类型）** 是一个独一无二的名字，用来识别我们的账户类别。当其他app要通过我们的应用进行鉴权操作时。它需要明确知道这个名字来使用``AccountManager``。

>- **icon and smallIcon（图标和小图标）** 是在设备的Setting画面中，账户条目显示的图标。在账户确认画面（稍后会解释），它也会出现。

>- **label（标签）** 是在设备Setting画面中显示的代表我们账户的的字符串。

>- **accountPreferences（账户偏好）** 是一个偏好XML的引用。它将在通过设备的Setting画面中访问账户偏好时展现，它允许用户更好的控制庄户。作为例子，你可以看看Google及Dropbox的账户偏好画面，里面包含了一些可供调整的项。我的例子如下：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/account_prefs.png "Title")

##你需要了解的其他特性

在我调查的过程中，我发现了一些有意思的场景。为了让你使用相关API时不致想破头，我把它分享出来。

1. 检查账户的有效性 - 如果你打算为一个账户获取auth-token并自己存储起来，你应该先调用``AccountManager#getAccounts*()``方法来看看该账户是否存在。这里引用``AccountManager``的官方文档

“为一个设备上不存在的账户请求auth-token，将会导致未定义的失败。“

在我这，这个“未定义的失败“虽热调用了登录画面，但当我输入认证信息后却没有任何反应，所以你得注意一下。

1. 先进先服务 - 如果你复制了authenticator的相关代码到你的两个应用，二者具备相同的逻辑，但在每个应用中修改了自己的登录画面。在这种情况下，无论哪个应用需要请求auth-token，都会调用先安装的app的authenticator。如果你卸载了第一个应用，第二个应用的authenticator才会起作用（因为它是唯一有个了）。克服这个问题的一个技巧，是将不同的登陆页放到同一个authenticator中，并在调用``addAccount()`` 时，把各自的设计需求通过addAccountOptions 的参数传过去。

2. 为了安全，小心共享 - 如果你打算获取其他应用的``authenticator``生成的auth-token，并且该应用与你的应用具有不同的签名秘钥，用户必须显示的同意这个操作。用户将会看到如下画面：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/access_request.png "Title")

“Full access to..”字符串是通过我们的``Authenticator``的`` _getAuthTokenLabel()``方法获得。你可以为每一个auth-token类型指定一个标签，以便在类似的场景下对用户更加友好。

1, 存储密码 - ``AccountManager``并没有使用加密方法存储密码。所有的密码都明文存储。你不能对其他的``Authenticator``调用``peekAuthToken()`` 方法（获得其他``Authenticator``的auth-token）（会出现“caller uid X is different than the authenticator’s uid”错误），但root权限或adb命令却可以得到。在示例代码中，存储明文密码是为了让已经过期的token自动登录更方便。在大多数场合中，我选择更加安全的方式，但有的时候，为用户的错误牺牲便利性是不值得的——如果有人获得了root权限并能在设备上执行adb命令，那与获得用户的“最高分“比起来，他可以做到更大的危害。


##接下来？


现在，你已经对这个很棒的服务比较熟悉了。你可以在Google Play上[下载我开发的样例程序](https://play.google.com/store/apps/details?id=com.udinic.accounts_example)。它会在你的设备创建“Udinic account”类型的账户，验证则会通过Parse.com账户来进行。样例应用提供了下面几项功能：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/sample-app.png "Title")

**getAuthToken**按钮首先会查询设备上是否有“Udinic”类型的账户。如果有，它通过调用``AccountManager#getAuthToken()``来返回token。如果有多个token，它将弹出一个对话框让用户选择打算使用哪一个。


**getAuthTokenByFeatures** 调用了``AccountManager``提供的一个很棒很方便的同名方法，它会为你完成所有的工作。它也会查询``AccountManager``中是否包含目标类型“Udinic”。它的行为遵循以下步骤：
>- 没有账户时: 调用``_ addAccount()_ ``让用户创建一个账户。此后，自动调用``getAuthToken()``获取token。
>- 存在账户时：获取auth-token。
>- 有两个账户或更多时：创建一个账户选择对话框，并返回用户所选账户的token。


如果你打算让token失效，你可以用``invalidateAuthToken``按钮。注意：Udinic authenticator知道如何恢复失效token，就像之前示例代码中所展示的那样，通过``getAuthToken()``方法。那意味着，在让token失效后，``getAuthToken``按钮仍然可以返回token，但只在它向服务器请求成功之后。你可以在LogCat中通过查看网络状态来确认。删除帐户只能通过设备的Setting菜单。

你可以在[Github](https://github.com/Udinic/AccountAuthenticator)上下载相关源代码。里面包含了2个样例应用，所以你可以尝试下2个应用之间共享相同的``Authenticator``。比如：使用不同的签名密钥打包程序，一个应用请求由另一个应用创建的auth-token。你也可以尝试创建一个``authenticator``的apklib（apk库），并在不同的应用中重用它。如果你有意见或建议，别犹豫直接在文章后面指出或在Github上提出PR吧。

