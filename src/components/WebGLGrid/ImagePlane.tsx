import { useRef, useEffect, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { GridItem } from '@/data/portfolioData';
import { useGridStore } from '@/store/useGridStore';

interface ImagePlaneProps {
  item: GridItem;
  position: [number, number, number];
  width: number;
  height: number;
  onClick: () => void;
}

// Shared geometry for all planes
const sharedGeometry = new THREE.PlaneGeometry(1, 1);

// Texture cache and loader
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

const getTexture = (src: string): THREE.Texture => {
  if (textureCache.has(src)) {
    return textureCache.get(src)!;
  }
  
  // Create a placeholder while loading
  const texture = textureLoader.load(src, (loadedTexture) => {
    loadedTexture.minFilter = THREE.LinearFilter;
    loadedTexture.magFilter = THREE.LinearFilter;
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.needsUpdate = true;
  });
  
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  
  textureCache.set(src, texture);
  return texture;
};

export const ImagePlane = forwardRef<THREE.Mesh, ImagePlaneProps>(
  ({ item, position, width, height, onClick }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const addLoadedImage = useGridStore((state) => state.addLoadedImage);
    
    // Get or load texture
    const texture = getTexture(item.src);
    
    useEffect(() => {
      addLoadedImage(item.src);
    }, [item.src, addLoadedImage]);
    
    return (
      <mesh
        ref={ref || meshRef}
        position={position}
        scale={[width, height, 1]}
        geometry={sharedGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          if (materialRef.current) {
            materialRef.current.color.setRGB(1.2, 1.2, 1.2);
          }
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (materialRef.current) {
            materialRef.current.color.setRGB(1, 1, 1);
          }
          document.body.style.cursor = 'none';
        }}
      >
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          toneMapped={false}
        />
      </mesh>
    );
  }
);

ImagePlane.displayName = 'ImagePlane';
