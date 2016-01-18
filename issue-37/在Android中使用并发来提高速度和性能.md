在Android中使用并发来提高速度和性能
---

> * 原文链接 : [Using concurrency to improve speed and performance in Android](https://medium.com/@ali.muzaffar/using-concurrency-and-speed-and-performance-on-android-d00ab4c5c8e3#.t1ynou5e3)
* 原文作者 : [Ali Muzaffar](https://medium.com/@ali.muzaffar)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 


#在Android中使用并发来提高速度和性能#


Android框架提供了很实用的异步处理类。然而它们中的大多数在一个单一的后台线程中排队。当你需要多个线程时你是怎么做的？


众所周知，UI更新发生在UI线程（也称为主线程）。在主线程中的任何操作都会阻塞UI更新，因此当需要大量计算时可以使用AsyncTask, IntentService 和 Threads。事实上，在不久前我写了[在android中异步处理的8种方式](https://medium.com/android-news/8-ways-to-do-asynchronous-processing-in-android-and-counting-f634dc6fae4e#.bkk6mudb4)。然而，Android中的[AsyncTasks](http://developer.android.com/reference/android/os/AsyncTask.html)运行在一个单一后台线程并且[IntentService](http://developer.android.com/reference/android/os/AsyncTask.html)也同样如此。因此，开发者应该怎么做？


**更新：**[Marco Kotz](https://medium.com/u/b49242be2be7) [指出](https://medium.com/@mrcktz/hi-ali-nice-article-thanks-for-sharing-ba72b07f1fb3)，你可以通过ThreadPool Executor和AsyncTask使用多个后台线程。

##大多数开发者所做的

在大多数情况下，你不需要多个线程，简单地分离AsyncTasks 或者在IntentService 中排队操作就足够用了。然而，当你真正需要多个线程时，通常，我看到的开发者只是简单地平分旧的线程。


```
String[] urls = …
for (final String url : urls) {
    new Thread(new Runnable() {
        public void run() {
            //Make API call or, download data or download image
        }
    }).start();
}
```

使用这种方法有几个问题。第一个是操作系统限制了相同的域名的连接数量为4（我相信）。意思是这段代码不会按照你想的那样去执行。它创建的线程在开始执行操作之前不得不等待另一个线程执行完毕。还有就是每个线程被创建，用来执行一个任务，然后被销毁。这个没有被重用。


##这为什么是一个问题？

让我们说一个例子，你想开发一个急速连拍应用，从Camera 预览每秒捕获10张照片或更多。应用的功能如下：
 
 - 用byte[]存储10张照片，且不能阻塞UI。
 - 转换每个byte[]的格式从YUV 到RGB 。
 - 使用转换后的数组创建一个Bitmap 。
 - 修复Bitmap 的方向。
 - 生成一个缩略图大小的Bitmap 。
 - 把完整大小的Bitmap压缩成Jpeg写到磁盘上。
 - 排队把完整图片上传到服务器。

可以理解的是，如果你在主UI线程做所有的操作，你的应用性能将会很低下。唯一的方法是当UI空闲时缓存camera预览数据并处理它。

另一种可能是创建一个一直运行的HandlerThread，可以用来在后台线程接收camera预览并做这些所有的处理。虽然这样会更好，但在随后的急速连拍之间将会有太多的延迟，因为所有的操作都需要处理。


```
public class CameraHandlerThread extends HandlerThread
        implements Camera.PictureCallback, Camera.PreviewCallback {
    private static String TAG = "CameraHandlerThread";
   private static final int WHAT_PROCESS_IMAGE = 0;

    Handler mHandler = null;
    WeakReference<CameraPreviewFragment> ref = null;

    private PictureUploadHandlerThread mPictureUploadThread;
    private boolean mBurst = false;
    private int mCounter = 1;

    CameraHandlerThread(CameraPreviewFragment cameraPreview) {
        super(TAG);
        start();
        mHandler = new Handler(getLooper(), new Handler.Callback() {

            @Override
            public boolean handleMessage(Message msg) {
                if (msg.what == WHAT_PROCESS_IMAGE) {
                    //Do everything
                }
                return true;
            }
        });
        ref = new WeakReference<>(cameraPreview);
    }

   ...

    @Override
    public void onPreviewFrame(byte[] data, Camera camera) {
        if (mBurst) {
            CameraPreviewFragment f = ref.get();
            if (f != null) {
                mHandler.obtainMessage(WHAT_PROCESS_IMAGE, data)
               .sendToTarget();
                try {
                    sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                if (f.isAdded()) {
                    f.readyForPicture();
                }
            }
            if (mCounter++ == 10) {
                mBurst = false;
                mCounter = 1;
            }
        }
    }
}
```


**注意：**如果你想了解更多HandlerThreads知识和怎样使用它，可以阅读我发表的[关于HandlerThreads文章](https://medium.com/@ali.muzaffar/handlerthreads-and-why-you-should-be-using-them-in-your-android-apps-dc8bf1540341#.co4ilm67m)。


因为一切都是在一个后台线程完成的，我们的主要性能优势是我们的线程是长时间运行并且没有被销毁和重新创建。然而，许多耗时的操作只能通过线性方式在共享的线程中执行。

我们可以创建第二个HandlerThread 处理图片和第三个将它们写到磁盘和第四个上传到服务器。我们可以快速捕获图片，然而，这些线程仍然将以线性的方式依赖其它的线程。这不是真正的并发。我们可以快速捕获图片，然而，因为处理每个图片需要时间，当用户点击按钮和缩略图被显示之间用户仍能感受到很大的滞后。

##使用线程池提高性能

虽然我们可以根据需要创建很多线程，但创建线程和销毁它是一个时间成本。我们也不想创建不需要的线程并且想要充分利用可用的硬件。太多的线程会通过消耗CPU周期影响性能。解决方案是使用一个线程池（ThreadPool）。

在应用中创建一个直接使用的线程池，首先为你的线程池创建一个单例。

```
public class BitmapThreadPool {
    private static BitmapThreadPool mInstance;
    private ThreadPoolExecutor mThreadPoolExec;
    private static int MAX_POOL_SIZE;
    private static final int KEEP_ALIVE = 10;
    BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>();

    public static synchronized void post(Runnable runnable) {
        if (mInstance == null) {
            mInstance = new BitmapThreadPool();
        }
        mInstance.mThreadPoolExec.execute(runnable);
    }

    private BitmapThreadPool() {
        int coreNum = Runtime.getRuntime().availableProcessors();
        MAX_POOL_SIZE = coreNum * 2;
        mThreadPoolExec = new ThreadPoolExecutor(
                coreNum,
                MAX_POOL_SIZE,
                KEEP_ALIVE,
                TimeUnit.SECONDS,
                workQueue);
    }

    public static void finish() {
        mInstance.mThreadPoolExec.shutdown();
    }
}
```

然后在上面的代码简单地修改Handler 的回调：

```
mHandler = new Handler(getLooper(), new Handler.Callback() {

    @Override
    public boolean handleMessage(Message msg) {
        if (msg.what == WHAT_PROCESS_IMAGE) {
            BitmapThreadPool.post(new Runnable() {
                @Override
                public void run() {
                    //do everything
                }
            });
        }
        return true;
    }
});
```

这样就OK了。性能明显提升，可以看看下面的视频！

这里的优势在于我们可以定义池大小，甚至在回收之前指定线程保持多长时间。我们也可以针对不同的操作创建不同的线程池或只使用一个线程池。需要小心的是当你的线程执行完成后做适当的清理。

我们甚至可以针对不同的操作创建不同的线程池，一个线程池转换数据到Bitmaps，一个线程池写数据到磁盘，第三个线程池上传Bitmaps 到服务器。在这一过程中，如果我们的线程池最大可以有4个线程，我们可以在同一时间转换，写和上传4张图片而不是1张。用户可以在同一时间看到4张图片而不是一张。


上面是一个简化的例子，可以从[GitHub上查看完整的代码](https://github.com/alphamu/ThreadPoolWithCameraPreview)然后给我一些反馈。


你也可以从[Google Play下载demo应用](https://play.google.com/store/apps/details?id=au.com.alphamu.camerapreviewcaptureimage)。


**实现线程池前：**如果可以，当缩略图显示在底部时盯着屏幕顶部的定时器。因为我已经把除了 adapter的notifyDataSetChanged()之外的所有操作放到了主线程之外，计数器应该会运行得很流畅。

![threadpool_before](https://cloud.githubusercontent.com/assets/4308480/12195036/71565b06-b62f-11e5-8091-d229e02470dc.gif)


**实现线程池后：**屏幕顶部的定时器依然运行得很流畅，然而，图片缩略图的显示快了很多。


![threadpool_after](https://cloud.githubusercontent.com/assets/4308480/12195086/b0188dc8-b62f-11e5-97d9-96a506f1a4a2.gif)

##最后

为了开发出优秀的Android应用，[阅读更多我的文章](https://medium.com/@ali.muzaffar)。


耶！在最后你做到了!我们应该出去嗨！关注我，[LinkedIn](https://www.linkedin.com/in/alimuzaffar)，[Google+](https://plus.google.com/+AliMuzaffar) 或 [Twitter](https://twitter.com/ali_muzaffar)。