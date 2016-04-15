[原文链接](http://www.developerphil.com/parcelable-vs-serializable/)

> Parcelable vs Serializable

当你开始写android时，我们所学到的是不能直接向Activities和Fragments传递对象，我们不得不借助Intent或者Bundle来传递它们。

当我们看api文档的时候，我们认识到有两种选择，我们的对象要么是Parcelable或者Serializable型，作为一个java开发者，我们已经知道Serializable的机制，那为什么还要去研究Parcelable呢？

为了回答这个问题，我们来看两个方法。

####Serializable，简洁的鼻祖####

```java
// access modifiers, accessors and constructors omitted for brevity
public class SerializableDeveloper implements Serializable
    String name;
    int yearsOfExperience;
    List<Skill> skillSet;
    float favoriteFloat;

    static class Skill implements Serializable {
        String name;
        boolean programmingRelated;
    }
}

```

仅仅需要在它和它的子类上实现Serializable接口就能完成一个漂亮的Serializable功能，他是一个标记接口，意味着不需要实现任何方法，java虚拟机将简单高效地完成序列化工作。

这里面有个问题就是这种序列化是通过反射机制从而削弱了性能，这种机制也创建了大量的临时对象从而引起GC频繁回收调用资源。

####Parcelable, 速度之王####
```java
// access modifiers, accessors and regular constructors ommited for brevity
class ParcelableDeveloper implements Parcelable {
    String name;
    int yearsOfExperience;
    List<Skill> skillSet;
    float favoriteFloat;

    ParcelableDeveloper(Parcel in) {
        this.name = in.readString();
        this.yearsOfExperience = in.readInt();
        this.skillSet = new ArrayList<Skill>();
        in.readTypedList(skillSet, Skill.CREATOR);
        this.favoriteFloat = in.readFloat();
    }

    void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeInt(yearsOfExperience);
        dest.writeTypedList(skillSet);
        dest.writeFloat(favoriteFloat);
    }

    int describeContents() {
        return 0;
    }


    static final Parcelable.Creator<ParcelableDeveloper> CREATOR
            = new Parcelable.Creator<ParcelableDeveloper>() {

        ParcelableDeveloper createFromParcel(Parcel in) {
            return new ParcelableDeveloper(in);
        }

        ParcelableDeveloper[] newArray(int size) {
            return new ParcelableDeveloper[size];
        }
    };

    static class Skill implements Parcelable {
        String name;
        boolean programmingRelated;

        Skill(Parcel in) {
            this.name = in.readString();
            this.programmingRelated = (in.readInt() == 1);
        }

        @Override
        void writeToParcel(Parcel dest, int flags) {
            dest.writeString(name);
            dest.writeInt(programmingRelated ? 1 : 0);
        }

        static final Parcelable.Creator<Skill> CREATOR
            = new Parcelable.Creator<Skill>() {

            Skill createFromParcel(Parcel in) {
                return new Skill(in);
            }

            Skill[] newArray(int size) {
                return new Skill[size];
            }
        };

        @Override
        int describeContents() {
            return 0;
        }
    }
}
```
按照google工程师的说话，这段代码将跑起来非常快，其中一个原因是运用真实的序列化处理代替反射，为了完成这个目的代码也做了大量的优化。

然而，显而易见的是实现Parcelable接口并不是无成本的，创建了大量的引入代码从而导致整个类变得很重同时加大了维护成本。

####Speed Tests####

当然，我们想知道Parcelable到底有多快

测试步骤
1：模拟这个操作通过Bundle的writeToParcel（Parcel, int）向Activity传递对象，然后观察它。
2：循环这个操作1000次。
3：大概模拟10次，观察内存回收情况，以及app的cpu使用率，等等。
4：这个被测试的对象分别是SerializableDeveloper和ParcelableDeveloper。
5：在多种机型和版本上做测试
LG Nexus 4 - Android 4.2.2 
Samsung Nexus 10 - Android 4.2.2
HTC Desire Z - Android 2.3.3

测试结果：
![这里写图片描述](http://img.blog.csdn.net/20160318115133497)

Nexus 10

Serializable: 1.0004ms,  Parcelable: 0.0850ms - 10.16x improvement.

Nexus 4

Serializable: 1.8539ms - Parcelable: 0.1824ms - 11.80x improvement.

Desire Z

Serializable: 5.1224ms - Parcelable: 0.2938ms - 17.36x improvement.

分析：
Parcelable比Serializable速度快10倍，在Nexus 10测试过程中得到了有趣的结果，仅仅通过1毫秒就完成了整个的序列化与反序列化过程。

总结：
假如你想成为一个好的码农，找个时间替换成Parcelable吧，他将提高十倍的速度并且用更少的资源。

然而，在大部分的案例里，这种缓慢的Serializable序列化过程并没有被注意到，有时候仅仅是为了成本比较低才会使用它但是要记住Serialization是要付出很大的代价的，所以还是尽量少使用这种方式。

假如你想传递成百上千的序列化对象，整个序列化的过程可能会超过一秒，当你对手机屏幕进行横竖屏切换将感觉有点延迟。
