import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Phone, Users, ChevronDown } from 'lucide-react';
import FileSystemImageUpload from './FileSystemImageUpload';
import { ContactImage } from './ImageDisplay';
import { deleteUserImage } from '../utils/indexedDB';

// Local storage utilities for contacts
const CONTACTS_STORAGE_KEY = 'contacts';

const getContacts = () => {
  try {
    const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading contacts from localStorage:', error);
    return [];
  }
};

const saveContacts = (contacts) => {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving contacts to localStorage:', error);
    throw error;
  }
};



export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'friend',
    gender: 'male',
    phoneNumber: '',
    personImage: ''
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const contactsData = getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setError('Failed to load contacts from local storage.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newContact = {
        id: editingContact ? editingContact.id : Date.now().toString(),
        ...formData,
        createdAt: editingContact ? editingContact.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedContacts;
      if (editingContact) {
        updatedContacts = contacts.map(c => c.id === editingContact.id ? newContact : c);
      } else {
        updatedContacts = [...contacts, newContact];
      }

      saveContacts(updatedContacts);
      setContacts(updatedContacts);
      setShowAddForm(false);
      setEditingContact(null);
      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact. Please try again.');
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        // Delete associated user-uploaded image if it exists
        const contact = contacts.find(c => c.id === contactId);
        if (contact && contact.personImage && contact.personImage.startsWith('user_upload_')) {
          await deleteUserImage(contact.personImage);
        }

        const updatedContacts = contacts.filter(c => c.id !== contactId);
        saveContacts(updatedContacts);
        setContacts(updatedContacts);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      gender: contact.gender,
      phoneNumber: contact.phoneNumber,
      personImage: contact.personImage || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'friend',
      gender: 'male',
      phoneNumber: '',
      personImage: ''
    });
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  const toggleAdminView = () => setIsAdminView(!isAdminView);
  const toggleAddForm = () => {
    if (showAddForm) {
      setShowAddForm(false);
      setEditingContact(null);
      resetForm();
    } else {
      setShowAddForm(true);
    }
  };

  const handleContactClick = (contact) => {
    if (contact.phoneNumber) {
      window.open(`tel:${contact.phoneNumber}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-b-blue-600 border-t-blue-300 border-l-blue-300 border-r-blue-300"></div>
        <h2 className="mt-8 text-2xl font-bold text-gray-800">
          Just a moment...
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Your contacts are loading.
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
           onClick={loadContacts}
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
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Panel' : 'Contact Directory'}
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
        {/* --- User View (Contact Directory) --- */}
        {!isAdminView ? (
          contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                No contacts available. Please ask your caregiver to add some.
              </p>
            </div>
          ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
               {contacts.map((contact) => (
                 <div key={contact.id || contact._id} className="flex flex-col items-center">
                                             <div 
                             onClick={() => handleContactClick(contact)}
                             className="group relative w-full aspect-square bg-white rounded-full shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:border-blue-500 hover:shadow-xl mb-3 overflow-hidden cursor-pointer"
                             title={`Click to interact with ${contact.name}`}
                             role="button"
                             tabIndex={0}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' || e.key === ' ') {
                                 e.preventDefault();
                                 handleContactClick(contact);
                               }
                             }}
                           >
                             <ContactImage
                               imagePath={contact.personImage}
                               className="w-full h-full object-cover"
                               icon={<span className="text-6xl">{getGenderIcon(contact.gender)}</span>}
                             />
                           </div>
                  <div className="text-center">
                    <h3 className="text-sm md:text-base font-medium text-gray-800">
                      {contact.name}
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
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleAddForm}
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={formData.relationship}
                        onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="recently_mentioned">Recently Mentioned</option>
                        <option value="known_person">Known Person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                                     <FileSystemImageUpload
                     value={formData.personImage}
                     onChange={(value) => setFormData({...formData, personImage: value})}
                     placeholder="Drag and drop a contact photo here"
                     imageType="contact"
                     identifier={editingContact ? editingContact.id : Date.now().toString()}
                   />

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingContact ? 'Update Contact' : 'Add Contact'}
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

            {/* Contact List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No contacts found.
                </div>
              ) : (
                                 contacts.map((contact) => (
                   <div key={contact.id || contact._id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                                                     <div className="flex items-center space-x-3">
                                 <ContactImage
                                   imagePath={contact.personImage}
                                   className="w-16 h-16 rounded-full object-cover border border-gray-200"
                                   icon={<div className="text-3xl">{getGenderIcon(contact.gender)}</div>}
                                 />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          <span className="text-sm text-gray-500 capitalize">{contact.relationship.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                                                 <button
                           onClick={() => handleDelete(contact.id || contact._id)}
                           className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                         >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {contact.phoneNumber && (
                      <div className="flex items-center space-x-2 mb-4 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{contact.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {contact.usageCount || 0} times</span>
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