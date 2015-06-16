原文： 
[http://www.randomlytyping.com/blog/2015/6/5/things-you-may-not-know-about-onresumefragments](http://www.randomlytyping.com/blog/2015/6/5/things-you-may-not-know-about-onresumefragments)

The long and short of it: if you are using any subclass of FragmentActivity (like the new AppCompatActivity) and you are thinking of doing any kind of fragment transaction in onResume, do it in onResumeFragments.

长话短说：如果你在使用FragmentActivity的任何子类（比如最新的AppCompatActivity），并且你正在考虑要在onResume方法中做fragment transaction操作，那么请在onResumeFragment里做这件事情。

If you feel like some detail and some caveats, read on. If not, no worries. Have a good one and see you next post.

如果你想知道详情或者一些注意事项，继续阅读。如果不想，没关系，下篇文章见。

Still here? Okay.

还在看？那么 ok。

What is the difference between onResume and onResumeFragments? From the documentation for FragmentActivity.onResume:

onResume和onResumeFragments的区别是什么呢？根据[官方文档](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html#onResume()) 对FragmentActivity.onResume的解释：

>Dispatch onResume() to fragments. Note that for better inter-operation with older versions of the platform, at the point of this call the fragments attached to the activity are not resumed. This means that in some cases the previous state may still be saved, not allowing fragment transactions that modify the state. To correctly interact with fragments in their proper state, you should instead override onResumeFragments().

>将onResume() 分发给fragment。注意，为了更好的和旧版本兼容，这个方法调用的时候，依附于这个activity的fragment并没有到resumed状态。着意味着在某些情况下，前面的状态可能被保存了，不允许fragment transaction再修改状态。为了在状态上正确 的和fragment交互，你应该重写onResumeFragments()而不是onResume() 。

Basically, you cannot be sure that an activity's existing fragments have resumed in the activity's onResume and should avoid fragment transactions until onResumeFragments, when their state has restored and they have actually resumed.

总的来说就是，你无法确定activity当前的fragment在activity onResume的时候也跟着resumed了，因此要避免在onResumeFragments之前进行fragment transaction，因为到onResumeFragments的时候，状态已经恢复并且它们的确是resumed了的。

By doing this you can avoid ye good ol' IllegalStateException which Android throws whenever you try to perform transactions on a fragment after its state has already been saved (via onSaveInstanceState). If the fragment's activity is destroyed and re-created, you will lose those post-save changes. For a better and fuller explanation of this, read Alex Lockwood's "Fragment Transactions & Activity State Loss".

这样做可以避免发生IllegalStateException异常，在一个fragment的状态已经保存的情况下（通过onSaveInstanceState），再试图进行fragment transaction操作就会抛出这个异常。
如果fragment的activity销毁并重建，前面保存的变量将丢失。要想更深的理解这个问题，可以阅读Alex Lockwood的 ["Fragment Transactions 与 Activity状态的丢失"](http://www.androiddesignpatterns.com/2013/08/fragment-transaction-commit-state-loss.html)  一文。

Admittedly, I learned about onResumeFragments long after I learned about fragments and fragment transactions. Most basic material on activity lifecycle omits it since it only exists in FragmentActivity in the support library and not in the SDK Activity class. However, onResumeFragments is a good-to-know.

其实我是在知道fragments和 fragment transaction了很久之后才知道onResumeFragments这个东西的。activity的绝大部分生命周期中都不涉及到它，因为它只存在于兼容包里面的FragmentActivity，而SDK里面的Activity则没有。不过onResumeFragments仍然值得去了解。

Now after saying all that, my $0.02 these days is just to avoid doing fragment transactions in lifecycle events as much as possible and particularly in onResume/onResumeFragments and that considering doing so is usually a hint that either your UI/UX or business logic needs some review.

说了这么多，我这几天只能给一点很粗贱的建议：尽可能的避免在生命周期事件中尤其是onResume或者onResumeFragments中进行fragment transaction，如果你正在考虑这样做，很可能你的UI和事务逻辑都需要反思一遍了。

But that's a rant for another day.

不过那时以后要说的事了。

