#Android之WebRTC介绍
---

> * 原文链接 : [Introduction to WebRTC on Android](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/)
* 原文作者 : [Dag-Inge Aas](https://disqus.com/home/forums/appearin/)
* 译文出自 : [appear.in](https://tech.appear.in/)
* 译者 : [DorisMinmin](https://github.com/DorisMinmin) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 ：完成

WebRTC被誉为是web长期开源开发的一个新启元，是近年来web开发的最重要创新。WebRTC允许Web开发者在其web应用中添加视频聊天或者点对点数据传输，不需要复杂的代码或者昂贵的配置。目前支持Chrome、Firefox和Opera，后续会支持更多的浏览器，它有能力达到数十亿的设备。

然而，WebRTC一直被误解为仅适合于浏览器。事实上，WebRTC最重要的一个特征是允许本地和web应用间的互操作，很少有人使用到这个特性。

本文将探讨如何在自己的Android应用中植入WebRTC，使用[WebRTC Initiative](http://www.webrtc.org/)中提供的本地库。这边文章不会讲解如何使用信号机制建立通话，而是重点探讨Android与浏览器中实现的差异性和相似性。下文将讲解Android中实现对应功能的一些接口。如果想要了解WebRTC的基础知识，强烈推荐[Sam Dutton’s Getting started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/)。

##项目中添加WebRTC
*下面的讲解基于Android WebRTC库版本9127.*

首先要做的是在应用中添加WebRTC库。 WebRTC Initiative 提供了[一种简洁的方式来编译](http://www.webrtc.org/native-code/android)，但尽量不要采用那种方式。取而代之，建议使用原始的io编译版本，可以从[maven central repository](https://oss.sonatype.org/content/groups/public/io/pristine/)中获取。

添加WebRTC到工程中，需要在你的依赖中添加如下内容：
```Gradle
1 compile 'io.pristine:libjingle:9127@aar'
```
同步工程后，WebRTC库就准备就绪。

##权限
同其他Android应用一样，使用某些 API 需要申请相应权限。WebRTC也不例外。制作的应用不同，或者需要的功能不同，例如音频或者视频，所需要的权限集也是不同的。请确保按需申请！一个好的视频聊天应用权限集如下：
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
##灯光，摄影，工厂

在浏览器中使用WebRTC时，有一些功能完善、说明详细的API可供使用。 [navigator.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia) 和 [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) 包含了可能用到的几乎所有功能。结合`<video>`标签使用，可以显示任何想要显示的本地视频流和远程视频流。

所幸的是Android上也有相同的API，虽然它们的名字有所不同。Android相关的API有[VideoCapturerAndroid](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoCapturerAndroid), [VideoRenderer](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#VideoRenderer), [MediaStream](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#MediaStream), [PeerConnection](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnection), 和 [PeerConnectionFactory](https://tech.appear.in/2015/05/25/Introduction-to-WebRTC-on-Android/#PeerConnectionFactory)。下面我们将逐一讲解。

在开始之前，需要创建PeerConnectionFactory，这是Android上使用WebRTC最核心的API。

##PeerConnectionFactory
Android WebRTC最核心的类。理解这个类并了解它如何创建其他任何事情是深入了解Android中WebRTC的关键。它和我们期望的方式还是有所不同的，所以我们开始深入挖掘它。

首先需要初始化PeerConnectionFactory，如下：
```Java
// First, we initiate the PeerConnectionFactory with
// our application context and some options.
PeerConnectionFactory.initializeAndroidGlobals(
    context,
    initializeAudio,
    initializeVideo,
    videoCodecHwAcceleration,
    renderEGLContext);
```
为了理解这个方法，需要了解每个参数的意义：

**context**
应用上下文，或者上下文相关的，和其他地方传递的一样。

**initializeAudio**
是否初始化音频的布尔值。

**initializeVideo**
是否初始化视频的布尔值。跳过这两个就允许跳过请求API的相关权限，例如数据通道应用。

**videoCodecHwAcceleration**
是否允许硬件加速的布尔值。

**renderEGLContext**
用来提供支持硬件视频解码，可以在视频解码线程中创建共享EGL上下文。可以为空——在本文例子中硬件视频解码将产生yuv420帧而非texture帧。

initializeAndroidGlobals也是返回布尔值，true表示一切OK，false表示有失败。如果返回false是最好的练习。更多信息请参考[源码](https://code.google.com/p/webrtc/source/browse/trunk/talk/app/webrtc/java/src/org/webrtc/PeerConnectionFactory.java?r=8344&spec=svn8423#64)。

如果一切ok，可以使用PeerConnectionFactory 的构造函数创建自己的工厂，和其他类一样。
```Java
1 PeerConnectionFactory peerConnectionFactory = new PeerConnectionFactory();
```
##行动、获取媒体流、渲染
有了`peerConnectionFactory`实例，就可以从用户设备获取视频和音频，最终将其渲染到屏幕上。web中可以使用`getUserMedia` 和`<video>`。在Android中，没有这么简单，但可以有更多选择！在Android中，我们需要了解VideoCapturerAndroid，VideoSource，VideoTrack和VideoRenderer，先从VideoCapturerAndroid开始。

###VideoCapturerAndroid

VideoCapturerAndroid其实是一系列Camera API的封装，为访问摄像头设备的流信息提供了方便。它允许获取多个摄像头设备信息，包括前置摄像头，或者后置摄像头。
```Java
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
有了包含摄像流信息的VideoCapturerAndroid实例，就可以创建从本地设备获取到的包含视频流信息的MediaStream，从而发送给另一端。但做这些之前，我们首先研究下如何将自己的视频显示到应用上面。

###VideoSource/VideoTrack

从VideoCapturer实例中获取一些有用信息，或者要达到最终目标————为连接端获取合适的媒体流，或者仅仅是将它渲染给用户，我们需要了解VideoSource 和 VideoTrack类。

[VideoSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoSource.java)允许方法开启、停止设备捕获视频。这在为了延长电池寿命而禁止视频捕获的情况下比较有用。

[VideoTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/VideoTrack.java) 是简单的添加VideoSource到MediaStream 对象的一个封装。

我们通过代码看看它们是如何一起工作的。`capturer`是VideoCapturer的实例，`videoConstraints`是MediaConstraints的实例。
```Java
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

[AudioSource](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java)和[AudioTrack](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/src/org/webrtc/AudioSource.java)与VideoSource和VideoTrack相似，只是不需要AudioCapturer 来获取麦克风，`audioConstraints`是 MediaConstraints的一个实例。
```Java
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

通过在浏览器中使用WebRTC，你肯定已经熟悉了使用`<Video>`标签来显示出从 getUserMedia 方法得到的 MediaStream。但在本地Android中，没有类似`<Video>`的标签。进入VideoRenderer，WebRTC库允许通过`VideoRenderer.Callbacks`实现自己的渲染。另外，它提供了一种非常好的默认方式VideoRendererGui。简而言之，[VideoRendererGui](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/java/android/org/webrtc/VideoRendererGui.java)是一个[GLSurfaceView](https://developer.android.com/reference/android/opengl/GLSurfaceView.html) ，使用它可以绘制自己的视频流。我们通过代码看一下它是如何工作的，以及如何添加renderer 到 VideoTrack。
```Java
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
这里要说明的一点是createGui 需要四个参数。这样做是使一个单一的GLSurfaceView 渲染所有视频成为可能。但在实际使用中我们使用了多个GLSurfaceViews，这意味为了渲染正常，x、y一直是0。这让我们了解到实现过程中各个参数的意义。

###MediaConstraints
MediaConstraints是支持不同约束的WebRTC库方式的类，可以加载到MediaStream中的音频和视频轨道。具体参考[规范](https://w3c.github.io/mediacapture-main/#idl-def-MediaTrackSupportedConstraints)查看支持列表。对于大多数需要MediaConstraints的方法，一个简单的MediaConstraints实例就可以做到。
```Java
1  MediaConstraints audioConstraints = new MediaConstraints();
```
要添加实际约束，可以定义`KeyValuePairs`，并将其推送到约束的`mandatory`或者`optional`list。

###MediaStream
现在可以在本地看见自己了，接下来就要想办法让对方看见自己。在web开发时，对[MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)已经很熟悉了。`getUserMedia`直接返回MediaStream ，然后将其添加到RTCPeerConnection 传送给对方。在Android上此方法也是通用的，只是我们需要自己创建MediaStream。 接下来我们就研究如何添加本地的VideoTrack 和AudioTrack来创建一个合适的MediaStream。 
```Java
1   // We start out with an empty MediaStream object,                                             
2   // created with help from our PeerConnectionFactory                                           
3   // Note that LOCAL_MEDIA_STREAM_ID can be any string                                          
4   MediaStream mediaStream = peerConnectionFactory.createLocalMediaStream(LOCAL_MEDIA_STREAM_ID);
5                                                                                                 
6   // Now we can add our tracks.                                                                 
7   mediaStream.addTrack(localVideoTrack);                                                        
8   mediaStream.addTrack(localAudioTrack);                                                        
```

##Hi，有人在那里吗？
我们现在有了包含视频流和音频流的MediaStream实例，而且在屏幕上显示了我们漂亮的脸庞。现在就该把这些信息传送给对方了。这篇文章不会介绍如何建立自己的信号流，我们直接介绍对应的API方法，以及它们如何与web关联的。[AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk/examples/android/)使用[autobahn](http://autobahn.ws/android/)使得WebSocket连接到信号端。我建议下载下来这个项目来仔细研究下如何在Android中建立自己的信号流。

###PeerConnection
现在我们有了自己的MediaStream，就可以开始连接远端了。幸运的是这部分和web上的处理很相似，所以如果对浏览器中的WebRTC熟悉的话，这部分就相当简单了。创建PeerConnection很简单，只需要PeerConnectionFactory的协助即可。
```Java
1  PeerConnection peerConnection = peerConnectionFactory.createPeerConnection(
2  	        iceServers,                                                               
3  	        constraints,                                                              
4  	        observer);                                                                
```
参数的作用如下：

**iceServers**
连接到外部设备或者网络时需要用到这个参数。在这里添加STUN 和 TURN 服务器就允许进行连接，即使在网络条件很差的条件下。

**constraints**
MediaConstraints的一个实例，应该包含`offerToRecieveAudio` 和 `offerToRecieveVideo`

**observer**
PeerConnectionObserver实现的一个实例。

PeerConnection 和web上的对应API很相似，包含了addStream、addIceCandidate、createOffer、createAnswer、getLocalDescription、setRemoteDescription 和其他类似方法。下载[WebRTC入门](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection) 来学习如何协调所有工作在两点之间建立起通讯通道，或者[AppRTC](https://chromium.googlesource.com/external/webrtc/+/master/talk)如何使得一个实时的功能完整的Android WebRTC应用工作的。我们快速浏览一下这几个重要的方法，看它们是如何工作的。

###addStream
这个是用来将MediaStream 添加到PeerConnection中的,如同它的命名一样。如果你想要对方看到你的视频、听到你的声音，就需要用到这个方法。

###addIceCandidate
一旦内部IceFramework发现有candidates允许其他方连接你时，就会创建[IceCandidates](http://stackoverflow.com/questions/21069983/what-are-ice-candidates-and-how-do-the-peer-connection-choose-between-them/21071464#21071464) 。当通过PeerConnectionObserver.onIceCandidate传递数据到对方时，需要通过任何一个你选择的信号通道获取到对方的IceCandidates。使用addIceCandidate 添加它们到PeerConnection，以便PeerConnection可以通过已有信息试图连接对方。

###createOffer/createAnswer
这两个方法用于原始通话的建立。如你所知，在WebRTC中，已经有了caller和callee的概念，一个是呼叫，一个是应答。createOffer是caller使用的，它需要一个sdpObserver，它允许获取和传输会话描述协议Session Description Protocol (SDP)给对方，还需要一个MediaConstraint。一旦对方得到了这个请求，它将创建一个应答并将其传输给caller。SDP是用来给对方描述期望格式的数据（如video、formats、codecs、encryption、resolution、 size等）。一旦caller收到这个应答信息，双方就相互建立的通信需求达成了一致，如视频、音频、解码器等。

###setLocalDescription/setRemoteDescription
这个是用来设置createOffer和createAnswer产生的SDP数据的，包含从远端获取到的数据。它允许内部PeerConnection 配置链接以便一旦开始传输音频和视频就可以开始真正工作。

###PeerConnectionObserver
这个接口提供了一种监测PeerConnection事件的方法，例如收到MediaStream时，或者发现iceCandidates 时，或者需要重新建立通讯时。这些在功能上与web相对应，如果你学习过相关web开发理解这个不会很困难，或者学习[WebRTC入门](http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection)。这个接口必须被实现，以便你可以有效处理收到的事件，例如当对方变为可见时，向他们发送信号iceCandidates。

##结束语
如上所述，如果你了解了如何与web相对应，Android上面的API是非常简单易懂的。有了以上这些工具，我们就可以开发出一个WebRTC相关产品，立即部署到数十亿设备上。

WebRTC打开了人与人之间的通讯，对开发者免费，对终端用户免费。 它不仅仅提供了视频聊天，还有其他应用，比如健康服务、低延迟文件传输、种子下载、甚至游戏应用。

想要看到一个真正的WebRTC应用实例，请下载[Android](https://play.google.com/store/apps/details?id=appear.in.app&referrer=utm_source%3Dtech.appear.in%26utm_medium%3Dblog%26utm_campaign%3Dandroid-launch-may15)或[ios](https://itunes.apple.com/app/apple-store/id878583078?pt=1259761&ct=tech.appear.in&mt=8)版的appear.in。它在浏览器和本地应用间运行的相当完美，在同一个房间内最多可以8个人免费使用。不需要安装和注册。

现在就发挥你们的潜力，开发出更多新的应用！
