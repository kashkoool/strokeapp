import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { storeUserImage, generateImageId } from '../utils/indexedDB';

// Local image handling utilities
const validateImageFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check file size (5MB limit for user uploads)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      const maxWidth = 1024;
      const maxHeight = 1024;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.85 // Higher quality for user uploads
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
};

const processAndStoreImage = async (file, imageType, identifier) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file size
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      throw new Error(`File size must be less than ${maxFileSize / (1024 * 1024)}MB`);
    }

    // Compress image if it's large
    let processedFile = file;
    if (file.size > 1 * 1024 * 1024) { // Compress if larger than 1MB
      processedFile = await compressImage(file);
    }

    // Convert to base64
    const base64Data = await blobToBase64(processedFile);

    // Generate unique ID for the image
    const imageId = generateImageId(imageType, identifier);

         // Store in IndexedDB
     const imageData = {
       id: imageId,
       type: imageType,
       base64Data: base64Data,
       originalName: file.name,
       size: processedFile.size,
       bodyPartId: imageType === 'bodypart' ? identifier : null,
       symptomId: imageType === 'symptom' ? identifier : null,
       contactId: imageType === 'contact' ? identifier : null,
       foodId: imageType === 'food' ? identifier : null,
       phraseId: imageType === 'phrase' ? identifier : null
     };

    await storeUserImage(imageData);

    return {
      success: true,
      imageId: imageId,
      data: base64Data,
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1)
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export default function FileSystemImageUpload({ 
  value, 
  onChange, 
  placeholder = "Upload an image",
  imageType = 'bodypart', // 'bodypart' or 'symptom'
  identifier = null, // bodyPartId or symptomId
  onStorageKeyChange = null
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setUploadInfo(null);
    setUploading(true);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check if we have the required parameters
      if (!imageType || !identifier) {
        throw new Error('Missing image type or identifier');
      }

      // Process and store image
      const result = await processAndStoreImage(file, imageType, identifier);
      
      // Update parent component with the image ID
      onChange(result.imageId);
      if (onStorageKeyChange) {
        onStorageKeyChange(result.imageId);
      }
      
      // Show upload info
      setUploadInfo({
        originalSize: formatFileSize(result.originalSize),
        compressedSize: formatFileSize(result.compressedSize),
        compressionRatio: result.compressionRatio
      });

    } catch (error) {
      console.error('Error handling file:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
    setUploadInfo(null);
    setError(null);
    if (onStorageKeyChange) {
      onStorageKeyChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-600">Processing and storing image...</p>
          </div>
        ) : value ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-xs text-gray-500">Stored</span>
              </div>
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {uploadInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-800 text-sm">
            <Check className="w-4 h-4" />
            <span>Image stored successfully in IndexedDB!</span>
          </div>
          <div className="mt-2 text-xs text-green-700 space-y-1">
            <div>Original: {uploadInfo.originalSize}</div>
            <div>Compressed: {uploadInfo.compressedSize}</div>
            <div>Reduced by: {uploadInfo.compressionRatio}%</div>
          </div>
        </div>
      )}
    </div>
  );
} 