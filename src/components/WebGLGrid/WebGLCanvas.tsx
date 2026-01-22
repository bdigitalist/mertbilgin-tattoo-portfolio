import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GridManager } from './GridManager';
import { InputController } from './InputController';
import { LivingInk } from './LivingInk';
import { GridItem } from '@/data/portfolioData';
import { useGridConfig } from '@/hooks/useGridConfig';

interface WebGLCanvasProps {
  onItemClick: (item: GridItem) => void;
}

export const WebGLCanvas = ({ onItemClick }: WebGLCanvasProps) => {
  // Initialize grid configuration
  useGridConfig();

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        orthographic
        camera={{
          zoom: 1,
          position: [0, 0, 100],
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        frameloop="always"
        style={{ background: '#1a1a1a', touchAction: 'none' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* <LivingInk /> */}
        <GridManager onItemClick={onItemClick} />
        <InputController />
      </Canvas>
    </div>
  );
};
