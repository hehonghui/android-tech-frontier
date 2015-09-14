#git简单教程 (适用于参与开发技术前线)

## 1、git的安装与配置
[Git详解之一：Git起步](http://blog.jobbole.com/25775/)

## 2、参与开发技术前线的项目

1. 首先到[iOS-tech-frontier](https://github.com/bboyfeiyu/iOS-tech-frontier),将该仓库fork(右上角)到你的个人账户下，因此你首先需要注册一个github账户；
2. 用命令行进入到你的某个目录下，然后输入如下命令 : `git clone https://github.com/这里替换为你的用户名/iOS-tech-frontier`将你fork的那份克隆下来；
3. 进入到iOS-tech-frontier目录中，在对应期数的文件夹中(例如,issue-2代表第二期)创建你的文章文件，例如:swift编程指南.md，注意文件名不要有空格；
4. 按照规范翻译文章，并且保留原文，每段英文下面跟一段译文；
5. 完成翻译之后，通过如下命令提交你的工作。首先提交到本地,`git add .`,然后`git commit -m "我翻译了xxx"`,最好通过`git push origin master`将你的翻译内容提交到github上；
6. 等待提交结束之后，你的提交也只是提交到了你个人的项目中，此时你需要向主仓库发一个pull request (简称 pr ) 请求，可参考[Fork + Pull模式](http://www.worldhello.net/gotgithub/04-work-with-others/010-fork-and-pull.html)；
7. 发布pr之后管理员会安排人员进行文章校对，有问题的地方校对人员会在pr下进行评论，翻译人员确认问题之后修改问题即可；
8. 校对并且修改完之后翻译人员更新pr，管理员确认没有问题之后会合并该pr，整个翻译流程就此结束啦！

如果在这个过程中有冲突，翻译人员需要先解决冲突，可以参考[Git下的冲突解决](http://www.cnblogs.com/sinojelly/archive/2011/08/07/2130172.html)。

## 3、更详细的资料

[git - 简易指南](http://www.bootcss.com/p/git-guide/)
[pro git中文版](http://pan.baidu.com/s/1o6Hsets)