import React, { useState, useRef, useEffect } from 'react';
import './styles/App.css';

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

import Scene from './models/Scene.jsx';
import Phase1_UI from './phases/Phase1_UI.jsx';
import Phase2_UI from './phases/Phase2_UI.jsx';
import Phase3_UI from './phases/Phase3_UI.jsx';
import Phase6_Wall, { Phase6_UI } from './phases/Phase6_Wall.jsx';
import Phase7_AIResult from './phases/Phase7_AIResult.jsx'; // [新增]
import ModalOverlay from './components/ModalOverlay.jsx';
import PlaylistUI from './components/PlaylistUI.jsx';
import BackButton from './components/BackButton.jsx';

// [自動判斷後端網址]
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://spotify-3d-project.onrender.com';

// [Firebase 設定]
const firebaseConfig = {
    apiKey: "AIzaSyBZmXt6xfFFZ29eDGG-7tHzT7MtJsc7eQE",
    authDomain: "spoti-24a7e.firebaseapp.com",
    projectId: "spoti-24a7e",
    storageBucket: "spoti-24a7e.firebasestorage.app",
    messagingSenderId: "21554059222",
    appId: "1:21554059222:web:f5a6c2b1561e7c6456b677"
};

function App() {
    const [user, setUser] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // --- 1. Firebase Initialization ---
    useEffect(() => {
        let config = null;
        if (typeof __firebase_config !== 'undefined') {
            try { config = JSON.parse(__firebase_config); } catch (e) { console.error(e); }
        } else if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
            config = firebaseConfig;
        }

        if (config) {
            try {
                const app = initializeApp(config);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);
                setAuth(authInstance);
                setDb(dbInstance);
                signInAnonymously(authInstance).catch((e) => console.error("Auth Error:", e));
                onAuthStateChanged(authInstance, (u) => setUser(u));
                console.log("✅ Firebase Connected!");
            } catch (e) { console.error("🔥 Firebase Init Failed:", e); }
        } else {
            console.warn("⚠️ 未偵測到有效的 Firebase 設定。");
        }
    }, []);

    const [currentStage, setCurrentStage] = useState(1);
    const [isGuest, setIsGuest] = useState(true);
    const [userName, setUserName] = useState("Guest");
    const scrollContainerRef = useRef();
    const [selectedSphereIndex, setSelectedSphereIndex] = useState(0);
    const [isWheeling, setIsWheeling] = useState(false);
    const [modal, setModal] = useState({ isVisible: false, type: null });
    const [stage5Payload, setStage5Payload] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentCoverUrl, setCurrentCoverUrl] = useState(null);
    const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
    const [selectedSongIndex, setSelectedSongIndex] = useState(0);
    const [totalSongs, setTotalSongs] = useState(0);
    const [msgInput, setMsgInput] = useState("");
    const [aiResultData, setAiResultData] = useState(null);
    const [uploadFileName, setUploadFileName] = useState("");

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/get-token`);
                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                if (data.access_token) setAccessToken(data.access_token);
            } catch (error) { console.error(error); }
            finally { setIsLoading(false); }
        };
        fetchToken();
    }, []);

    const handleLogin = async (name) => {
        if (name) {
            setIsGuest(false);
            setUserName(name);
            if (auth && auth.currentUser) await updateProfile(auth.currentUser, { displayName: name });
        } else {
            setIsGuest(true);
            setUserName("Guest");
        }
    };

    const handleNextStage = () => {
        if (currentStage === 1 && !isLoading) setCurrentStage(2);
    };

    useEffect(() => {
        if (currentStage === 2) setTimeout(() => setCurrentStage(3), 2000);
    }, [currentStage]);

    const handleWheel = (e) => {
        if (currentStage === 3) {
            if (isWheeling) return;
            setIsWheeling(true);
            if (e.deltaY > 0) setSelectedSphereIndex((prev) => (prev + 1) % 5);
            else setSelectedSphereIndex((prev) => (prev - 1 + 5) % 5);
            setTimeout(() => setIsWheeling(false), 500);
        }
    };

    const handleModalOpen = (index) => {
        if (currentStage !== 3) return;
        if (index === 3) setCurrentStage(6);
        else {
            setCurrentStage(4);
            setModal({ isVisible: true, type: index });
        }
    };

    const handleModalClose = () => {
        setModal({ isVisible: false, type: null });
        setCurrentStage(3);
    };

    const handleModalSubmit = (payload) => {
        if (payload.type === 'AI_RESULT') {
            setAiResultData(payload.data);
            setUploadFileName(payload.fileName);
            setModal({ isVisible: false, type: modal.type });
            setCurrentStage(7);
        } else {
            setStage5Payload(payload);
            setModal({ isVisible: false, type: modal.type });
            setTotalSongs(0);
            setSelectedSongIndex(0);
            setCurrentPreviewUrl(null);
            setTimeout(() => setCurrentStage(5), 1000);
        }
    };

    const handleGoBack = () => {
        if (currentStage === 6 || currentStage === 7) { setCurrentStage(3); return; }
        setCurrentStage(3);
        setSelectedSphereIndex(0);
        setStage5Payload(null);
        setCurrentCoverUrl(null);
        setSelectedSongIndex(0);
        setTotalSongs(0);
        setCurrentPreviewUrl(null);
    };

    const handleLike = async (song) => {
        if (!db) { alert("Database not connected."); return; }
        if (isGuest) return;
        try {
            const likesRef = collection(db, 'artifacts', appId, 'public', 'data', 'likes');
            await addDoc(likesRef, {
                songTitle: song.title,
                coverUrl: song.coverUrl,
                userId: user.uid,
                timestamp: serverTimestamp()
            });
        } catch (e) { console.error(e); }
    };

    const handleSendMsg = async () => {
        if (!msgInput.trim()) return;
        if (isGuest) { alert("Please login to send messages."); return; }
        if (!db) { alert("Error: Database not connected. Check LOCAL_FIREBASE_CONFIG."); return; }

        try {
            const msgsRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
            await addDoc(msgsRef, {
                text: msgInput,
                userId: user.uid,
                displayName: userName,
                timestamp: serverTimestamp()
            });
            setMsgInput("");
            alert("Sent!");
        } catch (e) {
            console.error("Message failed:", e);
            alert("Failed to send.");
        }
    };

    return (
        <div className="frame-container">
            <div className="canvas-container">
                <Scene
                    currentStage={currentStage}
                    selectedSphereIndex={selectedSphereIndex}
                    onModalOpen={handleModalOpen}
                    onWheel={handleWheel}
                    songCoverUrl={currentCoverUrl}
                    WallContent={<Phase6_Wall currentStage={currentStage} db={db} />}
                />
            </div>

            <div className={`scroll-container ${currentStage === 5 || currentStage === 6 || currentStage === 7 ? 'at-stage-5' : ''}`} ref={scrollContainerRef}>
                <Phase1_UI currentStage={currentStage} onNextStage={handleNextStage} isLoading={isLoading} onLogin={handleLogin} />
                <Phase2_UI currentStage={currentStage} />
                <Phase3_UI currentStage={currentStage} selectedSphereIndex={selectedSphereIndex} />
                <ModalOverlay isVisible={modal.isVisible} type={modal.type} onSubmit={handleModalSubmit} onClose={handleModalClose} />
                <PlaylistUI
                    currentStage={currentStage}
                    stage5Payload={stage5Payload}
                    accessToken={accessToken}
                    onCoverChange={setCurrentCoverUrl}
                    onPreviewChange={setCurrentPreviewUrl}
                    selectedSongIndex={selectedSongIndex}
                    onListLoaded={setTotalSongs}
                    onSongClick={setSelectedSongIndex}
                    onLike={handleLike}
                    isGuest={isGuest}
                />
                {currentStage === 5 && <BackButton currentStage={currentStage} onClick={handleGoBack} />}
                {/* Phase6_UI (2D) 在這裡渲染 */}
                <Phase6_UI currentStage={currentStage} inputValue={msgInput} setInputValue={setMsgInput} onSend={handleSendMsg} isGuest={isGuest} onBack={handleGoBack} />
                {/* Phase7_AIResult (2D) 在這裡渲染 */}
                {currentStage === 7 && <Phase7_AIResult resultData={aiResultData} fileName={uploadFileName} onBack={handleGoBack} />}
            </div>

            <audio
                key={currentPreviewUrl}
                className={`audio-player ${currentStage === 5 ? 'is-visible' : ''}`}
                src={currentPreviewUrl}
                controls
                autoPlay
            />
        </div>
    );
}

export default App;