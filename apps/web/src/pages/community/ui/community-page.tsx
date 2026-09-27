import React, { useState } from 'react';
import { Card, Button, Badge } from '@viratec/ui';
import { formatDateTimeUkrainian } from '@viratec/utils';
import { MessageSquare, Heart, Plus, Tag } from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      title: 'Шукаємо дослідників з NLP для проєкту аналізу українського історичного дискурсу',
      content:
        'Лабораторія інтелектуальних систем ФІТ спільно з кафедрою загального мовознавства ННІФ запрошує магістрантів та аспірантів приєднатися до створення анотованого датасету. Необхідні знання Python / PyTorch або досвід лінгвістичного аналізу.',
      author: 'Д-р Тарас Коваленко',
      role: 'RESEARCHER',
      faculty: 'FIT',
      tags: ['NLP', 'Collaboration', 'FIT', 'NNIF'],
      likes: 14,
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      id: '2',
      title: 'Анонс: Студентський хакатон з кібербезпеки та хмарних технологій',
      content:
        'У листопаді відбудеться CTF та змагання з побудови захищеної хмарної інфраструктури. Команди формуються від 3 до 5 осіб. Готуйтеся!',
      author: 'Олексій Мороз',
      role: 'STUDENT',
      faculty: 'FIT',
      tags: ['Cybersecurity', 'CTF', 'Hackathon'],
      likes: 29,
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
  ]);

  const handleLike = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 font-serif">
            Спільнота та Дискусії
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Обговорення досліджень, пошук однодумців та колаборації між факультетами
          </p>
        </div>
        <Button className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Створити пост
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{post.author}</span>
                <Badge variant="blue">{post.role}</Badge>
                <Badge variant="indigo">{post.faculty}</Badge>
              </div>
              <span className="text-xs text-gray-400">
                {formatDateTimeUkrainian(post.createdAt)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-950">{post.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {post.tags.map((t) => (
                  <span key={t} className="text-xs text-gray-500 font-medium">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span>Відповісти</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
