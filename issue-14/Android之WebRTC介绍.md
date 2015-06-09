#Android之WebRTC介绍
---

> * 原文链接 : [Introduction to WebRTC on Android](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/)
* 原文作者 : [Dag-Inge Aas](https://disqus.com/home/forums/appearin/)
* 译文出自 : [appear.in](https://tech.appear.in/)
* 译者 : [DorisMinmin](https://github.com/DorisMinmin) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 ：校对中


WebRTC has been heralded as a new front in a long war for an open and unencumbered web, and is seen as one of the most important innovations in web standards in recent years. WebRTC has allowed web developers to add video chat or peer to peer data transfer inside their web apps, all without complex code or expensive infrastructure. Supported today in Chrome, Firefox and Opera, with more browsers on the way, it has the capability to reach billions of devices already.

WebRTC被誉为是web长期开源开发的一个新启元，是近年来web开发的最重要创新。WebRTC允许Web开发者在其web应用中添加视频聊天或者点对点数据传输，不需要复杂的代码或者昂贵的配置。目前支持Chrome、Firefox和Opera，后续会支持更多的浏览器，它有能力达到数十亿的设备。

However, WebRTC suffers from an urban myth: WebRTC is just for the browser. In fact, one of the most important things about WebRTC is the fact that it allows for full interoperability between native and web apps alike. Few take advantage of that fact.

然而，WebRTC一直被误解为仅适合于浏览器。事实上，WebRTC最重要的一个特征是允许本地和web应用间的互操作，很少有人使用到这个特性。

In this blog post we will investigate how you can get started with building WebRTC into your Android apps, using the native libraries provided by the [WebRTC Initiative](http://www.webrtc.org/). We will not be going through how you set up a call using a signalling mechanism, but instead highlight what similarities and differences Android has over the implementation in browsers. As you will see, the APIs for Android parallel those for the web. If you are looking for a more basic introduction to WebRTC, I can highly recommend [Sam Dutton’s Getting started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/).


本文将探讨如何在自己的Android应用中植入WebRTC，使用[WebRTC Initiative](http://www.webrtc.org/)中提供的本地库。这边文章不会讲解如何使用信号机制建立通话，而是重点探讨Android与浏览器中实现的差异性和相似性。下文将讲解Android中实现对应功能的一些接口。如果想要了解WebRTC的基础知识，强烈推荐[Sam Dutton’s Getting started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/)。

##Adding the WebRTC library to your project
##项目中添加WebRTC
*The following guide has been written with the Android WebRTC library version 9127 in mind.*
*下面的讲解基于Android WebRTC库版本9127.*

The very first thing you need to do is add the WebRTC library to your application. The WebRTC Initiative has [a pretty barebones guide to compiling it yourself](http://www.webrtc.org/native-code/android), but trust me, you want to avoid that if you can. Instead, at appear.in we use pristine.io’s compiled version, [available from the maven central repository](https://oss.sonatype.org/content/groups/public/io/pristine/).

首先要做的是在应用中添加WebRTC库。 WebRTC Initiative 提供了[一种简洁的方式来编译](http://www.webrtc.org/native-code/android)，但尽量不要采用那种方式。取而代之，建议使用原始的io编译版本，可以从[maven central repository](https://oss.sonatype.org/content/groups/public/io/pristine/)中获取。

To add the WebRTC library to your project, you need to add the following line to your dependencies:
添加WebRTC到工程中，需要执行如下命令：
```xml
1 compile 'io.pristine:libjingle:9127@aar'
```
Sync your project, and you will now have the WebRTC libraries ready to use!
同步工程后，WebRTC库就准备就绪。

##Permissions
##权限

As with all Android applications, you need to have certain permissions to use certain APIs. Building stuff with WebRTC is no exception. Depending on what application you are making, or what features you need, such as audio and video, you will need different sets of permissions. Make sure you only request the ones you need! A good permission-set for a video chat application could be:

同其他Android应用一样，使用接口需要具备一定的权限。WebRTC也不例外。制作的应用不同，或者需要的功能不同，例如音频或者视频，所需要的权限集也是不同的。请确保按需申请！一个好的视频聊天应用权限集如下：
```xml
1 <uses-feature android:name="android.hardware.camera" />
2 <uses-feature android:name="android.hardware.camera.autofocus" />
3 <uses-feature android:glEsVersion="0x00020000" android:required="true" />
4 
5 <uses-permission android:name="android.permission.CAMERA" />
6 <uses-permission android:name="android.permission.RECORD_AUDIO" />
7 <uses-permission android:name="android.permission.INTERNET" />
8 <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
9 <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```
##Lights, camera… factory…
##灯光，摄影，工厂
When using WebRTC in the browser, you have some pretty well functioning and well documented APIs to work with. [navigator.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia) and [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) contain mostly everything you need to get up and running. Combine that with the `<video>` tag, and you have everything you need to show both your local webcam stream, as well as all the remote videos streams you’d like.

在浏览器中使用WebRTC时，有一些功能完善、说明详细的API可供使用。 [navigator.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia) 和 [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) 包含了可能用到的几乎所有功能。结合`<video>`标签使用，可以显示任何想要显示的本地视频流和远程视频流。

Luckily, the APIs are not that different on Android, though they have slightly different names. On Android, we talk about [VideoCapturerAndroid](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoCapturerAndroid), [VideoRenderer](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoRenderer), [MediaStream](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#MediaStream), [PeerConnection](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnection), and [PeerConnectionFactory](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnectionFactory). Let’s take a deep dive into each one.

所幸的是Android上也有相同的API，虽然它们的名字有所不同。Android相关的API有[VideoCapturerAndroid](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoCapturerAndroid), [VideoRenderer](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoRenderer), [MediaStream](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#MediaStream), [PeerConnection](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnection), 和 [PeerConnectionFactory](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnectionFactory)。下面我们将逐一讲解。

However, before you can begin doing anything, you need to create your PeerConnectionFactory, the very core of all things WebRTC on Android.
在开始之前，需要创建PeerConnectionFactory，这是Android上使用WebRTC最核心的API。

##PeerConnectionFactory
The core of all things WebRTC on Android. Understanding this class and how it works to help you create everything else is key to grokking Android-style WebRTC. It also behaves a bit differently from what you’d expect, so let’s dive in.

Android WebRTC最核心的类。理解这个类并了解它如何创建其他任何事情是深入了解Android中WebRTC的关键。它和我们期望的方式还是有所不同的，所以我们开始深入挖掘它。

First of all, you need to initialize the PeerConnectionFactory.

首先需要初始化PeerConnectionFactory，如下：
```xml
// First, we initiate the PeerConnectionFactory with
// our application context and some options.
PeerConnectionFactory.initializeAndroidGlobals(
    context,
    initializeAudio,
    initializeVideo,
    videoCodecHwAcceleration,
    renderEGLContext);
```
To understand what’s going on here, let’s look at each of the parameters.
为了理解这个方法，需要了解每个参数的意义：

**context**
Simply the ApplicationContext, or any other Context relevant, as you are used to passing around.
应用上下文，或者上下文相关的，和其他地方传递的一样。

**initializeAudio**
A boolean for initializing the audio portions.
是否初始化音频的布尔值。

**initializeVideo**
A boolean for initializing the video portions . Skipping either one of these two allows you to skip asking for permissions for this API as well, for example for DataChannel applications.
是否初始化视频的布尔值。跳过这两个就允许跳过请求API的相关权限，例如数据通道应用。

**videoCodecHwAcceleration**
A boolean for enabling hardware acceleration.
是否允许硬件加速的布尔值。

**renderEGLContext**
Can be provided to support HW video decoding to texture and will be used to create a shared EGL context on video decoding thread. This can be null - in this case HW video decoder will generate yuv420 frames instead of texture frames.
用来提供支持硬件视频解码，可以在视频解码线程中创建共享EGL上下文。可以为空——在本文例子中硬件视频解码将产生yuv420帧而非texture帧。

`initializeAndroidGlobals` will also return a boolean, which is true if everything went OK, and false if something failed. It is best practice to fail gracefully if a false value is returned. See also [the source](https://code.google.com/p/webrtc/source/browse/trunk/talk/app/webrtc/java/src/org/webrtc/PeerConnectionFactory.java?r=8344&spec=svn8423#64) for more information.

initializeAndroidGlobals也是返回布尔值，true表示一切OK，false表示有失败。如果返回false是最好的练习。更多信息请参考[源码](https://code.google.com/p/webrtc/source/browse/trunk/talk/app/webrtc/java/src/org/webrtc/PeerConnectionFactory.java?r=8344&spec=svn8423#64)。

Assuming everything went ok, you can now create your factory using the PeerConnectionFactory constructor, like any other class.

如果一切ok，可以使用PeerConnectionFactory 的构造函数创建自己的工程，和其他类一样。
```xml
1 PeerConnectionFactory peerConnectionFactory = new PeerConnectionFactory();
```
##Aaaand action, fetching media and rendering
##行动、获取媒体流、渲染
Once you have your `peerConnectionFactory` instance, it’s time to get vidoe and audio from the user’s device, and finally rendering that to the screen. On the web, you have `getUserMedia` and `<video>`. Things aren’t so simple on Android, but you get a lot more options! On Android, we talk about VideoCapturerAndroid, VideoSource, VideoTrack and VideoRenderer. It all starts with VideoCapturerAndroid.

有了`peerConnectionFactory`实例，就可以从用户设备获取视频和音频，最终将其渲染到屏幕上。web中可以使用`getUserMedia` 和`<video>`。在Android中，没有这么简单，但可以有更多选择！在Android中，我们需要了解VideoCapturerAndroid，VideoSource，VideoTrack和VideoRenderer，先从VideoCapturerAndroid开始。

###VideoCapturerAndroid

The VideoCapturerAndroid class is really just a neat wrapper around the Camera API, providing convenience functions to access the camera streams of the device. It allows you to fetch the number of camera devices, get the front facing camera, or the back facing camera.

VideoCapturerAndroid其实是一系列Camera API的封装，为访问摄像头设备的流信息提供了方便。它允许获取多个摄像头设备信息，包括前置摄像头，或者后置摄像头。
```xml
1  // Returns the number of camera devices                       
2  VideoCapturerAndroid.getDeviceCount();                        
3                                                              
4  // Returns the front face device name                         
5  VideoCapturerAndroid.getNameOfFrontFacingDevice();            
6  // Returns the back facing device name                        
7  VideoCapturerAndroid.getNameOfBackFacingDevice();             
8                                                              
9  // Creates a VideoCapturerAndroid instance for the device name
10 VideoCapturerAndroid.create(name);
```
With an instance of the VideoCapturerAndroid class containing a camera stream you have the possibility to create a MediaStream containing the video stream from your camera, which you can send to the other peer. But before we do that, let’s look at how we can display your own video in your application first.

有了包含摄像流信息的VideoCapturerAndroid实例，就可以创建从本地设备获取到的包含视频流信息的MediaStream，从而发送给另一端。但做这些之前，我们首先研究下如何将自己的视频显示到应用上面。

###VideoSource/VideoTrack

To get anything useful from your VideoCapturer instance, or rather, to reach the end goal of getting a proper MediaStream for your PeerConnection, or even just to render it to the user, you need to go through the VideoSource and VideoTrack classes.

从VideoCapturer实例中获取一些有用信息，或者要达到最终目标————为连接端获取合适的媒体流，或者仅仅是将它渲染给用户，我们需要了解VideoSource 和 VideoTrack类。

[VideoSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoSource.java) enables functions to start/stop capturing your device. This is advantageous in situations where it is better to disable the capture device to increase battery life.

[VideoSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoSource.java)允许方法开启、停止设备捕获视频。这在为了延长电池寿命而禁止视频捕获的情况下比较有用。

[VideoTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoTrack.java) is a wrapper to simplify adding the VideoSource to your MediaStream object.

[VideoTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoTrack.java) 是简单的添加VideoSource到MediaStream 对象的一个封装。

Let’s look at some code to see how they work together. `capturer` is our VideoCapturer instance, and `videoConstraints` is an instance of MediaConstraints.

我们通过代码看看它们是如何一起工作的。`capturer`是VideoCapturer的实例，`videoConstraints`是MediaConstraints的实例。
```xml
1  // First we create a VideoSource                                     
2  VideoSource videoSource =                                            
3  	       peerConnectionFactory.createVideoSource(capturer, videoConstraints);
4                                                                       
5  // Once we have that, we can create our VideoTrack                   
6  // Note that VIDEO_TRACK_ID can be any string that uniquely          
7  // identifies that video track in your application                   
8  VideoTrack localVideoTrack =                                         
9  	       peerConnectionFactory.createVideoTrack(VIDEO_TRACK_ID, videoSource);
```

###AudioSource/AudioTrack

[AudioSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java) and [AudioTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java) are very similar to VideoSource and VideoTrack, except you don’t need an AudioCapturer to capture the microphone. `audioConstraints` is an instance of MediaConstraints.

[AudioSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java)和[AudioTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java)与VideoSource和VideoTrack相似，只是不需要AudioCapturer 来获取麦克风，`audioConstraints`是 MediaConstraints的一个实例。
```xml
1  // First we create an AudioSource                                    
2  AudioSource audioSource =                                            
3  	       peerConnectionFactory.createAudioSource(audioConstraints);          
4                                                                       
5  // Once we have that, we can create our AudioTrack                   
6  // Note that AUDIO_TRACK_ID can be any string that uniquely          
7  // identifies that audio track in your application                   
8  AudioTrack localAudioTrack =                                         
9  	       peerConnectionFactory.createAudioTrack(AUDIO_TRACK_ID, audioSource);
```
###VideoRenderer

From working with WebRTC in browsers, you are probably familiar with using the `<video>` tag to display your MediaStream from getUserMedia. However, on native Android, there is no such thing as the `<video>` tag. Enter the VideoRenderer. The WebRTC library allows you to implement your own rendering implementation using `VideoRenderer.Callbacks` should you wish to do that. However, it also provides a nice default, [VideoRendererGui](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/android/org/webrtc/VideoRendererGui.java), which is included. In short, a VideoRendererGui is a [GLSurfaceView](https://developer.android.com/reference/android/opengl/GLSurfaceView.html) upon which you can draw your video stream. Let’s look at how we set this up, including adding our renderer to our VideoTrack.

通过在浏览器中使用WebRTC，你肯定已经熟悉使用`<Video>`标签通过getUserMedia显示MediaStream。但在本地Android中，没有类似`<Video>`的标签。进入VideoRenderer，WebRTC库允许通过`VideoRenderer.Callbacks`实现自己的渲染。另外，它提供了一种非常好的默认方式VideoRendererGui。简而言之，[VideoRendererGui](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/android/org/webrtc/VideoRendererGui.java)是一个[GLSurfaceView](https://developer.android.com/reference/android/opengl/GLSurfaceView.html) ，使用它可以绘制自己的视频流。我们通过代码看一下它是如何工作的，以及如何添加renderer 到 VideoTrack。
```xml
1   // To create our VideoRenderer, we can use the                           
2   // included VideoRendererGui for simplicity                              
3   // First we need to set the GLSurfaceView that it should render to       
4   GLSurfaceView videoView = (GLSurfaceView) findViewById(R.id.glview_call);
5                                                                            
6   // Then we set that view, and pass a Runnable                            
7   // to run once the surface is ready                                      
8   VideoRendererGui.setView(videoView, runnable);                           
9                                                                            
10  // Now that VideoRendererGui is ready, we can get our VideoRenderer      
11  VideoRenderer renderer = VideoRendererGui.createGui(x, y, width, height);
12                                                                           
13  // And finally, with our VideoRenderer ready, we                         
14  // can add our renderer to the VideoTrack.                               
15  localVideoTrack.addRenderer(renderer);                                   
```
One thing to note here is that createGui needs four parameters. This is done to make it possible to use a single GLSurfaceView for rendering all your videos. At appear.in however, we use multiple GLSurfaceViews, which means that x,y will always be 0 to render properly. This is however up to what makes sense in your implementation.

这里要说明的一点是createGui 需要四个参数。这样做是使一个单一的GLSurfaceView 渲染所有视频成为可能。但在实际使用中我们使用了多个GLSurfaceViews，这意味为了渲染正常，x、y一直是0。这让我们了解到实现过程中各个参数的意义。

###MediaConstraints

The MediaConstraint class is the WebRTC library’s way of supporting different constraints you can have on your audio and video tracks inside the MediaStream. See the [specification](https://w3c.github.io/mediacapture-main/#idl-def-MediaTrackSupportedConstraints) for which are supported. For most methods requiring MediaConstraints a simple instance of MediaConstraints will do.

MediaConstraints是支持不同约束的WebRTC库方式的类，可以加载到MediaStream中的音频和视频轨道。具体参考[规范](https://w3c.github.io/mediacapture-main/#idl-def-MediaTrackSupportedConstraints)查看支持列表。对于大多数需要MediaConstraints的方法，一个简单的MediaConstraints实例就可以做到。
```xml
1  MediaConstraints audioConstraints = new MediaConstraints();
```
To add actual constraints, you can define these as `KeyValuePairs` and push to the constraint’s `mandatory` or `optional` list.
要添加实际约束，可以定义`KeyValuePairs`，并将其推送到约束的`mandatory`或者`optional`list。

###MediaStream

Now that you can see yourself, it’s time to make sure the other party does too. From web, you are perhaps familiar with the concept of a [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API). `getUserMedia` returns a MediaStream directly which you can add to your RTCPeerConnection to send to the other peer. This is also true for Android, except we have to build our own MediaStream. Let’s see how we can add our VideoTrack and AudioTrack to create a proper MediaStream.

现在可以在本地看见自己了，接下来就要想办法让对方看见自己。在web开发时，对[MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)已经很熟悉了。`getUserMedia`直接返回MediaStream ，然后将其添加到RTCPeerConnection 传送给对方。在Android上此方法也是通用的，只是我们需要自己创建MediaStream。 接下来我们就研究如何添加本地的VideoTrack 和AudioTrack来创建一个合适的MediaStream。 
```xml
1   // We start out with an empty MediaStream object,                                             
2   // created with help from our PeerConnectionFactory                                           
3   // Note that LOCAL_MEDIA_STREAM_ID can be any string                                          
4   MediaStream mediaStream = peerConnectionFactory.createLocalMediaStream(LOCAL_MEDIA_STREAM_ID);
5                                                                                                 
6   // Now we can add our tracks.                                                                 
7   mediaStream.addTrack(localVideoTrack);                                                        
8   mediaStream.addTrack(localAudioTrack);                                                        
```

##Hello? Is there anybody out there?
##Hi，有人在那里吗？

We finally have our audio and video stream inside a MediaStream instance, in addition to showing the stream of your pretty face on screen. It’s time to send all that to the other peer. While this guide will not include a way to set up your signalling channel, we will go through each API method and explain how it relates to the web. [AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk/examples/android/) uses [autobahn](http://autobahn.ws/android/) to enable a WebSocket connection to a signalling server. I recommend checking out that project for details on how to set up your signalling channel inside Android.

我们现在有了包含视频流和音频流的MediaStream实例，而且在屏幕上显示了我们漂亮的脸庞。现在就该把这些信息传送给对方了。这篇文章不会介绍如何建立自己的信号流，我们直接介绍对应的API方法，以及它们如何与web关联的。[AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk/examples/android/)使用[autobahn](http://autobahn.ws/android/)使得WebSocket连接到信号端。我建议下载下来这个项目来仔细研究下如何在Android中建立自己的信号流。

###PeerConnection

Now that we finally have our MediaStream, we can start connecting to the other peer. Luckily, this part is much closer to how it is on the web, so if you’re familiar with WebRTC in browsers, this part should be fairly straight forward. Creating a PeerConnection is easy, with the help of none other than PeerConnectionFactory.

现在我们有了自己的MediaStream，就可以开始连接远端了。幸运的是这部分和web上的处理很相似，所以如果对浏览器中的WebRTC熟悉的话，这部分就相当简单了。创建PeerConnection很简单，只需要PeerConnectionFactory的协助即可。
```xml
1  PeerConnection peerConnection = peerConnectionFactory.createPeerConnection(
2  	        iceServers,                                                               
3  	        constraints,                                                              
4  	        observer);                                                                
```
The parameters are as follows.
参数的作用如下：

**iceServers**
This is needed should you want to connect outside your local device or network. Adding STUN and TURN servers here will enable you to connect, even in hard network scenarios.
连接到外部设备或者网络时需要用到这个参数。在这里添加STUN 和 TURN 服务器就允许进行连接，即使在网络条件很差的条件下。

**constraints**
An instance of MediaConstraints. Should contain `offerToRecieveAudio` and `offerToRecieveVideo`.
MediaConstraints的一个实例，应该包含`offerToRecieveAudio` 和 `offerToRecieveVideo`

**observer**
An instance of your implementation of PeerConnectionObserver.
PeerConnectionObserver实现的一个实例。

The PeerConnection API is pretty similar to that on the web, containing functions such as addStream, addIceCandidate, createOffer, createAnswer, getLocalDescription, setRemoteDescription and more. Check out [Getting started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection) to see how all these work together to form a communication channel between two peers, or look at [AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk) to see a live, fully functioning Android WebRTC application work. Let’s take a quick look into each of the important functions, and how they work.

PeerConnection 和web上的对应API很相似，包含了addStream、addIceCandidate、createOffer、createAnswer、getLocalDescription、setRemoteDescription 和其他类似方法。下载[WebRTC入门](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection) 来学习如何协调所有工作在两点之间建立起通讯通道，或者[AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk)如何使得一个实时的功能完整的Android WebRTC应用工作的。我们快速浏览一下这几个重要的方法，看它们是如何工作的。

###addStream

This is used to add your MediaStream to the PeerConnection. Does what it says on the label, really. If you want the other party to see your video and hear your audio, this is the function you’re looking for.

这个是用来将MediaStream 添加到PeerConnection中的,如同它的命名一样。如果你想要对方看到你的视频、听到你的声音，就需要用到这个方法。

###addIceCandidate

[IceCandidates](http://stackoverflow.com/questions/21069983/what-are-ice-candidates-and-how-do-the-peer-connection-choose-between-them/21071464#21071464) are created once the internal IceFramework has found candidates that allow the other peer to connect to you. While you send yours gathered through the PeerConnectionObserver.onIceCandidate handler to the other peer, you will, through whatever signalling channel you choose, receive the remote peer’s IceCandidates as they become available. Use addIceCandidate to add them to the PeerConnection, so the PeerConnection can attempt to connect to the other peer using the information within.

一旦内部IceFramework发现有candidates允许其他方连接你时，就会创建[IceCandidates](http://stackoverflow.com/questions/21069983/what-are-ice-candidates-and-how-do-the-peer-connection-choose-between-them/21071464#21071464) 。当通过PeerConnectionObserver.onIceCandidate传递数据到对方时，需要通过任何一个你选择的信号通道获取到对方的IceCandidates。使用addIceCandidate 添加它们到PeerConnection，以便PeerConnection可以通过已有信息试图连接对方。

###createOffer/createAnswer

These two are used in the initial call setup. As you may know, in WebRTC, you have the notion of a caller and a callee, one who calls, and one who answers. createOffer is done by the caller, and it takes an sdpObserver, that allows you to fetch and transmit the Session Description Protocol (SDP) to the other party, and a MediaConstraint. Once the other party gets the offer, it will create an answer and transmit back to the caller. An SDP is metadata that describes to the other peer the format to expect (video, formats, codecs, encryption, resolution, size, etc). Once the answer is received, the peers can agree on a mutual set of requirements for the connection, video and audio codec, etc.

这两个方法用于原始通话的建立。如你所知，在WebRTC中，已经有了caller和callee的概念，一个是呼叫，一个是应答。createOffer是caller使用的，它需要一个sdpObserver，它允许获取和传输会话描述协议Session Description Protocol (SDP)给对方，还需要一个MediaConstraint。一旦对方得到了这个请求，它将创建一个应答并将其传输给caller。SDP是用来给对方描述期望格式的数据（如video、formats、codecs、encryption、resolution、 size等）。一旦caller收到这个应答信息，双方就相互建立的通信需求达成了一致，如视频、音频、解码器等。

###setLocalDescription/setRemoteDescription

This is used to set the SDP generated from createOffer and createAnswer, including the one you get from the remote peer. This allows the internal PeerConnection engine to configure the connection so that it actually works once you start transmitting video and audio.

这个是用来设置createOffer和createAnswer产生的SDP数据的，包含从远端获取到的数据。它允许内部PeerConnection 配置链接以便一旦开始传输音频和视频就可以开始真正工作。

###PeerConnectionObserver

This interface provides a way of observing the PeerConnection for events, such as when the MediaStream is received, when iceCandidates are found, or when renegotiation is needed. These match their web counterparts in functionality, and shouldn’t be too hard understand if you come from the web, or follow [Getting started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection). This interface must be implemented by you, so that you can handle the incoming events properly, such as signal iceCandidates to the other peer as they become available.

这个接口提供了一种监测PeerConnection事件的方法，例如收到MediaStream时，或者发现iceCandidates 时，或者需要重新建立通讯时。这些在功能上与web相对应，如果你学习过相关web开发理解这个不会很困难，或者学习[WebRTC入门](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection)。这个接口必须被实现，以便你可以有效处理收到的事件，例如当对方变为可见时，向他们发送信号iceCandidates。

##Finishing up
##结束语

As you can see, the APIs for Android are pretty simple and straightforward once you know how they relate to their web counterparts. With the tools above, you can develop a production ready WebRTC app, instantly deployable to billions of capable devices.

如上所述，如果你了解了如何与web相对应，Android上面的API是非常简单易懂的。有了以上这些工具，我们就可以开发出一个WebRTC相关产品，立即部署到数十亿设备上。

WebRTC opens up communications to all of us, free for developers, free for end users. And it enables a lot more than just video chat. We’ve seen applications such as health services, low-latency file transfer, torrents, and even gaming.

WebRTC打开了人与人之间的通讯，对开发者免费，对终端用户免费。 它不仅仅提供了视频聊天，还有其他应用，比如健康服务、低延迟文件传输、种子下载、甚至游戏应用。

To see a real-life example of a WebRTC app, check out appear.in on [Android](https://play.google.com/store/apps/details?id=appear.in.app&referrer=utm_source%3Dtech.appear.in%26utm_medium%3Dblog%26utm_campaign%3Dandroid-launch-may15) or [iOS](https://itunes.apple.com/app/apple-store/id878583078?pt=1259761&ct=tech.appear.in&mt=8). It works perfectly between browsers and native apps, and is free for up to 8 people in the same room. No installation or login required.

想要看到一个真正的WebRTC应用实例，请下载[Android](https://play.google.com/store/apps/details?id=appear.in.app&referrer=utm_source%3Dtech.appear.in%26utm_medium%3Dblog%26utm_campaign%3Dandroid-launch-may15)或[ios](https://itunes.apple.com/app/apple-store/id878583078?pt=1259761&ct=tech.appear.in&mt=8)版的appear.in。它在浏览器和本地应用间运行的相当完美，在同一个房间内最多可以8个人免费使用。不需要安装和注册。

Now go out there, and build something new and different!
现在就发挥你们的潜力，开发出更多新的应用！
