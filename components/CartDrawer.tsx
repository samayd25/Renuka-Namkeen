'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, MapPin, Loader2 } from 'lucide-react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  weight: string;
  quantity: number;
  img: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, weight: string, delta: number) => void;
  onRemoveItem: (id: number, weight: string) => void;
  onClearCart: () => void;
}

// Admin Location: A-3/104 Mangla Marvel, Near Somenath Nagar, Tarsali, Vadodara
const ADMIN_LOCATION = {
  lat: 22.2618,
  lng: 73.2081,
};

const calculateDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<boolean>(false);

  // AUTOMATIC DISTANCE & DELIVERY CHARGE CALCULATION WITH SMART FALLBACK
  useEffect(() => {
    if (!customerAddress || customerAddress.trim().length < 4) {
      setDistanceKm(null);
      setDeliveryCharge(0);
      setGeocodeError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCalculating(true);
      setGeocodeError(false);

      try {
        const cleanAddress = customerAddress.trim();
        let searchQuery = cleanAddress.toLowerCase().includes('vadodara')
          ? cleanAddress
          : `${cleanAddress}, Vadodara, Gujarat`;

        let response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
        );
        let data = await response.json();

        // Fallback: Agar precise society name na mile, toh parts divide karke broad search karein (e.g. "Gotri, Vadodara")
        if ((!data || data.length === 0) && cleanAddress.includes(',')) {
          const parts = cleanAddress.split(',');
          const broaderQuery = `${parts.slice(1).join(',')}, Vadodara, Gujarat`;
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(broaderQuery)}`
          );
          data = await response.json();
        }

        if (data && data.length > 0) {
          const uLat = parseFloat(data[0].lat);
          const uLng = parseFloat(data[0].lon);

          setUserCoords({ lat: uLat, lng: uLng });

          const dist = calculateDistanceInKm(ADMIN_LOCATION.lat, ADMIN_LOCATION.lng, uLat, uLng);
          const roundedDist = Number(dist.toFixed(2));

          setDistanceKm(roundedDist);

          // Distance > 3 KM par delivery charge ₹200 apply hoga
          if (roundedDist > 3.0) {
            setDeliveryCharge(200);
          } else {
            setDeliveryCharge(0);
          }
        } else {
          setUserCoords(null);
          setDistanceKm(null);
          setDeliveryCharge(0);
          setGeocodeError(true);
        }
      } catch (err) {
        console.error('Auto Map Error:', err);
        setGeocodeError(true);
      } finally {
        setIsCalculating(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [customerAddress]);

  if (!isOpen) return null;

  const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = itemsTotal + deliveryCharge;

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    let itemsListText = '';
    cartItems.forEach((item, index) => {
      itemsListText += `${index + 1}. *${item.name}* (${item.weight})\n   Qty: ${item.quantity} x ₹${item.price} = ₹${item.price * item.quantity}\n`;
    });

    const locationMapUrl = userCoords
      ? `https://maps.google.com/?q=${userCoords.lat},${userCoords.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(customerAddress + ', Vadodara')}`;

    const message =
      `*NEW ORDER - RENUKA NAMAKEEN*\n\n` +
      `*Customer Info:*\n` +
      ` Name: ${customerName}\n` +
      ` Phone: ${customerPhone}\n` +
      ` Address: ${customerAddress}\n` +
      ` Map Location Link: ${locationMapUrl}\n` +
      ` Auto Calculated Distance: ${distanceKm ? `${distanceKm} km` : 'N/A'}\n\n` +
      `*Order Summary:*\n${itemsListText}\n` +
      `Subtotal: ₹${itemsTotal}\n` +
      `Delivery Fee: ₹${deliveryCharge} ${deliveryCharge > 0 ? '(Beyond 3km Fee)' : '(Free)'}\n` +
      `*Total Final Amount:* ₹${finalTotal}\n\n` +
      `Please confirm the order delivery!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919725674462?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl relative border border-amber-300 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-stone-950 text-white p-4 px-6 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-amber-400" size={20} />
            <h2 className="text-lg font-black text-amber-300">Checkout & Delivery Details</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
            <X size={18} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <ShoppingBag size={48} className="text-stone-300" />
            <p className="text-stone-600 font-bold">Aapki cart khali hai!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
            
            {/* Left Column: Items List */}
            <div className="md:col-span-6 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-stone-200 bg-stone-50/50 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
                  Cart Items ({cartItems.length})
                </h3>
                <button onClick={onClearCart} className="text-xs text-red-600 font-bold hover:underline">
                  Clear All
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-65 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.weight}`} className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2.5">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-stone-900 text-xs truncate">{item.name}</h4>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {item.weight}
                      </span>
                      <p className="text-xs font-black text-red-900 mt-0.5">₹{item.price * item.quantity}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                        <button onClick={() => onUpdateQuantity(item.id, item.weight, -1)} className="p-0.5 hover:bg-stone-200 rounded">
                          <Minus size={12} />
                        </button>
                        <span className="px-1.5 text-xs font-black">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.weight, 1)} className="p-0.5 hover:bg-stone-200 rounded">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => onRemoveItem(item.id, item.weight)} className="p-1 text-stone-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount Breakdown */}
              <div className="mt-auto pt-3 border-t border-stone-200 space-y-1">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Items Subtotal:</span>
                  <span>₹{itemsTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Delivery Charge:</span>
                  <span className={deliveryCharge > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {deliveryCharge > 0 ? `+ ₹${deliveryCharge} (>3km distance)` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-stone-900 pt-1 border-t border-dashed">
                  <span>Total Payable:</span>
                  <span className="text-base text-red-900">₹{finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Location Form */}
            <div className="md:col-span-6 p-4 sm:p-5 bg-white flex flex-col justify-between">
              <form onSubmit={handleWhatsAppCheckout} className="space-y-3">
                <h3 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
                  Customer & Delivery Location
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-stone-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-stone-700">Enter Delivery Address *</label>
                    {isCalculating && (
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Detecting Distance...
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Type locality (e.g., Aalap Green City, Gotri, Vadodara)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-400"
                  />
                  {geocodeError && (
                    <p className="text-[10px] text-red-500 mt-1">
                      Exact location not found. Try entering area name (e.g., Gotri, Vadodara).
                    </p>
                  )}
                </div>

                {/* Live Auto-Updating Map View */}
                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 h-28 relative">
                  <iframe
                    title="Live Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${
                      userCoords
                        ? `${userCoords.lat},${userCoords.lng}`
                        : encodeURIComponent(customerAddress ? `${customerAddress}, Vadodara` : 'Tarsali, Vadodara')
                    }&z=15&output=embed`}
                  />
                </div>

                {/* Dynamic Distance Badge */}
                {distanceKm !== null && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-stone-900 flex items-center gap-1">
                        <MapPin size={13} className="text-red-600" /> Distance: {distanceKm} KM
                      </p>
                      <p className="text-[10px] text-stone-600">Calculated from Tarsali, Vadodara</p>
                    </div>
                    <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${deliveryCharge > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {deliveryCharge > 0 ? '+ ₹200 Delivery Fee' : 'Free Delivery'}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Send size={14} /> Send Order on WhatsApp
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}