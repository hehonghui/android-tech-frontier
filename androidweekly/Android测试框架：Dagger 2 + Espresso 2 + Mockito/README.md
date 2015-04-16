## Android测试框架: Dagger 2 + Espresso 2 + Mockito
(by [@Chiu-Ki Chan](http://www.blogger.com/profile/01970007638489793840))
---

>
* 原文链接 : [Dagger 2 + Espresso 2 + Mockito](http://blog.sqisland.com/2015/04/dagger-2-espresso-2-mockito.html)
* 译者 : [yaoqinwei](https://github.com/yaoqinwei) 
* 校对者: [](github链接)
* 状态 :  未完成




I've been doing Android instrumentation testing with Dagger, Espresso and Mockito, and I love it. To commemorate the launch of [Dagger 2](http://google.github.io/dagger/) out of SNAPSHOT, I am sharing a demo repo with Dagger 2, Espresso 2 and Mockito:

https://github.com/chiuki/android-test-demo

我一直在用Dagger, Espresso和Mockito做Android测试，爱死这个组合了！为了庆祝[Dagger 2](http://google.github.io/dagger/)的推出，我分享了一个用Dagger 2, Espresso 2和Mockito做Android测试的Demo：

https://github.com/chiuki/android-test-demo

### Dagger Components

[Dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) allows our app and test obtain different modules. This is very useful for creating repeatable test cases. The demo app displays today's date in the format yyyy-MM-dd. We would like to test that against a known date, instead of depend on the actual date when we run the test.

In Dagger 2, a Component provides modules for your whole app, and defines where to inject them.

```java
public interface DemoComponent {
	void inject(MainActivity mainActivity);
}

@Singleton
@Component(modules = ClockModule.class)
public interface ApplicationComponent extends DemoComponent {
}

@Singleton
@Component(modules = MockClockModule.class)
public interface TestComponent extends DemoComponent {
	void inject(MainActivityTest mainActivityTest);
}
```

**`ApplicationComponent`** is used when the app is run normally, and **`TestComponent`** is used during tests. Both components injects into **`MainActivity`**.

How does the **`MainActivity`** know which component to use? It injects via the **`DemoApplication`**, which stores the component.

```java
private DemoComponent component = null;

@Override 
public void onCreate() {
	super.onCreate();
	if (component == null) {
		component = DaggerDemoApplication_ApplicationComponent
					.builder()
					.clockModule(new ClockModule())
					.build();
  }
}

public void setComponent(DemoComponent component) {
	this.component = component;
}

public DemoComponent component() {
	return component;
}
```

We call **`setComponent()`** in test, which runs before **`onCreate()`**, so the TestComponent is used. When the app is run normally, component will be set to **`ApplicationComponent`** in **`onCreate()`**.

### Dagger 组件(Components)

[Dependency injection(依赖注入)](http://en.wikipedia.org/wiki/Dependency_injection) 允许我们在App开发和测试中可以获取到不同的模块，非常有利于创建可重用的测试用例，这个Demo App的功能是以`"yyyy-MM-dd"`格式显示今天的日期，我们需要测试一下来应对一些已知的日期，而非依赖于运行测试时的真实日期。

在`Dagger 2`中，一个组件(Component)接口可以给整个App提供模块，并且定义了在哪注入它们。

```java
public interface DemoComponent {
	void inject(MainActivity mainActivity);
}

@Singleton
@Component(modules = ClockModule.class)
public interface ApplicationComponent extends DemoComponent {
}

@Singleton
@Component(modules = MockClockModule.class)
public interface TestComponent extends DemoComponent {
	void inject(MainActivityTest mainActivityTest);
}
```

**`ApplicationComponent`**组件用于App的正常运行, 而**`TestComponent`**组件则用于测试，这两个组件都可以被注入到**`MainActivity`**中。

**`MainActivity`**如何知道使用的哪个组件(component)? 答案是通过**`DemoApplication`**来注入, 它保存着该组件(component)的引用。

```java
private DemoComponent component = null;

@Override 
public void onCreate() {
	super.onCreate();
	if (component == null) {
		component = DaggerDemoApplication_ApplicationComponent
					.builder()
					.clockModule(new ClockModule())
					.build();
  }
}

public void setComponent(DemoComponent component) {
	this.component = component;
}

public DemoComponent component() {
	return component;
}
```

测试时，我们需要在**`onCreate()`**方法执行之前调用**`setComponent()`**方法，将组件设置为**`TestComponent`**。而App正常运行时,组件在**`onCreate()`**方法中就被设置为**`ApplicationComponent`**了。

###　Mockito

The app has a **`Clock`** class which returns the current time.

```java
public DateTime getNow() {
	return new DateTime();
}
```

**`TestComponent`** contains **`MockClockModule`**, which provides **`Clock`** as mocked by [Mockito](http://mockito.org/). This way [**`MainActivityTest`**](https://github.com/chiuki/android-test-demo/blob/master/app/src/androidTest/java/com/sqisland/android/test_demo/MainActivityTest.java) can supply a pre-determined date during test.

```java
Mockito.when(clock.getNow()).thenReturn(new DateTime(2008, 9, 23, 0, 0, 0));
```

Since we have singleton modules, the same mocked **`Clock`** is supplied to the app. With that, it will display the provided date instead of today's date:

```java
onView(withId(R.id.date)).check(matches(withText("2008-09-23")));
```

###	 Mockito

App中有一个**`Clock`**类，其中有一个方法可以返回当前的时间:

```java
public DateTime getNow() {
	return new DateTime();
}
```

**`TestComponent`**组件中包含**`MockClockModule`**模块，后者使用[Mockito](http://mockito.org/)提供了一个模拟的**`Clock`**。这样[**`MainActivityTest`**](https://github.com/chiuki/android-test-demo/blob/master/app/src/androidTest/java/com/sqisland/android/test_demo/MainActivityTest.java)就可以在测试期间提供一个预先设置的日期了。

```java
Mockito.when(clock.getNow()).thenReturn(new DateTime(2008, 9, 23, 0, 0, 0));
```

因为我们使用了单例, 相同的模拟**`Clock`**将为整个App提供日期，这样就能被显示提供的日期，而非今天的日期了:

```java
onView(withId(R.id.date)).check(matches(withText("2008-09-23")));
```

###  More

There is a lot more in the repo, including testing activity launch with intent and unit testing with JUnit. Please check it out:

https://github.com/chiuki/android-test-demo

Further reading:

>
* Instrumentation Testing with Dagger, Mockito, and Espresso
* A JUnit @Rule which launches an activity when your test starts
* EspressoStartGuide
* What’s new in Android Testing
* https://github.com/googlesamples/android-testing

###  更多

这里还有很多示例, 包括使用intent启动的activity的测试和使用JUnit测试的单元测试，请点击下面链接查看:

https://github.com/chiuki/android-test-demo

相关阅读:

>
* Instrumentation Testing with Dagger, Mockito, and Espresso
* A JUnit @Rule which launches an activity when your test starts
* EspressoStartGuide
* What’s new in Android Testing
* https://github.com/googlesamples/android-testing