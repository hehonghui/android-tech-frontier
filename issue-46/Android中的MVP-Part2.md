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
(MVP)](https://pt.wikipedia.org/wiki/Model-view-presenter)的概念和在Android开发中的优点。这是系列文章的第二篇，我们将使用[canonical form](https://en.wikipedia.org/wiki/Canonical_form)实现一个MVP结构，不使用任何的Android SDK或JAVA中的库。

We’ll develop a simple code, but it could look a little bit complex, due
to the amount of objects involved. Although, once you get the handle of
it, you’ll see how this kind of pattern could help you in your projects.
If you prefer to learn directly from code reading, you could check out
the [final
project](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp).  
我们会开发一个简单的工程，但是由于涉及对象的数量，可能看起来有些复杂。但是，一旦你掌握了，你就会看到这个模式如何帮助你。如果你想直接看代码，在这里[final project](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)。

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
> 用户的操作，调用Presenter层的操作。
>
> #### **Model**
>
> In an application with a good layered architecture, this model would
> only be the gateway to the domain layer or business logic. See it as
> the provider of the data we want to display in the view.
> 在有良好分层结构的应用中，Model层只是domain层或者业务逻辑的入口把它看做我们视图层
> 要显示的数据的提供者就好。
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
### Model View Presenter行动图

Let’s imagine an extremely simple application, that allows the user to
take note on a journal. Basically, the user inserts notes while the
system saves and exhibit the data. If we trace the **insert note
action**, considering that the app was developed using MVP pattern,
we’ll get the following diagram:  
让我们设想一个简单的应用，它允许用户在旅途中做笔记。基本的，用户记录笔记，系统保存和展示数据。如果我们跟随输入比较的行为，结合我们是使用MVP模式，我们会得到下图：

![Model View Presenter (MVP) action
diagram](http://i2.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_ActionDiagram-en-1.png?resize=720%2C547)
Model View Presenter (MVP) action diagram

1.  User clicks on “insert note”. **View** sends note to **Presenter** getPresenter newNote(textNote)
2.  **Presenter** creates a new Note, using the given String sent and
    invokes on **Model **the method responsible to insert the data on
    DB getModel.insertNote(note,this)
3.  **Model** inserts the Note on DB and informs **Presenter** about the
    success/error using the callback sent callback.onSuccess()
4.  **Presenter** processes the result and require **View** to exhibit a Toast success message getView.showToast()

This mapping gives us a better idea for our classes planning. The
communication process defined above could be different: with direct
object access, using interfaces or maybe with some kind of
EventBus. However, since our implementation respects the canonical form
and we aim to increase the isolation of concerns, we’ll use only plain
and simple interfaces.  


### Model View Presenter class diagram
### Model View Presenter类图

Let’s use our *action diagram* to construct a MVP [Class
Diagram](https://en.wikipedia.org/wiki/Class_diagram). We’ll change a
little bit our concept, switching from *callback* to *interface*, to
send results back to **Presenter** from **Model**. I believe this path
is more efficient, but some could argue that using *callbacks* the
isolation of concerns would increase.

![Model View Presenter Class
Diagram](http://i2.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_ClassDiagram-en-1.png?resize=720%2C547)
Model View Presenter Class Diagram

1.  **Presenter** implements** interface PresenterOps**
2.  **View** receives reference from **PresenterOps** to
    access **Presenter**
3.  **Model** implements **interface** **ModelOps**
4.  **Presenter** receives reference from **ModelOps** to
    access **Model**
5.  **Presenter **implements **RequiredPresenterOps**
6.  **Model** receives reference from **RequiredPresenterOps** to access
    **Presenter**
7.  **View **implements **RequiredViewOps**
8.  **Presenter** receives reference from **RequiredViewOps** to access
    **View**

Implementing Model View Presenter on Android
--------------------------------------------

Without further ado, let’s get to work! We’ll start defining the app
operations. In the name of a better organization, we’ll use an
“umbrella” class, containing all interfaces responsible to manage the
communication between the layers.

> **Note**: Since MVP implementation is complex enough, **no function
> outside the pattern scope will be developed.** I suppose that the
> readers have a more advanced understanding of the Android SDK,
> therefore such things shouldn’t be a concern.

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

That said, we’ll need to add a fourth
element**, **the **StateMaintainer**, responsible to maintain
the Presenter and Model state during lifecycle changes. A retained
fragment will be the base to the Object and a simplified version of MVP
on the Activity’s lifecycle would look like this:

![MVP Objects destruction and reconstruction during Activity lifecycle
changes](http://i1.wp.com/www.tinmegali.com/wp-content/uploads/2016/03/MVP_Activity_Lifecycle-en.png?resize=720%2C1253)
MVP Objects destruction and reconstruction during Activity lifecycle
changes

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

### StateMaintainer Class

This implementation of the **StateMaintainer** can be used to save any
object state.

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
这篇文章有一点长了，我知道，很抱歉。但我真的希望可以帮到谁。下一遍文章，我们会讨论如何使用[最终的框架](https://github.com/tinmegali/Android-Model-View-Presenter-MVP)，它包含了一些抽象可以加快MVP的实现，我们也会谈论一些小问题。

See you soon!