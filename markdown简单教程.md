# 标题1，文章的第一句就是标题1

## 这是标题2，其他小标题按照层级划分
### 标题3
### 标题4

## 文字加粗
**hello**

## 引用
引用的格式为: >加上一个空格，然后加上文字内容。      
在一些注意点时，我们可以使用引用来引起读着的注意。例如 : 

> 注意 : 不能在子线程中更新UI。


## 换行

句尾有四个以上的空格代表换行。示例 :

**四个空格换行（注意句尾的空格）**       
这里是一行，重新换行。       
新的一行。


**回车换行**    
这里是一行，重新换行。

新的一行。

## 超链接
**格式1 :**      
[链接名](地址)

示例 :     
[www.baidu.com](www.baidu.com)

**格式2**      
[链接名][唯一标识]
[唯一标识]: url地址 

这种格式一般用在某段话中链接比较多的情况，为了保持原文简洁，将链接单独提出来。   

示例 :    
[开发技术前线][devtf]

[devtf]: http://www.devtf.cn 

## 代码

```java
public class Name {
	
}
```

适用于Android代码。需要注意的是开始处的```上面必须要有一个空行。

使用于iOS方面的代码 :    

```
let customPresentAnimationController = CustomPresentAnimationController()

override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
    if segue.identifier == "showAction" {
        let toViewController = segue.destinationViewController as UIViewController
        toViewController.transitioningDelegate = self
    }
}
```

## 显示图片
格式 :    
![图片名字](图片链接)

示例 :    
![p1](http://img.blog.csdn.net/20150416165133627)


## 列表 
列表前面也是需要一个空行，并且在标识符后面需要一个空格,比如: 1. 和* 。     

这是有序列表 : 

1. 第一
2. 第二
3. 第三

无序列表 : 

* 翻译正确
* 中文流畅
* 高质量

另一种列表 :     

- 翻译项目
- 认真校对撒
- 发布文章

## 表格 
格式为 :     

|  	  这是表头1		| 		表头2 		|
|:-------------|:-------------:|
| 第一行第一列，左对齐| 第一行第二列居中  |
| 第二行第一列，左对齐| 第二行第二列，居中  |


Markdown更详细的教程请查看[Markdown简明教程](http://wowubuntu.com/markdown/)。