Update story metadata

Change the story’s title and subtitle as needed

Enrique López Mañas

10 min read

ClosePublish changes

[](https://medium.com/)[![Google Developer
Experts](https://d262ilb51hltx0.cloudfront.net/fit/c/34/34/1*6vxV6m-dOhmtSgPsoMOn_Q.png)](https://medium.com/google-developer-experts?source=avatarTopMetabar-lo_6abba5e6694c-a67bd6fa7d58 "Go to Google Developer Experts")

[![Google Developer
Experts](https://d262ilb51hltx0.cloudfront.net/fit/c/34/34/1*6vxV6m-dOhmtSgPsoMOn_Q.png)](https://medium.com/google-developer-experts?source=logoAvatar-lo_6abba5e6694c-a67bd6fa7d58 "Go to Google Developer Experts")[](https://medium.com/google-developer-experts?source=logo-lo_6abba5e6694c-a67bd6fa7d58)

### Published inGoogle Developer Experts

[](https://medium.com/search "Search")[Sign in / Sign
up](https://medium.com/m/signin?redirect=https%3A%2F%2Fmedium.com%3A443%2Fgoogle-developer-experts%2Fautomating-android-development-6daca3a98396)

[![Google Developer
Experts](https://d262ilb51hltx0.cloudfront.net/fit/c/34/34/1*6vxV6m-dOhmtSgPsoMOn_Q.png)](https://medium.com/google-developer-experts?source=avatarSecondaryBar-lo_6abba5e6694c-a67bd6fa7d58 "Go to Google Developer Experts")[![image](https://d262ilb51hltx0.cloudfront.net/fit/c/34/34/1*AV6Ju95BJPkkIXg1x8Ni1w.jpeg "Enrique López Mañas")](https://medium.com/@enriquelopezmanas "Go to the profile of Enrique López Mañas")[Enrique
López
Mañas](https://medium.com/@enriquelopezmanas "Go to the profile of Enrique López Mañas")\
 on May 410 min

Next story

Next story

The author chose to make this story unlisted, which means only people
with a link can see it. Are you sure you want to share it?Yes, show me
sharing options

#### Automating Android development

-   Share on Twitter
-   Share on Facebook
-   Share by email

* * * * *

\

* * * * *

### Automating Android development

\

I have been recently talking at the [DroidCon
Spain](http://es.droidcon.com/2015/) and [DroidCon
Italy](http://it.droidcon.com/2015/) about how to automate a traditional
Android workflow. To my surprise, there are still many organisations
that do lack a Continuous Integration (CI) strategy. This is a big
mistake! I decided to put down in words my thoughts about how to
efficiently implement CI.

As a software engineer, your aim is to automate as many processes as
possible. Machines are more efficient than people: they do not need food
neither sleep, they perform tasks errorless and they make your life
easier. *Work hard in order to work less*.

Continuous Integration is nonetheless a complex field that involves many
different dots that are separated, and that you need to put together.
You need to talk about Jira, you need to mention tests and branching,
you need to script and construct.

There are big blocks I want to bring into this post. Each of them
deserves an individual post to explain how they work, but this is not
the aim of this post. The aim is to show you the basics of each, and how
they can be combined.

1.  - Defining a branching strategy.
2.  - Using an agile methodology
3.  - Gradle and build scripting
4.  - Testing
5.  - Using a CI server.

### The branching strategy

Branching is important. When you are constructing a new product with a
set of people, you want to establish a protocol on how to work. How
should people commit their features? How do we release? How do we ensure
that we are not breaking things? To answer those questions, you need to
adopt a branching strategy.

I am using a fork of a branching strategy proposed by [Vincent
Driessen](http://nvie.com/posts/a-successful-git-branching-model/),
slightly modified. Let’s consider three states for our application:
**alpha**, **beta** and **release**.

**Alpha** is the status of your system when it is being developed.

**Beta** happens when your features have been approved and merged.

**Release** is the status of a system when it has been delivered.

(some people like to call alpha “develop” and beta “stage”. I think
letters of the greek alphabet are always cooler).

The following picture represents the very first status of a project. You
have your initial commit into the master branch.

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*CWNjrbmm5jQ0uvp-L53EYg.png)

Our system is just starting. There is a first commit in master, and the
other branches still empty

Time to work. You need to branch from this initial state into develop.
This will be your version 1.0.1.

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*JLekFIGh6ciEvj52w3hddA.png)

At this point, alpha is exactly the same as master.

Now you will start working on features. For each feature, you will
create a feature branch. Using the right naming here is important, and
there are several ways to do it. If you are using an issue tracking
system like [Jira](https://www.atlassian.com/software/jira), you will
likely have a ticket name associated with a feature (maybe FEATURE-123).
When I am committing features, I include the branch name in the commit
message and add a full description.

*[FEATURE-123] Created a new screen that performs an action.*

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wKF9mdhTLC8MFdy02WJ1EQ.png)

Note that each individual item in the branch will have its own version
number. You can use [git
tags](http://git-scm.com/book/en/v2/Git-Basics-Tagging) also to keep a
control of the version.

When a feature has been finished, a pull request is open, so that other
members of your organisation can approve it. This is a critical part to
ensure that you are delivering quality software. At
[Sixt](http://www.sixt.de/mobileapps/) another member is assigned to
your code review, and this person will go through your entire code. We
ensure that our code is meeting our [coding
conventions](https://speakerdeck.com/kikoso/android-coding-guidelines)
and we are strict about the process - typical comments in a pull request
highlight that there is an extra space in an XML file. We comment about
naming (“the name of the function is not clear to me”), check that our
design is pixel perfect (“your text view has the color \#DCDCDC but the
design is \#DEDEDE”) and there is a functional test to check that the
feature is covering the acceptance criteria written in the issue
tracker. We even go through some philosophical discussions about the
meaning of null, void or empty variables. This can sound annoying, but
it is fun. And if it is passionately done, by the time your code reaches
production you know you are commiting code with quality.

### Sprints and iteration

You will likely be working with
[SCRUM](http://en.wikipedia.org/wiki/Scrum_%28software_development%29),
[Kanban](http://en.wikipedia.org/wiki/Kanban_%28development%29) or
another agile methodology. Typically you will work in sprints of several
weeks. We think is a good idea to divide the sprint into two weeks: the
first week is used to develop the features, whereas the second week will
stabilise the features created in the first sprint. In this second
sprint we will fix bugs we found, achieve pixel-perfect layouts or
improve-refactor our code. This work is done in the beta/stage branch.
The following image shows it graphically

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*7lynNxY8iQpFHCee_Rkjjg.png)

The yellow dots belong to the bug fixing and stabilisation sprint

If you are following our conventions, at the end of the sprint you will
have a deliverable. This deliverable will be a file ready to be
published in Google Play Store. At this moment, the last version of our
application has been merged into master.

Another important topic is how to create a hotfix. Our model tries to
prevent them using the code reviews and a second week of bug fixing and
product stabilization, but bugs happen. When this is happening in
production, this model requires the bug to be fixed directly in the
master branch.

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*sdL8HDfMgoNuhnLKu7Soew.png)

Did you realise that there is a flag in this model? Yes, that is! The
hotfixes are not present in our alpha and beta branches. After a hotfix
and after the stabilisation period (the second week), our alpha branch
is in an old state, with the bugs still being present there. We need to
merge each branch into the branch inmediately to the right, thus
ensuring that every fix is now present throughout all the branches.

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Rijzdkk4SA4T9T3koBAXCg.png)

Hard to understand? Is probably harder to read than to put in practice.
If you do not have a branching strategy yet, just try to develop a
feature using this model. You will see that is easy to work with this,
and how you even will start to customize it!

### Gradle and scripting

Now that you have read the branching model, we are ready to keep talking
about the next steps. Gradle is a tool that will help us to achieve many
things automatically. You are probably familiar with Gradle (or with the
members of the family, Maven and Ant). Gradle is a project automation
tool that we will use to perform functions and define properties while
we are building our app. Gradle introduces a Groovy based domain
language, and the limit to play with it is basically our imagination.

I wrote previously a [post](http://codetalk.de/?p=112) with some tricks
to use Gradle. Some of them will be useful to include in your
application, but there are a few more I have been applying since then,
and I would like to introduce here.

#### The power of BuildConfig

*BuildConfig* is a file generated automatically when we compile an
Android application. This file, by default, looks like follows:

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*wkoXjbSYaYymUhZrO8-jRw.png)

\

BuildConfig contains a field called **DEBUG**, that indicates whether
the application has been compiled in debug mode or not. This file is
highly customizable, which is very handy when we work on different build
types.

An application typically tracks its behaviour using [Google
Analytics](http://www.google.com/analytics/ce/mws/),
[Crashlytics](https://try.crashlytics.com/) or other platforms. We might
not want to influence those metrics when we are working on the
application (imagine a User Interface test, automatically released every
day, tracking your login screen?). We also might have different domains
depending on our Build (for instance development.domain.com,
staging.domain.com…) that we want to use automatically. How can we do
this cleanly? Easy! In the field buildTypes of Gradle we can just add
any new field we want. Those fields will be later available through
BuildConfig (this means, using BuildType.FIELD we can read them).

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*Z_YYrTPF7FTShHAt5tqW3g.png)

\
-

In [this post](http://codetalk.de/?p=112) I showed how to use different
icons and how to change the package name. Using this we can install
different versions of our application. This is very handy to be able to
see our beta, alpha and release versions at the same time.

### Testing

\

Testing is, by itself, and entire discipline that could have its own
Medium post. When we talk about testing we talk about mocking
components, about UI and integration tests, about Instrumentation and
all the different frameworks available for Android.

Testing is very important, because it prevents developers of breaking
existing things. Without testing, we could easily break an old feature A
when we are developing a new feature B. Is hard to manually test an
entire system when a new feature is commited, but doing it automatically
it is much easier to control the stability of a system.

There are many different of tests that can be performed in a mobile
device: just to enumerate a few, we can think of integration tests,
functional tests, performance or UI tests. Each has a different
function, and they are generally triggered regularly to ensure that new
functionality is not breaking or degrading the system.

To show a basic example on how tests are integrated in Jenkins (and how
they achieve a function of stopping a build when something goes wrong)
we will show a small example of a UI Test done with
[Espresso](https://code.google.com/p/android-test-kit/wiki/Espresso)
that tests our Android application each time is built in Jenkins.

### An example application

\

I have created a small example application and uploaded it to
[GitHub](https://github.com/kikoso/Android-Testing-Espresso), so you can
check it out there. There are are also some branches with a naming
convention and pull requests you can see there to review everything
explained until now. The application is fairly basic: it has a screen
with a TextView. There are also three UI Tests been performed in the
file
[MainActivityInstrumentationTest](https://github.com/kikoso/Android-Testing-Espresso/blob/master/src/androidTest/java/com/dropsport/espressoreadyproject/tests/MainActivityInstrumentationTest.java):

1.  - Check that there is a TextView in the screen.
2.  - Check that the TextView contains the text “Hello World!”
3.  - Check that the TextView contains the text “What a label!”

The two last tests are mutually exclusive (that means, either one or the
other are sucesfull, but not both of them at the same time). We make the
application release the tests with the following command:

./gradlew clean connectedCheck.

If you check out the code, you can try it by yourself uncommenting the
function *testFalseLabel*. That will make the tests fail.

### Putting everything together into Jenkins

\

Now that we have checked a few things, let’s see how they fit into
Jenkins. If you haven’t installed it yet, you can download the [last
version](https://jenkins-ci.org/) from the website.

We haven’t mentioned it yet, but as there are branching strategies.
There are many different approaches, all of them with advantages and
disadvantages:

1.  - You can make the tests being triggered before the branches are
    built.
2.  - You can have night or daily builds that do not block the build,
    but still sent a notification if it fails.

For this tutorial I have chosen the first approach, in order to show
also a feature of Jenkins: dependencies between jobs. Let’s create three
jobs: **Job Beta**, **Job Alpha** and **Job Tests**.

1.  - **Job Alpha** will build the branch alpha (with ./gradlew clean
    assembleAlpha)
2.  -**Job Beta** will do the same with the beta branch (with ./gradlew
    clean assembleBeta). This is done every time a branch is merged into
    beta.
3.  **Job Tests** will be triggered every time there is a merge into the
    branch alpha. If it is successful, it will trigger the **Job
    Alpha**.

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*OPzV-aZLBGxdPYWPIip8Bg.png)

Jenkins is a platform heavily based on plugins. Companies are
continuously releasing plugins for their products, they integrate in
Jenkins and we can easily interconnect with other platforms. Let’s see
some of the options we have in Jenkins

#### Dependencies

\

Using dependencies in Jenkins we can interconnect projects. Maybe we
want to connect tests with jobs and start them based on the tests’
result. Or maybe we have part of our logic in a library that needs to be
compiled before the actual application is first built.

#### Notifications

\

Jenkins can notify a person or a set of people of a working or failing
built. Notifications are typically emails, but there are plugins that
enable to send messages in IM systems such as
[Skype](https://wiki.jenkins-ci.org/display/JENKINS/Skype+Plugin) or
even [SMS](https://wiki.jenkins-ci.org/display/JENKINS/SMS+Notification)
(the latest can be very handy when you have critical tests failing).

#### Delivering

\

You probably know at this point of [HockeyApp](http://hockeyapp.net/) or
another [delivery
platforms](http://alternativeto.net/software/hockeyapp/). They can
basically store binary files, create groups and notifying them when an
application is being uploaded. Imagine the tester receiving
automatically in his/her device the last files each time they are being
created, and the product owner being notified when a new beta version is
ready. There is a [HockeyApp
plugin](https://wiki.jenkins-ci.org/display/JENKINS/HockeyApp+Plugin)
for Jenkins that enables to upload a binary file to Hockey (and even
notifying members, or using as the release notes the last commits you
have used).

\

![image](https://d262ilb51hltx0.cloudfront.net/max/800/1*P6-P4hBkKfAG7Ls0bzXeEQ.png)

I still like to keep the step of publishing into production manually,
which is probably an irrational fear to loose all the human control in
the publishing process. But there is, however, a
[plugin](https://wiki.jenkins-ci.org/display/JENKINS/Google+Play+Android+Publisher+Plugin)
to publish directly into Google Play.

### Conclusion

\

Achieving automation in *building*, *testing*, *delivering* and
*publishing* is mainly a matter of choosing a right set of policies to
work with a team. When this policies are well defined, we can proceed to
the technical implementation.

There is one thing sure: errors that were done before by human actions
are drastically reduced, and combined with a strong test coverage the
quality of our software will dramatically improve. I am stealing here
the motto of my colleague [Cyril
Mottier](https://developers.google.com/experts/people/cyril-mottier):

> **Do less**, but **do** it **insanely great**

There is a moment in your career when you want to strive for the highest
quality in your job, much rather than producing quantity. As I
understand this business, one of the first steps to achieve it is to
automate as much as you can. In fact, I can rephrase the previous motto
into another sentence that I am trying to apply into my daily
professional life:

> Automate more, so you do less.

Happy coding!

RecommendRecommended

BookmarkBookmarkedShareMore

* * * * *

FollowFollowing

[![Google Developer
Experts](https://d262ilb51hltx0.cloudfront.net/fit/c/63/63/1*6vxV6m-dOhmtSgPsoMOn_Q.png)](https://medium.com/google-developer-experts?source=footer_card "Go to Google Developer Experts")

### [Google Developer Experts](https://medium.com/google-developer-experts?source=footer_card "Go to Google Developer Experts")

Experts on various Google products talking tech.

BlockedUnblockFollowFollowing

[![image](https://d262ilb51hltx0.cloudfront.net/fit/c/63/63/1*AV6Ju95BJPkkIXg1x8Ni1w.jpeg "Enrique López Mañas")](https://medium.com/@enriquelopezmanas?source=footer_card "Go to the profile of Enrique López Mañas")

### [Enrique López Mañas](https://medium.com/@enriquelopezmanas "Go to the profile of Enrique López Mañas")

I do things with computers

Published on May 4. [All rights
reserved](//medium.com/policy/9db0094a1e0f) by the author.

Thanks to [Berna
Melek](https://medium.com/@bernamelek "Go to the profile of Berna Melek").
