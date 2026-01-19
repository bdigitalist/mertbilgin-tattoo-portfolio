import { useState, useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
  speed?: number;
}

export const ScrambleText = ({
  text,
  className = '',
  as: Component = 'span',
  speed = 30
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number>();

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = text.length * 3;

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '™' || char === '·' || char === ':' || char === '(' || char === ')') return char;
            if (index < iteration / 3) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration++;

      if (iteration > maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  }, [text, isScrambling, speed]);

  return (
    <Component
      className={className}
      onMouseEnter={scramble}
    >
      {displayText}
    </Component>
  );
};

// Link version that preserves anchor functionality
interface ScrambleLinkProps {
  text: string;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  speed?: number;
}

export const ScrambleLink = ({
  text,
  href,
  className = '',
  target,
  rel,
  speed = 30
}: ScrambleLinkProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number>();

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = text.length * 3;

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '[' || char === ']') return char;
            if (index < iteration / 3) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration++;

      if (iteration > maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  }, [text, isScrambling, speed]);

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onMouseEnter={scramble}
    >
      {displayText}
    </a>
  );
};
