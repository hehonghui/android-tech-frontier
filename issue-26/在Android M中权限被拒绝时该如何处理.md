#在Android M中权限被拒绝时该如何处理

> * 原文链接 : [How to deal with permission denial on Android M](https://plus.google.com/+AndroidDevelopers/posts/8aaudh5n1zM)
* 原文作者 : [Wojtek Kaliciński](https://plus.google.com/+WojtekKalicinski/posts)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](www.devtf.cn)
* 译者 : [Desmond1121](https://github.com/desmond1121)
* 校对者: [chaossss](https://github.com/chaossss)
* 状态 : 完成

Android M Preview 2 的SDK中引入了一个方法来处理运行时权限：`Activity.shouldShowRequestPermissionRationale()`。

这个函数的作用是告知App在调用需要权限的功能前是否要显示相应理由。

当App刚安装的时候，这个方法会返回false，这时候它可以直接调用任何需要权限的功能而不需要解释，此时会正常弹出权限对话框。如果用户之前拒绝过App使用权限，这个方法就会返回true。这时候你应该在调用相应权限功能前显示出理由，不过需要注意，仅仅当此权限没有显示需要它的原因时你才需要自己解释。

当App被永远拒绝获取某权限时（比如你点击了“不再提示”），`shouldShowRequestPermissionRationale()`就会返回false，这时候你也不必要提供任何解释了。

不过需要注意：**由于一个bug，在Android M Preview 2的SDK中`Fragment.shouldShowRequestPermissionRationale()`会一直返回false。**这在未来的版本中会修复。你可以在Fragment中使用`getActivity().shouldShowRequestPermissionRationale()`来绕过这个问题。

你可以在[Github Demo](https://goo.gl/9xpwqN)中查看我们处理运行时权限的示例。