Android圆弧整容之谜
---

> * 原文链接 : [The mysterious case of who killed arcs on Android](https://medium.com/@workingkills/the-mysterious-case-of-who-killed-arcs-on-android-9155f49166b8#.j5h3dqc5p)
* 原文作者 : [Eugenio Marletti](https://medium.com/@workingkills)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成 


愤怒。挫败。悲伤。我感受了所有的情绪，却总得到同样的结果：在 Android 系统绘制圆弧总是出现奇怪的问题，而我甚至没有修复这个问题的一点点头绪。

兴趣使然，我选择了 Android 开发工程师这份职业：每一天我都期待能在 Android 平台上创造一些很酷的东西，因为 Android 平台的开发性以及它的平台特性。

有时候，上帝总会考验你的爱，例如两周以前，我对 Android 的爱就遭遇了大危机……

我在 Clue 里工作，最近在开发 App，一般我要做的就是绘制 UI 设计的自定义图形(如下图)。虽说看起来很复杂，但再复杂的图形都能被分解，看作许多简单图形的组合，如：线，矩形，圆形，或……圆弧。

![](https://www.helloclue.com/assets/images/index/title.png)

而上帝给我考验的那一天，我需要做的就是绘制一个圆，上面有一些覆盖的圆弧；很自然的，我使用框架层提供的 Canvas.drawArc() 绘制好了。看起来很简单对吧？

然后绘制出来的东西就把我吓哭了：

![](https://cdn-images-1.medium.com/max/800/1*aT_QguKG18dUjX-wc70cdA.png)

看到没有！那些圆弧的边缘总会有一些区域是空白的，而且，如果两条圆弧的起点/长度不相同，它们的起点/终点绝对不会完美贴合在一起！

当然，作为一名老司机，一言不合我不飚车能行？于是我翻开了飚车秘籍：

1. Google 一下 (然并卵)
2. 喝口咖啡冷静一下
3. 打开/关掉硬件加速
4. 把圆弧添加到 Path 中，然后绘制出来
5. 尝试旋转 Canvan/Path
6. 再 Google 一下（然并卵）
7. 看着手机发会呆
8. 强制重启电脑/设备几次
9. 找个黑暗的小角落放声大哭吧，没想到失业这一天来得这么快……

因为以上办法都解决不了那个问题，走投无路，我猛地踩下刹车，拉拉手刹，狂打方向盘，漂移进入了源码，然后发现 Canvas.drawArc() 实际是在C/C++层对 Skia 库的调用，Skia 是 Android 用于绘制的库。研究了会 Skia，我就找到问题所在了 - Skia 不能绘制理想的圆弧，同理圆，举例来说吧 - 它只是利用贝塞尔曲线弄出近似的图形，然而效果一点也不好。

所以，大家快上车啊，老司机又要发车了：

1. 创建一个圆形的 Bitmap 对象，然后切掉不需要的部分：巨傻无比的方案，但好用的一B
2. 用 OpenGL：有点过分……
3. 继续在角落里哭

虽说下班了，但我还是忘不掉这个 Bug。于是我整个周末都在搜索和实验，直到我找到[这篇博文](http://hansmuller-flex.blogspot.de/2011/10/more-about-approximating-circular-arcs.html)，它纠正了[这篇论文](http://itc.ktu.lt/itc354/Riskus354.pdf)。简单来说，该博文解释了贝塞尔曲线为什么不能得到理想的圆弧，却能弄出近似的图形，该曲线运用地越多，近似的效果越好。此外，该博文还提供了各种等价的实现，因而拯救了角落里默默哭泣的我。

最终效果：
![](https://cdn-images-1.medium.com/max/800/1*oAVAOgwAFpUUHCpuHICRew.png)

现在我们就能得到理想的效果了，这一切都是因为爱，只有爱才能解决一切！要不然我怎么能看懂那些破论文……不过不得不说，Google 的工程师实在是太过分了，本是同根生，相煎何太急，跪求你们修复这些奇奇怪怪的 Bug 好吗！

Clue 文化中重要的一环就是：热衷分享，这也是我把本篇博文的研究以及具体的处理方法开源的原因。

假如生活欺骗了你，不要悲伤，不要心急，忧郁的日子里需要镇静。相信吧，只要你怀揣希望，尽你一切努力去找到解决 Bug 的办法，快乐的日子将会来临。只要每个程序猿都献出一份坚持，就能创造没有 Bug 的世界！

更新：

现在这个问题已经被解决了：Skia 现在支持圆锥曲线以及圆弧以这样的方式绘制了，具体的内容可以看 Skia 官方介绍以及 Chromium issue tracker。不要心急，等 Android 下一个版本更新就可以使用这些新特性了。

不过不得不说的是：我还是很希望听到其他人分享遇到类似问题的经历的，毕竟我能从中了解到，当某个人遇到这样的问题时，以什么样的反应去面对它，以及我该从哪些角度去考虑这个问题，解决这个问题。所以，如果你有类似的经历，很欢迎你联系我！