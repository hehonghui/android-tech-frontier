# markdown转换教程 #

Author：[tmc9031](https://github.com/tmc9031)


## HTML转markdown ##


### WHY ###

为提高翻译效率，推荐把原文的html格式先转换为markdown格式，可以简化手工整理原文的过程

### INSTALL ###

这里介绍一款格式转换神器 [pandoc.org](http://pandoc.org)

Linux系统下的的安装

    $ sudo apt-get install pandoc

其它系统的详见官方 [installing](http://pandoc.org/installing.html)

### HOWTO ###

以下以该文章为例 [Automating Android development](https://medium.com/google-developer-experts/automating-android-development-6daca3a98396)

1. 用浏览器打开另保存为aad.html，注意保存类型选择 `网页，仅 HTML`
2. 使用pandoc工具，Linux系统下使用shell终端命令

    $ pandoc aad.html -o aad.md --from=html --to=markdown

3. 接下来打开aad.md去除一些头尾的多余部分即可开始翻译

> 注意：
> 建议在翻译过程中善用git保存转换出来的原文markdown
> 另外保留中英双语方便校对，完成后再删除英文原文
