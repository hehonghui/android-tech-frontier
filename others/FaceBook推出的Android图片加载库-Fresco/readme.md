FaceBook推出的Android图片加载库-Fresco
---

>
* 原文链接:[Introducing Fresco: A new image library for Android](https://code.facebook.com/posts/366199913563917/introducing-fresco-a-new-image-library-for-android/)
* 作者 :  [tyrone Nicholas ](https://www.facebook.com/tyrone.nicholas)
* 译者 :  [ZhaoKaiQiang](https://github.com/ZhaoKaiQiang) 
* 校对者: [Chaossss](https://github.com/chaossss)
* 校对者: [bboyfeiyu](https://github.com/bboyfeiyu)
* 校对者: [BillionWang](https://github.com/BillionWang)
* 状态 :  完成

在Android设备上面，快速高效的显示图片是极为重要的。过去的几年里，我们在如何高效的存储图像这方面遇到了很多问题。图片太大，但是手机的内存却很小。每一个像素的R、G、B和alpha通道总共要占用4byte的空间。如果手机的屏幕是480*800,那么一张屏幕大小的图片就要占用1.5M的内存。手机的内存通常很小，特别是Android设备还要给各个应用分配内存。在某些设备上，分给Facebook App的内存仅仅有16MB。一张图片就要占据其内存的十分之一。

当你的App内存溢出会发生什么呢？它当然会崩溃！我们开发了一个库来解决这个问题，我们叫它Fresco。它可以管理使用到的图片和内存，从此App不再崩溃。

##内存区
为了理解Facebook到底做了什么工作，在此之前我们需要了解在Android可以使用的堆内存之间的区别。Android中每个App的Java堆内存大小都是被严格的限制的。每个对象都是使用Java的new在堆内存实例化，这是内存中相对安全的一块区域。内存有垃圾回收机制，所以当App不在使用内存的时候，系统就会自动把这块内存回收。

不幸的是，内存进行垃圾回收的过程正是问题所在。当内存进行垃圾回收时，内存不仅仅进行了垃圾回收，还把 Android 应用完全终止了。这也是用户在使用 App 时最常见的卡顿或短暂假死的原因之一。这会让正在使用 App 的用户非常郁闷，然后他们可能会焦躁地滑动屏幕或者点击按钮，但 App 唯一的响应就是：在 App 恢复正常之前，请求用户耐心等待

相比之下，Native堆是由C++程序的new进行分配的。在Native堆里面有更多可用内存，App只被设备的物理可用内存限制，而且没有垃圾回收机制或其他东西拖后腿。但是c++程序员必须自己回收所分配的每一块内存，否则就会造成内存泄露，最终导致程序崩溃。

Android有另外一种内存区域，叫做Ashmem。它操作起来更像Native堆，但是也有额外的系统调用。Android 在操作 Ashmem 堆时，会把该堆中存有数据的内存区域从 Ashmem 堆中抽取出来，而不是把它释放掉，这是一种弱内存释放模式；被抽取出来的这部分内存只有当系统真正需要更多的内存时（系统内存不够用）才会被释放。当 Android 把被抽取出来的这部分内存放回 Ashmem 堆，只要被抽取的内存空间没有被释放，之前的数据就会恢复到相应的位置。

##可消除的Bitmap
Ashmem不能被Java应用直接处理，但是也有一些例外，图片就是其中之一。当你创建一张没有经过压缩的Bitmap的时候，Android的API允许你指定是否是可清除的。

```
BitmapFactory.Options = new BitmapFactory.Options();
options.inPurgeable = true;
Bitmap bitmap = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.length, options);
```
经过上面的代码处理后，可清除的Bitmap会驻留在 Ashmem 堆中。不管发生什么，垃圾回收器都不会自动回收这些 Bitmap。当 Android 绘制系统在渲染这些图片，Android 的系统库就会把这些 Bitmap 从 Ashmem 堆中抽取出来，而当渲染结束后，这些 Bitmap 又会被放回到原来的位置。如果一个被抽取的图片需要再绘制一次，系统仅仅需要把它再解码一次，这个操作非常迅速。

这听起来像一个完美的解决方案，但是问题是Bitmap解码的操作是运行在UI线程的。Bitmap解码是非常消耗CPU资源的，当消耗过大时会引起UI阻塞。因为这个原因，所以Google不推荐使用这个[特性](http://developer.android.com/intl/zh-cn/reference/android/graphics/BitmapFactory.Options.html#inPurgeable)。现在它们推荐使用另外一个特性——inBitmap。但是这个特性直到Android3.0之后才被支持。即使是这样，这个特性也不是非常有用，除非 App 里的所有图片大小都相同，这对Fackbook来说显然是不适用的。一直到4.4版本，这个限制才被移除了。但我们需要的是能够运行在 Android 2.3 - 最新版本中的通用解决方案。

##自力更生
对于上面提到的“解码操作致使 UI 假死”的问题，我们找到了一种同时使 UI 显示和内存管理都表现良好的解决方法。如果我们在 UI 线程进行渲染之前把被抽取的内存区域放回到原来的位置，并确保它再也不会被抽取，那我们就可以把这些图片放在 Ashmem 里，同时不会出现 UI 假死的问题。幸运的是，Android 的 NDK 中有一个函数可以完美地实现这个需求，名字叫做 AndroidBitmap_lockPixels。这个函数最初的目的就是：在调用 unlockPixels 再次抽取内存区域后被执行。

当我们意识到我们没有必要这样做的时候，我们取得了突破。如果我们只调用lockPixels而不调用对应的unlockPixels，那么我们就可以在Java的堆内存里面创建一个内存安全的图像，并且不会导致UI线程加载缓慢。只需要几行c++代码，我们就完美的解决了这个问题。

##用C++的思想写Java代码
就像《蜘蛛侠》里面说的：“能力越强，责任越大。”可清除的 Bitmap 既不会被垃圾回收器回收，也不会被 Ashmem 内置的清除机制处理，这使得使用它们可能会造成内存泄露。所以我们只能靠自己啦。

在c++中,通常的解决方案是建立智能指针类,实现引用计数。这些需要利用到c++的语言特性——拷贝构造函数、赋值操作符和确定的析构函数。这种语法在Java之中不存在，因为垃圾回收器能够处理这一切。所以我们必须以某种方式在Java中实现C++的这些保证机制。

我们创建了两个类去完成这件事。其中一个叫做“SharedReference”，它有addReference和deleteReference两个方法，调用者调用时必须采取基类对象或让它在范围之外。一旦引用计数器归零，资源处理(Bitmap.recycle)就会发生。

然而，很显然，让Java开发者去调用这些方法是很容易出错的。Java语言就是为了避免做这样的事情的！所以SharedReference之上,我们构建了CloseableReference类。它不仅实现了Java的Closeable接口,而且也实现了Cloneable接口。它的构造器和clone()方法会调用addReference()，而close()方法会调用deleteReference()。所以Java开发者需要遵守下面两条简单的的规则：

1. 在分配CloseableReference新对象的时候,调用.clone()。
2. 在超出作用域范围的时候，调用.close()，这通常是在finally代码块中。

这些规则可以有效地防止内存泄漏,并让我们在像Fackbook的Android客户端这种大型的Java程序中享受Native内存管理和通信。

##不仅仅是加载程序，它是一个管道
在移动设备上显示图片需要很多的步骤：
![](http://i2.tietuku.com/4480c88a0d8004bf.png)
几个优秀的开源库都是按照这个顺序执行的，比如 Picasso,Universal Image Loader,Glide和 Volley等等。上面这些开源库为Android的发展做出了非常重要的贡献。我们相信Fresco在几个重要方面会表现的更好。

我们的不同之处在于把上面的这些步骤看作是管道，而不仅仅是加载器。每一个步骤和其他方面应该是尽可能独立的，把数据和参数传递进去，然后产生一个输出，就这么简单。它应该可以做一些操作，不管是并行还是串行。一些操作只能在特性条件下才能执行。一些有特殊要求的在线程上执行。除此之外，当我们考虑改进图像的时候，所有的图片就会变得非常复杂。很多人在低网速情况下使用Facebook，我们想要这些人能够尽快的看到图片，甚至经常是在图片没有完全下载完之前。

##不要烦恼，拥抱stream
在Java中，异步代码历来都是通过Future机制来执行的。在另外的线程里面代码被提交执行，然后一个类似Future的对象可以检查执行的结果是不是已经完成了。但是，这只在假设只有一种结果的情况下行得通。在处理渐进的图像的时候，我们希望可以完整而且连续的显示结果。

我们的解决方式是定义一个更广义的Future版本，叫做DataSource。它提供了一个订阅方法，调用者必须传入一个DataSubscriber和Executor。DataSubscriber可以从DataSource获取到处理中和处理完毕的结果，并且提供了很简单的方法来区分。因为我们需要非常频繁的处理这些对象，所以必须有一个明确的close调用，幸运的是，DataSource本身就是Closeable。

在后台，每一个箱子上面都实现了一个叫做“生产者/消费者”的新框架。在这个问题是，我们是从[ReactiveX](http://reactivex.io/)获取的灵感。我们的系统拥有和[RxJava](https://github.com/ReactiveX/RxJava)相似的接口，但是更加适合移动设备，并且有内置的对Closeables的支持。

保持简单的接口。Producer只有一个叫做produceResults的方法，这个方法需要一个Consumer对象。反过来，Consumer有一个onNewResult方法。

我们使用像这样的系统把Producer联系起来。假设我们有一个producer的工作是把类型I转化为类型O，那么它看起来应该是这个样子：

```
public class OutputProducer<I, O> implements Producer<O> {

  private final Producer<I> mInputProducer;

  public OutputProducer(Producer<I> inputProducer) {
    this.mInputProducer = inputProducer;
  }

  public void produceResults(Consumer<O> outputConsumer, ProducerContext context) {
    Consumer<I> inputConsumer = new InputConsumer(outputConsumer);
    mInputProducer.produceResults(inputConsumer, context);
  }

  private static class InputConsumer implements Consumer<I> {
    private final Consumer<O> mOutputConsumer;

    public InputConsumer(Consumer<O> outputConsumer) {
      mOutputConsumer = outputConsumer;
    }

    public void onNewResult(I newResult, boolean isLast) {
      O output = doActualWork(newResult);
      mOutputConsumer.onNewResult(output, isLast);      
    }
  }
}
```

这可以使我们把非常复杂的步骤串起来，同时也可以保持他们逻辑的独立性。

##动画全覆盖
使用Facebook的人都非常喜欢Stickers，因为它可以以动画形式存储GIF和Web格式。如果支持这些格式，就需要面临新的挑战。因为每一个动画都是由不止一张图片组成的，你需要解码每一张图片，存储在内存里，然后显示出来。对于大一点的动画，把每一帧图片放在内存是不可行的。

我们建立了AnimatedDrawable,一个强大的可以呈现动画的Drawable,同时支持GIF和WebP格式。AnimatedDrawable实现标准的Android Animatable接口,所以调用者可以随意的启动或者停止动画。为了优化内存使用，如果图片足够小的时候，我们就在内存里面缓存这些图片，但是如果太大，我们可以迅速的解码这些图片。这些行为调用者是完全可控的。

所有的后台都用c++代码实现。我们保持一份解码数据和元数据解析,如宽度和高度。我们引用技术数据，它允许多个Java端的Drawables同时访问一个WebP图像。

##如何去爱你？我来告诉你...
当一张图片从网络上下载下来之后，我们想显示一张占位图。如果下载失败了，我们就会显示一个错误标志。当图片加载完之后，我们有一个渐变动画。通过使用硬件加速，我们可以按比例放缩，或者是矩阵变换成我们想要的大小然后渲染。我们不总是按照图片的中心进行放缩，那么我们可以自己定义放缩的聚焦点。有些时候，我们想显示圆角甚至是圆形的图片。所有的这些操作都应该是迅速而平滑的。

我们之前的实现是使用Android的View对象——时机到了，可以使用ImageView替换出占位的View。这个操作是非常慢的。改变View会让Android强制刷新整个布局，当用户滑动的时候，这绝对不是你想看到的效果。比较明智的做法是使用Android的Drawables,它可以迅速的被替换。

所以我们创建了Drawee。这是一个像MVC架构的图片显示框架。该模型被称为DraweeHierarchy。它被实现为Drawables的一个层，对于底层的图像而言，每一个曾都有特定的功能——成像、层叠、渐变或者是放缩。

DraweeControllers通过管道的方式连接到图像上——或者是其他的图片加载库——并且处理后台的图片操作。他们从管道接收事件并决定如何处理他们。他们控制DraweeHierarchy实际上的操作——无论是占位图片,错误条件或是完成的图片。

DraweeViews 的功能不多,但都是至关重要的。他们监听Android的View不再显示在屏幕上的系统事件。当图片离开屏幕的时候,DraweeView可以告诉DraweeController关闭使用的图像资源。这可以避免内存泄露。此外,如果它已经不在屏幕范围内的话，控制器会告诉图片管道取消网络请求。因此，像Fackbook那样滚动一长串的图片的时候，不会频繁的网络请求。

通过这些努力，显示图片的辛苦操作一去不复返了。调用代码只需要实例化一个DraweeView,然后指定一个URI和其他可选的参数就可以了。剩下的一切都会自动完成。开发人员不需要担心管理图像内存，或更新图像流。Fresco为他们把一切都做了。

##Fresco
完成这个图像显示和操作复杂的工具库之后,我们想要把它分享到Android开发者社区。我们很高兴的宣布，从今天起，这个项目已经作为[开源代码](http://github.com/facebook/fresco)了！

壁画是绘画技术,几个世纪以来一直受到世界各地人们的欢迎。我们许多伟大的艺术家使用这种名字,从意大利文艺复兴时期的大师拉斐尔到壁画艺术家斯里兰卡。我们并不是假装达到这个伟大的水平，我们真的希望Android开发者能像我们当初享受创建这个开源库的过程一样，非常享受的使用它。

##更多
[Fresco中文文档](http://fresco-cn.org/)
