import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { RecordResource } from '@viratec/contracts';
import { Button } from '@/shared/ui/Button';
import { RecordWizard, useSiteEditorMessages } from '@/widgets/site-editor';
import { useAdminMessages } from '../model/messages';
import { adminKeys } from '../model/queries';

export function AddContentButton({
  resource,
  onCreated,
}: {
  resource: RecordResource;
  onCreated: (key: string) => void;
}) {
  const t = useAdminMessages();
  const editorT = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button label={t.content.add[resource]} onClick={() => setOpen(true)} />
      {isOpen && (
        <RecordWizard
          resource={resource}
          t={editorT}
          onClose={() => setOpen(false)}
          onCreated={(record) => {
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey: adminKeys.content() });
            onCreated(record.key);
          }}
        />
      )}
    </div>
  );
}
