import React from 'react';
import { HeroBanner } from '@/widgets/hero/ui/hero-banner';
import { PaperCard } from '@/entities/research/ui/paper-card';
import { ProjectCard } from '@/entities/project/ui/project-card';
import { EventCard } from '@/entities/event/ui/event-card';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Rocket, Calendar } from 'lucide-react';

export const HomePage: React.FC = () => {
  const samplePapers = [
    {
      title: 'Neural Architectures for Low-Resource Ukrainian NLP',
      abstract:
        'Дослідження сучасних моделей обробки природної мови для української мови, оптимізація токенізації та дистиляція трансформерів.',
      authors: ['Д-р Тарас Коваленко', 'Ірина Мельник'],
      faculty: 'FIT',
      keywords: ['NLP', 'Transformers', 'LLM', 'Ukrainian'],
      createdAt: new Date(),
      doi: '10.1109/VIRATEC.2026.01',
    },
    {
      title: 'Автоматичний аналіз семантичних зв’язків у корпусі української класики',
      abstract:
        'Спільне дослідження комп’ютерних лінгвістів ННІФ та розробників ФІТ щодо вилучення сутностей та аналізу тональності.',
      authors: ['Проф. Олена Грищенко', 'Максим Бондар'],
      faculty: 'NNIF',
      keywords: ['Computational Linguistics', 'Corpus', 'Semantics'],
      createdAt: new Date(),
      doi: '10.1109/VIRATEC.2026.02',
    },
  ];

  const sampleProjects = [
    {
      title: 'KNU AI Campus Assistant',
      description:
        'Розумний асистент студента та викладача на базі відкритих мовних моделей для розкладу, навігації та наукових пошуків.',
      status: 'IN_PROGRESS',
      faculties: ['FIT', 'NNIF'],
      tags: ['React', 'Fastify', 'PyTorch', 'VectorDB'],
      leadName: 'Дмитро Сидоренко',
      repositoryUrl: 'https://github.com/viratec-knu/assistant',
    },
  ];

  const sampleEvents = [
    {
      title: 'KNU Interdisciplinary AI & Language Hackathon',
      description:
        '48 годин інтенсивної розробки рішень на перетині технологій та філології за підтримки провідних IT-компаній України.',
      type: 'HACKATHON',
      faculty: 'FIT',
      location: 'ФІТ КНУ, корпус №2, Велика актова зала',
      isOnline: false,
      startDate: new Date(Date.now() + 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 9),
      capacity: 100,
    },
  ];

  return (
    <div className="space-y-16">
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Research highlights */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Останні дослідження та публікації
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Наукові праці та дослідження науковців ФІТ, ННІФ та колег КНУ
              </p>
            </div>
            <Link
              to="/research"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Всі дослідження <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {samplePapers.map((paper) => (
              <PaperCard key={paper.title} {...paper} />
            ))}
          </div>
        </section>

        {/* Projects highlights */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-600" /> Інноваційні розробки
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Практичні стартапи та інженерні рішення спільноти
              </p>
            </div>
            <Link
              to="/projects"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Всі проєкти <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </section>

        {/* Events highlights */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" /> Найближчі події
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Воркшопи, наукові семінари, хакатони та зустрічі
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Календар подій <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleEvents.map((event) => (
              <EventCard key={event.title} {...event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
