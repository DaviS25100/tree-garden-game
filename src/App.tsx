import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Game from './components/Game';
import GameUI from './components/GameUI';
import { useTreeGame } from './lib/stores/useTreeGame';

function App() {
  const { initializeGame } = useTreeGame();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeGame();
    setIsLoading(false);
  }, [initializeGame]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-green-400 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">🌳 Loading Tree Garden...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-green-400 relative">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Environment preset="sunset" background />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.2}
        />
        <Game />
      </Canvas>
      <GameUI />
    </div>
  );
}

export default App;
