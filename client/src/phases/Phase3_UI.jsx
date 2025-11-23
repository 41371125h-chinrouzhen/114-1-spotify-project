import React, { useState, useEffect } from 'react';

const LABELS = [
    "PLAYLIST",
    "MOOD STATION",
    "WEATHER VIBE",
    "MESSAGE WALL",
    "AI RECOMMEND"
];

function Phase3_UI({ currentStage, selectedSphereIndex }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (currentStage === 3) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [currentStage]);

    const containerStyle = {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(-20px)",
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 1.0s ease, transform 1.0s ease",
        width: '100%', height: '100%', zIndex: 12,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pointerEvents: 'none'
    };

    return (
        <div id="stage-3-ui" className="ui-stage phase-3-ui" style={containerStyle}>
            <h2 id="spotify-title-stage3" style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem",
                color: "var(--main-text-color)", marginTop: "30px", opacity: 0.7,
                textTransform: "uppercase", letterSpacing: "0.1em"
            }}>
                SPOTIFY
            </h2>

            <div className="phase-3-label-container" style={{
                position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
                height: '50px', width: '100%'
            }}>
                {LABELS.map((text, index) => {
                    const isSelected = (index === selectedSphereIndex);
                    const labelStyle = {
                        position: 'absolute', top: 0, left: 0, width: '100%', textAlign: 'center',
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem",
                        color: "var(--main-text-color)", textTransform: "uppercase", letterSpacing: "0.1em",
                        opacity: isSelected ? 1 : 0,
                        transform: isSelected ? "translateY(0px)" : "translateY(10px)",
                        transition: "opacity 0.5s ease, transform 0.5s ease"
                    };

                    return <div key={index} className="phase-3-label" style={labelStyle}>{text}</div>;
                })}
            </div>
        </div>
    );
}

export default Phase3_UI;