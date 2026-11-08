import type { EventAttendeesDto, StaffRole } from '@viratec/contracts';

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const csvCell = (value: string) => {
  const safe = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const attendeesCsvHref = (
  { attendees }: EventAttendeesDto,
  header: readonly string[],
  roleLabel: (role: StaffRole) => string | null,
) => {
  const rows = attendees.map(({ name, email, staffRole, subscribedAt, joinedAt }) =>
    [name, email, roleLabel(staffRole) ?? '', subscribedAt ?? '', joinedAt ?? '']
      .map(csvCell)
      .join(','),
  );
  const csv = [header.map(csvCell).join(','), ...rows].join('\r\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
};
