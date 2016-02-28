IndeterminateProgressbar解析 – Part 1
---

> * 原文链接 : [Indeterminate – Part 1](https://blog.stylingandroid.com/indeterminate-part-1/)
* 原文作者 : [Mark Allison](https://blog.stylingandroid.com/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [desmond1121](https://github.com/desmond1121) 
* 状态 :  完成 




IndeterminateProgressBar 能在用户进行某项不定时长的耗时操作时提供绝佳的用户体验，之前我有教过大家怎么创建[水平的 IndeterminateProgressBar](http://blog.csdn.net/u012403246/article/details/49582789)，今天我就来教大家实现圆形的 IndeterminateProgressBar，这个控件将支持 API 11（Honeycomb）以上的设备。

这系列博文将有别于传统的自定义控件方法，而是从 Lollipop+ 提供的 API 实现去理解其运作机制，最后我会将从中学习到的知识应用到开发中，创造一个在低版本设备中效果类似的控件。

在开始研究之前可以看看我们期望实现的效果：

[Youtube视频](https://youtu.be/g6Zo6WDS2Gg)

所以我们要做的就是：进度条在旋转，然后由长变短最后消失，再出现，由短变长。不妨看看[ Google 的实现](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/drawable/progress_medium_material.xml)：

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

在这里他们使用了 AnimatedVectorDrawable - Lollipop+ 才有的特性，在低版本设备中将使用 Holo 风格的 drawable 资源。因此这个效果应用了两个动画 - 一个完成进度条长度变化，另一个完成旋转，[具体实现](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/drawable/vector_drawable_progress_bar_medium.xml)可以参考：

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

我不想在这里解释 pathData，但它确实绘制了一个圆。但控件不会被渲染成一个圆，因为 trimPath 相关的值都为 0（其实是因为 trimPathEnd="0"，使得 Path 起点处的绘制被停止）。

值得一提的是 path 的命名及其成员元素都与 Animator 关联并应用于 AnimatedVectorDrawable。旋转 Animator 也被应用到其中（在这里都是很常见的方法，所以我不打算过多地解释，有兴趣的话可以[看这里](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/anim/progress_indeterminate_rotation_material.xml)）。但用于进度条长度变化的 Aniamtor 值得学习：

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

在这里用了三个 Animator，三者并行运行动画效果，且每一个修改 path 元素中 trimPath 前缀的值，最终就实现了我们想要的效果。

其中第一和第二个 ObjectAnimator 控制圆的起点和终点，绘制出两点间的圆弧。所以当我们以不同的速率改变这两个 Animator 的值时，就会得到我们所说的变长变短的效果。除了应用的插值器，它们对应的参数都是相同的不同。

第三个 Animator 用于显示间距，以显示长度变化时，长度渐变消失的效果。

关注我的读者都知道我很喜欢用插值器，因为它们实在是太好用了！在下一篇博文中我会解释其中的细节。

因为这篇博文都是基于[ Google 源码](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/res/res/anim/progress_indeterminate_rotation_material.xml)进行的，所以我就不提供源码了，但后面的文章我保证都会有源码！