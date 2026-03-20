export function createIframe(title, allow, { width, height, loading, customTitle, allowFullscreen, mediaId } = {}) {
  const iframe = document.createElement("iframe");
  iframe.title = customTitle || title;
  iframe.loading = loading || "lazy";
  iframe.allow = allow;
  iframe.allowFullscreen = allowFullscreen !== false;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.sandbox = "allow-scripts allow-same-origin allow-presentation allow-popups";
  iframe.setAttribute("frameborder", "0");
  if (width) iframe.width = width;
  if (height) iframe.height = height;
  if (mediaId) iframe.id = mediaId;
  return iframe;
}
