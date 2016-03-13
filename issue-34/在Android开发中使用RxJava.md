#在Android开发中使用RxJava

---

- 原文链接 : [Getting Started with RxJava and Android](http://www.captechconsulting.com/blogs/getting-started-with-rxjava-and-android?utm_source=Android+Weekly&utm_campaign=8b4ba9e51d-Android_Weekly_177&utm_medium=email&utm_term=0_4eb677ad19-8b4ba9e51d-337955857)
- 原文作者 : [ALEX TOWNSEND](https://github.com/alex-townsend)
- 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
- 译者 : [desmond1121](https://github.com/desmond1121)
- 校对者: [desmond1121](https://github.com/desmond1121)
- 状态 : 完成

[ReactiveX](http://reactivex.io/)是专注于异步工作的API，它将异步事件的处理与观察者模式、迭代器模式及函数式编程相结合了起来。实时地处理返回数据是在工程中经常出现的情景，所以使用高效、可拓展的方式来解决这种问题非常重要。ReactiveX通过观察者模式以及操作符来提供灵活地处理异步通信的方式，你不用再去关注线程创造与同步这些繁琐的事情。

##RxJava介绍

[RxJava](https://github.com/ReactiveX/RxJava)是一个开源的实现ReactiveX的工具。这里面有两种主要的类：`Observalbe`和`Subscriber`。在RxJava中，`Observable`类产生异步数据或事件，`Subscriber`类对这些数据和事件进行操作。正常的工作流程就是`Observable`产生一系列的数据或事件，然后完成或者产生异常。一个`Observable`可以拥有多个`Subscriber`，每一个被生成的事件都会触发被绑定的`Subscriber`的`onNext()`方法。当一个`Observable`生成完所有事件后，所有绑定的`Subscriber`的`onCompleted()`方法会被调用（在发生异常时会调用`onError()`方法）。现在我们对这两个类有了初步的认识，可以开始了解如何创建与订阅一个`Observer`了：

	Observable integerObservable = Observable.create(new Observable.OnSubscribe() {
	   @Override
	   public void call(Subscriber subscriber) {
	       subscriber.onNext(1);
	       subscriber.onNext(2);
	       subscriber.onNext(3);
	       subscriber.onCompleted();
	   }
	});

我们创建的这个`Observable`产生了1、2、3三条数据，现在需要创建`Subscriber`来处理它们：

	Subscriber integerSubscriber = new Subscriber() {
	   @Override
	   public void onCompleted() {
	       System.out.println("Complete!");
	   }
	
	   @Override
	   public void onError(Throwable e) {
	
	   }
	
	   @Override
	   public void onNext(Integer value) {
	       System.out.println("onNext: " + value);
	   }
	};

你可以看到，这个`Subscriber`将每一个收到的数据打印了出来。当你创建完`Observable`与`Subscriber`后，你需要将它们用`Observable.subscribe()`方法连接起来。

	integerObservable.subscribe(integerSubscriber);
	// 输出:
	// onNext: 1
	// onNext: 2
	// onNext: 3
	// Complete!

这整个过程，可以使用`Observable.just()`来简化数据的生成过程，再创建`Subscriber`的匿名内部类来简化处理过程：

	Observable.just(1, 2 ,3).subscribe(new Subscriber() {
	   @Override
	   public void onCompleted() {
	       System.out.println("Complete!");
	   }
	
	   @Override
	   public void onError(Throwable e) {}
	
	   @Override
	   public void onNext(Integer value) {
	       System.out.println("onNext: " + value);
	   }
	});

##操作符

只是创建与订阅`Observable`非常简单，然而这只是RxJava的冰山一角。任何`Observable`都可以将它的输出通过“操作符”来进行预处理，一个`Observable`可以绑定多个操作符来进行链式处理。举个例子，前面使用的`Observable`只是输出简单的数字，但是我们只想对奇数进行处理，可以通过设置`filter`来实现：

	Observable.just(1, 2, 3, 4, 5, 6) // add more numbers
	       .filter(new Func1() {
	           @Override
	           public Boolean call(Integer value) {
	               return value % 2 == 1;
	           }
	       })
	       .subscribe(new Subscriber() {
				@Override
				public void onCompleted() {
					System.out.println("Complete!");
				}

				@Override
					public void onError(Throwable e) {
				}

				@Override
				public void onNext(Integer value) {
					System.out.println("onNext: " + value);
				}
			});
			 
			 
	// Outputs:
	// onNext: 1
	// onNext: 3
	// onNext: 5
	// Complete!

`filter()`操作符定义了一个函数，它只会在输出为奇数的时候返回true，输出为偶数的时候返回false。返回false的输出是不会发送到`Subscriber`的。值得注意的是`filter`函数返回了一个`Observable`，我们可以进行链式处理。比如现在希望找到所有奇数的平方根，你可以在`Subscriber`获取到数字的时候来处理这个逻辑，但是这样的话就不能对做平方根后的数字进行进一步处理了。你可以在filter操作符后加一个map操作符来实现这个逻辑：

	Observable.just(1, 2, 3, 4, 5, 6) // add more numbers
	       .filter(new Func1() {
	           @Override
	           public Boolean call(Integer value) {
	               return value % 2 == 1;
	           }
	       })
	       .map(new Func1() {
	           @Override
	           public Double call(Integer value) {
	               return Math.sqrt(value);
	           }
	       })
	       .subscribe(new Subscriber() { // notice Subscriber type changed to 
	           @Override
	           public void onCompleted() {
	               System.out.println("Complete!");
	           }

               @Override
               public void onError(Throwable e) { }

               @Override
               public void onNext(Double value) {
                   System.out.println("onNext: " + value);
               }
           });
       
	// Outputs:
	// onNext: 1.0
	// onNext: 1.7320508075688772
	// onNext: 2.23606797749979
	// Complete!

链式操作符是RxJava不可分割的一块内容，它简便、可拓展，功能强大。现在你对`Observable`与`Subscriber`的联系有了进一步的认识，我们可以开始下一个话题：将RxJava与Android开发结合起来。

##简化Android多线程开发

在Android开发中，我们常常需要在后台线程中完成一些耗时工作，当后台线程完成工作之后通知主线程来显示结果。Android Sdk中有很多类可以完成多这种工作，Asynctask、Loader、Service等等。然而它们有时候并不是最好的选择。Asynctask经常会造成内存泄露；与ContentProvider搭配的CursorLoader使用起来非常繁琐，并且需要大量样板代码；Service通常是用于执行需要长时间在后台运行的任务。那么我们来看看RxJava怎么来解决这些问题。

在下面这个布局中，有一个按钮，它会启动一个耗时任务，并且将任务的进度展示到ProgressBar上。

	<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
	   xmlns:app="http://schemas.android.com/apk/res-auto"
	   android:id="@+id/root_view"
	   android:layout_width="match_parent"
	   android:layout_height="match_parent"
	   android:fitsSystemWindows="true"
	   android:orientation="vertical">
	
	   <android.support.v7.widget.Toolbar
	       android:id="@+id/toolbar"
	       android:layout_width="match_parent"
	       android:layout_height="?attr/actionBarSize"
	       android:background="?attr/colorPrimary"
	       app:popupTheme="@style/AppTheme.PopupOverlay"
	       app:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar" />
	
	   <Button
	       android:id="@+id/start_btn"
	       android:layout_width="wrap_content"
	       android:layout_height="wrap_content"
	       android:layout_gravity="center_horizontal"
	       android:text="@string/start_operation_text" />
	
	   <ProgressBar
	       android:layout_width="wrap_content"
	       android:layout_height="wrap_content"
	       android:layout_gravity="center_horizontal"
	       android:indeterminate="true" />
	
	</LinearLayout>

一旦按钮按下之后，我们禁用按钮，同时在后台线程中开始做耗时任务，当任务结束之后会弹出一个`SnackBar`。现在使用一个简单的AsyncTask来完成如下这个耗时任务`longRunningOperation()`。

	public String longRunningOperation() {
	   try {
	       Thread.sleep(2000);
	   } catch (InterruptedException e) {
	       // error
	   }
	   return "Complete!";
	}
	
	private class SampleAsyncTask extends AsyncTask {
	
	   @Override
	   protected String doInBackground(Void... params) {
	       return longRunningOperation();
	   }
	
	   @Override
	   protected void onPostExecute(String result) {
	       Snackbar.make(rootView, result, Snackbar.LENGTH_LONG).show();
	       startAsyncTaskButton.setEnabled(true);
	   }
	}

现在要怎么用RxJava替换掉呢？首先需要在app模块的gradle脚本中添加依赖：`io.reactivex:rxjava:1.0.14`。然后创建一个`Observable`来运行耗时任务，调用`Observable.create`方法来实现这个功能：

	final Observable operationObservable = Observable.create(new Observable.OnSubscribe() {
	   @Override
	   public void call(Subscriber subscriber) {
	       subscriber.onNext(longRunningOperation());
	       subscriber.onCompleted();
	   }
	});

现在创建的这个`Observable`会执行`longRunningOperation()`，在执行完毕后通知`Subscriber`，并且调用`Subscriber`的`onCompleted()`方法（注意：耗时任务在`Subscriber`与`Observable`绑定之前不会被执行）。接下来，我们需要在按钮点击事件上将`Observable`与`Subscriber`绑定。

	startRxOperationButton.setOnClickListener(new View.OnClickListener() {
	   @Override
	   public void onClick(final View v) {
	       v.setEnabled(false);
	       operationObservable.subscribe(new Subscriber() {
	           @Override
	           public void onCompleted() {
	               v.setEnabled(true);
	           }

			   @Override
			   public void onError(Throwable e) {}

			   @Override
			   public void onNext(String value) {
				   Snackbar.make(rootView, value, Snackbar.LENGTH_LONG).show();
			   }
		   });
	   }
	});

接下来我们就可以运行这个应用了。但是你会发现，点击按钮之后ProgressBar并不会有反应！（这是因为UI主线程被耗时任务阻塞了）。我们还没有指定`Observable`的运行线程，也没有指定`Subscriber`的运行线程。RxJava调度的功能就在这里体现：我们可以指定两个不同的线程，一个是运行线程，一个是监视线程。使用`Observable.observeOn()`函数，你可以定义一个线程用来监视`Observable`运行，并且查看是否`Observable`有新的输出（Subscriber的`onNext`，`onCompleted`， `onError`方法都是在这个监视线程中执行的）。调用`Observable.subscribeOn()`方法可以指定一个线程运行耗时任务。RxJava原本将两个任务都安排在一个线程中执行，而你可以通过调用`observeOn`与`subcribeOn`方法来进行多线程操作。RxJava封装了很多调度工具，比如`Schedulers.io()`（阻塞I/O操作），`Schedulers.computation()`（进行计算工作），`Schedulers.newThread()`（创建新线程）。不过在Android开发中，你应该关心的是怎么将代码执行在主线程中。我们可以通过RxAndroid库来完成这个工作！

RxAndroid是RxJava的轻量级拓展工具，它提供了运行在主线程上的Scheduler，或者运行在任意Handler线程上的Scheduler！这样一来，我们就可以在后台线程中运行耗时工作，同时在主线程中处理结果。要使用RxAndroid，你需要添加依赖`io.reactivex:rxandroid:1.0.1`。

	final Observable operationObservable = Observable.create(new Observable.OnSubscribe() {
	   @Override
	   public void call(Subscriber subscriber) {
	       subscriber.onNext(longRunningOperation());
	       subscriber.onCompleted();
	   }
	}).subscribeOn(Schedulers.io()) // subscribeOn the I/O thread
	  .observeOn(AndroidSchedulers.mainThread()); // observeOn the UI Thread
	       
以上经过修改代码会在`Schedulers.io`线程上运行耗时工作，Subscriber会在主线程中处理输出结果。现在我们运行应用，点击按钮，我们的耗时任务没有阻塞UI线程。RxJava 1.0.13同时提供了Single类，它只会产生一个结果，之后马上执行`onComplete()`方法。示例如下：

	Subscription subscription = Single.create(new Single.OnSubscribe() {
	           @Override
	           public void call(SingleSubscriber singleSubscriber) {
	               String value = longRunningOperation();
	               singleSubscriber.onSuccess(value);
	           }
	       })
	       .subscribeOn(Schedulers.io())
	       .observeOn(AndroidSchedulers.mainThread())
	       .subscribe(new Action1() {
	           @Override
	           public void call(String value) {
	               // onSuccess
	               Snackbar.make(rootView, value, Snackbar.LENGTH_LONG).show();
	           }
	       }, new Action1() {
	           @Override
	           public void call(Throwable throwable) {
	               // handle onError
	           }
	       });

在订阅Single的时候，只有`onSuccess()`、`onError()`可以监听。同时你可以调用`Single.mergeWith()`操作符来将多个Single合成一个`Observable`，这个被合成的`Observable`会依次输出所有Single的结果。

##防止内存泄露

我们之前提到，使用`AsyncTask`的一大缺点就是它可能会造成内存泄露。当它们持有的Activity/Fragment的引用没有正确处理时就会这样。不幸的是，RxJava并不会自动防止这种情况发生，好在它可以很容易地防止内存泄露。`Observable.subscribe()`方法会返回一个`Subscription`对象，这个对象仅仅有两个方法：`isSbscribed()`与`unsubscribe()`。你可以在Activity/Fragment的`onDestroy`方法中调用`Subscription.isSubscribed()`检测是否这个异步任务仍在进行。如果它仍在进行，则调用`unsubscribe()`方法来结束任务，从而释放其中的强引用，防止内存泄露。如果你使用了多个`Observable`与`Subscriber`，那么你可以将它们添加到`CompositeSubscription`中，并调用`CompositeSubscription.unsubscribe()`结束所有的任务。

##结束语

RxJava为Android提供了一个非常棒的多线程同步的解决方案。在Android开发中，让耗时任务在后台线程运行，并将结果在主线程中展示，是非常重要的。同时它的操作符模式为这个工具起到了锦上添花的作用。使用RxJava的时候，你需要对整个工具库有一定理解，才能将其发挥最大的作用。所以花时间去系统地学习这个库是非常值得的。未来我还将会在我的博客中讨论RxJava的几个特性：冷热`Observable`的比较、处理反压力、Rx子类。本节中的样本代码可以从[我的Github](https://github.com/alex-townsend/GettingStartedRxAndroid_)中找到。

##特别介绍：RetroLambda

Java 8 引入了Lambda表达式，可惜的是Android不支持Java 8，所以我们不能使用RxJava与这一特性结合的功能。幸运的是，有一个工具叫[RetroLambda](https://github.com/orfjackal/retrolambda)可以将Lambda表达式与低版本的Java兼容。同时还有一个[Gradle插件](https://github.com/evant/gradle-retrolambda)可以在Android开发中使用。使用了Lambda表达式，你的RxJava代码会更加简洁：

	final Observable operationObservable = Observable.create(
	       (Subscriber subscriber) -> {
	           subscriber.onNext(longRunningOperation());
	           subscriber.onCompleted();
	       })
	       .subscribeOn(Schedulers.io())
	       .observeOn(AndroidSchedulers.mainThread());
	
	startRxOperationButton = (Button) findViewById(R.id.start_rxjava_operation_btn);
	startRxOperationButton.setOnClickListener(v -> {
	   v.setEnabled(false);
	   operationObservable.subscribe(
	           value -> Snackbar.make(rootView, value, Snackbar.LENGTH_LONG).show(),
	           error -> Log.e("TAG", "Error: " + error.getMessage()),
	           () -> v.setEnabled(true));
	});

Lambda表达式减少了很多RxJava的样本代码，我强烈推荐将RetroLambda引入工程中使用。它给开发带来的好处不仅仅于RxJava上（你会注意到`OnCliclListener`也是用Lambda表达式设置的）!
