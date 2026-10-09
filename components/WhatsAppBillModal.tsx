'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Download, X, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function WhatsAppBillModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartData, setCartData] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{ name?: string; phone?: string; address?: string }>({});
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWhatsAppRedirect = () => {
      const savedCart = localStorage.getItem('renuka_cart');
      const savedCustomer = localStorage.getItem('renuka_customer');

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          const items = Object.values(parsedCart);

          if (items.length > 0) {
            setCartData(items);

            if (savedCustomer) {
              setCustomerInfo(JSON.parse(savedCustomer));
            }

            setIsOpen(true);

            // 🧹 Clear localStorage so it resets for next order
            localStorage.removeItem('renuka_cart');
            localStorage.removeItem('renuka_customer');

            window.dispatchEvent(new Event('cart_cleared'));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('blur', handleWhatsAppRedirect);

    return () => {
      window.removeEventListener('blur', handleWhatsAppRedirect);
    };
  }, []);

  const handleCloseAndReset = () => {
    setIsOpen(false);
    window.location.reload();
  };

  const handleDownloadBill = async () => {
    if (!billRef.current) return;
    try {
      const dataUrl = await toPng(billRef.current, {
        cacheBust: true,
        skipFonts: true,
        filter: (node) => {
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `Renuka_Foods_Bill_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Bill download failed', err);
    }
  };

  if (!isOpen) return null;

  const totalAmount = cartData.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-stone-950 border border-amber-400/40 rounded-3xl max-w-sm w-full p-6 relative shadow-2xl text-stone-100">
        
        {/* Close Button */}
        <button
          onClick={handleCloseAndReset}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Success Header */}
        <div className="text-center mb-4">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2 border border-emerald-500/30">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-lg font-black text-white">Order Sent to WhatsApp!</h3>
          <p className="text-[11px] text-stone-400">
            Aapka bill receipt niche ready hai.
          </p>
        </div>

        {/* 🧾 BILL INVOICE BOX */}
        <div
          ref={billRef}
          className="bg-stone-900 border border-stone-800 p-4 rounded-2xl my-3 text-xs"
        >
          <div className="text-center border-b border-stone-800 pb-2 mb-3">
            <h4 className="font-black text-amber-400 uppercase text-sm">
              Renuka Foods & Namkeen
            </h4>
            <p className="text-[9px] text-stone-400">Tax Invoice / Order Receipt</p>
          </div>

          {/* Customer & Order Details */}
          <div className="space-y-1 mb-3 text-stone-300 text-[11px]">
            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            {customerInfo.name && <p><strong>Customer:</strong> {customerInfo.name}</p>}
            {customerInfo.phone && <p><strong>Phone:</strong> {customerInfo.phone}</p>}
            {customerInfo.address && <p><strong>Address:</strong> {customerInfo.address}</p>}
            <p><strong>Status:</strong> Sent via WhatsApp</p>
          </div>

          {/* Items List */}
          <div className="border-t border-b border-stone-800 py-2 my-2 space-y-1">
            {cartData.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-stone-300">
                <span>{item.name} ({item.weight})</span>
                <span>{item.quantity}x • ₹{item.unitPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-amber-400 font-black text-sm pt-1">
            <span>Total Payable:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <button
            onClick={handleDownloadBill}
            className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition active:scale-95 cursor-pointer shadow-lg"
          >
            <Download size={16} /> Download Bill Photo
          </button>

          <button
            onClick={handleCloseAndReset}
            className="w-full bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs border border-stone-800 transition cursor-pointer"
          >
            <RefreshCw size={14} /> Start Fresh Order
          </button>
        </div>
      </div>
    </div>
  );
}