'use client';

interface BadgeProps {
  status: 'pass' | 'fail' | 'warning' | 'pending' | 'manual';
  label?: string;
}

const statusStyles = {
  pass: 'bg-green-100 text-green-700',
  fail: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-500',
  manual: 'bg-blue-100 text-blue-700',
};

const statusLabels = {
  pass: 'Pass',
  fail: 'Fail',
  warning: 'Warning',
  pending: 'Pending',
  manual: 'Manual Check',
};

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {label || statusLabels[status]}
    </span>
  );
}
