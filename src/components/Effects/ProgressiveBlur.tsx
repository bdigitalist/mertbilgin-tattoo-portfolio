interface ProgressiveBlurProps {
  position: 'top' | 'bottom';
}

export const ProgressiveBlur = ({ position }: ProgressiveBlurProps) => {
  const isTop = position === 'top';
  const gradientDirection = isTop ? 'to bottom' : 'to top';

  return (
    <div
      className="progressive-blur"
      style={{
        [isTop ? 'top' : 'bottom']: 0,
        background: `linear-gradient(${gradientDirection}, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 35%, hsl(var(--background) / 0.2) 65%, transparent 100%)`,
        maskImage: `linear-gradient(${gradientDirection}, black 0%, black 25%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(${gradientDirection}, black 0%, black 25%, transparent 100%)`,
      }}
      aria-hidden="true"
    />
  );
};
