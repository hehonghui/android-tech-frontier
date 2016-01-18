使用Gradle将项目发布到Bitbucket上
---

> * 原文链接 : [Publish with Gradle on Bitbucket](https://medium.com/@Mul0w/publish-with-gradle-on-bitbucket-1463236dc460)
* 原文作者 : [Stef](https://medium.com/@Mul0w)
* 译文出自 : [开发技术前线 www.devtf.cn。未经允许，不得转载!](http://www.devtf.cn)
* 译者 : [MiJack](https://github.com/mijack)
* 校对者: [MiJack](https://github.com/mijack)
* 状态 :  已完成

大家好！

我们经常看见一些开源库放在MavenCentral, JCenter等仓库上，但是对于一些现有的库例如公司的库和工具，有没有类似的处理方法？

当然，你可能知道一些私有的仓库，例如（Nexus, Archiva），但是，有时候，你可能没有时间去接触公司的基础架构，比方说，你在一家PHP公司做android开发，还有很多事要做。

就只有这些了吗？是的，因为如果你使用过像Github或者Bitbucket这样的Git仓库，当你开始使用Maven库的时候将会如鱼得水。很棒，是不是？

[Chris Banes](https://twitter.com/chrisbanes)  曾经写过[一篇介绍使用Gradle将项目发布到Maven上的文章](https://chris.banes.me/2013/08/27/pushing-aars-to-maven-central/) 。

我们来看一下究竟是怎么做的吧！

###发布到仓库

Note : 如果你只使用一个build.gradle文件，你可以在上面设置任何东西，或者，也可以将他们写入不同的文件，然后用下面一段代码帮助你部署。
```
apply from: '<path-to-your-file>'
```
首先要使用Maven插件
```
apply plugin: 'maven'
```

然后配置相应的信息（下面是上传到Bitbucket的例子，大写的地方是你项目中对应的属性）

```
uploadArchives {
    configuration = configurations.archives
    repositories.mavenDeployer {
        pom.groupId = GROUP
        pom.artifactId = POM_ARTIFACT_ID
        pom.version = VERSION_NAME
        configuration = configurations.deployerJar
        repository(url: "git:releases://git@bitbucket.org:<bitbucket-username>/<your-repo>.git")
        snapshotRepository(url: "git:snapshots://git@bitbucket.org:<bitbucket-username>/<your-repo>.git")
        pom.project {
            name POM_NAME
            packaging POM_PACKAGING
            description POM_DESCRIPTION
            url POM_URL
            scm {
                url POM_SCM_URL
                connection POM_SCM_CONNECTION
                developerConnection POM_SCM_DEV_CONNECTION
            }
            licenses {
                license {
                    name POM_LICENCE_NAME
                    url POM_LICENCE_URL
                    distribution POM_LICENCE_DIST
                }
            }
            developers {
                developer {
                    id POM_DEVELOPER_ID
                    name POM_DEVELOPER_NAME
                    email POM_DEVELOPER_EMAIL
                }
            }
        }
    }
}
```
当然，你可以发现deployerJar，我们也需要设置它

首先，我们需要添加依赖Synergian Wagon-Git:
```
allprojects {
    repositories {
        mavenCentral()
        maven { url "https://raw.github.com/synergian/wagon-git/releases"}
    }
}
```
&

```
dependencies {
    deployerJar "ar.com.synergian:wagon-git:0.2.3"
}
```

然后，下一步需要说明如下配置
```
configurations { 
    deployerJar
}
```
现在，你可以部署了：
```
$ gradle [clean build] uploadArchives
```

And … you’re done !
你完成了！

###获取你的lib !


当然，现在你可以发布你的库（不论私有与否）托管到Bitbucket上（或其他）的对应仓库上，这很容易做到：
```
allprojects {
    repositories {
        mavenCentral()
        maven {
            url "https://api.bitbucket.org/1.0/repositories/<bitbucket_username>/<bitbucket-repository>/raw/snapshots"
            credentials {
                username REPOSITORY_USERNAME
                password REPOSITORY_PASSWORD
            }
        }
        maven {
            url "https://api.bitbucket.org/1.0/repositories/<bitbucket_username>/<bitbucket-repository>/raw/releases"
            credentials {
                username REPOSITORY_USERNAME
                password REPOSITORY_PASSWORD
            }
        }
    }
}
```

当然，最好不要在那些需要提交的build.gradle文件里设置您的凭据，但是，你可以在你的gradle.properties设置。其中最好的办法是将是有一个专门的账户来获取你的库，他只有库的读取权限。顺便说一下，发现证书只有在使用私有库的时候才会用到。

然后，像平常一样添加依赖，就可以使用你的库了：

```
dependencies {
      compile "GROUP-ID:ARTIFACT-ID:VERSION"
}
```
你会在Github上找到deploy.gradle文件。

就是这样;-)