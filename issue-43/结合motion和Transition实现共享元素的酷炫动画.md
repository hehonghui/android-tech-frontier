在Activity配置改变时保存状态
---

> * 原文链接 : [Meaningful Motion with Shared Element Transition and Circular Reveal Animation](http://www.thedroidsonroids.com/blog/android/meaningful-motion-with-shared-element-transition-and-circular-reveal-animation/)
* 原文作者 : [Mariusz Brona](http://www.thedroidsonroids.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



##First glance

The circular reveal animation is one of the most popular animations in a Material Design paradigm. Following official android documentation:

> Reveal animations provide users visual continuity when you show or hide a group of UI elements.

水波纹动画是 Material Design 中最受欢迎的动画之一，下面是官方文档对它的描述：

> 水波纹动画能在显示/隐藏一组 UI 元素时为用户提供连续的视觉体验。

So with this kind of animation we’ve got a powerful tool to create delightful animation. Why don’t we go a step further? Today I will show you cool transition by using the combination of circular reveal animation, fade animation and shared element transition. Below You can see the difference that it provides:

What do we have:

使用水波纹动画，我们可以创造更酷炫的动画效果，今天我会教大家组合使用水波纹动画，淡出/淡入动画以及共享元素 Transition，创造酷炫的 Transition 动画，下面是某个 UI 控件使用该动画前和使用动画后的效果：

使用前：

[视频](https://youtu.be/GtSFkEzPbDM)

使用后：


[视频](https://youtu.be/0KQfK3GatL8)
 

##First step: Shared Element Transition
##首先：共享元素 Transition

Android Lollipop was released with a new concept of the design – Material Design. With this release we’ve been introduced to new cool features, just like shared element transitions. Thanks to this tool we are able to get user along with the motion and achieve one of the main points of material design. We can do it with three simple steps:

Android Lollipop 介绍了新的设计理念 - Material Design，在本次更新中我们了解到新的，很酷的特性，例如共享元素 Transition。Transition 使我们能够根据用户的意向提供一致性体验，实现 Material Design 核心理念之一。具体实现可以通过下面三个步骤完成：

##Declare shared element transition name
##声明共享元素 Transition

First, we have to declare shared element between two activities we are transitioning it. We can do it in two ways – in the XML or in the code itself. This is how XML should look like:

首先，我们需要声明使用 Transition 的 Activity 视图中某个 UI 控件为共享元素，这一步可以通过 xml 或 java 代码完成：

```xml
<android.support.design.widget.FloatingActionButton
	android:id="@+id/activity_main_fab"
	android:layout_height="wrap_content"
	android:layout_width="wrap_content"
	android:layout_margin="@dimen/activity_horizontal_margin"
	...
	android:transitionName="reveal"/>
```

或

```java
	mFab.setTransitionName("reveal");
```

When we do it this way, we have to declare the same transition name in Activity we are transitioning to, and then fire this Activity with one of those methods:

然后我们要在需要通过显示 Transition 动画启动的 Activity 中声明 Transition 的名称，然后通过这些方法启动 Activity：

```java
Intent intent = new Intent(this, ContactActivity.class);
ActivityOptionsCompat.makeSceneTransitionAnimation(Activity activity,Pair<View, String>... sharedElements);
ActivityCompat.startActivity(this, intent, option.toBundle());
```

或

```java
Intent intent = new Intent(this, ContactActivity.class);
ActivityOptionsCompat.makeSceneTransitionAnimation(Activity activity, (View)sharedElement, String transitionName);
ActivityCompat.startActivity(this, intent, option.toBundle());
```

##Create arc motion with transition animation

In the second Activity, in our example called ContactActivity, we have to set proper Enter Transition. We are doing it with this piece of code:

在目标 Activity 中（在下面的例子中命名为 ContactActivity），需要通过以下代码设置正确的启动 Transition：

```java

	@Bind(R.id.activity_contact_rl_container) RelativeLayout mRlContainer;        
	@Bind(R.id.activity_contact_fab) FloatingActionButton mFab;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		...
		setupEnterAnimation();
		...
	}

	private void setupEnterAnimation() {
		Transition transition = TransitionInflater.from(this).inflateTransition(R.transition.change_bound_with_arc);
		transition.setDuration(300);
		getWindow().setSharedElementEnterTransition(transition);
		transition.addListener(new Transition.TransitionListener() {
			@Override
			public void onTransitionStart(Transition transition) {

			}

			@Override
			public void onTransitionEnd(Transition transition) {
				animateRevealShow(mRlContainer);
			}

			@Override
			public void onTransitionCancel(Transition transition) {

			}

			@Override
			public void onTransitionPause(Transition transition) {

			}

			@Override
			public void onTransitionResume(Transition transition) {

			}
		});
	}
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<transitionSet
	xmlns:android="http://schemas.android.com/apk/res/android"
	android:duration="200"
	android:interpolator="@android:interpolator/fast_out_linear_in">
	<changeBounds>
		<!--suppress AndroidElementNotAllowed -->
		<arcMotion
			android:maximumAngle="90"
			android:minimumHorizontalAngle="90"
			android:minimumVerticalAngle="0"/>
	</changeBounds>
</transitionSet>
```

First look into java code. We are inflating a transition that is declared in our xml file. We are setting duration, and then we are setting the inflated transition as SharedElementEnterTransition. And there is a tricky part – to achieve this meaningful motion effect, we have to implement the TransitionListener. In onTransitionEnd callback we have to start the Circular Reveal Animation. Secondly, look into XML code. We have declared a transitionSet with changeBounds and arcMotion. The first is responsible for capturing views bounds in first and second activity and animate it between them. The second is responsible for creating this arc motion. We also declared there minimumHorizontalAngle and minimumVerticalAngle to force curvature between two points.

In onTransitionEnd callback we have the animateRevealShow() method, which takes us to the second part of this article.

通过代码，我们将 xml 中声明的 Transition 初始化，设置其时长，并把它设为 SharedElementEnterTransition。然后就是最有趣的部分 - 组合实现动画，为此，我们必须实现 TransitionListener。在 onTransitionEnd() 回调方法中我们需要启动水波纹动画，在 xml 中我们声明了同时使用 changeBounds 和 arcMotion 的 transitionset，changeBounds 捕获两个 Activity 中目标 View 的边界，并显示动画；arcMotion 负责创建弧形弯曲路径。此外，我们还声明 minimumHorizontalAngle 和 minimumVerticalAngle 保证两点间的曲率。

在 onTransitionEnd() 回调中我们使用了 animateRevealShow() 方法，也就是下文要讲的内容：

##Second step: Circular Reveal Animation
##第二部：水波纹动画

To complete the full meaningful motion, we have to make a circural reveal, and then fade the layout in.

为了实现整个动画效果，我们先创建水波纹动画，然后淡入布局：

```java
private void animateRevealShow(final View viewRoot) {
	int cx = (viewRoot.getLeft() + viewRoot.getRight()) / 2;
	int cy = (viewRoot.getTop() + viewRoot.getBottom()) / 2;
	GUIUtils.animateRevealShow(this, viewRoot, mFab.getWidth() / 2, R.color.accent_color,
		cx, cy, new OnRevealAnimationListener() {
			@Override
			public void onRevealHide() {

			}

			@Override
			public void onRevealShow() {
				initViews();
			}
		});
}

//GUIUtils method:

public static void animateRevealShow(final Context ctx, final View view, final int startRadius,
		@ColorRes int color, int x, int y, OnRevealAnimationListener listener) {
	float finalRadius = (float) Math.hypot(view.getWidth(), view.getHeight());
	Animator anim =	ViewAnimationUtils.createCircularReveal(view, x, y, startRadius, finalRadius);
	anim.setDuration(ctx.getResources().getInteger(R.integer.animation_duration));
	anim.setStartDelay(80);
	anim.setInterpolator(new FastOutLinearInInterpolator());
	anim.addListener(new AnimatorListenerAdapter() {
		@Override
		public void onAnimationStart(Animator animation) {
			view.setBackgroundColor(ContextCompat.getColor(ctx, color));
		}

		@Override
		public void onAnimationEnd(Animator animation) {
			view.setVisibility(View.VISIBLE);
			if(listener != null) {
				listener.onRevealShow();
			}
		}
	});
	anim.start();
}
```

In the first animateRevealShow method we have to get the centerX and centerY dimension. Then we have to call the second method that I transfered to the GUIUtils class to skip repeatability of the code. So take a look into GUIUtils method animateRevealShow and explain every parameter in this method:

在第一个 animateRevealShow() 方法中我们必须得到 centerX 和 centerY，然后调用 GUIUtils 的 animateRevealShow() 方法跳过重复代码，下面是对该方法的解释：

We have context that is used to retrieve color from @ColorRes value and duration of the animation from resources. We have centerX and centerY parameter, rootView that we are making circular reveal on and custom listener to communicate between the AnimatorListener and our Activity. When the animation has ended, we are informing the listener to fade the views in. So there is method initViews() that is fading the views in:

context 用于将 @ColorRes 注解的值转换为颜色对应的常量以及从资源文件中读取动画的持续时间。centerX,  centerY parameter, rootView 用于显示水波纹动画，自定义 Listener 用于 AnimatorListener 与 Activity 间的通信。当动画结束，通知 Listener 淡入 View，下面是用于淡入 View 的 initViews() 方法：

```java
private void initViews() {
	new Handler(Looper.getMainLooper()).post(() -> {
		Animation animation = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
		animation.setDuration(300);
		mLlContainer.startAnimation(animation);
		mIvClose.startAnimation(animation);
		mLlContainer.setVisibility(View.VISIBLE);
		mIvClose.setVisibility(View.VISIBLE);
	});
}
```

The mLLContainer and mIvClose are the LinearLayout with icons and ImageView with close action icon.

mLLContainer 和 mIvClose 是用于显示关闭按钮的 LinearLayout 及 ImageView。

##Third step: Return to MainActivity
##第三部：返回 Activity

As You can see, the meaningful motion is not created one-way. When we click on the close icon in the left top corner, or press back button we are finishing ContactActivity with Hiding Circular Reveal Animation and return shared element transition. The second one is handled by the framework, so we don’t have to worry about it. The first one we have to implement so I will explain it below:

如你所见，整个动画的实现涉及多方面的处理。当我们点击关闭按钮，或者按下后退按钮，意味着要结束 ContactActivity，并以淡出效果显示水波纹动画，返回共享元素 Transition。第二步 Android 的框架层会帮我们完成，所以不用太在意，第一步才是我们真正要实现的，也就是下面解释的部分：

Override the onBackPressed() method in Activity

重载 Activity 中的 onBackPressed() 方法：

```java
@Override
public void onBackPressed() {
	GUIUtils.animateRevealHide(this, mRlContainer, R.color.accent_color, mFab.getWidth() / 2,
		new OnRevealAnimationListener() {
			@Override
			public void onRevealHide() {
				backPressed();
			}

			@Override
			public void onRevealShow() {

			}
		});
}

//GUIUtils

public static void animateRevealHide(final Context ctx, final View view, @ColorRes int color,
		final int finalRadius, OnRevealAnimationListener listener) {
	int cx = (view.getLeft() + view.getRight()) / 2;
	int cy = (view.getTop() + view.getBottom()) / 2;
	int startRadius = view.getWidth();
	Animator anim =	ViewAnimationUtils.createCircularReveal(view, cx, cy, startRadius, finalRadius);
	anim.setInterpolator(new FastOutLinearInInterpolator());
	anim.addListener(new AnimatorListenerAdapter() {
		@Override
		public void onAnimationStart(Animator animation) {
			super.onAnimationStart(animation);
			view.setBackgroundColor(ContextCompat.getColor(ctx,color));
		}

		@Override
		public void onAnimationEnd(Animator animation) {
			super.onAnimationEnd(animation);
			if(listener != null) {
				listener.onRevealHide();
			}
			view.setVisibility(View.INVISIBLE);
		}
	});
	anim.setDuration(ctx.getResources().getInteger(R.integer.animation_duration));
	anim.start();
}
```

After clicking back pressed button we have to make hiding circular reveal animation. The startRadius is a full width of view, the final radius is the FloatingActionButton width divided by 2. When the animation ends, we have to inform the Activity with the OnRevealAnimationListener to call super.onBackPressed(). After that the FAB will be animated with arc motion to the MainActivity.

点击后退按钮后，必须隐藏水波纹动画。因此 startRadius 为 View 的宽度，动画结束时 raidus 就变为 FAB 的宽度除2。当动画结束，需要通过 OnRevealAnimationListener 通知 Activity 调用 super.onBackPressed()，之后通过该弧形路径动画显示 MainActivity 的 FAB。

##Conclusion
##结论

Android Lollipop gives us a big range of tools to implement amazing and cool UI with meaningful motion and great transitions. Although it’s still available only on 30% of the devices, the audience is getting bigger and Material Design concepts are here to stay.

Thank You for reading this, and I invite You to comment this article below.

Cheers!

Lollipop 给我们提供了许多工具，使我们可以利用 motion 和 Transition 实现许多酷炫的 UI 组件，虽说这只支持 30% 的设备，但在未来这个数字会越来越大，让越来越多人注意到 Material Design。

感谢阅读！