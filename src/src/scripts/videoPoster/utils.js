export function formatDuration(seconds) {
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

export function captureVideoFrame(video) {
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

export function captureVideoFrameAt(video, targetTime) {
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

export function titleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const chunk = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "video");
    const clean = chunk.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
    return clean || "Video";
  } catch {
    return "Video";
  }
}

