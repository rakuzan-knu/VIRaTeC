import { useEffect, useId } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import type { PublicationBlockDto } from '@viratec/contracts';
import { cleanPastedHtml } from '../lib/cleanPaste';
import { blocksToDoc, docToBlocks, toArticleBlocks } from '../model/articleDoc';
import type { SiteEditorMessages } from '../model/messages';
import { ArticleToolbar } from './ArticleToolbar';

const EXTENSIONS = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    italic: false,
    strike: false,
    underline: false,
    horizontalRule: false,
    heading: { levels: [2] },
    link: {
      openOnClick: false,
      autolink: true,
      protocols: ['mailto'],
      defaultProtocol: 'https',
      HTMLAttributes: { rel: 'noopener noreferrer', target: null },
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
];

const CONTENT_CLASS =
  'min-h-48 rounded-b-xl border border-t-0 border-white/12 bg-bg-input px-4 py-3 text-[15px] leading-6 text-text-primary outline-none focus-visible:border-viratec-cyan [&_a]:text-viratec-cyan [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-viratec-accent [&_blockquote]:pl-4 [&_blockquote_p+p]:text-[13px] [&_blockquote_p+p]:text-text-muted [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_img]:my-2 [&_img]:max-h-64 [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1.5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-viratec-cyan';

const sameBlocks = (left: readonly PublicationBlockDto[], right: readonly PublicationBlockDto[]) =>
  JSON.stringify(left) === JSON.stringify(right);

interface ArticleEditorProps {
  label: string;
  value: unknown;
  lang: string;
  readOnly: boolean;
  canUpload: boolean;
  t: SiteEditorMessages;
  onChange: (blocks: PublicationBlockDto[]) => void;
}

export function ArticleEditor({
  label,
  value,
  lang,
  readOnly,
  canUpload,
  t,
  onChange,
}: ArticleEditorProps) {
  const hintId = useId();
  const blocks = toArticleBlocks(value);
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: blocksToDoc(blocks),
    editable: !readOnly,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        'aria-describedby': hintId,
        lang,
        class: CONTENT_CLASS,
      },
      transformPastedHTML: cleanPastedHtml,
    },
    onUpdate: ({ editor: current }) => onChange(docToBlocks(current.getJSON())),
  });

  const valueKey = JSON.stringify(blocks);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = toArticleBlocks(JSON.parse(valueKey));
    if (sameBlocks(docToBlocks(editor.getJSON()), next)) return;
    editor.commands.setContent(blocksToDoc(next), { emitUpdate: false });
  }, [editor, valueKey]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  return (
    <div className="flex min-w-0 flex-col">
      <span className="mb-2 text-label font-medium text-text-primary">{label}</span>
      <p id={hintId} className="mb-2 text-[13px] text-text-muted">
        {t.article.hint}
      </p>
      {!readOnly && <ArticleToolbar editor={editor} canUpload={canUpload} t={t} />}
      <EditorContent editor={editor} />
    </div>
  );
}
