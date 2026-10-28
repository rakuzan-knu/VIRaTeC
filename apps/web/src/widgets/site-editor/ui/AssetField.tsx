import { linkId, toLink } from '../model/contentModel';
import type { SiteEditorMessages } from '../model/messages';
import { useEditorAsset } from '../model/queries';
import { ImageUploadField } from './ImageUploadField';

interface AssetFieldProps {
  label: string;
  help?: string;
  value: unknown;
  readOnly: boolean;
  required: boolean;
  t: SiteEditorMessages;
  onChange: (value: unknown) => void;
}

export function AssetField({
  label,
  help,
  value,
  readOnly,
  required,
  t,
  onChange,
}: AssetFieldProps) {
  const assetId = linkId(value);
  const { data: asset } = useEditorAsset(assetId);

  return (
    <ImageUploadField
      label={label}
      help={help}
      previewSrc={
        asset?.url ? `${asset.url}${asset.url.includes('?') ? '&' : '?'}w=640&fm=webp` : undefined
      }
      previewAlt={asset?.title ?? ''}
      hasValue={Boolean(assetId)}
      canRemove={!required}
      readOnly={readOnly}
      t={t}
      onUploaded={(uploaded) => {
        onChange(toLink('Asset', uploaded.id));
        return null;
      }}
      onRemove={() => onChange(undefined)}
    />
  );
}
