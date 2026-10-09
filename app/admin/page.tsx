'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LogOut,
  Package,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  X,
  FileText,
  Image as ImageIcon,
  Phone,
  MapPin,
  User,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { products as initialProductsData, Product } from '@/data/products';

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Password
  const ADMIN_PASSWORD = 'jy';

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modal / Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Hidden Ref for Printable/Image Catalog
  const printRef = useRef<HTMLDivElement>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Namkeen',
    price: 200,
    unit: 'kg',
    img: '/placeholder.jpg',
    description: '',
    ingredients: '',
    shelfLife: '60 Days',
    videoUrl: '',
    weights: ['250g', '500g', '1 kg'],
  });

  // Prevent SSR Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
    const sessionAuth = sessionStorage.getItem('renuka_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }

    const savedProducts = localStorage.getItem('renuka_admin_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(initialProductsData);
      }
    } else {
      setProducts(initialProductsData);
    }
  }, []);

  // Save to LocalStorage & Dispatch Event for Instant Website Sync
  const saveProductsToStorage = (updatedList: Product[]) => {
    setProducts(updatedList);
    localStorage.setItem('renuka_admin_products', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('renuka_products_updated'));
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('renuka_admin_auth', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Password! Kripya sahi password darj karein.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('renuka_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const createdProduct: Product = {
      id: Date.now(),
      ...newProduct,
    };
    const updated = [createdProduct, ...products];
    saveProductsToStorage(updated);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      category: 'Namkeen',
      price: 200,
      unit: 'kg',
      img: '/placeholder.jpg',
      description: '',
      ingredients: '',
      shelfLife: '60 Days',
      videoUrl: '',
      weights: ['250g', '500g', '1 kg'],
    });
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    if (confirm('Kya aap is product ko catalog se hatana chahte hain?')) {
      const updated = products.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
    }
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    saveProductsToStorage(updated);
    setEditingProduct(null);
  };

  // 1️⃣ Direct PNG Image Download (Works on Mobile)
  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 1,
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = `Renuka_Namkeen_Menu_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image Download Error', err);
      alert('Mobile me image save karne ke liye PDF option ka use karein.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2️⃣ Direct PDF Download for Mobile Storage (Using jsPDF + html2canvas-pro)
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0c0a09',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Renuka_Namkeen_Menu_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error', err);
      alert('PDF download me samsya aayi. Kripya punah prayas karein.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isMounted) return null;

  // 🔒 LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-950 border border-stone-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl space-y-6 text-stone-100">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Lock size={28} />
            </div>
            <h1 className="text-xl font-black text-white">Renuka Admin Portal</h1>
            <p className="text-xs text-stone-400">Restricted Access. Kripya password darj karein.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                suppressHydrationWarning
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                <ShieldAlert size={14} /> {errorMsg}
              </p>
            )}

            <button
              type="submit"
              suppressHydrationWarning
              className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-lg active:scale-95"
            >
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🛠️ ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-stone-950 border border-stone-800 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-wider">
                Renuka Namkeen - Admin Panel
              </h1>
              <p className="text-xs text-stone-400">Manage Catalog, Prices & Inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              suppressHydrationWarning
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-50 px-3.5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-md"
            >
              <ImageIcon size={14} /> {isGenerating ? 'Processing...' : 'Download Image'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              suppressHydrationWarning
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 disabled:opacity-50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <FileText size={14} /> {isGenerating ? 'Processing...' : 'Download PDF'}
            </button>

            <button
              onClick={handleLogout}
              suppressHydrationWarning
              className="flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-red-400 border border-stone-800 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-stone-800 pb-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wide">
              Product Catalog ({products.length} Items)
            </h2>

            <button
              onClick={() => setIsAddModalOpen(true)}
              suppressHydrationWarning
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg active:scale-95"
            >
              <Plus size={15} /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-800 text-amber-400 font-bold uppercase">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/50 transition">
                    <td className="py-3 px-3 font-mono text-stone-500">#{p.id}</td>
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <img
                        src={p.img || '/placeholder.jpg'}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover bg-stone-900 border border-stone-800 shrink-0"
                      />
                      <span className="line-clamp-1">{p.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md text-[10px] text-amber-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-400">₹{p.price}/{p.unit}</td>
                    <td className="py-3 px-3 text-right space-x-1 sm:space-x-2 shrink-0">
                      <button
                        onClick={() => setEditingProduct(p)}
                        suppressHydrationWarning
                        className="text-stone-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-stone-900 transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        suppressHydrationWarning
                        className="text-stone-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🖼️ MOBILE OPTIMIZED DESIGNED POSTER CARD (Captured for PNG & PDF) */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div
          ref={printRef}
          className="w-175 bg-stone-950 border-2 border-amber-400 p-6 rounded-3xl space-y-5 text-stone-100 font-sans shadow-2xl"
        >
          {/* Header Banner */}
          <div className="text-center border-b-2 border-stone-800 pb-4 space-y-2">
            <h1 className="text-2xl font-black text-amber-400 tracking-wider uppercase">
              RENUKA FOODS & NAMKEEN
            </h1>
            <div className="inline-block bg-amber-400 text-stone-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Official Rate List
            </div>

            <div className="flex justify-center items-center gap-4 text-xs text-stone-200 font-semibold pt-1">
              <span className="flex items-center gap-1 text-stone-300">
                <MapPin size={13} className="text-amber-400" /> Tarsali, Vadodara
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <User size={13} className="text-amber-400" /> Contact: Jyoti P. Deshpande
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Phone size={13} className="text-amber-400" /> WhatsApp: +91 9725674462
              </span>
            </div>
          </div>

          {/* Clean Compact Product Table */}
          <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-800 text-amber-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 text-center w-10">#</th>
                  <th className="py-2 px-2">Product Name</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 text-stone-200 text-xs font-medium">
                {products.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-1.5 px-2 text-center font-mono text-stone-500">#{idx + 1}</td>
                    <td className="py-1.5 px-2 font-bold text-white">{p.name}</td>
                    <td className="py-1.5 px-2">
                      <span className="bg-stone-950 border border-stone-800 px-1.5 py-0.5 rounded text-[9px] text-amber-300 font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-amber-400">
                      ₹{p.price} <span className="text-[9px] text-stone-400 font-normal">/ {p.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-800 pt-2 font-semibold">
            <span> Fresh & Homemade Gujarati Taste</span>
            <span>Contact: Jyoti P. Deshpande • WhatsApp: +91 9725674462</span>
          </div>
        </div>
      </div>

      {/* ➕ ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 max-w-md w-full p-6 rounded-3xl space-y-4 relative shadow-2xl text-white">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-amber-400">Add New Product</h3>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Product Name (English & Gujarati)</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Sev Mamra (સેવ મમરા)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Namkeen">Namkeen</option>
                    <option value="Sweets">Sweets</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Pickles">Pickles</option>
                    <option value="Chatni">Chatni</option>
                    <option value="Flour Mix">Flour Mix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Image Path / URL</label>
                <input
                  type="text"
                  placeholder="/images/product.png"
                  value={newProduct.img}
                  onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                suppressHydrationWarning
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer mt-2"
              >
                Save Product to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 max-w-md w-full p-6 rounded-3xl space-y-4 relative shadow-2xl text-white">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-amber-400">Edit Product #{editingProduct.id}</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                suppressHydrationWarning
                className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}