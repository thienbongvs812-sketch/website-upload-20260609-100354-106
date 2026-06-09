import { H as Hls } from './video-vendor-dru42stk.js';

function setNote(player, text, isError) {
  var note = player.querySelector('[data-player-note]');
  if (!note) {
    return;
  }
  note.textContent = text;
  note.classList.toggle('is-error', Boolean(isError));
}

function initPlayer(player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var source = player.getAttribute('data-video-src');
  var hlsInstance = null;

  if (!video || !button || !source) {
    setNote(player, '播放器缺少必要的视频源。', true);
    return;
  }

  function startPlayback() {
    player.classList.add('is-playing');
    video.controls = true;

    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setNote(player, 'HLS 播放源加载完成，正在播放。', false);
        video.play().catch(function () {
          setNote(player, '浏览器阻止了自动播放，请再次点击视频播放。', false);
        });
      });
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setNote(player, '视频源暂时无法加载，可刷新页面或稍后重试。', true);
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setNote(player, '浏览器原生 HLS 播放已启用。', false);
        video.play().catch(function () {
          setNote(player, '请点击视频继续播放。', false);
        });
      }, { once: true });
      return;
    }

    setNote(player, '当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。', true);
  }

  button.addEventListener('click', startPlayback);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});
