我们为什么要用fitsSystemWindows?
---

> * 原文链接 : [Why would I want to fitsSystemWindows?](https://medium.com/google-developers/why-would-i-want-to-fitssystemwindows-4e26d9ce1eec)
* 原文作者 : [Ian Lake](https://medium.com/@ianhlake)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [LionelCursor](https://github.com/LionelCursor) 
* 校对者: 
* 状态 :  校对中


System windows 指的就是屏幕上status bar、 navigation bar等系统控件所占据的部分。

绝大多数情况下，你都不需要理会status bar或者navigation bar 下面的空间，不过你需要注意不能让你的交互控件（比如Button）藏在status bar 或者 navigation bar下面。而`android:fitsSystemWindows="true"`的默认行为正好解决了这种情况，这个属性的作用就是通过设置View的padding，使得应用的content部分——Activity中setContentView()中传入的就是content——不会与system window重叠。

还有一些事情需要注意：

- **`fitsSystemWindows` 需要被设置给根View**——这个属性可以被设置给任意View，但是只有根View（content部分的根）外面才是SystemWindow，所以只有设置给根View才有用。
- **`Insets`始终相对于全屏幕**——`Insets`即边框，它决定着整个Window的边界。对`Insets`设置padding的时候，这个padding始终是相对于全屏幕的。因为`Insets`的生成在View `layout`之前就已经完成了，所以系统对于View长什么样一无所知。
- **其它padding将通通被覆盖**。需要注意，如果你对一个View设置了`android:fitsSystemWindows="true"`，那么你对该View设置的其他padding将通通无效。

在绝大多数情况下，默认情况就已经够用了。比如一个全屏的视屏播放器。如果你不想被ActionBar 或者其他System View遮住的话，那么在MatchParent的ViewGroup上设置`fitsSystemWindows="true"`即可。

或者，也许你希望你的RecyclerView能够在透明的navigation bar 下面滚动。那么只需将`android:fitsSystemWindows="true"` `android:clipToPadding="false"`同时使用即可,
滚动的内容会绘制在navigation bar下面，同时当滚动到最下面的时候，最后一个item下面依旧会有padding，使其可以滚到navigation bar上方（而不是在navigation bar下面滚不上来！）。

译者注：`clipToPadding`是`ViewGroup`的属性。这个属性定义了是否允许ViewGroup在padding中绘制,该值默认为true,即不允许。

## 自定义 fitsSystemWindows
但是默认毕竟只是默认。
在KITKAT及以下的版本，你的自定义View能够通过覆盖`fitsSystemWindows() : boolean`函数，来增加自定义行为。如果返回`true`，意味着你已经占据了整个`Insets`，如果返回`false`，意味着给其他的View依旧留有机会。

而在Lollipop以及更高的版本，我们提供了一些新的API，使得自定义这个行为更加的方便。与之前的版本不同，现在你只需要覆盖`OnApplyWindowInsets()`方法，该方法允许View消耗它想消耗的任意空间（Insets），同时也能够为子方法，调用`dispatchApplyWindowInsets()`

更妙的是，利用新的API，你甚至不需要拓展View类，你可以使用`ViewCompat.setOnApplyWindowInsetsListener()`，这个方法优先于`View.onApplyWindowInsets()`调用。`ViewCompat` 同时也提供了 `onApplyWindowInsets()` 和`dispatchApplyWindowInsets()` 的兼容版本，无需冗长的版本判断。

## 自定义fitsSystemWindows例子

绝大多数基本的layouts（FrameLayout）都是使用默认的行为，然而依然有一部分layouts已经使用了自定义`fitsSystemWindow`来实现自定义的功能。

`navigation drawer`就是一个例子，它需要充满整个屏幕，绘制在透明的status bar下面。

![enter image description here](http://7othru.com1.z0.glb.clouddn.com/why-would-i-want-to-fitssystemwindows.png)

如上图所示，`DrawerLayout`使用了`fitsSystemwindows`，他需要让它的子View依旧保持默认行为，即不被actionbar或其他system window遮住，同时依照Material Design的定义，又需要在透明的statusbar下面进行绘制（默认是你在theme中设置的`colorPrimaryDark`颜色）

你会注意到，在Lollipop及以上版本，`DrawerLayout`为每一个子View调用了`dispatchApplyWindowInsets()`，使每一个子View都收到`fitsSystemWindows`。这与默认行为完全不同，默认行为会使得根View消耗所有的insets，同时子View们永远不会收到`fitsSystemWindows`。

`CoordinatorLayout`也利用了这一特性，使得其子View有机会截断并对`fitsSystemWindows`做出自己的反应。同时，它也利用`fitsSystemWindows`这一flag看其是否需要在statusbar的下方绘制。

同样的，`CollapsingToolbarLayout`以`fitsSystemWindows `什么时候把变小的View放在什么地方。

如果你对这些[`Design Library`](http://android-developers.blogspot.com/2015/05/android-design-support-library.html)里的东西感兴趣，请查看[Cheesesquare Sample](https://github.com/chrisbanes/cheesesquare)

## 积极使用系统，而不是老想着Hack

有一件事需要始终牢记，这个属性毕竟不是`fitsStatusBar`或者`fitsNavigationBar`。不管是尺寸还是位置，在不同版本间，系统控件都有很大的差距。

但是尽管放心，无论在什么平台上，`fitsSystemWindows`都会影响`Insets`，使你的content和system ui不会重叠——除非你自定义这一行为。


