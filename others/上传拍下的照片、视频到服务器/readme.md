上传拍下的照片、视频到服务器
---

>
* 原文链接 : [Android Uploading Camera Image, Video to Server with Progress Bar](http://www.androidhive.info/2014/12/android-uploading-camera-image-video-to-server-with-progress-bar/)
* 作者 :  [Ravi Tamada](http://www.androidhive.info/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  校对完成


我在上一篇教程中给大家讲解了怎么通过进度条下载文件，今天，我将在这篇文章中给大家讲解如果在弹出进度条的同时上传一个文件到服务器。通过阅读这篇文章，并学习其中的知识，你能做出一个类似 Instagram 的App，在你做出的 App 里，你能够像在 Instagram 里那样用摄像头拍照/视频，然后把它们上传到服务器。在服务器端，我使用 PHP 读取上传的文件，并把文件移动到一个特殊的位置。

这篇文章最精华的部分在于：即使是上传大文件，它也能很好地运行，而不是产生许多内存不足的错误。我能有这样的自信，是因为我进行了许多的测试。在测试过程中，即便我上传了一个 50MB 的文件，这个功能仍然运行得很完美，不会出现错误。

[源码下载](http://download.androidhive.info/)

## 准备工作 ##

由于这篇文章需要上传摄像头拍下来的照片/视频，因此你需要先了解有关 Android 摄像头模块的知识。所以我建议你最好先去阅读我之前的一篇有关 Android 是如何操作摄像头的讲解文章，通过阅读这篇文章你能大概了解怎么在你的 Android App 中使用摄像头。

## 创建 Android 工程 ##

1、 在 Eclipse 中创建一个新的 Android 工程，具体流程如下：New ⇒ Android Application Project，然后在里面填好一些必要的信息。

2、 打开 res 文件夹中的 strings.xml,然后把下面的内容添加进去：

**strings.xml**

```xml
     <?xml version="1.0" encoding="utf-8"?>
     <resources>
      
    		 <string name="app_name">Camera File Upload</string>
     	 <string name="btnTakePicture">Capture Image</string>
     	 <string name="btnRecordVideo">Record Video</string>
     	 <string name="or">(or)</string>
     	 <string name="btnUploadToServer">Upload to Server</string>
      
     </resources>
```
 
3、 向 res 文件夹添加 colors.xml，并把下面的内容添加进去：

**colors.xml**

```xml
	<?xml version="1.0" encoding="utf-8"?>
	<resources>
	 
		<color name="view_background">#e8ecfa</color>
		<color name="btn_bg">#277bec</color>
		<color name="white">#ffffff</color>
		<color name="txt_font">#4e5572</color>
		<color name="action_bar">#1f2649</color>
	 
	</resources>
```

4、 在 src 目录下创建一个叫做 Config 的类。这个类用于保存文件上传所送到的 URL 地址，还有在移动设备中存储图片/视频的目录名称。你可能需要在测试 App 时使用你自己的 URL 地址进行上传操作。

5、 创建一个叫做 AndroidMultiPartEntity 的类，并把下面的代码复制进去。这个类是一个自定义的 MultipartEntity 类，主要用于提供这个工程中需要用到的关键功能，例如进度条的进度增量。

**AndroidMultiPartEntity.java**

```java
    package info.androidhive.camerafileupload;
     
    import java.io.FilterOutputStream;
    import java.io.IOException;
    import java.io.OutputStream;
    import java.nio.charset.Charset;
     
    import org.apache.http.entity.mime.HttpMultipartMode;
    import org.apache.http.entity.mime.MultipartEntity;
     
    @SuppressWarnings("deprecation")
    public class AndroidMultiPartEntity extends MultipartEntity
     
    {
     
    	private final ProgressListener listener;
     
    	public AndroidMultiPartEntity(final ProgressListener listener) {
    		super();
    		this.listener = listener;
    	}
     
    	public AndroidMultiPartEntity(final HttpMultipartMode mode,
    		final ProgressListener listener) {
    		super(mode);
    		this.listener = listener;
    	}
     
    	public AndroidMultiPartEntity(HttpMultipartMode mode, final String boundary,
    		final Charset charset, final ProgressListener listener) {
    		super(mode, boundary, charset);
    		this.listener = listener;
    	}
     
    	@Override
    	public void writeTo(final OutputStream outstream) throws IOException {
    		super.writeTo(new CountingOutputStream(outstream, this.listener));
    	}
     
    	public static interface ProgressListener {
    		void transferred(long num);
    	}
     
    	public static class CountingOutputStream extends FilterOutputStream {
     
    		private final ProgressListener listener;
    		private long transferred;
     
    		public CountingOutputStream(final OutputStream out,
    			final ProgressListener listener) {
    				super(out);
    				this.listener = listener;
    				this.transferred = 0;
    		}
     
	    public void write(byte[] b, int off, int len) throws IOException {
	    	out.write(b, off, len);
	    	this.transferred += len;
	    	this.listener.transferred(this.transferred);
	    }
     
	    public void write(int b) throws IOException {
	    	out.write(b);
	    	this.transferred++;
	    	this.listener.transferred(this.transferred);
	    }
   	  }
	}
```

现在我们需要通过在 App 中添加一个简单的页面来添加摄像头功能，在这里我们将使用两个 Button 来调用我们的摄像头为我们的 App 拍照/视频。

6、 在你的 AndroidManifest.xml 中添加相应的权限。你会注意到 UploadActivity 也需要被添加到 AndroidManifest.xml 文件中，我们会在后面提到这个。

**INTERNET** – 联网权限

**WRITE_EXTERNAL_STORAGE** – 存储照片/视频到本地的权限

**RECORD_AUDIO** – 拍摄权限

**AndroidManifest.xml**

```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
	    package="info.androidhive.camerafileupload"
	    android:versionCode="1"
	    android:versionName="1.0" >
	 
	    <uses-sdk
	        android:minSdkVersion="11"
	        android:targetSdkVersion="21" />
	 
	    <uses-permission android:name="android.permission.INTERNET" />
	    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
	    <uses-permission android:name="android.permission.RECORD_AUDIO" />
	 
	    <application
	        android:allowBackup="true"
	        android:icon="@drawable/ic_launcher"
	        android:label="@string/app_name"
	        android:theme="@style/AppTheme" >
	        <activity
	            android:name="info.androidhive.camerafileupload.MainActivity"
	            android:label="@string/app_name"
	            android:screenOrientation="portrait" >
	            <intent-filter>
	                <action android:name="android.intent.action.MAIN" />
	 
	                <category android:name="android.intent.category.LAUNCHER" />
	            </intent-filter>
	        </activity>
	        <activity
	            android:name="info.androidhive.camerafileupload.UploadActivity"
	            android:screenOrientation="portrait" >
	        </activity>
	    </application>

    </manifest>
```

7、打开你 MainActivity 的布局文件（activity_main.xml)，并添加下面的代码，这样做能让你的布局拥有两个 Button。

**activity_main.xml**

```xml
	<?xml version="1.0" encoding="utf-8"?>
		<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
	    xmlns:tools="http://schemas.android.com/tools"
	    android:layout_width="fill_parent"
	    android:layout_height="fill_parent"
	    android:background="@color/view_background"
	    android:baselineAligned="false"
	    android:orientation="vertical" >
	 
	    <LinearLayout
	        android:layout_width="fill_parent"
	        android:layout_height="wrap_content"
	        android:layout_centerInParent="true"
	        android:gravity="center"
	        android:orientation="vertical" >
	 
	        <!-- Capture picture button -->
	 
	        <Button
	            android:id="@+id/btnCapturePicture"
	            android:layout_width="wrap_content"
	            android:layout_height="wrap_content"
	            android:layout_marginBottom="20dp"
	            android:background="@color/btn_bg"
	            android:paddingLeft="20dp"
	            android:paddingRight="20dp"
	            android:text="@string/btnTakePicture"
	            android:textColor="@color/white" />
	 
	        <TextView
	            android:layout_width="wrap_content"
	            android:layout_height="wrap_content"
	            android:layout_marginBottom="20dp"
	            android:gravity="center_horizontal"
	            android:text="@string/or"
	            android:textColor="@color/txt_font" />
	 
	        <!-- Record video button -->
	 
	        <Button
	            android:id="@+id/btnRecordVideo"
	            android:layout_width="wrap_content"
	            android:layout_height="wrap_content"
	            android:background="@color/btn_bg"
	            android:paddingLeft="20dp"
	            android:paddingRight="20dp"
	            android:text="@string/btnRecordVideo"
	            android:textColor="@color/white" />
	    </LinearLayout>

	</RelativeLayout>
```

8、在你的 MainActivity 中添加使用摄像头的相关代码，这些代码和这个系列的教程中使用的代码是一样的。简单来说，这个 Activity 主要会完成下面的工作：

- 这个 App 在安装并打开后，能够通过点击 Button 拍照/视频。

- 只要照片/视频被拍下来，就会保存在移动设备的 SD 卡上

- 最后， 通过传递 SD 卡中储存媒体文件的对应路径，UploadActivity 会被打开，然后执行上传的流程。

**MainActivity.java**

```java
	package info.androidhive.camerafileupload;
	 
	import java.io.File;
	import java.text.SimpleDateFormat;
	import java.util.Date;
	import java.util.Locale;
	 
	import android.app.Activity;
	import android.content.Intent;
	import android.content.pm.PackageManager;
	import android.graphics.Color;
	import android.graphics.drawable.ColorDrawable;
	import android.net.Uri;
	import android.os.Bundle;
	import android.os.Environment;
	import android.provider.MediaStore;
	import android.util.Log;
	import android.view.View;
	import android.widget.Button;
	import android.widget.Toast;
	 
	public class MainActivity extends Activity {
	     
	    // LogCat tag
	    private static final String TAG = MainActivity.class.getSimpleName();
	     
	  
	    // Camera activity request codes
	    private static final int CAMERA_CAPTURE_IMAGE_REQUEST_CODE = 100;
	    private static final int CAMERA_CAPTURE_VIDEO_REQUEST_CODE = 200;
	     
	    public static final int MEDIA_TYPE_IMAGE = 1;
	    public static final int MEDIA_TYPE_VIDEO = 2;
	  
	    private Uri fileUri; // file url to store image/video
	     
	    private Button btnCapturePicture, btnRecordVideo;
	  
	    @Override
	    protected void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        setContentView(R.layout.activity_main);
	         
	        // Changing action bar background color
	        // These two lines are not needed
	        getActionBar().setBackgroundDrawable(new ColorDrawable(Color.parseColor(getResources().getString(R.color.action_bar))));
	  
	        btnCapturePicture = (Button) findViewById(R.id.btnCapturePicture);
	        btnRecordVideo = (Button) findViewById(R.id.btnRecordVideo);
	  
	        /**
	         * Capture image button click event
	         */
	        btnCapturePicture.setOnClickListener(new View.OnClickListener() {
	  
	            @Override
	            public void onClick(View v) {
	                // capture picture
	                captureImage();
	            }
	        });
	  
	        /**
	         * Record video button click event
	         */
	        btnRecordVideo.setOnClickListener(new View.OnClickListener() {
	  
	            @Override
	            public void onClick(View v) {
	                // record video
	                recordVideo();
	            }
	        });
	  
	        // Checking camera availability
	        if (!isDeviceSupportCamera()) {
	            Toast.makeText(getApplicationContext(),
	                    "Sorry! Your device doesn't support camera",
	                    Toast.LENGTH_LONG).show();
	            // will close the app if the device does't have camera
	            finish();
	        }
	    }
	  
	    /**
	     * Checking device has camera hardware or not
	     * */
	    private boolean isDeviceSupportCamera() {
	        if (getApplicationContext().getPackageManager().hasSystemFeature(
	                PackageManager.FEATURE_CAMERA)) {
	            // this device has a camera
	            return true;
	        } else {
	            // no camera on this device
	            return false;
	        }
	    }
	  
	    /**
	     * Launching camera app to capture image
	     */
	    private void captureImage() {
	        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
	  
	        fileUri = getOutputMediaFileUri(MEDIA_TYPE_IMAGE);
	  
	        intent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri);
	  
	        // start the image capture Intent
	        startActivityForResult(intent, CAMERA_CAPTURE_IMAGE_REQUEST_CODE);
	    }
	     
	    /**
	     * Launching camera app to record video
	     */
	    private void recordVideo() {
	        Intent intent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
	  
	        fileUri = getOutputMediaFileUri(MEDIA_TYPE_VIDEO);
	  
	        // set video quality
	        intent.putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1);
	  
	        intent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri); // set the image file
	                                                            // name
	  
	        // start the video capture Intent
	        startActivityForResult(intent, CAMERA_CAPTURE_VIDEO_REQUEST_CODE);
	    }
	  
	    /**
	     * Here we store the file url as it will be null after returning from camera
	     * app
	     */
	    @Override
	    protected void onSaveInstanceState(Bundle outState) {
	        super.onSaveInstanceState(outState);
	  
	        // save file url in bundle as it will be null on screen orientation
	        // changes
	        outState.putParcelable("file_uri", fileUri);
	    }
	  
	    @Override
	    protected void onRestoreInstanceState(Bundle savedInstanceState) {
	        super.onRestoreInstanceState(savedInstanceState);
	  
	        // get the file url
	        fileUri = savedInstanceState.getParcelable("file_uri");
	    }
	  
	     
	  
	    /**
	     * Receiving activity result method will be called after closing the camera
	     * */
	    @Override
	    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
	        // if the result is capturing Image
	        if (requestCode == CAMERA_CAPTURE_IMAGE_REQUEST_CODE) {
	            if (resultCode == RESULT_OK) {
	                 
	                // successfully captured the image
	                // launching upload activity
	                launchUploadActivity(true);
	                 
	                 
	            } else if (resultCode == RESULT_CANCELED) {
	                 
	                // user cancelled Image capture
	                Toast.makeText(getApplicationContext(),
	                        "User cancelled image capture", Toast.LENGTH_SHORT)
	                        .show();
	             
	            } else {
	                // failed to capture image
	                Toast.makeText(getApplicationContext(),
	                        "Sorry! Failed to capture image", Toast.LENGTH_SHORT)
	                        .show();
	            }
	         
	        } else if (requestCode == CAMERA_CAPTURE_VIDEO_REQUEST_CODE) {
	            if (resultCode == RESULT_OK) {
	                 
	                // video successfully recorded
	                // launching upload activity
	                launchUploadActivity(false);
	             
	            } else if (resultCode == RESULT_CANCELED) {
	                 
	                // user cancelled recording
	                Toast.makeText(getApplicationContext(),
	                        "User cancelled video recording", Toast.LENGTH_SHORT)
	                        .show();
	             
	            } else {
	                // failed to record video
	                Toast.makeText(getApplicationContext(),
	                        "Sorry! Failed to record video", Toast.LENGTH_SHORT)
	                        .show();
	            }
	        }
	    }
	     
	    private void launchUploadActivity(boolean isImage){
	        Intent i = new Intent(MainActivity.this, UploadActivity.class);
	        i.putExtra("filePath", fileUri.getPath());
	        i.putExtra("isImage", isImage);
	        startActivity(i);
	    }
	      
	    /**
	     * ------------ Helper Methods ---------------------- 
	     * */
	  
	    /**
	     * Creating file uri to store image/video
	     */
	    public Uri getOutputMediaFileUri(int type) {
	        return Uri.fromFile(getOutputMediaFile(type));
	    }
	  
	    /**
	     * returning image / video
	     */
	    private static File getOutputMediaFile(int type) {
	  
	        // External sdcard location
	        File mediaStorageDir = new File(
	                Environment
	                        .getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
	                Config.IMAGE_DIRECTORY_NAME);
	  
	        // Create the storage directory if it does not exist
	        if (!mediaStorageDir.exists()) {
	            if (!mediaStorageDir.mkdirs()) {
	                Log.d(TAG, "Oops! Failed create "
	                        + Config.IMAGE_DIRECTORY_NAME + " directory");
	                return null;
	            }
	        }
	  
	        // Create a media file name
	        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss",
	                Locale.getDefault()).format(new Date());
	        File mediaFile;
	        if (type == MEDIA_TYPE_IMAGE) {
	            mediaFile = new File(mediaStorageDir.getPath() + File.separator
	                    + "IMG_" + timeStamp + ".jpg");
	        } else if (type == MEDIA_TYPE_VIDEO) {
	            mediaFile = new File(mediaStorageDir.getPath() + File.separator
	                    + "VID_" + timeStamp + ".mp4");
	        } else {
	            return null;
	        }
	  
	        return mediaFile;
	    }
	}
```

如果你现在运行你的 App，你会看到类似下面这样的输出结果。

![](http://cdn4.androidhive.info/wp-content/uploads/2014/12/android-file-upload-camera-screen.jpg?6141f6)

![](http://cdn2.androidhive.info/wp-content/uploads/2014/12/android-file-upload-camera-taking-camera-picture.jpg?6141f6)

只要你能够打开摄像头并拍着照片/视频，我们就能继续今天的学习，也就是接下来要讲的——创建实现上传功能的 Activity。

9、在 res 文件夹中创建一个 activity_upload.xml 文件，这个布局提供了 ImageView、VideoView 用以预览拍下来的照片/视频，此外，还有一个 ProgressBar 被用于展现上传进度。

**activity_upload.xml**

```xml
	<?xml version="1.0" encoding="utf-8"?>
	<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
	    android:layout_width="fill_parent"
	    android:layout_height="fill_parent"
	    android:background="@color/view_background"
	    android:orientation="vertical"
	    android:padding="10dp" >
	 
	     
	 
	    <!-- To display picture taken -->
	 
	    <ImageView
	        android:id="@+id/imgPreview"
	        android:layout_width="fill_parent"
	        android:layout_height="200dp"
	        android:visibility="gone"
	        android:layout_marginTop="15dp"/>
	 
	    <!-- Videoview to preview recorded video -->
	 
	    <VideoView
	        android:id="@+id/videoPreview"
	        android:layout_width="fill_parent"
	        android:layout_height="400dp"
	        android:visibility="gone"
	        android:layout_marginTop="15dp"/>
	 
	    <TextView
	        android:id="@+id/txtPercentage"
	        android:layout_width="wrap_content"
	        android:layout_height="wrap_content"
	        android:layout_gravity="center_horizontal"
	        android:layout_marginBottom="15dp"
	        android:layout_marginTop="15dp"
	        android:textColor="@color/txt_font"
	        android:textSize="30dp" />
	 
	    <ProgressBar
	        android:id="@+id/progressBar"
	        style="?android:attr/progressBarStyleHorizontal"
	        android:layout_width="fill_parent"
	        android:layout_height="20dp"
	        android:layout_marginBottom="35dp"
	        android:visibility="gone"/>
	 
	    <Button
	        android:id="@+id/btnUpload"
	        android:layout_width="wrap_content"
	        android:layout_height="wrap_content"
	        android:layout_gravity="center_horizontal"
	        android:background="@color/btn_bg"
	        android:paddingLeft="20dp"
	        android:paddingRight="20dp"
	        android:text="@string/btnUploadToServer"
	        android:textColor="@color/white"
	        android:layout_marginBottom="20dp"/>
	 
	</LinearLayout>
```

10、创建一个叫做 UploadActivity 的类，并把下面的代码复制进去。在这个类里，我们主要完成下面两项工作：

- 接收 MainActivity 传过来的媒体文件路径，并把媒体文件显示在我们的视图中供以预览。

- 通过 UploadFileToServer()方法我们异步处理了上传文件到服务器和更新进度条进度两项工作。

**UploadActivity.java**

```java
	package info.androidhive.camerafileupload;
	 
	import info.androidhive.camerafileupload.AndroidMultiPartEntity.ProgressListener;
	 
	import java.io.File;
	import java.io.IOException;
	 
	import org.apache.http.HttpEntity;
	import org.apache.http.HttpResponse;
	import org.apache.http.client.ClientProtocolException;
	import org.apache.http.client.HttpClient;
	import org.apache.http.client.methods.HttpPost;
	import org.apache.http.entity.mime.content.FileBody;
	import org.apache.http.entity.mime.content.StringBody;
	import org.apache.http.impl.client.DefaultHttpClient;
	import org.apache.http.util.EntityUtils;
	 
	import android.app.Activity;
	import android.app.AlertDialog;
	import android.content.DialogInterface;
	import android.content.Intent;
	import android.graphics.Bitmap;
	import android.graphics.BitmapFactory;
	import android.graphics.Color;
	import android.graphics.drawable.ColorDrawable;
	import android.os.AsyncTask;
	import android.os.Bundle;
	import android.util.Log;
	import android.view.View;
	import android.widget.Button;
	import android.widget.ImageView;
	import android.widget.ProgressBar;
	import android.widget.TextView;
	import android.widget.Toast;
	import android.widget.VideoView;
	 
	public class UploadActivity extends Activity {
	    // LogCat tag
	    private static final String TAG = MainActivity.class.getSimpleName();
	 
	    private ProgressBar progressBar;
	    private String filePath = null;
	    private TextView txtPercentage;
	    private ImageView imgPreview;
	    private VideoView vidPreview;
	    private Button btnUpload;
	    long totalSize = 0;
	 
	    @Override
	    protected void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        setContentView(R.layout.activity_upload);
	        txtPercentage = (TextView) findViewById(R.id.txtPercentage);
	        btnUpload = (Button) findViewById(R.id.btnUpload);
	        progressBar = (ProgressBar) findViewById(R.id.progressBar);
	        imgPreview = (ImageView) findViewById(R.id.imgPreview);
	        vidPreview = (VideoView) findViewById(R.id.videoPreview);
	 
	        // Changing action bar background color
	        getActionBar().setBackgroundDrawable(
	                new ColorDrawable(Color.parseColor(getResources().getString(
	                        R.color.action_bar))));
	 
	        // Receiving the data from previous activity
	        Intent i = getIntent();
	 
	        // image or video path that is captured in previous activity
	        filePath = i.getStringExtra("filePath");
	 
	        // boolean flag to identify the media type, image or video
	        boolean isImage = i.getBooleanExtra("isImage", true);
	 
	        if (filePath != null) {
	            // Displaying the image or video on the screen
	            previewMedia(isImage);
	        } else {
	            Toast.makeText(getApplicationContext(),
	                    "Sorry, file path is missing!", Toast.LENGTH_LONG).show();
	        }
	 
	        btnUpload.setOnClickListener(new View.OnClickListener() {
	 
	            @Override
	            public void onClick(View v) {
	                // uploading the file to server
	                new UploadFileToServer().execute();
	            }
	        });
	 
	    }
	 
	    /**
	     * Displaying captured image/video on the screen
	     * */
	    private void previewMedia(boolean isImage) {
	        // Checking whether captured media is image or video
	        if (isImage) {
	            imgPreview.setVisibility(View.VISIBLE);
	            vidPreview.setVisibility(View.GONE);
	            // bimatp factory
	            BitmapFactory.Options options = new BitmapFactory.Options();
	 
	            // down sizing image as it throws OutOfMemory Exception for larger
	            // images
	            options.inSampleSize = 8;
	 
	            final Bitmap bitmap = BitmapFactory.decodeFile(filePath, options);
	 
	            imgPreview.setImageBitmap(bitmap);
	        } else {
	            imgPreview.setVisibility(View.GONE);
	            vidPreview.setVisibility(View.VISIBLE);
	            vidPreview.setVideoPath(filePath);
	            // start playing
	            vidPreview.start();
	        }
	    }
	 
	    /**
	     * Uploading the file to server
	     * */
	    private class UploadFileToServer extends AsyncTask<Void, Integer, String> {
	        @Override
	        protected void onPreExecute() {
	            // setting progress bar to zero
	            progressBar.setProgress(0);
	            super.onPreExecute();
	        }
	 
	        @Override
	        protected void onProgressUpdate(Integer... progress) {
	            // Making progress bar visible
	            progressBar.setVisibility(View.VISIBLE);
	 
	            // updating progress bar value
	            progressBar.setProgress(progress[0]);
	 
	            // updating percentage value
	            txtPercentage.setText(String.valueOf(progress[0]) + "%");
	        }
	 
	        @Override
	        protected String doInBackground(Void... params) {
	            return uploadFile();
	        }
	 
	        @SuppressWarnings("deprecation")
	        private String uploadFile() {
	            String responseString = null;
	 
	            HttpClient httpclient = new DefaultHttpClient();
	            HttpPost httppost = new HttpPost(Config.FILE_UPLOAD_URL);
	 
	            try {
	                AndroidMultiPartEntity entity = new AndroidMultiPartEntity(
	                        new ProgressListener() {
	 
	                            @Override
	                            public void transferred(long num) {
	                                publishProgress((int) ((num / (float) totalSize) * 100));
	                            }
	                        });
	 
	                File sourceFile = new File(filePath);
	 
	                // Adding file data to http body
	                entity.addPart("image", new FileBody(sourceFile));
	 
	                // Extra parameters if you want to pass to server
	                entity.addPart("website",
	                        new StringBody("www.androidhive.info"));
	                entity.addPart("email", new StringBody("abc@gmail.com"));
	 
	                totalSize = entity.getContentLength();
	                httppost.setEntity(entity);
	 
	                // Making server call
	                HttpResponse response = httpclient.execute(httppost);
	                HttpEntity r_entity = response.getEntity();
	 
	                int statusCode = response.getStatusLine().getStatusCode();
	                if (statusCode == 200) {
	                    // Server response
	                    responseString = EntityUtils.toString(r_entity);
	                } else {
	                    responseString = "Error occurred! Http Status Code: "
	                            + statusCode;
	                }
	 
	            } catch (ClientProtocolException e) {
	                responseString = e.toString();
	            } catch (IOException e) {
	                responseString = e.toString();
	            }
	 
	            return responseString;
	 
	        }
	 
	        @Override
	        protected void onPostExecute(String result) {
	            Log.e(TAG, "Response from server: " + result);
	 
	            // showing the server response in an alert dialog
	            showAlert(result);
	 
	            super.onPostExecute(result);
	        }
	 
	    }
	 
	    /**
	     * Method to show alert dialog
	     * */
	    private void showAlert(String message) {
	        AlertDialog.Builder builder = new AlertDialog.Builder(this);
	        builder.setMessage(message).setTitle("Response from Servers")
	                .setCancelable(false)
	                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
	                    public void onClick(DialogInterface dialog, int id) {
	                        // do nothing
	                    }
	                });
	        AlertDialog alert = builder.create();
	        alert.show();
	    }
	 
	} 
```

到这里，我们已经把 Android 项目构建好了，现在让我们来快速地创建一个 PHP工程以用于接收我们 App 发送过来的文件，就能看到这个项目的实际想过啦。但在那之前，我们可能需要为 WAMP Server做一点点简单的配置。

## 2.安装与配置 WAMP Server ##

1、下载并安装 WAMP，在 Windows 系统中，WAMP 将会被安装在 C:\wamp location。

2、打开 php,ini 文件，并修改下列值。在 WAMP Server 中，上传文件的最大值默认为 2MB，通过修改下列值，我们能够让上传文件的最大值达到 50MB。

![](http://cdn3.androidhive.info/wp-content/uploads/2014/12/wamp-server-editing-php.ini-file1.png?6141f6)

> upload_max_filesize = 50M
> post_max_size = 50M
> max_input_time = 300
> max_execution_time = 300

3、配置完成后重启 WAMP Server 即可。

## 3.创建一个 PHP 项目 ##
 
1、到 C:\wamp\www 目录中创建一个名为 AndroidFileUpload 的文件夹，这将会是我们 PHP 项目的根目录

2、进入这个文件夹中创建一个叫作 uploads 的文件夹，用以储存所有上传到服务器的文件

3、创建一个叫做 fileUpload.php 的文件，并把下面的内容复制进去。这些 PHP 代码的作用是：接收我们 Android App 上传的文件，并把它们储存在 uploads 文件夹中。一旦上传完成，服务器就会返回一个 JSON。

**fileUpload.php**

```php
	<?php
	 
	// Path to move uploaded files
	$target_path = "uploads/";
	 
	// array for final json respone
	$response = array();
	 
	// getting server ip address
	$server_ip = gethostbyname(gethostname());
	 
	// final file url that is being uploaded
	$file_upload_url = 'http://' . $server_ip . '/' . 'AndroidFileUpload' . '/' . $target_path;
	 
	 
	if (isset($_FILES['image']['name'])) {
	    $target_path = $target_path . basename($_FILES['image']['name']);
	 
	    // reading other post parameters
	    $email = isset($_POST['email']) ? $_POST['email'] : '';
	    $website = isset($_POST['website']) ? $_POST['website'] : '';
	 
	    $response['file_name'] = basename($_FILES['image']['name']);
	    $response['email'] = $email;
	    $response['website'] = $website;
	 
	    try {
	        // Throws exception incase file is not being moved
	        if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
	            // make error flag true
	            $response['error'] = true;
	            $response['message'] = 'Could not move the file!';
	        }
	 
	        // File successfully uploaded
	        $response['message'] = 'File uploaded successfully!';
	        $response['error'] = false;
	        $response['file_path'] = $file_upload_url . basename($_FILES['image']['name']);
	    } catch (Exception $e) {
	        // Exception occurred. Make error flag true
	        $response['error'] = true;
	        $response['message'] = $e->getMessage();
	    }
	} else {
	    // File parameter is missing
	    $response['error'] = true;
	    $response['message'] = 'Not received any file!F';
	}
	 
	// Echo final json response to client
	echo json_encode($response);
	?>
```

Below is the sample JSON response if the file is uploaded successfully. You can use error value to verify the upload on android side.

如果文件成功被上传，就会得到类似下面这个简单的 JSON 返回值范例。你可以使用错误代码来确认 Android 端的上传结果。

```php
	{
	    "file_name": "DSC_0021.JPG",
	    "email": "admin@androidhive.info",
	    "website": "www.androidhive.info",
	    "message": "File uploaded successfully!",
	    "error": false,
	    "file_path": "http://192.168.0.104/AndroidFileUpload/uploads/DSC_0021.JPG"
	}
```

## 4.测试上传文件功能（本地） ##

你可以通过完成下面的步骤在本地测试 App 的功能

1. 运行必要的设备（这里指的是运行 WAMP server 和 Android 手机），并将它们连在同一个 WIFI 网络中

2. 开启 WAMP server

3. 在电脑上运行 PHP 工程，并获取本机的 IP 地址。你可以通过在控制台中输入 ipconfig 命令获得你的 IP 地址。（在 Mac Os 系统中，你需要使用 ifconfig 获得 IP 地址）

4. 把 Config 类中的 IP 地址换成你的 IP 地址（创建 Android 项目的第四步）

5. 把我们的 Android App 安装到手机上，并运行它

![](http://cdn2.androidhive.info/wp-content/uploads/2014/12/android-uploading-camera-picture-to-server.jpg?6141f6)

![](http://cdn2.androidhive.info/wp-content/uploads/2014/12/android-uploading-camera-picture-to-server1.jpg?6141f6)

![](http://cdn2.androidhive.info/wp-content/uploads/2014/12/android-uploading-camera-picture-to-server2.jpg?6141f6)

## 引用 ##

1. [Stackoverflow](http://stackoverflow.com/questions/22874735/upload-large-file-with-progress-bar-and-without-outofmemory-error-in-android) 上有一个相关的使用进度条上传文件的问题

2. 我在 App 中使用的[图标](https://www.iconfinder.com/icons/66782/file_upload_icon#size=128)