Espresso:保存和恢复状态
---

> * 原文链接 : [Espresso: Save and restore state](http://blog.sqisland.com/2015/10/espresso-save-and-restore-state.html?utm_source=Android+Weekly&utm_campaign=553bcbfc02-Android_Weekly_174&utm_medium=email&utm_term=0_4eb677ad19-553bcbfc02-337955857)
* 原文作者 : [Chiu-Ki Chan](http://blog.sqisland.com)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成  
  
你保存并且恢复activities,fragments和自定义视图的状态吗?你有测试过吗?
  
一种测试保存和恢复状态的方法就是在你的Espresso测试中旋转屏幕.

	private void rotateScreen() {
		Context context = InstrumentationRegistry.getTargetContext();
		int orientation = context.getResources().getConfiguration().orientation;
		
		Activity activity = activityRule.getActivity();
		activity.setRequestedOrientation(
				(orientation == Configuration.ORIENTATION_PORTRAIT) ?
          		ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE :
          		ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
	}

 
有了上面的辅助方法,你可以写出如下的测试:

	@Test
	public void incrementTwiceAndRotateScreen() {
		onView(withId(R.id.count))
      	.check(matches(withText("0")));
      	
      	onView(withId(R.id.increment_button))
      	.perform(click(), click());
      	onView(withId(R.id.count))
      	.check(matches(withText("2")));
      	
      	rotateScreen();
      	
      	onView(withId(R.id.count))
      	.check(matches(withText("2")));
	}
 
[源码](https://github.com/chiuki/espresso-samples/tree/master/rotate-screen)