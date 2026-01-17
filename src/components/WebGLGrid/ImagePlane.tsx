import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
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

export const ImagePlane = ({ item, position, width, height, onClick }: ImagePlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const addLoadedImage = useGridStore((state) => state.addLoadedImage);
  
  // Load texture
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(item.src, () => {
      addLoadedImage(item.src);
    });
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [item.src, addLoadedImage]);
  
  // Shader for cover effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uPlaneSize: { value: new THREE.Vector2(width, height) },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uHover: { value: 0 },
        uOpacity: { value: 1 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uPlaneSize;
        uniform vec2 uImageSize;
        uniform float uHover;
        uniform float uOpacity;
        varying vec2 vUv;
        
        vec2 getCoverUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
          vec2 ratio = vec2(
            min((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),
            min((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)
          );
          return vec2(
            uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            uv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
        }
        
        void main() {
          vec2 coverUv = getCoverUv(vUv, uPlaneSize, uImageSize);
          vec4 color = texture2D(uTexture, coverUv);
          
          // Subtle hover effect
          color.rgb = mix(color.rgb, color.rgb * 1.1, uHover * 0.3);
          color.a *= uOpacity;
          
          gl_FragColor = color;
        }
      `,
      transparent: true
    });
  }, [texture, width, height]);
  
  // Update image size when texture loads
  useFrame(() => {
    if (texture.image && shaderMaterial.uniforms.uImageSize) {
      shaderMaterial.uniforms.uImageSize.value.set(
        texture.image.width || 1,
        texture.image.height || 1
      );
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        shaderMaterial.uniforms.uHover.value = 1;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        shaderMaterial.uniforms.uHover.value = 0;
        document.body.style.cursor = 'none';
      }}
    >
      <planeGeometry args={[width, height]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};
