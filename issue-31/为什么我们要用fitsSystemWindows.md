



<!DOCTYPE html>
<html lang="en" class=" is-copy-enabled is-u2f-enabled">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# object: http://ogp.me/ns/object# article: http://ogp.me/ns/article# profile: http://ogp.me/ns/profile#">
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Language" content="en">
    <meta name="viewport" content="width=1020">
    
    
    <title>android-tech-frontier/为什么我们要用fitsSystemWindows.md at master · bboyfeiyu/android-tech-frontier</title>
    <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="GitHub">
    <link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">
    <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-114.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-144.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144.png">
    <meta property="fb:app_id" content="1401488693436528">

      <meta content="@github" name="twitter:site" /><meta content="summary" name="twitter:card" /><meta content="bboyfeiyu/android-tech-frontier" name="twitter:title" /><meta content="android-tech-frontier - 一个定期翻译国外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目" name="twitter:description" /><meta content="https://avatars2.githubusercontent.com/u/1683811?v=3&amp;s=400" name="twitter:image:src" />
      <meta content="GitHub" property="og:site_name" /><meta content="object" property="og:type" /><meta content="https://avatars2.githubusercontent.com/u/1683811?v=3&amp;s=400" property="og:image" /><meta content="bboyfeiyu/android-tech-frontier" property="og:title" /><meta content="https://github.com/bboyfeiyu/android-tech-frontier" property="og:url" /><meta content="android-tech-frontier - 一个定期翻译国外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目" property="og:description" />
      <meta name="browser-stats-url" content="https://api.github.com/_private/browser/stats">
    <meta name="browser-errors-url" content="https://api.github.com/_private/browser/errors">
    <link rel="assets" href="https://assets-cdn.github.com/">
    <link rel="web-socket" href="wss://live.github.com/_sockets/MzM2Mjc5NTo0N2FlZGM4NDA4YmNmYzQ3YWY0MmFiNzkzYzI5ZGNmMzoyZjU2M2M3NTE5NmIxMTk5Zjk0YzJiZTQ0ZTc0MDYzZjVmZjkxYWZmNGRlNzU4ZGMwZWYyMDY1Y2JjZGRiYzE2--80752965b5f7b27339a6d696b45612fde1a81a7a">
    <meta name="pjax-timeout" content="1000">
    <link rel="sudo-modal" href="/sessions/sudo_modal">

    <meta name="msapplication-TileImage" content="/windows-tile.png">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="selected-link" value="repo_source" data-pjax-transient>

    <meta name="google-site-verification" content="KT5gs8h0wvaagLKAVWq8bbeNwnZZK1r1XQysX3xurLU">
    <meta name="google-analytics" content="UA-3769691-2">

<meta content="collector.githubapp.com" name="octolytics-host" /><meta content="github" name="octolytics-app-id" /><meta content="DF488666:691F:E3E8D16:5680992F" name="octolytics-dimension-request_id" /><meta content="3362795" name="octolytics-actor-id" /><meta content="shenyansycn" name="octolytics-actor-login" /><meta content="868f5a94ffcd85f5153ce1e9d50952a0b89445f10a5d252bfe4a45d6e5ebfc65" name="octolytics-actor-hash" />
<meta content="/&lt;user-name&gt;/&lt;repo-name&gt;/blob/show" data-pjax-transient="true" name="analytics-location" />
<meta content="Rails, view, blob#show" data-pjax-transient="true" name="analytics-event" />


  <meta class="js-ga-set" name="dimension1" content="Logged In">



        <meta name="hostname" content="github.com">
    <meta name="user-login" content="shenyansycn">

        <meta name="expected-hostname" content="github.com">

      <link rel="mask-icon" href="https://assets-cdn.github.com/pinned-octocat.svg" color="#4078c0">
      <link rel="icon" type="image/x-icon" href="https://assets-cdn.github.com/favicon.ico">

    <meta content="94f4e9fb824acfc861b0cd4abee74de70784a995" name="form-nonce" />

    <link crossorigin="anonymous" href="https://assets-cdn.github.com/assets/github-16bf5399d85a6f926eb6af8f983ed5cf907e97b4da4a650dc11920d425826218.css" integrity="sha256-Fr9Tmdhab5Jutq+PmD7Vz5B+l7TaSmUNwRkg1CWCYhg=" media="all" rel="stylesheet" />
    <link crossorigin="anonymous" href="https://assets-cdn.github.com/assets/github2-451ab63ad67fa9af580e5d9a3b2b7de911ce2e4b2437638f26fe8cb3879e67d8.css" integrity="sha256-RRq2OtZ/qa9YDl2aOyt96RHOLkskN2OPJv6Ms4eeZ9g=" media="all" rel="stylesheet" />
    
    


    <meta http-equiv="x-pjax-version" content="be269b1951a3572820c1f935e13a2f75">

      
  <meta name="description" content="android-tech-frontier - 一个定期翻译国外Android优质的技术、开源库、软件架构设计、测试等文章的开源项目">
  <meta name="go-import" content="github.com/bboyfeiyu/android-tech-frontier git https://github.com/bboyfeiyu/android-tech-frontier.git">

  <meta content="1683811" name="octolytics-dimension-user_id" /><meta content="bboyfeiyu" name="octolytics-dimension-user_login" /><meta content="32553922" name="octolytics-dimension-repository_id" /><meta content="bboyfeiyu/android-tech-frontier" name="octolytics-dimension-repository_nwo" /><meta content="true" name="octolytics-dimension-repository_public" /><meta content="false" name="octolytics-dimension-repository_is_fork" /><meta content="32553922" name="octolytics-dimension-repository_network_root_id" /><meta content="bboyfeiyu/android-tech-frontier" name="octolytics-dimension-repository_network_root_nwo" />
  <link href="https://github.com/bboyfeiyu/android-tech-frontier/commits/master.atom" rel="alternate" title="Recent Commits to android-tech-frontier:master" type="application/atom+xml">

  </head>


  <body class="logged_in   env-production macintosh vis-public page-blob">
    <a href="#start-of-content" tabindex="1" class="accessibility-aid js-skip-to-content">Skip to content</a>

    
    
    



      <div class="header header-logged-in true" role="banner">
  <div class="container clearfix">

    <a class="header-logo-invertocat" href="https://github.com/" data-hotkey="g d" aria-label="Homepage" data-ga-click="Header, go to dashboard, icon:logo">
  <span class="mega-octicon octicon-mark-github "></span>
