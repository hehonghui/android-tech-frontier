深入了解Bundle和Map
---

>
* 原文链接 : [The mysterious case of the Bundle and the Map](https://medium.com/the-wtf-files/the-mysterious-case-of-the-bundle-and-the-map-7b15279a794e)
* 译者 : [yinna317](https://github.com/yinna317) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  寻找校对中


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

###Step one: finding the first weak link

Let’s look at what happens in Intent.putExtra(String, Serializable):

Intent.java



    public Intent putExtra(String name, Serializable value) {
      // ...
      mExtras.putSerializable(name, value);
      return this;
    }


###第一步：找到第一个突破口

让我们来看看在Intent.putExtra(String, Serializable):方法中做了什么。



    public Intent putExtra(String name, Serializable value) {
      // ...
      mExtras.putSerializable(name, value);
      return this;
    }

In here, mExtras is clearly a Bundle. So ok, Intent delegates all the extras to a bundle, just as we expected, and calls Bundle#putSerializable(). Let’s see what that method does:

Bundle.java

    @Override
    public void putSerializable(String key, Serializable value) {
      super.putSerializable(key, value);
    }



As it turns out, this just in turn delegates to the super implementation, which is:

BaseBundle.java

    void putSerializable(String key, Serializable value) {
      unparcel();
      mMap.put(key, value);
    }


在这里，mExtras是个Bundle, Intent指令所有附加信息到bundle，从而调用了Bundle的putSerializable()方法，让我们来看看在Bundle中的putSerializable()方法中做了什么：

Bundle.java

    @Override
    public void putSerializable(String key, Serializable value) {
      super.putSerializable(key, value);
    }

从上面代码我们可以看出，Bundle中的putSerializable()方法中只是对父类的实现，调用了父类BaseBundle中的putSerializable（）方法。

BaseBundle.java

    void putSerializable(String key, Serializable value) {
      unparcel();
      mMap.put(key, value);
    }


Good, we got to some meat, at last.

First of all, let’s ignore unparcel(). We can notice that mMap is an ArrayMap<String, Object>. This tells us we’re losing any kind of type information we might have had before — i.e., at this point, everything ends up in one big map that contains Objects as values, no matter how strongly typed the method we used to put the value in the Bundle was.

首先，让我们忽略其中的unparcel()这个方法。我们注意到mMap是一个ArrayMap<String, Object>类型的。这告诉我们，到了这步，我们往mMap中设入的是一个Object类型的。也就是说，不管我们之前是什么类型，在父类BaseBundle这里都转成了Obeject类型。


###Step two: writing the map
The really interesting stuff starts to happen when we get to actually writing the contents of the Bundle to a Parcel. Until then, if we check the type of our extra, we’re still getting the correct type:

    Intent intent = new Intent(this, ReceiverActivity.class);
    intent.putExtra("map", treeMap);
    Serializable map = intent.getSerializableExtra("map");
    Log.i("MAP TYPE", map.getClass().getSimpleName());

###第二步：分析写入 map

有趣的是当把Bundle中的值写入到一个Parcel中时,如果此时我们去检查我们附加值的类型，我们发现仍然能得到正确的类型。


    Intent intent = new Intent(this, ReceiverActivity.class);
    intent.putExtra("map", treeMap);
    Serializable map = intent.getSerializableExtra("map");
    Log.i("MAP TYPE", map.getClass().getSimpleName());

That prints, as we’d expect, TreeMap to the LogCat. So the transformation must happen between the time the Bundle gets written into the Parcel, and when it’s read again.

如我们所料，这里打印出来的是TreeMap类型的。因此，在Bundle中写成一个Parcel，与再次读这期间一定发生了类型转换。

If we look at how writing to a Parcel happens, we see that the nitty gritty goes down in BaseBundle#writeToParcelInner:

BaseBundle.java

    void writeToParcelInner(Parcel parcel, int flags) {
      if (mParcelledData != null) {
    // ...
      } else {
    // ...
    int startPos = parcel.dataPosition();
    parcel.writeArrayMapInternal(mMap);
    int endPos = parcel.dataPosition();
    // ...
      }
    }


如果我们观察下是怎样写入Parcel的，我们看到，实际上是调用了BaseBundle中的writeToParcelInner()方法。

Skipping all the code that is irrelevant for us, we see that the bulk of the work is performed by Parcel#writeArrayMapInternal() (remember mMap is an ArrayMap!):

Parcel.java

    /* package */ void writeArrayMapInternal(
    	ArrayMap<String, Object> val) {
      // ...
      int startPos;
      for (int i=0; i<N; i++) {
    // ...
    writeString(val.keyAt(i));
    writeValue(val.valueAt(i));
    // ...
      }
    }

跳过所有不相干的代码，我们看到在Parcel的writeArrayMapInternal()方法中做了大量的事（mMap 是一个 ArrayMap类型）

Parcel.java

    /* package */ void writeArrayMapInternal(
    	ArrayMap<String, Object> val) {
      // ...
      int startPos;
      for (int i=0; i<N; i++) {
    // ...
    writeString(val.keyAt(i));
    writeValue(val.valueAt(i));
    // ...
      }
    }


What this basically does is it writes every key-value pair in the BaseBundle’s mMap sequentially as a String (the keys are all strings here) followed by the value. The latter seems not to be considering the value type so far.

####Let’s go one level deeper!

这里做的最基本的事情是循环遍历BaseBundle中的mMap，写入key
和value。key值是以String的方式写入，Value在这里并没有考虑它的类型。

####下一步让我们更深入地分析

###Step three: writing maps’ values

So how does Parcel#writeValue() look like, you ask? Here it is, in its if-elseif-else glory:

Parcel.java

        public final void writeValue(Object v) {
	      if (v == null) {
	    	writeInt(VAL_NULL);
	      } else if (v instanceof String) {
		    writeInt(VAL_STRING);
		    writeString((String) v);
	      } else if (v instanceof Integer) {
		    writeInt(VAL_INTEGER);
		    writeInt((Integer) v);
	      } else if (v instanceof Map) {
		    writeInt(VAL_MAP);
		    writeMap((Map) v);
	      } else if (/* you get the idea, this goes on and on */) {
	    	// ...
	      } else {
	    	Class<?> clazz = v.getClass();
	    	if (clazz.isArray() &&
	    	clazz.getComponentType() == Object.class) {
	      // Only pure Object[] are written here, Other arrays of non-primitive types are
	      // handled by serialization as this does not record the component type.
	      	writeInt(VAL_OBJECTARRAY);
	     	 writeArray((Object[]) v);
	    } else if (v instanceof Serializable) {
	      // Must be last
	      writeInt(VAL_SERIALIZABLE);
	      writeSerializable((Serializable) v);
	    } else {
	      throw new RuntimeException("Parcel: unable to marshal value "+ v);
	    }
	      }
	    }

Aha! Gotcha! Even though we put our TreeMap in the bundle as a Serializable, the writeValue() method does in fact catch it in its v instanceOf Map branch, which (for obvious reasons) comes before the else … if (v instanceOf Serializable) branch.

I now wonder, are they using some totally undocumented shortcut for Maps, that somehow turns them into HashMaps?

###第三步：分析写入Map值

那么，在Parcel中writeValue() 方法又是怎样呢？主要是一些if...else语句。


虽然TreeMap是以Serializable的类型传入到 bundle，但是在Parcel中writeValue(）方法执行的是map这个分支的代码---“v instanceof Map”，（“v instanceof Map”在“v instanceOf Serializable”之前）

####到了这里，问题出现更明显了。

现在我想，对于Map是不是他们用了一些完全非法捷径，这样不管怎样将他们转成HashMap类型。


###Step four: writing a Map to the Parcel

Well, as it turns out, writeMap() doesn’t do an awful lot in and by itself, apart from enforcing the type of Map we’ll be handling later on:

Parcel.java

        public final void writeMap(Map val) {
      	writeMapInternal((Map<String, Object>) val);
    }
    

###第四步：分析将Map写入到Parcel中

Parcel中的writeMap()方法并没有做什么事，只是将我们传入的Map值
强转成Map<String, Object>类型，调用writeMapInternal（）方法。

The JavaDoc for this method is pretty clear:

    “The Map keys must be String objects.”

Type erasure makes sure we’ll actually never have a runtime error here, though, even if we might be passing a Map with keys that aren’t Strings (again, this is totally undocumented at higher level…).

JavaDoc文档对这个方法的解释非常清楚：即Map必须是String类型的。

尽管我们可能传入一个key值不为String 的Map,类型擦除也使我们不会获得运行时错误。(这是完全非法的)

In fact, as soon as we take a look at writeMapInternal(), this hits us:

Parcel.java

    /* package */ void writeMapInternal(Map<String,Object> val) {
      // ...
      Set<Map.Entry<String,Object>> entries = val.entrySet();
      writeInt(entries.size());
      for (Map.Entry<String,Object> e : entries) {
    	writeValue(e.getKey());
    	writeValue(e.getValue());
      }
    }

Again, type erasure here makes all those casts pretty much worthless at runtime. The fact is that we’re relying on our old type-checking friend writeValue() for both the keys and the values as we “unpack” the map and just dump everything in the Parcel. And as we’ve seen, writeValue() is perfectly able to handle non-String keys.

事实上，看一下Parzcel中的writeMapInternal()方法，这更打击我们。

类型擦除使所有的这些代码都不会出现运行时错误。

实际上，在我们遍历Map调用writeValue()方法时，依赖的是原先的类型检查。从我们之前分析writeValue() 这个方法能看出，writeValue(）能处理非String类型的key值。

Maybe the documentation got out of sync with the code at some point here, but as a matter of fact, putting and retrieving a TreeMap<Integer, Object> in a Bundle works perfectly.

Well, with the exception of the TreeMap becoming an HashMap, of course.

也许这里的文档和代码在某些地方有些不一致（还没有同步）。
但是，如果你在一个Bundle里对TreeMap<Integer, Object>进行设值和取值，将不会出现问题。
当然也还是会出现TreeMap转换成HashMap的异常。

####Black holes and revelations

Ok, the picture here is pretty clear by now. Maps completely lose their type when they’re written to a Parcel, so there’s no way to recover that information when they get read back.

####黑洞启示录：

在这里已经非常清楚了，当Map写入到一个Parcel时，Map丢失了它们的类型，所以当我们再次读时是没办法来复原原来的信息。


###Step five: reading back the Map

As a last quick check of our theory, let’s go and check readValue(), which is writeValue()’s counterpart:

Parcel.java

    public final Object readValue(ClassLoader loader) {
      int type = readInt();
    
      switch (type) {
    case VAL_NULL:
      return null;
    
    case VAL_STRING:
      return readString();
    
    case VAL_INTEGER:
      return readInt();
    
    case VAL_MAP:
      return readHashMap(loader);
    
    // ...
      }
    }

###第五步：分析读Map

让我们来看看Parcel中readValue()这个方法,这个方法和writeValue()相对应。

The way Parcel works when writing data is, for each item it contains:

1.  it writes an int that defines the data type (one of the VAL_* constants)

2.  dumps the data itself (optionally including other metadata such as the data length for non-fixed size types, e.g. String).

3.  recursively repeat for nested (non-primitive) data types


parcel处理写入数据的方式是：

1. 写入一个int来定义数据类型（一个VAL_*的常量）

2. 存储数据本身（包括其他一些元数据，比如String这种没有固定大小的类型的数据长度）

3. 递归调用非原始数据类型

Here we see that readValue() reads that data type int, that for our TreeMap was set to VAL_MAP by writeValue(), and then the corresponding switch case simply calls readHashMap() to retrieve the data itself:

Parcel.java

    public final HashMap readHashMap(ClassLoader loader)
    {
      int N = readInt();
      if (N < 0) {
     return null;
      }
      HashMap m = new HashMap(N);
      readMapInternal(m, N, loader);
      return m;
    }

这里我们可以看到，readValue()方法中，首先读取一个int的数据，这个int数据是在writeValue（）中将TreeMap设成的VAL_MAP的常量，然后去匹配后面的分支,调用readHashMap()方法来取回数据。

You can pretty much imagine that readMapInternal() simply repacks all map items it reads from the Parcel into the map that we pass to it.

readMapInternal()这个方法只是将我们从Parcel中读取的map重新进行打包

And yes. This is the reason why you get always a HashMap back from a Bundle. The same goes if you create a custom Map that implements Parcelable. Definitely not what we’d expect!

这就是为什么我们总是从Bundle中获得一个HashMap,同样的，如果你创建了一个实现了Parcelable自定义类型Map,得到的也是一个HashMap.

It’s hard to say if this is an intended effect or simply an oversight. It’s admittedly an edge case, since you have really few valid reasons to pass a Map into an Intent, and you should have just as little good reasons to pass Serializables instead of Parcelables. But the lack of documentation makes me think it might actually be an oversight rather than a design decision (deriving from other design decisions).

很难说本身设计如此，还是是一个疏忽。
这确实是一个极端例子，因为在一个Intent中传一个Map是比较少见的，你也只有很小的理由来传Serializable而不是Parcelable的。
但是文档上没有写，这让我觉得应该是个疏忽，而不是本身设计如此。

##Workaround (aka tl;dr)

Ok, we’ve understood our issue in depth, and now we’ve identified the critical path that messes with us. We need to make sure our TreeMap doesn’t get caught into the v instanceOf Map check in writeValue().

##解决方案：
好了，分析底层代码我们已经弄明白了我们的问题，现在我们定位到问题的关键位置。
我们需要明白的是在writeValue()方法中，TreeMap没有进入“v instanceOf Map”这个分支

The first solution that came to my mind when talking to Eugenio was ugly but effective: wrap the map into a Serializable container. Eugenio quickly whipped up this generic wrapper and confirmed it solves the issue.

MapWrapper.java

    public class MapWrapper<T extends Map & Serializable> implements Serializable {
     
      private final T map;
    
      public MapWrapper(T map) {
    	this.map = map;
      }
    
      public T getMap() {
   		 return map;
      }

      public static <T extends Map & Serializable> Intent
     	putMapExtra(Intent intent, String name, T map) {
    
    	return intent.putExtra(name, new MapWrapper<>(map));
      }
    
      public static <T extends Map & Serializable> T
    	 getMapExtra(Intent intent, String name)
     	throws ClassCastException {
    
    	Serializable s = intent.getSerializableExtra(name);
    	return s == null ? null : ((MapWrapper<T>)s).getMap();
      }
    }

当我和 Eugenio谈话时，我想到的第一个想法是将map包裹成一个Serializable的容器，这个想法是丑陋的但是有效的。
Eugenio迅速写了个通用的wrapper类解决了这个问题。

##Another possible workaround

Another solution could be to pre-serialize the Map yourself into a byte array before putting it as an Intent extra, and then retrieving it with getByteArrayExtra(), but you’d then have to handle serialisation and deserialisation manually.

In case you masochistically wanted to opt for this other solution instead, Eugenio has provided a separate Gist with the code.

##另一个可行的解决方案：

另一个解决方法是，在你将Map附加到Intent前，将Map转成byte array的。然后调用getByteArrayExtra()方法。但是这种方法你必须处理序列化与反序列化的问题。

如果你想要其他的解决方案，你可以依据Eugenio提供的代码要点来写一个。

##When you don’t control upstream Intents

Lastly, maybe for some reason you can’t control the Bundle creation code — e.g., because it’s in some third-party library.

##当你不能掌控Intent上面的代码时：

也许，有这样或那样的原因，对于Bundle中的代码你无法掌控，比如可能在第三方的library中。

In that case, remember that many Map implementations have a constructor that takes a Map as input, like new TreeMap(Map). You can use that constructor, if needed, to “change back” the HashMap you retrieve from the Bundle into your preferred Map type.

这种情况，要想到，
Map接口实现类有一个构造器方法，可以将map作为参数传入，比如 new TreeMap(Map)，你可以把从Bundle中取回的HashMap，用构造器的方式转成你想要的类型。


Keep in mind that in this case any “extra” properties on that map will be lost and only the key/value pairs will be preserved.

不过，要记得的是，这种用构造器的方式，map中的附加属性将会丢失，只有键值对被保存了下来。

##Conclusion

Being an Android developer means juggling your way around pretty much everything, especially the small, seemingly insignificant things.

##总结：

在Android开发中，你可能会被一些表面的事所欺骗，特别是一些小的，似乎是无关紧要的事。

#####When things don’t work as you’d expect them,
#####don’t just stare at the JavaDoc.
#####Because that might be outdated.
#####Or because the authors of the JavaDoc
#####didn’t know either about your specific case.
#####The answer might be in the AOSP code.

当事情没有像我们期盼中那样发生时，不要死盯着JavaDoc文档，因为JavaDoc可能过时了，JavaDoc的作者也不知道你的特殊需求。这个时候去看看源码，答案可能在AOSP代码里。

We have the huge luxury (and curse) of having access to the AOSP code. That’s something almost unique in the mobile landscape. We can know to a certain extent exactly what goes on. And we should.

AOSP代码是我们的巨大财富，这在移动开发领域几乎是独一无二的，因为我们能够准确的知道在底层都做了些什么。

Because even though it might look like it’s WTF-land sometimes, you can only become a better developer when you get to know the inner workings of the platform you work on.

当你知道了底层代码执行了什么，你也就能够成为一个更好的开发人员。



