# VideoPoster

A small Vite demo that renders video posters and click-to-play embeds for:

- YouTube
- Vimeo
- HTML5 video

The app builds player shells from `data-` attributes in `index.html`, creates poster overlays, and swaps to active playback when the user clicks.

## Tech Stack

- Vite 8
- Vanilla JavaScript (ES modules)
- CSS

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
|-- public/
`-- src/
    |-- main.js
    `-- style.css
```

## Notes

- Browser autoplay policies usually require a user interaction before playing unmuted media.
- Embedded providers (YouTube/Vimeo) can change behavior over time based on their API/player policies.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
