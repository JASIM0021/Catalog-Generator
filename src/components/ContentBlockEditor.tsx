import React from 'react';
import { CatalogData, ContentBlock } from '../types';

interface ContentBlockEditorProps {
  block: ContentBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
  catalogData: CatalogData;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  block,
  onChange,
  catalogData,
}) => {
  const handleContentChange = (field: string, value: any) => {
    onChange({
      content: {
        ...block.content,
        [field]: value,
      },
    });
  };

  const handleSettingChange = (field: string, value: any) => {
    onChange({
      settings: {
        ...block.settings,
        [field]: value,
      },
    });
  };

  switch (block.type) {
    case 'title':
    case 'description':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Text Content
          </label>
          <textarea
            value={block.content.text}
            onChange={e => handleContentChange('text', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
            rows={3}
          />
        </div>
      );
    case 'price':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Price
          </label>
          <input
            type="text"
            value={block.content.value}
            onChange={e => handleContentChange('value', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
          />
        </div>
      );
    case 'imageGallery':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Number of Columns
          </label>
          <select
            value={block.settings?.columns || 3}
            onChange={e => handleSettingChange('columns', parseInt(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-md"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {block.content.images && block.content.images.map((img: any, idx: number) => (
              <div key={img.id || idx} className="relative group">
                <img src={img.url} alt={img.alt} className="w-full h-20 object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                  onClick={() => {
                    const newImages = block.content.images.filter((_: any, i: number) => i !== idx);
                    handleContentChange('images', newImages);
                  }}
                >×</button>
              </div>
            ))}
            {block.content.images && block.content.images.length < 15 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded h-20 cursor-pointer hover:border-blue-400">
                <span className="text-xs text-slate-400">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const newImages = [
                        ...block.content.images,
                        {
                          id: `${Date.now()}-${file.name}`,
                          url: URL.createObjectURL(file),
                          alt: file.name,
                          position: block.content.images.length
                        }
                      ];
                      handleContentChange('images', newImages);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      );
    case 'features':
    case 'benefits': {
      const items = block.content.items || [];
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            {block.type === 'features' ? 'Features' : 'Benefits'}
          </label>
          {items.map((item: string, idx: number) => (
            <div key={idx} className="flex items-center space-x-2 mb-1">
              <input
                type="text"
                value={item}
                onChange={e => {
                  const newItems = [...items];
                  newItems[idx] = e.target.value;
                  handleContentChange('items', newItems);
                }}
                className="flex-1 p-2 border border-slate-300 rounded"
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  const newItems = items.filter((_: string, i: number) => i !== idx);
                  handleContentChange('items', newItems);
                }}
              >Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => handleContentChange('items', [...items, ''])}
          >Add {block.type === 'features' ? 'Feature' : 'Benefit'}</button>
        </div>
      );
    }
    case 'specifications': {
      const items = block.content.items || {};
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Specifications</label>
          {Object.entries(items).map(([key, value], idx) => (
            <div key={key + idx} className="flex items-center space-x-2 mb-1">
              <input
                type="text"
                value={key}
                placeholder="Key"
                onChange={e => {
                  const newItems = { ...items };
                  const newKey = e.target.value;
                  if (newKey !== key) {
                    newItems[newKey] = newItems[key];
                    delete newItems[key];
                  }
                  handleContentChange('items', newItems);
                }}
                className="p-2 border border-slate-300 rounded"
              />
              <input
                type="text"
                value={String(value)}
                placeholder="Value"
                onChange={e => {
                  const newItems = { ...items, [key]: e.target.value };
                  handleContentChange('items', newItems);
                }}
                className="p-2 border border-slate-300 rounded"
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  const newItems = { ...items };
                  delete newItems[key];
                  handleContentChange('items', newItems);
                }}
              >Remove</button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => handleContentChange('items', { ...items, '': '' })}
          >Add Specification</button>
        </div>
      );
    }
    case 'customSection':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Custom Section Content</label>
          <textarea
            value={block.content.text || ''}
            onChange={e => handleContentChange('text', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
            rows={4}
          />
        </div>
      );
    default:
      return (
        <div className="text-slate-500 text-sm">
          Edit options for this block type are not yet implemented.
        </div>
      );
  }
};

export default ContentBlockEditor;
