require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Buffer } = require('buffer');
const multer = require('multer');
const FormData = require('form-data'); 

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- Spotify Config ---
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
let spotifyToken = { value: null, expiresAt: null };
const getSpotifyToken = async () => {
    if (spotifyToken.value && spotifyToken.expiresAt > Date.now()) return spotifyToken.value;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    try {
        const response = await axios.post(TOKEN_URL, new URLSearchParams({grant_type: 'client_credentials'}), {
            headers: { 'Authorization': `Basic ${authString}`, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        spotifyToken.value = response.data.access_token;
        spotifyToken.expiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
        return spotifyToken.value;
    } catch (error) { return null; }
};

app.get('/api/get-token', async (req, res) => {
    const token = await getSpotifyToken();
    if (token) res.status(200).json({ access_token: token });
    else res.status(500).json({ error: 'Failed to get token' });
});

// --- Audd.io Music Recognition ---
app.post('/api/identify-music', upload.single('audio'), async (req, res) => {
    console.log("Server: 收到 Audd.io 辨識請求...");

    if (!req.file) return res.status(400).json({ error: "未收到音訊檔案" });

    const apiToken = process.env.AUDDIO_API_TOKEN;
    if (!apiToken) {
        console.error("Server Error: .env 缺少 AUDDIO_API_TOKEN");
        return res.status(500).json({ error: "Server API Key missing" });
    }

    try {
        const form = new FormData();
        form.append('file', req.file.buffer, 'audio.mp3'); 
        form.append('api_token', apiToken);
        form.append('return', 'apple_music,spotify,lyrics'); 

        console.log(`Server: 正在傳送 ${req.file.size} bytes 到 Audd.io...`);

        const response = await axios.post('https://api.audd.io/', form, {
            headers: { ...form.getHeaders() }
        });

        const data = response.data;

        if (data.status === 'success' && data.result) {
            console.log("Audd.io 辨識成功:", data.result.title);
            res.status(200).json({ 
                success: true,
                data: {
                    title: data.result.title,
                    artist: data.result.artist,
                    album: data.result.album,
                    release_date: data.result.release_date,
                    lyrics: data.result.lyrics ? data.result.lyrics.lyrics : "No lyrics found.",
                    cover: data.result.spotify?.album?.images[0]?.url || data.result.apple_music?.artwork?.url?.replace('{w}','500').replace('{h}','500') || null,
                    song_link: data.result.song_link
                }
            });
        } else {
            console.warn("Audd.io 無法辨識:", data);
            res.status(200).json({ success: false, error: "No match found" });
        }

    } catch (error) {
        console.error("Audd.io API 錯誤:", error.message);
        res.status(500).json({ error: "Identification failed", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});