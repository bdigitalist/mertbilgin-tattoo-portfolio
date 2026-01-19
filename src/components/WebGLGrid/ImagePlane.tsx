import { useRef, forwardRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GridItem } from '@/data/portfolioData';

interface ImagePlaneProps {
  item: GridItem;
  position: [number, number, number];
  width: number;
  height: number;
  onClick: () => void;
}

// Texture cache
const textureCache = new Map<string, THREE.Texture>();
const loadingTextures = new Set<string>();

// Create texture loader with CORS
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

// Custom shader for grayscale effect
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uGrayscale;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Calculate grayscale using luminance weights
    float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscaleColor = vec3(gray);

    // Mix between grayscale and original color
    vec3 finalColor = mix(texColor.rgb, grayscaleColor, uGrayscale);

    // Apply brightness multiplier
    finalColor *= uColor;

    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

export const ImagePlane = forwardRef<THREE.Mesh, ImagePlaneProps>(
  ({ item, position, width, height, onClick }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const grayscaleRef = useRef(1); // Start grayscale

    useEffect(() => {
      // Check cache first
      if (textureCache.has(item.src)) {
        setTexture(textureCache.get(item.src)!);
        return;
      }

      // Prevent duplicate loads
      if (loadingTextures.has(item.src)) {
        return;
      }

      loadingTextures.add(item.src);

      textureLoader.load(
        item.src,
        (loadedTexture) => {
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(item.src, loadedTexture);
          loadingTextures.delete(item.src);
          setTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.warn('Failed to load:', item.src);
          loadingTextures.delete(item.src);
        }
      );
    }, [item.src]);

    // Animate grayscale transition
    useFrame((_, delta) => {
      if (materialRef.current) {
        const target = isHovered ? 0 : 1;
        const speed = 4; // Transition speed
        grayscaleRef.current += (target - grayscaleRef.current) * speed * delta;
        materialRef.current.uniforms.uGrayscale.value = grayscaleRef.current;

        // Slight brightness boost on hover
        const brightness = isHovered ? 1.1 : 1.0;
        materialRef.current.uniforms.uColor.value.setScalar(
          1 + (brightness - 1) * (1 - grayscaleRef.current)
        );
      }
    });

    // Create placeholder texture for loading state
    const placeholderTexture = useRef(
      new THREE.DataTexture(
        new Uint8Array([58, 58, 74, 255]),
        1,
        1,
        THREE.RGBAFormat
      )
    ).current;

    return (
      <mesh
        ref={ref || meshRef}
        position={position}
        scale={[width, height, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'none';
        }}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTexture: { value: texture || placeholderTexture },
            uGrayscale: { value: 1 },
            uColor: { value: new THREE.Color(1, 1, 1) },
          }}
        />
      </mesh>
    );
  }
);

ImagePlane.displayName = 'ImagePlane';
