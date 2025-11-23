import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ currentStage }) => {
    // [修改 4] 數量減少，模擬稀疏的流星
    const count = 50;
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 20 - 10;
            // [修改 4] 速度加快
            const speed = 0.3 + Math.random() * 0.5;
            const length = 1.0 + Math.random() * 3.0;
            temp.push({ x, y, z, speed, length });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            // 往左下飛
            particle.x -= particle.speed;
            particle.y -= particle.speed * 0.6;

            // 循環
            if (particle.x < -25 || particle.y < -25) {
                particle.x = 25 + Math.random() * 10;
                particle.y = 25 + Math.random() * 10;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            // 調整角度以配合飛行方向
            dummy.rotation.z = Math.PI / 3;

            const scale = currentStage === 5 ? 1.5 : 1.0;
            dummy.scale.set(particle.length * scale, 0.1 * scale, 0.1 * scale);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <boxGeometry args={[1, 1, 1]} />
            {/* [修改 4] 黃色流星 */}
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.6} />
        </instancedMesh>
    );
};

export default ParticleField;