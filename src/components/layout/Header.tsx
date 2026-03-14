'use client';

import { Camera } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Passport Photo Processor</h1>
            <p className="text-sm text-gray-500">Process photos for Passport Seva portal</p>
          </div>
        </div>
      </div>
    </header>
  );
}
