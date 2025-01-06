import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Callback from './components/Callback';
import Home from './components/Home';

function App() {
  // Check if we're on the callback URL with an access token
  const isCallback = window.location.href.includes('access_token=');
  if (isCallback) {
    const token = window.location.href.split('access_token=')[1].split('&')[0];
    sessionStorage.setItem('spotify_access_token', token);
    window.location.href = window.location.origin + window.location.pathname + '#/';
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App; 