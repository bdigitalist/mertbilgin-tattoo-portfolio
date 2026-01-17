import { useState, useEffect } from 'react';

interface LiveClockProps {
  timezone?: string;
}

export const LiveClock = ({ timezone = 'CET' }: LiveClockProps) => {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="hud-value font-mono tabular-nums">
      {time} {timezone}
    </span>
  );
};
