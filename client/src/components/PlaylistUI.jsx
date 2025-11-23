import React, { useRef, useState, useEffect, useCallback } from 'react';

// --- 設定 ---
const buildSearchQuery = (payload) => {
    if (!payload) return "Top 50 Global";
    switch (payload.type) {
        case 'Playlist':
            if (payload.region === 'Mandarin') return "Mandarin Hits";
            if (payload.region === 'English') return "Global Top Chart";
            return "Top 50 Global";
        case 'MOOD': // 修正：對應新的 Mood Station
            return `${payload.mood} vibes`;
        case 'Weather':
            return `${payload.weather} chill songs`;
        default: return "Pop";
    }
};

const API_BASE_URL = "https://api.spotify.com/v1";

function PlaylistUI({
    currentStage,
    stage5Payload,
    accessToken,
    onCoverChange,
    onPreviewChange,
    selectedSongIndex,
    onListLoaded,
    onSongClick
}) {
    const containerRef = useRef();
    const listWrapperRef = useRef();
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [searchingAudio, setSearchingAudio] = useState(false);

    const songItemRefs = useRef(new Map());
    const setSongItemRef = useCallback((node, id) => {
        if (node) songItemRefs.current.set(id, node);
        else songItemRefs.current.delete(id);
    }, []);

    // --- 進場動畫 ---
    useEffect(() => {
        if (currentStage === 5) {
            const timer = setTimeout(() => setIsVisible(true), 700);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            setSongs([]);
            setIsLoading(true);
            setSearchingAudio(false);
        }
    }, [currentStage]);

    useEffect(() => {
        if (currentStage === 5 && accessToken) {
            console.log("PlaylistUI: 偵測到 Stage 5...");
            fetchSpotifyData(stage5Payload);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStage, accessToken, stage5Payload]);

    // --- iTunes 救援 ---
    const fetchItunesPreview = async (title, artist) => {
        try {
            const term = encodeURIComponent(`${title} ${artist}`);
            const response = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&limit=1`);
            if (!response.ok) throw new Error("iTunes API Error");
            const data = await response.json();
            return (data.results && data.results.length > 0) ? data.results[0].previewUrl : null;
        } catch (error) {
            return null;
        }
    };

    const fetchSpotifyData = async (payload) => {
        setIsLoading(true);
        const query = buildSearchQuery(payload);
        console.log("[PlaylistUI] 搜尋:", query);

        const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=50`;

        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error(`Spotify API Error`);

            const data = await response.json();
            const rawTracks = data.tracks.items || [];

            const tracks = rawTracks.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artists.map(a => a.name).join(', '),
                coverUrl: (item.album.images && item.album.images[0]?.url) || null,
                preview_url: item.preview_url,
                popularity: item.popularity // 取得熱度數據 (0-100)
            }));

            // 去重
            const uniqueKey = (t) => t.title + '::' + t.artist;
            const uniqueTracks = Array.from(new Map(tracks.map(t => [uniqueKey(t), t])).values());

            setSongs(uniqueTracks);
            onListLoaded(uniqueTracks.length);

            if (uniqueTracks.length > 0) {
                onCoverChange(uniqueTracks[0].coverUrl || null);
            } else {
                onCoverChange(null);
                onPreviewChange(null);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            setSongs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSongClick = async (index) => {
        if (searchingAudio) return;
        if (onSongClick) onSongClick(index);

        const song = songs[index];
        if (!song) return;

        if (onCoverChange) onCoverChange(song.coverUrl || null);

        if (song.preview_url) {
            if (onPreviewChange) onPreviewChange(song.preview_url);
        } else {
            setSearchingAudio(true);
            if (onPreviewChange) onPreviewChange(null);
            const itunesUrl = await fetchItunesPreview(song.title, song.artist);
            setSearchingAudio(false);

            if (itunesUrl) {
                if (onPreviewChange) onPreviewChange(itunesUrl);
            } else {
                alert(`無法取得「${song.title}」的試聽片段。`);
            }
        }
    };

    const containerStyle = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0px, -50%)" : "translate(100px, -50%)",
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 1.0s ease, transform 1.0s ease"
    };

    return (
        <div className="playlist-ui-container" ref={containerRef} style={containerStyle}>
            <div className="song-list-wrapper" ref={listWrapperRef}>
                {isLoading ? (
                    <div className="song-item"><h3>Loading...</h3></div>
                ) : songs.length > 0 ? (
                    songs.map((song, index) => {
                        const isSelected = (index === selectedSongIndex);

                        // 熱度顏色計算 (綠 -> 黃 -> 紅)
                        const heatColor = song.popularity > 80 ? '#ff5555' : song.popularity > 50 ? '#ffbf00' : '#1ED760';
                        const heatWidth = `${song.popularity}%`;

                        const itemStyle = {
                            cursor: 'pointer',
                            opacity: isSelected ? 1.0 : 0.6,
                            transform: isSelected ? "scale(1.02)" : "scale(1.0)",
                            backgroundColor: isSelected ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.02)",
                            transition: "all 0.3s ease",
                            borderLeft: isSelected ? `4px solid ${heatColor}` : '4px solid transparent'
                        };

                        return (
                            <div
                                className="song-item"
                                key={song.id}
                                ref={(el) => setSongItemRef(el, song.id)}
                                onClick={() => handleSongClick(index)}
                                style={itemStyle}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{song.title}</h3>
                                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{song.artist}</p>
                                        </div>
                                        {isSelected && searchingAudio && <span style={{ fontSize: '0.8rem' }}>🔍</span>}
                                    </div>

                                    {/* 數據視覺化：人氣熱度條 */}
                                    <div style={{
                                        marginTop: '8px',
                                        width: '100%',
                                        height: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: heatWidth,
                                            height: '100%',
                                            background: heatColor,
                                            boxShadow: `0 0 10px ${heatColor}`
                                        }}></div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.6rem', marginTop: '2px', opacity: 0.5 }}>
                                        POPULARITY: {song.popularity}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="song-item"><h3>No songs found.</h3></div>
                )}
            </div>
        </div>
    );
}

export default PlaylistUI;