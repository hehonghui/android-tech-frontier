`深入了解Bundle和Map
---

>
* 原文链接 : [The mysterious case of the Bundle and the Map](https://medium.com/the-wtf-files/the-mysterious-case-of-the-bundle-and-the-map-7b15279a794e)
* 译者 : [yinna317](https://github.com/yinna317) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成


Because putting Maps in a Bundle is harder than it looks.
[This post was written with the help of Eugenio @workingkills Marletti]
Warning-this is a long post.


因为往Bundle对象中放入Map实际上没有表面上看起来那么容易
这篇博客是在Eugenio @workingkills Marletti的帮助下写的
警告：这是一篇很长的博客

##When edge cases just aren’t covered

Assume that you need to pass a map of values as an extra in an Intent. This might not be a common scenario, admittedly, but it can happen. It definitely happened to Eugenio.

##当往Bundle对象放入特殊的Map时

假设有这样一个案例：你需要将一个要传递的map附加到Intent对象.这个案例虽然不常见，但是，这种情况也是很有可能发生。
`

If you are using a HashMap, the most common type of Map, and you didn’t create a custom class that contains “extra” information, you’re lucky. You can put in:

```Java intent.putExtra("map", myHashMap);

如果你在Intent对象中附加的是一个Map最常见的接口实现类HashMap，而不是包含附加信息的自定义类，你是幸运的，你可以用以下方法将map附加到Intent对象:
```Java intent.putExtra("map", myHashMap);

And in your receiving Activity, you’ll get your nice map back out of the Intent’s extras:
```Java HashMap map = (HashMap) getIntent().getSerializableExtra("map");

在你接收的Activity里,你可以用以下方法毫无问题地取出之前在Intent中附加的Map
```Java HashMap map = (HashMap) getIntent().getSerializableExtra("map");

But what if you need to pass another kind of Map in the intent extras — say, a TreeMap (or any custom implementation)? Well, when you retrieve it:

```Java TreeMap map = (TreeMap) getIntent().getSerializableExtra("map");

Then you get this:
```Java java.lang.ClassCastException: java.util.HashMap cannot be cast to java.util.TreeMap

但是，当你要向Intent对象附加另一种类型的Map,比如：一个TreeMap（或者其他的自定义Map接口实现类）,当你在Intent中取出之前附加的TreeMap时，你用如下方法：

你获得一个类转换异常，因为你的Map（TreeMap）试图转换成一个HashMap

We’ll see why we’re using getSerializableExtra() later on, suffice for now saying it’s because all the default Map implementations are Serializable and there’s no narrower scope of putExtra()/get*Extra() that can accept them.

稍后我们将明白为什么我们用getSerializableExtra()这个方法来取出我们附加到Intent中的Map.从目前来看，是因为所有默认的Map接口实现类都是Serializable的（所有Map接口实现类都实现了Serializable接口）,并且putExtra()/get*Extra()的作用域很广能够接受他们

Before we move on, let’s get to know the actors involved in this drama.

[tl:dr; skip to “Workaround” at the end if you just want a solution!]

在我们进行下一步之前，让我们去了解参与这场戏的演员。（让我们去了解调用putExtra()/get*Extra()时涉及到的一些类或方法）
提示：（文章很长，如果你只是想要一个解决方案的话，请跳转到文章的最后面解决方案那里）









