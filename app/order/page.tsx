'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  FileText,
  PackageCheck,
  Tag,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  Truck,
  Store,
  ExternalLink,
  Navigation,
  Crosshair,
} from 'lucide-react';
import { products } from '@/data/products';

interface CartItem {
  id: number;
  name: string;
  weight: string;
  unitPrice: number;
  quantity: number;
  img?: string;
}

function OrderContent() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Delivery & Location states
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Form Fields
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [note, setNote] = useState('');

  // Load Cart Data
  useEffect(() => {
    const savedCart = localStorage.getItem('renuka_cart');
    if (savedCart) {
      try {
        const parsedCart: Record<string, CartItem> = JSON.parse(savedCart);
        Object.keys(parsedCart).forEach((key) => {
          const item = parsedCart[key];
          const matched = products.find((p) => p.id === item.id);
          parsedCart[key].img = item.img || matched?.img || '/placeholder.jpg';
        });
        setCart(parsedCart);
      } catch (err) {
        console.error('Error loading cart in Order page:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('renuka_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // GPS Location Detection
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Aapke browser me Live Location support nahi hai.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        alert('Live GPS Location successfully detect ho gayi hai!');
      },
      (error) => {
        console.error('GPS Location Error:', error);
        alert('Live location detect nahi ho saki. Kripya location permissions check karein.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quantity Handlers
  const handleIncreaseQuantity = (cartKey: string) => {
    setCart((prevCart) => {
      const item = prevCart[cartKey];
      if (!item) return prevCart;
      return {
        ...prevCart,
        [cartKey]: { ...item, quantity: item.quantity + 1 },
      };
    });
  };

  const handleDecreaseQuantity = (cartKey: string) => {
    setCart((prevCart) => {
      const item = prevCart[cartKey];
      if (!item) return prevCart;
      if (item.quantity <= 1) {
        const updated = { ...prevCart };
        delete updated[cartKey];
        return updated;
      }
      return {
        ...prevCart,
        [cartKey]: { ...item, quantity: item.quantity - 1 },
      };
    });
  };

  const handleRemoveItem = (cartKey: string) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      delete updated[cartKey];
      return updated;
    });
  };

  const cartItems = Object.entries(cart).map(([key, item]) => ({
    key,
    ...item,
  }));

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalPacks = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function: House/Flat numbers ko Google Maps Search query se saaf karne ke liye
  const getSearchableAddress = (rawAddress: string) => {
    return rawAddress
      .replace(/^[A-Za-z0-9/-]+\s*,?\s*/, '')
      .trim();
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userPhone) {
      alert('Kripya apna Naam aur Phone Number bharein.');
      return;
    }

    if (deliveryMode === 'delivery' && !userAddress) {
      alert('Kripya apna Delivery Address/Landmark bharein.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Aapka cart khali hai. Menu se items add karein.');
      return;
    }

    // 🟢 CUSTOMER DETAILS SAVED FOR BILL MODAL
    const customerDetails = {
      name: userName,
      phone: userPhone,
      address: deliveryMode === 'pickup' ? 'Self Pickup (Store)' : userAddress,
    };
    localStorage.setItem('renuka_customer', JSON.stringify(customerDetails));

    const formattedItems = cartItems
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (${item.weight})%0A   Qty: ${item.quantity} × ₹${item.unitPrice} = *₹${
            item.quantity * item.unitPrice
          }*`
      )
      .join('%0A%0A');

    // Live GPS Location URL if available, else clean landmark search
    let mapsLink = '';
    if (userCoords) {
      mapsLink = `https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`;
    } else {
      const cleanedAddr = getSearchableAddress(userAddress) || userAddress;
      mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${cleanedAddr},${pincode ? pincode + ', ' : ''}Vadodara, Gujarat`
      )}`;
    }

    const deliveryDetailText =
      deliveryMode === 'pickup'
        ? `*Order Type:* 🏪 SELF PICKUP (Store: Mangla Marvel, Tarsali)`
        : `*Order Type:* 🚚 HOME DELIVERY%0A- *Address:* ${encodeURIComponent(
            userAddress
          )}${pincode ? `%0A- *Pincode:* ${pincode}` : ''}%0A- *Google Maps Location:* ${encodeURIComponent(
            mapsLink
          )}`;

    const message = `*NEW ORDER - RENUKA NAMKEEN*%0A%0A*Customer Details:*%0A- *Name:* ${encodeURIComponent(
      userName
    )}%0A- *Phone:* ${encodeURIComponent(userPhone)}%0A${deliveryDetailText}${
      note ? `%0A- *Note:* ${encodeURIComponent(note)}` : ''
    }%0A%0A*Order Items (${cartItems.length} Products, ${totalPacks} Packs):*%0A${formattedItems}%0A%0A*TOTAL AMOUNT: ₹${itemsTotal}*%0A%0APlease confirm order and payment options.`;

    window.open(`https://wa.me/919725674462?text=${message}`, '_blank');
  };

  // Maps Preview Iframe Query
  const cleanedPreviewAddr = userCoords
    ? `${userCoords.lat},${userCoords.lng}`
    : `${getSearchableAddress(userAddress) || userAddress}${
        pincode ? ', ' + pincode : ''
      }, Vadodara, Gujarat`;

  const googleMapsIframeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    cleanedPreviewAddr
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/menu')}
        className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-xs font-bold mb-6 transition cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 bg-stone-950 p-5 rounded-3xl border border-stone-800 space-y-4 lg:sticky lg:top-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-amber-400" />
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                Order Summary
              </h2>
            </div>
            {cartItems.length > 0 && (
              <span className="text-[10px] bg-amber-400/10 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/20">
                {totalPacks} {totalPacks === 1 ? 'Pack' : 'Packs'}
              </span>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <ShoppingBasket size={20} />
              </div>
              <p className="text-stone-400 text-xs font-medium">Aapka cart khali hai.</p>
              <button
                onClick={() => router.push('/menu')}
                className="inline-block text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                + Menu se snacks add karein
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1 custom-scrollbar">
              {cartItems.map((item) => (
                <div
                  key={item.key}
                  className="bg-stone-900/70 hover:bg-stone-900 p-3 rounded-2xl border border-stone-800/80 transition space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-950 shrink-0 border border-stone-800"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate leading-snug">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded">
                          {item.weight}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ₹{item.unitPrice}/pack
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.key)}
                      title="Remove Item"
                      className="text-stone-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center border-t border-stone-800/60 pt-2">
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity(item.key)}
                        className="p-1 text-stone-400 hover:text-amber-400 hover:bg-stone-900 rounded transition active:scale-95"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseQuantity(item.key)}
                        className="p-1 text-stone-400 hover:text-amber-400 hover:bg-stone-900 rounded transition active:scale-95"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-amber-400 text-xs">
                        ₹{item.quantity * item.unitPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="border-t border-stone-800/80 pt-3.5 space-y-2">
            <div className="flex justify-between items-center border-t border-stone-800/50 pt-2.5 text-sm">
              <span className="font-black text-white">Total Amount</span>
              <span className="text-xl font-black text-amber-400">₹{itemsTotal}</span>
            </div>
          </div>
        </div>

        {/* Customer Address Form */}
        <div className="lg:col-span-2 bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6">
          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-xl font-black text-white">Checkout Details</h2>
            <p className="text-xs text-stone-400 mt-1">
              Select delivery option and complete your details.
            </p>
          </div>

          <form onSubmit={handleWhatsAppOrder} className="space-y-6">
            {/* Delivery Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                1. Select Order Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('delivery')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                    deliveryMode === 'delivery'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400 font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Truck size={20} />
                  <span className="text-xs">Home Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('pickup')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                    deliveryMode === 'pickup'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400 font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Store size={20} />
                  <span className="text-xs">Self Pickup (Store)</span>
                </button>
              </div>
            </div>

            {/* Pickup Details */}
            {deliveryMode === 'pickup' && (
              <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Store size={14} /> Store Address:
                </p>
                <p className="text-stone-300 font-medium">
                  Renuka Namkeen, Mangla Marvel, Tarsali, Vadodara, Gujarat 390009
                </p>
              </div>
            )}

            {/* Customer Inputs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} /> 2. Customer Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 block mb-1 font-medium">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-stone-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1 font-medium">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3 text-stone-500" />
                    <input
                      type="tel"
                      required
                      placeholder="WhatsApp / Phone No"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address & Google Maps Section */}
              {deliveryMode === 'delivery' && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-stone-300 font-medium">
                      3. Delivery Address & Landmark *
                    </label>

                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                    >
                      <Crosshair size={13} /> Detect My GPS Location
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-stone-500" />
                    <textarea
                      required
                      rows={3}
                      placeholder="E.g. B-204, Shreeji Residency, Opp. Eva Mall, Manjalpur, Vadodara..."
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-stone-300 block mb-1 font-medium">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. 390011"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  {/* Google Maps View */}
                  {userAddress.length >= 3 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-stone-300">
                        <span className="font-bold flex items-center gap-1.5 text-amber-400">
                          <Navigation size={14} /> Location Preview
                        </span>
                        <a
                          href={
                            userCoords
                              ? `https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  `${getSearchableAddress(userAddress)}, Vadodara, Gujarat`
                                )}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-amber-400 underline font-medium hover:text-amber-300"
                        >
                          Open in Google Maps <ExternalLink size={11} />
                        </a>
                      </div>

                      {/* Display Location Badge Header above Map */}
                      <div className="bg-amber-400/10 border border-amber-400/30 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-300 font-semibold">
                        <MapPin size={16} className="text-amber-400 shrink-0 animate-bounce" />
                        <span className="truncate">
                          Selected Location: <strong className="text-white">{userAddress}</strong>
                          {userCoords && <span className="text-emerald-400 ml-1.5">(GPS Live Pin Attached)</span>}
                        </span>
                      </div>

                      {/* Explicit Google Maps Embed Iframe */}
                      <div className="w-full h-56 rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 relative shadow-inner z-0">
                        <iframe
                          title="Google Maps Location Preview"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={googleMapsIframeUrl}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-stone-300 block mb-1 font-medium">
                  Special Instructions (Optional)
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-3 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Less spicy, extra crisp, timing preference..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={cartItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={16} /> Send Complete Order & Google Map Link on WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950">
      <Suspense
        fallback={
          <div className="p-10 text-center text-amber-400 font-bold">
            Loading Order Details...
          </div>
        }
      >
        <OrderContent />
      </Suspense>
    </div>
  );
}