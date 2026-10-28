import type { JSONContent } from '@tiptap/react';
import { PublicationBlockSchema, type PublicationBlockDto } from '@viratec/contracts';
import { parseInline, serializeInline, type InlineSegment } from '@/entities/publication';

const HEADING_LEVEL = 2;

export const toArticleBlocks = (value: unknown): PublicationBlockDto[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const parsed = PublicationBlockSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

const textNodes = (text: string): JSONContent[] =>
  parseInline(text).map((segment) => {
    const marks = [
      ...(segment.bold ? [{ type: 'bold' }] : []),
      ...(segment.href ? [{ type: 'link', attrs: { href: segment.href } }] : []),
    ];
    return { type: 'text', text: segment.text, ...(marks.length > 0 ? { marks } : {}) };
  });

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  ...(text ? { content: textNodes(text) } : {}),
});

const blockToNode = (block: PublicationBlockDto): JSONContent => {
  switch (block.kind) {
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: HEADING_LEVEL },
        ...(block.text ? { content: textNodes(block.text) } : {}),
      };
    case 'quote':
      return {
        type: 'blockquote',
        content: [paragraph(block.text), ...(block.author ? [paragraph(block.author)] : [])],
      };
    case 'list':
      return {
        type: block.ordered ? 'orderedList' : 'bulletList',
        content: block.items.map((item) => ({ type: 'listItem', content: [paragraph(item)] })),
      };
    case 'image':
      return { type: 'image', attrs: { src: block.url, alt: block.alt, title: block.caption } };
    default:
      return paragraph(block.text);
  }
};

export const blocksToDoc = (blocks: readonly PublicationBlockDto[]): JSONContent => ({
  type: 'doc',
  content: blocks.length > 0 ? blocks.map(blockToNode) : [paragraph('')],
});

const linkHref = (node: JSONContent) => {
  const href = node.marks?.find((mark) => mark.type === 'link')?.attrs?.href;
  return typeof href === 'string' ? href : undefined;
};

const inlineOf = (node: JSONContent | undefined) =>
  serializeInline(
    (node?.content ?? []).flatMap((child): InlineSegment[] => {
      if (child.type === 'hardBreak') return [{ text: ' ', bold: false }];
      if (child.type !== 'text') return [];
      return [
        {
          text: child.text ?? '',
          bold: child.marks?.some((mark) => mark.type === 'bold') ?? false,
          href: linkHref(child),
        },
      ];
    }),
  ).trim();

const textsOf = (node: JSONContent): string[] =>
  (node.content ?? []).flatMap((child) => {
    if (child.type === 'paragraph' || child.type === 'heading') return [inlineOf(child)];
    if (child.type === 'bulletList' || child.type === 'orderedList' || child.type === 'listItem') {
      return textsOf(child);
    }
    return [];
  });

const stringAttr = (node: JSONContent, name: string) => {
  const value = node.attrs?.[name];
  return typeof value === 'string' ? value : '';
};

export const docToBlocks = (doc: JSONContent): PublicationBlockDto[] =>
  (doc.content ?? []).flatMap((node): PublicationBlockDto[] => {
    switch (node.type) {
      case 'paragraph': {
        const text = inlineOf(node);
        return text ? [{ kind: 'paragraph', text }] : [];
      }
      case 'heading': {
        const text = inlineOf(node);
        return text ? [{ kind: 'heading', text }] : [];
      }
      case 'blockquote': {
        const [text = '', ...rest] = textsOf(node).filter(Boolean);
        return text ? [{ kind: 'quote', text, author: rest.join(' ') }] : [];
      }
      case 'bulletList':
      case 'orderedList': {
        const items = (node.content ?? [])
          .map((item) => textsOf(item).filter(Boolean).join(' '))
          .filter(Boolean);
        return items.length > 0
          ? [{ kind: 'list', ordered: node.type === 'orderedList', items }]
          : [];
      }
      case 'image': {
        const url = stringAttr(node, 'src');
        return url
          ? [
              {
                kind: 'image',
                url,
                alt: stringAttr(node, 'alt'),
                caption: stringAttr(node, 'title'),
              },
            ]
          : [];
      }
      default:
        return [];
    }
  });
