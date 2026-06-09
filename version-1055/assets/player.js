(function () {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-cover]');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
        return;
    }

    var sourceElement = video.querySelector('source');
    var source = sourceElement ? sourceElement.getAttribute('src') : '';
    var hlsInstance = null;
    var ready = false;

    function preparePlayer() {
        if (ready || !source) {
            return;
        }

        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
    }

    function hideCover() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function playMovie() {
        preparePlayer();
        hideCover();
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    preparePlayer();

    if (overlay) {
        overlay.addEventListener('click', playMovie);
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.stopPropagation();
            playMovie();
        });
    }

    video.addEventListener('play', hideCover);
    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
