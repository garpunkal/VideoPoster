import { setError } from "./poster.js";
import { initHtml5 } from "./providers/html5.js";
import { initVimeo } from "./providers/vimeo.js";
import { initYouTube } from "./providers/youtube.js";

function inferType(url) {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("vimeo.com")) return "vimeo";
  } catch {
    // fall through to html5
  }
  return "html5";
}

export function initVideoShell(shell) {
  const videoUrl = shell.dataset.videoUrl;
  const type = shell.dataset.videoType || inferType(videoUrl);

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
  root.querySelectorAll("[data-video-with-poster]").forEach(initVideoShell);
}
