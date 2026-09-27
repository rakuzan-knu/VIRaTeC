import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/home/ui/home-page';
import { ResearchPage } from '@/pages/research/ui/research-page';
import { ProjectsPage } from '@/pages/projects/ui/projects-page';
import { EventsPage } from '@/pages/events/ui/events-page';
import { CommunityPage } from '@/pages/community/ui/community-page';
import { LoginPage } from '@/pages/auth/ui/login-page';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/research" element={<ResearchPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <div className="py-20 text-center">
            <h2 className="text-3xl font-bold">404 — Сторінку не знайдено</h2>
            <p className="text-gray-500 mt-2">Поверніться на головну сторінку</p>
          </div>
        }
      />
    </Routes>
  );
};
