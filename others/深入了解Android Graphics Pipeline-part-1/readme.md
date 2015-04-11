深入了解Android Graphics Pipeline-part-1
---

* 原文链接 : [Android Graphics Pipeline: From Button to Framebuffer (Part 1)](https://blog.inovex.de/android-graphics-pipeline-from-button-to-framebuffer-part-1/)
* 作者 : [mgarbe](https://blog.inovex.de/author/mgarbe/)
* 译者 : [dupengwei](https://github.com/dupengwei) 
* 校对者: [chaossss](https://github.com/chaossss)   
* 状态 :  完成 



在这个小型博文系列中我们想给有兴趣研究 Android Graphics Pipeline 内部结构的开发者带来一些启发。在此主题上，Google自己也发布了一些见解和文档，如由Chet Haase 和 Romain Guy主持的Google I/O 2012演讲[For Butter or Worse](https://www.youtube.com/watch?v=Q8m9sHdyXnE) (如果没看过就去看看吧!) 和文章 [Graphics architecture](http://source.android.com/devices/graphics/architecture.html) 。虽然这些资料肯定能帮助我们从宏观上理解一个简单的view是如何显示在屏幕上，但是当我们尝试去理解背后的源代码时，这些对我们的帮助并不大。本系列博文将带你走进Android Graphics Pipeline这个有趣的世界。

请注意，本小型系列博文中会涉及大量的源代码和序列图！它值得一读，就算你对Android Graphics Pipeline一点兴趣也没有，你也可以学到很多（或者你至少看看这些漂亮的图片）。所以给自己一杯咖啡，读吧！

## 引言

为了充分理解view显示到屏幕的过程，我们采用一个小Demo来描述Android Graphics Pipeline的每个主要阶段，由Android Java API (SDK)开始，然后是本地C++代码，最后看原始的OpenGL绘图操作。


![one-button-layout-cropped](http://img.my.csdn.net/uploads/201504/09/1428538541_6558.png)

这个 Demo 非常值得我们研究，因为这个不起眼的 App 的代码就能充分覆盖整个 Android Graphics 的内部结构，所以，它实际上是一个相当好的例子。

这个activity由一个简单 RelativeLayout，一个带应用图标和标题 ActionBar 和一个读作“Hello world!”的简单 Button 组成。

![one-button-viewhierarchy](http://img.my.csdn.net/uploads/201504/09/1428538541_8737.png)

但从上图你也可以看到，我们这个简单的 Demo 的视图层实际上是相当复杂。

在Android 视图层内部，相对布局（RelativeLayout）由一个简单的颜色渐变背景组成。更复杂的， Actionbar 由一个渐变的背景结合一个bitmap，**One Button** 文本元素和应用图标（也是一个bitmap）组成。9-Patch用作按钮的背景，文本 **Hello World!** 画在它的最上层。屏幕顶部的导航栏和底部的状态栏不属于 App 的 Activity 部分，它们由系统服务`SystemUI`进行渲染。

## Pipeline概述

如果有看过Google I/O演讲**For Butter or Worse**，你肯定认识下面的幻灯片，因为它它显示了完整的 Android Graphics Pipeline 结构。

![pipeline](http://img.my.csdn.net/uploads/201504/09/1428538607_4861.png)

上图就是在 Google 在 Google I/O 2012 大会中提供的完整的 Android Graphics Pipeline 结构。

Surface Flinger负责创建图形缓冲区并将其合成到主显示器，虽然这对应安卓系统非常重要，但是在此不作赘述。

相反，我们将注意力放在其他组件上，因为这些组件的主要任务就是将view显示到屏幕上。

![interesting_bits](http://img.my.csdn.net/uploads/201504/09/1428538541_4202.png)

## Display Lists

可能你已经知道，Android 使用一个叫做 DisplayLists 的概念去渲染所有的view。对于不知道的人来说，display list是一个绘图命令序列集合，需要执行这些命令去渲染指定的view。display lists是Android Graphics Pipeline达到高性能的重要元素。


![display-lists](http://img.my.csdn.net/uploads/201504/09/1428538540_9146.png)

每个视图层的 view 都有其对应的 display list，每个开发者都知道 `onDraw()` 方法，这个 display list 就是由 view 的 `onDraw()` 方法生成的。为了将视图层画到屏幕上，只有 display lists 需要被评估并执行。假如某个单一 view 失效（因用户输入、动画或转换），受影响的 display lists 将会重建和重绘。这就避免Android在每个frame层调用相当耗费资源的 `onDraw()`。

Display lists can also be nested, meaning that a display list can issue a command to draw a childrens display list. This is important in order to be able to reproduce view hierarchies with display lists. After all, even our simple app has multiple nested views.

Display lists 也可以被嵌套，这意味着一个Display list也可以发出一个命令绘制一个子display list。这对复制视图层的display lists来说非常重要。毕竟，即使是最简单的 App 也会具有多个嵌套视图。

这些命令的语句的可以直接映射到OpenGL命令，如翻译和设置剪辑矩阵，或更复杂的命令如`DrawText` 和 `DrawPatch`，但这些复杂命令需要相应的OpenGL命令集，不然我们也无法使用。

`An example of a display list for a button.`

`一个按钮的display list示例`

```java
Save 3
DrawPatch
Save 3
ClipRect 20.00, 4.00, 99.00, 44.00, 1
Translate 20.00, 12.00
DrawText 9, 18, 9, 0.00, 19.00, 0x17e898
Restore
RestoreToCount 0
```

在上面的示例中，你可以清楚地看到 display list 为绘制一个简单的按钮进行了什么操作。第一个操作是保存当前翻译矩阵到栈中，使得它随后可以被恢复。然后又画了9-Patch按钮，接下来是另外一个保存命令，这是必要的，因为对于要绘制的文本来说，只有绘制文本的区域才会创建裁剪矩阵。手机绘图处理器将此矩形区域当做一个线索以便在后续阶段对绘图调用进一步优化。然后将绘画圆点转换到文本位置，并绘制文本。最后，最初的转换矩阵和状态从堆中还原，裁剪矩阵也被重置。

在这篇文章的底部可以看到示例用的的display lists的完整日志。

## 深入代码

带着这些新获取的知识，我们准备深入研究代码。

### 根视图（Root View）

每个Android activity在视图层的最顶层都有一个隐式根视图（Root View），包含一个子view。这个子view是程序员在应用中定义的第一个真正的view。根视图负责调度和执行多种操作，如绘图，使view无效等等。

类似的，每个view都有一个parent的引用。视图层内部的第一个view将根视图作为parent。虽然View类作为每个可视化的元素或组件的基类，但是它并不支持任何子类。然而，其派生类ViewGroup支持多子类，并作为一个容器基类，它已经被标准布局（RelativeLayout 等等)所采用。

如果一个view局部重绘，那么该view会调用根视图的invalidateChildInParent()方法。根视图跟踪所有重绘的区域，并在choreographer调度一个新的遍历，choreographer会在下一个VSync事件执行。

![view-invalidate](http://img.my.csdn.net/uploads/201504/09/1428538608_9350.png)

ViewRoot: InvalidateChildInParent(…)

```java
public ViewParent invalidateChildInParent(int[] location, Rect dirty) {
    // Add the new dirty rect to the current one
    mDirty.union(dirty.left, dirty.top, 
                 dirty.right, dirty.bottom);
    // Already scheduled?
    if (!mWillDrawSoon) {
        scheduleTraversals();
    }
    return null;
}
```

## 创建Display Lists

As previously mentioned, each view is responsible to generate its own display list. When a VSync event is fired and the choreographer called performTraversals on the root view, the  HardwareRenderer is asked to draw the view, which in turn will ask the view to generate its display list.

正如刚刚提到的，每个view负责生产自己的display list。当一个VSync事件被触发，choreographer调用根视图的`performTraversals`方法，根视图要求`HardwareRenderer`绘制view，`HardwareRenderer`反过来要求view生成自己的display list。

![perform-traversals1](http://img.my.csdn.net/uploads/201504/09/1428538542_9748.png)

在Android framework层中，View是其中一个比较大的类，当前代码量将近20000行。这并不令人惊奇，因为它是每个小组件和应用的构建块。它处理键盘、轨迹球、触摸事件,以及滚动,滚动条,布局和测量,还有很多很多。

![view-getdisplaylist](http://img.my.csdn.net/uploads/201504/09/1428538608_4788.png)

`View.getDisplayList(…)`方法被Hardware Renderer调用时将会创建一个内部的display list，这个内部display list将会在view生命周期的剩余部分被使用。然后这个内部display list被要求提供一个足够大的画布来容纳这个view。并提供一个GLES20RecordingCanvas，所有view和它的children将会在上面绘图，然后传递给`draw(…)`方法。这个画布有点特殊，因为它不执行绘图命令，而是保存命令到display list。这意味着小组件和每个view能使用正常的绘图API，甚至无须关注display list内部的命令

`View: getDisplayList(…)`
```java
private DisplayList getDisplayList(DisplayList displayList, 
                                   boolean isLayer) {
    HardwareCanvas canvas = displayList.start(width, height);
    if (!isLayer && layerType != LAYER_TYPE_NONE) {
        // Layers don't get drawn via a display list
    } else {
        draw(canvas);
    }
    return displayList;
}
```

在`draw(…)`方法中，view将执行`onDraw()`方法的代码，渲染自己到画布上。如果这个view有任何children，children各自调用`draw()`方法。这些children可以是任何东西，可以是一个正常的按钮，也可以是一个布局或view group，这些children包含另外的children，都将被绘制。

![view-draw](http://img.my.csdn.net/uploads/201504/09/1428538608_8013.png)

## 寄语

伴随着display list的产生，part 1结束了。如果你对这系列博文有兴趣的话，请关注 part 2,届时我们会知道 display lists 将如何被呈现在屏幕上!

## 下载

The full Bachelor’s Thesis on which this article is based is available for download.

本文参考的所有学士论文可供[下载](http://mathias-garbe.de/files/introduction-android-graphics.pdf)





