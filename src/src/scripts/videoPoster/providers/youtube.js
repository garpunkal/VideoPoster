import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { fetchJsonWithTimeout } from "../utils.js";

export function initYouTube(shell, videoUrl) {
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

  const id = getYouTubeId(videoUrl);
  if (!id) {
    setError(shell, "Invalid YouTube URL");
    return;
  }

  const titleFallback = "YouTube Video";
  const customPosterUrl = shell.getAttribute("data-poster-url") || "";
  const thumbUrl = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
  const initialPosterUrl = customPosterUrl || thumbUrl;
  const iframe = createIframe(titleFallback, shell.dataset.allow || ALLOW.youtube, shell.dataset.width, shell.dataset.height, shell.dataset.loading, shell.dataset.title);
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster(titleFallback, "--:--", initialPosterUrl, metaSettings);

  poster.addEventListener("click", function () {
    poster.classList.add("hidden");
    iframe.src = createYouTubeUrl(id, true);
    iframe.focus();
  }, { once: true });

  shell.append(iframe, poster);

  fetchJsonWithTimeout(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
    .then(data => {
      if (data && data.title) {
        updatePosterMeta(poster, { title: data.title });
      }
    });

  const posterMeta = { title: titleFallback, time: "--:--" };
  if (!customPosterUrl) {
    posterMeta.thumbUrl = thumbUrl;
  }
  updatePosterMeta(poster, posterMeta);
}
