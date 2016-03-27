Android中的MVP-Part2
---

> * 原文链接 : [Model View Presenter (MVP) in Android, Part 2](http://www.tinmegali.com/en/model-view-presenter-mvp-in-android-part-2/)
* 原文作者 : [TinMegali](https://medium.com/@tinmegali)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](https://github.com/)  
* 状态 :  完成

![Model View Presenter Class
Diagram](http://i2.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_ClassDiagram-en-1.png?fit=800%2C608)

In the [last
article](http://www.tinmegali.com/model-view-presenter-mvp-no-android-introducao/) we
talked about [Model View Presenter
(MVP)](https://pt.wikipedia.org/wiki/Model-view-presenter) concepts, and
its advantages concerning Android development. In the second part of
this series we’ll get the hands dirty and implement our own version of
MVP, using [canonical
form](https://en.wikipedia.org/wiki/Canonical_form) without any
libraries from outside Android SDK/Java.  
在上一篇[文章](http://www.tinmegali.com/model-view-presenter-mvp-no-android-introducao/)中我们谈论了[Model View Presenter
(MVP)](https://pt.wikipedia.org/wiki/Model-view-presenter)的概念和在Android开发中的优点。这是系列文章的第二篇，我们来动手实践一下，将使用[典型的形式](https://en.wikipedia.org/wiki/Canonical_form)实现一个MVP结构，不使用任何的Android SDK或JAVA以外的库。

We’ll develop a simple code, but it could look a little bit complex, due
to the amount of objects involved. Although, once you get the handle of
it, you’ll see how this kind of pattern could help you in your projects.
If you prefer to learn directly from code reading, you could check out
the [final
project](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp).  
我们会开发一个简单的工程，但是由于涉及大量的对象，可能使项目看起来有些复杂。但是，一旦你掌握了，你就会明白MVP模式如何能帮助你。如果你想直接看代码，[在这里](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)。

-   [Model View Presenter (MVP) in Android, part
    1](http://wp.me/p7gH7l-2x)
-   [Model View Presenter (MVP) in Android,
    part 3](http://wp.me/p7gH7l-34)

Planning Model Vide Presenter (MVP)
-----------------------------------
设计MVP
------

##### MVP main concepts in Android
##### MVP在Android中的主要概念

> #### **Presenter**
>
> The Presenter is responsible to act as **the middle man between View
> and Model**. It retrieves data from the Model and returns it formatted
> to the View. But unlike the typical MVC, it also decides what happens
> when you interact with the View.
> Presenter是View和Model的中间人。它从Model层获取数据，格式化后返回给View层。
> 但是和MVC模式不同的是，它决定如何处理你和视图的交互。
>
> #### **View**
>
> The View, usually implemented by an Activity, will contain a reference
> to the presenter. The only thing that the view will do is to call a
> method from the Presenter every time there is an interface action.
> 视图层，通常是由Activity实现，其中包含有presenter的引用。视图层唯一要做的事就是响应
> 用户的操作，调用Presenter层的方法。
>
> #### **Model**
>
> In an application with a good layered architecture, this model would
> only be the gateway to the domain layer or business logic. See it as
> the provider of the data we want to display in the view.
> 在有良好分层结构的应用中，Model层只是domain层或者业务逻辑的入口。把它看做视图层
> 数据的提供者就好。
>
> *These excellent definitions above were extracted from[Antonio Leiva’s
> article.](http://antonioleiva.com/mvp-android/)*
> *以上优秀的定义提取自[Antonio Leiva’s article](http://antonioleiva.com/mvp-android/)*

Our greatest object with MVP pattern is to increase the [separation of
concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) of our
project. Therefore, we need to ensure the isolation between the layer
Model, View and Presenter. In this context, **View and Model cannot
communicate directly**, hence the **Presenter intermediates all
relations among the layers.**  
使用MVP模式的最大任务是增加我们项目的[separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).因此我们需要确保Model层，View层和Presenter层的隔离。这种情况下，**View层和Model层无法直接通信**，因此**Presenter负责各层的通讯**

### Model View Presenter action diagram
### Model View Presenter行为图

Let’s imagine an extremely simple application, that allows the user to
take note on a journal. Basically, the user inserts notes while the
system saves and exhibit the data. If we trace the **insert note
action**, considering that the app was developed using MVP pattern,
we’ll get the following diagram:  
让我们设想一个简单的应用，它允许用户在旅途中做笔记。主要就是用户记录笔记，系统保存和展示数据。如果我们沿着输入笔记的行为，结合MVP模式，我们会得到下图：

![Model View Presenter (MVP) action
diagram](http://i2.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_ActionDiagram-en-1.png?resize=720%2C547)
Model View Presenter (MVP) action diagram
Model View Presenter (MVP) 行为图

1.  User clicks on “insert note”. **View** sends note to **Presenter** getPresenter newNote(textNote)
2.  **Presenter** creates a new Note, using the given String sent and
    invokes on **Model** the method responsible to insert the data on
    DB getModel.insertNote(note,this)
3.  **Model** inserts the Note on DB and informs **Presenter** about the
    success/error using the callback sent callback.onSuccess()
4.  **Presenter** processes the result and require **View** to exhibit a Toast success message getView.showToast()
1. 用户点击输入笔记。**视图层**将笔记内容传入**Presenter层**的newNote(textNote)方法。
2. **Presenter层**调用**Model层**的insertNote(note, this)方法，将传入的string创建为一个新的笔记。
3. **Model层**在数据库中插入笔记并且使用onSuccess()方法通知**Presenter层**成功/失败的结果
4. **Presenter层**处理结果后调用showToast()方法让**View层**展示一个toast

This mapping gives us a better idea for our classes planning. The
communication process defined above could be different: with direct
object access, using interfaces or maybe with some kind of
EventBus. However, since our implementation respects the canonical form
and we aim to increase the isolation of concerns, we’ll use only plain
and simple interfaces.  

这个映射给了我们类设计的灵感。上述不同层之间的通信过程可能会不一样：直接调用对象的方法，使用接口或者使用EventBus。然而，既然我们的实现方式遵循典型方式，并且意在增加，所以我们只是用原始简单的接口。

### Model View Presenter class diagram
### Model View Presenter类图

Let’s use our *action diagram* to construct a MVP [Class
Diagram](https://en.wikipedia.org/wiki/Class_diagram). We’ll change a
little bit our concept, switching from *callback* to *interface*, to
send results back to **Presenter** from **Model**. I believe this path
is more efficient, but some could argue that using *callbacks* the
isolation of concerns would increase.  
让我们使用上面的*行为图*来构造我们的MVP模式[类图](https://en.wikipedia.org/wiki/Class_diagram)。我们会对概念做一点改动，把*callback*换成*interface*，来将结果从**Model层**传回**Presenter层**。我相信这种方式更高效，但是肯定有人会对此有争议，认为*callback*会增加

![Model View Presenter Class
Diagram](http://i2.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_ClassDiagram-en-1.png?resize=720%2C547)
Model View Presenter Class Diagram
Model View Presenter 类图

1.  **Presenter** implements** interface PresenterOps**
2.  **View** receives reference from **PresenterOps** to
    access **Presenter**
3.  **Model** implements **interface ModelOps**
4.  **Presenter** receives reference from **ModelOps** to
    access **Model**
5.  **Presenter **implements **RequiredPresenterOps**
6.  **Model** receives reference from **RequiredPresenterOps** to access
    **Presenter**
7.  **View **implements **RequiredViewOps**
8.  **Presenter** receives reference from **RequiredViewOps** to access
    **View**
1. **Presenter层**实现**PresenterOps接口**
2. **View层**接受**PresenterOps接口**的引用来访问**Presenter**
3. **Model层**实现**ModelOps接口**
4. **Presenter层**接受**ModelOps接口**的引用来访问**Model**
5. **Presenter层**实现**RequiredPresenterOps接口**
6. **Model层**接受**RequiredPresenterOps接口**的引用来访问**Presenter**
7. **View层**实现**RequiredViewOps接口**
8. **Presenter层**接受**RequiredViewOps接口**的引用来访问**View**

Implementing Model View Presenter on Android
--------------------------------------------
在Android中实现MVP
----------------

Without further ado, let’s get to work! We’ll start defining the app
operations. In the name of a better organization, we’ll use an
“umbrella” class, containing all interfaces responsible to manage the
communication between the layers.  
事不宜迟，让我们动起来！先开始定义操作。为了更好的结构组织，我们使用一个“umbrella”类，包含所有层次间通讯的接口。

> **Note**: Since MVP implementation is complex enough, **no function
> outside the pattern scope will be developed.** I suppose that the
> readers have a more advanced understanding of the Android SDK,
> therefore such things shouldn’t be a concern.
> **注意**：由于实现MVP模式已经很复杂了，我不会实现其他多余的内容。我假设读者都对Android SDK有很好的理解，因此不需要我关注这些。

### Interface MainMVP

	/*
	 * Aggregates all communication operations between MVP pattern layer: 
	 * Model, View and Presenter 
	 */ 
	 public interface MainMVP { 
	 	/**
	 	 * View mandatory methods. Available to Presenter 
	 	 * Presenter -> View 
	 	 */ 
	 	 interface RequiredViewOps { 
	 	 	void showToast(String msg); 
	 	 	void showAlert(String msg); 
	 	 	// any other ops 
	 	 } 
	 	 
	 	 /** 
	 	  * Operations offered from Presenter to View 
	 	  * View -> Presenter 
	 	  */ 
	 	  interface PresenterOps { 
	 	  	  void onConfigurationChanged(RequiredViewOps view); 
	 	  	  void onDestroy(boolean isChangingConfig); 
	 	  	  void novaNota(String textoNota);
	 	  	  void deletaNota(Nota nota); 
	 	  	  // any other ops to be called from View 
	 	  }
	 	  
	 	  /** 
	 	   * Operations offered from Presenter to Model 
	 	   * Model -> Presenter 
	 	   */ 
	 	   interface RequiredPresenterOps { 
	 	   		void onNotaInserida(Nota novaNota); 
	 	   		void onNotaRemovida(Nota notaRemovida); 
	 	   		void onError(String errorMsg); 
	 	   		// Any other returning operation Model -> Presenter 
	 	   }
	 	   
	 	   /** 
	 	    * Model operations offered to Presenter 
	 	    * Presenter -> Model
	 	    */ 
	 	    interface ModelOps { 
	 	    	 void insereNota(Nota nota); 
	 	    	 void removeNota(Nota nota); 
	 	    	 void onDestroy(); 
	 	    	 // Any other data operation 
	 	    } 
	 }

### MainPresenter Class

	public class MainPresenter implements MainMVP.RequiredPresenterOps, MainMVP.PresenterOps {

    	// Layer View reference
    	private WeakReference&lt;MainMVP.RequiredViewOps&gt; mView;
    	// Layer Model reference
    	private MainMVP.ModelOps mModel;

    	// Configuration change state
    	private boolean mIsChangingConfig;

    	public MainPresenter(MainMVP.RequiredViewOps mView) {
        	this.mView = new WeakReference&lt;&gt;(mView);
        	this.mModel = new MainModel(this);
    	}

    	/**
     	 * Sent from Activity after a configuration changes
     	 * @param view  View reference
     	 */
    	@Override
    	public void onConfigurationChanged(MainMVP.RequiredViewOps view) {
        	mView = new WeakReference&lt;&gt;(view);
    	}

    	/**
     	 * Receives {@link MainActivity#onDestroy()} event
     	 * @param isChangingConfig  Config change state
     	 */
    	@Override
    	public void onDestroy(boolean isChangingConfig) {
        	mView = null;
        	mIsChangingConfig = isChangingConfig;
        	if ( !isChangingConfig ) {
            	mModel.onDestroy();
        	}
    	}

    	/**
     	 * Called by user interaction from {@link MainActivity}
     	 * creates a new Note
     	 */
    	@Override
    	public void newNote(String noteText) {
        	Note note = new Note();
        	note.setText(textoNota);
        	note.setDate(getDate());
        	mModel.insertNote(note);
    	}

    	/**
     	 * Called from {@link MainActivity},
     	 * Removes a Note
     	 */
    	@Override
    	public void removeNote(Note note) {
        	mModel.removeNote(note);
    	}

    	/**
     	 * Called from {@link MainModel}
     	 * when a Note is inserted successfully
     	 */
    	@Override
    	public void onNoteInsert(Note newNote) {
        	mView.get().showToast("New register added at " + newNote.getDate());
    	}

    	/**
     	 * Receives call from {@link MainModel}
     	 * when Note is removed
     	 */
    	@Override
    	public void onNoteRemoved(Note noteRemoved) {
        	mView.get().showToast("Note removed);
    	}

    	/**
     	 * receive errors
     	 */
    	@Override
    	public void onError(String errorMsg) {
        	mView.get().showAlert(errorMsg);
    	}
	}

### MainModel Class

	public class MainModel implements MainMVP.ModelOps {

    	// Presenter reference
    	private MainMVP.RequiredPresenterOps mPresenter;

    	public MainModel(MainMVP.RequiredPresenterOps mPresenter) {
        	this.mPresenter = mPresenter;
    	}

    	/**
     	 * Sent from {@link MainPresenter#onDestroy(boolean)}
     	 * Should stop/kill operations that could be running
     	 * and aren't needed anymore
     	 */
    	@Override
    	public void onDestroy() {
        	// destroying actions
    	}

    	// Insert Note in DB
    	@Override
    	public void insertNote(Note note) {
        	// data business logic
        	// ...
        	mPresenter.onNoteInserted(note);
    	}

    	// Removes Note from DB
    	@Override
    	public void removeNote(Note note) {
        	// data business logic
        	// ...
        	mPresenter.onNoteRemoved(note);
    	}
	}

### Dealing with Android particularities

In our MVP vision, the layer **View** is responsible to create
layer **Presenter**, who is encharged to instantiate the **Model**.
Considering that an **Activity** receives the **View **role, we need to
consider some Android specifics, specially the
[lifecycle](http://developer.android.com/training/basics/activity-lifecycle/index.html),
that **destroys and creates activities and its objects at any given**
moment.  
在我们的MVP模式中，**视图层**负责创建**Presenter层**，**Presenter层**负责实例化**Model层**对象。考虑到使用**Activity**来实现**View层**，我们需要考虑一些Android的细节，尤其是[生命周期](http://developer.android.com/training/basics/activity-lifecycle/index.html)

That said, we’ll need to add a fourth
element, **the StateMaintainer**, responsible to maintain
the Presenter and Model state during lifecycle changes. A retained
fragment will be the base to the Object and a simplified version of MVP
on the Activity’s lifecycle would look like this:  
这就是说，我们需要增加第四个元素**StateMaintainer**，负责在生命周期的变化中维护Presenter和Model的状态。使用retained fragment来实现这个对象，如下是

![MVP Objects destruction and reconstruction during Activity lifecycle
changes](http://i1.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_Activity_Lifecycle-en.png?resize=720%2C1253)
MVP Objects destruction and reconstruction during Activity lifecycle
changes  
Activity生命周期变化时MVP模式中对象的销毁和创建

1.  **Activity** creates a **Presenter **instance, saving a
    **PresenterOps** reference. The **Presenter** is saved in
    the **StateMaintainer**
2.  **Presenter** receives **RequiredViewOps** during its creation and
    instantiates a new **Model**
3.  **Model** receives **RequiredPresenterOps**
4.  When Activity is being destroyed, it informs to **Presenter** about
    it
5.  **Presenter** processes the information, takes the necessary
    measures and passes the info to **Model**
6.  **Activity** recovers the **Presenter** from **StateMaintainer**,
    sends **RequiredViewOps** and informs about its active state.
1. **Activity**创建一个**Presenter**的实例并持有**PresenterOps**的引用。**Presenter**存储在**StateMaintainer**中
2. **Presenter**在创建时接受**RequiredViewOps**类型参数并且创建一个**Model**对象
3. **Model**接受**RequiredPresenterOps**类型参数
4. 当Activity被销毁时，会通知**Presenter**
5. **Presenter**处理信息，作必要的处理后传递给**Model**
6. **Activity**从**StateMaintainer**中恢复**Presenter**，并且传递**RequiredViewOps**，通知他的激活状态。

### StateMaintainer Class

This implementation of the **StateMaintainer** can be used to save any
object state.  
**StateMaintainer**的这种实现可以用来存储任何对象的状态。

**StateMainainer**

	public class StateMaintainer {
		protected final String TAG = getClass().getSimpleName();

    	private final String mStateMaintenerTag;
    	private final WeakReference&lt;FragmentManager&gt; mFragmentManager;
    	private StateMngFragment mStateMaintainerFrag;

    	/**
     	 * Constructor
     	 * @param fragmentManager       FragmentManager reference
     	 * @param stateMaintainerTAG    the TAG used to insert the state maintainer fragment
     	 */
    	public StateMaintainer(FragmentManager fragmentManager, String stateMaintainerTAG) {
        	mFragmentManager = new WeakReference&lt;&gt;(fragmentManager);
        	mStateMaintenerTag = stateMaintainerTAG;
    	}

    	/**
     	 * Create the state maintainer fragment
     	 * @return  true: the frag was created for the first time
     	 *          false: recovering the object
     	 */
    	public boolean firstTimeIn() {
        	try {
            	// Recovering the reference
            	mStateMaintainerFrag = (StateMngFragment)mFragmentManager.get().findFragmentByTag(mStateMaintenerTag);

            	// Creating a new RetainedFragment
            	if (mStateMaintainerFrag == null) {
                	Log.d(TAG, "Creating a new RetainedFragment " + mStateMaintenerTag);
                	mStateMaintainerFrag = new StateMngFragment();
                	mFragmentManager.get().beginTransaction()
                        .add(mStateMaintainerFrag,mStateMaintenerTag).commit();
                    return true;
            	} else {
            		Log.d(TAG, "Returns a existent retained fragment existente " + mStateMaintenerTag);
            		return false;
            	}
        	} catch (NullPointerException e) {
            	Log.w(TAG, "Error firstTimeIn()");
            	return false;
        	}
    	}


    	/**
     	 * Insert Object to be preserved during configuration change
     	 * @param key   Object's TAG reference
     	 * @param obj   Object to maintain
     	 */
    	public void put(String key, Object obj) {
        	mStateMaintainerFrag.put(key, obj);
    	}

    	/**
     	 * Insert Object to be preserved during configuration change
     	 * Uses the Object's class name as a TAG reference
     	 * Should only be used one time by type class
     	 * @param obj   Object to maintain
     	 */
    	public void put(Object obj) {
        	put(obj.getClass().getName(), obj);
    	}


    	/**
     	 * Recovers saved object
     	 * @param key   TAG reference
     	 * @param &lt;T&gt;   Class type
     	 * @return      Objects
     	 */
    	@SuppressWarnings("unchecked")
    	public &lt;T&gt; T get(String key)  {
        	return mStateMaintainerFrag.get(key);
    	}

    	/**
     	 * Verify the object existence 
    	 * @param key   Obj TAG
     	 */
    	public boolean hasKey(String key) {
        	return mStateMaintainerFrag.get(key) != null;
    	}


    	/**
     	 * Save and manages objects that show be preserved
     	 * during configuration changes.
     	 */
    	public static class StateMngFragment extends Fragment {
        	private HashMap&lt;String, Object&gt; mData = new HashMap&lt;&gt;();

        	@Override
        	public void onCreate(Bundle savedInstanceState) {
            	super.onCreate(savedInstanceState);
            	// Grants that the frag will be preserved
            	setRetainInstance(true);
        	}

        	/**
        	 * Insert objects
        	 * @param key   reference TAG
        	 * @param obj   Object to save
        	 */
        	public void put(String key, Object obj) {
            	mData.put(key, obj);
        	}

        	/**
        	 * Insert obj using class name as TAG
        	 * @param object    obj to save
        	 */
        	public void put(Object object) {
            	put(object.getClass().getName(), object);
        	}

        	/**
         	 * Recover obj
        	 * @param key   reference TAG
        	 * @param &lt;T&gt;   Class
        	 * @return      Obj saved
        	 */
        	@SuppressWarnings("unchecked")
        	public &lt;T&gt; T get(String key) {
            	return (T) mData.get(key);
        	}
    	}
	}

### MainActivity Activity (View layer)

	public class MainActivity extends AppCompatActivity implements MainMVP.RequiredViewOps {

    	protected final String TAG = getClass().getSimpleName();

    	// Responsible to maintain the Objects state
    	// during changing configuration
    	private final StateMaintainer mStateMaintainer = new StateMaintainer( this.getFragmentManager(), TAG );

    	// Presenter operations
    	private MainMVP.PresenterOps mPresenter;

    	@Override
    	protected void onCreate(Bundle savedInstanceState) {
        	super.onCreate(savedInstanceState);
        	startMVPOps();
        	setContentView(R.layout.activity_main);
        	Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        	setSupportActionBar(toolbar);
        	FloatingActionButton fab = (FloatingActionButton)findViewById(R.id.fab);
    	}

    	/**
     	 * Initialize and restart the Presenter.
     	 * This method should be called after {@link Activity#onCreate(Bundle)}
     	 */
    	public void startMVPOps() {
        	try {
            	if ( mStateMaintainer.firstTimeIn() ) {
                	Log.d(TAG, "onCreate() called for the first time");
                	initialize(this);
            	} else {
                	Log.d(TAG, "onCreate() called more than once");
                	reinitialize(this);
            	}
        	} catch ( InstantiationException | IllegalAccessException e ) {
            	Log.d(TAG, "onCreate() " + e );
            	throw new RuntimeException( e );
        	}
    	}


    	/**
     	 * Initialize relevant MVP Objects.
     	 * Creates a Presenter instance, saves the presenter in {@link StateMaintainer}
     	 */
    	private void initialize( MainMVP.RequiredViewOps view ) throws InstantiationException, IllegalAccessException{
        	mPresenter = new MainPresenter(view);
        	mStateMaintainer.put(MainMVP.PresenterOps.class.getSimpleName(), mPresenter);
    	}

    	/**
     	 * Recovers Presenter and informs Presenter that occurred a config change.
     	 * If Presenter has been lost, recreates a instance
     	 */
    	private void reinitialize( MainMVP.RequiredViewOps view)
            throws InstantiationException, IllegalAccessException {
        	mPresenter = mStateMaintainer.get( MainMVP.PresenterOps.class.getSimpleName() );

        	if ( mPresenter == null ) {
            	Log.w(TAG, "recreating Presenter");
            	initialize( view );
        	} else {
            	mPresenter.onConfigurationChanged( view );
        	}
    	}

    	// Show AlertDialog
    	@Override
    	public void showAlert(String msg) {
        	// show alert Box
    	}

    	// Show Toast
    	@Override
    	public void showToast(String msg) {
        	Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show;
    	}
	}

#### [Check the full project on GitHub](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)
#### [源码](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)

### In the next article
### 下一篇文章

This post was a little too big, I know, sorry about that. But I really
hope that it helped somebody out there. In the next article of the
series, we’ll discuss how to use the [final
framework](https://github.com/tinmegali/Android-Model-View-Presenter-MVP),
that has some abstraction to facilitate the MVP implementation, and
we’ll also discuss some hiccups that could get on the way of the Model
View Presenter adoption in Android.  
我知道这篇文章有一点长了，很抱歉。但我真的希望可以帮到谁。下一遍文章，我们会讨论如何使用[最终的框架](https://github.com/tinmegali/Android-Model-View-Presenter-MVP)，它包含了一些可以加快MVP实现的抽象，我们也会谈论一些适配的小问题。

See you soon!