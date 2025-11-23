// --- /client/src/Phase2_UI.jsx (修正版) ---

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
// (ScrollTrigger 已移除)

function Phase2_UI({ currentStage }) { 
  const containerRef = useRef();

  useLayoutEffect(() => {
    
    if (currentStage === 2) {
      // 狀態 2：淡入
      console.log("GSAP (Phase 2): 正在淡入 'SPOTIFY'...");
      gsap.set(containerRef.current, { 
        display: 'flex', 
        visibility: 'visible',
        opacity: 0,   // <-- 從 0 開始
        scale: 0.2,   // <-- 從 0.2 開始
	duration: 2.0,
      });

      // 2. 播放動畫 (To)：
      // 動畫到「結束」狀態
      gsap.to(containerRef.current, { 
        opacity: 1, 
        scale: 1.0,
        duration: 1.5,
        ease: "power3.out"
      });

    } else if (currentStage === 3) {
      // 狀態 3：淡出 (邏輯不變)
      console.log("GSAP (Phase 2): 正在淡出 'SPOTIFY'...");
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.8, // (淡出時順便縮小一點)
        duration: 0.5, 
        ease: 'power2.in'
      });

    } else {
      // 狀態 1 (或非 2/3 的情況)：(邏輯不變)
      // 確保它被 GSAP 設置為隱藏
      gsap.set(containerRef.current, {
        opacity: 0,
        visibility: 'hidden'
      });
    }
    
  }, [currentStage]); // (只監聽 currentStage)

  return (
    <div id="stage-2-ui" className="ui-stage phase-2-ui" ref={containerRef}>
      <h1 id="spotify-title-stage2">SPOTIFY</h1>
    </div>
  );
}

export default Phase2_UI;