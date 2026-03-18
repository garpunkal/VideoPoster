export function createIframe(title, allow, src) {
  const iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.loading = "lazy";
  iframe.allow = allow;
  iframe.allowFullscreen = true;
  iframe.src = src;
  return iframe;
}
