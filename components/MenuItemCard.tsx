import React, { useState, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { MenuItem, CategoryId } from '../types';
import { Heart, Info, ChefHat } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  categoryId: CategoryId;
  index: number;
  onLongPress: (item: MenuItem) => void;
  isNight: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, categoryId, index, onLongPress, isNight }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on user interaction (first click usually)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    // Resume if suspended
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSizzleSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Create White Noise
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound like a sizzle (Highpass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    
    // Envelope for fade out
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime); // Low volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  };
  
  // Long Press Logic
  const timerRef = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      onLongPress(item);
    }, 500); // 500ms for long press
  };

  const clearPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = () => {
    if (!isLongPress.current) {
      setIsFlipped(!isFlipped);
      // Play sound only when flipping to ingredients view
      if (!isFlipped) {
        playSizzleSound();
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    // Optional tactile feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
    }
  };

  // Variant for scroll entrance
  const cardVariants: Variants = {
    hidden: { opacity: 0, x: 100 }, // Start 100px to the right
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        // Use modulo to cap delay so items deep in list don't wait too long when scrolling
        delay: (i % 3) * 0.1, 
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    })
  };

  // Dynamic Styles
  const cardBgClass = isNight ? 'bg-[#2d1b69] border-indigo-800' : 'bg-white border-orange-100';
  const gradientClass = isNight ? 'from-[#2d1b69] to-[#1e1245]' : 'from-white to-orange-50/50';
  const titleColor = isNight ? 'text-white' : 'text-gray-800';
  const descColor = isNight ? 'text-indigo-200' : 'text-gray-500';
  const priceColor = isNight ? '#fbbf24' : '#ea580c';
  const secondaryPriceColor = isNight ? '#ffffff' : '#1f2937';

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -50px 0px" }} // Trigger slightly before it's fully on screen
      className="relative w-full h-48 perspective-1000 mb-6 select-none touch-manipulation"
      onPointerDown={startPressTimer}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div className={`absolute inset-0 backface-hidden rounded-2xl shadow-lg overflow-hidden flex flex-row border transition-colors duration-500 ${cardBgClass}`}>
            {/* Image Section */}
            <div className="w-1/3 h-full relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.isVeg && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-1.5 py-1 shadow-sm">
                        <div className="w-3 h-3 border border-green-600 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        </div>
                    </div>
                )}
                {/* Popular Badge */}
                {item.isPopular && (
                    <div className="absolute bottom-0 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold text-center py-1 shadow-md">
                        BESTSELLER
                    </div>
                )}
            </div>
            
            {/* Content Section */}
            <div className={`w-2/3 p-4 flex flex-col justify-between bg-gradient-to-br transition-colors duration-500 ${gradientClass}`}>
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className={`font-display text-lg font-bold leading-tight ${titleColor}`}>{item.name}</h3>
                        <motion.button 
                            onClick={handleFavorite}
                            whileTap={{ scale: 0.8 }}
                            className="z-10 p-1.5 -mr-1.5 -mt-1.5 rounded-full"
                        >
                            <motion.div
                                initial={false}
                                animate={isFavorite ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Heart 
                                    size={20} 
                                    className={`transition-colors duration-300 ${isFavorite ? "text-red-500" : (isNight ? "text-indigo-400 hover:text-red-500" : "text-gray-400 hover:text-red-500")}`}
                                    fill={isFavorite ? "currentColor" : "none"} 
                                />
                            </motion.div>
                        </motion.button>
                    </div>
                    {item.hindiName && <p className={`text-sm font-hindi mb-1 font-medium ${isNight ? 'text-amber-400' : 'text-orange-600'}`}>{item.hindiName}</p>}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${descColor}`}>{item.description}</p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                    <motion.div 
                        key={`price-${isFlipped ? 'back' : 'front'}`}
                        className="text-xl font-bold origin-left"
                        initial={{ y: -15, opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                        animate={{ 
                            y: 0, 
                            opacity: 1, 
                            scale: 1,
                            filter: "blur(0px)",
                            color: [priceColor, secondaryPriceColor],
                            textShadow: ["0 0 0px rgba(234,88,12,0)", `0 0 10px ${priceColor}4D`, "0 0 0px rgba(234,88,12,0)"]
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 15, 
                            delay: 0.1 
                        }}
                    >
                        ₹{item.price}
                    </motion.div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isNight ? 'bg-indigo-800 text-amber-400' : 'bg-orange-100 text-orange-500'}`}>
                        <Info size={12} />
                        <span>Tap to View</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Back Face (Ingredients) */}
        <div 
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-orange-900 via-orange-950 to-black text-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
            style={{ transform: 'rotateY(180deg)' }}
        >
             {/* Decorative Background - Subtle Pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fb923c 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
             
             {/* Warli Animated Motifs - Very Low opacity for background texture */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
                <motion.svg 
                  className="absolute -right-6 -top-6 w-32 h-32 text-white"
                  viewBox="0 0 100 100" fill="currentColor"
                  animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                   <circle cx="50" cy="20" r="5" />
                   <path d="M50 25 L35 45 L65 45 Z" />
                   <path d="M50 45 L35 65 L65 65 Z" />
                </motion.svg>
             </div>
             
             <div className="relative h-full p-4 flex flex-col items-center justify-center text-center z-10">
                 <div className="flex items-center gap-2 mb-4 text-orange-200">
                    <ChefHat size={18} />
                    <span className="text-xs font-bold tracking-widest uppercase border-b border-orange-700 pb-0.5">Inside The Paratha</span>
                 </div>
                 
                 {item.ingredients ? (
                     <div className="flex flex-wrap justify-center gap-2 content-center w-full px-2">
                         {item.ingredients.map((ing, i) => (
                             <motion.span 
                                key={i} 
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 10, scale: isFlipped ? 1 : 0.9 }}
                                transition={{ delay: 0.1 + (i * 0.05), type: "spring", stiffness: 300, damping: 20 }}
                                className="bg-orange-50/95 backdrop-blur-sm text-orange-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md border-b-2 border-orange-200"
                             >
                                 {ing}
                             </motion.span>
                         ))}
                     </div>
                 ) : (
                     <p className="text-center text-orange-200/80 italic px-4 text-sm">
                         Authentic spices and farm-fresh ingredients.
                     </p>
                 )}
                 
                 {/* Drink Animation Liquid Effect */}
                 {categoryId === CategoryId.DRINKS && (
                     <motion.div 
                        className="absolute bottom-0 left-0 w-full bg-blue-500/10"
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        style={{ filter: "blur(20px)" }}
                     />
                 )}
             </div>
        </div>
      </motion.div>
    </motion.div>
  );
};