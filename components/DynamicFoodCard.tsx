'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Play, ShoppingBag } from 'lucide-react';

interface FoodMotionCardProps {
  title?: string;
  description?: string;
  price?: number;
  unit?: string;
  videoSrc?: string;
  posterSrc?: string;
  onOrder?: () => void;
}

export default function DynamicFoodVideoCard({
  title = "Shuddh Ghee Besan Ladu",
  description = "Slow-roasted in Pure Desi Cow Ghee with Cardamom & Pistachio.",
  price = 700,
  unit = "kg",
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  posterSrc = "/images/besan-ladu.png",
  onOrder
}: FoodMotionCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleOrderClick = () => {
    if (onOrder) {
      onOrder();
    } else {
      const text = encodeURIComponent(
        `Namaste Jyoti Ben,\nI want to order:\nItem: ${title}\nPrice: Rs. ${price}/${unit}`
      );
      window.open(`https://wa.me/919725674462?text=${text}`, '_blank');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between">
      
      {/* Dynamic Video & Image Container (Card ke andar fit karne ke liye) */}
      <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover rounded-t-3xl"
        />

        {/* Gradient Overlay for seamless blending with text below */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 pointer-events-none" />

        {/* Dynamic Motion Tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] font-semibold text-amber-300 shadow-md">
          <Sparkles size={12} className="animate-pulse text-amber-400" />
          <span>Dynamic Motion</span>
        </div>

        {/* Mute / Unmute Control */}
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Card Body Content */}
      <div className="p-5 flex flex-col gap-3 -mt-2 relative z-10">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-amber-400">
            {title}
          </h3>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between mt-1">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
              PRICE
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400">₹{price}</span>
              <span className="text-xs text-neutral-400">/{unit}</span>
            </div>
          </div>

          <button
            onClick={handleOrderClick}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold px-5 py-2.5 rounded-full text-xs transition-all duration-200 flex items-center gap-2 shadow-lg active:scale-95"
          >
            <ShoppingBag size={14} /> Order Now
          </button>
        </div>
      </div>
    </div>
  );
}