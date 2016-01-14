使用ACTION_PROCESS_TEXT创建自定义文本选择动作
---

> * 原文链接 : [Creating custom Text Selection actions with ACTION_PROCESS_TEXT](https://medium.com/google-developers/custom-text-selection-actions-with-action-process-text-191f792d2999?linkId=20000023#.eqi4s7tvh)
* 原文作者 : [Ian Lake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [yuweiguocn](https://github.com/yuweiguocn) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 


### Creating custom Text Selection actions with ACTION_PROCESS_TEXT

###使用ACTION_PROCESS_TEXT创建自定义文本选择动作

Android 6.0 Marshmallow introduced a new [floating text selection toolbar](http://www.google.com/design/spec/patterns/selection.html#selection-text-selection), which brings the standard text selection actions, like cut, copy, and paste, closer to the text you’ve selected. Even better though is the new [_ACTION_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#ACTION_PROCESS_TEXT) which makes it possible for **any app** to add custom actions to that text selection toolbar.

Android 6.0棉花糖引入了一个新的[浮动文本选择工具栏](http://www.google.com/design/spec/patterns/selection.html#selection-text-selection)，带来了标准的文本选择动作，如剪切，复制，和粘贴，可以更方便处理你选择的文本。甚至更好的是可以通过新的[_ACTION_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#ACTION_PROCESS_TEXT) 让 **任何应用** 添加自定义actions（动作）到文本选择工具栏上成为可能。

![text_selection_toolbar](https://cloud.githubusercontent.com/assets/4308480/12228682/f420cad4-b879-11e5-8f64-e8f3d34fc765.gif)

The text selection toolbar in Android 6.0

Android 6.0上的文本选择工具栏


Apps like [Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia) and [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate) are already taking advantage of it to instantly lookup or translate selected text.

像 [Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia) （维基百科）和 [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate) （谷歌翻译）应用已经利用它用来立即查找或翻译选中的文本。

You may have already seen [documentation](http://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-text-selection) and a [blog post](http://android-developers.blogspot.com/2015/10/in-app-translations-in-android.html) about ensuring the text selection toolbar and options appear in your app (in short: using a standard _TextView_/_EditText_ and they’ll work out of the box, but note your _EditText_ would need to have an _android:id_ set and you need to call [_getDelegate()_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html#getDelegate%28%29)_._[_setHandleNativeActionModesEnabled(false)_](http://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html#setHandleNativeActionModesEnabled%28boolean%29) if you are using [_AppCompatActivity_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html) and want to use the native floating text selection toolbar on API 23+ devices).

你可能已经看到了关于确保文本选择工具条出现在你的应用中的[文档](http://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-text-selection)和[博客](http://android-developers.blogspot.com/2015/10/in-app-translations-in-android.html)。简而言之：使用一个标准的TextView/EditText就可以了，需要注意的是如果你使用的是 [_AppCompatActivity_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html) 并且想在API 23+的设备上使用本地悬浮文本选择工具条，EditText 需要设置android:id并且得调用[_getDelegate()_](http://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html#getDelegate%28%29)_._[_setHandleNativeActionModesEnabled(false)_](http://developer.android.com/reference/android/support/v7/app/AppCompatDelegate.html#setHandleNativeActionModesEnabled%28boolean%29)。

But finding information on **implementing** _ACTION_PROCESS_TEXT_ and **adding your own actions**? That’s what this post will cover.

但是怎么找到**实现** _ACTION_PROCESS_TEXT_ 的信息并且**添加你自己的actions （动作）呢**？这就是本文要介绍的内容。

### Cross app communication -&gt; Intent Filters

###跨应用之间的通信-> Intent Filters

As you might expect when building functionality that crosses app boundaries, your Android Manifest and the [intent filters](http://developer.android.com/guide/components/intents-filters.html) attached to each component serve as a public API that other apps can query.

如您所料，当构建跨应用的功能时，其它应用可以查询你的Android清单和每个组件的[intent filters](http://developer.android.com/guide/components/intents-filters.html)（意图过滤器）作为一个公共API。

_ACTION_PROCESS_TEXT_ is no different. You’ll add an intent filter to an Activity in your manifest:
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

And, if you wanted multiple actions (you overachiever, you!), you’ll need separate activities for each. If you’re building functionality specific to your app that wouldn’t actually make sense to include in other apps, you can add _android:exported=”false”_ to ensure the action only appears within your app.

如果你想要多个actions ，你需要添加对应的activities 。如果你的应用构建了特定的功能不想被其它应用使用，你可以添加android:exported=”false”来确保action 只会出现在你的应用中。

Note that **the _android:name_ of your Activity will show up as the action in the text selection toolbar** so ensure it is short, an action verb, and recognizable as something iconic with your app. For example, Google Translate uses ‘Translate’ as it is a less common action (how many people have multiple translation apps installed?), while Wikipedia uses ‘Search Wikipedia’ as searching may be a much more common action for many apps.

注意**你的Activity 的 android:name 将会作为action 显示在文本选择工具栏上**，因此应该确保它是简短的，一个动作动词，并且能辨认出你的应用。例如，Google翻译使用了‘Translate’，这是一个不太常见的action（有多少人安装了多个翻译应用？），Wikipedia 使用的是 ‘Search Wikipedia’ 作为搜索，这可能对于很多应用来说是一个更常见的action 。

### Getting the selected text
###获取选择的文本

Once you get your intent filter set up, other apps will already be able to start your activity by selecting text and choosing your action from the text selection toolbar. But that doesn’t add any value unless you actually look at the text that was selected.

一旦你设置了intent filter，其它应用就可以通过选择文本然后从文本选择工具栏选择你的action 打开你的activity 。但这并没有任何价值，除非你用到了所选择的文本。

That’s where [_EXTRA_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT) comes in: it is a [_CharSequence_](http://developer.android.com/reference/java/lang/CharSequence.html) included in the Intent that represents what text was selected. Don’t be deceived — even though you are using a _text/plain_ intent filter, you’ll get the full _CharSequence_ with any [_Spannable_](http://developer.android.com/reference/android/text/Spannable.html)s included, so don’t be surprised if you notice some styling if you use the _CharSequence_ directly in your app (you can always call [_toString()_](http://developer.android.com/reference/java/lang/CharSequence.html#toString%28%29) to remove all formatting).

[_EXTRA_PROCESS_TEXT_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT) 的出现：它是一个包含在Intent 内的  [_CharSequence_](http://developer.android.com/reference/java/lang/CharSequence.html)表示选择的文本。不要被欺骗———尽管你使用了text/plain intent filter，你会得到包含[_Spannable_](http://developer.android.com/reference/android/text/Spannable.html)的完整CharSequence，如果你在你的应用中直接使用CharSequence，你可能会注意到一些样式，因此不必惊讶（你也可以调用[_toString()_](http://developer.android.com/reference/java/lang/CharSequence.html#toString%28%29)来移除所有格式）。

Therefore your _onCreate()_ method may look something like:

因此你的_onCreate()_方法可能和下面类似：

<pre name="5687" id="5687" class="graf--pre graf-after--p">@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  setContentView(R.layout.process_text_main);
  CharSequence text = getIntent()
      .getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
  // process the text
}</pre>

With one caveat if you are using _android:launchMode=”singleTop”_, then you’ll also want to process text in [_onNewIntent()_](http://developer.android.com/reference/android/app/Activity.html#onNewIntent%28android.content.Intent%29) as well — a common practice is to have both _onCreate()_ and _onNewIntent()_ call a single _handleIntent()_ method you create.

如果你使用_android:launchMode=”singleTop”_会有一个警告，你也可以在[_onNewIntent()_](http://developer.android.com/reference/android/app/Activity.html#onNewIntent%28android.content.Intent%29)处理文本———常见的做法是在_onCreate()_ 和 _onNewIntent()_ 都调用 _handleIntent()_ 方法。

And that’s about all you’d need if you are using _ACTION_PROCESS_TEXT_ as an entryway into your app: what you do with it after that point is up to you.

如果你使用 ACTION_PROCESS_TEXT作为进入你应用的入口，上面就是所有你需要知道的：之后用来做什么取决于你。

### Returning a result
###返回一个结果
There’s one other extra included in the _ACTION_PROCESS_TEXT_ _Intent_ though: [_EXTRA_PROCESS_TEXT_READONLY_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT_READONLY). This _boolean_ extra denotes whether the selected text you just received can be edited by the user (such as would be the case in an _EditText_).

在ACTION_PROCESS_TEXT Intent还有一个extra ：[_EXTRA_PROCESS_TEXT_READONLY_](http://developer.android.com/reference/android/content/Intent.html#EXTRA_PROCESS_TEXT_READONLY)。这个额外的_boolean_ 值表示你接收到的选择的文本是否可以被用户编辑（例如在一个_EditText_内）。

You’d retrieve the extra with code such as

你可以像下面的代码一样接收这个额外的值
<pre name="a59d" id="a59d" class="graf--pre graf-after--p">boolean readonly = getIntent()
  .getBooleanExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, false);</pre>

You can use this as a hint to offer the ability to **return altered text to the sending app, replacing the selected text**. This works as your Activity was actually started with [_startActivityForResult()_](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult%28android.content.Intent,%20int%29) — you’ll be able to [return a result](http://developer.android.com/training/basics/intents/filters.html#ReturnResult) by calling [_setResult()_](http://developer.android.com/reference/android/app/Activity.html#setResult%28int,%20android.content.Intent%29) at any time prior to your Activity finishing:

你可以使用提供**返回修改后的文本给发送的应用**的能力作为一个提示，**替换选择的文本**。当你Activity 使用[_startActivityForResult()_](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult%28android.content.Intent,%20int%29)方式开启才会起作用——你可以在Activity 结束之前调用[_setResult()_](http://developer.android.com/reference/android/app/Activity.html#setResult%28int,%20android.content.Intent%29)返回[一个结果](http://developer.android.com/training/basics/intents/filters.html#ReturnResult)：

```
Intent intent = new Intent();
intent.putExtra(Intent.EXTRA_PROCESS_TEXT, replacementText);
setResult(RESULT_OK, intent);
```

You could imagine a button to ‘Replace’ would call _setResult()_ followed by [_finish()_](http://developer.android.com/reference/android/app/Activity.html#finish%28%29) to return back to the calling Activity.



你可以想象一个‘Replace’按钮调用 _setResult()_  随后调用[_finish()_](http://developer.android.com/reference/android/app/Activity.html#finish%28%29)返回到调用的Activity。

### Common questions

Before you start writing responses, here’s some common questions about _ACTION_PROCESS_TEXT:_

###常见问题

在你写回复之前，这有一些关于ACTION_PROCESS_TEXT的常见问题：

#### Q: Can I trigger a Service with _ACTION_PROCESS_TEXT_?

A: Not directly — the system only looks for Activities that contain the correct intent filter. That doesn’t mean you can’t have your Activity launch a Service using a theme of [_Theme.Translucent.NoTitleBar_](https://developer.android.com/reference/android/R.style.html#Theme_Translucent_NoTitleBar) or even [_Theme.NoDisplay_](https://developer.android.com/reference/android/R.style.html#Theme_NoDisplay) (as long as you [immediately finish the Activity](https://plus.google.com/105051985738280261832/posts/LjnRzJKWPGW)), but make sure you have some user visible hint that their action was received — a notification starting, a [Toast](http://developer.android.com/reference/android/widget/Toast.html), etc.

####Q：我能使用ACTION_PROCESS_TEXT开启一个Service 吗？

A: 不能直接开启——系统只会检查包含正确的intent filter的Activities。这不意味着你不能用一个[_Theme.Translucent.NoTitleBar_](https://developer.android.com/reference/android/R.style.html#Theme_Translucent_NoTitleBar)主题或[_Theme.NoDisplay_](https://developer.android.com/reference/android/R.style.html#Theme_NoDisplay)（只要你[立即销毁Activity](https://plus.google.com/105051985738280261832/posts/LjnRzJKWPGW)）主题的Activity 开启Service ，但要确保它们的action 可以接收到一些用户可见的提示——开启一个notification ，[Toast](http://developer.android.com/reference/android/widget/Toast.html)等。

#### Q: Can I trigger it only for certain types of text?

A: Nope. Your option will appear every time anyone selects text. Of course, chances are users won’t select an option to ‘Translate’ unless they want to translate, etc., but I’d be careful to code defensively as you cannot be sure what type of text context you’ll receive.

####Q：我能只用某些类型的文本触发它吗？

A: 不能。任何人选择文本的时候你的选项都会出现。当然，用户可以不选择 ‘Translate’ 选项，除非他们想翻译等，当你不能确定你将会接收到什么类型的文本时需要很小心地作出处理。

#### Q: So should every app implement _ACTION_PROCESS_TEXT_? Wouldn’t that be madness?

A: Yes, that would be madness and no, not every app should implement _ACTION_PROCESS_TEXT_. Make sure any actions you implement **are universal and truly useful** to users who have your app installed.

####Q：每个应用都应该实现ACTION_PROCESS_TEXT吗？会不会有点疯狂？

A：是的，确实有点疯狂，不用每个应用都实现ACTION_PROCESS_TEXT。确保你实现的actions 是**通用的**并且对于安装你应用的用户来说是**真正有用的**。

### Learn more

Besides the aforementioned [Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia) and [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate) which already contain good, real world examples, you can also check out the ApiDemos app installed on Marshmallow emulators or [look at the code](https://android.googlesource.com/platform/development/+/master/samples/ApiDemos/src/com/example/android/apis/content/ProcessText.java) directly.

###了解更多
除了上面提到的[Wikipedia](https://play.google.com/store/apps/details?id=org.wikipedia)和 [Google Translate](https://play.google.com/store/apps/details?id=com.google.android.apps.translate)包含了很好真实的例子，你也可以看看安装在Marshmallow 模拟器上的ApiDemos 应用或直接[查看代码](https://android.googlesource.com/platform/development/+/master/samples/ApiDemos/src/com/example/android/apis/content/ProcessText.java)。

###BuildBetterApps

Join the discussion on the [Google+ post](https://plus.google.com/+AndroidDevelopers/posts/T4dgC9FRMNj) and follow the [Android Development Patterns Collection](https://plus.google.com/collection/sLR0p) for more!

###开发优秀的应用

在[Google+](https://plus.google.com/+AndroidDevelopers/posts/T4dgC9FRMNj)加入讨论并且关注[Android Development Patterns Collection](https://plus.google.com/collection/sLR0p)了解更多！
