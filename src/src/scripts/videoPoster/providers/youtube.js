import { ALLOW } from "../constants.js";
import { createIframe } from "../dom.js";
import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { fetchJsonWithTimeout, resolveThumbUrl } from "../utils.js";

export function initYouTube(shell, videoUrl) {
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

  function getYouTubeId(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        return parsed.pathname.replace(/^\//, "").split(/[/?#]/)[0];
      }
      if ((host === "youtube.com" || host === "m.youtube.com") && parsed.searchParams.has("v")) {
        return parsed.searchParams.get("v");
      }
      const match = parsed.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/);
      return match ? match[2] : null;
    } catch {
      return null;
    }
  }

  function createYouTubeUrl(id, autoplay, originalUrl) {
    // Start with default params
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
    // Merge in any user-provided query params (e.g., start, rel, etc.)
    try {
      const parsed = new URL(originalUrl);
      for (const [key, value] of parsed.searchParams.entries()) {
        params.set(key, value);
      }
    } catch {}
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }

  // Only strip query/fragment for thumbnail/oEmbed, not for ID extraction
  const id = getYouTubeId(videoUrl);
  if (!id) {
    setError(shell, "Invalid YouTube URL");
    return;
  }
  const cleanUrl = stripQueryAndFragment(videoUrl);

  const titleFallback = "YouTube Video";
  const customPosterUrl = shell.getAttribute("data-poster-url") || "";
  const thumbCandidates = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  ];
  const initialPosterUrl = customPosterUrl || thumbCandidates[thumbCandidates.length - 1];
  const allowFullscreen = shell.dataset.allowfullscreen == null || !["false", "0", "no", "off"].includes(String(shell.dataset.allowfullscreen).trim().toLowerCase());
  const iframe = createIframe(titleFallback, shell.dataset.allow || ALLOW.youtube, {
    width: shell.dataset.width,
    height: shell.dataset.height,
    loading: shell.dataset.loading,
    customTitle: shell.dataset.title,
    allowFullscreen,
    mediaId: shell.dataset.mediaId
  });
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster(titleFallback, "--:--", initialPosterUrl, metaSettings);

  poster.addEventListener("click", function () {
    poster.classList.add("hidden");
    iframe.src = createYouTubeUrl(id, true, videoUrl);
    iframe.focus();
  }, { once: true });

  shell.append(iframe, poster);

  fetchJsonWithTimeout(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
    .then(data => {
      if (data && data.title) {
        updatePosterMeta(poster, { title: data.title });
      }
    });

  updatePosterMeta(poster, { title: titleFallback, time: "--:--" });

  if (!customPosterUrl) {
    resolveThumbUrl(thumbCandidates).then(function (thumbUrl) {
      updatePosterMeta(poster, { thumbUrl });
    });
  }
}
