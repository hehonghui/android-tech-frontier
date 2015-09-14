使用Robolectric的参数化测试
---

>
* 原文标题 : Parameterized testing with Robolectric
* 原文链接 : [Parameterized testing with Robolectric](http://www.jayway.com/2015/03/19/parameterized-testing-with-robolectric/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: [Chaos](https://github.com/chaossss)   
* 状态 :  校对完成

在目前的项目中我们使用Robolectric为Android应用程序编写单元测试,它一直都干的不错。最近我需要编写一个测试用例,通过每次使用不同的测试数据，将同一个操作执行若干次，并由此断言：正确的动作能否发生是由数据决定的。

JUnit对于这个情况提供了一个易于使用的选项，它叫做参数化测试-先定义测试数据，,然后使用参数化测试运行器来执行测试。这将创建一个该测试类的实例把测试数据中的每个元素传递到构造函数的参数中。

事实证明，Robolectric有一个完全相同的`ParameterizedRobolectricTestRunner`(稍微调整以适应Robolectric)，而且它对于我的测试：验证应用程序从外部服务提供者接收到不同的错误代码的行为，做的非常好

```java
@RunWith(ParameterizedRobolectricTestRunner.class)
public class ContactServiceTest {
 
    @ParameterizedRobolectricTestRunner.Parameters(name = "ErrorCode = {0}")
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][]{
                {105, 105_ERROR_MSG},
                {113, 113_ERROR_MSG},
                {114, 114_ERROR_MSG},
                {134, 134_ERROR_MSG},
                {137, 137_ERROR_MSG},
                {999, DEFAULT_ERROR_MSG} // Bogus错误代码
        });
    }
 
    private int errorCode;
    private String expectedErrorMsg;
 
    public ContactServiceTest(int errorCode, String errorMsg) {
        this.errorCode = errorCode;
        this.expectedErrorMsg = errorMsg;
    }
 
    @Test
    public void when_known_error_code_is_received_from_service_correct_error_msg_is_displayed_to_user() {
        // HTTP响应从服务包含定义的错误代码
        Robolectric.addPendingHttpResponse(HttpStatus.SC_OK, buildFakeServiceResponse(errorCode)); 
        // 联系服务
        mService.contactService();
        // 使用awaitility等到错误消息显示给用户
		// 然后断言该错误代码与期望一致
        await().until(getDisplayedErrorMsg(), is(expectedErrorMsg));
    }
```

该测试用例将被执行6次，一旦遍历测试数据的每个元素，就会将打印的错误消息与特定错误代码定义的错误消息相比较。当创建测试报告时，每一个测试运行都将视为其自身的测试用例。

添加了`name`参数到Parameters注解上将会整理测试结果。作为测试运行结果显示,测试用例的名称将会像下面这种情况下

```java
when_known_error_code_is_received_from_service_correct_error_msg_is_displayed_to_user[ErrorCode = 105]
when_known_error_code_is_received_from_service_correct_error_msg_is_displayed_to_user[ErrorCode = 113]
when_known_error_code_is_received_from_service_correct_error_msg_is_displayed_to_user[ErrorCode = 114]
...
```

如需深入理解请查阅[JUnit Theories](https://github.com/junit-team/junit/wiki/Theories)以及[junit-quickcheck](https://github.com/pholser/junit-quickcheck)，一个好的生成测试数据的方法是在JUnit中自动生成（Robolectric也差不多），而不是由你自己定义。