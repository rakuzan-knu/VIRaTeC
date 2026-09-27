import React, { useState } from 'react';
import { ProjectCard } from '@/entities/project/ui/project-card';
import { Button } from '@viratec/ui';
import { Plus, Search } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const projects = [
    {
      title: 'KNU AI Campus Assistant',
      description:
        'Розумний асистент студента та викладача на базі відкритих мовних моделей для розкладу, навігації та наукових пошуків.',
      status: 'IN_PROGRESS',
      faculties: ['FIT', 'NNIF'],
      tags: ['React', 'Fastify', 'PyTorch', 'VectorDB'],
      leadName: 'Дмитро Сидоренко',
      repositoryUrl: 'https://github.com/viratec-knu/assistant',
      demoUrl: 'https://assistant.viratec.knu.ua',
    },
    {
      title: 'UACorpus Semantic Engine',
      description:
        'Високопродуктивний пошуковий рушій для морфологічно розміченого корпусу української мови з лінгвістичною онтологією.',
      status: 'IDEA',
      faculties: ['NNIF', 'FIT'],
      tags: ['NLP', 'Rust', 'Corpus', 'Ontology'],
      leadName: 'Катерина Романенко',
      repositoryUrl: 'https://github.com/viratec-knu/uacorpus-engine',
    },
    {
      title: 'EduCloud KNU Laboratory',
      description:
        'Хмарне середовище віртуальних лабораторій для виконання лабораторних робіт з системного програмування та кібербезпеки.',
      status: 'COMPLETED',
      faculties: ['FIT'],
      tags: ['Kubernetes', 'Docker', 'Go', 'Terraform'],
      leadName: 'Артем Павленко',
      demoUrl: 'https://educloud.knu.ua',
    },
  ];

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 font-serif">
            Інноваційні Проєкти та Стартапи
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Спільні практичні розробки студентів, аспірантів та викладачів
          </p>
        </div>
        <Button className="flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Зареєструвати проєкт
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Пошук проєктів за назвою, описом або стеком..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => (
          <ProjectCard key={proj.title} {...proj} />
        ))}
      </div>
    </div>
  );
};
