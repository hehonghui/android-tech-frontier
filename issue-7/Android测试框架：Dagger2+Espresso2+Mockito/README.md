## Android测试框架: Dagger 2 + Espresso 2 + Mockito
---

>* 原文链接 : [Dagger 2 + Espresso 2 + Mockito](http://blog.sqisland.com/2015/04/dagger-2-espresso-2-mockito.html)
> * [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [yaoqinwei](https://github.com/yaoqinwei) 
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 :  完成

我一直在用Dagger, Espresso和Mockito做Android测试，爱死这个组合了！为了庆祝[Dagger 2](http://google.github.io/dagger/)的推出，我分享了一个用Dagger 2, Espresso 2和Mockito做Android测试的[Demo](https://github.com/chiuki/android-test-demo)

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

###  更多

这里还有很多示例, 包括使用intent启动的activity的测试和使用JUnit测试的单元测试，请点击下面链接查看:

[Click Me](https://github.com/chiuki/android-test-demo)

相关阅读:

>* [Instrumentation Testing with Dagger, Mockito, and Espresso](http://engineering.circle.com/instrumentation-testing-with-dagger-mockito-and-espresso/)
* [A JUnit @Rule which launches an activity when your test starts](https://gist.github.com/JakeWharton/1c2f2cadab2ddd97f9fb)
* [EspressoStartGuide](https://code.google.com/p/android-test-kit/wiki/EspressoStartGuide) 
* [What’s new in Android Testing](http://wiebe-elsinga.com/blog/whats-new-in-android-testing/)
* [https://github.com/googlesamples/android-testing](https://github.com/googlesamples/android-testing)
