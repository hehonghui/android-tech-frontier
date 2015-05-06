Android 进行单元测试难在哪-part2
---

> * 原文链接 : [Against Android Unit Tests](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaosssss) 
* 校对者: [校对人](校对人Github地址)  
* 状态 :  校对中

In my last post, I showed that even the (intelligent) engineers over at Google have written some Android code that is simply untestable. More specifically, I showed that there’s no way to unit test the SessionDetailActivity’s onStop() method. I also gave a specific diagnosis for the untestability of onStop(): we can’t complete the arrange- and assert-steps of a test against onStop() because there is no way to alter the pre-act-state, nor is there a way to access the post-act-state for a test of onStop(). I ended the last post by claiming that some properties of the Android SDK, along with the standard way we are encouraged to structure our android apps, encourage us to write code that is difficult/impossible to unit test and by promising that I’d elaborate more on that claim in this post.

在上一篇博文中，我用干货告诉大家：即使是 Google 大牛写出来的代码也无法进行测试。确切地说，我真正告诉大家的是：根本没办法在 SessionDetailActivity 的 onStop() 方法里进行单元测试，而且详细地解释了个中因果：由于无法改变预测试状态，我们无法在 onStop() 方法里完成断言；在 onStop() 方法中进行测试时，获得测试后状态也是无法完成的。在上篇博文的结尾处，我跟大家说：正是 Android SDK 的某些特性，以及 Google 官方推荐的代码模板使得单元测试处于如此尴尬的境地，而且我承诺会在这篇博文中详尽地解释各种因由，那现在就让我来兑现我的诺言吧。

Before I do that, let me say again that showing that the difficulty of testing Android applications is caused by the standard structure of android apps is important for the overarching goal of this series of articles. This series is an attempt to argue that we should consider restructuring our applications so that they do not explicitly depend on the Android SDK and its an attempt to present a robust architecture that will enhance the testability of Android applications. You can read the introduction to this series here. With that said, I can move on to trying to demonstrate the central claim of this post.

在我开始论述之前，我再说一次：正是标准的 Android 应用架构使测试 Android 应用变得如此困难，这句话是本系列博文的核心论点。这篇博文的意义在于：我们尝试提出理由证明重构 Android 应用的必要性，使得这些 Android 应用不需要明确地依赖于 Android SDK，与此同时，我们也尝试着提出一种健壮的应用架构，以增强 Android 应用的测试性，你会在这篇博文里了解到相关的概述。因此，我接下来将尝试去证明这篇博文的核心论点。

There’s a standard way of developing android applications. Sample code and open source code alike both place an app’s business logic within Android app component classes, namely, Activities, Services, and Fragments. Going forward, I’m going to refer to this practice as “the standard way.” Here’s the central claim of this post: As long as we follow the “standard way”, we’re going to write code that’s either difficult or impossible to unit test. In other words, the untestable code that I pointed out in my last article is not a fluke. The standard way prevents us from unit testing key pieces of our applications.

众所周知，开发 Android 应用有一种标准的架构，在示例代码和开源代码里很常见到应用的业务逻辑被放在 Android 应用的组件类，Activity，Service，Fragment 里执行。而我接下来就要遵循这种架构进行开发。而这篇博文要论述的就是：如果我们遵循这种标准架构进行开发，极有可能写下无法测试的代码，我在上一篇博文里也论证了这样的问题并不是偶然，正是标准的 Android 应用架构让测试变得支离破碎，单元测试几乎不能进行。

## The Standard Way Makes (some) Unit Tests Impossible
## 传统的 Android 应用架构让单元测试变得不可能

To begin to see why the standard way leads to untestable app components, let’s briefly recall some of the points I made in my last post. Unit testing consists of three steps: arrange, act, and assert. In order to complete the arrange step of the process we need to be able to alter the pre-act-state of the code we’re testing, and accessing the post-act-state of our program is required to complete the assert-step of a test.

为了开始论证为什么标准开发架构让应用组件变得无法测试，大家不妨和我一起简要地复习下上篇博文的一些结论。单元测试包含三个步骤：准备，测试，断言。为了完成准备步骤，需要改变测试代码的预测试状态，此外，为了完成单元测试的断言步骤，我们需要获得程序的测试后状态。

With those points in mind, we can see that dependency injection, in some cases, is really the only acceptable way to write code whose pre-act-state can be altered and whose post-act-state is accessible. Let’s look at a non-android example of this:

复习了这些知识点后，可以开始进入正题了哈。在某些情况下，依赖注入是实现能够改变预测试状态代码的唯一办法，而且这些代码的测试后状态也是可访问的。我写了一个与 Android 完全无关的示例：

