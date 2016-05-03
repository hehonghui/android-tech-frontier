Android中的MVP-Part2
-------------------

> * 原文链接 : [Model View Presenter (MVP) in Android, Part 2](http://www.tinmegali.com/en/model-view-presenter-mvp-in-android-part-2/)
* 原文作者 : [TinMegali](https://medium.com/@tinmegali)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成

![Model View Presenter Class
Diagram](https://github.com/DroidWorkerLYF/Translate/blob/master/Model-View-Presenter%20(MVP)/1.png?raw=true)
  
在上一篇[文章](http://www.tinmegali.com/model-view-presenter-mvp-no-android-introducao/)中我们谈论了[Model View Presenter
(MVP)](https://pt.wikipedia.org/wiki/Model-view-presenter)的概念和在Android开发中的优点。这是系列文章的第二篇，我们来动手实践一下，将使用[典型的形式](https://en.wikipedia.org/wiki/Canonical_form)实现一个MVP结构，不使用任何Android SDK或JAVA以外的库。
  
我们会开发一个简单的工程，但是由于涉及大量的对象，可能使项目看起来有些复杂。但是，一旦你掌握了，你就会明白MVP模式如何能帮助你。如果你想直接看代码，[在这里](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)。

-   [Model View Presenter (MVP) in Android, part
    1](http://wp.me/p7gH7l-2x)
-   [Model View Presenter (MVP) in Android,
    part 3](http://wp.me/p7gH7l-34)

设计MVP
------

##### MVP在Android中的主要概念

> #### **Presenter**
>
> Presenter是View和Model的中间人。它从Model层获取数据，格式化后返回给View层。
> 但是和典型的MVC模式不同的是，它还决定如何处理你和视图的交互。
>
> #### **View**
>
> 视图层，通常是由Activity实现，其中包含有presenter的引用。视图层唯一要做的事就是响应
> 用户的操作，调用Presenter层的方法。
>
> #### **Model**
>
> 在有良好分层结构的应用中，Model层只是domain层或者业务逻辑的入口。把它看做视图层
> 数据的提供者就好。
>
> *以上优秀的定义提取自[Antonio Leiva’s article](http://antonioleiva.com/mvp-android/)*
 
使用MVP模式的最大任务是增加我们项目的[关注分离](https://en.wikipedia.org/wiki/Separation_of_concerns).因此我们需要确保Model层，View层和Presenter层的隔离。这种情况下，**View层和Model层无法直接通信**，因此**Presenter负责各层的通讯**

### Model View Presenter行为图
 
让我们设想一个简单的应用，它允许用户在旅途中做笔记。主要就是用户记录笔记，系统保存和展示数据。如果我们沿着输入笔记的行为，结合MVP模式，我们会得到下图：

![Model View Presenter (MVP) action
diagram](https://github.com/DroidWorkerLYF/Translate/blob/master/Model-View-Presenter%20(MVP)/2.png?raw=true)
Model View Presenter (MVP) 行为图

1. 用户点击输入笔记。**视图层**将笔记内容传入**Presenter层**的newNote(textNote)方法。
2. **Presenter层**调用**Model层**的insertNote(note, this)方法，将传入的string创建为一个新的笔记。
3. **Model层**在数据库中插入笔记并且使用onSuccess()方法通知**Presenter层**成功/失败的结果
4. **Presenter层**处理结果后调用showToast()方法让**View层**展示一个toast 

这个映射给了我们对类设计的灵感。上述不同层之间的通信过程实现可能会不一样：直接调用对象的方法，使用接口或者使用EventBus。然而，既然我们的实现方式遵循典型方式，并且意在增加关注分离，所以我们只用原始简单的接口。

### Model View Presenter类图
 
让我们根据上面的*行为图*来构造我们的MVP模式[类图](https://en.wikipedia.org/wiki/Class_diagram)。我们会对概念做一点改动，把*callback*换成*interface*，来将结果从**Model层**传回**Presenter层**。我相信这种方式更高效，但是有人会对此有争议，认为*callback*会增加关注分离。

![Model View Presenter Class
Diagram](https://github.com/DroidWorkerLYF/Translate/blob/master/Model-View-Presenter%20(MVP)/1.png?raw=true)
Model View Presenter 类图

1. **Presenter层**实现**PresenterOps接口**
2. **View层**接受**PresenterOps**的引用来访问**Presenter**
3. **Model层**实现**ModelOps接口**
4. **Presenter层**接受**ModelOps**的引用来访问**Model**
5. **Presenter层**实现**RequiredPresenterOps接口**
6. **Model层**接受**RequiredPresenterOps**的引用来访问**Presenter**
7. **View层**实现**RequiredViewOps接口**
8. **Presenter层**接受**RequiredViewOps**的引用来访问**View**

在Android中实现MVP
----------------
  
事不宜迟，让我们动起来！先定义操作。为了更好的结构组织，我们使用一个“umbrella”类，包含所有层次间通讯的接口。

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

### 处理Android相关的特性
  
在我们的MVP模式中，**视图层**负责创建**Presenter层**，**Presenter层**负责实例化**Model层**对象。考虑到使用**Activity**来实现**View层**，我们需要考虑一些Android的细节，尤其是销毁和创建activities及其对象的[生命周期](http://developer.android.com/training/basics/activity-lifecycle/index.html)。
 
这就是说，我们需要增加第四个元素**StateMaintainer**，负责在生命周期的变化中维护Presenter和Model的状态。使用retained fragment来实现这个对象，如下是一个简化的MVP模式Activity生命周期：

![MVP Objects destruction and reconstruction during Activity lifecycle
changes](https://github.com/DroidWorkerLYF/Translate/blob/master/Model-View-Presenter%20(MVP)/3.png?raw=true) 
Activity生命周期变化时MVP模式中对象的销毁和创建

1. **Activity**创建一个**Presenter**的实例并持有**PresenterOps**的引用。**Presenter**存储在**StateMaintainer**中
2. **Presenter**在创建时接受**RequiredViewOps**类型参数并且创建一个**Model**对象
3. **Model**接受**RequiredPresenterOps**类型参数
4. 当Activity被销毁时，会通知**Presenter**
5. **Presenter**处理信息，作必要的处理后传递给**Model**
6. **Activity**从**StateMaintainer**中恢复**Presenter**，并且传递**RequiredViewOps**，通知他的激活状态。

### StateMaintainer Class
  
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

#### [源码](https://github.com/tinmegali/simple-mvp/tree/master/AndroidMVP/mvp/src/main/java/com/tinmegali/mvp/mvp)

### 下一篇文章
 
我知道这篇文章有一点长了，很抱歉。但我真的希望可以帮到谁。下一遍文章，我们会讨论如何使用[最终的框架](https://github.com/tinmegali/Android-Model-View-Presenter-MVP)，它包含了一些可以加快MVP实现的抽象，我们也会谈论一些适配的小问题。
 
回头见！