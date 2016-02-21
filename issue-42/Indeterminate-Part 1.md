Indeterminate – Part 1
---

> * 原文链接 : [Indeterminate – Part 1](https://blog.stylingandroid.com/indeterminate-part-1/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: 
* 状态 :  完成 



Indeterminate ProgressBars are a useful tool for communicating to our users that an operation is in progress when we cannot predict how long it is likely to take. Previously on Styling Android we’ve covered how to create a backwardly compatible approximation of the material styled horizontal indeterminate ProgressBar but we haven’t looked at the circular form – in this series we’ll create an approximation of the material circular indeterminate ProgressBar which will be backwardly compatible to API 11 (Honeycomb).

 
This series is going to be slightly different to the normal structure on Styling Android. Initially we’re actually going to take a dive in to the Lollipop+ implementation of this control to understand precisely how it works – which is rather interesting. Then we’ll apply that knowledge and create a backwardly compatible version that is actually pretty close IMO.

Before we begin let’s just take a look at what we’re trying to achieve:

[Youtube视频](https://youtu.be/g6Zo6WDS2Gg)

So it’s a section of a circle which sweeps round suddenly while the whole thing is rotating. Let’s look at how this is actually implemented by looking at the AOSP code at https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/drawable/progress_medium_material.xml:

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Copyright (C) 2014 The Android Open Source Project
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@drawable/vector_drawable_progress_bar_medium" >
    <target
        android:name="progressBar"
        android:animation="@anim/progress_indeterminate_material" />
    <target
        android:name="root"
        android:animation="@anim/progress_indeterminate_rotation_material" />
</animated-vector>
```

It’s no great surprise that an AnimatedVectorDrawable is used here – this is for Lollipop+, after all and a holo drawable will be used when running on older devices. So this applies two different animations – one to achieve the sweep effect, and the other to perform the overall rotation. This is performed on [res/drawable/vector_drawable_progress_bar_medium.xml](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/drawable/vector_drawable_progress_bar_medium.xml):

```xml
<!--
 Copyright (C) 2014 The Android Open Source Project
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:height="48dp"
        android:width="48dp"
        android:viewportHeight="48"
        android:viewportWidth="48"
        android:tint="?attr/colorControlActivated">
    <group
        android:name="root"
        android:translateX="24.0"
        android:translateY="24.0" >
        <path
            android:name="progressBar"
            android:fillColor="#00000000"
            android:pathData="M0, 0 m 0, -19 a 19,19 0 1,1 0,38 a 19,19 0 1,1 0,-38"
            android:strokeColor="@color/white"
            android:strokeLineCap="square"
            android:strokeLineJoin="miter"
            android:strokeWidth="4"
            android:trimPathEnd="0"
            android:trimPathOffset="0"
            android:trimPathStart="0" />
    </group>
</vector>
```

I’m not going to do dive in to the pathData here, but this path essentially describes a circle. However nothing will actually be rendered because of the trimPath* values (actually because trimPathEnd="0" stop the path drawing at the beginning of the path).

It is worth noting the named of the path and group elements which tie in to the animators that get applied to them in the AnimatedVectorDrawable that we’ve already looked at. The rotation Animator gets applied to the group (and this is actually pretty standard stuff, so we won’t go in to any detail here – look at the AOSP source if you’re interested). But the Animators which apply the sweep animations are rather more interesting:

```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
 Copyright (C) 2014 The Android Open Source Project
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<set xmlns:android="http://schemas.android.com/apk/res/android" >
    <objectAnimator
        android:duration="1333"
        android:interpolator="@interpolator/trim_start_interpolator"
        android:propertyName="trimPathStart"
        android:repeatCount="-1"
        android:valueFrom="0"
        android:valueTo="0.75"
        android:valueType="floatType" />
    <objectAnimator
        android:duration="1333"
        android:interpolator="@interpolator/trim_end_interpolator"
        android:propertyName="trimPathEnd"
        android:repeatCount="-1"
        android:valueFrom="0"
        android:valueTo="0.75"
        android:valueType="floatType" />
    <objectAnimator
        android:duration="1333"
        android:interpolator="@android:anim/linear_interpolator"
        android:propertyName="trimPathOffset"
        android:repeatCount="-1"
        android:valueFrom="0"
        android:valueTo="0.25"
        android:valueType="floatType" />
</set>
```

There are three Animators here which will run in parallel each one will alter one of the trimPath* attributes of the path element in our. For a recap on how we can achieve some interesting effects with trimPath take a look at .

It is the first two which control the start and end points on the circle and an arc will be rendered between these points. So by varying them at different rates over the duration of the Animator the desired “sweep” effect will be achieved. But the parameters for both are almost identical with the exception of the interpolator being applied.

The third animator is actually performing an offset of everything and its precise role in all of this will become clearer later on in the series when we actually come to roll our own implementation.

Regular readers of Styling Android will know that I love interpolators and these ones are particularly interesting. We’ll cover these in detail in the next article.

As this series is initially an exploration of AOSP code there is no accompanying source code. Yet. It will come later in the series, I promise!