import { setError } from "./poster.js";
import { setupHtml5 } from "./providers/html5.js";
import { setupVimeo } from "./providers/vimeo.js";
import { setupYouTube } from "./providers/youtube.js";

export function initVideoShell(shell) {
  const type = shell.dataset.videoType;
  const videoUrl = shell.dataset.videoUrl;

  if (type === "youtube") {
    setupYouTube(shell, videoUrl);
    return;
  }
  if (type === "vimeo") {
    setupVimeo(shell, videoUrl);
    return;
  }
  if (type === "html5") {
    setupHtml5(shell, videoUrl);
    return;
  }

  setError(shell, "Unknown video type");
}

export function initAllVideoShells(root = document) {
  root.querySelectorAll(".video-shell").forEach(initVideoShell);
}
