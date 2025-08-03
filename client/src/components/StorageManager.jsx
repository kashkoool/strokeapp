import React, { useState, useEffect } from 'react';
import { Database, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { getStorageInfo, clearAllUserImages, getAllUserImages, deleteUserImage } from '../utils/indexedDB';

export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const info = await getStorageInfo();
      setStorageInfo(info);
      
      // Load all user images for management
      const images = await getAllUserImages();
      setUserImages(images);
    } catch (error) {
      console.error('Error loading storage info:', error);
      setError('Failed to load storage information');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllImages = async () => {
    try {
      await clearAllUserImages();
      setShowConfirmClear(false);
      await loadStorageInfo(); // Reload info
    } catch (error) {
      console.error('Error clearing images:', error);
      setError('Failed to clear images');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteUserImage(imageId);
      await loadStorageInfo(); // Reload info
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getImageTypeLabel = (type) => {
    switch (type) {
      case 'bodypart': return 'Body Part';
      case 'symptom': return 'Symptom';
      case 'contact': return 'Contact';
      case 'food': return 'Food';
      case 'phrase': return 'Phrase';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading storage information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Storage Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Storage Overview */}
      {storageInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Images</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{storageInfo.totalImages}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Storage Used</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">{storageInfo.totalSizeMB} MB</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Status</span>
              </div>
              <p className="text-sm font-medium text-purple-900 mt-1">
                {storageInfo.totalImages > 0 ? 'Active' : 'Empty'}
              </p>
            </div>
          </div>

          {/* Storage Limits Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Storage Limits:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Chrome/Edge: Up to 80% of available disk space</li>
                  <li>• Firefox: Up to 50% of available disk space</li>
                  <li>• Safari: 1GB+ (configurable)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Images List */}
      {userImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User-Uploaded Images</h3>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {userImages.map((image) => (
              <div key={image.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">IMG</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{image.originalName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getImageTypeLabel(image.type)}</span>
                      <span>{(image.size / 1024).toFixed(1)} KB</span>
                      <span>{formatDate(image.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && userImages.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No User Images</h3>
          <p className="text-gray-600">
            No user-uploaded images are currently stored. Images will appear here when users upload them through the app.
          </p>
        </div>
      )}

      {/* Confirm Clear Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Clear All Images</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all user-uploaded images. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearAllImages}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 