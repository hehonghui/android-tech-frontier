#Android Studio Tips and Tricks
#Android Studio提示和技巧
> - Jan 6th, 2016

我最近参加了Goolge的[Android Dev Summit](https://androiddevsummit.withgoogle.com/)，一个工具组用于交流[Android Studio For Experts](https://www.youtube.com/watch?v=Y2GC6P5hPeA)的地方。这里都是90分钟的会议，分享了大量的Android Studio小窍门。这也让我有了分享我收藏的Android Studio小窍门的想法。

###LANGUAGE INJECTION

曾经是否需要一个JSON类型的String？可能你用一个固定的文本来做为GSON的解析器，你就应该知道管理所有的反斜杠是一个巨大的痛苦。幸运地，IntelliJ有一个叫*Language Injection*的特性，允许你在它自己的编辑器里编辑部分JSON代码，然后它会恰当的插入到你的代码中。

![Intention Action](http://michaelevans.org/images/2016/01/06/fragment_intention.png)

Inject的Language/Reference是一个intention action[^intention action]，你可以通过⌥+Return(Win:alt+Enter)启动或⌘+⇧+A(Win:ctrl+shift+A)启动并搜索到它。

![Editing JSON](http://michaelevans.org/images/2016/01/06/fragment_editor.png)

###[CHECK REGEXP](https://xkcd.com/1171/)

这非常类似于最后一个提示，但是如果你选择了一部分代码用于“RegExp”，就会显示一个便捷的测试正则表达式的浮动窗口。

![Editing Regex](http://michaelevans.org/images/2016/01/06/reg_exp_1.png)

![Valid Regex](http://michaelevans.org/images/2016/01/06/reg_exp_2.png)

![Invalid Regex](http://michaelevans.org/images/2016/01/06/reg_exp_3.png)

###SMART(ER) COMPLETION

现在我肯定你已经使用了绝大部分的代码自动完成功能。按下⌥+Space(Win:Ctrl+Space)，IntelliJ/Android Studio弹出一个用以完成类、方法、字段名的属性列表，关键字会在列表范围内。但是可曾注意到这个建议好像是依据你输入的字符，而不是表达式实际的类型？好像下边这样：

![Autocomplete](http://michaelevans.org/images/2016/01/06/basic_autocomplete.png)

好了，如果你通过按下⌥+⇧+Space(Win:Ctrl+Shift+Space)使用代码完成，你会看到一个适用于当前表达式内容的的列表。下边的例子，你只会得到用于`BufferedReader`构造函数中的返回`Reader`类型的列表。

![Better Autocomplete](http://michaelevans.org/images/2016/01/06/smart_autocomplete.png)

更酷的是，你可以在其他情况下也可以用这个快捷键，IntelliJ会通过更深入的搜索（搜索静态方法，链式表达式等等）查找到更多提供给你的选项。

![Chained Autocomplete](http://michaelevans.org/images/2016/01/06/chained_autocomplete.png)

###自定义自己的提示和技巧

另一个更酷的特性是Productivity Guide。它统计来你在IntelliJ使用情况，例如，你保存了多少按键或者痛过使用各种各样的快捷键你避免了多少可能存在的bug。也很有助于发现你可能不知道的特性；你可以滚动列表中的未使用过的特性看一看你有哪些错过了！要找到productivity guide，通过`Help -> Productivity Guide`。

![Invalid Regex](http://michaelevans.org/images/2016/01/06/productivity_guide.png)

奖金回合－仅INTELLIJ 15

你知道IntelliJ有[它自己的REST client](https://www.jetbrains.com/idea/help/testing-restful-web-services.html)？超好用的可以不用像[Paw](https://luckymarmot.com/paw)或者[Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en)来测试我们的API。

###有任何其他提示或技巧？让我知道吧！

[^intention action]: [Intention Actions](https://www.jetbrains.com/idea/help/intention-actions.html)是在弹出菜单中显示的一些允许你快速修复例如没有导入classes等错误的一些建议。