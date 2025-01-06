import React from "react";
import { getAuthUrl } from "../services/auth";

const LoginButton = () => {
  const handleLogin = () => {
    const authUrl = getAuthUrl();
    window.location.href = authUrl; // Redirect to Spotify's login page
  };

  return <button onClick={handleLogin}>Log in to Spotify</button>;
};

export default LoginButton;
