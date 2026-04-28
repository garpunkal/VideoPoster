import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { fetchJsonWithTimeout, formatDuration } from "../utils.js";

export function initVimeo(shell, videoUrl) {
  function stripQueryAndFragment(url) {
    try {
      const parsed = new URL(url);
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return url;
    }
  }

  function getVimeoId(url) {
    try {
      const cleanUrl = stripQueryAndFragment(url);
      const parsed = new URL(cleanUrl);
      const host = parsed.hostname.replace(/^www\./, "");
      if (host !== "vimeo.com" && host !== "player.vimeo.com") {
        return null;
      }
      const match = parsed.pathname.match(/\/(\d+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  function createVimeoPlayUrl(id) {
    const params = new URLSearchParams({
      autoplay: "1",
      muted: "0",
      title: "0",
      byline: "0",
      portrait: "0",
      badge: "0",
      dnt: "1"
    });
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  // Always strip query and fragment for ID and all uses
  const cleanUrl = stripQueryAndFragment(videoUrl);
  const id = getVimeoId(cleanUrl);
  if (!id) {
    setError(shell, "Invalid Vimeo URL");
    return;
  }

  const titleFallback = "Vimeo Video";
  const customPosterUrl = shell.getAttribute("data-poster-url") || "";
  const allowFullscreen = shell.dataset.allowfullscreen == null || !["false", "0", "no", "off"].includes(String(shell.dataset.allowfullscreen).trim().toLowerCase());
  const iframe = createIframe(titleFallback, shell.dataset.allow || ALLOW.vimeo, {
    width: shell.dataset.width,
    height: shell.dataset.height,
    loading: shell.dataset.loading,
    customTitle: shell.dataset.title,
    allowFullscreen,
    mediaId: shell.dataset.mediaId
  });
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster(titleFallback, "--:--", customPosterUrl, metaSettings);

  poster.addEventListener("click", function () {
    poster.classList.add("hidden");
    iframe.src = createVimeoPlayUrl(id);
    iframe.focus();
  }, { once: true });

  shell.append(iframe, poster);


  fetchJsonWithTimeout(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    .then(data => {
      if (data && data.title) {
        updatePosterMeta(poster, { title: data.title });
      }
      if (!customPosterUrl && data && data.thumbnail_url) {
        // Always set the highest-res thumbnail URL directly; let the browser handle fallback
        const thumbBase = data.thumbnail_url;
        let highResThumb = thumbBase
          // Handles _295x166.jpg, _295x166?region=us, _640.jpg, _640?region=us
          .replace(/_[0-9]+x[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1920x1080$1')
          .replace(/_[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1920x1080$1');
        if (highResThumb === thumbBase) {
          highResThumb = thumbBase
            .replace(/_[0-9]+x[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1280x720$1')
            .replace(/_[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1280x720$1');
        }
        if (highResThumb === thumbBase) {
          highResThumb = thumbBase
            .replace(/_[0-9]+x[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1280$1')
            .replace(/_[0-9]+((\.[a-z]+)?(\?.*)?)$/i, '_1280$1');
        }
        updatePosterMeta(poster, { thumbUrl: highResThumb });
      }
      if (data && data.duration) {
        updatePosterMeta(poster, { time: formatDuration(data.duration) });
      }
    });

  updatePosterMeta(poster, { title: titleFallback, time: "--:--" });
}
 