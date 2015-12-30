如何修复编译时的MultiDex崩溃
---

> * 原文链接 : [PSA: fix MultiDex build crashes](https://medium.com/sebs-top-tips/psa-fix-multidex-build-crashes-ae2b81bcf711)
* 原文作者 : [Sebastiano Poggi](https://medium.com/@seebrock3r)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [zijianwang90](https://github.com/zijianwang90) 

[“太长不想看了”在文章末尾]

是否有那么一天，你曾经在编译你的项目时候因为以下这样的错误而失败了：
> trouble writing output:
Too many field references: 131000; max is 65536.
You may try using --multi-dex option.

为啥？也许是最新的Play服务更新造成的，又或许是你应用中的某某统计SDK造成的。但是有一点是可以肯定的：你的应用成为了拥有超过六万五千个方法或变量的应用之一。

若在一年之前，这也许是个大问题。当时有一些办法可以避免这个问题，包括一些拆分dex文件的方法，但这些方法往往并不完全奏效。

#MultiDex?
幸运的是，自从谷歌引入了**MultiDex**机制，上述情况就非常容易解决了。在你的build.gradle中做如下配置即可：
```
android {
  // ...
  defaultConfig {
    // ...
    multiDexEnabled true
  }
}
```

##缺点
**Multidex也有一些缺点**。首先，**编译时间增加**。其次，在Delvik虚拟机下（非ART），由于classloader需要读取多个dex文件，所以**应用的启动时间会大幅增加**。

但更严重的是，他有时候会造成你的**编译崩溃**。是的，编译崩溃，不是应用崩溃。
> UNEXPECTED TOP-LEVEL ERROR:
java.lang.OutOfMemoryError: GC overhead limit exceeded
  at com.android.dx.cf.code.ExecutionStack.copy(ExecutionStack.java:66)
  at com.android.dx.cf.code.Frame.makeExceptionHandlerStartFrame(Frame.java:397)
  at com.android.dx.cf.code.Ropper.processBlock(Ropper.java:916)
  at com.android.dx.cf.code.Ropper.doit(Ropper.java:742)
  at com.android.dx.cf.code.Ropper.convert(Ropper.java:349)
  at com.android.dx.dex.cf.CfTranslator.processMethods(CfTranslator.java:280)
  at com.android.dx.dex.cf.CfTranslator.translate0(CfTranslator.java:137)
  at com.android.dx.dex.cf.CfTranslator.translate(CfTranslator.java:93)
  at com.android.dx.command.dexer.Main.processClass(Main.java:729)
  at com.android.dx.command.dexer.Main.processFileBytes(Main.java:673)
  at com.android.dx.command.dexer.Main.access\$300(Main.java:83)
  at com.android.dx.command.dexer.Main$1.processFileBytes(Main.java:602)
  at com.android.dx.cf.direct.ClassPathOpener.processArchive(ClassPathOpener.java:284)
  at com.android.dx.cf.direct.ClassPathOpener.processOne(ClassPathOpener.java:166)
  at com.android.dx.cf.direct.ClassPathOpener.process(ClassPathOpener.java:144)
  at com.android.dx.command.dexer.Main.processOne(Main.java:632)
  at com.android.dx.command.dexer.Main.processAllFiles(Main.java:505)
  at com.android.dx.command.dexer.Main.runMultiDex(Main.java:334)
  at com.android.dx.command.dexer.Main.run(Main.java:244)
  at com.android.dx.command.dexer.Main.main(Main.java:215)
  at com.android.dx.command.Main.main(Main.java:106)
  
以上这些错误大致意思就是我们在生成Dex阶段内存不足了。

#解决办法（太长不想看了）
感谢那谁给我意见（不好意思忘了是谁了，时间有点久了），在绞尽脑汁了一段时间之后，我找到了一个非常简单的解决办法。

那就是在你相应module的build.gradle文件中做出如下配置：
```
android {
  // ...
  dexOptions {
    javaMaxHeapSize “2048M”
  }
}
```
搞定！