</a>


      <div class="site-search repo-scope js-site-search" role="search">
          <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/search" class="js-site-search-form" data-global-search-url="/search" data-repo-search-url="/bboyfeiyu/android-tech-frontier/search" method="get"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /></div>
  <label class="js-chromeless-input-container form-control">
    <div class="scope-badge">This repository</div>
    <input type="text"
      class="js-site-search-focus js-site-search-field is-clearable chromeless-input"
      data-hotkey="s"
      name="q"
      placeholder="Search"
      aria-label="Search this repository"
      data-global-scope-placeholder="Search GitHub"
      data-repo-scope-placeholder="Search"
      tabindex="1"
      autocapitalize="off">
  </label>
</form>
      </div>

      <ul class="header-nav left" role="navigation">
        <li class="header-nav-item">
          <a href="/pulls" class="js-selected-navigation-item header-nav-link" data-ga-click="Header, click, Nav menu - item:pulls context:user" data-hotkey="g p" data-selected-links="/pulls /pulls/assigned /pulls/mentioned /pulls">
            Pull requests
</a>        </li>
        <li class="header-nav-item">
          <a href="/issues" class="js-selected-navigation-item header-nav-link" data-ga-click="Header, click, Nav menu - item:issues context:user" data-hotkey="g i" data-selected-links="/issues /issues/assigned /issues/mentioned /issues">
            Issues
</a>        </li>
          <li class="header-nav-item">
            <a class="header-nav-link" href="https://gist.github.com/" data-ga-click="Header, go to gist, text:gist">Gist</a>
          </li>
      </ul>

    
<ul class="header-nav user-nav right" id="user-links">
  <li class="header-nav-item">
      <span class="js-socket-channel js-updatable-content"
        data-channel="notification-changed:shenyansycn"
        data-url="/notifications/header">
      <a href="/notifications" aria-label="You have no unread notifications" class="header-nav-link notification-indicator tooltipped tooltipped-s" data-ga-click="Header, go to notifications, icon:read" data-hotkey="g n">
          <span class="mail-status all-read"></span>
          <span class="octicon octicon-bell "></span>
</a>  </span>

  </li>

  <li class="header-nav-item dropdown js-menu-container">
    <a class="header-nav-link tooltipped tooltipped-s js-menu-target" href="/new"
       aria-label="Create new…"
       data-ga-click="Header, create new, icon:add">
      <span class="octicon octicon-plus left"></span>
      <span class="dropdown-caret"></span>
    </a>

    <div class="dropdown-menu-content js-menu-content">
      <ul class="dropdown-menu dropdown-menu-sw">
        
<a class="dropdown-item" href="/new" data-ga-click="Header, create new repository">
  New repository
</a>


  <a class="dropdown-item" href="/organizations/new" data-ga-click="Header, create new organization">
    New organization
  </a>



  <div class="dropdown-divider"></div>
  <div class="dropdown-header">
    <span title="bboyfeiyu/android-tech-frontier">This repository</span>
  </div>
    <a class="dropdown-item" href="/bboyfeiyu/android-tech-frontier/issues/new" data-ga-click="Header, create new issue">
      New issue
    </a>

      </ul>
    </div>
  </li>

  <li class="header-nav-item dropdown js-menu-container">
    <a class="header-nav-link name tooltipped tooltipped-sw js-menu-target" href="/shenyansycn"
       aria-label="View profile and more"
       data-ga-click="Header, show menu, icon:avatar">
      <img alt="@shenyansycn" class="avatar" height="20" src="https://avatars3.githubusercontent.com/u/3362795?v=3&amp;s=40" width="20" />
      <span class="dropdown-caret"></span>
    </a>

    <div class="dropdown-menu-content js-menu-content">
      <div class="dropdown-menu  dropdown-menu-sw">
        <div class=" dropdown-header header-nav-current-user css-truncate">
            Signed in as <strong class="css-truncate-target">shenyansycn</strong>

        </div>


        <div class="dropdown-divider"></div>

          <a class="dropdown-item" href="/shenyansycn" data-ga-click="Header, go to profile, text:your profile">
            Your profile
          </a>
        <a class="dropdown-item" href="/stars" data-ga-click="Header, go to starred repos, text:your stars">
          Your stars
        </a>
        <a class="dropdown-item" href="/explore" data-ga-click="Header, go to explore, text:explore">
          Explore
        </a>
          <a class="dropdown-item" href="/integrations" data-ga-click="Header, go to integrations, text:integrations">
            Integrations
          </a>
        <a class="dropdown-item" href="https://help.github.com" data-ga-click="Header, go to help, text:help">
          Help
        </a>

          <div class="dropdown-divider"></div>

          <a class="dropdown-item" href="/settings/profile" data-ga-click="Header, go to settings, icon:settings">
            Settings
          </a>

          <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/logout" class="logout-form" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="+fWT+IbIM2YR5dzyksrizXRyKmaFrzUnGFLhrn2Biuwcz/UdNnJAvjHdC+hadyPQIt7BwePKTeuoFuFxz3eKEw==" /></div>
            <button class="dropdown-item dropdown-signout" data-ga-click="Header, sign out, icon:logout">
              Sign out
            </button>
