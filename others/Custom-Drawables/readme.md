自定义Drawables
---

>
* 原文链接 : [Custom Drawables](http://www.ryanharter.com/blog/2015/04/03/custom-drawables/)
* 译者 : [SwinZh](https://github.com/SwinZh) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  申请校对

We’ve all seen posts about why you should use custom views when applicable and how it can help you properly encapsulate your application code. What we don’t see quite as much is how this type of thinking can be translated to other, non-View related, portions of our apps.
我们都看过关于为什么你应该适当的使自定义Views和如何能帮助你正确的封装你的应用程序代码的帖子。但非视图相关的部分如何转化为我们apps的其他部分的这种思考方式，我们对此并不非常了解。

In my app, Fragment, there are a few places where I make use of custom Drawables to encapsulate my logic just like you would for a custom View.
在我的应用Fragment中,有些地方我使用自定义Drawables来封装我的逻辑，就像你在customView中做的一样。

The Use Case
##使用案例##
In Fragment, there are a couple of places where we use horizontal scrollers as a selection view. This means that the center icon is the “selected” icon, and items should transition in and out of this state fluidly. For this we decided that a nice reveal transition would be great.
在Fragment中,有一些使用水平滚动条作为一个选择视图的地方。这意味着该中心图标就是“选中”的图标,整个条目就该平滑的平移进去或平移出。为此，我们决定揭示一个很好的平移。
![](http://www.ryanharter.com/images/posts/custom-drawables/example.gif)
While this wasn’t entirely necessary, I felt that it was a effect that made the motion feel very fluid and added a touch of class to the app. I could have set up multiple image views and make parts of them individual, but this was the perfect place for a custom drawables.
虽然这并非完全必要，但我觉得它是一个能让这个滑动更加流畅的效果，并增加一个触摸的类在app上。我可以设置多个imageviews并让他们每个独立出来，但这真是使用自定义drawables的好地方~

Customizing Drawables
##自定义Drawables##

Drawables in Android are actually very similar to Views. They have similar methods for things like padding and bounds (layout), and have a draw method that can be overridden. In my case, I needed to be able to transition between two drawables, a selected drawable and an unselected drawable, based on a value.
在Android里，Drawables和Views实际上非常的相似。他们有相似的方法,例如padding和bounds(layout),并且都有一个可以被重写的draw方法。就我而言，我需要能够在两个图片，一个选中的和一个未选中的图片之间进行转换基础上的一个值。

In our case, we simply create a subclass of Drawable that contains other Drawables (and an orientation).
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
Next we need to be able to set the value identifying where the drawable is in the selection process. Fortunately Drawable has a facility for this type of thing built in, [setLevel(int)].
接下来，我们需要设定能够与图片选择过程中相关联的值。幸运的是Drawable内置了这种类型的事件，setLevel(int).

A Drawable’s level is an integer between 0 and 10,000 which simply allows the Drawable to customize it’s view based on a value. In our case, we can simply define 5,000 as the selected state, 0 and entirely unselected to the left, and 10,000 as entirely unselected to the right.
一个Drawable的level是介于0和10000的整数，它只是允许Drawable基于一个值去自定义它的view.在我们的例子中，我们可以简单地定义5000作为选择的状态，0和全部未选择的在左侧，10000全部未选择在右边。
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
With that, we can simply set the level of the icon based on scroll position and away we go
就这样，我们可以简单地设置icon的level基于滑动的位置。
```java
float offset = getOffestForPosition(recyclerView, position);
if (Math.abs(offset) <= 1f) {
  holder.image.setImageLevel((int) (offset * 5000) + 5000);
} else {
  holder.image.setImageLevel(0);
}
```
If you’d like to see the source for this custom drawable, you can find the Gist on Github
想要看自定义Drawable源码，请在Github上搜索Gist[here](https://gist.github.com/rharter/34051da57f8a6a0991ff)

