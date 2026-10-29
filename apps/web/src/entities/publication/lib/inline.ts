export interface InlineSegment {
  text: string;
  bold: boolean;
  href?: string;
}

const TOKEN_PATTERN = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g;
const LINK_PATTERN = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g;

const parseLinks = (text: string, bold: boolean): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: text.slice(last, index), bold });
    segments.push({ text: match[1] ?? '', bold, href: match[2] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), bold });
  return segments;
};

export const parseInline = (text: string): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: text.slice(last, index), bold: false });
    if (match[1] !== undefined) segments.push(...parseLinks(match[1], true));
    else segments.push({ text: match[2] ?? '', bold: false, href: match[3] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), bold: false });
  return segments.filter((segment) => segment.text.length > 0);
};

const sameMarks = (left: InlineSegment, right: InlineSegment) =>
  left.bold === right.bold && left.href === right.href;

const linkText = (segment: InlineSegment) =>
  segment.href ? `[${segment.text}](${segment.href})` : segment.text;

export const serializeInline = (segments: readonly InlineSegment[]) => {
  const merged = segments.reduce<InlineSegment[]>((result, segment) => {
    const previous = result[result.length - 1];
    if (previous && sameMarks(previous, segment)) {
      result[result.length - 1] = { ...previous, text: previous.text + segment.text };
    } else if (segment.text) {
      result.push({ ...segment });
    }
    return result;
  }, []);
  const runs = merged.reduce<InlineSegment[][]>((result, segment) => {
    const run = result[result.length - 1];
    if (run?.[0]?.bold === segment.bold) run.push(segment);
    else result.push([segment]);
    return result;
  }, []);
  return runs
    .map((run) => {
      const text = run.map(linkText).join('');
      return run[0]?.bold ? `**${text}**` : text;
    })
    .join('');
};
