import React from 'react';
import { ContentBlock } from '../types';


interface DesignPanelProps {
  selectedBlock: ContentBlock | null;
  layout: any;
  onLayoutChange: (key: string, value: any) => void;
  onBlockSettingsChange: (settings: any) => void;
}

const colorOptions = [
  { value: 'transparent', label: 'Transparent', bgClass: 'bg-transparent' },
  { value: 'white', label: 'White', bgClass: 'bg-white' },
  { value: 'slate-100', label: 'Light Gray', bgClass: 'bg-slate-100' },
  { value: 'blue-50', label: 'Light Blue', bgClass: 'bg-blue-50' },
  { value: 'purple-50', label: 'Light Purple', bgClass: 'bg-purple-50' },
];

const textColorOptions = [
  { value: 'slate-900', label: 'Black', textClass: 'text-slate-900' },
  { value: 'slate-700', label: 'Dark Gray', textClass: 'text-slate-700' },
  { value: 'blue-600', label: 'Blue', textClass: 'text-blue-600' },
  { value: 'purple-600', label: 'Purple', textClass: 'text-purple-600' },
];

export const DesignPanel: React.FC<DesignPanelProps> = ({
  selectedBlock,
  layout,
  onLayoutChange,
  onBlockSettingsChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Color Scheme</h3>
        <div className="grid grid-cols-4 gap-3">
          {['blue', 'purple', 'green', 'red'].map(color => (
            <button
              key={color}
              onClick={() => onLayoutChange('colorScheme', color)}
              className={`h-10 rounded-md border-2 ${
                layout.colorScheme === color
                  ? 'border-blue-500'
                  : 'border-transparent'
              } bg-${color}-500`}
              aria-label={`${color} color scheme`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Typography</h3>
        <div className="space-y-2">
          {[
            { value: 'sans', label: 'Sans-serif (Clean and modern)' },
            { value: 'serif', label: 'Serif (Traditional and elegant)' },
            { value: 'mono', label: 'Monospace (Technical and precise)' },
          ].map(font => (
            <button
              key={font.value}
              onClick={() => onLayoutChange('typography', font.value)}
              className={`w-full p-3 rounded-md border ${
                layout.typography === font.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:bg-slate-50'
              } text-left`}
            >
              <span className={`font-${font.value}`}>{font.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedBlock && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Block Styling</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Background Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onBlockSettingsChange({ backgroundColor: option.value })
                    }
                    className={`h-8 rounded-md border ${
                      option.value === 'transparent'
                        ? 'border-slate-300'
                        : 'border-transparent'
                    } ${option.bgClass} ${
                      selectedBlock.settings?.backgroundColor === option.value
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    aria-label={option.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Text Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {textColorOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onBlockSettingsChange({ textColor: option.value })
                    }
                    className={`h-8 rounded-md border border-transparent ${
                      option.textClass
                    } bg-white ${
                      selectedBlock.settings?.textColor === option.value
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    aria-label={option.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
