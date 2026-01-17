import { useEffect, useState, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
const TITLE = 'THE ARTBOARD™';

export const FooterTitle = () => {
  const [displayText, setDisplayText] = useState(TITLE);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number>();
  
  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    
    let iteration = 0;
    const maxIterations = TITLE.length * 3;
    
    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        TITLE.split('')
          .map((char, index) => {
            if (char === ' ' || char === '™') return char;
            if (index < iteration / 3) return TITLE[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      
      iteration++;
      
      if (iteration > maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(TITLE);
        setIsScrambling(false);
      }
    }, 30);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      className="fixed bottom-6 left-6 z-50"
      onMouseEnter={scramble}
    >
      <span className="text-sm font-medium tracking-[0.3em] text-foreground/80">
        {displayText}
      </span>
    </div>
  );
};
