'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  Play,
  X,
  UtensilsCrossed,
  CheckCircle2,
  ShoppingCart,
  Trash2,
  Eye,
} from 'lucide-react';
import { products, categories } from '@/data/products';

const WEIGHT_OPTIONS = [
  { label: '500g', multiplier: 0.5 },
  { label: '1kg', multiplier: 1 },
  { label: '2kg', multiplier: 2 },
];

interface CartItem {
  id: number;
  name: string;
  weight: string;
  unitPrice: number;
  quantity: number;
  img?: string;
  addedAt?: number;
}

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950">
      <Suspense
        fallback={
          <div className="p-10 text-center text-amber-400 font-bold">
            Loading Renuka Menu...
          </div>
        }
      >
        <MenuContent />
      </Suspense>
    </div>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalWeight, setModalWeight] = useState<string>('500g');
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // Load Cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('renuka_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error reading cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save Cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('renuka_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const getCalculatedPrice = (basePrice: number, weightLabel: string) => {
    const opt = WEIGHT_OPTIONS.find((w) => w.label === weightLabel);
    const multiplier = opt ? opt.multiplier : 1;
    return basePrice * multiplier;
  };

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setModalWeight('500g');

    const cartKey = `${product.id}-500g`;
    if (cart[cartKey]) {
      setModalQuantity(cart[cartKey].quantity);
    } else {
      setModalQuantity(1);
    }
  };

  const handleWeightChange = (weightLabel: string) => {
    setModalWeight(weightLabel);
    if (selectedProduct) {
      const cartKey = `${selectedProduct.id}-${weightLabel}`;
      if (cart[cartKey]) {
        setModalQuantity(cart[cartKey].quantity);
      } else {
        setModalQuantity(1);
      }
    }
  };

  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;

    const cartKey = `${selectedProduct.id}-${modalWeight}`;
    const unitPrice = getCalculatedPrice(Number(selectedProduct.price), modalWeight);

    setCart((prevCart) => ({
      ...prevCart,
      [cartKey]: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        weight: modalWeight,
        unitPrice: unitPrice,
        quantity: modalQuantity,
        img: selectedProduct.img,
        addedAt: Date.now(),
      },
    }));

    setSelectedProduct(null);
  };

  const handleUpdateCardQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };

      const existingEntries = Object.entries(newCart).filter(([key, item]) =>
        item.id === productId
      );

      if (existingEntries.length === 0 && delta > 0) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          const key = `${productId}-500g`;
          newCart[key] = {
            id: product.id,
            name: product.name,
            weight: '500g',
            unitPrice: getCalculatedPrice(Number(product.price), '500g'),
            quantity: 1,
            img: product.img,
            addedAt: Date.now(),
          };
        }
        return newCart;
      }

      if (existingEntries.length > 0) {
        existingEntries.sort((a, b) => (b[1].addedAt || 0) - (a[1].addedAt || 0));

        const [targetKey, targetItem] = existingEntries[0];
        const updatedQty = targetItem.quantity + delta;

        if (updatedQty <= 0) {
          delete newCart[targetKey];
        } else {
          newCart[targetKey] = {
            ...targetItem,
            quantity: updatedQty,
          };
        }
      }

      return newCart;
    });
  };

  const cartItemList = Object.values(cart);
  const totalItemCount = cartItemList.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItemList.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-xs font-bold transition"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Renuka Foods & Namkeen
        </span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white">Our Complete Menu</h1>
        <p className="text-xs text-stone-400 mt-2">
          Select pack weight and quantity to add snacks to your cart.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-black'
                : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-400/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((item) => {
          const itemCartEntries = cartItemList.filter((c) => c.id === item.id);
          const totalQtyInCart = itemCartEntries.reduce((sum, c) => sum + c.quantity, 0);

          return (
            <div
              key={item.id}
              className={`bg-stone-950 rounded-3xl overflow-hidden border transition duration-300 flex flex-col justify-between shadow-lg ${
                totalQtyInCart > 0
                  ? 'border-amber-400/80 ring-1 ring-amber-400/30'
                  : 'border-stone-800'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-900 group">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-stone-900/90 text-amber-300 text-[10px] uppercase font-black px-3 py-1 rounded-full border border-amber-400/20">
                    {item.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-extrabold text-white text-base">
                      {item.name}
                    </h3>
                    {totalQtyInCart > 0 && (
                      <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> {totalQtyInCart} in Cart
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Selected Weights Summary Chips */}
                  {totalQtyInCart > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {itemCartEntries.map((c) => (
                        <span
                          key={`${c.id}-${c.weight}`}
                          className="text-[10px] bg-stone-900 border border-stone-800 text-stone-300 px-2 py-0.5 rounded-md font-medium"
                        >
                          {c.weight}: <strong className="text-amber-400">{c.quantity}x</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex justify-between items-center border-t border-stone-800 pt-4">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">
                      Starting Price (1kg)
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {totalQtyInCart > 0 ? (
                      /* Jab Item Selected hai: Counter [- Qty +] + Add Button (Eye Button Nahi Aayega) */
                      <>
                        <div className="flex items-center bg-stone-900 border border-amber-400/50 rounded-xl p-1 shadow-md">
                          <button
                            onClick={() => handleUpdateCardQuantity(item.id, -1)}
                            className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-stone-950 rounded-lg transition active:scale-95 cursor-pointer"
                            title="Decrease Last Added Variant"
                          >
                            {totalQtyInCart === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </button>

                          <span className="text-xs font-black text-amber-400 px-2 min-w-[20px] text-center">
                            {totalQtyInCart}
                          </span>

                          <button
                            onClick={() => handleUpdateCardQuantity(item.id, 1)}
                            className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-950 rounded-lg transition active:scale-95 cursor-pointer"
                            title="Increase Last Added Variant"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenModal(item)}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition shadow-lg active:scale-95 cursor-pointer"
                          title="Select Weight / Add Variant"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </>
                    ) : (
                      /* Jab Kuch Select Nahi Hai: Eye Button + Single [+ Add] Button */
                      <>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl border border-stone-800 hover:border-amber-400/40 transition active:scale-95 cursor-pointer"
                          title="View Details & Video"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenModal(item)}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg active:scale-95 cursor-pointer"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Checkout Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto bg-amber-400 text-stone-950 p-4 rounded-3xl shadow-2xl border border-amber-300 flex justify-between items-center z-40 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="bg-stone-950 text-amber-400 p-2.5 rounded-2xl">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-stone-800 block">
                {cartItemList.length} Items ({totalItemCount} Packs)
              </span>
              <span className="text-lg font-black text-stone-950">
                Total: ₹{totalPrice}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/order')}
            className="bg-stone-950 hover:bg-stone-900 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
          >
            Checkout <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Modal Popup with Demo + Weight + Quantity Selector */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-30 bg-stone-900/90 text-stone-300 hover:text-white p-2 rounded-full border border-stone-700 transition cursor-pointer shadow-lg"
            >
              <X size={18} />
            </button>

            {/* Video / Demo Section */}
            <div className="relative w-full h-72 sm:h-80 bg-stone-950 shrink-0 flex items-center justify-center overflow-hidden border-b border-stone-800">
              {selectedProduct.videoUrl ? (
                selectedProduct.videoUrl.endsWith('.mp4') || selectedProduct.videoUrl.startsWith('/') ? (
                  <video
                    src={selectedProduct.videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={selectedProduct.videoUrl}
                    title={selectedProduct.name}
                    className="w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/40 p-4 text-center">
                    <div className="bg-amber-400/20 text-amber-400 p-3 rounded-full border border-amber-400/40 mb-1.5">
                      <Play size={24} className="fill-amber-400 ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-stone-200">
                      Product Making & Demo Teaser
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {selectedProduct.name}
                </h2>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  {selectedProduct.category}
                </span>
                <p className="text-stone-300 text-xs leading-relaxed mt-1">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Ingredients Box */}
              <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs mb-1">
                  <UtensilsCrossed size={14} /> Ingredients (सामग्री):
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {selectedProduct.ingredients ||
                    'Besan, Pure Edible Oil, Iodized Salt, Black Pepper, Ajwain, Spices & Herbs.'}
                </p>
              </div>

              {/* Weight & Quantity Controls */}
              <div className="bg-stone-900/60 p-4 rounded-2xl border border-amber-400/20 space-y-4">
                {/* Pack Weight Selection */}
                <div>
                  <label className="text-[11px] text-amber-400 uppercase font-black block mb-2">
                    1. Select Pack Weight:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WEIGHT_OPTIONS.map((w) => {
                      const priceForWeight = getCalculatedPrice(
                        Number(selectedProduct.price),
                        w.label
                      );
                      return (
                        <button
                          key={w.label}
                          onClick={() => handleWeightChange(w.label)}
                          className={`py-2 px-2 rounded-xl text-center border transition text-xs flex flex-col items-center justify-center cursor-pointer ${
                            modalWeight === w.label
                              ? 'bg-amber-400 text-stone-950 border-amber-400 font-black'
                              : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-400/40 font-semibold'
                          }`}
                        >
                          <span className="text-sm font-extrabold">{w.label}</span>
                          <span
                            className={`text-[10px] ${
                              modalWeight === w.label
                                ? 'text-stone-900 font-bold'
                                : 'text-amber-400 font-bold'
                            }`}
                          >
                            ₹{priceForWeight}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Quantity Selector */}
                <div>
                  <label className="text-[11px] text-amber-400 uppercase font-black block mb-2">
                    2. Quantity (Packs):
                  </label>
                  <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-xs text-stone-300 font-bold pl-1">
                      {modalWeight} Pack Quantity:
                    </span>
                    <div className="flex items-center gap-3 bg-stone-900 p-1.5 rounded-xl border border-amber-400/40">
                      <button
                        onClick={() =>
                          setModalQuantity((q) => (q > 1 ? q - 1 : 1))
                        }
                        className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-950 rounded-lg transition active:scale-95 cursor-pointer"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-black text-amber-400 min-w-[24px] text-center">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-950 rounded-lg transition active:scale-95 cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="bg-stone-950 hover:bg-stone-900 text-stone-300 border border-stone-800 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back to Menu
                  </button>

                  <button
                    onClick={handleAddToCartFromModal}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={15} /> Add ({modalQuantity} Pack) • ₹
                    {getCalculatedPrice(
                      Number(selectedProduct.price),
                      modalWeight
                    ) * modalQuantity}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}