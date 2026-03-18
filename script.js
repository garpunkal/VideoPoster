//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/scripts/videoPoster/poster.js
function getPosterMetaSettings(shell) {
	function parseBoolDataAttr(value, defaultValue = true) {
		if (value == null) return defaultValue;
		const normalized = String(value).trim().toLowerCase();
		return ![
			"false",
			"0",
			"no",
			"off"
		].includes(normalized);
	}
	return {
		showTitle: parseBoolDataAttr(shell.getAttribute("data-show-title"), true),
		showTime: parseBoolDataAttr(shell.getAttribute("data-show-time"), true)
	};
}
function createPoster(initialTitle, initialTime, posterUrl, metaSettings = {
	showTitle: true,
	showTime: true
}) {
	const poster = document.createElement("button");
	poster.type = "button";
	poster.className = "poster";
	poster.dataset.showTitle = metaSettings.showTitle ? "true" : "false";
	poster.dataset.showTime = metaSettings.showTime ? "true" : "false";
	poster.setAttribute("aria-label", "Play " + initialTitle);
	const bgValue = posterUrl ? `url('${posterUrl}')` : "linear-gradient(135deg, #2a2a2a, #121212)";
	poster.style.setProperty("--poster-bg", bgValue);
	const meta = document.createElement("span");
	meta.className = "meta-stack";
	const title = document.createElement("span");
	title.className = "title-badge hidden";
	title.textContent = initialTitle;
	const time = document.createElement("span");
	time.className = "time-badge hidden";
	time.textContent = initialTime;
	if (!metaSettings.showTitle) title.classList.add("hidden");
	if (!metaSettings.showTime) time.classList.add("hidden");
	meta.append(title, time);
	const playTile = document.createElement("span");
	playTile.className = "play-badge";
	playTile.setAttribute("aria-hidden", "true");
	const playGlyph = document.createElement("span");
	playGlyph.className = "play-glyph";
	playGlyph.textContent = "▶";
	playTile.append(playGlyph);
	const sr = document.createElement("span");
	sr.className = "sr-only";
	sr.textContent = "Play " + initialTitle;
	poster.append(meta, playTile, sr);
	return poster;
}
function updatePosterMeta(poster, payload) {
	const showTitle = poster.dataset.showTitle !== "false";
	const showTime = poster.dataset.showTime !== "false";
	if ("title" in payload) {
		const title = poster.querySelector(".title-badge");
		const sr = poster.querySelector(".sr-only");
		if (title) {
			title.textContent = payload.title;
			if (showTitle) title.classList.remove("hidden");
		}
		if (sr) sr.textContent = "Play " + payload.title;
		poster.setAttribute("aria-label", "Play " + payload.title);
	}
	if ("time" in payload) {
		const time = poster.querySelector(".time-badge");
		if (time) {
			time.textContent = payload.time;
			if (!showTime || payload.time === "--:--") time.classList.add("hidden");
			else time.classList.remove("hidden");
		}
	}
	if ("thumbUrl" in payload && payload.thumbUrl) poster.style.setProperty("--poster-bg", `url('${payload.thumbUrl}')`);
}
function setError(shell, message) {
	shell.replaceChildren();
	const error = document.createElement("div");
	error.className = "error-label";
	error.textContent = message;
	shell.append(error);
}
//#endregion
//#region src/scripts/videoPoster/utils.js
function formatDuration(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor(total % 3600 / 60);
	const secs = total % 60;
	if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	return `${minutes}:${String(secs).padStart(2, "0")}`;
}
async function fetchJsonWithTimeout(url, timeoutMs = 2500) {
	const controller = new AbortController();
	const timeoutId = setTimeout(function() {
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
function titleFromUrl(url) {
	try {
		const parsed = new URL(url);
		return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "video").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || "Video";
	} catch {
		return "Video";
	}
}
//#endregion
//#region src/scripts/videoPoster/providers/html5.js
function initHtml5(shell, videoUrl) {
	if (!videoUrl) {
		setError(shell, "Missing HTML5 video URL");
		return;
	}
	const video = document.createElement("video");
	video.controls = true;
	video.preload = "metadata";
	video.playsInline = true;
	video.src = videoUrl;
	const poster = createPoster("", "--:--", shell.getAttribute("data-poster-url") || "", getPosterMetaSettings(shell));
	video.addEventListener("loadedmetadata", function() {
		updatePosterMeta(poster, {
			title: titleFromUrl(videoUrl),
			time: formatDuration(video.duration)
		});
	});
	video.addEventListener("error", function() {
		setError(shell, "HTML5 video failed to load. Please check the video URL or try another file.");
	});
	poster.addEventListener("click", async function() {
		poster.classList.add("hidden");
		try {
			if (video.src !== videoUrl) video.load();
			video.muted = false;
			await video.play();
		} catch {
			poster.classList.remove("hidden");
		}
	});
	shell.append(video, poster);
}
//#endregion
//#region src/scripts/videoPoster/constants.js
var ALLOW = {
	youtube: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
	vimeo: "autoplay; fullscreen; picture-in-picture"
};
//#endregion
//#region src/scripts/videoPoster/dom.js
function createIframe(title, allow) {
	const iframe = document.createElement("iframe");
	iframe.title = title;
	iframe.loading = "lazy";
	iframe.allow = allow;
	iframe.allowFullscreen = true;
	iframe.referrerPolicy = "strict-origin-when-cross-origin";
	iframe.sandbox = "allow-scripts allow-same-origin allow-presentation allow-popups";
	return iframe;
}
//#endregion
//#region src/scripts/videoPoster/providers/vimeo.js
function initVimeo(shell, videoUrl) {
	function getVimeoId(url) {
		try {
			const parsed = new URL(url);
			const host = parsed.hostname.replace(/^www\./, "");
			if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
			const match = parsed.pathname.match(/\/(\d+)/);
			return match ? match[1] : null;
		} catch {
			return null;
		}
	}
	function createVimeoPlayUrl(id) {
		return `https://player.vimeo.com/video/${id}?${new URLSearchParams({
			autoplay: "1",
			muted: "0",
			title: "0",
			byline: "0",
			portrait: "0",
			badge: "0",
			dnt: "1"
		}).toString()}`;
	}
	const id = getVimeoId(videoUrl);
	if (!id) {
		setError(shell, "Invalid Vimeo URL");
		return;
	}
	const titleFallback = "Vimeo Video";
	const iframe = createIframe(titleFallback, ALLOW.vimeo);
	const poster = createPoster(titleFallback, "--:--", "", getPosterMetaSettings(shell));
	poster.addEventListener("click", function() {
		poster.classList.add("hidden");
		iframe.src = createVimeoPlayUrl(id);
		iframe.focus();
	}, { once: true });
	shell.append(iframe, poster);
	fetchJsonWithTimeout(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`).then((data) => {
		if (data && data.title) updatePosterMeta(poster, { title: data.title });
		if (data && data.thumbnail_url) updatePosterMeta(poster, { thumbUrl: data.thumbnail_url });
		if (data && data.duration) updatePosterMeta(poster, { time: formatDuration(data.duration) });
	});
	updatePosterMeta(poster, {
		title: titleFallback,
		time: "--:--"
	});
}
//#endregion
//#region src/scripts/videoPoster/providers/youtube.js
function initYouTube(shell, videoUrl) {
	function getYouTubeId(url) {
		try {
			const parsed = new URL(url);
			const host = parsed.hostname.replace(/^www\./, "");
			if (host === "youtu.be") return parsed.pathname.slice(1);
			if ((host === "youtube.com" || host === "m.youtube.com") && parsed.searchParams.has("v")) return parsed.searchParams.get("v");
			const match = parsed.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/);
			return match ? match[2] : null;
		} catch {
			return null;
		}
	}
	function createYouTubeUrl(id, autoplay) {
		return `https://www.youtube.com/embed/${id}?${new URLSearchParams({
			autoplay: autoplay ? "1" : "0",
			mute: "0",
			rel: "0",
			iv_load_policy: "3",
			controls: "1",
			fs: "1",
			modestbranding: "1",
			playsinline: "1",
			enablejsapi: "1"
		}).toString()}`;
	}
	const id = getYouTubeId(videoUrl);
	if (!id) {
		setError(shell, "Invalid YouTube URL");
		return;
	}
	const titleFallback = "YouTube Video";
	const thumbUrl = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
	const iframe = createIframe(titleFallback, ALLOW.youtube);
	const poster = createPoster(titleFallback, "--:--", thumbUrl, getPosterMetaSettings(shell));
	poster.addEventListener("click", function() {
		poster.classList.add("hidden");
		iframe.src = createYouTubeUrl(id, true);
		iframe.focus();
	}, { once: true });
	shell.append(iframe, poster);
	fetchJsonWithTimeout(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`).then((data) => {
		if (data && data.title) updatePosterMeta(poster, { title: data.title });
	});
	updatePosterMeta(poster, {
		title: titleFallback,
		time: "--:--",
		thumbUrl
	});
}
//#endregion
//#region src/scripts/videoPoster/index.js
function initVideoShell(shell) {
	const type = shell.dataset.videoType;
	const videoUrl = shell.dataset.videoUrl;
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
function initAllVideoShells(root = document) {
	root.querySelectorAll(".video-shell").forEach(initVideoShell);
}
//#endregion
//#region src/scripts/main.js
initAllVideoShells();
//#endregion
