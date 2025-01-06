# spotify-throwback-random

A Spotify web app that helps you rediscover your music by randomly playing songs from your liked tracks, excluding recently played ones.

🎵 **Try it here:** [https://danielwolfman.github.io/spotify-throwback-random/](https://danielwolfman.github.io/spotify-throwback-random/)

## Features

- 🎵 Browse your liked songs
- 🕒 Exclude recently played tracks
- 🎲 Add random songs to your queue
- 🎚️ Choose how many songs to add (1-20)
- 🔄 Automatic playback management
- 🔐 Secure Spotify authentication

## Prerequisites

- Node.js (v16 or higher)
- A Spotify account
- Spotify Developer App credentials

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spotify-throwback-random
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-throwback-random/callback
```

4. Start the development server:
```bash
npm run dev
```

## Development

- Built with React + TypeScript
- Uses Vite for fast development
- Integrates with Spotify Web API
- GitHub Actions for automated deployment

## Required Spotify Permissions

- user-read-private
- user-read-email
- user-library-read
- user-read-recently-played
- user-read-playback-state
- user-modify-playback-state
- user-read-currently-playing
- streaming
- app-remote-control

## Deployment

The app is automatically deployed to GitHub Pages using GitHub Actions. To deploy:

1. Add your `SPOTIFY_CLIENT_ID` to your repository secrets
2. Push to the main branch
3. GitHub Actions will handle the build and deployment

## License

MIT
