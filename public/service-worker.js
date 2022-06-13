const APP_PREFIX = "budget_tracker-";
const VERSION = "Version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./manifest.json",
  "./icons/icon-512x512.png",
  "./icons/icon-384x384.png",
  "./icons/icon-192x192.png",
  "./icons/icon-152x152.png",
  "./icons/icon-144x144.png",
  "./icons/icon-128x128.png",
  "./icons/icon-96x96.png",
  "./icons/icon-72x72.png",
];

// Activate the service worker
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });

      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Intercept requests
self.addEventListener("fetch", function (evt) {
  console.log("fetch request : " + evt.request.url);
  evt.respondWith(
    caches.match(evt.request).then(function (request) {
      if (request) {
        console.log("responding with cache : " + evt.request.url);
        return request;
      } else {
        console.log("file is not cached, fetching : " + evt.request.url);
        return fetch(evt.request);
      }
    })
  );
});

// Install the worker
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});
