开发你自己的Android授权管理器
---

> * 原文链接 : [Write your own Android Authenticator](http://blog.udinic.com/2013/04/24/write-your-own-android-authenticator)
* 原文作者 : [UDI COHEN](http://blog.udinic.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [kevinhong](https://github.com/kevinhong) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 



When I wrote Any.DO’s sync system, about 18 months ago, I wanted to use the built in AccountManager API to authenticate and store the users’ credentials. When I used it to access Google accounts it seems a pretty simple experience, so I thought I should do that for Any.DO as well. It also goes very well with a sync mechanism (using a SyncAdapter), making it the perfect solution. The problem - no good documentation was out there. The developers community didn’t have much experience with that back then, and since we didn’t have much time to figure out issues that could arise from this “No man’s land”, a decision was made to use other methods.

But times have changed...

18个月之前，我在开发Any.DD同步系统时，打算使用安卓提供的AccountManager API实现认证的相关功能并存储用户秘钥。当我用它来访问Google账号时，一切都非常简单，所以我想Any.DD就用这个API来做吧。确实，使用SyncAdapter进行同步操作进展很顺利，看起来的确是一个完美的方案。但它的问题也随之出现——没有好的文档，开发者社区也没能提供太多可供参考的经验，而我们也没有太多时间来研究这个“无人之地“引发的各种问题。所以当时决定使用其他方案。

但是，今非昔比...

I recently studied that feature again for a project I’m working on, and saw there’s a huge improvement with the knowledge about it. Besides the better documentation on the Android.com site, more and more tutorials went out to the wild, feeding us with knowledge about the mysteries of the notorious Account Manager. Some tales were told about the road to create your own account. I read pretty much all of them. 

But..they all still miss something.

因为一个最近着手的项目，我最近又开始研究相关功能，我突然发现这方面知识的丰富程度有了巨大的提升。包括Android.com上的更好的文档，外面的教程（[1]  [2]）也逐渐丰富了起来。让我们了解到声名狼藉的Account Manager的神秘之处。坊间传闻的用来创建个人账户的方式，我几乎全都读了。
[1]: http://www.finalconcept.com.au/article/view/android-account-manager-step-by-step-2        "教程1" 
[2]: http://www.c99.org/2010/01/23/writing-an-android-sync-provider-part-1/        "教程2" 

但是，好像还是缺点什么。

I didn’t feel that I actually know everything I wanted to know about the process, and some parts weren’t clear enough. So I did what I usually do when I want to know everything about something - investigate it “Jack Bauer style”! This post is the in-depth conclusion of my journey, with all the quirks and features that this service provides and I thought was important enough to find out. There will be a followup post about Sync Adapters as well, so I recommend RSS/Twitter subscribing to be notified…if you’re into this kind of stuff. I’ve been pretty thorough learning all those features, not just the basic stuff as all other tutorials did, but if I forgot something - please let me know by commenting this post.

我感觉整个流程并非尽知，有些部分并没有足够清楚。所以我决定用我的方法调查它——就像我平时想要了解一件事情所用的方法一样——用“杰克鲍尔“的方式。我发表了这篇深入调查后的结论性文章，包含了所有这个服务所能提供的功能和一些我觉得重要的需要发掘的细节。后面，我还会贴出一篇关于“Sync Adapter“的文章，所以如果读者感兴趣，我建议读者通过RSS或Twitter来订阅（我的博客）。我还是比较了解这方面的诸多细节，不仅仅是教程提供的简单功能。但如果我遗漏了什么，请在评论中指出。

## Why Account Manager?
## 为什么选择 Account Manager?

Why really?

Why not just write a simple sign-in form, implement a submit button that post the info to the server and return an auth token? The reason for that is the extra features you get and in the small details that you don’t always cover. All those “corners” that developers often miss when they need their users to sign-in, or dismiss by saying “This will happen to 1 out of 100000 users! It’s nothing!”. What happens if the user changes the password on another client? Has an expired auth-token? Runs a background service that doesn’t have a UI the user can interact with? Wants the convenience of logging-in once and get automatically authenticated on all account-related app (like all Google’s apps do)?

为什么？

为什么不是写一个简单的登录表单，实现一个提交按钮，发送（post）所有信息到服务器，然后服务器返回一个鉴权令牌（auth token）？原因在于有很多（与用户鉴权相关的）附加功能和小细节你未必能考虑周全。这些容易被开发者忽略的小细节可能导致用户重新登录，或者被“100000个用户才会出现一次，无所谓“的声音 忽略掉。用户如果在另外一个客户端修改密码该如何处理？auth-token的过期判断呢？是要运行一个没有用户交互UI的后台服务吗？
想要用户登录一次，相关APP就可以自动登录的便利吗？（就像Google的APP那样）


Reading this article will probably make you think it’s complicated stuff, but it’s not! Using the Account Manager actually simplifies the authentication process for most cases, and since I’m already giving you a working code sample - why not use it :)


读这篇文章之前或许让你感觉有些东西太复杂，但其实不是。对于绝大多数应用场景来说， Account Manager都简化了登录过程。而且我也给你提供了代码样例，还有什么理由不用呢？

So, to recap the benefits:

Pros: Standard way to authenticate users. Simplifies the process for the developer. Handles access-denied scenarios for you. Can handle multiple token types for a single account (e.g. Read-only vs. Full-access). Easily shares auth-tokens between apps. Great support for background processes such as SyncAdapters. Plus, you get a cool entry for your account type on the phone’s settings:

好吧，让我们来看看（使用 Account Manager）都有哪些好处：
好处：标准的用户鉴权方式；为开发者简化了登录的流程；处理访问拒绝的场景；可以为一个账户处理不同类型的访问令牌（如：只读、全权限）；轻松的在不同程序间共享令牌；有如Sync Adapter这样的后台处理的良好支持；并且，在手机的Setting界面中有一个很酷的入口：

![alt text](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/accounts2.png "Title")

Look mom, my name is on the settings screen!

看，妈妈，我的"名纸"在设置屏幕！

Cons: Requires learning it. But hey, that’s what you’re here for, isn’t it?

The steps we’ll performs to get this done:
1. Creating our Authenticator - the brain behind this operation
2. Creating the Activities - in those the user will enter his credentials
3. Creating the Service - through it we can communicate with the authenticator

But first, some definitions.

缺陷：需要学习它！但是，嗨，这不就是你读此文的目的吗？

要实现这些功能，需要下面几步：
1. 创建Authenticator，这是所有操作的核心
2. 创建若干Activity，用户可以在其中输入验证需要的信息
3. 创建Service，通过Service我们可以与Authenticator进行交互

首先，（来看）一些概念。

## Authenti..what?
## Authenti..啥?

Authentication Token (auth-token) -  A temporary access token (or security-token) given by the server. The user needs to identify to get such token and attach it to every request he sends to the server. On this post I’ll use OAuth2 as the authentication standard, since it’s the most popular method there is.

**授权令牌 (Authentication Token，[auth-token](http://en.wikipedia.org/wiki/Security_token))** -  是由服务器提供的一个临时的访问令牌。所有需要识别用户的请求，在发送到服务器时都要带着这个令牌。在这篇文章中，我们使用[OAuth2](http://en.wikipedia.org/wiki/OAuth)，它也是现在最为流行的方法。

Your authenticating server - The server that will manage all the users that use your product. It will generate an auth-token for any user that logs in and verify it for every request the user makes on your server. The auth-token can be time limited and expire after a period of time.


**授权服务器** - 用来管理所有用户的服务器。它将会为登录到服务器的用户生成授权令牌（auth-token），并且校验所有的用户请求（是否合法）。授权令牌有时间限制，过期后将时效。



AccountManager - Managing all the accounts on the device and pretty much running the show. Apps can request auth-tokens from it and that’s its job to get it done. Whether it means it needs to open a new “Sign-in”/”Create account” activity, or retrieving a stored auth-token that was previously requested, the AccountManager knows who to call and what to do on each scenario to get the job done.

**AccountManager** - 管理设备上的所有账户，也是这项功能的核心。App从AccountManager获得auth-token，它也将决定是否该打开登录、创建用户的Activity，或者从之前的请求中返回一个已经存储好的auth-token。AccountManager了解不同场景下该调用何种操作。



AccountAuthenticator - A module to handle a specific account type. The AccountManager find the appropriate AccountAuthenticator talks with it to perform all the actions on the account type. The AccountAuthenticator knows which activity to show the user for entering his credentials and where to find any stored auth-token that the server has returned previously. This can be common to many different services under a single account type. For instance, Google’s authenticator on Android is authenticating Google Mail service (Gmail) along with other Google services such as Google Calendar and Google Drive.

**AccountAuthenticator** - 是一个为具体账户类型提供鉴权处理过程的组件。AccountManager查找合适的AccountAuthenticator，与其通信，并根据账户类型执行所有动作。AccountAuthenticator知道哪个Activity用来让用户输入登录信息，也知道服务器上次返回的auth-token在哪里存储。在一个账户类型下，多个不同的服务也会共用同一个AccountAuthenticator。比如Google的AccountAuthenticator为GMail提供认证服务，也为其他的Google程序，如：Google Calendar和Google Drive提供授权服务。

AccountAuthenticatorActivity - Base class for the “sign-in/create account” activity to be called by the authenticator when the user needs to identify himself. The activity is in charge of the sign-in or account creation process against the server and return an auth-token back to the calling authenticator

AccountAuthenticatorActivity - “登录／创建用户“Activity的基类，当用户需要认证的时候，authenticator调用会这个Activity。这个Activity负责用户登录或用户创建过程，并将auth-token返回给
authenticator。


Whenever your app needs an auth-token, it only talks with one method, the AccountManager#getAuthToken(). The AccountManager will take it from there and jump through hoops to get you that token. Here’s a nice diagram of the process from Google’s documentation:

当你的App需要auth-token时，只需调用 AccountManager#getAuthToken()。AccountManager将负责一切必须的步骤直到给你拿到auth-token。Google提供了一个流程图展现了整个过程：


![Google-AccountManager-Process-Daigram](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/oauth_dance1.png "Title")

It may look a little cumbersome, but it’s fairly simple. I’ll explain the common case where we log-in to an account for the first time on the device.

这图看起来有点繁琐，但其实它很简单。我将通过用户首次在设备上登陆的场景来进行解释。

First time logging-in
>- The app asks the AccountManager for an auth-token.
>- The AccountManager asks the relevant AccountAuthenticator if it has a token for us.
>- Since it has none (there’s no logged-in user), it show us a AccountAuthenticatorActivity that will allow the user to log-in.
>- The user logs-in and auth-token is returned from the server.
>- The auth-token is stored for future use in the AccountManager.
>- The app gets the auth-token it requested

Everyone’s happy!


用户首次登陆时
>- App向AccountManager请求auth-token。
>- AccountManager 询问与其关联的 AccountAuthenticator 是否保存了有效的token
>- 由于目前还没有（用户还没有登陆嘛），他将调用 AccountAuthenticatorActivity 来让用户登录。
>- 用户正常登陆，服务器返回了auth-token。
>- AccountManager存储了auth-token以备将来使用。
>- App获得了它想要的auth-token

皆大欢喜！

In case the user has already logged-in, we would get the auth-token back already on the second step. You can read more about authenticating using OAuth2 here.

Now that we know the basics, let’s see how to create our own account type authenticator.

在用户已经登陆的情况下，上述的第二步将直接返回auth-token。你可以在[这里](http://developer.android.com/training/id-auth/authenticate.html)获得更多如何使用OAuth2进行认证的文章。

现在，我们已经了解了基础知识。现在来看看如何建立一个自有账户类型的authenticator。

##Creating our Authenticator
##建立我们自己的Authenticator

As written earlier, the Account Authenticator is the one that gets addressed by the AccountManager to fulfill all account relevant tasks: Getting stored auth-token, presenting the account log-in screen and handling the user authentication against the server.

如前文所述， Account Authenticator 由AccountManager管理并满足账户相关的所有任务：存储auth-token；展现账户登录屏幕；处理服务器的用户登录。

Creating our own Authenticator requires extending AbstractAccountAuthenticator and implementing some methods. Let’s focus for now on the 2 main methods:

建立我们自己的Authenticator需要继承AbstractAccountAuthenticator并实现一些方法。我们现在来关注其中两个主要方法：

###addAccount
Called when the user wants to log-in and add a new account to the device.

We need to return a Bundle with the Intent to start our _AccountAuthenticatorActivity _(explained later). This method can be called by the app itself by calling AccountManager#addAccount() (requires a special permission for that) or from the phone’s settings screen, as seen here:

Add an account from the device’s Settings


###addAccount

当用户打算登录并在一个设备上新建账户时，会调用这个方法。

我们需要返回一个Bundle，其中包含一个会启动我们自己的_AccountAuthenticatorActivity（稍后解释）的Intent，这个方法在app通过调用AccountManager#addAccount() (需要特殊权限)时被调用。或者在手机设置	中，用户点击“添加新用户“时被调用，即： 


![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/account_add_from_setting.png "Title")

Example:
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

###getAuthToken

Explained by the diagram above. Gets a stored auth-token for the account type from a previous successful log-in on this device. If there’s no such thing - the user will be prompted to log-in. After a successful sign-in, the requesting app will get the long-awaited auth-token. To do all that, we need to check the AccountManager if there’s an available auth-token by using AccountManager#peekAuthToken(). If there isn’t we return the same result as for addAccount().

如上面的流程图所示，getAuthToken可以获取存储在设备上的已经登陆成功用户的auth-token。如果auth-token不存在，将会提示用户登录。在成功登陆之后，请求auth-token的app会“长等待“此token。为了避免此情况，我们应该通过 AccountManager#peekAuthToken()来检查AccountManager是否已经存在一个有效的auth-token。如果没有，我们应该返回与addAccount()相同的结果。


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

If the auth-token we got from this method is not valid anymore, because of time expiration or changed password from a different client, you need to invalidate the current auth-token on the AccountManager and ask for a token once again. Invalidating the current token is done by calling AccountManager#invalidateAuthToken(). The next call to getAuthToken() will try to log-in with the stored password and if it fails - the user will have to enter his credentials again.

So..where will the user enter his credentials? That’ll be in our derivation for AccountAuthenticatorActivity


如果我们通过此方法获得的auth-token已经无效了，比如过期了或者用户从其他客户端修改了密码。我们应该调用AccountManager#invalidateAuthToken()使当前存储在AccountManager的auth-token失效，并调用getAuthToken() 再次请求auth-token。再次调用 getAuthToken() 时会尝试使用之前存储的密码进行登陆，如果失败，用户将必须再次输入登陆信息。

所以，用户要在哪输入验证信息？这就是AccountAuthenticatorActivity了。

##Creating the Activity
##创建Activity

Our AccountAuthenticatorActivity is the only direct interaction that we have with the user.

This activity will show the user a log-in form, authenticate him with our server, and return the result to the calling authenticator. The reason we extend from AccountAuthenticatorActivity, and not just from the regular Activity, is the setAccountAuthenticatorResult() method. This method is in charge of taking back the result from the authentication process on the activity and return it to the Authenticator, who called this activity in the first place. It saves us the need to keep a response interface to communicate with the Authenticator ourselves.

I built a simple username/password form on my Activity. You can use the Login Activity Template suggested on the Android site. When submitting I call this method:

[AccountAuthenticatorActivity](http://developer.android.com/reference/android/accounts/AccountAuthenticatorActivity.html)是整个过程中唯一直接与用户交互的Activity。

Authenticator首先调用这个Activity，此Activity将展现一个用户登录表单，发送到服务器鉴权用户，并将结果传给authenticator。我们继承AccountAuthenticatorActivity，不仅要实现常规Activity的功能，还要实现setAccountAuthenticatorResult()方法。此方法负责将鉴权过程的结果发送给Authenticator。It saves us the need to keep a response interface to communicate with the Authenticator ourselves.

我在我的Activity中构建了一个简单的用户名／密码表单。你可以使用Android官方网站上建议使用的登录Activity模版，提交时，我进行了以下操作：

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

sServerAuthenticate is the interface to our authenticating server. I implemented methods such as userSignIn and userSignUp that return the auth-token from the server, upon a successful log-in.

mAuthTokenType is the type of token that I request from the server. I can have the server give me different tokens for read-only or full access to an account, or even for different services within the same account. A good example is the Google account, which provides several auth-token types: “_Manage your calendars”, “Manage your _tasks”, “View your calendars” and more.. On this particular example I don’t do anything different for the various auth-token types.

When I finish, I call finishLogin():


sServerAuthenticate是与服务器进行认证的接口，我实现了了其中例如userSignIn（用户登录）和userSignUp（用户注册）的方法，这些方法会在登录成功时获得服务器返回的auth-token。

mAuthTokenType是我从服务器请求的令牌的类型。我可以让服务器给我不同的令牌例如只读或全访问，或者在相同的账户下的不同服务。一个好的列子是Google‘账号，它的令牌类型包括：“_Manage your calendars”（管理日历）, “Manage your _tasks”（管理任务）, “View your calendars”（查看日历）等等。在这个列子中，我不会为不同类型的令牌区分不同的操作。


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

This method gets a fresh auth-token and do the following:

1. Existing account with an invalidated auth-token - in this case, we already have a record on the AccountManager. The new auth-token will replace the old one without any action by you, but if the user had changed his password for that, you need to update the AccountManager with the new password too. This can be seen in the code above.

2. You add a new account to the device - that’s a tricky part. When creating an account, the auth-token is NOT saved immediately to the AccountManager, it needs to be saved explicitly. That’s why I’m setting the auth-token explicitly after adding the new account to the AccountManager. Failing to do so, makes the AccountManager do another trip to the server, when the getAuthToken method is called, and authenticating the user again.


通过上面的方法我们获得了一个全新的auth-token，具体细节如下：

1. 在这个案例中，AccountManager已经存在了一条记录，它是一个已经失效了的auth-token。新的auth-token会替代原有的，此时你不需要做任何操作。但如果用户的密码已经修改，你需要向AccountManager更新用户密码，就像上面代码中实现的那样。

2. 添加了一个新的账户到设备 —— 这是有技巧的部分。当新账户创建时，auth-token并没有立刻保存到AccountManager，你需要显示的设置auth-token。这也是我在添加完账户之后，又明确的设置auth-token的原因。如果设置失败了，AccountManager将会再到服务器执行获取auth-token的过程，这时getAuthToken会被调用，并再次进行用户鉴权。

Note: The third argument to addAccountExplicitly() is a “user data” Bundle, which can be used to store custom data, such as API key to your service, right with the other authentication related data on the AccountManager. This can also be set by using setUserData().

注意：addAccountExplicitly() 的第三个参数，是用户数据Bundle，它可以用在AccountManager保存其他认证信息的同时存储一些自定义信息，比如你的服务的API Key。当然这些信息也可以通过setUserData()设置。


After the log-in process done by this Activity, we have the AccountManager all set up with our account. The call to setAccountAuthenticatorResult() returns the information back to the Authenticator.

在Activity完成登陆之后，我们已经为AccountManager建立了我们的账户。最后调用 setAccountAuthenticatorResult() 将信息传回给Authenticator。

Now we have the process ready to go, but who will start it? How will it gain access to it? We need to make our Authenticator available for all the apps that want to use it, including the Android settings screen. Since we also want it to run in the background (The log-in screen is optional), using a Service is the obvious choice.

现在一切流程准备就绪，那谁来启动这个过程呢？（其他应用）如何来访问它？我们需要让我们的Authenticator对其他想使用它的应用可用，因此我们需要让Authenticator在后台运行（还可以调用登录屏幕），使用Service是一个明显的选择。

##Creating the Service
##创建Service

Our service will be very simple.

All we want to do, is letting other processes bind with our service and communicate with our Authenticator. Luckily for us, the AbstractAccountAuthenticator, which our Authenticator extends, has a getIBinder() method that returns an implementation to IBinder. Our service needs to call it on its onBind() method and that it! The basic implementation takes care of calling the appropriate methods on the Authenticator by the request of an outside process. To see how it’s actually done, you can take a look on Transport, an inner class of AbstractAccountAuthenticator and read about AIDL for inter-process communication.

Here’s how our service will look like:

Service非常简单。

我们要做的，是让其他的进程与我们的服务绑定，并于Authenticator交互。幸运的是，Authenticator的父类AbstractAccountAuthenticator提供了getIBinder() 方法，该方法返回了一个IBInder实现。我们的服务需要在onBind()方法中调用它。这个基本的实现保证了其他进程请求Authenticator时进行适当的操作（原文为：“调用合适的方法“。译者注）。如果读者想了解其中的细节，可以看看Transport，一个AbstractAccountAuthenticator的内部类，并了解关于AIDL——进程间通信的一些知识。

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

Simple, huh?

The authenticator.xml, that we link as a resource, is used to define some attributes for our Authenticator. That’s how it looks:

很简单，是吧？
作为资源引用的authenticator.xml用来定义Authenticator用到的一些属性。

``` XML
<account-authenticator xmlns:android="http://schemas.android.com/apk/res/android"
                       android:accountType="com.udinic.auth_example"
                       android:icon="@drawable/ic_udinic"
                       android:smallIcon="@drawable/ic_udinic"
                       android:label="@string/label"
                       android:accountPreferences="@xml/prefs"/>
``` 

Let’s explain some of them:

>- **accountType** is a unique name to identify our account type. Whenever some app wants to authenticate with us, it needs to use this name when approaching the AccountManager.

>- **icon and smallIcon** are icons for the account to be seen on the device’s Settings page and on the account approve page (more on that later).

>- **label** is the string that represent our account when listed on the device’s Setting’s page.

>- **accountPreferences** is a reference to a Preferences XML. This will be shown when accessing the account’s preferences from the device Settings screen, allowing the user more control over the account. You can check the stuff Google and Dropbox are letting you change about their account for some examples. Here’s an example of my own:

让我们来解释一下：
>- **accountType（账户类型）** 是一个独一无二的名字，用来识别我们的账户类别。当其他app要通过我们的应用进行鉴权操作时。它需要明确知道这个名字来使用AccountManager。

>- **icon and smallIcon（图标和小图标）** 是在设备的Setting画面中，账户条目显示的图标。在账户确认画面（稍后会解释），它也会出现。

>- **label（标签）** 是在设备Setting画面中显示的代表我们账户的的字符串。

>- **accountPreferences（账户偏好）** 是一个偏好XML的引用。它将在通过设备的Setting画面中访问账户偏好时展现，它允许用户更好的控制庄户。作为例子，你可以看看Google及Dropbox的账户偏好画面，里面包含了一些可供调整的项。我的例子如下：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/account_prefs.png "Title")

##Random stuff you may want to know
##你需要了解的随机特性

During my investigation I ran into some interesting scenarios that I thought I’d share, keeping your hair intact while working with this API.

1. Check existing account validity - If you want to get an auth-token for an account name that you stored yourself, check that this account still exist first by using the AccountManager#getAccounts*() methods. I’ll quote the AccountManager’s documentation:

在我调查的过程中，我发现了一些有意思的场景。为了让你使用相关API时不致想破头，我把它分享出来。

1. 检查账户的有效性 - 如果你打算为一个账户获取auth-token并自己存储起来，你应该先调用AccountManager#getAccounts*()方法来看看该账户是否存在。这里引用AccountManager的官方文档


“Requesting an auth token for an account no longer on the device results in an undefined failure.”

“为一个设备上不存在的账户请求auth-token，将会导致未定义的失败。“

For me, the “undefined failure” was to bring the sign-in page and then do nothing after I submitted my credentials, so there you have it.

在我这，这个“未定义的失败“虽热调用了登录画面，但当我输入认证信息后却没有任何反应，所以你得注意一下。


1.  First in, first served - Let’s say you copied your authenticator’s code to 2 of your apps, thus sharing its logic, and altering the sign-in pages design on each app to fit the app it belongs to. In that case, the first installed app’s authenticator will be called for both apps when an auth-token will be requested. If you uninstall the first app, the second app’s authenticator will be called from now on (since it’s the only one now). A trick to overcome this will be to put both sign-in pages on the same authenticator, then use the addAccountOptions argument on the addAccount() method to pass your design requirment.

1. 先进先服务 - 如果你复制了authenticator的相关代码到你的两个应用，二者具备相同的逻辑，但在每个应用中修改了自己的登录画面。在这种情况下，无论哪个应用需要请求auth-token，都会调用先安装的app的authenticator。如果你卸载了第一个应用，第二个应用的authenticator才会起作用（因为它是唯一有个了）。克服这个问题的一个技巧，是将不同的登陆页放到同一个authenticator中，并在调用addAccount() 时，把各自的设计需求通过addAccountOptions 的参数传过去。


2. Sharing is caring..for security - If you try to get an auth-token from an authenticator that was created by a different app, which was signed using a different signing key, the user will have to explicitly approve this action. This is what the user will see:

2. 为了安全，小心共享 - 如果你打算获取其他应用的authenticator生成的auth-token，并且该应用与你的应用具有不同的签名秘钥，用户必须显示的同意这个操作。用户将会看到如下画面：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/access_request.png "Title")


The “Full access to..” string is retrieved from the our Authenticator’s _getAuthTokenLabel(). _You can specify different labels for each auth-token type, being more user friendly on cases like this.

“Full access to..”字符串是通过我们的Authenticator的 _getAuthTokenLabel()方法获得。你可以为每一个auth-token类型指定一个标签，以便在类似的场景下对用户更加友好。

1. Storing the password - The AccountManager is not secured by any encryption method. The passwords there are stored in plain text. You can’t peekAuthToken() to other Authenticators (You’ll get a “caller uid X is different than the authenticator’s uid”), but a root access and some adb commands will do the trick. In the sample code I’m storing the password for the convenience of auto-login the user in case of token expiration. It’s the ultimate trade-off between security and convenience. In most cases I would take the secure road, but for some it’s not worth the inconvenience caused to the user. If someone has a root access and can run adb commands on your device - he can do much more damage than accessing your user’s “high scores” table..

1, 存储密码 - AccountManager并没有使用加密方法存储密码。所有的密码都明文存储。你不能对其他的Authenticator调用peekAuthToken() 方法（获得其他Authenticator的auth-token）（会出现“caller uid X is different than the authenticator’s uid”错误），但root权限或adb命令却可以得到。在示例代码中，存储明文密码是为了让已经过期的token自动登录更方便。在大多数场合中，我选择更加安全的方式，但有的时候，为用户的错误牺牲便利性是不值得的——如果有人获得了root权限并能在设备上执行adb命令，那与获得用户的“最高分“比起来，他可以做到更大的危害。


##Now what?
##接下来？

Now that you got familiar with this great service, you can download from Google Play the sample authenticator that I wrote. It will allow you to create an “Udinic account” on your device. The authentication will be against a Parse.com account that I created for this cause. These are the options you get on the sample app:

现在，你已经对这个很棒的服务比较熟悉了。你可以在Google Play上[下载我开发的样例程序](https://play.google.com/store/apps/details?id=com.udinic.accounts_example)。它会在你的设备创建“Udinic account”类型的账户，验证则会通过Parse.com账户来进行。样例应用提供了下面几项功能：

![SettingScreen](http://blog.udinic.com/assets/media/images/2013-04-24-write-your-own-android-authenticator/sample-app.png "Title")

The **getAuthToken** button will query first all the Accounts from the type “Udinic” on the device. If there’s one, it’ll return its token by calling AccountManager#getAuthToken(). If there’s more than one, it’ll populate them on a dialog and let you choose which one you want.

**getAuthToken**按钮首先会查询设备上是否有“Udinic”类型的账户。如果有，它通过调用AccountManager#getAuthToken()来返回token。如果有多个token，它将弹出一个对话框让用户选择打算使用哪一个。


The **getAuthTokenByFeatures** calls a cool convenient method on the AccountManager by the same name, that do all the work for you. It’ll query the AccountManager for accounts with the requested type, “Udinic”, and its behavior is as follows:
  
>- There are no accounts: Starts_ addAccount()_ to allow the user to add a new account. After that, it will automatically call getAuthToken() on the created account to get the token for it.
>- There’s one account: Get its auth token.
>- There are 2 accounts or more: Create an account picker dialog and return the token of the account the user picked.

**getAuthTokenByFeatures** 调用了AccountManager提供的一个很棒很方便的同名方法，它会为你完成所有的工作。它也会查询AccountManager中是否包含目标类型“Udinic”。它的行为遵循以下步骤：
>- 没有账户时: 调用_ addAccount()_ 让用户创建一个账户。此后，自动调用getAuthToken()获取token。
>- 存在账户时：获取auth-token。
>- 有两个账户或更多时：创建一个账户选择对话框，并返回用户所选账户的token。

If you want to invalidate the token, you can use the invalidateAuthToken button. Note: The Udinic authenticator knows how to recover from invalidated tokens, as seen previously on the sample code for getAuthToken(). Meaning, after invalidating the token the getAuthToken button will still return a token, but it’ll be only after he asks for it again from the server. You can confirm that by looking at the LogCat and see network communication to the server in that case. Removing the account is possible only through the device’s settings screen.

如果你打算让token失效，你可以用invalidateAuthToken按钮。注意：Udinic authenticator知道如何恢复失效token，就像之前示例代码中所展示的那样，通过getAuthToken()方法。那意味着，在让token失效后，getAuthToken按钮仍然可以返回token，但只在它向服务器请求成功之后。你可以在LogCat中通过查看网络状态来确认。删除帐户只能通过设备的Setting菜单。

You can download the source code from GitHub: https://github.com/Udinic/AccountAuthenticator. There are 2 sample apps in there, allowing to play around with them since they both share the same Authenticator. For example: Use different signing keys for them and see the different flow for the user when one is asking for auth-token created by the other sample app. You can also try to create an apklib for the authenticator and reuse it across different apps. If you have a fix or a suggestion - don’t hesitate posting it here or as a Pull Request on GitHub.

你可以在Github上下载相关源代码：https://github.com/Udinic/AccountAuthenticator。里面包含了2个样例应用，所以你可以尝试下2个应用之间共享相同的Authenticator。比如：使用不同的签名密钥打包程序，一个应用请求由另一个应用创建的auth-token。你也可以尝试创建一个authenticator的apklib（apk库），并在不同的应用中重用它。如果你有意见或建议，别犹豫直接在文章后面指出或在Github上提出PR吧。

