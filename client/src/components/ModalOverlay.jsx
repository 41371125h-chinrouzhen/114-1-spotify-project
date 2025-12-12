import React, { useState, useEffect, useRef } from 'react';

const ModalMood = ({ onSubmit, onClose }) => (
    <div className="modal-ai-buttons">
        <h3>SELECT MOOD</h3>
        <button onClick={() => onSubmit({ type: 'MOOD', mood: 'COOL' })}>COOL</button>
        <button onClick={() => onSubmit({ type: 'MOOD', mood: 'HAPPY' })}>HAPPY</button>
        <button onClick={() => onSubmit({ type: 'MOOD', mood: 'RELAX' })}>RELAX</button>
        <button onClick={() => onSubmit({ type: 'MOOD', mood: 'SAD' })}>SAD</button>
        <button onClick={onClose} style={{ marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#aaa' }}>CANCEL</button>
    </div>
);

const ModalWeather = ({ onSubmit, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [cityInput, setCityInput] = useState("");
    const API_KEY = "654f37c554d92d4bb382bcd69f7fe289";

    const handleDetectClick = () => {
        setIsLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Browser not supported.");
            setIsLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // 1. 獲取天氣資訊 (包含溫度)
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const weatherRes = await fetch(weatherUrl);
                if (!weatherRes.ok) throw new Error("Weather API Error");
                const weatherData = await weatherRes.json();

                // 2. 獲取 IP 資訊
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();

                setResult({
                    city: weatherData.name,
                    weather: weatherData.weather[0].main,
                    temp: Math.round(weatherData.main.temp), // 溫度
                    ip: ipData.ip // IP
                });
                setCityInput(weatherData.name);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch data.");
            } finally {
                setIsLoading(false);
            }
        }, () => { setError("Access denied."); setIsLoading(false); });
    };

    const handleConfirm = () => {
        onSubmit({ type: 'Weather', weather: result.weather, city: cityInput });
    };

    return (
        <div className="modal-weather-detect">
            <h3>DETECT LOCATION</h3>
            {isLoading && <div className="modal-weather-loading">Detecting...</div>}
            {error && <div className="modal-error">{error}</div>}

            {result ? (
                <div className="modal-weather-result" style={{ width: '100%' }}>
                    <div style={{ marginBottom: '15px', width: '100%' }}>
                        <label style={{ color: '#888', fontSize: '0.8rem' }}>CITY</label>
                        <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            style={{
                                borderBottom: '1px solid #1ED760',
                                textAlign: 'center',
                                fontSize: '1.2rem',
                                width: '100%',
                                marginTop: '5px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>TEMP</div>
                            <div style={{ fontSize: '1.5rem', color: 'white' }}>{result.temp}°C</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>WEATHER</div>
                            <div style={{ fontSize: '1.5rem', color: 'white' }}>{result.weather}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', width: '100%', textAlign: 'center' }}>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>IP ADDRESS</div>
                        <div style={{ fontSize: '1rem', color: '#aaa', fontFamily: 'monospace' }}>{result.ip}</div>
                    </div>

                    <button className="confirm-button" onClick={handleConfirm}>CONFIRM</button>
                </div>
            ) : (
                !isLoading && <button onClick={handleDetectClick}>DETECT</button>
            )}

            <button onClick={onClose} style={{ marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#aaa', width: '100%' }}>CANCEL</button>
        </div>
    );
};

const ModalPlaylist = ({ onSubmit, onClose }) => (
    <div className="modal-playlist-buttons">
        <h3>SELECT CHART</h3>
        <button onClick={() => onSubmit({ type: 'Playlist', region: 'Global' })}>GLOBAL TOP 50</button>
        <button onClick={() => onSubmit({ type: 'Playlist', region: 'Mandarin' })}>MANDARIN</button>
        <button onClick={() => onSubmit({ type: 'Playlist', region: 'English' })}>ENGLISH</button>
        <button onClick={onClose} style={{ marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#aaa' }}>CANCEL</button>
    </div>
);

const ModalAI = ({ onSubmit, onClose }) => {
    const [status, setStatus] = useState("idle");
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const chunks = useRef([]);
    const fileInputRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunks.current = [];

            recorder.ondataavailable = (e) => chunks.current.push(e.data);
            recorder.onstop = async () => {
                setStatus("processing");
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                await sendToBackend(blob, 'recording.webm');
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setStatus("recording");
        } catch (err) {
            console.error(err);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus("processing");
        await sendToBackend(file, file.name);
    };

    const sendToBackend = async (fileBlob, fileName) => {
        const formData = new FormData();
        formData.append('audio', fileBlob, fileName);

        try {
            const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3001'
                : 'https://one14-1-spotify-project.onrender.com';
            const response = await fetch(`${API_URL}/api/identify-music`, { method: 'POST', body: formData });
            const data = await response.json();

            if (response.ok && data.success) {
                onSubmit({ type: 'AI_RESULT', data: data.data, fileName: fileName });
            } else {
                alert(`Could not identify song.\nReason: ${data.error || "Unknown"}`);
                setStatus("idle");
            }
        } catch (e) {
            console.error(e);
            alert("Server Error.");
            setStatus("idle");
        }
    };

    return (
        <div className="modal-ai-buttons">
            <h3>MUSIC RECOGNITION</h3>
            {status === "idle" && (
                <>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                        Identify song by Humming or Uploading
                    </p>
                    <button onClick={startRecording} style={{ background: '#ff5555', border: 'none' }}>🔴 RECORD AUDIO</button>
                    <button onClick={() => fileInputRef.current.click()} style={{ background: '#444', border: '1px solid #666' }}>📁 UPLOAD FILE</button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="audio/*" onChange={handleFileSelect} />

                    <button
                        onClick={onClose}
                        className="back-button"
                        style={{
                            position: 'static',
                            marginTop: '20px',
                            transform: 'none',
                            width: 'auto',
                            padding: '10px 30px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white'
                        }}
                    >
                        BACK TO MENU
                    </button>
                </>
            )}
            {status === "recording" && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#ff5555', marginBottom: '15px', fontSize: '1.2rem' }}>● Listening...</div>
                    <button onClick={stopRecording} style={{ background: 'white', color: 'black', fontWeight: 'bold' }}>⬛ STOP</button>
                </div>
            )}
            {status === "processing" && <div style={{ textAlign: 'center', padding: '20px', color: '#1ED760', fontSize: '1.2rem' }}>🧠 Analyzing...</div>}
        </div>
    );
};

function ModalOverlay({ isVisible, type, onSubmit, onClose }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (isVisible) setActive(true);
        else setTimeout(() => setActive(false), 500);
    }, [isVisible]);

    const renderContent = () => {
        const commonProps = { onSubmit, onClose };
        switch (type) {
            case 0: return <ModalPlaylist {...commonProps} />;
            case 1: return <ModalMood {...commonProps} />;
            case 2: return <ModalWeather {...commonProps} />;
            case 4: return <ModalAI {...commonProps} />;
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