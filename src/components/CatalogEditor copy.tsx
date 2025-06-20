import React, { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Eye,
  Settings,
  Palette,
  Type,
  Layout,
  Save,
  Image as ImageIcon,
  Plus,
  X,
  Move,
  List,
  Grid,
  DollarSign,
  Battery,
  Bluetooth,
  Feather,
  Headphones,
} from 'lucide-react';
import { CatalogData, ProductData } from '../types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

interface CatalogEditorProps {
  catalogData: CatalogData;
  onComplete: (data: CatalogData) => void;
  onBack: () => void;
}

type ContentBlockType =
  | 'title'
  | 'description'
  | 'imageGallery'
  | 'features'
  | 'specifications'
  | 'benefits'
  | 'price'
  | 'customSection';

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: any;
  settings?: {
    columns?: number;
    style?: string;
  };
}

const CatalogEditor: React.FC<CatalogEditorProps> = ({
  catalogData,
  onComplete,
  onBack,
}) => {
  // Initialize with default blocks if none exist
  const [editedData, setEditedData] = useState<
    CatalogData & { contentBlocks?: ContentBlock[] }
  >({
    ...catalogData,
    contentBlocks: catalogData.contentBlocks || [
      {
        id: uuidv4(),
        type: 'imageGallery',
        content: { images: catalogData.images },
        settings: { columns: 3 },
      },
      {
        id: uuidv4(),
        type: 'title',
        content: { text: catalogData.generatedContent.title },
      },
      {
        id: uuidv4(),
        type: 'description',
        content: { text: catalogData.generatedContent.description },
      },
      {
        id: uuidv4(),
        type: 'price',
        content: { value: catalogData.product.price },
      },
      {
        id: uuidv4(),
        type: 'features',
        content: { items: catalogData.generatedContent.features },
        settings: { style: 'list' },
      },
      {
        id: uuidv4(),
        type: 'specifications',
        content: { items: catalogData.generatedContent.specifications },
        settings: { style: 'table' },
      },
      {
        id: uuidv4(),
        type: 'benefits',
        content: { items: catalogData.generatedContent.benefits },
        settings: { style: 'cards' },
      },
    ],
  });

  const [activePanel, setActivePanel] = useState<
    'content' | 'design' | 'layout' | 'blocks'
  >('blocks');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop',
  );
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Handle image uploads
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      // In a real app, you would upload to a server here
      const newImages = Array.from(files).map(file => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        alt: file.name.split('.')[0], // Use filename without extension as alt
        position: editedData.images.length,
      }));

      setEditedData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        contentBlocks: prev.contentBlocks?.map(block =>
          block.type === 'imageGallery'
            ? {
                ...block,
                content: {
                  ...block.content,
                  images: [...block.content.images, ...newImages],
                },
              }
            : block,
        ),
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle block content changes
  const handleBlockChange = (blockId: string, newContent: any) => {
    setEditedData(prev => ({
      ...prev,
      contentBlocks:
        prev.contentBlocks?.map(block =>
          block.id === blockId ? { ...block, content: newContent } : block,
        ) || [],
    }));
  };

  // Handle block settings changes
  const handleBlockSettingsChange = (blockId: string, newSettings: any) => {
    setEditedData(prev => ({
      ...prev,
      contentBlocks:
        prev.contentBlocks?.map(block =>
          block.id === blockId
            ? { ...block, settings: { ...block.settings, ...newSettings } }
            : block,
        ) || [],
    }));
  };

  // Add a new content block
  const addContentBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      content: getDefaultContentForType(type),
      settings: getDefaultSettingsForType(type),
    };

    setEditedData(prev => ({
      ...prev,
      contentBlocks: [...(prev.contentBlocks || []), newBlock],
    }));
    setSelectedBlock(newBlock.id);
  };

  // Remove a content block
  const removeContentBlock = (blockId: string) => {
    setEditedData(prev => ({
      ...prev,
      contentBlocks:
        prev.contentBlocks?.filter(block => block.id !== blockId) || [],
    }));
    setSelectedBlock(null);
  };

  // Reorder blocks
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setEditedData(prev => {
      const blocks = [...(prev.contentBlocks || [])];
      const draggedBlock = blocks[dragIndex];
      blocks.splice(dragIndex, 1);
      blocks.splice(hoverIndex, 0, draggedBlock);
      return { ...prev, contentBlocks: blocks };
    });
  }, []);

  // Get default content for a block type
  const getDefaultContentForType = (type: ContentBlockType): any => {
    switch (type) {
      case 'title':
        return { text: 'New Title' };
      case 'description':
        return { text: 'Enter description here...' };
      case 'imageGallery':
        return { images: [] };
      case 'features':
        return { items: ['Feature 1', 'Feature 2'] };
      case 'specifications':
        return { items: { 'Spec 1': 'Value 1', 'Spec 2': 'Value 2' } };
      case 'benefits':
        return { items: ['Benefit 1', 'Benefit 2'] };
      case 'price':
        return { value: '$0.00', originalValue: '', discount: '' };
      case 'customSection':
        return { title: '', content: '' };
      default:
        return {};
    }
  };

  // Get default settings for a block type
  const getDefaultSettingsForType = (type: ContentBlockType): any => {
    switch (type) {
      case 'imageGallery':
        return { columns: 3, aspectRatio: 'square' };
      case 'features':
        return { style: 'list', columns: 1 };
      case 'specifications':
        return { style: 'table', columns: 2 };
      case 'benefits':
        return { style: 'cards', columns: 3 };
      default:
        return {};
    }
  };
