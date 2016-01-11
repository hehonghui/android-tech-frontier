Android 开发生僻却实用的知识点 Part 3
---

> * 原文链接 : [Android Development Tidbits // No. 3](http://willowtreeapps.com/blog/android-development-tidbits-no-3/)
* 原文作者 : [Charlie](http://willowtreeapps.com/category/development-blog/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 



欢迎大家阅读“Android 开发生僻却实用的知识点”系列博文第三部分，非常感谢各位能够关注本系列博文，以及在邮件和留言上表达的支持！

> 如果你是第一次阅读本系列博文：我们团队每周都会队内讨论、分享一些 Android 开发生僻的知识点，而最近我们决定在博客中分享我们的所见所得。在 [Part 1](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-30/Android%E5%BC%80%E5%8F%91%E7%94%9F%E5%83%BB%E5%8D%B4%E5%AE%9E%E7%94%A8%E7%9A%84%E7%9F%A5%E8%AF%86%E7%82%B9Part1.md) 和 [Part 2](https://github.com/bboyfeiyu/android-tech-frontier/blob/master/issue-30/Android%E5%BC%80%E5%8F%91%E7%94%9F%E5%83%BB%E5%8D%B4%E5%AE%9E%E7%94%A8%E7%9A%84%E7%9F%A5%E8%AF%86%E7%82%B9Part2.md) 里我们已经分享了一些知识点了，有兴趣的话你可以去看看。

##Tidbit One

如果你正在使用由 ZXing 开发的二维码生成器库来生成二维码，你会发现用它来生成大图片有点慢。但你可以换一种办法来生成大图片，如果你传递 0 x 0 的图片大小给库，它会返回一个最小尺寸的 BitMatrix （每一个块都是1像素）。然后你可以把该 Matrix 写入 BitmapDrawable，并将它设为某些 View 的背景。使用这个办法前确保已经对 Drawable 调用 setFilterBitmap(false)，不然的话在缩放的时候图片会模糊。

```java
BitMatrix matrix = new QRCodeWriter().encode("content here", BarcodeFormat.QR_CODE, 0, 0);
int height = matrix.getHeight();
int width = matrix.getWidth();
Bitmap bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_4444);
for (int x = 0; x < width; x++) {
for (int y = 0; y < width; y++) {
bmp.setPixel(x, y, matrix.get(x, y) ? Color.BLACK : Color.TRANSPARENT);
}
}
BitmapDrawable qrCodeDrawable = new BitmapDrawable(getResources(), bmp);
qrCodeDrawable.setFilterBitmap(false);
imgQrCode.setBackground(qrCodeDrawable);
```

由于我需要二维码的背景是透明的，所以我使用了 Bitmap.Config.ARGB_4444。如果你想让二维码只有黑白两种颜色，可以用 Bitmap.Config.RGB_565。如果你怕乱改会有什么麻烦，你可以把二维码的创建方法改为：BitMatrix matrix = new QRCodeWriter().encode("content here", BarcodeFormat.QR_CODE, 10, 10)。但有一点一定要注意，库可能在未来被更新为不接受 0 x 0 参数，毕竟二维码最小也不可能比 10 x 10 还小吧。

– Tidbit contributor, James Sun

##Tidbit Two


键入 adb hell 和 adb shell 的结果是一样的

– Tidbit contributor, Tyler Romeo

##Tidbit Three

TextUtils.concat() 能将连接输入的 CharSequences 连接在一起，并保持它们的间距，并且返回值仍为 CharSequences。

– Tidbit contributor, Walker Hannan

##Tidbit Four

一般子 View 处理的点击事件都是由父 View 拦截并分发下来的，所以如果你需要使用某个子 View 正在处理的点击事件，就使用拦截事件的方法。如果子 View 调用了 setRequestDisallowInterceptTouchEvent，而你又不希望自己的拦截被禁止，那就重载 setRequestDisallowInterceptTouchEvent 这个方法吧。

– Tidbit contributor, Frank Doyle

##Tidbit Five

在执行一些耗时操作的时候可以调用 SqliteDatabase 的 beginTransaction() 和 endTransaction() 方法，但要确保调用了 setTransactionSuccessful()，要不然在调用 endTransaction() 的时候你的操作作出的改变会被回滚。

– Tidbit contributor, Walker Hannan

##Tidbit Six

如果你在添加测试用例，千万要小心使用静态方法！因为某些奇奇怪怪的原因，Android 框架层提供的很多方法在测试单元里根本不能用，而且由于它们是静态方法，你甚至不能模拟它们。

– Tidbit contributor, Frank Doyle

##Tidbit Seven

如果你在给应用添加测试用例，不妨试试 Mockito，它会大大简化你之前那些测试用例中复杂的对象依赖。

– Tidbit contributor, Frank Doyle