</form>
      </div>
    </div>
  </li>
</ul>


    
  </div>
</div>

      

      


    <div id="start-of-content" class="accessibility-aid"></div>

      <div id="js-flash-container">
</div>


    <div role="main" class="main-content">
        <div itemscope itemtype="http://schema.org/WebPage">
    <div id="js-repo-pjax-container" class="context-loader-container js-repo-nav-next" data-pjax-container>
      
<div class="pagehead repohead instapaper_ignore readability-menu experiment-repo-nav">
  <div class="container repohead-details-container">

    

<ul class="pagehead-actions">

  <li>
        <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/notifications/subscribe" class="js-social-container" data-autosubmit="true" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" data-remote="true" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="kcq9lkYrYTyiRtv720soKRlditLfZjKVehw88VAZjdmBJqiDFdqvtCOy2VNS1bdR4jBgF9ozYXUss2JYU1/Xwg==" /></div>      <input id="repository_id" name="repository_id" type="hidden" value="32553922" />

        <div class="select-menu js-menu-container js-select-menu">
          <a href="/bboyfeiyu/android-tech-frontier/subscription"
            class="btn btn-sm btn-with-count select-menu-button js-menu-target" role="button" tabindex="0" aria-haspopup="true"
            data-ga-click="Repository, click Watch settings, action:blob#show">
            <span class="js-select-button">
              <span class="octicon octicon-eye "></span>
              Watch
            </span>
          </a>
          <a class="social-count js-social-count" href="/bboyfeiyu/android-tech-frontier/watchers">
            613
          </a>

        <div class="select-menu-modal-holder">
          <div class="select-menu-modal subscription-menu-modal js-menu-content" aria-hidden="true">
            <div class="select-menu-header">
              <span aria-label="Close" class="octicon octicon-x js-menu-close" role="button"></span>
              <span class="select-menu-title">Notifications</span>
            </div>

              <div class="select-menu-list js-navigation-container" role="menu">

                <div class="select-menu-item js-navigation-item selected" role="menuitem" tabindex="0">
                  <span class="select-menu-item-icon octicon octicon-check"></span>
                  <div class="select-menu-item-text">
                    <input checked="checked" id="do_included" name="do" type="radio" value="included" />
                    <span class="select-menu-item-heading">Not watching</span>
                    <span class="description">Be notified when participating or @mentioned.</span>
                    <span class="js-select-button-text hidden-select-button-text">
                      <span class="octicon octicon-eye"></span>
                      Watch
                    </span>
                  </div>
                </div>

                <div class="select-menu-item js-navigation-item " role="menuitem" tabindex="0">
                  <span class="select-menu-item-icon octicon octicon octicon-check"></span>
                  <div class="select-menu-item-text">
                    <input id="do_subscribed" name="do" type="radio" value="subscribed" />
                    <span class="select-menu-item-heading">Watching</span>
                    <span class="description">Be notified of all conversations.</span>
                    <span class="js-select-button-text hidden-select-button-text">
                      <span class="octicon octicon-eye"></span>
                      Unwatch
                    </span>
                  </div>
                </div>

                <div class="select-menu-item js-navigation-item " role="menuitem" tabindex="0">
                  <span class="select-menu-item-icon octicon octicon-check"></span>
                  <div class="select-menu-item-text">
                    <input id="do_ignore" name="do" type="radio" value="ignore" />
                    <span class="select-menu-item-heading">Ignoring</span>
                    <span class="description">Never be notified.</span>
                    <span class="js-select-button-text hidden-select-button-text">
                      <span class="octicon octicon-mute"></span>
                      Stop ignoring
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
</form>
  </li>

  <li>
    
  <div class="js-toggler-container js-social-container starring-container on">

    <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/unstar" class="js-toggler-form starred js-unstar-button" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" data-remote="true" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="tZKWd0IyqKY3qGUDdrPpFD/a+34hLPG1XhnnxYSAC0yP7dm+Qts6B8t4voFeeEcjf6pmHDOVsJ79omE9DwG+ag==" /></div>
      <button
        class="btn btn-sm btn-with-count js-toggler-target"
        aria-label="Unstar this repository" title="Unstar bboyfeiyu/android-tech-frontier"
        data-ga-click="Repository, click unstar button, action:blob#show; text:Unstar">
        <span class="octicon octicon-star "></span>
        Unstar
      </button>
        <a class="social-count js-social-count" href="/bboyfeiyu/android-tech-frontier/stargazers">
          3,625
        </a>
