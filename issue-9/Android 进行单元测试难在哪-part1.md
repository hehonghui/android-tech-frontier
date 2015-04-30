Android 进行单元测试难在哪-part1
---

> * 原文链接 : [Against Android Unit Tests](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/)
* 原文作者 : [Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaosssss) 
* 校对者: [校对人](校对人Github地址)  
* 状态 :  完成 



Unit testing your Android apps can be extremely difficult. As I suggested in the introduction to this series, it seems clear that there’s widespread agreement on this. The many folks who responded to my introductory post, moreover, seemed to reinforce my claim that Android unit testing is tough:

正如我在[序](issue-8/Android 进行单元测试难在哪-序.md)中所说，在 Android 中难于进行测试是众多 Android 开发者的共识。上一篇博文发出后，有许多同行回复了我，并对我的观点表示支持：

> What he said! RT @philosohacker: New post on how we can better test our Android apps http://t.co/gQCJKIOrSN

> — Andy Dyer (@dammitandy) April 13, 2015

> @philosohacker大大发话了！他写了一篇有关如何能更好地测试 Android 应用的博文，[地址戳我](http://t.co/gQCJKIOrSN)
> — Andy Dyer (@dammitandy) April 13, 2015


> @corey_latislaw Yay! Maybe I can finally figuring out how to test Android apps properly. Also, this. http://t.co/8gIqfoFVnL — Vinay Shenoy (@vinaysshenoy) April 13, 2015
> 卧槽，我终于知道在 Android 上测试应用的正确姿势了！感谢：[地址戳我](http://t.co/8gIqfoFVnL)

> Fully agree: “Against Android Unit Tests”. Structure your code to have as little contact with the SDK as possible. http://t.co/rLZlpGrCD5
> 非常赞同“反对 Android 测试单元”的看法。你应该让你的代码和 SDK 的的联系尽可能地小。

> — Pascal Hartig (@passy) April 12, 2015

So, Android unit testing is hard. That much is clear. Why Android unit testing is so difficult, however, is less clear. Its true that a part of the difficulty with Android unit testing has to do with the nonsense that you have to overcome to get Roboletric started so that you can run your tests at a decent speed, but I think that there’s a deeper reason why we are having a hard time testing our applications: the way that Google has written the Android SDK and the way that Google encourages us to structure our applications makes testing difficult and, in some cases, impossible.

所以在 Android 中进行单元测试困难的问题，我提到的这些已经说得足够清楚了。但事实上，问题的根源比这更显而易见。难于进行单元测试的一部分原因是：为了启动 Roboletric 使你的测试单元能够以一种合理的速度运作，你往往需要做许多繁复且没有意义的事。不过在我看来，这并不是关键因素，关键在于：Google 设计的 Android SDK 和 Google 官方提倡的应用架构模式让测试变得困难，在某些情况下，进行测试甚至是不可能的。

I realize that this is a bold claim, so I will spend the entire post trying to establish it. In the following post, I’ll try to say more about how the “standard” way of developing Android applications encourages us to write code that is difficult/impossible to write sensible unit tests against. These posts are a part of a series in which I’m exploring the viability of enhancing the testability of Android applications by restructuring them so that application code does not directly depend on the Android SDK. Showing why the standard architecture for Android development makes testing difficult will both motivate and inform my alternative proposal for structuring Android applications, a proposal that I will outline in the fourth post of the series.

这样说可能让人感觉是泛泛而谈，为了证明我的结论，我今天将会用一整个系列的博文来论证我的观点。在接下来的博文里，我会尽可能解释为什么官方鼓励的应用开发方式会使进行单元测试困难，甚至不可能。除此以外，我还会在这些博文里通过重构应用架构探索增强 Android 可测试性的办法，使得应用的代码不需要直接依赖于 Android SDK。通过介绍 Android 怎么让测试变得困难，我会延伸出我想到的重构应用的几个建议，我会在系列博文的第四篇里把它们列出来。

## A (Seemingly) Simple Test Case
## 一个（看似）简单的测试示例

To see why unit testing in Android is so difficult, let’s start by looking at a simple test case. I’ll be using source code from Google’s IOsched app because, as I pointed out in my first post, that app is supposed to serve as a model for Android developers.

要分析这个问题，我们不妨先从一个简单的测试示例开始研究。示例里面用的是 Google IOsched 应用的源码，因为我在第一篇博文里就说道：IOsched 就是 Android 开发者的参考模板。

The IOsched app has a IO session detail screen that looks like this:

IOsched 应用里有一个有关 IO 大会细节的页面：

![](https://philosophicalhacker.files.wordpress.com/2015/04/screenshot-0646am-apr-17-2015.png?w=169&h=300)

Notice that the detail screen has a “+” button that allows users to add the session to their calendar. That plus button turns to a “check” button if they’ve added the session to their calendar. If they tap the “check” button again, the session will be removed from their calendar. The state of the button is (confusingly) stored in an instance variable called mStarred, so depending on the state of this button, the Activity will launch a Service that adds or removes that session to the user’s calendar in its onStop() method:

页面里有一个“+”按钮，我们能通过这个按钮将 IO 大会添加日历的对应日期里，如果 IO 大会已经被添加到日历中，“+”按钮则会变成“check”按钮；如果用户再次点击“check”按钮，IO 大会则会从日历中被移除。打开相应的源码我们会发现：这个按钮的状态储存在一个叫作 mStarred 的实例变量里，Activity 会根据按钮的状态启动一个 Service，Service 将在它的 onStop() 方法中将对应的 IO 大会添加到用户的日历中/将对应的 IO 大会从用户的日历中移除。

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

This seems like a sensible piece of code to write a unit test against. Here’s the problem: you can’t write a unit test against this code. In order to see why, we’ll have to take a step back from Android and think a bit about what makes code testable in general.

在这样的代码里写一个测试单元看起来是个明智的选择，但问题就来了：你并不能为这样的代码写一个测试单元。你可能就不懂了，为什么不能写啊？别急，为了找到问题所在，我们不妨回到 Android 系统里，并想一想通常情况下，是什么让代码可以被测试。

The three steps of a unit test, as we all know, are arrange, act, and assert. In order to successfully perform the assert-step in our test, we need access to the state of our program that was changed as a result of the code executed in the act-step of the test. Let’s call this state the “post-act-state.” For unit tests, there’s only three ways that we can access the post-act-state.

我们都知道，一个测试单元包含了三个步骤：准备，测试，断言。为了顺利地展示我们测试中的断言步骤，我们需要获得程序在执行测试步骤中的代码后的状态。我们不妨将这个状态称为“测试后状态”。对一个测试单元来说，只有三种办法能获得测试后状态。

The first way we can access the post-act-state is to check the return value of the method that executed during the act-step of the test. Writing tests against these methods is easy:

第一种办法就是检查测试步骤中执行的方法的返回值，写下这样的测试代码倒不难：

```java
public void testSquare() {
    
    MathNerd mathNerd = new MathNerd();
    
    int result = mathNerd.square(2);
    
    assertEquals(result, 4);
}
```

The second way to get a handle on your post-act-state is to get a reference to some publicly accessible property of the object being tested, and to assert that the state of that property is what you expect:

第二种办法就是获得被测试对象中那些可访问的属性的引用，并断言你取得的这些属性就是你想要的：

```java
public void testSquare() {
    
    MathNerd mathNerd = new MathNerd();
    
    int result = mathNerd.square(2);
    
    assertTrue(mathNerd.didDoMath());
}
```

The final way to assert that your post-act-state meets your expectations is check the state of the object’s injected dependencies. These dependencies may not be publicly accessible, but because you inject them during your test method, you have a reference to them:

第三种办法是检查对象中被注入的依赖的状态。这些依赖或许是不可访问的，但因为你在测试函数中对它们进行注入，那么你肯定会持有它们的引用

```java
public void testSquare() {
    
    Calculator calculator = new Calculator();
    
    TerribleMathStudent terribleMathStudent = new TerribleMathStudent(calculator);
    
    //terribleMathStudent uses calculator to do this
    int result = terribleMathStudent.square(2);
    The IOsched app has a IO session detail screen that looks like this:
    assertTrue(calculator.didDoMath());
}
```

Now that we’ve listed all of the ways that we can complete the assert-step of a unit test, we’re in a position to see why the above Android code is untestable: there’s simply no way for us to complete the assert-step of a unit test against the onStop() method. onStop() doesn’t have a return value. There’s no publicly accessible property of SessionDetailActivity that will help us verify that the SessionCalendarService has been launched with the correct instructions. Finally, the code that launches the SessionCalendarService is not code that belongs to a dependency that’s been injected into SessionDetailActivity.

那么我们现在已经把能够在一个测试单元中完成断言步骤的方法都列出来了，接下来就该解释为什么刚刚的 Android 代码无法被测试了：答案很简单，我们根本没有办法在 onStop() 方法里完成测试单元的断言步骤——因为 onStop() 方法根本就没有返回值。SessionDetailActivity 里也不存在能帮助我们验证 SessionCalendarService 是否通过正确的命令启动的可访问属性。最后，启动 SessionCalendarService 的代码也不属于注入到 SessionDetailActivity 中的依赖。

Unfortunately, it gets worse than this. It is also impossible to complete the arrange-step of a unit-test for onStop(). In order to complete the arrange-step of a unit test, you must be able to alter any conditions that affect the post-act-state of your program. I will call these conditions “pre-act-state.” Since there’s no way to change the pre-act-state for onStop(), we can’t unit test it.

你以为这样就完了吗？很不幸，还有比这更糟糕的。在 onStop() 里完成测试单元的准备步骤也是不可能的。为了在测试单元中完成准备步骤，你必须能够改变影响程序测试后状态的所有因素，不妨把它们叫作“预测试状态”。而我们没有任何办法能够在 onStop() 方法里改变预测试状态，所以我们不能对应用进行单元测试。

The pre-act-state within onStop() is the mInitStarred boolean. Again, here’s the source for onStop():

onStop() 方法里，预测试状态是一个叫作 mInitStarred 的布尔值，你看看写在 onStop() 里的代码估计就懂我的意思了：

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

This boolean is set in a callback method that’s executed after a ContentProvider query has completed:

这个布尔值会在 ContentProvider 的查询操作完成后通过回调方法被设置：

```java
private void onSessionQueryComplete(Cursor cursor) {
 
    final boolean inMySchedule = cursor.getInt(SessionsQuery.IN_MY_SCHEDULE) != 0;
    
    //...
    
    if (!mIsKeynote) {
        showStarredDeferred(mInitStarred = inMySchedule, false);
    }
    
    //...
}
```

There’s a reason mInitStarred is initialized in a Loader callback. If a user adds a session to their calendar and navigates away from the SesssionDetailActivity, the flag indicating whether the session is a part of a user’s calendar is stored in a database table containing IO Sessions. As we all know, Google wants us to use Loaders to get data from a database, so mInitStarred gets initialized in a Loader callback.¹

让 mInitStarred 在 Loader 回调方法里被初始化的原因是：如果用户向他们的日历添加了在 SessionDetailActivity 中选择的 IO 大会事件，那么用于标识该 IO 大会是否被添加到用户日历中的变量将会被存储到数据库中包含所有 IO 大会的表中。我们都知道，Google 希望我们使用 Loader 去获得数据库中的数据，所以 mInitStarred 在 Loader 回调方法里被初始化。

> They push Loaders pretty hard in one of their videos for the Udacity course on Android Development.
> 注：但是 Google 自己用 Loader 取数据都非常困难，详见视频：[Click me!](https://www.youtube.com/watch?v=qrPoIF6A9gM)

mInitStarred is used to determine whether its actually necessary to launch a SessionCalendarService to update the user’s calendar to include or exclude a particular session. If the database tells us that a session is already a part of a user’s calendar and if the state of the plus button indicates that that’s what the user wants when they leave the SessionDetailActivity, then we don’t need to do anything.

mInitStarred 用于判断应用是否必须启动 SessinCalendarService 更新用户的日历，添加/移除某个 IO 大会的信息。如果从数据库中查询获得的信息表示用户的日历已经添加了该大会，而且添加按钮已经转换为“check”，我们就不需要进行任何操作。

So, if we’re testing onStop(), we want to make sure that it launches a Service that updates the user’s calendar according to the state of the plus button only if necessary. Unfortunately, because mInitStarred is a private instance variable that’s initialized in a Loader callback, there is simply no way for us to change the value of mInitStarred from a unit test method. Again, to see this, let’s think through the ways that we alter an object’s pre-act-state state for a unit test.

所以，如果我们要在 onStop() 方法里进行测试，我们想要确定 onStop() 方法是否真正启动了一个根据“+”按钮的状态去更新用户日历的 Service。但很不幸，mInitStarred 是一个在 Loader 回调中被初始化的私有实例变量，如果要在测试单元里改变它的值，一定会非常麻烦。那我们现在不妨再来想想改变测试单元预测试状态的办法。

The first way is to alter a publicly accessible property that affects the object’s pre-act-state:

第一个办法是，改变影响对象预测试状态的公有属性：

> Clearly there’s multiple ways of doing this. If, for example, the pre-act-state is determined by a dependency of the object being tested, we can also modify pre-act-state by changing the dependency’s public property.

> 注：改变测试状态的公有属性显然有很多办法。但如果，我举个例子，预测试状态由被测试对象的依赖决定，那我们当然也可以通过改变对象依赖的公有属性改变被测试对象的预测试状态。

```java
public void testSquare() {
    
    TerribleMathStudent terribleMathStudent = new TerribleMathStudent();
    terribleMathStudent.setCalculator(new BrokenCalculator());
    
    //terribleMathStudent uses broken calculator to do this, so this student really sucks
    int result = terribleMathStudent.square(2);
    
    assertNotEquals(result, 4);
    
    //we pity the terrible math student, so we give him a working calculator
    terribleMathStudent.setCalculator(new Calculator());
    
    result = terribleMathStudent.square(2);
    
    assertEquals(result, 4);
}
```

The second way is to change the parameters passed in to the method being tested:

第二个办法是改变传入被测试方法的参数：

```java
public void testSquare() {
    
    MathNerd mathNerd = new MathNerd();
    
    //Math nerds only use calculators when they need them
    int result = mathNerd.squareBigNumber(new BrokenCalculator(), 54321);
    
    assertNotEquals(result, 2950771041);
    
    result = mathNerd.squareBigNumber(new Calculator(), 54321);
    
    assertEquals(result, 2950771041);
}
```

Again, neither of these two options are available to us, so we can’t even complete the arrange-step of a unit test for onStop(). There is no publicly accessible property on SessionDetailActivity that we can set to alter the value of mInitStarred. onStop(), moreover, doesn’t take mInitStarred as a parameter, so we can’t modify the pre-act-state by changing onStop()‘s parameter value either.

就像改变测试后状态一样，这两个办法都不能解决我们的问题，所以我们根本不可能在 onStop() 方法里面完成测试单元的准备步骤。因为在 SessionDetailActivity 里根本不存在能用于改变 mInitStarred 的公有属性。除此以外，onStop() 方法也不会把 mInitStarred 当作一个参数，所以我们无法通过改变 onStop() 的参数值来改变预测试状态。

## Conclusion
## 结论

So, a piece of code that seems like it should be easy to unit test, turns out to be impossible to test. If you’ve ever found yourself staring at Activity for hours trying to figure how to unit test some of its business logic, this is why: In many cases, it’s just not possible. It some cases, it may be impossible to complete the arrange-step of a test because you have no way of altering the test object’s pre-act-state. In other cases, you may not be able to complete the assert-step of your test because you can’t access relevant post-act-state. onStop() in SessionDetailActivity suffers from both of these problems.

经过上面一系列源码的分析，每一个希冀进行单元测试的开发者都站在了悬崖的边缘上：即便是 Google 官方所谓的范例应用 - IOsched 中一个看起来非常简单的模块，要进行单元测试都困难重重。如果你曾经为了在 Activity 里为你的业务逻辑添加相应的测试单元绞尽脑汁，我现在可以告诉你为什么会这么蛋疼：大部分情况下，要在 Activity 里添加相应的测试单元只是不能实现而已。某些情况下，因为你没有办法改变被测试对象的预测试状态，使得你无法完成单元测试的准备步骤。在另一些情况下，因为你无法访问相关的测试后状态，使得你无法完成对象的断言步骤。而 SessionDetailActivity 的 onStop() 方法就是完美的示例，因为上面的两种情况在它身上体现地淋漓尽致。

There is plenty of Android code that is simply untestable. I think that the way we structure our applications, along with some special properties of Android platform, set us on a path to writing un-testable code. In the next post, I’ll elaborate on this claim.

Android 里还有许多类似的代码也是无法测试的，这让我不禁怀疑：让我们写下无法测试的代码的罪魁祸首，会不会就是带有 Android 平台特性的应用架构方式。所以在下一篇博文里，我将会深入探索这个假设。
