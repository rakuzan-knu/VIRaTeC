import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { useHomeContent } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import auroraSrc from '../assets/hero-background.webp';

export function GetInvolvedSection() {
  const { getInvolved } = useHomeContent();

  return (
    <section aria-labelledby="get-involved-title" className="bg-viratec-bg">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 pb-20 lg:px-[85px] lg:pt-32 lg:pb-32">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-white/10 lg:rounded-[40px]">
          <ResponsiveImage
            src={auroraSrc}
            sizes="(min-width: 1440px) 1270px, 100vw"
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-20 size-full object-cover object-[70%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 get-involved-scrim lg:get-involved-scrim-wide"
          />

          <div className="flex flex-col gap-10 px-6 py-10 lg:gap-20 lg:px-16 lg:py-20">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 lg:gap-5">
                <Eyebrow>{getInvolved.eyebrow}</Eyebrow>
                <h2
                  id="get-involved-title"
                  className="font-display text-[38px] leading-[42px] font-medium tracking-[-0.035em] text-white lg:text-[72px] lg:leading-[74px]"
                >
                  {getInvolved.titleLine} <br className="hidden lg:inline" />
                  {getInvolved.titleAccent}
                </h2>
              </div>
              <LinkButton to={ROUTES.REGISTER} className="hidden lg:inline-flex">
                {getInvolved.action}
              </LinkButton>
            </div>

            <ul className="grid gap-8 lg:grid-cols-3 lg:gap-10">
              {getInvolved.audiences.map((audience) => (
                <li
                  key={audience.title}
                  className="flex flex-col gap-2.5 border-t border-white/20 pt-5 lg:gap-3 lg:pt-6"
                >
                  <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.015em] text-white lg:text-[22px] lg:leading-7">
                    {audience.title}
                  </h3>
                  <p className="max-w-[40ch] text-[15px] leading-[23px] text-viratec-soft lg:text-base lg:leading-[26px]">
                    {audience.description}
                  </p>
                </li>
              ))}
            </ul>

            <LinkButton to={ROUTES.REGISTER} className="w-full lg:hidden">
              {getInvolved.action}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
