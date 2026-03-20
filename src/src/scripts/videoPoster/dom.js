export function createIframe(title, allow, { width, height, loading, customTitle, allowFullscreen, mediaId } = {}) {
  const iframe = document.createElement("iframe");
  iframe.title = customTitle || title;
  iframe.loading = loading || "lazy";
  const effectiveAllow = allowFullscreen !== false && !/\bfullscreen\b/.test(allow)
    ? `${allow}; fullscreen`
    : allow;
  iframe.allow = effectiveAllow;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("frameborder", "0");
  if (width) iframe.width = width;
  if (height) iframe.height = height;
  if (mediaId) iframe.id = mediaId;
  return iframe;
}
