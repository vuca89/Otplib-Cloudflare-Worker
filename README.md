# Otplib Cloudflare Worker

A TOTP one-time password (OTP) generator running on Cloudflare Workers with a browser-based UI.

## Features

- Generate TOTP codes from any Base32 secret key
- Auto-refreshes every 30 seconds with a live countdown timer
- Copy OTP to clipboard with one click
- Secret key input with show/hide toggle
- Dark / light theme toggle
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
│   ├── favicon.ico
│   └── favicon.png
```

## Credits

- OTP generation powered by [otplib](https://otplib.yeojz.dev)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
