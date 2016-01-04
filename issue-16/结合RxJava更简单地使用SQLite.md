结合RxJava更简单地使用SQLite
---

> * 原文链接 : [Easy SQLite on Android with RxJava][source]
* 原文作者 : [Cédric Beust](http://beust.com/weblog/about-2/)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [tiiime](https://github.com/tiiime) 
* 校对者:  [Mr.Simple](https://github.com/bboyfeiyu) 
* 状态 :   完成


我经常想在项目中使用 ORM 来简化操作，但是最终都将这个念头打消。主要有以下几点原因：

- 我的数据模型远远没有复杂到需要 ORM 帮助
- 出于 Android 性能上的考虑，自动生成的SQL语句可能没有被优化

不过最近，我开始使用一个简单的设计模式，使用 RxJava 来提供一个简单的数据库访问管理。
我称它为 “Async Rx Read” 设计模式，很渣的一个名字哈，不过是我能想到最好的了，命名总是程序员的难题嘛。


#Easy Read
Android 开发中有一条很重要的设计原则，永远不要在主线程执行 I/O 操作，显然这条规则对数据库访问也适用。
RxJava 很适用于解决这个问题。
在以前，我通常为每个 table 创建一个 Java 类，然后通过我的 [SQLiteOpenHelper][SQLiteOpenHelper] 来管理这些 table。
现在使用这个新的方法后，我将这个工具类扩展成所有事物读写 SQL table 的唯一入口。
我们来想个简单的例子：一个由 UserTable 类管理的 USERS 表：

```java
// UserTable.java
List<User> getUsers(SQLiteDatabase db, String userId) {
  // select * from users where _id = {userId}
}
```

上面的方法有一个缺点，就是你一不小心可能会在主线程调用它，这里面是由调用者确保它是在后台线程中被执行的
(如果需要更新 UI 的话，再将结果返回给主线程)。而不是依赖一个线程池管理，或者更糟点，使用 `AsyncTask` 管理，
我们将使用 RxJava 替我们管理线程模型。

让我们重写这个方法返回一个 callback ：

```java
// UserTable.java
Callable<List<User>> getUsers(SQLiteDatabase db, String userId) {
  return new Callable<List<User>>() {
    @Override
    public List<User> call() {
      // select * from users where _id is userId
    }
  }
}
```


实际上，我们只是重构了一下这个方法返回一个 lazy result ，使得 database helper 可以将这个
result 转变成一个 `Observable`：

```java
// MySqliteOpenHelper.java
Observable<List<User>> getUsers(String userId) {
  return makeObservable(mUserTable.getUsers(getReadableDatabase(), userId))
    .subscribeOn(Schedulers.computation()) // note: do not use Schedulers.io()
}
```

注意到将 lazy result 转换成一个 `Observable` 时，helper 强制 subscription 运行在后台线程
(这里使用的是 computation scheduler;不要使用 `Schedulers.io()` 因为它是由 unbounded executor 支持的)。
这样调用者就不必担心这个方法会阻塞主线程了。

最后，`makeObservable()` 方法的实现很简单(而且是完全通用的)：

```java
// MySqliteOpenHelper.java
private static <T> Observable<T> makeObservable(final Callable<T> func) {
  return Observable.create(
      new Observable.OnSubscribe<T>() {
          @Override
          public void call(Subscriber<? super T> subscriber) {
            try {
              subscriber.onNext(func.call());
            } catch(Exception ex) {
              Log.e(TAG, "Error reading from the database", ex);
            }
          }
    });
}
```

现在，我们的 database 读取已经变成了 `observables`，保证查询是执行在后台线程的。
访问数据库操作也是很标准的 Rx code：

```java
// DisplayUsersFragment.java
@Inject
MySqliteOpenHelper mDbHelper;

// ...

mDbHelper.getUsers(userId)
  .observeOn(AndroidSchedulers.mainThread())
  .subscribe(new Action1<List<User>>()) {
    @Override
    public void onNext(List<User> users) {
      // Update our UI with the users
    }
  }
}
```

如果你不需要返回结果更新你的 UI，那么你只需要 observe 一个后台线程。
然后你的 database 层会返回 observables，当获得结果时很容易将它组合变换。
例如，假定 `ContactTable` 是一个底层类， model (User class) 对它是不可见的，
它应该返回底层 object (可能是 `Cursor` 或者 `ContentValues`)。然后你可以用
Rx 去 `map` 这些底层值，把它们转换成你的 model 类，实现更加清晰的分离层。

两个提示：

- 你的 Table 类不应该包含 public 方法：只能有 package 的 protected 方法(仅允许相同 package 内的 Helper 访问 ) 和 private 方法，
其他类不能直接访问 Table 类。

- 这个方法对依赖注入兼容性很好：很轻松就可以同时实现 database helper 和注入单个 Table 
(意外收获：使用 Dagger 2，你的 table 可以拥有自己的组件，因为 database helper
是实例化它们所需的唯一参考资料 )。


这是一个很简单的设计模式，它显著提升了 RxJava 在项目中发挥的效果。
我正在扩展这层结构，让它可以为 list view adapter update 提供更灵活的通知机制
(和 SQLBrite 提供的不同)，会在以后的文章中介绍。

这项工作还在进行中，欢迎反馈。


---

[source]:http://beust.com/weblog/2015/06/01/easy-sqlite-on-android-with-rxjava/
[SQLiteOpenHelper]:http://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper.html