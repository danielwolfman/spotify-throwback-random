# spotify-throwback-random

A Spotify web app that helps you rediscover your music by randomly playing songs from your liked tracks and recently played history.

## Features

- 🎵 Browse your liked songs
- 🕒 View recently played tracks
- 🎲 Add random songs to your queue
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

3. Create a `.env` file in the project root:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Log in with your Spotify account
2. Ensure you have an active Spotify player (desktop app, web player, or mobile)
3. Browse your music library
4. Click "Random" to add a random song to your queue

## Development

- Built with React + TypeScript
- Uses Vite for fast development
- Integrates with Spotify Web API

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

## License

MIT
