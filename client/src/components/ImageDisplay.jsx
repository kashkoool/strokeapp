import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getImageSource, isUserUploadedImage } from '../utils/indexedDB';

export default function ImageDisplay({ 
  imagePath, 
  alt = "Image", 
  className = "", 
  fallbackIcon = null,
  fallbackClassName = ""
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Get the image source (either from IndexedDB or direct path)
        const source = await getImageSource(imagePath);
        
        if (source) {
          setImageSrc(source);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  // Show error state or fallback
  if (error || !imageSrc) {
    if (fallbackIcon) {
      return (
        <div className={`flex items-center justify-center ${fallbackClassName || className}`}>
          {fallbackIcon}
        </div>
      );
    }
    
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <AlertTriangle className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // Show the image
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

// Specialized components for common use cases
export function BodyPartImage({ imagePath, className = "", icon = null }) {
  return (
    <ImageDisplay
      imagePath={imagePath}
      alt="Body part"
      className={className}
      fallbackIcon={icon || <AlertTriangle className="w-16 h-16 text-red-500" />}
    />
  );
}

export function SymptomImage({ imagePath, className = "", icon = null }) {
  return (
    <ImageDisplay
      imagePath={imagePath}
      alt="Symptom"
      className={className}
      fallbackIcon={icon || <AlertTriangle className="w-12 h-12 text-red-500" />}
    />
  );
}

export function ContactImage({ imagePath, className = "", icon = null }) {
  return (
    <ImageDisplay
      imagePath={imagePath}
      alt="Contact"
      className={className}
      fallbackIcon={icon || <span className="text-6xl">👤</span>}
    />
  );
}

export function FoodImage({ imagePath, className = "", icon = null }) {
  return (
    <ImageDisplay
      imagePath={imagePath}
      alt="Food"
      className={className}
      fallbackIcon={icon || <span className="text-6xl">🍽️</span>}
    />
  );
}

export function PhraseImage({ imagePath, className = "", icon = null }) {
  return (
    <ImageDisplay
      imagePath={imagePath}
      alt="Phrase"
      className={className}
      fallbackIcon={icon || <span className="text-6xl">💬</span>}
    />
  );
} 