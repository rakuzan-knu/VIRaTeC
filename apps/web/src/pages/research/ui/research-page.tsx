import React, { useState } from 'react';
import { PaperCard } from '@/entities/research/ui/paper-card';
import { Button } from '@viratec/ui';
import { Search, Plus } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const papers = [
    {
      title: 'Neural Architectures for Low-Resource Ukrainian NLP',
      abstract:
        'Дослідження сучасних моделей обробки природної мови для української мови, оптимізація токенізації та дистиляція трансформерів.',
      authors: ['Д-р Тарас Коваленко', 'Ірина Мельник'],
      faculty: 'FIT',
      keywords: ['NLP', 'Transformers', 'LLM', 'Ukrainian'],
      createdAt: new Date(),
      doi: '10.1109/VIRATEC.2026.01',
      fileUrl: 'https://viratec.knu.ua/papers/nlp-transformers.pdf',
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
    {
      title: 'Криптографічний захист персональних медичних даних у розподілених сховищах',
      abstract:
        'Розробка протоколу шифрування на основі гомоморфних схем для безпечного обміну даними між університетськими госпіталями.',
      authors: ['Доц. Віталій Яценко'],
      faculty: 'FIT',
      keywords: ['Cybersecurity', 'Cryptography', 'Privacy'],
      createdAt: new Date(),
    },
  ];

  const filteredPapers = papers.filter((p) => {
    const matchesFaculty = selectedFaculty === 'ALL' || p.faculty === selectedFaculty;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFaculty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 font-serif">
            Наукові дослідження та публікації
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Відкритий каталог наукових робіт лабораторій VIRaTeC, ФІТ та ННІФ
          </p>
        </div>
        <Button className="flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Додати дослідження
        </Button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук за назвою, авторами чи ключовими словами..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-500 font-medium">Підрозділ:</span>
          {['ALL', 'FIT', 'NNIF'].map((fac) => (
            <button
              key={fac}
              onClick={() => setSelectedFaculty(fac)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedFaculty === fac
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {fac === 'ALL' ? 'Всі підрозділи' : fac}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((paper) => (
          <PaperCard key={paper.title} {...paper} />
        ))}
      </div>
    </div>
  );
};
