Android 如何直播RTMP流
===
> * 原文链接 : [How To Stream RTMP live in Android](http://www.truiton.com/2015/03/stream-rtmp-live-android/)
* 原文作者 : [Mohit Gupt](google.com/+MohitGupt)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [ayyb1988](https://github.com/ayyb1988) 
* 校对者: [校对人]()  
* 状态 :  校对中

![rtmp](http://www.truiton.com/wp-content/uploads/2015/03/Android-RTMP-Player.png)

Streaming live video/audio in android is one of the very few interesting parts. Whenever we talk of streaming, the possibility of using RTMP[(Real Time Messaging Protocol)](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol) cannot be ruled out. As RTMP is one of the basic protocols available for streaming live video/audio feed. But unfortunately Android’s standard [VideoView](http://developer.android.com/reference/android/widget/VideoView.html) does not support the playback of RTMP. Therefore to natively play a live RTMP stream in Android, an external library is required which can provide us an Android RTMP player. In this tutorial we will discuss how this can be achieved by the usage of Android [Vitamio](https://www.vitamio.org/en/) library.

在android上，视频/音频流直播是极少有人关注的一部分。每当我们讨论流媒体，RTMP[(Real Time Messaging Protocol)](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol)是不可或缺的。RTMP是一个基本的视频/音频直播流协议，但是不幸的是Android标准的[VideoView](http://developer.android.com/reference/android/widget/VideoView.html)不支持RTMP的播放。因此，如果想在android上播放RTMP直播流，你必须使用支持RTMP协议的库。在本教程中，我们将讨论如何通过安卓[Vitamio]（https://www.vitamio.org/en/） 库的使用来实现。


##Android Vitamio Library

Vitamio is an open source project for Android and iOS built up on [FFmpeg](https://www.ffmpeg.org/) code. Vitamio provides us a clean and simple API with full and real hardware accelerated decoder and render-er. Vitamio is a very powerful library which supports a wide variety of video/audio formats like FLV, TS/TP, WMV, DivX, Xvid and many other standard formats. What makes it different is that it also supports the playback of embedded and external subtitles like .mkv and .srt. But Vitamio comes with a license, hence please go through this [license page]((https://www.vitamio.org/en/License/)) before using it in your project. In this Android RTMP example, we will not only discuss the live streaming of RTMP stream in Android, but will also discuss how we can stream m3u8 playlists(HLS), RTSP streams and MMS (Microsoft Media Stream). But first lets include the Android Vitamio library in out project.

##Android Vitamio 库
Vitamio是一个android和ios上基于[FFmpeg](https://www.ffmpeg.org/)的开源项目。Vitamio为我们提供了一个清洁、简单、全面、真实的硬件加速解码器和渲染器API，Vitamio是一个支持多种音视频格式 如 FLV, TS/TP, WMV, DivX, Xvid等多种标准格式的非常强大的库。所不同的是，它也支持类似.mkv和.srt嵌入和外挂字幕播放。但是它带有一个许可证，因此在使用它之前请先获得[认证](https://www.vitamio.org/en/License/)。在这个android RTMP例子中，我们不仅讨论RTMP直播流，而且也会讨论m3u8流（HLS），RTSP流和 MMS (Microsoft Media Stream)。首先让在我们的项目中引用Vitamio库。

####Steps to include Vitamio library in Android Studio:
1. Download the Vitamio bundle from here : https://github.com/yixia/VitamioBundle
2. Unzip it and go to File->Import Module in Android Studio.
3. Navigate to VitamioBundle-master, select vitamio folder and press finish.
4. Add compile project(‘:vitamio’) in build.gradle(Module: app) dependencies section.
5. Open build.gradle (Module: vitamio) – change the min sdk version to 7.
6. Also please don’t forget to add the internet permission in your manifest.
7. Done !

####在Android Studio中引用Vitamio库的步骤如下：
1. 下载Vitamio bundle [https://github.com/yixia/VitamioBundle](https://github.com/yixia/VitamioBundle)
2. 解压并且在Android Studio上File->Import Module
3. 指定到VitamioBundle路径，选择vitamio文件夹 点击完成
4. 在build.gradle(Module: app)依赖部分添加依赖项目(‘:vitamio’)
5. 打开build.gradle (Module: vitamio) - 改变最新sdk版本为7
6. 不要忘记在manifest.xml中添加internet权限
7. 完成！

####Streaming RTMP Stream Live in Android
Before heading directly to the implementation part, first lets understand RTMP a little. Real Time Messaging Protocol (RTMP) is a protocol owned by Adobe Systems. This protocol was developed to stream audio and video content to company’s proprietary flash player. But later on as it evolved, a part of it was released for public use. More of it can be read [here](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol). Mostly this type of protocol is used for IPTV and live VoD streaming, but it can be used in many areas as well.

####Android RTMP流
在讲述如何使用之前，让我们先了解下RTMP。Real Time Messaging Protocol (RTMP)是一个Adobe Systems所拥有的一个协议。该协议是Adobe公司独有的开发音视频流的flash player。后来该协议的部分被公开，供公众使用。更多请查看[这里](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol).这个协议大多用于IPTV和实时视频点播流，但它也用于其他领用。


To play an RTMP stream in Android, a normal VideoView cannot be used, as it does not support the RTMP playback. But a WebView can be used to play the RTMP stream without any external library. This solves the problem but in my personal opinion web apps don’t give a nice look and feel to an app. Hence in this Android RTMP example we will be using an external library – Vitamio for streaming a live RTMP stream. After including it in the project, please add Vitamio’s VideoView in your layout file:
activity_main.xmlXHTML
 ```
1. <?xml version="1.0" encoding="utf-8"?>
2. <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
3.        android:layout_width="match_parent"
4.        android:layout_height="match_parent"
5.        android:orientation="vertical" >
6.
7.    <io.vov.vitamio.widget.VideoView
8.        android:id="@+id/vitamio_videoView"
9.        android:layout_width="wrap_content"
10.       android:layout_height="wrap_content" />
11.
12.</LinearLayout>

```
Further to run this Android RTMP player, please code your activity something like this:

MainActivity.java
```
package com.truiton.rtmpplayer;
 
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
 
import java.util.HashMap;
 
import io.vov.vitamio.LibsChecker;
import io.vov.vitamio.MediaPlayer;
import io.vov.vitamio.widget.MediaController;
import io.vov.vitamio.widget.VideoView;
 
 
public class MainActivity extends ActionBarActivity {
    private static final String TAG = "MainActivity";
    private String path;
    //private HashMap<String, String> options;
    private VideoView mVideoView;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!LibsChecker.checkVitamioLibs(this))
            return;
        setContentView(R.layout.activity_main);
        mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
        path = "rtmp://rrbalancer.broadcast.tneg.de:1935/pw/ruk/ruk";
        /*options = new HashMap<>();
        options.put("rtmp_playpath", "");
        options.put("rtmp_swfurl", "");
        options.put("rtmp_live", "1");
        options.put("rtmp_pageurl", "");*/
        mVideoView.setVideoPath(path);
        //mVideoView.setVideoURI(Uri.parse(path), options);
        mVideoView.setMediaController(new MediaController(this));
        mVideoView.requestFocus();
 
        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mediaPlayer) {
                mediaPlayer.setPlaybackSpeed(1.0f);
            }
        });
    }
}
```
在android上，标准的VideoView不支持RTMP播放。但WebView可以播放RTMP流。这解决了播放RTMP流的问题，但是我个人认为web apps 不能提供一个界面和体验很好的应用。因此这这个android RTMP例子中我们将运用第三方库-Vitamio 直播RTMP流的流媒体。在工程中引用Vitamio之后，请在你的layout文件添加Vitamio的VideoView：
activity_main.xmlXHTML
 ```
1. <?xml version="1.0" encoding="utf-8"?>
2. <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
3.        android:layout_width="match_parent"
4.        android:layout_height="match_parent"
5.        android:orientation="vertical" >
6.
7.    <io.vov.vitamio.widget.VideoView
8.        android:id="@+id/vitamio_videoView"
9.        android:layout_width="wrap_content"
10.       android:layout_height="wrap_content" />
11.
12.</LinearLayout>

```
另外请编写你的activity如下：
MainActivity.java
```
package com.truiton.rtmpplayer;
 
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
 
import java.util.HashMap;
 
import io.vov.vitamio.LibsChecker;
import io.vov.vitamio.MediaPlayer;
import io.vov.vitamio.widget.MediaController;
import io.vov.vitamio.widget.VideoView;
 
 
public class MainActivity extends ActionBarActivity {
    private static final String TAG = "MainActivity";
    private String path;
    //private HashMap<String, String> options;
    private VideoView mVideoView;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!LibsChecker.checkVitamioLibs(this))
            return;
        setContentView(R.layout.activity_main);
        mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
        path = "rtmp://rrbalancer.broadcast.tneg.de:1935/pw/ruk/ruk";
        /*options = new HashMap<>();
        options.put("rtmp_playpath", "");
        options.put("rtmp_swfurl", "");
        options.put("rtmp_live", "1");
        options.put("rtmp_pageurl", "");*/
        mVideoView.setVideoPath(path);
        //mVideoView.setVideoURI(Uri.parse(path), options);
        mVideoView.setMediaController(new MediaController(this));
        mVideoView.requestFocus();
 
        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mediaPlayer) {
                mediaPlayer.setPlaybackSpeed(1.0f);
            }
        });
    }
}
```

Although the above code is self explanatory, please change the path to play your RTMP stream. At times to stream an RTMP stream in Android, you may have to pass the headers along with the path. Luckily you may see above that Vitamio RTMP player supports that too. Hence all types of RTMP streams can be used with Vitamio library. The above example would look something like this:
![Rtmpplayer](http://www.truiton.com/wp-content/uploads/2015/03/Android-RTMP-Stream-Live.png)

虽然上面代码是很不需要多做说明的，但需要指出的是 请修改你播放RTMP流的路径。在android上，有时播放RTMP流，你可能通过报头和路径。幸运的是，Vitamio RTMP播放器也支持这种方式。因此，所有类型的RTMP流可以使用Vitamio库。上面的例子会是这个样子：
![Rtmpplayer](http://www.truiton.com/wp-content/uploads/2015/03/Android-RTMP-Stream-Live.png)

####Android RTSP Streaming
Real Time Streaming Protocol (RTSP) is used for streaming content from media servers. Like YouTube uses RTSP streams to distribute content. The easy part about RTSP streaming is that, it can be done through the standard VideoView of Android. To read more about it please refer to my [VideoView Example](http://www.truiton.com/2013/08/android-videoview-example-with-youtube-playback/).

But if you are implementing a solution through the usage of Vitamio library, you might prefer using the same for RTSP streaming as well. As a matter of fact Vitamio also supports the playback of RTSP stream. To do so the process is same, include Vitamio’s VideoView in your layout file and use the path variable to specify the RTSP url.

```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```

####Android RTMP流媒体
实时流协议(RTSP)通过多媒体服务器传输内容。像YouTube使用RTSP流发布内容。关于RTSP流比较容易的部分是，它可以通过android标准的VideoView来完成，想了解更多，请参考我的[VideoView例子](http://www.truiton.com/2013/08/android-videoview-example-with-youtube-playback/)。

但是如果你使用Vitamio库，你可能更加喜欢使用相同的RTSP流。事实上Vitamio也支持RTSP流的播放。和上面过程是一样的，包括Vitamio的VideoView在布局文件，并使用路径变量指定的RTSP url

```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```


####Android m3u8 Streaming
How to play m3u8 video in Android? is one of the most common questions among the Android developers. The easiest way to do HTTP Live Streaming (HLS) in Android is through the usage of standard VideoView. But as you might have guessed, there are some limitations to it. Through standard Android VideoView you can stream m3u8 streams but only on the devices having Android 3.0 and above. This is because the HTTP/HTTPS live streaming and HTTP/HTTPS progressive streaming protocols were introduced in Android 3.0 and full support with HTTPS was given in 3.1.

If you wish to do HTTP Live Streaming (HLS) and support Android m3u8 streaming, for earlier versions of android. You should consider using the Vitamio library, this library adds the support for the playback of m3u8 lists on android API 7 and above. To do so the process is same- include Vitamio’s VideoView in your layout file and use the path variable to specify the HTTP Live Streaming URL.
```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "http://93.184.221.133/00573D/236/236-0.m3u8";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```

Playing m3u8 stream on Android with Vitamio would look something like this:
![m3u8](http://www.truiton.com/wp-content/uploads/2015/03/Android-m3u8-Streaming.png)

####Android m3u8 流媒体
如何在android上播放m3u8视频？是一个android开发者最常见的问题之一。最容易的方式是HTTP Live Streaming (HLS) 通过使用标准的VideoView。通过标准的 Android VideoView 你能播放m3u8流但是只有在android3.0以上设备可以使用。这是因为HTTP/ HTTPS直播和HTTP/ HTTPS渐进式流媒体协议在Android 3.0的引入，使用HTTPS完全支持在3.1引入。

如果你希望在早期的版本 做HTTP实时流媒体 (HLS)，并且支持android m3u8流。你应该考虑使用Vitamio库，这个库支持播放m3u8在android API7以上。使用方式，同样的在布局文件中使用Vitamio的VideoView，并指定的HTTP实时流媒体URL。

```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "http://93.184.221.133/00573D/236/236-0.m3u8";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```
Playing m3u8 stream on Android with Vitamio would look something like this:
在androi上使用Vitamio播放m3u8流效果如下：
![m3u8](http://www.truiton.com/wp-content/uploads/2015/03/Android-m3u8-Streaming.png)


####Android MMS Stream
Vitamio Library is a powerful library which also supports the playback of Microsoft Media Server (MMS) stream in Android. MMS is network streaming protocol, mostly used for webcasts and live radio. Using Vitamio for the playback of an MMS stream in Android is not that different from using other protocols. All you have to do just replace the path variable to point to an MMS url:

```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "mms://beotelmedia.beotel.net/studiob";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```
####Android MMS 流
Vitamio库是一个强大的库，还支持Microsoft媒体服务器（MMS）流中的播放。 MMS是网络流媒体协议，主要用于网络广播和电台直播。使用Vitamio用于在anroid的MMS流和其他协议没有什么不同。所有你需要做的只是更换路径变量指向一个MMS url：
```
mVideoView = (VideoView) findViewById(R.id.vitamio_videoView);
path = "mms://beotelmedia.beotel.net/studiob";
mVideoView.setVideoPath(path);
mVideoView.setMediaController(new MediaController(this));
mVideoView.requestFocus();

mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
    @Override
    public void onPrepared(MediaPlayer mediaPlayer) {
        mediaPlayer.setPlaybackSpeed(1.0f);
    }
});
```

##Conclusion
As we discussed above, I would like to conclude by saying that Vitamio is a very powerful multi-platform library, for iOS and Android both. By using Vitamio library one can stream many types of video formats and protocols like RTMP, RTSP, HTTP Live, and HTTP progressive streaming protocol. Another great playback feature that comes along with Vitamio is that it supports the playback of subtitles and multiple audio tracks. The only disadvantage with Vitamio is that, its not completely open-source. You might have to purchase a license to use it. Hope this helped. Connect with us through our Facebook, Google+ and Twitter profiles for more updates.

##结论
通过上面的讨论，可以确定地说，Vitamio是一个强大的多平台库（ios and android）。通过使用Vitamio库 能播放多种类型的视频格式和协议如RTMP, RTSP, HTTP Live, and HTTP渐进式流协议。另外一个很好的功能是，vitamio支持字幕和多音轨的播放。Vitamio的唯一的缺点是，它不是完全的开源。您可能需要购买许可证来使用它。希望这会有所帮助。获取更多的更新通过我们的Facebook, Google+ and Twitter来联系我们。

