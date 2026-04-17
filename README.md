# VideoPoster

A small Vite demo that renders poster-first video players with click-to-play behavior for:

- YouTube
- Vimeo
- HTML5 video

The UI is built from `data-` attributes in `src/index.html`. Each `.video-with-poster` starts as a poster overlay and swaps to an active player after user interaction.

The demo currently renders provider sections (YouTube, Vimeo, HTML5) with two videos per section.

## Tech Stack

- Vite 8
- Vanilla JavaScript (ES modules)
- CSS

## Repository Layout

This repository uses a nested app folder:

```text
.
|-- LICENSE
|-- README.md
`-- src/
    |-- index.html
    |-- package.json
    |-- package-lock.json
    |-- vite.config.js
    |-- public/
    `-- src/
        |-- scripts/
        |   |-- main.js
        |   `-- videoPoster/
        |       |-- constants.js
        |       |-- dom.js
        |       |-- index.js
        |       |-- poster.js
        |       |-- utils.js
        |       |-- utils.test.js
        |       `-- providers/
        |           |-- html5.js
        |           |-- vimeo.js
        |           `-- youtube.js
        `-- styles/
            `-- style.css
```

Run all npm commands from the app directory (`./src`).

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
cd src
npm install
```

### Run in Development

```bash
cd src
npm run dev
```

### Build for Production

```bash
cd src
npm run build
```

### Preview Production Build

```bash
cd src
npm run preview
```

### Run Tests

```bash
cd src
npm run test
```

## Markup API

Define one container per video:

```html
<div
    data-video-with-poster
    data-video-url="https://..."
    data-video-type="youtube|vimeo|html5"
    data-poster-url="https://..."
    data-title="Custom player title"
    data-media-id="my-player"
    data-width="640"
    data-height="360"
    data-loading="lazy|eager"
    data-allow="autoplay; fullscreen; picture-in-picture"
    data-allowfullscreen="true|false"
    data-show-title="true|false"
    data-show-time="true|false"
></div>
```

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-video-with-poster` | Yes | — | Marks the element as a video shell |
| `data-video-url` | Yes | — | Source video URL |
| `data-video-type` | No | auto-detected | `youtube`, `vimeo`, or `html5`; inferred from URL when omitted |
| `data-poster-url` | No | — | Custom poster image; overrides the provider thumbnail fallback |
| `data-title` | No | Provider default | Overrides the `title` attribute on the `<iframe>` or `<video>` element |
| `data-media-id` | No | — | Sets the `id` attribute on the `<iframe>` or `<video>` element |
| `data-width` | No | — | Sets the `width` attribute on the `<iframe>` or `<video>` element |
| `data-height` | No | — | Sets the `height` attribute on the `<iframe>` or `<video>` element |
| `data-loading` | No | `lazy` | Sets the `loading` attribute; pass `eager` to disable lazy loading |
| `data-allow` | No | Provider default | Overrides the `allow` attribute on the `<iframe>` (YouTube/Vimeo only) |
| `data-allowfullscreen` | No | `true` | Controls the `allowFullscreen` property on the `<iframe>` (YouTube/Vimeo only) |
| `data-show-title` | No | `true` | Controls title badge visibility |
| `data-show-time` | No | `true` | Controls duration/time badge visibility |

Boolean parsing for `data-show-title`, `data-show-time`, and `data-allowfullscreen` treats the following values as false: `false`, `0`, `no`, `off` (case-insensitive).

Example with all attributes:

```html
<div
    data-video-with-poster
    data-video-url="https://www.youtube.com/watch?v=k7dy1B6bOeM"
    data-title="My Video Title"
    data-media-id="my-player"
    data-width="640"
    data-height="360"
    data-loading="eager"
    data-allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
    data-allowfullscreen="true"
    data-show-title="true"
    data-show-time="false"
></div>
```

Example that hides both title and time:

```html
<div
    data-video-with-poster
    data-video-url="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    data-poster-url="https://example.com/poster.jpg"
    data-show-title="false"
    data-show-time="false"
></div>
```

## Runtime API

Core initialization flow:

- `initAllVideoShells(root = document)` scans for `.video-with-poster` nodes.
- `initVideoShell(shell)` routes by `data-video-type`.
- Provider entry points:
  - `initYouTube(shell, videoUrl)`
  - `initVimeo(shell, videoUrl)`
  - `initHtml5(shell, videoUrl)`

Poster rendering and updates are handled in `poster.js`, while shared helpers (duration formatting, URL title parsing, timed metadata fetch) live in `utils.js`.

## Deploy to GitHub Pages

The app includes `gh-pages` scripts and a dynamic Vite `base` value:

- `predeploy`: builds the app
- `deploy`: publishes `dist` to GitHub Pages

Deploy command:

```bash
cd src
npm run deploy
```

The Vite config uses `GITHUB_REPOSITORY` to compute the production base path (`/<repo-name>/`) during build. This is usually set automatically in GitHub Actions.

## Notes

- Browser autoplay policies usually require user interaction before unmuted playback.
- Embedded providers (YouTube/Vimeo) may change behavior over time due to API/player policy changes.
- Poster metadata requests use a short timeout and graceful fallback so delayed oEmbed responses do not block rendering.

## License

Licensed under MIT. See `LICENSE` for details.
