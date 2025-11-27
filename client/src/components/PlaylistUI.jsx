import React, { useRef, useState, useEffect, useCallback } from 'react';

const buildSearchQuery = (payload) => {
    if (!payload) return "Top 50 Global";
    switch (payload.type) {
        case 'Playlist':
            if (payload.region === 'Mandarin') return "Mandarin Hits";
            if (payload.region === 'English') return "Global Top Chart";
            return "Top 50 Global";
        case 'MOOD':
            return `${payload.mood} vibes`;
        case 'Weather':
            return `${payload.weather} chill songs`;
        case 'AI_SEARCH': return payload.query;
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
    onSongClick,
    onLike,
    isGuest
}) {
    const containerRef = useRef();
    const listWrapperRef = useRef();
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [searchingAudio, setSearchingAudio] = useState(false);
    const [likedSongs, setLikedSongs] = useState(new Set());

    const songItemRefs = useRef(new Map());
    const setSongItemRef = useCallback((node, id) => {
        if (node) songItemRefs.current.set(id, node);
        else songItemRefs.current.delete(id);
    }, []);

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
            fetchSpotifyData(stage5Payload);
        }
    }, [currentStage, accessToken, stage5Payload]);

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
                popularity: item.popularity
            }));

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

    const handleHeartClick = (e, song) => {
        e.stopPropagation();
        if (isGuest) {
            alert("Guest mode cannot save likes. Please login.");
            return;
        }

        const newLiked = new Set(likedSongs);
        if (!newLiked.has(song.id)) {
            newLiked.add(song.id);
            setLikedSongs(newLiked);
            if (onLike) onLike(song);
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
                        const heatColor = song.popularity > 60 ? '#ff5555' : song.popularity > 40 ? '#ffbf00' : '#1ED760';
                        const heatWidth = `${song.popularity}%`;
                        const isLiked = likedSongs.has(song.id);

                        const itemStyle = {
                            cursor: 'pointer',
                            opacity: isSelected ? 1.0 : 0.6,
                            transform: isSelected ? "scale(1.02)" : "scale(1.0)",
                            backgroundColor: isSelected ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.02)",
                            transition: "all 0.3s ease",
                            borderLeft: isSelected ? `4px solid ${heatColor}` : '4px solid transparent',
                            position: 'relative'
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button
                                                onClick={(e) => handleHeartClick(e, song)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                                                    color: isLiked ? '#ff5555' : '#888', transition: 'color 0.2s'
                                                }}
                                            >
                                                {isLiked ? '❤️' : '🤍'}
                                            </button>
                                            {isSelected && searchingAudio && <span style={{ fontSize: '0.8rem' }}>🔍</span>}
                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: '8px', width: '100%', height: '4px',
                                        background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: heatWidth, height: '100%', background: heatColor,
                                            boxShadow: `0 0 8px ${heatColor}`
                                        }}></div>
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