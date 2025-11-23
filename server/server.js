// --- server.js (最終完整版 - Week 2 結束) ---

// --- 1. 載入 .env 金鑰 (必須在最頂端) ---
require('dotenv').config();

// --- 2. 載入工具 ---
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Buffer } = require('buffer'); // 需要 Buffer 來做 Base64 編碼

// --- 3. 建立伺服器 ---
const app = express();

// --- 4. 設定中間件 (Middleware) ---
app.use(cors()); // 允許所有跨域請求
app.use(express.json()); // 讓伺服器能讀懂 JSON

// --- 5. 【定義「真正」的 Spotify API 網址】 ---
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

const API_BASE_URL = 'https://api.spotify.com';

// --- 6. Spotify 認證函數 (內部使用，含緩存 + Debug) ---
let spotifyToken = {
    value: null,
    expiresAt: null, // Token 過期的時間 (毫秒)
};

const getSpotifyToken = async () => {
    // 檢查 Token 是否還有效
    if (spotifyToken.value && spotifyToken.expiresAt > Date.now()) {
        console.log("CACHE: 使用緩存的 Spotify Token");
        return spotifyToken.value;
    }

    // 如果 Token 過期或不存在，就去要一個新的
    console.log("CACHE: 正在請求新的 Spotify Token...");

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // 檢查金鑰是否存在
    if (!clientId || !clientSecret) {
        console.error("❌ 錯誤：Spotify Client ID 或 Secret 未在 .env 中設定！");
        return null;
    }

    // 將金鑰轉為 Base64 格式
    const authString = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString('base64');
    console.log(`DEBUG: Base64 Auth String: ${authString.substring(0, 10)}...`); // (Debug)

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    try {
        console.log(`DEBUG: 正在向此 URL 發送 POST 請求: ${TOKEN_URL}`); // (Debug)
        const response = await axios.post(TOKEN_URL, data, {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // 儲存新的 Token 和「過期時間」
        const expiresInMs = response.data.expires_in * 1000;
        spotifyToken.value = response.data.access_token;
        spotifyToken.expiresAt = Date.now() + expiresInMs - 60000; // 提早 1 分鐘過期

        console.log("CACHE: 成功獲取並儲存新 Token！");
        return spotifyToken.value;

    } catch (error) {
        console.error("❌ 獲取 Spotify Token 失敗:", error.response ? error.response.data : error.message);
        return null;
    }
};

// --- 7. 讀取埠號 ---
const PORT = process.env.PORT || 3001;

// --- 8. 建立「根目錄」測試路由 (Route) ---
app.get('/', (req, res) => {
    res.status(200).send('Spotify AI 星球的「後端伺服器」已經成功啟動！');
});

// --- 9. 建立「獲取播放清單」路由 ---
// 【在這裡定義 PLAYLIST_ID】
const PLAYLIST_ID = '34NbomaTu7YuOYnky8nLXL'; // 你的 Pop Hits 2025 (Top 50) ID

app.get('/api/get-playlist', async (req, res) => {
    console.log("API: 收到 /api/get-playlist 請求...");

    // 1. 獲取 Token
    const token = await getSpotifyToken();
    if (!token) {
        return res.status(500).json({ error: '無法獲取 Spotify 認證' });
    }

    // 2. 【使用反引號 `` ` `` 和 /v1/ 定義播放清單 URL】
    const playlistUrl = `${API_BASE_URL}/v1/playlists/${PLAYLIST_ID}`;

    // 3. 開始 try...catch
    try {
        // 4. 印出 Debug 訊息
        console.log(`DEBUG: 正在請求「完整」播放清單 URL: ${playlistUrl}`); // (Debug)

        // 5. 使用 playlistUrl 發出請求
        const response = await axios.get(playlistUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // 6. 清理並簡化資料
        const tracks = response.data.tracks.items
            .map(item => {
                if (!item || !item.track) return null;

                return {
                    id: item.track.id,
                    name: item.track.name,
                    artist: item.track.artists[0] ? item.track.artists[0].name : "Unknown Artist",
                    popularity: item.track.popularity,
                    preview_url: item.track.preview_url,
                    album_art_url: item.track.album.images[0] ? item.track.album.images[0].url : null,
                };
            })

        // 7. 成功回傳
        res.status(200).json(tracks);

    } catch (error) {
        // 8. 處理錯誤
        if (error.message.includes('Invalid URL')) {
             console.error("❌ 抓取播放清單失敗: URL 無效！請檢查 API_BASE_URL 是否正確:", API_BASE_URL);
             res.status(500).json({ error: '伺服器內部錯誤：播放清單 URL 無效' });
        } else {
            console.error("❌ 抓取播放清單失敗:", error.response ? error.response.data.error : error.message);
            res.status(500).json({ error: '無法抓取 Spotify 播放清單' });
        }
    }
});

app.get('/api/get-token', async (req, res) => {
    console.log("API: 前端正在請求 Spotify Token (/api/get-token)...");

    // 呼叫我們上面寫好的函數去拿 Token
    const token = await getSpotifyToken();

    if (token) {
        // 成功！回傳 JSON 給前端
        res.status(200).json({ access_token: token });
    } else {
        // 失敗
        res.status(500).json({ error: '無法獲取 Spotify 認證 Token' });
    }
});

// --- 11. 啟動伺服器 (原本的程式碼) ---
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 上運行...`);

    // --- 啟動時的「自我檢查」 ---
    console.log("\n--- 正在檢查 .env 金鑰是否讀取成功 ---");

    let allKeysLoaded = true;

    // 檢查 Spotify 金鑰
    if (process.env.SPOTIFY_CLIENT_ID) console.log("✅ Spotify Client ID: 讀取成功");
    else { console.error("❌ Spotify Client ID: 失敗！"); allKeysLoaded = false; }

    if (process.env.SPOTIFY_CLIENT_SECRET) console.log("✅ Spotify Client Secret: 讀取成功");
    else { console.error("❌ Spotify Client Secret: 失敗！"); allKeysLoaded = false; }

    // 檢查 OpenWeatherMap 金鑰
    if (process.env.OPENWEATHER_API_KEY) console.log("✅ OpenWeather API Key: 讀取成功");
    else { console.error("❌ OpenWeather API Key: 失敗！"); allKeysLoaded = false; }

    // 檢查 Last.fm 金鑰
    if (process.env.LASTFM_API_KEY) console.log("✅ Last.fm API Key: 讀取成功");
    else { console.error("❌ Last.fm API Key: 失敗！"); allKeysLoaded = false; }

    // 檢查 Last.fm Secret
    if (process.env.LASTFM_SHARED_SECRET) console.log("✅ Last.fm Shared Secret: 讀取成功");
    else { console.error("❌ Last.fm Shared Secret: 失敗！"); allKeysLoaded = false; }

    if (allKeysLoaded) {
        console.log("\n🎉 恭喜！所有 API 金鑰都已成功載入！");
    } else {
        console.error("\n🔥 警告：有 API 金鑰載入失敗！請檢查你的 .env 檔案是否正確放置在 /server 資料夾中，並且名稱是「.env」，且金鑰名稱拼寫正確。");
    }
});