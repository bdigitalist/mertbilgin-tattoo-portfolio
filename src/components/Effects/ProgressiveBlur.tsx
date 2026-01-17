interface ProgressiveBlurProps {
  position: 'top' | 'bottom';
}

export const ProgressiveBlur = ({ position }: ProgressiveBlurProps) => {
  const className = position === 'top' 
    ? 'progressive-blur progressive-blur-top'
    : 'progressive-blur progressive-blur-bottom';
  
  return (
    <div className={className} aria-hidden="true">
      <div className="progressive-blur-panel" />
      <div className="progressive-blur-panel" />
      <div className="progressive-blur-panel" />
      <div className="progressive-blur-panel" />
      <div className="progressive-blur-panel" />
      <div className="progressive-blur-panel" />
    </div>
  );
};
