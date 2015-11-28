高性能ListViews
---

> * 原文链接 : [Performance ListViews](http://willowtreeapps.com/blog/performance-listviews/?utm_source=Android+Weekly&utm_campaign=038d344835-Android_Weekly_178&utm_medium=email&utm_term=0_4eb677ad19-038d344835-337955857)
* 原文作者 : [作者](作者的博客或者其他社交页面)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [liuling07](https://github.com/liuling07) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成 

Lists can be seen in almost any app. It’s an easy way to show items such as recipes, contacts, or any type of category really. It only makes sense that Android should have a built-in way to show this type of data representation. The latest implementation is the RecyclerView. It’s built for efficiency as it reuses views instead of recreating them every time a row comes on screen. Before the  RecyclerView we had the ListView, which is still used widely today. While the ListView also recycles views, it continues to hold a place as one of the most misconfigured views in Android today. We know this topic has been written about many times before, but we’re bringing it up on the blog today because we still get many applicants who configure them incorrectly.

列表展示功能几乎在所有app中都会被用到，使用列表可以让我们很方便的展示一些列表项，比如菜谱、联系人，或者任意类型的类别。Android应该有一个内置的方式来显示此类型的数据的表示，这是很有意义的。RecyclerView是最新的一种实现方式，它非常高效，因为它重用视图而不是每一行出现在屏幕上都重新创建。在RecyclerView出现之前，我们可以使用ListView，即使到了现在，ListView也是广泛的被开发者所使用。然而ListView也是可以回收视图的，但它也一直都是Android中最容易被错误使用的一个控件。我知道在此之前这个话题已经被写过无数遍了，但是今天我还是要在博客中提出来，因为我们仍然发现很多app在错误的使用它们。

Here is what the standard novice ArrayAdapter for a ListView looks like:

下面是关于ListView中ArrayAdapter的使用的标准新手写法：

```
@Override
public View getView(int position, View convertView, ViewGroup parent) {

    LayoutInflater inflater = (LayoutInflater) context
            .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    View rowView = inflater.inflate(R.layout.view_test_row, parent, false);

    TextView testName = (TextView)rowView.findViewById(R.id.text_view_test_name);
    TextView testDesc = (TextView)rowView.findViewById(R.id.text_view_test_desc);

    //modify TextViews, in some arbitrary way

    return rowView;
}
```

Writing an AdapterView this way is not an issue when your list can be shown on the screen all at once, but then you could have created a basic view and avoided the hassle of an ArrayAdapter altogether right? When using a ListView we plan on showing a large list, often one with complex views. This is where performance takes a hit. The above way is costly to performance. When a user scrolls, each view is inflating and calling findViewById() every time. When findViewById() is called, the View Hierarchy is traversed until the proper Id is found. It does this for each sub-view you have to find! And the quicker the user scrolls, the more noticeable the sluggishness of the scrolling becomes. To remedy this, we can use a static class in combination with the convertView that we didn’t use earlier.

当所有列表项都能够一次性在一屏中显示的时候，这种写法并没有什么问题，但这样你就创建了一个基本视图，并完全避免了ArrayAdapter的麻烦了吗？当ListView需要显示一个很大的列表集，而且列表子项是一个非常复杂的视图的时候，上面的方式会消耗大量的性能。当用户滑动屏幕的时候，每个视图都会被inflat并且调用findViewById()方法。当findViewById()方法被调用的时候，会遍历整个视图层级，直到正确的Id被找到。每个子视图都要执行上述过程！并且用户滑动的越快，卡顿现象愈加明显。为了解决这个问题，我们可以使用一个静态类与还没被使用的convertView绑定。

```
static class ViewHolder(){

        TextView testName;
        TextView testDesc;
        
}

@Override
 public View getView(int position, View convertView, ViewGroup parent) {

    View rowView = convertView;  //reference to one of the previous Views in the list that we can reuse.

    if(convertView == null) {

        LayoutInflater inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        rowView = inflater.inflate(R.layout.view_test_row, parent, false);

        ViewHolder viewHolder = new ViewHolder();
        viewHolder.testName = (TextView) rowView.findViewById(R.id.text_view_test_name);
        viewHolder.testDesc = (TextView) rowView.findViewById(R.id.text_view_test_desc);

        rowView.setTag(viewHolder);
    }

    ViewHolder holder = (ViewHolder) rowView.getTag();
    
    //in real code these strings should be in res
    holder.testName.setText("Test"+position); 
    holder.testDesc.setText("This is number "+position);

    return rowView;
}
```

But what is the convertView ? Well, it allows the ListView to skip some of the setup needed to display the contents of a row. It is the view of a row that is now off the screen. We can reuse the view for the new row that will now be displayed. When the ListView is displayed in the beginning, everything happens like normal. Since there aren’t any views that can be reused, convertView is null. The view is inflated just like in our previous version, but the TextViews are found and the references are kept in a ViewHolder. We can then store the ViewHolder within the view by calling setTag(). This allows us to store data in the view which we can reference later, as shown in the latter half of the revised getView().

那么convertView是什么呢？它可以让ListView跳过一些显示一行内容所需要的设置。如果某一行的视图不在屏幕中显示，我们可以重复使用这个视图来显示一个新行。当ListView刚开始显示的时候，一切都是正常的。既然没有视图可以被用来复用，convertView为空。视图也像前面版本一样被inflate，但是TextViews会被找到且它的引用被保存在一个ViewHolder中。然后我们可以调用setTag()方法将ViewHolder存储在视图中。正如修订过后的getView()方法中后半段代码所示，我们可以在视图中存储后面我们需要用到的数据。

The changes we made might not seem like a huge impact, but as our views become more complicated and the number of them grows, inefficiencies will become noticeable. The last thing we want to do as developers is create an app with a negative user experience. Remember, just one sub-par ListView could be the life or death of an app, so let’s not take the chance!

我们所做的更改可能看起来并没有太大的效果，但是随着布局越来越复杂并且数量也越来越多，效果将变得越来越明显。作为开发者，我最不想做的事就是开发一个用户体验很差的app。所以请记住，仅仅一个低水平的ListView都有可能让一个app死掉，我们一定得避免这种情况发生。