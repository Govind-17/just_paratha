import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { SpiceParticles } from './components/SpiceParticles';
import { WarliBackground } from './components/WarliBackground';
import { MenuNavigation } from './components/MenuNavigation';
import { MenuItemCard } from './components/MenuItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { MENU_DATA } from './constants';
import { CategoryId, MenuItem, CartItem } from './types';
import { RefreshCw, ShoppingBag, ChevronRight, Moon, Sun, Wand2, Smartphone } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryId>(CategoryId.PARATHAS);
  const [showContent, setShowContent] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Theme State
  const [isNight, setIsNight] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showIdleHint, setShowIdleHint] = useState(false);

  // Shuffle / Shake State
  const [isShuffling, setIsShuffling] = useState(false);
  const [shufflingItem, setShufflingItem] = useState<MenuItem | null>(null);
  const [isChefSpecial, setIsChefSpecial] = useState(false);

  // Refs for logic that doesn't need re-renders
  const mountTimeRef = useRef(Date.now());

  // Derived Cart Data
  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotalPrice = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  // Handle Splash Screen Completion
  const handleSplashComplete = () => {
    setLoading(false);
    setTimeout(() => setShowContent(true), 100);
  };

  // Day/Night Logic
  useEffect(() => {
    const hour = new Date().getHours();
    // Night is between 7 PM (19) and 6 AM (6)
    if (hour >= 19 || hour < 6) {
        setIsNight(true);
    }
  }, []);

  // Idle Timer & Shake Detection
  useEffect(() => {
    let idleTimer: number;
    const resetIdle = () => {
        setShowIdleHint(false);
        clearTimeout(idleTimer);
        // Hint after 10 seconds of inactivity
        idleTimer = window.setTimeout(() => {
            if (!selectedItem && !isCartOpen && !isShuffling) {
               setShowIdleHint(true);
            }
        }, 10000); 
    };

    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('click', resetIdle);
    window.addEventListener('scroll', resetIdle);
    resetIdle(); 

    // Shake Detection Variables
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastTime = 0;
    
    // Thresholds - INCREASED to prevent accidental triggers
    const ACC_THRESHOLD = 25; // m/s² for acceleration (no gravity). 25 is roughly 2.5g.
    const GRAVITY_THRESHOLD = 800; // Speed unit for gravity-included fallback.

    const handleMotion = (e: DeviceMotionEvent) => {
        // 1. Safety Delay: Ignore all motion for first 2 seconds after mount to prevent load triggers
        if (Date.now() - mountTimeRef.current < 2000) return;

        // 2. PREFERRED METHOD: Acceleration (excluding gravity)
        // This is much more accurate for shakes and ignores tilting.
        const acc = e.acceleration;
        if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
             const x = acc.x;
             const y = acc.y;
             const z = acc.z;
             
             // Calculate vector magnitude
             const magnitude = Math.sqrt(x*x + y*y + z*z);
             
             if (magnitude > ACC_THRESHOLD) {
                 handleShakeTrigger();
                 resetIdle();
             }
             return;
        }

        // 3. FALLBACK METHOD: AccelerationIncludingGravity
        // Used if the device doesn't provide raw acceleration.
        // Requires high threshold to filter out rotation/tilting.
        const current = e.accelerationIncludingGravity;
        if (!current) return;
        
        const now = Date.now();
        if ((now - lastTime) > 100) {
            const diffTime = now - lastTime;
            lastTime = now;
            const x = current.x || 0;
            const y = current.y || 0;
            const z = current.z || 0;

            if (lastX === null || lastY === null || lastZ === null) {
                lastX = x;
                lastY = y;
                lastZ = z;
                return;
            }

            const deltaX = Math.abs(x - lastX);
            const deltaY = Math.abs(y - lastY);
            const deltaZ = Math.abs(z - lastZ);

            // Speed calculation compatible with shake.js logic
            const speed = (deltaX + deltaY + deltaZ) / diffTime * 10000;

            if (speed > GRAVITY_THRESHOLD) {
                handleShakeTrigger();
                resetIdle(); 
            }
            lastX = x;
            lastY = y;
            lastZ = z;
        }
    };
    
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
        window.removeEventListener('touchstart', resetIdle);
        window.removeEventListener('click', resetIdle);
        window.removeEventListener('scroll', resetIdle);
        if (window.DeviceMotionEvent) {
             window.removeEventListener('devicemotion', handleMotion);
        }
        clearTimeout(idleTimer);
    };
  }, [selectedItem, isCartOpen, isShuffling]); // Dependencies ensure fresh closure access

  const handleShakeTrigger = () => {
    // Prevent re-entry check using the ref to be absolutely sure or checking the DOM state
    // (Using state variable `isShuffling` via closure is standard)
    if (isShuffling || selectedItem || isCartOpen) return;
    
    // Start Shuffle
    setIsShuffling(true);
    setShowIdleHint(false);
    
    // Initial Haptic
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); 
    }

    const allItems = MENU_DATA.flatMap(c => c.items);
    let count = 0;
    const maxCount = 20; 
    
    const runShuffle = () => {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        setShufflingItem(randomItem);
        count++;

        if (count < maxCount) {
             setTimeout(runShuffle, 80);
        } else {
             finishShuffle(allItems);
        }
    };

    runShuffle();
  };

  const finishShuffle = (allItems: MenuItem[]) => {
      const winner = allItems[Math.floor(Math.random() * allItems.length)];
      setShufflingItem(winner);
      
      setTimeout(() => {
          setIsShuffling(false);
          setShufflingItem(null);
          setSelectedItem(winner);
          setIsChefSpecial(true);
          
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); 
          }
      }, 800);
  };

  const requestShakePermission = async () => {
    // iOS 13+ requires permission request
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
            const response = await (DeviceMotionEvent as any).requestPermission();
            if (response === 'granted') {
                handleShakeTrigger();
            } else {
                alert("Permission denied. Shake feature requires motion access.");
            }
        } catch (e) {
            console.error(e);
            handleShakeTrigger();
        }
    } else {
        handleShakeTrigger();
    }
  };

  // Pull to refresh simulation
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLongPress = (item: MenuItem) => {
    setIsChefSpecial(false);
    setSelectedItem(item);
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setIsChefSpecial(false);
  };

  // Cart Logic
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

  // Theme based classes
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
            onClose={closeDetail} 
            onAddToOrder={addToCart}
            isNight={isNight}
            isChefSpecial={isChefSpecial}
          />
        )}
      </AnimatePresence>
      
      {/* Shuffling Overlay */}
      <AnimatePresence>
         {isShuffling && shufflingItem && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="relative">
                    {/* Spinning effect rings */}
                    <motion.div 
                        className="absolute inset-0 -m-4 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-yellow-500 border-l-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                     <motion.div 
                        className="absolute inset-0 -m-8 rounded-full border-2 border-t-transparent border-r-white/50 border-b-transparent border-l-white/50"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.img
                        key={shufflingItem.id} // Re-render on change
                        src={shufflingItem.image}
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="w-48 h-48 rounded-full object-cover shadow-2xl relative z-10 bg-white"
                    />
                </div>
                
                <motion.h3 
                    className="mt-8 text-2xl font-display font-bold text-white tracking-wider"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    CHEF IS DECIDING...
                </motion.h3>
                <p className="text-white/70 text-sm mt-2 font-mono">Exploring {MENU_DATA.flatMap(c => c.items).length} dishes</p>
            </motion.div>
         )}
      </AnimatePresence>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateCartQuantity}
        isNight={isNight}
      />
      
      {/* Idle Shake Hint Toast */}
      <AnimatePresence>
        {showIdleHint && !selectedItem && !isShuffling && (
            <motion.button 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-md border border-white/10"
                onClick={requestShakePermission}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="bg-yellow-500 rounded-full p-1 text-black"
                >
                    <Smartphone size={16} fill="currentColor" />
                </motion.div>
                <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Can't decide?</span>
                    <span className="text-xs text-gray-300">Tap me or shake phone!</span>
                </div>
                <Wand2 size={16} className="text-yellow-400 ml-1" />
            </motion.button>
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div
            className="min-h-screen relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <WarliBackground isNight={isNight} />
            <SpiceParticles isNight={isNight} />

            {/* Header / Brand Area */}
            <header className="relative z-30 pt-6 pb-2 px-4 flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-display font-bold transition-colors duration-500 ${headerText}`}>Just Paratha</h1>
                    <p className={`text-xs tracking-wider transition-colors duration-500 ${subHeaderText}`}>AUTHENTIC MAHARASHTRIAN TASTE</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsNight(!isNight)} 
                        className={`p-2 rounded-full transition-colors ${isNight ? 'text-amber-400 bg-indigo-900' : 'text-orange-600 bg-orange-100'}`}
                    >
                        {isNight ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button onClick={handleRefresh} className={`${refreshing ? 'animate-spin' : ''} p-2 ${isNight ? 'text-indigo-300' : 'text-orange-600'}`}>
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <MenuNavigation 
                categories={MENU_DATA} 
                selectedCategory={activeCategory} 
                onSelect={setActiveCategory} 
                isNight={isNight}
            />

            {/* Main Content Area */}
            <main className="relative z-20 p-4 pb-32 min-h-[80vh]">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Category Title with Decoration */}
                        <div className="flex items-center gap-2 mb-6 opacity-80">
                            <div className={`h-px flex-1 transition-colors ${isNight ? 'bg-indigo-700' : 'bg-orange-300'}`} />
                            <h2 className={`text-center font-display text-xl uppercase tracking-widest transition-colors ${isNight ? 'text-amber-400' : 'text-orange-800'}`}>
                                {MENU_DATA.find(c => c.id === activeCategory)?.label}
                            </h2>
                            <div className={`h-px flex-1 transition-colors ${isNight ? 'bg-indigo-700' : 'bg-orange-300'}`} />
                        </div>

                        {/* Items List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MENU_DATA.find(c => c.id === activeCategory)?.items.map((item, idx) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    categoryId={activeCategory} 
                                    index={idx} 
                                    onLongPress={handleLongPress}
                                    isNight={isNight}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {/* Floating Cart Bar */}
            <AnimatePresence>
                {cart.length > 0 && !selectedItem && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-4 right-4 z-40"
                    >
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className={`w-full rounded-2xl p-4 shadow-xl flex items-center justify-between backdrop-blur-md border ${isNight ? 'bg-indigo-900/90 text-white shadow-indigo-900/40 border-indigo-700' : 'bg-orange-900 text-white shadow-orange-900/30 border-orange-800'}`}
                        >
                            <div className="flex flex-col items-start">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isNight ? 'text-indigo-300' : 'text-orange-300'}`}>{cartTotalItems} ITEMS</span>
                                <span className="text-xl font-bold">₹{cartTotalPrice}</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl">
                                <span>View Cart</span>
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Bottom Gradient for smooth scroll end */}
            <div className={`fixed bottom-0 left-0 w-full h-12 pointer-events-none z-30 bg-gradient-to-t ${isNight ? 'from-[#1a103c] to-transparent' : 'from-orange-50 to-transparent'}`} />
        </motion.div>
      )}
    </div>
  );
}