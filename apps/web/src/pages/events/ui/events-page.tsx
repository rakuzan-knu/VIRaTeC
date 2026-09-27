import React, { useState } from 'react';
import { EventCard } from '@/entities/event/ui/event-card';
import { Button } from '@viratec/ui';
import { Plus } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [filterType, setFilterType] = useState('ALL');

  const events = [
    {
      title: 'KNU Interdisciplinary AI & Language Hackathon 2026',
      description:
        '48 годин інтенсивної розробки рішень на перетині технологій та філології за підтримки провідних IT-компаній України.',
      type: 'HACKATHON',
      faculty: 'FIT',
      location: 'ФІТ КНУ, вул. Богдана Гаврилишина, 24, Актова зала',
      isOnline: false,
      startDate: new Date(Date.now() + 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 9),
      capacity: 100,
      registrationLink: 'https://forms.gle/knu-hackathon-2026',
    },
    {
      title: 'Воркшоп: Сучасні векторні бази даних та RAG у наукових дослідженнях',
      description:
        'Практичний майстер-клас з побудови Retrieval-Augmented Generation систем для роботи з великими корпусами наукових текстів.',
      type: 'WORKSHOP',
      faculty: 'FIT',
      location: 'Онлайн (Zoom)',
      isOnline: true,
      startDate: new Date(Date.now() + 86400000 * 14),
      endDate: new Date(Date.now() + 86400000 * 14 + 10800000),
      capacity: 250,
      registrationLink: 'https://zoom.us/webinar/register/viratec-rag',
    },
    {
      title: 'Круглий стіл: Комп’ютерна лінгвістика в епоху генеративного ШІ',
      description:
        'Обговорення ролі лінгвістичного аналізу, валідації датасетів та культурного контексту в україномовних моделях.',
      type: 'SEMINAR',
      faculty: 'NNIF',
      location: 'ННІФ КНУ, ауд. 63 (Бульвар Тараса Шевченка, 14)',
      isOnline: false,
      startDate: new Date(Date.now() + 86400000 * 20),
      endDate: new Date(Date.now() + 86400000 * 20 + 7200000),
      capacity: 50,
      registrationLink: 'https://forms.gle/nnif-nlp-seminar',
    },
  ];

  const filtered = events.filter((e) => filterType === 'ALL' || e.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 font-serif">
            Події та Заходи Спільноти
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Конференції, хакатони, відкриті лекції та міжфакультетські семінари
          </p>
        </div>
        <Button className="flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Запропонувати подію
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'HACKATHON', 'WORKSHOP', 'SEMINAR', 'CONFERENCE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === type
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type === 'ALL' ? 'Всі типи' : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((event) => (
          <EventCard key={event.title} {...event} />
        ))}
      </div>
    </div>
  );
};
