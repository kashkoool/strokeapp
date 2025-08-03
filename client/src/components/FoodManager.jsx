import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Utensils, ChevronDown } from 'lucide-react';
import FileSystemImageUpload from './FileSystemImageUpload';
import { FoodImage } from './ImageDisplay';
import { deleteUserImage } from '../utils/indexedDB';

// Local storage utilities for foods
const FOODS_STORAGE_KEY = 'foods';

const getFoods = () => {
  try {
    const stored = localStorage.getItem(FOODS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading foods from localStorage:', error);
    return [];
  }
};

const saveFoods = (foods) => {
  try {
    localStorage.setItem(FOODS_STORAGE_KEY, JSON.stringify(foods));
  } catch (error) {
    console.error('Error saving foods to localStorage:', error);
    throw error;
  }
};

export default function FoodManager() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    foodImage: '',
    description: '',
    category: 'lunch',
    isFavorite: false
  });

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const foodsData = getFoods();
      setFoods(foodsData);
    } catch (error) {
      console.error('Error loading foods:', error);
      setError('Failed to load foods from local storage.');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newFood = {
        id: editingFood ? editingFood.id : Date.now().toString(),
        ...formData,
        usageCount: editingFood ? editingFood.usageCount : 0,
        createdAt: editingFood ? editingFood.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedFoods;
      if (editingFood) {
        updatedFoods = foods.map(f => f.id === editingFood.id ? newFood : f);
      } else {
        updatedFoods = [...foods, newFood];
      }

      saveFoods(updatedFoods);
      setFoods(updatedFoods);
      setShowAddForm(false);
      setEditingFood(null);
      resetForm();
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food. Please try again.');
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        // Delete associated user-uploaded image if it exists
        const food = foods.find(f => f.id === foodId);
        if (food && food.foodImage && food.foodImage.startsWith('user_upload_')) {
          await deleteUserImage(food.foodImage);
        }

        const updatedFoods = foods.filter(f => f.id !== foodId);
        saveFoods(updatedFoods);
        setFoods(updatedFoods);
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('Failed to delete food. Please try again.');
      }
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      foodImage: food.foodImage || '',
      description: food.description || '',
      category: food.category || 'lunch',
      isFavorite: food.isFavorite || false
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      foodImage: '',
      description: '',
      category: 'lunch',
      isFavorite: false
    });
  };

  const handleFoodClick = async (food) => {
    try {
      // Toggle favorite status
      const updatedFood = {
        ...food,
        isFavorite: !food.isFavorite,
        updatedAt: new Date().toISOString()
      };
      
      const updatedFoods = foods.map(f => f.id === food.id ? updatedFood : f);
      saveFoods(updatedFoods);
      setFoods(updatedFoods);
      
      alert(`Selected: ${food.name}`);
    } catch (error) {
      console.error('Error handling food click:', error);
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
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'drink', label: 'Drink' },
    { value: 'dessert', label: 'Dessert' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-b-green-600 border-t-green-300 border-l-green-300 border-r-green-300"></div>
        <h2 className="mt-8 text-2xl font-bold text-gray-800">
          Just a moment...
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Your food menu is loading.
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
          onClick={loadFoods}
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
          <Utensils className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Panel' : 'Food Menu'}
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
        {/* --- User View (Food Menu) --- */}
        {!isAdminView ? (
          foods.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Utensils className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                No foods available. Please ask your caregiver to add some.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {foods.map((food) => (
                <div key={food.id} className="flex flex-col items-center">
                  <div
                    onClick={() => handleFoodClick(food)}
                    className="group relative w-full aspect-square bg-white rounded-full shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:border-green-500 hover:shadow-xl mb-3 overflow-hidden cursor-pointer"
                    title={`Click to interact with ${food.name}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFoodClick(food);
                      }
                    }}
                  >
                                         <FoodImage
                       imagePath={food.foodImage}
                       className="w-full h-full object-cover"
                       icon={<Utensils className="w-16 h-16 text-green-500" />}
                     />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm md:text-base font-medium text-gray-800">
                      {food.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* --- Caregiver View (Admin Panel) --- */
          <div className="space-y-8">
            {/* Add/Edit Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleAddForm}
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${
                    showAddForm ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {showAddForm && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Describe the food item..."
                    />
                  </div>

                                     <FileSystemImageUpload
                     value={formData.foodImage}
                     onChange={(value) => setFormData({...formData, foodImage: value})}
                     placeholder="Drag and drop a food image here"
                     imageType="food"
                     identifier={editingFood ? editingFood.id : Date.now().toString()}
                   />

                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isFavorite}
                        onChange={(e) => setFormData({...formData, isFavorite: e.target.checked})}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Favorite</span>
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingFood ? 'Update Food' : 'Add Food'}
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

            {/* Food List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No foods found.
                </div>
              ) : (
                foods.map((food) => (
                  <div key={food.id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                                         {food.foodImage && (
                       <FoodImage
                         imagePath={food.foodImage}
                         className="w-full h-32 object-cover rounded-lg mb-3"
                       />
                     )}
                    
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{food.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{food.category}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(food)}
                          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {food.description && (
                      <p className="text-sm text-gray-600 mb-2">{food.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {food.usageCount || 0} times</span>
                      {food.isFavorite && <span className="text-yellow-500">★ Favorite</span>}
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