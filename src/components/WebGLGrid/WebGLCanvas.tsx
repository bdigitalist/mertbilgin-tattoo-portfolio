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
  
  // Handle inertia scrolling
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
        style={{ background: 'hsl(0 0% 4%)' }}
      >
        <GridManager onItemClick={onItemClick} />
        <InputController />
      </Canvas>
    </div>
  );
};
