RxJava Observables单元测试
---
> * 原文链接 : [Unit Testing RxJava Observables](https://medium.com/ribot-labs/unit-testing-rxjava-6e9540d4a329)
* 原文作者 : [Iván Carballo](https://medium.com/@ivanc)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [dengshiwei](https://github.com/dengshiwei) 
* 校对者:
* 状态 :  校对中
##Unit Testing RxJava Observables

RxJava is a great library, but it’s not easy to get started. Here we outline different approaches to unit test Observables.

##RxJava Observables单元测试

RxJava是一个非常棒的类库，但是它不容易上手，在这里，我们列出了不同的方法来对Observables进行单元测试。

At [ribot](http://ribot.co.uk/), we started using RxJava a few months ago and now it’s become a core element in the [architecture](https://github.com/ribot/android-guidelines/blob/master/architecture_guidelines/android_architecture.md) of the Android apps we create. There are many benefits that come with it, but the learning curve is steep and quite often we still find ourselves trying to get our heads around those “beautiful” diagrams that explain how operators work.

The first step to rx-ify our architecture was to change the methods in the data layer so that they returned Observables. The next question was: how do we unit test this?

在[ribot](http://ribot.co.uk/)时，我们几个月前开始使用RxJava，而现在它已经成为我们开发的安卓应用的核心架构元素。使用RxJava有很多益处，但是学习(使用)的过程是曲折的，很多时候，我们发现我们试图让自己的头脑中环绕着那些解释操作过程如何工作的“美丽”蓝图。

改变我们架构的第一步就是改变那些定义在数据层的方法，让他们返回Observables。下一个问题是：我们如何对此进行单元测试？

###The ugly way

The first thing that came to our minds was to simply subscribe in the same way we would from outside the tests and then save the result in a global variable that can later on be asserted. For example, imagine we have a method in a database helper class that is in charge of loading a user object.

	public Observable<User> loadUser() {
    ...
	}

Then the test for this method would look like this:

	User mUser;
	@Test
	public void shouldLoadUser() throw Exception {
    databaseHelper.loadUser()
        .subscribe(new Action1<User>() {
            @Override
            public void call(User user) {
                mUser = user;
            }
         });
    assertNotNull(mUser);
	}

This code works because, by default, the Observable will run on the same thread. Therefore, the assertion will always happen after the result is set in the global variable.

###丑陋的方式

我们头脑中首先想到的是以同样的方式简单地描述我们的外部测试结果，然后将结果保存在一个全局变量，可以在以后进行断言。例如，假设我们有一个方法在一个database helper类中，负责加载用户对象。

	public Observable<User> loadUser() {
    ...
	}

然后，针对这个方法的测试就会如同下面这样：

	User mUser;
	@Test
	public void shouldLoadUser() throw Exception {
    databaseHelper.loadUser()
        .subscribe(new Action1<User>() {
            @Override
            public void call(User user) {
                mUser = user;
            }
         });
    assertNotNull(mUser);
	}

默认情况下，这段代码将会执行，因为Observable会在同一个线程上执行。
因此，在结果设置为全局变量后断言会一直执行。

###The better way

We soon realised that the previous solution wasn’t elegant. Even though this approach worked, it required a lot of boilerplate code. So we decided to create a small class that provides a static method called subscribeAssertingThat(). This allowed us to subscribe to an observable, save the result and then perform some assertions in a cleaner way. For example:

	@Test
	public void shouldLoadTwoUsers() throw Exception {
  	 subscribeAssertingThat(databaseHelper.loadUser())
       .completesSuccessfully()
       .hasSize(2)
       .emits(user1, user2)
	}

With about 100 lines of code, this class that we called RxAssertions, made our tests much more readable and easier to write. You can find the RxAssertions code [here](https://gist.github.com/ivacf/874dcb476bfc97f4d555).

###更好的方式
我们很快意识到先前的解决方式是不完美的。尽管先前的方法能够工作，(但是)它需要大量的模版代码。所以，我们决定创建一个类，该类提供一个名称为subscribeAssertingThat()的静态方法。这个类允许我们subscribe 一个observable，保存测试结果并且以一种清晰的方式执行一些断言。例如：

	@Test
	public void shouldLoadTwoUsers() throw Exception {
  	 subscribeAssertingThat(databaseHelper.loadUser())
       .completesSuccessfully()
       .hasSize(2)
       .emits(user1, user2)
	}

通过100行左右的代码，我们称为RxAssertions的这个类使我们的测试可读性和可写性更好。你可以在[这里](https://gist.github.com/ivacf/874dcb476bfc97f4d555)找到RxAssertions类的代码。

###The official way

Later on, we discovered that RxJava provides a specific type of subscriber called [TestSubscriber](http://reactivex.io/RxJava/javadoc/rx/observers/TestSubscriber.html#TestSubscriber%28rx.Subscriber%29).

A TestSubscriber is a variety of [Subscriber](http://reactivex.io/RxJava/javadoc/rx/Subscriber.html) that you can use for unit testing, to perform assertions, inspect received events, or wrap a mocked Subscriber.

Similar to the second solution, a test subscriber allows you to perform assertions over the result of the subscription. For example:

	@Test
	public void shouldLoadTwoUsers() throw Exception {
  	 	TestSubscriber<User> testSubscriber = new TestSubscriber<>();
   		databaseHelper.loadUser().subscribe(testSubscriber);
  	 	testSubscriber.assertNoErrors();
   		testSubscriber.assertReceivedOnNext(Arrays.asList(user1, user2))
	}

We still haven’t used TestSubscriber on a frequent basis, but as you can see above the resulting code is quite elegant and readable. Apart from the different assertions it also allows you to retrieve the whole list of items emitted by the Observable by calling getOnNextEvents().

When using TestSubscriber you will discover that chaining assertions is not possible, because the assert methods don’t return the TestSubscriber. The ability to do this would be a nice improvement.

###标准方式
后来，我们发现RxJava 提供了一个称为[TestSubscriber](http://reactivex.io/RxJava/javadoc/rx/observers/TestSubscriber.html#TestSubscriber%28rx.Subscriber%29)的subscriber专用类型。

TestSubscriber由各种各样的[Subscriber](http://reactivex.io/RxJava/javadoc/rx/Subscriber.html)(组成)，你可以用于单元测试，执行断言，检查接收到的事件，或封装mocked类型的Subscriber。

与第二个解决方案类似，测试subscriber允许你通过结果执行断言。例如：

	@Test
	public void shouldLoadTwoUsers() throw Exception {
  	 	TestSubscriber<User> testSubscriber = new TestSubscriber<>();
   		databaseHelper.loadUser().subscribe(testSubscriber);
  	 	testSubscriber.assertNoErrors();
   		testSubscriber.assertReceivedOnNext(Arrays.asList(user1, user2))
	}

我们还没有频繁的使用TestSubscriber，但你可以看到上面的代码是相当优雅和可读。除了不同的断言，通过 Observable调用getOnNextEvents()方法，它也允许你恢复整个发现的问题列表。

当使用TestSubscriber时，你会发现链接的断言是不可能的，因为断言方法不返回TestSubscriber。这个能力将是一个很好的改善(方向)。

###Conclusion

TestSusbcriber is probably the best option at the moment and because it’s part of the RxJava codebase it will continue improving and new features will be merged in. It would be good to hear how other developers are unit testing their Observables. What other methods do you use apart from those I’ve mentioned here?

###总结
TestSusbcriber可能是目前最好的选择，因为它是RxJava codebase的一部分，它会不断的改进以及将新功能合并。能够了解别的开发者如何进行Observables的单元测试时很棒的。除了那些我在这里提到的其他方法，你还有什么方法(用于测试)？

