import React, { useState } from 'react';
import { Card, Input, Button } from '@viratec/ui';
import { Atom, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Локальна автентифікація успішна (демо)');
    }, 800);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-lg border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white mb-3 shadow-md shadow-blue-500/30">
            <Atom className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 font-serif">Вхід у VIRaTeC</h2>
          <p className="text-xs text-gray-500 mt-1">
            Єдиний обліковий запис дослідника / студента КНУ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Корпоративна або академічна пошта"
            type="email"
            placeholder="name@knu.ua"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
            <LogIn className="w-4 h-4 mr-2" /> Увійти
          </Button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
          Ще не маєте доступу?{' '}
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Звернутися до координатора ФІТ / ННІФ
          </Link>
        </div>
      </Card>
    </div>
  );
};
