import { CheckCircle, XCircle, Clock, Info, WarningCircle } from '@phosphor-icons/react';

export type StatusType = 'present' | 'absent' | 'late' | 'excused' | 'flagged';

export const getStatusBadge = (status: StatusType) => {
  const map = {
    present: { bg: 'bg-moss-green/12', text: 'text-moss-green', icon: CheckCircle, label: 'Present' },
    absent: { bg: 'bg-soft-coral/12', text: 'text-soft-coral', icon: XCircle, label: 'Absent' },
    late: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Late' },
    excused: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info, label: 'Excused' },
    flagged: { bg: 'bg-sky-teal/12', text: 'text-sky-teal', icon: WarningCircle, label: 'Flagged' },
  };
  return map[status];
};
