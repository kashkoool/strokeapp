import { dbOperations } from './database';

// Load initial emergency data into the database
// Updated to fetch from public directory instead of importing
// Force deployment - Vercel was using cached version
export const loadInitialEmergencyData = async () => {
  try {
    console.log('Loading initial emergency data...');
    
    // Check if data already exists
    const existingEmergencies = await dbOperations.getAllEmergencies();
    if (existingEmergencies.length > 0) {
      console.log('Emergency data already exists, skipping initial load');
      return;
    }

    // Fetch emergency data from public directory
    const response = await fetch('/emergency.json');
    if (!response.ok) {
      throw new Error('Failed to load emergency.json');
    }
    const emergencyData = await response.json();

    // Load body parts and their symptoms
    for (const bodyPart of emergencyData.body_parts) {
      const emergencyDataItem = {
        name: bodyPart.name,
        description: bodyPart.description,
        bodyPartImage: bodyPart.bodyPartImage,
        icon: bodyPart.icon,
        symptoms: bodyPart.symptoms.map(symptom => ({
          type: symptom.type,
          description: symptom.description,
          symptomImage: symptom.symptomImage,
          icon: symptom.icon,
          usageCount: 0,
          createdAt: new Date().toISOString()
        }))
      };

      await dbOperations.addEmergency(emergencyDataItem);
    }

    console.log('Initial emergency data loaded successfully');
  } catch (error) {
    console.error('Error loading initial emergency data:', error);
    throw error;
  }
};

// Load all initial data (emergency, food, phrases, etc.)
export const loadAllInitialData = async () => {
  try {
    await loadInitialEmergencyData();
    // Add other initial data loaders here as needed
    console.log('All initial data loaded successfully');
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
};

// Check if initial data needs to be loaded
export const checkAndLoadInitialData = async () => {
  try {
    const emergencies = await dbOperations.getAllEmergencies();
    const foods = await dbOperations.getAllFoods();
    const contacts = await dbOperations.getAllContacts();
    const phrases = await dbOperations.getAllPhrases();
    const activities = await dbOperations.getAllActivities();

    // If no data exists, load initial data
    if (emergencies.length === 0 && foods.length === 0 && 
        contacts.length === 0 && phrases.length === 0 && activities.length === 0) {
      console.log('No data found, loading initial data...');
      await loadAllInitialData();
    }
  } catch (error) {
    console.error('Error checking initial data:', error);
  }
};

// Reset database and reload initial data
export const resetAndReloadData = async () => {
  try {
    console.log('Resetting database and reloading initial data...');
    await dbOperations.clearAllData();
    await loadAllInitialData();
    console.log('Database reset and initial data reloaded successfully');
  } catch (error) {
    console.error('Error resetting and reloading data:', error);
    throw error;
  }
}; 