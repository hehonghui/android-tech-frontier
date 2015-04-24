在Activity中使用Thread导致的内存泄漏
---

> * 原文链接 : [Activitys, Threads, & Memory Leaks](http://www.androiddesignpatterns.com/2013/04/activitys-threads-memory-leaks.html)
* 原文作者 : [AlexLockwood](https://google.com/+AlexLockwood)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [yinna317](https://github.com/yinna317)  
* 状态 :  完成




> 注：这篇博文涉及的源码可以在 [GitHub](https://github.com/alexjlockwood/leaky-threads) 上面下载哦

做 Android 开发最常遇到的问题就是在 Activity 的生命周期中协调耗时任务，避免执行任务导致不易察觉的内存泄漏。不妨先读一读下面的代码，代码写了一个简单的 Activity，Activity 在启动后就会开启一个线程，并循环执行该线程中的任务

```java

	/** 
	 *  示例向我们展示了在 Activity 的配置改变时（配置改变会导致其下的 Activity 实例被销
     *  毁）存活。此外，Activity 的 context 也是内存泄漏的一部分，因为每一个线程都被初始
     *  化为匿名内部类，使得每一个线程都持有一个外部 Activity 实例的隐式引用，使得
     *  Activity 不会被 Java 的垃圾回收机制回收。
     */  
	public class MainActivity extends Activity {
	
	  @Override
	  protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    exampleOne();
	  }
	
	  private void exampleOne() {
	    new Thread() {
	      @Override
	      public void run() {
	        while (true) {
	          SystemClock.sleep(1000);
	        }
	      }
	    }.start();
	  }
	}
```

Activity 配置发生改变会使 Activity 被销毁，并新建一个 Activity，我们总会觉得 Android 系统会将与被销毁的 Activity 相关的一切清理干净，例如回收与 Activity 关联的内存，Activity 执行的线程等等……然而，现实总是很残酷的，刚刚提到的这些东西都不会被回收，并导致内存泄漏，从而显著地影响应用的性能表现。

## Activity 内存泄漏的根源 ##

如果你读过我以前写的一篇有关 Handler 和 内部类的博文，那我接下来要讲的知识你肯定知道。在 Java 中，非静态匿名内部类会持有其外部类的隐式引用，如果你没有考虑过这一点，那么存储该引用会导致 Activity 被保留，而不是被垃圾回收机制回收。Activity 对象持有其 View 层以及相关联的所有资源文件的引用，换句话说，如果你的内存泄漏发生在 Activity 中，那么你将损失大量的内存空间。

而这样的问题在 Activity 配置改变时会更加严重，因为 Activity 的配置改变表示 Android 系统将要销毁当前 Activity 并新建一个 Activity。举例来说吧，在使用应用的时候，你执行了10次横屏/竖屏操作，每一次方向的改变都会执行下面的代码，那么我们会发现（使用[ Eclipse 的内存分析工具](http://www.eclipse.org/mat/)可以看到）每一个 Activity 对象都会因为留有一个隐式引用而被保留在内存中。

![](http://www.androiddesignpatterns.com/assets/images/posts/2013/04/15/activity-leak.png)

每一次配置的改变都会使 Android 系统新建一个 Activity 并把改变前的 Activity 交给垃圾回收机制回收。但因为线程持有旧 Activity 的隐式引用，使该 Activity 没有被垃圾回收机制回收。这样的问题会导致每一个新建的 Activity 都将发生内存泄漏，与 Activity 相关的所有资源文件也不会被回收，其中的内存泄漏有多严重可想而知。

看到这里可能你会很害怕，很惶恐，很无助，那我们该怎么办……莫慌，解决办法非常简单，既然我们已经确定了问题的根源，那么对症下药就可以了：我们把该线程类声明为私有的静态内部类就可以解决这个问题：

```java

	 /**
      * 示例通过将线程类声明为私有的静态内部类避免了 Activity context 的内存泄漏问题，但
      * 在配置发生改变后，线程仍然会执行。原因在于，DVM 虚拟机持有所有运行线程的引用，无论
      * 这些线程是否被回收，都与 Activity 的生命周期无关。运行中的线程只会继续运行，直到
      * Android 系统将整个应用进程杀死
      */ 
	public class MainActivity extends Activity {
	
	  @Override
	  protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    exampleTwo();
	  }
	
	  private void exampleTwo() {
	    new MyThread().start();
	  }
	
	  private static class MyThread extends Thread {
	    @Override
	    public void run() {
	      while (true) {
	        SystemClock.sleep(1000);
	      }
	    }
	  }
	}
```

通过上面的代码，新线程再也不会持有一个外部 Activity 的隐式引用，而且该 Activity 也会在配置改变后被回收。

## 线程内存泄漏的根源 ##

第二个问题是：对于每个新建 Activity,如果 Activity 中的线程发生发生内存泄漏。在Java中线程是垃圾回收机制的根源，也就是说，在运行系统中DVM虚拟机总会使硬件持有所有运行状态的进程的引用，结果导致处于运行状态的线程将永远不会被回收。因此，你必须为你的后台线程实现销毁逻辑！下面是一种解决办法：

```java

	/**
     * 除了我们需要实现销毁逻辑以保证线程不会发生内存泄漏，其他代码和示例2相同。在退出当前
     * Activity 前使用 onDestroy() 方法结束你的运行中线程是个不错的选择
	 */
	public class MainActivity extends Activity {
	  private MyThread mThread;
	
	  @Override
	  protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    exampleThree();
	  }
	
	  private void exampleThree() {
	    mThread = new MyThread();
	    mThread.start();
	  }
	
      /**
	   * 私有的静态内部类不会持有其外部类的引用，使得 Activity 实例不会在配置改变时发生内
	   * 存泄漏
       */
	  private static class MyThread extends Thread {
	    private boolean mRunning = false;
	
	    @Override
	    public void run() {
	      mRunning = true;
	      while (mRunning) {
	        SystemClock.sleep(1000);
	      }
	    }
	
	    public void close() {
	      mRunning = false;
	    }
	  }
	
	  @Override
	  protected void onDestroy() {
	    super.onDestroy();
	    mThread.close();
	  }
	}
```

通过上面的代码，我们在 onDestroy() 方法中结束了线程，确保不会发生意外的线程的内存泄漏问题。如果你想要在配置改变后保留该线程（而不是每一次在关闭 Activity 后都要新建一个线程），那我建议你使用 Fragment 去完成该耗时任务。你可以翻我以前的博文，一名叫作**“Handling Configuration Changes with Fragments”**应该能满足你的需求，在API demo中也提供了很好理解的例子来为你阐述相关概念。

## 结论 ##

Android 开发过程中，在 Activity 的生命周期里协调耗时任务可能会很困难，你一不小心就会导致内存泄漏问题。下面是一些小提示，能帮助你预防内存泄漏问题的发生：

- **尽可能使用静态内部类而不是非静态内部类。**每一个非静态内部类实例都会持有一个外部类的引用，若该引用是 Activity 的引用，那么该 Activity 在被销毁时将无法被回收。如果你的静态内部类需要一个相关 Activity 的引用以确保功能能够正常运行，那么你得确保你在对象中使用的是一个 Activity 的弱引用，否则你的 Activity 将会发生意外的内存泄漏。

- **不要总想着 Java 的垃圾回收机制会帮你解决所有内存回收问题。**就像上面的示例，我们以为垃圾回收机制会帮我们将不需要使用的内存回收，例如：我们需要结束一个 Activity，那么它的实例和相关的线程都该被回收。但现实并不会像我们剧本那样走。Java 线程会一直存活，直到他们都被显式关闭，抑或是其进程被 Android 系统杀死。所以，为你的后台线程实现销毁逻辑是你在使用线程时必须时刻铭记的细节，此外，你在设计销毁逻辑时要根据 Activity 的生命周期去设计，避免出现 Bug。

- **考虑你是否真的需要使用线程。**Android 应用的框架层为我们提供了很多便于开发者执行后台操作的类。例如：我们可以使用 Loader 代替在 Activity 的生命周期中用线程通过注入执行短暂的异步后台查询操作，考虑用 Service 将结构通知给 UI 的 BroadcastReceiver。最后，记住，这篇博文中对线程进行的讨论同样适用于 AsyncTask（因为 AsyncTask 使用 ExecutorService 执行它的任务）。然而，虽说 ExecutorService 只能在短暂操作（文档说最多几秒）中被使用，那么这些方法导致的 Activity 内存泄漏应该永远不会发生。

这篇博文的源码可以在 [GitHub](https://github.com/alexjlockwood/leaky-threads) 中下载，你也可以在 [Google Play](https://play.google.com/store/apps/details?id=com.adp.leaky.threads) 下载 APK 使用。

![](http://www.androiddesignpatterns.com/assets/images/posts/2013/04/15/leaky-threads-screenshot.png)