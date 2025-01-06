import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Full URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Hash:', window.location.hash);
    console.log('Search:', window.location.search);

    const hash = window.location.hash;
    console.log('Hash content:', hash);

    // Try to parse the hash directly if it starts with 'access_token='
    if (hash.includes('access_token=')) {
      const accessToken = hash.split('access_token=')[1].split('&')[0];
      console.log('Found token:', accessToken);
      sessionStorage.setItem('spotify_access_token', accessToken);
      navigate('/');
    } else {
      console.error('No access token found in URL');
      navigate('/');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback; 