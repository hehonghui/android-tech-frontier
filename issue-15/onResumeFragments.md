# THINGS YOU MAY NOT KNOW: ONRESUMEFRAGMENTS
# 你应该知道的事之onResumeFragments

The long and short of it: if you are using any subclass of FragmentActivity (like the new AppCompatActivity) and you are thinking of doing any kind of fragment transaction in onResume, do it in onResumeFragments.

长话短说 : 如果你想在FragmentActivity的子类的onResume函数中做一些Fragment提交，那么你应该把这些操作放在onResumeFragments函数中，而不是onResume函数中。

If you feel like some detail and some caveats, read on. If not, no worries. Have a good one and see you next post.

如果你想了解一些细节，请继续阅读。否则咱就在下一篇文章中见啦~


Still here? Okay.

既然你没扯，那么咱们再唠10块钱。

What is the difference between onResume and onResumeFragments? From the documentation for FragmentActivity.onResume:

onResume和onResumeFragments之间有什么不同呢？我们看看文档中关于FragmentActivity.onResume的说明: 

> Dispatch onResume() to fragments. Note that for better inter-operation with older versions of the platform, at the point of this call the fragments attached to the activity are not resumed. This means that in some cases the previous state may still be saved, not allowing fragment transactions that modify the state. To correctly interact with fragments in their proper state, you should instead override onResumeFragments().
Basically, you cannot be sure that an activity's existing fragments have resumed in the activity's onResume and should avoid fragment transactions until onResumeFragments, when their state has restored and they have actually resumed.

> 分发onResume()到fragment中.需要注意的是为了在老版本上有更好的互操作性，在调用该函数后关联到Activity的fragment此时并不是resumed状态。这意味着在某些情况下上一个状态可能被保存了，此时并不允许fragment transactions来修改当前状态。为了在fragment的合适状态下与它们进行正确的交互，你可能需要覆写onResumeFragments()。从根本上说，你不能确保activity中的fragment在调用Activity的OnResume函数后是否是onresumed状态，因此你应该避免在执行fragment transactions直到调用了onResumeFragments函数。


By doing this you can avoid ye good ol' IllegalStateException which Android throws whenever you try to perform transactions on a fragment after its state has already been saved (via onSaveInstanceState). If the fragment's activity is destroyed and re-created, you will lose those post-save changes. For a better and fuller explanation of this, read Alex Lockwood's "Fragment Transactions & Activity State Loss".

这样你就可以避免当你试图在一个Fragment的状态已经被存储之后执行transactions时抛出IllegalStateException异常。如果fragment的宿主activity被销毁或者重建，你将会丢失它们状态修改。你可以参考这篇文章[Fragment Transactions & Activity State Loss](http://www.androiddesignpatterns.com/2013/08/fragment-transaction-commit-state-loss.html)。

Admittedly, I learned about onResumeFragments long after I learned about fragments and fragment transactions. Most basic material on activity lifecycle omits it since it only exists in FragmentActivity in the support library and not in the SDK Activity class. However, onResumeFragments is a good-to-know.

不可否认，我也是在使用了fragment之后的很长一段时间才知道onResumeFragments函数。很多基础的Activity生命周期相关的资料省略了关于它的说明，它只出现在含有FragmentActivity的support 库中。然后，onResumeFragments函数你还是值得了解的。