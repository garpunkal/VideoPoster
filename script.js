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
//#region src/main.js
var ALLOW = {
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
	meta.append(title, time);
	const playTile = document.createElement("span");
	playTile.className = "play-badge";
	playTile.setAttribute("aria-hidden", "true");
	const playGlyph = document.createElement("span");
	playGlyph.className = "play-glyph";
	playGlyph.textContent = "▶";
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
	if (payload.thumbUrl) poster.style.setProperty("--poster-bg", `url('${payload.thumbUrl}')`);
}
function setError(shell, message) {
	shell.innerHTML = "<div class=\"error-label\">" + message + "</div>";
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
function createVimeoUrl(id) {
	return `https://player.vimeo.com/video/${id}?${new URLSearchParams({
		autoplay: "0",
		muted: "0",
		title: "0",
		byline: "0",
		portrait: "0",
		badge: "0",
		dnt: "1"
	}).toString()}`;
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
function guessPosterFromVideoUrl(url) {
	if (!url) return "";
	if (url.includes("w3schools.com/html/mov_bbb.mp4")) return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg";
	if (url.includes("gtv-videos-bucket/sample/")) {
		const baseName = (url.split("/").pop() || "").replace(/\.[a-z0-9]+$/i, "");
		if (baseName) return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/${encodeURIComponent(baseName)}.jpg`;
	}
	return "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1280&q=80";
}
function formatDuration(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor(total % 3600 / 60);
	const secs = total % 60;
	if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	return `${minutes}:${String(secs).padStart(2, "0")}`;
}
function titleFromUrl(url) {
	try {
		const parsed = new URL(url);
		return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "video").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || "Video";
	} catch {
		return "Video";
	}
}
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
function getVimeoId(url) {
	try {
		const match = new URL(url).pathname.match(/\/(\d+)/);
		return match ? match[1] : null;
	} catch {
		return null;
	}
}
function setupHtml5(shell, videoUrl) {
	if (!videoUrl) {
		setError(shell, "Missing HTML5 video URL");
		return;
	}
	const candidateUrls = [videoUrl, ...["https://www.w3schools.com/html/mov_bbb.mp4", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"]].filter(function(url, index, arr) {
		return Boolean(url) && arr.indexOf(url) === index;
	});
	let activeUrlIndex = 0;
	let hasStarted = false;
	const video = document.createElement("video");
	video.controls = true;
	video.preload = "metadata";
	video.playsInline = true;
	const initialPosterUrl = guessPosterFromVideoUrl(candidateUrls[activeUrlIndex]);
	if (initialPosterUrl) video.poster = initialPosterUrl;
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
	}
	video.addEventListener("loadedmetadata", function() {
		updatePosterMeta(poster, {
			title: titleFromUrl(video.currentSrc || candidateUrls[activeUrlIndex]),
			time: formatDuration(video.duration)
		});
	});
	video.addEventListener("error", function() {
		if (activeUrlIndex < candidateUrls.length - 1) {
			poster.classList.remove("hidden");
			applySource(activeUrlIndex + 1);
			if (hasStarted) attemptPlay();
			return;
		}
		setError(shell, "HTML5 video failed to load. Please check the video URL or try another file.");
	});
	async function attemptPlay() {
		const desiredSrc = candidateUrls[activeUrlIndex];
		if (video.src !== desiredSrc) video.load();
		video.muted = false;
		await video.play();
	}
	poster.addEventListener("click", async function() {
		hasStarted = true;
		poster.classList.add("hidden");
		try {
			await attemptPlay();
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
	poster.addEventListener("click", function() {
		if (started) return;
		started = true;
		poster.classList.add("hidden");
		iframe.src = createYouTubeUrl(id, true);
		iframe.focus();
	});
	shell.append(iframe, poster);
	updatePosterMeta(poster, {
		title: titleFallback,
		time: "--:--",
		thumbUrl
	});
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
	poster.addEventListener("click", function() {
		if (started) return;
		started = true;
		poster.classList.add("hidden");
		iframe.src = createVimeoPlayUrl(id);
		iframe.focus();
	});
	shell.append(iframe, poster);
	updatePosterMeta(poster, {
		title: titleFallback,
		time: "--:--",
		thumbUrl
	});
}
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
document.querySelectorAll(".video-shell").forEach(initVideoShell);
//#endregion
