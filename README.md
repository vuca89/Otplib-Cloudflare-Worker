# Otplib Cloudflare Worker

A TOTP one-time password (OTP) generator running on Cloudflare Workers with a browser-based UI.

## Features

- Multi-language UI (English, Japanese, Korean, German, Thai, Chinese, Vietnamese) — locale files loaded on demand
- Generate TOTP codes from any Base32 secret key
- Auto-refreshes every 30 seconds with a live countdown timer
- Auto-stops after 5 minutes of inactivity with an in-app alert; click **Generate** to restart
- Pause / resume the countdown timer with a dedicated button
- Copy OTP to clipboard with one click
- Secret key input with show/hide toggle
- Dark / light theme toggle (persists across sessions via `localStorage`)
- `frame-ancestors 'none'` enforced via HTTP response header for full browser support
- No build tools required — plain HTML, Tailwind CDN, and Vanilla JS

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`

## Getting Started

### Development

```bash
wrangler dev
```

Open `http://localhost:8787` in your browser.

### Deploy

```bash
# Deploy to default environment
wrangler deploy

# Deploy to production environment
wrangler deploy --env production
```

## Project Structure

```
├── index.js          # Cloudflare Worker entry point
├── wrangler.jsonc    # Wrangler configuration
├── assets/
│   ├── index.html    # Main app UI
│   ├── 404.html      # 404 error page
│   ├── app.js        # Frontend JavaScript
│   ├── tailwind-config.js
│   ├── favicon.ico
│   ├── favicon.png
│   └── locales/      # i18n locale files (loaded on demand)
│       ├── en.json
│       ├── ja.json
│       ├── ko.json
│       ├── de.json
│       ├── th.json
│       ├── zh.json
│       └── vi.json
```

## Credits

- OTP generation powered by [otplib](https://otplib.yeojz.dev)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
