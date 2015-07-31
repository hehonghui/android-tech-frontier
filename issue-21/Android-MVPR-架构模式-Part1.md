Android MVPR 架构模式-Part1
---

> * 原文链接 : [MVPR: A FLEXIBLE, TESTABLE ARCHITECTURE FOR ANDROID (PT. 1)](http://www.philosophicalhacker.com/2015/07/07/mvpr-a-flexible-testable-architecture-for-android-pt-1/)
* 原文作者 :[Matthew Dupree](http://philosophicalhacker.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 


> Thorough unit testing helps us improve the internal quality because, to be tested, a unit has to be structured to run outside the system in a test fixture. A unit test for an object needs to create the object, provide its dependencies, interact with it, and check that it behaved as expected. So, for a class to be easy to unit-test, the class must have explicit dependencies that can easily be substituted and clear responsibilities that can easily be invoked and verified. In software engineering terms, that means that the code must be loosely coupled and highly cohesive —in other words, well-designed.

> 全面的单元测试能提高内部系统的代码质量，因为系统的每一个组件都需要被测试，因此每个单元都需要在系统外被构建，在测试环境中进行测试。对对象进行单元测试需要创建该对象，提供该对象需要的依赖，并与它进行交互，最终检验测试环境的输出是否与预期一致。因此，为了让一个类易于进行单元测试，类的依赖必须明确，而且能够轻易地被替代和明确被调用和验证的责任。在软件工程领域中，这就意味着代码必须松耦合、高内聚，也就是说：设计优秀的。

> Steve Freeman and Nat Pryce, Growing Object Oriented Software Guided by Tests

> Steve Freeman 和 Nat Pryce，也就是测试驱动的面向对象开发。

Lately, I’ve been working towards making Google’s IO app unit testable. A part of the reason I’m doing this is to test the claims that Freeman and Pryce make in the above quotation about unit testing. Although I’m still not even done with refactoring one Activity in Google’s IOSched app, I’m already finding some truth to what they’re saying.

最近我在尝试让 Google 的 IO App 变得可单元测试，我这样做的其中一个原因是验证 Freeman 和 Pryce 在引用中对单元测试的总结。即使现在我还是没有把 IOSched 中的任何一个 Activity 重构，但我已经在重构代码的过程中感受到他们所说的东西了。

The Activity that I’ve been working on is the SessionDetailActivity. If you’ve been following me for a while, you know exactly what Activity I’m talking about, but if you’re tuning in the first time, here’s what the SessionDetailActivity UI looks like:

我现在在重构的 Activity 是 SessionDetailActivity，如果你一直有在关注我的话就会知道我说的是哪个 Activity，但如果你只是第一次看我的博文，你可以看看下面这张图了解下 SessionDetailActivity 的界面是咋样的。

![](http://i0.wp.com/www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png?resize=169%2C300)

As I mentioned in the post that introduced this series, there have been several challenges to making the SessionDetailActivity unit testable. Unit testing its dynamically constructed views was a challenge that I discussed in my last post in this series, but in that post, I noted that my strategy for testing dynamically constructed views wasn’t entirely clean because of a circular dependency between Views and Presenters.

就像我在这个系列博文的序中所说，要让 SessionDetailActivity 可被单元测试，有几个麻烦必须解决。我在这个系列的上一篇博文中说过，对它动态构建的 View 进行单元测试是一个挑战，但在那篇博文中，我提到我解决这个问题的办法并不能治本，因为在 View 和 Presenter 之间存在着循环依赖。

This circular dependency is a symptom of a larger problem with how we structure our Android applications: both Activities and Presenters violate the principle of single responsibility. They are often responsible for at least two things: binding data to a View and responding to user input. This is a part of the reason why the SessionDetailActivity, a class that’s supposed to serve as a model for Android development, is over 1000 lines long.

循环依赖是 Android 应用架构存在大问题的征兆：Activity 和 Presenter 都违反了单一职责原则，它们至少需要完成两件事：为 View 绑定数据并对用户的输入作出相应。这也是为什么 SessionDetailActivity 这个类会作为 Android 开发的 Model 被使用，使得类的代码数超过1000行。

I think there’s a better way to structure our applications. In the next few posts, I’ll propose a new architecture that has the following properties:

我坚信有更好的办法架构我们的应用，在接下来的博文里，我会提出一种拥有以下特性的新架构：

1. It breaks up the multiple responsibilities typically handled by Presenters and Activities

1. 将通常由 Presenter 和 Activity 负责的多重职责打破

2. It breaks the circular dependency that traditionally exists between Views on the one hand and Activities or Presenters on the other hand.

2. 打破一般存在于 View 间或 Activity 和 Presenter 之间的循环依赖

3. It enables us to use constructor dependency injection for all of our objects that present data to the user and respond to user input.

3. 允许我们用构造方法对所有为用户展示数据以及相应用户输入的对象进行依赖注入

4. It makes our ui-related business logic classes easier to unit test, impossible to construct without the dependencies necessary to fulfill their responsibilities, and (slightly) more amenable to the use of composition and polymorphism to extend and/or modify object behavior.

4. 让 UI 相关的业务逻辑易于进行单元测试，而且不可能在没有必要的依赖时被构建以履行他们的职责，而且通过利用聚合和多态性修改对象的行为。

In this post, I will try to give some reasons why we might consider a new architecture for Android development in the first place.

在这片博文中，我会尝试总结开发新的 Android 应用架构的原因。

##Why a New Architecture?

###Activities/Fragments/Presenters can become Bloated

##为什么需要新的架构？

##Activity/Fragment/Presenter 会变得臃肿

Activities and Fragments (I’m just going say “Activities” from now on, but what I say applies equally to Fragments.) are egregious violators of the principle of single responsibility. At Droidcon Montreal, Richa Khandelwal listed the responsibilities that often wind up in an Activity:

Activity 和 Fragment（接下来我会统称为 Activities，但我说的也适用于 Fragment）是违反单一职责原则的典型：

- Handle View Events

- 处理 View 的事件

- Update Model

- 更新数据 Model

- Invoke another View

- 调用其他 View

- Interact with System Components

- 与系统组件交互

- Handle System Events

- 处理系统事件

- Update View based on System Events

- 基于系统事件更新 View

As Richa shows later in the presentation, many of these responsibilities can be moved out of Activities, but even if we do that, Activities still violate the principle of single responsibility. Even the slimmest Activities are still responsible for binding a model’s data to the View and for responding to user input. Here’s an example:

正如 Richa 所说，这些职责大部分从 Activities 中剥离，但即使我们这样做了，Activities 还是违反了单一职责原则。即使是最简单的 Activities 还是需要将 Model 的数据和 View 绑定，并对用户输入作出相应，例如：

```java
public class SessionDetailActivity extends BaseActivity implements
        LoaderManager.LoaderCallbacks<Cursor>,
        ObservableScrollView.Callbacks {
    
    //...
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        //Responsibility 1: Responding to user's action (in this case, a click)
        mAddScheduleButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                boolean starred = !mStarred;
                SessionsHelper helper = new SessionsHelper(SessionDetailActivity.this);
                showStarred(starred, true);
                helper.setSessionStarred(mSessionUri, starred, mTitleString);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    mAddScheduleButton.announceForAccessibility(starred ?
                            getString(R.string.session_details_a11y_session_added) :
                            getString(R.string.session_details_a11y_session_removed));
                }

                /* [ANALYTICS:EVENT]
                 * TRIGGER:   Add or remove a session from My Schedule.
                 * CATEGORY:  'Session'
                 * ACTION:    'Starred' or 'Unstarred'
                 * LABEL:     Session title/subtitle.
                 * [/ANALYTICS]
                 */
                AnalyticsManager.sendEvent(
                        "Session", starred ? "Starred" : "Unstarred", mTitleString, 0L);
            }
        });

        //...

        //Responsibility 2: Fetching and binding data to the view
        LoaderManager manager = getLoaderManager();
        manager.initLoader(SessionsQuery._TOKEN, null, this);
        manager.initLoader(SpeakersQuery._TOKEN, null, this);
        manager.initLoader(TAG_METADATA_TOKEN, null, this);
    }
```

The SessionDetailActivity in Google’s IOSched app is actually a good example of how bloated an Activity can get even if its only concerned with the two responsibilities of binding data to views and responding to user input. ~70% of the 1000+ lines of SessionDetailActivity are only concerned with these two responsibilities, so even if we moved all other code out of the SessionDetailActivity, we’d still have a class that’s about 700 lines long. Don’t believe me? Take a look at the source code. Presenters can become bloated for the same reason an Activity does: Presenters are typically responsible for binding data to a View and for responding to user input, so a Presenter would be just as long as an Activity that’s slimmed down by removing all of its other extra responsibilities. 

Google IOSched 应用中的 SessionDetailActivity 就是 Activity 即使只负责绑定数据到 View 中和响应用户输入也会变得臃肿的绝佳范例。即使我们把这部分代码从 SessionDetailActivity 中剥离，还是有一个类有700多行代码。不信我？你大可以去看看源码，Presenter 也会因为 Activity 那样的原因变得臃肿：Presenter 通常负责绑定数据以及响应用户输入，所以 Presenter 也需要像 Activity 那样通过剥离额外的职责被瘦身。

###Activities/Fragments/Presenters often have a Circular Dependency on their Views

###Activities/Fragment/Presenter 通常在 View 间存在循环依赖

Activities typically fulfill their responsibilities of binding data to views and responding to user input by creating a circular dependency between themselves and the Views that make up their Content View (i.e., the view passed in to the setContentView() method). There’s a piece of code in the same gist that I showed above that provides an example of this.

Activities 通常通过它们和 View 之间的循环依赖履行绑定数据到 View 和响应用户输入的职责（例如：作为 setContentView() 方法参数的 View）。下面是范例：

```java
mAddScheduleButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                boolean starred = !mStarred;
                SessionsHelper helper = new SessionsHelper(SessionDetailActivity.this);
                showStarred(starred, true);
                helper.setSessionStarred(mSessionUri, starred, mTitleString);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    mAddScheduleButton.announceForAccessibility(starred ?
                            getString(R.string.session_details_a11y_session_added) :
                            getString(R.string.session_details_a11y_session_removed));
                }
 
                /* [ANALYTICS:EVENT]
                 * TRIGGER:   Add or remove a session from My Schedule.
                 * CATEGORY:  'Session'
                 * ACTION:    'Starred' or 'Unstarred'
                 * LABEL:     Session title/subtitle.
                 * [/ANALYTICS]
                 */
                AnalyticsManager.sendEvent(
                        "Session", starred ? "Starred" : "Unstarred", mTitleString, 0L);
            }
        });
```

The SessionDetailActivity has a reference to mAddScheduleButton and mAddSchedule button has a reference to SessionDetailActivity. As we’ll see later, this circular dependency limits the approaches we can take to implementing the UI-related business logic that’s typically found in Activities.

SessionDetailActivity 持有对 mAddScheduleButton 的引用，而且 mAddScheduleButton 也持有对 SessionDetailActivity 的引用。我等会会说，这样的循环依赖限制我们通常用于 Activities 中实现 UI 相关的业务逻辑的方法。

MVP Presenters have basically the same circular dependency between themselves and their Views. Before I can explain this in more detail, I have to make a brief distinction between MVP-Views and Android-Views.

MVP 的 Presenter 有着和它们和 View 相同的循环依赖，在我能详细解释之前，我必须简单地介绍传统 Android 应用架构中 View 和 MVP 模式中 View 的区别。

An MVP-View, as I’m defining it, is just an object that’s a part of the MVP triad. It’s typically defined as an interface, and it may be implemented by an Activity, Fragment, or an Android-View. An Android-View, as the name implies, is a class that is a part of the Android framework. More specifically, it’s a subclass of the View class.

MVP 模式中的 View 就像我定义的，只是 MVP 模式三巨头其中之一，通常被定义为一个接口，而且一般会在 Activity，Fragment 或 Android 传统架构中的 View 中实现。Android 传统架构中的 View 就像它的名字，是一个 View 的子类。

Using MVP-Views and Presenters just recreates virtually the same circular dependency between MVP-Views and Presenters that exists between Android-Views and Activities.

使用 MVP 模式中的 View 和 Presenter 仅仅是在它们之间无形中重新创建了和 Android 传统架构中 View 和 Activities 之间相同的循环依赖。

![](http://i2.wp.com/www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-011.png?resize=300%2C222)

![](http://i2.wp.com/www.philosophicalhacker.com/wp-content/uploads/2015/07/CircularDependency-021.png?resize=300%2C222)

Presenters need MVP-Views so that they can bind data to the MVP-View. The MVP-View needs a reference to the Presenter so that it can forward clicks and other ui-related events to the Presenter. Square’s [post against Fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html) has an MVP implementation that exhibits this circular dependency. Hannes Dorfmann’s [post introducing his library to help implement MVP](http://hannesdorfmann.com/android/mosby/) also has some code that has this circular dependency.

Presenter 需要 MVP 模式中的 View 使得它们能绑定数据到 MVP 模式中的 View，MVP 模式 中的 View 需要对 Presenter 的引用，使得它能传递点击和其他 UI 相关的事件给 Presenter。Square 的[博文](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html)就有存在着循环依赖的 MVP 模式的实现。

Circular dependencies pose a problem when you try to construct objects for unit testing (or in general). However, typically, we don’t see the circular dependency between MVP-Views and Presenters or Activities and their Android-Views as a problem because Activities and Fragments are instantiated by the system and because we don’t usually use dependency injection to inject an Activity and/or Fragment’s dependencies. Instead, we just instantiate whatever dependences the Activity needs in onCreate():

循环依赖在你想要为单元测试构建对象（或通常情况下）都会产生问题。然而，通常情况下，我们都不会把 MVP 模式的 View 和 Presenter 或 Activities 和 View 间的循环依赖当作问题，因为 Activities 和 Fragment 被系统初始化，而且因为我们并没有用依赖注入去注入 Activity 和/或 Fragment 的依赖。相反的是，我们只是初始化了 Activity 在 onCreate() 方法中需要的任何依赖：

```java
public class MyActivity extends Activity implements MVPView {

    View mButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_browse_sessions);
        //...
        final Presenter presenter = new Presenter(this);
        mButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presenter.onButtonClicked();
            }
        });
    }
}
```

Instantiating concrete classes of our dependencies in onCreate(), however, limits our ability to use composition and polymorphism to implement our ui-related business logic. Here’s an example where you might wish you could use polymorphism to implement ui-related business logic: Suppose your implementing an application that has users. Suppose further that the users have different privileges based on the level they attain. They might attain higher levels by verifying an email or by answering a question that others users have asked (StackOverflow style). Finally, suppose that the user interface that’s presented to the user is largely dependent on the level they have attained as a user. We might imagine that there a many buttons that do different things depending on the level the user has achieved or that the initial state of the view depends on the user’s level.
Polymorphism provides us with a clean, scalable way to implement this kind of logic: we can have a Presenter for each level the user can attain. Regardless of the level the user has attained, we can pass the same MVP-View to into a particular Presenter subclass and let that particular subclass appropriately handle clicks or present the initial UI based on the user’s level. Of course, there are ways of architecting Android apps so that we can take advantage of polymorphism in spite of the circular dependency between Presenters and MVP-Views, but none of the approaches that I’ve seen are particularly pretty, nor do they do a great job of facilitating unit testing. 

初始化在 onCreate() 方法中依赖的混合类，然而，限制我们使用组合和多态性去实现 UI 相关的业务逻辑。下面是一个你应该使用多态性实现 UI 相关的业务逻辑的例子：假设你开发了一个被用户使用的应用，而且用户在不同的等级时有不同的特权，那么他们需要通过邮件验证或回答其他用户提的问题以提高等级。我们可以想象有许多按钮用于完成依赖等级完成的不同功能，或 View 由用户等级决定的初始状态。多态性为我们提供整洁，可拓展的方式去实现这样的逻辑：我们创建一个 Presenter 用于为用户绑定不同的等级，不管用户在什么等级中，我们都能把 MVP 模式中的 View 传到特定的 Presenter 子类中，并让该子类处理相应的点击事件或者基于用户的等级呈现 UI。当然了，还有许多架构 Android 应用的方式，使得我们能够在存在 Presenter 和 MVP 模式中的 View 间循环依赖的情况下利用多态性，但这些方法都不够优雅，或者说他们为了完成单元测试作出了极大的贡献。

I don’t have the space here to go over all of those different solutions that I have in mind, but I can briefly say why one easy way of resolving the circular dependency between MVP-Views and Presenters is not ideal. You might think that we can just create an MVP-View or Presenter without the dependencies they need to fulfill their responsibilities. We could, in other words, do something like this:

这篇博文剩下的篇幅已经不足以让我一一细述我记得的那些解决方法，但我能简要的说说为什么解决 MVP 模式中的 View 和 Presenter 间循环依赖的方法不理想。你可以想象我们可以只创建一个 MVP 模式的 View 或 Presenter，而没有它们履行职责所需的任何依赖。换句话说，我们可以像下面这样：

```java
public class MyActivity extends Activity implements MVPView {
 
    View mButton;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_browse_sessions);
        //...
        final Presenter presenter = new Presenter();
        //****
        presenter.setView(this);
        //****
        mButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presenter.onButtonClicked();
            }
        });
    }
}
```

This would allow us to use polymorphism to solve problems like the one I mentioned above, but it doesn’t really break the circular dependency between MVP-Views and Presenters. All it does is allow us to create an object in an invalid state. This isn’t cleanest solution. To put the point in Freeman and Pryce’s words:

这样我们就能通过多态性解决上面提到的问题，但这并没有打破循环依赖。它能做的是允许我们在无效状态创建一个对象。这并不是最简洁的解决办法，把这放在 Freeman 和 Pryce 话里：

> “New or new not, there is no try”

> “创建或不创建，不需要尝试”

> We try to make sure that we always create a valid object…Partially creating an object and then finishing it off by setting its properties is brittle…

> 我们想要确保总是创建有效的对象，部分地创建对象然后通过设置它的属性完成它是脆弱的……

##Conclusion

##结论

Presenters and Activities violate the principle of single responsibility. They are often responsible for binding data to a View and for responding to user input/actions. This can cause both Activities and Presenters to become bloated.

Presenter 和 Activities 违反了单一职责原则，他们常常负责绑定数据到 View 中和响应用户的输入，这些都会使 Activities 和 Presenter 变得臃肿。

Presenters and Activities often carry out their multiple responsibilities by creating a circular dependency between themselves and their Views. Although this circular reference doesn’t appear to be a problem, it can make it more difficult to unit test our Views and/or Presenters and it can limit our ability to use polymorphism to implement ui-related business logic.

Presenter 和 Activities 常常会因为他们和 View 间的循环依赖拥有多重职责，即使这样的循环引用不会带来什么问题，但这会更难以对 View 和/或 Presenter 进行单元测试，而且会限制我们使用多态性实现 UI 相关的业务逻辑。

As I said before, I think there’s a way of structuring our applications that doesn’t have these disadvantages, and in the next post, I’ll go over this alternative architecture.

就像我之前说的，我认为会有一种架构应用的办法不会有上面这些烈士，在下一篇博文中，我会提出可供选择的架构。