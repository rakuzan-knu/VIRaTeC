import React from 'react';
import { getInitials } from '@viratec/utils';
import { Badge } from '@viratec/ui';

interface UserBadgeProps {
  name: string;
  role: string;
  faculty?: string;
  avatarUrl?: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ name, role, faculty, avatarUrl }) => {
  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200">
          {getInitials(name)}
        </div>
      )}
      <div>
        <div className="text-sm font-semibold text-gray-900">{name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="blue">{role}</Badge>
          {faculty && <Badge variant="indigo">{faculty}</Badge>}
        </div>
      </div>
    </div>
  );
};
