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

// Mock data for ProductData using Unsplash image
export const mockProductData: ProductData = {
  url: "https://www.example.com/product/123",
  title: "Modern Wireless Headphones",
  description: "Experience high-fidelity sound with these modern wireless headphones. Perfect for music lovers and professionals.",
  price: "$199.99",
  specifications: {
    "Battery Life": "30 hours",
    "Bluetooth": "5.2",
    "Weight": "250g",
    "Color": "Black"
  },
  images: [], // No File objects in mock, as File cannot be easily mocked outside browser
  useAutomaticImages: true,
  extractedImages: [
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
  ]
};





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

  contentBlocks: ContentBlock[];
}

// Mock data for CatalogData
export const mockCatalogData: CatalogData = {
  product: {
    url: "https://www.example.com/product/123",
    title: "Modern Wireless Headphones",
    description: "Experience high-fidelity sound with these modern wireless headphones. Perfect for music lovers and professionals.",
    price: "$199.99",
    specifications: {
      "Battery Life": "30 hours",
      "Bluetooth": "5.2",
      "Weight": "250g",
      "Color": "Black"
    },
    images: [],
    useAutomaticImages: true,
    extractedImages: [
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    ]
  },
  generatedContent: {
    title: "Modern Wireless Headphones",
    description: "Experience high-fidelity sound with these modern wireless headphones. Perfect for music lovers and professionals.",
    specifications: {
      "Battery Life": "30 hours",
      "Bluetooth": "5.2",
      "Weight": "250g",
      "Color": "Black"
    },
    features: [
      "Wireless Bluetooth 5.2 connectivity",
      "Up to 30 hours battery life",
      "Lightweight and comfortable design",
      "High-fidelity sound quality"
    ],
    benefits: [
      "Enjoy music without tangled wires",
      "Long-lasting battery for all-day use",
      "Comfortable for extended wear",
      "Crystal clear audio for immersive experience"
    ]
  },
  layout: {
    theme: "modern",
    colorScheme: "blue",
    typography: "sans"
  },
  images: [
    {
      id: "img1",
      url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
      alt: "Wireless headphones on a table",
      position: 0
    },
    {
      id: "img2",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      alt: "Person wearing wireless headphones",
      position: 1
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
      alt: "Close-up of headphone earcup",
      position: 2
    }
  ],
  contentBlocks: [
    {
      id: "block1",
      type: "imageGallery",
      content: { images: [
        {
          id: "img1",
          url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
          alt: "Wireless headphones on a table",
          position: 0
        },
        {
          id: "img2",
          url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
          alt: "Person wearing wireless headphones",
          position: 1
        },
        {
          id: "img3",
          url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
          alt: "Close-up of headphone earcup",
          position: 2
        }
      ] },
      settings: { columns: 3 }
    },
    {
      id: "block2",
      type: "title",
      content: { text: "Modern Wireless Headphones" }
    },
    {
      id: "block3",
      type: "description",
      content: { text: "Experience high-fidelity sound with these modern wireless headphones. Perfect for music lovers and professionals." }
    },
    {
      id: "block4",
      type: "price",
      content: { value: "$199.99" }
    },
    {
      id: "block5",
      type: "features",
      content: { items: [
        "Wireless Bluetooth 5.2 connectivity",
        "Up to 30 hours battery life",
        "Lightweight and comfortable design",
        "High-fidelity sound quality"
      ] },
      settings: { style: "list" }
    },
    {
      id: "block6",
      type: "specifications",
      content: { items: {
        "Battery Life": "30 hours",
        "Bluetooth": "5.2",
        "Weight": "250g",
        "Color": "Black"
      } },
      settings: { style: "table" }
    },
    {
      id: "block7",
      type: "benefits",
      content: { items: [
        "Enjoy music without tangled wires",
        "Long-lasting battery for all-day use",
        "Comfortable for extended wear",
        "Crystal clear audio for immersive experience"
      ] },
      settings: { style: "cards" }
    }
  ]
};

export interface StepProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type ContentBlockType =
  | 'title'
  | 'description'
  | 'imageGallery'
  | 'features'
  | 'specifications'
  | 'benefits'
  | 'price'
  | 'customSection';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: any;
  settings?: {
    columns?: number;
    style?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface CatalogEditorProps {
  catalogData: CatalogData;
  onComplete: (data: CatalogData) => void;
  onBack: () => void;
}

export type ActivePanel = 'content' | 'design' | 'layout' | 'blocks';
export type PreviewMode = 'desktop' | 'mobile';