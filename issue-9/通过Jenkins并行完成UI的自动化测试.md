通过Jenkins并行完成UI的自动化测试
---

> * 原文链接 : [Concurrent Android UI automation with Jenkins](http://www.hidroh.com/2015/04/14/concurrent-android-ui-automation-jenkins/)
* 原文作者 : [Ha Duy Trung](http://www.hidroh.com/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [tiiime](https://github.com/tiiime)
* 状态 :  完成




![](http://www.hidroh.com/assets/img/parallel-cover.jpg)

现在的 IT 公司会为了进入不同的市场开发相应的 App，来自同一家公司的 App 总会具有相似的 UI 逻辑，但 UI 的细节、风格又各有区分。随着产品的发展，抑或是在产品应用于新市场的过程中产生了旧 UI 逻辑的变种，用于测试所有 UI 逻辑的时间会与新 UI 的数量呈正比例关系增长。即使有 UI 的自动化框架可以用来减少测试所需的时间（例如 Calabash Android），使得每天只需要2个小时就能完成对 UI 的测试，但在这套 UI 衍生出四套“变种 UI”后，却要花费8个小时才能完成测试。

这篇博文将利用 Continuous Integration (CI) 服务，同时在不同的设备中执行 UI 测试，并介绍一种从根源上减少这种实际场景下自动化测试所需时间的方法。此外，我们的测试都是在真机上运行，而不是虚拟机。

更贴近现实的自动化测试：有很多东西只能通过真机来反映，像内存消耗，CPU 消耗：虚拟机通常都是消耗电脑的资源，而真机基本不会消耗电脑资源。

而且用真机进行测试性价比较高！Android 设备都很便宜，所以你可以在需要设备进行测试的时候毫不犹豫地买买买，如果用虚拟机测试的话，由于虚拟机会消耗很多电脑资源而且拓展电脑硬件很烧钱，这无疑会限制测试设备的数量。

虽说博文里同时使用了 Calabash Android 自动化框架 和 [Jenkins CI](https://jenkins-ci.org/)，但我提到的大部分方法可以通过运行在任意 CI 服务上的 [Android Debug Bridge (ADB)](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds#Distributedbuilds-RunningMultipleSlavesontheSameMachine) 应用于其他的自动化测试框架里。

## 创建 Jenkins slaves 和 slave group

完成[分布式构建](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds)的第一步就是创建 Jenkins slave，授权它管理多个“奴隶”。我们可以通过 Jenkins -> Manage Jenkins -> Manage Nodes 导航到 Jenkins slaves/nodes 的配置界面。

根据定义，Jenkins slave 用于完成 Jenkins 主机分发下来的任务。在我们的使用场景中，需要完成的任务则是运行在 Android 设备上的自动化测试。为了完成这项任务，所有奴隶都可以[运行在相同的机器上](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds#Distributedbuilds-RunningMultipleSlavesontheSameMachine)，也就是通过 USB 连接在电脑上的，具有执行 ADB 命令的 Android 设备。

下面是一个与 Samsung S3 关联的奴隶的安装细节：

![](http://www.hidroh.com/assets/img/parallel-slave-1.png)

当所有奴隶都运行在同一台机器上时，我建议为不同的奴隶结点提供不同的系统 roots 文件，因为它们很可能会在测试结果处被存储，如果它们指向同一个 root 文件，可能会让测试结果被不同的结点重写。我们可以通过 Remote FS root 进行这样的设置。

> **Remote FS root**

> 每个奴隶都需要拥有 Jenkins 中的一个专用目录，我们在奴隶中为其指定绝对路径，如：'/var/jenkins' 或 'c:\jenkins'，而且该路径应该是奴隶设备中的本地路径。但是该路径不需要对 Jenkins 可见，怎么正常怎么来就行。

> 奴隶不会持有重要数据（不同于最后创建于其上的项目的活跃工作区），所以你可以将奴隶的工作区设置到一个临时目录。这样做的唯一缺点在于：你可能会在奴隶设备关机后失去最新的工作区。

当 separate FS roots 和多处理器允许 Calabash 的并行操作时，ADB_DEVICE_ARG 环境变量需要用于通知 Calabash，因为 Calabash 运行的设备应该向其发送 ADB 命令，防止设备的多重连接。底层中，Calabash 通过 ADB 设备命令自动化 UI，当一个设备匹配于另一个奴隶结点，ADB_DEVICE_ARG 应该通过环境变量的配置应用到 node 结点层中，并在其后在任务层变为可用。

> **环境变量**

> 这些键值对将会应用于结点上的每一个构建，并重写任意全局值，所以他们能在 Jenkins 的配置中被使用（如 $key 或 ${key}），而且将会被添加到构建上启动的进程。
 
在 Nexus 4 中设置奴隶的方式如上

![](http://www.hidroh.com/assets/img/parallel-slave-2.png)

如果你留心注意一些细节你会发现，所有奴隶结点都被配置了相同的 android-group 标签。这样做的目的主要是将奴隶分组，使得当我们需要使用奴隶时，方便我们调用特定分组里的所有奴隶。

> 标签

> 标签（AKA 标签）用于将多个奴隶分到一个逻辑组中，而每一个标签都会消耗空间。例如 'regression java6' 将为为结点分配 'regression' 和 'java6' 标签。

> 举例来说吧，如果你有多个窗口奴隶，而且你要完成的任务需要窗口，那么你可以让你的所有窗口奴隶持有 'windows' 标签，然后将需要执行的任务与 'windows' 标签绑定。这使得你的任务在所有窗口奴隶中被执行，而不是被随意执行。

![](http://www.hidroh.com/assets/img/parallel-slave-group.png)

现在如果我们检查 android-group，我们会得到一个所有结点都带着 android-group 标签的列表，把其他设备添加到这个组里就像拷贝一个已存在的结点和更新 ADB_DEVICE_ARG 环境变量一样简单。

## 使用奴隶群建立并行任务

在进行了上面的配置以后，我们现在可以创建一个 Jenkins 任务使用连接到电脑的设备，通过各自的奴隶和具有 android-group 的奴隶群执行 Calabash Android。

![](http://www.hidroh.com/assets/img/parallel-downstream-1.png)

通过选中“如果必要的话，执行并行构建”和“限制项目运行位置”两个配置选项，使得任务可以被并行执行，主题对结点可用，仅使用标有“android-group”标签的结点。但其中的限制是：需要确保只有与已连接的设备关联的结点才能用于自动化测试，因为我们有用于完成其他任务的其他与未连接设备关联的结点。

> **如果必要的话，执行并行构建**

> 如果需要并行执行构建，Jenkins 会安排并并行执行多个构建（假设你有足够的执行器和传入的构建请求），这对于耗时长的构建和测试任务来说非常有用……此外，参数化构建也是非常实用的，因为每一个执行器的执行任务与其他执行器的执行任务相互独立。

现在假设我们有4个自动化测试的请求和三个已连接的设备，处理完所有请求将需要两轮操作（第一轮三个设备将会被使用，剩下一个请求在队列中等待处理，当某个设备变为空闲状态则会处理该请求）。这就意味着我们可以使4个产品风格自动化测试的时间从8小时减少为4小时，如果我们再买一台或者多台设备的话，时间甚至会更少。

##通过上游任务触发并行的下游任务

写到这里，我们已经能够随心所欲地对我们想要的设备（连接在 USB 端口处可用的设备！）手动地触发并行的自动化测试。但是，我们为什么要手动地完成这些工作呢？我们可以用 Jenkins Parameterized Trigger Plugin 设置上游任务，通过相应的参数触发多个下游任务。

例如，如果我们想要使用所有可用设备并行地测试多个应用 UI，那么我们可以设置一个这样的上游任务，并执行它：

![](http://www.hidroh.com/assets/img/parallel-upstream-2.png)

![](http://www.hidroh.com/assets/img/parallel-upstream-3.png)

上面的配置完成后，我们可以触发三个并行的 MOBILE_TEST 下游任务（必须进行了“如果必要的话，执行并行构建”的配置），每一个下游任务将会测试一个指定的 App 风格“cherry”，“tomato”，“rasberry”，并通过一个叫作风格的参数发送到下游任务。上游任务将会被阻塞，等待所有下游任务完成任务并因此设置构建状态。

我建议大家把上游任务运行在不同的奴隶结点/奴隶组中，而不是运行在和下游任务相同的奴隶结点/奴隶组中，否则它将占着设备不处理，浪费了资源

![](http://www.hidroh.com/assets/img/parallel-upstream-1.png)

所以从今天开始，让我们一起回收这些被淘汰的设备，让它为我们贡献最后一丝价值吧！
