'use client';

import React, { useState } from 'react';
import { Search, Mic, MicOff, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder = "Search sweets, snacks, ingredients (e.g. Besan, Chakli)...",
}: SearchBarProps) {
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice assistant aapke browser par support nahi karta. Please Chrome ya Edge Browser use karein.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // FIX: 'en-IN' (English India) set karne se voice input Hindi words ko English/Hinglish (e.g. "besan ladu") me convert karega!
      recognition.lang = 'en-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-lg border border-stone-200 mb-6 flex items-center gap-2 max-w-2xl mx-auto">
      <Search size={18} className="text-stone-400 ml-2 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full text-xs sm:text-sm bg-transparent outline-none text-stone-800 placeholder-stone-400 font-medium"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="p-1 text-stone-400 hover:text-stone-600"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="button"
        onClick={handleVoiceSearch}
        className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-extrabold shrink-0 ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-stone-100 hover:bg-amber-100 text-stone-700'
        }`}
        title="Voice Search"
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} className="text-amber-600" />}
        <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
      </button>
    </div>
  );
}