import { useEditorState, type Editor } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import type { SiteEditorMessages } from '../model/messages';
import { AltHint } from './AltHint';

interface ArticleImageControlsProps {
  editor: Editor;
  t: SiteEditorMessages;
}

export function ArticleImageControls({ editor, t }: ArticleImageControlsProps) {
  const attrs = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      alt: String(current.getAttributes('image').alt ?? ''),
      caption: String(current.getAttributes('image').title ?? ''),
    }),
  });
  const update = (values: Record<string, string>) =>
    editor.chain().updateAttributes('image', values).run();

  return (
    <div className="flex flex-col gap-3 border-t border-white/8 p-3">
      <Input
        label={t.article.imageAlt}
        value={attrs.alt}
        maxLength={300}
        onChange={(event) => update({ alt: event.target.value })}
      />
      <AltHint values={{ en: attrs.alt, uk: attrs.alt }} t={t} />
      <Input
        label={t.article.imageCaption}
        value={attrs.caption}
        maxLength={300}
        onChange={(event) => update({ title: event.target.value })}
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteSelection().run()}
        className="inline-flex min-h-6 cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 text-[13px] text-text-muted hover:bg-white/6 hover:text-state-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
        {t.article.imageRemove}
      </button>
    </div>
  );
}
