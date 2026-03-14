'use client';

import { useState } from 'react';
import { usePhoto } from '@/context/PhotoContext';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { Settings, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = usePhoto();
  const { settings } = state;

  const updateSetting = (key: string, value: number) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  const resetSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: DEFAULT_SETTINGS });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">Settings</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Photo Width (px)</label>
              <input
                type="number"
                value={settings.photoWidth}
                onChange={(e) => updateSetting('photoWidth', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Photo Height (px)</label>
              <input
                type="number"
                value={settings.photoHeight}
                onChange={(e) => updateSetting('photoHeight', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max File Size (KB)</label>
            <input
              type="number"
              value={settings.photoMaxSizeKB}
              onChange={(e) => updateSetting('photoMaxSizeKB', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Target Face Coverage ({settings.targetFaceCoveragePercent}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={settings.targetFaceCoveragePercent}
              onChange={(e) => updateSetting('targetFaceCoveragePercent', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              JPEG Quality ({settings.jpegQuality})
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.jpegQuality}
              onChange={(e) => updateSetting('jpegQuality', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Signature Max Size (KB)</label>
            <input
              type="number"
              value={settings.signatureMaxSizeKB}
              onChange={(e) => updateSetting('signatureMaxSizeKB', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={resetSettings} className="w-full">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Defaults
          </Button>
        </div>
      )}
    </div>
  );
}