```java
	public class MathNerd {
	    
	    private final mCalcCache;
	    
	    private final mCalculator;
	    
	    public MathNerd(CalculationCache calcCache, Calculator calculator) {
	        mCalcCache = calcCache;
	        mCalculator = calculator;
	    }
	    
	    
	    public void doIntenseCalculation(Calculation calculation, IntenseCalculationCompletedListener listener) {
	        
	        if (!mCalcCache.contains(calculation)) {
	            
	            mCalculator.doIntenseCalculationInBackground(listener);
	            
	        } else {
	            
	            Answer answer = mCalcCache.getAnswerFor(calculation);
	            listener.onCalculationCompleted(answer);
	        }
	    }
	}
```

Dependency injection is really the only way to unit test doIntenseCalculation(). doIntenseCalculation() doesn’t have a return value. Moreover, there’s no property on MathNerd that will allow us to determine the validity of our post-act-state. We could get the post-act-state in a test from the mCalcCache like this:

如上所示，依赖注入确实是对 doIntenseCalculation() 进行单元测试的唯一办法，因为 doIntenseCalculation() 方法根本没有返回值。除此以外，MathNerd 类里也没有判断测试后状态有效性的属性。但通过依赖注入，我们可以通过 mCalcCache 获得单元测试中的测试后状态。

```java
	public void testCacheUpdate() {
	    
	    //Arrange
	    CalculationCache calcCache = new CalculationCache();
	    
	    Calculator calculator = new Calculator();
	    
	    MathNerd mathNerd = new MathNerd(calcCache, calculator);
	    
	    Calculation calcualation = new Calculation("e^2000");
	    
	    //Act
	    mathNerd.doIntenseCalculationInBackground(calculation, null);
	    
	    //some smelly Thread.sleep() code...
	    
	    //Assert
	    calcCache.contains(calculation);
	}
```

If we did this, however, we would no longer be writing a unit test for MathNerd. We’d be writing an integration test that checks the behavior of a MathNerd and whatever class is responsible for updating the CalcCache with the results from doIntenseCalculationInBackground().

如果我们这样做，很遗憾，恐怕是没办法为 MathNerd 类实现一个测试单元了。我们将会实现一个整合测试，用于检查 MathNerd 实际行为以及类是否根据 doIntenseCalculationInBackground() 方法处理后的值更新 CalcCache。

Dependency injection is really the only way that we can verify our post-act-state for a unit test. We inject mocks and verify that methods are called in the right circumstances:

此外，依赖注入实际上也是验证测试单元测试后状态的唯一办法。我们通过注入验证方法在正确的位置被调用：

```java
	public void testCacheUpdate() {
	    
	   //Arrange
	    CalculationCache calcCache = mock(CalculationCache.class);
	 
	    when(calcCache.contains()).thenReturn(false);
	 
	    Calculator calculator = mock(Calculator.class);
	 
	    MathNerd mathNerd = new MathNerd(calcCache, calculator);
	 
	    Calculation calculation = new Calculation("e^2000");
	 
	    //Act
	    mathNerd.doIntenseCalculationInBackground(calculation, null);
	 
	    //Assert should use calculator to perform calcluation because cache was empty
	    verify(calculator).doIntenseCalculationInBackground(any());
	}
```

There are many instances in which unit testing an Android class requires the same thing: dependency injection. Here’s the problem: key android classes have dependencies that we cannot inject. The SessionCalendarService that’s launched by the SessionDetailActivity I talked about last time is an example of this:

在 Android 应用的相关类中进行单元测试涉及的许多测试实例都需要一个东西：依赖注入。但问题来了：核心 Android 类持有我们无法注入的依赖。例如我上次提到的通过 SessionDetailActivity 启动的 SessionCalendarService 就是一个很好的例子：

```java
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
	 
	   //...
	}
```

The SessionCalendarService has a ContentResolver as a dependency. This dependency, however, is not one that we can inject, so there’s simply no way for us to write a unit test for onHandleIntent(). onHandleIntent() doesn’t have a return method and there’s no property on SessionCalendarService that would allow us to check the validity of our post-act-state. To verify our post-act-state, we could actually query the ContentProvider to see if the requested data has been inserted, but then we wouldn’t be writing a unit test for a SessionCalendarService. Instead, we’d be writing an integration test that tests both our SessionCalendarService and whatever ContentProvider handles session calendar data.

SessionCalendarService 的依赖是 ContentResolver，而且 ContentResolver 就是一个无法注入的依赖，所以如果我们并没有办法在 onHandleIntent() 方法里进行注入。而 onHandleIntent() 方法没有返回值，SessionCalendarService 类里也没有能让我们检查测试后状态的可访问的属性。为了验证测试后状态，我们可以通过查询 ContentProvider 检查请求数据是否被插入，但我们不会这样的方式为 SessionCalendarService 实现测试单元。相反，我们用的方法是实现一个整合测试，同时测试 SessionCalendarService 以及受 ContentProvider 操控的日历会议数据。

So, if you put business logic into an Android class whose dependencies cannot be injected, then you’re going to wind up with some code that’s impossible to unit test. There are several examples of dependencies like this: An Activity and Fragment’s FragmentManager is one example. An Activity and Fragment’s LoaderManager is another example. Thus, the standard way of building android applications, insofar as that way instructs us to put our business logic in app component classes, encourages us to write untestable code.

所以如果你把业务逻辑放在 Android 类里，而这个类的依赖又无法被注入，那这部分代码铁定没办法进行单元测试了。类似的无法被注入的依赖还有呢，例如：Activity 和 Fragment 的 FragmentManager。因此，至今为止 Google 官方一直鼓励我们使用的标准 Android 应用架构模式，教导我们在开发应用的时候要把业务逻辑放在应用的组件类里，信誓旦旦地说这是为我们好，而我们今天才知道真相竟然是：正是这样的架构让我们写下无法测试的代码。

## The Standard Way Makes Unit Testing Difficult
## 标准开发模式让单元测试变得困难重重

In some cases, the standard way will only make it very difficult to unit test your code. If we return to the onStop() method within the SessionDetailActivity that we examined in the last article, we’ll see this:

某些情况下，标准的开发模式使代码的单元测试变得十分困难。如果我们回到上一篇博文提到的 SessionDetailActivity 里的 onStop() 方法，可以看到：

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

There is no publically accessible property that will tell us whether the SessionCalendarService has been launched with the right parameters. Morover, onStop() is a protected method whose return value cannot be modified. Thus, the only way we can access post-act-state is to check the state of a dependency injected into onStop().

就像你看到的那样，onStop() 方法里压根没有能让我们知道 SessionCalendarService 是否通过正确的参数启动的可访问属性，此外，onStop() 方法是一个受保护的方法，使其返回值是无法修改的。因此，我们访问测试后状态的唯一办法就是检查注入到 onStop() 方法内的注入的状态。

At this point, you’ll notice that the code within onStop() that launches the SessionCalendarService doesn’t actually belong to a single object at all. In other words, there is no dependency to inject into onStop() that would allow us to access the post-act-state for a test that checks if the Service has been launched under the right conditions with the right arguments. To put the point a third way, in order to start making onStop() testable, it needs to look something like this:

这样一来，我们就会注意到 onStop() 方法中用于启动 SessionCalendarService 的代码并不属于某一个类。换句话说，onStop() 方法中注入的依赖根本不存在用于检查 SessionCalendarService 是否在正确的情况下通过正确的参数启动的测试单元测试后状态的属性。为了提出能让 onStop() 方法变为可测试的的第三种办法，那我们需要一些这样的东西：

```
	@Override
	public void onStop() {
	    super.onStop();
	    if (mInitStarred != mStarred) {
	        if (UIUtils.getCurrentTime(this) < mSessionStart) {
	            // Update Calendar event through the Calendar API on Android 4.0 or new versions.
	            Intent intent = null;
	            if (mStarred) {
	                
	                // Service launcher sets up intent to add session to Calendar
	                mServiceLauncher.launchSessionCalendarService(SessionCalendarService.ACTION_ADD_SESSION_CALENDAR, mSessionUri, 
	                                                            mSessionStart, mSessionEnd, mRoomName, mTitleString);
	                                                            
	            } else {
	                
	                // Set up intent to remove session from Calendar, if exists.
	                mServiceLauncher.launchSessionCalendarService(SessionCalendarService.ACTION_REMOVE_SESSION_CALENDAR, mSessionUri,
	                                                            mSessionStart, mSessionEnd, mTitleString);
	            }
	 
	            if (mStarred) {
	                setupNotification();
	            }
	        }
	    }
	}
```

This isn’t the cleanest way of refactoring onStop(), but something like this is necessary if we want to make the code unit testable while adhering to the standard practice of keeping our business logic in Activities. Now, think for a second about how counter-intuitive this refactor is: Instead of simply calling startService(), a method that belongs to Context and, by extension, the SessionDetailActivity, we are using a ServiceLauncher, an object that depends on a Context to start the service. The SesionDetailActivity that is-a Context is using an object that has-a Context to launch the SessionCalendarService.

虽然这不是重构 onStop() 方法最简洁的方式，但如果我们按照标准开发方法把业务逻辑写在 Activity 里，并让写下的代码可以进行单元测试，类似的处理就变得必要了。现在不妨想想这种重构方式有多么违反常理：我们没有简单地调用 startService() 方法（startService() 是 Context 的一个方法，我们甚至可以说调用的是 SessionDetailActivity 的方法），而是通过依赖于 Context 的 ServiceLauncher 对象去启动该服务。SesionDetailActivity 作为 Context 的子类也将使用一个持有 Context 的对象去启动 SessionCalendarService。

