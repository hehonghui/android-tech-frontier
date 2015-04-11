深入了解Android Graphics Pipeline-part-2
---

>
* 原文链接 : [Android Graphics Pipeline: From Button to Framebuffer (Part 2)](https://blog.inovex.de/android-graphics-pipeline-from-button-to-framebuffer-part-2/)
* 作者 : [Mathias Garbe](https://blog.inovex.de/author/mgarbe/)
* 译者 : [chaossss](https://github.com/chaossss) 
* 校对者: [Mr.Simple](https://github.com/bboyfeiyu)  
* 状态 :  完成 




在上一篇博文中，我们图文结合介绍了 Android 怎么把 onDraw() 方法的 Java 代码转换为 Native 层的 C/C++ 代码。而今天，我们会承接上一篇博文讲的内容，继续探索 Android 在 Native 层是如何通过 C/C++ 代码绘制屏幕上的各种元素（控件、动画等）。在开始讲解之前，我需要提前提醒大家：要深入到 Native 层中研究 C/C++ 代码对 Java 代码的实现，意味着我们从此刻开始要忘掉 Java 安逸的垃圾回收机制，并忍受 C/C++ 代码带来的各种令人蛋疼的内存管理问题。不过大家不必惶恐，我会尽可能简单地讲解今天的内容，而且只会展示与我们今天的内容有关的有趣代码。

## 绘制元素 ##

在 Android 4.3 之前，UI 的绘制流程和将 UI 元素添加到相应 View 层级的顺序相同，并将它们添加到 display list 中。但这里存在一个很严重的问题，这样的渲染流程会不断进入 GPU 最糟糕的使用场景，原因在于：这样的绘制流程会导致在绘制不同的控件时，需要不断地切换状态。举例来说吧，我们现在要绘制两个 Button，那么 GPU 就需要先绘制第一个 Button 的背景和文字，绘制完成后再对第二个 Button 做同样的操作，渲染流程结束后，至少进行了三次的状态改变。

## 重新设计绘制流程 ##

所以为了最小化状态切换带来的 GPU 开销，Android 基于 UI 元素的类型和状态重新设计了相应的绘制流程。不过在接着讲解之前我们要暂时放下“界面中只有一个 Button ”的例子，并随便找一个 Activity 先进行相关知识的介绍。

![](https://blog.inovex.de/wp-content/uploads/2015/03/merging-layout-anot-300x215.png)

> 示例 Activity 包含了许多重叠的元素，我们这样做的目的是：通过使用极端的例子模拟各种可能出现的情况，解释为什么绘制时会产生这些问题，以及对应的解决策略。

如你所见，简单地根据 UI 的元素类型重新设计绘制流程在大多数情况下都不能满足我们的需求，原因在于：无论是先绘制所有文字，再绘制图片；还是先绘制图片，再绘制文字，都不能获得我们我们真正想要的 UI，因为总有一些该显示的 UI 元素会因为绘制顺序被挡住，我相信任何一个有品位的 UI 设计师都不会接受这样的客户端。

为了能正确地渲染示例 Activity 的 UI，UI 中的文字元素 A 和 B 必须先被绘制，然后绘制图片元素 C，最后是文字元素 D。由于 A 和 B 是同类型的元素，所以我们可以同时进行 A 和 B的绘制，但 C 和 D 只能按照顺序绘制，不然又会产生 UI 元素的覆盖问题。

为了更好地优化 UI 每一个 View 层级的绘制流程，在重新设计了绘制顺序后，就要将类似的绘制操作合并。合并在 DeferredDisplayList 中执行，给这个函数取这个名字是因为绘制操作没有按序执行，而是在所有操作的分析，重排序，合并完成前，不断地延迟其绘制动作，直到分析，重排序，合并完成才按序绘制。

由于每一个 display list 的绘制操作只能用于绘制它自身，如果一个操作支持把相同类型的元素的多个操作合并，那这个操作必须能被用于绘制多个具有相同类型的不同页面。但你需要注意的是，这不意味每一个操作都能进行合并，在新的设计里还留有许多只能重排序的操作。

![](https://blog.inovex.de/wp-content/uploads/2015/03/canvas-drawdisplaylist-1024x594.png)

OpenGLRenderer 是 Skia 2D 图像绘制 API 的一个接口，与常见的接口不同，它不需要利用 CPU 进行硬件加速，而是用 OpenGL 完成了所有硬件加速的工作。虽然有很多办法能完成这样的工作，但是 OpenGLRenderer 是第一个用 C++ 实现的本地类。OpenGLRenderer 在 Android 3.0 中被提出，设计它主要是让它和 GLES20Canvas 协作，绘制我们想要的界面元素。有趣的是，在界面绘制的操作中，只有它们是以协作的形式进行的。

为了把多个操作合并到一个绘制操作中，每一个操作都通过调用 addDrawOp() 方法被添加到 deferred display list 中。同时，绘制操作还需要提供 batchId，因为绘制操作必须知道这个类型的操作能否被合并，此外，绘制操作还需要通过调用 DrawOp.onDefer(...) 方法提供 mergeId,以指明哪些操作已经被合并.

一般 batchId 包含了一个简单的枚举，主要是为 9-Patch 图片元素提供 OpBatch_Patch，并为普通的文字元素提供 OpBatch_Text。mergeId 的值由 DrawOpitself 决定，用于判断两个具有相同的 DrawOp 类型的操作能否被合并。对 9-Patch 图片元素来说，mergeId 用于指向图片资源文件，对文字元素来说，则是对应的文字颜色。来自同一个资源文件夹的资源文件可能会被合并到同一个 batch 中，帮助我们大量地节约绘制流程带来时间开销。

有关一个操作的所有信息都被归并到一个简单的结构中，代码如下：

```java
	struct DeferInfo {
	    // Type of operation (TextView, Button, etc.)
		// batchId 注明被操作的 UI 元素的类型（如 TextView，Button等……）
	    int batchId;
	 
	    // State of operation (Text size, font, color, etc.)
	    // mergeId 注明被操作的 UI 元素的状态（如 文字大小，字体，文字颜色等……）
	    mergeid_t mergeId;
	 
	    // Indicates if operation is mergable
	    // 标记操作是否可被合并
	    bool mergeable;
	};
```

当一个绘制操作的 batchId 和 mergeId 被确定，如果它还没有被合并，就会被添加到 batch 队列的尾部。如果没有可用的 batch，我们就会创建一个新的 batch。不过一般情况下，这些绘制操作都是可以合并的。为了知道每一个最近合并的 batch 的去向，我们会通过一个简化的算法调用 MergeBatches 的实例 hashmap，用 batchId 构建键值对保存相应的 batch。对每一个 batch 使用 hashmap 能避免使用 mergeId 导致的冲突。

```java
	vector<DrawBatch> batches;
	Hashmap<MergeId, DrawBatch*> mergingBatches[BatchTypeCount];
	 
	void DeferredDisplayList::addDrawOp(DrawOp op):
	    DeferInfo info;
	    /* DrawOp fills DeferInfo with its mergeId and batchId */
	    /* DrawOp 方法用 mergeId 和 batchId 填充 DeferInfo */
	    op.onDefer(info);
	 
	    if(/* op is not mergeable */):
	        /* Add Op to last added Batch with same batchId, if first
	           op then create a new Batch */
	        /* 将 Op 添加到最后被添加入元素的 Batch 中，但这个 Batch 必须与 Op 具有相同 batchId，此外，如果 op 是 Batch 中的第一个元素，那么需要新建一个 Batch */

	        return; 
	 
	    DrawBatch batch = NULL;
	    if(batches.isEmpty() == false):
	        batch = mergingBatches[info.batchId].get(info.mergeId);
	        if(batch != NULL && /* Op can merge with batch */):
	            batch.add(op);
	            mergingBatches[info.batchId].put(info.mergeId, batch);
	            return;
	 
	        /* Op can not merge with batch due to different states,
	           flags or bounds */
	        /* 如果 Op 与 Batch 具有不同的状态，标记，和边界，那么 Op 将无法被合并到 Batch 中 */

	        int newBatchIndex = batches.size();
	        for(overBatch in batches.reverse()):
	            if (overBatch == batch):
	                /* No intersection as we found our own batch */
	                /* Batch 之间应该没有交集 */

	                break;
	 
	            if(overBatch.batchId  == info.batchId):
	                /* Save position of similar batches to insert 
	                   after (reordering) */
	                /* 在重排序后保存 batchId 相同的 batch 中对应的位置，便于后面插入元素 */

	                newBatchIndex == iterationIndex;
	 
	            if(overBatch.intersects(localBounds)):
	                /* We can not merge due to intersection */
	                /* 如果 Batch 间产生了交集，我们不能进行合并 */

	                batch = NULL
	                break;
	 
	    if(batch == NULL):
	        /* Create new Batch and add to mergingBatches */
	        /* 如果 batch 为空，则创建一个新的 batch，并将它添加到 mergingBatches 中 */

	        batch = new DrawBatch(...);
	        mergingBatches[deferInfo.batchId].put(info.mergeId, batch);
	        batches.insertAt(newBatchIndex, batch);
	    batch.add(op);
```

如果当前操作能够与其他具有相同 mergeId 和 batchId 的操作合并，那么这个操作和下一个可以合并的操作都会被添加到现有的 batch 中。但如果它因为状态不一致、绘制标记或边界限制无法被合并，算法就需要将它插入到一个新的 batch 中。为了实现这样的需求，我们则需要获得 batch 队列中所有 batch 对应的 postion。理想情况下，它能在当前绘制操作中找到一个和它状态相同的 batch。不过需要注意的是，在这个绘制操作中为它找到合适的位置的过程中，也必须保证它和其他 batch 没有交集。因此，batch 列表都以逆序寻找一个合适的位置，并确认对应的位置与其他元素没有交集。如果出现了交集，那么对应操作则不能被合并，并需要在这个位置创建一个新的 DrawBatch，并将其插入 Mergebatchedhaspmap。新的 batch 会被添加到 batch 队列的相应位置中。无论发生什么，改操作都会被加入到当前的 batch 中，区别在于：是在新的 batch 还是已存在的 batch 中。

具体的实现会比我们的简化讲解更复杂（虽然我们这里讲的也很难懂……）。但其中优化的方法值得我们学习：算法通过移除堵塞的绘制操作尽可能地避免重绘，同时通过对为合并的操作进行重排序，从而避免 GPU 状态改变带来的开销。

## 绘制界面 ##

在重排序和合并后，新的 deferred display list 终于可以被绘制到屏幕上了。

![](https://blog.inovex.de/wp-content/uploads/2015/03/ddl-flush.png)

在 OpenGLRenderers::drawDisplayList(…) 方法里，deferred display list 其实就是一个填满了操作的新建普通显示列表，填充完成后延迟显示页面将绘制它自身。

**OpenGLRenderer: drawDisplayList(…)**

```java
	status_t OpenGLRenderer::drawDisplayList(
	               DisplayList* displayList, Rect& dirty,
	               int32_t replayFlags) {
	    // All the usual checks and setup operations 
	    // (quickReject, setupDraw, etc.)
	    // will be performed by the display list itself
	    // 所有的常规检查与创建操作（例如 quickReject, setupDraw 等等）都会由 display list 完成

	    if (displayList && displayList->isRenderable()) {
	        DeferredDisplayList deferredList(*(mSnapshot->clipRect));
	        DeferStateStruct deferStruct(
	            deferredList, *this, replayFlags);
	        displayList->defer(deferStruct, 0);
	        return deferredList.flush(*this, dirty);
	    }
	    return DrawGlInfo::kStatusDone;
	}
```

multiDraw(…) 方法会在列表中的第一个操作中被调用，而其他的操作都被视作参数。被调用的操作负责立刻绘制所有被提供的操作，并调用 OpenGLRenderer 执行绘制其自身的操作。

## 显示列表中的操作 ##

每一个绘制操作都会在拥有对应显示操作列表的 Canvas 里被执行，所有显示操作列表必须实现重载了绘制操作的 replay() 方法。这些绘制操作调用 OpenGLRenderer 去绘制他们，当我们创建一个操作时需要提供一个 renderer 的引用。除此以外，我们还需要实现 onDefer() 方法，并返回操作的 drawId 和 mergeId。为合并的 batch 会设置相应的绘制 id 为 kOpBatch_None。可合并的操作必须实现用于立刻绘制所有已合并的操作的 multiDraw() 方法。

例如，绘制 9-Patch 的操作包含了下列 multiDraw(…) 实现：

**DrawPatchOp::multiDraw(…)**

```java
	virtual status_t multiDraw(OpenGLRenderer& renderer, Rect& dirty,
	        const Vector<OpStatePair>& ops, const Rect& bounds) {
	 
	    // Merge all 9-Patche vertices and texture coordinates 
	    // into one big vector
	    // 将所有 9-Patche 图片的顶点坐标和纹理坐标合并到一个矢量中

	    Vector<TextureVertex> vertices;
	    for (unsigned int i = 0; i < ops.size(); i++) {
	        DrawPatchOp* patchOp = (DrawPatchOp*) ops[i].op;
	        const Patch* opMesh = patchOp->getMesh(renderer);
	        TextureVertex* opVertices = opMesh->vertices;
	        for (uint32_t j = 0; j < opMesh->verticesCount; 
	             j++, opVertices++) {
	            vertices.add(TextureVertex(opVertices->position[0], 
	                                       opVertices->position[1],
	                                       opVertices->texture[0], 
	                                       opVertices->texture[1]));
	        }
	    }
	 
	    // Tell the renderer to draw multipe textured polygons
	    // 让渲染器绘制具有多种纹理的多边形
	    return renderer.drawPatches(mBitmap, getAtlasEntry(),
	                        &vertices[0], getPaint(renderer));
	}
```

9-Patch 图片的 batchId 总是常量 kOpBatch_Patch，而 mergeId 则是指向图片的指针，因此，所有使用了相同图片的 9-Patch 对象都能够被合并为一个。此外，这种特性对我们使用资源文件里的图片非常有帮助，因为现在 Android 框架层所有经常被使用的 9-Patch 图片都可以根据其相同的纹理合并到同一个地方存储、使用。

## 纹理贴图集 ##

Android 的起始进程 Zygote 总会预加载一些与所有进程共享的资源文件，这些资源文件夹包含了频繁被使用的那些 9-Batch 图片和 Android 控件使用的图片。但在 Android 4.4 之前，每一个进程在 GPU 内存中都拥有这些资源文件的独立拷贝。从 Android 4.4 开始，这些频繁被使用的资源文件则被打包到一个纹理贴图集，随后传输到 GPU 内存中，并共享于所有进程之中。在这些操作完成之后才有可能对标准 Android 框架中的 9-Patch 和 Drawable资源文件进行合并。

![](https://blog.inovex.de/wp-content/uploads/2015/03/atlas.png)

> 系统产生的纹理贴图集是为了减少切换纹理带来的 GPU 负荷。

刚刚那张图展示了 Nexus 7 在 Android 4.4 系统下生成的纹理贴图集，图集中包含了所有频繁被使用的 Android 框架层图像资源，如果你看得仔细，你会发现 9-Patch 文件没有突出布局和间距区域的边界，而原始的资源文件在系统启动之初则进行了解析，不过它们之后也不会被用于绘制，所以我们也不用在意。

在 Android 进行系统更新后，系统第一次进行引导时（或者每一次进行引导时）， AssetAtlasService 都会重新生成纹理贴图集，并在之后的每一次重新启动过程中再次使用它，直到 Android 更新的内容被应用于系统中。

为了生成纹理贴图集，service 组件会强行搜查各种图集配置，想尽千方百计找到那个能穿上水晶鞋的贴图集配置，那么什么样的贴图集配置是最好的呢？答案是：纹理资源最丰富，且纹理尺寸最小。原因在于：我们所获得的配置信息，会被写入到 /data/system/framework_atlas.config 中，此外，无论元素是否允许旋转，是否添加了间距，配置信息中都包含了我们选择的算法和尺寸大小。完成上述操作后，配置信息就会在之后的每一次重新启动过程中被应用，生成纹理贴图集。之后，系统会分配一个 RGBA8888 的图形缓存区，通过使用 Skiabitmap 将 资源纹理贴图集和所有资源文件绘制到这个缓存区中。经过上述繁复的操作后，资源纹理贴图集将在 AssetAtlasService 组件整个生命周期中有效，只有在系统自身被关闭时才会被释放。

为了真正把所有资源文件打包到一个图集中，AssetAtlasService 会从打包空白纹理开始。在将第一个资源文件放入之后，剩下的空间将会被切分成两个矩形区域。然后利用我们在配置信息中选择的算法，可以将这两个区域分别作为水平方向和垂直方向的视图处理区域。而空白纹理之后的纹理资源文件将会被添加到足以存放它的第一个区域中。而这个区域会再次被切分成两个区域，把下一个资源文件添加到相应区域后再次切分，循环往复。可能有人会问了，这样难道不会因为迭代操作使得时间开销很大吗？不用担心，AssetAtlasService 同时使用多个线程并行操作，使得时间开销被大大减少。

当一个新的 App 被创建，它的硬件渲染器需要 AssetAtlasService 为它提供相应的纹理贴图，并且当渲染器每一次需要绘制 bitmap 或者 9-Patch 图片，它都会先检查它的贴图集。

## 字体的缓存与绘制 ##

为了合并包含文字的 View 的绘制操作，一个简单的方法就是缓存字体。但与纹理贴图集的操作方法相反，字体集是每一个 App 或字体独有的。但由于字体的颜色会被应用到 shader 中，因此 Android 不会将文字颜色添加到字体集中。

![](https://blog.inovex.de/wp-content/uploads/2015/03/font-300x167.png)

> 左边：字体集由字体渲染器生成；右边：用 CPU 生成的几何体渲染字符

就算你只是瞥一眼字体集，你都会注意到只有一部分字符被绘制，如果你看得认真一些，你会注意到只有被使用的字符才会被绘制出来（没有重复的字符）！如果你看到这里在想 Android 支持多少种语言，抑或是支持多少种字符，那只缓存被使用的字符确实是最优解。又因为 Actionbar 和 Button 使用着相同的字体，那么它们俩使用的所有字符都能被合并到一种纹理中。

为了将相应的文字绘制到视图中，渲染器需要在一块拥有边界的纹理区域中生成一个几何体。几何体由 CPU 生成后通过 OpenGL 的 glDrawElements() 命令绘制，如果设备支持 OpenGL ES 3.0,字体渲染器会异步更新字体的纹理缓存，并将其上传到框架的入口，即 GPU 仍接近处于闲置状态时，进行这样的操作能够为每一个框架的加载节省下宝贵的时间。为了实现异步上传，纹理缓存会被实现为 OpenGL 的像素缓存对象。

## OpenGL ##

在博文的前言阶段我曾许下承诺：我会结合部分原生的 OpenGL 绘制命令讲解博文中的知识。那么现在，就是我兑现诺言的时刻了。从此刻开始，我会用 OpenGL 的绘制 log 讲解之前的简单示例 Activity（只有一个 Button 的那个例子！）

```shell
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0])
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 0)
	
	glGenBuffers(n = 1, buffers = [3])
	
	glBindBuffer(target = GL_ELEMENT_ARRAY_BUFFER, buffer = 3)
	
	glBufferData(target = GL_ELEMENT_ARRAY_BUFFER, size = 24576, data = [ 24576 bytes ], usage = GL_STATIC_DRAW)
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0xbefdcf18)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0xbefdcf20)
	
	glVertexAttribPointerData(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 48)
	
	glVertexAttribPointerData(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 48)
	
	glDrawElements(mode = GL_MAP_INVALIDATE_RANGE_BIT, count = 72, type = GL_UNSIGNED_SHORT, indices = 0x0)
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 2)
	
	glBufferSubData(target = GL_ARRAY_BUFFER, offset = 768, size = 576, data = [ 576 bytes ])
	
	glDisable(cap = GL_BLEND)
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 33.0, 0.0, 1.0])
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x300)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x308)
	
	glDrawElements(mode = GL_MAP_INVALIDATE_RANGE_BIT, count = 54, type = GL_UNSIGNED_SHORT, indices = 0x0)
	
	eglSwapBuffers()
```

你可以在博文的结尾看到完整的绘制 log

## 结论 ##

两篇超简单的博文看下来，Android 如何在 display list 中通过一系列的命令对 View 层的操作进行重排序和合并，如何在底层中执行这些命令，我相信没人会不懂了吧！（有人懂才怪呢 XD～）

结合两篇博文的知识储备，我们重新回去分析之前的示例 App：App 中 View 的整个渲染流程其实只有5步：

![](https://blog.inovex.de/wp-content/uploads/2015/03/one-button-all-1024x180.png)

1. 布局绘制其背景图片，也就是我们的线性布局。

2. ActionBar 和 Button 的 9-Patch 图片文件均被绘制，这两个操作被合并到一个 batch 中，因为它俩的 9-Patch 被用在相同的纹理区域中。

3. 为 Actionbar 绘制一个线性布局。

4. 同时绘制 Button 和 ActionBar 中的文字，因为这两个 View 使用了相同的字体，使得字体渲染器能够使用相同的字体纹理，因此能合并两个文字绘制操作。

5. 应用图标绘制完成。

就像你看到的，我们深入解析了绘制 View 层的操作是如何在底层与 OpenGL 命令一一对应的，这个系列的博文也算是得到了一个完美的收尾了。

## Download ##

文章中引用的论文可以下载，[链接在此](http://mathias-garbe.de/files/introduction-android-graphics.pdf)

## 完整 Log ##

**Display List**

Shell

```shell
	Start display list (0x5ea4f008, PhoneWindow.DecorView, render=1)
	  Save 3
	  ClipRect 0.00, 0.00, 720.00, 1184.00
	  SetupShader, shader 0x5ea5af08
	  Draw Rect    0.00    0.00  720.00 1184.00
	  ResetShader
	  Draw Display List 0x5ea64d30, flags 0x244053
	  Start display list (0x5ea64d30, ActionBarOverlayLayout, render=1)
	    Save 3
	    ClipRect 0.00, 0.00, 720.00, 1184.00
	    Draw Display List 0x5ea5ad78, flags 0x24053
	    Start display list (0x5ea5ad78, FrameLayout, render=1)
	      Save 3
	      Translate (left, top) 0, 146
	      ClipRect 0.00, 0.00, 720.00, 1038.00
	      Draw Display List 0x5ea59bf8, flags 0x224053
	      Start display list (0x5ea59bf8, RelativeLayout, render=1)
	        Save 3
	        ClipRect 0.00, 0.00, 720.00, 1038.00
	        Save flags 3
	        ClipRect   32.00   32.00  688.00 1006.00
	        Draw Display List 0x5cfee368, flags 0x224073
	        Start display list (0x5cfee368, Button, render=1)
	          Save 3
	          Translate (left, top) 32, 32
	          ClipRect 0.00, 0.00, 243.00, 96.00
	          Draw patch    0.00    0.00  243.00   96.00
	          Save flags 3
	          ClipRect   24.00    0.00  219.00   80.00
	          Translate by 24.000000 23.000000
	          Draw Text of count 12, bytes 24
	          Restore to count 1
	        Done (0x5cfee368, Button)
	        Restore to count 1
	      Done (0x5ea59bf8, RelativeLayout)
	    Done (0x5ea5ad78, FrameLayout)
	    Draw Display List 0x5ea64ac8, flags 0x24053
	    Start display list (0x5ea64ac8, ActionBarContainer, render=1)
	      Save 3
	      Translate (left, top) 0, 50
	      ClipRect 0.00, 0.00, 720.00, 96.00
	      Draw patch    0.00    0.00  720.00   96.00
	      Draw Display List 0x5ea64910, flags 0x224053
	      Start display list (0x5ea64910, ActionBarView, render=1)
	        Save 3
	        ClipRect 0.00, 0.00, 720.00, 96.00
	        Draw Display List 0x5ea63790, flags 0x224053
	        Start display list (0x5ea63790, LinearLayout, render=1)
	          Save 3
	          Translate (left, top) 17, 0
	          ClipRect 0.00, 0.00, 265.00, 96.00
	          Draw Display List 0x5ea5fe80, flags 0x224053
	          Start display list (0x5ea5fe80, 
	                              ActionBarView.HomeView, render=1)
	            Save 3
	            ClipRect 0.00, 0.00, 80.00, 96.00
	            Draw Display List 0x5ea5ed00, flags 0x224053
	            Start display list (0x5ea5ed00, ImageView, render=1)
	              Save 3
	              Translate (left, top) 8, 16
	              ClipRect 0.00, 0.00, 64.00, 64.00
	              Save flags 3
	              ConcatMatrix 
	                [0.67 0.00 0.00] [0.00 0.67 0.00] [0.00 0.00 1.00]
	              Draw bitmap 0x5d33ae70 at 0.000000 0.000000
	              Restore to count 1
	            Done (0x5ea5ed00, ImageView)
	          Done (0x5ea5fe80, ActionBarView.HomeView)
	          Draw Display List 0x5ea63618, flags 0x224053
	          Start display list (0x5ea63618, LinearLayout, render=1)
	            Save 3
	            Translate (left, top) 80, 23
	            ClipRect 0.00, 0.00, 185.00, 49.00
	            Save flags 3
	            ClipRect    0.00    0.00  169.00   49.00
	            Draw Display List 0x5ea634a0, flags 0x224073
	            Start display list (0x5ea634a0, TextView, render=1)
	              Save 3
	              ClipRect 0.00, 0.00, 169.00, 49.00
	              Save flags 3
	              ClipRect    0.00    0.00  169.00   49.00
	              Draw Text of count 9, bytes 18
	              Restore to count 1
	            Done (0x5ea634a0, TextView)
	            Restore to count 1
	          Done (0x5ea63618, LinearLayout)
	        Done (0x5ea63790, LinearLayout)
	      Done (0x5ea64910, ActionBarView)
	    Done (0x5ea64ac8, ActionBarContainer)
	    Draw patch    0.00  146.00  720.00  178.00
	  Done (0x5ea64d30, ActionBarOverlayLayout)
	Done (0x5ea4f008, PhoneWindow.DecorView)
```

**OpenGL**

```shell
	eglCreateContext(version = 1, context = 0)
	
	eglMakeCurrent(context = 0)
	
	glGetIntegerv(pname = GL_MAX_TEXTURE_SIZE, params = [2048])
	
	glGetIntegerv(pname = GL_MAX_TEXTURE_SIZE, params = [2048])
	
	glGetString(name = GL_VERSION) = OpenGL ES 2.0 14.01003
	
	glGetIntegerv(pname = GL_MAX_TEXTURE_SIZE, params = [2048])
	
	glGenBuffers(n = 1, buffers = [1])
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 1)
	
	glBufferData(target = GL_ARRAY_BUFFER, size = 64, data = [64 bytes], 
	             usage = GL_STATIC_DRAW)
	
	glDisable(cap = GL_SCISSOR_TEST)
	
	glActiveTexture(texture = GL_TEXTURE0)
	
	glGenBuffers(n = 1, buffers = [2])
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 2)
	
	glBufferData(target = GL_ARRAY_BUFFER, size = 131072, data = 0x0, 
	             usage = GL_DYNAMIC_DRAW)
	
	glGetIntegerv(pname = GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS,
	              params = [16])
	
	glGetIntegerv(pname = GL_MAX_TEXTURE_SIZE, params = [2048])
	
	glGenTextures(n = 1, textures = [1])
	
	glBindTexture(target = GL_TEXTURE_2D, texture = 1)
	
	glEGLImageTargetTexture2DOES(target = GL_TEXTURE_2D, 
	                             image = 2138532008)
	
	glGetError(void) = (GLenum) GL_NO_ERROR
	
	glDisable(cap = GL_DITHER)
	
	glClearColor(red = 0,000000, green = 0,000000, blue = 0,000000, 
	             alpha = 0,000000)
	
	glEnableVertexAttribArray(index = 0)
	
	glDisable(cap = GL_BLEND)
	
	glGenTextures(n = 1, textures = [2])
	
	glBindTexture(target = GL_TEXTURE_2D, texture = 2)
	
	glPixelStorei(pname = GL_UNPACK_ALIGNMENT, param = 1)
	
	glTexImage2D(target = GL_TEXTURE_2D, level = 0, 
	             internalformat = GL_ALPHA, width = 1024, height = 512, 
	             border = 0, format = GL_ALPHA, type = GL_UNSIGNED_BYTE, 
	             pixels = [])
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MIN_FILTER, 
	                param = 9728)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MAG_FILTER, param = 9728)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_S, param = 33071)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_T, param = 33071)
	glViewport(x = 0, y = 0, width = 800, height = 1205)
	
	glPixelStorei(pname = GL_UNPACK_ALIGNMENT, param = 1)
	
	glTexSubImage2D(target = GL_TEXTURE_2D, level = 0, xoffset = 0, yoffset = 0, width = 1024, height = 80, format = GL_ALPHA, type = GL_UNSIGNED_BYTE, pixels = 0x697b7008)
	
	glInsertEventMarkerEXT(length = 0, marker = Flush)
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 0)
	
	glBindTexture(target = GL_TEXTURE_2D, texture = 1)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_S, param = 33071)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_T, param = 33071)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MIN_FILTER, param = 9729)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MAG_FILTER, param = 9729)
	
	glCreateShader(type = GL_VERTEX_SHADER) = (GLuint) 1
	
	glShaderSource(shader = 1, count = 1, string = attribute vec4 position;
	
	attribute vec2 texCoords;
	
	uniform mat4 projection;
	
	uniform mat4 transform;
	
	varying vec2 outTexCoords;
	 
	void main(void) {
	    outTexCoords = texCoords;
	    gl_Position = projection * transform * position;
	}
	 
	, length = [0])
	glCompileShader(shader = 1)
	
	glGetShaderiv(shader = 1, pname = GL_COMPILE_STATUS, params = [1])
	
	glCreateShader(type = GL_FRAGMENT_SHADER) = (GLuint) 2
	
	glShaderSource(shader = 2, count = 1, string = precision mediump float;
	 
	varying vec2 outTexCoords;
	uniform sampler2D baseSampler;
	 
	void main(void) {
	    gl_FragColor = texture2D(baseSampler, outTexCoords);
	}
	 
	, length = [0])
	glCompileShader(shader = 2)
	
	glGetShaderiv(shader = 2, pname = GL_COMPILE_STATUS, params = [1])
	
	glCreateProgram(void) = (GLuint) 3
	
	glAttachShader(program = 3, shader = 1)
	
	glAttachShader(program = 3, shader = 2)
	
	glBindAttribLocation(program = 3, index = 0, name = position)
	
	glBindAttribLocation(program = 3, index = 1, name = texCoords)
	
	glGetProgramiv(program = 3, pname = GL_ACTIVE_ATTRIBUTES, params = [2])
	
	glGetProgramiv(program = 3, pname = GL_ACTIVE_ATTRIBUTE_MAX_LENGTH, params = [10])
	
	glGetActiveAttrib(program = 3, index = 0, bufsize = 10, length = [0], size = [1], type = [GL_FLOAT_VEC4], name = position)
	
	glGetActiveAttrib(program = 3, index = 1, bufsize = 10, length = [0], size = [1], type = [GL_FLOAT_VEC2], name = texCoords)
	
	glGetProgramiv(program = 3, pname = GL_ACTIVE_UNIFORMS, params = [3])
	
	glGetProgramiv(program = 3, pname = GL_ACTIVE_UNIFORM_MAX_LENGTH, params = [12])
	
	glGetActiveUniform(program = 3, index = 0, bufsize = 12, length = [0], size = [1], type = [GL_FLOAT_MAT4], name = projection)
	
	glGetActiveUniform(program = 3, index = 1, bufsize = 12, length = [0], size = [1], type = [GL_FLOAT_MAT4], name = transform)
	
	glGetActiveUniform(program = 3, index = 2, bufsize = 12, length = [0], size = [1], type = [GL_SAMPLER_2D], name = baseSampler)
	
	glLinkProgram(program = 3)
	
	glGetProgramiv(program = 3, pname = GL_LINK_STATUS, params = [1])
	
	glGetUniformLocation(program = 3, name = transform) = (GLint) 2
	
	glGetUniformLocation(program = 3, name = projection) = (GLint) 1
	
	glUseProgram(program = 3)
	
	glGetUniformLocation(program = 3, name = baseSampler) = (GLint) 0
	
	glUniform1i(location = 0, x = 0)
	
	glUniformMatrix4fv(location = 1, count = 1, transpose = false, value = [0.0025, 0.0, 0.0, 0.0, 0.0, -0.001659751, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, -1.0, 1.0, -0.0, 1.0])
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [800.0, 0.0, 0.0, 0.0, 0.0, 1205.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0])
	glEnableVertexAttribArray(index = 1)
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x681e7af4)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x681e7afc)
	
	glVertexAttribPointerData(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 4)
	
	glVertexAttribPointerData(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 4)
	
	glDrawArrays(mode = GL_TRIANGLE_STRIP, first = 0, count = 4)
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 2)
	
	glBufferSubData(target = GL_ARRAY_BUFFER, offset = 0, size = 576, data = [ 576 bytes ])
	
	glBufferSubData(target = GL_ARRAY_BUFFER, offset = 576, size = 192, data = [ 192 bytes ])
	
	glEnable(cap = GL_BLEND)
	
	glBlendFunc(sfactor = GL_SYNC_FLUSH_COMMANDS_BIT, dfactor = GL_ONE_MINUS_SRC_ALPHA)
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0])
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 0)
	
	glGenBuffers(n = 1, buffers = [3])
	
	glBindBuffer(target = GL_ELEMENT_ARRAY_BUFFER, buffer = 3)
	
	glBufferData(target = GL_ELEMENT_ARRAY_BUFFER, size = 24576, data = [ 24576 bytes ], usage = GL_STATIC_DRAW)
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0xbefdcf18)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0xbefdcf20)
	
	glVertexAttribPointerData(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 48)
	
	glVertexAttribPointerData(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 48)
	
	glDrawElements(mode = GL_MAP_INVALIDATE_RANGE_BIT, count = 72, type = GL_UNSIGNED_SHORT, indices = 0x0)
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 2)
	
	glBufferSubData(target = GL_ARRAY_BUFFER, offset = 768, size = 576, data = [ 576 bytes ])
	
	glDisable(cap = GL_BLEND)
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 33.0, 0.0, 1.0])
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x300)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x308)
	
	glDrawElements(mode = GL_MAP_INVALIDATE_RANGE_BIT, count = 54, type = GL_UNSIGNED_SHORT, indices = 0x0)
	
	glEnable(cap = GL_BLEND)
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0])
	
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 0)
	
	glBindTexture(target = GL_TEXTURE_2D, texture = 2)
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x696bd008)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x696bd010)
	
	glVertexAttribPointerData(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 80)
	
	glVertexAttribPointerData(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x??, minIndex = 0, maxIndex = 80)
	
	glDrawElements(mode = GL_MAP_INVALIDATE_RANGE_BIT, count = 120, type = GL_UNSIGNED_SHORT, indices = 0x0)
	
	glGenTextures(n = 1, textures = [3])
	
	glBindTexture(target = GL_TEXTURE_2D, texture = 3)
	
	glPixelStorei(pname = GL_UNPACK_ALIGNMENT, param = 4)
	
	glTexImage2D(target = GL_TEXTURE_2D, level = 0, internalformat = GL_RGBA, width = 64, height = 64, border = 0, format = GL_RGBA, type = GL_UNSIGNED_BYTE, pixels = 0x420cd930)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MIN_FILTER, param = 9728)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_MAG_FILTER, param = 9728)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_S, param = 33071)
	
	glTexParameteri(target = GL_TEXTURE_2D, pname = GL_TEXTURE_WRAP_T, param = 33071)
	
	glUniformMatrix4fv(location = 2, count = 1, transpose = false, value = [64.0, 0.0, 0.0, 0.0, 0.0, 64.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 16.0, 38.0, 0.0, 1.0])
	glBindBuffer(target = GL_ARRAY_BUFFER, buffer = 1)
	
	glVertexAttribPointer(indx = 0, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x0)
	
	glVertexAttribPointer(indx = 1, size = 2, type = GL_FLOAT, normalized = false, stride = 16, ptr = 0x8)
	
	glBindBuffer(target = GL_ELEMENT_ARRAY_BUFFER, buffer = 0)
	
	glDrawArrays(mode = GL_TRIANGLE_STRIP, first = 0, count = 4)
	
	glGetError(void) = (GLenum) GL_NO_ERROR
	
	eglSwapBuffers()
```



