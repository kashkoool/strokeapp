// IndexedDB utilities for storing user-uploaded images
const DB_NAME = 'EmergencyAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'userImages';

// Initialize the database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      console.log('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store for user images
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
               // Create indexes for better querying
       store.createIndex('type', 'type', { unique: false });
       store.createIndex('bodyPartId', 'bodyPartId', { unique: false });
       store.createIndex('symptomId', 'symptomId', { unique: false });
       store.createIndex('contactId', 'contactId', { unique: false });
       store.createIndex('foodId', 'foodId', { unique: false });
       store.createIndex('phraseId', 'phraseId', { unique: false });
       store.createIndex('uploadDate', 'uploadDate', { unique: false });
        
        console.log('IndexedDB store created successfully');
      }
    };
  });
};

// Store a user-uploaded image
export const storeUserImage = async (imageData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

         const imageRecord = {
       id: imageData.id,
       type: imageData.type, // 'bodypart', 'symptom', 'contact', 'food', 'phrase'
       base64Data: imageData.base64Data,
       originalName: imageData.originalName,
       uploadDate: new Date().toISOString(),
       size: imageData.size,
       bodyPartId: imageData.bodyPartId,
       symptomId: imageData.symptomId,
       contactId: imageData.contactId,
       foodId: imageData.foodId,
       phraseId: imageData.phraseId
     };

    const request = store.put(imageRecord);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Image stored successfully:', imageData.id);
        resolve(imageData.id);
      };

      request.onerror = () => {
        console.error('Error storing image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in storeUserImage:', error);
    throw error;
  }
};

// Retrieve a user-uploaded image
export const getUserImage = async (imageId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(imageId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Error retrieving image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getUserImage:', error);
    throw error;
  }
};

// Get all images for a specific body part
export const getImagesByBodyPart = async (bodyPartId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('bodyPartId');

    const request = index.getAll(bodyPartId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error retrieving images by body part:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getImagesByBodyPart:', error);
    throw error;
  }
};

// Get all user-uploaded images
export const getAllUserImages = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error retrieving all images:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getAllUserImages:', error);
    throw error;
  }
};

// Delete a user-uploaded image
export const deleteUserImage = async (imageId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(imageId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Image deleted successfully:', imageId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Error deleting image:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in deleteUserImage:', error);
    throw error;
  }
};

// Get storage usage information
export const getStorageInfo = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const images = request.result || [];
        const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
        const totalImages = images.length;

        resolve({
          totalImages,
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        });
      };

      request.onerror = () => {
        console.error('Error getting storage info:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getStorageInfo:', error);
    throw error;
  }
};

// Clear all user-uploaded images
export const clearAllUserImages = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('All user images cleared successfully');
        resolve(true);
      };

      request.onerror = () => {
        console.error('Error clearing images:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in clearAllUserImages:', error);
    throw error;
  }
};

// Generate unique image ID
export const generateImageId = (type, identifier) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `user_upload_${type}_${identifier}_${timestamp}_${random}`;
};

// Check if image is user-uploaded
export const isUserUploadedImage = (imagePath) => {
  return imagePath && imagePath.startsWith('user_upload_');
};

// Get image source (either from IndexedDB or direct path)
export const getImageSource = async (imagePath) => {
  if (isUserUploadedImage(imagePath)) {
    try {
      const imageData = await getUserImage(imagePath);
      return imageData ? imageData.base64Data : null;
    } catch (error) {
      console.error('Error loading user image:', error);
      return null;
    }
  } else {
    // Return direct path for pre-existing images
    return imagePath;
  }
}; 