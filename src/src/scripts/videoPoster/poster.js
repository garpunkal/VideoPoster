function parseBoolDataAttr(value, defaultValue = true) {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  return !["false", "0", "no", "off"].includes(normalized);
}

export function getPosterMetaSettings(shell) {
  return {
    showTitle: parseBoolDataAttr(shell.getAttribute("data-show-title"), true),
    showTime: parseBoolDataAttr(shell.getAttribute("data-show-time"), true)
  };
}

export function createPoster(initialTitle, initialTime, posterUrl, metaSettings = { showTitle: true, showTime: true }) {
  const poster = document.createElement("button");
  poster.type = "button";
  poster.className = "poster";
  poster.dataset.showTitle = metaSettings.showTitle ? "true" : "false";
  poster.dataset.showTime = metaSettings.showTime ? "true" : "false";
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

  if (!metaSettings.showTitle) {
    title.classList.add("hidden");
  }
  if (!metaSettings.showTime) {
    time.classList.add("hidden");
  }

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

export function updatePosterMeta(poster, payload) {
  const showTitle = poster.dataset.showTitle !== "false";
  const showTime = poster.dataset.showTime !== "false";

  if (payload.title) {
    const title = poster.querySelector(".title-badge");
    const sr = poster.querySelector(".sr-only");
    if (title) {
      title.textContent = payload.title;
      if (showTitle) {
        title.classList.remove("hidden");
      }
    }
    if (sr) {
      sr.textContent = "Play " + payload.title;
    }
    poster.setAttribute("aria-label", "Play " + payload.title);
  }

  if (payload.time) {
    const time = poster.querySelector(".time-badge");
    if (time) {
      time.textContent = payload.time;
      if (!showTime || payload.time === "--:--") {
        time.classList.add("hidden");
      } else {
        time.classList.remove("hidden");
      }
    }
  }

  if (payload.thumbUrl) {
    poster.style.setProperty("--poster-bg", `url('${payload.thumbUrl}')`);
  }
}

export function setError(shell, message) {
  shell.innerHTML = '<div class="error-label">' + message + "</div>";
}
