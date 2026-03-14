'use client';

import type { ValidationResult } from '@/types';
import Badge from '@/components/ui/Badge';
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react';

interface ValidationItemProps {
  result: ValidationResult;
}

const statusIcons = {
  pass: <CheckCircle className="w-4 h-4 text-green-600" />,
  fail: <XCircle className="w-4 h-4 text-red-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  pending: <Clock className="w-4 h-4 text-gray-400" />,
  manual: <Eye className="w-4 h-4 text-blue-500" />,
};

export default function ValidationItem({ result }: ValidationItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">{statusIcons[result.status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{result.label}</p>
        {result.details && (
          <p className="text-xs text-gray-500">{result.details}</p>
        )}
      </div>
      <Badge status={result.status} />
    </div>
  );
}
