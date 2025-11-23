import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

import Phase1_3D from '../phases/Phase1_3D.jsx';
import Phase3_3D from '../phases/Phase3_3D.jsx';
import VinylModel from './VinylModel.jsx';
import ParticleField from './ParticleField.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

function Scene({ currentStage, selectedSphereIndex, onModalOpen, onWheel, songCoverUrl, WallContent }) {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true }} onWheel={onWheel}>
            <ambientLight intensity={1.0} />
            <directionalLight position={[5, 10, 5]} intensity={2.0} />
            {currentStage === 5 && <pointLight position={[-1, 1, 2]} intensity={5.0} distance={15} color="#1ED760" />}
            {currentStage === 6 && <pointLight position={[0, 0, 5]} intensity={3.0} color="#FFD700" />}

            <ErrorBoundary>
                <Suspense fallback={null}>
                    <ParticleField currentStage={currentStage} />
                    {currentStage <= 2 && <Phase1_3D currentStage={currentStage} />}
                    {currentStage >= 2 && currentStage <= 4 && (
                        <Phase3_3D currentStage={currentStage} selectedSphereIndex={selectedSphereIndex} onModalOpen={onModalOpen} />
                    )}
                    {currentStage === 5 && <VinylModel currentStage={currentStage} songCoverUrl={songCoverUrl} />}
                    {currentStage === 6 && WallContent}
                </Suspense>
            </ErrorBoundary>
            <Environment preset="city" background={false} />
        </Canvas>
    );
}

export default Scene;