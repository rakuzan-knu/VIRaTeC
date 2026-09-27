import React from 'react';
import { Card, Badge } from '@viratec/ui';
import { Code2, Globe, GitFork } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  status: string;
  faculties: string[];
  tags: string[];
  leadName?: string;
  repositoryUrl?: string;
  demoUrl?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  status,
  faculties,
  tags,
  leadName,
  repositoryUrl,
  demoUrl,
}) => {
  const statusColor: Record<string, 'blue' | 'indigo' | 'green' | 'amber' | 'gray'> = {
    IDEA: 'amber',
    IN_PROGRESS: 'blue',
    COMPLETED: 'green',
    ARCHIVED: 'gray',
  };

  return (
    <Card hoverable className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            {faculties.map((f) => (
              <Badge key={f} variant={f === 'FIT' ? 'blue' : 'indigo'}>
                {f}
              </Badge>
            ))}
          </div>
          <Badge variant={statusColor[status] || 'blue'}>{status.replace('_', ' ')}</Badge>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{title}</h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{description}</p>

        {leadName && (
          <div className="text-xs text-gray-500 mb-4">
            <span className="font-semibold text-gray-700">Керівник проєкту:</span> {leadName}
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs font-medium">
          {repositoryUrl && (
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Code2 className="w-4 h-4" /> Репозиторій
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
            >
              <Globe className="w-4 h-4" /> Live Демо
            </a>
          )}
          {!repositoryUrl && !demoUrl && (
            <span className="inline-flex items-center gap-1.5 text-gray-400">
              <GitFork className="w-4 h-4" /> Внутрішня розробка
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
