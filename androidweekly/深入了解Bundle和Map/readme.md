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

警告：这是一篇篇幅较长的博客

##When edge cases just aren’t covered

Assume that you need to pass a map of values as an extra in an Intent. This might not be a common scenario, admittedly, but it can happen. It definitely happened to Eugenio.

##案例：往Bundle对象放入特殊的Map

假设有这样一个案例：你需要将一个要传递的map附加到Intent对象。这个案例虽然不常见，但是，这种情况也是很有可能发生。
`

If you are using a HashMap, the most common type of Map, and you didn’t create a custom class that contains “extra” information, you’re lucky. You can put in:

    
    Java intent.putExtra("map", myHashMap);

如果你在Intent对象中附加的是一个Map最常见的接口实现类HashMap，而不是包含附加信息的自定义类，你是幸运的，你可以用以下方法将map附加到Intent对象:

And in your receiving Activity, you’ll get your nice map back out of the Intent’s extras:

    Java HashMap map = (HashMap) getIntent().getSerializableExtra("map");


在你接收的Activity里,你可以用以下方法毫无问题地取出之前在Intent中附加的Map


But what if you need to pass another kind of Map in the intent extras — say, a TreeMap (or any custom implementation)? Well, when you retrieve it:

    Java TreeMap map = (TreeMap) getIntent().getSerializableExtra("map");

Then you get this:

    java.lang.ClassCastException: java.util.HashMap cannot be cast to java.util.TreeMap

但是，当你要向Intent对象附加另一种类型的Map,比如：一个TreeMap（或者其他的自定义Map接口实现类）,当你在Intent中取出之前附加的TreeMap时，你用如下方法：

    `Java TreeMap map = (TreeMap) getIntent().getSerializableExtra("map");`
    
你获得一个类转换异常，因为你的Map（TreeMap）试图转换成一个HashMap

We’ll see why we’re using getSerializableExtra() later on, suffice for now saying it’s because all the default Map implementations are Serializable and there’s no narrower scope of putExtra()/get*Extra() that can accept them.

稍后我们将明白为什么我们用getSerializableExtra()这个方法来取出我们附加到Intent中的Map。从目前来看，是因为所有默认的Map接口实现类都是Serializable的（所有Map接口实现类都实现了Serializable接口），并且putExtra()/get*Extra()的作用域很广能够接受他们

Before we move on, let’s get to know the actors involved in this drama.

[tl:dr; skip to “Workaround” at the end if you just want a solution!]

在我们进行下一步之前，让我们去了解参与这场戏的演员。（让我们去了解调用putExtra()/get*Extra()时涉及到的一些类或方法）

提示：（文章很长，如果你只是想要一个解决方案的话，请跳转到文章的最后面解决方案那里）

##On Parcels

Many of you will know (but maybe some don’t) that all the IPC communication in the Android framework is based upon the concept of Binders. And hopefully many of you know that the main mechanism to allow data marshalling between those processes is based on Parcels.

##Parcels:

大家都知道（也许少部分人不知道），在Android 系统中所有进程间通信是基于Binder机制。但是，希望大家明白的是允许数据在进程间传递是基于Parcel.

A Parcel is an optimised, non-general purpose serialisation mechanism that Android employs for IPC. Contrary to Serializable objects, you should never use Parcels for any kind of persistence, as it does not provision for handling different versions of the data. Whenever you see a Bundle, you’re dealing with a Parcel under the hood.

        Adding extras to an Intent? Parcel.

        Setting arguments on a Fragment? Parcel.

        And so on.

Parcel是Android进程间通信中, 高效的专用序列化机制。
Parcel与Serializable的区别之一是:Serializable可将数据持久化方便保存，（但是因为android不同版本Parcel可能不同），所以不推荐使用Parcel进行数据持久化. 

不管什么时候使用Bundle,你在底层处理的都是Parcel.比如附加数据到Intent对象,在Fragment中设参数，等等。

Parcels know how to handle a bunch of types out of the box, including native types, strings, arrays, maps, sparse arrays, parcelables and serializables. Parcelables are the mechanism that you (should) use to write and read arbitrary data to a Parcel, unless you really, really need to use Serializable.



Parcels 能处理很多类型，包括：本地类型，字符串类型，数组类型，Map类型，sparse arrays类型，以及parcelables和serializables对象。
除非你必须使用Serializable,一般情况下推荐使用Parcelables读写数据到Parcel.

The advantages of Parcelable over Serializable are mostly about performances, and that should be enough of a reason to prefer the former in most cases, as Serializable comes with a certain overhead.

Parcelable相较于Serializable的优势，主要在于性能，相比较于Serializable性能消耗，有足够的理由选择前者。
(Parcelable的性能比Serializable好，在内存开销方面较小)

##Down into the rabbit hole

So, let’s try to understand what makes us get a ClassCastException. Starting from the code we are using, we can see that our call to Intent#putExtras() resolves to the overload that takes a String and a Serializable. As we’ve said before, this is expected, as Map implementations are Serializable, and they aren’t Parcelable. There also isn’t a putExtras() that explicitly takes a Map.


##深入底层分析
让我们来了解下是什么原因使我们得到了ClassCastException异常。
从我们的代码中可以看到，我们对Intent中putExtras()的调用实际上是传入了一个String值和一个Serializable的对象。而不是传入一个Map值。因为Map接口实现类都是Serializable的，而不是Parcelable的.

Step one: finding the first weak link

Let’s look at what happens in Intent.putExtra(String, Serializable):




