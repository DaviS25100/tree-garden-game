import * as THREE from 'three';

export default function Garden() {
  return (
    <>
      {/* Garden border */}
      <group>
        {/* North border */}
        <mesh position={[0, 0.2, 10]} castShadow>
          <boxGeometry args={[20, 0.4, 0.2]} />
          <meshLambertMaterial color="#8b4513" />
        </mesh>
        
        {/* South border */}
        <mesh position={[0, 0.2, -10]} castShadow>
          <boxGeometry args={[20, 0.4, 0.2]} />
          <meshLambertMaterial color="#8b4513" />
        </mesh>
        
        {/* East border */}
        <mesh position={[10, 0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 20]} />
          <meshLambertMaterial color="#8b4513" />
        </mesh>
        
        {/* West border */}
        <mesh position={[-10, 0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 20]} />
          <meshLambertMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* Decorative elements */}
      <group>
        {/* Corner posts */}
        <mesh position={[9.5, 0.5, 9.5]} castShadow>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        
        <mesh position={[-9.5, 0.5, 9.5]} castShadow>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        
        <mesh position={[9.5, 0.5, -9.5]} castShadow>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
        
        <mesh position={[-9.5, 0.5, -9.5]} castShadow>
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>
    </>
  );
}
