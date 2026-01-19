import { Canvas } from '@react-three/fiber';
import { GridManager } from './GridManager';
import { InputController } from './InputController';
import { GridItem } from '@/data/portfolioData';
import { useGridConfig } from '@/hooks/useGridConfig';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface WebGLCanvasProps {
  onItemClick: (item: GridItem) => void;
}

export const WebGLCanvas = ({ onItemClick }: WebGLCanvasProps) => {
  // Initialize grid configuration
  useGridConfig();
  // Start lerp scroll loop
  useInfiniteScroll();

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
        style={{ background: '#1a1a1a' }}
      >
        <GridManager onItemClick={onItemClick} />
        <InputController />
      </Canvas>
    </div>
  );
};
