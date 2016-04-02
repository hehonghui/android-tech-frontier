Building a Kotlin project
---

> * 原文链接 : [Building a Kotlin project](http://www.cirorizzo.net/2016/03/04/building-a-kotlin-project/)
* 原文作者 : [Ciro Rizzo](http://www.cirorizzo.net/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [rogero0o](https://github.com/Rogero0o)
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成

**注意 : 翻译完之后请认真的审核一遍有没有错字、语句通不通顺，谢谢~**

## Part 1

学一门新语言最有效的方法就是写一个实际的例子.

所以这个系列的博客将专注于使用 Kotlin 写一个小例子.

## Scenario （使用场景）

为了覆盖各种情景,这个DEMO必须要有以下要求：

- 网络访问
- 通过 REST API 请求数据
- 反序列化数据
- 在列表中显示图片

为了符合这些要求为什么不做一个显示小猫的app呢？

使用 http://thecatapi.com/ 的 API 我们可以检索到一些可爱的小猫的图片

小猫app

![](http://www.cirorizzo.net/content/images/2016/03/xkittenApp.png.pagespeed.ic.ulo4yWl6Cg.png)

## Dependencies （依赖库）


这可是个使用一些很腻害的依赖库的好机会，比如说：

- Retrofit2 用来请求网络，访问REST API以及数据的反序列化
- Glide 用来显示图片
- RxJava 来绑定数据
- RecyclerView CardView 支持界面显示
- 整体框架将使用MVP

## Set Up the Project （建立工程）



使用 Android Studio 来创建新工程将会非常简单

##### Start a new Android Project （创建一个新 Android 工程）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_NewProject.png.pagespeed.ic.7fDR0qSTJd.png)

##### Create a new project （ 创建一个项目）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_NewProject_Create_NEW-1.png.pagespeed.ic.rtJ-FIVYiG.png)

##### Select Target Android Device （选择需要的android版本）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_NewProject_Target.png.pagespeed.ic.bXlb6fWH62.png)

##### Add an activity （添加 activity）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_NewProject_Empty.png.pagespeed.ic.VYxIdhZ3Xk.png)

##### Customize the Activity （选择样式）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_NewProject_Activity.png.pagespeed.ic.3g2X5Gs9Bn.png)


点击完成，刚刚配置的模板工程将被创建。

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_Basic_Template.png.pagespeed.ic.3iX8nv51PP.png)

我们的 Kitten APP 就建好了！

然而这时候代码还是 java ， 接下来我们将它处理成 Kotlin.

## Defining Gradle Build Tool

下一步我们将升级 Build Tool 并且 将那些库我们将会用到库引用进来.

开始这步之前，请查看 Android Kotlin 需要的环境支持 [post](http://www.cirorizzo.net/kotlin-code/)

打开该项目 App中的 build.gradle （图片中指出的地方）

![](http://www.cirorizzo.net/content/images/2016/03/xAndroidStudio_Basic_Gradle_High.png.pagespeed.ic.0SHrJn4YZc.png)


将所有 引用库 和 andorid properties 的版本通过一个另外的 scripts 来管理是一个很好的习惯，可以使用Gradle提供的 ext 属性来使用和访问他们。


最简单的方法是在 build.gradle 文件的开头加上下面的片段

	buildscript {
	  ext.compileSdkVersion_ver = 23
	  ext.buildToolsVersion_ver = '23.0.2'

	  ext.minSdkVersion_ver = 21
	  ext.targetSdkVersion_ver = 23
	  ext.versionCode_ver = 1
	  ext.versionName_ver = '1.0'

	  ext.support_ver = '23.1.1'

	  ext.kotlin_ver = '1.0.0'
	  ext.anko_ver = '0.8.2'

	  ext.glide_ver = '3.7.0'
	  ext.retrofit_ver = '2.0.0-beta4'
	  ext.rxjava_ver = '1.1.1'
	  ext.rxandroid_ver = '1.1.0'

	  ext.junit_ver = '4.12'

	  repositories {
	      mavenCentral()
	  }

	  dependencies {
	      classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_ver"
	  }
	}


然后添加 Kotlin 插件 ， 如下所示

	apply plugin: 'com.android.application'
	apply plugin: 'kotlin-android'
	apply plugin: 'kotlin-android-extensions'

在添加我们将使用到的项目引用库之前，将之前添加在头部的ext属性对应的版本设置正确

	android {
	  compileSdkVersion "$compileSdkVersion_ver".toInteger()
	  buildToolsVersion "$buildToolsVersion_ver"

	  defaultConfig {
	    applicationId "com.github.cirorizzo.kshows"
	    minSdkVersion "$minSdkVersion_ver".toInteger()
	    targetSdkVersion "$targetSdkVersion_ver".toInteger()
	    versionCode "$versionCode_ver".toInteger()
	    versionName "$versionName_ver"
	}
	...


再改变一个 builTypes 选项

	buildTypes {
	    debug {
	        buildConfigField("int", "MAX_IMAGES_PER_REQUEST", "10")
	        debuggable true
	        minifyEnabled false
	        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
	    }

	    release {
	        buildConfigField("int", "MAX_IMAGES_PER_REQUEST", "500")
	        debuggable false
	        minifyEnabled true
	        shrinkResources true
	        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
	    }
	}
	sourceSets {
	    main.java.srcDirs += 'src/main/kotlin'
	}

下一步将是申明引用库在项目中的使用

	dependencies {
	  compile fileTree(dir: 'libs', include: ['*.jar'])
	  testCompile "junit:junit:$junit_ver"

	  compile "com.android.support:appcompat-v7:$support_ver"
	  compile "com.android.support:cardview-v7:$support_ver"
	  compile "com.android.support:recyclerview-v7:$support_ver"
	  compile "com.github.bumptech.glide:glide:$glide_ver"

	  compile "com.squareup.retrofit2:retrofit:$retrofit_ver"
	  compile ("com.squareup.retrofit2:converter-simplexml:$retrofit_ver") {
	    exclude module: 'xpp3'
	    exclude group: 'stax'
	}

	  compile "io.reactivex:rxjava:$rxjava_ver"
	  compile "io.reactivex:rxandroid:$rxandroid_ver"
	  compile "com.squareup.retrofit2:adapter-rxjava:$retrofit_ver"

	  compile "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_ver"
	  compile "org.jetbrains.anko:anko-common:$anko_ver"
	}

终于项目的 build.gradle 文件配置好了

还有一件事，添加访问网络的权限，将以下代码添加到AndroidManifest.xml中

	<uses-permission android:name="android.permission.INTERNET" />

可以进入下一步了

## Designing Project Structure （设计项目的结构）

另一个好习惯是 根据在项目中类的不同用途来设计包和文件夹，将相同类型的类放在一个包中，我们可以这样设计项目的结构：

![](data:image/png;base64,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)

右键点击 com.github.cirorizzo.kshows 包，然后选择 New ->Package

## Coding（写代码！）

下一篇将介绍如何编写 Kitten app

## Part 2

上一篇我们介绍了如何创建一个项目，并且对 Kitten APP 需要的 build.gradle 文件进行设置

下一步我们将开始对app进行编写

## Data Model （数据模型）

项目中的一个重要功能就是通过网络请求网站 http://thecatapi.com 中的数据

完整的域名将是 http://thecatapi.com/api/images/get?format=xml&results_per_page=10

API 返回一个 xml 文件

![](http://www.cirorizzo.net/content/images/2016/03/xxmlAPI.png.pagespeed.ic.CABTBWB1Ch.png)

必须对数据进行解析才能拿到我们需要的Kitten image的url

Kotlin 有一个非常适合的 class 叫做 data class 完美适合这样的需求

让我们再包名.cats 中创建一个新的class，右键包名然后选择 New->Kotlin File/Class ，命名为cats然后选择为 class

为了构建解析xml的class，Cats.kt 是这样的

	data class Cats(var data: Data? = null)

	data class Data(var images: ArrayList<Image>? = null)

	data class Image(var url: String? = "", var id: String? = "", var source_url: String? = "")

看到这是不是觉得特别简洁？

如果用java代码将会长很多

Kotlin的data class 有很多特点，比如说 对 getter(), setter() 和 toString() 方法的自动生成，对于 equals() hashCode() 和 copy()也是一样的，所以对于解析数据这真是完美啊

## API Call

访问网络有许多种方法，也有很多支持库，其中有一个来自Square的Retrofit2

这是一个非常强大的 HTTPClient 而且非常容易使用

我们从接口开始，在 network package中创建它

命名为CatAPI

	interface CatAPI {
	    @GET("/api/images/get?format=xml&results_per_page=" + BuildConfig.MAX_IMAGES_PER_REQUEST)
	    fun getCatImageURLs(): Observable<Cats>
	}

这个接口将会处理对接口 /api/images/get?format=xml&results_per_page=. 的请求

在这里 results_per_page 参数是从build.gradle中读取的，其中一个参数叫做 MAX_IMAGES_PER_REQUEST ，根据在buildTypes中设置不同值来定义它

	buildTypes {
	    debug {
	        buildConfigField("int", "MAX_IMAGES_PER_REQUEST", "10")
	        ...

用这个方法来定义值是非常方便的，在我们编译 debug版本和release版本时候非常方便，特别是在你需要区分这两者的值的时候

CatAPI 这个接口非常有趣，这个方法调用请求，并返回回调 ，从 fun getCatImageURLs(): Observable<Cats> 中

所以下一步是将它实现
让我们在同一个包（network）中创建一个新的class，命名为CatAPINetwork

	class CatAPINetwork {
	    fun getExec(): Observable<Cats> {
	        val retrofit = Retrofit.Builder()
	            .baseUrl("http://thecatapi.com")
	            .addConverterFactory(SimpleXmlConverterFactory.create())
	            .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
	            .build()

	        val catAPI: CatAPI = retrofit.create(CatAPI::class.java)

	        return catAPI.getCatImageURLs().
	            subscribeOn(Schedulers.io()).
	            observeOn(AndroidSchedulers.mainThread())
	    }
	}

fun getExec(): Observable<Cats> 这个方法被设置成 public 的意味着它可以被外者调用

.addConverterFactory(SimpleXmlConverterFactory.create())这一行说明了使用XML转换器来解析从API获得的数据

然后 .addCallAdapterFactory(RxJavaCallAdapterFactory.create()) 在AIP回调中调用了方法使 adapter 被使用

return 的这一行请参照  RxJava Observable

	return catAPI.getCatImageURLs().
	            subscribeOn(Schedulers.io()).
	            observeOn(AndroidSchedulers.mainThread())

## Presenter（提供者）

这个 Presenter 负责的是APP中的逻辑 还有将数据从model层绑定到试图层的业务逻辑

在我们的使用中它将实现一些 被试图层调用返回数据的方法，并且将这些数据提供给adapter以供呈现

为了和试图层的通信，我们将在presenter包中新建一个叫做MasterPresenter的接口

	interface MasterPresenter {
	    fun connect(imagesAdapter: ImagesAdapter)
	    fun getMasterRequest()
	}

第一个方法 fun connect(imagesAdapter: ImagesAdapter) 将被用于连接adapter的接口来显示数据，然后 fun getMasterRequest() 将被用于开始API请求

我们在同一个包中新建一个实现类，并命名为 MasterPresenterImpl

	class MasterPresenterImpl : MasterPresenter {
	    lateinit private var imagesAdapter: ImagesAdapter

	    override fun connect(imagesAdapter: ImagesAdapter) {
	        this.imagesAdapter = imagesAdapter
	    }

	    override fun getMasterRequest() {
	        imagesAdapter.setObservable(getObservableMasterRequest(CatAPINetwork()))
	    }

	    private fun getObservableMasterRequest(catAPINetwork: CatAPINetwork): Observable<Cats> {
	        return catAPINetwork.getExec()
	    }
	}

lateinit private var imagesAdapter: ImagesAdapter ， 这一行代码十分有趣，Kotlin给我们提供了声明一个非空变量而不需要设定初始值的功能，使用 lateinit 即可，变量将在他被使用的时候设定初始值，在我们的例子中它调用了 fun connect(imagesAdapter: ImagesAdapter).

fun getMasterRequest() 这个方法发起了网络请求，在启动了 catAPINetwork.getExec() 请求网络数据后 ，  设置Observable绑定到adapter中

## View section

在view包中的class主要负责对UI的管理

#### Layouts

在开始实现之前，让我们看看设计图先

![](http://www.cirorizzo.net/content/images/2016/03/xkittenApp-1.png.pagespeed.ic.ulo4yWl6Cg.png)

实现这个视图我们基本上需要两个视图容器和一个子布局容器

最底层的视图应该是包含整个list的视图，我们将视图描述在 activity_main.xml 中并房子啊 res->layout文件夹中，这个文件在创建工程时是自动生成的

在我们app中我们需要使用的时候 RecyclerView这个组件（一个十分强大，完美的组件）

activity_main.xml 将会长成这样


	<?xml version="1.0" encoding="utf-8"?>
	<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
	    xmlns:tools="http://schemas.android.com/tools"
	    android:layout_width="wrap_content"
	    android:layout_height="wrap_content"
	    tools:context=".view.MainActivity"
	    android:gravity="center">

	    <android.support.v7.widget.RecyclerView
	        android:id="@+id/containerRecyclerView"
	        android:layout_width="wrap_content"
	        android:layout_height="wrap_content"
	        android:scrollbars="vertical"
	        android:layout_centerInParent="true" />
	</RelativeLayout>

RecylerView 的父视图组件就是这个list和item的主要视图

row_card_view.xml 则是item的布局，它大概长这样：

	<?xml version="1.0" encoding="utf-8"?>
	<android.support.v7.widget.CardView
	    xmlns:card_view="http://schemas.android.com/apk/res-auto"
	    xmlns:android="http://schemas.android.com/apk/res/android"
	    android:id="@+id/card_view"
	    android:layout_gravity="center"
	    android:layout_width="wrap_content"
	    android:layout_height="wrap_content"
	    card_view:cardCornerRadius="4dp"
	    android:layout_margin="16dp"
	    android:background="@android:color/transparent"
	    android:layout_centerInParent="true"
	    android:elevation="4dp">

	    <RelativeLayout
	        android:layout_width="wrap_content"
	        android:layout_height="wrap_content"
	        android:layout_centerInParent="true"
	        android:gravity="center"
	        android:foregroundGravity="center">

	        <ImageView
	            android:layout_width="wrap_content"
	            android:layout_height="wrap_content"
	            android:id="@+id/imgVw_cat"
	            android:padding="4dp"
	            android:layout_centerInParent="true"
	            android:scaleType="fitCenter"
	            android:contentDescription="@string/cat_image" />
	    </RelativeLayout>
	</android.support.v7.widget.CardView>

如你所见item的父布局是一个card_view , 里面是一个 RelativeLayout 包含了一个 ImageView

## Adapter

现在我们完成了基本的layout，接下来将实现 MainActivity和adapter

开始处理adapter的第一件事就是创建被MasterPresenterImpl调用的接口，在view 包中创建一个命名为ImagesAdapter的文件

	interface ImagesAdapter {
	    fun setObservable(observableCats: Observable<Cats>)
	    fun unsubscribe()
	}

setObservable(observableCats: Observable<Cats>) 这个方法被MasterPresenterImpl调用来设置 Observalbe 并且让 adapter 来写入数据

unsubscribe() 这个方法被 MainActivity 调用来解除 adapter 和 Observable 的绑定，在activity被销毁的时候

现在让我们实现他们，在ImagesAdapterImpl 包中的一个新 class

	class ImagesAdapterImpl : RecyclerView.Adapter<ImagesAdapterImpl.ImagesURLsDataHolder>(), ImagesAdapter {
	    private val TAG = ImagesAdapterImpl::class.java.simpleName

	    private var cats: Cats? = null
	    private val subscriber: Subscriber<Cats> by lazy { getSubscribe() }

	    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ImagesURLsDataHolder {
	        return ImagesURLsDataHolder(
	                LayoutInflater.from(parent.context).inflate(R.layout.row_card_view, parent, false))
	    }

	    override fun getItemCount(): Int {
	        return cats?.data?.images?.size ?: 0
	    }

	    override fun onBindViewHolder(holder: ImagesURLsDataHolder, position: Int) {
	        holder.bindImages(cats?.data?.images?.get(position)?.url ?: "")
	    }

	    private fun setData(cats: Cats?) {
	        this.cats = cats
	    }

	    override fun setObservable(observableCats: Observable<Cats>) {
	        observableCats.subscribe(subscriber)
	    }

	    override fun unsubscribe() {
	        if (!subscriber.isUnsubscribed) {
	            subscriber.unsubscribe()
	        }
	    }

	    private fun getSubscribe(): Subscriber<Cats> {
	        return object : Subscriber<Cats>() {
	            override fun onCompleted() {
	                Log.d(TAG, "onCompleted")
	                notifyDataSetChanged()
	            }

	            override fun onNext(cats: Cats) {
	                Log.d(TAG, "onNextNew")
	                setData(cats)
	            }

	            override fun onError(e: Throwable) {
	                //TODO : Handle error here
	                Log.d(TAG, "" + e.message)
	            }
	        }
	    }

	    class ImagesURLsDataHolder(view: View) : RecyclerView.ViewHolder(view) {

	        fun bindImages(imgURL: String) {
	            Glide.with(itemView.context).
	                    load(imgURL).
	                    placeholder(R.mipmap.document_image_cancel).
	                    diskCacheStrategy(DiskCacheStrategy.ALL).
	                    centerCrop().
	                    into(itemView.imgVw_cat)
	        }
	    }
	}

这个class为 row_card_view.xml 提供数据，你能看见在 onCreateViewHolder 方法中都是对 item 的容器的操作

getSubscribe() 这个方法提供了 Observable 写入adapter的数据， 在 private val subscriber: Subscriber<Cats> by lazy { getSubscribe() } 这一行被调用，注意一下 lazy 初始化（懒加载），,这声明了一个固定的object，它会通过括在大括号的函数来创建（即getSubscribe（））在第一次运行时调用。

Subscriber 和 Observable 概念来自 RxJava,在后面的博客将深入研究

最后，有一段十分有趣的代码，在ImagesURLsDataHolder这个类中，通过Glide library用填充 imgVw_cat ， 通过 API请求传回来的URL将绑定到imageView中被显示出来， bindImages(imgURL: String) 方法中包装了这部分内容， 在同一个类中的方法 onBindViewHolder 中被调用

## Activity

最后但同样重要的Activity

	class MainActivity : AppCompatActivity() {
	    private val imagesAdapterImpl: ImagesAdapterImpl by lazy { ImagesAdapterImpl() }

	    private val masterPresenterImpl: MasterPresenterImpl
	            by lazy {
	                MasterPresenterImpl()
	            }

	    override fun onCreate(savedInstanceState: Bundle?) {
	        super.onCreate(savedInstanceState)
	        setContentView(R.layout.activity_main)

	        initRecyclerView()
	        connectingToMasterPresenter()
	        getURLs()
	    }

	    override fun onDestroy() {
	        imagesAdapterImpl.unsubscribe()
	        super.onDestroy()
	    }

	    private fun initRecyclerView() {
	        containerRecyclerView.layoutManager = GridLayoutManager(this, 1)
	        containerRecyclerView.adapter = imagesAdapterImpl
	    }

	    private fun connectingToMasterPresenter() {
	        masterPresenterImpl.connect(imagesAdapterImpl)
	    }

	    private fun getURLs() {
	        masterPresenterImpl.getMasterRequest()
	    }
	}

注意这些方法

- initRecyclerView()
- connectingToMasterPresenter()
- getURLs()

各自用作于

- 初始化主要布局
- 建立MainActivity和MasterPresenterImpl的连接，并将它传给ImagesAdapterImpl
- getURLs() 开始请求返回的xml数据，并运行接下来的步骤（解析数据，显示adapter中的图片）

Kitten app现在已经可以运行了

整个项目在github上，请搜索 KShow

其中也有java版本，方便进行对比
