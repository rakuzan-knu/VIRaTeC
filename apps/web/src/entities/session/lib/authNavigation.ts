export interface AuthNavigationState {
  from?: string;
  email?: string;
}

export const readAuthNavigationState = (state: unknown): AuthNavigationState => {
  if (typeof state !== 'object' || state === null) return {};
  const record = state as Record<string, unknown>;
  return {
    from:
      typeof record.from === 'string' &&
      record.from.startsWith('/') &&
      !record.from.startsWith('//')
        ? record.from
        : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
  };
};
