#听FackBook工程师讲*Custom ViewGroups*

---

> * 原文链接 : [Custom ViewGroups](https://sriramramani.wordpress.com/2015/05/06/custom-viewgroups/)
* 原文作者 : [Sriram Ramani](https://sriramramani.wordpress.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者: [xianjiajun](https://github.com/xianjiajun)  
* 状态 : 完成 

Android提供了几个ViewGroups如LinearLayout, RelativeLayout, FrameLayout来固定child Views的位置。在这些普通的ViewGroups中有多种使用选择。
例如：LinearLayout几乎支持HTML Flexbox的所有特性(除了包装)。在view之间你可以选择是否显示分割线(dividers),并且基于最大的child测量所有的children。RelativeLayout是一种限制性的解决方案。这些layouts都已经足够好了，但是当你的UI非常复杂的时候它们还能很好的解决么？

![](https://sriramramani.files.wordpress.com/2015/05/custom-view-group.png?w=1594&h=204)

>ViewGroup with a ProfilePhoto, Title, Subtitle and Menu button.

上面的这种布局在Facebook app中是非常常见的。有头像、其它的view垂直摆在它的右侧、还有一个可选操作的view在最右边。这个布局可以通过使用LinearLayout嵌套或者一个RelativeLayout这样的普通ViewGroup实现。我们看一下当分别使用这两种布局的情况下在measure时会发生什么。

使用LinearLayout完成布局的示例

```java
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">
 
    <ProfilePhoto
        android:layout_width="40dp"
        android:layout_height="40dp"/>
 
    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:orientation="vertical">
 
        <Title
            android:layout_width="match_parent"
            android:layout_height="wrap_content"/>
 
        <Subtitle
            android:layout_width="match_parent"
            android:layout_height="wrap_content"/>
 
    </LinearLayout>
 
    <Menu
        android:layout_width="20dp"
        android:layout_height="20dp"/>
 
</LinearLayout>
```
在Nexus 5设备上measure发生时的情况如下

```
> LinearLayout [horizontal]       [w: 1080  exactly,       h: 1557  exactly    ]
    > ProfilePhoto                [w: 120   exactly,       h: 120   exactly    ]
    > LinearLayout [vertical]     [w: 0     unspecified,   h: 0     unspecified]
        > Title                   [w: 0     unspecified,   h: 0     unspecified]
        > Subtitle                [w: 0     unspecified,   h: 0     unspecified]
        > Title                   [w: 222   exactly,       h: 57    exactly    ]
        > Subtitle                [w: 222   exactly,       h: 57    exactly    ]
    > Menu                        [w: 60    exactly,       h: 60    exactly    ]
    > LinearLayout [vertical]     [w: 900   exactly,       h: 1557  at_most    ]
        > Title                   [w: 900   exactly,       h: 1557  at_most    ]
        > Subtitle                [w: 900   exactly,       h: 1500  at_most    ]       
```


ProfilePhoto和Menu只被测量了一次，因为它们有明确的宽高值。垂直的LinearLayout被测量了两次。第一次的时候，父LinearLayout要求以UNSPECIFIED spec的方式来测量。导致了垂直的LinearLayout也以这种方式测量它的子view.此时它在它们返回值的基础上以EXACTLY spec的方式测量它的子view，但是它还没有结束。一旦在测量ProfilePhoto和Menu之后，父布局知道可用于垂直的LinearLayout的尺寸大小。以AT_MOST height对Title 和 Subtitle测量之后导致了第二次传值。显然，每一个TextView (Title and Subtitle)被测量3次。第二次传值创建或者废弃Layouts，这些操作是昂贵的。如果想ViewGroup发挥更好的性能，首要的工作就是免去对TextViews的测量传值工作。


使用RelativeLayout效果会不会好一些?

```java
<RelativeLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content">
 
    <ProfilePhoto
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:layout_alignParentTop="true"
        android:layout_alignParentLeft="true"/>
 
    <Menu
        android:layout_width="20dp"
        android:layout_height="20dp"
        android:layout_alignParentTop="true"
        android:layout_alignParentRight="true"/>
 
    <Title
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_toRightOf="@id/profile_photo"
        android:layout_toLeftOf="@id/menu"/>
 
    <Subtitle
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@id/title"
        android:layout_toRightOf="@id/profile_photo"
        android:layout_toLeftOf="@id/menu"/>
 
</RelativeLayout>
```

测量情况如下：

```
> RelativeLayout                  [w: 1080  exactly,   h: 1557  exactly]
    > Menu                        [w: 60    exactly,   h: 1557  at_most]
    > ProfilePhoto                [w: 120   exactly,   h: 1557  at_most]
    > Title                       [w: 900   exactly,   h: 1557  at_most]
    > Subtitle                    [w: 900   exactly,   h: 1557  at_most]
    > Title                       [w: 900   exactly,   h: 1557  at_most]
    > Subtitle                    [w: 900   exactly,   h: 1500  at_most]
    > Menu                        [w: 60    exactly,   h: 60    exactly]
    > ProfilePhoto                [w: 120   exactly,   h: 120   exactly]
```


正如先前提到的，RelativeLayout是通过solving constraints(分解约束。译者认为就是一层一层的测量)进行测量，上面的布局中ProfilePhoto和Menu没有依赖其它的参照物(siblings)，因此它们先被测量(with an AT_MOST height).这时Title(2个约束)和Subtitle(3个约束)才会被测量。此时所有view明确了自己想要的尺寸大小。RelativeLayout使用这些信息第二次传值给Title, Subtitle, Menu和ProfilePhoto。再重复一遍，每个view被测量了两次，因此这种方案稍佳。如果你和上面的LinearLayout例子相比较一下，最后用于测量所有leaf Views所使用的MeasureSpec是相同的-因此最后的输出结果是一样的。


怎么样才能免去对子view的测量传值呢？自定义一个ViewGroup是不是会有帮助？让我们分析一下这个布局。Title 和 Subtitle 总是在ProfilePhoto的左侧在Menu按钮的右侧。如果我们手工解决这个问题，需要计算出ProfilePhoto和Menu按钮的尺寸，并且使用剩下的尺寸再来计算Title 和 Subtitle。这时对每个view只进行一次测量传值。我们叫这种布局为ProfilePhotoLayout。


```java
public class ProfilePhotoLayout extends ViewGroup {
 
    private ProfilePhoto mProfilePhoto;
    private Menu mMenu;
    private Title mTitle;
    private Subtitle mSubtitle;
 
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // 1. Setup initial constraints.
        int widthConstraints = getPaddingLeft() + getPaddingRight();
        int heightContraints = getPaddingTop() + getPaddingBottom();
        int width = 0;
        int height = 0;
 
        // 2. Measure the ProfilePhoto
        measureChildWithMargins(
            mProfilePhoto,
            widthMeasureSpec,
            widthConstraints,
            heightMeasureSpec,
            heightConstraints);
 
        // 3. Update the contraints.
        widthConstraints += mProfilePhoto.getMeasuredWidth();
        width += mProfilePhoto.getMeasuredWidth();
        height = Math.max(mProfilePhoto.getMeasuredHeight(), height);
 
        // 4. Measure the Menu.
        measureChildWithMargins(
            mMenu,
            widthMeasureSpec,
            widthConstraints,
            heightMeasureSpec,
            heightConstraints);
 
        // 5. Update the constraints.
        widthConstraints += mMenu.getMeasuredWidth();
        width += mMenu.getMeasuredWidth();
        height = Math.max(mMenu.getMeasuredHeight(), height);
 
        // 6. Prepare the vertical MeasureSpec.
        int verticalWidthMeasureSpec = MeasureSpec.makeMeasureSpec(
            MeasureSpec.getSize(widthMeasureSpec) - widthConstraints,
            MeasureSpec.getMode(widthMeasureSpec));
 
        int verticalHeightMeasureSpec = MeasureSpec.makeMeasureSpec(
            MeasureSpec.getSize(heightMeasureSpec) - heightConstraints,
            MeasureSpec.getMode(heightMeasureSpec));
 
        // 7. Measure the Title.
        measureChildWithMargins(
            mTitle,
            verticalWidthMeasureSpec,
            0,
            verticalHeightMeasureSpec,
            0);
 
        // 8. Measure the Subtitle.
        measureChildWithMargins(
            mSubtitle,
            verticalWidthMeasureSpec,
            0,
            verticalHeightMeasureSpec,
            mTitle.getMeasuredHeight());
 
        // 9. Update the sizes.
        width += Math.max(mTitle.getMeasuredWidth(), mSubtitle.getMeasuredWidth());
        height = Math.max(mTitle.getMeasuredHeight() + mSubtitle.getMeasuredHeight(), height);
 
        // 10. Set the dimension for this ViewGroup.
        setMeasuredDimension(
            resolveSize(width, widthMeasureSpec),
            resolveSize(height, heightMeasureSpec));
    }
 
    @Override
    protected void measureChildWithMargins(
        View child,
        int parentWidthMeasureSpec,
        int widthUsed,
        int parentHeightMeasureSpec,
        int heightUsed) {
        MarginLayoutParams lp = (MarginLayoutParams) child.getLayoutParams();
 
        int childWidthMeasureSpec = getChildMeasureSpec(
            parentWidthMeasureSpec,
            widthUsed + lp.leftMargin + lp.rightMargin,
            lp.width);
 
        int childHeightMeasureSpec = getChildMeasureSpec(
            parentHeightMeasureSpec,
            heightUsed + lp.topMargin + lp.bottomMargin,
            lp.height);
 
        child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    }
}
```

我们来分析一下代码。我们从已知的约束条件开始 — 所有边的内边距，另外还需要考虑的约束是使用固定值的控件的高和宽。Android提供了一个帮助方法-measureChildWithMargins()用于测量ViewGroup内的子view.然而它总是添加padding作为约束条件的一部分。因此我们复写这个方法自己来管理这些约束条件。从测量ProfilePhoto开始，测量完成后更新一下constraints。对menu按钮的测量亦是如此。
现在还剩下Title和Subtitle的宽度没有测量。Android还提供了另外一个帮助方法-makeMeasureSpec()，用于构造MeasureSpec,传入相应的size和mode返回一个MeasureSpec。接下来我们传入Title 和 Subtitle可用的width 和 height及相应的MeasureSpecs来测量Title 和 Subtitle。最后更新一下ViewGroup的尺寸。在这一步可以明确每个view都只被测量一次。


```
> ProfilePhotoLayout              [w: 1080  exactly,   h: 1557  exactly]
    > ProfilePhoto                [w: 120   exactly,   h: 120   exactly]
    > Menu                        [w: 60    exactly,   h: 60    exactly]
    > Title                       [w: 900   exactly,   h: 1557  at_most]
    > Subtitle                    [w: 900   exactly,   h: 1500  at_most]
```


性能上是不是提升了？Facebook app中你看见的大多数布局都使用了这种布局，并且经证明确实提高了性能。我把没有提到的onLayout()方法留给读者作为练习。


你喜欢解决这种Android UI 工程问题么? Facebook在这方面缺少专业的人才。

[点击申请](https://www.facebook.com/careers/department?req=a0I1200000G49VNEAZ&dept=engineering&q=UI%20Engineer)

