Android 进行单元测试难在哪-part4
---

> * 原文链接 : [HOW TO MAKE OUR ANDROID APPS UNIT TESTABLE (PT. 2)](http://philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成


在**[上一篇博文](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-11/Android%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part3.md)**中，我给大家介绍了新的应用架构方式 - Square 大法，就像我之前说的，Square 大法是 Square 用于使 Fragment 内的业务逻辑能够进行单元测试的通用方法，我还给大家展示了如何使用 Square 大法重构 Google 的 IOSched 应用的 SessionCalendarService 类，使得对 SessionCalendarService 类内的业务逻辑进行单元测试由几乎不可能变为可行。而在今天的这篇博文中，我会和大家一起继续探索 Square 大法，让我们对应用的 UI 组件进行单元测试成为可能，也让测试变得容易。

## 这篇博文有“依赖”

将 Sqaure 大法应用到 App 的 UI 组件中（例如 Activity 和 Fragment） 比起将它应用到无 UI 的应用中要复杂一些，造成这种情况的根源正好与我们重构代码的核心方法相关联，解决了这些额外的复杂性问题，我们也就能够改变对 UI 组件进行单元测试时需要使用的预测试状态，以及修改测试后状态。如果你听到“预测试状态”和“测试后状态”后感觉一头雾水，或者觉得有一点点印象却不记得具体是什么意思的话，最好复习复习我之前写的`[Android 进行单元测试难在哪-part1](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-9/Android%20%E8%BF%9B%E8%A1%8C%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E9%9A%BE%E5%9C%A8%E5%93%AA-part1.md)`。如果你清楚地理解这两个概念的话，确保你知道 SessionDetailActivity 干了啥。为了学习该如何将 Square 大法应用到应用的 UI 组件类中，我们将重构 SessionDetailActivity 类的代码，使我们能够对类中的 onStop() 方法中的业务逻辑进行单元测试。

开始之前我在唠叨几句吧，如果你有了解过 MVP 模式的话对你理解用 Square 大法重构应用 UI 组件大有裨益，不过呢，由于 Square 已经写了一篇非常精彩的[博文](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html)介绍 MVP 模式了，我就不再给大家介绍啦，有兴趣的话看 Square 写的博文就好了。如果你在学习 MVP 模式的时候觉得很难理解与 View 相关的操作，不妨看看我之前写的一篇[博文](http://philosophicalhacker.com/2015/04/05/dont-call-it-mvp/)，这篇博文能帮你区分进行 Android 开发时我们使用的 View 和 MVP 模式中的“View”。除此以外，我在这篇博文中将 Presenter 用于更新应用界面显示的对象称为 “ViewTranslator” 而不是 “View”。

## 用 Square 大法重构应用 UI 组件类

虽然用 Square 大法重构应用的 UI 组件可能会更复杂些，但我们的重构策略始终没有发生变化：抽取出应用组件类中的业务逻辑（例如 Activity，Fragment，Service），并将业务逻辑放到我之前说的被进行了依赖注入的“业务对象”中，也就是与 Android 无关接口的 Android 特定实现。

下面是重构后的 onStop() 方法：

```java
@Override
public void onStop() {
    super.onStop();
    if (mInitStarred != mStarred) {
        if (UIUtils.getCurrentTime(this) < mSessionStart) {
            // Update Calendar event through the Calendar API on Android 4.0 or new versions.
            Intent intent = null;
            if (mStarred) {
                // Set up intent to add session to Calendar, if it doesn't exist already.
                intent = new Intent(SessionCalendarService.ACTION_ADD_SESSION_CALENDAR,
                        mSessionUri);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_START,
                        mSessionStart);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_END,
                        mSessionEnd);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_ROOM, mRoomName);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_TITLE, mTitleString);
            } else {
                // Set up intent to remove session from Calendar, if exists.
                intent = new Intent(SessionCalendarService.ACTION_REMOVE_SESSION_CALENDAR,
                        mSessionUri);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_START,
                        mSessionStart);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_END,
                        mSessionEnd);
                intent.putExtra(SessionCalendarService.EXTRA_SESSION_TITLE, mTitleString);
            }
            intent.setClass(this, SessionCalendarService.class);
            startService(intent);
 
            if (mStarred) {
                setupNotification();
            }
        }
    }
}
```

正如我之前提到的，这段代码存在一个问题：代码并没有通过被注入到 SessionDetailActivity 的依赖中的方法启动 SessionCalendarService。那我们现在就用 Square 大法来解决这个问题。首先，我们将业务逻辑抽取出来，并放入业务对象中，Square 的工程师们为这个在 Activity（或 Fragment，或其他……）中使用的业务对象起了一个名字 —— “Presenter”。

Presenter 负责用 Model 中的数据更新 View，为了使单元测试在 Presenter 中是可行的，这就意味着 Model 和 View 都必须是注入到 Presenter 中的依赖。也正是这三个对象的组合使用构成了我们所说的 MVP 架构模式。

下面就是 SessionDetailPresenter 中与 onStop() 方法等价的实现啦：

```java
public class SessionDetailViewPresenter implements RepositoryManagerCallbacks {
 
    public SessionDetailViewPresenter(SessionDetailView sessionDetailView,
                                      RepositoryManager loaderManager,
                                      ServiceStarter serviceStarter,
                                      long calendarId
                                      ) {
 
        mSessionDetailView = sessionDetailView;
        mLoaderManager = loaderManager;
        mServiceStarter = serviceStarter;
        mCalendarId = calendarId;
    }
    
    //...
 
    public void onViewTranslatorStopped() {
 
        if (mInitStarred != mStarred) {
 
            if (System.currentTimeMillis() < mSessionStart) {
 
                CalendarSession calendarSession = new CalendarSession(mSessionUri, mSessionStart, mSessionEnd, mTitleString, mRoomName);
 
                if (mStarred) {
 
                    mServiceStarter.startAddCalendarSessionService(mCalendarId, calendarSession);
 
                } else {
 
                    mServiceStarter.startRemoveCalendarSessionService(mCalendarId, calendarSession);
                }
            }
 
            if (mStarred) {
 
                setupSessionNotification();
            }
        }
    }
    
    //...
}
```

完成这个类的关键在于：SessionDetailPresenter 的依赖通过它的构造器传递，因为这些依赖都被注入了，所以我们现在可以修改 SessionDetailPresenter 类中 onViewTranslatorStopped() 方法的测试单元的测试后状态。

```java
package com.google.samples.apps.iosched.test;
 
import com.google.samples.apps.iosched.service.CalendarSession;
import com.google.samples.apps.iosched.ui.RepositoryManager;
import com.google.samples.apps.iosched.ui.ServiceStarter;
import com.google.samples.apps.iosched.ui.sessiondetail.SessionDetailViewPresenter;
import com.google.samples.apps.iosched.ui.sessiondetail.SessionDetailViewTranslator;
 
import junit.framework.TestCase;
 
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
 
/**
 * Created by MattDupree on 5/8/15.
 */
public class SessionDetailPresnterTests extends TestCase {
 
 
    public void testShouldLaunchAddSessionService() {
 
        //Arrange
        SessionDetailViewTranslator sessionDetailViewTranslator = mock(SessionDetailViewTranslator.class);
 
        RepositoryManager repositoryManager = mock(RepositoryManager.class);
 
        ServiceStarter serviceStarter = mock(ServiceStarter.class);
 
        long calendarId = 0;
 
        SessionDetailViewPresenter sessionDetailViewPresenter = new SessionDetailViewPresenter(sessionDetailViewTranslator,
                                                                                               repositoryManager,
                                                                                               serviceStarter,
                                                                                               calendarId);
        sessionDetailViewPresenter.onViewCreated(null);
 
        //Act
        sessionDetailViewPresenter.onViewStopped();
 
        //Assert
        verify(serviceStarter).startAddCalendarSessionService(anyLong(), any(CalendarSession.class));
 
    }
 
}
```

虽然我们现在可以修改测试单元的测试后状态了，但这还不够，因为这个测试单元无法完成测试。为什么呢？我们不妨一起看看 onViewTranslatorStopped() 方法：

```java
public void onViewTranslatorStopped() {
 
    if (mInitStarred != mStarred) {
 
        if (System.currentTimeMillis() < mSessionStart) {
 
            CalendarSession calendarSession = new CalendarSession(mSessionUri, mSessionStart, mSessionEnd, mTitleString, mRoomName);
 
            if (mStarred) {
 
                mServiceStarter.startAddCalendarSessionService(mCalendarId, calendarSession);
 
            } else {
 
                mServiceStarter.startRemoveCalendarSessionService(mCalendarId, calendarSession);
            }
        }
 
        if (mStarred) {
 
            setupSessionNotification();
        }
    }
}
```

onViewTranslatorStopped() 方法的代码被包裹在一个判断模块中，只有在“starred button”的状态与其初始化状态相异时才会执行判断模块中的代码。mInitStarred 将会在 Loader 回调中被初始化，IOSched 应用检索数据库以判断用户选中的 I/O 大会是否已经被添加到日历中，并在用户返回到 SessionDetailActivity 后通过消息更新 UI。但在上面这段业务逻辑的测试单元中，mInitStarred  和 mStarred 都将有一个初始值 `false`，使得判断模块内的代码永远不会被执行。

即使我们能执行判断模块内的代码，我们还是不能获得进行单元测试所需要的一切，因为启动 SessionCalendarService 的代码在另一个用于确保在 System.currentTimeMillis() 的返回值小于 mSessionStart 时才执行相关代码的判断模块中。既然我们不能修改 mSessionStart 的值，也就不能保证启动 SessionCalendarService 的代码会被运行。

这些问题都是我思考如何在 Android 中进行单元测试时想到的普遍问题的极端例子：我们常常缺乏对测试单元预测试状态的控制力。然而，由于我们将 SessionRepositoryManager 注入到 SessionDetailPresenter 中，我们现在可以判断 mSessionStart 和 mInitStarred 的值了，因为 SessionRepositoryManager 是一个 Android 无关的接口¹:

```java
package com.google.samples.apps.iosched.ui;
 
import android.os.Bundle;
 
import com.google.samples.apps.iosched.io.model.Session;
 
/**
 * 
 * Created by MattDupree on 5/6/15.
 */
public interface SessionRepositoryManager {
 
    void initRepository(int id, Bundle bundle, SessionRepositoryManagerCallbacks repositoryManagerCallbacks);
 
    
    interface SessionRepositoryManagerCallbacks {
 
        void onLoadFinished(Session session);
    }
}
```

然而，当我们创建 SessionDetailPresenter，我们注入了包含 LoaderManager 的 Android 无关接口 `SessionRepositoryManager` 的实现。

```java
public class SessionDetailActivity extends Activity implements SessionDetailViewTranslator {
    
    @Override
    public void onCreate(Bundle savedInstanceState)
    
        //...
    
        ServiceStarter serviceStarter = new AndroidServiceStarter(this);
 
        SessionRepositoryManager repositoryManager = new AndroidSessionRepositoryManager(getLoaderManager());
 
        mSessionDetailViewPresenter = new SessionDetailViewPresenter(this, repositoryManager, 
                                                                     serviceStarter, calendarId);
        mSessionDetailViewPresenter.onViewCreated(savedInstanceState);
    
        //...
    }
    
}
```

因为 SessionRepositoryManager 只是一个接口，所以我们能轻松地定义 MockRepositoryManager 帮助我们完成单元测试：

```java
package com.google.samples.apps.iosched.ui.sessiondetail;
 
import android.os.Bundle;
 
import com.google.samples.apps.iosched.io.model.Session;
 
/**
 * Created by MattDupree on 5/8/15.
 */
public class MockSessionRepositoryManager implements SessionRepositoryManager{
 
 
    private Session mSession;
 
    public MockSessionRepositoryManager(Session session) {
 
        mSession = session;
    }
 
 
    @Override
    public void initRepository(int id, Bundle bundle,
                               SessionRepositoryManagerCallbacks repositoryManagerCallbacks) {
        
        repositoryManagerCallbacks.onLoadFinished(mSession);
    }
}
```

不知道大家有没有注意到：当有操作通过向构造器传递一个 Session 对象调用 initRepository() 方法时，我们能够指定 MockSessionRepositoryManager 的返回值。SessionDetailPresenter 中类似 mSessionStart 这样的值能在 Session 的模板对象中通过 startTimeStamp 实例初始化。这样一来，我们就能掌控这些值了，也就是说，我们现在几乎拥有了在对 onViewTranslatorStopped() 方法进行单元测试时，准备阶段所需要的一切。

```java
public void testShouldLaunchAddSessionService() {
 
    //Arrange
    SessionDetailViewTranslator sessionDetailViewTranslator = mock(SessionDetailViewTranslator.class);
 
    Session session = new Session();
    session.startTimestamp = "1431081943";
 
    SessionRepositoryManager repositoryManager = new MockSessionRepositoryManager(session);
 
    ServiceStarter serviceStarter = mock(ServiceStarter.class);
 
    long calendarId = 0;
 
    SessionDetailViewPresenter sessionDetailViewPresenter = new SessionDetailViewPresenter(sessionDetailViewTranslator,
                                                                                           repositoryManager,
                                                                                           serviceStarter,
                                                                                           calendarId);
    sessionDetailViewPresenter.onViewCreated(null);
 
    //Act
    sessionDetailViewPresenter.onViewStopped();
 
    //Assert
    verify(serviceStarter).startAddCalendarSessionService(anyLong(), any(CalendarSession.class));
 
}
```

我之所以说“几乎”，是因为 onViewTranslatorStopped() 方法中还有一个地方不能通过上面的代码处理。在 onViewTranslatorStopped() 方法的最下面有一个只有在 mStarred 的值为 true 时才会运行的代码块。这段代码会启动一个 Service 提醒用户参与并且/或者排列他们添加到日历中的 IO 大会：

```java
public class SessionDetailViewPresenter implements RepositoryManagerCallbacks {
 
    public SessionDetailViewPresenter(SessionDetailView sessionDetailView,
                                      RepositoryManager loaderManager,
                                      ServiceStarter serviceStarter,
                                      long calendarId
                                      ) {
 
        mSessionDetailView = sessionDetailView;
        mLoaderManager = loaderManager;
        mServiceStarter = serviceStarter;
        mCalendarId = calendarId;
    }
    
    //...
 
    public void onViewTranslatorStopped() {
 
        if (mInitStarred != mStarred) {
 
            if (System.currentTimeMillis() < mSessionStart) {
 
                CalendarSession calendarSession = new CalendarSession(mSessionUri, mSessionStart, mSessionEnd, mTitleString, mRoomName);
 
                if (mStarred) {
 
                    mServiceStarter.startAddCalendarSessionService(mCalendarId, calendarSession);
 
                } else {
 
                    mServiceStarter.startRemoveCalendarSessionService(mCalendarId, calendarSession);
                }
            }
 
            if (mStarred) {
 
                setupSessionNotification();
            }
        }
    }
    
    //...
}
```

为了让这段代码运行，我们需要确保 mStarred 的值为 true。我们能通过调用 SessionDetailPresenter 的 onSessionStarred() 方法完成这项工作，因为 onSessionStarred() 方法就是在用户点击 star button 时 SessionDetailViewTranslator（如果你觉得这些命名让你觉得晕乎乎的，你可以把它当作 SessionDetailView）调用的方法。

```java
public void onToggleSessionStarred() {
 
    mStarred = !mStarred;
}
```

```java
public void testShouldLaunchAddSessionService() {
 
    //Arrange
    SessionDetailViewTranslator sessionDetailViewTranslator = mock(SessionDetailViewTranslator.class);
 
    Session session = new Session();
    session.startTimestamp = "1431081943";
 
    SessionRepositoryManager repositoryManager = new MockSessionRepositoryManager(session);
 
    ServiceStarter serviceStarter = mock(ServiceStarter.class);
 
    long calendarId = 0;
 
    SessionDetailViewPresenter sessionDetailViewPresenter = new SessionDetailViewPresenter(sessionDetailViewTranslator,
                                                                                           repositoryManager,
                                                                                           serviceStarter,
                                                                                           calendarId);
    sessionDetailViewPresenter.onViewCreated(null);
    //****** We call onToggleSessionStarred() to make sure that mStarrred is true
    sessionDetailViewPresenter.onToggleSessionStarred();
    //******
    
    //Act
    sessionDetailViewPresenter.onViewStopped();
 
    //Assert
    verify(serviceStarter).startAddCalendarSessionService(anyLong(), any(CalendarSession.class));
 
}
```

把上面提到的所有工作万仇后，我们终于能够在 onViewTranslatorStopped() 方法中进行单元测试了。

##结论

你可能觉得我们为单元测试的准备阶段进行了大量的工作，我不得不承认你的感觉是对的。最后，我提一点个人想法：我认为 SessionDetailActivity 类中的代码实在是太多了，都有1000多行……正是这个原因，使得为其实现测试单元变得如此艰难。此外，因为这篇博文的目的只是展示 Square 大法的核心用法，所以我并不打算讨论优化单元测试的方案。²

Square 大法是告别传统 Android 开发架构的里程碑，因为我们确实发现了遵循传统架构进行开发的种种缺陷。为此，我将在下一篇博文中指出 Square 大法潜在的问题，并提出可能的解决办法。此外，本系列的最后一篇博文也会告诉大家 Square 大法的种种优点，而且我所说的优点可不是只有增强应用的可测试性哦。

##注：

1. 严格来说这个接口并不是 Android 无关的，因为它的核心方法使用 Bundle 作为参数，但我不确定这会不会带来什么问题，毕竟 Bundle 非常普通，并不会是什么我们想要测试的东西。退一万步说，即使要对它进行测试也没啥麻烦。

2. 在 Droidcon Montreal 中，Richa Khandelwal 在 Coursa 上开了一节课建议我们使用[更简洁、更易于测试的架构进行开发](https://speakerdeck.com/richk/clean-android-architecture)，这或许也能让实现单元测试变得简单些。