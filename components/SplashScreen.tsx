import React from 'react';
import { motion } from 'framer-motion';
import { PHONE_NUMBER } from '../constants';
import { Phone } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-orange-50 text-orange-900 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 5.5, duration: 1 }} // Wait for sequence then fade out
      onAnimationComplete={onComplete}
    >
      {/* Rotating Paratha Graphic */}
      <motion.div
        className="w-48 h-48 rounded-full border-4 border-orange-800 bg-orange-200 relative overflow-hidden flex items-center justify-center shadow-xl"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 1.5, ease: "backOut" }}
      >
        {/* Paratha Layers/Texture */}
        <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-orange-700 opacity-50" />
        <div className="absolute w-32 h-32 rounded-full border-2 border-dotted border-orange-600 opacity-50" />
        <div className="absolute w-20 h-20 rounded-full bg-orange-300 opacity-30 blur-xl" />
        
        {/* Sizzling butter */}
        <motion.div 
            className="absolute bg-yellow-300 w-8 h-8 rounded-full blur-md"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
        />
      </motion.div>

      {/* Text Reveals */}
      <div className="mt-8 text-center space-y-2 relative z-10">
        <motion.h1
          className="text-5xl font-display font-bold text-orange-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          जस्ट पराठा
        </motion.h1>

        <motion.h2
          className="text-3xl font-light tracking-widest text-orange-700"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
        >
          JUST PARATHAS
        </motion.h2>

        <motion.div
          className="flex items-center justify-center gap-2 mt-4 text-lg font-semibold text-orange-800 bg-orange-100/50 py-2 px-4 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <Phone size={20} className="animate-pulse" />
          <motion.span
             animate={{ textShadow: ["0px 0px 0px #F97316", "0px 0px 10px #F97316", "0px 0px 0px #F97316"] }}
             transition={{ delay: 3.5, repeat: Infinity, duration: 1.5 }}
          >
            {PHONE_NUMBER}
          </motion.span>
        </motion.div>
      </div>

      {/* Decorative Particles for the splash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
             <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-600 rounded-full"
                style={{
                    top: '50%',
                    left: '50%',
                }}
                animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 800,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                }}
                transition={{
                    delay: 2,
                    duration: 2,
                    ease: "easeOut"
                }}
             />
        ))}
      </motion.div>
    </motion.div>
  );
};
