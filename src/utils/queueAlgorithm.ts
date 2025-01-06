import { fetchLikedSongs, fetchRecentlyPlayedTracks } from '../services/spotifyApi';

export const generateRandomQueue = async (accessToken: string, size: number = 5) => {
  // Get both liked and recently played songs
  const likedSongs = await fetchLikedSongs(accessToken);
  const recentSongs = await fetchRecentlyPlayedTracks(accessToken);

  // Create a Set of recently played track IDs for faster lookup
  const recentIds = new Set(recentSongs?.map(song => song.id) || []);

  // Filter out recently played songs from liked songs
  const availableSongs = likedSongs?.filter(song => !recentIds.has(song.id)) || [];

  // Shuffle the filtered songs
  const shuffled = availableSongs.sort(() => Math.random() - 0.5);

  // Return 5 random songs that haven't been played recently
  return shuffled.slice(0, size);
};
  