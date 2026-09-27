import React from 'react';
import { Card, Badge, Button } from '@viratec/ui';
import { formatDateTimeUkrainian } from '@viratec/utils';
import { Calendar, MapPin, Video, Users } from 'lucide-react';

interface EventCardProps {
  title: string;
  description: string;
  type: string;
  faculty: string;
  location: string;
  isOnline: boolean;
  startDate: string | Date;
  endDate: string | Date;
  capacity?: number;
  registrationLink?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  type,
  faculty,
  location,
  isOnline,
  startDate,
  capacity,
  registrationLink,
}) => {
  return (
    <Card hoverable className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="blue">{type}</Badge>
          <Badge variant={faculty === 'FIT' ? 'blue' : 'indigo'}>{faculty}</Badge>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{title}</h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{description}</p>

        <div className="space-y-2 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{formatDateTimeUkrainian(startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Video className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="line-clamp-1">{location}</span>
          </div>
          {capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Ліміт місць: {capacity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        {registrationLink ? (
          <a href={registrationLink} target="_blank" rel="noreferrer" className="block w-full">
            <Button size="sm" className="w-full">
              Зареєструватися
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            Реєстрація незабаром
          </Button>
        )}
      </div>
    </Card>
  );
};