</form>
    <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/star" class="js-toggler-form unstarred js-star-button" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" data-remote="true" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="QFPOdehwaUzJIODwXfGwYXOSTk7n/VaapmRs0/MYfQVxGLNcmnSdq0Z5Qg83LTDo9s+zeQzxwT8f0bSdsoQxGw==" /></div>
      <button
        class="btn btn-sm btn-with-count js-toggler-target"
        aria-label="Star this repository" title="Star bboyfeiyu/android-tech-frontier"
        data-ga-click="Repository, click star button, action:blob#show; text:Star">
        <span class="octicon octicon-star "></span>
        Star
      </button>
        <a class="social-count js-social-count" href="/bboyfeiyu/android-tech-frontier/stargazers">
          3,625
        </a>
</form>  </div>

  </li>

  <li>
          <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/fork" class="btn-with-count" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="gQDomC1qnjTOzSHs6teplZzTNC/IImBTj8o2Z6nGxrvEr7YXx4sTl07xtk+gAvmolGaYxTv97SukdEahUubq7Q==" /></div>
            <button
                type="submit"
                class="btn btn-sm btn-with-count"
                data-ga-click="Repository, show fork modal, action:blob#show; text:Fork"
                title="Fork your own copy of bboyfeiyu/android-tech-frontier to your account"
                aria-label="Fork your own copy of bboyfeiyu/android-tech-frontier to your account">
              <span class="octicon octicon-repo-forked "></span>
              Fork
            </button>
</form>
    <a href="/bboyfeiyu/android-tech-frontier/network" class="social-count">
      1,370
    </a>
  </li>
</ul>

    <h1 itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="entry-title public ">
  <span class="octicon octicon-repo "></span>
  <span class="author"><a href="/bboyfeiyu" class="url fn" itemprop="url" rel="author"><span itemprop="title">bboyfeiyu</span></a></span><!--
--><span class="path-divider">/</span><!--
--><strong><a href="/bboyfeiyu/android-tech-frontier" data-pjax="#js-repo-pjax-container">android-tech-frontier</a></strong>

  <span class="page-context-loader">
    <img alt="" height="16" src="https://assets-cdn.github.com/images/spinners/octocat-spinner-32.gif" width="16" />
  </span>

</h1>

  </div>
  <div class="container">
    
<nav class="reponav js-repo-nav js-sidenav-container-pjax js-octicon-loaders"
     role="navigation"
     data-pjax="#js-repo-pjax-container">

  <a href="/bboyfeiyu/android-tech-frontier" aria-label="Code" aria-selected="true" class="js-selected-navigation-item selected reponav-item" data-hotkey="g c" data-selected-links="repo_source repo_downloads repo_commits repo_releases repo_tags repo_branches /bboyfeiyu/android-tech-frontier">
    <span class="octicon octicon-code "></span>
    Code
</a>
    <a href="/bboyfeiyu/android-tech-frontier/issues" class="js-selected-navigation-item reponav-item" data-hotkey="g i" data-selected-links="repo_issues repo_labels repo_milestones /bboyfeiyu/android-tech-frontier/issues">
      <span class="octicon octicon-issue-opened "></span>
      Issues
      <span class="counter">18</span>
</a>
  <a href="/bboyfeiyu/android-tech-frontier/pulls" class="js-selected-navigation-item reponav-item" data-hotkey="g p" data-selected-links="repo_pulls /bboyfeiyu/android-tech-frontier/pulls">
    <span class="octicon octicon-git-pull-request "></span>
    Pull requests
    <span class="counter">1</span>
</a>
    <a href="/bboyfeiyu/android-tech-frontier/wiki" class="js-selected-navigation-item reponav-item" data-hotkey="g w" data-selected-links="repo_wiki /bboyfeiyu/android-tech-frontier/wiki">
      <span class="octicon octicon-book "></span>
      Wiki
</a>
  <a href="/bboyfeiyu/android-tech-frontier/pulse" class="js-selected-navigation-item reponav-item" data-selected-links="pulse /bboyfeiyu/android-tech-frontier/pulse">
    <span class="octicon octicon-pulse "></span>
    Pulse
</a>
  <a href="/bboyfeiyu/android-tech-frontier/graphs" class="js-selected-navigation-item reponav-item" data-selected-links="repo_graphs repo_contributors /bboyfeiyu/android-tech-frontier/graphs">
    <span class="octicon octicon-graph "></span>
    Graphs
</a>

</nav>

  </div>
</div>

<div class="container new-discussion-timeline experiment-repo-nav">
  <div class="repository-content">

    

<a href="/bboyfeiyu/android-tech-frontier/blob/4988a51efb544b43cbc668607d289e87b6e6707a/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="hidden js-permalink-shortcut" data-hotkey="y">Permalink</a>

