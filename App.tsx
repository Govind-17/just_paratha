
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { SpiceParticles } from './components/SpiceParticles';
import { WarliBackground } from './components/WarliBackground';
import { MenuNavigation } from './components/MenuNavigation';
import { MenuItemCard } from './components/MenuItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { MENU_DATA } from './constants';
import { CategoryId, MenuItem, CartItem, MenuCategoryData } from './types';
import { RefreshCw, ShoppingBag, ChevronRight, Moon, Sun, Wand2, Smartphone, ShieldCheck, X } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryId>(CategoryId.PARATHAS);
  const [showContent, setShowContent] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [customSpecials, setCustomSpecials] = useState<MenuItem[]>([]);
  
  // Theme State
  const [isNight, setIsNight] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Shuffle / Shake State
  const [isShuffling, setIsShuffling] = useState(false);
  const [shufflingItem, setShufflingItem] = useState<MenuItem | null>(null);
  const [isChefSpecial, setIsChefSpecial] = useState(false);

  const logoPressTimer = useRef<number | null>(null);

  // Load custom specials from local storage
  useEffect(() => {
    const saved = localStorage.getItem('jp_specials');
    if (saved) {
      setCustomSpecials(JSON.parse(saved));
    }
  }, []);

  // Save custom specials to local storage
  useEffect(() => {
    localStorage.setItem('jp_specials', JSON.stringify(customSpecials));
  }, [customSpecials]);

  // Derived Menu Data (Include custom specials)
  const fullMenuData = useMemo(() => {
    const data = [...MENU_DATA];
    if (customSpecials.length > 0) {
      const specialsCategory: MenuCategoryData = {
        id: CategoryId.SPECIALS,
        label: "Today's Special",
        items: customSpecials
      };
      return [specialsCategory, ...data];
    }
    return data;
  }, [customSpecials]);

  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotalPrice = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleSplashComplete = () => {
    setLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) setIsNight(true);
  }, []);

  // Owner Secret Trigger: Long press "Just Paratha" title for 3 seconds
  const handleLogoPressStart = () => {
    logoPressTimer.current = window.setTimeout(() => {
      setShowPinModal(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 3000); 
  };

  const handleLogoPressEnd = () => {
    if (logoPressTimer.current) {
      clearTimeout(logoPressTimer.current);
      logoPressTimer.current = null;
    }
  };

  const handlePinSubmit = (digit: string) => {
    const newPin = pin + digit;
    if (newPin.length <= 6) {
      setPin(newPin);
      if (newPin.length === 6) {
        if (newPin === '812356') { // Secret PIN requested by owner
          setIsAdminMode(true);
          setShowPinModal(false);
          setPin('');
        } else {
          setPin('');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(300);
          }
        }
      }
    }
  };

  const handleAddSpecial = (newItem: Omit<MenuItem, 'id'>) => {
    const item: MenuItem = {
      ...newItem,
      id: `custom-${Date.now()}`
    };
    setCustomSpecials(prev => [item, ...prev]);
    setActiveCategory(CategoryId.SPECIALS);
  };

  const handleUpdateSpecial = (id: string, updatedItem: Omit<MenuItem, 'id'>) => {
    setCustomSpecials(prev => prev.map(item => 
      item.id === id ? { ...updatedItem, id } : item
    ));
  };

  const handleDeleteSpecial = (id: string) => {
    setCustomSpecials(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
            return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
        return prev.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: item.quantity + delta };
            }
            return item;
        }).filter(item => item.quantity > 0);
    });
  };

  const mainBg = isNight ? 'bg-[#1a103c] text-indigo-50' : 'bg-orange-50 text-gray-800';
  const headerText = isNight ? 'text-amber-400' : 'text-orange-900';
  const subHeaderText = isNight ? 'text-indigo-300' : 'text-orange-700';

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-1000 ${mainBg}`}>
      <AnimatePresence>
        {loading && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal 
            item={selectedItem} 
            onClose={() => { setSelectedItem(null); setIsChefSpecial(false); }} 
            onAddToOrder={addToCart}
            isNight={isNight}
            isChefSpecial={isChefSpecial}
          />
        )}
      </AnimatePresence>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isAdminMode && (
          <AdminPanel 
            specials={customSpecials}
            onAdd={handleAddSpecial}
            onUpdate={handleUpdateSpecial}
            onDelete={handleDeleteSpecial}
            onClose={() => setIsAdminMode(false)}
            isNight={isNight}
          />
        )}
      </AnimatePresence>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div 
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-8 text-center">
              <ShieldCheck size={48} className="text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-white">Owner Access</h2>
              <p className="text-white/60 text-sm mt-2">Enter 6-digit PIN to continue</p>
            </div>

            <div className="flex gap-4 mb-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-orange-500 ${pin.length > i ? 'bg-orange-500' : ''}`} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
              {['1','2','3','4','5','6','7','8','9','C','0','X'].map(key => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') setPin('');
                    else if (key === 'X') setShowPinModal(false);
                    else handlePinSubmit(key);
                  }}
                  className="w-16 h-16 rounded-full bg-white/10 text-white text-2xl font-bold flex items-center justify-center active:bg-orange-500 transition-colors"
                >
                  {key === 'X' ? <X size={20} /> : key}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Shuffling Overlay */}
      <AnimatePresence>
         {isShuffling && shufflingItem && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="relative">
                    <motion.div className="absolute inset-0 -m-4 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-yellow-500 border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    <motion.img key={shufflingItem.id} src={shufflingItem.image} initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.1 }} className="w-48 h-48 rounded-full object-cover shadow-2xl relative z-10 bg-white" />
                </div>
                <motion.h3 className="mt-8 text-2xl font-display font-bold text-white tracking-wider" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.5, repeat: Infinity }}>CHEF IS DECIDING...</motion.h3>
            </motion.div>
         )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onUpdateQuantity={updateCartQuantity} isNight={isNight} />
      
      {!loading && (
        <motion.div className="min-h-screen relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <WarliBackground isNight={isNight} />
            <SpiceParticles isNight={isNight} />

            <header className="relative z-30 pt-6 pb-2 px-4 flex justify-between items-center">
                <div 
                  onPointerDown={handleLogoPressStart}
                  onPointerUp={handleLogoPressEnd}
                  onPointerLeave={handleLogoPressEnd}
                  className="cursor-pointer select-none"
                >
                    <h1 className={`text-2xl font-display font-bold transition-colors duration-500 ${headerText}`}>Just Paratha</h1>
                    <p className={`text-xs tracking-wider transition-colors duration-500 ${subHeaderText}`}>AUTHENTIC MAHARASHTRIAN TASTE</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsNight(!isNight)} className={`p-2 rounded-full transition-colors ${isNight ? 'text-amber-400 bg-indigo-900' : 'text-orange-600 bg-orange-100'}`}>
                        {isNight ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button onClick={() => window.location.reload()} className={`p-2 ${isNight ? 'text-indigo-300' : 'text-orange-600'}`}>
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

            <MenuNavigation categories={fullMenuData} selectedCategory={activeCategory} onSelect={setActiveCategory} isNight={isNight} />

            <main className="relative z-20 p-4 pb-32 min-h-[80vh]">
                <AnimatePresence mode='wait'>
                    <motion.div key={activeCategory} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                        <div className="flex items-center gap-2 mb-6 opacity-80">
                            <div className={`h-px flex-1 transition-colors ${isNight ? 'bg-indigo-700' : 'bg-orange-300'}`} />
                            <h2 className={`text-center font-display text-xl uppercase tracking-widest transition-colors ${isNight ? 'text-amber-400' : 'text-orange-800'}`}>
                                {fullMenuData.find(c => c.id === activeCategory)?.label}
                            </h2>
                            <div className={`h-px flex-1 transition-colors ${isNight ? 'bg-indigo-700' : 'bg-orange-300'}`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {fullMenuData.find(c => c.id === activeCategory)?.items.map((item, idx) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    categoryId={activeCategory} 
                                    index={idx} 
                                    onLongPress={setSelectedItem}
                                    isNight={isNight}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
            
            <AnimatePresence>
                {cart.length > 0 && !selectedItem && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-4 right-4 z-40">
                        <button onClick={() => setIsCartOpen(true)} className={`w-full rounded-2xl p-4 shadow-xl flex items-center justify-between backdrop-blur-md border ${isNight ? 'bg-indigo-900/90 text-white border-indigo-700' : 'bg-orange-900 text-white border-orange-800'}`}>
                            <div className="flex flex-col items-start">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isNight ? 'text-indigo-300' : 'text-orange-300'}`}>{cartTotalItems} ITEMS</span>
                                <span className="text-xl font-bold">₹{cartTotalPrice}</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl">
                                <span>View Cart</span> <ChevronRight size={18} />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={`fixed bottom-0 left-0 w-full h-12 pointer-events-none z-30 bg-gradient-to-t ${isNight ? 'from-[#1a103c] to-transparent' : 'from-orange-50 to-transparent'}`} />
        </motion.div>
      )}
    </div>
  );
}
