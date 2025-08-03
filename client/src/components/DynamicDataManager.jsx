import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Database, ChevronDown, Download, Upload, AlertTriangle } from 'lucide-react';
import FileSystemImageUpload from './FileSystemImageUpload';
import { useDatabase } from '../hooks/useDatabase';

export default function DynamicDataManager() {
  const { 
    getAllActivities, 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    loading, 
    error 
  } = useDatabase();
  
  const [activities, setActivities] = useState([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'daily',
    activityImage: ''
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const activitiesData = await getAllActivities();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingActivity) {
        const updatedActivity = {
          ...editingActivity,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        await updateActivity(updatedActivity);
      } else {
        const newActivity = {
          ...formData,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addActivity(newActivity);
      }
      
      await loadActivities();
      setShowAddForm(false);
      setEditingActivity(null);
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(activityId);
        await loadActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      activityImage: activity.activityImage || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'daily',
      activityImage: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      activityImage: imageData
    }));
  };

  const handleExportData = async () => {
    try {
      const allData = {
        activities: activities,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stroke-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.activities && Array.isArray(data.activities)) {
        // Clear existing activities and import new ones
        for (const activity of data.activities) {
          await addActivity({
            ...activity,
            id: undefined, // Let the database generate new IDs
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        await loadActivities();
        alert('Data imported successfully!');
      } else {
        alert('Invalid data format. Please check the file.');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please try again.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const toggleAdminView = () => setIsAdminView(!isAdminView);
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setEditingActivity(null);
      resetForm();
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Activities</h1>
        <div className="flex space-x-2">
          <button
            onClick={toggleAdminView}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {isAdminView ? 'User View' : 'Admin View'}
          </button>
          {isAdminView && (
            <>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <button
                onClick={toggleAddForm}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingActivity ? 'Edit Activity' : 'Add New Activity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter activity title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="special">Special</option>
                  <option value="medical">Medical</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter activity description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Image (Optional)
              </label>
              <FileSystemImageUpload
                value={formData.activityImage}
                onChange={handleImageChange}
                placeholder="Upload activity image"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={toggleAddForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {editingActivity ? 'Update Activity' : 'Add Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {activity.category}
              </p>
            </div>

            {activity.description && (
              <p className="text-sm text-gray-600 mb-4 text-center">
                {activity.description}
              </p>
            )}

            {activity.activityImage && (
              <div className="mb-4">
                <img
                  src={activity.activityImage}
                  alt={activity.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}

            {isAdminView && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleEdit(activity)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                  title="Edit activity"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  title="Delete activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-600 mb-4">Add your first activity to get started</p>
          {isAdminView && (
            <button
              onClick={toggleAddForm}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
} 