<!-- blob contrib key: blob_contributors:v21:c38fdd64f2d3a9121a771a07b43aecc0 -->

<div class="file-navigation js-zeroclipboard-container">
  
<div class="select-menu js-menu-container js-select-menu left">
  <button class="btn btn-sm select-menu-button js-menu-target css-truncate" data-hotkey="w"
    title="master"
    type="button" aria-label="Switch branches or tags" tabindex="0" aria-haspopup="true">
    <i>Branch:</i>
    <span class="js-select-button css-truncate-target">master</span>
  </button>

  <div class="select-menu-modal-holder js-menu-content js-navigation-container" data-pjax aria-hidden="true">

    <div class="select-menu-modal">
      <div class="select-menu-header">
        <span aria-label="Close" class="octicon octicon-x js-menu-close" role="button"></span>
        <span class="select-menu-title">Switch branches/tags</span>
      </div>

      <div class="select-menu-filters">
        <div class="select-menu-text-filter">
          <input type="text" aria-label="Filter branches/tags" id="context-commitish-filter-field" class="js-filterable-field js-navigation-enable" placeholder="Filter branches/tags">
        </div>
        <div class="select-menu-tabs">
          <ul>
            <li class="select-menu-tab">
              <a href="#" data-tab-filter="branches" data-filter-placeholder="Filter branches/tags" class="js-select-menu-tab" role="tab">Branches</a>
            </li>
            <li class="select-menu-tab">
              <a href="#" data-tab-filter="tags" data-filter-placeholder="Find a tag…" class="js-select-menu-tab" role="tab">Tags</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="select-menu-list select-menu-tab-bucket js-select-menu-tab-bucket" data-tab-filter="branches" role="menu">

        <div data-filterable-for="context-commitish-filter-field" data-filterable-type="substring">


            <a class="select-menu-item js-navigation-item js-navigation-open "
               href="/bboyfeiyu/android-tech-frontier/blob/gh-pages/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md"
               data-name="gh-pages"
               data-skip-pjax="true"
               rel="nofollow">
              <span class="select-menu-item-icon octicon octicon-check"></span>
              <span class="select-menu-item-text css-truncate-target" title="gh-pages">
                gh-pages
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open selected"
               href="/bboyfeiyu/android-tech-frontier/blob/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md"
               data-name="master"
               data-skip-pjax="true"
               rel="nofollow">
              <span class="select-menu-item-icon octicon octicon-check"></span>
              <span class="select-menu-item-text css-truncate-target" title="master">
                master
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
               href="/bboyfeiyu/android-tech-frontier/blob/revert-181-master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md"
               data-name="revert-181-master"
               data-skip-pjax="true"
               rel="nofollow">
              <span class="select-menu-item-icon octicon octicon-check"></span>
              <span class="select-menu-item-text css-truncate-target" title="revert-181-master">
                revert-181-master
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
               href="/bboyfeiyu/android-tech-frontier/blob/revert-485-patch-1/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md"
               data-name="revert-485-patch-1"
               data-skip-pjax="true"
               rel="nofollow">
              <span class="select-menu-item-icon octicon octicon-check"></span>
              <span class="select-menu-item-text css-truncate-target" title="revert-485-patch-1">
                revert-485-patch-1
              </span>
            </a>
        </div>

          <div class="select-menu-no-results">Nothing to show</div>
      </div>

      <div class="select-menu-list select-menu-tab-bucket js-select-menu-tab-bucket" data-tab-filter="tags">
        <div data-filterable-for="context-commitish-filter-field" data-filterable-type="substring">


        </div>

        <div class="select-menu-no-results">Nothing to show</div>
      </div>

    </div>
  </div>
</div>

  <div class="btn-group right">
    <a href="/bboyfeiyu/android-tech-frontier/find/master"
          class="js-show-file-finder btn btn-sm"
          data-pjax
          data-hotkey="t">
      Find file
    </a>
    <button aria-label="Copy file path to clipboard" class="js-zeroclipboard btn btn-sm zeroclipboard-button tooltipped tooltipped-s" data-copied-hint="Copied!" type="button">Copy path</button>
  </div>
  <div class="breadcrumb js-zeroclipboard-target">
    <span class="repo-root js-repo-root"><span itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb"><a href="/bboyfeiyu/android-tech-frontier" class="" data-branch="master" data-pjax="true" itemscope="url"><span itemprop="title">android-tech-frontier</span></a></span></span><span class="separator">/</span><span itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb"><a href="/bboyfeiyu/android-tech-frontier/tree/master/issue-31" class="" data-branch="master" data-pjax="true" itemscope="url"><span itemprop="title">issue-31</span></a></span><span class="separator">/</span><strong class="final-path">为什么我们要用fitsSystemWindows.md</strong>
  </div>
