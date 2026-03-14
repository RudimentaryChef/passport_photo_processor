'use client';

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({ progress, label, className = '' }: ProgressBarProps) {
  return (
    <div className={className}>
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
    </div>
  );
}
