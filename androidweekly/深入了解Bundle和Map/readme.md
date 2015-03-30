深入了解Bundle和Map
---

>
* 原文链接 : [The mysterious case of the Bundle and the Map](https://medium.com/the-wtf-files/the-mysterious-case-of-the-bundle-and-the-map-7b15279a794e)
* 译者 : [yinna317](https://github.com/yinna317) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  翻译完成

##前言

因为往Bundle对象中放入Map实际上没有表面上看起来那么容易。

这篇博客是在Eugenio @workingkills Marletti的帮助下完成的。

**警告**：这是一篇篇幅较长的博客


##案例：往Bundle对象放入特殊的Map

假设有这样一个案例：你需要将一个要传递的map附加到Intent对象。这个案例虽然不常见，但是，这种情况也是很有可能发生。
   
      
如果你在Intent对象中附加的是一个Map最常见的接口实现类HashMap，而不是包含附加信息的自定义类，你是幸运的，你可以用以下方法将map附加到Intent对象:

```java
 intent.putExtra("map",myHashMap);
```

在你接收的Activity里，你可以用以下方法毫无问题地取出之前在Intent中附加的Map:

```java
 HashMap map = (HashMap) getIntent().getSerializableExtra("map");
```
    

但是，如果你在Intent对象附加另一种类型的Map，比如：一个TreeMap（或者其他的自定义Map接口实现类），你在Intent中取出之前附加的TreeMap时，你用如下方法：

```java
 TreeMap map = (TreeMap) getIntent().getSerializableExtra("map");`
```
    
然后就会出现一个类转换异常:
```java
 java.lang.ClassCastException: java.util.HashMap cannot be cast to java.util.TreeMap`
```

因为编译器认为你的Map(TreeMap)正试图转换成一个HashMap


稍后我会详细地为大家讲解我为什么用 getSerializableExtra() 这个方法来取出附加到Intent中的Map。现在我可以先给大家一个通俗易懂的解释：因为所有默认的 Map 接口实现类都是Serializable,并且 putExtra()/getExtra() 方法接受的参数几乎都是“键-值”对，而其中值的类型非常广泛，Serializable就是其中之一，因此我们能够使用 getSerializableExtra() 来取得我们传递的Map。


在我们进行下一步之前，让我们去了解调用putExtra()/get*Extra()时涉及到的一些类或方法。

**提示**：文章很长，如果你只是想要一个解决方案的话，请跳到文章的最后面解决方案那里。


##Parcels:

大家都知道（也许少部分人不知道），在Android 系统中所有进程间通信是基于Binder机制。但是，希望大家明白的是允许数据在进程间传递是基于Parcel。

Parcel是Android进程间通信中， 高效的专用序列化机制。

与 Serializable 相反，Parcels 决不应该被用于储存任何类型的持久性数据，因为 Parcels 并不是为“操作可更新数据”（可更新数据指的是，具有持久性的数据会由于它的长留存时间会不断更新它的值）提供的，Parcels 更多的是传递 “短暂的一次性数据”，所以，不管什么时候使用Bundle，你在底层处理的都是Parcel。比如附加数据到Intent对象，在Fragment中设参数，等等。


Parcels 能处理很多类型，包括：本地类型，字符串类型，数组类型，Map类型，sparse arrays类型，以及parcelables和serializables对象。
除非你必须使用Serializable,一般情况下推荐使用Parcelables读写数据到Parcel.


相较于Serializable，Parcelable的优势更多地体现在性能上，因为Parcelable在内存开销方面更小，而这个理由足以让我们在大多数情况下毫不犹豫地选择Parcelable而不是Serializable。


##深入底层分析

让我们来了解下是什么原因使我们得到了ClassCastException异常。
从我们的代码中可以看到，我们对Intent中putExtras()的调用实际上是传入了一个String值和一个Serializable的对象，而不是传入一个Map值。因为Map接口实现类都是Serializable的，而不是Parcelable的。


###第一步：找到第一个突破口

让我们来看看在Intent.putExtra(String, Serializable)方法中做了什么。

>Intent.java

```java
public Intent putExtra(String name, Serializable value) {
      // ...
      mExtras.putSerializable(name, value);
      return this;
    }
}
```  


在这里，mExtras是个Bundle，Intent指令所有附加信息到bundle，从而调用了Bundle的putSerializable()方法，让我们来看看在Bundle中的putSerializable()方法中做了什么：

>Bundle.java

```java
@Override
    public void putSerializable(String key, Serializable value) {
      super.putSerializable(key, value);
    }
```   

从上面代码我们可以看出，Bundle中的putSerializable()方法中只是对父类的实现，调用了父类BaseBundle中的putSerializable（）方法。

>BaseBundle.java

```java
 void putSerializable(String key, Serializable value) {
      unparcel();
      mMap.put(key, value);
    }
```  

首先，让我们忽略其中的unparcel()这个方法。我们注意到mMap是一个ArrayMap<String, Object>类型的。这告诉我们，到了这步，我们往mMap中设入的是一个Object类型的。也就是说，不管我们之前是什么类型，在父类BaseBundle这里都转成了Obeject类型。

####这里开始出现问题了
![](https://d262ilb51hltx0.cloudfront.net/max/800/1*GokSVk3wQIhGoCQtVIwNTA.gif)


###第二步：分析写入 map

有趣的是当把Bundle中的值写入到一个Parcel中时，如果此时我们去检查我们附加值的类型，我们发现仍然能得到正确的类型。

```java
 	Intent intent = new Intent(this, ReceiverActivity.class);
    intent.putExtra("map", treeMap);
    Serializable map = intent.getSerializableExtra("map");
    Log.i("MAP TYPE", map.getClass().getSimpleName());
```  
    


如我们所料，这里打印出来的是TreeMap类型的。因此，在Bundle中写成一个Parcel，与再次读这期间一定发生了类型转换。


如果我们观察下是怎样写入Parcel的，我们看到，实际上是调BaseBundle中的writeToParcelInner()方法。

>BaseBundle.java

```java
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
```  


跳过所有不相干的代码，我们看到在Parcel的writeArrayMapInternal()方法中做了大量的事（mMap 是一个 ArrayMap类型）

>Parcel.java

```java
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
```  

####下一步让我们更深入地分析
![](https://d262ilb51hltx0.cloudfront.net/max/800/1*TOBlt2WOVLElnQTyG-R7YQ.gif)


###第三步：分析写入Map值

那么，在Parcel中writeValue() 方法又是怎样呢？主要是一些if...else语句。

>Parcel.java

```java
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
```  

虽然TreeMap是以Serializable的类型传入到 bundle，但是在Parcel中writeValue(）方法执行的是map这个分支的代码---“v instanceof Map”，（“v instanceof Map”在“v instanceOf Serializable”之前）

####到了这里，问题更明显了。

![](https://d262ilb51hltx0.cloudfront.net/max/800/1*zA893bdM9QmLYPlRe7estg.gif)


现在我想，他们是不是对 Map 进行了一些非常规的处理，使得 Map 将无可避免地被转换为 HashMap 类型。

###第四步：分析将Map写入到Parcel中

Parcel中的writeMap()方法并没有做什么事，只是将我们传入的Map值强转成Map<String, Object>类型，调用writeMapInternal（）方法。

>Parcel.java

```java
   public final void writeMap(Map val) {
      	writeMapInternal((Map<String, Object>) val);
    }
```  
  
JavaDoc文档对这个方法的解释非常清楚：即Map必须是String类型的。

尽管我们可能传入一个key值不为String的Map,类型擦除也使我们不会获得运行时错误。(这是完全非法的)

事实上，看一下Parcel中的writeMapInternal()方法，这更打击我们。

>Parcel.java

```java
  /* package */ void writeMapInternal(Map<String,Object> val) {
      // ...
      Set<Map.Entry<String,Object>> entries = val.entrySet();
      writeInt(entries.size());
      for (Map.Entry<String,Object> e : entries) {
    	writeValue(e.getKey());
    	writeValue(e.getValue());
      }
    }
```   

类型擦除使所有的这些代码都不会出现运行时错误。

实际上，在我们遍历Map调用writeValue()方法时，依赖的是原先的类型检查。从我们之前分析writeValue() 这个方法能看出，writeValue(）能处理非String类型的key值。


也许这里的文档和代码在某些地方有些不一致（还没有同步）。
但是，如果你在一个Bundle里对TreeMap<Integer, Object>进行设值和取值，将不会出现问题。
当然也还是会出现TreeMap转换成HashMap的异常。


####黑洞启示录：

![](https://d262ilb51hltx0.cloudfront.net/max/600/1*sOK3EennxwiAPNzz5s0C4Q.gif)


在这里已经非常清楚了，当Map写入到一个Parcel时，Map丢失了它们的类型，所以当我们再次读时是没办法来复原原来的信息。



###第五步：分析读Map

让我们来看看Parcel中readValue()这个方法，这个方法和writeValue()相对应。

>Parcel.java

```java
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
```  

>parcel处理写入数据的方式是：

1. 写入一个int来定义数据类型（一个VAL_*的常量）。

2. 存储数据本身（包括其他一些元数据，比如String这种没有固定大小的类型的数据长度）。

3. 递归调用非原始数据类型。


这里我们可以看到，readValue()方法中，首先读取一个int的数据，这个int数据是在writeValue（）中将TreeMap设成的VAL_MAP的常量，然后去匹配后面的分支,调用readHashMap()方法来取回数据。

>Parcel.java

```java
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
```  

readMapInternal()这个方法只是将我们从Parcel中读取的map重新进行打包。

这就是为什么我们总是从Bundle中获得一个HashMap，同样的，如果你创建了一个实现了Parcelable自定义类型Map,得到的也是一个HashMap。

很难说本身设计如此，还是是一个疏忽。
这确实是一个极端例子，因为在一个Intent中传一个Map是比较少见的，你也只有很小的理由来传Serializable而不是Parcelable的。
但是文档上没有写，这让我觉得应该是个疏忽，而不是本身设计如此。


##解决方案：

好了，分析底层代码我们已经弄明白了我们的问题，现在我们定位到问题的关键位置。
我们需要明白的是在writeValue()方法中，TreeMap没有进入“v instanceOf Map”这个分支


当我和 Eugenio谈话时，我想到的第一个想法是将map包裹成一个Serializable的容器，这个想法是丑陋的但是有效的。
Eugenio迅速写了个通用的wrapper类解决了这个问题。

>MapWrapper.java

```java
  public class MapWrapper<T extends Map & Serializable> implements Serializable {
 
  private final T map;

  public MapWrapper(T map) {
    this.map = map;
  }

  public T getMap() {
    return map;  public static <T extends Map & Serializable> Intent
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
  }
```  


##另一个可行的解决方案：

另一个解决方法是，在你将Map附加到Intent前，将Map转成byte array的。然后调用getByteArrayExtra()方法。但是这种方法你必须处理序列化与反序列化的问题。

如果你想要其他的解决方案，你可以依据Eugenio提供的代码要点来写一个。

##当你不能掌控Intent上面的代码时：

也许，有这样或那样的原因，对于Bundle中的代码你无法掌控，比如可能在第三方的library中。

这种情况，要想到，
Map接口实现类有一个构造器方法，可以将map作为参数传入，比如 new TreeMap(Map)，你可以把从Bundle中取回的HashMap，用构造器的方式转成你想要的类型。

不过，要记得的是，这种用构造器的方式，map中的附加属性将会丢失，只有键值对被保存了下来。

##总结：

在Android开发中，你可能会被一些表面的事所欺骗，特别是一些小的，似乎是无关紧要的事。

当事情没有像我们期盼中那样发生时，不要死盯着JavaDoc文档，因为JavaDoc可能过时了，JavaDoc的作者也不知道你的特殊需求。这个时候去看看源码，答案可能在AOSP代码里。

AOSP代码是我们的巨大财富，这在移动开发领域几乎是独一无二的，因为我们能够准确的知道在底层都做了些什么。


当你知道了底层代码执行了什么，你也就能够成为一个更好的开发人员。

记住：凡事要嘛就是成功，要嘛就是失败

![](https://d262ilb51hltx0.cloudfront.net/max/800/0*40IPQ7jhknFGYKNR.)


##最后：

感谢[chaossss](https://github.com/chaossss)  帮我校对文章

初次翻译，Android也是刚接触，翻译不好的地方，请大家多多指教。





