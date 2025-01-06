import React, { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import { fetchUserProfile, fetchLikedSongs, fetchRecentlyPlayedTracks, addToQueue } from "./services/spotifyApi";
import { getSongsToQueue } from "./utils/queueAlgorithm";


const App = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        setAccessToken(token);
        localStorage.setItem("spotify_access_token", token);
        window.history.replaceState({}, document.title, "/"); // Clean up URL
      }
    } else {
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      const fetchData = async () => {
        try {
          const profile = await fetchUserProfile(accessToken);
          setUserProfile(profile);

          const songs = await fetchLikedSongs(accessToken);
          setLikedSongs(songs);
        } catch (error) {
          console.error("Error fetching data:", error);
          setAccessToken(null);
          localStorage.removeItem("spotify_access_token");
        }
      };
      fetchData();
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      const fetchRecentlyPlayed = async () => {
        try {
          const tracks = await fetchRecentlyPlayedTracks(accessToken);
          setRecentlyPlayed(tracks);
        } catch (error) {
          console.error("Error fetching recently played tracks:", error);
          setAccessToken(null);
          localStorage.removeItem("spotify_access_token");
        }
      };
      fetchRecentlyPlayed();
    }
  }, [accessToken]);

  const generateQueue = () => {
    if (likedSongs.length > 0 && recentlyPlayed.length > 0) {
      const songsToQueue = getSongsToQueue(likedSongs, recentlyPlayed, 10);
      setQueue(songsToQueue);
    }
  };

  const sendQueueToSpotify = async () => {
    if (accessToken && queue.length > 0) {
      try {
        for (const song of queue) {
          await addToQueue(accessToken, song.uri);
        }
        alert("Queue sent to Spotify!");
      } catch (error) {
        console.error("Error sending queue to Spotify:", error);
        setAccessToken(null);
        localStorage.removeItem("spotify_access_token");
      }
    }
  };

  return (
    <div>
      <h1>Spotify Queue Manager</h1>
      {!accessToken ? (
        <LoginButton />
      ) : (
        <>
          <p>Logged in as: {userProfile?.display_name || "Loading..."}</p>
          <button onClick={generateQueue}>Generate Queue</button>
          <button onClick={sendQueueToSpotify} disabled={queue.length === 0}>
            Send Queue to Spotify
          </button>
        </>
      )}
    </div>
  );
};

export default App;

