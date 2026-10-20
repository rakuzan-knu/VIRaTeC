import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { AUDIENCES } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';

export function GetInvolvedSection() {
  return (
    <section aria-labelledby="get-involved-title" className="bg-viratec-bg">
      <div className="mx-auto max-w-[1440px] px-5 pt-2 pb-[72px] lg:px-[85px] lg:pt-10 lg:pb-[140px]">
        <div className="flex flex-col gap-6 rounded-[26px] bg-[linear-gradient(129.68deg,#0a2f73_0%,#0b5f9e_43.8%,#2fbf8f_72.99%)] px-[22px] py-8 lg:gap-10 lg:rounded-[32px] lg:bg-[linear-gradient(153.25deg,#0a2f73_0%,#0b5f9e_42.86%,#2fbf8f_71.43%)] lg:p-16">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-6 lg:gap-5">
              <Eyebrow>Get Involved</Eyebrow>
              <h2
                id="get-involved-title"
                className="text-[32px] leading-9 tracking-[-0.96px] text-white lg:text-[52px] lg:leading-[58px] lg:tracking-[-1.56px]"
              >
                Become part of the <br className="hidden lg:inline" />
                VIRaTeC network.
              </h2>
            </div>
            <LinkButton to={ROUTES.REGISTER} className="hidden lg:inline-flex">
              Join Us
            </LinkButton>
          </div>

          <ul className="grid gap-6 lg:grid-cols-3 lg:gap-5">
            {AUDIENCES.map((audience) => (
              <li
                key={audience.title}
                className="flex flex-col gap-2 rounded-2xl border border-white/16 bg-white/8 p-[18px] lg:gap-2.5 lg:rounded-[20px] lg:p-6"
              >
                <h3 className="text-lg font-medium text-white lg:text-xl">{audience.title}</h3>
                <p className="text-[15px] leading-[22px] text-viratec-soft lg:text-base lg:leading-6">
                  {audience.description}
                </p>
              </li>
            ))}
          </ul>

          <LinkButton to={ROUTES.REGISTER} className="w-full lg:hidden">
            Join Us
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
