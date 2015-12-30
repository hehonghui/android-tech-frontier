VectorDrawable-第二章
---

>
* 原文链接:[VectorDrawables – Part 2](https://blog.stylingandroid.com/vectordrawables-part-2/)
* 译者 :  [jianghejie](https://github.com/jianghejie) 
* 译者博文链接 :  [jcodecraeer.com](http://jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0301/2514.html)
 
[上篇文章](http://jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0201/2396.html)    中，我们探讨了如何将svg图片转换成VectorDrawable，以在适应不同分辨率的同时减少资源文件的个数，同时也更易于维护。但是这并不是VectorDrawable的唯一好处-还可以用来制作动画。这篇文章就是关于如何用VectorDrawable来实现android机器人耸肩的效果！

我们将要实现的动画很简单，在保持身体不动的同时，让头部和手臂在Y方向上上下移动。表面上看实现起来很复杂，因为我们这里只有一个Drawable（要是一般的Drawable估计的通过绘制来实现了）。但是有一个控件却可以使事情变得非常简单，那就是在Lollipop中和VectorDrawable一起被引入的AnimatedVectorDrawable。在上篇文章中，我们讲到了path元素的name属性是为了描述path的用处，但它还可以用在为指定path指定一个动画。本例中我们需要动画的path元素是头部，左眼，右眼，左臂，右臂。问题是单个的<path>是没有translateX和translateY属性的，因此无法使用属性动画来控制<path>translateY，而<group>元素是有的，所以我们需要先将相关的<path>元素包裹在一个个的<group>元素中：
```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:viewportWidth="500"
    android:viewportHeight="500"
    android:width="500px"
    android:height="500px">
    <group android:name="android">
        <group android:name="head_eyes">
            <path
                android:name="head"
                android:fillColor="#9FBF3B"
                android:pathData="M301.314,83.298l20.159-29.272c1.197-1.74,0.899-4.024-0.666-5.104c-1.563-1.074-3.805-0.543-4.993,1.199L294.863,80.53c-13.807-5.439-29.139-8.47-45.299-8.47c-16.16,0-31.496,3.028-45.302,8.47l-20.948-30.41c-1.201-1.74-3.439-2.273-5.003-1.199c-1.564,1.077-1.861,3.362-0.664,5.104l20.166,29.272c-32.063,14.916-54.548,43.26-57.413,76.34h218.316C355.861,126.557,333.375,98.214,301.314,83.298" />
            <path
                android:name="left_eye"
                android:fillColor="#FFFFFF"
                android:pathData="M203.956,129.438c-6.673,0-12.08-5.407-12.08-12.079c0-6.671,5.404-12.08,12.08-12.08c6.668,0,12.073,5.407,12.073,12.08C216.03,124.03,210.624,129.438,203.956,129.438" />
            <path
                android:name="right_eye"
                android:fillColor="#FFFFFF"
                android:pathData="M295.161,129.438c-6.668,0-12.074-5.407-12.074-12.079c0-6.673,5.406-12.08,12.074-12.08c6.675,0,12.079,5.409,12.079,12.08C307.24,124.03,301.834,129.438,295.161,129.438" />
        </group>
        <group android:name="arms">
            <path
                android:name="left_arm"
                android:fillColor="#9FBF3B"
                android:pathData="M126.383,297.598c0,13.45-10.904,24.354-24.355,24.354l0,0c-13.45,0-24.354-10.904-24.354-24.354V199.09c0-13.45,10.904-24.354,24.354-24.354l0,0c13.451,0,24.355,10.904,24.355,24.354V297.598z" />
            <path
                android:name="right_arm"
                android:fillColor="#9FBF3B"
                android:pathData="M372.734,297.598c0,13.45,10.903,24.354,24.354,24.354l0,0c13.45,0,24.354-10.904,24.354-24.354V199.09c0-13.45-10.904-24.354-24.354-24.354l0,0c-13.451,0-24.354,10.904-24.354,24.354V297.598z" />
        </group>
        <path
            android:name="body"
            android:fillColor="#9FBF3B"
            android:pathData="M140.396,175.489v177.915c0,10.566,8.566,19.133,19.135,19.133h22.633v54.744c0,13.451,10.903,24.354,24.354,24.354c13.451,0,24.355-10.903,24.355-24.354v-54.744h37.371v54.744c0,13.451,10.902,24.354,24.354,24.354s24.354-10.903,24.354-24.354v-54.744h22.633c10.569,0,19.137-8.562,19.137-19.133V175.489H140.396z" />
    </group>
</vector> 
```
现在再我们定义一个包含<animated-vector>的drawable文件，这个文件的作用是将动画应用在指定的group中，使得某些部分的path动起来：
```xml
<?xml version="1.0" encoding="utf-8"?>
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@drawable/android">
 
    <target
        android:animation="@animator/shrug"
        android:name="head_eyes" />
 
    <target
        android:animation="@animator/shrug"
        android:name="arms" />
</animated-vector>
```

虽然我知道完全可以将头、眼、和手臂放在一个group中，但是为了演示一个<animated-vector>是如何控制多个group的动画的，我有意把他们分成两部分，实际运用中，不同的group目标动画肯定是不一样的。

<animated-vector>的最外层元素指定了我们要动画的VectorDrawable资源-在本例中这个资源是android.xml，里面的<target>元素根据group的name属性指定group的动画效果。

<vector>, <group>, <clip-path>, 和<path> 元素都有各自可以播放动画的属性，查阅VectorDrawable JavaDocs你会找到每种元素到底有那些属性，以便针对这些属性播放特定的动画。比如：要使用tint效果需要作用于<vector>元素上，而修改填充颜色则需要作用于<path>元素。

耸肩的效果很简单，只是个重复移动Y轴的animator：
```xml
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <objectAnimator
        android:propertyName="translateY"
        android:valueType="floatType"
        android:valueFrom="0"
        android:valueTo="-10"
        android:repeatMode="reverse"
        android:repeatCount="infinite"
        android:duration="250" />
</set>
```
为了运行这个动画我们需要做几件事情。首先，要将ImageView的src改为动画效果的drawable。
```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingLeft="@dimen/activity_horizontal_margin"
    android:paddingRight="@dimen/activity_horizontal_margin"
    android:paddingTop="@dimen/activity_vertical_margin"
    android:paddingBottom="@dimen/activity_vertical_margin"
    tools:context=".VectorDrawablesActivity">
 
    <ImageView
        android:id="@+id/android"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/animated_android"
        android:contentDescription="@null" />
 
</RelativeLayout>
```
如果运行现在的代码，我们只能看到静态的图片。这是因为我们需要手动调用播放动画。我们将在Activity中去调用，如果Drawable是Animatable（AnimatedVectorDrawable实现了Animatable）的实例，将开始动画。
```xml
public class VectorDrawablesActivity extends Activity {
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_vector_drawables);
        ImageView androidImageView = (ImageView) findViewById(R.id.android);
        Drawable drawable = androidImageView.getDrawable();
        if (drawable instanceof Animatable) {
            ((Animatable) drawable).start();
        }
    }
}
```
运行代码就会发现指定了animation的path出现动画效果：

![](http://jcodecraeer.com/uploads/20150306/1425623349523137.gif)

在接下来的文章中，我们将更深入的去了解AnimatedVectorDrawable，实现更酷的效果。

本篇文章的源代码在 [这里](http://code.stylingandroid.com/vectordrawables/src/f4c31878fdfa3b9205bb58016c20c789e4dc426a/?at=Part2).




