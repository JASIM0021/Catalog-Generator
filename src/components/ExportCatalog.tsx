import React, { useState } from 'react';
import { Download, FileText, File, Settings, ArrowLeft, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { CatalogData } from '../types';
import { exportApi } from '../services/api';

interface ExportCatalogProps {
  catalogData: CatalogData;
  onBackToEditor: () => void;
  onStartOver: () => void;
}

const ExportCatalog: React.FC<ExportCatalogProps> = ({ catalogData, onBackToEditor, onStartOver }) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx'>('pdf');
  const [quality, setQuality] = useState<'standard' | 'high' | 'print'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'High-quality PDF perfect for printing and sharing',
      icon: FileText,
      size: '2.4 MB',
      features: ['Vector graphics', 'Print-ready', 'Universal compatibility']
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Editable DOCX format for further customization',
      icon: File,
      size: '1.8 MB',
      features: ['Fully editable', 'Template structure', 'Easy collaboration']
    }
  ];

  const qualityOptions = [
    { id: 'standard', name: 'Standard Quality', description: '150 DPI - Good for digital sharing', size: '1.2 MB' },
    { id: 'high', name: 'High Quality', description: '300 DPI - Perfect for most printing', size: '2.4 MB' },
    { id: 'print', name: 'Print Quality', description: '600 DPI - Professional printing ready', size: '4.8 MB' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      let blob: Blob;
      const filename = `${catalogData.generatedContent.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

      if (selectedFormat === 'pdf') {
        blob = await exportApi.exportPDF(catalogData, quality, {
          includeImages: true,
          includeSpecs: true,
          includeFeatures: true,
          includeBenefits: true
        });
      } else {
        blob = await exportApi.exportDOCX(catalogData, {
          includeImages: true,
          includeSpecs: true,
          includeFeatures: true,
          includeBenefits: true
        });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportComplete(true);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Export Failed</h2>
            <p className="text-lg text-slate-600 mb-8">{error}</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setError(null)}
                className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onBackToEditor}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span>Back to Editor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (exportComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Export Complete!</h2>
            <p className="text-lg text-slate-600 mb-8">
              Your product catalog has been successfully generated and downloaded.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onBackToEditor}
                className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Editor</span>
              </button>
              <button
                onClick={onStartOver}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Create New Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Export Your Catalog</h2>
            <p className="text-lg text-slate-600">
              Choose your preferred format and quality settings
            </p>
          </div>

          <div className="space-y-8">
            {/* Format Selection */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Export Format</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {formatOptions.map(format => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id as any)}
                      className={`p-6 text-left border-2 rounded-2xl transition-all duration-200 ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50 transform scale-105'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedFormat === format.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{format.name}</h4>
                          <p className="text-sm text-slate-600 mb-3">{format.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">~{format.size}</span>
                            <div className="flex flex-wrap gap-1">
                              {format.features.map(feature => (
                                <span key={feature} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Settings - Only for PDF */}
            {selectedFormat === 'pdf' && (
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Quality Settings</h3>
                <div className="space-y-3">
                  {qualityOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setQuality(option.id as any)}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-colors duration-200 ${
                        quality === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">{option.name}</h4>
                          <p className="text-sm text-slate-600">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-500">~{option.size}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Info */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Export Summary</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Product:</span>
                  <p className="font-medium text-slate-900">{catalogData.generatedContent.title}</p>
                </div>
                <div>
                  <span className="text-slate-600">Format:</span>
                  <p className="font-medium text-slate-900">{formatOptions.find(f => f.id === selectedFormat)?.name}</p>
                </div>
                {selectedFormat === 'pdf' && (
                  <div>
                    <span className="text-slate-600">Quality:</span>
                    <p className="font-medium text-slate-900">{qualityOptions.find(q => q.id === quality)?.name}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-600">Images:</span>
                  <p className="font-medium text-slate-900">{catalogData.images.length} images included</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={onBackToEditor}
                className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Editor</span>
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`
                  flex items-center space-x-2 px-8 py-4 text-base font-semibold rounded-2xl
                  transition-all duration-200 transform
                  ${isExporting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export Catalog</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCatalog;