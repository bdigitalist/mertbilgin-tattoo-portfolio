import * as THREE from 'three';
import { portfolioItems } from '@/data/portfolioData';

// Global texture cache
export const textureCache = new Map<string, THREE.Texture>();

// Loading state
let loadingPromise: Promise<void> | null = null;
let loadingProgress = 0;
let loadingComplete = false;

// Create texture loader with CORS
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

/**
 * Load a single texture and add to cache
 */
function loadTexture(src: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (textureCache.has(src)) {
      resolve(textureCache.get(src)!);
      return;
    }

    textureLoader.load(
      src,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        textureCache.set(src, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.warn('Failed to load texture:', src);
        // Create a placeholder texture on error
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 4;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(0, 0, 4, 4);
        const placeholderTexture = new THREE.CanvasTexture(canvas);
        textureCache.set(src, placeholderTexture);
        resolve(placeholderTexture);
      }
    );
  });
}

/**
 * Preload all portfolio textures
 * @param onProgress - Callback with progress value (0-100)
 */
export function preloadAllTextures(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (loadingComplete) {
    onProgress?.(100);
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const sources = portfolioItems.map((item) => item.src);
  const total = sources.length;
  let loaded = 0;

  loadingPromise = Promise.all(
    sources.map((src) =>
      loadTexture(src).then(() => {
        loaded++;
        loadingProgress = Math.round((loaded / total) * 100);
        onProgress?.(loadingProgress);
      })
    )
  ).then(() => {
    loadingComplete = true;
    loadingProgress = 100;
  });

  return loadingPromise;
}

/**
 * Get a texture from cache (must be preloaded first)
 */
export function getTexture(src: string): THREE.Texture | null {
  return textureCache.get(src) || null;
}

/**
 * Check if all textures are loaded
 */
export function areTexturesLoaded(): boolean {
  return loadingComplete;
}

/**
 * Get current loading progress
 */
export function getLoadingProgress(): number {
  return loadingProgress;
}