Unfortunately, even if we refactored onStop() to look like this, we still wouldn’t guarantee that we could write a unit test for it. The problem, of course, is that the ServiceLauncher is not injected, so there’s no way to inject a mock ServiceLauncher that we can use to verify that the correct method has been called for testing purposes.

不幸的是，即使我们像上面说的那样重构了 onStop() 方法，我们仍然不能保证能为 onStop() 方法实现测试单元。问题在于：ServiceLauncher 没有被注入，使得我们不能对 ServiceLauncher 进行注入，使我们能验证在测试过程中调用了正确的方法。

Injecting a ServiceLauncher, moreover, is complicated by the fact that the ServiceLauncher itself depends on a Context, an object that is not Parcelable. Because of this, you can’t inject a ServiceLauncher simply by passing one into the intent that launches the SessionDetailActivity, so you’ll have to do something clever to inject the ServiceLauncher or you could just use a dependency injection library like Dagger.¹ This is a lot of work to make our code unit testable, and, as we’ll see in the next post, even if we use a library like Dagger for dependency injection, unit testing an Activity can still be painful.

要对 ServiceLauncher进行注入，除了刚刚提到的以外，还会因为 ServiceLauncher 自身依赖于 Context 变得复杂，因为 Context 是一个非打包对象。因此，你并不能简单地通过将其传入用于启动  SessionDetailActivity 的 Intent 注入 ServiceLauncher。所以为了注入 ServiceLauncher，你需要开动你的小脑筋，或者使用类似于 Dagger¹ 的注入库。现在你应该也会发现，为了让我们的代码可以进行单元测试，我们确实需要完成许多复杂、繁琐的工作，而且，正如我即将在下篇博文中的论述，就算我们为了进行依赖注入而使用 Dagger 这样的库，在 Activity 内进行单元测试仍然是令人备受煎熬的。

In order to make onStop() unit testable, the standard way forces us to make a counter-intuitive refactor and then choose between creating clever workarounds to its painful intent-based dependency injection mechanism or using a third-party dependency injection library. By making it difficult and counter-intuitive to write testable code, the standard way makes it more likely that we won’t make our code testable. This is what I mean when I say that the standard way discourages us from writing testable code.

为了让 onStop() 方法能进行单元测试，标准开发方式强迫我们使用反常理的重构方法，并要求我们在“根据以 Intent 为基础的依赖注入机制想出更好的重构方法”或“使用第三方的依赖注入库”。而标准开发方式为写下可测试代码带来的困难，就像在鼓励我们写下无法进行测试的代码，正是这种困难让我认为：标准开发方式阻碍我们写下可测试代码。

## Conclusion
## 结论

Throughout this series, I’ve been saying that an examination of why Android unit testing is so difficult will help us see why its a good idea to restructure our applications so that they don’t explicitly depend on the Android SDK. Now we are finally at a point where we can start to see why it might be a good idea to get away from the Android SDK entirely.

在整个系列博文中，我一直在提出这样的观点：通过反思为什么在 Android 中进行单元测试如此困难，将帮助我们发现重构应用架构的各种好处，使我们的应用不必明确地依赖于 Android SDK。这篇博文论述到这里，我相信大家有足够理由相信完全摆脱 Android SDK 或许是个好提议了。

I’ve just shown that placing our business logic in application components classes makes it difficult or impossible to unit test our applications. In the next post, I’ll suggest that we start delegating business logic to classes that make proper use of dependency injection. If we’re going to go through the trouble of defining these classes, however, we might as well make these class’s dependencies android-agnostic interfaces. This step in the process of enhancing our application’s testability is trivial compared to the first step, and completing this second step will enable us to write fast unit tests without having to rely on android-specific testing tools (e.g, Roboletric, Instrumented Tests).

我刚刚把业务逻辑放在应用的组件类中，并向大家证明了对其进行单元测试有多么困难，甚至我们可以说对其进行单元测试这是不可能的。在下一篇博文中，我将建议大家将业务逻辑委托给使用了正确的依赖注入姿势的类。如果我们觉得定义这些类很麻烦的话，退而求其次，也能让这些类的依赖成为与 Android 无关的接口。与增强程序测试性的第一步相比，这一步是至关重要的，而完成第二步使我们无需 Android 特有的测试工具（例如：Roboletric，Instrumented Tests）就能写下更高效的测试单元。

**Notes**
**注**

1. Of course, you could pass the ServiceLauncher in as a Serializable. This is not a particularly robust solution since it only works if you don’t care about the performance hit that results from using Serializable.

1. 毫无疑问，你在传入 ServiceLauncher 时应该使他变为一个序列化对象。但这并不是一个特别健壮的解决办法，因为只有在你不在乎序列化带来的性能影响时才能使用这个办法。