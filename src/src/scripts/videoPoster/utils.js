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

export async function fetchJsonWithTimeout(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function loadImage(url) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () {
      // YouTube serves a 120x90 grey placeholder with HTTP 200 when a size is missing
      resolve(!(img.naturalWidth === 120 && img.naturalHeight === 90));
    };
    img.onerror = function () {
      resolve(false);
    };
    img.src = url;
  });
}

export async function resolveThumbUrl(candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (await loadImage(candidate)) return candidate;
  }
  return candidates[candidates.length - 1] || null;
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

