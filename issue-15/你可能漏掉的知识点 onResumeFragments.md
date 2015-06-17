你可能漏掉的知识点: onResumeFragments
---

> * 原文链接 : [THINGS YOU MAY NOT KNOW: ONRESUMEFRAGMENTS](http://www.randomlytyping.com/blog/2015/6/5/things-you-may-not-know-about-onresumefragments)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [jianghejie](https://github.com/jianghejie) 

长话短说：如果你在使用FragmentActivity的任何子类（比如最新的AppCompatActivity），并且你正在考虑要在onResume方法中做fragment transaction操作，那么请在onResumeFragment里做这件事情。

如果你想知道详情或者一些注意事项，继续阅读。如果不想，没关系，下篇文章见。


还在看？那么 ok。

onResume和onResumeFragments的区别是什么呢？下面是[官方文档](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html#onResume()) 对FragmentActivity.onResume的解释：

>将onResume() 分发给fragment。注意，为了更好的和旧版本兼容，这个方法调用的时候，依附于这个activity的fragment并没有到resumed状态。着意味着在某些情况下，前面的状态可能被保存了，此时不允许fragment transaction再修改状态。从根本上说，你不能确保activity中的fragment在调用Activity的OnResume函数后是否是onresumed状态，因此你应该避免在执行fragment transactions直到调用了onResumeFragments函数。

总的来说就是，你无法确定activity当前的fragment在activity onResume的时候也跟着resumed了，因此要避免在onResumeFragments之前进行fragment transaction，因为到onResumeFragments的时候，状态已经恢复并且它们的确是resumed了的。

这样做可以避免发生IllegalStateException异常，在一个fragment的状态已经保存的情况下（通过onSaveInstanceState），再试图进行fragment transaction操作就会抛出这个异常。
如果fragment的activity销毁并重建，前面保存的变量将丢失。要想更深的理解这个问题，可以阅读Alex Lockwood的 ["Fragment Transactions 与 Activity状态的丢失"](http://www.androiddesignpatterns.com/2013/08/fragment-transaction-commit-state-loss.html)  一文。


其实我是在知道fragments和 fragment transaction了很久之后才知道onResumeFragments这个东西的。activity的绝大部分生命周期中都不涉及到它，因为它只存在于兼容包里面的FragmentActivity，而SDK里面的Activity则没有。不过onResumeFragments仍然值得去了解。

说了这么多，我这几天只能给一点很粗贱的建议：尽可能的避免在生命周期事件中尤其是onResume或者onResumeFragments中进行fragment transaction，如果你正在考虑这样做，很可能你的UI和事务逻辑都需要反思一遍了。

不过那时以后要说的事了。

