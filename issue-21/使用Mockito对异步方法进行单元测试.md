# 使用Mockito对异步方法进行单元测试
=====================================================

> * 原文链接 : [Unit testing asynchronous methods with Mockito](http://fernandocejas.com/2014/04/08/unit-testing-asynchronous-methods-with-mockito/)
> * 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
> * 译者 : [Mr.Simple](https://github.com/bboyfeiyu) 

之前我拍着胸脯承诺要维护的我博客，因此才有了这篇文章。但是请忘记我的那些承诺，我今天要写的是关于[Mockito](https://code.google.com/p/mockito/),这是一个当你写单元测试时经常会用到的对象Mock框架。

### **介绍**

这篇文章假设你已经知道了什么是[单元测试](http://en.wikipedia.org/wiki/Unit_testing)以及为什么你要写单元测试。另外，我强烈建议你阅读[Martin
Fowler的这篇文章](http://martinfowler.com/articles/mocksArentStubs.html)。

### **常见的场景**

有些时候我们需要测试有回调的函数,这意味着它们是异步执行的。这些方法测试起来并不那么容易，使用`Thread.sleep(milliseconds)`来等待它们执行完成只能说是一种蹩脚的实现，并且会让你的测试具有不确定性。那么我们如何来对异步函数进行测试呢？[Mockito](https://code.google.com/p/mockito/)拯救了我们！

### 翠花，上一个示例

假设我们有一个实现了`DummyCallback`接口的`DummyCaller`类，在`DummyCaller`中有一个`doSomethingAsynchronously()`函数，该函数会调用`DummyCollaborator`类的`doSomethingAsynchronously(DummyCallback callback)`函数，在调用该函数时将这个callback参数设置为该`DummyCaller`对象。当`doSomethingAsynchronously(DummyCallback callback)`的任务在后台线程中执行完成之后就会回调这个callback。
 
 还是直接看代码会更容易理解 : 
 
 DummyCallback接口 : 
 
```java
public interface DummyCallback {
	public void onSuccess(List<String> result);
	public void onFail(int code);
}
```

DummyCaller类 : 

```java
public class DummyCaller implements DummyCallback {
 	// 执行异步操作的代理类
	private final DummyCollaborator dummyCollaborator;
 	// 执行结果
	private List<String> result = new ArrayList<String>();
 
	public DummyCaller(DummyCollaborator dummyCollaborator) {
		this.dummyCollaborator = dummyCollaborator;
	}
 
	public void doSomethingAsynchronously() {
		dummyCollaborator.doSomethingAsynchronously(this);
	}
 
	public List<String> getResult() {
		return this.result;
	}
 
	@Override
	public void onSuccess(List<String> result) {
		this.result = result;
		System.out.println("On success");
	}
 
	@Override
	public void onFail(int code) {
		System.out.println("On Fail");
	}
}

```
真正的异步执行操作的DummyCollaborator类。

```java
public class DummyCollaborator {
 
	public static int ERROR_CODE = 1;
 
	public DummyCollaborator() {
		// empty
	}
 
	public void doSomethingAsynchronously (final DummyCallback callback) {
		new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Thread.sleep(5000);
					callback.onSuccess(Collections.EMPTY_LIST);
				} catch (InterruptedException e) {
					callback.onFail(ERROR_CODE);
					e.printStackTrace();
				}
			}
		}).start();
	}
}
```

### 创建我们的测试类

我们有2种不同的选择来测试我们的异步函数，但是首先我们先创建一个DummyCollaboratorCallerTest测试类。

```java
public class DummyCollaboratorCallerTest {
 
	// 要测试的类型
	private DummyCaller dummyCaller;
 
	@Mock
	private DummyCollaborator mockDummyCollaborator;
 
	@Captor
	private ArgumentCaptor<DummyCallback> dummyCallbackArgumentCaptor;
 
	@Before
	public void setUp() {
		MockitoAnnotations.initMocks(this);
		dummyCaller = new DummyCaller(mockDummyCollaborator);
	}
}
```

在setup函数中我们使用MockitoAnotations来初始化 Mock和ArgumentCaptor,我们暂时还不需要关心它们。

在这里我们需要关心的是在测试执行之前初始化了Mock对象和被测试的类，这些初始化代码都在setup中。记住，所有要测试的函数都要被测试两次。

让我们来看看下面的两种测试方案。

### 为我们的回调设置一个Anwser

这是我们使用`doAnswer()`来为一个函数进行打桩以测试异步函数的测试用例。这意味着我们需要理解返回一个回调（同步的），当被测试的方法被调用时我们生成了一个通用的anwser,这个回调会被执行。

最后，我们调用了doSomethingAsynchronously函数，并且验证了状态和交互结果。

```java
	@Test
	public void testDoSomethingAsynchronouslyUsingDoAnswer() {
		final List<String> results = Arrays.asList("One", "Two", "Three");
		// 为callback执行一个同步anwser
		doAnswer(new Answer() {
			@Override
			public Object answer(InvocationOnMock invocation) throws Throwable {
				((DummyCallback)invocation.getArguments()[0]).onSuccess(results);
				return null;
			}
		}).when(mockDummyCollaborator).doSomethingAsynchronously(
				any(DummyCallback.class));
 
		// 调用被测试的函数
		dummyCaller.doSomethingAsynchronously();
 
		// 验证状态与结果
		verify(mockDummyCollaborator, times(1)).doSomethingAsynchronously(
				any(DummyCallback.class));
		assertThat(dummyCaller.getResult(), is(equalTo(results)));
	}
```

`[译者注 : 在doAnswer函数中当调用mockDummyCollaborator对象的doSomethingAsynchronously (final DummyCallback callback)函数时会触发Answer匿名内部类的answer(InvocationOnMock invocation)函数]`。

### 使用ArgumentCaptor

第二种实现是使用ArgumentCaptor。在这里我们的callback是异步的: 我们通过ArgumentCaptor捕获传递到DummyCollaborator对象的DummyCallback回调。

最终，我们可以在测试函数级别进行所有验证，当我们想验证状态和交互结果时可以调用`onSuccess()`。

```java
	@Test
	public void testDoSomethingAsynchronouslyUsingArgumentCaptor() {
		// 调用要被测试发函数
		dummyCaller.doSomethingAsynchronously();
 
		final List<String> results = Arrays.asList("One", "Two", "Three");
 
		// Let's call the callback. ArgumentCaptor.capture() works like a matcher.
		verify(mockDummyCollaborator, times(1)).doSomethingAsynchronously(
				dummyCallbackArgumentCaptor.capture());
 
		// 在执行回调之前验证结果
		assertThat(dummyCaller.getResult().isEmpty(), is(true));
 
		// 调用回调的onSuccess函数
		dummyCallbackArgumentCaptor.getValue().onSuccess(results);
 
		// 再次验证结果
		assertThat(dummyCaller.getResult(), is(equalTo(results)));
	}
```

### **结论**

两种实现的主要的不同点是当使用[DoAnswer()](http://mockito.googlecode.com/svn/branches/1.6/javadoc/org/mockito/Mockito.html)方案时我们创建了一个匿名内部类,并且将它的元素从`invocation.getArguments()[n]`转换到我们需要的类型，但是万一我们修改了我们的参数类型，那么这个测试就会'fail fast'。另一方面，当我们使用[ArgumentCaptor](http://docs.mockito.googlecode.com/hg/org/mockito/ArgumentCaptor.html)时我们可能能够更精细的控制测试用例，因为我们能在测试用例中手动调用回调对象。

面对这两种方案，有时候我们不知道作何选择，但是不用担心，因为这是一个常见的问题。以我们的经验来看，同时使用这两种方案来测试异步函数会是一个更可靠的途径。

我希望这篇文章对你有用，另外，请记住，欢迎给这篇文章的反馈，或许还有更好的实现。当然，如果你有任何的疑问也可以联系我。

### **示例代码**

[代码这里](https://github.com/android10/Inside_Android_Testing)。这些代码都是关于Java和Android的，因为我们在几个月前做了一场相关的演讲。

### 深入拓展

我强烈建议你阅读[Mockito文档](http://mockito.googlecode.com/svn/branches/1.6/javadoc/org/mockito/Mockito.html)以对这个框架有更深入的了解，这份文档非常清晰，并且有非常棒的示例！
