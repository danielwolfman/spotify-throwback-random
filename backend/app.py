import os
import requests
import logging
from flask import Flask, request, redirect, session, jsonify
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from a .env file
logger.info("Loading environment variables from .env file")
load_dotenv()

# Spotify API credentials
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
SCOPES = "user-modify-playback-state"

logger.debug(f"Spotify credentials loaded - Client ID: {CLIENT_ID[:5]}..., Redirect URI: {REDIRECT_URI}")

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
logger.info("Flask app initialized")

# Spotify token endpoints
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

# In-memory storage for tokens (replace with DB for production)
user_tokens = {}

@app.route("/login")
def login():
    """Redirects the user to Spotify's authorization page."""
    logger.info("Initiating Spotify login flow")
    auth_url = (
        f"{SPOTIFY_AUTH_URL}?response_type=code&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}&scope={SCOPES}"
    )
    logger.debug(f"Generated auth URL: {auth_url[:60]}...")
    return redirect(auth_url)

@app.route("/callback")
def callback():
    """Handles Spotify's OAuth callback and fetches tokens."""
    logger.info("Received callback from Spotify")
    code = request.args.get("code")
    if not code:
        logger.error("No authorization code received in callback")
        return "Authorization failed. Please try again.", 400

    logger.debug("Exchanging authorization code for tokens")
    # Exchange authorization code for access and refresh tokens
    response = requests.post(
        SPOTIFY_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    )
    tokens = response.json()
    if "access_token" not in tokens:
        logger.error(f"Token exchange failed. Response: {tokens}")
        return "Failed to fetch tokens. Please try again.", 400

    # Store tokens (session-based for PoC)
    session["access_token"] = tokens["access_token"]
    session["refresh_token"] = tokens["refresh_token"]
    session["expires_in"] = tokens["expires_in"]
    logger.info("Successfully stored tokens in session")
    logger.debug(f"Token expires in {tokens['expires_in']} seconds")

    return "Authentication successful! You can now add songs to your queue."

@app.route("/add-to-queue", methods=["POST"])
def add_to_queue():
    """Adds a song to the user's Spotify queue."""
    logger.info("Received request to add song to queue")
    access_token = session.get("access_token")
    if not access_token:
        logger.error("No access token found in session")
        return "User not authenticated. Please log in.", 401

    # Get the song URI from the request
    data = request.get_json()
    song_uri = data.get("uri")
    if not song_uri:
        logger.error("No song URI provided in request")
        return "Song URI is required.", 400

    logger.debug(f"Attempting to add song {song_uri} to queue")
    # Add the song to the queue
    response = requests.post(
        "https://api.spotify.com/v1/me/player/queue",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"uri": song_uri},
    )

    if response.status_code == 204:
        logger.info(f"Successfully added song {song_uri} to queue")
        return jsonify({"message": "Song added to the queue!"}), 200
    else:
        logger.error(f"Failed to add song to queue. Status: {response.status_code}, Response: {response.json()}")
        return jsonify({"error": response.json()}), response.status_code
    
@app.route("/liked-songs", methods=["GET"])
def fetch_liked_songs():
    logger.info("Fetching user's liked songs")
    access_token = session.get("access_token")
    if not access_token:
        logger.error("No access token found in session")
        return "User not authenticated.", 401

    liked_songs = []
    url = "https://api.spotify.com/v1/me/tracks"
    headers = {"Authorization": f"Bearer {access_token}"}

    while url:
        logger.debug(f"Fetching liked songs from: {url}")
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logger.error(f"Failed to fetch liked songs. Status: {response.status_code}, Response: {response.json()}")
            return jsonify(response.json()), response.status_code

        data = response.json()
        liked_songs.extend(data["items"])
        url = data["next"]  # Pagination
        logger.debug(f"Retrieved {len(data['items'])} songs. Total songs so far: {len(liked_songs)}")

    logger.info(f"Successfully retrieved {len(liked_songs)} liked songs")
    return jsonify(liked_songs)

@app.route("/recently-played", methods=["GET"])
def fetch_recently_played():
    logger.info("Fetching recently played tracks")
    access_token = session.get("access_token")
    if not access_token:
        logger.error("No access token found in session")
        return "User not authenticated.", 401

    url = "https://api.spotify.com/v1/me/player/recently-played?limit=50"
    headers = {"Authorization": f"Bearer {access_token}"}

    logger.debug("Making request to Spotify API for recently played tracks")
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        logger.error(f"Failed to fetch recently played tracks. Status: {response.status_code}, Response: {response.json()}")
        return jsonify(response.json()), response.status_code

    tracks = response.json()["items"]
    logger.info(f"Successfully retrieved {len(tracks)} recently played tracks")
    return jsonify(tracks)

