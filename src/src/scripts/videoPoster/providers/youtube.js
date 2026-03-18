import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";

function createYouTubeUrl(id, autoplay) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "0",
    rel: "0",
    iv_load_policy: "3",
    controls: "1",
    fs: "1",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1"
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.slice(1);
    if ((host === "youtube.com" || host === "m.youtube.com") && parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    const match = parsed.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/);
    return match ? match[2] : null;
  } catch {
    return null;
  }
}

export function setupYouTube(shell, videoUrl) {
  const id = getYouTubeId(videoUrl);
  if (!id) {
    setError(shell, "Invalid YouTube URL");
    return;
  }

  const titleFallback = "YouTube Video";
  const thumbUrl = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
  const iframe = createIframe(titleFallback, ALLOW.youtube, createYouTubeUrl(id, false));
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster(titleFallback, "--:--", thumbUrl, metaSettings);
  let started = false;

  poster.addEventListener("click", function () {
    if (started) return;
    started = true;
    poster.classList.add("hidden");
    iframe.src = createYouTubeUrl(id, true);
    iframe.focus();
  });

  shell.append(iframe, poster);

  fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (data && data.title) {
        updatePosterMeta(poster, { title: data.title });
      }
    })
    .catch(() => {});

  updatePosterMeta(poster, { title: titleFallback, time: "--:--", thumbUrl });
}
