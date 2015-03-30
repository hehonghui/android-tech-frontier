Kotlin for Android (II)创建一个工程
---

>
* 原文标题 : Kotlin for Android (II): Create a new project
* 原文链接 : [Kotlin for Android (II): Create a new project](http://antonioleiva.com/kotlin-android-create-project/)
* 译者 : [Lollypo](https://github.com/Lollypo) 
* 校对者: 
* 状态 :  未完成


After getting a light idea of [what Kotlin is and what it can do for us](http://antonioleiva.com/kotlin-for-android-introduction/), it´s time to configure Android Studio to help us develop Android apps using Kotlin. It requires some steps that only need to be done first time, but some other Gradle configurations will need to be done on every new project.

For this set of articles, I´ll be creating a reduced version of [Bandhook](https://play.google.com/store/apps/details?id=com.limecreativelabs.bandhook), an app I created some time ago, which will basically connect to a music rest API and return some info about a set of bands. Go to [Bandhook Kotlin on Github](https://github.com/antoniolg/Bandhook-Kotlin) and take a look at the code.


###Create a new project and download Kotlin plugin###


###Add Kotlin plugin dependency to your application build.gradle###

Just create a basic Android project with an activity using Android Studio, the same way you would do for a regular project.

Once done, first thing you´ll need is to download Kotling plugin. Go to Android Studio preferences and search plugins. Once there, use search again to find Kotlin plugin. Install and restart the IDE.

![kotlin-plugin](http://7xi8kj.com1.z0.glb.clouddn.com/kotlin-plugin-e1424632570741.png)



###Configure module build.grade###

First, apply Kotlin plugin:
```gradle
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
```
Then, add the Kotlin library to your dependencies:
```gradle
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'org.jetbrains.kotlin:kotlin-stdlib:0.11.91'
}
```
And finally, you need to add the Kotlin folder we´ll be creating on next step to your sources folders:
```gradle
android {
    compileSdkVersion 22
    buildToolsVersion "22.0.0"
 
    ...
 
    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }
}
```
Alternatively, you can skip this step, and after doing next ones, use this Android Studio action:
![configure-kotlin-project](http://7xi8kj.com1.z0.glb.clouddn.com/configure-kotlin-project.png)
I prefer doing it manually to keep my Gradle files organized, but this second option could be easier.



###Create Kotlin folder###

It will be easier if you change the project visualization from ‘Android’ to ‘Project’. Go to ‘app->src->main’ and create a folder called ‘kotlin':
![kotlin-folder](http://7xi8kj.com1.z0.glb.clouddn.com/kotlin-folder.png)


###Convert java activity to a kotlin file###

Kotlin plugin can convert from java to kotlin classes. We can convert our current activity to a Kotlin class very easily from ‘Code’ menu, by choosing ‘Convert Java File to Kotlin File':
![convert-java-to-kotlin](http://7xi8kj.com1.z0.glb.clouddn.com/convert-java-to-kotlin-e1424633562637.png)
IDE will suggest to move new file to the Kotlin folder. Click on ‘Move File’ (or move it manually if you don´t see the option).
```java
public class MainActivity : ActionBarActivity() {
 
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
 
 
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu)
        return true
    }
 
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        val id = item.getItemId()
 
        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true
        }
 
        return super.onOptionsItemSelected(item)
    }
}
```



###Main differences###

Just taking a look at previous code, we can see some direct differences. There are many more we´ll be discovering in next posts:

- Use of colon instead of the word ‘extends’
- Explicit use of ‘override': in Java, we can use an annotation to make our code more clear, but it´s not a condition. Kotlin will force us use it.
- Use of ‘fun’ for functions: Kotlin is and object-oriented functional language, so it will be very similar to other languages such as Scala. Java methods are represented as functions.
- Function parameters use a different nomenclature: Type and name are written the other way round and separated by a colon
- Optional use of semicolons: we don´t need to finish our lines with a semicolon. We can if we want to, but it can save a lot of time and make our code cleaner if we don´t do it.
- Other small details: In introductory article, I already talked about the ‘?’ symbol on. This indicates the parameter can be null. Nullity is handled different from what we are used in Java


###Conclusion###

Though we can think using a new language will be very difficult, Kotlin is being created by the JetBrains team to be the most easy and interoperable language to cover the needs Java lacks. As Android Studio is also based on a JetBrains product, it will be very easy to integrate to this IDE and start working with it.

Next article will cover some tips and tricks to make our life easier when developing Android apps with Kotlin.