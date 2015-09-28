一个内存泄漏引发的血案-Square
---

> * 原文链接 : [A small leak will sink a great ship](https://corner.squareup.com/2015/08/a-small-leak.html)
* 原文作者 : [Pierre-Yves Ricau](corner.squareup.com)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 




在开发 LeakCanary 时我发现一处奇怪的内存泄漏，为了搞清楚到底是什么原因导致这个问题我一边 Debug，一边在邮件中和小伙伴们沟通，最后形成了这篇博文。

嫌弃篇幅太长懒的看的，概述在此：在 Android Lollipop 之前使用 AlertDialog 可能会导致内存泄漏。

##The Artist

LeakCanary 通知我存在内存泄漏：

`
* GC ROOT thread com.squareup.picasso.Dispatcher.DispatcherThread.<Java Local>
* references android.os.Message.obj
* references com.example.MyActivity$MyDialogClickListener.this$0
* leaks com.example.MyActivity.MainActivity instance
`

简单来说就是：一个 [Picasso](https://github.com/square/picasso) 线程正在站内持有一个 Message 实例的本地变量，而 Message 持有 DialogInterface.OnClickListener 的引用，而 DialogInterface.OnClickListener 又持有一个被销毁 Activity 的引用。

本地变量通常由于他们仅存在于栈内存活时间较短，当线程调用某个方法，系统就会为其分配栈帧。当方法返回，栈帧也会随之被销毁，栈内所有本地变量都会被回收。如果本地变量导致了内存泄漏，一般意味着线程要么死循环，要么阻塞了，而且线程在这种状态时持有着 Message 实例的引用。

于是 [Dimitris](https://github.com/square/picasso/graphs/contributors) 和我都去 Picasso 源码中一探究竟：

Dispatcher.DispatcherThread 是一个简单的 HandlerThread：

```java
static class DispatcherThread extends HandlerThread {
  DispatcherThread() {
    super(Utils.THREAD_PREFIX + DISPATCHER_THREAD_NAME, THREAD_PRIORITY_BACKGROUND);
  }
}
```

这个线程用标准的方式通过 Handler 接收 Message：

```java
private static class DispatcherHandler extends Handler {
  private final Dispatcher dispatcher;

  public DispatcherHandler(Looper looper, Dispatcher dispatcher) {
    super(looper);
    this.dispatcher = dispatcher;
  }

  @Override public void handleMessage(final Message msg) {
    switch (msg.what) {
      case REQUEST_SUBMIT: {
        Action action = (Action) msg.obj;
        dispatcher.performSubmit(action);
        break;
      }
      // ... handles other types of messages
    }
  }
}
```

显然 `Dispatcher.DispatcherHandler.handleMessage()` 里面没有明显会让本地变量持有 Message 引用的 Bug。

##Queue Tips

Let's look at how HandlerThread works:

后来越来越多内存泄漏的通知出现了，这些通知不仅仅来自 Picasso，各种各样线程中的本地变量都存在内存泄漏，而且这些内存泄漏往往和 Dialog 的 OnClickListener 有关。发生内存泄漏的线程有一个共同的特性：他们都是工作者线程，而且通过某种阻塞队列接收各自的工作。

```java
for (;;) {
    Message msg = queue.next(); // might block
    if (msg == null) {
        return;
    }
    msg.target.dispatchMessage(msg);
    msg.recycleUnchecked();
}
```

通过源码可以发现，肯定存在本地变量持有 Message 的引用，然而它的生命周期本应很短，而且在循环结束时被清除。

我们尝试通过利用阻塞队列实现一个简单的工作者线程来重现这个 Bug，它只发送一个 Message：

```java
static class MyMessage {
  final String message;
  MyMessage(String message) {
    this.message = message;
  }
}

static void startThread() {
  final BlockingQueue<MyMessage> queue = new LinkedBlockingQueue<>();
  MyMessage message = new MyMessage("Hello Leaking World");
  queue.offer(message);
  new Thread() {
    @Override public void run() {
      try {
        loop(queue);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
  }.start();
}

static void loop(BlockingQueue<MyMessage> queue) throws InterruptedException {
  while (true) {
    MyMessage message = queue.take();
    System.out.println("Received: " + message);
  }
}

```

一旦 Message 被打印到 Log 中，MyMessage 实例应该被回收，然而还是发生了内存泄漏：

`
* GC ROOT thread com.example.MyActivity$2.<Java Local> (named 'Thread-110')
* leaks com.example.MyActivity$MyMessage instance
`

我们发送新的 Message 到阻塞队列的瞬间，前一个 Message 就被回收，而新的 Message 就泄漏了。

在 VM 中，每一个栈帧都是本地变量的集合，而垃圾回收器是保守的：只要存在一个存活的引用，就不会回收它。

在循环结束后，本地变量不再可访问，然而本地变量仍持有对 Message 的引用，interpreter/JIT 理论上应该在本地变量不可访问时将其引用置为 null，然而它们并没有这样做，引用仍然存活，而且不会被置为 null，使得它不会被回收。

为了验证我们的结论，我们手动将引用设为 null，并打印它，使得 null 不会是最优化办法：

```java
static void loop(BlockingQueue<MyMessage> queue) throws InterruptedException {
  while (true) {
    MyMessage message = queue.take();
    System.out.println("Received: " + message);
    message = null;
    System.out.println("Now null: " + message);
  }
}
```

在测试上面的代码时，我们发现 MyMessage 实例在 Message 被设为 null 时立刻被回收。也就是说我们的结论似乎是正确的。

因为这样的内存泄漏会在各种各样的线程和阻塞队列的实现中发生，我们现在确定这是一个存在于 VM 中的 Bug。基于这个结论，我们只能在 Dalvik VM 中复现这个 Bug，在 ART VM 或 JVM 中则无法复现。

##Message in a (recycled) bottle

我们发现了一个会导致内存泄漏的 Bug，但这会导致严重的内存泄漏吗？不妨看看我们最初的泄漏信息：

`
* GC ROOT thread com.squareup.picasso.Dispatcher.DispatcherThread.<Java Local>
* references android.os.Message.obj
* references com.example.MyActivity$MyDialogClickListener.this$0
* leaks com.example.MyActivity.MainActivity instance
`

我们发送给 Picasso Dispatcher 线程的 Message，我们从未将 Message.obj 设为 DialogInterface.OnClickListener，那它是怎么结束的？

此外，当 Message 被处理，它应该立刻被回收，而且 Message.obj 应该被设为 null。只有那样 HandlerThread 才会等待下一个 Message，并暂时泄漏前一个 Message：

```java
for (;;) {
    Message msg = queue.next(); // might block
    if (msg == null) {
        return;
    }
    msg.target.dispatchMessage(msg);
    msg.recycleUnchecked();
}
```

因而我们知道泄漏的 Message 会被回收，因此不会持有之前的内容。

一旦被回收，Message 就会回到常量池中：

```java
void recycleUnchecked() {
    // Mark the message as in use while it remains in the recycled object pool.
    // Clear out all other details.
    flags = FLAG_IN_USE;
    what = 0;
    arg1 = 0;
    arg2 = 0;
    obj = null;
    replyTo = null;
    sendingUid = -1;
    when = 0;
    target = null;
    callback = null;
    data = null;

    synchronized (sPoolSync) {
        if (sPoolSize < MAX_POOL_SIZE) {
            next = sPool;
            sPool = this;
            sPoolSize++;
        }
    }
}
```

我们此时拥有一个泄漏的空 Message，它可能会被重用，并填充不同的内容。Message 常常以相同的方式被使用：在池中被调用，填充内容，放入 MessageQueue，然后被处理，最后被回收，并置回到池中。

它理应在很长一段时间内不会持有它的内容，那我们为什么总会在 DialogInterface.OnClickListener 实例中发生内存泄漏呢？

##Alert Dialogs

我们先创建一个简单的 AlertDialog：

```java
new AlertDialog.Builder(this)
    .setPositiveButton("Baguette", new DialogInterface.OnClickListener() {
      @Override public void onClick(DialogInterface dialog, int which) {
        MyActivity.this.makeBread();
      }
    })
    .show();
```

注意到 ClickListener 持有 Activity 的引用，该匿名内部类实际完成的工作与下面的代码是一样的：

```java
// First anonymous class of MyActivity.
class MyActivity$0 implements DialogInterface.OnClickListener {
  final MyActivity this$0;
  MyActivity$0(MyActivity this$0) {
    this.this$0 = this$0;
  }
  @Override public void onClick(DialogInterface dialog, int which) {
    this$0.makeBread();
  }
}

new AlertDialog.Builder(this)
    .setPositiveButton("Baguette", new MyActivity$0(this));
    .show();
Internally, AlertDialog delegates the work to AlertController:

/**
 * Sets a click listener or a message to be sent when the button is clicked.
 * You only need to pass one of {@code listener} or {@code msg}.
 */
public void setButton(int whichButton, CharSequence text,
        DialogInterface.OnClickListener listener, Message msg) {
    if (msg == null && listener != null) {
        msg = mHandler.obtainMessage(whichButton, listener);
    }
    switch (whichButton) {
        case DialogInterface.BUTTON_POSITIVE:
            mButtonPositiveText = text;
            mButtonPositiveMessage = msg;
            break;
        case DialogInterface.BUTTON_NEGATIVE:
            mButtonNegativeText = text;
            mButtonNegativeMessage = msg;
            break;
        case DialogInterface.BUTTON_NEUTRAL:
            mButtonNeutralText = text;
            mButtonNeutralMessage = msg;
            break;
    }
}
```

所以 OnClickListener 被包裹到 Message 中，并被设置到 AlertController.mButtonPositiveMessage，现在我们看看该 Message 在什么时候被使用：

```java
private final View.OnClickListener mButtonHandler = new View.OnClickListener() {
    @Override public void onClick(View v) {
        final Message m;
        if (v == mButtonPositive && mButtonPositiveMessage != null) {
            m = Message.obtain(mButtonPositiveMessage);
        } else if (v == mButtonNegative && mButtonNegativeMessage != null) {
            m = Message.obtain(mButtonNegativeMessage);
        } else if (v == mButtonNeutral && mButtonNeutralMessage != null) {
            m = Message.obtain(mButtonNeutralMessage);
        } else {
            m = null;
        }
        if (m != null) {
            m.sendToTarget();
        }
        // Post a message so we dismiss after the above handlers are executed.
        mHandler.obtainMessage(ButtonHandler.MSG_DISMISS_DIALOG, mDialogInterface)
                .sendToTarget();
    }
};
```


注意这：`m = Message.obtain(mButtonPositiveMessage).`

Message 被克隆，也就是说后面使用的是它的拷贝。这就以为着原始的 Message 从没有被发送，因此不会被回收，所以永久保存着它的内容，直到发生垃圾回收。

现在假设 Message 已经由于 HandlerThread 本地引用在被回收池调用之前发生内存泄漏，Dialog 最终会被垃圾回收，并释放由 mButtonPositiveMessage 持有的 Message 的引用。

然而，由于 Message 已经泄漏，它并不会被垃圾回收。同样的，它持有的内容也不会被回收，而 OnClickListener 持有对 Activity 的引用，导致 Activity 不会被回收。

##Smoking Gun

我们能证明这个结论么？

我们需要发送一个 Message 到 HandlerThread 中，让他被处理和回收，并不要再发送任何 Message 到那个线程中，使最后一个 Message 发生内存泄漏。然后，我们需要显示一个带 Button 的 Dialog ，并希望它会从池中获取到相同的 Message。这确实很可能会发生，因为一旦被回收，Message 就会变成池内的第一个可调用的 Message。

```java
HandlerThread background = new HandlerThread("BackgroundThread");
background.start();
Handler backgroundhandler = new Handler(background.getLooper());
final DialogInterface.OnClickListener clickListener = new DialogInterface.OnClickListener() {
  @Override public void onClick(DialogInterface dialog, int which) {
    MyActivity.this.makeCroissants();
  }
};
backgroundhandler.post(new Runnable() {
  @Override public void run() {
    runOnUiThread(new Runnable() {
      @Override public void run() {
        new AlertDialog.Builder(MyActivity.this) //
            .setPositiveButton("Baguette", clickListener) //
            .show();
      }
    });
  }
});
```

如果我们运行上面的代码，然后旋转屏幕销毁当前 Activity，就很有可能会使该 Activity 发生内存泄漏。

LeakCanary 准确地检测到了内存泄漏：

`
* GC ROOT thread android.os.HandlerThread.<Java Local> (named 'BackgroundThread')
* references android.os.Message.obj
* references com.example.MyActivity$1.this$0 (anonymous class implements android.content.DialogInterface$OnClickListener)
* leaks com.example.MyActivity instance
`

现在我们成功地重现了这个 Bug，不妨看看该怎么修复它。

##The Startup Fix

只支持 ART VM的设备当然不会有这个 Bug，当然，也没多少人用……

##The Won't Fix

你可能会觉得这些内存泄漏没啥影响，而且你有其他更值得做的事情，或许更简单的内存泄漏需要修复。LeakCanary 默认无视了所有 Message 泄漏。但要注意的是，Activity 持有其整个 View 的资源，那可是有好几兆的。

##The App fix

确保 DialogInterface.OnClickListener 不会持有对 Activity 实例的强引用，例如在 Dialog 退出后清除对 Listener 的引用，下面是一个简化它的包裹类：

```java
public final class DetachableClickListener implements DialogInterface.OnClickListener {

  public static DetachableClickListener wrap(DialogInterface.OnClickListener delegate) {
    return new DetachableClickListener(delegate);
  }

  private DialogInterface.OnClickListener delegateOrNull;

  private DetachableClickListener(DialogInterface.OnClickListener delegate) {
    this.delegateOrNull = delegate;
  }

  @Override public void onClick(DialogInterface dialog, int which) {
    if (delegateOrNull != null) {
      delegateOrNull.onClick(dialog, which);
    }
  }

  public void clearOnDetach(Dialog dialog) {
    dialog.getWindow()
        .getDecorView()
        .getViewTreeObserver()
        .addOnWindowAttachListener(new OnWindowAttachListener() {
          @Override public void onWindowAttached() { }
          @Override public void onWindowDetached() {
            delegateOrNull = null;
          }
        });
  }
}
```

然后你可以包裹所有 OnClickListener 实例：

```java
DetachableClickListener clickListener = wrap(new DialogInterface.OnClickListener() {
  @Override public void onClick(DialogInterface dialog, int which) {
    MyActivity.this.makeCroissants();
  }
});

AlertDialog dialog = new AlertDialog.Builder(this) //
    .setPositiveButton("Baguette", clickListener) //
    .create();
clickListener.clearOnDetach(dialog);
dialog.show();
```

##The Plumber's Fix

在一个常用的基础清晰你的工作者线程：当 Handler 闲置就向它发送空 Message，以确保不会发生 Message 的内存泄漏。

```java
static void flushStackLocalLeaks(Looper looper) {
  final Handler handler = new Handler(looper);
  handler.post(new Runnable() {
    @Override public void run() {
      Looper.myQueue().addIdleHandler(new MessageQueue.IdleHandler() {
        @Override public boolean queueIdle() {
          handler.sendMessageDelayed(handler.obtainMessage(), 1000);
          return true;
        }
      });
    }
  });
}
```

在使用库时这个办法很好似用，因为你不能控制开发者在 Dialog 中写的代码。我们在 Picasso 中就用这个办法解决了这个 Bug。

##Conclusion

Many thanks to [Josh Humphries, Jesse Wilson, Manik Surtani](https://twitter.com/jhumphries_sq), and [Wouter Coekaerts](https://twitter.com/WouterCoekaerts) for their help in our internal email thread.

正如我们所见，一个小小的，难以发现的 VM 行为会导致内存泄漏，而这又会导致大量内存被泄漏，最终使 App 崩溃。

感谢 [Josh Humphries, Jesse Wilson, Manik Surtani](https://twitter.com/jhumphries_sq), 和 [Wouter Coekaerts](https://twitter.com/WouterCoekaerts) 在邮件沟通中帮助我解决了这个 Bug。
