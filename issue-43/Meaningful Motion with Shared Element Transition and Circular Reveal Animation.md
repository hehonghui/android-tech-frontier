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

So with this kind of animation we’ve got a powerful tool to create delightful animation. Why don’t we go a step further? Today I will show you cool transition by using the combination of circular reveal animation, fade animation and shared element transition. Below You can see the difference that it provides:

What do we have:

[视频](https://youtu.be/GtSFkEzPbDM)

What do we want to achieve:


[视频](https://youtu.be/0KQfK3GatL8)
 

##First step: Shared Element Transition

Android Lollipop was released with a new concept of the design – Material Design. With this release we’ve been introduced to new cool features, just like shared element transitions. Thanks to this tool we are able to get user along with the motion and achieve one of the main points of material design. We can do it with three simple steps:

##Declare shared element transition name

First, we have to declare shared element between two activities we are transitioning it. We can do it in two ways – in the XML or in the code itself. This is how XML should look like:

```xml
<android.support.design.widget.FloatingActionButton
	android:id="@+id/activity_main_fab"
	android:layout_height="wrap_content"
	android:layout_width="wrap_content"
	android:layout_margin="@dimen/activity_horizontal_margin"
	...
	android:transitionName="reveal"/>
```

or

```java
	mFab.setTransitionName("reveal");
```

When we do it this way, we have to declare the same transition name in Activity we are transitioning to, and then fire this Activity with one of those methods:

```java
Intent intent = new Intent(this, ContactActivity.class);
ActivityOptionsCompat.makeSceneTransitionAnimation(Activity activity,Pair<View, String>... sharedElements);
ActivityCompat.startActivity(this, intent, option.toBundle());
```

or

```java
Intent intent = new Intent(this, ContactActivity.class);
ActivityOptionsCompat.makeSceneTransitionAnimation(Activity activity, (View)sharedElement, String transitionName);
ActivityCompat.startActivity(this, intent, option.toBundle());
```

Create arc motion with transition animation

In the second Activity, in our example called ContactActivity, we have to set proper Enter Transition. We are doing it with this piece of code:

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

##Second step: Circular Reveal Animation

To complete the full meaningful motion, we have to make a circural reveal, and then fade the layout in.

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

We have context that is used to retrieve color from @ColorRes value and duration of the animation from resources. We have centerX and centerY parameter, rootView that we are making circular reveal on and custom listener to communicate between the AnimatorListener and our Activity. When the animation has ended, we are informing the listener to fade the views in. So there is method initViews() that is fading the views in:

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

##Third step: Return to MainActivity

As You can see, the meaningful motion is not created one-way. When we click on the close icon in the left top corner, or press back button we are finishing ContactActivity with Hiding Circular Reveal Animation and return shared element transition. The second one is handled by the framework, so we don’t have to worry about it. The first one we have to implement so I will explain it below:

Override the onBackPressed() method in Activity

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

##Conclusion

Android Lollipop gives us a big range of tools to implement amazing and cool UI with meaningful motion and great transitions. Although it’s still available only on 30% of the devices, the audience is getting bigger and Material Design concepts are here to stay.

Thank You for reading this, and I invite You to comment this article below.

Cheers!