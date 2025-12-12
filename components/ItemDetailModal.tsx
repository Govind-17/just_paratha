import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../types';
import { X, Clock, Flame, Check, ShoppingBag, Sparkles } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToOrder: (item: MenuItem) => void;
  isNight?: boolean;
  isChefSpecial?: boolean;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ 
  item, 
  onClose, 
  onAddToOrder, 
  isNight = false,
  isChefSpecial = false
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToOrder = () => {
    if (isAdded) return; // Prevent spamming while animation plays
    
    setIsAdded(true);
    onAddToOrder(item);
    
    // Distinct Haptic feedback for mobile - Stronger single pulse for confirmation
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Reset state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
      onClose(); // Optional: Close modal after adding to show the cart bar update
    }, 1500);
  };

  const modalBg = isNight ? 'bg-[#2d1b69] text-white' : 'bg-white text-gray-900';
  const textColor = isNight ? 'text-indigo-100' : 'text-gray-600';
  const headingColor = isNight ? 'text-white' : 'text-gray-800';
  const priceColor = isNight ? 'text-amber-400' : 'text-orange-600';
  const ingredientBg = isNight ? 'bg-indigo-800 text-indigo-100 border-indigo-700' : 'bg-orange-50 text-orange-800 border-orange-100';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors backdrop-blur-md"
        >
            <X size={20} />
        </button>
        
        {/* Chef's Special Badge */}
        {isChefSpecial && (
            <motion.div 
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-1 px-4 text-center font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
            >
                <Sparkles size={12} className="text-yellow-100 animate-pulse" />
                Chef's Recommendation
                <Sparkles size={12} className="text-yellow-100 animate-pulse" />
            </motion.div>
        )}

        {/* Hero Image */}
        <div className="relative h-64 shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-3xl font-display font-bold">{item.name}</h2>
                {item.hindiName && <p className="text-lg opacity-90 font-hindi">{item.hindiName}</p>}
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <span className={`text-3xl font-bold ${priceColor}`}>₹{item.price}</span>
                <div className="flex gap-2">
                    {item.isSpicy && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            <Flame size={12} /> SPICY
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock size={12} /> 15 MIN
                    </span>
                </div>
            </div>

            <p className={`${textColor} leading-relaxed mb-6`}>
                {item.description}
            </p>

            {item.ingredients && (
                <div className="mb-6">
                    <h3 className={`font-bold ${headingColor} mb-3 uppercase text-sm tracking-wider`}>Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                        {item.ingredients.map((ing, i) => (
                            <motion.span 
                                key={i} 
                                className={`px-3 py-1.5 rounded-lg text-sm border ${ingredientBg}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 + 0.2 }}
                            >
                                {ing}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}

            <motion.button
                onClick={handleAddToOrder}
                layout
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 relative overflow-hidden`}
                animate={{ 
                    backgroundColor: isAdded ? "#16a34a" : (isNight ? "#f59e0b" : "#ea580c"),
                    scale: isAdded ? [1, 1.05, 1] : 1,
                    boxShadow: isAdded ? "0 10px 15px -3px rgba(22, 163, 74, 0.5)" : (isNight ? "0 10px 15px -3px rgba(245, 158, 11, 0.4)" : "0 10px 15px -3px rgba(234, 88, 12, 0.4)")
                }}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
            >
                 <AnimatePresence mode="wait" initial={false}>
                    {isAdded ? (
                        <motion.div
                            key="added"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="flex items-center gap-2"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                                <Check size={24} strokeWidth={3} />
                            </motion.div>
                            <span>Added!</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="add"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="flex items-center gap-2"
                        >
                            <ShoppingBag size={20} />
                            <span>Add to Order</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};