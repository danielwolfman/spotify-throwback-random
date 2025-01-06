import React, { useState } from 'react';
import LoginButton from './LoginButton';
import WelcomeMessage from './WelcomeMessage';
import { addToQueue } from '../services/spotifyApi';
import { generateRandomQueue } from '../utils/queueAlgorithm';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [queueSize, setQueueSize] = useState(5);
  const isLoggedIn = sessionStorage.getItem('spotify_access_token');
  const accessToken = sessionStorage.getItem('spotify_access_token') || '';

  const handleGenerateQueue = async () => {
    setIsLoading(true);
    try {
      const songs = await generateRandomQueue(accessToken, queueSize);
      for (const song of songs) {
        await addToQueue(accessToken, song.uri);
      }
      alert('Songs added to queue successfully!');
    } catch (error) {
      console.error('Error generating queue:', error);
      alert('Error adding songs to queue. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Spotify Throwback Random</h1>
      {isLoggedIn ? (
        <div className="space-y-4">
          <WelcomeMessage />
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="queueSize" className="font-medium">
                Number of songs: {queueSize}
              </label>
              <input
                type="range"
                id="queueSize"
                min="1"
                max="20"
                value={queueSize}
                onChange={(e) => setQueueSize(Number(e.target.value))}
                className="w-48"
              />
            </div>
            <button
              onClick={handleGenerateQueue}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Adding to Queue...' : 'Generate Random Queue'}
            </button>
          </div>
        </div>
      ) : (
        <LoginButton />
      )}
    </div>
  );
};

export default Home;