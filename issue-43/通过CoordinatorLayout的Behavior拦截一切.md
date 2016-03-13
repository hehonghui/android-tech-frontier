通过CoordinatorLayout的Behavior拦截一切
---

> * 原文链接 : [Intercepting everything with CoordinatorLayout Behaviors](https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26#.i6alrxteu)
* 原文作者 : [Ian Lake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成 



![](https://cdn-images-1.medium.com/max/600/1*voovH-sZjps4amAdRiwRuw.png)

如果你不研究 CoordinatorLayout，那你在探索 Android Design Support Library 的路上肯定不会走太远 - 因为 Android Design Support Library 中大多数 View 都需要 CoordinatorLayout。但是为什么呢？CoordinatorLayout 自身不需要完成太多的工作：将它与 Android 标准 UI 框架结合使用，它的作用和 FrameLayout 区别不大，那它为什么能提供那么多酷炫的效果呢？答案是：CoordinatorLayout.Behavior。通过将 CoordinatorLayout.Behavior 绑定到 CoordinatorLayout 中的子元素上，你就可以拦截点击事件，窗口插入，测量，布局，还有嵌套滚动。可以说 Android Design Support Library 大多数酷炫的效果都是通过 Behavior 完成的。

##创建 Behavior

自定义 Behavior 很简单，创建 Behavior 子类就可以了：

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

注意类需要绑定的泛型类型，不妨创建可以绑定到任意 View 上的 FancyBehavior；如果你想 Behavior 只能使用到某一种特定的 View 上，可以这样：

```java
public class FancyFrameLayoutBehavior
    extends CoordinatorLayout.Behavior<FancyFrameLayout>
```

通过 Behavior.setTag()/Behavior.getTag() 可以保存临时数据，onSaveInstanceState()/onRestoreInstanceState() 可以保存 Behavior 相关的实例状态。虽说我建议你创建自己的 Behavior，但这些方法让你能够创建状态性 Behavior。

##关联 Behavior

当然，Behavior 不能单干 - 它需要绑定到 CoordinatorLayout 的子元素才能被使用，下面是关联的三种办法。

###通过代码绑定

你可能觉得 Behavior 是 CoordinatorLayout 给每个 View 添加的某种额外属性/其他的东西，但如果我告诉你 Behavior 是每个 View 的 LayoutParams 存储的内容，请不要太惊讶 - 这也是 Behavior 必须关联到 CoordinatorLayout 子元素上的原因，因为只有它们才有 LayoutParams 中对应的属性。

```java
FancyBehavior fancyBehavior = new FancyBehavior();
CoordinatorLayout.LayoutParams params =
    (CoordinatorLayout.LayoutParams) yourView.getLayoutParams();
params.setBehavior(fancyBehavior);
```

在这种情况下，你会使用默认构造方法，当然，你也可以给构造方法设置任何你想要的参数 - 反正代码在手，天下我有嘛。

###通过 xml 绑定

不过不得不说，每次都用代码去完成绑定的工作有一丢丢麻烦，就像大多数自定义 LayoutParams，我们也有相应的 
layout_ 属性去设置 Behavior：

```xml
<FrameLayout
  android:layout_height=”wrap_content”
  android:layout_width=”match_parent”
  app:layout_behavior=”.FancyBehavior” />
```

此时会调用 FancyBehavior(Context context, AttributeSet attrs) 构造方法，也就意味着可以声明任意自定义属性，然后在代码中获得这些属性，如果你想通过 xml 自定义 Behavior 的功能，这个办法就变得很棒了。

> Note: 与使用 layout_ 类似，你也可以使用 behavior_ 指定 Behavior 使用的属性。

###自动绑定

如果你创建了需要自定义 Behavior 的自定义 View，那你可能想让该 View 绑定默认的 Behavior，而不用在每次使用时在代码或 xml 中声明。为了实现这个特性，代码需要改成下面这样：

```java
@CoordinatorLayout.DefaultBehavior(FancyFrameLayoutBehavior.class)
public class FancyFrameLayout extends FrameLayout {
}
```

这样就会自动绑定 Behavior 了，相当于 layout_behavior 默认设置为 DefaultBehavior。

##拦截点击事件

一旦自定义 Behavior 开发完成，就可以用它完成一些任务了，例如拦截点击事件。

不使用 CoordinatorLayout，总是需要创建 ViewGroup 的子类才能得到点击事件。但有了 CoordinatorLayout，就能在 Behavior 里调用 onInterceptTouchEvent() 以控制 CoordinatorLayout 的 onInterceptTouchEvent()，使 Behavior 能拦截点击事件。通过返回 true，Behavior 就能获取所有点击事件，这就是 SwipeDismissBehavior 的原理。

在 blocksInteractionBelow() 方法中返回 true，就会阻塞所有事件传递的交互，拦截所有事件。当然了，你可能希望得到一些视觉上的信号让你知道交互产生的事件都被阻塞了（最起码要让用户知道 App 崩溃了） - 这也是 blocksInteractionBelow() 的默认功能依赖于 getScrimOpacity() 的值的原因 - getScrimOpacity() 方法返回一个非 0 的值，以在 View 上绘制覆盖颜色（getScrimColor() 方法返回对应的颜色，默认是黑色），而且一下子禁止了所有点击事件。很方便。

##拦截窗口插入

我先假设你读过“Why would I want to fitsSystemWindows”，在博文中我们讨论了 fitsSystemWindows 到底干了啥，但说穿了他就是让你得到避免在系统窗口下绘制的窗口插入（例如状态栏和导航栏）。如果 fitsSystemWindows=“true”，那么任何绑定的 Behavior 都会调用 onApplyWindowInsets()，让 Behavior 具有比 View 更高的优先级。

> Note: 大多数情况下，Behavior 不会消耗所有的窗口插入，窗口插入应该通过 ViewCompat.dispatchApplyWindowInsets() 传递，以确保所有子 View 都有机会接触窗口插入。

##拦截 Measurement 和 Layout

Measurement 和 Layout 是 Android 绘制机制的关键部分，这也意味着 Behavior 作为一切的拦截者，能够通过 onMeasureChild() 和 onLayoutChild() 回调先于 CoordinatorLayout 进行 measurement 和 layout 。

例如，让 Behavior 接受任意类型的 ViewGroup，并添加 maxWidth：

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

泛型 Behavior 固然好用，但你要记住，不是所有 Behavior 都应该是泛型的。

##理解 View 间依赖

上述所有功能只需要一个 View，但 Behavior 的魔力真正来源于在 View 间建立以来 - 例如，当另一个 View 发生改变，Behavior 获得回调，基于外部条件改变其功能。

Behavior 可以通过两种方式依赖于 View：当一个 View 被锚定到其他 View 上（被实现的依赖）或在 layoutDependsOn() 方法中返回 true。

使用 CoordinatorLayout 的 layout_anchor 属性就可以完成锚定。此外，再使用 layout_anchorGravity 属性，你可以有效地将两个 View 的位置绑定在一起。例如，将 FAB 锚定到 AppBarLayout 中，此时 FloatingActionButton.Behavior 会通过隐式依赖，在 AppBarLayout 滚动到屏幕可见范围之外时隐藏自身。

不管怎样，Behavior 都会在依赖的 View 被移除时获得 onDependentViewRemoved() 回调，而且只要依赖 View 发生了改变，onDependentViewChanged() 回调也会被触发。（例如改变自身大小，或者改变位置）

将 View 绑定在一起的能力就是 Design Library 实现这么多酷炫效果的秘密 - 举例来说吧，FAB 和 Snackbar 的交互，FAB 的 Behavior 依赖于添加到 CoordinatorLayout 中的 Snackbar，通过调用 onDependentViewChanged() 回调就可以将 FAB 移动到 Snackbar 的上面，避免覆盖。

> Note: 当你添加依赖，View 总会在被依赖 View 被放置后被放置，无论其布局关系如何。

##嵌套滚动

对于嵌套滚动，下面几件事你需要记住：
1. 不需要在 NestedScrollView 中声明依赖，因为 CoordinatorLayout 的每一个子元素都能够获得 NestedScrollView 中的滚动事件
2. NestedScrollView 不仅仅能应用于 CoordinatorLayout 的直接子元素，而能应用到 CoordinatorLayout 中的任意 View 上（CoordinatorLayout 的子布局的子布局的子布局的子布局……）
3. 虽说我把它叫做嵌套滚动，但实际上它能滚动和挥动

在 onStartNestedScroll() 方法中处理你感兴趣的嵌套滚动事件吧，你能在这得到滚动的坐标轴（例如水平和垂直坐标轴 - 不用在意到底在哪个方向发生了滚动），为了获得该方向上随后的滚动事件，必须返回 true。

onStartNestedScroll() 返回 true 后，嵌套滚动会按如下步骤运行：

- onNestedPreScroll() 在 ScrollView 获得滚动事件前被调用，允许 Behavior 消耗一部分或所有滚动事件（最后被消耗的滚动事件是 int[] out 参数，也就是你能得到你消耗了什么事件的参数）
- onNestedScroll() 在滚动 View 滚动时被调用 - 你可以得到 View 已经滚动了多远以及还有多少没有滚动。

此外，还有与挥动操作等价的情况（即使挥动前的回调必须消耗所有非挥动的滚动事件，或不消耗任何一个）。

当嵌套滚动（挥动）结束，获得 onStopNestedScroll() 的回调调用，该回调标记了滚动的结束 - 同时期望下一次滚动发生前得到新的 onStartNestedScroll() 调用。

例如，你想在向下滚动时隐藏 FAB，向上滚动时显示 FAB - 实现这个功能将涉及 onStartNestedScroll() 和 onNestedScroll()，就像 ScrollAwareFABBehavior 中实现的那样。

###而这只是开始

Behavior 的每一个部分都很有趣，把它们组合起来就能对界面施行魔法，让界面变得酷炫。我强烈建议大家去看看 Design Library 的源码以发现更多更高级的 Behavior - Android SDK 搜索的 Chrome 拓展一直是我最爱的 Android 开源项目源码。
