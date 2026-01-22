import React from 'react';

interface ProgressiveBlurProps {
    position: 'top' | 'bottom';
    className?: string;
}

/**
 * ProgressiveBlur Component
 * 
 * Adds a gradient blur/fade effect to the top or bottom of the screen.
 * 
 * CONFIGURATION:
 * The height and gradient colors are defined in src/index.css under the .progressive-blur class.
 * 
 * To change height: Modify the 'height' property in .progressive-blur
 * To change intensity: Modify the colors/opacity in the linear-gradient
 * To change blur amount: We use a mask/gradient approach instead of backdrop-filter for performance.
 * If you want real blur (more expensive), uncomment backdrop-filter in CSS.
 */
export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({ position, className = '' }) => {
    return (
        <div
            className={`progressive-blur ${position === 'bottom' ? 'rotate-180 bottom-0' : 'top-0'} ${className}`}
            aria-hidden="true"
        />
    );
};
