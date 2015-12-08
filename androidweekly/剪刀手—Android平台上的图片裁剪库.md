剪刀手:Android平台上的图片裁剪库
---

> * 原文链接 : [Scissors: an image cropping library for Android](https://eng.lyft.com/scissors-an-image-cropping-library-for-android-a56369154a19#.ebe64l3dy)
* 原文作者 : [Evelio Tarazona](https://medium.com/@eveliotc)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 


几个月前我们往我们的App中[引入个人简介功能](http://blog.lyft.com/posts/profiles)后，Helen——我们其中一个特性团队的工程师——接到了对个人简介进行第二次迭代的任务。这次版本迭代包括了众多的改进，其中包括支持自定义个人头像功能，头像可以用相机直接拍摄，也可以从Gallery或者Photos这类相册App中选择。

![Lyft的Android版本自定义图像的早期设计](https://cdn-images-1.medium.com/max/1600/1*An_iDXn6RtufzwUIdSUc-w.png)
Lyft的Android版本自定义头像的早期设计

在图片被上传到服务器之前，图片必须被裁剪以符合一定的要求，这其中包括:

* 放大到原尺寸的200%
* 移动和截图
* 不管在什么样的屏幕密度上都保持固定的比例
* 基于当前屏幕尺寸进行裁剪

因为在Lyft我们都喜欢开源，所以自然而然的想到了搜索现成的解决方案。但是没有一个能满足我们的需求，所以我们决定自己动手实现这个需求。一晃几个月过去了，我们现在打算将这个库([Scissors](https://github.com/lyft/scissors))的核心代码开源。

## Scissors
![](https://cdn-images-1.medium.com/max/1600/1*o9wj6y7Xt5zn6nHI4p5t7Q.png)

### 这个库能做什么？
[Scissors](https://github.com/lyft/scissors)提供了一个叫做**CropView**的控件，它继承于[ImageView](https://developer.android.com/reference/android/widget/ImageView.html)并且提供了熟悉的方式来提供用于裁剪的图像，比如使用[setImageBitmap](https://developer.android.com/reference/android/widget/ImageView.html#setImageBitmap%28android.graphics.Bitmap%29)来设置要裁剪的图像。一旦用户设置好了要裁剪的位置和缩放比例(这受限于cropviewMaxScale和cropviewMinScale)只需调用

~~~java
Bitmap croppedBitmap = cropView.crop();
~~~
该方法返回的Bitmap符合视图的尺寸，这个尺寸可以通过cropviewViewportHeightRatio来进行控制。  

![](https://cdn-images-1.medium.com/max/1600/1*SbhkZppPqhMwj4CdcrFS_w.gif)  

### 扩展
我们也提供了一些实用的扩展来进行一些常见的任务，比如:  

* 使用[Picasso](https://github.com/square/picasso)或者[Glide](https://github.com/bumptech/glide)往CropView里加载Bitmap并且让图片适应视图的尺寸

 ~~~java
cropView.extensions()
 .load(galleryUri);
 ~~~ 
 
 你也可以用你喜欢的方式创建自定义的BitmapLoader来提供Bitmap
 
 *在不阻塞主线程的前提下保存裁剪好的Bitmap到文件或者流中
 
 ~~~java
 cropView.extensions()
 .crop()
 .quality(87)
 .format(PNG)
 .into(croppedFile);
 ~~~
 
 你也可以指定裁剪后输出到文件或者流中的图片格式和质量

### 未来的计划
我们想让Scissors越来越好用，所以以后Scissors将会支持[双击拖动与缩放](https://github.com/lyft/scissors/issues/1)，同时也会[修复一些bug和进行一些优化](https://github.com/lyft/scissors/issues/)。我们希望Scissors对你来说是有用的并且能够满足你所有关于图片裁剪的需求。

[开始使用Scissors吧](https://github.com/lyft/scissors)


