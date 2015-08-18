#Android LayerDrawable 和 Drawable.Callback

@(Android文章翻译)[UI]

> * 原文链接 : [Android LayerDrawable and Drawable.Callback](http://www.roman10.net/android-layerdrawable-and-drawable-callback/)
> * 原文作者 : [Liu Feipeng](www.roman10.net)
> * 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
> * 译者 : [Desmond1121](https://github.com/desmond1121)  
> * 校对者：

LayerDrawable is a Drawable that manages an array of Drawables, where each Drawable is a layer of it. It can be used to compose fancy visual effects. However, used incorrectly, it can also introduce difficult to catch bugs. This post discusses a bug that can be caused by the Callback mechanism of Drawable.

`LayerDrawable`是一个特殊的`Drawable`，它内部保持着一个`Drawable`数组，其中每一个`Drawable`都是视图中的一层。如果你不了解`LayerDrawable`的机制，当程序出了问题后是很难去找到bug在哪里的。我发这些文章就是为了分享在使用`LayerDrawable`与`Drawable.Callback`时可能出现的一个bug。

##Callback调用链

In LayerDrawable, every layer/drawable registers the LayerDrawable as its Drawable.callback. This allows the layer to inform the LayerDrawable when it needs to redraw. As shown in the invalidateSelf method from Drawable.java, the DrawableCallback.invalidateDrawable is called to inform the client (the LayerDrawable, in this case) the drawable needs to redraw.

在`LayerDrawable`中，每层视图（`Drawable`）都会将`LayerDrawable`注册为它的`Drawable.Callback`。这允许`Drawable`能够在需要重绘自己的时候告知`LayerDrawable`重绘它。我们可以在下面这个`Callback.invalidateSelf()`函数中看到是由注册callback端（在此处为`LayerDrawable`）来执行`invalidateDrawable(Drawable drawable)`的。

```java
public void invalidateSelf() {
    /* 获取注册的Callback实例，如果无则返回null。 */
    final Callback callback = getCallback();
    if (callback != null) {
        callback.invalidateDrawable(this);
    }
}
```

Also, a View registers itself as Drawable.callback, so when the drawable needs to redraw, the View can be informed and invalidated. So if we set background of a View to be LayeredDrawable, we have a chain of DrawableCallbacks. This is illustrated in the figure below.

When the Drawable needs to redraw, it calls its callback.invalidateDrawable, which in turns calls LayerDrawable’s callback.invalidateDrawable, which causes the View to redraw the corresponding region if necessary.

我们知道`View`是实现了`Drawable.Callback`接口的，所以当图片需要重绘的时候就能够告知`View`。如果我们把`View`的背景图片设置成了`LayerDrawable`，在`Drawable`需要更新的时候callback的调用将有一个传递的过程，首先会调用注册的`LayerDrawable`的`invalidateDrawable(Drawable drawable)`方法，`LayerDrawable`又会调用`View`的`invalidateDrawable(Drawable drawable)`方法。如下图所示：

![Alt text](http://img.blog.csdn.net/20150818142917049)

##View改变背景时移除原背景Callback

So far all work well, but the setBackgroundDrawable of View.java has the following code snippet.

在`View`的`setBackgroundDrawable(Drawable background)`中有这么一段代码：

```java
    if (mBackground != null) {
        mBackground.setCallback(null);
        unscheduleDrawable(mBackground);
    }

    …
    if (background != null) {
        background.setCallback(this);
    }
```

This means setting a new background will break the old background drawable’s callback by setting it to null, regardless whether the callback is still set to the View.

我们可以看出：当`View`改变背景时将会**无条件将原背景（如果原背景是Drawable的话）的`Drawable.Callback`设置为`null`。**

##什么情况下会出现Bug？

With all the knowledge above, we can “fabricate” a bug by follow the steps below.

介绍完上面的知识后我们可以通过以下步骤产生一个bug：

1. Set a Drawable A as a background of a View V. The A.callback is set to V.
2. Create a LayerDrawable L with A as one layer. Now A.callback is set to L.
3. Now set another Drawable (or just null) as background of V. V will set callback of its old background (A in our example) to null, which breaks the link between A and L.
4. Updates A won’t trigger L to update.

> 1. 把`Drawable`**A **设置成`View`**V**的背景。**现在A的callback指向V**。
2. 将A设置成`LayerDrawable` **L**中的一层。**现在A的callback指向L**。
3. 现在为**V**设置另一个背景，**V会把原背景(A)的callback强制设置成null，破坏了A与L之间的联系。**
4. **BUG出现了**：更新`Drawable`**A**不会让**L**更新了。

The solution to this issue is to update the background of V before creating L. This is illustrated in the code example here.

解决方法就是在更新**V**的背景之后再创造`LayerDrawable`**L**。Bug发生与解决的例子可以在[这里](https://github.com/roman10/blog-android-source-code/tree/master/LayerDrawableCallback)下载。

In the example, we tried animating the actionbar background. The background consists of two layers, the first one is a green ColorDrawable, and second a bitmap drawable. We want to animate the alpha value of the bitmap drawable, so it appears the image is faded in.

The code contains two methods, one works and the other doesn’t due to the bug we described. Each method can be triggered by a button. Below we extract the key part of the code, one can refer to the link for more details.

为了方便看官，我也贴了一部分关键代码到这边来，你可以通过注释理解这段代码。

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Button btn1 = (Button) findViewById(R.id.button1);
        btn1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 1. 将 launcherIconDrawable.callback 赋值给 actionBar
                actionBar.setBackgroundDrawable(launcherIconDrawable);
                animateActionBarWorking();
            }
        });
        Button btn2 = (Button) findViewById(R.id.button2);
        btn2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 1. 将 launcherIconDrawable.callback 赋值给 actionBar
                actionBar.setBackgroundDrawable(launcherIconDrawable);
                animateActionBarNotWorking();
            }
        });
        actionBar = getSupportActionBar();
        launcherIconDrawable = getResources().getDrawable(R.drawable.launcher_repeat);
        colorLayer = new ColorDrawable(Color.rgb(0, 255, 0));
        actionBar.setBackgroundDrawable(colorLayer);
    }
    
    /* 这个函数运行后ActionBar不会得到更新。 */
    private void animateActionBarNotWorking() {
        Drawable[] layers = new Drawable[] { colorLayer, launcherIconDrawable };
        LayerDrawable layerDrawable = new LayerDrawable(layers);
        actionBar.setBackgroundDrawable(layerDrawable);
        ValueAnimator valueAnimator = ValueAnimator.ofInt(0, 255);
        valueAnimator.setDuration(1000);
        valueAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                // 4. Updates launcherIconDrawable will not trigger action bar background to update
                // as launcherIconDrawable.callback is null
                launcherIconDrawable.setAlpha((Integer) animation.getAnimatedValue());
            }
        });
        valueAnimator.start();
    }
    
    /* 由于先移除了launcherIconDrawable与ActionBar的联系，这个函数运行后会让ActionBar得到更新。
    private void animateActionBarWorking() {
        actionBar.setBackgroundDrawable(null);
        animateActionBarNotWorking();
    }
  
参考文章：

[LayerDrawable - Android Developers](http://developer.android.com/reference/android/graphics/drawable/LayerDrawable.html)