// import necessary variables
import { app } from ".";
import Storage from "./storage";
import ui from "./ui";

// database data container states and positions
export const containerPositions = {};
export const containerStates = {};
// api container states and positions
export const apiContainerPagePositions = {};
export const apiContainerPageStates = {};
// title media Data
export const titleMediaData = {};

export function eventHandler() {
  // add click handlers
  document.querySelector('#app').addEventListener('click', (event) => {
    ui.clickHandler(event);
  });
  // flags
  let loading = false;
  const threshold = 5; // Adjust this threshold as needed  
  let loading2 = false;
  // add more movies on scroll
  document.querySelector('#movies').addEventListener('scroll', (event) => {
    scrollLogic(event);
  }, true);
  // add more tv shows on scroll
  document.querySelector('#tvshows').addEventListener('scroll', (event) => {
    scrollLogic(event);
  }, true);

  // scroll function logic
  async function scrollLogic(event) {
    if (event.target.classList.contains('not-api')) {
      var container = event.target;
      var mediaType = event.target.dataset.type;
      // Initialize currentPosition for the container if it doesn't exist
      if (!containerPositions[container.id]) {
        containerPositions[container.id] = 13;
      }
      // Initialize container state if it doesn't exist
      if (!containerStates[container.id]) {
        containerStates[container.id] = { canLoadMore: true };
      }
      if (container.scrollLeft + container.clientWidth + 450 >= container.scrollWidth && !loading && containerStates[container.id].canLoadMore) {
        loading = true;
        var title = container.previousElementSibling.firstElementChild.innerText;
        var titleMedia = await getTitleMedia(title, mediaType);
        // store media
        // titleMediaData[container.id] = titleMedia
        // Check if there is more content to load
        if (containerPositions[container.id] >= titleMedia.length) {
          containerStates[container.id].canLoadMore = false; // No more content, set the flag to false
          loading = false;
          return; // Exit early
        }
        console.log(containerPositions[container.id]);
        var mediaChunk = titleMedia.slice(containerPositions[container.id], containerPositions[container.id] + 12);
        ui.renderScrollMedia(mediaChunk, container);
        containerPositions[container.id] += 13;
        loading = false;
      }
    } else if (event.target.classList.contains('api')) {
      var container = event.target;
      var title = container.previousElementSibling.firstElementChild.innerText.toLowerCase();
      var mediaType = container.previousElementSibling.lastElementChild.dataset.name;
      var progressSelector = mediaType == "movie" ? "horizontal_scroll_progress" : "horizontal_scroll_progress_1";

      // Initialize currentPosition for the container if it doesn't exist
      if (!apiContainerPagePositions[container.id]) {
        apiContainerPagePositions[container.id] = 2;
      }
      // Initialize container page state if it doesn't exist
      if (!apiContainerPageStates[container.id]) {
        apiContainerPageStates[container.id] = { canLoadMore: true };
      }
      if (container.scrollLeft + container.clientWidth + 100 >= container.scrollWidth && !loading2 && apiContainerPageStates[container.id].canLoadMore) {
        app.progressbar.show(`.${progressSelector}`);
        loading2 = true;
        // Limit the number of pages
        if (apiContainerPagePositions[container.id] >= 5) {
          apiContainerPageStates[container.id].canLoadMore = false;
          loading = false;
          // return; // Exit early
        }

        if (title === "popular") {
          ui.getPopularMedia(mediaType, title, (apiContainerPagePositions[container.id]))
            .then(data => {
              ui.renderScrollMedia(data, container);
              app.progressbar.hide();
              apiContainerPagePositions[container.id] += 1;
              loading2 = false;
            })
        } else if (title === "trending") {
          ui.getTrendingMedia(mediaType, title, (apiContainerPagePositions[container.id]))
            .then(data => {
              ui.renderScrollMedia(data, container);
              app.progressbar.hide();
              apiContainerPagePositions[container.id] += 1;
              loading2 = false;
            })
        } else {
          ui.getAiringShows(mediaType, 'on_the_air', (apiContainerPagePositions[container.id]))
            .then(data => {
              ui.renderScrollMedia(data, container);
              apiContainerPagePositions[container.id] += 1;
              loading2 = false;
            })
        }
        // apiContainerPagePositions[container.id] += 1;
        // loading2 = false;
      }
    }
  }
}

export async function getTitleMedia(title, mediaType) {
  var data = await Storage.getAllData();
  const dateProperty = mediaType == 'movie' ? 'release_date' : 'first_air_date';
  var media = data.filter(media => media.category == `${mediaType}`);
  var titleMedia = media.filter((data) => data.genres.some((genre) => genre.name === title));
  titleMedia.sort((a, b) => new Date(b[dateProperty]) - new Date(a[dateProperty]));
  return titleMedia;
}
// 569094