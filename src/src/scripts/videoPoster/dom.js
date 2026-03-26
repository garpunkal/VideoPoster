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
  if (allowFullscreen !== false) {
    iframe.setAttribute("allowfullscreen", "");
    // Remove value for boolean attribute (HTML will render as just allowfullscreen)
    // This is the correct way for boolean attributes in HTML
  }
  if (width) iframe.width = width;
  if (height) iframe.height = height;
  if (mediaId) iframe.id = mediaId;
  return iframe;
}
