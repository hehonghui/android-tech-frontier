星球大战：原力觉醒或者用原力粉碎Android的视图
---

> * 原文链接 : [Star Wars: The Force Awakens Or How to Crumble View Into Tiny Pieces on Android](https://yalantis.com/blog/star-wars-the-force-awakens-or-how-to-crumble-view-into-tiny-pieces-on-android/)
* 原文作者 : [Artem Kholodnyi](https://twitter.com/share)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中 

We
[released](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)
our epic Star Wars animation for iOS last month, and you probably had no
doubt that we were going to repeat the same story but for the Android
audience. The highly anticipated version of Star Wars is now [available
for Android](https://github.com/Yalantis/StarWars.Android) developers
and we’re happy to share our development secrets with you. As always.  
我们上个月在iOS上[发布了](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)史诗般的星战动画，你一定确信我们会为Android带来同样的内容。现在万众期待的Android版本已经[上线](https://github.com/Yalantis/StarWars.Android)，并且如往常一样，我们乐于和你分享开发中的小秘密。

To start with, there are two challenging parts in our Star Wars
animation: view crumbling into tiny pieces and flying star field. I had
a lot of fun implementing those.  
首先，最有挑战的两部分就是将视图粉碎成一块块碎片和飞行的星空。实现这两部分非常有趣。

![Star Wars animation for
Android](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/shot.gif?raw=true)

### How to break up the view into tiny pieces  
### 如何使视图分裂成一块块

After the view in our Star Wars animation is hit by the Force, it breaks
up into 4,000 tiles. This means two things: 1) the Force is indeed quite
powerful, and 2) using Canvas to create such complex graphics on Android
would’ve been too slow, because Canvas lacks performance.  
星战动画中的视图在被原力击中后，分裂成了4000块碎片。这意味着两件事：1）原力确实很强大，2）因为Canvas性能不够，使用Canvas创建如此复杂的图形会很慢。

OpenGL, on the other hand, is far more powerful. What’s more, we used it
for implementing our [Star Wars animation for
iOS](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)
when *UIDynamics* and *UIKit* (Core Animation) couldn’t cope with the
necessary load.  
另一方面，OpenGL则强大的多。而且，[iOS版本](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)我们就是用OpenGL实现的，因为`UIDynamics` 和`UIKit`（Core Animation）无法处理必要的负载。

Given the complexity of the animation, I decided to go with OpenGL.  
考虑到动画的复杂度，我决定使用OpenGL。

To break up an Android view into tiny pieces, we need to take a
screenshot of the entire view, move a texture to OpenGL memory, and only
then render the tile effect. Let’s see how we can do this:  
将Android的视图分裂成一块块，我们需要先将整个视图截图，将纹理传入OpenGL的内存，然后才可以渲染效果。让我们看看如何做到这些：

1. Take a screenshot of a view. Nothing fancy here:  
1. 创建截图。常见的操作：

    	Bitmap bitmap = Bitmap.createBitmap(getWidth(), getHeight(), Bitmap.Config.ARGB_8888)
    	Canvas canvas = new Canvas(bitmap);
    	super.draw(canvas);

2. Move a texture to OpenGL memory.  
2. 将纹理传入OpenGL内存中。

3. Break the bitmap into tiles.  
3. 粉碎视图  

Android Extension Pack, a superset of OpenGL ES 3.1, has a tessellation
shader which does exactly what we need: it breaks a single plane into
lots of triangles. What’s more, unlike OpenGL ES 2.0 where vertex data
can only be generated on CPU, with the AEP we could generate these data
on GPU.  
Android Extension Pack中支持OpenGL ES 3.1，其中的tessellation shader(细分曲面着色器)可以完成我们需要的处理，那就是将一个平面分裂成很多三角形。而且，OpenGL ES 3.1在AEP的帮助下可以在GPU中生成三角形的顶点数据，而不像OpenGL ES 2.0只能在CPU中处理。

But unfortunately, OpenGL ES 3.1 + AEP is not supported by the majority
of Android devices yet. Because OpenGL ES 2.0 is used by 56% of Android
devices, we decided to take the hard way.  
但不幸的是，目前多数的Android设备还不支持OpenGL ES 3.1 + AEP。因为56%的设备只支持OpenGL ES 2.0，所以我们决定使用更困难的方式实现。

![1.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/1.png?raw=true)

How can we break the view into 4,000 pieces? We can slice an image for
every tile! Of course, I’m joking. If we created a few thousands
textures a device would probably just melt in our hands. Instead, we are
going to use a single large bitmap texture and assign UV (texture
coordinates) to each vertex:  
我们如何将视图粉碎成4000块呢？我们可以直接把图片切开！当然，我只是开个玩笑。如果我们创建上千的纹理可能会让手机直接融化的。代替方案是，我们使用一个大图作为纹理并且把纹理坐标分配给每个顶点。

    final float stepX = 1f / mStarWarsRenderer.sizeX;
    final float stepY = 1f / mStarWarsRenderer.sizeY;

-   SizeX - the number of tiles by width
-   SizeY - the number of tiles by height  
-   SizeX - 横向碎片的数量
-   SizeY - 纵向碎片的数量

		for (int x = 0; x < mStarWarsRenderer.sizeX; x++) {

            for (int y = 0; y < mStarWarsRenderer.sizeY; y++) {

                final float u0 = x * stepX;

                final float v0 = y * stepY;

                final float u1 = u0 + stepX;

                final float v1 = v0 + stepY;

                // push values to buffer

            }

    	}

We want to move as many calculations as we can to GPU because GPU is
good at calculating many things simultaneously. I did the calculations
for all positions in the vertex shader. It takes only one variable that
is animated with the help of Android interpolator:  
我们希望将更多的计算放到适合并行任务的GPU中来进行。我通过vertex shader（顶点着色器）进行所有位置的计算。这只需要在Android的interpolator帮助下对一个变量进行变化：

    // from 0 to plane height in OpenGL coordinates
    animator = ValueAnimator.ofFloat(0, -Const.PLANE_HEIGHT * 2);
    animator.setDuration(mAnimationDuration);
    animator.setInterpolator(new DecelerateInterpolator(1.3f));
    animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
     @Override
     public void onAnimationUpdate(ValueAnimator animation) {
       float value = (float) animation.getAnimatedValue();
       mDeltaPosX = value;
       mGlSurfaceView.requestRender();
     }
    };
    animator.start();

Finally, in the vertex shader we should add this value to the tile
positions:  
最后，在vertex shader（顶点着色器）中我们把这个数值赋给碎片的位置：

    vec4 pos = a_Position;
    pos.y += u_DeltaPos;
    gl_Position = u_MVPMatrix * calcPos;

### How to make stars fly  
### 如何让星星飞起来

The other part of the Star Wars animation is a flying star field. For
drawing stars, I considered using the
[Leonids](https://github.com/plattysoft/Leonids) library. It utilizes
standard Android Canvas which is very easy to use. However, animating
lots of star objects inevitably leads to performance problems, so our
animation would’ve become unresponsive, especially on older smartphones.
Here is what I’ve got when I tested the animation using the Leonids
library:  
剩下的部分就是飞行的星空了。绘制星空,我考虑过使用[Leonids](https://github.com/plattysoft/Leonids)这个库.它使用了简单易用的Android画布来实现。然而，为这么多星星使用动画将不可避免的导致性能问题，让我们的动画变得卡顿，尤其是在旧手机上。下图是我使用Leonids时GPU的使用情况

![2.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/2.png?raw=true)

*[The green line corresponds to 60 FPS (16ms).**To avoid stuttering
animation, we shouldn’t cross the line.]*  
*[绿线表示60FPS（16ms）。要避免卡顿，我们就不应该超过这条线]*

Given the performance issues, I decided to take a similar approach I
used with tiles and animate star movement in the vertex shader.  
由于性能原因,我决定使用上面分裂视图的方式,在vertex shader （顶点着色器）中处理.

I’ve noticed that a star texture is rather simple and can be replaced
with a little fragment shader trick – by using a formula for rendering
star objects:  
我发现星星的纹理非常简单并且可以使用fragment shader（片段着色器）替代-通过公式渲染出一个星星。

    // Render a star

    float color = smoothstep(1.0, 0.0, length(v_TexCoordinate - vec2(0.5)) / v_Radius);

    gl_FragColor = vec4(color);

As you can see, we got the same result that we would’ve gotten had we
used an image. This also gave us 30% more frames per second. This
solution might not always be faster than texture lookup (i.e. using an
image) but it often is. The only way to find this out is to measure.  
正如你看到的，我们得到了和图片一样的效果。这还使得我们每秒提升了30%的帧率。这个解决方法可能不总是比纹理寻址快(例如使用一张图片)，但通常是更快的。唯一能检测的方法就是实际测量。

![3.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/3.png?raw=true)

*png texture on the left*  
*左：图片纹理*

*generated image on the right*  
*右：生成的星星*

When I tested this implementation on my three year old Nexus 4, I was
able to render 100 000 stars with 60 FPS.  
当我在3年前的Nexus 4上测试这个方案时，我可以在60帧下渲染100 000个星星。

### How to use the Star Wars library  
### 如何使用我们的星战库

1. Wrap your fragment or activity main view in *TilesFrameLayout*:  
1. 在`TilesFrameLayout`中嵌套你的主视图

    	<com.yalantis.starwars.TilesFrameLayout

        	android:id="@+id/tiles_frame_layout"

        	android:layout_height="match_parent"

        	android:layout_width="match_parent"

        	app:sw_animationDuration="1500"

        	app:sw_numberOfTilesX="35">

                   <!-- Your views go here → -->

    	</com.yalantis.starwars.TilesFrameLayout>

2. Adjust animation with these parameters:  
2. 通过以下属性调整动画效果

-   sw\_animationDuration – duration in milliseconds
-   sw\_numberOfTilesX – the number of square tiles the plane is
    tessellated into broadwise
-   sw\_animationDuration - 执行时间（ms）
-   sw\_numberOfTilesX - 横向要产生的碎片数量

<!-- -->

    mTilesFrameLayout = (TilesFrameLayout) findViewById(R.id.tiles_frame);

    mTilesFrameLayout.setOnAnimationFinishedListener(this);

3. In your activity or fragment’s *onPause*() and *onResume*() it’s
important to call the corresponding methods:  
3. 在activity或者fragment的`onPause`和`onResume`方法中调用对应方法:

    	@Override

    	public void onResume() {

        	super.onResume();

        	mTilesFrameLayout.onResume();

    	}

    	@Override

    	public void onPause() {

        	super.onPause();

        	mTilesFrameLayout.onPause();

    	}

4. To start the animation simply call:  
4. 调用`startAnimation()`就可以启动动画

    	mTilesFrameLayout.startAnimation();

5. Your callback will be called when the animation ends:  
5. 你的回调会在动画结束时调用:

    	@Override

    	public void onAnimationFinished() {

      		// Hide or remove your view/fragment/activity here

    	}

That's all!  
以上就是全部内容啦!

### Future plans  
### 未来的计划

It would be fun to rewrite the plane breaking logic utilizing the power
of tessellation shaders when Android Extension Pack is more widespread.
Stay tuned!  
当Android Extension Pack被更普遍支持时,使用tessellation shaders（细分曲面着色器）来重写将会很有趣。保持关注!