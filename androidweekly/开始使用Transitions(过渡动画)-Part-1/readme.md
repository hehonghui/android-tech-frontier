
`开始使用 Transitions（过渡动画） (part 1)`
---

>
* 原文链接 : [Getting Started with Activity & Fragment Transitions (part 1)][source-url]
* 译者 : [tiiime](https://github.com/tiiime)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  寻找校对中


#Getting Started with Activity & Fragment Transitions (part 1)

#开始使用 Transitions

##First
This post gives a brief overview of Transitions and introduces the new Activity & Fragment transition APIs t hat were added in Android 5.0 Lollipop. This is the first of a series of posts I will be writing on the topic:

Part 1: Getting Started with Activity & Fragment Transitions
Part 2: Content Transitions In-Depth
Part 3a: Shared Element Transitions In-Depth
Part 3b: Postponed Shared Element Transitions
Part 3c: Implementing Shared Element Callbacks (coming soon!)
Part 4: Activity & Fragment Transition Examples (coming soon!)
We begin by answering the following question: what is a Transition?

##首先
这篇文章主要介绍 Android 5.0 新加入的 Transition (过渡动画) API，这是这个系列的第一篇文章。主要介绍下面几个话题:


- Part 1: [在 Activity 和 Fragment 中使用 Transition ][part-1]
- Part 2: [深入理解 Transition][part-2]
- Part 3a: [深入理解共享元素的 Transition][part3a]
- Part 3b:  [延迟共享元素的 Transition][part-3b]
- Part 3c: 共享元素回调实践 (coming soon!)
- Part 4:  Activity & Fragment 过渡动画示例(coming soon!)

今天这篇文章是 Transition 的概述，同时也象征着这个专栏的开始，希望大家喜欢啦。

---

What is a Transition?

Activity and Fragment transitions in Lollipop are built on top of a relatively
new feature in Android called Transitions. Introduced in KitKat, the transition
framework provides a convenient API for animating between different UI states
in an application. The framework is built around two key concepts: scenes
and transitions. A scene defines a given state of an application's UI,
whereas a transition defines the animated change between two scenes.

When a scene changes, a Transition has two main responsibilities:

Capture the state of each view in both the start and end scenes, and
Create an Animator based on the differences that will animate the views from one scene to the other.

#先说下什么是 Transition(过渡动画).
Lollipop 中 Activity 和 Fragment 的过渡动画是基于 Android 一个叫作 Transition 的新特性实现的。
初次引入是在 KitKat 中，Transition 框架提供了一个方便的 API 来构建应用中不同 UI 状态切换时的动画。
这个框架始终围绕两个关键概念:场景和过渡。
**场景** 描述应用中 UI 的状态，[**过渡**][transition] 确定两个场景转换之间的过渡动画。

当场景转换，Transition 的主要职责是：

1. 捕获每一个 View 的起始和结束状态
2. 根据这些数据来创建从一个场景到另一个场景间的过渡动画。

下面是一个简单示例，当用户点击，我们需要 Activity 的 View 视图产生消失和出现的效果。使用 Transition ，实现这个需求只要几行代码，代码如下：<a id="1" href="#b1">(1)</a>


---

```java
public class ExampleActivity extends Activity implements View.OnClickListener {
    private ViewGroup mRootView;
    private View mRedBox, mGreenBox, mBlueBox, mBlackBox;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mRootView = (ViewGroup) findViewById(R.id.layout_root_view);
        mRootView.setOnClickListener(this);

        mRedBox = findViewById(R.id.red_box);
        mGreenBox = findViewById(R.id.green_box);
        mBlueBox = findViewById(R.id.blue_box);
        mBlackBox = findViewById(R.id.black_box);
    }

    @Override
    public void onClick(View v) {
        TransitionManager.beginDelayedTransition(mRootView, new Fade());
        toggleVisibility(mRedBox, mGreenBox, mBlueBox, mBlackBox);
    }

    private static void toggleVisibility(View... views) {
        for (View view : views) {
            boolean isVisible = view.getVisibility() == View.VISIBLE;
            view.setVisibility(isVisible ? View.INVISIBLE : View.VISIBLE);
        }
    }
}
```

---

To better understand what happens under-the-hood in this example, let's analyze
the process step-by-step assuming that each view is initially VISIBLE on screen:


1. A click is detected and the developer calls beginDelayedTransition(), passing
the scene root and a Fade transition as the arguments. The framework immediately
calls the transition's captureStartValues() method for each view in the scene
and the transition records each view's visibility.
2. When the call returns, the developer sets each view in the scene to INVISIBLE.
3. On the next display frame, the framework calls the transition's
captureEndValues() method for each view in the scene and the transition
records each view's (recently updated) visibility.
4. The framework calls the transition's createAnimator() method. The transition
analyzes the start and end values of each view and notices a difference: the
views are VISIBLE in the start scene but INVISIBLE in the end scene. The Fade
transition uses this information to create and return an AnimatorSet that will
fade each view's alpha property to 0f.

5. The framework runs the returned Animator, causing all views to gradually fade
out of the screen.

---

为了更好地理解底层中发生了什么，我们一步一步地分析下这段代码，首先假设屏幕上的所有的 View 都是**可见**的:

1. 首先，点击按钮后调用了 [beginDelayedTransition()][beginDelayedTransition]，
将根场景和 [Fade][fade] 过渡效果(淡入/淡出)作为参数传递出去。框架立即对场景中所有 View 调用 Transitions 的 [captureStartValues()][captureStartValues] 方法，同时， Transitions 将记录每个 View 的可见性。
2. 调用结束后，开发者将场景中所有 View 设置为**不可见**的。
3. 在下一个画面，框架对场景中所有 View(近期更新的) 调用 Transitions 的[captureEndValues()][captureEndValues]
方法， Transitions 记录可见性。
4. 框架调用 Transitions 的 [createAnimator()][createAnimator] 方法。Transition 分析每一个 View 的起始/结束状态，注意到 View 的可见性发生了变化。之后 **Fade** 对象利用这些信息创建了一个**AnimatorSet** 对象，并将其返回到框架中，进而将每个 View 的 **alpha** 值渐变到 **0f**。

5. 框架运行返回的**动画**,让所有 View 从屏幕中淡出。

---

This simple example highlights two main advantages that the transition framework
has to offer. First, Transitions abstract the idea of Animators from the
developer. As a result, Transitions can significantly reduce the amount of code
you write in your activities and fragments: all the developer must do is set the
views' start and end values and the Transition will automatically construct an
animation based on the differences. Second, animations between scenes can be
easily changed by using different Transition objects. [Video 1.1](http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/04/trivial-opt.mp4),
for example, illustrates the dramatically different effects we can achieve by
replacing the Fade transition with a Slide or Explode. As we will see moving
forward, these advantages will allow us to build complex Activity and Fragment
transition animations with a relatively small amount of code. In the next few
sections, we will see for ourselves how this can be done using Lollipop's new
Activity and Fragment transition APIs.

这个栗子强调了 Transition 框架的两个优势。第一，**Transition**s 将来自开发人员的**动画**概念抽象，显著的降低了
Activity 和 Fragment 内的代码量，我们只要设置好 View 的 起始 和 结束 时的状态，
Transition 会自动创建动画。其次，只要更换 **Transition** 对象就可以修改两个场景间的动画。
[ 示例 **Video 1.1**][video1.1],只要少量代码就可以创建复杂的动画效果。
后续文章会介绍如何做到。
<video src="http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/04/trivial-opt.mp4" controls>
   Your browser does not implement html5 video.
</video>
---
Activity & Fragment Transitions in Android Lollipop

As of Android 5.0, Transitions can now be used to perform elaborate animations when switching between different Activitys or Fragments. Although Activity and Fragment animations could already be specified in previous platform versions using the Activity#overridePendingTransition() and FragmentTransaction#setCustomAnimation() methods, they were limited in that they could only animate the entire Activity/Fragment container as a whole. The new Lollipop APIs take this a step further, making it possible to animate individual views as they enter or exit their containers and even allowing us to animate shared views from one Activity/Fragment container to the other.

# Lollipop 中的 Activity & Fragment Transitions
在 Android 5.0 中， 切换 **Activitys** 或者 **Fragments** 时可以使用 **Transitions** 来构建精致的过场动画。
虽然在上个版本中已经引入Activity 和 Fragment 动画(通过 [Activity#overridePendingTransition()][overridePendingTransition] 和 [FragmentTransaction#setCustomAnimation()][setCustomAnimations] 方法)，但是动画的对象只能是**Activity/Fragment**整体。而新的 API 将这个特性延伸，可以为每个 View 单独设置动画，甚至可以在两个独立的 Activity/Fragment 容器内共享某些 View。


---

Let's begin by discussing the terminology that will be used in this series of posts. Note that although the terminology below is defined in terms of Activity transitions, the exact same terminology will be used for Fragment transitions as well:


>Let A and B be activities and assume activity A starts activity B.
>We refer to A as the "calling Activity" (the activity that "calls"
>startActivity()) and B as the "called Activity".

接下来介绍些术语。注意，虽然下面是以 Activity 为例，但是在 Fragment 中这些术语也同样有效:

>假设 **A** 和 **B** 是两个 Activity，通过 **A** 来启动 **B**。
>**A** 叫做 "调用Activity"(调用 `startActivity()` 的那个)
>**B** 就是 "被调用Activity"


---

The Activity transition APIs are built around the idea of exit, enter, return, and reenter transitions. In the context of activities A and B defined above, we can describe each as follows:

>Activity A's exit transition determines how views in A are animated when A starts B.

>Activity B's enter transition determines how views in B are animated when A starts B.

>Activity B's return transition determines how views in B are animated when B returns to A.

>Activity A's reenter transition determines how views in A are animated when B returns to A.


Activity transition API 是围绕退出，进入，返回还有重入过渡动画效果构建的。根据之前的定义我们可以这样描述它们:

>Activity **A** 的 退出 Transition 确定 **A** 启动 **B** 时 **A** 中 View 的动画

>Activity **B** 的 进入 Transition 确定 **A** 启动 **B** 时 **B** 中 View 的动画

>Activity **B** 的 返回 Transition 确定 **B** 返回 **A** 时 **B** 中 View 的动画

>Activity **A** 的 重入 Transition 确定 **B** 返回 **A** 时 **A** 中 View 的动画

---
Lastly, the framework provides APIs for two types of Activity transitions—content transitions and shared element transitions—each of which allow us to customize the animations between Activities in unique ways:

>A content transition determines how an activity's non-shared views—called transitioning views—enter or exit the activity scene.

>A shared element transition determines how an activity's shared elements (also called hero views) are animated between two activities.

最后，Transition 框架提供了 **Content(内容)**和**共享元素(Shared Element)** 两种类型的Activity过渡动画，每个都可以让我们以独特的方式自定义 Activity 切换间的动画

>**Content(内容) Transition** 确定了非共享元素如何 进入/退出 Activity 场景

>**共享元素(Shared Element) Transition** 确定了两个Activity 共享 View (也被叫做主角视图)的动画效果。

---

Video 1.2 gives a nice illustration of content transitions and shared element transitions used in the Google Play Newsstand app. Although we can't be sure without looking at the Newsstand source code, my best guess is that the following transitions are used:


[Video 1.2][video1.2]这段视频很好的解释了 Content Transition 和 共享元素 Transition，我猜想它使用了下面的过渡动画。

<video src="http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/04/news-opt.mp4" controls>
   Your browser does not implement html5 video.
</ video>

---
- The exit and reenter content transitions for activity A (the calling activity) are both null. We can tell because the non-shared views in A are not animated when the user exits and reenters the activity.2
- The enter content transition for activity B (the called activity) uses a custom slide-in transition that shuffles the list items into place from the bottom of the screen.
- The return content transition for activity B is a TransitionSet that plays two child transitions in parallel: a Slide(Gravity.TOP) transition targeting the views in the top half of the activity and a Slide(Gravity.BOTTOM) transition targeting the views in the bottom half of the activity. The result is that the activity appears to "break in half" when the user clicks the back button and returns to activity A.
- The enter and return shared element transitions both use a ChangeImageTransform, causing the ImageView to be animated seamlessly between the two activities.

- **A**(调用Activity) 的**退出**和**重入** Content Transition 都是 **null**。因为用户退出和重入时 Activity A中的非共享视图没有动画效果。<a id="2" href="#b2">(2)</a>


- **B**(被调用Activity) 的**进入** Content Transition 使用了一个自定义的 Slide Transition 将list item从底部移至屏幕中。

- Activity **B** 的**返回** Content Transition是一个 **TransitionSet**，同时进行两个子 Transition:一个Slide (Gravity.TOP) Transition
针对Activity上半部分的View，一个Slide (Gravity.BOTTOM) Transition 针对Activity 下半部分View。当用户点击按钮返回Activity A，Activity呈现一种断成两半的感觉。

- 共享元素的进入和退出 Transition 都是 **ChangeImageTransform**，使ImageView过渡动画可以在两个Activity间无缝衔接。

---
You've probably also noticed the cool circular reveal animation that plays under the shared element during the transition. We will cover how this can be done in a future blog post. For now, let's keep things simple and familiarize ourselves with the Activity and Fragment transition APIs.


你可能也注意到了一个圆形的过渡动画(circular reveal)，我们会在将来的章节中介绍它是如何实现的。现在，我们来继续了解 Activity 和 Fragment transition APIs

---
#Introducing the Activity Transition API

Creating a basic Activity transition is relatively easy using the new Lollipop APIs. Summarized below are the steps you must take in order to implement one in your application. In the posts that follow, we will go through much more advanced use-cases and examples, but for now the next two sections will serve as a good introduction:

#介绍Activity Transition API

使用 Lollipop 的 APIs 创建一个 Activity 过渡动画 非常简单，下面的总结是实现一个过渡动画的必要步骤。在接下来的文章中我们还会介绍很多提升水平的用例，不过现在先让我们来入个门:

---
- Enable the new transition APIs by requesting the Window.FEATURE_ACTIVITY_TRANSITIONS window feature in your called and calling Activities, either programatically or in your theme's XML.3 Material-themed applications have this flag enabled by default.
- Set exit and enter content transitions for your calling and called activities respectively. Material-themed applications have their exit and enter content transitions set to null and Fade respectively by default. If the reenter or return transitions are not explicitly set, the activity's exit and enter content transitions respectively will be used in their place instead.
- Set exit and enter shared element transitions for your calling and called activities respectively. Material-themed applications have their shared element exit and enter transitions set to @android:transition/move by default. If the reenter or return transitions are not explicitly set, the activity's exit and enter shared element transitions respectively will be used in their place instead.
- To start an Activity transition with content transitions and shared elements, call the startActivity(Context, Bundle) method and pass the following Bundle as the second argument:

	```java
	ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
	```
where pairs is an array of Pair<View, String> objects listing the shared element views and names that you'd like to share between activities.4 Don't forget to give your shared elements unique transition names, either programatically or in XML. Otherwise, the transition will not work properly!

- To programatically trigger a return transition, call finishAfterTransition() instead of finish().

- By default, material-themed applications have their enter/return content transitions started a tiny bit before their exit/reenter content transitions complete, creating a small overlap that makes the overall effect more seamless and dramatic. If you wish to explicitly disable this behavior, you can do so by calling the setWindowAllowEnterTransitionOverlap() and setWindowAllowReturnTransitionOverlap() methods or by setting the corresponding attributes in your theme's XML.


- 在你的A(调用Activity)和B(被调用Activity)的 `.java` 文件或者
`xml`<a id="3" href="#b3">(3)</a>布局中请求启用
[`Window.FEATURE_ACTIVITY_TRANSITIONS`][FEATURE_ACTIVITY_TRANSITIONS] 窗口特性，
使用Material主题的应用默认已开启。
- 为A和B单独设置 [**exit**][exit] 和 [**enter**][enter] Content Transition 。
Material主题的 [**exit**][exit] 和 [**enter**][enter] Content Transition 默认分别是
`null`和`Fade`。如果没有明确定义 [**reenter**][reenter] 或 [**return**][return]
Content Transition 将会使用 Activity 的 [**exit**][exit] 和 [**enter**][enter]
 Transition 来代替。
- 为 A 和 B 设置 [**exit**][exit] 和 [**enter**][enter] 共享元素 Transition。
Material主题中 共享元素 默认设置[`@android:transition/move`][move]作为
[**exit**][exit] 和 [**enter**][enter] 过渡动画。如果没有明确定义
[**reenter**][reenter] 和 [**return**][return] 的过渡动画将会使用 Activity 的
[**exit**][exit] 和 [**enter**][enter] 过渡动画作为替代。
- 启动一个包含 Content Transition 和 共享元素 Transition 的 Activity 时要调用
`startActivity(Context, Bundle) `方法，并传递

	```java
	ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
	```
作为第二个参数，**pairs** 是一个 **Pair< View, String >** 数组，记录Activity间<a id="4" href="#b4">(4)</a> 共享元素的View 和 相对应的特征字符串。别忘了
在[程序][setTransitionName]中或[xml][xml]文件里给共享元素设置不重复的名称，否则过渡动画不会正常运行。
- 通过程序启动一个返回 Transition，调用 **finishAfterTransition()** 代替 **finish()**。
- Material主题应用默认会在他们的**退出/重入** Transition 完成前一点点启动**进入/返回** Content Transition，这样会在两个动画间产生一些重叠，让过渡动画更戏剧性。如果你想关闭这个特性可以调用 [ setWindowAllowEnterTransitionOverlap()][setAllowEnterTransitionOverlap] 和
[setWindowAllowReturnTransitionOverlap()][setAllowReturnTransitionOverlap] 方法或者在xml文件里给定适当的属性

---

##Introducing the Fragment Transition API

If you are working with Fragment transitions, the API is similar with a few small differences:

- Content exit, enter, reenter, and return transitions should be set by calling the corresponding methods in the Fragment class or as attributes in your Fragment's XML tag.
- Shared element enter and return transitions should be set by calling the corresponding methods in the Fragment class or as attributes in your Fragment's XML.
- Whereas Activity transitions are triggered by explicit calls to startActivity() and finishAfterTransition(), Fragment transitions are triggered automatically when a fragment is added, removed, attached, detached, shown, or hidden by a FragmentTransaction.
- Shared elements should be specified as part of the FragmentTransaction by calling the addSharedElement(View, String) method before the transaction is committed.


##Fragment 的 Transition API
如果你使用 Fragment 的 transition API，大部分 API 相似，但是会有一些小的不同:

- Content 的[退出][exit]，[进入][enter]，[重入][reenter]和[返回][return] 过渡动画应该在 Fragment 的`.java`文件中调用对应的方法或者在 xml 属性声明里设置。
- 共享元素 的[进入][enter]和 [返回][return] 过渡动画应该在 Fragment 的`.java`文件中调用对应的方法或者在 xml 属性声明里设置。
- 鉴于Activity的 Transition 是通过调用 **startActivity()** 和 **finishAfterTransition()** 直接启动的,Fragment 的过渡是在 Fragment
被add, remove, attach, detach, show,或 hidden 后由 FragmentTransaction 自动启动。
- 共享元素应该在transaction(事务)提交前调用[`addSharedElement(View, String)`][addSharedElement]声明为 **FragmentTransaction** 的一部分。

---

Conclusion

In this post, we have only given a brief introduction to the new Activitiy and Fragment transition APIs. However, as we will see in the next few posts having a solid understanding of the basics will significantly speed up the development process in the long-run, especially when it comes to writing custom Transitions. In the posts that follow, we will cover content transitions and shared element transitions in even more depth and will obtain an even greater understanding of how Activity and Fragment transitions work under-the-hood.

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

##结语
这篇文章里我们只是简单的介绍了 Activitiy 和 Fragment transition API，但是在接下来的文章你会发现扎实的基础给你带来的好处，
尤其是在讲到**自定义过渡动画**时。后面我们会非常深入的讲解 Content Transition 和 共享元素 Transition，让你更加了解 Activity 和 Fragment 背后的工作。

希望你喜欢我的文章，感谢观看～

---



1. If you want to try the example out yourself, the XML layout code can be found here. <a id="b1" href="#1">↩</a>

2. It might look like the views in A are fading in/out of the screen at first, but what you are really seeing is activity B fading in/out of the screen on top of activity A. The views in activity A are not actually animating during this time. You can adjust the duration of the background fade by calling setTransitionBackgroundFadeDuration() on the called activity's Window. <a id="b2" href="#2">↩</a>

3. For an explanation describing the differences between the FEATURE_ACTIVITY_TRANSITIONS and FEATURE_CONTENT_TRANSITIONS window feature flags, see this StackOverflow post. <a id="b3" href="#3">↩</a>

4. To start an Activity transition with content transitions but no shared elements, you can create the Bundle by calling ActivityOptions.makeSceneTransitionAnimation(activity).toBundle(). To disable content transitions and shared element transitions entirely, don't create a Bundle object at all—just pass null instead. <a id="b4" href="#4">↩</a>

---

1. 如果你想尝试这个例子，这里有[xml代码][xmlcode] <a id="b1" href="#1">↩</a>

2. 第一眼看上去可能感觉是Activity A fade in/out 屏幕, 事实上是Activity B 在 Activity A 的上面渐变. A 中的 View 事实上是没有动画的. 你可以在被调用 Activity 的 Window 中使用[setTransitionBackgroundFadeDuration()][setTransitionBackgroundFadeDuration]方法调节背景渐变持续时间。 <a id="b2" href="#2">↩</a>

3. 了解更多关于 **FEATURE_ACTIVITY_TRANSITIONS** 和 **FEATURE_CONTENT_TRANSITIONS** 窗口特性的不同可以看[这里StackOverflow Post][window-feature]<a id="b3" href="#3">↩</a>

4. 启动一个包含Content Transition 而不是共享元素 Transition 的Activity,可以这样创建**Bundle**

	```java
ActivityOptions.makeSceneTransitionAnimation(activity).toBundle()
	```
如果想完全禁用Content Transition 和 共享元素 Transition 可以将 Bundle 设为 **null**. <a id="b4" href="#4">↩</a>


---


---

[source-url]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html

[part-1]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
[part-2]:http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html
[part3a]:http://www.androiddesignpatterns.com/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
[part-3b]:http://www.androiddesignpatterns.com/2015/03/activity-postponed-shared-element-transitions-part3b.html

[beginDelayedTransition]:https://developer.android.com/reference/android/transition/TransitionManager.html#beginDelayedTransition(android.view.ViewGroup,%20android.transition.Transition)
[captureStartValues]:https://developer.android.com/reference/android/transition/Transition.html#captureStartValues(android.transition.TransitionValues)
[captureEndValues]:https://developer.android.com/reference/android/transition/Transition.html#captureEndValues(android.transition.TransitionValues)

[createAnimator]:https://developer.android.com/reference/android/transition/Transition.html#createAnimator(android.view.ViewGroup,%20android.transition.TransitionValues,%20android.transition.TransitionValues)
[video1.1]:http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/04/trivial-opt.mp4
[video1.2]:http://www.androiddesignpatterns.com/assets/videos/posts/2014/12/04/news-opt.mp4
[FEATURE_ACTIVITY_TRANSITIONS]:http://developer.android.com/reference/android/view/Window.html#FEATURE_ACTIVITY_TRANSITIONS
[move]:https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/res/res/transition/move.xml
[fade]:https://developer.android.com/reference/android/transition/Fade.html
[transition]:https://developer.android.com/reference/android/transition/Transition.html

[overridePendingTransition]:http://developer.android.com/reference/android/app/Activity.html#overridePendingTransition(int,%20int)
[setCustomAnimations]:http://developer.android.com/reference/android/app/FragmentTransaction.html#setCustomAnimations(int,%20int,%20int,%20int)


[exit]:https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
[enter]:https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
[reenter]:https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)
[return]:https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
[addSharedElement]:https://developer.android.com/reference/android/app/FragmentTransaction.html#addSharedElement(android.view.View,%20java.lang.String)
[setTransitionName]:https://developer.android.com/reference/android/view/View.html#setTransitionName(java.lang.String)
[xml]:https://developer.android.com/reference/android/view/View.html#attr_android:transitionName
[setAllowEnterTransitionOverlap]:http://developer.android.com/reference/android/view/Window.html#setAllowEnterTransitionOverlap(boolean)
[setAllowReturnTransitionOverlap]:http://developer.android.com/reference/android/view/Window.html#setAllowReturnTransitionOverlap(boolean)
[xmlcode]:https://gist.github.com/alexjlockwood/a96781b876138c37e88e
[window-feature]:http://stackoverflow.com/questions/28975840/feature-activity-transitions-vs-feature-content-transitions
[setTransitionBackgroundFadeDuration]:http://developer.android.com/reference/android/view/Window.html#setTransitionBackgroundFadeDuration(long)
