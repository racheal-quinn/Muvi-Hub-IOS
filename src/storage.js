import { openDB } from "idb";
const DB_VERSION = 7;

class Storage {
    static async saveData(data) {
        try {
            const db = await openDB('my-database', DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('dataStore')) {
                        console.log('Creating dataStore...');
                        const store = db.createObjectStore('dataStore', {
                            keyPath: 'id',
                        });
                        store.createIndex('nameIndex', 'name');
                    }
                },
            });

            const tx = db.transaction('dataStore', 'readwrite');
            const store = tx.objectStore('dataStore');
            await store.clear();
            data.forEach(item => {
                store.put(item);
            });
            await tx.done;
            db.close();
        } catch (error) {
            console.error('Error saving data to IndexedDB:', error);
        }
    }

    static async saveSingleData(item) {
        try {
            const db = await openDB('my-database', DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('dataStore')) {
                        const store = db.createObjectStore('dataStore', {
                            keyPath: 'id',
                        });
                        store.createIndex('nameIndex', 'name');
                    }
                },
            });

            const tx = db.transaction('dataStore', 'readwrite');
            const store = tx.objectStore('dataStore');
            console.log('Saving single item:', item);
            await store.put(item);
            await tx.done;
            db.close();
        } catch (error) {
            console.error('Error saving single data to IndexedDB:', error);
        }
    }

    static async getAllData() {
        try {
            const db = await openDB('my-database', DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('dataStore')) {
                        console.log('Creating dataStore...');
                        const store = db.createObjectStore('dataStore', {
                            keyPath: 'id',
                        });
                        store.createIndex('nameIndex', 'name');
                    }
                },
            });
            const tx = db.transaction('dataStore', 'readonly');
            const store = tx.objectStore('dataStore');
            const data = await store.getAll();
            await tx.done;
            db.close();
            return data;
        } catch (error) {
            console.log('No data exists or error accessing the database:', error);
            return [];  // Return empty array instead of false
        }
    }

    static async getMedia(query) {
        try {
            const db = await openDB('my-database', DB_VERSION);
            const tx = db.transaction('dataStore', 'readonly');
            const store = tx.objectStore('dataStore');
            const media = await store.getAll();
            await tx.done;
            db.close();
            return media.filter(item => item.category == query);
        } catch (error) {
            console.error('Error retrieving movies from IndexedDB:', error);
            return null;
        }
    }

    static async getSingleData(id) {
        try {
            const db = await openDB('my-database', DB_VERSION);
            const data = await db.get('dataStore', id);
            db.close();
            return data;
        } catch (error) {
            console.error('Error retrieving data from IndexedDB:', error);
            return null;
        }
    }

    static saveToken(fcmToken) {
        localStorage.setItem("fcmToken", fcmToken);
    }

    static getToken() {
        return localStorage.getItem("fcmToken") ? localStorage.getItem("fcmToken") : null;
    }

    static saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser() {
        return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
    }

    static saveWishList(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    static getWishlist() {
        return localStorage.getItem("wishlist") ? JSON.parse(localStorage.getItem("wishlist")) : [];
    }

    static saveRequestList(requestList) {
        localStorage.setItem('requests', JSON.stringify(requestList));
    }

    static saveVideoThumbNail(url, thumbnail) {
        var thumbnails = localStorage.getItem("thumbnails") ? JSON.parse(localStorage.getItem("thumbnails")) : [];
        if (!thumbnails.some(thumbnail => thumbnail.url == url)) {
            var thumbNailData = {
                url,
                thumbnail
            }
            thumbnails.push(thumbNailData);
            localStorage.setItem('thumbnails', JSON.stringify(thumbnails));
        }
    }

    static getVideoThumbnail(url) {
        var thumbnails = localStorage.getItem("thumbnails") ? JSON.parse(localStorage.getItem("thumbnails")) : [];
        var thumbnailObj = thumbnails.find(thumbnail => thumbnail.url == url);
        return thumbnailObj.thumbnail;
    }

    static getRequestList() {
        return localStorage.getItem("requests") ? JSON.parse(localStorage.getItem("requests")) : [];
    }

    static getBannerStatus() {
        return localStorage.getItem("bannerShowed") ? JSON.parse(localStorage.getItem("bannerShowed")) : false;
    }

}

export default Storage;