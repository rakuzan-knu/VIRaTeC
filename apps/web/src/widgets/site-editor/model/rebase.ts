import { sameValue } from './contentModel';

type Path = readonly string[];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readAt = (value: unknown, path: Path): unknown =>
  path.reduce<unknown>((current, key) => (isObject(current) ? current[key] : undefined), value);

const writeAt = <T extends Record<string, unknown>>(target: T, path: Path, value: unknown): T => {
  const [key, ...rest] = path;
  if (key === undefined) return target;
  if (rest.length === 0) {
    const { [key]: _previous, ...others } = target;
    return (value === undefined ? others : { ...others, [key]: value }) as T;
  }
  const child = target[key];
  return { ...target, [key]: writeAt(isObject(child) ? child : {}, rest, value) };
};

export const changedPaths = (base: unknown, next: unknown, prefix: Path = []): Path[] => {
  if (isObject(base) && isObject(next)) {
    const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
    return [...keys].flatMap((key) => changedPaths(base[key], next[key], [...prefix, key]));
  }
  return sameValue(base, next) ? [] : [prefix];
};

export const changeGroup = (key: string, base: unknown, next: unknown) =>
  `${key}:${changedPaths(base, next)
    .map((path) => path.join('.'))
    .sort()
    .join('|')}`;

export const rebaseDraft = <T extends Record<string, unknown>>(
  latest: T,
  base: T,
  draft: T,
  keepMine = false,
) => {
  const paths = changedPaths(base, draft);
  const conflicts = paths.filter((path) => {
    const theirs = readAt(latest, path);
    return !sameValue(theirs, readAt(base, path)) && !sameValue(theirs, readAt(draft, path));
  });
  const merged = paths.reduce(
    (current, path) => writeAt(current, path, readAt(draft, path)),
    latest,
  );
  return { merged, hasConflict: conflicts.length > 0 && !keepMine };
};
