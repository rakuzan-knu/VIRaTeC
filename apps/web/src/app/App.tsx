import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <div className="text-center p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 font-serif">
          VIR<span className="text-blue-600">a</span>TeC
        </h1>
        <p className="text-base text-gray-600 mt-2 font-medium">
          Virtual Innovating Research & Technology Community — КНУ імені Тараса Шевченка
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Фронтенд готовий до розробки з нуля (FSD архітектура)
        </p>
      </div>
    </div>
  );
};
