import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Phase1Logo({ currentStage }) {
    const { scene } = useGLTF('/phase1_logo.glb');
    const modelRef = useRef();
    const targetScale = useRef(0.7);

    useEffect(() => {
        if (currentStage === 2) {
            targetScale.current = 0.001; // 退場
        } else {
            targetScale.current = 0.7; // 進場
        }
    }, [currentStage]);

    useFrame((state, delta) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.5;
            const currentS = modelRef.current.scale.x;
            const nextS = THREE.MathUtils.lerp(currentS, targetScale.current, delta * 5);
            modelRef.current.scale.set(nextS, nextS, nextS);
        }
    });

    if (!scene) return null;

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={0.7}
            position={[0, 0, 0]}
        />
    );
}
export default Phase1Logo;