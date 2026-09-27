import React from 'react';
import { Card, Badge } from '@viratec/ui';
import { formatDateUkrainian } from '@viratec/utils';
import { FileText, ExternalLink } from 'lucide-react';

interface PaperCardProps {
  title: string;
  abstract: string;
  authors: string[];
  faculty: string;
  keywords: string[];
  createdAt: string | Date;
  doi?: string;
  fileUrl?: string;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  title,
  abstract,
  authors,
  faculty,
  keywords,
  createdAt,
  doi,
  fileUrl,
}) => {
  return (
    <Card hoverable className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={faculty === 'FIT' ? 'blue' : 'indigo'}>{faculty}</Badge>
          <span className="text-xs text-gray-500">{formatDateUkrainian(createdAt)}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{title}</h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{abstract}</p>

        <div className="text-xs text-gray-500 mb-4">
          <span className="font-semibold text-gray-700">Автори:</span> {authors.join(', ')}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {keywords.map((kw) => (
            <Badge key={kw} variant="gray">
              #{kw}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-blue-600 font-medium">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Документ
            </a>
          )}
          {doi && (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-3.5 h-3.5" /> DOI: {doi}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
