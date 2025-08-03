import React from 'react';
import { UserPlus, MessageCircle, AlertTriangle, Database, Utensils } from 'lucide-react';

export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      name: 'Add Contact',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Add a new contact',
      action: 'contacts'
    },
    {
      name: 'Add Phrase',
      icon: MessageCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Create new phrase',
      action: 'phrases'
    },
    {
      name: 'Add Food',
      icon: Utensils,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Add food item',
      action: 'foods'
    },
    {
      name: 'Emergency',
      icon: AlertTriangle,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Quick emergency action',
      action: 'emergencies'
    }
  ];

  const handleClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={() => handleClick(action.action)}
              className={`${action.color} text-white rounded-lg p-4 text-left transition-colors hover:shadow-md group`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">{action.name}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 