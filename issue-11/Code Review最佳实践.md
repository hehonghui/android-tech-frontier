Code Review最佳实践
====

At Wiredrive, we do a fair amount of code reviews. I had never done one before I started here so it was a new experience for me. I think it’s a good idea to crystalize some of the things I look for when I’m doing code reviews and talk about the best way I’ve found to approach them.

Briefly, a code review is a discussion between two or more developers about changes to the code to address an issue. Many articles talk about the benefits of code reviews, including knowledge sharing, code quality, and developer growth. I’ve found fewer that talk about what to look for in a review and how to discuss code under review.

在Wiredrive上，我们做了很多的Code Review。在此之前我从来没有做过，这对于我来说是一个全新的体验。去总结在Code Review中做的事情以及说说审查的最好的方式 ，是一个好的想法。

简单的说，Code Review是开发者之间讨论修改代码来解决问题的过程。很多文章谈论了Code Review的诸多好处，包括知识共享，代码的质量，开发者的成长，却很少讨论审查什么、如何审查。

###What I look for during a review

####Architecture / Design

* [Single Responsibility Principle:](http://en.wikipedia.org/wiki/Single_responsibility_principle) The idea that a class should have one-and-only-one responsibility. Harder than one might expect. I usually apply this to methods too. If we have to use “and” to finish describing what a method is capable of doing, it might be at the wrong level of abstraction.

* [Open/Closed Principle:](http://en.wikipedia.org/wiki/Open/closed_principle) If the language is object-oriented, are the objects open for extension but closed for modification? What happens if we need to add another one of x?



* Code duplication: I go by the [“three strikes”](http://c2.com/cgi/wiki?ThreeStrikesAndYouRefactor) rule. If code is copied once, it’s usually okay although I don’t like it. If it’s copied again, it should be refactored so that the common functionality is split out.

* [Squint-test offenses:](http://robertheaton.com/2014/06/20/code-review-without-your-eyes/) If I squint my eyes, does the shape of this code look identical to other shapes? Are there patterns that might indicate other problems in the code’s structure?

* Code left in a better state than found: If I’m changing an area of the code that’s messy, it’s tempting to add in a few lines and leave. I recommend going one step further and leaving the code nicer than it was found.
* Potential bugs: Are there off-by-one errors? Will the loops terminate in the way we expect? Will they terminate at all?

* Error handling: Are errors handled gracefully and explicitly where necessary? Have custom errors been added? If so, are they useful?

* Efficiency: If there’s an algorithm in the code, is it using an efficient implementation? For example, iterating over a list of keys in a dictionary is an inefficient way to locate a desired value.


###审查的内容

####体系结构和代码设计

* [单一职责原则：](http://en.wikipedia.org/wiki/Single_responsibility_principle)一个类有且只能一个职责。这有些困难。我通常使用这个原则去衡量，如果我们必须使用“和”来描述一个方法做的事情，这可能是在抽象层有问题。

* [开闭原则](http://en.wikipedia.org/wiki/Open/closed_principle)如果是面向对象的语言，对象对可扩展开放、对修改关闭？如果我们需要添加另外的内容会怎样？

* 代码复用：根据["三振法"](http://c2.com/cgi/wiki?ThreeStrikesAndYouRefactor),如果代码被复制一次，虽然如喜欢这种方式，但通常没什么问题。如果再一次被复制，就应该通过提取公共的部分来重构它。

* [斜视测试](http://robertheaton.com/2014/06/20/code-review-without-your-eyes/)，如果斜视，这行代码的外观和正常观看是否一样？用这种模式是否可以发现代码中的问题？

* 用更好的代码： 如果在一块混乱的代码做修改，添加几行代码是更随意的，我建议更进一步，用比原来更好的代码。

* 潜在的bugs：是否会引起相关联的其他错误？循环是否以我们期望的方式终止？将会全部终止？

* 错误处理：错误被优雅的并且确且的修改？会导致其他错误？如果这样，修改是否有用？
* 效率： 如果代码中包含算法，这种算法是否是高效的实现？例如，在字典里使用迭代遍历一个期望的值，是一种低效的方式。


####Style

* Method names: Naming things is one of the hard problems in computer science. If a method is named ==get_message_queue_name== and it is actually doing something completely different like sanitizing HTML from the input, then that’s an inaccurate method name. And probably a misleading function.

* Variable names: ==foo== or ==bar== are probably not useful names for data structures. ==e== is similarly not useful when compared to ==exception==. Be as verbose as you need (depending on the language). Expressive variable names make it easier to understand code when we have to revisit it later.

* Function length: My rule of thumb is that a function should be less than 20 or so lines. If I see a method above 50, I feel it’s best that it be cut into smaller pieces.

* Class length: I think classes should be under about 300 lines total and ideally less than 100. It’s likely that large classes can be split into separate objects, which makes it easier to understand what the class is supposed to do.

* File length: For Python files, I think around 1000 lines of code is about the most we should have in one file. Anything above that is a good sign that it should be split into smaller, more focused files. As the size of a file goes up, discoverability goes down.

* Docstrings: For complex methods or those with longer lists of arguments, is there a docstring explaining what each of the arguments does, if it’s not obvious?



* Commented code: Good idea to remove any commented out lines.

* Number of method arguments: For the methods and functions, do they have 3 or fewer arguments? Greater than 3 is probably a sign that it could be grouped in a different way.

* Readability: Is the code easy to understand? Do I have to pause frequently during the review to decipher it?


####代码风格
* 方法名： 在计算机科学中，命名是一个难题。一个函数被命名为==get_message_queue_name==，但却做完全不同的事情，比如从输入内容中清除html。那么这是一个不准确的命名，并且可能会误导。

* 值名：对于数据结构，==foo== or ==bar== 可能是无用的名字。相比==exception==， ==e==同样是无用的。如果需要(根据语言)尽可能详细。在重新查看代码时，那些见名知意的命名是更容易理解的。

* 函数长度： 对于一个函数的长度，我的经验值是小于20行，如果一个函数在50行以上，最好把它分成更小的函数块。


* 类的长度：我认为类的长度应该小于300行，最好在100内。把较长的类分离成独立的对象，这样更容易理解类的功能。

* 文件的长度： 对于Python，一个文件最多1000行代码。任何高于此的文件应该把它分离成更小更内聚,看一下是否违反的“单一职责” 原则。
* 文档字符串：对于复杂的函数或者参数个数较多，文档字符串需要指出每个参数的用处，除了显而易见的。

* 注释代码： 移出任何注释代码行是个好的主意。
* 函数参数个数：不要太多， 一般不要超过3个。。
* 可读性： 代码是否容易理解？在查看代码时要不断的停下来分析它。

####Testing

* Test coverage: I like to see tests for new features. Are the tests thoughtful? Do they cover the failure conditions? Are they easy to read? How fragile are they? How big are the tests? Are they slow?

* Testing at the right level: When I review tests I’m also making sure that we’re testing them at the right level. In other words, are we as low a level as we need to be to check the expected functionality? Gary Bernhardt recommends a ratio of 95% unit tests, 5% integration tests. I find that particularly with Django projects, it’s easy to test at a high level by accident and create a slow test suite so it’s important to be vigilant.

* Number of Mocks: Mocking is great. Mocking everything is not great. I use a rule of thumb where if there’s more than 3 mocks in a test, it should be revisited. Either the test is testing too broadly or the function is too large. Maybe it doesn’t need to be tested at a unit test level and would suffice as an integration test. Either way, it’s something to discuss.

* Meets requirements: Usually as part of the end of a review, I’ll take a look at the requirements of the story, task, or bug which the work was filed against. If it doesn’t meet one of the criteria, it’s better to bounce it back before it goes to QA.

####测试
* 测试的范围：我喜欢测试新功能。测试是否全面？是否涵盖了故障的情况【比如：网络，信号等，译者注】？是否容易使用？是否稳定？大多的测试？性能的快慢？
* 适当层次的测试：当我复查测试时，确保我们在适当的层次上。换句话说，当我们在一个较低水平去要求期望的功能？Gary Bernhardt建议95％的单元测试，5％的集成测试。特别是在Django项目中，在较高的测试水平上，很容易发现意外bug，创建一个详细的测试说明，提高警惕性是很重要的。

####Review your own code first
Before submitting my code, I will often do a git add for the affected files / directories and then run a git diff --staged to examine the changes I have not yet committed. Usually I’m looking for things like:

* Did I leave a comment or TODO in?
* Does that variable name make sense?
* …and anything else that I’ve brought up above.
I want to make sure that I would pass my own code review first before I subject other people to it. It also stings less to get notes from yourself than from others :p

####审查代码
在提交代码之前，我经常用git添加改变的文件或文件夹然后通过git diff 来查看做了哪些修改。通常，我会关注如下几点：
* 是否有注释？
* 变量名是否见名知意？
* ...等上面提到的

和著名的橡皮鸭调试法（Rubber Duck Debugging）一样，每次提交前整体把自己的代码过一遍非常有帮助，尤其是看看有没有犯低级错误。

####How to handle code reviews
I find that the human parts of the code review offer as many challenges as reviewing the code. I’m still learning how to handle this part too. Here are some approaches that have worked for me when discussing code:

* Ask questions: How does this method work? If this requirement changes, what else would have to change? How could we make this more maintainable?

* Compliment / reinforce good practices: One of the most important parts of the code review is to reward developers for growth and effort. Few things feel better than getting praise from a peer. I try to offer as many positive comments as possible.

* Discuss in person for more detailed points: On occasion, a recommended architectural change might be large enough that it’s easier to discuss it in person rather than in the comments. Similarly, if I’m discussing a point and it goes back and forth, I’ll often pick it up in person and finish out the discussion.

* Explain reasoning: I find it’s best both to ask if there’s a better alternative and justify why I think it’s worth fixing. Sometimes it can feel like the changes suggested can seem nit-picky without context or explanation.

* Make it about the code: It’s easy to take notes from code reviews personally, especially if we take pride in our work. It’s best, I find, to make discussions about the code than about the developer. It lowers resistance and it’s not about the developer anyway, it’s about improving the quality of the code.

* Suggest importance of fixes: I tend to offer many suggestions, not all of which need to be acted upon. Clarifying if an item is important to fix before it can be considered done is useful both for the reviewer and the reviewee. It makes the results of a review clear and actionable.

####如何进行Code Review
当Code Review时，我发现会遇到不少挑战，我也学会了如何处理，下面是一些方法：

* 提问： 这个函数是如何生效的？如果需求变更，应该做什么改变？怎么更容易维护？
* 表扬/奖励良好的做法：Code Review重要的一点是奖励开发者的成长和努力。得到别人的肯定是一件很不错的事情，我尽可能多的给人积极的评论。
* 当面讨论代替Comments。 大部分情况下小组内的同事是坐在一起的，face to face的 code review是非常有效的。

####On mindset
* As developers, we are responsible for making both working and maintainable code. It can be easy to defer the second part because of pressure to deliver working code. Refactoring does not change functionality by design, so don’t let suggested changes discourage you. Improving the maintainability of the code can be just as important as fixing the line of code that caused the bug.

* In addition, please keep an open mind during code reviews. This is something I think everyone struggles with. I can get defensive in code reviews too, because it can feel personal when someone says code you wrote could be better.

* If the reviewer makes a suggestion, and I don’t have a clear answer as to why the suggestion should not be implemented, I’ll usually make the change. If the reviewer is asking a question about a line of code, it may mean that it would confuse others in the future. In addition, making the changes can help reveal larger architectural issues or bugs.

(Thanks to Zach Schipono for recommending this section be added)

####心态上
* 作为一个Developer , 不仅要Deliver working code, 还要Deliver maintable code.
* 必要时进行重构，随着项目的迭代，在计划新增功能的同时，开发要主动计划重构的工作项。
* 开放的心态，虚心接受大家的Review Comments。

####Addressing suggested changes
We typically leave comments on a per-line basis with some thinking behind them. Usually I will look at the review notes in Stash and, at the same time, have the code pulled up to make the suggested changes. I find that I forget what items I am supposed to address if I do not handle them right away.


####Additional References
There’s a number of books on the art of creating clean code. I’ve read through fewer of these than I might like (and I’m working to change that). Here’s a few books on my list:

* [Clean Code](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
* [Refactoring](http://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672)
Some useful, related talks I’m a big fan of talks so here’s a few that I thought of while writing this:

* [All the Small Things by Sandi Metz](https://www.youtube.com/watch?v=8bZh5LMaSmE&index=1&list=LLlt4ZSW8NUcXLWiB3NMnK_w): Covers the topic well, particularly from a perspective of writing clean, reusable code.
* [How to Design a Good API and Why it Matters](https://www.youtube.com/watch?v=aAb7hSCtvGw&list=LLlt4ZSW8NUcXLWiB3NMnK_w&index=48): API, in this sense, meaning the way in which the application is constructed and how we interact with it. Many of the points in the video talk about similar themes to those discussed here.
[Discussion on Hacker News](https://news.ycombinator.com/item?id=9517892)




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

#####四.其他关于Code Review 优秀的文章
[让 Code Review成为一种习惯](http://mp.weixin.qq.com/s?__biz=MjM5NzA1MTcyMA==&mid=205557687&idx=3&sn=627a9e51fb0bd53d039a74593c645263&scene=2&from=timeline&isappinstalled=0#rd)
