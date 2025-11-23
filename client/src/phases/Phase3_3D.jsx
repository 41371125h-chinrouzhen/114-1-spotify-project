import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// 移除 useGLTF，改用原生幾何體以確保穩定性
import * as THREE from 'three';

const THEME_COLORS = [
    new THREE.Color("#1ED760"), // Green (Playlist)
    new THREE.Color("#8A2BE2"), // Purple (Mood)
    new THREE.Color("#4169E1"), // Blue (Weather)
    new THREE.Color("#FFD700"), // Gold (Message Wall)
];

// 四個位置：前、右、後、左
const slots = [
    { position: new THREE.Vector3(0, 0, 1.0), scale: 1.0, opacity: 1.0 },   // Front
    { position: new THREE.Vector3(1.5, 0, -1), scale: 0.6, opacity: 0.6 },  // Right
    { position: new THREE.Vector3(0, 0, -2), scale: 0.4, opacity: 0.3 },    // Back
    { position: new THREE.Vector3(-1.5, 0, -1), scale: 0.6, opacity: 0.6 }, // Left
];

// 單顆球體元件 (負責自己的動畫)
const AnimatedSphere = ({ index, selectedSphereIndex, currentStage, geometry, onClick, onModalOpen }) => {
    const meshRef = useRef();
    const materialRef = useRef();

    // 計算目標狀態
    const targetState = useMemo(() => {
        if (currentStage !== 3) {
            // 非 Stage 3 時縮小隱藏
            return { position: new THREE.Vector3(0, 0, 0), scale: 0, opacity: 0 };
        }
        // 核心邏輯：計算目標位置 (4個位置輪替)
        const targetSlotIndex = (index - selectedSphereIndex + 4) % 4;
        return slots[targetSlotIndex];
    }, [index, selectedSphereIndex, currentStage]);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        // 平滑移動 (Lerp)
        const speed = 4.0 * delta; // 動畫速度

        // 1. 位置插值
        meshRef.current.position.lerp(targetState.position, speed);

        // 2. 縮放插值
        const targetScale = new THREE.Vector3(targetState.scale, targetState.scale, targetState.scale);
        meshRef.current.scale.lerp(targetScale, speed);

        // 3. 透明度插值
        // 注意：Material 的 opacity 屬性是單一數值，不能直接用 vector lerp
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetState.opacity, speed);
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(index);
    };

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            onClick={handleClick}
            // 初始位置設定
            position={slots[index].position}
            scale={[0, 0, 0]}
        >
            {/* 使用 MeshPhysicalMaterial 讓球體看起來更有質感 */}
            <meshPhysicalMaterial
                ref={materialRef}
                transparent={true}
                roughness={0.4}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                color={THEME_COLORS[index]} // 每一顆球有固定的代表色
            />
        </mesh>
    );
};

function Phase3Scene({ currentStage, selectedSphereIndex, onModalOpen }) {
    // 移除 useGLTF 依賴，改用程式生成的 SphereGeometry
    // args: [半徑, 寬度分段數, 高度分段數] -> 分段數越高越圓
    const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 64, 64), []);

    return (
        <group>
            {[0, 1, 2, 3].map((i) => (
                <AnimatedSphere
                    key={i}
                    index={i}
                    selectedSphereIndex={selectedSphereIndex}
                    currentStage={currentStage}
                    geometry={sphereGeometry}
                    onClick={() => {
                        // 如果點擊的是當前選中的球 (前面的球)，則觸發 Modal
                        // 邏輯：當前選中的球，其 targetSlotIndex 為 0 (Front)
                        // (i - selectedSphereIndex + 4) % 4 === 0 表示它是當前選中的球
                        const slotIndex = (i - selectedSphereIndex + 4) % 4;
                        if (slotIndex === 0 && onModalOpen) {
                            onModalOpen(i);
                        }
                    }}
                />
            ))}
        </group>
    );
}

export default Phase3Scene;