</div>


  <div class="commit-tease">
      <span class="right">
        <a class="commit-tease-sha" href="/bboyfeiyu/android-tech-frontier/commit/ca899fdb8e06f7a258fac68ae919bc897897ebd2" data-pjax>
          ca899fd
        </a>
        <time datetime="2015-12-24T03:03:54Z" is="relative-time">Dec 24, 2015</time>
      </span>
      <div>
        <img alt="" class="avatar" height="20" src="https://2.gravatar.com/avatar/fbd1ca8c4df5497ed8bb8b108e15a79e?d=https%3A%2F%2Fassets-cdn.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png&amp;r=x&amp;s=140" width="20" />
        <span class="user-mention">Danxiong Lei</span>
          <a href="/bboyfeiyu/android-tech-frontier/commit/ca899fdb8e06f7a258fac68ae919bc897897ebd2" class="message" data-pjax="true" title="added file why would i want to fitssystemwindow">added file why would i want to fitssystemwindow</a>
      </div>

    <div class="commit-tease-contributors">
      <a class="muted-link contributors-toggle" href="#blob_contributors_box" rel="facebox">
        <strong>0</strong>
         contributors
      </a>
      
    </div>

    <div id="blob_contributors_box" style="display:none">
      <h2 class="facebox-header" data-facebox-id="facebox-header">Users who have contributed to this file</h2>
      <ul class="facebox-user-list" data-facebox-id="facebox-description">
      </ul>
    </div>
  </div>

<div class="file">
  <div class="file-header">
  <div class="file-actions">

    <div class="btn-group">
      <a href="/bboyfeiyu/android-tech-frontier/raw/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="btn btn-sm " id="raw-url">Raw</a>
        <a href="/bboyfeiyu/android-tech-frontier/blame/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="btn btn-sm js-update-url-with-hash">Blame</a>
      <a href="/bboyfeiyu/android-tech-frontier/commits/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="btn btn-sm " rel="nofollow">History</a>
    </div>

        <a class="octicon-btn tooltipped tooltipped-nw"
           href="github-mac://openRepo/https://github.com/bboyfeiyu/android-tech-frontier?branch=master&amp;filepath=issue-31%2F%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md"
           aria-label="Open this file in GitHub Desktop"
           data-ga-click="Repository, open with desktop, type:mac">
            <span class="octicon octicon-device-desktop "></span>
        </a>

        <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/edit/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="inline-form js-update-url-with-hash" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="P8WHvhJa2OpsMztkRxWSRKOS6oOqksVorVQWkV/s6YeP8rg8mxoe5izswI7lpn2EzzqSW6KxxaAuZnm2Twv7GQ==" /></div>
          <button class="octicon-btn tooltipped tooltipped-nw" type="submit"
            aria-label="Edit the file in your fork of this project" data-hotkey="e" data-disable-with>
            <span class="octicon octicon-pencil "></span>
          </button>
</form>        <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/bboyfeiyu/android-tech-frontier/delete/master/issue-31/%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E8%A6%81%E7%94%A8fitsSystemWindows.md" class="inline-form" data-form-nonce="94f4e9fb824acfc861b0cd4abee74de70784a995" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /><input name="authenticity_token" type="hidden" value="DisFJFReKX6yZpnkpdcoqlG9ydPeUF0I33E1VAQaq34PByvJXVvLGOaV1Tn0yIxzzR40ehQN5v170SvaFQgEKA==" /></div>
          <button class="octicon-btn octicon-btn-danger tooltipped tooltipped-nw" type="submit"
            aria-label="Delete the file in your fork of this project" data-disable-with>
            <span class="octicon octicon-trashcan "></span>
          </button>
</form>  </div>

  <div class="file-info">
      64 lines (36 sloc)
      <span class="file-info-divider"></span>
    5.57 KB
  </div>
</div>

  
  <div id="readme" class="blob instapaper_body">
    <article class="markdown-body entry-content" itemprop="mainContentOfPage"><h2><a id="user-content-我们为什么要用fitssystemwindows" class="anchor" href="#我们为什么要用fitssystemwindows" aria-hidden="true"><span class="octicon octicon-link"></span></a>我们为什么要用fitsSystemWindows?</h2>

<blockquote>
<ul>
<li>原文链接 : <a href="https://medium.com/google-developers/why-would-i-want-to-fitssystemwindows-4e26d9ce1eec">Why would I want to fitsSystemWindows?</a></li>
<li>原文作者 : <a href="https://medium.com/@ianhlake">Ian Lake</a></li>
<li>译文出自 : <a href="http://www.devtf.cn">开发技术前线 www.devtf.cn</a></li>
<li>转载声明: 本译文已授权<a href="http://toutiao.io/download">开发者头条</a>享有独家转载权，未经允许，不得转载!</li>
<li>译者 : <a href="https://github.com/LionelCursor">LionelCursor</a> </li>
<li>校对者: </li>
<li>状态 :  校对中</li>
</ul>
</blockquote>

<p>System windows 指的就是屏幕上status bar、 navigation bar等系统控件所占据的部分。</p>

<p>绝大多数情况下，你都不需要理会status bar或者navigation bar 下面的空间，不过你需要注意不能让你的交互控件（比如Button）藏在status bar 或者 navigation bar下面。而<code>android:fitsSystemWindows="true"</code>的默认行为正好解决了这种情况，这个属性的作用就是通过设置View的padding，使得应用的content部分——Activity中setContentView()中传入的就是content——不会与system window重叠。</p>

<p>还有一些事情需要注意：</p>

