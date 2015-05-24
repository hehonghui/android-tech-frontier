Code Review最佳实践
====
> * 原文链接 : [Code Review Best Practices](http://kevinlondon.com/2015/05/05/code-review-best-practices.html)
* 原文作者 : [Kevin London](http://kevinlondon.com/about/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [ayyb1988](https://github.com/ayyb1988) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成


在Wiredrive上，我们做了很多的Code Review。在此之前我从来没有做过，这对于我来说是一个全新的体验，下面来总结一下在Code Review中做的事情以及说说谈论Code Review的最好方式。

简单的说，Code Review是开发者之间讨论修改代码来解决问题的过程。很多文章谈论了Code Review的诸多好处，包括知识共享，代码的质量，开发者的成长，却很少讨论审查什么、如何审查。

###审查的内容

####体系结构和代码设计

* [单一职责原则：](http://en.wikipedia.org/wiki/Single_responsibility_principle)一个类有且只能一个职责。我通常使用这个原则去衡量，如果我们必须使用“和”来描述一个方法做的事情，这可能在抽象层上出了问题。

* [开闭原则](http://en.wikipedia.org/wiki/Open/closed_principle)如果是面向对象的语言，对象对可扩展开放、对修改关闭。如果我们需要添加另外的内容会怎样？

* 代码复用：根据["三振法"](http://c2.com/cgi/wiki?ThreeStrikesAndYouRefactor),如果代码被复制一次，虽然如喜欢这种方式，但通常没什么问题。但如果再一次被复制，就应该通过提取公共的部分来重构它。

* [换位考虑](http://robertheaton.com/2014/06/20/code-review-without-your-eyes/)，如果换位考虑，这行代码是否有问题？用这种模式是否可以发现代码中的问题。

* 用更好的代码： 如果在一块混乱的代码做修改，添加几行代码也许更容易，但我建议更进一步，用比原来更好的代码。

* 潜在的bugs：是否会引起的其他错误？循环是否以我们期望的方式终止？

* 错误处理：错误确定被优雅的修改？会导致其他错误？如果这样，修改是否有用？

* 效率： 如果代码中包含算法，这种算法是否是高效？ 例如，在字典中使用迭代，遍历一个期望的值，这是一种低效的方式。


####代码风格
* 方法名： 在计算机科学中，命名是一个难题。一个函数被命名为==get_message_queue_name==，但做的却是完全不同的事情，比如从输入内容中清除html，那么这是一个不准确的命名，并且可能会误导。

* 值名：对于数据结构，==foo== or ==bar== 可能是无用的名字。相比==exception==， ==e==同样是无用的。如果需要(根据语言)尽可能详细，在重新查看代码时，那些见名知意的命名是更容易理解的。

* 函数长度： 对于一个函数的长度，我的经验值是小于20行，如果一个函数在50行以上，最好把它分成更小的函数块。


* 类的长度：我认为类的长度应该小于300行，最好在100内。把较长的类分离成独立的类，这样更容易理解类的功能。

* 文件的长度： 对于Python，一个文件最多1000行代码。任何高于此的文件应该把它分离成更小更内聚,看一下是否违背的“单一职责” 原则。
* 文档：对于复杂的函数来说，参数个数可能较多，在文档中需要指出每个参数的用处，除了那些显而易见的。

* 注释代码： 移除任何注释代码行。
* 函数参数个数：不要太多， 一般不要超过3个。。
* 可读性： 代码是否容易理解？在查看代码时要不断的停下来分析它？

####测试
* 测试的范围：我喜欢测试新功能。测试是否全面？是否涵盖了故障的情况【比如：网络，信号等，译者注】？是否容易使用？是否稳定？大多的测试？性能的快慢？
* 合乎规范的测试：当复查测试时，确保我们用适当的方式。换句话说，当我们在一个较低水平测试却要求期望的功能？Gary Bernhardt建议95％的单元测试，5％的集成测试。特别是在Django项目中，在较高的测试水平上，很容易发现意外bug，创建一个详细的测试用例，认真仔细也是很重要的。

####审查代码
在提交代码之前，我经常用git添加改变的文件/文件夹,然后通过git diff 来查看做了哪些修改。通常，我会关注如下几点：
* 是否有注释？
* 变量名是否见名知意？
* ...等上面提到的

和著名的橡皮鸭调试法（Rubber Duck Debugging）一样，每次提交前整体把自己的代码过一遍非常有帮助，尤其是看看有没有犯低级错误。


####如何进行Code Review
当Code Review时，会遇到不少问题，我也学会了如何处理，下面是一些方法：

* 提问： 这个函数是如何生效的？如果需求变更，应该做什么改变？怎么更容易维护？
* 表扬/奖励良好的做法：Code Review重要的一点是奖励开发者的成长和努力。得到别人的肯定是一件很不错的事情，我尽可能多的给人积极的评论。
* 当面讨论代替评论。 大部分情况下小组内的同事是坐在一起的，当面的 code review是非常有效的。
* 说明理由 ：是否还有跟好的方式，证明为什么这样做是好的。

####心态上
* 作为一个Developer , 不仅要Deliver working code, 还要Deliver maintable code.
* 必要时进行重构，随着项目的迭代，在计划新增功能的同时，开发要主动计划重构的工作项。
* 开放的心态，虚心接受大家的Review Comments。

####参考
一些关于clean code的书籍，如下：
* [Clean Code](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
* [Refactoring](http://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672)
* [All the Small Things by Sandi Metz](https://www.youtube.com/watch?v=8bZh5LMaSmE&index=1&list=LLlt4ZSW8NUcXLWiB3NMnK_w)
* [How to Design a Good API and Why it Matters](https://www.youtube.com/watch?v=aAb7hSCtvGw&list=LLlt4ZSW8NUcXLWiB3NMnK_w&index=48)
* [Discussion on Hacker News](https://news.ycombinator.com/item?id=9517892)

##译者注
#####一. 参考了 http://jimhuang.cn/?p=59

#####二. 国内阿里的[陈皓](http://coolshell.cn/articles/author/haoel)写的关于codereview的文章，也很有见底，推荐大家看看
######1.[Code Review中的几个提示](http://coolshell.cn/articles/1302.html)
* 先Review设计实现思路，然后Review设计模式，接着Review成形的骨干代码，最后Review完成的代码，如果程序复杂的话，需要拆成几个单元或模块分别Review
* Code Review不要太正式，而且要短
* 学会享受Code Reivew

######2.[从Code Review 谈如何做技术](http://coolshell.cn/articles/11432.html/comment-page-1#comments)

#####三. Code Review 工具
[Review Board](https://github.com/reviewboard/reviewboard)

#####四.
在Code Review时，要在 **意识** **方法** **心态** **习惯** 这几个方面上下功夫，坚持code review，相信我们会在各方面有很大的提升。
