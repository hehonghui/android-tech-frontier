# Android性能案例研究续集
---
> * 原文链接 : [Android Performance Case Study Follow-up](http://www.curious-creature.com/2015/03/25/android-performance-case-study-follow-up/?utm_source=Android+Weekly&utm_campaign=0692ef161b-Android_Weekly_146&utm_medium=email&utm_term=0_4eb677ad19-0692ef161b-337914749)
> * 译者 : [shenyansycn](https://github.com/shenyansycn)
> * 校对 : [Mr.Simple](https://github.com/bboyfeiyu)两年前，我发表了名为Android Performance Case Study的文章来帮助Android开发者了解什么工具和技术能被应用到识别、追踪和解决性能问题上。这篇文章的示例程序叫Falcon Pro，是由Joaquim Vergès设计和开发的一个Twitter客户端。感谢Joaquim让我以Flacon Pro为例来处理我做演示。一切都很顺利，直到Joaquim开始开发Falcon Pro 3，在发布他新的应用之前不久，Joaquim因为需要解决一个影响滚动的性能问题他联系到了我（这一次我依然没有他的源码可以参考）。Joaquim使用了所有工具来检测问题所在，但是都发现与之前猜测的原因无关。比如，他发现并不是overdraw引发问题。于是他将范围缩小到ViewPager类，他发给我如图1-1： ![image](http://androidperformance.com/images/android-performance-case-study-follow-up/falconpro3.png)     
图1-1 
Joaquim使用系统的GPU图形分析工具发现了帧速的下降。左边的截图展示了没有Viewpage的滚动性能时间轴，右边的展示了有Viewpager的时间轴（他使用2014年的Moto X获得这些数据）。这个问题根源看起来非常明显。
我的第一反应是ViewPager是不是误用了硬件加速。我们观察到的这个性能问题可能在List滚动时每一帧硬件层都被更新了。系统的 hardware layers updates debugging tool 没有提供有价值的信息。我检查了两次HierarchyViewer， 但ViewPager表现令我感到满意。（相反，我认定它不太可能出现问题）
我转而使用了另一个强大的、不常用的工具: Tracer for OpenGL。我前一篇文章解释了这个工具的更多细节。这个工具收集了所有你想知道的UI工具发送给GPU的绘画命令。
Android4.3及以前：从Android4.3我们引进了reordering and merging of drawing commands后，Tracer变得难以使用。reordering and merging of drawing commands是一个令人惊讶的有用优化，但是他阻止了来自view的组绘画命令。使用如下命令（在启动你的应用前）你可以通过关闭显示list优化来恢复旧的行为。
分析OpenGl Traces：蓝色的命令显示屏幕上绘制像素的GL操作。其他所有被用于传输数据或者设置状态命令能很容易的被忽略掉。每次你点击蓝色的命令，Tracer会更新Detail选项卡，在你点击的被执行后立即显示当前渲染对象的内容。通过一个接一个的点击，你可以重建每一帧。这几乎就是我用Trace分析性能问题的流程。了解被渲染的一帧都提供了什么。当仔细看收集到的traces时，我惊奇的发现了一些SaveLayer/ComposeLayer命令块，r如图1-2。 ![](http://androidperformance.com/images/android-performance-case-study-follow-up/glTrace.png)      
图 1-2 这些块表明创建和合成了临时性的硬件层。这些临时硬件层被不同的Canvas.saveLayer()创建。当下面的特殊条件被满足时，UI 系统调用 Canvas.saveLayer()函数来绘制视图，并且alpha值小于1：
* getAlpha() 返回一个小于1的值* onSetAlpha() 返回 false* getLayerType() 返回LAYER_TYPE_NONE* hasOverlappingRendering() 返回 true
在一些演讲中，Chet和我解释了为什么要谨慎使用alpha的原因 ( 译者注 : 关于alpha问题可以参考这篇文章 [Android Tips: Best Practices for Using Alpha](http://imid.me/blog/2014/01/17/best-practices-for-using-alpha/))。那就是每一次UI系统必须使用临时硬件层时，绘画命令发送给不同的渲染对象，对于GPU来说切换不同的渲染对象是非常耗时的操作。对于用tiling/deferred 架构的GPU是一个硬伤(例如ImaginationTech’s SGX, Qualcomm’s Adreno等等)。直接渲染架构更好在这种情况下的表现会稍微好一些，例如：Nvidia。但是Joaquim和我使用的手机都是使用了Qualcomm Adreno GPU 的Moto X 2014版，因此多个临时硬件层的使用可能是引起这个性能问题的根源。
更重要的问题是：是什么创建了这些临时层？Tracer给了我们答案。如果你看到了Tracer的截屏，你能看到仅是一组OpenGL的SaveLayer命令在一个小的渲染对象循环调用了。现在让我们看下应用截图， 如图1-3：![](http://androidperformance.com/images/android-performance-case-study-follow-up/before.png)     
图1-3
 你看到顶部的几个小圆点了么？这是ViewPager指示器，用于显示使用者的页面位置。Joaquim使用了一个第三方库来画这些指示器。当前页面的指示器是一个白色的圆点，其他页面的指示器是一个灰色的圆。我说“什么导致了它显示为灰色”，因为这些圆实际上是半透明的白色圆点。这个库中对于每一个圆都用了一个View（这本身就是浪费）并调用setAlpha()改变他们的颜色。这里有一些修复这个问题的几个解决方案：* 使用一个可定制的颜色来代替在View上设置不透明度;* 使hasOverlappingRendering()返回false，然后系统会为你设置一个适当的alpha值到画笔上；（译者注 : 对于有重叠内容的View，系统简单粗暴的使用 offscreen buffer来协助处理。当告知系统该View无重叠内容时，系统会分别使用合适的alpha值绘制每一层。）* 使onSetAlpha()返回true，并设置Paint的alpha来绘画灰色的圆。
最合适的是第二种方法，但最低支持API level 16.如果你必须支持老版本，可以使用另外两个方法中的一个。我相信Joaquim会抛弃第三方库并使用他自己的指示器。我希望这篇文章中市我们能够意识到性能问题很可能出现在看似无害的操作上。请记住：不要假设，实践出真理！ 