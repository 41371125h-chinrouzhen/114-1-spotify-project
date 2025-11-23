import React, { useState, useEffect } from 'react';

function Phase2_UI({ currentStage }) { 
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (currentStage === 2) {
      setActive(true);
    } else {
      const timer = setTimeout(() => setActive(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  const style = {
    opacity: currentStage === 2 ? 1 : 0,
    visibility: active ? 'visible' : 'hidden',
    transform: currentStage === 2 ? 'scale(1)' : 'scale(0.5)',
    transition: 'opacity 1s ease, transform 1.5s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: '100%', position: 'absolute', zIndex: 12, pointerEvents: 'none'
  };

  return (
    <div className="phase-2-ui" style={style}>
      <h1 id="spotify-title-stage2" style={{
        fontFamily: "var(--font-display)", fontSize: "10rem", fontWeight: 700, color: "var(--main-text-color)"
      }}>
        SPOTIFY
      </h1>
    </div>
  );
}

export default Phase2_UI;