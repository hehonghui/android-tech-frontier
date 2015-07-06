# Android开发技术前线 ( android-tech-frontier )
一个定期翻译、发布国内外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目,让我们的技术跟上国际步伐。        

我们翻译的文章在能够联系到作者的情况下都会在获得作者授权后进行翻译，并且公开发布。发布的文章中都会保留原文链接、作者名，如有相关的版权协议我们也会一并附上。目前已经联系到的作者列表请参考[授权文档](authorization.md);


## 目录
* [文章分类](#category)
* [优秀推荐文章](#recommend)
* [已完成文章列表](#articles)

## 参与步骤

> 注意事项中有详细说明，这里只是简要地介绍步骤

1. 将该项目fork到自己的github;
2. 在对应期数文件夹里(例如 issue-2，代表第二期 )创建一个markdown文件，文件命名格式为: 中文标题名 （ 不要有空格，有空格的地方用"-"连接 ） ，比如 Android-MVP模式与实践.md;
3. 将模板[template.md](template.md)中的内容拷贝到你的Markdown文件中，按照模板填写、翻译完内容 （注意 : 文章所需图片请存放到图床上，不要放在仓库中,图片宽度尽量控制在400 px左右）；
4. 在 Issue 中认领未进行翻译的文章
4. 完成翻译后将状态修改为"校对中",提交pull request到本项目;
5. 管理员校对完成之后便会发布。

* [git流程简介](git简单使用教程.md)        
* [markdown语法简单教程](markdown简单教程.md)
* [git操作流程](git操作流程.md)

## 注意事项
1. 在翻译文章时，保留专有名词；
2. 在忠于原文的基础上，进行适当的意译，以适应国人阅读习惯；
3. 当翻译完成后，通读一遍，检查语句是否通顺，有无错别字等问题；
4. 原则上每篇文章都由认领人独立翻译，但如果文章很重要，且译文质量不高，那么将会由管理员指定相关人员进行翻译，最后文章将署名为 XX 和 XX 协同翻译；
5. 若译文质量无法通过审核，由译者提交上来的 pull request 将会被拒绝，希望参与翻译的译者们能够理解；
 
[参与翻译、校对的流程](翻译项目协作流程.md)

**翻译群: 399424408, Android框架设计交流群 : 413864859.**

<b id="category" ></b>
## 文章分类
|   来源    |   介绍     |
|----------|-------------|
| [AndroidWeekly](androidweekly) | 每周更新国外的技术咨询、开源库等信息[AndroidWeekly](http://androidweekly.net/) |
| [Android Blog](android-blog) | Android官方技术博客[Android Dev Blog](http://android-developers.blogspot.com/) |
| [Others](others) | 其他来源的优秀文章 |

<b id="recommend" ></b>
## 推荐文章
如果您有好的文章推荐我们翻译，请在 在[bboyfeiyu/android-tech-frontier](https://github.com/bboyfeiyu/android-tech-frontier/issues) 下提一个issue，Issue 模板: 
https://github.com/bboyfeiyu/android-tech-frontier/issues/1

* 推荐理由: `这是一篇关于XXXXXXX的优秀文章`
* 原文链接: 写明原始链接
* 标签: `推荐`, 来源，如`androidweekly`,`android-blog`等
* milestone: 设置为当月，如`2015/03`

## issue 相关注意事项
1. issue 原则上于每周日由管理员提出，但参与项目的各位如果发现了优秀的文章，而我们还没有创建相应 issue 的话，则可以提出 issue；
2. 参与者提出 issue 后需要 @管理员（如：@bboyfeiyu 我发现了一篇好文章，求审核），管理员将会对文章进行审核，审核通过后管理员会视实际情况分配翻译任务，**一般情况下会直接指定 issue 提出者进行翻译；**
3. 若参与者提出 issue 后未通过审核，却将文章翻译完成，发出了 pull request，那么文章的 pull request 将不会被处理；此外，若文章译文质量不合要求，也不会被处理；

## 翻译任务跟踪和管理

有想要翻译文章的朋友情从issue列表中选择一个翻译任务，然后在issue中添加一个评论，将自己的github账户添加到评论中( 比如 : @Mr.Simple认领该翻译任务 )，管理员会将该issue的标签设置为翻译中。翻译者及时更新翻译状态，状态通过标签跟踪:

* 待认领
* 翻译中
* 翻译完成
* 校对中
* 校对完成
* 已发布

译者翻译完成之后想本项目发布pull request，校对完成之后会合并您的提交，并且将对应的issue关闭。

## 版权信息
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />该项目下的所有作品由<a xmlns:cc="http://creativecommons.org/ns#" href="https://github.com/bboyfeiyu/android-tech-frontier" property="cc:attributionName" rel="cc:attributionURL">Android开发技术前线</a>团队翻译，采用<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议</a>进行许可。


## Android优秀学习资料
[ Android优秀学习资料整理 ](the-bad-guys/)

## 免费优秀的电子书
1. [软件架构模式 ](https://raw.githubusercontent.com/bboyfeiyu/android-tech-frontier/master/software-architecture-patterns/%E8%BD%AF%E4%BB%B6%E6%9E%B6%E6%9E%84%E6%A8%A1%E5%BC%8F.pdf)

<b id="articles" ></b>
## 已完成列表

# 2015.7.6 ( 第十七期 )
| 文章名称 |   译者  | 
|---------|--------|
| [如何使用Android-Studio把自己的Android-library分发到jCenter和Maven-Central](issue-17/如何使用Android-Studio把自己的Android-library分发到jCenter和Maven-Central.md)  | [jianghejie](https://github.com/jianghejie) 
| [Android开发III-规范与性能](issue-17/Android开发III-规范与性能.md)  | [dustookk](https://github.com/dustookk) 
| [Android中的帧动画](issue-17/Android中的帧动画.md)  | [LangleyChang](https://github.com/LangleyChang) 
| [为什么需要在你的Crash报告中使用git-SHA](issue-17/为什么需要在你的Crash报告中使用git-SHA.md)  | [sjyin](https://github.com/yinshijian-kkb) 
| [当钢铁侠变得反应更快-RxJava](issue-17/当钢铁侠变得反应更快-RxJava.md)  | [BownX](https://github.com/BownX) 
| [使用RxJava从几个数据源中加载数据](issue-17/使用RxJava从几个数据源中加载数据.md)  | [sjyin](https://github.com/yinshijian-kkb) 





# 2015.6.29 ( 第十六期 )
| 文章名称 |   译者  | 
|---------|--------|
| [手动实现布局Transitions动画-第一部分.md](issue-16/手动实现布局Transitions动画-第一部分.md)  | [Mr.Simple](https://github.com/bboyfeiyu)    
| [手动实现布局Transitions动画-第二部分](issue-16/手动实现布局Transitions动画-第一部分.md)  | [Mr.Simple](https://github.com/bboyfeiyu)
| [手动实现布局Transitions动画-第三部分](issue-16/手动实现布局Transitions动画-第一部分.md)  | [Mr.Simple](https://github.com/bboyfeiyu)      |
| [为什么你应该停止使用EventBus](issue-16/为什么你应该停止使用EventBus.md)  | [Zhaoyy](https://github.com/Zhaoyy)      |
| [结合RxJava更简单地使用SQLite](issue-16/结合RxJava更简单地使用SQLite.md)  | [tiiime](https://github.com/tiiime)      |
| [Android一体机模式：规则限制](issue-16/Android一体机模式：规则限制.md)  | [rocko](https://github.com/zhengxiaopeng)



# 2015.6.23 ( 第十五期 )
| 文章名称 |   译者  | 
|---------|--------|
| [2015-Google-IO带来的新Android开发工具.md](issue-15/2015-Google-IO带来的新Android开发工具 .md)  | [ Mario Zechner](http://robovm.com/author/mario/)      
| [Android-C++引用计数介绍](issue-15/Android-C++引用计数介绍.md)  | [Bin Chen](https://plus.google.com/+PierrChen/posts) 
| [Android-M的App-Links实现详解](issue-15/Android-M的App-Links实现详解.md)  | [jianghejie](https://github.com/jianghejie)      |
| [facebook代码分析工具-infer](issue-15/facebook代码分析工具-infer.md)  | [Mr.Simple](https://github.com/bboyfeiyu)      |
| [你可能漏掉的知识点-onResumeFragments](issue-15/你可能漏掉的知识点-onResumeFragments.md)  | [jianghejie](https://github.com/jianghejie)      |
| [如何修复编译时的MultiDex崩溃.md](issue-15/你可能漏掉的知识点-onResumeFragments.md)  | [zijianwang90](https://github.com/zijianwang90)      |

# 2015.6.12 ( 第十四期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Android-Design-Support-Library](issue-14/Android-Design-Support-Library.md)  | [MiJack](https://github.com/MiJack)      |
| [新的测试注解](issue-14/新的测试注解.md)  | [Mr.Simple](https://github.com/bboyfeiyu) 
| [Android之WebRTC介绍](issue-14/Android之WebRTC介绍.md)  | [DorisMinmin](https://github.com/DorisMinmin)      |
| [Design-Support-Library(I)-Navigation-View](issue-14/Design-Support-Library(I)-Navigation-View.md)  | [tiiime](https://github.com/tiiime)      |
| [MVVM 模式简介](issue-14/MVVM 模式简介.md)  | [chaossss](https://github.com/chaossss)      |
    |

# 2015.6.5 ( 第十三期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Square：从今天开始抛弃Fragment吧！](issue-13/Square：从今天开始抛弃Fragment吧！.md)  | [chaossss](https://github.com/chaossss)      |
| [Android进行单元测试难在哪-终](issue-13/Android进行单元测试难在哪-终.md)  | [chaossss](https://github.com/chaossss)|
| [优化android-studio编译效率的方法](issue-13/优化android-studio编译效率的方法.md)  | [FTExplore](https://github.com/FTExplore)      |
| [创建 RecyclerView LayoutManager – Part 2](issue-13/创建-RecyclerView-LayoutManager-Part-2.md)  | [tiiime](https://github.com/tiiime)|
| [创建-RecyclerView-LayoutManager-Part-3](issue-13/创建-RecyclerView-LayoutManager-Part-3.md)  | [tiiime](https://github.com/tiiime)     |
| [创建-RecyclerView-LayoutManager-Redux](issue-13/创建-RecyclerView-LayoutManager-Redux.md)  | [Mr.Simple](https://github.com/bboyfeiyu)     |



# 2015.5.31 ( 第十二期 )
| 文章名称 |   译者  | 
|---------|--------|
| [自动化Android开发](issue-12/自动化Android开发.md)  | [tmc9031](https://github.com/tmc9031)      |
| [Android进行单元测试难在哪-part4](issue-12/Android进行单元测试难在哪-part4.md)  | [chaossss](https://github.com/chaossss)|
| [当复仇者联盟遇上Dragger2、RxJava和Retrofit的巧妙结合](issue-12/当复仇者联盟遇上Dragger2、RxJava和Retrofit的巧妙结合.md)  | [Rocko](https://github.com/Rocko)      |
| [Ted Mosby - 软件架构](issue-12/MVP框架Mosby架构详解.md)  | [Mr.Simple](https://github.com/bboyfeiyu)|
| [Android自动截屏工具](issue-12/Android自动截屏工具.md)  | [sundroid](https://github.com/sundroid)     |
| [Android上MVP的介绍](issue-12/Android上MVP的介绍.md)  | [MiJack](https://github.com/MiJack)     |



# 2015.5.24 ( 第十一期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Android-Espresso测试框架介绍](issue-11/Android-Espresso测试框架介绍.md)  | [zhengxiaopeng](https://github.com/zhengxiaopeng)      |
| [Android 进行单元测试难在哪-part3](issue-11/Android进行单元测试难在哪-part3.md)  | [chaossss](https://github.com/chaossss)|
| [Code Review最佳实践](issue-11/Code Review最佳实践.md)  | [ayyb1988](https://github.com/ayyb1988)      |
| [听FaceBook工程师讲Custom-ViewGroups](issue-11/听FaceBook工程师讲Custom-ViewGroups.md)  | [objectlife](https://github.com/objectlife)|
| [详解Dagger2](issue-11/详解Dagger2.md)  | [xianjiajun](https://github.com/xianjiajun)     |



# 2015.5.17 ( 第十期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Android如何直播RTMP流](issue-10/Android如何直播RTMP流.md)  | [ayyb1988](https://github.com/ayyb1988)      |
| [Android 进行单元测试难在哪-part2](issue-10/Android进行单元测试难在哪-part2.md)  | [chaossss](https://github.com/chaossss)|
| [Kotlin-for-Android-(IV)：自定义视图和Android的扩展](issue-10/Kotlin-for-Android-(IV)：自定义视图和Android的扩展.md)  | [sundroid](https://github.com/sundroid)      |
| [使用Facebook-SDK为安卓应用添加Like按钮](issue-10/使用Facebook-SDK为安卓应用添加Like按钮.md)  | [objectlife](https://github.com/objectlife)|
| [将基于Dagger-1开发的项目迁移到Dagger-2中](issue-10/将基于Dagger-1开发的项目迁移到Dagger-2中.md)  | [chaossss](https://github.com/chaossss)     |



# 2015.5.10 ( 第九期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Android 10ms问题：关于Android音频路径延迟的解释](issue-9/Android 10ms问题：关于Android音频路径延迟的解释.md)  | [objectlife](https://github.com/objectlife)      |
| [Android进行单元测试难在哪-part1](issue-9/Android进行单元测试难在哪-part1.md)  | [chaossss](https://github.com/chaossss)|
| [NotRxJava懒人专用指南](issue-9/NotRxJava懒人专用指南.md)  | [Rocko](https://github.com/Rocko)      |
| [使用Android Studio进行单元测试](issue-9/使用Android-Studio进行单元测试.md)  | [ZhaoKaiQiang](https://github.com/ZhaoKaiQiang)|
| [通过Jenkins并行完成UI的自动化测试](issue-9/通过Jenkins并行完成UI的自动化测试.md)  | [chaossss](https://github.com/chaossss)     |
| [创建-RecyclerView-LayoutManager-Part-1](issue-9/创建-RecyclerView-LayoutManager-Part-1.md)  | [tiiime](https://github.com/tiiime)     |




# 2015.5.3 ( 第八期 )
| 文章名称 |   译者  | 
|---------|--------|
| [Android 进行单元测试难在哪-序](issue-8/Android 进行单元测试难在哪-序.md)  | [chaossss](https://github.com/chaossss)      |
| [Custom-Drawables](issue-8/Custom-Drawables.md)  | [SwinZh](https://github.com/SwinZh)      |
| [Support Libraries v22.1.0](issue-8/Support Libraries v22.1.0.md)  | [tiiime](https://github.com/tiiime)      |
| [检测Android应用的启动与关闭](issue-8/检测Android应用的启动与关闭.md)  | [xianjiajun](https://github.com/xianjiajun)      |
| [开始学习Material Design](issue-8/开始学习Material Design.md)  | [xu6148152](https://github.com/xu6148152)      |
| [如何在Android上响应各种信息通知](issue-8/如何在Android上响应各种信息通知.md)  | [MrLoong](https://github.com/MrLoong)     |



# 2015.4.26 ( 第七期 )
| 文章名称 |   译者  | 
|---------|--------|
| [使用Robolectric和Android生成代码覆盖率报告](issue-7/使用Robolectric和Android生成代码覆盖率报告)  | [normalme](https://github.com/normalme)      | 
| [Retrofit开发指南](issue-7/Retrofit开发指南)  | [yaoqinwei](https://github.com/yaoqinwei)      |   
| [Android测试框架:Dagger2+Espresso2+Mockito](issue-7/Android测试框架：Dagger2+Espresso2+Mockito)  | [yaoqinwei](https://github.com/yaoqinwei)      |   
| [在Activity中使用Thread导致的内存泄漏](issue-7/在Activity中使用Thread导致的内存泄漏)  | [chaossss](https://github.com/chaossss)      |  
| [深入浅出Android 新特性-Transition-Part-3a](issue-7/深入浅出Android新特性-Transition-Part-3a)  | [tiiime](https://github.com/tiiime)      |   
| [深入浅出Android 新特性-Transition-Part-3b](issue-7/深入浅出Android新特性-Transition-Part-3b)  | [tiiime](https://github.com/tiiime)      |  
| [Android Lollipop 5.1.1 更新](issue-7/Android-Lollipop-update.md)  | [Mr.Simple](https://github.com/bboyfeiyu) 
| [Android Support 库 22.1版](issue-7/Android-Support库22.1版.md)  | [Rocko](https://github.com/zhengxiaopeng) |     





## 2015.4.19 ( 第六期 )
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [Android性能优化系列](android-blog/Android性能优化系列)  | [胡凯](https://hukai.me)      |   [google](android-blog/Android性能优化系列/readme.md)   |
| [那些年我们错过的响应式编程](androidweekly/那些年我们错过的响应式编程)  | [yaoqinwei](https://github.com/yaoqinwei)       |   [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [深入浅出Android 新特性-Transition-Part-2](others/深入浅出Android 新特性-Transition-Part-2)  | [tiiime](https://github.com/tiiime)       |   [androiddesignpatterns.com](http://www.androiddesignpatterns.com/2014/12/activity-fragment-content-transitions-in-depth-part2.html)    |
| [Kotlin for Android (III)-扩展函数与默认值](androidweekly/Kotlin for Android (III)-扩展函数与默认值)  | [Lollypo](https://github.com/Lollypo)      |   [AndroidWeekly issue #148](http://androidweekly.net/issues/issue-148)   |
| [功能测试框架 espresso](androidweekly/功能测试框架 espresso)  | [Lollypo](https://github.com/Lollypo)      |   [AndroidWeekly issue #147](http://androidweekly.net/issues/issue-147)   |
| [如何在本地搭建一个Android应用crashing跟踪系统－ACRA](others/如何在本地搭建一个Android应用crashing跟踪系统－ACRA)  | [sundroid](https://github.com/sundroid)     |   [inthecheesefactory.com](http://inthecheesefactory.com/blog/how-to-install-and-use-acra-android/en)   |
| [实现Instagram的Material Design概念设计](others/InstaMaterial概念设计系列/实现Instagram的Material Design概念设计)  | [jianghejie](https://github.com/jianghejie)      |   [frogermcs.github.io](http://frogermcs.github.io/Instagram-with-Material-Design-concept-is-getting-real/)   |




## 2015.4.12 ( 第五期 )
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [符合Material Design的抽屉导航效果](androidweekly/符合Material Design的抽屉导航效果)  | [wly2014](https://github.com/wly2014)       |   [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [深入了解Android图形管道 第一部分](androidweekly/深入了解Android Graphics Pipeline-part-1)  |    [dupengwei](https://github.com/dupengwei)       |   [AndroidWeekly issue #147](https://blog.inovex.de/android-graphics-pipeline-from-button-to-framebuffer-part-1/)    |
| [深入了解Android图形管道 第二部分](androidweekly/深入了解Android Graphics Pipeline-part-2)  |    [chaossss](https://github.com/chaossss)       |   [AndroidWeekly issue #147](http://androidweekly.net/issues/issue-147)    |
| [Android性能案例研究续集](androidweekly/Android性能案例研究续集)  |    [shenyansycn](https://github.com/shenyansycn)       |   [AndroidWeekly issue #146](http://androidweekly.net/issues/issue-146)    |
| [安卓的模糊视图](androidweekly/安卓的模糊视图)  |    [lvtea0105](https://github.com/lvtea0105)       |   [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [Google推荐的图片加载库Glide介绍](others/Google推荐的图片加载库Glide介绍)  |    [jianghejie](https://github.com/jianghejie)       |   [inthecheesefactory.com](http://inthecheesefactory.com/blog/get-to-know-glide-recommended-by-google/en)    |



## 2015.4.8 ( 第四期 )
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [FaceBook推出的Android图片加载库-Fresco](others/FaceBook推出的Android图片加载库-Fresco)  | [ZhaoKaiQiang](https://github.com/https://github.com/ZhaoKaiQiang)       |   [code.facebook.com](https://code.facebook.com/posts/366199913563917/introducing-fresco-a-new-image-library-for-android/)    |
| [Kotlin for Android (II)创建一个工程](androidweekly/Kotlin for Android (II)创建一个工程)  | [Lollypo](https://github.com/Lollypo)       |   [AndroidWeekly issue #147](http://androidweekly.net/issues/issue-147)|
| [深入浅出Android 新特性-Transition-Part-1](others/深入浅出Android 新特性-Transition-Part-1)  | [tiiime](https://github.com/tiiime)       |   [androiddesignpatterns.com](http://www.androiddesignpatterns.com/2014/12/activity-fragment-transitions-in-android-lollipop-part1.html)|
| [在Android调试模式中使用Stetho](androidweekly/在Android调试模式中使用Stetho)  | [BillionWang](https://github.com/BillionWang)       |   [littlerobots.nl](http://littlerobots.nl/blog/stetho-for-android-debug-builds-only/)|
| [自动化截图－应用分发时的自动截图方案](others/自动化截图－应用分发时的自动截图方案)  | [chaossss](https://github.com/chaossss)       |   [flavienlaurent.com](http://flavienlaurent.com/blog/2014/12/05/screenshot_automation/)|





## 2015.4.3 ( 第三期 )
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [深入了解Bundle和Map](androidweekly/深入了解Bundle和Map)  | [yinna317](https://github.com/yinna317)       |   [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [Square 开源库Flow和Mortar的介绍](androidweekly/Square 开源库Flow和Mortar的介绍)  | [sundroid](https://github.com/sundroid)( [chaossss](https://github.com/chaossss) 协同翻译) |  [AndroidWeekly issue #142](http://androidweekly.net/issues/issue-142)  |
| [使用RxJava.Observable取代AsyncTask和AsyncTaskLoader](androidweekly/使用RxJava.Observable取代AsyncTask和AsyncTaskLoader)  | [ZhaoKaiQiang](https://github.com/ZhaoKaiQiang)       |   [AndroidWeekly issue #142](http://androidweekly.net/issues/issue-142)  |
| [上传拍下的照片、视频到服务器](others/上传拍下的照片、视频到服务器)  | [chaossss](https://github.com/chaossss)       |   [http://www.androidhive.info/](http://www.androidhive.info/2014/12/android-uploading-camera-image-video-to-server-with-progress-bar/)    |
| [简化Android的UI开发](others/简化Android的UI开发)  | [chaossss](https://github.com/chaossss)       |   [zserge.com](http://zserge.com/)    |
| [安卓字体渲染器](androidweekly/安卓字体渲染器)  | [7heaven](http://github.com/7heaven)       |   [AndroidWeekly issue #102](http://androidweekly.net/issues/issue-102)    |
| [在Android 5.0中使用JobScheduler](androidweekly/在Android%205.0中使用JobScheduler)  | [Mr.Simple](http://github.com/bboyfeiyu)       |   [AndroidWeekly issue #146](http://androidweekly.net/issues/issue-146)    |




### 2015.3.27 ( 第二期)
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [Google+ 团队的 Android UI 测试](android-blog/Google+ 团队的 Android UI 测试)  | [allenlsy](http://allelsy.com)       |   [Android Dev Blog](http://googletesting.blogspot.sg/2013/08/how-google-team-tests-mobile-apps.html)    |
| [使用Robolectric的参数化测试](androidweekly/使用Robolectric的参数化测试)  | [Lollypo](https://github.com/Lollypo)       |    [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [kotlin-for-android简介](androidweekly/kotlin-for-android简介)  | [canglangwenyue](https://github.com/canglangwenyue)       |    [AndroidWeekly issue #144](http://androidweekly.net/issues/issue-144)    |
|[ListView或者RecycleView滚动时隐藏Toolbar(1)](androidweekly/ListView或者RecycleView滚动时隐藏Toolbar-part-1)  | [chaossss](https://github.com/chaossss)       |    [AndroidWeekly issue #141](http://androidweekly.net/issues/issue-141) |  
|[ListView或者RecycleView滚动时隐藏Toolbar(2)](androidweekly/ListView或者RecycleView滚动时隐藏Toolbar-part-2)  | [chaossss](https://github.com/chaossss)       |    [AndroidWeekly issue #142](http://androidweekly.net/issues/issue-142)    |
|[让你的Android应用能使用多种主题-Part-2](androidweekly/让你的Android应用能使用多种主题-Part-2)  | [chaossss](https://github.com/chaossss)       |    [AndroidWeekly Issue#144](http://androidweekly.net/issues/issue-144)    |
| [清晰的软件架构 ( Bob大叔 )](others/清晰的软件架构)  | [zimoguo](https://github.com/zimoguo)       | [The Clean Architecture](http://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)    |



[scroll-part-1]: http://mzgreen.github.io/2015/02/15/How-to-hideshow-Toolbar-when-list-is-scroling%28part1%29/
[scroll-part-2]: http://mzgreen.github.io/2015/02/28/How-to-hideshow-Toolbar-when-list-is-scrolling(part2)

### 2015.3.22 ( 第一期)
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [一种在android中实现MVP模式的新思路](androidweekly/一种在android中实现MVP模式的新思路)  | [FTExplore](https://github.com/FTExplore)       |   [AndroidWeekly issue #144](http://blog.cainwong.com/android-mvp-an-alternate-approach/)    |
| [一种更清晰的Android架构](androidweekly/一种更清晰的Android架构)  | [Mr.Simple](https://github.com/bboyfeiyu)       |   [AndroidWeekly issue #118](http://androidweekly.net/issues/issue-118)    |
| [一个支持多设备的Android参考应用](androidweekly/一个支持多设备的Android参考应用) | [Mr.Simple](https://github.com/bboyfeiyu) |   [AndroidWeekly issue #144](http://androidweekly.net/issues/issue-144)    |
| [让你的Android应用能使用多种主题 (Part 1)](androidweekly/让你的Android应用能使用多种主题-Part-1) | [chaossss](https://github.com/chaossss) |   [AndroidWeekly issue #144](http://androidweekly.net/issues/issue-144)    |
| [欢迎来到Android多进程时代](androidweekly/欢迎来到Android多进程时代)  | [Lollypo](https://github.com/Lollypo)       |   [AndroidWeekly issue #144](http://androidweekly.net/issues/issue-144)    |
