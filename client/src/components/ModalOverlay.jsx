import React, { useState, useEffect } from 'react';

const ModalMood = ({ onSubmit }) => {
  return (
    <div className="modal-ai-buttons">
      <h3>SELECT MOOD</h3>
      <button onClick={() => onSubmit({ type: 'MOOD', mood: 'COOL' })}>COOL</button>
      <button onClick={() => onSubmit({ type: 'MOOD', mood: 'HAPPY' })}>HAPPY</button>
      <button onClick={() => onSubmit({ type: 'MOOD', mood: 'RELAX' })}>RELAX</button>
      <button onClick={() => onSubmit({ type: 'MOOD', mood: 'SAD' })}>SAD</button>
    </div>
  );
};

const ModalWeather = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const API_KEY = "654f37c554d92d4bb382bcd69f7fe289";

  const handleDetectClick = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const geoResponse = await fetch('https://ipapi.co/json/');
      if (!geoResponse.ok) throw new Error("Geolocation API Failed");
      const geoData = await geoResponse.json();
      const { latitude, longitude, city } = geoData;
      
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await fetch(url);
      if (!weatherResponse.ok) throw new Error("OpenWeatherMap API Failed");
      
      const weatherData = await weatherResponse.json();
      setIsLoading(false);
      setResult({
        city: city,
        lat: latitude.toFixed(2),
        lon: longitude.toFixed(2),
        weather: weatherData.weather[0].main
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setError("Location detection failed.");
    }
  };

  const handleConfirmClick = () => {
    if (!result) return;
    onSubmit({ type: 'Weather', weather: result.weather });
  };

  return (
    <div className="modal-weather-detect">
      <h3>DETECT YOUR LOCATION</h3>
      {isLoading && (<div className="modal-weather-loading">Detecting...</div>)}
      {error && (<div className="modal-error">{error}</div>)}
      {result && (
        <div className="modal-weather-result">
          <p><strong>Location:</strong> {result.city}</p>
          <p><strong>Weather:</strong> {result.weather}</p>
          <button className="confirm-button" onClick={handleConfirmClick}>CONFIRM</button>
        </div>
      )}
      {!isLoading && !result && (<button onClick={handleDetectClick}>DETECT</button>)}
    </div>
  );
};

const ModalPlaylist = ({ onSubmit }) => {
  return (
    <div className="modal-playlist-buttons">
      <h3>SELECT CHART</h3>
      <button onClick={() => onSubmit({ type: 'Playlist', region: 'Global' })}>GLOBAL TOP 50</button>
      <button onClick={() => onSubmit({ type: 'Playlist', region: 'Mandarin' })}>MANDARIN</button>
      <button onClick={() => onSubmit({ type: 'Playlist', region: 'English' })}>ENGLISH</button>
    </div>
  );
};

function ModalOverlay({ isVisible, type, onSubmit }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isVisible) setActive(true);
    else setTimeout(() => setActive(false), 500);
  }, [isVisible]);

  const renderContent = () => {
    switch (type) {
      case 0: return <ModalPlaylist onSubmit={onSubmit} />;
      case 1: return <ModalMood onSubmit={onSubmit} />;
      case 2: return <ModalWeather onSubmit={onSubmit} />;
      default: return null;
    }
  };
  
  const style = {
    opacity: isVisible ? 1 : 0,
    visibility: active ? 'visible' : 'hidden',
    transition: 'opacity 0.5s ease, visibility 0.5s ease'
  };

  return (
    <div className="modal-overlay" style={style}>
      <div className="modal-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default ModalOverlay;