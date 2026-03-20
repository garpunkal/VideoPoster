import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { fetchJsonWithTimeout, formatDuration } from "../utils.js";

export function initVimeo(shell, videoUrl) {
  function getVimeoId(url) {
    try {
      const parsed = new URL(url);
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

  const id = getVimeoId(videoUrl);
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
        updatePosterMeta(poster, { thumbUrl: data.thumbnail_url });
      }
      if (data && data.duration) {
        updatePosterMeta(poster, { time: formatDuration(data.duration) });
      }
    });

  updatePosterMeta(poster, { title: titleFallback, time: "--:--" });
}
