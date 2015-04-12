简化Android的UI开发
---

>
* 原文链接 : [android ui development made easy](http://zserge.com/blog/android-mvx.html)
* 作者 : [Zaitsev Serge](http://zserge.com/blog.html)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [ZhaoKaiQiang](https://github.com/ZhaoKaiQiang)  
* 状态 :  校对完成




如果你觉得这篇文章太长，而且还没有往下阅读的话，我可以给你简要的介绍文章要讲的内容：我使用纯 Java 通过数据绑定的方式提供了一种

Android UI 开发的代码往往是支离破碎的，写出来的代码通常都是大量的模板化代码，而且没有结构可言。下面是一些问题（纯属个人见解）：

- Android UI 开发很少符合 MVC 模式（或者是 M-V-其他任何东西）

- XML文件通常包含了很多重复的代码，在代码复用方面比较糟糕

- XMLS 非常脆弱，这使得你在写 XML 文件时，即使输入了 TextVeiw ，在编译过程中编译器也不会警告你，但在 App 运行时又会抛出 InflateException 异常

- 缺少对 styles 的支持，缺少对变量的支持，不支持宏和计算结果（例如 10dp + 2px)

- 没有数据绑定，这使得你必须自己把所有的 findViewById 和 setOn...Listener 写好

- 你可以通过 Java 实现你的布局，但是写出来的代码有如天书

## 使用 mithril.js 建立用户接口 ##

在 Web 开发中，开发者们很快就意识到在没有 MVx 的情况下开发复杂的应用会很吃力，这使得他们意识到 jQuery 中存在的问题，并开发了 Backbone，Knockout，Angular，Ember...等等，来提高他们的开发效率

但在 Android 中，我们还在通过那一点点函数毫无章法可言地设置 View 的属性，就像在 jQuery 里一样：

```java
	$('.myview').text('Hello');
	$('.myview').on('click', function() {
	
	});
	
	myView.setText("Hello");
	myView.setOnClickListener(new View.OnClickListener() { ...});
```

我们在一个目录下定义了我们的 Layout ，又在另一个目录中使用它们，然后在 UI 开发的代码里改变
，这样并不好。

React.js 对 Web 开发有一点点影响：他们以树状关系的自定义对象创建了一个虚拟的 DOM 概念，并以此展示实际的 HTML 布局。虚拟树创建和切换的时间都很短，所以当实际的 DOM 需要被渲染，两棵虚拟树（前一棵和新的那棵）将进行对比，只有不匹配的部分才会被渲染。

Mithril.js 是一个精悍、短小的框架，使用它能使 React.js 的实现更整洁。在 Mithril 中，除了纯 JavaScript，你几乎能摆脱一切，同时，它还能让你在写布局的时候感受到图灵完备的语言所具备的力量。

```java
	return m('div',
	         m('p', someText),
	         m('ul',
	           items.map((item) => m('li', item))),
	         m('button', {onclick: myClickHandler}));
```

因此，你能用循环生成许多 View，你能用判断语句改变布局中的某个部分，最后你能绑定数据和设置事件监听器。

那这个方法能在 Android 中被使用吗？

## 虚拟布局 ##

虚拟布局（使用类似 Web 中虚拟 DOM 的概念）是树状的自定义Java对象集合，被用于展示实际的 Android 布局。虽然 App 的数据改变多少次，树就会被构建多少次，但布局改变的内容应该仅仅是前后不一致的部分（当前的布局和改变前布局）。

我们的框架只导入一个静态类，所以所有类中的静态方法都不需要类名前缀就能被使用（例如我们只需要使用 v()，而不是 Render.v()），这是语言特性带来的好处。下面是我们如何创建布局的例子：

```java
	v(LinearLayout.class,
	    orientation(LinearLayout.VERTICAL),
	    v(TextView.class,
	        text(someText)),
	    v(Button.class,
	        text("Click me"),
	        onClick(someClickHandler)));
```

第一个 v() 方法返回了一个虚拟布局，每一次调用后它会返回当前应用状态的实际展示（不是实际的 View！）

当一些文字变量被改变 - 虚拟树会获得一个被用于下次渲染的发生了改变的结点值，然后调用 setText()改变相应的 TextView 实例。但是其余的布局不会发生任何变化。

一棵虚拟布局树在理想情况下应该只是一个类，我们就把它叫作结点吧。但是结点主要有两种类型：View 结点（TextView.class等等）和属性设置结点，例如text（someText)

那这就意味着结点应该任意包含一个 View 类和一个方法去改变 View 的属性。

```java
	interface AttributeSetter {
	    public void set(View v);
	}

	public static class Node {
	    List<Node> attrs = new ArrayList<Node>();
	    Class<? extends View> viewClass; // for view nodes
	    AttributeSetter setter;          // for attribute setter nodes
	
	    public Node(Class<? extends View> c) {
	        this.viewClass = c;
	    }
	
	    public Node(AttributeSetter setter) {
	        this.setter = setter;
	    }
	}
```

现在我们需要定义类在产生虚拟布局的时候实际能干的事情了，那就让我们来调用可渲染类吧。一个可渲染类可以是一个 Activity，或者一个自定义的 ViewGroup，或者 Fragment 也凑合。每一个可渲染类都应该有一个用于返回虚拟布局的方法，此外，如果这个方法指定了它将要作用于实际布局中的哪个 View 会更好。

