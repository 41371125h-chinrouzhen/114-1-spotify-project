// --- /client/src/VinylModel.jsx ---

import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber'; 
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useTexture } from '@react-three/drei';

const TARGET_POSITION = [-2.5, 0, 0]; 

function VinylModel({ currentStage, songCoverUrl }) { 
  
  const meshRef = useRef(); 

  const fallbackUrl = '/spotify_logo.png';
  
  const urlToLoad = songCoverUrl || fallbackUrl;

  const coverTexture = useTexture(urlToLoad, (texture) => {
  });
  
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    console.log("GSAP (Vinyl): 正在強制淡入圖片...");
    
    gsap.to(meshRef.current.scale, {
      x: 1, y: 1, z: 1, 
      duration: 1.0,
      ease: 'power3.out',
      delay: 0.5 
  	});

  }, []); 

  useFrame((state, delta) => {
    if (meshRef.current) {
    	meshRef.current.rotation.z += delta * 0.5;
  	}
  });
  
  return (
  	<mesh 
    	ref={meshRef}
    	position={TARGET_POSITION}
    	scale={[0, 0, 0]} 
  	>
    	<planeGeometry args={[2, 2]} /> 
      
    	<meshBasicMaterial 
    	  map={coverTexture}
    	  side={THREE.DoubleSide}
  	/>
  	</mesh>
  );
}

export default VinylModel;