import React from 'react';
import { motion } from 'framer-motion';

interface WarliBackgroundProps {
  isNight: boolean;
}

export const WarliBackground: React.FC<WarliBackgroundProps> = ({ isNight }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000 ${isNight ? 'opacity-20' : 'opacity-10'}`}>
      {/* Repeating pattern of Warli figures */}
      <div className="absolute w-full h-full flex flex-wrap justify-center items-center gap-12 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 1 }}
            className="w-32 h-32"
          >
             {/* Simple SVG Stick Figure simulation */}
             <svg viewBox="0 0 100 100" className={`w-full h-full stroke-2 transition-colors duration-1000 ${isNight ? 'stroke-indigo-200' : 'stroke-orange-900'} fill-transparent`}>
                <circle cx="50" cy="20" r="10" />
                <line x1="50" y1="30" x2="50" y2="60" />
                <line x1="50" y1="40" x2="20" y2="20" />
                <line x1="50" y1="40" x2="80" y2="20" />
                <line x1="50" y1="60" x2="30" y2="90" />
                <line x1="50" y1="60" x2="70" y2="90" />
                {/* Triangle body for some */}
                {i % 2 === 0 && <path d="M50 30 L30 60 L70 60 Z" className={`stroke-none opacity-50 transition-colors duration-1000 ${isNight ? 'fill-indigo-300' : 'fill-orange-900'}`} />}
             </svg>
          </motion.div>
        ))}
      </div>

      {/* Night Mode Diyas (Lanterns) */}
      {isNight && (
        <div className="absolute bottom-0 w-full flex justify-around items-end pb-4 opacity-80">
            {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                    key={`diya-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 1 }}
                    className="relative w-12 h-12"
                >
                    {/* Diya Base */}
                    <div className="absolute bottom-0 w-12 h-6 bg-amber-700 rounded-b-full border-t-2 border-amber-600" />
                    {/* Flame */}
                    <motion.div 
                        className="absolute bottom-5 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full rounded-t-[50%] blur-[1px]"
                        animate={{ 
                            scale: [1, 1.1, 0.9, 1.05, 1],
                            opacity: [0.8, 1, 0.8, 0.9, 0.8]
                        }}
                        transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                    />
                    {/* Glow */}
                    <motion.div 
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-400 rounded-full blur-xl opacity-30"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};