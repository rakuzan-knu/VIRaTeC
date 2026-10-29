import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { SiteEditorMessages } from '../model/messages';

const LINK_PATTERN = /^(https?:\/\/[^\s]+|mailto:[^\s]+)$/;

interface ArticleLinkFormProps {
  editor: Editor;
  href: string;
  t: SiteEditorMessages;
  onClose: () => void;
}

export function ArticleLinkForm({ editor, href, t, onClose }: ArticleLinkFormProps) {
  const [value, setValue] = useState(href);
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const url = value.trim();
    if (!LINK_PATTERN.test(url)) {
      setError(t.article.linkInvalid);
      return;
    }
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain
        .insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] })
        .run();
    } else {
      chain.extendMarkRange('link').setLink({ href: url }).run();
    }
    onClose();
  };

  return (
    <div
      className="flex flex-col gap-3 border-t border-white/8 p-3"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          apply();
        }
      }}
    >
      <Input
        label={t.article.linkLabel}
        helperText={t.article.linkHelp}
        type="url"
        inputMode="url"
        value={value}
        error={error ?? undefined}
        autoFocus
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button label={t.article.linkApply} onClick={apply} />
        {href && (
          <Button
            label={t.article.linkRemove}
            variant="secondary"
            onClick={() => {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
