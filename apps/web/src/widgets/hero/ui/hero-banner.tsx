import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@viratec/ui';
import { Sparkles, ArrowRight, BookOpen, Rocket } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-gray-50 py-20 sm:py-28 border-b border-gray-100">
      {/* Decorative gradient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/15 to-indigo-400/15 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Міжнародна освітня та наукова мережа КНУ імені Тараса Шевченка
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15] max-w-4xl mx-auto font-serif">
          Об'єднуємо <span className="text-blue-600">Технології</span>,{' '}
          <span className="text-indigo-600">Науку</span> та{' '}
          <span className="text-blue-700">Інновації</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Синергія Факультету інформаційних технологій (ФІТ), Навчально-наукового інституту
          філології (ННІФ) та партнерів для проривних досліджень і стартапів.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/research">
            <Button size="lg" className="flex items-center gap-2 shadow-lg shadow-blue-600/25">
              <BookOpen className="w-4 h-4" /> Дослідження <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="lg" variant="outline" className="flex items-center gap-2 bg-white">
              <Rocket className="w-4 h-4" /> Інноваційні Проєкти
            </Button>
          </Link>
        </div>

        {/* Highlight stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center border-t border-gray-200/80 pt-10">
          <div>
            <div className="text-3xl font-extrabold text-blue-600">12+</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Наукових лабораторій</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-600">50+</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Активних проєктів</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-700">100+</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Наукових публікацій</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">500+</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Дослідників та студентів</div>
          </div>
        </div>
      </div>
    </div>
  );
};
