import { useEffect, useRef } from 'react';

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Smooth lag effect
            const x = e.clientX;
            const y = e.clientY;

            cursor.style.transform = `translate(${x}px, ${y}px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={cursorRef} className="custom-cursor">
            <div className="custom-cursor-inner">
                DRAG
            </div>
        </div>
    );
};
