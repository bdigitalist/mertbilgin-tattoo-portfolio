import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGridStore } from '@/store/useGridStore';

// Simple pseudo-noise function
const noise = (x: number, y: number, z: number, time: number) => {
    return Math.sin(x * 1.5 + time) * Math.cos(y * 1.5 + time * 0.8) * Math.sin(z * 1.5 + time * 1.2);
};

export const LivingInk = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // High detail Icosahedron for smooth deformation
    const geometry = useMemo(() => new THREE.IcosahedronGeometry(12, 4), []);
    const originalPositions = useMemo(() => {
        return geometry.attributes.position.array.slice();
    }, [geometry]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        const scrollY = useGridStore.getState().scrollY;

        // Map scroll to rotation
        meshRef.current.rotation.y = scrollY * 0.002;
        meshRef.current.rotation.z = scrollY * 0.001;

        // Access position attribute
        const positions = meshRef.current.geometry.attributes.position;
        const count = positions.count;

        // Convert pointer to world coordinates for Orthographic camera
        const mouseX = (state.pointer.x * viewport.width) / 2;
        const mouseY = (state.pointer.y * viewport.height) / 2;
        const mousePos = new THREE.Vector3(mouseX, mouseY, 0);

        // Inverse rotate mousePos into local space
        const localMouse = mousePos.clone().applyEuler(
            new THREE.Euler(
                -meshRef.current.rotation.x,
                -meshRef.current.rotation.y,
                -meshRef.current.rotation.z
            )
        );

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const x = originalPositions[ix];
            const y = originalPositions[ix + 1];
            const z = originalPositions[ix + 2];

            // 1. Idle Undulation (Perlin-ish)
            const v = new THREE.Vector3(x, y, z);
            const len = v.length();
            const dir = v.clone().normalize();

            // Noise offset
            const n = noise(dir.x, dir.y, dir.z, time * 0.8);
            const undulation = 0.5 * n;

            // 2. Hover Spike (Proximity Field)
            const distToMouse = v.distanceTo(localMouse);
            const spikeRadius = 15.0;
            let spike = 0;

            if (distToMouse < spikeRadius) {
                const proxy = 1 - (distToMouse / spikeRadius);
                spike = Math.pow(proxy, 3) * 8.0;
            }

            // Combine
            const newLen = len + undulation + spike;

            positions.setXYZ(i, dir.x * newLen, dir.y * newLen, dir.z * newLen);
        }

        positions.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <primitive object={geometry} />
            <meshStandardMaterial
                color="#000000"
                roughness={0.3}
                metalness={0.7}
            />
        </mesh>
    );
};
