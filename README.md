# Android开发技术前线 ( android-tech-frontier )
一个定期翻译、发布国内外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目,让我们的技术跟上国际步伐。


## 目录
* [文章分类](#category)
* [优秀推荐文章](#recommend)
* [已完成文章列表](#articles)

## 参与步骤
1. 将该项目fork到自己的github;
2. 在对应分类里面创建一个文件夹，文件夹命名格式为: 中文标题名，比如Android MVP模式与实践;
3. 在该文件夹中创建readme.md(文章所需图片请存放到图床上，不要放在仓库中,图片宽度尽量控制在400 px左右);
3. 将模板[template.md](template.md)中的内容拷贝到readme.md，按照模板填写、翻译完内容,完成翻译后将状态修改为"校对中",提交pull request到本项目;
4. 管理员校对完成之后便会发布.   

[参与翻译、校对的流程](翻译项目协作流程.md)

**翻译群: 399424408, Android框架设计交流群 : 413864859.**

## 微信订阅号 ( 最新文章，及时推送，赶紧扫描关注吧！ )
![weixin](http://img.blog.csdn.net/20150320083829337)

<b id="category" />
## 文章分类
|   来源    |   介绍     |
|----------|-------------|
| [AndroidWeekly](androidweekly) | 每周更新国外的技术咨询、开源库等信息[AndroidWeekly](http://androidweekly.net/) |
| [Android Blog](android-blog) | Android官方技术博客[Android Dev Blog](http://android-developers.blogspot.com/) |
| [Others](others) | 其他来源的优秀文章 |

<b id="recommend" />
## 推荐文章
如果您有好的文章推荐我们翻译，请在 在[bboyfeiyu/android-tech-frontier](https://github.com/bboyfeiyu/android-tech-frontier/issues) 下提一个issue，Issue 模板: 
https://github.com/bboyfeiyu/android-tech-frontier/issues/1

* 推荐理由: `这是一篇关于XXXXXXX的优秀文章`
* 原文链接: 写明原始链接
* 标签: `推荐`, 来源，如`androidweekly`,`android-blog`等
* milestone: 设置为当月，如`2015/03`


## 翻译任务跟踪和管理

有想要翻译文章的朋友情从issue列表中选择一个翻译任务，然后在issue中添加一个评论，将自己的github账户添加到评论中( 比如 : @Mr.Simple认领该翻译任务 )，管理员会将该issue的标签设置为翻译中。翻译者及时更新翻译状态，状态通过标签跟踪:

* 待认领
* 翻译中
* 翻译完成
* 校对中
* 校对完成
* 已发布

译者翻译完成之后想本项目发布pull request，校对完成之后会合并您的提交，并且将对应的issue关闭。

## 免费优秀的电子书
1. [软件架构模式 ( 翻译中 )](software-architecture-patterns)

<b id="articles" />
## 已完成列表
## 2015.4.12 ( 第五期 )
| 文章名称 |   译者  |  出处  |
|---------|--------|-------|
| [符合Material Design的抽屉导航效果](androidweekly/符合Material Design的抽屉导航效果)  | [wly2014](https://github.com/wly2014)       |   [AndroidWeekly issue #145](http://androidweekly.net/issues/issue-145)    |
| [深入了解Android Graphics Pipeline-part-1](others/深入了解Android Graphics Pipeline-part-1)  |    [dupengwei](https://github.com/dupengwei)       |   [AndroidWeekly issue #147](https://blog.inovex.de/android-graphics-pipeline-from-button-to-framebuffer-part-1/)    |

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
