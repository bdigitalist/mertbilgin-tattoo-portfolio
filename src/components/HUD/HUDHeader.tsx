import { personalInfo } from '@/data/portfolioData';
import { LiveClock } from './LiveClock';
import { ScrambleText, ScrambleLink } from './ScrambleText';

interface HUDHeaderProps {
  isMobile: boolean;
}

export const HUDHeader = ({ isMobile }: HUDHeaderProps) => {
  if (isMobile) {
    return <MobileHeader />;
  }

  return <DesktopHeader />;
};

/**
 * Desktop layout - Compact, single-row approach
 * All key info on one line, minimal vertical footprint
 */
const DesktopHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="px-6 py-4">
        {/* Single row - all elements horizontally */}
        <div className="flex items-start justify-between">
          {/* Left: Location + Clock */}
          <div className="flex flex-col gap-0.5 pointer-events-auto">
            <ScrambleText text={personalInfo.location} className="hud-value text-[10px]" />
            <ScrambleText text={personalInfo.tagline} className="hud-value text-[10px] opacity-70" />
            <LiveClock timezone={personalInfo.timezone} className="text-[9px] opacity-60" />
          </div>

          {/* Center: Expertise + Socials inline */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-1 pointer-events-auto">
              <ScrambleText text="(EXPERTISE)" className="hud-label text-[8px]" />
              <ScrambleText text={personalInfo.expertise.join(' · ')} className="hud-value text-[9px]" />
            </div>

            <div className="flex flex-col gap-1 pointer-events-auto">
              <ScrambleText text="(SOCIALS)" className="hud-label text-[8px]" />
              <div className="flex gap-4">
                {personalInfo.socials.map((social, i) => (
                  <ScrambleLink
                    key={i}
                    href={social.href}
                    text={social.label}
                    className="hud-link text-[9px]"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA buttons inline */}
          <div className="flex gap-2 pointer-events-auto">
            {personalInfo.cta.map((cta, i) => (
              <ScrambleLink
                key={i}
                href={cta.href}
                text={`[${cta.label}]`}
                className="hud-button text-[9px] py-2 px-4"
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Mobile layout - Compact single-line approach
 * Minimizes vertical space while maintaining key info
 */
const MobileHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3 pointer-events-none">
      <div className="flex flex-col gap-2">
        {/* Top row: Location + Clock inline */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <ScrambleText text={personalInfo.location} className="hud-value text-[9px] leading-tight" />
            <ScrambleText text={personalInfo.tagline} className="hud-value text-[9px] leading-tight opacity-70" />
          </div>
          <LiveClock timezone={personalInfo.timezone} className="text-[8px] opacity-70" />
        </div>

        {/* Expertise + Socials row - horizontal compact */}
        <div className="flex items-start justify-between gap-4 pointer-events-auto">
          <div className="flex flex-col gap-0.5">
            <ScrambleText text="(EXPERTISE)" className="hud-label text-[7px]" />
            <ScrambleText text={personalInfo.expertise.join(' · ')} className="hud-value text-[8px] leading-tight" />
          </div>
          <div className="flex gap-3 shrink-0">
            {personalInfo.socials.map((social, i) => (
              <ScrambleLink
                key={i}
                href={social.href}
                text={social.label}
                className="hud-link text-[8px]"
                target="_blank"
                rel="noopener noreferrer"
              />
            ))}
          </div>
        </div>

        {/* CTA buttons - compact */}
        <div className="flex gap-2 pointer-events-auto">
          {personalInfo.cta.map((cta, i) => (
            <ScrambleLink
              key={i}
              href={cta.href}
              text={`[${cta.label}]`}
              className="hud-button flex-1 text-center text-[7px] py-1.5"
            />
          ))}
        </div>
      </div>
    </header>
  );
};
