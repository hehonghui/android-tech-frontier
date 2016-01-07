Android高性能JSON数据解析
---

> * 原文链接 : [Hi Performance JSON Parsing in Android](http://www.donnfelker.com/hi-performance-json-parsing-in-android/)
* 原文作者 : [DONN FELKER](http://www.donnfelker.com/author/donn/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [mr_dsw](https://github.com/dengshiwei) 
* 校对者: [desmond1121](https://github.com/desmond1121)  
* 状态 :  完成 

有时Android开发中我们调用的1/3的API需要我们下载JSON数据。现在我有一个客户端调用一个API接口用于为设备同步数据。调用一个API返回成百上千行的JSON数据导致保存的时候形成一个8MB或者更大的JSON文件。将整个文件加载到内存中进行处理是很痛苦的，同时会导致大量内存受限的设备crash掉。然而，使用[Jackson](http://www.codehaus.org/) JSON数据解析类库能够一个个将[http-request](https://github.com/kevinsawicki/http-request)转换成[Reader](http://developer.android.com/reference/java/io/Reader.html)对象，[Reader](http://developer.android.com/reference/java/io/Reader.html)对象允许你处理每一个从pipe中下载下来JSON对象，它允许你从下载下来就可以处理数据而不是等到整个JSON文件加载完成。

我使用Jackson中的[ObjectMapper](http://www.codehaus.org/)对象反序列化JSON为[POJO](https://en.wikipedia.org/wiki/Plain_Old_Java_Object)对象，这允许我在应用中使用domain objects，因此，我不必为任何情况下的JSON数据解析而担心或将数据存放到本地设备上（而担心）。如果你加载整个JSON文件为ObjectMapper对象，你必须创建一个很大的对象，足以占满你所有的可用内存，同时你可能会发生OutOfMemoryException异常。最终的目标是处理每一个下载的JSON对象，同时结合使用POJO的有点使用。下面是你如何使用它。

**对象模型**    
下面我们有一个简单的customer对象需要我们下载。假想一个app拥有数以百万计的customers。每一个customer都被表示为如下的一个POJO对象。

    public class Customer {
	  String firstName;
	  String lastName;
	  // 20 Other properties
	
	  public String getFirstName() {
	    return firstName; 
	  }
	
	  public void setFirstName(String firstName) {
	    this.firstName = firstName; 
	  }
	
	  public String getLastName() {
	    return lastName; 
	  }
	
	  public void setLastName(String lastName) {
	    this.lastName = lastName; 
	  }
	
	  // all the other mutators and accessors
	
	}

**连接API / 消费Stream**   
这实际上很容易，通过你的http类库(我使用http-request)连接到到你的API接口，使用HttpRequest对象的reader()方法，以便我能以此reader作为参数传递给JsonParser对象（如下所示），然后让循环建立每一个Customer对象，最后处理每一个customer。

	// Connect to your API with your http lib, i use http-request: https://github.com/kevinsawicki/http-request
	// Then get the reader. The 'request' variable below is just a HttpRequest object 
	// as shown here: http://kevinsawicki.github.io/http-request/
	final Reader reader = request.reader(); 
	
	final ObjectMapper mapper = new ObjectMapper(); 
	final JsonFactory factory = mapper.getFactory();
	
	// Create a new streaming parser with the reader
	JsonParser jp = factory.createParser(reader);
	
	// I'm working with a JSON Array that is returned from the API that I'm connecting to, so I need to advance the 
	// parser to the start of the array.
	
	// Advance stream to START_ARRAY first:
	jp.nextToken();
	
	// Parse each value by looking for each start object. The Mapper will read the object and advance the parser
	// until it finds the END_OBJECT at which time the mapper then deserializes into a POJO. Then the loop will 
	// continue to the next position. This will handle each JSON object as it becomes available and will be very 
	// light on memory and high in performance. 
	while(jp.nextToken() == JsonToken.START_OBJECT) {
	    // Get customer POJO
	    final Customer c = mapper.readValue(jp, Customer.class);
	
	    // Update local db with customer info.
	    myDataLayer.updateCustomer(c);
	}

**如何使用Jackson**    
简单地将它添加为一个类库，或者如果你使用Maven添加Maven dependency在你的POM中同时关闭races。现在你可以下载巨大的JSON数据同时不必担心内存溢出。