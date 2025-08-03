import React, { useState, useEffect, Suspense } from 'react';
import { Home, Users, MessageCircle, Utensils, AlertTriangle, Database, HardDrive } from 'lucide-react';
import { reportWebVitals } from './utils/web-vitals';
import PerformanceMonitor from './components/PerformanceMonitor';
import './index.css';

// Optimized Image Component for better performance
const OptimizedImage = ({ src, alt, className, loading = "lazy", ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// Lazy load components with better loading states
const LazyComponents = {
  ContactManager: React.lazy(() => import('./components/ContactManager').then(module => ({
    default: module.default
  }))),
  FoodManager: React.lazy(() => import('./components/FoodManager').then(module => ({
    default: module.default
  }))),
  PhraseManager: React.lazy(() => import('./components/PhraseManager').then(module => ({
    default: module.default
  }))),
  EmergencyManager: React.lazy(() => import('./components/EmergencyManager').then(module => ({
    default: module.default
  }))),
  DynamicDataManager: React.lazy(() => import('./components/DynamicDataManager').then(module => ({
    default: module.default
  }))),
  StorageManager: React.lazy(() => import('./components/StorageManager').then(module => ({
    default: module.default
  })))
};

// Loading component with skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

// Error boundary for lazy components
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 text-center">
    <div className="text-red-500 mb-2">Something went wrong loading this component.</div>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Try again
    </button>
  </div>
);

const tabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'phrases', label: 'Phrases', icon: MessageCircle },
  { id: 'foods', label: 'Foods', icon: Utensils },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  { id: 'dynamic', label: 'Custom Data', icon: Database },
  { id: 'storage', label: 'Storage', icon: HardDrive },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize web vitals monitoring
    reportWebVitals();
    
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action) => {
    setActiveTab(action);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-4 space-y-6">
            <QuickActions onActionClick={handleQuickAction} />
            <EmergencyNumbers />
          </div>
        );
      case 'contacts':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.ContactManager />
          </Suspense>
        );
      case 'phrases':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.PhraseManager />
          </Suspense>
        );
      case 'foods':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.FoodManager />
          </Suspense>
        );
      case 'emergency':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.EmergencyManager />
          </Suspense>
        );
      case 'dynamic':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.DynamicDataManager />
          </Suspense>
        );
      case 'storage':
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponents.StorageManager />
          </Suspense>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Navigation */}
      <nav 
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`${tab.id}-panel`}
                    >
                      <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div role="tabpanel" id={`${activeTab}-panel`}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

// Quick Actions Component
const QuickActions = ({ onActionClick }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <button 
        onClick={() => onActionClick('contacts')}
        className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group cursor-pointer"
        aria-label="Navigate to Contacts"
      >
        <Users className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium text-gray-900">Add Contact</span>
        <span className="text-xs text-gray-500">Add a new contact</span>
      </button>
      
      <button 
        onClick={() => onActionClick('phrases')}
        className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group cursor-pointer"
        aria-label="Navigate to Phrases"
      >
        <MessageCircle className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium text-gray-900">Add Phrase</span>
        <span className="text-xs text-gray-500">Create new phrase</span>
      </button>
      
      <button 
        onClick={() => onActionClick('foods')}
        className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 group cursor-pointer"
        aria-label="Navigate to Foods"
      >
        <Utensils className="w-8 h-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium text-gray-900">Add Food</span>
        <span className="text-xs text-gray-500">Add food item</span>
      </button>
      
      <button 
        onClick={() => onActionClick('emergency')}
        className="flex flex-col items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 group cursor-pointer"
        aria-label="Navigate to Emergency"
      >
        <AlertTriangle className="w-8 h-8 text-red-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium text-gray-900">Emergency</span>
        <span className="text-xs text-gray-500">Quick emergency action</span>
      </button>
    </div>
  </div>
);

// Emergency Numbers Component
const EmergencyNumbers = () => {
  const handleEmergencyCall = (number) => {
    // Use tel: protocol to initiate phone call
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Numbers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <button
              onClick={() => handleEmergencyCall('911')}
              className="cursor-pointer hover:scale-105 transition-transform duration-200"
              aria-label="Call Police Emergency - 911"
              title="Click to call 911"
            >
              <OptimizedImage 
                src="/image/police.png" 
                alt="Police officer icon - Click to call 911" 
                className="w-16 h-16 object-contain"
                loading="eager"
                width="64"
                height="64"
              />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Police</h3>
            <button
              onClick={() => handleEmergencyCall('911')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
              aria-label="Call 911"
            >
              911
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <button
              onClick={() => handleEmergencyCall('999')}
              className="cursor-pointer hover:scale-105 transition-transform duration-200"
              aria-label="Call Emergency Services - 999"
              title="Click to call 999"
            >
              <OptimizedImage 
                src="/image/ambulance.png" 
                alt="Ambulance icon - Click to call 999" 
                className="w-16 h-16 object-contain"
                loading="eager"
                width="64"
                height="64"
              />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Emergency</h3>
            <button
              onClick={() => handleEmergencyCall('999')}
              className="text-2xl font-bold text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer"
              aria-label="Call 999"
            >
              999
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 