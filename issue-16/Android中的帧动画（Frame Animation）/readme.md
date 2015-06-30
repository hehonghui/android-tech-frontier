Android中的帧动画（Frame Animation）
---

> * 原文链接 : [Frame Animations in Android](https://www.bignerdranch.com/blog/frame-animations-in-android/)
* 译文出自 :  [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [jianghejie](https://github.com/jianghejie) 
* 校对 : [LangleyChang](https://github.com/LangleyChang) 


动画可以为你的app注入活力与个性。让我们来看看实现动画的一个子类：帧动画(Frame Animation)，从名字上可以看出，这种动画是一帧一帧的绘制出来的。

在谷歌的Material Design官方专题中，花了整整一页来介绍 [Delightful Details](http://www.google.com/design/spec/animation/delightful-details.html#delightful-details-delightful-details)  ，其中有帧动画的绝佳例子。

![](https://www.bignerdranch.com/img/blog/2015/05/frame_animation_example_1.gif)
![](https://www.bignerdranch.com/img/blog/2015/05/frame_animation_example_2.gif)


真是精美的动画！不幸的是，这个页面上没有丁点关于如何实现这种效果的参考链接，所以我就来帮忙了！我们将讲解一遍如何制作空心心形到实心心形的过渡动画，然后讲解与之反向的动画。效果如下：

![](https://www.bignerdranch.com/img/blog/2015/05/heart_looping.gif)

## 图片序列

帧动画的原理很简单:就像老式电影胶卷那样，快速掠过一些列的图片，“帧”其实就是一张图片，因此创建一个自定义帧动画的第一步就是建立图片序列。

我们有两种选择：使用xml的drawable（比如shape drawable）或者是使用实际的图片。简便起见，我们直接使用下面的一些列PNG图片：

![](https://www.bignerdranch.com/img/blog/2015/05/ic_heart_0.png)
![](https://www.bignerdranch.com/img/blog/2015/05/ic_heart_25.png)
![](https://www.bignerdranch.com/img/blog/2015/05/ic_heart_50.png)
![](https://www.bignerdranch.com/img/blog/2015/05/ic_heart_75.png)
![](https://www.bignerdranch.com/img/blog/2015/05/ic_heart_100.png)

在产品级的应用中，我们还需要保证图片尺寸可以适配不同的屏幕分辨率。但是现在，我们将所有的图片都扔到res/drawable-mdpi目录下完事。我推荐图片的命名采用自描述的方式，比如ic_heart_0.png, ic_heart_1.png以此类推。。。这样我们就不需要查看图片就知道图片的顺序。

但谁叫我是屌丝呢，我选择将图片按照填充的百分比程度命名。

## XML Drawable

现在我们已经有了要掠一遍的图片，下一步就是为动画定义一个XML的Drawable，我们又遇到了两种选择：Animation-list和Animated-selector。

## Animation-List

Animation-list是帧动画的默认选择，因为在API 1的时候就有了，同时它非常简单。就是简单的掠过指定顺序和持续时间的图片序列。

这里是填充到实心效果的Animation-list的例子，在res/drawable/animation_list_filling.xml中：
```xml
<?xml version="1.0" encoding="utf-8"?>
<animation-list xmlns:android="http://schemas.android.com/apk/res/android"
                android:oneshot="true">
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_0"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_25"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_50"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_75"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_100"/>
 
</animation-list>
```

列表中的每一个item都指向图片序列中的一张图片。我们只需把它们的顺序摆放正确并且添加一个毫秒为单位的持续时间即可。

下面是实现变为空心效果的Animation-list，在res/drawable/animation_list_emptying.xml中：

```xml
<?xml version="1.0" encoding="utf-8"?>
<animation-list xmlns:android="http://schemas.android.com/apk/res/android"
                android:oneshot="true">
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_100"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_75"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_50"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_25"/>
 
    <item
        android:duration="500"
        android:drawable="@drawable/ic_heart_0"/>
 
</animation-list>
```

你可能注意到了，在两个代码片段中都有android:oneshot=”true”,这是animation-list的一个属性，表示播放完一次动画之后便停止动画。如果这个属性值设置为“false”，则动画会重复播放。

在实际产品中，500毫秒时间太长，但是作为演示，我有意夸大了这个时间。还有一点，5帧图片对于产生流畅的过渡来说还是不够多。使用多少帧以及每帧的显示时间取决于个人。作为参考，我觉得15毫秒的15帧图片就可以非常流畅了。

## Animated-Selector

Animated-selector要稍微复杂一些，因为它是基于状态的。根据View的状态（比如选中与激活状态），selector将使用提供的Transition来过渡到正确的状态。Animated-selector只在Lollipop上有效，因此我们需要在-v21 package中也定义一个xml。

下面是一个Animated-selector的例子，放在res/drawable-v21/selector.xml中：

```xml
<?xml version="1.0" encoding="utf-8"?>
<animated-selector xmlns:android="http://schemas.android.com/apk/res/android">
 
    <item
        android:id="@+id/on"
        android:state_activated="true">
        <bitmap
            android:src="@drawable/ic_heart_100"/>
    </item>
 
    <item
        android:id="@+id/off">
        <bitmap
            android:src="@drawable/ic_heart_0"/>
    </item>
 
    <transition
        android:fromId="@+id/on"
        android:toId="@+id/off"
        android:drawable="@drawable/animation_emptying">
    </transition>
 
    <transition
        android:fromId="@id/off"
        android:toId="@id/on"
        android:drawable="@drawable/animation_filling">
    </transition>
 
</animated-selector>
```

仔细观察它是如何将前面定义的Animation-list引用为Transition的。

这个animated-selector没有任何问题，但是我们需要考虑非Lollipop设备。我们在res/drawable/selector.xml中定义一个没有动画的selector：

```xml
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
 
    <item
        android:state_activated="true">
        <bitmap android:src="@drawable/ic_heart_100"/>
    </item>
 
    <item
        android:state_activated="false">
        <bitmap android:src="@drawable/ic_heart_0"/>
    </item>
 
</selector>
```

现在我们的selector在任意设备上都可以工作。因为我们只使用了一般的selector，如果在Lollipop以前的设备上，animated-selector将直接跳过过渡动画，直接到结束状态。当然Lollipop设备是有我们在animated-selector中定义的过渡效果的。

在上面的代码片段中，animated-selector只关注了android:state_activated属性。就如一般的selector一样，我为不同的状态定义了不同的item，但不同的是，我们还定义了不同状态间动画过渡的transition。在这个例子中，我直接将transition指向前面定义好了的animation-list。

现在我们有了四个xml文件：一个充到实心效果的xml，实心到空心的xml，两个在空心实心之间切换的xml。

## 设置ImageView

现在可以设置一些图片来玩了。我们这里有三个ImageView，分别对应前面定义的三个XML Drawable。将下面的代码放到你的Activity的布局中：

```xml
<ImageView
    android:id="@+id/imageview_animation_list_filling"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:background="@drawable/animation_list_filling"
    />
 
<ImageView
    android:id="@+id/imageview_animation_list_emptying"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:background="@drawable/animation_list_emptying"
    />
 
 <ImageView
    android:id="@+id/imageview_animated_selector"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:background="@drawable/selector"
    />
```

这只是几个id唯一，背景为我们定义的xml Drawable的ImageView。

## 开始动画

开始动画的方式在两种实现方法中是不一样的，我们先从animation-list开始：

## Animation-List

在Activity中，我们得到ImageView的引用，然后开始动画。如下：

```java
ImageView mImageViewFilling = (ImageView) findViewById(R.id.imageview_animation_list_filling);
((AnimationDrawable) mImageViewFilling.getBackground()).start();
```


下面是效果：

![](https://www.bignerdranch.com/img/blog/2015/05/heart_filling.gif)

接下来是它的搭档-反向过程（除了id都是一样的）

```java
ImageView mImageViewEmptying = (ImageView) findViewById(R.id.imageview_animation_list_emptying);
((AnimationDrawable) mImageViewEmptying.getBackground()).start();
```

效果如下：

![](https://www.bignerdranch.com/img/blog/2015/05/heart_emptying.gif)


这些代码可以放在onCreate（在Activity开始的时候自动开始）或者一个OnClickListener（等待用户触发）中，取决于你自己！


## Animated-Selector

当使用Animated-selector的时候，动画将在状态条件满足selector的时候被触发。在我们这个简单的例子中，我们在Activity的onCreate方法中为ImageView添加一个click listener：

```java
mImageViewSelector.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        mImageViewSelector.setActivated(!mImageViewSelector.isActivated());
    }
});
```

当用户点击心形，它将会根据当前的状态在实心与空心之间切换，下面是我的心形循环显示的gif图：


![](https://www.bignerdranch.com/img/blog/2015/05/heart_looping.gif)

## Delightful Details

Frame Animations have the power to surprise and delight users, plus it’s fun to add little personal touches to an app. Go forth and animate!
帧动画可以取悦你的用户，为app增添个性，搞起！

