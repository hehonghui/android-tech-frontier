Android 进行单元测试难在哪-part3
---

> * 原文链接 : [HOW TO MAKE OUR ANDROID APPS UNIT TESTABLE (PT. 1)](http://philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中 

Unit testing Android apps is hard, and sometimes it can be impossible. For the [past two posts](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-9/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part1.md), I’ve been explaining why android unit testing is so difficult. The main conclusion from [the last post](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-10/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part2.md) is that it is difficult/impossible to unit test our Android applications because of the way we are encouraged to structure them. Google seems to want us to put our business logic in app component classes (e.g., Activitys, Fragments, Services, etc.). This approach to writing Android applications is what I have been calling the “standard way.”

在 Android 应用中进行单元测试很困难，有时候甚至是不可能的。在[之前的两篇博文](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-9/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part1.md)中，我已经向大家解释了在 Android 中进行单元测试如此困难的原因。而[上一篇博文](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-10/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part2.md)我们通过分析得到的结论是：正是 Google 官方所提倡的应用架构方式使得在 Android 中进行单元测试变成一场灾难。因为在官方提倡的架构方式中，Google 似乎希望我们将业务逻辑都放在应用的组件类中（例如：Activity，Fragment，Service，等等……）。而这种开发方式也是我们一直以来使用的开发模板。

In this post, I outline an alternative approach to structuring Android applications that will make it easier to unit test them. As I pointed out in the [introduction to this series](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-8/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-%E5%BA%8F.md), the approach that I suggest is a generalization of the approach that Square uses to [remove Fragments from their applications](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html). Since this approach is inspired by the folks at Square, I will call it “the square way.”

在这篇博文中，我列举出几种架构 Android 应用的方法，使用这些方法进行开发能让单元测试变得轻松些。但正如我在[序](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-8/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-%E5%BA%8F.md)中所说，我最推崇的办法始终是[ Square 在他们的应用中抛弃 Fragment ](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html)所用的通用方法。因为这个方法是由 Square 中的 Android 开发工程师想出来的，所以我会在接下来的博文中将这个办法叫作“Square 大法”。

The heart of the square way way is this: remove all business logic from app component classes (e.g., Activitys, Fragments, Services) and place that logic into “business objects,” POJO objects whose dependencies are injected, android-specific implementations of android-agnostic interfaces. If we follow the square way of developing our apps, we will be in a better position to unit test them. In this post, I explain how the square way would have us refactor non-UI app components like the SessionCalendarService I’ve been discussing for the past few posts.

Square 大法的核心思想是：把应用组件类中的业务逻辑全部移除（例如：Activity，Fragment，Service，等等……），并且把业务逻辑转移到业务对象，而这些业务对象都是被依赖注入的纯 Java 对象，以及与 Android 无关的接口在此的 Android 特定实现。如果我们在开发应用的时候使用 Square 大法，那进行单元测试就简单多了。在这篇博文中，我会解释 Square 大法是如何帮助我们重构 UI 无关的应用组件（例如我们在之前的博文中讨论的 SessionCalendarService），并让对它进行单元测试变得容易许多。

##The Square Way For Non-UI App Components
## 用 Square 大法重构 UI 无关应用组件

Following the square way for non-ui app components like Services, Content-Providers, and BroadcastReceivers is relatively straightforward. Again, the basic approach is remove the business logic within these classes and place that logic into a business object.

用 Square 大法重构类似于 Service，ContentProvider，BroadcastReceiver这样的 UI 无关的应用组件相对来说比较容易。我再说一次我们要做的事情吧：把在这些类中的业务逻辑移除，并把它们放到业务对象中。

Since “business logic” is one of those tricky phrases that seems to have multiple meanings, let clarify what I mean. When I say “business logic,” I’m using it in the same way that Wikipedia does: I’m referring to the “part of the program that encodes the real-world business rules that determine how data can be created, displayed, stored, and changed.” Now, that we’re clear about the meaning of “business logic,” we can see start to see what the square way looks like in action.

由于“业务逻辑”是很容易有歧义的词语，我来解释下我使用“业务逻辑”这个词时，它所代表的含义吧。当我提到“业务逻辑”，它的含义和维基百科上的解释是一致的：程序中根据现实世界中的规则用于决定数据将如何被创建，展示，储存和修改的那部分代码。那么现在我们就可以就“业务逻辑”这个词的含义达成共识了，那就来看看 Square 大法到底是啥吧。

Let’s look at how the square way would have us write the SessionCalendarService that I introduced in the last post. Right now, the SessionCalendarService looks like this:

我们先来看看怎么用 Square 大法实现我在之前的博文中介绍的 SessionCalendarService 吧，具体代码如下：

```java
/**
 * Background {@link android.app.Service} that adds or removes session Calendar events through
 * the {@link CalendarContract} API available in Android 4.0 or above.
 */
public class SessionCalendarService extends IntentService {
    private static final String TAG = makeLogTag(SessionCalendarService.class);
 
    //...
 
    public SessionCalendarService() {
        super(TAG);
    }
 
    @Override
    protected void onHandleIntent(Intent intent) {
        final String action = intent.getAction();
        Log.d(TAG, "Received intent: " + action);
 
        final ContentResolver resolver = getContentResolver();
 
        boolean isAddEvent = false;
 
        if (ACTION_ADD_SESSION_CALENDAR.equals(action)) {
            isAddEvent = true;
 
        } else if (ACTION_REMOVE_SESSION_CALENDAR.equals(action)) {
            isAddEvent = false;
 
        } else if (ACTION_UPDATE_ALL_SESSIONS_CALENDAR.equals(action) &&
                PrefUtils.shouldSyncCalendar(this)) {
            try {
                getContentResolver().applyBatch(CalendarContract.AUTHORITY,
                        processAllSessionsCalendar(resolver, getCalendarId(intent)));
                sendBroadcast(new Intent(
                        SessionCalendarService.ACTION_UPDATE_ALL_SESSIONS_CALENDAR_COMPLETED));
            } catch (RemoteException e) {
                LOGE(TAG, "Error adding all sessions to Google Calendar", e);
            } catch (OperationApplicationException e) {
                LOGE(TAG, "Error adding all sessions to Google Calendar", e);
            }
 
        } else if (ACTION_CLEAR_ALL_SESSIONS_CALENDAR.equals(action)) {
            try {
                getContentResolver().applyBatch(CalendarContract.AUTHORITY,
                        processClearAllSessions(resolver, getCalendarId(intent)));
            } catch (RemoteException e) {
                LOGE(TAG, "Error clearing all sessions from Google Calendar", e);
            } catch (OperationApplicationException e) {
                LOGE(TAG, "Error clearing all sessions from Google Calendar", e);
            }
 
        } else {
            return;
        }
 
        final Uri uri = intent.getData();
        final Bundle extras = intent.getExtras();
        if (uri == null || extras == null || !PrefUtils.shouldSyncCalendar(this)) {
            return;
        }
 
        try {
            resolver.applyBatch(CalendarContract.AUTHORITY,
                    processSessionCalendar(resolver, getCalendarId(intent), isAddEvent, uri,
                            extras.getLong(EXTRA_SESSION_START),
                            extras.getLong(EXTRA_SESSION_END),
                            extras.getString(EXTRA_SESSION_TITLE),
                            extras.getString(EXTRA_SESSION_ROOM)));
        } catch (RemoteException e) {
            LOGE(TAG, "Error adding session to Google Calendar", e);
        } catch (OperationApplicationException e) {
            LOGE(TAG, "Error adding session to Google Calendar", e);
        }
    }
    
    //...
}
```

As you can see, the SessionCalendarService calls on helper methods that it defines later on. Once we tally up these helper methods and the class’ field declarations, the Service is 400+ lines long. Its certainly not a trivial task to get a handle on what’s happening in the class, and, as we already saw last post, there’s no way to unit test SessionCalendarService.

Let’s see how the square way would have us write this. Again, the square way requires us to move the business logic out of android classes and move them into a business object. The business object for the SessionCalendarService is a SessionCalendarUpdater, and this is what it looks like:

如你所见，SessionCalendarService 调用了将要在后面定义的 helper 方法。一旦我们将这些 helper 方法和类的字段声明也考虑进来，Service 类的代码就有400多行。要 hold 住这么庞大的类内发生的业务逻辑可不是什么简单的活，而且就像我们在上一篇博文中看到的那样，要在 SessionCalendarService 中进行单元测试简直是天方夜谭。

那现在来看看用 Square 大法实现它代码会是怎样的。我再强调一次：Square 大法需要我们将 Android 类内的业务逻辑迁移到一个业务对象中。在这里，SessionCalendarService 所对应的业务对象则是 SessionCalendarUpdater，具体代码如下：

```java
public class SessionCalendarUpdater {
 
    //...
 
    private SessionCalendarDatabase mSessionCalendarDatabase;
    private SessionCalendarUserPreferences mSessionCalendarUserPreferences;
 
    public SessionCalendarUpdater(SessionCalendarDatabase sessionCalendarDatabase,
                                  SessionCalendarUserPreferences sessionCalendarUserPreferences) {
 
        mSessionCalendarDatabase = sessionCalendarDatabase;
        mSessionCalendarUserPreferences = sessionCalendarUserPreferences;
    }
 
    public void updateCalendar(CalendarUpdateRequest calendarUpdateRequest) {
 
        boolean isAddEvent = false;
 
        String action = calendarUpdateRequest.getAction();
 
        long calendarId = calendarUpdateRequest.getCalendarId();
 
        if (ACTION_ADD_SESSION_CALENDAR.equals(action)) {
            isAddEvent = true;
 
        } else if (ACTION_REMOVE_SESSION_CALENDAR.equals(action)) {
            isAddEvent = false;
 
        } else if (ACTION_UPDATE_ALL_SESSIONS_CALENDAR.equals(action)
                && mSessionCalendarUserPreferences.shouldSyncCalendar()) {
 
            try {
 
                mSessionCalendarDatabase.updateAllSessions(calendarId);
 
            } catch (RemoteException | OperationApplicationException e) {
 
                LOGE(TAG, "Error adding all sessions to Google Calendar", e);
            }
 
        } else if (ACTION_CLEAR_ALL_SESSIONS_CALENDAR.equals(action)) {
 
            try {
 
                mSessionCalendarDatabase.clearAllSessions(calendarId);
 
            } catch (RemoteException | OperationApplicationException e) {
 
                LOGE(TAG, "Error clearing all sessions from Google Calendar", e);
            }
 
        } else {
            return;
        }
 
 
        if (!shouldUpdateCalendarSession(calendarUpdateRequest, mSessionCalendarUserPreferences)) {
            return;
        }
 
        try {
 
            CalendarSession calendarSessionToUpdate = calendarUpdateRequest.getCalendarSessionToUpdate();
 
            if (isAddEvent) {
 
                mSessionCalendarDatabase.addCalendarSession(calendarId, calendarSessionToUpdate);
            } else {
 
                mSessionCalendarDatabase.removeCalendarSession(calendarId, calendarSessionToUpdate);
            }
 
        } catch (RemoteException | OperationApplicationException e) {
            LOGE(TAG, "Error adding session to Google Calendar", e);
        }
    }
 
    private boolean shouldUpdateCalendarSession(CalendarUpdateRequest calendarUpdateRequest, 
                                                SessionCalendarUserPreferences sessionCalendarUserPreferences) {
 
        return calendarUpdateRequest.getCalendarSessionToUpdate() == null || !sessionCalendarUserPreferences.shouldSyncCalendar();
    }
}
```

I want to highlight a few things about this gist. First, notice that you don’t see the new keyword at all. Because a business object’s dependencies are injected, it never uses the new keyword. This is key for keeping the class unit testable. Second, you’ll notice that the class does not explicitly depend on the Android SDK. Because a business object’s dependencies are android-specific implementations of android-agnostic interfaces, it does not need to depend on the Android SDK.

我想要强调其中的一些要点：首先，需要注意，我们完全不需要用到任何新的关键字，因为业务对象的依赖都被注入了，它根本不会使用新的关键字，而这正是让类可单元测试的关键。其次，你会注意到类没有确切地依赖于 Android SDK，因为业务对象的依赖都是 Android 无关接口的 Android 特定实现，因此它不需要依赖于 Android SDK。

How do these dependencies get into the SessionCalendarUpdater? They are injected by the SessionCalendarService:

那么这些依赖是怎么添加到　SessionCalendarUpdater　类中的呢？是通过　SessionCalendarService　类注入进去的：

```java
/**
 * Background {@link android.app.Service} that adds or removes session Calendar events through
 * the {@link CalendarContract} API available in Android 4.0 or above.
 */
public class SessionCalendarService extends IntentService {
    private static final String TAG = makeLogTag(SessionCalendarService.class);
 
    public SessionCalendarService() {
        super(TAG);
    }
 
    @Override
    protected void onHandleIntent(Intent intent) {
        final String action = intent.getAction();
        Log.d(TAG, "Received intent: " + action);
 
        final ContentResolver resolver = getContentResolver();
 
        Broadcaster broadcaster = new AndroidBroadcaster(this);
 
        SessionCalendarDatabase sessionCalendarDatabase = new AndroidSessionCalendarDatabase(resolver,
                                                                                             broadcaster);
 
        SharedPreferences defaultSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
 
        SessionCalendarUserPreferences sessionCalendarUserPreferences = new AndroidSessionCalendarUserPreferences(defaultSharedPreferences);
 
        SessionCalendarUpdater sessionCalendarUpdater
                                    = new SessionCalendarUpdater(sessionCalendarDatabase,
                                                                 sessionCalendarUserPreferences);
 
        AccountNameRepository accountNameRepository = new AndroidAccountNameRepository(intent, this);
 
        String accountName = accountNameRepository.getAccountName();
 
        long calendarId = sessionCalendarDatabase.getCalendarId(accountName);
        CalendarSession calendarSessionToUpdate = CalendarSession.fromIntent(intent);
 
        CalendarUpdateRequest calendarUpdateRequest = new CalendarUpdateRequest(action, calendarId, calendarSessionToUpdate);
 
        sessionCalendarUpdater.updateCalendar(calendarUpdateRequest);
    }
}
```

Notice that this revised SessionCalendarService is full of new keywords. The presence of new keywords, however, in this class is not a problem. We can see this if we make a second observation about this gist: it contains no business logic. Because of this, there isn’t really a need to unit test this class. As long as we’re sure that we’ve called updateCalendar() on the SessionCalendarUpdater, the only errors that are likely to happen in this class are compile-time errors. There’s no need to write a test to check for conditions that the compiler already guards against.

值得注意的是，修改后的 SessionCalendarService 到处都是新的关键字，但这些关键字在类中并不会引起什么问题。如果我们花几秒时间略读一下要点就会明白这一点：SessionCalendarService 类中已经没有任何业务逻辑，因此 SessionCalendarService 类不再需要进行单元测试。只要我们确定在 SessionCalendarService 调用的是  SessionCalendarUpdater 类中的 updateCalendar() 方法，在 SessionCalendarService 唯一可能出现的就是编译时错误。我们完全不需要为此实现测试单元，因为这是编译器的工作，与我们无关。

For the reasons that I mentioned in my last post two posts, breaking up our Service like this will allow us to more easily unit test our business logic. A test for the SessionCalendarUpdater might look like this:

由于我在前两篇博文中提到的相关原因，将我们的 Service 类拆分成这样会使对业务逻辑进行单元测试变得非常简单，例如我们对 SessionCalendarUpdater 类进行单元测试的代码可以写成下面的样子：

```java
public class SessionCalendarUpdaterTests extends TestCase {
 
    public void testShouldClearAllSessions() throws RemoteException, OperationApplicationException {
 
        SessionCalendarDatabase sessionCalendarDatabase = mock(SessionCalendarDatabase.class);
 
        SessionCalendarUserPreferences sessionCalendarUserPreferences = mock(SessionCalendarUserPreferences.class);
 
 
        SessionCalendarUpdater sessionCalendarUpdater = new SessionCalendarUpdater(sessionCalendarDatabase,
                                                                                   sessionCalendarUserPreferences);
 
        CalendarUpdateRequest calendarUpdateRequest = new CalendarUpdateRequest(SessionCalendarUpdater.ACTION_CLEAR_ALL_SESSIONS_CALENDAR,
                                                                                0,
                                                                                null);
        
        sessionCalendarUpdater.updateCalendar(calendarUpdateRequest);
 
        verify(sessionCalendarDatabase).clearAllSessions(0);
    }
}
```

##Conclusion
## 结论

In addition to being unit testable, I think that this code is also easier to read and maintain. To be sure, there’s probably more that could be done to make it better, but I wanted to keep it as close to the old implementation as possible while also making the code unit testable. In the next post, I’ll explore what it looks like to apply the square way of structuring UI app component classes like Fragments and Activitys.

为了能够进行单元测试，我认为修改后的代码变得更易读和更易维护了。可以肯定的是，我们还有许多办法能让代码变得更好，但在让代码能够进行单元测试的过程中，我想让修改后的代码尽可能与修改前风格相似，所以我没有进行其他修改。在下一篇博文中，我将会教大家如何使用 Square 大法重构应用的 UI 组件（例如：Fragment 和 Activity）。