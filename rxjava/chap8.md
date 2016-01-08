# RxJava开发精要8 - 与REST无缝结合-RxJava和Retrofit

> 
> * 原文出自《RxJava Essentials》
* 原文作者 : [Ivan Morgillo](https://www.packtpub.com/books/info/authors/ivan-morgillo)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuxingxin](https://github.com/yuxingxin) 
* 项目地址 : [RxJava-Essentials-CN](https://github.com/yuxingxin/RxJava-Essentials-CN)

在上一章中，我们学习了如何使用调度器在不同于UI线程的线程上操作。我们学习了如何高效的运行I/O任务而不用阻塞UI以及如何运行耗时的计算任务而不耗损应用性能。在最后一章中，我们将创建一个最终版的`真实世界`的例子，用Retrofit映射到远程的API,异步的查询数据，从而不费力的创造一个丰富的UI。


## 项目目标

我们将在已存在的例子中创建一个新的`Activity`。这个`Activity`将会使用StackExchange API从stackoverflow检索最活跃的10位用户。使用这个信息，App将会展示一个用户的头像，姓名，名望数以及住址列表。对于每一位用户，app将会使用其居住城市和OpenWeatherMap API 来检索当地的天气预报，并展示一个小的天气图标。基于从StackOverflow检索的信息，app对列表的每一位用户将会提供一个`onClick`事件，它将会打开他们在个人信息中指定的个人网站或者打开Stack Overflow的个人主页。

## Retrofit

Retrofit是Square公司专为Android和Java设计的一个类型安全的REST客户端。它帮助你很容易的和任何REST API交互，它完美的集成R小Java：所有的JSON响应对象都被映射成原始的Java对象，并且所有的网络调用都基于Rxjava Observable这些对象。

使用API文档，我们可以定义我们从服务器接收的JSON响应数据。为了很容易的将JSON响应数据映射为我们的Java代码，我们将使用jsonschema2pojo(http://www.jsonschema2pojo.org)，这个灵活的服务将会生成我们所需要映射JSON响应数据的所有Java类。

当我们把所有的Java model准备好后，我们就可以开始建立Retrofit。Retrofi使用标准的Java接口来映射API路由。例如例子中，我们将使用来自API的一个路由，下面是我们Retrofit的接口：
```java
public interface StackExchangeService {
    @GET("2.2users?order=desc&sort=reputation&site=stackoverflow")
    Observable<User sResponse> getMostPopularSOusers(@Query("pagesize") int howmany);
}
```
`interface`接口只包含一个方法，即`getMostPopularSOusers`。这个方法用整型`howmany`作为一个参数并返回`UserResponse`的Observable。

当我们有了`interface`，我们可以创建`RestAdapter`类，为了更清楚的组织我们的代码，我们创建一个`SeApiManager`函数提供一种更适当的方式来和StackExchange API交互。
```java
public class SeApiManager {
    private final StackExchangeService mStackExchangeService;
    
    public SeApiManager() {
        RestAdapter restAdapter = new RestAdapter.Builder()
            .setEndpoint("https://api.stackexchange.com")
            .setLogLevel(RestAdapter.LogLevel.BASIC)
            .build();
        mStackExchangeService = restAdapter.create(StackExchangeService.class);
}

public Observable<List<User>> getMostPopularSOusers(int howmany) {
    return mStackExchangeService
    .getMostPopularSOusers(howmany)
    .map(UsersResponse::getUsers)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread());
}
```
为了简化例子，我们不再将这个类设计为它本应该设计为的单例。使用依赖注入解决方案，如Dagger2将会使代码质量更高。

创建`RestAdapter`类，我们为API客户端建立了几个重要的点。这个例子中，我们设置`endpoint`和`log level`。由于这个例子URL只是硬编码，使用外部资源来像这样存储数据很重要。避免在代码中硬编码字符串是一个好的实践。

Retrofit把`RestAdapter`类和我们的API接口绑定在一起后就创建结束。它返回给我们一个对象用来查询API。我们可以选择直接暴露这个对象，或者以某种方式封装依次来限制访问它。在这个例子中，我们封装它并只暴露`getMostPopularSOusers`方法。这个方法执行查询，让Retrofit解析JSON响应数据。获得用户列表，并返回给订阅者。正如你看到的，使用Retrofit、RxJava和Retrolambda，我们几乎没有模板代码：它非常紧凑并且可读性也高。

现在，我们已经有一个API管理者来暴露一个响应式的方法，它从远程API获取到数据并给I/O调度器，解析映射最后提供给我们的消费者一个简洁的用户列表。


## App架构

我们不使用任何MVC，MVP，或者MVVM模式。因为那不是这本书的目的，因此我们的`Activity`类将包含我们需要创建和展示用户列表的所有逻辑。


## 创建Activity类

我们将在`onCreate()`方法里创建`SwipeRefreshLayout`和`RecyclerView`；我们有一个`refreshList()`方法来处理用户列表的获取和展示，`showRefreshing()`方法来管理进度条和`RecyclerView`的显示。

我们的`refreshList()`函数看起来如下：
```java
private void refreshList() { 
    showRefresh(true);
    mSeApiManager.getMostPopularSOusers(10)
        .subscribe(users -> { 
            showRefresh(false);
            mAdapter.updateUsers(users);
        }, error -> { 
            App.L.error(error.toString());
            showRefresh(false);
        });
}
```
我们显示了进度条，从StackExchange API 管理器观测用户列表。一旦获取到列表数据，我们开始展示它并更新`Adapter`的内容并让`RecyclerView`显示为可见。

## 创建RecyclerView Adapter

我们从REST API获取到数据后，我们需要把它绑定View上，并用一个适配器填充列表。我们的RecyclerView适配器是标准的。它继承于`RecyclerView.Adapter`并指定它自己的`ViewHolder`：
```java
public static class ViewHolder extends RecyclerView.ViewHolder {
    @InjectView(R.id.name) TextView name;
    @InjectView(R.id.city) TextView city;
    @InjectView(R.id.reputation) TextView reputation;
    @InjectView(R.id.user_image) ImageView user_image;
    public ViewHolder(View view) { 
        super(view);
        ButterKnife.inject(this, view); 
    }
}
```
我们一旦收到来自API管理器的数据，我们可以设置界面上所有的标签：`name`,`city`和`reputation`。

为了展示用户的头像，我们将使用Sergey Tarasevich (https://github.com/nostra13/Android-Universal- ImageLoader)写的`Universal Image Loader`。UIL是非常有名的并且被测试出很好用的图片管理库。我们也可以使用Square公司的Picasso，Glide或者Facebook公司的Fresco。这只是根据你自己的爱好。重要的是无须重复造轮子：库能够方便开发者的生活并让他们更快速实现目标。

在我们的适配器中，我们可以这样：
```java
@Override
public void onBindViewHolder(SoAdapter.ViewHolder holder, int position) {
    User user = mUsers.get(position);
    holder.setUser(user); 
}
```
在`ViewHolder`，我们可以这样：
```java
public void setUser(User user) { 
    name.setText(user.getDisplayName());
    city.setText(user.getLocation());
    reputation.setText(String.valueOf(user.getReputation()));
    
    ImageLoader.getInstance().displayImage(user.getProfileImage(), user_image);
}
```

此时，我们可以允许代码获得一个用户列表，正如下图所示：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter8_1.png" width="240"/>

### 检索天气预报

我们加大难度，将当地城市的天气加入列表中。**OpenWeatherMap**是一个灵活的web service公共API，我们可以查询检索许多有用的预报信息。

和往常一样，我们将使用Retrofit映射到API然后通过RxJava来访问它。至于StackExchange API，我们将创建`interface`，`RestAdapter`和一个灵活的管理器：

```java
public interface OpenWeatherMapService {
    @GET("data2.5/weather")
    Observable<WeatherResponse> getForecastByCity(@Query("q") String city);
}
```

这个方法用城市名字作为参数提供当地的预报信息。我们像下面这样将接口和`RestAdapter`类绑定在一起：

```java
RestAdapter restAdapter = new RestAdapter.Builder()
        .setEndpoint("http://api.openweathermap.org")
        .setLogLevel(RestAdapter.LogLevel.BASIC)
        .build();
mOpenWeatherMapService = restAdapter.create(OpenWeatherMapService.class);
```
像以前一样，我们只需设置API端口和log级别：我们只需要立马做的两件事情。

`OpenWeatherMapApiManager`类将提供下面的方法：
```java
public Observable<WeatherResponse> getForecastByCity(String city) {
    return mOpenWeatherMapService.getForecastByCity(city)
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread());
}
```
现在，我们有了用户列表，我们可以根据城市名来查询OpenWeatherMap来接收天气预报信息。下一步是修改我们的`ViewHolder`类来为每位用户检索和使用天气预报信息从而根据状态来展示天气图标。

我们使用这些工具方法先验证用户主页信息并获得一个合法的城市名字：
```java
private boolean isCityValid(String location) {
    int separatorPosition = getSeparatorPosition(location);
    return !"".equals(location) && separatorPosition > -1; 
}

private int getSeparatorPosition(String location) { 
    int separatorPosition = -1;
    if (location != null) {
        separatorPosition = location.indexOf(","); 
    }
    return separatorPosition; 
}

private String getCity(String location, int position) {
    if (location != null) {
        return location.substring(0, position); 
    } else {
        return ""; 
    }
}
```
借助一个有效的城市名，我们可以用下面命令来获得我们所需要天气的所有数据：

```java
OpenWeatherMapApiManager.getInstance().getForecastByCity(city)
```
用天气响应的结果，我们可以获得天气图标的URL：

```java
getWeatherIconUrl(weatherResponse);
```
用图标URL，我们可以检索到图标本身：

```java
private Observable<Bitmap> loadBitmap(String url) {
    return Observable.create(subscriber -> {
        ImageLoader.getInstance().displayImage(url,city_image, new ImageLoadingListener() { 
            @Override
            public void onLoadingStarted(String imageUri, View view) {
            }
            
            @Override
            public void onLoadingFailed(String imageUri, View view, FailReason failReason) {
                subscriber.onError(failReason.getCause()); 
            }
            
            @Override
            public void onLoadingComplete(String imageUri, View view, Bitmap loadedImage) {
                subscriber.onNext(loadedImage);
                subscriber.onCompleted(); 
            }
            
            @Override
            public void onLoadingCancelled(String imageUri, View view) {
                subscriber.onError(new Throwable("Image loading cancelled"));
            }
         });
    });
}
```
这个`loadBitmap()`返回的Observable可以链接前面一个，并且最后我们可以为这个任务返回一个单独的Observable：

```java
if (isCityValid(location)) {
    String city = getCity(location, separatorPosition);
    OpenWeatherMapApiManager.getInstance().getForecastByCity(city)
        .filter(response -> response != null)
        .filter(response -> response.getWeather().size() > 0)
        .flatMap(response -> {
            String url = getWeatherIconUrl(response);
            return loadBitmap(url);
        })
    .subscribeOn(Schedulers.io())
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe(new Observer<Bitmap>() {
    
        @Override
        public void onCompleted() {
        }
        
        @Override
        public void onError(Throwable e) {
            App.L.error(e.toString()); 
        }
        
        @Override
        public void onNext(Bitmap icon) {
            city_image.setImageBitmap(icon); 
        }
    });
}
```
运行代码，我们可以在下面列表中为每个用户获得新的天气图标：

<img src="https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master/images/chapter8_2.png" width="240"/>


### 打开网站

使用用户主页包含的信息，我们将会创建一个`onClick`监听器来导航到用户web页面，如果有，或者是Stack Overflow个人主页。

为了实现它，我们简单实现`Activity`类的接口，用来在适配器触发Android的`onClick`事件。

我们的`Adapter ViewHolder`指定这个接口：

```java
public interface OpenProfileListener {
    public void open(String url); 
}
```

`Activity`实现它：

```java
[https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master.] implements SoAdapter.ViewHolder.OpenProfileListener { [https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master.]
    mAdapter.setOpenProfileListener(this); 
[https://github.com/yuxingxin/RxJava-Essentials-CN/raw/master.]

@Override
public void open(String url) {
    Intent i = new Intent(Intent.ACTION_VIEW);
    i.setData(Uri.parse(url)); 
    startActivity(i);
}
```

`Activity`收到URL并用外部Android浏览器打开它。我们的`ViewHolder`负责在用户列表的每个卡片上创建`OnClickListener`并检查我们是打开Stack Overflow用户主页还是外部个人站：

```java
mView.setOnClickListener(view -> { 
    if (mProfileListener != null) {
        String url = user.getWebsiteUrl();
        if (url != null && !url.equals("") && !url.contains("search")) {
            mProfileListener.open(url); 
        } else {
            mProfileListener.open(user.getLink()); 
        }
    }
)}；
```
一旦我们点击了，我们将直接重定向到预期的网站。在Android上，我们可以用RxAndroid的一种特殊形式（ViewObservable）以更加响应式的方式实现同样的结果。
```java
ViewObservable.clicks(mView)
    .subscribe(onClickEvent -> {
    if (mProfileListener != null) {
        String url = user.getWebsiteUrl();
        if (url != null && !url.equals("") && !url.contains("search")) { 
            mProfileListener.open(url);
        } else {
            mProfileListener.open(user.getLink());
        } 
    }
});
```
上面两块代码片段是等价的，你可以选择你最喜欢的那一种方式。


## 总结

我们的旅程结束了。你已经准备好将你的Java应用带到一个新的代码质量水平。你可以享受一个新的编码模式并用更流畅的思维方式接触你的日常编码生活。RxJava提供这样一种机会来以面向时间的方式考虑数据：所有事情都是持续可变的，数据在更新，事件在触发，然后你可以创建基于这些事件响应的，灵活的，运行流畅的App。

刚开始切换到RxJava看起来难并且耗时，但是我们经历了如何用响应式的方式有效地处理日常问题。现在你可以把你的旧代码迁移到RxJava上:给这些同步`getters`一种新的响应式生活。

RxJava是一个正在不断发展和扩大的世界。还有许多方法我们还没有去探索。有些方法甚至还没有，因为RxJava，你可以创建你自己的操作符并把他们推得更远。

Android是一个好玩的地方，但是它也有局限性。作为一个Android开发者，你可以用RxJava和RxAndroid克服它们中许多部分。我们用AndroidScheduler只简单提了下RxAndroid,除了在最后一章，你了解了`ViewObservable`。RxAndroid给了你许多：例如，`WidgetObservable`，`LifecycleObservable`。现在要更多的推动它取决于你了。

记得可观测序列就像一条河：它们是流动的。你可以“过滤”一条河，你可以“转换”一条河，你可以将两条河合并成一个，然后它仍旧时流动的。最后，它将成为你想要的那条河。

