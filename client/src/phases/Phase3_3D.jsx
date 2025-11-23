import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const THEME_COLORS = [
    new THREE.Color("#1ED760"), // 0: Playlist (Green)
    new THREE.Color("#8A2BE2"), // 1: Mood (Purple)
    new THREE.Color("#4169E1"), // 2: Weather (Blue)
    new THREE.Color("#FFD700"), // 3: Message Wall (Gold)
    new THREE.Color("#00FFFF"), // 4: AI Recommend (Cyan) - [修改 5] 新增
];

// 五邊形排列 (72度間隔)
const slots = [
    { position: new THREE.Vector3(0, 0, 1.5), scale: 1.0, opacity: 1.0 },    // 0: Front
    { position: new THREE.Vector3(2.0, 0, 0), scale: 0.6, opacity: 0.6 },    // 1: Right Front
    { position: new THREE.Vector3(1.2, 0, -2), scale: 0.4, opacity: 0.3 },   // 2: Right Back
    { position: new THREE.Vector3(-1.2, 0, -2), scale: 0.4, opacity: 0.3 },  // 3: Left Back
    { position: new THREE.Vector3(-2.0, 0, 0), scale: 0.6, opacity: 0.6 },   // 4: Left Front
];

const AnimatedSphere = ({ index, selectedSphereIndex, currentStage, geometry, onClick, onModalOpen }) => {
    const meshRef = useRef();
    const materialRef = useRef();

    const targetState = useMemo(() => {
        if (currentStage !== 3) {
            return { position: new THREE.Vector3(0, 0, 0), scale: 0, opacity: 0 };
        }
        // [修改 5] 5 顆球輪替邏輯
        const targetSlotIndex = (index - selectedSphereIndex + 5) % 5;
        return slots[targetSlotIndex];
    }, [index, selectedSphereIndex, currentStage]);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;
        const speed = 4.0 * delta;
        meshRef.current.position.lerp(targetState.position, speed);
        const targetScale = new THREE.Vector3(targetState.scale, targetState.scale, targetState.scale);
        meshRef.current.scale.lerp(targetScale, speed);
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetState.opacity, speed);
    });

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(index); }}
            position={slots[index].position}
            scale={[0, 0, 0]}
        >
            <meshPhysicalMaterial
                ref={materialRef}
                transparent={true}
                roughness={0.4}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                color={THEME_COLORS[index]}
                emissive={THEME_COLORS[index]}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};

function Phase3Scene({ currentStage, selectedSphereIndex, onModalOpen }) {
    const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 64, 64), []);

    return (
        <group>
            {/* [修改 5] 渲染 5 顆球 (0-4) */}
            {[0, 1, 2, 3, 4].map((i) => (
                <AnimatedSphere
                    key={i}
                    index={i}
                    selectedSphereIndex={selectedSphereIndex}
                    currentStage={currentStage}
                    geometry={sphereGeometry}
                    onClick={() => {
                        const slotIndex = (i - selectedSphereIndex + 5) % 5;
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