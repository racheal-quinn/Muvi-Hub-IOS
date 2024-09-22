// framework 7 modules
import Framework7 from "framework7";
// import all the Framework 7 necessary components
import Dialog from "framework7/components/dialog";
import Preloader from "framework7/components/preloader";
import Progressbar from "framework7/components/progressbar";
import Tabs from "framework7/components/tabs";
import Panel from "framework7/components/panel";
import InfiniteScroll from "framework7/components/infinite-scroll";
import Searchbar from "framework7/components/searchbar";
import Sheet from "framework7/components/sheet";
import Input from "framework7/components/input";
import Toast from "framework7/components/toast";
import Swiper from "framework7/components/swiper";
import Actions from "framework7/components/actions";
import Card from "framework7/components/card";
import 'framework7/css/bundle';
import 'framework7-icons/css/framework7-icons.css';
import Dom7 from "dom7";
// import Swiper from 'swiper/bundle';
var $$ = Dom7;

// Install F7 Components using .use() method on class:
Framework7.use([Dialog, Preloader, Tabs, Panel, InfiniteScroll, Searchbar, Sheet, Input, Toast, Swiper, Actions, Card, Progressbar]);

// import styles
import './assets/app.css';
import './assets/icons.css';
import './assets/pages.css';
import './assets/slider.css';
import 'material-icons/iconfont/material-icons.css';
import './assets/responsive.css';

// import functions
import Storage from "./storage";
import ui from "./ui";
import store from './store';
import data from "./data";
import { eventHandler } from "./eventHandler";

// variables
var userName = document.querySelector('.user_name');
var userEmail = document.querySelector('.user_email');


import morePage from '../dist/pages/more.f7.html';
import morePage2 from '../dist/pages/more_2.f7.html';
import signUpPage from '../dist/pages/signup.f7.html';
import logInPage from '../dist/pages/login.f7.html';
import playTrailer from '../dist/pages/play_trailer.f7.html';
import wishList from '../dist/pages/wishlist.f7.html';
import about from '../dist/pages/about.f7.html';
import season from '../dist/pages/season.f7.html';
import searchPage from '../dist/pages/searchpage.f7.html';
import newsPage from '../dist/pages/news.f7.html';
// import messagesPage from '../dist/pages/messages.f7.html';

// new pages
import moviePage1 from '../dist/pages/moviepage_1.f7.html';
import moviePage2 from '../dist/pages/moviepage_2.f7.html';
import tvShowPage1 from '../dist/pages/tvshows_1.f7.html';
import tvShowPage2 from '../dist/pages/tvshows_2.f7.html';


// import firebase
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Correct usage
export var app = new Framework7({
  name: "muvi hub", // App name
  store: store,
  mdTouchRipple: false,
  colors: {
    primary: "#800080",
  },
  statusbar: {
    enabled: true
  },
  el: "#app", // App root element
  routes: [
    // sign up and login
    {
      path: "/signup/",
      component: signUpPage
    },
    {
      path: "/login/",
      component: logInPage,
    },
    // player pages
    {
      path: '/play_trailer/',
      component: playTrailer,
      options: { transition: 'f7-dive' },
    },
    // others
    {
      path: '/wishlist/',
      component: wishList,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/error/',
      url: './pages/error.html',
    },
    {
      path: '/search_page/',
      component: searchPage,
      keepAlive: true,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/about/',
      component: about,
      options: { transition: 'f7-dive' }
    },
    {
      path: '/news/',
      component: newsPage,
      options: { transition: 'f7-dive' }
    },
    // main views routes
    {
      path: '/movies/',
      url: './pages/movies.html',
      keepAlive: true,
      options: { transition: 'f7-dive' },
      beforeEnter: function ({ resolve, reject }) {
        // App instance
        const router = this;
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            userName.innerText = user.displayName;
            userEmail.innerText = user.email;
            Storage.saveUser({ userId: user.uid, userName: user.displayName, userAvatar: user.photoURL });
            resolve();
          } else {
            reject();
            router.navigate('/signup/');
            return;
          }
        })
      },
    },
    {
      path: '/tvshows/',
      url: './pages/tvshows.html',
      keepAlive: true,
      options: {
        transition: 'f7-dive',
      }
    },
    // movie details routes
    {
      path: '/movie_page_1/',
      component: moviePage1,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/movie_page_2/',
      component: moviePage2,
      options: { transition: 'f7-dive' },
    },
    // serie details routes
    {
      path: '/tvshows_page_1/',
      component: tvShowPage1,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/tvshows_page_2/',
      component: tvShowPage2,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/seasons/',
      component: season,
      options: { transition: 'f7-dive' },
    },
    // more details routes
    {
      path: '/more/',
      component: morePage,
      options: { transition: 'f7-dive' },
    },
    {
      path: '/more_2/',
      component: morePage2,
      options: { transition: 'f7-dive' },
    },
  ],
  swipeBackPage: true
});

// main.js
document.addEventListener('DOMContentLoaded', async () => {
  $$(document).on('page:init', '.page[data-name="movies_page"]', async function (e) {
    // initialize swiper
    const swiper = app.swiper.create('.mySwiper', {
      effect: "coverflow",
      speed: 200,
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 250,
        modifier: 1,
        slideShadows: true,
      },
    });
    const swiper2 = app.swiper.create('.mySwiper1', {
      effect: "coverflow",
      speed: 200,
      grabCursor: true,
      initialSlide: 3,
      centeredSlides: true,
      loop: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 250,
        modifier: 1,
        slideShadows: true,
      },
    });
    ui.handlePanelEvents();
    // hide the splash screen
    let storedData = await Storage.getAllData();
    try {
      if (!storedData || storedData.length === 0) {
        const dataArray = await data.getMovieData();
        await Storage.saveData(dataArray);
      }
      ui.moviesView(swiper); 
      ui.showsView(swiper2);
      eventHandler();
      data.getAllMedia();
    } catch (error) {
      console.error('Error fetching or storing data:', error);
    }
  });
});

document.addEventListener('admob.ad.dismiss', async (e) => {
  if (e.adId == process.env.INTERSTITIAL_AD_ID) {
    console.log("Interstitial closed");
    ui.loadInterstitial();
  } else if (e.adId == process.env.REWARDED_AD_ID) {
    console.log("Rewarded closed");
    ui.loadRewarded();
  } else if (e.adId == process.env.REWARDED_INTERSTITIAL_AD_ID) {
    console.log("Rewarded Interstitial closed");
    ui.loadRewardedInterstitial();
  }
})