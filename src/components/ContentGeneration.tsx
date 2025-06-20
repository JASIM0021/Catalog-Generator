import React, { useState, useEffect } from 'react';
import { Bot, Globe, Image, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { ProductData, CatalogData } from '../types';
import { scraperApi, aiApi, imagesApi } from '../services/api';

interface ContentGenerationProps {
  productData: ProductData;
  onComplete: (catalogData: CatalogData) => void;
}

const ContentGeneration: React.FC<ContentGenerationProps> = ({ productData, onComplete }) => {
  const [step, setStep] = useState<'scraping' | 'ai-generation' | 'image-processing' | 'complete'>('scraping');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const steps = [
    { id: 'scraping', label: 'Web Scraping', icon: Globe, description: 'Extracting product information' },
    { id: 'ai-generation', label: 'AI Content Generation', icon: Bot, description: 'Creating compelling descriptions' },
    { id: 'image-processing', label: 'Image Processing', icon: Image, description: 'Optimizing and organizing images' },
    { id: 'complete', label: 'Complete', icon: Check, description: 'Ready for editing' }
  ];

  useEffect(() => {
    const runGeneration = async () => {
      try {
        setError(null);

        // Step 1: Web Scraping
        setStep('scraping');
        setProgress(10);

        const scraped = await scraperApi.scrapeProduct(productData.url);
        setScrapedData(scraped);
        setProgress(35);

        // Step 2: AI Content Generation
        setStep('ai-generation');
        
        const aiContent = await aiApi.generateContent(scraped, {
          tone: 'professional',
          length: 'medium',
          includeFeatures: true,
          includeBenefits: true
        });
        
        setGeneratedContent(aiContent);
        setProgress(70);

        // Step 3: Image Processing
        setStep('image-processing');

        let processedImages = [];

        if (productData.useAutomaticImages) {
          // Search for stock images
          const stockImages = await imagesApi.searchUnsplash(
            aiContent.category || scraped.title,
            6,
            'landscape'
          );
          
          processedImages = stockImages.map((img, index) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            position: index
          }));
        } else if (productData.images.length > 0) {
          // Upload user images
          const uploadedImages = await imagesApi.uploadImages(productData.images);
          
          processedImages = uploadedImages.map((img, index) => ({
            id: img.id,
            url: `http://localhost:3001${img.url}`,
            alt: img.originalName,
            position: index
          }));
        }

        setProgress(100);
        setStep('complete');

        // Complete - create catalog data
        await new Promise(resolve => setTimeout(resolve, 1000));

        const catalogData: CatalogData = {
          product: {
            ...productData,
            ...scraped
          },
          generatedContent: aiContent,
          layout: {
            theme: 'modern',
            colorScheme: 'blue',
            typography: 'sans'
          },
          images: processedImages
        };

        onComplete(catalogData);

      } catch (err) {
        console.error('Generation error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during generation');
        setProgress(0);
      }
    };

    runGeneration();
  }, [productData, onComplete]);

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === step);
  const currentStepIndex = getCurrentStepIndex();

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Generation Failed
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Try Again
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
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Generating Your Catalog
            </h2>
            <p className="text-lg text-slate-600">
              Our AI is analyzing your product and creating professional content
            </p>
          </div>

          {/* Progress Overview */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Details */}
          <div className="space-y-6">
            {steps.map((stepItem, index) => {
              const isActive = stepItem.id === step;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;
              const Icon = stepItem.icon;

              return (
                <div key={stepItem.id} className={`
                  flex items-center space-x-4 p-6 rounded-2xl transition-all duration-300
                  ${isActive ? 'bg-blue-50 border-2 border-blue-200' :
                    isCompleted ? 'bg-green-50 border-2 border-green-200' :
                    'bg-slate-50 border-2 border-slate-200'
                  }
                `}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-blue-500 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-slate-300 text-slate-500'
                    }
                  `}>
                    {isActive ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      isActive ? 'text-blue-900' :
                      isCompleted ? 'text-green-900' :
                      'text-slate-600'
                    }`}>
                      {stepItem.label}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-blue-700' :
                      isCompleted ? 'text-green-700' :
                      'text-slate-500'
                    }`}>
                      {stepItem.description}
                    </p>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  )}

                  {isActive && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-medium">Processing...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preview Content */}
          {scrapedData && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Extracted Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Title:</span> {scrapedData.title}</p>
                    <p><span className="font-medium">Price:</span> {scrapedData.price || 'Not found'}</p>
                    <p><span className="font-medium">Description:</span> {scrapedData.description.substring(0, 100)}...</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Specifications</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(scrapedData.specifications).slice(0, 4).map(([key, value]) => (
                      <p key={key}><span className="font-medium">{key}:</span> {value as string}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGeneration;