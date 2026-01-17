import { personalInfo } from '@/data/portfolioData';
import { LiveClock } from './LiveClock';

interface HUDHeaderProps {
  isMobile: boolean;
}

export const HUDHeader = ({ isMobile }: HUDHeaderProps) => {
  if (isMobile) {
    return <MobileHeader />;
  }
  
  return <DesktopHeader />;
};

const DesktopHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="flex items-start justify-between gap-8">
        {/* Location block */}
        <div className="flex flex-col gap-1">
          <span className="hud-value">{personalInfo.location}</span>
          <span className="hud-value">{personalInfo.tagline}</span>
          <LiveClock timezone={personalInfo.timezone} />
        </div>
        
        {/* Center section */}
        <div className="flex gap-16">
          {/* Expertise */}
          <div className="flex flex-col gap-2">
            <span className="hud-label">(MY.EXPERTISE)</span>
            {personalInfo.expertise.map((exp, i) => (
              <span key={i} className="hud-value">{exp}</span>
            ))}
          </div>
          
          {/* Socials */}
          <div className="flex flex-col gap-2">
            <span className="hud-label">(SOCIAL.CONTACTS)</span>
            {personalInfo.socials.map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                className="hud-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
        
        {/* CTA buttons */}
        <div className="flex flex-col gap-2">
          {personalInfo.cta.map((cta, i) => (
            <a 
              key={i} 
              href={cta.href} 
              className="hud-button text-center"
            >
              [{cta.label}]
            </a>
          ))}
        </div>
      </div>
      
      {/* Description */}
      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground tracking-wide">
        {personalInfo.description}
      </p>
    </header>
  );
};

const MobileHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="flex flex-col gap-4">
        {/* Location block */}
        <div className="flex flex-col gap-0.5">
          <span className="hud-value text-xs">{personalInfo.location}</span>
          <span className="hud-value text-xs">{personalInfo.tagline}</span>
          <LiveClock timezone={personalInfo.timezone} />
        </div>
        
        {/* Expertise - compact */}
        <div className="flex flex-col gap-1">
          <span className="hud-label text-[9px]">(MY.EXPERTISE)</span>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {personalInfo.expertise.map((exp, i) => (
              <span key={i} className="hud-value text-[10px]">{exp}</span>
            ))}
          </div>
        </div>
        
        {/* Socials - inline */}
        <div className="flex flex-col gap-1">
          <span className="hud-label text-[9px]">(SOCIAL.CONTACTS)</span>
          <div className="flex gap-4">
            {personalInfo.socials.map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                className="hud-link text-[10px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
        
        {/* Description - shorter on mobile */}
        <p className="text-[10px] leading-relaxed text-muted-foreground tracking-wide line-clamp-2">
          {personalInfo.description}
        </p>
        
        {/* CTA buttons side by side */}
        <div className="flex gap-2">
          {personalInfo.cta.map((cta, i) => (
            <a 
              key={i} 
              href={cta.href} 
              className="hud-button flex-1 text-center text-[9px] py-2"
            >
              [{cta.label}]
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};
