import Dexie from 'dexie';

// Create a new database instance
export const db = new Dexie('StrokeAppDB');

// Enum constants for validation and UI
export const ENUMS = {
  // Contact relationships
  CONTACT_RELATIONSHIPS: ['family', 'friend', 'recently_mentioned', 'known_person'],
  
  // Contact gender
  CONTACT_GENDER: ['male', 'female'],
  
  // Food categories
  FOOD_CATEGORIES: ['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'dessert'],
  
  // Phrase categories
  PHRASE_CATEGORIES: ['common', 'greeting', 'emergency', 'food', 'health', 'transport', 'shopping', 'specific', 'nickname', 'other'],
  
  // Order status
  ORDER_STATUS: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
  
  // Activity categories
  ACTIVITY_CATEGORIES: ['health', 'exercise', 'entertainment', 'personal_care', 'other'],
  
  // Activity frequency
  ACTIVITY_FREQUENCY: ['daily', 'weekly', 'monthly', 'custom']
};

// Define the database schema based on your MongoDB models
db.version(1).stores({
  // Emergency: for fast action emergency situations
  emergencies: '++id, name, description, createdAt',
  
  // Food: for food preferences and meal requests
  foods: '++id, name, category, isFavorite, usageCount, createdAt',
  
  // Contact: has a name, image, relationship, gender, and phone number
  contacts: '++id, name, relationship, gender, phoneNumber, usageCount, createdAt, updatedAt',
  
  // Phrase: text, image, and usage count for suggestions
  phrases: '++id, text, category, usageCount, createdAt, updatedAt',
  
  // Order: for food orders and requests
  orders: '++id, orderNumber, status, totalAmount, isUrgent, orderDate, createdAt, updatedAt',
  
  // Activity: for daily activities and routines
  activities: '++id, name, category, isRecurring, frequency, isActive, usageCount, createdAt'
});

// Helper function to convert image file to base64
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to resize image before storing (preserves original format)
export const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Preserve original image format (PNG, JPEG, WebP, etc.)
      const originalType = file.type || 'image/jpeg';
      canvas.toBlob(resolve, originalType, 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Validation helper functions
export const validateEnum = (value, enumArray) => {
  return enumArray.includes(value);
};

export const validateContactData = (data) => {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!validateEnum(data.relationship, ENUMS.CONTACT_RELATIONSHIPS)) {
    errors.push('Invalid relationship');
  }
  
  if (!validateEnum(data.gender, ENUMS.CONTACT_GENDER)) {
    errors.push('Invalid gender');
  }
  
  return errors;
};

export const validateFoodData = (data) => {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!validateEnum(data.category, ENUMS.FOOD_CATEGORIES)) {
    errors.push('Invalid category');
  }
  
  return errors;
};

export const validatePhraseData = (data) => {
  const errors = [];
  
  if (!data.text?.trim()) {
    errors.push('Text is required');
  }
  
  if (!validateEnum(data.category, ENUMS.PHRASE_CATEGORIES)) {
    errors.push('Invalid category');
  }
  
  return errors;
};

export const validateOrderData = (data) => {
  const errors = [];
  
  if (!data.orderNumber?.trim()) {
    errors.push('Order number is required');
  }
  
  if (!validateEnum(data.status, ENUMS.ORDER_STATUS)) {
    errors.push('Invalid status');
  }
  
  return errors;
};

export const validateActivityData = (data) => {
  const errors = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!validateEnum(data.category, ENUMS.ACTIVITY_CATEGORIES)) {
    errors.push('Invalid category');
  }
  
  if (data.isRecurring && !validateEnum(data.frequency, ENUMS.ACTIVITY_FREQUENCY)) {
    errors.push('Invalid frequency');
  }
  
  return errors;
};

