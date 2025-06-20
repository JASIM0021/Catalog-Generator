import React, { useState, useCallback, useRef } from 'react';
import { Upload, Link, Image, AlertCircle, X, HandIcon as GripVertical } from 'lucide-react';
import { ProductData } from '../types';

interface ProductInputProps {
  onSubmit: (data: ProductData) => void;
  isProcessing: boolean;
}

const ProductInput: React.FC<ProductInputProps> = ({ onSubmit, isProcessing }) => {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [useAutomaticImages, setUseAutomaticImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; images?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    );

    if (images.length + imageFiles.length > 15) {
      setErrors(prev => ({ ...prev, images: 'Maximum 15 images allowed' }));
      return;
    }

    setImages(prev => [...prev, ...imageFiles]);
    setErrors(prev => ({ ...prev, images: undefined }));
  }, [images.length]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    );

    if (images.length + imageFiles.length > 15) {
      setErrors(prev => ({ ...prev, images: 'Maximum 15 images allowed' }));
      return;
    }

    setImages(prev => [...prev, ...imageFiles]);
    setErrors(prev => ({ ...prev, images: undefined }));
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { url?: string; images?: string } = {};
    
    if (!url.trim()) {
      newErrors.url = 'Product URL is required';
    } else if (!validateUrl(url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!useAutomaticImages && images.length === 0) {
      newErrors.images = 'Please upload at least one image or enable automatic images';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        url,
        images,
        useAutomaticImages
      });
    }
  }, [url, images, useAutomaticImages, onSubmit]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Create Your Product Catalog
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start by providing a product URL. Our AI will scrape the details and help you create a professional catalog.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* URL Input */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-slate-700 mb-3">
                Product URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product-page"
                  className={`
                    block w-full pl-12 pr-4 py-4 text-base border rounded-2xl
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-colors duration-200
                    ${errors.url 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-300'
                    }
                  `}
                />
              </div>
              {errors.url && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.url}
                </div>
              )}
            </div>

            {/* Automatic Images Toggle */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-slate-600" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Automatic Stock Images</h3>
                    <p className="text-sm text-slate-600">Use AI to find relevant product images from Unsplash</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAutomaticImages}
                    onChange={(e) => setUseAutomaticImages(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            {!useAutomaticImages && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Product Images (Max 15)
                </label>
                
                {/* Upload Area */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200
                    ${dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : errors.images
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className={`
                    mx-auto h-12 w-12 mb-4
                    ${dragActive ? 'text-blue-500' : 'text-slate-400'}
                  `} />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Drop images here or click to upload
                  </h3>
                  <p className="text-slate-600 mb-4">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                  >
                    Choose Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {errors.images && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.images}
                  </div>
                )}

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">
                      Uploaded Images ({images.length}/15)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <GripVertical className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className={`
                  inline-flex items-center px-8 py-4 text-base font-semibold rounded-2xl
                  transition-all duration-200 transform
                  ${isProcessing
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  'Generate Catalog'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductInput;