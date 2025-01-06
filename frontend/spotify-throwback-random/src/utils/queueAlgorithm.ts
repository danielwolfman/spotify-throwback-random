export const getSongsToQueue = (
    likedSongs: { id: string; name: string; artists: string; uri: string }[],
    recentlyPlayed: { id: string; playedAt: string }[],
    maxQueueLength: number = 10
  ) => {
    const recentlyPlayedIds = new Set(recentlyPlayed.map((track) => track.id));
  
    // Filter liked songs not recently played
    const filteredSongs = likedSongs.filter((song) => !recentlyPlayedIds.has(song.id));
  
    // Shuffle the filtered songs
    const shuffledSongs = filteredSongs.sort(() => Math.random() - 0.5);
  
    // Limit to `maxQueueLength`
    return shuffledSongs.slice(0, maxQueueLength);
  };
  