import Dom7, { touchend } from "dom7";
var $$ = Dom7;
const cache = {};
const sliderCache = {};
var genresRendered = [];
// Timers
var adTimer = 1;
var rewardedTimer = 1;
var rewardedInterstitialTimer = 1;
// Ads
var interstitial;
var rewarded;
var rewardedInterstitial;
var rewardedInterstitialLoaded = false;
var rewardedLoaded = false;

// Download storage vars
var downloads = {};
var totalFileSizes = {};
var downloadTasks = [];
var downloadOperating = null;

// select UI
var downloadedDOM = document.querySelector('.downloaded_dom');
var amountDownloaded = document.querySelector('.download_amount');
var downloadDOM = document.querySelector('.download_dom');

// import necessary modules
import { ref, set } from "firebase/database";
import { database } from "./data";
import Storage from "./storage";
import 'animate.css';
import { app } from ".";
import { movieGenres } from "./data";
import { showGenres } from "./data";

// import container states and positions
// not-api
import { containerPositions } from "./eventHandler";
import { containerStates } from "./eventHandler";
// api
import { apiContainerPagePositions } from "./eventHandler";
import { apiContainerPageStates } from "./eventHandler";
// import functions
import { getTitleMedia } from "./eventHandler";
// import title media
import { titleMediaData } from "./eventHandler";
// variables
var profileDOM = document.querySelector('.character_dom');
var actionsDOM = document.querySelector('.movie_actions_dom');
// The Movie Database options
export const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMDZjMzQ1MjY2MzBjNGQ5Y2I3ZjhhNjBiMjgzMzljMSIsInN1YiI6IjY1NWY3ZDg1MmIxMTNkMDEyZDAxYmViMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8nGJfNpyVKghpYZMcw8U7GT2c64_4t5wDLBU9GreKIY'
    }
}

export const options2 = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTRjMDcwNTQ4MTEwNTc1MGY2NTYwNWVmNzhiMTEzOCIsInN1YiI6IjY2NGE0NmI2Y2NkMWIyYmUyODkyZmY2MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.N65dSOgnFiBMsCeNfZdA3WoLHMxZQJ4oMFNeIzn0S9o'
    }
};

