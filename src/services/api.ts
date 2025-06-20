import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

export interface ScrapedData {
  title: string;
  description: string;
  price?: string;
  specifications: Record<string, string>;
  images: Array<{
    url: string;
    alt: string;
  }>;
  url: string;
  scrapedAt: string;
}

export interface GeneratedContent {
  title: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  benefits: string[];
  keywords: string[];
  category: string;
  targetAudience: string;
  generatedAt: string;
}

export interface StockImage {
  id: string;
  url: string;
  alt: string;
  photographer: string;
  downloadUrl: string;
}

export interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

// Scraper API
export const scraperApi = {
  scrapeProduct: async (url: string): Promise<ScrapedData> => {
    const response = await api.post('/scraper/scrape', { url });
    return response.data.data;
  },
};

// AI API
export const aiApi = {
  generateContent: async (
    productData: any,
    options: {
      tone?: 'professional' | 'casual' | 'technical';
      length?: 'short' | 'medium' | 'long';
      includeFeatures?: boolean;
      includeBenefits?: boolean;
    } = {}
  ): Promise<GeneratedContent> => {
    const response = await api.post('/ai/generate-content', {
      productData,
      options,
    });
    return response.data.data;
  },

  suggestImprovements: async (productData: any): Promise<any> => {
    const response = await api.post('/ai/suggest-improvements', {
      productData,
    });
    return response.data.data;
  },
};

// Images API
export const imagesApi = {
  uploadImages: async (files: File[]): Promise<UploadedImage[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  searchUnsplash: async (
    query: string,
    count: number = 6,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Promise<StockImage[]> => {
    const response = await api.post('/images/search-unsplash', {
      query,
      count,
      orientation,
    });
    return response.data.data;
  },

  optimizeImage: async (
    imageId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    }
  ): Promise<{ url: string }> => {
    const response = await api.post(`/images/optimize/${imageId}`, options);
    return response.data.data;
  },

  deleteImage: async (imageId: string): Promise<void> => {
    await api.delete(`/images/${imageId}`);
  },
};

// Export API
export const exportApi = {
  exportPDF: async (
    catalogData: any,
    quality: 'standard' | 'high' | 'print' = 'high',
    options: {
      includeImages?: boolean;
      includeSpecs?: boolean;
      includeFeatures?: boolean;
      includeBenefits?: boolean;
    } = {}
  ): Promise<Blob> => {
    const response = await api.post(
      '/export/pdf',
      {
        catalogData,
        format: 'pdf',
        quality,
        options,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  exportDOCX: async (
    catalogData: any,
    options: {
      includeImages?: boolean;
      includeSpecs?: boolean;
      includeFeatures?: boolean;
      includeBenefits?: boolean;
    } = {}
  ): Promise<Blob> => {
    const response = await api.post(
      '/export/docx',
      {
        catalogData,
        format: 'docx',
        options,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export default api;