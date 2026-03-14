'use client';

import type { ValidationResult } from '@/types';
import Card from '@/components/ui/Card';
import ValidationItem from './ValidationItem';
import { ClipboardCheck } from 'lucide-react';

interface ValidationChecklistProps {
  results: ValidationResult[];
}

export default function ValidationChecklist({ results }: ValidationChecklistProps) {
  if (results.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-gray-500">
          <ClipboardCheck className="w-5 h-5" />
          <span className="text-sm">Validations will appear after processing</span>
        </div>
      </Card>
    );
  }

  const automated = results.filter((r) => r.status !== 'manual');
  const manual = results.filter((r) => r.status === 'manual');
  const passCount = automated.filter((r) => r.status === 'pass').length;
  const totalAutomated = automated.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Validation
        </h3>
        <span className={`text-sm font-medium ${passCount === totalAutomated ? 'text-green-600' : 'text-amber-600'}`}>
          {passCount}/{totalAutomated} passed
        </span>
      </div>

      {automated.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Automated Checks</p>
          <div className="divide-y divide-gray-100">
            {automated.map((result) => (
              <ValidationItem key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {manual.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Manual Checks</p>
          <div className="divide-y divide-gray-100">
            {manual.map((result) => (
              <ValidationItem key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