// Database operations for Emergency
export const emergencyOperations = {
  async addEmergency(emergencyData) {
    try {
      const now = new Date().toISOString();
      const emergency = {
        ...emergencyData,
        createdAt: now
      };
      
      const id = await db.emergencies.add(emergency);
      return { id, ...emergency };
    } catch (error) {
      console.error('Error adding emergency:', error);
      throw error;
    }
  },

  async getAllEmergencies() {
    try {
      return await db.emergencies.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting emergencies:', error);
      throw error;
    }
  },

  async getEmergencyById(id) {
    try {
      return await db.emergencies.get(id);
    } catch (error) {
      console.error('Error getting emergency:', error);
      throw error;
    }
  },

  async updateEmergency(id, emergencyData) {
    try {
      await db.emergencies.update(id, emergencyData);
      return await db.emergencies.get(id);
    } catch (error) {
      console.error('Error updating emergency:', error);
      throw error;
    }
  },

  async deleteEmergency(id) {
    try {
      await db.emergencies.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting emergency:', error);
      throw error;
    }
  }
};

// Database operations for Food
export const foodOperations = {
  async addFood(foodData) {
    try {
      const now = new Date().toISOString();
      const food = {
        ...foodData,
        createdAt: now
      };
      
      const id = await db.foods.add(food);
      return { id, ...food };
    } catch (error) {
      console.error('Error adding food:', error);
      throw error;
    }
  },

  async getAllFoods() {
    try {
      return await db.foods.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting foods:', error);
      throw error;
    }
  },

  async getFoodsByCategory(category) {
    try {
      return await db.foods.where('category').equals(category).toArray();
    } catch (error) {
      console.error('Error getting foods by category:', error);
      throw error;
    }
  },

  async getFavoriteFoods() {
    try {
      return await db.foods.where('isFavorite').equals(true).toArray();
    } catch (error) {
      console.error('Error getting favorite foods:', error);
      throw error;
    }
  },

  async updateFoodUsageCount(id) {
    try {
      const food = await db.foods.get(id);
      await db.foods.update(id, { usageCount: (food.usageCount || 0) + 1 });
      return await db.foods.get(id);
    } catch (error) {
      console.error('Error updating food usage count:', error);
      throw error;
    }
  },

  async toggleFavorite(id) {
    try {
      const food = await db.foods.get(id);
      await db.foods.update(id, { isFavorite: !food.isFavorite });
      return await db.foods.get(id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
};

// Database operations for Contact
export const contactOperations = {
  async addContact(contactData) {
    try {
      const now = new Date().toISOString();
      const contact = {
        ...contactData,
        createdAt: now,
        updatedAt: now
      };
      
      const id = await db.contacts.add(contact);
      return { id, ...contact };
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  async getAllContacts() {
    try {
      return await db.contacts.orderBy('usageCount').reverse().toArray();
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  },

  async getContactsByRelationship(relationship) {
    try {
      return await db.contacts.where('relationship').equals(relationship).toArray();
    } catch (error) {
      console.error('Error getting contacts by relationship:', error);
      throw error;
    }
  },

  async updateContactUsageCount(id) {
    try {
      const contact = await db.contacts.get(id);
      const now = new Date().toISOString();
      await db.contacts.update(id, { 
        usageCount: (contact.usageCount || 0) + 1,
        updatedAt: now
      });
      return await db.contacts.get(id);
    } catch (error) {
      console.error('Error updating contact usage count:', error);
      throw error;
    }
  }
};

// Database operations for Phrase
export const phraseOperations = {
  async addPhrase(phraseData) {
    try {
      const now = new Date().toISOString();
      const phrase = {
        ...phraseData,
        createdAt: now,
        updatedAt: now
      };
      
      const id = await db.phrases.add(phrase);
      return { id, ...phrase };
    } catch (error) {
      console.error('Error adding phrase:', error);
      throw error;
    }
  },

  async getAllPhrases() {
    try {
      return await db.phrases.orderBy('usageCount').reverse().toArray();
    } catch (error) {
      console.error('Error getting phrases:', error);
      throw error;
    }
  },

  async getPhrasesByCategory(category) {
    try {
      return await db.phrases.where('category').equals(category).toArray();
    } catch (error) {
      console.error('Error getting phrases by category:', error);
      throw error;
    }
  },

  async updatePhraseUsageCount(id) {
    try {
      const phrase = await db.phrases.get(id);
      const now = new Date().toISOString();
      await db.phrases.update(id, { 
        usageCount: (phrase.usageCount || 0) + 1,
        updatedAt: now
      });
      return await db.phrases.get(id);
    } catch (error) {
      console.error('Error updating phrase usage count:', error);
      throw error;
    }
  }
};

// Database operations for Order
export const orderOperations = {
  async addOrder(orderData) {
    try {
      const now = new Date().toISOString();
      const order = {
        ...orderData,
        createdAt: now,
        updatedAt: now
      };
      
      const id = await db.orders.add(order);
      return { id, ...order };
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  async getAllOrders() {
    try {
      return await db.orders.orderBy('orderDate').reverse().toArray();
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async getOrdersByStatus(status) {
    try {
      return await db.orders.where('status').equals(status).toArray();
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const now = new Date().toISOString();
      await db.orders.update(id, { status, updatedAt: now });
      return await db.orders.get(id);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

// Database operations for Activity
export const activityOperations = {
  async addActivity(activityData) {
    try {
      const now = new Date().toISOString();
      const activity = {
        ...activityData,
        createdAt: now
      };
      
      const id = await db.activities.add(activity);
      return { id, ...activity };
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  },

  async getAllActivities() {
    try {
      return await db.activities.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  },

  async getActivitiesByCategory(category) {
    try {
      return await db.activities.where('category').equals(category).toArray();
    } catch (error) {
      console.error('Error getting activities by category:', error);
      throw error;
    }
  },

  async getActiveActivities() {
    try {
      return await db.activities.where('isActive').equals(true).toArray();
    } catch (error) {
      console.error('Error getting active activities:', error);
      throw error;
    }
  },

  async updateActivityUsageCount(id) {
    try {
      const activity = await db.activities.get(id);
      await db.activities.update(id, { usageCount: (activity.usageCount || 0) + 1 });
      return await db.activities.get(id);
    } catch (error) {
      console.error('Error updating activity usage count:', error);
      throw error;
    }
  },

  async toggleActivityActive(id) {
    try {
      const activity = await db.activities.get(id);
      await db.activities.update(id, { isActive: !activity.isActive });
      return await db.activities.get(id);
    } catch (error) {
      console.error('Error toggling activity active:', error);
      throw error;
    }
  }
};

// Combined database operations
export const dbOperations = {
  // Emergency operations
  ...emergencyOperations,
  
  // Food operations
  ...foodOperations,
  
  // Contact operations
  ...contactOperations,
  
  // Phrase operations
  ...phraseOperations,
  
  // Order operations
  ...orderOperations,
  
  // Activity operations
  ...activityOperations,

  // Export all data (for backup)
  async exportData() {
    try {
      const emergencies = await db.emergencies.toArray();
      const foods = await db.foods.toArray();
      const contacts = await db.contacts.toArray();
      const phrases = await db.phrases.toArray();
      const orders = await db.orders.toArray();
      const activities = await db.activities.toArray();
      
      return { emergencies, foods, contacts, phrases, orders, activities };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data (for restore)
  async importData(data) {
    try {
      await db.transaction('rw', [
        db.emergencies, 
        db.foods, 
        db.contacts, 
        db.phrases, 
        db.orders, 
        db.activities
      ], async () => {
        if (data.emergencies && Array.isArray(data.emergencies)) {
          await db.emergencies.bulkAdd(data.emergencies);
        }
        if (data.foods && Array.isArray(data.foods)) {
          await db.foods.bulkAdd(data.foods);
        }
        if (data.contacts && Array.isArray(data.contacts)) {
          await db.contacts.bulkAdd(data.contacts);
        }
        if (data.phrases && Array.isArray(data.phrases)) {
          await db.phrases.bulkAdd(data.phrases);
        }
        if (data.orders && Array.isArray(data.orders)) {
          await db.orders.bulkAdd(data.orders);
        }
        if (data.activities && Array.isArray(data.activities)) {
          await db.activities.bulkAdd(data.activities);
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Clear all data
  async clearAllData() {
    try {
      await db.emergencies.clear();
      await db.foods.clear();
      await db.contacts.clear();
      await db.phrases.clear();
      await db.orders.clear();
      await db.activities.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
};

// Initialize database
export const initDatabase = async () => {
  try {
    await db.open();
    console.log('Stroke App Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}; 