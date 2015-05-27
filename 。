# git参与写作流程

## 一、fork一份到你的个人账户下
在主仓库的右上角点击fork，将主仓库fork一份到你的个人名下。此时你就有了一份主仓库的拷贝，但是这份拷贝并不会自动与主仓库进行同步。

## 二、完成翻译任务
把你fork的仓库clone到你的本机中，然后完成相应的翻译任务。完成翻译之后先提交到本地，也就是在执行了git commit之后，此时你需要先从主仓库pull最新的数据。如果你还没有通过git remote add 添加主仓库的地址，并且将仓库命名为tech,那么你需要如下命令手动添加(以下所有的命令都是在你本地的仓库目录下)。

针对Android翻译项目 : 

```
git remote add tech git@github.com:bboyfeiyu/android-tech-frontier.git
```

针对iOS翻译项目 : 

```
git remote add tech git@github.com:bboyfeiyu/iOS-tech-frontier.git
```

## 三、从主仓库pull master分之的最新数据
添加了主仓库之后（只需添加一次）,你就可以通过如下命令从主仓库更新最新数据:     

```
git pull tech master
```
通过这个命令之后你就和主仓库的数据进行了同步，此时可能会发生冲突,冲突的原因是多个人同时修改了一个文件的同一块地方，导致git没法自动合并。可以阅读[这篇文章](http://www.cnblogs.com/sinojelly/archive/2011/08/07/2130172.html)解决冲突，解决冲突之后就可以提交到你的个人仓库。依次执行下面三个命令 : 

```
git push add .
```

```
git push commit -m "添加了xxx文章"
```

```
git push orign master
```

## 向主仓库发起pull request
将最新的数据提交到你的个人仓库之后就可以向主仓库发起pull request。此时由于你上一步已经同步了主仓库的最新数据，因此就可以自动被合并。发出pull request之后等待管理处理即可，此后注意查看邮箱状态，校对人员的校对信息会发到你的个人邮箱中。

## 校对完成，管理合并你的pull request,翻译完成

