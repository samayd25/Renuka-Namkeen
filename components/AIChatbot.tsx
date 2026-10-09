'use client';

import React, { useState, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { products as initialProductsData, Product } from '@/data/products';

export default function AIChatbot() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<Product[]>(initialProductsData);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! Main Renuka-Namkeen AI Assistant hu. Aap hamare catalog ki kisi bhi item ke baare me pooch sakte hain!',
    },
  ]);
  const [userInput, setUserInput] = useState<string>('');

  // Sync Products from localStorage or fallback to initial dataset
  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem('renuka_admin_products');
      if (saved) {
        try {
          setProductsList(JSON.parse(saved));
        } catch (e) {
          setProductsList(initialProductsData);
        }
      } else {
        setProductsList(initialProductsData);
      }
    };

    loadProducts();
    window.addEventListener('renuka_products_updated', loadProducts);
    return () => {
      window.removeEventListener('renuka_products_updated', loadProducts);
    };
  }, []);

  // Quick Action Suggestions
  const suggestions = [
    '🔥 Special Items',
    '🫓 Methi Puri',
    '🍫 Besan Ladu',
    '📞 WhatsApp Contact',
  ];

  const processQuery = (userQuery: string) => {
    if (!userQuery.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user' as const, text: userQuery }];
    setChatMessages(newMessages);
    setUserInput('');

    setTimeout(() => {
      const query = userQuery.toLowerCase().trim();
      let botReply = '';

      // 1. Find all products matching the search query
      const matchingProducts = productsList.filter((p) => {
        const pName = p.name.toLowerCase();
        const pCategory = p.category ? p.category.toLowerCase() : '';
        
        // Split name into words (tokens) to match generic terms like "chakli", "chivda", "ladoo", "puri"
        const tokens = pName.split(/[\s,()/-]+/);
        return (
          pName.includes(query) ||
          query.includes(pName) ||
          tokens.some((token) => token.length > 2 && query.includes(token)) ||
          (pCategory && query.includes(pCategory))
        );
      });

      // 2. Disambiguation logic: If multiple items match (e.g. user just typed "chakli" or "chivda")
      if (matchingProducts.length > 1) {
        const itemsList = matchingProducts
          .map((p) => `• ${p.name} - ₹${p.price}/${p.unit}`)
          .join('\n');
        botReply = `Aap konsi item ki baat kar rahe hain? Hamare paas yeh options available hain:\n\n${itemsList}\n\nAap exact naam batayein, main details de dunga!`;
      } 
      // 3. Exact Single Match Found
      else if (matchingProducts.length === 1) {
        const matchedProduct = matchingProducts[0];
        botReply = `🫓 **${matchedProduct.name}**\n• Category: ${matchedProduct.category}\n• Price: ₹${matchedProduct.price} / ${matchedProduct.unit}\n\nPure homemade & fresh! Order karne ke liye WhatsApp par contact karein: +91 9725674462.`;
      } 
      // 4. General Queries (Special / Rate List / Delivery)
      else if (
        query.includes('special') ||
        query.includes('best') ||
        query.includes('popular') ||
        query.includes('🔥')
      ) {
        const topItems = productsList
          .slice(0, 5)
          .map((p) => `• ${p.name} - ₹${p.price}/${p.unit}`)
          .join('\n');
        botReply = `🌟 **Renuka Special Items:**\n${topItems}\n\nDirect WhatsApp order: +91 9725674462`;
      } else if (
        query.includes('price') ||
        query.includes('rate') ||
        query.includes('bhav') ||
        query.includes('menu')
      ) {
        botReply = `💰 Hamare paas Total ${productsList.length} Items available hain!\n\nAap kisi bhi specific item ka naam likhkar price pooch sakte hain ya Menu page par dekh sakte hain.`;
      } else if (
        query.includes('delivery') ||
        query.includes('address') ||
        query.includes('location')
      ) {
        botReply = `🚚 **Delivery & Location:**\n• Address: Tarsali, Vadodara\n• Fresh Home Delivery available in Vadodara!`;
      } 
      // 5. Fallback Response (For items outside the catalog)
      else {
        botReply = `Mafi chahte hain, yeh item hamare menu list me available nahi hai.\n\nAap iski jankari ke liye direct **Jyoti P. Deshpande (+91 9725674462)** se contact karke pooch sakte hain!`;
      }

      setChatMessages([...newMessages, { sender: 'ai', text: botReply }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isChatOpen ? (
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition duration-300 font-black text-xs border border-amber-300 active:scale-95 cursor-pointer"
        >
          <Bot size={22} className="text-stone-950 animate-bounce" />
          <span>Need Help? Ask AI Assistant</span>
        </button>
      ) : (
        <div className="bg-stone-950 rounded-3xl shadow-2xl border border-stone-800 w-[88vw] sm:w-96 max-w-sm h-[450px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-3.5 flex justify-between items-center border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-400/30">
                <Bot size={18} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-amber-300">Renuka Namkeen Assistant</h4>
                <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                  ● {productsList.length} Items Connected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-stone-900/60 min-h-0">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-amber-400 text-stone-950 font-bold rounded-br-none shadow-md'
                      : 'bg-stone-950 text-stone-200 border border-stone-800 rounded-bl-none shadow-inner'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-2 bg-stone-950 border-t border-stone-800/80 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {suggestions.map((chip, i) => (
              <button
                key={i}
                onClick={() => processQuery(chip)}
                className="whitespace-nowrap bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-amber-300 border border-stone-800 px-2.5 py-1 rounded-full text-[10px] font-bold transition shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 border-t border-stone-800 bg-stone-950 flex gap-2 items-center shrink-0">
            <input
              type="text"
              placeholder="Ask about any item in menu..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processQuery(userInput)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-stone-900 border border-stone-800 text-white placeholder:text-stone-500 rounded-xl outline-none focus:border-amber-400 transition"
            />
            <button
              onClick={() => processQuery(userInput)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 p-2.5 rounded-xl transition font-black cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}