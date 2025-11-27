import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { collection, query, limit, orderBy, onSnapshot } from "firebase/firestore";

const DanmakuMessage = ({ data }) => {
    const group = useRef();
    const config = useMemo(() => {
        return {
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 14,
            z: (Math.random() - 0.5) * 10,
            speed: 0.02 + Math.random() * 0.05,
        };
    }, []);

    useFrame(() => {
        if (group.current) {
            group.current.position.x -= config.speed;
            if (group.current.position.x < -20) {
                group.current.position.x = 20 + Math.random() * 5;
                group.current.position.y = (Math.random() - 0.5) * 14;
            }
        }
    });

    const textContent = `(${data.displayName})：${data.text}`;
    const bgWidth = textContent.length * 0.35 + 1;

    return (
        <group ref={group} position={[config.x, config.y, config.z]}>
            <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[bgWidth, 1.2]} />
                <meshBasicMaterial color="black" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[bgWidth, 1.2, 0.01]} />
                <meshBasicMaterial color="#1ED760" wireframe={true} />
            </mesh>
            <Text fontSize={0.4} color="white" anchorX="center" anchorY="middle">
                {textContent}
            </Text>
        </group>
    );
};

const Phase6_Wall = ({ currentStage, db }) => {
    const [messages, setMessages] = useState([]);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        if (currentStage !== 6 || !db) return;

        const msgsRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
        const qMsgs = query(msgsRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubMsgs();
    }, [currentStage, db, appId]);

    if (currentStage !== 6) return null;

    return (
        <group>
            {messages.map((item) => (
                <DanmakuMessage key={item.id} data={item} />
            ))}
        </group>
    );
};

export const Phase6_UI = ({ currentStage, onSend, inputValue, setInputValue, isGuest, onBack }) => {
    if (currentStage !== 6) return null;

    return (
        <div className="ui-stage" style={{ opacity: 1, visibility: 'visible', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#1ED760', textShadow: '0 0 15px #0f6b30', margin: '20px' }}>
                MESSAGE UNIVERSE
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isGuest ? "Login to leave a message" : "Send a danmaku..."} disabled={isGuest} className="phase6-input" />
                <button onClick={onSend} disabled={isGuest} className="phase6-btn" style={{ opacity: isGuest ? 0.5 : 1, background: '#1ED760', color: 'black' }}>SEND</button>
            </div>
            <button onClick={onBack} className="back-button" style={{ position: 'static', marginTop: '20px', transform: 'none' }}>BACK TO MENU</button>
        </div>
    );
};

export default Phase6_Wall;