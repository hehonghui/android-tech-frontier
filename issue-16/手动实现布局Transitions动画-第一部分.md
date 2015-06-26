# 手动实现布局Transitions动画-第一部分
----

> * 原文链接 : [Manual Layout Transitions – Part 1](https://blog.stylingandroid.com/manual-layout-transitions-part-1/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Mr.Simple](https://github.com/bboyfeiyu)
 

布局切换动画在Material design中是一个重要的方面,因为它们能够指明应用的工作流程，并且能够将UI上的可视化元素绑定在一起作为用户的导航。两个重要的工具可以实现这种效果，分别为Activity转场动画和布局动画（Layout Transitions）。然后布局动画需要在API 19及其之后才支持。在这一系列文章中，我们会学习到即使在无法调用transitions APIs时如何实现很好的转场动画。
 

在我们开始之前，值得指出的是有一个后向兼容的Transitions API提供了到API 14的兼容。然而我决定不使用它，因为我从来没有尝试过使用它。我坚持使用核心的Android API来完成此功能，这个系列文章的目的就是探索transitions API本身使用的技术，从而达到运用自如的效果。

在[上一个系列](https://blog.stylingandroid.com/dirty-phrasebook-part-1/)中当进行转场时会有一些简单的动画。可以到这个[视频地址](https://youtu.be/vXuY7q3Y5zw)进行观看效果 。


我决定手动地实现这些效果，这种实现必须要具备后向兼容性。在开始处理更复杂的动画之前我们先来看看这些简单动画是如何实现的。


让我们来看看上述视频示例中的布局。    

res/layout/activity_main.xml

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools"
  xmlns:sa="http://schemas.android.com/apk/res-auto"
  android:id="@+id/layout_container"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical"
  tools:context=".MainActivity">
 
  <android.support.v7.widget.Toolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    android:background="?attr/colorPrimary"
    android:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar"
    sa:popupTheme="@style/ThemeOverlay.AppCompat.Light">
 
    <Spinner
      android:id="@+id/language"
      android:layout_width="wrap_content"
      android:layout_height="wrap_content" />
 
  </android.support.v7.widget.Toolbar>
 
  <android.support.v7.widget.CardView
    android:id="@+id/input_view"
    android:layout_width="match_parent"
    android:layout_height="0dp"
    android:layout_weight="1"
    android:clipChildren="false">
 
    <RelativeLayout
      android:layout_width="match_parent"
      android:layout_height="match_parent"
      android:clipChildren="false"
      android:padding="@dimen/card_padding">
 
      <View
        android:id="@+id/focus_holder"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:focusableInTouchMode="true" />
 
      <EditText
        android:id="@+id/input"
        style="@style/Widget.TextView.Input"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:inputType="textMultiLine"
        android:imeOptions="flagNoFullscreen|actionDone"
        android:gravity="top"
        android:hint="@string/type_here" />
 
      <ImageView
        android:id="@+id/clear_input"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignTop="@id/input"
        android:layout_alignEnd="@id/input"
        android:layout_alignRight="@id/input"
        android:padding="8dp"
        android:src="@drawable/ic_clear"
        android:visibility="invisible"
        android:contentDescription="@string/clear_input" />
 
      <ImageView
        android:id="@+id/input_done"
        android:layout_width="32dip"
        android:layout_height="32dip"
        android:background="@drawable/done_background"
        android:src="@drawable/ic_arrow_forward"
        android:padding="2dp"
        android:layout_margin="8dp"
        tools:ignore="UnusedAttribute"
        android:elevation="4dp"
        android:visibility="invisible"
        android:layout_alignBottom="@id/input"
        android:layout_alignEnd="@id/input"
        android:layout_alignRight="@id/input"
        android:contentDescription="@string/done" />
 
    </RelativeLayout>
 
  </android.support.v7.widget.CardView>
 
  <FrameLayout
    android:id="@+id/translation_panel"
    android:layout_width="match_parent"
    android:layout_height="0dp"
    android:layout_weight="1"
    android:padding="@dimen/translation_outer_margin">
 
    <android.support.v7.widget.CardView
      android:layout_width="match_parent"
      android:layout_height="wrap_content">
 
      <FrameLayout
        android:id="@+id/translation_copy"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:foreground="@drawable/click_foreground">
 
        <LinearLayout
          android:layout_width="match_parent"
          android:layout_height="wrap_content"
          android:orientation="vertical"
          android:background="?attr/colorPrimary"
          tools:ignore="UselessParent">
 
          <FrameLayout
            android:id="@+id/translation_speak"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:foreground="@drawable/click_foreground"
            android:padding="@dimen/translation_inner_margin">
 
            <TextView
              android:id="@+id/translation_label"
              style="@style/Widget.TextView.Label"
              android:layout_width="match_parent"
              android:layout_height="wrap_content"
              android:textAllCaps="true"
              android:drawableStart="@drawable/ic_tts"
              android:drawableLeft="@drawable/ic_tts"
              android:drawablePadding="4dip"
              android:text="@string/sample_language" />
          </FrameLayout>
 
          <TextView
            android:id="@+id/translation"
            style="@style/Widget.TextView.Translation"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginLeft="@dimen/translation_inner_margin"
            android:layout_marginStart="@dimen/translation_inner_margin"
            android:layout_marginRight="@dimen/translation_inner_margin"
            android:layout_marginEnd="@dimen/translation_inner_margin"
            android:layout_marginBottom="@dimen/translation_inner_margin"
            android:text="@string/sample_translation"/>
        </LinearLayout>
      </FrameLayout>
 
    </android.support.v7.widget.CardView>
 
  </FrameLayout>
 
</LinearLayout>
```

这里需要我们关心的关键组件是Toolbar、id为input_view的CardView、ID为input_done的ImageView以及id为translation_panel的FrameLayout。其他的我们需要关心的就是id为focus_holder且可视状态为invisible的用来抢占焦点的视图。在EditText和focus_holder之间触发焦点时触发进入或者退出输入模式，以此来决定启动对应的动画。

该动画将input_view上移到能够覆盖Toolbar的位置，然后将input_done视图以淡入的形式显示出来，并且将translation_panel淡出。当用户退出输入模式时则执行该动画的反向形式。在上述视频中你可以看到它的具体效果。

我们先看看MainActivity : 


MainActivity.java

```java
public class MainActivity extends AppCompatActivity {
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
 
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        setTitle(R.string.sample_language);
 
        View input = findViewById(R.id.input);
        View inputDone = findViewById(R.id.input_done);
        final View focusHolder = findViewById(R.id.focus_holder);
 
        input.setOnFocusChangeListener(Part1TransitionController.newInstance(this));
        inputDone.setOnClickListener(
                new View.OnClickListener() {
                    @Override
                    public void onClick(@NonNull View v) {
                        focusHolder.requestFocus();
                    }
                });
    }
}
```

这个实现直截了当： 它所做的几UI是初始化Toolbar和视图的焦点逻辑。创建transitions的逻辑是执行在Part1TransitionController类中，我将这部分逻辑抽象到Part1TransitionController中使得我们在该系列的后续文章中能够更容易的包装其他实现。Part1TransitionController类继承自包含了通用逻辑的TransitionController类。

TransitionController.java

```java
public abstract class TransitionController implements View.OnFocusChangeListener {
    private final WeakReference<Activity> activityWeakReference;
    private final AnimatorBuilder animatorBuilder;
 
    protected TransitionController(WeakReference<Activity> activityWeakReference, @NonNull AnimatorBuilder animatorBuilder) {
        this.activityWeakReference = activityWeakReference;
        this.animatorBuilder = animatorBuilder;
    }
 
    @Override
    public void onFocusChange(View v, boolean hasFocus) {
        Activity mainActivity = activityWeakReference.get();
        if (mainActivity != null) {
            if (hasFocus) {
                enterInputMode(mainActivity);
            } else {
                exitInputMode(mainActivity);
            }
        }
    }
 
    protected AnimatorBuilder getAnimatorBuilder() {
        return animatorBuilder;
    }
 
    protected abstract void enterInputMode(Activity mainActivity);
 
    protected abstract void exitInputMode(Activity mainActivity);
 
    protected void closeIme(View view) {
        Activity mainActivity = activityWeakReference.get();
        if (mainActivity != null) {
            InputMethodManager imm = (InputMethodManager) mainActivity.getSystemService(
                    Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }
 
    protected class ImeCloseListener extends AnimatorListenerAdapter {
        private final View view;
 
        public ImeCloseListener(View view) {
            this.view = view;
        }
 
        @Override
        public void onAnimationEnd(@NonNull Animator animation) {
            super.onAnimationEnd(animation);
            closeIme(view);
        }
 
    }
}
```

在该类型中处理了onFocusChanged()事件，并且根据焦点调用相应的函数进入或者退出输入模式。在该类中包含了一个用于确认在退出输入模式时隐藏输入法的AnimatorListener类。另外还含有一个我们重复使用的、构建了一些原子属性的animators的AnimatorBuilder实例，我们看看AnimatorBuilder类的实现。

AnimatorBuilder.java

```java
public class AnimatorBuilder {
    private static final String TRANSLATION_Y = "translationY";
    private static final String ALPHA = "alpha";
 
    private final int duration;
 
    public static AnimatorBuilder newInstance(Context context) {
        int duration = context.getResources().getInteger(android.R.integer.config_mediumAnimTime);
        return new AnimatorBuilder(duration);
    }
 
    AnimatorBuilder(int duration) {
        this.duration = duration;
    }
 
    public Animator buildTranslationYAnimator(View view, int startY, int endY) {
        Animator animator = ObjectAnimator.ofFloat(view, TRANSLATION_Y, startY, endY);
        animator.setDuration(duration);
        return animator;
    }
 
    public Animator buildShowAnimator(View view) {
        return buildAlphaAnimator(view, 0f, 1f);
    }
 
    public Animator buildHideAnimator(View view) {
        return buildAlphaAnimator(view, 1f, 0f);
    }
 
    public Animator buildAlphaAnimator(View view, float startAlpha, float endAlpha) {
        Animator animator = ObjectAnimator.ofFloat(view, ALPHA, startAlpha, endAlpha);
        animator.setDuration(duration);
        return animator;
    }
}
```

这里有两个基本的animator在这里被构建 : 一个是通过修改translationY属性移动View的动画，另一个是修改View的透明度实现修改alpha属性的动画。还有一个是组合了Alpha动画和提供了一些工具方法来将视图从完全不透明变化到透明，以及相反的过程。

所有这些我们只需要看看Part1TransitionController类中如何将这些功能结合在一起运用。

part1/Part1TransitionController.java

```java
public class Part1TransitionController extends TransitionController {
 
    public static TransitionController newInstance(Activity activity) {
        WeakReference<Activity> mainActivityWeakReference = new WeakReference<>(activity);
        AnimatorBuilder animatorBuilder = AnimatorBuilder.newInstance(activity);
        return new Part1TransitionController(mainActivityWeakReference, animatorBuilder);
    }
 
    Part1TransitionController(WeakReference<Activity> mainActivityWeakReference, AnimatorBuilder animatorBuilder) {
        super(mainActivityWeakReference, animatorBuilder);
    }
 
    @Override
    protected void enterInputMode(Activity activity) {
        View inputView = activity.findViewById(R.id.input_view);
        View inputDone = activity.findViewById(R.id.input_done);
        View translation = activity.findViewById(R.id.translation_panel);
        View toolbar = activity.findViewById(R.id.toolbar);
 
        inputDone.setVisibility(View.VISIBLE);
 
        AnimatorSet animatorSet = new AnimatorSet();
        AnimatorBuilder animatorBuilder = getAnimatorBuilder();
        Animator moveInputView = animatorBuilder.buildTranslationYAnimator(inputView, 0, -toolbar.getHeight());
        Animator showInputDone = animatorBuilder.buildShowAnimator(inputDone);
        Animator hideTranslation = animatorBuilder.buildHideAnimator(translation);
        animatorSet.playTogether(moveInputView, showInputDone, hideTranslation);
        animatorSet.start();
    }
 
    @Override
    protected void exitInputMode(Activity activity) {
        final View inputView = activity.findViewById(R.id.input_view);
        View inputDone = activity.findViewById(R.id.input_done);
        View translation = activity.findViewById(R.id.translation_panel);
        View toolbar = activity.findViewById(R.id.toolbar);
 
        AnimatorSet animatorSet = new AnimatorSet();
        AnimatorBuilder animatorBuilder = getAnimatorBuilder();
        Animator moveInputView = animatorBuilder.buildTranslationYAnimator(inputView, -toolbar.getHeight(), 0);
        Animator hideInputDone = animatorBuilder.buildHideAnimator(inputDone);
        Animator showTranslation = animatorBuilder.buildShowAnimator(translation);
        animatorSet.playTogether(moveInputView, hideInputDone, showTranslation);
        animatorSet.addListener(new ImeCloseListener(inputDone));
        animatorSet.start();
    }
}
```

在Part1TransitionController类中我们实现了两个抽象方法，分别为exitInputMode和enterInputMode方法。在这两个函数中我们会找到对应的View，在enterInputMode函数中我们会构建一个包含了移动View到toolbar位置、修改inputDone到不透明状态、translation到透明状态的动画集。在exitInputMode函数中，我们执行相反的动画，同时添加了一个ImeCloseListener实例来保证在动画完成时隐藏输入法。

至此，我们就完成了所需的功能。通过一些基本的属性动画组合我们就完成了复杂的动画功能。

然而，我们并不止步于此。这个示例非常的直截了当，但是TransitionController实例实现了运用于View上的动画逻辑。因此，相比transitions API提供的功能来说我们还有很长的路要走。在下一篇文章中我们会做一些小修改来实现根据View的状态来动态的构建Animators，而不是像这篇文章中的手动创建。

完整的代码在[这里](https://github.com/StylingAndroid/ManualLayoutTransitions/tree/Part1) 。

<p class="cc-block"><a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="CC BY-NC-SA 4.0" class="cc-button" src="https://blog.stylingandroid.com/wp-content/plugins/creative-commons-configurator-1/media/cc/by-nc-sa/4.0/88x31.png" scale="0"></a>
<br>
<a href="http://blog.stylingandroid.com/manual-layout-transitions-part-1/" title="Permalink to Manual Layout Transitions – Part 1"><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" property="dct:title" rel="dct:type">Manual Layout Transitions – Part 1</span></a> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://blog.stylingandroid.com/author/admin/" property="cc:attributionName" rel="cc:attributionURL">Styling Android</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
Permissions beyond the scope of this license may be available at <a xmlns:cc="http://creativecommons.org/ns#" href="http://blog.stylingandroid.com/license-information" rel="cc:morePermissions">http://blog.stylingandroid.com/license-information</a>.</p>