class UI {
    constructor() {

    }
    // general functions
    shortenText(string, maxLength) {
        if (string.length > maxLength) {
            return string.substring(0, maxLength) + '...';
        }
        return string;
    }
    getLogo(logos, original_language) {
        var englishLogos = logos.filter(logo => logo.iso_639_1 == "en");
        if (englishLogos.length > 0) {
            return englishLogos;
        } else {
            var originalLogos = logos.filter(logo => logo.iso_639_1 == `${original_language}`);
            if (originalLogos.length > 0) {
                return originalLogos;
            } else {
                if (logos.length > 0) {
                    const randomLogoIndex = Math.floor(Math.random() * logos.length);
                    var randomLogo = logos[randomLogoIndex];
                    return [randomLogo];
                } else {
                    return [];
                }
            }
        }
    }
    // general fetch methods
    async getTrendingMedia(mediaType, mediaCat, mediaPage) {
        var localData = await Storage.getAllData();
        const response = await fetch(`https://api.themoviedb.org/3/${mediaCat}/${mediaType}/week?language=en-US&page=${mediaPage}`, options);
        var data = await response.json();
        data.results.forEach((mediaData, index) => {
            let id = mediaData.id;
            var mediaAvail = localData.some(media => media.id == id);
            var media = localData.find(data => data.id == id);
            if (mediaAvail) {
                if (media.vj !== "" && media.vj) {
                    data.results[index].vj = media.vj;
                } else {
                    data.results[index].non_available = true;
                }
            }
        });
        return data.results;
    }
    async getPopularMedia(mediaType, mediaCat, mediaPage) {
        var localData = await Storage.getAllData();
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaCat}?language=en-US&page=${mediaPage}`, options);
        const data = await response.json();
        data.results.forEach((mediaData, index) => {
            let id = mediaData.id;
            var mediaAvail = localData.some(media => media.id == id);
            var media = localData.find(data => data.id == id);
            if (mediaAvail) {
                if (media.vj !== "" && media.vj) {
                    data.results[index].vj = media.vj;
                } else {
                    data.results[index].non_available = true;
                }
            }
        });
        return data.results;
    }
    async getAiringShows(mediaType, mediaCat, mediaPage) {
        var localData = await Storage.getAllData();
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaCat}?language=en-US&page=${mediaPage}`, options);
        const data = await response.json();
        data.results.forEach((mediaData, index) => {
            let id = mediaData.id;
            var mediaAvail = localData.some(media => media.id == id);
            var media = localData.find(data => data.id == id);
            if (mediaAvail) {
                if (media.vj !== "" && media.vj) {
                    data.results[index].vj = media.vj;
                } else {
                    data.results[index].non_available = true;
                }
            }
        });
        return data.results;
    }
    async getMediaCast(id) {
        const response = await fetch(`https://api.themoviedb.org/3/person/${id}?append_to_response=credits&language=en-US`, options)
        const data = await response.json();
        return data
    }
    async getMediaDetails(mediaId, mediaType) {
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?append_to_response=images%2Ccredits%2Cvideos`, options2);
        const data = await response.json();
        return data;
    }
    async getCollectionData(id) {
        const response = await fetch(`https://api.themoviedb.org/3/collection/${id}?language=en-US`, options);
        const data = await response.json();
        return data.parts;
    }
    // general ui render methods
    renderViewBackdrop(mediaDom, mediaArr, mediaType) {
        var titleProperty = mediaType === 'movie' ? 'title' : 'name';
        function getRandomMedia() {
            const randomIndex = Math.floor(Math.random() * mediaArr.length);
            return mediaArr[randomIndex];
        }
        const randomMedia = getRandomMedia();
        var overlay = document.createElement('div');
        overlay.className = 'overlay';
        var shortOverView = this.shortenText(randomMedia.overview, 180);
        overlay.innerHTML = `
        <h2 class="title">${randomMedia[titleProperty]}</h2>
            <h4 class="tagline">${shortOverView}</h4>
        <span>
            <i class="icon material-icons" data-name="${mediaType}" data-id="${randomMedia.id}">play_arrow</i>
        </span>
      `
        var backdropImg = document.createElement('img');
        backdropImg.className = "lazy backdrop";
        backdropImg.src = './back_placeholder.jpeg';
        backdropImg.setAttribute('data-src', `https://image.tmdb.org/t/p/w1280${randomMedia.backdrop_path}`);

        lazyLoadInstance.update();
        mediaDom.appendChild(backdropImg);
        mediaDom.appendChild(overlay);
    }
    renderViewMedia(mediaDom, mediaArr, mediaType, title) {
        // properties
        var titleProperty = mediaType === 'movie' ? 'title' : 'name';
        var releaseDateProperty = mediaType === 'movie' ? 'release_date' : 'first_air_date';
        var dataFormat = title === 'Popular' || title === 'Trending' || title === 'On the air' ? 'api' : 'not-api';
        var container = document.createElement('div');
        container.className = 'container';
        var header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = ` 
        <h3>${title}</h3> 
        <a href="#" data-title="${title}" data-name="${mediaType}" data-api="${dataFormat}" class="more_links">view more</a>
      `

        let content = document.createElement('div');
        content.className = `content ${dataFormat} ${title}`;
        content.id = `${title}${mediaType}s`;
        content.dataset.type = mediaType == "movie" ? "movie" : "serie";
        // let result = '';
        mediaArr.forEach(mediaItem => {
            // var title = this.shortenText(media[titleProperty], 14);
            var title = mediaItem[titleProperty];
            var date = mediaItem[releaseDateProperty];
            var poster = mediaItem.poster_path
            var id = mediaItem.id;
            var mediaCard = document.createElement('div');
            mediaCard.className = "media_card";

            var media = document.createElement('div');
            media.className = "media";
            var img = document.createElement('img');
            img.className = "movie_poster lazy";
            img.dataset.id = id;
            img.dataset.name = mediaType;
            img.dataset.page = "main";
            img.src = './placeholder.jpg';
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            media.appendChild(img);
            if (mediaItem.vj !== "" && mediaItem.vj) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = mediaItem.vj;
                media.appendChild(vjSpan);
            } else {
                if (mediaItem.non_available === true) {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                } else if (mediaItem.non_translated !== '' && mediaItem.non_translated) {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                } else if (mediaItem.category == 'serie') {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                }
            }

            var details = document.createElement('div');
            details.className = "details";
            details.innerHTML = `
            <h4>${title}</h4>
            <p>${date}</p>
            `
            mediaCard.appendChild(media);
            mediaCard.appendChild(details);

            content.appendChild(mediaCard);
        })
        lazyLoadInstance.update();
        container.appendChild(header);
        container.appendChild(content);
        mediaDom.appendChild(container);
        // call the view more after rendering
    }
    async renderScrollViewMedia(dom, genres, mediaType) {
        const query = mediaType === "movie" ? 'movie' : 'serie';
        const dateProperty = mediaType == 'movie' ? 'release_date' : 'first_air_date';
        const media = await Storage.getMedia(query);
        media.sort((a, b) => new Date(b[dateProperty]) - new Date(a[dateProperty]));
        genres.forEach(genre => {
            const title = genre;
            const genreMedia = media.filter((media) => media.genres.some((movieGenre) => movieGenre.name === genre)).slice(0, 12);
            // render
            this.renderViewMedia(dom, genreMedia, mediaType, title);
        })
    }
    renderWishMedia(mediaArr, mediaDOM) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        function shortenText2(string, maxLength) {
            if (string.length > maxLength) {
                return string.substring(0, maxLength) + '...';
            }
            return string;
        }
        mediaArr.forEach(media => {
            if (media.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = media.title;
            } else {
                shortenName = media.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var title = shortenText2(shortenName, 14);
            var date = media[dateProperty];
            var poster = media.poster_path
            var id = media.id;
            var mediaCard = document.createElement('div');
            mediaCard.className = "media_card";

            var deleteBtn = document.createElement('i');
            deleteBtn.className = "icon material-icons delete_button";
            deleteBtn.innerText = "delete";

            var media = document.createElement('div');
            media.className = "media";
            var img = document.createElement('img');
            img.className = "movie_poster lazy";
            img.dataset.id = id;
            img.dataset.name = mediaType;
            img.dataset.page = "main";
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            img.src = './placeholder.jpg';
            media.appendChild(img);

            var details = document.createElement('div');
            details.className = "details";
            details.innerHTML = `
            <h4 class="title">${title}</h4>
            <p>${date}</p>
            `
            mediaCard.appendChild(deleteBtn);
            mediaCard.appendChild(media);
            mediaCard.appendChild(details);

            // content.appendChild(mediaCard);
            mediaDOM.appendChild(mediaCard);
        });
        lazyLoadInstance.update();
    }
    renderScrollMedia(mediaArr, mediaDOM) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        mediaArr.forEach(mediaItem => {
            if (mediaItem.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = mediaItem.title;
            } else {
                shortenName = mediaItem.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var date = mediaItem[dateProperty];
            var poster = mediaItem.poster_path
            var id = mediaItem.id;
            var mediaCard = document.createElement('div');
            mediaCard.className = "media_card";

            var media = document.createElement('div');
            media.className = "media";
            var img = document.createElement('img');
            img.className = "movie_poster lazy";
            img.dataset.id = id;
            img.dataset.name = mediaType;
            img.dataset.page = "main";
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            img.src = './placeholder.jpg';
            media.appendChild(img);
            if (mediaItem.vj !== "" && mediaItem.vj) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = mediaItem.vj;
                media.appendChild(vjSpan);
            } else {
                if (mediaItem.non_available === true) {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                } else if (mediaItem.non_translated !== '' && mediaItem.non_translated) {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                } else if (mediaItem.category == 'serie') {
                    var vjSpan = document.createElement('span');
                    vjSpan.className = 'media_vj';
                    vjSpan.innerText = 'non translated';
                    media.appendChild(vjSpan);
                }
            }
            var details = document.createElement('div');
            details.className = "details";
            details.innerHTML = `
            <h4>${shortenName}</h4>
            <p>${date}</p>
            `
            mediaCard.appendChild(media);
            mediaCard.appendChild(details);

            // content.appendChild(mediaCard);
            mediaDOM.appendChild(mediaCard);
        });
        lazyLoadInstance.update();
    }
    renderCollection(mediaArr, mediaDOM, mediaPage) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        mediaArr.forEach(media => {
            if (media.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = media.title;
            } else {
                shortenName = media.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var date = media[dateProperty];
            var poster = media.poster_path
            var id = media.id;
            var list = document.createElement('li');

            var itemLink = document.createElement('a');
            itemLink.className = 'item-link movie_poster';
            itemLink.dataset.id = id;
            itemLink.dataset.page = mediaPage;
            itemLink.dataset.name = mediaType;
            // Create item content div
            var itemContent = document.createElement('div');
            itemContent.classList.add('item-content');
            itemContent.style.pointerEvents = 'none';
            // Create item media div
            var itemMedia = document.createElement('div');
            itemMedia.classList.add('item-media');
            // Create image element
            var img = document.createElement('img');
            img.className = "list_poster_img lazy"
            img.style.borderRadius = '8px';
            img.src = './placeholder.jpg';
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            // Append image to item media
            itemMedia.appendChild(img);
            // Create item inner div
            var itemInner = document.createElement('div');
            itemInner.classList.add('item-inner');
            // Create item title row div
            var itemTitleRow = document.createElement('div');
            itemTitleRow.classList.add('item-title-row');
            // Create item title div
            var itemTitle = document.createElement('div');
            itemTitle.classList.add('item-title');
            itemTitle.textContent = shortenName;
            // Append item title to item title row
            itemTitleRow.appendChild(itemTitle);
            // Append item title row to item inner
            itemInner.appendChild(itemTitleRow);
            // Create item subtitle div
            var itemSubtitle = document.createElement('div');
            itemSubtitle.classList.add('item-subtitle');
            itemSubtitle.textContent = mediaType;
            // Append item subtitle to item inner
            itemInner.appendChild(itemSubtitle);
            // Create item text div
            var itemText = document.createElement('div');
            itemText.classList.add('item-text');
            itemText.textContent = media.overview;
            // Append item text to item inner
            itemInner.appendChild(itemText);
            // Append item media, item inner to item content
            itemContent.appendChild(itemMedia);
            itemContent.appendChild(itemInner);
            // Append item content to anchor element
            itemLink.appendChild(itemContent);

            list.appendChild(itemLink);
            mediaDOM.appendChild(list)
        })
        lazyLoadInstance.update();
    }
    renderCast(castArr, mediaDOM) {
        castArr.forEach(cast => {
            var name = cast.name
            var character = cast.character
            var profile = cast.profile_path;
            var list = document.createElement('li');

            var itemLink = document.createElement('a');
            itemLink.className = 'item-link';
            // Create item content div
            var itemContent = document.createElement('div');
            itemContent.classList.add('item-content');
            itemContent.style.pointerEvents = 'none';
            // Create item media div
            var itemMedia = document.createElement('div');
            itemMedia.classList.add('item-media');
            // Create image element
            var img = document.createElement('img');
            img.className = "list_poster_img lazy"
            img.style.borderRadius = '8px';
            img.src = './placeholder.jpg';
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w300${profile}`);
            // Append image to item media
            itemMedia.appendChild(img);
            // Create item inner div
            var itemInner = document.createElement('div');
            itemInner.classList.add('item-inner');
            // Create item title row div
            var itemTitleRow = document.createElement('div');
            itemTitleRow.classList.add('item-title-row');
            // Create item title div
            var itemTitle = document.createElement('div');
            itemTitle.classList.add('item-title');
            itemTitle.textContent = name;
            // Append item title to item title row
            itemTitleRow.appendChild(itemTitle);
            // Append item title row to item inner
            itemInner.appendChild(itemTitleRow);
            // Create item subtitle div
            var itemSubtitle = document.createElement('div');
            itemSubtitle.classList.add('item-subtitle');
            itemSubtitle.textContent = character;
            // Append item subtitle to item inner
            itemInner.appendChild(itemSubtitle);
            // Append item media, item inner to item content
            itemContent.appendChild(itemMedia);
            itemContent.appendChild(itemInner);
            // Append item content to anchor element
            itemLink.appendChild(itemContent);

            list.appendChild(itemLink);
            mediaDOM.appendChild(list)
        })
        lazyLoadInstance.update();
    }
    renderEpisodes(mediaDOM, mediaArr, id) {
        mediaArr.forEach(episode => {
            var list = document.createElement('li');
            list.innerHTML = `
                <a class="no-ripple">
                        <div class="item-content">
                            <div class="item-media">
                                    <span>
                                        <i class="icon material-icons play_episode_btn" data-episode-name="${episode.name}" data-season-number="${episode.season_number}" data-show-id="${id}">play_circle</i>
                                    </span>
                                <img style="border-radius: 8px" src="./back_placeholder.jpeg" data-src="https://image.tmdb.org/t/p/w300${episode.still_path}" class="lazy backdrop still_image" />
                            </div>
                            <div class="item-inner">
                                    <i class="icon material-icons download_episode_btn ripple" data-episode-name="${episode.name}" data-season-number="${episode.season_number}" data-show-id="${id}">download
                                    </i>
                                <div class="item-title-row">
                                    <div class="item-title">Episode ${episode.episode_number}</div>
                                </div>
                                <div class="item-subtitle">${episode.name}</div>
                                <div class="item-text">${episode.overview}</div>
                            </div>
                        </div>
                    </a>
                `
            mediaDOM.appendChild(list);
        })
        lazyLoadInstance.update();
    }
    renderTime(minutes) {
        if (isNaN(minutes) || minutes < 0) {
            return "Invalid input";
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours === 0) {
            return `${remainingMinutes}min`;
        } else if (remainingMinutes === 0) {
            return `${hours}hr`;
        } else {
            return `${hours}hr ${remainingMinutes}min`;
        }
    }
    renderYear(date) {
        const year = date.split('-')[0];
        return parseInt(year);
    }
    renderSingleMedia(mediaItem, mediaDOM) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;

        if (mediaItem.title) {
            titleProperty = "title";
            dateProperty = "release_date";
            mediaType = "movie";
            shortenName = mediaItem.title;
        } else {
            shortenName = mediaItem.name;
            mediaType = "tv";
            titleProperty = "name";
            dateProperty = "first_air_date";
        }
        var date = mediaItem[dateProperty];
        var poster = mediaItem.poster_path
        var id = mediaItem.id;
        var mediaCard = document.createElement('div');
        mediaCard.className = "media_card";

        var media = document.createElement('div');
        media.className = "media";
        var img = document.createElement('img');
        img.className = "movie_poster lazy";
        img.dataset.id = id;
        img.dataset.name = mediaType;
        img.dataset.page = "main";
        img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
        img.src = './placeholder.jpg';
        media.appendChild(img);
        var newSpan = document.createElement('span');
        newSpan.className = "newSpan";
        newSpan.innerText = 'new';
        media.appendChild(newSpan);

        if (mediaItem.vj !== "" && mediaItem.vj) {
            var vjSpan = document.createElement('span');
            vjSpan.className = 'media_vj';
            vjSpan.innerText = mediaItem.vj;
            media.appendChild(vjSpan);
        } else {
            if (mediaItem.non_available === true) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                media.appendChild(vjSpan);
            } else if (mediaItem.non_translated !== '' && mediaItem.non_translated) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                media.appendChild(vjSpan);
            } else if (mediaItem.category == 'serie') {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                media.appendChild(vjSpan);
            }
        }
        var details = document.createElement('div');
        details.className = "details";
        details.innerHTML = `
            <h4>${shortenName}</h4>
            <p>${date}</p>
            `
        mediaCard.appendChild(media);
        mediaCard.appendChild(details);
        // content.appendChild(mediaCard);
        mediaDOM.prepend(mediaCard);
        lazyLoadInstance.update();
    }
    renderNewMedia(newItem) {
        var newGenres = [];
        newItem.genres.forEach(genre => {
            newGenres.push(genre.name)
        });
        console.log("New genres", newGenres);
        const commonGenres = newGenres.filter(genre => genresRendered.includes(genre));
        console.log("Common genres", commonGenres);

        commonGenres.forEach(commonGenre => {
            this.renderSingleMedia(newItem, document.querySelector(`.${commonGenre}`))
            console.log(document.querySelector(`.${commonGenre}`));
        })
    }
    handlePanelEvents() {
        $$('.wish-link').on('click', () => {
            app.views.current.router.navigate('/wishlist/');
        })
        $$('.about-link').on('click', () => {
            app.views.current.router.navigate('/about/');
        });
        $$('.search_icon').on('click', () => {
            app.views.current.router.navigate('/search_page/');
        })
        $$('.news-link').on('click', () => {
            app.views.current.router.navigate('/news/');
        })
    }
    handleDummy() {
        document.querySelector('#app').addEventListener('click', (event) => {
            if (event.target.classList.contains('dummy_poster')) {
                var Downloader = window.plugins.Downloader;
                var downloadSuccessCallback = function (result) {
                    {
                        path: "file:///storage/sdcard0/documents/mydata.pdf"; // Returns full file path
                        file: "mydata.pdf"; // Returns Filename
                        folder: "documents" // Returns folder name
                    }
                };
                var downloadErrorCallback = function (error) {
                    console.log(error);
                };
                var options = {
                    title: 'Downloading data',
                    url: "https://cartographicperspectives.org/index.php/journal/article/download/cp47-issue/pdf/2446",
                    path: "mydata.pdf",
                    description: 'The data is downloading',
                    visible: true,
                    folder: "documents"
                }
                Downloader.download(options, downloadSuccessCallback, downloadErrorCallback);
            }
        });
    }
    // ads
    loadInterstitial() {
        interstitial = new admob.InterstitialAd({
            adUnitId: process.env.INTERSTITIAL_AD_ID,
        })
        interstitial.on('load', (evt) => {
        })
        interstitial.load();
    }
    loadRewarded() {
        rewarded = new admob.RewardedAd({
            adUnitId: process.env.REWARDED_AD_ID,
        });
        rewarded.on('load', (evt) => {
            console.log('Rewarded loaded');
        })
        rewarded.load();
    }
    loadRewardedInterstitial() {
        rewardedInterstitial = new admob.RewardedInterstitialAd({
            adUnitId: process.env.REWARDED_INTERSTITIAL_AD_ID,
        });
        rewardedInterstitial.load();
    }
    // Start download
    updateDownloading() {
        if (downloadTasks.length > 0) {
            var downloading = downloadTasks.length;
            amountDownloaded.innerText = downloading;
        } else {
            amountDownloaded.innerText = 0;
        }
    }
    startDownload(downloadId) {
        const fileData = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        var uriString = fileData.uriString;
        var fileName = fileData.fileName;
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            fileSystem.getFile(fileName, { create: true }, (targetFile) => {
                var downloader = new BackgroundTransfer.BackgroundDownloader();
                var download = downloader.createDownload(uriString, targetFile);
                downloads[downloadId] = download.startAsync().then(
                    this.onSuccess.bind(this, downloadId),
                    this.onError.bind(this, downloadId),
                    this.onProgress.bind(this, downloadId)
                );
                document.querySelector(`.download_now${downloadId}`).remove();
                downloadOperating = downloads[downloadId];
            }, function (err) {
                console.error("Error accessing target file: ", err);
                alert("Error accessing target file: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    onProgress(downloadId, progress) {
        var bytesReceived = progress.bytesReceived;
        var totalBytes = progress.totalBytesToReceive;
        var percent = Math.floor((bytesReceived / totalBytes) * 100);
        // !bytes || bytes === 0
        if (totalBytes && totalBytes != 0 && bytesReceived && bytesReceived != 0) {
            totalFileSizes[downloadId] = this.formatBytes(totalBytes);
            this.updateProgressNotification(this.formatBytes(bytesReceived), downloadId, percent, this.formatBytes(totalBytes));
            app.progressbar.set(`.progressbar${downloadId}`, percent);
            document.querySelector(`.amount_downloaded${downloadId}`).innerText = this.formatBytes(bytesReceived);
            document.querySelector(`.total_downloaded${downloadId}`).innerText = this.formatBytes(totalBytes);
        } else {
            this.waitingNotification(downloadId);
        }
    }
    onError(downloadId, error) {

    }
    onSuccess(downloadId, result) {
        this.updateProgressNotification(totalFileSizes[downloadId], downloadId, 100, totalFileSizes[downloadId]);
        app.progressbar.set(`.progressbar${downloadId}`, 100);
        document.querySelector(`.amount_downloaded${downloadId}`).innerText = totalFileSizes[downloadId];
        document.querySelector(`.total_downloaded${downloadId}`).innerText = totalFileSizes[downloadId];
        var list = document.getElementById(`${downloadId}_download_id`);
        downloadDOM.removeChild(list);
        setTimeout(() => {
            this.downloadCompletedNotification(downloadId);
            this.readAndDisplayFiles(downloadId);
            delete downloads[downloadId]; // Remove completed download from the list
            downloadOperating = null; // Reset the downloadOperating state
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
            const nextFileData = downloadTasks[0];
            if (nextFileData) {
                const nextDownloadId = nextFileData.id;
                this.startDownload(nextDownloadId);
            } else {
                amountDownloaded.innerText = 0;
            }
        }, 1000);
    }
    // UI
    createProgressUI(downloadId) {
        var list = document.createElement('li');
        list.className = "animate__animated animate__fadeIn";
        list.setAttribute('id', `${downloadId}_download_id`);
        var backdropObj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        list.innerHTML = `
        <a class="item-link no-ripple">
            <div class="item-content">
                <div class="item-media">
                    <div class="overlay">
                    <div class="actions hide">
                        <a href="#">
                            <i class="f7-icons cancel_download_btn" data-id="${downloadId}">
                                xmark_circle
                            </i>
                        </a>
                    </div>
                    <img src="${backdropObj.backdrop}" />
                    </div>
                </div>
                <div class="item-inner">
                    <i class="icon material-icons ripple now_btn download_now${downloadId}" data-id="${downloadId}">download</i>
                    <div class="item-title-row">
                    <div class="item-title">${backdropObj.title}</div>
                    </div>
                    <div class="item-subtitle">
                    <span style="display: block;">Movie</span>
                    <span>
                        <span class="amount_downloaded${downloadId}">0.0 MB </span>/
                        <span class="total_downloaded${downloadId}">0.0 MB</span>
                    </span>
                    </div>
                    <div class="item-text">
                    <p style="margin-top: 2px;">
                        <span class="progressbar${downloadId}" id="download-progressbar"></span>
                    </p>
                    </div>
                </div>
            </div>
        </a>
        `;
        downloadDOM.appendChild(list);
        app.progressbar.show(`.progressbar${downloadId}`, 0);
    }
    createCompleteUI(nativeURL, fileName, thumbnail, file) {
        var list = document.createElement('li');
        list.className = "";
        list.innerHTML = `
            <a class="item-link no-ripple">
                <div class="item-content">
                    <div class="item-media">
                        <div class="overlay">
                        <div class="actions hide">
                            <a href="#">
                                <i class="f7-icons play_downloaded_video" data-url="${nativeURL}">play_circle</i>
                            </a>
                        </div>
                        <img src="${thumbnail}" />
                        </div>
                    </div>
                    <div class="item-inner">
                        <div class="item-title-row">
                        <div class="item-title">${fileName}</div>
                        </div>
                        <div class="item-subtitle">
                        <span style="display: block;">Movie</span>
                        </div>
                        <div class="item-text">
                        <p style="margin-top: 2px; margin-bottom: 2px; color: var(--f7-theme-color);">${this.formatBytes(file.size)}</p>
                        <p style="margin-top: 2px; margin-bottom: 2px; color: var(--f7-theme-color);">Downloaded</p>
                        </div>
                    </div>
                </div>
            </a>
        `
        downloadedDOM.appendChild(list);
    }
    readAndDisplayFiles(downloadId) {
        var backdropObj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        downloadedDOM.innerHTML = '';
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            var reader = fileSystem.createReader();
            downloadedDOM.innerHTML = '';
            reader.readEntries((entries) => {
                entries.forEach(entry => {
                    if (entry.isFile) {
                        entry.file((file) => {
                            Storage.saveVideoThumbNail(entry.nativeURL, backdropObj.backdrop);
                            this.createCompleteUI(entry.nativeURL, entry.name, Storage.getVideoThumbnail(entry.nativeURL), file);
                        }, (err) => {
                            console.error("Error getting file: ", err);
                            alert("Error getting file: " + JSON.stringify(err));
                        });
                    }
                });
            }, function (err) {
                console.error("Error reading directory: ", err);
                alert("Error reading directory: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    // Notifications 
    updateProgressNotification(downloadedBytes, downloadId, percentage, totalBytes) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        const notification = {
            id: downloadId,
            title: obj.title,
            text: `${downloadedBytes} of ${totalBytes}`,
            progressBar: { value: percentage },
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(notification);
    }
    waitingNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        const notification = {
            id: downloadId,
            title: obj.title,
            text: 'Waiting for network !',
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(notification);
    }
    downloadCompletedNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        cordova.plugins.notification.local.cancel(downloadId);
        const completeNotification = {
            id: downloadId,
            title: 'Download Complete!',
            text: `${obj.title} finished successfully.`,
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(completeNotification);
    }
    downloadCancelledNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        cordova.plugins.notification.local.cancel(downloadId);
        const cancelledNotification = {
            id: downloadId,
            title: 'Download Cancelled!',
            text: `${obj.title} cancelled.`,
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(cancelledNotification);
    }
    // Cancel download
    cancelDownload(downloadId) {
        if (downloads[downloadId]) {
            downloads[downloadId].cancel();
            var list = document.getElementById(`${downloadId}_download_id`);
            downloadDOM.removeChild(list);
            this.downloadCancelledNotification(downloadId);
            delete downloads[downloadId]; // Remove the canceled download from the list
            downloadOperating = null; // Reset the downloadOperating state
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
        } else {
            var list = document.getElementById(`${downloadId}_download_id`);
            downloadDOM.removeChild(list);
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
        }
    }
    // general ui event handlers
    accessNativeFunctionality() {
        cordova.plugins.StatusBarHeight.getStatusBarHeight(
            function (value) {
                document.documentElement.style.setProperty('--f7-safe-area-top', `${value}px`);
            },
            function (error) {
                console.log(error);
            }
        );
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.setDefaults({
            title: 'Muvi hub',
            text: 'Your downloads are ongoing.',
            icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
            color: 'F14F4D', // hex format like 'F14F4D'
            resume: true,
            hidden: true,
            bigText: true
        });
        cordova.plugins.backgroundMode.on('activate', function () {
            cordova.plugins.backgroundMode.disableWebViewOptimizations();
        });
        cordova.plugins.backgroundMode.on('deactivate', function () {
        });
        document.addEventListener('backbutton', () => {
            app.views.current.router.back();
        }, false);
        FirebasePlugin.hasPermission(function (hasPermission) {
            console.log("Permission is " + (hasPermission ? "granted" : "denied"));
            FirebasePlugin.getToken(function (fcmToken) {
                Storage.saveToken(fcmToken);
            }, function (error) {
                console.error(error);
            });
        });
        FirebasePlugin.subscribe("allUsers", function () {
            console.log("Subscribed to topic");
        }, function (error) {
            console.error("Error subscribing to topic: " + error);
        }
        );
        // // handle ads
        $$(document).on('page:beforein', async (e) => {
            if (e.target.id == 'main') {
                if (rewardedInterstitialTimer == 4) {
                    await rewardedInterstitial.show();
                    console.log('Showing rewarded interstitial ...');
                    rewardedInterstitialTimer = 2;
                } else if (rewardedInterstitialTimer == 2) {
                    if (rewardedInterstitialLoaded == false) {
                        rewardedInterstitialTimer += 1;
                        this.loadRewardedInterstitial();
                        console.log('Loading rewarded interstitial for the first time');
                        rewardedInterstitialLoaded = true;
                    } else {
                        rewardedInterstitialTimer += 1;
                    }
                } else {
                    rewardedInterstitialTimer += 1;
                }
            }
            NavigationBar.backgroundColorByHexString('#30262e', false);
        });
        this.loadInterstitial();
    }
    // handle app links and notification clicks
    subscribeAppLink() {
        universalLinks.subscribe(null, (eventData) => {
            this.handleAppLinks(eventData.url);
        });
    }
    subscribeNotification() {
        FirebasePlugin.onMessageReceived(async (message) => {
            if (message.tap === 'background') {
                console.log('App brought to foreground by notification tap');
                this.handleNotificationsClick(message.notification_id, message.notification_type);
            } else if (message.tap === 'foreground') {
                this.handleNotificationsClick(message.notification_id, message.notification_type);
            } else {
                console.log('Notification received in foreground');
            }
        }, function (error) {
            console.error(error);
        });
    }
    // click handler
    async clickHandler(event) {
        const target = event.target;
        if (target.classList.contains('more_links')) {
            var container = target.parentElement.nextElementSibling;
            var content = target.parentElement.nextElementSibling.innerHTML;
            var title = target.dataset.title;
            var isApi = target.dataset.api;
            var mediaType = target.dataset.name;
            var containerPosition;
            var containerState;
            var containerData;
            var routepath = isApi === "api" ? "/more/" : "/more_2/";

            if (isApi === "not-api") {
                // Initialize currentPosition for the container if it doesn't exist
                if (!containerPositions[container.id]) {
                    containerPositions[container.id] = 6;
                }
                // Initialize container state if it doesn't exist
                if (!containerStates[container.id]) {
                    containerStates[container.id] = { canLoadMore: true };
                }
                // assign positions and states
                containerPosition = containerPositions[container.id];
                containerState = containerStates[container.id].canLoadMore
                // assign container data
                if (titleMediaData[container.id]) {
                    containerData = titleMediaData[container.id];
                } else {
                    containerData = await getTitleMedia(title, mediaType);
                }
            } else {
                // Initialize currentPosition for the container if it doesn't exist
                if (!apiContainerPagePositions[container.id]) {
                    apiContainerPagePositions[container.id] = 2;
                }
                // Initialize container page state if it doesn't exist
                if (!apiContainerPageStates[container.id]) {
                    apiContainerPageStates[container.id] = { canLoadMore: true };
                }
                // assign positions and states
                containerPosition = apiContainerPagePositions[container.id];
                containerState = apiContainerPageStates[container.id].canLoadMore;
                // assign container data

            }
            var containerId = container.id;
            // well navigate to more 😎😎
            app.views.current.router.navigate(routepath, { props: { title, content, isApi, containerPosition, containerState, containerData, containerId, mediaType } });

        } else if (target.classList.contains('movie_poster')) {
            // detail pages logic
            var mediaId = event.target.dataset.id;
            var mediaType = event.target.dataset.name;
            var data = await Storage.getAllData();
            var mediaAvail = data.some(media => media.id == mediaId);
            var mediaObj = null;
            var mediaPage = event.target.dataset.page;
            var routePath;
            // handle interstitial ad
            if (mediaPage === "main") {
                routePath = mediaType === 'movie' ? '/movie_page_1/' : '/tvshows_page_1/';
            } else {
                routePath = mediaType === 'movie' ? '/movie_page_2/' : '/tvshows_page_2/';
            }
            if (mediaAvail) {
                var mediaObj = data.find(media => media.id == mediaId);
                mediaObj.media_available = mediaAvail;
                mediaObj.media_type = mediaType;
                if (adTimer == 2) {
                    await interstitial.show();
                    app.views.current.router.navigate(routePath, { props: { mediaObj } });
                    adTimer = 1;
                } else {
                    adTimer += 1;
                    app.views.current.router.navigate(routePath, { props: { mediaObj } });
                }
            } else {
                const getDetails = async () => {
                    try {
                        if (cache.hasOwnProperty(mediaId)) {
                            if (adTimer == 2) {
                                await interstitial.show();
                                navigateWithCachedData(cache[mediaId]);
                                adTimer = 1;
                            } else {
                                adTimer += 1;
                                navigateWithCachedData(cache[mediaId]);
                            }
                        } else {
                            app.preloader.show();
                            this.getMediaDetails(mediaId, mediaType)
                                .then(async (data) => {
                                    // modify the media obj.
                                    var logosToUse = this.getLogo(data.images.logos, data.original_language);
                                    data.cast = data.credits.cast.filter(cast => cast.profile_path !== null);
                                    delete data.credits;
                                    data.logo_path = logosToUse.length > 0 ? logosToUse[0].file_path : null;
                                    delete data.images;
                                    var trailers = data.videos.results.filter(video => {
                                        return video.type == "Trailer";
                                    });
                                    data.trailers = trailers.length > 0 ? trailers : null;
                                    delete data.videos;
                                    cache[mediaId] = data;
                                    data.translated = "";
                                    data.non_translated = "";
                                    if (adTimer == 2) {
                                        await interstitial.show();
                                        navigateWithCachedData(data);
                                        adTimer = 1;
                                    } else {
                                        adTimer += 1;
                                        navigateWithCachedData(data);
                                    }
                                })
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                getDetails();
                function navigateWithCachedData(data) {
                    setTimeout(() => {
                        app.preloader.hide();
                        const mediaObj = data;
                        mediaObj.media_available = mediaAvail;
                        mediaObj.media_type = mediaType;
                        app.views.current.router.navigate(routePath, {
                            props: { mediaObj }
                        }, { force: true });
                    }, 100);
                }

            }
        } else if (event.target.classList.contains('watch_media_btn')) {
            let watchpreferencesDOM = document.querySelector('.watch_preferences_dom');
            let id = event.target.dataset.id;
            let data = await Storage.getAllData();
            let obj = data.find(data => data.id == id);
            if (obj.non_translated && obj.translated) {
                watchpreferencesDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close watch_btn_link" data-url="${obj.non_translated}">
                    Watch Non translated
                </button>
                <button class="button button-fill delete_btn actions-close watch_btn_link" data-url="${obj.translated}">
                    Watch Translated ${obj.vj}
                </button>
                `;
            } else {
                if (obj.non_translated) {
                    watchpreferencesDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close watch_btn_link" data-url="${obj.non_translated}">
                        Watch Non translated
                    </button>
                    `;
                } else if (obj.translated) {
                    watchpreferencesDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close watch_btn_link" data-url="${obj.translated}">
                        Watch Translated ${obj.vj}
                    </button>
                    `;
                }
            }
            app.actions.open('.watch-preference-actions', true);
        } else if (event.target.classList.contains('watch_btn_link')) {
            let url = event.target.dataset.url;
            // 1. streaming media player plugin
            var options = {
                successCallback: function () {
                    console.log("Video was closed without error.");
                },
                errorCallback: function (errMsg) {
                    console.log("Error! " + errMsg);
                },
                orientation: 'landscape',
                shouldAutoClose: true,
                controls: true
            };
            window.plugins.streamingMedia.playVideo(url, options);
        } else if (event.target.classList.contains('play_trailer')) {
            var trailerKey = event.target.dataset.key;
            app.views.current.router.navigate('/play_trailer/', { props: { trailerKey } });
        } else if (event.target.classList.contains('download_btn')) {
            let preferencesDOM = document.querySelector('.download_preferences_dom');
            let id = event.target.dataset.id;
            let data = await Storage.getAllData();
            let obj = data.find(data => data.id == id);
            let backdrop = `https://image.tmdb.org/t/p/w1280${obj.backdrop_path}`;
            if (obj.non_translated && obj.translated) {
                preferencesDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close download_btn_link" data-url="${obj.non_translated}" data-title="${obj.title}"  data-backdrop="${backdrop}">
                    Non translated
                </button>
                <button class="button button-fill delete_btn actions-close download_btn_link" data-url="${obj.translated}" data-title="${obj.title}" data-backdrop="${backdrop}">
                    Translated Vj juniour
                </button>
                `;
            } else {
                if (obj.non_translated) {
                    preferencesDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close download_btn_link" data-url="${obj.non_translated}" data-title="${obj.title}" data-backdrop="${backdrop}">
                        Non translated
                    </button>
                    `;
                } else if (obj.translated) {
                    preferencesDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close download_btn_link" data-url="${obj.translated}" data-title="${obj.title}" data-backdrop="${backdrop}"">
                        Translated ${obj.vj}
                    </button>
                    `;
                }
            }
            app.actions.open('.download-preference-actions', true);
        } else if (event.target.classList.contains('download_btn_link')) {
            let url = event.target.dataset.url;
            let backdropURL = event.target.dataset.backdrop;
            let title = event.target.dataset.title;
            let parts = url.split('/');
            var fileName = parts[parts.length - 1];
            var id = Date.now();
            var file = {
                id: id,
                uriString: url,
                fileName: fileName,
                title: title,
                backdrop: backdropURL
            };
            if (rewardedLoaded == false) {
                this.loadRewarded();
                rewardedLoaded = true;
            }
            if (!downloadTasks.some(downloadTask => downloadTask.fileName == file.fileName)) {
                downloadTasks.push(file);
                if (downloadOperating != null) {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        rewardedTimer += 1;
                    }
                } else {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer += 1;
                    }
                }
            } else {
                console.log('Download task already exists');
            }
        } else if (target.classList.contains('play_episode_btn')) {
            var episodeWatchPreferenceDOM = document.querySelector('.episode_watch_preferences_dom');
            var showId = event.target.dataset.showId;
            var seasonNumber = event.target.dataset.seasonNumber;
            var episodeName = event.target.dataset.episodeName;
            var data = await Storage.getAllData();
            var show = data.find(media => media.id == showId);
            var season = show.seasons.find(season => season.season_number == seasonNumber);
            var episode = season.episodes.find(episode => episode.name == episodeName);
            if (episode.non_translated_url && episode.translated_url) {
                episodeWatchPreferenceDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close watch_episode_link" data-url="${episode.non_translated_url}">
                    Watch Non translated
                </button>
                <button class="button button-fill delete_btn actions-close watch_episode_link" data-url="${episode.translated_url}">
                    Watch translated 
                </button>
                `;
            } else {
                if (episode.non_translated_url) {
                    episodeWatchPreferenceDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close watch_episode_link" data-url="${episode.non_translated_url}">
                        Watch Non translated
                    </button>
                    `;
                } else if (episode.translated_url) {
                    episodeWatchPreferenceDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close watch_episode_link" data-url="${episode.translated_url}">
                        Watch Translated
                    </button>
                    `;
                }
            }
            app.actions.open('.episode-watch-preference-actions', true);
        } else if (target.classList.contains('watch_episode_link')) {
            let url = event.target.dataset.url;
            // 1. streaming media player plugin
            var options = {
                successCallback: function () {
                    console.log("Video was closed without error.");
                },
                errorCallback: function (errMsg) {
                    console.log("Error! " + errMsg);
                },
                orientation: 'landscape',
                shouldAutoClose: true,
                controls: true
            };
            window.plugins.streamingMedia.playVideo(url, options);
        } else if (event.target.classList.contains('download_episode_btn')) {
            var episodePreferenceDOM = document.querySelector('.episode_preferences_dom');
            var showId = event.target.dataset.showId;
            var seasonNumber = event.target.dataset.seasonNumber;
            var episodeName = event.target.dataset.episodeName;
            var data = await Storage.getAllData();
            var show = data.find(media => media.id == showId);
            var season = show.seasons.find(season => season.season_number == seasonNumber);
            var episode = season.episodes.find(episode => episode.name == episodeName);
            var episodeThumbnail = `https://image.tmdb.org/t/p/w300${episode.still_path}`;
            if (episode.non_translated_url && episode.translated_url) {
                episodePreferenceDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close download_episode_link" data-url="${episode.non_translated_url}" data-title="${show.name}" data-episode-name="${episode.name}" data-season-name="Season ${episode.season_number}" data-backdrop="${episodeThumbnail}">
                    Non translated
                </button>
                <button class="button button-fill delete_btn actions-close download_episode_link" data-url="${episode.translated_url}" data-title="${show.name}" data-episode-name="${episode.name}" data-season-name="Season ${episode.season_number}" data-backdrop="${episodeThumbnail}">
                    Translated 
                </button>
                `;
            } else {
                if (episode.non_translated_url) {
                    episodePreferenceDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close download_episode_link" data-url="${episode.non_translated_url}" data-title="${show.name}" data-episode-name="${episode.name}" data-season-name="Season ${episode.season_number}" data-backdrop="${episodeThumbnail}">
                        Non translated
                    </button>
                    `;
                } else if (episode.translated_url) {
                    episodePreferenceDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close download_episode_link" data-url="${episode.translated_url}" data-title="${show.name}" data-episode-name="${episode.name}" data-season-name="Season ${episode.season_number}" data-backdrop="${episodeThumbnail}">
                        Translated
                    </button>
                    `;
                }
            }
            app.actions.open('.episode-preference-actions', true);
        } else if (event.target.classList.contains('download_episode_link')) {
            let episodeName = event.target.dataset.episodeName.replace(/\s/g, "");
            let seasonName = event.target.dataset.seasonName.replace(/\s/g, "");
            let url = event.target.dataset.url;
            let parts = url.split('/');
            let title = event.target.dataset.title.replace(/\s/g, "");
            var fileName = parts[parts.length - 1];
            var backdrop = event.target.dataset.backdrop;
            var id = Date.now();
            var file = {
                id: id,
                uriString: url,
                fileName: fileName,
                title: title,
                backdrop: backdrop
            };
            if (rewardedLoaded == false) {
                this.loadRewarded();
                rewardedLoaded = true;
            }
            if (!downloadTasks.some(downloadTask => downloadTask.fileName == file.fileName)) {
                downloadTasks.push(file);
                if (downloadOperating != null) {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        rewardedTimer += 1;
                    }
                } else {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer += 1;
                    }
                }
            } else {
                console.log('Download task already exists');
            }
        } else if (event.target.classList.contains('action_icon')) {
            let id = parseInt(event.target.dataset.id);
            let action = event.target.dataset.action;
            let icon = event.target.firstElementChild;
            let text = event.target.lastElementChild;
            if (action == "wishlistSlider") {
                let object = sliderCache[id];
                var wishlist = Storage.getWishlist();
                wishlist.push(object);
                text.innerHTML = 'Added';
                icon.className = 'material-icons';
                event.target.style.pointerEvents = "none";
                Storage.saveWishList(wishlist);
            } else if (action == "wishlistPage") {
                let object;
                if (cache[id]) {
                    object = cache[id];
                } else {
                    object = await Storage.getSingleData(id);
                }
                var wishlist = Storage.getWishlist();
                wishlist.push(object);
                text.innerHTML = 'Added';
                icon.className = 'material-icons';
                event.target.style.pointerEvents = "none";
                Storage.saveWishList(wishlist);

            } else if (action == "request") {
                let id = event.target.dataset.id;
                let name = event.target.dataset.name;
                var toast
                var token = Storage.getToken();
                event.target.style.pointerEvents = "none";
                text.innerHTML = 'Sent';
                icon.className = 'material-icons';
                var requestInfo = { id: id, name: name, token: token }
                const dbRef = ref(database, 'userNotifications/' + id);
                set(dbRef, requestInfo)
                    .then(() => {
                        // save requestedlist
                        var requestList = Storage.getRequestList();
                        requestList.push(requestInfo);
                        Storage.saveRequestList(requestList);
                        // show toast
                        toast = app.toast.create({
                            text: "You will be notified when your movie is uploaded thank you 🥰🥰",
                            position: 'top',
                            closeTimeout: 2500,
                        });
                        toast.open();
                    })
                    .catch((error) => {
                        console.log('There was an error with the requset', error);
                    })
            }
        } else if (event.target.classList.contains('delete_button')) {
            let id = event.target.parentElement.children[1].firstElementChild.dataset.id;
            let card = event.target.parentElement;
            let parentDOM = event.target.parentElement.parentElement;
            let wishlist = Storage.getWishlist();
            let newWishlist = wishlist.filter(
                (media) => media.id != id
            );
            Storage.saveWishList(newWishlist);
            parentDOM.removeChild(card);
        } else if (target.classList.contains('share_btn')) {
            var mediaId = event.target.dataset.id;
            var mediaType = event.target.dataset.type;
            var posterUrl = event.target.dataset.poster;
            var mediaName = event.target.dataset.name;
            console.log(mediaType, mediaId);
            var link = `https://kamumedia.online/${mediaType}/${mediaId}`;
            window.plugins.socialsharing.share(`${mediaName}`, null, `${posterUrl}`, link);
        } else if (event.target.classList.contains('play_downloaded_video')) {
            let url = event.target.dataset.url;
            cordova.plugins.fileOpener2.showOpenWithDialog(
                url,
                'video/*',
                {
                    error: function (e) {
                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    },
                    success: function () {
                        console.log('file opened successfully');
                    },
                    position: [0, 0]
                }
            );
        } else if (event.target.classList.contains('cancel_download_btn')) {
            let id = event.target.dataset.id;
            this.cancelDownload(id);
        } else if (event.target.classList.contains('now_btn')) {
            let id = event.target.dataset.id;
            if (downloadOperating == null) {
                this.startDownload(id);
            }
        }
    }
    async handleNotificationsClick(mediaId, mediaType) {
        var data = await Storage.getAllData();
        var mediaObj = data.find(media => media.id == mediaId);
        if (mediaObj) {
            app.preloader.show();
            var currTab = mediaType === 'movie' ? 'movies' : 'tvshows';
            app.tab.show(`#${currTab}`);
            mediaObj.media_available = true;
            mediaObj.media_type = mediaType;
            var routePath = mediaType === 'movie' ? '/movie_page_1/' : '/tvshows_page_1/';
            setTimeout(() => {
                app.preloader.hide();
                app.views.current.router.navigate(routePath, { props: { mediaObj } });
            }, 2000)
        }
    }
    readInitialDownloads() {
        downloadedDOM.innerHTML = '';
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            var reader = fileSystem.createReader();
            downloadedDOM.innerHTML = '';
            reader.readEntries((entries) => {
                entries.forEach(entry => {
                    if (entry.isFile) {
                        entry.file((file) => {
                            this.createCompleteUI(entry.nativeURL, entry.name, Storage.getVideoThumbnail(entry.nativeURL), file);
                        }, (err) => {
                            console.error("Error getting file: ", err);
                            alert("Error getting file: " + JSON.stringify(err));
                        });
                    }
                });
            }, function (err) {
                console.error("Error reading directory: ", err);
                alert("Error reading directory: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    async handleAppLinks(url) {
        if (url != undefined) {
            app.preloader.show();
            var parts = url.split("/");
            var id = parts[parts.length - 1];
            var mediaType = parts[parts.length - 2];
            var data = await Storage.getAllData();
            var mediaAvail = data.some(media => media.id == id);
            if (mediaAvail) {
                var mediaObj = data.find(media => media.id == id);
                var routePath = mediaType === 'movie' ? '/movie_page_1/' : '/tvshows_page_1/';
                var currTab = mediaType === 'movie' ? 'movies' : 'tvshows';
                app.tab.show(`#${currTab}`);
                mediaObj.media_available = mediaAvail;
                mediaObj.media_type = mediaType;
                setTimeout(() => {
                    app.preloader.hide();
                    app.views.current.router.navigate(routePath, { props: { mediaObj } });
                }, 2000);
            } else {
                var currTab = mediaType === 'movie' ? 'movies' : 'tvshows';
                app.tab.show(`#${currTab}`);
                this.getMediaDetails(id, mediaType)
                    .then((data) => {
                        // modify the media obj
                        var logosToUse = this.getLogo(data.images.logos, data.original_language);
                        data.cast = data.credits.cast.filter(cast => cast.profile_path !== null);
                        delete data.credits;
                        data.logo_path = logosToUse.length > 0 ? logosToUse[0].file_path : null;
                        delete data.images;
                        var trailers = data.videos.results.filter(video => {
                            return video.type == "Trailer";
                        });
                        data.trailers = trailers.length > 0 ? trailers : null;
                        delete data.videos;
                        data.translated = "";
                        data.non_translated = "";
                        var routePath = mediaType === 'movie' ? '/movie_page_1/' : '/tvshows_page_1/';
                        const mediaObj = data;
                        mediaObj.media_available = mediaAvail;
                        mediaObj.media_type = mediaType;
                        setTimeout(() => {
                            app.preloader.hide();
                            app.views.current.router.navigate(routePath, { props: { mediaObj } });
                        }, 2000);
                    })
            }
        }
    }
    assignVJ(mediaItem, parent) {
        if (mediaItem.vj !== "" && mediaItem.vj) {
            var vjSpan = document.createElement('span');
            vjSpan.className = 'media_vj';
            vjSpan.innerText = mediaItem.vj;
            parent.appendChild(vjSpan);
        } else {
            if (mediaItem.non_available === true) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                parent.appendChild(vjSpan);
            } else if (mediaItem.non_translated !== '' && mediaItem.non_translated) {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                parent.appendChild(vjSpan);
            } else if (mediaItem.category == 'serie') {
                var vjSpan = document.createElement('span');
                vjSpan.className = 'media_vj';
                vjSpan.innerText = 'non translated';
                parent.appendChild(vjSpan);
            }
        }
    }
    sliderWishlist(doesExist, sliderBtnDOM) {
        if (doesExist) {
            sliderBtnDOM.firstElementChild.className = 'material-icons';
            sliderBtnDOM.lastElementChild.innerText = 'Added';
            sliderBtnDOM.style.pointerEvents = 'none';
        } else {
            sliderBtnDOM.firstElementChild.className = 'material-icons-outlined';
            sliderBtnDOM.lastElementChild.innerText = 'Wishlist';
            sliderBtnDOM.style.pointerEvents = 'all';
        }
    }
    async moviesView(swiper) {
        // variables
        var moviesDOM = document.querySelector('.movies_dom');
        var swiperSliderImages = document.querySelectorAll('.swiper-slide-image');
        var sliderTitle = document.querySelector('.slider_title');
        var previewBtn = document.querySelector('.preview_btn_movie');
        var movieSliderWishBtn = document.querySelector('.wishlist_button_movie');
        var movieSliderGenres = document.querySelector('.slider_genres_movie');

        const movieData = await Storage.getMedia('movie');
        // functions
        function debounce(func, delay) {
            let timer;
            return function () {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, arguments);
                }, delay);
            };
        }
        // check wishListed
        function checkkWishList(id) {
            var wishlist = Storage.getWishlist();
            var exists = wishlist.find(item => item.id == id);
            return exists;
        }
        function getGenreNames(genreIds) {
            var genreNames = genreIds.map(id => {
                var genre = movieGenres.find(genre => genre.id === id);
                return genre ? genre.name : null;
            }).filter(name => name !== null); // remove null values
            return genreNames.join(", ");
        }
        // Add logic to render movies here 😍😍
        const trendingData = await this.getTrendingMedia('movie', 'trending', 1);
        swiperSliderImages.forEach((swiperSliderImage, index) => {
            let poster = `https://image.tmdb.org/t/p/w500${trendingData[index].poster_path}`;
            let id = trendingData[index].id;
            ui.assignVJ(trendingData[index], swiperSliderImage.parentElement);
            sliderCache[id] = trendingData[index];
            let title = trendingData[index].title;
            let genres = getGenreNames(trendingData[index].genre_ids);
            swiperSliderImage.setAttribute('src', poster);
            swiperSliderImage.setAttribute('data-id', id);
            swiperSliderImage.setAttribute('data-title', title);
            swiperSliderImage.setAttribute('data-page', 'main');
            swiperSliderImage.setAttribute('data-name', 'movie');
            swiperSliderImage.setAttribute('data-name', 'movie');
            swiperSliderImage.setAttribute('data-genres', genres);
            // console.log(swiperSliderImage.parentElement);
        })
        const activeIndex = swiper.activeIndex;
        const activeSlide = swiper.slides[activeIndex];
        let name = activeSlide.firstElementChild.dataset.title;
        let id = activeSlide.firstElementChild.dataset.id;
        sliderTitle.innerText = name;
        movieSliderGenres.innerText = activeSlide.firstElementChild.dataset.genres;
        previewBtn.classList.add('movie_poster');
        previewBtn.setAttribute('data-id', id);
        movieSliderWishBtn.classList.add('action_icon');
        movieSliderWishBtn.setAttribute('data-id', id);
        // check initial wishlist
        let exists = checkkWishList(id);
        this.sliderWishlist(exists, movieSliderWishBtn);
        // handle slider
        swiper.on("transitionStart", debounce(() => {
            const activeIndex = swiper.activeIndex;
            const activeSlide = swiper.slides[activeIndex];
            let name = activeSlide.firstElementChild.dataset.title;
            let id = activeSlide.firstElementChild.dataset.id;
            sliderTitle.innerText = name;
            movieSliderGenres.innerText = activeSlide.firstElementChild.dataset.genres
            previewBtn.setAttribute('data-id', id);
            movieSliderWishBtn.setAttribute('data-id', id);
            // reset button
            let exists = checkkWishList(id);
            this.sliderWishlist(exists, movieSliderWishBtn);
        }), 500);

        this.renderViewMedia(moviesDOM, trendingData, 'movie', 'Trending');
        // popular data here
        const popularData = await this.getPopularMedia('movie', 'popular', 1);
        this.renderViewMedia(moviesDOM, popularData, 'movie', 'Popular');
        // infinite genre logic
        const genreCounts = {};
        movieData.forEach((data) => {
            data.genres.forEach((genre) => {
                genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
            });
        });
        const popularGenres = Object.keys(genreCounts).filter((genre) => genreCounts[genre] >= 6);
        // infinite logic
        var loading = true;
        var currentPosition = 0;

        $$('#movie_scroll').on('infinite', () => {
            if (!loading) return;
            loading = false;
            setTimeout(async () => {
                var selectedGenres = popularGenres.slice(currentPosition, currentPosition + 4);
                selectedGenres.forEach(genre => genresRendered.push(genre));
                console.log(genresRendered);
                await this.renderScrollViewMedia(moviesDOM, selectedGenres, 'movie');
                currentPosition += 4;
                if (currentPosition >= popularGenres.length) {
                    app.infiniteScroll.destroy('#movie_scroll');
                    document.querySelector('#movie_scroll_preloader').remove();
                }
                loading = true;
            }, 500)
        })
    }
    async showsView(swiper) {
        // variables
        var showsDOM = document.querySelector('.shows_dom');
        var swiperSliderImages = document.querySelectorAll('.swiper-slide-image1');
        var sliderTitle = document.querySelector('.slider_title1');
        var previewBtn = document.querySelector('.preview_btn_movie1');
        var movieSliderWishBtn = document.querySelector('.wishlist_button_movie1');
        var movieSliderGenres = document.querySelector('.slider_genres_show');

        const showData = await Storage.getMedia('serie');
        // functions
        function debounce(func, delay) {
            let timer;
            return function () {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, arguments);
                }, delay);
            };
        }
        // check wishListed
        function checkkWishList(id) {
            var wishlist = Storage.getWishlist();
            var exists = wishlist.find(item => item.id == id);
            return exists;
        }
        function getGenreNames(genreIds) {
            var genreNames = genreIds.map(id => {
                var genre = showGenres.find(genre => genre.id === id);
                return genre ? genre.name : null;
            }).filter(name => name !== null); // remove null values
            return genreNames.join(", ");
        }
        // Add logic to render movies here 😍😍
        const trendingData = await this.getTrendingMedia('tv', 'trending', 1);
        swiperSliderImages.forEach((swiperSliderImage, index) => {
            let poster = `https://image.tmdb.org/t/p/w500${trendingData[index].poster_path}`;
            let id = trendingData[index].id;
            sliderCache[id] = trendingData[index];
            let title = trendingData[index].name;
            ui.assignVJ(trendingData[index], swiperSliderImage.parentElement);
            let genres = getGenreNames(trendingData[index].genre_ids);
            swiperSliderImage.setAttribute('src', poster);
            swiperSliderImage.setAttribute('data-id', id);
            swiperSliderImage.setAttribute('data-title', title);
            swiperSliderImage.setAttribute('data-page', 'main');
            swiperSliderImage.setAttribute('data-name', 'tv');
            swiperSliderImage.setAttribute('data-genres', genres);
        })
        const activeIndex = swiper.activeIndex;
        const activeSlide = swiper.slides[activeIndex];
        let name = activeSlide.firstElementChild.dataset.title;
        let id = activeSlide.firstElementChild.dataset.id;
        sliderTitle.innerText = name;
        movieSliderGenres.innerText = activeSlide.firstElementChild.dataset.genres;
        previewBtn.classList.add('movie_poster');
        previewBtn.setAttribute('data-id', id);
        movieSliderWishBtn.classList.add('action_icon');
        movieSliderWishBtn.setAttribute('data-id', id);
        // handle initial wishlist
        let exists = checkkWishList(id);
        this.sliderWishlist(exists, movieSliderWishBtn);
        // handle slider
        swiper.on("transitionStart", debounce(() => {
            const activeIndex = swiper.activeIndex;
            const activeSlide = swiper.slides[activeIndex];
            let name = activeSlide.firstElementChild.dataset.title;
            let id = activeSlide.firstElementChild.dataset.id;
            sliderTitle.innerText = name;
            movieSliderGenres.innerText = activeSlide.firstElementChild.dataset.genres
            previewBtn.setAttribute('data-id', id);
            movieSliderWishBtn.setAttribute('data-id', id);
            // reset button
            let exists = checkkWishList(id);
            this.sliderWishlist(exists, movieSliderWishBtn);
        }), 500);

        this.renderViewMedia(showsDOM, trendingData, 'tv', 'Trending');
        // popular data here
        const popularData = await this.getPopularMedia('tv', 'popular', 1);
        this.renderViewMedia(showsDOM, popularData, 'tv', 'Popular');
        // infinite genre logic
        const genreCounts = {};
        showData.forEach((data) => {
            data.genres.forEach((genre) => {
                genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
            });
        });
        const popularGenres = Object.keys(genreCounts).filter((genre) => genreCounts[genre] >= 6);
        // infinite logic
        var loading = true;
        var currentPosition = 0;

        $$('#show_scroll').on('infinite', () => {
            if (!loading) return;
            loading = false;
            setTimeout(() => {
                var selectedGenres = popularGenres.slice(currentPosition, currentPosition + 4);
                this.renderScrollViewMedia(showsDOM, selectedGenres, 'tv');
                currentPosition += 4;
                if (currentPosition >= popularGenres.length) {
                    app.infiniteScroll.destroy('#show_scroll');
                    document.querySelector('#show_scroll_preloader').remove();
                }
                loading = true;
            }, 500)
        })

    }
}
export const renderYear = UI.prototype.renderYear;
export const renderTime = UI.prototype.renderTime;
export const renderSeasons = UI.prototype.renderSeasons;
export const shortenText = UI.prototype.shortenText;
export const renderMediaCast = UI.prototype.renderMediaCast;
export const renderScrollMedia = UI.prototype.renderScrollMedia;
export const renderScrollMedia2 = UI.prototype.renderScrollMedia2;
export const renderWishMedia = UI.prototype.renderWishMedia;
export const getPopularMedia = UI.prototype.getPopularMedia;
export const getTrendingMedia = UI.prototype.getTrendingMedia;
export const getAiringShows = UI.prototype.getAiringShows;
export const getCollectionData = UI.prototype.getCollectionData;
export const renderCollection = UI.prototype.renderCollection;
export const renderCast = UI.prototype.renderCast;
export const renderEpisodes = UI.prototype.renderEpisodes;

var ui = new UI();
export default ui;
