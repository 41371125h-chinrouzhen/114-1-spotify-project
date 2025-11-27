import React, { useEffect, useState } from 'react';

const Phase7_AIResult = ({ resultData, onBack, fileName }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 100);
    }, []);

    if (!resultData) return null;

    const { title, artist, album, lyrics, cover } = resultData;

    const containerStyle = {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out',
        display: 'flex',
        width: '80%',
        height: '70%',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        alignItems: 'center'
    };

    const leftStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const rightStyle = {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '30px',
        marginLeft: '40px',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ddd',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        height: '100%',
        boxSizing: 'border-box'
    };

    return (
        <div className="ui-stage" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: 1, visibility: 'visible', pointerEvents: 'auto'
        }}>

            <div style={containerStyle}>
                <div style={leftStyle}>
                    <div style={{
                        width: '300px', height: '300px',
                        borderRadius: '10px', overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                        marginBottom: '20px',
                        background: '#000'
                    }}>
                        <img
                            src={cover || '/spotify_logo.png'}
                            alt="Album Art"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/spotify_logo.png'; }}
                        />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0', color: '#1ED760', textAlign: 'center' }}>{title || "Unknown Title"}</h2>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '10px 0', color: 'white', opacity: 0.9 }}>{artist || "Unknown Artist"}</h3>
                    <p style={{ color: '#aaa', fontSize: '1rem' }}>{album}</p>
                </div>

                <div style={rightStyle}>
                    <h4 style={{ marginTop: 0, color: '#1ED760', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '1.2rem' }}>LYRICS / INFO</h4>
                    <div style={{ fontSize: '1rem', color: '#eee' }}>
                        {lyrics || "Lyrics not available for this track."}
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '30px',
                background: '#111',
                padding: '10px 30px',
                borderRadius: '50px',
                color: '#888',
                fontSize: '0.9rem',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span>🎵 Source:</span>
                <span style={{ color: '#1ED760' }}>{fileName || "Recorded Audio"}</span>
            </div>

            <button
                onClick={onBack}
                className="back-button"
                style={{ position: 'absolute', top: '40px', right: '5%', transform: 'none' }}
            >
                BACK TO MENU
            </button>

        </div>
    );
};

export default Phase7_AIResult;