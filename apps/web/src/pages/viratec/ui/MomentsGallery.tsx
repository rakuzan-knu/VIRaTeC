import { cn } from '@/shared/lib';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import certificateCeremony from '@/shared/assets/photos/certificate-ceremony-2025.webp';
import coilSeriesTalk from '@/shared/assets/photos/coil-series-2025-talk.webp';
import studentSpeaker from '@/shared/assets/photos/student-speaker-knu.webp';
import alliance from '@/shared/assets/photos/alliance-ukrainian-universities.webp';
import oxford from '@/shared/assets/photos/oxford-said-business-school.webp';
import ivec from '@/shared/assets/photos/ivec-2025-heraklion.webp';
import jhuRolePlay from '@/shared/assets/photos/jhu-role-play-online.webp';
import karunya from '@/shared/assets/photos/karunya-online-session.webp';
import certificatesParticipants from '@/shared/assets/photos/certificates-participants.webp';
import intercultural from '@/shared/assets/photos/intercultural-exchange-knu.webp';
import community from '@/shared/assets/photos/community-knu.webp';
import studentsFaculty from '@/shared/assets/photos/students-faculty-knu.webp';
import type { MomentKey, MomentItem } from '../model/content';

const MOMENT_PHOTOS: Record<MomentKey, string> = {
  certificateCeremony,
  coilSeriesTalk,
  studentSpeaker,
  alliance,
  oxford,
  ivec,
  jhuRolePlay,
  karunya,
  certificatesParticipants,
  intercultural,
  community,
  studentsFaculty,
};

interface MomentsGalleryProps {
  moments: MomentItem[];
}

export function MomentsGallery({ moments }: MomentsGalleryProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {moments.map((moment, index) => (
        <li
          key={moment.photo}
          className={cn(
            'relative overflow-hidden rounded-[18px] ring-1 ring-white/8 lg:rounded-[22px]',
            index === 0 ? 'col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto' : 'aspect-[4/3]',
          )}
        >
          <figure className="reveal-frame size-full">
            <ResponsiveImage
              src={MOMENT_PHOTOS[moment.photo]}
              sizes={
                index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'
              }
              alt={moment.caption}
              loading="lazy"
              decoding="async"
              className="reveal-media size-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#03122e]/90 to-transparent px-3 pt-8 pb-3 text-xs leading-4 text-white/90 lg:px-4 lg:pb-4 lg:text-sm lg:leading-5">
              {moment.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
