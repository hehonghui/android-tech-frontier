# Android开发技术前线 ( android-tech-frontier )
一个定期翻译、发布国内外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目,让我们的技术跟上国际步伐。        

我们翻译的文章在能够联系到作者的情况下都会在获得作者授权后进行翻译，并且公开发布。发布的文章中都会保留原文链接、作者名，如有相关的版权协议我们也会一并附上。目前已经联系到的作者列表请参考[授权文档](authorization.md);

---------

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

## 注意事项
1. 在翻译文章时，保留专有名词；
2. 在忠于原文的基础上，进行适当的意译，以适应国人阅读习惯；
3. 当翻译完成后，通读一遍，检查语句是否通顺，有无错别字等问题；
4. 原则上每篇文章都由认领人独立翻译，但如果文章很重要，且译文质量不高，那么将会由管理员指定相关人员进行翻译，最后文章将署名为 XX 和 XX 协同翻译；
5. 若译文质量无法通过审核，由译者提交上来的 pull request 将会被拒绝，希望参与翻译的译者们能够理解；
 
[参与翻译、校对的流程](翻译项目协作流程.md)

**翻译群: 399424408, Android技术交流群 : 413864859.**

<b id="category" ></b>
## 文章分类
|   来源    |   介绍     |
|----------|-------------|
| [AndroidWeekly](androidweekly) | 每周更新国外的技术咨询、开源库等信息[AndroidWeekly](http://androidweekly.net/) |
| [Android Blog](android-blog) | Android官方技术博客[Android Dev Blog](http://android-developers.blogspot.com/) |
| [codepath](http://guides.codepath.com/android) | Android开发优秀文章 | 
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
请移步[项目Wiki](https://github.com/bboyfeiyu/android-tech-frontier/wiki) 。
