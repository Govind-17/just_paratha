import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import { X, Plus, Minus, ShoppingBag, BellRing, CheckCircle2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  isNight?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity,
  isNight = false
}) => {
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Reset order state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setIsOrderPlaced(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const playNotificationSound = () => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;

    try {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Create a clear "Ding" sound (Service Bell)
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now); // High pitch C6 approx
        
        // Attack and Decay envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.05); // Fast attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5); // Long ringing decay

        osc.start(now);
        osc.stop(now + 2.5);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
  };

  const handlePlaceOrder = () => {
    playNotificationSound();
    setIsOrderPlaced(true);
    
    // Tactile feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); 
    }
  };
  
  const drawerBg = isNight ? 'bg-[#1a103c]' : 'bg-white';
  const headerBg = isNight ? 'bg-[#2d1b69]/50' : 'bg-orange-50/50';
  const textColor = isNight ? 'text-indigo-100' : 'text-gray-800';
  const itemBg = isNight ? 'bg-[#2d1b69] border-indigo-800' : 'bg-white border-gray-100';
  const quantityBg = isNight ? 'bg-indigo-900 border-indigo-700' : 'bg-gray-50 border-gray-200';
  const footerBg = isNight ? 'bg-[#2d1b69]' : 'bg-gray-50';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] ${drawerBg}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center rounded-t-3xl ${headerBg} ${isNight ? 'border-indigo-900' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <ShoppingBag className={isNight ? "text-amber-400" : "text-orange-600"} />
                <h2 className={`text-xl font-display font-bold ${textColor}`}>Your Order</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isNight ? 'bg-indigo-800 text-amber-400' : 'bg-orange-100 text-orange-700'}`}>
                  {cartItems.length} Items
                </span>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isNight ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="overflow-y-auto p-4 flex-1">
              {cartItems.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-48 ${isNight ? 'text-indigo-400' : 'text-gray-400'}`}>
                    <ShoppingBag size={48} className="mb-2 opacity-20" />
                    <p>Your cart is empty</p>
                    <button onClick={onClose} className={`mt-4 font-bold text-sm ${isNight ? 'text-amber-400' : 'text-orange-600'}`}>Browse Menu</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div 
                        key={item.id} 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className={`flex gap-4 items-center border p-3 rounded-xl shadow-sm ${itemBg}`}
                    >
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      
                      <div className="flex-1">
                        <h3 className={`font-bold text-sm ${textColor}`}>{item.name}</h3>
                        <p className={`font-bold text-sm ${isNight ? 'text-amber-400' : 'text-orange-600'}`}>₹{item.price * item.quantity}</p>
                      </div>

                      <div className={`flex items-center gap-3 rounded-lg p-1 border ${quantityBg}`}>
                        {isOrderPlaced ? (
                            <span className="text-sm font-bold w-8 text-center text-gray-500">{item.quantity}</span>
                        ) : (
                            <>
                                <button 
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className={`p-1 rounded-md transition-colors ${isNight ? 'hover:bg-indigo-800 text-indigo-300' : 'hover:bg-white text-gray-600'}`}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className={`text-sm font-bold w-4 text-center ${textColor}`}>{item.quantity}</span>
                                <button 
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className={`p-1 rounded-md transition-colors ${isNight ? 'hover:bg-indigo-800 text-green-400' : 'hover:bg-white text-green-600'}`}
                                >
                                    <Plus size={16} />
                                </button>
                            </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
                <div className={`p-4 border-t pb-8 ${footerBg} ${isNight ? 'border-indigo-900' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <span className={isNight ? 'text-indigo-300' : 'text-gray-600'}>Total Amount</span>
                        <span className={`text-2xl font-bold ${isNight ? 'text-white' : 'text-gray-900'}`}>₹{totalAmount}</span>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {isOrderPlaced ? (
                            <motion.div
                                key="placed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 border ${isNight ? 'bg-green-900 text-green-200 border-green-800' : 'bg-green-100 text-green-800 border-green-200'}`}
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle2 size={24} />
                                </motion.div>
                                <span>Waiter Notified!</span>
                            </motion.div>
                        ) : (
                            <motion.button 
                                key="place-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handlePlaceOrder}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-white ${isNight ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/40' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}
                            >
                                <BellRing size={20} />
                                <span>Place Order</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    
                    <p className="text-center text-xs text-gray-400 mt-3 h-4">
                        {!isOrderPlaced && "Click to ring the bell and notify the waiter."}
                    </p>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};