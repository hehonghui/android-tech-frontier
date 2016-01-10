一种在android中实现MVP模式的新思路
---

>
* 原文链接 : [android-mvp-an-alternate-approach](http://blog.cainwong.com/android-mvp-an-alternate-approach/)
* 译者 : [FTExplore](https://github.com/FTExplore)
* 校对 : [sundroid](https://github.com/sundroid)

今天我想分享我自己在Android上实现MVP模式的方法。如果你对MVP模式还不熟悉或者你不清楚为什么要在Android应用中使用MVP模式，我建议你先阅读以下[这篇维基百科的文章](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)和[这篇博客](http://antonioleiva.com/mvp-android/)。

## 使用Activity和Fragment作为视图层(View)真的合适么?

目前很多使用了MVP模式的android 项目,基本上都是将activity和fragment作为视图层来进行处理的.而presenters通常是通过继承自被视图层实例化或者注入的对象来得到的. 诚然,我同意说,这种方式可以节省掉很多让人厌烦的"import android.*.*"语句, 并且将presenters从activity的生命周期中分割出来以后, 项目后续的维护会变得简便很多.这种思路是正确的， 但是,从另一个角度来说, activity 有一个很复杂的生命周期(fragment的生命周期可能会更复杂), 而这些生命周期很有可能对你项目的业务逻辑有非常重大的影响. Activity 可以获取上下文环境和多种android系统服务. Activity中发送Intent，启动Service和执行FragmentTransisitons等。而这些特性在我看来绝不应该是视图层应该涉及的领域(视图的功能就是现实数据和从用户那里获取输入数据，在理想的情况下，视图应该避免业务逻辑). 

基于上述的原因，我对目前的主流做法并不赞同，所以我在尝试使用Activity和Fragment作为Presenters。

## 使用Activity和Fragment作为presenters的步骤
### 1. 去除所有的view    

将Activity和Fragment作为presenter最大的困难就是如何将关于UI的逻辑抽取出来.我的解决方案是: 让需要作为presenter的activity 或者 fragment来继承一个抽象的类(或者叫"基类"), 这样关于View 各种组件的初始化以及逻辑,都可以在继承了抽象类的方法中进行操作，而当继承了该抽象类的class需要对某些组件进行操作的时候，只需要调用继承自抽象类的方法，就可以了。      

那么抽象类怎么获取到的view组件呢？在抽象类里面会有一个实例化的接口，这个接口里面的init()方法就会对view进行实例化，这个接口如下：

```java
public interface Vu {

	void init(LayoutInflater inflater, ViewGroup container);
	View getView();
}
```


正如你所见，Vu定义了一个通用的初始化例程，我可以通过它来实现一个容器视图，它也有一个方法来获得一个View的实例，每一个presenter将会和它自己的Vu关联，这个presenter将会继承这个接口（直接或者间接的去继承一个来自Vu的接口）

### 2. 创建一个presenter基类 (Activity)  

有了Vu接口，我们可以通过构建一系列的class来操纵很多不同的view组件，这些class 使用Vu接口来初始化View组件，并通过继承的方式给子类以操纵view组件的方法，以此来达到将ui 逻辑剥离出activity的目的。在下面的代码中，你可以看到，我覆写了activity的onCreate 、 onCreateView、onDestroy 、 onDestroyView，通过对这些方法的覆写，就可以对Vu的实例化和销毁进行精确的控制（vu.init()就是实例化一个view组件）。onBindVu() 和onDestoryVu()是控制view生命周期的两个方法。通过对actiivty中相关方法的覆写达到控制组件的生命周期的目的（具体看下面的代码，你就明白了）， 这样做的好处就是无论是activity 还是 fragment， 其用与控制view组件创建和销毁的语句是一样的（尽量避免定义多余的函数）。这样的话，二者之间的切换也会减少一定的阻力（也许你今天的需求是用fragment实现的，但是第二天发现使用fragment会有一个惊天bug，译者本人就遇到过）。     

```java
public abstract class BasePresenterActivity<V extends Vu> extends Activity {

    protected V vu;

    @Override
    protected final void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            vu = getVuClass().newInstance();
            vu.init(getLayoutInflater(), null);
            setContentView(vu.getView());
            onBindVu();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected final void onDestroy() {
        onDestroyVu();
        vu = null;
        super.onDestroy();
    }

    protected abstract Class<V> getVuClass();

    protected void onBindVu(){};

    protected void onDestroyVu() {};

}
```

### 3. 创建一个基本的presenter(Fragment)

```java
public abstract class BasePresenterFragment<V extends Vu> extends Fragment {

    protected V vu;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public final View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = null;
        try {
            vu = getVuClass().newInstance();
            vu.init(inflater, container);
            onBindVu();
            view = vu.getView();
        } catch (java.lang.InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return view;
    }

    @Override
    public final void onDestroyView() {
        onDestroyVu();
        vu = null;
        super.onDestroyView();
    }

    protected void onDestroyVu() {};

    protected void onBindVu(){};

    protected abstract Class<V> getVuClass();

}

```


### 4. 一个简单的例子
如前文所述，我们已经确定了一个框架，现在就来写一个简单的例子来进一步的说明. 为了避免篇幅过长，我就写一个“hello world”的例子。首先要有一个实现Vu接口的类：    

```java
public class HelloVu implements Vu {

View view;
TextView helloView;

@Override
public void init(LayoutInflater inflater, ViewGroup container) {
    view = inflater.inflate(R.layout.hello, container, false);
    helloView = (TextView) view.findViewById(R.id.hello);
}

@Override
public View getView() {
    return view;
}

public void setHelloMessage(String msg){
    helloView.setText(msg);
}

}
```
下一步，创建一个presenter来操作这个TextView
```
public class HelloActivity extends BasePresenterActivity {
@Override
protected void onBindVu() {
    vu.setHelloMessage("Hello World!");
}

@Override
protected Class<HelloVu> getVuClass() {
    return HelloVu.class;
}

}
```

OK,这样就大功告成了！！是不是很简便！

### 等等...耦合警告!

你可能注意到我的HelloVu类直接实现了Vu接口，我的Presenter的getVuClass方法直接引用了实现类。传统的MVP模式中，Presenter是要通过接口与他们的View解耦合的。因此，你也可以这么做。避免直接实现Vu接口，我们可以创建一个扩展了Vu的IHelloView接口，然后使用这个接口作为Presenter的泛型类型。这样Presenter看起来应该是如下这样的 : 

```java
public class HelloActivity extends BasePresenterActivity<IHelloVu> {

    @Override
    protected void onBindVu() {
        vu.setHelloMessage("Hello World!");
    }

    @Override
    protected Class<HelloVuImpl> getVuClass() {
        return HelloVuImpl.class;
    }
}
```

在我使用强大的模拟工具过程中，我个人并没有看到在一个接口下面实现Vu所带来的好处。但是对于我来说一个好的方面是，有没有Vu接口它都能够工作，唯一的需求就是最终你会实现Vu。

## 5. 如何进行测试
通过以上几步，我们可以发现，去除了UI逻辑之后，Activity变得非常简洁。并且，相关的测试
也变的非常异常的简单。请看如下的代码：

```java
public class HelloActivityTest {
    HelloActivity activity;
    HelloVu vu;

    @Before
    public void setup() throws Exception {
        activity = new HelloActivity();
        vu = Mockito.mock(HelloVu.class);
        activity.vu = vu;
    }

    @Test
    public void testOnBindVu(){
        activity.onBindVu();
        verify(vu).setHelloMessage("Hello World!");
    }
    }
```

以上代码是一段标准的jnuit单元测试的代码，不需要在android设备中部署运行，只需要在编译环境中即可测试。大幅度的提高了测试效率。但是，在测试某些方法的时候，你必须要使用android设备，例如当你想测试activity生命周期中的resume()方法。在缺乏设备环境的时候，super.resume()会报错。为了解决这个问题，可以借鉴一些工具，例如Robolectric、还有android gradle 1.1 插件中内置的testOptions { unitTests.returnDefaultValues = true }。此外，你仍然可以将这些生命周期也抽离出来。例如如下:

```java
@Override
protected final void onResume() {
    super.onResume();
    afterResume();
}

protected void afterResume(){}
```


现在，你可以在没有android设备的情况下，快速的测试了！   

## 意外收获：使用adapter作为presenter
将Activity作为presente已经足够狡猾了吧？使用adapter作为presenter，你想过没有？
好吧，请看如下的代码：

```java
public abstract class BasePresenterAdapter extends BaseAdapter {
protected V vu;

@Override
public final View getView(int position, View convertView, ViewGroup parent) {
    if(convertView == null) {
        LayoutInflater inflater = (LayoutInflater) parent.getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        try {
            vu = (V) getVuClass().newInstance();
            vu.init(inflater, parent);
            convertView = vu.getView();
            convertView.setTag(vu);
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    } else {
        vu = (V) convertView.getTag();
    }
    if(convertView!=null) {
        onBindListItemVu(position);
    }
    return convertView;
}

protected abstract void onBindListItemVu(int position);

protected abstract Class<V> getVuClass();
}
```

如上代码，使用adapter作为presenter其实和activity或者fragement几乎是一样的，只有一点明显的区别就是，我把onBingVu替换成了onBindListItemVu（接受int参数）,其实我是借鉴了[ViewHolder模式](http://developer.android.com/training/improving-layouts/smooth-scrolling.html)。

## 总结和一个demo
我在这篇文章里介绍了我自己的一个实现MVP的方法。我非常期待其他android开发者对我的这套方法的反馈。我切实的想知道我的方法是否可行？我已经把这套思路用在一个框架的开发上，并且即将公布，与此同时，我在github上面有一个demo项目，感兴趣的人可以去看一下https://github.com/wongcain/MVP-Simple-Demo

