让EditText中的链接即可点击又可编辑
---

> * 原文链接 : [Making EditTexts with links both clickable and editable](http://blog.danlew.net/2015/12/14/making-edittexts-with-links-both-clickable-and-editable/)
* 原文作者 : [Dan Lew](http://blog.danlew.net/about/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对

Recently, I was working on an
[`EditText`](http://developer.android.com/reference/android/widget/EditText.html)
that supports links. That is, users can add URLs that become clickable
when not editing.  
最近，我正忙于让[`EditText`](http://developer.android.com/reference/android/widget/EditText.html)支持编辑链接。让用户添加的链接在非编辑状态下可以跳转。

When the `EditText` is not focused, the links should be clickable.
However, when it *is* focused, it should disable the links so that the
user can edit them without opening them.  
`EditText`没有焦点时，链接应该可点。然而，当获得焦点时，应该让用户可以编辑链接。

It's simple enough to add an
[`OnFocusChangeListener`](http://developer.android.com/reference/android/view/View.OnFocusChangeListener.html)
for mode switching, but how does the user actually go about changing the
focus (since clicking on the link would normally cause the browser to
open)?  
添加一个[`OnFocusChangeListener`](http://developer.android.com/reference/android/view/View.OnFocusChangeListener.html)来获取焦点的改变非常容易，但是用户如何改变焦点呢?(因为点击链接会使得浏览器被打开)

Long presses are one method. A second method *should* be to just click
on any blank space in the `EditText`, like so:  
长按是一种解决方法。第二种办法是点击`EditText`的空白区域，如图：

![image](https://github.com/DroidWorkerLYF/Translate/blob/master/Making%20EditTexts%20with%20links%20both%20clickable%20and%20editable/1.png?raw=true)

Unfortunately, due to the behavior of `LinkMovementMethod`, **if the
last part of the text is a link, clicking *anywhere* causes the link to
be opened.**  
不幸的是由于`LinkMovementMethod`的问题，**就算文本最后一部分是空白的,点击它也相当于点击了链接**

My workaround hinged on the observation that this problem only happened
if the *last* character of the text was a link. What if I added
something after the text?  
我发现这个问题只发生在*最后*一个字符是链接的情况下，那么如果我在文本最后添加一些内容呢?

    // Make links in the EditText clickable
    editText.setMovementMethod(LinkMovementMethod.getInstance());

    // Setup my Spannable with clickable URLs
    Spannable spannable = new SpannableString("http://blog.danlew.net");  
    Linkify.addLinks(spannable, Linkify.WEB_URLS);

    // The fix: Append a zero-width space to the Spannable
    CharSequence text = TextUtils.concat(spannable, "\u200B");

    // Use it!
    editText.setText(text);  

Now clicking the empty space doesn't cause the link to be opened and I
can switch into edit mode!  
现在点击空白的部分不会导致链接跳转了，我也可以切换到编辑模式了。
