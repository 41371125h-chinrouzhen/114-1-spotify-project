// --- /client/src/Phase1_3D.jsx  ---

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei'; 
import * as THREE from 'three'; 
import { gsap } from 'gsap'; 

function Phase1Logo({ currentStage }) { 
  const { scene } = useGLTF('/phase1_logo.glb'); 
  const modelRef = useRef();
  
  const mouseY = useRef(0);
  useEffect(() => { 
    const handleMouseMove = (event) => {
      mouseY.current = (event.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); 

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5; 
      const targetY = -mouseY.current * 0.5; 
      modelRef.current.position.y = THREE.MathUtils.lerp(
        modelRef.current.position.y, 
        targetY, 
        0.1
      );
    }
  });
  
  useLayoutEffect(() => {
    if (currentStage === 2 && modelRef.current) {
      console.log("GSAP (3D): 立即隱藏 3D Logo...");
      
      gsap.set(modelRef.current.scale, {
        x: 0.001, y: 0.001, z: 0.001,
      });
    }
  }, [currentStage]);
  
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