<ul>
<li><strong><code>fitsSystemWindows</code> 需要被设置给根View</strong>——这个属性可以被设置给任意View，但是只有根View（content部分的根）外面才是SystemWindow，所以只有设置给根View才有用。</li>
<li><strong><code>Insets</code>始终相对于全屏幕</strong>——<code>Insets</code>即边框，它决定着整个Window的边界。对<code>Insets</code>设置padding的时候，这个padding始终是相对于全屏幕的。因为<code>Insets</code>的生成在View <code>layout</code>之前就已经完成了，所以系统对于View长什么样一无所知。</li>
<li><strong>其它padding将通通被覆盖</strong>。需要注意，如果你对一个View设置了<code>android:fitsSystemWindows="true"</code>，那么你对该View设置的其他padding将通通无效。</li>
</ul>

<p>在绝大多数情况下，默认情况就已经够用了。比如一个全屏的视屏播放器。如果你不想被ActionBar 或者其他System View遮住的话，那么在MatchParent的ViewGroup上设置<code>fitsSystemWindows="true"</code>即可。</p>

<p>或者，也许你希望你的RecyclerView能够在透明的navigation bar 下面滚动。那么只需将<code>android:fitsSystemWindows="true"</code> <code>android:clipToPadding="false"</code>同时使用即可,
滚动的内容会绘制在navigation bar下面，同时当滚动到最下面的时候，最后一个item下面依旧会有padding，使其可以滚到navigation bar上方（而不是在navigation bar下面滚不上来！）。</p>

<p>译者注：<code>clipToPadding</code>是<code>ViewGroup</code>的属性。这个属性定义了是否允许ViewGroup在padding中绘制,该值默认为true,即不允许。</p>

<h2><a id="user-content-自定义-fitssystemwindows" class="anchor" href="#自定义-fitssystemwindows" aria-hidden="true"><span class="octicon octicon-link"></span></a>自定义 fitsSystemWindows</h2>

<p>但是默认毕竟只是默认。
在KITKAT及以下的版本，你的自定义View能够通过覆盖<code>fitsSystemWindows() : boolean</code>函数，来增加自定义行为。如果返回<code>true</code>，意味着你已经占据了整个<code>Insets</code>，如果返回<code>false</code>，意味着给其他的View依旧留有机会。</p>

<p>而在Lollipop以及更高的版本，我们提供了一些新的API，使得自定义这个行为更加的方便。与之前的版本不同，现在你只需要覆盖<code>OnApplyWindowInsets()</code>方法，该方法允许View消耗它想消耗的任意空间（Insets），同时也能够为子方法，调用<code>dispatchApplyWindowInsets()</code></p>

<p>更妙的是，利用新的API，你甚至不需要拓展View类，你可以使用<code>ViewCompat.setOnApplyWindowInsetsListener()</code>，这个方法优先于<code>View.onApplyWindowInsets()</code>调用。<code>ViewCompat</code> 同时也提供了 <code>onApplyWindowInsets()</code> 和<code>dispatchApplyWindowInsets()</code> 的兼容版本，无需冗长的版本判断。</p>

<h2><a id="user-content-自定义fitssystemwindows例子" class="anchor" href="#自定义fitssystemwindows例子" aria-hidden="true"><span class="octicon octicon-link"></span></a>自定义fitsSystemWindows例子</h2>

<p>绝大多数基本的layouts（FrameLayout）都是使用默认的行为，然而依然有一部分layouts已经使用了自定义<code>fitsSystemWindow</code>来实现自定义的功能。</p>

<p><code>navigation drawer</code>就是一个例子，它需要充满整个屏幕，绘制在透明的status bar下面。</p>

<p><a href="https://camo.githubusercontent.com/c6f6c99ab438502ae8af6acebabb4df45e2f7dc1/687474703a2f2f376f746872752e636f6d312e7a302e676c622e636c6f7564646e2e636f6d2f7768792d776f756c642d692d77616e742d746f2d6669747373797374656d77696e646f77732e706e67" target="_blank"><img src="https://camo.githubusercontent.com/c6f6c99ab438502ae8af6acebabb4df45e2f7dc1/687474703a2f2f376f746872752e636f6d312e7a302e676c622e636c6f7564646e2e636f6d2f7768792d776f756c642d692d77616e742d746f2d6669747373797374656d77696e646f77732e706e67" alt="enter image description here" data-canonical-src="http://7othru.com1.z0.glb.clouddn.com/why-would-i-want-to-fitssystemwindows.png" style="max-width:100%;"></a></p>

<p>如上图所示，<code>DrawerLayout</code>使用了<code>fitsSystemwindows</code>，他需要让它的子View依旧保持默认行为，即不被actionbar或其他system window遮住，同时依照Material Design的定义，又需要在透明的statusbar下面进行绘制（默认是你在theme中设置的<code>colorPrimaryDark</code>颜色）</p>

<p>你会注意到，在Lollipop及以上版本，<code>DrawerLayout</code>为每一个子View调用了<code>dispatchApplyWindowInsets()</code>，使每一个子View都收到<code>fitsSystemWindows</code>。这与默认行为完全不同，默认行为会使得根View消耗所有的insets，同时子View们永远不会收到<code>fitsSystemWindows</code>。</p>

