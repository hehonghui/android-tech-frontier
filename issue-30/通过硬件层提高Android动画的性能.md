通过硬件层提高Android动画的性能
---

> * 原文链接 : [Using hardware layers to improve Android animation performance](http://blog.danlew.net/2015/10/20/using-hardware-layers-to-improve-animation-performance/)
* 原文作者 : [Dan Lew](http://blog.danlew.net/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss) 
* 状态 :  完成 

曾有许多人问我为什么在他们开发的应用中，动画的性能表现都很差。对于这类问题，我往往会问他们：你们有尝试过在硬件层解决动画的性能问题么？

我们都知道，在播放动画的过程中View在每一帧动画的显示时重绘自身。但如果你使用 View layer，使得View被渲染一次后就放到一个屏幕外的缓冲区中（即 layer），让View不断被重用，而不是一次又一次的重绘的话，这类动画性能问题就迎刃而解了。

此外，硬件层对图像的处理都会在GPU上进行缓存，使得我们在播放动画的过程中对View的特定操作的执行效率更高。简单的变换动画（例如平移、旋转、缩放和淡化）能够通过利用硬件加速很快被渲染出来，而大多数动画都只是这些简单动画的组合，所以我们能尝试利用硬件加速来提高这些动画的性能。

##用法

为View设置layer缓存的API比较简单：只需要调用View.setLayerType()。但我们只应该短暂地使用硬件层，因为硬件层不仅仅负责我们这一个页面的绘制（完成动画绘制后，还可能在其他地方被调用），基本流程如下：

1. 为每一个在动画过程中要被缓存的 View 调用 View.setLayerType(View.LAYER_TYPE_HARDWARE, null)
2. 运行动画
3. 当动画结束，通过 View.setLayerType(View.LAYER_TYPE_NONE, null) 结束对硬件的占用

```java
// Set the layer type to hardware 
myView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

// Setup the animation
ObjectAnimator animator = ObjectAnimator.ofFloat(myView, View.TRANSLATION_X, 150);

// Add a listener that does cleanup 
animator.addListener(new AnimatorListenerAdapter() {  
  @Override
  public void onAnimationEnd(Animator animation) {
    myView.setLayerType(View.LAYER_TYPE_NONE, null);
  }
});

// Start the animation
animator.start();  
```

如果应用的最低面向版本大于16，而且你在应用中使用了 ViewPropertyAnimator，那么你可以用更简单的 withLayer() 方法完成上面的操作：

```java
myView.animate()  
  .translationX(150)
  .withLayer()
  .start();
```

这样弄下来，你的动画就会丝般光滑了！

##注意事项

哈哈哈，你真以为那么简单吗？too young, too naive 啦！

虽说硬件加速对动画性能表现的提升会让人感觉不可思议，然而，如果你使用的姿势不对，比起动画性能的问题，它们带来的问题会让你头疼一百倍。记住我这句话，千万别滥用 layer 缓存 View！

原因很简单：

第一，在某些情况下，通过硬件加速完成的绘制任务会比普通的 View 绘制流程更复杂。使得缓存 layer 会花费更多的时间，因为整个渲染过程变成以下两个过程：1、View 绘制完成后缓存到 GPU 的 layer 中；2、GPU 将 layer 绘制到 Window 中。如果 View 的绘制过程比 GPU 将 layer 的内容绘制到 Window 中更快完成，那么就会在绘制的初始化过程中带来不必要的开销。

第二，正如所有的缓存操作，我们在这里所完成的缓存操作也会面临缓存失效的问题。任何在动画播放过程中调用 View.invalidate() 的操作都会让 layer 重绘一遍。重复地刷新会让 layer 优势全无，还不如不用，因为（就像前面提到的）硬件在设置缓存的过程中增加了不必要的开销。如果你需要不断地重新缓存内容到 layer 中，肯定会对性能造成很大的影响。

由于动画通常都有多个会变换的部分，所以这个问题很常见。假如你正设置一个动画，它具有下面三个发出变换的部分：

`
父布局：ViewGroup  
--> Child View 1 (向左平移)  
--> Child View 2 (向右平移)  
--> Child View 3 (向上平移) 
`

如果你为 ViewGroup 设置了一个单独的 layer，该 layer 就会不断地因为缓存内容的失效而不断地缓存内容，因为该 ViewGroup （把它看成一个整体）正因为它的子 View 的动画效果不断地发生变换。而每一个发生变换的子 View，只不过是完成了一个平移操作而已。在这种情况下，我们应该为每一个子 View 设置 layer，而且不要为作为父布局的 ViewGroup 设置 layer。

因为我刚开始就没有搞清楚这一点，所以我现在重申一遍：通常应该为多个 View 设置 layer 进行硬件加速，使得这些 View 不会在动画播放的过程中被刷新。

["Show hardware layers updates"](http://www.curious-creature.com/2013/09/13/optimizing-hardware-layers/) 是一个很好用的开发工具，我们能用它来检查应用是否存在刚刚我所提到的问题。只要 View 绘制了 GPU 的 layer，它就会让屏幕闪烁一次。在这篇博文的应用场景中，它应该在动画开始的时候闪烁一次（即 layer 的第一次绘制）。然而，如果 View 在动画的播放过程中始终显示整片的绿色，说明我们的代码中存在上面提到的缓存失效问题。

第三，使用硬件 layer 会占用一定的 GPU 内存，而每一个开发者最不希望看到的内存泄漏在这里就可能会发生了。所以我们应该只在必要的时候，如播放动画的过程中，使用硬件加速。

总的来说，使用硬件加速没有什么硬性的规则。事实上，Android 的绘制系统比我想象中复杂多了，在所有的性能问题中，View 的测量都是关键点。开启“显示 GPU 绘制信息”和“显示硬件刷新”这两个开发者选项能很好地帮助我们判断 layer 到底是提升还是降低了性能表现。

##Sample
我开发了一个示例 App 来教大家怎么使用基本的硬件加速，[源码在此](https://github.com/dlew/android-hw-layers-sample)。

下面是在我的 Galaxy Nexus 手机（设备有些老，而且很卡）上开启了“显示 GPU 绘制信息”选项的实际运行图：

![](http://i.imgur.com/MZaXOPS.png)

在没有开启硬件加速时，动画的性能表现真是触目惊心啊。其性能评价不断地超过绿线，让人很头疼。相反，开启了硬件加速后性能评价一直在绿线以下，这是让人很满意的。

第三张图为我们展示了动画播放过程中，layer 缓存失效带来的危害。硬件加速带来的性能提升很大一部分都被缓存失效浪费了。

(这里还有一点需要为大家解释 - 如果缓存失效了，为什么它的性能表现没有退化成第一张图那样呢？说实话我也不是特别理解其中的奥秘，但很显然是硬件层作了某种程度的优化，使得每一次重绘没有像之前那样耗费资源。即便如此，我们还是应该正确地使用硬件加速！)

一句话总结本文：硬件加速是福也是祸，所以一定要正确使用！
