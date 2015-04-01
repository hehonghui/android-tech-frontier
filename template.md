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


