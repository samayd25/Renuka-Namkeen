'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  ShoppingBag,
  Sparkles,
  Flame,
  ShieldCheck,
  Star,
  Heart,
  ArrowRight,
  Award,
  Utensils,
  Clock,
  Truck,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { categories, products } from '@/data/products';
import AIChatbot from '@/components/AIChatbot';

export default function WelcomePage() {
  const [productList, setProductList] = useState(products);

  useEffect(() => {
    const loadStoredProducts = () => {
      const saved = localStorage.getItem('renuka_admin_products');
      if (saved) {
        try {
          setProductList(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadStoredProducts();

    // Custom Event Listener for instant sync
    window.addEventListener('renuka_products_updated', loadStoredProducts);
    return () => {
      window.removeEventListener('renuka_products_updated', loadStoredProducts);
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950">
      
      {/* 🚀 Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 py-1.5 px-4 text-center text-xs font-black tracking-wide shadow-md">
        🎁 Special Offer: Order Pure Desi Ghee Sweets & Get Fresh Home Delivery in Vadodara!
      </div>

      {/* Header */}
      <header className="bg-stone-950/90 backdrop-blur-md text-white p-4 sticky top-0 z-50 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 rounded-2xl border border-amber-400/30">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-amber-300">
                Renuka-Namakeen
              </h1>
              <span className="text-[10px] text-amber-200/80 font-medium block">
                Authentic Homemade Sweets & Snacks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:9725674462"
              className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold text-xs items-center gap-2 border border-white/20 transition"
            >
              <Phone size={14} className="text-amber-400" /> 9725674462
            </a>
            <Link
              href="/menu"
              className="bg-amber-400 text-stone-950 px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition active:scale-95"
            >
              <ShoppingBag size={16} /> View Menu
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-stone-950 via-red-950/30 to-stone-900 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Flame size={14} className="text-amber-400 animate-bounce" />
              100% Pure Desi Ghee & Fresh Homemade Taste
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Shuddh & Swadist <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                Ghar Jaisa Swad
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Renuka-Namakeen brings traditional Gujarati & Maharashtrian festival specials, prepared with authentic recipes, pure ingredients, and zero preservatives.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/menu"
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition active:scale-95 shadow-amber-500/20"
              >
                Explore Full Menu <ArrowRight size={18} />
              </Link>
              <a
                href="https://wa.me/919725674462?text=Namaste%20Jyoti%20Ben,%20I%20want%20to%20inquire%20about%20Renuka-Namakeen"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition active:scale-95 shadow-emerald-600/20"
              >
                <MessageSquare size={18} /> WhatsApp Inquiry
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-800">
              <div className="bg-stone-950/50 p-3 rounded-2xl border border-stone-800/80">
                <span className="text-2xl font-black text-amber-400 block">100%</span>
                <span className="text-xs text-stone-400 font-medium">Homemade</span>
              </div>
              <div className="bg-stone-950/50 p-3 rounded-2xl border border-stone-800/80">
                <span className="text-2xl font-black text-amber-400 block">Pure Ghee</span>
                <span className="text-xs text-stone-400 font-medium">Sweets</span>
              </div>
              <div className="bg-stone-950/50 p-3 rounded-2xl border border-stone-800/80">
                <span className="text-2xl font-black text-amber-400 block">4.9 ★</span>
                <span className="text-xs text-stone-400 font-medium">Customer Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div className="relative">
            <div className="relative mx-auto rounded-3xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-stone-950 group">
              <img
                src="/images/besan-ladu.png"
                alt="Shuddh Ghee Sweets"
                className="w-full h-96 object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
              
              <div className="absolute top-4 right-4 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" /> Best Quality
              </div>

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm mb-1">
                  <Award size={16} /> Jyoti Ben's Special Recipes
                </div>
                <p className="text-xs text-stone-300">
                  Bhajani Chakli, Shuddh Ghee Anarsa, Besan Ladu, and fresh homemade snacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-12 bg-stone-950 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
            What We Offer
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-6">Our Menu Categories</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.filter((c) => c !== 'All').map((category) => (
              <Link
                key={category}
                href={`/menu?category=${encodeURIComponent(category)}`}
                className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-stone-300 border border-stone-800 text-xs font-extrabold transition shadow-sm flex items-center gap-2 hover:scale-105"
              >
                <Utensils size={14} /> {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 How It Works (Order Flow) */}
      <section className="py-16 bg-stone-900 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
            Simple & Easy Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-10">How To Order</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3 relative">
              <div className="w-10 h-10 bg-amber-400 text-stone-950 rounded-full font-black flex items-center justify-center mx-auto text-sm shadow-md">
                1
              </div>
              <h4 className="font-extrabold text-white text-base">Select Your Items</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Explore our menu of authentic home-style sweets, snacks, and namkeen.
              </p>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3 relative">
              <div className="w-10 h-10 bg-amber-400 text-stone-950 rounded-full font-black flex items-center justify-center mx-auto text-sm shadow-md">
                2
              </div>
              <h4 className="font-extrabold text-white text-base">Place Order on WhatsApp</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Click on order to directly chat with Jyoti Ben and confirm quantity & date.
              </p>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3 relative">
              <div className="w-10 h-10 bg-amber-400 text-stone-950 rounded-full font-black flex items-center justify-center mx-auto text-sm shadow-md">
                3
              </div>
              <h4 className="font-extrabold text-white text-base">Fresh Home Delivery</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Enjoy freshly prepared, hygienic snacks delivered straight to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-3 hover:border-amber-400/40 transition">
              <div className="p-3 bg-amber-400/10 text-amber-400 w-fit mx-auto rounded-2xl border border-amber-400/20">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-extrabold text-white text-base">Hygienic Preparation</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Prepared in a clean domestic kitchen following strict quality & hygiene protocols.
              </p>
            </div>

            <div className="p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-3 hover:border-amber-400/40 transition">
              <div className="p-3 bg-amber-400/10 text-amber-400 w-fit mx-auto rounded-2xl border border-amber-400/20">
                <Star size={28} />
              </div>
              <h3 className="font-extrabold text-white text-base">Authentic Taste</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Traditional family recipes passed down over generations to deliver genuine flavor.
              </p>
            </div>

            <div className="p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-3 hover:border-amber-400/40 transition">
              <div className="p-3 bg-amber-400/10 text-amber-400 w-fit mx-auto rounded-2xl border border-amber-400/20">
                <Heart size={28} />
              </div>
              <h3 className="font-extrabold text-white text-base">Made with Love</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Fresh batches prepared on order using pure cow ghee and handpicked ingredients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Customer Testimonials / Social Proof */}
      <section className="py-16 bg-stone-900 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
            Reviews
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-10">Loved By Our Customers</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="flex gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-stone-300 italic">
                "Anarsa aur Besan Ladoo bilkul ghar jaisa taste dete hain! Pure Desi Ghee ki khushboo best hai."
              </p>
              <div className="text-xs font-bold text-amber-300 pt-2 border-t border-stone-800 flex items-center justify-between">
                <span>Priya Sharma</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3">
              <div className="flex gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-stone-300 italic">
                "Bhajani Chakli crispy aur ekdam crunchy hai. Festival catering ke liye best homemade option!"
              </p>
              <div className="text-xs font-bold text-amber-300 pt-2 border-t border-stone-800 flex items-center justify-between">
                <span>Rajesh Patel</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>

            <div className="p-6 bg-stone-950 rounded-3xl border border-stone-800 space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-stone-300 italic">
                "Solapuri Chevdo ka taste aagaya! Packaging clean thi aur fresh delivery mili."
              </p>
              <div className="text-xs font-bold text-amber-300 pt-2 border-t border-stone-800 flex items-center justify-between">
                <span>Sneha Kulkarni</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-stone-950 border-t border-stone-800 text-center pb-24 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl font-black text-amber-300">Renuka-Namakeen</h2>
          <p className="text-xs text-stone-400">
            For Bulk Festive Orders & Catering: Call <strong>+91 9725674462</strong>
          </p>
          <div className="pt-4 text-[11px] text-stone-600">
            © {new Date().getFullYear()} Renuka-Namakeen. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* 🚀 Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur-md p-3 border-t border-amber-500/30 flex gap-3 z-40">
        <a
          href="tel:9725674462"
          className="flex-1 bg-stone-800 text-stone-200 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-stone-700"
        >
          <Phone size={14} className="text-amber-400" /> Call Now
        </a>
        <Link
          href="/menu"
          className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg"
        >
          <ShoppingBag size={16} /> Order Now
        </Link>
      </div>

      <AIChatbot />
    </div>
  );
}