import { useMutation } from '@tanstack/react-query';
import type { UpdateProfileRequestDto } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { updateProfileRequest } from '../api/updateProfile';

const CLEARED_PROFILE_DETAILS: UpdateProfileRequestDto = {
  department: '',
  bio: '',
  skills: [],
  studyLevel: null,
  studyYear: null,
  institution: '',
  country: null,
  languages: [],
  links: {},
  openTo: [],
};

export function useClearProfileDetails() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => updateProfileRequest(CLEARED_PROFILE_DETAILS),
    onSuccess: (account) => setUser(account),
  });
}

export function useUpdateProfile() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: (dto: UpdateProfileRequestDto) => updateProfileRequest(dto),
    onSuccess: (account) => setUser(account),
  });
}
