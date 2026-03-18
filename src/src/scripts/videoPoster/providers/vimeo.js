import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { formatDuration } from "../utils.js";

function createVimeoUrl(id) {
  const params = new URLSearchParams({
    autoplay: "0",
    muted: "0",
    title: "0",
    byline: "0",
    portrait: "0",
    badge: "0",
    dnt: "1"
  });
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
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

function getVimeoId(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function setupVimeo(shell, videoUrl) {
  const id = getVimeoId(videoUrl);
  if (!id) {
    setError(shell, "Invalid Vimeo URL");
    return;
  }

  const titleFallback = "Vimeo Video";
  const iframe = createIframe(titleFallback, ALLOW.vimeo, createVimeoUrl(id));
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster(titleFallback, "--:--", "", metaSettings);
  let started = false;

  poster.addEventListener("click", function () {
    if (started) return;
    started = true;
    poster.classList.add("hidden");
    iframe.src = createVimeoPlayUrl(id);
    iframe.focus();
  });

  shell.append(iframe, poster);

  fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (data && data.title) {
        updatePosterMeta(poster, { title: data.title });
      }
      if (data && data.thumbnail_url) {
        updatePosterMeta(poster, { thumbUrl: data.thumbnail_url });
      }
      if (data && data.duration) {
        updatePosterMeta(poster, { time: formatDuration(data.duration) });
      }
    })
    .catch(() => { });

  updatePosterMeta(poster, { title: titleFallback, time: "--:--" });
}
