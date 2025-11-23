import React, { useRef, useState, useEffect } from 'react';

const LABELS = [
    "PLAYLIST",       // Index 0
    "MOOD STATION",   // Index 1 (原本是 AI RECOMMEND)
    "WEATHER VIBE"    // Index 2
];

function Phase3_UI({ currentStage, selectedSphereIndex }) {
    const [visible, setVisible] = useState(false);

    // --- 進場動畫邏輯 (改用 CSS Transition) ---
    useEffect(() => {
        if (currentStage === 3) {
            // 進入 Stage 3: 延遲一點點讓動畫生效
            requestAnimationFrame(() => setVisible(true));
        } else {
            // 離開 Stage 3: 隱藏
            setVisible(false);
        }
    }, [currentStage]);

    // --- 容器樣式 ---
    const containerStyle = {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(-20px)",
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 1.0s ease, transform 1.0s ease",
        width: '100%',
        height: '100%',
        zIndex: 12,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none'
    };

    return (
        <div id="stage-3-ui" className="ui-stage phase-3-ui" style={containerStyle}>
            <h2 id="spotify-title-stage3" style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "var(--main-text-color)",
                marginTop: "30px",
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
            }}>
                SPOTIFY
            </h2>

            <div className="phase-3-label-container" style={{
                position: 'absolute',
                bottom: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '50px',
                width: '100%'
            }}>
                {LABELS.map((text, index) => {
                    const isSelected = (index === selectedSphereIndex);

                    // 標籤樣式：根據是否選中來決定透明度與位置
                    const labelStyle = {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        textAlign: 'center',
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        color: "var(--main-text-color)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",

                        // 動畫屬性
                        opacity: isSelected ? 1 : 0,
                        transform: isSelected ? "translateY(0px)" : "translateY(10px)",
                        transition: "opacity 0.5s ease, transform 0.5s ease"
                    };

                    return (
                        <div
                            key={index}
                            className="phase-3-label"
                            style={labelStyle}
                        >
                            {text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Phase3_UI;