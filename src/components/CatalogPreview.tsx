import React from 'react';
import { Star, Check, ShoppingCart } from 'lucide-react';
import { CatalogData } from '../types';

interface CatalogPreviewProps {
  catalogData: CatalogData;
  mode: 'desktop' | 'mobile';
}

const CatalogPreview: React.FC<CatalogPreviewProps> = ({ catalogData, mode }) => {
  const getColorClasses = () => {
    const scheme = catalogData.layout.colorScheme;
    switch (scheme) {
      case 'purple':
        return 'from-purple-600 to-purple-700 text-purple-600 border-purple-200 bg-purple-50';
      case 'green':
        return 'from-green-600 to-green-700 text-green-600 border-green-200 bg-green-50';
      case 'red':
        return 'from-red-600 to-red-700 text-red-600 border-red-200 bg-red-50';
      default:
        return 'from-blue-600 to-blue-700 text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  const getFontClass = () => {
    switch (catalogData.layout.typography) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  const colorClasses = getColorClasses();
  const [gradientFrom, gradientTo, textColor, borderColor, bgColor] = colorClasses.split(' ');

  const getThemeClasses = () => {
    switch (catalogData.layout.theme) {
      case 'classic':
        return {
          container: 'bg-[#f9f6f1] border border-[#e2c799] shadow-none',
          header: 'bg-gradient-to-r from-yellow-800 to-yellow-600 text-white',
          font: 'font-serif',
          section: 'bg-white border border-yellow-200',
          button: 'bg-yellow-700 hover:bg-yellow-800',
          price: 'text-yellow-900',
        };
      case 'minimal':
        return {
          container: 'bg-white border border-slate-200 shadow-none',
          header: 'bg-slate-100 text-slate-900',
          font: 'font-sans',
          section: 'bg-white border border-slate-100',
          button: 'bg-slate-900 hover:bg-slate-700',
          price: 'text-slate-900',
        };
      default: // modern
        return {
          container: 'bg-white rounded-2xl shadow-lg',
          header: `bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`,
          font: getFontClass(),
          section: `${bgColor} border-2 ${borderColor}`,
          button: `bg-gradient-to-r ${gradientFrom} ${gradientTo}`,
          price: 'text-slate-900',
        };
    }
  };
  const theme = getThemeClasses();

  return (
    <div className={`h-full overflow-hidden ${theme.container} ${mode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
      <div className={`h-full overflow-y-auto ${theme.font}`}>
        {/* Header */}
        <div className={`${theme.header} p-8`}>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{catalogData.generatedContent.title}</h1>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current text-yellow-300" />
              ))}
              <span className="ml-2 text-sm opacity-90">(4.8/5)</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 gap-4">
            {catalogData.images.slice(0, 4).map((image, index) => (
              <div key={image.id} className={`${index === 0 ? 'col-span-2' : ''} aspect-square bg-slate-100 rounded-2xl overflow-hidden`}>
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className={`${theme.section} p-6 rounded-2xl`}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Product Overview</h2>
            <p className="text-slate-700 leading-relaxed">{catalogData.generatedContent.description}</p>
          </div>

          {/* Key Features */}
          <div className={`${theme.section} p-6 rounded-2xl`}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Key Features</h2>
            <div className="grid gap-3">
              {catalogData.generatedContent.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full ${bgColor} ${textColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className={`${theme.section} p-6 rounded-2xl`}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>
            <div className={`border-2 ${borderColor} rounded-2xl overflow-hidden`}>
              {Object.entries(catalogData.generatedContent.specifications).map(([key, value], index) => (
                <div key={key} className={`flex justify-between items-center p-4 ${index % 2 === 0 ? 'bg-white' : bgColor}`}>
                  <span className="font-medium text-slate-700">{key}</span>
                  <span className="text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {catalogData.generatedContent.benefits && (
            <div className={`${theme.section} p-6 rounded-2xl`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Why Choose This Product</h2>
              <div className="grid gap-4">
                {catalogData.generatedContent.benefits.map((benefit, index) => (
                  <div key={index} className={`p-4 ${bgColor} rounded-2xl border-2 ${borderColor}`}>
                    <p className="text-slate-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & CTA */}
          <div className={`p-6 rounded-2xl text-center ${theme.section}`}>
            <div className="mb-4">
              <span className={`text-3xl font-bold ${theme.price}`}>{catalogData.product.price || '$199.99'}</span>
              {/* <span className="text-slate-600 ml-2">Free shipping included</span> */}
            </div>
            <button className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity duration-200 ${theme.button}`}>
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPreview;