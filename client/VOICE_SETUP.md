# Voice Setup for PWA Text-to-Speech

## 🎯 **ElevenLabs Setup (Recommended)**

### 1. **Get Free API Key**
1. Go to [ElevenLabs.io](https://elevenlabs.io/)
2. Sign up for a free account
3. Go to your profile → API Key
4. Copy your API key

### 2. **Configure Environment**
Create a `.env` file in the `client` folder:
```env
VITE_ELEVENLABS_API_KEY=your-actual-api-key-here
```

**Note**: In Vite, environment variables must start with `VITE_` to be accessible in the browser.

### 3. **Features**
- ✅ **Free tier**: 10,000 characters/month
- ✅ **Excellent Arabic support**
- ✅ **High-quality, natural voices**
- ✅ **Multilingual model**
- ✅ **Automatic fallback** to browser speech synthesis

## 🚀 **How It Works**

### **Primary**: ElevenLabs AI Voice
- High-quality, natural-sounding speech
- Excellent Arabic pronunciation
- Multilingual support

### **Fallback**: Browser Speech Synthesis
- Works without API key
- Arabic language setting (`ar-SA`)
- Available on all modern browsers

## 🎵 **Usage**
1. Set up your API key in `.env` file
2. Restart the development server (`npm run dev`)
3. Click any phrase in the Communication Board
4. Enjoy high-quality text-to-speech!

## 💡 **Tips**
- The system automatically falls back to browser speech if API key is not configured
- Arabic text will be detected and spoken with appropriate pronunciation
- No loading indicators needed - speech plays immediately
- Environment variables in Vite must start with `VITE_` prefix

## 🔧 **Troubleshooting**
- If you get API errors, check your API key in the `.env` file
- Make sure to restart the dev server after adding the `.env` file
- The fallback browser speech will work even without an API key 