Context是怎么泄露的:Handlers & Inner Classes
---

> * 原文链接 : [How to Leak a Context: Handlers & Inner Classes](http://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html)
* 原文作者 : [Alex Lockwood](http://www.androiddesignpatterns.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。本译文已授权开发者头条（链接：http://toutiao.io/download）享有独家转载权，未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [Damonzh](https://github.com/Damonzh)  
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

Consider the following code:  

先瞅下下面这段代码：

~~~java
public class SampleActivity extends Activity {

  private final Handler mLeakyHandler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      // ... 
    }
  }
}
~~~
While not readily obvious, this code can cause cause a massive memory leak. Android Lint will give the following warning:

>In Android, Handler classes should be static or leaks might occur.  

尽管不是那么明显，但这段代码会导致大量内存泄露。Android的Lint工具会给出如下警告：
>在Android中，Handler类应该被静态修饰，否则可能会出现内存泄露。

But where exactly is the leak and how might it happen? Let's determine the source of the problem by first documenting what we know:

1. When an Android application first starts, the framework creates a [Looper](http://developer.android.com/reference/android/os/Looper.html) object for the application's main thread. A Looper implements a simple message queue, processing [Message](http://developer.android.com/reference/android/os/Message.html) objects in a loop one after another. All major application framework events (such as Activity lifecycle method calls, button clicks, etc.) are contained inside Message objects, which are added to the Looper's message queue and are processed one-by-one. The main thread's Looper exists throughout the application's lifecycle.

2. When a [Handler](http://developer.android.com/reference/android/os/Handler.html) is instantiated on the main thread, it is associated with the Looper's message queue. Messages posted to the message queue will hold a reference to the Handler so that the framework can call [Handler#handleMessage(Message)](http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)) when the Looper eventually processes the message.

3. In Java, non-static inner and anonymous classes hold an implicit reference to their outer class. Static inner classes, on the other hand, do not.  

BUT,到底是哪里泄露了？它是怎么发生的?下面让我们根据已有的知识来分析下问题的原因：

1.当Android应用首次启动时，framework会在应用的UI线程创建一个[Looper](http://developer.android.com/reference/android/os/Looper.html)对象。Looper实现了一个简单的消息队列并且一个接一个的处理队列中的[消息](http://developer.android.com/reference/android/os/Message.html)。应用的所有事件(比如Activity生命周期回调方法，按钮点击等等)都会被当做一个消息对象放入到Looper的消息队列中，然后再被逐一执行。UI线程的Looper存在于整个应用的生命周期内。  
2.当在UI线程中创建[Handler](http://developer.android.com/reference/android/os/Handler.html)对象时，它就会和UI线程中Looper的消息队列进行关联。发送到这个消息队列中的消息会持有这个Handler的引用，这样当Looper最终处理这个消息的时候framework就会调用[Handler#handleMessage(Message)](http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message))方法来处理具体的逻辑。  
3.在Java中，非静态的内部类或者匿名类会隐式的持有其外部类的引用，而静态的内部类则不会。  

So where exactly is the memory leak? It's very subtle, but consider the following code as an example:  

那么，到底是哪里发生泄漏了呢？其实泄漏发生的还是比较隐晦的，但是再看看下面这段代码：

~~~java
public class SampleActivity extends Activity {
 
  private final Handler mLeakyHandler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      // ...
    }
  }
 
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
 
    // Post a message and delay its execution for 10 minutes.
    mLeakyHandler.postDelayed(new Runnable() {
      @Override
      public void run() { /* ... */ }
    }, 1000 * 60 * 10);
 
    // Go back to the previous Activity.
    finish();
  }
}
~~~
When the activity is finished, the delayed message will continue to live in the main thread's message queue for 10 minutes before it is processed. The message holds a reference to the activity's Handler, and the Handler holds an implicit reference to its outer class (the SampleActivity, in this case). This reference will persist until the message is processed, thus preventing the activity context from being garbage collected and leaking all of the application's resources. Note that the same is true with the anonymous Runnable class on line 15. Non-static instances of anonymous classes hold an implicit reference to their outer class, so the context will be leaked.  

当activity被finish的时候，延迟发送的消息仍然会存活在UI线程的消息队列中，直到10分钟后它被处理掉。这个消息持有activity的Handler的引用，Handler又隐式的持有它的外部类(这里就是SampleActivity)的引用。这个引用会一直存在直到这个消息被处理，所以垃圾回收机制就没法回收这个activity，内存泄露就发生了。需要注意的是：15行的匿名Runnable子类也会导致内存泄露。非静态的匿名类会隐式的持有外部类的引用，所以context会被泄露掉。  

To fix the problem, subclass the Handler in a new file or use a static inner class instead. Static inner classes do not hold an implicit reference to their outer class, so the activity will not be leaked. If you need to invoke the outer activity's methods from within the Handler, have the Handler hold a WeakReference to the activity so you don't accidentally leak a context. To fix the memory leak that occurs when we instantiate the anonymous Runnable class, we make the variable a static field of the class (since static instances of anonymous classes do not hold an implicit reference to their outer class):  

解决这个问题也很简单：在新的类文件中实现Handler的子类或者使用static修饰内部类。静态的内部类不会持有外部类的引用，所以activity不会被泄露。如果你要在Handler内调用外部activity类的方法的话，可以让Handler持有外部activity类的弱引用，这样也不会有泄露activity的风险。关于匿名类造成的泄露问题，我们可以用static修饰这个匿名类对象解决这个问题，因为静态的匿名类也不会持有它外部类的引用。

~~~java
public class SampleActivity extends Activity {

  /**
   * Instances of static inner classes do not hold an implicit
   * reference to their outer class.
   */
  private static class MyHandler extends Handler {
    private final WeakReference<SampleActivity> mActivity;

    public MyHandler(SampleActivity activity) {
      mActivity = new WeakReference<SampleActivity>(activity);
    }

    @Override
    public void handleMessage(Message msg) {
      SampleActivity activity = mActivity.get();
      if (activity != null) {
        // ...
      }
    }
  }

  private final MyHandler mHandler = new MyHandler(this);

  /**
   * Instances of anonymous classes do not hold an implicit
   * reference to their outer class when they are "static".
   */
  private static final Runnable sRunnable = new Runnable() {
      @Override
      public void run() { /* ... */ }
  };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Post a message and delay its execution for 10 minutes.
    mHandler.postDelayed(sRunnable, 1000 * 60 * 10);
    
    // Go back to the previous Activity.
    finish();
  }
}
~~~
The difference between static and non-static inner classes is subtle, but is something every Android developer should understand. What's the bottom line? **Avoid using non-static inner classes in an activity if instances of the inner class could outlive the activity's lifecycle.** Instead, prefer static inner classes and hold a weak reference to the activity inside.  

静态和非静态内部类的区别是非常微妙的，但这个区别是每个Android开发者应该清楚的。那么底线是什么？**如果要实例化一个超出activity生命周期的内部类对象，避免使用非静态的内部类。**建议使用静态内部类并且在内部类中持有外部类的弱引用。
