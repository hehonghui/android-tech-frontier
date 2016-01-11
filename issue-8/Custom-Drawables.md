自定义Drawables
---

>
* 原文链接 : [Custom Drawables](http://www.ryanharter.com/blog/2015/04/03/custom-drawables/)
* 原文作者 : [Ryan Harter](http://www.ryanharter.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [SwinZh](https://github.com/SwinZh) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成


我们都看过关于为什么你应该适当的使[自定义Views](http://www.ryanharter.com/blog/2014/05/14/using-custom-compound-views-in-android/)和如何能帮助你正确的封装你的应用程序代码的帖子。但非视图相关的部分如何转化为我们apps的其他部分的这种思考方式，我们对此并不非常了解。

在我的应用[Fragment](https://play.google.com/store/apps/details?id=com.pixite.fragment&referrer=utm_source%3Dryanharter.com%26utm_medium%3Dpost%26utm_content%3Dcustom_drawables)中,有些地方我使用自定义Drawables来封装我的逻辑，就像你在customView中做的一样。

##用例##

在Fragment中,有一些使用水平滚动条作为一个选择视图的地方。这意味着该中心图标就是“选中”的图标,整个条目就该平滑的平移进去或平移出。为此，一个好的显示转换将非常棒。

![](http://www.ryanharter.com/images/posts/custom-drawables/example.gif)

虽然这并非完全必要，但我觉得它是一个能让这个滑动更加流畅并增加一个触摸的类在app上的效果。我本可以设置多个imageviews并让他们每个独立出来，但这真是使用自定义drawables的好地方~

##自定义Drawables##

在Android里，Drawables和Views实际上非常的相似。他们有相似的方法,例如padding和bounds(layout),并且都有一个可以被重写的draw方法。就我而言，我需要能够在一个选中的图片和一个未选中的图片之间进行转换基础上的一个值。

在我们的例子中，我们简单地创建一个包含其他Drawables(和方向)的Drawable子类.



```java
public class RevealDrawable extends Drawable {
  public RevealDrawable(Drawable unselected, Drawable selected, int orientation) {
    this(null, null);

    mUnselectedDrawable = unselected;
    mSelectedDrawable = selected;
    mOrientation = orientation;
  }
}
```

接下来，我们需要设定能够与图片选择过程中相关联的值。幸运的是Drawable内置了这种类型的事件，setLevel(int).

一个Drawable的level是介于0和10000的整数，它只是允许Drawable基于一个值去自定义它的view.在我们的例子中，我们可以定义5000作为图片被选择时的状态值，其他没被选中状态值在5000左右两侧。
All we need to do now is to override the draw(Canvas canvas) method to draw the appropriate drawable by clipping the canvas based on the current level.
现在我们要做的就是重写draw(Canvas canvas)方法，通过基于当前的level裁剪画布去绘制相应的图片。

```java
@Override
public void draw(Canvas canvas) {

  // If level == 10000 || level == 0, just draw the unselected image
  int level = getLevel();
  if (level == 10000 || level == 0) {
    mRevealState.mUnselectedDrawable.draw(canvas);
  }

  // If level == 5000 just draw the selected image
  else if (level == 5000) {
    mRevealState.mSelectedDrawable.draw(canvas);
  }

  // Else, draw the transitional version
  else {
    final Rect r = mTmpRect;
    final Rect bounds = getBounds();

    { // Draw the unselected portion
      float value = (level / 5000f) - 1f;
      int w = bounds.width();
      if ((mRevealState.mOrientation & HORIZONTAL) != 0) {
        w = (int) (w * Math.abs(value));
      }
      int h = bounds.height();
      if ((mRevealState.mOrientation & VERTICAL) != 0) {
        h = (int) (h * Math.abs(value));
      }
      int gravity = value < 0 ? Gravity.LEFT : Gravity.RIGHT;
      Gravity.apply(gravity, w, h, bounds, r);

      if (w > 0 && h > 0) {
        canvas.save();
        canvas.clipRect(r);
        mRevealState.mUnselectedDrawable.draw(canvas);
        canvas.restore();
      }
    }

    { // Draw the selected portion
      float value = (level / 5000f) - 1f;
      int w = bounds.width();
      if ((mRevealState.mOrientation & HORIZONTAL) != 0) {
        w -= (int) (w * Math.abs(value));
      }
      int h = bounds.height();
      if ((mRevealState.mOrientation & VERTICAL) != 0) {
        h -= (int) (h * Math.abs(value));
      }
      int gravity = value < 0 ? Gravity.RIGHT : Gravity.LEFT;
      Gravity.apply(gravity, w, h, bounds, r);

      if (w > 0 && h > 0) {
        canvas.save();
        canvas.clipRect(r);
        mRevealState.mSelectedDrawable.draw(canvas);
        canvas.restore();
      }
    }
  }
}
```

就这样，我们可基于滑动的位置以简单地设置icon的level,结束了~

```java
float offset = getOffestForPosition(recyclerView, position);
if (Math.abs(offset) <= 1f) {
  holder.image.setImageLevel((int) (offset * 5000) + 5000);
} else {
  holder.image.setImageLevel(0);
}
```

想要看自定义Drawable源码，请在Github上搜索Gist[here](https://gist.github.com/rharter/34051da57f8a6a0991ff)

