Android 如何直播RTMP流
===
> * 原文链接 : [How To Stream RTMP live in Android](http://www.truiton.com/2015/03/stream-rtmp-live-android/)
* 原文作者 : [Mohit Gupt](google.com/+MohitGupt)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [ayyb1988](https://github.com/ayyb1988) 
* 校对者: [chaossss](https://github.com/chaossss)  
* 状态 :  完成

![rtmp](http://www.truiton.com/wp-content/uploads/2015/03/Android-RTMP-Player.png)

在android上，视频/音频流直播是极少有人关注的一部分。每当我们讨论流媒体，RTMP[(Real Time Messaging Protocol)](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol)是不可或缺的。RTMP是一个基本的视频/音频直播流协议，但是不幸的是Android标准的[VideoView](http://developer.android.com/reference/android/widget/VideoView.html)不支持RTMP的播放。因此，如果想在android上播放RTMP直播流，你必须使用支持RTMP协议的库。在本教程中我们将讨论如何通过使用安卓的 [Vitamio]（https://www.vitamio.org/en/） 库播放由 RTMP 协议传输的流媒体。

##Android Vitamio 库
Vitamio是一个android和ios上基于[FFmpeg](https://www.ffmpeg.org/)的开源项目。Vitamio为我们提供了一个清洁、简单、全面、真实的硬件加速解码器和渲染器API，Vitamio是一个支持多种音视频格式 如 FLV, TS/TP, WMV, DivX, Xvid等多种标准格式的非常强大的库。所不同的是，它也支持类似.mkv和.srt嵌入和外挂字幕播放。但是它带有一个许可证，因此在使用它之前请先获得[认证](https://www.vitamio.org/en/License/)。在这个android RTMP例子中，我们不仅讨论RTMP直播流，而且也会讨论m3u8流（HLS），RTSP流和 MMS (Microsoft Media Stream)。首先让在我们的项目中引用Vitamio库。

####在Android Studio中引用Vitamio库的步骤如下：
1. 下载Vitamio bundle [https://github.com/yixia/VitamioBundle](https://github.com/yixia/VitamioBundle)
2. 解压并且在Android Studio上File->Import Module
3. 指定到VitamioBundle路径，选择vitamio文件夹 点击完成
4. 在build.gradle(Module: app)依赖部分添加依赖项目(‘:vitamio’)
5. 打开build.gradle (Module: vitamio) - 改变最小sdk版本为7
6. 不要忘记在manifest.xml中添加internet权限
7. 完成！

####Android RTMP流
在讲述如何使用之前，让我们先了解下RTMP。Real Time Messaging Protocol (RTMP)是一个Adobe Systems所拥有的一个协议。该协议是Adobe公司拥有的开发音视频流的flash player。后来该协议的部分被公开，供公众使用。更多请查看[这里](http://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol).这个协议大多用于IPTV和实时视频点播流，但它也用于其他领域。

在android上，标准的VideoView不支持RTMP播放。但WebView可以播放RTMP流。这解决了播放RTMP流的问题，但是我认为web apps 不能提供一个很好的界面和体验。因此这这个android RTMP例子中我们将运用第三方库-Vitamio 直播RTMP流的流媒体。在工程中引用Vitamio之后，请在你的layout文件添加Vitamio的VideoView：

activity_main.xml

```xml
	<?xml version="1.0" encoding="utf-8"?>
	<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
	        android:layout_width="match_parent"
	        android:layout_height="match_parent"
	        android:orientation="vertical" >
	
	    <io.vov.vitamio.widget.VideoView
	        android:id="@+id/vitamio_videoView"
	        android:layout_width="wrap_content"
	       android:layout_height="wrap_content" />
	
	</LinearLayout>
```

另外请编写你的activity如下：

MainActivity.java

```java
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

虽然上面代码很清晰明了，但需要指出的是请修改你播放RTMP流的路径。在android上，有时可能使用带报头路径来播放RTMP流。幸运的是，Vitamio RTMP播放器也支持这种方式。因此，所有类型的RTMP流可以使用Vitamio库。上面的例子会是这个样子：
![Rtmpplayer](http://www.truiton.com/wp-content/uploads/2015/03/Android-RTMP-Stream-Live.png)

####Android RTSP流媒体
实时流协议(RTSP)通过多媒体服务器传输内容，例如YouTube使用RTSP流发布内容。关于RTSP流比较容易的部分是，它可以通过android标准的VideoView来完成，想了解更多，请参考我的[VideoView例子](http://www.truiton.com/2013/08/android-videoview-example-with-youtube-playback/)。

但是如果你使用Vitamio库，可以更好的播放RTSP流。事实上Vitamio也支持RTSP流的回播。和上面过程是一样的，包括Vitamio的VideoView在布局文件，并使用路径变量指定的RTSP url

```java
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

####Android m3u8 流媒体
“如何在android上播放m3u8视频”是android开发者最常见的问题之一。通过Http 协议进行视频流直播最简单的办法就是使用标准的 VideoView. 但只能在android3.0以上的设备上播放m3u8流。因为在Android 3.0引入HTTP/ HTTPS直播和HTTP/ HTTPS渐进式流媒体协议，在android3.1完全支持HTTPS。

如果你希望在早期的版本上实现支持android m3u8流的HTTP实时流媒体 (HLS)。应该考虑使用Vitamio库，这个库支持在android API7以上播放m3u8。使用方式，同样的在布局文件中使用Vitamio的VideoView，并指定的HTTP实时流媒体URL。

```java
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

####Android MMS 流

Vitamio库是一个强大的库，还支持Microsoft媒体服务器（MMS）流中的播放。 MMS是网络流媒体协议，主要用于网络广播和电台直播。使用Vitamio用于在anroid的MMS流和其他协议没有什么不同。所有你需要做的只是更换路径变量指向一个MMS url：

```java
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

##结论
通过上面的讨论，可以确定地说，Vitamio是一个强大的多平台库（ios and android）。通过使用Vitamio库 能播放多种类型的视频格式和协议如RTMP, RTSP, HTTP Live, and HTTP渐进式流协议。另外一个很好的功能是，vitamio支持字幕和多音轨的播放。Vitamio的唯一的缺点是，它不是完全的开源。您可能需要购买许可证来使用它。希望这会有所帮助。通过Facebook, Google+ and Twitter来联系我们获取更多更新。

