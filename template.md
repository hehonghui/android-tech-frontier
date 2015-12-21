这里写中文标题
---

> * 原文链接 : [原文标题](原文url)
* 原文作者 : [作者](作者的博客或者其他社交页面)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [这里写你的github用户名](github链接) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

**注意 : 翻译完之后请认真的审核一遍有没有错字、语句通不通顺，谢谢~**


`这里是翻译原文，注意翻译时英文和译文都要留在该文档中，并且是一段英文原文下面直接跟着写译文，便于校对。如下示例 : `

Over the last months and after having friendly discussions at Tuenti with colleagues like @pedro_g_s and @flipper83 (by the way 2 badass of android development), I have decided that was a good time to write an article about architecting android applications.
The purpose of it is to show you a little approach I had in mind in the last few months plus all the stuff I have learnt from investigating and implementing it.

过去几个月以来，通过在Tuenti网站上与@pedro_g_s和@flipper83（安卓开发两位大牛）进行友好讨论之后，我决定写这篇关于架构安卓应用的文章。     

我写这篇文章的目的是想把我在过去几个月体悟到的小方法以及在调查和应用中学到的有用的东西分享给大家。

Getting Started
We know that writing quality software is hard and complex: It is not only about satisfying requirements, also should be robust, maintainable, testable, and flexible enough to adapt to growth and change. This is where “the clean architecture” comes up and could be a good approach for using when developing any software application.
The idea is simple: clean architecture stands for a group of practices that produce systems that are:

## 入门指南
大家都知道要写一款精品软件是有难度且很复杂的：不仅要满足特定要求，而且软件还必须具有稳健性，可维护、可测试性强，并且能够灵活适应各种发展与变化。这时候，“清晰架构”就应运而生了，这一架构在开发任何软件应用的时候用起来非常顺手。

这个思路很简单：简洁架构 意味着产品系统中遵循一系列的习惯原则：



