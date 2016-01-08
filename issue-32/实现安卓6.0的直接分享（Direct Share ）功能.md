实现Android6.0的直接分享（Direct Share ）功能
---

> * 原文链接 : [Implementing Android Marshmallow Direct Share](https://www.bignerdranch.com/blog/implementing-android-marshmallow-direct-share/)
* 原文作者 : [Matt Compton](https://www.bignerdranch.com/about-us/nerds/matt-compton/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [Davidrou](https://github.com/davidrou) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  翻译完成 




直接分享（Direct Share ）是在Android6.0（棉花糖版本）的一个新功能，允许用户在一个应用里面分享内容到其他地方，比如联系人。
核心思想是，用户可以直接分享相关内容而无需先打开一个的应用程序再去分享，这样直接分享允许用户跳过通常的分享流程中的一个步骤。



我遇到的直接分享这个功能是在研究[Android Platform Features](https://training.bignerdranch.com/classes/one-day-android-platform-features) 和 [Community Tools](https://training.bignerdranch.com/classes/one-day-android-community-tools) 课程的时候，现在它成了我的最喜欢的Android6.0的新特性。




##直接分享概要
直接分享的一个很好的例子是分享内容给一个社交应用的联系人。最终就像这样：
![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-example.png)



随着Hangouts的出现，在短信和收件箱底部，通常会出现分享选择对话框。然而，直接分享是在这个分享对话框顶部列出的各种联系人。而不是点击分享，然后点击分享到的应用，比如说点击Hangouts。最重要的联系人出现在选择对话框里面。在这个流程，用户没有点击进入Hangouts应用并选择一个联系人，而是能够立即选择联系人。

举一个例子比较一下：使用一个示例应用程序，只分享一点文本到选定的联系人。

这是Android5.0的分享对话框：

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-L.png)


这是Android6.0使用直接分享的对话框：

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-M.png)


现在，在这两个Android系统运行的是同一个应用，在低版本的系统中，默认显示了低版本的Android的标准选择对话框。所以，直接分享功能可以被添加到新版本，同时也兼容旧版本。


##建立一个ChooserTargetService
所以直接分享可以节省用户的时间，使分享过程更加方便。那我们如何实现直接分享呢？

第一步是创建一个服务，继承ChooserTargetService，例如以下SampleChooserTargetService.java：
~~~java
public class SampleChooserTargetService extends ChooserTargetService {
  @Override
  public List<ChooserTarget> onGetChooserTargets(ComponentName targetActivityName, IntentFilter matchedFilter) {
    final List<ChooserTarget> targets = new ArrayList<>();
    for (int i = 0; i < length; i++) {
      final String targetName = ...
      final Icon targetIcon = ...
      final float targetRanking = ...
      final ComponentName targetComponentName = ...
      final Bundle targetExtras = ...
      targets.add(new ChooserTarget(
          targetName, targetIcon, targetRanking, targetComponentName, targetExtras
      ));
    }
    return targets;
  }
}
~~~



重写ongetchoosertargets()方法，返回一个ChooserTarget的List，作为直接分享对话框的选项。

每个ChooserTarget有几个参数：
* 目标名称
* 目标图标
* 这一目标的排序分数（0.0f，1.0f之间），在直接分享的目标太多时使用，低分的选项直接忽略。
* 选定目标后，启动的组件
* 在启动下一个组件之前，将添加到原始Intent中的一个附加Bundle



在选择对话框中目标列表的顺序，和我们提供的List的顺序相同。在创建列表的时候，所有的目标已经完成排序。

你如何创造这些目标有你决定，但通常ChooserTarget信息是由具体应用的模型层model layer决定。

##更新 Android Manifest

创建ChooserTargetService之后，我们需要把他挂载到我们的应用上，这样系统才知道这个service ，才能去使用这个service 

首先，你需要在AndroidManifest.xml声明 自定义的ChooserTargetService ：

~~~java
<service
    android:name=".SampleChooserTargetService"
    android:label="@string/app_name"
    android:permission="android.permission.BIND_CHOOSER_TARGET_SERVICE">
    <intent-filter>
        <action android:name="android.service.chooser.ChooserTargetService" />
    </intent-filter>
</service>
~~~


这样就实现了两点：
>* 给这个Service绑定了android.permission.BIND_CHOOSER_TARGET_SERVICE权限
* 引入了一个IntentFilter ，action是android.service.chooser.ChooserTargetService 


然后，你需要使用 meta-data 标签更新你的AndroidManifest.xml，

~~~java

<activity
    android:name=".SendMessageActivity"
    android:label="@string/app_name">
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="text/plain" />
    </intent-filter>
    <meta-data
        android:name="android.service.chooser.chooser_target_service"
        android:value=".SampleChooserTargetService" />
</activity>

~~~



对于每一个你想要暴露给ChooserTargetService的Activity,都需要加上 meta-data 。指定name 是 android.service.chooser.chooser_target_service，在Service定义之前指明他的value.当一个隐式的Intent和其中一个Activity匹配，这个intent的选择对话框 将会显示包含这个Activity的应用的ICON同时还会显示 ChooserTarget 列表的图标。选择应用的图标会像标准的分享Intent一样，选择ChooserTarget icon的时候会打开对应的Activity，根据Intent传递过来的数据初始化数据（在ChooserTargetService中指定的）。



##直接分享流程

让我们快速从用户的角度看一下谷歌提供的直接分享的示例应用的分享流程。用户打开了一个应用，在屏幕中，有一个分享按钮，点击后会发出一个隐式的Intent。

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-series-1.png)


然后用户点击了分享按钮，弹出了分享对话框：

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-series-2.png)


当我们通过metedata绑定到Chooser Service 的 Activity可以响应 隐式 Intent响应的时候，
Chooser Service将会根据我们自定义ChooserTargetService的onGetChooserTargets（）方法生成一个选择列表。
这个列表会以弹框的形式展示给用户，供用户选择去使用哪种方式响应Intent.

除此之外，真正的通过mete-data绑定的Activity会显示在已经生成的选择目标列表的旁边，用于用户选择Activity完成直接分享。通常来说，这个Activity是一个联系人列表或者是其他的用户列表。

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-series-3.png)


当用户点击了一个目标后，将会略过 “从以下列表选择一个联系人”的步骤，直接分享内容。


##避免混乱
我们必须时刻记住要做一个好市民，直接分享是一个很整洁很一目了然的功能，你不应该把一些不必要的选项加到选择对话框，这样会变得很混乱。否则的话，用户就很难选出自己想要分享到的地方了。

![](https://www.bignerdranch.com/img/blog/2015/12/direct-share-cluttered.png)



在上面的示例中，应用列出了八个不同的用户作为选择的目标，但也许只有最经常联系的短信联系人应该显示出来。


##更多

直接分享，可以简化用户分享体验，更容易的将内容分享到最常用的地方。

如果你感觉这篇文章很有趣，想了解更多关于Android6.0的令人兴奋的功能或各种新的社区工具，你可以去看看我们的一天的 [Android Platform](https://training.bignerdranch.com/classes/one-day-android-platform-features) 和 [Community Tools](https://training.bignerdranch.com/classes/one-day-android-community-tools)课程。作为一个额外的福利，我们将带上这些课程去访问美国大陆的城市。在那里见哦！
