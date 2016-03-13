IndeterminateProgressbar解析-Part 4
---

> * 原文链接 : [Indeterminate – Part 4](https://blog.stylingandroid.com/indeterminate-part-4/)
* 原文作者 : [Mark Allison](blog.stylingandroid.com)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 



IndeterminateProgressBar 能在用户进行某项不定时长的耗时操作时提供绝佳的用户体验，之前我有教过大家怎么创建[水平的 IndeterminateProgressBar](http://blog.csdn.net/u012403246/article/details/49582789)，今天我就来教大家实现圆形的 IndeterminateProgressBar，这个控件将支持 API 11（Honeycomb）以上的设备。

在上一篇博文中，我们创建了一个自定义 Drawable - 它能绘制一段圆弧，并且能设置圆弧的起点和终点，以及完成圆弧的旋转。接下来我们要为该 Drawable 添加 ObjectAnimator，使得这些值能够随时间改变，以完成我们期望的动画。

在看代码之前，我需要指出的是：我并不喜欢创建一个工具类，然后在里面放一大堆静态方法 - 因为它们不代表具体的对象，那么在面向对象编程中也就不能拥有清晰的职责。但在这里我还是创建了一个工具类，将 Animator 的构建过程从 Drawable 中剥离，使代码更可读。

```java
final class IndeterminateAnimatorFactory {
    private static final String START_ANGLE = "startAngle";
    private static final String END_ANGLE = "endAngle";
    private static final String ROTATION = "rotation";

    private static final int SWEEP_DURATION = 1333;
    private static final int ROTATION_DURATION = 6665;
    private static final float END_ANGLE_MAX = 360;
    private static final float START_ANGLE_MAX = END_ANGLE_MAX - 1;
    private static final int ROTATION_END_ANGLE = 719;

    private IndeterminateAnimatorFactory() {
        // NO-OP
    }

    public static Animator createIndeterminateDrawableAnimator(IndeterminateDrawable drawable) {
        AnimatorSet animatorSet = new AnimatorSet();
        Animator startAngleAnimator = createStartAngleAnimator(drawable);
        Animator sweepAngleAnimator = createSweepAngleAnimator(drawable);
        Animator rotationAnimator = createAnimationAnimator(drawable);
        animatorSet.playTogether(startAngleAnimator, sweepAngleAnimator, rotationAnimator);
        return animatorSet;
    }
    .
    .
    .
}
```
类的实现非常简单，就是创建三个 Animator，并把它们添加到 AnimatorSet 中，然后同时播放。

```java
final class IndeterminateAnimatorFactory {
    .
    .
    .
    private static Animator createStartAngleAnimator(IndeterminateDrawable drawable) {
        ObjectAnimator animator = ObjectAnimator.ofFloat(drawable, START_ANGLE, 0f, START_ANGLE_MAX);
        animator.setDuration(SWEEP_DURATION);
        animator.setRepeatCount(ValueAnimator.INFINITE);
        animator.setRepeatMode(ValueAnimator.RESTART);
        animator.setInterpolator(createStartInterpolator());
        return animator;
    }

    private static Interpolator createStartInterpolator() {
        return new LinearInterpolator();
    }

    private static Animator createSweepAngleAnimator(IndeterminateDrawable drawable) {
        ObjectAnimator animator = ObjectAnimator.ofFloat(drawable, END_ANGLE, 0f, END_ANGLE_MAX);
        animator.setDuration(SWEEP_DURATION);
        animator.setRepeatCount(ValueAnimator.INFINITE);
        animator.setRepeatMode(ValueAnimator.RESTART);
        animator.setInterpolator(createEndInterpolator());
        return animator;
    }

    private static Interpolator createEndInterpolator() {
        return new LinearInterpolator();
    }
    .
    .
    .
}
```

这两个 Animator 会控制圆弧的起点和终点，SWEEP_DURATION 是从 AOSP 实现的代码中直接拷过来的。创建插值器的方法会在后面实现一些有趣的效果。

然后是展示旋转动画的 Animator：

```java
final class IndeterminateAnimatorFactory {
    .
    .
    .
    private static Animator createAnimationAnimator(IndeterminateDrawable drawable) {
        ObjectAnimator rotateAnimator = ObjectAnimator.ofFloat(drawable, ROTATION, 0, ROTATION_END_ANGLE);
        rotateAnimator.setDuration(ROTATION_DURATION);
        rotateAnimator.setRepeatMode(ValueAnimator.RESTART);
        rotateAnimator.setRepeatCount(ValueAnimator.INFINITE);
        rotateAnimator.setInterpolator(new LinearInterpolator());
        return rotateAnimator;
    }
    .
    .
    .
}
```

ROTATION_DURATION 也是从 AOSP 实现中拷贝的，在这里我们使用了线性插值器，因为我们需要规则的旋转。

现在需要更新 IndeterminateDrawable 中的 createAnimator() 方法，用上这些 Animator：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    .
    .
    .
    private void createAnimator() {
        animator = IndeterminateAnimatorFactory.createIndeterminateDrawableAnimator(this);
    }
    .
    .
    .
}
```

运行的话就会看到一条旋转的线：

[video](https://youtu.be/CEBTrOvsx-w)

因为起点和终点使用相同的线性插值器，所以他们移动的步调一致。又由于方形覆盖块的起点和终点使用相同的值，所以终点会稍微绘制地比圆弧的长度要早一些。

这一点可以通过使用不同的插值器优化：

```java
final class IndeterminateAnimatorFactory {
    .
    .
    .
    private static Interpolator createStartInterpolator() {
        return new DecelerateInterpolator();
    }
    .
    .
    .
    private static Interpolator createEndInterpolator() {
        return new AccelerateInterpolator();
    }
    .
    .
    .
}
```
现在起点会很快达到终点的位置，然后慢慢恢复，而终点则会慢慢开始，然后逐渐加速，直到到达终点，具体效果看视频：

[video](https://youtu.be/GrobL-lzj4E)

看起来很像了，但我们还能优化！

如果我们把旋转动画去掉的话，能更好地感受刚刚的代码实现的效果，以及了解旋转动画的效果：

[video](https://youtu.be/wP9T6gl9MMQ)

在这系列的最后一篇博文中我会使用更多的插值器，让大家了解插值器的魔力。

[源码可以在这里下载](https://github.com/StylingAndroid/Indeterminate/tree/Part4)。