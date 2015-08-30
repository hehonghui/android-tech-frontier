一个内存泄漏引发的血案-Square
---

> * 原文链接 : [A small leak will sink a great ship](https://corner.squareup.com/2015/08/a-small-leak.html)
* 原文作者 : [Pierre-Yves Ricau](corner.squareup.com)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  完成 




This post started as an internal email thread when I was building LeakCanary. I found a strange memory leak and started digging in order to figure out what was happening.
TL;DR: Prior to Android Lollipop, alert dialogs may cause memory leaks in your Android apps.

##The Artist
I was getting memory leak reports from LeakCanary:

`
* GC ROOT thread com.squareup.picasso.Dispatcher.DispatcherThread.<Java Local>
* references android.os.Message.obj
* references com.example.MyActivity$MyDialogClickListener.this$0
* leaks com.example.MyActivity.MainActivity instance
`

In plain words: a [Picasso](https://github.com/square/picasso) thread was holding on to a Message instance as a local variable on the stack. That Message had a reference to a DialogInterface.OnClickListener, which itself referenced a destroyed Activity.

Local variables are usually short lived since they only exist on the stack. When a method is called on a thread, a stack frame is allocated. When the method returns, that stack frame is cleared and all of its local variables are garbage collected. If a local variable is causing a leak then it normally means that a thread is either looping or blocking and keeping a reference to a Message instance while doing so.

[Dimitris](https://github.com/square/picasso/graphs/contributors) and I looked at the Picasso source code.

Dispatcher.DispatcherThread is a simple HandlerThread:

```java
static class DispatcherThread extends HandlerThread {
  DispatcherThread() {
    super(Utils.THREAD_PREFIX + DISPATCHER_THREAD_NAME, THREAD_PRIORITY_BACKGROUND);
  }
}
```

This thread receives messages through a Handler implemented in a very standard way:

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

This was a dead end. There was no obvious bug in `Dispatcher.DispatcherHandler.handleMessage()` that would somehow keep a reference to a Message through a local variable.

##Queue Tips

Eventually, more memory leak reports came in. It wasn't just Picasso. We would get local variable leaks from various types of thread, and there was always a dialog click listener involved. The leaking threads shared one common characteristic: they were worker threads and received work to do through some kind of blocking queue.

Let's look at how HandlerThread works:

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

There's definitely a local variable referencing a Message. However it should be very short lived and cleared as soon as the loop iterates.

We tried to reproduce by writing a bare bones worker thread with a blocking queue and sending it only one message:

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

Once the message was printed in the log, we expected the MyMessage instance to be garbage collected.

LeakCanary disagreed:

`
* GC ROOT thread com.example.MyActivity$2.<Java Local> (named 'Thread-110')
* leaks com.example.MyActivity$MyMessage instance
`

As soon as we sent a new message to the queue, the previous message was garbage collected, and that new message was now leaking.

In the VM, each stack frame has a set of local variables. The garbage collector is conservative: if there is a reference that might be alive, it won’t collect it.

After an iteration, the local variable is no longer reachable, however it still holds a reference to the message. The interpreter/JIT could manually null­ out the reference as soon as it is no longer reachable, but instead it just keeps the reference alive and assumes no damage will be done.

To confirm this theory, we manually set the reference to null and printed it again so that the null wouldn't be optimized away:

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

When testing the above change, we saw that the MyMessage instance was garbage collected immediately after message was set to null. Our theory about the VM overlooking the local message variable seemed to be borne out.

Since this leak could be reproduced on various thread and queue implementations, we were now sure that it was a VM bug. On top of that, we could only reproduce it on a Dalvik VM, not on an ART VM or a JVM.

##Message in a (recycled) bottle

We found a bug, but can it create huge memory leaks? Let's look at our original leak again:

`
* GC ROOT thread com.squareup.picasso.Dispatcher.DispatcherThread.<Java Local>
* references android.os.Message.obj
* references com.example.MyActivity$MyDialogClickListener.this$0
* leaks com.example.MyActivity.MainActivity instance
`

In the messages we send to Picasso dispatcher thread, we never set Message.obj to a DialogInterface.OnClickListener. How did it end up there?

Furthermore, after the message is handled, it is immediately recycled and Message.obj is set to null. Only then does HandlerThread wait for the next message and temporarily leak that previous message:

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

As that point, we know that the leaking message has been recycled, and therefore doesn't hold on to its prior content.

Once recycled, the message goes back in a static pool:

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

We have a leaking empty Message that might be reused and filled with different content. A Message is always used the same way: detached from the pool, filled with content, put on a MessageQueue, then handled, finally recycled and put back in the pool.

It should therefore never keep its content for long. Why do we always end up leaking DialogInterface.OnClickListener instances?

##Alert Dialogs

Let's create a simple alert dialog:

```java
new AlertDialog.Builder(this)
    .setPositiveButton("Baguette", new DialogInterface.OnClickListener() {
      @Override public void onClick(DialogInterface dialog, int which) {
        MyActivity.this.makeBread();
      }
    })
    .show();
```

Notice that the click listener has a reference to the activity. The anonymous class gets translated to the following code:

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

So the OnClickListener is wrapped in a Message and set to AlertController.mButtonPositiveMessage. Let's look at when that Message is used:

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

Note this: `m = Message.obtain(mButtonPositiveMessage).`

The message is cloned, and its copy is sent. This means that the original Message is never sent, and therefore never recycled. So it keeps its content forever, until garbage collected.

Now let's assume that this message was already leaking prior to being obtained from the recycled pool, due to a HandlerThread local reference. The Dialog is eventually garbage collected and releases the reference to the message held by mButtonPositiveMessage.

However, since the message is already leaking, it won't be garbage collected. Same goes for its content, the OnClickListener, and therefore the Activity.

##Smoking Gun

Can we prove our theory?

We need to send a message to a HandlerThread, let it be consumed and recycled, and not send any other message to that thread so that it leaks the last message. Then, we need to show a dialog with a button and hope that this dialog will get the same message from the pool. It's quite likely to happen, because once recycled, a message becomes first in the pool.

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

If we run the above code and then rotate the screen to destroy the activity, there are good chances that this activity will leak.

LeakCanary correctly detects the leak:

`
* GC ROOT thread android.os.HandlerThread.<Java Local> (named 'BackgroundThread')
* references android.os.Message.obj
* references com.example.MyActivity$1.this$0 (anonymous class implements android.content.DialogInterface$OnClickListener)
* leaks com.example.MyActivity instance
`

Now that we've properly reproduced it, let's see what we can do to fix it.

##The Startup Fix

Support only devices that use the ART VM, ie Android 5+. No more bugs! Also, no more users.

##The Won't Fix

You could also assume that these leaks will have a limited impact and that you have better things to do, or maybe simpler leaks to fix. LeakCanary ignores all Message leaks by default. Beware though, an activity holds its entire view hierarchy in memory and can retain several megabytes.

##The App fix

Make sure your DialogInterface.OnClickListener instances do not hold strong references to activity instances, for example by clearing the reference to the listener when the dialog window is detached. Here's a wrapper class to make it easy:

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

Then you can just wrap all OnClickListener instances:

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

Flush your worker threads on a regular basis: send an empty message when a HandlerThread becomes idle to make sure no message leaks for long.

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

This is useful for libraries, because you can't control what developers are going to do with dialogs. We used it in Picasso, with a [similar fix](https://github.com/square/picasso/pull/932) for other types of worker threads.

##Conclusion
As we saw, a subtle and unexpected VM behavior can create a small leak that ends up holding on to huge chunks of the memory, eventually crashing your app with an OutOfMemoryError. A small leak will sink a great ship.

Many thanks to [Josh Humphries, Jesse Wilson, Manik Surtani](https://twitter.com/jhumphries_sq), and [Wouter Coekaerts](https://twitter.com/WouterCoekaerts) for their help in our internal email thread.