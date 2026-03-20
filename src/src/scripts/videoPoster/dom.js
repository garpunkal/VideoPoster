export function createIframe(title, allow, width, height, loading, customTitle) {
  const iframe = document.createElement("iframe");
  iframe.title = customTitle || title;
  iframe.loading = loading || "lazy";
  iframe.allow = allow;
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.sandbox = "allow-scripts allow-presentation allow-popups";
  iframe.setAttribute("frameborder", "0");
  if (width) iframe.width = width;
  if (height) iframe.height = height;
  return iframe;
}
