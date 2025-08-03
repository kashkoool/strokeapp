# IndexedDB Image Storage System

## Overview

This system provides a two-tier image storage solution for the Emergency PWA:

1. **Pre-existing Images**: Stored in `/image/` folder (unchanged)
2. **User-Uploaded Images**: Stored in IndexedDB for offline access

## Features

### ✅ **For Pre-existing Images:**
- Direct file access from `/image/` folder
- Fast loading
- No storage limits
- Organized folder structure

### ✅ **For User-Uploaded Images:**
- Large storage capacity (up to 80% of disk space)
- Complete offline access
- No backend required
- Permanent storage (survives browser restarts)
- Automatic compression and optimization

## How It Works

### **Image Upload Process:**
1. User selects image file
2. File is validated (type, size)
3. Image is compressed if needed (max 1024x1024, 85% quality)
4. Converted to base64
5. Stored in IndexedDB with metadata
6. Unique ID generated and returned

### **Image Loading Process:**
1. Check if image path starts with `user_upload_`
2. **User-uploaded**: Load from IndexedDB
3. **Pre-existing**: Load from `/image/` folder
4. Display image with fallback handling

## Storage Structure

### **IndexedDB Database:**
- **Name**: `EmergencyAppDB`
- **Version**: 1
- **Store**: `userImages`

### **Image Record Structure:**
```javascript
{
  id: "user_upload_bodypart_123_1705123456789_abc123",
  type: "bodypart", // "bodypart", "symptom", "contact", "food", "phrase"
  base64Data: "data:image/jpeg;base64,/9j/4AAQ...",
  originalName: "custom_head.png",
  uploadDate: "2024-01-15T10:30:00Z",
  size: 245760, // bytes
  bodyPartId: "bodyPart_0", // reference (for bodypart images)
  symptomId: null, // reference (for symptom images)
  contactId: null, // reference (for contact images)
  foodId: null, // reference (for food images)
  phraseId: null // reference (for phrase images)
}
```

## Components

### **1. IndexedDB Utilities (`utils/indexedDB.js`)**
- Database initialization
- Image storage/retrieval
- Storage management
- Utility functions

### **2. FileSystemImageUpload Component**
- Handles file selection and validation
- Processes and compresses images
- Stores in IndexedDB
- Shows upload progress

### **3. ImageDisplay Component**
- Displays both types of images
- Handles loading states
- Provides fallback icons
- Specialized components for different use cases

### **4. StorageManager Component**
- Monitor storage usage
- List all user images
- Delete individual images
- Clear all images

## Usage Examples

### **Adding User Images:**

#### **Body Part:**
```jsx
<FileSystemImageUpload
  value={bodyPartFormData.bodyPartImage}
  onChange={(value) => setBodyPartFormData({...bodyPartFormData, bodyPartImage: value})}
  placeholder="Drag and drop a body part image here"
  imageType="bodypart"
  identifier={bodyPartId}
/>
```

#### **Contact:**
```jsx
<FileSystemImageUpload
  value={formData.personImage}
  onChange={(value) => setFormData({...formData, personImage: value})}
  placeholder="Drag and drop a contact photo here"
  imageType="contact"
  identifier={contactId}
/>
```

#### **Food:**
```jsx
<FileSystemImageUpload
  value={formData.foodImage}
  onChange={(value) => setFormData({...formData, foodImage: value})}
  placeholder="Drag and drop a food image here"
  imageType="food"
  identifier={foodId}
/>
```

#### **Phrase:**
```jsx
<FileSystemImageUpload
  value={formData.phraseImage}
  onChange={(value) => setFormData({...formData, phraseImage: value})}
  placeholder="Drag and drop an image here"
  imageType="phrase"
  identifier={phraseId}
/>
```

### **Displaying Images:**
```jsx
// Body Part
<BodyPartImage
  imagePath={bodyPart.bodyPartImage}
  className="w-full h-full object-cover"
  icon={<span className="text-6xl">🫀</span>}
/>

// Contact
<ContactImage
  imagePath={contact.personImage}
  className="w-full h-full object-cover"
  icon={<span className="text-6xl">👤</span>}
/>

// Food
<FoodImage
  imagePath={food.foodImage}
  className="w-full h-full object-cover"
  icon={<span className="text-6xl">🍽️</span>}
/>

// Phrase
<PhraseImage
  imagePath={phrase.phraseImage}
  className="w-full h-full object-cover"
  icon={<span className="text-6xl">💬</span>}
/>
```

### **Checking Storage Usage:**
```jsx
const storageInfo = await getStorageInfo();
console.log(`Using ${storageInfo.totalSizeMB} MB for ${storageInfo.totalImages} images`);
```

## Storage Limits

### **Browser Limits:**
- **Chrome/Edge**: 80% of available disk space
- **Firefox**: 50% of available disk space
- **Safari**: 1GB+ (configurable)

### **File Limits:**
- **Max file size**: 5MB per image
- **Compression threshold**: 1MB (images larger are compressed)
- **Max dimensions**: 1024x1024 pixels
- **Quality**: 85% JPEG

## File Management

### **Automatic Cleanup:**
- Images are deleted when associated items are deleted
- Body part deletion removes all associated images
- Symptom deletion removes symptom image

### **Manual Management:**
- Storage tab shows all user images
- Individual image deletion
- Bulk clear all images
- Storage usage monitoring

## Error Handling

### **Upload Errors:**
- File type validation
- Size limit enforcement
- Compression failures
- Storage quota exceeded

### **Display Errors:**
- Missing images show fallback icons
- Loading states for async operations
- Graceful degradation

## Performance Optimizations

### **Image Processing:**
- Automatic compression for large files
- Base64 encoding for offline access
- Metadata storage for management

### **Loading:**
- Async image loading
- Caching in IndexedDB
- Fallback handling

## Security Considerations

### **File Validation:**
- MIME type checking
- Size limits
- Format restrictions

### **Storage:**
- Client-side only
- No server transmission
- Local browser storage

## Troubleshooting

### **Common Issues:**

1. **"IndexedDB not supported"**
   - Check browser compatibility
   - Use fallback to localStorage (limited)

2. **"Storage quota exceeded"**
   - Clear old images
   - Compress new uploads
   - Monitor usage

3. **"Image not loading"**
   - Check if image exists in IndexedDB
   - Verify image ID format
   - Check console for errors

### **Debug Commands:**
```javascript
// Check storage info
const info = await getStorageInfo();
console.log(info);

// List all images
const images = await getAllUserImages();
console.log(images);

// Clear all images
await clearAllUserImages();
```

## Migration from Old System

### **Existing Images:**
- No changes needed
- Continue using `/image/` paths
- Automatic detection and handling

### **New Uploads:**
- Automatically use IndexedDB
- Generate unique IDs
- Store with metadata

## Future Enhancements

### **Potential Improvements:**
- Image resizing options
- Multiple format support
- Backup/restore functionality
- Cloud sync integration
- Advanced compression algorithms

### **Storage Options:**
- WebSQL (deprecated)
- localStorage (limited)
- Cache API
- File System API (experimental)

## Browser Support

### **IndexedDB Support:**
- ✅ Chrome 23+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ❌ Internet Explorer (limited)

### **Fallback Strategy:**
- Check IndexedDB support
- Fall back to localStorage (limited)
- Show appropriate error messages 