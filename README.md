# VideoPoster

A small Vite demo that renders poster-first video players with click-to-play behavior for:

- YouTube
- Vimeo
- HTML5 video

The UI is built from `data-` attributes in `src/index.html`. Each `.video-shell` starts as a poster overlay and swaps to an active player after user interaction.

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
        |-- vite.config.js
        |-- public/
        `-- src/
                |-- main.js
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

## Markup API

Define one container per video:

```html
<div
    class="video-shell"
    data-video-type="youtube|vimeo|html5"
    data-video-url="https://..."
    data-poster-url="https://..."
    data-show-title="true|false"
    data-show-time="true|false"
></div>
```

- `data-video-type` (required): `youtube`, `vimeo`, or `html5`
- `data-video-url` (required): source video URL
- `data-poster-url` (optional): custom poster image (mainly useful for HTML5)
- `data-show-title` (optional): controls title badge visibility; default is `true`
- `data-show-time` (optional): controls duration/time badge visibility; default is `true`

Boolean parsing for `data-show-title` and `data-show-time` treats the following values as false: `false`, `0`, `no`, `off` (case-insensitive).

Example that hides both title and time:

```html
<div
    class="video-shell"
    data-video-type="html5"
    data-video-url="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    data-show-title="false"
    data-show-time="false"
></div>
```

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

## License

Licensed under MIT. See `LICENSE` for details.
