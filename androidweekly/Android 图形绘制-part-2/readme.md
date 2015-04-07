`这里写中文标题`
---

>
* 原文链接 : [Android Graphics Pipeline: From Button to Framebuffer (Part 2)](https://blog.inovex.de/android-graphics-pipeline-from-button-to-framebuffer-part-2/)
* 译者 : [chaossss](https://github.com/bboyfeiyu) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 




Last time, we took a thorough look at how Android converts the Java-Side onDraw() method into a native display list on the CSide. This time we will take a look at how Android is drawing these display lists to the screen. We are now leaving the comfortable realm of garbage-collected Java and entering the dark and scary dungeon which is called C++. But don’t worry, we’ll keep it quite simple and only show relevant and interesting code bits.

在上一篇博文中，我们图文结合介绍了 Android 中通过 Java 使用的 onDraw() 方法在 Native 层的 C/C++ 代码中调用了哪些函数。而今天，我们会承接上一篇博文讲的内容，继续探索 Android 在 Native 层是如何通过 C/C++ 代码绘制屏幕上的各种元素（控件、动画等）。在开始讲解之前，我需要先提醒大家：要深入到 Native 层中研究 C/C++ 代码对 Java 代码的实现，意味着我们从此刻开始要忘掉 Java 安逸的垃圾回收机制，并忍受 C/C++ 代码各种令人蛋疼的内存管理问题。不过大家不必惶恐，我会尽可能简单地讲解今天的内容，而且只会展示与我们今天的内容有关的有趣代码。

## Drawing the display list ##

## 绘制元素 ##

Before Android 4.3, rendering operations of the UI were executed in the same order the UI elements are added to the view hierarchy and therefore added to the resulting display list. This can result in the worst case scenario for GPUs, as they must switch state for every element. For example, when drawing two buttons, the GPU needs to draw the NinePatch and text for the first button, and then the same for the second button, resulting in at least 3 state changes.

在 Android 4.3 之前，UI 的绘制流程和将 UI 元素添加到相应的 View 层级的顺序相同，因为这样能按照我们的设计展现 UI。但这里存在一个很严重的问题，这样的渲染流程会不断进入最糟糕的 GPU 使用场景，原因在于：这样的绘制流程会导致在绘制不同的控件时，需要为不同的控件不断地切换状态。举例来说吧，我们现在要绘制两个 Button，那么 GPU 就需要先绘制第一个 Button 的背景和文字，绘制完成后再对第二个 Button 做同样的操作，这样的渲染流程下来，至少进行了三次的状态改变。

## Reordering and merging of operations ##

## 重新设计绘制流程 ##

So in order to minimize the expansive state changes, Android is reordering all drawing operations based on their type and state attributes. We are leaving our example application with only one button for a moment and are now looking at a fully arbitrary activity:

所以为了最小化状态切换带来的 GPU 开销，Android 基于 UI 元素的类型和状态重新设计了相应的绘制流程。不过在接着讲解之前我们要暂时放下“界面中只有一个 Button ”的例子，并随便找一个 Activity 先进行相关知识的介绍。

![](https://blog.inovex.de/wp-content/uploads/2015/03/merging-layout-anot-300x215.png)
> Example Activity with overlapping elements, carefully chosen to illustrate possible problems when reordering drawing operations.

> 范例 Activity 包含了许多重叠的元素，我们这样做的目的是：通过使用极端的例子模拟各种可能出现的情况，并解释为什么绘制时会产生这些问题，以及如何解决它。

As seen in image above, a simple approach to reordering and merging by type is not sufficient in most cases. Drawing all text elements and then the bitmap (or the other way around) does not result in the same final image as it would without reordering, which is clearly not acceptable.

如你所见，简单地根据 UI 的元素类型重新设计绘制流程在大多数情况下都不能满足我们的需求。如果先绘制所有文字，再绘制图片（或者先绘制图片，再绘制文字）都不能获得我们我们真正想要的 UI，因为总有一些该显示的 UI 元素会因为绘制顺序被挡住，我相信任何一个有品位的 UI 设计师都不会接受这样的客户端。

In order to correctly render the example activity, text elements A and B have to be drawn first, followed by the bitmap C, followed by the text element D. The first two text elements could be merged into one operation, but the text element D cannot, as it would be overlapped by the bitmap.

为了能正确地渲染范例 Activity，UI 中的文字元素 A 和 B 必须先被绘制，然后绘制图片元素 C，最后是文字元素 D。由于 A 和 B 是同类型的元素，所以我们可以先绘制 A 和 B，而 C 和 D 只能按照顺序绘制了，不然的话又会产生覆盖问题。

To further reduce the drawing time needed for a view hierarchy, most operations can be merged after they have been reordered. This happens in the DeferredDisplayList, so-called because the execution of the drawing operations does not happen in order, but is deferred until all operations have been analyzed, reordered and merged.

为了更好地优化 UI 每一个 View 层级的绘制流程，在重新设计了绘制顺序后，就要将类似的绘制操作合并。合并在 DeferredDisplayList 中执行，给这个函数取这个名字是因为绘制操作没有按序执行，而是在所有操作的分析，重排序，合并完成前，不断地延迟其绘制动作，直到分析，重排序，合并完成才按序绘制。

Because every display list operation is responsible for drawing itself, an operation that supports the merging of multiple operations with the same type must be able to draw multiple, different operations in one draw call. Not every operation is capable of merging, so some can only be reordered.

由于每一个页面的绘制操作只能用于绘制它自身，如果一个操作支持把相同类型的元素的多个操作合并，那这个操作必须能被用于绘制多个具有相同类型的不同页面。但你需要注意的是，这不意味每一个操作都能进行合并，在新的设计里还留有许多只能重排序的操作。

![](https://blog.inovex.de/wp-content/uploads/2015/03/canvas-drawdisplaylist-1024x594.png)

The OpenGLRenderer is an implementation of the Skia 2D drawing API, but instead of utilizing the CPU it does all the drawing hardware accelerated with OpenGL. On the way trough the pipeline, this is the first native-only class implemented in C++. The renderer is designed to be used with the GLES20Canvas and was introduced with Android 3.0. It is only used in conjunction with display lists.

OpenGLRenderer 是 Skia 2D 图像绘制 API 的一个接口，与常见的接口不同，它不需要利用 CPU 进行硬件加速，而是用 OpenGL 完成了所有硬件加速的工作。虽然有很多办法能完成这样的工作，但是 OpenGLRenderer 是第一个用 C++ 实现的本地类。OpenGLRenderer 在 Android 3.0 中被提出，设计它主要是让它和 GLES20Canvas 协作，绘制我们想要的界面元素。有趣的是，在界面绘制的操作中，只有它们是以协作的形式进行的。

To merge multiple operations to one draw call, each operation is added to the deferred display list by calling addDrawOp(DrawOp). The drawing operation is asked to supply the  batchId, which indicates the type of the operation it can be merged with, and the mergeIdwhich indicates the merged operations, by calling DrawOp.onDefer(...).

为了把多个操作合并到一个绘制操作中，每一个操作都通过调用 addDrawOp() 方法被添加到一个延缓显示队列中。同时，绘制操作还被要求提供 batchId，因为绘制操作必须知道这个类型的操作能否被合并，此外，绘制操作还需要通过调用 DrawOp.onDefer(...) 方法提供 mergeId,以指明哪些操作已经被合并.

Possible batchIds include OpBatch_Patch for a 9-Patch and OpBatch_Text for a normal text element. These are defined in a simple enum. The mergeId is determined by each DrawOpitself, and is used to decide if two operations of the same DrawOp type can be merged. For a 9-Patch, the mergeId is a pointer to the asset atlas (or bitmap), for a text element it is the paint color. Multiple drawables from the same asset atlas texture can potentially be merged into one batch, resulting in a greatly reduced rendering time.

All information about an operation is collected into a simple struct:

一般 batchId 包含了一个简单的枚举，主要是为 9-Patch 图片元素提供 OpBatch_Patch，并为普通的文字元素提供 OpBatch_Text。mergeId 的值由 DrawOpitself 决定，用于判断两个具有相同的 DrawOp 类型的操作能否被合并。对 9-Patch 图片元素来说，mergeId 用于指向图片资源文件，对文字元素来说，则是对应的文字颜色。来自同一个资源文件夹的资源文件可能会被合并到同一个 batch 中，帮助我们大量地节约绘制流程带来时间开销

```java
	struct DeferInfo {
	    // Type of operation (TextView, Button, etc.)
	    int batchId;
	 
	    // State of operation (Text size, font, color, etc.)
	    mergeid_t mergeId;
	 
	    // Indicates if operation is mergable
	    bool mergeable;
	};
```

After the batchId and mergeId  of an operation are determined, it will be added to the last batch if it is not mergeable. If no batch is already available, a new batch will be created. The more likely case is that the operation is mergeable. To keep track of all recently merged batches, a hashmap for each batchId is used which is called MergeBatches in the simplified algorithm. Using one hashmap for each batch avoids the need to resolve collisions with the  mergeId.

当一个绘制操作的 batchId 和 mergeId 被确定，如果它还没有被合并，就会被添加到 batch 队列的尾部。如果没有 batch 是可用的，那么我们就会创建一个新的 batch。不过一般情况下这些绘制操作都是可以合并的。为了知道每一个最近合并的 batch 的去向，我们会通过一个简化的算法调用 MergeBatches 的实例 hashmap，用 batchId 构建键值对保存相应的 batch。对每一个 batch 使用 hashmap 能避免使用 mergeId 导致的冲突。

```java
	vector<DrawBatch> batches;
	Hashmap<MergeId, DrawBatch*> mergingBatches[BatchTypeCount];
	 
	void DeferredDisplayList::addDrawOp(DrawOp op):
	    DeferInfo info;
	    /* DrawOp fills DeferInfo with its mergeId and batchId */
	    op.onDefer(info);
	 
	    if(/* op is not mergeable */):
	        /* Add Op to last added Batch with same batchId, if first
	           op then create a new Batch */
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
	        int newBatchIndex = batches.size();
	        for(overBatch in batches.reverse()):
	            if (overBatch == batch):
	                /* No intersection as we found our own batch */
	                break;
	 
	            if(overBatch.batchId  == info.batchId):
	                /* Save position of similar batches to insert 
	                   after (reordering) */
	                newBatchIndex == iterationIndex;
	 
	            if(overBatch.intersects(localBounds)):
	                /* We can not merge due to intersection */
	                batch = NULL
	                break;
	 
	    if(batch == NULL):
	        /* Create new Batch and add to mergingBatches */
	        batch = new DrawBatch(...);
	        mergingBatches[deferInfo.batchId].put(info.mergeId, batch);
	        batches.insertAt(newBatchIndex, batch);
	    batch.add(op);
```

If the current operation can be merged with another operation of the same mergeId  and  batchId, the operation is added to the existing batch and the next operation can be added. But if it cannot be merged due to different states, drawing flags or bounding boxes, the algorithm needs to insert a new merging batch. For this to happen, the position inside the list of all batches ( Batches) needs to be found. In the best case, it would find a batch that shares the same state with the current drawing operation. But it is also essential that the operation does not intersect with any other batches in the process of finding a correct spot. Therefore, the list of all batches is iterated over in reverse order to find a good position and to check for intersections with other elements. In case of an intersection, the operation cannot be merged and a new DrawBatch is created and inserted into the MergeBatcheshashmap. The new batch is added to Batches at the position found earlier. In any case, the operation is added to the current batch, which can be a new or an existing batch.

如果当前操作能够与其他具有相同 mergeId 和 batchId 的操作合并，那么这个操作和下一个可以合并的操作都会被添加到现有的 batch 中。但如果它由于状态不一致、绘制标记或边界限制无法被合并，算法就需要将它插入到一个新的 batch 中。为了实现这样的需求，我们则需要获得 batch 队列中所有 batch 对应的 postion。理想情况下，它能在当前绘制操作中找到一个和它状态相同的 batch。不过需要注意的是，在这个绘制操作中为它找到合适的位置的过程中，也必须保证它和其他 batch 没有交集。因此，batch 列表都以逆序寻找一个合适的位置，并确认对应的位置与其他元素没有交集。如果出现了交集，那么对应操作则不能被合并，并需要在这个位置创建一个新的 DrawBatch，并将其插入 Mergebatchedhaspmap。新的 batch 会被添加到 batch 队列的相应位置中。无论发生什么，改操作都会被加入到当前的 batch 中，区别在于：是在新的 batch 还是已存在的 batch 中。

The actual implementation is more complex than the simplified version presented here. There are a few optimizations worth being mentioned. The algorithm is tries to avoid overdraw by removing occluded drawing operations, and also tries to to reorder non-mergeable operations to avoid GPU state changes.

具体的实现会比我们的简化讲解更复杂（虽然我们这里讲的也很难懂……）。但其中优化的方法值得我们学习：算法通过移除堵塞的绘制操作尽可能地避免重绘，同时通过对为合并的操作进行重排序，从而避免 GPU 状态改变带来的开销。

## Actually drawing the (deferred) display list ##

## 绘制界面 ##

After reordering and merging the new deferred display list can finally be drawn to the screen.

在重排序和合并后，新的延迟显示页面终于可以被绘制到屏幕上了。

![](https://blog.inovex.de/wp-content/uploads/2015/03/ddl-flush.png)

Inside the  OpenGLRenderers::drawDisplayList(…) method, the deferred display list is created filled with operations from the normal display list. The deferred display list is then asked to draw itself ( flush(…)).

在 OpenGLRenderers::drawDisplayList(…) 方法里，延迟显示页面其实就是一个填满了操作的新建普通显示列表，填充完成后延迟显示页面将绘制它自身。

**OpenGLRenderer: drawDisplayList(…)**

```java
	status_t OpenGLRenderer::drawDisplayList(
	               DisplayList* displayList, Rect& dirty,
	               int32_t replayFlags) {
	    // All the usual checks and setup operations 
	    // (quickReject, setupDraw, etc.)
	    // will be performed by the display list itself
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

The method multiDraw(…) will be called on the first operation in that list, with all the other operations as an argument. The called operation is responsible for drawing all supplied operations at once and will also call the OpenGLRenderer  to actually execute the operation itself.

multiDraw(…) 方法会在列表中的第一个操作中被调用，而其他的操作都被视作参数。被调用的操作负责立刻绘制所有被提供的操作，并调用 OpenGLRenderer 执行绘制其自身的操作。

## Display List Operations ##

## 显示列表中的操作 ##

Each drawing operation to be executed on a canvas has a corresponding display list operation. All display list operations must implement the replay() method, which executes the wrapped drawing operation. These drawing operations call the OpenGLRenderer to render themselves. The reference to the renderer needs to be supplied when creating an operation. onDefer() must also be implemented and must return the operation’s drawId and mergeId. Non-mergable batches are setting the draw id to kOpBatch_None. Mergable operations must implement the multiDraw() method, which is used when a whole batch of merged operations need to be rendered at once.

每一个绘制操作都会在拥有对应显示操作列表的 Canvas 里被执行，所有显示操作列表必须实现重载了绘制操作的 replay() 方法。这些绘制操作调用 OpenGLRenderer 去绘制他们，当我们创建一个操作时需要提供一个 renderer 的引用。除此以外，我们还需要实现 onDefer() 方法，并返回操作的 drawId 和 mergeId。为合并的 batch 会设置相应的绘制 id 为 kOpBatch_None。可合并的操作必须实现用于立刻绘制所有已合并的操作的 multiDraw() 方法。

For example, the operation to draw a 9-Patch (called DrawPatchOp) contains the following  multiDraw(…)  implementation:

例如，绘制 9-Patch 的操作包含了下列 multiDraw(…) 实现：

**DrawPatchOp::multiDraw(…)**

```java
	virtual status_t multiDraw(OpenGLRenderer& renderer, Rect& dirty,
	        const Vector<OpStatePair>& ops, const Rect& bounds) {
	 
	    // Merge all 9-Patche vertices and texture coordinates 
	    // into one big vector
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
	    return renderer.drawPatches(mBitmap, getAtlasEntry(),
	                        &vertices[0], getPaint(renderer));
	}
java

The batchId of a 9-Patch is always kOpBatch_Patch, the mergeId is a pointer to the used bitmap. Therefore, all patches that use the same bitmap can be merged together. This is even more important with the use of the asset atlas, as now all heavily used 9-Patches from the Android framework can potentially be merged together as the reside on the same texture.

Texture Atlas

The Android start-up process zygote always keeps a number of assets preloaded which are shared with all processes. These assets are containing frequently used 9-Patches and images for the standard Android framework widgets. But up until Android 4.4, every process was keeping a seperate copy of these assets on the GPU memory. Starting with Android 4.4 KitKat, these frequently used assets are now packed into a texture atlas, uploaded to the GPU and shared between all processes. Only then is merging of 9-Patches and other drawables from the standard framework possible.

The texture atlas generated by the system to reduce GPU stress caused by switching textures too often.
The texture atlas generated by the system to reduce GPU stress caused by switching textures too often.

The image above shows an asset atlas texture generated on a Nexus 7 (2013) running Android 4.4, which contains all frequently used framework assets. If you look closely, the 9-Patches do not feature the typical borders which indicate the layout and padding areas. The original asset files are still used to parse these areas on system start, but they are not used for rendering any longer.

When booting a system the first time after an Android update (or ever), the  AssetAtlasService is regenerating the texture atlas. This atlas is then used for all subsequent reboots, until a new Android update is applied.

To generate the atlas, the service brute-forces trough all possible atlas configurations and looks for the best one. The best configuration is determined by the maximum number of assets on the texture and the minimum texture size, which is then written to  /data/system/framework_atlas.config and contains the chosen algorithm, dimensions, whether rotations are allowed and whether padding has been added. This configuration is then used in subsequent reboots to regenerate the texture atlas. A RGBA8888 graphic buffer is allocated as the asset atlas texture and all assets are rendered onto it via the use of a temporary Skia bitmap. This asset atlas texture is valid for the lifetime of the  AssetAtlasService, only being deallocated when the system itself is shutting down.

To actually pack all assets into the atlas, the service starts with an empty texture. After placing the first asset, the remaining space is divided into two rectangular cells. Depending on the algorithm used, this split can either be horizontal or vertical. The next asset texture is added in the first cell that is large enough to fit. This now occupied cell will be split again and the next asset is processed. The  AssetAtlasService is using multiple threads to speed up the time it takes to iterate through all combinations.

When a new app is started, its HardwareRenderer queries the AssetAtlasService for this texture and every time the renderer needs to draw a bitmap or 9-Patch it will check the atlas first.

Font caching and rendering

In order to merge text views, a similar approach is used and a font cache is generated. But in contrast to the texture atlas, this font atlas is unique for each app and font type. The color of the font can be applied in a shader and is therefore not considered in the atlas.

Left: Font atlas generated by the font renderer. Right: Geometry generated on the CPU, used to render the characters.
Left: Font atlas generated by the font renderer. Right: Geometry generated on the CPU, used to render the characters.

If you take a quick glance at the font atlas, you will instantly see that only a few characters are present. When taking a closer look, you will see only the used characters! If you think about how many languages Android supports, and how many characters are supported, only caching the used ones makes perfectly good sense. And because the action bar and the button are using the same font, all characters from both text views can be merged onto one texture.

To draw the font to the screen, the renderer needs to generate a geometry to which the texture gets bound. The geometry is generated on the CPU and then drawn via the OpenGL command glDrawElements(). If the device supports OpenGL ES 3.0, the FontRenderer will update and upload the font cache texture asynchronously at the start of the frame, while the GPU is mostly idle, which saves precious milliseconds per frame. The cache texture is implemented as a OpenGL Pixel Buffer Object, which makes a asynchronous upload possible.

OpenGL

At the start of this mini-series I promised you some raw OpenGL drawing commands. So with no further ado I present you the (not quite complete) OpenGL drawing log for the button of our simple one-button activity:

Shell

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

The complete OpenGL draw call log can be seen at the end of this blog post.

Conclusion

We have seen how Android converts its view hierarchy to a series of render commands inside a display list, reorders and merges these commands and finally how these commands are executed.

Returning to our example activity with one button, the entire view can be rendered in just 5 steps:

Five Steps

The layout draws the background image, which is a linear gradient.
Both the ActionBar and Button background 9-Patches are drawn. These two operations were merged into one batch, as both 9-Patches are located on the same texture.
A linear gradient is drawn for the ActionBar.
Text for the Button and the ActionBar is drawn simultaneously. As these two views use the same font, the font rendere can use the same font texture and therefore merge the two operations.
The application’s icon is drawn.
And there you have it, we traced all the way from the view hierarchy to the final OpenGL commands, which concludes this mini-series.

Download

The full Bachelor’s Thesis on which this article is based is available for download.

Full Listings

Display List

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



