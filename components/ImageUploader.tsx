import React, { useRef, useState } from 'react';
import { IconUpload } from './Icons';
import { MemeTemplate } from '../types';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
}

const TEMPLATES: MemeTemplate[] = [
  { id: '1', name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
  { id: '2', name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
  { id: '3', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  { id: '4', name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const processUrl = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) onImageSelect(result);
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.error("Failed to load template", e);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6">
      <div 
        className={`
          border-3 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-purple-500 bg-purple-500/10 scale-[1.01]' 
            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-500'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-gray-700 rounded-full text-purple-400">
            <IconUpload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-200">Upload your image</h3>
            <p className="text-gray-400 mt-1">or drag and drop here</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Or choose a trending template</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map((template) => (
            <button 
              key={template.id}
              onClick={() => processUrl(template.url)}
              className="group relative rounded-xl overflow-hidden aspect-square border border-gray-700 hover:border-purple-500 transition-all"
            >
              {/* Using proxy for CORS if needed, but for now assuming direct access or allow-list */}
              <img 
                src={template.url} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Use This</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
