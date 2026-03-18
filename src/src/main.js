// --- VideoPoster Demo Code ---
// Utility functions (from utils/index.js, inlined for browser)
const ALLOW = {
  youtube: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  vimeo: "autoplay; fullscreen; picture-in-picture"
};

function createIframe(title, allow, src) {
  const iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.loading = "lazy";
  iframe.allow = allow;
  iframe.allowFullscreen = true;
  iframe.src = src;
  return iframe;
}

function createPoster(initialTitle, initialTime, posterUrl) {
  const poster = document.createElement("button");
  poster.type = "button";
  poster.className = "poster";
  poster.setAttribute("aria-label", "Play " + initialTitle);
  const bgValue = posterUrl
    ? `url('${posterUrl}')`
    : "linear-gradient(135deg, #2a2a2a, #121212)";
  poster.style.setProperty("--poster-bg", bgValue);
  const meta = document.createElement("span");
  meta.className = "meta-stack";
  const title = document.createElement("span");
  title.className = "title-badge hidden";
  title.textContent = initialTitle;
  const time = document.createElement("span");
  time.className = "time-badge hidden";
  time.textContent = initialTime;
  meta.append(title, time);
  const playTile = document.createElement("span");
  playTile.className = "play-badge";
  playTile.setAttribute("aria-hidden", "true");
  const playGlyph = document.createElement("span");
  playGlyph.className = "play-glyph";
  playGlyph.textContent = "\u25b6";
  playGlyph.style.color = "#0b63f6";
  playTile.append(playGlyph);
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = "Play " + initialTitle;
  poster.append(meta, playTile, sr);
  return poster;
}

function updatePosterMeta(poster, payload) {
  if (payload.title) {
    const title = poster.querySelector(".title-badge");
    const sr = poster.querySelector(".sr-only");
    title.textContent = payload.title;
    sr.textContent = "Play " + payload.title;
    poster.setAttribute("aria-label", "Play " + payload.title);
    title.classList.remove("hidden");
  }
  if (payload.time) {
    const time = poster.querySelector(".time-badge");
    time.textContent = payload.time;
    time.classList.remove("hidden");
  }
  if (payload.thumbUrl) {
    poster.style.setProperty("--poster-bg", `url('${payload.thumbUrl}')`);
  }
}

function setError(shell, message) {
  shell.innerHTML = '<div class="error-label">' + message + "</div>";
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

function guessPosterFromVideoUrl(url) {
  if (!url) return "";
  if (url.includes("gtv-videos-bucket/sample/")) {
    const fileName = url.split("/").pop() || "";
    const baseName = fileName.replace(/\.[a-z0-9]+$/i, "");
    if (baseName) {
      return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/${encodeURIComponent(baseName)}.jpg`;
    }
  }
  return "";
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function captureVideoFrame(video) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return "";
  }
}

function captureVideoFrameAt(video, targetTime) {
  return new Promise(function (resolve) {
    const originalTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    let completed = false;
    function cleanup() {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    }
    function finalize(frame) {
      if (completed) return;
      completed = true;
      cleanup();
      try { video.currentTime = originalTime; } catch {}
      resolve(frame || "");
    }
    function onSeeked() { finalize(captureVideoFrame(video)); }
    function onError() { finalize(""); }
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    try { video.currentTime = targetTime; } catch { finalize(captureVideoFrame(video)); }
    setTimeout(function () { finalize(""); }, 1800);
  });
}

function titleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const chunk = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "video");
    const clean = chunk.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
    return clean || "Video";
  } catch {
    return "Video";
  }
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

function getVimeoId(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// --- Player setup functions ---
function setupHtml5(shell, videoUrl) {
  if (!videoUrl) {
    setError(shell, "Missing HTML5 video URL");
    return;
  }
  const backupUrls = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  ];
  const candidateUrls = [videoUrl, ...backupUrls].filter(function (url, index, arr) {
    return Boolean(url) && arr.indexOf(url) === index;
  });
  let activeUrlIndex = 0;

  const video = document.createElement("video");
  video.controls = true;
  video.preload = "metadata";
  video.playsInline = true;

  const initialPosterUrl = guessPosterFromVideoUrl(candidateUrls[activeUrlIndex]);
  if (initialPosterUrl) {
    video.poster = initialPosterUrl;
  }

  const poster = createPoster(titleFromUrl(candidateUrls[activeUrlIndex]), "--:--", initialPosterUrl);

  function applySource(index) {
    activeUrlIndex = index;
    const src = candidateUrls[activeUrlIndex];
    const guessedPoster = guessPosterFromVideoUrl(src);
    if (guessedPoster) {
      video.poster = guessedPoster;
      updatePosterMeta(poster, { thumbUrl: guessedPoster });
    }
    video.src = src;
    video.load();
  }

  video.addEventListener("loadedmetadata", function () {
    const srcTitle = titleFromUrl(video.currentSrc || candidateUrls[activeUrlIndex]);
    updatePosterMeta(poster, {
      title: srcTitle,
      time: formatDuration(video.duration)
    });
  });

  video.addEventListener("error", function () {
    if (activeUrlIndex < candidateUrls.length - 1) {
      poster.classList.remove("hidden");
      applySource(activeUrlIndex + 1);
      return;
    }
    setError(shell, "HTML5 video failed to load. Please check the video URL or try another file.");
  });

  poster.addEventListener("click", async function () {
    poster.classList.add("hidden");
    try {
      video.muted = false;
      await video.play();
    } catch {
      poster.classList.remove("hidden");
    }
  });

  applySource(activeUrlIndex);
  shell.append(video, poster);
}

function setupYouTube(shell, videoUrl) {
  const id = getYouTubeId(videoUrl);
  if (!id) {
    setError(shell, "Invalid YouTube URL");
    return;
  }
  const titleFallback = "YouTube Video";
  const thumbUrl = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
  const previewUrl = createYouTubeUrl(id, false);
  const iframe = createIframe(titleFallback, ALLOW.youtube, previewUrl);
  const poster = createPoster(titleFallback, "--:--", thumbUrl);
  let started = false;

  poster.addEventListener("click", function () {
    if (started) return;
    started = true;
    poster.classList.add("hidden");
    iframe.src = createYouTubeUrl(id, true);
    iframe.focus();
  });
  shell.append(iframe, poster);

  updatePosterMeta(poster, { title: titleFallback, time: "--:--", thumbUrl });
}

function setupVimeo(shell, videoUrl) {
  const id = getVimeoId(videoUrl);
  if (!id) {
    setError(shell, "Invalid Vimeo URL");
    return;
  }
  const titleFallback = "Vimeo Video";
  const thumbUrl = "https://vumbnail.com/" + id + ".jpg";
  const previewUrl = createVimeoUrl(id);
  const iframe = createIframe(titleFallback, ALLOW.vimeo, previewUrl);
  const poster = createPoster(titleFallback, "--:--", thumbUrl);
  let started = false;

  poster.addEventListener("click", function () {
    if (started) return;
    started = true;
    poster.classList.add("hidden");
    iframe.src = createVimeoPlayUrl(id);
    iframe.focus();
  });
  shell.append(iframe, poster);

  updatePosterMeta(poster, { title: titleFallback, time: "--:--", thumbUrl });
}

// Ensure click listeners are properly attached to posters
function initVideoShell(shell) {
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

document.querySelectorAll('.video-shell').forEach(initVideoShell);
