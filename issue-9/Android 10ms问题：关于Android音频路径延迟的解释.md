#Android 10ms问题：关于Android音频路径延迟的解释
---

> * 原文链接 : [Android’s 10 Millisecond Problem: The Android Audio Path Latency Explainer](http://superpowered.com/androidaudiopathlatency/#axzz3XksxvKDY)
* 作者 : [Gabor (@szantog) and Patrick (@Pv), founders of Superpowered](http://superpowered.com/)
* 译者 : [objectlife](https://github.com/objectlife) 
* 校对者:    
* 状态 : 


   许多手机应用都是非常依赖低音频功能的，比如游戏类，合成软件，DAWs(数字音频工作站)，音频交互应用和模拟乐器应用，以及即将到来的模拟现实应用，所有的这些都因为Apple平台(AppStore+IOS devices)都在得以快速发展，在App Store 和 IOS开发者身上产生的巨大收入在Android上**是不存在的**
   
   

   **Android 10ms 问题**了解的不多,但如果在android这个关键点上可以**以一种可接受的方式阻止这类应用产生**甚至发布那将是巨大的技术挑战并且将产生巨大的影响。
   
   
初创公司和开发者不原意开发那些已成功的IOS app(需要10ms音频延迟)的android版本，他们担心音频的处理结果会给他们的口碑带来负面影响以及给品牌和名声带来重重的一击。


这样会失去一部分消费者。因为他们还是非常愿意购买一些这样的android应用，有如目前在ios上的收入数据显示一样不能如愿。当有人考虑解释“下一个十亿”消费者将会成为‘mobile-only’人们会感激问题/机会的规模。



我们要解决这个问题。这篇文章以一种非常容易理解方式说明了谷歌Nexus 9Android 10毫秒问题。



###Android's 10ms问题和Android 音频路径延迟是如何影响App开发者和Android厂商的



尽管音乐类应用占IOS App Store总下裁量的3%，但是在收入方面却是位居游戏和社交类之后第三名。它表明那些在App Store/IOS devices提供低延性能的音乐应用收入不成比例。


在安卓方面。那是一个悲伤的故事。在play store音乐类应用的收入从没有挤进前5名。


绝大多数的android设备都被高声音延迟蹂躏过。阻止开发者开发应用以满足消费者的强烈需求。


同样的由于Android 10ms问题，Google和Android的开发者正在无缘于与Apple和IOS开发者共享的数十亿美元。


同款移动设备音频的输入和输出都需要某种处理，延迟是不同的。正如音乐家说的一样。我们人类对于这种10ms的延迟是非常舒适的。只要偏高就会影响我们的舒适度。


大多数的Android应用有超过100ms的音频输入延迟和超过200ms的来回(音频的输入和输出)延迟。
为你提供一个快速理解的说法，就像奥斯卡电影Whiplash中鼓手慢了半拍一样。

下面是一些与音频有关系并且正在遭受10ms延迟的蹂躏的应用。

- 音乐乐器，音效类应用：音乐家不能同时一起使用，就像用Android设备的表演家会慢半拍一样。甚至都不能用于练习。
- DJs不能表演beat-matching。作为他们耳机中的预听信号会和观众听到的信息有差距。应用起来的效果就像来回滚动并且回声也是非常困难的。
- 游戏类：声音效果，比如爆炸和枪声都会落后几帧。游戏的声音和画面产生分离感，用户体验非常不佳。不能让玩家获得身临其境的体验。
- 通讯类：比如Skype。如果两个人同时用一部高延迟的Android手机，综合来说声音延迟比网络延迟更严重。换句话说处理音频流比处理网络数据更浪费时间
- 模拟现实类：当用户转动他的头部时，声音"跟随"的慢了，破坏了这种3D音频体验，你可以下载"Paul McCartney Google Cardboard app"这个应用试一下。Google正在丧失与Apple共享数十亿美元VR机会。


为了教育和通知科技行业的leaders,应用程序开发人员、技术人员、产品经理、高管、记者、企业家、音乐家、玩家和投资者关于 Android 10ms的问题～还没有从中获取益的那些人，我们在Superpowered发表了你正在阅读的这篇问题概述提供了更简单的消化整个安卓音频链和潜在的瓶颈。

我们的目标是在Android 10ms音频延迟的挑战上我们要团结一起。此外，将其转化为促进创新，更好的用户体验，消费者从Google Play受益，Android开发者，Android的OEM厂商和整个Android生态系统的机会。

###音频延迟说明


数字音频延迟的计量有两种有用的计量单位

- Millisecond (ms)，大多数的延迟指的是这种。发生在时间上的单位
- Sample (or frame)：表示在音频流中的一个离散的数字值（数字）。Sampling是软件如何把像声波一样的连续信号转换成samples的序列。Samples是独立的音频通道的数目。对于一个信道信号，一个sample是指一个号码。对于双信道信号的一个sample装置是指两个数字等。


我们在最好的情况下计算音频信号流综合延迟

- 音频位于Android的原生层(Android NDK),并且使用Google推荐的低延迟配置。不幸得是大多的应用都没有遵循Google的低延迟推荐
- Android设备上使用适当的配置并且可以利用"Fast Mixer"路径用于输入和输出音频，除了最近的新款Nexus设备，大多数的其它厂家没有配置Android支持Fast Mixer，所以这些设备的延迟明显高于其它的设备，详情请看[ Superpowered’s Mobile Audio Census and Latency Test App](http://superpowered.com/latency)延迟在更多设备上的测试数据

###Android 5.0 Lollipop 音频路径延迟的说明


####模拟音频输入

可能有许多不同的模拟元件，比如前置放大器的内置麦克风。这些模拟​​元件可以被认为是“零延迟”，因为在这种情况下，它们的真实延迟通常是幅度低于1毫秒。

延迟:0

---

####模拟到数字转换(ADC)

音频芯片测量在预定的时间间隔输入音频流和每一次测量变换为号码。这个预定义的时间间隔被称为采样率，以Hz测量。对于大多数Android和iOS设备音频芯片而言我们的[Mobile Audio Census and Latency Test App](http://superpowered.com/latency)表明48000赫兹是本地采样率，这意味着该声频数据流进行采样48000次每秒。

因为ADC实现方式通常包含内过采样滤波器，ADC操作中通常是归为1ms延迟。

现在，该音频流已经被数字化，从这点转向现在的数字音频。数字音频几乎从未行进一个接一个，但相反，在组块中被称为“缓冲器”或“周期”。

延迟：1ms

---

####从音频芯片总线传输至音频驱动
音频芯片有几个任务。它处理ADC和DAC，互相切换或混合多个输入和输出，适用于音量调节等，它也“群体”离散数字音频样本到缓冲区并处理这些缓冲器传送给操作系统。

音频芯片被USB，PCI，火线等这样的总线连接到CPU，每个总线具有其自己的传输延迟，这取决于其内部缓冲器的大小和缓冲计数。在这里延迟为典型的1毫秒（在内部系统总线的音频芯片）至6毫秒（使用传统USB总线设置的USB声卡）。

延迟：1-6 ms

---

####音频驱动（ALSA，OSS等）
在大多数情况下，音频驱动程序使用音频芯片接收本地采样率48000赫兹的音频传入“总线缓冲区大小”的环形缓冲器。

该环形缓冲器是平滑总线传输的重要组成部分，并且将总线传输缓冲区大小与操作系统音频堆栈的缓冲区大小相“连接”。环形缓冲器在操作系统音频堆栈的缓冲中处理数据，它自然增加了一些延迟时间。

Andr​​oid是基于Linux的，并且大多数Android设备使用最流行的Linux音频驱动系统-ALSA（高级Linux声音架构）。ALSA处理环形缓冲器步骤如下：

- 音频是从“period size”的环形缓冲器消耗。
- 环形缓冲器的大小是“period size”的倍数。

例如：

- period size= 480samples。
- Period count= 2。
- 环形缓冲区的大小为480×2 = 960samples。
- 音频输入被接收到的一个period（480samples），而音频堆读取/处理的其他period（480samples）。
- 延迟为1period，480samples。相当于48000赫兹下的10毫秒。

|
|
|环形缓冲区（960samples）|
|period（480samples）period（480samples）|


一个常见的​​时期数为2，但有些系统可能偏高...

延迟：one or more periods

---

####Android的音频硬件抽象层（HAL）
该HAL作为Android的媒体服务器以及Linux音频驱动程序之间的中间人。HAL的实现是由“移植”Android到设备移动设备的制造商提供的。

实现是开放的，厂商可以自由地创建任何类型的HAL代码。使用预定义的结构与媒体服务器通信。媒体服务器装载HAL和要求用于创建具有可选优选参数，如采样速率，缓冲区大小或音频效果的输入输出流。

注意：HAL能否可以根据所述参数执行取决于媒体服务器必须“适应”HAL。

典型的HAL的实现是tinyALSA，它是用来与ALSA音频驱动程序进行通信。一些厂商认为把这块的音频实现代码进行闭源是很重要的。

在分析Android源代码库开源HAL实现的代码后，我们发现一些音频路径的配置问题以及代码的质量严重的的增加了延迟以及不必要的CPU负载           

一个好的HAL实现应该不添加任何的延迟。

延迟：0 or more samples

---

####Audio Flinger


Android的媒体服务器包括两个服务：

- AudioPolicy服务处理音频会话和权限处理，如使用或者关闭麦克风。这和iOS的“音频会话处理非常相似。
- AudioFlinger服务处理数字音频流。

Audio Flinger创建RecordThread，其作为一个应用程序和音频驱动器之间的中间人。它的基本任务是：

- 使用Android HAL从环形缓冲区驱动中获取下一个音频输入缓冲区。
- 如果应用程序请求与原生不同的采样率重新采样。
- 如果应用要求与原生不同的缓冲区大小执行额外的缓冲。

Audio Flinger有一个“fast mixer”的路径，如果Android配置了这种方式。如果用户应用程序是使用本地（Android NDK）代码，并建立与本地硬件sample rate and period size设置了音频缓冲队列，没有重采样，额外的缓冲或混合（“MixerThread”)会发生在此步骤。

RecordThread是一种“推”的工作方式，没有任何严格的同步到音频驱动程序。它试图使一个“猜测”何时唤醒和运行，但“推”的方法对放弃更加敏感。低延迟系统始终用“拉”的方式，音频驱动程序通过整个音频链“规定”音频I / O。很明显，当Android操作系统在最初构思，设计和开发时，低延迟的音频不是一个优先事项。

延迟：1 period (best case scenario)

---

####Binder
Android主要进程间通信系统的共享内存是用来传输Audio Flinger和用户应用程序之间的音频缓冲区。这是Android系统的心脏，用于Andr​​oid内部的每个地方。

延迟：0

---

####AudioRecord

现在我们处于用户应用程序的进程之中。AudioRecord实现了应用程序音频输入，这是通过OpenSL ES访问客户端库特性的示例

潜伏期：0+samples

---

####用户应用程序
最后，音频输入到达了目的地那就是用户的应用程序。

因为输入和输出线程是不一样的，一个用户应用程序必须实现线程之间的环形缓冲区。它的大小为2个periods以上（1 for 音频输入 and 1 for 音频输出），但写得不好的应用程序通常比较暴力，用更多的时间来解决CPU瓶颈。

从这一点来说，我们是我们开始回忆一下音频输出。

延迟：超过1period，近2通常（最理想的情况）

---

####AudioTrack
AudioTrack实现音频输出的用户应用程序的一面。这是通过OpenSL ES访问客户端库的特性。运行一个定期发送下一个音频缓冲区到Audio Flinger的线程。Android 4.4.4之后，AudioTrack不添加延迟的音频路径，因为它可以被设置为只使用一个缓冲区。

延迟：0+ samples

---

####Binder

同音频输入

延迟：0

---

####Audio Flinger
创建一个PlaybackThread，其工作方式为RecordThread的音频输入反向。

延迟：1周期（最理想的情况）

---

####Android audio HAL 
同音频输入

延迟:0 or more samples

---

####音频驱动（ALSA，OSS等）
音频输入与输出的工作方式一样并且使用同一个缓冲区

延迟:one or more periods

---

####从音频驱动总线传输到音频芯片
与音频输入的总线传输类似，延迟范围是典型的从1 ms到6毫秒。

延迟：1-6毫秒

---

####数字到模拟转换器（DAC）
ADC的反向，数字音频被“转换”成模拟这一点上，对于同种原因的ADC，DAC操作中通常是归为1ms延迟。。

延迟：1ms

---

####模拟音频输出

DAC的输出信号是模拟音频，但它需要额外的组件来驱动连接的设备，比如耳机。类似于模拟音频输入，模拟组件可以被认为是“零延迟”。

延迟：0

---

###Android Audio Path Latency Animation
![Alt text](http://bit.ly/1I9MKxo)

###Android的音频路径延迟案例分析：Google Nexus 9

到目前为止Nexus9在音频延迟测试中表现得最好

最好的结果是35毫秒是使用USB声卡或直接连接耳机连接器的麦克风输入和输出，一个特殊音频适配器禁用内置麦克风阵列降噪/回馈破坏功能，增加了约〜13毫秒的额外延迟。

因此，使用上述相同的模型，我们来分解一下Nexus 9的35毫秒音频延迟：

Google Nexus 9的35ms延迟是如何产生的

|COMPONENT |SAMPLES|MS|
|:--------|--------:|:--:|
|ADC||1|
|Bus||1|
|ALSA audio driver|256|5.3|
|Audio Flinger|256|5.3|
|User Application's Ring Buffer|512|10.6|
|Audio Flinger|256|5.3|
|ALSA audio driver|256|5.3|
|Bus||1|
|DAC||1|
|||Result: 	35.8|


###About Superpowered
我们的使命是扩大制造商的创造力和生产力的能力-使其更加的真实-深刻塑造他们，生产者生产出来的东西没有超音频技术是不可能的。

为此，我们正在建设的技术，解决音频瓶颈，这将解决Android的10毫秒问题。

Superpowered Audio SDK for Android and iOS is

- 跨平台：开发人员可以使用或复用相同的代码在Android，iOS和OSX。
- 速度快：它在移动设备上，为所有应用提供桌面级的加工和专业音频质量的最高性能的音频DSP。减少CPU负载来提高电池寿命和使应用更顺畅。
- “push” and “pull” audio stacks处理更好即使是离线。
- 0延迟：Superpowered的特性和处理不添加任何的延迟。使用Superpowered Audio SDK开发的应用程序在Android和IOS的低音频延迟设备上更容易的运行。

我们很乐意听取您的意见。请将你的建议、意见和问题以邮件方式发给我们。

感谢您的阅读。

-Gabor (@szantog) and Patrick (@Pv), founders of Superpowered

PS 请加入有关Android的10毫秒问题伟大的对话和[黑客新闻](https://news.ycombinator.com/item?id=9386994)。

原文链接:[http://superpowered.com/androidaudiopathlatency/#axzz3XksxvKDY](http://superpowered.com/androidaudiopathlatency/#axzz3XksxvKDY)
