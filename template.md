`安卓的模糊视图`
---

>
* 原文链接 : [A Blurring View for Android](原文url)
* 译者 : [lvtea0105](https://github.com/lvtea0105) 
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)  
* 状态 :   校对中


Blur effect can be used to vividly convey a sense of layering of content. It allows the user to maintain the context, while focused on the currently featured content, even if what’s under the blurring surface shifts in a parallax fashion or changes dynamically.
模糊效果可以生动地表达出内容的层次感，当使用者关注重点内容时，能够保持当前背景，即便在模糊表面之下发生视差效果或者动态改变。    
On iOS, we could get this sort of blurring by first constructing a UIVisualEffectView,and then adding visualEffectView to a view hierarchy, in which it will dynamically blur what’s under it.
在IOS设备中，我们首先构造一个UIVisualEffectView,之后添加 visualEffectView 到view层，在view中可以进行动态的模糊。

## 安卓中的表现形式

While things are not as straightforward on Android, we did see great examples of the blur effect, such as in the Yahoo Weather app. According to Nicholas Pomepuy’s blog post, however, the blurring is here achieved through caching a pre-render blurred version of the background image.
在Android 中，模糊的实现就不是这样简单直接，我们在雅虎天气APP中确实看到了很好的模糊效果实例，但是根据Nicholas Pomepuy 的博客帖子，通过隐藏预渲染得到的效果会模糊所有背景图片。

While this approach could be very effective, it is not exactly suitable for our needs. At 500px, images are typically the focal content rather than merely supplying a background. That means images could change a lot and change quickly, even if they are behind a blurring layer. The tour in our Android app is a case in point. Here, as the user swipes for the next page, rows of images shift in opposite directions and fade out, making it difficult to appropriately manage multiple pre-rendered images for composing the required blur effect.
虽然这种方法非常有效，但是确实不符合我们的需求，在500px的APP中，图像通常是获得焦点的内容，而不仅仅是提供背景，这说明图像的变化很大且迅速，即便他们是在模糊层之下。在我们的安卓APP中即是一个恰当的例子：当用户滑动至下一页时，整排图片会以相反方向淡出，为了组成所需的模糊效果，适当地管理多个预渲染图是困难的。


What we needed for the tour is a blurring view that dynamically blurs the views underneath it in real time. The interface we eventually arrived at is as simple as first giving the blurring view a reference to the blurred view:
我们需要的效果是，实时地模糊其下的视图，最终需要的界面是给模糊视图一个blurred view 的引用。

and then whenever the blurred view changes – whether it is due to content change (e.g. displaying a new photo), view transformation, or a step in animation, we invalidate the blurring view: 
之后当blurred view 改变时，不管是因为内容改变（比如呈现新的图片）、view的变换还是处在动画过程，我们都要刷新 blurring view。

To implement the blurring view, we subclass the View class and override the onDraw() method to render the blurred effect:
为了实现 blurring view, 我们需要继承 view类并重写 onDraw()方法来渲染模糊效果。



The key here is that when the blurring view redraws, it uses the draw() method of the blurred view, to which it has a reference, but draws into a private, bitmap-backed canvas:
这里的关键点在于，当模糊视图重绘时，它使用blurred view 的draw()方法，模糊视图保持blurred view的引用，它绘制一个私有的，以bitmap作为背景的画布。

(It is worth noting that this approach of calling another view’s draw() method is also suitable for building a magnifier or signature UI, wherein the content of the magnified or signature area is enlarged, rather than blurred.)
这种使用另一个视图的 draw（）方法，也适用于建立放大或者个性的UI界面，在其中，放大区域的内容是扩大的，而不是模糊的。

Following the ideas discussed in Nicholas Pomepuy’s post, we use a combination of subsampling and RenderScript for fast processing. The setup for subsampling is done when we initialize the blurring view’s private canvas mBlurringCanvas:
根据Nicholas Pomepuy 讨论的想法，我们使用子采样和渲染脚本用来快速绘制，当初始化blurring view的私有画布mBlurringCanvas 后，子采样就已经完成了。

Given this setup and appropriate initialization of RenderScript, the blur() method used in onDraw() above is as simple as:
通过mBlurringCanvas的 建立与恰当的渲染脚本初始化，重绘时的blur()方法如下：

