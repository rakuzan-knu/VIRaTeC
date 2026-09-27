import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@viratec/ui';
import { Atom, BookOpen, Rocket, Calendar, MessageSquare, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Головна', path: '/', icon: Atom },
    { name: 'Дослідження', path: '/research', icon: BookOpen },
    { name: 'Проєкти', path: '/projects', icon: Rocket },
    { name: 'Події', path: '/events', icon: Calendar },
    { name: 'Спільнота', path: '/community', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Atom className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-950 font-serif">
                VIR<span className="text-blue-600">a</span>TeC
              </span>
              <span className="block text-[10px] tracking-wider font-semibold uppercase text-gray-400">
                КНУ Шевченка • ФІТ + ННІФ
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /> Увійти
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
