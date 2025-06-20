import React, { useState } from 'react';
import { ArrowLeft, Eye, Settings, Palette, Type, Layout, Save } from 'lucide-react';
import { CatalogData } from '../types';
import CatalogPreview from './CatalogPreview';
import EditorPanel from './EditorPanel';
import { Margin, usePDF } from 'react-to-pdf';

interface CatalogEditorProps {
  catalogData: CatalogData;
  onComplete: (data: CatalogData) => void;
  onBack: () => void;
}

const CatalogEditor: React.FC<CatalogEditorProps> = ({ catalogData, onComplete, onBack }) => {
  const [editedData, setEditedData] = useState<CatalogData>(catalogData);
  const [activePanel, setActivePanel] = useState<'content' | 'design' | 'layout'>('content');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
   const { toPDF, targetRef } = usePDF({
     filename: 'use-pdf.pdf',
     page: { margin: Margin.MEDIUM},
   });
  const handleContentChange = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      product: {
        ...prev.product,
          [field]: value
      },
      generatedContent: {
        ...prev.generatedContent,
        [field]: value
      }
    }));
  };

  const handleLayoutChange = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value
      }
    }));
  };

  const handleImageReorder = (images: any[]) => {
    setEditedData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSave = () => {
    onComplete(editedData);
  };

  const panels = [
    { id: 'content', label: 'Content', icon: Type },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Catalog Editor
                </h2>
                <p className="text-slate-600">Customize your product catalog</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    previewMode === 'desktop'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    previewMode === 'mobile'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mobile
                </button>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Save & Continue</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[800px]">
          {/* Editor Sidebar */}
          <div className="w-80 border-r border-slate-200 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-slate-200">
              {panels.map(panel => {
                const Icon = panel.icon;
                return (
                  <button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors duration-200 ${
                      activePanel === panel.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{panel.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <EditorPanel
                activePanel={activePanel}
                catalogData={editedData}
                onContentChange={handleContentChange}
                onLayoutChange={handleLayoutChange}
                onImageReorder={handleImageReorder}
              />
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-slate-50 p-6" ref={targetRef}>
            <div className="h-full">
              <CatalogPreview catalogData={editedData} mode={previewMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogEditor;