import { ArrowUpRight, Globe2, Languages, Mail } from 'lucide-react';
import { PROFILE_LINK_KEYS, buildProfileLinkUrl, type PublicProfileDto } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { useIntlNames } from '@/shared/lib/intlNames';
import { usePersonMessages } from '../model/messages';
import { ProfileCard } from './ProfileCard';

export function ProfileAside({ profile }: { profile: PublicProfileDto }) {
  const t = usePersonMessages();
  const labels = useAccountLabels();
  const { languageName } = useIntlNames();
  const links = PROFILE_LINK_KEYS.filter((key) => profile.links[key]);

  return (
    <aside className="flex min-w-0 flex-col gap-4 lg:gap-6">
      {(links.length > 0 || profile.email) && (
        <ProfileCard title={t.profiles} icon={<Globe2 className="size-5" />}>
          <ul className="flex flex-col gap-1">
            {profile.email && (
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 rounded-[14px] px-2 py-2.5 text-[15px] text-white transition-colors hover:bg-white/6"
                >
                  <Mail aria-hidden="true" className="size-4 text-viratec-subtle" />
                  <span className="min-w-0 truncate">{profile.email}</span>
                </a>
              </li>
            )}
            {links.map((key) => (
              <li key={key}>
                <a
                  href={buildProfileLinkUrl(key, profile.links[key])}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="group flex items-center justify-between gap-3 rounded-[14px] px-2 py-2.5 text-[15px] text-white transition-colors hover:bg-white/6"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{labels.links[key]}</span>
                    <span className="truncate text-xs text-viratec-subtle">
                      {profile.links[key]}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-viratec-subtle transition-colors group-hover:text-viratec-accent"
                  />
                </a>
              </li>
            ))}
          </ul>
        </ProfileCard>
      )}

      {profile.languages.length > 0 && (
        <ProfileCard title={t.languages} icon={<Languages className="size-5" />}>
          <ul className="flex flex-col divide-y divide-white/8">
            {profile.languages.map((language) => (
              <li
                key={language.code}
                className="flex items-center justify-between gap-3 py-2.5 text-[15px] first:pt-0 last:pb-0"
              >
                <span className="text-white">{languageName(language.code)}</span>
                <span className="text-sm text-viratec-muted">
                  {labels.languageLevel[language.level]}
                </span>
              </li>
            ))}
          </ul>
        </ProfileCard>
      )}
    </aside>
  );
}
