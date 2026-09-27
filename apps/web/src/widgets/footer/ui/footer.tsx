import React from 'react';
import { Atom } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg font-serif">
              <Atom className="w-5 h-5 text-blue-500" /> VIRaTeC
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Virtual Innovating Research & Technology Community у Київському національному
              університеті імені Тараса Шевченка.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Підрозділи КНУ</h4>
            <ul className="space-y-2 text-xs">
              <li>Факультет інформаційних технологій (ФІТ)</li>
              <li>Навчально-науковий інститут філології (ННІФ)</li>
              <li>Науково-дослідна частина КНУ</li>
              <li>Студентські інноваційні лабораторії</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Напрямки</h4>
            <ul className="space-y-2 text-xs">
              <li>Штучний інтелект та Machine Learning</li>
              <li>Комп'ютерна лінгвістика та NLP</li>
              <li>Кібербезпека та захист даних</li>
              <li>Хмарні та розподілені обчислення</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Контакти</h4>
            <ul className="space-y-2 text-xs">
              <li>м. Київ, вул. Богдана Гаврилишина, 24</li>
              <li>Email: contact@viratec.knu.ua</li>
              <li>GitHub: github.com/viratec-knu</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} VIRaTeC, КНУ імені Тараса Шевченка. Всі права захищено.
        </div>
      </div>
    </footer>
  );
};
