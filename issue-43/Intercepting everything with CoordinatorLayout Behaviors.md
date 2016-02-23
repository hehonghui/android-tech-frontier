在Activity配置改变时保存状态
---

> * 原文链接 : [Intercepting everything with CoordinatorLayout Behaviors](https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26#.i6alrxteu)
* 原文作者 : [Ian Lake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



![](https://cdn-images-1.medium.com/max/600/1*voovH-sZjps4amAdRiwRuw.png)

You won’t get far in exploring the Android Design Support Library without running into CoordinatorLayout — many of the Views in the Design Library require a CoordinatorLayout. But why? CoordinatorLayout itself doesn’t actually do much: use it with standard framework views and it acts just like a regular FrameLayout. So where is the magic coming from? That’s where CoordinatorLayout.Behaviors come in. By attaching a Behavior to a direct child of CoordinatorLayout, you’ll be able to intercept touch events, window insets, measurement, layout, and nested scrolling. The Design Library makes heavy use of Behaviors to power much of the functionality you see.

##Creating a Behavior
Creating a behavior is simple enough: extend Behavior.

```java
public class FancyBehavior<V extends View>
    extends CoordinatorLayout.Behavior<V> {
  /**
   * Default constructor for instantiating a FancyBehavior in code.
   */
  public FancyBehavior() {
  }
  /**
   * Default constructor for inflating a FancyBehavior from layout.
   *
   * @param context The {@link Context}.
   * @param attrs The {@link AttributeSet}.
   */
  public FancyBehavior(Context context, AttributeSet attrs) {
    super(context, attrs);
    // Extract any custom attributes out
    // preferably prefixed with behavior_ to denote they
    // belong to a behavior
  }
}
```

Note the generic type attached to this class. Here, what we’re saying is you can attach a FancyBehavior to any View class. However, if you wanted to only allow the Behavior to be attached to a specific kind of View, you could instead write it as:

```java
public class FancyFrameLayoutBehavior
    extends CoordinatorLayout.Behavior<FancyFrameLayout>
```

This would save you from having to cast many of the parameters you receive in method calls from View to the correct subtype — simple convenience is all.

There are methods to save temporary data with Behavior.setTag()/Behavior.getTag() as well as save Behavior-related instance state with onSaveInstanceState()/onRestoreInstanceState(). I’d encourage you to build your Behaviors as lightweight as you can, but these methods help make stateful Behaviors possible.

##Attaching a Behavior
Of course, Behaviors don’t do anything on their own — they need to be attached to a child View of a CoordinatorLayout to actually be called. There are three main ways this can be done: programmatically, in XML, or automatically via an annotation.

###Attaching a Behavior programmatically
When you think about a Behavior as something additional attached to each View in a CoordinatorLayout, it shouldn’t be that surprising (if you’ve read our layouts blog post) to learn that the Behavior is actually stored in the LayoutParams of each View — this is also why Behaviors need to be declared on direct children of CoordinatorLayout as only those children have the specific Behavior-storing subclass of LayoutParams.

```java
FancyBehavior fancyBehavior = new FancyBehavior();
CoordinatorLayout.LayoutParams params =
    (CoordinatorLayout.LayoutParams) yourView.getLayoutParams();
params.setBehavior(fancyBehavior);
```

In this case, you’ll see we’re using the default, no parameter constructor. That doesn’t mean you couldn’t have a constructor that takes any parameters you want though — when doing things in code, there’s no limit to what you can do.

###Attaching a Behavior in XML
Of course, doing everything in code every time would be a bit of a mess. As with most custom LayoutParams, there’s a corresponding layout_ attribute to do the same thing. In this case, that is the layout_behavior attribute:

```xml
<FrameLayout
  android:layout_height=”wrap_content”
  android:layout_width=”match_parent”
  app:layout_behavior=”.FancyBehavior” />
```

Here, unlike the code case, the FancyBehavior(Context context, AttributeSet attrs) constructor is always the one called. As a bonus though, you can declare any other custom attributes you want and extract them from the XML AttributeSet — important if you want developers to be able to customize your Behavior’s functionality via XML (which you do).

> Note: similar to the layout_ naming convention for attributes that the parent class is responsible for parsing and understanding, use a behavior_ prefix for any attributes specifically for use by the Behavior.

###Attaching a Behavior automatically
If you’re building a custom View that needs a custom Behavior (such as was the case for many of the components in the Design Library), then you probably want to attach that behavior by default, without manually specifying it in code or XML every time. To do this, your custom View just needs a simple annotation attached to the top of its class:

```java
@CoordinatorLayout.DefaultBehavior(FancyFrameLayoutBehavior.class)
public class FancyFrameLayout extends FrameLayout {
}
```

You’ll find your Behavior gets called with the default constructor, making this very similar to programmatically attaching the Behavior. Note that any layout_behavior attribute that is present will override a DefaultBehavior.

##Intercepting Touch Events
Once you have your behavior all set up, you’re ready to actually do something. One of the things a Behavior can do is intercept touch events.

Without CoordinatorLayout, this would often involve subclasses of each ViewGroup as talked about in the Managing Touch Events training. However with CoordinatorLayout, CoordinatorLayout is going to pass calls to its onInterceptTouchEvent() onto your Behavior’s onInterceptTouchEvent(), allowing your Behavior a chance to intercept touch events. By returning true there, your Behavior then receives all future touch events through onTouchEvent() — all without the View knowing anything at all about what is going on. This is how, for example, SwipeDismissBehavior works on any View.

There’s another, more heavy handed touch interception though: blocking all interactions whatsoever. Just return true in blocksInteractionBelow() and that’s it. Of course, you probably want to have some visual signal that interactions are blocked (lest they think the app is completely broken) — that’s why the default functionality of blocksInteractionBelow() actually relies on the value of getScrimOpacity() — return a non-zero value here will both paint an overlay color over the View (of color getScrimColor(), defaulting to black) and disable touch interactions all in one swoop. Handy.

##Intercepting Window Insets
Let’s say you read the Why would I want to fitsSystemWindows? blog. There we talked deeply on what fitsSystemWindows actually does, but it boils down to providing you the window insets needed to avoid drawing underneath system windows (such as the status bar and navigation bar). Behaviors get their own chance here as well — if your View as fitsSystemWindows=“true”, then any attached Behavior will get a call to onApplyWindowInsets(), giving it priority over the View itself.

> Note: in most cases, if your Behavior does not consume the entire window insets, it should pass on the insets via ViewCompat.dispatchApplyWindowInsets() to ensure that any children Views get a chance to see the WindowInsets.

##Intercepting Measurement and Layout
Measurement and layout are key components to how Android draws Views. Therefore it only makes sense that Behaviors, as the interceptors of all things, also get the first shot at both measurement and layout via the onMeasureChild() and onLayoutChild() callbacks.

For example, let’s take any generic ViewGroup and add a maxWidth to it:

```java
/*
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 package com.example.behaviors;

import android.content.Context;
import android.content.res.TypedArray;
import android.support.design.widget.CoordinatorLayout;
import android.util.AttributeSet;
import android.view.ViewGroup;

import static android.view.View.MeasureSpec;

/**
 * Behavior that imposes a maximum width on any ViewGroup.
 *
 * <p />Requires an attrs.xml of something like
 *
 * <pre>
 * &lt;declare-styleable name="MaxWidthBehavior_Params"&gt;
 *     &lt;attr name="behavior_maxWidth" format="dimension"/&gt;
 * &lt;/declare-styleable&gt;
 * </pre>
 */
public class MaxWidthBehavior<V extends ViewGroup> extends CoordinatorLayout.Behavior<V> {
    private int mMaxWidth;

    public MaxWidthBehavior(Context context, AttributeSet attrs) {
        super(context, attrs);
        TypedArray a = context.obtainStyledAttributes(attrs,
                R.styleable.MaxWidthBehavior_Params);
        mMaxWidth = a.getDimensionPixelSize(
                R.styleable.MaxWidthBehavior_Params_behavior_maxWidth, 0);
        a.recycle();
    }
    
    @Override
    public boolean onMeasureChild(CoordinatorLayout parent, V child,
            int parentWidthMeasureSpec, int widthUsed,
            int parentHeightMeasureSpec, int heightUsed) {
        if (mMaxWidth <= 0) {
            // No max width means this Behavior is a no-op
            return false;
        }
        int widthMode = MeasureSpec.getMode(parentWidthMeasureSpec);
        int width = MeasureSpec.getSize(parentWidthMeasureSpec);
        
        if (widthMode == MeasureSpec.UNSPECIFIED || width > mMaxWidth) {
            // Sorry to impose here, but max width is kind of a big deal
            width = mMaxWidth;
            widthMode = MeasureSpec.AT_MOST;
            parent.onMeasureChild(child,
                    MeasureSpec.makeMeasureSpec(width, widthMode), widthUsed,
                    parentHeightMeasureSpec, heightUsed);
            // We've measured the View, so CoordinatorLayout doesn't have to
            return true;
        }

        // Looks like the default measurement will work great
        return false;
    }
}
```

Writing generic Behaviors that work on everything is useful, but keep in mind that you can often simplify your life by making assumptions on how internal-to-your-app behaviors are being used. (Not every Behavior needs to be totally generic!)

##Understanding dependencies between Views
All of the above functionality requires just the single View. But where the real power of Behaviors comes in is in building dependencies between Views — i.e., when another View changes, your Behavior can get a callback, changing its functionality based on external conditions.

Behaviors can become dependent on Views in two different ways: when its View is anchored to another View (an implied dependency) or when you explicitly return true in layoutDependsOn().

Anchoring happens when your View utilizes the CoordinatorLayout’s layout_anchor attribute. This, combined with the layout_anchorGravity attribute, allows you to effectively tie the position of two Views together. For example, you can anchor a FloatingActionButton to an AppBarLayout and the FloatingActionButton.Behavior will use the implicit dependency to hide the FAB if the AppBarLayout scrolls off screen.

In either case, your Behavior gets callbacks to onDependentViewRemoved() when a dependent View is removed and onDependentViewChanged() whenever the dependent View has changed (i.e., resized or repositioned itself).

This ability to tie Views together is how much of the cooler functionality of the Design Library works — take, for example, the interaction between the FloatingActionButton and the Snackbar. The FAB’s Behavior depends on instances of the Snackbar being added to the CoordinatorLayout, then using the onDependentViewChanged() callback to translate the FAB upward to avoid overlapping the Snackbar.

> Note: when you add a dependency, the View will always be laid out after the dependent Views are laid out, regardless of child order.

##Nested Scrolling
Ah, nested scrolling. A blog post in and of itself, I’ll just touch upon it here. A few things to keep in mind:
1. You don’t need to declare dependencies on nested scrolling Views. Every child of CoordinatorLayout gets a chance to receive nested scrolling events
2. Nested scrolling can originate not only on direct children of a CoordinatorLayout, but on any child View (a child of a child of a child of a CoordinatorLayout, for example)
3. I’ll call it nested scrolling, but that really covers both scrolling (1:1 movement to scrolling) and flinging

So declaring your interest in a nested scrolling event starts with onStartNestedScroll(). You’ll receive the scrolling axes (horizontal or vertical for instance — making it easy to ignore scrolling in a certain direction) and must return true to receive further scroll events in that direction.

After you return true to onStartNestedScroll(), nested scrolling runs in two steps:

- onNestedPreScroll() runs before the scrolling View gets the scroll event and allows your Behavior to consume some or all of the scroll (the last consumed int[] is an ‘out’ parameter where you can denote what scroll you’ve consumed)

- onNestedScroll() is called as the scrolling View is scrolled — you’ll get how much the view scrolled by and the unconsumed (overscroll) amount as well.

There’s also an equivalent for fling operations (although the pre-fling callback must consume all or nothing of the fling — no partial consuming there).

When the nested scrolling (or flinging) finishes, you’ll get a call to onStopNestedScroll(). This marks the end of the scrolling — expect a new call to onStartNestedScroll() before the next scroll starts.

Take, for example, a case where you want to hide a FloatingActionButton when scrolling down and show it when scrolling up — this only involves overriding onStartNestedScroll() and onNestedScroll(), as seen in this ScrollAwareFABBehavior.

###And this is just the beginning
While each individual part of a Behavior is interesting, when they all come together — that’s where the magic happens. I’d strongly encourage you to look at the source of the Design Library for more advanced behavior — the Android SDK Search Chrome extension is still one of my favorite resources for exploring AOSP code (although the source included in the <android-sdk>/extras/android/m2repository is always the latest).

With a solid foundation in what a Behavior can do, let me know how you use them to #BuildBetterApps

Join the discussion on the Google+ post and follow the Android Development Patterns Collection for more!