```java
	public interface Renderable {
	    Node view();
	    ViewGroup getRootView();
	}
```

由于 v() 方法的第一个参数是 View 子类的泛型，所以你不用担心类型安全问题。剩下的参数都是结点类型，所以我们只需要把它们添加到 list 中，无视掉空结点的话效果会更好一些。

```java
	public static Node v(final Class<? extends View> cls, final Node ...nodes) {
	    return new Node(cls) ;
	}
```

Here's an example of the text() attribute setter (the real code is a bit different, but it could have been implemented like this):

下面是一个 text() 属性的设置方法（实际代码会有点不一样，但是也能像下面这样实现）：

```java
	public static Node text(final String s) {
	    return new Node(new AttributeSetter() {
	        public void set(View v) {
	            ((TextView) v).setText(s);
	        }
	    });
	}
```

其他类似的工具方法也能用于改变线性布局的方向，View 的大小、页边距、间距，总之所有 View 的参数都能被改变。

## 那么，我们要怎么去渲染呢？ ##

现在我们需要一个“渲染者”。这是一个能够根据类名创建 View ，使用 AttributeSetters修改对应的参数并且递归地添加子 View的方法。（同样的，下面的代码也是被简化的，实际的代码会有些不一样，主要差别在于当结点没有被改变的时候，我们应该如何避免视图的渲染）
	
```java
	public static View inflateNode(Context c, Node node, ViewGroup parent) {
	    if (node.viewClass == null) {
	        throw new RuntimeException("Root is not a view!");
	    }
	    // Exception handling skipped here to make the code look shorter
	    View v = (View) node.viewClass.getConstructor(Context.class).newInstance(c);
	    parent.addView(v);
	    for (Node subnode: node.attrs) {
	        if (subnode.setter != null) {
	            subnode.setter.set(v);
	        } else {
	            View subview = inflateNode(c, subnode, (ViewGroup) v);
	        }
	    }
	    return v;
	}
```

现在我们真的可以摆脱 XMLS，并以一种简洁的方式通过 Java 进行布局了。

布局结点不应该直接地被使用，而应该是通过 render(Renderer r) 和 render()被使用。前者用于重渲染某一个 View，后者用于重渲染所有被展示的 View。Renderer 通过一个弱哈希表存储，使得在 View 被移除或者 Activity 被销毁的同时 - 他们的渲染者也不会再被使用。

## 什么时候去渲染呢？ ##

这个框架的核心在于 自动进行重渲染，使得 UI 总能展示当前的虚拟布局状态。这就意味着 render() 应该在某个特定的节点被调用。

我参考 Mithril 的方法，把每一个 On...Listener 和 调用 render 的方法捆绑在每一次 UI 的交互中。

```java
	public static Node onClick(final View.OnClickListener listener) {
	    return new Node(new AttributeSetter() {
	        public void set(View v) {
	            v.setOnClickListener(new View.OnClickListener() {
	                public void onClick(View v) {
	                    listener.onClick(v);
	                    // After the click was processed - some data may have been changed
	                    // so we try to re-render the UI
	                    render();
	                }
	            });
	        }
	    });
	}
```

我觉得这样做是有道理的，因为大多数 Android 应用的数据都是在发生用户交互的时候被改变的。如果你的数据是因为其他因素被改变的 - 那就只能手动通过 render()渲染了。

## 总的来说 ##

这个方法虽然简单，却非常有用：

- 你能用类似 XML 的方式定义你的布局结构（通过嵌套调用 v() 方法）

- 你能用一种清晰易懂的方式绑定数据和监听器

- 布局都是类型安全的，并且你的编译器会自动完成相应的工作

- 没有运行时产生的开销，没有使用反射机制，没有自动生成代码

- 你能在任何地方使用 Java（变量，语句，宏）生成布局

- 你能用自定义 View 和自定义的属性设置方法

- 因为你的所有 UI 数据都被保存在属性中，因此你能轻易的保存它们

- 使用纯 Java 实现这些逻辑需要的代码还不到 250 行！

以上证明了这个方法是可行的。现在我在想，如果有人想要用这个方法开发一个功能齐全的库呢？

设计一个好的“区分”算法会是其中的关键。基本地，它应该能判断一个结点是否被添加/移除/修改，而文件就在于属性节点。简单的数据类型我们只要调用 equals() 去比较两个值就可以了，但是监听器呢？

```java
	v(SomeView.java,
	    onClick(v => ...));
```

这样做的话每一次虚拟树被创建，都会创建一个对应的监听器对象。那怎么去比较它们？还是永远都不更新监听器，只更新发生了改变的监听器类？或者使用某种事件分发机制分发事件，而不是使用监听器？

另一件需要被注意的是：我不想自己把所有属性设置方法写好。这里有一个更好的方法，也就是 Kotlin 他们在 koan 库中做的那样。

我现在在研究怎么从 android.jar 的类中自动生成设置器，以使得这个项目更有用。

不管怎样，现在的代码我都放在 [Github](https://github.com/zserge/anvil) 上了，有 MIT 的许可。欢迎大家来评论和 PR！