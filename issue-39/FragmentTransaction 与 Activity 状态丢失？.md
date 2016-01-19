FragmentTransaction 与 Activity 状态丢失？
---

> * 原文链接 : [Fragment Transactions & Activity State Loss](http://www.androiddesignpatterns.com/2013/08/fragment-transaction-commit-state-loss.html)
* 原文作者 : [Alex Lockwood](https://google.com/+AlexLockwood)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成


下面的栈轨迹和异常信息自 Android 3.0（Honeycomb） 版本发布依赖就困扰着 StackOverflow：

```
java.lang.IllegalStateException: Can not perform this action after onSaveInstanceState
    at android.support.v4.app.FragmentManagerImpl.checkStateLoss(FragmentManager.java:1341)
    at android.support.v4.app.FragmentManagerImpl.enqueueAction(FragmentManager.java:1352)
    at android.support.v4.app.BackStackRecord.commitInternal(BackStackRecord.java:595)
    at android.support.v4.app.BackStackRecord.commit(BackStackRecord.java:574)
```

这篇博文将会解释这些异常在何时被抛出以及抛出的原因，在文章的结尾还会给各位阅读本文的开发者一些建议，以确保大家开发的应用不会再因为这些原因而崩溃。

##为什么会抛出该异常？

异常产生的原因是：开发者尝试在 Activity 的某个状态被存储后提交 FragmentTransaction 事务给 FragmentManager 处理，因此使得 Activity 保存的状态是不完整的（缺少了这个事务）。在了解其中细节之前，不妨先看看 `onSaveInstanceState()` 被调用时会进行哪些操作。就像我在上一篇有关 Binders 和 Death Recipients 的博文中所说，Android 应用在 Android 运行时环境中大多数时候像砧板上的肉，任 Android 系统宰割。因为 Android 系统具有在任意时间结束进程以释放内存空间的权限，而后台 Activity 在这种情况下只能被强制杀死而且几乎不会有 warning。为了确保此类不稳定的行为能让用户知晓/处理，Android 框架层提供了 `onSaveInstanceState()` 方法在 Activity 被结束前保存 Activity 的状态，以解决 Activity 的易被杀死性。当被保存的状态被恢复，无论 Activiy是否被杀死过，用户几乎不会察觉到前后台应用切换带来的改变。

当框架层调用 `onSaveInstanceState()`，该方法通过参数接收到一个 Bundle 对象给 Activity 以存储其状态，而 Activity 就会将它此时的状态，如：Dialog，Fragment，View 这类内容存储进去。当该方法返回，系统通过 Parcel 机制打包该 Bundle 对象，通过 Binder 接口安全地存储在系统的服务端进程。在之后，当系统接收到重新创建该 Activity 的请求并准备这样做时，就会将该 Bundle 对象取出并传递给应用，以恢复 Activity 之前的状态。

那为什么会抛出异常呢？问题在于：这些 Bundle 对象可以看作是 Activity 在调用 `onSaveInstanceState()` 时的快照，除此以外不存储其他内容。也就意味着当你在 `onSaveInstanceState()` 方法之后调用 `FragmentManager.commit()` 提交某个 FragmentTransaction 事务时，与该事务相关的内容是不会被存储到 Bundle 对象中的，也就使得 Activity 快照中没有相应的内容。从用户的角度来看，该事务就会被丢失，也就导致了 UI 状态的丢失。为了保护用户体验，Android 不惜牺牲一切代价以避免状态丢失。所以，只要出现了状态丢失的情况，就会抛出 IllegalStateException 异常。

##何时会抛出该异常？

如果你曾遇到这个异常，你可能会注意到在不同 Android 版本的系统中异常抛出的时机是不同的。例如，在老版本的设备中抛出该异常的频率会低一些，又或者是当你的应用更多地使用 android.support 库而不是框架提供的类时。平台版本带来的不一致会让人觉得 android.support 库很容易出现 Bug，难以信赖。但这些直觉，往往又是错的。

存在平台版本不一致的原因是：Google 在 Android 3.0（Honeycomb） 版本中对 Activity 的生命周期作了些许修改。在 3.0 之前，Activity 在 `onPause()` 之前不被看作是可被杀死的。在 3.0 及之后，Activity 只在 `onStop` 之后被看作是可被杀死的，意味着 `onSaveInstanceState()` 将会在 `onStop()` 之前被调用，而不是在 `onPause()` 被调用前立刻被调用。其中的区别可见下表：

|--------|---------|--------|
| |pre-Honeycomb|post-Honeycomb|
|Activities can be killed before onPause()?|NO|NO|
|Activities can be killed before onStop()?|YES|NO|
|onSaveInstanceState(Bundle) is guaranteed to be called before...|onPause()|onStop()

因为对 Activity 生命周期进行的这一点点改变，android.support 库有时就需要根据平台版本修改它的某些行为了。例如，在大于等于 3.0 的设备中，只要 `FragmentManager.comit()` 方法在 `onSaveInstanceState()` 就会抛出异常以警告开发者状态丢失的情况。然而，在低于 3.0 版本中抛出此异常的条件却很苛刻。Android 开发团队必须作出妥协：为了平台兼容性，老版本设备需要地方可能在 onPause() 和 onStop() 周期之间可能产生的状态丢失。android.support 库在 3.0 版本前和 3.0 版本后的行为可总结如下表：

| |pre-Honeycomb|post-Honeycomb|
|commit()|before onPause()|OK|OK
|commit()|between onPause() and onStop()| STATE LOSS|OK
|commit()|after onStop()|EXCEPTION|EXCEPTION

##如何避免该异常？

当你理解了抛出该异常的原因，避免 Activity 状态丢失就变得容易多了。如果对此的了解比本博文更深入，希望你明白 android.support 库是如何工作的，以及避免状态丢失的重要性。下面的建议希望每一个开发者都能牢记在心，并且在使用 FragmentTransaction 时都能想起来：

- 在 Activity 生命周期方法中提交 FragmentTransaction 时一定要谨慎。一般应用只会在 `onCreate()` 方法被调用时中提交 FragmentTransaction 事务，或者响应用户输入时，这种情况下是不会出现状态丢失问题的。但是，当你的 FragmentTransaction 事务在其他 Activity 生命周期的方法中被处理时，如：`onActivityResult()`, `onStart()`, and `onResume()`，出现异常的可能性就增大了。例如，你不能在 FragmentActivity 的 onResume() 方法中提交 FragmentTransaction 事务，因为该方法在某些情况下方法可能会在 Activity 的状态被恢复前被调用（文档有详细的信息）。如果应用需要在 Activity 的生命中除 `onCreate()` 以外的方法中提交 FragmentTransaction 事务，可以把相关的操作放到 FragmentActivity 的 onResumeFragments 或者 Activity 的 `onPostResume()` 方法中完成。这两个方法确保在 Activity 恢复到初始状态后被调用。（相关例子可以看我在 StackOverflow 中有关在 `Activity.onActivityResult()` 方法中响应 FragmentTransaction 事务的的回答）

- 避免在异步回调接口中处理 FragmentTransaction 事务。这里包含了常用的 `AsyncTask.onPostExecute()` 方法和 `LoaderManager.LoaderCallbacks.onLoadFinished()` 方法。在这些方法中处理 FragmentTransaction 事务的问题在于：当这些方法被调用，它们无法知晓 Activity 当前处于生命周期的哪个状态。例如，考虑以下的情况：

1. Activity 执行了一个 AsyncTask
2. 用户按了 Home 键，使 Activity 的 `onSaveInstanceState()` 和 `onStop()` 方法被调用
3. AsyncTask 的异步任务完成，并且调用了 `onPostExecute()` 方法，却无法意识到 Activity 已经被停止
4. FragmentTransaction 在 `onPostExecute()` 方法中被提交，导致异常被抛出

通常来说，在这些情况下避免此类异常最好的办法是避免在所有异步回调方法中提交 FragmentTransaction 事务。Google 开发者看起来也同意这样的做法。根据这篇博文在 Android 开发者群体里的讨论，大家都认可 UI 中的转换大多来源于 FragmentTransaction 事务的提交，而这些操作往往又通过异步回调接口方法完成，导致对用户体验的破坏。如果你的应用需要在这些回调方法中处理 FragmentTransaction 事务，而且没有其他简单的办法能够保证回调不会在 `onSaveInstanceState()` 方法只后被调用，你可能需要使用 `commitAllowingStateLoss()` 方法，而且自行设置处理可能发生的状态丢失的逻辑。（相关内容可以看 [憋说话，点我！](http://stackoverflow.com/questions/8040280/how-to-handle-handler-messages-when-activity-fragment-is-paused) 和 [憋说话，点我！](http://stackoverflow.com/questions/7992496/how-to-handle-asynctask-onpostexecute-when-paused-to-avoid-illegalstateexception)）

使用 `commitAllowingStateLoss()` 方法可以看作压箱底的大招了……调用 `commit()` 和 `commitAllowingStateLoss()` 方法的唯一区别在于：即使发生了状态丢失，后者也不会抛出异常。通常开发者都不需要使用该方法，因为使用它就代表着存在状态丢失发生的可能性。更好的解决方案是，让应用每一次调用 `commit()` 方法都能确保在 Activity 状态被存储之前被调用，这样也会带来更好的用户体验。除非状态丢失的可能性是确定且无法避免的，否则 `commitAllowingStateLoss()` 不应该被调用。

希望这些建议能帮你解决之前/现在遇到的这个异常。如果你还是不知道该怎么办的话，可以到 StackOverflow 上面提个问题，然后在评论区放上链接，我有空的话会去看看的哦 ：）。

感谢各位的阅读，如果有什么疑问可以在下面留言。如果大家觉得我写的好的话不妨给我一个赞，而且在 Google+ 分享给你的小伙伴！
