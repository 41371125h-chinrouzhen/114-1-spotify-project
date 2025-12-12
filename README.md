# 🎵 Spotify 3D 沉浸式音樂探索平台
陳柔蓁 41371125H
## Live Demo
[點擊這裡體驗網站](https://one14-1-spotify-project-frontend.onrender.com)

## YouTube影片鏈接
[影片鏈接](https://youtu.be/NxBKJbQg1ok)

這是一個結合 **Web 3D 互動** 與 **AI 技術** 的音樂探索網站，旨在解決「不知道聽什麼」的痛點，將平面的串流體驗轉化為沉浸式的視覺享受。

## 核心功能 (Key Features)
* **3D 沉浸式場景**：使用 `react-three/fiber` 建構互動式球體選單與粒子特效。
* **AI 哼歌辨識**：串接 **Audd.io API**，支援錄音/上傳檔案辨識歌曲。
* **情境推薦 (Weather Vibe)**：結合 **OpenWeatherMap**，根據當地天氣推薦適合的音樂氛圍。
* **即時留言牆**：透過 **Firebase Firestore** 實作 3D 彈幕互動。
* **智慧備援播放**：整合 **Spotify API** 與 **iTunes API**，確保試聽功能不中斷。

## 技術架構 (Tech Stack)
* **Frontend:** React, Vite, Three.js (@react-three/fiber, @react-three/drei)
* **Backend:** Node.js, Express (API Proxy & Security)
* **Database:** Firebase Firestore
* **APIs:** Spotify Web API, Audd.io, OpenWeatherMap, iTunes Search API
* **Deployment:** Render
