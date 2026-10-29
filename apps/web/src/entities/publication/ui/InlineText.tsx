import { parseInline } from '../lib/inline';

export function InlineText({ text }: { text: string }) {
  return parseInline(text).map((segment, index) => {
    const content = segment.href ? (
      <a
        href={segment.href}
        target={segment.href.startsWith('mailto:') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className="text-viratec-cyan underline underline-offset-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      >
        {segment.text}
      </a>
    ) : (
      segment.text
    );
    return segment.bold ? (
      <strong key={index} className="font-semibold text-white">
        {content}
      </strong>
    ) : (
      <span key={index}>{content}</span>
    );
  });
}
