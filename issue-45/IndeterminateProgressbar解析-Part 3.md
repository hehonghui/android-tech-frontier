IndeterminateProgressbar解析-Part 3
---

> * 原文链接 : [Indeterminate – Part 3](https://blog.stylingandroid.com/indeterminate-part-3/)
* 原文作者 : [Mark Allison](blog.stylingandroid.com)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 



不吹不黑，当用户进行一项不定时长的耗时任务时，IndeterminateProgressBar 提供的视觉体验绝对是一流的。为此，前段时间我发了一篇博文讲解水平 IndeterminateProgressBar 的实现，而最近，我又写下这系列博文剖析圆形 IndeterminateProgressBar 的实现原理，这篇博文最终会创建能适配低版本设备的 IndeterminateProgressBar（支持 API 11+）。

在前面的博文中我们已经学习了 IndeterminateProgressBar 在 Android Lollipop 以上的设备中的实现，所以今天我们就要尝试创建我们自己的 IndeterminateProgressBar - 即支持低版本设备的 IndeterminateProgressBar。

首先了解负责绘制圆形部分的 Drawable 组件吧（具体实现类似于 AOSP 实现版本中使用的 VectorDrawable），由于 VectorDrawable 只支持 Android Lollipop 以上的设备，因此我们现在也不能通过 VectorDrawableCompat 使用它，但我们可以通过最传统的办法：组合使用 Canvas 和 Paint 去绘制我们需要的效果：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    private static final int STROKE_WIDTH = 6;
    private static final int PADDING = 3;

    private final Paint paint;
    private final RectF bounds;
    private final float padding;
    private float startAngle;
    private float endAngle;
    private float rotation;
    private Animator animator;

    public static IndeterminateDrawable newInstance(Context context) {
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        float strokeWidthPx = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, STROKE_WIDTH, displayMetrics);
        float paddingPx = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, PADDING, displayMetrics);
        Paint paint = createPaint(fetchAccentColour(context), strokeWidthPx);
        RectF bounds = new RectF();
        float padding = strokeWidthPx / 2 + paddingPx;
        IndeterminateDrawable drawable = new IndeterminateDrawable(paint, bounds, padding);
        drawable.createAnimator();
        return drawable;
    }

    @ColorInt
    private static int fetchControlColour(Context context) {
        TypedArray typedArray = context.obtainStyledAttributes(0, new int[]{R.attr.colorControlActivated});
        try {
            return typedArray.getColor(0, 0);
        } finally {
            typedArray.recycle();
        }
    }

    static Paint createPaint(@ColorInt int colour, float strokeWidth) {
        Paint paint = new Paint();
        paint.setColor(colour);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(strokeWidth);
        paint.setAntiAlias(true);
        paint.setStrokeCap(Paint.Cap.SQUARE);
        return paint;
    }

    IndeterminateDrawable(Paint paint, RectF bounds, float padding) {
        this.paint = paint;
        this.bounds = bounds;
        this.padding = padding;
    }

    private void createAnimator() {
        startAngle = 0;
        endAngle = 270;
        animator = new AnimatorSet();
    }
    .
    .
    .
}
```

首先我们需要判断 笔画宽度(stroke width) 和间距的 pixel 像素值是否和我们使用的 Material Drawable 匹配，在这里一定要在运行时通过 DisplayMetrics 去将 dip 转换为 px 以确保在不同设备中控件的现实效果保持一致性。

然后我们需要创建 Paint 对象，为它设置颜色和笔画宽度，以绘制控件的圆形。当然，我们可以从 theme 中获得正确的颜色。（在 Design support library 里一般都会在 theme 中声明颜色值）

记得给 Paint 设置抗锯齿，要不然边缘上会有奇奇怪怪的东西出现……此外，我们还需要在路径上设置方形覆盖块，以模仿 Material VectorDrawable 给 pathData 设置的效果。

我们还创建了 RectF 对象，它将和 Paint 对象在 onDraw() 方法中被使用，提前创建它们是为了避免在 onDraw() 方法中重复创建它们，而且能在 onDraw() 方法中复用它们，以保持 onDraw() 方法的简洁，不需要处理不必要的事务，从而避免动画掉帧。

然后我们在调用 createAnimator() 构建动画前创建了 IndeterminateDrawable，IndeterminateDrawable 的实现其实挺傻的，因为都是些固定值的设置。

因为我们创建了 Drawable 对象的子类，因此我们需要重写一些抽象方法：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    .
    .
    .
    @Override
    public void setAlpha(int alpha) {
        paint.setAlpha(alpha);
    }

    @Override
    public void setColorFilter(ColorFilter colorFilter) {
        paint.setColorFilter(colorFilter);
    }

    @Override
    public int getOpacity() {
        return paint.getAlpha();
    }
    .
    .
    .
}
```

