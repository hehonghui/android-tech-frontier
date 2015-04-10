功能测试框架 espresso
---

>
* 原文标题 : the-hitchhikers-guide-to-android-testing-part-2-espresso
* 原文链接 : [the-hitchhikers-guide-to-android-testing-part-2-espresso](http://wiebe-elsinga.com/blog/the-hitchhikers-guide-to-android-testing-part-2-espresso/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: 
* 状态 :  未完成

![VtFd68Pr19fYk.](http://7xi8kj.com1.z0.glb.clouddn.com/VtFd68Pr19fYk.gif)

As mentioned in the [first article Ali Derbane](https://plus.google.com/+AliDerbane) and me wrote about Android Functional Testing, there are a lot of frameworks you can use. In this second part of the journey I will be explaining the functional testing framework called [Espresso](https://code.google.com/p/android-test-kit/).



### Introduction

Introduced at the GTAC in 2013, Espresso is designed to be used in environments where the developers write their own tests, and makes it possible to write concise, beautiful, and reliable Android UI tests quickly.

Espresso has several general components:

- The `Espresso` class offers the `onView` and `onData` methods which, alone, can be used for a good numbers of possible tests on a given interface.
- `ViewMatchers` contains a collection of objects that implements the interface `Matcher <? super View>`. Using this Class you can collect and check View elements. For example, getting a View element (Button) with text “7”.
- `ViewActions` contains a collection of `viewAction` objects to perform actions on a view. These actions are passed to the method `ViewInteraction.perform` and may contain multiple actions. For example, clicking on a View element (Button).
- `ViewAssertions` contains a collection of `ViewAssertion` to conduct checks on views.

To illustrate these components a test can look like this:

```java
Espresso.onView(ViewMatchers.withText("7")).perform(ViewActions.click());
Espresso.onView(withId(R.id.result)).check(ViewAssertions.matches(ViewMatchers.withText("42")));
 ```

 And the good news, as of last year Google has introduced a [Testing Support Library](https://developer.android.com/tools/support-library/index.html) containing Espresso. So lets start by implementing Espresso.

> 
To illustrate, we are going to write some tests that tests agains a [Android calculator application](https://github.com/welsinga/sample_espresso/app). The common test scenario we will be implementing is testing if ‘6’ x ‘7’ equals ‘42’.
>


 ### Define the test runner

 To use Espresso we first need to define who is running the tests. Espresso uses a new runner named AndroidJUnitRunner. This runner, based on `InstrumentationTestRunner` and `GoogleInstrumentationTestRunner`, runs JUnit3 and JUnit4 tests against your Android application.

 First add the dependencies to your `build.gradle`, assuming you have installed the [Testing Support Library](https://developer.android.com/tools/support-library/index.html).

 ```gradle
 dependencies {
  androidTestCompile 'com.android.support.test:testing-support-lib:0.1'
}
```

Then add the runner in your `build.gradleandroid.defaultConfig` configuration:

```gradle
defaultConfig {
  ...
  testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
}
```



### Writing the test

As you may know test classes must be in `src\androidTest\com.example.package.tests`, com.example.package being the package specified in the package attribute of the manifest element in the `AndroidManifest` file. 

Also each test class must extend the abstract class `ActivityInstrumentationTestCase2` and supply the Test Activity as generic type that will be used by default for testing.

It must also be passed to the superclass via the `super()`. To make the Test Activity being called by the test framework, simply define a setup which calls the synchronous method `getActivity()`.

```java
public class FunctionalInstrumentationTest extends ActivityInstrumentationTestCase2<ActivityToTest> {

    public FunctionalInstrumentationTest() {
        super(ActivityToTest.class);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        getActivity();
    }
}
```

As mentioned we want to check if ‘6’ x ‘7’ equals ‘42’.

```java
public void testAnswer_to_the_Ultimate_Question_of_Life_the_Universe_and_Everything() {
        onView(withText("7")).perform(click());
        onView(withText("×")).perform(click());
        onView(withText("6")).perform(click());
        onView(withText("=")).perform(click());

        onView(withId(R.id.resText)).check(matches(withText("42")));
    }
```

You may have noticed, this example is using static imports. This is solely done to make the code more readable.

Other actions you want to use are:

- `pressBack()`; to simulate the use of the “back” button,
- `isDisplayed()`; to check if an element is being shown and
- `scrollTo()`; to scroll to an element.



### Running the test

Now lets do the fun part, lets run the test. This can be done from the command line with he command line with `gradle clean assembleDebug connectedAndroidTest` or using Android Studio by:

1. Open Run menu | Edit Configurations
2. Add a new Android Tests configuration
3. Choose the module you are testing
4. Define our test runner: `android.support.test.runner.AndroidJUnitRunner`

![10OjZwNlstPj9e](http://7xi8kj.com1.z0.glb.clouddn.com/10OjZwNlstPj9e.gif)

So now you know a bit more about Espresso. If you want to know more, you may want to visit:

- [Espresso website](https://code.google.com/p/android-test-kit/)
- [Github repo corresponding to this article](https://github.com/welsinga/sample_espresso)
- [General Espresso Github samples by Google](https://github.com/googlesamples/android-testing)