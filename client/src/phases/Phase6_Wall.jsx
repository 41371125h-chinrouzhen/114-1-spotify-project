import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { collection, query, limit, orderBy, onSnapshot } from "firebase/firestore";

// --- 3D 元件：小行星 (代表按讚的歌) ---
const Asteroid = ({ data }) => {
    const mesh = useRef();
    const initialPos = useMemo(() => ({
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 5 - 2,
        rotX: Math.random() * 0.01, rotY: Math.random() * 0.01
    }), []);

    const color = useMemo(() => new THREE.Color().setHSL(Math.random(), 0.7, 0.5), []);

    useFrame(() => {
        if (mesh.current) {
            mesh.current.rotation.x += initialPos.rotX;
            mesh.current.rotation.y += initialPos.rotY;
        }
    });

    return (
        <group position={[initialPos.x, initialPos.y, initialPos.z]}>
            <mesh ref={mesh}>
                <dodecahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <Text position={[0, -1, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                {data.songTitle}
            </Text>
        </group>
    );
};

// --- 3D 元件：流星留言 ---
const MeteorMessage = ({ data }) => {
    const group = useRef();
    const speed = 0.05 + Math.random() * 0.05;

    useFrame(() => {
        if (group.current) {
            group.current.position.x -= speed;
            group.current.position.y -= speed * 0.5;
            if (group.current.position.x < -15) {
                group.current.position.x = 15;
                group.current.position.y = 10;
            }
        }
    });

    return (
        <group ref={group} position={[15 + Math.random() * 5, 10 + Math.random() * 5, 0]}>
            <Text fontSize={1.2} color="#FFD700" outlineWidth={0.05} outlineColor="black">
                {data.text}
            </Text>
        </group>
    );
};

// --- 主 3D 場景元件 ---
const Phase6_Wall = ({ currentStage, db }) => {
    const [likes, setLikes] = useState([]);
    const [messages, setMessages] = useState([]);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        if (currentStage !== 6 || !db) return;

        // 監聽按讚
        const likesRef = collection(db, 'artifacts', appId, 'public', 'data', 'likes');
        const qLikes = query(likesRef, orderBy('timestamp', 'desc'), limit(20));
        const unsubLikes = onSnapshot(qLikes, (snapshot) => {
            setLikes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 監聽留言
        const msgsRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
        const qMsgs = query(msgsRef, orderBy('timestamp', 'desc'), limit(10));
        const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubLikes(); unsubMsgs(); };
    }, [currentStage, db, appId]);

    if (currentStage !== 6) return null;

    return (
        <group>
            {likes.map(item => <Asteroid key={item.id} data={item} />)}
            {messages.map(item => <MeteorMessage key={item.id} data={item} />)}
        </group>
    );
};

// --- UI Overlay 元件 ---
export const Phase6_UI = ({ currentStage, onSend, inputValue, setInputValue, isGuest, onBack }) => {
    if (currentStage !== 6) return null;

    return (
        <div
            className="ui-stage"
            style={{
                // 強制覆蓋預設隱藏樣式，並設定半透明背景讓文字更清晰
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: 'rgba(0,0,0,0.4)'
            }}
        >
            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                color: '#FFD700',
                textShadow: '0 0 10px gold',
                margin: '20px'
            }}>
                MESSAGE WALL
            </h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isGuest ? "Login to send wishes" : "Make a wish..."}
                    disabled={isGuest}
                    className="phase6-input" // 使用 App.css 定義的樣式
                />
                <button
                    onClick={onSend}
                    disabled={isGuest}
                    className="phase6-btn" // 使用 App.css 定義的樣式
                    style={{ opacity: isGuest ? 0.5 : 1 }}
                >
                    SEND
                </button>
            </div>

            <button
                onClick={onBack}
                className="back-button"
                style={{ position: 'static', marginTop: '20px', transform: 'none' }}
            >
                BACK TO MENU
            </button>
        </div>
    );
};

export default Phase6_Wall;