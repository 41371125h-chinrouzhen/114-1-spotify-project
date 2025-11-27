import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const TARGET_POSITION = [-2.5, 0, 0];

function VinylModel({ currentStage, songCoverUrl }) {
    const meshRef = useRef();
    const texture = useTexture(songCoverUrl || "/spotify_logo.png");

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += delta * 0.5;
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
        }
    });

    return (
        <mesh ref={meshRef} position={TARGET_POSITION} scale={[0, 0, 0]}>
            <circleGeometry args={[2, 64]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
    );
}

export default VinylModel;