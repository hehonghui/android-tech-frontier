Android中的人脸检测入门
---

> * 原文链接 : [An Introduction to Face Detection on Android](http://code.tutsplus.com/tutorials/an-introduction-to-face-detection-on-android--cms-25212?utm_source=Android+Weekly&utm_campaign=15ee59bb7a-Android_Weekly_181&utm_medium=email&utm_term=0_4eb677ad19-15ee59bb7a-337955857)
* 原文作者 : [Paul Trebilcox-Ruiz](http://tutsplus.com/authors/paul-trebilcox-ruiz)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [LangleyChang](https://github.com/LangleyChang) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  校对中




Introduced with the Vision libraries in Play Services 8.1, Face Detection makes it easy for you as a developer to analyze a video or image to locate human faces. Once you have a list of faces detected on an image, you can gather information about each face, such as orientation, likelihood of smiling, whether someone has their eyes open or closed, and specific landmarks on their face.
随着Play服务8.1中引入了视觉库，作为一个开发者，Face Detection让你可以更容易的通过分析视频或图像来定位人脸(face)。一旦有了一个图像中人脸的列表，你就能获取到每个人脸的相关信息，比如方向，笑脸的概率，某人是睁眼还是闭眼，还有他们脸上特定的关键点(landmark)。

This information can be useful for multiple applications, such as a camera app that automatically takes a picture when everyone in the frame is smiling with their eyes open, or for augmenting images with silly effects, such as unicorn horns. It is important to note that Face Detection is not facial recognition. While information can be gathered about a face, that information is not used by the Vision library to determine if two faces come from the same person.
这些信息在很多应用中都有用，比如一个相机应用，它可以在每个人都在睁着眼笑的时刻拍一张照片，或者给图片加一些搞笑的效果，比如牛角什么的。有一点很重要，注意人脸检测(Face Detection)并不是人脸识别(facial recognition)。尽管都是在获取一张脸的信息，(Play服务中的)视觉库并不会用这些信息来分辨两张脸是不是来自同一个人。

This tutorial will use a still image to run the Face Detection API and gather information about the people in the photo, while also illustrating that information with overlaid graphics. All code for this tutorial can be found on GitHub.
这个教程会使用一张静止的图片来跑Face Detection API，然后获取有关照片中人物的信息。同时，还会在其上覆盖图形来展示获取到的信息。这个教程的所有代码都可以在[GitHub](https://github.com/tutsplus/Android-PlayServices-FaceDetection)上找到。


![](https://cms-assets.tutsplus.com/uploads/users/798/posts/25212/image/unicorn.png)

Example of a silly effect adding a unicorn horn to a face
搞笑效果的例子，在人脸上添加牛角
1. Project Setup

## 1. 建立项目

To add the Vision library to your project, you need to import Play Services 8.1 or greater into your project. This tutorial imports only the Play Services Vision library. Open your project's build.gradle file and add the following compile line to the dependencies node.
为了把视觉库添加到你的项目中，你需要把Play服务8.1或更高版本导入到你的项目。这个教程仅仅导入了Play服务视觉库(Play Servcies Vision library)。打开你项目的**build.gradle**文件，把如下的编译行添加到`dependencies`结点中
```groovy
compile 'com.google.android.gms:play-services-vision:8.1.0'
```
Once you have included Play Services into your project, you can close your project's build.gradle file and open AndroidManifest.xml. You need to add a meta-data item defining the face dependency under the `application` node of your manifest. This lets the Vision library know that you plan to detect faces within your application.
一旦你在你的项目中包含了Play服务，你就可以关掉**build.gradle**文件，然后打开**AndroidManifest.xml**。你需要在`manifest`的`application`结点添加一个`meta-data`项来定义人脸检测的依赖。
```xml
<meta-data android:name="com.google.android.gms.vision.DEPENDENCIES" android:value="face"/>
```
Once you're finished setting up AndroidManifest.xml, you can go ahead and close it. Next, you need to create a new class named FaceOverlayView.java. This class extends View and contains the logic for detecting faces in the project, displaying the bitmap that was analyzed and drawing on top of the image in order to illustrate points.
完成了`AndroidManifest.xml`的建立，你就可以直接关掉它了。接着，你需要创建一个叫`FaceOverlayView.java`的新类。这个类继承了`View`，并且包含着项目中人脸检测的逻辑，其中包括显示分析的位图并且在图像上绘制用以示意的点。

For now, start by adding the member variables at the top of the class and defining the constructors. The Bitmap object will be used to store the bitmap that will be analyzed and the SparseArray of Face objects will store each face found in the bitmap.
现在，在类的开头添加一个成员变量并且定义构造函数。`Bitmap`对象用来存储被分析的位图，`Face`对象中的`SparseArray`用来存储位图中发现的每张人脸。

```Java
public class FaceOverlayView extends View {
 
    private Bitmap mBitmap;
    private SparseArray<Face> mFaces;
 
    public FaceOverlayView(Context context) {
        this(context, null);
    }
 
    public FaceOverlayView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }
 
    public FaceOverlayView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }
}
```
	

Next, add a new method inside of FaceOverlayView called setBitmap(Bitmap bitmap). For now this will simply save the bitmap passed to it, however later you will use this method for analyzing the image.
接着，在`FaceOverlayView`中添加一个新的方法叫`setBitmap(Bitmap bitmap)`。这个方法当前只是简单把传给他的位图存起来，一会儿你要用这个方法来分析图像。

```Java
public void setBitmap( Bitmap bitmap ) {
    mBitmap = bitmap;
}
```
Next, you need a bitmap. I have included one in the sample project on GitHub, but you can use any image that you would like in order to play with Face Detection and see what works and what doesn't. When you have selected an image, place it into the res/raw directory. This tutorial will assume that the image is called face.jpg.
下一步，你需要一个位图。我已经在[GitHub](https://github.com/tutsplus/Android-PlayServices-FaceDetection)上的示例项目中包含了一张，但是你也可以拿你喜欢任何图片和Face Detection玩玩，看看哪些好使，哪些不好使。

After you have placed your image into the res/raw directory, open res/layout/activity_main.xml. This layout contains a reference to FaceOverlayView so that it is displayed in MainActivity.
把你的图片放在`res/raw`目录下之后，打开`res/layout/activity_main.xml`。这个布局包含了一个`FaceOverlayView`引用，这样就可以把它显示在`MainActivity`中。

```xml
<?xml version="1.0" encoding="utf-8"?>
<com.tutsplus.facedetection.FaceOverlayView
	xmlns:android="http://schemas.android.com/apk/res/android"
	android:id="@+id/face_overlay"
	android:layout_width="match_parent"
	android:layout_height="match_parent" />
```
With the layout defined, open MainActivity and set up the FaceOverlayView from onCreate(). You do this by getting a reference to the view, reading the face.jpg image file from the raw directory as an input stream, and converting that into a bitmap. Once you have the bitmap, you can call setBitmap on the FaceOverlayView to pass the image to your custom view.
布局定义好了，现在打开`MainActivity`，在`onCreate()`中建立`FaceOverlayView`。怎么建立呢？你先获取一个这个view的引用，接着从raw目录的输入流中读取`face.jpg`文件，然后把它转换成一个位图。一旦你拿到了这个位图，你就可以调用`FaceOverlayView`的`setBitmap()`方法把这幅图像传给你自定义控件了。

```Java
public class MainActivity extends AppCompatActivity {
 
    private FaceOverlayView mFaceOverlayView;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mFaceOverlayView = (FaceOverlayView) findViewById( R.id.face_overlay );
 
        InputStream stream = getResources().openRawResource( R.raw.face );
        Bitmap bitmap = BitmapFactory.decodeStream(stream);
 
        mFaceOverlayView.setBitmap(bitmap);
 
    }
}
```
Detecting Faces

## 2.检测人脸
Now that your project is set up, it's time to start detecting faces. In setBitmap( Bitmap bitmap ) you need to create a FaceDetector. This can be done using a FaceDetector.Builder, allowing you to define multiple parameters that affect how fast faces will be detected and what other data the FaceDetector will generate.
既然你的项目已经建立完成了，现在就该开始检测人脸了。在`setBitmap(Bitmap bitmap)`中你需要创建一个`FaceDetector`。可以通过用一个`FaceDetector.Builder`来创建。它允许你定义多个参数，这些参数影响着你多快能检测出人脸和`FaceDetector`还能生成其他什么数据。

The settings that you pick depend on what you're attempting to do in your application. If you enable searching for landmarks, then faces will be detected more slowly. As with most things in programming, everything has its trade-offs. To learn more about the options available for FaceDetector.Builder, you can find the official documentation on Android's developer website.
你选择什么设置取决于你想在应用中做什么。如果你开启了关键点(landmark)搜索，那么检测人脸的速度就会慢一些。这和程序中大多数时候一样，鱼和熊掌不可兼得。想了解更多关于`FaceDetector.Builder`中的可用选项，你可以查看Android开发网站的官方文档。

```Java
FaceDetector detector = new FaceDetector.Builder( getContext() )
        .setTrackingEnabled(false)
        .setLandmarkType(FaceDetector.ALL_LANDMARKS)
        .setMode(FaceDetector.FAST_MODE)
        .build();
```
You also need to have a check to see if the FaceDetector is operational. When a user uses face detection for the first time on their device, Play Services needs to go out and get a set of small native libraries to process your application's request. While this will almost always be done before your app has finished launching, it is important to handle the contingency that this has failed.
同时，你也需要看看`FaceDetector`是否可用。当一个用户第一次在他的设备上使用人脸检测的时候，Play服务需要跳出来加载一系列小的原生库来处理你的请求。虽然大多数情况下这都能在你的应用结束前完成，你还是需要处理加载失败的意外情况。
If the FaceDetector is operational, then you can convert your bitmap into a Frame object and pass it to the detector to gather data about faces in the image. When you are done, you will need to release the detector to prevent a memory leak. When you are finished detecting faces, call invalidate() to trigger redrawing the view.
如果`FaceDetector`是可用的，那你就可以把你的位图转成一个`Frame`对象，然后把它传给检测器来获取图像中关于人脸的数据。完成了以后，你需要释放检测器，防止内存泄漏。当人脸检测完成了以后，你就可以调用`invalidate()`来触发这个控件的重绘了。

```Java
if (!detector.isOperational()) {
    //Handle contingency
} else {
    Frame frame = new Frame.Builder().setBitmap(bitmap).build();
    mFaces = detector.detect(frame);
    detector.release();
}
invalidate();
```
Now that you have detected the faces in your image, it's time to use them. For this example, you will simply draw a green box around each face. Since invalidate() was called after the faces were detected, you can add all of the necessary logic into onDraw(Canvas canvas). This method ensures that the bitmap and faces are set, then draw the bitmap onto the canvas, and then draw a box around each face.
既然你已经从图像中检测到了人脸，现在就该用它们了。在这个例子中，你简单的在每个脸周围画一个绿框。因为`invalidate`已经在检测完人脸后调用了，所以你可以在`onDraw(Canvas canvas)`中添加必要的逻辑。这个方法得确保位图和人脸都已经设置好了，然后就开始在画布上绘制位图，再在每个脸的周围绘制一个框。

Since different devices have different display sizes, you will also keep track of the bitmap's scaled size so that the entire image is always visible on the device and all overlays are drawn appropriately.
因为不同的设备有不同的显示尺寸，你需要跟踪位图的缩放大小，让整个图片在不同的设备上都时刻可见，上面的覆盖物也要合适的绘制。

```Java
@Override
protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
 
    if ((mBitmap != null) && (mFaces != null)) {
        double scale = drawBitmap(canvas);
        drawFaceBox(canvas, scale);
    }
}
```
The drawBitmap(Canvas canvas) method draws your bitmap onto the canvas and sizes it appropriately while also returning a multiplier for scaling your other dimensions correctly.
`drawBitmap(Canvas canvas)`将你的位图绘制在画布上，并且把它的大小调整合适。同时，它还会返回一个系数以正确调整其他尺寸的比例。
	
```Java
private double drawBitmap( Canvas canvas ) {
    double viewWidth = canvas.getWidth();
    double viewHeight = canvas.getHeight();
    double imageWidth = mBitmap.getWidth();
    double imageHeight = mBitmap.getHeight();
    double scale = Math.min( viewWidth / imageWidth, viewHeight / imageHeight );
 
    Rect destBounds = new Rect( 0, 0, (int) ( imageWidth * scale ), (int) ( imageHeight * scale ) );
    canvas.drawBitmap( mBitmap, null, destBounds, null );
    return scale;
}

```
The drawFaceBox(Canvas canvas, double scale) method gets a little more interesting. Each face that was detected and saved has a position value above and to the left of each face. This method will take that position and draw a green rectangle from it to encompass each face based on its width and height.
每一个检测出的人脸都有一个其左上角的位置信息。`drawFaceBox(Canvas canvas, double scale)`这个方法比较有趣，它会用利用这个位置按照每张脸的宽度和高度画一个绿色的矩形把它们都圈出来。

You need to define your Paint object and then loop through each Face in your SparseArray to find its position, width, and height, and draw the rectangle on the canvas using that information.
你需要定义你的`Paint`对象，然后循环遍历`SparseArray`的每一个`Face`找到它的位置，宽度和高度，然后用这些信息在画布上画出矩形。


```Java
private void drawFaceBox(Canvas canvas, double scale) {
    //paint should be defined as a member variable rather than 
    //being created on each onDraw request, but left here for 
    //emphasis.
    Paint paint = new Paint();
    paint.setColor(Color.GREEN);
    paint.setStyle(Paint.Style.STROKE);
    paint.setStrokeWidth(5);
 
    float left = 0;
    float top = 0;
    float right = 0;
    float bottom = 0;
 
    for( int i = 0; i < mFaces.size(); i++ ) {
        Face face = mFaces.valueAt(i);
 
        left = (float) ( face.getPosition().x * scale );
        top = (float) ( face.getPosition().y * scale );
        right = (float) scale * ( face.getPosition().x + face.getWidth() );
        bottom = (float) scale * ( face.getPosition().y + face.getHeight() );
 
        canvas.drawRect( left, top, right, bottom, paint );
    }
}
```
At this point, you should be able to run your application and see your image with rectangles around each face that has been detected. It is important to note that the Face Detection API is still fairly new at the time of this writing and it may not detect every face. You can play with some of the settings in the FaceDetector.Builder object in order to hopefully gather more data, though it's not guaranteed.
现在，你的应用应该能跑了，并且你能看到图像中每一个检测出来的脸上都用矩形框了起来。注意，现在Face Detection API仍然相当稚嫩，所以它可能不会检测出每一张脸。你可以折腾折腾`FaceDetector`中的其他设置，看看能不能获得一些数据，尽管我也不能保证。

![](https://cms-assets.tutsplus.com/uploads/users/798/posts/25212/image/facebox.png)
Faces detected and bound by a drawn rectangle
人脸被检测了出来并用矩形框出
3. Understanding Landmarks
## 3.理解关键点
Landmarks are points of interest on a face. The Face Detection API does not use landmarks for detecting a face, but rather detects a face in its entirety before looking for landmarks. That is why discovering landmarks is an optional setting that can be enabled through the FaceDetector.Builder.
关键点是一个人脸中一些感兴趣的点。Face Detection API不用关键点来检测人脸，但是可以检测到脸的整体轮廓之后再寻找关键点。这就是为什么发现关键点在是一个可以用`FaceDetector.Builder`开启的可选选项。
You can use these landmarks as an additional source of information, such as where the subject's eyes are, so that you can react appropriately within your app. There are twelve landmarks that are possible to find:
你可以把这些关键点作为一个额外的信息源，比如对象的眼睛在哪里，这样你就可以在你的应用中恰当的交互。可被找到的关键点共有十二个：

* left and right eye
* 左右眼
* 
left and right ear
* 左右耳
* 
left and right ear tip
* 左右耳廓尖
* 
base of the nose
* 鼻子基部
* 
left and right cheek
* 左右脸颊
* 
left and right corner of the mouth
* 嘴的左右角
* 
base of the mouth
* 嘴基部

The landmarks that are available depend on the angle of the face detected. For example, someone facing off to the side will only have one eye visible, which means that the other eye will not be detectable. The following table outlines which landmarks should be detectable based on the Euler Y angle (direction left or right) of the face.

哪些关键点是可用的取决于检测到的脸的角度。举个例子，某人的侧脸中只能检测到一个可见的眼睛，这意味着另一个眼睛是检测不到的。下面的表格概括了基于人脸的欧拉Y角度(左右方向)哪些关键点是可以被检测到的


| Euler Y        | Visible Landmarks          | 
| ------------- |:-------------:| 
| < -36°      | left eye, left mouth, left ear, nose base, left cheek | 
| -36° to -12°      | left mouth, nose base, bottom mouth, right eye, left eye, left cheek, left ear tip     |  
| -12° to 12° | right eye, left eye, nose base, left cheek, right cheek, left mouth, right mouth, bottom mouth |  
| 12° to 36° | right mouth, nose base, bottom mouth, left eye, right eye, right cheek, right ear tip |
| > 36° | right eye, right mouth, right ear, nose base, right cheek |
 
Landmarks are also incredibly easy to use in your application as you've already included them during face detection. You simply need to call getLandmarks() on a Face object to get a List of Landmark objects that you can work with.
不管你信不信，在你的应用中使用关键点也是非常的容易，因为你已经在人脸检测的时候把它们包含到了你的项目中了。你只需要调用一个`Face`对象的`getLandMarks()`就能获取到一个`LandMark`对象的`List`，这样你就能使用它了。

In this tutorial, you will paint a small circle on each detected landmark by calling a new method, drawFaceLandmarks(Canvas canvas, double scale), from onDraw(canvas canvas) instead of drawFaceBox(Canvas canvas, double scale). This method takes the position of each landmark, adjusts it for the scale of the bitmap, and then displays the landmark indicator circle.
你这个教程中，你将会在每个检测出的关键点上绘制一个小圆圈，只需调用一个新的方法`drawFaceLandmarks(Canvas canvas, double scale)`。这个方法是在`onDraw(Canvas canvas)`调用，而不是`drawFaceBox(Canvas canvas)`。它会获取每个关键点的位置，根据位图的比例调整它的大小，然后绘制出示意关键点的圆圈。

```Java
private void drawFaceLandmarks( Canvas canvas, double scale ) {
    Paint paint = new Paint();
    paint.setColor( Color.GREEN );
    paint.setStyle( Paint.Style.STROKE );
    paint.setStrokeWidth( 5 );
 
    for( int i = 0; i < mFaces.size(); i++ ) {
        Face face = mFaces.valueAt(i);
 
        for ( Landmark landmark : face.getLandmarks() ) {
            int cx = (int) ( landmark.getPosition().x * scale );
            int cy = (int) ( landmark.getPosition().y * scale );
            canvas.drawCircle( cx, cy, 10, paint );
        }
 
    }
}
```
After calling this method, you should see small green circles covering the detected faces as shown in the example below.
在调用了这个方法之后，你应该能看到许多绿色的小圆圈覆盖在检测到的人脸上，如下面的例子所示。
![](https://cms-assets.tutsplus.com/uploads/users/798/posts/25212/image/landmarks.png)

Circles placed over detected facial landmarks
在检测到的关键点之后放置圆圈

Additional Face Data

## 4.额外的人脸数据

While the position of a face and its landmarks are useful, you can also find out more information about each face detected in your app through some built-in methods from the Face object. The getIsSmilingProbability(), getIsLeftEyeOpenProbability() and getIsRightEyeOpenProbability() methods attempt to determine if eyes are open or if the person detected is smiling by returning a float ranging from 0.0 to 1.0. The closer to 1.0, the more likely that person is smiling or has their left or right eye open.
人脸的位置和关键点是很有用，但是你还可以通过一些`Face`对象的内置方法在检测到的人脸中发现更多的信息。`getIsSmilingProbability()`,`getIsLeftEyeOpenProbability()`和`getIsRightEyeOpenProbability()`方法会返回一个0.0到1.0的浮点数，你可以用其确定眼睛是否睁开或者检测到的这个人是否在笑。返回值越接近1.0，这个人就越有可能在小或者他的左右眼越有可能是睁开的。


You can also find the angle of the face on the Y and Z axes of an image by checking its Euler values. The Z Euler value will always be reported, however, you must use accurate mode when detecting faces in order to receive the X value. You can see an example of how to get these values in the following code snippet.
你也可以通过检查图像的欧拉值找出一张图像中人脸在Y轴和Z轴上的角度。Z欧拉值的一直都能收到。但是，要想接受到X值你必须使用精确模式。在下面的代码片段中你会看到如何获取这些值。

```Java
private void logFaceData() {
    float smilingProbability;
    float leftEyeOpenProbability;
    float rightEyeOpenProbability;
    float eulerY;
    float eulerZ;
    for( int i = 0; i < mFaces.size(); i++ ) {
        Face face = mFaces.valueAt(i);
 
        smilingProbability = face.getIsSmilingProbability();
        leftEyeOpenProbability = face.getIsLeftEyeOpenProbability();
        rightEyeOpenProbability = face.getIsRightEyeOpenProbability();
        eulerY = face.getEulerY();
        eulerZ = face.getEulerZ();
 
        Log.e( "Tuts+ Face Detection", "Smiling: " + smilingProbability );
        Log.e( "Tuts+ Face Detection", "Left eye open: " + leftEyeOpenProbability );
        Log.e( "Tuts+ Face Detection", "Right eye open: " + rightEyeOpenProbability );
        Log.e( "Tuts+ Face Detection", "Euler Y: " + eulerY );
        Log.e( "Tuts+ Face Detection", "Euler Z: " + eulerZ );
    }
}
```
Conclusion
## 结论
In this tutorial, you have learned about one of the main components of the Play Services Vision library, Face Detection. You now know how to detect faces in a still image, how to gather information, and find important landmarks for each face.
在这个教程中，你已经学到了Play服务视觉库的一个主要组件，**Face Detection**。你现在知道如何在一张静止的图像中检测人脸，如何获取其中的信息，然后从每张人脸中找到重要的关键点。

Using what you have learned, you should be able to add some great features to your own apps for augmenting still images, tracking faces in a video feed, or anything else you can imagine.
用你学到的东西，你应该可以在你自己的应用中添加一些很棒的特性，比如添加静态图像、在视频中跟踪人脸或者你能想到的任何创意。
