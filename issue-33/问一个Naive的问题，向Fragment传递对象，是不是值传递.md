### 问一个Naive的问题，向Fragment传递对象，是不是值传递?! 
> * 原文链接 : [Sending objects to Fragment; Naive question: is it sent by value?!](https://medium.com/@hamidgh/sending-objects-to-fragment-naive-question-is-it-sent-by-value-ddaaa19fa42d#.2t5oq6p9t)
* 原文作者 : [Hamid Gharehdaghi](https://medium.com/@hamidgh)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成
 
#### 1. 介绍
  
如果你开发过Android应用，你一定知道[Intent](http://developer.android.com/reference/android/content/Intent.html)和[Bundle](http://developer.android.com/reference/android/os/Bundle.html)，我们使用他们来向其他应用组件(Activities，Services，...)传递额外的数据。Intent内部使用Bundle来存储数据。所以Bundle是存储额外数据的关键。
 
你可以在Bundle中存放基本数据类型和对象。但是要想放对象，你的类需要实现Serializable或者Parcelable接口，而且，你知道的，好的开发者会因为性能考虑选择Parcelable。
  
我们不打算讨论如何实现这些接口的细节，因为有很多文章已经讲解的很清楚。另外有一个Android Studio的[插件](https://github.com/mcharmas/android-parcelable-intellij-plugin)可以帮助我们减轻一些实现Parcelable的痛苦。

#### 2. Bundle是如何工作的？
 
Bundle使用[Map](http://developer.android.com/reference/java/util/Map.html)<String, Object>来保存额外的数据。所以在存储数据这方面Map和Bundle是没有区别的。但是当你向其他Activity(或者其他IPC组件比如Service，BroadcastReceiver，...)传递数据时，Map会通过序列化成Parcel被转为byte[ ]并传递给接收者。在接收者中数据流会逆向将byte[]还原为Map<String,Object>，你就可以使用之前设定的key来获取数据了。
  
所以Bundle就像是一个可以被序列化成byte[ ]也可以从byte[ ]反序列化的Map.重要的一点是你无法使用转化的byte[ ]持久化你的bundle,因为他被设计用来**只能**传递给组件,如果基础数据结构发生变化是无法正常工作的。

#### 3. 幼稚的问题：传给Fragments的对象是值传递吗？

**向Activity传递对象**

	Product myproduct = ...

	Intent intent = new Intent(context, ProductDetails.class);
	intent.putExtra("product", myproduct);
	startActivity(intent);
  
当你通过Intent向其他Activity传递数据时，因为和Activities(BroadcastReceivers，Services，...)是进程间通讯，Bundle(Intent内的)会被序列化成byte[ ]，接收者会使用相同的数据创建一个**新的**对象
 
从Parcel写入和读取，需要调用Parcelable.write和Parcelable.CREATOR.createFromParcel。

**向Fragment发送数据**

	Product myproduct = ...

	Bundle args = new Bundle();
	args.putParcelable("product", myproduct);
	Fragment productDetailsFragment = new ProductDetailsFragment();
	productDetailsFragment.setArguments(args);
 
当你将数据放入Bundle来发送给Fragment(作为参数)时，数据是存储在Bundle内部的map中。因为这并不是跨进程通讯，所以不需要将Bundle转为byte[ ]，Fragment会获得从Activity传来的**同一个**对象。那么你改变了该对象，Activity中也会变化，因为他们是同一个。
 
*但是如果fragment因为系统内存不足将要被销毁并重新创建呢？*在这种情况下，Bundle会被序列化成byte[ ]，并且存留到再次被创建，然后还反序列化成Bundle，所以这是fragment中创建的一个**新**对象，而不是Activity中那个。

**总结：**如你所见，向Activity传递数据是值传递。但是对Fragment来说有时是引用，有时是值传递。所以你需要总是考虑这一点，并且不要依赖于引用。
 
一个解决办法是在所有情况下都使用值传递，你向Fragment发送对象的副本而不是对象本身。这有多种方式可以做到，但是最简单的方式就是实现Clonable接口并使用Parcel来克隆你的对象。

	public class Product implements Parcelable, Cloneable {

    	@Override
    	public Object clone() {
        	Parcel parcel = Parcel.obtain();
        	this.writeToParcel(parcel, 0);
        	byte[] bytes = parcel.marshall();

        	Parcel parcel2 = Parcel.obtain();
        	parcel2.unmarshall(bytes, 0, bytes.length);
        	parcel2.setDataPosition(0);
        	return Product.CREATOR.createFromParcel(parcel2);
    	}

    	//Parcelable implementation code here ...
	}

	Product myproduct = ...

	Bundle args = new Bundle();
	args.putParcelable("product", (Product)myproduct.clone());
	Fragment productDetailsFragment = new ProductDetailsFragment();
	productDetailsFragment.setArguments(args);
 
这里是假设你所有的model都实现了Parcelable，然后你才能使用这个办法深克隆你的对象。
