星球大战：原力觉醒或者用原力粉碎Android的视图
---

> * 原文链接 : [Star Wars: The Force Awakens Or How to Crumble View Into Tiny Pieces on Android](https://yalantis.com/blog/star-wars-the-force-awakens-or-how-to-crumble-view-into-tiny-pieces-on-android/)
* 原文作者 : [Artem Kholodnyi](https://twitter.com/share)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

我们上个月在iOS上[发布了](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)史诗般的星战动画，你一定确信我们会为Android带来同样的内容。现在万众期待的Android版本已经[上线](https://github.com/Yalantis/StarWars.Android)，并且如往常一样，我们乐于和你分享开发中的小秘密。
 
首先，最有挑战的两部分就是将视图粉碎成一块块碎片和飞行的星空。实现这两部分非常有趣。

![Star Wars animation for
Android](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/shot.gif?raw=true)
 
### 如何使视图分裂成一块块
 
星战动画中的视图在被原力击中后，分裂成了4000块碎片。这意味着两件事：1）原力确实很强大，2）因为Canvas性能不够，使用Canvas创建如此复杂的图形会很慢。

另一方面，OpenGL则强大的多。而且，[iOS版本](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/)我们就是用OpenGL实现的，因为`UIDynamics` 和`UIKit`（Core Animation）无法处理必要的负载。

考虑到动画的复杂度，我决定使用OpenGL。
 
将Android的视图分裂成一块块，我们需要先将整个视图截图，将纹理传入OpenGL的内存，然后才可以渲染效果。让我们看看如何做到这些：
 
1. 创建截图。常见的操作：

    	Bitmap bitmap = Bitmap.createBitmap(getWidth(), getHeight(), Bitmap.Config.ARGB_8888)
    	Canvas canvas = new Canvas(bitmap);
    	super.draw(canvas);
 
2. 将纹理传入OpenGL内存中。
 
3. 粉碎视图  

Android Extension Pack中支持OpenGL ES 3.1，其中的tessellation shader(细分曲面着色器)可以完成我们需要的处理，那就是将一个平面分裂成很多三角形。而且，OpenGL ES 3.1在AEP的帮助下可以在GPU中生成三角形的顶点数据，而不像OpenGL ES 2.0只能在CPU中处理。
  
但不幸的是，目前多数的Android设备还不支持OpenGL ES 3.1 + AEP。因为56%的设备只支持OpenGL ES 2.0，所以我们决定使用更困难的方式实现。

![1.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/1.png?raw=true)

我们如何将视图粉碎成4000块呢？我们可以直接把图片切开！当然，我只是开个玩笑。如果我们创建上千的纹理可能会让手机直接融化的。代替方案是，我们使用一个大图作为纹理并且把纹理坐标分配给每个顶点。

    final float stepX = 1f / mStarWarsRenderer.sizeX;
    final float stepY = 1f / mStarWarsRenderer.sizeY;

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

最后，在vertex shader（顶点着色器）中我们把这个数值赋给碎片的位置：

    vec4 pos = a_Position;
    pos.y += u_DeltaPos;
    gl_Position = u_MVPMatrix * calcPos;
 
### 如何让星星飞起来
  
剩下的部分就是飞行的星空了。绘制星空,我考虑过使用[Leonids](https://github.com/plattysoft/Leonids)这个库.它使用了简单易用的Android画布来实现。然而，为这么多星星使用动画将不可避免的导致性能问题，让我们的动画变得卡顿，尤其是在旧手机上。下图是我使用Leonids时GPU的使用情况

![2.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/2.png?raw=true)

*[绿线表示60FPS（16ms）。要避免卡顿，我们就不应该超过这条线]*

由于性能原因,我决定使用上面分裂视图的方式,在vertex shader （顶点着色器）中处理.

我发现星星的纹理非常简单并且可以使用fragment shader（片段着色器）替代-通过公式渲染出一个星星。

    // Render a star

    float color = smoothstep(1.0, 0.0, length(v_TexCoordinate - vec2(0.5)) / v_Radius);

    gl_FragColor = vec4(color);

正如你看到的，我们得到了和图片一样的效果。这还使得我们每秒提升了30%的帧率。这个解决方法可能不总是比纹理寻址快(例如使用一张图片)，但通常是更快的。唯一能检测的方法就是实际测量。

![3.png](https://github.com/DroidWorkerLYF/Translate/blob/master/star%20wars/3.png?raw=true)
 
*左：图片纹理*
  
*右：生成的星星*
 
当我在3年前的Nexus 4上测试这个方案时，我可以在60帧下渲染100 000个星星。

### 如何使用我们的星战库
  
1. 在`TilesFrameLayout`中嵌套你的主视图

    	<com.yalantis.starwars.TilesFrameLayout

        	android:id="@+id/tiles_frame_layout"

        	android:layout_height="match_parent"

        	android:layout_width="match_parent"

        	app:sw_animationDuration="1500"

        	app:sw_numberOfTilesX="35">

                   <!-- Your views go here → -->

    	</com.yalantis.starwars.TilesFrameLayout>
  
2. 通过以下属性调整动画效果

	-   sw\_animationDuration - 执行时间（ms）
	-   sw\_numberOfTilesX - 横向要产生的碎片数量

    	mTilesFrameLayout = (TilesFrameLayout) findViewById(R.id.tiles_frame);

    	mTilesFrameLayout.setOnAnimationFinishedListener(this);
 
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
 
4. 调用`startAnimation()`就可以启动动画

    	mTilesFrameLayout.startAnimation();
  
5. 你的回调会在动画结束时调用:

    	@Override

    	public void onAnimationFinished() {

      		// Hide or remove your view/fragment/activity here

    	}
 
以上就是全部内容啦!
 
### 未来的计划

当Android Extension Pack被更普遍支持时,使用tessellation shaders（细分曲面着色器）来重写将会很有趣。保持关注!