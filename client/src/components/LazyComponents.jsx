import { lazy } from 'react';

// Lazy load heavy components
export const EmergencyManager = lazy(() => import('./EmergencyManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
});

export const DynamicDataManager = lazy(() => import('./DynamicDataManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
});

export const StorageManager = lazy(() => import('./StorageManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
});

export const FoodManager = lazy(() => import('./FoodManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
});

export const PhraseManager = lazy(() => import('./PhraseManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
});

export const ContactManager = lazy(() => import('./ContactManager'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />
}); 