创建-RecyclerView-LayoutManager-Redux
---

> * 原文链接 : [Building A RecyclerView LayoutManager – Redux](http://wiresareobsolete.com/2015/02/recyclerview-layoutmanager-redux/)
* 原文作者 : [Dave Smith](http://wiresareobsolete.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [Mr.Simple](https://github.com/bboyfeiyu) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成 



这篇文章是RecyclerView系列文章的结尾篇。前三部分的链接在这里 :       

* [第一部分](../issue-9/创建-RecyclerView-LayoutManager-Part-1.md)
* [第二部分](./创建-RecyclerView-LayoutManager-Part-2.md)
* [第三部分](./创建-RecyclerView-LayoutManager-Part-3.md)

当我在写这个系列的最后一篇文章，也就是关于predictIve animation的讨论时，我突然想到几个很有意思的点，并且很有讨论价值。这个系列文章以调查RecyclerView是否能够以简单的方式满足竖向、横向滚动的布局需求以及开发者要定制一个LayoutManager的难度有多大开始。这篇文章中我选择了一个基本的网格布局作为自定义layoutManager的示例。

下面这幅图展示了运用这个自定义LayoutManager到RecyclerView的滚动效果。       

![](http://i.embed.ly/1/display/resize?url=http%3A%2F%2Fwiresareobsolete.com%2Fwp-content%2Fuploads%2F2015%2F02%2FGridWindow.gif&grow=true&key=92b31102528511e1a2ec4040d3dc5c07&height=400)

## 打破常规设计

无论你打算如何组织Adapter的位置（从左到右，上到下等等）,内容视图的视角都是显示部分不连贯数据集的区域。更确切地说，在第一个和最后一个可视位置之间的Adapter区域的数据项也会在可视区域view的外面。 

这是一个很重要的点，因为它与在单轴上滚动的布局大相径庭（从而导致与当前框架下提供的默认布局背道而驰）。这些标准小工具显示，数据集是在一个连接块范围内--从第一个到最后一个可视位置之间不间断。

RecyclerView LayoutManager API会假定有一个可见的数据集合，RecyclerView LayoutManager只会显示数据集合中某个范围内可见的数据项，然后产生一个像上述所展示的网格布局一样的布局效果，这稍微有那么点挑战。在predictive animation里没有什么比这部分更加明显了。为了便于扩展，我感觉在这里指出这些毛病是非常必要的。


## 假设1 ： 从不可见区域移除一个数据项不会影响当前可见的View

当你考虑到一个Adapter移除一个数据项时LinearLayoutManager或者GridLayoutManager会做何反应时，这两个LayoutManager实际上都处理得非常好。如果被移除的数据项是可见的，一个可用的区域将会空置出来，此时就需要一个周边的View进行填充。这意味着周边显示的View必须被布局到这个位置以填补缺口。然而，并没有一个示例表明当一个移除操作执行时会发送一个隐藏视图的操作，唯一被隐藏的视图是那些被显式移除的。如果被移除的View在可见区域之外，那么对于可见区域的布局不会产生影响。在这个情况之下，你不会看到任何动画，它可能做出的修改是数据项被移到其他位置。

从上述的情况看，这与文章开头我们提到的一样，LayoutManager显示的是一个不连续的数据项。然而，这一可视区域的不连续本质使得数据项在屏幕外从可视区域内移除！换种说法，它们的位置处于第一个和最后一个位置之间，但是目前数据项view并不在布局中。这导致的结果就是，屏幕外发生的数据项移除可以并且会影响我们在布局动画处理时view的生成和消失。

在有机会对view的生成进行布局时，预布局是RecyclerView动画的关键阶段。RecyclerView通过其初始位置值将view返回，据此我们可以将内容布局在其初始状态。但是，当view移除与可视区域不相交时。RecyclerView就会通过其最终位置值将view返回。这样一来，在没有附加记账的情况下处理view的生成就变得困难得多。不过话说回来，难是难，也还是可以做到。

在上一篇文章中我们看到的FixedGridLayoutManager，我们不仅要解析可视view，还要听从onItemsRemoved()的回调来找到移除点，并妥当处理所有生成的view案例。RecyclerView确保我们在需要时，该回调会在预布局之前出现（屏幕外案例），但相反情况下会在预布局之后出现。RecyclerView这么做是为了避免这些事件与你的布局产生冲突--其时间点对我们来说只是一个美丽的意外。

我们还需要追踪的一个事实就是，可视移除会以一种我们意料之中的方式偏移view的位置，而屏幕外移除则不会。这也是为什么移除会被冠以不同类型的原因。上一篇文章忽略的一点表明，在屏幕外进行移除时，我们会对view生成逻辑提供一个手动偏移。。。所以当移除可视时，位置之间会相互匹配。

```java
private void fillGrid(int direction, int emptyLeft, int emptyTop, RecyclerView.Recycler recycler,
        boolean preLayout, SparseIntArray removedPositions) {
    …

    for (int i = 0; i < getVisibleChildCount(); i++) {
        int nextPosition = positionOfIndex(i);

        /*
         * When a removal happens out of bounds, the pre-layout positions of items
         * after the removal are shifted to their final positions ahead of schedule.
         * We have to track off-screen removals and shift those positions back
         * so we can properly lay out all current (and appearing) views in their
         * initial locations.
         */
        int offsetPositionDelta = 0;
        if (preLayout) {
            int offsetPosition = nextPosition;

            for (int offset = 0; offset < removedPositions.size(); offset++) {
                //Look for off-screen removals that are less-than this
                if (removedPositions.valueAt(offset) == REMOVE_INVISIBLE
                        && removedPositions.keyAt(offset) < nextPosition) {
                    //Offset position to match
                    offsetPosition--;
                }
            }
            offsetPositionDelta = nextPosition - offsetPosition;
            nextPosition = offsetPosition;
        }

        if (nextPosition < 0 || nextPosition >= getItemCount()) {
            //Item space beyond the data set, don't attempt to add a view
            continue;
        }

        …

        if (i % mVisibleColumnCount == (mVisibleColumnCount - 1)) {
            leftOffset = startLeftOffset;
            topOffset += mDecoratedChildHeight;

            //During pre-layout, on each column end, apply any additional appearing views
            if (preLayout) {
                layoutAppearingViews(recycler, view, nextPosition, removedPositions.size(), offsetPositionDelta);
            }
        } else {
            leftOffset += mDecoratedChildWidth;
        }
    }

    …
}
```

之后offsetPositionDelta值会作为我们在预布局中使用到的行/列位置的全局偏移被传递到layoutAppearingViews()。如果不是出于附加记账要求，这一偏移完全可以不必存在。

## 假设#2：添加新的数据项只会导致同级view的消失，而不是生成。

添加了新的数据项之后，反面为真。如果在添加时数据项为可视，那么标准布局管理器会在屏幕外推开不可视的view以便腾出空间。之前没有出现过关于这种行为会同时触发一个或多个同级view滑向可视子类位置的案例。移除也是同样的道理，在可视区域外添加数据项并不会影响可视view，所以通常来说动画也不会起作用。

对于FixedGridLayoutManager或其他任何非连贯区域的布局，在可视区域内还是可视区域外进行添加并没有多大差别。两种情况中我们都需要管理可能出现的view生成和消失。而我们在移除中使用的方案在这里则不可行，因为onItemsAdded()总是在预布局之后被调用。。。这一次我们就没那么幸运地再一次能够碰到美丽的意外了。

缺少了那次回调，关于添加数据项，我们实际上在预布局时就没有多少可做的了。这样一来就变成了布局额外的view以备不时之需，而不布局一定量的额外view就会损害性能这两种情况之间的妥协。FixedGridLayoutManager在添加数据项时不支持预测view生成。

## 一切才刚刚开始

RecyclerView APIs是一个新生事物，现有案例中还有非常多的地方需要改进的。同时，它也非常复杂，想要做对并不容易。表面上看起来RecyclerView要求大家付出的努力，背后可能大家要花10倍的精力才能实现。而且这些类型越到后面可能月蛋疼。希望正在尝试这种做法的各位同仁可以视本文为一个预警，不要盲目浪费时间，但同时我们也期待这这个框架的日渐成熟。