@app.route("/queue-songs", methods=["POST"])
def queue_songs():
    logger.info("Received request to queue multiple songs using prioritization algorithm")
    access_token = session.get("access_token")
    if not access_token:
        logger.error("No access token found in session")
        return "User not authenticated. Please log in.", 401

    headers = {"Authorization": f"Bearer {access_token}"}

    # Fetch liked songs
    liked_songs = []
    url = "https://api.spotify.com/v1/me/tracks"
    while url:
        logger.debug(f"Fetching liked songs from: {url}")
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logger.error(f"Failed to fetch liked songs. Status: {response.status_code}, Response: {response.json()}")
            return jsonify(response.json()), response.status_code
        data = response.json()
        liked_songs.extend(data["items"])
        url = data["next"]  # Pagination

    logger.info(f"Successfully retrieved {len(liked_songs)} liked songs")

    # Fetch recently played tracks
    logger.debug("Fetching recently played tracks")
    url = "https://api.spotify.com/v1/me/player/recently-played?limit=50"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        logger.error(f"Failed to fetch recently played tracks. Status: {response.status_code}, Response: {response.json()}")
        return jsonify(response.json()), response.status_code
    recently_played = response.json()["items"]
    logger.info(f"Successfully retrieved {len(recently_played)} recently played tracks")

    # Use the algorithm to determine songs to queue
    selected_songs = get_songs_to_queue(
        liked_songs=[{"id": song["track"]["id"], "uri": song["track"]["uri"]} for song in liked_songs],
        recently_played=[{"id": track["track"]["id"]} for track in recently_played]
    )

    if not selected_songs:
        logger.warning("No songs selected for queueing")
        return jsonify({"message": "No songs to queue."}), 200

    # Queue the selected songs
    logger.debug(f"Queueing {len(selected_songs)} songs")
    for uri in selected_songs:
        logger.debug(f"Queueing song: {uri}")
        response = requests.post(
            f"https://api.spotify.com/v1/me/player/queue?uri={uri}",
            headers=headers,
        )
        if response.status_code != 204:
            logger.error(f"Failed to queue song {uri}. Status: {response.status_code}, Response: {response.json()}")
            return jsonify(response.json()), response.status_code

    logger.info(f"Successfully queued {len(selected_songs)} songs")
    return jsonify({"message": "Songs queued successfully!", "queued_songs": selected_songs})

@app.route("/playback-status", methods=["GET"])
def playback_status():
    access_token = session.get("access_token")
    if not access_token:
        return jsonify({"is_active": False}), 401

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("https://api.spotify.com/v1/me/player", headers=headers)

    if response.status_code == 200:
        player = response.json()
        return jsonify({"is_active": player.get("is_playing", False)})
    return jsonify({"is_active": False}), response.status_code

@app.route("/devices", methods=["GET"])
def devices():
    access_token = session.get("access_token")
    if not access_token:
        return jsonify({"devices": []}), 401

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("https://api.spotify.com/v1/me/player/devices", headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"devices": []}), response.status_code

@app.route("/transfer-playback", methods=["POST"])
def transfer_playback():
    access_token = session.get("access_token")
    if not access_token:
        return "User not authenticated.", 401

    data = request.get_json()
    device_id = data.get("device_id")
    if not device_id:
        return "Device ID is required.", 400

    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"device_ids": [device_id], "play": True}
    response = requests.put("https://api.spotify.com/v1/me/player", headers=headers, json=payload)

    if response.status_code == 204:
        return jsonify({"message": "Playback transferred successfully!"}), 200
    return jsonify(response.json()), response.status_code


def get_songs_to_queue(liked_songs, recently_played):
    logger.info("Generating queue recommendations")
    logger.debug(f"Processing {len(liked_songs)} liked songs and {len(recently_played)} recently played tracks")
    
    # Create a set of recently played song IDs
    recently_played_ids = {track['id'] for track in recently_played}
    logger.debug(f"Found {len(recently_played_ids)} unique recently played tracks")

    # Assign priority scores to liked songs
    prioritized_songs = []
    for song in liked_songs:
        if song['id'] in recently_played_ids:
            # Low priority if recently played
            score = 1
            logger.debug(f"Song {song['id']} was recently played, assigned low priority")
        else:
            # Higher priority if not recently played
            score = 10
            logger.debug(f"Song {song['id']} was not recently played, assigned high priority")
        prioritized_songs.append((song['uri'], score))

    # Sort songs by priority
    prioritized_songs.sort(key=lambda x: -x[1])
    logger.debug("Songs sorted by priority scores")

    # Randomize selection within priority groups
    top_priority_songs = [uri for uri, score in prioritized_songs if score > 5]
    medium_priority_songs = [uri for uri, score in prioritized_songs if 2 <= score <= 5]
    
    logger.debug(f"Found {len(top_priority_songs)} top priority songs and {len(medium_priority_songs)} medium priority songs")

    # Select songs
    selected_songs = top_priority_songs[:10] + medium_priority_songs[:5]
    logger.info(f"Selected {len(selected_songs)} songs for queueing")
    return selected_songs


if __name__ == "__main__":
    logger.info("Starting Flask application in debug mode")
    app.run(debug=True)