我们将这些值设置给 Paint 就行了。

由于我们还实现了 Animatable 接口，因此我们需要重写接口的方法以控制动画的状态：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    .
    .
    .
    @Override
    public void start() {
        animator.start();
    }

    @Override
    public void stop() {
        animator.end();
    }

    @Override
    public boolean isRunning() {
        return animator.isRunning();
    }
    .
    .
    .
}
```

具体的操作我们委托给 Animator 完成。

接下来就是 Animator 在展示动画时动态修改 Drawable 参数的一些 set 方法：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    .
    .
    .
    public void setStartAngle(float startAngle) {
        this.startAngle = startAngle;
        invalidateSelf();
    }

    public void setEndAngle(float endAngle) {
        this.endAngle = endAngle;
        invalidateSelf();
    }

    public void setRotation(float rotation) {
        this.rotation = rotation;
        invalidateSelf();
    }
    .
    .
    .
}
```

如果你有看过前面的博文，下面的代码应该挺好理解的 - 我们通过 Animator 动态修改长度变化的起点和终点，并且旋转该圆弧。

onDraw() 的实现：

```java
public class IndeterminateDrawable extends Drawable implements Animatable {
    .
    .
    .
    @Override
    public void draw(Canvas canvas) {
        bounds.set(padding, padding, canvas.getWidth() - padding, canvas.getHeight() - padding);
        canvas.drawArc(bounds, rotation + startAngle, endAngle - startAngle, false, paint);
    }
}
```

就两行代码，简单吧！首先我们填充之前创建的 RectF 对象，该对象的尺寸由 canvas 的尺寸（考虑了间距）决定。然后在该矩形区域中绘制了圆弧，然后根据给定的值设置该圆弧的起始、终止位置。最终通过前面创建的 Paint 将它绘制。

其实在 Activity 中使用它非常简单，代码如下：

```java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ImageView imageView = (ImageView) findViewById(R.id.image);
        IndeterminateDrawable drawable = IndeterminateDrawable.newInstance(this);
        imageView.setImageDrawable(drawable);
        drawable.start();
    }
}
```

运行后我们就能看到如下效果，由于目前还没有添加 Animator，所以只是一个静态的图像：

![](https://i2.wp.com/blog.stylingandroid.com/wp-content/uploads/2016/01/static_IndeterminateDrawable.png?resize=300%2C225&ssl=1)

有一点细节我需要在这里告诉大家，Android 用于绘制图形的 Skia 库在绘制圆弧时有一些问题，有兴趣的话可以去读[ Eugenio Marletti 的这篇博文](https://medium.com/@workingkills/the-mysterious-case-of-who-killed-arcs-on-android-9155f49166b8#.2uznv5mun)，这篇博文真心推荐各位认真看一看。但由于我们只需要绘制一条圆弧，所以不太需要考虑那些问题。

在下一篇博文中我会介绍怎么结合 Animator 让它动起来！

[源码点我](https://github.com/StylingAndroid/Indeterminate/tree/Part3)