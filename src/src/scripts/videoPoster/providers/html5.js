import { createPoster, getPosterMetaSettings, setError, updatePosterMeta } from "../poster.js";
import { formatDuration, titleFromUrl } from "../utils.js";

export function initHtml5(shell, videoUrl) {
  if (!videoUrl) {
    setError(shell, "Missing HTML5 video URL");
    return;
  }

  const video = document.createElement("video");
  video.controls = true;
  video.preload = "metadata";
  video.playsInline = true;
  video.src = videoUrl;

  const posterUrl = shell.getAttribute("data-poster-url") || "";
  const metaSettings = getPosterMetaSettings(shell);
  const poster = createPoster("", "--:--", posterUrl, metaSettings);

  video.addEventListener("loadedmetadata", function () {
    updatePosterMeta(poster, {
      title: titleFromUrl(videoUrl),
      time: formatDuration(video.duration)
    });
  });

  video.addEventListener("error", function () {
    setError(shell, "HTML5 video failed to load. Please check the video URL or try another file.");
  });

  poster.addEventListener("click", async function () {
    poster.classList.add("hidden");
    try {
      if (video.src !== videoUrl) {
        video.load();
      }
      video.muted = false;
      await video.play();
    } catch {
      poster.classList.remove("hidden");
    }
  });

  shell.append(video, poster);
}
