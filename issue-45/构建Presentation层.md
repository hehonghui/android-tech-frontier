构建Presentation层
---

> * 原文链接 : [Modeling my presentation layer](http://panavtec.me/modeling-presentation-layer/)
* 原文作者 : [panavtec](http://panavtec.me/author/christianpanadero/)
* 译文出自 : [开发技术前线 www.devtf.cn](http://www.devtf.cn)
* 转载声明: 本译文已授权[开发者头条](http://toutiao.io/download)享有独家转载权，未经允许，不得转载!
* 译者 : [DroidWorkerLYF](https://github.com/DroidWorkerLYF) 
* 校对者: [这里校对者的github用户名](github链接)  
* 状态 :  未完成 / 校对中 / 完成

After [modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/) here it
comes, modeling my presentation layer. The reason for this post is that
I saw in many projects that are moving from a legacy codebase to an MVP
approach that there are some issues trying to differentiate what belongs
to the presentation layer and what belongs to the UI layer. In my
previous project, I saw also a comment that was telling: “I cannot grave
in a stone what is a business rule”. This is very bad if you are not
able to recognize what belongs to your domain you are going to make
mistakes while you separate the responsibilities. Why are you trying to
make a Clean approach without knowing the very basics?

I’m going to give you some examples and how I solved it. This article is
more about to get the concepts clear, the implementation is not really
important, you can achieve it in many ways.

Android view vs View vs Screen
------------------------------

-   **Android view**: Just an Android component, something that extends
    from android.view.View
-   **View**: The view interface to communicate from your presenter to
    your view implementation, it can be implemented in your preferred
    Android component, sometimes is better to use an Activity others a
    Fragment or maybe a Custom View.
-   **Screen**: A screen is more a user concept, the user gets the
    feeling that the phone is navigating between windows, but we can
    represent this in Android with Activities or replacing
    fragments/views in the same Activity. So it depends on the
    perception that the user gets and usually represents all the content
    that you can see in the view.

Navigation to a different screen
--------------------------------

A navigation between two screens can be between two fragments, two
activities, open a dialog, open an activity, etc… How this is achieved
is an implementation detail, and is the responsibility of our delivery
mechanism. But what about the action to navigate from a screen to
another? That action is the responsibility of our presentation layer.
*Our presenter should know about **what** to do and our implementation
**how** to do it*. In this case: What to do? To navigate to another
screen and how to do it? Open a new Activity. Then, we have a problem,
as I said before my presentation is pure java, so I can’t use any
android related stuff in my presenter, how to achieve this? Using an
abstraction. You can create an interface called NavigationCommand with a
simple method navigate() and call that method when is needed from our
presenter and implement this interface in our Android module. Assuming
that we have Activity A that wants to navigate to Activity B when a
button is clicked, here is the sequence of how it will work:

![navigation\_command\_sequence](http://panavtec.me/wp-content/uploads/2016/02/navigation_command_sequence.png)

The code will look like:

**Android module (View layer)**

	public class ActivityA extends Activity {
		@OnClick(R.id.someButton)
 		public void onSomeButtonClicked() {
    		presenter.onSomeButtonClicked();
 		}
 	}

	public class ToActivityB implements NavigationCommand {
  		private final Activity currentActivity;

  		public ToActivityB(Activity activity) {
     		currentActivity = activity;
  		}

  		@Override
  		public void navigate() {
     		currentActivity.startActivity();
  		}
	}

**Java module (Presentation layer)**

	public interface NavigationCommand {
 		public void navigate();
	}

	public class PresenterA {
 		private final NavigationCommand toBNavigation;

 		public PresenterA(NavigationCommand toBNavigation) {
    		this.toBNavigation = toBNavigation;
 		}

 		public void onSomeButtonClicked() {
    		toBNavigation.navigate();
 		}
	}

With this approach, we are decoupling responsibilities between different
layers. We extracted the navigation to a class that we can reuse
everywhere in our project to navigate to our Activity B. We can test our
presenter to invoke the navigation command and if we change the way of
displaying that screens (from Activities to Fragments for ex) our
presentation layer will not change. Long live to the [Open
close](https://en.wikipedia.org/wiki/Open/closed_principle) principle!

Another problem that I faced is when you have two or more Navigation
Commands in the same presenter, the parameters to construct that
presenter can become weird:

	public class PresenterA {
 		private final NavigationCommand toBNavigation;
 		private final NavigationCommand toCNavigation;

 		public PresenterA(NavigationCommand toBNavigation, NavigationCommand toCNavigation) {
    		this.toBNavigation = toBNavigation;
    		this.toCNavigation = toCNavigation;
 		}
	}

For the client that instantiates this presenter is hard to know the
order of the navigation commands, you only can rely on the name. But we
can have another interface to inherit from NavigationCommand to
represent that subtype of Navigation. Another solution if you are using
dependency injection can it be to implement a
[Qualifier](https://docs.oracle.com/javaee/6/tutorial/doc/gjbck.html) to
specify which type of parameter you need to pass.

There are some cases where you will need to navigate with a parameter to
the screen A to the screen B, then we can modify our NavigationCommand
to represent the dependencies that we need to navigate:

	public interface ToScreenBNavigationCommand extends NavigationCommand {
 		void setMyParameterToNavigate(String parameter);
	}

If we do that, we can use that method from our presenter before call
navigate() to set up our navigation.

Credits of this idea goes to [Pedro](https://twitter.com/pedro_g_s) who
has implemented this in his project
[EffetiveAndroidUI](https://github.com/pedrovgs/EffectiveAndroidUI/blob/1dadd276b094dffed2ae2e88602925c173ab59d7/app/src/main/java/com/github/pedrovgs/effectiveandroidui/ui/viewmodel/action/ActionCommand.java)

More than one View in the same screen
-------------------------------------

There are many Android components that can be view elements, it does not
matter for our Presenters. Remember that a View is like a contract that
our presenters work with. Can we have more than 1 view on the same
screen? For sure yes! How I can have more than 1 view/presenter in one
Activity? Well, let’s consider the Browse Spotify’s screen for this
example:

![Spotify
app](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-18-48-45.png)

In my way to see this screen we have a horizontal slider with different
playlists, then we have a menu with some options available in this
browse music concept and at the bottom, we have the current playing
song. In this screen, we clearly have different concepts and in my way
to see how this screen works, the concepts are not related to each
other, so let’s consider to have a view/presenter for every concept that
we talked about:

![browse\_colored](http://panavtec.me/wp-content/uploads/2016/02/browse_colored.png)

So why to create that structure, it is not the same to create one
Presenter to have all the actions and some custom views? Think who is
the responsible for fulfilling that views and if you want to reuse that
component how you will achieve that. Probably RecommendedPlayLists is
hitting the network to get the recommended playlist for the current
user, it does not make sense if we create a custom view group with a
presenter in order to achieve that? It can be reused everywhere. What
about the browse menu? this is another concept of the view, it is just a
menu that when you hit an item it will navigate to another screen (using
a navigation command!). And finally, the current playing song that for
sure it will be reused in other places.

As you can see a screen can have more than one View / Presenter because
a screen can be a summary of other things and can have more than one
responsibility, this thing really depends on the design. (Remember that
a
[responsibility](https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)
is a “reason to change”, and each of these views could change for
several reasons)

Can we have 2 implementations for the same view?
------------------------------------------------

Yes! we can have multiple implementations for the same presenter view,
for example in the Spotify app, the screen that I have shown you has a
view that controls the current song and displays the song information,
but if we click in that view we get:

![current playing
song](http://panavtec.me/wp-content/uploads/2016/02/Screenshot_2016-02-10-21-24-51.png)

It is not the same but with a different way to show it? So maybe we can
reuse the same presenter and re-implement the view interface in a
different Android component. But, this screen seems to have some extra
functions, would you put those new functions in the same presenter? It
depends on the case you have multiple alternatives: you can compose a
presenter with different actions, use two different presenters one for
the actions and other for the presentation, or simply have one presenter
with all the actions because it represents the same concept. Remember
that there is no perfect solution, software is about trade-offs.

But, it’s fair to say that this is not a common case, usually, a
Presenter has only 1 view implementation.

MVP composition
---------------

To summarize what we have seen so far:

-   A view uses 1 presenter
-   A screen can have 1-n views/presenters
-   A view can be re-implemented 1-n times to use with the same
    presenter
-   An Android component can implement 1 view. If you are implementing 2
    view interfaces, maybe is because those two views are better to be
    together as a whole concept or you need to separate the view
    implementations in two separate android views

Let’s move forward to other key concepts:

Presenter lifecycle
-------------------

The following screenshot is from Citymapper, when you hit the “Get me
somewhere” button opens a screen where you can choose the start and end
positions of your trip:

![citymapper\_getmesomewhere](http://panavtec.me/wp-content/uploads/2016/02/citymapper_getmesomewhere.png)

How will you decompose this screen? The first thing that comes into my
mind is: Does the concept of start location make sense without an end
location? I don’t think so, I would create one presenter “PickLocation”
that knows about when the start and end locations are filled. An
activity with 2 fragments in a view pager should do the job in the view
layer, both fragments can access the same presenter and call
“presenter.startLocationChanged()” and “presenter.endLocationChanged()”.

What if the design changes and now instead of having 2 tabs, we decide
that is better to navigate like 2-steps form?Then we have to replace the
start location fragment with the end location fragment. Our view layer
should change, but our presenter will be the same. In addition, we can
think about having 2 maps on the same screen one at the top with the
start location and another at the bottom, is the same example as before,
our view implementation changes but not our presenter.

So what is the lifecycle of my presenters? It depends on the
component(s) that we need to represent with that presenter.

To explain that, let’s take a look at the [Selltag
app](https://translate.google.com/translate?sl=es&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fwww.fesja.me%2Fgracias-selltag%2F),
a second-hand application. This is how we used to create products in
that application:

![New product - step
1](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-1.png)
![New
product - step
2](http://panavtec.me/wp-content/uploads/2016/02/Nuevo-Anuncio-Paso-2-con-varias-fotos.png)
![New product - Step
3](http://panavtec.me/wp-content/uploads/2016/02/2016-02-11.png)

As you can see is a 3 steps form. Despite the Spanish words, I think is
clear enough, “Siguiente” is “Next” and “Publicar” is “Publish”.

In the first step, you create some pictures of the product, the second
step is to fill the title, description, and price, lastly, you hit the
publish button and the product will be published.

My way to model that form is with one presenter again, a
“PublishProductPresenter”. This presenter represents a whole concept
“Publish a product”. How will it look on a tablet? Maybe the 3 steps are
together because you have an ample screen. And what about a web
application? Will it be another approach just because at the first
moment you see different designs? We are only changing the view layer,
but our presentation layer should be the same because it reacts to the
user events and makes queries to our domain.

But, hey! I can split it into 3 presenters and use it, in the same way,
you are using your whole presenter. Ok, maybe you are right, but how are
you going to send the information from the first steps to the last one
who is the responsible for creating the product? Are you going to have a
reference of a presenter inside another presenter? Maybe are you going
to create a shared object for all those three presenters and change the
properties in every step? It sounds dangerous and hard to debug if you
have any bugs.

You can create this 3 screens as an Activity with 3 fragments that will
be replaced or 3 different activities.

Presenter state
---------------

What about orientation changes? Your activity will be destroyed and your
presenter too. Most of the problems that I saw regarding if a presenter
has to be stateful or not belongs to the domain layer. I’ll explain it
with the next example:

![fdroid](http://panavtec.me/wp-content/uploads/2016/02/fdroid.png)

This is F-Droid for Android, an alternative and open source market that
only contains open source applications. That Available apps are
refreshed making a network request. Imagine that if we rotate the screen
and our presenter is stateless then the list will be reloaded. How can
you solve it? Well, the question is actually pretty simple you can
create a temporal in-memory or disk cache to save the previous response
and invalidate it with a TTL (time to live). But never store the items
that you received from the network in your presenter, because if you
need to recreate your presenter, then you will have the problem that you
need to keep the reference to those items in order to don’t make that
request again. So in summary, I always try to make my presenters
stateless.

Callback hell
-------------

Callback hell is one of the most discussed topics when people talk about
the presentation layer. Many of the problems that I saw related to that
callback hell are again because we are letting the presenters do too
much. Remember that is not the responsibility of the presentation layer
to coordinate actions of our domain. Our presentation layer should call
the actions of our domain and those actions are the ones that handle
that synchronization, leaving our presentation layer simple. You can see
this action modeling in my previous post [modeling my domain
layer](http://panavtec.me/modeling-my-android-domain-layer/). Before
integrating libraries such as
[RxJava](https://github.com/ReactiveX/RxJava) or
[Jdeferred](https://github.com/jdeferred/jdeferred) think if you need
that tools or you are making some design mistakes and that tools are the
only option to glue that parts of your system.

To illustrate it I’ve created an example. Imagine a system where you
only have to show a list of products if some flag retrieved from a
server is true. This frist approach should be wrong mainly for 2 causes,
the first one is that your presenter doesn’t need to know about this
flag thing because is something related to our domain. The second cause
is that this bad coordination is making us write more lines of code in
our presentation and deal with the synchronization things:

![callback
hell](http://panavtec.me/wp-content/uploads/2016/02/diagram_2_.png)

Instead of coordinating those things in the presenter, we can do the
following:

![proper
domain](http://panavtec.me/wp-content/uploads/2016/02/diagram.png)

As you can see, now we don’t have any problems and the action that we
are calling is clear enough. In addition, if this flag is not needed in
a feature the only point that I need to change is my action.

Conclusion
----------

Model our presentation layer is very easy, but you have to be sure what
belongs to that layer and what is the responsibility of the domain. When
you have a huge presenter, ask yourself if it is really a huge screen
with a lot of user events to handle or you have another problems like
that your presenter is doing some domain actions, etc…