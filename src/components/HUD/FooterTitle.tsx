import { ScrambleText } from './ScrambleText';

export const FooterTitle = () => {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <ScrambleText
        text="THE ARTBOARD™"
        className="text-sm font-medium tracking-[0.3em] text-foreground/80"
      />
    </div>
  );
};
