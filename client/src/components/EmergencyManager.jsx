import React, { useState, useEffect } from 'react';
import { AlertTriangle, Edit, Trash2, ChevronDown, Plus } from 'lucide-react';
import FileSystemImageUpload from './FileSystemImageUpload';
import { BodyPartImage, SymptomImage } from './ImageDisplay';
import { deleteUserImage } from '../utils/indexedDB';

// Local storage utilities for emergency data
const EMERGENCY_STORAGE_KEY = 'emergencyData';

const getEmergencyData = () => {
  try {
    const stored = localStorage.getItem(EMERGENCY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading emergency data from localStorage:', error);
    return null;
  }
};

const saveEmergencyData = (data) => {
  try {
    localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving emergency data to localStorage:', error);
    throw error;
  }
};

// Load initial data from emergency.json
const loadInitialEmergencyData = async () => {
  try {
    const response = await fetch('/emergency.json');
    if (!response.ok) {
      throw new Error('Failed to load emergency.json');
    }
    const data = await response.json();
    
    // Transform the data to match our component structure
    const transformedData = data.body_parts.map((bodyPart, index) => ({
      id: `bodyPart_${index}`,
      name: bodyPart.name,
      description: bodyPart.description,
      bodyPartImage: bodyPart.bodyPartImage,
      icon: bodyPart.icon,
      symptoms: bodyPart.symptoms.map((symptom, symptomIndex) => ({
        id: `symptom_${index}_${symptomIndex}`,
        type: symptom.type,
        description: symptom.description,
        symptomImage: symptom.symptomImage,
        icon: symptom.icon,
        usageCount: 0,
        createdAt: new Date().toISOString()
      })),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error loading initial emergency data:', error);
    return [];
  }
};

export default function EmergencyManager() {
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [showBodyPartForm, setShowBodyPartForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [editingBodyPart, setEditingBodyPart] = useState(null);
  const [editingSymptom, setEditingSymptom] = useState(null);
  const [bodyPartFormData, setBodyPartFormData] = useState({
    name: '',
    description: '',
    bodyPartImage: ''
  });
  const [symptomFormData, setSymptomFormData] = useState({
    type: '',
    description: '',
    symptomImage: ''
  });

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get data from localStorage
      let data = getEmergencyData();
      
      // If no data in localStorage, load from emergency.json
      if (!data || data.length === 0) {
        console.log('No emergency data in localStorage, loading from emergency.json...');
        data = await loadInitialEmergencyData();
        
        // Save the initial data to localStorage
        if (data && data.length > 0) {
          saveEmergencyData(data);
        }
      }
      
      // Sort symptoms within each body part by usage count (highest first)
      const sortedData = data.map(bodyPart => ({
        ...bodyPart,
        symptoms: bodyPart.symptoms.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      }));
      
      setEmergencyData(sortedData);
    } catch (error) {
      console.error('Error loading emergency data:', error);
      setError('Failed to load emergency data from local storage.');
      setEmergencyData(null);
    } finally {
      setLoading(false);
    }
  };

  const reloadFromJSON = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear localStorage to force reload from JSON
      localStorage.removeItem(EMERGENCY_STORAGE_KEY);
      
      // Load fresh data from emergency.json
      const data = await loadInitialEmergencyData();
      
      // Save the fresh data to localStorage
      if (data && data.length > 0) {
        saveEmergencyData(data);
      }
      
      // Sort symptoms within each body part by usage count (highest first)
      const sortedData = data.map(bodyPart => ({
        ...bodyPart,
        symptoms: bodyPart.symptoms.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      }));
      
      setEmergencyData(sortedData);
    } catch (error) {
      console.error('Error reloading emergency data:', error);
      setError('Failed to reload emergency data from JSON file.');
      setEmergencyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBodyPartSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newBodyPart = {
        id: editingBodyPart ? editingBodyPart.id : Date.now().toString(),
        ...bodyPartFormData,
        symptoms: editingBodyPart ? editingBodyPart.symptoms : [],
        usageCount: editingBodyPart ? editingBodyPart.usageCount : 0,
        createdAt: editingBodyPart ? editingBodyPart.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedData;
      if (editingBodyPart) {
        updatedData = emergencyData.map(bp => bp.id === editingBodyPart.id ? newBodyPart : bp);
      } else {
        updatedData = [...emergencyData, newBodyPart];
      }

      saveEmergencyData(updatedData);
      setEmergencyData(updatedData);
      setShowBodyPartForm(false);
      setEditingBodyPart(null);
      resetBodyPartForm();
    } catch (error) {
      console.error('Error saving body part:', error);
      alert('Failed to save body part. Please try again.');
    }
  };

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBodyPart) return;
    
    try {
      const newSymptom = {
        id: editingSymptom ? editingSymptom.id : Date.now().toString(),
        ...symptomFormData,
        usageCount: editingSymptom ? editingSymptom.usageCount : 0,
        createdAt: editingSymptom ? editingSymptom.createdAt : new Date().toISOString()
      };

      const updatedBodyPart = { ...selectedBodyPart };
      
      if (editingSymptom) {
        updatedBodyPart.symptoms = updatedBodyPart.symptoms.map(s => 
          s.id === editingSymptom.id ? newSymptom : s
        );
      } else {
        updatedBodyPart.symptoms = [...(updatedBodyPart.symptoms || []), newSymptom];
      }
      
      // Sort symptoms by usage count
      updatedBodyPart.symptoms.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
      
      const updatedData = emergencyData.map(bp => bp.id === selectedBodyPart.id ? updatedBodyPart : bp);
      saveEmergencyData(updatedData);
      setEmergencyData(updatedData);
      setSelectedBodyPart(updatedBodyPart);
      setShowSymptomForm(false);
      setEditingSymptom(null);
      resetSymptomForm();
    } catch (error) {
      console.error('Error saving symptom:', error);
      alert('Failed to save symptom. Please try again.');
    }
  };

  const handleDeleteBodyPart = async (bodyPartId) => {
    if (window.confirm('Are you sure you want to delete this body part and all its symptoms?')) {
      try {
        // Delete associated user-uploaded images
        const bodyPart = emergencyData.find(bp => bp.id === bodyPartId);
        if (bodyPart) {
          // Delete body part image if it's user-uploaded
          if (bodyPart.bodyPartImage && bodyPart.bodyPartImage.startsWith('user_upload_')) {
            await deleteUserImage(bodyPart.bodyPartImage);
          }
          
          // Delete symptom images if they're user-uploaded
          for (const symptom of bodyPart.symptoms) {
            if (symptom.symptomImage && symptom.symptomImage.startsWith('user_upload_')) {
              await deleteUserImage(symptom.symptomImage);
            }
          }
        }

        const updatedData = emergencyData.filter(bp => bp.id !== bodyPartId);
        saveEmergencyData(updatedData);
        setEmergencyData(updatedData);
        if (selectedBodyPart && selectedBodyPart.id === bodyPartId) {
          setSelectedBodyPart(null);
        }
      } catch (error) {
        console.error('Error deleting body part:', error);
        alert('Failed to delete body part. Please try again.');
      }
    }
  };

  const handleDeleteSymptom = async (bodyPartId, symptomId) => {
    if (window.confirm('Are you sure you want to delete this symptom?')) {
      try {
        const bodyPart = emergencyData.find(bp => bp.id === bodyPartId);
        if (bodyPart) {
          // Delete symptom image if it's user-uploaded
          const symptom = bodyPart.symptoms.find(s => s.id === symptomId);
          if (symptom && symptom.symptomImage && symptom.symptomImage.startsWith('user_upload_')) {
            await deleteUserImage(symptom.symptomImage);
          }

          const updatedBodyPart = {
            ...bodyPart,
            symptoms: bodyPart.symptoms.filter(s => s.id !== symptomId),
            updatedAt: new Date().toISOString()
          };
          const updatedData = emergencyData.map(bp => bp.id === bodyPartId ? updatedBodyPart : bp);
          saveEmergencyData(updatedData);
          setEmergencyData(updatedData);
          if (selectedBodyPart && selectedBodyPart.id === bodyPartId) {
            setSelectedBodyPart(updatedBodyPart);
          }
        }
      } catch (error) {
        console.error('Error deleting symptom:', error);
        alert('Failed to delete symptom. Please try again.');
      }
    }
  };

  const handleEditBodyPart = (bodyPart) => {
    setEditingBodyPart(bodyPart);
    setBodyPartFormData({
      name: bodyPart.name,
      description: bodyPart.description || '',
      bodyPartImage: bodyPart.bodyPartImage || ''
    });
    setShowBodyPartForm(true);
  };

  const handleEditSymptom = (symptom) => {
    setEditingSymptom(symptom);
    setSymptomFormData({
      type: symptom.type,
      description: symptom.description || '',
      symptomImage: symptom.symptomImage || ''
    });
    setShowSymptomForm(true);
  };

  const resetBodyPartForm = () => {
    setBodyPartFormData({
      name: '',
      description: '',
      bodyPartImage: ''
    });
    setEditingBodyPart(null);
  };

  const resetSymptomForm = () => {
    setSymptomFormData({
      type: '',
      description: '',
      symptomImage: ''
    });
    setEditingSymptom(null);
  };

  const handleSymptomClick = async (bodyPartId, symptom) => {
    try {
      // Update usage count
      const bodyPart = emergencyData.find(bp => bp.id === bodyPartId);
      if (bodyPart) {
        const updatedSymptoms = bodyPart.symptoms.map(s => 
          s.id === symptom.id ? { ...s, usageCount: (s.usageCount || 0) + 1 } : s
        );
        
        // Sort symptoms by usage count (highest first)
        updatedSymptoms.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        
        const updatedBodyPart = {
          ...bodyPart,
          symptoms: updatedSymptoms,
          updatedAt: new Date().toISOString()
        };
        
        const updatedData = emergencyData.map(bp => bp.id === bodyPartId ? updatedBodyPart : bp);
        saveEmergencyData(updatedData);
        setEmergencyData(updatedData);
        
        // Update selectedBodyPart if it's the current one
        if (selectedBodyPart && selectedBodyPart.id === bodyPartId) {
          setSelectedBodyPart(updatedBodyPart);
        }
      }
      
      // Update usage count and show visual feedback instead of alert
      // The symptom click now just tracks usage without showing a popup
    } catch (error) {
      console.error('Error handling symptom:', error);
    }
  };

  const handleBodyPartClick = async () => {
    // No longer need to increment usage count for body parts
    // Just navigate to the body part's symptoms
  };

  const toggleAdminView = () => setIsAdminView(!isAdminView);
  const toggleBodyPartForm = () => {
    setShowBodyPartForm(!showBodyPartForm);
    if (showBodyPartForm) {
      resetBodyPartForm();
    }
  };
  const toggleSymptomForm = () => {
    setShowSymptomForm(!showSymptomForm);
    if (showSymptomForm) {
      resetSymptomForm();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-b-red-600 border-t-red-300 border-l-red-300 border-r-red-300"></div>
        <h2 className="mt-8 text-2xl font-bold text-gray-800">
          Just a moment...
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Your emergency actions are loading.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-700 bg-red-50 rounded-lg max-w-lg mx-auto mt-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="text-red-500 text-3xl">⚠️</div>
          <h3 className="text-2xl font-semibold text-red-800">Connection Error</h3>
        </div>
        <p className="text-red-700 mt-1">{error}</p>
        <button
          onClick={loadEmergencyData}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header with View Toggle */}
             <header className="flex items-center justify-between p-4 md:p-6 bg-white shadow-md sticky top-0 z-10">
         <div className="flex items-center space-x-3">
           <AlertTriangle className="w-8 h-8 text-red-600" />
           <h1 className="text-2xl font-bold text-gray-900">
             {isAdminView ? 'Admin Panel' : 'Emergency Actions'}
           </h1>
         </div>
         <div className="flex items-center space-x-2">
           <button
             onClick={reloadFromJSON}
             className="px-3 py-2 text-sm font-semibold rounded-full transition-colors bg-green-600 text-white hover:bg-green-700"
             title="Reload data from emergency.json file"
           >
             <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             Reload
           </button>
           <button
             onClick={toggleAdminView}
             className="px-4 py-2 text-sm font-semibold rounded-full transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
           >
             {isAdminView ? 'Exit Admin' : 'Admin'}
           </button>
         </div>
       </header>

      <main className="container mx-auto p-4 md:p-6">
        {/* --- User View (Body Parts and Symptoms) --- */}
        {!isAdminView ? (
          !emergencyData || emergencyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                No emergency data available. Please ask your caregiver to add some.
              </p>
            </div>
          ) : selectedBodyPart ? (
            /* --- Symptoms View (Replaces Emergency Actions) --- */
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedBodyPart(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Back to Emergency Actions"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedBodyPart.name} Symptoms
                  </h2>
                </div>
              </div>
              
              {selectedBodyPart.symptoms.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500">
                    No symptoms available for {selectedBodyPart.name}.
                  </p>
                  <button
                    onClick={() => setSelectedBodyPart(null)}
                    className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Back to Emergency Actions
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {selectedBodyPart.symptoms.map((symptom, index) => (
                    <div key={`${selectedBodyPart.name}-${symptom.type}-${index}`} className="flex flex-col items-center">
                      <div
                        onClick={() => handleSymptomClick(selectedBodyPart.id, symptom)}
                        className="group relative w-full aspect-square bg-white rounded-full shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:border-red-500 hover:shadow-xl mb-3 overflow-hidden cursor-pointer"
                        title={`Click to speak: ${symptom.description}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSymptomClick(selectedBodyPart.id, symptom);
                          }
                        }}
                      >
                        <SymptomImage
                          imagePath={symptom.symptomImage}
                          className="w-full h-full object-cover"
                          icon={<span className="text-4xl">{symptom.icon || <AlertTriangle className="w-12 h-12 text-red-500" />}</span>}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-800">
                          {symptom.type}
                        </h3>
                        {symptom.usageCount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Used {symptom.usageCount} times
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- Emergency Actions View (Body Parts) --- */
            <div className="space-y-8">
              {/* Body Parts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {emergencyData && emergencyData.length > 0 ? emergencyData.map((bodyPart, index) => (
                  <div key={bodyPart.name || `bodyPart-${index}`} className="flex flex-col items-center">
                    <div
                      onClick={() => {
                        handleBodyPartClick(bodyPart);
                        setSelectedBodyPart(bodyPart);
                      }}
                      className="group relative w-full aspect-square bg-white rounded-full shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:border-red-500 hover:shadow-xl mb-3 overflow-hidden cursor-pointer"
                      title={`Click to view ${bodyPart.name} symptoms`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleBodyPartClick(bodyPart);
                          setSelectedBodyPart(bodyPart);
                        }
                      }}
                    >
                      <BodyPartImage
                        imagePath={bodyPart.bodyPartImage}
                        className="w-full h-full object-cover"
                        icon={<span className="text-6xl">{bodyPart.icon || <AlertTriangle className="w-16 h-16 text-red-500" />}</span>}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm md:text-base font-medium text-gray-800">
                        {bodyPart.name}
                      </h3>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No body parts available</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* --- Caregiver View (Admin Panel) --- */
          selectedBodyPart ? (
            /* --- Symptoms Management View (Replaces Body Parts Management) --- */
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <button
                      onClick={() => setSelectedBodyPart(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="Back to Body Parts Management"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Symptoms Management</h2>
                  </div>
                  <select
                    value={selectedBodyPart.name}
                    onChange={(e) => {
                      const bodyPart = emergencyData.find(bp => bp.name === e.target.value);
                      setSelectedBodyPart(bodyPart);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                  >
                    {emergencyData?.map((bodyPart, index) => (
                      <option key={bodyPart.name || `bodyPart-${index}`} value={bodyPart.name}>
                        {bodyPart.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <button
                  onClick={toggleSymptomForm}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Symptom</span>
                </button>
              </div>
              
              {showSymptomForm && (
                <form onSubmit={handleSymptomSubmit} className="mb-6 space-y-5 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Symptom Type *
                      </label>
                      <input
                        type="text"
                        required
                        value={symptomFormData.type}
                        onChange={(e) => setSymptomFormData({...symptomFormData, type: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={symptomFormData.description}
                        onChange={(e) => setSymptomFormData({...symptomFormData, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <FileSystemImageUpload
                    value={symptomFormData.symptomImage}
                    onChange={(value) => setSymptomFormData({...symptomFormData, symptomImage: value})}
                    placeholder="Drag and drop a symptom image here"
                    imageType="symptom"
                    identifier={selectedBodyPart.id}
                  />

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingSymptom ? 'Update Symptom' : 'Add Symptom'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleSymptomForm}
                      className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Symptoms List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {selectedBodyPart.symptoms.map((symptom, index) => (
                  <div key={`${selectedBodyPart.name}-${symptom.type}-${index}`} className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{symptom.type}</h3>
                        <p className="text-sm text-gray-600">{symptom.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSymptom(symptom)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSymptom(selectedBodyPart.id, symptom.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {symptom.symptomImage && (
                      <div className="mt-4">
                        <SymptomImage
                          imagePath={symptom.symptomImage}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <span>Used {symptom.usageCount || 0} times</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- Body Parts Management View --- */
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Body Parts Management</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleBodyPartForm}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Body Part</span>
                    </button>
                    <button
                      onClick={() => setSelectedBodyPart(emergencyData?.[0] || null)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={!emergencyData?.length}
                    >
                      <span>Manage Symptoms</span>
                    </button>
                    <button
                      onClick={reloadFromJSON}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Reload data from emergency.json file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reload JSON</span>
                    </button>
                  </div>
                </div>
                
                {showBodyPartForm && (
                  <form onSubmit={handleBodyPartSubmit} className="mb-6 space-y-5 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bodyPartFormData.name}
                          onChange={(e) => setBodyPartFormData({...bodyPartFormData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={bodyPartFormData.description}
                          onChange={(e) => setBodyPartFormData({...bodyPartFormData, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <FileSystemImageUpload
                      value={bodyPartFormData.bodyPartImage}
                      onChange={(value) => setBodyPartFormData({...bodyPartFormData, bodyPartImage: value})}
                      placeholder="Drag and drop a body part image here"
                      imageType="bodypart"
                      identifier={editingBodyPart ? editingBodyPart.id : Date.now().toString()}
                    />

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {editingBodyPart ? 'Update Body Part' : 'Add Body Part'}
                      </button>
                      <button
                        type="button"
                        onClick={toggleBodyPartForm}
                        className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Body Parts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emergencyData?.map((bodyPart, index) => (
                    <div key={bodyPart.name || `bodyPart-${index}`} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{bodyPart.name}</h3>
                          <p className="text-sm text-gray-600">{bodyPart.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>{bodyPart.symptoms.length} symptoms</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBodyPart(bodyPart)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBodyPart(bodyPart.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {bodyPart.bodyPartImage && (
                        <div className="mt-4">
                          <BodyPartImage
                            imagePath={bodyPart.bodyPartImage}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
} 