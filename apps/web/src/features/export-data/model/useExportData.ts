import { useMutation } from '@tanstack/react-query';
import { exportDataRequest } from '../api/exportData';

const downloadJson = (data: unknown, fileName: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function useExportData() {
  return useMutation({
    mutationFn: exportDataRequest,
    onSuccess: (data) =>
      downloadJson(data, `viratec-data-${new Date().toISOString().slice(0, 10)}.json`),
  });
}
