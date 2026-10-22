import { Prisma, ProfileVisibility } from '@prisma/client';

export const PUBLIC_PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  showEmail: true,
  avatarUrl: true,
  role: true,
  faculty: true,
  department: true,
  bio: true,
  skills: true,
  studyLevel: true,
  studyYear: true,
  institution: true,
  country: true,
  languages: true,
  links: true,
  openTo: true,
  visibility: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type PublicProfileRecord = Prisma.UserGetPayload<{ select: typeof PUBLIC_PROFILE_SELECT }>;

export function toPublicProfile({ email, showEmail, ...profile }: PublicProfileRecord) {
  return { ...profile, email: showEmail ? email : null };
}

export const visibleTo = (viewerId: string | null): Prisma.UserWhereInput =>
  viewerId
    ? {
        OR: [
          { visibility: { in: [ProfileVisibility.PUBLIC, ProfileVisibility.MEMBERS] } },
          { id: viewerId },
        ],
      }
    : { visibility: ProfileVisibility.PUBLIC };
