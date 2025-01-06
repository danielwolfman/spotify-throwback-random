import axios, { AxiosError } from "axios";
import { NavigateFunction } from "react-router-dom";

const api = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 10000,
});

const handleApiError = (error: AxiosError, navigate?: NavigateFunction) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.removeItem('spotify_access_token');
      if (navigate) {
        navigate('/login');
        return null; // Return null instead of throwing
      }
    }
  }
  throw error;
};

export const fetchUserProfile = async (accessToken: string, navigate?: NavigateFunction) => {
  try {
    const response = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    handleApiError(error as AxiosError, navigate);
  }
};

export const fetchLikedSongs = async (accessToken: string, navigate?: NavigateFunction) => {
  try {
    const response = await api.get("/me/tracks?limit=50", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name).join(", "),
      uri: item.track.uri,
    }));
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    handleApiError(error as AxiosError, navigate);
  }
};

export const fetchRecentlyPlayedTracks = async (accessToken: string, navigate?: NavigateFunction) => {
  try {
    const response = await api.get("/me/player/recently-played?limit=50", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name).join(", "),
      uri: item.track.uri,
      playedAt: item.played_at,
    }));
  } catch (error) {
    console.error("Error fetching recently played tracks:", error);
    handleApiError(error as AxiosError, navigate);
  }
};

export const getCurrentPlayback = async (accessToken: string, navigate?: NavigateFunction) => {
  try {
    const response = await api.get("/me/player", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting playback state:", error);
    handleApiError(error as AxiosError, navigate);
    return null;
  }
};

export const getDevices = async (accessToken: string, navigate?: NavigateFunction) => {
  try {
    if (!accessToken) {
      navigate?.('/login');
      return [];
    }
    const response = await api.get("/me/player/devices", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.devices || [];
  } catch (error) {
    console.error("Error getting devices:", error);
    return handleApiError(error as AxiosError, navigate) || [];
  }
};

export const startPlayback = async (accessToken: string, deviceId: string, navigate?: NavigateFunction) => {
  try {
    await api.put(`/me/player/play?device_id=${deviceId}`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error starting playback:", error);
    handleApiError(error as AxiosError, navigate);
    return false;
  }
};

interface SpotifyDevice {
  id: string;
  is_active: boolean;
}

export const addToQueue = async (accessToken: string, uri: string, navigate?: NavigateFunction) => {
  try {
    const devices = await getDevices(accessToken, navigate);
    const activeDevice = devices.find((device: SpotifyDevice) => device.is_active);
    
    if (!activeDevice) {
      // If no active device, try to start playback on first available device
      if (devices.length > 0) {
        await startPlayback(accessToken, devices[0].id, navigate);
      } else {
        throw new Error("No Spotify devices found. Please open Spotify on any device.");
      }
    }

    const response = await api.post(
      `/me/player/queue?uri=${encodeURIComponent(uri)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (response.status === 204) {
      console.log(`Song added to queue: ${uri}`);
      return true;
    }
    return false;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      sessionStorage.removeItem('spotify_access_token');
      if (navigate) {
        navigate('/login');
        return false;
      }
    }
    console.error("Error adding song to queue:", error);
    throw error;
  }
};
