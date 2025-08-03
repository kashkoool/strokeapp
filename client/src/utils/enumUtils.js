import { ENUMS } from './database';

// Export all enums for easy access
export { ENUMS };

// Helper function to get display names for enum values
export const getDisplayName = (value) => {
  return value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to get enum options for select components
export const getEnumOptions = (enumArray, includeEmpty = false) => {
  const options = enumArray.map(value => ({
    value,
    label: getDisplayName(value)
  }));
  
  if (includeEmpty) {
    options.unshift({ value: '', label: 'Select...' });
  }
  
  return options;
};

// Specific helper functions for each enum type
export const getContactRelationshipOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.CONTACT_RELATIONSHIPS, includeEmpty);
};

export const getContactGenderOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.CONTACT_GENDER, includeEmpty);
};

export const getFoodCategoryOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.FOOD_CATEGORIES, includeEmpty);
};

export const getPhraseCategoryOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.PHRASE_CATEGORIES, includeEmpty);
};

export const getOrderStatusOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.ORDER_STATUS, includeEmpty);
};

export const getActivityCategoryOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.ACTIVITY_CATEGORIES, includeEmpty);
};

export const getActivityFrequencyOptions = (includeEmpty = false) => {
  return getEnumOptions(ENUMS.ACTIVITY_FREQUENCY, includeEmpty);
};

// Validation helper
export const isValidEnumValue = (value, enumArray) => {
  return enumArray.includes(value);
};

// Example usage:
// import { getContactRelationshipOptions, getDisplayName } from '../utils/enumUtils';
// 
// const options = getContactRelationshipOptions(true); // includes empty option
// const displayName = getDisplayName('recently_mentioned'); // "Recently Mentioned" 