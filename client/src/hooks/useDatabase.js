import { useState, useEffect, useCallback } from 'react';
import { dbOperations, initDatabase } from '../utils/database';
import { checkAndLoadInitialData } from '../utils/initialDataLoader';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize database on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await initDatabase();
        
        // Load initial data if needed
        await checkAndLoadInitialData();
        
        setIsInitialized(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Generic operation wrapper
  const wrapOperation = useCallback((operation) => {
    return async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await operation(...args);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };
  }, []);

  // Emergency operations
  const addEmergency = wrapOperation(dbOperations.addEmergency);
  const getAllEmergencies = wrapOperation(dbOperations.getAllEmergencies);
  const getEmergencyById = wrapOperation(dbOperations.getEmergencyById);
  const updateEmergency = wrapOperation(dbOperations.updateEmergency);
  const deleteEmergency = wrapOperation(dbOperations.deleteEmergency);

  // Food operations
  const addFood = wrapOperation(dbOperations.addFood);
  const getAllFoods = wrapOperation(dbOperations.getAllFoods);
  const getFoodsByCategory = wrapOperation(dbOperations.getFoodsByCategory);
  const getFavoriteFoods = wrapOperation(dbOperations.getFavoriteFoods);
  const updateFoodUsageCount = wrapOperation(dbOperations.updateFoodUsageCount);
  const toggleFavorite = wrapOperation(dbOperations.toggleFavorite);

  // Contact operations
  const addContact = wrapOperation(dbOperations.addContact);
  const getAllContacts = wrapOperation(dbOperations.getAllContacts);
  const getContactsByRelationship = wrapOperation(dbOperations.getContactsByRelationship);
  const updateContactUsageCount = wrapOperation(dbOperations.updateContactUsageCount);

  // Phrase operations
  const addPhrase = wrapOperation(dbOperations.addPhrase);
  const getAllPhrases = wrapOperation(dbOperations.getAllPhrases);
  const getPhrasesByCategory = wrapOperation(dbOperations.getPhrasesByCategory);
  const updatePhraseUsageCount = wrapOperation(dbOperations.updatePhraseUsageCount);

  // Order operations
  const addOrder = wrapOperation(dbOperations.addOrder);
  const getAllOrders = wrapOperation(dbOperations.getAllOrders);
  const getOrdersByStatus = wrapOperation(dbOperations.getOrdersByStatus);
  const updateOrderStatus = wrapOperation(dbOperations.updateOrderStatus);

  // Activity operations
  const addActivity = wrapOperation(dbOperations.addActivity);
  const getAllActivities = wrapOperation(dbOperations.getAllActivities);
  const getActivitiesByCategory = wrapOperation(dbOperations.getActivitiesByCategory);
  const getActiveActivities = wrapOperation(dbOperations.getActiveActivities);
  const updateActivityUsageCount = wrapOperation(dbOperations.updateActivityUsageCount);
  const toggleActivityActive = wrapOperation(dbOperations.toggleActivityActive);

  // Data management operations
  const exportData = wrapOperation(dbOperations.exportData);
  const importData = wrapOperation(dbOperations.importData);
  const clearAllData = wrapOperation(dbOperations.clearAllData);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    loading,
    error,
    
    // Emergency operations
    addEmergency,
    getAllEmergencies,
    getEmergencyById,
    updateEmergency,
    deleteEmergency,
    
    // Food operations
    addFood,
    getAllFoods,
    getFoodsByCategory,
    getFavoriteFoods,
    updateFoodUsageCount,
    toggleFavorite,
    
    // Contact operations
    addContact,
    getAllContacts,
    getContactsByRelationship,
    updateContactUsageCount,
    
    // Phrase operations
    addPhrase,
    getAllPhrases,
    getPhrasesByCategory,
    updatePhraseUsageCount,
    
    // Order operations
    addOrder,
    getAllOrders,
    getOrdersByStatus,
    updateOrderStatus,
    
    // Activity operations
    addActivity,
    getAllActivities,
    getActivitiesByCategory,
    getActiveActivities,
    updateActivityUsageCount,
    toggleActivityActive,
    
    // Data management
    exportData,
    importData,
    clearAllData,
    clearError
  };
}; 