const PARAGRAPH_SEPARATOR = /\n\s*\n/;

export function Paragraphs({ text }: { text: string }) {
  return text
    .split(PARAGRAPH_SEPARATOR)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>);
}
