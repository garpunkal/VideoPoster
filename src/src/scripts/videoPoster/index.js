import { setError } from "./poster.js";
import { initHtml5 } from "./providers/html5.js";
import { initVimeo } from "./providers/vimeo.js";
import { initYouTube } from "./providers/youtube.js";

export function initVideoShell(shell) {
  const type = shell.dataset.videoType;
  const videoUrl = shell.dataset.videoUrl;

  if (type === "youtube") {
    initYouTube(shell, videoUrl);
    return;
  }
  if (type === "vimeo") {
    initVimeo(shell, videoUrl);
    return;
  }
  if (type === "html5") {
    initHtml5(shell, videoUrl);
    return;
  }

  setError(shell, "Unknown video type");
}

export function initAllVideoShells(root = document) {
  root.querySelectorAll(".video-shell").forEach(initVideoShell);
}
