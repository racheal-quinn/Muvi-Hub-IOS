class Download {
    constructor() {
        this.downloadBtn = document.querySelector('.download_btn');
        this.appDOM = document.getElementById('app');
        this.inputContainer = document.querySelector('.signInInputs');
        this.downloadDOM = document.querySelector('.download_dom');
        this.fileListContainer = document.querySelector('.file_list');
        this.downloads = {}; // Object to store multiple download operations
        this.totalFileSizes = {};
        this.downloadTasks = [];
        this.currentIndex = 0;
        this.downloadOperating = null;

        document.addEventListener('deviceready', () => {
            this.initializeEventListeners();
            this.readAndDisplayFiles(); // Display files when the app is ready
        });
    }

    initializeEventListeners() {
        this.appDOM.addEventListener('click', (event) => {
            if (event.target.classList.contains('download_btn')) {
                this.handleDownloadClick();
            } else if (event.target.classList.contains('cancel_download_btn')) {
                let id = event.target.dataset.id;
                this.cancelDownload(id);
            }
        });
    }

    handleDownloadClick() {
        var value = document.getElementById('movie_url_input').value;
        var name = document.getElementById('movie_name_input').value;
        let parts = value.split('.');
        var extension = parts[parts.length - 1];
        var fileName = `${name}.${extension}`, uriString = value;

        // Store the download operation
        var downloadId = Date.now();
        console.log(downloadId);
        var file = {
            id: downloadId,
            uriString: uriString,
            fileName: fileName
        };

        this.downloadTasks.push(file);
        if (this.downloadOperating) {
            this.createProgressUI(downloadId);
        } else {
            this.createProgressUI(downloadId); // Create a progress element for the new download
            this.startDownload(downloadId);
        }
    }

    startDownload(downloadId) {
        if (this.currentIndex >= this.downloadTasks.length) {
            return;
        }
        const fileData = this.downloadTasks[this.currentIndex];
        console.log(fileData);
        var uriString = fileData.uriString;
        var fileName = fileData.fileName;

        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            fileSystem.getFile(fileName, { create: true }, (targetFile) => {
                var downloader = new BackgroundTransfer.BackgroundDownloader();
                var download = downloader.createDownload(uriString, targetFile);

                this.downloads[downloadId] = download.startAsync().then(
                    this.onSuccess.bind(this, downloadId),
                    this.onError.bind(this, downloadId),
                    this.onProgress.bind(this, downloadId)
                );
                this.downloadOperating = this.downloads[downloadId];
            }, (err) => {
                console.error("Error accessing target file: ", err);
                alert("Error accessing target file: " + JSON.stringify(err));
            });
        }, (err) => {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }

    onSuccess(downloadId, result) {
        this.updateProgressNotification(this.totalFileSizes[downloadId], downloadId, 100, this.totalFileSizes[downloadId]);
        app.progressbar.set(`.progressbar${downloadId}`, 100);
        document.querySelector(`.amount_downloaded${downloadId}`).innerText = this.totalFileSizes[downloadId];
        document.querySelector(`.total_downloaded${downloadId}`).innerText = this.totalFileSizes[downloadId];

        setTimeout(() => {
            this.downloadCompletedNotification(downloadId);
            delete this.downloads[downloadId]; // Remove completed download from the list
            this.downloadOperating = null; // Reset the downloadOperating state
            this.currentIndex++;
            if (this.currentIndex < this.downloadTasks.length) {
                const nextFileData = this.downloadTasks[this.currentIndex];
                const nextDownloadId = nextFileData.id;
                this.startDownload(nextDownloadId);
            }
            this.readAndDisplayFiles(); // Read and display files after download
        }, 1000);
    }

    onError(downloadId, error) {
        console.error("Error in download: ", error);
        alert("Download error: " + JSON.stringify(error));
        this.downloadOperating = null; // Reset the downloadOperating state
        this.currentIndex++;
        if (this.currentIndex < this.downloadTasks.length) {
            const nextFileData = this.downloadTasks[this.currentIndex];
            const nextDownloadId = nextFileData.id;
            this.startDownload(nextDownloadId);
        }
    }

    onProgress(downloadId, progress) {
        console.log("On progress id ", downloadId);
        var bytesReceived = progress.bytesReceived;
        var totalBytes = progress.totalBytesToReceive;
        var percent = Math.floor((bytesReceived / totalBytes) * 100);

        if (this.formatBytes(totalBytes)) {
            this.totalFileSizes[downloadId] = this.formatBytes(totalBytes);
            this.updateProgressNotification(this.formatBytes(bytesReceived), downloadId, percent, this.formatBytes(totalBytes));
            app.progressbar.set(`.progressbar${downloadId}`, percent);
            document.querySelector(`.amount_downloaded${downloadId}`).innerText = this.formatBytes(bytesReceived);
            document.querySelector(`.total_downloaded${downloadId}`).innerText = this.formatBytes(totalBytes);
        }
    }

    updateProgressNotification(downloadedBytes, downloadId, percentage, totalBytes) {
        const notification = {
            id: downloadId,
            title: 'Dune Part Two',
            text: `${downloadedBytes} of ${totalBytes}`,
            progressBar: { value: percentage },
            actions: [
                { id: downloadId, title: 'Pause' }
            ]
        };
        cordova.plugins.notification.local.schedule(notification);
    }

    downloadCompletedNotification(downloadId) {
        cordova.plugins.notification.local.cancel(downloadId);
        const completeNotification = {
            id: downloadId + 1,
            title: 'Download Complete!',
            text: 'Dune Part Two finished successfully.',
        };
        cordova.plugins.notification.local.schedule(completeNotification);
    }

    createProgressUI(downloadId) {
        var list = document.createElement('li');
        list.className = "animate__animated animate__fadeIn";
        list.setAttribute('id', `${downloadId}_download_id`);
        console.log(`${downloadId}_download_id`);
        list.innerHTML = `
      <a class="item-link">
          <div class="item-content">
              <div class="item-media">
                <div class="overlay">
                  <div class="actions hide">
                    <a href="#">
                      <i class="f7-icons cancel_download_btn" data-id="${downloadId}">xmark_circle</i>
                    </a>
                  </div>
                  <img src="https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg" />
                </div>
              </div>
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title">Dune Part Two</div>
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
        this.downloadDOM.appendChild(list);
        app.progressbar.show(`.progressbar${downloadId}`, 0);
    }

    cancelDownload(downloadId) {
        if (this.downloadOperating) {
            this.downloadOperating.cancel();
            cordova.plugins.notification.local.cancel(downloadId);
            var list = document.getElementById(`${downloadId}_download_id`);
            this.downloadDOM.removeChild(list);
            this.downloadOperating = null; // Reset the downloadOperating state
            this.currentIndex++;
            if (this.currentIndex < this.downloadTasks.length) {
                const nextFileData = this.downloadTasks[this.currentIndex];
                const nextDownloadId = nextFileData.id;
                this.startDownload(nextDownloadId);
            }
        }
    }

    readAndDisplayFiles() {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            var reader = fileSystem.createReader();
            reader.readEntries((entries) => {
                this.displayFiles(entries);
            }, (err) => {
                console.error("Error reading directory: ", err);
                alert("Error reading directory: " + JSON.stringify(err));
            });
        }, (err) => {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }

    displayFiles(entries) {
        this.fileListContainer.innerHTML = ''; // Clear the current list

        entries.forEach((entry) => {
            if (entry.isFile) {
                var listItem = document.createElement('li');
                listItem.textContent = entry.name;
                listItem.addEventListener('click', () => {
                    this.openFile(entry);
                });
                this.fileListContainer.appendChild(listItem);
            }
        });
    }

    openFile(fileEntry) {
        fileEntry.file((file) => {
            cordova.plugins.fileOpener2.open(
                file.nativeURL,
                'video/*', // MIME type for video files
                {
                    error: (e) => {
                        console.error('Error opening file: ', e);
                        alert('Error opening file: ' + JSON.stringify(e));
                    },
                    success: () => {
                        console.log('File opened successfully');
                    }
                }
            );
        }, (err) => {
            console.error('Error getting file: ', err);
            alert('Error getting file: ' + JSON.stringify(err));
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
}

// Initialize the Download class
const downloadManager = new Download();
