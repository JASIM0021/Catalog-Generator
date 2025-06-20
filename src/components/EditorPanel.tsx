import React from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import { CatalogData } from '../types';

interface EditorPanelProps {
  activePanel: 'content' | 'design' | 'layout';
  catalogData: CatalogData;
  onContentChange: (field: string, value: any) => void;
  onLayoutChange: (field: string, value: any) => void;
  onImageReorder: (images: any[]) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  activePanel,
  catalogData,
  onContentChange,
  onLayoutChange,
  onImageReorder
}) => {

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...catalogData.generatedContent.features];
    newFeatures[index] = value;
    onContentChange('features', newFeatures);
  };

  const addFeature = () => {
    const newFeatures = [...catalogData.generatedContent.features, ''];
    onContentChange('features', newFeatures);
  };


  const removeFeature = (index: number) => {
    const newFeatures = catalogData.generatedContent.features.filter((_, i) => i !== index);
    onContentChange('features', newFeatures);
  };


    const addSpecification = () => {
      const newSpecs = { ...(catalogData.generatedContent.specifications || {}) };
      let newKey = '';
      let i = 1;
      while (newSpecs.hasOwnProperty(`New Spec ${i}`)) i++;
      newKey = `New Spec ${i}`;
      newSpecs[newKey] = '';
      onContentChange('specifications', newSpecs);
    };

    const handleSpecificationChange = (oldKey: string, newKey: string, newValue: string) => {
      const specs = { ...(catalogData.generatedContent.specifications || {}) };
      if (oldKey !== newKey) {
        delete specs[oldKey];
      }
      specs[newKey] = newValue;
      onContentChange('specifications', specs);
    };

    const removeSpecification = (key: string) => {
      const specs = { ...(catalogData.generatedContent.specifications || {}) };
      delete specs[key];
      onContentChange('specifications', specs);
    };
  
   const handlewhychoseUs = (index: number, value: string) => {
     const newFeatures = [...catalogData.generatedContent.benefits];
     newFeatures[index] = value;
     onContentChange('benefits', newFeatures);
   };

   const addWhyChoseUs = () => {
     const newFeatures = [...catalogData.generatedContent.benefits, ''];
     onContentChange('benefits', newFeatures);
   };

   const removeWhyChoseUs = (index: number) => {
     const newFeatures = catalogData.generatedContent.benefits.filter(
       (_, i) => i !== index,
     );
     onContentChange('benefits', newFeatures);
   };
  


  const renderContentPanel = () => (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Product Title
        </label>
        <input
          type="text"
          value={catalogData.generatedContent.title}
          onChange={e => onContentChange('title', e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Description
        </label>
        <textarea
          value={catalogData.generatedContent.description}
          onChange={e => onContentChange('description', e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-700">
            Key Features
          </label>
          <button
            onClick={addFeature}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {catalogData.generatedContent.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={feature}
                onChange={e => handleFeatureChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter feature..."
              />
              <button
                onClick={() => removeFeature(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-700">
            Specifications
          </label>
          <button
            onClick={addSpecification}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(
            catalogData.generatedContent.specifications || {},
          ).map(([key, value], index) => (
            <div key={key + index} className="flex items-center space-x-2">
              <input
                type="text"
                value={key}
                onChange={e =>
                  handleSpecificationChange(key, e.target.value, value)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Key"
              />
              <input
                type="text"
                value={value}
                onChange={e =>
                  handleSpecificationChange(key, key, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Value"
              />
              <button
                onClick={() => removeSpecification(key)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/*  Why chose product page  */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-700">
            Why Choose This Product
          </label>
          <button
            onClick={addWhyChoseUs}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-3">
          {catalogData.generatedContent.benefits.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={feature}
                onChange={e => handlewhychoseUs(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter feature..."
              />
              <button
                onClick={() => removeWhyChoseUs(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Price
        </label>
        <input
          type="text"
          value={catalogData.product.price}
          onChange={e => onContentChange('price', e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderDesignPanel = () => (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Theme</label>
        <div className="grid grid-cols-1 gap-3">
          {['modern', 'classic', 'minimal'].map(theme => (
            <button
              key={theme}
              onClick={() => onLayoutChange('theme', theme)}
              className={`p-4 text-left border-2 rounded-xl transition-colors duration-200 ${
                catalogData.layout.theme === theme
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-medium capitalize">{theme}</div>
              <div className="text-sm text-slate-600 mt-1">
                {theme === 'modern' && 'Clean lines and contemporary styling'}
                {theme === 'classic' && 'Traditional and professional layout'}
                {theme === 'minimal' && 'Simple and focused design'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Color Scheme</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'blue', color: 'bg-blue-500' },
            { name: 'purple', color: 'bg-purple-500' },
            { name: 'green', color: 'bg-green-500' },
            { name: 'red', color: 'bg-red-500' }
          ].map(scheme => (
            <button
              key={scheme.name}
              onClick={() => onLayoutChange('colorScheme', scheme.name)}
              className={`flex items-center space-x-3 p-3 border-2 rounded-xl transition-colors duration-200 ${
                catalogData.layout.colorScheme === scheme.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${scheme.color}`} />
              <span className="capitalize font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Typography</label>
        <div className="space-y-3">
          {[
            { name: 'sans', label: 'Sans Serif', font: 'font-sans' },
            { name: 'serif', label: 'Serif', font: 'font-serif' },
            { name: 'mono', label: 'Monospace', font: 'font-mono' }
          ].map(typography => (
            <button
              key={typography.name}
              onClick={() => onLayoutChange('typography', typography.name)}
              className={`w-full p-3 text-left border-2 rounded-xl transition-colors duration-200 ${
                catalogData.layout.typography === typography.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`font-medium ${typography.font}`}>{typography.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayoutPanel = () => (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Image Order & Editing</label>
        <div className="space-y-3">
          {catalogData.images.map((image, index) => (
            <div key={image.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
              <img
                src={image.url}
                alt={image.alt}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">Image {index + 1}</div>
                <div className="text-xs text-slate-600">{image.alt}</div>
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id={`replace-image-${index}`}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newImages = [...catalogData.images];
                    newImages[index] = {
                      ...newImages[index],
                      url: URL.createObjectURL(file),
                      alt: file.name
                    };
                    onImageReorder(newImages);
                  }
                }}
              />
              <label htmlFor={`replace-image-${index}`} className="text-blue-500 hover:text-blue-700 cursor-pointer text-xs mr-2">Replace</label>
              <button
                className="text-red-500 hover:text-red-700 text-xs"
                onClick={() => {
                  const newImages = catalogData.images.filter((_, i) => i !== index);
                  onImageReorder(newImages);
                }}
              >Remove</button>
            </div>
          ))}
          {/* Add Image Button */}
          {catalogData.images.length < 15 && (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="add-image-input"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newImages = [
                      ...catalogData.images,
                      {
                        id: `${Date.now()}-${file.name}`,
                        url: URL.createObjectURL(file),
                        alt: file.name,
                        position: catalogData.images.length
                      }
                    ];
                    onImageReorder(newImages);
                  }
                }}
              />
              <label htmlFor="add-image-input" className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium flex items-center">
                <span className="mr-2">+</span> Add Image
              </label>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Layout Options</label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Show specifications table</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Include feature highlights</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show pricing section</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {activePanel === 'content' && renderContentPanel()}
      {activePanel === 'design' && renderDesignPanel()}
      {activePanel === 'layout' && renderLayoutPanel()}
    </>
  );
};

export default EditorPanel;