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
 * Load a single texture and add to cache with downscaling
 */
function loadTexture(src: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (textureCache.has(src)) {
      resolve(textureCache.get(src)!);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Downscale if image is too large (max 1024 in any dimension for grid performance)
      const MAX_SIZE = 1024;
      let width = img.width;
      let height = img.height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;

        textureCache.set(src, texture);
        resolve(texture);
      } else {
        // Use standard loader if size is acceptable
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
          (err) => reject(err)
        );
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image:', src);
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
    };

    img.src = src;
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
