import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, Zap, FileText, Download } from 'lucide-react';
import ProductInput from './components/ProductInput';
import ContentGeneration from './components/ContentGeneration';
import CatalogEditor from './components/CatalogEditor';
import ExportCatalog from './components/ExportCatalog';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import { ProductData, CatalogData, mockCatalogData } from './types';
 import html2pdf from 'html2pdf.js';
 // @ts-ignore


type Step =  'editor' | 'export';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('editor');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [

    { id: 'editor', label: 'Catalog Editor', icon: FileText },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleProductSubmit = useCallback(async (data: ProductData) => {
    setIsProcessing(true);
    setProductData(data);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentStep('generation');
    setIsProcessing(false);
  }, []);

  const handleGenerationComplete = useCallback((data: any) => {
    setCatalogData(mockCatalogData);
    setCurrentStep('editor');
  }, []);

  const handleEditingComplete = useCallback((data: CatalogData) => {
    setCatalogData(data);
    setCurrentStep('export');
  }, []);

  const handleBackToEditor = useCallback(() => {
    setCurrentStep('editor');
  }, []);

  const handleStartOver = useCallback(() => {
    setCurrentStep('input');
    setProductData(null);
    setCatalogData(null);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    handleGenerationComplete('')

  },[])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <ProgressBar 
            steps={steps} 
            currentStep={currentStep} 
            progress={progress}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
       

         

          {currentStep === 'editor' && catalogData && (
            <CatalogEditor 
              catalogData={catalogData}
              onComplete={handleEditingComplete}
              onBack={() => { }}
            />
          )}

          {currentStep === 'export' && catalogData && (
            <ExportCatalog 
              catalogData={catalogData}
              onBackToEditor={handleBackToEditor}
              onStartOver={handleStartOver}
            />
          )}
        </div>
        
      </main>
    </div>
  );
}

export default App;