import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, ChevronDown, Volume2 } from 'lucide-react';
import FileSystemImageUpload from './FileSystemImageUpload';
import { PhraseImage } from './ImageDisplay';
import { deleteUserImage } from '../utils/indexedDB';

// Local storage utilities for phrases
const PHRASES_STORAGE_KEY = 'phrases';

const getPhrases = () => {
  try {
    const stored = localStorage.getItem(PHRASES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading phrases from localStorage:', error);
    return [];
  }
};

const savePhrases = (phrases) => {
  try {
    localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrases));
  } catch (error) {
    console.error('Error saving phrases to localStorage:', error);
    throw error;
  }
};

export default function PhraseManager() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    phraseImage: '',
    category: 'common',
    usageCount: 0
  });

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    try {
      setLoading(true);
      setError(null);
      const phrasesData = getPhrases();
      setPhrases(phrasesData);
    } catch (error) {
      console.error('Error loading phrases:', error);
      setError('Failed to load phrases from local storage.');
      setPhrases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newPhrase = {
        id: editingPhrase ? editingPhrase.id : Date.now().toString(),
        ...formData,
        createdAt: editingPhrase ? editingPhrase.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedPhrases;
      if (editingPhrase) {
        updatedPhrases = phrases.map(p => p.id === editingPhrase.id ? newPhrase : p);
      } else {
        updatedPhrases = [...phrases, newPhrase];
      }

      savePhrases(updatedPhrases);
      setPhrases(updatedPhrases);
      setShowAddForm(false);
      setEditingPhrase(null);
      resetForm();
    } catch (error) {
      console.error('Error saving phrase:', error);
      alert('Failed to save phrase. Please try again.');
    }
  };

  const handleDelete = async (phraseId) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      try {
        // Delete associated user-uploaded image if it exists
        const phrase = phrases.find(p => p.id === phraseId);
        if (phrase && phrase.phraseImage && phrase.phraseImage.startsWith('user_upload_')) {
          await deleteUserImage(phrase.phraseImage);
        }

        const updatedPhrases = phrases.filter(p => p.id !== phraseId);
        savePhrases(updatedPhrases);
        setPhrases(updatedPhrases);
      } catch (error) {
        console.error('Error deleting phrase:', error);
        alert('Failed to delete phrase. Please try again.');
      }
    }
  };

  const handleEdit = (phrase) => {
    setEditingPhrase(phrase);
    setFormData({
      text: phrase.text,
      phraseImage: phrase.phraseImage || '',
      category: phrase.category || 'common',
      usageCount: phrase.usageCount || 0
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      text: '',
      phraseImage: '',
      category: 'common',
      usageCount: 0
    });
  };

  const handlePhraseClick = async (phrase) => {
    try {
      // Update usage count
      const updatedPhrase = {
        ...phrase,
        usageCount: (phrase.usageCount || 0) + 1,
        updatedAt: new Date().toISOString()
      };
      
      const updatedPhrases = phrases.map(p => p.id === phrase.id ? updatedPhrase : p);
      savePhrases(updatedPhrases);
      setPhrases(updatedPhrases);
      
      // Use ElevenLabs API for high-quality text-to-speech
      const speakWithElevenLabs = async () => {
        try {
          const ELEVENLABS_API_KEY = import.meta.env.VITEELEVENLABS_API_KEY;
          
          if (!ELEVENLABS_API_KEY) {
            throw new Error('ElevenLabs API key not configured');
          }
          
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: phrase.text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to generate speech');
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();

          // Clean up the URL after playing
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
          };
        } catch (error) {
          console.error('ElevenLabs API error:', error);
          // Fallback to browser speech synthesis
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(phrase.text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.lang = 'ar-SA'; // Set to Arabic
            speechSynthesis.speak(utterance);
          } else {
            alert(`Selected: ${phrase.text}`);
          }
        }
      };
      
      speakWithElevenLabs();
    } catch (error) {
      console.error('Error handling phrase click:', error);
    }
  };

  const toggleAdminView = () => setIsAdminView(!isAdminView);
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showAddForm) {
      resetForm();
    }
  };

  const categories = [
    { value: 'common', label: 'Common' },
    { value: 'greeting', label: 'Greeting' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'food', label: 'Food' },
    { value: 'health', label: 'Health' },
    { value: 'transport', label: 'Transport' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-b-purple-600 border-t-purple-300 border-l-purple-300 border-r-purple-300"></div>
        <h2 className="mt-8 text-2xl font-bold text-gray-800">
          Just a moment...
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Your communication board is loading.
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
          onClick={loadPhrases}
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
          <MessageSquare className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Panel' : 'Communication Board'}
          </h1>
        </div>
        <button
          onClick={toggleAdminView}
          className="px-4 py-2 text-sm font-semibold rounded-full transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          {isAdminView ? 'Exit Admin' : 'Admin'}
        </button>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {/* --- User View (Communication Board) --- */}
        {!isAdminView ? (
          phrases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                No phrases available. Please ask your caregiver to add some.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {phrases.map((phrase) => (
                <div key={phrase.id} className="flex flex-col items-center">
                  <div
                    onClick={() => handlePhraseClick(phrase)}
                    className="group relative w-full aspect-square bg-white rounded-full shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:border-purple-500 hover:shadow-xl mb-3 overflow-hidden cursor-pointer"
                    title={`Click to speak: ${phrase.text}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePhraseClick(phrase);
                      }
                    }}
                  >
                    <PhraseImage
                      imagePath={phrase.phraseImage}
                      className="w-full h-full object-cover"
                      icon={<Volume2 className="w-16 h-16 text-purple-500" />}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm md:text-base font-medium text-gray-800">
                      {phrase.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* --- Caregiver View (Admin Panel) --- */
          <div className="space-y-8">
            {/* Add/Edit Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleAddForm}
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingPhrase ? 'Edit Phrase' : 'Add New Phrase'}
                </h3>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${
                    showAddForm ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {showAddForm && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phrase Text *
                    </label>
                    <textarea
                      required
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter the phrase text..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FileSystemImageUpload
                    value={formData.phraseImage}
                    onChange={(value) => setFormData({ ...formData, phraseImage: value })}
                    placeholder="Drag and drop an image here"
                    imageType="phrase"
                    identifier={editingPhrase ? editingPhrase.id : Date.now().toString()}
                  />
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingPhrase ? 'Update Phrase' : 'Add Phrase'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleAddForm}
                      className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Phrase List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phrases.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No phrases found.
                </div>
              ) : (
                phrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="bg-white rounded-xl shadow-lg p-5 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {phrase.text}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(phrase)}
                          className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(phrase.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {phrase.phraseImage && (
                      <div className="mt-4">
                        <PhraseImage
                          imagePath={phrase.phraseImage}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full capitalize text-xs font-semibold">
                        {phrase.category}
                      </span>
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 