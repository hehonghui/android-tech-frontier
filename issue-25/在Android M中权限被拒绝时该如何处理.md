#在Android M中权限被拒绝时该如何处理

> * 原文链接 : [How to deal with permission denial on Android M](https://plus.google.com/+AndroidDevelopers/posts/8aaudh5n1zM)
* 原文作者 : [Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski/posts)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
* 译者 : [Desmond1121](https://github.com/desmond1121)
* 校对者:

M Developer Preview 2 now includes a new method for Runtime Permissions: Activity.shouldShowRequestPermissionRationale().

Android M Preview 2 的SDK中引入了一个方法来处理运行时权限：`Activity.shouldShowRequestPermissionRationale()`。

It informs your app if it should display an explanation for the permission it is requesting before actually showing the permission dialog.

这个函数的作用是告知App在调用需要权限的功能前是否要显示相应理由。

On a fresh app install, the method returns false, so you can ask for any required permissions straight away. If the user previously declined a permission, the method will return true. In that case you should consider displaying an explanation before invoking the permission dialog again. You should only do it if the permission is not self-explanatory.

当App刚安装的时候，这个方法会返回false，这时候它可以直接调用任何需要权限的功能而不需要解释，此时会正常弹出权限对话框。如果用户之前拒绝过App使用权限，这个方法就会返回true。这时候你应该在调用相应权限功能前显示出理由，不过需要注意，仅仅当此权限没有显示需要它的原因时你才需要自己解释。

Finally, if the app has no chance of having the permission granted, calls to shouldShowRequestPermissionRationale() will return false. This can happen for several reasons, such as the user selecting ""do not show again"" in the permission dialog. A false result means it doesn’t make sense to show any additional prompts with explanations.

当App被永远拒绝获取某权限时（比如你点击了“不再提示”），`shouldShowRequestPermissionRationale()`就会返回false，这时候你也不必要提供任何解释了。

Please note that, due to a bug, Fragment.shouldShowRequestPermissionRationale() always returns false on the M Developer Preview 2. This will be fixed in a future release. You can use getActivity().shouldShowRequestPermissionRationale() from Fragments in the meantime.

不过需要注意：**由于一个bug，在Android M Preview 2的SDK中`Fragment.shouldShowRequestPermissionRationale()`会一直返回false。**这在未来的版本中会修复。你可以在Fragment中使用`getActivity().shouldShowRequestPermissionRationale()`来绕过这个问题。

Check out our sample showing Runtime Permissions in action: https://goo.gl/9xpwqN"﻿

你可以在[Github Demo](https://goo.gl/9xpwqN)中查看我们处理运行时权限的示例。