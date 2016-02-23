使用Clean Architecture模型开发Android应用详细指南
---

> * 原文链接 : [A detailed guide on developing Android apps using the Clean Architecture pattern](https://medium.com/@dmilicic/a-detailed-guide-on-developing-android-apps-using-the-clean-architecture-pattern-d38d71e94029#.fmwe3kp22)
* 原文作者 : [Dario Miličić](https://medium.com/@dmilicic)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn)
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成 



### 使用Clean Architecture模型开发Android应用详细指南

自从我开始开发Android应用就有这个感觉，它可以做得更好。在我的职业生涯中我见过很多糟糕的软件设计决策，有一些是我自己的 — 安卓系统的复杂性和糟糕的软件设计是一个灾难。但重要的是从你的错误中学习并且不断完善。在搜索了大量的好的方式开发应用后我找到了**Clean Architecture**。把它应用到Android后，从类似的工程中找到一些细化和灵感，我认为这种方法是可行的并且值得分享。


这篇文章的**目标**是用Clean方法一步一步地指导开发Android应用。这个方法是我最近怎样构建我的应用客户端并取得巨大成功的。



### 什么是Clean Architecture?


我不会讲太多的细节，这里有篇文章比我解释得更好。但下一段落是你对于理解Clean需要知道的**关键所在**。


通常在Clean模型下,代码用一个**依赖规则**分离到洋葱状的层：内层不应该知道任何关于外层的东西。意思就是说**依赖应该指向里面**。


这是上一段落的可视化图形：

![](https://cdn-images-1.medium.com/max/800/1*B7LkQDyDqLN3rRSrNYkETA.jpeg)
Clean Architecture的很棒的可视化的表现。图片来自[Uncle Bob](https://blog.8thlight.com/uncle-bob/archive.html)



Clean Architecture，在提供的文章中提到可以让你的代码：

 - **框架独立**
 - **可测试**
 - **UI独立**
 - **数据库独立**
 - **所有的外部代理独立**




通过下面的例子我希望你可以理解这些特点是怎样实现的。对于Clean更详细的说明我真心推荐这篇[文章](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)和这个[视频](https://vimeo.com/43612849)。




#### 对于Android来说意味着什么


一般地，你的应用可以有任意数量的层，但除非你有企业级的业务逻辑以便适用于每个Android应用，大部分情况下会有3层：


* 外层：Implementation layer（实现层）
* 中层：Interface adapter layer（接口适配层）
* 内层：Business logic layer（业务逻辑层）


**实现层**是框架内所有具体代码出现的地方。框架的具体代码包括**你设置解决的问题但没有解决的所有代码行**，这包括所有像创建activities 和 fragments，发送intents，和别的框架代码像访问网络代码和数据库等。



**接口适配层**的目的是作为你的业务逻辑和框架具体代码之间的一个连接器。


最重要的层是**业务逻辑层**。这是构建你的应用解决你实际上想解决的问题的地方。这层不包含任何框架的具体代码并且你**应该可以不用在模拟器上运行它**。这样的话你才可以有**方便测试，开发和维护**的业务逻辑代码。这也是Clean Architecture的主要优点。


核心层上的每层，在低层可以使用它们之前负责转换模型到低层模型。内层不能有属于外层的模型类的引用。然而，外层可以使用和引用内层的模型。这是因为我们的**依赖规则**。它做了创建的开销但是有必要确保代码层之间的解耦。


> **为什么这个模型转换是必要的?** 例如，你的业务逻辑模型直接显示给用户是不合适的。也许你需要展示多个业务逻辑模型的组合。因此，我建议你创建一个ViewModel类让它更方便地展示到UI上。然后，在外层使用_converter_类转换业务模型到合适的ViewModel。

> 另一个例子可能是这样的：假设你在外部数据库层从**ContentProvider**得到一个**Cursor**对象。然后外层首先将转换它到内部业务模型，再然后发送它到你的业务逻辑层进行处理。


在文章末尾我将添加更多的资源来学习。现在我们知道了Clean Architecture的基本原则，让我们来动手敲一些代码吧。在下一部分我将给你展示怎样使用Clean构建一个功能性的例子。


### 我该怎样写Clean应用？



我已经做了一个[模板工程](https://github.com/dmilicic/Android-Clean-Boilerplate)，给你写好了所有必需的东西。它作为一个**Clean启动包**并且从一开始它就被设计建立在包含最常见的工具之上。你可以**免费**下载它，修改它和用它构建自己的应用。



你可以从这找到启动工程：[**Android Clean Boilerplate**](https://github.com/dmilicic/Android-Clean-Boilerplate)


### 编写一个新的用例



这部分将会说明在之前的部分提供的模板上面使用Clean 方法创建一个用例需要写的所有代码。一个用例只是应用的一些分离的功能。一个用例可能（用户点击等）或可能不是由用户启动。

首先，让我们解释一下这个方法的结构和术语。这就是我怎样构建应用的，但它不是固定的，如果你想的话你可以组织不同的结构。

#### 结构


Android应用程序的总体结构是这样的:


* 外层包：UI，存储，网络，等等。
* 中层包： Presenters, Converters
* 内层包：Interactors, Models, Repositories, Executor


#### 外层


刚才已经提到了，这是框架的细节所在。


**UI — ** 这是放置所有的Activities, Fragments, Adapters 和别的用户界面相关的代码。


**Storage — ** 实现访问数据和存储数据交互接口的数据库的具体代码。这包括，例如，[**ContentProviders**](http://developer.android.com/guide/topics/providers/content-providers.html)或ORM-s 如[**DBFlow**](https://github.com/Raizlabs/DBFlow)。



**Network — ** 比如像[**Retrofit**](http://square.github.io/retrofit/)。


#### 中间层


粘合用来连接实现细节和你的业务逻辑的代码层。


**Presenters — ** Presenters处理UI事件（用户点击等）和通常作为内层的回调（交互器）。


**Converters — ** Converter对象负责转换内部模型到外部模型，反之亦然。



#### 内层


核心层包含最高级的代码。**所有的类都是简单的Java对象**。这层的类和对象不知道它们运行在Android应用并且可以很容易地移植到运行JVM的任何机器。



**Interactors — ** 真实**包含你的业务逻辑代码**的类。这些类运行在后台，通过回调和上层进行通讯。它们也会在一些工程（可能是一个更好的名字）中被用例调用。在你的工程中有很多小的交互类用来解决特定的问题是很正常的。这符合**[单一职责原则](https://en.wikipedia.org/wiki/Single_responsibility_principle)**并且在我看来这更方便维护。


**Models — ** 这是你的业务模型用来操作业务逻辑。


**Repositories — ** 这个包只包含数据库或其他一些外层实现的接口。这些接口被用来通过Interactors访问和存储数据。这也被称为[repository pattern](https://msdn.microsoft.com/en-us/library/ff649690.aspx)


**Executor — ** 这个包包含通过使用一个工作线程使Interactors运行在后台的代码。这个包里面的代码通常不需要修改。


#### 简单的例子


在这个例子中，我们的需求如下：**当应用启动时，从数据库中读取出消息用来欢迎用户。** 这个示例将展示如何编写以下三个包需要的代码让用例工作：

* **presentation**包
*  **storage**包
*  **domain**包


前两个属于外层,而最后一个是内部/核心层。


**Presentation** 包负责一切在屏幕上显示的相关东西—它包含完整的[MVP](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)堆（它意味着它也包括 UI 和Presenter包即使它们属于不同的层）。


OK—费话少说，上代码。

### 写一个新的Interactor（内部/核心层）


在实际开发中你可以先写结构的任何层，但我推荐你先写你的核心业务逻辑。你可以写它，测试并在不创建activity时确保它是没问题的。


让我们先创建一个Interactor。Interactor是存放用例的主要逻辑的地方。所有的Interactors运行在后台因此这不应该对UI性能有任何的影响。创建一个名为**WelcomingInteractor**新的Interactor。

```
public interface WelcomingInteractor extends Interactor { 
 
    interface Callback { 
 
        void onMessageRetrieved(String message);
 
        void onRetrievalFailed(String error);
    } 
}
```

 **Callback**负责在主线程和UI通讯，我们把它放在Interactor的接口里因此我们不得不给它一个WelcomingInteractorCallback名称—为了和别的callback进行区分。现在让我们实现我们的获取信息的逻辑。我们有一个**MessageRepository** 可以给我们欢迎信息。

```
public interface MessageRepository { 
    String getWelcomeMessage();
}
```

让我们用我们的业务逻辑实现Interactor接口。**重要的是继承AbstractInteractor的实现需要运行在后台线程中**。

```
public class WelcomingInteractorImpl extends AbstractInteractor implements WelcomingInteractor {
    
    ...
    
    private void notifyError() {
        mMainThread.post(new Runnable() {
            @Override
            public void run() {
                mCallback.onRetrievalFailed("Nothing to welcome you with :(");
            }
        });
    }

    private void postMessage(final String msg) {
        mMainThread.post(new Runnable() {
            @Override
            public void run() {
                mCallback.onMessageRetrieved(msg);
            }
        });
    }

    @Override
    public void run() {

        // retrieve the message
        final String message = mMessageRepository.getWelcomeMessage();

        // check if we have failed to retrieve our message
        if (message == null || message.length() == 0) {

            // notify the failure on the main thread
            notifyError();

            return;
        }

        // we have retrieved our message, notify the UI on the main thread
        postMessage(message);
    }
```
WelcomingInteractor的运行方法。


这只是尝试接收信息和发送信息或错误显示到UI上。我们使用回调通知UI实际上是Presenter。这是我们业务逻辑的关键。我们需要做的别的东西依赖于框架。


让我们看看Interactor的依赖：

```
import com.kodelabs.boilerplate.domain.executor.Executor;
import com.kodelabs.boilerplate.domain.executor.MainThread;
import com.kodelabs.boilerplate.domain.interactors.WelcomingInteractor;
import com.kodelabs.boilerplate.domain.interactors.base.AbstractInteractor;
import com.kodelabs.boilerplate.domain.repository.MessageRepository;
```


正如你看到的，这**没有涉及到任何的Android代码**。这也是这个方法的**主要优点**。你可以看到**框架的独立**特点。还有，我们不关心具体的UI或数据库，我们只是调用将在外层实现的接口方法。因此，我们是**UI独立**和**数据库独立**。




###测试Interactor

我们现在可以运行测试Interactor，不用运行在模拟器上。因此让我们写一个简单的 **JUnit** 测试确保它没问题：


```
...

    @Test
    public void testWelcomeMessageFound() throws Exception {

        String msg = "Welcome, friend!";

        when(mMessageRepository.getWelcomeMessage())
                .thenReturn(msg);

        WelcomingInteractorImpl interactor = new WelcomingInteractorImpl(
            mExecutor, 
            mMainThread, 
            mMockedCallback, 
            mMessageRepository
        );
        interactor.run();

        Mockito.verify(mMessageRepository).getWelcomeMessage();
        Mockito.verifyNoMoreInteractions(mMessageRepository);
        Mockito.verify(mMockedCallback).onMessageRetrieved(msg);
    }
```



再次提醒，这个Interactor代码不知道它将会运行在Android应用中。这可以证明我们的业务逻辑是**可测试**的，这正是第二个特点。



### 编写presentation层



在Clean结构中Presentation代码属于**外层**。它由展示给用户的UI的框架依赖代码组成。当应用可见时我们将会使用**MainActivity** 类展示欢迎信息给用户。


让我们开始写**Presenter**和**View** 的接口。我们的view唯一需要做的事情就是显示欢迎信息：

```
public interface MainPresenter extends BasePresenter { 
 
    interface View extends BaseView { 
        void displayWelcomeMessage(String msg);
    } 
}
```


当应用可见时我们应该怎样和在哪进行交互呢？所有和视图完全无关的应该放到Presenter类。这个会帮助我们实现[关系分离](https://en.wikipedia.org/wiki/Separation_of_concerns)并且可以防止Activity类臃肿。


在 **MainActivity** 类我们重写了**_onResume()_** 方法：

```
@Override
protected void onResume() {
    super.onResume();
    // let's start welcome message retrieval when the app resumes
    mPresenter.resume();
}
```


所有继承BasePresenter的Presenter对象需要实现**_resume()_**方法。

>**注意**：聪明的读者可能已经看到了我在BasePresenter接口添加了Android生命周期的方法作为帮助方法，尽管Presenter在低层。它不应该知道任何关于UI层的东西—例如,它有一个生命周期。然而，当每个UI显示给用户时我并没有指定Android具体的**事件**。假如我叫它**onUIShow()** 而不是**onResume()**。是不是好多了？:)

我们在MainPresenter类的**_resume()_**方法内进行交互：

```
@Override
public void resume() {
    mView.showProgress();
    // initialize the interactor
    WelcomingInteractor interactor = new WelcomingInteractorImpl(
            mExecutor,
            mMainThread, 
            this, 
            mMessageRepository
    );
    // run the interactor
    interactor.execute();
}
```

**_execute()_**方法将只是在后台线程执行**WelcomingInteractorImpl**的**_run()_**方法。**_run()_**方法可以在**_写一个新的Interactor_** 部分看到。


你可能注意到了 Interactor 和**AsyncTask** 类有点类似。你提供它运行所需要的所有东西并且执行它。你可能会问我们为什么不使用AsyncTask？因为它是**Android特有代码** 并且你需要在模拟器上运行和测试它。

在interactor里面我们提供了几个类：



*   **ThreadExecutor**实例负责在后台线程执行交互。我通常把它弄成一个单例。这个类实际上在**domain** 包下并且不需要在外层实现。



*   **MainThreadImpl**实例负责从Interactor发送runnables 在主线程中。可以使用框架具体的代码访问主线程因此我们应该在外层实现它。


*   你可能也注意到了我们给Interactor提供了**_this_** —**MainPresenter** 是Interactor的回调对象用来通知UI事件。

*   我们提供了一个实现 **MessageRepository** 接口的**WelcomeMessageRepository**实例用来交互。稍后在**_编写存储层_**部分会覆盖**WelcomeMessageRepository**。


> **注意**：有很多东西每次都需要提供Interactor，依赖注入框架像[Dagger 2](https://github.com/google/dagger) 会有用的。为了简单起见在这里我没有包含它。实现这样一个框架是留给你的自由。

关于这一点，**MainActivity** 的**MainPresenter**实际上实现了回调接口：

```
public class MainPresenterImpl extends AbstractPresenter implements MainPresenter, WelcomingInteractor.Callback {
```


我们是怎样从Interactor监听事件的。这是**MainPresenter**的代码：

```
@Override 
public void onMessageRetrieved(String message) {
    mView.hideProgress(); 
    mView.displayWelcomeMessage(message);
} 
 
@Override 
public void onRetrievalFailed(String error) {
    mView.hideProgress(); 
    onError(error);
}
```


我们看到的这些代码段是在我们的**MainActivity**实现了这个接口：

```
public class MainActivity extends AppCompatActivity implements MainPresenter.View {
```

然后负责显示欢迎消息,如下代码所示:

```
@Override 
public void displayWelcomeMessage(String msg) {
    mWelcomeTextView.setText(msg);
}
```

并且这几乎就是表现层。

### 编写存储层


这是实现仓库的地方。所有数据库特定的代码应该放在这。仓库模型只是把数据来源给抽象了。对于数据源来说是不知道我们主业务逻辑的—来自数据库，服务器或文本文件。



对于复杂的数据可以使用[**ContentProviders**](http://developer.android.com/guide/topics/providers/content-providers.html)或ORM工具例如[**DBFlow**](https://github.com/Raizlabs/DBFlow)。如果你需要从web获取数据，可以使用[**Retrofit**](http://square.github.io/retrofit/)。如果你需要简单的键-值存储可以使用[**SharedPreferences**](http://developer.android.com/training/basics/data-storage/shared-preferences.html)。你应该使用正确的工具来完成工作。

我们的数据库并不是真正的数据库。它是一个非常简单的类做了一些模拟延时：

```
public class WelcomeMessageRepository implements MessageRepository { 
    @Override 
    public String getWelcomeMessage() {
        String msg = "Welcome, friend!"; // let's be friendly
 
        // let's simulate some network/database lag 
        try { 
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } 
 
        return msg;
    } 
}
```

我们所关心的是**WelcomingInteractor**，滞后可能由于真正的网络或其它原因。只要实现了**MessageRepository**接口，它并不关心里面是怎样实现的。

#### 总结


这个例子可以从github上进行[访问](https://github.com/dmilicic/Android-Clean-Boilerplate/tree/example)。总结了所调用的类如下：



> **MainActivity -&gt;MainPresenter -&gt; WelcomingInteractor -&gt; WelcomeMessageRepository -&gt; WelcomingInteractor -&gt; MainPresenter -&gt; MainActivity**


重要的是要注意的流程控制:

> **Outer — Mid — Core — Outer — Core — Mid — Outer**


通常在一个用例中多次访问外层。假如你需要从web上显示，存储和访问一些数据，你的控制流至少访问外层3次。


### 结论


对于我来说，目前这是开发应用的最好方式。解耦代码便于集中你的注意力在具体问题上并且不会让软件变得臃肿。毕竟，我认为这是一个相当[SOLID（可靠的）](https://en.wikipedia.org/wiki/SOLID_%28object-oriented_design%29)方法但它需要一些时间去适应。这也是我写这些的原因，通过循序渐进的例子来帮助大家更好的理解。如果还有什么不清楚我很乐意解决这些问题，你的反馈对我来说很重要。我也很想听听哪些可以改善。一个健康的讨论将有利于所有的人。

我也用Clean开发并开源了一个cost tracker应用，展示了如何看起来像一个真正的应用程序的代码。就特性而言真的没有什么创新但我认为它涵盖了我谈到的一个更复杂的例子，你可以从这找到： [**Sample Cost Tracker App**](https://github.com/dmilicic/android-clean-sample-app)


再次提醒，示例应用构建在Clean启动包之上，可以从这找到：[**Android Clean Boilerplate**](https://github.com/dmilicic/Android-Clean-Boilerplate)


### 扩展阅读



这个指南是在这篇很棒的[文章](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)之上进行了扩展。不同之处是我在例子中使用了**普通Java**并且没有添加太多重写展示这个方法。如果你想要用Clean的**RxJava**的例子可以从[这里](http://fernandocejas.com/2015/07/18/architecting-android-the-evolution/)看看。