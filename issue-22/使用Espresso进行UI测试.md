#使用Espresso进行UI测试
---

> * 原文链接 : [Using Espresso for Easy UI Testing](http://www.michaelevans.org/blog/2015/08/03/using-espresso-for-easy-ui-testing/)
* 原文作者 : [Michael Evans](http://www.michaelevans.org/)
* 译者 : [desmond1121](https://github.com/desmond1121)
* 校对者: [这里校对者的github用户名](github链接)
* 状态 :  未完成


One thing that I notice when I talk to Android developers is that a lot of them don’t put an emphasis on testing. They say that it’s too hard to write them or that they are too hard to integrate and set up, or give a bunch of other reasons why they don’t. But it’s actually pretty simple to write Espresso tests, and they really aren’t that hard to integrate with your code base.

在我和很多Android开发者聊天的时候我注意到他们在开发的过程中并不注重测试这一环节，原因是他们认为Android测试太难实现或者难以集成到现有的工程中等等。但是实际上写一个[Espresso](https://code.google.com/p/android-test-kit/wiki/Espresso)并不是一件很难的事情，而且它能够非常方便地集成到你的工程之中。

##EASY TO WRITE
##容易实现

Espresso tests are dead simple to write. They come in three parts.

Espresso测试是非常容易实现的，它由三部分组成：

ViewMatchers – something to find the view to act upon/assert something about

- ViewMachers：用于寻找用来测试的View的工具。

ViewActions – something to perform an action (type text, click a button)

- ViewActions：用于发送交互事件的工具。

ViewAssertions – something to verify what you expect

- ViewAssertions：用于检验测试结果的工具。

For example, the following test would type the name “Steve” into an EditText with the id name_field, click a Button with the id greet_button and then verify that the text “Hello Steve!” appears on the screen:

举个例子，接下来这部分代码向id为`name_field`的EditText输入"Steve"，并点击id为`greet_button`的按钮，最后检查屏幕上是否有"Hello Steve!"字样。

    @Test
    public void testSayHello() {
      onView(withId(R.id.name_field)).perform(typeText("Steve"));
      onView(withId(R.id.greet_button)).perform(click());
      onView(withText("Hello Steve!")).check(matches(isDisplayed()));
    }

Seems simple enough right? But what about when other threads are involved?

是不是很简单？我们再来看看在多线程情况下如何进行测试。

##INTEGRATION
##整合测试

From the Espresso documentation:

Espresso官方文档有这样一段话：

>*The centerpiece of Espresso is its ability to seamlessly synchronize all test operations with the application under test. By default, Espresso waits for UI events in the current message queue to process and default AsyncTasks* to complete before it moves on to the next test operation. This should address the majority of application/test synchronization in your application.”

>*Espresso测试有个很强大的地方是它在多个测试操作中是线程安全的。Espresso会等待当前进程的消息队列中的UI事件，并且在任何一个测试操作中会等待其中的AsyncTask结束才会执行下一个测试。这能够解决程序中大部分的线程同步问题。

But if you’re like me, you’re not writing AsyncTasks to handle your background operations. My go-to tool for making HTTP requests (probably one of the most common uses of AsyncTask) is Retrofit. So what can we do? Espresso has an API called registerIdlingResource, which allows you to synchronize your custom logic with Espresso.

我一般使用[Retrofit](http://square.github.io/retrofit/)来处理我的Http请求，而不是`AsyncTask`（虽然大多数人还是使用`AsyncTask`），在这种情况下也有别的办法来实现线程安全的测试。Espresso中有个API叫做`registerIdlingResource`，它可以让你使用自定义的线程安全逻辑。

With this knowledge, one way you might approach this is to implement a mock version of your Retrofit interface, and then use something like this:

通过`IdlingResource`，我们可以通过以下这段代码来实现线程同步的Retrofit接口：

    public class MockApiService implements ApiService, IdlingResource {

      private final ApiService api;
      private final AtomicInteger counter;
      private final List<ResourceCallback> callbacks;

      public MockApiService(ApiService api) {
          this.api = api;
          this.callbacks = new ArrayList<>();
          this.counter = new AtomicInteger(0);
      }

      @Override
      public Response doWork() {
          counter.incrementAndGet();
          return decrementAndNotify(api.doWork());
      }

      @Override
      public String getName() {
          return this.getClass().getName();
      }

      @Override
      public boolean isIdleNow() {
          return counter.get() == 0;
      }

      @Override
      public void registerIdleTransitionCallback(ResourceCallback resourceCallback) {
          callbacks.add(resourceCallback);
      }

      private <T> T decrementAndNotify(T data) {
          counter.decrementAndGet();
          notifyIdle();
          return data;
      }

      private void notifyIdle() {
          if (counter.get() == 0) {
              for (ResourceCallback cb : callbacks) {
                  cb.onTransitionToIdle();
              }
          }
      }
    }

This tells Espresso that your app is idle after the methods are called. But you should immediately see the problem here – you’ll end up writing a TON of boilerplate. As you have more methods in your interface, and lot of repeated increment and decrement code…there must be a better way. (There is!)

这个类告诉了Espresso你的应用将会在（`doWork()`）方法调用后才能够进入下一个步骤。但是你看完这段代码应该马上意识到一件事情：这样的写法太过啰嗦了，你需要实现很多方法才能做到这线程同步一个小功能。一定有其他更好的办法来实现（接下来就是了！）。

The “trick” lies right in the selling point in the Espresso documentation, “Espresso waits for UI events… and default AsyncTasks to complete”. If we could somehow execute our Retrofit requests on the AsyncTasks’ ThreadPoolExecutor, we’d get sychronization for free!

实际上技巧就隐藏在之前的官方文档中，“Expresso会等待UI事件……并等待AsyncTask的结束才会执行下一个测试”。 **实际上我们只要在AsyncTask的ThreadPoolExecutor中执行Retrofit请求就可以了！**

Fortunately, Retrofit’s RestAdapter.Builder class has just such a method!

幸运的是Retrofit的BaseAdapter.Builder类提供了这样一种方法：

    new RestAdapter.Builder()
       .setExecutors(AsyncTask.THREAD_POOL_EXECUTOR, new MainThreadExecutor())
       .build();

And it’s that simple – Now you have no excuse not to write some Espresso tests!

如此简单，你还有理由不写Espresso测试吗？
