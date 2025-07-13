import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTreeGame } from '../lib/stores/useTreeGame';
import { calculateGrowth } from '../lib/gameLogic';
import Tree from './Tree';
import Plant from './Plant';
import Cloud from './Cloud';
import Garden from './Garden';
import * as THREE from 'three';

export default function Game() {
  const {
    trees,
    plants,
    clouds,
    updateClouds,
    saveGame,
  } = useTreeGame();

  const lastUpdateRef = useRef(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-save every 30 seconds
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      saveGame();
    }, 30000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [saveGame]);

  useFrame(() => {
    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    
    // Update cloud cooldowns
    updateClouds(delta);
    
    lastUpdateRef.current = now;
  });

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#4ade80" />
      </mesh>

      {/* Garden boundary */}
      <Garden />

      {/* Render all trees */}
      {trees.map((tree) => {
        const currentTime = Date.now();
        const calculatedGrowth = calculateGrowth(
          tree.plantedAt,
          tree.lastWatered,
          currentTime,
          0.6
        );
        
        return (
          <Tree
            key={tree.id}
            position={tree.position}
            growth={Math.max(tree.growth, calculatedGrowth)}
            isGolden={tree.isGolden}
            isWatered={tree.isWatered}
            lastWatered={tree.lastWatered}
          />
        );
      })}

      {/* Render all plants */}
      {plants.map((plant) => {
        const currentTime = Date.now();
        const calculatedGrowth = calculateGrowth(
          plant.plantedAt,
          plant.lastWatered,
          currentTime,
          0.8
        );
        
        return (
          <Plant
            key={plant.id}
            position={plant.position}
            type={plant.type}
            growth={Math.max(plant.growth, calculatedGrowth)}
            isWatered={plant.isWatered}
          />
        );
      })}

      {/* Render all clouds */}
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          position={cloud.position}
          isRaining={cloud.isRaining}
          onWater={() => {
            // This is handled by GameUI click events
          }}
        />
      ))}
    </>
  );
      }
