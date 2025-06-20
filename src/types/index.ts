export interface ProductData {
  url: string;
  title?: string;
  description?: string;
  price?: string;
  specifications?: Record<string, string>;
  images: File[];
  useAutomaticImages: boolean;
  extractedImages?: string[];
}

export interface CatalogData {
  product: ProductData;
  generatedContent: {
    title: string;
    description: string;
    specifications: Record<string, string>;
    features: string[];
    benefits: string[];
  };
  layout: {
    theme: 'modern' | 'classic' | 'minimal';
    colorScheme: 'blue' | 'purple' | 'green' | 'red';
    typography: 'sans' | 'serif' | 'mono';
  };
  images: {
    id: string;
    url: string;
    alt: string;
    position: number;
  }[];
}

export interface StepProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}