const handleLayoutChange = (key: string, value: any) => {
  setEditedData(prev => ({
    ...prev,
    layout: {
      ...prev.layout,
      [key]: value,
    },
  }));
};
  // Draggable block component
  const DraggableBlock: React.FC<{ block: ContentBlock; index: number }> = ({
    block,
    index,
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'BLOCK',
      item: { id: block.id, index },
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: 'BLOCK',
      hover: (item: { id: string; index: number }) => {
        if (item.index !== index) {
          moveBlock(item.index, index);
          item.index = index;
        }
      },
    }));

    return (
      <div
        ref={node => drag(drop(node))}
        className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${
          selectedBlock === block.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        onClick={() => setSelectedBlock(block.id)}
      >
        <div className="flex items-center space-x-3">
          <Move className="w-4 h-4 text-slate-400 cursor-move" />
          <div className="flex items-center space-x-2">
            {getBlockIcon(block.type)}
            <span className="text-sm font-medium">
              {getBlockLabel(block.type)}
            </span>
          </div>
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            removeContentBlock(block.id);
          }}
          className="text-slate-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Helper functions for block UI
  const getBlockIcon = (type: ContentBlockType) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'title':
        return <Type className={iconClass} />;
      case 'description':
        return <Type className={iconClass} />;
      case 'imageGallery':
        return <ImageIcon className={iconClass} />;
      case 'features':
        return <List className={iconClass} />;
      case 'specifications':
        return (
          <div className="flex space-x-1">
            <Battery className={iconClass} />
            <Bluetooth className={iconClass} />
          </div>
        );
      case 'benefits':
        return <Headphones className={iconClass} />;
      case 'price':
        return <DollarSign className={iconClass} />;
      case 'customSection':
        return <Plus className={iconClass} />;
      default:
        return <Type className={iconClass} />;
    }
  };

  const getBlockLabel = (type: ContentBlockType) => {
    switch (type) {
      case 'title':
        return 'Title';
      case 'description':
        return 'Description';
      case 'imageGallery':
        return 'Image Gallery';
      case 'features':
        return 'Features';
      case 'specifications':
        return 'Specifications';
      case 'benefits':
        return 'Benefits';
      case 'price':
        return 'Price';
      case 'customSection':
        return 'Custom Section';
      default:
        return 'Block';
    }
  };

  const availableBlockTypes: ContentBlockType[] = [
    'title',
    'description',
    'imageGallery',
    'features',
    'specifications',
    'benefits',
    'price',
    'customSection',
  ];

  return (
    <DndProvider backend={HTML5Backend}>
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
                    Advanced Catalog Editor
                  </h2>
                  <p className="text-slate-600">
                    Customize every aspect of your product catalog
                  </p>
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
                  onClick={() => onComplete(editedData)}
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
                <button
                  onClick={() => setActivePanel('blocks')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors duration-200 ${
                    activePanel === 'blocks'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Blocks</span>
                </button>
                <button
                  onClick={() => setActivePanel('content')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors duration-200 ${
                    activePanel === 'content'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Content</span>
                </button>
                <button
                  onClick={() => setActivePanel('design')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors duration-200 ${
                    activePanel === 'design'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Design</span>
                </button>
                <button
                  onClick={() => setActivePanel('layout')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors duration-200 ${
                    activePanel === 'layout'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layout className="w-4 h-4" />
                  <span>Layout</span>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activePanel === 'blocks' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Add Content Blocks
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableBlockTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => addContentBlock(type)}
                            className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            {getBlockIcon(type)}
                            <span className="text-xs mt-1">
                              {getBlockLabel(type)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Your Content Blocks
                      </h3>
                      <div className="space-y-2">
                        {editedData.contentBlocks?.map((block, index) => (
                          <DraggableBlock
                            key={block.id}
                            block={block}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activePanel === 'content' && selectedBlock && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Edit{' '}
                      {getBlockLabel(
                        editedData.contentBlocks?.find(
                          b => b.id === selectedBlock,
                        )?.type || 'block',
                      )}
                    </h3>

                    {(() => {
                      const block = editedData.contentBlocks?.find(
                        b => b.id === selectedBlock,
                      );
                      if (!block) return null;

                      switch (block.type) {
                        case 'title':
                        case 'description':
                          return (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Text
                              </label>
                              <textarea
                                value={block.content.text}
                                onChange={e =>
                                  handleBlockChange(block.id, {
                                    ...block.content,
                                    text: e.target.value,
                                  })
                                }
                                className="w-full p-2 border border-slate-300 rounded-md"
                                rows={block.type === 'description' ? 4 : 2}
                              />
                            </div>
                          );
                        case 'imageGallery':
                          return (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Images
                              </label>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Upload Images
                                </label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={e =>
                                    e.target.files &&
                                    handleImageUpload(e.target.files)
                                  }
                                  className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {uploadingImages && (
                                  <p className="text-sm text-slate-500 mt-1">
                                    Uploading...
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                {block.content.images?.map(
                                  (image: any, idx: number) => (
                                    <div
                                      key={image.id}
                                      className="flex items-center space-x-2 p-2 border rounded"
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                      <div className="flex-1 truncate text-sm">
                                        {image.alt}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            images: block.content.images.filter(
                                              (img: any) => img.id !== image.id,
                                            ),
                                          })
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        case 'features':
                        case 'benefits':
                          return (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                {block.type === 'features'
                                  ? 'Features'
                                  : 'Benefits'}
                              </label>
                              <div className="space-y-2">
                                {block.content.items?.map(
                                  (item: string, index: number) => (
                                    <div key={index} className="flex space-x-2">
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={e => {
                                          const newItems = [
                                            ...block.content.items,
                                          ];
                                          newItems[index] = e.target.value;
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            items: newItems,
                                          });
                                        }}
                                        className="flex-1 p-2 border border-slate-300 rounded-md"
                                      />
                                      <button
                                        onClick={() => {
                                          const newItems = [
                                            ...block.content.items,
                                          ];
                                          newItems.splice(index, 1);
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            items: newItems,
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ),
                                )}
                                <button
                                  onClick={() =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      items: [...block.content.items, ''],
                                    })
                                  }
                                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add{' '}
                                  {block.type === 'features'
                                    ? 'Feature'
                                    : 'Benefit'}
                                </button>
                              </div>
                            </div>
                          );
                        case 'specifications':
                          return (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Specifications
                              </label>
                              <div className="space-y-2">
                                {Object.entries(block.content.items || {}).map(
                                  ([key, value], index) => (
                                    <div
                                      key={index}
                                      className="grid grid-cols-5 gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={key}
                                        onChange={e => {
                                          const newItems = {
                                            ...block.content.items,
                                          };
                                          delete newItems[key];
                                          newItems[e.target.value] =
                                            value as string;
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            items: newItems,
                                          });
                                        }}
                                        className="col-span-2 p-2 border border-slate-300 rounded-md"
                                      />
                                      <input
                                        type="text"
                                        value={value as string}
                                        onChange={e => {
                                          const newItems = {
                                            ...block.content.items,
                                          };
                                          newItems[key] = e.target.value;
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            items: newItems,
                                          });
                                        }}
                                        className="col-span-2 p-2 border border-slate-300 rounded-md"
                                      />
                                      <button
                                        onClick={() => {
                                          const newItems = {
                                            ...block.content.items,
                                          };
                                          delete newItems[key];
                                          handleBlockChange(block.id, {
                                            ...block.content,
                                            items: newItems,
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ),
                                )}
                                <button
                                  onClick={() =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      items: {
                                        ...block.content.items,
                                        ['New Spec']: 'Value',
                                      },
                                    })
                                  }
                                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Specification
                                </button>
                              </div>
                            </div>
                          );
                        case 'price':
                          return (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Current Price
                                </label>
                                <input
                                  type="text"
                                  value={block.content.value}
                                  onChange={e =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Original Price (optional)
                                </label>
                                <input
                                  type="text"
                                  value={block.content.originalValue || ''}
                                  onChange={e =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      originalValue: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md"
                                  placeholder="$0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Discount Text (optional)
                                </label>
                                <input
                                  type="text"
                                  value={block.content.discount || ''}
                                  onChange={e =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      discount: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md"
                                  placeholder="e.g. 20% off"
                                />
                              </div>
                            </div>
                          );
                        case 'customSection':
                          return (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Section Title
                                </label>
                                <input
                                  type="text"
                                  value={block.content.title}
                                  onChange={e =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Content
                                </label>
                                <textarea
                                  value={block.content.content}
                                  onChange={e =>
                                    handleBlockChange(block.id, {
                                      ...block.content,
                                      content: e.target.value,
                                    })
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md"
                                  rows={4}
                                />
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                )}

                {activePanel === 'design' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Color Scheme
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {['blue', 'purple', 'green', 'red'].map(color => (
                          <button
                            key={color}
                            onClick={() =>
                              handleLayoutChange('colorScheme', color)
                            }
                            className={`h-10 rounded-md border-2 ${
                              editedData.layout.colorScheme === color
                                ? 'border-blue-500'
                                : 'border-transparent'
                            } bg-${color}-500`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Typography</h3>
                      <div className="space-y-2">
                        {['sans', 'serif', 'mono'].map(font => (
                          <button
                            key={font}
                            onClick={() =>
                              handleLayoutChange('typography', font)
                            }
                            className={`w-full p-3 rounded-md border ${
                              editedData.layout.typography === font
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:bg-slate-50'
                            } text-left`}
                          >
                            <span className={`font-${font}`}>
                              {font === 'sans' &&
                                'Sans-serif (Clean and modern)'}
                              {font === 'serif' &&
                                'Serif (Traditional and elegant)'}
                              {font === 'mono' &&
                                'Monospace (Technical and precise)'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedBlock && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Block Styling
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Background Color
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {[
                                'transparent',
                                'white',
                                'slate-100',
                                'blue-50',
                                'purple-50',
                              ].map(color => (
                                <button
                                  key={color}
                                  className={`h-8 rounded-md border ${
                                    color === 'transparent'
                                      ? 'border-slate-300'
                                      : 'border-transparent'
                                  } ${
                                    color === 'transparent'
                                      ? 'bg-white'
                                      : `bg-${color}`
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activePanel === 'layout' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Page Layout
                      </h3>
                      <div className="space-y-2">
                        {['modern', 'classic', 'minimal'].map(theme => (
                          <button
                            key={theme}
                            onClick={() => handleLayoutChange('theme', theme)}
                            className={`w-full p-3 rounded-md border ${
                              editedData.layout.theme === theme
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:bg-slate-50'
                            } text-left`}
                          >
                            <span className="capitalize">{theme}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedBlock && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Block Layout
                        </h3>
                        <div className="space-y-4">
                          {editedData.contentBlocks?.find(
                            b => b.id === selectedBlock,
                          )?.type === 'imageGallery' && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Number of Columns
                              </label>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4].map(cols => (
                                  <button
                                    key={cols}
                                    onClick={() =>
                                      handleBlockSettingsChange(selectedBlock, {
                                        columns: cols,
                                      })
                                    }
                                    className={`w-10 h-10 rounded-md border ${
                                      editedData.contentBlocks?.find(
                                        b => b.id === selectedBlock,
                                      )?.settings?.columns === cols
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {cols}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {['features', 'benefits'].includes(
                            editedData.contentBlocks?.find(
                              b => b.id === selectedBlock,
                            )?.type || '',
                          ) && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Display Style
                              </label>
                              <div className="space-y-2">
                                {['list', 'cards', 'grid'].map(style => (
                                  <button
                                    key={style}
                                    onClick={() =>
                                      handleBlockSettingsChange(selectedBlock, {
                                        style,
                                      })
                                    }
                                    className={`w-full p-2 rounded-md border ${
                                      editedData.contentBlocks?.find(
                                        b => b.id === selectedBlock,
                                      )?.settings?.style === style
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                    } text-left capitalize`}
                                  >
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-50 p-6 overflow-auto">
              <div className="h-full">
                {/* In a real implementation, you would use your CatalogPreview component here */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Catalog Preview</h2>
                  <div className="space-y-6">
                    {editedData.contentBlocks?.map(block => (
                      <div
                        key={block.id}
                        className={`p-4 rounded-lg border ${
                          selectedBlock === block.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-slate-200'
                        }`}
                        onClick={() => setSelectedBlock(block.id)}
                      >
                        {block.type === 'title' && (
                          <h1 className="text-3xl font-bold">
                            {block.content.text}
                          </h1>
                        )}

                        {block.type === 'description' && (
                          <p className="text-slate-600">{block.content.text}</p>
                        )}

                        {block.type === 'imageGallery' && (
                          <div
                            className={`grid gap-4 ${
                              block.settings?.columns === 1
                                ? 'grid-cols-1'
                                : block.settings?.columns === 2
                                ? 'grid-cols-2'
                                : block.settings?.columns === 3
                                ? 'grid-cols-3'
                                : 'grid-cols-4'
                            }`}
                          >
                            {block.content.images?.map((image: any) => (
                              <img
                                key={image.id}
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-auto rounded-md object-cover"
                              />
                            ))}
                          </div>
                        )}

                        {block.type === 'features' && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3">
                              Features
                            </h3>
                            {block.settings?.style === 'cards' ? (
                              <div className="grid grid-cols-2 gap-4">
                                {block.content.items?.map(
                                  (item: string, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 border rounded-lg bg-slate-50"
                                    >
                                      {item}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <ul className="list-disc pl-5 space-y-1">
                                {block.content.items?.map(
                                  (item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                        )}

                        {block.type === 'specifications' && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3">
                              Specifications
                            </h3>
                            <table className="w-full">
                              <tbody>
                                {Object.entries(block.content.items || {}).map(
                                  ([key, value]) => (
                                    <tr
                                      key={key}
                                      className="border-b border-slate-200"
                                    >
                                      <td className="py-2 font-medium">
                                        {key}
                                      </td>
                                      <td className="py-2 text-slate-600">
                                        {value as string}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {block.type === 'benefits' && (
                          <div>
                            <h3 className="text-xl font-semibold mb-3">
                              Benefits
                            </h3>
                            {block.settings?.style === 'cards' ? (
                              <div className="grid grid-cols-3 gap-4">
                                {block.content.items?.map(
                                  (item: string, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 border rounded-lg bg-slate-50"
                                    >
                                      {item}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <ul className="list-disc pl-5 space-y-1">
                                {block.content.items?.map(
                                  (item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                        )}

                        {block.type === 'price' && (
                          <div className="flex items-baseline space-x-4">
                            <span className="text-3xl font-bold">
                              {block.content.value}
                            </span>
                            {block.content.originalValue && (
                              <span className="text-xl text-slate-500 line-through">
                                {block.content.originalValue}
                              </span>
                            )}
                            {block.content.discount && (
                              <span className="text-red-600 font-medium">
                                {block.content.discount}
                              </span>
                            )}
                          </div>
                        )}

                        {block.type === 'customSection' && (
                          <div>
                            <h3 className="text-xl font-semibold mb-2">
                              {block.content.title || 'Custom Section'}
                            </h3>
                            <p>
                              {block.content.content ||
                                'Add your custom content here...'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default CatalogEditor;


