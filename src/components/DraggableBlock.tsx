import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ContentBlock, ContentBlockType } from './types';
import { Move, X } from 'lucide-react';
import { getBlockIcon, getBlockLabel } from './blockUtils';

interface DraggableBlockProps {
  block: ContentBlock;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  index,
  isSelected,
  onSelect,
  onRemove,
  moveBlock,
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
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 hover:border-slate-300'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={() => onSelect(block.id)}
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
          onRemove(block.id);
        }}
        className="text-slate-400 hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
