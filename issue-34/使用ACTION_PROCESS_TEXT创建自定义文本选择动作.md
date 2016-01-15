使用ACTION_PROCESS_TEXT创建自定义文本选择动作
---

> * 原文链接 : [Creating custom Text Selection actions with ACTION_PROCESS_TEXT](https://medium.com/google-developers/custom-text-selection-actions-with-action-process-text-191f792d2999?linkId=20000023#.eqi4s7tvh)
* 原文作者 : [Ian Lake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 


###使用ACTION_PROCESS_TEXT创建自定义文本选择动作

Android 6.0引入了一个新的[浮动文本选择工具栏](http://www.google.com/design/spec/patterns/selection.html#selection-text-selection)，带来了标准的文本选择动作，如剪切，复制，和粘贴，可以更方便处理你选择的文本。甚至更好的是可以通过新的[_ACTION_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#ACTION_PROCESS_TEXT) 让 **任何应用** 添加自定义actions（动作）到文本选择工具栏上成为可能。

![text_selection_toolbar](https://cloud.githubusercontent.com/assets/4308480/12228682/f420cad4-b879-11e5-8f64-e8f3d34fc765.gif)


Android 6.0上的文本选择工具栏


像 [Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia) （维基百科）和 [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate) （谷歌翻译）应用已经利用它用来立即查找或翻译选中的文本。


你可能已经看到了关于确保文本选择工具条出现在你的应用中的[文档](http://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-text-selection)和[博客](http://android-developers.blogspot.com/2015/10/in-app-translations-in-android.html)。简而言之：使用一个标准的TextView/EditText就可以了，需要注意的是如果你使用的是 [_AppCompatActivity_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html) 并且想在API 23+的设备上使用本地悬浮文本选择工具条，EditText 需要设置android:id并且得调用[_getDelegate()_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html#getDelegate%28%29)_._[_setHandleNativeActionModesEnabled(false)_](http://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html#setHandleNativeActionModesEnabled%28boolean%29)。


但是怎么找到**实现** _ACTION_PROCESS_TEXT_ 的信息并且**添加你自己的actions （动作）呢**？这就是本文要介绍的内容。


###跨应用之间的通信-> Intent Filters

如您所料，当构建跨应用的功能时，其它应用可以查询你的Android清单和每个组件的[intent filters](http://developer.android.com/guide/components/intents-filters.html)作为一个公共API。


ACTION_PROCESS_TEXT 也一样。你得在清单文件添加一个intent filter到一个Activity上。

```
<activity android:name=”@string/process_text_action_name”>
  <intent-filter>
    <action android:name=”android.intent.action.PROCESS_TEXT”/
    <category android:name=”android.intent.category.DEFAULT” />
    <data android:mimeType=”text/plain” />
  </intent-filter>
</activity>
```


如果你想要多个actions ，你需要添加对应的activities 。如果你的应用构建了特定的功能不想被其它应用使用，你可以添加android:exported=”false”来确保action 只会出现在你的应用中。


注意**你的Activity 的 android:name 将会作为action 显示在文本选择工具栏上**，因此应该确保它是简短的，一个动作动词，并且能辨认出你的应用。例如，Google翻译使用了‘Translate’，这是一个不太常见的action（有多少人安装了多个翻译应用？），Wikipedia 使用的是 ‘Search Wikipedia’ 作为搜索，这可能对于很多应用来说是一个更常见的action 。

###获取选择的文本

一旦你设置了intent filter，其它应用就可以通过选择文本然后从文本选择工具栏选择你的action 打开你的activity 。但这并没有任何价值，除非你用到了所选择的文本。


[_EXTRA_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT) 的出现：它是一个包含在Intent 内的  [_CharSequence_](http://developer.android.com/reference/java/lang/CharSequence.html)表示选择的文本。不要被欺骗——尽管你使用了text/plain intent filter，你会得到包含[_Spannable_](http://developer.android.com/reference/android/text/Spannable.html)的完整CharSequence，如果你在你的应用中直接使用CharSequence，你可能会注意到一些样式，因此不必惊讶（你也可以调用[_toString()_](http://developer.android.com/reference/java/lang/CharSequence.html#toString%28%29)来移除所有格式）。

因此你的_onCreate()_方法可能和下面类似：

<pre name="5687" id="5687" class="graf--pre graf-after--p">@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  setContentView(R.layout.process_text_main);
  CharSequence text = getIntent()
      .getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
  // process the text
}</pre>


如果你使用_android:launchMode=”singleTop”_会有一个警告，你也可以在[_onNewIntent()_](http://developer.android.com/reference/android/app/Activity.html#onNewIntent%28android.content.Intent%29)处理文本——常见的做法是在_onCreate()_ 和 _onNewIntent()_ 都调用 _handleIntent()_ 方法。


如果你使用 ACTION_PROCESS_TEXT作为进入你应用的入口，上面就是所有你需要知道的：之后用来做什么取决于你。

###返回一个结果

在ACTION_PROCESS_TEXT Intent还有一个extra ：[_EXTRA_PROCESS_TEXT_READONLY_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT_READONLY)。这个额外的_boolean_ 值表示你接收到的选择的文本是否可以被用户编辑（例如在一个_EditText_内）。

你可以像下面的代码一样接收这个额外的值
<pre name="a59d" id="a59d" class="graf--pre graf-after--p">boolean readonly = getIntent()
  .getBooleanExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, false);</pre>


你可以使用提供**返回修改后的文本给发送的应用**的能力作为一个提示，**替换选择的文本**。当你Activity 使用[_startActivityForResult()_](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult%28android.content.Intent,%20int%29)方式开启才会起作用——你可以在Activity 结束之前调用[_setResult()_](http://developer.android.com/reference/android/app/Activity.html#setResult%28int,%20android.content.Intent%29)返回[一个结果](http://developer.android.com/training/basics/intents/filters.html#ReturnResult)：

```
Intent intent = new Intent();
intent.putExtra(Intent.EXTRA_PROCESS_TEXT, replacementText);
setResult(RESULT_OK, intent);
```


你可以想象一个‘Replace’按钮调用 _setResult()_  随后调用[_finish()_](http://developer.android.com/reference/android/app/Activity.html#finish%28%29)返回到调用的Activity。

###常见问题

在你写回复之前，这有一些关于ACTION_PROCESS_TEXT的常见问题：

####Q：我能使用ACTION_PROCESS_TEXT开启一个Service 吗？

A: 不能直接开启——系统只会检查包含正确的intent filter的Activities。这不意味着你不能用一个[_Theme.Translucent.NoTitleBar_](https://developer.android.com/reference/android/R.style.html#Theme_Translucent_NoTitleBar)主题或[_Theme.NoDisplay_](https://developer.android.com/reference/android/R.style.html#Theme_NoDisplay)（只要你[立即销毁Activity](https://plus.google.com/105051985738280261832/posts/LjnRzJKWPGW)）主题的Activity 开启Service ，但要确保它们的action 可以接收到一些用户可见的提示——开启一个notification ，[Toast](http://developer.android.com/reference/android/widget/Toast.html)等。

####Q：我能只用某些类型的文本触发它吗？

A: 不能。任何人选择文本的时候你的选项都会出现。当然，用户可以不选择 ‘Translate’ 选项，除非他们想翻译等，当你不能确定你将会接收到什么类型的文本时需要很小心地作出处理。


####Q：每个应用都应该实现ACTION_PROCESS_TEXT吗？会不会有点疯狂？

A：是的，确实有点疯狂，不用每个应用都实现ACTION_PROCESS_TEXT。确保你实现的actions 是**通用的**并且对于安装你应用的用户来说是**真正有用的**。


###了解更多
除了上面提到的[Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia)和 [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate)包含了很好真实的例子，你也可以看看安装在Marshmallow 模拟器上的ApiDemos 应用或直接[查看代码](https://android.googlesource.com/platform/development/+/master/samples/ApiDemos/src/com/example/android/apis/content/ProcessText.java)。


###开发优秀的应用

在[Google+](https://plus.google.com/+AndroidDevelopers/posts/T4dgC9FRMNj)加入讨论并且关注[Android Development Patterns Collection](https://plus.google.com/collection/sLR0p)了解更多！