<p><code>CoordinatorLayout</code>也利用了这一特性，使得其子View有机会截断并对<code>fitsSystemWindows</code>做出自己的反应。同时，它也利用<code>fitsSystemWindows</code>这一flag看其是否需要在statusbar的下方绘制。</p>

<p>同样的，<code>CollapsingToolbarLayout</code>以<code>fitsSystemWindows</code>什么时候把变小的View放在什么地方。</p>

<p>如果你对这些<a href="http://android-developers.blogspot.com/2015/05/android-design-support-library.html"><code>Design Library</code></a>里的东西感兴趣，请查看<a href="https://github.com/chrisbanes/cheesesquare">Cheesesquare Sample</a></p>

<h2><a id="user-content-积极使用系统而不是老想着hack" class="anchor" href="#积极使用系统而不是老想着hack" aria-hidden="true"><span class="octicon octicon-link"></span></a>积极使用系统，而不是老想着Hack</h2>

<p>有一件事需要始终牢记，这个属性毕竟不是<code>fitsStatusBar</code>或者<code>fitsNavigationBar</code>。不管是尺寸还是位置，在不同版本间，系统控件都有很大的差距。</p>

<p>但是尽管放心，无论在什么平台上，<code>fitsSystemWindows</code>都会影响<code>Insets</code>，使你的content和system ui不会重叠——除非你自定义这一行为。</p>
</article>
  </div>

</div>

<a href="#jump-to-line" rel="facebox[.linejump]" data-hotkey="l" style="display:none">Jump to Line</a>
<div id="jump-to-line" style="display:none">
  <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="" class="js-jump-to-line-form" method="get"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /></div>
    <input class="linejump-input js-jump-to-line-field" type="text" placeholder="Jump to line&hellip;" aria-label="Jump to line" autofocus>
    <button type="submit" class="btn">Go</button>
</form></div>

  </div>
  <div class="modal-backdrop"></div>
</div>

    </div>
  </div>

    </div>

        <div class="container">
  <div class="site-footer" role="contentinfo">
    <ul class="site-footer-links right">
        <li><a href="https://status.github.com/" data-ga-click="Footer, go to status, text:status">Status</a></li>
      <li><a href="https://developer.github.com" data-ga-click="Footer, go to api, text:api">API</a></li>
      <li><a href="https://training.github.com" data-ga-click="Footer, go to training, text:training">Training</a></li>
      <li><a href="https://shop.github.com" data-ga-click="Footer, go to shop, text:shop">Shop</a></li>
        <li><a href="https://github.com/blog" data-ga-click="Footer, go to blog, text:blog">Blog</a></li>
        <li><a href="https://github.com/about" data-ga-click="Footer, go to about, text:about">About</a></li>
        <li><a href="https://github.com/pricing" data-ga-click="Footer, go to pricing, text:pricing">Pricing</a></li>

    </ul>

    <a href="https://github.com" aria-label="Homepage">
      <span class="mega-octicon octicon-mark-github " title="GitHub "></span>
</a>
    <ul class="site-footer-links">
      <li>&copy; 2015 <span title="0.07277s from github-fe118-cp1-prd.iad.github.net">GitHub</span>, Inc.</li>
        <li><a href="https://github.com/site/terms" data-ga-click="Footer, go to terms, text:terms">Terms</a></li>
        <li><a href="https://github.com/site/privacy" data-ga-click="Footer, go to privacy, text:privacy">Privacy</a></li>
        <li><a href="https://github.com/security" data-ga-click="Footer, go to security, text:security">Security</a></li>
        <li><a href="https://github.com/contact" data-ga-click="Footer, go to contact, text:contact">Contact</a></li>
        <li><a href="https://help.github.com" data-ga-click="Footer, go to help, text:help">Help</a></li>
    </ul>
  </div>
</div>



    
    
    

    <div id="ajax-error-message" class="flash flash-error">
      <span class="octicon octicon-alert"></span>
      <button type="button" class="flash-close js-flash-close js-ajax-error-dismiss" aria-label="Dismiss error">
        <span class="octicon octicon-x"></span>
      </button>
      Something went wrong with that request. Please try again.
    </div>


      <script crossorigin="anonymous" integrity="sha256-7460qJ7p88i3YTMH/liaj1cFgX987ie+xRzl6WMjSr8=" src="https://assets-cdn.github.com/assets/frameworks-ef8eb4a89ee9f3c8b7613307fe589a8f5705817f7cee27bec51ce5e963234abf.js"></script>
      <script async="async" crossorigin="anonymous" integrity="sha256-S2uOfRHrt7zoUSbTtBMMgAQfKubV1u+JAajAw/fLgNI=" src="https://assets-cdn.github.com/assets/github-4b6b8e7d11ebb7bce85126d3b4130c80041f2ae6d5d6ef8901a8c0c3f7cb80d2.js"></script>
      
      
      
    <div class="js-stale-session-flash stale-session-flash flash flash-warn flash-banner hidden">
      <span class="octicon octicon-alert"></span>
      <span class="signed-in-tab-flash">You signed in with another tab or window. <a href="">Reload</a> to refresh your session.</span>
      <span class="signed-out-tab-flash">You signed out in another tab or window. <a href="">Reload</a> to refresh your session.</span>
    </div>
  </body>
</html>

