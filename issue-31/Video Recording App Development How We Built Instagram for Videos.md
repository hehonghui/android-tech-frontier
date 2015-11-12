Video Recording App Development How We Built Instagram for Videos

---

> * 原文链接 : [Video Recording App Development How We Built Instagram for Videos](https://yalantis.com/blog/video-recording-app-development-how-we-built-instagram-for-videos/)
* 原文作者 : [YALANTIS](https://yalantis.com/)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 




I don’t want to offend anybody, but we need to admit it - there are two types of users that we need to keep in mind when developing mobile apps: control freaks and doormats. When we’re talking about video recording and editing apps, it follows that ‘control freaks’ can also be described as ‘creators’ who want full control over their video projects. Control freaks enjoy doing things their own way, and like having complete freedom in the process of video creating and editing. Unlike control freaks and creators, people who are ‘doormats’ prefer things to be easy, and don’t want to have to wade into the nitty gritty of frame-by-frame video editing. They want to tap a few buttons and get a finished project.

Let’s try to apply this classification to existing video editing apps on Google Play to figure out what type of users they target. Take [Magisto](http://www.magisto.com/), for example. You give Magisto some of your photos and videos from the library, choose an editing style (dance, love, fashion, etc.), and pick a soundtrack. Then, a real magic happens, and in a few minutes you receive a push notification saying your movie is ready.

The result looks quite nice actually, but you don’t get that much control over the creative process. Plus, you have to wait (even if it’s only 2 minutes, we know how much you hate waiting). Imagine if Instagram would grab your selfie, spend some time applying their favorite filters to it, and then suggest that you publish that selfie right away.

Furthermore, with Magisto you get a link to the video stored on Magisto’s server, but do not get the video file stored locally on your device. If you want to download the video to show it to your friends at a party, you’re welcome to do this for a monthly subscription fee.

Magisto is a great video app in its class, and may be perfectly fine for users who don’t demand much control. Unfortunately, however, there is nothing I can recommend to a control freak who happens to be an Android user. Why? Because the majority of social video apps for Android that actually process video recording on a user’s device perform quite poorly. But you shouldn’t blame this on poor programming skills of the app developers who made them. The thing is, as much as we love Android, it just isn’t a perfect platform for video. That’s why it’s really hard to find an amazing social video app for Android on Google Play.

Wait!

There is one app we’ve been developing at Yalantis that might be able to fill the niche. I can definitely walk you through the battle we had with Android to make this app a reality. But before we get down to describing the tech part, you should check out our [article](https://yalantis.com/blog/video-recording-and-video-editing-app-development-top-performers/) about video recording and editing apps, and the top performers on the market.

##What’s wrong with Android?

To be fully honest with you, developing video recording apps for Android is a big challenge. Using standard things like **MediaRecorder** isn’t difficult at all, but we’re talking here about more advanced video recording functionality.  

Apple provides its fellows with native functionality, [AVFoundation](https://developer.apple.com/av-foundation/) to be specific, which allows for developing a great variety of video features for mobile apps, but Google is somehow falling behind.

Despite all the difficulties, we wanted to make a real Instagram for videos, so we accepted the challenge.

##What are the coolest video recording features?

In our project we needed to meet the following requirements:

1. Recording of several video chunks with a total 15 second duration.
2. “Fast Motion” – recording a time-lapse video at a 10FPS.
3. “Slow Motion” – recording a video at a 120FPS.
4. “Stop Motion” – recording very short videos consisting of 2-3 frames.
5. Merging recorded chunks into a single file.
6. Looping music over video.
7. Reversing a recorded video.
8. Cropping video for uploading to Instagram, Facebook etc.
9. Adding a watermark.

##Where do you start, huh?

At first we made an attempt to use MediaRecorder, the easiest way to implement video recording functionality on Android. Even though MediaRecorder has been used for developing Android apps for years, and is supported by all versions of the operating system, there is no way it can be customized.

On all versions of Android up to 4.3. your video implementation possibilities are quite limited. You can record a video from a phone camera with the help of Camera class and MediaRecorder, apply standard camera color filters (sepia, black and white, and some others), and that’s pretty much it. What’s more, with MediaRecorder recording starts with a 700 millisecond delay, but for recording small video chunks almost a second delay isn’t acceptable.

However, it’s not true that the sun never shines on Android. For Jelly Bean, or Android 4.1. and all the following versions Google added a possibility to use MediaCodec class which allows you to access low-level media codecs (i.e. encoder and decoder components), and MediaExtractor class which helps you extract encoded media data from a data source.

![](https://yalantis.com/media/content/ckeditor/2015/10/26/video_processing_illustration1.jpg)

Luckily, for Android 4.3 there appeared MediaMuxer which facilitates muxing (recording several media streams into a single file) for elementary video and audio streams. This component allows for more creative possibilities: you can code and decode video streams, and also perform some processing as well.

![](https://yalantis.com/media/content/ckeditor/2015/10/26/video_processing_illustration2.jpg)

**It was a hard decision, but**

We made the app compatible only with the Android 4.3 and later versions, so that we could use MediaCodec and MediaMuxer for video recording. This way we could avoid delays at recording initialization.

##What’s the tech stack anyway?

Before getting down to the project development, we needed to figure out how we can actually work with MediaCodec. We based our research on the example from Google. The [Grafika](https://github.com/google/grafika) project represents a compilation of different hacks that can help you deal with new ways of recording and editing videos.

Here comes the meaty part. The list of technologies we used includes:

1. OpenGL for rendering of captured frames. It would let us use shaders for frame modification and quickly draw the frames on the camera preview screen.
2. MediaCodec for recording videos.
3. FFmpeg for video processing.
4. Mp4parser for merging of recorded video chunks.
5. MediaRcorder for Fast Motion.

##How can you use the FFmpeg library?

[FFmpeg](https://www.ffmpeg.org/ffmpeg.html) isn’t the easiest thing to work with, to say the least. It’s an open source, cross-platform and very powerful framework for working with videos and images in mobile apps. It’s written in C and has plenty of plug-ins.

The main difficulty in working with ffmpeg is compiling all of the needed plug-ins and adding them to the project. This is a very time-consuming process that would’ve increased the development time and costs by miles and made our client very unhappy. That’s why we found another way to handle the matter.

We bought a license for a ready-made [Android library](http://androidwarzone.blogspot.com/2011/12/ffmpeg4android.html). But even with this expensive work around, there were some non-trivial issues that we needed to deal with.

The particularity of working with ffmpeg is that you need to use it the same way you use an executable file in the command string. In other words, you have to pass a command string with input parameters, and the parameters that need to be applied to the final video. The main issue here is the absence of the possibility to debug to find the problem in case something went wrong. The only source of information is a log file which is recorded during the ffmpeg operation. It takes quite a lot of time to figure out how one or another command works, and also how to compose a complex command which will perform multiple actions at the same time.

We made a firm decision to assemble our own version of the ffmpeg library, and develop a wrapper for it so we could debug an app at any time.

#IMPLEMENTING THE VIDEO APP FEATURES

##Slow Motion

Slow motion was one of the highest priority requirements for the app we’ve been developing. Unlike iOS devices, nearly all Android phones fail to provide hardware support for video recording at frame rates required for the Slow Motion effect. There are also no system capabilities that would allow us to "activate" this feature on that small fraction of Android devices that have hardware support for this feature.

However, there is always a way out! We could have achieved the Slow Motion effect with software. Here is how this can be done:

1. Duplicating frames while recording, or prolonging their duration (time that is spent on showing a single frame).

2. Recording video with a regular frame-rate, and then duplicating each frame while processing.

We’ve seen this implementation live, and to tell the truth, it sucks. If you can't do it right, don't do it at all. We decided to put off the Slow Motion feature for the Android version of the app until better times. Below is a video with the Slow Motion effect that we recorded on an iPhone.

[Video](https://youtu.be/FTufIObL1Kc)

##Fast Motion

Implementing the possibility to record time-lapse videos on Android isn’t hard at all. MediaRecorder allows you to set a frame rate of, say, 10FPS (the standard frame rate for video recording is 30FPS), which means every third frame will be recorded. As a result, the recorded video will be three times faster.  

```java
 private boolean prepareMediaRecorder() {
        if (camera == null) {
            return false;
        }
        camera.unlock();
        if (mediaRecorder == null) {
            mediaRecorder = new MediaRecorder();
            mediaRecorder.setCamera(camera);
        }

        mediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
        mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);

        CamcorderProfile profile = getCamcorderProfile(cameraId);
        mediaRecorder.setCaptureRate(10);
        mediaRecorder.setVideoSize(profile.videoFrameWidth, profile.videoFrameHeight);
        mediaRecorder.setVideoFrameRate(30);
        mediaRecorder.setVideoEncodingBitRate(profile.videoBitRate);
        mediaRecorder.setOutputFile(createVideoFile().getPath());
        mediaRecorder.setPreviewDisplay(cameraPreview.getHolder().getSurface());
        mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);

        try {
            mediaRecorder.prepare();
        } catch (Exception e) {
            releaseMediaRecorder();
            return false;
        }

        return true;
    }
```

[Video](https://www.youtube.com/watch?v=YA4ylL8r2LU&feature=youtu.be)

##Stop Motion

MediaRecorder isn’t suitable for instant recording of several frames. As I already mentioned, it creates a long delay at the start of recording. But using MediaCodec solves the performance problem.

[Video](https://youtu.be/P7dvoDmrFiA)

##Merging recorded video chunks into a single file

This is one of the app’s main features. After recording several chunks, a user should get a single video file.

Initially, we used ffmpeg for this purpose, but then decided to abandon this solution, because it merges videos with transcoding which increases video processing duration. On the Nexus 5, for example, merging 7-8 video chunks into one 15-second-long video takes 15 seconds, and merging more than 100 chunks can take up to a minute. If you use a higher bitrate or codecs that give a better result with the same bitrate, the process takes even longer.

That’s why we used [mp4parser](https://github.com/sannies/mp4parser), a library that works in the following way: it pulls encoded data out of container files, creates a new container and folds that data there in a consecutive order. Then, it records the information to the container’s header, and returns a solid single video file. 

The only disadvantage of working with mp4parser is that all video chunks need to be encoded with the same parameters (codec type, extension, aspect ratio, etc.). Depending on the number of clips, it takes about 1-4 seconds for mp4parser to process videos.

An example of mp4parser output when merging several video files into one:

```java
public void merge(List<File> parts, File outFile) {
  try {
    Movie finalMovie = new Movie();
    Track[] tracks = new Track[parts.size()];
    for (int i = 0; i < parts.size(); i++) {
      Movie movie = MovieCreator.build(parts.get(i).getPath());
      tracks[i] = movie.getTracks().get(0);
    }
    finalMovie.addTrack(new AppendTrack(tracks));
    FileOutputStream fos = new FileOutputStream(outFile);
    BasicContainer container = (BasicContainer) new DefaultMp4Builder().build(finalMovie);
    container.writeContainer(fos.getChannel());
  } catch (IOException e) {
    Log.e(TAG, "Merge failed", e);
  }
}
```

##Reversing a recorded video

We took the following steps to reverse a video:

1. Extracting all frames from a video file, and writing them to internal storage (for example, as jpg files).
2. Renaming frames to put them in reverse order.
3. Compiling one video from all the files.

An example of the command for breaking a video into files with frames:

`
ffmpeg -y -i input.mp4 -strict experimental -r 30 -qscale 1 -f image2 -vcodec mjpeg %03d.jpg
`

After that, you need to rename the files of the frames to make them go in the reverse order (i.e. the first frame becomes the last, and the last becomes the first; the second frame becomes the penultimate and the penultimate becomes the second, and so on).

Then, with the help of the following command, you can assemble a video from frames:

`
ffmpeg -y -f image2 -i %03d.jpg -r 30 -vcodec mpeg4 -b:v 2100k output.mp4
`

This solution for reversing a recorded video looks neither elegant nor productive, nor does it perform quickly. Since we don’t want our users to wait, the ability to reverse videos may appear in future versions of our app, but not in the version currently under development.

[Video](https://youtu.be/WMlkrgCwgbA)

##Gif

The Gif feature is basically about creating short videos consisting of a small number of frames which create a gif effect when looped. Instagram just launched [Boomerang](https://play.google.com/store/apps/details?id=com.instagram.boomerang), an app that produces these sorts of gifs.

The process of implementing gifs is quite simple – we took 6 photos at a regular interval (in our case, 125ms), then duplicated all the frames except the first and the last one in the reverse order to achieve a smooth reverse effect, and collected the frames into one video with the help of ffmpeg:

`
ffmpeg -y -f image2 -i %02d.jpg -r 15 -filter:v setpts=2.5*PTS -vcodec libx264 output.mp4
`

- f is a setup like in the input files
- i %02d.jpg are input files with a dynamic name format (01.jpg, 02.jpg, and so on)
- filter:v setpts=2.5*PTS – increasing the duration of each frame by 2,5

To optimize the user experience we currently create an actual video file at the stage of saving and sharing a video so that a user doesn’t have to wait for a video to be processed. Before that, we work with photos which get stored in RAM and then drawn on the TextureView canvas.

```java
private long drawGif(long startTime) {
        Canvas canvas = null;
        try {
            if (currentFrame >= gif.getFramesCount()) {
                currentFrame = 0;
            }
            Bitmap bitmap = gif.getFrame(currentFrame++);
            if (bitmap == null) {
                handler.notifyError();
                return startTime;
            }

            destRect(frameRect, bitmap.getWidth(), bitmap.getHeight());

            canvas = lockCanvas();

            canvas.drawBitmap(bitmap, null, frameRect, framePaint);

            handler.notifyFrameAvailable();

            if (showFps) {
                canvas.drawBitmap(overlayBitmap, 0, 0, null);
                frameCounter++;
                if ((System.currentTimeMillis() - startTime) >= 1000) {
                    makeFpsOverlay(String.valueOf(frameCounter) + "fps");
                    frameCounter = 0;
                    startTime = System.currentTimeMillis();
                }
            }
        } catch (Exception e) {
            Timber.e(e, "drawGif failed");
        } finally {
            if (canvas != null) {
                unlockCanvasAndPost(canvas);
            }
        }

        return startTime;
    }
public class GifViewThread extends Thread {

        public void run() {
            long startTime = System.currentTimeMillis();
            try {
                if (isPlaying()) {
                    gif.initFrames();
                }
            } catch (Exception e) {
                Timber.e(e, "initFrames failed");
            } finally {
                Timber.d("Loading bitmaps in " + (System.currentTimeMillis() - startTime) + "ms");
            }
            long drawTime = 0;
            while (running) {
                if (paused) {
                    try {
                        Thread.sleep(10);
                    } catch (InterruptedException ignored) {}
                    continue;
                }
                if (surfaceDone && (System.currentTimeMillis() - drawTime) > FRAME_RATE) {
                    startTime = drawGif(startTime);
                    drawTime = System.currentTimeMillis();
                }
            }
        }
    }
```

[Video](https://youtu.be/ZiHdOYAk15U)

##The rest of the features

We used ffmpeg to implement all the remaining functions, such as looping music over video, cropping video, and adding a watermark for uploading videos to Instagram, Facebook, and other social media outlets.

Now as I’ve been working on this video project for about 9 months I can say that working with ffmpeg is quite easy if you have some experience. For example, a command that loops an audio track over video looks like this:

`
ffmpeg -y -ss 00:00:00.00 -t 00:00:02.88 -i input.mp4 -ss 00:00:00.00 -t 00:00:02.88 -i tune.mp3 -map 0:v:0 -map 1:a:0 -vcodec copy -r 30 -b:v 2100k -acodec aac -strict experimental -b:a 48k -ar 44100 output.mp4
`

- y means that you can rescript files without sending a request
- ss 00:00:00.00 is the time at which to start video processing in a given case
- t 00:00:02.88 is the time by which to continue processing of the input file
- i input.mp4 is the input video-file
- i tune.mp3 is the input audio-file
- map is mapping of video and audio channel
- vcodec is a video-codec setup (in a our case we use the same codec with which the video was encoded)
- r is a frame rate setup
- b:v is bitrate setup for a video channel
- acodec is audio-codec setup (in our case we use AAC encoding)
- ar is a sample rate of the audio channel
- b:a is a bitrate of the audio channel
- output.mp4 is a resulting video file
​
The command for adding a watermark and video cropping:

`
ffmpeg -y -i input.mp4 -strict experimental -r 30 -vf movie=watermark.png, scale=1280*0.1094:720*0.1028 [watermark]; [in][watermark] overlay=main_w-overlay_w:main_h-overlay_h, crop=in_w:in_w:0:in_h*in_h/2 [out] -b:v 2100k -vcodec mpeg4 -acodec copy output.mp4
`

- movie=watermark.png – specifies a watermark image location
- scale=1280*0.1094:720*0.1028 – specifying a watermark size
- [in][watermark] overlay=main_w-overlay_w:main_h-overlay_h, crop=in_w:in_w:0:in_h*in_h/2 [out] – adding a watermark and cropping the video

It’s been a long time since we began developing our video recording application, and we’re now fully equipped with the knowledge to implement video recording functionality in our future projects. Here are some things that we’re still working to implement:

1. Making our own ffmpeg wrapper and using it at the JNI level which will allow us to increase performance, improve flexibility, and decrease the total weight of the library (because not all modules of ffmpeg are actually needed for the project).

2. Applying our own filters for recorded gifs and videos.

As you’re reading this, we’re getting closer to our goals.