Android C++ 引用计数介绍, part 1
---

> * 原文链接 : [Introduction to Android C++ reference counting, part 1](http://pierrchen.blogspot.jp/2015/06/introduction-to-android-reference.html)
* 原文作者 : [Bin Chen](https://plus.google.com/+PierrChen/posts)
* [译文出自 :  开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 译者 : [BownX](https://github.com/BownX) 


任何一个基于Android 的native框架做开发的人都不可避免的会碰到一些几乎到处使用的native层C++工具类。`sp`(或者称为`StrongPointer`)，就是其中之一。了解它是如何工作非常重要，这样你才能更清晰的理解代码，并且写出精简、没有资源泄漏的代码。在这篇文章中，我们就要根据实例来了解`sp`的基本概念和使用方法。

```cpp
#include <utils/RefBase.h>
#include <utils/Log.h>
#include <cstdlib>
#include <cassert>

using namespace android;

// 我们自定义了一个 Memory 类继承自 RefBase [1]，以保证其拥有引用计数的能力，并且能被 sp<T> [2] 模板类接收，这里 sp 指的是强引用指针。
// [1]https://android.googlesource.com/platform/frameworks/native/+/jb-mr1-dev/include/utils/RefBase.h
// [2]https://android.googlesource.com/platform/frameworks/native/+/jb-mr1-dev/include/utils/StrongPointer.h

class Memory: public RefBase {
public:
    Memory(int size) : mSize(size), mData(NULL) {
        ALOGD("        Memory constructor %p ",this);
    }
    virtual ~Memory() {
        ALOGD("        Memory destructor %p", this);
        if (mData)  free(mData);
    }
    virtual void onFirstRef() {
        ALOGD("        onFirstRef on %p",this);
        mData = malloc(mSize);
    }
    int size() {return mSize;}
private:
    int mSize;
    void *mData;
};

// 用于输出标记log
#define L(N)   ALOGD("LINE %d TRIGGER:",N);
// 输出object的强引用数量
#define C(obj) ALOGD("        Count of %p : %d", (void*)obj, obj->getStrongCount());

int main()
{
    {
        // 创建一个 Memory 的实例，并且赋值给一个原始指针。
        L(1)
        Memory *m1 = new Memory(4);
        // 使用 sp(T* other) 构造函数创建一个强引用指针，这样会使 m1 的引用计数值加1，并且调用 m1::onFirstRef，这里你可以做一些延迟初始化操作。
        L(2)
        sp<Memory> spm1 = m1;
        C(m1);
        // 通常，我们会把上面两步合并为一行代码。
        // 然后我们创建另外一个强引用指针，spm2, 并且初始化。
        // 要拿到原始的object，可以使用 sp<T>::get() 方法。
        L(3)
        sp<Memory> spm2 = new Memory(128);
        Memory *m2 = spm2.get();
        // 要想调用原object中的方法，使用 sp 就像用原始指针一样方便。
        int size = spm2->size();
        // 创建第三个 sp, spm3, 这里会调用构造函数 sp(const sp<T>& other)，这样会使 spm1 的引用计数加1，现在 m1 被两个强引用指针指向，spm1 和 spm3。
        L(4)
        sp<Memory> spm3 = spm1;
        C(m1);
        // 下面这段代码和 L(4) 差不多，区别在于 spm4 的作用域被限制在一个代码块中。
        L(5)
        {
            sp<Memory> spm4 = spm1;
            C(m1);
            // 这里 m1 被 spm1, spm3 和 spm4 指向。
        }
        // 到了这里，spm4 离开了作用域被销毁，不再指向 m1，因此 m1 的引用数变回了2，既被 spm1 和 spm3 指向。
        L(6)
        C(m1);
        // trigger sp& operator = (const sp<T>& other);
        L(7)
        // 在下面这行赋值之前，spm2 指向 m2，smp3 指向 m1。
        spm3 = spm2;
        // 赋值之后， spm3 不再指向 m1 而是 指向 m2，因此 m1 的引用计数减1，m2 的加1。
        C(m1);
        C(m2);
        // spm5 是 spm1 的引用，没有新的对象创建，因此 m1 的引用计数没变。
        L(8)
        sp<Memory> &spm5 = spm1;
        C(m1);
        // 我们也可以创建一个智能指针初始为空，后续再赋值。我们也可以调用 sp::clear() 来显式的清除引用。
        L(9)
        sp<Memory> spm6;
        assert(spm6.get() == NULL);
        spm6 = spm1;
        C(m1);
        L(10)
        spm6.clear();
        assert(spm6.get() == NULL);
        C(m1);
    }
    // 上述代码块结束之后，所有的智能指针都脱离了作用域，因此它们都将会被销毁，并且触发它们各自指向的object的引用计数减1。例如，当 spm1 和 spm6 都销毁时，m1 的引用计数减到了0，然后将会触发 m1 的析构。
    L(-1)
    return 0;
}
```

下面是这个程序的输出。

```
LINE 1 TRIGGER:
        Memory constructor 0x558f06b050 
LINE 2 TRIGGER:
        onFirstRef on 0x558f06b050
        Count of 0x558f06b050 : 1
LINE 3 TRIGGER:
        Memory constructor 0x558f06b0c0 
        onFirstRef on 0x558f06b0c0
LINE 4 TRIGGER:
        Count of 0x558f06b050 : 2
LINE 5 TRIGGER:
        Count of 0x558f06b050 : 3
LINE 6 TRIGGER:
        Count of 0x558f06b050 : 2
LINE 7 TRIGGER:
        Count of 0x558f06b050 : 1
        Count of 0x558f06b0c0 : 2
LINE 8 TRIGGER:
        Count of 0x558f06b050 : 1
LINE 9 TRIGGER:
        Count of 0x558f06b050 : 2
LINE 10 TRIGGER:
        Count of 0x558f06b050 : 1
        Memory destructor 0x558f06b0c0
        Memory destructor 0x558f06b050
LINE -1 TRIGGER:
```

下一篇文章，我们会来研究一下循环引用的问题以及如何通过`弱引用指针`来处理它，也就是 Android 里所称呼的`wp`。
