import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({
  value,
  onChange,
  placeholder = 'Click to select an image',
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/heic',
    'image/heif',
    'image/avif',
  ],
}) {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    if (!acceptedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, BMP, WebP, SVG, TIFF, ICO, HEIC, AVIF, etc.)');
      return;
    }
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
      {value ? (
        <div className="relative">
          <div className="relative w-full max-w-xs mx-auto">
            <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: 1 }}>
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-3">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{placeholder}</p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, JPEG, PNG, GIF, BMP, WebP, SVG, TIFF, ICO, HEIC, AVIF (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
} 