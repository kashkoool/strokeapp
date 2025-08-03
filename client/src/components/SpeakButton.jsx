// src/components/SpeakButton.jsx
import React, { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

export default function SpeakButton({ text }) {
  const [isLoading, setIsLoading] = useState(false);

  const speakWithElevenLabs = async () => {
    setIsLoading(true);
    try {
      // You'll need to get a free API key from https://elevenlabs.io/
      const ELEVENLABS_API_KEY = import.meta.env.VITEELEVENLABS_API_KEY || 'your-api-key-here';
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
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
      console.error('Error generating speech:', error);
      // Fallback to browser speech synthesis
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA'; // Set to Arabic
      window.speechSynthesis.speak(utter);
    } finally {
      setIsLoading(false);
    }
  };

  const speakWithBrowser = () => {
    const utter = new window.SpeechSynthesisUtterance(text);
    // Try to set Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
    if (arabicVoice) {
      utter.voice = arabicVoice;
    }
    utter.lang = 'ar-SA';
    window.speechSynthesis.speak(utter);
  };

  const handleClick = () => {
    // Use ElevenLabs if API key is available, otherwise fallback to browser
    if (import.meta.env.VITEELEVENLABS_API_KEY && import.meta.env.VITEELEVENLABS_API_KEY !== 'your-api-key-here') {
      speakWithElevenLabs();
    } else {
      speakWithBrowser();
    }
  };

  return (
    <button
      aria-label={`Speak: ${text}`}
      onClick={handleClick}
      disabled={isLoading}
      className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50 disabled:opacity-50"
      title={`Speak: ${text}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}