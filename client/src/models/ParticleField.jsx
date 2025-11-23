import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ currentStage }) => {
    const count = 500; // 粒子數量
    const mesh = useRef();

    // 1. 產生隨機位置的粒子
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const x = (Math.random() - 0.5) * 20; // 隨機 X
            const y = (Math.random() - 0.5) * 20; // 隨機 Y
            const z = (Math.random() - 0.5) * 10 - 5; // 隨機 Z (放在背景)
            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, []);

    // 2. 這是 Three.js 的 "Dummy" 物件，用來優化效能
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // 3. 動畫迴圈
    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;

            // 更新時間因子
            t = particle.t += speed / 2;

            // 根據 Stage 改變運動模式
            if (currentStage === 5) {
                // 音樂模式：粒子動得比較快，且會旋轉
                const s = Math.cos(t);
                dummy.position.set(
                    x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                    y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                    z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
                );
                dummy.rotation.set(s * 5, s * 5, s * 5);
                dummy.scale.set(s, s, s);
            } else {
                // 選單模式：粒子緩慢漂浮
                const s = Math.cos(t);
                dummy.position.set(
                    x + Math.cos((t / 30) * factor) + (Math.sin(t * 1) * factor) / 30,
                    y + Math.sin((t / 30) * factor) + (Math.cos(t * 2) * factor) / 30,
                    z
                );
                dummy.rotation.set(s, s, s);
                dummy.scale.set(s * 0.5, s * 0.5, s * 0.5);
            }

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
                color={currentStage === 5 ? "#1ED760" : "#ffffff"} // Stage 5 變綠色
                roughness={0.5}
                metalness={0.5}
                transparent
                opacity={0.6}
            />
        </instancedMesh>
    );
};

export default ParticleField;
