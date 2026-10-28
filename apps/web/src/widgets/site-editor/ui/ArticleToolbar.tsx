import { useRef, useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { Heading2, ImagePlus, Link2, List, ListOrdered, Quote } from 'lucide-react';
import { absoluteImageUrl } from '@/shared/lib';
import { ACCEPTED_IMAGE_TYPES, prepareImage } from '../lib/prepareImage';
import type { SiteEditorMessages } from '../model/messages';
import { useUploadAsset } from '../model/queries';
import { ArticleImageControls } from './ArticleImageControls';
import { ArticleToolButton } from './ArticleToolButton';
import { ArticleLinkForm } from './ArticleLinkForm';

interface ArticleToolbarProps {
  editor: Editor | null;
  canUpload: boolean;
  t: SiteEditorMessages;
}

export function ArticleToolbar({ editor, canUpload, t }: ArticleToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLinkOpen, setLinkOpen] = useState(false);
  const upload = useUploadAsset();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      heading: current?.isActive('heading', { level: 2 }) ?? false,
      quote: current?.isActive('blockquote') ?? false,
      bullet: current?.isActive('bulletList') ?? false,
      ordered: current?.isActive('orderedList') ?? false,
      link: current?.isActive('link') ?? false,
      image: current?.isActive('image') ?? false,
      href: String(current?.getAttributes('link').href ?? ''),
    }),
  });
  if (!editor || !state) return null;
  const chain = () => editor.chain().focus();

  const addImage = async (file: File | undefined) => {
    if (!file) return;
    const prepared = await prepareImage(file);
    const asset = await upload.mutateAsync({
      ...prepared,
      title: file.name.replace(/\.[^.]+$/, '') || 'Image',
    });
    chain()
      .setImage({ src: absoluteImageUrl(asset.url), alt: '', title: '' })
      .run();
  };

  return (
    <div className="flex flex-col rounded-t-xl border border-white/12 bg-white/4">
      <div role="toolbar" aria-label={t.article.toolbar} className="flex flex-wrap gap-1 p-1">
        <ArticleToolButton
          label={t.article.bold}
          short={
            <>
              <span aria-hidden="true" className="font-bold">
                {t.article.boldShort}
              </span>
              <span className="sr-only">{t.article.bold}</span>
            </>
          }
          isActive={state.bold}
          onClick={() => chain().toggleBold().run()}
        />
        <ArticleToolButton
          label={t.article.heading}
          icon={Heading2}
          isActive={state.heading}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
        <ArticleToolButton
          label={t.article.quote}
          icon={Quote}
          isActive={state.quote}
          onClick={() => chain().toggleBlockquote().run()}
        />
        <ArticleToolButton
          label={t.article.list}
          icon={List}
          isActive={state.bullet}
          onClick={() => chain().toggleBulletList().run()}
        />
        <ArticleToolButton
          label={t.article.orderedList}
          icon={ListOrdered}
          isActive={state.ordered}
          onClick={() => chain().toggleOrderedList().run()}
        />
        <ArticleToolButton
          label={t.article.link}
          icon={Link2}
          isActive={state.link || isLinkOpen}
          onClick={() => setLinkOpen((open) => !open)}
        />
        {canUpload && (
          <>
            <ArticleToolButton
              label={upload.isPending ? t.article.uploading : t.article.image}
              icon={ImagePlus}
              disabled={upload.isPending}
              onClick={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={(event) => {
                void addImage(event.target.files?.[0]).finally(() => {
                  event.target.value = '';
                });
              }}
            />
          </>
        )}
      </div>
      {!canUpload && <p className="px-3 pb-2 text-[12px] text-text-subtle">{t.article.noUpload}</p>}
      {isLinkOpen && (
        <ArticleLinkForm
          key={state.href}
          editor={editor}
          href={state.href}
          t={t}
          onClose={() => setLinkOpen(false)}
        />
      )}
      {state.image && <ArticleImageControls editor={editor} t={t} />}
    </div>
  );
}
