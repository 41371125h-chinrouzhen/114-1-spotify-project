import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = ({ currentStage }) => {
    const count = 25;
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 20 - 10;
            const speed = 0.2 + Math.random() * 0.4;
            const length = 0.5 + Math.random() * 1.5;
            const t = Math.random() * 100;
            temp.push({ x, y, z, speed, length, t });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            particle.x -= particle.speed;
            particle.y -= particle.speed * 0.6;
            particle.t += delta * 5;

            if (particle.x < -25 || particle.y < -25) {
                particle.x = 25 + Math.random() * 10;
                particle.y = 25 + Math.random() * 10;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.rotation.z = Math.PI / 3;

            const scale = currentStage === 5 ? 1.2 : 1.0;
            dummy.scale.set(particle.length * scale, 1, 1);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            const twinkle = 0.5 + Math.abs(Math.sin(particle.t)) * 0.5;
            mesh.current.setColorAt(i, new THREE.Color(1, 1, 0).multiplyScalar(twinkle));
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <boxGeometry args={[0.8, 0.03, 0.03]} />
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.8} />
        </instancedMesh>
    );
};

export default ParticleField;