Now that mBlurredBitmap is ready, the rest of the onDraw() method takes care of drawing it into the blurring view’s own canvas using appropriate translation and scaling.
此时 mBlurredBitmap 已准备好，剩下的就是使用适当的变换和缩放，在blurring view自己的画布上重绘视图。

## 实现细节

For a full implementation, we need to be mindful of several technical points. First, we have found that a factor of 8 for downsampling scaling and a blurring radius of 15 to be good for our purposes. Parameters suitable for your needs may be different.
完整实现blurring view 时，我们需要注意几个技术点：
一：我们发现缩放因子8，模糊半径15 很好地满足我们的目标，但满足你需求的参数可能是不同的。

Second, we encountered some RenderScript artifacts at the edge of the blurred bitmap. To counter that, we rounded the scaled width and height up to the nearest multiple of 4:
二：在模糊的bitmap边缘会遇到一些渲染脚本效果，我们将缩放的宽度和高度进行了圆角化，直到最近的4的倍数。

Third, to further ensure good performance, we create the two bitmaps mBitmapToBlur, which backs the private canvas mBlurringCanvas, and mBlurredBitmap on demand and recreate them only if the blurred view’s size has changed. Likewise, we create RenderScript’s Allocation objects mBlurInput and mBlurOutput only when the blurred view’s size has changed.
三：为了保证更好的表现效果，我们新建两个bitmap对象——mBitmapToBlur 和 mBlurredBitmap ，
mBitmapToBlur 位于私有画布mBlurringCanvas 之下， mBlurredBitmap 仅当blurred view的大小变化时才重新建立他们；
同样地当blurred view的大小改变时，我们才创建渲染脚本对象mBlurInput 和 mBlurOutput。

Fourth, we also draw a layer of uniform, semi-transparent white color with PorterDuff.Mode.OVERLAY on top of the blurred image for the lightness required for our design.
四：我们以with PorterDuff.Mode.OVERLAY 模式绘制一个白色半透明的层，它处在被模糊的的图片上层。用来处理设计需求中的淡化。

Finally, because RenderScript is only available on API level 17 and up, we need to degrade gracefully on older versions of Android. Unfortunately, a bitmap blurring solution in Java as noted in Nicholas Pomepuy’s post, while adequate for pre-rendering a cached copy, is not fast enough for realtime rendering. The decision we made was to simply use a semitransparent view with high opacity as fallback.
最后，因为RenderScript（渲染脚本）至少在API 17 上才可用，我们需要降低旧版本的安卓，糟糕的是，Nicholas Pomepuy帖子中提到的Java bitmap的模糊方法，当恰当地预渲染缓存副本时，对于实时渲染不够迅速，我们所做的是使用一个半透明的view作为回调。

## 优点和缺点

We like this view drawing approach because it blurs in real time, it’s easy to use, it allows agnosticity of the blurred view’s content, it also allows some flexibility in the relationship between the blurring and the blurred view, and, above all, it suits our needs. 
我们喜欢这个view的绘制方法，因为它可以实时模糊并且容易使用，使得blurred view 的内容，也在blurring view 和blurred view中间保证了灵活性，最重要的是，它满足了我们的需求

However, this approach does expect the blurring view to be privy to the whereabouts of the blurred view for appropriate coordinate transformation. Relatedly, the blurring view must not be a subview of the blurred view, otherwise you’ll get a stack overflow from mutually nested drawing calls. A simple but principled way with this limitation is to ensure that the blurring view is a sibling of the blurred view that sits in front of it in z-order.
这个方法确实使得blurring view 与适当协同变换的 blurred view 保持了私有联系，相关地，模糊视图必须不能是blurred view的子类，否则会因为互相调用造成堆栈溢出。简单有效处理此限制的方法是要保证模糊视图与blurred view 在同级，并且Z轴次序上 blurred view 在blurring view 之前。

Another limitation we have noticed has to do with vector drawing and text, which does not seem to play well with our use of the default bitmap downsampling.
另一点需要注意的限制是，由于与 矢量图形和文本 有关，我们默认的bitmap削减采样表现效果不是很好。

## 库文件和示例

To see our solution in action, you can check out the tour in our Android app. We have also put together a tiny open source library on GitHub along with a detailed demo that shows how to use it with content change and with animation as well as view transformation.
你可以在我们的安卓APP上看到解决方法，我们也把开源的库文件连同一个示例分享到了github，它能够展示内容变换、动画和视图变换。
