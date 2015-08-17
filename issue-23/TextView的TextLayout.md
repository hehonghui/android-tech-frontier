多文本布局
---
> * 原文链接 : [Multiple Text Layout](https://sriramramani.wordpress.com/2014/08/14/multiple-text-layout/)
* 原文作者 : [Sriram Ramani](https://sriramramani.wordpress.com/author/sriramramani/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [dengshiwei](https://github.com/dengshiwei) 
* 校对者 :
* 状态 : 待校验

The pretty basic unit for developing UI in Android is a View. But if we look closely, View is a UI widget that provides user interaction. It comprises of Drawables and text [Layouts](http://developer.android.com/reference/android/text/Layout.html). We see drawables everywhere — right from the background of a View. TextView has compound drawables too. However, TextView has only one layout. Is it possible to have more than one text layout in a View/TextView?
![FIRST](https://sriramramani.files.wordpress.com/2014/08/badges.png)

在Android中开发UI的最基本的单元就是一个视图(View)。但是，如果我们仔细观察，视图(View)是一个与用户交互的UI控件。它包含Drawables和text [Layouts](http://developer.android.com/reference/android/text/Layout.html)。我们随处可见drawables —— 视图(View)的背景(backgroud)。TextView同样由drawables组成。然而，TextView只有一个布局(layout)。在一个View/TextView中是否可能有多于一个的(布局)layout?
![FIRST](https://sriramramani.files.wordpress.com/2014/08/badges.png)

Let’s take an example. We have a simple ListView with each row having an image, text and some sub-text. Since TextView shows only one text Layout by default, we would need a LinearLayout with 2 or 3 views (2 TextViews in them) to achieve this layout. What if TextView can hold one more text layout? It’s just a private variable that can be created and drawn on the Even if it can hold and draw it, how would we be able to let TextView’s original layout account for this layout?

让我们看一个例子。我们有一个简单的ListView，它每行中包含一个image、text以及一些sub-text。由于TextView中显示默认只有一个文本布局(text Layout)，我们需要一个包含2个或3个视图(views)的LinearLayout来实现这种布局(layout)。如果TextView能够容纳一个以上的布局(layout)将会是什么(情况)？即使它(TextView)能够容纳和绘制，它也是一个可以创建和绘制的私有变量(private variable)。我们如何才能够让TextView的原始布局(original layout)实现这种布局(layout)呢?

If we look at TextView’s onMeasure() closely, the available width for the layout accounts for the space occupied by the compound drawables. If we make TextView account for a larger compound drawable space on the right, the layout will constrain itself more. Now that the space is carved out, we can draw the layout in that space.

 	private Layout mSubTextLayout;

    @Override
    public int getCompoundPaddingRight() {
        // Assumption: the layout has only one line.
        return super.getCompoundPaddingRight() + mSubTextLayout.getLineWidth(0);
    }
Now we need to create a layout for the sub-text and draw. Ideally it’s not good to create new objects inside onMeasure(). But if we take care of when and how we create the layouts, we don’t have to worry about this restriction. And what different kind of Layouts can we create? TextView allows creating a BoringLayout, a StaticLayout or a DynamicLayout. BoringLayout can be used if the text is only single line. StaticLayout is for multi-line layouts that cannot be changed after creation. DynamicLayout is for editable text, like in an EditText.

 	@Override
    public void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);

        // Create a layout for sub-text.
        mSubTextLayout = new StaticLayout(
                mSubText,
                mPaint,
                width,
                Alignment.ALIGN_NORMAL,
                1.0f,
                0.0f,
                true);

        // TextView doesn't know about mSubTextLayout.
        // It calculates the space using compound drawables' sizes.
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }
The mPaint used here has all the attributes for the sub-text — like text color, shadow, text-size, etc. This is what determines the size used for a text layout.

 	@Override
    public void onDraw(Canvas canvas) {
        // Do the default draw.
        super.onDraw(canvas);

        // Calculate the place to show the sub-text
        // using the padding, available width, height and
        // the sub-text width and height.
        // Note: The 'right' padding to use here is 'super.getCompoundPaddingRight()'
        // as we have faked the actual value.

        // Draw the sub-text.
        mLayout.draw(canvas);
    }

But hey, can’t we just use a Spannable text? Well… what if the name is really long and runs into multiple lines or need to be ellipsized?

By this, we use the same TextView to draw two layouts. And that has helped us remove 2 Views! Happy hacking! ;)

P.S: The icons are from: [http://www.tutorial9.net/downloads/108-mono-icons-huge-set-of-minimal-icons/](http://www.tutorial9.net/downloads/108-mono-icons-huge-set-of-minimal-icons/)

如果我们仔细看TextView的onMeasure方法，布局(layout)的可用width占据着compound drawables所占用的空间。如果我们让TextView占有compound drawable右侧的大部分，这个布局(layout)将会包含自己更多。现在空间划分出来了，我们可以在这个空间绘制(draw)布局。

	private Layout mSubTextLayout;

    @Override
    public int getCompoundPaddingRight() {
        // Assumption: the layout has only one line.
        return super.getCompoundPaddingRight() + mSubTextLayout.getLineWidth(0);
    }

现在我们需要为sub-text制造一个布局(layout)并绘制它。理想情况下，在onMeasure()方法中去创建一个对象是不好的。但是如果我们注意何时以及如何创建布局(layouts)，我们不需要担心这个限制。
我们可以创建什么种类的布局(layouts)呢？TextView允许创建BoringLayout，BoringLayout是一个 StaticLayout或DynamicLayout。BoringLayout用于文本(text)如果只有一行的情况下。StaticLayout 用于multi-line的布局(layouts)，它创建后不能改变。DynamicLayout 用于可编辑的文本(editable text),如同EditText。

	@Override
    public void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);

        // Create a layout for sub-text.
        mSubTextLayout = new StaticLayout(
                mSubText,
                mPaint,
                width,
                Alignment.ALIGN_NORMAL,
                1.0f,
                0.0f,
                true);

        // TextView doesn't know about mSubTextLayout.
        // It calculates the space using compound drawables' sizes.
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

此处的mPaint包含对于sub-text的所有属性，例如字体颜色(text-color)、阴影(shadow)、字体大小(text-size)等等。这些决定用于text layout的大小。

	@Override
    public void onDraw(Canvas canvas) {
        // Do the default draw.
        super.onDraw(canvas);

        // Calculate the place to show the sub-text
        // using the padding, available width, height and
        // the sub-text width and height.
        // Note: The 'right' padding to use here is 'super.getCompoundPaddingRight()'
        // as we have faked the actual value.

        // Draw the sub-text.
        mLayout.draw(canvas);
    }

但是，我们不能只使用Spannable文本(text),好吧！如果这个名字确实很长，并且已经形成多行或者需要ellipsized。

通过这样，我们使用同一个TextView可以绘制两个布局(layouts)，同时也帮助我们移除了2个视图(Views)! Happy hacking!

P.S: 这些图标来自: [http://www.tutorial9.net/downloads/108-mono-icons-huge-set-of-minimal-icons/](http://www.tutorial9.net/downloads/108-mono-icons-huge-set-of-minimal-icons/)