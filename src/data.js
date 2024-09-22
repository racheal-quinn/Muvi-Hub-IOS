import { app } from ".";
import ui from "./ui";
import Storage from "./storage";
// firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, onChildAdded, get } from "firebase/database";
import { dummyMovies } from './dummyFilms';
import { renderDummyFilms } from "./dummyFilms";


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

export const movieGenres = [
    {
        id: 28,
        name: "Action"
    },
    {
        id: 12,
        name: "Adventure"
    },
    {
        id: 16,
        name: "Animation"
    },
    {
        id: 35,
        name: "Comedy"
    },
    {
        id: 80,
        name: "Crime"
    },
    {
        id: 99,
        name: "Documentary"
    },
    {
        id: 18,
        name: "Drama"
    },
    {
        id: 10751,
        name: "Family"
    },
    {
        id: 14,
        name: "Fantasy"
    },
    {
        id: 36,
        name: "History"
    },
    {
        id: 27,
        name: "Horror"
    },
    {
        id: 10402,
        name: "Music"
    },
    {
        id: 9648,
        name: "Mystery"
    },
    {
        id: 10749,
        name: "Romance"
    },
    {
        id: 878,
        name: "Science Fiction"
    },
    {
        id: 10770,
        name: "TV Movie"
    },
    {
        id: 53,
        name: "Thriller"
    },
    {
        id: 10752,
        name: "War"
    },
    {
        id: 37,
        name: "Western"
    }
]

export const showGenres = [
    {
        id: 10759,
        name: "Action & Adventure"
    },
    {
        id: 16,
        name: "Animation"
    },
    {
        id: 35,
        name: "Comedy"
    },
    {
        id: 80,
        name: "Crime"
    },
    {
        id: 99,
        name: "Documentary"
    },
    {
        id: 18,
        name: "Drama"
    },
    {
        id: 10751,
        name: "Family"
    },
    {
        id: 10762,
        name: "Kids"
    },
    {
        id: 9648,
        name: "Mystery"
    },
    {
        id: 10763,
        name: "News"
    },
    {
        id: 10764,
        name: "Reality"
    },
    {
        id: 10765,
        name: "Sci-Fi & Fantasy"
    },
    {
        id: 10766,
        name: "Soap"
    },
    {
        id: 10767,
        name: "Talk"
    },
    {
        id: 10768,
        name: "War & Politics"
    },
    {
        id: 37,
        name: "Western"
    }
]

const firebaseApp = initializeApp(firebaseConfig);
export const database = getDatabase(firebaseApp);
let initialLoad = true;


// export const time = firebase.database.ServerValue.TIMESTAMP

class Data {
    async getMovieData() {
        try {
            return new Promise((resolve, reject) => {
                const dataRef = ref(database, "data");
                onValue(dataRef, (snapshot) => {
                    const dataArr = [];
                    snapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        dataArr.push(data);
                    });
                    resolve(dataArr);
                }, (error) => {
                    console.log(error);
                    if (error.code === "PERMISSION_DENIED") {
                        var moviesDOM = document.querySelector('.movies_dom');
                        var listContainer = document.createElement('div');
                        listContainer.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                        var listUl = document.createElement('ul');
                        listContainer.appendChild(listUl);
                        var mediaArr = dummyMovies.slice(0, 10);
                        renderDummyFilms(mediaArr, listUl, 'main');
                        moviesDOM.appendChild(listContainer);
                        document.querySelector('#movie_scroll_preloader').remove();

                        var showsDOM = document.querySelector('.shows_dom');
                        var listContainer1 = document.createElement('div');
                        listContainer1.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                        var listUl = document.createElement('ul');
                        listContainer1.appendChild(listUl);
                        var mediaArr1 = dummyMovies.slice(10, 20);
                        renderDummyFilms(mediaArr1, listUl, 'main');
                        showsDOM.appendChild(listContainer1);
                        document.querySelector('#show_scroll_preloader').remove();
                        ui.handleDummy();
                    } else {
                        // Handle other errors
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error(error);
        }
    }
    checkReview() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('https://admin-server-theta.vercel.app/isReview');
                // Convert the response to JSON
                const result = await response.json();
                if (result === true) {
                    resolve();
                } else {
                    var moviesDOM = document.querySelector('.movies_dom');
                    var listContainer = document.createElement('div');
                    listContainer.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                    var listUl = document.createElement('ul');
                    listContainer.appendChild(listUl);
                    var mediaArr = dummyMovies.slice(0, 10);
                    renderDummyFilms(mediaArr, listUl, 'main');
                    moviesDOM.appendChild(listContainer);
                    document.querySelector('#movie_scroll_preloader').remove();

                    var showsDOM = document.querySelector('.shows_dom');
                    var listContainer1 = document.createElement('div');
                    listContainer1.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                    var listUl = document.createElement('ul');
                    listContainer1.appendChild(listUl);
                    var mediaArr1 = dummyMovies.slice(10, 20);
                    renderDummyFilms(mediaArr1, listUl, 'main');
                    showsDOM.appendChild(listContainer1);
                    document.querySelector('#show_scroll_preloader').remove();
                    ui.handleDummy();
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    getAllMedia() {
        const dataRef = ref(database, "data");
        get(dataRef).then(async (snapshot) => {
            console.log('data loaded');
            var newDataArr = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                newDataArr.push(data);
            });
            initialLoad = false;
            await Storage.saveData(newDataArr);
        });
        // Listen for child added events
        onChildAdded(dataRef, async (snapshot) => {
            const newItem = snapshot.val();
            if (!initialLoad) {
                await Storage.saveSingleData(newItem);
                ui.renderNewMedia(newItem);
            }
        });
    }
}

var data = new Data();
export default data;